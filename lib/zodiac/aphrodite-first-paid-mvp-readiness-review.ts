/**
 * Package 178: First Paid MVP readiness review.
 *
 * Review-only model. It evaluates readiness for a future paid MVP, but does not
 * enable payment, VIP unlock, entitlement creation, DB writes, Telegram API
 * calls, production launch, or active payment CTA.
 */

export type AphroditeFirstPaidMvpReadinessStatus =
  | "Ready for review"
  | "Partially ready"
  | "Blocked"
  | "Not started"
  | "Owner review required"
  | "Production env required";

export type AphroditeFirstPaidMvpReadinessCategory =
  | "product"
  | "payment"
  | "entitlement"
  | "content"
  | "support"
  | "analytics"
  | "production"
  | "security";

export type AphroditeFirstPaidMvpReadinessArea = {
  id: string;
  title: string;
  category: AphroditeFirstPaidMvpReadinessCategory;
  status: AphroditeFirstPaidMvpReadinessStatus;
  currentState: string;
  evidence: string[];
  missingBeforeLaunch: string[];
};

export type AphroditeFirstPaidMvpBlocker = {
  id: string;
  title: string;
  area: AphroditeFirstPaidMvpReadinessCategory;
  severity: "high" | "critical";
  reason: string;
  requiredBeforeLaunch: string[];
};

export type AphroditeFirstPaidMvpChecklistItem = {
  id: string;
  label: string;
  status: "pass" | "blocked" | "owner-review-required" | "production-env-required";
  launchRequired: boolean;
  note: string;
};

export type AphroditeFirstPaidMvpSafetyBoundary = {
  id: string;
  visibleLabel: string;
  allowedNow: string[];
  blockedNow: string[];
};

export type AphroditeFirstPaidMvpNextStep = {
  package: string;
  title: string;
  purpose: string;
  mustNotDo: string[];
};

export const APHRODITE_FIRST_PAID_MVP_READINESS_TITLE = "Readiness Review первого платного MVP";

export const APHRODITE_FIRST_PAID_MVP_READINESS_CLASSIFICATION =
  "Только review готовности / Запуск не разрешён / Нет оплаты";

export const APHRODITE_FIRST_PAID_MVP_NOT_APPROVED =
  "Paid MVP is not approved for launch yet.";

export const APHRODITE_FIRST_PAID_MVP_NOT_APPROVED_RU = "Paid MVP не разрешён к запуску";

export const APHRODITE_FIRST_PAID_MVP_SAFETY_LABELS = [
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
  "Paid MVP не разрешён к запуску",
] as const;

const readinessAreas: AphroditeFirstPaidMvpReadinessArea[] = [
  {
    id: "product-catalog",
    title: "Product catalog",
    category: "product",
    status: "Ready for review",
    currentState: "Каталог продуктов финализирован как read-only основа для будущего платного MVP.",
    evidence: [
      "docs/aphrodite-product-catalog-finalization.md",
      "/dashboard/networks/zodiac/product-catalog-finalization",
      "Package 162",
    ],
    missingBeforeLaunch: ["финальное owner approval цены и состава первого платного оффера"],
  },
  {
    id: "free-preview-funnel",
    title: "Free preview funnel",
    category: "product",
    status: "Partially ready",
    currentState: "Free preview и fallback VIP-карта описаны, но paid conversion CTA не активируется.",
    evidence: [
      "docs/aphrodite-vip-free-preview-fallback-map.md",
      "/miniapp/love-reading-preview",
      "/dashboard/networks/zodiac/vip-free-preview-fallback-map",
    ],
    missingBeforeLaunch: ["support/refund policy", "analytics event pipeline", "owner-approved conversion copy"],
  },
  {
    id: "full-love-report-product-shape",
    title: "Full Love Report product shape",
    category: "product",
    status: "Ready for review",
    currentState: "Форма будущего Full Love Report описана через product remediation, first result и Love Reading foundation.",
    evidence: [
      "docs/aphrodite-product-remediation-plan.md",
      "docs/aphrodite-first-result-experience.md",
      "docs/aphrodite-ai-love-reading-foundation.md",
    ],
    missingBeforeLaunch: ["финальная упаковка отчёта", "support/refund wording", "owner review"],
  },
  {
    id: "paywall-copy-readiness",
    title: "Paywall copy/readiness",
    category: "product",
    status: "Partially ready",
    currentState: "Paywall readiness описан как будущая упаковка без оплаты и без unlock.",
    evidence: ["docs/aphrodite-paywall-readiness.md", "/dashboard/networks/zodiac/paywall-readiness"],
    missingBeforeLaunch: ["запрещён активный payment CTA до отдельного approval", "финальный текст отказов/возвратов"],
  },
  {
    id: "vip-guard",
    title: "VIP guard",
    category: "security",
    status: "Ready for review",
    currentState: "VIP guard skeleton и security suite существуют, fail-closed поведение проверяется.",
    evidence: [
      "lib/zodiac/aphrodite-vip-access-guard-skeleton.ts",
      "lib/zodiac/aphrodite-vip-access-security-suite.ts",
      "scripts/qa-aphrodite-vip-access-security-suite.mjs",
    ],
    missingBeforeLaunch: ["подключение к verified server-side entitlement storage", "повторный security QA после wiring"],
  },
  {
    id: "server-side-entitlement-check",
    title: "Server-side entitlement check",
    category: "entitlement",
    status: "Partially ready",
    currentState: "Skeleton server-side entitlement check есть и должен оставаться deny-by-default до реального storage.",
    evidence: [
      "lib/zodiac/aphrodite-server-entitlement-check-skeleton.ts",
      "/dashboard/networks/zodiac/server-entitlement-check-skeleton",
    ],
    missingBeforeLaunch: ["активное entitlement storage", "idempotent payment ledger", "DB persistence review"],
  },
  {
    id: "payment-ledger",
    title: "Payment ledger",
    category: "payment",
    status: "Blocked",
    currentState: "Payment ledger design и mock integration существуют, но реальная запись запрещена.",
    evidence: [
      "docs/aphrodite-payment-ledger-design.md",
      "lib/zodiac/aphrodite-payment-ledger-mock-integration.ts",
      "/dashboard/networks/zodiac/payment-ledger-mock-integration",
    ],
    missingBeforeLaunch: ["DATABASE_URL", "fresh backup", "idempotent persistence", "verified payment payload"],
  },
  {
    id: "entitlement-storage",
    title: "Entitlement storage",
    category: "entitlement",
    status: "Partially ready",
    currentState: "Entitlement storage design и schema skeleton есть, но доступ не создаётся и storage не активен.",
    evidence: [
      "docs/aphrodite-entitlement-storage-design.md",
      "lib/zodiac/aphrodite-entitlement-schema-skeleton.ts",
      "/dashboard/networks/zodiac/entitlement-storage-design",
    ],
    missingBeforeLaunch: ["реальная persistence-модель", "schema migration review", "security QA"],
  },
  {
    id: "telegram-stars-invoice-skeleton",
    title: "Telegram Stars invoice skeleton",
    category: "payment",
    status: "Ready for review",
    currentState: "Invoice builder skeleton создаёт только draft и ничего не отправляет.",
    evidence: [
      "lib/zodiac/aphrodite-telegram-stars-invoice-builder-skeleton.ts",
      "/dashboard/networks/zodiac/telegram-stars-invoice-builder-skeleton",
    ],
    missingBeforeLaunch: ["Telegram API review", "TELEGRAM_BOT_TOKEN", "owner approval", "support/refund policy"],
  },
  {
    id: "precheckout-skeleton",
    title: "PreCheckout skeleton",
    category: "payment",
    status: "Ready for review",
    currentState: "PreCheckout skeleton описывает validation, но handler не подключён.",
    evidence: [
      "lib/zodiac/aphrodite-telegram-stars-precheckout-skeleton.ts",
      "/dashboard/networks/zodiac/telegram-stars-precheckout-skeleton",
    ],
    missingBeforeLaunch: ["production handler package", "payload/amount/currency QA", "owner approval"],
  },
  {
    id: "successful-payment-skeleton",
    title: "successful_payment skeleton",
    category: "payment",
    status: "Ready for review",
    currentState: "successful_payment skeleton inspect-only: нет ledger write и нет VIP unlock.",
    evidence: [
      "lib/zodiac/aphrodite-telegram-stars-successful-payment-skeleton.ts",
      "/dashboard/networks/zodiac/telegram-stars-successful-payment-skeleton",
    ],
    missingBeforeLaunch: ["verified ledger write", "idempotency", "refund/revoke process"],
  },
  {
    id: "mock-payment-flow",
    title: "Mock payment flow",
    category: "payment",
    status: "Ready for review",
    currentState: "Mock payment ledger используется только для локального review и не сохраняет production state.",
    evidence: [
      "lib/zodiac/aphrodite-payment-ledger-mock-integration.ts",
      "scripts/qa-aphrodite-payment-ledger-mock-integration.mjs",
    ],
    missingBeforeLaunch: ["замена mock на verified Telegram Stars event", "DB review", "owner review"],
  },
  {
    id: "mock-entitlement-flow",
    title: "Mock entitlement flow",
    category: "entitlement",
    status: "Ready for review",
    currentState: "Mock entitlement preview показывает будущую форму grant, но не создаёт доступ.",
    evidence: [
      "lib/zodiac/aphrodite-entitlement-creation-mock.ts",
      "scripts/qa-aphrodite-entitlement-creation-mock.mjs",
    ],
    missingBeforeLaunch: ["verified payment dependency", "server entitlement storage", "security QA"],
  },
  {
    id: "production-payment-safety-gate",
    title: "Production payment safety gate",
    category: "security",
    status: "Ready for review",
    currentState: "Production safety gate существует и остаётся fail-closed.",
    evidence: [
      "lib/zodiac/aphrodite-production-payment-safety-gate.ts",
      "scripts/qa-aphrodite-production-payment-safety-gate.mjs",
      "/dashboard/networks/zodiac/production-payment-safety-gate",
    ],
    missingBeforeLaunch: ["green production safety with env", "fresh backup", "owner-approved launch package"],
  },
  {
    id: "owner-review-gate",
    title: "Owner review gate",
    category: "security",
    status: "Owner review required",
    currentState: "Owner review gate описан, но launch не подтверждён.",
    evidence: [
      "lib/zodiac/aphrodite-owner-review-gate.ts",
      "/dashboard/networks/zodiac/owner-review-gate",
    ],
    missingBeforeLaunch: ["ручное owner approval после readiness review", "release checklist"],
  },
  {
    id: "security-qa",
    title: "Security QA",
    category: "security",
    status: "Partially ready",
    currentState: "VIP/payment/entitlement security suite есть, но должен быть повторён после любого real wiring.",
    evidence: [
      "scripts/qa-aphrodite-vip-access-security-suite.mjs",
      "/dashboard/networks/zodiac/vip-access-security-suite",
    ],
    missingBeforeLaunch: ["post-wiring security run", "no client bypass", "no fake entitlement access"],
  },
  {
    id: "support-refund-policy",
    title: "Support/refund policy",
    category: "support",
    status: "Not started",
    currentState: "Support/refund policy ещё не финализирована для платного MVP.",
    evidence: ["Package 179 рекомендован как следующий шаг"],
    missingBeforeLaunch: ["support policy", "refund policy", "revocation flow", "dispute handling wording"],
  },
  {
    id: "analytics-funnel-tracking",
    title: "Analytics/funnel tracking",
    category: "analytics",
    status: "Partially ready",
    currentState: "Mini App analytics baseline существует, но paid funnel events не финализированы.",
    evidence: [
      "/dashboard/networks/zodiac/analytics",
      "docs/zodiac-first-users-analytics-baseline.md",
      "lib/zodiac-mini-app-analytics-store.ts",
    ],
    missingBeforeLaunch: ["paid funnel event taxonomy", "refund/support events", "privacy review"],
  },
  {
    id: "backup-env-readiness",
    title: "Backup/env readiness",
    category: "production",
    status: "Production env required",
    currentState: "Production safety сейчас блокируется env/backup prerequisites.",
    evidence: ["npm run production:safety:check", "DATABASE_URL", "TELEGRAM_BOT_TOKEN", "backup freshness"],
    missingBeforeLaunch: ["DATABASE_URL configured", "TELEGRAM_BOT_TOKEN configured", "backup younger than 24h"],
  },
  {
    id: "daily-weekly-monthly-content-pipeline",
    title: "Daily/weekly/monthly content pipeline",
    category: "content",
    status: "Ready for review",
    currentState: "Daily pipeline работает, weekly/monthly readiness добавлен в Package 177.",
    evidence: [
      "scripts/qa-zodiac-weekly-monthly-horoscopes.mjs",
      "docs/zodiac-weekly-monthly-horoscopes.md",
      "Package 177 commit 6abc369",
    ],
    missingBeforeLaunch: ["не блокирует paid MVP", "оставить publishing flows без изменений"],
  },
  {
    id: "compatibility-copy-personalization",
    title: "Compatibility copy personalization",
    category: "content",
    status: "Ready for review",
    currentState: "Compatibility result copy персонализируется и покрыта QA.",
    evidence: [
      "lib/zodiac-compatibility-copy-personalization.ts",
      "scripts/qa-zodiac-compatibility-copy-personalization.mjs",
      "Package 176 commit 685bc1b",
    ],
    missingBeforeLaunch: ["не блокирует paid MVP", "оставить existing QA зелёным"],
  },
  {
    id: "vip-couple-calendar-personalization",
    title: "VIP Couple Calendar personalization",
    category: "content",
    status: "Ready for review",
    currentState: "30 дней пары персонализированы и покрыты отдельной QA.",
    evidence: [
      "lib/zodiac-couple-calendar-personalization.ts",
      "scripts/qa-aphrodite-vip-couple-calendar-personalization.mjs",
      "Package 160+ personalization layer",
    ],
    missingBeforeLaunch: ["оставить персонализацию без одинаковых повторов", "не открывать платный доступ"],
  },
];

const blockers: AphroditeFirstPaidMvpBlocker[] = [
  {
    id: "database-url-not-configured",
    title: "DATABASE_URL not configured",
    area: "production",
    severity: "critical",
    reason: "Без DATABASE_URL нельзя проверять real persistence, ledger writes или entitlement storage.",
    requiredBeforeLaunch: ["configure DATABASE_URL", "run production safety", "verify backup"],
  },
  {
    id: "telegram-bot-token-not-configured",
    title: "TELEGRAM_BOT_TOKEN not configured",
    area: "production",
    severity: "critical",
    reason: "Без bot token нельзя безопасно готовить Telegram Stars live path или Telegram API review.",
    requiredBeforeLaunch: ["configure TELEGRAM_BOT_TOKEN", "review bot permissions", "run safety check"],
  },
  {
    id: "backup-older-than-24h",
    title: "backup older than 24h",
    area: "production",
    severity: "critical",
    reason: "Перед любым DB write нужен свежий backup младше 24 часов.",
    requiredBeforeLaunch: ["create fresh backup", "verify backup manifest", "repeat production safety"],
  },
  {
    id: "no-live-payment-approval",
    title: "no live payment approval",
    area: "payment",
    severity: "critical",
    reason: "Owner approval на live payment не выдан.",
    requiredBeforeLaunch: ["owner review", "go/no-go approval", "release checklist"],
  },
  {
    id: "no-live-telegram-stars-invoice",
    title: "no live Telegram Stars invoice",
    area: "payment",
    severity: "critical",
    reason: "Существует только invoice skeleton; live invoice не создаётся.",
    requiredBeforeLaunch: ["Telegram Stars implementation package", "Telegram API review", "owner approval"],
  },
  {
    id: "no-active-entitlement-storage",
    title: "no active entitlement storage",
    area: "entitlement",
    severity: "critical",
    reason: "Entitlement storage описан, но не активен как verified source of truth.",
    requiredBeforeLaunch: ["storage implementation", "server-side entitlement check", "security QA"],
  },
  {
    id: "no-real-db-persistence",
    title: "no real DB persistence",
    area: "production",
    severity: "critical",
    reason: "Package 178 не пишет в database и не создаёт persistence для paid state.",
    requiredBeforeLaunch: ["DB schema review", "migration review", "fresh backup", "idempotency QA"],
  },
  {
    id: "no-support-refund-policy-finalized",
    title: "no support/refund policy finalized",
    area: "support",
    severity: "high",
    reason: "Платный MVP нельзя запускать без support, refund, revoke и dispute wording.",
    requiredBeforeLaunch: ["Package 179", "support/refund policy", "owner review"],
  },
  {
    id: "no-analytics-event-pipeline-finalized",
    title: "no analytics event pipeline finalized",
    area: "analytics",
    severity: "high",
    reason: "Paid funnel events и refund/support events ещё не финализированы.",
    requiredBeforeLaunch: ["paid funnel taxonomy", "privacy review", "dashboard QA"],
  },
  {
    id: "owner-review-not-approved",
    title: "owner review not approved",
    area: "security",
    severity: "critical",
    reason: "Owner review gate существует, но не является launch approval в Package 178.",
    requiredBeforeLaunch: ["manual owner approval", "separate production package", "green safety checks"],
  },
];

const checklist: AphroditeFirstPaidMvpChecklistItem[] = [
  {
    id: "product-shape",
    label: "Product readiness описана",
    status: "pass",
    launchRequired: true,
    note: "Каталог, free preview и Full Love Report shape готовы к review.",
  },
  {
    id: "payment-readiness",
    label: "Payment readiness описана",
    status: "blocked",
    launchRequired: true,
    note: "Есть skeleton/mock/design, но live payment approval и Stars invoice отсутствуют.",
  },
  {
    id: "entitlement-readiness",
    label: "Entitlement readiness описана",
    status: "blocked",
    launchRequired: true,
    note: "Entitlement design/mock есть, но active storage и real grant отсутствуют.",
  },
  {
    id: "content-readiness",
    label: "Content readiness описана",
    status: "pass",
    launchRequired: false,
    note: "Daily/weekly/monthly, compatibility copy и VIP Couple Calendar покрыты QA.",
  },
  {
    id: "support-refund-readiness",
    label: "Support/refund readiness описана",
    status: "blocked",
    launchRequired: true,
    note: "Support/refund policy не финализирована; Package 179 рекомендован следующим.",
  },
  {
    id: "analytics-readiness",
    label: "Analytics readiness описана",
    status: "blocked",
    launchRequired: true,
    note: "Базовая аналитика есть, но paid funnel pipeline не финализирован.",
  },
  {
    id: "production-env-readiness",
    label: "Production env/backup blockers описаны",
    status: "production-env-required",
    launchRequired: true,
    note: "DATABASE_URL, TELEGRAM_BOT_TOKEN и backup freshness остаются обязательными blockers.",
  },
  {
    id: "owner-review",
    label: "Owner review требуется",
    status: "owner-review-required",
    launchRequired: true,
    note: "Paid MVP не разрешён к запуску без отдельного ручного approval.",
  },
];

const boundaries: AphroditeFirstPaidMvpSafetyBoundary[] = APHRODITE_FIRST_PAID_MVP_SAFETY_LABELS.map((label) => ({
  id: label
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-|-$/g, ""),
  visibleLabel: label,
  allowedNow: ["readiness review", "локальная QA", "dashboard documentation"],
  blockedNow: ["payment runtime", "VIP unlock", "entitlement creation", "DB write", "Telegram API", "production launch"],
}));

const nextSteps: AphroditeFirstPaidMvpNextStep[] = [
  {
    package: "Package 179",
    title: "Support & Refund Policy Readiness",
    purpose:
      "Закрыть support/refund/revoke/dispute policy перед любым будущим paid MVP launch review.",
    mustNotDo: [
      "не включать оплату",
      "не отправлять Telegram Stars invoice",
      "не создавать entitlement",
      "не открывать VIP",
      "не писать в database",
    ],
  },
];

export function getAphroditeFirstPaidMvpReadinessAreas(): AphroditeFirstPaidMvpReadinessArea[] {
  return readinessAreas.map((area) => ({
    ...area,
    evidence: area.evidence.slice(),
    missingBeforeLaunch: area.missingBeforeLaunch.slice(),
  }));
}

export function getAphroditeFirstPaidMvpBlockers(): AphroditeFirstPaidMvpBlocker[] {
  return blockers.map((blocker) => ({
    ...blocker,
    requiredBeforeLaunch: blocker.requiredBeforeLaunch.slice(),
  }));
}

export function getAphroditeFirstPaidMvpGoNoGoChecklist(): AphroditeFirstPaidMvpChecklistItem[] {
  return checklist.map((item) => ({ ...item }));
}

export function getAphroditeFirstPaidMvpSafetyBoundaries(): AphroditeFirstPaidMvpSafetyBoundary[] {
  return boundaries.map((boundary) => ({
    ...boundary,
    allowedNow: boundary.allowedNow.slice(),
    blockedNow: boundary.blockedNow.slice(),
  }));
}

export function getAphroditeFirstPaidMvpNextSteps(): AphroditeFirstPaidMvpNextStep[] {
  return nextSteps.map((step) => ({
    ...step,
    mustNotDo: step.mustNotDo.slice(),
  }));
}
