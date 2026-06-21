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
    description: "Check zodiac compatibility with potential partners.",
    href: "/compatibility",
    status: "existing",
    safetyLabel: "Production Ready (Free Version)",
    recommendedNextAction: "Add to daily CTA generation",
  },
  {
    title: "Birth Matrix",
    description: "Calculate your unique numerological birth matrix.",
    href: "/birth-matrix",
    status: "active-mock",
    safetyLabel: "Package 103 Static Mock",
    recommendedNextAction: "Connect to database schema",
  },
  {
    title: "Mystic Numbers",
    description: "Decode the angel numbers you see.",
    href: "/mystic-numbers",
    status: "active-mock",
    safetyLabel: "Package 104 Static Mock",
    recommendedNextAction: "Add generative interpretation logic",
  },
  {
    title: "Affirmations",
    description: "Daily power affirmations based on your mood.",
    href: "/affirmations",
    status: "active-mock",
    safetyLabel: "Package 105 Static Mock",
    recommendedNextAction: "Design premium affirmation packs",
  },
  {
    title: "VIP Preview",
    description: "Unlock premium numerology and compatibility features.",
    href: "/vip-preview",
    status: "active-mock",
    safetyLabel: "Package 107 Static Mock",
    recommendedNextAction: "Design entitlement model",
  },
  {
    title: "Lunar Calendar",
    description: "Track moon phases and their impact on your sign.",
    href: "#",
    status: "future",
    safetyLabel: "Placeholder",
    recommendedNextAction: "Design mock UI",
  },
  {
    title: "Relationship Map",
    description: "Visualize compatibility across your entire friend group.",
    href: "#",
    status: "future",
    safetyLabel: "Placeholder",
    recommendedNextAction: "Design mock UI",
  },
];

export const MOCK_MINI_APP_SAFETY_RULES: MiniAppHubSafetyRule[] = [
  { label: "No Payment", description: "This hub does not process transactions." },
  { label: "No Database Write", description: "User actions here are not persisted." },
  { label: "No Telegram API Call", description: "This hub operates entirely independent of the Telegram bot context." },
  { label: "No Active Publishing Changes", description: "Daily CTAs remain unaffected." },
  { label: "Mock Modules Only", description: "Features labeled 'active-mock' are static visual placeholders." }
];
