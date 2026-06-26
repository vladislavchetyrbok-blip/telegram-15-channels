/**
 * Aphrodite owner review gate (Package 168).
 *
 * Safety/readiness model only. This file does not enable payments, Telegram
 * Stars invoices, successful_payment handling, entitlement creation, VIP
 * unlocks, database writes, schema changes, Telegram API calls, production
 * launch switches, or active Telegram CTA changes.
 */

export type AphroditeOwnerReviewGateArea =
  | "payments"
  | "telegram-stars"
  | "successful-payment-handler"
  | "entitlement-creation"
  | "vip-unlock"
  | "database-write"
  | "production-launch"
  | "telegram-api"
  | "support-refund-policy"
  | "analytics-readiness";

export type AphroditeOwnerReviewGateStatus =
  | "blocked-by-default"
  | "requires-owner-review"
  | "requires-env-confirmation"
  | "requires-security-qa"
  | "requires-support-readiness"
  | "requires-production-backup"
  | "not-approved";

export type AphroditeOwnerReviewGateInput = {
  ownerApproved?: boolean;
  paymentsApproved?: boolean;
  starsApproved?: boolean;
  entitlementsApproved?: boolean;
  databaseApproved?: boolean;
  supportApproved?: boolean;
  securityQaApproved?: boolean;
  backupFresh?: boolean;
};

export type AphroditeOwnerReviewGateResult = {
  approvedForLaunch: false;
  paymentsCanBeEnabledNow: false;
  vipCanBeEnabledNow: false;
  entitlementCreationCanBeEnabledNow: false;
  telegramStarsCanBeEnabledNow: false;
  productionLaunchCanBeEnabledNow: false;
  visibleMessage: string;
  blockedReasons: string[];
  requiredOwnerChecks: string[];
  requiredFutureEnvFlags: string[];
  safetyBoundary: string[];
};

export type AphroditeOwnerReviewChecklistItem = {
  id: string;
  area: AphroditeOwnerReviewGateArea;
  label: string;
  requiredBeforeLaunch: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeOwnerReviewBoundary = {
  area: string;
  visibleLabel: string;
  dataBoundary: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeOwnerReviewNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_OWNER_REVIEW_GATE_TITLE = "Owner Review Gate для VIP-запуска";

export const APHRODITE_OWNER_REVIEW_GATE_CLASSIFICATION =
  "Только safety gate / Запуск не разрешён / Нет оплаты";

export const APHRODITE_OWNER_REVIEW_GATE_RULE =
  "Без owner review нельзя включать оплату, VIP, entitlement creation, live Telegram Stars или production launch.";

export const APHRODITE_OWNER_REVIEW_REQUIRED_FUTURE_ENV_FLAGS = [
  "APHRODITE_OWNER_APPROVED",
  "APHRODITE_PAYMENTS_ENABLED",
  "APHRODITE_STARS_LIVE_ENABLED",
  "APHRODITE_ENTITLEMENTS_ENABLED",
  "APHRODITE_PRODUCTION_LAUNCH_APPROVED",
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
] as const;

export const APHRODITE_OWNER_REVIEW_SAFETY_LABELS = [
  "Нет реальной оплаты",
  "Нет реальной VIP-разблокировки",
  "Нет Telegram Stars invoice",
  "Нет successful_payment handler",
  "Нет entitlement creation",
  "Нет записи в базу данных",
  "Нет миграции схемы базы данных",
  "Нет вызова Telegram API",
  "Нет production-запуска",
  "Owner review не включает оплату",
] as const;

const requiredOwnerChecks = [
  "Владелец вручную подтверждает, что готов начинать отдельный launch package.",
  "Платёжный провайдер и Telegram Stars проверены только в design/review режиме.",
  "Security QA Package 167 остаётся PASS перед любым следующим шагом.",
  "Support/refund policy описана до включения оплаты.",
  "Свежий production backup подтверждён перед любыми production write.",
  "Будущие env flags перечислены, но не читаются этим пакетом.",
];

const blockedReasons = [
  "Owner approval не является runtime-переключателем в Package 168.",
  "Реальная оплата не реализована и не может быть включена этим пакетом.",
  "VIP unlock остаётся deny-by-default до отдельного подтверждённого пакета.",
  "Entitlement creation и DB write остаются заблокированы.",
  "Telegram Stars invoice и successful_payment handler не подключены.",
  "Production launch требует отдельного owner review и production safety PASS.",
];

export function evaluateAphroditeOwnerReviewGate(
  input: AphroditeOwnerReviewGateInput = {},
): AphroditeOwnerReviewGateResult {
  void input;

  return {
    approvedForLaunch: false,
    paymentsCanBeEnabledNow: false,
    vipCanBeEnabledNow: false,
    entitlementCreationCanBeEnabledNow: false,
    telegramStarsCanBeEnabledNow: false,
    productionLaunchCanBeEnabledNow: false,
    visibleMessage:
      "Owner Review Gate зафиксирован как ручной стоппер: запуск, оплата, VIP и entitlement creation не разрешены.",
    blockedReasons: blockedReasons.slice(),
    requiredOwnerChecks: requiredOwnerChecks.slice(),
    requiredFutureEnvFlags: [...APHRODITE_OWNER_REVIEW_REQUIRED_FUTURE_ENV_FLAGS],
    safetyBoundary: [...APHRODITE_OWNER_REVIEW_SAFETY_LABELS],
  };
}

export function getAphroditeOwnerReviewChecklist(): AphroditeOwnerReviewChecklistItem[] {
  return [
    {
      id: "owner-manual-approval",
      area: "production-launch",
      label: "Ручное подтверждение владельца перед любым VIP/payment launch",
      requiredBeforeLaunch: [
        "owner review проведён вручную",
        "следующий package явно подтверждён владельцем",
        "Package 168 не используется как runtime switch",
      ],
      blockedUntil: ["письменное owner approval", "отдельный launch package"],
      riskLevel: "critical",
    },
    {
      id: "payments-review",
      area: "payments",
      label: "Платёжный запуск отдельно reviewed и не включён сейчас",
      requiredBeforeLaunch: [
        "провайдер оплаты выбран отдельно",
        "test-mode сценарии описаны",
        "support/refund policy готова",
      ],
      blockedUntil: ["Package 169+ architecture review", "owner approval"],
      riskLevel: "critical",
    },
    {
      id: "telegram-stars-review",
      area: "telegram-stars",
      label: "Telegram Stars live invoice заблокирован до отдельного review",
      requiredBeforeLaunch: [
        "invoice flow reviewed",
        "Telegram API permissions reviewed",
        "no live invoice в текущем package",
      ],
      blockedUntil: ["отдельный Telegram Stars package", "owner approval"],
      riskLevel: "critical",
    },
    {
      id: "successful-payment-handler-review",
      area: "successful-payment-handler",
      label: "successful_payment handler нельзя добавлять без owner gate",
      requiredBeforeLaunch: [
        "payment event contract reviewed",
        "refund/revoke flow reviewed",
        "security QA остаётся PASS",
      ],
      blockedUntil: ["verified payment event package", "owner approval"],
      riskLevel: "critical",
    },
    {
      id: "entitlement-creation-review",
      area: "entitlement-creation",
      label: "Entitlement creation остаётся заблокированным",
      requiredBeforeLaunch: [
        "server-side entitlement check готов",
        "payment ledger verified",
        "audit trail reviewed",
      ],
      blockedUntil: ["DB/persistence package", "owner approval"],
      riskLevel: "critical",
    },
    {
      id: "vip-unlock-review",
      area: "vip-unlock",
      label: "VIP unlock нельзя включать без verified entitlement",
      requiredBeforeLaunch: [
        "deny-by-default guard остаётся базой",
        "fake client flags игнорируются",
        "fallback preview работает",
      ],
      blockedUntil: ["server entitlement PASS", "owner approval"],
      riskLevel: "critical",
    },
    {
      id: "database-write-review",
      area: "database-write",
      label: "Production DB write требует отдельного review",
      requiredBeforeLaunch: [
        "DATABASE_URL подтверждён",
        "миграции reviewed",
        "backupFresh=true подтверждён владельцем",
      ],
      blockedUntil: ["fresh backup", "DB review", "owner approval"],
      riskLevel: "critical",
    },
    {
      id: "support-refund-readiness",
      area: "support-refund-policy",
      label: "Support/refund readiness обязательна до оплаты",
      requiredBeforeLaunch: [
        "описана политика возвратов",
        "описан ручной support flow",
        "описан revoke entitlement flow",
      ],
      blockedUntil: ["support/refund policy approved"],
      riskLevel: "high",
    },
    {
      id: "analytics-readiness",
      area: "analytics-readiness",
      label: "Analytics readiness нужна до live launch",
      requiredBeforeLaunch: [
        "воронка оплаты проверяется без персональных данных",
        "ошибки оплаты можно диагностировать",
        "no secret leaks подтверждено QA",
      ],
      blockedUntil: ["analytics review", "security QA PASS"],
      riskLevel: "medium",
    },
  ];
}

export function getAphroditeOwnerReviewBoundaries(): AphroditeOwnerReviewBoundary[] {
  return [
    {
      area: "Payment",
      visibleLabel: "Нет реальной оплаты",
      dataBoundary: "no-real-payment",
      allowedNow: ["показывать owner review gate", "документировать будущие env flags"],
      blockedUntil: ["owner approval", "отдельный payment package"],
      riskLevel: "critical",
    },
    {
      area: "VIP unlock",
      visibleLabel: "Нет реальной VIP-разблокировки",
      dataBoundary: "no-real-vip-unlock",
      allowedNow: ["показывать deny-by-default результат"],
      blockedUntil: ["verified entitlement", "owner approval"],
      riskLevel: "critical",
    },
    {
      area: "Telegram Stars",
      visibleLabel: "Нет Telegram Stars invoice",
      dataBoundary: "no-stars-invoice",
      allowedNow: ["документировать будущий review"],
      blockedUntil: ["Telegram Stars architecture review", "owner approval"],
      riskLevel: "critical",
    },
    {
      area: "Payment event",
      visibleLabel: "Нет successful_payment handler",
      dataBoundary: "no-successful-payment-handler",
      allowedNow: ["проверять отсутствие handler"],
      blockedUntil: ["verified event handling package", "owner approval"],
      riskLevel: "critical",
    },
    {
      area: "Entitlement",
      visibleLabel: "Нет entitlement creation",
      dataBoundary: "no-entitlement-creation",
      allowedNow: ["документировать будущие checks"],
      blockedUntil: ["storage/persistence review", "owner approval"],
      riskLevel: "critical",
    },
    {
      area: "Database",
      visibleLabel: "Нет записи в базу данных",
      dataBoundary: "no-database-write",
      allowedNow: ["читать статическую модель"],
      blockedUntil: ["fresh backup", "DB review", "owner approval"],
      riskLevel: "critical",
    },
    {
      area: "Database schema",
      visibleLabel: "Нет миграции схемы базы данных",
      dataBoundary: "no-database-schema-migration",
      allowedNow: ["проверять отсутствие schema changes"],
      blockedUntil: ["migration review", "owner approval"],
      riskLevel: "critical",
    },
    {
      area: "Telegram API",
      visibleLabel: "Нет вызова Telegram API",
      dataBoundary: "no-telegram-api-call",
      allowedNow: ["показывать dashboard review"],
      blockedUntil: ["Telegram API review", "owner approval"],
      riskLevel: "critical",
    },
    {
      area: "Production launch",
      visibleLabel: "Нет production-запуска",
      dataBoundary: "no-production-launch",
      allowedNow: ["local/dashboard QA"],
      blockedUntil: ["production safety PASS", "fresh backup", "owner approval"],
      riskLevel: "critical",
    },
    {
      area: "Owner review",
      visibleLabel: "Owner review не включает оплату",
      dataBoundary: "owner-review-does-not-enable-payment",
      allowedNow: ["ручная проверка готовности", "read-only dashboard"],
      blockedUntil: ["separate implementation package"],
      riskLevel: "critical",
    },
  ];
}

export function getAphroditeOwnerReviewNextSteps(): AphroditeOwnerReviewNextStep[] {
  return [
    {
      package: "Package 169",
      title: "Telegram Stars Payment Architecture Final Review",
      purpose:
        "Проверить будущую архитектуру Telegram Stars без включения invoice, payment handler, entitlement creation или VIP unlock.",
      blockedUntil: [
        "пользователь явно подтвердит старт Package 169",
        "Package 168 закоммичен и проверен",
        "owner review gate остаётся deny-by-default",
      ],
    },
  ];
}
