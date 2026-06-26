/**
 * Package 170: Telegram Stars invoice builder skeleton.
 *
 * TypeScript-only draft builder. It prepares local future invoice shapes and
 * never sends invoices, calls Telegram API, writes ledgers, creates access, or
 * unlocks VIP.
 */

export type AphroditeStarsInvoiceProductId =
  | "full_love_report"
  | "vip_love_access"
  | "ai_future_timeline_vip"
  | "soulmate_scanner_vip"
  | "red_flags_scanner_vip"
  | "birth_matrix_vip"
  | "natal_chart_vip"
  | "vip_couple_calendar"
  | "vip_numerology";

export type AphroditeStarsInvoiceProduct = {
  id: AphroditeStarsInvoiceProductId;
  title: string;
  futureStarsAmount: number;
  description: string;
  dependencies: string[];
};

export type AphroditeStarsInvoiceBuilderInput = {
  productId: string;
  telegramUserId?: string;
  ownerApproved?: boolean;
  paymentsEnabled?: boolean;
  starsLiveEnabled?: boolean;
};

export type AphroditeStarsInvoiceDraft = {
  productId: string;
  productTitle: string;
  amount: number;
  currency: "XTR";
  payloadPreview: string;
  validationState: "draft-only" | "unknown-product";
  dependencies: string[];
  blockedReasons: string[];
  sendAllowedNow: false;
  canCallTelegramApiNow: false;
  createsPaymentLedgerNow: false;
  createsEntitlementNow: false;
  unlocksVipNow: false;
};

export type AphroditeStarsInvoiceBuilderBoundary = {
  id: string;
  visibleLabel: string;
  allowedNow: string[];
  blockedUntil: string[];
};

export type AphroditeStarsInvoiceBuilderNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_STARS_INVOICE_BUILDER_TITLE = "Skeleton invoice builder Telegram Stars";

export const APHRODITE_STARS_INVOICE_BUILDER_CLASSIFICATION =
  "Только invoice draft / Ничего не отправляется / Нет оплаты";

export const APHRODITE_STARS_INVOICE_BUILDER_RULE =
  "Invoice builder skeleton prepares future invoice drafts only. Он всегда возвращает sendAllowedNow: false и не вызывает Telegram API.";

export const APHRODITE_STARS_INVOICE_BUILDER_SAFETY_LABELS = [
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
  "Invoice builder ничего не отправляет",
] as const;

const products: AphroditeStarsInvoiceProduct[] = [
  {
    id: "full_love_report",
    title: "Full Love Report",
    futureStarsAmount: 299,
    description: "Будущий полный любовный отчёт, пока только invoice draft.",
    dependencies: ["product catalog", "owner review gate", "payment ledger", "entitlement storage", "security QA"],
  },
  {
    id: "vip_love_access",
    title: "VIP Love Access",
    futureStarsAmount: 499,
    description: "Будущий VIP-доступ к love-разделам, без разблокировки сейчас.",
    dependencies: ["owner review gate", "entitlement storage", "server-side entitlement check"],
  },
  {
    id: "ai_future_timeline_vip",
    title: "AI Future Timeline VIP",
    futureStarsAmount: 249,
    description: "Будущий VIP-таймлайн, без внешних AI API и без оплаты сейчас.",
    dependencies: ["product catalog", "security QA", "future env flags"],
  },
  {
    id: "soulmate_scanner_vip",
    title: "Soulmate Scanner VIP",
    futureStarsAmount: 199,
    description: "Будущий VIP-сканер soulmate, пока только локальный draft.",
    dependencies: ["product catalog", "payment ledger", "entitlement storage"],
  },
  {
    id: "red_flags_scanner_vip",
    title: "Red Flags Scanner VIP",
    futureStarsAmount: 199,
    description: "Будущий VIP-сканер red flags, без Telegram invoice сейчас.",
    dependencies: ["product catalog", "owner review gate", "security QA"],
  },
  {
    id: "birth_matrix_vip",
    title: "Birth Matrix VIP",
    futureStarsAmount: 199,
    description: "Будущий VIP-доступ к матрице судьбы, без выдачи доступа сейчас.",
    dependencies: ["product catalog", "entitlement storage", "security QA"],
  },
  {
    id: "natal_chart_vip",
    title: "Natal Chart VIP",
    futureStarsAmount: 299,
    description: "Будущая натальная карта VIP, только draft структуры.",
    dependencies: ["product catalog", "payment ledger", "entitlement storage"],
  },
  {
    id: "vip_couple_calendar",
    title: "VIP Couple Calendar",
    futureStarsAmount: 249,
    description: "Будущий календарь пары, без ledger write и без VIP unlock.",
    dependencies: ["product catalog", "payment ledger", "support/refund policy"],
  },
  {
    id: "vip_numerology",
    title: "VIP Numerology",
    futureStarsAmount: 199,
    description: "Будущая VIP-нумерология, пока только безопасный draft.",
    dependencies: ["product catalog", "owner review gate", "future env flags"],
  },
];

export function getAphroditeStarsInvoiceProducts(): AphroditeStarsInvoiceProductId[] {
  return products.map((product) => product.id);
}

export function getAphroditeStarsInvoiceProductCatalog(): AphroditeStarsInvoiceProduct[] {
  return products.map((product) => ({
    ...product,
    dependencies: product.dependencies.slice(),
  }));
}

export function buildAphroditeStarsInvoiceDraftSkeleton(input: AphroditeStarsInvoiceBuilderInput): AphroditeStarsInvoiceDraft {
  const product = products.find((item) => item.id === input.productId);
  const productTitle = product?.title ?? "Неизвестный продукт";
  const amount = product?.futureStarsAmount ?? 0;
  const validationState = product ? "draft-only" : "unknown-product";
  const dependencies = product?.dependencies ?? ["product catalog", "owner review gate", "security QA"];
  const blockedReasons = [
    "Package 170 является skeleton: invoice не отправляется",
    "owner review gate не является runtime-разрешением",
    "Telegram API запрещён в этом пакете",
    "payment ledger и entitlement storage только задокументированы",
    "production env flags не читаются и не применяются",
  ];

  return {
    productId: input.productId,
    productTitle,
    amount,
    currency: "XTR",
    payloadPreview: `aphrodite:${input.productId}:telegram-user:${input.telegramUserId ?? "mock-user"}:draft-only`,
    validationState,
    dependencies: dependencies.slice(),
    blockedReasons,
    sendAllowedNow: false,
    canCallTelegramApiNow: false,
    createsPaymentLedgerNow: false,
    createsEntitlementNow: false,
    unlocksVipNow: false,
  };
}

export function getAphroditeStarsInvoiceBuilderBoundaries(): AphroditeStarsInvoiceBuilderBoundary[] {
  return [
    {
      id: "no-real-payment",
      visibleLabel: "Нет реальной оплаты",
      allowedNow: ["собрать локальный invoice draft", "проверить product catalog"],
      blockedUntil: ["owner review", "production safety", "отдельный live-payment пакет"],
    },
    {
      id: "no-stars-invoice",
      visibleLabel: "Нет Telegram Stars invoice",
      allowedNow: ["показать будущую форму данных"],
      blockedUntil: ["Telegram API review", "owner approval"],
    },
    {
      id: "no-send-invoice",
      visibleLabel: "Нет sendInvoice",
      allowedNow: ["держать sendAllowedNow: false"],
      blockedUntil: ["Package 175 или позже", "ручное подтверждение владельца"],
    },
    {
      id: "no-create-invoice-link",
      visibleLabel: "Нет createInvoiceLink",
      allowedNow: ["документировать payload preview"],
      blockedUntil: ["отдельный invoice implementation review"],
    },
    {
      id: "no-ledger-access",
      visibleLabel: "Нет payment ledger write",
      allowedNow: ["сослаться на payment ledger design"],
      blockedUntil: ["verified ledger storage", "fresh backup"],
    },
    {
      id: "no-entitlement-access",
      visibleLabel: "Нет entitlement creation",
      allowedNow: ["сослаться на entitlement storage"],
      blockedUntil: ["server-side entitlement package", "security QA PASS"],
    },
    {
      id: "no-telegram-api",
      visibleLabel: "Нет вызова Telegram API",
      allowedNow: ["локальная TypeScript-валидация"],
      blockedUntil: ["owner review", "Telegram API safety package"],
    },
  ];
}

export function getAphroditeStarsInvoiceBuilderNextSteps(): AphroditeStarsInvoiceBuilderNextStep[] {
  return [
    {
      package: "Package 171",
      title: "Telegram Stars PreCheckout Handler Skeleton",
      purpose: "Смоделировать будущую pre-checkout validation без активного handler и без ответа в Telegram.",
      blockedUntil: [
        "Package 170 committed",
        "sendAllowedNow остаётся false",
        "canCallTelegramApiNow остаётся false",
      ],
    },
  ];
}
