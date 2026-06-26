/**
 * Package 195: Manual Launch Smoke Test Matrix.
 *
 * Static manual QA matrix for future public launch readiness. It does not run
 * a launch, call Telegram API, send messages, change active CTAs, enable
 * payments, unlock VIP, or write production data.
 */

export type AphroditeManualLaunchSmokeTest = {
  id: string;
  label: string;
  routeOrContext: string;
  expectedResult: string;
  blockedNow: boolean;
  ownerReviewRequired: boolean;
  source: "manual-qa-only";
};

export type AphroditeManualLaunchSmokeBoundary = {
  id: string;
  label: string;
  currentState: string;
};

export type AphroditeManualLaunchSmokeTestMatrixModel = {
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  smokeTests: AphroditeManualLaunchSmokeTest[];
  boundaries: AphroditeManualLaunchSmokeBoundary[];
  summary: {
    smokeTestsCount: number;
    blockedTestsCount: number;
    ownerReviewTestsCount: number;
    manualQaOnlyNow: true;
  };
  launchApprovedNow: false;
  productionLaunchNow: false;
  telegramApiNow: false;
  messageSendingNow: false;
  activeCtaChangedNow: false;
  paymentEnabledNow: false;
  vipUnlockNow: false;
  databaseWriteNow: false;
  nextRecommendedPackage: string;
};

export const APHRODITE_MANUAL_LAUNCH_SMOKE_TEST_MATRIX_TITLE =
  "Manual Smoke Test Matrix запуска";

export const APHRODITE_MANUAL_LAUNCH_SMOKE_TEST_MATRIX_CLASSIFICATION =
  "Только manual QA / Запуск не выполняется / Нет Telegram API";

export const APHRODITE_MANUAL_LAUNCH_SMOKE_TEST_MATRIX_RULE =
  "Manual Launch Smoke Test Matrix описывает ручные проверки будущего запуска, но ничего не запускает, не отправляет сообщения, не меняет active CTA и не вызывает Telegram API.";

export const APHRODITE_MANUAL_LAUNCH_SMOKE_TEST_MATRIX_SAFETY_LABELS = [
  "Нет production-запуска",
  "Нет Telegram API",
  "Нет отправки сообщений",
  "Нет изменения active CTA",
  "Нет оплаты",
  "Нет VIP-разблокировки",
  "Manual smoke matrix ничего не запускает",
] as const;

const smokeTests: AphroditeManualLaunchSmokeTest[] = [
  {
    id: "iphone-telegram-mini-app",
    label: "iPhone Telegram Mini App",
    routeOrContext: "Telegram iOS WebView",
    expectedResult: "Mini App открывается, layout читаемый, primary CTA понятен, bottom safe area не перекрывает действия.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
  {
    id: "android-telegram-mini-app",
    label: "Android Telegram Mini App",
    routeOrContext: "Telegram Android WebView",
    expectedResult: "Mini App открывается, touch targets доступны, back behavior понятен.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
  {
    id: "desktop-telegram",
    label: "desktop Telegram",
    routeOrContext: "Telegram Desktop",
    expectedResult: "Mini App/fallback открывается без runtime errors и без запроса оплаты.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
  {
    id: "browser-fallback",
    label: "browser fallback",
    routeOrContext: "Browser direct URL",
    expectedResult: "Fallback route объясняет безопасный вход и не вызывает Telegram-only actions.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
  {
    id: "miniapp",
    label: "/miniapp",
    routeOrContext: "/miniapp",
    expectedResult: "Hub открывается, free routes видны, future paid/VIP surfaces не выглядят активной оплатой.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
  {
    id: "miniapp-love-reading-preview",
    label: "/miniapp/love-reading-preview",
    routeOrContext: "/miniapp/love-reading-preview",
    expectedResult: "Love Reading preview открывается и показывает free preview boundary без VIP unlock.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
  {
    id: "compatibility",
    label: "compatibility",
    routeOrContext: "/compatibility",
    expectedResult: "Compatibility flow работает как free result/fallback без payment или entitlement.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
  {
    id: "birth-matrix",
    label: "birth matrix",
    routeOrContext: "/birth-matrix",
    expectedResult: "Birth matrix route открывается, date input readable, result/fallback понятен.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
  {
    id: "thirty-days-couple",
    label: "30 days couple",
    routeOrContext: "future/free preview route",
    expectedResult: "30 days couple calendar даёт разные дни, не повторяет один и тот же шаблон.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
  {
    id: "daily-horoscope-cta",
    label: "daily horoscope CTA",
    routeOrContext: "daily content CTA",
    expectedResult: "Daily CTA ведёт в безопасный free route и не меняет active Telegram CTA.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
  {
    id: "weekly-horoscope-cta",
    label: "weekly horoscope CTA",
    routeOrContext: "weekly content CTA",
    expectedResult: "Weekly CTA говорит о новой неделе и остаётся preview/manual QA only.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
  {
    id: "monthly-horoscope-cta",
    label: "monthly horoscope CTA",
    routeOrContext: "monthly content CTA",
    expectedResult: "Monthly CTA указывает следующий месяц после 20 числа и не запускает публикацию.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
  {
    id: "support-refund-readiness",
    label: "support/refund page/readiness",
    routeOrContext: "/dashboard/networks/zodiac/support-refund-policy-readiness",
    expectedResult: "Support/refund wording понятно описывает будущую поддержку до включения оплаты.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
  {
    id: "analytics-noop",
    label: "analytics noop",
    routeOrContext: "noop analytics readiness",
    expectedResult: "Analytics остаётся noop/readiness-only, внешние события не отправляются.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
  {
    id: "fallback-routes",
    label: "fallback routes",
    routeOrContext: "unknown startapp / old links",
    expectedResult: "Fallback routes мягко возвращают пользователя к безопасному hub/free preview.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
  {
    id: "guard-denied-flow",
    label: "guard denied flow",
    routeOrContext: "future guard denied path",
    expectedResult: "Denied flow показывает free preview/fallback и не выдаёт VIP доступ.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
  {
    id: "owner-review-blocked-flow",
    label: "owner review blocked flow",
    routeOrContext: "manual owner gate",
    expectedResult: "Owner review остаётся required, launchApprovedNow=false.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
  {
    id: "production-safety-blocked-state",
    label: "production safety blocked state",
    routeOrContext: "npm run production:safety:check",
    expectedResult: "Production safety blocks publish until env and backup are ready.",
    blockedNow: true,
    ownerReviewRequired: true,
    source: "manual-qa-only",
  },
];

const boundaries: AphroditeManualLaunchSmokeBoundary[] = [
  { id: "no-production-launch", label: "Нет production-запуска", currentState: "manual QA only" },
  { id: "no-telegram-api", label: "Нет Telegram API", currentState: "нет Bot API вызовов" },
  { id: "no-message-send", label: "Нет отправки сообщений", currentState: "нет исходящей доставки" },
  { id: "no-active-cta-change", label: "Нет изменения active CTA", currentState: "CTA untouched" },
  { id: "no-payment", label: "Нет оплаты", currentState: "payment untouched" },
  { id: "no-vip-unlock", label: "Нет VIP-разблокировки", currentState: "access untouched" },
  { id: "no-db-write", label: "Нет записи в базу данных", currentState: "нет persistence" },
  { id: "owner-review-required", label: "Owner review required", currentState: "запуск заблокирован до ручного решения" },
];

export function getAphroditeManualLaunchSmokeTestMatrix(): AphroditeManualLaunchSmokeTestMatrixModel {
  const copiedSmokeTests = smokeTests.map((test) => ({ ...test }));
  return {
    title: APHRODITE_MANUAL_LAUNCH_SMOKE_TEST_MATRIX_TITLE,
    classification: APHRODITE_MANUAL_LAUNCH_SMOKE_TEST_MATRIX_CLASSIFICATION,
    safetyLabels: APHRODITE_MANUAL_LAUNCH_SMOKE_TEST_MATRIX_SAFETY_LABELS,
    smokeTests: copiedSmokeTests,
    boundaries: boundaries.map((boundary) => ({ ...boundary })),
    summary: {
      smokeTestsCount: copiedSmokeTests.length,
      blockedTestsCount: copiedSmokeTests.filter((test) => test.blockedNow).length,
      ownerReviewTestsCount: copiedSmokeTests.filter((test) => test.ownerReviewRequired).length,
      manualQaOnlyNow: true,
    },
    launchApprovedNow: false,
    productionLaunchNow: false,
    telegramApiNow: false,
    messageSendingNow: false,
    activeCtaChangedNow: false,
    paymentEnabledNow: false,
    vipUnlockNow: false,
    databaseWriteNow: false,
    nextRecommendedPackage: "Package 196 — Mini App Simplified Visual Redesign Implementation Plan",
  };
}
