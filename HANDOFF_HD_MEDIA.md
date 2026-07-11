# HANDOFF — HD Media Generation (Task #13) — 2026-07-11

Owner greenlit generating the HD muscle figures + workout-type photos and said
**"use Gemini"**. This build is IN PROGRESS. Everything else in the Product
Recovery Directive is done (see memory `project-pulsepeak`); this file is the
only active build.

## GOAL
Replace the low-res muscle figures + type photos (owner: "dull, with a shadow/
watermark backdrop"). Spec = `MEDIA_QUALITY_REGISTER.md` §HD-MUSCLE-TYPE.
- **8 muscle figures** → `public/media/workout-library/muscle-{chest,back,
  shoulders,arms,legs,glutes,core,full-body}.png`, ~825x1024 (4:5).
- **6 type photos** → `public/media/workout-library/type-{strength,hypertrophy,
  strength-endurance,power,conditioning,recovery}.png`, 16:10.
- Keys ALREADY wired in `src/config/workoutLibrary.js` `WORKOUT_LIBRARY_MEDIA`
  — approved files at those paths drop straight in. Run `npm run qa:workout-library`
  after. **Replace ALL 8 muscle figures at once** (2 new + 6 old = mismatched grid).

## CURRENT STATE — staged in `temp/gemini-media/`
| Muscle | Status |
|---|---|
| chest | ✅ `FINAL-muscle-chest.png` — HD, de-sparkled, READY to copy to public path |
| shoulders | ✅ `FINAL-muscle-shoulders.png` — de-sparkled, READY |
| legs | ⏳ `muscle-legs-raw.png` (825x1024, quads-crimson, correct) — NEEDS de-sparkle |
| core | ❌ generated in Gemini chat, CORRECT (abs), but clipboard extraction FAILED — re-extract or regen |
| arms | ❌ `muscle-arms-raw.png` = QA FAIL (Gemini highlighted DELTOIDS not biceps/triceps) — REGENERATE with very explicit "biceps + triceps down the upper arm, NOT shoulders" |
| full-body | ⬜ not started (front view, ALL muscles crimson) |
| back | ⬜ not started (POSTERIOR view, lats+traps) |
| glutes | ⬜ not started (POSTERIOR view, glutes) |
| 6 type photos | ⬜ not started |

## THE DECISION POINT (why the handoff)
Browser-Gemini UI extraction is **unreliable** — the clipboard grabs stale
content (once saved a full screenshot of the owner's AI Studio billing page
instead of the figure). 3/5 figures came out; each is a fight.

**BETTER PATH — scriptable Gemini API.** The owner HAS a Gemini API set up at
`aistudio.google.com` with **CA$100 billing credit** and API Keys (seen on
their billing page). Owner said **"don't know how, take browser control"** —
i.e. a new session should **drive their Chrome to AI Studio → API Keys →
create/copy an API key**, then add it to `.env` as `GEMINI_API_KEY`, and script
the whole set with the Gemini image model (`gemini-2.5-flash-image` "Nano
Banana", or Imagen) — reliable, fast, still Gemini.
- Get key: claude-in-chrome extension is connected (deviceId in memory). Open
  `https://aistudio.google.com/apikey`, create/copy a key, write to `.env`.
- Then write a batch node script (pattern: the OpenAI one in git history
  `scripts/_neutral_validate_tmp.mjs` used `images/edits`; adapt for Gemini's
  `generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`
  or Imagen `:predict`). Save b64 → PNG → same paths.
- FALLBACK: `OPENAI_API_KEY` is already in `.env` (gpt-image-1 works, proven on
  squat frames) — only if Gemini API proves hard AND owner re-approves non-Gemini.

## IF CONTINUING VIA BROWSER-GEMINI UI (the slow way)
- Tab: `https://gemini.google.com/app/912012637922e87b` ("Anatomical Fitness
  Illustration Prompt"). **Stay in this one chat** → figure stays consistent
  across highlights. Shared account (Orientra chats present) — don't touch them.
- Per image: click input (bottom "Ask Gemini") → type prompt → **click the blue
  SEND ARROW** (Return often just inserts a newline — verify it submitted) →
  wait ~30s → screenshot to CONFIRM the NEW image rendered (don't click blind) →
  click the image to open the lightbox → click the COPY icon in the top toolbar
  (position varies with window width: ~837,32 at 1104w; ~1080,24 at 1280w) →
  PowerShell save with a **~1500ms delay** → **verify dims = 825x1024 portrait**
  (any other size = a bad/stale grab, retry).
- PowerShell save:
  `Add-Type -AssemblyName System.Windows.Forms; $i=[System.Windows.Forms.Clipboard]::GetImage(); $i.Save('...\muscle-X-raw.png',[System.Drawing.Imaging.ImageFormat]::Png)`
- De-sparkle: `temp/gemini-media/_desparkle.ps1 -In raw.png -Out FINAL.png`
  (fills bottom-right corner where Gemini's ✦ sits, sampling clean bg — works on
  the smooth charcoal background).

## MUSCLE PROMPT TEMPLATE (proven — produces the consistent figure)
"Premium 3D-rendered anatomical fitness illustration for a fitness app. One
muscular adult male figure, full body, [FRONT / POSTERIOR back] view, standing
upright and symmetric, arms slightly away from the sides. Highlight in crimson
red #C6283B ONLY the [MUSCLE — be specific]; all other muscles a clean neutral
light grey-beige tone. Perfectly seamless, evenly lit dark charcoal #1A1F22
background — NO shadow shapes, NO patterns, NO vignette, NO watermark, NO text.
Sharp, crisp, high resolution, commercial quality, tall vertical 4:5, centered."
- arms = "the BICEPS and TRICEPS running the full length of BOTH UPPER ARMS
  shoulder-to-elbow — NOT the deltoids/shoulders" (Gemini defaults to deltoids).
- back/glutes need POSTERIOR (rear) view.
- full-body = all major muscle groups highlighted crimson.

## TYPE PHOTO SPEC (6, independent scenes, one production look)
16:10, ≥1536x960, commercial dark-gym photography matching the app's concept
grade (deep charcoal, moody side light, muted slate/evergreen). No text/watermark.
strength / hypertrophy / strength-endurance / power / conditioning / recovery.

## AFTER WIRING
Copy FINAL-* → `public/media/workout-library/muscle-*.png` + type-*.png →
`npm run build` → `npm run qa:workout-library` (must pass 14/14) → headless
screenshot `/workout-library` (probe pattern in git history: register+PATCH
user via in-page fetch, chrome.exe path, Write the .mjs NOT bash heredoc) →
commit. Then remove the display-pop filter stopgap in `styles-polish.css`
(`.library-media-muscle img,.library-media-type img{filter:...}`) since real HD
no longer needs it — or keep if it still helps.

## SERVER
Owner runs `Start PulsePeak.cmd` (repo root) — sets PORT=3007. `/api/fresh`
clears their stale service worker. Session-managed dev server dies between turns.
