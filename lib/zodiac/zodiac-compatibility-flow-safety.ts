export type CompatibilityFlowStep = {
  step: string;
  route: string;
  purpose: string;
  currentStatus: "existing" | "mock-safe" | "needs-review" | "future-only";
  userInput: string[];
  output: string[];
  safetyBoundary: string[];
  nextSafeAction: string;
};

export type CompatibilityFlowCta = {
  sourceRoute: string;
  label: string;
  destinationRoute: string;
  ctaType: "primary" | "secondary" | "navigation" | "preview" | "safety";
  safetyStatus: "safe" | "needs-review" | "future-only";
  reason: string;
};

export type CompatibilityFlowRisk = {
  area: string;
  status: "protected" | "blocked" | "future-only" | "needs-review";
  reason: string;
  safeNextAction: string;
};

export const compatibilityFlowSteps: CompatibilityFlowStep[] = [
  {
    step: "1. Compatibility Entry",
    route: "/compatibility",
    purpose: "Landing and entry point for selecting signs/profiles.",
    currentStatus: "existing",
    userInput: ["First sign", "Second sign", "Mode selector (Love, Friendship, Work)"],
    output: ["Sign preview", "Action CTA to Start"],
    safetyBoundary: ["No real Telegram identity required", "No profile persistence"],
    nextSafeAction: "Maintain mock mode.",
  },
  {
    step: "2. Compatibility Result",
    route: "/compatibility",
    purpose: "Show generated compatibility score and analysis (mocked internally in component state).",
    currentStatus: "existing",
    userInput: ["Tab selection (Score, Analysis, Advice)"],
    output: ["Static/generated compatibility text", "Mock scores"],
    safetyBoundary: ["No real backend scoring engine", "Scores generated on client", "No deterministic claims"],
    nextSafeAction: "Ensure scoring disclaimer remains visible.",
  },
  {
    step: "3. Future Relationship Map",
    route: "/compatibility/relationship-map",
    purpose: "Advanced node-based map of connections between users.",
    currentStatus: "future-only",
    userInput: ["Graph interaction"],
    output: ["Visual relationship mapping"],
    safetyBoundary: ["Requires explicit user opt-in and privacy policy", "Requires database persistence"],
    nextSafeAction: "Keep blocked until production backend is ready.",
  },
  {
    step: "4. VIP Compatibility Modules",
    route: "/compatibility/vip",
    purpose: "Deeper astrological insights gated by premium subscription.",
    currentStatus: "future-only",
    userInput: ["Payment action"],
    output: ["Premium content"],
    safetyBoundary: ["Requires real Telegram payments / Stars", "Requires secure entitlement server"],
    nextSafeAction: "Keep disabled. Use /vip-preview instead.",
  },
];

export const compatibilityFlowCtas: CompatibilityFlowCta[] = [
  {
    sourceRoute: "/compatibility",
    label: "Узнать совместимость (Start)",
    destinationRoute: "In-component state update",
    ctaType: "primary",
    safetyStatus: "safe",
    reason: "Local state change only, no backend mutation.",
  },
  {
    sourceRoute: "/compatibility",
    label: "Назад (Back to Mini App Hub)",
    destinationRoute: "/miniapp",
    ctaType: "navigation",
    safetyStatus: "safe",
    reason: "Safe backlink preventing entrapment.",
  },
  {
    sourceRoute: "/compatibility",
    label: "VIP Preview Modules",
    destinationRoute: "/vip-preview",
    ctaType: "preview",
    safetyStatus: "safe",
    reason: "Links to safe VIP mock preview without real payment.",
  },
];

export const compatibilityFlowRisks: CompatibilityFlowRisk[] = [
  {
    area: "User Identity",
    status: "protected",
    reason: "No Telegram identity validation implemented. Operates anonymously.",
    safeNextAction: "Maintain anonymity until production database is approved.",
  },
  {
    area: "Database Persistence",
    status: "protected",
    reason: "No real database persistence of generated compatibility matches.",
    safeNextAction: "Do not add database writes without schema review.",
  },
  {
    area: "Scoring Engine",
    status: "protected",
    reason: "No production deterministic compatibility engine is active.",
    safeNextAction: "Keep relying on local generated scoring to avoid load and liability.",
  },
  {
    area: "Live Telegram CTAs",
    status: "protected",
    reason: "No live Telegram post CTA changes have been pushed.",
    safeNextAction: "Do not modify CTA generation scripts in daily automation.",
  },
  {
    area: "Payments",
    status: "blocked",
    reason: "No real VIP upsell or payment integration exists in flow.",
    safeNextAction: "Must wait for production monetization architecture.",
  },
];
