# PulsePeak — Canadian Editorial Design Language (owner-approved, 2026-07-08)

**Status: APPROVED VISUAL TARGET.** The owner's concept image (Today's Training +
Workout Library, charcoal/crimson/evergreen, maple brand mark, "BUILT IN CANADA.
MADE FOR YOUR PEAK." banner) is the **visual benchmark for all PulsePeak
implementation** — not inspiration, not a mockup. Reproduce the **experience**
(composition, hierarchy, spacing, restraint, typography, emotion), never the
pixels. Every completed screen is compared against this benchmark; if a
production screen feels less premium than the concept, keep refining.

## The objective

Not to decorate with maple leaves — to build a product that feels unmistakably
Canadian: premium, clean, natural, enduring, purposeful, confident, **quiet**.
Never loud, never cliché, never tourism-inspired. Canadian identity is
emotional, not decorative: craftsmanship, restraint, nature, clarity, quality,
honesty, balance. ("Apple interaction × Arc'teryx craftsmanship × lululemon
lifestyle × Canadian Olympic Committee identity.")

## Palette (exact)

| Role | Values |
|---|---|
| Primary background — deep Canadian charcoal | `#1A1F22` `#20272B` `#242C31` |
| Secondary surfaces — slate / stone / granite | `#2C353B` `#333D44` `#3B464D` |
| Primary text — soft warm white | `#F5F5F2` `#F1F1EC` |
| Accent — Canadian crimson (primary actions, achievements, navigation ONLY) | `#C6283B` `#B32035` |
| Supporting accent — evergreen (recovery, nature, wellness; sparing) | `#2E6F56` `#3A7C62` |
| Supporting neutral — silver / mist | `#C5CCD1` `#B7C1C8` |

**Avoid:** bright blue, neon, pure black, pure white.

## Expression rules

- **Patriotism subtle**: soft mountain silhouettes, forest/granite textures,
  subtle maple geometry, frosted glass, snow-light gradients, northern
  atmosphere. Feel Canada, don't look at Canada. No flags through the UI.
- **Hero**: large cinematic hero, editorial spacing, strong type ("TODAY'S
  TRAINING"), quiet confident supporting copy, crimson primary button; charcoal
  gradient + subtle mountain silhouette, never obvious.
- **Cards**: premium outdoor equipment (machined aluminum / stone / matte
  ceramic / carbon / fabric); minimal borders, soft depth; one idea per card;
  never database records.
- **Exercise cards**: photography dominates, metadata supports — name, small
  category, one coaching cue.
- **Photography**: one consistent production — natural lighting, premium
  gyms/training centres/mountain performance, consistent grade, muted
  backgrounds, no AI artifacts, no stock feel. (Owner-generated; tracked in the
  Media Production Queue.)
- **Typography**: editorial, quiet, elegant; hierarchy from type not
  borders/colors; large headlines, restrained labels, warm body, tabular
  figures for metrics.
- **Buttons**: primary crimson; secondary stone/slate; large touch targets.
- **Motion**: smooth, natural, controlled — snow, water, wind, momentum. Never
  playful/flashy.
- **Navigation**: minimal, quiet, disappears into the background.
- **Progress**: steady, earned, meaningful — not gamified, not over-celebrated.
- **Composition per screen**: one primary hero, one supporting story, one
  obvious next action; whitespace intentional; progressive disclosure — never a
  spreadsheet.

## Benchmark composition (from the approved concept)

- Today: cinematic mountain hero ("TODAY'S TRAINING" + supporting copy + START
  SESSION), 4-stat metric row (streak / workouts / completion / avg HR),
  "Today's Focus" photo card, Quick Actions row, Recent Activity list with
  photo thumbnails.
- Workout Library: search + filter top bar, Browse by Muscle Group (anatomical
  figures, red-highlighted target muscle, **live exercise counts**), Browse by
  Equipment (icon cards), Popular Workout Types (photo cards + one-line cue),
  "BUILT IN CANADA. MADE FOR YOUR PEAK. — DISCIPLINE ★ CONSISTENCY ★
  RESILIENCE" closing banner with maple mark.

## Implementation state

- Theme **`maple`** implements the palette + subtle-patriotism chrome
  (maple brand mark, mountain-silhouette backdrop, closing banner) in
  `src/styles-themes.css` (+ `config/themes.js`, `public/theme-bootstrap.js`).
- Structural benchmark items (cinematic hero, stat row, quick actions, recent
  activity w/ thumbnails) are tracked in `PRODUCTION_ROADMAP.md`; media-
  dependent items (hero landscape photography, workout-type photos, anatomical
  muscle figures, activity thumbnails) in `MEDIA_AUDIT_REGISTER.md` — honest
  "awaiting approved media" states until owner assets pass the QA gate.
