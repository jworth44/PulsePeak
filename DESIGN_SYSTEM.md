# PulsePeak — Design System (Creative Direction V2)

The buildable design language behind PulsePeak, grounded in
[`CREATIVE_DIRECTION_V2.md`](CREATIVE_DIRECTION_V2.md) and the verified principles in
[`DESIGN_PRINCIPLES_STUDY.md`](DESIGN_PRINCIPLES_STUDY.md). This document describes what
is **actually in code** (single source of truth) — it is not a proposal.

**Where it lives:**
- Structural tokens (spacing, radii, motion, elevation, type tracking) — `src/styles.css` `:root`.
- **Palette / themes** — `src/styles-themes.css`, imported **last** so it owns every color.
  Two first-class themes: **Midnight** (`:root`) and **Daylight** (`:root[data-theme="daylight"]`).
- Theme selection + system-preference sync — `src/config/themes.js` (`FALLBACK_THEME`,
  `applyThemePreference`, `initThemeSync`) + no-flash bootstrap `public/theme-bootstrap.js`.
- Component layer — `src/styles-polish.css` (cascade-last refinements).

**Three decisions that define the language (CD V2):**
1. **One warm accent — Ember (Midnight) / Pine (Daylight)** — the retired v2 "Peak" palette
   (cool blue-black + Pulse Red + Volt lime) is gone. Color is an *event* that *means*
   something; ~90% of every screen is ink-on-warm-canvas. Red never doubles as success.
2. **Two equal, first-class themes**, not a light/dark afterthought. Cohesion comes from
   type + composition + honesty, **not** a shared hue. Either can be the default via one
   constant (`FALLBACK_THEME`); "Match system" resolves to Daylight/Midnight by OS preference.
3. **Editorial coach, not a control panel** — Sections (heading + space), not bordered card
   stacks; one focal point per screen; restraint justified by hierarchy (not a performance claim).

---

## 1. Color

Every color is a theme token; nothing is hardcoded in components. The two palettes are
**deliberately non-overlapping** — Midnight is warm graphite + Ember, Daylight is warm
paper + Pine.

### Background layers (warm — never cool blue-black, never pure white)
| Token | Midnight | Daylight | Use |
|---|---|---|---|
| `--app-background` | `#17130f` | `#ede6d8` | app base |
| `--app-background-strong` | `#211b15` | `#f4efe4` | raised base |
| `--bg-sunken` | `#110d0a` | `#e4dccd` | wells behind cards |
| `--surface` / `--card-background` | `rgba(34,28,22,.92)` | `rgba(248,243,234,.96)` | cards, sheets |
| `--bg-elevated` | `#241d16` | `#f8f3ea` | raised cards, menus |
| `--bg-overlay` | `#2b241c` | `#fbf7ef` | sheets, tooltips |
| `--bg-inset` | `#140f0b` | `#e8e1d3` | inputs, chart wells |

### Text (warm off-white on Midnight; warm espresso on Daylight)
`--text-primary` `#f2ece1` / `#2b2116` · `--text-secondary` `#bcb2a4` / `#6d6252` ·
`--text-muted` `#8b8175` / `#9c9280` (≥14px only) · `--text-inverse` = the canvas color
(for text on the accent). All pairings pass WCAG AA on their own theme's ground.

### The one accent — Ember (Midnight) / Pine (Daylight)
Four-stop ramp so components never hand-mix: `--accent-400` (hover/bright) ·
`--accent-500` = **`--accent`** (base) · `--accent-600` (active) · `--accent-700` (deep anchor).
- Midnight Ember: `#f0704e` / **`#d9573a`** / `#bf4225` / `#8f2f18`.
- Daylight Pine: `#2c8a76` / **`#1f6b5c`** / `#17564a` / `#124036`.
- `--accent-soft` (α tint), `--accent-ring` (glow), `--accent-contrast` (text on accent).

> **Volt is retired.** The old lime achievement color is gone; `--volt*` tokens now resolve
> to a **brighter shade of the same accent hue**, so "achievement" glows Ember/Pine, not a
> second brand color. Kept only as aliases for older components until they're restyled.

### Semantic scale (hue = state, kept separate from the accent)
`--success` · `--warning` · `--danger` · `--info` (+ `*-soft` α tints), deepened on Daylight
for contrast on paper. A danger toast is never mistaken for a CTA.

### Readiness / data-viz (glance-tier color)
`--data-high` (go) · `--data-mid` (caution) · `--data-low` (rest) · `--data-strain` /
`--data-cardio` (accent-hued) · `--data-track` (ring/bar track, ink at low α).

### Borders — ink applied at low alpha (adapts to any surface, both themes)
`--border-subtle` (.06/.08) · `--border-default` (.10/.12) · `--border-strong` (.16/.20) ·
`--border-accent` · `--hairline-top` (top-edge highlight — ink-α on Midnight, white-α on Daylight).

### Composed backgrounds & gradients
`--hero-gradient` (accent radials over the warm canvas), `--card-glow`, `--callout-glow`,
`--focus-glow`, `--success-glow`; `--grad-pulse` (CTA), `--grad-surface` (near-invisible top
sheen). All defined per-theme in `styles-themes.css`.

---

## 2. Typography

**Pairing (kept — a genuine strength):**
- **Display / headings: `Space Grotesk`** — geometric, sporty, technical.
- **Body / UI: `Instrument Sans`** — clean neutral reading face.
- **Metrics:** Space Grotesk + `font-variant-numeric: tabular-nums` everywhere numbers live,
  so stats/timers/count-ups never jitter.

### Size-specific tracking (CD V2 §type — now a named token system)
Tracking is **size-specific**: tighten large text/numerals, loosen small caps. Defined once
in `styles.css` `:root` so screens stop hand-tuning `letter-spacing`:

| Token | Value | Applies to |
|---|---|---|
| `--track-display` | `-0.02em` | hero display headings, big numerals |
| `--track-heading` | `-0.01em` | h2 / h3 section headings |
| `--track-body` | `0` | body + UI (Instrument Sans reads best at 0) |
| `--track-numeral` | `-0.01em` | tabular metrics (density) |
| `--track-caps` | `0.08em` | small uppercase labels |
| `--track-caps-loose` | `0.14em` | the smallest overlines/eyebrows |

Already wired: hero display headings (`--track-display`) and the shared tabular-numeral block
(`--track-numeral`). Each capability adopts the tokens in its scope as it's rebuilt (no
big-bang refactor). **Overlines become rare** (CD V2): prefer a sentence-case heading + space
over a reflexive uppercase eyebrow.

Type scale (rem @16px): display `~2.7rem` (clamped) · h1 `2.25` · h2 `1.75` · h3 `1.375` ·
h4 `1.125` · body-lg `1.0625` · body `.9375` · small `.8125` · caption `.75` · overline `.6875`.
Body weight `400` minimum (thin weights bloom/vanish on the warm-graphite ground).

---

## 3. Spacing / radii / elevation / motion

- **Spacing (4pt base):** `--space-1…16` = 4/8/12/16/20/24/32/40/48/64px.
- **Radii:** xs 6 · sm 10 (buttons/inputs) · **md 14 (cards)** · lg 20 (hero/sheets) ·
  xl 28 (modals) · full 9999.
- **Elevation (warm hairline highlight + lighter surface + soft shadow — theme-specific):**
  `--elev-1` resting → `--elev-4` modal; `--glow-red`/`--glow-volt` (accent glow) reserved
  for *live/active/PR* elements only. On Daylight the top highlight is white-α + soft warm
  shadow; on Midnight it's ink-α + deep warm shadow.
- **Motion:** durations `--dur-instant 80` / `--dur-fast 160` / `--dur-base 240` /
  `--dur-slow 360` / `--dur-count 900` / `--dur-ring 1200` ms. Easing `--ease-out`
  (workhorse), `--ease-spring` (celebration only), `--ease-standard`, `--ease-in-out`.
  **CD V2 motion philosophy:** springs handed off from gesture velocity, **bounce 0**
  default, ≤~0.15 bounce reserved for celebration, never > 0.4; durations are guidance, not
  a hard cap. Everything transform/opacity, 60fps.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` in `styles-polish.css` kills
  all transitions/animations and hover transforms; JS motion (`useCountUp`, `haptics`,
  `CelebrationOverlay`) checks the same query and snaps to the final state. Haptics are also
  gated on the query and on a prior user gesture.

---

## 4. Components (keyed to real class names)

- **Section (default container):** heading + space, **no box**. The developer-built "card
  stack" is retired; a bordered card is reserved for a tappable full-bleed media tile.
- **Cards** (`.panel`, `.module-card`, `.metric-card`): surface + `--grad-surface` sheen +
  `--border-subtle` + `--elev-1`; hover → `--elev-2`; active/selected → `--border-accent`
  + `--glow-red`. Being progressively dissolved into Sections per capability.
- **Buttons:** primary = `--grad-pulse` + glow, brightens on hover; secondary/ghost = ink-α
  fills; `:focus-visible` ring on every interactive element.
- **Data-viz:** rings 12–16px stroke, round caps, `--data-track` behind, accent fill, glow +
  spring pulse at 100%. **Three-tier disclosure (CD V2):** glance (ring/bar + color + one
  number) → focused (one metric + context) → interactive (drill-in trend).
- **Sheets, not modals:** overlays slide up as sheets with one pinned primary action.
- **Empty / honest states:** line-art feel in `--text-muted` + one accent element; **never**
  assert a state (deficit, lapse, trend) from absence of data — see the Product Excellence
  Standard honesty clause.

---

## 5. Navigation (target — built in C2 Product Shell)

CD V2 removes the desktop sidebar. Both viewports get **one centered content column** + a
bottom tab bar (mobile) / centered top pill (desktop): **Today · Train · Progress · You**
(4 doors). Until C2 lands, the legacy sidebar (desktop) + v2 bottom tab bar (mobile) remain.

---

## 6. Themes — how they resolve

`FALLBACK_THEME` (currently `"midnight"`) is the default for a brand-new user; Midnight and
Daylight are **equal** — the default is a one-constant owner choice after real-world eval,
and both are held to full parity. Preference (`system` | `daylight` | `midnight`) persists in
`localStorage["pulsepeak-theme"]`; `system` resolves via `prefers-color-scheme` and re-resolves
live on OS change. `applyThemePreference` sets `<html data-theme>` and syncs `<meta
name="theme-color">`. `public/theme-bootstrap.js` applies the stored theme **before paint**
(CSP-safe) so there is no flash.

**Daylight parity is risk R1** (see `PRODUCTION_ROADMAP.md`): the app is dark-assumed in
places, so Daylight is hardened per-capability and only promoted to default once it passes
every capability (C12 gate).

---

*Reflects the CD V2 foundation shipped in C1 (`64db540` tokens/themes, `2f28038` legacy
retire, this commit = tracking system + doc refresh). Structural tokens in `styles.css`;
palette in `styles-themes.css`; both themes leak/contrast-scan clean; build 0, qa green.*
