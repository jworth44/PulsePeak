# PulsePeak Red-Team Audit

**Date:** 2026-07-05
**Method:** 6 parallel adversarial code-audit agents (auth/session, billing/entitlement, input/forms, client-state/offline/errors, API/data-integrity, UX/retention) + live interactive break-testing against the running production-style server on `:3001` (corrupt storage, concurrency, navigation, storage tampering, injection).
**Verdict:** The app is **functionally stable in normal use** (qa:launch 12/12, 0 console errors during all live testing, back/forward/refresh clean, corrupt-token → graceful logout) and **well-hardened where it counts most for a paywall** (no IDOR, no paywall bypass, strong tokens, proper password hashing). But it is **not production-ready**: three P0 infrastructure/DoS issues can cause total data loss or outage, and the single biggest *commercial* risk is **"fake depth"** — the "adaptive/coaching/intelligence" layer the app sells is largely hardcoded `null`, and the UI openly tells users features are "deferred."

Legend: **P0** = data loss / outage / DoS / security. **P1** = broken flow, data-integrity, info-leak, or retention-critical. **P2** = hardening / polish.

---

## 1. Executive summary — top risks

| # | Severity | Finding | Why it matters |
|---|---|---|---|
| 1 | P0 | Non-atomic DB write + unguarded DB read | One crash mid-write corrupts `db.json` → **every** request 500s until a human repairs the file |
| 2 | P0 | Prod DB on ephemeral `/tmp` | All user accounts/data wiped on **every deploy** (already the #1 blocker in `RELEASE_PLAN.md`) |
| 3 | P0 | Unauthenticated DoS | Unbounded-password `scryptSync` (measured **8.7 s** event-loop freeze) + **no rate limiting** + O(n) full-file rewrite per write |
| 4 | P1 | Input type-confusion + whitespace-wipe | Arrays/strings bypass numeric validation; a whitespace weight silently becomes `0` with HTTP 200 → corrupts BMR math + breaks the weight chart |
| 5 | P1 | No offline handling | Every action offline shows a cryptic "Failed to fetch" — no offline detection anywhere |
| 6 | P1 | Stack-trace / HTML error leaks | Malformed JSON and `/api/*` 404s return HTML with **absolute server file paths** |
| 7 | P1 | Saved theme destroyed on reload | *(confirmed live)* Boot overwrites the user's saved theme back to the default |
| 8 | P1 | Expired trial keeps Premium | Entitlement never checks the clock — only a Stripe webhook ends a trial |
| 9 | P1 | **"Fake depth"** | Intelligence variables hardcoded `null` across Dashboard/Plan/Progress/Coach; user-visible "deferred / temporarily simplified" copy |

---

## 2. P0 — Ship-blockers

### P0-1 · Non-atomic `writeDb` + unguarded `readDb` → corruption = total outage
`server/data/store.js` — `writeDb` does `fs.writeFileSync(DB_PATH, JSON.stringify(...))` directly on the live file (no temp-file + `rename`). A crash, OOM, or disk-full mid-write leaves truncated JSON. `readDb` then `JSON.parse`s with **no try/catch**, and `readDb` is on the hot path of essentially every route. One interrupted write ⇒ every subsequent request throws `SyntaxError` ⇒ full, unrecoverable outage until a human repairs the file.
**Fix:** write to `DB_PATH + ".tmp"` then `fs.renameSync` (atomic on one volume); wrap the parse in try/catch with a `.bak` recovery path.

### P0-2 · Production DB on ephemeral `/tmp` → data wiped every deploy
`render.yaml` sets `PULSEPEAK_DB_PATH=/tmp/pulsepeak-db.json`. `/tmp` is not persisted across container restarts/redeploys. Every account, workout log, and subscription row is destroyed on the next deploy. This is guaranteed data loss in normal operation, not an attack. Already flagged in `LAUNCH_AUDIT.md` / `RELEASE_PLAN.md`.
**Fix:** persistent disk (or a real DB) behind the existing `store.js` seam.

### P0-3 · Unauthenticated DoS (three compounding causes)
All three block the single Node thread and require no auth:
- **Unbounded password length** → `crypto.scryptSync` on the request thread. `assertValidPassword` enforces only a *minimum*; `express.json` allows ~1 MB. **Measured live: a 200k-char password blocked the event loop 8.68 s** (register returned 201). Login has the same exposure.
- **No rate limiting** anywhere (no `express-rate-limit`). 20 wrong-password logins → all 401, no lockout. 20 registrations measured at **17.9 s** total (~900 ms each, scrypt-bound). Unlimited account creation also inflates `db.json` without bound.
- **O(n) full-file rewrite per write** — every meal/hydration/habit/workout mutation re-serializes the entire users array (already **3.95 MB / 276 users**) with synchronous `writeFileSync`.
**Fix:** cap password length (≤128) on register **and** login; use async `scrypt`; add per-IP + per-account rate limiting; move off whole-file rewrites (SQLite behind `store.js`).

---

## 3. P1 — Serious (integrity, flows, info-leak, retention)

### P1-1 · Input type-confusion + whitespace-wipe corrupts persisted metrics *(2 P0-rated by the input agent; consolidated here)*
`parseNumberInRange` / `parseOptionalMeasurement` (`server/server.js` ~1142, ~1445) call `Number(value)` with no type check:
- `PATCH /api/profile {"currentWeight":[200]}` → **200**, stored `200`. `{"heightCm":[[180]]}` → **200**, stored `180`. `POST /api/meals {"calories":[100]}` → **201**, stored `100`. The schema is not enforced.
- `PATCH /api/profile {"currentWeight":"   "}` (whitespace) → **200**, weight silently becomes **0** (the "clear optional field" path catches whitespace). `0`/`NaN` weight then flows into BMR/calorie/protein math (`store.js` ~1418-1423) and into `SimpleChart.LineChart` (`src/components/SimpleChart.jsx:31`), whose `y` becomes `NaN` → the SVG path is `M x NaN L …` → the whole weight trend silently fails to render. HTTP 200 the whole time — no user feedback.
- Empty/null numeric meal fields (`{"calories":""}` / `{"protein":null}`) → **201** stored as `0`.
**Fix:** reject non-scalar types before coercing; distinguish "omitted/explicit-null" (clear) from whitespace (reject); guard chart points against non-finite values.

### P1-2 · No offline handling → cryptic errors everywhere
`src/api/client.js:17` unconditionally `await response.json()`. Offline, `fetch` rejects with `TypeError: Failed to fetch`; a 5xx HTML page or empty 200 throws `SyntaxError: Unexpected end of JSON input`. Pages render `error.message` verbatim, so users see raw browser errors. There is **no offline detection** in the client — the most pervasive offline defect. (The PWA precaches the shell, so the app *loads* offline, then every action fails opaquely.)
**Fix:** guard `response.json()`; detect `navigator.onLine` / fetch-reject and show a friendly "You're offline" state.

### P1-3 · Stack-trace & HTML error leaks (no error middleware)
There is no terminal Express error handler. Malformed JSON (`POST /api/meals` body `{bad json`) → HTTP 400 **HTML** containing `SyntaxError … at C:\Users\j_wor\OneDrive\…\node_modules\body-parser\…` (absolute paths). `GET /api/does-not-exist` and wrong-method calls → HTML `Cannot GET /api/...` (the SPA `*` fallback `next()`s `/api` through to Express's default handler). Auth `catch` blocks also return `error.message` verbatim (e.g. `email.trim is not a function`).
**Fix:** add `app.use('/api', 404-json)` before the SPA fallback and a terminal `(err,req,res,next)` handler that maps `entity.parse.failed`/`entity.too.large` to `{message}` JSON and never emits stacks; set `NODE_ENV=production`.

### P1-4 · Saved theme destroyed on every reload *(confirmed live)*
`src/components/AppShell.jsx:69` runs `applyThemePreference(document.documentElement.dataset.theme || FALLBACK_THEME)` in a layout effect, but nothing seeds `dataset.theme` from `localStorage` at boot (`getStoredThemePreference` is only called inside `PreferencesPage`). Because `applyThemePreference` *also writes to localStorage*, boot doesn't just ignore the saved theme — **it overwrites it with the fallback.** Verified live: set `gamma-forge`, reload → applied *and stored* value both reverted to `solar-crest`. A shipped feature that silently discards the user's choice.
**Fix:** apply the stored theme before first paint (in `index.html`/`main.jsx`), and don't clobber storage with the fallback on boot.

### P1-5 · Expired trial keeps full Premium (no server-side clock check)
`isPremiumEntitled` / `getAccessTier` / `getSubscriptionStatus` (`server/data/store.js`) treat `subscriptionStatus === "trialing"` as fully entitled and **never** compare `trialEndsAt`/`currentPeriodEnd` to now. Only an inbound Stripe webhook ends a trial. Any missed/delayed/reordered webhook (Stripe guarantees neither delivery nor ordering) leaves an expired trialist with free Premium indefinitely. Relatedly, `getTrialDaysRemaining` does `Math.max(1, ceil(delta/DAY))` — it reports "1 day remaining" up to seconds before a **$119.99 yearly** auto-charge, never "expires today." (Dormant today: billing is off.)
**Fix:** fail closed — treat `trialing` as expired when `trialEndsAt < now`; report `0`/"expires today" near the boundary.

### P1-6 · "Fake depth" — the sold intelligence is stubbed, and the UI admits it *(retention-critical)*
Across `DashboardPage.jsx` (~159-180), `PlanPage.jsx` (~67-115), `ProgressPage.jsx` (~57-72, 303): `recommendationExplanation`, `weeklyStructure`, `programPhase`, `nextWeekAdjustment`, `smartRotationStatus`, `systemConfidenceSignal`, `identitySignal`, variety/load-tolerance analysis — **hardcoded `null`**. The panels fall back to generic copy, and some are explicit: *"Advanced variety analysis is deferred for now,"* *"Performance interpretation is temporarily simplified,"* *"Program-phase interpretation is deferred for this launch baseline."* `AuthPage` sells "coaching recommendations tailored to your recovery and training trends"; `PlanPage` sells an "adaptive weekly plan" that renders the same boilerplate every week. This is the #1 reason a paying customer would cancel.
**Fix:** for each null-backed panel, either wire real data or **remove the panel/heading**; purge every user-facing "deferred / temporarily simplified / not being interpreted yet" string before charging.

### P1-7 · Other real defects (grouped)
- **Dashboard refetch loop** (`DashboardPage.jsx:78-100`): `workoutMemory` / `data?.profile` (fresh object refs) in the effect deps → `/workout-library` refetches (with a loading flicker) on *every* meal log, habit toggle, hydration tap.
- **CoachPage dead-ends** (`CoachPage.jsx:20-40`): fetch failure renders a bare unbranded string with no retry; a `{}` payload shows "check back shortly" forever. (Contrast ProgressPage, which has a proper Retry card.)
- **`weekly-check-in` weekKey unbounded** (`server.js` ~1456): a 5,000-char `weekKey` is accepted (201) and used as the upsert key → unbounded per-user data bloat. Derive `weekKey` server-side.
- **ActivityList remove is unguarded** (`ActivityList.jsx:26` → `NutritionPage.jsx:293`): double-click fires two DELETEs; the second 404s as an **unhandled promise rejection**. (WorkoutsPage favorites *are* guarded — inconsistent.)
- **No client submit-guards** create duplicate rows: 8 concurrent identical meal POSTs all persisted (server correctly serializes, so no data *loss*, but a double-click = duplicate meal).

---

## 4. P2 — Hardening / polish
- **Session token in `localStorage`**, 30-day bearer, no device binding → XSS-exfiltratable; no "log out everywhere." Prefer httpOnly+Secure+SameSite cookie.
- **Login username-enumeration timing side-channel** — nonexistent email ≈42 ms vs existing ≈100 ms (scrypt only runs when the user exists). Do a dummy scrypt on the not-found path.
- **Non-constant-time hash compare** (`store.js:354` `===`) → use `crypto.timingSafeEqual`.
- **Tolerant `Bearer` parse** (`server.js:919` non-anchored `.replace`) — a raw token with no `Bearer ` prefix authenticates. Tighten to `^Bearer `.
- **CORS falls back to fully-open** (`cors({})`) when origins env is unset — enforce an allowlist default.
- **Webhook processed-then-recorded** across two DB transactions (`stripeBilling.js`) — dedupe within one read-modify-write. (Dormant; billing off.)
- **`WorkoutDetailModal` 800 ms timeout** not cleared on unmount; **`BillingSuccessPage`** retry `setTimeout` loop not cancelled on unmount → state-update-on-unmounted warnings.
- **Control chars / emoji / markup stored raw** in names (inert under React JSX today, but latent stored-XSS if ever surfaced via PDF/CSV/email/`document.title`/`dangerouslySetInnerHTML`).
- **Verbose auth errors** leak Node internals on type-confused input; coerce/validate types up front.

---

## 5. What is actually SOLID (verified, not assumed)
A red team should report what held up. These were attacked and did **not** break:
- **No IDOR.** Every protected route derives the user from the token (`request.user.id`), never a client-supplied id; `/api/meals/:id` etc. filter within the caller's own data. Confirmed live.
- **No paywall bypass.** `PATCH /api/profile`/`/api/goals` with `{tier:"premium",subscriptionStatus:"active",…}` → 200 but **silently dropped** (strict field whitelist; entitlement lives on the account object, mutated only by the Stripe webhook path). `/api/weekly-plan` stayed **403**. Client `accessTier` checks are cosmetic only.
- **Strong auth primitives.** Tokens = `crypto.randomBytes(24)` (unforgeable; garbage/tampered → 401). Passwords = salted `scrypt`, no plaintext. Logout truly invalidates. Sessions expire (30 d) and are pruned on read. Email case-normalized (no duplicate-account bypass). `requireAuth` covers every non-public route.
- **Disabled billing degrades gracefully.** All Stripe endpoints return clean `503 {billingEnabled:false}`; upgrade CTAs disable and relabel "Coming soon" (no dead buttons firing into 503). Webhook forgery guarded by signature check.
- **No live stored XSS.** No `dangerouslySetInnerHTML`/`innerHTML` sinks; all user strings render through auto-escaping React JSX. Injected markup is stored but inert.
- **No in-process lost updates.** 8-way (and agent's 30-way) concurrent writes all persisted — synchronous fs serializes the read-modify-write critical section. (The risk is crash-mid-write, P0-1, not interleaving.)
- **Stable in normal use.** Corrupt localStorage token → graceful logout to auth page, 0 console errors. Back/forward/refresh clean. `ErrorBoundary` renders a branded recoverable fallback (no white screen). Birthdate validation is robust (future/year-0001/garbage/non-adult all 400).

---

## 6. Persona 1 — First-time user (zero explanation)
Central problem: **there is no guided first action.** The app front-loads data collection, then drops the user into a long, mostly-empty, self-similar dashboard studded with locks and "deferred" placeholders.

- **[High] Onboarding is 7 steps and hard-blocks on body metrics** (birthdate/height/weight) *before showing any value* (`OnboardingFlow.jsx` step 5, ~699-715). Highest-friction data demanded before a single exercise is seen — a classic activation killer. → Let users reach a workout after goal + environment (2 taps); defer body metrics.
- **[High] "App mode" (Full System / Training Only / …) is asked before the user knows what a module is** and silently amputates half the app (`HIDDEN_MODULES_BY_MODE`). → Default everyone to Full System; move this to Preferences.
- **[High] Day-one dashboard is huge and empty** — ~10 stacked panels, ring at 0%, "0 streak / 0 habits," before the user has done anything. Multiple panels ("Your path," "Today's focus," "Today's training direction," "Today's recommended workout") are the *same* "start a workout" idea in different wrappers (because the differentiating data is `null`). → Collapse to one "Start this workout" card until the first session is logged.
- **[High] Plan & Progress read as filler** — headers like "Program arc," "Next week likely emphasis," "variety analysis" whose bodies are permanent placeholders. → Wire or remove.
- **[Med] Free-tier caps and "smaller free preview" / "Locked on Free" banners are pushed before any value lands** (dashboard cap-banner, Workouts picker). → Let the first sessions be frictionless; introduce lock messaging after activation.
- **[Med] Nutrition can open to a bare "turned off" dead-end**; **Coach can open to "check back shortly"**; **Mobility has two competing category pickers**; **desktop nav hides destinations behind a group→submenu indirection** for only ~9 pages. → Flatten and give every "off/empty" state a real preview + CTA.
- **[Low] AuthPage value prop is a changelog** ("now includes authentication, persistent dashboard data…") — plumbing, not outcomes; no free-tier reassurance, no preview before the signup form. → Lead with an outcome + "Free to start. No card required."

## 7. Persona 2 — Most demanding paying customer
**Would I keep paying at $119.99/yr? No — not yet.** The app markets "adaptive," "coaching," and "why this works" intelligence, but the code shows that layer is stubbed. I'd feel the depth is a facade within a week.
- **What disappoints:** the intelligence is hardcoded `null` across every premium-adjacent screen (fake depth); the headline premium benefit is **"unlimited logging"** — i.e., paying to remove the app's own artificial 2-sessions/week cap, a nag-wall not added value; the "Coach" is a static one-paragraph summary, not a coach (no interaction); the same "next workout" and "why this works" copy repeats across 5-6 screens.
- **What makes me uninstall:** reading "**your analytics are temporarily simplified / deferred**" *after paying*; realizing the "adaptive weekly plan" renders identical boilerplate every week; the escaped exercise-media defects (Arnold Press baked-in text; "text coaching guide" = no image) that make a premium app feel unfinished.
- **Is the free/premium split fair?** Leans naggy: free is deliberately capped **and** the Premium "interpretation layer" it points to isn't real yet — the worst of both.
- **To earn recurring payment:** ship the intelligence layer for real, or reprice as a one-time / cheaper tier until it exists; stop selling cap-removal as the headline; purge the "deferred" strings; deduplicate the recycled copy.

---

## 8. Recommended backlog additions (prioritized)
These are red-team-driven units for the owner to slot into `FACTORY.md` §7. Gates-first ordering:
1. **Backend hardening unit (P0):** atomic `writeDb` + guarded `readDb` (+`.bak` recovery); password length cap + async scrypt; rate limiting on auth + writes; terminal error middleware (JSON, no stacks) + `/api/*` JSON 404; set `NODE_ENV=production`; CORS allowlist default. *(Add a QA scenario that asserts malformed-JSON → JSON 400 with no path leak, and that a huge password is rejected fast.)*
2. **Persistence unit (P0):** the already-flagged `/tmp` → persistent disk / SQLite behind `store.js`. (Owner-gated on infra.)
3. **Input-integrity unit (P1):** type-guard all numeric validators; reject whitespace-as-clear; guard chart points against non-finite; server-derive `weekKey`. Add a QA scenario feeding array/whitespace/empty numerics and asserting 400 + no corrupt persistence.
4. **Offline & error-state unit (P1):** offline detection + friendly states; guard `response.json()`; CoachPage retry card; fix the theme-boot clobber (quick win); ActivityList remove guard.
5. **Trial-integrity unit (P1, do before enabling billing):** clock-based trial expiry (fail closed) + honest day-count.
6. **"Real depth or no depth" unit (P1, retention):** for every `null`-backed intelligence panel, wire real data or delete it; purge user-facing "deferred/simplified" strings; deduplicate recycled copy. This is the highest-leverage change for actually justifying a subscription.
7. **First-run activation unit (P1, activation):** shorten onboarding to goal+environment; one "Start this workout" day-one dashboard; defer caps/locks until after first completion.

*None of these were auto-started — they are scoped for the owner to prioritize into the conveyor.*
