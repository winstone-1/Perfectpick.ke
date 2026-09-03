export const adminOnly = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
};

export const managerOrAdmin = (req, res, next) => {
    if (req.user && (req.user.isAdmin || req.user.role === 'manager')) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as a manager or admin' });
    }
};
