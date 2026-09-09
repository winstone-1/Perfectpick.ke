import mongoose from 'mongoose';

// Shared input-validation helpers (no new dependencies).
// SECURITY: MongoDB operator injection — if a client sends { "email": { "$gt": "" } }
// instead of a string, Mongoose would treat it as a query operator. Every controller
// must reject non-string scalars via these helpers before touching the DB.

export const isNonEmptyString = (v, maxLen = 500) =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= maxLen;

export const isValidEmail = (v) =>
  typeof v === 'string' &&
  v.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export const normalizeEmail = (v) => v.trim().toLowerCase();

export const isValidObjectId = (v) =>
  typeof v === 'string' && mongoose.Types.ObjectId.isValid(v);

// Escape user input before embedding in $regex (prevents ReDoS / regex injection).
export const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Trim + cap length for free-text fields stored in MongoDB.
export const sanitizeText = (v, maxLen = 2000) =>
  typeof v === 'string' ? v.trim().slice(0, maxLen) : v;

export const isPositiveNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
};
