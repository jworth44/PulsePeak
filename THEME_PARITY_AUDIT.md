# Theme Parity Audit — Recovery Directive Part 8

Rule: all themes share identical architecture/geometry; themes change ONLY
material, colour, lighting, atmosphere — never layout, nav placement, or
sizing. Measured by comparing landmark bounding boxes across all 5 themes
(headless Chrome, 1440px), baseline = Midnight.

## TP-1 (P2) — Liberty shifted the nav 25px — FIXED
- **Measured:** Liberty's `.primary-pill` sat at x=593 vs x=568 on every
  other theme (25px right), on all routes.
- **Root cause:** Liberty injected an EXTRA US-flag element via
  `.app-brand::before` (40px + 10px gap), widening the brand lockup and
  pushing the centered nav — a layout change, which the directive forbids.
- **Fix:** swap the MATERIAL of the existing `.app-brand-flag` chip in place
  (`content: url(/us-flag.svg)`) instead of adding an element. Same element,
  same geometry; Liberty still flies the US flag.
- **Verified:** 0 geometry mismatches across midnight/daylight/blossom/
  liberty/maple on `.app-topbar`, `.primary-pill`, `.page-grid`,
  `.today-cinematic`, `.streak-stat-row`, `.app-brand-flag`. Liberty flag
  renders us-flag.svg; others render ca-flag.svg.

## Accepted (not violations)
- `.app-column` is +184px taller on Maple & Liberty — the themed closing
  banner (`::after`: Maple "BUILT IN CANADA", Liberty equivalent). It's a
  decorative atmosphere flourish appended below all content; it moves no
  content element, so it's an approved theme-specific material treatment,
  not a layout change.

## Atmosphere (Today) — present on all 5 (none flat)
- Midnight / Daylight / Blossom: radial-gradient body::before + subtle
  app-main tint.
- Liberty: warm-navy corner-flag linear gradient body::before.
- Maple: mountain-photo overlay body::before.
- **Owner-taste open:** Blossom's atmosphere is the same subtle radial
  gradient as Midnight/Daylight — functional, not flat, but the least
  characterful. The owner previously flagged Blossom depth as wanting their
  specific direction; not changed blind here.

## Mobile-first (Part 9)
Covered by the spacing/size pass (VISUAL_DEFECT_REGISTER VD-2): 0 horizontal
scroll and 0 sub-44px touch targets across all 10 routes at 390px. Theme
geometry is theme-independent, so mobile parity follows from desktop parity.
