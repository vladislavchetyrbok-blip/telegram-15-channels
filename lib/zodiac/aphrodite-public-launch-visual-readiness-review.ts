/**
 * Package 207: Aphrodite Public Launch Visual Readiness Review.
 *
 * Review/readiness model only. This file does not launch production, call
 * Telegram API, send messages, change BotFather, active CTA, payments, VIP,
 * database, workflows, cron, or publish scripts.
 */

export type AphroditePublicLaunchVisualReadinessStatus =
  | "ready-for-manual-review"
  | "good-enough-for-mvp"
  | "needs-polish"
  | "needs-device-test"
  | "blocked"
  | "not-user-facing";

export type AphroditePublicLaunchVisualReadinessSurface = {
  id: string;
  title: string;
  route: string;
  sourceFiles: readonly string[];
  status: AphroditePublicLaunchVisualReadinessStatus;
  statusLabel: string;
  classification: string;
  currentAssessment: string;
  evidence: readonly string[];
  manualChecks: readonly string[];
};

export type AphroditePublicLaunchVisualChecklistItem = {
  id: string;
  category:
    | "screen"
    | "mobile-device"
    | "telegram-webview"
    | "browser-fallback"
    | "owner-review"
    | "safety";
  label: string;
  expectedResult: string;
  requiredBeforeLaunch: boolean;
};

export type AphroditePublicLaunchVisualBlocker = {
  id: string;
  title: string;
  severity: "manual-review-required" | "device-test-required" | "functional-smoke-required";
  reason: string;
  requiredBeforeLaunch: readonly string[];
};

export type AphroditePublicLaunchVisualSafetyBoundary = {
  id: string;
  visibleLabel: string;
  currentState: string;
  allowedNow: readonly string[];
  blockedNow: readonly string[];
};

export type AphroditePublicLaunchVisualNextStep = {
  package: string;
  title: string;
  purpose: string;
  mustNotDo: readonly string[];
};

export const APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_TITLE =
  "Public Launch Visual Readiness Review";

export const APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_CLASSIFICATION =
  "Только visual review / Запуск не выполняется / Нужна ручная проверка";

export const APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_CONCLUSION =
  "Публичный запуск не одобрен автоматически. Нужна ручная проверка владельца на реальных устройствах.";

export const APHRODITE_PUBLIC_LAUNCH_VISUAL_READINESS_RULE =
  "Package 207 оценивает визуальную готовность Aphrodite Mini App после packages 196-206 и ничего не запускает: production, Telegram API, BotFather, active CTA, платежи, VIP, БД, workflows, cron и publish scripts не меняются.";

export const APHRODITE_PUBLIC_LAUNCH_VISUAL_SAFETY_LABELS = [
  "Нет production-запуска",
  "Нет Telegram API",
  "Нет отправки сообщений",
  "Нет изменения BotFather",
  "Нет изменения active CTA",
  "Нет оплаты",
  "Нет VIP-разблокировки",
  "Нет записи в базу данных",
  "Visual readiness review ничего не запускает",
] as const;

export const APHRODITE_PUBLIC_LAUNCH_VISUAL_RESULT = {
  publicLaunchApproved: false,
  ownerManualReviewRequired: true,
  productionLaunchDone: false,
  telegramApiUsed: false,
  messagesSent: false,
  botFatherChanged: false,
  activeCtaLogicChanged: false,
  databaseWriteAdded: false,
  paymentAdded: false,
  vipUnlockAdded: false,
  cronWorkflowPublishChanged: false,
} as const;

const surfaces: readonly AphroditePublicLaunchVisualReadinessSurface[] = [
  {
    id: "miniapp-home",
    title: "Mini App home",
    route: "/miniapp",
    sourceFiles: ["app/miniapp/page.tsx", "components/zodiac-mini-app/AphroditeMiniAppShell.tsx"],
    status: "ready-for-manual-review",
    statusLabel: "Готово к ручному public review",
    classification: "Visually ready for manual public review",
    currentAssessment:
      "Главный экран Mini App после визуального упрощения даёт понятный вход в AI Love Reading, Матрицу судьбы, совместимость и вспомогательные разделы.",
    evidence: ["AphroditeMiniAppShell", "AphroditePrimaryCta", "/miniapp/love-reading-preview", "/birth-matrix", "/compatibility"],
    manualChecks: ["Проверить первый экран в Telegram WebView", "Убедиться, что один главный CTA визуально доминирует", "Проверить отсутствие платёжных CTA"],
  },
  {
    id: "ai-love-reading-preview",
    title: "AI Love Reading preview",
    route: "/miniapp/love-reading-preview",
    sourceFiles: ["app/miniapp/love-reading-preview/page.tsx"],
    status: "ready-for-manual-review",
    statusLabel: "Готово к ручному public review",
    classification: "Visually ready for manual public review",
    currentAssessment:
      "Preview выглядит как бесплатный первый результат и безопасно ведёт пользователя дальше без оплаты, VIP-разблокировки и жёстких обещаний.",
    evidence: ["PREVIEW_BLOCKS", "SAFETY_BOUNDARIES", "AphroditePrimaryCta", "/compatibility", "/miniapp"],
    manualChecks: ["Проверить readability на мобильном", "Проверить fallback route", "Проверить, что locked state не выглядит как активная покупка"],
  },
  {
    id: "birth-matrix",
    title: "Birth Matrix",
    route: "/birth-matrix",
    sourceFiles: ["app/birth-matrix/BirthMatrixClient.tsx", "components/zodiac-mini-app/ZodiacDateInput.tsx"],
    status: "good-enough-for-mvp",
    statusLabel: "Достаточно для MVP review",
    classification: "Good enough for MVP",
    currentAssessment:
      "Матрица судьбы получила обновлённый результат, общий текстовый ввод даты и компактный визуальный блок, пригодный для ручной проверки.",
    evidence: ["data-birth-matrix-result=\"visual-upgrade-package-201\"", "birthDateScope=\"birth-matrix\"", "data-birth-date-ui", "Матрица судьбы"],
    manualChecks: ["Проверить ввод 15.06.1998", "Проверить ввод 01.01.1990", "Проверить блокировку будущей даты", "Проверить экран результата"],
  },
  {
    id: "compatibility-result",
    title: "Compatibility result",
    route: "/compatibility",
    sourceFiles: ["app/compatibility/page.tsx", "components/ZodiacCompatibilityMiniApp.tsx", "components/zodiac-mini-app/ResultCards.tsx"],
    status: "ready-for-manual-review",
    statusLabel: "Готово к ручному public review",
    classification: "Visually ready for manual public review",
    currentAssessment:
      "Результат совместимости, персональный copy и календарь пары выглядят согласованно с новой визуальной системой.",
    evidence: ["ZodiacCompatibilityMiniApp", "buildZodiacCompatibilityPersonalizedCopy", "#relationship-calendar", "Совместимость"],
    manualChecks: ["Проверить сценарий пары", "Проверить 30 дней пары", "Проверить отсутствие одинаковых дней", "Проверить no-overflow на мобильном"],
  },
  {
    id: "mystic-universe",
    title: "Mystic / Universe",
    route: "/compatibility -> Mystic / Cards / Universe Message",
    sourceFiles: ["components/ZodiacMysticSections.tsx", "components/zodiac-mini-app/AphroditeMysticUniversePanel.tsx"],
    status: "good-enough-for-mvp",
    statusLabel: "Достаточно для MVP review",
    classification: "Good enough for MVP",
    currentAssessment:
      "Mystic sections получили отдельный Universe Message panel и выглядят безопасно: без давления, страха и обещания судьбоносного результата.",
    evidence: ["AphroditeMysticUniversePanel", "Послание Вселенной", "DailyCardFeature", "TarotCardFeature", "RuneDayFeature"],
    manualChecks: ["Проверить Daily Card", "Проверить Tarot", "Проверить Rune", "Проверить мягкость текста"],
  },
  {
    id: "daily-horoscope-cards",
    title: "Daily horoscope cards",
    route: "daily horoscope visual card definitions",
    sourceFiles: ["lib/zodiac/aphrodite-horoscope-visual-cards.ts", "components/zodiac-mini-app/AphroditeHoroscopeCard.tsx"],
    status: "good-enough-for-mvp",
    statusLabel: "Достаточно для MVP review",
    classification: "Good enough for MVP",
    currentAssessment:
      "Daily card имеет компактную структуру: знак, период, главная тема, отношения, энергия, внимание и безопасный CTA/fallback.",
    evidence: ["Daily horoscope card", "data-aphrodite-horoscope-card", "loveRelationship", "attentionZone", "ctaFallback"],
    manualChecks: ["Проверить читаемость короткого daily текста", "Проверить CTA/fallback", "Проверить мобильную высоту карточки"],
  },
  {
    id: "weekly-horoscope-cards",
    title: "Weekly horoscope cards",
    route: "weekly horoscope visual card definitions",
    sourceFiles: ["lib/zodiac/aphrodite-horoscope-visual-cards.ts", "components/zodiac-mini-app/AphroditeHoroscopePeriodBadge.tsx"],
    status: "good-enough-for-mvp",
    statusLabel: "Достаточно для MVP review",
    classification: "Good enough for MVP",
    currentAssessment:
      "Weekly card визуально показывает новую неделю и не смешивает target period с датой генерации.",
    evidence: ["Weekly horoscope card", "Новая неделя", "weekStart/weekEnd", "AphroditeHoroscopePeriodBadge"],
    manualChecks: ["Проверить label новой недели", "Проверить period badge", "Проверить отсутствие длинной стены текста"],
  },
  {
    id: "monthly-horoscope-cards",
    title: "Monthly horoscope cards",
    route: "monthly horoscope visual card definitions",
    sourceFiles: ["lib/zodiac/aphrodite-horoscope-visual-cards.ts", "components/zodiac-mini-app/AphroditeHoroscopeCard.tsx"],
    status: "good-enough-for-mvp",
    statusLabel: "Достаточно для MVP review",
    classification: "Good enough for MVP",
    currentAssessment:
      "Monthly card явно показывает следующий календарный месяц после 20 числа и пригодна для visual review июльского периода.",
    evidence: ["Monthly horoscope card", "Июль 2026", "следующий календарный месяц", "CTA/fallback area"],
    manualChecks: ["Проверить месяц после 20 числа", "Проверить компактность блока", "Проверить отсутствие payment CTA"],
  },
  {
    id: "fallback-route",
    title: "fallback route",
    route: "/miniapp/love-reading-preview",
    sourceFiles: ["app/miniapp/love-reading-preview/page.tsx", "lib/zodiac/aphrodite-vip-free-preview-fallback-map.ts"],
    status: "ready-for-manual-review",
    statusLabel: "Готово к ручному public review",
    classification: "Visually ready for manual public review",
    currentAssessment:
      "Fallback route ведёт пользователя в бесплатный preview и не открывает оплату, entitlement или VIP-доступ.",
    evidence: ["/miniapp/love-reading-preview", "free preview", "fallback", "No payment"],
    manualChecks: ["Проверить fallback из locked state", "Проверить возврат в Mini App", "Проверить, что доступ не открывается"],
  },
  {
    id: "guard-fallback-visual-state",
    title: "guard/fallback visual state",
    route: "future VIP guard denied flow",
    sourceFiles: ["lib/zodiac/aphrodite-vip-free-preview-fallback-map.ts", "app/dashboard/networks/zodiac/vip-free-preview-fallback-map/page.tsx"],
    status: "needs-polish",
    statusLabel: "Нужна финальная полировка перед public launch",
    classification: "Needs polish before public launch",
    currentAssessment:
      "Denied/fallback state безопасен концептуально, но перед public launch нужен ручной просмотр текста, чтобы он не выглядел как ошибка или скрытая покупка.",
    evidence: ["VIP fallback", "free preview", "deny", "locked"],
    manualChecks: ["Проверить текст denied state", "Проверить мягкость формулировок", "Проверить, что нет ощущения сломанного экрана"],
  },
  {
    id: "mobile-layout",
    title: "mobile layout",
    route: "Mini App mobile layout",
    sourceFiles: ["components/zodiac-mini-app/AphroditeMiniAppShell.tsx", "components/zodiac-mini-app/AphroditeSectionCard.tsx"],
    status: "needs-device-test",
    statusLabel: "Нужна проверка на реальных устройствах",
    classification: "Needs mobile device check",
    currentAssessment:
      "Вёрстка выглядит готовой к browser review, но public launch нельзя одобрять без проверки на реальном iPhone и Android.",
    evidence: ["AphroditeMiniAppShell", "AphroditeSectionCard", "Telegram safe area", "mobile CTA hierarchy"],
    manualChecks: ["Проверить iPhone viewport", "Проверить Android viewport", "Проверить safe area Telegram", "Проверить длинные русские строки"],
  },
  {
    id: "telegram-webview-visual-behavior",
    title: "Telegram WebView visual behavior",
    route: "Telegram Mini App WebView",
    sourceFiles: ["app/miniapp/page.tsx", "app/birth-matrix/BirthMatrixClient.tsx", "components/ZodiacCompatibilityMiniApp.tsx"],
    status: "needs-device-test",
    statusLabel: "Нужна проверка Telegram WebView",
    classification: "Needs mobile device check",
    currentAssessment:
      "Browser/build checks проходят, но Telegram WebView может иметь cache, viewport и input-поведение, которые надо подтвердить вручную.",
    evidence: ["Telegram WebApp feel", "birth date text input", "safe area", "fallback route"],
    manualChecks: ["Открыть через Telegram", "Проверить кеш WebView", "Проверить ввод даты", "Проверить возврат между flow"],
  },
  {
    id: "iphone-check",
    title: "iPhone check",
    route: "iOS Telegram Mini App",
    sourceFiles: ["docs/aphrodite-miniapp-visual-qa-consolidation.md"],
    status: "needs-device-test",
    statusLabel: "Нужен iPhone check",
    classification: "Needs mobile device check",
    currentAssessment:
      "iPhone остаётся обязательной ручной проверкой: safe area, клавиатура, дата рождения, высота карточек и back navigation.",
    evidence: ["iPhone Telegram Mini App", "safe area", "Дата рождения", "Visual QA"],
    manualChecks: ["Проверить iPhone Telegram", "Проверить keyboard overlap", "Проверить /birth-matrix", "Проверить /miniapp/love-reading-preview"],
  },
  {
    id: "android-check",
    title: "Android check",
    route: "Android Telegram Mini App",
    sourceFiles: ["docs/aphrodite-miniapp-visual-qa-consolidation.md"],
    status: "needs-device-test",
    statusLabel: "Нужен Android check",
    classification: "Needs mobile device check",
    currentAssessment:
      "Android нужен для проверки WebView cache, scroll, клавиатуры и текстового ввода даты без native date picker.",
    evidence: ["Android Telegram Mini App", "text birth-date input", "mobile CTA hierarchy"],
    manualChecks: ["Проверить Android Telegram", "Проверить scroll после ввода", "Проверить 15.06.1998", "Проверить 01.01.1990"],
  },
  {
    id: "desktop-telegram-check",
    title: "desktop Telegram check",
    route: "Desktop Telegram Mini App",
    sourceFiles: ["docs/aphrodite-miniapp-visual-qa-consolidation.md"],
    status: "needs-device-test",
    statusLabel: "Нужен desktop Telegram check",
    classification: "Needs mobile device check",
    currentAssessment:
      "Desktop Telegram должен подтвердить, что Mini App не ломает ширину, fallback route и основные links.",
    evidence: ["desktop Telegram", "/miniapp", "/compatibility", "/birth-matrix"],
    manualChecks: ["Открыть desktop Telegram", "Проверить ширину", "Проверить links", "Проверить отсутствие production actions"],
  },
  {
    id: "browser-fallback-check",
    title: "browser fallback check",
    route: "Browser fallback",
    sourceFiles: ["app/miniapp/page.tsx", "app/miniapp/love-reading-preview/page.tsx", "app/birth-matrix/BirthMatrixClient.tsx"],
    status: "needs-device-test",
    statusLabel: "Нужен browser fallback check",
    classification: "Needs functional smoke test",
    currentAssessment:
      "Browser fallback должен подтвердить, что без Telegram окружения пользователь всё равно видит аккуратный preview и безопасные маршруты.",
    evidence: ["browser fallback", "/miniapp", "/miniapp/love-reading-preview", "/birth-matrix"],
    manualChecks: ["Открыть browser fallback", "Проверить отсутствие Telegram-only error", "Проверить links", "Проверить визуальную читаемость"],
  },
  {
    id: "dashboard-visual-qa-pages",
    title: "dashboard visual QA pages",
    route: "/dashboard/networks/zodiac/* visual QA",
    sourceFiles: ["app/dashboard/networks/zodiac/page.tsx", "scripts/qa-zodiac-dashboard.mjs"],
    status: "not-user-facing",
    statusLabel: "Не user-facing",
    classification: "Not user-facing",
    currentAssessment:
      "Dashboard review pages полезны владельцу и QA, но не являются публичным Mini App экраном для пользователей.",
    evidence: ["miniapp-visual-qa-consolidation", "horoscope-visual-cards", "vip-natal-numerology-visual-review"],
    manualChecks: ["Проверить dashboard links", "Проверить, что это не live route", "Проверить read-only status"],
  },
];

const checklist: readonly AphroditePublicLaunchVisualChecklistItem[] = [
  {
    id: "screen-miniapp-home",
    category: "screen",
    label: "Mini App home проверен визуально",
    expectedResult: "Первый экран читаемый, главный CTA понятен, вторичные разделы не спорят с главным сценарием.",
    requiredBeforeLaunch: true,
  },
  {
    id: "screen-love-preview",
    category: "screen",
    label: "AI Love Reading preview проверен визуально",
    expectedResult: "Preview выглядит как бесплатный результат, не как активная покупка или скрытый VIP.",
    requiredBeforeLaunch: true,
  },
  {
    id: "screen-birth-matrix",
    category: "screen",
    label: "Birth Matrix проверен визуально",
    expectedResult: "Дата рождения вводится текстом, результат читаемый, future date блокируется.",
    requiredBeforeLaunch: true,
  },
  {
    id: "mobile-iphone",
    category: "mobile-device",
    label: "iPhone checklist",
    expectedResult: "iPhone Telegram Mini App показывает корректную высоту, safe area, ввод даты и CTA.",
    requiredBeforeLaunch: true,
  },
  {
    id: "mobile-android",
    category: "mobile-device",
    label: "Android checklist",
    expectedResult: "Android Telegram Mini App не показывает старый календарь, не ломает keyboard/scroll и route fallback.",
    requiredBeforeLaunch: true,
  },
  {
    id: "telegram-webview-cache",
    category: "telegram-webview",
    label: "Telegram WebView checklist",
    expectedResult: "WebView cache очищен, открывается актуальный route, UI соответствует packages 196-206.",
    requiredBeforeLaunch: true,
  },
  {
    id: "desktop-telegram",
    category: "telegram-webview",
    label: "desktop Telegram check",
    expectedResult: "Desktop Telegram показывает Mini App без горизонтального overflow и сломанных ссылок.",
    requiredBeforeLaunch: true,
  },
  {
    id: "browser-fallback",
    category: "browser-fallback",
    label: "browser fallback checklist",
    expectedResult: "Browser fallback безопасно показывает preview routes без Telegram-only crash.",
    requiredBeforeLaunch: true,
  },
  {
    id: "owner-manual-review",
    category: "owner-review",
    label: "owner manual review required",
    expectedResult: "Владелец вручную подтверждает public launch readiness на реальных устройствах.",
    requiredBeforeLaunch: true,
  },
  {
    id: "safety-no-launch",
    category: "safety",
    label: "publicLaunchApproved=false",
    expectedResult: "Package 207 не одобряет запуск автоматически и ничего не публикует.",
    requiredBeforeLaunch: true,
  },
];

const blockers: readonly AphroditePublicLaunchVisualBlocker[] = [
  {
    id: "owner-manual-review-required",
    title: "Нужна ручная проверка владельца",
    severity: "manual-review-required",
    reason: "Package 207 не имеет права автоматически одобрять публичный запуск после визуального review.",
    requiredBeforeLaunch: ["Проверить Mini App на реальных устройствах", "Подтвердить screenshots и route paths", "Отдельно принять решение о запуске"],
  },
  {
    id: "real-device-visual-check-required",
    title: "Нужна проверка iPhone, Android и desktop Telegram",
    severity: "device-test-required",
    reason: "Browser/build QA не доказывает отсутствие WebView cache, safe-area, keyboard и viewport проблем.",
    requiredBeforeLaunch: ["iPhone Telegram check", "Android Telegram check", "desktop Telegram check", "browser fallback check"],
  },
  {
    id: "functional-smoke-before-public-launch",
    title: "Нужен functional smoke test перед публичным запуском",
    severity: "functional-smoke-required",
    reason: "Визуальная готовность не заменяет проверку кликов, ввода даты, fallback route и переходов между flow.",
    requiredBeforeLaunch: ["Проверить /miniapp", "Проверить /miniapp/love-reading-preview", "Проверить /birth-matrix", "Проверить /compatibility"],
  },
];

const safetyBoundaries: readonly AphroditePublicLaunchVisualSafetyBoundary[] = [
  {
    id: "production-launch",
    visibleLabel: "Нет production-запуска",
    currentState: "Review только показывает readiness; production launch не выполняется.",
    allowedNow: ["читать source", "показывать dashboard review", "создавать docs и QA"],
    blockedNow: ["public launch", "real production switch", "auto approve"],
  },
  {
    id: "telegram-api",
    visibleLabel: "Нет Telegram API",
    currentState: "Telegram API не вызывается, сообщения и invoices не отправляются.",
    allowedNow: ["читать route/source", "показывать checklist"],
    blockedNow: ["sendMessage", "sendPhoto", "sendInvoice", "BotFather changes"],
  },
  {
    id: "active-cta",
    visibleLabel: "Нет изменения active CTA",
    currentState: "Active Telegram CTA generation и startapp delivery logic не меняются.",
    allowedNow: ["добавить dashboard link"],
    blockedNow: ["изменить live CTA", "изменить bot sending logic"],
  },
  {
    id: "payments-vip-db",
    visibleLabel: "Нет оплаты / VIP / записи в базу данных",
    currentState: "Оплата, VIP unlock, entitlement creation, DB write и schema/migrations не добавляются.",
    allowedNow: ["read-only review", "static model", "QA assertions"],
    blockedNow: ["payment", "VIP unlock", "entitlement creation", "database write", "schema migration"],
  },
  {
    id: "workflows-publish",
    visibleLabel: "Нет изменения cron/workflows/publish scripts",
    currentState: "Workflows, cron, publish scripts и production delivery остаются без изменений.",
    allowedNow: ["dashboard QA update", "local Package 207 QA"],
    blockedNow: ["cron edit", "workflow edit", "publish script edit", "auto-posting"],
  },
];

const nextSteps: readonly AphroditePublicLaunchVisualNextStep[] = [
  {
    package: "Package 208",
    title: "Real Device Visual QA Checklist",
    purpose: "Создать чеклист ручной проверки на iPhone, Android, desktop Telegram и browser fallback перед решением о public launch.",
    mustNotDo: ["не запускать production", "не менять BotFather", "не вызывать Telegram API", "не добавлять оплату", "не открывать VIP"],
  },
];

export function getAphroditePublicLaunchVisualReadinessSurfaces(): AphroditePublicLaunchVisualReadinessSurface[] {
  return surfaces.map((surface) => ({
    ...surface,
    sourceFiles: [...surface.sourceFiles],
    evidence: [...surface.evidence],
    manualChecks: [...surface.manualChecks],
  }));
}

export function getAphroditePublicLaunchVisualReadinessChecklist(): AphroditePublicLaunchVisualChecklistItem[] {
  return checklist.map((item) => ({ ...item }));
}

export function getAphroditePublicLaunchVisualBlockers(): AphroditePublicLaunchVisualBlocker[] {
  return blockers.map((blocker) => ({
    ...blocker,
    requiredBeforeLaunch: [...blocker.requiredBeforeLaunch],
  }));
}

export function getAphroditePublicLaunchVisualSafetyBoundaries(): AphroditePublicLaunchVisualSafetyBoundary[] {
  return safetyBoundaries.map((boundary) => ({
    ...boundary,
    allowedNow: [...boundary.allowedNow],
    blockedNow: [...boundary.blockedNow],
  }));
}

export function getAphroditePublicLaunchVisualNextSteps(): AphroditePublicLaunchVisualNextStep[] {
  return nextSteps.map((step) => ({ ...step, mustNotDo: [...step.mustNotDo] }));
}
