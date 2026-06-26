/**
 * Package 209: Telegram WebView / StartApp Route Diagnostics.
 *
 * Diagnostics/readiness only. This model does not call Telegram API, change
 * BotFather, active CTA generation, live startapp config, production delivery,
 * database, payments, VIP, workflows, cron, or publish scripts.
 */

export type AphroditeStartAppDiagnosticRoute = {
  id: string;
  startapp: string;
  expectedRoute: string;
  expectedScreen: string;
  diagnosisSignals: readonly string[];
  wrongRouteSymptoms: readonly string[];
};

export type AphroditeWebViewCacheDiagnostic = {
  id: string;
  title: string;
  symptom: string;
  check: string;
  recommendedManualAction: string;
};

export type AphroditeWebViewPlatformDiagnostic = {
  id: string;
  title: string;
  behaviorToCheck: readonly string[];
  riskNotes: readonly string[];
};

export type AphroditeWebViewFinalDiagnosticStatus =
  | "DETECTED"
  | "NOT DETECTED"
  | "EXPECTED"
  | "MISSING"
  | "MANUAL CHECK REQUIRED"
  | "FALLBACK BROWSER MODE"
  | "CACHE MARKER CHECK REQUIRED"
  | "OWNER REVIEW REQUIRED"
  | "LAUNCH NOT APPROVED";

export type AphroditeWebViewFinalDiagnostic = {
  id: string;
  title: string;
  status: AphroditeWebViewFinalDiagnosticStatus;
  expectedSignal: string;
  missingSignalMeaning: string;
  manualAction: string;
  notCodeFailureWhen: string;
};

export type AphroditeWebViewOwnerReview = {
  status: "OWNER REVIEW REQUIRED";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  summary: string;
  remainingManualChecks: readonly string[];
};

export type AphroditeTelegramWebViewStartAppDiagnosticsModel = {
  packageNumber: 209;
  finalDiagnosticsPackageNumber: 215;
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  routes: readonly AphroditeStartAppDiagnosticRoute[];
  cacheDiagnostics: readonly AphroditeWebViewCacheDiagnostic[];
  platformDiagnostics: readonly AphroditeWebViewPlatformDiagnostic[];
  finalDiagnostics: readonly AphroditeWebViewFinalDiagnostic[];
  ownerManualReview: AphroditeWebViewOwnerReview;
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    botFatherChanged: false;
    activeCtaChanged: false;
    messagesSent: false;
    databaseWriteAdded: false;
    paymentAdded: false;
    vipUnlockAdded: false;
  };
  nextRecommendedPackage: string;
};

export const APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_DIAGNOSTICS_TITLE =
  "Диагностика Telegram WebView / startapp";

export const APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_DIAGNOSTICS_CLASSIFICATION =
  "Только диагностика / BotFather не изменяется / Нет Telegram API";

export const APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_DIAGNOSTICS_RULE =
  "Package 209 описывает диагностику Telegram WebView, startapp routes, cache symptoms и wrong route symptoms. Он не меняет BotFather, active CTA, live startapp config, Telegram API, production delivery, оплату, VIP или БД.";

export const APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_DIAGNOSTICS_SAFETY_LABELS = [
  "Нет production-запуска",
  "Нет Telegram API",
  "Нет изменения BotFather",
  "Нет изменения active CTA",
  "Нет отправки сообщений",
  "Нет записи в базу данных",
  "Нет оплаты",
  "Нет VIP-разблокировки",
  "StartApp diagnostics ничего не меняет",
] as const;

const routes: readonly AphroditeStartAppDiagnosticRoute[] = [
  {
    id: "default-miniapp-open",
    startapp: "default Mini App open",
    expectedRoute: "/miniapp",
    expectedScreen: "Mini App home",
    diagnosisSignals: ["AphroditeMiniAppShell", "AI Love Reading entry", "Матрица судьбы", "Совместимость"],
    wrongRouteSymptoms: ["открывается /compatibility вместо /miniapp", "показывается старый hub", "нет AI Love Reading entry"],
  },
  {
    id: "love-reading",
    startapp: "love_reading",
    expectedRoute: "/miniapp/love-reading-preview",
    expectedScreen: "AI Love Reading preview",
    diagnosisSignals: ["AI Love Reading preview", "free preview", "fallback route", "no payment"],
    wrongRouteSymptoms: ["открывается paywall", "показывается пустой экран", "preview не содержит fallback"],
  },
  {
    id: "compatibility",
    startapp: "compatibility",
    expectedRoute: "/compatibility",
    expectedScreen: "Compatibility flow",
    diagnosisSignals: ["Compatibility", "compatibility result", "30 days couple calendar", "birth date input"],
    wrongRouteSymptoms: ["открывается общий hub", "не сохраняется state пары", "нет 30 days couple calendar"],
  },
  {
    id: "birth-matrix",
    startapp: "birth_matrix",
    expectedRoute: "/birth-matrix",
    expectedScreen: "Birth Matrix",
    diagnosisSignals: ["Birth Matrix", "Матрица судьбы", "data-birth-date-ui", "Birth Matrix result"],
    wrongRouteSymptoms: ["старый date picker", "дата сбрасывается", "результат не появляется"],
  },
  {
    id: "daily",
    startapp: "daily",
    expectedRoute: "/miniapp",
    expectedScreen: "daily horoscope card entry",
    diagnosisSignals: ["daily horoscope card", "Сегодня", "CTA/fallback area"],
    wrongRouteSymptoms: ["daily entry отсутствует", "карточка выглядит как wall of text", "период не виден"],
  },
  {
    id: "weekly",
    startapp: "weekly",
    expectedRoute: "/miniapp",
    expectedScreen: "weekly horoscope card entry",
    diagnosisSignals: ["weekly horoscope card", "Новая неделя", "weekStart/weekEnd"],
    wrongRouteSymptoms: ["weekly label показывает прошлую неделю", "нет period badge", "непонятный target period"],
  },
  {
    id: "monthly",
    startapp: "monthly",
    expectedRoute: "/miniapp",
    expectedScreen: "monthly horoscope card entry",
    diagnosisSignals: ["monthly horoscope card", "Июль 2026", "следующий календарный месяц"],
    wrongRouteSymptoms: ["после 20 числа показывается текущий месяц", "месяц не виден", "карточка перегружена"],
  },
  {
    id: "fallback-route",
    startapp: "fallback route",
    expectedRoute: "/miniapp/love-reading-preview",
    expectedScreen: "Fallback free preview",
    diagnosisSignals: ["fallback", "free preview", "locked state", "no entitlement"],
    wrongRouteSymptoms: ["fallback выглядит как ошибка", "появляется активная покупка", "VIP выглядит открытым"],
  },
];

const cacheDiagnostics: readonly AphroditeWebViewCacheDiagnostic[] = [
  {
    id: "stale-telegram-webview-cache",
    title: "stale Telegram WebView cache",
    symptom: "Telegram показывает старый календарь, старый hub или старую копию UI после deploy.",
    check: "Сравнить visible UI с source marker, version marker check и cache-buster query check.",
    recommendedManualAction: "Полностью закрыть Telegram, очистить cache, открыть Mini App заново и проверить route path.",
  },
  {
    id: "wrong-route-symptoms",
    title: "wrong route symptoms",
    symptom: "Пользователь видит не тот экран: hub вместо preview, compatibility вместо /miniapp, старый locked state.",
    check: "Сверить startapp параметр, ожидаемый route и фактический URL/screen title.",
    recommendedManualAction: "Попросить screenshot и путь открытия, затем проверить соответствующий startapp diagnostic row.",
  },
  {
    id: "version-marker-check",
    title: "version marker check",
    symptom: "Live route может быть stale даже при правильном source commit.",
    check: "Проверить visible marker или dashboard readiness marker для /miniapp, /birth-matrix, /compatibility.",
    recommendedManualAction: "Открыть route с cache-buster query и сравнить HTML/JS с актуальным commit.",
  },
  {
    id: "cache-buster-query-check",
    title: "cache-buster query check",
    symptom: "Обычный URL показывает старую версию, а URL с query показывает новую.",
    check: "Добавить безопасный query вроде ?v=<commit> и сравнить screen state.",
    recommendedManualAction: "Если query помогает, проблема вероятно в cache/deploy propagation, а не в source.",
  },
];

const platformDiagnostics: readonly AphroditeWebViewPlatformDiagnostic[] = [
  {
    id: "ios-telegram-webview",
    title: "iOS Telegram WebView behavior",
    behaviorToCheck: ["safe area", "keyboard open state", "back button behavior", "stale cache after reopen"],
    riskNotes: ["iOS может удерживать старую WebView-сессию", "клавиатура может перекрывать date input"],
  },
  {
    id: "android-telegram-webview",
    title: "Android Telegram WebView behavior",
    behaviorToCheck: ["scroll after keyboard", "cache after force close", "route after startapp", "date input stability"],
    riskNotes: ["Android может восстанавливать старый route", "keyboard resize может ломать visual layout"],
  },
  {
    id: "telegram-desktop",
    title: "Telegram Desktop behavior",
    behaviorToCheck: ["desktop width", "fallback route", "route title", "no horizontal overflow"],
    riskNotes: ["desktop width отличается от mobile", "route может открываться как browser fallback"],
  },
  {
    id: "browser-fallback",
    title: "browser fallback behavior",
    behaviorToCheck: ["direct URL open", "cache-buster query", "no Telegram-only crash", "same visual marker as WebView"],
    riskNotes: ["browser fallback помогает отделить code issue от Telegram WebView cache"],
  },
];

const finalDiagnostics: readonly AphroditeWebViewFinalDiagnostic[] = [
  {
    id: "telegram-webview-detected",
    title: "Telegram WebView detected",
    status: "DETECTED",
    expectedSignal: "window.Telegram.WebApp exists on a real Telegram Mini App device.",
    missingSignalMeaning: "If this signal is absent, the page is probably opened in a normal browser or Telegram did not inject WebApp context.",
    manualAction: "Open the Mini App from Telegram on iOS and Android, then capture the screen and route path.",
    notCodeFailureWhen: "Opening the route in a desktop browser or direct URL will usually not expose Telegram WebApp context.",
  },
  {
    id: "telegram-webview-not-detected",
    title: "Telegram WebView not detected",
    status: "NOT DETECTED",
    expectedSignal: "Browser fallback mode is allowed for direct URL checks.",
    missingSignalMeaning: "No Telegram WebView context means startapp/init data cannot be trusted from that session.",
    manualAction: "Compare browser fallback with real Telegram WebView before classifying the issue.",
    notCodeFailureWhen: "Telegram WebView not detected in a normal browser is expected and is not a code failure.",
  },
  {
    id: "startapp-param-expected",
    title: "startapp param expected",
    status: "EXPECTED",
    expectedSignal: "startapp/deep link contains one of: love_reading, compatibility, birth_matrix, daily, weekly, monthly.",
    missingSignalMeaning: "If the owner opened the default Mini App button, there may be no startapp parameter.",
    manualAction: "Record the exact entry point, startapp parameter, expected route, and actual screen title.",
    notCodeFailureWhen: "A missing startapp parameter on default browser/manual open is not a code failure.",
  },
  {
    id: "startapp-param-missing",
    title: "startapp param missing",
    status: "MISSING",
    expectedSignal: "Telegram should pass the expected startapp parameter only when the deep link was opened with one.",
    missingSignalMeaning: "Missing startapp can mean default open, wrong BotFather button, stale Telegram cache, or unsupported entry path.",
    manualAction: "Ask for screenshot plus the exact Telegram button/link used; verify against the startapp route table.",
    notCodeFailureWhen: "No startapp in a regular browser URL or default Mini App open is not a code failure.",
  },
  {
    id: "startapp-manual-check-required",
    title: "startapp/deep link manual check required",
    status: "MANUAL CHECK REQUIRED",
    expectedSignal: "Real device opens the expected route for each documented startapp value.",
    missingSignalMeaning: "Automated source checks cannot prove that Telegram passed the parameter in a live WebView.",
    manualAction: "Manually test default, love_reading, compatibility, birth_matrix, daily, weekly, and monthly from Telegram.",
    notCodeFailureWhen: "Local browser success does not prove Telegram WebView success; it only narrows the diagnosis.",
  },
  {
    id: "fallback-browser-mode",
    title: "fallback browser mode",
    status: "FALLBACK BROWSER MODE",
    expectedSignal: "Direct browser open works without Telegram-only crashes and may not include startapp/init data.",
    missingSignalMeaning: "Missing Telegram-specific fields in browser fallback should not block source QA.",
    manualAction: "Use browser fallback to separate code/rendering issues from Telegram WebView cache or routing issues.",
    notCodeFailureWhen: "Absence of startapp in a normal browser is not a code failure.",
  },
  {
    id: "cache-marker-status",
    title: "cache marker status",
    status: "CACHE MARKER CHECK REQUIRED",
    expectedSignal: "Fresh live version matches current source markers and does not show old UI.",
    missingSignalMeaning: "A mismatch between browser and Telegram can indicate stale deploy, browser cache, or Telegram WebView cache.",
    manualAction: "Compare live URL with cache-buster, /miniapp, /birth-matrix, /compatibility, and Telegram WebView screenshots.",
    notCodeFailureWhen: "Source/build pass but Telegram shows old UI usually points to stale cache/deploy, not this diagnostics code.",
  },
  {
    id: "owner-manual-review",
    title: "owner manual review",
    status: "OWNER REVIEW REQUIRED",
    expectedSignal: "Owner confirms real Telegram WebView screenshots and route/startapp evidence.",
    missingSignalMeaning: "Without owner evidence, launch readiness remains unresolved.",
    manualAction: "Owner must collect screenshots, classify issues, and approve launch outside this package.",
    notCodeFailureWhen: "Manual review pending is a readiness blocker, not a code failure.",
  },
  {
    id: "launch-not-approved",
    title: "launch not approved",
    status: "LAUNCH NOT APPROVED",
    expectedSignal: "publicLaunchApproved=false and ownerManualReviewRequired=true.",
    missingSignalMeaning: "This package intentionally does not grant launch approval.",
    manualAction: "Keep public launch blocked until owner review, env blockers, backup freshness, and live checks pass.",
    notCodeFailureWhen: "Launch not approved is the required safe state for Package 215.",
  },
];

const ownerManualReview: AphroditeWebViewOwnerReview = {
  status: "OWNER REVIEW REQUIRED",
  publicLaunchApproved: false,
  ownerManualReviewRequired: true,
  summary: "Telegram WebView must be checked manually on a real device. BotFather was not changed, Telegram API was not used, and no messages were sent.",
  remainingManualChecks: [
    "verify Telegram WebView detected on iOS Telegram",
    "verify Telegram WebView detected on Android Telegram",
    "verify every expected startapp/deep link route",
    "confirm missing startapp in normal browser is not treated as code failure",
    "compare fresh live cache marker against Telegram WebView",
    "confirm launch remains not approved until owner review is complete",
  ],
};

export function getAphroditeTelegramWebViewStartAppDiagnostics(): AphroditeTelegramWebViewStartAppDiagnosticsModel {
  return {
    packageNumber: 209,
    finalDiagnosticsPackageNumber: 215,
    title: APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_DIAGNOSTICS_TITLE,
    classification: APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_DIAGNOSTICS_CLASSIFICATION,
    safetyLabels: APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_DIAGNOSTICS_SAFETY_LABELS,
    routes: routes.map((route) => ({
      ...route,
      diagnosisSignals: [...route.diagnosisSignals],
      wrongRouteSymptoms: [...route.wrongRouteSymptoms],
    })),
    cacheDiagnostics: cacheDiagnostics.map((diagnostic) => ({ ...diagnostic })),
    platformDiagnostics: platformDiagnostics.map((platform) => ({
      ...platform,
      behaviorToCheck: [...platform.behaviorToCheck],
      riskNotes: [...platform.riskNotes],
    })),
    finalDiagnostics: finalDiagnostics.map((diagnostic) => ({ ...diagnostic })),
    ownerManualReview: {
      ...ownerManualReview,
      remainingManualChecks: [...ownerManualReview.remainingManualChecks],
    },
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      botFatherChanged: false,
      activeCtaChanged: false,
      messagesSent: false,
      databaseWriteAdded: false,
      paymentAdded: false,
      vipUnlockAdded: false,
    },
    nextRecommendedPackage: "Package 210 — Live Version & Cache Marker Readiness",
  };
}
