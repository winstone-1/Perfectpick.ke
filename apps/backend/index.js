import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
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

dotenv.config();

connectDB();

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://antigravity-ebon-five.vercel.app',
    'https://antigravity-fdyo5r0qe-winstone-1s-projects.vercel.app',
    'https://web-production-e851a4.up.railway.app',
    process.env.CLIENT_URL_PROD,
].filter(Boolean);

// Middleware - CORS must be at the very top!
app.use(cors({
    origin: (origin, callback) => {
        if (
            !origin ||
            allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app')
        ) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Configure Helmet for Firebase Compatibility
app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
}));

app.use(morgan('dev'));
app.use(express.json());

// DEBUG - Remove after testing
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Routes Mounting
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
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/payments', paymentRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send('Perfect Pick API is running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.stack}`);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;