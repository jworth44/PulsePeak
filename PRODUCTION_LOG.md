# PulsePeak Production Log

## STATUS (CEO dashboard — updated every unit)

| | |
|---|---|
| **State** | Pre–Production Complete (0 of 2 states granted) |
| **Last verified** | 2026-07-04 — build exit 0 · qa:launch **10/10** · 0 blockers · 0 console errors |
| **Engine matrix** | **6 of 6 engines ✅** — all engines E2E-verified via `engine-depth-e2e` |
| **Media ledger** | **15 unmatched** (was 36) — Gemini pipeline proven, Crunch shipped |
| **Active unit** | Unit 2 Phase B — Gemini media production (owner-approved, in progress) |
| **Batch in flight** | **Russian Twist 2/4 frames approved+staged** (`temp/media-staging/russian-twist/step-1-raw.png` start · `step-2-raw.png` mid-right). Still needed: peak (rotated LEFT, hands by left hip) + finish (back to center, hands at chest) — the Gemini chat "Photorealistic Athlete Russian Twist" hung mid-stream; resume there or start a fresh chat with the reference re-pasted. Then: crop/resize/wire/QA per the batch-1 recipe below. |
| **Next unit** | finish Russian Twist → Leg Raise → Hollow Hold → Superman → Ab Wheel → Bear Crawl → Lateral Band Walk → Box Jump → Skater Hop → Battle Ropes → Med Ball Slam |
| **Owner gates pending** | none |

---

One line per unit: date · what · why · evidence. Newest first.

- **2026-07-04 · Unit 2 Phase B batch 1 — Crunch shipped via Gemini; ledger 19 → 15 ✅** —
  owner approved Gemini (no API cost) over gpt-image-1. **Proven recipe:**
  (1) put `public/media/models/reference_male.png` on the Windows clipboard
  (PowerShell STA `Clipboard::SetImage`), paste into a fresh
  gemini.google.com chat (Ctrl+V via Chrome MCP); (2) one chat per movement
  — prompt each step with "same athlete, same gym, same camera angle",
  step states = start position / mid movement / peak contraction / finish
  position, always append "No text, no watermarks", explicitly lock
  wardrobe ("tank top fully covering the torso" — step-3 first attempt
  exposed abs and was REJECTED + regenerated); (3) download each image
  (lands in `N:\Downloads\Gemini_Generated_Image_*.png`), stage to
  `temp/media-staging/<slug>/step-N-raw.png`; (4) review EVERY frame at
  full res against MEDIA_APPROVAL_STANDARD; (5) post-process: crop
  2160×1440 at offset (60,100) — removes the Gemini ✦ sparkle corner —
  then bicubic-resize to 1536×1024 into
  `public/media/exercises/<slug>/step-N.png`, thumbnail = copy of peak
  frame; (6) declare `approvedAsset("<slug>-photo", …reviewSource:
  "pulsepeak_gemini_<slug>_male_v1")` in mediaReviewCatalog + movement
  entry + aliases; (7) qa:launch must stay green with the slug absent from
  missing/broken lists. **Remaining queue (11 batches / 15 variants):**
  Russian Twist · Leg Raise (+alias hanging knee raise) · Hollow Body Hold
  (+alias hollow rock) · Ab Wheel Rollout · Superman · Bear Crawl ·
  Lateral Band Walk (+aliases hip abduction, clamshell) · Box Jump ·
  Skater Hop · Battle Rope Waves · Medicine Ball Slam.
  Evidence: crunch 4/4 frames pass review (1 rejection/regen logged);
  qa:launch 10/10, 0 blockers; build exit 0.
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
