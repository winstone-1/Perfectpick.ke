import rateLimit from 'express-rate-limit';

// Auth: 5 requests per minute per IP — brute-force protection, still allows user retry
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please wait a minute and try again.' },
  // Skip successful requests? No — count all to prevent brute force
});

// Order creation: 10 per minute — prevents double-click/network-retry duplicates while allowing legitimate cart retries
export const orderCreateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many order attempts. Please wait a moment.' },
});

// Payment initiation (STK push): 10 per minute per IP — allows legitimate STK retry (~6s interval) without blocking, prevents spam
export const paymentInitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many payment attempts. Please wait a minute before retrying.' },
});

// Payment polling/verify: more lenient — auto-polling may hit every 3s, allow 30/min
export const paymentPollLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many status checks. Please wait.' },
});
