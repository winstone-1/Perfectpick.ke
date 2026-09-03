# Paystack Integration — Security Review (Phase 2)

> **Sandbox only. Never commit real keys.** `.env` is gitignored; `.env.example` contains `sk_test` placeholder.

## Fixed in this commit (flagged, not silent)

### [S1] Webhook signature — raw body — FIXED
- **File:** `apps/backend/src/controllers/paymentController.js:143-170`, `apps/backend/index.js:57`
- **Before:** `crypto.createHmac(...).update(JSON.stringify(req.body))` after `express.json()`. Paystack docs require raw request body; `JSON.stringify` re-serialization mismatches key order/spacing → legitimate webhooks intermittently rejected.
- **After:** `app.use('/api/payments/webhook', express.raw({type:'application/json'}))` before `express.json()`, controller uses `Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body))` and `JSON.parse(rawBody)` for event. Guard added for missing `PAYSTACK_SECRET_KEY`.
- **Flag:** If you saw “Invalid signature” in webhook logs, this was the cause. Please redeploy and re-test Paystack webhook with sandbox dashboard → Settings → Webhooks → Test.

### [S2] Missing env guard — FIXED (partial)
- **File:** `paymentController.js:23,91,144`
- **Before:** `process.env.PAYSTACK_SECRET_KEY` could be `undefined`, producing HMAC with string `"undefined"` — attacker could forge.
- **After:** Early return `500` if env missing, plus startup warn in `index.js:62`. **Still needs:** deployment env validation (Railway/Vercel) — ensure `PAYSTACK_SECRET_KEY` is set as secret, not plaintext log.

### [S3] CORS over-permissive — FLAGGED (not fixed, needs manual review)
- **File:** `apps/backend/index.js:25-32`
- **Issue:** `origin.endsWith('.vercel.app')` + `credentials:true` allows *any* Vercel preview URL to make credentialed requests. Hardcoded preview domains (`antigravity-...`) leak infra.
- **Recommendation:** Replace with explicit allowlist: `allowedOrigins = [process.env.CLIENT_URL_PROD, 'http://localhost:5173']` and drop wildcard. If previews needed, use `CLIENT_URL_PREVIEW` env. **Do not ship wildcard+creds to prod.**

### [S4] JWT long expiry + missing secret — FLAGGED
- **File:** `protect.js:10`, `authController.js:7,129`
- **Issue:** `expiresIn: '30d'` with no refresh/rotation; stolen token valid 30 days. No startup check for `JWT_SECRET` undefined → `jwt.verify(undefined)` throws but logs leak.
- **Fix now:** Added startup warn for missing `JWT_SECRET`. **Manual:** Shorten to `7d` or implement refresh tokens, add `JWT_EXPIRE` env.

### [S5] Client-side keys — CHECKED, OK
- **Audit:** `grep -r PAYSTACK src` in `apps/frontend` — no hits. No secret/public key in client bundle. Only `VITE_FIREBASE_*` and `VITE_API_URL` in client (expected). **Good.**

### [S6] Debug routes exposed — FIXED
- **File:** `apps/backend/index.js:65-77`
- **Before:** `/api/test` and `/api/auth/config-check` (leaks DB/Firebase state, service-account presence) exposed in prod (mounted via `app.use` without method guard).
- **After:** Wrapped in `if (process.env.NODE_ENV !== 'production')`. Verify prod `NODE_ENV=production` on Railway/Vercel.

### [S7] Rate limiting — FLAGGED (not fixed)
- **Missing:** No `express-rate-limit` on `POST /auth/login`, `POST /auth/register`, `POST /payments/mpesa`, `POST /payments/verify`.
- **Recommendation before prod:** Add `rateLimit({windowMs:15*60*1000, max:100})` for auth, `max:10` for payments.

### Other notes
- **Amount handling:** Frontend sends `total` in KES, backend does `Math.round(amount*100)` → Paystack kobo. Correct. No client-side amount override risk because `POST /orders` creates order from DB cart, not client `items`.
- **Phone:** Backend `normalizePhoneNumber()` handles `0`, `254`, `+254`. Frontend does not need to pre-format but keep validation `0712...`.
- **Till fallback:** `MPESA_TILL_NUMBER=3175088` baked as fallback; ensure this is sandbox Till or env-controlled.
- **Duplicate M-Pesa stack:** `mpesaRoutes.js` (Daraja `api.safaricom.co.ke` live) + `paymentRoutes.js` (Paystack) both exist. Frontend only uses Paystack. Consider deprecating Daraja or guarding via env `MPESA_PROVIDER=paystack`.

## Manual Checklist Before Production Keys
- [ ] Set `PAYSTACK_SECRET_KEY=sk_live_*` and `PAYSTACK_PUBLIC_KEY=pk_live_*` only in Railway/Vercel dashboard (never in `.env` committed)
- [ ] Set `PAYSTACK_WEBHOOK_URL=https://your-api/api/payments/webhook` in Paystack dashboard, test with “Send Test Webhook”
- [ ] Remove/comment `PAYSTACK_SECRET_KEY` from any local `.env` before `git add`
- [ ] `git log -p | grep PAYSTACK` should be empty
- [ ] Rotate `JWT_SECRET` to 32+ random chars
- [ ] `NODE_ENV=production` on deploy
