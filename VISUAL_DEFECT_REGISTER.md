# Visual Defect Register — Recovery Directive Parts 3-4 (spacing / size)

Measurement-driven (headless Chrome, computed geometry), desktop 1440px +
mobile 390px, all 10 authed routes. Not vibes — every entry is a measured
pixel value.

## VD-1 — Card spacing / collision: NO DEFECTS FOUND (verified, honest)
Scanned every card grid (`.module-card-grid`, muscle/equipment/type grids,
quick-actions, chip toggles, content-grid, mobility guided grid, top-level
entries, injury options, page-grid) for sibling gaps < 10px, on desktop AND
mobile. **Zero touching cards. Zero horizontal scroll on any route, either
width.** The owner's "cards crammed / touching" complaint was the 20px-gap
CSS specificity trap fixed earlier (34px rhythm now holds). Recorded as a
verified pass, not assumed.

## VD-2 (P2) — Mobile touch targets below 44px — FIXED
Measured before: secondary sub-nav pills 32px on EVERY route
(Workouts/Plan/Library/Exercise/Mobility/Nutrition; Progress/Coach;
Account/Preferences/Appearance/Modules); "Week in review" text link 16px;
library back + filter icon buttons 42×44 / 42×42; routine swap `<select>`s
42px tall.
- Fix: `@media (max-width: 780px)` touch floor — sub-nav links + settings
  tabs `min-height:44px`; text-link actions 44px inline-flex; library icon
  buttons `min-height/min-width:44px`; search field + all `<select>` 44px.
  `!important` used deliberately (an accessibility floor should win over
  component styling, and the swap selects carried a more-specific height).
- **Verified after: 0 sub-44px targets across all 10 routes at 390px.**
  Desktop proportions unchanged (rule is mobile-only).

## Method note
Icon buttons are flagged by SHORTEST side; a 42×44 button is a 1848px² tap
area (usable) but was floored to 44×44 for full compliance and consistency.
Desktop min-target guidance (32px) is informational only — pointer targets
don't need the 44px touch floor; no desktop control was resized.
