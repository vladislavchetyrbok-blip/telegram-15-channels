/**
 * Aphrodite payment ledger design (Package 163).
 *
 * Design/readiness only. This file deliberately does not create invoices,
 * handle payment updates, write records, create entitlements, unlock VIP,
 * call Telegram API, or connect to production delivery.
 */

export type AphroditePaymentLedgerProvider =
  | "telegram-stars-future"
  | "manual-review-future"
  | "test-mode-future";

export type AphroditePaymentLedgerStatus =
  | "design-only"
  | "pending-future"
  | "verified-future"
  | "failed-future"
  | "refunded-future"
  | "revoked-future"
  | "owner-review-required";

export type AphroditePaymentLedgerRiskLevel = "low" | "medium" | "high" | "critical";

export type AphroditePaymentLedgerItem = {
  id: string;
  productId: string;
  provider: AphroditePaymentLedgerProvider;
  status: AphroditePaymentLedgerStatus;
  userIdField: string;
  telegramUserIdField: string;
  sourcePaymentIdField: string;
  amountField: string;
  currencyField: string;
  createdAtField: string;
  verifiedAtField: string;
  refundedAtField: string;
  auditReasonField: string;
  designOnly: true;
  createsEntitlementNow: false;
  writesToDatabaseNow: false;
};

export type AphroditePaymentLedgerRule = {
  id: string;
  label: string;
  visibleRule: string;
  appliesTo: string[];
  blockedUntil: string[];
};

export type AphroditePaymentLedgerBoundary = {
  area: string;
  visibleLabel: string;
  dataBoundary: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: AphroditePaymentLedgerRiskLevel;
};

export type AphroditePaymentLedgerNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export type AphroditePaymentLedgerCatalogAlignment = {
  futureProductIds: string[];
  fallbackRoute: string;
  requiredBeforeEntitlement: boolean;
  ownerReviewRequired: boolean;
};

export const APHRODITE_PAYMENT_LEDGER_DESIGN_CLASSIFICATION =
  "Только дизайн ledger / Нет оплаты / Нет записи в базу данных";

export const APHRODITE_PAYMENT_LEDGER_DESIGN_RULE =
  "Payment ledger требуется перед entitlement. Entitlement не может существовать без verified payment ledger и owner review.";

export const APHRODITE_PAYMENT_LEDGER_CATALOG_REFERENCE = "lib/zodiac/aphrodite-product-catalog.ts";
export const APHRODITE_PAYMENT_LEDGER_FALLBACK_ROUTE = "/miniapp/love-reading-preview";

export const APHRODITE_PAYMENT_LEDGER_SAFETY_LABELS = [
  "Нет реальной оплаты",
  "Нет Telegram Stars invoice",
  "Нет successful_payment handler",
  "Нет entitlement creation",
  "Нет записи в базу данных",
  "Нет миграции схемы базы данных",
  "Нет вызова Telegram API",
  "Нет production-запуска",
  "Ledger ничего не записывает",
] as const;

const LEDGER_FIELD_NAMES = {
  userIdField: "userId",
  telegramUserIdField: "telegramUserId",
  sourcePaymentIdField: "sourcePaymentId",
  amountField: "amount",
  currencyField: "currency",
  createdAtField: "createdAt",
  verifiedAtField: "verifiedAt",
  refundedAtField: "refundedAt",
  auditReasonField: "auditReason",
} as const;

const ledgerItems: AphroditePaymentLedgerItem[] = [
  {
    id: "telegram-stars-ledger-design",
    productId: "future-vip-products-from-catalog",
    provider: "telegram-stars-future",
    status: "design-only",
    ...LEDGER_FIELD_NAMES,
    designOnly: true,
    createsEntitlementNow: false,
    writesToDatabaseNow: false,
  },
  {
    id: "manual-owner-review-ledger-design",
    productId: "owner-reviewed-product",
    provider: "manual-review-future",
    status: "owner-review-required",
    ...LEDGER_FIELD_NAMES,
    designOnly: true,
    createsEntitlementNow: false,
    writesToDatabaseNow: false,
  },
  {
    id: "test-mode-ledger-design",
    productId: "test-mode-product",
    provider: "test-mode-future",
    status: "pending-future",
    ...LEDGER_FIELD_NAMES,
    designOnly: true,
    createsEntitlementNow: false,
    writesToDatabaseNow: false,
  },
];

const FUTURE_PRODUCT_IDS = [
  "full-love-report",
  "vip-love-access",
  "ai-future-timeline-vip",
  "soulmate-scanner-vip",
  "red-flags-scanner-vip",
  "birth-matrix-vip",
  "natal-chart-vip",
  "vip-couple-calendar",
  "vip-numerology",
] as const;

export function getAphroditePaymentLedgerDesignItems(): AphroditePaymentLedgerItem[] {
  return ledgerItems.map((item) => ({ ...item }));
}

export function getAphroditePaymentLedgerDesignRules(): AphroditePaymentLedgerRule[] {
  const futureProductIds = FUTURE_PRODUCT_IDS.slice();

  return [
    {
      id: "ledger-before-entitlement",
      label: "Ledger before entitlement",
      visibleRule: APHRODITE_PAYMENT_LEDGER_DESIGN_RULE,
      appliesTo: futureProductIds,
      blockedUntil: ["отдельная реализация payment ledger", "owner review", "server-side entitlement check"],
    },
    {
      id: "catalog-product-required",
      label: "Product must be from catalog",
      visibleRule: "Будущая ledger-запись должна ссылаться только на productId из финального каталога Aphrodite.",
      appliesTo: futureProductIds,
      blockedUntil: ["каталог продуктов подтверждён", "ручная проверка owner перед запуском"],
    },
    {
      id: "verified-payment-required",
      label: "Verified payment is required",
      visibleRule: "Статус verified-future является только будущим состоянием дизайна и не создаёт доступ сейчас.",
      appliesTo: futureProductIds,
      blockedUntil: ["безопасная обработка платежного события", "аудит refunds/revocations", "owner review"],
    },
    {
      id: "no-database-write-now",
      label: "No database write now",
      visibleRule: "Package 163 описывает поля и статусы, но не пишет ledger в базу данных и не меняет схему.",
      appliesTo: ["dashboard", "local-model", "docs"],
      blockedUntil: ["отдельный DB package", "миграция после review", "backup перед изменениями"],
    },
    {
      id: "free-preview-remains-open",
      label: "Free preview remains open",
      visibleRule: `При любом отсутствии будущего verified ledger пользователь должен попадать в бесплатный fallback ${APHRODITE_PAYMENT_LEDGER_FALLBACK_ROUTE}.`,
      appliesTo: futureProductIds,
      blockedUntil: ["server-side deny/fallback проверка", "owner review"],
    },
  ];
}

export function getAphroditePaymentLedgerDesignBoundaries(): AphroditePaymentLedgerBoundary[] {
  return [
    {
      area: "Payment",
      visibleLabel: "Нет реальной оплаты",
      dataBoundary: "no-real-payment",
      allowedNow: ["описать будущие поля платежа", "показать статус design-only"],
      blockedUntil: ["отдельный платежный package", "owner review"],
      riskLevel: "critical",
    },
    {
      area: "Telegram Stars",
      visibleLabel: "Нет Telegram Stars invoice",
      dataBoundary: "no-stars-invoice",
      allowedNow: ["описать будущий provider telegram-stars-future"],
      blockedUntil: ["отдельная invoice-интеграция", "production safety PASS"],
      riskLevel: "critical",
    },
    {
      area: "Payment update",
      visibleLabel: "Нет successful_payment handler",
      dataBoundary: "no-successful-payment-handler",
      allowedNow: ["описать будущий sourcePaymentIdField"],
      blockedUntil: ["отдельный webhook/payment package", "аудит обработки refunds"],
      riskLevel: "critical",
    },
    {
      area: "Entitlement",
      visibleLabel: "Нет entitlement creation",
      dataBoundary: "no-entitlement-creation",
      allowedNow: ["зафиксировать правило ledger-before-entitlement"],
      blockedUntil: ["verified ledger", "storage design", "server-side check", "owner review"],
      riskLevel: "critical",
    },
    {
      area: "Database write",
      visibleLabel: "Нет записи в базу данных",
      dataBoundary: "no-database-write",
      allowedNow: ["статический TypeScript-дизайн", "read-only dashboard"],
      blockedUntil: ["отдельная схема", "миграция после review"],
      riskLevel: "critical",
    },
    {
      area: "Database schema",
      visibleLabel: "Нет миграции схемы базы данных",
      dataBoundary: "no-database-schema-migration",
      allowedNow: ["не менять schema", "не добавлять migrations"],
      blockedUntil: ["отдельный DB package"],
      riskLevel: "critical",
    },
    {
      area: "Telegram API",
      visibleLabel: "Нет вызова Telegram API",
      dataBoundary: "no-telegram-api-call",
      allowedNow: ["локальная документация", "dashboard-отображение"],
      blockedUntil: ["отдельная Telegram integration"],
      riskLevel: "critical",
    },
    {
      area: "Production launch",
      visibleLabel: "Нет production-запуска",
      dataBoundary: "no-production-launch",
      allowedNow: ["дизайн readiness", "ручная проверка"],
      blockedUntil: ["owner launch checklist", "production safety PASS"],
      riskLevel: "high",
    },
    {
      area: "Ledger persistence",
      visibleLabel: "Ledger ничего не записывает",
      dataBoundary: "ledger-writes-nothing",
      allowedNow: ["вернуть статические элементы дизайна"],
      blockedUntil: ["future persistence package", "backup", "schema review"],
      riskLevel: "critical",
    },
  ];
}

export function getAphroditePaymentLedgerDesignNextSteps(): AphroditePaymentLedgerNextStep[] {
  return [
    {
      package: "Package 164",
      title: "Entitlement Storage Design",
      purpose: "Описать будущие поля хранения VIP-доступа после verified payment ledger, не создавая entitlement и не записывая данные.",
      blockedUntil: [
        "Package 163 принят владельцем",
        "ledger-before-entitlement правило подтверждено",
        "границы no payment/no DB write подтверждены QA",
      ],
    },
  ];
}

export function getAphroditePaymentLedgerCatalogAlignment(): AphroditePaymentLedgerCatalogAlignment {
  return {
    futureProductIds: FUTURE_PRODUCT_IDS.slice(),
    fallbackRoute: APHRODITE_PAYMENT_LEDGER_FALLBACK_ROUTE,
    requiredBeforeEntitlement: true,
    ownerReviewRequired: true,
  };
}
