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
            return next();
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
};

const admin = (req, res, next) => {
    // User model uses isAdmin flag; also support role='admin'/'manager' for flexibility
    const isAdmin = req.user && (req.user.isAdmin === true || req.user.role === 'admin' || req.user.role === 'manager');
    if (isAdmin) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as admin' });
    }
};

export { protect, admin };
export default protect;