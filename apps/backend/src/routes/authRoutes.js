import express from 'express';
import { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile,
    firebaseLogin
} from '../controllers/authController.js';
import { protect } from '../middleware/protect.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/firebase', firebaseLogin);
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