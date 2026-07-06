# PulsePeak — Creative Direction v1.0

**A proposal, not an implementation.** This challenges the design *language*
itself — not spacing, type, or hierarchy inside the current system, but the
system. Written as if Apple, Nike, Headspace, Arc, Linear, and the Peloton
product team formed one studio and started over. Nothing below is protected
because it already exists.

---

## 0. The one-sentence brief

> **PulsePeak should feel like an editorial coach, not a control panel.**

The current app is a *dashboard of cards* — it hands the user a control surface
covered in panels, badges, metadata labels, and competing CTAs. Every premium
consumer product we admire does the opposite: it shows you **one calm, confident
thing at a time**, with the authority of a magazine and the warmth of a good
coach. That is the entire pivot. Everything below serves it.

**What "developer-built" looks like (today):** bordered cards everywhere,
uppercase `OVERLINE` labels on every block, database-record exercise cards
(`PATTERN / EQUIPMENT / PRIMARY MUSCLES / JOINT STRESS`), two competing accent
colors, a persistent desktop sidebar, dense multi-panel screens, mixed-quality
photography. Each is defensible in isolation; together they read as a tool an
engineer assembled, not a product a studio designed.

---

## 1. Design philosophy

Seven principles. Every screen, component, and asset is judged against them.

1. **One breath per screen.** One idea, one hero, one primary action. Generous
   emptiness is a feature, not wasted space. *(Apple, Headspace)*
2. **Editorial, not dashboard.** Typographic hierarchy and whitespace create
   structure — not boxes and borders. A screen is a spread, not a terminal.
   *(Arc, Linear)*
3. **The number is the hero.** Big, quiet, confident metrics; supporting text
   whispers. Data has gravity. *(WHOOP, Oura)*
4. **Photography is the product.** Full-bleed, cinematic, one coherent shoot.
   The image sells the movement; text teaches it. *(Nike, Peloton)*
5. **Earned color.** A near-monochrome canvas so the single accent *means*
   something the instant it appears. *(Linear)*
6. **Motion is physical.** Spring, weight, momentum, and shared-element
   continuity — motion communicates causality and reward, never decorates.
   *(Arc, iOS)*
7. **Warm, not clinical.** Encouraging, human, a little bold. It should feel
   like a coach who believes in you, not a lab readout. *(Headspace, Peloton)*

**The test for every screen:** *Does it make the user feel something in the
first second — and is there exactly one thing to look at?*

---

## 2. Visual identity

We challenge three inherited assumptions.

**(a) Two accents → one.** Today: Pulse Red *and* Volt lime. Red + lime reads
"gamer / energy-drink," and two competing brand hues is a classic dev tell.
**Propose:** one signature accent + a neutral canvas + a separate 3-stop data
scale. One color the brain learns to trust.

**(b) "Always dark near-black" → a warm editorial system with a real light
mode.** Premium fitness increasingly leads *light* (Nike, Apple Fitness, Strava
feed). **Propose two first-class themes**, designed together, defaulting to
**Daylight** (warm paper) with a true **Midnight** (warm near-black, not the
current cool clinical black). Warmth is the differentiator — the current
blue-black reads like a devtool; a warm graphite reads like a premium object.

**(c) Signature accent = "Ember."** A confident warm signal (deep coral →
ember-orange range) — energetic like red but warmer, more premium, less
alarming, and it *photographs* well against gym imagery. It replaces both red
and lime as the single brand accent. (Exact value tuned in the token pass; the
point is: one warm, confident hue.)

**Identity summary**
- **Canvas:** warm paper `Daylight` / warm graphite `Midnight`. Never pure white
  or pure black; never cool blue-black.
- **Ink:** near-black warm gray (Daylight) / warm off-white (Midnight).
- **Accent:** one — **Ember**. Used on the single hero metric or single primary
  action per screen. Nowhere else.
- **Data scale:** green / amber / red readiness, visually distinct from Ember so
  a status is never confused with a brand moment.
- **Texture:** none of the current heavy borders/badges. Structure comes from
  space + a single hairline where a divider is genuinely needed.

---

## 3. Grid system

- **8pt base**, 4pt for micro-adjustments. Spacing scale: 4 / 8 / 12 / 16 / 24 /
  32 / 48 / 64 / 96. Bias toward the *large* end — premium = more air.
- **One column, centered, everywhere.** Mobile and desktop are the *same shape*:
  a single centered column with a comfortable reading measure
  (`min(560px, 100% − gutters)`), because PulsePeak is a personal daily
  companion, not a multi-pane workspace. Desktop is not "more columns" — it is
  the same column with more margin and larger media.
- **Gutters:** 20–24px mobile, generous auto margins desktop.
- **Vertical rhythm:** sections separated by 48–64px of space, not dividers.
- **Full-bleed exception:** media (hero photos, exercise tiles, guide frames)
  breaks the column to the screen edge. Everything else respects the measure.

---

## 4. Navigation redesign

**Challenge: kill the persistent desktop sidebar.** A left sidebar is a
workspace/devtool pattern (Linear, Slack) — wrong for a consumer daily ritual.
Instagram, Apple Fitness, Headspace, and Peloton mobile all use a bottom tab
bar and a *centered column* on larger screens. PulsePeak should too.

- **Primary nav = bottom tab bar on all viewports** (on desktop, a floating,
  centered, pill-shaped tab bar or a slim top bar — but the *same* destinations,
  same shape as mobile).
- **Reduce 5 destinations → 4:** **Today · Train · Progress · You.**
  - *Today* = the daily hero (was Dashboard). *Train* = workouts + exercise
    library unified (browse/start). *Progress* = are you getting stronger.
    *You* = profile, nutrition, recovery, settings, plan, coach folded into one
    calm "your inputs & guidance" space.
  - Nutrition and Coach stop being top-level tabs — they surface *contextually*
    on Today and inside You. Fewer doors = clearer product.
- **Icons:** single-weight line icons, Ember fill only on the active tab, label
  always visible, generous tap targets (56px). No red dots/badges unless truly
  actionable.

---

## 5. Sidebar redesign

The sidebar is **removed**, not restyled. Its former contents:
- Nav → bottom tab bar (§4).
- Account / settings / plan / theme → folded into **You**.
- The old two-level submenu → gone; depth is reached by tapping into a
  destination, not by an ever-present tree.

Desktop reclaims the freed space as **margin** (air), not more panels. If a
persistent affordance is ever needed on desktop, it is a slim, icon-only,
56px top bar with the wordmark + profile — never a content-bearing rail.

---

## 6. Card redesign

**Kill the card as the default unit of layout.** Today almost everything is a
bordered, elevated `.panel`. Boxes-in-boxes is the dashboard aesthetic.

- **Default container = a Section:** a heading + content + surrounding space. No
  border, no background fill, no elevation. Space and type separate it from its
  neighbors.
- **A real "card" is reserved for tappable content objects** (a workout, an
  exercise, a program) and becomes a **full-bleed media tile**: edge-to-edge
  photo, a subtle bottom scrim, title + one line of context overlaid. It looks
  like a streaming-app content tile, not a form panel.
- **Elevation → near zero.** On the warm canvas, structure is space, not
  shadow. Reserve any lift for a genuinely floating element (the tab bar, a
  sheet).
- **Delete:** panel borders, the `--grad-surface` sheen, most badges/pills,
  uppercase overline labels on every block, "quick action" grids.

---

## 7. Modal redesign

- **Centered dialog boxes → bottom sheets** that spring up (iOS sheet physics),
  one column, full-width on mobile, a comfortable centered sheet on desktop.
- **Structure:** big title, generous padding (24–32px), content that scrolls,
  **one primary action pinned to the bottom** (thumb reach). A quiet "Close"
  affordance top-trailing.
- **Motion:** slide-up with spring on open, a subtle scrim fade; drag-to-dismiss
  on mobile. The sheet feels like a physical card you pulled up.
- No modal ever presents a wall of metadata or two competing CTAs.

---

## 8. Exercise card redesign

**Before:** a database record — thumbnail, then `PATTERN: … / EQUIPMENT: … /
PRIMARY MUSCLES: … / DIFFICULTY: … / JOINT STRESS: …`, a `VISUAL GUIDE` badge,
and an `Open exercise guide` button. It reads like a spec sheet.

**After — a cinematic movement tile:**
- Full-bleed **4:5 portrait** photo (the Peak frame), edge to edge.
- Bottom scrim → **exercise name** (display type) + **one** quiet context line:
  `Chest · Intermediate`.
- The whole tile is the tap target → opens the guide. No inline button, no
  badge, no metadata grid.
- Text-only entries get an **intentional illustrated tile** (a branded,
  designed placeholder — a line-art movement glyph on Ember-tinted canvas), so
  the long tail looks *designed*, never *missing*.
- Grid: one column of large tiles on mobile (scroll = browse), a 2-up on wide
  desktop max-width. Big, tactile, photographic.

Metadata (muscles, equipment, joint stress) moves **inside** the guide as quiet
inline prose, not a label matrix.

---

## 9. Exercise guide redesign

**Every guide should feel like premium instructional photography that teaches.**

- **Hero = a full-bleed, swipeable Start → Movement → Peak → Finish sequence.**
  Big frames, one at a time, scrub or swipe through the movement; an optional
  **auto-loop** cycles the four frames so the user *sees* the rep. This replaces
  the current grid of small `STEP 1/2/3` cards.
- **One coaching cue per frame**, overlaid bottom-left in clean type — the cue
  that matters at *that* position (e.g. Peak: "Drive through mid-foot, ribs
  down"). Not a paragraph.
- Beneath the sequence: a short, human "how to perform" (Setup / Execution) in
  editorial prose, then quiet metadata (muscles worked, equipment, joint stress)
  as inline text, then alternatives.
- Each frame communicates: **body position, hand position, foot position, range
  of motion, joint alignment, movement direction** — that is the shot list the
  media standard (§10) must satisfy.

---

## 10. Media production standard

The library must feel like **one professional photoshoot**, not accumulated
assets. Every asset, no exceptions:

- **Two locked models only** (`reference_male`, `reference_female`) — consistent
  identity across a movement's whole set and across the library.
- **One lighting setup** (soft key + gentle rim, neutral), **one color grade**,
  **one background treatment** (a single seamless environment — clean studio or
  one consistent gym), same camera distance and framing per movement phase.
- **Aspect ratio:** **4:5 portrait** hero (fills a phone, matches the tile), with
  a 16:9 crop derived for banners. One aspect across the library.
- **Resolution:** 1536 × 1920 (4:5) minimum, one resolution everywhere.
- **Sequence:** exactly Start / Movement / Peak / Finish, readable as a loop.
- **Absolutely forbidden:** baked-in text or step labels, watermarks, brand
  logos, AI artifacts, wrong anatomy, incorrect form, mismatched model, repeated
  identical phase frames.
- **Review gate:** every asset passes a form-correctness + identity + grade
  review before it ships (extends the existing VG-001 gate + `qa:media`).

*Current state (from `MEDIA_AUDIT_REGISTER.md`): only 16/49 sets meet even the
old 1536×1024 bar; 3 resolutions + 3 aspect ratios coexist; 5 broken sub-
thumbnail sets; 5 baked-text sets; 33 orphaned dirs. The whole library is a
re-shoot to this standard.*

---

## 11. Image quality standard (acceptance checklist)

An asset ships only if ALL are true:
- Correct exercise, correct form, correct phase for its slot.
- Locked model; same model across the set; anatomy plausible; no extra limbs/
  fingers, no melted equipment.
- One lighting + one grade matching the library; exposure consistent frame to
  frame.
- Framing/scale consistent across the four phases (subject same size/position).
- No text, labels, watermarks, logos, or UI baked in.
- ≥ target resolution, correct 4:5 aspect, sharp (no blur/upscale mush).
- Reads clearly at tile size (thumbnail) *and* full-bleed.
- `npm run qa:media` returns 0 HIGH/MED for the set.

"If in doubt, it fails." (Inherits the [[feedback-ai-image-qa-gate]] ethos.)

---

## 12. Thumbnail standard

- The thumbnail **is the Peak frame** of the set (same model, grade, crop) — not
  a separate standalone image. Guarantees the card and guide match.
- 4:5 crop, same resolution family.
- No text/badge overlays baked into the image — overlays (name, context) are
  drawn by the UI, not the asset, so they stay crisp and themeable.

---

## 13. Motion philosophy

- **Physical & spring-based.** `--ease-spring` for entrances and celebration;
  `--ease-out` for everything else. Durations: 120 / 200 / 320 / 480ms.
- **Shared-element continuity.** Tap an exercise tile → its photo expands into
  the guide hero (the image is the through-line). Tap "Today's session" → the
  card image becomes the session header. The user always knows where they came
  from.
- **Numbers count up**, rings sweep and settle with a spring, the daily hero
  metric has a subtle "breathing" idle.
- **Celebration is earned** — a real PR / streak milestone gets a confident
  spring + Ember flare + haptic; nothing routine celebrates.
- **60fps, GPU-friendly (transform/opacity only), fully `prefers-reduced-motion`
  safe.** Motion should feel like the app has weight — never like decoration.

---

## 14. Typography system

- **Display:** a confident, characterful grotesk used **big and tight** — the
  hero voice. (Space Grotesk can stay if pushed larger/tighter; evaluate a more
  editorial display face for extra distinction.)
- **Body/UI:** a clean humanist sans (Instrument Sans is fine), line-height 1.5,
  never below 400 weight on dark.
- **Numerals:** tabular, in the display face, for every metric/timer/count.
- **Scale (mobile), fewer sizes, bigger jumps:** Hero 44–56 / Title 28 / Section
  22 / Body-lg 17 / Body 15 / Caption 13 / Overline 11. Display line-height
  1.0–1.05 with −2% tracking; body 1.5.
- **Rule:** uppercase overline labels are used *sparingly* (they are chrome).
  Prefer a real sentence-case heading + space over a tiny all-caps eyebrow on
  every block.

---

## 15. Color system

- **Two themes, designed together:** `Daylight` (warm paper canvas, ink text)
  default; `Midnight` (warm graphite, off-white text).
- **Layers:** canvas → raised → overlay, each a warm step, ≤ 3 elevations.
- **Accent:** **Ember** only — one hue, used on the single hero metric or single
  primary action per screen. If two things on a screen are Ember, one is wrong.
- **Data/readiness scale:** green / amber / red, hue-separated from Ember.
- **Semantic:** success / warning / danger / info as distinct tints, never the
  brand accent.
- **Contrast:** AA minimum for text; the accent always passes on both themes.
- **Discipline:** ~90% of every screen is ink-on-canvas. Color is an event.

---

## 16. Component system

A small, strict kit (replaces the current sprawl of panels/badges/chips):

| Component | Role |
|---|---|
| **Section** | heading + content + space. The default container. No box. |
| **Metric** | big tabular number + quiet label. The data hero. |
| **MediaTile** | full-bleed 4:5 image + scrim + title/context overlay. Tappable content. |
| **PrimaryAction** | one Ember action per screen; large, thumb-reachable. |
| **Sheet** | full-screen/bottom sheet modal with pinned primary action. |
| **ListRow** | quiet row (icon + label + value), hairline-separated, no card. |
| **Sequence** | the swipeable Start→Peak→Finish media strip (guides). |
| **StatusDot** | the only place the readiness scale appears. |
| **Pill** | rare, for a single filter/label; not decoration. |

**Retired:** `.panel` bordered cards as layout, `--grad-surface` sheen, badge/
overline chrome on every block, quick-action grids, competing secondary CTAs,
the metadata label matrix.

---

## 17. Before → After reasoning (by screen)

| Screen | Before (developer-built) | After (editorial) |
|---|---|---|
| **Today** (dashboard) | ~5 stacked panels: For-You, Today's-session, Streak, Habits, upsell — each a bordered card with an overline. | A single scrolling spread: a warm greeting, ONE hero (the day's move as a full-bleed session tile), a quiet streak line, habits as light rows. One Ember action: *Start*. |
| **Train / Library** | Database-record cards (`PATTERN/EQUIPMENT/MUSCLES/JOINT STRESS`) + a filter panel + placeholder tiles. | Full-bleed 4:5 movement tiles in a browsable column; search is a single field; metadata lives in the guide. Text-only entries get a designed illustrated tile. |
| **Exercise guide** | Grid of small `STEP 1/2/3` cards + a labeled visual-guide box + metadata. | Full-bleed swipeable Start→Peak→Finish sequence with one cue per frame + auto-loop; prose how-to below; metadata as quiet inline text. |
| **Coach** | Panels of chips (Energy/Sleep/Top-habit), "why it matters" boxes. | One editorial statement — the single most important thing to do now — with the reasoning in a sentence. Recovery inputs shown only when logged (already fixed). |
| **Plan** | Dense multi-block premium/free comparison + rationale panels. | One clear "this is your week" spread: the week's shape, one reason, one CTA to start. Premium framing is a single honest line, not a panel. |
| **Progress** | Already close to the ideal (one hero question, real empty states). | **Refine, don't rebuild** — align to the new type/color/motion. |

---

## 18. Rebuild vs refine

**Rebuild (new design language, from scratch):**
- Navigation shell (remove sidebar → tab bar + centered column)
- Today / Dashboard
- Train + Exercise Library + **exercise card**
- **Exercise guide** (swipeable sequence)
- Coach
- Plan
- Modals → Sheets (global)
- Onboarding (adopt the editorial system + the media standard for its imagery)

**Refine (keep structure, restyle to the new system):**
- Progress (already single-hero + honest empty states)
- Nutrition (already gated honest; restyle)
- Settings / You (consolidate the folded destinations)
- Auth (recently reworked; align palette/type)

**Media:** a full re-shoot to §10–12 is its own program (Gemini-gated, owner
cost-gated) — the largest single lever on "premium vs developer-built,"
tracked in `MEDIA_AUDIT_REGISTER.md`.

---

## How to use this proposal

This is the **creative direction**, not a build order. Recommended sequence once
approved: (1) tokens — the two warm themes + Ember + type scale; (2) the
component kit (§16); (3) the navigation shell; (4) Today; (5) Train + exercise
card + guide; (6) sheets/coach/plan; (7) the media program in parallel. Each
step ships behind the existing build + `qa:launch` + `qa:media` gates and the
Product Excellence Standard.

*The objective is no longer incremental improvement. It is a product people
recognize as world-class the moment they open it.*
