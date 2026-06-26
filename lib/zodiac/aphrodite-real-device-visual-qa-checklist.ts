/**
 * Package 208: Aphrodite Real Device Visual QA Checklist.
 *
 * Manual QA checklist only. This model does not launch production, call
 * Telegram API, send messages, change BotFather, active CTA, payments, VIP,
 * database, workflows, cron, publish scripts, reminders, or notifications.
 */

export type AphroditeRealDeviceChecklistDevice = {
  id: string;
  title: string;
  environment: string;
  checklist: readonly string[];
  riskFocus: readonly string[];
};

export type AphroditeRealDeviceChecklistScreen = {
  id: string;
  title: string;
  routeOrFlow: string;
  expectedVisualResult: string;
  checks: readonly string[];
};

export type AphroditeRealDeviceChecklistSafetyBoundary = {
  id: string;
  visibleLabel: string;
  currentState: string;
};

export type AphroditeRealDeviceEvidenceStatus =
  | "PASS"
  | "NEEDS FIX"
  | "BLOCKED"
  | "NOT CHECKED"
  | "OWNER REVIEW REQUIRED";

export type AphroditeRealDeviceEvidenceCheck = {
  id: string;
  title: string;
  category: string;
  routeOrFlow: string;
  status: AphroditeRealDeviceEvidenceStatus;
  requiredScreenshot: string;
  passCriteria: string;
  failCriteria: string;
  cannotAutomate: readonly string[];
};

export type AphroditeRealDeviceOwnerReview = {
  status: "OWNER REVIEW REQUIRED";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  summary: string;
  requiredBeforeLaunch: readonly string[];
};

export type AphroditeRealDeviceVisualQaChecklistModel = {
  packageNumber: 208;
  evidencePackPackageNumber: 214;
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  evidenceStatuses: readonly AphroditeRealDeviceEvidenceStatus[];
  evidenceChecks: readonly AphroditeRealDeviceEvidenceCheck[];
  ownerManualReview: AphroditeRealDeviceOwnerReview;
  devices: readonly AphroditeRealDeviceChecklistDevice[];
  screens: readonly AphroditeRealDeviceChecklistScreen[];
  boundaries: readonly AphroditeRealDeviceChecklistSafetyBoundary[];
  launchFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    botFatherChanged: false;
    activeCtaChanged: false;
    databaseWriteAdded: false;
    paymentAdded: false;
    vipUnlockAdded: false;
  };
  nextRecommendedPackage: string;
};

export const APHRODITE_REAL_DEVICE_VISUAL_QA_TITLE =
  "Real Device Visual QA Checklist";

export const APHRODITE_REAL_DEVICE_VISUAL_QA_CLASSIFICATION =
  "Только manual QA / Ничего не запускается / Нет Telegram API";

export const APHRODITE_REAL_DEVICE_VISUAL_QA_RULE =
  "Package 208 задаёт ручной real-device visual QA checklist для Aphrodite Mini App. Он ничего не запускает, не вызывает Telegram API, не отправляет сообщения, не меняет BotFather, active CTA, оплату, VIP, БД, workflows, cron или publish scripts.";

export const APHRODITE_REAL_DEVICE_VISUAL_QA_SAFETY_LABELS = [
  "Нет production-запуска",
  "Нет Telegram API",
  "Нет отправки сообщений",
  "Нет изменения BotFather",
  "Нет изменения active CTA",
  "Нет оплаты",
  "Нет VIP-разблокировки",
  "Нет записи в базу данных",
  "Real device checklist ничего не запускает",
] as const;

export const APHRODITE_REAL_DEVICE_EVIDENCE_STATUSES = [
  "PASS",
  "NEEDS FIX",
  "BLOCKED",
  "NOT CHECKED",
  "OWNER REVIEW REQUIRED",
] as const satisfies readonly AphroditeRealDeviceEvidenceStatus[];

const devices: readonly AphroditeRealDeviceChecklistDevice[] = [
  {
    id: "iphone-telegram-webview",
    title: "iPhone Telegram WebView",
    environment: "iOS Telegram Mini App",
    checklist: ["Открыть /miniapp из Telegram", "Проверить safe area", "Проверить клавиатуру на вводе даты", "Проверить back button behavior"],
    riskFocus: ["Telegram safe area", "keyboard open state", "WebView cache", "narrow screen"],
  },
  {
    id: "android-telegram-webview",
    title: "Android Telegram WebView",
    environment: "Android Telegram Mini App",
    checklist: ["Открыть /miniapp из Telegram", "Проверить scroll после клавиатуры", "Проверить ввод 15.06.1998", "Проверить fallback /miniapp/love-reading-preview"],
    riskFocus: ["keyboard open state", "date input issue", "Telegram WebView issue", "back button behavior"],
  },
  {
    id: "telegram-desktop",
    title: "Telegram Desktop",
    environment: "Desktop Telegram Mini App",
    checklist: ["Проверить /miniapp", "Проверить ширину карточек", "Проверить переходы в /birth-matrix и /compatibility", "Проверить, что нет production action"],
    riskFocus: ["desktop width", "route navigation", "fallback route", "visual hierarchy"],
  },
  {
    id: "iphone-safari",
    title: "iPhone Safari",
    environment: "Browser fallback on iOS",
    checklist: ["Открыть browser fallback", "Проверить narrow screens", "Проверить date input", "Проверить readability длинных русских строк"],
    riskFocus: ["browser fallback", "narrow screens", "keyboard open state", "text too long"],
  },
  {
    id: "android-chrome",
    title: "Android Chrome",
    environment: "Browser fallback on Android",
    checklist: ["Открыть /miniapp", "Проверить /miniapp/love-reading-preview", "Проверить /birth-matrix", "Проверить slow network mode if possible"],
    riskFocus: ["browser fallback", "slow network mode", "mobile overflow", "loading state"],
  },
  {
    id: "desktop-browser",
    title: "desktop browser",
    environment: "Desktop browser fallback",
    checklist: ["Открыть /miniapp", "Проверить /compatibility", "Проверить dashboard review links", "Проверить отсутствие Telegram-only crash"],
    riskFocus: ["browser fallback", "desktop width", "route links", "error state"],
  },
  {
    id: "narrow-screens",
    title: "narrow screens",
    environment: "320-390px viewport",
    checklist: ["Проверить первый экран", "Проверить CTA", "Проверить карточки результата", "Проверить отсутствие горизонтального overflow"],
    riskFocus: ["mobile overflow", "text too long", "CTA hierarchy", "visual spacing"],
  },
  {
    id: "slow-network-mode",
    title: "slow network mode if possible",
    environment: "Browser or device throttling",
    checklist: ["Проверить initial loading", "Проверить fallback state", "Проверить повторное открытие", "Проверить отсутствие пустого экрана"],
    riskFocus: ["loading state issue", "fallback state", "cache/deploy issue", "blank screen"],
  },
  {
    id: "telegram-safe-area",
    title: "Telegram safe area",
    environment: "Telegram WebView chrome",
    checklist: ["Проверить верхний отступ", "Проверить нижний CTA", "Проверить клавиатуру", "Проверить back button behavior"],
    riskFocus: ["Telegram safe area", "keyboard open state", "fixed CTA", "back button behavior"],
  },
  {
    id: "keyboard-open-state",
    title: "keyboard open state",
    environment: "Birth date and compatibility forms",
    checklist: ["Фокус на поле даты", "Ввод 15.06.1998", "Ввод 01.01.1990", "Проверить, что поле не сбрасывается"],
    riskFocus: ["date input issue", "keyboard overlap", "scroll jump", "text input"],
  },
  {
    id: "back-button-behavior",
    title: "back button behavior",
    environment: "Telegram and browser navigation",
    checklist: ["Назад из love preview", "Назад из birth matrix", "Назад из compatibility result", "Проверить, что пользователь не теряет контекст"],
    riskFocus: ["route navigation", "state restore", "fallback route", "wrong route"],
  },
];

const screens: readonly AphroditeRealDeviceChecklistScreen[] = [
  {
    id: "miniapp",
    title: "/miniapp",
    routeOrFlow: "/miniapp",
    expectedVisualResult: "Главный экран читаемый, один основной CTA, вторичные сценарии не перегружают первый экран.",
    checks: ["AI Love Reading entry", "Матрица судьбы entry", "Совместимость entry", "нет payment/VIP CTA"],
  },
  {
    id: "love-reading-preview",
    title: "AI Love Reading preview",
    routeOrFlow: "/miniapp/love-reading-preview",
    expectedVisualResult: "Preview выглядит как бесплатный результат и безопасный fallback.",
    checks: ["читать на narrow screen", "проверить fallback", "нет активной оплаты", "нет VIP unlock"],
  },
  {
    id: "birth-matrix",
    title: "Birth Matrix",
    routeOrFlow: "/birth-matrix",
    expectedVisualResult: "Текстовый ввод даты и результат Матрицы судьбы не ломают экран на мобильном.",
    checks: ["15.06.1998", "01.01.1990", "future date blocked", "Birth Matrix result"],
  },
  {
    id: "compatibility",
    title: "Compatibility",
    routeOrFlow: "/compatibility",
    expectedVisualResult: "Форма пары, результат и 30 days couple calendar читаются без повторов и overflow.",
    checks: ["compatibility result", "30 days couple calendar", "copy personalization", "share/fallback controls"],
  },
  {
    id: "mystic-universe",
    title: "Mystic / Universe",
    routeOrFlow: "Mystic sections / Universe panel",
    expectedVisualResult: "Mystic блоки выглядят мягко и не создают тревожный prediction tone.",
    checks: ["Daily Card", "Tarot", "Rune", "Послание Вселенной"],
  },
  {
    id: "daily-horoscope-card",
    title: "daily horoscope card",
    routeOrFlow: "daily horoscope visual card",
    expectedVisualResult: "Daily card компактная и не превращается в стену текста.",
    checks: ["period badge", "loveRelationship", "energy", "CTA/fallback area"],
  },
  {
    id: "weekly-horoscope-card",
    title: "weekly horoscope card",
    routeOrFlow: "weekly horoscope visual card",
    expectedVisualResult: "Weekly card показывает новую неделю и выглядит компактно.",
    checks: ["weekStart/weekEnd", "Новая неделя", "period badge", "CTA/fallback area"],
  },
  {
    id: "monthly-horoscope-card",
    title: "monthly horoscope card",
    routeOrFlow: "monthly horoscope visual card",
    expectedVisualResult: "Monthly card показывает следующий месяц после 20 числа и остаётся readable.",
    checks: ["month label", "Июль 2026", "main theme", "CTA/fallback area"],
  },
  {
    id: "fallback-love-preview",
    title: "fallback /miniapp/love-reading-preview",
    routeOrFlow: "/miniapp/love-reading-preview",
    expectedVisualResult: "Fallback ведёт в бесплатный preview и не выглядит как ошибка.",
    checks: ["free preview", "locked fallback", "return to Mini App", "no entitlement creation"],
  },
  {
    id: "guard-denied-future-vip",
    title: "guard denied/future VIP locked state",
    routeOrFlow: "future VIP locked fallback",
    expectedVisualResult: "Locked state объясняет ограничение мягко и не открывает VIP.",
    checks: ["guard denied copy", "free preview fallback", "no VIP unlock", "no payment"],
  },
];

const boundaries: readonly AphroditeRealDeviceChecklistSafetyBoundary[] = [
  {
    id: "no-production-launch",
    visibleLabel: "Нет production-запуска",
    currentState: "Checklist описывает ручные проверки и не запускает production.",
  },
  {
    id: "no-telegram-api",
    visibleLabel: "Нет Telegram API",
    currentState: "Telegram API не вызывается, сообщения и invoices не отправляются.",
  },
  {
    id: "no-botfather-active-cta",
    visibleLabel: "Нет изменения BotFather / active CTA",
    currentState: "BotFather, active Telegram CTA generation и bot sending logic не меняются.",
  },
  {
    id: "no-db-payment-vip",
    visibleLabel: "Нет записи в базу данных / оплаты / VIP-разблокировки",
    currentState: "Checklist не пишет в БД, не включает оплату, не создаёт entitlement и не открывает VIP.",
  },
];

const evidenceChecks: readonly AphroditeRealDeviceEvidenceCheck[] = [
  {
    id: "desktop-check",
    title: "desktop check",
    category: "desktop browser check",
    routeOrFlow: "/miniapp, /birth-matrix, /compatibility",
    status: "NOT CHECKED",
    requiredScreenshot: "Full desktop browser screenshot with first viewport, cards, CTA, and route visible.",
    passCriteria: "Desktop layout is readable, cards do not collapse, CTAs are visible, and no horizontal overflow appears.",
    failCriteria: "Text overlaps, cards overflow, CTA is hidden, or the route shows a stale/broken launch-readiness state.",
    cannotAutomate: ["owner must inspect the real rendered browser", "no production launch", "no Telegram message sending"],
  },
  {
    id: "mobile-browser-check",
    title: "mobile browser check",
    category: "mobile browser check",
    routeOrFlow: "/miniapp, /birth-matrix, /compatibility on 360px / 390px / 430px",
    status: "NOT CHECKED",
    requiredScreenshot: "Mobile browser screenshot for 360px, 390px, and 430px widths.",
    passCriteria: "Russian text wraps cleanly, primary CTA is visible, date input remains usable, and no horizontal scroll is present.",
    failCriteria: "Any long Russian text clips, CTA is below an unusable fold, input is reset, or mobile overflow appears.",
    cannotAutomate: ["no device cache clearing by code", "no DB write", "no analytics event"],
  },
  {
    id: "telegram-webview-check",
    title: "Telegram WebView check",
    category: "Telegram WebView check",
    routeOrFlow: "Telegram Mini App WebView",
    status: "OWNER REVIEW REQUIRED",
    requiredScreenshot: "iOS Telegram and Android Telegram screenshot with WebView chrome/safe area visible.",
    passCriteria: "Safe area, keyboard state, scroll, and back behavior work without hiding the active screen or CTA.",
    failCriteria: "Telegram WebView shows old UI, stale calendar, clipped content, hidden CTA, or wrong route.",
    cannotAutomate: ["Telegram API is not called", "BotFather is not changed", "active CTA logic is not changed"],
  },
  {
    id: "startapp-deep-link-check",
    title: "startapp/deep link check",
    category: "startapp/deep link check",
    routeOrFlow: "default, love_reading, compatibility, birth_matrix, daily, weekly, monthly",
    status: "OWNER REVIEW REQUIRED",
    requiredScreenshot: "Screenshot showing the startapp entry path, expected route, and actual opened screen.",
    passCriteria: "Each startapp parameter opens the expected screen or a documented safe fallback.",
    failCriteria: "Wrong route opens, stale deployment appears, or cache-buster and live URL disagree.",
    cannotAutomate: ["no BotFather edit", "no Telegram send", "no live deployment change"],
  },
  {
    id: "miniapp-main-screen-check",
    title: "Mini App main screen check",
    category: "Mini App main screen check",
    routeOrFlow: "/miniapp",
    status: "NOT CHECKED",
    requiredScreenshot: "First viewport of /miniapp with main offer, navigation choices, and visible CTA.",
    passCriteria: "Main screen is understandable, CTA hierarchy is clear, and secondary routes are discoverable.",
    failCriteria: "Screen looks like a dead hub, CTA is unclear, or product entries are visually hidden.",
    cannotAutomate: ["no active CTA logic change", "no Telegram API", "no production launch"],
  },
  {
    id: "compatibility-flow-check",
    title: "compatibility flow check",
    category: "compatibility flow check",
    routeOrFlow: "/compatibility",
    status: "NOT CHECKED",
    requiredScreenshot: "Compatibility form, result, and 30 days couple calendar screenshots.",
    passCriteria: "Two-person form accepts dates, result is personalized, and repeated-copy issues are absent.",
    failCriteria: "The same text repeats for all days, fields reset, result overflows, or CTA is unreadable.",
    cannotAutomate: ["no DB write", "no message sending", "no payment or VIP unlock"],
  },
  {
    id: "birth-matrix-flow-check",
    title: "Birth Matrix flow check",
    category: "Birth Matrix flow check",
    routeOrFlow: "/birth-matrix",
    status: "NOT CHECKED",
    requiredScreenshot: "Birth date text input, accepted 15.06.1998 / 01.01.1990, and result screen.",
    passCriteria: "Text date input stays stable, supports valid dates, blocks future dates, and result layout is readable.",
    failCriteria: "Native date picker appears, valid dates cannot be entered, or result overflows on mobile.",
    cannotAutomate: ["no database persistence", "no analytics event", "no Telegram send"],
  },
  {
    id: "mystic-cards-flow-check",
    title: "Mystic cards flow check",
    category: "Mystic cards flow check",
    routeOrFlow: "Mystic sections / Universe panel",
    status: "NOT CHECKED",
    requiredScreenshot: "Daily Card, Tarot, Rune, and Universe message cards on a real mobile viewport.",
    passCriteria: "Mystic cards are readable, calm in tone, visually separated, and do not obscure controls.",
    failCriteria: "Cards overlap, tone feels alarming, text clips, or route is not reachable from Mini App.",
    cannotAutomate: ["no prediction delivery", "no external analytics", "no Telegram API"],
  },
  {
    id: "vip-locked-state-check",
    title: "VIP locked state check",
    category: "VIP locked state check",
    routeOrFlow: "future VIP locked fallback",
    status: "BLOCKED",
    requiredScreenshot: "Locked/fallback state showing that VIP is not unlocked and free preview remains available.",
    passCriteria: "Locked state explains the limitation softly and never grants VIP or paid entitlement.",
    failCriteria: "Any VIP content is unlocked, entitlement appears active, or payment CTA behaves as live.",
    cannotAutomate: ["no payment", "no VIP unlock", "no entitlement creation"],
  },
  {
    id: "cta-visibility-check",
    title: "CTA visibility check",
    category: "CTA visibility check",
    routeOrFlow: "/miniapp and key flows",
    status: "NOT CHECKED",
    requiredScreenshot: "First viewport and post-result viewport where CTA buttons are visible.",
    passCriteria: "Primary CTA is visible, secondary CTA is not confused with production launch, and text fits.",
    failCriteria: "CTA is hidden below WebView chrome, clipped, ambiguous, or appears to trigger a forbidden live action.",
    cannotAutomate: ["active CTA logic is not changed", "no Telegram send", "no production launch"],
  },
  {
    id: "cache-version-marker-check",
    title: "cache/version marker check",
    category: "cache/version marker check",
    routeOrFlow: "/miniapp, /birth-matrix, /compatibility, live URL with cache-buster",
    status: "OWNER REVIEW REQUIRED",
    requiredScreenshot: "Live route screenshot plus URL/cache-buster or visible version marker evidence.",
    passCriteria: "Live route matches latest deployed UI and Telegram WebView does not show a stale cached screen.",
    failCriteria: "Browser/live and Telegram WebView disagree, old date/calendar UI appears, or deployed commit is stale.",
    cannotAutomate: ["no deploy is triggered", "no cache is cleared by code", "no Telegram API"],
  },
  {
    id: "owner-manual-review-status",
    title: "owner manual review status",
    category: "owner manual review status",
    routeOrFlow: "public launch owner decision",
    status: "OWNER REVIEW REQUIRED",
    requiredScreenshot: "Owner's final evidence pack summary with PASS/BLOCKED/NEEDS FIX notes before launch.",
    passCriteria: "Owner confirms all required evidence, blockers are resolved, and launch approval is explicit outside this package.",
    failCriteria: "Any mandatory screen remains NOT CHECKED, NEEDS FIX, or BLOCKED.",
    cannotAutomate: ["publicLaunchApproved remains false", "ownerManualReviewRequired remains true", "launch remains not approved"],
  },
];

const ownerManualReview: AphroditeRealDeviceOwnerReview = {
  status: "OWNER REVIEW REQUIRED",
  publicLaunchApproved: false,
  ownerManualReviewRequired: true,
  summary: "Launch remains not approved. Package 214 only records the evidence that the owner must review manually.",
  requiredBeforeLaunch: [
    "all mandatory screenshots collected",
    "all PASS criteria confirmed by owner",
    "all NEEDS FIX and BLOCKED items moved to Visual Issue Triage Board",
    "DATABASE_URL / TELEGRAM_BOT_TOKEN / backup age blockers reviewed separately",
    "explicit owner approval outside this package",
  ],
};

export function getAphroditeRealDeviceVisualQaChecklist(): AphroditeRealDeviceVisualQaChecklistModel {
  return {
    packageNumber: 208,
    evidencePackPackageNumber: 214,
    title: APHRODITE_REAL_DEVICE_VISUAL_QA_TITLE,
    classification: APHRODITE_REAL_DEVICE_VISUAL_QA_CLASSIFICATION,
    safetyLabels: APHRODITE_REAL_DEVICE_VISUAL_QA_SAFETY_LABELS,
    evidenceStatuses: [...APHRODITE_REAL_DEVICE_EVIDENCE_STATUSES],
    evidenceChecks: evidenceChecks.map((check) => ({
      ...check,
      cannotAutomate: [...check.cannotAutomate],
    })),
    ownerManualReview: {
      ...ownerManualReview,
      requiredBeforeLaunch: [...ownerManualReview.requiredBeforeLaunch],
    },
    devices: devices.map((device) => ({
      ...device,
      checklist: [...device.checklist],
      riskFocus: [...device.riskFocus],
    })),
    screens: screens.map((screen) => ({
      ...screen,
      checks: [...screen.checks],
    })),
    boundaries: boundaries.map((boundary) => ({ ...boundary })),
    launchFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      botFatherChanged: false,
      activeCtaChanged: false,
      databaseWriteAdded: false,
      paymentAdded: false,
      vipUnlockAdded: false,
    },
    nextRecommendedPackage: "Package 209 — Telegram WebView / StartApp Route Diagnostics",
  };
}
