/**
 * Aphrodite VIP free preview fallback map (Package 161).
 *
 * Static readiness model only. This file does not connect the VIP guard to
 * production flows and does not implement payments, Telegram invoices,
 * successful payment handlers, VIP unlocks, entitlement creation, persistence,
 * schema changes, Telegram API calls, production launch, AI calls, posting, or
 * scheduling.
 */

export type AphroditeVipFallbackProduct =
  | "full-love-report"
  | "vip-love-access"
  | "ai-future-timeline-vip"
  | "soulmate-scanner-vip"
  | "red-flags-scanner-vip"
  | "birth-matrix-vip"
  | "natal-chart-vip"
  | "vip-couple-calendar"
  | "vip-numerology";

export type AphroditeVipFallbackSurfaceType =
  | "route"
  | "component"
  | "api-route"
  | "server-action"
  | "dashboard"
  | "documentation"
  | "qa";

export type AphroditeVipFallbackAction =
  | "show-free-preview"
  | "show-locked-teaser"
  | "redirect-to-free-preview"
  | "deny-with-safe-message"
  | "owner-review-required"
  | "keep-open";

export type AphroditeVipFallbackSurface = {
  id: string;
  product: AphroditeVipFallbackProduct | "free-preview";
  label: string;
  surfaceType: AphroditeVipFallbackSurfaceType;
  fileOrRoute: string;
  currentState: string;
  fallbackAction: AphroditeVipFallbackAction;
  fallbackRoute: string;
  visibleFallbackMessage: string;
  freePreviewAvailable: boolean;
  mustRemainOpen: boolean;
  futureGuardRequired: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeVipFallbackRule = {
  id: string;
  label: string;
  visibleRule: string;
  appliesTo: string[];
  blockedFailureModes: string[];
  requiredBeforeRealVip: string[];
};

export type AphroditeVipFallbackQaItem = {
  id: string;
  label: string;
  mustPass: string[];
  mustFailIf: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeVipFallbackBoundary = {
  area: string;
  visibleLabel: string;
  dataBoundary: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeVipFallbackNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_VIP_FALLBACK_CLASSIFICATION =
  "Только карта fallback / VIP не открывается / Нет оплаты";

export const APHRODITE_VIP_FREE_PREVIEW_FALLBACK_ROUTE = "/miniapp/love-reading-preview";

export const APHRODITE_VIP_FALLBACK_DEFAULT_MESSAGE =
  "Полная версия пока закрыта. Сейчас доступен бесплатный preview без оплаты.";

export const APHRODITE_VIP_FALLBACK_FUTURE_MESSAGE =
  "Этот раздел будет открываться только после server-side проверки доступа. Сейчас он показан как preview.";

export const APHRODITE_VIP_FALLBACK_OWNER_REVIEW_MESSAGE =
  "Перед запуском этого раздела нужен owner review и отдельная проверка оплаты.";

const REQUIRED_BEFORE_REAL_VIP = [
  "server-side entitlement check по userRef и productId",
  "payment ledger guard",
  "expiration/revocation guard",
  "owner review gate",
  "free preview fallback при deny",
  "negative QA на client-side обходы",
] as const;

const BLOCKED_FAILURE_MODES = [
  "blank screen",
  "unhandled exception",
  "client-only unlock",
  "localStorage VIP bypass",
  "query param VIP bypass",
  "mock payment success bypass",
  "manual route guessing",
  "hardcoded allowed=true",
  "lost user after denied access",
] as const;

function vipFallbackSurface(input: {
  id: string;
  product: AphroditeVipFallbackProduct;
  label: string;
  surfaceType: AphroditeVipFallbackSurfaceType;
  fileOrRoute: string;
  currentState: string;
  fallbackAction?: AphroditeVipFallbackAction;
  visibleFallbackMessage?: string;
  riskLevel?: "low" | "medium" | "high" | "critical";
}): AphroditeVipFallbackSurface {
  return {
    id: input.id,
    product: input.product,
    label: input.label,
    surfaceType: input.surfaceType,
    fileOrRoute: input.fileOrRoute,
    currentState: input.currentState,
    fallbackAction: input.fallbackAction ?? "redirect-to-free-preview",
    fallbackRoute: APHRODITE_VIP_FREE_PREVIEW_FALLBACK_ROUTE,
    visibleFallbackMessage: input.visibleFallbackMessage ?? APHRODITE_VIP_FALLBACK_DEFAULT_MESSAGE,
    freePreviewAvailable: true,
    mustRemainOpen: false,
    futureGuardRequired: true,
    riskLevel: input.riskLevel ?? "critical",
  };
}

export function getAphroditeVipFallbackSurfaces(): AphroditeVipFallbackSurface[] {
  return [
    {
      id: "miniapp-free-funnel",
      product: "free-preview",
      label: "Основной вход Mini App",
      surfaceType: "route",
      fileOrRoute: "/miniapp",
      currentState: "Открытый free funnel с входом в AI Love Reading preview и другие бесплатные модули.",
      fallbackAction: "keep-open",
      fallbackRoute: "/miniapp",
      visibleFallbackMessage: "Этот вход должен оставаться открытым. VIP-доступ здесь не проверяется.",
      freePreviewAvailable: true,
      mustRemainOpen: true,
      futureGuardRequired: false,
      riskLevel: "critical",
    },
    {
      id: "free-love-reading-preview",
      product: "free-preview",
      label: "Free Love Reading Preview",
      surfaceType: "route",
      fileOrRoute: "/miniapp/love-reading-preview",
      currentState: "Основной безопасный fallback после любого deny по будущему VIP-доступу.",
      fallbackAction: "show-free-preview",
      fallbackRoute: APHRODITE_VIP_FREE_PREVIEW_FALLBACK_ROUTE,
      visibleFallbackMessage: "Бесплатный preview доступен без оплаты и без VIP-разблокировки.",
      freePreviewAvailable: true,
      mustRemainOpen: true,
      futureGuardRequired: false,
      riskLevel: "critical",
    },
    {
      id: "free-preview-cards",
      product: "free-preview",
      label: "Free preview cards",
      surfaceType: "component",
      fileOrRoute: "app/miniapp/page.tsx и preview-блоки dashboard",
      currentState: "Карточки должны объяснять ценность продукта и вести к бесплатному preview, не открывая платный результат.",
      fallbackAction: "keep-open",
      fallbackRoute: APHRODITE_VIP_FREE_PREVIEW_FALLBACK_ROUTE,
      visibleFallbackMessage: "Откройте бесплатный preview, чтобы не потерять контекст.",
      freePreviewAvailable: true,
      mustRemainOpen: true,
      futureGuardRequired: false,
      riskLevel: "high",
    },
    {
      id: "basic-birth-matrix-preview",
      product: "free-preview",
      label: "Basic Birth Matrix preview",
      surfaceType: "route",
      fileOrRoute: "/birth-matrix",
      currentState: "Базовая матрица и ввод даты рождения остаются бесплатными; будущая VIP-глубина должна быть отдельным locked layer.",
      fallbackAction: "keep-open",
      fallbackRoute: "/birth-matrix",
      visibleFallbackMessage: "Базовая матрица доступна бесплатно. VIP-глубина будет подключаться отдельно.",
      freePreviewAvailable: true,
      mustRemainOpen: true,
      futureGuardRequired: false,
      riskLevel: "high",
    },
    {
      id: "basic-compatibility-preview",
      product: "free-preview",
      label: "Basic compatibility preview",
      surfaceType: "route",
      fileOrRoute: "/compatibility",
      currentState: "Базовая совместимость остаётся бесплатной и не должна падать, если VIP-доступ недоступен.",
      fallbackAction: "keep-open",
      fallbackRoute: "/compatibility",
      visibleFallbackMessage: "Базовая совместимость доступна бесплатно. Полная VIP-версия остаётся закрытой.",
      freePreviewAvailable: true,
      mustRemainOpen: true,
      futureGuardRequired: false,
      riskLevel: "high",
    },
    vipFallbackSurface({
      id: "full-love-report",
      product: "full-love-report",
      label: "Full Love Report",
      surfaceType: "route",
      fileOrRoute: "будущий route полного отчёта",
      currentState: "Сейчас продукт описан как будущая ценность, без реального unlock.",
      visibleFallbackMessage: APHRODITE_VIP_FALLBACK_DEFAULT_MESSAGE,
    }),
    vipFallbackSurface({
      id: "vip-love-access",
      product: "vip-love-access",
      label: "VIP Love Access",
      surfaceType: "component",
      fileOrRoute: "будущие locked sections AI Love Reading",
      currentState: "VIP-глубина может быть показана только как locked teaser.",
      fallbackAction: "show-locked-teaser",
      visibleFallbackMessage: APHRODITE_VIP_FALLBACK_FUTURE_MESSAGE,
    }),
    vipFallbackSurface({
      id: "ai-future-timeline-vip",
      product: "ai-future-timeline-vip",
      label: "AI Future Timeline VIP",
      surfaceType: "dashboard",
      fileOrRoute: "/dashboard/networks/zodiac/ai-future-timeline-foundation",
      currentState: "Spec/foundation и локальный preview без внешнего AI API.",
      fallbackAction: "owner-review-required",
      visibleFallbackMessage: APHRODITE_VIP_FALLBACK_OWNER_REVIEW_MESSAGE,
      riskLevel: "high",
    }),
    vipFallbackSurface({
      id: "soulmate-scanner-vip",
      product: "soulmate-scanner-vip",
      label: "Soulmate Scanner VIP",
      surfaceType: "dashboard",
      fileOrRoute: "/dashboard/networks/zodiac/soulmate-scanner-foundation",
      currentState: "Spec/foundation и teaser, без реального VIP-доступа.",
      visibleFallbackMessage: APHRODITE_VIP_FALLBACK_DEFAULT_MESSAGE,
      riskLevel: "high",
    }),
    vipFallbackSurface({
      id: "red-flags-scanner-vip",
      product: "red-flags-scanner-vip",
      label: "Red Flags Scanner VIP",
      surfaceType: "dashboard",
      fileOrRoute: "/dashboard/networks/zodiac/red-flags-scanner-foundation",
      currentState: "Safety-sensitive teaser, требующий owner review перед любым запуском.",
      fallbackAction: "owner-review-required",
      visibleFallbackMessage: APHRODITE_VIP_FALLBACK_OWNER_REVIEW_MESSAGE,
    }),
    vipFallbackSurface({
      id: "birth-matrix-vip",
      product: "birth-matrix-vip",
      label: "Birth Matrix VIP",
      surfaceType: "component",
      fileOrRoute: "components/ZodiacMysticSections.tsx и /birth-matrix",
      currentState: "Базовая матрица остаётся открытой; VIP-глубина должна уходить в free preview fallback.",
      visibleFallbackMessage: APHRODITE_VIP_FALLBACK_FUTURE_MESSAGE,
      riskLevel: "high",
    }),
    vipFallbackSurface({
      id: "natal-chart-vip",
      product: "natal-chart-vip",
      label: "Natal Chart VIP",
      surfaceType: "component",
      fileOrRoute: "components/ZodiacVipSections.tsx",
      currentState: "VIP natal blocks сейчас mock/free early access; будущий paid layer требует server-side guard.",
      visibleFallbackMessage: APHRODITE_VIP_FALLBACK_FUTURE_MESSAGE,
    }),
    vipFallbackSurface({
      id: "vip-couple-calendar",
      product: "vip-couple-calendar",
      label: "VIP Couple Calendar / 30 дней пары",
      surfaceType: "component",
      fileOrRoute: "components/ZodiacVipSections.tsx и lib/zodiac-couple-calendar-personalization.ts",
      currentState: "Персонализированный календарь пары не должен становиться paid unlock без server-side guard.",
      visibleFallbackMessage: APHRODITE_VIP_FALLBACK_DEFAULT_MESSAGE,
    }),
    vipFallbackSurface({
      id: "vip-numerology",
      product: "vip-numerology",
      label: "VIP Numerology",
      surfaceType: "component",
      fileOrRoute: "components/ZodiacVipSections.tsx",
      currentState: "Будущая углублённая нумерология должна показывать locked fallback, если доступа нет.",
      visibleFallbackMessage: APHRODITE_VIP_FALLBACK_FUTURE_MESSAGE,
      riskLevel: "high",
    }),
    {
      id: "future-access-api",
      product: "free-preview",
      label: "Future VIP access API/server action",
      surfaceType: "api-route",
      fileOrRoute: "будущий API/server action",
      currentState: "Сейчас не реализован. В будущем должен отвечать безопасным deny, а не ошибкой.",
      fallbackAction: "deny-with-safe-message",
      fallbackRoute: APHRODITE_VIP_FREE_PREVIEW_FALLBACK_ROUTE,
      visibleFallbackMessage: "Доступ не подтверждён. Покажите пользователю бесплатный preview и мягкий путь назад.",
      freePreviewAvailable: true,
      mustRemainOpen: false,
      futureGuardRequired: true,
      riskLevel: "critical",
    },
    {
      id: "dashboard-review-spec-pages",
      product: "free-preview",
      label: "Dashboard review/spec pages",
      surfaceType: "dashboard",
      fileOrRoute: "/dashboard/networks/zodiac/*",
      currentState: "Внутренние review/spec страницы остаются доступными для проверки и не являются VIP-контентом.",
      fallbackAction: "keep-open",
      fallbackRoute: "/dashboard/networks/zodiac",
      visibleFallbackMessage: "Review-страница остаётся открытой для ручной проверки.",
      freePreviewAvailable: true,
      mustRemainOpen: true,
      futureGuardRequired: false,
      riskLevel: "medium",
    },
    {
      id: "manual-qa-dashboards",
      product: "free-preview",
      label: "Manual QA dashboards",
      surfaceType: "qa",
      fileOrRoute: "scripts/qa-*.mjs и dashboard QA routes",
      currentState: "QA surfaces должны проверять fallback, но не становиться gated runtime flows.",
      fallbackAction: "keep-open",
      fallbackRoute: "/dashboard/networks/zodiac/vip-free-preview-fallback-map",
      visibleFallbackMessage: "QA остаётся доступным для проверки deny и fallback.",
      freePreviewAvailable: true,
      mustRemainOpen: true,
      futureGuardRequired: false,
      riskLevel: "medium",
    },
  ];
}

export function getAphroditeVipFallbackRules(): AphroditeVipFallbackRule[] {
  return [
    {
      id: "rule-no-empty-deny",
      label: "Deny не должен вести в пустоту",
      visibleRule: "Если VIP-доступа нет, пользователь не должен попасть в пустоту или ошибку. Он должен видеть безопасный fallback: бесплатный preview, понятное объяснение и мягкий путь назад.",
      appliesTo: ["future VIP route", "future VIP component", "future API/server action"],
      blockedFailureModes: BLOCKED_FAILURE_MODES.slice(),
      requiredBeforeRealVip: REQUIRED_BEFORE_REAL_VIP.slice(),
    },
    {
      id: "rule-free-surfaces-open",
      label: "Free surfaces остаются открытыми",
      visibleRule: "/miniapp, /miniapp/love-reading-preview, free preview cards, basic birth matrix preview, basic compatibility preview, dashboard review/spec pages и manual QA dashboards нельзя закрывать VIP-guard.",
      appliesTo: ["free route", "free preview route", "dashboard/spec", "manual QA"],
      blockedFailureModes: ["lost user after denied access", "blank screen", "manual route guessing"],
      requiredBeforeRealVip: ["карта mustRemainOpen подтверждена", "owner review подтвердил free funnel"],
    },
    {
      id: "rule-client-shortcuts-deny",
      label: "Клиентские обходы не открывают VIP",
      visibleRule: "localStorage, query params, mock payment success, client-only button и hardcoded allowed=true не должны открывать платный слой.",
      appliesTo: ["Mini App client", "VIP teaser", "future guarded route"],
      blockedFailureModes: [
        "client-only unlock",
        "localStorage VIP bypass",
        "query param VIP bypass",
        "mock payment success bypass",
        "hardcoded allowed=true",
      ],
      requiredBeforeRealVip: ["negative QA на каждый shortcut", "server-side deny без entitlement", "fallback=/miniapp/love-reading-preview"],
    },
  ];
}

export function getAphroditeVipFallbackQaItems(): AphroditeVipFallbackQaItem[] {
  return [
    {
      id: "qa-surfaces-covered",
      label: "Все VIP fallback surfaces описаны",
      mustPass: ["Full Love Report fallback есть", "VIP Couple Calendar fallback есть", "VIP Numerology fallback есть", "free preview route указан"],
      mustFailIf: ["VIP product не имеет fallbackRoute", "future VIP surface не имеет сообщения", "free preview недоступен"],
      riskLevel: "critical",
    },
    {
      id: "qa-free-surfaces-open",
      label: "Free surfaces остаются открытыми",
      mustPass: ["/miniapp mustRemainOpen", "/miniapp/love-reading-preview mustRemainOpen", "basic birth matrix preview mustRemainOpen", "basic compatibility preview mustRemainOpen"],
      mustFailIf: ["free funnel закрыт guard", "preview требует VIP", "dashboard review требует entitlement"],
      riskLevel: "critical",
    },
    {
      id: "qa-deny-safe",
      label: "Deny безопасен",
      mustPass: ["allowed=false", "fallback=/miniapp/love-reading-preview", "есть видимое русское объяснение", "есть путь назад"],
      mustFailIf: ["blank screen", "unhandled exception", "lost user after denied access"],
      riskLevel: "critical",
    },
    {
      id: "qa-no-production-side-effects",
      label: "Нет production side effects",
      mustPass: ["нет оплаты", "нет Telegram API", "нет записи в базу данных", "нет миграций", "cron/workflows/publish scripts не изменены"],
      mustFailIf: ["создан Stars invoice", "добавлен successful_payment handler", "создан entitlement", "изменена active Telegram CTA logic"],
      riskLevel: "critical",
    },
  ];
}

export function getAphroditeVipFallbackBoundaries(): AphroditeVipFallbackBoundary[] {
  return [
    {
      area: "VIP unlock",
      visibleLabel: "Нет реальной VIP-разблокировки",
      dataBoundary: "no-real-vip-unlock",
      allowedNow: ["описать fallback", "показать locked teaser", "показать allowed=false sample"],
      blockedUntil: ["server-side entitlement", "payment ledger", "owner review"],
      riskLevel: "critical",
    },
    {
      area: "Payment",
      visibleLabel: "Нет оплаты",
      dataBoundary: "no-payment",
      allowedNow: ["показать бесплатный preview", "описать будущий paid layer без CTA"],
      blockedUntil: ["отдельный payment package", "legal/product approval"],
      riskLevel: "critical",
    },
    {
      area: "Telegram Stars",
      visibleLabel: "Нет Telegram Stars invoice",
      dataBoundary: "no-stars-invoice",
      allowedNow: ["не создавать invoice", "не вызывать Telegram Stars"],
      blockedUntil: ["отдельный Stars invoice package"],
      riskLevel: "critical",
    },
    {
      area: "Payment update",
      visibleLabel: "Нет successful_payment handler",
      dataBoundary: "no-successful-payment-handler",
      allowedNow: ["описать mock payment success как заблокированный shortcut"],
      blockedUntil: ["отдельный webhook/payment package", "ledger QA"],
      riskLevel: "critical",
    },
    {
      area: "Entitlement",
      visibleLabel: "Нет entitlement creation",
      dataBoundary: "no-entitlement-creation",
      allowedNow: ["описать будущие требования", "не создавать доступ"],
      blockedUntil: ["DB schema package", "ledger", "owner review"],
      riskLevel: "critical",
    },
    {
      area: "Database write",
      visibleLabel: "Нет записи в базу данных",
      dataBoundary: "no-database-write",
      allowedNow: ["статическая fallback-модель"],
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
      allowedNow: ["не вызывать внешние Telegram endpoints"],
      blockedUntil: ["отдельный Telegram integration package"],
      riskLevel: "critical",
    },
    {
      area: "Production launch",
      visibleLabel: "Нет production-запуска",
      dataBoundary: "no-production-launch",
      allowedNow: ["dashboard review", "локальная QA"],
      blockedUntil: ["owner launch checklist", "production safety PASS"],
      riskLevel: "high",
    },
    {
      area: "Fallback map only",
      visibleLabel: "VIP не открывается в этом пакете",
      dataBoundary: "vip-not-unlocked-in-this-package",
      allowedNow: ["карта fallback", "sample allowed=false", "free preview fallback"],
      blockedUntil: ["Package 161 принят владельцем", "Package 162 product catalog finalization готов", "server-side checker спроектирован"],
      riskLevel: "critical",
    },
  ];
}

export function getAphroditeVipFallbackNextSteps(): AphroditeVipFallbackNextStep[] {
  return [
    {
      package: "Package 162",
      title: "Product Catalog Finalization",
      purpose: "Финализировать продуктовый каталог и идентификаторы будущих VIP-продуктов перед любым реальным server-side доступом.",
      blockedUntil: [
        "Package 161 принят владельцем",
        "fallback route подтверждён как /miniapp/love-reading-preview",
        "mustRemainOpen surfaces подтверждены",
        "negative QA на failure modes подтверждён",
      ],
    },
  ];
}
