# PulsePeak Media Generation Plan

## Approved Model System

PulsePeak will use a controlled exercise media system built around two locked visual identities:

- one consistent male exercise model
- one consistent female exercise model
- one consistent PulsePeak gym or studio environment
- one consistent camera language
- one consistent lighting setup
- one consistent outfit system

The long-term goal is exact exercise-specific media, not broad or approximate coverage.

## Core Rule

Truth beats coverage. A text guide is better than a wrong image.

If exact media is unavailable, the live product must stay in text-first guide mode.

## Folder Standard

All future controlled model assets must be stored by unique `exerciseDetailId`, not by loose movement-family id.

```text
public/media/exercises/<exerciseDetailId>/
  male/
    thumbnail.png
    step-1.png
    step-2.png
    step-3.png
    step-4.png
  female/
    thumbnail.png
    step-1.png
    step-2.png
    step-3.png
    step-4.png
```

## Exercise Detail Id Rule

- Always key future model media to `exerciseDetailId`
- Never key new media only to family ids like `squat`, `press`, or `row`
- Variant exercises must keep their own media identity

Examples:

- `goblet-squat--goblet-squat`
- `incline-dumbbell-press--incline-dumbbell-press`
- `hammer-curl--hammer-curl`

## Step Standard

Every exact model media set should include:

- `thumbnail.png`
- `step-1.png` for `Start`
- `step-2.png` for `Mid`
- `step-3.png` for `Peak`
- `step-4.png` for `Finish`

These frames must show the exact named exercise and the exact intended phase.

## Quality Rules

Generated assets must preserve:

- the locked male or female PulsePeak model identity
- the same environment and equipment styling
- the same camera angle family
- the same lighting style
- anatomically believable form
- exercise-specific posture and setup
- clear phase separation across Start, Mid, Peak, and Finish

Reject any set where:

- the wrong exercise is shown
- the movement phase is unclear
- anatomy is broken or distorted
- the model identity drifts
- framing hides the teaching value of the movement
- equipment or setup does not match the named exercise

## Review Requirement

No generated asset should be wired live until it has been reviewed and approved.

Approved media must be:

- exact to the named exercise
- complete across the expected files
- consistent with PulsePeak visual standards

## Media Wiring Rules

- No random stock photos
- No mismatched movement-family borrowing
- No approximate variant substitution
- No fake visual coverage
- No empty image placeholders

If a controlled male or female model set is declared, it must be complete and present on disk before the app presents it as available.

## Live Product Safety

If selected model media is unavailable:

1. fall back to existing exact reviewed media if truthful
2. otherwise stay in text-first guide mode

The live UI must never:

- show the wrong exercise image
- show a broken model-specific image slot
- imply model-specific coverage when it does not exist
