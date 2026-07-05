# PulsePeak — Launch Readiness Audit + Fix Tracker (2026-07-05)

Consolidated from parallel pre-launch audits (frontend defects, launch-collateral
gaps). Checkboxes track fix status during the commercial launch drive.

## P0 — Blocks paid launch (crash paths)
- [x] **BillingSuccessPage.jsx:8** — destructures `setUser` but not `user`, then uses `user` at 85–86 → `ReferenceError` white-screen **right after a customer pays**. Add `user` to `useAuth()`.
- [x] **No ErrorBoundary** (main.jsx/App.jsx) — any render throw white-screens the whole app. Add a class ErrorBoundary with branded fallback.
- [x] **CoachPage.jsx:34,75** — deep access `data.coach.primaryInsight.category` etc. behind only `if(!data)`. Guard `data?.coach?.primaryInsight`.
- [x] **WeeklyPlanPreviewModal.jsx:101,108,113** — `plan.suggestedWorkoutMix.split.map` assumes shape. Optional-chain + default `[]`.
- [x] **WorkoutsPage.jsx:229** — `setWorkoutLibrary(payload.workouts)` no fallback → `.filter` render crash outside try/catch. Use `|| []`.

## P1 — Important user-facing breakage
- [x] **ProgressPage.jsx:419–421** — NaN chart bounds when `weightHistory` empty (new user). Guard length before min/max.
- [x] **ProgressPage.jsx:14,29** — no `error` state → permanent fake "Loading progress...". Consume `error`, render error/empty card.
- [x] **PreferencesPage.jsx:17** — no loading/error state. Consume `loading`/`error`.
- [x] **PreferencesPage.jsx:187,189 + WorkoutsPage:1097** — `.exercises.length`/`.slice` on possibly-undefined. `(x.exercises||[])`.
- [x] **ActivityList.jsx:4** — `!items.length` crashes on null. `!items?.length`.
- [x] **Deep profile field access** — DashboardPage:646–647, WorkoutsPage:643/663/648/806/804, PlanPage:452, MobilityPage:196/255. Optional-chain + array/string fallbacks.
- [x] **Modals** (WorkoutDetail, MovementDetail, WeeklyPlanPreview) — no Esc-to-close, no focus trap/restore. Shared `useModalA11y` hook.

## P2 — Polish
- [x] **PreferencesPage.jsx:267,270** — `startUpgradeCheckout` with no try/catch. Wrap + error banner.
- [x] **MovementDetailModal.jsx:53,67,89,132** — strip `console.log`/`console.warn` (logs full record every open).
- [x] Images lack `loading="lazy"` across grids. Add to card thumbnails.

## Launch collateral — build
- [ ] Security headers (helmet + CSP allowlisting Google Fonts + Stripe + HSTS).
- [ ] Real 404 page (currently silent redirect to `/`).
- [ ] SEO meta (description, OG, Twitter, canonical, theme-color) + `robots.txt` + `sitemap.xml` + noindex-on-staging.
- [ ] PWA: `manifest.webmanifest` + service worker (vite-plugin-pwa) + icon set (192/512/maskable/apple-touch).
- [ ] Legal/support: Privacy Policy `/privacy`, Terms `/terms`, Contact — **reachable logged-out** (router currently returns AuthPage for any unauth visitor).
- [ ] Sentry (`@sentry/react`) + analytics scaffolds, dormant behind env vars.
- [~] Cookie/consent notice — N/A by default (cookieless analytics, no non-essential cookies). Add only if owner enables cookie-based tracking.
- [ ] Marketing landing page (auth page serves as entry; dedicated landing = polish).
- [x] CI workflow (`npm ci` + build + smoke).
- [x] Cleanup: empty `public_brand/`, stray root logs.

## Already SOLID (verified — no rework)
Build/serve pipeline · `/api/health` + Render health check · CORS allow-list + trust proxy ·
secrets gitignored & untracked · Stripe webhook raw-body ordering · Dashboard/Workouts/Mobility/
ExerciseLibrary/Nutrition/Auth/Onboarding pages handle loading+error+empty well · Help Center substantive.

## 🔒 OWNER-GATED launch blockers (cannot self-serve)
1. **Persistence (CRITICAL):** prod `PULSEPEAK_DB_PATH=/tmp/...` on Render is **ephemeral — all user data wiped every deploy/restart.** Needs a persistent disk or managed DB (paid infra). **Top launch blocker.**
2. **Stripe live keys** + flip `BILLING_RUNTIME_ENABLED` (hard-coded `false`, server.js:64).
3. **Production domain + DNS** (canonical/OG/CORS/CSP origins).
4. **Legal text sign-off** (dev scaffolds pages; owner owns the words).
5. **Analytics/Sentry keys** (scaffolds dormant until provided).
6. **Apple Developer / Play Console** — only if going beyond web PWA.
