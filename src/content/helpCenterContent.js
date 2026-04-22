export const HELP_SECTIONS = [
  {
    id: "getting-started",
    label: "Getting Started",
    eyebrow: "Start here",
    title: "Get into the app and understand what it tracks",
    summary:
      "PulsePeak is a logged-in fitness dashboard that combines meals, hydration, recovery, workouts, habits, coaching, and a Premium weekly plan preview.",
    blocks: [
      {
        title: "Create an account or sign in",
        body: [
          "Use the auth screen to create an account with your name, email address, and password. If you already have an account, switch to Sign in and enter your email and password.",
          "After you sign in, PulsePeak opens your dashboard automatically. Your account data stays tied to your login, so your meals, workouts, hydration, recovery, and habits return when you come back."
        ]
      },
      {
        title: "What you can do right away",
        body: [
          "On the free tier, you can use the dashboard, log meals, add hydration, update recovery, browse and log preset workouts, toggle habits, view progress charts, and read the coaching feed.",
          "You can also preview the Premium weekly plan. Free accounts can open a limited preview and see the upgrade call to action, but the full plan stays locked until the account is Premium."
        ]
      },
      {
        title: "Where to go in the app",
        body: [
          "Dashboard is the main workspace for daily logging and guidance. Progress shows your recent weekly score, bodyweight trend, and habit streaks. Coach shows recommendation cards, recovery focus, and longer-term notes.",
          "Help Center explains how each area works and clarifies what free and Premium users should expect."
        ]
      }
    ]
  },
  {
    id: "dashboard-overview",
    label: "Dashboard",
    eyebrow: "Daily use",
    title: "Use the dashboard as your daily home base",
    summary:
      "The dashboard is the most active page in PulsePeak. It mixes daily status, logging forms, workout presets, premium plan access, and habit tracking in one place.",
    blocks: [
      {
        title: "Top of the dashboard",
        body: [
          "The hero area shows your current daily totals for calories, protein, hydration, and training streak. Beside it, the daily score ring gives a high-level view of how complete your day is across the core targets.",
          "Just below that, Today's Focus gives one main recommendation and two next actions. Weekly Momentum gives a short read on whether you are building momentum, staying steady, or need one more action to keep the week moving."
        ]
      },
      {
        title: "Core metric cards",
        body: [
          "The Hydration, Nutrition, Recovery, and Training cards summarize where you are versus your goals. Hydration includes a quick button to add 250 mL without opening another form.",
          "These cards update automatically after you log meals, hydration, workouts, recovery, or habits because the dashboard reloads the latest summary from the API."
        ]
      },
      {
        title: "Daily logging areas",
        body: [
          "Use Daily target planner to set calories, protein, water, sleep, and workout-minute goals. Use Sleep and energy log to update sleep hours and today's energy level. Use Nutrition tracker to add meals with calories and protein.",
          "When you save goals, update recovery, or log a meal, the dashboard shows a status banner and updates your metrics and coaching."
        ]
      }
    ]
  },
  {
    id: "workouts-training",
    label: "Workouts",
    eyebrow: "Gym and home",
    title: "Browse, inspect, and log workouts",
    summary:
      "PulsePeak includes a preset workout library for gym, home, and mixed training, plus a recent training list on the dashboard.",
    blocks: [
      {
        title: "Filter the workout library",
        body: [
          "Use the Environment filter to switch between Both, Gym, and Home. Use Workout type to switch between All, Strength, Cardio, and Mobility.",
          "If no workout presets match your current filter combination, the page shows an empty state telling you to broaden the filters."
        ]
      },
      {
        title: "View workout details before logging",
        body: [
          "Each workout card includes View details. That opens a workout detail modal with the exercise list, equipment, muscle groups, duration, intensity, and workout type so you can inspect the session before you log it.",
          "If the workout looks right, use Log workout from the card or the detail modal."
        ]
      },
      {
        title: "What happens after logging",
        body: [
          "Logged workouts appear in Latest workouts and increase your training minutes. They also affect Today's Focus, Weekly Momentum, the coaching feed, and the personalized weekly plan.",
          "PulsePeak blocks obvious duplicate workout logging in a short time window. If you try to log the same workout again immediately, the app returns an error instead of double-counting it."
        ]
      }
    ]
  },
  {
    id: "weekly-plan",
    label: "Weekly Plan",
    eyebrow: "Premium feature",
    title: "Understand the personalized weekly plan",
    summary:
      "The weekly plan uses your real PulsePeak data to generate a weekly focus, workout cadence, workout mix, recovery emphasis, nutrition guidance, hydration floor, and a coach note.",
    blocks: [
      {
        title: "What the plan is based on",
        body: [
          "The plan is generated from your logged workouts, training frequency, workout type mix, recovery signals like sleep and energy, nutrition gaps, hydration, and daily consistency.",
          "Because it uses your account data, the plan can change after you log meals, workouts, hydration, or recovery updates."
        ]
      },
      {
        title: "Free vs Premium behavior",
        body: [
          "Free users see the weekly plan card in a locked preview state. They can open Preview Full Plan, view a limited preview modal, and use the upgrade button to start checkout.",
          "Premium users see the card in an unlocked state and can open the full weekly plan directly. Premium users should not see limited preview messaging or unlock prompts in the weekly plan surfaces."
        ]
      },
      {
        title: "What each plan section means",
        body: [
          "Weekly focus tells you the main theme for the coming week. Workout cadence explains how many training sessions to aim for. Workout mix shows the balance of strength, cardio, and mobility, plus the likely environment focus.",
          "Recovery emphasis tells you how to manage fatigue, sleep, and intensity. Nutrition guidance explains the main fueling priority for the week. Hydration floor reinforces your daily water target. Coach note gives a short summary of how to use the plan well."
        ]
      }
    ]
  },
  {
    id: "nutrition-recovery-habits",
    label: "Nutrition, Recovery, and Habits",
    eyebrow: "Consistency",
    title: "Use logs and habits to keep the app accurate",
    summary:
      "Meals, recovery updates, hydration, and habits all feed the daily guidance and progress summaries.",
    blocks: [
      {
        title: "Meals and protein tracking",
        body: [
          "In Nutrition tracker, enter a meal name, calories, and protein, then select Log meal. Meals appear in the list below the form and contribute to your calorie and protein totals immediately.",
          "Today's Focus and the Premium weekly plan both use these meal totals. If protein is behind, the app may shift the recommendation toward protein-first meals."
        ]
      },
      {
        title: "Recovery and hydration",
        body: [
          "Use Sleep and energy log to record hours slept and whether your energy is Low, Steady, or High. Use the hydration quick-add button to add 250 mL whenever you drink water.",
          "These recovery signals affect coaching. Low sleep or low energy can shift recommendations toward lighter sessions and stronger recovery emphasis."
        ]
      },
      {
        title: "Habit tracking",
        body: [
          "The habit cards in Streak builder let you mark a habit complete for today or remove today's completion if you clicked it by mistake. Habit completion contributes to streaks and momentum feedback.",
          "Your best current habit streak also appears on the Progress page, so habits are not just cosmetic. They influence how the app describes your consistency."
        ]
      }
    ]
  },
  {
    id: "progress-coach",
    label: "Progress and Coach",
    eyebrow: "Trends",
    title: "Read your trend pages without overthinking them",
    summary:
      "PulsePeak includes a progress page for charts and streaks, plus a coach page for recommendations and notes.",
    blocks: [
      {
        title: "Progress page",
        body: [
          "The Progress page shows a weekly adherence chart, a 7-day bodyweight chart, and a habit consistency section. Use it to spot whether your consistency and bodyweight trend are moving in the direction you expect.",
          "The habit consistency section lists each habit's current streak and also shows your best streak across habits."
        ]
      },
      {
        title: "Coach page",
        body: [
          "The Coach page shows recommendation cards under Your coaching feed. These are built from your dashboard data, so they may change as your meals, workouts, hydration, sleep, and habits change.",
          "The page also shows Recovery focus, which summarizes your current energy, sleep, and top habit, plus Longer-term patterns, which contains stored coaching notes."
        ]
      }
    ]
  },
  {
    id: "premium-billing",
    label: "Premium and Billing",
    eyebrow: "Upgrade path",
    title: "Know what happens when you upgrade",
    summary:
      "PulsePeak uses Stripe Checkout for Premium upgrades. The current live Premium feature is the personalized weekly plan.",
    blocks: [
      {
        title: "What Premium unlocks today",
        body: [
          "Today, the real Premium unlock in the app is full access to the personalized weekly plan. Free users can preview it, but Premium users can open it directly without preview messaging.",
          "Some premium items shown in the app are still positioning or future-facing copy rather than separate fully unlocked product areas. Do not expect a dedicated billing management page, plan switcher, or standalone progression module inside the app right now."
        ]
      },
      {
        title: "How checkout works",
        body: [
          "From the weekly plan area, choose Unlock full plan. PulsePeak sends you to Stripe Checkout. If checkout succeeds, Stripe returns you to the billing success page and the app confirms the upgrade with the backend.",
          "If checkout is canceled, you return to a billing cancel page and your account stays on the free tier."
        ]
      },
      {
        title: "What billing does not include yet",
        body: [
          "There is no in-app subscription management page, no self-serve cancellation screen, and no account settings area for billing changes at this time.",
          "If Stripe is not configured in the environment, upgrades cannot complete even though the weekly plan preview still works."
        ]
      }
    ]
  },
  {
    id: "account-troubleshooting",
    label: "Account and Troubleshooting",
    eyebrow: "Support",
    title: "Solve the most common confusion points",
    summary:
      "PulsePeak has simple account controls today, so most troubleshooting is about sync, logging, and premium access state.",
    blocks: [
      {
        title: "Account features available now",
        body: [
          "The sidebar shows your name, email, and current tier, and it gives you a Log out button. There is no profile editing page, password reset flow, settings page, or notification settings area in the app right now.",
          "Help Center is the main in-app reference area for how the product works."
        ]
      },
      {
        title: "If something does not update",
        body: [
          "Most dashboard changes should appear right after you save or log something. If a metric or recommendation looks stale, refresh the page and sign back in if needed.",
          "If a workout does not log, check whether you accidentally tried to log the same workout twice in a short time window. If a weekly plan stays locked after upgrade, return through the billing success flow so the backend can confirm the session."
        ]
      },
      {
        title: "What should not be treated as complete",
        body: [
          "Do not rely on the app for profile editing, password recovery, billing management, subscription cancellation, notification settings, or advanced progression history. Those are not available as complete in-app features today.",
          "Premium-related copy about deeper coaching insights and progression history should be treated as future-facing positioning unless a dedicated live feature appears in the product."
        ]
      }
    ]
  }
];

export const HELP_FAQ_CATEGORIES = [
  {
    id: "general",
    title: "Getting Started",
    items: [
      {
        question: "Do I need an account to use PulsePeak?",
        answer: "Yes. The app uses sign-in so your dashboard data, meals, workouts, recovery, and habits stay attached to your account."
      },
      {
        question: "Where should I start each day?",
        answer: "Open the Dashboard first. Check Today's Focus, then log the next meal, hydration, recovery update, or workout that matches the recommendation."
      }
    ]
  },
  {
    id: "dashboard",
    title: "Dashboard and Logging",
    items: [
      {
        question: "Why did Today's Focus change after I logged something?",
        answer: "Today's Focus is generated from your current dashboard data. Logging meals, workouts, hydration, sleep, energy, or habits can change the recommendation."
      },
      {
        question: "Can I remove a meal or workout after logging it?",
        answer: "Yes. Meals and workouts in the dashboard lists include a remove action so you can delete entries that were logged by mistake."
      },
      {
        question: "Why was my workout not accepted?",
        answer: "PulsePeak blocks obvious duplicate workout logs in a short time window. Wait a bit or make sure you are not logging the same preset twice by accident."
      }
    ]
  },
  {
    id: "weekly-plan-faq",
    title: "Weekly Plan",
    items: [
      {
        question: "What is included in the weekly plan?",
        answer: "It includes a weekly focus, workout cadence, workout mix, recovery emphasis, nutrition guidance, hydration floor, and a coach note."
      },
      {
        question: "Why is the weekly plan different from generic workout advice?",
        answer: "The plan uses your real PulsePeak data, including workouts, recovery, protein and calorie gaps, hydration, and consistency."
      },
      {
        question: "What do free users get?",
        answer: "Free users can see the locked weekly plan card and open a limited preview modal, but they still see upgrade prompts and do not get normal full access."
      },
      {
        question: "What do Premium users get?",
        answer: "Premium users can open the weekly plan directly without preview messaging or unlock prompts."
      }
    ]
  },
  {
    id: "billing",
    title: "Premium and Billing",
    items: [
      {
        question: "How do I upgrade?",
        answer: "Use Unlock full plan from the weekly plan area. That starts Stripe Checkout."
      },
      {
        question: "What happens if I cancel checkout?",
        answer: "You return to the app on the free tier, and the preview flow remains available."
      },
      {
        question: "Can I manage or cancel my subscription inside the app?",
        answer: "Not yet. There is no in-app billing management page or cancellation page right now."
      }
    ]
  },
  {
    id: "account",
    title: "Account and Troubleshooting",
    items: [
      {
        question: "Can I edit my profile or change my password in the app?",
        answer: "Not currently. The app shows your account info in the sidebar and lets you log out, but it does not yet include profile editing or password reset."
      },
      {
        question: "Why does the app still show a locked plan after upgrade?",
        answer: "Use the normal checkout success return flow so the app can confirm the Stripe session with the backend. If the status still looks wrong, refresh the page and sign in again."
      },
      {
        question: "Where can I get a quick overview of what to do today?",
        answer: "Use Today's Focus on the Dashboard. It is the fastest summary of your highest-priority next action."
      }
    ]
  }
];
