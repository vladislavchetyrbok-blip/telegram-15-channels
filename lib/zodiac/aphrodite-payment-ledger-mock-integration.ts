/**
 * Package 173: payment ledger mock integration.
 *
 * Local preview only. This module references the invoice, pre-checkout, and
 * successful payment skeletons as future dependencies, but it does not persist
 * ledger data, verify payment, create entitlement, unlock VIP, write DB, or
 * call Telegram API.
 */

export type AphroditePaymentLedgerMockInput = {
  productId: string;
  telegramUserId?: string;
  amount?: number;
  currency?: string;
  invoicePayload?: string;
  mockPaymentChargeId?: string;
};

export type AphroditePaymentLedgerMockResult = {
  productId: string;
  mockFlowId: string;
  fallbackRoute: "/miniapp/love-reading-preview";
  referencedSkeletons: string[];
  previewSteps: AphroditePaymentLedgerMockStep[];
  mockOnly: true;
  writesToDatabaseNow: false;
  persistsLedgerNow: false;
  verifiedPaymentNow: false;
  createsEntitlementNow: false;
  unlocksVipNow: false;
  grantsAccessNow: false;
};

export type AphroditePaymentLedgerMockStep = {
  id: string;
  label: string;
  status: "mock-only" | "blocked";
  description: string;
  blocksNow: string[];
};

export type AphroditePaymentLedgerMockBoundary = {
  id: string;
  visibleLabel: string;
  allowedNow: string[];
  blockedUntil: string[];
};

export type AphroditePaymentLedgerMockNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_PAYMENT_LEDGER_MOCK_TITLE = "Mock-интеграция payment ledger";

export const APHRODITE_PAYMENT_LEDGER_MOCK_CLASSIFICATION =
  "Только mock / Ledger не сохраняется / VIP не открывается";

export const APHRODITE_PAYMENT_LEDGER_MOCK_RULE =
  "Payment ledger mock integration is local preview only. Он не сохраняет payment и не создаёт доступ.";

export const APHRODITE_PAYMENT_LEDGER_MOCK_SAFETY_LABELS = [
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
  "Mock ledger ничего не сохраняет",
] as const;

const referencedSkeletons = [
  "buildAphroditeStarsInvoiceDraftSkeleton",
  "validateAphroditePreCheckoutSkeleton",
  "inspectAphroditeSuccessfulPaymentSkeleton",
] as const;

const steps: AphroditePaymentLedgerMockStep[] = [
  {
    id: "product-catalog-lookup",
    label: "1. product catalog lookup",
    status: "mock-only",
    description: "Локально проверяется, что productId должен прийти из каталога.",
    blocksNow: ["изменение product payment state", "активная платёжная CTA"],
  },
  {
    id: "invoice-draft-skeleton",
    label: "2. invoice draft skeleton",
    status: "mock-only",
    description: "Связка с будущим buildAphroditeStarsInvoiceDraftSkeleton только как reference.",
    blocksNow: ["sendInvoice", "createInvoiceLink", "Telegram Stars invoice"],
  },
  {
    id: "pre-checkout-skeleton",
    label: "3. pre-checkout skeleton",
    status: "mock-only",
    description: "Связка с будущим validateAphroditePreCheckoutSkeleton только как reference.",
    blocksNow: ["answerPreCheckoutQuery", "pre_checkout_query handler", "payment continuation"],
  },
  {
    id: "successful-payment-skeleton",
    label: "4. successful_payment skeleton",
    status: "mock-only",
    description: "Связка с будущим inspectAphroditeSuccessfulPaymentSkeleton только как reference.",
    blocksNow: ["active successful_payment handler", "verified payment"],
  },
  {
    id: "mock-ledger-preview",
    label: "5. mock ledger preview",
    status: "mock-only",
    description: "Показывает будущую ledger shape без сохранения и без verification.",
    blocksNow: ["payment ledger write", "database write", "ledger persistence"],
  },
  {
    id: "no-entitlement",
    label: "6. no entitlement",
    status: "blocked",
    description: "Entitlement не создаётся, потому что нет verified ledger и DB write.",
    blocksNow: ["entitlement creation", "access grant"],
  },
  {
    id: "no-vip-unlock",
    label: "7. no VIP unlock",
    status: "blocked",
    description: "VIP остаётся закрытым до server-side entitlement check.",
    blocksNow: ["VIP unlock", "client-side unlock"],
  },
  {
    id: "free-preview-fallback",
    label: "8. fallback remains free preview",
    status: "mock-only",
    description: "Пользовательский безопасный fallback остаётся /miniapp/love-reading-preview.",
    blocksNow: ["paid-only route", "access bypass"],
  },
];

export function simulateAphroditePaymentLedgerMockIntegration(
  input: AphroditePaymentLedgerMockInput,
): AphroditePaymentLedgerMockResult {
  const mockFlowId = `mock-ledger:${input.productId}:${input.telegramUserId ?? "mock-user"}:${input.mockPaymentChargeId ?? "no-charge"}`;

  return {
    productId: input.productId,
    mockFlowId,
    fallbackRoute: "/miniapp/love-reading-preview",
    referencedSkeletons: referencedSkeletons.slice(),
    previewSteps: getAphroditePaymentLedgerMockIntegrationSteps(),
    mockOnly: true,
    writesToDatabaseNow: false,
    persistsLedgerNow: false,
    verifiedPaymentNow: false,
    createsEntitlementNow: false,
    unlocksVipNow: false,
    grantsAccessNow: false,
  };
}

export function getAphroditePaymentLedgerMockIntegrationSteps(): AphroditePaymentLedgerMockStep[] {
  return steps.map((step) => ({
    ...step,
    blocksNow: step.blocksNow.slice(),
  }));
}

export function getAphroditePaymentLedgerMockIntegrationBoundaries(): AphroditePaymentLedgerMockBoundary[] {
  return [
    {
      id: "no-real-payment",
      visibleLabel: "Нет реальной оплаты",
      allowedNow: ["локальный mock flow"],
      blockedUntil: ["owner approval", "production payment gate"],
    },
    {
      id: "no-ledger-persistence",
      visibleLabel: "Mock ledger ничего не сохраняет",
      allowedNow: ["preview ledger shape"],
      blockedUntil: ["DB review", "fresh backup", "verified ledger package"],
    },
    {
      id: "no-payment-verification",
      visibleLabel: "Нет verified payment",
      allowedNow: ["показать readiness chain"],
      blockedUntil: ["live successful_payment handler", "idempotency storage"],
    },
    {
      id: "no-entitlement-creation",
      visibleLabel: "Нет entitlement creation",
      allowedNow: ["показать dependency от verified ledger"],
      blockedUntil: ["entitlement creation package", "server-side entitlement check"],
    },
    {
      id: "no-vip-unlock",
      visibleLabel: "Нет реальной VIP-разблокировки",
      allowedNow: ["оставить fallback preview"],
      blockedUntil: ["server-side entitlement check", "security QA PASS"],
    },
    {
      id: "no-telegram-api",
      visibleLabel: "Нет вызова Telegram API",
      allowedNow: ["локальная mock-интеграция"],
      blockedUntil: ["Telegram API review"],
    },
  ];
}

export function getAphroditePaymentLedgerMockIntegrationNextSteps(): AphroditePaymentLedgerMockNextStep[] {
  return [
    {
      package: "Package 174",
      title: "Entitlement Creation Mock",
      purpose: "Смоделировать будущий entitlement grant как local preview без создания доступа, DB write или VIP unlock.",
      blockedUntil: [
        "Package 173 committed",
        "persistsLedgerNow остаётся false",
        "verifiedPaymentNow остаётся false",
        "grantsAccessNow остаётся false",
      ],
    },
  ];
}
