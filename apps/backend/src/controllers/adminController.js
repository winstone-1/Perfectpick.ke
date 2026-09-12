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

        // Admins cannot be banned — role guard (bans are for customers only)
        if (req.body.banDuration && user.isAdmin === true) {
            return res.status(403).json({
                success: false,
                message: 'Admin accounts cannot be banned'
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
        // Allow demoting OTHER admins (self + last-admin guarded above).
        // Explicit true/false/'true'/'false' are honoured; omission keeps current.
        if (req.body.isAdmin === true || req.body.isAdmin === 'true') {
            user.isAdmin = true;
        } else if (req.body.isAdmin === false || req.body.isAdmin === 'false') {
            user.isAdmin = false;
        }
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
        let { name, price, description, category, variants, images, featured, discount, discountLabel, heroPages } = req.body;

        images = req.body.images || [];
        if (typeof images === 'string') {
            try { images = JSON.parse(images); } catch { images = [images]; }
        }
        if (typeof variants === 'string') {
            try { variants = JSON.parse(variants); } catch { variants = []; }
        }
        // heroPages may arrive as JSON string (multipart) or array
        if (typeof heroPages === 'string') {
            try { heroPages = JSON.parse(heroPages); } catch { heroPages = [heroPages]; }
        }
        const allowedPages = ['landing', 'home', 'trending', 'new-arrivals'];
        const cleanPages = Array.isArray(heroPages) ? heroPages.filter(p => allowedPages.includes(p)) : [];

        const product = await Product.create({
            name, price, description, images, category, variants,
            featured: featured === 'true' || featured === true,
            discount: Number(discount) || 0,
            discountLabel: discountLabel || '',
            heroPages: cleanPages,
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

        let { name, price, description, category, variants, images, featured, discount, discountLabel, heroPages } = req.body;

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
        if (heroPages !== undefined) {
            let pages = heroPages;
            if (typeof pages === 'string') {
                try { pages = JSON.parse(pages); } catch { pages = [pages]; }
            }
            const allowedPages = ['landing', 'home', 'trending', 'new-arrivals'];
            product.heroPages = Array.isArray(pages) ? pages.filter(p => allowedPages.includes(p)) : [];
        }

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

const ALLOWED_CATEGORIES = new Set([
    'bags','shoes','jewelry','gifts','accessories','clothes','handbags','earrings','hairclips',
    'keyrings','phone-charms','beauty-accessories','gift-boxes','mugs','fans','body-mists',
    'oils','ponchos','sweaters','cardigans','watches','rings',
]);

const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g,''));
    return lines.slice(1).map((line, idx) => {
        // Simple quote-aware split
        const vals = [];
        let cur = ''; let inQ = false;
        for (let i=0;i<line.length;i++) {
            const ch=line[i];
            if (ch==='"') { inQ=!inQ; continue; }
            if (ch===',' && !inQ) { vals.push(cur.trim()); cur=''; } else cur+=ch;
        }
        vals.push(cur.trim());
        const obj={_csvLine: idx+2};
        header.forEach((h,i)=>{ obj[h]= (vals[i]||'').replace(/^"|"$/g,'').trim(); });
        return obj;
    });
};

export const bulkUpsertProducts = async (req, res, next) => {
    try {
        let rows = [];
        // Accept {products:[...]} JSON array OR {csv:"..."} string OR raw array body
        if (Array.isArray(req.body)) rows = req.body;
        else if (Array.isArray(req.body.products)) rows = req.body.products;
        else if (typeof req.body.csv === 'string' && req.body.csv.trim()) rows = parseCSV(req.body.csv);
        else if (typeof req.body.data === 'string') {
            try { const p=JSON.parse(req.body.data); rows = Array.isArray(p)?p:p.products||[]; } catch {}
        }

        if (!Array.isArray(rows) || rows.length === 0) {
            return res.status(400).json({ success:false, message:'No products provided. Send {products:[...]} or {csv:\"...\"}' });
        }
        if (rows.length > 100) return res.status(400).json({ success:false, message:'Max 100 products per bulk request' });

        const succeeded = [];
        const failed = [];

        for (let i=0;i<rows.length;i++) {
            const raw = rows[i];
            const rowIndex = raw._csvLine || i;
            try {
                let name = String(raw.name||'').trim();
                let price = raw.price;
                let category = String(raw.category||'').trim().toLowerCase();
                let description = raw.description || '';
                let images = raw.images;
                let variants = raw.variants;
                let featured = raw.featured;
                let discount = raw.discount;
                let discountLabel = raw.discountLabel || '';
                let heroPages = raw.heroPages;

                // Normalize images: string "a|b" or JSON string or array
                if (typeof images === 'string') {
                    const s=images.trim();
                    if (!s) images=[];
                    else if (s.startsWith('[')) { try{ images=JSON.parse(s);}catch{ images=s.split(/[|,;]/).map(v=>v.trim()).filter(Boolean); } }
                    else images=s.split(/[|,;]/).map(v=>v.trim()).filter(Boolean);
                }
                if (!Array.isArray(images)) images=[];

                if (typeof variants === 'string') { try{ variants=JSON.parse(variants);}catch{ variants=[];} }
                if (!Array.isArray(variants) || variants.length===0) variants=[{name:'Default', stock:10}];
                else variants = variants.map(v=>({ name:String(v.name||'').trim(), stock: Number(v.stock)||0 }))
                    .filter(v=>v.name);

                if (typeof heroPages === 'string') { try{ heroPages=JSON.parse(heroPages);}catch{ heroPages=heroPages.split(/[|,;]/).map(v=>v.trim()).filter(Boolean);} }
                if (!Array.isArray(heroPages)) heroPages=[];
                heroPages = heroPages.filter(p=>['landing','home','trending','new-arrivals'].includes(p));

                const errors=[];
                if (!name || name.length<2) errors.push('name required (min 2 chars)');
                price = Number(price);
                if (!Number.isFinite(price) || price<=0) errors.push('price must be a positive number');
                if (!category || !ALLOWED_CATEGORIES.has(category)) errors.push(`category must be one of: ${[...ALLOWED_CATEGORIES].join(', ')}`);
                if (variants.length===0) errors.push('at least one variant required');
                variants.forEach((v,vi)=>{ if(!v.name) errors.push(`variants[${vi}].name required`); if(!Number.isFinite(v.stock)||v.stock<0) errors.push(`variants[${vi}].stock must be >=0`); });
                if (errors.length) { failed.push({ index: rowIndex, row: raw, errors }); continue; }

                const featuredBool = featured===true||featured==='true';
                const discountNum = Number(discount)||0;

                // Upsert by name+category (update if exists, else create)
                let product = await Product.findOne({ name, category });
                if (product) {
                    product.description = description || product.description;
                    product.price = price;
                    if (images.length) product.images = images;
                    product.variants = variants;
                    product.featured = featuredBool;
                    product.discount = discountNum;
                    product.discountLabel = discountLabel;
                    if (heroPages.length) product.heroPages = heroPages;
                    await product.save();
                    succeeded.push({ index: rowIndex, _id: product._id, name, action:'updated' });
                } else {
                    product = await Product.create({ name, description, price, category, images, variants, featured: featuredBool, discount: discountNum, discountLabel, heroPages });
                    succeeded.push({ index: rowIndex, _id: product._id, name, action:'created' });
                }
            } catch (err) {
                failed.push({ index: rowIndex, row: raw, errors:[err.message||'Unknown error'] });
            }
        }

        res.json({ success:true, data:{ succeeded, failed, total: rows.length } });
    } catch (error) { next(error); }
};