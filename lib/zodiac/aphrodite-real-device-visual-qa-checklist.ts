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

export type AphroditeRealDeviceVisualQaChecklistModel = {
  packageNumber: 208;
  title: string;
  classification: string;
  safetyLabels: readonly string[];
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

export function getAphroditeRealDeviceVisualQaChecklist(): AphroditeRealDeviceVisualQaChecklistModel {
  return {
    packageNumber: 208,
    title: APHRODITE_REAL_DEVICE_VISUAL_QA_TITLE,
    classification: APHRODITE_REAL_DEVICE_VISUAL_QA_CLASSIFICATION,
    safetyLabels: APHRODITE_REAL_DEVICE_VISUAL_QA_SAFETY_LABELS,
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
