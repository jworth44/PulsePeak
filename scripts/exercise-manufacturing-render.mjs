// Renders artifacts/exercise-reports.json into the master index + per-category
// production report documents under docs/exercise-reports/.
import fs from "node:fs";

const reports = JSON.parse(fs.readFileSync("artifacts/exercise-reports.json", "utf8"));
const dir = "docs/exercise-reports";
fs.mkdirSync(dir, { recursive: true });

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const list = (arr) => (arr && arr.length ? arr.map((x) => `  - ${x}`).join("\n") : "  - _(none)_");

// Group by category
const cats = {};
for (const r of reports) (cats[r.category] ||= []).push(r);
const catNames = Object.keys(cats).sort();

// ---- Master index ----
let idx = `# PulsePeak — Exercise Manufacturing Index\n\n`;
idx += `Every exercise inspected against the 20-field production standard, photo\n`;
idx += `sequence completeness, and the child test. Generated from the live catalog.\n\n`;
idx += `**Total exercises: ${reports.length}** · Visual guides: ${reports.filter((r) => r.hasVisual).length} · Text guides: ${reports.filter((r) => !r.hasVisual).length}\n\n`;
idx += `Each exercise has a full 20-field report in \`docs/exercise-reports/<category>.md\`. The 7 fields the catalog lacked natively (rep ranges, rest periods, beginner tips, advanced tips, mobility requirements, alternatives, injury considerations) are generated from the exercise's own data and reviewed.\n\n`;
idx += `Legend — 📷 = full visual sequence · 📝 = text guide (image pending) · ⚠️ = flagged for clarity/child-test review.\n\n`;

for (const c of catNames) {
  idx += `## ${c} (${cats[c].length})\n\n`;
  idx += `| Exercise | Difficulty | Class | Photo | Flag |\n|---|---|---|---|---|\n`;
  for (const r of cats[c].sort((a, b) => a.name.localeCompare(b.name))) {
    idx += `| [${r.name}](docs/exercise-reports/${slug(c)}.md#${slug(r.name)}) | ${r.difficulty} | ${r.class} | ${r.hasVisual ? "📷" : "📝"} | ${r.childTest.pass ? "" : "⚠️ " + r.childTest.issues.join("; ")} |\n`;
  }
  idx += `\n`;
}
fs.writeFileSync("EXERCISE_MANUFACTURING_INDEX.md", idx);

// ---- Per-category reports ----
for (const c of catNames) {
  let md = `# Exercise Production Reports — ${c}\n\n`;
  md += `Part of the Exercise Manufacturing Gold Standard. ${cats[c].length} exercises. See \`EXERCISE_MANUFACTURING_INDEX.md\` for the full index.\n\n`;
  for (const r of cats[c].sort((a, b) => a.name.localeCompare(b.name))) {
    md += `<a id="${slug(r.name)}"></a>\n## ${r.name}\n\n`;
    md += `> ${r.hasVisual ? "📷 Full visual sequence" : "📝 Text guide (image pending)"} · Class: ${r.class}`;
    md += r.childTest.pass ? "\n\n" : ` · ⚠️ Review: ${r.childTest.issues.join("; ")}\n\n`;
    md += `**1. Exercise name:** ${r.name}\n\n`;
    md += `**2. Primary muscles:** ${r.primaryMuscles}\n\n`;
    md += `**3. Secondary muscles:** ${r.secondaryMuscles}\n\n`;
    md += `**4. Equipment:** ${r.equipment}\n\n`;
    md += `**5. Difficulty:** ${r.difficulty}\n\n`;
    md += `**6. Common mistakes:**\n${list(r.commonMistakes)}\n\n`;
    md += `**7. Safety warnings:**\n${list(r.safetyWarnings)}\n\n`;
    md += `**8. Breathing:** ${r.breathing}\n\n`;
    md += `**9. Tempo:** ${r.tempo}\n\n`;
    md += `**10. Coaching cues:**\n${list(r.coachingCues)}\n\n`;
    md += `**11. Beginner tips:**\n${list(r.beginnerTips)}\n\n`;
    md += `**12. Advanced tips:**\n${list(r.advancedTips)}\n\n`;
    md += `**13. Mobility requirements:** ${r.mobilityRequirements}\n\n`;
    md += `**14. Progressions:**\n${list(r.progressions)}\n\n`;
    md += `**15. Regressions:**\n${list(r.regressions)}\n\n`;
    md += `**16. Alternative exercises:**\n${list(r.alternatives)}\n\n`;
    md += `**17. Injury considerations:**\n${list(r.injuryConsiderations)}\n\n`;
    md += `**18. Ideal rep range:** ${r.repRange}\n\n`;
    md += `**19. Ideal rest period:** ${r.restPeriod}\n\n`;
    md += `**20. Training purpose:** ${r.trainingPurpose}\n\n`;
    md += `**Setup:** ${r.setup}\n\n`;
    md += `**Execution:** ${r.execution}\n\n`;
    if (r.visualSequence.length) md += `**Visual sequence (steps):**\n${list(r.visualSequence)}\n\n`;
    md += `---\n\n`;
  }
  fs.writeFileSync(`${dir}/${slug(c)}.md`, md);
}

console.log(`Wrote EXERCISE_MANUFACTURING_INDEX.md + ${catNames.length} category report files:`);
catNames.forEach((c) => console.log(`  ${dir}/${slug(c)}.md (${cats[c].length})`));
