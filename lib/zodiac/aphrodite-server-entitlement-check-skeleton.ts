/**
 * Aphrodite server-side entitlement check skeleton (Package 166).
 *
 * Local fail-closed skeleton only. This file does not read a real database,
 * write records, create entitlement, grant access, call Telegram API,
 * implement payments, or connect to production user-facing flows.
 */

export type AphroditeServerEntitlementCheckInput = {
  productId: string;
  userId?: string;
  telegramUserId?: string;
  requestedRoute?: string;
  source?: "mini-app" | "api" | "dashboard" | "unknown";
  mockClientVipFlag?: boolean;
  mockQueryVipFlag?: boolean;
  mockPaymentSuccess?: boolean;
  mockEntitlementRecord?: unknown;
};

export type AphroditeServerEntitlementCheckResult = {
  allowed: false;
  decision:
    | "deny-by-default"
    | "requires-future-db-check"
    | "requires-payment-ledger"
    | "requires-owner-review"
    | "free-preview-only";
  productId: string;
  visibleMessage: string;
  fallbackRoute: string;
  requiredFutureChecks: string[];
  ignoredClientSignals: string[];
  safetyBoundary: string[];
};

export type AphroditeServerEntitlementCheckBoundary = {
  area: string;
  visibleLabel: string;
  dataBoundary: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeServerEntitlementCheckNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_SERVER_ENTITLEMENT_CHECK_SKELETON_CLASSIFICATION =
  "Server-side skeleton / Доступ всегда закрыт / Нет DB-проверки";

export const APHRODITE_SERVER_ENTITLEMENT_CHECK_RULE =
  "Server-side entitlement check skeleton должен fail closed. Без будущего verified server entitlement доступ закрыт и возвращается fallback.";

export const APHRODITE_SERVER_ENTITLEMENT_CHECK_FALLBACK_ROUTE = "/miniapp/love-reading-preview";

export const APHRODITE_SERVER_ENTITLEMENT_REQUIRED_FUTURE_CHECKS = [
  "real server user identity",
  "verified payment ledger",
  "future entitlement record from DB",
  "status is active",
  "expiresAt is absent or in future",
  "revokedAt is absent",
  "refund state is absent",
  "owner review approved",
] as const;

export const APHRODITE_SERVER_ENTITLEMENT_SAFETY_LABELS = [
  "Нет реальной VIP-разблокировки",
  "Нет оплаты",
  "Нет Telegram Stars invoice",
  "Нет successful_payment handler",
  "Нет entitlement creation",
  "Нет записи в базу данных",
  "Нет миграции схемы базы данных",
  "Нет вызова Telegram API",
  "Нет production-запуска",
  "Server check skeleton всегда возвращает allowed=false",
] as const;

export function checkAphroditeServerEntitlementSkeleton(
  input: AphroditeServerEntitlementCheckInput,
): AphroditeServerEntitlementCheckResult {
  const ignoredClientSignals = resolveIgnoredClientSignals(input);

  return {
    allowed: false,
    decision: resolveDecision(input),
    productId: input.productId,
    visibleMessage: "Доступ закрыт: server-side entitlement check skeleton не подключён к будущей verified DB-проверке и всегда возвращает allowed=false.",
    fallbackRoute: APHRODITE_SERVER_ENTITLEMENT_CHECK_FALLBACK_ROUTE,
    requiredFutureChecks: APHRODITE_SERVER_ENTITLEMENT_REQUIRED_FUTURE_CHECKS.slice(),
    ignoredClientSignals,
    safetyBoundary: getAphroditeServerEntitlementCheckBoundaries().map((boundary) => boundary.visibleLabel),
  };
}

export function getAphroditeServerEntitlementCheckBoundaries(): AphroditeServerEntitlementCheckBoundary[] {
  return [
    {
      area: "VIP unlock",
      visibleLabel: "Нет реальной VIP-разблокировки",
      dataBoundary: "no-real-vip-unlock",
      allowedNow: ["вернуть allowed=false", "вернуть fallback route"],
      blockedUntil: ["future DB entitlement check", "owner review"],
      riskLevel: "critical",
    },
    {
      area: "Payment",
      visibleLabel: "Нет оплаты",
      dataBoundary: "no-payment",
      allowedNow: ["проверить mockPaymentSuccess как игнорируемый сигнал"],
      blockedUntil: ["отдельный payment package"],
      riskLevel: "critical",
    },
    {
      area: "Telegram Stars",
      visibleLabel: "Нет Telegram Stars invoice",
      dataBoundary: "no-stars-invoice",
      allowedNow: ["не создавать invoice"],
      blockedUntil: ["отдельный invoice package"],
      riskLevel: "critical",
    },
    {
      area: "Payment update",
      visibleLabel: "Нет successful_payment handler",
      dataBoundary: "no-successful-payment-handler",
      allowedNow: ["игнорировать mock payment success"],
      blockedUntil: ["отдельный payment event package"],
      riskLevel: "critical",
    },
    {
      area: "Entitlement creation",
      visibleLabel: "Нет entitlement creation",
      dataBoundary: "no-entitlement-creation",
      allowedNow: ["проверить вход", "ничего не создавать"],
      blockedUntil: ["future persistence package"],
      riskLevel: "critical",
    },
    {
      area: "Database write",
      visibleLabel: "Нет записи в базу данных",
      dataBoundary: "no-database-write",
      allowedNow: ["локальный deterministic result"],
      blockedUntil: ["отдельная DB integration"],
      riskLevel: "critical",
    },
    {
      area: "Database schema",
      visibleLabel: "Нет миграции схемы базы данных",
      dataBoundary: "no-database-schema-migration",
      allowedNow: ["не менять schema"],
      blockedUntil: ["schema review", "migration review"],
      riskLevel: "critical",
    },
    {
      area: "Telegram API",
      visibleLabel: "Нет вызова Telegram API",
      dataBoundary: "no-telegram-api-call",
      allowedNow: ["не вызывать внешние API"],
      blockedUntil: ["отдельная Telegram integration"],
      riskLevel: "critical",
    },
    {
      area: "Production launch",
      visibleLabel: "Нет production-запуска",
      dataBoundary: "no-production-launch",
      allowedNow: ["dashboard-only skeleton", "локальный QA"],
      blockedUntil: ["owner launch checklist", "production safety PASS"],
      riskLevel: "high",
    },
    {
      area: "Fail closed",
      visibleLabel: "Server check skeleton всегда возвращает allowed=false",
      dataBoundary: "server-check-always-denies",
      allowedNow: ["fail closed", "fallback to free preview"],
      blockedUntil: ["future verified server entitlement"],
      riskLevel: "critical",
    },
  ];
}

export function getAphroditeServerEntitlementCheckNextSteps(): AphroditeServerEntitlementCheckNextStep[] {
  return [
    {
      package: "Package 167",
      title: "VIP Access Security QA Suite",
      purpose: "Собрать consolidated QA suite, которая проверяет guard, catalog, fallback, ledger, storage, schema и server skeleton на безопасное deny-by-default поведение.",
      blockedUntil: [
        "Package 166 принят владельцем",
        "allowed=false подтверждён для mock client/query/payment/entitlement signals",
        "fallback route подтверждён",
      ],
    },
  ];
}

function resolveDecision(input: AphroditeServerEntitlementCheckInput): AphroditeServerEntitlementCheckResult["decision"] {
  if (!input.productId || input.productId.includes("free-preview")) return "free-preview-only";
  if (input.mockPaymentSuccess) return "requires-payment-ledger";
  if (input.mockEntitlementRecord) return "requires-future-db-check";
  if (input.source === "dashboard") return "requires-owner-review";
  return "deny-by-default";
}

function resolveIgnoredClientSignals(input: AphroditeServerEntitlementCheckInput): string[] {
  const ignored = [
    "localStorage, query params и client-only state не являются источником доступа",
  ];

  if (input.mockClientVipFlag) ignored.push("mockClientVipFlag проигнорирован");
  if (input.mockQueryVipFlag) ignored.push("mockQueryVipFlag проигнорирован");
  if (input.mockPaymentSuccess) ignored.push("mockPaymentSuccess проигнорирован");
  if (input.mockEntitlementRecord) ignored.push("mockEntitlementRecord проигнорирован без future DB-проверки");

  return ignored;
}
