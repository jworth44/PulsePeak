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
