# PulsePeak Honesty Audit — "Never infer user state from the absence of data"

Ratified into the Product Excellence Standard 2026-07-06. A claim may only be
made from **observed** data — never from missing / zero / default / insufficient
data. This document records the systemic audit and its fixes.

## The canonical trap
`gap = goal − logged`. For any user who hasn't logged (every new user; anyone
before their first entry of the day), `logged = 0`, so `gap = the entire goal`.
Code that treats `gap >= threshold` as "the user is short" then asserts a deficit
that was never observed. The same shape appears with completion ratios
(`logged / goal → 0`), trend windows that default to "flat" with `< 3` points,
streak/consistency scores that default to 0, and recovery values that normalize
to benign defaults.

## Method
Four parallel read-only audits (2026-07-06): `store.js`; the engine libs
(`shared/workoutEngine.js`, `server/data/workoutLibrary.js`,
`shared/movementLibrary.js`); the React client + insight engine; and the media
wiring. Each mapped every inference, its trigger, whether it fires on absence,
whether it renders, and the render path.

## Fixed (live) — commit `e20fad4` (+ prior `14410a1`, `4e3f9a4`)

| Area | Was | Now |
|---|---|---|
| **Seed blueprint** (`createDefaultWellnessData`) | Every account seeded `sleepHours:7.2`, `energyLevel:"Steady"`, and notes "`<name>` is building steady consistency through nutrition and recovery." — all shown by the Coach as observed. | `sleepHours:null`, `energyLevel:null`, `notes:[]`. |
| **Recovery display** (Coach card + plan `adaptiveSignals`) | Normalized defaults (8h / Steady) presented as the user's recovery. `normalizeWellnessData` backfills on every read/write, so raw-absence can't be detected. | Sticky explicit `recoveryLogged` flag, set only by `POST /api/recovery`. Coach shows "Not logged yet"; plan's Recovery-signal / training-baseline lines don't report defaults or empty history as observed. |
| **Top habit** (Coach) | Labeled a never-completed seed habit "Top habit". | Only when `streak > 0`, else "No streak yet". |
| **Weekly focus / plan `focusReason`** | "Recovery through better fueling" + "protein 150g short of goal" from a zero-log user. | Gated behind `nutritionTracked`; goal-based copy otherwise (`14410a1`). |
| **`executionPriorities`, `buildWeeklyPlanPremiumReason`, `getWeeklyPlanPreviewNote`** | Protein/water/calorie gap+completion branches fired from absence (rendered via premium plan + weekly-plan-preview). | Gated behind `nutritionTracked` / `hydrationTracked`. |
| **`habitAnchor`** | "Consistency is still fragile" for a user who never started. | `hasHabitHistory` splits new-user activation copy from lapsed-user "rebuild" copy. |
| **`buildWhyThisWorksBlock`** | trustNote "Built from your actual data"; body claimed recovery/nutrition were shaping the plan; "direction. gym access" caps bug. | Conditioned on `hasLoggedHistory`; honest activation copy otherwise; capitalization fixed. |
| **`buildWorkoutContinuityNote`** (workoutLibrary) | A split "has not shown up recently" for a user with zero training. | Zero-history → neutral "A strong anchor session to open your week with." |
| **Manual-focus recommendation reason** (workoutLibrary) | Always cited "…and recent training history." | Cites it only when `historyContext.workouts.length > 0`. |
| **Dashboard "today's session" reason** | Third-person "the engine is rotating…"; title/reason contradiction. | Warm second person; goal-anchored (`a732fc0`/`bd1fba1`/`4e3f9a4`). |

## Verified already-honest (no change)
`buildInsights` / `buildNextBestAction` — activation-only for `< 2` workouts;
every assertive insight (comeback, streak-risk, PR, neglected, improved,
volume-trend, plateau, best-day) requires observed history. `getWeeklyTrend`
returns "flat" (inert) for `< 3` points. `buildResultProjection` else-branches
are honest hedges. `StreakCard`/`WeekInReview`/`TodayForYou` have correct empty
states. `getUpgradeMoment` gated behind real momentum.

## Dead twins — NOT rendered, left untouched (harden if ever wired)
These contain the same un-fixed absence-of-data narrative but are
imported-never-called or their output field is never read, so no user sees them.
**If any is revived, apply the `nutritionTracked` / `hasTrainingHistory` /
`recoveryLogged` pattern first.**
- `store.js`: `buildTodayFocusCard`, `buildCoachDecisionEngine`,
  `buildCoachingTips`, `buildTodayFocus`, `buildMomentumFeedback` (imported into
  server.js, never invoked — `/api/coaching` uses `buildLaunchSafeCoachResponse`).
- `store.js` `buildWorkoutEngineSummary`: `continuityNote` / `recentRotationNote`
  fields are not read by any client (per-workout notes come from workoutLibrary).
- `shared/workoutEngine.js`: the entire ~256–1313 narrative layer
  (`getConsistencyTrend`, `getProgramPhase`, `getIdentitySignal`,
  `getModuleContinuityContext`, `getSystemTrustCue`, `getMilestoneMoments`, …) —
  zero external call sites, not exported/used. **Recommend deleting this layer**
  to prevent accidental future wiring.

## Follow-ups
- Add a recovery-logging UI (sleep/energy) — until then `recoveryLogged` is
  always false and the Coach honestly shows "Not logged yet". `POST /api/recovery`
  already exists and now sets the flag.
- Consider deleting the dead `workoutEngine.js` narrative layer.
