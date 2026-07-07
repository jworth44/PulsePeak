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
| 1 | **Today / Dashboard** | V2 One-Verb · V3 Coach's-Brief · V4 Readiness-Glance | **Concepts + critique done → synthesis = "V5"** |
| 2 | Workout Session (live) | — | queued |
| 3 | Workout Completion | — | queued |
| 4 | Exercise Library | — | queued |
| 5 | Exercise Guide | — | queued |
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
Next surfaces: Workout Session, Exercise Library, Exercise Guide (the media-heavy trio),
then Coach/Progress/Recovery/Nutrition, then Navigation/Premium/Onboarding/Auth/Settings.
