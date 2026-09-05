import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get logged in user cart
// @route   GET /api/cart
export const getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        // Remove stale items where product no longer exists (deleted from DB)
        const staleItems = cart.items.filter(item => !item.product);
        if (staleItems.length > 0) {
            cart.items = cart.items.filter(item => item.product);
            await cart.save();
        }

        res.json({ success: true, data: cart });
    } catch (error) {
        next(error);
    }
};

// @desc    Add item to cart
// @route   POST /api/cart
export const addToCart = async (req, res, next) => {
    try {
        const { productId, variant, quantity } = req.body;
        
        // Input validation
        if (!productId || !variant || quantity === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields: productId, variant, or quantity' });
        }

        const qty = Number(quantity);
        if (isNaN(qty) || qty < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: `Product not found with ID: ${productId}` });
        }

        // Check for variants if the product has them
        const variantObj = product.variants && product.variants.length > 0
            ? product.variants.find(v => v.name === variant)
            : null;

        if (product.variants && product.variants.length > 0 && !variantObj) {
            return res.status(400).json({ 
                success: false, 
                message: `Variant '${variant}' not found for product '${product.name}'`,
                availableVariants: product.variants.map(v => v.name)
            });
        }

        if (variantObj && variantObj.stock < qty) {
            return res.status(400).json({ success: false, message: `Insufficient stock for variant '${variant}'` });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId && item.variant === variant
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += qty;
            // Re-validate total quantity against stock
            if (variantObj && variantObj.stock < cart.items[existingItemIndex].quantity) {
                return res.status(400).json({ success: false, message: `Insufficient total stock for variant '${variant}'` });
            }
        } else {
            cart.items.push({ product: productId, variant, quantity: qty });
        }

        await cart.save();
        
        // Re-fetch and populate for consistent frontend data
        const updatedCart = await Cart.findById(cart._id).populate('items.product');
        
        res.json({ success: true, data: updatedCart });
    } catch (error) {
        next(error);
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
export const updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        
        const qty = Number(quantity);
        if (isNaN(qty) || qty < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const item = cart.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }

        const product = await Product.findById(item.product);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Check for variants if the product has them
        const variantObj = product.variants && product.variants.length > 0
            ? product.variants.find(v => v.name === item.variant)
            : null;

        if (variantObj && variantObj.stock < qty) {
            return res.status(400).json({ success: false, message: `Insufficient stock for variant '${item.variant}'` });
        }

        item.quantity = qty;
        await cart.save();
        
        const updatedCart = await Cart.findById(cart._id).populate('items.product');
        res.json({ success: true, data: updatedCart });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
export const removeFromCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
        await cart.save();
        
        const updatedCart = await Cart.findById(cart._id).populate('items.product');
        res.json({ success: true, data: updatedCart });
    } catch (error) {
        next(error);
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
export const clearCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ success: true, message: 'Cart cleared' });
    } catch (error) {
        next(error);
    }
};
