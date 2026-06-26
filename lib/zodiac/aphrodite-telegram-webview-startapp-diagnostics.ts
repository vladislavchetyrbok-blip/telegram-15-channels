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

export type AphroditeTelegramWebViewStartAppDiagnosticsModel = {
  packageNumber: 209;
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  routes: readonly AphroditeStartAppDiagnosticRoute[];
  cacheDiagnostics: readonly AphroditeWebViewCacheDiagnostic[];
  platformDiagnostics: readonly AphroditeWebViewPlatformDiagnostic[];
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

export function getAphroditeTelegramWebViewStartAppDiagnostics(): AphroditeTelegramWebViewStartAppDiagnosticsModel {
  return {
    packageNumber: 209,
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
