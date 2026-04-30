# Domino's VIP Demo Video — Design Spec

**Date:** 2026-04-30
**Author:** Browley (via Claude Code brainstorming)
**Status:** Draft — awaiting user review before implementation planning
**Workspace target:** `/Users/browley/video/dominos-vip-demo/` (separate from `domdemo/`)
**Deliverable:** 90–120s MP4 video sent to Domino's CTO

---

## 1. Goal & Success Criteria

### Goal
Produce a 90–120s executive demo video of the Domino's Segment CDP demo's **VIP Recognition & Loyalty** flow, authored with [HyperFrames](https://github.com/heygen-com/hyperframes), to send to Domino's CTO.

The video makes a layered argument:
1. The VIP moment is a real, operationally-meaningful scenario — not a demo prop.
2. Segment's product stack (Connections → Unify → Engage → Protocols → Personalization) is what makes that moment deliverable in-session.
3. Segment's USP is **composability + real-time identity + governance** — not just "audiences."

### Success Criteria
1. Final MP4 is 90–120s, 1920×1080, 30fps, high quality. No hard size cap.
2. Opens with a problem frame; closes with a single URL + contact line; one headline stat per beat.
3. Real product footage drives every "What happens" beat — no fake UI.
4. Narration is TTS-generated with word-synced captions; intelligible at −16 LUFS.
5. Renders deterministically via `npx hyperframes render --quality high` with zero lint errors.
6. Visual identity traces to Domino's brand (blue + dark-blue + Cravemark accent) defined in `DESIGN.md`.

---

## 2. Project Layout & Tooling

### Workspace location
New sibling directory `/Users/browley/video/dominos-vip-demo/`, scaffolded via `npx hyperframes init dominos-vip-demo`. The Next.js app at `/Users/browley/domdemo/` stays untouched. Only the spec and storyboard reference back into `domdemo/docs/superpowers/specs/`; binaries stay in the video workspace.

### Directory shape
```
dominos-vip-demo/
  DESIGN.md                  # brand cheat sheet (Domino's palette, fonts, Cravemark use)
  SCRIPT.md                  # narration script, per-beat
  STORYBOARD.md              # per-beat creative direction + asset table
  hyperframes.json           # project config
  index.html                 # root composition (orchestrates sub-comps)
  compositions/              # 11 per-beat sub-comps (mix of HyperFrames-native and footage-wrapped)
    01-hook.html
    02-problem.html
    03-sarah-returns.html
    04-anonymous-arrival.html
    05-identification.html
    06-audience-match.html
    07-personalization.html
    08-architecture.html
    09-usp.html
    10-impact.html
    11-cta.html
  assets/
    brand/                   # SVG logos copied from domdemo
    captures/                # screen recordings of the live flow
    audio/                   # narration.wav, music-bed.mp3, transcript.json
  renders/                   # hyperframes render output (gitignored)
  .hyperframes/              # lint + animation-map artifacts (gitignored)
```

### Tooling chain (all via `npx hyperframes`)
- `init` — scaffold from `swiss-grid` template, then override with Domino's palette
- `tts` (Kokoro-82M, voice `af_nova`) → `assets/audio/narration.wav`
- `transcribe narration.wav` → word-level timestamps → captions
- `lint` + `validate` per composition before render
- `preview` for iteration (live reload in studio)
- `render --quality high --fps 30` for final; `--docker` for byte-identical delivery copy

### Screen-capture source
Chrome DevTools' built-in recorder against `localhost:3000`, seeded to Sarah persona (Gold VIP) via `scripts/seed-demo-user.mjs`. Record at 1920×1080, 60fps. Trim per-beat inside HyperFrames with `data-media-start` + `data-duration`.

### Brand assets
Copied (not symlinked) from `domdemo/` into `assets/brand/`:
- `DPZ_2025_Logo_CombinationMark_Horizontal_Blue_RGB.svg` (titles)
- `DPZ_2025_Logo_Cravemark_Blue_RGB.svg` (transitions, accent)
- `DPZ_2025_Logo_Wordmark_Blue_RGB.svg` (final frame)

### Palette (locked in `DESIGN.md`)
- `#0B5CAB` — Domino's blue (primary)
- `#003B73` — Domino's dark-blue (headings, backgrounds)
- `#E31837` — Domino's red (used only as "VIP match" pulse)
- `#F7F7F5` — off-white canvas
- `#0A0F1E` — near-black text

### Visual style
HyperFrames **Swiss Pulse** preset overridden with the Domino's palette. Clean, confident, executive register — no maximalism.

---

## 3. Narrative Arc — Beat Sheet

Target ~115s. 11 beats, each with a single job. Every beat pairs **screen footage** or **HyperFrames-native visuals** with an overlay that names the Segment primitive doing the work.

| # | Beat | Duration | Footage | Overlay / HyperFrames element | Narration (draft) |
|---|------|----------|---------|-------------------------------|-------------------|
| 1 | Hook — scale of the problem | 6s | None | Big tabular-num "85M+" mask-reveal. Sub: "One homepage." Cravemark micro-pulse. | "Domino's has more than 85 million rewards members. Today, most of them see the same homepage." |
| 2 | Why this matters | 10s | None | Split: "Generic homepage" / "Recognized VIP." Stat chips rise: "+22% AOV · 3× repeat frequency." | "Recognition isn't cosmetic. For VIPs, it's a 22% order-value swing and three times the repeat rate." |
| 3 | Meet Sarah — persona card | 12s | Freeze-frame of `/use-cases` VIP card | Identity card from Segment profile: userId, Gold tier, 12 orders, $386 lifetime, avg $32, favorite Meat Lovers + Garlic Bread, last order 11 days ago. Each trait shows its source (`identify`, `track: Order Completed`, computed trait). | "Meet Sarah. Twelve orders. Three hundred eighty-six dollars in lifetime spend. Her favorite — Meat Lovers with garlic bread — assembled from events Segment has already captured." |
| 4 | Anonymous arrival | 10s | `cap-anon-browse.mp4` (0–8s): incognito `/` → `/menu/pizzas`, Event Inspector open | Annotation arrows point at `Page`, `Product List Viewed`, `Hero Banner Clicked` as they stream. Label: "`anonymousId` — intent captured before login." | "Before Sarah signs in, her intent is captured against an anonymous ID. Not lost. Not guessed." |
| 5 | Identification — alias() merges history | 12s | `cap-signin-transition.mp4` (0–10s) | Before/after block: anonymous event timeline left merges into unified profile right via `alias()`. Identity panel badge flips from `anon_xxx` to `user_sarah_42`. | "The moment she signs in, Segment's alias call merges her anonymous session into her full profile. One customer. One timeline." |
| 6 | Real-time audience match | 14s | `cap-audience-match.mp4` (0–12s): Audiences panel; VIP Loyalists grey → green | Rule block renders: `lifetime_spend ≥ $100 AND lifetime_orders ≥ 5 AND last_order < 30d`. Each condition lights as Sarah's traits satisfy it. `Audience Entered` pulses. | "A real-time audience — not a nightly batch — evaluates against every event. VIP Loyalists: matched, in this session." |
| 7 | Personalization in-session | 14s | `cap-vip-homepage.mp4` (0–12s): VIP hero, pre-loaded cart, $35.95 exclusive combo | Callouts label surfaces: "Hero — audience membership," "Cart — `preferred_items` computed trait," "Offer — tier." | "And the experience rewrites itself — the hero, the offer, even the cart — before Sarah takes a second action." |
| 8 | The Segment stack — architecture | 18s | None (+ ~1.5s kiosk inset from `cap-kiosk-brief.mp4`) | Stack diagram left→right: **Connections** (web, iOS, Android, kiosk, POS) → **Unify** → **Engage** → **Protocols** → **Personalization**. Electric path traverses synced to narration. | "Under the hood, five Segment layers. Connections ingests events from every surface. Unify resolves identity. Engage runs audiences in real time. Protocols guards data quality. Personalization delivers the moment." |
| 9 | Why Segment — USP | 14s | None | Three numbered pillars, soft-wipe between: ① **In-session, not email-later** (200ms latency badge) · ② **One identity across web, mobile, kiosk** (three device silhouettes fusing) · ③ **Composable** (ecosystem logos around central Segment node). | "Three things set Segment apart. Real time, not batch. One identity across every surface — web, mobile, in-store kiosk. And it's composable — it strengthens the stack Domino's already runs." |
| 10 | Business impact | 10s | None | Three counters tween 0 → target with `power3.out`: **+22% AOV**, **3× repeat frequency**, **<200ms** latency. Footnote: "Segment customer benchmarks, real-time audience personalization." | "Twenty-two percent higher order value. Three times the repeat rate. Sub-second response from event to experience." |
| 11 | Close — CTA | 5s | None | Domino's Wordmark + Segment mark, demo URL, contact line. Cravemark fade. 1.5s hold. | "See Sarah's flow live. Link in the description." |

### Why these beats (vs. a lighter version)
Beats 3, 4, 5, 8, and 9 exist to answer *why this requires Segment and not a homegrown rule engine or point tool*. Beat 6 explicitly says "real-time, not batch" — the single biggest CTO-level misconception about CDPs. Beat 8 names all five Segment product layers by name so the CTO can map them to their internal roadmap.

### Word count
~180 words → ~115s at 95 wpm. Inside the 90–120s window with room to trim at storyboard step.

---

## 4. Assets, Script & TTS Plan

### Screen-capture plan

| Capture | Source flow | Seed state | Clip range | Used in beat |
|---------|-------------|------------|------------|---------------|
| `cap-anon-browse.mp4` | Incognito → `/` → `/menu/pizzas` → hover pizza card. Event Inspector FAB expanded. | Fresh `anonymousId`, no persona | 0–8s | 4 |
| `cap-signin-transition.mp4` | Click Login → submit Sarah's creds → land on `/` re-rendered | Sarah seed (`scripts/seed-demo-user.mjs`) via Demo toolbar → "Load VIP persona" | 0–10s | 5 |
| `cap-audience-match.mp4` | Audiences panel: VIP Loyalists grey → green; Event Inspector `Audience Entered` | Sarah identified | 0–12s | 6 |
| `cap-vip-homepage.mp4` | Homepage: VIP hero, cart icon (2 items), hover cart with Meat Lovers + Garlic Bread pre-loaded | Sarah identified, VIP audience active, demo overlays on | 0–12s | 7 |
| `cap-kiosk-brief.mp4` | `/kiosk` attract → tap → loyalty scan → recognized welcome | Kiosk seeded with Sarah's loyalty ID | 0–3s (only ~1.5s used) | 8 inset |

### Pre-capture checklist
- `npm run dev` clean start
- Demo seed rerun
- Demo toolbar → load Sarah persona
- Demo overlays **ON** (Segment FAB → Demo overlays)
- Light mode
- Notifications silenced (Slack, mail, Calendar)
- Bookmarks bar hidden, extensions off
- Record each take 3+ times; pick the clean one

### HyperFrames-native compositions (no live footage, except Beat 8 inset)
- **01-hook.html** — title card. "85M+" mask-reveal, "One homepage." sub, Cravemark micro-pulse on "more than." `flash-through-white` transition out.
- **02-problem.html** — two-column clip-path split. Stat chips with 120ms stagger.
- **03-sarah-returns.html** — persona card over a freeze-frame still extracted from `/use-cases`; trait pills animate in with source-badges.
- **08-architecture.html** — five horizontal stack tiles (Connections/Unify/Engage/Protocols/Personalization), electric path traversal synced to narration word-timing. Derived from `data-chart` block. Includes a ~1.5s inline `cap-kiosk-brief.mp4` inset when the word "kiosk" is spoken.
- **09-usp.html** — kinetic typography. Three pillars in sequence with soft wipes; each pillar + micro-visual.
- **10-impact.html** — counter tweens (tabular-nums, `power3.out`). 14px footnote chip.
- **11-cta.html** — Wordmark centered, URL below, contact line, Cravemark fade, 1.5s hold before fade to black.

### Footage-wrapped compositions
- **04-anonymous-arrival.html** — `cap-anon-browse.mp4` with annotation arrow overlays + label.
- **05-identification.html** — `cap-signin-transition.mp4` with before/after timeline-merge overlay.
- **06-audience-match.html** — `cap-audience-match.mp4` with rule-block overlay lighting up.
- **07-personalization.html** — `cap-vip-homepage.mp4` with three surface-callout overlays.

### Narration script (draft)
1. "Domino's has more than 85 million rewards members. Today, most of them see the same homepage."
2. "Recognition isn't cosmetic. For VIPs, it's a 22% order-value swing and three times the repeat rate."
3. "Meet Sarah. Twelve orders. Three hundred eighty-six dollars in lifetime spend. Her favorite — Meat Lovers with garlic bread — assembled from events Segment has already captured."
4. "Before Sarah signs in, her intent is captured against an anonymous ID. Not lost. Not guessed."
5. "The moment she signs in, Segment's alias call merges her anonymous session into her full profile. One customer. One timeline."
6. "A real-time audience — not a nightly batch — evaluates against every event. VIP Loyalists: matched, in this session."
7. "And the experience rewrites itself — the hero, the offer, even the cart — before Sarah takes a second action."
8. "Under the hood, five Segment layers. Connections ingests events from every surface. Unify resolves identity. Engage runs audiences in real time. Protocols guards data quality. Personalization delivers the moment."
9. "Three things set Segment apart. Real time, not batch. One identity across every surface — web, mobile, in-store kiosk. And it's composable — it strengthens the stack Domino's already runs."
10. "Twenty-two percent higher order value. Three times the repeat rate. Sub-second response from event to experience."
11. "See Sarah's flow live. Link in the description."

### TTS plan
- **Engine:** HyperFrames built-in Kokoro-82M (`npx hyperframes tts`)
- **Voice:** `af_nova` (warm, authoritative; neutral-corporate)
- **Speed:** default 1.0; drop to 0.95 on lines 3 (Sarah intro, dense) and 8 (architecture, five product names) if needed
- **Flow:** single `narration.txt` → single TTS pass → `narration.wav` → `hyperframes transcribe` → `transcript.json`
- **Captions:** burned in. Geist Mono 32px, white with 2px black outline, tabular-nums on stat lines, bottom-third-safe.

### Music bed
Single royalty-free instrumental at `data-volume="0.22"`. One small rise automation at Beat 9 → 10. Track selection deferred to storyboard.

### Deterministic render settings
- Working render: `npx hyperframes render --quality high --fps 30 --workers auto`
- Canonical delivery render: second pass with `--docker` added for byte-identical reproducibility; this is the file sent to the CTO
- `npx hyperframes lint --strict` + `npx hyperframes validate` before any render
- `scripts/animation-map.mjs` per composition — especially Beat 8

---

## 5. Risks, Validation Gates & Delivery

### Risks

| # | Risk | Likelihood | Mitigation |
|---|------|------------|------------|
| 1 | Screen recordings look amateur | Medium | Pre-capture checklist; 3+ takes per clip; Chrome DevTools recorder only |
| 2 | TTS voice sounds robotic vs. Domino's polish | Medium | Listen to Beat 8 sample before committing; swap to self-recorded VO if it fails CTO-grade bar; captions regenerate from any new audio |
| 3 | Architecture beat (Beat 8) feels stock, loses CTO | High | Build Beat 8 **last**; iterate in 3 passes (static tiles → electric path → source-icon micro-inserts); animation-map must show no dead zones > 800ms |
| 4 | Stats look inflated without citation | High | Beat 10 caption footnote cites the source (draft text: "Segment customer benchmarks, real-time audience personalization") — exact wording + linkable source must be verified against Segment's published collateral during SCRIPT.md step before TTS. Never attribute to Domino's. Every number Segment-published with a locatable URL. |
| 5 | Demo app not in stable state to capture | Low | `npm run build && npm run dev` + seed before any recording session; halt video build if Sarah fails to load |
| 6 | HyperFrames version drift mid-build | Low | Pin version in `dominos-vip-demo/package.json`; run `hyperframes doctor` at project start; commit `skills-lock.json`; `--docker` for final render |
| 7 | Render > 500MB | Medium | H.264 medium-bitrate captures; aggressive trimming; CRF 20 re-encode delivery copy if needed |
| 8 | Scope creep to all 5 use-cases | Medium | Spec explicitly scopes to VIP. Additional use-cases are separate 45–60s variants reusing workspace and DESIGN.md. |

### Validation gates (hard stops)

1. **Lint gate** — `npx hyperframes lint --strict` clean on `index.html` + every composition
2. **Contrast gate** — `npx hyperframes validate` WCAG AA pass; no warnings at 5+ seek points across timeline
3. **Animation-map gate** — no `offscreen`, `collision`, `paced-fast` flags; dead zones > 1.2s must be intentional and annotated
4. **Audio gate** — narration −16 LUFS ±1, music bed −26 LUFS ±1, no clipping; caption timing within 120ms of word boundary (spot-check 10 words)
5. **Fact gate** — every stat traces to documented Segment source; Beat 10 footnote correct; no unbacked Domino's-specific claims
6. **Brand gate** — palette matches DESIGN.md hex values exactly; Cravemark as accent only; Wordmark only in Beat 11
7. **Cold-watch gate** — one non-author watches **sound off** then **sound on**; each pass must communicate the three USP pillars
8. **Executive-length gate** — 90 ≤ duration ≤ 120s

### Build sequence (shape only — writing-plans fleshes this out)
1. Scaffold `dominos-vip-demo/` and commit
2. Author `DESIGN.md`
3. Write `SCRIPT.md` (refined draft above)
4. Generate narration via TTS → transcribe → commit transcript
5. Write `STORYBOARD.md` with real timings from transcript
6. Capture all five screen recordings → trim → stage in `assets/captures/`
7. Build compositions in order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 9 → 10 → 11 → **8 last**
8. Wire `index.html` orchestrator + caption track + music bed
9. Run all validation gates
10. Preview → user sign-off → working render (`--quality high`) → canonical delivery render (`--quality high --docker`)

### Delivery artifacts
- `renders/dominos-vip-demo_final.mp4` — primary deliverable
- `renders/dominos-vip-demo_final.webm` — optional (not required)
- `docs/superpowers/specs/2026-04-30-dominos-vip-demo-video-design.md` — this spec, committed in `domdemo/`
- `dominos-vip-demo/STORYBOARD.md` — stays in video workspace for reuse
