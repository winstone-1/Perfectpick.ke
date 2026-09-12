export const adminOnly = (req, res, next) => {
    const isAdmin = req.user && (req.user.isAdmin === true || req.user.role === 'admin' || req.user.role === 'manager');
    if (isAdmin) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
};

export const managerOrAdmin = (req, res, next) => {
    const isPrivileged = req.user && (req.user.isAdmin === true || req.user.role === 'admin' || req.user.role === 'manager');
    if (isPrivileged) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as a manager or admin' });
    }
};
