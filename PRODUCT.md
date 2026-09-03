# PerfectPick.ke — Product Definition

> Auto-generated via `impeccable init` from merged monorepo `apps/frontend` + `apps/backend` (2026-09-03). Source of truth is the actual code, not external docs.

## 1. Vision

**PerfectPick** is Nairobi’s curated destination for luxury — bags, shoes, jewelry, gifts, accessories, and clothes — with a fragrance-inspired storefront (the “Sicilian Bergamot & Fig” hero). It aims to feel like a boutique, not a marketplace: glassmorphism, editorial typography, and mobile-first detail pages that mirror the perfume mockups (small bottle, warm terracotta, `c08050`).

Tagline: *“Nairobi’s Perfect Pick — curated bags, shoes, jewelry & gifts, handpicked for the modern woman.”*

## 2. Who It’s For

- **Primary:** Urban Kenyan shoppers (18–40) who want affordable luxury with trusted delivery and M-Pesa checkout. Mobile-first, low-data tolerant.
- **Secondary:** Store owner / admin managing inventory, orders, and fulfillment from ` /admin`.
- **Tertiary:** Returning customers using wishlist, repeat checkout, profile/account.

## 3. Core Jobs-To-Be-Done

1. **Discover** — Browse by category (bags/shoes/jewelry/gifts/accessories/clothes), featured/ new-arrivals / trending, search, category pills (`All scents` + `Woody/Citrus…` in mock becomes category filter).
2. **Evaluate** — Product detail with large circular crop, brand, volume, key notes, price, variant stock, related items, image/video gallery.
3. **Save** — Wishlist (localStorage, per-user), cart (DB-backed via `Cart` model, `useCart`).
4. **Checkout** — Shipping form → M-Pesa STK push via Paystack (`POST /api/payments/mpesa`), fallback Till `3175088`, manual “I’ve paid” verify `GET /api/payments/verify/:reference`, webhook `POST /api/payments/webhook` clears cart.
5. **Track** — Orders list + detail with progress stepper (Pending → Processing → Shipped → Delivered, cancelled), free delivery badge.
6. **Manage (admin)** — ` /admin` dashboard (stats), ` /admin/products` (CRUD, Cloudinary images/videos/banner, featured/discount toggles), ` /admin/orders` (status → pending/processing/shipped/delivered/cancelled).

## 4. Actual Pages (from `apps/frontend/src/pages`)

| Route | File | Purpose |
|-------|------|---------|
| `/` | `LandingPage.jsx` | Public hero (video/image fallback), banners, categories, trust pillars → redirects auth to `/home` |
| `/home` | `Home.jsx` | Logged-in home, `GET /products?featured=true`, category grid |
| `/products` | `Products.jsx` | Filtered catalog, `?category,search,sort`, `distinct categories` |
| `/products/:id` | `ProductDetail.jsx` | Detail + add-to-cart (variant), related `?category&limit=5` |
| `/new-arrivals` | `NewArrivals.jsx` | `?sort=-createdAt` |
| `/trending` | `TrendingNow.jsx` | `?sort=-viewCount` |
| `/about`, `/shipping`, `/refund` | `About/ShippingPolicy/RefundPolicy.jsx` | Trust content |
| `/login`, `/register` | `Login.jsx`, `Register.jsx` | Firebase email + Google (`POST /auth/firebase`) → JWT |
| `/cart` | `Cart.jsx` | `GET/POST/PUT/DELETE /api/cart` |
| `/checkout` | `Checkout.jsx` | **Pricing/Pay page** — form → create order → Paystack M-Pesa |
| `/orders`, `/orders/:id` | `Orders.jsx`, `OrderDetail.jsx` | `GET /orders/myorders`, `GET /orders/:id` (populated `items.product`) |
| `/wishlist` | `Wishlist.jsx` | Local, auth-gated |
| `/profile` | `Profile.jsx` | Avatar upload `POST /auth/profile/avatar`, name/password `PUT /auth/profile` |
| `/admin` | `admin/Dashboard.jsx` | `GET /admin/stats` |
| `/admin/products`, `/admin/orders` | `ManageProducts.jsx`, `ManageOrders.jsx` | Admin CRUD |
| `*` | `NotFound.jsx` | 404 |

## 5. Actual API (from `apps/backend/src/routes`)

- `POST /api/auth/register, /login, /firebase, GET /me, PUT /profile, POST /profile/avatar`
- `GET /api/products, /featured, /categories, /:id` + `POST/PUT/DELETE` (admin)
- `GET/POST /api/cart, PUT/DELETE /api/cart/:id`
- `POST /api/orders, GET /orders/myorders, GET /orders/:id`
- `GET /api/admin/stats, /orders, /users, POST /products, PUT /products/:id, DELETE, PUT /orders/:id`
- `POST /api/payments/mpesa, GET /verify/:reference, POST /webhook` (Paystack) + legacy `POST /api/mpesa/stkpush` (Daraja)

## 6. Data Model (from `models`)

- **Product** `category enum bags|shoes|jewelry|gifts|accessories|clothes`, `images[]`, `videos[]`, `featured`, `discount`, `discountBanner/Label`, `variants{name,stock}`, timestamps
- **Cart** `user ref User, items[{product ref Product, variant string, quantity}]`
- **Order** `user, items[{product,variant,quantity,price}], shippingAddress{fullName,phone,address,city}, totalPrice, status pending|processing|shipped|delivered|cancelled, isPaid, paidAt, paymentResult{id,status}`
- **User** `name,email,password(hash), isAdmin, avatar`, timestamps + Firebase linkage via `firebaseAdmin`

## 7. Payments

- Provider: **Paystack** (M-Pesa mobile_money `provider: mpesa`, `currency: KES`, `amount*100` kobo). Transport: `Authorization: Bearer sk_test_…` server-only.
- Flow: `Checkout` → `POST /orders` (creates from DB cart) → `POST /payments/mpesa` → STK → `GET /verify/:reference` → webhook → `clearUserCart`.
- Fallback: Till `3175088` instruction when STK fails.

## 8. Tech Stack (actual)

- **Frontend** `apps/frontend`: React 19, Vite 8, Tailwind 4, `@tailwindcss/vite`, `tailwind-merge`, `clsx`, `class-variance-authority`, Radix `@react-dialog/select/separator/slot`, `lucide-react` + `react-icons/gi`, `framer-motion` 12, `GSAP` (Phase 3), `axios` 1.15, `react-router-dom` 7, `sonner`, `firebase` 12. **No** `cloudinary/multer` in browser after Phase 2.
- **Backend** `apps/backend`: Node 18+, Express 5, `mongoose` 9, `firebase-admin` 13, `cloudinary` 1.41 + `multer-storage-cloudinary`, `multer` 2, `bcryptjs`, `jsonwebtoken`, `cors`, `helmet`, `morgan`, `dotenv`, `nodemon`.
- **Monorepo**: npm workspaces `apps/*`, `concurrently`, `run.sh` (bash).

## 9. Non-Goals / Constraints

- No `pnpm/turbo` (neither origin used it).
- No `TYPESCRIPT` — `jsconfig.json` only, `allowJs`.
- No `test` runner yet.
- Live `api.safaricom.co.ke` Daraja path exists but not customer-facing; Paystack is primary.
- Images/videos via Cloudinary; no local upload.

## 10. Success Metrics

- Build passes (`vite build`), both dev servers side-by-side (`concurrently`/`run.sh`).
- No `ShoppingBag` crash, no `fetchCart` undefined, admin not 403 for legitimate `isAdmin`.
- Webhook valid `200`, invalid `401`; missing env `500` not `undefined` HMAC.

---

*This file is generated from code; edit `apps/frontend/src/pages/*` or `models/*` and re-run init to update.*
