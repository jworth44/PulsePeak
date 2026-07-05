# PulsePeak — Locked Model Spec ("Aurora" identity)

The two-model visual identity for all human imagery in PulsePeak, per the owner
mandate (2026-07-05). Extends the existing **MODEL-IDENTITY STANDARD (FACTORY
§5b)**: exactly two locked models, one per exercise across its full frame set, the
look is a review gate. This file is the canonical generation spec the Gemini
pipeline (see PRODUCTION_LOG.md) must match.

> **Owner decision required first — refine-forward vs. full re-shoot.**
> The current library (49 exercises, `qa:model-consistency` 49/49) already meets a
> "fit / athletic / tanned / toned / beautiful" bar with two locked references
> (`shared/... reference_male.png`, `reference_female.png`). The new brief below
> (Scandinavian / lightly golden tan / bright smile) is a **refinement of the same
> archetype**, not a different person category. Regenerating all ~530 human frames
> to a new face invalidates the verified library and is a large, Gemini-gated
> program. **Recommended:** adopt this spec as the forward standard, regenerate the
> **highest-visibility** assets first (onboarding, marketing, empty states, splash,
> top ~20 exercises), then sweep the long tail — rather than a single big-bang
> re-shoot. Track in MEDIA_AUDIT.md.

## The two models

### Model M — Male ("Erik")
- Scandinavian / Norwegian-inspired; **short light blond-to-sandy hair**, clean or
  light stubble, strong jaw, **bright natural smile**, blue/light eyes.
- Athletic-lean, visibly fit (defined but not bodybuilder-bulky), **lightly golden
  tan**, healthy glowing skin, realistic proportions.
- Wardrobe: fitted athletic tank or tee + shorts; **thin red trim** accent allowed
  (brand tie-in); no logos, no text.

### Model F — Female ("Astrid")
- Scandinavian / Norwegian-inspired; **light blonde hair in a neat ponytail**,
  **bright natural smile**, light eyes.
- Toned athletic build, **lightly golden tan**, healthy radiant skin, realistic
  proportions (approachable, not extreme).
- Wardrobe: fitted sports bra or tank + leggings/shorts, **tank fully covering the
  torso**; thin red trim accent allowed; no logos, no text.

## Universal look (both models)
Every image must feel **bright, clean, energetic, welcoming, motivating,
professional** — premium commercial fitness photography. Specifically:
- **Lighting:** bright, soft, high-key studio or clean gym daylight; no moody/dark
  underexposure; even skin tones; subtle rim light for depth.
- **Background:** clean, minimal, premium gym or seamless studio; uncluttered;
  never busy or messy.
- **Mood:** confident, approachable, healthy — a smile or calm focus, never strained
  or grimacing.
- **Camera:** sharp, crisp, high-resolution, natural color; realistic anatomy
  (correct hands, joints, limb counts — a hard review gate).

## Hard review gates (reject + regenerate if any fail)
1. **One model per exercise** across all 4 frames — no identity drift (hair color,
   face, build must not change frame-to-frame).
2. **No baked-in text, watermarks, labels, or third-party logos** anywhere in the
   image (this class of defect has escaped before — see MEDIA_AUDIT.md).
3. **Anatomy correct** — hands, fingers, joints, limb counts, proportions.
4. **On-spec look** — Scandinavian archetype, lightly golden tan, bright/clean,
   correct wardrobe (torso covered), realistic.
5. **Consistent framing/scale** across the set (`qa:model-consistency` scale ratio
   ≤ 1.1) and review-sourced.
6. Crop to kill generator artifacts (e.g. the ✦ sparkle) per the pipeline recipe.

## Reusable Gemini prompt scaffold
> "Premium commercial fitness photograph. A [MALE 'Erik' / FEMALE 'Astrid']
> Scandinavian fitness model — [short light blond hair, light stubble, bright
> smile / light blonde hair in a neat ponytail, bright smile] — athletic and toned,
> lightly golden tan, healthy glowing skin, realistic proportions. Wearing a fitted
> [athletic tank and shorts / sports bra and leggings], thin red trim, torso fully
> covered, no logos, no text. Bright, soft, high-key lighting; clean minimal premium
> gym/studio background. [EXERCISE + specific pose/phase]. Crisp, sharp,
> high-resolution, natural color, correct anatomy. No text, no watermarks, no logos."

Vary only the `[EXERCISE + pose/phase]` per frame (Start / Mid / Peak / Finish);
keep every identity, wardrobe, lighting, and quality clause **verbatim** across a
model's whole library so the person stays consistent.

## Wiring
- Female-model exercises set `modelKey:"female"` in `approvedAsset`; glute /
  mobility / lunge / stretch families default female per
  `resolveLockedModelForExercise`.
- After any batch: `npm run qa:model-consistency` (must stay N/N) +
  `npm run qa:launch` (unmatchedExerciseVariants=[]) + full-res VG-001 review of
  every frame before assigning step-N.
