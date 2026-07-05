import { getReviewedMediaAsset } from "../../shared/mediaReviewCatalog.js";

const MOVEMENT_MEDIA = {
  squat: buildMovementMedia("squat", "Athlete setting up a squat with a stable stance."),
  "goblet-squat": buildMovementMedia("goblet-squat", "Athlete holding a goblet squat with a stable upright torso."),
  "push-up": buildMovementMedia("push-up", "Athlete holding a strong push-up position."),
  "dumbbell-press": buildMovementMedia("dumbbell-press", "Athlete pressing dumbbells from a stable bench position."),
  "incline-dumbbell-press": buildMovementMedia("incline-dumbbell-press", "Athlete pressing dumbbells from a stable incline bench position."),
  row: buildMovementMedia("row", "Athlete performing a strong rowing pattern with a flat back."),
  deadlift: buildMovementMedia("deadlift", "Athlete hinging into a deadlift setup with the weight close."),
  lunge: buildMovementMedia("lunge", "Athlete lowering into a controlled lunge stance."),
  plank: buildMovementMedia("plank", "Athlete holding a strong forearm plank."),
  "overhead-press": buildMovementMedia("overhead-press", "Athlete pressing dumbbells overhead with a stacked torso."),
  "cat-cow": buildMovementMedia("cat-cow", "Athlete moving through a cat-cow mobility drill."),
  "worlds-greatest-stretch": buildMovementMedia("worlds-greatest-stretch", "Athlete performing a long lunge rotation stretch."),
  "wall-slide": buildMovementMedia("wall-slide", "Athlete performing a shoulder wall slide with control."),
  "hamstring-stretch": buildMovementMedia("hamstring-stretch", "Athlete hinging into a hamstring stretch with a long spine."),
  "hip-flexor-stretch": buildMovementMedia("hip-flexor-stretch", "Athlete holding a half-kneeling hip flexor stretch."),
  "thoracic-rotation": buildMovementMedia("thoracic-rotation", "Athlete opening into a thoracic rotation drill."),
  "shoulder-mobility": buildMovementMedia("shoulder-mobility", "Athlete using a smooth shoulder mobility reach."),
  "glute-bridge": buildMovementMedia("glute-bridge", "Athlete pressing into a glute bridge with hips lifted."),
  "band-pull-apart": buildMovementMedia("band-pull-apart", "Athlete pulling a band apart with shoulders down."),
  "wall-squat": buildMovementMedia("wall-squat", "Athlete holding a supported wall squat."),
  "supported-split-squat": buildMovementMedia("supported-split-squat", "Athlete using support during a split squat.")
};

const MOVEMENT_LIBRARY = [
  movement({
    id: "squat",
    name: "Squat",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight", "dumbbell", "barbell"],
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core", "Hamstrings"],
    instructions: [
      "Stand with feet around shoulder width and brace your trunk before you move.",
      "Sit your hips back and down while keeping your chest tall and knees tracking over your toes.",
      "Lower only as far as you can keep control and even pressure through the whole foot.",
      "Drive through the floor to stand tall and finish with your ribs stacked over your hips."
    ],
    cues: ["Tripod foot pressure", "Brace before you bend", "Knees follow toes"],
    commonMistakes: ["Collapsing the chest", "Letting the knees cave inward", "Rising onto the toes too early"],
    safetyNotes: ["Reduce depth if you lose spinal position.", "Use a box or support if knee confidence is low."],
    modifications: ["Bodyweight squat to box", "Goblet squat", "Wall squat for lower-load support"],
    image: mediaRef("squat", "Squat form guide")
  }),
  movement({
    id: "push-up",
    name: "Push-up",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Chest", "Triceps"],
    secondaryMuscles: ["Shoulders", "Core"],
    instructions: [
      "Set your hands slightly wider than shoulders and form a straight line from head to heels.",
      "Brace your core and lower your chest between your hands without letting your hips sag.",
      "Pause just above the floor while keeping elbows at a comfortable angle.",
      "Press the floor away and return to a strong plank."
    ],
    cues: ["Long body line", "Screw hands into the floor", "Push the floor away"],
    commonMistakes: ["Dropping the hips", "Flaring the elbows hard", "Leading with the chin"],
    safetyNotes: ["Elevate the hands if shoulder comfort or strength is limited.", "Stop if shoulder pain builds with each rep."],
    modifications: ["Incline push-up", "Knee push-up", "Slow eccentric push-up"],
    image: mediaRef("push-up", "Push-up setup guide")
  }),
  movement({
    id: "goblet-squat",
    name: "Goblet Squat",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["dumbbell", "kettlebell"],
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core", "Adductors"],
    instructions: [
      "Hold the weight close to the chest and set the feet at a squat stance you can control.",
      "Brace the trunk and lower between the hips while keeping the elbows inside the knees.",
      "Reach the deepest position you can own without the chest collapsing or heels lifting.",
      "Drive through the full foot to stand tall while keeping the weight quiet at the chest."
    ],
    cues: ["Weight close to chest", "Sit between the hips", "Stand tall through the finish"],
    commonMistakes: ["Letting the chest cave forward", "Dropping too fast into the bottom", "Lifting the heels as depth increases"],
    safetyNotes: ["Reduce depth if you lose spinal position or foot pressure.", "Use a lighter bell if you cannot keep the torso upright."],
    modifications: ["Bodyweight squat", "Box squat", "Heels-elevated goblet squat"],
    image: mediaRef("goblet-squat", "Goblet squat form guide")
  }),
  movement({
    id: "dumbbell-press",
    name: "Dumbbell Press",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["dumbbell", "bench", "floor"],
    primaryMuscles: ["Chest", "Shoulders"],
    secondaryMuscles: ["Triceps"],
    instructions: [
      "Set your shoulders down and back before the first rep.",
      "Start with dumbbells stacked over elbows and wrists neutral.",
      "Lower under control until the upper arm is close to the floor or bench line.",
      "Press back up smoothly without letting the ribs flare."
    ],
    cues: ["Stack wrist over elbow", "Own the bottom", "Press without shrugging"],
    commonMistakes: ["Bouncing at the bottom", "Arching hard through the low back", "Letting wrists fold back"],
    safetyNotes: ["Use the floor press variation if shoulder range feels limited.", "Keep load conservative if shoulder irritation is active."],
    modifications: ["Floor press", "Single-arm dumbbell press", "Neutral-grip press"],
    image: mediaRef("dumbbell-press", "Dumbbell press form guide")
  }),
  movement({
    id: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["dumbbell", "bench"],
    primaryMuscles: ["Chest", "Shoulders"],
    secondaryMuscles: ["Triceps"],
    instructions: [
      "Set the bench to a low incline and stack the dumbbells over the elbows before the first rep.",
      "Lower with control toward the upper chest line while keeping the shoulder blades gently set.",
      "Pause briefly at the controlled bottom without bouncing or losing wrist position.",
      "Press back up on the same upward path and finish without flaring the ribs."
    ],
    cues: ["Low incline angle", "Wrists over elbows", "Press on an upward path"],
    commonMistakes: ["Setting the bench too steep", "Flaring the ribs to finish the rep", "Letting the elbows drift too low behind the torso"],
    safetyNotes: ["Reduce the incline or load if the front shoulders feel pinched.", "Keep the range controlled if shoulder comfort changes rep to rep."],
    modifications: ["Flat dumbbell press", "Neutral-grip incline press", "Machine incline press"],
    image: mediaRef("incline-dumbbell-press", "Incline dumbbell press form guide")
  }),
  movement({
    id: "row",
    name: "Row",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["dumbbell", "machine", "cable", "barbell"],
    primaryMuscles: ["Back"],
    secondaryMuscles: ["Biceps", "Rear delts"],
    instructions: [
      "Set your torso and keep the neck long before you start pulling.",
      "Drive the elbow back toward the hip instead of yanking with the hand.",
      "Pause briefly when the shoulder blade is fully retracted.",
      "Lower with control and keep the torso stable."
    ],
    cues: ["Lead with the elbow", "Pull to the hip", "Stay square through the torso"],
    commonMistakes: ["Jerking the weight", "Shrugging into the neck", "Twisting the torso to finish the rep"],
    safetyNotes: ["Use chest support if your low back gets tired quickly.", "Lower the load if you cannot pause at the top."],
    modifications: ["Chest-supported row", "Single-arm row", "Cable row"],
    image: mediaRef("row", "Row position guide")
  }),
  movement({
    id: "deadlift",
    name: "Deadlift",
    category: "strength",
    difficulty: "intermediate",
    environment: "both",
    equipment: ["barbell", "dumbbell"],
    primaryMuscles: ["Glutes", "Hamstrings"],
    secondaryMuscles: ["Back", "Core"],
    instructions: [
      "Set the weight close to your body and hinge back with a long spine.",
      "Brace your trunk and create tension before the weight leaves the floor.",
      "Drive through the floor and stand tall while keeping the bar or dumbbells close.",
      "Hinge back down with the same control and reset the next rep."
    ],
    cues: ["Push hips back", "Keep the weight close", "Stand tall, do not lean back"],
    commonMistakes: ["Rounding early off the floor", "Letting the weight drift forward", "Hyperextending at lockout"],
    safetyNotes: ["Switch to a Romanian deadlift or bridge variation if the back feels irritable.", "Keep reps crisp instead of grinding through fatigue."],
    modifications: ["Romanian deadlift", "Dumbbell deadlift", "Glute bridge"],
    image: mediaRef("deadlift", "Deadlift hinge guide")
  }),
  movement({
    id: "lunge",
    name: "Lunge",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight", "dumbbell"],
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    instructions: [
      "Step into a stance wide enough that both knees can bend comfortably.",
      "Lower straight down while keeping the front foot planted and torso steady.",
      "Stop before the front knee or hip loses control.",
      "Drive through the front foot to return to the start."
    ],
    cues: ["Front foot heavy", "Drop straight down", "Stay tall through the torso"],
    commonMistakes: ["Taking too narrow a stance", "Pushing off the back foot only", "Front knee collapsing inward"],
    safetyNotes: ["Hold onto support if balance is the limiting factor.", "Use a split squat or supported split squat if the knee feels unstable."],
    modifications: ["Reverse lunge", "Supported split squat", "Split squat to shallow depth"],
    image: mediaRef("lunge", "Lunge stance guide")
  }),
  movement({
    id: "overhead-press",
    name: "Overhead Press",
    category: "strength",
    difficulty: "intermediate",
    environment: "both",
    equipment: ["dumbbell", "machine", "barbell"],
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Triceps", "Upper back"],
    instructions: [
      "Start with the load at shoulder height and ribs stacked over the hips.",
      "Brace lightly and press straight up without leaning back.",
      "Finish with the weight over the mid-foot and shoulders active.",
      "Lower to the start under control."
    ],
    cues: ["Ribs down", "Punch straight up", "Finish tall"],
    commonMistakes: ["Overarching the lower back", "Pressing out in front", "Shrugging early"],
    safetyNotes: ["Skip or reduce load when shoulder symptoms are active.", "Use a machine or neutral grip if overhead range is limited."],
    modifications: ["Seated dumbbell press", "Neutral-grip press", "Band pull-apart if pressing is not tolerated"],
    image: mediaRef("overhead-press", "Overhead press guide")
  }),
  movement({
    id: "lat-pulldown",
    name: "Lat Pulldown",
    category: "strength",
    difficulty: "beginner",
    environment: "gym",
    equipment: ["machine"],
    primaryMuscles: ["Back"],
    secondaryMuscles: ["Biceps", "Rear delts"],
    instructions: [
      "Sit tall with the bar overhead and shoulders set down away from the ears.",
      "Pull elbows down toward your sides instead of yanking the bar behind you.",
      "Pause near the upper chest with the trunk still.",
      "Return the bar overhead with control."
    ],
    cues: ["Elbows to ribs", "Chest tall", "Control the return"],
    commonMistakes: ["Pulling behind the neck", "Swinging the torso back", "Letting shoulders shrug at the top"],
    safetyNotes: ["Use a neutral handle if the shoulders feel cramped.", "Reduce load if you need momentum to finish reps."],
    modifications: ["Band pulldown", "Chest-supported row", "Half-kneeling single-arm pulldown"],
    image: mediaRef("lat-pulldown", "Lat pulldown guide")
  }),
  movement({
    id: "lateral-raise",
    name: "Lateral Raise",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["dumbbell", "machine", "cable"],
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Upper back"],
    instructions: [
      "Stand tall with a soft elbow bend and shoulders relaxed.",
      "Raise the arms out to the side until about shoulder height.",
      "Pause briefly without shrugging into the neck.",
      "Lower slowly and keep control all the way down."
    ],
    cues: ["Soft elbows", "Lead wide, not high", "Keep the neck relaxed"],
    commonMistakes: ["Swinging the torso", "Turning it into a shrug", "Going too heavy to control the top"],
    safetyNotes: ["Stay in a pain-free range if shoulder irritation is present.", "Drop load before form starts to swing."],
    modifications: ["Cable raise", "Partial-range raise", "Wall slide for shoulder control work"],
    image: mediaRef("lateral-raise", "Lateral raise guide")
  }),
  movement({
    id: "triceps-pushdown",
    name: "Triceps Pushdown",
    category: "strength",
    difficulty: "beginner",
    environment: "gym",
    equipment: ["machine", "cable"],
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Shoulders"],
    instructions: [
      "Set the elbows near your sides and keep the chest steady.",
      "Press the handle down by extending the elbows, not by rocking the torso.",
      "Pause with the arms straight and shoulders quiet.",
      "Return with control until the forearms are about parallel to the floor."
    ],
    cues: ["Elbows stay pinned", "Move the forearms only", "Quiet shoulders"],
    commonMistakes: ["Swinging the torso", "Letting elbows drift forward", "Slamming the weight stack"],
    safetyNotes: ["Use a rope or neutral handle if elbows are sensitive.", "Reduce range if elbow pain sharpens."],
    modifications: ["Band pushdown", "Close-grip push-up", "Overhead triceps extension with lighter load"],
    image: mediaRef("triceps-pushdown", "Triceps pushdown guide")
  }),
  movement({
    id: "biceps-curl",
    name: "Biceps Curl",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["dumbbell", "barbell", "machine"],
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Stand tall with elbows close to your sides.",
      "Curl the load up without swinging the shoulders or torso.",
      "Pause briefly at the top if you can still keep the elbows quiet.",
      "Lower under control to a full stretch."
    ],
    cues: ["Elbows stay close", "No torso swing", "Own the lowering phase"],
    commonMistakes: ["Leaning back to finish reps", "Letting elbows drift forward", "Dropping the weight too quickly"],
    safetyNotes: ["Use a neutral grip if elbows or wrists feel cranky.", "Keep load lighter if shoulder compensation shows up."],
    modifications: ["Hammer curl", "Cable curl", "Alternating dumbbell curl"],
    image: mediaRef("biceps-curl", "Biceps curl guide")
  }),
  movement({
    id: "calf-raise",
    name: "Calf Raise",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight", "machine", "dumbbell"],
    primaryMuscles: ["Calves"],
    secondaryMuscles: ["Feet"],
    instructions: [
      "Stand tall with even pressure through the base of the foot.",
      "Rise smoothly onto the ball of the foot without rolling the ankle.",
      "Pause briefly at the top and stay tall.",
      "Lower slowly until the heel is back under control."
    ],
    cues: ["Push through the big toe", "Smooth up and down", "Ankles stay straight"],
    commonMistakes: ["Bouncing at the bottom", "Rolling outward on the foot", "Rushing through reps"],
    safetyNotes: ["Use support if balance is limiting control.", "Keep range smaller if the Achilles is sensitive."],
    modifications: ["Supported calf raise", "Seated calf raise", "Single-leg calf raise"],
    image: mediaRef("calf-raise", "Calf raise guide")
  }),
  movement({
    id: "hip-thrust",
    name: "Hip Thrust",
    category: "strength",
    difficulty: "intermediate",
    environment: "both",
    equipment: ["barbell", "dumbbell", "bench"],
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    instructions: [
      "Set the upper back on support and feet flat with knees bent.",
      "Brace lightly and drive through the heels to lift the hips.",
      "Finish with ribs down and glutes squeezed instead of overextending the back.",
      "Lower under control until the hips reset."
    ],
    cues: ["Drive through heels", "Ribs down at the top", "Squeeze glutes, not low back"],
    commonMistakes: ["Overarching the back", "Feet too far away", "Rushing the top position"],
    safetyNotes: ["Use bodyweight or glute bridge first if setup feels unstable.", "Stop short of painful hip pinching."],
    modifications: ["Glute bridge", "Dumbbell hip thrust", "Paused bodyweight bridge"],
    image: mediaRef("hip-thrust", "Hip thrust guide")
  }),
  movement({
    id: "glute-bridge",
    name: "Glute Bridge",
    category: "rehab",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight", "band"],
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
    instructions: [
      "Lie on your back with knees bent and feet planted.",
      "Brace lightly and press through the heels to lift the hips.",
      "Finish by squeezing the glutes, not by arching the low back.",
      "Lower slowly until the hips touch down."
    ],
    cues: ["Ribs stay down", "Push through heels", "Squeeze glutes at the top"],
    commonMistakes: ["Driving from the low back", "Feet too far from the hips", "Rushing the lowering phase"],
    safetyNotes: ["Keep range smaller if the back or front of the hip gets irritated.", "Pause and reset if hamstrings cramp early."],
    modifications: ["Bridge hold", "Single-leg bridge", "Banded bridge"],
    image: mediaRef("glute-bridge", "Glute bridge guide")
  }),
  movement({
    id: "band-pull-apart",
    name: "Band Pull-Apart",
    category: "rehab",
    difficulty: "beginner",
    environment: "both",
    equipment: ["band"],
    primaryMuscles: ["Upper back", "Rear delts"],
    secondaryMuscles: ["Shoulders"],
    instructions: [
      "Hold a light band at shoulder height with soft elbows.",
      "Pull the band apart by spreading the hands and squeezing between the shoulder blades.",
      "Pause when the chest feels open and shoulders stay down.",
      "Return slowly to the start."
    ],
    cues: ["Long neck", "Spread the band", "Squeeze between the shoulder blades"],
    commonMistakes: ["Shrugging up into the neck", "Arching the back", "Using a band that is too heavy"],
    safetyNotes: ["Use a lighter band if you cannot keep the shoulders quiet.", "Stay in pain-free range when the shoulder is irritated."],
    modifications: ["Wall slide", "Face pull with light cable", "Partial-range pull-apart"],
    image: mediaRef("band-pull-apart", "Band pull-apart guide")
  }),
  movement({
    id: "wall-squat",
    name: "Wall Squat",
    category: "rehab",
    difficulty: "beginner",
    environment: "both",
    equipment: ["wall"],
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core"],
    instructions: [
      "Stand with your back supported and feet a comfortable distance from the wall.",
      "Slide down only into a depth you can control pain-free.",
      "Keep even pressure through both feet and hold with steady breathing.",
      "Drive through the feet to return up or end the hold."
    ],
    cues: ["Use the wall for support", "Stay pain-aware", "Even pressure through both feet"],
    commonMistakes: ["Sliding too deep too soon", "Letting knees collapse inward", "Holding breath through the entire set"],
    safetyNotes: ["Keep the hold short and shallow if knee confidence is low.", "Stop if pressure becomes sharp instead of muscular."],
    modifications: ["Supported box squat pattern", "Sit-to-stand", "Partial wall sit"],
    image: mediaRef("wall-squat", "Wall squat guide")
  }),
  movement({
    id: "supported-split-squat",
    name: "Supported Split Squat",
    category: "rehab",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight", "support"],
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Core"],
    instructions: [
      "Set a split stance and hold a support for balance.",
      "Lower slowly while keeping most of the pressure through the front foot.",
      "Stay within a depth where the front knee and hip remain controlled.",
      "Stand back up through the front leg."
    ],
    cues: ["Use the support", "Front foot heavy", "Stay tall"],
    commonMistakes: ["Dropping too deep", "Shifting all weight to the back leg", "Losing balance and rushing reps"],
    safetyNotes: ["This is a better option when lunges feel unstable.", "Shorten the range before pain or balance becomes the limiter."],
    modifications: ["Static split squat hold", "Reverse lunge to support", "Wall squat"],
    image: mediaRef("supported-split-squat", "Supported split squat guide")
  }),
  movement({
    id: "hamstring-stretch",
    name: "Hamstring Stretch",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: ["Calves"],
    instructions: [
      "Set one heel forward and hinge from the hips with a long spine.",
      "Keep the front knee soft instead of locking it out hard.",
      "Lean until you feel a stretch behind the thigh, not pain in the back.",
      "Breathe steadily and ease out slowly."
    ],
    cues: ["Hinge, do not round", "Soft front knee", "Breathe into the stretch"],
    commonMistakes: ["Rounding the low back", "Forcing range", "Locking the knee"],
    safetyNotes: ["Back off if you feel nerve tension or sharp pulling.", "Use support if balance affects the position."],
    modifications: ["Supine hamstring stretch", "Bent-knee hamstring stretch", "Dynamic leg swing"],
    image: mediaRef("hamstring-stretch", "Hamstring stretch guide")
  }),
  movement({
    id: "hip-flexor-stretch",
    name: "Hip Flexor Stretch",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Hip flexors"],
    secondaryMuscles: ["Quads", "Glutes"],
    instructions: [
      "Set a half-kneeling position with the ribs stacked over the hips.",
      "Gently tuck the pelvis and squeeze the glute on the kneeling side.",
      "Shift forward slightly until the front of the hip opens.",
      "Hold steady without arching the low back."
    ],
    cues: ["Tuck first, then glide", "Glute stays on", "Ribs over hips"],
    commonMistakes: ["Leaning way forward", "Arching through the low back", "Forcing the range aggressively"],
    safetyNotes: ["Pad the knee if needed.", "Keep it gentle if the front of the hip feels pinchy."],
    modifications: ["Standing hip flexor stretch", "Shorter-range half-kneeling hold", "Split-stance hip opener"],
    image: mediaRef("hip-flexor-stretch", "Hip flexor stretch guide")
  }),
  movement({
    id: "thoracic-rotation",
    name: "Thoracic Rotation",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Upper back"],
    secondaryMuscles: ["Shoulders", "Core"],
    instructions: [
      "Set a side-lying or quadruped position with the lower back quiet.",
      "Rotate through the upper back while following the hand with your eyes.",
      "Pause at the open position and breathe out.",
      "Return smoothly without forcing the neck."
    ],
    cues: ["Rotate from the upper back", "Eyes follow the hand", "Exhale into the open position"],
    commonMistakes: ["Twisting through the low back", "Yanking the shoulder open", "Holding the breath"],
    safetyNotes: ["Keep the range small if the shoulder feels pinchy.", "Move slowly if dizziness shows up during rotation."],
    modifications: ["Thread the needle", "Open book", "Wall-supported rotation"],
    image: mediaRef("thoracic-rotation", "Thoracic rotation guide")
  }),
  movement({
    id: "shoulder-mobility",
    name: "Shoulder Mobility",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight", "band", "wall"],
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Upper back"],
    instructions: [
      "Move the shoulder through a comfortable range while keeping the ribs down.",
      "Focus on smooth reaching and controlled rotation, not forcing end range.",
      "Pause briefly where you can breathe and stay relaxed.",
      "Reset if the neck starts taking over."
    ],
    cues: ["Relax the neck", "Smooth reach", "Move only in pain-free range"],
    commonMistakes: ["Shrugging through every rep", "Forcing overhead range", "Arching the low back to cheat mobility"],
    safetyNotes: ["Keep motion small during active shoulder irritation.", "Control matters more than range."],
    modifications: ["Wall slide", "Band shoulder opener", "Supported arm circles"],
    image: mediaRef("shoulder-mobility", "Shoulder mobility guide")
  }),
  movement({
    id: "plank",
    name: "Plank",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Shoulders", "Glutes"],
    instructions: [
      "Set elbows or hands under the shoulders and make a straight body line.",
      "Brace the trunk gently and squeeze the glutes.",
      "Keep the head neutral and breathe behind the brace.",
      "Finish before the hips sag or the shoulders shrug."
    ],
    cues: ["Long line", "Ribs down", "Breathe, do not hold"],
    commonMistakes: ["Sagging through the hips", "Piking too high", "Looking too far forward"],
    safetyNotes: ["Elevate the hands if shoulder or low-back comfort is limited.", "Shorter, cleaner holds beat long sloppy holds."],
    modifications: ["Incline plank", "Knee plank", "Side plank"],
    image: mediaRef("plank", "Plank guide")
  }),
  movement({
    id: "dead-bug",
    name: "Dead Bug",
    category: "rehab",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Hip flexors", "Shoulders"],
    instructions: [
      "Lie on your back with knees and arms stacked over the hips and shoulders.",
      "Exhale to flatten the ribs gently toward the floor.",
      "Reach the opposite arm and leg away without losing trunk position.",
      "Return and switch sides with control."
    ],
    cues: ["Exhale first", "Keep ribs heavy", "Move slowly"],
    commonMistakes: ["Arching the low back", "Rushing the limb movement", "Going too far for control"],
    safetyNotes: ["Limit range if you lose trunk control.", "Use this as a recovery drill, not a speed exercise."],
    modifications: ["Heel taps", "Arms-only dead bug", "Dead bug breathing hold"],
    image: mediaRef("dead-bug", "Dead bug guide")
  }),
  movement({
    id: "bird-dog",
    name: "Bird Dog",
    category: "rehab",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Glutes", "Shoulders"],
    instructions: [
      "Set up on hands and knees with wrists under shoulders and knees under hips.",
      "Brace gently so the low back keeps its natural position.",
      "Reach one arm and the opposite leg long without letting the hips rotate.",
      "Pause briefly, return with control, and switch sides."
    ],
    cues: ["Long line from hand to heel", "Hips stay square", "Reach, don't lift high"],
    commonMistakes: ["Arching the low back as the leg lifts", "Rotating the hips open", "Rushing between sides"],
    safetyNotes: ["Shorten the reach if the trunk wobbles.", "Keep the head in line with the spine instead of looking up."],
    modifications: ["Arm-only reach", "Leg-only reach", "Bird dog with elbow-to-knee touch"],
    image: mediaRef("bird-dog", "Bird dog form guide")
  }),
  movement({
    id: "crunch",
    name: "Crunch",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Hip flexors"],
    instructions: [
      "Lie on your back with knees bent, feet flat, and fingertips lightly at the sides of your head.",
      "Exhale and curl your shoulder blades off the floor, leading with the chest instead of the chin.",
      "Pause briefly at the top with your abs engaged and lower back still on the floor.",
      "Lower back down with control and repeat without pulling on your neck."
    ],
    cues: ["Curl, don't yank", "Chin off the chest", "Low back stays down"],
    commonMistakes: ["Pulling the head forward with the hands", "Lifting the lower back off the floor", "Using momentum instead of the abs"],
    safetyNotes: ["Keep the movement small and controlled if the neck gets tense.", "Stop short of any range that pulls the low back off the floor."],
    modifications: ["Reach-forward crunch with arms extended", "Slow-tempo crunch", "Reverse crunch"],
    image: mediaRef("crunch", "Crunch form guide")
  }),
  movement({
    id: "leg-raise",
    name: "Leg Raise",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Hip flexors"],
    instructions: [
      "Lie on your back with legs straight and together, arms flat by your sides with palms down.",
      "Press your lower back gently into the floor and raise both straight legs toward the ceiling.",
      "Lift until your legs are roughly vertical, keeping the lower back down.",
      "Lower the legs back toward the floor slowly, stopping before the back arches."
    ],
    cues: ["Low back stays down", "Legs long and together", "Lower under control"],
    commonMistakes: ["Letting the lower back arch off the floor", "Bending the knees to cheat the range", "Dropping the legs fast at the bottom"],
    safetyNotes: ["Bend the knees or reduce the range if the low back lifts.", "Place your hands under your glutes for extra support if needed."],
    modifications: ["Bent-knee leg raise", "Single-leg raise", "Heels-to-floor tempo lower"],
    image: mediaRef("leg-raise", "Leg raise form guide")
  }),
  movement({
    id: "russian-twist",
    name: "Russian Twist",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight", "dumbbell"],
    primaryMuscles: ["Core", "Obliques"],
    secondaryMuscles: ["Hip flexors"],
    instructions: [
      "Sit with knees bent and feet lightly on the floor, leaning your torso back to about 45 degrees.",
      "Clasp your hands in front of your chest and keep your spine long, not rounded.",
      "Rotate your shoulders and hands toward one side, moving from the ribcage rather than just the arms.",
      "Return through the center and rotate to the other side with control."
    ],
    cues: ["Rotate from the ribs", "Chest tall, back long", "Move under control"],
    commonMistakes: ["Rounding the lower back", "Swinging the arms without turning the torso", "Rushing the reps"],
    safetyNotes: ["Sit taller and reduce the lean-back if the low back rounds.", "Keep the pace slow enough to feel the obliques working."],
    modifications: ["Feet-down Russian twist", "Slow tempo without weight", "Seated torso rotations"],
    image: mediaRef("russian-twist", "Russian twist form guide")
  }),
  movement({
    id: "side-plank",
    name: "Side Plank",
    category: "strength",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Obliques"],
    secondaryMuscles: ["Shoulders", "Glutes"],
    instructions: [
      "Set the elbow under the shoulder and stack the ribs over the hips.",
      "Lift the hips until the body forms one long diagonal line.",
      "Keep the top shoulder relaxed and breathe steadily.",
      "Lower before the hips rotate or sag."
    ],
    cues: ["Elbow under shoulder", "Lift from the side body", "Stay long through the spine"],
    commonMistakes: ["Rolling the chest down", "Shoulder shrugging", "Holding too long with poor shape"],
    safetyNotes: ["Bend the knees if shoulder or side-body strength is limited.", "Stop if the shoulder loses stability."],
    modifications: ["Knee side plank", "Short-lever side plank", "Supported side plank against wall"],
    image: mediaRef("side-plank", "Side plank guide")
  }),
  movement({
    id: "mountain-climber",
    name: "Mountain Climber",
    category: "cardio",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Core", "Hip flexors"],
    secondaryMuscles: ["Shoulders", "Cardio"],
    instructions: [
      "Start in a strong plank with hands under shoulders.",
      "Drive one knee toward the chest without letting the hips jump up.",
      "Switch smoothly and keep the trunk stable.",
      "Move only as fast as you can maintain a solid plank."
    ],
    cues: ["Strong plank first", "Quick feet, quiet hips", "Hands press the floor away"],
    commonMistakes: ["Bouncing the hips high", "Rounding hard through the upper back", "Going too fast to control"],
    safetyNotes: ["Elevate the hands if wrists or shoulders are irritated.", "Slow the tempo if low-back control slips."],
    modifications: ["Incline mountain climber", "Slow climber", "Marching plank"],
    image: mediaRef("mountain-climber", "Mountain climber guide")
  }),
  movement({
    id: "jumping-jack",
    name: "Jumping Jack",
    category: "cardio",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Cardio"],
    secondaryMuscles: ["Shoulders", "Calves"],
    instructions: [
      "Stand tall with feet together and arms at your sides.",
      "Jump the feet out wide while sweeping the arms overhead in one motion.",
      "Land softly with knees relaxed, not locked.",
      "Jump back to the start position and keep an even rhythm."
    ],
    cues: ["Land soft", "Full arm sweep", "Steady rhythm over speed"],
    commonMistakes: ["Landing stiff-legged", "Cutting the arm swing short", "Leaning forward as fatigue builds"],
    safetyNotes: ["Step the feet out instead of jumping if impact is uncomfortable.", "Slow the pace before form breaks down."],
    modifications: ["Step jack", "Half jack", "Low-impact arm-only jack"],
    image: mediaRef("jumping-jack", "Jumping jack form guide")
  }),
  movement({
    id: "high-knees",
    name: "High Knees",
    category: "cardio",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Cardio"],
    secondaryMuscles: ["Hip flexors", "Calves"],
    instructions: [
      "Stand tall and start with a light bounce through the feet.",
      "Drive one knee up toward hip height while the opposite arm swings naturally.",
      "Switch quickly while staying tall through the trunk.",
      "Land softly and keep rhythm smooth."
    ],
    cues: ["Tall posture", "Fast arms help fast legs", "Soft landings"],
    commonMistakes: ["Leaning way back", "Slamming the feet", "Letting the knees stay low while sprinting arms only"],
    safetyNotes: ["Use a march if impact is not comfortable.", "Shorter rounds work better than sloppy speed."],
    modifications: ["High-knee march", "Fast march in place", "Low-impact cardio step"],
    image: mediaRef("high-knees", "High knees guide")
  }),
  movement({
    id: "burpee",
    name: "Burpee",
    category: "cardio",
    difficulty: "intermediate",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Cardio"],
    secondaryMuscles: ["Chest", "Legs", "Core"],
    instructions: [
      "Start standing, hinge down, and place your hands under the shoulders.",
      "Step or jump back into plank while keeping the trunk braced.",
      "Return the feet forward and stand up powerfully.",
      "Add the jump only if you can still land softly and stay in control."
    ],
    cues: ["Hands under shoulders", "Strong plank position", "Land softly"],
    commonMistakes: ["Collapsing into the low back", "Catching feet too wide", "Turning every rep into a rushed flop"],
    safetyNotes: ["Step the feet instead of jumping if joints are irritated.", "Use a squat-thrust version if the full burpee feels too aggressive."],
    modifications: ["Step-back burpee", "Squat thrust", "Plank walkout"],
    image: mediaRef("burpee", "Burpee guide")
  }),
  movement({
    id: "cat-cow",
    name: "Cat-Cow",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Spine"],
    secondaryMuscles: ["Core", "Upper back"],
    instructions: [
      "Start on hands and knees with shoulders over wrists and hips over knees.",
      "Round the spine gently as you exhale into cat.",
      "Then lengthen the front body and lift the chest softly into cow.",
      "Move smoothly with the breath instead of forcing range."
    ],
    cues: ["Move with the breath", "Segment the spine", "Smooth and easy"],
    commonMistakes: ["Jamming the neck", "Rushing through range", "Forcing the low back too hard"],
    safetyNotes: ["Stay in a small range if the back feels sensitive.", "Use a towel under the knees if needed."],
    modifications: ["Seated cat-cow", "Child's pose to tabletop flow", "Short-range spinal waves"],
    image: mediaRef("cat-cow", "Cat-cow guide")
  }),
  movement({
    id: "worlds-greatest-stretch",
    name: "World's Greatest Stretch",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Hips", "Thoracic spine"],
    secondaryMuscles: ["Hamstrings", "Shoulders"],
    instructions: [
      "Step into a long lunge with the hands framing the front foot.",
      "Drop the back knee if needed and open the chest into rotation.",
      "Return the hand to the floor and settle into the hip stretch briefly.",
      "Switch sides with control."
    ],
    cues: ["Long lunge stance", "Rotate from the upper back", "Breathe between positions"],
    commonMistakes: ["Rushing the transitions", "Collapsing the chest", "Forcing the rotation with the neck"],
    safetyNotes: ["Use blocks or support if hands do not comfortably reach the floor.", "Shorten the stride if the front hip pinches."],
    modifications: ["Split-stance reach", "Open-book rotation", "Half-kneeling mobility flow"],
    image: mediaRef("worlds-greatest-stretch", "Total-body mobility guide")
  }),
  movement({
    id: "hip-flow-90-90",
    name: "90/90 Hip Flow",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Hips"],
    secondaryMuscles: ["Glutes", "Core"],
    instructions: [
      "Sit tall with both knees bent into a 90/90 position.",
      "Rotate through the hips to switch both knees to the other side.",
      "Move slowly and stay tall instead of collapsing backward.",
      "Use the hands for support only as much as needed."
    ],
    cues: ["Tall torso", "Rotate from the hips", "Smooth switches"],
    commonMistakes: ["Throwing the knees over with momentum", "Collapsing the chest", "Forcing painful hip range"],
    safetyNotes: ["Limit range if the front or deep hip feels pinchy.", "Keep a hand down for balance if needed."],
    modifications: ["Supported 90/90 switch", "Seated hip rotations", "Half-range hip flow"],
    image: mediaRef("hip-flow-90-90", "90/90 hip flow guide")
  }),
  movement({
    id: "wall-slide",
    name: "Wall Slide",
    category: "rehab",
    difficulty: "beginner",
    environment: "both",
    equipment: ["wall"],
    primaryMuscles: ["Shoulders", "Upper back"],
    secondaryMuscles: ["Core"],
    instructions: [
      "Stand with forearms or hands against the wall and ribs stacked.",
      "Slide the arms upward while keeping the neck relaxed and shoulders controlled.",
      "Pause where you can still keep contact and control.",
      "Return slowly without arching the low back."
    ],
    cues: ["Ribs down", "Reach and slide", "Keep the neck quiet"],
    commonMistakes: ["Arching the back to gain range", "Shrugging hard", "Pushing into pain"],
    safetyNotes: ["Stay below painful overhead range.", "Move slower if shoulder control is the main goal."],
    modifications: ["Supported arm raise", "Band pull-apart", "Table slide"],
    image: mediaRef("wall-slide", "Wall slide guide")
  }),
  movement({
    id: "childs-pose-side-reach",
    name: "Child's Pose with Side Reach",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Lats", "Upper back"],
    secondaryMuscles: ["Hips"],
    instructions: [
      "Sit back into child's pose with the arms long in front.",
      "Walk both hands to one side and breathe into the long side body.",
      "Hold for a few easy breaths without forcing the hips down.",
      "Return to center and repeat on the other side."
    ],
    cues: ["Long reach", "Easy breathing", "Let the side body open"],
    commonMistakes: ["Forcing the hips down aggressively", "Collapsing into the shoulders", "Holding the breath"],
    safetyNotes: ["Use a cushion under the hips if knees are tight.", "Stay higher if the shoulders feel pinchy overhead."],
    modifications: ["Table-supported lat stretch", "Quadruped side reach", "Short-range prayer stretch"],
    image: mediaRef("childs-pose-side-reach", "Side reach stretch guide")
  }),
  movement({
    id: "ankle-rocks",
    name: "Half-Kneeling Ankle Rocks",
    category: "mobility",
    difficulty: "beginner",
    environment: "both",
    equipment: ["bodyweight"],
    primaryMuscles: ["Ankles"],
    secondaryMuscles: ["Calves"],
    instructions: [
      "Set a half-kneeling stance with the front foot flat.",
      "Drive the front knee forward over the middle toes without lifting the heel.",
      "Pause at the end range you can control.",
      "Rock back and repeat smoothly."
    ],
    cues: ["Heel stays down", "Knee tracks over toes", "Smooth rock forward"],
    commonMistakes: ["Letting the arch collapse", "Popping the heel up", "Forcing the knee too far inward"],
    safetyNotes: ["Use support if balance gets in the way.", "Stay pain-aware if the ankle or knee is irritated."],
    modifications: ["Wall ankle rocks", "Short-range forward knee drives", "Supported calf stretch"],
    image: mediaRef("ankle-rocks", "Ankle mobility guide")
  })
];

const MOVEMENTS_BY_ID = new Map(MOVEMENT_LIBRARY.map((movementEntry) => [movementEntry.id, movementEntry]));

const MOVEMENT_NAME_ALIASES = new Map(
  [
    ["barbell bench press", "dumbbell-press"],
    ["incline dumbbell press", "dumbbell-press"],
    ["bench press", "dumbbell-press"],
    ["dumbbell floor press", "dumbbell-press"],
    ["dumbbell press", "dumbbell-press"],
    ["flat dumbbell bench press", "dumbbell-press"],
    ["machine chest press", "dumbbell-press"],
    ["incline machine press", "dumbbell-press"],
    ["band chest press", "dumbbell-press"],
    ["seated shoulder press", "overhead-press"],
    ["dumbbell shoulder press", "overhead-press"],
    ["overhead press", "overhead-press"],
    ["arnold press", "overhead-press"],
    ["band overhead press", "overhead-press"],
    ["half-kneeling dumbbell press", "overhead-press"],
    ["landmine press", "overhead-press"],
    ["z-press", "overhead-press"],
    ["pike push-up", "overhead-press"],
    ["dumbbell thruster", "overhead-press"],
    ["goblet squat to press", "overhead-press"],
    ["band thruster", "overhead-press"],
    ["man maker", "overhead-press"],
    ["cable lateral raise", "lateral-raise"],
    ["dumbbell lateral raise", "lateral-raise"],
    ["band lateral raise", "lateral-raise"],
    ["lean-away lateral raise", "lateral-raise"],
    ["triceps pushdown", "triceps-pushdown"],
    ["band pressdown", "triceps-pushdown"],
    ["bench dip", "triceps-pushdown"],
    ["overhead dumbbell extension", "triceps-pushdown"],
    ["rope overhead extension", "triceps-pushdown"],
    ["skull crusher", "triceps-pushdown"],
    ["lat pulldown", "lat-pulldown"],
    ["assisted pull-up", "lat-pulldown"],
    ["band pulldown", "lat-pulldown"],
    ["neutral-grip lat pulldown", "lat-pulldown"],
    ["chin-up", "lat-pulldown"],
    ["pull-up negative", "lat-pulldown"],
    ["back widow", "lat-pulldown"],
    ["straight-arm band pulldown", "lat-pulldown"],
    ["chest-supported row", "row"],
    ["single-arm dumbbell row", "row"],
    ["cable row", "row"],
    ["band row", "row"],
    ["seated cable row", "row"],
    ["doorframe row", "row"],
    ["inverted row", "row"],
    ["tripod row", "row"],
    ["t-bar row", "row"],
    ["machine row", "row"],
    ["renegade row", "row"],
    ["band row to squat", "row"],
    ["bear crawl drag", "row"],
    ["cable face pull", "band-pull-apart"],
    ["reverse fly", "band-pull-apart"],
    ["reverse snow angel", "band-pull-apart"],
    ["ez-bar curl", "biceps-curl"],
    ["hammer curl", "biceps-curl"],
    ["band curl", "biceps-curl"],
    ["concentration curl", "biceps-curl"],
    ["incline dumbbell curl", "biceps-curl"],
    ["preacher curl", "biceps-curl"],
    ["rope hammer curl", "biceps-curl"],
    ["reverse curl", "biceps-curl"],
    ["towel curl isometric", "biceps-curl"],
    ["back squat", "squat"],
    ["front squat", "squat"],
    ["bodyweight squat", "squat"],
    ["goblet squat", "squat"],
    ["jump squat", "squat"],
    ["banded squat", "squat"],
    ["front-foot elevated squat", "squat"],
    ["leg press", "squat"],
    ["supported box squat pattern", "wall-squat"],
    ["romanian deadlift", "deadlift"],
    ["dumbbell romanian deadlift", "deadlift"],
    ["band hip hinge", "deadlift"],
    ["hip hinge reach", "deadlift"],
    ["banded good morning", "deadlift"],
    ["kettlebell deadlift", "deadlift"],
    ["trap-bar deadlift", "deadlift"],
    ["walking lunge", "lunge"],
    ["reverse lunge", "lunge"],
    ["banded reverse lunge", "lunge"],
    ["rear-foot elevated split squat", "lunge"],
    ["step-up", "lunge"],
    ["step-up to knee drive", "lunge"],
    ["bulgarian split squat", "supported-split-squat"],
    ["supported split squat", "supported-split-squat"],
    ["standing calf raise", "calf-raise"],
    ["seated calf raise", "calf-raise"],
    ["single-leg calf raise", "calf-raise"],
    ["band calf raise", "calf-raise"],
    ["hip thrust", "hip-thrust"],
    ["cable pull-through", "hip-thrust"],
    ["leg curl", "deadlift"],
    ["push-up", "push-up"],
    ["close-grip push-up", "push-up"],
    ["deficit push-up", "push-up"],
    ["push-up to down dog", "push-up"],
    ["glute bridge", "glute-bridge"],
    ["banded glute bridge", "glute-bridge"],
    ["dumbbell glute bridge", "glute-bridge"],
    ["plank", "plank"],
    ["plank shoulder tap", "plank"],
    ["dead bug", "dead-bug"],
    ["dead bug breathing", "dead-bug"],
    ["side plank", "side-plank"],
    ["world's greatest stretch", "worlds-greatest-stretch"],
    ["cat-cow", "cat-cow"],
    ["90/90 hip switch", "hip-flow-90-90"],
    ["90/90 hip flow", "hip-flow-90-90"],
    ["mountain climber", "mountain-climber"],
    ["high knees", "high-knees"],
    ["burpee", "burpee"],
    ["band power step", "high-knees"],
    ["bike sprint", "high-knees"],
    ["jump rope", "high-knees"],
    ["band shoulder opener", "shoulder-mobility"],
    ["thread the needle", "thoracic-rotation"],
    ["thoracic rotation", "thoracic-rotation"],
    ["doorway pec stretch", "shoulder-mobility"],
    ["half-kneeling ankle rocks", "ankle-rocks"],
    ["walking spiderman reach", "worlds-greatest-stretch"],
    ["child's pose with side reach", "childs-pose-side-reach"],
    ["wall slide", "wall-slide"],
    ["glute bridge hold", "glute-bridge"],
    ["sumo deadlift", "deadlift"],
    ["good morning", "deadlift"],
    ["hamstring curl", "deadlift"],
    ["seated hamstring curl", "deadlift"],
    ["lying hamstring curl", "deadlift"],
    ["leg extension", "squat"],
    ["split squat", "supported-split-squat"],
    ["front-foot elevated split squat", "supported-split-squat"],
    ["dumbbell walking lunge", "lunge"],
    ["goblet reverse lunge", "lunge"],
    ["dumbbell step-up", "lunge"],
    ["cable glute kickback", "hip-thrust"],
    ["band glute kickback", "hip-thrust"],
    ["treadmill incline walk", "high-knees"],
    ["assault bike sprint", "high-knees"],
    ["reverse crunch", "crunch"],
    ["bicycle crunch", "crunch"],
    ["cable crunch", "crunch"],
    ["leg raise", "leg-raise"],
    ["lying leg raise", "leg-raise"],
    ["hanging knee raise", "leg-raise"]
  ].map(([name, id]) => [name.toLowerCase(), id])
);

export function getMovementLibrary() {
  return MOVEMENT_LIBRARY.map(cloneMovement);
}

export function getMovementById(id) {
  return cloneMovement(MOVEMENTS_BY_ID.get(id) || null);
}

export function findMovementForName(name) {
  const normalizedName = String(name || "").trim().toLowerCase();
  if (!normalizedName) {
    return null;
  }

  const slugId = normalizedName
    .replaceAll("'", "")
    .replaceAll("/", " ")
    .replaceAll(/\s+/g, "-");
  const directId = MOVEMENT_NAME_ALIASES.get(normalizedName) || MOVEMENT_NAME_ALIASES.get(slugId) || normalizedName || slugId;
  const directMatch = getMovementById(directId) || getMovementById(slugId);
  if (directMatch) {
    return directMatch;
  }
  return MOVEMENT_LIBRARY.find((entry) => entry.name.toLowerCase() === normalizedName) ? cloneMovement(MOVEMENT_LIBRARY.find((entry) => entry.name.toLowerCase() === normalizedName)) : null;
}

export function attachMovementToExercise(exercise) {
  const movementEntry = getMovementById(exercise.movementId) || findMovementForName(exercise.name);
  return {
    ...exercise,
    movementId: movementEntry?.id || exercise.movementId || null,
    movement: movementEntry
  };
}

export function adaptMovementForProfile(movementId, profile = {}) {
  const movementEntry = getMovementById(movementId);
  if (!movementEntry || profile.injuryStatus === "none") {
    return movementEntry;
  }

  const restrictedAreas = Array.isArray(profile.restrictedAreas) ? profile.restrictedAreas : [];
  const substitutions = [
    { areas: ["shoulder"], match: ["dumbbell-press", "overhead-press", "push-up", "lateral-raise"], replaceWith: "band-pull-apart" },
    { areas: ["shoulder"], match: ["lat-pulldown"], replaceWith: "wall-slide" },
    { areas: ["knee"], match: ["squat", "lunge"], replaceWith: "wall-squat" },
    { areas: ["hip"], match: ["lunge", "squat"], replaceWith: "supported-split-squat" },
    { areas: ["back"], match: ["deadlift"], replaceWith: "glute-bridge" },
    { areas: ["back"], match: ["squat"], replaceWith: "wall-squat" },
    { areas: ["ankle"], match: ["lunge"], replaceWith: "supported-split-squat" }
  ];

  const replacement = substitutions.find(
    (rule) => rule.match.includes(movementEntry.id) && rule.areas.some((area) => restrictedAreas.includes(area))
  );

  return replacement ? getMovementById(replacement.replaceWith) : movementEntry;
}

export function selectFeaturedMovements({ goalType, preferredEnvironment, injuryStatus, restrictedAreas, mobilityEnabled }) {
  const baseSelections = {
    strength: ["squat", "deadlift", "row"],
    athletic_performance: ["overhead-press", "row", "thoracic-rotation"],
    bodybuilding: ["dumbbell-press", "row", "lateral-raise"],
    fat_loss: ["lunge", "push-up", "mountain-climber"],
    general_fitness: ["squat", "row", "push-up"],
    mobility: ["hip-flexor-stretch", "thoracic-rotation", "shoulder-mobility"],
    injury_recovery: ["glute-bridge", "band-pull-apart", "supported-split-squat"],
    active_aging: ["squat", "glute-bridge", "hip-flexor-stretch"]
  };
  const environmentBoost =
    preferredEnvironment === "home"
      ? ["push-up", "glute-bridge"]
      : preferredEnvironment === "gym"
        ? ["lat-pulldown", "hip-thrust"]
        : [];
  const mobilityBoost = mobilityEnabled ? ["thoracic-rotation", "hip-flexor-stretch"] : [];
  const combinedIds = dedupeIds([...(baseSelections[goalType] || baseSelections.general_fitness), ...environmentBoost, ...mobilityBoost]);

  return combinedIds
    .map((movementId) => adaptMovementForProfile(movementId, { injuryStatus, restrictedAreas }))
    .filter(Boolean)
    .slice(0, 4);
}

function movement({
  id,
  name,
  category,
  difficulty,
  environment,
  equipment,
  primaryMuscles,
  secondaryMuscles,
  instructions,
  cues,
  commonMistakes,
  safetyNotes,
  modifications,
  image
}) {
  return {
    id,
    name,
    category,
    difficulty,
    environment,
    equipment,
    primaryMuscles,
    secondaryMuscles,
    instructions,
    cues,
    commonMistakes,
    safetyNotes,
    modifications,
    ...resolveMovementMedia(image, name)
  };
}

function mediaRef(key, alt) {
  return {
    type: "media-ref",
    key,
    alt
  };
}

function cloneMovement(movementEntry) {
  if (!movementEntry) {
    return null;
  }

  return {
    ...movementEntry,
    equipment: [...movementEntry.equipment],
    primaryMuscles: [...movementEntry.primaryMuscles],
    secondaryMuscles: [...movementEntry.secondaryMuscles],
    instructions: [...movementEntry.instructions],
    cues: [...movementEntry.cues],
    commonMistakes: [...movementEntry.commonMistakes],
    safetyNotes: [...movementEntry.safetyNotes],
    modifications: [...movementEntry.modifications],
    image: movementEntry.image || null,
    imageAlt: movementEntry.imageAlt || `${movementEntry.name} movement guide`,
    thumbnail: movementEntry.thumbnail || null,
    media: movementEntry.media
      ? {
          ...movementEntry.media,
          images: Array.isArray(movementEntry.media.images) ? [...movementEntry.media.images] : [],
          steps: Array.isArray(movementEntry.media.steps) ? [...movementEntry.media.steps] : []
        }
      : null,
    video: movementEntry.video ? { ...movementEntry.video } : null
  };
}

function dedupeIds(ids) {
  return ids.filter((id, index) => ids.indexOf(id) === index);
}

function resolveMovementMedia(image, name) {
  if (typeof image === "string") {
    return {
      image,
      imageAlt: `${name} movement guide`,
      thumbnail: image,
      media: {
        status: "basic",
        thumbnail: image,
        images: [image, image, image, image],
        steps: [image, image, image, image],
        videoUrl: null
      },
      video: null
    };
  }

  if (image?.type === "media-ref") {
    const mapped = MOVEMENT_MEDIA[image.key] || buildMovementMedia(image.key, image.alt || `${name} movement guide`);
    const resolvedImages = Array.isArray(mapped?.images) ? mapped.images.filter(Boolean) : [];
    const resolvedStatus =
      resolvedImages.length >= 4 || mapped?.videoUrl
        ? "full"
        : mapped?.thumbnail || resolvedImages.length
          ? "basic"
          : "none";
    return {
      image: mapped?.image || null,
      imageAlt: mapped?.imageAlt || image.alt || `${name} movement guide`,
      thumbnail: mapped?.thumbnail || null,
      media: mapped
        ? {
            status: resolvedStatus,
            thumbnail: mapped.thumbnail || null,
            images: resolvedImages,
            steps: resolvedImages,
            videoUrl: mapped.videoUrl || null
          }
        : null,
      video: null
    };
  }

  return {
    image: null,
    imageAlt: `${name} movement guide`,
    thumbnail: null,
    media: null,
    video: null
  };
}

function buildMovementMedia(assetName, imageAlt) {
  const approvedAsset = getReviewedMediaAsset(assetName);
  if (!approvedAsset) {
    return null;
  }

  return {
    image: approvedAsset.image || approvedAsset.thumbnail || null,
    imageAlt,
    thumbnail: approvedAsset.thumbnail || null,
    images: Array.isArray(approvedAsset.images) ? approvedAsset.images : [],
    videoUrl: approvedAsset.videoUrl || null
  };
}
