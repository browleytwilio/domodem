# CTO Self-Demo Tour — Design

**Status:** Approved 2026-04-30
**Project:** domdemo (Domino's Segment demo)
**Author:** Segment SE demo build

---

## 1. Goal

A self-service guided tour at `/tour` that lets a Domino's executive (specifically the CTO) pick an "adventure" and be walked — by the site itself — through the Segment CDP value story across the existing web, mobile, and kiosk surfaces. The experience requires zero human driver. The outcome is a clear, memorable "I saw the data platform prove itself in four places" moment, educational enough that the CTO can retell the story to their team.

## 2. Non-goals

- No audio narration or text-to-speech.
- No real email send for Adventure 4 (fake inbox modal only).
- No cross-device handoff — a single browser runs the whole experience; multi-surface is simulated via iframe triptych.
- No A/B testing between adventures, no variant copy.
- No new marketplace integrations, no new server routes, no schema/DB changes.
- No new test runner. Verification stays manual plus `tsc`/`lint`/`build`.
- No changes to existing persona seed data, audience rules, or event taxonomy.

## 3. Constraints

- **Single Next.js 16 App Router project**, same as the rest of the demo.
- **Single Vercel deployment.** No new domains or projects.
- **Existing env vars only.** No new secrets.
- **Leverages existing components** — Event Inspector, Audiences panel, Identity panel, Journey panel, Computed Traits panel, Personalization banner, Next-Best-Offer, cart-abandonment toast, personas, and the cross-tab broadcast channel. Adds hooks (`data-tour-id` attributes) but does not rewrite them.
- **No new external services.** Neon + better-auth + Segment Analytics.js only.
- **This is not the Next.js you know** — per `AGENTS.md`, check `node_modules/next/dist/docs/` before using APIs that differ from training-data defaults.
- **Desktop-first** for the tour itself. Triptych layout requires ≥1280px viewport; below that, narrator falls back to text-only guidance.

## 4. Architecture

### 4.1 New directory

`src/components/tour/` is the single home for tour UI. `src/lib/tour/` holds the scripts and types. `src/stores/tour-store.ts` holds persisted state.

### 4.2 Component map

- **`tour-landing.tsx`** — the `/tour` route body. Greeting, adventure picker, resume handling.
- **`tour-provider.tsx`** — client component mounted once in the root layout, inside `<SegmentProvider>`. Owns subscriptions to the Segment event stream for auto-advance, hydrates tour state, and renders the narrator panel + spotlight overlay when a tour is active.
- **`narrator-panel.tsx`** — fixed 420px right-side panel on desktop, bottom sheet on narrow viewports. Shows current beat copy, progress rail, and a `Next` button for user-paced beats.
- **`spotlight-overlay.tsx`** — dims the page and cuts out a rounded rectangle around a target `[data-tour-id]` element, with an anchored callout bubble.
- **`tour-multi-surface.tsx`** — triptych layout (web / mobile / kiosk) used by Adventures 1 and 3. Renders real `/m` and `/kiosk` routes in iframes with the existing `BroadcastChannel` cart and event sync.
- **`tour-recap.tsx`** — end-card for each adventure; bullet summary plus outbound doc links.
- **`tour-resume-pill.tsx`** — small persistent "Resume tour" pill in the site header when `tour-store.active` is set.

### 4.3 Shared primitives (reused as-is)

- `src/stores/segment-store.ts` — event stream subscription for auto-advance beats.
- `src/stores/cart-store.ts`, `src/stores/ui-store.ts` — unchanged; tour drives them through existing persona `seed()` calls and normal user actions.
- `src/lib/segment/personas.ts` — consumed as-is; tour calls `findPersona(id)?.seed()` on beats that need an identified session.
- `src/lib/segment/audiences.ts`, `journey.ts` — unchanged. The tour only adds new computed traits and a new audience (see §8).
- `src/lib/segment/bus.ts` — unchanged. All tour events use the existing `analytics.track(...)` wrapper.
- `src/lib/segment/cart-broadcast.ts` — reused verbatim for the triptych.
- `src/components/segment/*` — every existing demo component is reused; the tour adds `data-tour-id="…"` attributes only.

### 4.4 Route additions

```
/tour                     landing + adventure picker
/tour/meet-sarah          Adventure 1 (cross-surface identity)
/tour/build-audience      Adventure 2 (live audience)
/tour/tracking-plan       Adventure 3 (event taxonomy)
/tour/cart-rescue         Adventure 4 (personalization loop)
```

Each adventure route is a thin wrapper that calls `tourStore.startAdventure(id)` on mount and renders the same shared tour frame. Deep-linking a specific adventure from a calendar invite works via these URLs.

### 4.5 Mount point

`<TourProvider>` mounts inside the root `<SegmentProvider>` in `src/app/layout.tsx`. It renders its overlays only when `tour-store.active !== null`. When inactive, it adds zero DOM cost beyond a single subscription.

## 5. Adventures

Each adventure is a typed array of beats in `src/lib/tour/adventures.ts`. Beats are the unit of progress — the narrator shows one beat at a time and advances either on user `Next` click or when a specified Segment event fires.

### 5.1 Beat type

```ts
type AdventureId =
  | "meet-sarah"
  | "build-audience"
  | "tracking-plan"
  | "cart-rescue";

type BeatAdvance = "click" | "auto" | { onEvent: string };

type Beat =
  | { kind: "narrate"; copy: string; advance: "click" }
  | { kind: "spotlight"; target: string; copy: string; advance: BeatAdvance }
  | { kind: "action"; do: (ctx: TourContext) => Promise<void>; copy: string; advance: "auto" }
  | { kind: "multi-surface"; focus: "web" | "mobile" | "kiosk"; copy: string; advance: BeatAdvance }
  | { kind: "recap"; bullets: string[]; ctas: Array<{ label: string; href: string }> };
```

`TourContext` exposes `router`, `analytics`, and `persona` helpers so action beats can seed personas, `router.push('/kiosk')`, etc., without pulling new dependencies.

### 5.2 Adventure 1 — "Meet Sarah. Everywhere."

**Theme:** cross-surface identity.
**Estimated length:** 3 min.
**Beats:**

1. `narrate` — "Meet Sarah Thompson. She's a Gold-tier customer with 12 orders. She opens the Domino's site from her couch."
2. `action` — load `sarah_vip` persona via `findPersona("sarah_vip").seed()`.
3. `spotlight` target `tour-personalization-banner` advance `"click"` — "Her home page is already personalized. This copy swapped based on her `loyalty_tier` trait."
4. `spotlight` target `tour-identity-panel` advance `"click"` — "One `userId`, live traits. Open on any screen."
5. `multi-surface` focus `mobile` advance `"click"` — "Same customer, now on the mobile app. Notice her reorder strip is already populated."
6. `multi-surface` focus `kiosk` advance `"click"` — "At the store, the kiosk attract screen. When she scans her loyalty QR, the kiosk session is already her — no sign-in."
7. `spotlight` target `tour-event-inspector` advance `"click"` — "Every event tagged with `context.app.name`. Same person, three surfaces, one profile."
8. `recap` — bullets on unified identity, identity resolution, source attribution; CTAs to Segment Identity docs and the tracking plan.

### 5.3 Adventure 2 — "Build an audience in 60 seconds."

**Theme:** live behavioral audiences.
**Estimated length:** 2 min.
**Beats:**

1. `narrate` — "We start anonymous. No account. No history. Watch the Audiences panel."
2. `action` — `analytics.reset()`, `router.push('/deals')`.
3. `spotlight` target `tour-audiences-panel` advance `{ onEvent: "Deal Viewed" }` — "Click any deal. I'll wait."
4. `spotlight` target `tour-audiences-panel` advance `"click"` — "`Deal Hunter` audience entered. That rule is live — no batch job, no overnight wait."
5. `spotlight` target `tour-audiences-panel` advance `{ onEvent: "Product Added" }` — "Add a pizza to cart. Then come back here."
6. `spotlight` target `tour-audiences-panel` advance `"click"` — "`Cart Abandoner` is now primed. If she leaves without checking out, the nudge fires."
7. `spotlight` target `tour-computed-traits-panel` advance `"click"` — "These traits recomputed after every event. `favorite_category`, `product_add_count`, `cart_value`."
8. `recap` — bullets on real-time audiences, computed traits, and tracking-plan fidelity; CTAs to Segment Audiences and Engage docs.

### 5.4 Adventure 3 — "One tracking plan, every surface."

**Theme:** event taxonomy.
**Estimated length:** 3 min.
**Beats:**

1. `narrate` — "Most companies have different events on web, mobile, and in-store. That's why their data is a mess. Watch what happens here."
2. `action` — pin the Event Inspector open, clear its filter.
3. `multi-surface` focus `web` advance `{ onEvent: "Product Added" }` — "Add a Meat Lovers to the cart on the web surface. I'll wait."
4. `spotlight` target `tour-event-inspector-latest` advance `"click"` — "There's the `Product Added` event. Note the shape — `product_id`, `category`, `price`, `quantity`, `source: web`."
5. `multi-surface` focus `mobile` advance `{ onEvent: "Product Added" }` — "Now the same action in the mobile app."
6. `spotlight` target `tour-event-inspector-latest` advance `"click"` — "Same event, same shape. Only `source` is different."
7. `multi-surface` focus `kiosk` advance `{ onEvent: "Product Added" }` — "Now in-store on the kiosk."
8. `spotlight` target `tour-event-inspector-latest` advance `"click"` — "Identical. Your warehouse team loves you."
9. `recap` — bullets on tracking plan as contract, protocol violations, and surface attribution; CTAs to Segment Protocols docs.

### 5.5 Adventure 4 — "The cart abandonment rescue."

**Theme:** personalization loop, audience-to-activation.
**Estimated length:** 3 min.
**Beats:**

1. `narrate` — "Meet Dan. Bronze tier. One item in cart. He's about to walk away."
2. `action` — load `dan_abandoner` persona via `findPersona("dan_abandoner").seed()`.
3. `spotlight` target `tour-audiences-panel` advance `"click"` — "`Cart Abandoner` audience already active from his seeded events."
4. `narrate` — "Watch. No clicks from here. Just wait." Narrator shows a 15-second dev-shortened countdown.
5. `spotlight` target `tour-audience-toast` advance `{ onEvent: "Abandonment Nudge Shown" }` — "The on-site toast fires automatically. Same audience, same copy rule."
6. `action` — open a modal simulating Dan's email inbox with the same copy.
7. `narrate` — "Same rule, different channel. You set this once in Segment Engage."
8. `action` — advance Dan's journey to `Customer` via a mock `Order Completed` event (uses the existing helper).
9. `spotlight` target `tour-journey-panel` advance `"click"` — "Journey advanced. The audience and the recovery email and the journey are all driven by one source of truth."
10. `recap` — bullets on omni-channel personalization, journey orchestration, and single source of truth; CTAs to Engage, Journeys, and Linked Profiles docs.

## 6. State & data flow

### 6.1 Tour store

`src/stores/tour-store.ts` — new Zustand slice with `persist` middleware, same pattern as the existing stores.

```ts
type TourState = {
  active: AdventureId | null;
  beatIndex: number;
  guestName: string;
  completed: AdventureId[];
  dismissed: boolean;
  panelCollapsed: boolean;
};

type TourActions = {
  startAdventure: (id: AdventureId, guestName?: string) => void;
  advance: () => void;
  goToBeat: (index: number) => void;
  exit: (opts?: { markComplete?: boolean }) => void;
  toggleCollapse: () => void;
  reset: () => void;
};
```

Persisted under the key `dominos-tour-state`.

### 6.2 Auto-advance

`<TourProvider>` subscribes to `useSegmentStore.getState().events` via Zustand's `subscribeWithSelector`. On every new event it reads the current beat, checks for `advance === { onEvent: "..." }`, and calls `advance()` on match. Debounced by 120ms so a single user action can't overshoot two beats.

### 6.3 Off-script tolerance

If the user navigates away mid-adventure (clicks a nav link, closes the narrator), the narrator does not block — it minimizes to a pill and keeps the beat index stable. When the expected event finally fires, the panel re-expands with a "Welcome back, here's where we were" beat stub.

### 6.4 Multi-surface sync

The existing `BroadcastChannel("dominos-cart-sync")` already mirrors cart state across tabs; the iframes inside `<TourMultiSurface>` participate automatically. Adding the same channel for tour state is out of scope — the triptych is driven from the top frame, and iframes only receive cart/event mirroring.

### 6.5 Guest name

`/tour?guest=Kelly` stores `guestName` on landing. The narrator interpolates `{{guestName || "there"}}` in the opening beat of each adventure. Used only for greeting copy — never sent to Segment.

### 6.6 Reset integration

The existing "Reset demo" action in `<DemoToolbar>` additionally calls `useTourStore.getState().reset()` so clearing the demo also exits any active tour.

## 7. Visual & interaction specs

### 7.1 Landing page (`/tour`)

- Full-bleed hero background, Domino's Cravemark + Segment co-mark at top.
- Greeting headline: "Welcome{{, guestName}}. Let's show you your data in motion."
- 2×2 grid of adventure cards, each 320×200, using the existing shadcn `Card` primitives. Card body: adventure icon, title, one-line promise, estimated length, difficulty dot (foundational / advanced).
- Completed adventures show a small red checkmark in the corner.
- Secondary CTA below the grid: "Skip the tour, just explore →" routes to `/` with the tour dormant.
- Resume banner appears above the grid if `tour-store.active` is set.

### 7.2 Narrator panel

- Fixed right, 420px wide, full height minus 24px top/bottom margin, on viewports ≥1024px.
- Bottom sheet (full width, 40vh) on viewports <1024px.
- Domino's red progress bar at top showing beat N / M.
- Beat copy in Segment charcoal body style, max 2 short paragraphs.
- `Next` button appears when `advance === "click"`. Auto-advance beats show a subtle "waiting…" indicator.
- Keyboard: `→` advances, `Esc` minimizes, `?` reopens landing.
- `framer-motion` slide-in from the right on mount, slide-out on exit.

### 7.3 Spotlight overlay

- Backdrop: `bg-black/55 backdrop-blur-sm`.
- Cutout: computed from the target's `getBoundingClientRect()`, padded 12px, 16px corner radius. `ResizeObserver` + scroll listener keep it tracked.
- Callout bubble: 320px wide, anchored to the cutout, arrow pointing at the target. Auto-flips sides if it would overflow the viewport.
- If the target is off-screen, the page scrolls it into view with `behavior: "smooth"` before the spotlight draws.
- Clicks *inside* the cutout pass through to the target; clicks on the backdrop are ignored (prevents accidental dismissal during a waiting beat).

### 7.4 Multi-surface triptych

- Available on viewports ≥1280px.
- Layout: dominant surface 50% width, other two 25% each, stacked on the right.
- Smaller surfaces render the real `/m` or `/kiosk` routes inside sandboxed iframes (`sandbox="allow-same-origin allow-scripts allow-forms"`).
- A small chip in the top-right of each pane shows the surface label.
- Clicking a smaller pane promotes it to dominant with a `layout` animation.
- Below 1280px, the triptych is replaced by a single pane plus a narrator beat instructing the user to open the other surfaces in adjacent tabs.

### 7.5 Landing & resume affordance

- When `tour-store.active` is set and the user is anywhere on the site, `<TourResumePill>` renders in the site header (web, mobile shells) or kiosk top chrome. One click returns to `/tour/<adventureSlug>` at `beatIndex`.

## 8. Analytics additions

All new events use the existing `analytics.track(...)` bus so `source` and `context.app.name` auto-populate.

New helpers in `src/lib/analytics/events.ts`:

- `trackTourStarted({ adventure_id, guest_name })`
- `trackTourBeatAdvanced({ adventure_id, beat_index, beat_kind })`
- `trackTourCompleted({ adventure_id, elapsed_ms })`
- `trackTourExited({ adventure_id, beat_index, reason })`

New computed trait (added to `src/lib/segment/audiences.ts` `computeTraits`):

- `tours_completed_count: number` — count of distinct `Tour Completed` events in the log.

New audience (added to `AUDIENCES`):

- `id: "tour_graduates"`, `name: "Tour Graduates"`, `description: "Completed at least one self-demo tour"`, matches on `computedTraits.tours_completed_count >= 1`.

No existing events are renamed or removed.

## 9. Verification plan

No automated test runner exists. Verification is:

1. `npx tsc --noEmit` — passes.
2. `npm run lint` — passes.
3. `npm run build` — passes.
4. Manual demo-narrative run:
   1. `npm run dev`.
   2. Open `/tour?guest=CTO`. Confirm greeting shows "Welcome CTO."
   3. Run Adventure 1 end-to-end. Confirm the multi-surface triptych renders, Sarah's traits show in all three surfaces, Event Inspector shows `context.app.name` differentiation.
   4. Run Adventure 2. Confirm audience badges light up as the expected events fire; confirm computed traits panel updates in real time.
   5. Run Adventure 3. Confirm three identical `Product Added` events land in the inspector, differing only in `source`.
   6. Run Adventure 4. Confirm the 15-second dev-shortened abandonment toast fires automatically, the fake inbox modal opens, the Journey panel advances.
   7. Mid-adventure, click a nav link that takes the user off-script. Confirm narrator minimizes to pill, resumes cleanly when the expected event fires.
   8. Reload the page mid-adventure. Confirm the resume pill appears and one click returns to the correct beat.
   9. Click "Reset demo" in the DemoToolbar. Confirm tour state clears.
   10. On a <1280px viewport, confirm the triptych falls back to single-pane with narrator guidance.
5. Deploy preview on Vercel — repeat steps 4.2–4.10 on the deployed URL.

## 10. Risks & tradeoffs

- **Iframe triptych cost.** Rendering `/m` and `/kiosk` in iframes alongside the main surface triples the initial JS cost for Adventures 1 and 3. Acceptable for a demo run on a modern laptop; we gate behind 1280px and lazy-load the iframes only on multi-surface beats.
- **Off-script divergence.** If the CTO clicks deep into a flow we didn't expect, the narrator waits indefinitely for the gating event. Mitigation: every auto-advance beat has a visible "Skip this step" in the narrator menu.
- **Spotlight position drift.** Complex scroll containers (kiosk uses overflow scrolling) can misalign the cutout. Mitigation: cutout re-computes on `scroll` and `resize` events, and spotlight silently hides when the target leaves the viewport.
- **Demo-shortened timings.** Adventure 4's 15-second abandonment delay conflicts with the production 45-second nudge. Mitigation: the tour sets a `tour-store.dev-timing: true` flag that the toast component reads to shorten its delay while a tour is active; default behavior outside tours is unchanged.
- **State bloat.** `tour-store` adds a fourth persisted store. Acceptable; each store stays focused and small.

## 11. Open questions

None — all outstanding decisions were taken as recommended and approved.

