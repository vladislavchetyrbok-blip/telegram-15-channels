/**
 * Package 175: production payment safety gate.
 *
 * Fail-closed readiness model only. It centralizes future payment/VIP launch
 * prerequisites, but never enables payment, Telegram Stars, ledger writes,
 * entitlement creation, DB writes, production launch, or VIP unlock.
 */

export type AphroditeProductionPaymentSafetyArea =
  | "owner-review"
  | "environment-flags"
  | "telegram-stars"
  | "invoice-builder"
  | "pre-checkout"
  | "successful-payment"
  | "payment-ledger"
  | "entitlement-creation"
  | "server-entitlement-check"
  | "database"
  | "backup"
  | "support-refund"
  | "security-qa"
  | "production-launch";

export type AphroditeProductionPaymentSafetyInput = {
  ownerApproved?: boolean;
  paymentsEnabled?: boolean;
  starsLiveEnabled?: boolean;
  entitlementsEnabled?: boolean;
  productionLaunchApproved?: boolean;
  databaseConfigured?: boolean;
  telegramBotTokenConfigured?: boolean;
  backupFresh?: boolean;
  supportReady?: boolean;
  refundPolicyReady?: boolean;
  securityQaPassed?: boolean;
  paymentLedgerReady?: boolean;
  entitlementStorageReady?: boolean;
};

export type AphroditeProductionPaymentSafetyResult = {
  productionPaymentAllowedNow: false;
  telegramStarsLiveAllowedNow: false;
  invoiceSendingAllowedNow: false;
  preCheckoutAllowedNow: false;
  successfulPaymentHandlingAllowedNow: false;
  paymentLedgerWriteAllowedNow: false;
  entitlementCreationAllowedNow: false;
  vipUnlockAllowedNow: false;
  databaseWriteAllowedNow: false;
  productionLaunchAllowedNow: false;
  visibleMessage: string;
  blockedReasons: string[];
  requiredFutureChecks: string[];
  requiredFutureEnvFlags: string[];
  safetyBoundary: string[];
};

export type AphroditeProductionPaymentSafetyRule = {
  id: string;
  area: AphroditeProductionPaymentSafetyArea;
  label: string;
  visibleRule: string;
  mustPassBeforeLaunch: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeProductionPaymentSafetyBoundary = {
  area: string;
  visibleLabel: string;
  dataBoundary: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeProductionPaymentSafetyNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_PRODUCTION_PAYMENT_SAFETY_GATE_TITLE = "Production Safety Gate для оплаты";

export const APHRODITE_PRODUCTION_PAYMENT_SAFETY_GATE_CLASSIFICATION =
  "Fail-closed safety gate / Оплата не разрешена / VIP не открывается";

export const APHRODITE_PRODUCTION_PAYMENT_SAFETY_GATE_RULE =
  "Production payment safety gate must fail closed. В Package 175 productionPaymentAllowedNow всегда false.";

export const APHRODITE_PRODUCTION_PAYMENT_REQUIRED_FUTURE_ENV_FLAGS = [
  "APHRODITE_OWNER_APPROVED",
  "APHRODITE_PAYMENTS_ENABLED",
  "APHRODITE_STARS_LIVE_ENABLED",
  "APHRODITE_ENTITLEMENTS_ENABLED",
  "APHRODITE_PRODUCTION_LAUNCH_APPROVED",
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
] as const;

export const APHRODITE_PRODUCTION_PAYMENT_SAFETY_LABELS = [
  "Нет реальной оплаты",
  "Нет Telegram Stars invoice",
  "Нет sendInvoice",
  "Нет createInvoiceLink",
  "Нет pre_checkout_query handler",
  "Нет successful_payment handler",
  "Нет payment ledger write",
  "Нет entitlement creation",
  "Нет реальной VIP-разблокировки",
  "Нет записи в базу данных",
  "Нет миграции схемы базы данных",
  "Нет вызова Telegram API",
  "Нет production-запуска",
  "Production payment safety gate всегда закрыт",
] as const;

const rules: AphroditeProductionPaymentSafetyRule[] = [
  {
    id: "owner-review-required",
    area: "owner-review",
    label: "Owner review dependency",
    visibleRule: "Будущий запуск оплаты требует отдельного ручного owner review, но Package 175 не включает runtime-разрешение.",
    mustPassBeforeLaunch: ["Package 168 PASS", "ручное подтверждение owner", "отдельный release checklist"],
    blockedUntil: ["owner review подтверждён вне этого пакета", "Package 175 остаётся fail-closed"],
    riskLevel: "critical",
  },
  {
    id: "future-env-flags-only",
    area: "environment-flags",
    label: "Future env flags",
    visibleRule: "Env flags документируются только как будущие prerequisites и не читаются для включения оплаты.",
    mustPassBeforeLaunch: [...APHRODITE_PRODUCTION_PAYMENT_REQUIRED_FUTURE_ENV_FLAGS],
    blockedUntil: ["отдельный production package", "audit env handling", "owner approval"],
    riskLevel: "critical",
  },
  {
    id: "telegram-stars-blocked",
    area: "telegram-stars",
    label: "Telegram Stars live gate",
    visibleRule: "Telegram Stars остаётся выключенным: нет invoice, нет sendInvoice, нет createInvoiceLink.",
    mustPassBeforeLaunch: ["Telegram API review", "bot token review", "Stars policy review"],
    blockedUntil: ["live Stars approval", "security QA", "support/refund policy"],
    riskLevel: "critical",
  },
  {
    id: "invoice-builder-blocked",
    area: "invoice-builder",
    label: "Invoice builder dependency",
    visibleRule: "Invoice builder остаётся draft-only и не может отправить invoice.",
    mustPassBeforeLaunch: ["Package 170 PASS", "product catalog price review", "owner approval"],
    blockedUntil: ["invoice send package", "Telegram API review"],
    riskLevel: "high",
  },
  {
    id: "pre-checkout-blocked",
    area: "pre-checkout",
    label: "Pre-checkout dependency",
    visibleRule: "pre_checkout_query handler не создаётся, answerPreCheckoutQuery не вызывается.",
    mustPassBeforeLaunch: ["Package 171 PASS", "payload validation", "amount/currency validation"],
    blockedUntil: ["handler package", "idempotency design", "owner approval"],
    riskLevel: "critical",
  },
  {
    id: "successful-payment-blocked",
    area: "successful-payment",
    label: "successful_payment dependency",
    visibleRule: "successful_payment handler не активен и не выдаёт доступ.",
    mustPassBeforeLaunch: ["Package 172 PASS", "idempotency", "duplicate payment prevention"],
    blockedUntil: ["verified ledger write", "refund/revocation handling"],
    riskLevel: "critical",
  },
  {
    id: "payment-ledger-blocked",
    area: "payment-ledger",
    label: "Payment ledger dependency",
    visibleRule: "payment ledger write запрещён до verified payment и отдельного persistence review.",
    mustPassBeforeLaunch: ["Package 173 PASS", "idempotent storage", "fresh backup", "DB review"],
    blockedUntil: ["DATABASE_URL review", "migration review", "backup younger than 24h"],
    riskLevel: "critical",
  },
  {
    id: "entitlement-creation-blocked",
    area: "entitlement-creation",
    label: "Entitlement dependency",
    visibleRule: "entitlement creation запрещён до verified ledger и server-side entitlement check.",
    mustPassBeforeLaunch: ["Package 174 PASS", "entitlement storage", "server-side entitlement check"],
    blockedUntil: ["verified payment ledger", "security QA", "owner approval"],
    riskLevel: "critical",
  },
  {
    id: "server-entitlement-check-required",
    area: "server-entitlement-check",
    label: "Server entitlement dependency",
    visibleRule: "VIP нельзя открыть клиентским флагом; нужен server-side entitlement check.",
    mustPassBeforeLaunch: ["Package 166 PASS", "no client bypass QA", "security suite PASS"],
    blockedUntil: ["server-side entitlement check connected to verified storage"],
    riskLevel: "critical",
  },
  {
    id: "database-and-backup-required",
    area: "database",
    label: "Database/backup dependency",
    visibleRule: "Любая запись в базу запрещена до DATABASE_URL review, fresh backup и schema review.",
    mustPassBeforeLaunch: ["DATABASE_URL configured", "backup freshness", "schema review"],
    blockedUntil: ["production safety PASS", "backup younger than 24h"],
    riskLevel: "critical",
  },
  {
    id: "support-refund-required",
    area: "support-refund",
    label: "Support/refund dependency",
    visibleRule: "Оплата не запускается без support/refund policy, revoke flow и спорных платежей.",
    mustPassBeforeLaunch: ["support policy", "refund policy", "revocation process"],
    blockedUntil: ["manual support readiness review"],
    riskLevel: "high",
  },
  {
    id: "security-qa-required",
    area: "security-qa",
    label: "Security QA dependency",
    visibleRule: "Security QA должен падать при любом client-side VIP bypass или mock payment success.",
    mustPassBeforeLaunch: ["Package 167 PASS", "payment/VIP QA", "no fake entitlement access"],
    blockedUntil: ["security QA PASS after payment wiring"],
    riskLevel: "critical",
  },
  {
    id: "production-launch-blocked",
    area: "production-launch",
    label: "Production launch gate",
    visibleRule: "production launch запрещён в Package 175 даже при all-true mock input.",
    mustPassBeforeLaunch: ["owner approval", "env flags", "safety QA", "backup", "support"],
    blockedUntil: ["separate production readiness review"],
    riskLevel: "critical",
  },
];

const requiredFutureChecks = [
  "owner review dependency",
  "environment flags dependency",
  "Telegram Stars invoice dependency",
  "invoice builder dependency",
  "pre-checkout validation dependency",
  "successful_payment handler dependency",
  "payment ledger dependency",
  "entitlement dependency",
  "server-side entitlement check dependency",
  "database/backup dependency",
  "support/refund dependency",
  "security QA dependency",
  "production launch dependency",
];

export function evaluateAphroditeProductionPaymentSafetyGate(
  input: AphroditeProductionPaymentSafetyInput = {},
): AphroditeProductionPaymentSafetyResult {
  const blockedReasons = [
    input.ownerApproved ? "ownerApproved=true получен как mock, но Package 175 не включает production payment" : "owner review ещё не является runtime-разрешением",
    input.paymentsEnabled ? "paymentsEnabled=true получен как mock, но оплата остаётся выключенной" : "paymentsEnabled не даёт доступ в этом пакете",
    input.starsLiveEnabled ? "starsLiveEnabled=true получен как mock, но Telegram Stars live запрещён" : "Telegram Stars live не разрешён",
    input.entitlementsEnabled ? "entitlementsEnabled=true получен как mock, но entitlement creation запрещён" : "entitlement creation не разрешён",
    input.productionLaunchApproved ? "productionLaunchApproved=true получен как mock, но production launch запрещён" : "production launch не разрешён",
    input.databaseConfigured ? "databaseConfigured=true получен как mock, но DB write запрещён" : "database write не разрешён",
    input.telegramBotTokenConfigured ? "TELEGRAM_BOT_TOKEN отмечен как mock, но Telegram API не вызывается" : "Telegram API не разрешён",
    input.backupFresh ? "backupFresh=true получен как mock, но safety gate остаётся закрытым" : "fresh backup обязателен до будущих DB writes",
    input.supportReady && input.refundPolicyReady ? "support/refund отмечены как mock, но оплата не включается" : "support/refund policy обязательны до будущей оплаты",
    input.securityQaPassed ? "securityQaPassed=true получен как mock, но launch не разрешён" : "security QA обязателен до будущего launch",
    input.paymentLedgerReady ? "paymentLedgerReady=true получен как mock, но ledger write запрещён" : "payment ledger write не разрешён",
    input.entitlementStorageReady ? "entitlementStorageReady=true получен как mock, но access grant запрещён" : "entitlement storage не выдаёт доступ в этом пакете",
  ];

  return {
    productionPaymentAllowedNow: false,
    telegramStarsLiveAllowedNow: false,
    invoiceSendingAllowedNow: false,
    preCheckoutAllowedNow: false,
    successfulPaymentHandlingAllowedNow: false,
    paymentLedgerWriteAllowedNow: false,
    entitlementCreationAllowedNow: false,
    vipUnlockAllowedNow: false,
    databaseWriteAllowedNow: false,
    productionLaunchAllowedNow: false,
    visibleMessage:
      "Production payment safety gate всегда закрыт: оплата, Telegram Stars, ledger write, entitlement creation, VIP unlock и production launch не разрешены.",
    blockedReasons,
    requiredFutureChecks: requiredFutureChecks.slice(),
    requiredFutureEnvFlags: [...APHRODITE_PRODUCTION_PAYMENT_REQUIRED_FUTURE_ENV_FLAGS],
    safetyBoundary: [...APHRODITE_PRODUCTION_PAYMENT_SAFETY_LABELS],
  };
}

export function getAphroditeProductionPaymentSafetyRules(): AphroditeProductionPaymentSafetyRule[] {
  return rules.map((rule) => ({
    ...rule,
    mustPassBeforeLaunch: rule.mustPassBeforeLaunch.slice(),
    blockedUntil: rule.blockedUntil.slice(),
  }));
}

export function getAphroditeProductionPaymentSafetyBoundaries(): AphroditeProductionPaymentSafetyBoundary[] {
  return [
    {
      area: "payment",
      visibleLabel: "Нет реальной оплаты",
      dataBoundary: "no-real-payment",
      allowedNow: ["read-only safety summary", "mock input evaluation"],
      blockedUntil: ["owner review", "env flags", "payment QA", "support/refund readiness"],
      riskLevel: "critical",
    },
    {
      area: "telegram-stars",
      visibleLabel: "Нет Telegram Stars invoice",
      dataBoundary: "no-stars-invoice",
      allowedNow: ["future requirements only"],
      blockedUntil: ["Telegram Stars launch package", "Telegram API review"],
      riskLevel: "critical",
    },
    {
      area: "invoice",
      visibleLabel: "Нет sendInvoice",
      dataBoundary: "no-send-invoice",
      allowedNow: ["invoice draft review"],
      blockedUntil: ["owner approval", "Telegram API review"],
      riskLevel: "critical",
    },
    {
      area: "invoice-link",
      visibleLabel: "Нет createInvoiceLink",
      dataBoundary: "no-create-invoice-link",
      allowedNow: ["no live invoice link"],
      blockedUntil: ["separate invoice link implementation review"],
      riskLevel: "critical",
    },
    {
      area: "pre-checkout",
      visibleLabel: "Нет pre_checkout_query handler",
      dataBoundary: "no-pre-checkout-handler",
      allowedNow: ["rules documentation"],
      blockedUntil: ["handler implementation package", "payload QA"],
      riskLevel: "critical",
    },
    {
      area: "successful-payment",
      visibleLabel: "Нет successful_payment handler",
      dataBoundary: "no-successful-payment-handler",
      allowedNow: ["shape inspection notes"],
      blockedUntil: ["idempotent ledger write package"],
      riskLevel: "critical",
    },
    {
      area: "payment-ledger",
      visibleLabel: "Нет payment ledger write",
      dataBoundary: "no-payment-ledger-write",
      allowedNow: ["mock ledger preview"],
      blockedUntil: ["verified payment ledger", "DB review", "fresh backup"],
      riskLevel: "critical",
    },
    {
      area: "entitlement",
      visibleLabel: "Нет entitlement creation",
      dataBoundary: "no-entitlement-creation",
      allowedNow: ["entitlement grant mock"],
      blockedUntil: ["verified ledger", "server-side entitlement check", "security QA"],
      riskLevel: "critical",
    },
    {
      area: "vip",
      visibleLabel: "Нет реальной VIP-разблокировки",
      dataBoundary: "no-real-vip-unlock",
      allowedNow: ["free preview fallback"],
      blockedUntil: ["server-side verified entitlement"],
      riskLevel: "critical",
    },
    {
      area: "database",
      visibleLabel: "Нет записи в базу данных",
      dataBoundary: "no-database-write",
      allowedNow: ["TypeScript-only safety model"],
      blockedUntil: ["DATABASE_URL review", "backup freshness", "schema review"],
      riskLevel: "critical",
    },
    {
      area: "schema",
      visibleLabel: "Нет миграции схемы базы данных",
      dataBoundary: "no-database-schema-migration",
      allowedNow: ["no schema file changes"],
      blockedUntil: ["migration package", "backup younger than 24h"],
      riskLevel: "critical",
    },
    {
      area: "telegram-api",
      visibleLabel: "Нет вызова Telegram API",
      dataBoundary: "no-telegram-api-call",
      allowedNow: ["static dashboard and local QA"],
      blockedUntil: ["Telegram API package", "bot token review"],
      riskLevel: "critical",
    },
    {
      area: "production-launch",
      visibleLabel: "Нет production-запуска",
      dataBoundary: "no-production-launch",
      allowedNow: ["fail-closed readiness gate"],
      blockedUntil: ["separate production readiness review"],
      riskLevel: "critical",
    },
    {
      area: "fail-closed",
      visibleLabel: "Production payment safety gate всегда закрыт",
      dataBoundary: "production-payment-safety-gate-fail-closed",
      allowedNow: ["all runtime permissions false"],
      blockedUntil: ["Package 176 review and later explicit approval"],
      riskLevel: "critical",
    },
  ];
}

export function getAphroditeProductionPaymentSafetyNextSteps(): AphroditeProductionPaymentSafetyNextStep[] {
  return [
    {
      package: "Package 176",
      title: "First Paid MVP Readiness Review",
      purpose:
        "Проверить, какие элементы ещё отсутствуют перед первым платным MVP, не включая оплату автоматически и не открывая VIP.",
      blockedUntil: [
        "Package 175 committed",
        "productionPaymentAllowedNow остаётся false",
        "payment/VIP QA остаётся PASS",
        "пользователь отдельно подтверждает старт Package 176",
      ],
    },
  ];
}
