# PulsePeak — Exercise Quality Audit (child-test inspection of all 208)

Every exercise was inspected against the Manufacturing Gold Standard bar:
**"Could a 10-year-old who has never exercised follow this exactly, safely, with
no guessing and no assumed fitness knowledge?"** Six independent reviewers covered
all 208 exercises by category. Full per-exercise reports live in
`docs/exercise-reports/`; this file is the consolidated findings + fix plan.

## Verdict tally (of 208)

| Category | Pass | Needs work |
|---|---|---|
| Legs (52) | ~10 | ~42 |
| Back / Biceps / Triceps (40) | 17 | 23 |
| Chest / Shoulders (35) | 9 | 26 |
| Core / Glutes (31) | 17 | 14 |
| Conditioning (30) | 18 | 12 |
| Full-body / Mobility (20) | 3 | 17 |
| **Total** | **~74** | **~134** |

Most "needs work" flags are **jargon-only** on otherwise-solid, hand-written
content (the core lifts). The **severe** defects — where a beginner would perform
the *wrong* exercise — are concentrated in **~45 template-generated entries**.

## Root causes (systemic)

1. **Wrong-movement template content (most severe).** A shared fallback generator
   in `server/data/workoutLibrary.js` fills `setup`/`execution`/`visualSequence`
   from generic movement-pattern templates when an exercise lacks explicit content
   — and the template doesn't match the actual movement:
   - **Calf raises** (seated / standing / single-leg) describe an **arm raise**
     ("move the arms through the target arc… without turning into a shrug… neck relaxed").
   - **Bike sprint** and **Jump rope** describe **running/marching** ("soft landings,
     fast arms help fast legs, high-knee march").
   - **Concentration / Preacher / EZ-bar / Reverse / Wrist / Towel curls** describe a
     **standing dumbbell curl** (wrong stance/grip/tool).
   - **Machine / T-bar / Tripod / Suspension rows** share a generic "set the torso and
     shoulders before the first pull" stub with no real setup.
   - **Neutral-grip lat pulldown** describes a **row**; **Straight-arm band pulldown**
     tells you to bend the elbows and row (the opposite of the exercise).
   - **Band / Dumbbell thruster** describe a **hip thrust**, not squat-to-press.
   - **Bench / dumbbell / machine presses** share a "set the shoulders and wrists" stub
     (several reference lowering to the "chest" on a *shoulder* press).
2. **Missing the defining half of combo / variant moves.** Goblet-squat-to-press,
   Step-up-to-knee-drive, Push-up-to-down-dog, Plank shoulder tap, Single-leg glute
   bridge, Cossack squat, Heels-elevated goblet squat, Band row to squat, Renegade
   row, Man maker — the named feature (the press, the knee drive, the tap, the single
   leg, the heel wedge, the crawl-drag) is never described.
3. **Broken auto-generated list fields.** `progressions`/`regressions` literally read
   *"Reduce load or shorten the range slightly if the pattern feels shaky today.."* and
   *"Swap to a lower-stress movement in the same family"* on ~15 exercises; several
   `advancedTips` say **"Make it harder: [reduce load / an easier variant / the exercise
   itself]"** (backwards or self-referential); some machines say "Make it harder: Lower
   resistance/speed/pace".
4. **Generated report-field bugs (FIXED).** The 7 fields this audit generated
   (`scripts/exercise-manufacturing-report.mjs`) had mis-targeted derivations —
   "Elbows/wrists" injury notes on leg machines, "overhead" mobility on calf/forward
   presses, "add load / slow the lowering" tips on bodyweight/cardio/power, and wrong
   rep/rest on stretches and cardio drills. **Fixed and re-rendered** (class-aware).
5. **Pervasive jargon.** "brace", "hip hinge", "neutral spine", "eccentric",
   "scapula / shoulder-blade control", "ribs stacked/down", "packed/organized shoulders",
   "external rotation", "front rack", "dorsiflexion", "anti-rotation", "hollow",
   "thoracic", "lockout" — undefined for a child. Needs a plain-language glossary
   applied to source `setup`/`execution`/`cues`.
6. **Metadata errors.** `difficulty: "standard"` (invalid label, ~5 exercises);
   Wrist curl mis-categorized under Biceps (it's Forearms); Ring push-up labeled
   "beginner" (it's harder); empty `secondaryMuscles` ("—") on Cable Y raise,
   Rear-delt cable fly, Wrist curl; Superman/Cable-pull-through/etc. injury notes
   mismatched in source.
7. **Missing critical safety notes.** Barbell bench press (no spotter / safety-pin
   warning); Hanging knee raise (no "only if you can hang; come down gently"); Skull
   crusher (no face-proximity warning).

## Image / photo-sequence findings (VG-001)

Contact-sheet review of the 75 distinct image sets found **placeholder thumbnails with
baked-in text** (not real photos) on: **arnold-press** (known), **bird-dog**,
**chest-supported-row**, **dead-bug**, **face-pull**. Their step frames are also
placeholder "STEP N" cards — these sets need regeneration (or replacement) via the
Gemini pipeline. (Full image review continues.)

## Fix plan (priority order)

- **P0 — wrong-movement source content (~15):** rewrite setup/execution/visualSequence
  for the calf raises, bike sprint, jump rope, the curls, the machine/T-bar/tripod/
  suspension rows, straight-arm band pulldown, thrusters. A beginner currently does the
  wrong exercise. Best done at the template layer (make fallbacks movement-aware) +
  explicit content for the worst offenders.
- **P0 — broken list fields (~15):** replace the "Reduce load…" placeholder
  progressions/regressions and backwards `advancedTips`.
- **P1 — missing defining half (~10):** add the press/tap/knee-drive/single-leg/heel
  wedge/drag to the combo & variant moves.
- **P1 — metadata + safety:** fix `difficulty:"standard"`, Wrist-curl category, Ring
  push-up difficulty, empty secondary muscles; add spotter/hang/face safety notes.
- **P2 — jargon glossary:** define and plain-word "brace", "hip hinge", "neutral
  spine", etc. across source setup/execution/cues.
- **P2 — image regen:** the 5 baked-text placeholder sets.

## Already SOLID (no rework — model entries)
Squat, Deadlift, Push-up, Plank, Dead bug, Glute bridge, Bird dog, Crunch, Side plank,
Goblet squat, Bulgarian split squat, Step-up, Walking lunge, Sumo/Kettlebell deadlift,
Dumbbell chest/floor press, Incline dumbbell press, Machine chest press, Pike push-up,
Rower sprint, Stair climber, and most hand-written core lifts — clear, accurate, safe.
