// ======================================================================
// Workout Library media-validation audit (qa:workout-library)
// ======================================================================
// Machine-enforces the Workout Library's media pipeline so the "awaiting
// approved media" framework stays honest and future drop-ins can't ship broken:
//   1. Every required media key is unique and non-empty.
//   2. validateLibraryMedia() is clean — no PUBLISHED path outside the reviewed
//      media root (a malformed drop-in fails the gate loudly).
//   3. Every published WORKOUT_LIBRARY_MEDIA path resolves to a real file under
//      public/ (a typo'd or missing asset fails, instead of 404-ing in prod).
//   4. Reports coverage (approved / total).
// Exit non-zero on any failure.
// ======================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const publicDir = path.join(repoRoot, "public");

const configUrl = pathToFileURL(path.join(repoRoot, "src/config/workoutLibrary.js")).href;
const {
  REQUIRED_LIBRARY_MEDIA,
  WORKOUT_LIBRARY_MEDIA,
  validateLibraryMedia,
  getLibraryMediaCoverage
} = await import(configUrl);

const failures = [];

// 1. Required keys unique + non-empty.
const keys = REQUIRED_LIBRARY_MEDIA.map((a) => a.key);
if (keys.some((k) => !k)) failures.push("A required media asset has an empty key.");
const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
if (dupes.length) failures.push(`Duplicate required media keys: ${[...new Set(dupes)].join(", ")}`);

// 2. No malformed published path.
const malformed = validateLibraryMedia();
malformed.forEach((m) => failures.push(`Published media "${m.key}" is not rooted at /media/workout-library/: ${m.src}`));

// 3. Every published path resolves to a real file under public/.
for (const [key, src] of Object.entries(WORKOUT_LIBRARY_MEDIA)) {
  if (typeof src !== "string" || !src.startsWith("/")) continue; // format handled by (2)
  const abs = path.join(publicDir, src.replace(/^\//, ""));
  if (!fs.existsSync(abs)) {
    failures.push(`Published media "${key}" -> ${src} — file not found at public${src}`);
  }
}

const coverage = getLibraryMediaCoverage();

const report = {
  scenario: "workout-library-media",
  requiredAssets: REQUIRED_LIBRARY_MEDIA.length,
  coverage,
  pass: failures.length === 0,
  failures
};
console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.error(`\nqa:workout-library FAILED with ${failures.length} issue(s).`);
  process.exit(1);
}
console.log(
  `\nqa:workout-library PASSED — ${coverage.approved}/${coverage.total} media approved, ` +
    `${coverage.awaiting} awaiting production, 0 broken published assets.`
);
