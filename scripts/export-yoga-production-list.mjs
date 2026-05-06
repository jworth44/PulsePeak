import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const YOGA_POSES = [
  pose("childs-pose", "Child's Pose", "beginner", "seated", "spine", "hips", "yes", "static", "1", "high"),
  pose("downward-dog", "Downward Dog", "beginner", "standing", "full body", "hamstrings", "yes", "static", "1", "high"),
  pose("warrior-i", "Warrior I", "beginner", "standing", "full body", "hips", "yes", "static", "1", "high"),
  pose("warrior-ii", "Warrior II", "beginner", "standing", "full body", "hips", "yes", "static", "1", "high"),
  pose("pigeon-pose", "Pigeon Pose", "intermediate", "seated", "hips", "spine", "yes", "static", "1", "high"),
  pose("cobra-pose", "Cobra Pose", "beginner", "prone", "spine", "shoulders", "yes", "static", "1", "high"),
  pose("bridge-pose", "Bridge Pose", "beginner", "supine", "spine", "hips", "yes", "static", "1", "high"),
  pose("savasana", "Corpse Pose", "beginner", "supine", "full body", "spine", "yes", "static", "1", "high"),
  pose("mountain-pose", "Mountain Pose", "beginner", "standing", "full body", "core", "no", "static", "1", "medium"),
  pose("triangle-pose", "Triangle Pose", "beginner", "standing", "hamstrings", "hips", "yes", "static", "1", "medium"),
  pose("tree-pose", "Tree Pose", "beginner", "balance", "core", "hips", "yes", "static", "1", "medium"),
  pose("tabletop-pose", "Tabletop Pose", "beginner", "kneeling", "spine", "shoulders", "yes", "static", "1", "medium"),
  pose("seated-forward-fold", "Seated Forward Fold", "beginner", "seated", "hamstrings", "spine", "yes", "static", "1", "medium"),
  pose("standing-forward-fold", "Standing Forward Fold", "beginner", "standing", "hamstrings", "spine", "yes", "static", "1", "medium"),
  pose("low-lunge", "Low Lunge", "beginner", "standing", "hips", "full body", "yes", "static", "1", "medium"),
  pose("crescent-lunge", "Crescent Lunge", "intermediate", "standing", "full body", "hips", "yes", "static", "1", "medium"),
  pose("chair-pose", "Chair Pose", "beginner", "standing", "core", "hips", "yes", "static", "1", "medium"),
  pose("boat-pose", "Boat Pose", "intermediate", "seated", "core", "hips", "yes", "static", "1", "medium"),
  pose("staff-pose", "Staff Pose", "beginner", "seated", "spine", "hamstrings", "yes", "static", "1", "medium"),
  pose("easy-pose", "Easy Pose", "beginner", "seated", "spine", "hips", "yes", "static", "1", "medium"),
  pose("bound-angle-pose", "Bound Angle Pose", "beginner", "seated", "hips", "hamstrings", "yes", "static", "1", "medium"),
  pose("cow-face-pose", "Cow Face Pose", "intermediate", "seated", "shoulders", "hips", "yes", "static", "1", "medium"),
  pose("seated-spinal-twist", "Seated Spinal Twist", "beginner", "seated", "spine", "hips", "yes", "static", "1", "medium"),
  pose("supine-twist", "Supine Twist", "beginner", "supine", "spine", "hips", "yes", "static", "1", "medium"),
  pose("happy-baby", "Happy Baby", "beginner", "supine", "hips", "spine", "yes", "static", "1", "medium"),
  pose("legs-up-the-wall", "Legs Up The Wall", "beginner", "supine", "hamstrings", "spine", "yes", "static", "1", "medium"),
  pose("sphinx-pose", "Sphinx Pose", "beginner", "prone", "spine", "shoulders", "yes", "static", "1", "medium"),
  pose("upward-facing-dog", "Upward Facing Dog", "intermediate", "prone", "spine", "shoulders", "yes", "static", "1", "medium"),
  pose("puppy-pose", "Puppy Pose", "beginner", "prone", "shoulders", "spine", "yes", "static", "1", "medium"),
  pose("camel-pose", "Camel Pose", "intermediate", "kneeling", "spine", "shoulders", "yes", "static", "1", "medium"),
  pose("locust-pose", "Locust Pose", "intermediate", "prone", "spine", "full body", "yes", "static", "1", "medium"),
  pose("bow-pose", "Bow Pose", "advanced", "prone", "spine", "shoulders", "yes", "static", "1", "low"),
  pose("fish-pose", "Fish Pose", "intermediate", "supine", "spine", "shoulders", "yes", "static", "1", "medium"),
  pose("shoulder-stand", "Shoulder Stand", "advanced", "supine", "core", "spine", "yes", "static", "1", "low"),
  pose("headstand", "Headstand", "advanced", "balance", "core", "shoulders", "yes", "static", "1", "low"),
  pose("crow-pose", "Crow Pose", "advanced", "balance", "core", "shoulders", "yes", "static", "1", "low"),
  pose("thread-the-needle", "Thread The Needle", "beginner", "kneeling", "shoulders", "spine", "yes", "static", "1", "medium"),
  pose("dolphin-pose", "Dolphin Pose", "intermediate", "prone", "shoulders", "core", "yes", "static", "1", "medium"),
  pose("half-moon-pose", "Half Moon Pose", "advanced", "balance", "core", "hips", "yes", "static", "1", "low"),
  pose("eagle-pose", "Eagle Pose", "intermediate", "balance", "shoulders", "hips", "yes", "static", "1", "medium"),
  pose("dancer-pose", "Dancer Pose", "advanced", "balance", "full body", "hips", "yes", "static", "1", "low"),
  pose("garland-pose", "Garland Pose", "beginner", "standing", "hips", "spine", "yes", "static", "1", "medium"),
  pose("lizard-pose", "Lizard Pose", "intermediate", "standing", "hips", "hamstrings", "yes", "static", "1", "medium"),
  pose("reclined-hand-to-big-toe-pose", "Reclined Hand To Big Toe Pose", "intermediate", "supine", "hamstrings", "hips", "yes", "static", "1", "medium"),
  pose("wide-legged-forward-fold", "Wide Legged Forward Fold", "intermediate", "standing", "hamstrings", "hips", "yes", "static", "1", "medium"),
  pose("sun-salutation-a", "Sun Salutation A", "beginner", "flow", "full body", "spine", "yes", "dynamic", "5", "medium"),
  pose("sun-salutation-b", "Sun Salutation B", "intermediate", "flow", "full body", "core", "yes", "dynamic", "5", "medium"),
  pose("warrior-iii", "Warrior III", "advanced", "balance", "core", "hips", "yes", "static", "1", "low"),
  pose("reverse-warrior", "Reverse Warrior", "beginner", "standing", "full body", "spine", "yes", "static", "1", "medium"),
  pose("extended-side-angle", "Extended Side Angle", "beginner", "standing", "full body", "hips", "yes", "static", "1", "medium")
];

async function main() {
  const rows = YOGA_POSES.map((entry, index) => ({
    index: index + 1,
    id: entry.id,
    detailId: `${entry.id}--${entry.id}`,
    displayName: entry.displayName,
    visualCategory: "yoga",
    difficulty: entry.difficulty,
    poseType: entry.poseType,
    primaryFocus: entry.primaryFocus,
    secondaryFocus: entry.secondaryFocus,
    requiresMat: entry.requiresMat,
    footwear: "barefoot",
    sequenceType: entry.sequenceType,
    framesRequired: entry.framesRequired,
    priority: entry.priority,
    notes: entry.notes
  }));

  const artifactsDir = path.join(projectRoot, "artifacts");
  await fs.mkdir(artifactsDir, { recursive: true });

  const csvPath = path.join(artifactsDir, "pulsepeak-yoga-production-list.csv");
  const jsonPath = path.join(artifactsDir, "pulsepeak-yoga-production-list.json");
  const summaryPath = path.join(artifactsDir, "pulsepeak-yoga-production-summary.md");

  await fs.writeFile(csvPath, buildCsv(rows));
  await fs.writeFile(jsonPath, JSON.stringify(rows, null, 2));
  await fs.writeFile(summaryPath, buildSummary(rows));

  console.log(
    JSON.stringify(
      {
        created: [
          toProjectRelative(csvPath),
          toProjectRelative(jsonPath),
          toProjectRelative(summaryPath)
        ],
        counts: summarize(rows)
      },
      null,
      2
    )
  );
}

function pose(
  id,
  displayName,
  difficulty,
  poseType,
  primaryFocus,
  secondaryFocus,
  requiresMat,
  sequenceType,
  framesRequired,
  priority
) {
  return {
    id,
    displayName,
    difficulty,
    poseType,
    primaryFocus,
    secondaryFocus,
    requiresMat,
    sequenceType,
    framesRequired,
    priority,
    notes:
      sequenceType === "dynamic"
        ? "Use a clean multi-step instructional yoga flow with panel-to-panel posture clarity."
        : "Use a single clean hold illustration with strong alignment clarity."
  };
}

function summarize(rows) {
  return {
    total: rows.length,
    beginner: rows.filter((row) => row.difficulty === "beginner").length,
    intermediate: rows.filter((row) => row.difficulty === "intermediate").length,
    advanced: rows.filter((row) => row.difficulty === "advanced").length,
    static: rows.filter((row) => row.sequenceType === "static").length,
    dynamic: rows.filter((row) => row.sequenceType === "dynamic").length
  };
}

function buildSummary(rows) {
  const counts = summarize(rows);
  const highPriority = rows.filter((row) => row.priority === "high").map((row) => row.displayName);
  const top15 = rows
    .slice()
    .sort(compareGenerationOrder)
    .slice(0, 15)
    .map((row, index) => `${index + 1}. ${row.displayName} (${row.difficulty}, ${row.sequenceType})`);

  return [
    "# PulsePeak Yoga Production Summary",
    "",
    `- Total poses: ${counts.total}`,
    `- Beginner count: ${counts.beginner}`,
    `- Intermediate count: ${counts.intermediate}`,
    `- Advanced count: ${counts.advanced}`,
    `- Static count: ${counts.static}`,
    `- Dynamic count: ${counts.dynamic}`,
    `- Visual category breakdown: yoga ${counts.total}`,
    "",
    "## High Priority List",
    ...highPriority.map((name) => `- ${name}`),
    "",
    "## Recommended Generation Order (Top 15)",
    ...top15,
    "",
    "## Assumption",
    "- The exact prior 50-pose yoga source list was not present in the local workspace, so this export uses a standard 50-pose PulsePeak yoga production set aligned to the requested schema and priority rules.",
    ""
  ].join("\n");
}

function compareGenerationOrder(left, right) {
  const priorityWeight = { high: 0, medium: 1, low: 2 };
  const difficultyWeight = { beginner: 0, intermediate: 1, advanced: 2 };
  return (
    priorityWeight[left.priority] - priorityWeight[right.priority] ||
    difficultyWeight[left.difficulty] - difficultyWeight[right.difficulty] ||
    left.displayName.localeCompare(right.displayName)
  );
}

function buildCsv(rows) {
  const headers = [
    "index",
    "id",
    "detailId",
    "displayName",
    "visualCategory",
    "difficulty",
    "poseType",
    "primaryFocus",
    "secondaryFocus",
    "requiresMat",
    "footwear",
    "sequenceType",
    "framesRequired",
    "priority",
    "notes"
  ];

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(","))
  ].join("\n");
}

function escapeCsv(value) {
  const normalized = String(value ?? "");
  return /[",\n]/.test(normalized) ? `"${normalized.replaceAll("\"", "\"\"")}"` : normalized;
}

function toProjectRelative(filePath) {
  return path.relative(projectRoot, filePath).replaceAll("\\", "/");
}

await main();
