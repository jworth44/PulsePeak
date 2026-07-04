# PULSEPEAK FACTORY
## Manufacturing System — V1.0
### Status: ACTIVE · Production Mode

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

Work top-down. Re-rank only on new evidence, not novelty.

1. **Close the reviewed-media gap** — 35 exercise variants (sumo deadlift,
   leg extension, crunch, russian twist, bird dog, box jump, …) fall back
   with no canonical reviewed asset. This is the product's biggest
   credibility risk and is flagged by its own QA as a warning. Produce +
   review assets through the existing media pipeline; QA warning list is the
   ledger, empty list = done.
2. **Desktop & mobile installability** — add the PWA layer (manifest,
   service worker, icons, install prompt) and add mobile-viewport scenarios
   to the launch QA so gate 5 is enforced by machinery, not memory.
3. **Billing runtime decision** — `BILLING_RUNTIME_ENABLED` is off (Stripe
   endpoints 503). Re-enable in **test mode** and verify checkout → premium
   entitlement → cancel end-to-end. (Live keys = owner gate.)
4. **Coaching runtime decision** — same treatment as billing.
5. **QA de-flake sweep** — replace remaining bare `waitFor`s with the
   stable-anchor + diagnostics pattern already applied to the preferences
   gate, so the launch gate can never false-fail or silently mask.
6. **Persistence hardening** — JSON file storage is fine until evidence says
   otherwise (corruption, concurrent-write loss, scale). When that evidence
   appears, migrate to SQLite behind the existing `store.js` seam. Not before.
7. **Repo hygiene** — root is littered with tmp logs, a 788 KB review
   bundle, and `temp/` artifacts. Move review/media artifacts under
   `artifacts/`, delete dead logs, keep root clean.

## 8. COMPLETION STATES (objective, auto-granted — no approval theater)

- **Launch Complete V1** = backlog items 1–5 done, all quality gates green,
  README run-instructions verified cold on a fresh clone.
- **Revenue Ready** = Launch Complete V1 + billing verified in test mode +
  owner has supplied live keys and flipped the switch (the only owner step).

When a state's checklist is objectively met, the state is **granted
automatically** and recorded in the log. No sign-off ceremony.

## 9. FACTORY EVOLUTION (anti-meta-factory rule)

The factory is these ~150 lines plus the existing QA harness. It is **not a
second product.** It changes only on **recurring production evidence** — the
same pain twice, a gate that missed a real defect, a manual step done three
times. Speculative process, new governance docs, and "manufacturing operating
systems" are refused by default. The measure of this factory is simple:
every release should make the next release easier, safer, and faster —
demonstrated by the log, not asserted.
