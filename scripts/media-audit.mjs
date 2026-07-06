// PulsePeak complete media audit.
//
// Walks the LIVE resolver (what the app actually serves) for every exercise and
// runs dependency-free structural checks that catch the "commercially
// unacceptable" media defects a vision pass would otherwise have to find one by
// one: missing frames, duplicate frames (a "peak" that is byte-identical to the
// "start"), placeholder/baked-text tiles, inconsistent dimensions / aspect
// ratios, low resolution, cross-exercise shared images, and on-disk orphans.
//
// PNG dimensions come from the IHDR header; duplicate/placeholder detection from
// SHA-256 file hashing + bytes-per-pixel. No image-decoding deps required.
//
// Output: artifacts/media-audit.json (machine) + a printed summary. Read-only.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const projectRoot = process.cwd();
const publicRoot = path.join(projectRoot, "public");
const exercisesDir = path.join(publicRoot, "media", "exercises");

const { getMovementLibrary } = await import("../server/data/movementLibrary.js");
const { getMovementMedia } = await import("../shared/exerciseCatalog.js");
const { getReviewedMediaAsset } = await import("../shared/mediaReviewCatalog.js");

function localPath(webPath) {
  return path.join(publicRoot, String(webPath || "").replace(/^\//, ""));
}
function pngSize(filePath) {
  const fd = fs.openSync(filePath, "r");
  try {
    const buf = Buffer.alloc(24);
    fs.readSync(fd, buf, 0, 24, 0);
    if (buf.toString("ascii", 12, 16) !== "IHDR") return null;
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  } finally {
    fs.closeSync(fd);
  }
}
function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

const findings = [];       // {severity, code, id, detail}
const record = (severity, code, id, detail) => findings.push({ severity, code, id, detail });

const perExercise = [];
const hashToFiles = new Map();   // hash -> [{id, role, web}]
const referencedDisk = new Set();

let visualCount = 0;
let textOnlyCount = 0;

for (const movement of getMovementLibrary()) {
  const media = getMovementMedia(movement);
  const steps = (media.sequence || []).map((e) => e.src).filter(Boolean);
  const thumb = media.thumbnail || media.image || null;

  if (steps.length < 2 && !thumb) { textOnlyCount++; continue; }
  visualCount++;

  const frames = [];
  steps.forEach((web, i) => frames.push({ role: `step-${i + 1}`, web }));
  if (thumb) frames.push({ role: "thumbnail", web: thumb });

  const info = { id: movement.id, name: movement.name, frames: [], issues: [] };

  const hashes = {};
  const sizes = {};
  for (const f of frames) {
    const abs = localPath(f.web);
    referencedDisk.add(path.normalize(abs));
    if (!fs.existsSync(abs)) {
      record("HIGH", "missing-frame", movement.id, `${f.role} -> ${f.web} not on disk`);
      info.issues.push(`missing ${f.role}`);
      continue;
    }
    const size = pngSize(abs);
    const bytes = fs.statSync(abs).size;
    const hash = sha256(abs);
    hashes[f.role] = hash;
    sizes[f.role] = size;
    const bpp = size ? bytes / (size.w * size.h) : 0;
    info.frames.push({ role: f.role, web: f.web, w: size?.w, h: size?.h, bytes, bpp: Number(bpp.toFixed(3)), hash: hash.slice(0, 12) });
    hashToFiles.set(hash, [...(hashToFiles.get(hash) || []), { id: movement.id, role: f.role, web: f.web }]);
  }

  // 1. Intra-exercise duplicate frames. Only two DISTINCT movement phases being
  //    byte-identical is a real defect (a "peak" that is actually the "start").
  //    A thumbnail reusing a step frame is intentional (the card hero image), so
  //    that is reported as INFO, not a defect.
  const stepSeen = new Map();
  for (const [role, h] of Object.entries(hashes)) {
    if (!role.startsWith("step-")) continue;
    if (stepSeen.has(h)) {
      record("HIGH", "duplicate-step-frame", movement.id, `${role} is byte-identical to ${stepSeen.get(h)} — two movement phases are the same image`);
      info.issues.push(`dup ${role}=${stepSeen.get(h)}`);
    } else stepSeen.set(h, role);
  }
  const thumbHash = hashes.thumbnail;
  if (thumbHash && !Object.entries(hashes).some(([r, h]) => r.startsWith("step-") && h === thumbHash)) {
    record("LOW", "thumbnail-not-from-sequence", movement.id, "thumbnail is a standalone image, not one of the step frames (verify it matches the set)");
  }

  // 2. Dimension / aspect consistency across the step frames.
  const stepSizes = Object.entries(sizes).filter(([r]) => r.startsWith("step-")).map(([, s]) => s).filter(Boolean);
  if (stepSizes.length >= 2) {
    const dims = [...new Set(stepSizes.map((s) => `${s.w}x${s.h}`))];
    if (dims.length > 1) {
      record("MED", "inconsistent-dimensions", movement.id, `step frames differ: ${dims.join(", ")}`);
      info.issues.push("mixed step dims");
    }
    const minShort = Math.min(...stepSizes.map((s) => Math.min(s.w, s.h)));
    if (minShort < 1000) {
      record("MED", "low-resolution", movement.id, `smallest step frame short side ${minShort}px (< 1000)`);
      info.issues.push(`low-res ${minShort}px`);
    }
  }

  // 3. Placeholder / baked-text heuristic: real photos are dense (high bpp);
  //    flat "STEP N" placeholder cards are near-flat (very low bpp).
  const bpps = info.frames.map((f) => f.bpp).filter((v) => v > 0);
  const lowBpp = info.frames.filter((f) => f.bpp > 0 && f.bpp < 0.6);
  if (bpps.length && lowBpp.length) {
    record(
      lowBpp.length === info.frames.length ? "HIGH" : "MED",
      "possible-placeholder",
      movement.id,
      `${lowBpp.length}/${info.frames.length} frame(s) look like flat placeholder/graphic tiles (bpp ${lowBpp.map((f) => `${f.role}:${f.bpp}`).join(", ")})`,
    );
    info.issues.push(`placeholder-suspect x${lowBpp.length}`);
  }

  info.reviewSource = getReviewedMediaAsset(movement.id)?.reviewSource || media.reviewSource || null;
  if (!info.reviewSource) {
    record("LOW", "no-review-source", movement.id, "no reviewSource recorded");
  }
  perExercise.push(info);
}

// 4. Cross-exercise duplicate images (shared placeholder card, or accidental reuse).
for (const [hash, files] of hashToFiles) {
  const ids = [...new Set(files.map((f) => f.id))];
  if (ids.length > 1) {
    // Expected: EXACT_VISUAL_MEDIA_KEYS deliberately points variants at a base.
    // Alarm loudest when the SAME hash spans many unrelated exercises (a shared
    // placeholder), quieter for a 2-exercise variant/base pair.
    const sev = ids.length >= 3 ? "HIGH" : "LOW";
    record(sev, "cross-exercise-shared-image", ids.slice(0, 6).join(","), `${files.length} frames across ${ids.length} exercises share one image (hash ${hash.slice(0, 12)})${ids.length >= 3 ? " — likely a shared placeholder" : " — variant/base reuse (verify intended)"}`);
  }
}

// 5. On-disk orphans: exercise media dirs never referenced by the resolver.
if (fs.existsSync(exercisesDir)) {
  for (const entry of fs.readdirSync(exercisesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(exercisesDir, entry.name);
    const files = fs.readdirSync(dir).filter((f) => /\.(png|jpg|jpeg)$/i.test(f));
    const anyReferenced = files.some((f) => referencedDisk.has(path.normalize(path.join(dir, f))));
    // gendered dirs nest male/female — check one level down too
    const nested = files.length === 0;
    if (!anyReferenced && !nested && files.length) {
      record("LOW", "orphan-media", entry.name, `${files.length} image(s) on disk not referenced by the live resolver`);
    }
  }
}

const bySeverity = (s) => findings.filter((f) => f.severity === s);
const summary = {
  visualExercises: visualCount,
  textOnlyExercises: textOnlyCount,
  totalFindings: findings.length,
  high: bySeverity("HIGH").length,
  med: bySeverity("MED").length,
  low: bySeverity("LOW").length,
};

const artifactsDir = path.join(projectRoot, "artifacts");
fs.mkdirSync(artifactsDir, { recursive: true });
fs.writeFileSync(path.join(artifactsDir, "media-audit.json"), JSON.stringify({ summary, findings, perExercise }, null, 2));

console.log("PulsePeak media audit");
console.log(`  visual-guide exercises: ${visualCount}`);
console.log(`  text-only exercises:    ${textOnlyCount}`);
console.log(`  findings: ${findings.length}  (HIGH ${summary.high} · MED ${summary.med} · LOW ${summary.low})\n`);
for (const sev of ["HIGH", "MED", "LOW"]) {
  const rows = bySeverity(sev);
  if (!rows.length) continue;
  console.log(`${sev} (${rows.length}):`);
  for (const f of rows.slice(0, 60)) console.log(`  [${f.code}] ${f.id}: ${f.detail}`);
  if (rows.length > 60) console.log(`  … +${rows.length - 60} more (see artifacts/media-audit.json)`);
  console.log("");
}
