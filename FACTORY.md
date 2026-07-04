# PULSEPEAK FACTORY
## Manufacturing System — V1.1
### Status: ACTIVE · Production Mode

*V1.1 (2026-07-04): added the Engine Verification Matrix (§5a), reordered the
backlog gates-first, adopted the Production Complete → Premium Complete
ladder (§8), and mapped the owner's manufacturing vocabulary into the factory
(§10) — every concept has exactly one home; nothing became a second document.*

This document supersedes the "Independent Manufacturing System Directive."
That directive was audited and rebuilt: it specified a factory in exhaustive
detail but never defined the product, set no measurable quality bar, had no
MVP or backlog, and demanded a meta-factory before one feature shipped. This
version keeps its sound kernel — IP isolation, verification before "done,"
evidence, discipline — and grounds every rule in the real, running codebase.

---

## 1. THE PRODUCT (what the old directive never said)

**PulsePeak Fitness** — a full-stack freemium fitness platform. React + Vite
frontend, Express backend, JSON persistence, auth + onboarding, a reactive
workouts engine, weekly plan, mobility, nutrition, progress tracking,
preferences, a reviewed-media pipeline for exercise imagery, and a Stripe
premium flow (currently disabled at runtime for the launch baseline).

**Platform target: desktop AND mobile from one codebase.**
- One responsive web application is the product. It must be verified at
  desktop and mobile viewports — both are first-class.
- It becomes installable on both via PWA (manifest + service worker + icons).
- Native wrappers (Electron, app-store shells) are *evidence-gated future
  units*: built only when a concrete need appears that the PWA cannot meet.

**Customer & model:** B2C freemium. Free tier is genuinely useful; Premium
(weekly plan personalization and beyond) is the paid tier via Stripe.

## 2. ISOLATION BOUNDARY (kept — the kernel of the old directive)

PulsePeak shares **no code, content, assets, branding, data, folders, or
business logic** with Orientra or any other product — in either direction.
Nothing in this factory may touch, change, or risk Orientra in any way.

That is an **IP and safety boundary, not amnesia**. Generic, non-proprietary
engineering knowledge (testing discipline, release hygiene, verification
habits, security practice) is reused freely — refusing proven engineering
patterns is re-paying for lessons already learned. What is banned is copying
implementations, content, or identity between products.

## 3. GROUND TRUTH

Code and QA evidence > this document > any chat. If this document disagrees
with what the verified, running app does, the app is the truth and this
document gets corrected.

## 4. PRODUCTION CYCLE

Work happens in **units**. One unit = one shippable improvement, taken to
verified-done before the next begins. No batching of unverified work.

For each unit: **Plan → Build → Verify → Record → next.**

- *Plan*: one sentence — what changes and what its acceptance check is.
- *Build*: the change, matching existing code style and structure.
- *Verify*: the quality gates below, plus the unit's own acceptance check,
  observed in the running app — never assumed from code reading.
- *Record*: a git commit with a clear message + one line in
  `PRODUCTION_LOG.md` (what/why/evidence). That is the entire record.

## 5. QUALITY GATES (measurable — replaces the old adjective list)

A unit is **done** only when all of these hold:

| Gate | Standard |
|---|---|
| Build | `npm run build` exits 0 |
| Launch QA | `npm run qa:launch` — all scenarios pass, `blockers: []` |
| Runtime errors | 0 console errors, 0 page errors during QA browser coverage |
| Media | Every surfaced exercise visual resolves through the reviewed-media catalog — no unreviewed or silently-faked fallbacks on shipped surfaces |
| Both platforms | UI change ⇒ verified at desktop AND mobile viewport |
| Honesty | No dead buttons, fake states, or simulated depth introduced |

"Works" is necessary, not sufficient. But the check is proportional to the
change — a copy fix does not re-run the world; a flow change does.

### 5a. ENGINE VERIFICATION MATRIX

The product is six engines. Each must have at least one **machine-run,
end-to-end acceptance scenario** in the launch QA — an action performed and
its effect asserted, not just a page rendering. Audit of current coverage
(2026-07-04):

| Engine | Exists in code | E2E verification today | Required scenario |
|---|---|---|---|
| Workout Engine | ✓ | ✅ Deep (filters, modal, save mutation asserted, session start) | — covered |
| Exercise Library | ✓ | ✅ Media audit + `qa:exercise-library` | — covered |
| Nutrition Engine | ✓ meals/protein/hydration | ⚠️ route render only | log meal → dashboard calories/protein update |
| Habit Tracking | ✓ `/api/habits/toggle` | ❌ none | toggle habit → state persists across reload |
| Body Metrics | ✓ weight history, weekly check-in, recovery | ❌ none | submit check-in + recovery → history/trend reflects it |
| Progress Engine | ✓ `/api/progress` | ⚠️ route render only | after logged actions, progress numbers assert correct |

**Rule: no engine may be declared complete — and Production Complete cannot
be granted — while its row is not ✅.** New engines enter this matrix before
they enter the product.

## 6. AUTONOMY CONTRACT

The owner is a **reviewer, not a checkpoint**. Units run autonomously
end-to-end: build, verify, record, continue.

Stop and ask **only** for:
- anything spending real money or touching live payment keys/live Stripe mode
- deleting or migrating user data irreversibly
- publishing/deploying to a public URL or app store
- legal/health positioning (medical claims, privacy policy, pricing)

Everything else: decide, note the decision in the log, keep moving.

## 7. BACKLOG V1 (prioritized; evidence-based — replaces "~19 subsystems")

Work top-down. Re-rank only on new evidence, not novelty. **Gates before
goods:** verification machinery ships before the content it must judge.

1. **Engine QA depth** — add the four missing end-to-end scenarios from the
   matrix (§5a): nutrition, habits, body metrics, progress. Built with the
   stable-anchor + diagnostics pattern (this absorbs the de-flake sweep —
   every scenario written or touched adopts it). Done = matrix all-✅.
2. **Close the reviewed-media gap** — 35 exercise variants (sumo deadlift,
   leg extension, crunch, russian twist, bird dog, box jump, …) fall back
   with no canonical reviewed asset — the product's biggest credibility
   risk, flagged by its own QA. Produce + review through the existing media
   pipeline. The QA warning list is the ledger; empty list = done.
3. **Desktop & mobile installability** — add the PWA layer (manifest,
   service worker, icons, install prompt) and mobile-viewport scenarios in
   launch QA so gate 5 is enforced by machinery, not memory.
4. **CI** — GitHub Actions on the existing remote: build + `qa:launch` on
   every push to main; a red run blocks the conveyor until green. (Note:
   the QA harness uses `playwright-core` against a local Chrome — the
   workflow needs a browser install step; QA requires no live secrets while
   billing is disabled.)
5. **Billing runtime** — `BILLING_RUNTIME_ENABLED` is off (Stripe endpoints
   503). Re-enable in **test mode** and verify checkout → premium
   entitlement → cancel end-to-end. (Live keys = owner gate.)
6. **Coaching runtime** — same treatment as billing.
7. **Persistence hardening** — JSON storage is fine until evidence says
   otherwise (corruption, concurrent-write loss, scale). Then migrate to
   SQLite behind the existing `store.js` seam. Not before.
8. **Repo hygiene** — root is littered with tmp logs, a 788 KB review
   bundle, and `temp/` artifacts. Move review/media artifacts under
   `artifacts/`, delete dead logs, keep root clean.

## 8. COMPLETION STATES (objective, auto-granted — no approval theater)

Two states, in order, matching the production ladder used across the
owner's products:

- **PRODUCTION COMPLETE** = the free product is honestly done:
  - Engine Verification Matrix all-✅ (item 1)
  - reviewed-media ledger empty (item 2)
  - installable + mobile-viewport gates enforced (item 3)
  - CI green on main (item 4)
  - repo hygiene done (item 8)
  - all §5 quality gates green; README run-instructions verified cold.
- **PREMIUM COMPLETE** = the commercial product is honestly done:
  - Production Complete, plus
  - billing verified end-to-end in test mode (item 5)
  - coaching runtime enabled + verified (item 6)
  - free / trial / premium entitlement boundaries asserted in QA
  - the only remaining step is the owner flipping live keys.

When a state's checklist is objectively met, the state is **granted
automatically** and recorded in the log. No sign-off ceremony anywhere in
normal manufacturing.

## 9. FACTORY EVOLUTION (anti-meta-factory rule)

The factory is these ~150 lines plus the existing QA harness. It is **not a
second product.** It changes only on **recurring production evidence** — the
same pain twice, a gate that missed a real defect, a manual step done three
times. Speculative process, new governance docs, and "manufacturing operating
systems" are refused by default. The measure of this factory is simple:
every release should make the next release easier, safer, and faster —
demonstrated by the log, not asserted.

## 10. VOCABULARY MAP (every manufacturing concept → its one home)

The owner's manufacturing vocabulary maps into this factory as follows.
Each concept lives in exactly one place; none becomes a separate document.

| Concept | Home in this factory |
|---|---|
| Foundation | This document (§3: ground truth — code > FACTORY.md > chat) |
| Production Director | §6 — the AI operator runs production end-to-end; owner is reviewer |
| Production Pipeline | §7 — the ordered backlog, worked top-down |
| Conveyor | §4 — one unit in motion at a time; taken to verified-done before the next starts |
| Production Cycles | A cycle = a contiguous run of units. The log is the state: resume mid-backlog with zero re-planning |
| Production Verification | §5 gates + §5a Engine Verification Matrix |
| Manufacturing Records | §4 Record: git commit + PRODUCTION_LOG.md line per unit |
| CI | Backlog item 4 — build + qa:launch on every push; red blocks the conveyor |
| Lean Manufacturing | §4/§9 — smallest change that passes the gates; no speculative work, no ceremony |
| Parallel Manufacturing | Parallelism *inside* a unit (e.g. media assets generated/reviewed in parallel batches); the conveyor stays serial *across* units |
| Production Capacity | Never idle: if a unit blocks on an owner gate, park it, pull the next backlog item, note it in the log |
| Commercial Products | §1 free/premium tiers; §8 Premium Complete is the sellable state |
| Family Chassis → **Content Chassis** | Adapted, not imported: one canonical movement schema + reviewed-media slot + QA registration. New exercises instantiate the chassis; they never invent a new shape |
| Knowledge Capture | Lessons land as PRODUCTION_LOG lines; a lesson that recurs is promoted into a FACTORY amendment (§9 evidence rule) |
| CEO Dashboard | The STATUS block at the top of PRODUCTION_LOG.md — one screen: current state, gate results, active unit, next unit. A dashboard *app* is refused until evidence demands one |
| Continuous Improvement | Backlog re-ranking on evidence (§7) + factory evolution (§9) |
| Evolution Protocol | §9 — factory changes only on recurring production evidence |
| Autonomous Production | §6 contract + §8 auto-granted completion states |

Rejected for now, by the §9 rule: a literal dashboard application, any new
governance documents, and generalizing any of this into a cross-product
"Manufacturing Operating System" (that requires multi-product evidence).
