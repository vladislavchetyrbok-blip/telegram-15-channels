export type VipPreviewFeature = {
  title: string;
  description: string;
  status: "preview-only" | "future" | "blocked-until-payments";
  dependency: string;
  riskLevel: "low" | "medium" | "high";
};

export type VipBoundaryRule = {
  label: string;
  description: string;
  protectedArea: string;
};

export const MOCK_VIP_PREVIEW_FEATURES: VipPreviewFeature[] = [
  {
    title: "Extended Birth Matrix interpretation",
    description: "Deep dive into karmic paths, life lessons, and hidden talents.",
    status: "blocked-until-payments",
    dependency: "Profile storage & Payments",
    riskLevel: "medium",
  },
  {
    title: "Deeper Mystic Numbers interpretation",
    description: "Personalized sequence meanings and timing predictions.",
    status: "preview-only",
    dependency: "Generative Logic",
    riskLevel: "low",
  },
  {
    title: "Personalized affirmations pack",
    description: "Curated affirmations targeting specific life areas (e.g., career, love).",
    status: "preview-only",
    dependency: "Content Management",
    riskLevel: "low",
  },
  {
    title: "Compatibility expansion",
    description: "Detailed synastry, planetary aspects, and relationship dynamics.",
    status: "blocked-until-payments",
    dependency: "Astrological Engine & Payments",
    riskLevel: "medium",
  },
  {
    title: "Relationship map",
    description: "Visualize energetic connections across your social circle.",
    status: "future",
    dependency: "Social Graph Storage",
    riskLevel: "high",
  },
  {
    title: "Lunar calendar insights",
    description: "Personalized advice based on moon phases affecting your natal chart.",
    status: "future",
    dependency: "Astrological Engine",
    riskLevel: "medium",
  },
  {
    title: "Saved personal profile",
    description: "Persist your data to avoid re-entering details across sessions.",
    status: "blocked-until-payments",
    dependency: "Database & Auth",
    riskLevel: "high",
  },
  {
    title: "Private daily guidance",
    description: "Exclusive daily horoscopes sent directly or accessed in-app.",
    status: "blocked-until-payments",
    dependency: "Telegram Sending & Entitlement",
    riskLevel: "high",
  },
];

export const MOCK_VIP_BOUNDARY_RULES: VipBoundaryRule[] = [
  { label: "No Real Payment", description: "Transactions are simulated or disabled entirely.", protectedArea: "Payments" },
  { label: "No Real Unlock", description: "Premium features cannot be accessed.", protectedArea: "Entitlement" },
  { label: "No Subscription State", description: "User subscription tier is not tracked.", protectedArea: "Database" },
  { label: "No Database Write", description: "No profile or transaction records are saved.", protectedArea: "Database" },
  { label: "No Telegram API Call", description: "No bot interactions occur from this route.", protectedArea: "Telegram API" },
  { label: "No Production Telegram Delivery Change", description: "Live channel posts are untouched.", protectedArea: "Publishing" },
  { label: "No Workflow/Cron/Publish Script Changes", description: "Automation scripts remain locked.", protectedArea: "Infrastructure" },
];
