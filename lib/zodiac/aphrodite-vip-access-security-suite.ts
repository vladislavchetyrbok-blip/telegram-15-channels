/**
 * Aphrodite VIP access security QA suite (Package 167).
 *
 * Consolidated QA/readiness model only. This file does not implement payment,
 * VIP access, entitlement creation, database writes, schema changes, Telegram
 * calls, production guard wiring, or user-facing flow changes.
 */

export type AphroditeVipAccessSecurityLayerId =
  | "product-catalog"
  | "fallback-map"
  | "vip-guard-skeleton"
  | "guard-integration-review"
  | "payment-ledger-design"
  | "entitlement-storage-design"
  | "entitlement-schema-skeleton"
  | "server-entitlement-check-skeleton";

export type AphroditeVipAccessSecurityGateId =
  | "no-vip-without-entitlement"
  | "no-vip-from-local-storage"
  | "no-vip-from-query-param"
  | "no-vip-from-mock-payment-success"
  | "no-vip-from-fake-entitlement-record"
  | "no-active-payment-api"
  | "no-successful-payment-handler"
  | "no-stars-invoice"
  | "no-entitlement-creation"
  | "no-db-write"
  | "no-db-migration"
  | "no-telegram-api-call"
  | "free-preview-remains-open"
  | "fallback-route-exists"
  | "catalog-payment-disabled"
  | "catalog-vip-unlock-disabled"
  | "guard-skeleton-denies"
  | "server-skeleton-denies";

export type AphroditeVipAccessSecurityLayer = {
  id: AphroditeVipAccessSecurityLayerId;
  title: string;
  route: string;
  modelFile: string;
  qaFile: string;
  purpose: string;
  readOnly: true;
};

export type AphroditeVipAccessSecurityGate = {
  id: AphroditeVipAccessSecurityGateId;
  visibleRule: string;
  expectedResult: "PASS";
  evidenceLayers: AphroditeVipAccessSecurityLayerId[];
  safetyOnly: true;
};

export type AphroditeVipAccessSecurityBoundary = {
  area: string;
  visibleLabel: string;
  dataBoundary: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeVipAccessSecurityNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_VIP_ACCESS_SECURITY_SUITE_CLASSIFICATION =
  "Только QA безопасности / VIP не открывается / Нет оплаты";

export const APHRODITE_VIP_ACCESS_SECURITY_SUITE_RULE =
  "Security QA suite проверяет, что все VIP/payment/entitlement слои остаются deny-by-default и ничего не открывают.";

export const APHRODITE_VIP_ACCESS_SECURITY_SUITE_FALLBACK_ROUTE = "/miniapp/love-reading-preview";

export const APHRODITE_VIP_ACCESS_SECURITY_SUITE_SAFETY_LABELS = [
  "Нет реальной VIP-разблокировки",
  "Нет оплаты",
  "Нет Telegram Stars invoice",
  "Нет successful_payment handler",
  "Нет entitlement creation",
  "Нет записи в базу данных",
  "Нет миграции схемы базы данных",
  "Нет вызова Telegram API",
  "Нет production-запуска",
  "QA suite ничего не открывает",
] as const;

const layers: AphroditeVipAccessSecurityLayer[] = [
  {
    id: "product-catalog",
    title: "Product Catalog Finalization",
    route: "/dashboard/networks/zodiac/product-catalog-finalization",
    modelFile: "lib/zodiac/aphrodite-product-catalog.ts",
    qaFile: "scripts/qa-aphrodite-product-catalog-finalization.mjs",
    purpose: "Проверяет, что paymentEnabledNow=false и vipUnlockEnabledNow=false для всех продуктов.",
    readOnly: true,
  },
  {
    id: "fallback-map",
    title: "VIP Free Preview Fallback Map",
    route: "/dashboard/networks/zodiac/vip-free-preview-fallback-map",
    modelFile: "lib/zodiac/aphrodite-vip-free-preview-fallback-map.ts",
    qaFile: "scripts/qa-aphrodite-vip-free-preview-fallback-map.mjs",
    purpose: "Проверяет, что deny ведёт в бесплатный preview fallback.",
    readOnly: true,
  },
  {
    id: "vip-guard-skeleton",
    title: "VIP Access Guard Skeleton",
    route: "/dashboard/networks/zodiac/vip-access-guard-skeleton",
    modelFile: "lib/zodiac/aphrodite-vip-access-guard-skeleton.ts",
    qaFile: "scripts/qa-aphrodite-vip-access-guard-skeleton.mjs",
    purpose: "Проверяет, что guard skeleton всегда возвращает allowed=false.",
    readOnly: true,
  },
  {
    id: "guard-integration-review",
    title: "VIP Guard Integration Review",
    route: "/dashboard/networks/zodiac/vip-guard-integration-review",
    modelFile: "lib/zodiac/aphrodite-vip-guard-integration-review.ts",
    qaFile: "scripts/qa-aphrodite-vip-guard-integration-review.mjs",
    purpose: "Проверяет, что будущая интеграция guard не подключена к production.",
    readOnly: true,
  },
  {
    id: "payment-ledger-design",
    title: "Payment Ledger Design",
    route: "/dashboard/networks/zodiac/payment-ledger-design",
    modelFile: "lib/zodiac/aphrodite-payment-ledger-design.ts",
    qaFile: "scripts/qa-aphrodite-payment-ledger-design.mjs",
    purpose: "Проверяет, что ledger design не пишет записи и не создаёт entitlement.",
    readOnly: true,
  },
  {
    id: "entitlement-storage-design",
    title: "Entitlement Storage Design",
    route: "/dashboard/networks/zodiac/entitlement-storage-design",
    modelFile: "lib/zodiac/aphrodite-entitlement-storage-design.ts",
    qaFile: "scripts/qa-aphrodite-entitlement-storage-design.mjs",
    purpose: "Проверяет, что storage design описывает будущие поля без создания доступа.",
    readOnly: true,
  },
  {
    id: "entitlement-schema-skeleton",
    title: "Entitlement Schema Skeleton",
    route: "/dashboard/networks/zodiac/entitlement-schema-skeleton",
    modelFile: "lib/zodiac/aphrodite-entitlement-schema-skeleton.ts",
    qaFile: "scripts/qa-aphrodite-entitlement-schema-skeleton.mjs",
    purpose: "Проверяет, что validation helper всегда возвращает grantsAccessNow=false.",
    readOnly: true,
  },
  {
    id: "server-entitlement-check-skeleton",
    title: "Server-side Entitlement Check Skeleton",
    route: "/dashboard/networks/zodiac/server-entitlement-check-skeleton",
    modelFile: "lib/zodiac/aphrodite-server-entitlement-check-skeleton.ts",
    qaFile: "scripts/qa-aphrodite-server-entitlement-check-skeleton.mjs",
    purpose: "Проверяет, что server skeleton всегда возвращает allowed=false и fallback.",
    readOnly: true,
  },
];

const gates: AphroditeVipAccessSecurityGate[] = [
  {
    id: "no-vip-without-entitlement",
    visibleRule: "No VIP without entitlement",
    expectedResult: "PASS",
    evidenceLayers: ["vip-guard-skeleton", "entitlement-storage-design", "server-entitlement-check-skeleton"],
    safetyOnly: true,
  },
  {
    id: "no-vip-from-local-storage",
    visibleRule: "No VIP from localStorage",
    expectedResult: "PASS",
    evidenceLayers: ["vip-guard-skeleton", "server-entitlement-check-skeleton"],
    safetyOnly: true,
  },
  {
    id: "no-vip-from-query-param",
    visibleRule: "No VIP from query param",
    expectedResult: "PASS",
    evidenceLayers: ["vip-guard-skeleton", "server-entitlement-check-skeleton"],
    safetyOnly: true,
  },
  {
    id: "no-vip-from-mock-payment-success",
    visibleRule: "No VIP from mock payment success",
    expectedResult: "PASS",
    evidenceLayers: ["vip-guard-skeleton", "server-entitlement-check-skeleton", "payment-ledger-design"],
    safetyOnly: true,
  },
  {
    id: "no-vip-from-fake-entitlement-record",
    visibleRule: "No VIP from fake entitlement record",
    expectedResult: "PASS",
    evidenceLayers: ["entitlement-schema-skeleton", "server-entitlement-check-skeleton"],
    safetyOnly: true,
  },
  {
    id: "no-active-payment-api",
    visibleRule: "No active payment API",
    expectedResult: "PASS",
    evidenceLayers: ["payment-ledger-design", "product-catalog"],
    safetyOnly: true,
  },
  {
    id: "no-successful-payment-handler",
    visibleRule: "No successful_payment handler",
    expectedResult: "PASS",
    evidenceLayers: ["payment-ledger-design", "server-entitlement-check-skeleton"],
    safetyOnly: true,
  },
  {
    id: "no-stars-invoice",
    visibleRule: "No Stars invoice",
    expectedResult: "PASS",
    evidenceLayers: ["payment-ledger-design"],
    safetyOnly: true,
  },
  {
    id: "no-entitlement-creation",
    visibleRule: "No entitlement creation",
    expectedResult: "PASS",
    evidenceLayers: ["payment-ledger-design", "entitlement-storage-design", "entitlement-schema-skeleton"],
    safetyOnly: true,
  },
  {
    id: "no-db-write",
    visibleRule: "No DB write",
    expectedResult: "PASS",
    evidenceLayers: ["payment-ledger-design", "entitlement-storage-design", "server-entitlement-check-skeleton"],
    safetyOnly: true,
  },
  {
    id: "no-db-migration",
    visibleRule: "No DB migration",
    expectedResult: "PASS",
    evidenceLayers: ["entitlement-storage-design", "entitlement-schema-skeleton"],
    safetyOnly: true,
  },
  {
    id: "no-telegram-api-call",
    visibleRule: "No Telegram API call",
    expectedResult: "PASS",
    evidenceLayers: ["payment-ledger-design", "server-entitlement-check-skeleton"],
    safetyOnly: true,
  },
  {
    id: "free-preview-remains-open",
    visibleRule: "Free preview remains open",
    expectedResult: "PASS",
    evidenceLayers: ["fallback-map", "product-catalog"],
    safetyOnly: true,
  },
  {
    id: "fallback-route-exists",
    visibleRule: "Fallback route exists",
    expectedResult: "PASS",
    evidenceLayers: ["fallback-map", "vip-guard-skeleton", "server-entitlement-check-skeleton"],
    safetyOnly: true,
  },
  {
    id: "catalog-payment-disabled",
    visibleRule: "Product catalog has paymentEnabledNow=false",
    expectedResult: "PASS",
    evidenceLayers: ["product-catalog"],
    safetyOnly: true,
  },
  {
    id: "catalog-vip-unlock-disabled",
    visibleRule: "Product catalog has vipUnlockEnabledNow=false",
    expectedResult: "PASS",
    evidenceLayers: ["product-catalog"],
    safetyOnly: true,
  },
  {
    id: "guard-skeleton-denies",
    visibleRule: "Guard skeleton allowed=false",
    expectedResult: "PASS",
    evidenceLayers: ["vip-guard-skeleton"],
    safetyOnly: true,
  },
  {
    id: "server-skeleton-denies",
    visibleRule: "Server entitlement skeleton allowed=false",
    expectedResult: "PASS",
    evidenceLayers: ["server-entitlement-check-skeleton"],
    safetyOnly: true,
  },
];

export function getAphroditeVipAccessSecurityLayers(): AphroditeVipAccessSecurityLayer[] {
  return layers.map((layer) => ({ ...layer }));
}

export function getAphroditeVipAccessSecurityGates(): AphroditeVipAccessSecurityGate[] {
  return gates.map((gate) => ({ ...gate, evidenceLayers: gate.evidenceLayers.slice() }));
}

export function getAphroditeVipAccessSecurityBoundaries(): AphroditeVipAccessSecurityBoundary[] {
  return [
    {
      area: "VIP unlock",
      visibleLabel: "Нет реальной VIP-разблокировки",
      dataBoundary: "no-real-vip-unlock",
      allowedNow: ["security QA", "manual review dashboard"],
      blockedUntil: ["future verified entitlement", "owner review"],
      riskLevel: "critical",
    },
    {
      area: "Payment",
      visibleLabel: "Нет оплаты",
      dataBoundary: "no-payment",
      allowedNow: ["проверять отсутствие payment API"],
      blockedUntil: ["отдельный approved payment package"],
      riskLevel: "critical",
    },
    {
      area: "Telegram Stars",
      visibleLabel: "Нет Telegram Stars invoice",
      dataBoundary: "no-stars-invoice",
      allowedNow: ["проверять отсутствие invoice"],
      blockedUntil: ["отдельный invoice package"],
      riskLevel: "critical",
    },
    {
      area: "Payment update",
      visibleLabel: "Нет successful_payment handler",
      dataBoundary: "no-successful-payment-handler",
      allowedNow: ["проверять отсутствие handler"],
      blockedUntil: ["отдельная payment event implementation"],
      riskLevel: "critical",
    },
    {
      area: "Entitlement creation",
      visibleLabel: "Нет entitlement creation",
      dataBoundary: "no-entitlement-creation",
      allowedNow: ["проверять static deny models"],
      blockedUntil: ["future persistence package"],
      riskLevel: "critical",
    },
    {
      area: "Database write",
      visibleLabel: "Нет записи в базу данных",
      dataBoundary: "no-database-write",
      allowedNow: ["read-only QA"],
      blockedUntil: ["DB review package"],
      riskLevel: "critical",
    },
    {
      area: "Database schema",
      visibleLabel: "Нет миграции схемы базы данных",
      dataBoundary: "no-database-schema-migration",
      allowedNow: ["проверять отсутствие schema changes"],
      blockedUntil: ["migration review"],
      riskLevel: "critical",
    },
    {
      area: "Telegram API",
      visibleLabel: "Нет вызова Telegram API",
      dataBoundary: "no-telegram-api-call",
      allowedNow: ["проверять отсутствие API calls"],
      blockedUntil: ["Telegram integration package"],
      riskLevel: "critical",
    },
    {
      area: "Production launch",
      visibleLabel: "Нет production-запуска",
      dataBoundary: "no-production-launch",
      allowedNow: ["локальная QA suite"],
      blockedUntil: ["owner launch checklist", "production safety PASS"],
      riskLevel: "high",
    },
    {
      area: "QA only",
      visibleLabel: "QA suite ничего не открывает",
      dataBoundary: "qa-suite-opens-nothing",
      allowedNow: ["read-only security report"],
      blockedUntil: ["Package 168 owner review gate"],
      riskLevel: "critical",
    },
  ];
}

export function getAphroditeVipAccessSecurityNextSteps(): AphroditeVipAccessSecurityNextStep[] {
  return [
    {
      package: "Package 168",
      title: "Owner Review Gate For VIP Launch",
      purpose: "Будущий owner review gate должен подтвердить, можно ли начинать реальный launch path. Package 167 его не начинает.",
      blockedUntil: [
        "владелец подтвердит результаты Package 167",
        "production safety prerequisites закрыты",
        "будущий launch path явно разрешён",
      ],
    },
  ];
}
