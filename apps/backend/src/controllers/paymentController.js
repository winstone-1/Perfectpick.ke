import axios from 'axios';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { clearUserCart } from './orderController.js';

// Helper to normalize Kenyan phone numbers for Paystack mobile money
// Paystack expects 254XXXXXXXXX format (no '+' prefix)
const normalizePhoneNumber = (phone) => {
    let cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.startsWith('254')) {
        return cleanPhone;
    }
    if (cleanPhone.startsWith('0')) {
        return '254' + cleanPhone.slice(1);
    }
    if (cleanPhone.length === 9) {
        return '254' + cleanPhone;
    }
    return cleanPhone;
};

// Helper: atomically decrement stock for an order at payment confirmation time.
// Uses findOneAndUpdate with $elemMatch requiring stock >= quantity, then $inc -quantity.
// If any variant mismatches (insufficient stock / deleted product), rolls back prior decrements.
export const decrementStockForOrder = async (order) => {
  const decremented = [];
  for (const item of order.items) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, variants: { $elemMatch: { name: item.variant, stock: { $gte: item.quantity } } } },
      { $inc: { 'variants.$.stock': -item.quantity } },
      { returnDocument: 'after' }
    );
    if (!updated) {
      // Roll back any prior successful decrements for this order (atomicity across multi-item orders)
      for (const prev of decremented) {
        await Product.findOneAndUpdate(
          { _id: prev.product, 'variants.name': prev.variant },
          { $inc: { 'variants.$.stock': prev.quantity } }
        );
      }
      return { success: false, failedItem: item };
    }
    decremented.push(item);
  }
  return { success: true };
};

// @desc    Initiate Paystack M-Pesa STK Push
// @route   POST /api/payments/mpesa
// @access  Private
export const initiateMpesaPayment = async (req, res) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ success: false, message: 'Paystack not configured — missing PAYSTACK_SECRET_KEY' });
    }
    const { amount, email, phone, orderId } = req.body;

    if (!amount || !email || !phone || !orderId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    const paystackData = {
      amount: Math.round(amount * 100), // Paystack expects kobo/cents
      email,
      currency: 'KES',
      mobile_money: {
        phone: normalizedPhone,
        provider: 'mpesa',
      },
    };

    const response = await axios.post(
      'https://api.paystack.co/charge',
      paystackData,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status) {
      // Save reference to order so we can verify later
      await Order.findByIdAndUpdate(orderId, {
        paymentResult: {
          id: response.data.data.reference,
          status: response.data.data.status,
        },
      });

      return res.json({
        success: true,
        reference: response.data.data.reference,
        status: response.data.data.status,
        message: response.data.data.display_text || 'STK Push initiated. Check your phone.',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: response.data.message || 'Payment initiation failed',
        fallback: true,
        tillNumber: process.env.MPESA_TILL_NUMBER || '3175088',
      });
    }
  } catch (error) {
    console.error('Paystack Charge Error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to initiate STK push. Please pay manually.',
      fallback: true,
      tillNumber: process.env.MPESA_TILL_NUMBER || '3175088',
    });
  }
};

// @desc    Poll Paystack charge status (for auto-polling after STK push)
// @route   GET /api/payments/charge/:reference
// @access  Private
export const getChargeStatus = async (req, res) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ success: false, message: 'Paystack not configured' });
    }
    const { reference } = req.params;
    if (!reference) return res.status(400).json({ success: false, message: 'Missing reference' });

    const response = await axios.get(
      `https://api.paystack.co/charge/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const charge = response.data;
    if (charge.status && charge.data.status === 'success') {
      // Payment confirmed — atomically decrement stock before marking paid
      const order = await Order.findOne({ 'paymentResult.id': reference });
      if (order && !order.isPaid) {
        const stockResult = await decrementStockForOrder(order);
        if (!stockResult.success) {
          console.error(`[CHARGE-POLL] Insufficient stock for order ${order._id} variant ${stockResult.failedItem.variant}`);
          return res.status(409).json({
            success: false,
            status: 'failed',
            message: `Insufficient stock for ${stockResult.failedItem.variant} — payment cannot be completed`,
          });
        }
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'processing';
        order.paymentResult.status = 'success';
        await order.save();
        await clearUserCart(order.user);
        console.log(`[CHARGE-POLL] Order ${order._id} paid, stock decremented, cart cleared`);
      }
      return res.json({ success: true, status: 'success', data: charge.data });
    }

    // Still pending or failed
    return res.json({
      success: charge.status,
      status: charge.data?.status || 'pending',
      message: charge.data?.display_text || 'Payment processing',
    });
  } catch (error) {
    console.error('Paystack Charge Poll Error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to check charge status',
    });
  }
};

// @desc    Verify Paystack Payment
// @route   GET /api/payments/verify/:reference
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ success: false, message: 'Paystack not configured' });
    }
    const { reference } = req.params;
    if (!reference) return res.status(400).json({ success: false, message: 'Missing reference' });

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.data.status && response.data.data.status === 'success') {
      const order = await Order.findOne({ 'paymentResult.id': reference });

      if (order && !order.isPaid) {
        const stockResult = await decrementStockForOrder(order);
        if (!stockResult.success) {
          console.error(`[VERIFY] Insufficient stock for order ${order._id} variant ${stockResult.failedItem.variant}`);
          return res.status(409).json({
            success: false,
            status: 'failed',
            message: `Insufficient stock for ${stockResult.failedItem.variant} — payment cannot be completed. Stock was insufficient at confirmation time.`,
          });
        }
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'processing';
        order.paymentResult.status = 'success';
        await order.save();

        // ✅ Clear cart now that payment is confirmed
        await clearUserCart(order.user);
        console.log(`[VERIFY] Order ${order._id} paid, stock decremented, cart cleared`);
      }

      return res.json({
        success: true,
        status: 'success',
        data: response.data.data,
      });
    } else {
      return res.json({
        success: false,
        status: response.data.data?.status || 'failed',
        message: response.data.message || 'Payment not yet verified',
      });
    }
  } catch (error) {
    console.error('Paystack Verify Error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Internal Server Error during verification',
    });
  }
};

// @desc    Handle Paystack Webhook
// @route   POST /api/payments/webhook
// @access  Public
export const handlePaystackWebhook = async (req, res) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error('[SECURITY] PAYSTACK_SECRET_KEY not set — rejecting webhook');
      return res.status(500).send('Server misconfiguration');
    }
    // Paystack requires raw body for HMAC. Router uses express.raw(), so req.body is Buffer.
    // Fallback to JSON.stringify only if raw not provided (e.g., direct test).
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).send('Invalid signature');
    }

    const event = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body;

    if (event.event === 'charge.success') {
      const { reference } = event.data;
      console.log(`[WEBHOOK] Payment success for ref: ${reference}`);

      const order = await Order.findOne({ 'paymentResult.id': reference });
      if (order && !order.isPaid) {
        const stockResult = await decrementStockForOrder(order);
        if (!stockResult.success) {
          console.error(`[WEBHOOK] Insufficient stock for order ${order._id} variant ${stockResult.failedItem.variant} — not marking paid`);
          // Do not mark as paid; return 409 so Paystack may retry after restock, but log clearly
          return res.status(409).send(`Insufficient stock for ${stockResult.failedItem.variant}`);
        }
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'processing';
        order.paymentResult.status = 'success';
        await order.save();

        // ✅ Clear cart on webhook confirmation too
        await clearUserCart(order.user);
        console.log(`[WEBHOOK] Order ${order._id} paid, stock decremented, cart cleared`);
      }
    }

    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Webhook Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
};