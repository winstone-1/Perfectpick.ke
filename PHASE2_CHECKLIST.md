# Phase 2 — Broken Features Checklist (pre-fix audit)

> Generated 2026-09-03 from merged monorepo `apps/frontend` (Perfectpick.ke) + `apps/backend` (Antigravity-Server-). No fixes applied yet.

## Legend
- [ ] = broken / needs fix (non-payment first, Paystack last)
- [S] = security flag — needs explicit review, not silent fix
- File references use `path:line`

---

### A. Build / Deploy / Config (P0)

- [ ] **A1** `apps/frontend/vercel.json:2` SPA fallback broken — rewrites `/(.*) → /` should be `/index.html` → hard refresh on `/products`, `/admin/*`, `/orders/:id` 404s.
- [ ] **A2** `apps/frontend/package.json:19,24-25` Frontend ships backend deps (`cloudinary@2.9.0`, `multer`, `multer-storage-cloudinary`) — bloat, Node `fs` in browser, Vite warnings.
- [ ] **A3** `apps/frontend/src/components/ui/button.jsx:3` etc — imports from `radix-ui` barrel instead of `@radix-ui/react-*` (`@radix-ui/react-dialog:1`, etc already installed). Also `select.jsx:1` stray `"use client"` (Next.js noise).
- [ ] **A4** `apps/frontend/.env.example` vs `src/config/firebase.js:5-12` — no guard for missing `VITE_FIREBASE_*`; `initializeApp` throws `auth/invalid-api-key`, whole auth dead. No runtime warning.
- [ ] **A5** `apps/frontend/src/api/axios.js:9-17` `JSON.parse(localStorage.getItem('user'))` without try/catch — corrupted JSON crashes every request. No 401 interceptor / token shape validation (`user.token` vs `user.data.token`).

### B. Auth (P0/P1)

- [ ] **B1** `apps/frontend/src/components/ProtectedRoute.jsx:13` vs `src/pages/Profile.jsx:155` vs `apps/backend/src/models/User.js:38` — three different admin checks (`isAdmin` vs `role==='admin'/'manager'`). Backend `User.js` has only `isAdmin` (no `role`), but `protect.js:28` checks `role==='admin'`, `adminRoutes.js` uses `isAdmin`. Admin always 403 on `PUT/DELETE /api/products/:id`, or never shows manager badge.
- [ ] **B2** `apps/frontend/src/context/AuthContext.jsx:25-28` `logout()` never `signOut(auth)` — Firebase session lingers.
- [ ] **B3** `apps/frontend/src/context/AuthContext.jsx:37-43` `loginWithGoogle` returns `undefined` on `success===false` → `Login.jsx:48` `result.success` throws `TypeError`.
- [ ] **B4** `apps/frontend/src/pages/Profile.jsx:58-63` Avatar upload sends manual `Content-Type: multipart/form-data` (breaks boundary) and expects `res.data.data.avatar` but backend may return `res.data.avatar`.
- [ ] **B5** `apps/frontend/src/pages/Profile.jsx:77-97` Both name-change and password-change hit `PUT /auth/profile` with same endpoint, different payloads; no current-password verification on backend (`authController.js:181-209` allows password change with stolen token).
- [ ] **B6** `apps/backend/src/middleware/protect.js:4-32` Double-send bug: invalid token sends 401 in `catch` but falls through to `if(!token)` → `Headers already sent`, leaks stack via global handler.

### C. Cart (P0)

- [ ] **C1** `apps/frontend/src/context/CartContext.jsx:125-135` does NOT export `fetchCart` but `src/pages/Checkout.jsx:22,118` destructures & calls it → `undefined`, no-op, cart stays stale after payment. Also `CartContext.jsx:13` `fetchCart` is internal but not exposed.
- [ ] **C2** `apps/frontend/src/context/CartContext.jsx:41-62` debug `console.log` leakage (productId/variant) and `addToCart` brittle variant shape (expects `variant.name` string, backend may expect `variantId`).
- [ ] **C3** `apps/frontend/src/context/CartContext.jsx:115-122` `cartTotal` uses `item.product.price` — if `product` not populated (only `productId`), total stays 0. Matches `Checkout.jsx:383` vs `OrderDetail.jsx:145` population mismatch.
- [ ] **C4** `apps/backend/src/controllers/cartController.js:25` If `product.variants.length===0`, requires `variant` anyway → legacy product without variants impossible to add.

### D. Checkout / Orders (P0 — non-payment part + payment contract)

- [ ] **D1** `apps/frontend/src/pages/Checkout.jsx:140-143` `navigate('/cart')` called during render (not `useEffect`) → React render-phase side-effect, StrictMode loop.
- [ ] **D2** `apps/frontend/src/pages/Checkout.jsx:59-60` fallback email `customer@example.com` if `user.email` missing → Paystack validation fails.
- [ ] **D3** `apps/frontend/src/pages/OrderDetail.jsx:137` **CRASH** — `<ShoppingBag>` not imported (imports: `ChevronLeft, Package, Truck…`) → `ReferenceError: ShoppingBag is not defined`, white-screen.
- [ ] **D4** `apps/frontend/src/pages/OrderDetail.jsx:143-177` Schema mismatch: `item.productId.image/name` + `order.totalAmount` but backend `Order.js:9,30` + `orderController.js:45-106` populates `items.product` and `totalPrice`. Total shows `NaN`/`0`, images missing.
- [ ] **D5** `apps/frontend/src/pages/Orders.jsx:26` vs `OrderDetail.jsx:30` Envelope mismatch: `Orders.jsx` expects `data.data` (correct, `orderController.js:96`), `OrderDetail.jsx` does `data.order` but backend `orderController.js:112` returns `data` → `order=null` → “Order not found” always. Also `Orders.jsx:133` uses `totalPrice` but `OrderDetail:169` uses `totalAmount` — inconsistent.
- [ ] **D6** `apps/backend/src/controllers/orderController.js:32-43` No transaction for stock deduction, race oversell; `totalPrice` ignores `discount` field; `shippingAddress` not validated (500 if missing).

### E. Wishlist (P1)

- [ ] **E1** `apps/frontend/src/context/WishlistContext.jsx:1-63` LocalStorage-only, no API sync → diverges from cart’s DB truth, per-user isolation fragile (`user.id || _id`).
- [ ] **E2** `apps/frontend/src/components/ProductCard.jsx:18-30` Wishlist toggle redirects to `/login` without `state.from` → loses intent.

### F. Products / Catalog (P1)

- [ ] **F1** `apps/frontend/src/components/ProductCard.jsx:79` checks `product.isFeatured` but backend is `product.featured` (`Product.js:18`, `ManageProducts.jsx:49`) → never shows “Featured” badge.
- [ ] **F2** `apps/frontend/src/pages/Home.jsx:19` `GET /products?featured=true` vs `LandingPage.jsx:52` `GET /products/featured` — duplicate endpoints, one may 404.
- [ ] **F3** `apps/frontend/src/pages/ProductDetail.jsx:54` Un-encoded query `?category=${productData.category}&limit=5`, backend ignores `limit` param (`productController.js:5-34`).
- [ ] **F4** `apps/backend/src/controllers/productController.js:62-91` `createProduct` writes `stock` field that doesn’t exist on `Product.js`; `adminController.js:32-37` drops `stock` — inconsistency. Also `createProduct` ignores `videos/discount*` vs `adminController` handles them.

### G. Admin (P1)

- [ ] **G1** `apps/frontend/src/pages/admin/Dashboard.jsx:26-36` Expects `data.stats` but backend returns `data.data` (`adminController.js:13`) + missing `pendingOrders` → always falls back to fake demo numbers (`156/842…`), masks API failure.
- [ ] **G2** `apps/frontend/src/pages/admin/ManageProducts.jsx:133,262` `FormData` duplicate key `images` (JSON string + files), same for `videos`, plus `URL.createObjectURL` leak (never revoked, new URL per render).
- [ ] **G3** `apps/frontend/src/pages/admin/ManageOrders.jsx:169` Dead link `to={\`/admin/orders/${order._id}\`}` — no `<Route path="admin/orders/:id">` in `App.jsx:70-72` → 404.
- [ ] **G4** `apps/frontend/src/pages/admin/ManageProducts.jsx:381` Banner edit without new file sends empty string → may delete existing banner.

### H. Misc / UX (P2)

- [ ] **H1** `apps/frontend/src/App.jsx:49-50` Duplicate root: `index`=`LandingPage` vs `/home`=`Home`; `LandingPage:46` redirects auth users to `/home` while `Navbar:65` links Home→`/` → redirect flicker.
- [ ] **H2** `apps/frontend/src/components/ChatWidget.jsx:63-91` Static mock — buttons have no handlers, appears functional but dead.
- [ ] **H3** `apps/backend/index.js:61,66` Debug routes `/api/test` + `/api/auth/config-check` (POST via `use`) exposed in prod — leaks DB/Firebase state.

---

### I. Payments — Paystack (Fix LAST, own commit) + Security Flags [S]

**Functional:**
- [ ] **I1** `apps/frontend/src/pages/Checkout.jsx:79-88` No phone normalization (`0712...` → `+254712...` required for M-Pesa); amount sent as `total` (e.g. 5000) but backend `paymentController.js:34` expects `amount*100` (kobo) — mismatch; Paystack `currency:KES` + `mobile_money.provider:mpesa` contract brittle. No polling after STK push — single “I’ve paid” click races callback.
- [ ] **I2** `apps/frontend/src/pages/Checkout.jsx:106-122` Verify expects `data.status==='success'` but backend `paymentController.js:104` returns `paymentResult.status`; shape divergence causes false negatives.
- [ ] **I3** `apps/backend/src/routes/paymentRoutes.js:6-8` defines `POST /mpesa`, `GET /verify/:reference`, `POST /webhook` — but legacy `mpesaRoutes.js` (Daraja) also exposes `POST /mpesa/stkpush` with real Safaricom `api.safaricom.co.ke` hardcoded (`mpesaController.js:7`), no sandbox switch — dead/confusing double stack.

**Security [S] — FLAG, don’t silently fix:**
- [S1] `apps/backend/src/controllers/paymentController.js:143-148` **Webhook signature broken** — uses `JSON.stringify(req.body)` after `express.json()` parsing; Paystack requires raw body. Will intermittently fail → legitimate webhooks rejected or fallback to no verification. Must use `express.raw({type:'application/json'})` for webhook route.
- [S2] `paymentController.js:146` `createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)` with no guard if env missing → computes with string `"undefined"`, attacker can forge.
- [S3] `apps/backend/index.js:35-48` **CORS over-permissive** — `origin.endsWith('.vercel.app')` + `credentials:true` allows any `*.vercel.app` to make credentialed requests. Hardcoded preview URLs leak.
- [S4] `apps/backend/src/middleware/protect.js:10` `JWT_SECRET` not validated at startup; token `expiresIn:'30d'` excessive, no refresh, plus global error handler `index.js:91-97` leaks `err.message` (mongoose stacks).
- [S5] `apps/backend/src/controllers/paymentController.js:48,74` **No key-in-client check done** — audited, no `PAYSTACK_SECRET`/`PUBLIC` found in `apps/frontend` (good). But ensure sandbox keys never committed — `.gitignore` covers `.env`.
- [S6] `apps/backend/index.js:51-55` `helmet` disables `contentSecurityPolicy:false` globally, `crossOriginResourcePolicy: cross-origin` overly permissive.
- [S7] No rate limiting on `POST /auth/login`, `POST /payments/mpesa` (`package.json` missing `express-rate-limit`).

---

**Working (verified in Phase 1):** `npm install` hoisted, `vite build` OK, `GET /` + `GET /api/test` 200, `GET / 5173` HTML, `concurrently`/`run.sh` both ports side-by-side.

**Fix order (Phase 2):** A → B → C/D (non-payment) → E/F/G/H → I (+ [S] review) — one commit per feature group.
