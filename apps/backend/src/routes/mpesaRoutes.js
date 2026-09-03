import express from 'express';
import { stkPush, mpesaCallback, queryStkStatus } from '../controllers/mpesaController.js';
import protect from '../middleware/protect.js';

const router = express.Router();

router.post('/stkpush', protect, stkPush);
router.post('/callback', mpesaCallback); // Public for Safaricom
router.post('/query', protect, queryStkStatus);

export default router;
