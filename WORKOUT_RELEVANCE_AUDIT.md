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
- **Residual (open):** runtime SWAP can still introduce a duplicate of another
  slot's movement (swap lists are built per-slot). Tracked as WR-2.

## WR-2 (P1, open) — Swap options are not session-aware
Swapping an exercise can select a movement already present in another slot.
Fix direction: session modal filters swap options against current session
names at render time.
