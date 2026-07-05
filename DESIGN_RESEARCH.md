# PulsePeak — Competitive Design Research (2026)

Research behind the world-class redesign. Ten top-of-field Health & Fitness apps
teardowned across business model, design language, features, ease of use, and
reviews — then distilled into what PulsePeak should steal and avoid.

> Method: three parallel deep-research passes (top web apps, top mobile apps, and
> a buildable design-language synthesis) using live web sources. Verified brand
> hex codes are cited; where an app does not publish app-tier hexes, that is
> flagged rather than invented.

---

## TL;DR — the consensus the leaders agree on

1. **Data is the hero; chrome disappears.** The best dark UIs (WHOOP, Oura) keep
   backgrounds near-black and text off-white so *the athlete's numbers, rings and
   charts* carry all the color.
2. **Semantic color, learned once.** WHOOP's green→amber→red readiness scale is a
   masterclass: every hue has one fixed meaning. A brand red that *also* means
   "success" is the collision that makes fitness apps look amateur.
3. **Progressive disclosure.** One glanceable answer up top → weekly trend → deep
   detail on tap. Essential at 390px.
4. **Fast path to value.** Hevy/Strong win on ≤3-tap logging and generous free
   tiers; the home screen surfaces *today's* action first.
5. **Motion is structural, not decoration.** Count-ups, ring fills, PR celebration
   pulses — motion explains what happened.
6. **Trust is a feature.** The loudest complaints across every app are billing
   dark patterns (WHOOP) and paywall creep (Strava). Decide the free/paid line
   once and hold it.

---

## Top 5 WEB apps

| Rank | App | One-line | Verified brand hex |
|---|---|---|---|
| 1 | **Strava** | Reference-grade fitness web app; social/segments/route-builder | Int'l Orange `#FC4C02` |
| 2 | **WHOOP** (app.whoop.com) | Data-viz masterclass; semantic color + progressive disclosure | Near-black canvas; red brand (app hexes unpublished) |
| 3 | **Oura** | Most-praised health redesign of the cycle; narrative, AI-guided, 3-tab IA | Wordmark gray `#4a4741` |
| 4 | **Garmin Connect** | Deepest data platform; big-screen Performance Dashboard | Garmin Blue `#007CC3` |
| 5 | **TrainerRoad** | Gold standard for *structured training*: Adaptive Training, Progression Levels | Dark data-first UI (hexes unpublished) |

**Rejected & why:** Peloton (actively *removing* web features — cautionary tale),
MyFitnessPal web (dated), Fitbod/Future/Caliber/Eight Sleep (mobile-first, thin web).

### Strengths / weaknesses that matter to us
- **Strava** — ✅ unmatched social-motivation loop; iconic single-accent brand; full web route builder. ❌ paywall creep + price hikes ($59.99→$79.99) eroding goodwill; a 2025 mobile redesign was panned; analytics overwhelm casual users.
- **WHOOP** — ✅ best-in-class data-viz + semantic color literacy; glanceable-yet-deep progressive disclosure. ❌ predatory billing/cancellation (the #1 review theme); jargon-heavy copy; no free tier.
- **Oura** — ✅ best information design / narrative clarity; calm semantic color; strong AI advisor. ❌ hardware + mandatory subscription resentment; less useful for active training.
- **Garmin** — ✅ most comprehensive metric ecosystem; genuinely powerful large-screen dashboard. ❌ long-standing navigation complexity; inconsistent data-viz across surfaces.
- **TrainerRoad** — ✅ best structured-training intelligence (AI sim, adaptive plans, fatigue detection); fully functional on web. ❌ narrow (cycling); austere UI; plans skew too intense / under-recover.

---

## Top 5 MOBILE apps

| Rank | App | One-line | Notes |
|---|---|---|---|
| 1 | **Fitbod** | AI workout generation + muscle-recovery heatmap | Closest to PulsePeak's engine; 4.8★/270k+ |
| 2 | **Hevy** | Gold standard for logging UX + generous free tier | "everything just works"; ~#121212 dark + blue accent |
| 3 | **WHOOP** | Recovery/insight visualization | Teal `#00F19F`, Strain blue `#0093E7` (verified) |
| 4 | **Strava** | Social/progress/brand identity | Int'l Orange `#FC5200` (verified) |
| 5 | **Strong** | Minimalist logging — "3 taps to log a set" | Fast-path benchmark; iOS-native feel |

**Cut & why:** Nike Training Club (guided-video, not a logger/planner), Peloton /
Apple Fitness+ (hardware/ecosystem-locked), MyFitnessPal (nutrition-only; soured on
paywalling — folded into nutrition lessons).

### Strengths / weaknesses that matter to us
- **Fitbod** — ✅ zero-effort programming; recovery-aware muscle heatmap (visual & differentiating); great for beginners. ❌ expensive, no real free tier; repetition after months; too shallow for advanced periodization.
- **Hevy** — ✅ category-leading logging craft; trust-building free tier; free social/leaderboards. ❌ quantity caps push Pro; deep analytics gated.
- **WHOOP** — ✅ semantic color reused everywhere; one-answer-up-top progressive disclosure; black canvas makes data pop. ❌ jargon microcopy; hardware lock-in; single-number opacity ("why is my score red?").
- **Strava** — ✅ social motivation engine; energetic single-accent brand; frictionless record-first flow. ❌ paywall creep; support/billing/reliability complaints.
- **Strong** — ✅ ruthless 3-tap logging; best Apple Watch app; clean progression charts. ❌ restrictive free tier; slower feature velocity; costlier long-run than Hevy.

---

## What PulsePeak STEALS

1. **WHOOP's semantic color discipline.** Red = brand + intensity/effort (HR, calories, strain, CTAs). A **Volt lime** secondary = peak / PR / goal-hit / progress. A green→amber→red **readiness scale** for recovery/status. Red never doubles as "success."
2. **WHOOP/Oura progressive disclosure.** Every surface: one glanceable answer → weekly trend → detail on tap. Critical at 390px.
3. **WHOOP's oversized primary-metric typography** against a dark canvas — one dominant number per view, everything else secondary, tabular figures so nothing jitters.
4. **Fitbod's recovery-aware, visual weekly plan** (a body/muscle map is a future differentiator and screenshot-worthy).
5. **Hevy/Strong's fast path to value** — the home surfaces *today's* action; the daily loop stays frictionless; big touch targets.
6. **Strava's celebration microinteractions** — a little spring + glow on a completed session or new PR drives retention cheaply.
7. **A clean 3–5 tab mobile bar** — Today · Train · Library · Nutrition · Progress — value one tap away. (PulsePeak's biggest pre-redesign gap: the desktop sidebar stacked above content on mobile.)
8. **First-class web experience** — Peloton retreated from web; the opportunity is to be the companion whose *browser* app is a first-class citizen.

## What PulsePeak AVOIDS

1. **Billing dark patterns** (WHOOP) — the loudest complaint in the category. Transparent terms are a free differentiator.
2. **Paywall creep** (Strava) — gate *advanced* analytics, never the core loop.
3. **Jargon microcopy** (WHOOP) — pair every metric with plain-English coaching ("You're ready to push today," not "HRV-adjusted readiness index nominal").
4. **Navigation complexity + inconsistent viz** (Garmin) — keep web and mobile mirrored; never show one metric two ways.
5. **Austerity *and* over-intensity** (TrainerRoad) — don't ship a spreadsheet-in-the-dark; bake recovery/deload into the plan.
6. **Pure black + full-saturation red** — vibrates on OLED at 390px. Desaturate red for large fills; reserve full-saturation for small accents/CTAs; sit it on dark *gray*, not black.

---

See **DESIGN_SYSTEM.md** for the concrete, buildable token spec derived from this
research and now implemented in `src/styles.css` (`:root`) + `src/styles-polish.css`.
