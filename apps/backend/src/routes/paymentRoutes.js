import express from 'express';
import { initiateMpesaPayment, verifyPayment, handlePaystackWebhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

router.post('/mpesa', protect, initiateMpesaPayment);
router.get('/verify/:reference', protect, verifyPayment);
router.post('/webhook', handlePaystackWebhook); // Public — raw body handled at app level, signature verified inside controller

export default router;
