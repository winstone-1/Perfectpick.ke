import express from 'express';
import {
    getStats,
    createUser,
    updateUser,
    deleteUser,
    createProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    updateOrderStatus,
    getUsers,
    bulkUpsertProducts,
} from '../controllers/adminController.js';
import { protect } from '../middleware/protect.js';
import { adminOnly, managerOrAdmin } from '../middleware/roles.js';
import upload, { uploadToCloudinary, uploadVideos, uploadBanner } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

// Stats
router.get('/stats', adminOnly, getStats);

// Bulk product import — must be before /products/:id
router.post('/products/bulk', adminOnly, bulkUpsertProducts);

// Product management
router.route('/products')
    .post(adminOnly, upload.array('images', 5), uploadToCloudinary, createProduct);

router.route('/products/:id')
    .put(adminOnly, upload.array('images', 5), uploadToCloudinary, updateProduct)
    .delete(adminOnly, deleteProduct);

// Video upload for a product
router.put('/products/:id/videos', adminOnly, uploadVideos, async (req, res, next) => {
    try {
        const product = await (await import('../models/Product.js')).default.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const newVideoUrls = req.files.map(f => f.path);
        let existingVideos = [];
        if (req.body.videos) {
            try {
                existingVideos = JSON.parse(req.body.videos);
                if (!Array.isArray(existingVideos)) existingVideos = [existingVideos];
            } catch {
                existingVideos = [req.body.videos];
            }
        }
        product.videos = [...existingVideos, ...newVideoUrls];
        await product.save();
        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
});

// Discount banner upload for a product
router.put('/products/:id/banner', adminOnly, uploadBanner, async (req, res, next) => {
    try {
        const Product = (await import('../models/Product.js')).default;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        if (req.file) product.discountBanner = req.file.path;
        if (req.body.discount) product.discount = Number(req.body.discount);
        if (req.body.discountLabel) product.discountLabel = req.body.discountLabel;
        await product.save();
        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
});

// Order management
router.route('/orders')
    .get(managerOrAdmin, getOrders);

router.route('/orders/:id')
    .put(managerOrAdmin, updateOrderStatus);

// User management
router.route('/users')
    .get(adminOnly, getUsers)
    .post(adminOnly, createUser);

router.route('/users/:id')
    .put(adminOnly, updateUser)
    .delete(adminOnly, deleteUser);

export default router;