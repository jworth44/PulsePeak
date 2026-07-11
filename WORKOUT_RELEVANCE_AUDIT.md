# Workout Relevance Audit — Recovery Directive Part 5

## WR-1 (P0) — Sessions repeated the same exercise ✅ FIXED
- **Route/screen:** any generated session (owner evidence: "Mobility / Recovery
  Day (Bench + Dumbbells)" listing Cat-cow repeatedly)
- **Expected:** every slot a distinct movement; small pools shrink the session
  honestly, never pad it with repeats
- **Actual (pre-fix):** `buildExerciseForSlot` ranked candidates independently
  per slot with no session-level memory, so same-pool slots all picked the
  same top-ranked variant. Reproduced at scale by the new gate: Mobility/
  Recovery (cat-cow ×N), Back+Biceps (biceps curl ×N), Chest+Triceps
  (overhead dumbbell extension ×N) — bodyweight/limited-equipment contexts hit
  hardest because filtering collapsed the pool.
- **Root cause:** no cross-slot dedup; pool-wide fallback could also re-pick
  used variants.
- **Correction:** session-level `usedExerciseNames` threaded through slot
  building (variant + displayed guide name both recorded); fallback excludes
  used variants; exhausted slot returns null (dropped) rather than repeating;
  final assembly-level dedup enforces the invariant unconditionally.
- **Verification:** `scripts/session-dedup-audit.mjs` — 700 sessions × 60
  contexts (3 environments × 4 equipment setups × 5 profiles incl. 40+,
  shoulder- and knee-restricted). Pre-fix: multiple failures (negative test).
  Post-fix: PASS. Gate is now unskippable — `qa:launch` runs it first.
- **Residual:** none for the dropdown flow — see WR-2.

## WR-2 — Swap session-awareness ✅ VERIFIED ALREADY GUARDED (claim corrected)
WR-1's analysis assumed generation-time swap lists could reintroduce
duplicates at runtime. **Live adversarial verification (2026-07-11, premium
populated session) disproved that:** `WorkoutDetailModal` recomputes each
slot's swap dropdown against all other slots' CURRENT selections on every
render (src/components/WorkoutDetailModal.jsx:410-416). Probe results: 5
slots — 0 duplicate selections, 0 already-selected names offered in any
dropdown, and after performing 2 real swaps still 0/0. The dropdown is the
only swap surface, so the UI cannot assemble a duplicate session. No code
change required; register corrected per the reporting-precision rules.

## WR-3 — Injury Support intake VERIFIED functional (Part 7)
Live probe (2026-07-11): the Injury Support path is a real multi-step wizard,
not a label. Step 1 "What are you managing?" (Injury / Ache) → Step 2 renders
8 body areas (Lower back, Calves, Shoulders, Hips, Knees, Ankles, Neck,
Wrists) → symptom step → targeted results. Combined with the persona audit
(results change per answer: ACL→knee rehab, tennis elbow→forearm), Part 7
intake depth is satisfied. No change required.

## WR-4 (P1) — Hybrid users got an EMPTY equipment selector — FIXED
Found by Part 6 filter probing. `getEquipmentSelectionOptionsForEnvironment`
returned all options only when `environment === "hybrid"`, but the Workouts
filter uses `"both"` for hybrid/either. No equipment option lists `"both"` in
its environments, so the function returned [] and the "tap the equipment you
have today" grid rendered EMPTY for every hybrid user — they could not select
equipment at all (the owner's own default profile is hybrid).
- **Verify:** `getEquipmentSelectionOptionsForEnvironment('both')` was 0
  (hybrid 8, home 6). Now 8, and the live grid renders all 8 chips and toggles.
- **Fix:** treat "both" as a synonym of "hybrid" in the function.
- qa:launch 19/19, qa:personas PASS, build 0.
