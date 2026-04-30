# Domino's VIP Demo Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a 90–120s executive demo video of the Domino's Segment CDP demo's VIP Recognition flow, authored with HyperFrames, rendered to MP4 at 1920×1080 / 30fps / high quality, for delivery to Domino's CTO.

**Architecture:** HyperFrames project in a sibling workspace `/Users/browley/video/dominos-vip-demo/`. Eleven per-beat sub-compositions (mix of HyperFrames-native and screen-capture-wrapped) orchestrated by a root `index.html`. Narration via Kokoro-82M TTS (`af_nova`), captions from word-level Whisper transcript, music bed at low volume. Brand identity locked in `DESIGN.md` (Domino's blue palette, Swiss Pulse motion style). Deterministic renders via `npx hyperframes render --quality high --docker`.

**Tech Stack:** HyperFrames (HTML + CSS + GSAP + `data-*` attributes), Node.js ≥22, FFmpeg, Chrome DevTools recorder for screen captures, Next.js 16 source app at `/Users/browley/domdemo`.

**Spec reference:** `docs/superpowers/specs/2026-04-30-dominos-vip-demo-video-design.md`

---

## File Structure

**Workspace root:** `/Users/browley/video/dominos-vip-demo/` (created by `npx hyperframes init`)

| File | Responsibility |
|---|---|
| `DESIGN.md` | Palette, typography, motion rules, "What NOT to Do" anti-patterns |
| `SCRIPT.md` | Final narration script, one line per beat |
| `narration.txt` | Flat plain-text input to TTS (one paragraph, sentences) |
| `STORYBOARD.md` | Per-beat creative direction + asset table + real timings from transcript |
| `assets/audio/narration.wav` | Kokoro TTS output |
| `assets/audio/transcript.json` | Word-level timestamps from `hyperframes transcribe` |
| `assets/audio/music-bed.mp3` | Royalty-free instrumental (source TBD at build time) |
| `assets/brand/*.svg` | Copied Domino's logos |
| `assets/captures/*.mp4` | Five trimmed screen recordings |
| `compositions/01-hook.html` | Beat 1 — "85M+" hook title card |
| `compositions/02-problem.html` | Beat 2 — Generic vs Recognized split |
| `compositions/03-sarah-returns.html` | Beat 3 — persona card with source-tagged traits |
| `compositions/04-anonymous-arrival.html` | Beat 4 — anonymous browse footage + annotation |
| `compositions/05-identification.html` | Beat 5 — sign-in footage + alias() merge overlay |
| `compositions/06-audience-match.html` | Beat 6 — audience-panel footage + rule block overlay |
| `compositions/07-personalization.html` | Beat 7 — VIP homepage footage + surface callouts |
| `compositions/08-architecture.html` | Beat 8 — five-layer Segment stack diagram (built last, iterated) |
| `compositions/09-usp.html` | Beat 9 — three USP pillars, kinetic type |
| `compositions/10-impact.html` | Beat 10 — counter tweens with footnote |
| `compositions/11-cta.html` | Beat 11 — closing frame |
| `compositions/captions.html` | Caption overlay sub-composition driven by transcript |
| `index.html` | Root composition — orchestrates all sub-comps, narration audio, music bed, captions |
| `hyperframes.json` | Project config (framework name, fps, dimensions) |
| `.gitignore` | Ignore `renders/`, `.hyperframes/`, `node_modules/` |
| `package.json` | Pins HyperFrames version |
| `renders/` | Output MP4s (gitignored) |
| `.hyperframes/` | Lint, animation-map, validate artifacts (gitignored) |

---

## Task 1: Scaffold video workspace

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/` (entire directory via `hyperframes init`)

- [ ] **Step 1.1: Verify HyperFrames environment**

Run:
```bash
node --version  # expect >= v22
which ffmpeg    # expect /opt/homebrew/bin/ffmpeg or similar
npx hyperframes doctor
```
Expected: doctor reports Chrome bundled, FFmpeg found, Node >= 22, memory sufficient. Fix any red flags before continuing.

- [ ] **Step 1.2: Verify parent directory exists and target does not**

Run:
```bash
ls -la /Users/browley/video/ && ls /Users/browley/video/dominos-vip-demo 2>&1 | head -5
```
Expected: `/Users/browley/video/` exists (it does per explored state); `dominos-vip-demo` does **not** exist yet. If it exists, halt and confirm with user before overwriting.

- [ ] **Step 1.3: Scaffold project with `hyperframes init`**

Run:
```bash
cd /Users/browley/video && npx hyperframes init dominos-vip-demo --example swiss-grid --non-interactive
```
Expected: new directory `dominos-vip-demo/` with `index.html`, `compositions/`, `assets/`, `package.json`, `hyperframes.json`, and CLAUDE.md plus skill folders. If `swiss-grid` is unavailable, fall back to `--example blank`.

- [ ] **Step 1.4: Inspect and confirm scaffold**

Run:
```bash
ls -la /Users/browley/video/dominos-vip-demo/ && cat /Users/browley/video/dominos-vip-demo/hyperframes.json
```
Expected: directory populated; `hyperframes.json` shows width 1920, height 1080 (or matches template — confirm before committing).

- [ ] **Step 1.5: Initialize git and write `.gitignore`**

Run:
```bash
cd /Users/browley/video/dominos-vip-demo && git init
```
Then write `/Users/browley/video/dominos-vip-demo/.gitignore`:
```
node_modules/
renders/
.hyperframes/
*.log
.DS_Store
assets/audio/*.wav
assets/audio/*.mp3
assets/captures/*.mp4
```

Rationale: large binaries don't belong in git. We'll keep the `.md` sources, composition HTML, and configs versioned.

- [ ] **Step 1.6: Commit scaffold**

```bash
cd /Users/browley/video/dominos-vip-demo && git add -A && git commit -m "chore: scaffold dominos-vip-demo workspace via hyperframes init"
```

---

## Task 2: Write `DESIGN.md`

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/DESIGN.md`

- [ ] **Step 2.1: Write the file**

Content (exact — the compositions will trace colors and fonts back to this):
```markdown
# DESIGN.md — Domino's VIP Demo Video

Visual identity for the executive demo video. Every composition traces its palette and typography to this file.

## Style Prompt

Executive-grade Swiss Pulse: confident, clean, editorial. High whitespace, tight typographic rhythm, single accent color used sparingly. The brand is Domino's; the message is Segment. Domino's blue leads; red is reserved for the "match" moment. Never maximalist, never noisy.

## Colors

| Role | Hex | Usage |
|---|---|---|
| Domino's Blue | `#0B5CAB` | Primary — titles, key type, pillar numbers |
| Domino's Dark Blue | `#003B73` | Headings, dark backgrounds, architecture stack fills |
| Domino's Red | `#E31837` | Accent — VIP match pulse in Beat 6 only |
| Off-White Canvas | `#F7F7F5` | Primary background |
| Near-Black Text | `#0A0F1E` | Body copy, annotations |
| Muted Neutral | `#6B7280` | Footnotes, secondary labels |
| Cravemark Blue | `#0B5CAB` | Cravemark SVG tints (same as primary) |

## Typography

- **Display / titles:** `"Geist", "Inter", system-ui, sans-serif` — weights 600 / 700
- **Body / annotations:** `"Geist", "Inter", system-ui, sans-serif` — weight 400 / 500
- **Tabular / numeric:** `"Geist Mono", ui-monospace, monospace` with `font-variant-numeric: tabular-nums`
- Minimum rendered sizes: 60px headlines, 24px body, 18px labels, 16px footnotes. Below those = H.264 artifact territory.

## Motion

- Primary easing: `power3.out` for entrances, `sine.inOut` for holds, `power2.inOut` for transitions.
- Entrance offset: never `t=0`; offset first tween 0.1–0.3s so cuts breathe.
- Stagger: 80–160ms between sibling elements — avoid 0ms stacks.
- Transition preset: **smooth** (0.4s `power2.inOut`) as primary; **dramatic** (0.5s) reserved for Beat 6→7 reveal and Beat 10 counter pop.
- Three eases minimum per composition — no single-ease scenes.

## Logos (reference by path — never inline the SVG)

- Primary title mark: `assets/brand/DPZ_2025_Logo_CombinationMark_Horizontal_Blue_RGB.svg`
- Accent: `assets/brand/DPZ_2025_Logo_Cravemark_Blue_RGB.svg`
- Final frame wordmark: `assets/brand/DPZ_2025_Logo_Wordmark_Blue_RGB.svg`

## What NOT to Do

1. No full-screen dark linear gradients (H.264 produces visible banding — use solid or radial).
2. No default generic colors (`#333`, `#3b82f6`, `Roboto`). If you reach for one, re-read this file.
3. No Domino's red outside Beat 6's match pulse — it's the accent, not the theme.
4. No Cravemark at title scale — it's decorative, never the primary mark.
5. No per-scene font family changes — Geist / Geist Mono only.
6. No `translateX(-50%)` / `translateY(-50%)` for centering — GSAP overwrites transform and elements fly offscreen. Use flexbox centering.
```

Rationale: this is the Visual Identity Gate for HyperFrames. Without it, every composition defaults to generic colors.

- [ ] **Step 2.2: Commit**

```bash
cd /Users/browley/video/dominos-vip-demo && git add DESIGN.md && git commit -m "docs: add DESIGN.md with Domino's palette and motion rules"
```

---

## Task 3: Copy brand assets

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/assets/brand/DPZ_2025_Logo_CombinationMark_Horizontal_Blue_RGB.svg`
- Create: `/Users/browley/video/dominos-vip-demo/assets/brand/DPZ_2025_Logo_Cravemark_Blue_RGB.svg`
- Create: `/Users/browley/video/dominos-vip-demo/assets/brand/DPZ_2025_Logo_Wordmark_Blue_RGB.svg`

- [ ] **Step 3.1: Copy (not symlink) the three SVGs**

```bash
mkdir -p /Users/browley/video/dominos-vip-demo/assets/brand
cp /Users/browley/domdemo/DPZ_2025_Logo_CombinationMark_Horizontal_Blue_RGB.svg \
   /Users/browley/domdemo/DPZ_2025_Logo_Cravemark_Blue_RGB.svg \
   /Users/browley/domdemo/DPZ_2025_Logo_Wordmark_Blue_RGB.svg \
   /Users/browley/video/dominos-vip-demo/assets/brand/
```

- [ ] **Step 3.2: Confirm files present and non-empty**

```bash
ls -la /Users/browley/video/dominos-vip-demo/assets/brand/
```
Expected: three SVG files, each > 2KB.

- [ ] **Step 3.3: Commit**

```bash
cd /Users/browley/video/dominos-vip-demo && git add assets/brand && git commit -m "chore: copy Domino's brand SVGs into assets/brand"
```

---

## Task 4: Write `SCRIPT.md` and `narration.txt`

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/SCRIPT.md`
- Create: `/Users/browley/video/dominos-vip-demo/narration.txt`

- [ ] **Step 4.1: Write `SCRIPT.md`**

Purpose: human-readable per-beat reference with beat numbers, targets, and narration. This does NOT go into TTS.

Content:
```markdown
# SCRIPT.md — Domino's VIP Demo Video Narration

~180 words, ~115s at 95 wpm. Voice: `af_nova` (warm, authoritative). Speed 1.0 default.

| # | Beat | Target sec | Line |
|---|------|------------|------|
| 1 | Hook | 6 | Domino's has more than 85 million rewards members. Today, most of them see the same homepage. |
| 2 | Why | 10 | Recognition isn't cosmetic. For VIPs, it's a 22% order-value swing and three times the repeat rate. |
| 3 | Sarah | 12 | Meet Sarah. Twelve orders. Three hundred eighty-six dollars in lifetime spend. Her favorite — Meat Lovers with garlic bread — assembled from events Segment has already captured. |
| 4 | Anon | 10 | Before Sarah signs in, her intent is captured against an anonymous ID. Not lost. Not guessed. |
| 5 | Alias | 12 | The moment she signs in, Segment's alias call merges her anonymous session into her full profile. One customer. One timeline. |
| 6 | Audience | 14 | A real-time audience — not a nightly batch — evaluates against every event. VIP Loyalists: matched, in this session. |
| 7 | Personalization | 14 | And the experience rewrites itself — the hero, the offer, even the cart — before Sarah takes a second action. |
| 8 | Architecture | 18 | Under the hood, five Segment layers. Connections ingests events from every surface. Unify resolves identity. Engage runs audiences in real time. Protocols guards data quality. Personalization delivers the moment. |
| 9 | USP | 14 | Three things set Segment apart. Real time, not batch. One identity across every surface — web, mobile, in-store kiosk. And it's composable — it strengthens the stack Domino's already runs. |
| 10 | Impact | 10 | Twenty-two percent higher order value. Three times the repeat rate. Sub-second response from event to experience. |
| 11 | CTA | 5 | See Sarah's flow live. Link in the description. |

## Tuning notes for TTS

- If line 3 (Sarah) feels rushed on playback, regenerate that segment with `--speed 0.95`.
- If line 8 (Architecture) feels rushed, regenerate with `--speed 0.95`.
- Regenerate as a single WAV only. If splicing is needed later, concatenate WAVs via `ffmpeg -f concat`.

## Citation

Beat 10's footnote attributes stats to "Segment customer benchmarks, real-time audience personalization." Before render, replace this with the exact locatable source URL verified against Segment's published collateral (Fact gate in spec §5).
```

- [ ] **Step 4.2: Write `narration.txt`** (flat input to `hyperframes tts`)

Content (one paragraph, line breaks between sentences for natural pauses):
```
Domino's has more than 85 million rewards members. Today, most of them see the same homepage.
Recognition isn't cosmetic. For VIPs, it's a 22% order-value swing and three times the repeat rate.
Meet Sarah. Twelve orders. Three hundred eighty-six dollars in lifetime spend. Her favorite — Meat Lovers with garlic bread — assembled from events Segment has already captured.
Before Sarah signs in, her intent is captured against an anonymous ID. Not lost. Not guessed.
The moment she signs in, Segment's alias call merges her anonymous session into her full profile. One customer. One timeline.
A real-time audience — not a nightly batch — evaluates against every event. VIP Loyalists: matched, in this session.
And the experience rewrites itself — the hero, the offer, even the cart — before Sarah takes a second action.
Under the hood, five Segment layers. Connections ingests events from every surface. Unify resolves identity. Engage runs audiences in real time. Protocols guards data quality. Personalization delivers the moment.
Three things set Segment apart. Real time, not batch. One identity across every surface — web, mobile, in-store kiosk. And it's composable — it strengthens the stack Domino's already runs.
Twenty-two percent higher order value. Three times the repeat rate. Sub-second response from event to experience.
See Sarah's flow live. Link in the description.
```

- [ ] **Step 4.3: Commit**

```bash
cd /Users/browley/video/dominos-vip-demo && git add SCRIPT.md narration.txt && git commit -m "docs: add narration script and TTS input"
```

---

## Task 5: Generate TTS narration + transcript

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/assets/audio/narration.wav`
- Create: `/Users/browley/video/dominos-vip-demo/assets/audio/transcript.json`

- [ ] **Step 5.1: Generate narration via Kokoro**

```bash
mkdir -p /Users/browley/video/dominos-vip-demo/assets/audio
cd /Users/browley/video/dominos-vip-demo && \
  npx hyperframes tts narration.txt --voice af_nova --output assets/audio/narration.wav
```
Expected: `narration.wav` appears. First run downloads the Kokoro model (~340 MB total) into `~/.cache/hyperframes/tts/`. Subsequent runs are offline.

- [ ] **Step 5.2: Verify duration is inside the 90–120s window**

```bash
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 \
  /Users/browley/video/dominos-vip-demo/assets/audio/narration.wav
```
Expected: a value between `90.0` and `120.0`. If under 90s, narration reads too quickly — regenerate with `--speed 0.95`. If over 120s, tighten lines in `narration.txt` (likely 3 or 8) and re-run Step 5.1.

- [ ] **Step 5.3: Spot-check by playing a 5-second sample**

```bash
afplay /Users/browley/video/dominos-vip-demo/assets/audio/narration.wav -t 5
```
Listen for warmth and intelligibility. If the voice sounds flat, try `--voice af_heart` instead and regenerate.

- [ ] **Step 5.4: Transcribe for word-level timestamps**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  npx hyperframes transcribe assets/audio/narration.wav --model small.en --language en
```
Note: `small.en` is allowed here because narration is English (per spec). Output: `assets/audio/transcript.json` with `[{text, start, end}, ...]` word entries.

- [ ] **Step 5.5: Verify transcript**

```bash
head -c 500 /Users/browley/video/dominos-vip-demo/assets/audio/transcript.json
```
Expected: JSON array starting with a `{"text":"Domino's"` or similar and word-level timestamps.

---

## Task 6: Write `STORYBOARD.md` with real timings

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/STORYBOARD.md`

**Input:** `assets/audio/transcript.json` (from Task 5).

- [ ] **Step 6.1: Compute per-beat start/end from transcript**

The transcript contains word-level timestamps. Each numbered line in `SCRIPT.md` maps to a beat. The start of beat N is the `start` timestamp of its first word; the end of beat N is the `start` timestamp of the first word of beat N+1 (or the final `end` for beat 11).

Write a one-shot Node script to compute beat timings. This script runs once and is discarded — no need to commit it.

```bash
cat > /tmp/beat-timings.mjs <<'EOF'
import { readFileSync } from 'node:fs';
const t = JSON.parse(readFileSync('/Users/browley/video/dominos-vip-demo/assets/audio/transcript.json', 'utf8'));
// Beat boundaries are the first words of each beat (case/punct-insensitive match on first few words).
const beatMarkers = [
  { n: 1,  firstWords: "Domino's has" },
  { n: 2,  firstWords: "Recognition isn't" },
  { n: 3,  firstWords: "Meet Sarah" },
  { n: 4,  firstWords: "Before Sarah" },
  { n: 5,  firstWords: "The moment" },
  { n: 6,  firstWords: "A real-time" },
  { n: 7,  firstWords: "And the experience" },
  { n: 8,  firstWords: "Under the hood" },
  { n: 9,  firstWords: "Three things" },
  { n: 10, firstWords: "Twenty-two percent" },
  { n: 11, firstWords: "See Sarah" },
];
const words = Array.isArray(t) ? t : (t.words || t.segments?.flatMap(s => s.words) || []);
const clean = s => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
function findStartOfPhrase(phrase, fromIdx) {
  const target = clean(phrase).split(/\s+/);
  for (let i = fromIdx; i < words.length - target.length + 1; i++) {
    const window = words.slice(i, i + target.length).map(w => clean(w.text || w.word || ''));
    if (window.join(' ') === target.join(' ')) return words[i].start;
  }
  return null;
}
let cursor = 0;
const out = [];
for (const b of beatMarkers) {
  const start = findStartOfPhrase(b.firstWords, cursor);
  if (start == null) { console.error('MISSING beat', b.n, b.firstWords); process.exit(1); }
  out.push({ beat: b.n, start });
  // advance cursor past this word
  cursor = words.findIndex((w, i) => i >= cursor && w.start === start) + 1;
}
const lastWord = words[words.length - 1];
const total = lastWord.end ?? lastWord.start;
const rows = out.map((r, i) => {
  const end = (i < out.length - 1) ? out[i + 1].start : total;
  return { beat: r.beat, start: r.start.toFixed(2), end: end.toFixed(2), duration: (end - r.start).toFixed(2) };
});
console.log(JSON.stringify({ totalDuration: total.toFixed(2), beats: rows }, null, 2));
EOF
node /tmp/beat-timings.mjs
```

Expected: JSON with `totalDuration` between 90.00 and 120.00 and 11 beat rows with `start`/`end`/`duration`. Copy the numbers into Step 6.2.

- [ ] **Step 6.2: Write `STORYBOARD.md`**

Use the real timings from Step 6.1. Fill in the `start (s)`, `end (s)`, and `duration (s)` columns from the script output — the values below are **placeholders you must replace**.

```markdown
# STORYBOARD.md — Domino's VIP Demo Video

Per-beat creative direction. Beat timings are derived from `assets/audio/transcript.json` (real TTS timing, not estimates). Every composition must trace its palette and typography to `DESIGN.md`.

## Beat Timings (from transcript)

| # | Beat | Start (s) | End (s) | Duration (s) | Composition |
|---|------|-----------|---------|--------------|-------------|
| 1 | Hook | `<from step 6.1>` | `<>` | `<>` | `compositions/01-hook.html` |
| 2 | Why | `<>` | `<>` | `<>` | `compositions/02-problem.html` |
| 3 | Sarah | `<>` | `<>` | `<>` | `compositions/03-sarah-returns.html` |
| 4 | Anon | `<>` | `<>` | `<>` | `compositions/04-anonymous-arrival.html` |
| 5 | Alias | `<>` | `<>` | `<>` | `compositions/05-identification.html` |
| 6 | Audience | `<>` | `<>` | `<>` | `compositions/06-audience-match.html` |
| 7 | Personalization | `<>` | `<>` | `<>` | `compositions/07-personalization.html` |
| 8 | Architecture | `<>` | `<>` | `<>` | `compositions/08-architecture.html` |
| 9 | USP | `<>` | `<>` | `<>` | `compositions/09-usp.html` |
| 10 | Impact | `<>` | `<>` | `<>` | `compositions/10-impact.html` |
| 11 | CTA | `<>` | `<>` | `<>` | `compositions/11-cta.html` |

Total duration: `<totalDuration from step 6.1>` seconds.

---

## Asset Assignments

| Beat | Required footage | Required SVG | Notes |
|------|------------------|--------------|-------|
| 1 | — | `assets/brand/DPZ_2025_Logo_Cravemark_Blue_RGB.svg` (micro-pulse) | Big "85M+" mask-reveal. |
| 2 | — | — | Two-column split; stat chips. |
| 3 | — | — | Persona card; trait pills with source-badges. Freeze-still optional. |
| 4 | `assets/captures/cap-anon-browse.mp4` | — | Annotation arrows over Event Inspector. |
| 5 | `assets/captures/cap-signin-transition.mp4` | — | Before/after timeline merge overlay. |
| 6 | `assets/captures/cap-audience-match.mp4` | — | Rule block overlay lighting up. Domino's red accent pulse. |
| 7 | `assets/captures/cap-vip-homepage.mp4` | — | Three callouts: Hero / Cart / Offer. |
| 8 | `assets/captures/cap-kiosk-brief.mp4` (~1.5s inset) | — | Five-layer stack, electric path synced to narration. |
| 9 | — | — | Three pillars with soft-wipe between. |
| 10 | — | — | Three counter tweens + footnote. |
| 11 | — | `assets/brand/DPZ_2025_Logo_Wordmark_Blue_RGB.svg` | URL + contact line. Cravemark fade. |

## Per-beat creative direction

### Beat 1 — Hook

- **Visual:** Full-bleed off-white canvas. Centered "85M+" in Geist 220px weight 700 Domino's blue, tabular-nums. Sub "One homepage." in 48px weight 500 near-black. Cravemark at 80px below, Domino's blue, 50% opacity.
- **Motion:** Mask-reveal on "85M+" (clip-path top→bottom, 0.55s, `power3.out`, starts at 0.15s). Sub fades up 30px at 0.5s (0.4s, `power2.out`). Cravemark scale-pulse from 0.9 → 1.0 at 0.9s (0.35s, `back.out(1.4)`). Ambient: slow scale 1.00 → 1.02 on "85M+" from 1.5s to end.
- **Transition out:** `flash-through-white` to Beat 2 (0.25s).

### Beat 2 — Why

- **Visual:** Two-column split via clip-path at 50%. Left column: off-white background, near-black headline "Generic homepage". Right column: Domino's blue background, off-white headline "Recognized VIP". Two stat chips rise under the right column: "+22% AOV" and "3× repeat" (Geist Mono 36px, off-white).
- **Motion:** Split reveal via clip-path 0% → 50% (0.5s `power2.out` from 0.2s). Headlines fade up 20px with 120ms stagger. Stat chips rise 30px with 160ms stagger at 3.5s.
- **Transition out:** Push slide left (0.35s `power2.inOut`).

### Beat 3 — Sarah

- **Visual:** Centered persona card on off-white canvas. Rounded card (24px radius) with light shadow, 960×420px. Inside: "Meet Sarah" headline (Geist 72px Domino's blue), sub "Gold Tier · 12 orders · $386 lifetime". Below: trait pills in a 2×3 grid — each pill has a trait ("Gold Tier", "12 orders", "$386 LTV", "$32 AOV", "Meat Lovers + Garlic Bread", "Last order 11d ago"). Each pill shows a source badge in Geist Mono 14px: `identify`, `track: Order Completed`, `computed trait`.
- **Motion:** Card scales in from 0.95 (0.5s `power3.out`, start 0.2s). Headline fades up. Sub fades up 150ms later. Pills reveal with 120ms stagger — each pill's source badge fades in 300ms after its pill (reinforces "source → trait" idea).
- **Transition out:** Blur crossfade (0.45s `sine.inOut`).

### Beat 4 — Anonymous Arrival

- **Visual:** Full-frame `cap-anon-browse.mp4` playing. Three annotation arrows point at the Event Inspector panel as `Page`, `Product List Viewed`, `Hero Banner Clicked` stream in. Bottom-left chip label: "`anonymousId` — intent captured before login" (Geist Mono 28px, Domino's dark-blue on off-white pill).
- **Motion:** Video plays continuously. Arrows SVG-draw in with `strokeDasharray` at the moments each event fires — determine those moments by watching the video once at native speed and noting timestamps. Fallback: 3 evenly-spaced arrows at `duration × [0.25, 0.55, 0.80]` from beat start. Bottom chip fades in at 1.0s after beat start.
- **Transition out:** Smooth crossfade (0.4s `power2.inOut`).

### Beat 5 — Identification

- **Visual:** Full-frame `cap-signin-transition.mp4`. After sign-in completes in the footage, a semi-transparent overlay (near-black 70% opacity) fades in from the midpoint, split 50/50. Left label "Anonymous timeline" with a short list of 3 events. Right label "Unified profile" with the same 3 events merged with Sarah's identified events. Center: `alias()` call pill in Domino's blue that pulses twice.
- **Motion:** Overlay fades in at `duration × 0.45` (1.0s `power2.out`). Left/right panels fade up with 200ms stagger. `alias()` pill pulses twice (scale 1.0 → 1.08 → 1.0, 0.3s each).
- **Transition out:** Smooth crossfade.

### Beat 6 — Real-time Audience

- **Visual:** Full-frame `cap-audience-match.mp4`. Right-side overlay card (480×540px, Domino's dark-blue, 24px radius): three rule lines in Geist Mono 24px off-white:
  - `lifetime_spend ≥ $100`
  - `lifetime_orders ≥ 5`
  - `last_order < 30d`
  Each line has a check-circle that transitions grey → Domino's red as the audience evaluates in the video. Below rules: "VIP Loyalists · MATCHED" in Geist 32px Domino's red.
- **Motion:** Overlay card slides in from the right at 0.3s (0.45s `power3.out`). Rule lines fade up 120ms staggered. Check circles fill sequentially at 2.0s / 3.2s / 4.4s. "MATCHED" label scale-pops at 5.0s (`back.out(1.7)`). Red pulse ring emanates from the MATCHED label at 5.1s.
- **Transition out:** Dramatic zoom (0.5s `power3.inOut`).

### Beat 7 — Personalization

- **Visual:** Full-frame `cap-vip-homepage.mp4`. Three callout labels anchor to on-screen surfaces with thin connector lines:
  - "Hero — from audience membership" → hero banner
  - "Cart — from `preferred_items` computed trait" → cart icon / dropdown
  - "Offer — from tier" → $35.95 combo
  Each callout: off-white pill, Domino's blue text, 22px Geist.
- **Motion:** Callouts fade in with 300ms stagger starting at 1.0s; connector lines SVG-draw from label to target.
- **Transition out:** Smooth crossfade into Beat 8.

### Beat 9 — USP (note: Beat 8 built last; this comes before it in build order)

- **Visual:** Three pillars in sequence (one replaces the previous with a soft wipe).
  - Pillar ① "Real time, not batch." With a clock glyph and "<200ms" latency badge. Domino's blue accent.
  - Pillar ② "One identity across web, mobile, kiosk." Three device silhouettes (SVG, Geist weight 400 line-art) merge into a single profile avatar.
  - Pillar ③ "Composable." Central Segment node with 6 ecosystem chips around it (labels: Snowflake, Braze, Salesforce, Iterable, BigQuery, Amplitude) fading in around the node.
- **Motion:** Pillar ① enters from 0.2s (0.45s `power3.out`). Pillar ① wipes out and Pillar ② wipes in at 33% through the beat; Pillar ② → ③ at 66%. Wipes are `clip-path` 0 → 100%, 0.35s `power2.inOut`.
- **Transition out:** Smooth crossfade.

### Beat 10 — Impact

- **Visual:** Three counters horizontal, centered, on off-white. Labels in Geist 20px muted neutral above each counter; counter values in Geist Mono 144px weight 700 Domino's blue, tabular-nums. Values: `+22%` AOV · `3×` repeat · `<200ms` response. Footnote chip bottom-center in Geist 14px muted neutral: "Segment customer benchmarks, real-time audience personalization."
- **Motion:** Counters tween from 0 with `power3.out` over 1.4s, staggered 180ms. Labels fade up 20px before their counter. Footnote fades in at 2.8s.
- **Transition out:** Smooth crossfade.

### Beat 11 — CTA

- **Visual:** Off-white canvas, centered. Top: Domino's Wordmark (300px wide, Domino's blue). Below: demo URL in Geist Mono 36px near-black. Below: single contact line in Geist 24px muted neutral (placeholder `— contact@domdemo.example` to be replaced before render). Cravemark 120px bottom, 30% opacity, subtle fade.
- **Motion:** Wordmark fades up 20px (0.5s `power3.out`). URL fades up 150ms later. Contact fades up 150ms later. Cravemark pulses once (scale 0.95 → 1.0, 0.4s). Hold for 1.5s. Final 0.8s: everything fades to black.
- **Transition in:** Color dip to off-white (0.35s).

### Beat 8 — Architecture (BUILT LAST)

- **Visual:** Five horizontal stack tiles, left→right, each 280×440px, 20px gaps. Colors: Connections `#0B5CAB` → Unify `#1A6BB8` → Engage `#2878C5` → Protocols `#0B5CAB` → Personalization `#003B73`. Each tile: label top (Geist 26px weight 600 off-white), one-line caption bottom (Geist 16px off-white at 70% opacity). An "electric path" traverses left→right — a thin Domino's-red line segment (`#E31837`, 4px) with a soft glow that advances across the tiles synced to narration. Small source glyphs (web, iOS, Android, kiosk, POS — each a 32px SVG line-art) float into the Connections tile as the word "every surface" is spoken. A ~1.5s inline `cap-kiosk-brief.mp4` inset appears at 240×135px top-right when "kiosk" is spoken.
- **Motion:** Tiles rise in with 100ms stagger at 0.3s. Labels fade in 120ms after each tile. Electric path start time: match the transcript word-time of "Connections". Path crosses each tile boundary at the word-time of each layer name (Connections, Unify, Engage, Protocols, Personalization — use `transcript.json`). Source glyphs fade in synchronized to "every surface" (~120ms stagger). Kiosk inset fades in at the word-time of "kiosk" (1.5s duration, then fades out).
- **Transition out:** Smooth crossfade to Beat 9.
- **Iteration passes:** (a) static tiles, (b) electric path, (c) source-glyph micro-inserts + kiosk inset.
```

- [ ] **Step 6.3: Replace placeholder timings with the real values from Step 6.1**

Open the storyboard and replace every `<from step 6.1>` and `<>` with the numeric values. Failing to do this makes build-time timing incorrect.

- [ ] **Step 6.4: Commit**

```bash
cd /Users/browley/video/dominos-vip-demo && git add STORYBOARD.md && git commit -m "docs: add STORYBOARD.md with real beat timings"
```

---

## Task 7: Produce screen captures

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/assets/captures/cap-anon-browse.mp4`
- Create: `/Users/browley/video/dominos-vip-demo/assets/captures/cap-signin-transition.mp4`
- Create: `/Users/browley/video/dominos-vip-demo/assets/captures/cap-audience-match.mp4`
- Create: `/Users/browley/video/dominos-vip-demo/assets/captures/cap-vip-homepage.mp4`
- Create: `/Users/browley/video/dominos-vip-demo/assets/captures/cap-kiosk-brief.mp4`

**Blocker note:** This task needs a human driving a browser. An agent cannot operate Chrome DevTools' recorder. Until these five MP4s exist, later composition tasks use **placeholder MP4s** generated by Step 7.5 — the final render swaps placeholders out for real captures without composition changes (same filenames, same durations).

- [ ] **Step 7.1: Pre-capture checklist (human-driven)**

1. `cd /Users/browley/domdemo && npm run dev`
2. In another terminal: reseed demo data — `node scripts/seed-demo-user.mjs` (path per `package.json`).
3. Open Chrome; sign in as Sarah via the Demo toolbar → "Load VIP persona".
4. Open the Segment FAB → toggle **Demo overlays ON**.
5. System: light mode. Silence Slack/mail/Calendar. Hide bookmarks bar. Disable extensions (use Guest profile if needed).
6. Record via Chrome DevTools → "More tools" → "Recorder" OR Chrome → Customize → Record screen. Viewport: 1920×1080. Frame rate: 60fps.

- [ ] **Step 7.2: Capture `cap-anon-browse.mp4`** (target: 8s usable)

Start recording. In a fresh incognito window: navigate to `localhost:3000/`; scroll to menu link; navigate to `/menu/pizzas`; hover a pizza card so Event Inspector streams events. Stop after ~10s. Save to `assets/captures/cap-anon-browse.mp4` and trim to 8s with FFmpeg:

```bash
ffmpeg -i /path/to/raw-anon-browse.mp4 -ss 0 -t 8 -c:v libx264 -crf 20 -preset medium \
  -pix_fmt yuv420p -an /Users/browley/video/dominos-vip-demo/assets/captures/cap-anon-browse.mp4
```

- [ ] **Step 7.3: Capture the remaining four clips**

Use the same trim pattern (`-ss 0 -t <duration>`) with durations from the spec:

| File | Duration |
|---|---|
| `cap-signin-transition.mp4` | 10s |
| `cap-audience-match.mp4` | 12s |
| `cap-vip-homepage.mp4` | 12s |
| `cap-kiosk-brief.mp4` | 3s |

Sources (see spec §4):
- Signin: click Login → submit Sarah's creds → land on `/` re-rendered
- Audience: Audiences panel — VIP Loyalists grey → green; Event Inspector `Audience Entered`
- VIP homepage: hero banner, cart icon (2 items), hover cart dropdown with Meat Lovers + Garlic Bread pre-loaded
- Kiosk: `/kiosk` attract → tap → loyalty scan → recognized welcome

- [ ] **Step 7.4: Verify each capture**

```bash
for f in cap-anon-browse cap-signin-transition cap-audience-match cap-vip-homepage cap-kiosk-brief; do
  ffprobe -v error -show_entries stream=width,height,r_frame_rate,codec_name \
    -of default=noprint_wrappers=1 \
    /Users/browley/video/dominos-vip-demo/assets/captures/$f.mp4
done
```
Expected: each is H.264 (`codec_name=h264`), 1920×1080, 30/60fps. Re-encode if not.

- [ ] **Step 7.5: (Fallback only) Generate placeholder MP4s**

If captures don't exist yet, run this to unblock composition building. Labeled solid-color MP4s satisfy the `<video>` contract; they'll be overwritten by the real captures before final render.

```bash
mkdir -p /Users/browley/video/dominos-vip-demo/assets/captures
cd /Users/browley/video/dominos-vip-demo/assets/captures
declare -a jobs=(
  "cap-anon-browse.mp4:8:0x0B5CAB:ANON BROWSE PLACEHOLDER"
  "cap-signin-transition.mp4:10:0x003B73:SIGNIN TRANSITION PLACEHOLDER"
  "cap-audience-match.mp4:12:0x1A6BB8:AUDIENCE MATCH PLACEHOLDER"
  "cap-vip-homepage.mp4:12:0x2878C5:VIP HOMEPAGE PLACEHOLDER"
  "cap-kiosk-brief.mp4:3:0x0A0F1E:KIOSK BRIEF PLACEHOLDER"
)
for j in "${jobs[@]}"; do
  IFS=":" read -r file dur color label <<< "$j"
  ffmpeg -y -f lavfi -i "color=c=${color/0x/#}:s=1920x1080:d=${dur}:r=30" \
    -vf "drawtext=text='${label}':fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" \
    -c:v libx264 -crf 20 -pix_fmt yuv420p -an "$file"
done
```

- [ ] **Step 7.6: Commit (captures are gitignored — commit the empty directory marker)**

```bash
touch /Users/browley/video/dominos-vip-demo/assets/captures/.gitkeep
cd /Users/browley/video/dominos-vip-demo && git add assets/captures/.gitkeep && \
  git commit -m "chore: stage captures directory (binaries gitignored)"
```

---

## Composition Tasks 8–18 — Shared Conventions

These apply to every composition task. Don't repeat them inline.

**Sub-composition wrapper pattern** (HyperFrames rule — standalone compositions do NOT use `<template>`; sub-compositions loaded via `data-composition-src` DO):

```html
<!doctype html>
<template id="COMP_ID-template">
  <div data-composition-id="COMP_ID" data-start="0" data-duration="DURATION" data-width="1920" data-height="1080">
    <style>
      [data-composition-id="COMP_ID"] { /* scoped styles */ }
    </style>
    <!-- content -->
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      (function () {
        const tl = gsap.timeline({ paused: true });
        /* tweens */
        window.__timelines["COMP_ID"] = tl;
      })();
    </script>
  </div>
</template>
```

Replace `COMP_ID` with the composition's id (e.g. `beat-1-hook`) and `DURATION` with the real seconds from `STORYBOARD.md`.

**Non-negotiables** (from the hyperframes skill; violations break renders):
- Timelines `{ paused: true }`, registered on `window.__timelines[id]`.
- No `Math.random()` / `Date.now()` — determinism required.
- No `repeat: -1` — compute exact repeat count.
- Layout end-state first via flexbox + padding in `.scene-content` (`width: 100%; height: 100%; padding; display: flex; box-sizing: border-box`). **Never** position content containers with `position: absolute; top/left`.
- Never use `translate(-50%, -50%)` / `translateX(-50%)` / `translateY(-50%)` for centering — GSAP overwrites `transform`. Use flexbox centering on a wrapper.
- `width: 100%; height: 100%` on the composition root div (not fixed pixel dimensions) so compositions scale cleanly.
- Only entrance animations (`gsap.from`) inside compositions, except the final scene (Beat 11) which may `gsap.to(..., opacity: 0)` for the fade-out.
- After writing: `npx hyperframes lint` on the workspace; fix errors before committing.

**Per-composition commit message:** `feat(comp): add beat N <name>`

---

## Task 8: Beat 1 — Hook composition

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/compositions/01-hook.html`

**Beat duration:** use real duration from STORYBOARD (spec target: 6s). Below code uses `6` — replace with the real value.

- [ ] **Step 8.1: Write `01-hook.html`**

```html
<!doctype html>
<template id="beat-1-hook-template">
  <div data-composition-id="beat-1-hook" data-start="0" data-duration="6" data-width="1920" data-height="1080">
    <style>
      [data-composition-id="beat-1-hook"] {
        width: 100%;
        height: 100%;
        background: #F7F7F5;
        font-family: "Geist", "Inter", system-ui, sans-serif;
        color: #0A0F1E;
        position: relative;
      }
      [data-composition-id="beat-1-hook"] .scene-content {
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: 120px; box-sizing: border-box; gap: 40px;
      }
      [data-composition-id="beat-1-hook"] .hero {
        font-size: 220px; font-weight: 700; color: #0B5CAB;
        line-height: 1; letter-spacing: -0.03em;
        font-variant-numeric: tabular-nums;
        clip-path: inset(0 0 100% 0);
      }
      [data-composition-id="beat-1-hook"] .sub {
        font-size: 48px; font-weight: 500; color: #0A0F1E;
        opacity: 0; transform: translateY(30px);
      }
      [data-composition-id="beat-1-hook"] .craveframe {
        width: 80px; height: 80px;
        transform: scale(0.9); opacity: 0;
      }
    </style>
    <div class="scene-content">
      <div class="hero" id="h1-hero">85M+</div>
      <div class="sub" id="h1-sub">One homepage.</div>
      <img class="craveframe" id="h1-crave" src="../assets/brand/DPZ_2025_Logo_Cravemark_Blue_RGB.svg" alt="" crossorigin="anonymous"/>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      (function () {
        const tl = gsap.timeline({ paused: true });
        tl.to("#h1-hero", { clipPath: "inset(0 0 0% 0)", duration: 0.55, ease: "power3.out" }, 0.15);
        tl.to("#h1-sub", { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.5);
        tl.to("#h1-crave", { scale: 1.0, opacity: 1, duration: 0.35, ease: "back.out(1.4)" }, 0.9);
        tl.to("#h1-hero", { scale: 1.02, duration: 4.5, ease: "sine.inOut" }, 1.5);
        window.__timelines["beat-1-hook"] = tl;
      })();
    </script>
  </div>
</template>
```

- [ ] **Step 8.2: Lint**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint
```
Expected: no errors on `01-hook.html`. Warnings about the root `index.html` (which doesn't exist yet) are expected and ignored until Task 19.

- [ ] **Step 8.3: Commit**

```bash
cd /Users/browley/video/dominos-vip-demo && git add compositions/01-hook.html && \
  git commit -m "feat(comp): add beat 1 hook"
```

---

## Task 9: Beat 2 — Problem composition

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/compositions/02-problem.html`

**Beat duration:** target 10s. Replace `10` below with the real value.

- [ ] **Step 9.1: Write `02-problem.html`**

```html
<!doctype html>
<template id="beat-2-problem-template">
  <div data-composition-id="beat-2-problem" data-start="0" data-duration="10" data-width="1920" data-height="1080">
    <style>
      [data-composition-id="beat-2-problem"] {
        width: 100%; height: 100%;
        font-family: "Geist", "Inter", system-ui, sans-serif;
        position: relative; overflow: hidden;
      }
      [data-composition-id="beat-2-problem"] .left,
      [data-composition-id="beat-2-problem"] .right {
        position: absolute; top: 0; width: 50%; height: 100%;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: 120px; box-sizing: border-box; gap: 40px;
      }
      [data-composition-id="beat-2-problem"] .left { left: 0; background: #F7F7F5; color: #0A0F1E; }
      [data-composition-id="beat-2-problem"] .right { right: 0; background: #0B5CAB; color: #F7F7F5;
        clip-path: inset(0 100% 0 0); }
      [data-composition-id="beat-2-problem"] h2 {
        font-size: 72px; font-weight: 700; line-height: 1.1;
        text-align: center; opacity: 0; transform: translateY(20px);
      }
      [data-composition-id="beat-2-problem"] .chip {
        font-family: "Geist Mono", ui-monospace, monospace;
        font-size: 36px; font-weight: 600;
        padding: 14px 28px; border-radius: 999px;
        background: rgba(247,247,245,0.12); color: #F7F7F5;
        border: 1px solid rgba(247,247,245,0.3);
        opacity: 0; transform: translateY(30px);
        font-variant-numeric: tabular-nums;
      }
    </style>
    <div class="left">
      <h2 id="p2-left-h">Generic homepage</h2>
    </div>
    <div class="right" id="p2-right">
      <h2 id="p2-right-h">Recognized VIP</h2>
      <div class="chip" id="p2-chip-1">+22% AOV</div>
      <div class="chip" id="p2-chip-2">3× repeat</div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      (function () {
        const tl = gsap.timeline({ paused: true });
        tl.to("#p2-right", { clipPath: "inset(0 0% 0 0)", duration: 0.5, ease: "power2.out" }, 0.2);
        tl.to("#p2-left-h", { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.3);
        tl.to("#p2-right-h", { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.5);
        tl.to("#p2-chip-1", { opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.2)" }, 3.5);
        tl.to("#p2-chip-2", { opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.2)" }, 3.66);
        window.__timelines["beat-2-problem"] = tl;
      })();
    </script>
  </div>
</template>
```

- [ ] **Step 9.2: Lint**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint compositions/02-problem.html
```

- [ ] **Step 9.3: Commit**

```bash
cd /Users/browley/video/dominos-vip-demo && git add compositions/02-problem.html && \
  git commit -m "feat(comp): add beat 2 problem split"
```

---

## Task 10: Beat 3 — Sarah persona composition

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/compositions/03-sarah-returns.html`

**Beat duration:** target 12s. Replace `12` with real value.

- [ ] **Step 10.1: Write `03-sarah-returns.html`**

```html
<!doctype html>
<template id="beat-3-sarah-template">
  <div data-composition-id="beat-3-sarah" data-start="0" data-duration="12" data-width="1920" data-height="1080">
    <style>
      [data-composition-id="beat-3-sarah"] {
        width: 100%; height: 100%; background: #F7F7F5;
        font-family: "Geist", "Inter", system-ui, sans-serif;
        color: #0A0F1E;
      }
      [data-composition-id="beat-3-sarah"] .scene-content {
        width: 100%; height: 100%;
        display: flex; align-items: center; justify-content: center;
        padding: 80px; box-sizing: border-box;
      }
      [data-composition-id="beat-3-sarah"] .card {
        width: 1440px; padding: 72px 80px;
        background: #FFFFFF; border-radius: 28px;
        box-shadow: 0 24px 60px rgba(10,15,30,0.08);
        opacity: 0; transform: scale(0.95);
      }
      [data-composition-id="beat-3-sarah"] h1 {
        font-size: 80px; font-weight: 700; color: #0B5CAB;
        line-height: 1; margin: 0 0 12px 0;
        opacity: 0; transform: translateY(20px);
      }
      [data-composition-id="beat-3-sarah"] .sub {
        font-size: 30px; font-weight: 500; color: #6B7280;
        margin: 0 0 48px 0; opacity: 0; transform: translateY(20px);
      }
      [data-composition-id="beat-3-sarah"] .grid {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
      }
      [data-composition-id="beat-3-sarah"] .pill {
        background: #F7F7F5; border-radius: 16px; padding: 20px 24px;
        opacity: 0; transform: translateY(20px);
      }
      [data-composition-id="beat-3-sarah"] .pill .trait {
        font-size: 28px; font-weight: 600; color: #0A0F1E; margin-bottom: 6px;
      }
      [data-composition-id="beat-3-sarah"] .pill .src {
        font-family: "Geist Mono", ui-monospace, monospace;
        font-size: 14px; color: #0B5CAB; opacity: 0;
      }
    </style>
    <div class="scene-content">
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

- [ ] **Step 10.2: Lint & commit**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint compositions/03-sarah-returns.html && \
  git add compositions/03-sarah-returns.html && \
  git commit -m "feat(comp): add beat 3 Sarah persona card"
```

---

## Task 11: Beat 4 — Anonymous Arrival composition (footage-wrapped)

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/compositions/04-anonymous-arrival.html`

**Beat duration:** target 10s. Replace `10` with real value.

- [ ] **Step 11.1: Write `04-anonymous-arrival.html`**

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
      [data-composition-id="beat-4-anon"] video {
        position: absolute; top: 0; left: 0;
        width: 100%; height: 100%; object-fit: cover;
      }
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
        position: absolute; width: 160px; height: 60px;
        top: 120px; right: 480px; z-index: 10;
      }
      [data-composition-id="beat-4-anon"] .arrow svg { width: 100%; height: 100%; }
      [data-composition-id="beat-4-anon"] .arrow path {
        fill: none; stroke: #E31837; stroke-width: 5; stroke-linecap: round;
        stroke-dasharray: 220; stroke-dashoffset: 220;
      }
      [data-composition-id="beat-4-anon"] #a4-arrow-2 { top: 260px; }
      [data-composition-id="beat-4-anon"] #a4-arrow-3 { top: 400px; }
    </style>
    <video id="a4-video" data-start="0" data-duration="10" data-track-index="0"
           src="../assets/captures/cap-anon-browse.mp4" muted playsinline></video>
    <div class="arrow" id="a4-arrow-1">
      <svg viewBox="0 0 160 60"><path d="M10,30 L140,30 M130,20 L150,30 L130,40"/></svg>
    </div>
    <div class="arrow" id="a4-arrow-2">
      <svg viewBox="0 0 160 60"><path d="M10,30 L140,30 M130,20 L150,30 L130,40"/></svg>
    </div>
    <div class="arrow" id="a4-arrow-3">
      <svg viewBox="0 0 160 60"><path d="M10,30 L140,30 M130,20 L150,30 L130,40"/></svg>
    </div>
    <div class="chip" id="a4-chip">anonymousId — intent captured before login</div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      (function () {
        const tl = gsap.timeline({ paused: true });
        tl.to("#a4-arrow-1 path", { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, 2.5);
        tl.to("#a4-arrow-2 path", { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, 5.5);
        tl.to("#a4-arrow-3 path", { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, 8.0);
        tl.to("#a4-chip", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 1.0);
        window.__timelines["beat-4-anon"] = tl;
      })();
    </script>
  </div>
</template>
```

- [ ] **Step 11.2: Lint & commit**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint compositions/04-anonymous-arrival.html && \
  git add compositions/04-anonymous-arrival.html && \
  git commit -m "feat(comp): add beat 4 anonymous arrival"
```

---

## Task 12: Beat 5 — Identification composition (footage-wrapped)

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/compositions/05-identification.html`

**Beat duration:** target 12s.

- [ ] **Step 12.1: Write `05-identification.html`**

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
      [data-composition-id="beat-5-ident"] video {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;
      }
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
        padding: 18px 30px; border-radius: 14px;
        box-shadow: 0 0 0 rgba(11,92,171,0);
        opacity: 0;
      }
    </style>
    <video id="i5-video" data-start="0" data-duration="12" data-track-index="0"
           src="../assets/captures/cap-signin-transition.mp4" muted playsinline></video>
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

- [ ] **Step 12.2: Lint & commit**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint compositions/05-identification.html && \
  git add compositions/05-identification.html && \
  git commit -m "feat(comp): add beat 5 identification alias overlay"
```

---

## Task 13: Beat 6 — Audience Match composition (footage-wrapped)

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/compositions/06-audience-match.html`

**Beat duration:** target 14s.

- [ ] **Step 13.1: Write `06-audience-match.html`**

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
      [data-composition-id="beat-6-aud"] video {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;
      }
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
    <video id="au6-video" data-start="0" data-duration="14" data-track-index="0"
           src="../assets/captures/cap-audience-match.mp4" muted playsinline></video>
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

- [ ] **Step 13.2: Lint & commit**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint compositions/06-audience-match.html && \
  git add compositions/06-audience-match.html && \
  git commit -m "feat(comp): add beat 6 audience match rule overlay"
```

---

## Task 14: Beat 7 — Personalization composition (footage-wrapped)

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/compositions/07-personalization.html`

**Beat duration:** target 14s.

- [ ] **Step 14.1: Write `07-personalization.html`**

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
      [data-composition-id="beat-7-pers"] video {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;
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
    <video id="p7-video" data-start="0" data-duration="14" data-track-index="0"
           src="../assets/captures/cap-vip-homepage.mp4" muted playsinline></video>
    <div class="callout" id="p7-c1">Hero — from audience membership</div>
    <div class="callout" id="p7-c2">Cart — from preferred_items computed trait</div>
    <div class="callout" id="p7-c3">Offer — from tier</div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      (function () {
        const tl = gsap.timeline({ paused: true });
        tl.to("#p7-c1", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 1.0);
        tl.to("#p7-c2", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 1.3);
        tl.to("#p7-c3", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 1.6);
        window.__timelines["beat-7-pers"] = tl;
      })();
    </script>
  </div>
</template>
```

- [ ] **Step 14.2: Lint & commit**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint compositions/07-personalization.html && \
  git add compositions/07-personalization.html && \
  git commit -m "feat(comp): add beat 7 personalization callouts"
```

---

## Task 15: Beat 9 — USP composition (built BEFORE Beat 8)

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/compositions/09-usp.html`

**Beat duration:** target 14s. Replace `14` and the three pillar start/exit times (derived as `duration × 0/0.33/0.66`) once real duration is known.

- [ ] **Step 15.1: Write `09-usp.html`**

```html
<!doctype html>
<template id="beat-9-usp-template">
  <div data-composition-id="beat-9-usp" data-start="0" data-duration="14" data-width="1920" data-height="1080">
    <style>
      [data-composition-id="beat-9-usp"] {
        width: 100%; height: 100%; background: #F7F7F5;
        font-family: "Geist", "Inter", system-ui, sans-serif; color: #0A0F1E;
        position: relative;
      }
      [data-composition-id="beat-9-usp"] .pillar {
        position: absolute; inset: 0;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: 120px; box-sizing: border-box; gap: 32px;
        clip-path: inset(0 100% 0 0);
      }
      [data-composition-id="beat-9-usp"] .num {
        font-family: "Geist Mono", ui-monospace, monospace;
        font-size: 42px; font-weight: 700; color: #0B5CAB;
      }
      [data-composition-id="beat-9-usp"] .headline {
        font-size: 96px; font-weight: 700; line-height: 1.05;
        text-align: center; max-width: 1400px; color: #0A0F1E;
      }
      [data-composition-id="beat-9-usp"] .badge {
        font-family: "Geist Mono", ui-monospace, monospace;
        font-size: 28px; font-weight: 600;
        padding: 14px 24px; border-radius: 999px;
        background: #0B5CAB; color: #F7F7F5;
      }
      [data-composition-id="beat-9-usp"] .devices {
        display: flex; gap: 48px; align-items: center;
        font-size: 36px; color: #0B5CAB;
      }
      [data-composition-id="beat-9-usp"] .eco {
        display: grid; grid-template-columns: repeat(3, auto); gap: 16px 28px;
        font-family: "Geist Mono", ui-monospace, monospace;
        font-size: 22px; color: #003B73;
      }
      [data-composition-id="beat-9-usp"] .eco span {
        background: #FFFFFF; padding: 10px 20px; border-radius: 10px;
        border: 1px solid rgba(11,92,171,0.15);
      }
    </style>
    <div class="pillar" id="u9-p1">
      <div class="num">01</div>
      <div class="headline">Real time, not batch.</div>
      <div class="badge">&lt;200ms latency</div>
    </div>
    <div class="pillar" id="u9-p2">
      <div class="num">02</div>
      <div class="headline">One identity across web, mobile, and in-store kiosk.</div>
      <div class="devices"><span>◻︎ web</span><span>▢ mobile</span><span>▣ kiosk</span></div>
    </div>
    <div class="pillar" id="u9-p3">
      <div class="num">03</div>
      <div class="headline">Composable — strengthens the stack Domino's already runs.</div>
      <div class="eco">
        <span>Snowflake</span><span>Braze</span><span>Salesforce</span>
        <span>Iterable</span><span>BigQuery</span><span>Amplitude</span>
      </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      (function () {
        const DUR = 14;
        const tl = gsap.timeline({ paused: true });
        tl.to("#u9-p1", { clipPath: "inset(0 0% 0 0)", duration: 0.35, ease: "power2.inOut" }, 0.2);
        tl.to("#u9-p1", { clipPath: "inset(0 0 0 100%)", duration: 0.35, ease: "power2.inOut" }, DUR * 0.33);
        tl.to("#u9-p2", { clipPath: "inset(0 0% 0 0)", duration: 0.35, ease: "power2.inOut" }, DUR * 0.33 + 0.05);
        tl.to("#u9-p2", { clipPath: "inset(0 0 0 100%)", duration: 0.35, ease: "power2.inOut" }, DUR * 0.66);
        tl.to("#u9-p3", { clipPath: "inset(0 0% 0 0)", duration: 0.35, ease: "power2.inOut" }, DUR * 0.66 + 0.05);
        window.__timelines["beat-9-usp"] = tl;
      })();
    </script>
  </div>
</template>
```

- [ ] **Step 15.2: Lint & commit**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint compositions/09-usp.html && \
  git add compositions/09-usp.html && git commit -m "feat(comp): add beat 9 USP pillars"
```

---

## Task 16: Beat 10 — Impact composition

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/compositions/10-impact.html`

**Beat duration:** target 10s.

- [ ] **Step 16.1: Write `10-impact.html`**

```html
<!doctype html>
<template id="beat-10-impact-template">
  <div data-composition-id="beat-10-impact" data-start="0" data-duration="10" data-width="1920" data-height="1080">
    <style>
      [data-composition-id="beat-10-impact"] {
        width: 100%; height: 100%; background: #F7F7F5;
        font-family: "Geist", "Inter", system-ui, sans-serif; color: #0A0F1E;
      }
      [data-composition-id="beat-10-impact"] .scene-content {
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: 120px; box-sizing: border-box; gap: 60px;
      }
      [data-composition-id="beat-10-impact"] .row {
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 80px; width: 100%;
      }
      [data-composition-id="beat-10-impact"] .stat {
        display: flex; flex-direction: column; align-items: center; gap: 18px;
      }
      [data-composition-id="beat-10-impact"] .label {
        font-size: 22px; font-weight: 500; color: #6B7280;
        letter-spacing: 0.1em; text-transform: uppercase;
        opacity: 0; transform: translateY(20px);
      }
      [data-composition-id="beat-10-impact"] .value {
        font-family: "Geist Mono", ui-monospace, monospace;
        font-size: 144px; font-weight: 700; color: #0B5CAB;
        line-height: 1; font-variant-numeric: tabular-nums;
      }
      [data-composition-id="beat-10-impact"] .footnote {
        font-size: 18px; color: #6B7280; opacity: 0;
        padding: 10px 20px; border: 1px solid rgba(107,114,128,0.3); border-radius: 999px;
      }
    </style>
    <div class="scene-content">
      <div class="row">
        <div class="stat">
          <div class="label" id="im-l1">Order value</div>
          <div class="value"><span id="im-v1">0</span>%</div>
        </div>
        <div class="stat">
          <div class="label" id="im-l2">Repeat rate</div>
          <div class="value"><span id="im-v2">0</span>×</div>
        </div>
        <div class="stat">
          <div class="label" id="im-l3">Response</div>
          <div class="value">&lt;<span id="im-v3">0</span>ms</div>
        </div>
      </div>
      <div class="footnote" id="im-foot">Segment customer benchmarks · real-time audience personalization</div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      (function () {
        const tl = gsap.timeline({ paused: true });
        tl.to("#im-l1", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.2);
        tl.to("#im-l2", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.38);
        tl.to("#im-l3", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.56);
        const v1 = { n: 0 }, v2 = { n: 0 }, v3 = { n: 0 };
        tl.to(v1, { n: 22, duration: 1.4, ease: "power3.out",
          onUpdate: () => { document.getElementById("im-v1").textContent = "+" + Math.round(v1.n); } }, 0.7);
        tl.to(v2, { n: 3, duration: 1.4, ease: "power3.out",
          onUpdate: () => { document.getElementById("im-v2").textContent = Math.round(v2.n); } }, 0.88);
        tl.to(v3, { n: 200, duration: 1.4, ease: "power3.out",
          onUpdate: () => { document.getElementById("im-v3").textContent = Math.round(v3.n); } }, 1.06);
        tl.to("#im-foot", { opacity: 1, duration: 0.5, ease: "sine.out" }, 2.8);
        window.__timelines["beat-10-impact"] = tl;
      })();
    </script>
  </div>
</template>
```

- [ ] **Step 16.2: Lint & commit**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint compositions/10-impact.html && \
  git add compositions/10-impact.html && git commit -m "feat(comp): add beat 10 impact counters"
```

---

## Task 17: Beat 11 — CTA composition (final scene — fade-to-black allowed)

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/compositions/11-cta.html`

**Beat duration:** target 5s.

- [ ] **Step 17.1: Write `11-cta.html`**

Before writing, confirm the demo URL and contact line with the user. Placeholders below: `https://demo.example.com` and `— contact@example.com`.

```html
<!doctype html>
<template id="beat-11-cta-template">
  <div data-composition-id="beat-11-cta" data-start="0" data-duration="5" data-width="1920" data-height="1080">
    <style>
      [data-composition-id="beat-11-cta"] {
        width: 100%; height: 100%; background: #F7F7F5;
        font-family: "Geist", "Inter", system-ui, sans-serif; color: #0A0F1E;
        position: relative;
      }
      [data-composition-id="beat-11-cta"] .scene-content {
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: 120px; box-sizing: border-box; gap: 36px;
      }
      [data-composition-id="beat-11-cta"] .wordmark {
        width: 360px; opacity: 0; transform: translateY(20px);
      }
      [data-composition-id="beat-11-cta"] .url {
        font-family: "Geist Mono", ui-monospace, monospace;
        font-size: 40px; color: #0A0F1E; font-weight: 600;
        opacity: 0; transform: translateY(20px);
      }
      [data-composition-id="beat-11-cta"] .contact {
        font-size: 24px; color: #6B7280;
        opacity: 0; transform: translateY(20px);
      }
      [data-composition-id="beat-11-cta"] .crave {
        position: absolute; bottom: 80px; width: 120px; opacity: 0; transform: scale(0.95);
      }
      [data-composition-id="beat-11-cta"] .fade {
        position: absolute; inset: 0; background: #000000;
        opacity: 0; pointer-events: none; z-index: 100;
      }
    </style>
    <div class="scene-content">
      <img class="wordmark" id="cta-word" src="../assets/brand/DPZ_2025_Logo_Wordmark_Blue_RGB.svg" alt="" crossorigin="anonymous"/>
      <div class="url" id="cta-url">https://demo.example.com</div>
      <div class="contact" id="cta-contact">— contact@example.com</div>
    </div>
    <img class="crave" id="cta-crave" src="../assets/brand/DPZ_2025_Logo_Cravemark_Blue_RGB.svg" alt="" crossorigin="anonymous"/>
    <div class="fade" id="cta-fade"></div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      (function () {
        const tl = gsap.timeline({ paused: true });
        tl.to("#cta-word", { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.2);
        tl.to("#cta-url", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.4);
        tl.to("#cta-contact", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.6);
        tl.to("#cta-crave", { opacity: 0.3, scale: 1.0, duration: 0.4, ease: "power2.out" }, 0.8);
        tl.to("#cta-fade", { opacity: 1, duration: 0.8, ease: "power2.in" }, 4.2);
        window.__timelines["beat-11-cta"] = tl;
      })();
    </script>
  </div>
</template>
```

- [ ] **Step 17.2: Lint & commit**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint compositions/11-cta.html && \
  git add compositions/11-cta.html && git commit -m "feat(comp): add beat 11 CTA closing"
```

---

## Task 18: Beat 8 — Architecture composition (built LAST, iterated 3 passes)

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/compositions/08-architecture.html`

**Beat duration:** target 18s. This beat is the differentiator per spec §5 Risk #3.

### Pass A — Static five tiles

- [ ] **Step 18.1: Write Pass A**

```html
<!doctype html>
<template id="beat-8-arch-template">
  <div data-composition-id="beat-8-arch" data-start="0" data-duration="18" data-width="1920" data-height="1080">
    <style>
      [data-composition-id="beat-8-arch"] {
        width: 100%; height: 100%; background: #F7F7F5;
        font-family: "Geist", "Inter", system-ui, sans-serif; color: #0A0F1E;
      }
      [data-composition-id="beat-8-arch"] .scene-content {
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: 120px; box-sizing: border-box; gap: 60px;
      }
      [data-composition-id="beat-8-arch"] .title {
        font-size: 42px; font-weight: 600; color: #003B73;
      }
      [data-composition-id="beat-8-arch"] .stack {
        display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px;
        width: 100%; position: relative;
      }
      [data-composition-id="beat-8-arch"] .tile {
        height: 440px; border-radius: 20px; padding: 28px;
        display: flex; flex-direction: column; justify-content: space-between;
        color: #F7F7F5; opacity: 0; transform: translateY(30px);
      }
      [data-composition-id="beat-8-arch"] .tile .label {
        font-size: 26px; font-weight: 600;
      }
      [data-composition-id="beat-8-arch"] .tile .cap {
        font-size: 16px; opacity: 0.75;
      }
      [data-composition-id="beat-8-arch"] #t1 { background: #0B5CAB; }
      [data-composition-id="beat-8-arch"] #t2 { background: #1A6BB8; }
      [data-composition-id="beat-8-arch"] #t3 { background: #2878C5; }
      [data-composition-id="beat-8-arch"] #t4 { background: #0B5CAB; }
      [data-composition-id="beat-8-arch"] #t5 { background: #003B73; }
      [data-composition-id="beat-8-arch"] .path {
        position: absolute; left: 0; top: 50%; width: 0; height: 4px;
        background: #E31837; box-shadow: 0 0 12px rgba(227,24,55,0.6);
        transform: translateY(-50%); border-radius: 2px; z-index: 2;
      }
      [data-composition-id="beat-8-arch"] .kiosk-inset {
        position: absolute; right: -20px; top: -170px;
        width: 240px; height: 135px; border-radius: 10px; overflow: hidden;
        box-shadow: 0 10px 24px rgba(10,15,30,0.25);
        opacity: 0; z-index: 3;
      }
      [data-composition-id="beat-8-arch"] .kiosk-inset video {
        width: 100%; height: 100%; object-fit: cover;
      }
    </style>
    <div class="scene-content">
      <div class="title">The Segment stack — five layers.</div>
      <div class="stack">
        <div class="tile" id="t1"><div class="label">Connections</div><div class="cap">Sources: web · iOS · Android · kiosk · POS</div></div>
        <div class="tile" id="t2"><div class="label">Unify</div><div class="cap">Identity resolution into one profile</div></div>
        <div class="tile" id="t3"><div class="label">Engage</div><div class="cap">Real-time audiences + computed traits</div></div>
        <div class="tile" id="t4"><div class="label">Protocols</div><div class="cap">Tracking-plan governance</div></div>
        <div class="tile" id="t5"><div class="label">Personalization</div><div class="cap">Deliver the moment</div></div>
        <div class="path" id="arch-path"></div>
        <div class="kiosk-inset" id="arch-kiosk">
          <video data-start="0" data-duration="1.6" data-track-index="1" src="../assets/captures/cap-kiosk-brief.mp4" muted playsinline></video>
        </div>
      </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      (function () {
        const tl = gsap.timeline({ paused: true });
        tl.to("#t1", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.3);
        tl.to("#t2", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.4);
        tl.to("#t3", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.5);
        tl.to("#t4", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.6);
        tl.to("#t5", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.7);
        window.__timelines["beat-8-arch"] = tl;
      })();
    </script>
  </div>
</template>
```

- [ ] **Step 18.2: Lint & commit Pass A**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint compositions/08-architecture.html && \
  git add compositions/08-architecture.html && \
  git commit -m "feat(comp): add beat 8 architecture — pass A static tiles"
```

### Pass B — Electric path synced to narration word-timing

- [ ] **Step 18.3: Extract Connections/Unify/Engage/Protocols/Personalization word-start times**

Read `assets/audio/transcript.json`. Find the first occurrence of each layer name and record its `start` time (in seconds, absolute to the whole narration). Subtract Beat 8's own `start` from STORYBOARD.md to get beat-local times. Call them `tConn`, `tUnify`, `tEngage`, `tProto`, `tPers`.

- [ ] **Step 18.4: Replace the script block with Pass B**

Replace the inner `(function () { ... })();` body inside `08-architecture.html` with the following, substituting real times for `<tConn>`..`<tPers>`:

```js
const tl = gsap.timeline({ paused: true });
tl.to("#t1", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.3);
tl.to("#t2", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.4);
tl.to("#t3", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.5);
tl.to("#t4", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.6);
tl.to("#t5", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.7);
// Electric path advances one tile per layer word.
// Stack uses 5 equal columns + 4 gaps of 20px inside ~1680px wide container.
// We tween the path element's width as a % of the stack container.
tl.set("#arch-path", { width: "0%" });
tl.to("#arch-path", { width: "20%",  duration: 0.5, ease: "power2.out" }, /* tConn  */ 1.0);
tl.to("#arch-path", { width: "40%",  duration: 0.5, ease: "power2.out" }, /* tUnify */ 4.2);
tl.to("#arch-path", { width: "60%",  duration: 0.5, ease: "power2.out" }, /* tEngage*/ 7.4);
tl.to("#arch-path", { width: "80%",  duration: 0.5, ease: "power2.out" }, /* tProto */ 11.0);
tl.to("#arch-path", { width: "100%", duration: 0.5, ease: "power2.out" }, /* tPers  */ 14.2);
window.__timelines["beat-8-arch"] = tl;
```

- [ ] **Step 18.5: Lint & commit Pass B**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint compositions/08-architecture.html && \
  git add compositions/08-architecture.html && \
  git commit -m "feat(comp): beat 8 pass B — electric path synced to layer words"
```

### Pass C — Kiosk inset on the word "kiosk"

- [ ] **Step 18.6: Find the word-time of "kiosk"**

From `transcript.json`, find the first `start` timestamp for the word `kiosk`. Convert to beat-local time (`tKiosk = absolute - beat8Start`).

- [ ] **Step 18.7: Add kiosk-inset tweens**

Append to the timeline in `08-architecture.html` (before `window.__timelines[...]`):

```js
tl.to("#arch-kiosk", { opacity: 1, duration: 0.3, ease: "power2.out" }, /* tKiosk */ 10.8);
tl.to("#arch-kiosk", { opacity: 0, duration: 0.3, ease: "power2.in"  }, /* tKiosk + 1.6 */ 12.4);
```

- [ ] **Step 18.8: Lint & commit Pass C**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint compositions/08-architecture.html && \
  git add compositions/08-architecture.html && \
  git commit -m "feat(comp): beat 8 pass C — kiosk inset synced to 'kiosk'"
```

### Animation-map gate for Beat 8

- [ ] **Step 18.9: Run animation-map, verify no dead zones > 800ms**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  node node_modules/hyperframes/dist/skills/hyperframes/scripts/animation-map.mjs compositions \
    --out .hyperframes/anim-map || \
  node /Users/browley/video/.agents/skills/hyperframes/scripts/animation-map.mjs compositions \
    --out .hyperframes/anim-map
cat .hyperframes/anim-map/animation-map.json | grep -A2 'beat-8-arch'
```

Expected: no `dead zone` > 0.8s for `beat-8-arch`. If any, add a subtle ambient tween (e.g., slow scale 1.00 → 1.02 on inactive tiles over 2s `sine.inOut`) to fill.

---

## Task 19: Captions overlay sub-composition

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/compositions/captions.html`

Captions are driven by `transcript.json`. Groups of 3–5 words with ~120ms exit kill. Positioned bottom-safe.

- [ ] **Step 19.1: Write `captions.html`**

```html
<!doctype html>
<template id="captions-template">
  <div data-composition-id="captions" data-start="0" data-duration="TOTAL_DURATION" data-width="1920" data-height="1080">
    <style>
      [data-composition-id="captions"] {
        width: 100%; height: 100%; position: relative;
        font-family: "Geist Mono", ui-monospace, monospace; pointer-events: none;
      }
      [data-composition-id="captions"] .cap-group {
        position: absolute; left: 0; right: 0; bottom: 96px;
        text-align: center; padding: 0 160px;
        font-size: 32px; font-weight: 600; color: #F7F7F5;
        text-shadow: 0 2px 0 rgba(0,0,0,0.6), 0 0 2px rgba(0,0,0,0.8),
                     -2px 0 0 #000, 2px 0 0 #000, 0 -2px 0 #000, 0 2px 0 #000;
        letter-spacing: 0.01em; opacity: 0;
        font-variant-numeric: tabular-nums;
      }
    </style>
    <!-- Groups are generated by the script below from transcript.json -->
    <div id="caption-root"></div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      (async function () {
        const res = await fetch("../assets/audio/transcript.json");
        const raw = await res.json();
        const words = Array.isArray(raw) ? raw : (raw.words || (raw.segments && raw.segments.flatMap(s => s.words)) || []);
        // Group into ~4-word phrases, breaking on punctuation and pauses > 250ms.
        const groups = [];
        let cur = null;
        for (let i = 0; i < words.length; i++) {
          const w = words[i];
          const text = (w.text || w.word || "").trim();
          if (!text) continue;
          if (!cur) cur = { text: text, start: w.start, end: w.end };
          else {
            const pause = w.start - cur.end;
            const len = cur.text.split(/\s+/).length;
            const hasPunct = /[.,!?;:—]$/.test(cur.text);
            if (len >= 4 || pause > 0.25 || hasPunct) {
              groups.push(cur);
              cur = { text: text, start: w.start, end: w.end };
            } else {
              cur.text += " " + text; cur.end = w.end;
            }
          }
        }
        if (cur) groups.push(cur);
        const root = document.getElementById("caption-root");
        groups.forEach((g, i) => {
          const el = document.createElement("div");
          el.className = "cap-group"; el.id = "cg-" + i; el.textContent = g.text;
          root.appendChild(el);
        });
        const tl = gsap.timeline({ paused: true });
        groups.forEach((g, i) => {
          const sel = "#cg-" + i;
          tl.to(sel, { opacity: 1, duration: 0.18, ease: "power2.out" }, g.start);
          tl.to(sel, { opacity: 0, duration: 0.12, ease: "power2.in" }, g.end - 0.12);
          tl.set(sel, { opacity: 0, visibility: "hidden" }, g.end);
        });
        window.__timelines["captions"] = tl;
      })();
    </script>
  </div>
</template>
```

**Note:** the async fetch inside the IIFE may conflict with the "synchronous timeline construction" rule. If lint flags this, switch to a build-time step: generate an `.hf-captions.generated.json` of groups at plan time and inline it into the HTML (no fetch). Fall-back instructions in Step 19.3.

- [ ] **Step 19.2: Replace `TOTAL_DURATION`**

Set `data-duration` to the total narration duration from `ffprobe` (Task 5 Step 5.2).

- [ ] **Step 19.3: Fallback if async-build lint error**

If lint reports `async_timeline_construction` or similar:

1. Run this one-shot grouper, write its output to a JS array, and inline it into `captions.html`:
   ```bash
   cat > /tmp/group-captions.mjs <<'EOF'
   import { readFileSync, writeFileSync } from 'node:fs';
   const raw = JSON.parse(readFileSync(process.argv[2], 'utf8'));
   const words = Array.isArray(raw) ? raw : (raw.words || (raw.segments && raw.segments.flatMap(s => s.words)) || []);
   const groups = []; let cur = null;
   for (const w of words) {
     const text = (w.text || w.word || '').trim(); if (!text) continue;
     if (!cur) cur = { text, start: w.start, end: w.end };
     else {
       const pause = w.start - cur.end;
       const len = cur.text.split(/\s+/).length;
       const hasPunct = /[.,!?;:—]$/.test(cur.text);
       if (len >= 4 || pause > 0.25 || hasPunct) { groups.push(cur); cur = { text, start: w.start, end: w.end }; }
       else { cur.text += ' ' + text; cur.end = w.end; }
     }
   }
   if (cur) groups.push(cur);
   writeFileSync(process.argv[3], 'window.__CAPTION_GROUPS = ' + JSON.stringify(groups) + ';');
   EOF
   cd /Users/browley/video/dominos-vip-demo && \
     node /tmp/group-captions.mjs assets/audio/transcript.json .hf-caption-groups.js
   ```
2. Replace the async IIFE in `captions.html` with a synchronous one that reads `window.__CAPTION_GROUPS`, appends DOM elements, and builds the timeline.
3. Include `.hf-caption-groups.js` via `<script src="../.hf-caption-groups.js"></script>` above the captions inline script.

- [ ] **Step 19.4: Lint & commit**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint compositions/captions.html && \
  git add compositions/captions.html .hf-caption-groups.js 2>/dev/null; \
  cd /Users/browley/video/dominos-vip-demo && git add -u compositions/ && \
  git commit -m "feat(comp): add captions overlay driven by transcript"
```

---

## Task 20: Root `index.html` orchestrator

**Files:**
- Create/overwrite: `/Users/browley/video/dominos-vip-demo/index.html`

This replaces any `index.html` the scaffold produced. It is a **standalone composition** (no `<template>` wrapper).

- [ ] **Step 20.1: Compute beat start times and total duration**

From STORYBOARD.md, record the absolute start seconds of each beat (`s1`..`s11`) and the total duration (`T`). These become `data-start` values and the root `data-duration`.

- [ ] **Step 20.2: Write `index.html`**

Replace `s1`..`s11`, `d1`..`d11`, and `T` with real values.

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Domino's VIP Demo — Segment CDP</title>
</head>
<body>
  <div id="root" data-composition-id="root" data-start="0" data-duration="T" data-width="1920" data-height="1080">
    <style>
      html, body { margin: 0; padding: 0; background: #F7F7F5; }
      [data-composition-id="root"] { width: 1920px; height: 1080px; position: relative; background: #F7F7F5; }
    </style>

    <!-- Narration audio -->
    <audio id="narration" data-start="0" data-duration="T" data-track-index="0"
           src="assets/audio/narration.wav" data-volume="1"></audio>

    <!-- Music bed (optional — omit this element if no music-bed.mp3 yet) -->
    <audio id="music" data-start="0" data-duration="T" data-track-index="1"
           src="assets/audio/music-bed.mp3" data-volume="0.22"></audio>

    <!-- Scenes -->
    <div id="scene-1"  data-composition-id="beat-1-hook"   data-composition-src="compositions/01-hook.html"              data-start="s1"  data-duration="d1"  data-track-index="2"></div>
    <div id="scene-2"  data-composition-id="beat-2-problem" data-composition-src="compositions/02-problem.html"           data-start="s2"  data-duration="d2"  data-track-index="2"></div>
    <div id="scene-3"  data-composition-id="beat-3-sarah"  data-composition-src="compositions/03-sarah-returns.html"      data-start="s3"  data-duration="d3"  data-track-index="2"></div>
    <div id="scene-4"  data-composition-id="beat-4-anon"   data-composition-src="compositions/04-anonymous-arrival.html"  data-start="s4"  data-duration="d4"  data-track-index="2"></div>
    <div id="scene-5"  data-composition-id="beat-5-ident"  data-composition-src="compositions/05-identification.html"     data-start="s5"  data-duration="d5"  data-track-index="2"></div>
    <div id="scene-6"  data-composition-id="beat-6-aud"    data-composition-src="compositions/06-audience-match.html"     data-start="s6"  data-duration="d6"  data-track-index="2"></div>
    <div id="scene-7"  data-composition-id="beat-7-pers"   data-composition-src="compositions/07-personalization.html"    data-start="s7"  data-duration="d7"  data-track-index="2"></div>
    <div id="scene-8"  data-composition-id="beat-8-arch"   data-composition-src="compositions/08-architecture.html"       data-start="s8"  data-duration="d8"  data-track-index="2"></div>
    <div id="scene-9"  data-composition-id="beat-9-usp"    data-composition-src="compositions/09-usp.html"                data-start="s9"  data-duration="d9"  data-track-index="2"></div>
    <div id="scene-10" data-composition-id="beat-10-impact" data-composition-src="compositions/10-impact.html"            data-start="s10" data-duration="d10" data-track-index="2"></div>
    <div id="scene-11" data-composition-id="beat-11-cta"   data-composition-src="compositions/11-cta.html"                data-start="s11" data-duration="d11" data-track-index="2"></div>

    <!-- Captions overlay sits on its own track above all scenes -->
    <div id="captions-overlay" data-composition-id="captions" data-composition-src="compositions/captions.html"
         data-start="0" data-duration="T" data-track-index="3"></div>

    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      (function () {
        const tl = gsap.timeline({ paused: true });
        window.__timelines["root"] = tl;
      })();
    </script>
  </div>
</body>
</html>
```

- [ ] **Step 20.3: Lint the whole project**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint
```
Fix every error. Warnings are OK to defer but read each one.

- [ ] **Step 20.4: Commit**

```bash
cd /Users/browley/video/dominos-vip-demo && git add index.html && \
  git commit -m "feat: orchestrate root index.html with all beats + captions + narration"
```

---

## Task 21: Validation gates

Execute the hard stops from spec §5. Fail any one → fix before proceeding.

- [ ] **Step 21.1: Lint gate**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes lint --strict
```
Expected: exit 0, no errors. If `--strict` bubbles warnings to errors for items you intentionally deferred, evaluate each.

- [ ] **Step 21.2: Contrast gate**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes validate
```
Expected: WCAG AA pass. Warnings ≤ 0. Fix: brighten failing foreground within the palette family; re-run.

- [ ] **Step 21.3: Animation-map gate (all beats)**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  node /Users/browley/video/.agents/skills/hyperframes/scripts/animation-map.mjs compositions \
    --out .hyperframes/anim-map
```
Open `.hyperframes/anim-map/animation-map.json`. Fix every flag: `offscreen`, `collision`, `paced-fast`. Dead zones > 1.2s must be intentional (note in STORYBOARD).

- [ ] **Step 21.4: Audio gate**

```bash
ffmpeg -i /Users/browley/video/dominos-vip-demo/assets/audio/narration.wav \
  -af ebur128=framelog=verbose -f null - 2>&1 | tail -20
```
Expected: `Integrated loudness` ≈ −16 LUFS ±1. Adjust with `ffmpeg -af loudnorm=I=-16:TP=-1.5:LRA=11` if out of range, overwrite `narration.wav`.

If music-bed present:
```bash
ffmpeg -i /Users/browley/video/dominos-vip-demo/assets/audio/music-bed.mp3 \
  -af ebur128=framelog=verbose -f null - 2>&1 | tail -20
```
Target: −26 LUFS ±1.

Spot-check caption timing: open `preview`, seek to 10 random words, verify caption boundary within 120ms.

- [ ] **Step 21.5: Fact gate**

Open `STORYBOARD.md` and confirm Beat 10 footnote names a locatable Segment source URL (not just "Segment customer benchmarks"). If you can't locate a URL, update the footnote to a defensible version (e.g., "Industry benchmarks for real-time personalization") and re-commit.

- [ ] **Step 21.6: Brand gate**

Grep compositions for any non-palette hex values:

```bash
cd /Users/browley/video/dominos-vip-demo && \
  grep -RIE "#[0-9A-Fa-f]{3,6}" compositions index.html | \
  grep -viE "#0B5CAB|#003B73|#E31837|#F7F7F5|#0A0F1E|#6B7280|#FFFFFF|#1A6BB8|#2878C5|#000000"
```
Expected: empty. If anything prints, replace with the palette equivalent.

Also confirm the Wordmark appears **only** in Beat 11:
```bash
grep -RIE "DPZ_2025_Logo_Wordmark" compositions | grep -v "11-cta.html"
```
Expected: empty.

- [ ] **Step 21.7: Preview and cold-watch gate**

```bash
cd /Users/browley/video/dominos-vip-demo && npx hyperframes preview --port 4567
```
Open the preview URL. Play full-through with **sound off** (subtitles only) and then with **sound on**. Both passes must communicate the three USP pillars.

- [ ] **Step 21.8: Executive-length gate**

Confirm total duration from `ffprobe` on the narration is between 90.00 and 120.00 (from Task 5 Step 5.2).

---

## Task 22: Render final MP4

**Files:**
- Create: `/Users/browley/video/dominos-vip-demo/renders/dominos-vip-demo_working.mp4`
- Create: `/Users/browley/video/dominos-vip-demo/renders/dominos-vip-demo_final.mp4`

- [ ] **Step 22.1: Working render**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  npx hyperframes render --quality high --fps 30 --workers auto \
    --output renders/dominos-vip-demo_working.mp4
```

- [ ] **Step 22.2: User sign-off**

Play `renders/dominos-vip-demo_working.mp4`. Confirm with user it's CTO-ready before the canonical render.

- [ ] **Step 22.3: Canonical delivery render (byte-identical, Docker)**

```bash
cd /Users/browley/video/dominos-vip-demo && \
  npx hyperframes render --quality high --fps 30 --workers auto --docker \
    --output renders/dominos-vip-demo_final.mp4
```

- [ ] **Step 22.4: Verify final render**

```bash
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate \
  -of default=noprint_wrappers=1 \
  /Users/browley/video/dominos-vip-demo/renders/dominos-vip-demo_final.mp4
```
Expected: h264, 1920×1080, 30/1 fps, duration 90–120s.

- [ ] **Step 22.5: Record the delivery**

Do NOT commit the render (`renders/` is gitignored). Write a short note to `docs/superpowers/specs/2026-04-30-dominos-vip-demo-video-design.md` (in `domdemo/`) appending a `## Delivery` section with the render path, duration, and date.

---

## Self-Review Appendix (writer's checklist)

Before handing off to execution, run through:

1. **Spec coverage:** every section of the spec maps to a task (§1→Task 0 intent; §2→Tasks 1,3; §3→Tasks 4,6 + Tasks 8–18; §4→Tasks 4,5,6,7; §5→Tasks 21,22). ✓
2. **No placeholders:** every step has actual commands, actual code, or a named tunable (beat durations, word-start times) with explicit instruction to replace. ✓
3. **Type/name consistency:** composition IDs used in `index.html` (`beat-1-hook`, `beat-2-problem`, …, `beat-11-cta`, `captions`, `root`) match the IDs inside each sub-composition's `data-composition-id` and `window.__timelines` registration. ✓
4. **Element ID collisions:** each composition uses a unique prefix (`h1-`, `p2-`, `s3-`, `a4-`, `i5-`, `au6-`, `p7-`, `u9-`, `im-`, `cta-`, `t1`–`t5`, `arch-*`) so sibling scenes in the DOM don't collide. ✓
5. **Asset paths relative to composition file:** compositions sit in `compositions/`, so they reference brand + audio + captures via `../assets/...`. ✓
6. **Determinism:** no `Math.random`, no `Date.now`, no `repeat: -1`, no async timeline construction in final shipped code (Task 19 Step 19.3 provides the synchronous fallback). ✓

If any box above becomes unchecked during execution, halt and reconcile.

