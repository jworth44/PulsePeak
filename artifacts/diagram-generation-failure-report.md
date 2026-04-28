## Diagram Generation Failure Report

Date: 2026-04-28

Status: Visual generation is blocked. The current diagram-generation system is not approved for scale.

## Summary

PulsePeak diagram-generation pilots were tested through three different generation approaches and all failed quality control. Review-only pilot outputs remain in staging and must not be approved, wired, or moved into final exercise media.

## Failure Findings

### 1. Composite generation failed sequence control

- Multi-panel composite outputs did not maintain strict phase ordering.
- Panel sequencing drifted between requested setup, start, lowering, bottom, and press positions.
- Vertical dumbbell position differences were not reliable enough for instructional use.
- Some outputs produced repeated or overly similar poses across panels.

### 2. Frame-by-frame generation failed character and camera consistency

- Independently generated frames did not preserve the same anatomical character across the full sequence.
- Head shape, torso proportions, footwear/feet, and overall figure styling drifted from frame to frame.
- Camera distance, framing, and bench geometry shifted between outputs.
- Even after prompt tightening, frame-to-frame consistency remained below production standard.

### 3. Base-transform generation failed form, sequence, and character lock

- The base-image transformation approach improved staging discipline, but did not solve the quality problem.
- Generated transforms still failed strict exercise-form validation.
- Character lock was not reliable enough for production use.
- Sequence clarity remained insufficient, especially for start, lowering, and bottom differentiation.
- The transformed outputs are not safe to scale into a category-wide production pipeline.

## Current Decision

- Diagram generation is **not approved for scale**.
- Visual production must remain blocked.
- No review-stage pilot output may be treated as approved media.
- No pilot output may be moved into `public/media/exercises/`.
- No catalog approval changes should be made based on the current generation system.

## Failed Pilot Outputs

These outputs are marked as review-failed in documentation only and should remain in staging until a separate cleanup decision is made:

- `temp/review/diagram-pilots/incline-dumbbell-press--incline-dumbbell-press/`
- `temp/review/base/incline-base.png`
- Earlier composite and frame-based incline pilot outputs under `temp/review/`

## Blocking Rule

Until a new validated generation method is established, all diagram/visual generation work should remain paused. Content systems may continue, but visual production is blocked.
