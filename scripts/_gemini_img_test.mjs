import "dotenv/config";
import fs from "node:fs";
const key = process.env.GEMINI_API_KEY;
const MODEL = "gemini-3-pro-image"; // Nano Banana Pro
const ref = fs.readFileSync("temp/gemini-media/FINAL-muscle-chest.png").toString("base64");

const prompt = "Using this exact anatomical fitness figure as the reference — same man, same muscular build, same front pose, same seamless dark charcoal background, same lighting and art style — re-render it with ONLY the CORE / ABDOMINAL muscles (the six-pack rectus abdominis and side obliques) highlighted in crimson red #C6283B, and ALL other muscles (including the chest) in the neutral light grey-beige tone. Keep the seamless dark charcoal background with no shadows, patterns, watermark or text. Tall vertical 4:5, figure centered, sharp high resolution.";

const body = {
  contents: [{ parts: [ { text: prompt }, { inline_data: { mime_type: "image/png", data: ref } } ] }],
  generationConfig: { responseModalities: ["IMAGE"] }
};
const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
});
const j = await r.json();
if (!r.ok) { console.log("HTTP", r.status, JSON.stringify(j).slice(0, 400)); process.exit(1); }
const parts = j.candidates?.[0]?.content?.parts || [];
const imgPart = parts.find((p) => p.inlineData || p.inline_data);
if (!imgPart) { console.log("NO IMAGE. parts:", JSON.stringify(parts).slice(0, 300)); process.exit(1); }
const data = (imgPart.inlineData || imgPart.inline_data).data;
fs.writeFileSync("temp/gemini-media/TEST-core-api.png", Buffer.from(data, "base64"));
console.log("OK saved TEST-core-api.png bytes:", Buffer.from(data, "base64").length);
