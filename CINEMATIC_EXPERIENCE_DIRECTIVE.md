# PulsePeak — Cinematic Product Experience Directive

**Status: GOVERNING (owner, 2026-07-10). Sits on top of Creative Direction V2
(`VISUAL_IMPLEMENTATION_DIRECTIVE.md`) and the Canadian benchmark
(`APPROVED_VISUAL_TARGET.md`, `CANADIAN_DESIGN_LANGUAGE.md`).**

CD V2 defined the *structure*. This directive defines the *level of
craftsmanship*. The app is technically good but still feels **assembled, not
crafted**. That changes now.

## The standard
Opening PulsePeak should feel like opening a $5,000 piece of equipment —
engineered, intentional, alive, beautiful. Nothing should resemble enterprise
software, CRUD, forms, or a database. **Every screen must contain at least one
moment that makes the user stop for a second and appreciate the craftsmanship.**
Stop improving only when opening PulsePeak feels emotionally different from
every other fitness app.

## Principles
- **Discovery** — every screen rewards curiosity: subtle movement, depth,
  layering, context, meaning. Premium software is discovered, not merely viewed.
- **Stop thinking in cards** — a card is a container for an experience, not a
  rectangle. Some cards dissolve, merge, become cinematic sections, floating
  panels, glass, photography, or interactive canvases. Never default to another
  rectangle.
- **Photography is the emotional center** — large, professional, consistent,
  commercial-grade (Nike / Apple Fitness / WHOOP / Arc'teryx / Rogue). Never
  stock, never AI placeholder, never random crops. *(Media-gated — see below.)*
- **Animated coaching / motion** — nothing suddenly appears; everything emerges.
  Cards breathe, stats count up, buttons respond, sections reveal, images
  parallax, progress fills, achievements celebrate. Alive, **not** busy. Users
  should never consciously *notice* the animation — they should just feel "this
  app feels expensive."
- **Surface design** — nothing flat. Depth, material, atmosphere, light, shadow,
  reflection, texture, subtle gradients, edge lighting, premium glass. Never CSS
  boxes.
- **Buttons feel physical** — weight, depth, subtle lighting, responsive hover,
  soft press, natural elevation.
- **Body models** — premium interactive anatomy that illuminates/animates on
  selection & hover; an educational experience, not a medical diagram.
  *(Media-gated.)*
- **Exercise media** — every exercise is an experience: hero image, animated
  muscle highlight, movement path, step progression, tempo & ROM cues, coaching
  overlays. *(Media-gated.)*
- **Scenery** — backgrounds connect to the athlete's environment (sunrise,
  morning gym, rain, snow, track, forest, training centre). Subtle, emotional,
  never decorative. *(Partly media-gated.)*
- **Intelligence** — small observations, personal insights, remembered history:
  "this app knows me." (Honesty rules still bind — never fabricate data.)

## The five-question test (apply to every screen)
Would Apple present this? Would Nike ship this? Would WHOOP charge for this?
Would Arc'teryx put this on a billboard? Would someone screenshot this because
it looks beautiful? If not — keep refining.

## Reconciliation with CD V2 restraint
CD V2 said "remove visual noise relentlessly; hierarchy from type, not borders;
navigation recedes." This directive is **not** a licence for decoration or
clutter. Depth, glass, motion, and light are applied with the SAME restraint:
tasteful, quiet, purposeful. "Alive, not busy." Craft ≠ ornament.

## Non-negotiables that still bind
- **Honesty** — no fake data/photos, honest empty states (silence > misinfo).
- **Accessibility** — every motion respects `prefers-reduced-motion`; contrast
  AA in every theme; focus states preserved.
- **Performance** — motion is GPU-friendly (transform/opacity), no layout
  thrash, no jank; keep first-load budget.
- **Both themes** — every screen must meet this in Daylight AND the dark themes.

## Execution split (as of 2026-07-10)
- **ACTIONABLE NOW (no new media):** motion system (scroll-reveal, breathing,
  count-ups, progress fills, celebratory moments), surface/material depth (glass,
  edge lighting, gradients, shadow, texture), physical buttons, cinematic
  composition & layering using existing imagery, transitions, micro-interactions,
  "intelligence" copy from real data.
- **MEDIA-GATED (owner holding the image-generation decision):** commercial hero
  photography, interactive body-model anatomy, per-exercise media experiences,
  environmental scenery. Queued in `MEDIA_AUDIT_REGISTER.md`; resume once the
  owner greenlights generation.

Build each increment additively, verify in BOTH themes + `qa:launch`, commit per
increment. Never regress restraint, honesty, a11y, or performance.
