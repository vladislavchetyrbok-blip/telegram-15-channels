/**
 * Package 205: Aphrodite Final Mobile UX Smoke & Polish.
 *
 * Review/QA model only. This package documents the final mobile UX smoke
 * checklist for the redesigned Mini App screens without changing live
 * Telegram delivery, payments, VIP unlock, database writes, or analytics.
 */

export type AphroditeFinalMobileUxTarget = {
  route: string;
  sourceFile: string;
  flow: string;
  hasBirthDateInput: boolean;
  requiredSignals: readonly string[];
  mobileChecks: readonly string[];
  status: "checked" | "excluded";
  exclusionReason?: string;
};

export type AphroditeFinalMobileUxSmokePolishModel = {
  packageNumber: 205;
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  targets: readonly AphroditeFinalMobileUxTarget[];
  requiredChecks: readonly string[];
  requiredQaCommands: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    activeCtaLogicChanged: false;
    databaseWriteAdded: false;
    externalAnalyticsAdded: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    cronWorkflowPublishChanged: false;
  };
  nextRecommendedPackage: string;
};

export const APHRODITE_FINAL_MOBILE_UX_SMOKE_TITLE =
  "Финальный mobile UX smoke & polish";

export const APHRODITE_FINAL_MOBILE_UX_SMOKE_CLASSIFICATION =
  "Только UX smoke / Live logic не меняется / Нет запуска";

export const APHRODITE_FINAL_MOBILE_UX_SMOKE_SAFETY_LABELS = [
  "Нет production-запуска",
  "Нет изменения оплаты",
  "Нет VIP-разблокировки",
  "Нет Telegram API",
  "Нет записи в базу данных",
  "Нет внешней аналитики",
  "Нет изменения cron/workflows/publish scripts",
] as const;

export const APHRODITE_FINAL_MOBILE_UX_SMOKE_RULE =
  "Package 205 фиксирует финальный mobile UX smoke для /miniapp, Love Reading preview, Birth Matrix, Compatibility, Mystic и horoscope cards без изменения live logic, платежей, VIP-доступа, Telegram API, БД или publish scripts.";

const targets: readonly AphroditeFinalMobileUxTarget[] = [
  {
    route: "/miniapp",
    sourceFile: "app/miniapp/page.tsx",
    flow: "Mini App hub",
    hasBirthDateInput: false,
    requiredSignals: [
      "AphroditeMiniAppShell",
      "AphroditePrimaryCta",
      "/miniapp/love-reading-preview",
      "/birth-matrix",
      "/compatibility?startapp=compat_love",
    ],
    mobileChecks: [
      "primary CTA выше вторичных модулей",
      "карточки используют min-w-0 и readable text sizes",
      "ссылки ведут на существующие safe routes",
      "границы безопасности видимы",
    ],
    status: "checked",
    exclusionReason: "Дата рождения не вводится на hub-экране.",
  },
  {
    route: "/miniapp/love-reading-preview",
    sourceFile: "app/miniapp/love-reading-preview/page.tsx",
    flow: "Love Reading preview",
    hasBirthDateInput: false,
    requiredSignals: [
      "PREVIEW_BLOCKS",
      "AphroditePrimaryCta",
      "/compatibility",
      "/miniapp",
      "SAFETY_BOUNDARIES",
    ],
    mobileChecks: [
      "preview разбит на короткие блоки",
      "кнопки min-height friendly for mobile",
      "locked CTA остаётся preview/fallback",
      "нет оплаты и нет VIP unlock",
    ],
    status: "checked",
    exclusionReason: "Дата рождения не вводится в Love Reading preview.",
  },
  {
    route: "/birth-matrix",
    sourceFile: "app/birth-matrix/BirthMatrixClient.tsx",
    flow: "Birth Matrix",
    hasBirthDateInput: true,
    requiredSignals: [
      "ZodiacDateInput",
      "birthDateScope=\"birth-matrix\"",
      "data-birth-matrix-result=\"visual-upgrade-package-201\"",
      "parseBirthDateInput",
      "min-h-12",
    ],
    mobileChecks: [
      "birth-date input остаётся text input",
      "visible helper: Формат: ДД.ММ.ГГГГ",
      "результат разбит на компактные карточки",
      "кнопки не мельче min-h-12",
    ],
    status: "checked",
  },
  {
    route: "/compatibility",
    sourceFile: "components/ZodiacCompatibilityMiniApp.tsx",
    flow: "Compatibility result",
    hasBirthDateInput: true,
    requiredSignals: [
      "buildZodiacCompatibilityPersonalizedCopy",
      "birthDateScope=\"compatibility\"",
      "MiniAppBottomNavigation",
      "buildPersonalizedCoupleCalendar",
      "overflow-x-hidden",
    ],
    mobileChecks: [
      "контейнер защищён от horizontal overflow",
      "result cards используют break-words/overflow-wrap",
      "30 days couple calendar остаётся персонализированным",
      "bottom navigation не ломает safe area",
    ],
    status: "checked",
  },
  {
    route: "Mystic sections inside /compatibility",
    sourceFile: "components/ZodiacMysticSections.tsx",
    flow: "Mystic / Cards / Universe Message",
    hasBirthDateInput: true,
    requiredSignals: [
      "AphroditeMysticUniversePanel",
      "birthDateScope=\"miniapp-matrix\"",
      "BirthMatrixFeature",
      "DailyCardFeature",
    ],
    mobileChecks: [
      "Послание Вселенной вынесено в отдельный visual block",
      "tarot/rune/card sections не становятся стеной текста",
      "birth-date scope miniapp-matrix сохранён",
      "нет жёстких пророчеств",
    ],
    status: "checked",
  },
  {
    route: "Horoscope visual cards",
    sourceFile: "components/zodiac-mini-app/AphroditeHoroscopeCard.tsx",
    flow: "Daily/Weekly/Monthly horoscope cards",
    hasBirthDateInput: false,
    requiredSignals: [
      "data-aphrodite-horoscope-card",
      "AphroditeHoroscopePeriodBadge",
      "loveRelationship",
      "attentionZone",
      "ctaFallback",
    ],
    mobileChecks: [
      "daily/weekly/monthly cards share one hierarchy",
      "period badge is compact",
      "CTA/fallback area is explicit",
      "no wall of text",
    ],
    status: "checked",
    exclusionReason: "Дата рождения не вводится в horoscope visual card component.",
  },
];

export function getAphroditeFinalMobileUxSmokePolish(): AphroditeFinalMobileUxSmokePolishModel {
  return {
    packageNumber: 205,
    title: APHRODITE_FINAL_MOBILE_UX_SMOKE_TITLE,
    classification: APHRODITE_FINAL_MOBILE_UX_SMOKE_CLASSIFICATION,
    safetyLabels: APHRODITE_FINAL_MOBILE_UX_SMOKE_SAFETY_LABELS,
    targets: targets.map((target) => ({
      ...target,
      requiredSignals: [...target.requiredSignals],
      mobileChecks: [...target.mobileChecks],
    })),
    requiredChecks: [
      "mobile readability",
      "button sizes",
      "spacing",
      "text length",
      "safe area",
      "no horizontal overflow",
      "no tiny text",
      "no broken links",
      "no old date picker",
      "no payment CTA",
      "no VIP unlock",
    ],
    requiredQaCommands: [
      "node --experimental-strip-types scripts/qa-aphrodite-final-mobile-ux-smoke-polish.mjs",
      "node --experimental-strip-types scripts/qa-aphrodite-miniapp-home-simplified-ui.mjs",
      "node --experimental-strip-types scripts/qa-aphrodite-love-reading-preview-visual-upgrade.mjs",
      "node --experimental-strip-types scripts/qa-aphrodite-compatibility-result-visual-upgrade.mjs",
      "node --experimental-strip-types scripts/qa-aphrodite-birth-matrix-visual-upgrade.mjs",
      "node --experimental-strip-types scripts/qa-zodiac-birth-date-no-jump-input.mjs",
      "npm run build",
    ],
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      activeCtaLogicChanged: false,
      databaseWriteAdded: false,
      externalAnalyticsAdded: false,
      paymentAdded: false,
      vipUnlockAdded: false,
      cronWorkflowPublishChanged: false,
    },
    nextRecommendedPackage: "Package 206 — Mini App Visual QA Consolidation",
  };
}
