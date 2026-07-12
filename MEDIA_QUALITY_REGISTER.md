# Media Quality Register — Recovery Directive Part 1

Measured live (headless Chrome, deviceScaleFactor 2, every route, every
rendered `<img>`): upscale factor = pixels needed at DPR2 ÷ source width.
>1.35 = visibly blurry on retina; >2 = blurry on any display. No accidental
opacity/filter/dimming was found on `<img>` elements themselves — the blur
class of defects is **under-resolved sources**, not overlays. Cinematic-hero
scrims are text-protection gradients and are intentional; their strength is
reviewed separately under theme atmosphere (Task #6).

## Fixed in code (2026-07-11)
| Defect | Was | Now |
|---|---|---|
| Train hero used 366×216 `type-*` tiles at 1120×400 (**6.1×**) | BLURRY | `onboarding-welcome.png` 1024×687 (training moods) / `pp-hero-dusk.png` 1131×924 (recovery moods) → ~1.1× at DPR1, 2.2× at DPR2 (interim) |
| Mobility hero used 372×212 `type-recovery` (**6.0×**) | BLURRY | `pp-hero-dusk.png` → ~1.0× at DPR1 |

## Owner-media regeneration queue (exact specs; blocked on image-gen decision)
| Asset | Current | Required for crisp DPR2 | Role |
|---|---|---|---|
| Hero photography per pillar (train/recover/plan/nutrition, per theme mood) | 366–1131px wide | **2240×800+** landscape | cinematic heroes |
| 8 × `muscle-*.png` anatomy figures | 192×208 (1.73× at tile size) | **≥384×416**; ≥768×832 if anatomy becomes tap-to-inspect (directive Part 1) | anatomy browse |
| 6 × `type-*.png` workout-type tiles | 366×216 (1.4× in grid) | **≥524×326** | Workout Library tiles |
| `today-focus.png` | 400×280 (1.5× at DPR2) | **≥598×424** | Today focus card |
| `lat-pulldown/thumbnail.png` | 131×184 (**4.1×**) | ≥534×334 (match 627px-class thumbs) | exercise thumb |
| `back-squat`, `triceps-pushdown`, `walking-lunge`, `arnold-press`, `t-bar-row` thumbs | ~291px (1.8×) | ≥534px wide | exercise thumbs |
| Nutrition hero (`high-protein-breakfast.png`) | 1024×637 (2.2× at DPR2) | 2240×800 | nutrition hero |

## Known interim compromises (honest)
- `pp-hero-dusk.png` currently serves BOTH Plan and Mobility heroes (best
  available calm-mood asset). Distinct environmental photography per screen
  is in the owner queue.
- All heroes remain ~2× soft on true retina displays until the queue runs.

## Verification
`_media_audit` probe rerun after the hero re-sourcing — see commit. The
audit methodology lives in this register's history; re-run by measuring
naturalWidth vs rendered width × DPR on every route.

## §HD-MUSCLE-TYPE — HD regeneration of muscle figures + workout-type photos ✅ COMPLETE 2026-07-11
**✅ SHIPPED (2026-07-11, commit 3d55cb3):** All 14 assets regenerated HD via the
Gemini API (`gemini-3-pro-image` reference-editing for the 8 muscle figures from a
consistent chest reference; `imagen-4.0-generate-001` 16:9 for the 6 type photos).
Muscle figures 928×1152 (correct muscle in crimson #C6283B, incl. fixed arms=biceps
and posterior back/glutes views); type photos 1408×768 cinematic dark-gym. No UI
watermark (API path — not the consumer app). All 14 passed the AI Image Gate;
`qa:workout-library` 14/14; verified rendering in the live DOM. The display-pop
filter stopgap was removed from `styles-polish.css` (real HD no longer needs it).
Original request/spec below for the record.

**Owner (2026-07-11):** the Browse-by-Muscle-Group figures are "dull, with a
shadow image/watermark in the background"; want HD + prominent. The Popular
Workout Types photos also need sharper HD.

**Root cause:** current assets are low-res (~63 KB PNGs, muscle-*.png) with a
baked dark geometric backdrop behind each figure (the "watermark") — both are
in the pixels, not fixable in CSS. A display-pop filter (contrast 1.08 /
saturate 1.14 / brightness 1.03) was applied as a stopgap; it cannot remove
the backdrop or add resolution.

**Regeneration spec (ready to run once image-generation is greenlit):**
- **8 muscle figures** `public/media/workout-library/muscle-{chest,back,
  shoulders,arms,legs,glutes,core,full-body}.png`, aspect 4:5, ≥1024×1280,
  transparent OR clean seamless charcoal (#1A1F22) background with NO geometric
  shadow/backdrop shape. Same anatomical model + pose + lighting across all 8
  (consistency); target muscle group illuminated in Canadian crimson
  (#C6283B), rest of body neutral muscle tone. Front view except back/glutes
  (posterior). No text/watermark.
- **6 type photos** `type-{strength,hypertrophy,strength-endurance,power,
  conditioning,recovery}.png`, aspect 16:10, ≥1536×960, commercial-grade
  dark-gym photography matching the concept grade, one consistent production
  look. No text/watermark.
- Pipeline: same composite-then-verify flow proven for the exercise media;
  run `qa:workout-library` after drop-in (config-driven, no code change —
  keys already wired in WORKOUT_LIBRARY_MEDIA).
- Gate: shared Gemini/API cost + scale is the owner's call (concurrent with
  Orientra). ~14 images.
