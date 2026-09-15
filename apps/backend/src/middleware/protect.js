import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized, no token' });
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }
            // Block banned users at the auth layer (ban expiry handled by model)
            if (typeof req.user.isBanned === 'function' && req.user.isBanned()) {
                const ban = typeof req.user.getBanStatus === 'function' ? req.user.getBanStatus() : {};
                return res.status(403).json({
                    success: false,
                    message: 'Account temporarily suspended',
                    ...(ban.remainingMinutes ? { remainingMinutes: ban.remainingMinutes } : {}),
                });
            }
            return next();
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
};

const admin = (req, res, next) => {
    // NOTE: This 'admin' middleware is not imported by any route (routes use
    // adminOnly from middleware/roles.js instead). Kept to avoid breaking any
    // future direct import, but prefer roles.js for new routes.
    const isAdmin = req.user && (req.user.isAdmin === true || req.user.role === 'admin' || req.user.role === 'manager');
    if (isAdmin) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as admin' });
    }
};

export { protect, admin };
export default protect;