import express from 'express';
import {
    addOrderItems,
    getMyOrders,
    getOrderById,
} from '../controllers/orderController.js';
import protect from '../middleware/protect.js';

const router = express.Router();

router.use(protect); // Global protection for order routes

router.post('/', addOrderItems);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);

export default router;
