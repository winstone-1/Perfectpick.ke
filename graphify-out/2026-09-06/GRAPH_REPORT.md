# Graph Report - PerfectPick  (2026-09-06)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 422 nodes · 1095 edges · 23 communities (19 shown, 3 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.85)
- Token cost: 848 input · 211 output

## Graph Freshness
- Built from commit: `6f3d34f8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Auth Middleware
- Frontend Config
- UI Components
- UI Elements
- Admin Functions
- Package Info
- Backend Config
- Component Aliases
- Dependencies
- Product Management
- Auth Functions
- Order Management
- Backend Dependencies
- App Entry
- Database Seeder
- Cart Functions
- Mpesa Functions
- Accessibility Widget
- JS Config
- Graphify Plugin
- Vercel Rewrites
- Run Script

## God Nodes (most connected - your core abstractions)
1. `cn()` - 56 edges
2. `react` - 45 edges
3. `lucide-react` - 31 edges
4. `framer-motion` - 29 edges
5. `react-router-dom` - 28 edges
6. `Button()` - 27 edges
7. `useAuth()` - 21 edges
8. `api` - 19 edges
9. `Card()` - 14 edges
10. `CardContent()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Navbar()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/components/Navbar.jsx → apps/frontend/src/lib/utils.js
- `ProductCard()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/components/ProductCard.jsx → apps/frontend/src/lib/utils.js
- `AdminDashboard()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/pages/admin/Dashboard.jsx → apps/frontend/src/lib/utils.js
- `NewArrivals()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/pages/NewArrivals.jsx → apps/frontend/src/lib/utils.js
- `OrderDetail()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/pages/OrderDetail.jsx → apps/frontend/src/lib/utils.js

## Import Cycles
- None detected.

## Communities (23 total, 3 thin omitted)

### Community 0 - "Auth Middleware"
Cohesion: 0.07
Nodes (44): App(), DarkModeToggle(), logoModules, Navbar(), ProductCard(), ProtectedRoute(), ScrollToTop(), app (+36 more)

### Community 1 - "Frontend Config"
Cohesion: 0.05
Nodes (44): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, tailwindcss, @tailwindcss/vite (+36 more)

### Community 2 - "UI Components"
Cohesion: 0.22
Nodes (21): api, BackToTop(), ChatWidget(), Footer(), Layout(), Button(), buttonVariants, Card() (+13 more)

### Community 3 - "UI Elements"
Cohesion: 0.11
Nodes (32): Badge(), badgeVariants, CardAction(), CardDescription(), Dialog(), DialogContent(), DialogDescription(), DialogFooter() (+24 more)

### Community 4 - "Admin Functions"
Cohesion: 0.11
Nodes (22): createProduct(), deleteProduct(), getOrders(), getStats(), getUsers(), updateOrderStatus(), updateProduct(), adminOnly() (+14 more)

### Community 5 - "Package Info"
Cohesion: 0.09
Nodes (22): description, devDependencies, concurrently, engines, node, npm, name, packageManager (+14 more)

### Community 6 - "Backend Config"
Cohesion: 0.10
Nodes (19): author, description, devDependencies, nodemon, axios, keywords, license, main (+11 more)

### Community 7 - "Component Aliases"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 8 - "Dependencies"
Cohesion: 0.11
Nodes (18): dependencies, axios, class-variance-authority, clsx, firebase, framer-motion, gsap, lucide-react (+10 more)

### Community 9 - "Product Management"
Cohesion: 0.21
Nodes (11): ALL_CATEGORIES, CATEGORY_GROUPS, createProduct(), deleteProduct(), getCategories(), getCategoryGroups(), getFeaturedProducts(), getProductById() (+3 more)

### Community 10 - "Auth Functions"
Cohesion: 0.26
Nodes (12): firebaseLogin(), generateToken(), getUserProfile(), loginUser(), registerUser(), updateUserProfile(), admin(), protect() (+4 more)

### Community 11 - "Order Management"
Cohesion: 0.26
Nodes (11): addOrderItems(), clearUserCart(), getMyOrders(), getOrderById(), getChargeStatus(), handlePaystackWebhook(), initiateMpesaPayment(), normalizePhoneNumber() (+3 more)

### Community 12 - "Backend Dependencies"
Cohesion: 0.14
Nodes (14): dependencies, axios, bcryptjs, cloudinary, cors, dotenv, express, firebase-admin (+6 more)

### Community 13 - "App Entry"
Cohesion: 0.17
Nodes (10): allowedOrigins, app, router, router, router, router, router, router (+2 more)

### Community 14 - "Database Seeder"
Cohesion: 0.24
Nodes (5): connectDB(), products, cartSchema, dotenv, mongoose

### Community 15 - "Cart Functions"
Cohesion: 0.39
Nodes (7): addToCart(), clearCart(), getCart(), removeFromCart(), updateCartItem(), Cart, router

### Community 16 - "Mpesa Functions"
Cohesion: 0.50
Nodes (6): getAccessToken(), getTimestamp(), mpesaCallback(), queryStkStatus(), stkPush(), express

### Community 17 - "Accessibility Widget"
Cohesion: 0.38
Nodes (6): AccessibilityWidget(), FONT_LABELS, FONT_SIZES, FONT_STEPS, load(), save()

### Community 18 - "JS Config"
Cohesion: 0.50
Nodes (3): compilerOptions, baseUrl, paths

## Knowledge Gaps
- **138 isolated node(s):** `logoModules`, `app`, `firebaseConfig`, `storage`, `AuthContext` (+133 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 152 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `UI Components` to `Auth Middleware`, `Frontend Config`, `UI Elements`, `Accessibility Widget`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Dependencies` to `Frontend Config`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `express` connect `Mpesa Functions` to `Admin Functions`, `Backend Config`, `Product Management`, `Auth Functions`, `Order Management`, `App Entry`, `Cart Functions`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `logoModules`, `app`, `firebaseConfig` to the rest of the system?**
  _138 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth Middleware` be split into smaller, more focused modules?**
  _Cohesion score 0.07205513784461152 - nodes in this community are weakly interconnected._
- **Should `Frontend Config` be split into smaller, more focused modules?**
  _Cohesion score 0.04717853839037928 - nodes in this community are weakly interconnected._
- **Should `UI Elements` be split into smaller, more focused modules?**
  _Cohesion score 0.11205073995771671 - nodes in this community are weakly interconnected._