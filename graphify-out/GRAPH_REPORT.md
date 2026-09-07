# Graph Report - PerfectPick  (2026-09-06)

## Corpus Check
- 118 files · ~92,619 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 732 nodes · 1618 edges · 49 communities (36 shown, 12 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `10737a38`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.jsx
- frontend/package.json
- install.ps1
- PerfectPick UI/UX Refinement Report
- adminRoutes.js
- Package Info
- backend/package.json
- Component Aliases
- dependencies
- productRoutes.js
- authRoutes.js
- paymentController.js
- dependencies
- paymentRoutes.js
- index.js
- cartRoutes.js
- mpesaRoutes.js
- Accessibility Widget
- JS Config
- Graphify Plugin
- Vercel Rewrites
- Run Script
- What You Must Do When Invoked
- Perfect Pick
- devDependencies
- PerfectPick.ke — Design System
- Fixed in this commit (flagged, not silent)
- Legend
- PerfectPick.ke — Product Definition
- PerfectPick.ke — Monorepo
- graphify reference: extra exports and benchmark
- firebase.js
- vite.config.js
- graphify reference: query, path, explain
- scripts
- i18n.js
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- opencode.json
- AGENTS.md
- rules/graphify.md
- workflows/graphify.md
- CLAUDE.md
- .claude/CLAUDE.md
- extraction-spec.md

## God Nodes (most connected - your core abstractions)
1. `cn()` - 56 edges
2. `react` - 45 edges
3. `lucide-react` - 31 edges
4. `framer-motion` - 29 edges
5. `react-router-dom` - 28 edges
6. `Write-Info()` - 28 edges
7. `Button()` - 27 edges
8. `Write-Warn()` - 25 edges
9. `Write-Success()` - 24 edges
10. `useAuth()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Test-SystemNodeReady()` --calls--> `node`  [INFERRED]
  install.ps1 → package.json
- `CardDescription()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/components/ui/card.jsx → apps/frontend/src/lib/utils.js
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/components/ui/card.jsx → apps/frontend/src/lib/utils.js
- `DialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/components/ui/dialog.jsx → apps/frontend/src/lib/utils.js
- `DialogDescription()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/components/ui/dialog.jsx → apps/frontend/src/lib/utils.js

## Import Cycles
- None detected.

## Communities (49 total, 12 thin omitted)

### Community 0 - "App.jsx"
Cohesion: 0.07
Nodes (93): api, BackToTop(), ChatWidget(), DarkModeToggle(), Footer(), Layout(), logoModules, Navbar() (+85 more)

### Community 1 - "frontend/package.json"
Cohesion: 0.10
Nodes (21): axios, name, private, type, version, class-variance-authority, clsx, eslint (+13 more)

### Community 2 - "install.ps1"
Cohesion: 0.06
Nodes (96): Clear-ElectronBuildCache(), Complete-VenvTransaction(), ConvertTo-LongPath(), ConvertTo-NpmVersion(), Copy-ConfigTemplates(), Discard-LockfileChurn(), _Drain-NewLines(), Ensure-NodeExeOnPath() (+88 more)

### Community 3 - "PerfectPick UI/UX Refinement Report"
Cohesion: 0.06
Nodes (30): 1.1 Home.jsx - Inflated Customer Stats, 1.2 Home.jsx - Fake Review Star Ratings on Testimonials, 1.3 About.jsx - Incorrect Founding Year, 1.4 Localization Files - CTA Inflated Customer Count, 2.1 Missing Kiswahili Support on Key Pages, 2.2 Translations Added, 2.3 Components Updated to Use Translations, 2.4 localStorage Persistence Verification (+22 more)

### Community 4 - "adminRoutes.js"
Cohesion: 0.10
Nodes (25): createProduct(), deleteProduct(), getOrders(), getStats(), getUsers(), updateOrderStatus(), updateProduct(), adminOnly() (+17 more)

### Community 5 - "Package Info"
Cohesion: 0.09
Nodes (22): description, devDependencies, concurrently, engines, node, npm, name, packageManager (+14 more)

### Community 6 - "backend/package.json"
Cohesion: 0.09
Nodes (21): author, description, devDependencies, nodemon, axios, keywords, license, main (+13 more)

### Community 7 - "Component Aliases"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 8 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, axios, class-variance-authority, clsx, firebase, framer-motion, gsap, i18next (+13 more)

### Community 9 - "productRoutes.js"
Cohesion: 0.28
Nodes (10): createProduct(), deleteProduct(), getCategories(), getCategoryGroups(), getFeaturedProducts(), getProductById(), getProducts(), updateProduct() (+2 more)

### Community 10 - "authRoutes.js"
Cohesion: 0.32
Nodes (9): firebaseLogin(), generateToken(), getUserProfile(), loginUser(), registerUser(), updateUserProfile(), admin(), protect() (+1 more)

### Community 11 - "paymentController.js"
Cohesion: 0.17
Nodes (19): addOrderItems(), clearUserCart(), getMyOrders(), getOrderById(), decrementStockForOrder(), getChargeStatus(), handlePaystackWebhook(), initiateMpesaPayment() (+11 more)

### Community 12 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, axios, bcryptjs, cloudinary, cors, dotenv, express, express-rate-limit (+7 more)

### Community 13 - "paymentRoutes.js"
Cohesion: 0.14
Nodes (13): ALL_CATEGORIES, CATEGORY_GROUPS, buildSystemPrompt(), chatWithPia(), authLimiter, chatLimiter, orderCreateLimiter, paymentInitLimiter (+5 more)

### Community 14 - "index.js"
Cohesion: 0.18
Nodes (9): allowedOrigins, app, forceFlag, connectDB(), products, router, router, dotenv (+1 more)

### Community 15 - "cartRoutes.js"
Cohesion: 0.31
Nodes (8): addToCart(), clearCart(), getCart(), removeFromCart(), updateCartItem(), Cart, cartSchema, router

### Community 16 - "mpesaRoutes.js"
Cohesion: 0.50
Nodes (6): getAccessToken(), getTimestamp(), mpesaCallback(), queryStkStatus(), stkPush(), router

### Community 17 - "Accessibility Widget"
Cohesion: 0.38
Nodes (6): AccessibilityWidget(), FONT_LABELS, FONT_SIZES, FONT_STEPS, load(), save()

### Community 18 - "JS Config"
Cohesion: 0.50
Nodes (3): compilerOptions, baseUrl, paths

### Community 23 - "What You Must Do When Invoked"
Cohesion: 0.07
Nodes (26): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+18 more)

### Community 24 - "Perfect Pick"
Cohesion: 0.12
Nodes (16): Admin Powerhouse, Backend, Frontend, Getting Started, Installation, Key Features, License, Localized Payments (+8 more)

### Community 25 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, tailwindcss, @tailwindcss/vite (+4 more)

### Community 26 - "PerfectPick.ke — Design System"
Cohesion: 0.17
Nodes (11): 10. Do & Don’t, 1. Tokens (from `src/index.css:5-28`), 2. Typography, 3. Layout & Radius, 4. Color Usage (from pages), 5. Iconography, 6. Motion (GSAP polish — implemented), 7. Checkout / Pricing Page — Target (mock → code) (+3 more)

### Community 27 - "Fixed in this commit (flagged, not silent)"
Cohesion: 0.17
Nodes (11): Fixed in this commit (flagged, not silent), Manual Checklist Before Production Keys, Other notes, Paystack Integration — Security Review (Phase 2), [S1] Webhook signature — raw body — FIXED, [S2] Missing env guard — FIXED (partial), [S3] CORS over-permissive — FLAGGED (not fixed, needs manual review), [S4] JWT long expiry + missing secret — FLAGGED (+3 more)

### Community 28 - "Legend"
Cohesion: 0.17
Nodes (11): A. Build / Deploy / Config (P0), B. Auth (P0/P1), C. Cart (P0), D. Checkout / Orders (P0 — non-payment part + payment contract), E. Wishlist (P1), F. Products / Catalog (P1), G. Admin (P1), H. Misc / UX (P2) (+3 more)

### Community 29 - "PerfectPick.ke — Product Definition"
Cohesion: 0.17
Nodes (11): 10. Success Metrics, 1. Vision, 2. Who It’s For, 3. Core Jobs-To-Be-Done, 4. Actual Pages (from `apps/frontend/src/pages`), 5. Actual API (from `apps/backend/src/routes`), 6. Data Model (from `models`), 7. Payments (+3 more)

### Community 30 - "PerfectPick.ke — Monorepo"
Cohesion: 0.18
Nodes (10): Backend (`apps/backend/.env`), Environment, Frontend (`apps/frontend/.env`), License, PerfectPick.ke — Monorepo, Phase 1 Note, Prerequisites, Quick Start (+2 more)

### Community 31 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 32 - "firebase.js"
Cohesion: 0.33
Nodes (5): app, auth, firebaseConfig, googleProvider, storage

### Community 33 - "vite.config.js"
Cohesion: 0.33
Nodes (5): __dirname, __filename, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 34 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 35 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 36 - "i18n.js"
Cohesion: 0.40
Nodes (3): App(), i18next, i18next-browser-languagedetector

### Community 37 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 38 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 39 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **272 isolated node(s):** `$schema`, `plugin`, `app`, `allowedOrigins`, `name` (+267 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 308 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.jsx` to `frontend/package.json`, `i18n.js`, `Accessibility Widget`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `frontend/package.json`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `express` connect `paymentRoutes.js` to `adminRoutes.js`, `backend/package.json`, `productRoutes.js`, `authRoutes.js`, `paymentController.js`, `index.js`, `cartRoutes.js`, `mpesaRoutes.js`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `$schema`, `plugin`, `app` to the rest of the system?**
  _272 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06808510638297872 - nodes in this community are weakly interconnected._
- **Should `frontend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09881422924901186 - nodes in this community are weakly interconnected._
- **Should `install.ps1` be split into smaller, more focused modules?**
  _Cohesion score 0.0586997685672207 - nodes in this community are weakly interconnected._