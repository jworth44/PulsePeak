# PulsePeak Production Log

## STATUS (CEO dashboard — updated every unit)

| | |
|---|---|
| **State** | Pre–Production Complete (0 of 2 states granted) |
| **Last verified** | 2026-07-07 — build exit 0 · qa:launch **18/18** · 0 blockers · **0 warnings** (C1-1c checkpoint) |
| **Design direction** | **✅ CD V2 implementation AUTHORIZED (owner 2026-07-07) — building per `CREATIVE_DIRECTION_V2.md` + `PRODUCTION_ROADMAP.md` (12 capabilities C1–C12).** Editorial coach not control panel; one warm accent (Ember/Pine, red+lime retired); two EQUAL first-class themes Midnight/Daylight (cool near-black retired); remove sidebar → 4 bottom tabs (Today/Train/Progress/You); full-bleed 4:5 media tiles + swipeable guide; modals→sheets; three-tier disclosure; media re-shoot standard. **Progress: C1 Foundation ✅ (1a tokens+themes `64db540`, 1b retire-legacy `2f28038`, 1c tracking+doc). NEXT = C2 Product Shell.** |
| **Media quality (owner top priority)** | **`MEDIA_AUDIT_REGISTER.md` + `npm run qa:media`** — only **16/49** photo sets at 1536×1024; 3 resolutions + 3 aspect ratios; 5 broken sub-thumbnail sets; 5 baked-text sets; 33 orphaned dirs; inconsistent models/lighting/grade. Full re-shoot to the §10 media standard = Gemini/owner-cost-gated program. |
| **Honesty (Product Excellence Standard clause)** | **Systemic "never infer state from absence of data" audit DONE ✅** (`HONESTY_AUDIT.md`) — all LIVE offenders fixed at root (seed fabrication, recovery `recoveryLogged` flag, plan gap-copy gating, habit/trust/workout copy). buildInsights verified honest. Dead twins flagged. |
| **Engine matrix** | **6 of 6 engines ✅** — all engines E2E-verified via `engine-depth-e2e` |
| **Media ledger** | **ZERO unmatched ✅** (was 36) — backlog #2 COMPLETE |
| **Exercise-library visuals** | **172 / 208 visual guides (83%)** ✅ — wired 107 existing-but-unused image sets (`0c94589`); 36 remain text-only, need generation. `qa:exercise-library` PASSED, 0 broken |
| **Model standard** | FACTORY §5b: two locked models (fit/tanned/toned/beautiful), one per exercise; `qa:model-consistency` = **49 exercises ✓**; both male + female models in library |
| **Design** | **Design System v2.0 "Peak" LIVE ✅** — research-driven world-class redesign (`DESIGN_RESEARCH.md` + `DESIGN_SYSTEM.md`); retuned `:root` tokens + `styles-polish.css` v2 + **mobile bottom tab bar**; verified both viewports |
| **PWA / installability** | **Backlog #3 COMPLETE ✅** — manifest + SW + icons built & served; honest `beforeinstallprompt` install-prompt UI (iOS hint fallback, dismissible, hides when installed); both prerequisites now **machine-enforced** in qa:launch (`pwa-installability-assets` + `mobile-viewport-shell` at true 390px) |
| **Security / hardening** | **Backend-hardening unit DONE ✅** (red-team-driven) — atomic DB write + guarded read (P0 corruption fixed); password length cap + per-IP auth rate limiter (P0 unauthenticated scrypt-DoS + brute-force fixed); terminal error middleware + `/api` JSON 404 (P1 stack-trace/HTML leaks fixed); CORS safe default. Locked by qa:launch `api-hardening`. **Still open (owner/other units):** P0 ephemeral `/tmp` persistence (owner infra gate), O(n) full-file write + async scrypt (persistence unit), input type-confusion (input-integrity unit) — see `RED_TEAM_AUDIT.md` |
| **Moments / delight** | **Wow-Factor Phases 1–2 DONE ✅** — P1: cinematic completion celebration + count-ups + ring pulse + habit haptics. **P2: real PR / "NEW RECORD" system** — server `detectPersonalRecords` (heaviest weight / best est-1RM / biggest session volume; prior-history-required, no first-time/bodyweight/fake records) returned on both workout-log endpoints; premium PR celebration ("NEW RECORD" · exercise · "185 lb × 8 reps" · record type · Volt glow · haptic). Browser-verified end-to-end. QA `pr-detection` (7 cases). All `prefers-reduced-motion`-safe. Next: Phase 3 Week-in-Review, Phase 4 retention loop |
| **Week in Review** | **Wow-Factor Phase 3 DONE ✅** — `GET /api/week-in-review` + `buildWeekInReview` (rolling 7-day: workouts, streak, total volume, exercises, PRs earned this week, consistency, weekly-goal progress — all derived, never faked). Premium `WeekInReview` recap modal (Volt hero volume, stat grid, goal/consistency bars, PR list, Web-Share + clipboard fallback), dashboard entry "See your week in review". Browser-verified with real data (6,720 lb, 2 records). QA `week-in-review` (7 cases) |
| **Retention loop** | **Wow-Factor Phase 4 DONE ✅** — `buildStreakStatus` (freeze-protected streak, deterministic; states active/at_risk/broken/none) in `summary.streakStatus`. `StreakCard` on dashboard: 🔥 flame + streak, **streak-freeze concept** (buffer bridges up to 2 missed days), adaptive return-prompt/reinforcement copy (loss-aversion at-risk edge), weekly-goal bar. Streak-milestone `CelebrationOverlay` auto-fires at 3/7/14/30… (once, localStorage-guarded, resets if streak breaks). Fixed a real `navigator.vibrate`-without-gesture console warning. Browser + QA `streak-status` (6 cases) verified |
| **Differentiation** | **Wow-Factor Phase 5 DONE ✅** — brutally-honest re-review appended to `PRODUCT_DIFFERENTIATION.md`. Verdict moved from "no reason to exist" → **"a real, defensible reason on the emotion/retention/delight axis"** ("the fitness app that celebrates your progress"), a genuine market gap. Remaining pillars are owner-gated: the **Living Coach** (Anthropic API key/$) and native/wearable reach. **Wow-Factor program (Phases 1–5) COMPLETE** |
| **Attentive intelligence** | **Insight Engine LIVE ✅** — `buildInsights` (honest, evidence-gated): PR opportunity, strength progress, neglected muscle group, comeback, streak risk, weekly momentum, volume trend, plateau, best-training-day; sparse/new user → activation-only (no fabrication); each insight carries evidence + reason + action. `buildNextBestAction`. Dashboard opens with a personalized **"For You Today"** section (`TodayForYou`) — first thing the user sees is specific to their real history. Mission 1 recent-work re-verified independently (all PASS). QA `insight-engine` (10 cases). Browser-verified rich + new-user (honest activation) |
| **Positioning** | **Mission 5 re-answer done** (`PRODUCT_DIFFERENTIATION.md`): *"PulsePeak is the fitness app that actually pays attention — it turns your training data into personal momentum."* Now **product-proven** (insight engine + celebrations + retention loop all live). Remaining differentiator: Living Coach (owner API key). |
| **Design V3 polish** | **IN PROGRESS** — premium product-polish pass (owner: "Apple-worthy craft, less noise/more clarity, one focal point"). **Units 1–4 done:** dashboard hierarchy (For You Today focal; fixed empty-badge + grid dead-space; killed conflicting streak stat; sidebar declutter) · sidebar submenu gated + global heading scale 2.85→2.3rem · premium auth first-impression (screen-blend logo, 7→4-line headline, honest copy) · **onboarding + global badge/logo fix** (`.badge`/`.section-chip`/`.tier-pill` now hug their text everywhere — killed the 922px empty-badge boxes app-wide; screen-blend logo on onboarding + loading screen). Coach + Progress filler/placeholder copy already removed in the correctness sweep. **New-user empty states verified good** (dashboard leads with warm activation hero; Progress has honest empty-state CTAs) — the "wall of zeros" critique is resolved. All qa:launch 18/18. **Remaining audit:** exercise library · nutrition · settings · modals · premium/paywall · thin "Keep the week moving" panel |
| **Active unit** | **CD V2 build — C1 Foundation ✅ COMPLETE (1a/1b/1c). Next: C2 Product Shell** (remove sidebar → bottom tab bar + centered top pill; Today/Train/Progress/You; safe areas). C2+ are visual → verify with real screenshots in a fresh session per roadmap playbook. |
| **Next unit / owner gates** | After C2: C3 Today → C4 Train → C5 Exercise → C6–C10 → C11 media → C12 launch. Owner-only blockers (unchanged): live Stripe, deploy + persistent DB (P0 `/tmp`), domain/DNS, legal, Anthropic key (Living Coach), Gemini media re-shoot. |
| **Open escaped defect** | Arnold Press exercise media has baked-in text ("3. ARNOLD PRESS / THUMBNAIL") — regen via Gemini in a media unit (VG-001) |
| **Owner gates pending** | none — next owner decision arrives at live Stripe keys (after Premium Complete) |
| **Owner gates pending** | none |

---

One line per unit: date · what · why · evidence. Newest first.

- **2026-07-07 · Capability 2 Product Shell (core) — retire the sidebar → 4-door centered shell ✅**
  (`<pending>`) — Rebuilt `AppShell.jsx` to CD V2 §Structure. **Desktop sidebar retired**; both
  viewports now share **one centered content column** and **four primary doors — Today · Train ·
  Progress · You** — rendered as a centered top pill in a sticky top bar (desktop) and the fixed
  bottom tab bar (mobile). Each door that owns sub-pages surfaces them as a **contextual secondary
  nav** at the top of the column, so the 9→4 collapse strands **nothing**: Train → Workouts/Plan/
  Exercise Library/Mobility/Nutrition; Progress → Progress/Coach; You → Account/Preferences/
  Appearance/Module Visibility (all `hiddenModules`-aware; the Progress door drops if both its
  pages are hidden). Safe-area insets (top pill + bottom bar); one `user` icon added, dead icons
  removed. Updated the two shell QA scenarios (`free-user-shell-and-settings`, `mobile-viewport-
  shell`) from sidebar assertions to the top-pill/section-subnav/no-sidebar reality. Fixed the
  Daylight `topbar-profile-tier` micro-label contrast (`--text-muted` 2.87 → `--text-secondary`
  5.58, AA). **Verified (fresh :3007 server, real authed user):** desktop top pill = 4 doors +
  correct active door/sub-item across Today/Train/Exercise Library/Progress/Coach/You; mobile
  (375px) = top bar hidden, fixed bottom bar 4 doors, sub-nav scrolls, **zero horizontal scroll**;
  both themes rendered correctly (Daylight topbar = light paper + ink hairline; active pill/subnav
  = pine, not ember — confirmed after a clean full reload; the mid-session JS `dataset.theme`-swap
  gives stale recalcs, so themes must be verified via bootstrap reload). Screenshot capture was
  environmentally wedged this session (not the app — DOM/snapshot/inspect all fine); taste-level
  pixels → owner 2-min pass at the C2 boundary. build 0; qa:launch 18/18, 0 blockers/warnings; 0
  console errors. **C2 tail (next checkpoint):** delete the now-dead `.sidebar*` / `.nav-link` /
  `.sidebar-submenu-link` CSS (~200 lines) + confirm the loading shell fits the new column.

- **2026-07-07 · Capability 1 Foundation (1c) — tracking-token system + DESIGN_SYSTEM refresh ✅**
  (`<pending>`) — Closed the C1 tail. (1) Added the CD V2 **size-specific type-tracking token
  system** to `styles.css` `:root` (`--track-display/-heading/-body/-numeral/-caps/-caps-loose`)
  — one named scale so screens stop hand-tuning `letter-spacing`; wired the hero display
  headings (`--track-display`) and the shared tabular-numeral block (`--track-numeral`) to it
  (byte-identical values, so zero visual change — indirection only). Later capabilities adopt
  the tokens in their own scope (no big-bang refactor, per roadmap R2). (2) Rewrote
  `DESIGN_SYSTEM.md` end-to-end from the retired v2 "Peak" system (which it still misdescribed —
  Pulse Red + Volt lime + cool near-black) to the **actual CD V2 Midnight/Daylight/Ember token
  system in code** (both palettes tabled, theme resolution, tracking system, reduced-motion +
  focus-visible confirmed) — restores single-source-of-truth. (3) Confirmed reduced-motion
  (global transition/animation kill + JS-hook guards) and `:focus-visible` rings are already
  robust. Evidence: build 0; qa:launch 18/18, 0 blockers/warnings. No new color/background rule
  → leak/contrast scan cannot regress; browser pixel-verify reserved for the visual capabilities
  (C2+) per the roadmap playbook (and this session's :3001 is held by another chat).

- **2026-07-07 · Capability 1 Foundation (1b) — retire old language + Daylight parity ✅**
  (`2f28038`) — Deleted the 5 dead novelty-theme CSS blocks and retired ALL remaining
  legacy palette literals (base `:root` cool-black + the full old red/lime accent hex
  ramp → CD V2; cool surface near-blacks for `.app-main`/`.sidebar`/modals →
  `var(--overlay-rgb)` so they flip per theme; hardcoded pink/cream text →
  tokens). **Zero legacy palette references remain in `src`.** Reframed themes as
  EQUAL first-class (owner clarification): either Daylight or Midnight can be the
  default via one constant; final choice is the owner's after real-world evaluation.
  Evidence: build 0; qa:launch 18/18, 0 blockers/warnings; automated Daylight
  leak-scan (luminance + WCAG contrast) on live pages — Dashboard 0/0, Coach 0/0;
  Midnight surfaces confirmed dark via the same token. Also produced the
  **launch timeline** in `PRODUCTION_ROADMAP.md` (M1 engineering-complete ~22–23
  sessions; M2 publish gated on owner-only infra/Stripe/domain/legal/media).

- **2026-07-07 · Capability 1 Foundation (1a) — CD V2 token system + two themes ✅**
  (`64db540`) — Implementation of the approved Creative Direction V2 began. New
  `src/styles-themes.css` defines two first-class themes with distinct palettes:
  **Midnight** (warm graphite + Ember, the `:root` default) and **Daylight**
  (warm paper + Pine, `[data-theme="daylight"]`), imported last to override the
  retired cool-black + red/lime "Peak v2" palette. Retired the 6 novelty themes →
  `themes.js` exposes System / Daylight / Midnight with real `prefers-color-scheme`
  support + a sync listener; fixed a latent load bug (stored preference was
  ignored). CSP-safe pre-paint bootstrap (`public/theme-bootstrap.js`) prevents a
  theme flash. Tokenized ~160 hardcoded palette literals across the two
  stylesheets (white-alpha → `--ink-rgb`, cool-card → `--card-rgb`, old red/lime →
  `--accent-rgb`, incl. the `body::before` backdrop) + ProgressRing gradient so the
  whole app follows the theme. Evidence: build 0; qa:launch **18/18**, 0
  blockers/warnings; both themes verified on real rendered elements via computed
  styles (Midnight warm cards + ember; Daylight paper cards + pine + espresso +
  warm hairlines); clean default load, 0 console errors. Screenshots unavailable in
  this preview env (renderer compositor hang) — verified via computed styles + qa.
  **Remaining C1 (1b):** component sweep for legacy-language survivors + Daylight
  parity hardening before promoting Daylight to the CD V2 default.

- **2026-07-06 · Learn-before-creating — design research + Creative Direction V2 ✅**
  (`c8cddce`) — Owner: "do not redesign yet; first become an expert in premium
  consumer product design," then "expand to the foundational principles," then
  "compare vs PulsePeak, only then write CD V2." Ran two adversarially-verified
  deep-research passes — (A) 13 premium products (27 sources, 25 claims verified
  3-0) and (B) the canonical design disciplines (22 confirmed, **3 refuted**) —
  captured in `DESIGN_PRINCIPLES_STUDY.md` (12 cited principles + a durable
  framework; the 3 refuted claims recorded so they're never used as fact: no
  ≤200ms motion cap, no "minimalism measurably improves performance," no
  "variable reward makes habits stick"). Then `CREATIVE_DIRECTION_V2.md`: V1's
  instinct held; V2 audits PulsePeak vs the verified principles (diagnosis: the
  logic is already premium, the *packaging* is developer-built), corrects V1's
  refuted claims (spring model over fixed ms; restraint justified by hierarchy
  not performance; streaks as an ethics constraint), and sharpens color into an
  LCH semantic system, disclosure into a named three-tier rule, and type tracking
  into size-specific. **Proposal only — no app code changed; redesign
  implementation remains owner-gated.** Evidence: both research reports verified;
  docs committed; tree clean.

- **2026-07-06 · Creative Direction v1.0 — challenge the design language (PROPOSAL) ✅**
  (`ad666a3`) — Owner halted Design-V3 implementation: the problem is the design
  *language*, not spacing/type/hierarchy — it still reads developer-built. Produced
  a complete Creative Direction proposal (no app code changed) as if Apple/Nike/
  Headspace/Arc/Linear/Peloton were one studio. `CREATIVE_DIRECTION.md` covers all
  18 requested deliverables: philosophy ("editorial coach, not a control panel"),
  identity (one warm **Ember** accent replacing red+lime; two warm themes
  Daylight/Midnight replacing cool near-black), one centered column on every
  viewport, **remove the desktop sidebar → 4 bottom tabs**, kill the database-record
  exercise card + STEP grid → full-bleed 4:5 media tiles + swipeable Start→Peak→
  Finish sequence, modals→sheets, media/image/thumbnail standards (one shoot, one
  grade, 4:5, no baked text), motion (physical/spring/shared-element), type/color/
  component systems, per-screen before/after, rebuild-vs-refine. Plus a shareable
  **visual Artifact** (live theme toggle + before/after mockups) to make it land.
- **2026-07-06 · Complete media audit (qa:media) ✅** (`b63998f`) — Owner made media
  quality a top priority. Built `scripts/media-audit.mjs` (dependency-free: missing/
  duplicate frames, dimension+aspect consistency, resolution floor, placeholder
  heuristic, cross-exercise dupes, orphans) → `artifacts/media-audit.json`;
  `MEDIA_AUDIT_REGISTER.md` = quantified verdict: only **16/49** photo sets meet the
  1536×1024 bar; **3 resolutions + 3 aspect ratios** coexist (1536×1024 / 768×512 /
  627×627-square); **5 broken sub-thumbnail sets** (lat-pulldown 192×184 etc.); 5
  baked-text sets; **33 orphaned media dirs**; inconsistent models/lighting/grade
  between shoots (vision-confirmed). Prioritized Gemini-gated remediation plan.
- **2026-07-06 · Systemic honesty audit — never infer state from absence of data ✅**
  (`e20fad4`, `b63998f`) — Owner ratified the principle into the Product Excellence
  Standard and demanded a full-product sweep. Ran 4 parallel read-only audits
  (store.js / engine libs / client+insights / media wiring), fixed every LIVE
  offender at the root: **seed blueprint** stopped fabricating recovery (`sleepHours:
  7.2`/`energyLevel:"Steady"`) and fake coach notes ("<name> is building steady
  consistency…"); **recovery** now gated by a sticky explicit `recoveryLogged` flag
  (Coach shows "Not logged yet" until real data; premium plan's Recovery-signal/
  training-baseline lines too); **weekly plan** gap/completion copy
  (executionPriorities, premiumReason, previewNote) gated behind nutritionTracked/
  hydrationTracked; **habitAnchor** "consistency is fragile" split new-vs-lapsed;
  **trustNote** "Built from your actual data" conditioned on real history; **workout
  copy** ("not shown up recently" / "recent training history") gated on real
  training. Verified the gated buildInsights engine is genuinely honest. Dead twins
  documented, left untouched. `HONESTY_AUDIT.md` records it all. Live-verified
  (fresh user → honest Coach/Plan; after POST /api/recovery real values appear);
  build 0; qa:launch 18/18; clean console.

- **2026-07-06 · Excellence — stop asserting a nutrition deficit the user never logged ✅**
  (`14410a1`) — Tracing the "Recovery through better fueling" theme to its root
  (not just the one reason string) exposed a systemic honesty bug: the weekly plan
  derived its theme from a *protein gap* = `goal − logged`, and for any user who
  hasn't logged food yet (every new user; anyone before their first meal) `logged
  = 0`, so the gap always equals the full goal. Result: `getWeeklyFocus` returned
  "Recovery through better fueling" and the plan strategy asserted *"Your current
  protein intake is 150g short of goal"* as fact — from **zero** evidence, and
  contradicting the recommended training session. Fix: one hoisted `nutritionTracked`
  flag (mode on AND calories/protein actually logged) now gates every
  nutrition-derived plan branch (weeklyFocus protein/water + plan focusReason); a
  `hasTrainingHistory` split gives a brand-new user *"Build your first week of
  consistency around <goal>"* instead of *"Rebuild…"* (nothing to rebuild yet).
  Evidence: live e2e — fresh bodybuilding user gets a goal-based plan; the SAME
  user after logging a real low-protein meal (144g short) correctly gets the
  fueling focus + deficit message, so the claim only shows with real data behind
  it. Plan screenshot + strategy panel + clean console; build 0; qa:launch 18/18.

- **2026-07-06 · Excellence — fix "today's session" reason contradicting its title ✅**
  (`4e3f9a4`) — Judging the new-user dashboard from a screenshot (per the
  "judge from screenshots" directive) exposed a real incoherence the copy pass
  alone wouldn't catch: the session title said **"Chest + triceps"** while the
  reason below claimed *"Your week is built around Recovery through better
  fueling."* Root cause — the *training* reason borrowed `weeklyPlan.weeklyFocus`,
  which `getWeeklyFocus` derives from **nutrition** signals (proteinGap ≥ 25 →
  "Recovery through better fueling"); every new user (little logged nutrition)
  inherited a fueling theme that contradicts the recommended push session, making
  the app look like it *isn't* paying attention — the opposite of its positioning.
  Anchored the training reason on the training goal ("Your bodybuilding goal is
  driving the week, so today picks the split that best fits your setup…");
  weeklyFocus still drives the plan/nutrition teasers where a fueling theme
  belongs. Evidence: live in-browser fresh-onboarded bodybuilding user — title +
  reason cohere, desktop + 375px mobile clean, 0 console errors; build 0;
  qa:launch 18/18, 0 blockers/warnings.

- **2026-07-06 · Excellence — warm the robotic auto-gen reason/variety copy ✅**
  (`a732fc0`, `bd1fba1`) — Closed the flagged voice defect: the app talked
  about *itself* in the third person ("the engine is rotating the movement mix",
  "the engine is keeping it realistic", "The engine will start rotating more
  aggressively…"). Rewrote every **rendered** branch in warm second person so the
  app speaks TO the user, not ABOUT itself — the dashboard/Plan "today's session"
  reason (`store.js` recommendationReason: injury→"stays kind to your body",
  low-recovery→"without grinding you down", repeat→"instead of a repeat, today
  mixes up the movements", weekly→"Your week is built around X"), the Workouts
  library recommendation (`workoutLibrary.js` buildRecommendationReason injury/
  low-recovery branches), and the new-user variety note. Swept the whole app:
  remaining "the engine"/"the system is" hits are all in **dead** paths
  (`getProgramPhase`/`getModuleContinuityContext`/summary `continuityNote` — nulled
  or unimported by every consumer), left untouched. Evidence: build 0; qa:launch
  **18/18**, 0 blockers/warnings; **live-verified from the running server** —
  register→session emits the new dashboard + injury reason; new-user
  `/api/workout-library` payload carries the warm variety note and has zero
  engine/system self-reference.

- **2026-07-06 · Product Excellence Standard — refinement pass (#1–5) ✅** —
  Owner ratified a permanent Product Excellence Standard (constitution) and set a
  priority queue. Worked it end-to-end under continuous build+QA+browser gates.
  **#1 Premium/paywall** (`2330edd`): removed dev/launch language ("launch
  baseline", "full workout system", "execution priorities", "Direct paid option"),
  reframed to honest benefit copy, made the free trial the single Volt-highlighted
  focal point, added a trust signal, killed a redundant double "Coming soon"
  button. **#2 Modals** (`fb95370`): audited all six; de-jargoned the weekly-plan
  preview; confirmed forward momentum + honest states elsewhere. **#3 Recovery→
  reflection** (`222c959`): added a "Next in your day" nudge so the mobility page
  carries the user into progress/dashboard instead of dead-ending in a library.
  **#4 Progress composition** (`ba9ac60`): retitled the hero to its reason-to-exist
  ("Are you getting stronger?"), led it with the strongest real improvement signal,
  removed the duplicated streak (one source of truth). **#5 Adversarial sweep**
  (`636d602`): verified API resilience (401/400/404/fast-reject), corrupt-token →
  graceful auth page (no white-screen), premium new-user empty state; expanded the
  machine-enforced mobile-viewport scenario to /mobility + /exercise-library (no
  horizontal scroll) and fixed a flaky matcher. Evidence: build 0; qa:launch
  **18/18**, 0 blockers/warnings throughout; browser-verified desktop + mobile.
  Earlier same-day: Design-V3 composition (dashboard single-hero, sidebar/heading,
  auth first-impression, library + settings de-jargon) and streak/goal/insight
  correctness unification.

- **2026-07-06 · Experience Composition — journey momentum, no dead ends ✅** —
  Owner mission: think in journeys not pages; every action creates forward
  momentum; a completed workout should flow into recovery; the app should make
  decisions the user shouldn't have to. **Two marquee flow fixes:** (1) the
  workout-completion state dead-ended at a single "Return" button → added a
  primary "Cool down & recover →" that closes the session and navigates to
  /mobility (workout → recovery, the day's natural next step). (2) "Start today's
  session" navigated to /workouts to *re-pick* a session the dashboard already
  recommended → now opens that session's modal in place; also fixed the
  underlying dead code (recommendedWorkout was only ever set to null — the pool
  loaded but the top pick was never taken; now `pool[0]`). Journey now flows:
  dashboard → Start today's session (opens recommended) → complete → celebrate →
  Cool down & recover → /mobility. Evidence: build 0; qa:launch 18/18; browser
  e2e both flows. Commits `7fc7c08`, `cc82a6f`. Remaining journey polish:
  mobility→reflection hook, week-in-review→forward CTA, return-tomorrow loop.

- **2026-07-06 · Product Composition — dashboard reduced to one hero + journey ✅** —
  Owner "Creative Director" mission: compose experiences not cards; every screen
  ONE hero; remove competing focal points; judge from screenshots. The dashboard
  was ~10 competing cards — effectively a second full dashboard of weekly-planning
  content duplicating Plan/Workouts. **Composed to a single journey:** For You
  Today (HERO, "what should I do today?") → slim `.today-launch` ("Start today's
  session") → StreakCard → Habits. **Removed:** the competing consistency ring, two
  generic "flow strip" nav CTAs, the quick-actions row, a redundant momentum-strip
  (dup of StreakCard), a "Performance trend" placeholder, and the entire ~400-line
  `today-stack` (training-direction w/ duplicate "Open Workouts" buttons + 4-col
  grid, mobility panel, "This week's split", "Why this matters") — all reachable
  from nav/Plan/Workouts. Also fixed the "Launch baseline active" weekly-check-in
  placeholder on Progress (now honest state-aware copy). Evidence: build 0;
  qa:launch **18/18** (dashboard selectors + habit checks updated to composed
  markup); browser-verified calm one-hero page. Commits `c559ae4`, `f53232c`.
  **Remaining composition queue:** Progress (8 sections → one hero), Coach,
  Exercise Library, Nutrition, Training/Workouts, Settings, Premium, modals.

- **2026-07-06 · Correctness sweep — fix cross-screen inconsistencies + misinformation ✅** —
  Owner standing mandate: "if you find inconsistency / bugs / misinformation, fix
  immediately." Two adversarial auditors (cross-screen consistency + calculation
  correctness) found real user-visible defects; all HIGH/MED fixed. **Streak
  unified** to the canonical freeze-protected value everywhere (added
  `streakStatus.longestStreak`, same semantics so longest ≥ current; exported
  `summary.workoutStreak = streakStatus.streak`; Week-in-Review switched off the
  strict streak that contradicted the card launching it; Progress read the client
  `workoutMomentum` — a separate record that could diverge from real data — now
  reads `streakStatus`). **Rep ranges** ("8-12") counted as real volume via
  `parseRepCount` (were `Number()`→NaN→silently zeroed, hiding volume/PRs).
  **Week-in-Review prCount deduped** (best strength PR per exercise + one best
  volume PR; a heavier lift no longer double-counts). **Metric units**: insights
  label "kg" not a hardcoded "lb". **Coach page** de-lied: replaced the "Advanced
  coaching is disabled / coaching is active" contradiction with the REAL insight
  engine (`buildLaunchSafeCoachResponse` now derives from buildInsights/
  buildNextBestAction + real recovery values). **Progress page** de-faked: removed
  "temporarily simplified" + 3× hardcoded "Holding steady" + "deferred for now"
  placeholders; wired the real engine into the pattern/improvement panels (was
  always "No insights"). Weekly-goal fraction clamps ("2/2" not broken "5/2");
  reworded "now includes" changelog copy. Evidence: build 0; qa:launch **18/18**
  (new `correctness-fixes` scenario); browser-verified Coach real + Progress
  consistent (streak 3/3/3, was 3 vs 1). Commits `612820a`, `191f1db`. Remaining
  LOW (documented): premium weekly-goal target 3-vs-4 source mismatch; insight
  "earliest" from 6-entry cap; rolling-window ms boundary.

- **2026-07-06 · Design System V3 — premium product-polish pass (units 1–3) ✅** —
  Owner shifted from features to pure craft ("Apple/Linear/Stripe bar; less noise,
  more clarity; one obvious focal point; remove weak cards + generic copy"). Acting
  as product/visual/UX designer, audited the live app in-browser and shipped three
  verified units. **U1 dashboard:** made "For You Today" the single focal point;
  fixed a real defect where the "Today" badge was a `display:block` grid child
  stretched to a 666×72px empty box (→ 24px pill) and the copy column's rows were
  stretching (grid `align-content:normal`==stretch) into dead space (→ top-packed);
  subordinated the focus heading (2.85→1.8rem); removed the hero's "current streak"
  stat that showed a *different number* than the StreakCard below it; decluttered the
  sidebar brand lockup; dropped a stray copy line. **U2:** gated the sidebar submenu
  to multi-item groups only (Dashboard showed a redundant panel duplicating the
  active nav item); refined the global module-hero heading scale 2.85→2.3rem with
  tighter line-height/tracking (was shouty). **U3 auth (first impression):** killed
  the logo PNG's baked-in black box with `mix-blend-mode:screen`; refined the hero
  headline 3.6rem/11ch→2.7rem/15ch (7→4 balanced lines); replaced dev-changelog copy
  with honest positioning matching the attentive product. Evidence: build 0; qa:launch
  **17/17** 0 blockers/warnings after each unit; browser-verified desktop 1440 +
  mobile 390, no console errors. Commits `9746c5f`, `89ec333`, `a90aaec`. Remaining
  screens (onboarding, empty states, library, nutrition, coach, settings, modals,
  premium) queued for continuation.

- **2026-07-05 · Alive Product — attentive insight engine + personalized dashboard ✅** —
  Owner: make PulsePeak *attentive*, not decorative — it should notice, remember,
  connect patterns, and give timely personal feedback from REAL data only.
  **Mission 1 (verify):** an independent QA agent adversarially re-proved PR
  detection, false-PR prevention, Week-in-Review arithmetic, streak+freeze (8
  cases), milestone triggering, duplicate-celebration prevention, and perf/leaks
  — all PASS, no discrepancies, nothing to fix. **Missions 2+4 (engine):**
  `buildInsights(data)` + `buildNextBestAction` in `store.js` — an honest,
  evidence-gated contextual engine: PR opportunity ("last time 185×5, best 185 —
  beat it"), strength progress ("+30 lb over 3 weeks"), neglected muscle group
  ("back overdue 13 days"), comeback, streak risk, weekly momentum, monthly
  volume trend, plateau, best-training-day. Every insight carries evidence, a
  confidence, an explainable reason, and an action; ranked by priority×confidence.
  **Honesty is enforced:** a group never trained is never "neglected"; a ramp-up
  from a near-empty month is not dressed as a "+400% trend" (gated to a real
  baseline); sparse/new users get ONLY an honest activation message ("Log one
  more session and I'll start spotting patterns"). **Mission 3 (dashboard):**
  `TodayForYou` renders the ranked insights as the FIRST thing on the dashboard —
  personal, not generic. **Verification caught a real bug:** the summary already
  had an `insights` key (coaching tips); my duplicate key was silently clobbered
  in the object literal → renamed to `personalInsights`; also moved the compute
  early because a downstream builder mutates `data.workouts`. **Mission 6:**
  browser-verified rich-history user (real PR/progress/balance insights) AND
  new user (honest activation only, no fabrication); 0 console errors. QA
  `insight-engine` scenario (10 cases: sparse→activation, evidence+reason on
  every insight, PR/progress/neglected detection, no untrained-group or ramp-up
  fabrication, actionable next-best-action). Evidence: build exit 0; qa:launch
  **17/17**, 0 blockers, 0 warnings.
- **2026-07-05 · Wow-Factor Phase 5 — product differentiation re-review ✅ (PROGRAM COMPLETE)** —
  Owner: after building the moments/retention work, re-answer honestly "why use
  PulsePeak instead of Strong / Hevy / Fitbod / Nike / Centr / Apple?" — and if
  the answer is weak, improve until strong. Appended a brutally-honest re-review
  to `PRODUCT_DIFFERENTIATION.md` weighing Phases 1–4 against each competitor.
  **Verdict: the answer moved from "there is no reason to exist" (original
  review) to a real, defensible reason on the emotion/retention/delight axis** —
  "the fitness app that makes your progress feel good and pulls you back" (PR
  celebrations + shareable Week-in-Review + streak game), a genuine gap the
  logging apps (Strong/Hevy — spreadsheets, no emotional payoff) and content apps
  (Nike/Centr/Apple — no *personal* achievement) both leave open. Honest about
  what's NOT yet won: Fitbod still beats us on adaptive AI (our intelligence is
  still stubbed — the **Living Coach** is the moat left to build, **owner-gated on
  an Anthropic API key**), and we're still web-only (native/wearable reach).
  Report-only unit; no code changed, so gates stay green from Phase 4 (build 0;
  qa:launch 16/16). **This closes the owner's Wow-Factor program (Phases 1–5);
  the one remaining differentiator is a true owner-only blocker (API key/$).**
- **2026-07-05 · Wow-Factor Phase 4 — retention loop ✅** —
  Owner: build the retention mechanics — streaks, streak-freeze, weekly-goal
  reinforcement, return prompts, milestone moments, progress motivation.
  **Server:** `buildStreakStatus(data)` (in `summary.streakStatus`) — a
  freeze-protected streak with a deterministic, honest model: the freeze buffer
  lets a streak bridge up to 2 missed days; only gaps BETWEEN trained days are
  charged (trailing misses bridge to nothing). Emits `state`
  (active/at_risk/broken/none), `freezesRemaining`, `trainedToday`,
  `weeklyCompleted`. **Client:** `StreakCard` on the dashboard — a 🔥 flame with
  the streak count, the streak-freeze status line, adaptive copy keyed to state
  (active reinforcement, **at-risk loss-aversion return prompt** with a warm
  brand edge, broken/none restart nudges), and a weekly-goal progress bar with a
  "N more sessions to your goal" line. **Streak-milestone moment:** crossing
  3/7/14/30/60/100/… while trained-today auto-fires a `CelebrationOverlay`
  milestone once (localStorage-guarded; resets if the streak breaks so
  re-climbing celebrates again). **Verification caught a real bug:**
  `navigator.vibrate` fired without a user gesture (ring hitting 100% on
  auto-load) logs a Chrome console warning that failed the QA console-error gate
  → guarded `haptic()` on `navigator.userActivation.hasBeenActive`. Also fixed my
  own freeze math (was charging trailing gaps). **Browser-verified**: StreakCard
  shows "1-day streak / You trained today / 2 streak freezes ready / weekly goal
  2/2", 0 console errors. QA `streak-status` scenario (6 cases: none/active/
  at-risk/freeze-bridge/gap-beyond-freezes/stale-broken). Evidence: build exit 0;
  qa:launch **16/16**, 0 blockers, 0 warnings.
- **2026-07-05 · Wow-Factor Phase 3 — shareable Week in Review ✅** —
  A premium, "Wrapped"-style weekly recap users would want to share. **Server:**
  `buildWeekInReview(data)` in `store.js` + `GET /api/week-in-review` — over the
  rolling 7-day window it derives workouts completed, training streak, total
  volume moved, exercises completed, PRs earned THIS week (walks the week's
  workouts chronologically, detecting each against everything logged before it),
  consistency score, and weekly-goal progress. Every number real; empty history
  → `hasActivity:false` (honest empty state, no fabrication). **Client:**
  `WeekInReview.jsx` modal — Volt hero (total volume moved), a 4-up stat grid,
  goal + consistency progress bars, a "Records this week" list with Volt PR
  badges, and a "Share my week" button (Web Share API with clipboard fallback);
  count-up numbers throughout. Dashboard entry point "See your week in review →".
  **Browser-verified** with a real 2-workout week: "Jun 28 – Jul 5", hero
  **6,720 lb moved**, 2 workouts / 1-day streak / 4 exercises / **2 new records**,
  goal 2/2, consistency 27%, records "Barbell bench press — 185 lb × 8" +
  "Biggest session — 4,440 lb"; 0 console errors. QA `week-in-review` scenario
  (7 cases incl. empty→no-activity, real volume/exercise counts, week PR
  detection, consistency passthrough). Evidence: build exit 0; qa:launch
  **15/15**, 0 blockers, 0 warnings.
- **2026-07-05 · Wow-Factor Phase 2 — real PR / "NEW RECORD" system ✅** —
  Owner: build a screenshot-worthy PR celebration from REAL logged data only,
  never fabricate a record, never celebrate an ordinary workout. **Server:**
  `detectPersonalRecords(priorWorkouts, newWorkout)` in `store.js` — compares the
  new session only against prior logs and emits records for heaviest weight, best
  estimated 1RM (Epley — captures "more reps at a weight"), and biggest session
  volume. Honesty rules: a record must BEAT a prior best (a first-ever
  performance is not a record), only real numeric weight counts (no bodyweight/
  cardio PRs), one strength record per exercise, one session-volume record.
  Returned as `personalRecords` on BOTH log endpoints (`/api/workouts` +
  `/api/workouts/preset`). **Client:** `mutate` passes `personalRecords` through;
  both `addPresetWorkout` handlers (DashboardPage AND WorkoutsPage) now send the
  real `weight`/`repsCompleted` (Dashboard was silently stripping them) and
  return the records; `WorkoutDetailModal.finalizeWorkout` builds a premium PR
  celebration that outranks the session/milestone one — eyebrow "NEW RECORD(S)",
  the exercise as title, hero "185 lb × 8 reps", the record type as subtitle,
  Volt glow + haptic, "+N more records today", 8s linger. **Verification caught 2
  real bugs:** DashboardPage stripped weight/reps before POST (so volume + PRs
  could never work), and only the Dashboard log path returned records — the
  actual session runs through the **WorkoutsPage** modal, whose handler also
  needed the fix. **Browser-verified end-to-end**: seeded bench 95 → logged bench
  185 → celebration fired `isPr:true` "NEW RECORDS / Barbell bench press / 185 lb
  × 8 reps / Heaviest ever / +1 more personal record today". API e2e confirmed
  both endpoints return real records; unit scenario `pr-detection` (7 cases:
  heavier=PR, more-reps=e1RM PR, weaker=no PR, first-time=no PR, bodyweight=no PR,
  bigger-session=volume PR, no-history=no PR). Evidence: build exit 0; qa:launch
  **14/14**, 0 blockers, 0 warnings.
- **2026-07-05 · Wow-Factor Phase 1 — moments that make it feel alive ✅** —
  Owner brief: "forget features — create moments that make someone say whoa;
  build an app that feels alive, worthy of being featured by Apple." Grounded
  first (scout agent) that the core loop logs REAL per-exercise weight/reps and
  real streaks/completion — so every celebrated number is honest, no fakes.
  **Built:** (1) `CelebrationOverlay.jsx` — a cinematic, reusable moment for the
  emotional peak of finishing a workout: full-screen Volt-lime particle burst,
  count-up of the session's real stats (volume moved / minutes / exercises),
  streak, spring entrance, haptic, tap-or-auto dismiss. Wired into
  `WorkoutDetailModal.finalizeWorkout`; elevates to a "milestone" variant when
  the weekly goal is hit (precise: projected count ≥ target). (2) `useCountUp`
  hook + `CountUp` component + `haptics` util — numbers animate 0→value across
  the app (dashboard streak + habits-done pills, consistency-ring center), so
  stats feel alive instead of snapping. (3) `ProgressRing` — center number
  counts up in lockstep with the ring draw, plus a spring-pulse + Volt glow +
  haptic the moment it reaches 100% (the design system's reserved
  "volt glow + spring pulse at 100%"). (4) Habit cards — a satisfying tap haptic
  + pop the instant a habit is marked done. Everything uses the design system's
  pre-reserved celebration language (`--ease-spring`, `--grad-volt`,
  `--volt-glow`, `--dur-count`) and is fully `prefers-reduced-motion`-safe
  (no particles, instant numbers, plain fade). **Browser verification caught +
  fixed a real robustness bug:** `useCountUp` relied on `requestAnimationFrame`,
  which is paused in hidden/backgrounded tabs — numbers stuck at 0 forever;
  added a `document.hidden` short-circuit + a post-duration safety timeout that
  always lands the true value (verified: hero settled to real 48 min / 3
  exercises / 1-day streak; dashboard pills + 28% ring settled correctly).
  Celebration visual verified premium in-browser at desktop; 0 console errors.
  Evidence: build exit 0; qa:launch **13/13**, 0 blockers, 0 warnings.
  **Phase 2 deferred** (noted, not dropped): PR "NEW RECORD" moments (needs a
  server `personalRecords` response — best-weight lives server-side, not on the
  client), shareable Sunday "Week in Review", streak-freeze.
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
