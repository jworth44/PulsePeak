# User Persona Test Results — Recovery Directive Part 6/7 (personas A–G)

Method: each persona's workout library generated through the SAME filter
derivation the live `/api/workout-library` route uses (selections →
equipment profile), then every session judged against the persona's actual
constraints. Now a permanent build gate: `qa:personas`
(scripts/persona-relevance-audit.mjs), chained into `qa:launch`.

## Defects found and fixed (2026-07-11)

### PA-1 (P1) — Bodyweight-only users were served dumbbell workouts
- **Personas:** A (first-time beginner, home, no equipment), G (bodyweight)
- **Actual:** libraries full of "(Dumbbells only)" sessions — Incline
  dumbbell press, Goblet squat, Renegade row — for users who own nothing.
- **Root causes (three, stacked):**
  1. `getEquipmentSelectionsForProfile`: `[] || fallback` — the empty
     selections array is truthy, so bodyweight-profile users (onboarding
     writes `equipmentSelections: []`) skipped their profile's equipment map
     and landed on the environment default (**dumbbells**). shared/workoutEngine.js.
  2. `buildExerciseForSlot`'s pool-wide fallback dropped the equipment
     filter entirely when a pool had no compatible variant — serving
     equipment the user doesn't have. Removed: an ineligible slot is now
     dropped (honestly shorter session), never silently filled.
  3. `matchesEquipmentSelection` judged equipped users UNABLE to do
     bodyweight movements (owning dumbbells disqualified push-ups), which is
     what the unsafe fallback had been papering over. Bodyweight is now
     universally available; bar-dependent movements (Chin-up, Pull-up
     negative) retagged `pullup-bar` so they still require the bar.
- **Verified:** A and G now receive 8/8 fully bodyweight sessions.

### PA-2 (P1) — Shoulder-restricted users received overhead pressing
- **Persona:** E (shoulder limitation, pressing restrictions)
- **Actual:** Push Day contained "Dumbbell shoulder press" and "Overhead
  dumbbell extension"; guide-level substitution existed but SELECTION never
  consulted `restrictedAreas`.
- **Fix:** selection-time `violatesRestrictions` — conservative
  pattern-first rules per restricted area (shoulder → Vertical push pattern
  + overhead/lateral-raise/pullover names; knee/ankle/hip → jump/plyo
  patterns; back → hinge-heavy names; wrist → loaded-plank patterns).
  Applied to primaries AND swap lists (same filtered array).
- **Verified:** E's 8 workouts contain zero shoulder-risk selections; D
  (knee) zero knee-risk selections.

### PA-3 (P1) — "Recovery Reset" was a high-joint-stress recovery session
- **Persona:** F (fatigue, wants low stress)
- **Actual:** recovery-day workout scored jointStress "high" (conditioning-
  pool variant selected into a recovery template).
- **Fix:** mobility_recovery templates exclude high-stress variants at
  selection; Recovery Reset's dead conditioning slot became a "Low-stress
  finish" glute slot per the directive's session-quality standard.
- **Verified:** both recovery sessions = 3 distinct movements, stress=low,
  coached shape (flow → main mobility → low-stress finish).

## Current persona status (generation level)
| Persona | Workouts | Violations |
|---|---|---|
| A first-time beginner (home, none) | 8 | 0 |
| B experienced lifter (full gym) | 7 | 0 |
| C active aging 40+ | 8 | 0 |
| D knee limitation | 8 | 0 |
| E shoulder limitation | 8 | 0 |
| F recovery day | 2 | 0 |
| G bodyweight minimal | 8 | 0 |

Gates: `qa:session-dedup` 700 sessions clean · `qa:personas` 49 sessions
clean · `qa:launch` 19/19 · build 0.

## Honest scope + open items
- This validates GENERATION-level relevance. Full UI journeys per persona
  (onboarding forms, swaps in the modal, completion, progress read-back)
  are covered for the common path by qa:launch + the click audit; injury
  INTAKE depth (directive Part 7 — affected side, triggers, tolerance,
  cleared-to-exercise) remains open and is the next loop iteration.
- C (40+) currently generates without violations, but the probe does not
  yet assert that 40+ selection DIFFERS appropriately (volume/intensity/
  recovery coaching) from the 30-39 baseline — queued as PA-4.
