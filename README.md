# PerfectPick.ke — Monorepo

Nairobi's premier destination for luxury fragrances. Monorepo containing:

- `apps/frontend` — React 19 + Vite (Tailwind, Framer Motion, Radix UI) — originally `winstone-1/Perfectpick.ke`
- `apps/backend` — Node.js + Express REST API (MongoDB, Firebase Admin, Cloudinary, Paystack) — originally `winstone-1/Antigravity-Server-`

## Structure

```
PerfectPick/
├── apps/
│   ├── frontend/   # Vite React app (port 5173)
│   └── backend/    # Express API (port 3000)
├── package.json    # npm workspaces + root scripts
├── run.sh          # start both apps
└── .gitignore
```

## Prerequisites

- Node.js >=18, npm >=9
- MongoDB Atlas URI
- Firebase project (Admin SDK JSON + web config)
- Cloudinary account
- Paystack sandbox keys (do NOT commit)

## Quick Start

```bash
# install all workspaces
npm run install:all
# or
npm install
npm install --workspaces

# configure env (see examples)
cp apps/frontend/.env.example apps/frontend/.env
cp apps/backend/.env.example apps/backend/.env
# edit both .env files

# run both apps side-by-side
npm run dev          # uses concurrently
# or
./run.sh             # bash script (Windows Git Bash)
# or individually
npm run dev:frontend # http://localhost:5173
npm run dev:backend  # http://localhost:3000
```

## Environment

### Frontend (`apps/frontend/.env`)

```
VITE_API_URL=http://localhost:3000/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Backend (`apps/backend/.env`)

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FIREBASE_STORAGE_BUCKET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL_PROD=
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
MPESA_TILL_NUMBER=3175088
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=https://example.com/api/mpesa/callback
```

**Security:** `.env` is gitignored at root and per-app. Never commit keys.

## Workspaces

This repo uses npm workspaces (`apps/*`). No pnpm/turborepo — neither original repo used them, so none introduced.

- Root `concurrently` runs both dev servers
- Frontend: `vite` on 5173, proxies to `VITE_API_URL`
- Backend: `nodemon` on 3000, CORS allows `localhost:5173` + vercel domains

## Phase 1 Note

Merged via zip download (network-limited git clone would timeout after 7+ min for 44MB frontend). Content is 1:1 from `main` branches at merge time. Single commit: `chore: merge frontend/backend into monorepo`.

## License

MIT
