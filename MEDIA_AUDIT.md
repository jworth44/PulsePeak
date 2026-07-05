# PulsePeak — Media Audit + Remediation Plan (2026-07-05)

Full audit of visual assets for commercial launch. Companion to MODEL_SPEC.md.

## Inventory

| Location | Images | Size | Purpose |
|---|---|---|---|
| `public/media` | 463 | 411 MB | Exercise frame sets (4-frame Start/Mid/Peak/Finish) |
| `public/movements` | 70 | 102 MB | Movement guide / library visuals |
| `public/nutrition` | 3 | 6 MB | Meal-template imagery |
| `public/brand` | 5 | 0.7 MB | Logo + app icon masters |
| **Total** | **547** | **~520 MB** | |

Registry: `shared/mediaReviewCatalog.js`, `shared/exerciseVisualReferences.js`,
`shared/exerciseCatalog.js`, `shared/nutritionMedia.js`.

Automated gates currently green: `qa:model-consistency` **49/49** (all multi-frame
model exercises present, dimensionally coherent, review-sourced);
`qa:launch` unmatchedExerciseVariants = **[]**; `qa:exercise-library` **passed**,
172 exact visual guides, 0 broken.

## ✅ Visual-guide coverage recovered: 67 → 172 (32% → 83%)
**Non-owner-gated win (2026-07-05):** complete 4-frame image sets existed on disk but
only 67 exercises rendered a visual guide — ~107 variant exercises were unwired
despite their movement family already having an approved image. Extended
`EXACT_VISUAL_MEDIA_KEYS` (the intended media-ledger map) in two curated passes with
**107 variant→base mappings** (e.g. Conventional/Sumo/Trap-bar deadlift → deadlift,
Preacher/EZ-bar curl → biceps-curl, Bodyweight/Jump/Box squat → squat, Decline/Ring
push-up → push-up, Cable chest fly → dumbbell-chest-fly). Visually-misleading
pairings (cardio machines → running, machine leg-curl → deadlift, crawl → row,
composites, carries) were deliberately left as text guides. Also fixed a pre-existing
redesign regression: the placeholder tile's hidden duplicate "Text coaching guide"
`<small>` broke the library audit's selector — removed it. `qa:exercise-library`
passes with **172 guides, 0 broken**. **36 exercises remain text-only and genuinely
need generation** (mostly cardio machines, agility/conditioning drills, carries, and
a few isolations with no representative image) — the Gemini program.

## Audit dimensions (per owner brief)
Every asset is assessed for: consistent quality · lighting · realism ·
duplicates · AI artifacts · anatomy · branding consistency · resolution ·
style match · **on-model-spec (MODEL_SPEC.md)** · baked-in text/logos.

## Known defects (confirmed)
| # | Asset | Defect | Status |
|---|---|---|---|
| 1 | **Arnold Press** exercise media | Baked-in text "3. ARNOLD PRESS / THUMBNAIL" rendered into the image | 🔧 background regen task running (`task_f1bed038`) |
| 2 | **Onboarding welcome hero** photo | Third-party "BD FITNESS" gym logo baked into the stock photo | 🔧 same background task |
| — | (historical) push-up | garbled label-fragment crops + wrong model | ✅ already fixed |

The two live defects are being regenerated via the Gemini pipeline in a separate
session. The regen brief instructs a sweep for similar baked-text/logo defects.

## The strategic decision (owner)
The new **"Aurora" model spec** (MODEL_SPEC.md — Scandinavian, lightly golden tan,
bright smile) refines the same archetype the current library already targets. A
full re-shoot of all ~530 human frames to a new face would invalidate the verified
49-exercise library and is a large, **Gemini-gated** program (semi-manual, one chat
per movement). This cannot be completed autonomously in a short window.

**Recommended remediation order (highest commercial visibility first):**
1. **Fix the 2 confirmed defects** (in progress) — these are visible on first-run.
2. **Onboarding + auth + marketing + splash + empty-state imagery** (~handful of
   assets, seen by every new user / in every store screenshot).
3. **Top ~20 most-surfaced exercises** (dashboard "today", library first page,
   featured workouts) to the Aurora spec.
4. **Long-tail exercise sets** — systematic sweep, batched, each gated by
   `qa:model-consistency` + VG-001 full-res review.
5. **Nutrition imagery** (only 3 assets — quick win to premium food photography).

Each batch follows the locked pipeline in PRODUCTION_LOG.md and the prompt scaffold
in MODEL_SPEC.md. Do **not** ship a partial re-shoot that mixes old and new faces
within a single exercise set (breaks one-model-per-exercise); complete a set before
swapping it live.

## What is autonomously done here
- Full inventory + registry map (above).
- Confirmed-defect log + remediation ownership.
- Locked forward spec (MODEL_SPEC.md) + reusable generation prompts.
- Automated consistency gates verified green.

## What remains (Gemini-gated / owner-time)
- The actual regeneration of assets to the Aurora spec, in the phased order above.
  This is the one launch workstream that is inherently semi-manual and cannot be
  fully automated from here; it runs through the browser Gemini pipeline.
