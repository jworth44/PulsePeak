import "dotenv/config";
const key = process.env.GEMINI_API_KEY;
if (!key) { console.log("NO KEY"); process.exit(1); }
console.log("key prefix:", key.slice(0, 6), "len:", key.length);
// 1) list models (auth check). Try key as query param (AIza style) and as Bearer.
async function tryList(mode) {
  const base = "https://generativelanguage.googleapis.com/v1beta/models";
  const url = mode === "query" ? `${base}?key=${key}` : base;
  const headers = mode === "bearer" ? { Authorization: `Bearer ${key}` } : {};
  const r = await fetch(url, { headers });
  const body = await r.text();
  return { mode, status: r.status, ok: r.ok, sample: body.slice(0, 200) };
}
for (const mode of ["query", "bearer"]) {
  try { const res = await tryList(mode); console.log(`[${mode}] ${res.status} ${res.ok ? "OK" : "FAIL"} :: ${res.sample.replace(/\s+/g, " ")}`); }
  catch (e) { console.log(`[${mode}] ERR ${e.message}`); }
}
