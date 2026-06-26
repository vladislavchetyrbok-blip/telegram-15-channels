/**
 * Package 174: entitlement creation mock.
 *
 * Local preview only. It describes future entitlement grant requirements, but
 * never creates entitlement, writes DB, grants access, unlocks VIP, calls
 * Telegram API, or changes production settings.
 */

export type AphroditeEntitlementGrantMockInput = {
  productId: string;
  telegramUserId?: string;
  mockVerifiedLedger?: boolean;
  ownerApproved?: boolean;
  entitlementsEnabled?: boolean;
  securityQaApproved?: boolean;
  supportPolicyReady?: boolean;
  backupFresh?: boolean;
};

export type AphroditeEntitlementGrantMockResult = {
  productId: string;
  entitlementDraftId: string;
  dependencyNotes: string[];
  fallbackRoute: "/miniapp/love-reading-preview";
  mockOnly: true;
  createsEntitlementNow: false;
  writesToDatabaseNow: false;
  grantsAccessNow: false;
  unlocksVipNow: false;
  allowed: false;
};

export type AphroditeEntitlementCreationMockRule = {
  id: string;
  label: string;
  futureDependency: string;
  requiredBeforeLive: string[];
};

export type AphroditeEntitlementCreationMockBoundary = {
  id: string;
  visibleLabel: string;
  allowedNow: string[];
  blockedUntil: string[];
};

export type AphroditeEntitlementCreationMockNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_ENTITLEMENT_CREATION_MOCK_TITLE = "Mock создания entitlement";

export const APHRODITE_ENTITLEMENT_CREATION_MOCK_CLASSIFICATION =
  "Только mock / Entitlement не создаётся / Доступ не выдаётся";

export const APHRODITE_ENTITLEMENT_CREATION_MOCK_RULE =
  "Entitlement creation mock is local preview only. Он не создаёт entitlement и не выдаёт доступ.";

export const APHRODITE_ENTITLEMENT_CREATION_MOCK_SAFETY_LABELS = [
  "Нет реальной оплаты",
  "Нет Telegram Stars invoice",
  "Нет successful_payment handler",
  "Нет payment ledger write",
  "Нет entitlement creation",
  "Нет реальной VIP-разблокировки",
  "Нет записи в базу данных",
  "Нет миграции схемы базы данных",
  "Нет вызова Telegram API",
  "Entitlement mock не выдаёт доступ",
] as const;

const rules: AphroditeEntitlementCreationMockRule[] = [
  {
    id: "product-catalog",
    label: "Product catalog",
    futureDependency: "product catalog должен определить доступный productId и fallback route.",
    requiredBeforeLive: ["Package 162", "catalog QA"],
  },
  {
    id: "verified-payment-ledger",
    label: "Verified payment ledger",
    futureDependency: "verified payment ledger обязателен перед любым entitlement grant.",
    requiredBeforeLive: ["Package 173 не является verified ledger", "idempotent ledger storage"],
  },
  {
    id: "entitlement-storage",
    label: "Entitlement storage",
    futureDependency: "entitlement storage должен описывать состояние active, refunded и revoked.",
    requiredBeforeLive: ["Package 164", "support/refund review"],
  },
  {
    id: "entitlement-schema",
    label: "Entitlement schema",
    futureDependency: "entitlement schema должна быть reviewed до любого DB write.",
    requiredBeforeLive: ["Package 165", "migration review", "fresh backup"],
  },
  {
    id: "server-side-entitlement-check",
    label: "Server-side entitlement check",
    futureDependency: "server-side entitlement check должен оставаться единственным источником доступа.",
    requiredBeforeLive: ["Package 166", "no client bypass QA"],
  },
  {
    id: "owner-review-gate",
    label: "Owner review gate",
    futureDependency: "owner review gate должен разрешить будущий paid access отдельно.",
    requiredBeforeLive: ["Package 168", "manual owner approval"],
  },
  {
    id: "security-qa-suite",
    label: "Security QA suite",
    futureDependency: "security QA suite должен падать при fake entitlement и client-side unlock.",
    requiredBeforeLive: ["Package 167", "payment/VIP QA"],
  },
  {
    id: "support-refund-policy",
    label: "Support/refund policy",
    futureDependency: "support/refund policy должен описывать revoke и спорные платежи.",
    requiredBeforeLive: ["refund policy", "support audit notes"],
  },
  {
    id: "backup-freshness",
    label: "Backup freshness",
    futureDependency: "backup freshness обязательна перед любым entitlement DB write.",
    requiredBeforeLive: ["production safety PASS", "backup younger than 24h"],
  },
];

export function draftAphroditeEntitlementGrantMock(
  input: AphroditeEntitlementGrantMockInput,
): AphroditeEntitlementGrantMockResult {
  return {
    productId: input.productId,
    entitlementDraftId: `mock-entitlement:${input.productId}:${input.telegramUserId ?? "mock-user"}`,
    dependencyNotes: [
      input.mockVerifiedLedger ? "mock verified ledger передан, но не считается production verification" : "verified payment ledger отсутствует",
      input.ownerApproved ? "owner approval передан как mock, но не является runtime-разрешением" : "owner approval отсутствует",
      input.entitlementsEnabled ? "entitlements enabled передан как mock, но доступ не выдаётся" : "entitlements enabled отсутствует",
      input.securityQaApproved ? "security QA передан как mock, но Package 174 остаётся preview" : "security QA не подтверждён",
      "entitlement creation, DB write, access grant и VIP unlock запрещены в Package 174",
    ],
    fallbackRoute: "/miniapp/love-reading-preview",
    mockOnly: true,
    createsEntitlementNow: false,
    writesToDatabaseNow: false,
    grantsAccessNow: false,
    unlocksVipNow: false,
    allowed: false,
  };
}

export function getAphroditeEntitlementCreationMockRules(): AphroditeEntitlementCreationMockRule[] {
  return rules.map((rule) => ({
    ...rule,
    requiredBeforeLive: rule.requiredBeforeLive.slice(),
  }));
}

export function getAphroditeEntitlementCreationMockBoundaries(): AphroditeEntitlementCreationMockBoundary[] {
  return [
    {
      id: "no-entitlement-creation",
      visibleLabel: "Нет entitlement creation",
      allowedNow: ["локальный entitlement draft"],
      blockedUntil: ["verified payment ledger", "server-side entitlement package"],
    },
    {
      id: "no-database-write",
      visibleLabel: "Нет записи в базу данных",
      allowedNow: ["read-only preview"],
      blockedUntil: ["DB review", "fresh backup", "owner approval"],
    },
    {
      id: "no-access-grant",
      visibleLabel: "Entitlement mock не выдаёт доступ",
      allowedNow: ["allowed: false", "fallback preview"],
      blockedUntil: ["server-side entitlement check", "security QA PASS"],
    },
    {
      id: "no-vip-unlock",
      visibleLabel: "Нет реальной VIP-разблокировки",
      allowedNow: ["VIP остаётся закрытым"],
      blockedUntil: ["verified entitlement", "owner approval"],
    },
    {
      id: "no-schema-migration",
      visibleLabel: "Нет миграции схемы базы данных",
      allowedNow: ["TypeScript-only mock"],
      blockedUntil: ["migration review", "backup younger than 24h"],
    },
    {
      id: "no-telegram-api",
      visibleLabel: "Нет вызова Telegram API",
      allowedNow: ["локальная модель"],
      blockedUntil: ["Telegram API review"],
    },
  ];
}

export function getAphroditeEntitlementCreationMockNextSteps(): AphroditeEntitlementCreationMockNextStep[] {
  return [
    {
      package: "Package 175",
      title: "Production Payment Safety Gate",
      purpose: "Перед любыми live payment действиями собрать отдельный production safety gate для env, owner approval, backup, support и rollback.",
      blockedUntil: [
        "Package 174 committed",
        "allowed остаётся false",
        "createsEntitlementNow остаётся false",
        "writesToDatabaseNow остаётся false",
      ],
    },
  ];
}
