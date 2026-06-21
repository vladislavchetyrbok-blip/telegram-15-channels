export type MonetizationArchitectureArea = {
  area: string;
  status: "future-only" | "blocked" | "needs-architecture" | "protected";
  purpose: string;
  requiredBeforeImplementation: string[];
  forbiddenInCurrentStage: string[];
  safeNextAction: string;
};

export type MonetizationRiskControl = {
  risk: string;
  status: "protected" | "blocked" | "needs-review";
  reason: string;
  control: string;
};

export const MONETIZATION_AREAS: MonetizationArchitectureArea[] = [
  {
    area: "VIP tiers",
    status: "future-only",
    purpose: "Provide premium features, content, and advanced scoring.",
    requiredBeforeImplementation: ["entitlement model", "database persistence"],
    forbiddenInCurrentStage: ["real VIP gating in mock UI", "payment requests"],
    safeNextAction: "Document tier structure and features",
  },
  {
    area: "Payment provider selection",
    status: "needs-architecture",
    purpose: "Handle payment processing and subscription logic.",
    requiredBeforeImplementation: ["payment matrix review", "legal review"],
    forbiddenInCurrentStage: ["API keys", "webhooks", "Stripe SDK", "Telegram Stars logic"],
    safeNextAction: "Create payment provider decision matrix",
  },
  {
    area: "Telegram Payments",
    status: "blocked",
    purpose: "Native in-app purchases.",
    requiredBeforeImplementation: ["bot token configuration", "bot payment setup"],
    forbiddenInCurrentStage: ["real Telegram API calls", "invoice generation"],
    safeNextAction: "Review Telegram Payments API docs",
  },
  {
    area: "External payment providers",
    status: "blocked",
    purpose: "Web-based subscriptions (e.g. Stripe, WayForPay).",
    requiredBeforeImplementation: ["merchant accounts", "PCI compliance check"],
    forbiddenInCurrentStage: ["checkout links", "live integrations"],
    safeNextAction: "Add to payment provider decision matrix",
  },
  {
    area: "Entitlement model",
    status: "needs-architecture",
    purpose: "Database records linking user ID to purchases.",
    requiredBeforeImplementation: ["Prisma schema update", "Supabase auth"],
    forbiddenInCurrentStage: ["database writes", "schema migrations"],
    safeNextAction: "Create profile and entitlement spec",
  },
  {
    area: "Refund/access rules",
    status: "needs-architecture",
    purpose: "Legal and operational policy for handling purchase disputes.",
    requiredBeforeImplementation: ["support tooling", "legal review"],
    forbiddenInCurrentStage: ["automated refunds"],
    safeNextAction: "Draft refund policy",
  },
  {
    area: "Privacy policy",
    status: "blocked",
    purpose: "Compliance with data protection (GDPR etc.).",
    requiredBeforeImplementation: ["legal review"],
    forbiddenInCurrentStage: ["collecting real user data"],
    safeNextAction: "Draft privacy policy text",
  },
  {
    area: "Support/access recovery",
    status: "needs-architecture",
    purpose: "Allowing users to restore purchases or fix issues.",
    requiredBeforeImplementation: ["support channel setup"],
    forbiddenInCurrentStage: ["live support widget"],
    safeNextAction: "Design support flow",
  },
  {
    area: "Fraud/abuse prevention",
    status: "future-only",
    purpose: "Prevent account sharing and payment fraud.",
    requiredBeforeImplementation: ["analytics tracking", "rate limiting"],
    forbiddenInCurrentStage: ["live blocking logic"],
    safeNextAction: "Document expected abuse vectors",
  },
  {
    area: "Production rollout gate",
    status: "protected",
    purpose: "Prevent accidental launch of broken payment flows.",
    requiredBeforeImplementation: ["master control index", "owner approval"],
    forbiddenInCurrentStage: ["live domain configuration"],
    safeNextAction: "Maintain strict QA scripts",
  },
];

export const MONETIZATION_RISK_CONTROLS: MonetizationRiskControl[] = [
  {
    risk: "Accidental payment logic launch",
    status: "protected",
    reason: "No payment logic exists in codebase.",
    control: "Strict code review and dashboard QA assertions.",
  },
  {
    risk: "Database schema drift before MVP",
    status: "protected",
    reason: "Entitlement model is spec-only.",
    control: "No Prisma migrations allowed in current packages.",
  },
  {
    risk: "VIP features active without payment",
    status: "protected",
    reason: "VIP routes are currently gated by mock shell only.",
    control: "Keep VIP logic as visual preview only.",
  },
];
