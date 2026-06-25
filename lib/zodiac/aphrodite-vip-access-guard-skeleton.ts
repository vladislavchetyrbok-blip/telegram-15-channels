/**
 * Aphrodite VIP access guard skeleton (Package 158).
 *
 * Static, local-only guard skeleton. This file deliberately does not implement
 * payments, Telegram invoices, successful payment handlers, VIP unlocks,
 * entitlement creation, persistence, schema changes, Telegram API calls, or
 * production gating.
 */

export type AphroditeVipGuardProduct =
  | "full-love-report"
  | "vip-love-access"
  | "ai-future-timeline-vip"
  | "soulmate-scanner-vip"
  | "red-flags-scanner-vip"
  | "birth-matrix-vip"
  | "natal-chart-vip"
  | "vip-couple-calendar"
  | "vip-numerology";

export type AphroditeVipGuardDecision =
  | "deny-by-default"
  | "free-preview-only"
  | "requires-server-entitlement"
  | "blocked-until-payment-ledger"
  | "blocked-until-owner-review";

export type AphroditeVipGuardInput = {
  product: AphroditeVipGuardProduct;
  telegramUserId?: string;
  userId?: string;
  requestedRoute?: string;
  source?: "mini-app" | "dashboard" | "api" | "unknown";
  mockClientVipFlag?: boolean;
  mockQueryVipFlag?: boolean;
  mockPaymentSuccess?: boolean;
};

export type AphroditeVipGuardResult = {
  product: AphroditeVipGuardProduct;
  allowed: false;
  decision: AphroditeVipGuardDecision;
  visibleMessage: string;
  fallbackRoute: string;
  requiredFutureChecks: string[];
  ignoredClientSignals: string[];
  safetyBoundary: string[];
};

export type AphroditeVipGuardBoundary = {
  area: string;
  visibleLabel: string;
  dataBoundary: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeVipGuardNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_VIP_GUARD_SKELETON_CLASSIFICATION =
  "Skeleton guard / Доступ всегда закрыт / Нет реальной VIP-разблокировки";

export const APHRODITE_VIP_GUARD_FALLBACK_ROUTE = "/miniapp/love-reading-preview";

export const APHRODITE_VIP_GUARD_REQUIRED_FUTURE_CHECKS = [
  "server-side entitlement по userRef и productId",
  "проверка Telegram initData на сервере",
  "проверка payment ledger перед созданием доступа",
  "проверка status, expiresAt и revokedAt",
  "owner review gate перед реальным запуском",
  "safe fallback to free preview при deny",
] as const;

export const APHRODITE_VIP_GUARD_IGNORED_CLIENT_SIGNALS = [
  "localStorage VIP flag",
  "query param VIP flag",
  "client-only button unlock",
  "mock successful_payment",
  "front-end-only role check",
] as const;

type ProductPolicy = {
  label: string;
  decision: AphroditeVipGuardDecision;
  message: string;
};

const productPolicies: Record<AphroditeVipGuardProduct, ProductPolicy> = {
  "full-love-report": {
    label: "Full Love Report",
    decision: "requires-server-entitlement",
    message: "Доступ к полной версии Full Love Report пока не открыт. Сейчас доступен бесплатный preview.",
  },
  "vip-love-access": {
    label: "VIP Love Access",
    decision: "requires-server-entitlement",
    message: "VIP Love Access пока закрыт. Нужна будущая server-side проверка доступа, сейчас доступен preview.",
  },
  "ai-future-timeline-vip": {
    label: "AI Future Timeline VIP",
    decision: "blocked-until-owner-review",
    message: "AI Future Timeline VIP пока закрыт до owner review и будущей server-side проверки.",
  },
  "soulmate-scanner-vip": {
    label: "Soulmate Scanner VIP",
    decision: "requires-server-entitlement",
    message: "Soulmate Scanner VIP пока закрыт. Сейчас можно показывать только бесплатный предварительный результат.",
  },
  "red-flags-scanner-vip": {
    label: "Red Flags Scanner VIP",
    decision: "blocked-until-owner-review",
    message: "Red Flags Scanner VIP пока закрыт до owner review и safety review текста.",
  },
  "birth-matrix-vip": {
    label: "Birth Matrix VIP",
    decision: "requires-server-entitlement",
    message: "Birth Matrix VIP пока закрыт. Дата рождения не является доказательством доступа.",
  },
  "natal-chart-vip": {
    label: "Natal Chart VIP",
    decision: "requires-server-entitlement",
    message: "Natal Chart VIP пока закрыт. Нужен будущий server-side entitlement для продукта.",
  },
  "vip-couple-calendar": {
    label: "VIP Couple Calendar / 30 дней пары",
    decision: "requires-server-entitlement",
    message: "VIP Couple Calendar пока закрыт как реальный платный доступ. Сейчас разрешён только безопасный preview.",
  },
  "vip-numerology": {
    label: "VIP Numerology",
    decision: "requires-server-entitlement",
    message: "VIP Numerology пока закрыта. Нужна будущая server-side проверка доступа.",
  },
};

export function checkAphroditeVipAccessSkeleton(input: AphroditeVipGuardInput): AphroditeVipGuardResult {
  const policy = productPolicies[input.product] ?? productPolicies["vip-love-access"];
  const ignoredSignals = resolveIgnoredClientSignals(input);

  return {
    product: input.product,
    allowed: false,
    decision: policy.decision,
    visibleMessage: `${policy.message} Guard skeleton всегда возвращает allowed=false.`,
    fallbackRoute: APHRODITE_VIP_GUARD_FALLBACK_ROUTE,
    requiredFutureChecks: APHRODITE_VIP_GUARD_REQUIRED_FUTURE_CHECKS.slice(),
    ignoredClientSignals: ignoredSignals,
    safetyBoundary: getAphroditeVipGuardBoundaries().map((boundary) => boundary.visibleLabel),
  };
}

export function getAphroditeVipGuardProducts(): AphroditeVipGuardProduct[] {
  return Object.keys(productPolicies) as AphroditeVipGuardProduct[];
}

export function getAphroditeVipGuardProductLabels(): Array<{ product: AphroditeVipGuardProduct; label: string }> {
  return getAphroditeVipGuardProducts().map((product) => ({
    product,
    label: productPolicies[product].label,
  }));
}

export function getAphroditeVipGuardBoundaries(): AphroditeVipGuardBoundary[] {
  return [
    {
      area: "VIP unlock",
      visibleLabel: "Нет реальной VIP-разблокировки",
      dataBoundary: "no-real-vip-unlock",
      allowedNow: ["вернуть allowed=false", "показать бесплатный preview fallback"],
      blockedUntil: ["server-side entitlement", "payment ledger", "owner review"],
      riskLevel: "critical",
    },
    {
      area: "Payment",
      visibleLabel: "Нет оплаты",
      dataBoundary: "no-payment",
      allowedNow: ["проверить deny-by-default поведение"],
      blockedUntil: ["отдельный пакет оплаты", "юридическое и продуктовой подтверждение"],
      riskLevel: "critical",
    },
    {
      area: "Telegram Stars",
      visibleLabel: "Нет Telegram Stars invoice",
      dataBoundary: "no-stars-invoice",
      allowedNow: ["не создавать invoice", "не вызывать Telegram Stars"],
      blockedUntil: ["отдельный invoice package"],
      riskLevel: "critical",
    },
    {
      area: "Payment update",
      visibleLabel: "Нет successful_payment handler",
      dataBoundary: "no-successful-payment-handler",
      allowedNow: ["игнорировать mock successful_payment"],
      blockedUntil: ["платёжный package", "ledger QA"],
      riskLevel: "critical",
    },
    {
      area: "Entitlement creation",
      visibleLabel: "Нет entitlement creation",
      dataBoundary: "no-entitlement-creation",
      allowedNow: ["описать requiredFutureChecks", "не создавать доступ"],
      blockedUntil: ["схема БД", "ledger", "owner review"],
      riskLevel: "critical",
    },
    {
      area: "Database write",
      visibleLabel: "Нет записи в базу данных",
      dataBoundary: "no-database-write",
      allowedNow: ["локальный deterministic result"],
      blockedUntil: ["schema review", "migration review", "backup"],
      riskLevel: "critical",
    },
    {
      area: "Database schema",
      visibleLabel: "Нет миграции схемы базы данных",
      dataBoundary: "no-database-schema-migration",
      allowedNow: ["не менять schema"],
      blockedUntil: ["отдельный DB package"],
      riskLevel: "critical",
    },
    {
      area: "Telegram API",
      visibleLabel: "Нет вызова Telegram API",
      dataBoundary: "no-telegram-api-call",
      allowedNow: ["не вызывать внешние API"],
      blockedUntil: ["отдельный Telegram integration package"],
      riskLevel: "critical",
    },
    {
      area: "Production launch",
      visibleLabel: "Нет production-запуска",
      dataBoundary: "no-production-launch",
      allowedNow: ["локальный skeleton", "dashboard-only отображение"],
      blockedUntil: ["owner launch checklist", "production safety PASS"],
      riskLevel: "high",
    },
    {
      area: "Deny by default",
      visibleLabel: "Guard всегда возвращает allowed=false",
      dataBoundary: "guard-always-denies",
      allowedNow: ["fail closed", "safe fallback to preview"],
      blockedUntil: ["будущий verified entitlement checker"],
      riskLevel: "critical",
    },
  ];
}

export function getAphroditeVipGuardNextSteps(): AphroditeVipGuardNextStep[] {
  return [
    {
      package: "Package 159",
      title: "VIP Access Boundary Guard Integration Review",
      purpose: "Проверить, куда skeleton можно будет подключать позже, не включая реальный VIP-доступ и не создавая entitlement.",
      blockedUntil: [
        "Package 158 принят владельцем",
        "подтверждены free preview fallback routes",
        "подтверждены server-side identity requirements",
        "подтверждены QA для deny/allow сценариев",
      ],
    },
  ];
}

function resolveIgnoredClientSignals(input: AphroditeVipGuardInput): string[] {
  const ignored = [
    "localStorage, query params и client-only state не являются источником доступа",
  ];

  if (input.mockClientVipFlag) ignored.push("mockClientVipFlag проигнорирован");
  if (input.mockQueryVipFlag) ignored.push("mockQueryVipFlag проигнорирован");
  if (input.mockPaymentSuccess) ignored.push("mockPaymentSuccess проигнорирован");

  return ignored;
}
