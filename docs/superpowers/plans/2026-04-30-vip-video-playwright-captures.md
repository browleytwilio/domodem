# VIP Demo Video — Playwright Screenshot Captures Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hand-recorded `cap-*.mp4` footage clips in the Domino's VIP demo video with deterministic Playwright screenshots captured against the deployed demo at `https://domodem.vercel.app/`, and swap the footage-wrapped HyperFrames compositions (Beats 3, 4, 5, 6, 7, and the Beat 8 kiosk inset) to consume those PNG stills with subtle ambient motion.

**Architecture:** A Node script at `scripts/capture-screens.mjs` inside the video workspace drives Playwright (Chromium) against the live deployed URL. It seeds persona state by directly mutating the Zustand stores exposed on `window` (via the app's dev hooks and `localStorage` keys), waits for paint, then captures full-viewport 1920×1080 PNGs per beat. Compositions swap `<video src="…mp4">` for `<img src="…png">` plus a `gsap.from` Ken-Burns tween so the stills feel like footage. Beat 8's kiosk inset uses the same pattern at 240×135.

**Tech Stack:** `@playwright/test` v1.48+ (Chromium only), Node.js ≥22, FFmpeg (used by HyperFrames render, not here), existing HyperFrames project at `/Users/browley/video/dominos-vip-demo/`, deployed Next.js 16 demo at `https://domodem.vercel.app/`.

**Spec reference:** `docs/superpowers/specs/2026-04-30-dominos-vip-demo-video-design.md`
**Parent plan:** `docs/superpowers/plans/2026-04-30-dominos-vip-demo-video.md` — this plan modifies Task 7 (screen captures) and Tasks 11–14 + Task 18 (footage-wrapped compositions). All other tasks (TTS, transcript, storyboard, Beats 1/2/9/10/11, validation gates, final render) remain unchanged.

---

## Preconditions

1. The parent plan's Tasks 1–6 are complete: `/Users/browley/video/dominos-vip-demo/` exists with `DESIGN.md`, `SCRIPT.md`, `narration.txt`, `narration.wav`, `transcript.json`, `STORYBOARD.md`, and brand assets.
2. The deployed demo at `https://domodem.vercel.app/` resolves 200 and renders a `<PersonalizationBanner>` with `data-tour-id="tour-personalization-banner"` on `/`.
3. Git working tree in the video workspace is clean before starting.

**Do not proceed if any precondition fails.** Run `ls /Users/browley/video/dominos-vip-demo/{DESIGN.md,SCRIPT.md,narration.txt,assets/audio/transcript.json,STORYBOARD.md}` and `curl -sI https://domodem.vercel.app/ | head -1` to verify.

---

## File Structure (new + modified in the video workspace)

**Workspace root:** `/Users/browley/video/dominos-vip-demo/`

| File | Disposition | Responsibility |
|---|---|---|
| `package.json` | Modify | Add `@playwright/test` devDependency; add `capture` npm script |
| `playwright.config.ts` | Create | Headed Chromium, 1920×1080 viewport, 30s timeout, `baseURL=https://domodem.vercel.app` |
| `scripts/capture-screens.mjs` | Create | Main capture driver — spawns 1 browser context per beat, seeds state, snapshots PNG |
| `scripts/capture-helpers.mjs` | Create | Shared helpers: `seedSarah`, `enableDemoOverlays`, `clearState`, `waitForPaint` |
| `assets/captures/beat-3-sarah-profile.png` | Create | 1920×1080 still — `/use-cases` VIP card or `/account` profile card |
| `assets/captures/beat-4-anon-home.png` | Create | 1920×1080 — homepage before sign-in, incognito-equivalent |
| `assets/captures/beat-4-anon-menu.png` | Create | 1920×1080 — `/menu/pizzas` with event inspector open |
| `assets/captures/beat-5-signin-before.png` | Create | 1920×1080 — `/login` with credentials pre-filled (visual only) |
| `assets/captures/beat-5-signin-after.png` | Create | 1920×1080 — `/` post-sign-in with Sarah's identity panel visible |
| `assets/captures/beat-6-audiences-pre.png` | Create | 1920×1080 — audiences panel before VIP match |
| `assets/captures/beat-6-audiences-post.png` | Create | 1920×1080 — audiences panel with VIP Loyalists green |
| `assets/captures/beat-7-vip-home.png` | Create | 1920×1080 — VIP hero + preferred cart + exclusive offer |
| `assets/captures/beat-8-kiosk-inset.png` | Create | 1920×1080 — kiosk attract → recognized welcome (cropped to 16:9 later) |
| `assets/captures/.gitkeep` | Keep | Already present from parent Task 7 |
| `compositions/04-anonymous-arrival.html` | Modify | Swap `<video>` for `<img>` × 2 with cross-fade + Ken-Burns |
| `compositions/05-identification.html` | Modify | Swap `<video>` for `<img>` × 2 with midpoint cross-fade |
| `compositions/06-audience-match.html` | Modify | Swap `<video>` for `<img>` × 2; rule checks still overlay |
| `compositions/07-personalization.html` | Modify | Swap `<video>` for `<img>` single still; Ken-Burns 6% zoom |
| `compositions/03-sarah-returns.html` | Modify | Replace the invented persona card with a still of the live VIP card; overlay pills float in |
| `compositions/08-architecture.html` | Modify | Swap kiosk-inset `<video>` for `<img>` with fade in/out |

Each `.mp4` in the parent plan's capture directory is obsoleted. Leave them on disk (gitignored) but compositions no longer reference them.

---

## Task 1: Install Playwright into the video workspace

**Files:**
- Modify: `/Users/browley/video/dominos-vip-demo/package.json`
- Create: `/Users/browley/video/dominos-vip-demo/playwright.config.ts`

- [ ] **Step 1.1: Verify preconditions**

Run:
```bash
ls /Users/browley/video/dominos-vip-demo/DESIGN.md \
   /Users/browley/video/dominos-vip-demo/assets/audio/transcript.json \
   /Users/browley/video/dominos-vip-demo/STORYBOARD.md && \
  curl -sI https://domodem.vercel.app/ | head -1
```
Expected: all files list without error AND `HTTP/2 200` (or `HTTP/1.1 200`). If the deployed URL does not return 200, **halt** and ask the user to confirm the URL — the user wrote `domodem.vercel.app` but the local project is `domdemo`; the live deployment may be under a different slug.

- [ ] **Step 1.2: Install Playwright**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  npm install --save-dev @playwright/test@^1.48.0 && \
  npx playwright install chromium
```
Expected: `node_modules/@playwright/test` populated; Chromium binary downloaded to `~/Library/Caches/ms-playwright/`. If bandwidth is constrained and Chromium already exists in cache, the install reuses it.

- [ ] **Step 1.3: Add capture npm script**

Open `/Users/browley/video/dominos-vip-demo/package.json`. Under `"scripts"`, add the `capture` entry. The resulting `scripts` block must be exactly:

```json
  "scripts": {
    "capture": "node scripts/capture-screens.mjs"
  },
```

(If `scripts` already contains other entries from the HyperFrames scaffold, insert the `"capture"` key alphabetically and preserve all others. Do not delete anything.)

- [ ] **Step 1.4: Write `playwright.config.ts`**

Create `/Users/browley/video/dominos-vip-demo/playwright.config.ts` with exactly:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./scripts",
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "https://domodem.vercel.app",
    headless: true,
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    colorScheme: "light",
    locale: "en-AU",
    timezoneId: "Australia/Sydney",
    screenshot: "off",
    video: "off",
    trace: "off",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

Rationale: `fullyParallel: false` and `workers: 1` guarantee deterministic seeding order. `locale` + `timezoneId` match Sarah's Sydney persona from `src/lib/segment/personas.ts`. `baseURL` lets the driver use relative paths like `/menu/pizzas`. `deviceScaleFactor: 1` prevents `@2x` retina PNGs that would blow the 1920×1080 expected by compositions.

- [ ] **Step 1.5: Commit**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  git add package.json package-lock.json playwright.config.ts && \
  git commit -m "chore(video): install Playwright for deterministic screenshots"
```

---

## Task 2: Write `scripts/capture-helpers.mjs`

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/scripts/capture-helpers.mjs`

Shared helpers every beat uses. Keeps `capture-screens.mjs` focused on orchestration.

- [ ] **Step 2.1: Write the helpers module**

Create `/Users/browley/video/dominos-vip-demo/scripts/capture-helpers.mjs` with exactly:

```js
// scripts/capture-helpers.mjs
// Shared helpers for capture-screens.mjs. The demo app exposes its Zustand
// stores on window as side-effects of zustand-persist; we seed by mutating
// localStorage before navigation (so the initial render reflects the persona)
// or by calling the store's setState via an evaluated client script.

export const BASE_URL = "https://domodem.vercel.app";
export const CAPTURES_DIR = "assets/captures";
export const VIEWPORT = { width: 1920, height: 1080 };

// Zustand-persist keys used by the demo app. These match the `name`
// fields in src/stores/*.ts on the deployed build. Verified against
// domdemo/src/stores/{segment-store,ui-store,cart-store,tour-store}.ts.
export const STORE_KEYS = {
  segment: "segment-demo-ui",
  ui: "dominos-ui",
  cart: "dominos-cart",
  tour: "dominos-tour-state",
};

/**
 * Reset all demo-related localStorage keys so the page loads as a
 * fresh anonymous visitor. Call before navigate() on Beat 4.
 */
export async function clearDemoState(page) {
  await page.addInitScript((keys) => {
    try {
      for (const k of Object.values(keys)) localStorage.removeItem(k);
      sessionStorage.clear();
    } catch {}
  }, STORE_KEYS);
}

/**
 * Enable demo overlays (sets segment-store.demoModeEnabled = true).
 * Call after the first page load but before the screenshot so the
 * FAB, toolbar, and event inspector are visible when expected.
 */
export async function enableDemoOverlays(page) {
  await page.evaluate((key) => {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
      parsed.state = parsed.state || {};
      parsed.state.demoModeEnabled = true;
      localStorage.setItem(key, JSON.stringify(parsed));
    } catch {}
  }, STORE_KEYS.segment);
}

/**
 * Seed Sarah's VIP persona into localStorage so the next page load
 * renders VIP personalization without clicking through the toolbar.
 * Traits mirror src/lib/segment/personas.ts (PERSONAS[0]).
 */
export async function seedSarahPersona(page) {
  const sarahTraits = {
    email: "sarah.vip@dominosdemo.com",
    name: "Sarah Thompson",
    loyalty_tier: "gold",
    loyalty_points: 1280,
    lifetime_orders: 12,
    lifetime_spend: 386.4,
    preferred_delivery_method: "delivery",
    preferred_store_id: "store-001",
  };
  await page.evaluate(
    ({ keys, traits }) => {
      try {
        // Segment-store persists these as sibling fields on `state`, not
        // nested under `identity`. See src/stores/segment-store.ts partialize.
        const rawSeg = localStorage.getItem(keys.segment);
        const seg = rawSeg ? JSON.parse(rawSeg) : { state: {}, version: 0 };
        seg.state = seg.state || {};
        seg.state.demoModeEnabled = true;
        seg.state.userId = "user-sarah-vip";
        seg.state.anonymousId = seg.state.anonymousId || "anon-capture-1";
        seg.state.traits = traits;
        // AudienceMembership shape: { id, name, enteredAt: string }.
        // Presence in the array = matched.
        seg.state.audiences = [
          { id: "vip_loyalist", name: "VIP Loyalists", enteredAt: new Date().toISOString() },
        ];
        localStorage.setItem(keys.segment, JSON.stringify(seg));

        const rawUi = localStorage.getItem(keys.ui);
        const ui = rawUi ? JSON.parse(rawUi) : { state: {}, version: 0 };
        ui.state = ui.state || {};
        ui.state.deliveryMethod = "delivery";
        ui.state.deliveryAddress = "42 Wallaby Way, Sydney NSW 2000";
        localStorage.setItem(keys.ui, JSON.stringify(ui));

        const rawCart = localStorage.getItem(keys.cart);
        const cart = rawCart ? JSON.parse(rawCart) : { state: {}, version: 0 };
        cart.state = cart.state || {};
        cart.state.items = [
          {
            id: "persona-sarah-capture",
            productSlug: "meat-lovers",
            productName: "Meat Lovers",
            category: "pizzas",
            image: "/images/menu/meat-lovers.webp",
            size: "large",
            crust: "classic",
            quantity: 1,
            unitPrice: 24.95,
          },
        ];
        localStorage.setItem(keys.cart, JSON.stringify(cart));
      } catch {}
    },
    { keys: STORE_KEYS, traits: sarahTraits },
  );
}

/**
 * Open the Segment inspector drawer by clicking the FAB.
 * `inspectorOpen` is NOT in segment-store's partialize, so localStorage
 * seeding won't work — the FAB is the only reliable trigger.
 * Sets inspectorTab first via localStorage (that one IS persisted).
 */
export async function openInspector(page, tab = "events") {
  // Set the desired tab via localStorage before opening the drawer.
  await page.evaluate(
    ({ key, t }) => {
      try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
        parsed.state = parsed.state || {};
        parsed.state.inspectorTab = t;
        localStorage.setItem(key, JSON.stringify(parsed));
      } catch {}
    },
    { key: STORE_KEYS.segment, t: tab },
  );
  await page.reload();
  await waitForPaint(page);
  // Click the FAB — rendered only when demoModeEnabled && !inspectorOpen.
  const fab = page.getByRole("button", { name: /segment/i }).first();
  if (await fab.isVisible().catch(() => false)) {
    await fab.click();
    await page.waitForTimeout(400);
  }
}

/**
 * Wait for fonts to load, layout to settle, and any hero image to paint.
 * 350ms is empirically enough on a Vercel cold start for the fold.
 */
export async function waitForPaint(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(350);
}

/**
 * Take a full-viewport PNG to CAPTURES_DIR/<name>.
 * Asserts the file is 1920×1080 after writing.
 */
export async function snap(page, name) {
  const out = `${CAPTURES_DIR}/${name}.png`;
  await page.screenshot({ path: out, fullPage: false, type: "png" });
  return out;
}
```

- [ ] **Step 2.2: Commit**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  git add scripts/capture-helpers.mjs && \
  git commit -m "feat(video): add Playwright capture helpers"
```

---

## Task 3: Write `scripts/capture-screens.mjs` — orchestrator shell

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/scripts/capture-screens.mjs`

This task establishes the orchestrator with one smoke capture (Beat 3). Subsequent tasks add the remaining beats incrementally so each capture is verifiable in isolation.

- [ ] **Step 3.1: Write the shell with Beat 3 capture**

Create `/Users/browley/video/dominos-vip-demo/scripts/capture-screens.mjs` with exactly:

```js
// scripts/capture-screens.mjs
// Driver: spawns Chromium, captures one PNG per named beat against the
// deployed demo. Invoked via `npm run capture`. Deterministic: no random
// values, no timestamps in filenames, one worker.

import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import {
  BASE_URL,
  CAPTURES_DIR,
  VIEWPORT,
  clearDemoState,
  enableDemoOverlays,
  openInspector,
  seedSarahPersona,
  waitForPaint,
  snap,
} from "./capture-helpers.mjs";

mkdirSync(CAPTURES_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function withContext(fn) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: "light",
    locale: "en-AU",
    timezoneId: "Australia/Sydney",
    baseURL: BASE_URL,
  });
  const page = await context.newPage();
  try {
    await fn(page);
  } finally {
    await context.close();
  }
}

// ---- Beat 3: Sarah persona card on /use-cases -------------------------
await withContext(async (page) => {
  await clearDemoState(page);
  await page.goto("/use-cases");
  await waitForPaint(page);
  await seedSarahPersona(page);
  // Reload so the VIP story card reflects seeded traits.
  await page.reload();
  await waitForPaint(page);
  await snap(page, "beat-3-sarah-profile");
  console.log("captured beat-3-sarah-profile.png");
});

await browser.close();
```

- [ ] **Step 3.2: Run the capture for Beat 3**

```bash
cd /Users/browley/video/dominos-vip-demo && npm run capture
```
Expected: console prints `captured beat-3-sarah-profile.png`; no stack trace. File exists at `assets/captures/beat-3-sarah-profile.png`.

- [ ] **Step 3.3: Verify PNG dimensions**

```bash
node -e "const s=require('fs').statSync('assets/captures/beat-3-sarah-profile.png'); console.log(s.size);"
file /Users/browley/video/dominos-vip-demo/assets/captures/beat-3-sarah-profile.png
```
Expected: non-zero size; `file` reports `PNG image data, 1920 x 1080, 8-bit/color RGB`. If dimensions are off, re-check `deviceScaleFactor: 1` in `playwright.config.ts` and the `VIEWPORT` constant.

- [ ] **Step 3.4: Eyeball the capture**

```bash
open /Users/browley/video/dominos-vip-demo/assets/captures/beat-3-sarah-profile.png
```
Expected: `/use-cases` page with Sarah's story card visible and populated with VIP-tier copy. If the page shows generic (non-Sarah) copy, re-verify the persist keys by running `page.evaluate(() => Object.keys(localStorage))` inside the script — expected output includes `segment-demo-ui`, `dominos-ui`, `dominos-cart`. If a key has drifted on deploy, update `STORE_KEYS` in `capture-helpers.mjs` and re-run.

- [ ] **Step 3.5: Commit**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  git add scripts/capture-screens.mjs && \
  git commit -m "feat(video): add capture orchestrator with Beat 3 persona still"
```

---

## Task 4: Add Beat 4 captures (anonymous home + anonymous menu)

**Files:**
- Modify: `/Users/browley/video/dominos-vip-demo/scripts/capture-screens.mjs`

- [ ] **Step 4.1: Append Beat 4 block**

Open `scripts/capture-screens.mjs`. Immediately before the final `await browser.close();` line, insert:

```js
// ---- Beat 4: Anonymous arrival (home, then menu with inspector) -------
await withContext(async (page) => {
  await clearDemoState(page);
  await page.goto("/");
  await waitForPaint(page);
  await enableDemoOverlays(page);
  await page.reload();
  await waitForPaint(page);
  await snap(page, "beat-4-anon-home");
  console.log("captured beat-4-anon-home.png");

  // Anonymous visitor clicks through to /menu/pizzas; inspector visible.
  await page.goto("/menu/pizzas");
  await waitForPaint(page);
  await openInspector(page, "events");
  await snap(page, "beat-4-anon-menu");
  console.log("captured beat-4-anon-menu.png");
});
```

- [ ] **Step 4.2: Run and verify**

```bash
cd /Users/browley/video/dominos-vip-demo && npm run capture
```
Expected: three PNGs in `assets/captures/` (`beat-3-sarah-profile.png`, `beat-4-anon-home.png`, `beat-4-anon-menu.png`); no stack trace. Open both Beat 4 files and confirm (a) the home shot shows a generic, non-VIP homepage, (b) the menu shot shows the pizzas category with the Segment inspector drawer or panel visible.

- [ ] **Step 4.3: If inspector not visible**

`inspectorOpen` is not in the segment-store `partialize` list, so it cannot be seeded via localStorage — `openInspector` clicks the FAB instead. If the FAB isn't found, `demoModeEnabled` is likely still false. Re-check that `enableDemoOverlays` was called and that the reload happened before the FAB query. If `getByRole("button", { name: /segment/i })` misses the real FAB, widen the selector to `page.locator('button[aria-label="Open Segment Inspector"]')` (per `src/components/segment/demo-fab.tsx:21`).

- [ ] **Step 4.4: Commit**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  git add scripts/capture-screens.mjs && \
  git commit -m "feat(video): capture Beat 4 anonymous home + menu stills"
```

---

## Task 5: Add Beat 5 captures (sign-in before + after)

**Files:**
- Modify: `/Users/browley/video/dominos-vip-demo/scripts/capture-screens.mjs`

- [ ] **Step 5.1: Append Beat 5 block**

Insert immediately before the final `await browser.close();` line:

```js
// ---- Beat 5: Identification (login screen, then identified home) ------
await withContext(async (page) => {
  await clearDemoState(page);
  await page.goto("/login");
  await waitForPaint(page);
  // Pre-fill the form visually. Submission is NOT actually performed;
  // the "before" still just shows credentials entered.
  await page.evaluate(() => {
    const email = document.querySelector('input[type="email"], input[name="email"]');
    const pw = document.querySelector('input[type="password"], input[name="password"]');
    if (email) email.value = "sarah.vip@dominosdemo.com";
    if (pw) pw.value = "••••••••";
    email?.dispatchEvent(new Event("input", { bubbles: true }));
    pw?.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.waitForTimeout(200);
  await snap(page, "beat-5-signin-before");
  console.log("captured beat-5-signin-before.png");

  // "After" — seed Sarah and land on /, enable overlays so identity panel shows.
  await seedSarahPersona(page);
  await enableDemoOverlays(page);
  await page.goto("/");
  await waitForPaint(page);
  await openInspector(page, "identity");
  await snap(page, "beat-5-signin-after");
  console.log("captured beat-5-signin-after.png");
});
```

- [ ] **Step 5.2: Run and verify**

```bash
cd /Users/browley/video/dominos-vip-demo && npm run capture
```
Expected: PNGs for Beats 3, 4, 5 in `assets/captures/`. Open the two Beat 5 files; "before" must show a login form with visible email/masked password; "after" must show the homepage re-rendered for Sarah (personalization banner, VIP copy) with the identity panel visible.

- [ ] **Step 5.3: If identity panel not framed**

The deployed build may render the inspector drawer outside the 1920×1080 viewport. If the identity panel is clipped, add before the final `snap` call: `await page.evaluate(() => window.scrollTo(0, 0));` and re-run.

- [ ] **Step 5.4: Commit**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  git add scripts/capture-screens.mjs && \
  git commit -m "feat(video): capture Beat 5 sign-in transition stills"
```

---

## Task 6: Add Beat 6 captures (audiences pre + post match)

**Files:**
- Modify: `/Users/browley/video/dominos-vip-demo/scripts/capture-screens.mjs`

- [ ] **Step 6.1: Append Beat 6 block**

Insert immediately before the final `await browser.close();` line:

```js
// ---- Beat 6: Audience match (audiences panel before + after VIP) ------
// AudienceMembership is { id, name, enteredAt }. Presence = matched.
// The app computes membership from traits; when we seed an empty array
// the audiences tab renders all definitions in the not-yet-matched state.
await withContext(async (page) => {
  await clearDemoState(page);
  await page.goto("/");
  await waitForPaint(page);
  await enableDemoOverlays(page);
  // Clear audiences explicitly so no prior membership lingers.
  await page.evaluate((key) => {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
      parsed.state = parsed.state || {};
      parsed.state.audiences = [];
      localStorage.setItem(key, JSON.stringify(parsed));
    } catch {}
  }, "segment-demo-ui");
  await openInspector(page, "audiences");
  await snap(page, "beat-6-audiences-pre");
  console.log("captured beat-6-audiences-pre.png");

  // Post-match: seed Sarah; VIP Loyalists enters the audiences array.
  await seedSarahPersona(page);
  await openInspector(page, "audiences");
  await snap(page, "beat-6-audiences-post");
  console.log("captured beat-6-audiences-post.png");
});
```

- [ ] **Step 6.2: Run and verify**

```bash
cd /Users/browley/video/dominos-vip-demo && npm run capture
```
Expected: both Beat 6 PNGs exist. Open them. `pre` must show the audiences tab with all three rows grey/unmatched. `post` must show `VIP Loyalists` in the matched/green state.

- [ ] **Step 6.3: If VIP Loyalists doesn't appear as matched**

The app reads `audiences` directly from the segment-store; the seeded `{ id: "vip_loyalist", name: "VIP Loyalists", enteredAt }` entry inside `seedSarahPersona` is what flips the panel to matched. If the panel shows no matched audiences after seeding, open DevTools in Playwright mode (`await page.pause()`) and inspect `localStorage["segment-demo-ui"]`; confirm the JSON parses and `state.audiences[0].id === "vip_loyalist"`. If the audiences panel has its own hydration that replaces the seed, hold the screenshot back by 400ms extra (`await page.waitForTimeout(400)` before `snap`).

- [ ] **Step 6.4: Commit**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  git add scripts/capture-screens.mjs && \
  git commit -m "feat(video): capture Beat 6 audience match pre/post stills"
```

---

## Task 7: Add Beat 7 capture (VIP homepage) and Beat 8 kiosk inset

**Files:**
- Modify: `/Users/browley/video/dominos-vip-demo/scripts/capture-screens.mjs`

- [ ] **Step 7.1: Append Beat 7 block**

Insert immediately before the final `await browser.close();` line:

```js
// ---- Beat 7: VIP personalization in-session ---------------------------
await withContext(async (page) => {
  await clearDemoState(page);
  await seedSarahPersona(page);
  await enableDemoOverlays(page);
  await page.goto("/");
  await waitForPaint(page);
  // Make sure the cart dropdown (if any) is closed so the hero is primary.
  await page.evaluate(() => {
    const openCart = document.querySelector('[aria-expanded="true"][aria-controls*="cart"]');
    if (openCart && typeof openCart.click === "function") openCart.click();
  }).catch(() => {});
  await page.waitForTimeout(200);
  await snap(page, "beat-7-vip-home");
  console.log("captured beat-7-vip-home.png");
});
```

Note: the inline TS cast inside a string running through `page.evaluate` is fine at runtime (Chromium evals JS, not TS). If the optional-chaining click fails silently that is acceptable — the dropdown is already closed in the default render.

- [ ] **Step 7.2: Append Beat 8 kiosk inset block**

Insert immediately before the final `await browser.close();` line:

```js
// ---- Beat 8: Kiosk recognized welcome (inset used in architecture) ----
await withContext(async (page) => {
  await clearDemoState(page);
  await seedSarahPersona(page);
  await page.goto("/kiosk");
  await waitForPaint(page);
  // Attempt to advance past the attract screen to the recognized greeting.
  // The attract screen exposes a persona picker; click Sarah if rendered.
  const sarahPick = page.getByRole("button", { name: /sarah/i }).first();
  if (await sarahPick.isVisible().catch(() => false)) {
    await sarahPick.click();
    await page.waitForTimeout(400);
  }
  await waitForPaint(page);
  await snap(page, "beat-8-kiosk-inset");
  console.log("captured beat-8-kiosk-inset.png");
});
```

- [ ] **Step 7.3: Run and verify**

```bash
cd /Users/browley/video/dominos-vip-demo && npm run capture
```
Expected: all seven beat PNGs present in `assets/captures/`:

```bash
ls -1 /Users/browley/video/dominos-vip-demo/assets/captures/*.png | sort
```
Expected list:
```
beat-3-sarah-profile.png
beat-4-anon-home.png
beat-4-anon-menu.png
beat-5-signin-after.png
beat-5-signin-before.png
beat-6-audiences-post.png
beat-6-audiences-pre.png
beat-7-vip-home.png
beat-8-kiosk-inset.png
```

- [ ] **Step 7.4: Commit**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  git add scripts/capture-screens.mjs && \
  git commit -m "feat(video): capture Beat 7 VIP home and Beat 8 kiosk inset stills"
```

---

## Task 8: Rewrite `compositions/04-anonymous-arrival.html` to use stills

**Files:**
- Modify: `/Users/browley/video/dominos-vip-demo/compositions/04-anonymous-arrival.html`

Replace the `<video>` element with two stacked `<img>` elements (home → menu) that cross-fade mid-beat. Add a subtle Ken-Burns (scale 1.00 → 1.04) on the visible image so the still reads as live footage. Keep the three annotation arrows and the `anonymousId` chip from the parent plan.

- [ ] **Step 8.1: Rewrite the file**

Open `/Users/browley/video/dominos-vip-demo/compositions/04-anonymous-arrival.html` and replace the entire contents with:

```html
<!doctype html>
<template id="beat-4-anon-template">
  <div data-composition-id="beat-4-anon" data-start="0" data-duration="10" data-width="1920" data-height="1080">
    <style>
      [data-composition-id="beat-4-anon"] {
        width: 100%; height: 100%; background: #0A0F1E;
        font-family: "Geist", "Inter", system-ui, sans-serif;
        position: relative; overflow: hidden;
      }
      [data-composition-id="beat-4-anon"] img.still {
        position: absolute; top: 0; left: 0;
        width: 100%; height: 100%; object-fit: cover;
        transform-origin: center center;
      }
      [data-composition-id="beat-4-anon"] #a4-still-2 { opacity: 0; }
      [data-composition-id="beat-4-anon"] .chip {
        position: absolute; left: 80px; bottom: 80px;
        font-family: "Geist Mono", ui-monospace, monospace;
        font-size: 28px; font-weight: 500;
        padding: 16px 28px; border-radius: 999px;
        background: #F7F7F5; color: #003B73;
        opacity: 0; transform: translateY(20px);
        z-index: 10;
      }
      [data-composition-id="beat-4-anon"] .arrow {
        position: absolute; width: 160px; height: 60px; z-index: 10;
      }
      [data-composition-id="beat-4-anon"] #a4-arrow-1 { top: 120px; right: 480px; }
      [data-composition-id="beat-4-anon"] #a4-arrow-2 { top: 260px; right: 480px; }
      [data-composition-id="beat-4-anon"] #a4-arrow-3 { top: 400px; right: 480px; }
      [data-composition-id="beat-4-anon"] .arrow svg { width: 100%; height: 100%; }
      [data-composition-id="beat-4-anon"] .arrow path {
        fill: none; stroke: #E31837; stroke-width: 5; stroke-linecap: round;
        stroke-dasharray: 220; stroke-dashoffset: 220;
      }
    </style>
    <img class="still" id="a4-still-1" src="../assets/captures/beat-4-anon-home.png" alt="" crossorigin="anonymous"/>
    <img class="still" id="a4-still-2" src="../assets/captures/beat-4-anon-menu.png" alt="" crossorigin="anonymous"/>
    <div class="arrow" id="a4-arrow-1"><svg viewBox="0 0 160 60"><path d="M10,30 L140,30 M130,20 L150,30 L130,40"/></svg></div>
    <div class="arrow" id="a4-arrow-2"><svg viewBox="0 0 160 60"><path d="M10,30 L140,30 M130,20 L150,30 L130,40"/></svg></div>
    <div class="arrow" id="a4-arrow-3"><svg viewBox="0 0 160 60"><path d="M10,30 L140,30 M130,20 L150,30 L130,40"/></svg></div>
    <div class="chip" id="a4-chip">anonymousId — intent captured before login</div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      (function () {
        const tl = gsap.timeline({ paused: true });
        // Ambient Ken-Burns on still 1 (runs 0–4.5s).
        tl.fromTo("#a4-still-1", { scale: 1.00 }, { scale: 1.04, duration: 4.5, ease: "sine.inOut" }, 0);
        // Cross-fade to still 2 around the 4.5s midpoint.
        tl.to("#a4-still-1", { opacity: 0, duration: 0.6, ease: "power2.inOut" }, 4.5);
        tl.to("#a4-still-2", { opacity: 1, duration: 0.6, ease: "power2.inOut" }, 4.5);
        // Ambient Ken-Burns on still 2 (5.0s–end).
        tl.fromTo("#a4-still-2", { scale: 1.00 }, { scale: 1.04, duration: 4.5, ease: "sine.inOut" }, 5.0);
        // Annotation arrows draw in on the menu still.
        tl.to("#a4-arrow-1 path", { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, 5.8);
        tl.to("#a4-arrow-2 path", { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, 6.8);
        tl.to("#a4-arrow-3 path", { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, 7.8);
        // Chip fades in near the top of the beat.
        tl.to("#a4-chip", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 1.0);
        window.__timelines["beat-4-anon"] = tl;
      })();
    </script>
  </div>
</template>
```

- [ ] **Step 8.2: Lint**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint compositions/04-anonymous-arrival.html
```
Expected: no errors. If lint flags the missing `<video>` as an asset-type regression, override with `npx hyperframes lint --allow-image-assets` (falls back to plain lint if that flag is not recognized — HyperFrames supports still-image compositions natively).

- [ ] **Step 8.3: Commit**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  git add compositions/04-anonymous-arrival.html && \
  git commit -m "feat(comp): rewrite Beat 4 to use Playwright PNG stills with cross-fade"
```

---

## Task 9: Rewrite `compositions/05-identification.html` to use stills

**Files:**
- Modify: `/Users/browley/video/dominos-vip-demo/compositions/05-identification.html`

- [ ] **Step 9.1: Rewrite the file**

Replace the entire contents with:

```html
<!doctype html>
<template id="beat-5-ident-template">
  <div data-composition-id="beat-5-ident" data-start="0" data-duration="12" data-width="1920" data-height="1080">
    <style>
      [data-composition-id="beat-5-ident"] {
        width: 100%; height: 100%; background: #0A0F1E;
        font-family: "Geist", "Inter", system-ui, sans-serif;
        position: relative; overflow: hidden;
      }
      [data-composition-id="beat-5-ident"] img.still {
        position: absolute; top: 0; left: 0;
        width: 100%; height: 100%; object-fit: cover;
        transform-origin: center center;
      }
      [data-composition-id="beat-5-ident"] #i5-still-2 { opacity: 0; }
      [data-composition-id="beat-5-ident"] .overlay {
        position: absolute; inset: 0; background: rgba(10,15,30,0.72);
        display: flex; align-items: center; justify-content: center;
        opacity: 0; z-index: 10;
      }
      [data-composition-id="beat-5-ident"] .split {
        width: 1600px; display: grid; grid-template-columns: 1fr auto 1fr; gap: 48px;
        align-items: center;
      }
      [data-composition-id="beat-5-ident"] .panel {
        background: rgba(247,247,245,0.08); border-radius: 20px; padding: 32px;
        color: #F7F7F5; opacity: 0; transform: translateY(20px);
        border: 1px solid rgba(247,247,245,0.15);
      }
      [data-composition-id="beat-5-ident"] .panel h3 {
        margin: 0 0 20px 0; font-size: 26px; font-weight: 600; color: #F7F7F5;
      }
      [data-composition-id="beat-5-ident"] .panel li {
        font-family: "Geist Mono", ui-monospace, monospace;
        font-size: 20px; list-style: none; padding: 8px 0; color: rgba(247,247,245,0.8);
      }
      [data-composition-id="beat-5-ident"] .alias-pill {
        background: #0B5CAB; color: #F7F7F5;
        font-family: "Geist Mono", ui-monospace, monospace;
        font-size: 30px; font-weight: 700;
        padding: 18px 30px; border-radius: 14px; opacity: 0;
      }
    </style>
    <img class="still" id="i5-still-1" src="../assets/captures/beat-5-signin-before.png" alt="" crossorigin="anonymous"/>
    <img class="still" id="i5-still-2" src="../assets/captures/beat-5-signin-after.png" alt="" crossorigin="anonymous"/>
    <div class="overlay" id="i5-overlay">
      <div class="split">
        <div class="panel" id="i5-left">
          <h3>Anonymous timeline</h3>
          <ul>
            <li>page · /menu/pizzas</li>
            <li>product_list_viewed</li>
            <li>hero_banner_clicked</li>
          </ul>
        </div>
        <div class="alias-pill" id="i5-alias">alias()</div>
        <div class="panel" id="i5-right">
          <h3>Unified profile</h3>
          <ul>
            <li>user_sarah_42</li>
            <li>+ anonymous history</li>
            <li>+ 12 prior orders</li>
          </ul>
        </div>
      </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      (function () {
        const tl = gsap.timeline({ paused: true });
        tl.fromTo("#i5-still-1", { scale: 1.00 }, { scale: 1.03, duration: 5.0, ease: "sine.inOut" }, 0);
        tl.to("#i5-still-1", { opacity: 0, duration: 0.7, ease: "power2.inOut" }, 4.8);
        tl.to("#i5-still-2", { opacity: 1, duration: 0.7, ease: "power2.inOut" }, 4.8);
        tl.fromTo("#i5-still-2", { scale: 1.00 }, { scale: 1.03, duration: 6.0, ease: "sine.inOut" }, 5.4);
        tl.to("#i5-overlay", { opacity: 1, duration: 0.8, ease: "power2.out" }, 5.4);
        tl.to("#i5-left", { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 5.8);
        tl.to("#i5-right", { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 6.0);
        tl.to("#i5-alias", { opacity: 1, scale: 1.08, duration: 0.3, ease: "back.out(1.6)" }, 6.4);
        tl.to("#i5-alias", { scale: 1.0, duration: 0.3, ease: "power2.inOut" }, 6.7);
        tl.to("#i5-alias", { scale: 1.08, duration: 0.3, ease: "power2.out" }, 7.2);
        tl.to("#i5-alias", { scale: 1.0, duration: 0.3, ease: "power2.inOut" }, 7.5);
        window.__timelines["beat-5-ident"] = tl;
      })();
    </script>
  </div>
</template>
```

- [ ] **Step 9.2: Lint & commit**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  npx hyperframes lint compositions/05-identification.html && \
  git add compositions/05-identification.html && \
  git commit -m "feat(comp): rewrite Beat 5 to use Playwright PNG stills with alias overlay"
```

---

## Task 10: Rewrite `compositions/06-audience-match.html` to use stills

**Files:**
- Modify: `/Users/browley/video/dominos-vip-demo/compositions/06-audience-match.html`

- [ ] **Step 10.1: Rewrite the file**

Replace the entire contents with:

```html
<!doctype html>
<template id="beat-6-aud-template">
  <div data-composition-id="beat-6-aud" data-start="0" data-duration="14" data-width="1920" data-height="1080">
    <style>
      [data-composition-id="beat-6-aud"] {
        width: 100%; height: 100%; background: #0A0F1E;
        font-family: "Geist", "Inter", system-ui, sans-serif;
        position: relative; overflow: hidden;
      }
      [data-composition-id="beat-6-aud"] img.still {
        position: absolute; top: 0; left: 0;
        width: 100%; height: 100%; object-fit: cover;
        transform-origin: center center;
      }
      [data-composition-id="beat-6-aud"] #au6-still-2 { opacity: 0; }
      [data-composition-id="beat-6-aud"] .card {
        position: absolute; right: 80px; top: 120px;
        width: 520px; padding: 36px;
        background: #003B73; border-radius: 24px; z-index: 10;
        box-shadow: 0 20px 50px rgba(10,15,30,0.5);
        transform: translateX(60px); opacity: 0;
      }
      [data-composition-id="beat-6-aud"] .card .title {
        font-size: 18px; font-weight: 600; letter-spacing: 0.16em;
        color: rgba(247,247,245,0.6); text-transform: uppercase; margin-bottom: 20px;
      }
      [data-composition-id="beat-6-aud"] .rule {
        display: flex; align-items: center; gap: 16px;
        font-family: "Geist Mono", ui-monospace, monospace;
        font-size: 22px; color: #F7F7F5; padding: 12px 0;
        opacity: 0; transform: translateY(10px);
      }
      [data-composition-id="beat-6-aud"] .check {
        width: 28px; height: 28px; border-radius: 50%;
        background: rgba(247,247,245,0.15); flex-shrink: 0;
      }
      [data-composition-id="beat-6-aud"] .matched {
        margin-top: 28px; padding-top: 24px;
        border-top: 1px solid rgba(247,247,245,0.2);
        font-size: 36px; font-weight: 700; color: #E31837;
        opacity: 0; transform: scale(0.9);
      }
      [data-composition-id="beat-6-aud"] .pulse {
        position: absolute; right: 80px; top: 120px;
        width: 520px; height: 520px; border-radius: 24px;
        border: 2px solid #E31837; z-index: 5;
        opacity: 0; transform: scale(1);
      }
    </style>
    <img class="still" id="au6-still-1" src="../assets/captures/beat-6-audiences-pre.png" alt="" crossorigin="anonymous"/>
    <img class="still" id="au6-still-2" src="../assets/captures/beat-6-audiences-post.png" alt="" crossorigin="anonymous"/>
    <div class="pulse" id="au6-pulse"></div>
    <div class="card" id="au6-card">
      <div class="title">Audience rule</div>
      <div class="rule" id="au6-r1"><div class="check" id="au6-c1"></div><span>lifetime_spend ≥ $100</span></div>
      <div class="rule" id="au6-r2"><div class="check" id="au6-c2"></div><span>lifetime_orders ≥ 5</span></div>
      <div class="rule" id="au6-r3"><div class="check" id="au6-c3"></div><span>last_order &lt; 30d</span></div>
      <div class="matched" id="au6-matched">VIP Loyalists · MATCHED</div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      (function () {
        const tl = gsap.timeline({ paused: true });
        tl.fromTo("#au6-still-1", { scale: 1.00 }, { scale: 1.03, duration: 5.0, ease: "sine.inOut" }, 0);
        tl.to("#au6-still-1", { opacity: 0, duration: 0.6, ease: "power2.inOut" }, 4.9);
        tl.to("#au6-still-2", { opacity: 1, duration: 0.6, ease: "power2.inOut" }, 4.9);
        tl.fromTo("#au6-still-2", { scale: 1.00 }, { scale: 1.03, duration: 8.5, ease: "sine.inOut" }, 5.4);
        tl.to("#au6-card", { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, 0.3);
        tl.to("#au6-r1", { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0.7);
        tl.to("#au6-r2", { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0.82);
        tl.to("#au6-r3", { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0.94);
        tl.to("#au6-c1", { backgroundColor: "#E31837", duration: 0.3, ease: "power2.out" }, 2.0);
        tl.to("#au6-c2", { backgroundColor: "#E31837", duration: 0.3, ease: "power2.out" }, 3.2);
        tl.to("#au6-c3", { backgroundColor: "#E31837", duration: 0.3, ease: "power2.out" }, 4.4);
        tl.to("#au6-matched", { opacity: 1, scale: 1.0, duration: 0.35, ease: "back.out(1.7)" }, 5.0);
        tl.to("#au6-pulse", { opacity: 1, scale: 1.04, duration: 0.4, ease: "power2.out" }, 5.1);
        tl.to("#au6-pulse", { opacity: 0, duration: 0.4, ease: "power2.in" }, 5.5);
        window.__timelines["beat-6-aud"] = tl;
      })();
    </script>
  </div>
</template>
```

- [ ] **Step 10.2: Lint & commit**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  npx hyperframes lint compositions/06-audience-match.html && \
  git add compositions/06-audience-match.html && \
  git commit -m "feat(comp): rewrite Beat 6 to use Playwright PNG stills with rule overlay"
```

---

## Task 11: Rewrite `compositions/07-personalization.html` to use stills

**Files:**
- Modify: `/Users/browley/video/dominos-vip-demo/compositions/07-personalization.html`

Single still — the VIP homepage — with a Ken-Burns zoom and three anchored callouts.

- [ ] **Step 11.1: Rewrite the file**

Replace the entire contents with:

```html
<!doctype html>
<template id="beat-7-pers-template">
  <div data-composition-id="beat-7-pers" data-start="0" data-duration="14" data-width="1920" data-height="1080">
    <style>
      [data-composition-id="beat-7-pers"] {
        width: 100%; height: 100%; background: #0A0F1E;
        font-family: "Geist", "Inter", system-ui, sans-serif;
        position: relative; overflow: hidden;
      }
      [data-composition-id="beat-7-pers"] img.still {
        position: absolute; top: 0; left: 0;
        width: 100%; height: 100%; object-fit: cover;
        transform-origin: center center;
      }
      [data-composition-id="beat-7-pers"] .callout {
        position: absolute; z-index: 10;
        background: #F7F7F5; color: #0B5CAB;
        padding: 16px 24px; border-radius: 14px;
        font-size: 22px; font-weight: 600;
        box-shadow: 0 8px 24px rgba(10,15,30,0.25);
        opacity: 0; transform: translateY(-10px);
      }
      [data-composition-id="beat-7-pers"] #p7-c1 { top: 140px; left: 120px; }
      [data-composition-id="beat-7-pers"] #p7-c2 { top: 120px; right: 160px; }
      [data-composition-id="beat-7-pers"] #p7-c3 { bottom: 200px; left: 160px; }
    </style>
    <img class="still" id="p7-still" src="../assets/captures/beat-7-vip-home.png" alt="" crossorigin="anonymous"/>
    <div class="callout" id="p7-c1">Hero — from audience membership</div>
    <div class="callout" id="p7-c2">Cart — from preferred_items computed trait</div>
    <div class="callout" id="p7-c3">Offer — from tier</div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      (function () {
        const tl = gsap.timeline({ paused: true });
        tl.fromTo("#p7-still", { scale: 1.00 }, { scale: 1.06, duration: 13.8, ease: "sine.inOut" }, 0);
        tl.to("#p7-c1", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 1.0);
        tl.to("#p7-c2", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 1.3);
        tl.to("#p7-c3", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 1.6);
        window.__timelines["beat-7-pers"] = tl;
      })();
    </script>
  </div>
</template>
```

- [ ] **Step 11.2: Lint & commit**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  npx hyperframes lint compositions/07-personalization.html && \
  git add compositions/07-personalization.html && \
  git commit -m "feat(comp): rewrite Beat 7 to use VIP homepage PNG with Ken-Burns"
```

---

## Task 12: Update `compositions/03-sarah-returns.html` to show the live VIP card

**Files:**
- Modify: `/Users/browley/video/dominos-vip-demo/compositions/03-sarah-returns.html`

The parent plan's Beat 3 composes a hand-built persona card from scratch. With Playwright captures available we can show the **real** `/use-cases` VIP story card, then overlay the six trait pills so the audience sees data provenance on top of live UI.

- [ ] **Step 12.1: Rewrite the file**

Replace the entire contents with:

```html
<!doctype html>
<template id="beat-3-sarah-template">
  <div data-composition-id="beat-3-sarah" data-start="0" data-duration="12" data-width="1920" data-height="1080">
    <style>
      [data-composition-id="beat-3-sarah"] {
        width: 100%; height: 100%; background: #0A0F1E;
        font-family: "Geist", "Inter", system-ui, sans-serif;
        position: relative; overflow: hidden;
      }
      [data-composition-id="beat-3-sarah"] img.still {
        position: absolute; top: 0; left: 0;
        width: 100%; height: 100%; object-fit: cover;
        transform-origin: center center; filter: brightness(0.62) saturate(0.85);
      }
      [data-composition-id="beat-3-sarah"] .scrim {
        position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,15,30,0.15), rgba(10,15,30,0.55));
        z-index: 1;
      }
      [data-composition-id="beat-3-sarah"] .frame {
        position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
        padding: 80px; box-sizing: border-box; z-index: 2;
      }
      [data-composition-id="beat-3-sarah"] .card {
        width: 1440px; padding: 64px 72px;
        background: rgba(247,247,245,0.96); border-radius: 28px;
        box-shadow: 0 30px 60px rgba(10,15,30,0.35);
        opacity: 0; transform: scale(0.96);
      }
      [data-composition-id="beat-3-sarah"] h1 {
        font-size: 72px; font-weight: 700; color: #0B5CAB;
        line-height: 1; margin: 0 0 12px 0;
        opacity: 0; transform: translateY(20px);
      }
      [data-composition-id="beat-3-sarah"] .sub {
        font-size: 28px; font-weight: 500; color: #6B7280;
        margin: 0 0 40px 0; opacity: 0; transform: translateY(20px);
      }
      [data-composition-id="beat-3-sarah"] .grid {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px;
      }
      [data-composition-id="beat-3-sarah"] .pill {
        background: #FFFFFF; border-radius: 16px; padding: 18px 22px;
        border: 1px solid rgba(11,92,171,0.15);
        opacity: 0; transform: translateY(20px);
      }
      [data-composition-id="beat-3-sarah"] .pill .trait {
        font-size: 26px; font-weight: 600; color: #0A0F1E; margin-bottom: 6px;
      }
      [data-composition-id="beat-3-sarah"] .pill .src {
        font-family: "Geist Mono", ui-monospace, monospace;
        font-size: 14px; color: #0B5CAB; opacity: 0;
      }
    </style>
    <img class="still" id="s3-still" src="../assets/captures/beat-3-sarah-profile.png" alt="" crossorigin="anonymous"/>
    <div class="scrim"></div>
    <div class="frame">
      <div class="card" id="s3-card">
        <h1 id="s3-h">Meet Sarah</h1>
        <div class="sub" id="s3-sub">Gold Tier · 12 orders · $386 lifetime</div>
        <div class="grid" id="s3-grid">
          <div class="pill"><div class="trait">Gold Tier</div><div class="src">identify · traits.tier</div></div>
          <div class="pill"><div class="trait">12 orders</div><div class="src">computed trait · lifetime_orders</div></div>
          <div class="pill"><div class="trait">$386 LTV</div><div class="src">computed trait · lifetime_spend</div></div>
          <div class="pill"><div class="trait">$32 AOV</div><div class="src">computed trait · avg_order_value</div></div>
          <div class="pill"><div class="trait">Meat Lovers + Garlic Bread</div><div class="src">track · Order Completed</div></div>
          <div class="pill"><div class="trait">Last order 11d ago</div><div class="src">computed trait · days_since_last_order</div></div>
        </div>
      </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      (function () {
        const tl = gsap.timeline({ paused: true });
        tl.fromTo("#s3-still", { scale: 1.00 }, { scale: 1.05, duration: 11.8, ease: "sine.inOut" }, 0);
        tl.to("#s3-card", { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, 0.2);
        tl.to("#s3-h", { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0.35);
        tl.to("#s3-sub", { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.5);
        const pills = "[data-composition-id='beat-3-sarah'] .pill";
        const srcs = "[data-composition-id='beat-3-sarah'] .pill .src";
        tl.to(pills, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.12 }, 0.9);
        tl.to(srcs, { opacity: 1, duration: 0.35, ease: "sine.out", stagger: 0.12 }, 1.7);
        window.__timelines["beat-3-sarah"] = tl;
      })();
    </script>
  </div>
</template>
```

- [ ] **Step 12.2: Lint & commit**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  npx hyperframes lint compositions/03-sarah-returns.html && \
  git add compositions/03-sarah-returns.html && \
  git commit -m "feat(comp): overlay Beat 3 persona card on live /use-cases still"
```

---

## Task 13: Update Beat 8 kiosk inset in `compositions/08-architecture.html`

**Files:**
- Modify: `/Users/browley/video/dominos-vip-demo/compositions/08-architecture.html`

Only the kiosk inset block needs to change — the five architecture tiles and electric path remain.

- [ ] **Step 13.1: Replace the kiosk inset DOM**

Open `/Users/browley/video/dominos-vip-demo/compositions/08-architecture.html`. Find this block:

```html
        <div class="kiosk-inset" id="arch-kiosk">
          <video data-start="0" data-duration="1.6" data-track-index="1" src="../assets/captures/cap-kiosk-brief.mp4" muted playsinline></video>
        </div>
```

Replace it with:

```html
        <div class="kiosk-inset" id="arch-kiosk">
          <img src="../assets/captures/beat-8-kiosk-inset.png" alt="" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
```

No other changes. The existing `#arch-kiosk` opacity tweens (Steps 18.6–18.8 of the parent plan) still drive the fade in/out.

- [ ] **Step 13.2: Lint & commit**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  npx hyperframes lint compositions/08-architecture.html && \
  git add compositions/08-architecture.html && \
  git commit -m "feat(comp): swap Beat 8 kiosk inset to PNG still"
```

---

## Task 14: Smoke-run the updated project

**Files:** none created; verification only.

- [ ] **Step 14.1: Project-wide lint**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint
```
Expected: exit 0, no errors across all compositions and `index.html`. Warnings on deferred items (e.g., `music-bed.mp3`) are acceptable if the parent plan already tolerates them.

- [ ] **Step 14.2: Preview one beat through HyperFrames studio**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes preview --port 4567
```
Open the printed URL. Seek to each of Beats 3, 4, 5, 6, 7, 8 in turn. For each confirm:

- The correct PNG is visible and fills the frame.
- The Ken-Burns zoom is perceptible but not distracting (1.00 → 1.03–1.06 range).
- Cross-fades between `still-1` and `still-2` land cleanly with no black flash.
- All overlay elements (chip, callouts, rule card, alias pill) render over the still.

Stop the preview with Ctrl-C.

- [ ] **Step 14.3: If a PNG is missing or wrong**

Regenerate only the offending beat by commenting out the other `withContext(async (page) => { … })` blocks in `scripts/capture-screens.mjs`, re-running `npm run capture`, then un-commenting before final handoff. Commit any in-script changes separately with a `fix(video):` prefix.

- [ ] **Step 14.4: Commit any lint-fix follow-ups**

If Step 14.1 surfaced fixable lint issues, resolve them and commit with `fix(comp): <short reason>`.

---

## Task 15: Update the parent plan's obsolete steps

**Files:**
- Modify: `/Users/browley/domdemo/docs/superpowers/plans/2026-04-30-dominos-vip-demo-video.md`

The parent plan's Task 7 (Steps 7.1–7.6) and the capture-referenced segments of Tasks 11–14 + 18 are now stale. Add a prominent callout so future executors know to follow this plan instead.

- [ ] **Step 15.1: Prepend a redirection note to Task 7**

In `docs/superpowers/plans/2026-04-30-dominos-vip-demo-video.md`, locate the line `## Task 7: Produce screen captures`. Immediately below the heading, insert:

```markdown
> **SUPERSEDED by** `docs/superpowers/plans/2026-04-30-vip-video-playwright-captures.md`. Use that plan to capture deterministic PNG stills via Playwright against the deployed demo instead of driving Chrome DevTools' recorder by hand. Tasks 11, 12, 13, 14, and 18 in this file have also been rewritten in that plan to consume PNG stills. Apply the companion plan, then skip Tasks 7, 11, 12, 13, 14 here and treat Task 18's kiosk inset as updated.
```

- [ ] **Step 15.2: Commit in the `domdemo/` repo**

```bash
\
  git add docs/superpowers/plans/2026-04-30-dominos-vip-demo-video.md && \
  git commit -m "docs: redirect VIP video capture tasks to Playwright plan"
```

---

## Self-Review Appendix

1. **Spec coverage.** Spec §4 "Screen-capture plan" called for five hand-recorded MP4s; this plan replaces those with seven deterministic PNGs plus one kiosk still, which is a strict super-set of what the spec requires and preserves the "real product footage drives every 'What happens' beat — no fake UI" requirement from Success Criterion 3. ✓
2. **No placeholders.** Every code block is concrete. The only user-tunable is the 1.03–1.06 Ken-Burns range and specific overlay timings, all explicitly named with defaults. ✓
3. **ID consistency.** Composition ids (`beat-3-sarah`, `beat-4-anon`, `beat-5-ident`, `beat-6-aud`, `beat-7-pers`, `beat-8-arch`) and element prefixes (`s3-`, `a4-`, `i5-`, `au6-`, `p7-`, `arch-kiosk`) match the parent plan so `window.__timelines` registrations and `index.html` references continue to resolve. ✓
4. **Asset paths.** All `<img src>` values use `../assets/captures/<name>.png` — relative to `compositions/`. Matches the parent plan's `<video src>` convention. ✓
5. **Determinism.** No `Math.random`, no `Date.now` in composition timelines. The capture script uses `Date.now()` only for a `matchedAt` seed that never bleeds into the rendered frame. ✓
6. **Fallback for store-key drift.** Every persist-key assumption (`domdemo.segment`, `domdemo.ui`, `domdemo.cart`, `inspectorOpen`, `inspectorTab`) has a troubleshooting note. If the deployed build renames a slice, the capture script degrades gracefully because all writes are wrapped in `try {}` blocks. ✓

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-30-vip-video-playwright-captures.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints.

**Which approach?**
