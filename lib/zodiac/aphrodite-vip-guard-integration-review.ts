/**
 * Aphrodite VIP guard integration review (Package 160).
 *
 * Static review model only. This file does not connect the Package 158 guard
 * to production flows and does not implement payments, Telegram invoices,
 * successful payment handlers, VIP unlocks, entitlement creation, persistence,
 * schema changes, Telegram API calls, production launch, AI calls, posting, or
 * scheduling.
 */

export type AphroditeVipGuardIntegrationSurfaceType =
  | "route"
  | "component"
  | "api-route"
  | "server-action"
  | "dashboard"
  | "qa"
  | "documentation"
  | "model";

export type AphroditeVipGuardIntegrationStatus =
  | "free-funnel-keep-open"
  | "free-preview-keep-open"
  | "locked-teaser-only"
  | "future-guard-required"
  | "future-server-check-required"
  | "dashboard-review-only"
  | "owner-review-required";

export type AphroditeVipGuardIntegrationProduct =
  | "full-love-report"
  | "vip-love-access"
  | "ai-future-timeline-vip"
  | "soulmate-scanner-vip"
  | "red-flags-scanner-vip"
  | "birth-matrix-vip"
  | "natal-chart-vip"
  | "vip-couple-calendar"
  | "vip-numerology"
  | "free-preview";

export type AphroditeVipGuardIntegrationSurface = {
  id: string;
  label: string;
  surfaceType: AphroditeVipGuardIntegrationSurfaceType;
  fileOrRoute: string;
  product: AphroditeVipGuardIntegrationProduct;
  currentState: string;
  futureIntegrationStatus: AphroditeVipGuardIntegrationStatus;
  futureGuardPlacement: string[];
  requiredServerChecks: string[];
  freeFallback: string;
  mustRemainOpen: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeVipGuardIntegrationRule = {
  id: string;
  label: string;
  visibleRule: string;
  appliesTo: string[];
  blockedShortcut: string[];
  requiredBeforeRealIntegration: string[];
};

export type AphroditeVipGuardIntegrationQaItem = {
  id: string;
  label: string;
  mustPass: string[];
  mustFailIf: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeVipGuardIntegrationBoundary = {
  area: string;
  visibleLabel: string;
  dataBoundary: string;
  allowedNow: string[];
  blockedUntil: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

export type AphroditeVipGuardIntegrationNextStep = {
  package: string;
  title: string;
  purpose: string;
  blockedUntil: string[];
};

export const APHRODITE_VIP_GUARD_INTEGRATION_CLASSIFICATION =
  "Только review интеграции / Guard не подключён к production / Нет реальной VIP-разблокировки";

export const APHRODITE_VIP_GUARD_INTEGRATION_FREE_FALLBACK = "/miniapp/love-reading-preview";

const SERVER_CHECKS = [
  "server-side entitlement check по userRef и productId",
  "product-specific entitlement guard",
  "expiration/revocation guard",
  "payment ledger guard",
  "owner review gate",
  "проверка Telegram initData на сервере перед любым будущим allow",
  "free preview fallback при deny",
] as const;

const FUTURE_GUARD_PLACEMENTS = [
  "route-level server guard",
  "component-level locked section guard",
  "API/server action guard",
  "product-specific entitlement guard",
  "expiration/revocation guard",
  "payment ledger guard",
  "owner review gate",
  "free preview fallback",
] as const;

export function getAphroditeVipGuardIntegrationSurfaces(): AphroditeVipGuardIntegrationSurface[] {
  return [
    {
      id: "free-miniapp-funnel",
      label: "Основной вход Mini App",
      surfaceType: "route",
      fileOrRoute: "/miniapp",
      product: "free-preview",
      currentState: "Free funnel с позиционированием Aphrodite / AI Love Reading. Его нельзя закрывать guard, чтобы не сломать вход в воронку.",
      futureIntegrationStatus: "free-funnel-keep-open",
      futureGuardPlacement: ["guard здесь не подключать", "оставить открытым для всех пользователей", "использовать только навигацию к бесплатному preview"],
      requiredServerChecks: ["не требуется для free funnel"],
      freeFallback: "/miniapp",
      mustRemainOpen: true,
      riskLevel: "critical",
    },
    {
      id: "free-love-reading-preview",
      label: "Free Love Reading Preview",
      surfaceType: "route",
      fileOrRoute: "/miniapp/love-reading-preview",
      product: "free-preview",
      currentState: "Бесплатный предварительный результат. Должен оставаться доступным как fallback для всех deny-сценариев.",
      futureIntegrationStatus: "free-preview-keep-open",
      futureGuardPlacement: ["free preview fallback", "не закрывать guard", "использовать как безопасный маршрут после deny"],
      requiredServerChecks: ["не требуется для бесплатного preview"],
      freeFallback: "/miniapp/love-reading-preview",
      mustRemainOpen: true,
      riskLevel: "critical",
    },
    {
      id: "full-love-report",
      label: "Full Love Report",
      surfaceType: "route",
      fileOrRoute: "будущий route полного отчёта",
      product: "full-love-report",
      currentState: "Сейчас представлен как ценность будущего полного отчёта, без реальной разблокировки.",
      futureIntegrationStatus: "future-guard-required",
      futureGuardPlacement: FUTURE_GUARD_PLACEMENTS.slice(),
      requiredServerChecks: SERVER_CHECKS.slice(),
      freeFallback: APHRODITE_VIP_GUARD_INTEGRATION_FREE_FALLBACK,
      mustRemainOpen: false,
      riskLevel: "critical",
    },
    {
      id: "vip-love-access",
      label: "VIP Love Access",
      surfaceType: "component",
      fileOrRoute: "components / будущие locked sections AI Love Reading",
      product: "vip-love-access",
      currentState: "Locked teaser only: можно показывать ценность будущей глубины, но нельзя открывать платный доступ.",
      futureIntegrationStatus: "future-guard-required",
      futureGuardPlacement: ["component-level locked section guard", "product-specific entitlement guard", "free preview fallback"],
      requiredServerChecks: SERVER_CHECKS.slice(),
      freeFallback: APHRODITE_VIP_GUARD_INTEGRATION_FREE_FALLBACK,
      mustRemainOpen: false,
      riskLevel: "critical",
    },
    {
      id: "ai-future-timeline-vip",
      label: "AI Future Timeline VIP",
      surfaceType: "dashboard",
      fileOrRoute: "/dashboard/networks/zodiac/ai-future-timeline-foundation",
      product: "ai-future-timeline-vip",
      currentState: "Dashboard/spec foundation и locked teaser, без внешнего AI API и без VIP unlock.",
      futureIntegrationStatus: "future-server-check-required",
      futureGuardPlacement: ["route-level server guard", "component-level locked section guard", "owner review gate"],
      requiredServerChecks: SERVER_CHECKS.slice(),
      freeFallback: APHRODITE_VIP_GUARD_INTEGRATION_FREE_FALLBACK,
      mustRemainOpen: false,
      riskLevel: "high",
    },
    {
      id: "soulmate-scanner-vip",
      label: "Soulmate Scanner VIP",
      surfaceType: "dashboard",
      fileOrRoute: "/dashboard/networks/zodiac/soulmate-scanner-foundation",
      product: "soulmate-scanner-vip",
      currentState: "Dashboard/spec foundation и бесплатный teaser, без реального VIP-доступа.",
      futureIntegrationStatus: "future-guard-required",
      futureGuardPlacement: ["route-level server guard", "product-specific entitlement guard", "free preview fallback"],
      requiredServerChecks: SERVER_CHECKS.slice(),
      freeFallback: APHRODITE_VIP_GUARD_INTEGRATION_FREE_FALLBACK,
      mustRemainOpen: false,
      riskLevel: "high",
    },
    {
      id: "red-flags-scanner-vip",
      label: "Red Flags Scanner VIP",
      surfaceType: "dashboard",
      fileOrRoute: "/dashboard/networks/zodiac/red-flags-scanner-foundation",
      product: "red-flags-scanner-vip",
      currentState: "Safety-sensitive teaser. Нужен owner review и аккуратный deny fallback до любой интеграции guard.",
      futureIntegrationStatus: "owner-review-required",
      futureGuardPlacement: ["owner review gate", "component-level locked section guard", "free preview fallback"],
      requiredServerChecks: SERVER_CHECKS.slice(),
      freeFallback: APHRODITE_VIP_GUARD_INTEGRATION_FREE_FALLBACK,
      mustRemainOpen: false,
      riskLevel: "critical",
    },
    {
      id: "birth-matrix-vip",
      label: "Birth Matrix VIP",
      surfaceType: "component",
      fileOrRoute: "components/ZodiacMysticSections.tsx и /birth-matrix",
      product: "birth-matrix-vip",
      currentState: "Дата рождения и бесплатная матрица должны оставаться доступными; будущая VIP-глубина требует отдельного guard.",
      futureIntegrationStatus: "future-guard-required",
      futureGuardPlacement: ["component-level locked section guard", "product-specific entitlement guard", "free preview fallback"],
      requiredServerChecks: SERVER_CHECKS.slice(),
      freeFallback: "/birth-matrix",
      mustRemainOpen: true,
      riskLevel: "high",
    },
    {
      id: "natal-chart-vip",
      label: "Natal Chart VIP",
      surfaceType: "component",
      fileOrRoute: "components/ZodiacVipSections.tsx",
      product: "natal-chart-vip",
      currentState: "VIP natal blocks сейчас работают как mock/free early access. Будущая платная версия должна проверяться server-side.",
      futureIntegrationStatus: "future-server-check-required",
      futureGuardPlacement: ["route-level server guard", "component-level locked section guard", "expiration/revocation guard", "free preview fallback"],
      requiredServerChecks: SERVER_CHECKS.slice(),
      freeFallback: APHRODITE_VIP_GUARD_INTEGRATION_FREE_FALLBACK,
      mustRemainOpen: false,
      riskLevel: "critical",
    },
    {
      id: "vip-couple-calendar",
      label: "VIP Couple Calendar / 30 дней пары",
      surfaceType: "component",
      fileOrRoute: "components/ZodiacVipSections.tsx и lib/zodiac-couple-calendar-personalization.ts",
      product: "vip-couple-calendar",
      currentState: "Персонализированный календарь пары уже имеет QA на отличие результатов, но не должен становиться paid unlock без server-side guard.",
      futureIntegrationStatus: "future-guard-required",
      futureGuardPlacement: ["component-level locked section guard", "product-specific entitlement guard", "payment ledger guard", "free preview fallback"],
      requiredServerChecks: SERVER_CHECKS.slice(),
      freeFallback: APHRODITE_VIP_GUARD_INTEGRATION_FREE_FALLBACK,
      mustRemainOpen: false,
      riskLevel: "critical",
    },
    {
      id: "vip-numerology",
      label: "VIP Numerology",
      surfaceType: "component",
      fileOrRoute: "components/ZodiacVipSections.tsx",
      product: "vip-numerology",
      currentState: "Будущая углублённая нумерология. Нельзя открывать по client state или query param.",
      futureIntegrationStatus: "future-guard-required",
      futureGuardPlacement: ["component-level locked section guard", "product-specific entitlement guard", "free preview fallback"],
      requiredServerChecks: SERVER_CHECKS.slice(),
      freeFallback: APHRODITE_VIP_GUARD_INTEGRATION_FREE_FALLBACK,
      mustRemainOpen: false,
      riskLevel: "high",
    },
    {
      id: "future-api-access-check",
      label: "Будущий server-side access check API",
      surfaceType: "api-route",
      fileOrRoute: "будущий API/server action",
      product: "free-preview",
      currentState: "Пока не реализован. Package 160 только фиксирует требования к будущей точке deny/allow.",
      futureIntegrationStatus: "future-server-check-required",
      futureGuardPlacement: ["API/server action guard", "product-specific entitlement guard", "expiration/revocation guard", "payment ledger guard"],
      requiredServerChecks: SERVER_CHECKS.slice(),
      freeFallback: APHRODITE_VIP_GUARD_INTEGRATION_FREE_FALLBACK,
      mustRemainOpen: false,
      riskLevel: "critical",
    },
    {
      id: "dashboard-review-pages",
      label: "Dashboard review/spec pages",
      surfaceType: "dashboard",
      fileOrRoute: "/dashboard/networks/zodiac/*",
      product: "free-preview",
      currentState: "Review, spec и QA страницы должны оставаться доступными для ручной проверки и не являются VIP-контентом.",
      futureIntegrationStatus: "dashboard-review-only",
      futureGuardPlacement: ["guard не подключать к review/spec страницам", "использовать как контрольную плоскость"],
      requiredServerChecks: ["dashboard auth остаётся отдельной темой", "VIP entitlement не требуется"],
      freeFallback: "/dashboard/networks/zodiac",
      mustRemainOpen: true,
      riskLevel: "medium",
    },
    {
      id: "public-launch-docs",
      label: "Public bot launch docs",
      surfaceType: "documentation",
      fileOrRoute: "/dashboard/networks/zodiac/public-bot-profile-launch-packaging",
      product: "free-preview",
      currentState: "Ручная упаковка публичного профиля и docs. Не закрывать VIP-guard, чтобы не ломать review и launch copy.",
      futureIntegrationStatus: "free-funnel-keep-open",
      futureGuardPlacement: ["guard не подключать", "оставить manual review доступным"],
      requiredServerChecks: ["не требуется для документации"],
      freeFallback: "/dashboard/networks/zodiac/public-bot-profile-launch-packaging",
      mustRemainOpen: true,
      riskLevel: "medium",
    },
    {
      id: "manual-qa-dashboards",
      label: "Manual QA dashboards",
      surfaceType: "qa",
      fileOrRoute: "scripts/qa-*.mjs и dashboard QA routes",
      product: "free-preview",
      currentState: "QA и smoke surfaces должны проверять guard, но не становиться gated flows.",
      futureIntegrationStatus: "dashboard-review-only",
      futureGuardPlacement: ["guard не подключать как runtime gate", "использовать для assert deny/fallback"],
      requiredServerChecks: ["QA должен падать при client-side bypass", "QA должен подтверждать fallback"],
      freeFallback: "/dashboard/networks/zodiac/vip-guard-integration-review",
      mustRemainOpen: true,
      riskLevel: "medium",
    },
  ];
}

export function getAphroditeVipGuardIntegrationRules(): AphroditeVipGuardIntegrationRule[] {
  return [
    {
      id: "rule-server-only-allow",
      label: "Allow только на сервере",
      visibleRule: "Будущий VIP allow может появиться только после server-side entitlement check, payment ledger check, expiration/revocation guard и owner review gate.",
      appliesTo: ["future guarded route", "future guarded component", "future guarded API/server action"],
      blockedShortcut: ["localStorage VIP flag", "query param VIP flag", "front-end-only role check", "hardcoded allowed=true"],
      requiredBeforeRealIntegration: SERVER_CHECKS.slice(),
    },
    {
      id: "rule-free-funnel-open",
      label: "Free funnel нельзя закрывать",
      visibleRule: "/miniapp, /miniapp/love-reading-preview, free preview blocks, dashboard review/spec pages, public bot launch docs и manual QA dashboards должны оставаться открытыми.",
      appliesTo: ["free funnel", "free preview", "dashboard/spec", "manual QA"],
      blockedShortcut: ["manual route guessing не должен открывать VIP", "CSS hidden section reveal"],
      requiredBeforeRealIntegration: ["отдельная карта fallback routes", "owner approval на реальные gated routes"],
    },
    {
      id: "rule-client-bypass-blocked",
      label: "Клиентские обходы должны блокироваться",
      visibleRule: "Client state может вести пользователя по UI, но не может доказывать доступ или открывать locked section.",
      appliesTo: ["Mini App client", "VIP components", "future API"],
      blockedShortcut: [
        "localStorage VIP flag",
        "query param VIP flag",
        "client button unlock",
        "CSS hidden section reveal",
        "mock successful_payment",
        "manual route guessing",
        "front-end-only role check",
        "hardcoded allowed=true",
      ],
      requiredBeforeRealIntegration: ["negative QA на каждый shortcut", "server-side deny without entitlement", "fallback to free preview"],
    },
  ];
}

export function getAphroditeVipGuardIntegrationQaItems(): AphroditeVipGuardIntegrationQaItem[] {
  return [
    {
      id: "qa-free-surfaces-open",
      label: "Free surfaces остаются открытыми",
      mustPass: ["/miniapp открыт", "/miniapp/love-reading-preview открыт", "free preview blocks видимы", "dashboard review/spec pages доступны"],
      mustFailIf: ["free funnel закрыт guard", "fallback ведёт на locked route", "dashboard review page требует VIP entitlement"],
      riskLevel: "critical",
    },
    {
      id: "qa-deny-without-entitlement",
      label: "Deny без entitlement",
      mustPass: ["guard skeleton возвращает allowed=false", "fallback=/miniapp/love-reading-preview", "видимое сообщение не обещает unlock"],
      mustFailIf: ["allowed=true без server-side entitlement", "VIP открыт по query/localStorage", "locked section видна после mock successful_payment"],
      riskLevel: "critical",
    },
    {
      id: "qa-server-requirements",
      label: "Server-side требования перед интеграцией",
      mustPass: ["описан server-side entitlement check", "описан payment ledger guard", "описан owner review gate", "описан expiration/revocation guard"],
      mustFailIf: ["guard подключён только на клиенте", "нет product-specific проверки", "нет fallback после deny"],
      riskLevel: "critical",
    },
    {
      id: "qa-no-production-side-effects",
      label: "Нет production side effects",
      mustPass: ["нет оплаты", "нет Telegram API call", "нет записи в базу данных", "нет миграций", "cron/workflows/publish scripts не изменены"],
      mustFailIf: ["создан Stars invoice", "добавлен successful_payment handler", "создан entitlement", "изменена active Telegram CTA logic"],
      riskLevel: "critical",
    },
  ];
}

export function getAphroditeVipGuardIntegrationBoundaries(): AphroditeVipGuardIntegrationBoundary[] {
  return [
    {
      area: "VIP unlock",
      visibleLabel: "Нет реальной VIP-разблокировки",
      dataBoundary: "no-real-vip-unlock",
      allowedNow: ["описать места будущей интеграции", "показать deny-by-default sample"],
      blockedUntil: ["server-side entitlement", "payment ledger", "owner review"],
      riskLevel: "critical",
    },
    {
      area: "Payment",
      visibleLabel: "Нет оплаты",
      dataBoundary: "no-payment",
      allowedNow: ["review требований", "без платёжных CTA"],
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
      allowedNow: ["описать mock successful_payment как заблокированный shortcut"],
      blockedUntil: ["отдельный webhook/payment package", "ledger QA"],
      riskLevel: "critical",
    },
    {
      area: "Entitlement",
      visibleLabel: "Нет entitlement creation",
      dataBoundary: "no-entitlement-creation",
      allowedNow: ["описать требования к будущему entitlement", "не создавать доступ"],
      blockedUntil: ["DB schema package", "ledger", "owner review"],
      riskLevel: "critical",
    },
    {
      area: "Database write",
      visibleLabel: "Нет записи в базу данных",
      dataBoundary: "no-database-write",
      allowedNow: ["статическая review-модель"],
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
      area: "Guard integration",
      visibleLabel: "Guard не подключён к production",
      dataBoundary: "guard-not-connected-to-production",
      allowedNow: ["review будущего placement", "sample allowed=false"],
      blockedUntil: ["Package 160 принят владельцем", "Package 161 fallback map готов", "server-side checker спроектирован"],
      riskLevel: "critical",
    },
  ];
}

export function getAphroditeVipGuardIntegrationNextSteps(): AphroditeVipGuardIntegrationNextStep[] {
  return [
    {
      package: "Package 161",
      title: "VIP Routes Free Preview Fallback Map",
      purpose: "Зафиксировать точную карту fallback routes для будущих guarded VIP surfaces до реального подключения guard.",
      blockedUntil: [
        "Package 160 принят владельцем",
        "подтверждены must-remain-free routes",
        "подтверждены будущие product-specific guard placements",
        "подтверждены негативные QA для client-side bypasses",
      ],
    },
  ];
}
