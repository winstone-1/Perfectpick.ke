import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

export const getStats = async (req, res, next) => {
    try {
        const [totalProducts, totalOrders, totalUsers, orders] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            User.countDocuments(),
            Order.find({})
        ]);
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        res.json({ success: true, data: { totalProducts, totalOrders, totalUsers, totalRevenue } });
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        let { name, price, description, category, variants, images, featured, discount, discountLabel } = req.body;

        images = req.body.images || [];
        if (typeof images === 'string') {
            try { images = JSON.parse(images); } catch { images = [images]; }
        }
        if (typeof variants === 'string') {
            try { variants = JSON.parse(variants); } catch { variants = []; }
        }

        const product = await Product.create({
            name, price, description, images, category, variants,
            featured: featured === 'true' || featured === true,
            discount: Number(discount) || 0,
            discountLabel: discountLabel || '',
        });
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        let { name, price, description, category, variants, images, featured, discount, discountLabel } = req.body;

        images = req.body.images || product.images;
        if (typeof images === 'string') {
            try { images = JSON.parse(images); } catch { images = [images]; }
        }
        if (typeof variants === 'string') {
            try { variants = JSON.parse(variants); } catch { variants = []; }
        }

        Object.assign(product, {
            name, price, description, category, variants, images,
            featured: featured === 'true' || featured === true,
            discount: Number(discount) || 0,
            discountLabel: discountLabel || product.discountLabel,
        });

        const updatedProduct = await product.save();
        res.json({ success: true, data: updatedProduct });
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ success: true, message: 'Product removed' });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        next(error);
    }
};

export const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = req.body.status || order.status;
            const updatedOrder = await order.save();
            res.json({ success: true, data: updatedOrder });
        } else {
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (error) {
        next(error);
    }
};

export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};