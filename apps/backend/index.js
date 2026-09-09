import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import admin from './src/config/firebaseAdmin.js';

// Routes
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import mpesaRoutes from './src/routes/mpesaRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';

connectDB();

const app = express();

// SECURITY: trust the first proxy hop (Railway/Vercel/Cloudflare) so
// express-rate-limit sees the real client IP. Must be a number (not `true`)
// to avoid trusting spoofed X-Forwarded-For chains beyond our proxy.
app.set('trust proxy', 1);

const allowedOrigins = [
    'http://localhost:5173',
    process.env.CLIENT_URL_PROD,
].filter(Boolean);

// Middleware - CORS must be at the very top!
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // SECURITY: return a clean 403 JSON instead of a 500 with a raw Error message.
            callback(null, false);
        }
    },
    credentials: true
}));
// Rejected CORS origins fall through here with a JSON 403 (no stack/message leak).
app.use((req, res, next) => {
    if (req.headers.origin && !allowedOrigins.includes(req.headers.origin)) {
        return res.status(403).json({ success: false, message: 'Origin not allowed' });
    }
    next();
});

// Configure Helmet for Firebase Compatibility
app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
}));

// SECURITY: global backstop limiter — per-route strict limiters (auth/payments/chat)
// still apply on top. 600 req / 15 min per IP is generous for browsing, stops floods.
app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please slow down.' },
}));

app.use(morgan('dev'));
// Paystack webhook requires raw body — must be before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Startup env validation (non-blocking, logs security warnings)
if (!process.env.PAYSTACK_SECRET_KEY) console.warn('[SECURITY] PAYSTACK_SECRET_KEY not set — Paystack payments will fail');
if (!process.env.JWT_SECRET) {
    console.warn('[SECURITY] JWT_SECRET not set — auth will fail');
} else if (process.env.JWT_SECRET.length < 32) {
    // Short secrets are brute-forceable — rotate to 32+ random chars (see .env.example).
    console.warn('[SECURITY] JWT_SECRET is shorter than 32 chars — rotate to a longer secret');
}
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) console.warn('[SECURITY] MONGODB_URI not set — DB not connected');
if (!process.env.GROQ_API_KEY) console.warn('[SECURITY] GROQ_API_KEY not set — Pia chat will use WhatsApp fallback');

// DEBUG routes — only in non-production
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/test', (req, res) => {
      res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
  });
  app.use('/api/auth/config-check', (req, res) => {
      res.json({
          database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
          firebaseAdmin: !!admin.apps.length ? 'Initialized' : 'Not Initialized',
          env: {
              hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT,
              hasStorageBucket: !!process.env.FIREBASE_STORAGE_BUCKET,
              nodeEnv: process.env.NODE_ENV
          }
      });
  });
}
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send('Perfect Pick API is running...');
});

// Global Error Handler
// SECURITY: never leak err.message/stack to clients in production — Mongoose CastErrors,
// JWT internals and upstream bodies have all leaked through this handler before.
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.stack}`);
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production'
        ? (status >= 500 ? 'Internal Server Error' : 'Request failed')
        : (err.message || 'Internal Server Error');
    res.status(status).json({
        success: false,
        message
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;