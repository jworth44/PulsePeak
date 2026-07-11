# Full Product User Audit — Recovery Directive (living register)

Status log of the recovery operation. Statuses reported SEPARATELY per the
directive; "premium complete" is never claimed from green QA alone.

## Injury / limitation intake (Part 7) — 2026-07-11
**Before:** "Injury Support" collected issue-type → injury/area → symptom
only. Missing every safety-relevant item the directive requires: affected
SIDE, current TOLERANCE, and whether the user has been CLEARED to exercise.
No conservative guidance keyed to severity.

**Fix (this pass):**
- Added a `InjurySafetyIntake` step block (side · movement tolerance ·
  exercise clearance) rendered in the results view — the surface the user
  actually reaches, because injury support becomes "ready" the instant the
  primary injury/ache is chosen (the original steps, embedded in the now-
  hidden chooser, were unreachable — caught and fixed during verification).
- `renderInjuryGuidance` gives conservative, transparent, NON-diagnostic
  guidance that escalates with the answers:
  - not cleared OR significant pain → **STOP** tone: "won't work through
    pain… see a qualified professional before loading this pattern."
  - not sure OR mild → **CAUTION**: pain-free range, ease in.
  - pain-free + cleared → **OK**: gentle controlled support work.
  - nothing answered → asks for the two safety inputs.
- Summary line now reflects collected context (e.g. "Tennis elbow ·
  Pain-free through range").

**Verified live (headless):** three questions reachable in results view;
tone transitions significant+no → STOP, pain-free+cleared → OK; summary
reflects side/tolerance. build 0 · qa:launch 19/19 · dedup 700 · personas 49.

**Honest residual:** intake is collected + drives guidance messaging; it
does not yet persist to the profile or hard-filter routine lists beyond the
existing restricted-area engine safeguards (PA-2). Persisting the richer
context (triggers, ROM) is a larger data-model change — queued, owner-visible.
