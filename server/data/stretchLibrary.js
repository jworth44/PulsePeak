import { findMovementForName } from "./movementLibrary.js";
import { createLibraryEntry, createMediaPayload, validateLibraryEntries } from "../../shared/exerciseCatalog.js";
import { buildExerciseMediaSpec } from "../../shared/mediaGenerationConfig.js";

const MOBILITY_CATEGORIES = [
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

const BASE_MOBILITY_LIBRARY = [
  routine({
    name: "Cat-cow",
    supportTypes: ["yoga", "recovery"],
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
    supportTypes: ["yoga", "recovery"],
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
    supportTypes: ["yoga", "recovery", "injury_specific"],
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
    supportTypes: ["yoga", "stretching"],
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
    supportTypes: ["stretching", "recovery"],
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
    supportTypes: ["stretching", "recovery", "injury_specific"],
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
    supportTypes: ["physiotherapy", "injury_specific"],
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
    { name: "Open book rotation", supportTypes: ["stretching", "recovery"], restrictedAreas: ["back", "shoulder"], bodyAreas: ["back", "shoulder"], supportTopics: ["lower_back", "shoulder_irritation"], phase: "mobility", benefit: "Restore upper-back rotation so the torso moves better without forcing the lower back.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness", "active_aging"], recoveryFit: "high" },
    { name: "Foam roller thoracic extension", supportTypes: ["recovery", "stretching"], restrictedAreas: ["back", "shoulder"], bodyAreas: ["back", "shoulder"], supportTopics: ["lower_back", "shoulder_irritation"], phase: "release", benefit: "Open upper-back extension after long sitting or pressing volume.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "bodybuilding", "general_fitness"], recoveryFit: "high" },
    { name: "Quadruped T-spine reach", supportTypes: ["physiotherapy", "recovery"], restrictedAreas: ["back", "shoulder"], bodyAreas: ["back", "shoulder"], supportTopics: ["lower_back", "shoulder_irritation"], phase: "control", benefit: "Create cleaner rotation and control through a supported position.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "mobility"], recoveryFit: "high" }
  ]),
  ...routineFamily("wrist_elbow_family", [
    { name: "Wrist extension rock", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["elbow", "wrist"], bodyAreas: ["wrist", "elbow"], supportTopics: ["carpal_tunnel", "tennis_elbow"], phase: "activation", benefit: "Gently load the wrist so pressing and gripping feel less abrupt.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "mobility"], recoveryFit: "high" },
    { name: "Forearm pronation-supination", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["elbow", "wrist"], bodyAreas: ["wrist", "elbow"], supportTopics: ["tennis_elbow", "carpal_tunnel"], phase: "control", benefit: "Restore forearm rotation with a low-stress drill you can repeat often.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "high" },
    { name: "Finger extension spread", supportTypes: ["recovery", "injury_specific"], restrictedAreas: ["wrist", "elbow"], bodyAreas: ["wrist", "elbow"], supportTopics: ["carpal_tunnel", "tennis_elbow"], phase: "release", benefit: "Offset repeated gripping and keyboard tension with a low-friction reset drill.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "injury_recovery"], recoveryFit: "high" }
  ]),
  ...routineFamily("hip_recovery_family", [
    { name: "Figure-four glute stretch", supportTypes: ["stretching", "recovery"], restrictedAreas: ["hip", "back"], bodyAreas: ["hip", "back"], supportTopics: ["hip_tightness", "lower_back"], phase: "release", benefit: "Reduce glute and hip stiffness after lower-body work or long sitting.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "fat_loss", "general_fitness"], recoveryFit: "high" },
    { name: "Adductor rock-back", supportTypes: ["stretching", "recovery"], restrictedAreas: ["hip", "knee"], bodyAreas: ["hip", "knee"], supportTopics: ["hip_tightness", "knee_support"], phase: "mobility", benefit: "Open the inner thigh and make squat depth feel less sticky.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["strength", "mobility", "active_aging"], recoveryFit: "medium" },
    { name: "Hip airplane support", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["hip", "knee"], bodyAreas: ["hip", "knee"], supportTopics: ["hip_tightness", "knee_support"], phase: "control", benefit: "Improve hip stability and balance before single-leg work.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "athletic_performance"], recoveryFit: "medium" }
  ]),
  ...routineFamily("knee_support_family", [
    { name: "Spanish squat hold", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["knee"], bodyAreas: ["knee"], supportTopics: ["knee_support"], phase: "control", benefit: "Build quad tension in a knee-friendly way when squats feel sharp or unstable.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "medium" },
    { name: "Terminal knee extension", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["knee"], bodyAreas: ["knee"], supportTopics: ["knee_support"], phase: "activation", benefit: "Wake up the quad and finish knee extension with low joint stress.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "mobility"], recoveryFit: "high" },
    { name: "Supported step-down", supportTypes: ["physiotherapy", "injury_specific"], restrictedAreas: ["knee", "hip"], bodyAreas: ["knee", "hip"], supportTopics: ["knee_support", "hip_tightness"], phase: "control", benefit: "Practice knee tracking with more control than a free-moving lunge.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["injury_recovery", "active_aging"], recoveryFit: "medium" }
  ]),
  ...routineFamily("ankle_reset_family", [
    { name: "Calf wall stretch", supportTypes: ["stretching", "recovery"], restrictedAreas: ["ankle"], bodyAreas: ["ankle"], supportTopics: ["ankle_stiffness"], phase: "release", benefit: "Restore calf length and make knee travel smoother in squats and lunges.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" },
    { name: "Tibialis raise", supportTypes: ["physiotherapy", "recovery"], restrictedAreas: ["ankle", "knee"], bodyAreas: ["ankle", "knee"], supportTopics: ["ankle_stiffness", "knee_support"], phase: "activation", benefit: "Build lower-leg support for better deceleration and shin comfort.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["athletic_performance", "injury_recovery"], recoveryFit: "medium" },
    { name: "Ankle circle control", supportTypes: ["recovery", "stretching"], restrictedAreas: ["ankle"], bodyAreas: ["ankle"], supportTopics: ["ankle_stiffness"], phase: "mobility", benefit: "Smooth out ankle motion before cardio, jumping, or leg training.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" }
  ]),
  ...routineFamily("neck_posture_family", [
    { name: "Chin tuck reset", supportTypes: ["recovery", "physiotherapy"], restrictedAreas: ["back", "shoulder"], bodyAreas: ["full_body"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "activation", benefit: "Bring posture back online after screen-heavy days without adding strain.", minutes: 3, environments: ["home", "gym", "hybrid"], goalTags: ["active_aging", "mobility"], recoveryFit: "high" },
    { name: "Wall angel slide", supportTypes: ["recovery", "stretching"], restrictedAreas: ["shoulder", "back"], bodyAreas: ["shoulder", "back"], supportTopics: ["shoulder_irritation", "lower_back"], phase: "control", benefit: "Reconnect posture, rib position, and shoulder movement in one simple drill.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" }
  ]),
  ...routineFamily("full_body_recovery_family", [
    { name: "Crocodile breathing", supportTypes: ["recovery", "physiotherapy"], restrictedAreas: ["back", "full_body"], bodyAreas: ["full_body", "back"], supportTopics: ["lower_back"], phase: "release", benefit: "Downshift tension so your mobility work actually sticks instead of feeling rushed.", minutes: 4, environments: ["home", "gym", "hybrid"], goalTags: ["recovery", "mobility", "active_aging"], recoveryFit: "high" },
    { name: "Standing reach flow", supportTypes: ["yoga", "recovery"], restrictedAreas: ["full_body", "back"], bodyAreas: ["full_body", "back"], supportTopics: ["lower_back"], phase: "mobility", benefit: "Move the whole body through a simple recovery pattern when you feel stiff everywhere.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["mobility", "general_fitness"], recoveryFit: "high" },
    { name: "Supine twist reset", supportTypes: ["yoga", "recovery"], restrictedAreas: ["back", "hip"], bodyAreas: ["back", "hip", "full_body"], supportTopics: ["lower_back", "hip_tightness"], phase: "release", benefit: "Finish the session with a lower-intensity reset for the trunk and hips.", minutes: 5, environments: ["home", "gym", "hybrid"], goalTags: ["recovery", "mobility", "active_aging"], recoveryFit: "high" }
  ])
];

const MOBILITY_LIBRARY = validateLibraryEntries([...BASE_MOBILITY_LIBRARY, ...EXPANDED_MOBILITY_LIBRARY], "mobility catalog");

export function buildMobilityPlan({ goalType, injuryStatus, restrictedAreas, lowRecovery, workoutEnvironment }) {
  const selectedCategory =
    injuryStatus !== "none"
      ? "physiotherapy"
      : goalType === "mobility"
        ? "yoga"
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
        ? "yoga"
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
        ? `${planContext.mobilityTarget} Choose yoga, stretching, physiotherapy-style drills, or recovery mobility based on how you feel and what part of the body needs support.`
        : "Choose yoga, stretching, physiotherapy-style drills, or recovery mobility based on how you feel and what part of the body needs support.",
    suggestedCategory,
    sessionName: sessionSet.sessionName,
    categories: MOBILITY_CATEGORIES,
    library: MOBILITY_LIBRARY,
    suggestedFlow: sessionSet.guidedBlock,
    additionalPool: sessionSet.additionalPool,
    filterOptions: {
      areaOptions: AREA_OPTIONS,
      injurySupportOptions: INJURY_SUPPORT_OPTIONS,
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
  ]).slice(0, 10);

  return {
    guidedBlock,
    additionalPool,
    sessionName: buildMobilitySessionName(category, injuryArea, recoveryStatus)
  };
}

export function filterMobilityLibrary({
  category = "stretching",
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

function routine({ name, supportTypes, restrictedAreas, bodyAreas, supportTopics, phase, benefit, minutes, environments, goalTags, recoveryFit, familyId = null }) {
  const movement = findMovementForName(name);
  const entryId = movement?.id || name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
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
  const content = buildMobilityContentStandard({ name, bodyAreas, supportTopics, benefit, group });
  const media = createMediaPayload(
    buildExerciseMediaSpec({
      id: entryId,
      name,
      familyId: resolvedFamilyId,
      trainingType: "mobility",
      fallbackImage: movement?.image || null
    })
  );

  return createLibraryEntry({
    id: entryId,
    name,
    mode: "mobility",
    category: phase,
    primaryMuscleGroup: bodyAreas[0] || "full_body",
    secondaryMuscleGroups: bodyAreas.slice(1),
    movementPattern: group,
    equipmentRequirements: movement?.equipment || ["bodyweight"],
    difficultyLevel: recoveryFit === "high" ? "beginner" : "standard",
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
      movementId: movement?.id || null,
      contentStandard: "v1",
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
          media,
          familyIds: [resolvedFamilyId]
        },
        movement
      )
    }
  });
}

function buildMobilityMovementGuide(option, baseMovement = null) {
  return {
    ...(baseMovement || {}),
    id: baseMovement?.id || option.id,
    name: baseMovement?.name || option.name,
    category: baseMovement?.category || option.category,
    difficulty: baseMovement?.difficulty || "Beginner",
    environment: baseMovement?.environment || "Home / gym",
    equipment: baseMovement?.equipment?.length ? baseMovement.equipment : ["bodyweight"],
    primaryMuscles: baseMovement?.primaryMuscles?.length ? baseMovement.primaryMuscles : option.bodyAreas || ["full_body"],
    secondaryMuscles: baseMovement?.secondaryMuscles?.length ? baseMovement.secondaryMuscles : option.bodyAreas?.slice(1) || [],
    instructions: baseMovement?.instructions?.length ? baseMovement.instructions : option.instructions || [],
    cues: baseMovement?.cues?.length ? baseMovement.cues : option.cues || [],
    commonMistakes: baseMovement?.commonMistakes?.length ? baseMovement.commonMistakes : option.mistakes || [],
    safetyNotes: baseMovement?.safetyNotes?.length ? baseMovement.safetyNotes : option.safetyNotes || [],
    modifications: baseMovement?.modifications?.length ? baseMovement.modifications : option.modifications || [],
    media: option.media,
    mediaStatus: option.media?.status || "none",
    familyIds: option.familyIds || []
  };
}

function buildMobilityContentStandard({ name, bodyAreas, supportTopics, benefit, group }) {
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
    modifications: [
      "Shorten the hold or range if you feel guarding.",
      "Swap to another drill in the same support family if this one does not feel right today."
    ]
  };
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

const SUPPORT_TOPIC_EQUIVALENTS = {
  knee_support: ["general_knee_pain_support", "patellar_tracking_support", "acl_mcl_support", "meniscus_support"],
  lower_back: ["general_low_back_stiffness", "lumbar_strain_support", "disc_irritation_support"],
  shoulder_irritation: ["rotator_cuff_support", "shoulder_impingement_support", "shoulder_instability_support"],
  hip_tightness: ["hip_tightness_support"],
  ankle_stiffness: ["ankle_stiffness_support"]
};
