export type MiniAppHubItem = {
  title: string;
  description: string;
  href: string;
  status: "active-mock" | "existing" | "placeholder" | "future";
  safetyLabel: string;
  recommendedNextAction: string;
};

export type MiniAppHubSafetyRule = {
  label: string;
  description: string;
};

export const MOCK_MINI_APP_HUB_ITEMS: MiniAppHubItem[] = [
  {
    title: "Compatibility",
    description: "Explore how your zodiac energy aligns with a partner.",
    href: "/compatibility",
    status: "existing",
    safetyLabel: "Production Ready (Free Version)",
    recommendedNextAction: "Add to daily CTA generation",
  },
  {
    title: "Birth Matrix",
    description: "Discover the core numerology patterns of your birth date.",
    href: "/birth-matrix",
    status: "active-mock",
    safetyLabel: "Package 103 Static Mock",
    recommendedNextAction: "Connect to database schema",
  },
  {
    title: "Mystic Numbers",
    description: "Understand the meaning behind repeating numbers you encounter.",
    href: "/mystic-numbers",
    status: "active-mock",
    safetyLabel: "Package 104 Static Mock",
    recommendedNextAction: "Add generative interpretation logic",
  },
  {
    title: "Affirmations",
    description: "Align your energy with daily mood-based affirmations.",
    href: "/affirmations",
    status: "active-mock",
    safetyLabel: "Package 105 Static Mock",
    recommendedNextAction: "Design premium affirmation packs",
  },
  {
    title: "VIP Preview",
    description: "Explore the roadmap for our future advanced modules.",
    href: "/vip-preview",
    status: "active-mock",
    safetyLabel: "Package 107 Static Mock",
    recommendedNextAction: "Design entitlement model",
  },
  {
    title: "Lunar Calendar",
    description: "View upcoming moon phases and astrological shifts.",
    href: "#",
    status: "future",
    safetyLabel: "Placeholder",
    recommendedNextAction: "Define data structure",
  },
  {
    title: "Relationship Map",
    description: "Map the astrological connections in your social circle.",
    href: "#",
    status: "placeholder",
    safetyLabel: "Placeholder",
    recommendedNextAction: "Define graph UX",
  },
];

export const MOCK_MINI_APP_SAFETY_RULES: MiniAppHubSafetyRule[] = [
  { label: "No payment", description: "This hub does not process transactions." },
  { label: "No database", description: "User actions here are not persisted." },
  { label: "No Telegram API", description: "This hub operates entirely independent of the Telegram bot context." },
  { label: "No Active Publishing Changes", description: "Daily CTAs remain unaffected." },
  { label: "Mock Modules Only", description: "Features labeled 'active-mock' are static visual placeholders." }
];
