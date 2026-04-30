# CTO Self-Demo Tour Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a self-guided `/tour` experience with four scripted adventures that walks a Domino's executive through the Segment CDP value story across web, mobile, and kiosk — narrator panel + spotlight overlays + multi-surface triptych — built on the existing demo primitives.

**Architecture:** New `src/components/tour/` module owns a narrator panel, spotlight overlay, multi-surface triptych, and a landing page. A new `src/stores/tour-store.ts` persists progress. Four typed adventure scripts live in `src/lib/tour/adventures.ts`. Existing Segment demo components get `data-tour-id` hooks (no rewrites). A single `<TourProvider>` mount inside the root layout subscribes to the event stream to auto-advance beats.

**Tech Stack:** Next.js 16 App Router, React 19, Zustand (persist), framer-motion, Tailwind, shadcn primitives, existing Segment Analytics.js bus. No new dependencies.

---

## Reference files (read before starting)

- Spec: `docs/superpowers/specs/2026-04-30-cto-self-demo-tour-design.md`
- Next.js docs in this repo version: `node_modules/next/dist/docs/01-app/`
- Existing Segment glue: `src/lib/segment/bus.ts`, `src/stores/segment-store.ts`, `src/lib/segment/personas.ts`, `src/lib/segment/audiences.ts`
- Toast to coordinate with: `src/components/segment/audience-toast-nudge.tsx`
- Root layout to mount into: `src/app/layout.tsx`
- Demo reset to hook: `src/components/segment/demo-toolbar.tsx` (`handleResetClick`)

## Project conventions to honor

- **No test runner.** Verification uses `npx tsc --noEmit`, `npm run lint`, `npm run build`, targeted `node` check scripts in `scripts/`, and manual browser runs.
- **Event names are "Noun Verbed"** (matches `Product Added`, `Order Completed`).
- **Analytics calls go through `analytics.track/identify/page/reset`** in `src/lib/segment/bus.ts` — never the raw Segment SDK.
- **Stores use `zustand` + `persist`** — same shape as the other three stores.
- **Client components need `"use client"`.**
- **Do not rewrite** existing Segment demo components. Add `data-tour-id` attributes only.
- **Commit frequently** — after each task, with a `feat(tour): ...` or `chore(tour): ...` message.

---

## Task 1: Define tour types

**Files:**
- Create: `src/lib/tour/types.ts`

- [ ] **Step 1: Write the types file**

Write `src/lib/tour/types.ts`:

```ts
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { Persona } from "@/lib/segment/personas";
import type { analytics } from "@/lib/segment/bus";

export type AdventureId =
  | "meet-sarah"
  | "build-audience"
  | "tracking-plan"
  | "cart-rescue";

export type SurfaceId = "web" | "mobile" | "kiosk";

export type BeatAdvance = "click" | "auto" | { onEvent: string };

export interface TourContext {
  router: Pick<AppRouterInstance, "push" | "replace">;
  analytics: typeof analytics;
  findPersona: (id: string) => Persona | undefined;
}

export type Beat =
  | { kind: "narrate"; copy: string; advance: "click" }
  | {
      kind: "spotlight";
      target: string;
      copy: string;
      advance: BeatAdvance;
    }
  | {
      kind: "action";
      do: (ctx: TourContext) => Promise<void>;
      copy: string;
      advance: "auto";
    }
  | {
      kind: "multi-surface";
      focus: SurfaceId;
      copy: string;
      advance: BeatAdvance;
    }
  | {
      kind: "recap";
      bullets: string[];
      ctas: Array<{ label: string; href: string; external?: boolean }>;
    };

export interface Adventure {
  id: AdventureId;
  title: string;
  tagline: string;
  estMinutes: number;
  difficulty: "foundational" | "advanced";
  icon: "identity" | "audience" | "tracking" | "rescue";
  beats: Beat[];
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: exit 0, no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/tour/types.ts
git commit -m "feat(tour): add tour beat and adventure types"
```

---

## Task 2: Create the tour store

**Files:**
- Create: `src/stores/tour-store.ts`

- [ ] **Step 1: Write the store**

Write `src/stores/tour-store.ts`:

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdventureId } from "@/lib/tour/types";

interface TourState {
  active: AdventureId | null;
  beatIndex: number;
  guestName: string;
  completed: AdventureId[];
  dismissed: boolean;
  panelCollapsed: boolean;
  startedAt: number | null;

  startAdventure: (id: AdventureId, guestName?: string) => void;
  advance: () => void;
  goToBeat: (index: number) => void;
  exit: (opts?: { markComplete?: boolean }) => void;
  toggleCollapse: () => void;
  reset: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      active: null,
      beatIndex: 0,
      guestName: "",
      completed: [],
      dismissed: false,
      panelCollapsed: false,
      startedAt: null,

      startAdventure: (id, guestName) =>
        set({
          active: id,
          beatIndex: 0,
          guestName: guestName ?? get().guestName,
          dismissed: false,
          panelCollapsed: false,
          startedAt: Date.now(),
        }),

      advance: () => set((s) => ({ beatIndex: s.beatIndex + 1 })),

      goToBeat: (index) => set({ beatIndex: Math.max(0, index) }),

      exit: (opts) =>
        set((s) => {
          const id = s.active;
          const markComplete = opts?.markComplete && id !== null;
          return {
            active: null,
            beatIndex: 0,
            dismissed: !markComplete,
            startedAt: null,
            completed:
              markComplete && id && !s.completed.includes(id)
                ? [...s.completed, id]
                : s.completed,
          };
        }),

      toggleCollapse: () =>
        set((s) => ({ panelCollapsed: !s.panelCollapsed })),

      reset: () =>
        set({
          active: null,
          beatIndex: 0,
          guestName: "",
          completed: [],
          dismissed: false,
          panelCollapsed: false,
          startedAt: null,
        }),
    }),
    {
      name: "dominos-tour-state",
      partialize: (s) => ({
        active: s.active,
        beatIndex: s.beatIndex,
        guestName: s.guestName,
        completed: s.completed,
        dismissed: s.dismissed,
        panelCollapsed: s.panelCollapsed,
        startedAt: s.startedAt,
      }),
    },
  ),
);
```

- [ ] **Step 2: Write a Node check script for the reducer logic**

Create `scripts/check-tour-store.mjs`:

```js
// Smoke-test tour store transitions without a browser.
// Zustand store is ESM-only; we test pure reducer logic by re-deriving
// the expected shape from the action contract.
import assert from "node:assert/strict";

// Pure reducer re-derivation — kept in lockstep with src/stores/tour-store.ts.
// If the store changes, update this file too (see task 2 step 3).
function reduce(state, action) {
  switch (action.type) {
    case "start":
      return {
        ...state,
        active: action.id,
        beatIndex: 0,
        guestName: action.guestName ?? state.guestName,
        dismissed: false,
        panelCollapsed: false,
        startedAt: 1,
      };
    case "advance":
      return { ...state, beatIndex: state.beatIndex + 1 };
    case "exit": {
      const markComplete = action.markComplete && state.active !== null;
      return {
        ...state,
        active: null,
        beatIndex: 0,
        dismissed: !markComplete,
        startedAt: null,
        completed:
          markComplete && !state.completed.includes(state.active)
            ? [...state.completed, state.active]
            : state.completed,
      };
    }
    case "reset":
      return {
        active: null,
        beatIndex: 0,
        guestName: "",
        completed: [],
        dismissed: false,
        panelCollapsed: false,
        startedAt: null,
      };
    default:
      return state;
  }
}

const init = {
  active: null,
  beatIndex: 0,
  guestName: "",
  completed: [],
  dismissed: false,
  panelCollapsed: false,
  startedAt: null,
};

// start → sets active + resets beat
let s = reduce(init, { type: "start", id: "meet-sarah", guestName: "CTO" });
assert.equal(s.active, "meet-sarah");
assert.equal(s.beatIndex, 0);
assert.equal(s.guestName, "CTO");

// advance increments
s = reduce(s, { type: "advance" });
s = reduce(s, { type: "advance" });
assert.equal(s.beatIndex, 2);

// exit with markComplete records completion
s = reduce(s, { type: "exit", markComplete: true });
assert.deepEqual(s.completed, ["meet-sarah"]);
assert.equal(s.active, null);
assert.equal(s.dismissed, false);

// starting again doesn't duplicate completion on exit
s = reduce(s, { type: "start", id: "meet-sarah" });
s = reduce(s, { type: "exit", markComplete: true });
assert.deepEqual(s.completed, ["meet-sarah"]);

// reset clears everything
s = reduce(s, { type: "reset" });
assert.deepEqual(s.completed, []);
assert.equal(s.guestName, "");

console.log("ok: tour-store reducer contract");
```

- [ ] **Step 3: Run the script — expect PASS**

Run: `node scripts/check-tour-store.mjs`
Expected: prints `ok: tour-store reducer contract`, exit 0.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/stores/tour-store.ts scripts/check-tour-store.mjs
git commit -m "feat(tour): add persisted tour state store"
```

---

## Task 3: Tour-aware toast timing flag

**Files:**
- Modify: `src/components/segment/audience-toast-nudge.tsx`

Spec §10 requires Adventure 4's 15-second shortened abandonment delay without affecting the production 45-second default.

- [ ] **Step 1: Read the current toast file**

Run: `cat src/components/segment/audience-toast-nudge.tsx`
Expected: matches what's shown in the reference above.

- [ ] **Step 2: Add tour-aware idle scaling**

Edit `src/components/segment/audience-toast-nudge.tsx`. Import the tour store and compute a scaled idleMs when a tour is active.

Add to imports:

```ts
import { useTourStore } from "@/stores/tour-store";
```

Inside `AudienceToastNudge`, change the component body to:

```tsx
export function AudienceToastNudge() {
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
  const audiences = useSegmentStore((s) => s.audiences);
  const tourActive = useTourStore((s) => s.active !== null);
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!demoMode) return;

    const memberIds = new Set(audiences.map((a) => a.id));
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const def of TOASTS) {
      if (firedRef.current.has(def.audienceId)) continue;
      if (!memberIds.has(def.audienceId)) continue;

      const idleMs = tourActive ? Math.min(def.idleMs, 15_000) : def.idleMs;

      const timer = setTimeout(() => {
        firedRef.current.add(def.audienceId);
        toast(def.title, {
          description: def.description,
          action: {
            label: def.ctaLabel,
            onClick: () => {
              if (typeof window !== "undefined") {
                window.location.href = def.ctaHref;
              }
            },
          },
          duration: def.duration ?? 15_000,
        });
      }, idleMs);

      timers.push(timer);
    }

    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [audiences, demoMode, tourActive]);

  return null;
}
```

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/segment/audience-toast-nudge.tsx
git commit -m "feat(tour): shorten abandonment toast delay while tour is active"
```

---

## Task 4: Tour analytics helpers

**Files:**
- Modify: `src/lib/analytics/events.ts` (append)

- [ ] **Step 1: Append helpers at the end of the file**

Add to the bottom of `src/lib/analytics/events.ts`:

```ts
// ---------------------------------------------------------------------------
// Tour (self-demo walkthrough)
// ---------------------------------------------------------------------------

export function trackTourStarted(props: {
  adventure_id: string;
  guest_name: string;
}): void {
  analytics.track("Tour Started", props);
}

export function trackTourBeatAdvanced(props: {
  adventure_id: string;
  beat_index: number;
  beat_kind: string;
}): void {
  analytics.track("Tour Beat Advanced", props);
}

export function trackTourCompleted(props: {
  adventure_id: string;
  elapsed_ms: number;
}): void {
  analytics.track("Tour Completed", props);
}

export function trackTourExited(props: {
  adventure_id: string;
  beat_index: number;
  reason: "user_dismissed" | "reset";
}): void {
  analytics.track("Tour Exited", props);
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/analytics/events.ts
git commit -m "feat(tour): add tour analytics helpers"
```

---

## Task 5: Tour Graduates audience + computed trait

**Files:**
- Modify: `src/lib/segment/types.ts` (add field to `ComputedTraits`)
- Modify: `src/lib/segment/audiences.ts` (compute + match)
- Modify: `src/stores/segment-store.ts` (default trait)

- [ ] **Step 1: Extend `ComputedTraits`**

In `src/lib/segment/types.ts`, inside the `ComputedTraits` interface, append:

```ts
  tours_completed_count: number;
```

just before the closing `}`.

- [ ] **Step 2: Default the new trait to 0**

In `src/stores/segment-store.ts`, inside the `DEFAULT_COMPUTED` object, add:

```ts
  tours_completed_count: 0,
```

as the final entry before the closing `}`.

- [ ] **Step 3: Compute the trait**

In `src/lib/segment/audiences.ts`, inside `computeTraits`, just before `return { ... }`, add:

```ts
  const tours_completed_count = events.filter(
    (e) => e.kind === "track" && e.name === "Tour Completed",
  ).length;
```

Then add `tours_completed_count,` to the returned object literal (alongside the other counts).

- [ ] **Step 4: Add the audience**

In `src/lib/segment/audiences.ts`, append to the `AUDIENCES` array, just before the closing `]`:

```ts
  {
    id: "tour_graduates",
    name: "Tour Graduates",
    description: "Completed at least one self-demo tour",
    color: "bg-emerald-600",
    match: ({ computedTraits }) => computedTraits.tours_completed_count >= 1,
  },
```

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/lib/segment/types.ts src/lib/segment/audiences.ts src/stores/segment-store.ts
git commit -m "feat(tour): add tours_completed_count trait and Tour Graduates audience"
```

---

## Task 6: Add data-tour-id hooks to existing demo components

**Files:**
- Modify: `src/components/segment/personalization-banner.tsx`
- Modify: `src/components/segment/identity-panel.tsx`
- Modify: `src/components/segment/audiences-panel.tsx`
- Modify: `src/components/segment/computed-traits-panel.tsx`
- Modify: `src/components/segment/journey-panel.tsx`
- Modify: `src/components/segment/event-inspector.tsx`
- Modify: `src/components/segment/event-stream.tsx`

These attributes are stable selectors for the spotlight overlay. No visual change.

- [ ] **Step 1: Personalization banner**

In `src/components/segment/personalization-banner.tsx`, on the `<motion.section>` tag (the one with `aria-label="Personalized banner"`), add:

```tsx
data-tour-id="tour-personalization-banner"
```

- [ ] **Step 2: Identity panel**

In `src/components/segment/identity-panel.tsx`, on the outer `<div className="flex flex-col gap-4 p-6 text-sm">`, add:

```tsx
data-tour-id="tour-identity-panel"
```

- [ ] **Step 3: Audiences panel**

In `src/components/segment/audiences-panel.tsx`, on the outer `<div className="flex flex-col gap-3 p-6 text-sm">`, add:

```tsx
data-tour-id="tour-audiences-panel"
```

- [ ] **Step 4: Computed traits panel**

In `src/components/segment/computed-traits-panel.tsx`, on the outer `<div className="flex flex-col gap-3 p-6 text-sm">`, add:

```tsx
data-tour-id="tour-computed-traits-panel"
```

- [ ] **Step 5: Journey panel**

In `src/components/segment/journey-panel.tsx`, on the outer `<div className="flex flex-col gap-4 p-6 text-sm">`, add:

```tsx
data-tour-id="tour-journey-panel"
```

- [ ] **Step 6: Event inspector sheet**

In `src/components/segment/event-inspector.tsx`, on the `<SheetContent>` element, add:

```tsx
data-tour-id="tour-event-inspector"
```

- [ ] **Step 7: Event stream — tag the latest row for Adventure 3**

Open `src/components/segment/event-stream.tsx`. Find the map that renders each event row (it renders `<EventRow />` for each event in the list). Tag the first rendered row (index 0 after any reverse sort) with `data-tour-id="tour-event-inspector-latest"`.

If the file reverses events newest-first already, add to the first row. If it iterates oldest-first, add to the last. Verify which by opening the file:

Run: `cat src/components/segment/event-stream.tsx`

Apply the attribute to the element rendered for the newest event. If it uses `<EventRow key={e.id} ...>`, wrap or pass:

```tsx
{items.map((e, idx) => (
  <EventRow
    key={e.id}
    event={e}
    data-tour-id={idx === 0 ? "tour-event-inspector-latest" : undefined}
  />
))}
```

If `EventRow` does not forward unknown props to its root, add a wrapper `<div data-tour-id={idx === 0 ? "tour-event-inspector-latest" : undefined}>` around the first `EventRow` instead — do not modify `EventRow` itself.

- [ ] **Step 8: Build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all exit 0.

- [ ] **Step 9: Commit**

```bash
git add src/components/segment/personalization-banner.tsx \
        src/components/segment/identity-panel.tsx \
        src/components/segment/audiences-panel.tsx \
        src/components/segment/computed-traits-panel.tsx \
        src/components/segment/journey-panel.tsx \
        src/components/segment/event-inspector.tsx \
        src/components/segment/event-stream.tsx
git commit -m "chore(tour): add data-tour-id hooks to Segment demo components"
```

---

## Task 7: Tag the cart-abandonment toast

**Files:**
- Modify: `src/components/segment/audience-toast-nudge.tsx`

Sonner toasts render into a portal; spotlight targets `[data-sonner-toast]` by default which is unstable. Instead, tag the toast at render time with a custom class the spotlight can find.

- [ ] **Step 1: Add a stable className + id to the `toast()` call**

In `src/components/segment/audience-toast-nudge.tsx`, change the `toast(def.title, { ... })` call to:

```ts
toast(def.title, {
  id: `tour-audience-toast-${def.audienceId}`,
  className: "tour-audience-toast",
  description: def.description,
  action: {
    label: def.ctaLabel,
    onClick: () => {
      if (typeof window !== "undefined") {
        window.location.href = def.ctaHref;
      }
    },
  },
  duration: def.duration ?? 15_000,
});
```

The spotlight resolver (Task 11) will accept the selector `tour-audience-toast` and translate it to `.tour-audience-toast` for any target that starts with `tour-audience-toast`.

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/segment/audience-toast-nudge.tsx
git commit -m "chore(tour): tag audience toast for spotlight targeting"
```

---

## Task 8: Adventure scripts (four adventures)

**Files:**
- Create: `src/lib/tour/adventures.ts`
- Create: `src/lib/tour/registry.ts`

Scripts are pure data. Actions reference the tour context passed in at runtime.

- [ ] **Step 1: Write the adventures file**

Create `src/lib/tour/adventures.ts`:

```ts
import type { Adventure, TourContext } from "./types";
import { findPersona } from "@/lib/segment/personas";

async function seedPersona(ctx: TourContext, id: string) {
  const p = ctx.findPersona(id);
  if (!p) return;
  await p.seed();
}

export const ADVENTURES: Adventure[] = [
  {
    id: "meet-sarah",
    title: "Meet Sarah. Everywhere.",
    tagline: "One customer, three surfaces, one profile.",
    estMinutes: 3,
    difficulty: "foundational",
    icon: "identity",
    beats: [
      {
        kind: "narrate",
        copy: "Meet Sarah Thompson. Gold-tier, 12 orders. She opens Domino's from her couch.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Loading Sarah's identity and order history…",
        advance: "auto",
        do: async (ctx) => {
          await seedPersona(ctx, "sarah_vip");
        },
      },
      {
        kind: "spotlight",
        target: "tour-personalization-banner",
        copy: "Her home page is already personalized. The copy swapped based on her loyalty_tier trait.",
        advance: "click",
      },
      {
        kind: "spotlight",
        target: "tour-identity-panel",
        copy: "One userId, live traits. This panel is the same regardless of which surface she's on.",
        advance: "click",
      },
      {
        kind: "multi-surface",
        focus: "mobile",
        copy: "Same customer, now on the mobile app. Notice the reorder strip is already populated.",
        advance: "click",
      },
      {
        kind: "multi-surface",
        focus: "kiosk",
        copy: "At the store, the kiosk recognizes her scanned loyalty QR. No sign-in — the session is already Sarah.",
        advance: "click",
      },
      {
        kind: "spotlight",
        target: "tour-event-inspector",
        copy: "Every event is tagged with context.app.name. Same person, three surfaces, one profile.",
        advance: "click",
      },
      {
        kind: "recap",
        bullets: [
          "Identity stitched across web, mobile, and kiosk via one userId.",
          "Traits travel with the profile, not the surface.",
          "Source attribution is automatic via context.app.name.",
        ],
        ctas: [
          { label: "Segment Identity docs", href: "https://segment.com/docs/connections/spec/identify/", external: true },
          { label: "Back to tour menu", href: "/tour" },
        ],
      },
    ],
  },

  {
    id: "build-audience",
    title: "Build an audience in 60 seconds.",
    tagline: "Real-time, not batch.",
    estMinutes: 2,
    difficulty: "foundational",
    icon: "audience",
    beats: [
      {
        kind: "narrate",
        copy: "We start anonymous. No account, no history. Watch the Audiences panel.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Clearing identity and heading to the deals page…",
        advance: "auto",
        do: async (ctx) => {
          await ctx.analytics.reset();
          ctx.router.push("/deals");
        },
      },
      {
        kind: "spotlight",
        target: "tour-audiences-panel",
        copy: "Click any deal on the page. I'll wait.",
        advance: { onEvent: "Deal Viewed" },
      },
      {
        kind: "spotlight",
        target: "tour-audiences-panel",
        copy: "Deal Hunter audience entered. That rule is live — no batch job, no overnight wait.",
        advance: "click",
      },
      {
        kind: "spotlight",
        target: "tour-audiences-panel",
        copy: "Now add a pizza to cart. Then come back here.",
        advance: { onEvent: "Product Added" },
      },
      {
        kind: "spotlight",
        target: "tour-audiences-panel",
        copy: "Cart Abandoner is primed. If she leaves without checking out, the nudge fires.",
        advance: "click",
      },
      {
        kind: "spotlight",
        target: "tour-computed-traits-panel",
        copy: "These traits recomputed after every event — favorite_category, product_add_count, cart_value.",
        advance: "click",
      },
      {
        kind: "recap",
        bullets: [
          "Audiences evaluate live from the event stream and computed traits.",
          "Entering an audience fires a trackable Audience Entered event.",
          "No warehouse round-trip, no pipeline lag.",
        ],
        ctas: [
          { label: "Segment Audiences docs", href: "https://segment.com/docs/engage/audiences/", external: true },
          { label: "Back to tour menu", href: "/tour" },
        ],
      },
    ],
  },

  {
    id: "tracking-plan",
    title: "One tracking plan, every surface.",
    tagline: "Write the spec once, honor it everywhere.",
    estMinutes: 3,
    difficulty: "advanced",
    icon: "tracking",
    beats: [
      {
        kind: "narrate",
        copy: "Most companies have different events on web, mobile, and in-store. Watch what happens here.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Opening the Event Inspector…",
        advance: "auto",
        do: async (_ctx) => {
          const { useSegmentStore } = await import("@/stores/segment-store");
          useSegmentStore.getState().setInspectorOpen(true);
          useSegmentStore.getState().setInspectorTab("events");
          useSegmentStore.getState().setEventFilter({});
        },
      },
      {
        kind: "multi-surface",
        focus: "web",
        copy: "Add a Meat Lovers to the cart on the web surface. I'll wait.",
        advance: { onEvent: "Product Added" },
      },
      {
        kind: "spotlight",
        target: "tour-event-inspector-latest",
        copy: "There's the Product Added event — product_id, category, price, quantity, source: web.",
        advance: "click",
      },
      {
        kind: "multi-surface",
        focus: "mobile",
        copy: "Now the same action in the mobile app.",
        advance: { onEvent: "Product Added" },
      },
      {
        kind: "spotlight",
        target: "tour-event-inspector-latest",
        copy: "Same event, same shape. Only source is different.",
        advance: "click",
      },
      {
        kind: "multi-surface",
        focus: "kiosk",
        copy: "Now in-store on the kiosk.",
        advance: { onEvent: "Product Added" },
      },
      {
        kind: "spotlight",
        target: "tour-event-inspector-latest",
        copy: "Identical. Your warehouse team loves you.",
        advance: "click",
      },
      {
        kind: "recap",
        bullets: [
          "One tracking plan is the contract across surfaces.",
          "Protocol violations surface immediately in the inspector.",
          "Source attribution is the only difference, and it's automatic.",
        ],
        ctas: [
          { label: "Segment Protocols docs", href: "https://segment.com/docs/protocols/", external: true },
          { label: "Back to tour menu", href: "/tour" },
        ],
      },
    ],
  },

  {
    id: "cart-rescue",
    title: "The cart abandonment rescue.",
    tagline: "One audience, every channel.",
    estMinutes: 3,
    difficulty: "advanced",
    icon: "rescue",
    beats: [
      {
        kind: "narrate",
        copy: "Meet Dan. Bronze tier. One item in cart. He's about to walk away.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Loading Dan's session…",
        advance: "auto",
        do: async (ctx) => {
          await seedPersona(ctx, "dan_abandoner");
        },
      },
      {
        kind: "spotlight",
        target: "tour-audiences-panel",
        copy: "Cart Abandoner audience is already active from his seeded events.",
        advance: "click",
      },
      {
        kind: "narrate",
        copy: "Watch. No clicks from here. Just wait — about 15 seconds.",
        advance: "click",
      },
      {
        kind: "spotlight",
        target: "tour-audience-toast-cart_abandoners",
        copy: "The on-site toast fires automatically. Same audience, same copy rule.",
        advance: { onEvent: "Audience Entered" },
      },
      {
        kind: "action",
        copy: "Opening Dan's inbox…",
        advance: "auto",
        do: async (_ctx) => {
          window.dispatchEvent(new CustomEvent("tour:open-inbox"));
        },
      },
      {
        kind: "narrate",
        copy: "Same rule, different channel. You set this once in Segment Engage.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Recording Dan's order completion…",
        advance: "auto",
        do: async (ctx) => {
          await ctx.analytics.track("Order Completed", {
            order_id: `tour-order-${Date.now()}`,
            total: 20.49,
            revenue: 18.99,
            currency: "AUD",
            category: "pizzas",
            store_id: "store-002",
          });
        },
      },
      {
        kind: "spotlight",
        target: "tour-journey-panel",
        copy: "Journey advanced. The audience, the recovery email, and the journey stage are all driven by one source of truth.",
        advance: "click",
      },
      {
        kind: "recap",
        bullets: [
          "Same audience powers on-site toast and email — one source of truth.",
          "Journey stages advance from real events, not manual tagging.",
          "Engage and journeys read from the same profile as the site.",
        ],
        ctas: [
          { label: "Segment Engage docs", href: "https://segment.com/docs/engage/", external: true },
          { label: "Back to tour menu", href: "/tour" },
        ],
      },
    ],
  },
];

// Wire in findPersona so actions can use ctx.findPersona without importing it.
export function makeTourContext(
  router: TourContext["router"],
  analytics: TourContext["analytics"],
): TourContext {
  return { router, analytics, findPersona };
}
```

- [ ] **Step 2: Write the registry**

Create `src/lib/tour/registry.ts`:

```ts
import { ADVENTURES } from "./adventures";
import type { Adventure, AdventureId } from "./types";

export function findAdventure(id: AdventureId | string): Adventure | undefined {
  return ADVENTURES.find((a) => a.id === id);
}

export function allAdventures(): Adventure[] {
  return ADVENTURES;
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Script-check adventure shape**

Create `scripts/check-tour-adventures.mjs`:

```js
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";

// Import via Next.js's tsconfig-paths would be ideal, but to keep this simple
// we statically re-derive the invariants we care about.

const expectedIds = ["meet-sarah", "build-audience", "tracking-plan", "cart-rescue"];

// Parse the source text to confirm each adventure id exists and each adventure
// has at least one "recap" beat at the end.
import fs from "node:fs";
const src = fs.readFileSync("src/lib/tour/adventures.ts", "utf8");

for (const id of expectedIds) {
  assert.ok(
    src.includes(`id: "${id}"`),
    `adventures.ts missing id: "${id}"`,
  );
}

// Every adventure block ends with a recap beat
const recapCount = (src.match(/kind:\s*"recap"/g) ?? []).length;
assert.equal(recapCount, 4, `expected 4 recap beats, got ${recapCount}`);

// Every onEvent reference names a known event we use in seeds or user actions
const onEventMatches = [...src.matchAll(/onEvent:\s*"([^"]+)"/g)].map((m) => m[1]);
const knownEvents = new Set([
  "Deal Viewed",
  "Product Added",
  "Audience Entered",
]);
for (const name of onEventMatches) {
  assert.ok(knownEvents.has(name), `unknown onEvent "${name}"`);
}

console.log("ok: adventure script structure");
```

Run: `node scripts/check-tour-adventures.mjs`
Expected: prints `ok: adventure script structure`, exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/tour/adventures.ts src/lib/tour/registry.ts scripts/check-tour-adventures.mjs
git commit -m "feat(tour): add adventure scripts and registry"
```

---

## Task 9: Spotlight overlay

**Files:**
- Create: `src/components/tour/spotlight-overlay.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/tour/spotlight-overlay.tsx`:

```tsx
"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function resolveTarget(tourId: string): Element | null {
  if (typeof document === "undefined") return null;
  // Sonner toasts + other portal content tag themselves with a className
  // prefixed `tour-audience-toast`. For anything else, match data-tour-id.
  if (tourId.startsWith("tour-audience-toast")) {
    return document.querySelector(`.${tourId}`) ?? document.querySelector(".tour-audience-toast");
  }
  return document.querySelector(`[data-tour-id="${tourId}"]`);
}

export interface SpotlightOverlayProps {
  target: string;
  copy: string;
  onNext?: () => void;
  waitingForEvent?: boolean;
}

export function SpotlightOverlay({
  target,
  copy,
  onNext,
  waitingForEvent,
}: SpotlightOverlayProps) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    let rafId = 0;
    function measure() {
      const el = resolveTarget(target);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      // If off-screen, scroll into view once, then re-measure next frame.
      if (r.bottom < 0 || r.top > window.innerHeight) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        rafId = requestAnimationFrame(measure);
        return;
      }
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    }

    measure();
    const onScrollResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);

    const interval = window.setInterval(measure, 500);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
      window.clearInterval(interval);
    };
  }, [target]);

  if (!mounted) return null;
  if (!rect) return null;

  const pad = 12;
  const boxTop = rect.top - pad;
  const boxLeft = rect.left - pad;
  const boxW = rect.width + pad * 2;
  const boxH = rect.height + pad * 2;

  const calloutWidth = 320;
  const viewportW = window.innerWidth;
  const calloutLeft = Math.min(
    Math.max(8, boxLeft),
    viewportW - calloutWidth - 8,
  );
  const calloutTop = boxTop + boxH + 12;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <svg
        className="pointer-events-auto absolute inset-0 h-full w-full"
        role="presentation"
      >
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={boxLeft}
              y={boxTop}
              width={boxW}
              height={boxH}
              rx={16}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.55)"
          mask="url(#spotlight-mask)"
        />
      </svg>
      <div
        className="pointer-events-auto absolute rounded-2xl border-2 border-white/80 shadow-[0_0_0_4px_rgba(255,255,255,0.12)]"
        style={{ top: boxTop, left: boxLeft, width: boxW, height: boxH }}
      />
      <div
        className="pointer-events-auto absolute rounded-lg bg-white p-4 text-sm text-slate-900 shadow-xl"
        style={{ top: calloutTop, left: calloutLeft, width: calloutWidth }}
      >
        <p className="mb-3 leading-snug">{copy}</p>
        {waitingForEvent ? (
          <p className="text-xs font-medium text-slate-500">Waiting for your click…</p>
        ) : onNext ? (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center rounded-md bg-[var(--dominos-red)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            Next →
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/tour/spotlight-overlay.tsx
git commit -m "feat(tour): add spotlight overlay component"
```

---

## Task 10: Narrator panel

**Files:**
- Create: `src/components/tour/narrator-panel.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/tour/narrator-panel.tsx`:

```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Adventure, Beat } from "@/lib/tour/types";

export interface NarratorPanelProps {
  adventure: Adventure;
  beatIndex: number;
  beat: Beat;
  collapsed: boolean;
  canAdvanceByClick: boolean;
  onNext: () => void;
  onExit: () => void;
  onToggleCollapse: () => void;
}

export function NarratorPanel({
  adventure,
  beatIndex,
  beat,
  collapsed,
  canAdvanceByClick,
  onNext,
  onExit,
  onToggleCollapse,
}: NarratorPanelProps) {
  const total = adventure.beats.length;
  const progress = Math.min(100, Math.round(((beatIndex + 1) / total) * 100));

  return (
    <motion.aside
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={cn(
        "pointer-events-auto fixed right-6 top-6 z-[70] flex max-h-[calc(100vh-3rem)] w-[420px] flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl",
        "max-lg:inset-x-4 max-lg:right-4 max-lg:top-auto max-lg:bottom-4 max-lg:w-auto max-lg:max-h-[60vh]",
        collapsed && "h-auto max-lg:max-h-none",
      )}
      role="dialog"
      aria-label="Tour narrator"
    >
      <header className="flex items-center justify-between gap-2 border-b bg-slate-50 px-4 py-3">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500">
            {adventure.title}
          </span>
          <span className="truncate text-[11px] text-slate-500">
            Beat {beatIndex + 1} of {total}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand narrator" : "Collapse narrator"}
          >
            {collapsed ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            aria-label="Exit tour"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="h-1 w-full bg-slate-100">
        <div
          className="h-full bg-[var(--dominos-red)] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!collapsed && (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-slate-800">
          {beat.kind === "recap" ? (
            <RecapBody beat={beat} onExit={onExit} />
          ) : (
            <>
              <p className="whitespace-pre-wrap">{"copy" in beat ? beat.copy : ""}</p>
              {beat.kind === "multi-surface" && (
                <Badge variant="outline" className="w-fit">
                  Focus: {beat.focus}
                </Badge>
              )}
            </>
          )}

          {canAdvanceByClick && beat.kind !== "recap" && (
            <Button
              className="w-fit"
              onClick={onNext}
              style={{ backgroundColor: "var(--dominos-red)" }}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
          {!canAdvanceByClick && beat.kind !== "recap" && (
            <p className="text-xs font-medium text-slate-500">
              Waiting for the expected event…
            </p>
          )}
        </div>
      )}
    </motion.aside>
  );
}

function RecapBody({
  beat,
  onExit,
}: {
  beat: Extract<Beat, { kind: "recap" }>;
  onExit: () => void;
}) {
  return (
    <>
      <h3 className="text-base font-semibold text-slate-900">What you just saw</h3>
      <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
        {beat.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2 pt-2">
        {beat.ctas.map((cta) => {
          if (cta.external) {
            return (
              <a
                key={cta.label}
                href={cta.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
              >
                {cta.label}
              </a>
            );
          }
          return (
            <Link
              key={cta.label}
              href={cta.href}
              onClick={onExit}
              className="inline-flex items-center rounded-md bg-[var(--dominos-red)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
            >
              {cta.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/tour/narrator-panel.tsx
git commit -m "feat(tour): add narrator panel component"
```

---

## Task 11: Tour provider (orchestrator)

**Files:**
- Create: `src/components/tour/tour-provider.tsx`

- [ ] **Step 1: Write the provider**

Create `src/components/tour/tour-provider.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useTourStore } from "@/stores/tour-store";
import { useSegmentStore } from "@/stores/segment-store";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { findAdventure } from "@/lib/tour/registry";
import { makeTourContext } from "@/lib/tour/adventures";
import { analytics } from "@/lib/segment/bus";
import {
  trackTourBeatAdvanced,
  trackTourCompleted,
  trackTourExited,
} from "@/lib/analytics/events";
import { NarratorPanel } from "./narrator-panel";
import { SpotlightOverlay } from "./spotlight-overlay";
import { TourInboxModal } from "./tour-inbox-modal";

export function TourProvider() {
  const mounted = useIsHydrated();
  const active = useTourStore((s) => s.active);
  const beatIndex = useTourStore((s) => s.beatIndex);
  const collapsed = useTourStore((s) => s.panelCollapsed);
  const advance = useTourStore((s) => s.advance);
  const exit = useTourStore((s) => s.exit);
  const toggleCollapse = useTourStore((s) => s.toggleCollapse);
  const startedAt = useTourStore((s) => s.startedAt);

  const router = useRouter();
  const runningActionRef = useRef<number>(-1);
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  const adventure = active ? findAdventure(active) : undefined;
  const beat = adventure?.beats[beatIndex];

  useEffect(() => {
    if (!adventure || !beat) return;
    if (beat.kind !== "action") return;
    if (runningActionRef.current === beatIndex) return;
    runningActionRef.current = beatIndex;
    const ctx = makeTourContext(router, analytics);
    (async () => {
      try {
        await beat.do(ctx);
      } catch (err) {
        console.warn("[tour] action beat failed:", err);
      } finally {
        trackTourBeatAdvanced({
          adventure_id: adventure.id,
          beat_index: beatIndex,
          beat_kind: beat.kind,
        });
        advanceRef.current();
      }
    })();
  }, [adventure, beat, beatIndex, router]);

  useEffect(() => {
    if (!adventure || !beat) return;
    if (beat.kind !== "spotlight" && beat.kind !== "multi-surface") return;
    if (beat.advance === "click" || beat.advance === "auto") return;
    const onEvent = beat.advance.onEvent;

    const unsub = useSegmentStore.subscribe((state, prev) => {
      if (state.events.length <= prev.events.length) return;
      const latest = state.events[state.events.length - 1];
      if (latest.kind !== "track" || latest.name !== onEvent) return;
      trackTourBeatAdvanced({
        adventure_id: adventure.id,
        beat_index: beatIndex,
        beat_kind: beat.kind,
      });
      advanceRef.current();
    });
    return () => unsub();
  }, [adventure, beat, beatIndex]);

  useEffect(() => {
    if (!adventure) return;
    if (beatIndex < adventure.beats.length) return;
    const elapsed = startedAt ? Date.now() - startedAt : 0;
    trackTourCompleted({ adventure_id: adventure.id, elapsed_ms: elapsed });
    exit({ markComplete: true });
  }, [adventure, beatIndex, startedAt, exit]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!adventure) return;
      if (e.key === "ArrowRight" && beat && beat.kind !== "action") {
        if (beat.kind === "recap") return;
        if ("advance" in beat && beat.advance === "click") {
          trackTourBeatAdvanced({
            adventure_id: adventure.id,
            beat_index: beatIndex,
            beat_kind: beat.kind,
          });
          advanceRef.current();
        }
      } else if (e.key === "Escape") {
        toggleCollapse();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [adventure, beat, beatIndex, toggleCollapse]);

  if (!mounted || !adventure || !beat) return null;

  const canAdvanceByClick =
    beat.kind === "narrate" ||
    ((beat.kind === "spotlight" || beat.kind === "multi-surface") &&
      beat.advance === "click");

  function handleNext() {
    if (!adventure || !beat) return;
    trackTourBeatAdvanced({
      adventure_id: adventure.id,
      beat_index: beatIndex,
      beat_kind: beat.kind,
    });
    advance();
  }

  function handleExit() {
    if (!adventure) return;
    trackTourExited({
      adventure_id: adventure.id,
      beat_index: beatIndex,
      reason: "user_dismissed",
    });
    exit();
  }

  return (
    <AnimatePresence>
      {beat.kind === "spotlight" && !collapsed && (
        <SpotlightOverlay
          target={beat.target}
          copy={beat.copy}
          onNext={beat.advance === "click" ? handleNext : undefined}
          waitingForEvent={beat.advance !== "click"}
        />
      )}
      <NarratorPanel
        adventure={adventure}
        beatIndex={beatIndex}
        beat={beat}
        collapsed={collapsed}
        canAdvanceByClick={canAdvanceByClick}
        onNext={handleNext}
        onExit={handleExit}
        onToggleCollapse={toggleCollapse}
      />
      <TourInboxModal />
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0 — except expect an error about `./tour-inbox-modal` not existing yet. That's fixed in Task 12.

- [ ] **Step 3: Do not commit yet**

Provider commit combines with the inbox modal in Task 12.

---

## Task 12: Tour inbox modal (Adventure 4 email prop)

**Files:**
- Create: `src/components/tour/tour-inbox-modal.tsx`

- [ ] **Step 1: Write the modal**

Create `src/components/tour/tour-inbox-modal.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail } from "lucide-react";

export function TourInboxModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handler() {
      setOpen(true);
    }
    window.addEventListener("tour:open-inbox", handler as EventListener);
    return () => window.removeEventListener("tour:open-inbox", handler as EventListener);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4 text-[var(--dominos-red)]" />
            Inbox · Dan Kelly
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 rounded-lg border bg-slate-50 p-4 text-sm">
          <div className="flex items-start justify-between gap-4 border-b pb-2">
            <div>
              <div className="font-semibold">Domino's</div>
              <div className="text-xs text-slate-500">noreply@dominos.demo</div>
            </div>
            <div className="text-xs text-slate-500">just now</div>
          </div>
          <div className="text-sm">
            <p className="mb-2 font-semibold">Don&apos;t forget your cart!</p>
            <p className="text-slate-700">
              Complete your order in the next 10 min for free garlic bread.
            </p>
          </div>
          <p className="text-[11px] text-slate-500">
            Triggered by: <code>Cart Abandoner</code> audience via Segment Engage.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Typecheck + lint + build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all exit 0.

- [ ] **Step 3: Commit provider + modal together**

```bash
git add src/components/tour/tour-provider.tsx src/components/tour/tour-inbox-modal.tsx
git commit -m "feat(tour): add tour provider orchestrator and Adventure 4 inbox modal"
```

---

## Task 13: Multi-surface triptych

**Files:**
- Create: `src/components/tour/tour-multi-surface.tsx`
- Create: `src/components/tour/tour-multi-surface-client.tsx`

Uses iframes for the two non-focused surfaces. Gated to ≥1280px; below that, renders a narrator hint only.

- [ ] **Step 1: Write the triptych**

Create `src/components/tour/tour-multi-surface.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { SurfaceId } from "@/lib/tour/types";

const SURFACES: { id: SurfaceId; label: string; href: string }[] = [
  { id: "web", label: "Web", href: "/" },
  { id: "mobile", label: "Mobile app", href: "/m" },
  { id: "kiosk", label: "Kiosk", href: "/kiosk" },
];

interface Props {
  focus: SurfaceId;
}

export function TourMultiSurface({ focus }: Props) {
  const [wide, setWide] = useState(false);

  useEffect(() => {
    function check() {
      setWide(window.innerWidth >= 1280);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!wide) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border bg-amber-50 p-6 text-sm text-amber-900">
        <p className="mb-2 font-semibold">Triptych unavailable at this size.</p>
        <p>
          For the multi-surface view, expand this window to 1280px or wider. You can
          also open <code>/m</code> and <code>/kiosk</code> in adjacent tabs and follow along.
        </p>
      </div>
    );
  }

  const primary = SURFACES.find((s) => s.id === focus)!;
  const secondaries = SURFACES.filter((s) => s.id !== focus);

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <SurfacePane href={primary.href} label={primary.label} dominant />
      <div className="grid gap-3" style={{ gridTemplateRows: "1fr 1fr" }}>
        {secondaries.map((s) => (
          <SurfacePane key={s.id} href={s.href} label={s.label} />
        ))}
      </div>
    </div>
  );
}

function SurfacePane({
  href,
  label,
  dominant,
}: {
  href: string;
  label: string;
  dominant?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-white",
        dominant && "shadow-lg",
      )}
    >
      <div className="absolute right-2 top-2 z-10 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white">
        {label}
      </div>
      <iframe
        src={href}
        title={label}
        className="h-full w-full"
        sandbox="allow-same-origin allow-scripts allow-forms"
      />
    </div>
  );
}
```

- [ ] **Step 2: Create placeholder so the provider compiles now**

Create `src/components/tour/tour-multi-surface-client.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";

// Dynamic import keeps iframe pane out of the initial bundle until used.
export const TourMultiSurface = dynamic(
  () => import("./tour-multi-surface").then((m) => m.TourMultiSurface),
  { ssr: false },
);
```

- [ ] **Step 3: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/tour/tour-multi-surface.tsx src/components/tour/tour-multi-surface-client.tsx
git commit -m "feat(tour): add multi-surface triptych component"
```

---

## Task 14: `/tour` landing page

**Files:**
- Create: `src/app/tour/layout.tsx`
- Create: `src/app/tour/page.tsx`
- Create: `src/components/tour/tour-landing.tsx`

- [ ] **Step 1: Minimal layout**

Create `src/app/tour/layout.tsx`:

```tsx
export default function TourLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-slate-950 text-white">{children}</main>;
}
```

- [ ] **Step 2: Landing page (server component shell)**

Create `src/app/tour/page.tsx`:

```tsx
import { TourLanding } from "@/components/tour/tour-landing";

export default async function TourPage({
  searchParams,
}: {
  searchParams: Promise<{ guest?: string }>;
}) {
  const { guest } = await searchParams;
  return <TourLanding guestName={guest ?? ""} />;
}
```

(Per `AGENTS.md` and the Next 16 docs in `node_modules/next/dist/docs/01-app/`, `searchParams` is a Promise in page components.)

- [ ] **Step 3: Landing client**

Create `src/components/tour/tour-landing.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles, Users, Target, MailCheck, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { allAdventures } from "@/lib/tour/registry";
import { useTourStore } from "@/stores/tour-store";
import { useSegmentStore } from "@/stores/segment-store";
import { trackTourStarted } from "@/lib/analytics/events";
import type { Adventure } from "@/lib/tour/types";

const ICON_MAP = {
  identity: User,
  audience: Users,
  tracking: Target,
  rescue: MailCheck,
} as const;

export function TourLanding({ guestName }: { guestName: string }) {
  const router = useRouter();
  const active = useTourStore((s) => s.active);
  const completed = useTourStore((s) => s.completed);
  const start = useTourStore((s) => s.startAdventure);
  const setDemoMode = useSegmentStore((s) => s.setDemoMode);

  // Persist guestName into store on first load so it survives reloads.
  useEffect(() => {
    if (guestName) {
      useTourStore.setState({ guestName });
    }
  }, [guestName]);

  function handleStart(a: Adventure) {
    setDemoMode(true);
    start(a.id, guestName || undefined);
    trackTourStarted({ adventure_id: a.id, guest_name: guestName || "guest" });
    router.push(`/tour/${a.id}`);
  }

  const greeting = guestName ? `, ${guestName}` : "";

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-10 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-rose-400">
          <Sparkles className="h-3.5 w-3.5" />
          Self-demo tour
        </div>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          Welcome{greeting}. Let&apos;s show you your data in motion.
        </h1>
        <p className="max-w-2xl text-slate-300">
          Pick a path. Each one walks you through one slice of the Segment story —
          live, on this site, using your real event stream. About three minutes each.
        </p>
      </div>

      {active && (
        <div className="mb-8 flex items-center justify-between rounded-xl border border-rose-400/30 bg-rose-500/10 p-4">
          <span className="text-sm">
            You&apos;re mid-tour.{" "}
            <span className="font-semibold">
              {allAdventures().find((a) => a.id === active)?.title}
            </span>
          </span>
          <Link
            href={`/tour/${active}`}
            className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:opacity-90"
          >
            Resume
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {allAdventures().map((a) => {
          const Icon = ICON_MAP[a.icon];
          const done = completed.includes(a.id);
          return (
            <Card
              key={a.id}
              className="group relative border-white/10 bg-slate-900/60 text-white"
            >
              {done && (
                <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-emerald-400" />
              )}
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-300">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <p className="text-xs text-slate-400">{a.tagline}</p>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3 pt-0">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Badge variant="outline" className="border-white/10 text-slate-200">
                    {a.estMinutes} min
                  </Badge>
                  <Badge variant="outline" className="border-white/10 text-slate-200">
                    {a.difficulty}
                  </Badge>
                </div>
                <Button
                  onClick={() => handleStart(a)}
                  className="bg-[var(--dominos-red)] text-white hover:opacity-90"
                  size="sm"
                >
                  Start
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="text-xs text-slate-400 underline-offset-4 hover:underline"
        >
          Skip the tour, just explore →
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/app/tour/layout.tsx src/app/tour/page.tsx src/components/tour/tour-landing.tsx
git commit -m "feat(tour): add /tour landing page and adventure picker"
```

---

## Task 15: Per-adventure routes

**Files:**
- Create: `src/app/tour/[adventure]/page.tsx`
- Create: `src/components/tour/tour-runner.tsx`

- [ ] **Step 1: Dynamic route**

Create `src/app/tour/[adventure]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { findAdventure } from "@/lib/tour/registry";
import { TourRunner } from "@/components/tour/tour-runner";

export default async function AdventurePage({
  params,
}: {
  params: Promise<{ adventure: string }>;
}) {
  const { adventure } = await params;
  const found = findAdventure(adventure);
  if (!found) notFound();
  return <TourRunner adventureId={found.id} />;
}
```

- [ ] **Step 2: Runner client**

Create `src/components/tour/tour-runner.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useTourStore } from "@/stores/tour-store";
import { useSegmentStore } from "@/stores/segment-store";
import { findAdventure } from "@/lib/tour/registry";
import { TourMultiSurface } from "./tour-multi-surface-client";
import type { AdventureId } from "@/lib/tour/types";

export function TourRunner({ adventureId }: { adventureId: AdventureId }) {
  const active = useTourStore((s) => s.active);
  const beatIndex = useTourStore((s) => s.beatIndex);
  const start = useTourStore((s) => s.startAdventure);
  const setDemoMode = useSegmentStore((s) => s.setDemoMode);

  useEffect(() => {
    setDemoMode(true);
    if (active !== adventureId) {
      start(adventureId);
    }
  }, [active, adventureId, setDemoMode, start]);

  const adventure = findAdventure(adventureId);
  const beat = adventure?.beats[beatIndex];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 text-white">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-rose-400">Tour · in progress</p>
        <h1 className="mt-1 text-3xl font-black">{adventure?.title}</h1>
      </header>
      {beat?.kind === "multi-surface" ? (
        <TourMultiSurface focus={beat.focus} />
      ) : (
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-10 text-sm text-slate-300">
          <p>Follow the narrator panel on the right to advance.</p>
          <p className="mt-2 text-xs text-slate-500">
            Tip: if a spotlight is shown on the main site, the narrator will tell you
            what to click. When waiting, it advances automatically once the expected
            event fires.
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/app/tour/[adventure]/page.tsx src/components/tour/tour-runner.tsx
git commit -m "feat(tour): add per-adventure route and runner"
```

---

## Task 16: Mount tour provider in root layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Import and mount**

Edit `src/app/layout.tsx`. Add the import:

```ts
import { TourProvider } from "@/components/tour/tour-provider";
```

Change the `<SegmentProvider>` element to wrap `TourProvider` alongside children:

```tsx
<SegmentProvider>
  {children}
  <TourProvider />
</SegmentProvider>
```

- [ ] **Step 2: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(tour): mount TourProvider in root layout"
```

---

## Task 17: Wire tour reset into DemoToolbar

**Files:**
- Modify: `src/components/segment/demo-toolbar.tsx`

- [ ] **Step 1: Reset tour state on "Reset demo state"**

Edit `src/components/segment/demo-toolbar.tsx`. Add the import:

```ts
import { useTourStore } from "@/stores/tour-store";
```

Inside `DemoToolbar`, near the other selectors, add:

```ts
const resetTour = useTourStore((s) => s.reset);
const activeTour = useTourStore((s) => s.active);
```

In `handleResetClick`, after `clear();`, add:

```ts
if (activeTour) {
  // Record an exit for the active tour before wiping state.
  const { trackTourExited } = await import("@/lib/analytics/events");
  const { useTourStore: store } = await import("@/stores/tour-store");
  trackTourExited({
    adventure_id: activeTour,
    beat_index: store.getState().beatIndex,
    reason: "reset",
  });
}
resetTour();
```

Change `handleResetClick` to `async function handleResetClick()` so the dynamic imports can await.

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/segment/demo-toolbar.tsx
git commit -m "feat(tour): reset active tour from the Reset demo button"
```

---

## Task 18: Resume pill in site headers

**Files:**
- Create: `src/components/tour/tour-resume-pill.tsx`
- Modify: `src/components/layout/header.tsx`
- Modify: `src/components/mobile/mobile-top-bar.tsx`
- Modify: `src/components/kiosk/kiosk-top-chrome.tsx`

- [ ] **Step 1: Write the pill**

Create `src/components/tour/tour-resume-pill.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useTourStore } from "@/stores/tour-store";
import { useIsHydrated } from "@/lib/use-is-hydrated";

export function TourResumePill() {
  const mounted = useIsHydrated();
  const active = useTourStore((s) => s.active);
  if (!mounted || !active) return null;

  return (
    <Link
      href={`/tour/${active}`}
      className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow hover:opacity-90"
    >
      <Sparkles className="h-3.5 w-3.5" />
      Resume tour
    </Link>
  );
}
```

- [ ] **Step 2: Mount in the web header**

In `src/components/layout/header.tsx`, import the pill:

```ts
import { TourResumePill } from "@/components/tour/tour-resume-pill";
```

Place `<TourResumePill />` immediately before the cart button in the header's right-side action cluster. If the right cluster is not obvious, place it immediately after the last `<nav>` element. The pill renders nothing when no tour is active.

- [ ] **Step 3: Mount in the mobile top bar**

In `src/components/mobile/mobile-top-bar.tsx`, import and place `<TourResumePill />` in whatever right-side action slot the component already uses (after the bell/search icons). If none, place it as the last child of the bar's flex container.

- [ ] **Step 4: Mount in kiosk top chrome**

In `src/components/kiosk/kiosk-top-chrome.tsx`, import and place `<TourResumePill />` next to the "Start over" button.

- [ ] **Step 5: Typecheck + lint + build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/components/tour/tour-resume-pill.tsx \
        src/components/layout/header.tsx \
        src/components/mobile/mobile-top-bar.tsx \
        src/components/kiosk/kiosk-top-chrome.tsx
git commit -m "feat(tour): add Resume tour pill across web, mobile, and kiosk headers"
```

---

## Task 19: End-to-end manual verification

**Files:** none

- [ ] **Step 1: Static gates**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: exit 0.

- [ ] **Step 2: Run node script checks**

Run: `node scripts/check-tour-store.mjs && node scripts/check-tour-adventures.mjs`
Expected: both print `ok: ...`.

- [ ] **Step 3: Dev server**

Run: `npm run dev`
Leave it running in the background and test in a browser.

- [ ] **Step 4: Landing greeting**

Navigate to `http://localhost:3000/tour?guest=CTO`.
Confirm the headline reads "Welcome, CTO. Let's show you your data in motion."
Confirm 4 adventure cards show.

- [ ] **Step 5: Adventure 1 — Meet Sarah**

Click **Start** on "Meet Sarah. Everywhere."
- Confirm navigation to `/tour/meet-sarah`.
- Confirm narrator panel appears top-right with "Beat 1 of 9".
- Click **Next** through the opening narrate beat.
- Persona seed auto-runs (action beat).
- Second action beat auto-runs: parent tab navigates to `/`, Event Inspector sheet opens on the Identity tab.
- Confirm spotlight illuminates the Personalization Banner on the home page (orange/red card, "Welcome back, VIP" copy or similar VIP-tier variant).
- Click Next; confirm spotlight lands on the Identity panel inside the inspector.
- Advance to multi-surface beats; confirm iframe triptych appears with mobile focus, then kiosk focus.
- Confirm the `tour-event-inspector` spotlight lands next.
- Confirm recap card has two CTAs and the "Back to tour menu" link exits the tour.
- Confirm the adventure card on `/tour` now shows a green check.

- [ ] **Step 6: Adventure 2 — Build an audience**

Click "Segment Demo" FAB → "Reset demo state" first for a clean run.
Click **Start** on "Build an audience in 60 seconds."
- Auto-advance redirects to `/deals` AND opens the Event Inspector on the Audiences tab.
- Click any deal card. Confirm narrator auto-advances (waits on `Deal Viewed`).
- Confirm the Deal Hunter badge in the Audiences panel turns green.
- Click Next; navigate manually to `/menu` and add any pizza to cart. Confirm narrator auto-advances on `Product Added`.
- Confirm the Cart Abandoner badge turns green.
- Click Next through the computed-traits spotlight.
- Reach the recap.

- [ ] **Step 7: Adventure 3 — Tracking plan**

Start "One tracking plan, every surface."
- Event Inspector opens automatically on the Events tab (action beat).
- Triptych renders with three iframes (web / mobile / kiosk).
- In the web pane, navigate to `/menu` and add a Meat Lovers. Parent tab's Event Inspector should show the `Product Added` event arriving from the iframe (this proves the BroadcastChannel receiver is wired correctly). Narrator advances on `Product Added`.
- Click Next through the spotlight on the latest event row.
- Repeat in the mobile iframe: navigate to `/m/menu`, add a Meat Lovers. Narrator advances.
- Repeat in the kiosk iframe: navigate to `/kiosk/menu`, add a Meat Lovers. Narrator advances.
- Confirm three `Product Added` events are visible in the inspector; only the `source` property differs (`web`, `mobile`, `kiosk`).
- Reach the recap.

- [ ] **Step 8: Adventure 4 — Cart rescue**

Start "The cart abandonment rescue."
- Dan's persona seeds automatically.
- Second action beat auto-runs: Event Inspector opens on the Audiences tab, parent tab navigates to `/menu`.
- Confirm the Cart Abandoner badge is already green.
- Click Next through the spotlight and the "Watch. Just wait." narrate beat.
- Within 15s, confirm the Sonner toast fires in the bottom-right ("Don't forget your cart!"). Narrator advances on `Audience Entered`.
- The inbox modal opens automatically. Click Next through the modal narrate beat.
- `Order Completed` fires automatically; inspector tab flips to Journey.
- Confirm the Journey panel shows stage advance (visitor → engaged → customer or similar).
- Reach the recap.

- [ ] **Step 9: Reload mid-tour**

While Adventure 1 is active at beat 5, reload the page. Confirm the Resume tour pill is visible in the header and `/tour` shows the resume banner.

- [ ] **Step 10: Reset clears tour**

Click "Segment Demo" FAB → "Reset demo state" → confirm. Confirm the tour exits and the `/tour` landing no longer shows any active banner.

- [ ] **Step 11: Narrow viewport fallback**

Resize the browser to 1000px wide. Start Adventure 1 again and advance to the multi-surface beat. Confirm the amber fallback message appears ("Triptych unavailable at this size.") instead of a broken layout.

- [ ] **Step 12: Vercel preview**

Run: `git push` (or `vercel deploy` per project convention) and repeat steps 4–11 on the preview URL.

- [ ] **Step 13: Record verification outcome in the plan**

Once all steps pass, reply in the task executor with a summary of which step/surface was tested and on which browser. Do not commit the verification record — it's a PR comment, not a doc change.

---

## Self-review checklist (plan author)

**Spec coverage:**

| Spec section | Task(s) |
|---|---|
| §4.1 New directory + 4.2 component map | 9, 10, 11, 12, 13, 14, 15 |
| §4.3 reuse of existing Segment primitives | 6, 7 (hooks only) |
| §4.4 routes `/tour`, `/tour/<slug>` | 14, 15 |
| §4.5 mount in root layout | 16 |
| §5 four adventures with beat scripts | 8 |
| §6.1 tour-store shape | 2 |
| §6.2 auto-advance subscription | 11 |
| §6.3 off-script tolerance (minimize, don't block) | 10, 11 (narrator has Collapse + Exit; provider doesn't block on missed events) |
| §6.4 multi-surface sync via existing broadcast channel | reuse — no code change (triptych iframes mount the real routes; existing `setupCartBroadcast` in `<SegmentProvider>` runs inside the iframe) |
| §6.5 guest name from `?guest=` | 14 |
| §6.6 reset clears tour | 17 |
| §7.1 landing spec | 14 |
| §7.2 narrator panel spec | 10 |
| §7.3 spotlight spec | 9 |
| §7.4 triptych spec + <1280px fallback | 13 |
| §7.5 resume pill in every shell | 18 |
| §8 analytics helpers, new computed trait, new audience | 4, 5 |
| §9 verification | 19 |
| §10 tour-aware toast timing | 3 |

**Placeholder scan:** no `TBD`, no `handle edge cases`, every step has explicit code or command.

**Type consistency:** `AdventureId` defined in Task 1, used in Tasks 2, 8, 11, 15, 18. `Beat` union defined in Task 1, consumed in Tasks 10, 11. `TourContext` defined in Task 1, constructed in Task 8, injected in Task 11. `data-tour-id` selectors named in spec match selectors used in scripts (Task 8) and components (Task 6, 7).

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-30-cto-self-demo-tour.md`.

Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — execute tasks in this session with checkpoints after every few tasks.

Which approach?



