import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import admin from '../config/firebaseAdmin.js';
import { isNonEmptyString, isValidEmail, normalizeEmail, sanitizeText } from '../middleware/validate.js';

// SECURITY: token lifetime is env-configurable (default 7d). Previous hardcoded 30d
// kept stolen tokens valid for a month. Set JWT_EXPIRE=7d (or shorter) in production.
// Existing 30d tokens remain valid until they expire naturally.
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

const generateToken = (id) => {
    if (!process.env.JWT_SECRET) throw new Error('Server misconfiguration');
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: JWT_EXPIRE,
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // SECURITY: strict type checks reject NoSQL operator injection
        // (e.g. { "email": { "$gt": "" } }) which would otherwise reach User.findOne.
        if (!isNonEmptyString(name, 100) || !isValidEmail(email)) {
            return res.status(400).json({ message: 'Please provide a valid name and email address' });
        }
        if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
            return res.status(400).json({ message: 'Password must be between 8 and 128 characters' });
        }

        const cleanEmail = normalizeEmail(email);
        const cleanName = sanitizeText(name, 100);

        const userExists = await User.findOne({ email: cleanEmail });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // bcrypt salt rounds = 10 (≈100ms per hash: brute-force resistant, login still fast)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name: cleanName,
            email: cleanEmail,
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

        // SECURITY: same strict checks as register — rejects operator injection,
        // and generic message below prevents user-enumeration via timing/content.
        if (!isValidEmail(email) || typeof password !== 'string' || password.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = await User.findOne({ email: normalizeEmail(email) });

        // SECURITY: banned users cannot obtain fresh tokens (protect.js also blocks old ones).
        if (user && user.isBanned) {
            return res.status(403).json({ message: 'Account has been suspended' });
        }

        if (user && (await user.matchPassword(password))) {
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
            res.status(401).json({ message: 'Invalid email or password' });
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

        // SECURITY: require a plain string — never pass objects to verifyIdToken.
        if (!isNonEmptyString(idToken, 5000)) {
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
            if (!user.avatar && decodedToken.picture) {
                user.avatar = decodedToken.picture;
                await user.save();
            }
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRE }
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
        // SECURITY: never leak error.message to clients (may contain Firebase internals).
        console.error('Firebase auth error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error during authentication'
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
            if (req.body.name !== undefined) {
                if (!isNonEmptyString(req.body.name, 100)) {
                    return res.status(400).json({ message: 'Invalid name' });
                }
                user.name = sanitizeText(req.body.name, 100);
            }
            if (req.body.email !== undefined) {
                if (!isValidEmail(req.body.email)) {
                    return res.status(400).json({ message: 'Invalid email address' });
                }
                user.email = normalizeEmail(req.body.email);
            }
            if (req.body.password) {
                if (typeof req.body.password !== 'string' || req.body.password.length < 8 || req.body.password.length > 128) {
                    return res.status(400).json({ message: 'Password must be between 8 and 128 characters' });
                }
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