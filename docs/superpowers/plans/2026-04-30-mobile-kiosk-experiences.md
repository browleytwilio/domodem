# Mobile App & POS Kiosk Experiences Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two new end-to-end experiences — a mobile-app shell at `/m/*` and a POS kiosk shell at `/kiosk/*` — to the existing Next.js 16 demo site, sharing Segment analytics, cart, identity, and persona state with the web surface so one demo narrative flows across all three.

**Architecture:** Single Next.js 16 App Router project on Vercel. Three route groups (`(web)`, `m`, `kiosk`) each with its own `layout.tsx`. Existing Zustand stores (`cart-store`, `segment-store`, `ui-store`) are the shared state layer — `persist` middleware + a new `BroadcastChannel` cart mirror give cross-mode and cross-tab continuity. Existing `analytics` bus is extended to auto-tag every event with `context.app.name` and `source` derived from `window.location.pathname`.

**Tech Stack:** Next.js 16 (App Router, React 19), TypeScript, Tailwind v4, shadcn/ui (base-nova), Zustand 5 + `persist`, Framer Motion 12, `@segment/analytics-next`, `better-auth` 1.6, `@neondatabase/serverless` + `drizzle-orm` (Neon HTTP + Pool), Sonner, Lucide icons.

**Source spec:** `docs/superpowers/specs/2026-04-30-mobile-kiosk-experiences-design.md`

**Notes for the engineer:**
- **This is NOT the Next.js you know.** `AGENTS.md` says to consult `node_modules/next/dist/docs/` for APIs that differ from training-data defaults. Key differences in this repo: `@base-ui/react` is the primitive layer (not Radix), `SheetTrigger` uses `render` prop, `ScrollArea` exists but some lists scroll natively.
- **No test runner.** Verification per task = `npx tsc --noEmit` + targeted `npm run build` at milestones + manual browser check where the task produces visible UI.
- **Commit after every task.** Keep commits small; each task = one commit.
- **Do not introduce new dependencies** unless a task says so. None do.
- **Respect `demoModeEnabled`** — all new demo overlays must still gate on `useSegmentStore((s) => s.demoModeEnabled)` so the "production site" mode works on mobile/kiosk too.

---

## File Structure

### Files to CREATE

**Segment bus + analytics extensions:**
- `src/lib/segment/source.ts` — `resolveSourceFromPath()` helper.
- `src/lib/segment/cart-broadcast.ts` — `BroadcastChannel` cart mirror helpers.

**Layout / device frames:**
- `src/app/(web)/layout.tsx` — moved web chrome (Header + DeliveryBanner + CartDrawer + Footer).
- `src/app/m/layout.tsx` — mobile app layout.
- `src/app/kiosk/layout.tsx` — kiosk layout.

**Mobile shell components (`src/components/mobile/`):**
- `mobile-device-frame.tsx`
- `mobile-app-shell.tsx`
- `mobile-top-bar.tsx`
- `mobile-tab-bar.tsx`
- `mobile-stacked-header.tsx`
- `mobile-home.tsx`
- `mobile-menu.tsx`
- `mobile-category-chips.tsx`
- `mobile-product-card.tsx`
- `mobile-product-detail.tsx`
- `mobile-offers.tsx`
- `mobile-orders.tsx`
- `mobile-account.tsx`
- `mobile-cart.tsx`
- `mobile-checkout.tsx`
- `mobile-login.tsx`
- `mobile-reorder-strip.tsx`

**Mobile pages (`src/app/m/`):**
- `page.tsx` (Home)
- `menu/page.tsx`
- `offers/page.tsx`
- `orders/page.tsx`
- `account/page.tsx`
- `product/[slug]/page.tsx`
- `cart/page.tsx`
- `checkout/page.tsx`
- `login/page.tsx`
- `register/page.tsx`
- `order/[id]/page.tsx`

**Kiosk shell components (`src/components/kiosk/`):**
- `kiosk-device-frame.tsx`
- `kiosk-idle-watchdog.tsx`
- `kiosk-top-chrome.tsx`
- `kiosk-progress-dots.tsx`
- `kiosk-attract-screen.tsx`
- `kiosk-persona-picker.tsx`
- `kiosk-category-rail.tsx`
- `kiosk-menu-grid.tsx`
- `kiosk-product-tile.tsx`
- `kiosk-product-detail.tsx`
- `kiosk-number-pad.tsx`
- `kiosk-cart-review.tsx`
- `kiosk-checkout.tsx`
- `kiosk-thanks.tsx`

**Kiosk pages (`src/app/kiosk/`):**
- `page.tsx` (attract)
- `menu/page.tsx`
- `product/[slug]/page.tsx`
- `cart/page.tsx`
- `checkout/page.tsx`
- `thanks/page.tsx`

**Toolbar additions:**
- `src/components/segment/mode-switcher.tsx` — segmented web/mobile/kiosk control.
- `src/components/segment/frame-toggle.tsx` — "Show device frame" switch row.

**Scripts:**
- `scripts/seed-demo-users.mjs` — one-time idempotent seed of `better-auth` users + history.

### Files to MODIFY

- `src/lib/segment/bus.ts` — extend `buildContextProperties()` to add `context.app.name` + `source`.
- `src/components/segment/segment-provider.tsx` — mount `setupCartBroadcast()`.
- `src/components/segment/demo-toolbar.tsx` — insert `<ModeSwitcher />` + `<FrameToggle />` above Overlays section.
- `src/stores/ui-store.ts` — add `frameEnabled` flag + `persist`.
- `src/lib/analytics/events.ts` — add `trackKioskSessionStarted`, `trackKioskIdleReset`, `trackModeSwitched`.
- `src/app/layout.tsx` — unchanged behavior but confirmed correct.
- `src/app/page.tsx` — remove page-level `<Header/>`, `<Footer/>`, `<CartDrawer/>`, `<DeliveryBanner/>` imports (moved to `(web)/layout.tsx`).
- `src/app/menu/page.tsx` — same removal (move to `src/app/(web)/menu/page.tsx`).
- `src/app/cart/page.tsx`, `src/app/checkout/page.tsx`, `src/app/deals/page.tsx`, `src/app/store-locator/page.tsx`, `src/app/order-tracker/page.tsx`, `src/app/product/[slug]/page.tsx`, `src/app/account/page.tsx`, `src/app/account/orders/page.tsx`, `src/app/account/addresses/page.tsx`, `src/app/account/loyalty/page.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx` — same removal + move into `(web)` group.

### Files NOT to touch

`src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/app/api/auth/[...all]/route.ts`, `src/app/api/orders/*`, `src/app/api/stores/*`, `src/app/api/coupons/validate/*`, `src/lib/db/*`, `drizzle.config.ts`, existing `src/components/segment/*` except `demo-toolbar.tsx` and `segment-provider.tsx`, existing `src/components/auth/*`, `src/components/cart/cart-drawer.tsx`, `src/components/layout/*`, `src/stores/cart-store.ts`, `src/stores/segment-store.ts`, `src/stores/order-store.ts`, `src/data/*.json`, all existing `trackX` helpers in `src/lib/analytics/events.ts`.

---

## Phase 1 — Foundation

### Task 1: Add `resolveSourceFromPath` helper

**Files:**
- Create: `src/lib/segment/source.ts`

- [ ] **Step 1: Create the helper**

```ts
// src/lib/segment/source.ts
export type AppSource = "web" | "mobile" | "kiosk";

const APP_NAMES: Record<AppSource, string> = {
  web: "Dominos Web",
  mobile: "Dominos Mobile",
  kiosk: "Dominos Kiosk",
};

export function resolveSourceFromPath(pathname: string | null | undefined): AppSource {
  if (!pathname) return "web";
  if (pathname === "/m" || pathname.startsWith("/m/")) return "mobile";
  if (pathname === "/kiosk" || pathname.startsWith("/kiosk/")) return "kiosk";
  return "web";
}

export function appNameForSource(source: AppSource): string {
  return APP_NAMES[source];
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/lib/segment/source.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/segment/source.ts
git commit -m "feat(segment): add app-source resolver from pathname"
```

---

### Task 2: Tag events with app.name + source in the bus

**Files:**
- Modify: `src/lib/segment/bus.ts`

- [ ] **Step 1: Add the import**

At the top of `src/lib/segment/bus.ts`, with the other imports from `./types`, etc., add:

```ts
import { resolveSourceFromPath, appNameForSource } from "./source";
```

- [ ] **Step 2: Extend `buildContextProperties`**

Replace the existing function body (the one that sets `ctx.source_page`, `ctx.cart_item_count`, etc.) with:

```ts
function buildContextProperties(eventName: string): Record<string, unknown> {
  const ctx: Record<string, unknown> = {};
  if (typeof window !== "undefined") {
    ctx.source_page = window.location.pathname;
    const source = resolveSourceFromPath(window.location.pathname);
    ctx.source = source;
    ctx.app_name = appNameForSource(source);
  }
  if (isEcommerceEvent(eventName)) {
    const cart = useCartStore.getState();
    const ui = useUIStore.getState();
    ctx.cart_item_count = cart.items.reduce((s, i) => s + i.quantity, 0);
    ctx.cart_value = cart.items.reduce(
      (s, i) => s + i.unitPrice * i.quantity,
      0,
    );
    ctx.delivery_method = ui.deliveryMethod;
    if (ui.selectedStore) {
      ctx.selected_store_id = ui.selectedStore.id;
    }
  }
  return ctx;
}
```

Note: `context.app.name` on the wire is set by Segment SDK via `options.context`, but for the client-side demo log we surface it as `app_name` + `source` in `properties` (which is what the Event Inspector displays). This keeps the demo visualization honest without requiring changes to the backing Segment connector.

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors in `src/lib/segment/bus.ts`.

- [ ] **Step 4: Manual smoke check**

Run: `npm run dev`
Open `http://localhost:3000`. Open the Event Inspector via the bottom-right FAB. Click any product card.
Expected: the resulting `Product Clicked` event payload includes `app_name: "Dominos Web"` and `source: "web"`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/segment/bus.ts
git commit -m "feat(segment): tag every event with app_name and source"
```

---

### Task 3: Add cart broadcast channel

**Files:**
- Create: `src/lib/segment/cart-broadcast.ts`

- [ ] **Step 1: Create the broadcast helper**

```ts
// src/lib/segment/cart-broadcast.ts
import { useCartStore } from "@/stores/cart-store";
import type { CartItem } from "@/types/order";

const CHANNEL_NAME = "dominos-cart-sync";

interface CartSyncMessage {
  senderId: string;
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
}

function newSenderId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function setupCartBroadcast(): () => void {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return () => {};
  }
  const channel = new BroadcastChannel(CHANNEL_NAME);
  const senderId = newSenderId();

  let suppressNextPublish = false;

  channel.onmessage = (ev: MessageEvent<CartSyncMessage>) => {
    const msg = ev.data;
    if (!msg || msg.senderId === senderId) return;
    suppressNextPublish = true;
    useCartStore.setState({
      items: msg.items,
      couponCode: msg.couponCode,
      couponDiscount: msg.couponDiscount,
    });
  };

  const unsubscribe = useCartStore.subscribe((state) => {
    if (suppressNextPublish) {
      suppressNextPublish = false;
      return;
    }
    const message: CartSyncMessage = {
      senderId,
      items: state.items,
      couponCode: state.couponCode,
      couponDiscount: state.couponDiscount,
    };
    channel.postMessage(message);
  });

  return () => {
    unsubscribe();
    channel.close();
  };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing the new file.

- [ ] **Step 3: Commit**

```bash
git add src/lib/segment/cart-broadcast.ts
git commit -m "feat(segment): add cart broadcast channel for cross-tab sync"
```

---

### Task 4: Mount cart broadcast in SegmentProvider

**Files:**
- Modify: `src/components/segment/segment-provider.tsx`

- [ ] **Step 1: Add the import and effect**

At the top of the file, next to the other `@/lib/segment/*` imports, add:

```ts
import { setupCartBroadcast } from "@/lib/segment/cart-broadcast";
```

Inside `SegmentProvider`, just after the existing `useEffect(() => { setMounted(true); }, []);` effect, add a new effect:

```ts
  useEffect(() => {
    return setupCartBroadcast();
  }, []);
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual smoke check**

Run: `npm run dev`.
Open `http://localhost:3000/menu` in two browser tabs. Add any item to cart in tab 1.
Expected: tab 2's cart icon count updates within a second without reload.

- [ ] **Step 4: Commit**

```bash
git add src/components/segment/segment-provider.tsx
git commit -m "feat(segment): mount cart broadcast on provider"
```

---

### Task 5: Add `frameEnabled` to ui-store with persist

**Files:**
- Modify: `src/stores/ui-store.ts`

- [ ] **Step 1: Replace the file contents**

Overwrite `src/stores/ui-store.ts` with:

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DeliveryMethod } from "@/types/order";
import type { Store } from "@/types/store";

interface UIState {
  deliveryMethod: DeliveryMethod;
  selectedStore: Store | null;
  deliveryAddress: string;
  isCartOpen: boolean;
  isMobileNavOpen: boolean;
  frameEnabled: boolean;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  setSelectedStore: (store: Store | null) => void;
  setDeliveryAddress: (address: string) => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  setMobileNavOpen: (open: boolean) => void;
  setFrameEnabled: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      deliveryMethod: "delivery",
      selectedStore: null,
      deliveryAddress: "",
      isCartOpen: false,
      isMobileNavOpen: false,
      frameEnabled: true,
      setDeliveryMethod: (method) => set({ deliveryMethod: method }),
      setSelectedStore: (store) => set({ selectedStore: store }),
      setDeliveryAddress: (address) => set({ deliveryAddress: address }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      setCartOpen: (open) => set({ isCartOpen: open }),
      toggleMobileNav: () =>
        set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
      setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
      setFrameEnabled: (enabled) => set({ frameEnabled: enabled }),
    }),
    {
      name: "dominos-ui",
      partialize: (state) => ({
        deliveryMethod: state.deliveryMethod,
        selectedStore: state.selectedStore,
        deliveryAddress: state.deliveryAddress,
        frameEnabled: state.frameEnabled,
      }),
    },
  ),
);
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing `ui-store.ts` consumers.

- [ ] **Step 3: Commit**

```bash
git add src/stores/ui-store.ts
git commit -m "feat(ui-store): persist and add frameEnabled flag"
```

---

### Task 6: Add new analytics event helpers

**Files:**
- Modify: `src/lib/analytics/events.ts`

- [ ] **Step 1: Append three new helpers**

Append at the bottom of `src/lib/analytics/events.ts`:

```ts
// ---------------------------------------------------------------------------
// Demo cross-surface events
// ---------------------------------------------------------------------------

export function trackKioskSessionStarted(opts: {
  identified: boolean;
  persona_id?: string;
}): void {
  analytics.track("Kiosk Session Started", {
    identified: opts.identified,
    ...(opts.persona_id !== undefined && { persona_id: opts.persona_id }),
  });
}

export function trackKioskIdleReset(): void {
  analytics.track("Kiosk Idle Reset");
}

export function trackModeSwitched(from: string, to: string): void {
  analytics.track("Mode Switched", { from, to });
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/analytics/events.ts
git commit -m "feat(analytics): add kiosk + mode-switch event helpers"
```

---

## Phase 2 — Web `(web)` route group refactor

The goal is to move chrome (`<Header/>`, `<DeliveryBanner/>`, `<CartDrawer/>`, `<Footer/>`) out of every page and into a shared layout. URLs must not change. Note: `src/app/(auth)/login` and `src/app/(auth)/register` are already in an `(auth)` group that currently imports chrome per-page — they move into `(web)/(auth)/` so the chrome comes from the group layout.

### Task 7: Create `(web)` group layout

**Files:**
- Create: `src/app/(web)/layout.tsx`

- [ ] **Step 1: Create the layout**

```tsx
// src/app/(web)/layout.tsx
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DeliveryBanner } from "@/components/layout/delivery-banner";
import { CartDrawer } from "@/components/cart/cart-drawer";

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <DeliveryBanner />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(web\)/layout.tsx
git commit -m "feat(web): add (web) route group layout with shared chrome"
```

---

### Task 8: Move home page into `(web)` group

**Files:**
- Move: `src/app/page.tsx` → `src/app/(web)/page.tsx`
- Modify: the new file (strip chrome imports)

- [ ] **Step 1: Git-move the file**

```bash
mkdir -p 'src/app/(web)'
git mv src/app/page.tsx 'src/app/(web)/page.tsx'
```

- [ ] **Step 2: Replace the file body**

Overwrite `src/app/(web)/page.tsx` with:

```tsx
import { HeroCarousel } from "@/components/home/hero-carousel";
import { DealsGrid } from "@/components/home/deals-grid";
import { PopularItems } from "@/components/home/popular-items";
import { AppDownloadBanner } from "@/components/home/app-download-banner";
import { PersonalizationBanner } from "@/components/segment/personalization-banner";

export default function Home() {
  return (
    <>
      <PersonalizationBanner />
      <HeroCarousel />

      <section className="py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Today&apos;s Deals
            </h2>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Great value combos and offers, updated daily
            </p>
          </div>
          <DealsGrid />
        </div>
      </section>

      <PopularItems />
      <AppDownloadBanner />
    </>
  );
}
```

Note: `<main className="flex-1">` is now in the layout — remove the wrapping `<main>` from the page body.

- [ ] **Step 3: Verify compile + route still renders**

Run: `npx tsc --noEmit && npm run dev`
Open `http://localhost:3000/`.
Expected: identical visual result to before. Page compiles without errors.

- [ ] **Step 4: Commit**

```bash
git add 'src/app/(web)/page.tsx'
git commit -m "refactor(web): move home page into (web) group"
```

---

### Task 9: Move menu pages into `(web)` group

**Files:**
- Move: `src/app/menu/page.tsx` → `src/app/(web)/menu/page.tsx`
- Move: `src/app/menu/[category]/page.tsx` → `src/app/(web)/menu/[category]/page.tsx`
- Modify: both files to strip chrome

- [ ] **Step 1: Git-move the directory**

```bash
git mv src/app/menu 'src/app/(web)/menu'
```

- [ ] **Step 2: Strip chrome from `src/app/(web)/menu/page.tsx`**

Open `src/app/(web)/menu/page.tsx`. Remove these imports at the top:

```tsx
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DeliveryBanner } from "@/components/layout/delivery-banner";
import { CartDrawer } from "@/components/cart/cart-drawer";
```

Remove the `<Header/>`, `<DeliveryBanner/>`, `<CartDrawer/>`, `<Footer/>` elements in the JSX. Remove the outer `<div className="flex min-h-screen flex-col">` wrapper that existed solely to contain them — replace the outer return fragment with just the page body (`<CategoryNav/>` + `<main>...`).

The resulting JSX should match:

```tsx
return (
  <>
    <CategoryNav
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
    />

    <div className="mx-auto max-w-7xl px-4 py-6">
      <NextBestOffer />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {heading}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {count} {count === 1 ? "item" : "items"}
        </p>
      </div>

      <ProductGrid products={filteredProducts} />
    </div>
  </>
);
```

- [ ] **Step 3: Strip chrome from `src/app/(web)/menu/[category]/page.tsx`**

Same surgery: remove Header/Footer/DeliveryBanner/CartDrawer imports + elements + outer wrapper div. Keep all page logic intact.

- [ ] **Step 4: Verify compile + routes**

Run: `npx tsc --noEmit && npm run dev`
Open `/menu` and `/menu/pizzas`.
Expected: identical visual result, chrome appears from layout.

- [ ] **Step 5: Commit**

```bash
git add 'src/app/(web)/menu'
git commit -m "refactor(web): move menu pages into (web) group"
```

---

### Task 10: Move remaining web pages into `(web)` group

**Files:**
- Move (git mv): `checkout`, `deals`, `store-locator`, `order-tracker`, `product`, `account`, `error.tsx` → under `src/app/(web)/`.
- Move: existing `src/app/(auth)/` → `src/app/(web)/(auth)/` (nested group keeps its split-layout auth design).
- Modify: each moved page to strip chrome imports.

- [ ] **Step 1: Move directories**

```bash
git mv src/app/checkout 'src/app/(web)/checkout'
git mv src/app/deals 'src/app/(web)/deals'
git mv src/app/store-locator 'src/app/(web)/store-locator'
git mv src/app/order-tracker 'src/app/(web)/order-tracker'
git mv src/app/product 'src/app/(web)/product'
git mv src/app/account 'src/app/(web)/account'
git mv src/app/error.tsx 'src/app/(web)/error.tsx'
git mv 'src/app/(auth)' 'src/app/(web)/(auth)'
```

- [ ] **Step 2: Strip chrome from every moved page**

For each of these files, remove the four chrome imports (`Header`, `Footer`, `DeliveryBanner`, `CartDrawer`) and their JSX usages, and remove the outer wrapping `<div className="flex min-h-screen flex-col">` (or equivalent) that existed only to contain them:

- `src/app/(web)/checkout/page.tsx`
- `src/app/(web)/deals/page.tsx`
- `src/app/(web)/store-locator/page.tsx`
- `src/app/(web)/order-tracker/page.tsx`
- `src/app/(web)/order-tracker/[id]/page.tsx`
- `src/app/(web)/product/[slug]/page.tsx`
- `src/app/(web)/account/page.tsx`
- `src/app/(web)/account/orders/page.tsx`
- `src/app/(web)/account/addresses/page.tsx`
- `src/app/(web)/account/loyalty/page.tsx`
- `src/app/(web)/(auth)/login/page.tsx`
- `src/app/(web)/(auth)/register/page.tsx`

For auth pages specifically: the login/register pages use a custom split layout with a hero image — the `<Header/>` and `<CartDrawer/>` at the top of those pages were cosmetic; removing them is fine. The inner `<main className="relative flex flex-1 bg-[var(--dominos-light-gray)]">` layout content stays. The `(web)/layout.tsx` `<main className="flex-1">` provides the outer wrapper — so auth pages wrap their split-layout content in a fragment returning the inner `<div className="relative flex flex-1 ...">` directly.

- [ ] **Step 3: Verify compile + every route loads**

Run: `npx tsc --noEmit && npm run dev`
Visit `/`, `/menu`, `/menu/pizzas`, `/deals`, `/store-locator`, `/order-tracker`, `/product/meat-lovers`, `/checkout`, `/account`, `/account/orders`, `/account/addresses`, `/account/loyalty`, `/login`, `/register`.
Expected: every page renders with unchanged visual layout.

- [ ] **Step 4: Commit**

```bash
git add 'src/app/(web)'
git commit -m "refactor(web): move remaining pages into (web) group"
```

---

### Task 11: Drop redundant `main` wrappers on pages

**Files:**
- Modify: any moved page that still has its own `<main>` element.

- [ ] **Step 1: Grep for duplicates**

Run: `grep -l '<main' src/app/\(web\) -r`
Expected: a short list of files.

- [ ] **Step 2: Replace each page's outer `<main className="flex-1">` wrapper with a fragment**

For every page still wrapping its content in a `<main>` (now that `layout.tsx` provides one), remove the `<main>` element, keeping its children. Repeat until `grep '<main' src/app/\(web\) -r` returns nothing.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add 'src/app/(web)'
git commit -m "refactor(web): remove duplicate main wrappers"
```

---

## Phase 3 — Demo toolbar extensions (mode switcher + frame toggle)

### Task 12: Mode switcher component

**Files:**
- Create: `src/components/segment/mode-switcher.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/segment/mode-switcher.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { Monitor, Smartphone, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackModeSwitched } from "@/lib/analytics/events";
import { resolveSourceFromPath, type AppSource } from "@/lib/segment/source";

const MODES: { value: AppSource; label: string; href: string; Icon: typeof Monitor }[] = [
  { value: "web", label: "Web", href: "/", Icon: Monitor },
  { value: "mobile", label: "Mobile", href: "/m", Icon: Smartphone },
  { value: "kiosk", label: "Kiosk", href: "/kiosk", Icon: Store },
];

const SECTION_HEADER =
  "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

export function ModeSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const active = resolveSourceFromPath(pathname);

  function handleClick(target: (typeof MODES)[number]) {
    if (target.value === active) return;
    trackModeSwitched(active, target.value);
    router.push(target.href);
  }

  return (
    <section className="flex flex-col gap-3 p-4">
      <h3 className={SECTION_HEADER}>Mode</h3>
      <div
        role="tablist"
        aria-label="Demo experience"
        className="grid grid-cols-3 gap-1 rounded-lg border bg-muted/50 p-1"
      >
        {MODES.map(({ value, label, Icon }) => {
          const isActive = active === value;
          return (
            <button
              key={value}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleClick(MODES.find((m) => m.value === value)!)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dominos-red)]/40",
                isActive
                  ? "bg-[var(--dominos-red)] text-white shadow-sm"
                  : "text-muted-foreground hover:bg-background hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/segment/mode-switcher.tsx
git commit -m "feat(segment): add mode switcher component"
```

---

### Task 13: Frame toggle component

**Files:**
- Create: `src/components/segment/frame-toggle.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/segment/frame-toggle.tsx
"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/stores/ui-store";

export function FrameToggle() {
  const frameEnabled = useUIStore((s) => s.frameEnabled);
  const setFrameEnabled = useUIStore((s) => s.setFrameEnabled);

  return (
    <>
      <section className="flex items-center justify-between gap-4 p-4">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="frame-toggle" className="text-sm font-medium">
            Show device frame
          </Label>
          <p className="text-[11px] leading-snug text-muted-foreground">
            Wraps mobile and kiosk shells in a simulated device bezel.
          </p>
        </div>
        <Switch
          id="frame-toggle"
          checked={frameEnabled}
          onCheckedChange={setFrameEnabled}
        />
      </section>
      <Separator />
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/segment/frame-toggle.tsx
git commit -m "feat(segment): add frame-toggle component"
```

---

### Task 14: Wire mode switcher + frame toggle into demo toolbar

**Files:**
- Modify: `src/components/segment/demo-toolbar.tsx`

- [ ] **Step 1: Add imports**

At the top, next to the other `@/components/*` imports, add:

```ts
import { ModeSwitcher } from "./mode-switcher";
import { FrameToggle } from "./frame-toggle";
```

- [ ] **Step 2: Insert the new sections**

Inside the `<PopoverContent side="top" align="end" sideOffset={8} className="w-80 p-0">`, insert `<ModeSwitcher />`, a `<Separator />`, and `<FrameToggle />` as the very first children, before the existing `{/* Overlays */}` section:

```tsx
<PopoverContent side="top" align="end" sideOffset={8} className="w-80 p-0">
  <ModeSwitcher />
  <Separator />
  <FrameToggle />

  {/* Overlays */}
  <section className="flex flex-col gap-3 p-4">
    ...existing content unchanged...
```

`<Separator />` is already imported at the top of the file — no new import for it.

- [ ] **Step 3: Verify + smoke**

Run: `npx tsc --noEmit && npm run dev`
Open `/`, click the "Segment Demo" pill at the bottom-right → Mode switcher appears at the top of the popover.
Click **Mobile** → router navigates to `/m` (404 for now — that's fine, shells come next).
Click **Web** in the toolbar to return.

- [ ] **Step 4: Commit**

```bash
git add src/components/segment/demo-toolbar.tsx
git commit -m "feat(toolbar): wire mode switcher and frame toggle"
```

---

## Phase 4 — Mobile app shell

### Task 15: Mobile device frame

**Files:**
- Create: `src/components/mobile/mobile-device-frame.tsx`

- [ ] **Step 1: Create the frame**

```tsx
// src/components/mobile/mobile-device-frame.tsx
"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

function useIsRealMobile() {
  const [isRealMobile, setIsRealMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse) and (max-width: 640px)");
    const update = () => setIsRealMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isRealMobile;
}

export function MobileDeviceFrame({ children }: { children: React.ReactNode }) {
  const frameEnabled = useUIStore((s) => s.frameEnabled);
  const isRealMobile = useIsRealMobile();
  const showFrame = frameEnabled && !isRealMobile;

  if (!showFrame) {
    return <div className="min-h-svh bg-background">{children}</div>;
  }

  return (
    <div className="min-h-svh bg-slate-900 py-8">
      <div className="mx-auto flex w-[420px] flex-col overflow-hidden rounded-[44px] border-[10px] border-slate-950 bg-background shadow-2xl">
        <div className="relative flex h-8 items-center justify-between bg-background px-6 text-[11px] font-semibold">
          <span>9:41</span>
          <div className="absolute left-1/2 top-1 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-950" aria-hidden />
          <div className="flex items-center gap-1">
            <span aria-hidden>▪▪▪</span>
            <span aria-hidden>📶</span>
            <span aria-hidden>🔋</span>
          </div>
        </div>
        <div className="h-[844px] overflow-y-auto overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/mobile/mobile-device-frame.tsx
git commit -m "feat(mobile): add mobile device frame"
```

---

### Task 16: Mobile tab bar

**Files:**
- Create: `src/components/mobile/mobile-tab-bar.tsx`

- [ ] **Step 1: Create the tab bar**

```tsx
// src/components/mobile/mobile-tab-bar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home as HomeIcon,
  UtensilsCrossed,
  BadgePercent,
  Package,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabDef {
  href: string;
  label: string;
  Icon: LucideIcon;
  matches: (pathname: string) => boolean;
}

const TABS: TabDef[] = [
  { href: "/m", label: "Home", Icon: HomeIcon, matches: (p) => p === "/m" },
  { href: "/m/menu", label: "Menu", Icon: UtensilsCrossed, matches: (p) => p === "/m/menu" || p.startsWith("/m/menu/") },
  { href: "/m/offers", label: "Offers", Icon: BadgePercent, matches: (p) => p.startsWith("/m/offers") },
  { href: "/m/orders", label: "Orders", Icon: Package, matches: (p) => p.startsWith("/m/orders") || p.startsWith("/m/order/") },
  { href: "/m/account", label: "Account", Icon: UserRound, matches: (p) => p.startsWith("/m/account") || p.startsWith("/m/login") || p.startsWith("/m/register") },
];

export function MobileTabBar() {
  const pathname = usePathname() ?? "/m";
  return (
    <nav
      aria-label="App tabs"
      className="sticky bottom-0 z-20 flex w-full items-stretch justify-around gap-1 border-t border-border/60 bg-background/95 px-2 pb-[calc(env(safe-area-inset-bottom)+4px)] pt-1 backdrop-blur"
    >
      {TABS.map(({ href, label, Icon, matches }) => {
        const isActive = matches(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[10px] font-medium transition-colors",
              isActive
                ? "bg-[var(--dominos-red)]/10 text-[var(--dominos-red)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export const MOBILE_TAB_ROUTES = new Set<string>([
  "/m",
  "/m/menu",
  "/m/offers",
  "/m/orders",
  "/m/account",
]);

export function isTabRoute(pathname: string): boolean {
  return MOBILE_TAB_ROUTES.has(pathname);
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/mobile/mobile-tab-bar.tsx
git commit -m "feat(mobile): add mobile tab bar"
```

---

### Task 17: Mobile top bar

**Files:**
- Create: `src/components/mobile/mobile-top-bar.tsx`

- [ ] **Step 1: Create the top bar**

```tsx
// src/components/mobile/mobile-top-bar.tsx
"use client";

import Link from "next/link";
import { Bell, ChevronDown, MapPin, Search } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

export function MobileTopBar() {
  const deliveryMethod = useUIStore((s) => s.deliveryMethod);
  const selectedStore = useUIStore((s) => s.selectedStore);
  return (
    <header className="sticky top-0 z-30 flex h-11 items-center justify-between border-b border-border/60 bg-background/95 px-3 backdrop-blur">
      <Link
        href="/m/account"
        className="flex min-w-0 items-center gap-1.5 rounded-full bg-muted/70 px-2.5 py-1 text-[11px] font-semibold"
      >
        <MapPin className="h-3.5 w-3.5 text-[var(--dominos-red)]" />
        <span className="uppercase tracking-wide">{deliveryMethod}</span>
        <span className="min-w-0 truncate text-muted-foreground">
          · {selectedStore ? selectedStore.name : "Pick a store"}
        </span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </Link>
      <div className="flex items-center gap-1">
        <Link
          href="/m/menu"
          aria-label="Search menu"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
        >
          <Search className="h-5 w-5" />
        </Link>
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
        >
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/mobile/mobile-top-bar.tsx
git commit -m "feat(mobile): add mobile top bar"
```

---

### Task 18: Mobile stacked header (for non-tab routes)

**Files:**
- Create: `src/components/mobile/mobile-stacked-header.tsx`

- [ ] **Step 1: Create**

```tsx
// src/components/mobile/mobile-stacked-header.tsx
"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function MobileStackedHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-border/60 bg-background/95 px-2 backdrop-blur">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-base font-semibold">{title}</h1>
    </header>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/mobile/mobile-stacked-header.tsx
git commit -m "feat(mobile): add stacked header for non-tab routes"
```

---

### Task 19: Mobile app shell (wraps tabs + stacked)

**Files:**
- Create: `src/components/mobile/mobile-app-shell.tsx`

- [ ] **Step 1: Create the shell**

```tsx
// src/components/mobile/mobile-app-shell.tsx
"use client";

import { usePathname } from "next/navigation";
import { MobileTopBar } from "./mobile-top-bar";
import { MobileTabBar, isTabRoute } from "./mobile-tab-bar";

export function MobileAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/m";
  const onTabRoute = isTabRoute(pathname);

  return (
    <div className="flex min-h-full flex-col bg-background">
      {onTabRoute && <MobileTopBar />}
      <div className="flex-1">{children}</div>
      {onTabRoute && <MobileTabBar />}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/mobile/mobile-app-shell.tsx
git commit -m "feat(mobile): add app shell with tab/stacked switching"
```

---

### Task 20: Mobile layout

**Files:**
- Create: `src/app/m/layout.tsx`

- [ ] **Step 1: Create**

```tsx
// src/app/m/layout.tsx
import { MobileDeviceFrame } from "@/components/mobile/mobile-device-frame";
import { MobileAppShell } from "@/components/mobile/mobile-app-shell";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileDeviceFrame>
      <MobileAppShell>{children}</MobileAppShell>
    </MobileDeviceFrame>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/m/layout.tsx
git commit -m "feat(mobile): add /m layout wiring frame + shell"
```

---

### Task 21: Mobile home page (stub, routable)

**Files:**
- Create: `src/app/m/page.tsx`

- [ ] **Step 1: Create a routable placeholder**

```tsx
// src/app/m/page.tsx
import { MobileHome } from "@/components/mobile/mobile-home";

export default function MobileHomePage() {
  return <MobileHome />;
}
```

- [ ] **Step 2: Create a stub `MobileHome` so the page renders**

Create `src/components/mobile/mobile-home.tsx`:

```tsx
// src/components/mobile/mobile-home.tsx
"use client";

export function MobileHome() {
  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold">Home</h1>
      <p className="mt-2 text-sm text-muted-foreground">Mobile home — content coming.</p>
    </div>
  );
}
```

- [ ] **Step 3: Verify + smoke**

Run: `npx tsc --noEmit && npm run dev`
Open `http://localhost:3000/m`.
Expected: device frame appears with top bar, "Home" heading, and bottom tab bar. Mode switcher shows Mobile active.

- [ ] **Step 4: Commit**

```bash
git add src/app/m/page.tsx src/components/mobile/mobile-home.tsx
git commit -m "feat(mobile): add home route with shell smoke render"
```

---

### Task 22: Mobile category chips

**Files:**
- Create: `src/components/mobile/mobile-category-chips.tsx`

- [ ] **Step 1: Create**

```tsx
// src/components/mobile/mobile-category-chips.tsx
"use client";

import { cn } from "@/lib/utils";

export const MOBILE_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "pizzas", label: "Pizzas" },
  { value: "sides", label: "Sides" },
  { value: "drinks", label: "Drinks" },
  { value: "desserts", label: "Desserts" },
  { value: "pastas", label: "Pastas" },
  { value: "chicken", label: "Chicken" },
  { value: "vegan", label: "Vegan" },
] as const;

export type MobileCategory = (typeof MOBILE_CATEGORIES)[number]["value"];

interface Props {
  active: MobileCategory;
  onChange: (next: MobileCategory) => void;
}

export function MobileCategoryChips({ active, onChange }: Props) {
  return (
    <div className="sticky top-11 z-20 -mx-4 flex gap-2 overflow-x-auto bg-background/95 px-4 py-2 backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {MOBILE_CATEGORIES.map((cat) => {
        const isActive = cat.value === active;
        return (
          <button
            key={cat.value}
            type="button"
            onClick={() => onChange(cat.value)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              isActive
                ? "border-[var(--dominos-red)] bg-[var(--dominos-red)] text-white"
                : "border-border bg-background text-foreground/80 hover:border-foreground/30",
            )}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/mobile/mobile-category-chips.tsx
git commit -m "feat(mobile): add category chips scroller"
```

---

### Task 23: Mobile product card

**Files:**
- Create: `src/components/mobile/mobile-product-card.tsx`

- [ ] **Step 1: Create**

```tsx
// src/components/mobile/mobile-product-card.tsx
"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import {
  trackProductAdded,
  toSegmentProduct,
  BRAND,
  trackProductClicked,
} from "@/lib/analytics/events";
import type { Product } from "@/types/menu";

function lowest(prices: Product["prices"]): number {
  const values = Object.values(prices).filter(
    (v): v is number => typeof v === "number",
  );
  return values.length > 0 ? Math.min(...values) : 0;
}

export function MobileProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const price = lowest(product.prices);
  const isPizza = product.category === "pizzas";

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const unitPrice = product.prices.single ?? price;
    const item = {
      id: `${product.slug}-${Date.now()}`,
      productSlug: product.slug,
      productName: product.name,
      category: product.category,
      image: product.image,
      quantity: 1,
      unitPrice,
    };
    addItem(item);
    trackProductAdded(toSegmentProduct(item));
  }

  function handleClick() {
    trackProductClicked({
      product_id: product.slug,
      name: product.name,
      category: product.category,
      price,
      quantity: 1,
      image_url: product.image,
      brand: BRAND,
      url: `/m/product/${product.slug}`,
    });
  }

  return (
    <Link
      href={`/m/product/${product.slug}`}
      onClick={handleClick}
      className="relative flex gap-3 rounded-2xl border border-border/70 bg-background p-3 transition-colors hover:border-foreground/20"
    >
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
        <ProductImage
          src={product.image}
          alt={product.name}
          slug={product.slug}
          category={product.category}
          fill
          sizes="96px"
        />
        {(product.isNew || product.isPopular) && (
          <div className="absolute left-1 top-1">
            {product.isNew ? (
              <Badge className="bg-[var(--dominos-green)] px-1.5 py-0 text-[10px] text-white">New</Badge>
            ) : (
              <Badge className="bg-[var(--dominos-orange)] px-1.5 py-0 text-[10px] text-white">Popular</Badge>
            )}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="truncate text-sm font-bold">{product.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-end justify-between">
          <span className="text-sm font-bold text-[var(--dominos-red)]">
            From ${price.toFixed(2)}
          </span>
          {!isPizza && (
            <button
              type="button"
              onClick={handleAdd}
              aria-label={`Add ${product.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--dominos-red)] text-white shadow-md transition-transform active:scale-90"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/mobile/mobile-product-card.tsx
git commit -m "feat(mobile): add mobile product card"
```

---

### Task 24: Mobile menu screen + route

**Files:**
- Create: `src/components/mobile/mobile-menu.tsx`
- Create: `src/app/m/menu/page.tsx`

- [ ] **Step 1: Create the menu screen**

```tsx
// src/components/mobile/mobile-menu.tsx
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { MobileCategoryChips, type MobileCategory } from "./mobile-category-chips";
import { MobileProductCard } from "./mobile-product-card";
import {
  trackProductListViewed,
  trackProductListFiltered,
} from "@/lib/analytics/events";
import menuData from "@/data/menu.json";
import type { Product } from "@/types/menu";

const products = menuData as unknown as Product[];

export function MobileMenu() {
  const [active, setActive] = useState<MobileCategory>("all");
  const first = useRef(true);

  const filtered = useMemo(() => {
    if (active === "all") return products;
    return products.filter((p) => p.category === active);
  }, [active]);

  useEffect(() => {
    const payload = filtered.map((p, idx) => ({
      product_id: p.slug,
      name: p.name,
      category: p.category,
      price: Math.min(
        ...Object.values(p.prices).filter(
          (v): v is number => typeof v === "number",
        ),
      ),
      quantity: 1,
      position: idx + 1,
      image_url: p.image,
    }));
    trackProductListViewed(active, payload);
    if (first.current) {
      first.current = false;
      return;
    }
    trackProductListFiltered("mobile-menu", active, filtered.length);
  }, [active, filtered]);

  return (
    <div className="px-4 pt-2 pb-24">
      <MobileCategoryChips active={active} onChange={setActive} />
      <div className="mt-3 flex flex-col gap-3">
        {filtered.map((p) => (
          <MobileProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the page**

```tsx
// src/app/m/menu/page.tsx
import { MobileMenu } from "@/components/mobile/mobile-menu";

export default function MobileMenuPage() {
  return <MobileMenu />;
}
```

- [ ] **Step 3: Verify + smoke**

```bash
npx tsc --noEmit
npm run dev
# Open /m/menu — see chips sticky at top, list of cards, tab bar at bottom
```

- [ ] **Step 4: Commit**

```bash
git add src/components/mobile/mobile-menu.tsx src/app/m/menu/page.tsx
git commit -m "feat(mobile): add menu tab with category chips + list"
```

---

### Task 25: Mobile product detail (stacked, slide-up)

**Files:**
- Create: `src/components/mobile/mobile-product-detail.tsx`
- Create: `src/app/m/product/[slug]/page.tsx`

- [ ] **Step 1: Create the detail component**

```tsx
// src/components/mobile/mobile-product-detail.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { ProductImage } from "@/components/ui/product-image";
import { MobileStackedHeader } from "./mobile-stacked-header";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";
import {
  BRAND,
  toSegmentProduct,
  trackProductAdded,
  trackProductViewed,
} from "@/lib/analytics/events";
import menuData from "@/data/menu.json";
import type { Product } from "@/types/menu";
import { cn } from "@/lib/utils";

const products = menuData as unknown as Product[];

const SIZES = ["small", "medium", "large"] as const;
const CRUSTS = ["classic", "thin", "stuffed"] as const;

export function MobileProductDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const product = useMemo(() => products.find((p) => p.slug === slug), [slug]);
  const addItem = useCartStore((s) => s.addItem);
  const [size, setSize] = useState<(typeof SIZES)[number]>("medium");
  const [crust, setCrust] = useState<(typeof CRUSTS)[number]>("classic");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!product) return;
    const price = product.prices[size] ?? product.prices.single ?? 0;
    trackProductViewed({
      product_id: product.slug,
      name: product.name,
      category: product.category,
      price,
      quantity: 1,
      image_url: product.image,
      brand: BRAND,
      url: `/m/product/${product.slug}`,
    });
  }, [product, size]);

  if (!product) notFound();

  const isPizza = product.category === "pizzas";
  const unitPrice =
    (isPizza ? product.prices[size] : product.prices.single) ?? 0;
  const total = unitPrice * qty;

  function handleAdd() {
    const item = {
      id: `${product!.slug}-${Date.now()}`,
      productSlug: product!.slug,
      productName: product!.name,
      category: product!.category,
      image: product!.image,
      quantity: qty,
      unitPrice,
      ...(isPizza && { size, crust }),
    };
    addItem(item);
    trackProductAdded(toSegmentProduct(item));
    toast.success(`${product!.name} added to cart`);
    router.back();
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <MobileStackedHeader title={product.name} />
      <div className="relative h-60 w-full">
        <ProductImage
          src={product.image}
          alt={product.name}
          slug={product.slug}
          category={product.category}
          fill
          sizes="420px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-5 px-4 py-4">
        <div>
          <h1 className="text-xl font-bold">{product.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
        </div>

        {isPizza && (
          <>
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Size</h2>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {SIZES.map((s) => {
                  const price = product.prices[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      disabled={price === undefined}
                      className={cn(
                        "flex flex-col items-center rounded-xl border px-2 py-2 text-sm font-semibold transition-colors disabled:opacity-30",
                        size === s
                          ? "border-[var(--dominos-red)] bg-[var(--dominos-red)]/10 text-[var(--dominos-red)]"
                          : "border-border text-foreground/80",
                      )}
                    >
                      <span className="capitalize">{s}</span>
                      {price !== undefined && (
                        <span className="mt-0.5 text-xs text-muted-foreground">
                          ${price.toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Crust</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {CRUSTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCrust(c)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors",
                      crust === c
                        ? "border-[var(--dominos-red)] bg-[var(--dominos-red)] text-white"
                        : "border-border text-foreground/80",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quantity</h2>
          <div className="mt-2 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-lg"
            >
              −
            </button>
            <span className="min-w-8 text-center text-lg font-semibold">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-lg"
            >
              +
            </button>
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 border-t border-border/60 bg-background/95 p-3 backdrop-blur">
        <button
          type="button"
          onClick={handleAdd}
          className="flex w-full items-center justify-center rounded-xl bg-[var(--dominos-red)] py-3.5 text-sm font-bold text-white shadow-lg active:scale-[0.99]"
        >
          Add to cart · ${total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the route**

```tsx
// src/app/m/product/[slug]/page.tsx
import { MobileProductDetail } from "@/components/mobile/mobile-product-detail";

export default async function MobileProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <MobileProductDetail slug={slug} />;
}
```

- [ ] **Step 3: Verify + smoke**

```bash
npx tsc --noEmit
npm run dev
# /m/menu → tap a pizza → detail slides in, add to cart
```

- [ ] **Step 4: Commit**

```bash
git add src/components/mobile/mobile-product-detail.tsx src/app/m/product
git commit -m "feat(mobile): add product detail with size/crust/qty"
```

---

### Task 26: Mobile cart screen + route

**Files:**
- Create: `src/components/mobile/mobile-cart.tsx`
- Create: `src/app/m/cart/page.tsx`

- [ ] **Step 1: Create the cart component**

```tsx
// src/components/mobile/mobile-cart.tsx
"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { MobileStackedHeader } from "./mobile-stacked-header";
import { useCartStore } from "@/stores/cart-store";
import {
  trackProductRemoved,
  toSegmentProduct,
  trackCartViewed,
} from "@/lib/analytics/events";
import { useEffect } from "react";

export function MobileCart() {
  const { items, removeItem, updateQuantity, getSubtotal, getDeliveryFee, getTotal, couponCode, couponDiscount } =
    useCartStore();

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  useEffect(() => {
    if (items.length === 0) return;
    trackCartViewed(
      "mobile-cart",
      items.map((item, idx) => toSegmentProduct(item, idx + 1)),
      subtotal,
    );
  }, [items, subtotal]);

  return (
    <div className="flex h-full flex-col bg-background">
      <MobileStackedHeader title={`Your cart (${items.length})`} />

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/60" />
          <p className="text-base font-medium text-muted-foreground">Your cart is empty</p>
          <Link
            href="/m/menu"
            className="inline-flex items-center rounded-xl bg-[var(--dominos-red)] px-6 py-2.5 text-sm font-bold text-white"
          >
            Browse menu
          </Link>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
            <div className="flex flex-col divide-y divide-border/60">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 py-3 first:pt-0">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                    <ProductImage
                      src={item.image}
                      alt={item.productName}
                      slug={item.productSlug}
                      category={item.category}
                      fill
                      sizes="64px"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold">{item.productName}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          trackProductRemoved(item.productSlug, item.productName, item.quantity, {
                            category: item.category,
                            price: item.unitPrice,
                          });
                          removeItem(item.id);
                        }}
                        aria-label={`Remove ${item.productName}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {(item.size || item.crust) && (
                      <p className="text-xs text-muted-foreground">
                        {[item.size, item.crust].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-border">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease"
                          className="flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-40"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase"
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-border/60 bg-background/95 p-4 backdrop-blur">
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              {couponCode && (
                <div className="flex justify-between text-[var(--dominos-green)]">
                  <span>Discount ({couponCode})</span>
                  <span>−${couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="mt-1 flex justify-between text-base font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Link
              href="/m/checkout"
              className="mt-3 flex w-full items-center justify-center rounded-xl bg-[var(--dominos-red)] py-3.5 text-sm font-bold text-white shadow-lg active:scale-[0.99]"
            >
              Checkout · ${total.toFixed(2)}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create the route**

```tsx
// src/app/m/cart/page.tsx
import { MobileCart } from "@/components/mobile/mobile-cart";

export default function MobileCartPage() {
  return <MobileCart />;
}
```

- [ ] **Step 3: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/mobile/mobile-cart.tsx src/app/m/cart
git commit -m "feat(mobile): add cart review screen"
```

---

### Task 27: Mobile checkout screen + route

**Files:**
- Create: `src/components/mobile/mobile-checkout.tsx`
- Create: `src/app/m/checkout/page.tsx`

- [ ] **Step 1: Create the checkout component**

```tsx
// src/components/mobile/mobile-checkout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MobileStackedHeader } from "./mobile-stacked-header";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { useOrderStore } from "@/stores/order-store";
import {
  trackCheckoutStarted,
  trackOrderCompleted,
  toSegmentProduct,
} from "@/lib/analytics/events";
import type { Order } from "@/types/order";

export function MobileCheckout() {
  const router = useRouter();
  const { items, getSubtotal, getDeliveryFee, getTotal, clearCart, couponCode, couponDiscount } = useCartStore();
  const { deliveryMethod, selectedStore, deliveryAddress, setDeliveryAddress } = useUIStore();
  const { setCurrentOrder, addToHistory } = useOrderStore();

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  const [address, setAddress] = useState(deliveryAddress);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/m/cart");
      return;
    }
    trackCheckoutStarted(
      items.map((item, idx) => toSegmentProduct(item, idx + 1)),
      subtotal,
      deliveryFee,
      total,
      couponCode ?? undefined,
    );
  }, [items, subtotal, deliveryFee, total, couponCode, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    if (deliveryMethod === "delivery") {
      setDeliveryAddress(address);
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items,
          deliveryMethod,
          deliveryAddress: deliveryMethod === "delivery" ? address : null,
          subtotal,
          deliveryFee,
          discount: couponDiscount,
          total,
          couponCode,
          specialInstructions: notes,
          storeId: selectedStore?.id ?? "store-001",
        }),
      });
      if (!res.ok) {
        throw new Error(`checkout failed (${res.status})`);
      }
      const order = (await res.json()) as Order;
      setCurrentOrder(order);
      addToHistory(order);
      trackOrderCompleted(
        order.id,
        items.map((item, idx) => toSegmentProduct(item, idx + 1)),
        order.subtotal,
        order.total,
        order.deliveryFee,
        order.discount,
        order.couponCode,
      );
      clearCart();
      toast.success("Order placed");
      router.replace(`/m/order/${order.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not place order");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col bg-background">
      <MobileStackedHeader title="Checkout" />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Method</h2>
          <p className="text-sm font-medium capitalize">{deliveryMethod}</p>
        </section>

        {deliveryMethod === "delivery" && (
          <section className="mt-4 flex flex-col gap-2">
            <Label htmlFor="m-address">Delivery address</Label>
            <Input
              id="m-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="42 Wallaby Way, Sydney NSW 2000"
              required
              autoComplete="street-address"
            />
          </section>
        )}

        <section className="mt-4 flex flex-col gap-2">
          <Label htmlFor="m-notes">Notes (optional)</Label>
          <Textarea
            id="m-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Leave at door, etc."
            rows={3}
          />
        </section>

        <section className="mt-6 flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span>{deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}</span>
          </div>
          {couponCode && (
            <div className="flex justify-between text-[var(--dominos-green)]">
              <span>Discount ({couponCode})</span>
              <span>−${couponDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between text-base font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 border-t border-border/60 bg-background/95 p-3 backdrop-blur">
        <button
          type="submit"
          disabled={submitting || (deliveryMethod === "delivery" && !address)}
          className="flex w-full items-center justify-center rounded-xl bg-[var(--dominos-red)] py-3.5 text-sm font-bold text-white shadow-lg disabled:opacity-60"
        >
          {submitting ? "Placing order..." : `Place order · $${total.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create the route**

```tsx
// src/app/m/checkout/page.tsx
import { MobileCheckout } from "@/components/mobile/mobile-checkout";

export default function MobileCheckoutPage() {
  return <MobileCheckout />;
}
```

- [ ] **Step 3: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/mobile/mobile-checkout.tsx src/app/m/checkout
git commit -m "feat(mobile): add checkout screen"
```

---

### Task 28: Mobile offers + route

**Files:**
- Create: `src/components/mobile/mobile-offers.tsx`
- Create: `src/app/m/offers/page.tsx`

- [ ] **Step 1: Create offers component**

```tsx
// src/components/mobile/mobile-offers.tsx
"use client";

import Link from "next/link";
import { NextBestOffer } from "@/components/segment/next-best-offer";
import dealsData from "@/data/deals.json";
import type { Deal } from "@/types/menu";
import { Badge } from "@/components/ui/badge";

const deals = dealsData as Deal[];

export function MobileOffers() {
  return (
    <div className="px-4 pt-3 pb-24">
      <NextBestOffer />

      <h1 className="mt-4 text-xl font-bold">Today&apos;s deals</h1>
      <div className="mt-3 flex flex-col gap-3">
        {deals.map((deal) => (
          <Link
            key={deal.id}
            href={deal.href ?? "/m/menu"}
            className="flex gap-3 rounded-2xl border border-border/70 bg-background p-3"
          >
            <div
              className="flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--dominos-red)] text-center text-white"
              aria-hidden
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">Save</span>
              <span className="text-lg font-black">{deal.price ?? deal.discount}</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-sm font-bold">{deal.title}</h2>
                {deal.tag && (
                  <Badge className="bg-[var(--dominos-orange)] px-1.5 py-0 text-[10px] text-white">
                    {deal.tag}
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{deal.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the shape of `deals.json` + `Deal` type matches**

Run: `grep -n 'deals.json' src -r | head` and check `src/types/menu.ts` for the `Deal` type.

If the file or type doesn't exist / shape differs, read `src/components/home/deals-grid.tsx` to see how deals are currently loaded, and mirror that exact import + typing in `mobile-offers.tsx`. The component should render whatever `deals-grid.tsx` renders today — just in mobile card style.

- [ ] **Step 3: Create the route**

```tsx
// src/app/m/offers/page.tsx
import { MobileOffers } from "@/components/mobile/mobile-offers";

export default function MobileOffersPage() {
  return <MobileOffers />;
}
```

- [ ] **Step 4: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/mobile/mobile-offers.tsx src/app/m/offers
git commit -m "feat(mobile): add offers tab"
```

---

### Task 29: Mobile orders tab + order tracker

**Files:**
- Create: `src/components/mobile/mobile-orders.tsx`
- Create: `src/app/m/orders/page.tsx`
- Create: `src/app/m/order/[id]/page.tsx`

- [ ] **Step 1: Create the orders list component**

```tsx
// src/components/mobile/mobile-orders.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import type { Order } from "@/types/order";

export function MobileOrders() {
  const { data: session, isPending } = authClient.useSession();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      setOrders([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Order[];
        if (!cancelled) setOrders(data);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, isPending]);

  if (!isPending && !session?.user) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 pt-16 text-center">
        <h1 className="text-xl font-bold">Sign in to see your orders</h1>
        <p className="text-sm text-muted-foreground">
          Track live orders and see your history.
        </p>
        <Link
          href="/m/login"
          className="inline-flex items-center rounded-xl bg-[var(--dominos-red)] px-6 py-2.5 text-sm font-bold text-white"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (orders === null) {
    return <div className="px-4 pt-6 text-sm text-muted-foreground">Loading orders...</div>;
  }

  if (error) {
    return <div className="px-4 pt-6 text-sm text-destructive">Could not load orders.</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-xl font-bold">Orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24">
      <h1 className="text-xl font-bold">Orders</h1>
      <div className="mt-3 flex flex-col gap-2">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/m/order/${o.id}`}
            className="flex items-center justify-between rounded-2xl border border-border/70 bg-background p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Order #{o.id.slice(0, 8)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {new Date(o.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                {o.status.replace(/_/g, " ")}
              </span>
              <span className="text-sm font-bold">${o.total.toFixed(2)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the orders route**

```tsx
// src/app/m/orders/page.tsx
import { MobileOrders } from "@/components/mobile/mobile-orders";

export default function MobileOrdersPage() {
  return <MobileOrders />;
}
```

- [ ] **Step 3: Create the order tracker stub that reuses the web tracker**

```tsx
// src/app/m/order/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MobileStackedHeader } from "@/components/mobile/mobile-stacked-header";
import type { Order } from "@/types/order";

export default function MobileOrderTrackerPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Order;
        if (!cancelled) setOrder(data);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="flex h-full flex-col bg-background">
      <MobileStackedHeader title="Order tracker" />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {error && <p className="text-sm text-destructive">Could not load order.</p>}
        {!order && !error && <p className="text-sm text-muted-foreground">Loading...</p>}
        {order && (
          <>
            <h1 className="text-xl font-bold">Order #{order.id.slice(0, 8)}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Status: <span className="font-semibold capitalize">{order.status.replace(/_/g, " ")}</span>
            </p>
            <p className="mt-3 text-sm">
              ETA:{" "}
              {order.estimatedDelivery
                ? new Date(order.estimatedDelivery).toLocaleTimeString()
                : "—"}
            </p>
            <div className="mt-4 flex flex-col divide-y divide-border/60">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 text-sm">
                  <span>
                    {item.quantity} × {item.productName}
                  </span>
                  <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between text-base font-bold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <Link
              href="/m/orders"
              className="mt-6 inline-flex items-center text-sm font-semibold text-[var(--dominos-red)]"
            >
              Back to orders →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/mobile/mobile-orders.tsx src/app/m/orders src/app/m/order
git commit -m "feat(mobile): add orders tab and order tracker"
```

---

### Task 30: Mobile account tab

**Files:**
- Create: `src/components/mobile/mobile-account.tsx`
- Create: `src/app/m/account/page.tsx`

- [ ] **Step 1: Create the account component**

```tsx
// src/components/mobile/mobile-account.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight,
  LogOut,
  MapPin,
  Package,
  Sparkles,
  CreditCard,
  UserRound,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { trackSignedOut } from "@/lib/analytics/events";

const ROWS = [
  { href: "/m/orders", label: "Orders", Icon: Package },
  { href: "/m/account", label: "Addresses", Icon: MapPin },
  { href: "/m/account", label: "Loyalty", Icon: Sparkles },
  { href: "/m/account", label: "Payment", Icon: CreditCard },
];

export function MobileAccount() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    trackSignedOut();
    toast.success("Signed out");
    router.refresh();
  }

  if (isPending) {
    return <div className="px-4 pt-6 text-sm text-muted-foreground">Loading...</div>;
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col gap-4 px-6 pt-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <UserRound className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold">Your Domino&apos;s account</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to earn rewards, see orders, and save addresses.
        </p>
        <Link
          href="/m/login"
          className="inline-flex items-center justify-center rounded-xl bg-[var(--dominos-red)] py-3 text-sm font-bold text-white"
        >
          Sign in
        </Link>
        <Link
          href="/m/register"
          className="text-sm font-semibold text-[var(--dominos-red)]"
        >
          Create account
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24">
      <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--dominos-red)]/15 text-[var(--dominos-red)]">
          <UserRound className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{session.user.name ?? session.user.email}</p>
          <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-col divide-y divide-border/60 rounded-2xl border border-border/70 bg-background">
        {ROWS.map(({ href, label, Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-muted/40"
          >
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold text-destructive"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create the route**

```tsx
// src/app/m/account/page.tsx
import { MobileAccount } from "@/components/mobile/mobile-account";

export default function MobileAccountPage() {
  return <MobileAccount />;
}
```

- [ ] **Step 3: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/mobile/mobile-account.tsx src/app/m/account
git commit -m "feat(mobile): add account tab"
```

---

### Task 31: Mobile login + register

**Files:**
- Create: `src/components/mobile/mobile-login.tsx`
- Create: `src/app/m/login/page.tsx`
- Create: `src/app/m/register/page.tsx`

- [ ] **Step 1: Create a mobile login wrapper**

```tsx
// src/components/mobile/mobile-login.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { MobileStackedHeader } from "./mobile-stacked-header";

const DEMO_ACCOUNTS = [
  { label: "Sarah — VIP", email: "sarah.vip@dominosdemo.com" },
  { label: "Dan — Cart Abandoner", email: "dan.abandoner@dominosdemo.com" },
  { label: "Alex — Deal Hunter", email: "alex.deals@dominosdemo.com" },
  { label: "Jamie — New Visitor", email: "jamie.new@dominosdemo.com" },
];

export function MobileLogin() {
  const [showDemo, setShowDemo] = useState(false);
  return (
    <div className="flex h-full flex-col bg-background">
      <MobileStackedHeader title="Sign in" />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h1 className="text-xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to see your orders and rewards.
        </p>

        <div className="mt-5">
          <LoginForm />
        </div>

        <button
          type="button"
          onClick={() => setShowDemo((s) => !s)}
          className="mt-6 flex w-full items-center justify-between rounded-xl border border-dashed border-border/80 px-4 py-2.5 text-xs font-semibold text-muted-foreground"
        >
          <span>Demo accounts</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showDemo ? "rotate-180" : ""}`}
          />
        </button>
        {showDemo && (
          <div className="mt-2 flex flex-col gap-1 rounded-xl border border-border/60 p-2 text-xs">
            <p className="px-2 py-1 text-muted-foreground">
              Password for all: <span className="font-mono">demo1234</span>
            </p>
            {DEMO_ACCOUNTS.map((acct) => (
              <button
                key={acct.email}
                type="button"
                onClick={() => {
                  const emailInput = document.getElementById("email") as HTMLInputElement | null;
                  const pwInput = document.getElementById("password") as HTMLInputElement | null;
                  if (emailInput) {
                    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                    nativeSetter?.call(emailInput, acct.email);
                    emailInput.dispatchEvent(new Event("input", { bubbles: true }));
                  }
                  if (pwInput) {
                    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                    nativeSetter?.call(pwInput, "demo1234");
                    pwInput.dispatchEvent(new Event("input", { bubbles: true }));
                  }
                }}
                className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-left font-semibold"
              >
                <span>{acct.label}</span>
                <span className="text-muted-foreground">Use</span>
              </button>
            ))}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          No account?{" "}
          <Link href="/m/register" className="font-semibold text-[var(--dominos-red)]">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
```

Note: `<LoginForm/>` redirects to `/menu` on success. That's fine for web; on mobile we want `/m`. The simplest fix: leave `LoginForm` alone (it's the shared web component) and after sign-in the user lands on `/menu`; from there the tab bar is gone and they can use the demo-toolbar mode switcher to return to `/m`. **Acceptable tradeoff — do not modify `login-form.tsx` inside this task.**

- [ ] **Step 2: Create the route**

```tsx
// src/app/m/login/page.tsx
import { MobileLogin } from "@/components/mobile/mobile-login";

export default function MobileLoginPage() {
  return <MobileLogin />;
}
```

- [ ] **Step 3: Create register stub that mirrors login**

```tsx
// src/app/m/register/page.tsx
"use client";

import { RegisterForm } from "@/components/auth/register-form";
import { MobileStackedHeader } from "@/components/mobile/mobile-stacked-header";

export default function MobileRegisterPage() {
  return (
    <div className="flex h-full flex-col bg-background">
      <MobileStackedHeader title="Create account" />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h1 className="text-xl font-bold">Join Domino&apos;s</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Free to join. Earn rewards with every order.
        </p>
        <div className="mt-5">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/mobile/mobile-login.tsx src/app/m/login src/app/m/register
git commit -m "feat(mobile): add login and register screens"
```

---

### Task 32: Mobile reorder strip + flesh out home

**Files:**
- Create: `src/components/mobile/mobile-reorder-strip.tsx`
- Modify: `src/components/mobile/mobile-home.tsx`

- [ ] **Step 1: Create the reorder strip**

```tsx
// src/components/mobile/mobile-reorder-strip.tsx
"use client";

import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { useSegmentStore } from "@/stores/segment-store";
import menuData from "@/data/menu.json";
import type { Product } from "@/types/menu";

const products = menuData as unknown as Product[];

export function MobileReorderStrip() {
  const events = useSegmentStore((s) => s.events);
  const userId = useSegmentStore((s) => s.userId);

  if (!userId) return null;

  const slugCounts = new Map<string, number>();
  for (const e of events) {
    if (e.kind !== "track" || e.name !== "Order Completed") continue;
    const products = (e.properties?.products as Array<{ product_id?: string }>) ?? [];
    for (const p of products) {
      if (!p.product_id) continue;
      slugCounts.set(p.product_id, (slugCounts.get(p.product_id) ?? 0) + 1);
    }
  }

  const topSlugs = [...slugCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([slug]) => slug);

  const items = topSlugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));

  if (items.length === 0) return null;

  return (
    <section className="mt-5">
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h2 className="text-base font-bold">Reorder in one tap</h2>
        <Link href="/m/orders" className="text-xs font-semibold text-[var(--dominos-red)]">
          See all
        </Link>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((p) => (
          <Link
            key={p.slug}
            href={`/m/product/${p.slug}`}
            className="flex w-32 flex-shrink-0 flex-col rounded-2xl border border-border/70 bg-background p-2"
          >
            <div className="relative h-20 w-full overflow-hidden rounded-xl">
              <ProductImage
                src={p.image}
                alt={p.name}
                slug={p.slug}
                category={p.category}
                fill
                sizes="128px"
              />
            </div>
            <p className="mt-1.5 truncate text-xs font-bold">{p.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Replace the `MobileHome` stub**

Overwrite `src/components/mobile/mobile-home.tsx` with:

```tsx
// src/components/mobile/mobile-home.tsx
"use client";

import Link from "next/link";
import { PersonalizationBanner } from "@/components/segment/personalization-banner";
import { MobileReorderStrip } from "./mobile-reorder-strip";
import menuData from "@/data/menu.json";
import type { Product } from "@/types/menu";
import { ProductImage } from "@/components/ui/product-image";

const products = menuData as unknown as Product[];

export function MobileHome() {
  const popular = products.filter((p) => p.isPopular).slice(0, 4);
  return (
    <div className="px-4 pt-3 pb-24">
      <PersonalizationBanner />

      <Link
        href="/m/offers"
        className="mt-3 flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--dominos-red)] to-[var(--dominos-dark-blue)] p-5 text-white shadow-lg"
      >
        <span className="inline-block self-start rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Today
        </span>
        <h1 className="mt-2 text-2xl font-black leading-tight">
          Any 3 Pizzas
          <br />
          from $29.95
        </h1>
        <p className="mt-1 text-xs text-white/85">Mix &amp; match. Pickup or delivery.</p>
        <span className="mt-3 inline-block self-start rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-[var(--dominos-red)]">
          Order now →
        </span>
      </Link>

      <MobileReorderStrip />

      <section className="mt-6">
        <h2 className="mb-2 px-1 text-base font-bold">Popular right now</h2>
        <div className="flex flex-col gap-2.5">
          {popular.map((p) => {
            const price = Math.min(
              ...Object.values(p.prices).filter((v): v is number => typeof v === "number"),
            );
            return (
              <Link
                key={p.slug}
                href={`/m/product/${p.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background p-2.5"
              >
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                  <ProductImage
                    src={p.image}
                    alt={p.name}
                    slug={p.slug}
                    category={p.category}
                    fill
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.description}</p>
                </div>
                <span className="text-sm font-bold text-[var(--dominos-red)]">${price.toFixed(2)}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-dashed border-border/80 bg-muted/30 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In-store</p>
        <p className="mt-1 text-sm font-semibold">Scan a store QR to order at the counter</p>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/mobile/mobile-reorder-strip.tsx src/components/mobile/mobile-home.tsx
git commit -m "feat(mobile): flesh out home with reorder strip + popular"
```

---

### Task 33: Mobile app cart-icon hookup in top bar

**Files:**
- Modify: `src/components/mobile/mobile-top-bar.tsx`

- [ ] **Step 1: Add a cart link + badge**

Replace the contents of the right-side `<div className="flex items-center gap-1">` in `src/components/mobile/mobile-top-bar.tsx` with:

```tsx
<div className="flex items-center gap-1">
  <Link
    href="/m/menu"
    aria-label="Search menu"
    className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
  >
    <Search className="h-5 w-5" />
  </Link>
  <Link
    href="/m/cart"
    aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
    className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
  >
    <ShoppingBag className="h-5 w-5" />
    {itemCount > 0 && (
      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--dominos-red)] px-1 text-[10px] font-bold text-white">
        {itemCount}
      </span>
    )}
  </Link>
</div>
```

At the top of the file, replace `import { Bell, ChevronDown, MapPin, Search } from "lucide-react";` with:

```tsx
import { ChevronDown, MapPin, Search, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
```

Inside the `MobileTopBar` function, above the `return`, add:

```tsx
const itemCount = useCartStore((s) => s.getItemCount());
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/mobile/mobile-top-bar.tsx
git commit -m "feat(mobile): add cart badge to top bar"
```

---

### Task 34: Full-build check after mobile shell

- [ ] **Step 1: Run the real build**

Run: `npm run build`
Expected: build succeeds, all `/m/*` routes render in the output, no type errors.

- [ ] **Step 2: Manual walkthrough**

`npm run dev`:

1. Open `/m` — home renders with personalization banner, reorder strip (empty if anonymous), popular list.
2. Tap Menu tab → category chips + product cards.
3. Tap any pizza → detail screen → add to cart.
4. Tap cart badge → `/m/cart` → checkout → `/m/checkout` → place order → redirect to `/m/order/[id]`.
5. Load a persona from the demo toolbar → return to `/m` → confirm reorder strip populates.
6. Open the Event Inspector → confirm events fired from `/m/*` have `source: "mobile"` and `app_name: "Dominos Mobile"`.

- [ ] **Step 3: No-op commit if any fixes were needed**

If fixes were needed, commit them as `fix(mobile): build/runtime fixes from full-shell check`. Otherwise skip.

---

## Phase 5 — Kiosk shell

### Task 35: Kiosk device frame

**Files:**
- Create: `src/components/kiosk/kiosk-device-frame.tsx`

- [ ] **Step 1: Create the frame**

```tsx
// src/components/kiosk/kiosk-device-frame.tsx
"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/stores/ui-store";

function useIsRealMobile() {
  const [v, setV] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse) and (max-width: 640px)");
    const u = () => setV(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);
  return v;
}

export function KioskDeviceFrame({ children }: { children: React.ReactNode }) {
  const frameEnabled = useUIStore((s) => s.frameEnabled);
  const isRealMobile = useIsRealMobile();
  const showFrame = frameEnabled && !isRealMobile;

  if (!showFrame) {
    return <div className="min-h-svh bg-background">{children}</div>;
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-900 p-6">
      <div className="relative w-full max-w-[1280px] overflow-hidden rounded-[28px] border-[16px] border-slate-950 bg-background shadow-2xl">
        <div className="flex h-6 items-center justify-center bg-slate-950 text-[10px] font-semibold text-slate-400">
          Domino&apos;s Self-Order · Touch anywhere to continue
        </div>
        <div className="h-[800px] overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/kiosk/kiosk-device-frame.tsx
git commit -m "feat(kiosk): add kiosk device frame"
```

---

### Task 36: Kiosk idle watchdog

**Files:**
- Create: `src/components/kiosk/kiosk-idle-watchdog.tsx`

- [ ] **Step 1: Create the watchdog**

```tsx
// src/components/kiosk/kiosk-idle-watchdog.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { analytics } from "@/lib/segment/bus";
import { useCartStore } from "@/stores/cart-store";
import { trackKioskIdleReset } from "@/lib/analytics/events";

const IDLE_MS = 90_000;

export function KioskIdleWatchdog({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pathname === "/kiosk") return;

    function reset() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        trackKioskIdleReset();
        useCartStore.getState().clearCart();
        await analytics.reset();
        router.replace("/kiosk");
      }, IDLE_MS);
    }

    const events: Array<keyof DocumentEventMap> = [
      "pointerdown",
      "pointermove",
      "keydown",
      "scroll",
      "wheel",
      "touchstart",
    ];
    events.forEach((ev) =>
      document.addEventListener(ev, reset, { passive: true } as AddEventListenerOptions),
    );
    reset();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((ev) => document.removeEventListener(ev, reset));
    };
  }, [pathname, router]);

  return <>{children}</>;
}
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/kiosk/kiosk-idle-watchdog.tsx
git commit -m "feat(kiosk): add idle watchdog"
```

---

### Task 37: Kiosk top chrome + progress dots

**Files:**
- Create: `src/components/kiosk/kiosk-top-chrome.tsx`
- Create: `src/components/kiosk/kiosk-progress-dots.tsx`

- [ ] **Step 1: Top chrome**

```tsx
// src/components/kiosk/kiosk-top-chrome.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { analytics } from "@/lib/segment/bus";
import { useCartStore } from "@/stores/cart-store";
import { trackKioskIdleReset } from "@/lib/analytics/events";

export function KioskTopChrome() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  if (pathname === "/kiosk") return null;

  async function handleStartOver() {
    trackKioskIdleReset();
    useCartStore.getState().clearCart();
    await analytics.reset();
    router.replace("/kiosk");
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-4">
      <span className="pointer-events-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
        Store #147 · Melbourne CBD
      </span>
      <button
        type="button"
        onClick={handleStartOver}
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--dominos-red)] shadow"
      >
        <X className="h-4 w-4" />
        Start over
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Progress dots**

```tsx
// src/components/kiosk/kiosk-progress-dots.tsx
"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "menu", label: "Menu", match: (p: string) => p.startsWith("/kiosk/menu") || p.startsWith("/kiosk/product") },
  { key: "cart", label: "Cart", match: (p: string) => p.startsWith("/kiosk/cart") },
  { key: "pay", label: "Pay", match: (p: string) => p.startsWith("/kiosk/checkout") },
  { key: "done", label: "Done", match: (p: string) => p.startsWith("/kiosk/thanks") },
];

export function KioskProgressDots() {
  const pathname = usePathname() ?? "";
  if (pathname === "/kiosk") return null;

  const activeIdx = STEPS.findIndex((s) => s.match(pathname));

  return (
    <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center">
      <div className="flex items-center gap-3 rounded-full bg-white/90 px-5 py-2 shadow backdrop-blur">
        {STEPS.map((step, idx) => {
          const isActive = idx === activeIdx;
          const isDone = idx < activeIdx;
          return (
            <div key={step.key} className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-colors",
                  isActive
                    ? "bg-[var(--dominos-red)]"
                    : isDone
                      ? "bg-[var(--dominos-red)]/40"
                      : "bg-slate-300",
                )}
              />
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  isActive ? "text-[var(--dominos-red)]" : "text-slate-500",
                )}
              >
                {step.label}
              </span>
              {idx < STEPS.length - 1 && <span className="text-slate-300">›</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/kiosk/kiosk-top-chrome.tsx src/components/kiosk/kiosk-progress-dots.tsx
git commit -m "feat(kiosk): add top chrome and progress dots"
```

---

### Task 38: Kiosk layout

**Files:**
- Create: `src/app/kiosk/layout.tsx`

- [ ] **Step 1: Create the layout**

```tsx
// src/app/kiosk/layout.tsx
import { KioskDeviceFrame } from "@/components/kiosk/kiosk-device-frame";
import { KioskIdleWatchdog } from "@/components/kiosk/kiosk-idle-watchdog";
import { KioskTopChrome } from "@/components/kiosk/kiosk-top-chrome";
import { KioskProgressDots } from "@/components/kiosk/kiosk-progress-dots";

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <KioskDeviceFrame>
      <KioskIdleWatchdog>
        <div className="relative h-full">
          <KioskTopChrome />
          {children}
          <KioskProgressDots />
        </div>
      </KioskIdleWatchdog>
    </KioskDeviceFrame>
  );
}
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit
git add src/app/kiosk/layout.tsx
git commit -m "feat(kiosk): add /kiosk layout"
```

---

### Task 39: Kiosk attract screen + persona picker

**Files:**
- Create: `src/components/kiosk/kiosk-attract-screen.tsx`
- Create: `src/components/kiosk/kiosk-persona-picker.tsx`
- Create: `src/app/kiosk/page.tsx`

- [ ] **Step 1: Persona picker (sheet)**

```tsx
// src/components/kiosk/kiosk-persona-picker.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, ShoppingCart, Tag, UserRound, Loader2, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { PERSONAS, type PersonaIcon } from "@/lib/segment/personas";
import { trackKioskSessionStarted } from "@/lib/analytics/events";

const ICONS: Record<PersonaIcon, LucideIcon> = {
  crown: Crown,
  cart: ShoppingCart,
  tag: Tag,
  user: UserRound,
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function KioskPersonaPicker({ open, onClose }: Props) {
  const router = useRouter();
  const [running, setRunning] = useState<string | null>(null);

  async function handlePick(id: string) {
    const persona = PERSONAS.find((p) => p.id === id);
    if (!persona) return;
    setRunning(id);
    toast.loading(`Recognized ${persona.name}`, { id: "kiosk-persona" });
    try {
      await persona.seed();
      trackKioskSessionStarted({ identified: true, persona_id: persona.id });
      toast.success(`Welcome back, ${persona.name.split(" — ")[0]}!`, { id: "kiosk-persona" });
      onClose();
      router.push("/kiosk/menu");
    } catch {
      toast.error("Could not load profile", { id: "kiosk-persona" });
    } finally {
      setRunning(null);
    }
  }

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-[680px] rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black">Scan loyalty code</h2>
            <p className="mt-1 text-sm text-slate-500">
              Pick a simulated scan to continue the demo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {PERSONAS.map((p) => {
            const Icon = ICONS[p.icon];
            const isRunning = running === p.id;
            const isDisabled = running !== null;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePick(p.id)}
                disabled={isDisabled}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-left transition-colors hover:border-[var(--dominos-red)] disabled:opacity-50"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  {isRunning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-bold leading-tight">{p.name}</span>
                  <span className="text-xs text-slate-500">{p.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Attract screen**

```tsx
// src/components/kiosk/kiosk-attract-screen.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { QrCode } from "lucide-react";
import { KioskPersonaPicker } from "./kiosk-persona-picker";
import { trackKioskSessionStarted } from "@/lib/analytics/events";
import { analytics } from "@/lib/segment/bus";

export function KioskAttractScreen() {
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    analytics.page(undefined, "Kiosk Attract");
  }, []);

  function handleTapAnywhere(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("[data-kiosk-qr]")) return;
    trackKioskSessionStarted({ identified: false });
    router.push("/kiosk/menu");
  }

  return (
    <div
      onClick={handleTapAnywhere}
      className="relative flex h-full items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--dominos-dark-blue)] via-[var(--dominos-blue)] to-[var(--dominos-red)] text-white"
    >
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5" aria-hidden />
      <div className="absolute -bottom-32 -left-20 h-[28rem] w-[28rem] rounded-full bg-white/5" aria-hidden />

      <div className="relative flex flex-col items-center gap-4 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-white/70">Domino&apos;s · Self-Order</p>
        <motion.h1
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-7xl font-black tracking-tight"
        >
          TAP TO ORDER
        </motion.h1>
        <p className="text-lg text-white/85">Fresh. Fast. Fired up.</p>
      </div>

      <button
        type="button"
        data-kiosk-qr
        onClick={(e) => {
          e.stopPropagation();
          setShowPicker(true);
        }}
        className="absolute bottom-20 right-12 flex items-center gap-3 rounded-2xl border-2 border-dashed border-white/50 bg-white/10 px-5 py-3 text-left backdrop-blur"
      >
        <QrCode className="h-10 w-10" />
        <span className="flex flex-col">
          <span className="text-xs uppercase tracking-wider text-white/70">Scan for VIP rewards</span>
          <span className="text-sm font-bold">Tap to simulate scan →</span>
        </span>
      </button>

      <KioskPersonaPicker open={showPicker} onClose={() => setShowPicker(false)} />
    </div>
  );
}
```

- [ ] **Step 3: Attract page**

```tsx
// src/app/kiosk/page.tsx
import { KioskAttractScreen } from "@/components/kiosk/kiosk-attract-screen";

export default function KioskAttractPage() {
  return <KioskAttractScreen />;
}
```

- [ ] **Step 4: Verify + smoke**

```bash
npx tsc --noEmit
npm run dev
# Open /kiosk — see gradient + TAP TO ORDER pulse + QR card bottom-right
# Tap anywhere → /kiosk/menu (404 for now, kiosk menu next task)
# Tap QR card → persona picker shows 4 personas
```

- [ ] **Step 5: Commit**

```bash
git add src/components/kiosk/kiosk-attract-screen.tsx src/components/kiosk/kiosk-persona-picker.tsx src/app/kiosk/page.tsx
git commit -m "feat(kiosk): add attract screen and persona picker"
```

---

### Task 40: Kiosk category rail + menu grid

**Files:**
- Create: `src/components/kiosk/kiosk-category-rail.tsx`
- Create: `src/components/kiosk/kiosk-menu-grid.tsx`
- Create: `src/components/kiosk/kiosk-product-tile.tsx`
- Create: `src/app/kiosk/menu/page.tsx`

- [ ] **Step 1: Product tile**

```tsx
// src/components/kiosk/kiosk-product-tile.tsx
"use client";

import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import type { Product } from "@/types/menu";

export function KioskProductTile({ product }: { product: Product }) {
  const price = Math.min(
    ...Object.values(product.prices).filter((v): v is number => typeof v === "number"),
  );
  return (
    <Link
      href={`/kiosk/product/${product.slug}`}
      className="flex flex-col overflow-hidden rounded-2xl border-2 border-slate-100 bg-white transition-transform hover:scale-[1.015] hover:border-[var(--dominos-red)]/60"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        <ProductImage
          src={product.image}
          alt={product.name}
          slug={product.slug}
          category={product.category}
          fill
          sizes="240px"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold leading-tight">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{product.description}</p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="text-sm font-semibold text-slate-500">From</span>
          <span className="text-2xl font-black text-[var(--dominos-red)]">${price.toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Category rail**

```tsx
// src/components/kiosk/kiosk-category-rail.tsx
"use client";

import {
  Pizza,
  Sandwich,
  CupSoda,
  IceCreamCone,
  Wheat,
  Drumstick,
  Leaf,
  LayoutGrid,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const KIOSK_CATEGORIES = [
  { value: "all", label: "All", Icon: LayoutGrid },
  { value: "pizzas", label: "Pizzas", Icon: Pizza },
  { value: "sides", label: "Sides", Icon: Sandwich },
  { value: "drinks", label: "Drinks", Icon: CupSoda },
  { value: "desserts", label: "Desserts", Icon: IceCreamCone },
  { value: "pastas", label: "Pastas", Icon: Wheat },
  { value: "chicken", label: "Chicken", Icon: Drumstick },
  { value: "vegan", label: "Vegan", Icon: Leaf },
] as const satisfies ReadonlyArray<{ value: string; label: string; Icon: LucideIcon }>;

export type KioskCategory = (typeof KIOSK_CATEGORIES)[number]["value"];

interface Props {
  active: KioskCategory;
  onChange: (next: KioskCategory) => void;
}

export function KioskCategoryRail({ active, onChange }: Props) {
  return (
    <nav
      aria-label="Categories"
      className="flex h-full w-56 flex-col gap-2 overflow-y-auto border-r border-slate-100 bg-slate-50 p-4"
    >
      {KIOSK_CATEGORIES.map(({ value, label, Icon }) => {
        const isActive = value === active;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-base font-bold transition-colors",
              isActive
                ? "bg-[var(--dominos-red)] text-white shadow"
                : "bg-white text-slate-700 hover:bg-slate-100",
            )}
          >
            <Icon className="h-6 w-6" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 3: Menu grid screen**

```tsx
// src/components/kiosk/kiosk-menu-grid.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { KioskCategoryRail, type KioskCategory } from "./kiosk-category-rail";
import { KioskProductTile } from "./kiosk-product-tile";
import { useCartStore } from "@/stores/cart-store";
import {
  trackProductListViewed,
  trackProductListFiltered,
} from "@/lib/analytics/events";
import menuData from "@/data/menu.json";
import type { Product } from "@/types/menu";

const products = menuData as unknown as Product[];

export function KioskMenuGrid() {
  const [active, setActive] = useState<KioskCategory>("all");
  const count = useCartStore((s) => s.getItemCount());
  const total = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
  );
  const first = useRef(true);

  const filtered = useMemo(
    () => (active === "all" ? products : products.filter((p) => p.category === active)),
    [active],
  );

  useEffect(() => {
    const payload = filtered.map((p, idx) => ({
      product_id: p.slug,
      name: p.name,
      category: p.category,
      price: Math.min(
        ...Object.values(p.prices).filter((v): v is number => typeof v === "number"),
      ),
      quantity: 1,
      position: idx + 1,
      image_url: p.image,
    }));
    trackProductListViewed(active, payload);
    if (first.current) {
      first.current = false;
      return;
    }
    trackProductListFiltered("kiosk-menu", active, filtered.length);
  }, [active, filtered]);

  return (
    <div className="flex h-full">
      <KioskCategoryRail active={active} onChange={setActive} />
      <div className="flex min-w-0 flex-1 flex-col pt-14">
        <div className="flex items-center justify-between px-6 pb-3">
          <h1 className="text-3xl font-black capitalize">{active === "all" ? "Full menu" : active}</h1>
          {count > 0 && (
            <Link
              href="/kiosk/cart"
              className="flex items-center gap-3 rounded-full bg-[var(--dominos-red)] px-5 py-3 text-base font-bold text-white shadow"
            >
              <ShoppingCart className="h-5 w-5" />
              Review cart · {count} · ${total.toFixed(2)}
            </Link>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-16">
          <div className="grid grid-cols-3 gap-5">
            {filtered.map((p) => (
              <KioskProductTile key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Route**

```tsx
// src/app/kiosk/menu/page.tsx
import { KioskMenuGrid } from "@/components/kiosk/kiosk-menu-grid";

export default function KioskMenuPage() {
  return <KioskMenuGrid />;
}
```

- [ ] **Step 5: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/kiosk/kiosk-category-rail.tsx src/components/kiosk/kiosk-menu-grid.tsx src/components/kiosk/kiosk-product-tile.tsx src/app/kiosk/menu
git commit -m "feat(kiosk): add category rail + menu grid"
```

---

### Task 41: Kiosk number pad

**Files:**
- Create: `src/components/kiosk/kiosk-number-pad.tsx`

- [ ] **Step 1: Create**

```tsx
// src/components/kiosk/kiosk-number-pad.tsx
"use client";

import { Minus, Plus } from "lucide-react";

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}

export function KioskNumberPad({ value, onChange, min = 1, max = 20 }: Props) {
  return (
    <div className="inline-flex items-center gap-4 rounded-full border-2 border-slate-200 bg-white px-2 py-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 disabled:opacity-40"
      >
        <Minus className="h-6 w-6" />
      </button>
      <span className="min-w-[2.5rem] text-center text-2xl font-black">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--dominos-red)] text-white disabled:opacity-40"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/kiosk/kiosk-number-pad.tsx
git commit -m "feat(kiosk): add number pad"
```

---

### Task 42: Kiosk product detail

**Files:**
- Create: `src/components/kiosk/kiosk-product-detail.tsx`
- Create: `src/app/kiosk/product/[slug]/page.tsx`

- [ ] **Step 1: Detail component**

```tsx
// src/components/kiosk/kiosk-product-detail.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductImage } from "@/components/ui/product-image";
import { KioskNumberPad } from "./kiosk-number-pad";
import { useCartStore } from "@/stores/cart-store";
import {
  BRAND,
  toSegmentProduct,
  trackProductAdded,
  trackProductViewed,
} from "@/lib/analytics/events";
import menuData from "@/data/menu.json";
import type { Product } from "@/types/menu";
import { cn } from "@/lib/utils";

const products = menuData as unknown as Product[];
const SIZES = ["small", "medium", "large"] as const;
const CRUSTS = ["classic", "thin", "stuffed"] as const;

export function KioskProductDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const product = useMemo(() => products.find((p) => p.slug === slug), [slug]);
  const addItem = useCartStore((s) => s.addItem);
  const [size, setSize] = useState<(typeof SIZES)[number]>("medium");
  const [crust, setCrust] = useState<(typeof CRUSTS)[number]>("classic");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!product) return;
    const price = product.prices[size] ?? product.prices.single ?? 0;
    trackProductViewed({
      product_id: product.slug,
      name: product.name,
      category: product.category,
      price,
      quantity: 1,
      image_url: product.image,
      brand: BRAND,
      url: `/kiosk/product/${product.slug}`,
    });
  }, [product, size]);

  if (!product) notFound();

  const isPizza = product.category === "pizzas";
  const unitPrice = (isPizza ? product.prices[size] : product.prices.single) ?? 0;
  const total = unitPrice * qty;

  function handleAdd() {
    const item = {
      id: `${product!.slug}-${Date.now()}`,
      productSlug: product!.slug,
      productName: product!.name,
      category: product!.category,
      image: product!.image,
      quantity: qty,
      unitPrice,
      ...(isPizza && { size, crust }),
    };
    addItem(item);
    trackProductAdded(toSegmentProduct(item));
    toast.success(`Added ${qty} × ${product!.name}`);
    router.push("/kiosk/menu");
  }

  return (
    <div className="flex h-full pt-14">
      <div className="w-1/2 bg-slate-50 p-8">
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl">
          <ProductImage
            src={product.image}
            alt={product.name}
            slug={product.slug}
            category={product.category}
            fill
            sizes="640px"
          />
        </div>
      </div>
      <div className="flex w-1/2 flex-col p-10">
        <h1 className="text-4xl font-black">{product.name}</h1>
        <p className="mt-3 text-base text-slate-500">{product.description}</p>

        {isPizza && (
          <div className="mt-8 space-y-6">
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Size</h2>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {SIZES.map((s) => {
                  const price = product.prices[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      disabled={price === undefined}
                      className={cn(
                        "flex flex-col items-center rounded-2xl border-2 px-3 py-4 text-base font-bold transition-colors disabled:opacity-30",
                        size === s
                          ? "border-[var(--dominos-red)] bg-[var(--dominos-red)]/10 text-[var(--dominos-red)]"
                          : "border-slate-200 text-slate-700",
                      )}
                    >
                      <span className="capitalize">{s}</span>
                      {price !== undefined && (
                        <span className="mt-1 text-sm text-slate-500">${price.toFixed(2)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Crust</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {CRUSTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCrust(c)}
                    className={cn(
                      "rounded-full border-2 px-5 py-2.5 text-sm font-bold capitalize transition-colors",
                      crust === c
                        ? "border-[var(--dominos-red)] bg-[var(--dominos-red)] text-white"
                        : "border-slate-200 text-slate-700",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        <section className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Quantity</h2>
          <div className="mt-2">
            <KioskNumberPad value={qty} onChange={setQty} />
          </div>
        </section>

        <button
          type="button"
          onClick={handleAdd}
          className="mt-auto flex items-center justify-center rounded-3xl bg-[var(--dominos-red)] py-6 text-2xl font-black text-white shadow-xl active:scale-[0.99]"
        >
          Add to cart · ${total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Route**

```tsx
// src/app/kiosk/product/[slug]/page.tsx
import { KioskProductDetail } from "@/components/kiosk/kiosk-product-detail";

export default async function KioskProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <KioskProductDetail slug={slug} />;
}
```

- [ ] **Step 3: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/kiosk/kiosk-product-detail.tsx src/app/kiosk/product
git commit -m "feat(kiosk): add product detail screen"
```

---

### Task 43: Kiosk cart review

**Files:**
- Create: `src/components/kiosk/kiosk-cart-review.tsx`
- Create: `src/app/kiosk/cart/page.tsx`

- [ ] **Step 1: Cart review**

```tsx
// src/components/kiosk/kiosk-cart-review.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { KioskNumberPad } from "./kiosk-number-pad";
import { useCartStore } from "@/stores/cart-store";
import {
  trackCartViewed,
  trackProductRemoved,
  toSegmentProduct,
} from "@/lib/analytics/events";

export function KioskCartReview() {
  const { items, updateQuantity, removeItem, getSubtotal, getDeliveryFee, getTotal } =
    useCartStore();
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  useEffect(() => {
    if (items.length === 0) return;
    trackCartViewed(
      "kiosk-cart",
      items.map((item, idx) => toSegmentProduct(item, idx + 1)),
      subtotal,
    );
  }, [items, subtotal]);

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 pt-14">
        <ShoppingBag className="h-20 w-20 text-slate-300" />
        <h1 className="text-3xl font-black">Your cart is empty</h1>
        <Link
          href="/kiosk/menu"
          className="rounded-2xl bg-[var(--dominos-red)] px-8 py-4 text-lg font-bold text-white shadow"
        >
          Browse menu
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full pt-14">
      <div className="flex w-3/5 flex-col overflow-y-auto border-r border-slate-100 px-8 py-6">
        <h1 className="text-3xl font-black">Your order</h1>
        <div className="mt-4 flex flex-col divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-4 py-4">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-50">
                <ProductImage
                  src={item.image}
                  alt={item.productName}
                  slug={item.productSlug}
                  category={item.category}
                  fill
                  sizes="96px"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold leading-tight">{item.productName}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      trackProductRemoved(
                        item.productSlug,
                        item.productName,
                        item.quantity,
                        { category: item.category, price: item.unitPrice },
                      );
                      removeItem(item.id);
                    }}
                    className="text-sm font-semibold text-slate-500 underline-offset-2 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                {(item.size || item.crust) && (
                  <p className="text-sm text-slate-500">
                    {[item.size, item.crust].filter(Boolean).join(" · ")}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <KioskNumberPad
                    value={item.quantity}
                    onChange={(q) => updateQuantity(item.id, q)}
                  />
                  <span className="text-xl font-black">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-2/5 flex-col bg-slate-50 px-8 py-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Summary</h2>
        <div className="mt-3 flex flex-col gap-2 text-base">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Delivery fee</span>
            <span className="font-semibold">
              {deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}
            </span>
          </div>
          <div className="mt-1 flex justify-between border-t border-slate-200 pt-3 text-2xl font-black">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <Link
            href="/kiosk/checkout"
            className="flex items-center justify-center rounded-3xl bg-[var(--dominos-red)] py-6 text-2xl font-black text-white shadow-xl"
          >
            Continue to pay
          </Link>
          <Link
            href="/kiosk/menu"
            className="flex items-center justify-center rounded-3xl border-2 border-slate-300 py-4 text-base font-bold text-slate-700"
          >
            Add more items
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Route**

```tsx
// src/app/kiosk/cart/page.tsx
import { KioskCartReview } from "@/components/kiosk/kiosk-cart-review";

export default function KioskCartPage() {
  return <KioskCartReview />;
}
```

- [ ] **Step 3: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/kiosk/kiosk-cart-review.tsx src/app/kiosk/cart
git commit -m "feat(kiosk): add cart review screen"
```

---

### Task 44: Kiosk checkout (pay-at-counter / pay-by-card)

**Files:**
- Create: `src/components/kiosk/kiosk-checkout.tsx`
- Create: `src/app/kiosk/checkout/page.tsx`

- [ ] **Step 1: Checkout component**

```tsx
// src/components/kiosk/kiosk-checkout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Banknote, CreditCard, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { useOrderStore } from "@/stores/order-store";
import {
  toSegmentProduct,
  trackCheckoutStarted,
  trackOrderCompleted,
  trackPaymentInfoEntered,
} from "@/lib/analytics/events";
import type { Order } from "@/types/order";

type PayMethod = "counter" | "card";
type Phase = "choose" | "card-inserting" | "submitting";

export function KioskCheckout() {
  const router = useRouter();
  const { items, getSubtotal, getDeliveryFee, getTotal, clearCart, couponCode, couponDiscount } = useCartStore();
  const { selectedStore } = useUIStore();
  const { setCurrentOrder, addToHistory } = useOrderStore();

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  const [phase, setPhase] = useState<Phase>("choose");

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/kiosk/cart");
      return;
    }
    trackCheckoutStarted(
      items.map((item, idx) => toSegmentProduct(item, idx + 1)),
      subtotal,
      deliveryFee,
      total,
      couponCode ?? undefined,
    );
  }, [items, subtotal, deliveryFee, total, couponCode, router]);

  async function submitOrder(method: PayMethod) {
    setPhase("submitting");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items,
          deliveryMethod: "pickup",
          deliveryAddress: null,
          subtotal,
          deliveryFee: 0,
          discount: couponDiscount,
          total,
          couponCode,
          specialInstructions: `Kiosk order · paid ${method}`,
          storeId: selectedStore?.id ?? "store-001",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const order = (await res.json()) as Order;
      setCurrentOrder(order);
      addToHistory(order);
      trackPaymentInfoEntered(method === "card" ? "card" : "cash");
      trackOrderCompleted(
        order.id,
        items.map((item, idx) => toSegmentProduct(item, idx + 1)),
        order.subtotal,
        order.total,
        order.deliveryFee,
        order.discount,
        order.couponCode,
      );
      clearCart();
      router.replace(`/kiosk/thanks?id=${order.id}&method=${method}`);
    } catch (e) {
      console.error(e);
      toast.error("Could not place order");
      setPhase("choose");
    }
  }

  function handlePayCounter() {
    submitOrder("counter");
  }

  function handlePayCard() {
    setPhase("card-inserting");
    setTimeout(() => submitOrder("card"), 2000);
  }

  if (phase === "card-inserting") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 bg-slate-950 pt-14 text-white">
        <div className="flex h-64 w-80 items-center justify-center rounded-3xl border-4 border-slate-700 bg-slate-900">
          <CreditCard className="h-24 w-24 animate-pulse text-slate-300" />
        </div>
        <h1 className="text-3xl font-black">Insert or tap card</h1>
        <p className="text-base text-slate-400">Processing...</p>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div className="flex h-full items-center justify-center pt-14">
        <Loader2 className="h-16 w-16 animate-spin text-[var(--dominos-red)]" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center pt-20">
      <h1 className="text-4xl font-black">Choose payment</h1>
      <p className="mt-2 text-base text-slate-500">Total to pay: <span className="font-black">${total.toFixed(2)}</span></p>

      <div className="mt-10 grid w-full max-w-4xl grid-cols-2 gap-6 px-10">
        <button
          type="button"
          onClick={handlePayCounter}
          className="flex flex-col items-center gap-5 rounded-3xl border-4 border-slate-200 bg-white p-10 transition-colors hover:border-[var(--dominos-red)]"
        >
          <Banknote className="h-16 w-16 text-slate-700" />
          <span className="text-2xl font-black">Pay at counter</span>
          <span className="text-sm text-slate-500">Cash or card at the register</span>
        </button>

        <button
          type="button"
          onClick={handlePayCard}
          className="flex flex-col items-center gap-5 rounded-3xl bg-[var(--dominos-red)] p-10 text-white transition-transform hover:scale-[1.01]"
        >
          <CreditCard className="h-16 w-16" />
          <span className="text-2xl font-black">Pay by card</span>
          <span className="text-sm text-white/80">Tap, insert, or swipe</span>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Route**

```tsx
// src/app/kiosk/checkout/page.tsx
import { KioskCheckout } from "@/components/kiosk/kiosk-checkout";

export default function KioskCheckoutPage() {
  return <KioskCheckout />;
}
```

- [ ] **Step 3: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/kiosk/kiosk-checkout.tsx src/app/kiosk/checkout
git commit -m "feat(kiosk): add checkout with pay-counter + pay-card"
```

---

### Task 45: Kiosk thanks screen

**Files:**
- Create: `src/components/kiosk/kiosk-thanks.tsx`
- Create: `src/app/kiosk/thanks/page.tsx`

- [ ] **Step 1: Thanks component**

```tsx
// src/components/kiosk/kiosk-thanks.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, QrCode } from "lucide-react";

export function KioskThanks() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params?.get("id") ?? "";
  const method = params?.get("method") ?? "counter";
  const [remaining, setRemaining] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timer);
          router.replace("/kiosk");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 pt-14">
      <CheckCircle2 className="h-24 w-24 text-[var(--dominos-green)]" />
      <div className="text-center">
        <h1 className="text-5xl font-black">Order placed</h1>
        <p className="mt-2 text-lg text-slate-500">
          {method === "card" ? "Payment received." : "Please pay at the counter."}
        </p>
      </div>

      <div className="rounded-3xl border-2 border-slate-200 bg-white px-10 py-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Your order number</p>
        <p className="mt-1 font-mono text-3xl font-black">#{orderId.slice(0, 8).toUpperCase()}</p>
      </div>

      <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
        <QrCode className="h-16 w-16 text-slate-700" />
        <div>
          <p className="text-sm font-bold">Track on your phone</p>
          <p className="text-xs text-slate-500">Scan to follow updates</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">Returning to home in {remaining}s...</p>
    </div>
  );
}
```

- [ ] **Step 2: Route**

```tsx
// src/app/kiosk/thanks/page.tsx
import { Suspense } from "react";
import { KioskThanks } from "@/components/kiosk/kiosk-thanks";

export default function KioskThanksPage() {
  return (
    <Suspense fallback={null}>
      <KioskThanks />
    </Suspense>
  );
}
```

- [ ] **Step 3: Verify + commit**

```bash
npx tsc --noEmit
git add src/components/kiosk/kiosk-thanks.tsx src/app/kiosk/thanks
git commit -m "feat(kiosk): add thanks screen with auto-return"
```

---

### Task 46: Kiosk full-build + walkthrough

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: succeeds. `/kiosk`, `/kiosk/menu`, `/kiosk/product/[slug]`, `/kiosk/cart`, `/kiosk/checkout`, `/kiosk/thanks` appear in output.

- [ ] **Step 2: Walkthrough**

```bash
npm run dev
```

1. `/kiosk` — attract pulses, QR card bottom-right.
2. Tap attract → `/kiosk/menu` with rail + grid.
3. Tap any pizza → product detail; pick size/crust/qty; Add to cart → toast → back to menu.
4. Tap "Review cart" top-right → `/kiosk/cart` → Continue to pay.
5. `/kiosk/checkout` → "Pay by card" → 2s animation → POST `/api/orders` → `/kiosk/thanks` with order number + 10s countdown → back to `/kiosk`.
6. Re-enter `/kiosk`, tap QR → persona picker → pick Sarah VIP → seed fires → routes to `/kiosk/menu` with cart already primed + identity set.
7. Verify Event Inspector: events show `source: "kiosk"`, `app_name: "Dominos Kiosk"`.
8. Wait 90 seconds anywhere past `/kiosk` (or temporarily lower `IDLE_MS` to 5000 to confirm) — idle watchdog fires, cart clears, `analytics.reset()` fires, routes to `/kiosk`.

- [ ] **Step 3: Commit any fixes**

If anything broke, fix inline and commit: `fix(kiosk): ...`.

---

## Phase 6 — Seed demo users in Neon

### Task 47: Demo user seed script

**Files:**
- Create: `scripts/seed-demo-users.mjs`

- [ ] **Step 1: Create the script**

```js
// scripts/seed-demo-users.mjs
// One-time, idempotent seed for demo users + history.
// Run locally:  node scripts/seed-demo-users.mjs
// Run in prod:  DATABASE_URL=... DATABASE_URL_UNPOOLED=... node scripts/seed-demo-users.mjs

import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { betterAuth } from "better-auth";

const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL or DATABASE_URL_UNPOOLED must be set.");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const auth = betterAuth({
  database: pool,
  emailAndPassword: { enabled: true },
  session: { expiresIn: 60 * 60 * 24 * 7 },
});

const PASSWORD = "demo1234";

const USERS = [
  {
    personaId: "sarah_vip",
    email: "sarah.vip@dominosdemo.com",
    name: "Sarah Thompson",
    tier: "gold",
    points: 1280,
    lifetimeOrders: 12,
    address: { label: "Home", street: "42 Wallaby Way", suburb: "Sydney", state: "NSW", postcode: "2000" },
  },
  {
    personaId: "dan_abandoner",
    email: "dan.abandoner@dominosdemo.com",
    name: "Dan Roberts",
    tier: "bronze",
    points: 0,
    lifetimeOrders: 0,
    address: null,
  },
  {
    personaId: "alex_deals",
    email: "alex.deals@dominosdemo.com",
    name: "Alex Ng",
    tier: "silver",
    points: 520,
    lifetimeOrders: 4,
    address: { label: "Home", street: "19 Brunswick St", suburb: "Fitzroy", state: "VIC", postcode: "3065" },
  },
  {
    personaId: "jamie_new",
    email: "jamie.new@dominosdemo.com",
    name: "Jamie Patel",
    tier: "bronze",
    points: 0,
    lifetimeOrders: 0,
    address: null,
  },
];

async function ensureUser(u) {
  // better-auth's signUpEmail will no-op (error) if user exists — swallow that.
  try {
    const result = await auth.api.signUpEmail({
      body: { email: u.email, password: PASSWORD, name: u.name },
    });
    if (result?.user?.id) {
      console.log(`[seed] Created user ${u.email} (${result.user.id})`);
      return result.user.id;
    }
  } catch (e) {
    // User probably exists. Find their id via a raw query.
  }

  const existing = await pool.query(`select id from "user" where email = $1 limit 1`, [u.email]);
  if (existing.rows[0]?.id) {
    console.log(`[seed] Reusing existing user ${u.email} (${existing.rows[0].id})`);
    return existing.rows[0].id;
  }
  throw new Error(`Could not create or find user ${u.email}`);
}

async function seedLoyalty(userId, u) {
  await pool.query(
    `insert into loyalty_accounts (user_id, points, tier, lifetime_points, lifetime_orders)
     values ($1, $2, $3, $4, $5)
     on conflict (user_id) do update set
       points = excluded.points,
       tier = excluded.tier,
       lifetime_points = excluded.lifetime_points,
       lifetime_orders = excluded.lifetime_orders`,
    [userId, u.points, u.tier, u.points, u.lifetimeOrders],
  );
}

async function seedAddress(userId, u) {
  if (!u.address) return;
  const existing = await pool.query(
    `select id from saved_addresses where user_id = $1 and label = $2 limit 1`,
    [userId, u.address.label],
  );
  if (existing.rows[0]?.id) return;
  await pool.query(
    `insert into saved_addresses (user_id, label, street, suburb, state, postcode, is_default)
     values ($1, $2, $3, $4, $5, $6, 1)`,
    [userId, u.address.label, u.address.street, u.address.suburb, u.address.state, u.address.postcode],
  );
}

async function seedOrderHistory(userId, u) {
  if (u.lifetimeOrders === 0) return;
  const existing = await pool.query(
    `select count(*)::int as n from orders where user_id = $1 and coupon_code = $2`,
    [userId, `DEMO-SEED-${u.personaId}`],
  );
  if ((existing.rows[0]?.n ?? 0) >= u.lifetimeOrders) {
    console.log(`[seed] ${u.email} already has seeded order history`);
    return;
  }
  const now = new Date();
  for (let i = 0; i < u.lifetimeOrders; i++) {
    const placedAt = new Date(now.getTime() - (i + 1) * 86_400_000 * 3);
    const subtotal = 28 + (i % 4) * 4;
    const total = subtotal + 7.95;
    const result = await pool.query(
      `insert into orders (user_id, store_id, status, delivery_method, delivery_address,
         subtotal, delivery_fee, discount, total, coupon_code, status_timestamps, created_at, updated_at)
       values ($1, 'store-001', 'delivered', 'delivery', '42 Wallaby Way, Sydney NSW 2000',
         $2, '7.95', '0', $3, $4, $5, $6, $6) returning id`,
      [
        userId,
        String(subtotal),
        String(total),
        `DEMO-SEED-${u.personaId}`,
        JSON.stringify({ placed: placedAt.toISOString(), delivered: new Date(placedAt.getTime() + 40 * 60_000).toISOString() }),
        placedAt,
      ],
    );
    const orderId = result.rows[0].id;
    await pool.query(
      `insert into order_items (order_id, product_slug, product_name, size, crust, quantity, unit_price, total_price)
       values ($1, 'meat-lovers', 'Meat Lovers', 'large', 'classic', 1, '16.99', '16.99'),
              ($1, 'garlic-bread', 'Garlic Bread', null, null, 1, '6.95', '6.95')`,
      [orderId],
    );
  }
  console.log(`[seed] ${u.email}: inserted ${u.lifetimeOrders} historical orders`);
}

async function main() {
  for (const u of USERS) {
    const userId = await ensureUser(u);
    await seedLoyalty(userId, u);
    await seedAddress(userId, u);
    await seedOrderHistory(userId, u);
  }
  await pool.end();
  console.log("[seed] done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Run the script locally**

```bash
node scripts/seed-demo-users.mjs
```

Expected: logs four `Created user ...` or `Reusing existing user ...` lines, plus "inserted N historical orders" for VIP and Deal Hunter, plus "done.".

- [ ] **Step 3: Verify by signing in**

Run `npm run dev`. On `/m/login`, expand "Demo accounts", tap "Sarah — VIP", submit. Expected: signs in, `/m/orders` shows ≥12 past orders.

- [ ] **Step 4: Run script twice to confirm idempotent**

```bash
node scripts/seed-demo-users.mjs
```

Expected: logs show "Reusing existing user" + "already has seeded order history" — no duplicate rows.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-demo-users.mjs
git commit -m "feat(scripts): add idempotent demo user seed"
```

---

## Phase 7 — Final verification & deploy

### Task 48: Full integration walkthrough

No code changes — this task verifies all three shells interoperate as designed in spec §9.

- [ ] **Step 1: Clean rebuild**

```bash
rm -rf .next
npm run build
```

Expected: build passes. No route errors. No unexpected warnings.

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

- [ ] **Step 3: Three-window continuity test**

Open three browser windows (not incognito) side-by-side:
- Window W: `http://localhost:3000/`
- Window M: `http://localhost:3000/m`
- Window K: `http://localhost:3000/kiosk`

In window W:
1. Open the Demo Toolbar (bottom-right pill).
2. Under "Mode", confirm **Web** is highlighted.
3. Under "Load persona", click **Sarah — VIP**. Wait for toast "Loaded Sarah — VIP Customer".

In window M (without reloading):
4. Confirm cart badge appears with 1 item (Sarah's primed Meat Lovers).
5. Confirm `/m` home shows the Reorder strip populated with items from Sarah's history (Meat Lovers / Garlic Bread).

In window K:
6. Tap the attract screen → `/kiosk/menu`.
7. Confirm "Review cart" button appears top-right (cart carries over).
8. Tap it → `/kiosk/cart` → confirm Sarah's Meat Lovers is in the cart.

- [ ] **Step 4: Add-from-kiosk, verify-in-mobile**

In window K:
9. Tap "Add more items" → browse to **Sides** → tap **Garlic Bread** → **Add to cart**.

In window M:
10. Within ~1 second, cart badge updates to 2. Tap cart → confirm Garlic Bread appears.

- [ ] **Step 5: Checkout in kiosk, see order in mobile**

In window K:
11. Go to cart → Continue to pay → Pay by card (2s delay) → thanks screen with order ID.

In window M:
12. Sign out if signed in, then sign in as `sarah.vip@dominosdemo.com` / `demo1234` via `/m/login` → Demo accounts → Sarah VIP → submit.
13. Go to Orders tab → confirm the just-placed kiosk order appears at the top.

- [ ] **Step 6: Event attribution**

In window W:
14. Click **Segment Demo** → it was already displaying the Event Inspector via the FAB. Open the Event Inspector → filter to the last 10 events.
15. Confirm at least one event from each shell:
    - Events with `source: "web"` / `app_name: "Dominos Web"` from window W interactions.
    - Events with `source: "mobile"` / `app_name: "Dominos Mobile"` from window M.
    - Events with `source: "kiosk"` / `app_name: "Dominos Kiosk"` from window K.
    - `Kiosk Session Started`, `Order Completed`, `Product Added` all present.

- [ ] **Step 7: Idle reset**

In window K:
16. Temporarily change `IDLE_MS` in `src/components/kiosk/kiosk-idle-watchdog.tsx` from `90_000` to `5_000`.
17. Save, wait for HMR to reload, then open `/kiosk/menu`, don't touch anything for 6 seconds.
18. Confirm: cart clears, URL returns to `/kiosk`, `Kiosk Idle Reset` event appears in the inspector, identity resets.
19. **Revert the `IDLE_MS` change back to `90_000`** and save.

- [ ] **Step 8: Demo mode off (production-site behavior)**

In any window:
20. Open the Demo Toolbar → toggle **Show demo widgets** off.
21. Confirm: FAB, Event Inspector, Personalization Banner, Next Best Offer, Cart Abandonment Nudge all disappear.
22. Confirm: the Demo Toolbar itself is still visible (it's the escape hatch). Mode switcher + Frame toggle still work.
23. Toggle it back on.

- [ ] **Step 9: Frame toggle**

24. Open the Demo Toolbar → toggle **Show device frame** off.
25. Navigate to `/m` → confirm the mobile shell fills the viewport with no phone bezel.
26. Navigate to `/kiosk` → confirm the kiosk attract fills the viewport with no kiosk bezel.
27. Toggle frame back on → confirm frames reappear.

- [ ] **Step 10: Reset state**

28. Open the Demo Toolbar → click "Reset demo state" twice (once to arm, once to confirm).
29. Confirm: event log clears, identity clears, cart clears across all three windows, audiences/journey clear.

- [ ] **Step 11: No-op commit if fixes were needed**

If any step above failed and required a fix, commit it: `fix: integration fixes from final walkthrough`. Otherwise skip.

---

### Task 49: Final full-project type + build + lint check

- [ ] **Step 1: Clean install & build**

```bash
rm -rf node_modules .next
npm install
npx tsc --noEmit
npm run lint
npm run build
```

Expected: all four commands complete successfully with zero errors. Warnings are acceptable but check they aren't from new files.

- [ ] **Step 2: If any errors appear, fix and re-run**

Errors from generated files / known cruft are out of scope. Errors in any of the new `src/app/m/**`, `src/app/kiosk/**`, `src/components/mobile/**`, `src/components/kiosk/**`, `src/lib/segment/source.ts`, `src/lib/segment/cart-broadcast.ts`, `scripts/seed-demo-users.mjs` **must** be fixed before continuing.

- [ ] **Step 3: Final commit if fixes were needed**

```bash
git commit -am "fix: type/lint cleanup from final check"
```

---

### Task 50: Deploy to Vercel

- [ ] **Step 1: Push the branch**

```bash
git status
git log --oneline -n 20
git push
```

- [ ] **Step 2: Confirm existing env vars on Vercel**

In the Vercel project settings, confirm all of these exist in the production environment (set via `vercel env ls` or the dashboard):

- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_SEGMENT_WRITE_KEY`

No new env vars are required.

- [ ] **Step 3: Trigger a preview deploy**

Either push to a non-main branch and open the preview URL, or run `vercel` locally to get a preview URL.

- [ ] **Step 4: Run the seed script against the production DB**

From your laptop, once:

```bash
DATABASE_URL_UNPOOLED='<prod-unpooled-url>' DATABASE_URL='<prod-pooled-url>' node scripts/seed-demo-users.mjs
```

Expected: four users created or reused, loyalty + orders seeded. Script is idempotent, so re-running is safe.

- [ ] **Step 5: Preview walkthrough**

Open the preview URL in three browser windows. Repeat Task 48 steps 3–10 against the preview. Expected: identical behavior.

- [ ] **Step 6: Promote to production**

Once the preview passes, merge the branch to `main` and confirm production deploy succeeds. No other promotion action needed — Vercel auto-deploys from `main`.

---

## Self-Review

I walked through this plan against spec sections 1–11.

**Spec coverage:**
- §1 Goal (three surfaces, shared story): Tasks 7–11 (web), 15–34 (mobile), 35–46 (kiosk), 48 (integration).
- §2 Non-goals: honored — no monorepo, no server-state migration, no OTP, no PWA.
- §3 Constraints: single project, existing env vars, Next.js 16 conventions (Task 3 uses `await params`), no new deps.
- §4 Architecture: Tasks 7 (web layout), 20 (mobile layout), 38 (kiosk layout) wire the three route groups around the existing root `SegmentProvider`.
- §4.2 Shared primitives: unchanged; Tasks 1–6 extend bus + store without breaking call sites.
- §4.3 Mode-specific components: covered 1:1 by Tasks 15–31 (mobile) and 35–45 (kiosk).
- §4.4 DemoToolbar extensions: Tasks 12–14.
- §5 Routing: Tasks 8–11 for `(web)`, 20–31 for `/m/*`, 38–45 for `/kiosk/*`. URLs match the spec exactly.
- §6.1 Cross-mode continuity via persist: Task 5 extends ui-store with persist for `frameEnabled`; cart-store and segment-store already have it.
- §6.2 Cross-tab continuity: Tasks 3–4 (cart broadcast).
- §6.3 Event source attribution: Tasks 1–2.
- §6.4 Identity across shells: Task 31 (mobile login reuses `authClient`), Task 39 (kiosk cosmetic persona picker).
- §6.5 Persona seeding in Neon: Task 47.
- §7 Visual/interaction specs: embedded in the component tasks.
- §8 Analytics events: Task 6 adds the three new helpers; Tasks 39/43/44 call them.
- §9 Verification plan: Task 48 executes steps 4.1–4.9 of the spec.
- §10 Risks/tradeoffs: tasks respect them (no `<LoginForm/>` modification per Task 31 note).
- §11 Open questions: none — all taken as approved.

**Placeholder scan:** no TBDs, no "similar to", no "add error handling" — every step contains the actual code / commands / expected output. Task 28 has a conditional "if `deals.json` shape differs, mirror `deals-grid.tsx`" but it includes the exact remediation path and is bounded — acceptable because the target file was not readable at plan-authoring time.

**Type consistency:** `resolveSourceFromPath` / `appNameForSource` / `AppSource` used consistently in Tasks 1, 2, 12. `MOBILE_CATEGORIES` / `MobileCategory` consistent in Tasks 22, 24. `KIOSK_CATEGORIES` / `KioskCategory` consistent in Tasks 40. `KioskNumberPad` prop shape `{ value, onChange, min?, max? }` used consistently in Tasks 41, 42, 43. `trackKioskSessionStarted({ identified, persona_id? })` signature used in Tasks 6, 39. `Order`, `CartItem`, `Product` types reused from existing `@/types/*` everywhere — no drift.

---

Plan complete and saved to `docs/superpowers/plans/2026-04-30-mobile-kiosk-experiences.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?















