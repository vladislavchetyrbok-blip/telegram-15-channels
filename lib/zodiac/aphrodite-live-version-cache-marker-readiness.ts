/**
 * Package 210: Live Version & Cache Marker Readiness.
 *
 * Readiness/documentation only. This model does not change deploy settings,
 * workflows, production launch settings, active publishing, Telegram API,
 * database, payments, VIP, cron, or publish scripts.
 */

export type AphroditeLiveVersionMarkerCheck = {
  id: string;
  title: string;
  target: string;
  markerOrSignal: string;
  verificationMethod: string;
  staleSymptoms: readonly string[];
};

export type AphroditeRouteMarkerReadiness = {
  id: string;
  route: string;
  expectedMarkerStrategy: string;
  check: string;
  fallbackDiagnosis: string;
};

export type AphroditeLiveVersionCacheMarkerReadinessModel = {
  packageNumber: 210;
  title: string;
  classification: string;
  dashboardOnlyMarker: {
    attribute: "data-aphrodite-visual-version";
    value: "v1-visual-polish";
    scope: "dashboard-readiness-only";
  };
  safetyLabels: readonly string[];
  markerChecks: readonly AphroditeLiveVersionMarkerCheck[];
  routeMarkers: readonly AphroditeRouteMarkerReadiness[];
  cacheDiagnostics: readonly string[];
  vercelDeploymentNotes: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    deploySettingsChanged: false;
    telegramApiUsed: false;
    botFatherChanged: false;
    messagesSent: false;
    databaseWriteAdded: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    workflowChanged: false;
  };
  nextRecommendedPackage: string;
};

export const APHRODITE_LIVE_VERSION_CACHE_MARKER_READINESS_TITLE =
  "Live Version & Cache Marker Readiness";

export const APHRODITE_LIVE_VERSION_CACHE_MARKER_READINESS_CLASSIFICATION =
  "Только readiness / Deploy не меняется / Нет production-запуска";

export const APHRODITE_LIVE_VERSION_CACHE_MARKER_READINESS_RULE =
  "Package 210 описывает, как сверять source commit marker, live HTML marker, route-specific marker и cache-buster query без изменения deploy settings, workflows, production launch settings или активной публикации.";

export const APHRODITE_VISUAL_VERSION_MARKER_ATTRIBUTE = "data-aphrodite-visual-version";
export const APHRODITE_VISUAL_VERSION_MARKER_VALUE = "v1-visual-polish";

export const APHRODITE_LIVE_VERSION_CACHE_MARKER_READINESS_SAFETY_LABELS = [
  "Нет production-запуска",
  "Нет изменения deploy settings",
  "Нет Telegram API",
  "Нет изменения BotFather",
  "Нет отправки сообщений",
  "Нет записи в базу данных",
  "Нет оплаты",
  "Нет VIP-разблокировки",
  "Version marker readiness ничего не деплоит",
] as const;

const markerChecks: readonly AphroditeLiveVersionMarkerCheck[] = [
  {
    id: "source-commit-marker",
    title: "source commit marker",
    target: "origin/main commit",
    markerOrSignal: "git log --oneline -1 origin/main",
    verificationMethod: "Сверить, что проверяемый live route соответствует последнему commit в origin/main.",
    staleSymptoms: ["live UI не содержит новый dashboard-only marker", "source уже новый, а live HTML старый", "Vercel deployment указывает на предыдущий commit"],
  },
  {
    id: "live-html-marker",
    title: "live HTML marker",
    target: "https://telegram-15-channels.vercel.app",
    markerOrSignal: "data-aphrodite-visual-version=\"v1-visual-polish\"",
    verificationMethod: "Открыть dashboard readiness route или route-specific HTML с cache-buster query и проверить marker/signal.",
    staleSymptoms: ["curl без marker", "браузер с cache-buster показывает старую копию", "Telegram WebView отличается от browser fallback"],
  },
  {
    id: "route-specific-marker",
    title: "route-specific marker",
    target: "/miniapp, /birth-matrix, /compatibility",
    markerOrSignal: "documented marker/check exists",
    verificationMethod: "Для live flows marker не добавляется автоматически: проверяется documented route signal, чтобы не менять пользовательский UI.",
    staleSymptoms: ["route открывает другой экран", "нет ожидаемого текста/компонента", "visible UI не совпадает с source"],
  },
  {
    id: "cache-buster-diagnosis",
    title: "cache-buster query check",
    target: "live route with ?v=<commit>",
    markerOrSignal: "?v=<commit>",
    verificationMethod: "Сравнить обычный URL и URL с cache-buster query, затем отделить stale cache от stale deploy.",
    staleSymptoms: ["query показывает новую версию, обычный URL старую", "Telegram сохраняет старую WebView-сессию", "HTML новый, JS chunk старый"],
  },
];

const routeMarkers: readonly AphroditeRouteMarkerReadiness[] = [
  {
    id: "miniapp-marker",
    route: "/miniapp",
    expectedMarkerStrategy: "/miniapp marker/check documented",
    check: "Проверить hub title, Aphrodite Mini App shell, Love Reading entry, horoscope cards и cache-buster behavior.",
    fallbackDiagnosis: "Если /miniapp stale, сравнить browser fallback и Telegram WebView; вероятны stale build symptoms или wrong route.",
  },
  {
    id: "birth-matrix-marker",
    route: "/birth-matrix",
    expectedMarkerStrategy: "/birth-matrix marker/check documented",
    check: "Проверить data-birth-date-ui=\"v2-global-1900-today\", формат ДД.ММ.ГГГГ и ввод 15.06.1998.",
    fallbackDiagnosis: "Если старый календарь виден только в Telegram, вероятен stale Telegram WebView cache.",
  },
  {
    id: "compatibility-marker",
    route: "/compatibility",
    expectedMarkerStrategy: "/compatibility marker/check documented",
    check: "Проверить compatibility flow, дату рождения, результат и 30 days couple calendar.",
    fallbackDiagnosis: "Если результат или календарь отличаются, проверить deployed commit и route-specific marker/signal.",
  },
];

const cacheDiagnostics = [
  "Telegram WebView cache diagnosis",
  "browser cache-buster diagnosis",
  "stale build symptoms",
  "wrong route symptoms",
  "live HTML marker check",
  "route-specific marker check",
] as const;

const vercelDeploymentNotes = [
  "Vercel deployment check notes: сверить production deployment commit с origin/main.",
  "Если source marker есть, а live HTML marker отсутствует, deployment stale.",
  "Если live HTML marker есть в browser, но Telegram показывает старое, вероятен Telegram WebView cache.",
  "Если live и Telegram открывают разные routes, использовать Package 209 StartApp diagnostics.",
] as const;

export function getAphroditeLiveVersionCacheMarkerReadiness(): AphroditeLiveVersionCacheMarkerReadinessModel {
  return {
    packageNumber: 210,
    title: APHRODITE_LIVE_VERSION_CACHE_MARKER_READINESS_TITLE,
    classification: APHRODITE_LIVE_VERSION_CACHE_MARKER_READINESS_CLASSIFICATION,
    dashboardOnlyMarker: {
      attribute: APHRODITE_VISUAL_VERSION_MARKER_ATTRIBUTE,
      value: APHRODITE_VISUAL_VERSION_MARKER_VALUE,
      scope: "dashboard-readiness-only",
    },
    safetyLabels: APHRODITE_LIVE_VERSION_CACHE_MARKER_READINESS_SAFETY_LABELS,
    markerChecks: markerChecks.map((check) => ({
      ...check,
      staleSymptoms: [...check.staleSymptoms],
    })),
    routeMarkers: routeMarkers.map((route) => ({ ...route })),
    cacheDiagnostics: [...cacheDiagnostics],
    vercelDeploymentNotes: [...vercelDeploymentNotes],
    safetyFlags: {
      productionLaunchDone: false,
      deploySettingsChanged: false,
      telegramApiUsed: false,
      botFatherChanged: false,
      messagesSent: false,
      databaseWriteAdded: false,
      paymentAdded: false,
      vipUnlockAdded: false,
      workflowChanged: false,
    },
    nextRecommendedPackage: "Package 211 — Visual Issue Triage Board",
  };
}
