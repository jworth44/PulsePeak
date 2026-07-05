# PulsePeak Production Log

## STATUS (CEO dashboard — updated every unit)

| | |
|---|---|
| **State** | Pre–Production Complete (0 of 2 states granted) |
| **Last verified** | 2026-07-05 — build exit 0 · qa:launch **13/13** · 0 blockers · **0 warnings** · api-hardening scenario green (malformed→JSON 400 no leak, /api 404 JSON, oversized password rejected 22ms, auth rate-limit 429) · atomic-write/guarded-read directly verified |
| **Engine matrix** | **6 of 6 engines ✅** — all engines E2E-verified via `engine-depth-e2e` |
| **Media ledger** | **ZERO unmatched ✅** (was 36) — backlog #2 COMPLETE |
| **Exercise-library visuals** | **172 / 208 visual guides (83%)** ✅ — wired 107 existing-but-unused image sets (`0c94589`); 36 remain text-only, need generation. `qa:exercise-library` PASSED, 0 broken |
| **Model standard** | FACTORY §5b: two locked models (fit/tanned/toned/beautiful), one per exercise; `qa:model-consistency` = **49 exercises ✓**; both male + female models in library |
| **Design** | **Design System v2.0 "Peak" LIVE ✅** — research-driven world-class redesign (`DESIGN_RESEARCH.md` + `DESIGN_SYSTEM.md`); retuned `:root` tokens + `styles-polish.css` v2 + **mobile bottom tab bar**; verified both viewports |
| **PWA / installability** | **Backlog #3 COMPLETE ✅** — manifest + SW + icons built & served; honest `beforeinstallprompt` install-prompt UI (iOS hint fallback, dismissible, hides when installed); both prerequisites now **machine-enforced** in qa:launch (`pwa-installability-assets` + `mobile-viewport-shell` at true 390px) |
| **Security / hardening** | **Backend-hardening unit DONE ✅** (red-team-driven) — atomic DB write + guarded read (P0 corruption fixed); password length cap + per-IP auth rate limiter (P0 unauthenticated scrypt-DoS + brute-force fixed); terminal error middleware + `/api` JSON 404 (P1 stack-trace/HTML leaks fixed); CORS safe default. Locked by qa:launch `api-hardening`. **Still open (owner/other units):** P0 ephemeral `/tmp` persistence (owner infra gate), O(n) full-file write + async scrypt (persistence unit), input type-confusion (input-integrity unit) — see `RED_TEAM_AUDIT.md` |
| **Active unit** | none (backend-hardening unit closed) |
| **Next unit** | owner's call — options: persistence (P0 `/tmp`, owner-gated) · input-integrity unit (P1 type-confusion/whitespace-wipe) · the **Living Coach** differentiation wedge (needs owner to enable an Anthropic API key on the host) · Backlog #4 CI. See `PRODUCT_DIFFERENTIATION.md` + `RED_TEAM_AUDIT.md` §8 |
| **Open escaped defect** | Arnold Press exercise media has baked-in text ("3. ARNOLD PRESS / THUMBNAIL") — regen via Gemini in a media unit (VG-001) |
| **Owner gates pending** | none — next owner decision arrives at live Stripe keys (after Premium Complete) |
| **Owner gates pending** | none |

---

One line per unit: date · what · why · evidence. Newest first.

- **2026-07-05 · Backend-hardening unit — clears red-team P0/P1 security findings ✅** —
  Driven by `RED_TEAM_AUDIT.md` (6-agent adversarial audit + live break-testing).
  Owner endorsed sequencing hardening first (clears launch-blockers, no owner
  gates) before the differentiation build. **Fixed:** (1) **P0 DB corruption** —
  `writeDb` now writes a temp file then atomically `rename`s over the live DB
  (crash/OOM/disk-full mid-write can no longer truncate it), with a direct-write
  fallback for OneDrive/Windows lock cases; `readDb` wraps `JSON.parse` in
  try/catch and surfaces a clean guarded error instead of crashing every request
  with a raw `SyntaxError` (`server/data/store.js`). (2) **P0 unauthenticated
  DoS** — `assertValidPassword` now caps length at 128 **before** any scrypt runs
  (a 200k-char password was measured freezing the event loop ~8.7s; now rejected
  in **22ms**) and requires a string type; a dependency-free per-IP fixed-window
  rate limiter (100 auth attempts / 15 min) fronts `/api/auth/register` +
  `/api/auth/login`, stopping online brute force + registration floods
  (`server/server.js`). (3) **P1 info-leak** — a terminal 4-arg error middleware
  converts body-parser failures + any uncaught throw into clean JSON (no HTML
  stack traces disclosing absolute server paths), and an `/api` catch-all returns
  JSON 404 instead of Express's default "Cannot GET /api/…". (4) **P2** CORS now
  defaults to same-origin-only when no origins are configured (was fully-open).
  **QA:** new `api-hardening` launch scenario asserts all four behaviors
  (malformed JSON → JSON 400 no path leak; unknown `/api` → JSON 404; oversized
  password rejected fast; auth burst → 429 after 92 attempts) — runs after
  browser coverage so the rate-limit burst can't starve scenario logins.
  Atomic-write round-trip + corrupt-file guarded-read verified directly out of
  band. Evidence: build exit 0; qa:launch **13/13**, 0 blockers, 0 warnings.
  **Deliberately deferred** (noted in log/audit, not silently dropped): async
  scrypt + O(n) full-file-write (persistence unit), ephemeral `/tmp` (owner infra
  gate), input type-confusion/whitespace-wipe (input-integrity unit).
- **2026-07-05 · Backlog #3 — PWA installability: install-prompt UI + machine-enforced PWA/mobile QA ✅ (BACKLOG #3 DONE)** —
  The PWA scaffolding (VitePWA manifest, service worker, icons, meta tags) was
  already built and committed, but two pieces of the backlog item were missing:
  an install affordance and *machinery* to enforce gate 5 ("both platforms")
  and installability so they can't silently regress. **Built** a new honest
  `InstallPrompt.jsx` (mounted in `AppShell`): listens for `beforeinstallprompt`
  (which the browser fires only when the app genuinely meets install criteria),
  suppresses the mini-infobar, and shows a branded, dismissible card with a real
  Install button that triggers the native prompt — renders **nothing** when the
  event never fires (no dead button); iOS (no such event/API) gets an honest
  "Share → Add to Home Screen" hint instead; hides when already installed
  (`display-mode: standalone`) or after `appinstalled`; a dismissal is remembered
  14 days. Styled in `styles-polish.css` from the v2 design tokens (sits
  bottom-right on desktop, above the fixed tab bar on mobile). **QA hardening**
  in `launch-readiness.mjs`: (1) `pwa-installability-assets` — a non-browser
  audit that fetches `/manifest.webmanifest` (validates name/short_name/
  start_url/`display:standalone`/192+512+maskable icons **and that every
  referenced icon actually resolves as an image**), `/sw.js`, and the
  apple-touch-icon; (2) `mobile-viewport-shell` — a real 390×844 Playwright
  context asserting the desktop sidebar is hidden, the bottom tab bar takes over,
  the primary routes render, tab-bar navigation actually routes, and **no page
  scrolls sideways** on any surface (the exact regression the redesign fixed by
  hand — now guarded by machinery). Caught + fixed one QA-authoring bug: the
  `/nutrition` matcher `/nutrition/i` resolved to the hidden sidebar nav link at
  mobile width and hung on waitFor-visible → retargeted to visible page copy.
  **In-browser verification** (Chrome, authed AppShell): install prompt renders
  premium, the Install button fires `prompt()` + dismisses, and the dismissal
  persists to localStorage. Evidence: build exit 0; qa:launch **12/12**, 0
  blockers, 0 warnings; `pwaAssets.errors: []` (manifest "PulsePeak — Personal
  Fitness Companion", 3 icons). Gate 5 (both platforms) is now enforced by CI
  machinery, not memory — a Production-Complete prerequisite.
- **2026-07-05 · Design System v2.0 "Peak" — research-driven world-class redesign ✅✅** —
  Owner rejected the prior look and commissioned a full autonomous revamp
  ("find the top 5 web + top 5 mobile H&F apps, analyze business model /
  design / features / palettes / ease of use / reviews, then rebuild to a
  top-of-field bar"). **Research:** 3 parallel deep-research passes (top web
  apps, top mobile apps, buildable design language) → `DESIGN_RESEARCH.md`
  (10-app teardown: Strava, WHOOP, Oura, Garmin, TrainerRoad, Fitbod, Hevy,
  Strong + steal/avoid) and `DESIGN_SYSTEM.md` (the buildable token spec).
  **Key adopted principles:** WHOOP semantic-color discipline (red = brand +
  effort, **Volt lime** = peak/PR/achievement, green/amber/red readiness
  scale — red never doubles as success); dark-gray canvas (not pure black);
  progressive disclosure; elevation via hairline-top highlight not drop
  shadows; tabular figures on metrics. **Build:** retuned the default-theme
  `:root` tokens in `styles.css` (cool near-black layers `#0A0B0D`/`#121417`,
  refined Pulse Red `#F5283D`, Volt `#A3E635`, semantic + readiness palette,
  tightened radii 20/14/10, layered dark-elevation, motion + spacing scales)
  — propagates across all 4859 lines; rewrote `styles-polish.css` as the v2
  layer (cards, buttons, chips, data-viz rings/bars/lines, empty states,
  forms, motion); added SVG gradient + volt-peak state to `ProgressRing.jsx`.
  **Biggest UX win:** new **mobile bottom tab bar** (`AppShell.jsx` + CSS —
  Today · Workouts · Library · Nutrition · Progress, inline Lucide-style
  icons, per-page active state) replacing the old sidebar-stacked-above-
  content mobile layout; sidebar hidden on mobile. **Browser verification
  caught + fixed a real responsive bug:** `.content-grid` (flex row, 380px
  basis, no wrap) forced panels ~650px wide → horizontal scroll/clipping at
  390px; fixed by stacking `.content-grid` + `min-width:0` on descendants +
  `overflow-x:clip` guard (page now never scrolls sideways; firstPanelW 390
  on every page). Kept Space Grotesk + Instrument Sans (premium, already
  loaded) with tabular-nums for stats. Evidence: build exit 0; qa:launch
  **10/10**, 0 blockers, 0 warnings; **0 console errors** desktop 1440 +
  mobile 390; all 7 surfaces + movement modal verified premium both viewports.
- **2026-07-04 · Design Polish unit — premium visual overlay LIVE ✅** —
  Owner set a hard bar ("world-class, $50k-professional-web-designer
  quality; a vibe that makes people WANT to explore") after the base UI
  read as terrible. Built `src/styles-polish.css` — a cascade-LAST,
  purely-visual overlay (imported in `main.jsx` after `styles.css`, keyed to
  real class names, zero structural/logic/classname changes): atmospheric
  radial-glow backdrop, tightened gradient type hierarchy, elevated card
  surfaces (gradient + inset highlight + layered shadow + top edge-light),
  hover-lift on clickable cards, glow buttons, refined chips/pills,
  image-forward exercise-library cards (thumb → full-width 16:10 banner with
  overlaid badges + scrim; clean branded placeholder tile for text-only
  entries), sidebar active-pill glow, custom scrollbar, form-control focus
  rings. **Browser verification (the whole point of this unit) caught + fixed
  two real defects the build could not:** (1) `backdrop-filter: blur(2px)` on
  `.app-main` created a containing block for `position:fixed`, throwing the
  `.modal-backdrop` off-screen (movement-guide modal opened at y≈15600px,
  invisible) → removed the filter (added a guard comment); (2) the
  `.sidebar-brand` wordmark was clipped because the base CSS lays it out as a
  flex ROW (built for a logo-mark+copy pair) but the component renders
  eyebrow + `<h1>` + tagline → restacked as a vertical brand lockup. Verified
  all 7 surfaces (dashboard, exercise-library, movement modal, workouts,
  plan, nutrition, progress) at desktop 1440 (Chrome MCP) AND mobile 390
  (playwright-core, isolated Chrome) — all premium, modal correct both
  viewports, image cards stack cleanly. Evidence: build exit 0; qa:launch
  **10/10**, 0 blockers, 0 warnings; **0 console errors** both viewports.
  Escaped defect surfaced (not part of this CSS unit): Arnold Press media has
  baked-in label text — queued for a Gemini regen (VG-001 media unit).
- **2026-07-04 · Unit 2 Phase B batches 8–13 — media ledger 6 → ZERO ✅✅ (BACKLOG #2 DONE)** —
  Ab Wheel Rollout, Bear Crawl, Box Jump, Skater Hop, Battle Rope Waves,
  Medicine Ball Slam — the last, most dynamic exercises, all 4-frame
  locked-model sets via Gemini, identity consistent, wired + reviewed.
  Gemini quirks handled: transient content refusals on mid-air frames
  (reworded to "crisp frozen action photo"), out-of-order downloads
  (re-sequenced after vision check), and a persistently stuck composer on
  the med-ball chat (finished that batch in a fresh chat, reference
  re-pasted — identity held). **Final: qa:launch unmatchedExerciseVariants=[],
  warnings=[]; all 36 originally-unmatched variants resolve to canonical
  reviewed media.** Evidence: qa:model-consistency 49/49; qa:launch 10/10,
  0 blockers, 0 warnings; build exit 0. Committed per-batch.
- **2026-07-04 · Unit 2 Phase B batches 6–7 — Hollow Body Hold + Lateral Band Walk; ledger 11 → 6 ✅** —
  Hollow Body Hold (male, `+hollow rock`) and **Lateral Band Walk — first
  use of the locked FEMALE model** (glute exercise; `+hip abduction`,
  `+clamshell`), 4-frame sets with a visible resistance band, identity
  consistent across all frames, uniform 1536×1024, wired + reviewed.
  Evidence: qa:model-consistency 43/43; qa:launch 10/10, 0 blockers; build
  exit 0. **6 exercises left: Ab Wheel, Bear Crawl, Box Jump, Skater Hop,
  Battle Ropes, Med Ball Slam.**
- **2026-07-04 · Unit 2 Phase B batches 4–5 — Leg Raise + Superman via Gemini; ledger 14 → 11 ✅** —
  Leg Raise (`+aliases lying leg raise, hanging knee raise`) and Superman,
  each 4-frame locked-male sets, identity consistent first-try (no
  rejections), uniform 1536×1024, wired + reviewed. Committed. Evidence:
  qa:model-consistency 41/41; qa:launch 10/10, 0 blockers; build exit 0.
- **2026-07-04 · Model-identity standard + audit + push-up escaped-defect fix ✅** —
  owner mandate: same model across an exercise's full set; use fit, athletic,
  tanned, toned, beautiful men/women. Both locked references
  (`reference_male.png`, `reference_female.png`) already meet that bar →
  formalized as **FACTORY §5b** (locked-models-only, one-model-per-exercise,
  the look is a gate). Built **`qa:model-consistency`** audit: for every
  multi-frame model exercise verifies all frames present + dimensionally
  coherent (scale-ratio ≤ 1.1, so legacy sub-pixel variance passes but mixed
  sources fail) + review-sourced; emits `artifacts/model-consistency-manifest.json`
  for the vision pass. First run flagged **push-up** (frames 192×184 vs
  1672×941 — 3 garbled label-fragment crops + 1 full frame of the WRONG
  dark-haired model). Regenerated push-up 4/4 via Gemini with the locked
  blond model (identity correct first try), rebuilt to uniform 1536×1024,
  reviewSource → `pulsepeak_gemini_push_up_male_v3`. Audit now **39/39 ✓**.
  Added the model-identity row to the §5 quality gates. Evidence:
  qa:model-consistency 39/39; qa:launch 10/10, 0 blockers; build exit 0;
  crunch + russian-twist + push-up vision-verified same-model across all frames.
- **2026-07-04 · Unit 2 Phase B batch 2 — Russian Twist shipped via Gemini; ledger 15 → 14 ✅** —
  4-frame set (start / mid-right / peak-left / finish-center) + thumbnail,
  locked male model, every frame reviewed; 2 drift rejections (dark hair;
  invisible rotation) fixed with explicit locks. Committed `72edcab` region.
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
