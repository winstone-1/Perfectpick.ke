import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { handleIdempotencyCheck, saveIdempotencyResponse } from '../middleware/idempotency.js';
import { isNonEmptyString, isValidObjectId } from '../middleware/validate.js';

// @desc    Create new order
// @route   POST /api/orders
export const addOrderItems = async (req, res, next) => {
    // Idempotency: check before any side effects (prevents double-click duplicate orders)
    const idemCheck = await handleIdempotencyCheck(req, res, 'POST /api/orders');
    if (idemCheck.isDuplicate) {
        return res.status(idemCheck.responseStatus).json(idemCheck.responseBody);
    }
    const idempotencyKey = idemCheck.key;

    try {
        const { shippingAddress } = req.body;

        // SECURITY: shippingAddress is persisted to MongoDB — validate shape so a
        // crafted object (operators, 10MB strings) can't be stored or trigger injection.
        if (
            !shippingAddress || typeof shippingAddress !== 'object' || Array.isArray(shippingAddress) ||
            !isNonEmptyString(shippingAddress.fullName, 120) ||
            !isNonEmptyString(shippingAddress.phone, 32) ||
            !isNonEmptyString(shippingAddress.address, 500) ||
            !isNonEmptyString(shippingAddress.city, 120)
        ) {
            return res.status(400).json({ success: false, message: 'Valid shipping address is required' });
        }

        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        // Remove stale items where product no longer exists (deleted from DB)
        const staleCount = cart.items.filter(item => !item.product).length;
        if (staleCount > 0) {
            console.warn(`[WARN] Removing ${staleCount} stale cart item(s) with missing product references`);
            cart.items = cart.items.filter(item => item.product);
            await cart.save();
        }

        let totalPrice = 0;
        const orderItems = [];

        for (const item of cart.items) {
            if (!item.product) {
                console.warn(`[WARN] Skipping cart item with missing product info`);
                continue;
            }

            const product = await Product.findById(item.product._id);
            if (!product) {
                console.warn(`[WARN] Product ${item.product._id} not found in DB`);
                continue;
            }

            const variantObj = product.variants?.find(v => v.name === item.variant);

            if (!variantObj || variantObj.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name} (${item.variant})`
                });
            }

            // Stock is NOT decremented here (Option A: decrement on payment confirmation only).
            // This is an informational availability check only.

            orderItems.push({
                product: item.product._id,
                variant: item.variant,
                quantity: item.quantity,
                price: item.product.price,
            });

            totalPrice += item.product.price * item.quantity;
        }

        if (orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid products found in cart' });
        }

        const order = new Order({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            totalPrice,
        });

        const createdOrder = await order.save();

        // ✅ Cart is NOT cleared here — only cleared after payment is confirmed
        // This allows retries if STK push fails without losing the cart

        const responseBody = { success: true, order: createdOrder };
        const responseStatus = 201;
        // Persist idempotency response (24h TTL) so retry with same key returns same order
        await saveIdempotencyResponse(idempotencyKey, req.user._id, 'POST /api/orders', responseStatus, responseBody);
        res.status(responseStatus).json(responseBody);
    } catch (error) {
        next(error);
    }
};

// @desc    Helper — clear cart after confirmed payment
// Called from paymentController after charge.success webhook or verify
export const clearUserCart = async (userId) => {
    try {
        const cart = await Cart.findOne({ user: userId });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
    } catch (error) {
        console.error('[ERROR] Failed to clear cart after payment:', error);
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
export const getOrderById = async (req, res, next) => {
    try {
        // SECURITY: invalid ObjectIds previously hit CastError → 500 stack leak; return 400.
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid order id' });
        }
        const order = await Order.findById(req.params.id).populate('items.product');

        if (order) {
            if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin && req.user.role !== 'manager') {
                return res.status(401).json({ success: false, message: 'Not authorized' });
            }
            res.json({ success: true, data: order });
        } else {
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (error) {
        next(error);
    }
};