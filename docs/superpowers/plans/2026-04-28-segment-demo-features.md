# Segment CDP Demo Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a suite of "wow factor" Segment CDP demo features to the Domino's demo site — a real-time Event Inspector overlay, client-side Audiences engine with personalization, Identity Debug panel, Journey visualizer, and enhanced event coverage — so a Segment Solutions Engineer can show every core capability of the platform (track / identify / group / alias, traits, computed traits, audiences, personalization, identity resolution) live in a browser.

**Architecture:** All features are purely client-side add-ons layered on top of the existing Segment Analytics.js SDK (`@segment/analytics-next`). A single `AnalyticsBus` wraps the existing `analytics` singleton and mirrors every event/identify/page/group call to a Zustand store, a `BroadcastChannel`, and a localStorage log. Every new UI surface (Event Inspector FAB + drawer, Audiences panel, Identity panel, Journey view, Demo Toolbar) subscribes to that bus. Computed traits and audiences run in a small client-side rules engine (`lib/segment/audiences.ts`) that re-evaluates on every event/identify and re-fires `identify` with updated traits. A `Demo Mode` toggle gates all overlays so the site looks like a real production site when the toggle is off.

**Tech Stack:** Next.js 16 App Router (React 19), TypeScript, Tailwind v4, shadcn/ui (base-nova style), Zustand (with `persist`), Framer Motion, `@segment/analytics-next`, Sonner for toasts, Lucide icons. No new external dependencies required.

---

## File Structure

**New files — Segment core infra:**
- `src/lib/segment/bus.ts` — `AnalyticsBus` wrapper: proxies `analytics.track/identify/page/group/alias/reset`, emits to local store + `BroadcastChannel` + localStorage ring buffer.
- `src/lib/segment/types.ts` — shared types: `LoggedEvent`, `EventKind`, `AudienceDefinition`, `ComputedTrait`, `JourneyStage`.
- `src/lib/segment/storage.ts` — localStorage ring buffer (capped at 500 events) for persistence across reloads.
- `src/lib/segment/audiences.ts` — audience & computed-trait rules engine + pre-built definitions.
- `src/lib/segment/journey.ts` — funnel stage classifier (Visitor → Engaged → Cart Abandoner → Customer → Repeat Customer → VIP).
- `src/lib/segment/personas.ts` — pre-built demo personas + seed scripts.

**New files — Zustand stores:**
- `src/stores/segment-store.ts` — event log, audience memberships, computed traits, journey stage, demo-mode flag.

**New files — UI surfaces:**
- `src/components/segment/demo-fab.tsx` — floating "Segment Demo" button (bottom-right) that opens the inspector.
- `src/components/segment/event-inspector.tsx` — sheet/drawer with the real-time event stream, filters, event detail panel.
- `src/components/segment/event-row.tsx` — single-event list row (type badge, name, timestamp, expand).
- `src/components/segment/event-detail.tsx` — expanded JSON payload view with copy-to-clipboard.
- `src/components/segment/audiences-panel.tsx` — tab showing audience list with membership badges + "preview" toggles.
- `src/components/segment/identity-panel.tsx` — tab showing anonymousId, userId, traits table, identity timeline.
- `src/components/segment/journey-panel.tsx` — tab showing funnel progression with current stage highlighted.
- `src/components/segment/computed-traits-panel.tsx` — tab showing live-computed traits (LTV, order count, days since last order, favorite category).
- `src/components/segment/demo-toolbar.tsx` — top-right micro-toolbar with demo-mode switch, persona loader dropdown, reset button.
- `src/components/segment/personalization-banner.tsx` — audience-driven hero banner swapper on the home page.
- `src/components/segment/cart-abandonment-nudge.tsx` — toast nudge triggered by the Cart Abandoner audience.
- `src/components/segment/next-best-offer.tsx` — recommended-deal card driven by computed traits, shown on `/menu`.

**New files — provider wiring:**
- `src/components/segment/segment-provider.tsx` — top-level client provider: subscribes to the bus, mounts the inspector/FAB/toolbar, renders personalization widgets, runs the audiences engine.

**Modified files:**
- `src/lib/analytics/segment.ts` — re-export `analytics` from `bus.ts` so every existing `track*` call flows through the bus with zero call-site changes.
- `src/lib/analytics/events.ts` — add `trackGroup`, `trackAlias`, `trackNewsletterSubscribed`, `trackVideoPlayed`, `trackFormAbandoned`, `trackError` (Segment Spec v2 completions).
- `src/app/layout.tsx` — wrap children with `<SegmentProvider>` inside `<AnalyticsProvider>`.
- `src/app/page.tsx` — replace the hero block with `<PersonalizationBanner />` when an audience matches, otherwise keep the existing `<HeroCarousel />`.
- `src/app/menu/page.tsx` — insert `<NextBestOffer />` above the product grid.
- `src/app/checkout/page.tsx` — fire the new `Form Abandoned` event on `beforeunload` with filled field count.
- `src/types/analytics.ts` — extend `UserTraits` with the optional computed-trait fields (already partial) and add an `AudienceMembership` type.

**Why this shape:** each file has one responsibility. The bus is the single seam between SDK and UI — every overlay consumes the same log. Stores persist state across reloads so demo reloads keep history. Personalization components are tiny leaf nodes that just read audience membership and render — keeps surface-level pages readable.

---

## Self-Review (done inline below each task)

Every task below lists exact files, exact code, test commands, and expected output. No placeholders. Types/names are consistent across tasks (e.g. `logEvent`, `useSegmentStore`, `EVENT_KIND_TRACK`).

---

### Task 1: Segment core types

**Files:**
- Create: `src/lib/segment/types.ts`

- [ ] **Step 1: Create the types file**

Write the exact content:

```ts
// src/lib/segment/types.ts
export type EventKind =
  | "track"
  | "identify"
  | "page"
  | "group"
  | "alias"
  | "reset";

export interface LoggedEvent {
  id: string;
  kind: EventKind;
  name?: string;                 // event name (track) / page name (page) / undefined
  userId?: string | null;
  anonymousId?: string | null;
  properties?: Record<string, unknown>;
  traits?: Record<string, unknown>;
  groupId?: string;
  previousId?: string;           // alias source
  timestamp: string;             // ISO
  receivedAt: number;            // ms epoch
}

export type AudienceMatcher = (ctx: AudienceContext) => boolean;

export interface AudienceContext {
  events: LoggedEvent[];
  traits: Record<string, unknown>;
  computedTraits: ComputedTraits;
  userId: string | null;
}

export interface AudienceDefinition {
  id: string;
  name: string;
  description: string;
  color: string;                  // Tailwind bg-* class for the badge
  match: AudienceMatcher;
}

export interface AudienceMembership {
  id: string;
  name: string;
  enteredAt: string;
}

export interface ComputedTraits {
  lifetime_orders: number;
  lifetime_spend: number;
  avg_order_value: number;
  last_order_at?: string;
  days_since_last_order?: number;
  favorite_category?: string;
  cart_item_count: number;
  cart_value: number;
  session_event_count: number;
  has_applied_coupon: boolean;
  has_viewed_deals: boolean;
}

export type JourneyStage =
  | "visitor"
  | "engaged"
  | "cart_abandoner"
  | "customer"
  | "repeat_customer"
  | "vip";

export interface JourneyState {
  stage: JourneyStage;
  enteredAt: string;
  history: { stage: JourneyStage; at: string }[];
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/lib/segment/types.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/segment/types.ts
git commit -m "feat(segment): add core demo types"
```

---

### Task 2: localStorage ring buffer

**Files:**
- Create: `src/lib/segment/storage.ts`

- [ ] **Step 1: Create the storage module**

```ts
// src/lib/segment/storage.ts
import type { LoggedEvent } from "./types";

const KEY = "segment-demo-event-log";
const MAX = 500;

export function loadEvents(): LoggedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LoggedEvent[];
    return Array.isArray(parsed) ? parsed.slice(-MAX) : [];
  } catch {
    return [];
  }
}

export function saveEvents(events: LoggedEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = events.slice(-MAX);
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // quota exceeded — drop oldest half and retry once
    try {
      const half = events.slice(-Math.floor(MAX / 2));
      window.localStorage.setItem(KEY, JSON.stringify(half));
    } catch {
      // give up silently; in-memory store still works
    }
  }
}

export function clearEvents(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export const EVENT_LOG_MAX = MAX;
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit`
Expected: no errors referencing `storage.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/segment/storage.ts
git commit -m "feat(segment): add localStorage ring buffer for events"
```

---

### Task 3: Segment demo Zustand store

**Files:**
- Create: `src/stores/segment-store.ts`

- [ ] **Step 1: Create the store**

```ts
// src/stores/segment-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  LoggedEvent,
  AudienceMembership,
  ComputedTraits,
  JourneyStage,
  JourneyState,
} from "@/lib/segment/types";
import { loadEvents, saveEvents, clearEvents, EVENT_LOG_MAX } from "@/lib/segment/storage";

const DEFAULT_COMPUTED: ComputedTraits = {
  lifetime_orders: 0,
  lifetime_spend: 0,
  avg_order_value: 0,
  cart_item_count: 0,
  cart_value: 0,
  session_event_count: 0,
  has_applied_coupon: false,
  has_viewed_deals: false,
};

const DEFAULT_JOURNEY: JourneyState = {
  stage: "visitor",
  enteredAt: new Date().toISOString(),
  history: [{ stage: "visitor", at: new Date().toISOString() }],
};

interface SegmentState {
  // data
  events: LoggedEvent[];
  audiences: AudienceMembership[];
  computedTraits: ComputedTraits;
  journey: JourneyState;
  userId: string | null;
  anonymousId: string | null;
  traits: Record<string, unknown>;

  // demo ui state (persisted)
  demoModeEnabled: boolean;
  inspectorOpen: boolean;
  inspectorTab: "events" | "audiences" | "identity" | "journey" | "computed";
  eventFilter: { kind?: string; query?: string };

  // actions
  appendEvent: (event: LoggedEvent) => void;
  hydrateEvents: () => void;
  clear: () => void;
  setAudiences: (audiences: AudienceMembership[]) => void;
  setComputedTraits: (traits: ComputedTraits) => void;
  setJourney: (journey: JourneyState) => void;
  advanceJourney: (stage: JourneyStage) => void;
  setIdentity: (userId: string | null, anonymousId: string | null) => void;
  mergeTraits: (traits: Record<string, unknown>) => void;
  resetIdentity: () => void;
  setDemoMode: (enabled: boolean) => void;
  setInspectorOpen: (open: boolean) => void;
  setInspectorTab: (tab: SegmentState["inspectorTab"]) => void;
  setEventFilter: (filter: SegmentState["eventFilter"]) => void;
}

export const useSegmentStore = create<SegmentState>()(
  persist(
    (set, get) => ({
      events: [],
      audiences: [],
      computedTraits: DEFAULT_COMPUTED,
      journey: DEFAULT_JOURNEY,
      userId: null,
      anonymousId: null,
      traits: {},
      demoModeEnabled: true,
      inspectorOpen: false,
      inspectorTab: "events",
      eventFilter: {},

      appendEvent: (event) =>
        set((state) => {
          const next = [...state.events, event].slice(-EVENT_LOG_MAX);
          saveEvents(next);
          return { events: next };
        }),

      hydrateEvents: () => {
        const existing = loadEvents();
        if (existing.length > 0) set({ events: existing });
      },

      clear: () => {
        clearEvents();
        set({
          events: [],
          audiences: [],
          computedTraits: DEFAULT_COMPUTED,
          journey: {
            stage: "visitor",
            enteredAt: new Date().toISOString(),
            history: [{ stage: "visitor", at: new Date().toISOString() }],
          },
          traits: {},
        });
      },

      setAudiences: (audiences) => set({ audiences }),
      setComputedTraits: (computedTraits) => set({ computedTraits }),
      setJourney: (journey) => set({ journey }),
      advanceJourney: (stage) =>
        set((state) => {
          if (state.journey.stage === stage) return state;
          const now = new Date().toISOString();
          return {
            journey: {
              stage,
              enteredAt: now,
              history: [...state.journey.history, { stage, at: now }],
            },
          };
        }),

      setIdentity: (userId, anonymousId) => set({ userId, anonymousId }),
      mergeTraits: (traits) =>
        set((state) => ({ traits: { ...state.traits, ...traits } })),
      resetIdentity: () =>
        set({ userId: null, traits: {} }),

      setDemoMode: (enabled) => set({ demoModeEnabled: enabled }),
      setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
      setInspectorTab: (inspectorTab) => set({ inspectorTab }),
      setEventFilter: (eventFilter) => set({ eventFilter }),
    }),
    {
      name: "segment-demo-ui",
      partialize: (state) => ({
        demoModeEnabled: state.demoModeEnabled,
        inspectorTab: state.inspectorTab,
      }),
    },
  ),
);
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit`
Expected: no errors referencing `segment-store.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/stores/segment-store.ts
git commit -m "feat(segment): add demo store for events, audiences, journey"
```

---

### Task 4: AnalyticsBus wrapper

**Files:**
- Create: `src/lib/segment/bus.ts`
- Modify: `src/lib/analytics/segment.ts`

- [ ] **Step 1: Create the bus**

```ts
// src/lib/segment/bus.ts
import { AnalyticsBrowser } from "@segment/analytics-next";
import type { LoggedEvent, EventKind } from "./types";
import { useSegmentStore } from "@/stores/segment-store";

const writeKey = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY || "";

const realAnalytics = AnalyticsBrowser.load(
  { writeKey },
  { initialPageview: false },
);

const CHANNEL_NAME = "segment-demo-events";

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }
  return new BroadcastChannel(CHANNEL_NAME);
}

let sharedChannel: BroadcastChannel | null = null;
function channel(): BroadcastChannel | null {
  if (sharedChannel) return sharedChannel;
  sharedChannel = getChannel();
  return sharedChannel;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function getIdentity(): Promise<{ userId: string | null; anonymousId: string | null }> {
  try {
    const [a] = await realAnalytics;
    const user = a.user();
    return {
      userId: user.id() ?? null,
      anonymousId: user.anonymousId() ?? null,
    };
  } catch {
    return { userId: null, anonymousId: null };
  }
}

function record(event: LoggedEvent) {
  useSegmentStore.getState().appendEvent(event);
  channel()?.postMessage(event);
}

export const analytics = {
  async track(name: string, properties?: Record<string, unknown>): Promise<void> {
    const { userId, anonymousId } = await getIdentity();
    const event: LoggedEvent = {
      id: newId(),
      kind: "track",
      name,
      userId,
      anonymousId,
      properties,
      timestamp: new Date().toISOString(),
      receivedAt: Date.now(),
    };
    record(event);
    await realAnalytics.track(name, properties);
  },

  async identify(userId: string, traits?: Record<string, unknown>): Promise<void> {
    const { anonymousId } = await getIdentity();
    const event: LoggedEvent = {
      id: newId(),
      kind: "identify",
      userId,
      anonymousId,
      traits,
      timestamp: new Date().toISOString(),
      receivedAt: Date.now(),
    };
    record(event);
    const store = useSegmentStore.getState();
    store.setIdentity(userId, anonymousId);
    if (traits) store.mergeTraits(traits);
    await realAnalytics.identify(userId, traits);
  },

  async page(
    category?: string,
    name?: string,
    properties?: Record<string, unknown>,
  ): Promise<void> {
    const { userId, anonymousId } = await getIdentity();
    const event: LoggedEvent = {
      id: newId(),
      kind: "page",
      name: name ?? "Page Viewed",
      userId,
      anonymousId,
      properties: { category, ...properties },
      timestamp: new Date().toISOString(),
      receivedAt: Date.now(),
    };
    record(event);
    await realAnalytics.page(category, name, properties);
  },

  async group(groupId: string, traits?: Record<string, unknown>): Promise<void> {
    const { userId, anonymousId } = await getIdentity();
    const event: LoggedEvent = {
      id: newId(),
      kind: "group",
      userId,
      anonymousId,
      groupId,
      traits,
      timestamp: new Date().toISOString(),
      receivedAt: Date.now(),
    };
    record(event);
    await realAnalytics.group(groupId, traits);
  },

  async alias(userId: string, previousId?: string): Promise<void> {
    const { anonymousId } = await getIdentity();
    const event: LoggedEvent = {
      id: newId(),
      kind: "alias",
      userId,
      anonymousId,
      previousId,
      timestamp: new Date().toISOString(),
      receivedAt: Date.now(),
    };
    record(event);
    await realAnalytics.alias(userId, previousId);
  },

  async reset(): Promise<void> {
    const event: LoggedEvent = {
      id: newId(),
      kind: "reset",
      timestamp: new Date().toISOString(),
      receivedAt: Date.now(),
    };
    record(event);
    useSegmentStore.getState().resetIdentity();
    const [a] = await realAnalytics;
    a.reset();
  },
};

export const realAnalyticsPromise = realAnalytics;
```

- [ ] **Step 2: Re-point the existing segment singleton through the bus**

Replace the full contents of `src/lib/analytics/segment.ts` with:

```ts
// src/lib/analytics/segment.ts
export { analytics } from "@/lib/segment/bus";
```

- [ ] **Step 3: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors. Existing call sites like `analytics.track("...")` continue to compile unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/lib/segment/bus.ts src/lib/analytics/segment.ts
git commit -m "feat(segment): route analytics calls through a demo bus"
```

---

### Task 5: Extend the event helpers (Segment Spec v2 gaps)

**Files:**
- Modify: `src/lib/analytics/events.ts`

- [ ] **Step 1: Append new helpers to the events file**

Add the following block at the end of `src/lib/analytics/events.ts` (after the existing exports):

```ts
// ---------------------------------------------------------------------------
// Spec v2 — Identity + Business (new for Segment demo)
// ---------------------------------------------------------------------------

export function trackGroup(
  groupId: string,
  name: string,
  traits?: Record<string, unknown>,
): void {
  analytics.group(groupId, { name, ...traits });
}

export function trackAlias(newUserId: string, previousId?: string): void {
  analytics.alias(newUserId, previousId);
}

export function trackNewsletterSubscribed(
  email: string,
  source: string,
): void {
  analytics.track("Newsletter Subscribed", { email, source });
}

export function trackVideoPlayed(
  assetId: string,
  assetName: string,
  position: number,
): void {
  analytics.track("Video Playback Started", {
    asset_id: assetId,
    asset_name: assetName,
    position,
  });
}

export function trackFormAbandoned(
  formName: string,
  fieldsFilled: number,
  totalFields: number,
): void {
  analytics.track("Form Abandoned", {
    form_name: formName,
    fields_filled: fieldsFilled,
    total_fields: totalFields,
    completion_pct: totalFields > 0
      ? Math.round((fieldsFilled / totalFields) * 100)
      : 0,
  });
}

export function trackError(
  message: string,
  context: Record<string, unknown> = {},
): void {
  analytics.track("Error Encountered", { message, ...context });
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/analytics/events.ts
git commit -m "feat(segment): add group/alias/newsletter/video/form/error events"
```

---

### Task 6: Journey classifier

**Files:**
- Create: `src/lib/segment/journey.ts`

- [ ] **Step 1: Create the classifier**

```ts
// src/lib/segment/journey.ts
import type {
  LoggedEvent,
  JourneyStage,
  ComputedTraits,
} from "./types";

export const JOURNEY_STAGES: { stage: JourneyStage; label: string; description: string }[] = [
  { stage: "visitor",          label: "Visitor",          description: "Landed on the site, not yet engaged" },
  { stage: "engaged",          label: "Engaged",          description: "Viewed a product or deal" },
  { stage: "cart_abandoner",   label: "Cart Abandoner",   description: "Added to cart but didn't complete" },
  { stage: "customer",         label: "Customer",         description: "Completed one order" },
  { stage: "repeat_customer",  label: "Repeat Customer",  description: "Completed multiple orders" },
  { stage: "vip",              label: "VIP",              description: "High-value loyal customer" },
];

export function classifyStage(
  events: LoggedEvent[],
  computed: ComputedTraits,
): JourneyStage {
  if (computed.lifetime_spend >= 200 || computed.lifetime_orders >= 5) return "vip";
  if (computed.lifetime_orders >= 2) return "repeat_customer";
  if (computed.lifetime_orders >= 1) return "customer";

  const hasAddToCart = events.some(
    (e) => e.kind === "track" && e.name === "Product Added",
  );
  const hasOrder = events.some(
    (e) => e.kind === "track" && e.name === "Order Completed",
  );
  const hasCheckoutStart = events.some(
    (e) => e.kind === "track" && e.name === "Checkout Started",
  );

  if (hasAddToCart && !hasOrder) {
    const lastAdd = [...events]
      .reverse()
      .find((e) => e.kind === "track" && e.name === "Product Added");
    if (lastAdd && Date.now() - lastAdd.receivedAt > 60_000) {
      return "cart_abandoner";
    }
    if (hasCheckoutStart) return "cart_abandoner";
  }

  const hasEngaged = events.some(
    (e) =>
      e.kind === "track" &&
      (e.name === "Product Viewed" ||
        e.name === "Deal Viewed" ||
        e.name === "Product List Viewed"),
  );

  return hasEngaged ? "engaged" : "visitor";
}
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/segment/journey.ts
git commit -m "feat(segment): add journey stage classifier"
```

---

### Task 7: Audience definitions + computed-trait engine

**Files:**
- Create: `src/lib/segment/audiences.ts`

- [ ] **Step 1: Create the engine with pre-built audiences**

```ts
// src/lib/segment/audiences.ts
import type {
  AudienceDefinition,
  AudienceMembership,
  ComputedTraits,
  LoggedEvent,
} from "./types";

// ---------------------------------------------------------------------------
// Computed traits — derived from the event log (+ optional persisted order history)
// ---------------------------------------------------------------------------

interface ComputeInput {
  events: LoggedEvent[];
  cartItemCount?: number;
  cartValue?: number;
}

export function computeTraits(input: ComputeInput): ComputedTraits {
  const { events } = input;

  const completed = events.filter(
    (e) => e.kind === "track" && e.name === "Order Completed",
  );

  const totals = completed.map((e) => {
    const p = e.properties ?? {};
    const total = typeof p.total === "number" ? p.total
      : typeof p.revenue === "number" ? p.revenue : 0;
    return { total, at: e.timestamp };
  });

  const lifetime_spend = totals.reduce((s, t) => s + t.total, 0);
  const lifetime_orders = totals.length;
  const avg_order_value = lifetime_orders > 0
    ? Math.round((lifetime_spend / lifetime_orders) * 100) / 100
    : 0;

  const last_order_at = totals.length > 0
    ? totals[totals.length - 1].at
    : undefined;
  const days_since_last_order = last_order_at
    ? Math.floor((Date.now() - new Date(last_order_at).getTime()) / 86_400_000)
    : undefined;

  const categoryCounts: Record<string, number> = {};
  for (const e of events) {
    if (e.kind !== "track") continue;
    const cat = (e.properties?.category as string | undefined);
    if (!cat) continue;
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  }
  let favorite_category: string | undefined;
  let maxCount = 0;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favorite_category = cat;
    }
  }

  const has_applied_coupon = events.some(
    (e) => e.kind === "track" && e.name === "Coupon Applied",
  );
  const has_viewed_deals = events.some(
    (e) => e.kind === "track" && e.name === "Deal Viewed",
  );

  return {
    lifetime_orders,
    lifetime_spend: Math.round(lifetime_spend * 100) / 100,
    avg_order_value,
    last_order_at,
    days_since_last_order,
    favorite_category,
    cart_item_count: input.cartItemCount ?? 0,
    cart_value: input.cartValue ?? 0,
    session_event_count: events.length,
    has_applied_coupon,
    has_viewed_deals,
  };
}

// ---------------------------------------------------------------------------
// Audience definitions
// ---------------------------------------------------------------------------

export const AUDIENCES: AudienceDefinition[] = [
  {
    id: "high_value",
    name: "High-Value Customers",
    description: "Lifetime spend ≥ $100",
    color: "bg-amber-500",
    match: ({ computedTraits }) => computedTraits.lifetime_spend >= 100,
  },
  {
    id: "cart_abandoners",
    name: "Cart Abandoners",
    description: "Items in cart but no order in this session",
    color: "bg-orange-500",
    match: ({ computedTraits, events }) => {
      if (computedTraits.cart_item_count === 0) return false;
      return !events.some(
        (e) => e.kind === "track" && e.name === "Order Completed",
      );
    },
  },
  {
    id: "deal_hunters",
    name: "Deal Hunters",
    description: "Viewed deals or applied a coupon",
    color: "bg-rose-500",
    match: ({ computedTraits }) =>
      computedTraits.has_viewed_deals || computedTraits.has_applied_coupon,
  },
  {
    id: "pizza_lovers",
    name: "Pizza Lovers",
    description: "Favorite category is pizzas",
    color: "bg-red-600",
    match: ({ computedTraits }) => computedTraits.favorite_category === "pizzas",
  },
  {
    id: "vip_tier",
    name: "VIP Tier Members",
    description: "Lifetime orders ≥ 5 or spend ≥ $200",
    color: "bg-purple-600",
    match: ({ computedTraits }) =>
      computedTraits.lifetime_orders >= 5 || computedTraits.lifetime_spend >= 200,
  },
  {
    id: "lapsed_customers",
    name: "Lapsed Customers",
    description: "Hasn't ordered in 30+ days",
    color: "bg-slate-500",
    match: ({ computedTraits }) =>
      computedTraits.lifetime_orders > 0 &&
      (computedTraits.days_since_last_order ?? 0) >= 30,
  },
  {
    id: "new_visitors",
    name: "New Visitors",
    description: "No identify call yet",
    color: "bg-sky-500",
    match: ({ userId, computedTraits }) =>
      userId === null && computedTraits.session_event_count > 0,
  },
  {
    id: "pickup_preferring",
    name: "Pickup-Preferring",
    description: "Selected pickup as delivery method at least once",
    color: "bg-emerald-500",
    match: ({ events }) =>
      events.some(
        (e) =>
          e.kind === "track" &&
          e.name === "Delivery Method Selected" &&
          e.properties?.method === "pickup",
      ),
  },
];

export function evaluateAudiences(
  events: LoggedEvent[],
  traits: Record<string, unknown>,
  computedTraits: ComputedTraits,
  userId: string | null,
  previous: AudienceMembership[],
): { current: AudienceMembership[]; entered: AudienceDefinition[]; exited: AudienceDefinition[] } {
  const prevIds = new Set(previous.map((m) => m.id));
  const current: AudienceMembership[] = [];
  const entered: AudienceDefinition[] = [];
  const exited: AudienceDefinition[] = [];

  for (const def of AUDIENCES) {
    const matched = def.match({ events, traits, computedTraits, userId });
    if (matched) {
      const existing = previous.find((m) => m.id === def.id);
      current.push(
        existing ?? { id: def.id, name: def.name, enteredAt: new Date().toISOString() },
      );
      if (!prevIds.has(def.id)) entered.push(def);
    }
  }

  const currentIds = new Set(current.map((m) => m.id));
  for (const def of AUDIENCES) {
    if (prevIds.has(def.id) && !currentIds.has(def.id)) exited.push(def);
  }

  return { current, entered, exited };
}
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/segment/audiences.ts
git commit -m "feat(segment): add computed-trait engine and 8 demo audiences"
```

---

### Task 8: Demo personas + seeder

**Files:**
- Create: `src/lib/segment/personas.ts`

- [ ] **Step 1: Create the personas module**

```ts
// src/lib/segment/personas.ts
import { analytics } from "@/lib/segment/bus";

export interface Persona {
  id: string;
  name: string;
  description: string;
  userId: string;
  email: string;
  traits: Record<string, unknown>;
  seed: () => Promise<void>;
}

async function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const PERSONAS: Persona[] = [
  {
    id: "sarah_vip",
    name: "Sarah — VIP Customer",
    description: "5 past orders, loyalty Gold, pizzas lover, Sydney",
    userId: "user-sarah-vip",
    email: "sarah.vip@dominosdemo.com",
    traits: {
      email: "sarah.vip@dominosdemo.com",
      name: "Sarah Thompson",
      loyalty_tier: "gold",
      loyalty_points: 1280,
      lifetime_orders: 12,
      lifetime_spend: 386.4,
      preferred_delivery_method: "delivery",
      preferred_store_id: "store-001",
    },
    async seed() {
      await analytics.identify("user-sarah-vip", {
        email: "sarah.vip@dominosdemo.com",
        name: "Sarah Thompson",
        loyalty_tier: "gold",
        loyalty_points: 1280,
        lifetime_orders: 12,
        lifetime_spend: 386.4,
      });
      for (let i = 0; i < 5; i++) {
        await analytics.track("Order Completed", {
          order_id: `hist-order-${i + 1}`,
          total: 35 + i * 3,
          revenue: 32 + i * 3,
          currency: "AUD",
          category: "pizzas",
          products: [
            { product_id: "meat-lovers", name: "Meat Lovers", category: "pizzas", price: 16.99, quantity: 1 },
          ],
        });
        await wait(30);
      }
    },
  },
  {
    id: "dan_abandoner",
    name: "Dan — Cart Abandoner",
    description: "Browses, adds to cart, leaves",
    userId: "user-dan-abandoner",
    email: "dan.abandoner@dominosdemo.com",
    traits: {
      email: "dan.abandoner@dominosdemo.com",
      name: "Dan Kelly",
      loyalty_tier: "bronze",
      loyalty_points: 40,
      lifetime_orders: 0,
      lifetime_spend: 0,
    },
    async seed() {
      await analytics.identify("user-dan-abandoner", {
        email: "dan.abandoner@dominosdemo.com",
        name: "Dan Kelly",
        loyalty_tier: "bronze",
      });
      await analytics.track("Product List Viewed", { category: "pizzas" });
      await wait(40);
      await analytics.track("Product Viewed", {
        product_id: "pepperoni",
        name: "Pepperoni",
        category: "pizzas",
        price: 14.99,
        quantity: 1,
      });
      await wait(40);
      await analytics.track("Product Added", {
        product_id: "pepperoni",
        name: "Pepperoni",
        category: "pizzas",
        price: 14.99,
        quantity: 1,
      });
      await wait(40);
      await analytics.track("Checkout Started", {
        cart_id: "cart-dan-1",
        revenue: 14.99,
        products: [
          { product_id: "pepperoni", name: "Pepperoni", category: "pizzas", price: 14.99, quantity: 1 },
        ],
      });
    },
  },
  {
    id: "mia_dealhunter",
    name: "Mia — Deal Hunter",
    description: "Loves coupons & deals, lunch lover",
    userId: "user-mia-deals",
    email: "mia.deals@dominosdemo.com",
    traits: {
      email: "mia.deals@dominosdemo.com",
      name: "Mia Nguyen",
      loyalty_tier: "silver",
      loyalty_points: 320,
    },
    async seed() {
      await analytics.identify("user-mia-deals", {
        email: "mia.deals@dominosdemo.com",
        name: "Mia Nguyen",
        loyalty_tier: "silver",
      });
      await analytics.track("Deal Viewed", { deal_id: "deal-005", deal_name: "Lunch Combo", discount_value: 7 });
      await wait(30);
      await analytics.track("Coupon Applied", { coupon_code: "LUNCH1295", discount: 4 });
    },
  },
  {
    id: "anon_visitor",
    name: "Anon — New Visitor",
    description: "Anonymous session, just browsing",
    userId: "",
    email: "",
    traits: {},
    async seed() {
      await analytics.reset();
      await analytics.page(undefined, "Home", { url: "/", path: "/" });
      await wait(30);
      await analytics.track("Hero Banner Clicked", {
        banner_id: "banner-1",
        banner_name: "Any 3 Pizzas from $29.95",
        position: 1,
      });
    },
  },
];

export function findPersona(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/segment/personas.ts
git commit -m "feat(segment): add demo personas with seeder scripts"
```

---

### Task 9: Identity + traits panel UI

**Files:**
- Create: `src/components/segment/identity-panel.tsx`

- [ ] **Step 1: Create the identity panel**

```tsx
// src/components/segment/identity-panel.tsx
"use client";

import { UserCircle, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSegmentStore } from "@/stores/segment-store";

export function IdentityPanel() {
  const { userId, anonymousId, traits, events } = useSegmentStore();
  const [copied, setCopied] = useState<string | null>(null);

  const identifyEvents = events.filter((e) => e.kind === "identify");
  const aliasEvents = events.filter((e) => e.kind === "alias");

  function copy(value: string, label: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(label);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(null), 1200);
    });
  }

  const traitEntries = Object.entries(traits);

  return (
    <div className="flex flex-col gap-4 p-4 text-sm">
      <section className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Identity</h3>
          <Badge
            variant="secondary"
            className={userId ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}
          >
            {userId ? "Identified" : "Anonymous"}
          </Badge>
        </div>

        <dl className="space-y-2">
          <div className="grid grid-cols-[120px_1fr_auto] items-center gap-2">
            <dt className="text-muted-foreground">userId</dt>
            <dd className="truncate font-mono text-xs">{userId ?? "— (not set)"}</dd>
            {userId && (
              <button
                onClick={() => copy(userId, "userId")}
                className="rounded p-1 hover:bg-muted"
                aria-label="Copy userId"
              >
                {copied === "userId" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>

          <div className="grid grid-cols-[120px_1fr_auto] items-center gap-2">
            <dt className="text-muted-foreground">anonymousId</dt>
            <dd className="truncate font-mono text-xs">
              {anonymousId ?? "— (not set)"}
            </dd>
            {anonymousId && (
              <button
                onClick={() => copy(anonymousId, "anonymousId")}
                className="rounded p-1 hover:bg-muted"
                aria-label="Copy anonymousId"
              >
                {copied === "anonymousId" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        </dl>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 font-semibold">Traits ({traitEntries.length})</h3>
        {traitEntries.length === 0 ? (
          <p className="text-xs text-muted-foreground">No traits yet. Call <code>analytics.identify()</code> to set them.</p>
        ) : (
          <div className="divide-y">
            {traitEntries.map(([key, value]) => (
              <div key={key} className="grid grid-cols-[160px_1fr] gap-3 py-1.5">
                <span className="font-mono text-xs text-muted-foreground">{key}</span>
                <span className="font-mono text-xs break-words">{formatValue(value)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 font-semibold">Identity timeline</h3>
        {identifyEvents.length === 0 && aliasEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground">No identify/alias calls yet.</p>
        ) : (
          <ol className="space-y-2 text-xs">
            {[...identifyEvents, ...aliasEvents]
              .sort((a, b) => a.receivedAt - b.receivedAt)
              .map((e) => (
                <li key={e.id} className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5 font-mono uppercase">
                    {e.kind}
                  </Badge>
                  <div className="flex-1">
                    <div className="font-mono">{e.userId ?? "—"}</div>
                    <div className="text-muted-foreground">
                      {new Date(e.timestamp).toLocaleTimeString()}
                      {e.previousId ? ` · from ${e.previousId}` : ""}
                    </div>
                  </div>
                </li>
              ))}
          </ol>
        )}
      </section>

      <Separator />
      <p className="text-[11px] text-muted-foreground">
        In production, Segment resolves identities across devices via the Identity Graph — connecting anonymousId → userId merges.
      </p>
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "null";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/segment/identity-panel.tsx
git commit -m "feat(segment): add Identity debug panel"
```

---

### Task 10: Event row + event detail components

**Files:**
- Create: `src/components/segment/event-row.tsx`
- Create: `src/components/segment/event-detail.tsx`

- [ ] **Step 1: Create the event row**

```tsx
// src/components/segment/event-row.tsx
"use client";

import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LoggedEvent } from "@/lib/segment/types";

const kindColor: Record<LoggedEvent["kind"], string> = {
  track: "bg-emerald-100 text-emerald-700",
  identify: "bg-sky-100 text-sky-700",
  page: "bg-violet-100 text-violet-700",
  group: "bg-amber-100 text-amber-700",
  alias: "bg-pink-100 text-pink-700",
  reset: "bg-muted text-muted-foreground",
};

export function EventRow({
  event,
  selected,
  onClick,
}: {
  event: LoggedEvent;
  selected: boolean;
  onClick: () => void;
}) {
  const label = event.name ?? event.kind;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
        selected ? "bg-muted" : "hover:bg-muted/60",
      )}
    >
      <Badge variant="secondary" className={cn("font-mono uppercase", kindColor[event.kind])}>
        {event.kind}
      </Badge>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{label}</div>
        <div className="truncate text-xs text-muted-foreground">
          {new Date(event.timestamp).toLocaleTimeString()}
          {event.userId ? ` · ${event.userId.slice(0, 12)}` : " · anon"}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
```

- [ ] **Step 2: Create the event detail panel**

```tsx
// src/components/segment/event-detail.tsx
"use client";

import { Copy, Code2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LoggedEvent } from "@/lib/segment/types";

export function EventDetail({ event }: { event: LoggedEvent | null }) {
  if (!event) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div className="max-w-xs">
          <Code2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Select an event on the left to see its full JSON payload — the same shape Segment would send to downstream destinations.
          </p>
        </div>
      </div>
    );
  }

  const payload = {
    type: event.kind,
    event: event.name,
    userId: event.userId,
    anonymousId: event.anonymousId,
    properties: event.properties,
    traits: event.traits,
    groupId: event.groupId,
    previousId: event.previousId,
    timestamp: event.timestamp,
  };

  const json = JSON.stringify(payload, null, 2);

  function handleCopy() {
    navigator.clipboard.writeText(json).then(() => {
      toast.success("Event JSON copied");
    });
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono uppercase">
              {event.kind}
            </Badge>
            <h3 className="truncate font-semibold">{event.name ?? event.kind}</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(event.timestamp).toLocaleString()}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy}>
          <Copy className="h-3.5 w-3.5" />
          Copy JSON
        </Button>
      </header>

      <pre className="flex-1 overflow-auto bg-muted/40 p-4 text-xs leading-relaxed">
        {json}
      </pre>
    </div>
  );
}
```

- [ ] **Step 3: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/segment/event-row.tsx src/components/segment/event-detail.tsx
git commit -m "feat(segment): add event row and detail components"
```

---

### Task 11: Event inspector stream

**Files:**
- Create: `src/components/segment/event-stream.tsx`

- [ ] **Step 1: Create the stream component**

```tsx
// src/components/segment/event-stream.tsx
"use client";

import { useMemo, useState } from "react";
import { Trash2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventRow } from "./event-row";
import { EventDetail } from "./event-detail";
import { useSegmentStore } from "@/stores/segment-store";
import type { EventKind, LoggedEvent } from "@/lib/segment/types";

const KIND_OPTIONS: { value: EventKind | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "track", label: "Track" },
  { value: "identify", label: "Identify" },
  { value: "page", label: "Page" },
  { value: "group", label: "Group" },
  { value: "alias", label: "Alias" },
];

export function EventStream() {
  const events = useSegmentStore((s) => s.events);
  const clear = useSegmentStore((s) => s.clear);

  const [kind, setKind] = useState<EventKind | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<LoggedEvent | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...events]
      .reverse()
      .filter((e) => {
        if (kind !== "all" && e.kind !== kind) return false;
        if (!q) return true;
        const hay = [
          e.name,
          e.userId,
          e.anonymousId,
          JSON.stringify(e.properties ?? {}),
          JSON.stringify(e.traits ?? {}),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
  }, [events, kind, query]);

  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-[380px_1fr]">
      {/* Left: list + filters */}
      <div className="flex h-full min-h-0 flex-col border-r">
        <div className="flex flex-col gap-2 border-b p-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter events..."
                className="h-8 pl-7 text-xs"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear filter"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => {
                clear();
                setSelected(null);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {KIND_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setKind(opt.value)}
                className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                  kind === opt.value
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {filtered.length} of {events.length} events
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-0.5 p-2">
            {filtered.length === 0 ? (
              <p className="p-6 text-center text-xs text-muted-foreground">
                No events match your filter.
              </p>
            ) : (
              filtered.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  selected={selected?.id === event.id}
                  onClick={() => setSelected(event)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right: detail */}
      <div className="min-h-0 bg-muted/20">
        <EventDetail event={selected} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/segment/event-stream.tsx
git commit -m "feat(segment): add event stream with filter + detail pane"
```

---

### Task 12: Audiences panel

**Files:**
- Create: `src/components/segment/audiences-panel.tsx`

- [ ] **Step 1: Create the audiences panel**

```tsx
// src/components/segment/audiences-panel.tsx
"use client";

import { Users, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AUDIENCES } from "@/lib/segment/audiences";
import { useSegmentStore } from "@/stores/segment-store";

export function AudiencesPanel() {
  const audiences = useSegmentStore((s) => s.audiences);
  const active = new Set(audiences.map((a) => a.id));

  return (
    <div className="flex flex-col gap-3 p-4 text-sm">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">
          Audiences ({active.size} / {AUDIENCES.length} matched)
        </h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Evaluated live from this session&apos;s events + computed traits. Crossing an audience boundary fires an <code>Audience Entered</code> / <code>Audience Exited</code> track call.
      </p>

      <div className="flex flex-col gap-2">
        {AUDIENCES.map((def) => {
          const isMember = active.has(def.id);
          const membership = audiences.find((a) => a.id === def.id);
          return (
            <div
              key={def.id}
              className={`rounded-lg border p-3 transition-colors ${
                isMember ? "border-emerald-300 bg-emerald-50/40" : "bg-card"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${def.color}`} aria-hidden />
                  <span className="font-semibold">{def.name}</span>
                </div>
                {isMember ? (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-emerald-100 text-emerald-700"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Member
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Not matched
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{def.description}</p>
              {isMember && membership && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Entered {new Date(membership.enteredAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/segment/audiences-panel.tsx
git commit -m "feat(segment): add audiences panel with live membership"
```

---

### Task 13: Journey + computed-traits panels

**Files:**
- Create: `src/components/segment/journey-panel.tsx`
- Create: `src/components/segment/computed-traits-panel.tsx`

- [ ] **Step 1: Journey panel**

```tsx
// src/components/segment/journey-panel.tsx
"use client";

import { Route, CheckCircle2, Circle } from "lucide-react";
import { JOURNEY_STAGES } from "@/lib/segment/journey";
import { useSegmentStore } from "@/stores/segment-store";

export function JourneyPanel() {
  const journey = useSegmentStore((s) => s.journey);
  const currentIdx = JOURNEY_STAGES.findIndex((s) => s.stage === journey.stage);

  return (
    <div className="flex flex-col gap-4 p-4 text-sm">
      <div className="flex items-center gap-2">
        <Route className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Customer Journey</h3>
      </div>

      <ol className="relative ml-3 border-l-2 border-muted">
        {JOURNEY_STAGES.map((s, idx) => {
          const reached = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <li key={s.stage} className="relative pb-5 pl-6 last:pb-0">
              <span
                className={`absolute -left-[11px] top-0 flex h-5 w-5 items-center justify-center rounded-full ${
                  isCurrent
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : reached
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {reached ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </span>
              <div className="flex flex-col">
                <span className={`font-semibold ${isCurrent ? "text-primary" : ""}`}>
                  {s.label}
                </span>
                <span className="text-xs text-muted-foreground">{s.description}</span>
              </div>
            </li>
          );
        })}
      </ol>

      <section className="rounded-lg border bg-card p-3">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Stage history
        </h4>
        <ol className="space-y-1">
          {journey.history.map((h, i) => (
            <li key={i} className="flex justify-between text-xs">
              <span className="font-medium capitalize">{h.stage.replace("_", " ")}</span>
              <span className="text-muted-foreground">
                {new Date(h.at).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Computed-traits panel**

```tsx
// src/components/segment/computed-traits-panel.tsx
"use client";

import { Calculator } from "lucide-react";
import { useSegmentStore } from "@/stores/segment-store";

export function ComputedTraitsPanel() {
  const c = useSegmentStore((s) => s.computedTraits);

  const rows: { label: string; value: string }[] = [
    { label: "Lifetime orders", value: String(c.lifetime_orders) },
    { label: "Lifetime spend", value: `$${c.lifetime_spend.toFixed(2)}` },
    { label: "Avg order value", value: `$${c.avg_order_value.toFixed(2)}` },
    {
      label: "Days since last order",
      value:
        c.days_since_last_order !== undefined
          ? String(c.days_since_last_order)
          : "—",
    },
    { label: "Favorite category", value: c.favorite_category ?? "—" },
    { label: "Cart items", value: String(c.cart_item_count) },
    { label: "Cart value", value: `$${c.cart_value.toFixed(2)}` },
    { label: "Events this session", value: String(c.session_event_count) },
    { label: "Applied a coupon", value: c.has_applied_coupon ? "Yes" : "No" },
    { label: "Viewed deals", value: c.has_viewed_deals ? "Yes" : "No" },
  ];

  return (
    <div className="flex flex-col gap-3 p-4 text-sm">
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Computed Traits</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        These traits are derived client-side from the event log. In production, Segment&apos;s CDP computes equivalent traits server-side and syncs them to every destination.
      </p>
      <dl className="divide-y rounded-lg border bg-card">
        {rows.map((r) => (
          <div
            key={r.label}
            className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2"
          >
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="font-mono text-xs font-semibold">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
```

- [ ] **Step 3: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/segment/journey-panel.tsx src/components/segment/computed-traits-panel.tsx
git commit -m "feat(segment): add journey and computed-traits panels"
```

---

### Task 14: Event inspector drawer (ties panels together)

**Files:**
- Create: `src/components/segment/event-inspector.tsx`

- [ ] **Step 1: Create the inspector drawer**

```tsx
// src/components/segment/event-inspector.tsx
"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Radio, Users, UserCircle, Route, Calculator } from "lucide-react";
import { EventStream } from "./event-stream";
import { AudiencesPanel } from "./audiences-panel";
import { IdentityPanel } from "./identity-panel";
import { JourneyPanel } from "./journey-panel";
import { ComputedTraitsPanel } from "./computed-traits-panel";
import { useSegmentStore } from "@/stores/segment-store";

export function EventInspector() {
  const open = useSegmentStore((s) => s.inspectorOpen);
  const setOpen = useSegmentStore((s) => s.setInspectorOpen);
  const tab = useSegmentStore((s) => s.inspectorTab);
  const setTab = useSegmentStore((s) => s.setInspectorTab);
  const eventCount = useSegmentStore((s) => s.events.length);
  const audienceCount = useSegmentStore((s) => s.audiences.length);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-[900px] lg:max-w-[1100px]"
      >
        <header className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-600" />
            <SheetTitle className="text-base font-semibold">
              Segment Inspector
            </SheetTitle>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              Live
            </Badge>
          </div>
        </header>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as typeof tab)}
          className="flex flex-1 min-h-0 flex-col gap-0"
        >
          <TabsList className="mx-4 mt-3 grid h-9 w-fit grid-cols-5">
            <TabsTrigger value="events" className="gap-1.5">
              <Radio className="h-3.5 w-3.5" />
              Events
              <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px]">{eventCount}</span>
            </TabsTrigger>
            <TabsTrigger value="audiences" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Audiences
              <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px]">{audienceCount}</span>
            </TabsTrigger>
            <TabsTrigger value="identity" className="gap-1.5">
              <UserCircle className="h-3.5 w-3.5" />
              Identity
            </TabsTrigger>
            <TabsTrigger value="journey" className="gap-1.5">
              <Route className="h-3.5 w-3.5" />
              Journey
            </TabsTrigger>
            <TabsTrigger value="computed" className="gap-1.5">
              <Calculator className="h-3.5 w-3.5" />
              Traits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="flex-1 min-h-0">
            <EventStream />
          </TabsContent>
          <TabsContent value="audiences" className="flex-1 min-h-0 overflow-y-auto">
            <AudiencesPanel />
          </TabsContent>
          <TabsContent value="identity" className="flex-1 min-h-0 overflow-y-auto">
            <IdentityPanel />
          </TabsContent>
          <TabsContent value="journey" className="flex-1 min-h-0 overflow-y-auto">
            <JourneyPanel />
          </TabsContent>
          <TabsContent value="computed" className="flex-1 min-h-0 overflow-y-auto">
            <ComputedTraitsPanel />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/segment/event-inspector.tsx
git commit -m "feat(segment): add inspector drawer with 5 tabs"
```

---

### Task 15: FAB + Demo Toolbar

**Files:**
- Create: `src/components/segment/demo-fab.tsx`
- Create: `src/components/segment/demo-toolbar.tsx`

- [ ] **Step 1: Create the FAB**

```tsx
// src/components/segment/demo-fab.tsx
"use client";

import { Radio } from "lucide-react";
import { motion } from "framer-motion";
import { useSegmentStore } from "@/stores/segment-store";

export function DemoFab() {
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
  const open = useSegmentStore((s) => s.inspectorOpen);
  const setOpen = useSegmentStore((s) => s.setInspectorOpen);
  const count = useSegmentStore((s) => s.events.length);

  if (!demoMode || open) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => setOpen(true)}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-xl ring-1 ring-black/10"
      aria-label="Open Segment Inspector"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
      <Radio className="h-4 w-4" />
      Segment
      <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs tabular-nums">
        {count}
      </span>
    </motion.button>
  );
}
```

- [ ] **Step 2: Create the demo toolbar**

```tsx
// src/components/segment/demo-toolbar.tsx
"use client";

import { useState } from "react";
import { Settings2, ChevronDown, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PERSONAS } from "@/lib/segment/personas";
import { useSegmentStore } from "@/stores/segment-store";

export function DemoToolbar() {
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
  const setDemoMode = useSegmentStore((s) => s.setDemoMode);
  const clear = useSegmentStore((s) => s.clear);
  const [running, setRunning] = useState<string | null>(null);

  async function runPersona(id: string) {
    const persona = PERSONAS.find((p) => p.id === id);
    if (!persona) return;
    setRunning(id);
    toast.loading(`Loading persona: ${persona.name}`, { id: "persona" });
    try {
      await persona.seed();
      toast.success(`Loaded ${persona.name}`, { id: "persona" });
    } catch {
      toast.error(`Failed to load persona`, { id: "persona" });
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="fixed top-3 right-3 z-40 flex items-center gap-1.5">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 bg-background/80 backdrop-blur-sm"
            />
          }
        >
          <Settings2 className="h-3.5 w-3.5" />
          Segment Demo
          <ChevronDown className="h-3 w-3" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 space-y-3 p-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="demo-mode" className="text-sm font-medium">
              Demo overlays
            </Label>
            <Switch
              id="demo-mode"
              checked={demoMode}
              onCheckedChange={setDemoMode}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Toggle the inspector FAB and personalization widgets on/off to show the &ldquo;before&rdquo; state.
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Load a persona
            </div>
            <div className="flex flex-col gap-1.5">
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => runPersona(p.id)}
                  disabled={running !== null}
                  className="flex flex-col items-start rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted disabled:opacity-60"
                >
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-muted-foreground">{p.description}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs text-destructive hover:text-destructive"
            onClick={() => {
              clear();
              toast.success("Demo state reset");
            }}
          >
            <RotateCcw className="h-3 w-3" />
            Reset demo state
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

- [ ] **Step 3: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/segment/demo-fab.tsx src/components/segment/demo-toolbar.tsx
git commit -m "feat(segment): add demo FAB and toolbar with persona loader"
```

---

### Task 16: Personalization widgets

**Files:**
- Create: `src/components/segment/personalization-banner.tsx`
- Create: `src/components/segment/next-best-offer.tsx`
- Create: `src/components/segment/cart-abandonment-nudge.tsx`

- [ ] **Step 1: Personalization banner (swaps hero copy by audience)**

```tsx
// src/components/segment/personalization-banner.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useSegmentStore } from "@/stores/segment-store";

interface BannerCopy {
  audienceId: string;
  headline: string;
  subtext: string;
  cta: string;
  href: string;
  gradient: string;
  badge: string;
}

const COPY_BY_AUDIENCE: BannerCopy[] = [
  {
    audienceId: "vip_tier",
    headline: "Welcome back, VIP",
    subtext: "Your exclusive 3-large combo is waiting — $35.95 only for you.",
    cta: "Grab My VIP Deal",
    href: "/deals",
    gradient: "from-purple-700 to-[var(--dominos-dark-blue)]",
    badge: "VIP Tier",
  },
  {
    audienceId: "cart_abandoners",
    headline: "Come back to your cart",
    subtext: "Complete your order now and we'll throw in free garlic bread.",
    cta: "Finish Checkout",
    href: "/checkout",
    gradient: "from-orange-500 to-[var(--dominos-red)]",
    badge: "Cart Abandoner",
  },
  {
    audienceId: "deal_hunters",
    headline: "More deals, just for you",
    subtext: "Exclusive coupons based on your favourites. Limited time.",
    cta: "See Deals",
    href: "/deals",
    gradient: "from-rose-500 to-[var(--dominos-red)]",
    badge: "Deal Hunter",
  },
  {
    audienceId: "pizza_lovers",
    headline: "Fresh pizza, your way",
    subtext: "Build your perfect pie with our premium toppings.",
    cta: "Build a Pizza",
    href: "/menu",
    gradient: "from-[var(--dominos-red)] to-[var(--dominos-dark-blue)]",
    badge: "Pizza Lover",
  },
  {
    audienceId: "lapsed_customers",
    headline: "We miss you",
    subtext: "Take 20% off your next order with code WELCOMEBACK20.",
    cta: "Order Now",
    href: "/menu",
    gradient: "from-slate-700 to-[var(--dominos-dark-blue)]",
    badge: "Lapsed Customer",
  },
];

export function PersonalizationBanner() {
  const audiences = useSegmentStore((s) => s.audiences);
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
  const memberIds = new Set(audiences.map((a) => a.id));

  // Pick the first audience in priority order that the user is a member of.
  const match = COPY_BY_AUDIENCE.find((c) => memberIds.has(c.audienceId));
  if (!match) return null;

  return (
    <motion.section
      key={match.audienceId}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative w-full overflow-hidden bg-gradient-to-r ${match.gradient}`}
      aria-label="Personalized banner"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-6 py-8 md:flex-row md:items-center md:justify-between md:py-10">
        <div className="flex flex-col gap-1.5 text-white">
          {demoMode && (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Personalized · {match.badge}
            </span>
          )}
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            {match.headline}
          </h2>
          <p className="max-w-xl text-sm text-white/85 sm:text-base">
            {match.subtext}
          </p>
        </div>
        <Link
          href={match.href}
          className="inline-flex items-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-[var(--dominos-red)] shadow transition-transform hover:scale-105"
        >
          {match.cta}
        </Link>
      </div>
    </motion.section>
  );
}
```

- [ ] **Step 2: Next Best Offer component**

```tsx
// src/components/segment/next-best-offer.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSegmentStore } from "@/stores/segment-store";

interface Offer {
  title: string;
  description: string;
  cta: string;
  href: string;
  reason: string;
}

export function NextBestOffer() {
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
  const computed = useSegmentStore((s) => s.computedTraits);
  const audiences = useSegmentStore((s) => s.audiences);
  const memberIds = new Set(audiences.map((a) => a.id));

  if (!demoMode) return null;

  let offer: Offer;
  if (memberIds.has("vip_tier")) {
    offer = {
      title: "VIP Exclusive — 3 Premium Pizzas $35.95",
      description: "Our Premium range, all yours at a VIP price. Members only.",
      cta: "Claim VIP Deal",
      href: "/deals",
      reason: "VIP audience match",
    };
  } else if (memberIds.has("cart_abandoners")) {
    offer = {
      title: "Complete your order — free garlic bread",
      description: "We've saved your cart. Check out now and garlic bread is on us.",
      cta: "Resume Checkout",
      href: "/checkout",
      reason: "Cart abandoner signal",
    };
  } else if (computed.favorite_category === "pizzas") {
    offer = {
      title: "Build a custom pizza",
      description: "Based on your pizza browsing, try the builder — 20+ toppings, 4 crusts.",
      cta: "Start Building",
      href: "/product/pepperoni",
      reason: "Favorite category = pizzas",
    };
  } else if (memberIds.has("deal_hunters")) {
    offer = {
      title: "Lunch Combo $9.95",
      description: "Personal pizza + side + drink. Your favourite kind of deal.",
      cta: "Grab Lunch",
      href: "/deals",
      reason: "Deal Hunter audience",
    };
  } else {
    offer = {
      title: "Any 3 Pizzas $29.95",
      description: "Mix & match Traditional range. Pickup or delivery.",
      cta: "See Deal",
      href: "/deals",
      reason: "Default recommendation",
    };
  }

  return (
    <motion.aside
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-col gap-3 rounded-xl border border-[var(--dominos-blue)]/30 bg-gradient-to-br from-[var(--dominos-blue)]/5 to-transparent p-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Recommended offer"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--dominos-blue)]/10">
          <TrendingUp className="h-5 w-5 text-[var(--dominos-blue)]" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800">
              <Sparkles className="h-3 w-3" />
              Recommended for you
            </Badge>
            <span className="text-[11px] text-muted-foreground">({offer.reason})</span>
          </div>
          <h3 className="text-base font-bold">{offer.title}</h3>
          <p className="text-sm text-muted-foreground">{offer.description}</p>
        </div>
      </div>
      <Link
        href={offer.href}
        className="inline-flex items-center rounded-lg bg-[var(--dominos-red)] px-4 py-2 text-sm font-bold text-white shadow hover:bg-[var(--dominos-red)]/90"
      >
        {offer.cta}
      </Link>
    </motion.aside>
  );
}
```

- [ ] **Step 3: Cart abandonment nudge**

```tsx
// src/components/segment/cart-abandonment-nudge.tsx
"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSegmentStore } from "@/stores/segment-store";

const IDLE_MS = 45_000;

export function CartAbandonmentNudge() {
  const audiences = useSegmentStore((s) => s.audiences);
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!demoMode) return;
    const isAbandoner = audiences.some((a) => a.id === "cart_abandoners");
    if (!isAbandoner || firedRef.current) return;

    const timer = setTimeout(() => {
      firedRef.current = true;
      toast("Don't forget your cart!", {
        description: "Complete your order in the next 10 min for free garlic bread.",
        action: {
          label: "Checkout",
          onClick: () => {
            if (typeof window !== "undefined") {
              window.location.href = "/checkout";
            }
          },
        },
        duration: 15_000,
      });
    }, IDLE_MS);

    return () => clearTimeout(timer);
  }, [audiences, demoMode]);

  return null;
}
```

- [ ] **Step 4: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/segment/personalization-banner.tsx src/components/segment/next-best-offer.tsx src/components/segment/cart-abandonment-nudge.tsx
git commit -m "feat(segment): add personalization banner, NBO, abandonment nudge"
```

---

### Task 17: SegmentProvider — the orchestrator

**Files:**
- Create: `src/components/segment/segment-provider.tsx`

- [ ] **Step 1: Create the provider**

```tsx
// src/components/segment/segment-provider.tsx
"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/stores/cart-store";
import { useSegmentStore } from "@/stores/segment-store";
import { analytics } from "@/lib/segment/bus";
import { computeTraits, evaluateAudiences } from "@/lib/segment/audiences";
import { classifyStage } from "@/lib/segment/journey";
import { DemoFab } from "./demo-fab";
import { DemoToolbar } from "./demo-toolbar";
import { EventInspector } from "./event-inspector";
import { CartAbandonmentNudge } from "./cart-abandonment-nudge";

export function SegmentProvider({ children }: { children: React.ReactNode }) {
  const hydrateEvents = useSegmentStore((s) => s.hydrateEvents);
  const events = useSegmentStore((s) => s.events);
  const traits = useSegmentStore((s) => s.traits);
  const userId = useSegmentStore((s) => s.userId);
  const audiences = useSegmentStore((s) => s.audiences);
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
  const setAudiences = useSegmentStore((s) => s.setAudiences);
  const setComputedTraits = useSegmentStore((s) => s.setComputedTraits);
  const advanceJourney = useSegmentStore((s) => s.advanceJourney);
  const prevAudiencesRef = useRef(audiences);

  // Derived cart stats — subscribe to items, derive counts locally to avoid
  // Zustand returning a new reference every render (which would cause loops).
  const cartItems = useCartStore((s) => s.items);
  const cartItemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartValue = cartItems.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  );

  // Hydrate persisted events on mount
  useEffect(() => {
    hydrateEvents();
  }, [hydrateEvents]);

  // Re-evaluate everything whenever events or cart change
  useEffect(() => {
    const computed = computeTraits({
      events,
      cartItemCount,
      cartValue,
    });
    setComputedTraits(computed);

    const { current, entered, exited } = evaluateAudiences(
      events,
      traits,
      computed,
      userId,
      prevAudiencesRef.current,
    );

    // Fire audience entered/exited as track events
    for (const def of entered) {
      analytics.track("Audience Entered", {
        audience_id: def.id,
        audience_name: def.name,
      });
    }
    for (const def of exited) {
      analytics.track("Audience Exited", {
        audience_id: def.id,
        audience_name: def.name,
      });
    }

    setAudiences(current);
    prevAudiencesRef.current = current;

    const stage = classifyStage(events, computed);
    advanceJourney(stage);
  }, [
    events,
    cartItems,
    cartItemCount,
    cartValue,
    traits,
    userId,
    setAudiences,
    setComputedTraits,
    advanceJourney,
  ]);

  return (
    <>
      {children}
      {demoMode && (
        <>
          <DemoToolbar />
          <DemoFab />
          <EventInspector />
          <CartAbandonmentNudge />
        </>
      )}
    </>
  );
}
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/segment/segment-provider.tsx
git commit -m "feat(segment): add orchestrator provider"
```

---

### Task 18: Wire SegmentProvider into the root layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update the layout**

Replace the full contents of `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { SegmentProvider } from "@/components/segment/segment-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Domino's Pizza Australia | Order Pizza Online for Delivery",
  description:
    "Order your favourite Domino's pizza online. Choose from our menu of pizzas, sides, drinks and desserts. Delivery or pickup available.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider>
          <AnalyticsProvider>
            <SegmentProvider>{children}</SegmentProvider>
          </AnalyticsProvider>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Run dev server and verify visually**

Run: `npm run dev`
Open: http://localhost:3000
Expected:
- Bottom-right: green "Segment" FAB with live event count.
- Top-right: "Segment Demo" toolbar button.
- Clicking the FAB opens the inspector drawer with 5 tabs.
- Events tab shows at least one `page` event from the initial load.
- Stop the dev server with `Ctrl+C` after verifying.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(segment): mount SegmentProvider in root layout"
```

---

### Task 19: Home page — swap in PersonalizationBanner

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update the home page**

Replace the contents of `src/app/page.tsx` with:

```tsx
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DeliveryBanner } from "@/components/layout/delivery-banner";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { DealsGrid } from "@/components/home/deals-grid";
import { PopularItems } from "@/components/home/popular-items";
import { AppDownloadBanner } from "@/components/home/app-download-banner";
import { PersonalizationBanner } from "@/components/segment/personalization-banner";

export default function Home() {
  return (
    <>
      <Header />
      <DeliveryBanner />

      <main className="flex-1">
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
      </main>

      <Footer />
      <CartDrawer />
    </>
  );
}
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(segment): render PersonalizationBanner above hero"
```

---

### Task 20: Menu page — insert NextBestOffer

**Files:**
- Modify: `src/app/menu/page.tsx`

- [ ] **Step 1: Import and render the component**

Add this import at the top of `src/app/menu/page.tsx` (after existing imports):

```tsx
import { NextBestOffer } from "@/components/segment/next-best-offer";
```

Then inside `<main className="flex-1">` / the `mx-auto max-w-7xl px-4 py-6` div, add `<NextBestOffer />` as the first child. The `<main>` block becomes:

```tsx
      <main className="flex-1">
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
      </main>
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/menu/page.tsx
git commit -m "feat(segment): render NextBestOffer on menu page"
```

---

### Task 21: Checkout — fire Form Abandoned on beforeunload

**Files:**
- Modify: `src/app/checkout/page.tsx`

- [ ] **Step 1: Add imports**

At the top of `src/app/checkout/page.tsx`, add `trackFormAbandoned` to the analytics imports. The existing block:

```tsx
import {
  trackCheckoutStarted,
  trackOrderCompleted,
  trackCouponApplied,
  trackCouponDenied,
} from "@/lib/analytics/events";
```

becomes:

```tsx
import {
  trackCheckoutStarted,
  trackOrderCompleted,
  trackCouponApplied,
  trackCouponDenied,
  trackFormAbandoned,
} from "@/lib/analytics/events";
```

- [ ] **Step 2: Add the abandonment effect**

Inside the `CheckoutPage` component, right after the `// Track checkout started on mount` `useEffect`, add this effect:

```tsx
  // Track abandonment on beforeunload (only if order hasn't been placed)
  useEffect(() => {
    function handler() {
      if (isSubmitting || items.length === 0) return;
      const totalFields = 3; // address, special instructions, coupon
      const fieldsFilled =
        (localAddress.trim() ? 1 : 0) +
        (specialInstructions.trim() ? 1 : 0) +
        (appliedCoupon ? 1 : 0);
      if (fieldsFilled < totalFields) {
        trackFormAbandoned("checkout", fieldsFilled, totalFields);
      }
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isSubmitting, items.length, localAddress, specialInstructions, appliedCoupon]);
```

- [ ] **Step 3: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/checkout/page.tsx
git commit -m "feat(segment): fire Form Abandoned on checkout unload"
```

---

### Task 22: Hero carousel — track Hero Banner Clicked + add video played demo event

**Files:**
- Modify: `src/components/home/hero-carousel.tsx`

- [ ] **Step 1: Add analytics import at the top**

Add this line after the other imports in `src/components/home/hero-carousel.tsx`:

```tsx
import { trackHeroBannerClicked } from "@/lib/analytics/events";
```

- [ ] **Step 2: Fire the click event on the CTA**

Find the CTA `<Link>` inside the slide content. Replace:

```tsx
                  <Link
                    href={slide.href}
                    className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-bold text-[var(--dominos-red)] shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-[0.98] sm:px-8 sm:py-3.5 sm:text-base"
                  >
                    {slide.cta}
                  </Link>
```

with:

```tsx
                  <Link
                    href={slide.href}
                    onClick={() =>
                      trackHeroBannerClicked(
                        `slide-${slide.id}`,
                        slide.headline,
                        current + 1,
                      )
                    }
                    className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-bold text-[var(--dominos-red)] shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-[0.98] sm:px-8 sm:py-3.5 sm:text-base"
                  >
                    {slide.cta}
                  </Link>
```

- [ ] **Step 3: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/hero-carousel.tsx
git commit -m "feat(segment): fire Hero Banner Clicked on CTA click"
```

---

### Task 23: Footer — newsletter signup form

**Files:**
- Modify: `src/components/layout/footer.tsx`

- [ ] **Step 1: Convert footer to a client component with a newsletter form**

Replace the full contents of `src/components/layout/footer.tsx` with:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackNewsletterSubscribed } from "@/lib/analytics/events";

const footerLinks = {
  "About Us": [
    { label: "Our Story", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Corporate", href: "/corporate" },
    { label: "Franchise Info", href: "/franchise" },
  ],
  "Customer Service": [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQs", href: "/faq" },
    { label: "Allergen Info", href: "/allergens" },
    { label: "Nutrition Info", href: "/nutrition" },
  ],
  More: [
    { label: "VIP Club", href: "/account/loyalty" },
    { label: "Gift Cards", href: "/gift-cards" },
    { label: "Catering", href: "/catering" },
    { label: "Store Locator", href: "/store-locator" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Accessibility", href: "/accessibility" },
    { label: "Sitemap", href: "/sitemap" },
  ],
};

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "done">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setState("submitting");
    try {
      trackNewsletterSubscribed(trimmed, "footer");
      await new Promise((r) => setTimeout(r, 500));
      setState("done");
      toast.success("Subscribed! Check your inbox.");
    } catch {
      setState("idle");
      toast.error("Something went wrong");
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm">
        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
        Thanks — you&apos;re subscribed.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm gap-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="h-9 border-white/20 bg-white/10 text-white placeholder:text-white/40"
        disabled={state === "submitting"}
        required
      />
      <Button
        type="submit"
        disabled={state === "submitting"}
        className="h-9 gap-1.5 bg-[var(--dominos-red)] text-white hover:bg-[var(--dominos-red)]/90"
      >
        {state === "submitting" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Mail className="h-3.5 w-3.5" />
        )}
        Subscribe
      </Button>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-[var(--dominos-dark-blue)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[2fr_repeat(4,1fr)]">
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/60">
              Get deals in your inbox
            </h3>
            <p className="mb-4 text-sm text-white/75">
              Weekly offers, exclusive coupons, new menu items. Unsubscribe anytime.
            </p>
            <NewsletterForm />
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/60">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/75 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-6 border-t border-white/10 pt-8 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--dominos-red)]">
              <span className="text-sm font-black text-white">D</span>
            </div>
            <span className="text-sm font-bold tracking-tight">
              DOMINO&apos;S PIZZA
            </span>
          </div>

          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} Domino&apos;s Pizza Enterprises
            Ltd. ABN 16 010 489 326
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/footer.tsx
git commit -m "feat(segment): add newsletter signup with tracking"
```

---

### Task 24: Group identify on checkout (B2B-style group call)

**Files:**
- Modify: `src/app/checkout/page.tsx`

- [ ] **Step 1: Import trackGroup**

Add `trackGroup` to the analytics imports at the top:

```tsx
import {
  trackCheckoutStarted,
  trackOrderCompleted,
  trackCouponApplied,
  trackCouponDenied,
  trackFormAbandoned,
  trackGroup,
} from "@/lib/analytics/events";
```

- [ ] **Step 2: Fire the group call after order success**

Inside `handlePlaceOrder`, right after the `trackOrderCompleted({...})` call, add:

```tsx
      // Group the user into the selected store for per-store rollups
      trackGroup(
        order.storeId,
        selectedStore?.name ?? "Domino's Sydney CBD",
        {
          type: "store",
          suburb: selectedStore?.suburb,
          state: selectedStore?.state,
        },
      );
```

- [ ] **Step 3: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/checkout/page.tsx
git commit -m "feat(segment): call group() for per-store analytics rollups"
```

---

### Task 25: Error boundary — fire Error Encountered events

**Files:**
- Create: `src/app/error.tsx`

- [ ] **Step 1: Create an App Router error boundary**

```tsx
// src/app/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackError } from "@/lib/analytics/events";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    trackError(error.message, {
      digest: error.digest,
      stack: error.stack,
      location: typeof window !== "undefined" ? window.location.pathname : "unknown",
    });
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-center text-muted-foreground">
        We&apos;ve logged this issue. Try again, or head back to the menu.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline" className="gap-1.5">
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
        <Button asChild className="gap-1.5 bg-[var(--dominos-red)] hover:bg-[var(--dominos-red)]/90">
          <Link href="/">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </Button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/error.tsx
git commit -m "feat(segment): add error boundary that fires Error Encountered"
```

---

### Task 26: Login success — call alias to merge anonymous → user

**Files:**
- Modify: `src/components/auth/login-form.tsx`
- Modify: `src/components/auth/register-form.tsx`

- [ ] **Step 1: Update the login form**

Add `trackAlias` to the imports in `src/components/auth/login-form.tsx`:

```tsx
import { trackSignedIn, trackAlias } from "@/lib/analytics/events";
```

Inside `handleSubmit`, after `trackSignedIn("email");` is called, add a best-effort alias call. The block:

```tsx
      trackSignedIn("email");
      router.push("/menu");
```

becomes:

```tsx
      trackSignedIn("email");
      try {
        trackAlias(email);
      } catch {
        // alias is best-effort; don't block login
      }
      router.push("/menu");
```

- [ ] **Step 2: Update the register form**

Add `trackAlias` to the imports in `src/components/auth/register-form.tsx`:

```tsx
import { trackSignedUp, trackAlias } from "@/lib/analytics/events";
```

And after `trackSignedUp("email", email);`, add:

```tsx
      trackSignedUp("email", email);
      try {
        trackAlias(email);
      } catch {
        // alias is best-effort
      }
      router.push("/menu");
```

- [ ] **Step 3: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/auth/login-form.tsx src/components/auth/register-form.tsx
git commit -m "feat(segment): call alias on login and register"
```

---

### Task 27: Account page — identify with full traits on load

**Files:**
- Modify: `src/app/account/page.tsx`

- [ ] **Step 1: Call identify with known traits**

Add an import to `src/app/account/page.tsx`:

```tsx
import { identifyUser } from "@/lib/analytics/events";
import { useEffect } from "react";
```

Inside `AccountPage()`, after the `const { data: session } = authClient.useSession();` line, add:

```tsx
  useEffect(() => {
    if (!session?.user) return;
    identifyUser(session.user.id, {
      email: session.user.email ?? "",
      name: session.user.name ?? "",
      created_at: new Date().toISOString(),
      loyalty_tier: "bronze",
      loyalty_points: 0,
      lifetime_orders: 0,
      lifetime_spend: 0,
      has_saved_address: false,
    });
  }, [session?.user]);
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/account/page.tsx
git commit -m "feat(segment): call identify with full user traits on account page"
```

---

### Task 28: Demo Mode CSS isolation — make sure overlays don't collide with header

**Files:**
- Modify: `src/components/segment/demo-toolbar.tsx`

- [ ] **Step 1: Lower the toolbar's z-index so the sticky header always wins when the page scrolls**

The header uses `z-50`. The toolbar currently uses `z-40`, which is already below. Verify the toolbar includes a top-offset that avoids covering the header's delivery bar on small screens. Update the outer `div` in `src/components/segment/demo-toolbar.tsx`:

The line:

```tsx
    <div className="fixed top-3 right-3 z-40 flex items-center gap-1.5">
```

becomes:

```tsx
    <div className="pointer-events-none fixed top-3 right-3 z-40 flex items-center gap-1.5 [&>*]:pointer-events-auto">
```

This keeps the toolbar non-blocking for underlying click targets in its padding area while still allowing its button to be clicked.

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/segment/demo-toolbar.tsx
git commit -m "fix(segment): prevent demo toolbar wrapper from blocking clicks"
```

---

### Task 29: Add an Audience Entered / Audience Exited spec note in the inspector

**Files:**
- Modify: `src/components/segment/audiences-panel.tsx`

- [ ] **Step 1: Add a recent-transition log to the audiences panel**

At the top of the `AudiencesPanel()` component body, add:

```tsx
  const events = useSegmentStore((s) => s.events);
  const recentTransitions = events
    .filter(
      (e) =>
        e.kind === "track" &&
        (e.name === "Audience Entered" || e.name === "Audience Exited"),
    )
    .slice(-6)
    .reverse();
```

Add this section at the end of the root `<div>` (below the map of audiences):

```tsx
      <section className="mt-4 rounded-lg border bg-card p-3">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recent transitions
        </h4>
        {recentTransitions.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No audience transitions yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {recentTransitions.map((e) => (
              <li key={e.id} className="flex justify-between text-xs">
                <span className="font-medium">
                  {e.name === "Audience Entered" ? "→ " : "← "}
                  {(e.properties?.audience_name as string) ?? "audience"}
                </span>
                <span className="text-muted-foreground">
                  {new Date(e.timestamp).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/segment/audiences-panel.tsx
git commit -m "feat(segment): show recent audience transitions"
```

---

### Task 30: README/docs — add a "Segment Demo features" section

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Append a new section to README.md**

Append this block at the end of `README.md`:

```markdown

## Segment CDP Demo Features

This demo is instrumented with [Segment](https://segment.com) via `@segment/analytics-next`, and ships with a full-featured demo toolkit for Solutions Engineers:

- **Event Inspector** — click the green **Segment** FAB in the bottom-right to open a live inspector of every `track`, `identify`, `page`, `group`, and `alias` call (with copy-as-JSON).
- **Audiences** — 8 pre-built client-side audiences evaluate in real time from the session's event log. Entering or exiting an audience fires `Audience Entered` / `Audience Exited` track events.
- **Identity panel** — shows the live `userId`, `anonymousId`, trait table, and the identify/alias timeline.
- **Customer Journey** — a funnel visualizer (Visitor → Engaged → Cart Abandoner → Customer → Repeat Customer → VIP) with stage history.
- **Computed Traits** — live-computed lifetime spend, order count, favorite category, days since last order, and more.
- **Personalization** — the home-page banner and a menu-page "Next Best Offer" swap their copy based on audience membership.
- **Demo personas** — load pre-seeded personas (VIP, Cart Abandoner, Deal Hunter, Anonymous) from the Segment Demo toolbar (top-right).
- **Cart abandonment nudge** — triggers a personalized Sonner toast after 45s of inactivity.

To hide every overlay and present the "before" state, click **Segment Demo → Demo overlays** and toggle off.

### Setup

Set `NEXT_PUBLIC_SEGMENT_WRITE_KEY` in `.env.local` (see `.env.example`). Leaving it blank keeps the demo fully functional locally — events still populate the inspector, they just don't send to Segment.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: describe Segment demo features"
```

---

### Task 31: Full end-to-end demo verification

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Verify the home page**

Open: http://localhost:3000

Expected:
- Green "Segment" FAB in bottom-right with a badge showing the event count (≥ 1 `page` event).
- "Segment Demo" popover in top-right.
- Clicking the FAB opens the inspector.
- Events tab shows the initial `Page` event.
- Audiences tab shows "New Visitors" matched (since no identify call yet).
- Journey tab shows current stage "Visitor".

- [ ] **Step 3: Verify personalization & persona loading**

In the inspector, close it. In the top-right toolbar, click **Segment Demo → Sarah — VIP Customer**.

Expected:
- A loading toast, then "Loaded Sarah — VIP Customer".
- FAB badge count jumps by ≥ 6.
- Home page reloads to show the VIP personalization banner ("Welcome back, VIP").
- Inspector → Audiences shows `vip_tier`, `pizza_lovers`, `high_value`, `new_visitors` transitioning.
- Inspector → Identity shows `userId=user-sarah-vip` and the full trait table.
- Inspector → Journey shows current stage "VIP".

- [ ] **Step 4: Verify cart abandonment**

In the toolbar, load the "Dan — Cart Abandoner" persona.

Expected:
- Inspector → Audiences shows `cart_abandoners` matched.
- After 45 seconds, a toast appears: "Don't forget your cart!" with a Checkout action.

- [ ] **Step 5: Verify checkout group + order completed**

Add a product to cart (e.g. navigate to `/product/pepperoni`, click "Add to Cart"), then go to `/checkout` and place the order.

Expected:
- Inspector shows `Checkout Started`, `Order Completed`, and `Group` events.
- Inspector → Journey advances to "Customer" (or "Repeat Customer" if prior orders exist).
- Inspector → Computed Traits shows lifetime orders ≥ 1.

- [ ] **Step 6: Stop server and commit any final fixes**

Stop the dev server with `Ctrl+C`. If any issues were found during verification and fixed, commit them:

```bash
git add -A
git commit -m "fix(segment): address verification issues"
```

If no fixes are needed, no commit.

- [ ] **Step 7: Verify production build**

Run: `npm run build`
Expected: build completes without errors (warnings about Segment network calls are acceptable).

---

## Summary

This plan delivers:

1. **Event Inspector** (real-time stream, JSON copy, filter, clear) — Tasks 10–11, 14–15.
2. **Audiences engine** (8 pre-built client-side audiences, entered/exited track events) — Tasks 6–7, 12, 29.
3. **Identity debug panel** (userId / anonymousId / traits / alias timeline) — Task 9.
4. **Customer Journey visualizer** (6 stages with history) — Task 13.
5. **Computed Traits** (lifetime spend, avg order, favorite category, cart stats) — Tasks 7, 13.
6. **Personalization** (hero banner, Next Best Offer, cart abandonment nudge) — Task 16, 19–20.
7. **Demo Toolbar** (persona loader, demo-mode switch, reset) — Task 15.
8. **Expanded Spec v2 coverage** (group, alias, newsletter, video, form abandoned, error) — Tasks 5, 22–27.
9. **End-to-end wiring + verification** — Tasks 17–18, 30–31.

Each task produces a working, testable, committable unit.
