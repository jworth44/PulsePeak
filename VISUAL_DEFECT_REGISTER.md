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

## VD-3 (P2) — Mobile subnav clipped hard at the right edge — FIXED
**Found by:** directive Part 10 visual review — actually looking at mobile
Train (390px). The section subnav (Workouts/Plan/Workout Library/Exercise
Library/...) scrolls horizontally but the overflowing tab was hard-cut
("Exerci…"), reading as broken rather than scrollable.
**Fix:** right-edge fade mask + right scroll-padding on `.section-subnav` at
≤780px, so the last tab fades out (premium "there's more" affordance) instead
of clipping.
**Verified:** headless 390px screenshot — "Exerc" now fades softly at the
edge; nav still scrollable; build 0.

## VD-4 (P2) — Modal close was a bare text glyph — FIXED
**Found by:** Part 10 review of the session modal — the close control rendered
a literal letter "X" (WorkoutDetailModal) / "×" glyph (WeekInReview). A
font-character close is a classic "cheap" tell on an otherwise premium modal,
and the session modal is the highest-frequency surface in the app.
**Fix:** replaced both with a proper 2-stroke SVG close icon (currentColor,
round caps). Swept the codebase — no other bare-glyph closes remain.
**Verified:** session close button now contains an SVG, zero text; build 0.

## VD-5 (P3) — Coach zero-data column imbalance — FIXED
On /coach with no history, the two-column layout leaves the left "Do these
next" column with one small action card above a large dead void while the
right column runs ~200px taller. Queued: collapse to a single column (or
balance) when the actions column has a single item in the zero-data state.

**VD-5 fix:** Coach `.content-grid` gets `content-grid-single` when
`coachNextActions.length < 2` → stacks to one column, so the single action
card no longer sits beside a much taller right column. Verified: flex-direction
column, panels stacked, no side void; build 0.

## VD-6 (P1) — Exercise Library search: noise + no relevance ranking — FIXED
Found by Part 10 review of /exercise-library.
- **Empty-field noise:** the "Open top match: <X>" button showed on an empty
  search (top match = first library entry, e.g. "90/90 hip flow"), offering
  to open a random exercise the user never searched for. Fixed: the search-
  actions row only renders once `search.trim()` or a filter is active, and
  the top-match button only when there is a query.
- **No relevance ranking (real UX defect):** results kept the library's
  alphabetical order, so searching "squat" returned top match "90/90 hip
  flow" (a squat-adjacent mobility drill matched via a secondary field) above
  "Back squat". Added a relevance score — exact/prefix/word-boundary name hits
  rank above title, category, muscle, then tangential-field hits; stable ties.
- **Verified:** squat→"Back squat", curl→"Band curl"/"Biceps curl",
  press→"Arnold press" now lead. qa:launch 19/19; build 0.

## VD-7 (P2) — Mobility hero eyebrow contradicted its title — FIXED
The movement-support hub hero read eyebrow "MOBILITY · RECOMMENDED RIGHT NOW"
over the title "STRENGTH" (the engine's recommended path for a healthy user) —
an incoherent MOBILITY/STRENGTH pairing on the first thing you see. The page
is genuinely a paths hub, so the eyebrow now reads "Recommended for you right
now", coherent with whatever path the engine recommends. Build 0.

## VD-8 (P2) — Onboarding height input had an impossible imperial range — FIXED
Found by driving onboarding as a first-time user. The height field's `min` was
hardcoded "120" while `max` was unit-aware (`metric ? 230 : 90`). For imperial
(inches) that meant **min 120in (10ft) > max 90in** — an impossible range, and
every realistic height (e.g. 70in) was flagged invalid by the number input.
Fixed: `min` is now unit-aware — 120cm (metric) / 48in (imperial). Verified
live: imperial height renders min=48, max=90. Weight/target inputs already had
unit-aware bounds. Build 0.
