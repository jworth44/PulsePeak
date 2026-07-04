# PulsePeak Production Log

## STATUS (CEO dashboard — updated every unit)

| | |
|---|---|
| **State** | Pre–Production Complete (0 of 2 states granted) |
| **Last verified** | 2026-07-04 — build exit 0 · qa:launch **10/10** · 0 blockers · 0 console errors |
| **Engine matrix** | **6 of 6 engines ✅** — all engines E2E-verified via `engine-depth-e2e` |
| **Media ledger** | **19 unmatched** (was 36) — remaining are net-new patterns needing generated media |
| **Active unit** | Unit 2 Phase B — parked on owner gate |
| **Next unit** | Backlog #3 (PWA installability) while Phase B is gated |
| **Owner gates pending** | **Phase B media generation:** ~19 movements × 5 images via gpt-image-1 on the configured OPENAI_API_KEY (~95+ images, est. $10–30 with retries). §6: real-money spend needs owner OK. |

---

One line per unit: date · what · why · evidence. Newest first.

- **2026-07-04 · Unit 2 Phase A — media ledger 36 → 19 (backlog #2, zero-cost wiring) ✅** —
  every unmatched variant that could honestly resolve to *already-approved*
  media now does: 2 new canonical movements added with reviewed 4-step
  assets (**Bird Dog**, **Jumping Jack** — media existed on disk, approved
  in `mediaReviewCatalog`, but no movement entry) + 15 aliases extending
  the library's own established granularity (precedents: "leg curl"→deadlift,
  "bike sprint"→high-knees, "banded good morning"→deadlift): sumo deadlift/
  good morning/hamstring curls→deadlift, leg extension→squat, split-squat
  family→supported-split-squat, lunge-family dumbbell variants→lunge,
  glute kickbacks→hip-thrust, treadmill walk & assault bike→high-knees.
  Remaining 19 are genuinely new patterns (crunch family, hip-abduction
  family, hollow holds, rollout, superman, bear crawl, jumps, ropes, slam)
  — need generated media → **Phase B parked on owner gate (API spend)**.
  Evidence: direct resolver check 17/17 → correct ids with media;
  qa:launch 10/10, 0 blockers; build exit 0; no new missing-media or
  broken-mapping warnings.
- **2026-07-04 · Unit 1 — Engine QA depth (backlog #1) ✅** — added the
  `engine-depth-e2e` launch-QA scenario: dedicated seed user logs a meal
  (mutation + rendered totals asserted), toggles a habit (persists across
  reload), submits the weekly check-in (acknowledged after reload), and the
  Progress page must reflect it all (streak + non-zero completion).
  **Two real defects found and fixed en route:** (1) the Habit engine was a
  dead surface — `HabitList` existed but was mounted nowhere and
  `/api/habits/toggle` had zero UI callers; wired it into the dashboard as
  the "Daily habits" panel (+ singular/plural streak copy fix). (2) the
  weekly check-in never acknowledged submission — `buildLaunchSafeWeeklyCheckInState()`
  hardcoded `submittedThisWeek: false`, so the UI re-asked forever; it now
  computes the flag truthfully while keeping launch-baseline coaching copy
  disabled. Finding logged for later: `/api/recovery` (sleep/energy) has no
  UI caller — fold into backlog #4/#6 scope when coaching returns.
  Engine matrix now **6/6 ✅**. Evidence: qa:launch 10/10, 0 blockers,
  0 console errors × 3 consecutive runs; build exit 0; live browser check
  desktop + 390px mobile viewport (3 habit cards, toggle → "Done today",
  no horizontal overflow, no console errors).

- **2026-07-04 · Factory V1.1 — verification review** — audited QA coverage
  against the six product engines and the owner's manufacturing vocabulary.
  Found: Workouts/Library deeply verified; Nutrition/Habits/Body-Metrics/
  Progress had zero or render-only coverage. Added Engine Verification
  Matrix (§5a) with the rule that Production Complete requires all-✅;
  reordered backlog gates-first (Engine QA depth is now #1, CI added as #4);
  adopted Production Complete → Premium Complete ladder (§8); mapped all 18
  vocabulary concepts to single homes (§10); added this STATUS block.
  Evidence: route/scenario audit of `scripts/launch-readiness.mjs` +
  `server/server.js` route inventory.
- **2026-07-04 · Factory V1.0 adopted** — replaced the "Independent
  Manufacturing System Directive" with `FACTORY.md` after an 8-flaw audit
  (no product definition, unmeasurable quality, meta-factory, unbounded
  scope). Evidence: this document set; baseline QA 9/9 pass, 0 blockers.
- **2026-07-04 · Repo relocated** — moved from `OneDrive\Documents\New
  project` to `JW_APPS\PulsePeak` (correct home alongside other products).
  Superseded PWA-MVP experiment archived at `JW_APPS\PulsePeak-pwa-mvp-ARCHIVE`.
  Evidence: post-move `npm run build` exit 0 + launch QA green.
- **2026-07-04 · Launch-QA gate de-flaked (preferences "Minimal")** — bare
  10 s `waitFor` raced cold reload+networkidle and false-failed the launch
  gate; now anchors on the stable panel heading and dumps full diagnostics
  on true failure. Evidence: QA failed cold before fix; 3 consecutive green
  runs (9/9, 0 blockers) after.
