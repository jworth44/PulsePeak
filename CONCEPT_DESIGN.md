# PulsePeak — Concept Design Phase

*The phase between direction and production. Governed by
[`CREATIVE_DIRECTION_V2.md`](CREATIVE_DIRECTION_V2.md) and grounded in the verified
[`DESIGN_PRINCIPLES_STUDY.md`](DESIGN_PRINCIPLES_STUDY.md). **No production code, no app
changes.** For each major surface: multiple competing concepts → critique → reject the
weak → combine the strongest → a single "to-prototype" concept emerges. Implementation
begins only after a surface's concept is chosen.*

**Process per surface:** propose ≥3 competing concepts (each a distinct interpretation of
the verified principles) → for each state *why it exists · problem it solves · how it
improves PulsePeak · principles it follows · what it replaces · strengths · weaknesses ·
tradeoffs* → critique → synthesize the winner → log the verdict here.

**Deliverable format:** visual concept boards (Artifacts, rendered in the CD V2 language)
+ the written rationale/critique in this record.

## Surface queue & status

| # | Surface | Concepts | Status |
|---|---|---|---|
| 1 | **Today / Dashboard** | V2 One-Verb · V3 Coach's-Brief · V4 Readiness-Glance | **Done → winner "V5"** ([board](https://claude.ai/code/artifact/0fbd2608-63fc-488f-8f8f-2250b7710e88) · [V5](https://claude.ai/code/artifact/d0df0d48-a65f-49dd-82a9-eba94495b068)) |
| 2 | **Workout Session (live)** | A The-Set · B Card-Flow · C Between-Sets | **Done → winner "Session V4"** ([board](https://claude.ai/code/artifact/9e4b35a5-d4e8-4bdb-af97-1ecbbdad645b)) |
| 3 | **Exercise Library** | A Editorial-Grid · B Coach's-Index · C Encyclopedia | **Done → winner "Library V4"** ([board](https://claude.ai/code/artifact/03ed29ba-589d-472f-af8f-16aedb4b83ab)) |
| 4 | **Exercise Guide** | A Cinematic-Sequence · B Scrolling-Teacher · C Loop+Tabs | **Done → winner "Guide V4"** ([board](https://claude.ai/code/artifact/26865de7-e575-420d-b850-7886cf32bac8)) |
| 5 | Workout Completion | — | queued |
| 6 | Coach | — | queued |
| 7 | Progress | — | queued |
| 8 | Recovery | — | queued |
| 9 | Nutrition | — | queued |
| 10 | Navigation shell | — | queued |
| 11 | Premium / Paywall | — | queued |
| 12 | Onboarding | — | queued |
| 13 | Authentication | — | queued |
| 14 | Settings / You | — | queued |

---

## Surface 1 — Today / Dashboard

Visual board: **Artifact — https://claude.ai/code/artifact/0fbd2608-63fc-488f-8f8f-2250b7710e88** (three phone mockups V2/V3/V4 + rationale + synthesis, CD V2 Midnight/Ember language)

Shared scenario for all three: **Jordan**, afternoon, bodybuilding goal, 1 session logged
this week, streak 1, recommended session *Chest + Triceps*. Every concept obeys "one focal
point," "earned color," "honesty," and the warm Midnight/Ember language — they differ in
*which principle leads*.

### Concept V2 — "One Verb" (cinematic single focal point)
- **Why it exists:** to answer the day's only real question — *what do I do right now?* —
  with zero competition. The whole first screen is one move.
- **Problem it solves:** today's dashboard is ~5 stacked bordered panels; the eye has
  nowhere to land first.
- **How it improves PulsePeak:** maximal emotional pull; the session feels like an event.
- **Principles:** one focal point (Oura), photography-is-the-product, one Ember action,
  hierarchy by de-emphasis.
- **Replaces:** the entire multi-panel dashboard.
- **Strengths:** most striking at a glance; most "premium object"; clearest single action.
- **Weaknesses:** hides secondary actions below the fold; **depends on world-class
  photography** — which is the owner-cost-gated media re-shoot, so it's risky until assets
  exist.
- **Tradeoffs:** emotion & focus ⟷ discoverability of habits/streak/nutrition.

### Concept V3 — "The Coach's Brief" (editorial / humanize-the-numbers)
- **Why it exists:** PulsePeak's real edge is an honest coach. Lead with the coach's
  *voice*, not a chart.
- **Problem it solves:** numbers without interpretation read clinical; "1/4 sessions" means
  nothing until it's framed ("right on pace").
- **How it improves PulsePeak:** turns the dashboard into a warm, human daily brief; needs
  **no imagery** (zero media dependency — shippable now).
- **Principles:** humanize the numbers + honest voice (Gentler Streak), editorial
  hierarchy, restraint, honesty ("Recovery — not logged").
- **Replaces:** the dashboard hero + For-You copy.
- **Strengths:** most on-brand for the honesty constitution; ships without the re-shoot;
  most differentiated from every other fitness app.
- **Weaknesses:** least visually arresting in the first 200ms; risk of reading text-heavy if
  the type isn't impeccable.
- **Tradeoffs:** voice & honesty ⟷ visual spectacle.

### Concept V4 — "Readiness Glance" (data-forward, three-tier)
- **Why it exists:** returning power users want a glanceable state read, then drill-in.
- **Problem it solves:** dense metrics dumped flat; no glance→focused→interactive path.
- **How it improves PulsePeak:** one hero ring + a quiet honest stat row; taps expand.
- **Principles:** three-tier progressive disclosure + semantic color (Oura), tabular
  numerals (Apple), glance tier.
- **Replaces:** the dashboard + scattered stat cards.
- **Strengths:** best for daily returning users; showcases data with restraint.
- **Weaknesses / honesty flag:** a "readiness" ring **implies a physiological score
  PulsePeak does not truthfully compute** (no wearable/recovery input). Presenting one would
  violate the honesty constitution. Only viable if the ring encodes an *honest* quantity
  (e.g. weekly-goal progress or training focus), never a faux recovery score.
- **Tradeoffs:** data richness ⟷ the risk of implying data it doesn't have.

### Critique & synthesis → "Dashboard V5" (the concept to prototype)
- **Reject** V4's readiness ring outright on honesty grounds — it implies a recovery score
  we can't back. Keep only its *glance stat row* (honest counts, tabular).
- **V2** brings the strongest emotion but can't lead while the photography is unshipped, and
  it buries secondary actions.
- **V3** is the truest to PulsePeak's defensible edge and ships today.
- **Winner = a synthesis with V3 as the spine:**
  1. **Coach's-Brief opening** (V3): dated eyebrow + one warm, interpreted sentence.
  2. **One session hero** (V2's single focal move) — a full-bleed *Chest + Triceps* tile
     with one Ember **Start**; today rendered as a designed tile (gradient + type) so it
     works **before** the re-shoot and upgrades to cinematic photography **after**.
  3. **Honest glance row** (V4, de-ringed): streak · this-week · (volume when real) in
     tabular numerals — counts only, no fabricated scores.
  4. Quiet sections beneath: habits as light rows, recovery shown only when logged.
- **Net:** emotional focus (V2) + honest human voice (V3) + glanceable truth (V4), with the
  media dependency de-risked and the honesty constitution intact.

**Status:** Dashboard V5 is the candidate to prototype when implementation is authorized.

---

## Surface 2 — Workout Session (live)

Board: **https://claude.ai/code/artifact/9e4b35a5-d4e8-4bdb-af97-1ecbbdad645b**
Scenario: *Incline DB Press, set 2 of 4*, in a Chest + Triceps session. The screen is read
sweaty, at arm's length, one-handed, between sets.

- **A "The Set"** — one set, full screen; huge tabular `70 lb × 8`, one Log button. *Principles:
  one focal point, glance readability. +unmissable from the rack. −loses session context.*
- **B "Card Flow"** — done → doing → next as a flowing card stack; the active exercise expands
  to its set rows. *Progressive disclosure + continuity. +best sense of progress. −active set
  smaller/less arm's-length.*
- **C "Between Sets"** — rest (≈60% of a session) becomes the moment: countdown + next target +
  one cue + a single earned haptic. *Causality/Utility, anticipation. +turns dead time into
  coaching. −only covers the rest state; half a screen alone.*

**Critique → winner "Session V4":** the three are *states of one screen*, not rivals. **Card
Flow frame** (B) + **the active card rendered as "The Set"** (A, big tabular, one Log button) +
**rest takes over** after logging (C, one haptic at rest-end). **Honesty guard:** "last time ·
65 × 8" and any suggested load show only from real logged sets; a first-ever session shows no
"last time" rather than inventing one.

---

## Surface 3 — Exercise Library

Board: **https://claude.ai/code/artifact/03ed29ba-589d-472f-af8f-16aedb4b83ab**
Replaces today's database record-cards (`PATTERN/EQUIPMENT/MUSCLES/JOINT STRESS`) + filter panel.

- **A "Editorial Grid"** — full-bleed 4:5 movement tiles; long tail gets designed placeholder
  tiles. *Photo-is-product. +beautiful, tactile. −flat; no intent guidance.*
- **B "Coach's Index"** — browse by intent via rails ("For today · push", "Warm up shoulders").
  *Ambiguous/task-based IA, anticipation. +most helpful for discovery. −needs curated rails;
  honesty risk on "for today".*
- **C "Encyclopedia"** — search-first hero + quiet filter chips + elegant result list.
  *Recognition, information scent. +fastest to a known movement. −utilitarian; nothing to
  discover.*

**Critique → winner "Library V4":** **Editorial tiles as the ground** (A) + **one honest intent
rail on top** (B, a single "For today" rail, not a wall) + **search that collapses the grid into
C's elegant list** on typing. Metadata lives *inside the guide*, never a matrix on browse.
**Honesty guard:** the "For today" rail appears only with a real recommendation basis; otherwise
it's simply absent.

---

## Surface 4 — Exercise Guide

Board: **https://claude.ai/code/artifact/26865de7-e575-420d-b850-7886cf32bac8**
Replaces today's grid of tiny `STEP 1/2/3` cards + labeled visual box + metadata matrix.

- **A "Cinematic Sequence"** — full-bleed swipeable/auto-loop Start→Movement→Peak→Finish, one
  cue per frame. *Photo teaches, shared-element from the tile. +most premium instructional
  photography. −short cues may under-explain for a first-timer.*
- **B "Scrolling Teacher"** — a vertical editorial lesson: hero, then each phase shot + cue as
  you scroll. *Progressive scroll disclosure. +teaches thoroughly. −long for a returning skim.*
- **C "Loop + Tabs"** — looping 4-frame + How-to / Muscles / Swaps tabs. *Compact 3-tier.
  +tidiest. −tabs hide the how-to behind a tap.*

**Critique → winner "Guide V4":** **cinematic loop as hero** (A) with **the lesson scrolling
openly beneath** (B: Setup/Execution prose → inline metadata → alternatives). **Rejected:** C's
tabs — hiding "How to perform" fails the first-timer; the three tiers become *vertical depth*
(sequence → prose → metadata), not hidden tabs. Honesty: "your last set / notes" only when real.

---

**Next surfaces:** Workout Completion, Coach, Progress, Recovery, Nutrition, then Navigation,
Premium, Onboarding, Auth, Settings.
