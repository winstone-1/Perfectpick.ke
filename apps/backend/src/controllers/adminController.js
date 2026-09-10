import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

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

export const createUser = async (req, res, next) => {
    try {
        const { name, email, password, isAdmin, avatar } = req.body;

        // Sanitize email
        const sanitizedEmail = String(email || '').trim().toLowerCase();
        if (!sanitizedEmail || !name) {
            return res.status(400).json({ success: false, message: 'Email and name are required' });
        }

        const userExists = await User.findOne({ email: sanitizedEmail });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = password ? await bcrypt.hash(password, salt) : undefined;

        const user = await User.create({
            name,
            email: sanitizedEmail,
            password: hashedPassword,
            isAdmin: isAdmin === true || isAdmin === 'true',
            avatar: avatar || '',
        });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                }
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent self-demotion
        if (req.user._id.toString() === user._id.toString() && req.body.isAdmin === false) {
            return res.status(403).json({
                success: false,
                message: 'Admins cannot demote themselves'
            });
        }

        // Prevent removing admin from the last admin (guard against locking out)
        if (req.body.isAdmin === false && user.isAdmin === true) {
            const totalAdmins = await User.countDocuments({ isAdmin: true });
            if (totalAdmins <= 1) {
                return res.status(403).json({
                    success: false,
                    message: 'Cannot remove admin status - this is the only admin account'
                });
            }
        }

        user.name = req.body.name || user.name;
        user.email = (req.body.email || user.email).trim().toLowerCase();
        user.isAdmin = req.body.isAdmin === true || req.body.isAdmin === 'true' || user.isAdmin;
        user.avatar = req.body.avatar || user.avatar;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        if (req.body.banDuration) {
            await user.ban(Number(req.body.banDuration));
            return res.json({ success: true, message: `User banned for ${req.body.banDuration} minutes` });
        }

        if (req.body.unban) {
            await user.unban();
            return res.json({ success: true, message: 'User unbanned' });
        }

        const updatedUser = await user.save();
        res.json({
            success: true,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                bannedUntil: updatedUser.bannedUntil,
            }
        });
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

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent deleting the last admin
        if (user.isAdmin === true) {
            const totalAdmins = await User.countDocuments({ isAdmin: true });
            if (totalAdmins <= 1) {
                return res.status(403).json({
                    success: false,
                    message: 'Cannot delete the last admin account'
                });
            }
        }

        await user.deleteOne();
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        next(error);
    }
};