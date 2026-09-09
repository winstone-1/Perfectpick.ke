import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

export const getStats = async (req, res, next) => {
    try {
        const [totalProducts, totalOrders, totalUsers, orders, pendingOrders] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            User.countDocuments(),
            Order.find({}),
            Order.countDocuments({ status: 'pending' })
        ]);
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        res.json({ success: true, data: { totalProducts, totalOrders, totalUsers, totalRevenue, pendingOrders } });
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

        if (typeof images === 'string') {
            try { images = JSON.parse(images); } catch { images = [images]; }
        } else if (!images) {
            images = product.images;
        }
        if (typeof variants === 'string') {
            try { variants = JSON.parse(variants); } catch { variants = product.variants; }
        } else if (!variants) {
            variants = product.variants;
        }

        if (name !== undefined) product.name = name;
        if (price !== undefined) product.price = price;
        if (description !== undefined) product.description = description;
        if (category !== undefined) product.category = category;
        if (variants !== undefined) product.variants = variants;
        if (images !== undefined) product.images = images;
        if (featured !== undefined) product.featured = featured === 'true' || featured === true;
        if (discount !== undefined) product.discount = Number(discount) || 0;
        if (discountLabel !== undefined) product.discountLabel = discountLabel;

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
        // SECURITY: whitelist — previously any string (e.g. "hacked") was persisted.
        const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (req.body.status !== undefined && !allowedStatuses.includes(req.body.status)) {
            return res.status(400).json({ success: false, message: 'Invalid order status' });
        }
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

// SECURITY: role management with anti-lockout guards.
// - Admins can never be banned (a banned admin could lock everyone out / be abused).
// - An admin cannot demote or ban themselves (prevents accidental self-lockout).
// - Only admins (not managers) may change roles — enforced at route level via adminOnly.
export const updateUserRole = async (req, res, next) => {
    try {
        const allowedRoles = ['customer', 'manager', 'admin'];
        const { role } = req.body;
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }
        const target = await User.findById(req.params.id);
        if (!target) return res.status(404).json({ success: false, message: 'User not found' });

        if (target._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot change your own role' });
        }

        target.role = role;
        // Keep legacy isAdmin flag in sync so old JWT checks and frontend keep working.
        target.isAdmin = role === 'admin' || role === 'manager';
        await target.save();
        res.json({ success: true, data: { _id: target._id, role: target.role, isAdmin: target.isAdmin } });
    } catch (error) {
        next(error);
    }
};

export const banUser = async (req, res, next) => {
    try {
        const { banned } = req.body;
        if (typeof banned !== 'boolean') {
            return res.status(400).json({ success: false, message: 'Field "banned" must be a boolean' });
        }
        const target = await User.findById(req.params.id);
        if (!target) return res.status(404).json({ success: false, message: 'User not found' });

        // GUARD: admins can never be banned — banning an admin is treated as a no-op attack.
        if (target.isAdmin === true || target.role === 'admin') {
            return res.status(400).json({ success: false, message: 'Admin accounts cannot be banned' });
        }
        // GUARD: no self-ban (instant self-lockout).
        if (target._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot ban your own account' });
        }

        target.isBanned = banned;
        await target.save();
        res.json({ success: true, data: { _id: target._id, isBanned: target.isBanned } });
    } catch (error) {
        next(error);
    }
};