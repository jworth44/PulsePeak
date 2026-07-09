# PulsePeak — Production Implementation Roadmap

*Living document. Governs production implementation of the approved **Creative Direction V2**
until commercial launch readiness. Organized around **Product Capabilities** (complete user
experiences), not pages. Under the Product Excellence Standard + CD V2. Updated whenever
implementation changes understanding.*

**Status:** ACTIVE — implementation authorized 2026-07-07. Discovery / architecture / research /
concept phases are CLOSED. Design authority = `CREATIVE_DIRECTION_V2.md`, operationalized by
`VISUAL_IMPLEMENTATION_DIRECTIVE.md` (owner-approved 2026-07-07 — the editorial/restraint feel
target: *designed, not assembled*; story-first; type-not-borders hierarchy; merge cards; two
premium identities Daylight/Midnight with NO shared accents; remove noise relentlessly). No CD V3,
no new concepts, no competitor research. **Every capability closes only when it meets that feel in
BOTH flagship identities (Daylight + Midnight).**

**⚑ APPROVED VISUAL TARGET (owner, 2026-07-08; v2 ratified 2026-07-09): the Canadian
concept — canonical directive = `APPROVED_VISUAL_TARGET.md`** (adds the
RECOGNITION-BEFORE-READING principle — every card identifiable without reading;
blur test — plus the benchmark decomposition, do-not-redo state, and the
verification playbook). Palette + expression rules: `CANADIAN_DESIGN_LANGUAGE.md`. The concept image (Today's Training + Workout Library,
charcoal/crimson/evergreen) is the **benchmark every completed screen is compared against**:
reproduce the experience (composition · hierarchy · spacing · restraint · typography · emotion),
never the pixels; if a production screen feels less premium than the concept, keep refining.
Implemented so far: the **`maple` theme** (palette + subtle-patriotism chrome). **Structural
benchmark backlog** (cross-theme, sequenced within the existing capabilities): cinematic Today
hero w/ headline + START SESSION (C3 iteration; hero photography owner-gated), 4-stat metric row
(C3; needs honest data — avg-HR only if tracked), Quick Actions row (C3), Recent Activity w/
photo thumbnails (C3/C6; thumbnails from the exercise-photo sets), Workout Library muscle-tile
**live exercise counts** (engineering-tractable now), top-bar search+filter styling (C5).

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
  - **Daylight media mismatch (owner review 2026-07-07, item #7):** the exercise/onboarding
    photos are shot on **dark backgrounds**, which clash with the Daylight paper canvas ("doesn't
    match the vibe"). The re-shoot must produce **theme-appropriate media** (or a light-ground
    variant) so photography reads on both Daylight and the dark themes. Also fold in the
    **onboarding brand-logo washout** on Daylight (`.onboarding-brand-logo` uses
    `mix-blend-mode: screen`, built for a dark canvas → near-invisible on paper; needs a
    transparent-PNG logo or a per-theme treatment). Deferred to the C11 media phase per owner.
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
- **C2 Product Shell** — ✅ DONE (100%).
  - *2a Core shell* — ✅ DONE (`f1d8de3`): `AppShell.jsx` rebuilt to the 4-door centered
    shell (Today · Train · Progress · You); desktop sidebar retired → sticky top pill;
    mobile bottom tab bar; one centered `.app-column` both viewports; contextual
    `.section-subnav` surfaces each door's sub-pages (nothing stranded, `hiddenModules`-
    aware); safe-area insets. QA scenarios migrated; Daylight tier-label contrast fixed.
  - *2b Duplicate-nav fix* — ✅ DONE (`7c9b12f`): the shell's `.section-subnav` now owns
    the "You" section nav on every viewport, so the in-page `.settings-menu-nav` (mobile-
    only) was a duplicate → hidden on all viewports. Loading shell confirmed independent
    of the shell (standalone `.screen-center` splash) — no change needed.
  - *2c Dead-CSS removal* — ✅ DONE: deleted all now-inert `.sidebar*` / `.nav-link` /
    `.tier-pill` rules (~260 lines across styles.css + styles-polish.css), keeping the
    live selectors they shared rules with (`.hero-copy h2`, `.settings-layout`,
    `.settings-menu-button`, `.help-sidebar*`). Provably render-neutral (zero matching
    elements); shell verified byte-identical after removal.
  - Verified throughout on a fresh :3007 server (real authed user): both viewports +
    both themes, correct active states, zero horizontal scroll, 0 console errors. build
    0, qa 18/18, 0 blockers/warnings. (`--sidebar-*` design tokens left in place — shared
    with the theme files, harmless.)
- **C3 Today (Dashboard V5)** — ✅ DONE (100%).
  - *Audit* — ✅ the Today screen's **logic + copy are already sound**: honest activation
    hero ("Let's get your first session in" / evidence "0 sessions logged so far"),
    goal-based session reason (no fabricated deficit), warm time-aware greeting, one
    contextual hero + one primary action ("Start today's session"). C3's real remaining
    work is the **visual packaging** — exactly CD V2's diagnosis (logic premium, packaging
    developer-built).
  - *3a Editorial voice (non-pixel slice)* — ✅ DONE: made `Panel`'s eyebrow conditional
    (no more empty `.section-label` overlines app-wide), removed the reflexive "Today's
    session" `.badge` and the "Daily habits" eyebrow (CD V2: overlines rare → sentence-case
    heading + space). Verified via snapshot/inspect/QA (badge gone, headings intact, 0
    empty labels, 0 h-scroll, 0 console errors). build 0, qa 18/18.
  - *3b Packaging (pixel-heavy)* — ✅ DONE (`c51c4a8` + `0beef0b`): dissolved the below-
    hero bordered card stack (launch / streak / habits) into **quiet sections** — stripped
    card bg/border/shadow/radius, replaced with a top hairline rule + 24px rhythm; the For
    You hero stays the **one elevated focal surface** (CD V2 "sections, not cards"). Habit
    tiles softened to quiet tappable surfaces (no more boxes-in-a-box); removed the
    redundant per-tile "Habit streak" overline; demoted the "For you today" eyebrow from a
    loud accent overline to a quiet `--text-secondary` label. Scoped to a new `.today-page`
    class so the not-yet-restyled screens are untouched. **A11y fix landed:** For You hero
    title `<strong>` → `<h2>` (key content now in the heading outline; UA margins reset).
    **Three contrast defects fixed** (both-theme AA): session reason `.lead-copy` (pinned a
    dark-theme grey that vanished on paper), the eyebrow (my own `--text-muted` regression,
    2.87 → 5.58 on paper), and the streak-freeze line (hardcoded ice-blue 1.9:1 → theme
    token). One-accent audit: already Ember/Pine at the token layer (C1); removed the one
    remaining redundant accent overline. Three-tier disclosure = N/A on Today (its only
    metrics — weekly-goal + streak — already render at the glance tier; drill-in lives in
    C6 Progress).
    - **Verified with real screenshots** (Chrome MCP, screenshot capture was wedged in the
      preview MCP even fresh — drove a connected Chrome instead): both themes × both states
      (fresh no-data + active-streak with-data) on desktop, plus true 375px mobile
      structurally (no horizontal scroll, sections stack, habits single-column, bottom tab
      bar). Clean heading outline (H1→H2→H2→H3→H4, no skips). build 0 · qa:launch 18/18,
      0 blockers/warnings · 0 console errors · both themes AA on all key text.
- **C10 Commercial — onboarding + auth editorial slice** ✅ (the fresh-session tail
  queued after the all-screens editorial pass). The setup flow was the loudest
  "assembled" surface left: two stacked bordered panels + a pill eyebrow + (on
  Welcome) 8 bordered marketing cards before the first choice (owner: "crowded
  Welcome card"), and non-interactive label spans inherited a card hover-lift from
  the exercise-image `.focus-step` override (owner: "non-actionable-card hover").
  Fix per CD V2: scoped `.onboarding-editorial` / `.auth-editorial` → dissolved the
  two panels into one quiet centered column (hairline + rhythm, not boxes),
  **removed the two redundant persistent-hero marketing cards** (declutters every
  step), dissolved the Welcome value cards + review rows into quiet left-ruled
  lines / hairline rows, quieted the pill eyebrows to `--text-secondary` labels,
  and **reset the false hover affordance**. Auth: dissolved the marketing hero to
  quiet page copy, kept the sign-in card as the ONE elevated action surface (CD V2
  "one hero + one action"). Logo reduced to a restrained 184px mark. **Interactive
  choice cards (app-mode / goal / units) correctly keep their tappable box** — only
  display-only cards dissolved. Verified real screenshots both themes (desktop) +
  structural (375px mobile: single column, no h-scroll); 0 contrast fails both
  themes; build 0 · qa:launch 18/18 · 0 console. *Still open in C10:* premium /
  settings restyle; the logo transparent-PNG + onboarding gym-photo baked "BD
  FITNESS" logo are **C11 media** items (now slightly more visible on Daylight
  paper since the surrounding chrome was removed).
- **Consistency sweep** (autonomous `/loop`, 2026-07-08) — clearing editorial
  stragglers that escaped the page-scoped `.panel` dissolves:
  - `e0c6091` — **`.focus-step` false-hover killed app-wide.** It's a plain
    uppercase eyebrow label everywhere (Coach / workout+movement+plan modals /
    onboarding / review; 21 spans, none wrapping an image) yet the polish
    override gave every one a chip bg + `translateY(-3px)` hover. Now quiet type,
    `--text-secondary` (AA both themes). Verified Coach both themes.
  - `51a6c21` — **boxed module page headers dissolved.** `.module-page-hero`
    (Workouts/Plan/Exercise Library/Mobility/Nutrition/Settings) boxed its title
    in a bordered/shadowed card, inconsistent with Today's plain-type header.
    Dissolved (scoped, not the shared `.today-hero` rule); kept 2-col only where a
    2nd column is used (`:not(:has(> :nth-child(2)))` runs title-only heroes full
    width, killing the empty right column); quieted the eyebrow (`.badge` ×5 +
    Exercise Library's red `.section-label`) so all six match. Verified all four
    variants both themes + mobile.
- **C4 Train — advancing** (session modal now in good editorial shape):
  - `f2d5a1f` — dissolved the **4-chip metadata matrix** (Type/Duration/Setup/
    Intensity) into a quiet strip; scoped to `.workout-session-modal`.
  - `eb923ad` — dissolved the two glowy **guidance callouts** (START HERE +
    OPTIONAL WARM-UP) into quiet hairline sections so the **current-exercise card
    is the single elevated hero** and the interactive exercise cards keep their
    boundaries. (Unlocked a data-populated session by granting a *local test user*
    premium — dev data only, gitignored `db.json`, no real billing — to verify.)
  - **Full flow verified end-to-end** (open → 5 exercises → complete → logged →
    streak). Both slices hold throughout. WeekInReview modal = appropriately
    designed (stat recap, not a metadata matrix) — left as-is. The completion
    celebration (Wow-Factor P1-2) didn't render under synthetic completion — built
    with care, left alone.
  - *C4 remaining:* exercise-card density (interactive — careful), celebration
    trigger under real interaction, complete-button presentation.
- **App-wide CD V2: accent eyebrows quieted** `c7942d8` — global
  `.section-label { color: var(--accent) }` stamped the loud accent on every
  section eyebrow; changed to `--text-secondary` so hierarchy comes from type not
  colour (accent reserved for CTAs/active states). Headings now lead. Intentional
  accents keep their overrides (featured tier `--volt`). Verified Coach + Progress
  + auth both themes, 0 contrast fails. **One-line reversible** if coloured
  eyebrows are preferred.
- **Perf: route-level code splitting** (2026-07-09) — measured first: one 512 kB
  monolithic JS bundle (143 kB gzip; Vite's >500 kB warning firing). Split at the
  route level (`React.lazy` for every route except the two entry surfaces —
  AuthPage logged-out, DashboardPage logged-in — which stay eager for fastest
  first paint) + a stable `vendor` chunk (react/react-dom/react-router-dom) so
  app changes no longer invalidate cached framework bytes. Result: **first-load
  JS 512 kB → 311 kB (gzip 143 kB → 93 kB, −35%)**; 20 route chunks load on
  demand; all chunks still PWA-precached (~863 KiB total, unchanged) so
  post-install navigation stays instant. Quiet `.route-loading` Suspense
  fallback (invisible, holds space, role=status). Verified live: registered +
  onboarded a fresh user, SPA-navigated all 9 lazy routes (chunks observed
  loading on demand via the performance API), 0 console errors, 0 failed
  requests. build 0 · qa:launch 19/19 · qa:workout-library PASS.
  Second slice (`87a06b8`): `loading="lazy"` on the four remaining below-fold
  image sites (guide step sequence, movement-reference thumbs, session-modal
  exercise thumbs, nutrition template photos); heroes/logos stay eager. Fonts
  already optimal (preconnect + display=swap). CSS deliberately NOT split —
  the three global stylesheets are the token cascade; fracturing them risks
  theme regressions for ~26 kB gzip. **Perf unit: engineering-tractable items
  complete.**
- **Benchmark fidelity pass (v2.1, 2026-07-09)** — owner sharpened the target:
  Maple must LOOK like the concept screenshot (honesty rules still bind).
  Shipped in four green commits: `cd07a57` cinematic Today hero (TODAY'S
  TRAINING display type + greeting + honest engine copy + one crimson START
  SESSION; Maple designed dusk-mountain backdrop `ca-hero-dusk.svg` via
  `--hero-cinematic`, photography drop-in ready) + Today's Focus card (real
  focus/why/plan + awaiting-media slot) + ROOT FIX: secondary/ghost buttons
  pinned `#ededf0` → `--secondary-button-text` (were invisible on Daylight) ·
  `3f99647` stat-row literal icons (flame/dumbbell/target; flame = accent only
  when streak active) · `6e9091f` Workout Library benchmark bar (persistent
  search, no dead controls) + muscle-first section order + eyebrow-as-heading
  + icon-over-label equipment cards · `e85a93d` mobile search focus fix.
  Verified Maple/Midnight/Daylight screenshots + 375px structural + live
  search filtering; qa:launch 19/19 + qa:workout-library PASS throughout.
- C5–C9, C11–C12 — queued.

### ⏳ Owner-gated / owner-judgment queue (surfaced by the autonomous sweep)
*These are the highest-value remaining moves but each needs your input or gated
access — I've deliberately NOT changed them blind:*
1. **Mobile gutter decision** (the single biggest remaining known issue). `.app-main`
   is `padding: 0 0 16px` at ≤780px — a **deliberate full-bleed-card choice** — so
   plain-type content (greeting, hero titles, dissolved section headers) hugs the
   screen edge at x:0 while card text is inset ~18px. My editorial dissolves
   *exposed* this more (they removed card padding from now-plain sections). The
   standard fix — a ~16px horizontal gutter on `.app-main` — would inset the
   full-bleed cards too, i.e. it overrides the deliberate full-bleed aesthetic
   (full-bleed vs. consistent gutter is a real premium-design fork). Not a
   clear-cut defect, and **cannot be visually verified in this environment**
   (Chrome ext won't go <500px; `preview_screenshot` wedges) — so it's genuinely
   an owner call on a real device.
2. **~~Accent section-label eyebrows~~** ✅ DONE `c7942d8` — quieted to
   `--text-secondary` per CD V2 (you delegated "you decide"). One-line reversible
   to `var(--accent)` if you prefer coloured eyebrows.
3. **C4 session-flow depth** — the modal packaging is now good (metadata + guidance
   dissolved, hero elevated, verified via a local premium-unlock). Remaining depth
   (celebration under real interaction, exercise-card density) wants your ~2-min
   visual pass; billing stays owner-gated for real users.
4. **Liberty → reference polish + Blossom text tweaks** — need your reference board.
5. **C11 media** — logo transparent-PNG + onboarding "BD FITNESS" baked photo.

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
