/**
 * Aphrodite entitlement storage design (Package 164).
 *
 * Design/readiness only. This file deliberately does not create entitlement
 * records, write to a database, modify schema, unlock VIP, call Telegram API,
 * or implement payments.
 */

export type AphroditeEntitlementStorageStatus =
  | "design-only"
  | "active-future"
  | "expired-future"
  | "revoked-future"
  | "refunded-future"
  | "owner-review-required"
  | "blocked-until-payment-ledger";

export type AphroditeEntitlementStorageRiskLevel = "low" | "medium" | "high" | "critical";

export type AphroditeEntitlementStorageField = {
  fieldName: string;
  requiredForFutureRecord: boolean;
  source: "future-user-identity" | "future-payment-ledger" | "future-product-catalog" | "future-server-check" | "owner-review";
  visiblePurpose: string;
  designOnly: true;
  writesToDatabaseNow: false;
};

export type AphroditeEntitlementStorageRule = {
  id: string;
  label: string;
  visibleRule: string;
  blocksAccessNow: true;
  blockedUntil: string[];
};

export type AphroditeEntitlementStorageBoundary = {
  area: string;
  visibleLabel: string;
  dataBoundary: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: AphroditeEntitlementStorageRiskLevel;
};

export type AphroditeEntitlementStorageNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export type AphroditeEntitlementStorageDependency = {
  source: string;
  required: true;
  visibleReason: string;
};

export const APHRODITE_ENTITLEMENT_STORAGE_DESIGN_CLASSIFICATION =
  "Только дизайн хранения / Entitlement не создаётся / Нет записи в базу данных";

export const APHRODITE_ENTITLEMENT_STORAGE_DESIGN_RULE =
  "Entitlement storage design описывает только будущие записи. Entitlement не создаётся в этом пакете.";

export const APHRODITE_ENTITLEMENT_STORAGE_LEDGER_REFERENCE = "lib/zodiac/aphrodite-payment-ledger-design.ts";
export const APHRODITE_ENTITLEMENT_STORAGE_CATALOG_REFERENCE = "lib/zodiac/aphrodite-product-catalog.ts";

export const APHRODITE_ENTITLEMENT_STORAGE_SAFETY_LABELS = [
  "Нет реальной VIP-разблокировки",
  "Нет оплаты",
  "Нет Telegram Stars invoice",
  "Нет successful_payment handler",
  "Нет entitlement creation",
  "Нет записи в базу данных",
  "Нет миграции схемы базы данных",
  "Нет вызова Telegram API",
  "Нет production-запуска",
  "Entitlement не создаётся",
] as const;

const storageFields: AphroditeEntitlementStorageField[] = [
  {
    fieldName: "userId",
    requiredForFutureRecord: true,
    source: "future-user-identity",
    visiblePurpose: "Связать будущий доступ с внутренним пользователем.",
    designOnly: true,
    writesToDatabaseNow: false,
  },
  {
    fieldName: "telegramUserId",
    requiredForFutureRecord: true,
    source: "future-user-identity",
    visiblePurpose: "Связать доступ с Telegram identity после server-side проверки initData.",
    designOnly: true,
    writesToDatabaseNow: false,
  },
  {
    fieldName: "productId",
    requiredForFutureRecord: true,
    source: "future-product-catalog",
    visiblePurpose: "Ограничить entitlement продуктом из финального каталога Aphrodite.",
    designOnly: true,
    writesToDatabaseNow: false,
  },
  {
    fieldName: "sourcePaymentLedgerId",
    requiredForFutureRecord: true,
    source: "future-payment-ledger",
    visiblePurpose: "Связать доступ с verified payment ledger перед любым будущим unlock.",
    designOnly: true,
    writesToDatabaseNow: false,
  },
  {
    fieldName: "sourcePaymentProvider",
    requiredForFutureRecord: true,
    source: "future-payment-ledger",
    visiblePurpose: "Зафиксировать будущий provider: Telegram Stars, manual review или test-mode.",
    designOnly: true,
    writesToDatabaseNow: false,
  },
  {
    fieldName: "status",
    requiredForFutureRecord: true,
    source: "future-server-check",
    visiblePurpose: "Хранить будущий статус: active, expired, revoked, refunded или owner-review-required.",
    designOnly: true,
    writesToDatabaseNow: false,
  },
  {
    fieldName: "startsAt",
    requiredForFutureRecord: true,
    source: "future-server-check",
    visiblePurpose: "Будущая дата начала доступа, не используемая сейчас для открытия VIP.",
    designOnly: true,
    writesToDatabaseNow: false,
  },
  {
    fieldName: "expiresAt",
    requiredForFutureRecord: false,
    source: "future-server-check",
    visiblePurpose: "Будущая дата окончания доступа; expired должен закрывать доступ.",
    designOnly: true,
    writesToDatabaseNow: false,
  },
  {
    fieldName: "revokedAt",
    requiredForFutureRecord: false,
    source: "future-server-check",
    visiblePurpose: "Будущая дата отзыва; revoked должен закрывать доступ.",
    designOnly: true,
    writesToDatabaseNow: false,
  },
  {
    fieldName: "createdAt",
    requiredForFutureRecord: true,
    source: "future-server-check",
    visiblePurpose: "Будущий audit timestamp создания записи.",
    designOnly: true,
    writesToDatabaseNow: false,
  },
  {
    fieldName: "updatedAt",
    requiredForFutureRecord: true,
    source: "future-server-check",
    visiblePurpose: "Будущий audit timestamp обновления записи.",
    designOnly: true,
    writesToDatabaseNow: false,
  },
  {
    fieldName: "auditReason",
    requiredForFutureRecord: true,
    source: "owner-review",
    visiblePurpose: "Причина создания, изменения, отзыва или ручной проверки доступа.",
    designOnly: true,
    writesToDatabaseNow: false,
  },
  {
    fieldName: "ownerReviewStatus",
    requiredForFutureRecord: true,
    source: "owner-review",
    visiblePurpose: "Подтверждение, что реальный запуск был разрешён владельцем.",
    designOnly: true,
    writesToDatabaseNow: false,
  },
];

export function getAphroditeEntitlementStorageFields(): AphroditeEntitlementStorageField[] {
  return storageFields.map((field) => ({ ...field }));
}

export function getAphroditeEntitlementStorageRules(): AphroditeEntitlementStorageRule[] {
  return [
    {
      id: "no-entitlement-without-verified-ledger",
      label: "No entitlement without verified payment ledger",
      visibleRule: "Entitlement нельзя создавать без verified payment ledger, связанного с userId, telegramUserId и productId.",
      blocksAccessNow: true,
      blockedUntil: ["Package 163 принят", "future ledger persistence", "owner review"],
    },
    {
      id: "product-id-from-catalog",
      label: "No entitlement without catalog productId",
      visibleRule: "productId будущего entitlement должен существовать в финальном каталоге продуктов Aphrodite.",
      blocksAccessNow: true,
      blockedUntil: ["каталог продуктов подтверждён", "server-side product lookup"],
    },
    {
      id: "expired-denies-access",
      label: "No access if expired",
      visibleRule: "Expired entitlement должен закрывать доступ и возвращать пользователя в free preview.",
      blocksAccessNow: true,
      blockedUntil: ["future server-side expiration check"],
    },
    {
      id: "revoked-denies-access",
      label: "No access if revoked",
      visibleRule: "Revoked entitlement должен закрывать доступ независимо от client flags.",
      blocksAccessNow: true,
      blockedUntil: ["future server-side revocation check"],
    },
    {
      id: "refunded-denies-access",
      label: "No access if refunded",
      visibleRule: "Refunded entitlement должен закрывать доступ и сохранять auditReason.",
      blocksAccessNow: true,
      blockedUntil: ["future payment refund reconciliation"],
    },
    {
      id: "owner-review-before-launch",
      label: "Owner review required before real launch",
      visibleRule: "Реальный VIP-доступ нельзя запускать без owner review, даже если будущая запись выглядит активной.",
      blocksAccessNow: true,
      blockedUntil: ["owner launch checklist", "production safety PASS"],
    },
    {
      id: "server-side-check-required",
      label: "Server-side check required",
      visibleRule: "Доступ должен решаться server-side, не через localStorage, query param или клиентский state.",
      blocksAccessNow: true,
      blockedUntil: ["future server-side checker", "negative bypass QA"],
    },
    {
      id: "client-flags-ignored",
      label: "Client-side flags ignored",
      visibleRule: "Клиентские VIP-флаги не являются доказательством доступа и должны игнорироваться.",
      blocksAccessNow: true,
      blockedUntil: ["server-side entitlement checker"],
    },
  ];
}

export function getAphroditeEntitlementStorageBoundaries(): AphroditeEntitlementStorageBoundary[] {
  return [
    {
      area: "VIP unlock",
      visibleLabel: "Нет реальной VIP-разблокировки",
      dataBoundary: "no-real-vip-unlock",
      allowedNow: ["описать будущие поля", "показать blocked status"],
      blockedUntil: ["server-side checker", "owner review"],
      riskLevel: "critical",
    },
    {
      area: "Payment",
      visibleLabel: "Нет оплаты",
      dataBoundary: "no-payment",
      allowedNow: ["ссылаться на будущий payment ledger"],
      blockedUntil: ["отдельный payment package"],
      riskLevel: "critical",
    },
    {
      area: "Telegram Stars",
      visibleLabel: "Нет Telegram Stars invoice",
      dataBoundary: "no-stars-invoice",
      allowedNow: ["хранить только название будущего provider field"],
      blockedUntil: ["отдельный invoice package"],
      riskLevel: "critical",
    },
    {
      area: "Payment update",
      visibleLabel: "Нет successful_payment handler",
      dataBoundary: "no-successful-payment-handler",
      allowedNow: ["описать зависимость от verified ledger"],
      blockedUntil: ["отдельная обработка payment event"],
      riskLevel: "critical",
    },
    {
      area: "Entitlement creation",
      visibleLabel: "Нет entitlement creation",
      dataBoundary: "no-entitlement-creation",
      allowedNow: ["описать storage shape", "показать правила deny"],
      blockedUntil: ["future schema", "future persistence", "owner review"],
      riskLevel: "critical",
    },
    {
      area: "Database write",
      visibleLabel: "Нет записи в базу данных",
      dataBoundary: "no-database-write",
      allowedNow: ["статический список полей", "read-only dashboard"],
      blockedUntil: ["отдельная DB schema review"],
      riskLevel: "critical",
    },
    {
      area: "Database schema",
      visibleLabel: "Нет миграции схемы базы данных",
      dataBoundary: "no-database-schema-migration",
      allowedNow: ["не менять schema", "не добавлять migration"],
      blockedUntil: ["отдельный DB package"],
      riskLevel: "critical",
    },
    {
      area: "Telegram API",
      visibleLabel: "Нет вызова Telegram API",
      dataBoundary: "no-telegram-api-call",
      allowedNow: ["локальный дизайн", "dashboard-отображение"],
      blockedUntil: ["отдельная Telegram integration"],
      riskLevel: "critical",
    },
    {
      area: "Production launch",
      visibleLabel: "Нет production-запуска",
      dataBoundary: "no-production-launch",
      allowedNow: ["readiness-дизайн", "ручная проверка"],
      blockedUntil: ["owner launch checklist", "production safety PASS"],
      riskLevel: "high",
    },
    {
      area: "Storage action",
      visibleLabel: "Entitlement не создаётся",
      dataBoundary: "entitlement-not-created",
      allowedNow: ["вернуть статическую форму будущей записи"],
      blockedUntil: ["future persistence package", "server-side checker"],
      riskLevel: "critical",
    },
  ];
}

export function getAphroditeEntitlementStorageNextSteps(): AphroditeEntitlementStorageNextStep[] {
  return [
    {
      package: "Package 165",
      title: "Entitlement Schema Skeleton",
      purpose: "Создать TypeScript-only validation skeleton для будущих entitlement records без выдачи доступа и без DB.",
      blockedUntil: [
        "Package 164 принят владельцем",
        "ledger dependency подтверждена",
        "storage fields подтверждены QA",
      ],
    },
  ];
}

export function getAphroditeEntitlementStorageDependencies(): AphroditeEntitlementStorageDependency[] {
  return [
    {
      source: APHRODITE_ENTITLEMENT_STORAGE_LEDGER_REFERENCE,
      required: true,
      visibleReason: "Verified payment ledger должен существовать раньше будущего entitlement.",
    },
    {
      source: APHRODITE_ENTITLEMENT_STORAGE_CATALOG_REFERENCE,
      required: true,
      visibleReason: "productId будущего entitlement должен быть из каталога продуктов Aphrodite.",
    },
  ];
}
