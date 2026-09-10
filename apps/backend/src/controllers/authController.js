import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import admin from '../config/firebaseAdmin.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user._id),
                }
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Sanitize email input
        const sanitizedEmail = String(email || '').trim().toLowerCase();
        if (!sanitizedEmail || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email: sanitizedEmail }).select('+password');

        // Check if user exists and is not banned
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check banned status
        const banStatus = user.getBanStatus();
        if (banStatus.banned) {
            return res.status(403).json({
                message: `Account is temporarily locked. Please try again in ${banStatus.remainingMinutes} minute(s).`,
                code: 'ACCOUNT_LOCKED'
            });
        }

        // Check password
        if (user && (await user.matchPassword(password))) {
            // Reset login attempts on successful login
            user.loginAttempts = 0;
            user.lockUntil = undefined;
            await user.save();

            res.json({
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user._id),
                }
            });
        } else {
            // Increment login attempts
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            
            // Lock account after 5 failed attempts for 15 minutes
            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 15 * 60000;
                await user.save();
                return res.status(403).json({
                    message: 'Account locked due to too many failed attempts. Try again in 15 minutes.',
                    code: 'ACCOUNT_LOCKED'
                });
            }
            
            await user.save();
            res.status(401).json({ 
                message: `Invalid email or password. ${5 - user.loginAttempts} attempt(s) remaining.`,
                attemptsRemaining: 5 - user.loginAttempts
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Firebase Social Login
// @route   POST /api/auth/firebase
// @access  Public
export const firebaseLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'ID token is required'
            });
        }

        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
            console.log('Firebase token verified for:', decodedToken.email);
        } catch (tokenError) {
            console.error('Token verification failed:', tokenError.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired Firebase token'
            });
        }

        let user = await User.findOne({ email: decodedToken.email });

        if (!user) {
            user = await User.create({
                name: decodedToken.name || decodedToken.email.split('@')[0],
                email: decodedToken.email,
                firebaseUid: decodedToken.uid,
                avatar: decodedToken.picture || '',
                authProvider: 'google',
                isEmailVerified: decodedToken.email_verified || false,
                isAdmin: false
            });
            console.log('New Google user created:', user.email);
        } else {
            // Update user info if changed
            let changed = false;
            if (!user.avatar && decodedToken.picture) {
                user.avatar = decodedToken.picture;
                changed = true;
            }
            if (user.isEmailVerified !== decodedToken.email_verified) {
                user.isEmailVerified = decodedToken.email_verified;
                changed = true;
            }
            if (changed) await user.save();
        }

        // Check banned status
        const banStatus = user.getBanStatus();
        if (banStatus.banned) {
            return res.status(403).json({
                success: false,
                message: `Account is temporarily locked. Please try again in ${banStatus.remainingMinutes} minute(s).`,
                code: 'ACCOUNT_LOCKED'
            });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                isAdmin: user.isAdmin,
                token
            }
        });

    } catch (error) {
        console.error('Firebase auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during authentication',
            error: error.message
        });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    isAdmin: user.isAdmin,
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                data: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    isAdmin: updatedUser.isAdmin,
                    token: generateToken(updatedUser._id),
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};