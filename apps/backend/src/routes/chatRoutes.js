import express from 'express';
import { chatWithPia } from '../controllers/chatController.js';
import { chatLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Anonymous — no protect, but strictly rate-limited (costs Groq quota)
router.post('/', chatLimiter, chatWithPia);

export default router;
