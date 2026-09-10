import express from 'express';
import { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile,
    firebaseLogin
} from '../controllers/authController.js';
import { firebaseInitialised } from '../config/firebaseAdmin.js';
import { protect } from '../middleware/protect.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import User from '../models/User.js';

const router = express.Router();

// Rate limit registration (same as login to prevent abuse)
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
// Public capability probe — lets the frontend gracefully disable the Google
// button when the server has no Firebase Admin service account configured.
// No auth, no rate limit (cheap boolean read, needed on login/register mount).
router.get('/firebase-status', (req, res) => {
    res.json({ success: true, enabled: firebaseInitialised === true });
});
router.post('/firebase', authLimiter, firebaseLogin);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.put('/profile/avatar', protect, uploadSingle, async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        user.avatar = req.file.path; // Cloudinary URL
        await user.save();
        res.json({ success: true, data: { avatar: user.avatar } });
    } catch (error) {
        next(error);
    }
});

export default router;