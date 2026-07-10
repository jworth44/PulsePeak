# Premium Fitness App Research — Findings & Uplift Plan (2026-07-10)

Owner directive: study the top 12 fitness apps (layouts, icons, aesthetics, UI,
photography, heroes, banners, vibe, colors, options) — what makes them feel
premium and worth paying for — THEN plan, THEN change. Full authority granted
post-plan.

Apps studied (screenshots in `temp/review/_fit-*.png`, captured live 2026-07-10):
WHOOP · Apple Fitness+ · Nike Training Club · Peloton · Strava · Oura · Fitbod ·
Ladder · Centr · Future · Hevy · Alo Moves.

## What actually makes them feel premium

1. **One canvas + ONE electric accent.** Ladder = black + volt. Fitbod = ink +
   hot pink. Peloton = black + red. The accent appears in exactly two places:
   the single primary CTA and tiny eyebrows/data marks. It never decorates.
   *Us: crimson is scattered across dozens of small icons/labels (noise), while
   the primary CTA doesn't dominate.*
2. **Type IS the design.** Massive condensed display headlines (64–120px) sit
   beside 12–14px meta. The size CONTRAST creates the drama; borders/boxes are
   nearly absent. *Us: hero is good; everything below is timid 18–20px headings
   at similar sizes — flat rhythm.*
3. **Photography-first cards.** Nike/Ladder/Centr: a workout card IS a
   photograph with a gradient scrim and text on top. No photo → they use pure
   type, never a grey box. *Us: Train page is a wall of grey text boxes.*
4. **Numbers are heroes.** Apple (143♥ giant), Ladder (165 lbs 1RM), WHOOP
   (recovery %): key metrics are enormous, charts render in the accent color,
   sub-labels coach ("Keep it going"). *Us: small digits in boxes.*
5. **Air is the luxury.** 32–48px+ between in-app sections; content blocks
   don't touch. *Us: 20px gaps — crammed (owner's #1 complaint; our 30px rule
   was also being beaten by a higher-specificity 20px rule).*
6. **The app speaks to YOU.** Peloton: "Ready for a Lower Body workout today,
   Jonathan?" Hevy: inline coach note "Feeling strong today! Next session
   increase the weights." *Us: good bones (greeting, honest insights) — amplify.*
7. **Physical depth.** Device shadows, floating panels, glow behind key
   objects, chunky 56–64px CTA pills. Icons are filled/duotone and confident —
   or absent entirely. Thin-stroke 20px icons read cheap. *Us: 1.8px stroke
   icons at 20px (owner: "need more prominent icons").*
8. **Anatomy as a browse surface.** Fitbod/Hevy use rendered muscle figures as
   navigation. *Us: we HAVE 8 premium anatomy tiles — but they're buried on
   /workout-library while the Train door lands on /workouts text walls.*

## The plan (execution order)

**P1 — Breathing room (owner complaint #1).** Kill the 20px-gap specificity
bug; establish rhythm: 32px between cards, 48px before section headings,
generous card padding. Both themes.

**P2 — Train page visual browse + scroll fix (complaints #4 + earlier "5 pages
of scroll").** The /workouts page inline-renders the entire exercise library
(~25,000px). Replace the text-only category grid with the anatomy muscle tiles
+ photo type tiles we already own; the deep exercise pool moves behind a link
to /exercise-library (its real home). Target: Train ≤ ~3 viewports.

**P3 — Prominent icons (complaint #2).** Quick actions + stat row + equipment
icons: 28–32px, 2.4px stroke or filled duotone, tinted squircle chips,
evergreen for recovery/mobility (concept), crimson for action.

**P4 — Numbers as heroes.** Stat row digits 40–48px; weekly-goal bar in
accent; coaching sub-labels under each stat (real data only).

**P5 — CTA dominance.** START SESSION becomes the one oversized pill (56px);
secondary buttons demote to quiet text/outline. Accent discipline pass:
strip decorative crimson from non-interactive labels.

**P6 — Realistic maple leaf + banner backdrop (complaint #3).** Vector leaf
reads flat: generate ONE photorealistic/3D-lit leaf asset (browser-Gemini
pipeline) for topbar + banner; banner gets the semi-transparent mountain
photograph backdrop. If generation is unavailable this session, interim:
richly-lit layered gradient leaf, flagged for replacement.

**P7 — Session-row thumbnails (Hevy pattern).** Exercise rows in the session
modal get their existing photos as circular avatars; inline coach note line.

Verification per increment: build 0 · qa:launch 19/19 · headless screenshots
(Maple + Daylight) · commit. Honesty/a11y/perf rules bind throughout.
