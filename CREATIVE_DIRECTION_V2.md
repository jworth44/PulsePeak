# PulsePeak — Creative Direction V2.0

**A proposal, not an implementation.** V2 supersedes the *rationale* of
[V1](CREATIVE_DIRECTION.md) by grounding it in evidence: two adversarially-verified
research passes distilled in [`DESIGN_PRINCIPLES_STUDY.md`](DESIGN_PRINCIPLES_STUDY.md).
V1's core instinct — *"an editorial coach, not a control panel"* — **survived the
research intact.** V2's job is to (1) confirm what the evidence backs, (2) **correct**
where V1 asserted things the research refuted, (3) sharpen the vague parts into
craft-level specifics, and (4) audit PulsePeak screen-by-screen against the verified
principles. No code changes until this is approved.

> **The brief, unchanged and now evidence-backed:** PulsePeak should feel like an
> **editorial coach** — one calm, confident, *meaningful* thing at a time — not a
> dashboard of cards. Oura (one focal point), Linear (restraint/systematized color),
> Gentler Streak (humanized numbers + honest streaks), and Apple (spring motion,
> size-specific type) each independently point at the same target.

---

## Part I — PulsePeak measured against the verified principles

Each row: the principle (with its source), what PulsePeak does **today** (from live
screenshots this session), and the verdict.

| Principle (source) | PulsePeak today | Verdict |
|---|---|---|
| **One focal point / "one big thing"** (Oura 3-0) | Dashboard already leads with a single contextual "For You Today" hero + one Ember action — genuinely good. But it's still followed by ~4 stacked bordered panels competing beneath it. | **Half-right.** Keep the contextual hero; dissolve the panel stack below it into quiet sections. |
| **Color must mean something, on a restrained ground** (Oura + Linear 3-0) | **Two** brand accents (Pulse Red + Volt lime) tint chrome throughout; cool blue-near-black canvas. Red doubles as brand *and* strain. | **Miss.** Collapse to one accent (Ember) + a semantic data scale; near-neutral warm ground; generate tokens in a perceptual space. |
| **Three-tier progressive disclosure** (Oura 3-0) | Charts/metadata are shown flat and full at their level; exercise cards dump a full metadata matrix. | **Miss.** Glance → focused → interactive. Metadata moves *inside* the guide. |
| **Humanize the numbers** (Gentler Streak 3-0) | Recent honesty work is strong; but surfaces still lead with bare labels (`PATTERN / JOINT STRESS`) and dev language ("Source-of-truth exercise cards"). | **Partial.** The honesty engine is right; the *voice/packaging* is still clinical. |
| **Honest streaks (rest never resets)** (Gentler Streak 3-0) | Already built: streak-freeze buffer, guilt-free copy, activation-not-lapse language, "never infer from absence of data" now in the constitution. | **✅ Already world-class.** This is PulsePeak's genuine edge — lean into it louder. |
| **Spring motion, bounce 0, reserved haptics** (Apple 3-0) | Motion exists (count-ups, ring pulse, celebration) and is reduced-motion safe, but not a unified spring model; haptics mostly reserved already. | **Refine.** Adopt one spring system; audit haptics to Causality/Harmony/Utility. |
| **Size-specific tracking, tabular numerals** (Apple 3-0) | Space Grotesk + Instrument Sans + tabular-nums already in place — a real strength. Tracking is not yet size-specific. | **Close.** Keep the pairing; make tracking size-specific (tighten hero numerals, loosen small caps). |
| **8pt/4pt fixed scale** (verified) | A spacing scale exists in tokens. | **✅ Keep.** |
| **Content-driven single column** (12-col dogma contested 2-1) | Desktop still uses a persistent content-bearing **sidebar**; mobile has a bottom tab bar. | **Miss on desktop.** One centered column both viewports; sidebar → removed. |
| **Anticipatory micro-interactions** (Nelson 3-0) | Started: "Start today's session" deep-links the recommended session; workout→recovery handoff. | **On the right path.** Extend the anticipation, don't add chrome. |
| **Aesthetic-minimalist / hierarchy by de-emphasis** (NN/g + Refactoring UI 3-0) | Bordered `.panel` cards, an overline label on nearly every block, badges/pills, boxes-in-boxes. | **Miss.** The single biggest "developer-built" tell. Sections, not cards. |

**One-line diagnosis:** PulsePeak's *logic* is already premium (honest engine, contextual
hero, good type pairing). Its *packaging* is developer-built (two accents, cool canvas,
bordered card stacks, metadata matrices, a desktop sidebar, clinical labels). **V2 is
almost entirely a packaging and restraint problem — not a logic rebuild.** That is good
news and lowers the risk.

---

## Part II — What changes from V1 (the research forced these)

**Corrections (V1 was wrong or overreached):**
1. **Motion durations.** V1 prescribed "Durations: 120 / 200 / 320 / 480ms" and an
   implicit ≤200ms instinct. Research **refuted** a hard ms cap (0-3). **V2 replaces
   fixed durations with a spring model** parameterized by *perceptual duration + bounce*
   (Apple): interactive/gesture motion = spring handed off from gesture velocity, **bounce
   0** default, **≤ ~0.15 bounce** reserved for celebration, **never > 0.4**. Durations
   become guidance (~0.3–0.5s system transitions), not law.
2. **Don't justify minimalism with performance.** V1 leaned on "reduce cognitive load →
   better performance." Research **refuted** the measured-performance causation (1-2).
   **V2 justifies restraint by hierarchy (competition reduction) and premium feel only** —
   honest framing, not a fake efficiency claim.
3. **Streaks are a *constraint*, not a growth lever.** Research **refuted** "variable
   reward is what makes habits stick" (0-3). **V2 states the ethics explicitly:** streaks/
   rewards exist to serve the user's *own* goal (Gentler Streak model) and must forgive
   rest — consistent with PulsePeak's honesty constitution. Never a retention dark pattern.

**Sharpenings (V1 was right but vague):**
4. **Color is now a *system*, not a swatch.** Generate tokens in **LCH / a perceptual
   space** (Linear) so warm-graphite ↔ light theme and elevation steps stay consistent and
   accessible from **~3 inputs (base, accent, contrast)** instead of hand-tuning dozens.
   Define palettes as **HSL scales, not hex** (Refactoring UI). Add an explicit **semantic
   color map** (Oura): hue = *state* (in-range vs out-of-baseline, recovery vs strain),
   kept hue-separated from Ember so a status is never mistaken for a brand moment.
5. **Progressive disclosure is now a named, three-tier rule** (Oura) applied to every data
   surface: **glance** (ring/bar/color) → **focused** (one metric + context) →
   **interactive** (drill-in trend). Charts default to the glance tier.
6. **Typography tracking is size-specific** (Apple), not one global letter-spacing:
   tighten hero display + numerals (~−2%), loosen small overline/caps (~+4–8%). Keep the
   existing Space Grotesk / Instrument Sans / tabular-nums foundation.

**Confirmed (V1 stands, now cited):** one focal point (Oura), one-accent near-monochrome
(Linear), photography-as-product + one shoot (media standard), sheets over centered
dialogs, single centered content column both viewports (content-driven grid beats 12-col
dogma), remove the desktop sidebar, editorial sections over bordered cards, warm over cool
canvas, anticipatory micro-interactions (Nelson).

---

## Part III — The refined spec (deltas over V1 §§2–16)

Everything in V1 §§2–16 stands **except** as amended here. The amendments are the
research-grounded specifics:

**Color (amends V1 §2, §15).** One warm accent **Ember** + near-neutral warm canvas
(`Daylight` default / `Midnight` warm-graphite) + a hue-separated **semantic scale**
(green/amber/red = readiness; a cool tone = informational). Tokens generated in LCH from
`{base, accent, contrast}`; ~90% of every screen is ink-on-canvas; color is an *event* and
it *means* something. Red-and-lime retired.

**Motion (replaces V1 §13).** One spring system. Interactive motion springs from gesture
velocity (bounce 0). Celebration may use ≤0.15 bounce + Ember flare + a single reserved
haptic. Shared-element continuity (tap tile → its photo becomes the guide hero). Haptics
audited to **Causality / Harmony / Utility** — none on routine taps. All transform/opacity,
60fps, `prefers-reduced-motion` safe. No dogmatic ms caps.

**Data surfaces (new, from Oura).** Every metric renders at the **glance** tier by default
(a ring/bar + semantic color + one number); tapping reveals the **focused** tier; a further
tap opens the **interactive** trend. Progress and any chart obey this.

**Type (amends V1 §14).** Keep the pairing + tabular numerals. Make tracking **size-specific**
(tighten large, loosen small). Fewer sizes, bigger jumps (V1 scale stands). Uppercase
overlines become *rare* — a sentence-case heading + space replaces the reflexive eyebrow.

**Structure (confirms V1 §4–6).** Sidebar removed; bottom tab bar / centered pill on desktop;
**Today · Train · Progress · You** (4 doors). Default container = a **Section** (heading +
space, no box). A "card" is reserved for a tappable **full-bleed 4:5 media tile**. Modals →
**sheets** with one pinned primary action.

**Voice (from Gentler Streak).** Interpret every number ("vs your baseline / what to do"),
warm not clinical; kill remaining dev language ("Source-of-truth exercise cards" → a human
heading). The honesty engine is the brand — say it in plain, encouraging language.

**Media (confirms V1 §10–12).** One shoot: two locked models, one lighting + one grade + one
environment, **4:5 portrait**, one resolution, Start/Movement/Peak/Finish readable as a loop;
zero baked text/watermarks/logos. Thumbnail = the Peak frame. This remains the single largest
"premium vs developer-built" lever and is Gemini-/owner-cost-gated.

---

## Part IV — Recommended build sequence (once approved; still not started)

Unchanged from V1's sequencing, each step behind build + `qa:launch` + `qa:media` gates and
the Product Excellence Standard:

1. **Tokens** — LCH-generated warm `Daylight`/`Midnight` + Ember + semantic scale + size-
   specific type scale (the foundation every screen inherits).
2. **Component kit** — Section / Metric / MediaTile / PrimaryAction / Sheet / ListRow /
   Sequence / StatusDot (retire `.panel`-as-layout, overline chrome, badge sprawl).
3. **Navigation shell** — remove sidebar → tab bar + centered column.
4. **Today** — one contextual hero + quiet sections.
5. **Train + exercise card + guide** — full-bleed tiles + swipeable Start→Finish sequence
   with three-tier disclosure.
6. **Sheets / Coach / Plan** — editorial single-statement screens.
7. **Media program** — the re-shoot, in parallel (owner-gated).

**Refine (not rebuild):** Progress (already single-hero + honest empty states), Nutrition,
Settings/You, Auth — restyle to the new tokens.

---

*V1 stays frozen as the reference proposal. V2 is the version to build from — but only
after the design system exists as tokens and a component kit, and only behind the standard's
gates. The objective is a product people recognize as world-class the moment they open it —
and, uniquely for PulsePeak, one that earns trust because it never lies to them.*
