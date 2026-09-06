import Idempotency from '../models/Idempotency.js';

/**
 * Extract idempotency key from header or body.
 * Client should send:  Idempotency-Key: <uuid>  or  X-Idempotency-Key: <uuid>
 * Fallback: req.body.idempotencyKey / idempotency_key
 */
export const getIdempotencyKey = (req) => {
  return (
    req.headers['idempotency-key'] ||
    req.headers['x-idempotency-key'] ||
    req.body?.idempotencyKey ||
    req.body?.idempotency_key ||
    null
  );
};

/**
 * Check if this idempotency key was already processed for this user/endpoint.
 * If found, short-circuit with original response (duplicate prevention).
 * Call this at the very start of the controller, before any side effects.
 * Returns true if response was already sent (caller should return).
 */
export const handleIdempotencyCheck = async (req, res, endpoint) => {
  const key = getIdempotencyKey(req);
  if (!key) return { key: null, isDuplicate: false };

  // Basic UUID format check (lenient — allow any non-empty string 8+ chars)
  if (typeof key !== 'string' || key.trim().length < 8) {
    return { key: null, isDuplicate: false };
  }

  const trimmed = key.trim();
  try {
    const existing = await Idempotency.findOne({ key: trimmed, user: req.user._id, endpoint });
    if (existing) {
      // Replay original response
      return {
        key: trimmed,
        isDuplicate: true,
        responseStatus: existing.responseStatus,
        responseBody: existing.responseBody,
      };
    }
    return { key: trimmed, isDuplicate: false };
  } catch (err) {
    // On DB error, fail open — allow request to proceed (don't block checkout)
    console.error('[IDEMPOTENCY] check failed:', err.message);
    return { key: trimmed, isDuplicate: false };
  }
};

/**
 * Persist response for future duplicate checks.
 * Call after successful response (2xx) is prepared, before sending.
 * Uses upsert with unique index to handle race conditions.
 */
export const saveIdempotencyResponse = async (key, userId, endpoint, status, body) => {
  if (!key) return;
  try {
    await Idempotency.updateOne(
      { key, user: userId, endpoint },
      { $setOnInsert: { responseStatus: status, responseBody: body } },
      { upsert: true }
    );
  } catch (err) {
    // Duplicate key race — another request with same key already inserted, swallow
    if (err.code === 11000) return;
    console.error('[IDEMPOTENCY] save failed:', err.message);
  }
};
