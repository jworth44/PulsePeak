# Click / Action Truth Inventory — Recovery Directive Part 6

Method: live headless-Chrome click-through as a fresh onboarded free user
(Maple), 2026-07-11. Layer 1 inventories every visible interactive element
per route; Layer 2 clicks the high-stakes promises and verifies the OUTCOME
(dialog opened / route landed / state changed / feedback shown) — never just
"navigated somewhere".

## Layer 1 — interactive-element inventory (visible, per route)
| Route | Elements | Unnamed |
|---|---|---|
| / (Today) | 17 | 0 |
| /workouts | 74 | 0 |
| /workout-library | 44 | 0 |
| /exercise-library | 441 | 0 |
| /plan | 41 | 0 |
| /mobility | 52 | 0 |
| /nutrition | 15 | 0 |
| /progress | 16 | 0 |
| /coach | 13 | 0 |
| /preferences | 15 | 0 |

Zero unnamed interactive elements anywhere (a11y + label-truth precondition).
Note for Task #4: /exercise-library's 441 elements is a density signal.

## Layer 2 — promise verification (all PASS after probe corrections)
| ID | Promise | Outcome evidence |
|---|---|---|
| T-1 | Today hero START SESSION opens a real session | dialog "WORKOUT SESSION — Push Day (Hybrid)…" |
| T-QA-* | Quick actions land on their promised surfaces | Start workout→session dialog · Log a session→/workouts · Exercises→/exercise-library · Mobility→/mobility · Weekly check-in→/progress |
| T-2 | View full plan → /plan | landed |
| T-3 | Week in review opens the recap dialog | dialog |
| W-1 | Train hero CTA starts a session | free user w/ locked top pick → honest "START A QUICK SESSION" → /workout/quick-start |
| W-2 | Chest anatomy tile → filtered library | /exercise-library?category=Chest with result count |
| W-3 | Review workout opens the detail | dialog |
| W-4/5 | Save workout saves AND is retrievable | button flips to Remove saved; listed in Saved panel |
| P-1 | Plan hero opens plan content | weekly-plan dialog (premium preview for free tier — honest) |
| N-1 | "Log today's food" reaches the logging surface | scroll 0→1325, #nutrition-log visible |
| M-1 | Mobility quick actions present/wired | 3 actions |
| PR-1 | Weekly check-in usable END TO END | 6 selects filled → POST **201** → "Weekly check-in saved." |
| E-1 | Exercise card opens its movement guide | dialog labelled movement-guide-title |

## Probe corrections (not product defects)
- PR-1 first run searched the fallback panel title; the real panel uses the
  dynamic title ("How did this week go?"). Form was present all along.
- E-1: this page has no separate "Open guide" button — the (named) card is
  the button, and it opens the guide dialog.

## Honest scope
The 19 verifications cover every high-stakes promise the owner named plus
the primary action per route. The long tail (441 library cards, per-filter
permutations, settings toggles) is exercised by qa:launch scenarios and the
persona runs (Task #5); any mismatch found there gets logged here.

## Extended interaction verification (2026-07-11, ongoing loop)
- **Nutrition meal logging (full mode):** valid meal (520cal/42g) → POST 201,
  "Meal logged.", appears in list; out-of-range (9000cal) → POST 400,
  "Calories must be between 0 and 3000.", not listed. Persists + rejects
  honestly. VERIFIED clean.
- **Weekly check-in:** 6 selects → POST 201 "Weekly check-in saved." (earlier).
- **Category/equipment/duration/intensity/joint filters:** correct outcomes or
  honest widen/empty (WR-6).
- **Swaps, Save workout, exercise guides, session start:** all fulfill labels.
- **Module visibility (You → Module Visibility):** Hide Nutrition → Save (PATCH
  200) → removed from Train subnav → Show → Save → restored. Round-trip +
  persistence + nav reflection all correct. VERIFIED clean.
- **Full session flow (premium):** start → 5-exercise populated session → check
  each (Done states) → "Push completed" enables → complete → workout logged
  (POST 201) → celebration overlay renders honest stats ("Strong work · 46
  minutes trained · 5 exercises · Continue"). Zero console errors. VERIFIED
  clean + premium. (Note: Playwright `.check()` on the custom hidden checkbox
  does NOT fire React onChange — must click the visible `.exercise-check-toggle`
  label; a probe artifact, not a defect.)
- **Plan preview modal (premium):** real weekly-plan content in a labeled card
  grid with exercise thumbnails; no undefined/NaN, no console errors. Clean.
