export type MiniAppRouteSafetyItem = {
  route: string;
  title: string;
  purpose: string;
  status: "existing" | "mock" | "preview" | "future";
  safetyRequirements: string[];
  qaAssertions: string[];
  protectedBoundaries: string[];
  nextAction: string;
};

export const miniappRouteSafetyBaseline: MiniAppRouteSafetyItem[] = [
  {
    route: "/miniapp",
    title: "Mini App Hub",
    purpose: "Central navigation hub connecting all Mini App modules.",
    status: "mock",
    safetyRequirements: [
      "Static hub",
      "No payment",
      "No database",
      "No Telegram API"
    ],
    qaAssertions: [
      "Mini App Hub",
      "Static Hub (Package 106)",
      "Zodiac Universe"
    ],
    protectedBoundaries: [
      "no payments",
      "no database writes",
      "no Telegram API calls",
      "no active Telegram CTA changes",
      "no publish script changes",
      "no workflow/cron changes"
    ],
    nextAction: "Maintain as stable navigation root."
  },
  {
    route: "/compatibility",
    title: "Compatibility",
    purpose: "Zodiac sign compatibility checking.",
    status: "existing",
    safetyRequirements: [
      "Client-side processing",
      "No payment",
      "No database",
      "No Telegram API"
    ],
    qaAssertions: [
      "Compatibility"
    ],
    protectedBoundaries: [
      "no payments",
      "no database writes",
      "no Telegram API calls",
      "no active Telegram CTA changes",
      "no publish script changes",
      "no workflow/cron changes"
    ],
    nextAction: "Expand with more detailed mock outputs."
  },
  {
    route: "/birth-matrix",
    title: "Birth Matrix",
    purpose: "Numerological destiny matrix visualization.",
    status: "mock",
    safetyRequirements: [
      "Static mock",
      "No payment",
      "No database",
      "No Telegram API"
    ],
    qaAssertions: [
      "Birth Matrix",
      "Static Mock (Package 103)",
      "Destiny Path"
    ],
    protectedBoundaries: [
      "no payments",
      "no database writes",
      "no Telegram API calls",
      "no active Telegram CTA changes",
      "no publish script changes",
      "no workflow/cron changes"
    ],
    nextAction: "Implement client-side calculation logic."
  },
  {
    route: "/mystic-numbers",
    title: "Mystic Numbers",
    purpose: "Angel numbers and daily numerology.",
    status: "mock",
    safetyRequirements: [
      "Static mock",
      "No payment",
      "No database",
      "No Telegram API"
    ],
    qaAssertions: [
      "Mystic Numbers",
      "Static Mock (Package 104)",
      "Daily Numerology"
    ],
    protectedBoundaries: [
      "no payments",
      "no database writes",
      "no Telegram API calls",
      "no active Telegram CTA changes",
      "no publish script changes",
      "no workflow/cron changes"
    ],
    nextAction: "Implement client-side numerology generation."
  },
  {
    route: "/affirmations",
    title: "Affirmations",
    purpose: "Daily positive zodiac affirmations.",
    status: "mock",
    safetyRequirements: [
      "Static mock",
      "No payment",
      "No database",
      "No Telegram API"
    ],
    qaAssertions: [
      "Zodiac Affirmations",
      "Static Mock (Package 105)",
      "Your Daily Power"
    ],
    protectedBoundaries: [
      "no payments",
      "no database writes",
      "no Telegram API calls",
      "no active Telegram CTA changes",
      "no publish script changes",
      "no workflow/cron changes"
    ],
    nextAction: "Implement client-side affirmations generation."
  },
  {
    route: "/vip-preview",
    title: "VIP Preview Shell",
    purpose: "Showcase boundary for future premium features.",
    status: "preview",
    safetyRequirements: [
      "Preview only",
      "No payment",
      "No unlock",
      "No database",
      "No Telegram API",
      "No subscription logic"
    ],
    qaAssertions: [
      "VIP Preview",
      "Preview Only (Package 107)",
      "Future VIP Access"
    ],
    protectedBoundaries: [
      "no payments",
      "no database writes",
      "no Telegram API calls",
      "no active Telegram CTA changes",
      "no publish script changes",
      "no workflow/cron changes"
    ],
    nextAction: "Design entitlement and payment models safely."
  }
];
