import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findMovementForName } from "./movementLibrary.js";
import { createLibraryEntry, createMediaPayload, validateLibraryEntries } from "../../shared/exerciseCatalog.js";
import { buildExerciseMediaSpec } from "../../shared/mediaGenerationConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const YOGA_PRODUCTION_LIST = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../../artifacts/pulsepeak-yoga-production-list.json"), "utf8")
);

const MOBILITY_PRODUCTION_NAMES = new Set([
  "Cat-cow",
  "Walking spiderman reach",
  "World's greatest stretch",
  "90/90 hip flow",
  "Wall slide",
  "Open book rotation",
  "Foam roller thoracic extension",
  "Adductor rock-back",
  "Hip airplane support",
  "Calf wall stretch",
  "Ankle circle control",
  "90/90 switch",
  "Ankle dorsiflexion rock",
  "Hip CARs",
  "Hip flexor pulses",
  "Cossack squat mobility",
  "Scapular CARs",
  "Banded shoulder dislocates",
  "Shoulder CARs",
  "Neck CARs",
  "Hamstring sweeps",
  "Leg swings front back",
  "Leg swings side to side",
  "Glute activation bridge pulses",
  "Quadruped hip circles",
  "Prone press-ups",
  "Deep squat hold mobility",
  "Ankle knee over toe drives",
  "T-spine reach through",
  "Standing hip flexion drives"
]);

const STRETCH_PRODUCTION_NAMES = new Set([
  "Hamstring stretch",
  "Hip flexor stretch",
  "Figure-four glute stretch",
  "Sleeper stretch",
  "Bench thoracic opener",
  "Standing quad stretch",
  "Seated adductor stretch",
  "Overhead lat stretch",
  "Doorway pec stretch",
  "Neck side stretch",
  "Overhead triceps stretch",
  "Knees-to-chest stretch",
  "Piriformis stretch",
  "IT band stretch",
  "Cross-body shoulder stretch",
  "Wrist flexor stretch",
  "Wrist extensor stretch",
  "Seated butterfly stretch",
  "Supine hamstring strap stretch",
  "Half-kneeling quad stretch",
  "Soleus wall stretch",
  "Seated straddle stretch",
  "Prone quad stretch",
  "Seated chest opener stretch",
  "Wall pec minor stretch",
  "Upper trap stretch",
  "Levator scapulae stretch",
  "Seated glute stretch",
  "Frog adductor stretch",
  "Standing hamstring stretch",
  "Towel lat stretch",
  "Overhead side bend stretch",
  "Lying groin stretch",
  "Kneeling shin stretch",
  "Seated forearm flexor stretch",
  "Seated forearm extensor stretch",
  "Bench-assisted lat stretch",
  "Doorframe biceps stretch",
  "Posterior capsule stretch",
  "Standing side-body reach stretch"
]);

const REHAB_PRODUCTION_NAMES = new Set([
  "Band pull-apart corrective",
  "Banded shoulder external rotation rehab",
  "Sidelying shoulder external rotation rehab",
  "Isometric shoulder external rotation hold",
  "Scapular wall slide reach",
  "Serratus wall press",
  "Supported shoulder flexion slide",
  "Prone Y raise rehab",
  "Shoulder internal rotation isometric",
  "Scaption raise rehab",
  "Quad set",
  "Straight-leg raise rehab",
  "Heel slide rehab",
  "Short-arc quad",
  "Terminal knee extension rehab",
  "Spanish squat hold rehab",
  "Supported step-down rehab",
  "Supported sit-to-stand rehab",
  "Clamshell rehab",
  "Sidelying hip abduction rehab",
  "Glute med wall press",
  "Bridge march rehab",
  "Supported hip airplane hold",
  "Banded hip abduction hold",
  "Seated hip internal rotation rehab",
  "Standing hip extension rehab",
  "Heel-to-toe rocker",
  "Ankle alphabet control",
  "Banded ankle eversion",
  "Banded ankle inversion",
  "Single-leg balance reach rehab",
  "Seated calf raise rehab",
  "Tibialis raise rehab",
  "Low box calf lowering rehab",
  "Dead bug breathing rehab",
  "Crocodile breathing rehab",
  "Quadruped rock-back rehab",
  "Bird-dog hold rehab",
  "McGill curl-up",
  "Bent-knee fallout",
  "Supine march bracing",
  "Side plank from knees",
  "Tall-kneeling anti-rotation hold",
  "Heel tap dead bug",
  "Pallof press rehab",
  "Chin tuck reset rehab",
  "Seated chin nod",
  "Wall posture hold",
  "Cervical rotation isometric",
  "Seated thoracic extension support",
  "Wrist extension rock rehab",
  "Forearm pronation-supination rehab",
  "Finger extension spread rehab",
  "Towel grip isometric",
  "Wrist radial deviation rehab"
]);

const MOBILITY_SOURCE_TYPES = {
  production: "mobility_production",
  library: "mobility_library"
};

const STRETCH_SOURCE_TYPE = "stretch_production";
const REHAB_SOURCE_TYPE = "rehab_production";

const MOBILITY_CATEGORIES = [
  {
    id: "mobility",
    label: "Mobility",
    description: "Dynamic range-of-motion drills for hips, ankles, shoulders, and thoracic control without yoga flow styling."
  },
  {
    id: "yoga",
    label: "Yoga",
    description: "Longer flowing patterns that improve movement quality and help you settle down after hard training."
  },
  {
    id: "stretching",
    label: "Stretching",
    description: "Simple targeted stretches for tight areas before or after training."
  },
  {
    id: "physiotherapy",
    label: "Physiotherapy / Rehab",
    description: "Controlled drills that protect irritated areas and rebuild confidence."
  },
  {
    id: "recovery",
    label: "Recovery Mobility",
    description: "Low-stress movement support for days when soreness, stiffness, or fatigue need to lead."
  },
  {
    id: "injury_specific",
    label: "Injury-Specific",
    description: "Educational movement support organized around the areas that feel most limited right now."
  }
];

const AREA_OPTIONS = [
  { value: "all", label: "All body areas" },
  { value: "full_body", label: "Full body" },
  { value: "shoulder", label: "Shoulder irritation" },
  { value: "back", label: "Lower back" },
  { value: "hip", label: "Hip tightness" },
  { value: "knee", label: "Knee support" },
  { value: "ankle", label: "Ankle stiffness" },
  { value: "elbow", label: "Tennis elbow support" },
  { value: "wrist", label: "Carpal tunnel support" }
];

const INJURY_SUPPORT_OPTIONS = [
  { value: "all", label: "Any injury support" },
  { value: "meniscus_support", label: "Meniscus irritation / tear support" },
  { value: "acl_mcl_support", label: "ACL / MCL stability support" },
  { value: "patellar_tracking_support", label: "Patellar tracking support" },
  { value: "general_knee_pain_support", label: "General knee pain support" },
  { value: "lumbar_strain_support", label: "Lumbar strain support" },
  { value: "disc_irritation_support", label: "Disc irritation support" },
  { value: "general_low_back_stiffness", label: "General low-back stiffness" },
  { value: "rotator_cuff_support", label: "Rotator cuff irritation support" },
  { value: "shoulder_impingement_support", label: "Impingement support" },
  { value: "shoulder_instability_support", label: "Shoulder instability support" },
  { value: "tennis_elbow", label: "Tennis elbow support" },
  { value: "carpal_tunnel", label: "Carpal tunnel support" },
  { value: "hip_tightness_support", label: "Hip tightness support" },
  { value: "ankle_stiffness_support", label: "Ankle stiffness support" }
];

const SUPPORT_TOPIC_EQUIVALENTS = {
  knee_support: ["general_knee_pain_support", "patellar_tracking_support", "acl_mcl_support", "meniscus_support"],
  lower_back: ["general_low_back_stiffness", "lumbar_strain_support", "disc_irritation_support"],
  shoulder_irritation: ["rotator_cuff_support", "shoulder_impingement_support", "shoulder_instability_support"],
  hip_tightness: ["hip_tightness_support"],
  ankle_stiffness: ["ankle_stiffness_support"]
};

const BASE_MOBILITY_LIBRARY = [
  routine({
    name: "Cat-cow",
    supportTypes: ["mobility", "recovery"],
    restrictedAreas: ["back"],
    bodyAreas: ["back", "full_body"],
    supportTopics: ["lower_back"],
    phase: "warmup",
    benefit: "Wake up the spine and breathe into easier movement quality.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["mobility", "general_fitness", "active_aging"],
    recoveryFit: "high"
  }),
  routine({
    name: "Child's pose with side reach",
    supportTypes: ["stretching", "recovery"],
    restrictedAreas: ["back", "shoulder"],
    bodyAreas: ["back", "shoulder", "full_body"],
    supportTopics: ["lower_back", "shoulder_irritation"],
    phase: "cooldown",
    benefit: "Downshift after hard training while opening the upper back and lats.",
    minutes: 6,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["mobility", "injury_recovery", "active_aging"],
    recoveryFit: "high"
  }),
  routine({
    name: "Thoracic rotation",
    supportTypes: ["recovery", "injury_specific"],
    restrictedAreas: ["back", "shoulder"],
    bodyAreas: ["back", "shoulder", "full_body"],
    supportTopics: ["shoulder_irritation", "lower_back"],
    phase: "warmup",
    benefit: "Improve rotational freedom without aggressive spinal loading.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["mobility", "injury_recovery", "athletic_performance"],
    recoveryFit: "high"
  }),
  routine({
    name: "Walking spiderman reach",
    supportTypes: ["mobility", "stretching"],
    restrictedAreas: ["hip", "shoulder"],
    bodyAreas: ["hip", "shoulder", "full_body"],
    supportTopics: ["hip_tightness", "shoulder_irritation"],
    phase: "warmup",
    benefit: "Prime total-body mobility before mixed training days.",
    minutes: 6,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["athletic_performance", "general_fitness"],
    recoveryFit: "medium"
  }),
  routine({
    name: "World's greatest stretch",
    supportTypes: ["mobility", "stretching", "recovery"],
    restrictedAreas: ["hip", "ankle"],
    bodyAreas: ["hip", "ankle", "full_body"],
    supportTopics: ["hip_tightness", "ankle_stiffness"],
    phase: "warmup",
    benefit: "Prep hips, ankles, and hamstrings before squats or lunges.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["fat_loss", "athletic_performance", "general_fitness"],
    recoveryFit: "medium"
  }),
  routine({
    name: "90/90 hip flow",
    supportTypes: ["mobility", "recovery", "injury_specific"],
    restrictedAreas: ["hip", "back"],
    bodyAreas: ["hip", "back"],
    supportTopics: ["hip_tightness", "lower_back"],
    phase: "cooldown",
    benefit: "Improve hip rotation and reduce stiffness after lower-body work.",
    minutes: 7,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["mobility", "injury_recovery", "active_aging"],
    recoveryFit: "high"
  }),
  routine({
    name: "Hip flexor stretch",
    supportTypes: ["recovery", "stretching", "injury_specific"],
    restrictedAreas: ["hip", "back"],
    bodyAreas: ["hip", "back"],
    supportTopics: ["hip_tightness", "lower_back"],
    phase: "cooldown",
    benefit: "Reduce front-of-hip tightness from sitting and leg training.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["mobility", "fat_loss", "general_fitness"],
    recoveryFit: "high"
  }),
  routine({
    name: "Hamstring stretch",
    supportTypes: ["recovery", "stretching", "injury_specific"],
    restrictedAreas: ["hip", "back"],
    bodyAreas: ["hip", "back"],
    supportTopics: ["hip_tightness", "lower_back"],
    phase: "cooldown",
    benefit: "Restore posterior-chain range after cardio or lower-body work.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["mobility", "general_fitness", "active_aging"],
    recoveryFit: "high"
  }),
  routine({
    name: "Half-kneeling ankle rocks",
    supportTypes: ["stretching", "injury_specific"],
    restrictedAreas: ["ankle", "knee"],
    bodyAreas: ["ankle", "knee"],
    supportTopics: ["ankle_stiffness", "knee_support"],
    phase: "warmup",
    benefit: "Open ankle range before loaded leg training.",
    minutes: 4,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["strength", "fat_loss", "injury_recovery"],
    recoveryFit: "medium"
  }),
  routine({
    name: "Supported box squat pattern",
    supportTypes: ["physiotherapy", "injury_specific"],
    restrictedAreas: ["knee", "hip"],
    bodyAreas: ["knee", "hip"],
    supportTopics: ["knee_support", "hip_tightness"],
    phase: "warmup",
    benefit: "Practice a lower-load squat pattern when joint confidence is low.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["injury_recovery", "active_aging"],
    recoveryFit: "medium"
  }),
  routine({
    name: "Wall slide",
    supportTypes: ["mobility", "physiotherapy", "injury_specific"],
    restrictedAreas: ["shoulder"],
    bodyAreas: ["shoulder"],
    supportTopics: ["shoulder_irritation"],
    phase: "warmup",
    benefit: "Improve shoulder control without loading irritated tissue.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["injury_recovery", "active_aging"],
    recoveryFit: "high"
  }),
  routine({
    name: "Band pull-apart",
    supportTypes: ["physiotherapy", "injury_specific"],
    restrictedAreas: ["shoulder", "elbow"],
    bodyAreas: ["shoulder", "elbow"],
    supportTopics: ["shoulder_irritation", "tennis_elbow"],
    phase: "warmup",
    benefit: "Reintroduce upper-back tension without heavy loading.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["injury_recovery", "active_aging", "mobility"],
    recoveryFit: "high"
  }),
  routine({
    name: "Wrist flexor glide",
    supportTypes: ["physiotherapy", "injury_specific"],
    restrictedAreas: ["elbow"],
    bodyAreas: ["wrist", "elbow"],
    supportTopics: ["carpal_tunnel", "tennis_elbow"],
    phase: "recovery",
    benefit: "Keep the forearm and wrist moving more smoothly when grip work has been irritating.",
    minutes: 4,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["injury_recovery", "mobility"],
    recoveryFit: "high"
  }),
  routine({
    name: "Dead bug breathing",
    supportTypes: ["physiotherapy", "recovery", "injury_specific"],
    restrictedAreas: ["back"],
    bodyAreas: ["back", "full_body"],
    supportTopics: ["lower_back"],
    phase: "recovery",
    benefit: "Rebuild trunk control without aggressive spinal loading.",
    minutes: 6,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["injury_recovery", "active_aging", "mobility"],
    recoveryFit: "high"
  }),
  routine({
    name: "Glute bridge hold",
    supportTypes: ["physiotherapy", "injury_specific", "recovery"],
    restrictedAreas: ["back", "hip", "knee"],
    bodyAreas: ["back", "hip", "knee"],
    supportTopics: ["lower_back", "hip_tightness", "knee_support"],
    phase: "recovery",
    benefit: "Create lower-body tension without heavy compression.",
    minutes: 6,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["injury_recovery", "active_aging", "fat_loss"],
    recoveryFit: "high"
  }),
  routine({
    name: "Shoulder mobility",
    supportTypes: ["recovery", "stretching", "injury_specific"],
    restrictedAreas: ["shoulder"],
    bodyAreas: ["shoulder"],
    supportTopics: ["shoulder_irritation"],
    phase: "recovery",
    benefit: "Keep shoulders moving cleanly between upper-body sessions.",
    minutes: 5,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["strength", "bodybuilding", "mobility"],
    recoveryFit: "high"
  })
];

const EXPANDED_MOBILITY_LIBRARY = [
  ...routineFamily("shoulder_mobility_family", [
    { name: "Banded shoulder external rotation", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["shoulder", "elbow"], bodyAreas: ["shoulder"], supportTopics: ["shoulder_irritation", "tennis_elbow"], phase: "activation", benefit: "Build cleaner shoulder rotation before pressing or upper-body rehab work.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "mobility", "active_aging"], recoveryFit: "high" },
    { name: "Sleeper stretch", supportTypes: ["stretching", "injury_specific"], restrictedAreas: ["shoulder"], bodyAreas: ["shoulder"], supportTopics: ["shoulder_irritation"], phase: "release", benefit: "Open the back of the shoulder without turning the drill into a forceful crank.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "injury_recovery"], recoveryFit: "high" },
    { name: "Scapular push-up", supportTypes: ["physiotherapy", "recovery"], restrictedAreas: ["shoulder"], bodyAreas: ["shoulder", "full_body"], supportTopics: ["shoulder_irritation"], phase: "control", benefit: "Rebuild serratus and shoulder blade control before heavier pushing.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "athletic_performance"], recoveryFit: "medium" },
    { name: "Bench thoracic opener", supportTypes: ["stretching", "recovery"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "release", benefit: "Restore extension through the upper back so overhead work feels cleaner.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" }
  ]),
  ...routineFamily("thoracic_spine_family", [
    { name: "Open book rotation", supportTypes: ["mobility", "stretching", "recovery"], restrictedAreas: ["back", "shoulder"], bodyAreas: ["back", "shoulder"], supportTopics: ["lower_back", "shoulder_irritation"], phase: "mobility", benefit: "Restore upper-back rotation so the torso moves better without forcing the lower back.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness", "active_aging"], recoveryFit: "high" },
    { name: "Foam roller thoracic extension", supportTypes: ["mobility", "recovery", "stretching"], restrictedAreas: ["back", "shoulder"], bodyAreas: ["back", "shoulder"], supportTopics: ["lower_back", "shoulder_irritation"], phase: "release", benefit: "Open upper-back extension after long sitting or pressing volume.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "bodybuilding", "general_fitness"], recoveryFit: "high" },
    { name: "Quadruped T-spine reach", supportTypes: ["physiotherapy", "recovery"], restrictedAreas: ["back", "shoulder"], bodyAreas: ["back", "shoulder"], supportTopics: ["lower_back", "shoulder_irritation"], phase: "control", benefit: "Create cleaner rotation and control through a supported position.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "mobility"], recoveryFit: "high" }
  ]),
  ...routineFamily("wrist_elbow_family", [
    { name: "Wrist extension rock", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["elbow", "wrist"], bodyAreas: ["wrist", "elbow"], supportTopics: ["carpal_tunnel", "tennis_elbow"], phase: "activation", benefit: "Gently load the wrist so pressing and gripping feel less abrupt.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "mobility"], recoveryFit: "high" },
    { name: "Forearm pronation-supination", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["elbow", "wrist"], bodyAreas: ["wrist", "elbow"], supportTopics: ["tennis_elbow", "carpal_tunnel"], phase: "control", benefit: "Restore forearm rotation with a low-stress drill you can repeat often.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "high" },
    { name: "Finger extension spread", supportTypes: ["recovery", "injury_specific"], restrictedAreas: ["wrist", "elbow"], bodyAreas: ["wrist", "elbow"], supportTopics: ["carpal_tunnel", "tennis_elbow"], phase: "release", benefit: "Offset repeated gripping and keyboard tension with a low-friction reset drill.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "injury_recovery"], recoveryFit: "high" }
  ]),
  ...routineFamily("hip_recovery_family", [
    { name: "Figure-four glute stretch", supportTypes: ["stretching", "recovery"], restrictedAreas: ["hip", "back"], bodyAreas: ["hip", "back"], supportTopics: ["hip_tightness", "lower_back"], phase: "release", benefit: "Reduce glute and hip stiffness after lower-body work or long sitting.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "fat_loss", "general_fitness"], recoveryFit: "high" },
    { name: "Adductor rock-back", supportTypes: ["mobility", "stretching", "recovery"], restrictedAreas: ["hip", "knee"], bodyAreas: ["hip", "knee"], supportTopics: ["hip_tightness", "knee_support"], phase: "mobility", benefit: "Open the inner thigh and make squat depth feel less sticky.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["strength", "mobility", "active_aging"], recoveryFit: "medium" },
    { name: "Hip airplane support", supportTypes: ["mobility", "physiotherapy", "injury_specific"], restrictedAreas: ["hip", "knee"], bodyAreas: ["hip", "knee"], supportTopics: ["hip_tightness", "knee_support"], phase: "control", benefit: "Improve hip stability and balance before single-leg work.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "athletic_performance"], recoveryFit: "medium" }
  ]),
  ...routineFamily("knee_support_family", [
    { name: "Spanish squat hold", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["knee"], bodyAreas: ["knee"], supportTopics: ["knee_support"], phase: "control", benefit: "Build quad tension in a knee-friendly way when squats feel sharp or unstable.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "medium" },
    { name: "Terminal knee extension", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["knee"], bodyAreas: ["knee"], supportTopics: ["knee_support"], phase: "activation", benefit: "Wake up the quad and finish knee extension with low joint stress.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "mobility"], recoveryFit: "high" },
    { name: "Supported step-down", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["knee", "hip"], bodyAreas: ["knee", "hip"], supportTopics: ["knee_support", "hip_tightness"], phase: "control", benefit: "Practice knee tracking with more control than a free-moving lunge.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "medium" }
  ]),
  ...routineFamily("ankle_reset_family", [
    { name: "Calf wall stretch", supportTypes: ["mobility", "stretching", "recovery"], restrictedAreas: ["ankle"], bodyAreas: ["ankle"], supportTopics: ["ankle_stiffness"], phase: "release", benefit: "Restore calf length and make knee travel smoother in squats and lunges.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" },
    { name: "Tibialis raise", supportTypes: ["physiotherapy", "recovery"], restrictedAreas: ["ankle", "knee"], bodyAreas: ["ankle", "knee"], supportTopics: ["ankle_stiffness", "knee_support"], phase: "activation", benefit: "Build lower-leg support for better deceleration and shin comfort.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["athletic_performance", "injury_recovery"], recoveryFit: "medium" },
    { name: "Ankle circle control", supportTypes: ["mobility", "recovery", "stretching"], restrictedAreas: ["ankle"], bodyAreas: ["ankle"], supportTopics: ["ankle_stiffness"], phase: "mobility", benefit: "Smooth out ankle motion before cardio, jumping, or leg training.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" }
  ]),
  ...routineFamily("neck_posture_family", [
    { name: "Chin tuck reset", supportTypes: ["recovery", "physiotherapy"], restrictedAreas: ["back", "shoulder"], bodyAreas: ["full_body"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "activation", benefit: "Bring posture back online after screen-heavy days without adding strain.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["active_aging", "mobility"], recoveryFit: "high" },
    { name: "Wall angel slide", supportTypes: ["recovery", "stretching"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "control", benefit: "Reconnect posture, rib position, and shoulder movement in one simple drill.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" }
  ]),
  ...routineFamily("full_body_recovery_family", [
    { name: "Crocodile breathing", supportTypes: ["recovery", "physiotherapy"], restrictedAreas: ["back", "full_body"], bodyAreas: ["full_body", "back"], supportTopics: ["lower_back"], phase: "release", benefit: "Downshift tension so your mobility work actually sticks instead of feeling rushed.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["recovery", "mobility", "active_aging"], recoveryFit: "high" },
    { name: "Standing reach flow", supportTypes: ["recovery"], restrictedAreas: ["full_body", "back"], bodyAreas: ["full_body", "back"], supportTopics: ["lower_back"], phase: "mobility", benefit: "Move the whole body through a simple recovery pattern when you feel stiff everywhere.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" },
    { name: "Supine twist reset", supportTypes: ["recovery"], restrictedAreas: ["back", "hip"], bodyAreas: ["back", "hip", "full_body"], supportTopics: ["lower_back", "hip_tightness"], phase: "release", benefit: "Finish the session with a lower-intensity reset for the trunk and hips.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["recovery", "mobility", "active_aging"], recoveryFit: "high" }
  ])
];

const MOBILITY_PRODUCTION_LIBRARY = [
  ...routineFamily("hip_mobility_rotation_family", [
    { name: "90/90 switch", supportTypes: ["mobility"], restrictedAreas: ["hip", "back"], bodyAreas: ["hip", "back"], supportTopics: ["hip_tightness", "lower_back"], phase: "mobility", benefit: "Switch hip rotation under control so seated and squat positions feel less sticky.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness", "active_aging"], recoveryFit: "medium" },
    { name: "Hip CARs", supportTypes: ["mobility"], restrictedAreas: ["hip"], bodyAreas: ["hip"], supportTopics: ["hip_tightness"], phase: "control", benefit: "Use controlled hip circles to improve active range without turning the drill into a stretch contest.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "athletic_performance", "general_fitness"], recoveryFit: "medium" },
    { name: "Hip flexor pulses", supportTypes: ["mobility"], restrictedAreas: ["hip", "back"], bodyAreas: ["hip", "back"], supportTopics: ["hip_tightness", "lower_back"], phase: "mobility", benefit: "Open the front of the hip with short controlled pulses instead of a long passive hold.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "medium" },
    { name: "Cossack squat mobility", supportTypes: ["mobility"], restrictedAreas: ["hip", "ankle", "knee"], bodyAreas: ["hip", "ankle", "knee"], supportTopics: ["hip_tightness", "ankle_stiffness", "knee_support"], phase: "mobility", benefit: "Build lateral hip and ankle range so side-to-side patterns feel smoother and more stable.", minutes: 6, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "athletic_performance"], recoveryFit: "medium" },
    { name: "Quadruped hip circles", supportTypes: ["mobility"], restrictedAreas: ["hip", "back"], bodyAreas: ["hip", "back"], supportTopics: ["hip_tightness", "lower_back"], phase: "control", benefit: "Create cleaner hip motion from a supported position when standing drills feel rushed or unstable.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "injury_recovery", "general_fitness"], recoveryFit: "medium" },
    { name: "Standing hip flexion drives", supportTypes: ["mobility"], restrictedAreas: ["hip"], bodyAreas: ["hip"], supportTopics: ["hip_tightness"], phase: "activation", benefit: "Drive the hip through a tall active range so running, marching, and lower-body warmups feel sharper.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "athletic_performance"], recoveryFit: "medium" }
  ]),
  ...routineFamily("ankle_mobility_family", [
    { name: "Ankle dorsiflexion rock", supportTypes: ["mobility"], restrictedAreas: ["ankle", "knee"], bodyAreas: ["ankle", "knee"], supportTopics: ["ankle_stiffness", "knee_support"], phase: "mobility", benefit: "Improve knee-over-toe range without forcing the heel up or turning the drill into a bounce.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "strength", "general_fitness"], recoveryFit: "high" },
    { name: "Ankle knee over toe drives", supportTypes: ["mobility"], restrictedAreas: ["ankle", "knee"], bodyAreas: ["ankle", "knee"], supportTopics: ["ankle_stiffness", "knee_support"], phase: "control", benefit: "Own loaded ankle range so squats, lunges, and split-stance work feel more stable.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "strength", "athletic_performance"], recoveryFit: "medium" }
  ]),
  ...routineFamily("shoulder_mobility_production_family", [
    { name: "Scapular CARs", supportTypes: ["mobility"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "control", benefit: "Improve shoulder blade motion so pressing and pulling start from a cleaner base position.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "strength", "general_fitness"], recoveryFit: "high" },
    { name: "Banded shoulder dislocates", supportTypes: ["mobility"], restrictedAreas: ["shoulder"], bodyAreas: ["shoulder"], supportTopics: ["shoulder_irritation"], phase: "mobility", benefit: "Move the shoulders through a larger pain-free arc with light band assistance and controlled ribs.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "bodybuilding", "general_fitness"], recoveryFit: "medium" },
    { name: "Shoulder CARs", supportTypes: ["mobility"], restrictedAreas: ["shoulder"], bodyAreas: ["shoulder"], supportTopics: ["shoulder_irritation"], phase: "control", benefit: "Build active end-range shoulder control one circle at a time instead of forcing speed or momentum.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "injury_recovery", "general_fitness"], recoveryFit: "medium" }
  ]),
  ...routineFamily("spine_mobility_production_family", [
    { name: "T-spine reach through", supportTypes: ["mobility"], restrictedAreas: ["back", "shoulder"], bodyAreas: ["back", "shoulder"], supportTopics: ["lower_back", "shoulder_irritation"], phase: "mobility", benefit: "Pair thoracic rotation and reach so the upper back opens without turning the lower back into the driver.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "medium" },
    { name: "Prone press-ups", supportTypes: ["mobility"], restrictedAreas: ["back", "hip"], bodyAreas: ["back", "hip"], supportTopics: ["lower_back", "hip_tightness"], phase: "mobility", benefit: "Use a gentle spinal extension drill to reduce stiffness when too much sitting leaves the front of the body locked up.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "recovery", "active_aging"], recoveryFit: "high" }
  ]),
  ...routineFamily("leg_mobility_swing_family", [
    { name: "Hamstring sweeps", supportTypes: ["mobility"], restrictedAreas: ["hip", "back"], bodyAreas: ["hip", "back"], supportTopics: ["hip_tightness", "lower_back"], phase: "activation", benefit: "Sweep through the hamstrings dynamically before sprinting, hinging, or lower-body volume.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "athletic_performance", "general_fitness"], recoveryFit: "medium" },
    { name: "Leg swings front back", supportTypes: ["mobility"], restrictedAreas: ["hip"], bodyAreas: ["hip"], supportTopics: ["hip_tightness"], phase: "activation", benefit: "Open hip flexion and extension with a simple swing pattern that wakes up the whole stride.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "athletic_performance"], recoveryFit: "medium" },
    { name: "Leg swings side to side", supportTypes: ["mobility"], restrictedAreas: ["hip"], bodyAreas: ["hip"], supportTopics: ["hip_tightness"], phase: "activation", benefit: "Prepare frontal-plane hip range before lateral movement, lunges, or field sessions.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "athletic_performance"], recoveryFit: "medium" }
  ]),
  ...routineFamily("glute_activation_mobility_family", [
    { name: "Glute activation bridge pulses", supportTypes: ["mobility"], restrictedAreas: ["hip", "back"], bodyAreas: ["hip", "back"], supportTopics: ["hip_tightness", "lower_back"], phase: "activation", benefit: "Pair glute tension with clean hip extension before hinging, sprinting, or lower-body strength work.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "strength", "general_fitness"], recoveryFit: "medium" },
    { name: "Deep squat hold mobility", supportTypes: ["mobility"], restrictedAreas: ["hip", "ankle", "back"], bodyAreas: ["hip", "ankle", "back"], supportTopics: ["hip_tightness", "ankle_stiffness", "lower_back"], phase: "control", benefit: "Own the bottom squat position with breath and support instead of collapsing or bouncing for depth.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "strength", "active_aging"], recoveryFit: "medium" }
  ]),
  ...routineFamily("neck_mobility_family", [
    { name: "Neck CARs", supportTypes: ["mobility"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "control", benefit: "Use slow neck circles to restore motion without letting the shoulders shrug or the ribcage chase the movement.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "recovery", "active_aging"], recoveryFit: "high" }
  ])
];

const STRETCH_PRODUCTION_LIBRARY = [
  ...routineFamily("posterior_chain_stretch_family", [
    { name: "Standing hamstring stretch", supportTypes: ["stretching"], restrictedAreas: ["hip", "back"], bodyAreas: ["hip", "back"], supportTopics: ["hip_tightness", "lower_back"], phase: "release", benefit: "Lengthen the back of the thigh without turning the position into a rushed toe-touch.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" },
    { name: "Supine hamstring strap stretch", supportTypes: ["stretching"], restrictedAreas: ["hip", "back"], bodyAreas: ["hip", "back"], supportTopics: ["hip_tightness", "lower_back"], phase: "release", benefit: "Use a strap to open the hamstring with less compensation through the lower back.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "active_aging"], recoveryFit: "high" },
    { name: "Seated straddle stretch", supportTypes: ["stretching"], restrictedAreas: ["hip"], bodyAreas: ["hip"], supportTopics: ["hip_tightness"], phase: "release", benefit: "Open the hamstrings and inner thighs from a stable floor position you can hold and breathe through.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" }
  ]),
  ...routineFamily("quad_hip_stretch_family", [
    { name: "Standing quad stretch", supportTypes: ["stretching"], restrictedAreas: ["hip", "knee"], bodyAreas: ["hip", "knee"], supportTopics: ["hip_tightness", "knee_support"], phase: "release", benefit: "Reduce front-of-thigh tension before it turns into a tug on the knee or low back.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" },
    { name: "Half-kneeling quad stretch", supportTypes: ["stretching"], restrictedAreas: ["hip", "knee"], bodyAreas: ["hip", "knee"], supportTopics: ["hip_tightness", "knee_support"], phase: "release", benefit: "Bias the quad and front hip together when standing holds feel too easy to cheat.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "active_aging"], recoveryFit: "high" },
    { name: "Prone quad stretch", supportTypes: ["stretching"], restrictedAreas: ["hip", "knee"], bodyAreas: ["hip", "knee"], supportTopics: ["hip_tightness", "knee_support"], phase: "release", benefit: "Open the quad from a supported floor position so you can keep the pelvis calmer during the hold.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "recovery"], recoveryFit: "high" }
  ]),
  ...routineFamily("hip_rotation_stretch_family", [
    { name: "Piriformis stretch", supportTypes: ["stretching"], restrictedAreas: ["hip", "back"], bodyAreas: ["hip", "back"], supportTopics: ["hip_tightness", "lower_back"], phase: "release", benefit: "Target the deep glute and piriformis so sitting and hinging feel less pinched.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" },
    { name: "Seated glute stretch", supportTypes: ["stretching"], restrictedAreas: ["hip", "back"], bodyAreas: ["hip", "back"], supportTopics: ["hip_tightness", "lower_back"], phase: "release", benefit: "Use a seated setup to stretch the glute without needing to manage balance or floor transitions.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "active_aging"], recoveryFit: "high" },
    { name: "Lying groin stretch", supportTypes: ["stretching"], restrictedAreas: ["hip"], bodyAreas: ["hip"], supportTopics: ["hip_tightness"], phase: "release", benefit: "Let the hips relax into a supported groin stretch when seated positions feel too aggressive.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "recovery"], recoveryFit: "high" },
    { name: "Frog adductor stretch", supportTypes: ["stretching"], restrictedAreas: ["hip", "knee"], bodyAreas: ["hip", "knee"], supportTopics: ["hip_tightness", "knee_support"], phase: "release", benefit: "Open the adductors with a broad-knee stretch that favors stillness over rocking or forcing range.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" },
    { name: "Seated adductor stretch", supportTypes: ["stretching"], restrictedAreas: ["hip"], bodyAreas: ["hip"], supportTopics: ["hip_tightness"], phase: "release", benefit: "Target the inner thigh directly so wide-stance work and squat depth feel less restricted.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" },
    { name: "Seated butterfly stretch", supportTypes: ["stretching"], restrictedAreas: ["hip"], bodyAreas: ["hip"], supportTopics: ["hip_tightness"], phase: "release", benefit: "Use a simple butterfly hold to ease inner-thigh tension without adding spinal strain.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "active_aging"], recoveryFit: "high" }
  ]),
  ...routineFamily("shoulder_chest_stretch_family", [
    { name: "Doorway pec stretch", supportTypes: ["stretching"], restrictedAreas: ["shoulder"], bodyAreas: ["shoulder"], supportTopics: ["shoulder_irritation"], phase: "release", benefit: "Open the chest and front shoulder so pressing posture and arm swing feel less rounded forward.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" },
    { name: "Wall pec minor stretch", supportTypes: ["stretching"], restrictedAreas: ["shoulder"], bodyAreas: ["shoulder"], supportTopics: ["shoulder_irritation"], phase: "release", benefit: "Bias the pec minor and front shoulder in a tighter angle than a standard doorway hold.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "bodybuilding"], recoveryFit: "high" },
    { name: "Cross-body shoulder stretch", supportTypes: ["stretching"], restrictedAreas: ["shoulder"], bodyAreas: ["shoulder"], supportTopics: ["shoulder_irritation"], phase: "release", benefit: "Reduce back-of-shoulder tightness with a stable cross-body hold you can control easily.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" },
    { name: "Posterior capsule stretch", supportTypes: ["stretching"], restrictedAreas: ["shoulder"], bodyAreas: ["shoulder"], supportTopics: ["shoulder_irritation"], phase: "release", benefit: "Target the posterior capsule gently when internal rotation and reach-behind positions feel sticky.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "injury_recovery"], recoveryFit: "high" },
    { name: "Overhead triceps stretch", supportTypes: ["stretching"], restrictedAreas: ["shoulder", "elbow"], bodyAreas: ["shoulder", "elbow"], supportTopics: ["shoulder_irritation", "tennis_elbow"], phase: "release", benefit: "Open the triceps and long head connection through the shoulder without turning the ribs up.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" },
    { name: "Doorframe biceps stretch", supportTypes: ["stretching"], restrictedAreas: ["shoulder", "elbow"], bodyAreas: ["shoulder", "elbow"], supportTopics: ["shoulder_irritation", "tennis_elbow"], phase: "release", benefit: "Lengthen the biceps and front shoulder together when repeated pulling leaves the arm feeling bound up.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "bodybuilding"], recoveryFit: "high" }
  ]),
  ...routineFamily("lat_sidebody_stretch_family", [
    { name: "Overhead lat stretch", supportTypes: ["stretching"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "release", benefit: "Open the lats overhead so reaching and front-rack positions stop pulling the torso off line.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" },
    { name: "Towel lat stretch", supportTypes: ["stretching"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "release", benefit: "Use a towel anchor to create a cleaner lat stretch without letting the ribs flare or the lower back take over.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "recovery"], recoveryFit: "high" },
    { name: "Bench-assisted lat stretch", supportTypes: ["stretching"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "release", benefit: "Support the torso on a bench so the lats can lengthen without the position getting sloppy.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "bodybuilding"], recoveryFit: "high" },
    { name: "Overhead side bend stretch", supportTypes: ["stretching"], restrictedAreas: ["back", "shoulder"], bodyAreas: ["back", "shoulder"], supportTopics: ["lower_back", "shoulder_irritation"], phase: "release", benefit: "Lengthen the side body and lats with a calmer overhead line than a dynamic reach drill.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" },
    { name: "Standing side-body reach stretch", supportTypes: ["stretching"], restrictedAreas: ["back", "shoulder"], bodyAreas: ["back", "shoulder"], supportTopics: ["lower_back", "shoulder_irritation"], phase: "release", benefit: "Use a tall standing reach to open the side body when you want a simple reset between training blocks.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "active_aging"], recoveryFit: "high" }
  ]),
  ...routineFamily("neck_upper_back_stretch_family", [
    { name: "Neck side stretch", supportTypes: ["stretching"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "release", benefit: "Reduce side-neck tension from screens and shrugging before it spreads into the upper trap.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "recovery"], recoveryFit: "high" },
    { name: "Upper trap stretch", supportTypes: ["stretching"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "release", benefit: "Calm the upper trap with a still hold that does not ask the shoulder to do extra work.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "recovery"], recoveryFit: "high" },
    { name: "Levator scapulae stretch", supportTypes: ["stretching"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "release", benefit: "Open the back of the neck and shoulder blade line when turning the head or setting posture feels stiff.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "recovery"], recoveryFit: "high" }
  ]),
  ...routineFamily("forearm_wrist_stretch_family", [
    { name: "Wrist flexor stretch", supportTypes: ["stretching"], restrictedAreas: ["wrist", "elbow"], bodyAreas: ["wrist", "elbow"], supportTopics: ["carpal_tunnel", "tennis_elbow"], phase: "release", benefit: "Lengthen the palm-side forearm tissues after gripping, typing, or repeated pressing.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "recovery"], recoveryFit: "high" },
    { name: "Wrist extensor stretch", supportTypes: ["stretching"], restrictedAreas: ["wrist", "elbow"], bodyAreas: ["wrist", "elbow"], supportTopics: ["carpal_tunnel", "tennis_elbow"], phase: "release", benefit: "Open the top of the forearm when repeated pulling or mouse work leaves the wrist feeling locked up.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "recovery"], recoveryFit: "high" },
    { name: "Seated forearm flexor stretch", supportTypes: ["stretching"], restrictedAreas: ["wrist", "elbow"], bodyAreas: ["wrist", "elbow"], supportTopics: ["carpal_tunnel", "tennis_elbow"], phase: "release", benefit: "Use a seated support position to stretch the wrist flexors with less body tension.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "active_aging"], recoveryFit: "high" },
    { name: "Seated forearm extensor stretch", supportTypes: ["stretching"], restrictedAreas: ["wrist", "elbow"], bodyAreas: ["wrist", "elbow"], supportTopics: ["carpal_tunnel", "tennis_elbow"], phase: "release", benefit: "Target the extensor side of the forearm from a calm seated hold that is easy to repeat often.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "active_aging"], recoveryFit: "high" }
  ]),
  ...routineFamily("lower_body_accessory_stretch_family", [
    { name: "Knees-to-chest stretch", supportTypes: ["stretching"], restrictedAreas: ["back", "hip"], bodyAreas: ["back", "hip"], supportTopics: ["lower_back", "hip_tightness"], phase: "release", benefit: "Relax the lower back and hips with a supported hold that is easy to use after hard sessions.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "recovery"], recoveryFit: "high" },
    { name: "IT band stretch", supportTypes: ["stretching"], restrictedAreas: ["hip", "knee"], bodyAreas: ["hip", "knee"], supportTopics: ["hip_tightness", "knee_support"], phase: "release", benefit: "Lengthen the outer hip and side thigh line when lateral work or running leaves that chain feeling dense.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "athletic_performance"], recoveryFit: "high" },
    { name: "Soleus wall stretch", supportTypes: ["stretching"], restrictedAreas: ["ankle", "knee"], bodyAreas: ["ankle", "knee"], supportTopics: ["ankle_stiffness", "knee_support"], phase: "release", benefit: "Bias the lower calf with a bent-knee wall stretch that helps loaded ankle travel feel smoother.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "strength"], recoveryFit: "high" },
    { name: "Kneeling shin stretch", supportTypes: ["stretching"], restrictedAreas: ["ankle", "knee"], bodyAreas: ["ankle", "knee"], supportTopics: ["ankle_stiffness", "knee_support"], phase: "release", benefit: "Open the front of the ankle and shin when toe-pointed positions feel cramped or stiff.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "active_aging"], recoveryFit: "high" }
  ]),
  ...routineFamily("posture_opening_stretch_family", [
    { name: "Seated chest opener stretch", supportTypes: ["stretching"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "release", benefit: "Open the chest from a seated base when standing posture drills feel too unstable or rushed.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "active_aging"], recoveryFit: "high" }
  ])
];

const REHAB_PRODUCTION_LIBRARY = [
  ...routineFamily("shoulder_rehab_family", [
    { name: "Band pull-apart corrective", supportTypes: ["physiotherapy"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "activation", benefit: "Use a light pull-apart to reconnect posture, scapular control, and shoulder-friendly pulling without heavy strain.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "high" },
    { name: "Banded shoulder external rotation rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["shoulder", "elbow"], bodyAreas: ["shoulder", "elbow"], supportTopics: ["shoulder_irritation", "tennis_elbow"], phase: "activation", benefit: "Build cleaner cuff activation before pressing or overhead work with a low-load band pattern.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "mobility"], recoveryFit: "high" },
    { name: "Sidelying shoulder external rotation rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["shoulder"], bodyAreas: ["shoulder"], supportTopics: ["shoulder_irritation"], phase: "control", benefit: "Train the rotator cuff in a supported sidelying setup so motion stays precise and low risk.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "high" },
    { name: "Isometric shoulder external rotation hold", supportTypes: ["physiotherapy"], restrictedAreas: ["shoulder"], bodyAreas: ["shoulder"], supportTopics: ["shoulder_irritation"], phase: "control", benefit: "Use a low-motion cuff isometric when the shoulder needs tension tolerance without repeated reps.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Scapular wall slide reach", supportTypes: ["physiotherapy"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "control", benefit: "Teach upward rotation and reach with the ribs under control so the shoulder blade can move cleanly.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "mobility"], recoveryFit: "high" },
    { name: "Serratus wall press", supportTypes: ["physiotherapy"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "activation", benefit: "Target serratus function with a quiet wall press instead of asking the shoulder to stabilize under bodyweight.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Supported shoulder flexion slide", supportTypes: ["physiotherapy"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "mobility", benefit: "Restore overhead reach through a low-friction slide that keeps the trunk and shoulder aligned.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "high" },
    { name: "Prone Y raise rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "activation", benefit: "Wake up lower-trap support in a controlled prone setup before asking the shoulder to handle bigger ranges.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "medium" },
    { name: "Shoulder internal rotation isometric", supportTypes: ["physiotherapy"], restrictedAreas: ["shoulder"], bodyAreas: ["shoulder"], supportTopics: ["shoulder_irritation"], phase: "control", benefit: "Build pain-free cuff tension on the internal rotation side without needing a large movement arc.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Scaption raise rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["shoulder"], bodyAreas: ["shoulder"], supportTopics: ["shoulder_irritation"], phase: "control", benefit: "Train the shoulder in the scapular plane with a light corrective raise that favors alignment over load.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "medium" }
  ]),
  ...routineFamily("knee_rehab_family", [
    { name: "Quad set", supportTypes: ["physiotherapy"], restrictedAreas: ["knee"], bodyAreas: ["knee"], supportTopics: ["knee_support"], phase: "activation", benefit: "Rebuild quad awareness around the knee joint when higher-load extension work is not ready yet.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "high" },
    { name: "Straight-leg raise rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["knee", "hip"], bodyAreas: ["knee", "hip"], supportTopics: ["knee_support", "hip_tightness"], phase: "control", benefit: "Train hip flexion and quad tension together without asking the knee to manage deep flexion.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Heel slide rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["knee", "hip"], bodyAreas: ["knee", "hip"], supportTopics: ["knee_support", "hip_tightness"], phase: "mobility", benefit: "Recover gentle knee flexion range through a supported heel slide that stays easy to control.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Short-arc quad", supportTypes: ["physiotherapy"], restrictedAreas: ["knee"], bodyAreas: ["knee"], supportTopics: ["knee_support"], phase: "activation", benefit: "Strengthen the terminal part of knee extension without loading the joint through a large range.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Terminal knee extension rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["knee"], bodyAreas: ["knee"], supportTopics: ["knee_support"], phase: "activation", benefit: "Use a band-assisted finish to knee extension when the final range still feels uncertain or weak.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "mobility"], recoveryFit: "high" },
    { name: "Spanish squat hold rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["knee"], bodyAreas: ["knee"], supportTopics: ["knee_support"], phase: "control", benefit: "Build quad tolerance in a supported squat hold that limits shear and keeps the torso upright.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "medium" },
    { name: "Supported step-down rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["knee", "hip"], bodyAreas: ["knee", "hip"], supportTopics: ["knee_support", "hip_tightness"], phase: "control", benefit: "Practice knee tracking and controlled lowering with support so the pattern stays pain-aware.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "medium" },
    { name: "Supported sit-to-stand rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["knee", "hip"], bodyAreas: ["knee", "hip"], supportTopics: ["knee_support", "hip_tightness"], phase: "control", benefit: "Rehearse a daily-life squat pattern with just enough assistance to keep the movement confident and repeatable.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "high" }
  ]),
  ...routineFamily("hip_rehab_family", [
    { name: "Clamshell rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["hip", "knee"], bodyAreas: ["hip", "knee"], supportTopics: ["hip_tightness", "knee_support"], phase: "activation", benefit: "Target lateral hip support when single-leg control breaks down or the knee drifts inward.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Sidelying hip abduction rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["hip", "knee"], bodyAreas: ["hip", "knee"], supportTopics: ["hip_tightness", "knee_support"], phase: "control", benefit: "Build glute med strength in a supported position before progressing to standing balance demands.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Glute med wall press", supportTypes: ["physiotherapy"], restrictedAreas: ["hip", "knee"], bodyAreas: ["hip", "knee"], supportTopics: ["hip_tightness", "knee_support"], phase: "activation", benefit: "Create lateral hip tension in standing without forcing a long or unstable balance drill.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "high" },
    { name: "Bridge march rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["hip", "back"], bodyAreas: ["hip", "back"], supportTopics: ["hip_tightness", "lower_back"], phase: "control", benefit: "Challenge pelvic control one leg at a time while keeping the load low and the range small.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "medium" },
    { name: "Supported hip airplane hold", supportTypes: ["physiotherapy"], restrictedAreas: ["hip", "knee"], bodyAreas: ["hip", "knee"], supportTopics: ["hip_tightness", "knee_support"], phase: "control", benefit: "Use a supported hip airplane to rebuild rotational control without asking for a big balance demand.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "medium" },
    { name: "Banded hip abduction hold", supportTypes: ["physiotherapy"], restrictedAreas: ["hip", "knee"], bodyAreas: ["hip", "knee"], supportTopics: ["hip_tightness", "knee_support"], phase: "activation", benefit: "Use a low-load band hold to wake up the outer hip before gait, stairs, or single-leg work.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Seated hip internal rotation rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["hip"], bodyAreas: ["hip"], supportTopics: ["hip_tightness"], phase: "mobility", benefit: "Restore active hip internal rotation in a seated setup that limits compensation through the spine.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "mobility"], recoveryFit: "high" },
    { name: "Standing hip extension rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["hip", "back"], bodyAreas: ["hip", "back"], supportTopics: ["hip_tightness", "lower_back"], phase: "control", benefit: "Train hip extension in standing while keeping the lower back quiet and the movement small.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "high" }
  ]),
  ...routineFamily("ankle_rehab_family", [
    { name: "Heel-to-toe rocker", supportTypes: ["physiotherapy"], restrictedAreas: ["ankle"], bodyAreas: ["ankle"], supportTopics: ["ankle_stiffness"], phase: "mobility", benefit: "Restore smooth weight transfer through the foot before longer walks, stairs, or gait drills.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "high" },
    { name: "Ankle alphabet control", supportTypes: ["physiotherapy"], restrictedAreas: ["ankle"], bodyAreas: ["ankle"], supportTopics: ["ankle_stiffness"], phase: "control", benefit: "Use controlled ankle tracing to rebuild small-range awareness after stiffness or a mild sprain history.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Banded ankle eversion", supportTypes: ["physiotherapy"], restrictedAreas: ["ankle"], bodyAreas: ["ankle"], supportTopics: ["ankle_stiffness"], phase: "activation", benefit: "Train the outer ankle gently so side-to-side support improves without impact or instability.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Banded ankle inversion", supportTypes: ["physiotherapy"], restrictedAreas: ["ankle"], bodyAreas: ["ankle"], supportTopics: ["ankle_stiffness"], phase: "activation", benefit: "Build medial ankle control with a light band when the foot still feels shaky or underpowered.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Single-leg balance reach rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["ankle", "knee"], bodyAreas: ["ankle", "knee"], supportTopics: ["ankle_stiffness", "knee_support"], phase: "control", benefit: "Rebuild balance and foot control with a low-amplitude reach pattern that stays slower than athletic balance drills.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "medium" },
    { name: "Seated calf raise rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["ankle"], bodyAreas: ["ankle"], supportTopics: ["ankle_stiffness"], phase: "activation", benefit: "Use a seated calf raise to reintroduce plantarflexion work without full bodyweight loading.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "medium" },
    { name: "Tibialis raise rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["ankle", "knee"], bodyAreas: ["ankle", "knee"], supportTopics: ["ankle_stiffness", "knee_support"], phase: "activation", benefit: "Build front-shin support so gait and deceleration mechanics feel steadier without impact.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "medium" },
    { name: "Low box calf lowering rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["ankle", "knee"], bodyAreas: ["ankle", "knee"], supportTopics: ["ankle_stiffness", "knee_support"], phase: "control", benefit: "Use a small eccentric calf lower to rebuild tendon tolerance with a conservative step height.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "medium" }
  ]),
  ...routineFamily("low_back_rehab_family", [
    { name: "Dead bug breathing rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["back", "full_body"], bodyAreas: ["back", "full_body"], supportTopics: ["lower_back"], phase: "control", benefit: "Pair abdominal bracing and breathing so the trunk learns support without rigid gripping.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "high" },
    { name: "Crocodile breathing rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["back", "full_body"], bodyAreas: ["back", "full_body"], supportTopics: ["lower_back"], phase: "release", benefit: "Use low-stress breathing to calm guarding through the trunk before you ask for more movement.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "recovery"], recoveryFit: "high" },
    { name: "Quadruped rock-back rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["back", "hip"], bodyAreas: ["back", "hip"], supportTopics: ["lower_back", "hip_tightness"], phase: "mobility", benefit: "Restore hip-dominant folding without loading the lower back into end range too quickly.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "mobility"], recoveryFit: "high" },
    { name: "Bird-dog hold rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["back", "full_body"], bodyAreas: ["back", "full_body"], supportTopics: ["lower_back"], phase: "control", benefit: "Train anti-rotation trunk control with slower holds instead of high-rep limb movement.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "McGill curl-up", supportTypes: ["physiotherapy"], restrictedAreas: ["back", "full_body"], bodyAreas: ["back", "full_body"], supportTopics: ["lower_back"], phase: "control", benefit: "Build low-load anterior trunk endurance without repeated spinal flexion volume.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Bent-knee fallout", supportTypes: ["physiotherapy"], restrictedAreas: ["back", "hip"], bodyAreas: ["back", "hip"], supportTopics: ["lower_back", "hip_tightness"], phase: "control", benefit: "Use a small hip opening pattern to train pelvic control while the lower back stays quiet.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Supine march bracing", supportTypes: ["physiotherapy"], restrictedAreas: ["back", "full_body"], bodyAreas: ["back", "full_body"], supportTopics: ["lower_back"], phase: "control", benefit: "Rehearse marching under abdominal brace so gait and trunk control connect without speed.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "high" },
    { name: "Side plank from knees", supportTypes: ["physiotherapy"], restrictedAreas: ["back", "hip"], bodyAreas: ["back", "hip"], supportTopics: ["lower_back", "hip_tightness"], phase: "control", benefit: "Build lateral trunk support from a lower-risk side plank that shortens the lever and keeps alignment cleaner.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "medium" }
  ]),
  ...routineFamily("posture_cervical_rehab_family", [
    { name: "Chin tuck reset rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "activation", benefit: "Use a simple chin tuck to restore stacked head posture before neck tension spreads downward.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "high" },
    { name: "Seated chin nod", supportTypes: ["physiotherapy"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "control", benefit: "Train deep neck flexor control with a tiny nod instead of a larger head movement.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Wall posture hold", supportTypes: ["physiotherapy"], restrictedAreas: ["shoulder", "back", "full_body"], bodyAreas: ["shoulder", "back", "full_body"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "control", benefit: "Rebuild stacked posture awareness against the wall so ribs, head, and pelvis learn a calmer starting position.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "high" },
    { name: "Cervical rotation isometric", supportTypes: ["physiotherapy"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "control", benefit: "Use low-force rotational resistance when turning the head needs tolerance more than extra range.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Seated thoracic extension support", supportTypes: ["physiotherapy"], restrictedAreas: ["back", "shoulder"], bodyAreas: ["back", "shoulder"], supportTopics: ["lower_back", "shoulder_irritation"], phase: "mobility", benefit: "Create supported thoracic extension so upper-back motion improves without pushing the lower back into the job.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "mobility"], recoveryFit: "high" }
  ]),
  ...routineFamily("wrist_elbow_rehab_family", [
    { name: "Wrist extension rock rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["wrist", "elbow"], bodyAreas: ["wrist", "elbow"], supportTopics: ["carpal_tunnel", "tennis_elbow"], phase: "mobility", benefit: "Load wrist extension lightly so pressing positions stop feeling abrupt or fragile.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Forearm pronation-supination rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["wrist", "elbow"], bodyAreas: ["wrist", "elbow"], supportTopics: ["carpal_tunnel", "tennis_elbow"], phase: "control", benefit: "Restore forearm rotation through a small-range drill that keeps the wrist and elbow calm.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "high" },
    { name: "Finger extension spread rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["wrist", "elbow"], bodyAreas: ["wrist", "elbow"], supportTopics: ["carpal_tunnel", "tennis_elbow"], phase: "activation", benefit: "Offset repeated gripping with controlled finger opening so the hand and forearm do not stay locked down all day.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Towel grip isometric", supportTypes: ["physiotherapy"], restrictedAreas: ["wrist", "elbow"], bodyAreas: ["wrist", "elbow"], supportTopics: ["carpal_tunnel", "tennis_elbow"], phase: "control", benefit: "Build low-threat grip tolerance with an isometric towel squeeze instead of heavy carries or curls.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Wrist radial deviation rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["wrist", "elbow"], bodyAreas: ["wrist", "elbow"], supportTopics: ["carpal_tunnel", "tennis_elbow"], phase: "control", benefit: "Train controlled side-to-side wrist support when gripping and reaching still feel uncertain.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" }
  ]),
  ...routineFamily("core_stability_rehab_family", [
    { name: "Tall-kneeling anti-rotation hold", supportTypes: ["physiotherapy"], restrictedAreas: ["back", "full_body"], bodyAreas: ["back", "full_body"], supportTopics: ["lower_back"], phase: "control", benefit: "Train trunk stiffness and posture in tall kneeling without the momentum of standing resistance work.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "medium" },
    { name: "Heel tap dead bug", supportTypes: ["physiotherapy"], restrictedAreas: ["back", "full_body"], bodyAreas: ["back", "full_body"], supportTopics: ["lower_back"], phase: "control", benefit: "Use a lighter dead-bug progression when full leg extension still breaks your brace or flares symptoms.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "high" },
    { name: "Pallof press rehab", supportTypes: ["physiotherapy"], restrictedAreas: ["back", "full_body"], bodyAreas: ["back", "full_body"], supportTopics: ["lower_back"], phase: "control", benefit: "Build anti-rotation control with a slow press instead of a heavy resistance movement that invites compensation.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery"], recoveryFit: "medium" }
  ])
];

const YOGA_PRODUCTION_LIBRARY = YOGA_PRODUCTION_LIST.map((pose) => createYogaProductionRoutine(pose));

const RAW_MOBILITY_LIBRARY = [...BASE_MOBILITY_LIBRARY, ...EXPANDED_MOBILITY_LIBRARY, ...MOBILITY_PRODUCTION_LIBRARY, ...STRETCH_PRODUCTION_LIBRARY, ...REHAB_PRODUCTION_LIBRARY, ...YOGA_PRODUCTION_LIBRARY];
const MOBILITY_LIBRARY = validateLibraryEntries(RAW_MOBILITY_LIBRARY, "mobility catalog").map((entry) => {
  const rawEntry = RAW_MOBILITY_LIBRARY.find((candidate) => candidate.id === entry.id);
  return {
    ...entry,
    ...(rawEntry || {})
  };
});

export function buildMobilityPlan({ goalType, injuryStatus, restrictedAreas, lowRecovery, workoutEnvironment }) {
  const selectedCategory =
    injuryStatus !== "none"
      ? "physiotherapy"
      : goalType === "mobility"
        ? "mobility"
        : lowRecovery
          ? "recovery"
          : "stretching";
  const library = buildMobilitySessionSet({
    category: selectedCategory,
    injuryArea: restrictedAreas?.[0] || "all",
    goalType,
    timeCap: lowRecovery ? 10 : 15,
    trainingEnvironment: workoutEnvironment,
    recoveryStatus: lowRecovery ? "low" : "steady",
    restrictedAreas,
    injuryStatus
  });
  const warmup = library.guidedBlock.filter((item) => item.group === "activation").slice(0, 2);
  const cooldown = library.guidedBlock.filter((item) => item.group === "release").slice(0, 2);
  const recoveryDay = dedupeByName([
    ...library.guidedBlock.filter((item) => item.phase === "recovery"),
    ...filterMobilityLibrary({
      category: "recovery",
      injuryArea: restrictedAreas?.[0] || "all",
      goalType,
      timeCap: 12,
      trainingEnvironment: workoutEnvironment,
      recoveryStatus: "low",
      restrictedAreas,
      injuryStatus
    })
  ]).slice(0, 3);

  return {
    title:
      injuryStatus === "active_injury"
        ? "Use a physiotherapy-style recovery flow that respects the areas you need to protect"
        : goalType === "mobility"
          ? "Use guided movement as a real part of the training week"
          : lowRecovery
            ? "Lean on recovery mobility instead of forcing more load"
            : "Use targeted stretching and movement prep to make training feel better this week",
    reason:
      injuryStatus === "active_injury"
        ? "The mobility block stays supportive and educational so you can keep moving without pretending everything is fine."
        : goalType === "mobility"
          ? "Mobility is the goal, so the week needs a clearer movement practice instead of a few random drills."
          : lowRecovery
            ? "Recovery is softer right now, so low-stress movement gives you the safest win."
            : "A short guided mobility layer before and after training improves how the whole week feels.",
    warmup,
    cooldown,
    recoveryDay,
    weeklyTarget:
      goalType === "mobility" || injuryStatus !== "none"
        ? "Aim for 4-5 guided mobility touchpoints this week."
        : "Aim for 3 guided mobility touchpoints this week.",
    category: selectedCategory,
    guidedBlock: library.guidedBlock,
    additionalPool: library.additionalPool,
    sessionName: library.sessionName
  };
}

export function buildMobilityModule({ goalType, injuryStatus, restrictedAreas, lowRecovery, trainingEnvironment, planContext = null }) {
  const suggestedCategory =
    injuryStatus !== "none"
      ? "physiotherapy"
      : goalType === "mobility"
        ? "mobility"
        : lowRecovery
          ? "recovery"
          : "stretching";

  const sessionSet = buildMobilitySessionSet({
    category: suggestedCategory,
    injuryArea: restrictedAreas?.[0] || "all",
    goalType,
    timeCap: lowRecovery ? 10 : 15,
    trainingEnvironment,
    recoveryStatus: lowRecovery ? "low" : "steady",
    restrictedAreas,
    injuryStatus
  });

  return {
    title: planContext?.weeklyFocus ? `${planContext.weeklyFocus} support` : "Guided mobility support",
    description:
      planContext?.mobilityTarget
        ? `${planContext.mobilityTarget} Choose dynamic mobility, yoga, stretching, physiotherapy-style drills, or recovery mobility based on how you feel and what part of the body needs support.`
        : "Choose dynamic mobility, yoga, stretching, physiotherapy-style drills, or recovery mobility based on how you feel and what part of the body needs support.",
    suggestedCategory,
    sessionName: sessionSet.sessionName,
    categories: MOBILITY_CATEGORIES,
    library: MOBILITY_LIBRARY,
    suggestedFlow: sessionSet.guidedBlock,
    additionalPool: sessionSet.additionalPool,
    filterOptions: {
      areaOptions: AREA_OPTIONS,
      injurySupportOptions: INJURY_SUPPORT_OPTIONS,
      difficultyOptions: [
        { value: "all", label: "Any difficulty" },
        { value: "beginner", label: "Beginner" },
        { value: "intermediate", label: "Intermediate" }
      ],
      equipmentOptions: [
        { value: "all", label: "Any equipment" },
        { value: "none", label: "No equipment" },
        { value: "light", label: "Light equipment" }
      ],
      timeOptions: [
        { value: "5", label: "5 min" },
        { value: "10", label: "10 min" },
        { value: "15", label: "15 min" },
        { value: "20", label: "20 min" }
      ],
      recoveryOptions: [
        { value: "all", label: "Any recovery state" },
        { value: "low", label: "Low recovery" },
        { value: "steady", label: "Steady recovery" }
      ]
    }
  };
}

export function buildMobilitySessionSet({
  category = "stretching",
  injuryArea = "all",
  goalType = "general_fitness",
  timeCap = 15,
  trainingEnvironment = "hybrid",
  recoveryStatus = "all",
  restrictedAreas = [],
  injuryStatus = "none"
}) {
  const primary = filterMobilityLibrary({
    category,
    injuryArea,
    goalType,
    timeCap,
    trainingEnvironment,
    recoveryStatus,
    restrictedAreas,
    injuryStatus
  });
  const guidedBlock = ensureMobilityMinimum(primary, {
    category,
    injuryArea,
    goalType,
    timeCap,
    trainingEnvironment,
    recoveryStatus,
    restrictedAreas,
    injuryStatus
  }).slice(0, 6);
  const additionalPool = dedupeByName([
    ...primary.slice(guidedBlock.length),
    ...MOBILITY_LIBRARY.filter((entry) => !guidedBlock.some((selected) => selected.name === entry.name))
  ]);

  return {
    guidedBlock,
    additionalPool,
    sessionName: buildMobilitySessionName(category, injuryArea, recoveryStatus)
  };
}

export function filterMobilityLibrary({
  category = "mobility",
  injuryArea = "all",
  goalType = "general_fitness",
  timeCap = 15,
  trainingEnvironment = "hybrid",
  recoveryStatus = "all",
  restrictedAreas = [],
  injuryStatus = "none"
}) {
  const normalizedTimeCap = Number(timeCap) || 15;
  const requestedEnvironment = trainingEnvironment === "hybrid" ? "hybrid" : trainingEnvironment;

  return dedupeByName(
    MOBILITY_LIBRARY.filter((item) => {
      if (!item.supportTypes.includes(category)) {
        return false;
      }
      if (category === "mobility" && item.sourceType !== MOBILITY_SOURCE_TYPES.production) {
        return false;
      }
      if (category === "stretching" && item.sourceType !== STRETCH_SOURCE_TYPE) {
        return false;
      }
      if (category === "physiotherapy" && item.sourceType !== REHAB_SOURCE_TYPE) {
        return false;
      }
      if (category === "yoga" && item.sourceType !== "yoga_production") {
        return false;
      }
      if (item.minutes > normalizedTimeCap) {
        return false;
      }
      if (
        requestedEnvironment !== "hybrid" &&
        !item.environments.includes(requestedEnvironment) &&
        !item.environments.includes("hybrid")
      ) {
        return false;
      }
      if (
        injuryArea !== "all" &&
        !item.restrictedAreas.includes(injuryArea) &&
        !item.bodyAreas.includes(injuryArea) &&
        !item.supportTopics.includes(normalizeSupportTopic(injuryArea))
      ) {
        return false;
      }
      if (recoveryStatus === "low" && item.recoveryFit === "low") {
        return false;
      }
      if (recoveryStatus === "steady" && item.recoveryFit === "high" && item.phase === "recovery") {
        return false;
      }
      if (category === "injury_specific" && injuryStatus === "none" && restrictedAreas.length === 0 && injuryArea === "all") {
        return false;
      }

      return true;
    }).sort((left, right) => scoreRoutine(right, { goalType, restrictedAreas, recoveryStatus, injuryArea }) - scoreRoutine(left, { goalType, restrictedAreas, recoveryStatus, injuryArea }))
  );
}

function routineFamily(familyId, entries) {
  return entries.map((entry) => routine({ ...entry, familyId }));
}

function routine({ name, supportTypes, restrictedAreas, bodyAreas, supportTopics, phase, benefit, minutes, environments, goalTags, recoveryFit, familyId = null, sourceType = null }) {
  const movement = findMovementForName(name);
  const entryId = name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
  const resolvedSourceType =
    sourceType ||
    (REHAB_PRODUCTION_NAMES.has(name)
      ? REHAB_SOURCE_TYPE
      : STRETCH_PRODUCTION_NAMES.has(name)
        ? STRETCH_SOURCE_TYPE
        : MOBILITY_PRODUCTION_NAMES.has(name)
          ? MOBILITY_SOURCE_TYPES.production
          : MOBILITY_SOURCE_TYPES.library);
  const mediaMovementId = movement?.id || entryId;
  const visualCategory =
    resolvedSourceType === REHAB_SOURCE_TYPE
      ? "rehab"
      : supportTypes.includes("yoga")
        ? "yoga"
        : supportTypes.includes("mobility")
          ? "mobility"
          : "stretch";
  const movementType =
    resolvedSourceType === REHAB_SOURCE_TYPE
      ? "corrective rehab"
      : resolvedSourceType === STRETCH_SOURCE_TYPE
        ? "static stretch"
        : "dynamic mobility";
  const difficulty =
    resolvedSourceType === REHAB_SOURCE_TYPE
      ? recoveryFit === "high"
        ? "beginner"
        : "intermediate"
      : resolvedSourceType === STRETCH_SOURCE_TYPE
      ? recoveryFit === "high"
        ? "beginner"
        : "intermediate"
      : recoveryFit === "high"
        ? "beginner"
        : "intermediate";
  const equipmentProfile =
    (movement?.equipment || []).length && !movement.equipment.includes("bodyweight")
      ? "light"
      : inferSupportEquipmentProfile(entryId, resolvedSourceType);
  const group =
    phase === "warmup" || phase === "activation"
      ? "activation"
      : phase === "cooldown" || phase === "release"
        ? "release"
        : phase === "recovery" || phase === "control"
          ? "control"
          : "mobility";
  const resolvedFamilyId = familyId || supportTopics[0] || bodyAreas[0] || "general";
  const resolvedSupportTopics = expandSupportTopics(supportTopics);
  const content =
    resolvedSourceType === REHAB_SOURCE_TYPE
      ? buildRehabContentStandard({ name, bodyAreas, supportTopics, benefit, group })
      : resolvedSourceType === STRETCH_SOURCE_TYPE
        ? buildStretchContentStandard({ name, bodyAreas, supportTopics, benefit })
        : buildMobilityContentStandard({ name, bodyAreas, supportTopics, benefit, group });
  const media = createMediaPayload(
    buildExerciseMediaSpec({
      id: mediaMovementId,
      name,
      familyId: resolvedFamilyId,
      trainingType: "mobility",
      fallbackImage: movement?.image || null
    })
  );

  const entry = createLibraryEntry({
    id: entryId,
    name,
    mode: "mobility",
    category: phase,
    primaryMuscleGroup: bodyAreas[0] || "full_body",
    secondaryMuscleGroups: bodyAreas.slice(1),
    movementPattern: group,
    equipmentRequirements: movement?.equipment || ["bodyweight"],
    difficultyLevel: difficulty,
    trainingGoals: goalTags,
    jointStressLevel: recoveryFit === "high" ? "low" : "moderate",
    rehabSafe: supportTypes.includes("physiotherapy") || supportTypes.includes("injury_specific"),
    environments,
    mobilityCategory: supportTypes[0],
    bodyAreaFocus: bodyAreas,
    injurySupportType: resolvedSupportTopics,
    intensityProfile: recoveryFit,
    variationFamily: resolvedSupportTopics[0] || bodyAreas[0] || "general",
    familyIds: [resolvedFamilyId],
    instructions: content.instructions,
    mistakes: content.mistakes,
    cues: content.cues,
    safetyNotes: content.safetyNotes,
    modifications: content.modifications,
    media,
    extra: {
      supportTypes,
      restrictedAreas,
      bodyAreas,
      supportTopics: resolvedSupportTopics,
      phase,
      group,
      benefit,
      minutes,
      goalTags,
      recoveryFit,
      movementId: mediaMovementId,
      sourceType: resolvedSourceType,
      displayName: name,
      visualCategory,
      movementType,
      difficulty,
      equipmentProfile,
      primaryFocus: bodyAreas[0] || "full_body",
      secondaryFocus: bodyAreas[1] || null,
      contentStandard: "v1",
      description: content.description,
      trainingUse: content.trainingUse,
      setup: content.setup,
      execution: content.execution,
      breathing: content.breathing,
      tempo: content.tempo,
      stepSequence: content.stepSequence,
      regressions: content.regressions,
      progressions: content.progressions,
      movement: buildMobilityMovementGuide(
        {
          id: entryId,
          name,
          category: phase,
          bodyAreas,
          instructions: content.instructions,
          cues: content.cues,
          mistakes: content.mistakes,
          safetyNotes: content.safetyNotes,
          modifications: content.modifications,
          regressions: content.regressions,
          progressions: content.progressions,
          description: content.description,
          trainingUse: content.trainingUse,
          setup: content.setup,
          execution: content.execution,
          breathing: content.breathing,
          tempo: content.tempo,
          stepSequence: content.stepSequence,
          media,
          familyIds: [resolvedFamilyId]
        },
        movement
      )
    }
  });

  const resolvedDetailId = entry.detailId || entryId;
  entry.detailId = resolvedDetailId;

  if (entry.extra?.movement) {
    entry.extra.movement.detailId = resolvedDetailId;
  }

  return {
    ...entry,
    detailId: resolvedDetailId,
    supportTypes,
    restrictedAreas,
    bodyAreas,
    supportTopics: resolvedSupportTopics,
    phase,
    group,
    benefit,
    minutes,
    goalTags,
    recoveryFit,
    movementId: mediaMovementId,
    sourceType: resolvedSourceType,
    displayName: name,
    visualCategory,
    movementType,
    difficulty,
    equipmentProfile,
    primaryFocus: bodyAreas[0] || "full_body",
    secondaryFocus: bodyAreas[1] || null
  };
}

function buildMobilityMovementGuide(option, baseMovement = null) {
  const fallbackPrimaryMuscles = (option.bodyAreas?.length ? option.bodyAreas : ["full_body"]).map(mapMobilityAreaToGuideLabel);
  const fallbackSecondaryMuscles = deriveMobilitySecondaryGuideLabels(option.bodyAreas || []);
  const standardizedGuideFields = buildStructuredGuideFields({
    description: option.description,
    trainingUse: option.trainingUse,
    primaryMuscles: baseMovement?.primaryMuscles?.length ? baseMovement.primaryMuscles : fallbackPrimaryMuscles,
    secondaryMuscles: baseMovement?.secondaryMuscles?.length ? baseMovement.secondaryMuscles : fallbackSecondaryMuscles,
    setup: option.setup,
    execution: option.execution,
    stepSequence: option.stepSequence || [],
    breathing: option.breathing,
    tempo: option.tempo,
    commonMistakes: baseMovement?.commonMistakes?.length ? baseMovement.commonMistakes : option.mistakes || [],
    safetyNotes: baseMovement?.safetyNotes?.length ? baseMovement.safetyNotes : option.safetyNotes || [],
    adjustments: option.modifications || [],
    easierOptions: option.regressions || [],
    progressions: option.progressions || []
  });
  return {
    ...(baseMovement || {}),
    id: baseMovement?.id || option.id,
    detailId: baseMovement?.detailId || option.detailId || option.id,
    name: baseMovement?.name || option.name,
    category: baseMovement?.category || option.category,
    difficulty: baseMovement?.difficulty || "Beginner",
    environment: baseMovement?.environment || "Home / gym",
    equipment: baseMovement?.equipment?.length ? baseMovement.equipment : ["bodyweight"],
    primaryMuscles: standardizedGuideFields.primaryMuscles,
    secondaryMuscles: standardizedGuideFields.secondaryMuscles,
    instructions: baseMovement?.instructions?.length ? baseMovement.instructions : option.instructions || [],
    cues: baseMovement?.cues?.length ? baseMovement.cues : option.cues || [],
    commonMistakes: standardizedGuideFields.commonMistakes,
    safetyNotes: standardizedGuideFields.safetyNotes,
    modifications: standardizedGuideFields.modifications,
    adjustmentOptions: standardizedGuideFields.modifications.adjustments,
    progressions: option.progressions || [],
    regressions: option.regressions || [],
    whatThisExerciseIs: standardizedGuideFields.whatThisExerciseIs,
    trainingUse: standardizedGuideFields.trainingUse,
    setup: standardizedGuideFields.setup,
    execution: option.execution,
    howToPerform: standardizedGuideFields.howToPerform,
    stepSequence: standardizedGuideFields.stepByStep,
    stepByStep: standardizedGuideFields.stepByStep,
    breathing: standardizedGuideFields.breathing,
    tempo: standardizedGuideFields.tempo,
    media: option.media,
    mediaStatus: option.media?.status || "none",
    familyIds: option.familyIds || [],
    guideContentStandard: "v2"
  };
}

function buildMobilityContentStandard({ name, bodyAreas, supportTopics, benefit, group }) {
  const stepSequence = buildMobilityStepSequence(name, group);
  const modifications = [
    "Use a smaller range and shorter hold if the target area feels guarded.",
    "Use props or support so the position stays calm and repeatable.",
    "Swap to a simpler variation in the same family if this version feels too aggressive today."
  ];
  return {
    instructions: [
      `Set up for ${name} slowly and use the first rep to find a comfortable range.`,
      group === "activation"
        ? "Use smooth reps to wake the area up before training."
        : group === "control"
          ? "Own the position instead of rushing through the drill."
          : "Keep the breath calm while you move through the range.",
      "Stop before the drill turns sharp, pinchy, or forced."
    ],
    cues: [
      "Stay relaxed enough to breathe normally.",
      bodyAreas?.length ? `Let ${bodyAreas.join(" / ")} lead the drill.` : "Let the target area lead the drill.",
      benefit || "Use the drill to make the next session feel cleaner."
    ],
    mistakes: [
      "Forcing range just because the position looks easy.",
      "Rushing the drill without feeling the target area move.",
      supportTopics?.length
        ? `Ignoring the area you are trying to support: ${supportTopics.map((topic) => formatSupportTopic(topic).toLowerCase()).join(", ")}.`
        : "Turning a support drill into a max-effort stretch."
    ],
    safetyNotes: [
      "Keep the drill pain-free and repeatable.",
      "Use a smaller range and slower tempo if the area feels irritated."
    ],
    modifications,
    regressions: modifications.slice(0, 2),
    progressions: [
      "Increase the hold time only if you can keep easy breathing and clean position.",
      "Progress to the deeper variation in the same family once the base position feels stable."
    ],
    description: benefit || `${name} is a guided mobility drill used to improve position quality without forcing range.`,
    trainingUse:
      group === "activation"
        ? "Use early in the session to prepare the target area for training."
        : group === "control"
          ? "Use to rebuild movement confidence and cleaner control through the target area."
          : "Use to restore range, reduce stiffness, and make the next session feel smoother.",
    setup: `Set up with enough space to move through ${name} calmly and keep the target area supported from the first rep.`,
    execution:
      group === "activation"
        ? "Move through each rep with smooth control and stop before the drill turns into a forced stretch."
        : group === "control"
          ? "Own the position, breathe normally, and keep each transition slow enough that the target area stays in control."
          : "Ease into the position, breathe steadily, and use only the range you can keep relaxed and repeatable.",
    breathing: "Exhale as you move into the main range and inhale as you return or reset.",
    tempo: "1-2 seconds into position, brief pause where the stretch or control is clearest, 2-3 seconds back to reset.",
    stepSequence
  };
}

function buildStretchContentStandard({ name, bodyAreas, supportTopics, benefit }) {
  const stepSequence = buildStretchStepSequence(name);
  const modifications = [
    "Reduce the stretch depth until you can keep the area relaxed and the breath steady.",
    "Use a wall, bench, towel, or strap for support if you need a cleaner hold.",
    "Shorten the hold and repeat more rounds instead of forcing one long position."
  ];
  return {
    instructions: [
      `Set up for ${name} slowly and stop at the first clear stretch that still feels sustainable.`,
      "Hold the position without bouncing, twisting, or chasing more range every second.",
      "Ease out of the stretch gradually before resetting the next side or rep."
    ],
    cues: [
      "Let the target area lengthen while the rest of the body stays quiet.",
      bodyAreas?.length ? `Keep the stretch centered on ${bodyAreas.join(" / ")}.` : "Keep the stretch centered on the target area.",
      benefit || "Use the hold to reduce stiffness and restore cleaner positions."
    ],
    mistakes: [
      "Pulling deeper every few seconds instead of settling into a repeatable stretch.",
      "Holding the breath or bracing harder as the position gets more intense.",
      supportTopics?.length
        ? `Letting tension shift away from the intended area: ${supportTopics.map((topic) => formatSupportTopic(topic).toLowerCase()).join(", ")}.`
        : "Turning a stretch into a max-effort position."
    ],
    safetyNotes: [
      "Stay below sharp, pinchy, or numb sensations.",
      "Come out of the hold sooner if posture breaks or breathing gets strained."
    ],
    modifications,
    regressions: modifications.slice(0, 2),
    progressions: [
      "Add a second round before adding more stretch depth.",
      "Increase the hold length only if the position stays calm and repeatable."
    ],
    description: benefit || `${name} is a static stretch used to reduce stiffness and restore cleaner range without forcing motion.`,
    trainingUse: "Use after training, between harder sessions, or anytime the target area feels short and guarded.",
    setup: `Set up for ${name} in a stable position so you can hold the stretch without compensating through other joints.`,
    execution: "Move into the first clear stretch, hold with steady breathing, and leave the position as smoothly as you entered it.",
    breathing: "Take a full inhale to reset, then exhale slowly as you settle into the hold. Keep easy breaths for the full stretch.",
    tempo: "Ease into the stretch over 2-3 seconds, hold 20-30 seconds, then return to neutral under control.",
    stepSequence
  };
}

function buildRehabContentStandard({ name, bodyAreas, supportTopics, benefit, group }) {
  const stepSequence = buildRehabStepSequence(name, group);
  const modifications = [
    "Use the smallest pain-free range that still lets you feel the target muscles working.",
    "Add support from a wall, bench, mat, or band setup so alignment stays clean.",
    "Stop the set early if symptoms sharpen, radiate, or force you to compensate."
  ];
  return {
    instructions: [
      `Set up for ${name} carefully and make the first rep slower than you think you need.`,
      "Move only through a controlled, pain-free range and keep the rest of the body quiet.",
      "Finish the drill with the same alignment you started with instead of chasing fatigue."
    ],
    cues: [
      "Keep the movement small enough that control stays obvious.",
      bodyAreas?.length ? `Let ${bodyAreas.join(" / ")} guide the drill instead of bigger surrounding muscles.` : "Let the target area guide the drill instead of bigger surrounding muscles.",
      benefit || "Use the drill to rebuild confidence, alignment, and repeatable low-risk control."
    ],
    mistakes: [
      "Pushing into sharp pain just to complete the planned reps.",
      "Using momentum or extra body sway to make the movement look bigger.",
      supportTopics?.length
        ? `Letting the intended support area drop out: ${supportTopics.map((topic) => formatSupportTopic(topic).toLowerCase()).join(", ")}.`
        : "Rushing through the drill without actually owning the position."
    ],
    safetyNotes: [
      "Stay in a pain-free or clearly tolerable range only.",
      "Stop immediately if pain becomes sharp, radiating, or unstable."
    ],
    modifications,
    regressions: modifications.slice(0, 2),
    progressions: [
      "Add reps or hold time before adding more resistance or range.",
      "Progress only when the same movement stays calm and controlled on both sides."
    ],
    description: benefit || `${name} is a corrective rehab drill used to rebuild alignment, control, and pain-free confidence.`,
    trainingUse: "Use during rehab, warm-up resets, or low-load corrective sessions when quality matters more than workload.",
    setup: `Set up for ${name} with enough support that you can keep the target joints aligned from the first rep.`,
    execution:
      group === "activation"
        ? "Move slowly into the working position, create gentle tension, and return before the drill turns shaky or forced."
        : group === "control"
          ? "Hold or move through the drill slowly enough that the target area stays organized the whole time."
          : "Use a small, pain-free range and keep the movement smooth enough that alignment never breaks down.",
    breathing: "Exhale through the effort or hold, inhale on the easier reset, and never brace so hard that you stop breathing.",
    tempo: "Move into position over 2-3 seconds, pause 1-2 seconds where control is clearest, then return over 2-3 seconds.",
    stepSequence
  };
}

function buildMobilityStepSequence(name, group) {
  return [
    {
      title: "Start",
      description: `Set up for ${name} with a calm base position and enough support to move without rushing.`
    },
    {
      title: "Mid",
      description:
        group === "activation"
          ? "Move into the first working range slowly and let the target area wake up without forcing it."
          : "Ease into the main working range while keeping breathing steady and the rest of the body relaxed."
    },
    {
      title: "Peak",
      description:
        group === "control"
          ? "Own the strongest position briefly and keep the target area organized instead of forcing extra range."
          : "Pause where the stretch, reach, or control is clearest and keep the position smooth."
    },
    {
      title: "Finish",
      description: "Return to the start with the same control and reset before repeating the next rep or side."
    }
  ];
}

function buildStretchStepSequence(name) {
  return [
    {
      title: "Start",
      description: `Set up for ${name} and move only until you feel a clear stretch in the target area.`
    },
    {
      title: "Hold",
      description: "Stay still, breathe normally, and let the area soften into the position without bouncing or forcing more range."
    },
    {
      title: "Finish",
      description: "Ease out of the hold slowly, reset your posture, and repeat only if the stretch still feels clean."
    }
  ];
}

function buildRehabStepSequence(name, group) {
  return [
    {
      title: "Start",
      description: `Set up for ${name} with support, stacked alignment, and a range that already feels calm.`
    },
    {
      title: "Mid",
      description: "Create light tension and steady breathing before you move farther into the drill."
    },
    {
      title: "Peak",
      description:
        group === "activation"
          ? "Move through the working range slowly enough that the target muscles, not momentum, create the motion."
          : "Own the key position briefly and keep the movement pain-free, quiet, and repeatable."
    },
    {
      title: "Finish",
      description: "Return to the start under control, reset your alignment, and stop early if quality fades."
    }
  ];
}

function buildStructuredGuideFields({
  description,
  trainingUse,
  primaryMuscles = [],
  secondaryMuscles = [],
  setup,
  execution,
  stepSequence = [],
  breathing,
  tempo,
  commonMistakes = [],
  safetyNotes = [],
  adjustments = [],
  easierOptions = [],
  progressions = []
}) {
  return {
    whatThisExerciseIs: description,
    trainingUse,
    primaryMuscles,
    secondaryMuscles,
    setup,
    howToPerform: execution,
    stepByStep: stepSequence,
    breathing,
    tempo,
    commonMistakes,
    safetyNotes,
    modifications: {
      adjustments,
      easierOptions,
      progressions
    }
  };
}

function mapMobilityAreaToGuideLabel(value) {
  const map = {
    full_body: "Full body",
    shoulder: "Shoulders",
    back: "Thoracic spine",
    hip: "Hips",
    knee: "Knees",
    ankle: "Ankles",
    elbow: "Elbows",
    wrist: "Wrists"
  };
  return map[value] || formatAreaLabel(value);
}

function deriveMobilitySecondaryGuideLabels(bodyAreas = []) {
  const areas = Array.isArray(bodyAreas) ? bodyAreas : [];
  const [primaryArea] = areas;
  const fallbackMap = {
    hip: ["Core"],
    ankle: ["Calves"],
    shoulder: ["Upper back"],
    back: ["Shoulders"],
    knee: ["Hips"],
    wrist: ["Forearms"],
    elbow: ["Forearms"],
    full_body: ["Core"]
  };
  const explicit = areas.slice(1).map(mapMobilityAreaToGuideLabel);
  if (explicit.length) {
    return explicit;
  }
  return fallbackMap[primaryArea] || ["Core"];
}

function inferSupportEquipmentProfile(entryId, sourceType) {
  if (sourceType === REHAB_SOURCE_TYPE) {
    return /(banded|wall|bench|mat|foam|towel|box)/.test(entryId) ? "light" : "none";
  }
  if (sourceType === STRETCH_SOURCE_TYPE) {
    return /(wall|doorway|bench|strap|towel)/.test(entryId) ? "light" : "none";
  }
  return ["banded-shoulder-dislocates", "foam-roller-thoracic-extension"].includes(entryId) ? "light" : "none";
}

function createYogaProductionRoutine(pose) {
  const name = String(pose.displayName || "").trim();
  const focusAreas = dedupeStringList([pose.primaryFocus, pose.secondaryFocus].map(mapYogaFocusToArea));
  const supportTopics = dedupeStringList(focusAreas.map(mapYogaAreaToSupportTopic));
  const normalizedFocusAreas = focusAreas.length ? focusAreas : ["full_body"];
  const minutes = pose.sequenceType === "dynamic" ? 10 : pose.priority === "high" ? 8 : 6;
  const phase = pose.sequenceType === "dynamic" ? "mobility" : pose.priority === "high" ? "recovery" : "release";
  const benefit = buildYogaBenefit(pose, normalizedFocusAreas);

  return routine({
    name,
    supportTypes: ["yoga"],
    restrictedAreas: normalizedFocusAreas,
    bodyAreas: normalizedFocusAreas,
    supportTopics,
    phase,
    benefit,
    minutes,
    environments: ["home", "gym", "hybrid"],
    goalTags: ["mobility", "general_fitness", "active_aging"],
    recoveryFit: pose.sequenceType === "dynamic" ? "medium" : pose.priority === "low" ? "medium" : "high",
    familyId: pose.id,
    sourceType: "yoga_production"
  });
}

function buildYogaBenefit(pose, focusAreas) {
  const focusLabel = focusAreas.map(formatAreaLabel).join(", ").replaceAll("Full-body", "full-body");
  if (pose.sequenceType === "dynamic") {
    return `Move through ${pose.displayName} as a guided yoga flow to improve ${focusLabel} control without losing calm breathing.`;
  }
  return `Use ${pose.displayName} as a yoga hold to improve ${focusLabel} position quality with steady breathing and clean alignment.`;
}

function mapYogaFocusToArea(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "full_body";
  if (normalized.includes("hamstring")) return "hip";
  if (normalized.includes("spine")) return "back";
  if (normalized.includes("shoulder")) return "shoulder";
  if (normalized.includes("core")) return "full_body";
  if (normalized.includes("hip")) return "hip";
  return "full_body";
}

function mapYogaAreaToSupportTopic(value) {
  const map = {
    shoulder: "shoulder_irritation",
    back: "lower_back",
    hip: "hip_tightness",
    ankle: "ankle_stiffness",
    knee: "knee_support",
    elbow: "tennis_elbow",
    wrist: "carpal_tunnel",
    full_body: "lower_back"
  };
  return map[value] || "lower_back";
}

function dedupeStringList(values = []) {
  return Array.from(
    new Set(
      values
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    )
  );
}

function scoreRoutine(routineEntry, { goalType, restrictedAreas, recoveryStatus, injuryArea }) {
  let score = 0;
  if (routineEntry.goalTags.includes(goalType)) {
    score += 3;
  }
  if (restrictedAreas.some((area) => routineEntry.restrictedAreas.includes(area))) {
    score += 4;
  }
  if (injuryArea !== "all" && (routineEntry.bodyAreas.includes(injuryArea) || routineEntry.supportTopics.includes(normalizeSupportTopic(injuryArea)))) {
    score += 4;
  }
  if (recoveryStatus === "low" && routineEntry.recoveryFit === "high") {
    score += 3;
  }
  if (["recovery", "control", "release"].includes(routineEntry.phase)) {
    score += 1;
  }
  return score;
}

function dedupeByName(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.name)) {
      return false;
    }

    seen.add(item.name);
    return true;
  });
}

function ensureMobilityMinimum(primaryList, context) {
  const current = [...primaryList];
  if (current.length >= 4) {
    return current;
  }

  const sameArea = MOBILITY_LIBRARY.filter(
    (entry) =>
      matchesArea(entry, context.injuryArea, context.restrictedAreas) &&
      !current.some((selected) => selected.name === entry.name)
  );
  const similarMovement = MOBILITY_LIBRARY.filter(
    (entry) =>
      entry.group === current[0]?.group &&
      !current.some((selected) => selected.name === entry.name)
  );
  const safeFallback = MOBILITY_LIBRARY.filter(
    (entry) =>
      entry.rehabSafe &&
      entry.minutes <= Math.max(Number(context.timeCap) || 10, 10) &&
      !current.some((selected) => selected.name === entry.name)
  );

  return dedupeByName([...current, ...sameArea, ...similarMovement, ...safeFallback]).slice(0, 6);
}

function matchesArea(entry, injuryArea, restrictedAreas = []) {
  if (injuryArea && injuryArea !== "all") {
    return entry.bodyAreas.includes(injuryArea) || entry.supportTopics.includes(normalizeSupportTopic(injuryArea));
  }
  return restrictedAreas.some((area) => entry.bodyAreas.includes(area) || entry.supportTopics.includes(normalizeSupportTopic(area)));
}

function buildMobilitySessionName(category, injuryArea, recoveryStatus) {
  if (category === "physiotherapy") {
    return injuryArea !== "all" ? `${formatAreaLabel(injuryArea)} stability sequence` : "Guided rehab sequence";
  }
  if (category === "recovery") {
    return recoveryStatus === "low" ? "Post-training reset" : "Recovery support flow";
  }
  if (category === "stretching") {
    return injuryArea !== "all" ? `${formatAreaLabel(injuryArea)} stretching flow` : "Targeted stretching flow";
  }
  if (category === "injury_specific") {
    return injuryArea !== "all" ? `${formatAreaLabel(injuryArea)} injury-support sequence` : "Injury-support sequence";
  }
  return injuryArea !== "all" ? `${formatAreaLabel(injuryArea)} recovery flow` : "Full-body recovery flow";
}

function formatAreaLabel(value) {
  const map = {
    back: "Lower-back",
    shoulder: "Shoulder",
    hip: "Hip",
    knee: "Knee",
    ankle: "Ankle",
    elbow: "Elbow",
    wrist: "Wrist",
    full_body: "Full-body"
  };
  return map[value] || "Full-body";
}

function formatSupportTopic(value) {
  const map = {
    meniscus_support: "Meniscus support",
    acl_mcl_support: "ACL / MCL stability support",
    patellar_tracking_support: "Patellar tracking support",
    general_knee_pain_support: "General knee pain support",
    lumbar_strain_support: "Lumbar strain support",
    disc_irritation_support: "Disc irritation support",
    general_low_back_stiffness: "General low-back stiffness",
    rotator_cuff_support: "Rotator cuff irritation support",
    shoulder_impingement_support: "Shoulder impingement support",
    shoulder_instability_support: "Shoulder instability support",
    tennis_elbow: "Tennis elbow support",
    carpal_tunnel: "Carpal tunnel support",
    hip_tightness_support: "Hip tightness support",
    ankle_stiffness_support: "Ankle stiffness support",
    lower_back: "Lower-back support",
    knee_support: "Knee support",
    shoulder_irritation: "Shoulder support",
    hip_tightness: "Hip tightness support",
    ankle_stiffness: "Ankle stiffness support"
  };

  return map[value] || String(value || "").replaceAll("_", " ");
}

function expandSupportTopics(topics = []) {
  const expanded = new Set();
  topics.forEach((topic) => {
    const normalized = String(topic || "").trim();
    if (!normalized) {
      return;
    }
    expanded.add(normalized);
    (SUPPORT_TOPIC_EQUIVALENTS[normalized] || []).forEach((alias) => expanded.add(alias));
  });
  return Array.from(expanded);
}

function normalizeSupportTopic(value) {
  const map = {
    wrist: "carpal_tunnel",
    elbow: "tennis_elbow",
    shoulder: "rotator_cuff_support",
    knee: "general_knee_pain_support",
    ankle: "ankle_stiffness_support",
    back: "general_low_back_stiffness",
    hip: "hip_tightness_support"
  };

  return map[value] || value;
}
