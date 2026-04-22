export const FREE_FEATURES = [
  "Workout browsing with guided session previews",
  "2 workout logs each week",
  "Core mobility, nutrition, and recovery support",
  "Coach, progress, and weekly check-ins",
  "Limited weekly plan preview"
];

export const TRIAL_FEATURES = [
  "7 days of the real guided workout experience",
  "Unlimited workout logging during the trial",
  "Full weekly planning and smoother guided sessions",
  "Deeper workout rotation, swaps, and continuity",
  "Broader mobility, coach, and nutrition support"
];

export const PREMIUM_FEATURES = [
  "Full adaptive weekly plan",
  "Unlimited workout logging all week",
  "Smoother guided workout sessions from warm-up through completion",
  "Deeper exercise swap depth, smarter split rotation, and better continuity for your equipment",
  "Guided mobility and physio depth shaped by recovery and injury context",
  "Execution priorities and weekly rationale tied to your actual data",
  "Deeper coach reasoning linked to smarter weekly decisions",
  "Richer nutrition execution and smarter weekly adjustments"
];

export const BILLING_OPTIONS = [
  {
    id: "monthly",
    label: "Monthly",
    priceLabel: "$14.99 / month",
    helper: "Direct paid option"
  },
  {
    id: "yearly",
    label: "Yearly",
    priceLabel: "$119.99 / year",
    helper: "Best value - save 33%"
  }
];

export const TRIAL_MODEL = {
  days: 7,
  headline: "7-day free trial",
  summary:
    "Trial unlocks the full workout system for 7 days so you can keep your progress connected. Then auto-renews yearly at $119.99/year unless canceled before trial ends.",
  support:
    "Cancel before trial ends to return to Free. Monthly is available separately outside the trial renewal path."
};

export const PREMIUM_PREVIEW = {
  name: "PulsePeak Premium",
  badge: "Locked preview",
  cta: "Start trial"
};
