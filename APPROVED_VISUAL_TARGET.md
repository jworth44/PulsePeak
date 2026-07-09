# PULSEPEAK — APPROVED VISUAL TARGET (v2, owner-ratified 2026-07-09)

**This document is the visual benchmark for ALL PulsePeak implementation.**
The owner's concept image (Today's Training + Workout Library, Canadian
charcoal/crimson/evergreen) is the approved target — not inspiration, not a
mockup. Reproduce the **experience**, never the pixels. Every completed screen
is compared against this benchmark; if a production screen feels less premium
than the concept, keep refining until it does. Works with
`CANADIAN_DESIGN_LANGUAGE.md` (palette + expression rules) and
`PRODUCTION_ROADMAP.md` (sequencing + regression guard).

---

## THE ONE PRINCIPLE THAT RULES THE REST — RECOGNITION BEFORE READING

In the concept, a user can identify what every card means **without reading a
single word**. The anatomy figure with a red-highlighted chest IS "Chest". The
dumbbell icon IS "Dumbbells". The athlete photo mid-box-jump IS "Power". The
green ring-check IS "Completed". The flame IS the streak.

**The blur test:** blur every label on a screen — can you still tell what each
card, tile, stat and state is? If not, the visual isn't carrying its weight.

How to honor it:
- **Icons are literal, not abstract** — a bench looks like a bench, a band like
  a band, a clock like a clock. Thin, athletic, consistent stroke weight.
- **Media is matched to meaning** — each workout-type photo shows that training
  style being performed (barbell grind = Strength; box jump = Power; runner =
  Conditioning; child's pose = Recovery). Each muscle tile shows the anatomy
  with the target muscle highlighted in red.
- **States are visual first** — completed = evergreen ring-check; streak =
  flame + number; progress = filled bar; selected = filled/edged card. The
  word confirms; the visual communicates.
- **Numbers read as numbers** — large, tabular, deliberate; the label beneath
  is quiet and secondary.

---

## THE FEELING

Opening PulsePeak must feel: premium · professional · calm · confident ·
powerful · purposeful · beautifully restrained. Everything intentional; nothing
assembled; never a developer dashboard. A premium consumer product built by a
world-class design team — "I want to open this app. I trust it. It feels
expensive. I'd happily pay for it."

## COMPOSITION (approved, per screen)

- **Large cinematic hero** — one per screen, photography-led when media exists.
- Generous whitespace; centered content; **one obvious focal point**; one
  supporting story; **one obvious next action**. Nothing competes.
- Strong editorial typography creates the hierarchy — not borders, not colors,
  not decoration. Large confident headlines; warm readable body; quiet labels.
- Minimal visual noise; quiet navigation that disappears into the background.
- Information breathes and reveals progressively — never a spreadsheet.
- Cards communicate **one idea each**, feel like premium equipment (machined
  aluminum / stone / matte ceramic), never database records. If a card carries
  two ideas, redesign it.
- Color communicates meaning, never decoration; restrained, purposeful.
- Whitespace is intentional — don't compress, don't fill; comfort = quality.

## THE BENCHMARK, DECOMPOSED (what the concept image shows)

**Left panel — Today's Training:**
1. Cinematic mountain-lake hero, "TODAY'S TRAINING" display headline, two-line
   honest supporting copy, crimson START SESSION button. Photography fades into
   the charcoal page.
2. 4-stat metric row (streak w/ flame · workouts this week · completion % ·
   avg HR) — big tabular numbers, literal icons, quiet labels.
3. "TODAY'S FOCUS" photo card — athlete image + focus title + one-line why +
   "View Full Plan" quiet button.
4. QUICK ACTIONS — 5 icon tiles (play/plus/clipboard/stretch/leaf), instantly
   readable.
5. RECENT ACTIVITY — rows with photo thumbnail + session name + when/duration +
   evergreen ring-check "Completed".
6. Quiet bottom nav (Today/Train/Progress/You).

**Right panel — Workout Library:**
1. Compact top bar: back arrow · title · search field · filter icon.
2. BROWSE BY MUSCLE GROUP — 8 anatomy figures with the target muscle
   red-highlighted + live exercise counts.
3. BROWSE BY EQUIPMENT — 6 literal icon cards.
4. POPULAR WORKOUT TYPES — 6 photo cards (style being performed) + one-line
   cue + crimson arrow.
5. Closing banner: maple mark + "BUILT IN CANADA. MADE FOR YOUR PEAK." +
   "DISCIPLINE ★ CONSISTENCY ★ RESILIENCE" over a mountain silhouette.

## ADAPTATION RULES (experience over pixels)

- Adapt intelligently to **real data, real workflows, responsive layouts,
  accessibility, engineering constraints** — but always preserve the
  experience.
- **Honesty is non-negotiable**: never fabricate data (no fake avg-HR — the app
  doesn't track HR; adapt the stat row to real metrics), never fake media
  (missing owner media renders the clean "IMAGE IN PRODUCTION" state — see the
  media pipeline below), never infer state from absence of data.
- Streaks/progress stay earned and honest (freeze protection, state-keyed
  coaching copy) — fold that copy quietly beneath the visuals, don't delete it.

## IMPLEMENTATION STATE (2026-07-09 — do not redo)

Already built, verified, and **machine-locked into qa:launch (19/19 baseline)**:
- **Maple theme** (`styles-themes.css` + `config/themes.js` +
  `theme-bootstrap.js`): exact Canadian palette; maple mark by the wordmark;
  mountain-silhouette backdrop (`public/ca-mountains.svg`); closing banner
  (`public/ca-banner.svg`); crimson eyebrows (#ec7080, AA).
- **Today**: stat row (StreakCard `variant="row"` — 3 honest cardlets + coaching
  folded beneath) · Quick Actions (5 tiles, real actions only) · Recent
  Activity (real logged sessions, calendar-day recency, evergreen ring-check).
- **Workout Library** (`/workout-library`): equipment (16 icon cards) · muscle
  grid (8, live counts from `/api/exercise-library`) · workout types (6) ·
  search/filter/empty/loading states · click-through to a filtered Exercise
  Library (`?category=` / `?q=`) · honest awaiting-media states ·
  `qa:workout-library` media-validation gate.
- App-wide a11y pass complete (23 toggles aria-pressed, all dialogs named, all
  inputs labeled); Liberty theme (separate American identity) intact.

## WHAT REMAINS TO REACH THE BENCHMARK

**Owner-media-gated** (all render honest awaiting/designed states until assets
pass the AI Image QA Gate; queue = `MEDIA_AUDIT_REGISTER.md`):
1. Today hero landscape (cinematic Canadian mountain photography).
2. "Today's Focus" photo card (needs its focus photo).
3. Recent-activity thumbnails (from the exercise-photo re-shoot).
4. 8 muscle anatomy figures (red-highlighted target, charcoal ground) — keys
   `muscle-*`; drop into `WORKOUT_LIBRARY_MEDIA` in
   `src/config/workoutLibrary.js`.
5. 6 workout-type photos (style performed, Canadian grading) — keys `type-*`.
6. Exercise/session photography re-shoot (one coherent production).

**Engineering, once media lands:** the cinematic Today hero composition
(display headline + photography + START SESSION as the one action), the Focus
photo card, thumbnails in Recent Activity. Compare every screen against the
benchmark; refine until it feels as premium.

**Owner decisions pending:** Maple as the default theme? (one-constant flip in
`config/themes.js` FALLBACK_THEME) · Blossom text tweaks (unspecified).

## VERIFICATION PLAYBOOK (proven in this codebase)

- Serve: `preview_start pulsepeak-c2` (`:3007`, serves built `dist` — always
  `npm run build` then clear SW+caches; server dies between sessions).
- Real pixels: Chrome extension MCP (`tabs_context_mcp` → `navigate` →
  `computer{screenshot}`); `preview_screenshot` wedges after SW-clear reloads.
- Login: register via API + PATCH profile (recipe in memory/PRODUCTION_LOG);
  premium-gated surfaces: grant a LOCAL test user `tier:"premium"` via
  `updateUserAccount` (dev db.json only, gitignored — never real billing).
- Contrast: srgb-aware parser (browsers return `color(srgb 0-1)` — a 0-255
  parser false-fails warm whites). AA ≥ 4.5 small text.
- Gates per checkpoint: build 0 · `qa:launch` **19/19** (regression guard:
  never fewer) · `qa:workout-library` PASS · 0 console errors · both flagship
  themes + Maple · 375px structural (preview MCP resize; Chrome can't render
  <500px).
- Report with engineering language; product-quality judgment is the owner's
  separate review (see feedback-engineering-vs-product-reporting).
