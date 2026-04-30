# Mobile App & POS Kiosk Experiences — Design

**Status:** Approved 2026-04-30
**Project:** domdemo (Domino's Segment demo)
**Author:** Segment SE demo build

---

## 1. Goal

Add two new end-to-end experiences to the existing Next.js 16 demo site so a Segment Solutions Engineer can tell a single "one customer, three surfaces" story across:

1. **Web** — the current responsive site (unchanged URLs, light refactor only).
2. **Mobile app** — a polished native-app-feeling shell at `/m/*`, wrapped in a desktop device frame so it reads as "the app" during screen-shares.
3. **POS kiosk** — a fullscreen, big-button, landscape in-store ordering kiosk at `/kiosk/*`, starting from an idle attract screen.

All three share the same Segment event taxonomy, persistent client-side state (cart, audiences, journey, identity), and persona-based demo controls, so flipping between modes tells one continuous story instead of three disconnected demos.

## 2. Non-goals

- Building a separate monorepo (explicitly rejected — it's a demo).
- Moving cart or Segment state into Neon (existing Zustand `persist` + `localStorage` ring buffer is sufficient for a same-browser demo).
- Real-money payment integration on kiosk.
- PWA / native wrapper / mobile app store packaging.
- OTP / phone-scan auth on kiosk (stays as a cosmetic persona picker).
- New Segment connector infrastructure or server-side pipeline work.

## 3. Constraints

- **Single Next.js 16 App Router project.** No monorepo.
- **Single Vercel deployment.** No additional projects or domains.
- **Existing env vars only:** `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_SEGMENT_WRITE_KEY`. No new marketplace integrations.
- **No new external services.** Neon + better-auth + Segment Analytics.js only.
- **App Router file-tree conventions.** `layout.tsx`, `page.tsx`, route groups `(web)`, dynamic segments, no `pages/`.
- **This is not the Next.js you know** — per `AGENTS.md`, check `node_modules/next/dist/docs/` before using APIs that differ from training-data defaults.
- **No new test runner.** Verification is manual + `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## 4. Architecture

### 4.1 Route groups

Three Next.js App Router **route groups**, each with its own `layout.tsx`:

- `src/app/(web)/` — today's site, moved into a group layout that owns `<Header/>`, `<DeliveryBanner/>`, `<CartDrawer/>`, `<Footer/>`. URLs are **unchanged** (`/`, `/menu`, `/cart`, `/checkout`, `/deals`, `/store-locator`, `/order-tracker`, `/account`, `/account/*`, `/product/[slug]`, `/login`, `/register`).
- `src/app/m/` — mobile app. Layout renders `<MobileDeviceFrame><MobileAppShell>{children}</MobileAppShell></MobileDeviceFrame>` with persistent bottom tab bar.
- `src/app/kiosk/` — kiosk. Layout renders `<KioskDeviceFrame><KioskIdleWatchdog>{children}</KioskIdleWatchdog></KioskDeviceFrame>` with no page chrome.

`src/app/layout.tsx` (the root) is **unchanged** — it already mounts `<AnalyticsProvider>` and `<SegmentProvider>`, both of which must wrap every shell so the demo overlays (toolbar, FAB, inspector, nudges) render on all three experiences.

### 4.2 Shared primitives (reused as-is)

- `src/stores/cart-store.ts` — single cart, single localStorage key (`dominos-cart`), shared across all shells.
- `src/stores/segment-store.ts` — single event log, audiences, journey, identity, computed traits. Already persisted via `persist` middleware.
- `src/stores/ui-store.ts` — delivery method, selected store.
- `src/stores/order-store.ts` — unchanged.
- `src/lib/segment/bus.ts` — `analytics` wrapper; **extended** to add `context.app.name` + `source` from `window.location.pathname`. Call sites are not touched.
- `src/lib/segment/personas.ts` — unchanged persona definitions; consumed by both toolbar and kiosk persona picker.
- `src/lib/segment/audiences.ts`, `journey.ts`, `storage.ts`, `types.ts` — unchanged.
- `src/lib/analytics/events.ts` — every `trackX()` helper continues to work verbatim. One new helper: `trackKioskSessionStarted()`.
- `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/app/api/auth/[...all]/route.ts` — unchanged. Mobile login uses `authClient` same as web.
- `src/data/menu.json`, `src/data/stores.json` — unchanged; all shells consume directly.
- `src/app/api/orders/*`, `src/app/api/stores/route.ts`, `src/app/api/coupons/validate/*` — unchanged; mobile and kiosk both POST to the same endpoints.

### 4.3 Mode-specific components (new)

Split by responsibility, not by technical layer. Mobile and kiosk do **not** reuse the existing web `<ProductCard/>`, `<HeroCarousel/>`, `<CategoryNav/>`, etc. verbatim — the visual languages are too different and conditional branches would bloat shared components.

**Mobile (`src/components/mobile/`):**

- `mobile-device-frame.tsx` — 420×844 desktop bezel wrapper; bypassed on `(pointer: coarse) and (max-width: 640px)` or when `ui-store.frameEnabled === false`.
- `mobile-app-shell.tsx` — sticky top mini-bar + children slot + bottom tab bar, with stacked-route detection.
- `mobile-tab-bar.tsx` — 5 tabs (Home / Menu / Offers / Orders / Account), active indicator.
- `mobile-top-bar.tsx` — store/delivery chip + search + notifications bell.
- `mobile-home.tsx` — composed home content: personalization banner + hero card + reorder strip + deals carousel + popular list + scan-QR footer.
- `mobile-menu.tsx` — category chips scroller + list of `<MobileProductCard/>`.
- `mobile-product-card.tsx` — list card with full-bleed photo, name/price, `+` add button.
- `mobile-category-chips.tsx` — horizontal-scrolling category selector.
- `mobile-product-detail.tsx` — slide-up full-screen product detail with size/crust selectors.
- `mobile-offers.tsx` — deals list + pinned next-best-offer card.
- `mobile-orders.tsx` — past orders list; gated by session; uses `/api/orders`.
- `mobile-account.tsx` — signed-in profile or signed-out CTA; uses `authClient.useSession()`.
- `mobile-cart.tsx` — fullscreen cart review.
- `mobile-checkout.tsx` — single-scroll checkout form with sticky footer.
- `mobile-login.tsx` — mobile-styled wrapper around existing `<LoginForm/>`.

**Kiosk (`src/components/kiosk/`):**

- `kiosk-device-frame.tsx` — 1280×800 landscape bezel wrapper, toggleable.
- `kiosk-idle-watchdog.tsx` — 90-second inactivity timer → `/kiosk` + `analytics.reset()` + `clearCart()`.
- `kiosk-attract-screen.tsx` — fullscreen animated gradient, "TAP TO ORDER" headline, QR card.
- `kiosk-persona-picker.tsx` — sheet launched from QR card; lists personas from `lib/segment/personas.ts`; calls `persona.seed()` + routes to `/kiosk/menu`.
- `kiosk-category-rail.tsx` — left column of big category tiles.
- `kiosk-menu-grid.tsx` — right column 3-col product grid.
- `kiosk-product-tile.tsx` — big square image + name + "from $X" + "Add" button.
- `kiosk-product-detail.tsx` — fullscreen sheet with size/crust selectors + quantity + sticky "Add to cart" footer.
- `kiosk-number-pad.tsx` — big-touch numeric pad for quantity entry.
- `kiosk-cart-review.tsx` — fullscreen two-pane cart.
- `kiosk-checkout.tsx` — pay-at-counter vs pay-by-card choice + mock terminal animation.
- `kiosk-thanks.tsx` — order number + phone-tracker QR + 10-second countdown → `/kiosk`.
- `kiosk-top-chrome.tsx` — tiny store chip (top-left) + "Start over" button (top-right); hidden on attract.
- `kiosk-progress-dots.tsx` — breadcrumb dots for Menu / Cart / Pay / Done.

### 4.4 DemoToolbar extensions

`src/components/segment/demo-toolbar.tsx` is the single place the operator controls the demo. Additions (inserted above existing "Overlays"):

- **Mode switcher** — segmented control with three buttons: Web / Mobile / Kiosk. Derives active mode from `usePathname()` (`/m*` → mobile, `/kiosk*` → kiosk, else web). Click → `router.push('/')` / `router.push('/m')` / `router.push('/kiosk')`.
- **Frame toggle** — switch for "Show device frame" (default ON on desktop). Writes to `ui-store.frameEnabled`.

All other existing sections (Overlays, Load Persona, Reset) stay where they are.

## 5. Routing

### 5.1 Web (unchanged URLs)

```
/                       home
/menu                   menu
/product/[slug]         product detail
/cart                   cart
/checkout               checkout
/deals, /store-locator, /order-tracker
/account, /account/orders, /account/addresses, /account/loyalty
/login, /register
```

One refactor: page files stop importing `<Header/>`, `<DeliveryBanner/>`, `<CartDrawer/>`, `<Footer/>` individually — those move into `src/app/(web)/layout.tsx`. No URL or behavior change.

### 5.2 Mobile (`/m/*`)

```
/m                      Home tab
/m/menu                 Menu tab
/m/offers               Offers tab
/m/orders               Orders tab
/m/account              Account tab
/m/product/[slug]       stacked product detail
/m/cart                 stacked cart review
/m/checkout             stacked checkout
/m/login, /m/register   stacked auth
/m/order/[id]           stacked order tracker
```

Tab bar is visible on the five tab routes and hidden on stacked routes. Stacked routes show a back chevron + title in place of the mini-bar.

### 5.3 Kiosk (`/kiosk/*`)

```
/kiosk                  attract screen
/kiosk/menu             category rail + product grid
/kiosk/product/[slug]   product detail sheet
/kiosk/cart             cart review
/kiosk/checkout         pay flow
/kiosk/thanks           confirmation + auto-return
```

No auth URL — kiosk identification happens inline on `/kiosk` via persona picker sheet.

## 6. Data flow & state continuity

### 6.1 Cross-mode continuity (same browser)

Existing Zustand `persist` middleware already writes all three stores to `localStorage`:

- `dominos-cart` — cart contents.
- `segment-demo-ui` — identity, traits, audiences, journey, computed traits, demo-mode flag, inspector tab.
- `dominos-ui` — delivery method, selected store.

Switching `/` → `/m` → `/kiosk` rehydrates from `localStorage` automatically. No additional plumbing needed for single-browser demos.

### 6.2 Cross-tab continuity (three windows side-by-side)

`segment-store` already uses a `BroadcastChannel` (`segment-demo-events`) to mirror events across tabs. Extend the same pattern to cart:

- Add `setupCartBroadcast()` helper (new) in `src/lib/segment/cart-broadcast.ts` that opens a `dominos-cart-sync` channel.
- Mount it from `<SegmentProvider>`. On cart changes → postMessage a `{ type: "cart", items, coupon }` payload. On receive → `useCartStore.setState(...)` (skip echo of own messages using a generated client id).

This makes "add to cart on mobile → watch the kiosk tab update" work live during demos.

### 6.3 Event source attribution

`src/lib/segment/bus.ts:buildContextProperties()` already reads `window.location.pathname`. Extend to set:

- `context.app.name`: `"Dominos Web"` / `"Dominos Mobile"` / `"Dominos Kiosk"`
- `properties.source`: `"web"` / `"mobile"` / `"kiosk"`

Computed from `pathname`:

```
/m* → mobile
/kiosk* → kiosk
else → web
```

Every existing `trackX()` helper inherits this — zero call-site changes.

### 6.4 Identity across shells

- **Web:** existing `authClient` + `<AuthGuard/>`. Persona loader in toolbar fires `analytics.identify()` + seeds cart.
- **Mobile:** same `authClient`. `/m/login` uses existing `<LoginForm/>`. Success → `router.push('/m')`. Sign-in triggers the same `identify` through better-auth.
- **Kiosk:** persona picker is cosmetic — calls `persona.seed()` directly (no better-auth session). Kiosk never calls `authClient.signIn()`. This is the intended demo story: "kiosk recognizes scanned loyalty QR" without real OTP.

### 6.5 Persona seeding in Neon

One-time idempotent seed script: `scripts/seed-demo-users.mjs`.

- Inserts four `better-auth` users (matching IDs from `PERSONAS` in `lib/segment/personas.ts`) with password `demo1234`:
  - `sarah.vip@dominosdemo.com` (VIP)
  - `dan.abandoner@dominosdemo.com` (Cart Abandoner)
  - `alex.deals@dominosdemo.com` (Deal Hunter)
  - `jamie.new@dominosdemo.com` (New Visitor)
- Seeds `orders`, `order_items`, `loyalty_accounts`, `saved_addresses` tables with realistic history per persona (VIP = 12 orders, Cart Abandoner = 0, etc.).
- Re-runnable: `ON CONFLICT DO NOTHING` on user creation, deterministic order IDs so repeat runs don't duplicate.
- Usage (local): `node scripts/seed-demo-users.mjs`. Usage (prod): run once against Vercel's `DATABASE_URL` from a laptop.

Mobile `/m/login` gets a small "Demo accounts" expandable below the form with the four emails + a "Use this" tap that fills email/password. The password-entry step is intentional — it demonstrates real auth.

## 7. Visual & interaction specs

### 7.1 Mobile app

- **Frame:** 420×844 device bezel on desktop, dark pill-cornered surround, subtle status bar (9:41, signal, battery). Bypassed on touch ≤640px.
- **Palette:** off-white base, Domino's red (`--dominos-red`) as accent, subtle blue for chips/links. Different from web's navy-dominant bar.
- **Top mini-bar:** 44px, sticky. Left: store/delivery chip. Right: search + bell icons.
- **Bottom tab bar:** 60px + safe-area padding, 5 tabs, active tab gets red pill + label.
- **Stacked transitions:** framer-motion slide-up (0.28s ease-out), back gesture from left edge.
- **Home composition:** personalization banner → hero card → "Reorder" strip (last 3 persona products if signed in) → "Today's Deals" horizontal carousel → "Popular" list → scan-QR footer card.
- **Menu:** sticky category chips, infinite list, large touch cards (`~120px` tall).
- **Touch targets:** minimum 44px.

### 7.2 Kiosk

- **Frame:** 1280×800 landscape bezel on desktop, dark surround simulating a vertical floor-standing kiosk.
- **Palette:** Domino's navy → red gradient on attract; white base with red accents on order flow.
- **Attract:** centered logo, "TAP TO ORDER" headline with pulse animation, subtitle "Fresh. Fast. Fired up.", corner QR card "Scan for VIP rewards". Tap anywhere → `/kiosk/menu` (guest). Tap QR → persona picker.
- **Top chrome (on all non-attract screens):** muted store chip top-left, "Start over" button top-right (white pill with red X).
- **Progress dots:** bottom-center on Menu / Cart / Pay / Done.
- **Buttons:** ≥56px tall, ≥20pt text, generous padding.
- **Idle watchdog:** 90s inactivity → `/kiosk` + `analytics.reset()` + `clearCart()`. Any pointer/touch/scroll/key resets timer.
- **Pay flow:** two big tap targets — pay at counter (fake order number) or pay by card (2-second inserted-card animation → success). Both POST `/api/orders`.
- **Thanks screen:** order number + ETA + phone-tracker QR + 10-second countdown → attract.

### 7.3 DemoToolbar mode switcher

- Segmented control, 3 buttons, equal width.
- Icons + labels: 🖥 Web / 📱 Mobile / 🏪 Kiosk.
- Active state: filled red background, white text.
- Keyboard accessible.

## 8. Analytics event additions

No existing events are renamed. Three additions:

- **`trackKioskSessionStarted({ identified, persona_id? })`** — fired on `/kiosk` → `/kiosk/menu` transition.
- **`trackKioskIdleReset()`** — fired when idle watchdog fires.
- **`trackModeSwitched({ from, to })`** — fired from the demo toolbar mode switcher.

All `track*` helpers live in `src/lib/analytics/events.ts`.

Every event also now carries `context.app.name` + `properties.source` auto-computed in the bus (see §6.3).

## 9. Verification plan

No automated test runner exists. Verification is:

1. `npx tsc --noEmit` — passes.
2. `npm run lint` — passes.
3. `npm run build` — passes.
4. Manual demo-narrative run:
   1. `npm run dev`.
   2. Open `/`, `/m`, `/kiosk` in three browser windows side-by-side.
   3. From the web window's DemoToolbar, load "Sarah VIP".
   4. Confirm `/m` shows her reorder strip; `/kiosk` attract, when tapped through, loads into an already-identified session.
   5. Add a Meat Lovers on `/m/menu` — confirm cart count updates in `/` and `/kiosk` windows.
   6. Drive checkout from `/kiosk` — confirm an order row lands in Neon and shows up under `/account/orders` and `/m/orders`.
   7. Open Event Inspector on any shell — confirm `context.app.name` correctly tags events per source.
   8. Trigger idle timeout on kiosk (wait 90s or shrink timer during dev) — confirm attract screen returns + `analytics.reset()` fired.
   9. Click "Reset demo state" in toolbar — confirm all three shells return to anonymous/empty.
5. Deploy preview on Vercel — repeat steps 4.2–4.9 on the deployed URL.

## 10. Risks & tradeoffs

- **Component duplication.** Mobile and kiosk tiles/cards don't reuse web counterparts. Accepted: the visual languages are different enough that conditional branches would hurt maintainability more. Each new component stays <200 lines.
- **No real kiosk auth.** Q7b explicitly chose cosmetic persona picker over OTP for demo speed. Risk: SE may need to explain on stage that "in production this is a scanned loyalty QR." Acceptable.
- **Broadcast-channel cart sync** could show stale cart if one tab is suspended. Acceptable for demo; a fresh render on tab focus mitigates.
- **Layout refactor for (web) group** touches every existing page. Risk of regressions. Verified by the existing manual flows in §9.

## 11. Open questions

None — all outstanding decisions were taken as recommended and approved.

