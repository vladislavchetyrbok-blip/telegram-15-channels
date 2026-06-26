/**
 * Package 172: Telegram Stars successful_payment skeleton.
 *
 * Local inspection model only. It parses a future-shaped mock payload and keeps
 * every payment, ledger, entitlement, access, VIP, DB, and Telegram action
 * disabled.
 */

export type AphroditeSuccessfulPaymentSkeletonInput = {
  productId: string;
  amount: number;
  currency: string;
  telegramPaymentChargeId?: string;
  providerPaymentChargeId?: string;
  invoicePayload?: string;
  telegramUserId?: string;
};

export type AphroditeSuccessfulPaymentSkeletonResult = {
  productId: string;
  productKnown: boolean;
  idempotencyKeyPreview: string;
  validationNotes: string[];
  handlerActiveNow: false;
  canCallTelegramApiNow: false;
  recordsPaymentLedgerNow: false;
  createsEntitlementNow: false;
  unlocksVipNow: false;
  grantsAccessNow: false;
};

export type AphroditeSuccessfulPaymentSkeletonRule = {
  id: string;
  label: string;
  futureCheck: string;
  requiredBeforeLive: string[];
};

export type AphroditeSuccessfulPaymentSkeletonBoundary = {
  id: string;
  visibleLabel: string;
  allowedNow: string[];
  blockedUntil: string[];
};

export type AphroditeSuccessfulPaymentSkeletonNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_TITLE =
  "Skeleton successful_payment Telegram Stars";

export const APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_CLASSIFICATION =
  "Только successful_payment skeleton / Ledger не записывается / VIP не открывается";

export const APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_RULE =
  "successful_payment skeleton parses future shape only. Он не записывает payment, не создаёт entitlement и не открывает VIP.";

export const APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_SAFETY_LABELS = [
  "Нет реальной оплаты",
  "Нет Telegram Stars invoice",
  "Нет sendInvoice",
  "Нет createInvoiceLink",
  "Нет pre_checkout_query handler",
  "Нет active successful_payment handler",
  "Нет payment ledger write",
  "Нет entitlement creation",
  "Нет реальной VIP-разблокировки",
  "Нет записи в базу данных",
  "Нет вызова Telegram API",
  "successful_payment skeleton не выдаёт доступ",
] as const;

const knownProductIds = [
  "full_love_report",
  "vip_love_access",
  "ai_future_timeline_vip",
  "soulmate_scanner_vip",
  "red_flags_scanner_vip",
  "birth_matrix_vip",
  "natal_chart_vip",
  "vip_couple_calendar",
  "vip_numerology",
] as const;

const rules: AphroditeSuccessfulPaymentSkeletonRule[] = [
  {
    id: "idempotency-key",
    label: "Idempotency key",
    futureCheck: "Для каждого payment event нужен стабильный idempotency key.",
    requiredBeforeLive: ["payment ledger unique key", "duplicate event QA"],
  },
  {
    id: "duplicate-prevention",
    label: "Duplicate payment prevention",
    futureCheck: "Повторный payment event не должен создавать второй ledger или entitlement.",
    requiredBeforeLive: ["retry policy", "idempotency QA"],
  },
  {
    id: "telegram-charge-id",
    label: "Telegram payment charge id",
    futureCheck: "telegram payment charge id должен попадать в verified ledger.",
    requiredBeforeLive: ["ledger schema review", "support audit"],
  },
  {
    id: "provider-charge-id",
    label: "Provider payment charge id",
    futureCheck: "provider payment charge id сохраняется только если он доступен.",
    requiredBeforeLive: ["provider field review", "privacy review"],
  },
  {
    id: "invoice-payload-validation",
    label: "Invoice payload validation",
    futureCheck: "invoice payload должен связывать payment с productId и пользователем.",
    requiredBeforeLive: ["payload parser review", "pre-checkout skeleton PASS"],
  },
  {
    id: "product-validation",
    label: "productId validation",
    futureCheck: "productId должен существовать в product catalog.",
    requiredBeforeLive: ["invoice builder skeleton PASS", "catalog QA"],
  },
  {
    id: "amount-currency-validation",
    label: "amount/currency validation",
    futureCheck: "amount и currency должны совпадать с будущим invoice draft.",
    requiredBeforeLive: ["price review", "XTR validation"],
  },
  {
    id: "user-identity-validation",
    label: "user identity validation",
    futureCheck: "user identity должен быть подтверждён до ledger write.",
    requiredBeforeLive: ["Telegram initData review", "profile foundation"],
  },
  {
    id: "ledger-after-verification",
    label: "Payment ledger after verification",
    futureCheck: "payment ledger write возможен только после полной verification.",
    requiredBeforeLive: ["fresh backup", "DB review", "owner approval"],
  },
  {
    id: "entitlement-after-ledger",
    label: "Entitlement after verified ledger",
    futureCheck: "entitlement creation возможен только после verified ledger.",
    requiredBeforeLive: ["entitlement storage", "server-side entitlement check"],
  },
  {
    id: "refund-revocation",
    label: "Refund/revocation handling",
    futureCheck: "refund и revocation должны закрывать будущий доступ.",
    requiredBeforeLive: ["support/refund policy", "revoke flow"],
  },
  {
    id: "owner-review-gate",
    label: "Owner review gate",
    futureCheck: "owner review gate должен оставаться стоппером перед live payment.",
    requiredBeforeLive: ["Package 168", "manual owner approval"],
  },
  {
    id: "security-qa",
    label: "Security QA",
    futureCheck: "security QA должен падать при любом client-side access bypass.",
    requiredBeforeLive: ["Package 167", "payment skeleton QA"],
  },
];

export function inspectAphroditeSuccessfulPaymentSkeleton(
  input: AphroditeSuccessfulPaymentSkeletonInput,
): AphroditeSuccessfulPaymentSkeletonResult {
  const productKnown = knownProductIds.includes(input.productId as (typeof knownProductIds)[number]);
  const telegramCharge = input.telegramPaymentChargeId ?? "missing-telegram-charge";
  const providerCharge = input.providerPaymentChargeId ?? "missing-provider-charge";
  const idempotencyKeyPreview = `${input.productId}:${telegramCharge}:${providerCharge}`;

  return {
    productId: input.productId,
    productKnown,
    idempotencyKeyPreview,
    validationNotes: [
      productKnown ? "productId найден в product catalog" : "productId требует проверки product catalog",
      input.currency === "XTR" ? "currency XTR" : "currency должна быть XTR",
      input.telegramPaymentChargeId ? "telegram payment charge id присутствует" : "telegram payment charge id отсутствует",
      input.invoicePayload ? "invoice payload присутствует" : "invoice payload отсутствует",
      input.telegramUserId ? "user identity присутствует" : "user identity отсутствует",
      "ledger write, entitlement creation и VIP unlock заблокированы в Package 172",
    ],
    handlerActiveNow: false,
    canCallTelegramApiNow: false,
    recordsPaymentLedgerNow: false,
    createsEntitlementNow: false,
    unlocksVipNow: false,
    grantsAccessNow: false,
  };
}

export function getAphroditeSuccessfulPaymentSkeletonRules(): AphroditeSuccessfulPaymentSkeletonRule[] {
  return rules.map((rule) => ({
    ...rule,
    requiredBeforeLive: rule.requiredBeforeLive.slice(),
  }));
}

export function getAphroditeSuccessfulPaymentSkeletonBoundaries(): AphroditeSuccessfulPaymentSkeletonBoundary[] {
  return [
    {
      id: "no-active-successful-payment-handler",
      visibleLabel: "Нет active successful_payment handler",
      allowedNow: ["локально разобрать mock payload"],
      blockedUntil: ["отдельный live handler package", "owner approval"],
    },
    {
      id: "no-ledger-write",
      visibleLabel: "Нет payment ledger write",
      allowedNow: ["показать ledger dependency"],
      blockedUntil: ["verified ledger storage", "fresh backup"],
    },
    {
      id: "no-entitlement-creation",
      visibleLabel: "Нет entitlement creation",
      allowedNow: ["показать dependency от verified ledger"],
      blockedUntil: ["entitlement storage", "server-side entitlement check"],
    },
    {
      id: "no-access-grant",
      visibleLabel: "successful_payment skeleton не выдаёт доступ",
      allowedNow: ["оставить grantsAccessNow: false"],
      blockedUntil: ["server-side entitlement check", "security QA PASS"],
    },
    {
      id: "no-telegram-api",
      visibleLabel: "Нет вызова Telegram API",
      allowedNow: ["локальная inspection model"],
      blockedUntil: ["Telegram API review"],
    },
    {
      id: "no-database-write",
      visibleLabel: "Нет записи в базу данных",
      allowedNow: ["read-only preview"],
      blockedUntil: ["DB review", "backup younger than 24h"],
    },
  ];
}

export function getAphroditeSuccessfulPaymentSkeletonNextSteps(): AphroditeSuccessfulPaymentSkeletonNextStep[] {
  return [
    {
      package: "Package 173",
      title: "Payment Ledger Mock Integration",
      purpose: "Связать invoice, pre-checkout и successful_payment skeleton в локальный mock ledger preview без persistence и без доступа.",
      blockedUntil: [
        "Package 172 committed",
        "recordsPaymentLedgerNow остаётся false",
        "createsEntitlementNow остаётся false",
        "grantsAccessNow остаётся false",
      ],
    },
  ];
}
