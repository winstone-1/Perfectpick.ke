import express from 'express';
import { initiateMpesaPayment, verifyPayment, handlePaystackWebhook, getChargeStatus } from '../controllers/paymentController.js';
import { protect } from '../middleware/protect.js';
import { paymentInitLimiter, paymentPollLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/mpesa', protect, paymentInitLimiter, initiateMpesaPayment);
router.get('/charge/:reference', protect, paymentPollLimiter, getChargeStatus);
router.get('/verify/:reference', protect, paymentPollLimiter, verifyPayment);
router.post('/webhook', handlePaystackWebhook); // Public — raw body handled at app level, signature verified inside controller (no rate limit; Paystack needs retries)

export default router;
