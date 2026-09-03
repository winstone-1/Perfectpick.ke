# PerfectPick.ke — Design System

> Auto-generated via `impeccable init` from the actual merged codebase (`apps/frontend/src/index.css`, `App.jsx`, `components/*`, `pages/Checkout.jsx` et al). The perfume mock (Sicilian Bergamot & Fig → terracotta `Jazz Club` + beige `Santal 33`) is the source mood.

## 1. Tokens (from `src/index.css:5-28`)

```css
--font-sans: "Inter", ui-sans-serif
--font-serif: "Playfair Display", ui-serif
--color-primary: #c08050        /* terracotta — Jazz Club */
--color-primary-hover: #9a6340
--color-dark: #3d271a          /* espresso */
--color-medium: #5c3a26
--color-muted: #9a6340
--color-bg: #fdf8f3            /* warm paper */
--color-surface: #f9eede        /* blush */
--color-border: color-mix(#e8c49a 40%, transparent)
--color-footer-bg: #3d271a
--color-footer-text: #f3dcc0
--color-bg-dark: #121212
--color-surface-dark: #1e1e1e
--color-border-dark: #2a2a2a
--radius-lg: 12px; --radius-md: 8px; --radius-sm: 4px
--radius: 0.75rem (base shadcn)
```

Tailwind `@theme` + `@custom-variant dark` → `dark` class toggles via `ThemeContext`. Global `transition-colors 300ms`, `@apply border-color: var(--color-border)`.

Shadcn tokens: `primary 34 45% 53%` (~#c08050), `secondary #f9eede`, `muted #f9eede`, `border 34 50% 85%`.

## 2. Typography

- **Headings:** `Playfair Display` 800 black, `font-serif`. H1 `text-5xl md:text-7xl`, H2 `text-4xl`, H3 `text-3xl`. Uppercase tracking `tracking-[0.3em]` for eyebrows (“Nairobi’s Perfect Pick”), `tracking-widest` for labels.
- **Body:** `Inter` 400/500/600/700. Small caps labels `text-[10px] uppercase font-bold tracking-widest` in `#c08050`.
- **Mono:** Order IDs `font-mono font-black uppercase` + `tracking-tighter`.

## 3. Layout & Radius

- **Container:** `container mx-auto px-4` (or `px-6`), section `py-12 lg:py-20`.
- **Cards:** `rounded-3xl` / `rounded-[2.5rem]` `shadow-xl border-none bg-white` (dark: `bg-white` → surface). Sidebar sticky `top-24`.
- **Buttons:** `@utility btn-primary` → `bg-primary text-white hover:bg-primary-hover rounded-md active:scale-95`; `btn-outline` border-primary; checkout uses `rounded-2xl h-14 font-black`. Ghost variant for navigation.
- **Glass:** `@utility glass` → `bg-white/40 backdrop-blur-md border-white/20`.
- **Inputs:** `h-12 rounded-xl` `border-border/20` focus `ring-primary`.

## 4. Color Usage (from pages)

- **Brand surfaces:** Hero gradient `from-black/65 via-black/30 to-transparent` over video/image; trust cards `bg-surface`; sale banners `bg-dark` with radial `c08050` glow.
- **Status:** pending amber, processing blue, shipped purple, delivered emerald, cancelled red (see `Orders.jsx:10-15`).
- **Pricing:** `text-primary` for totals, `bg-emerald-50/50` for M-Pesa method, `bg-surface border-primary/20` for Till fallback.

## 5. Iconography

- **Lucide** (`ChevronLeft, ShoppingBag, Truck, Smartphone …`) + **react-icons/gi** (`GiHandBag, GiHighHeel, GiNecklace`). Size `16-28`. Thin stroke, `opacity-20` for empty states.
- **Product imagery:** Circular crop on catalog (`rounded-xl aspect-square bg-surface`), circular on Cart (`rounded-2xl overflow-hidden`), `object-cover group-hover:scale-110`.

## 6. Motion (before GSAP polish)

- Existing `framer-motion` for page `Layout: AnimatePresence mode="wait"` keyed by `location.pathname`, card `whileHover y:-5`, entrance `initial opacity 0 y 20`, checkout `AnimatePresence` for payment states (`idle/waiting/fallback/success/failed`) with `scale 0.95→1`.
- **Phase 3 GSAP plan (visual only, no payment logic):**
  - Checkout: staggered entrance of shipping form → M-Pesa card → sidebar via `gsap.from(".checkout-col", {y:20, opacity:0, stagger:0.12})`; button `active:scale-95` + `gsap.to` pulse on `waiting` spinner; success check `gsap.from("#success-check", {scale:0})`.
  - Landing: already has `Framer` hero; add GSAP `ScrollTrigger` for categories parallax.
  - Respect `prefers-reduced-motion`.

## 7. Checkout / Pricing Page — Target (mock → code)

- **Mock:** 3 phones: filter → detail → cart. Warm beige cards, bottom pill nav (`home/heart/clock/bag/user`), circular product chips, black ` $165 · ADD TO CART` / ` $488 · CHECKOUT`.
- **Code today:** `Checkout.jsx` two-column: left shipping + M-Pesa states, right sticky order summary (`total` in primary). States: `idle` (Till hint), `waiting` (spinner), `fallback` (large `tillNumber` + 4-step how-to), `success` (`CheckCircle2`), `failed`. Uses `motion.div key={paymentStatus}` already.
- **Polish checklist for GSAP:**
  1. Add `gsap` + `ScrollTrigger` via `npm add gsap`, register `useLayoutEffect`.
  2. Wrap cols with `class checkout-col`, stagger.
  3. Animate fallback Till number counting.
  4. Keep payment logic untouched — only `paymentStatus` visual transitions.

## 8. Component Library (`components/ui`)

- `button.jsx` (`Slot` from `@radix-ui/react-slot`), `badge`, `card`, `dialog` (`@radix-ui/react-dialog`), `select`, `separator`, `input`, `skeleton`.
- `ProductCard` hover, wishlisted heart `fill-red-500`, featured badge.
- `Navbar` dark, `Footer` `bg-footer-bg text-footer-text`, `Theme` toggle.

## 9. Dark Mode

- Toggle via `ThemeContext`, `.dark` variant overrides `bg`/`surface`/`border` to `#121212/#1e1e1e/#2a2a2a`, text `#ffffff`.

## 10. Do & Don’t

- **Do:** Use `cn(twMerge)` for variants, `rounded-2xl/3xl`, `c08050` for primary actions, `Playfair` for prices/headers.
- **Don’t:** Don’t introduce new palette or `Helvetica`; don’t touch `paymentController.js` or `PAYSTACK_*` in polish phase; don’t hardcode Till number outside env.

---

*Regenerate after each polish page: `impeccable polish --page checkout` will diff only visual layers.*
