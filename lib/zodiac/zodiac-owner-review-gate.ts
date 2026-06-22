export type OwnerReviewGateItem = {
  area: string;
  currentStatus:
    | "complete"
    | "mock-only"
    | "architecture-only"
    | "blocked"
    | "requires-owner-approval";
  evidence: string[];
  blockedUntil: string[];
  ownerDecisionRequired: boolean;
  safeNextAction: string;
};

export type OwnerDecisionOption = {
  option: string;
  recommendedOrder: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  requiresBeforeStart: string[];
  forbiddenWithoutApproval: string[];
  description: string;
};

export const OWNER_REVIEW_AREAS: OwnerReviewGateItem[] = [
  {
    area: "Mini App mock routes",
    currentStatus: "mock-only",
    evidence: ["/miniapp", "/birth-matrix", "/mystic-numbers", "/affirmations"],
    blockedUntil: ["Owner approval for Real Implementation"],
    ownerDecisionRequired: true,
    safeNextAction: "Continue polishing mock UX",
  },
  {
    area: "Compatibility flow",
    currentStatus: "mock-only",
    evidence: ["/compatibility"],
    blockedUntil: ["Owner approval for Real Implementation"],
    ownerDecisionRequired: true,
    safeNextAction: "Review mock interactions",
  },
  {
    area: "Birth Matrix",
    currentStatus: "mock-only",
    evidence: ["/birth-matrix"],
    blockedUntil: ["Owner approval for Real Implementation"],
    ownerDecisionRequired: true,
    safeNextAction: "Review mock data presentation",
  },
  {
    area: "Mystic Numbers",
    currentStatus: "mock-only",
    evidence: ["/mystic-numbers"],
    blockedUntil: ["Owner approval for Real Implementation"],
    ownerDecisionRequired: true,
    safeNextAction: "Review mock numerology outputs",
  },
  {
    area: "Affirmations",
    currentStatus: "mock-only",
    evidence: ["/affirmations"],
    blockedUntil: ["Owner approval for Real Implementation"],
    ownerDecisionRequired: true,
    safeNextAction: "Review mock audio/text layout",
  },
  {
    area: "VIP Preview",
    currentStatus: "mock-only",
    evidence: ["/vip-preview"],
    blockedUntil: ["Owner approval for Payment Integration"],
    ownerDecisionRequired: true,
    safeNextAction: "Review paywall preview layout",
  },
  {
    area: "Monetization architecture",
    currentStatus: "architecture-only",
    evidence: ["/dashboard/networks/zodiac/miniapp-monetization-architecture"],
    blockedUntil: ["Owner approval for Payment Integration"],
    ownerDecisionRequired: true,
    safeNextAction: "Review monetization strategy",
  },
  {
    area: "Profile / entitlement architecture",
    currentStatus: "architecture-only",
    evidence: ["/dashboard/networks/zodiac/miniapp-entitlements"],
    blockedUntil: ["Owner approval for Database Persistence"],
    ownerDecisionRequired: true,
    safeNextAction: "Review Supabase schema design",
  },
  {
    area: "Telegram Mini App wiring architecture",
    currentStatus: "architecture-only",
    evidence: ["/dashboard/networks/zodiac/miniapp-production-wiring"],
    blockedUntil: ["Owner approval for Telegram API Usage"],
    ownerDecisionRequired: true,
    safeNextAction: "Review initData validation spec",
  },
  {
    area: "Payment provider matrix",
    currentStatus: "architecture-only",
    evidence: ["/dashboard/networks/zodiac/miniapp-payment-matrix"],
    blockedUntil: ["Owner approval for Payment Integration"],
    ownerDecisionRequired: true,
    safeNextAction: "Review App Store rejection risks",
  },
  {
    area: "Production risk register",
    currentStatus: "complete",
    evidence: ["/dashboard/networks/zodiac/miniapp-risk-register"],
    blockedUntil: [],
    ownerDecisionRequired: false,
    safeNextAction: "Review required rollout gates",
  },
  {
    area: "Master control index",
    currentStatus: "complete",
    evidence: ["/dashboard/networks/zodiac/miniapp-master-index"],
    blockedUntil: [],
    ownerDecisionRequired: false,
    safeNextAction: "Use index for navigation",
  },
  {
    area: "Daily/weekly automation protection",
    currentStatus: "complete",
    evidence: ["production:safety:check", "scripts/qa-zodiac-dashboard.mjs"],
    blockedUntil: [],
    ownerDecisionRequired: false,
    safeNextAction: "Maintain daily publishing",
  }
];

export const OWNER_DECISION_OPTIONS: OwnerDecisionOption[] = [
  {
    option: "Keep everything mock-only for now.",
    recommendedOrder: 1,
    riskLevel: "low",
    requiresBeforeStart: [],
    forbiddenWithoutApproval: ["Database write", "Telegram API call", "Payment processing"],
    description: "Safest option. Continue refining the UI, content, and UX without touching any backend infrastructure.",
  },
  {
    option: "Continue polishing mock UX.",
    recommendedOrder: 2,
    riskLevel: "low",
    requiresBeforeStart: [],
    forbiddenWithoutApproval: ["Database write", "Telegram API call", "Payment processing"],
    description: "Iterate on existing Mini App screens (Birth Matrix, Compatibility, etc.) with mock data to perfect the design.",
  },
  {
    option: "Start real profile architecture implementation.",
    recommendedOrder: 3,
    riskLevel: "medium",
    requiresBeforeStart: ["Owner Approval for Database Persistence"],
    forbiddenWithoutApproval: ["Production launch", "Telegram API call", "Payment processing"],
    description: "Implement Supabase schema, create API routes, and wire up database reads/writes for user profiles. Still isolated from live Telegram users.",
  },
  {
    option: "Start Telegram Mini App production wiring implementation.",
    recommendedOrder: 4,
    riskLevel: "medium",
    requiresBeforeStart: ["Owner Approval for Telegram API Usage", "Profile architecture implementation"],
    forbiddenWithoutApproval: ["Production launch", "Active Telegram CTA changes"],
    description: "Implement initData validation, session management, and connect the React frontend securely to the Telegram bot backend.",
  },
  {
    option: "Start payment provider research/sandbox integration.",
    recommendedOrder: 5,
    riskLevel: "high",
    requiresBeforeStart: ["Owner Approval for Payment Integration", "Profile architecture implementation"],
    forbiddenWithoutApproval: ["Production launch", "Real money transactions"],
    description: "Install payment SDKs (e.g., Telegram Stars or Stripe), wire up sandbox checkout flows, and test webhooks.",
  },
  {
    option: "Start VIP entitlement implementation.",
    recommendedOrder: 6,
    riskLevel: "high",
    requiresBeforeStart: ["Owner Approval for Database Persistence", "Payment provider integration"],
    forbiddenWithoutApproval: ["Production launch"],
    description: "Implement the logic that unlocks premium features based on verified payment webhooks and database status.",
  },
  {
    option: "Start production launch checklist.",
    recommendedOrder: 7,
    riskLevel: "critical",
    requiresBeforeStart: ["All mock and architecture gates passed", "Owner Approval for Production Launch"],
    forbiddenWithoutApproval: ["Active Telegram CTA changes"],
    description: "Prepare the live environment, run final security audits, and get ready to attach the Mini App to live Telegram broadcast CTAs.",
  }
];
