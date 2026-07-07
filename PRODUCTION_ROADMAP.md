# PulsePeak — Production Implementation Roadmap

*Living document. Governs production implementation of the approved **Creative Direction V2**
until commercial launch readiness. Organized around **Product Capabilities** (complete user
experiences), not pages. Under the Product Excellence Standard + CD V2. Updated whenever
implementation changes understanding.*

**Status:** ACTIVE — implementation authorized 2026-07-07. Discovery / architecture / research /
concept phases are CLOSED. Design authority = `CREATIVE_DIRECTION_V2.md`. No CD V3, no new
concepts, no competitor research.

---

## Execution Protocol (grounded in real capabilities)

*The unit of work is the **Product Capability**, not the session. But be honest about mechanics.*

1. **Capability = completion boundary; checkpoint = mechanism.** A capability is done only when it
   meets the Product Excellence Standard DoD (both themes · mobile+tablet+desktop · media
   reviewed or queued · a11y · perf · honesty · consistency · build 0 · qa green · adversarial
   self-review · browser-structure verified). Within it, work proceeds in **committed green
   checkpoints** — safe resume points, never stopping goals.
2. **Honest mechanics.** Execution happens in triggered turns with finite context; a capability
   usually spans several turns. Bridge them by committing every green checkpoint (nothing lost)
   and keeping the plan here (survives context compaction). Cross-turn **unattended** running
   requires a re-trigger (`/loop`, a scheduled task, or "continue") — it is a mode the owner
   switches on, not a default.
3. **REGRESSION GUARD (hard rule — never go backwards).** A checkpoint may be committed ONLY if:
   build exits 0 · `qa:launch` green-count ≥ the last green count (never fewer scenarios passing)
   · zero new console errors · the Daylight+Midnight leak/contrast scan is no worse · no legacy
   palette reintroduced. If anything regresses, fix before committing. This mechanically enforces
   "improve throughout, never regress."
4. **Parallelization.** Single-threaded, by me: ALL visual/design/composition implementation (one
   coherent language). Background agents ONLY for read-only analysis that cannot fracture design
   (media audit · a11y/contrast scan · docs · research · QA sweeps · dead-code/consistency audit);
   their output is advisory — I serialize any change into the one design myself.
5. **Pixel verification — diagnosed playbook.** Screenshot capture is available in a FRESH session
   and **wedges only after a very long session** (renderer/compositor capture path exhausts while
   JS/DOM/a11y/network keep working). Confirmed 2026-07-07: not the app, not the build (renders +
   snapshots fine), not fixable by server/tab restart. **Playbook:**
   - Do the **visual capabilities (C3 Today, C4 Train, C5 Exercise) in a fresh session** so I
     self-verify **real screenshots** at every checkpoint (both themes, desktop + mobile).
   - A **hung screenshot mid-session is the signal to start a fresh session** (resets the renderer).
   - **Mid-session fallback verification** (always valid): `preview_snapshot` (exact rendered
     text/roles/hierarchy) + computed-style WCAG-contrast/leak scans + QA + console. Covers
     correctness/structure/content/contrast; only taste-level pixel polish needs eyes.
   - **Guardrail when capture is down:** a ~2-minute owner visual pass at the capability boundary.
   So the "premium-unattended" ceiling is real only in long sessions; fresh sessions close it.
6. **Living roadmap.** Anchored to capabilities + %-complete, re-estimated continuously. Any
   calendar figure is a derived, clearly-caveated view — never the anchor.
7. **Efficiency.** Commit every green checkpoint; build once + qa once per checkpoint (no redundant
   runs); overlap read-only verification via background agents during implementation; treat the
   approved concept artifacts as the build spec (don't re-decide design); prefer computed-style +
   QA verification (fast, precise) over slow screenshot loops.

---

## How this roadmap is sequenced (my determination)

**Guiding logic:** build the *foundation the whole app inherits* first (tokens, shell), then the
*daily-use spine* in the order a user meets it (Today → Train → Exercise), then the *supporting
experiences* (Progress → Coach → Recovery → Nutrition), then *commercial*, then *media* and
*launch readiness* as the closing sweeps. Mobile-first every time; desktop inherits.

**Critical path (must be serial):**
`C1 Foundation → C2 Shell → C3 Today → C4 Train → C5 Exercise → C12 Launch Readiness`
Everything else hangs off the shell + tokens and can be sequenced flexibly.

**Parallelizable once C1+C2 land:** C6 Progress, C7 Coach, C8 Recovery, C9 Nutrition, C10
Commercial are largely independent screens sharing the same component kit — order by value, not
dependency. **C11 Media** runs *continuously inside every capability* (each capability reviews its
own media) and finishes as a dedicated sweep for anything owner-gated.

**Effort sizing** (relative build units, not calendar): S / M / L / XL.

| # | Capability | Depends on | Size | Parallel? | Notes |
|---|---|---|---|---|---|
| 1 | **Foundation** (tokens/themes/motion) | — | L | no (blocks all) | The whole app inherits this. |
| 2 | **Product Shell** (nav/scaffold) | C1 | M | no (blocks screens) | Removes the sidebar; tab bar + top pill. |
| 3 | **Today** (Dashboard V5) | C1, C2 | L | after C2 | The flagship; sets the screen-level bar. |
| 4 | **Train** (session flow) | C1, C2 | XL | after C3 | Session V4 live flow; highest interaction complexity. |
| 5 | **Exercise** (library + guide) | C1, C2 | L | ∥ C4 | Library V4 + Guide V4; heavy media review. |
| 6 | **Progress** | C1, C2 | M | ∥ | Already close; restyle + story. |
| 7 | **Coach** | C1, C2 | M | ∥ | Editorial single-statement; logic already honest. |
| 8 | **Recovery** | C1, C2 | M | ∥ | Mobility → reflection → tomorrow. |
| 9 | **Nutrition** | C1, C2 | M | ∥ | Honest targets; logging. |
| 10 | **Commercial** (premium/auth/onboarding/settings) | C1, C2 | L | ∥ | Trust-building; owner-gated at live keys. |
| 11 | **Media Excellence** | all above | XL | continuous | Per-capability review + final sweep; owner-cost-gated re-shoot. |
| 12 | **Launch Readiness** | all above | M | last | Prove, don't declare. |

**Recommended implementation order:**
`1 → 2 → 3 → (4 ∥ 5) → 7 → 6 → 8 → 9 → 10 → 11 (finalize) → 12`

---

## Technical risks

- **R1 — Light theme (Daylight) parity.** The current CSS is dark-assumed with many
  `rgba(255,255,255,α)` values. Making Daylight (light) flawless everywhere is the single biggest
  technical risk. *Mitigation:* drive **everything** through theme tokens in C1; ship **Midnight
  as the initial default** (a low-risk warm-graphite retune of the existing dark app), harden
  Daylight per-capability, and only promote Daylight to default once it passes on every capability
  (C12 gate). This honors CD V2's two-theme intent without shipping a broken light mode.
- **R2 — Legacy components surviving.** Old `.panel`/badge/overline patterns could linger.
  *Mitigation:* C1 documents the retired patterns; each capability replaces them in its scope;
  C12 greps for survivors.
- **R3 — Session flow (C4) state complexity.** Live workout = the most stateful surface.
  *Mitigation:* isolate it; expand `qa:launch` engine coverage; browser-verify the full flow.
- **R4 — Media dependency (C11).** Cinematic heroes/guides need real photography (owner-cost-
  gated Gemini re-shoot). *Mitigation:* every hero ships as a **designed tile now**, upgrades to
  photo later; the media production queue tracks exactly what owner-generation is needed.
- **R5 — QA gate breadth.** `qa:launch` (18 scenarios) + `qa:media` must stay green through a
  ground-up visual change. *Mitigation:* build + qa after every capability; expand coverage when a
  defect class appears.

## Commercial risks
- Perceived quality gap if a capability ships before its media is at least designed-tile quality.
- Theme-divergence (Daylight=Pine, Midnight=Ember) trades instant brand recognition for two
  identities — owner-directed; revisit only on owner signal.

## Launch blockers (engineering — I own these)
Foundation retire of old language · shell/nav rebuild · all 10 experience capabilities at the
Standard · media at commercial quality or queued · QA green · a11y · perf · consistency.

## Owner-only blockers (I cannot clear these)
- Live **Stripe** keys + `BILLING_RUNTIME_ENABLED` flip (checkout).
- **Deployment** authorization + infra (Railway/Cloudflare) + persistent DB (the P0 `/tmp`
  ephemeral-storage issue).
- **Domain/DNS**, legal (privacy/terms) sign-off.
- **Anthropic API key** for the Living Coach (optional differentiator).
- **App Store / Play** accounts (only if beyond web PWA).
- **Owner-generated media** (Gemini re-shoot spend) — tracked in the media production queue.

---

## Progress log (per capability)

*Each capability closes with: build ✓ · qa ✓ · browser (desktop+mobile, both themes) ✓ · a11y ·
media review · commit · production-log line · roadmap update. Then the next begins immediately.*

- **C1 Foundation** — ✅ DONE (100%).
  - *1a Token system + two equal themes + system support + literal tokenization* — ✅ DONE
    (`64db540`): Midnight + Daylight; build 0, qa 18/18, both themes verified.
  - *1b Retire the old design language + Daylight parity* — ✅ DONE (`2f28038`): deleted
    the 5 dead novelty-theme blocks; **zero legacy palette references remain in src**;
    surface near-blacks flip per theme; Daylight leak-scan clean on Dashboard + Coach
    (0 dark-fills / 0 low-contrast); themes are equal, default is a one-constant owner
    choice. build 0, qa 18/18.
  - *1c C1 tail* — ✅ DONE: added the CD V2 **size-specific type-tracking token system**
    (`--track-display/-heading/-body/-numeral/-caps/-caps-loose`) and wired hero display
    + tabular numerals to it (byte-identical values → no visual change); **rewrote
    `DESIGN_SYSTEM.md`** from the retired v2 "Peak" system to the actual CD V2 Midnight/
    Daylight/Ember tokens in code (single source of truth); confirmed reduced-motion +
    focus-visible are robust. build 0, qa 18/18, 0 blockers/warnings.
- **C2 Product Shell** — ▶ NEXT. Remove the desktop sidebar; one centered content column
  both viewports; bottom tab bar (mobile) / centered top pill (desktop) with 4 doors
  **Today · Train · Progress · You**; safe-area insets; loading shell. Visual → verify
  with real screenshots (both themes, desktop+mobile) in a fresh session per §5 playbook.
- C3–C12 — queued.

---

## Timeline to launch (estimate — living, updates as reality lands)

**Unit = one focused build session** (a substantial working turn, e.g. C1-1a or C1-1b was
one each). Wall-clock depends on (a) how many sessions we run per day and (b) owner-only
blockers, which I cannot clear. I estimate *effort*; you control *cadence*.

| Capability | Remaining effort (sessions) | Cumulative |
|---|---:|---:|
| C1 Foundation (tail 1c) | 0.5 | 0.5 |
| C2 Product Shell | 2 | 2.5 |
| C3 Today | 2 | 4.5 |
| C4 Train (most complex) | 3.5 | 8 |
| C5 Exercise (+ media review) | 3 | 11 |
| C7 Coach | 1.5 | 12.5 |
| C6 Progress | 1.5 | 14 |
| C8 Recovery | 1.5 | 15.5 |
| C9 Nutrition | 1.5 | 17 |
| C10 Commercial | 2.5 | 19.5 |
| C11 Media Excellence (my part) | 1.5 | 21 |
| C12 Launch Readiness | 1.5 | ~22.5 |

**→ Milestone M1 — "Engineering complete":** ~22–23 build sessions. All 12 capabilities at
the Standard, QA green, both themes at parity, media either fixed or itemized in the owner
production queue. **Calendar:** ~**2.5–3 weeks** at ~2 sessions/working-day, or ~**4–5 weeks**
at ~1/day.

**→ Milestone M2 — "Commercially published":** M1 **plus owner-only tasks**, which can run in
parallel with late engineering:
- Persistent DB + deploy (Railway) · live Stripe keys + enable billing · domain/DNS + origins
  · legal (privacy/terms) sign-off — together ~**2–4 owner-days** if done promptly.
- **Media re-shoot** (Gemini, owner-cost-gated) — the biggest variable; can be **phased**
  (ship with designed tiles, upgrade to photography per family) so it does *not* block launch.
- Optional: Anthropic key (Living Coach), App Store/Play accounts (only if beyond web PWA).

**Realistic publish:** a **web-PWA soft launch ~1 week after M1** if the owner clears infra/
Stripe/domain/legal promptly and media ships phased (designed tiles first). A fully
re-photographed launch is gated on the media program's pace. **Net: ~4–6 weeks to a
credible commercial web launch** under an active cadence, with the exact date set by session
frequency + owner-blocker turnaround. Updated after each capability.

*(This section is updated as each capability completes.)*
