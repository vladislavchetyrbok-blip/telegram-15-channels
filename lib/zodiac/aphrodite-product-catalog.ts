/**
 * Aphrodite product catalog finalization (Package 162).
 *
 * Static source of truth only. This file deliberately does not implement
 * payments, Telegram invoices, successful payment handlers, VIP unlocks,
 * entitlement creation, persistence, schema changes, Telegram API calls,
 * production launch, external AI calls, posting, or scheduling.
 */

export type AphroditeProductId =
  | "free-love-reading-preview"
  | "full-love-report"
  | "vip-love-access"
  | "ai-future-timeline-vip"
  | "soulmate-scanner-vip"
  | "red-flags-scanner-vip"
  | "birth-matrix-free-preview"
  | "birth-matrix-vip"
  | "natal-chart-vip"
  | "vip-couple-calendar"
  | "vip-numerology"
  | "daily-message-from-universe"
  | "compatibility-free-preview";

export type AphroditeProductAccessLevel =
  | "free"
  | "free-preview"
  | "future-vip-locked"
  | "future-paid-locked"
  | "dashboard-review-only"
  | "owner-review-required";

export type AphroditeProductReadiness =
  | "live-free-preview"
  | "preview-ready"
  | "catalog-ready"
  | "requires-guard"
  | "requires-entitlement"
  | "requires-payment-ledger"
  | "requires-owner-review"
  | "not-ready-for-production";

export type AphroditeRiskLevel = "low" | "medium" | "high" | "critical";

export type AphroditeProductCatalogItem = {
  id: AphroditeProductId;
  publicName: string;
  shortLabel: string;
  accessLevel: AphroditeProductAccessLevel;
  readiness: AphroditeProductReadiness[];
  route: string;
  fallbackRoute: string;
  freeFallbackMessage: string;
  guardRequired: boolean;
  entitlementRequired: boolean;
  paymentRequired: boolean;
  paymentEnabledNow: false;
  vipUnlockEnabledNow: false;
  includedInFreeFunnel: boolean;
  includedInFuturePaywall: boolean;
  ownerReviewRequired: boolean;
  paywallReadiness: string;
  paymentReadinessStatus: string;
  entitlementReadinessStatus: string;
  launchReadiness: string;
  description: string;
  userValue: string[];
  whatRemainsFree: string[];
  mustStayLockedUntil: string[];
  blockedUntil: string[];
  riskLevel: AphroditeRiskLevel;
};

export type AphroditeProductCatalogRule = {
  id: string;
  label: string;
  visibleRule: string;
  appliesTo: AphroditeProductId[];
  blockedUntil: string[];
};

export type AphroditeProductCatalogBoundary = {
  area: string;
  visibleLabel: string;
  dataBoundary: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: AphroditeRiskLevel;
};

export type AphroditeProductCatalogNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_PRODUCT_CATALOG_CLASSIFICATION =
  "Только каталог продуктов / VIP не открывается / Нет оплаты";

export const APHRODITE_PRODUCT_CATALOG_RULE =
  "Каталог продуктов является только источником истины. Он решает, какие продукты существуют и как они классифицированы, но не открывает доступ, не списывает оплату, не создаёт entitlement и не вызывает Telegram API.";

export const APHRODITE_PRODUCT_CATALOG_MAIN_MINIAPP_ROUTE = "/miniapp";
export const APHRODITE_PRODUCT_CATALOG_FREE_FALLBACK_ROUTE = "/miniapp/love-reading-preview";

export const APHRODITE_PRODUCT_CATALOG_SAFETY_LABELS = [
  "Нет реальной VIP-разблокировки",
  "Нет оплаты",
  "Нет Telegram Stars invoice",
  "Нет successful_payment handler",
  "Нет entitlement creation",
  "Нет записи в базу данных",
  "Нет миграции схемы базы данных",
  "Нет вызова Telegram API",
  "Нет production-запуска",
  "Каталог не открывает VIP",
] as const;

const FUTURE_PRODUCT_IDS = [
  "full-love-report",
  "vip-love-access",
  "ai-future-timeline-vip",
  "soulmate-scanner-vip",
  "red-flags-scanner-vip",
  "birth-matrix-vip",
  "natal-chart-vip",
  "vip-couple-calendar",
  "vip-numerology",
] as const satisfies readonly AphroditeProductId[];

const FREE_PRODUCT_IDS = [
  "free-love-reading-preview",
  "birth-matrix-free-preview",
  "daily-message-from-universe",
  "compatibility-free-preview",
] as const satisfies readonly AphroditeProductId[];

const DEFAULT_FREE_FALLBACK_MESSAGE =
  "Если будущий VIP-доступ недоступен, пользователь должен вернуться в бесплатный Love Reading preview без оплаты и без потери контекста.";

const FUTURE_LOCK_BLOCKERS = [
  "Package 163 — Payment Ledger Design",
  "будущий server-side guard",
  "будущий entitlement checker",
  "owner review перед запуском",
  "отдельная QA-проверка fallback",
];

function freePreviewItem(input: {
  id: AphroditeProductId;
  publicName: string;
  shortLabel: string;
  route: string;
  description: string;
  userValue: string[];
  whatRemainsFree: string[];
  riskLevel?: AphroditeRiskLevel;
}): AphroditeProductCatalogItem {
  return {
    id: input.id,
    publicName: input.publicName,
    shortLabel: input.shortLabel,
    accessLevel: "free-preview",
    readiness: ["live-free-preview", "catalog-ready"],
    route: input.route,
    fallbackRoute: input.route,
    freeFallbackMessage: "Этот продукт остаётся бесплатным preview и не требует VIP-доступа.",
    guardRequired: false,
    entitlementRequired: false,
    paymentRequired: false,
    paymentEnabledNow: false,
    vipUnlockEnabledNow: false,
    includedInFreeFunnel: true,
    includedInFuturePaywall: false,
    ownerReviewRequired: false,
    paywallReadiness: "Не входит в paywall сейчас.",
    paymentReadinessStatus: "Оплата не требуется.",
    entitlementReadinessStatus: "Entitlement не требуется.",
    launchReadiness: "Можно оставлять открытым как бесплатный preview.",
    description: input.description,
    userValue: input.userValue,
    whatRemainsFree: input.whatRemainsFree,
    mustStayLockedUntil: ["будущая VIP-глубина, если она появится, должна быть отдельным locked layer"],
    blockedUntil: [],
    riskLevel: input.riskLevel ?? "medium",
  };
}

function futureVipItem(input: {
  id: AphroditeProductId;
  publicName: string;
  shortLabel: string;
  route: string;
  accessLevel?: Extract<AphroditeProductAccessLevel, "future-vip-locked" | "future-paid-locked">;
  description: string;
  userValue: string[];
  mustStayLockedUntil?: string[];
  riskLevel?: AphroditeRiskLevel;
  ownerReviewReason?: string;
}): AphroditeProductCatalogItem {
  return {
    id: input.id,
    publicName: input.publicName,
    shortLabel: input.shortLabel,
    accessLevel: input.accessLevel ?? "future-vip-locked",
    readiness: [
      "catalog-ready",
      "requires-guard",
      "requires-entitlement",
      "requires-payment-ledger",
      "requires-owner-review",
      "not-ready-for-production",
    ],
    route: input.route,
    fallbackRoute: APHRODITE_PRODUCT_CATALOG_FREE_FALLBACK_ROUTE,
    freeFallbackMessage: DEFAULT_FREE_FALLBACK_MESSAGE,
    guardRequired: true,
    entitlementRequired: true,
    paymentRequired: true,
    paymentEnabledNow: false,
    vipUnlockEnabledNow: false,
    includedInFreeFunnel: false,
    includedInFuturePaywall: true,
    ownerReviewRequired: true,
    paywallReadiness: "Описан для будущего paywall, но не подключён к оплате.",
    paymentReadinessStatus: "Оплата отключена до отдельного payment ledger package.",
    entitlementReadinessStatus: "Требуется будущий server-side entitlement, сейчас не создаётся.",
    launchReadiness: input.ownerReviewReason ?? "Не готов к production до owner review и будущей server-side проверки.",
    description: input.description,
    userValue: input.userValue,
    whatRemainsFree: [
      "вход в Mini App",
      "бесплатный Love Reading preview",
      "базовые бесплатные preview-экраны",
    ],
    mustStayLockedUntil: input.mustStayLockedUntil ?? FUTURE_LOCK_BLOCKERS.slice(),
    blockedUntil: FUTURE_LOCK_BLOCKERS.slice(),
    riskLevel: input.riskLevel ?? "critical",
  };
}

const catalog: AphroditeProductCatalogItem[] = [
  freePreviewItem({
    id: "free-love-reading-preview",
    publicName: "Free Love Reading Preview",
    shortLabel: "Love Reading preview",
    route: APHRODITE_PRODUCT_CATALOG_FREE_FALLBACK_ROUTE,
    description: "Бесплатный первый результат Aphrodite: мягкий разбор связи без оплаты, без VIP-доступа и без внешних AI-вызовов.",
    userValue: [
      "главная энергия связи",
      "одна сильная сторона",
      "одна зона риска",
      "бережный следующий шаг",
    ],
    whatRemainsFree: ["сам preview", "возврат в Mini App", "переход к базовым бесплатным модулям"],
    riskLevel: "low",
  }),
  futureVipItem({
    id: "full-love-report",
    publicName: "Full Love Report",
    shortLabel: "Full Love Report",
    accessLevel: "future-paid-locked",
    route: "future:/miniapp/full-love-report",
    description: "Будущий полный любовный отчёт с расширенной глубиной. Сейчас он описан только в каталоге и fallback-карте.",
    userValue: [
      "что он/она может чувствовать",
      "почему он/она может отдаляться",
      "30-дневный прогноз",
      "red flags",
      "личные рекомендации",
    ],
  }),
  futureVipItem({
    id: "vip-love-access",
    publicName: "VIP Love Access",
    shortLabel: "VIP Love",
    accessLevel: "future-paid-locked",
    route: "future:/miniapp/vip-love-access",
    description: "Будущий короткий VIP-доступ к любовным разделам. Сейчас не открывает закрытый контент.",
    userValue: [
      "единый доступ к будущим любовным VIP-разделам",
      "понятное разделение free preview и будущей глубины",
      "fallback в бесплатный preview при deny",
    ],
  }),
  futureVipItem({
    id: "ai-future-timeline-vip",
    publicName: "AI Future Timeline VIP",
    shortLabel: "Future Timeline",
    route: "future:/miniapp/ai-future-timeline",
    description: "Будущий сценарный таймлайн отношений. Требует owner review, safety review и отдельного решения по AI-провайдеру.",
    userValue: [
      "возможные сценарии развития связи",
      "мягкие точки выбора",
      "предупреждение о рисках без обещания точного будущего",
    ],
    riskLevel: "high",
    ownerReviewReason: "Не готов к production до owner review, safety review текста и решения по внешнему AI.",
  }),
  futureVipItem({
    id: "soulmate-scanner-vip",
    publicName: "Soulmate Scanner VIP",
    shortLabel: "Soulmate Scanner",
    route: "future:/miniapp/soulmate-scanner",
    description: "Будущий совместимый разбор soulmate-сигналов. Сейчас остаётся locked teaser/foundation.",
    userValue: [
      "ключевые точки эмоционального совпадения",
      "темы притяжения",
      "бережные проверки реальности",
    ],
    riskLevel: "high",
  }),
  futureVipItem({
    id: "red-flags-scanner-vip",
    publicName: "Red Flags Scanner VIP",
    shortLabel: "Red Flags",
    route: "future:/miniapp/red-flags-scanner",
    description: "Будущий safety-sensitive разбор красных флагов. Требует отдельного owner review до любого запуска.",
    userValue: [
      "бережное перечисление зон внимания",
      "мягкий язык без диагнозов",
      "подсказки, когда нужен реальный разговор или помощь",
    ],
    riskLevel: "critical",
    ownerReviewReason: "Не готов к production до owner review, safety review и юридически аккуратного текста.",
  }),
  freePreviewItem({
    id: "birth-matrix-free-preview",
    publicName: "Бесплатная Матрица судьбы",
    shortLabel: "Матрица preview",
    route: "/birth-matrix",
    description: "Базовая Матрица судьбы остаётся бесплатным preview с вводом даты рождения и символической интерпретацией.",
    userValue: [
      "символическая матрица по дате рождения",
      "базовые числа и фокус",
      "сохранение и sharing без оплаты",
    ],
    whatRemainsFree: ["route /birth-matrix", "базовый расчёт", "общий ввод даты рождения"],
    riskLevel: "medium",
  }),
  futureVipItem({
    id: "birth-matrix-vip",
    publicName: "Birth Matrix VIP",
    shortLabel: "Matrix VIP",
    route: "future:/birth-matrix/vip",
    description: "Будущая VIP-глубина Матрицы судьбы. Базовый preview должен оставаться бесплатным.",
    userValue: [
      "углублённые разделы матрицы",
      "дополнительные интерпретации",
      "future VIP layer поверх бесплатной базы",
    ],
    riskLevel: "high",
  }),
  futureVipItem({
    id: "natal-chart-vip",
    publicName: "Natal Chart VIP",
    shortLabel: "Natal VIP",
    route: "future:/miniapp/natal-chart-vip",
    description: "Будущая VIP-натальная карта. Сейчас точный астрологический движок и entitlement не подключены.",
    userValue: [
      "расширенная символическая карта",
      "любовный стиль",
      "месячные акценты",
      "честный статус exact-unavailable",
    ],
    riskLevel: "high",
  }),
  futureVipItem({
    id: "vip-couple-calendar",
    publicName: "VIP Couple Calendar / 30 дней пары",
    shortLabel: "30 дней пары",
    route: "future:/miniapp/vip-couple-calendar",
    description: "Будущий персонализированный календарь пары на 30 дней. Сейчас не должен становиться paid unlock без server-side guard.",
    userValue: [
      "30 персональных дней пары",
      "темы дня",
      "энергия и риск",
      "мягкое действие для двоих",
    ],
    riskLevel: "critical",
  }),
  futureVipItem({
    id: "vip-numerology",
    publicName: "VIP Numerology",
    shortLabel: "Нумерология VIP",
    route: "future:/miniapp/vip-numerology",
    description: "Будущая расширенная нумерология. Сейчас дата и имя не создают доступ и не пишутся в базу.",
    userValue: [
      "число пути",
      "число имени",
      "личный месяц",
      "практический совет",
    ],
    riskLevel: "high",
  }),
  {
    ...freePreviewItem({
      id: "daily-message-from-universe",
      publicName: "Daily Message From Universe",
      shortLabel: "Послание дня",
      route: APHRODITE_PRODUCT_CATALOG_MAIN_MINIAPP_ROUTE,
      description: "Ежедневное мягкое послание внутри free funnel. Оно не является VIP и не требует оплаты.",
      userValue: ["быстрый вход в день", "бережная подсказка", "возврат в Mini App"],
      whatRemainsFree: ["главный Mini App route", "ежедневный free touchpoint", "базовая навигация"],
      riskLevel: "low",
    }),
    accessLevel: "free",
    readiness: ["live-free-preview", "catalog-ready"],
    fallbackRoute: APHRODITE_PRODUCT_CATALOG_MAIN_MINIAPP_ROUTE,
    freeFallbackMessage: "Этот ежедневный free touchpoint должен оставаться открытым.",
  },
  freePreviewItem({
    id: "compatibility-free-preview",
    publicName: "Бесплатная совместимость",
    shortLabel: "Совместимость",
    route: "/compatibility",
    description: "Базовая совместимость остаётся бесплатным preview и не должна падать при будущих deny по VIP.",
    userValue: [
      "проверка связи",
      "базовые scores",
      "relationship forms без оплаты",
    ],
    whatRemainsFree: ["route /compatibility", "базовый расчёт совместимости", "безопасный возврат в Mini App"],
    riskLevel: "medium",
  }),
];

export function getAphroditeProductCatalog(): AphroditeProductCatalogItem[] {
  return catalog.map((item) => ({
    ...item,
    readiness: item.readiness.slice(),
    userValue: item.userValue.slice(),
    whatRemainsFree: item.whatRemainsFree.slice(),
    mustStayLockedUntil: item.mustStayLockedUntil.slice(),
    blockedUntil: item.blockedUntil.slice(),
  }));
}

export function getAphroditeProductCatalogRules(): AphroditeProductCatalogRule[] {
  return [
    {
      id: "free-preview-open",
      label: "Free preview remains open",
      visibleRule: "Бесплатный preview остаётся открытым и не требует оплаты, VIP или entitlement.",
      appliesTo: FREE_PRODUCT_IDS.slice(),
      blockedUntil: [],
    },
    {
      id: "future-vip-locked",
      label: "Future VIP products remain locked",
      visibleRule: "Будущие VIP-продукты остаются закрытыми до server-side guard, payment ledger, entitlement и owner review.",
      appliesTo: FUTURE_PRODUCT_IDS.slice(),
      blockedUntil: FUTURE_LOCK_BLOCKERS.slice(),
    },
    {
      id: "payment-disabled-now",
      label: "Payment is disabled now",
      visibleRule: "Оплата отключена сейчас для всех продуктов каталога.",
      appliesTo: catalog.map((item) => item.id),
      blockedUntil: ["Package 163 — Payment Ledger Design", "отдельный payment package", "owner review"],
    },
    {
      id: "vip-unlock-disabled-now",
      label: "VIP unlock is disabled now",
      visibleRule: "Реальная VIP-разблокировка отключена сейчас для всех продуктов каталога.",
      appliesTo: catalog.map((item) => item.id),
      blockedUntil: ["будущий entitlement checker", "server-side guard", "owner review"],
    },
    {
      id: "entitlement-disabled-now",
      label: "Entitlement creation is disabled now",
      visibleRule: "Создание entitlement отключено сейчас: каталог только описывает будущие требования.",
      appliesTo: catalog.map((item) => item.id),
      blockedUntil: ["DB schema package", "payment ledger package", "owner review"],
    },
    {
      id: "future-vip-fallback-required",
      label: "Every future VIP product must have fallback route",
      visibleRule: "Каждый будущий VIP-продукт обязан иметь fallback route в бесплатный preview.",
      appliesTo: FUTURE_PRODUCT_IDS.slice(),
      blockedUntil: ["fallback route подтверждён", "negative QA подтверждена"],
    },
    {
      id: "future-paid-guard-required",
      label: "Every future paid product must require future guard",
      visibleRule: "Каждый будущий paid/VIP-продукт требует будущий guard и не может открываться клиентским флагом.",
      appliesTo: FUTURE_PRODUCT_IDS.slice(),
      blockedUntil: ["server-side guard", "negative QA на client-side bypass"],
    },
    {
      id: "future-paid-entitlement-required",
      label: "Every future paid product must require future entitlement",
      visibleRule: "Каждый будущий paid/VIP-продукт требует будущий entitlement, связанный с userRef и productId.",
      appliesTo: FUTURE_PRODUCT_IDS.slice(),
      blockedUntil: ["entitlement model", "expiration/revocation checks", "ledger binding"],
    },
    {
      id: "owner-review-before-paid-production",
      label: "No product can be production-paid without owner review",
      visibleRule: "Ни один продукт не может стать production-paid без owner review и отдельного запуска.",
      appliesTo: catalog.map((item) => item.id),
      blockedUntil: ["owner review", "production safety PASS", "отдельный launch package"],
    },
  ];
}

export function getAphroditeProductCatalogBoundaries(): AphroditeProductCatalogBoundary[] {
  return [
    {
      area: "VIP unlock",
      visibleLabel: "Нет реальной VIP-разблокировки",
      dataBoundary: "no-real-vip-unlock",
      allowedNow: ["описать продукт", "показать catalog status", "показать fallback route"],
      blockedUntil: ["server-side entitlement", "payment ledger", "owner review"],
      riskLevel: "critical",
    },
    {
      area: "Payment",
      visibleLabel: "Нет оплаты",
      dataBoundary: "no-payment",
      allowedNow: ["зафиксировать paymentRequired для будущих продуктов", "держать paymentEnabledNow=false"],
      blockedUntil: ["Package 163 — Payment Ledger Design", "отдельный payment package"],
      riskLevel: "critical",
    },
    {
      area: "Telegram Stars",
      visibleLabel: "Нет Telegram Stars invoice",
      dataBoundary: "no-stars-invoice",
      allowedNow: ["показать safety label"],
      blockedUntil: ["отдельный invoice package", "owner review"],
      riskLevel: "critical",
    },
    {
      area: "Payment update",
      visibleLabel: "Нет successful_payment handler",
      dataBoundary: "no-successful-payment-handler",
      allowedNow: ["описать будущую необходимость ledger"],
      blockedUntil: ["отдельный webhook/payment package"],
      riskLevel: "critical",
    },
    {
      area: "Entitlement",
      visibleLabel: "Нет entitlement creation",
      dataBoundary: "no-entitlement-creation",
      allowedNow: ["указать entitlementRequired=true для будущих VIP-продуктов"],
      blockedUntil: ["DB schema package", "ledger", "server-side checker"],
      riskLevel: "critical",
    },
    {
      area: "Database write",
      visibleLabel: "Нет записи в базу данных",
      dataBoundary: "no-database-write",
      allowedNow: ["статический TypeScript-каталог", "dashboard read-only"],
      blockedUntil: ["schema review", "migration review", "backup"],
      riskLevel: "critical",
    },
    {
      area: "Database schema",
      visibleLabel: "Нет миграции схемы базы данных",
      dataBoundary: "no-database-schema-migration",
      allowedNow: ["не менять schema", "не добавлять migrations"],
      blockedUntil: ["отдельный DB package"],
      riskLevel: "critical",
    },
    {
      area: "Telegram API",
      visibleLabel: "Нет вызова Telegram API",
      dataBoundary: "no-telegram-api-call",
      allowedNow: ["статическое отображение каталога"],
      blockedUntil: ["отдельный Telegram integration package"],
      riskLevel: "critical",
    },
    {
      area: "Production launch",
      visibleLabel: "Нет production-запуска",
      dataBoundary: "no-production-launch",
      allowedNow: ["catalog readiness", "manual review"],
      blockedUntil: ["owner launch checklist", "production safety PASS"],
      riskLevel: "high",
    },
    {
      area: "Catalog only",
      visibleLabel: "Каталог не открывает VIP",
      dataBoundary: "catalog-does-not-open-vip",
      allowedNow: ["источник истины", "readiness matrix", "fallback map reference"],
      blockedUntil: ["будущий production guard", "будущий entitlement checker"],
      riskLevel: "critical",
    },
  ];
}

export function getAphroditeProductCatalogNextSteps(): AphroditeProductCatalogNextStep[] {
  return [
    {
      package: "Package 163",
      title: "Payment Ledger Design",
      purpose: "Спроектировать будущий ledger для платежей до любого Telegram Stars invoice, successful_payment handler или создания entitlement.",
      blockedUntil: [
        "Package 162 принят владельцем",
        "каталог продуктов подтверждён",
        "границы no payment/no VIP unlock подтверждены",
      ],
    },
  ];
}

export function getAphroditeProductById(id: AphroditeProductId): AphroditeProductCatalogItem | undefined {
  return getAphroditeProductCatalog().find((item) => item.id === id);
}

export function getAphroditeFreeProducts(): AphroditeProductCatalogItem[] {
  return getAphroditeProductCatalog().filter((item) => item.accessLevel === "free" || item.accessLevel === "free-preview");
}

export function getAphroditeFutureVipProducts(): AphroditeProductCatalogItem[] {
  return getAphroditeProductCatalog().filter((item) => item.accessLevel === "future-vip-locked" || item.accessLevel === "future-paid-locked");
}
