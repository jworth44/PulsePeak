# PulsePeak Media Audit Register

Complete media audit (2026-07-06). Programmatic pass via `npm run qa:media`
(`scripts/media-audit.mjs`) + vision review of the rendered library. Machine
output: `artifacts/media-audit.json`.

**Verdict: the exercise library is NOT one coherent product.** It reads as
years of accumulated assets from different sources — three resolutions, three
aspect ratios, five broken sets, inconsistent models/lighting/color-grade
between shoots, and flat placeholder tiles for the text-only long tail. This is
not commercially acceptable and is a top-priority remediation. Fixes require
image generation (Gemini) and are owner-gated on cost; this register is the
work-list.

## The core problem in one table

Only **16 of 49** real photo sets (33%) meet the premium 1536×1024 standard.
The rest are half-res, square, or broken:

| Step-frame resolution | Aspect | # exercises | Standard? |
|---|---|---|---|
| **1536 × 1024** | 3:2 | 16 | ✅ premium target |
| 768 × 512 | 3:2 | 15 | ⚠️ half-resolution |
| 627 × 627 | **1:1 square** | 13 | ⚠️ wrong aspect + low-res |
| 291 × 203 / 204 | ~1.43:1 | 3 | ❌ broken (sub-thumbnail) |
| 290 × 264 | ~1.1:1 | 1 | ❌ broken |
| 192 × 184 | ~1:1 | 1 | ❌ broken |

A user scrolling the library sees a 1536px cinematic photo next to a 627px
square next to a 192px garbled crop — the exact "they forgot to finish this"
signal.

## P0 — broken frames (5 sets, sub-thumbnail garbled crops)
Regenerate as full 1536×1024 4-frame sets:
- `lat-pulldown` (192×184) · `triceps-pushdown` (290×264) · `dead-bug` (291×203)
  · `bird-dog` (291×204) · `side-plank` (291×203)

## P0 — known baked-in text / placeholder sets (from prior VG-001)
These render exercise NAME text or "STEP N" cards baked into the image:
- `arnold-press` (also: "3. ARNOLD PRESS / THUMBNAIL" baked in)
- `bird-dog`, `dead-bug`, `face-pull`, `chest-supported-row`
- Onboarding welcome hero: third-party **"BD FITNESS"** gym logo baked in.

Note several of these (`arnold-press`, `face-pull`, `chest-supported-row`) are
now **orphaned** (see below) — on disk but unwired, so they currently render
text-only rather than the defective image. Regen + wire together.

## P1 — resolution / aspect upgrade (28 sets)
Re-shoot the 15 half-res (768×512) and 13 square (627×627) sets to the
1536×1024 3:2 standard so the whole library is one resolution and one aspect.

## P1 — model / lighting / color-grade inconsistency (vision)
Confirmed from the rendered library: `90/90 hip flow` (studio, cool grade,
female model) vs `Ab wheel rollout` (dark gym, warm grade, male model) vs the
mobility/shoulder cards — **different models, gyms, lighting, and color grades
between exercises**. The library must feel like ONE photoshoot: one lighting
setup, one grade, the two locked models (`reference_male`/`reference_female`)
used consistently, one background treatment. This is the single biggest
"developer-built vs premium" tell in the product.

## P1 — placeholder tiles for the text-only long tail (36 exercises)
Cardio machines, agility/ladder drills, carries, and a few isolations resolve to
a maroon-gradient tile with the exercise name + faint "PULSEPEAK" watermark and a
"TEXT COACHING GUIDE" badge. These look unfinished. Either generate real guides
or design an intentional, premium "illustrated" placeholder that does not read as
a missing asset. (List: 📝 rows in `EXERCISE_MANUFACTURING_INDEX.md`.)

## P2 — 33 orphaned media dirs (generated but unwired)
`public/media/exercises/*` dirs with 5 images each that the live resolver never
references — generated work that is neither serving nil nor wired:
`arnold-press, back-squat, barbell-bench-press, bent-over-dumbbell-row,
bulgarian-split-squat, chest-supported-row, concentration-curl,
dumbbell-chest-fly, dumbbell-floor-press, dumbbell-front-raise,
dumbbell-lateral-raise, dumbbell-pullover, dumbbell-romanian-deadlift,
dumbbell-shoulder-press, dumbbell-step-up, dumbbell-walking-lunge, face-pull,
flat-dumbbell-bench-press, front-squat, goblet-reverse-lunge, hammer-curl,
incline-push-up, overhead-dumbbell-extension, reverse-lunge, romanian-deadlift,
seated-cable-row, seated-shoulder-press, single-arm-dumbbell-row, split-squat,
step-up, t-bar-row, upright-row, walking-lunge`.
Action: vision-review each — wire the good ones into `EXACT_VISUAL_MEDIA_KEYS`,
quarantine/delete the defective ones. Some are the newer gendered pilot sets and
may be higher quality than what's currently wired.

## P2 — thumbnail provenance (9 sets)
Thumbnails that are standalone images not drawn from the 4 step frames
(`goblet-squat, incline-dumbbell-press, lat-pulldown, triceps-pushdown,
calf-raise, dead-bug, bird-dog, side-plank, jumping-jack`) — verify each matches
its set's model/lighting.

## Reconciliation note
Docs disagree on counts (172 vs 174 visual, 34 vs 36 text). The live resolver
serves **49 unique photo sets** stretched across ~174 exercises via
`EXACT_VISUAL_MEDIA_KEYS` (variants share a base movement's images by design —
e.g. `sumo-deadlift`, `romanian-deadlift` → `deadlift`). So "174 visual guides"
= 49 real shoots reused. Any premium re-shoot only needs to cover the ~49 bases
(+ the text-only long tail), not 208 individually.

## Remediation sequence (all Gemini-gated, owner-cost-gated)
1. **P0**: 5 broken + 5 baked-text sets → regen 1536×1024, locked models, wire.
2. **P1**: re-shoot 28 half-res/square sets to 1536×1024 3:2, one grade.
3. **P1**: enforce single-shoot look (models/lighting/grade) across all 49.
4. **P1**: text-only long tail → real guides or premium placeholder system.
5. **P2**: reconcile 33 orphans; fix thumbnail provenance; delete dead media.

Re-run `npm run qa:media` after each batch; target: 0 HIGH/MED, one resolution,
one aspect ratio.

---

## Workout Library — required production media (added 2026-07-08)

The Workout Library (`/workout-library`, `src/config/workoutLibrary.js`) is a
**complete production framework**. Browse-by-equipment is icon-based UI (no media
needed). The two media-backed sections render an honest **"awaiting approved
media"** production state until each asset below is approved. To publish an
approved, QA-passed asset, add its path to `WORKOUT_LIBRARY_MEDIA` (key → path);
it drops straight into the finished layout. Files live under
`public/media/workout-library/`. Coverage: **0 of 14 approved.**

**Muscle-group diagrams** (8) — key `muscle-*`, framed 4:5, consistent anatomical
render, red-highlighted target muscle on a deep-navy ground (matches the Liberty
American-editorial language), transparent or navy background, no text baked in:
- `muscle-chest` → `/media/workout-library/muscle/chest.png` — Chest
- `muscle-back` → `.../muscle/back.png` — Back
- `muscle-shoulders` → `.../muscle/shoulders.png` — Shoulders
- `muscle-arms` → `.../muscle/arms.png` — Arms
- `muscle-legs` → `.../muscle/legs.png` — Legs
- `muscle-glutes` → `.../muscle/glutes.png` — Glutes
- `muscle-core` → `.../muscle/core.png` — Core
- `muscle-full-body` → `.../muscle/full-body.png` — Full Body

**Workout-type photography** (6) — key `type-*`, framed 16:10, one coherent
commercial production per the American editorial spec (professional gym, dark
background, directional lighting, high contrast, real athletes/effort,
consistent grade, no AI artifacts, no baked text):
- `type-strength` → `/media/workout-library/type/strength.jpg` — Strength
- `type-hypertrophy` → `.../type/hypertrophy.jpg` — Hypertrophy
- `type-strength-endurance` → `.../type/strength-endurance.jpg` — Strength Endurance
- `type-power` → `.../type/power.jpg` — Power
- `type-conditioning` → `.../type/conditioning.jpg` — Conditioning
- `type-recovery` → `.../type/recovery.jpg` — Recovery

Every asset must pass the **AI Image QA Gate** before its path is added to
`WORKOUT_LIBRARY_MEDIA`. `validateLibraryMedia()` fails any published path not
rooted at `/media/workout-library/`.

---

## Canadian benchmark media (added 2026-07-09, per CANADIAN_DESIGN_LANGUAGE.md)

The owner-approved Canadian concept is the visual benchmark for all screens.
Additional owner-generated media it requires (all render honest awaiting/designed
states until approved; one consistent production — natural light, premium
training environments, muted backgrounds, Canadian grading):

- **Today hero landscape** — cinematic Canadian mountain/lake photography for the
  "TODAY'S TRAINING" hero (per-theme variant acceptable; Maple first).
- **"Today's Focus" photo** — athlete training shot matching the session focus.
- **Recent-activity thumbnails** — reuse of session/exercise photography once the
  main re-shoot lands (no new keys; sourced from the exercise library sets).
- **Muscle-group diagrams (8, already queued above)** — style note per the
  benchmark: anatomical figure, red-highlighted target muscle, charcoal ground.
- **Workout-type photos (6, already queued above)** — grading note per the
  benchmark: natural light, muted backgrounds, Canadian production feel.
- **Brand maple mark** — a stylized functional SVG (`public/maple-leaf.svg`)
  ships now; swap in owner-supplied brand vector if desired.

### PASTE-READY GEMINI GENERATION KIT (added 2026-07-09)

*One image per NEW Gemini chat (per the established pipeline rule). Save each
result to `N:\Downloads\` with the filename shown; then tell Claude "assets in
Downloads" — QA, processing, and wiring are automated from there. Shared style
suffix for EVERY prompt below:*

> …Photorealistic, natural light, muted charcoal/evergreen background, subtle
> cool Canadian grading, premium editorial fitness photography, no text, no
> watermark, no logos, dark-toned so warm-white UI text stays readable.

1. `pp-hero-dusk.png` — 1600×900 — "Cinematic Canadian mountain lake at dusk,
   alpenglow on a snow-capped peak, evergreen treeline, still water
   reflection, deep charcoal sky, space at left third for headline text…"
2. `pp-focus-upper.png` — 1200×750 — "Athletic man mid dumbbell row on a bench
   in a dark premium gym, focused expression, side lit…"
3. `type-strength.png` — 1280×800 — "Athlete performing a heavy barbell squat
   in a dark gym, low-bar grind, chalk dust…"
4. `type-hypertrophy.png` — 1280×800 — "Athlete doing controlled dumbbell
   curls, muscular definition, moody gym…"
5. `type-strength-endurance.png` — 1280×800 — "Athlete pushing a battle-rope
   or air-bike interval, sustained effort…"
6. `type-power.png` — 1280×800 — "Athlete mid box-jump, explosive movement
   frozen at peak height…"
7. `type-conditioning.png` — 1280×800 — "Runner on a forest trail among
   evergreens, morning mist…"
8. `type-recovery.png` — 1280×800 — "Athlete in child's pose on a mat in a
   calm dark studio, one soft window light…"
9–16. `muscle-chest.png, muscle-back.png, muscle-shoulders.png,
   muscle-arms.png, muscle-legs.png, muscle-glutes.png, muscle-core.png,
   muscle-fullbody.png` — 800×1000 each — "3D anatomical male figure,
   neutral standing pose, matte grey body on dark charcoal ground, ONLY the
   [chest / back / shoulder / arm / leg / glute / core / full-body]
   muscles highlighted in glowing crimson red, medical-illustration style,
   consistent camera angle front view (back view for muscle-back)…"
17. `pp-maple-leaf.svg/png` — optional brand vector — "Minimal flat crimson
   maple leaf icon, single color #C6283B, clean geometry…" (or supply your
   own brand vector).

*Wiring targets (already built, drop-in): hero → `--hero-cinematic` token
(styles-themes.css); focus → Today focus-card slot; `type-*`/`muscle-*` →
`WORKOUT_LIBRARY_MEDIA` manifest in `src/config/workoutLibrary.js`; run
`npm run qa:workout-library` after the drop.*

### ALTERNATE FAST PATH — crop from the owner's concept image
If the full-resolution concept export is saved to
`N:\Downloads\pulsepeak-concept.png`, Claude crops hero/focus/type/muscle/
thumbnail regions directly out of it and wires them as first-pass assets
(softer than generated originals; upgraded by the kit above later).
