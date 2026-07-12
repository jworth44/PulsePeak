import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

const key = process.env.GEMINI_API_KEY;
const OUT = "temp/gemini-media/api";
fs.mkdirSync(OUT, { recursive: true });
const IMG_MODEL = "gemini-3-pro-image";          // Nano Banana Pro (reference editing)
const IMAGEN = "imagen-4.0-generate-001";        // photoreal type scenes

const only = process.argv[2]; // optional filter substring

const chestRef = fs.readFileSync("temp/gemini-media/FINAL-muscle-chest.png").toString("base64");

const STYLE = "Keep the seamless dark charcoal (#1A1F22) studio background with no shadows, patterns, vignette, watermark or text. Sharp, crisp, high resolution, commercial anatomical-illustration quality. Tall vertical 4:5, figure centered.";
const REF_LEAD = "Using this exact anatomical fitness figure as the reference — the same man, same muscular build, same lighting and art style —";

// 8 muscle figures. Front unless posterior:true (rotate the figure to a rear view).
const MUSCLES = [
  { id: "chest", hi: "the CHEST muscles (pectorals)" },
  { id: "shoulders", hi: "the SHOULDER muscles (both deltoids / shoulder caps)" },
  { id: "arms", hi: "ONLY the BICEPS and TRICEPS running the full length of BOTH UPPER ARMS from shoulder to elbow — do NOT color the deltoids/shoulders, forearms or hands" },
  { id: "legs", hi: "the LEG muscles (the quadriceps on the front of both thighs)" },
  { id: "core", hi: "the CORE muscles (the six-pack rectus abdominis and the side obliques)" },
  { id: "glutes", hi: "the GLUTES (buttocks)", posterior: true },
  { id: "back", hi: "the BACK muscles (latissimus dorsi, trapezius and rhomboids)", posterior: true },
  { id: "full-body", hi: "ALL of the major muscle groups across the whole body (a full-body activation look)" }
];

// 6 workout-type photos (16:9 photoreal, cropped to 16:10 by the app).
const TYPE_STYLE = "Cinematic commercial fitness photography, premium dark gym, deep charcoal walls, moody dramatic side lighting, muted slate and evergreen tones, sharp focus, high resolution, no text, no watermark, no logos.";
const TYPES = [
  { id: "type-strength", p: "A lone athletic man mid barbell back squat, heavy bar loaded, focused and powerful. " + TYPE_STYLE },
  { id: "type-hypertrophy", p: "A muscular athlete performing controlled dumbbell curls, pump-focused, veins and detail. " + TYPE_STYLE },
  { id: "type-strength-endurance", p: "An athlete driving through heavy battle-rope waves, sweat and motion, high work capacity. " + TYPE_STYLE },
  { id: "type-power", p: "An athlete at the peak of an explosive box jump, dynamic mid-air power. " + TYPE_STYLE },
  { id: "type-conditioning", p: "A fit runner mid-stride on a dusk mountain trail, evergreen forest, cardio conditioning, cinematic warm-cool light. Commercial fitness photography, sharp, high resolution, no text or watermark." },
  { id: "type-recovery", p: "A person calmly foam-rolling / stretching on a mat in a dim warm recovery studio, restful and restorative. Commercial wellness photography, soft light, evergreen accents, no text or watermark." }
];

async function genMuscle(m) {
  const view = m.posterior
    ? "Rotate the figure to a POSTERIOR (rear / back) view showing the back of the body,"
    : "Keep the same front-facing pose,";
  const prompt = `${REF_LEAD} ${view} and re-render it with ONLY ${m.hi} highlighted in crimson red #C6283B; ALL other muscles in the neutral light grey-beige anatomical tone. ${STYLE}`;
  const body = { contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "image/png", data: chestRef } }] }], generationConfig: { responseModalities: ["IMAGE"] } };
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${IMG_MODEL}:generateContent?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) return { id: m.id, err: `HTTP ${r.status} ${JSON.stringify(j).slice(0,160)}` };
  const part = (j.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData || p.inline_data);
  if (!part) return { id: m.id, err: "no image part" };
  const buf = Buffer.from((part.inlineData || part.inline_data).data, "base64");
  fs.writeFileSync(path.join(OUT, `muscle-${m.id}.png`), buf);
  return { id: `muscle-${m.id}`, bytes: buf.length };
}

async function genType(t) {
  const body = { instances: [{ prompt: t.p }], parameters: { sampleCount: 1, aspectRatio: "16:9" } };
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${IMAGEN}:predict?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) return { id: t.id, err: `HTTP ${r.status} ${JSON.stringify(j).slice(0,160)}` };
  const pred = j.predictions?.[0];
  const b64 = pred?.bytesBase64Encoded || pred?.image?.imageBytes;
  if (!b64) return { id: t.id, err: "no image: " + JSON.stringify(j).slice(0,160) };
  const buf = Buffer.from(b64, "base64");
  fs.writeFileSync(path.join(OUT, `${t.id}.png`), buf);
  return { id: t.id, bytes: buf.length };
}

const jobs = [];
for (const m of MUSCLES) if (!only || `muscle-${m.id}`.includes(only)) jobs.push(() => genMuscle(m));
for (const t of TYPES) if (!only || t.id.includes(only)) jobs.push(() => genType(t));

console.log(`running ${jobs.length} generations...`);
for (const job of jobs) {
  try { const res = await job(); console.log(res.err ? `FAIL ${res.id}: ${res.err}` : `OK   ${res.id} (${res.bytes} bytes)`); }
  catch (e) { console.log("ERR", String(e.message).slice(0, 120)); }
}
console.log("DONE");
