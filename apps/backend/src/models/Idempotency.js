import mongoose from 'mongoose';

const idempotencySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  endpoint: {
    type: String,
    required: true, // e.g. 'POST /api/orders' or 'POST /api/payments/mpesa'
  },
  responseStatus: {
    type: Number,
    required: true,
  },
  responseBody: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// TTL: auto-expire after 24 hours (reasonable window for checkout retries)
// Mongo TTL monitor runs every 60s, so key lives ~24h.
idempotencySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
// Unique per user+key+endpoint to prevent cross-user collisions and allow same UUID on different endpoints
idempotencySchema.index({ key: 1, user: 1, endpoint: 1 }, { unique: true });

const Idempotency = mongoose.model('Idempotency', idempotencySchema);

export default Idempotency;
