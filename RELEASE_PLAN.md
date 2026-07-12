# PulsePeak — Commercial Release Plan (v1.0.0)

Owner-facing plan to take PulsePeak public on the **web (PWA)** first, then the app
stores. Everything marked 🔒 is **owner-gated** (needs a paid account, credential,
domain/DNS, payment method, or legal sign-off). Everything else is built.

---

## 0. Launch strategy — web PWA first

PulsePeak is a responsive React web app and now an installable **PWA** (works on
iOS/Android home screen + desktop install). The fastest, lowest-risk path to paying
customers is:

1. **Web launch** (PWA) — no app-store review, no native accounts. Ship here first.
2. **App stores** — wrap the PWA (e.g. Capacitor / PWABuilder / TWA) once web is
   proven. Requires 🔒 Apple Developer + 🔒 Google Play Console.

---

## 1. Deployment topology

Single service: Express serves the built `dist/` (static + PWA) **and** the JSON
API + SPA fallback. Config in `render.yaml` (Render) + health check `/api/health`.

**Deploy order per release:**
1. Merge to `main` → CI (`.github/workflows/ci.yml`) runs build + `qa:launch` +
   `qa:model-consistency`.
2. 🔒 Render auto-deploys `main` (or trigger manually).
3. Post-deploy smoke: hit `/api/health`, load `/`, install PWA, run one workout log.

---

## 2. 🔒 CRITICAL launch blocker — persistence

**✅ PREPPED (2026-07-12).** `render.yaml` now mounts a 1 GB **Render persistent
disk** at `/data` and sets `PULSEPEAK_DB_PATH=/data/pulsepeak-db.json`, so user
data survives deploys/restarts. No code change was needed — `server/data/store.js`
already creates the directory and seeds an empty DB on first boot, and writes are
atomic. **Owner action remaining:** the service must be on a **paid instance
(Starter+)** for Render to attach a disk (free tier can't); confirm the plan when
connecting the Blueprint, then verify data survives one redeploy.

- **Render persistent disk** — ✅ configured (above). Simplest; keeps the JSON store.
- **Managed Postgres** — more robust for scale; requires a small data-layer swap
  (the store is already abstracted in `server/data/store.js`). Migrate later if scale demands it.

---

## 3. 🔒 Billing (paid tiers)

- `BILLING_RUNTIME_ENABLED` is hard-coded `false` (`server/server.js`). Flip to
  enable paid flows.
- Provide 🔒 **live** Stripe keys + price IDs + webhook secret (`.env` / Render vars;
  `.env.example` documents all). Stripe webhook signature verification is already
  correct (raw-body before json).
- Verify the full purchase → `BillingSuccessPage` → entitlement flow in Stripe test
  mode first (the post-payment crash there is now fixed).

---

## 4. 🔒 Domain, DNS, origins

- Point a 🔒 production domain at the service; set `APP_ORIGIN` + `CORS_ALLOWED_ORIGINS`.
- Replace `REPLACE_WITH_PRODUCTION_DOMAIN` in `public/robots.txt` + `public/sitemap.xml`.
- Update canonical/OG URLs if you want absolute URLs in `index.html`.
- Optional: add `X-Robots-Tag: noindex` on any staging origin (env-gated).

---

## 5. Monitoring & analytics

- **Health check:** `/api/health` (wired to Render).
- **Crash reporting:** ErrorBoundary exposes `window.__pulsepeakReportError`; wire
  Sentry by setting 🔒 `VITE_SENTRY_DSN` and initializing in `main.jsx`.
- **Analytics:** cookieless Plausible scaffold is dormant until 🔒 `VITE_PLAUSIBLE_DOMAIN`
  is set (then also add the analytics host to the server CSP script-src/connect-src).
- **Logging:** consider adding request logging (`morgan`) before launch (P2).

---

## 6. Versioning & release notes

- SemVer in `package.json` (currently `1.0.0`). Tag releases `vMAJOR.MINOR.PATCH`.
- **v1.0.0 release notes (draft):** "PulsePeak launch — your personal fitness
  companion. Personalized workouts and a smart weekly plan, a full exercise library
  with visual guides, nutrition and hydration guidance, recovery, habits, and
  progress tracking. Installable on iOS, Android, and desktop. Premium dark design."

---

## 7. Store listings (draft copy — owner finalizes)

**Name:** PulsePeak — Personal Fitness Companion
**Subtitle:** Smarter workouts, one clear plan
**Keywords:** fitness, workout, gym, weekly plan, exercise library, nutrition,
recovery, progress, strength, mobility
**Short description:** Personalized workouts, a smart weekly plan, nutrition,
recovery and progress — your personal fitness companion.
**Long description:** Build better health momentum with a fitness workspace that
remembers you. PulsePeak turns your goal, equipment, and experience into a clear
weekly plan, a real exercise library with step-by-step visual guides, practical
nutrition and hydration, recovery and habit tracking, and progress you can see.

**Assets needed (🔒 partly — final screenshots after media re-shoot):**
- App icon ✅ (`public/icon-512.png`, maskable ✅).
- Screenshots: dashboard, workout guide, exercise library, plan, nutrition, progress
  — capture at phone + tablet + desktop sizes (the redesign is screenshot-ready).
- Feature graphic / hero — use brand logo + a premium model shot (post Aurora re-shoot).

---

## 8. Legal & trust

- Privacy Policy `/privacy`, Terms `/terms` (incl. health disclaimer), Contact
  `/contact`, Help `/help` — built and reachable logged-out.
- 🔒 Replace `[PLACEHOLDER]`s (company legal name, effective date, contact email,
  jurisdiction) and **have counsel review** before public sale.

---

## 9. Launch checklist

**Engineering (done unless noted):**
- [x] All P0/P1/P2 defects fixed; ErrorBoundary; modal a11y.
- [x] PWA installable (manifest + SW + icons); offline app shell.
- [x] Security headers (helmet + CSP + HSTS); verified no CSP breakage.
- [x] SEO meta + robots + sitemap (domain placeholder).
- [x] Legal/support pages reachable logged-out; real 404.
- [x] CI (build + qa:launch + model-consistency).
- [x] Responsive desktop + mobile; mobile bottom-nav; 0 console errors.
- [x] Persistence fix (Section 2) — disk configured in `render.yaml`; 🔒 owner confirms paid instance on Blueprint connect.
- [ ] 🔒 Billing live keys + enable flag (Section 3).
- [ ] 🔒 Domain/DNS + origins + sitemap/robots host (Section 4).
- [ ] 🔒 Sentry DSN + analytics domain (Section 5) — optional but recommended.
- [ ] Media: fix 2 confirmed defects (in progress) + phased Aurora re-shoot (MEDIA_AUDIT.md).

**Go-live sequence:**
1. Fix persistence → deploy → confirm data survives a redeploy.
2. Fill legal placeholders (counsel) → deploy.
3. Enable billing in Stripe test → verify purchase flow → switch to live keys.
4. Point domain → set origins → replace robots/sitemap host → deploy.
5. Enable Sentry + analytics.
6. Capture store screenshots → submit web launch announcement.
7. (Later) Wrap PWA for App Store / Play.

**Post-launch:** monitor `/api/health` + Sentry; watch first purchases end-to-end;
keep the media re-shoot moving; triage support via `/contact`.

---

## 10. Estimated readiness

- **Web (PWA) engineering readiness: ~90%** — the app is stable, secure, installable,
  legally scaffolded, and CI-gated. Remaining engineering is the persistence fix.
- **Commercial launch readiness: gated on owner items** — persistence infra, live
  Stripe, domain/DNS, legal sign-off, and the media re-shoot. None are code defects;
  all are owner-gated accounts/decisions or the semi-manual media program.
