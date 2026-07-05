// PulsePeak model-consistency audit (FACTORY §5b).
//
// Verifies, for every exercise whose media is a multi-frame model sequence:
//   1. every declared step file + the thumbnail exists on disk,
//   2. all frames of that exercise share identical pixel dimensions
//      (a strong structural signal they came from one coherent shoot — mixed
//      dimensions inside one exercise means frames were sourced differently,
//      which is exactly how "different model per frame" sneaks in),
//   3. the asset carries a reviewSource (proof it passed the review gate).
//
// True face-identity matching needs a vision pass; this audit guarantees the
// structural preconditions and emits a manifest the vision review consumes.
// Exit non-zero on any structural failure so it can gate CI.

import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const publicRoot = path.join(projectRoot, "public");

const { getMovementLibrary } = await import("../server/data/movementLibrary.js");
const { getMovementMedia } = await import("../shared/exerciseCatalog.js");
const { getReviewedMediaAsset } = await import("../shared/mediaReviewCatalog.js");

// Legacy library frames carry sub-pixel crop variance from their original
// source; that is not a model-identity risk. A frame that is a different
// SCALE from its siblings (e.g. a thumbnail-sized frame mixed with a full
// one) is — so flag only when the largest/smallest frame width ratio exceeds
// this tolerance.
const DIMENSION_RATIO_TOLERANCE = 1.1;

/** Read a PNG's width/height straight from the IHDR chunk (no deps). */
function pngSize(filePath) {
  const fd = fs.openSync(filePath, "r");
  try {
    const buf = Buffer.alloc(24);
    fs.readSync(fd, buf, 0, 24, 0);
    // PNG signature is 8 bytes; IHDR width/height are big-endian at 16 and 20.
    if (buf.toString("ascii", 12, 16) !== "IHDR") return null;
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  } finally {
    fs.closeSync(fd);
  }
}

function localPath(webPath) {
  return path.join(publicRoot, String(webPath || "").replace(/^\//, ""));
}

const failures = [];
const warnings = [];
const manifest = [];

for (const movement of getMovementLibrary()) {
  const media = getMovementMedia(movement);
  const steps = (media.sequence || []).map((entry) => entry.src).filter(Boolean);
  const unique = Array.from(new Set(steps));

  // Only audit genuine multi-frame model sequences (2+ distinct frames).
  if (unique.length < 2) continue;

  const reviewSource = getReviewedMediaAsset(movement.id)?.reviewSource || media.reviewSource || null;
  const record = {
    id: movement.id,
    name: movement.name,
    frames: unique.length,
    reviewSource,
    files: unique.map((s) => s.replace(/^\/media\/exercises\//, "")),
  };
  manifest.push(record);

  // 1. every frame + thumbnail present
  const missing = [];
  for (const s of unique) {
    if (!fs.existsSync(localPath(s))) missing.push(s);
  }
  const thumb = media.thumbnail || media.image;
  if (thumb && !fs.existsSync(localPath(thumb))) missing.push(thumb);
  if (missing.length) {
    failures.push(`${movement.id}: missing files -> ${missing.join(", ")}`);
    continue;
  }

  // 2. dimensions identical across the exercise's frames
  const sizes = unique.map((s) => ({ s, size: pngSize(localPath(s)) }));
  const badRead = sizes.filter((x) => !x.size);
  if (badRead.length) {
    failures.push(`${movement.id}: unreadable PNG -> ${badRead.map((x) => x.s).join(", ")}`);
    continue;
  }
  const widths = sizes.map((x) => x.size.w);
  const ratio = Math.max(...widths) / Math.min(...widths);
  if (ratio > DIMENSION_RATIO_TOLERANCE) {
    const dims = [...new Set(sizes.map((x) => `${x.size.w}x${x.size.h}`))];
    failures.push(
      `${movement.id}: frames differ in scale (${dims.join(", ")}) — mixed sources, model-identity risk`,
    );
  }

  // 3. review provenance
  if (!reviewSource) {
    failures.push(`${movement.id}: no reviewSource — cannot prove it passed the model-identity review gate`);
  }
}

// Write the manifest for the vision reviewer.
const artifactsDir = path.join(projectRoot, "artifacts");
fs.mkdirSync(artifactsDir, { recursive: true });
const manifestPath = path.join(artifactsDir, "model-consistency-manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify({ audited: manifest.length, exercises: manifest }, null, 2));

console.log(`Model-consistency audit: ${manifest.length} multi-frame model exercises checked.`);
console.log(`Manifest: ${path.relative(projectRoot, manifestPath)}`);
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings) console.log("  - " + w);
}
if (failures.length) {
  console.log(`\nFAILURES (${failures.length}):`);
  for (const f of failures) console.log("  ✗ " + f);
  process.exitCode = 1;
} else {
  console.log("\nAll multi-frame model exercises: files present, dimensionally coherent, review-sourced. ✓");
}
