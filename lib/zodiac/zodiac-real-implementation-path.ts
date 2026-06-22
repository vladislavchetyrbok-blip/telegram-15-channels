export type RealImplementationPhase = {
  packageNumber: string;
  title: string;
  purpose: string;
  status: "selected" | "next" | "future" | "blocked" | "completed";
  allowedWork: string[];
  forbiddenWork: string[];
  requiredBeforeStart: string[];
};

export type RealImplementationRisk = {
  area: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  reason: string;
  requiredControl: string;
};

export type RealImplementationDecision = {
  decision: string;
  selected: boolean;
  reason: string;
  nextPackage: string;
};

export const REAL_IMPLEMENTATION_PHASES: RealImplementationPhase[] = [
  {
    packageNumber: "123",
    title: "Telegram initData validation foundation",
    purpose: "Establish secure connection between React frontend and Telegram user identity.",
    status: "selected",
    allowedWork: ["initData parsing", "hash validation spec", "session state mockup"],
    forbiddenWork: ["Database writes", "Payment logic", "Real VIP access"],
    requiredBeforeStart: ["Owner Review Gate passed", "Path selected"],
  },
  {
    packageNumber: "124",
    title: "User profile database foundation",
    purpose: "Store verified Telegram users in Supabase.",
    status: "completed",
    allowedWork: ["Supabase schema", "User profile API route", "Database reads/writes"],
    forbiddenWork: ["Payment logic", "Live production broadcast"],
    requiredBeforeStart: ["Package 123 completed"],
  },
  {
    packageNumber: "125",
    title: "Product catalog foundation",
    purpose: "Define purchasable items and their metadata in the database.",
    status: "completed",
    allowedWork: ["Catalog schema", "Product API"],
    forbiddenWork: ["Payment logic", "Real VIP access"],
    requiredBeforeStart: ["Package 124 completed"],
  },
  {
    packageNumber: "126",
    title: "Entitlement model foundation",
    purpose: "Link users to products they own.",
    status: "selected",
    allowedWork: ["Entitlement schema", "Access control logic"],
    forbiddenWork: ["Payment processing"],
    requiredBeforeStart: ["Package 125 completed"],
  },
  {
    packageNumber: "127",
    title: "VIP access boundary",
    purpose: "Enforce paywalls using the entitlement model.",
    status: "next",
    allowedWork: ["Paywall UI integration", "Route protection based on entitlement"],
    forbiddenWork: ["Payment processing"],
    requiredBeforeStart: ["Package 126 completed"],
  },
  {
    packageNumber: "128",
    title: "Telegram Stars payment prototype",
    purpose: "Integrate actual payment SDK in test mode.",
    status: "blocked",
    allowedWork: ["Payment invoice generation", "Sandbox testing"],
    forbiddenWork: ["Real money transactions"],
    requiredBeforeStart: ["Package 127 completed", "Owner approval for Payments"],
  },
  {
    packageNumber: "129",
    title: "Successful payment handler",
    purpose: "Process webhooks and grant entitlements.",
    status: "blocked",
    allowedWork: ["Webhook receiver", "Entitlement granting logic"],
    forbiddenWork: ["Real money transactions"],
    requiredBeforeStart: ["Package 128 completed"],
  },
  {
    packageNumber: "130",
    title: "First paid product: VIP Compatibility Deep Report",
    purpose: "Connect a real feature to the payment and entitlement flow.",
    status: "blocked",
    allowedWork: ["Feature integration"],
    forbiddenWork: ["Live production launch"],
    requiredBeforeStart: ["Package 129 completed"],
  },
  {
    packageNumber: "131",
    title: "Withdrawal accounting dashboard",
    purpose: "Monitor revenue and Telegram Stars balance.",
    status: "blocked",
    allowedWork: ["Accounting dashboard UI"],
    forbiddenWork: [],
    requiredBeforeStart: ["Package 130 completed"],
  }
];

export const REAL_IMPLEMENTATION_RISKS: RealImplementationRisk[] = [
  {
    area: "Data Security",
    riskLevel: "high",
    reason: "Handling Telegram initData improperly can lead to spoofed identities.",
    requiredControl: "Strict HMAC-SHA-256 signature validation before any session is trusted.",
  },
  {
    area: "Database Load",
    riskLevel: "medium",
    reason: "New users interacting with the Mini App will generate DB writes.",
    requiredControl: "Rate limiting on profile creation and updates.",
  },
  {
    area: "Compliance",
    riskLevel: "critical",
    reason: "Taking payments requires strict adherence to App Store and Telegram terms.",
    requiredControl: "Keep payments completely blocked until identity and profiles are rock solid.",
  }
];

export const CURRENT_IMPLEMENTATION_DECISION: RealImplementationDecision = {
  decision: "Telegram User Identity First",
  selected: true,
  reason: "Identity is the prerequisite for all downstream features (profiles, entitlements, payments). It allows us to safely build out the backend without touching sensitive payment systems or violating platform rules.",
  nextPackage: "Package 123",
};
