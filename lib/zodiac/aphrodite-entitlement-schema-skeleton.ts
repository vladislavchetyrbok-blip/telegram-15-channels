/**
 * Aphrodite entitlement schema skeleton (Package 165).
 *
 * TypeScript-only validation skeleton. This file validates future shapes only:
 * it does not create entitlement, write to a database, grant access, call
 * Telegram API, implement payments, or connect to production gates.
 */

export type AphroditeEntitlementSchemaStatus =
  | "active"
  | "expired"
  | "revoked"
  | "refunded"
  | "pending-owner-review"
  | "invalid";

export type AphroditeEntitlementSchemaRecord = {
  id: string;
  userId?: string;
  telegramUserId?: string;
  productId: string;
  sourcePaymentLedgerId: string;
  status: AphroditeEntitlementSchemaStatus;
  startsAt: string;
  expiresAt?: string;
  revokedAt?: string;
  createdAt: string;
  updatedAt: string;
  auditReason: string;
};

export type AphroditeEntitlementSchemaValidationResult = {
  validShape: boolean;
  grantsAccessNow: false;
  visibleMessage: string;
  missingFields: string[];
  blockedReasons: string[];
};

export type AphroditeEntitlementSchemaBoundary = {
  area: string;
  visibleLabel: string;
  dataBoundary: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeEntitlementSchemaNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_ENTITLEMENT_SCHEMA_SKELETON_CLASSIFICATION =
  "Только TypeScript skeleton / Доступ не выдаётся / Нет записи в базу данных";

export const APHRODITE_ENTITLEMENT_SCHEMA_SKELETON_RULE =
  "Schema skeleton проверяет только будущие формы. Он не создаёт entitlement и не выдаёт доступ.";

export const APHRODITE_ENTITLEMENT_SCHEMA_STORAGE_REFERENCE = "lib/zodiac/aphrodite-entitlement-storage-design.ts";

export const APHRODITE_ENTITLEMENT_SCHEMA_SAFETY_LABELS = [
  "Нет реальной VIP-разблокировки",
  "Нет оплаты",
  "Нет Telegram Stars invoice",
  "Нет successful_payment handler",
  "Нет entitlement creation",
  "Нет записи в базу данных",
  "Нет миграции схемы базы данных",
  "Нет вызова Telegram API",
  "Нет production-запуска",
  "Schema skeleton не выдаёт доступ",
] as const;

const REQUIRED_FIELDS = [
  "id",
  "productId",
  "sourcePaymentLedgerId",
  "status",
  "startsAt",
  "createdAt",
  "updatedAt",
  "auditReason",
  "userId or telegramUserId",
] as const;

const terminalDenyStatuses = new Set<AphroditeEntitlementSchemaStatus>(["expired", "revoked", "refunded", "invalid"]);

export function validateAphroditeEntitlementSchemaSkeleton(
  record: Partial<AphroditeEntitlementSchemaRecord>,
): AphroditeEntitlementSchemaValidationResult {
  const missingFields = getMissingRequiredFields(record);
  const blockedReasons = getBlockedReasons(record, missingFields);

  return {
    validShape: missingFields.length === 0,
    grantsAccessNow: false,
    visibleMessage:
      missingFields.length === 0
        ? "Форма будущего entitlement выглядит полной, но Package 165 не выдаёт доступ."
        : "Форма будущего entitlement неполная и не может использоваться для доступа.",
    missingFields,
    blockedReasons,
  };
}

export function getAphroditeEntitlementSchemaRequiredFields(): string[] {
  return REQUIRED_FIELDS.slice();
}

export function getAphroditeEntitlementSchemaBoundaries(): AphroditeEntitlementSchemaBoundary[] {
  return [
    {
      area: "VIP unlock",
      visibleLabel: "Нет реальной VIP-разблокировки",
      dataBoundary: "no-real-vip-unlock",
      allowedNow: ["проверить форму записи", "вернуть grantsAccessNow=false"],
      blockedUntil: ["server-side checker", "owner review"],
      riskLevel: "critical",
    },
    {
      area: "Payment",
      visibleLabel: "Нет оплаты",
      dataBoundary: "no-payment",
      allowedNow: ["проверить sourcePaymentLedgerId как строку"],
      blockedUntil: ["отдельный payment package"],
      riskLevel: "critical",
    },
    {
      area: "Telegram Stars",
      visibleLabel: "Нет Telegram Stars invoice",
      dataBoundary: "no-stars-invoice",
      allowedNow: ["не создавать invoice", "не вызывать payment provider"],
      blockedUntil: ["отдельный invoice package"],
      riskLevel: "critical",
    },
    {
      area: "Payment update",
      visibleLabel: "Нет successful_payment handler",
      dataBoundary: "no-successful-payment-handler",
      allowedNow: ["проверять только mock shape"],
      blockedUntil: ["отдельная обработка payment event"],
      riskLevel: "critical",
    },
    {
      area: "Entitlement creation",
      visibleLabel: "Нет entitlement creation",
      dataBoundary: "no-entitlement-creation",
      allowedNow: ["валидировать Partial record", "вернуть missingFields"],
      blockedUntil: ["future persistence package", "owner review"],
      riskLevel: "critical",
    },
    {
      area: "Database write",
      visibleLabel: "Нет записи в базу данных",
      dataBoundary: "no-database-write",
      allowedNow: ["локальная функция validation"],
      blockedUntil: ["отдельный DB package"],
      riskLevel: "critical",
    },
    {
      area: "Database schema",
      visibleLabel: "Нет миграции схемы базы данных",
      dataBoundary: "no-database-schema-migration",
      allowedNow: ["TypeScript-only skeleton"],
      blockedUntil: ["schema review", "migration review"],
      riskLevel: "critical",
    },
    {
      area: "Telegram API",
      visibleLabel: "Нет вызова Telegram API",
      dataBoundary: "no-telegram-api-call",
      allowedNow: ["никаких внешних API"],
      blockedUntil: ["отдельная Telegram integration"],
      riskLevel: "critical",
    },
    {
      area: "Production launch",
      visibleLabel: "Нет production-запуска",
      dataBoundary: "no-production-launch",
      allowedNow: ["локальная QA-проверка"],
      blockedUntil: ["owner launch checklist", "production safety PASS"],
      riskLevel: "high",
    },
    {
      area: "Access result",
      visibleLabel: "Schema skeleton не выдаёт доступ",
      dataBoundary: "schema-skeleton-grants-no-access",
      allowedNow: ["grantsAccessNow=false для любого record"],
      blockedUntil: ["Package 166 server-side skeleton", "future verified entitlement"],
      riskLevel: "critical",
    },
  ];
}

export function getAphroditeEntitlementSchemaNextSteps(): AphroditeEntitlementSchemaNextStep[] {
  return [
    {
      package: "Package 166",
      title: "Server-side Entitlement Check Skeleton",
      purpose: "Подготовить fail-closed server-side check skeleton, который всегда возвращает deny и fallback без DB/API/payment.",
      blockedUntil: [
        "Package 165 принят владельцем",
        "grantsAccessNow=false подтверждён QA",
        "expired/revoked/refunded deny подтверждены QA",
      ],
    },
  ];
}

function getMissingRequiredFields(record: Partial<AphroditeEntitlementSchemaRecord>): string[] {
  const missingFields = REQUIRED_FIELDS.filter((field) => {
    if (field === "userId or telegramUserId") {
      return isBlank(record.userId) && isBlank(record.telegramUserId);
    }

    const value = record[field as keyof AphroditeEntitlementSchemaRecord];
    return typeof value !== "string" || value.trim().length === 0;
  });

  return missingFields.slice();
}

function getBlockedReasons(record: Partial<AphroditeEntitlementSchemaRecord>, missingFields: string[]): string[] {
  const reasons = [
    "Package 165 является TypeScript-only skeleton и не выдаёт доступ.",
    "Нужна будущая server-side проверка entitlement.",
    "Нужен owner review перед реальным запуском.",
  ];

  if (missingFields.length > 0) {
    reasons.push(`Отсутствуют обязательные поля: ${missingFields.join(", ")}.`);
  }

  if (record.status === "pending-owner-review") {
    reasons.push("Статус pending-owner-review требует ручного подтверждения владельца.");
  }

  if (record.status && terminalDenyStatuses.has(record.status)) {
    reasons.push(`Статус ${record.status} не может открывать доступ.`);
  }

  if (record.expiresAt && Date.parse(record.expiresAt) <= Date.now()) {
    reasons.push("expiresAt уже в прошлом или сейчас.");
  }

  if (record.revokedAt) {
    reasons.push("revokedAt заполнен, будущая запись должна закрывать доступ.");
  }

  return reasons;
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}
