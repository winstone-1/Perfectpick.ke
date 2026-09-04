import 'dotenv/config';
import express from 'express';
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

connectDB();

const app = express();

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
// Paystack webhook requires raw body — must be before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Startup env validation (non-blocking, logs security warnings)
if (!process.env.PAYSTACK_SECRET_KEY) console.warn('[SECURITY] PAYSTACK_SECRET_KEY not set — Paystack payments will fail');
if (!process.env.JWT_SECRET) console.warn('[SECURITY] JWT_SECRET not set — auth will fail');
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) console.warn('[SECURITY] MONGODB_URI not set — DB not connected');

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