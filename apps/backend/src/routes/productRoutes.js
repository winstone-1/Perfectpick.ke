import express from 'express';
import {
    getProducts,
    getProductById,
    getFeaturedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    getCategoryGroups
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/protect.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);  // <-- ADD THIS for /api/products/featured
router.get('/categories', getCategories);
router.get('/category-groups', getCategoryGroups);
router.get('/:id', getProductById);

// Admin routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;