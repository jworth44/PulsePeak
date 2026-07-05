# PulsePeak — Design System v2.0 ("Peak")

The buildable design language behind the world-class redesign, derived from
`DESIGN_RESEARCH.md`. Implemented in `src/styles.css` (`:root` = default
"PulsePeak Core" theme) and layered/refined in `src/styles-polish.css`.

**Three decisions that make or break it:**
1. **Red brand + Volt-lime "peak" secondary + green/amber/red readiness scale** —
   red never doubles as the success/data color.
2. **Elevation via hairline-top highlight + lighter surface**, not big drop shadows
   (drop shadows are invisible on near-black).
3. **Restraint in chrome** so rings/charts own the color; `tabular-nums` wherever
   numbers live.

---

## 1. Color

### Background layers (never pure black — kills elevation, smears on OLED)
| Token | Hex | Use |
|---|---|---|
| `--app-background` | `#0A0B0D` | app base (deepest) |
| `--bg-sunken` | `#060708` | wells / behind cards |
| `--surface` / `--card-background` | `#121417` | cards, sheets |
| `--bg-elevated` | `#1A1D21` | raised cards, popovers, menus |
| `--bg-overlay` | `#22262B` | modals, tooltips |
| `--bg-inset` | `#0E1013` | inputs, chart wells |

Cool near-black (blue slightly > red) reads clinical/premium/athletic.

### Text (off-white, never pure white on near-black)
`--text-primary #F4F6F8` (~15.8:1) · `--text-secondary #B4BCC6` (~9:1) ·
`--text-muted #7A828D` (~4.6:1, ≥14px only) · `--text-inverse #0A0B0D` (on accent).

### Accent ramp — "Pulse Red"
Base **`--accent #F5283D`** (a warm crimson-scarlet with enough blue to avoid OLED
mud). Hover **brightens** to `#FF4D5F` (energizes on interaction). Pressed `#D6172E`.
Deep anchor `#A8101F`. `--accent-soft rgba(245,40,61,.14)` tint · `--accent-ring
rgba(245,40,61,.40)` glow.

### Secondary accent — "Volt" (peak / PR / goal-complete / progress)
`--volt #A3E635` base · `--volt-bright #C4FF33` (ring peak, PR flash) ·
`--volt-soft rgba(163,230,53,.16)` · `--volt-glow rgba(196,255,51,.45)`.
**Usage split:** Red = brand/CTA/effort. Volt = achievement/completion/positive progress.

### Semantic (distinct from brand red so a danger toast ≠ a CTA)
`--success #34D399` · `--warning #FBBF24` · `--danger #FB5468` · `--info #38BDF8`
(+ matching `*-soft` alpha tints).

### Readiness scale (WHOOP vocabulary — learned once)
`--data-high #34D399` (67–100 / go) · `--data-mid #FBBF24` (34–66 / caution) ·
`--data-low #FB5468` (0–33 / rest). Distinct from brand red — context disambiguates.

### Borders — light applied at low alpha (adapts across all surfaces)
`--border-subtle rgba(255,255,255,.06)` · `--border-default rgba(255,255,255,.10)`
· `--border-strong rgba(255,255,255,.16)` · `--border-accent rgba(245,40,61,.50)` ·
`--hairline-top rgba(255,255,255,.08)` (the top-edge highlight).

### Gradients
`--grad-pulse linear-gradient(135deg,#FF4D5F,#F5283D 45%,#A8101F)` (CTAs) ·
`--grad-volt` (PR banners) · `--grad-surface` (near-invisible top sheen on cards) ·
`--grad-glow-red` (radial behind hero metric) · `--grad-area-red` (chart area-fill).

---

## 2. Typography

**Kept PulsePeak's premium pairing** (both loaded via Google Fonts, both distinctive):
- **Display / headings: `Space Grotesk`** — geometric, sporty, technical.
- **Body / UI: `Instrument Sans`** — clean neutral reading face.
- **Metrics:** Space Grotesk + `font-variant-numeric: tabular-nums` everywhere
  numbers live (stats, timers, count-ups) so layouts never jitter.

Type scale (rem @16px): display `3.25rem` · h1 `2.25rem` · h2 `1.75rem` ·
h3 `1.375rem` · h4 `1.125rem` · body-lg `1.0625rem` · body `.9375rem` ·
small `.8125rem` · caption `.75rem` · overline `.6875rem`.

Rules: **large text gets negative tracking** (−0.02em display/h1), **small/overline
gets positive tracking** (+0.10em uppercase overline). Body weight `400` min on dark
(thin weights bloom/vanish on near-black). Hero metric: weight 700, line-height ~1,
unit rendered ~0.4em and muted.

---

## 3. Spacing / radii / elevation / motion

- **Spacing (4pt base):** `--space-1…16` = 4/8/12/16/20/24/32/40/48/64px. Default
  gutter 16px; card padding 24px (16 compact / 32 hero).
- **Radii:** xs 6 · sm 10 (buttons/inputs) · **md 14 (cards)** · lg 20 (hero/sheets)
  · xl 28 (modals) · full 9999. (Tightened from the old 28/20/14.)
- **Elevation (dark-UI way = hairline highlight + lighter surface + soft shadow):**
  `--elev-1` resting card · `--elev-2` hover · `--elev-3` popover · `--elev-4` modal.
  Accent glows (`--glow-red`, `--glow-volt`) reserved for *live/active/PR* elements only.
- **Motion:** durations instant 80 / fast 160 / base 240 / slow 360 / count 900 /
  ring 1200 ms. Easing `--ease-out cubic-bezier(.16,1,.30,1)` (workhorse),
  `--ease-spring cubic-bezier(.34,1.56,.64,1)` (celebration only). All wrapped in
  `prefers-reduced-motion`.

---

## 4. Components (keyed to real class names)

- **Cards** (`.panel`, `.module-card`, `.metric-card`): surface + `--grad-surface`
  sheen + `--border-subtle` + `--elev-1`; hover → `--elev-2`; active/selected →
  `--border-accent` + `--glow-red`.
- **Buttons:** primary = `--grad-pulse` + glow, brighten on hover, `translateY(-1px)`;
  secondary/ghost = white-alpha fills.
- **Chips / pills / badges:** pill radius, alpha fill, uppercase overline for labels.
- **Data-viz:** rings 12–16px stroke, round caps, `--data-track` behind, gradient
  fill, **volt glow + spring pulse at 100%**. Charts: 2.5px lines, area fade to
  transparent, barely-there grid.
- **Exercise-library cards:** image-forward — thumb → full-width 16:10 banner with
  overlaid badges + scrim; clean branded placeholder tile for text-only entries.
- **Empty states:** line-art feel in `--text-muted` + one accent element; never stock photos.

---

## 5. Navigation

- **Desktop (≥1080px):** existing two-level sidebar rail, refined (glowing active pill).
- **Mobile (<1080px):** **fixed bottom tab bar** — Today · Workouts · Library ·
  Nutrition · Progress — with inline SVG icons (outline default, accent + fill when
  active). Sidebar hidden; `.app-main` gets bottom padding so content clears the bar.
  This closes the pre-redesign mobile gap (sidebar previously stacked above content).

---

*Implemented 2026-07-05. Verified desktop 1440 + mobile 390, build exit 0,
qa:launch 10/10, 0 console errors.*
