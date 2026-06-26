/**
 * Package 206: Aphrodite Mini App Visual QA Consolidation.
 *
 * Consolidated QA/readiness model only. No live Mini App logic, Telegram API,
 * database writes, payments, VIP unlock, workflows, cron, or publish scripts
 * are changed by this package.
 */

export type AphroditeMiniAppVisualQaArea = {
  id: string;
  title: string;
  routeOrFlow: string;
  sourceFiles: readonly string[];
  requiredSignals: readonly string[];
  qaFocus: readonly string[];
};

export type AphroditeMiniAppVisualQaConsolidationModel = {
  packageNumber: 206;
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  areas: readonly AphroditeMiniAppVisualQaArea[];
  dependentQaScripts: readonly string[];
  requiredFullQaCommands: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    databaseWriteAdded: false;
    externalAnalyticsAdded: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    workflowCronPublishChanged: false;
    activeCtaLogicChanged: false;
  };
  nextRecommendedPackage: string;
};

export const APHRODITE_MINIAPP_VISUAL_QA_CONSOLIDATION_TITLE =
  "Консолидация visual QA Mini App";

export const APHRODITE_MINIAPP_VISUAL_QA_CONSOLIDATION_CLASSIFICATION =
  "Только visual QA / Live logic не меняется / Нет запуска";

export const APHRODITE_MINIAPP_VISUAL_QA_CONSOLIDATION_SAFETY_LABELS = [
  "Нет production-запуска",
  "Нет изменения оплаты",
  "Нет VIP-разблокировки",
  "Нет Telegram API",
  "Нет записи в базу данных",
  "Visual QA ничего не отправляет",
] as const;

export const APHRODITE_MINIAPP_VISUAL_QA_CONSOLIDATION_RULE =
  "Package 206 консолидирует visual QA для redesigned Mini App screens и не меняет live logic, оплату, VIP-доступ, Telegram API, БД, external analytics, workflows, cron или publish scripts.";

const areas: readonly AphroditeMiniAppVisualQaArea[] = [
  {
    id: "miniapp-hub",
    title: "/miniapp",
    routeOrFlow: "/miniapp",
    sourceFiles: ["app/miniapp/page.tsx"],
    requiredSignals: ["AphroditeMiniAppShell", "AphroditePrimaryCta", "/miniapp/love-reading-preview", "/birth-matrix", "/compatibility"],
    qaFocus: ["mobile CTA hierarchy", "safe module links", "no payment CTA", "no VIP unlock"],
  },
  {
    id: "love-reading-preview",
    title: "/miniapp/love-reading-preview",
    routeOrFlow: "/miniapp/love-reading-preview",
    sourceFiles: ["app/miniapp/love-reading-preview/page.tsx"],
    requiredSignals: ["PREVIEW_BLOCKS", "AphroditePrimaryCta", "SAFETY_BOUNDARIES", "/compatibility", "/miniapp"],
    qaFocus: ["free preview readability", "locked fallback", "no hard prophecy", "no payment CTA"],
  },
  {
    id: "birth-matrix",
    title: "/birth-matrix",
    routeOrFlow: "/birth-matrix",
    sourceFiles: ["app/birth-matrix/BirthMatrixClient.tsx", "components/zodiac-mini-app/ZodiacDateInput.tsx"],
    requiredSignals: ["ZodiacDateInput", "birthDateScope=\"birth-matrix\"", "data-birth-matrix-result=\"visual-upgrade-package-201\"", "data-birth-date-ui"],
    qaFocus: ["text birth-date input", "Birth Matrix result", "mobile button size", "future dates blocked"],
  },
  {
    id: "compatibility",
    title: "/compatibility",
    routeOrFlow: "/compatibility",
    sourceFiles: ["app/compatibility/page.tsx", "components/ZodiacCompatibilityMiniApp.tsx", "components/zodiac-mini-app/ResultCards.tsx"],
    requiredSignals: ["ZodiacCompatibilityMiniApp", "buildZodiacCompatibilityPersonalizedCopy", "birthDateScope=\"compatibility\"", "#relationship-calendar"],
    qaFocus: ["compatibility result", "personalized copy", "30 days couple calendar", "no horizontal overflow"],
  },
  {
    id: "mystic-sections",
    title: "Mystic sections",
    routeOrFlow: "/compatibility -> Mystic / Cards / Universe Message",
    sourceFiles: ["components/ZodiacMysticSections.tsx", "components/zodiac-mini-app/AphroditeMysticUniversePanel.tsx"],
    requiredSignals: ["AphroditeMysticUniversePanel", "Послание Вселенной", "DailyCardFeature", "TarotCardFeature", "RuneDayFeature"],
    qaFocus: ["Mystic sections", "universe message panel", "no fear manipulation", "date input not broken"],
  },
  {
    id: "horoscope-visual-cards",
    title: "horoscope visual cards",
    routeOrFlow: "daily / weekly / monthly horoscope cards",
    sourceFiles: ["components/zodiac-mini-app/AphroditeHoroscopeCard.tsx", "components/zodiac-mini-app/AphroditeHoroscopePeriodBadge.tsx"],
    requiredSignals: ["data-aphrodite-horoscope-card", "AphroditeHoroscopePeriodBadge", "loveRelationship", "attentionZone", "ctaFallback"],
    qaFocus: ["daily card", "weekly card", "monthly card", "period badge", "CTA/fallback area"],
  },
  {
    id: "date-input",
    title: "date input",
    routeOrFlow: "shared birth-date input",
    sourceFiles: ["components/zodiac-mini-app/ZodiacDateInput.tsx", "lib/zodiac-birth-date-range.ts"],
    requiredSignals: ["BIRTH_DATE_UI_MARKER", "v2-global-1900-today", "Формат: ДД.ММ.ГГГГ", "Например: 15.06.1998"],
    qaFocus: ["15.06.1998 accepted", "01.01.1990 accepted", "future dates blocked", "native type=date absent"],
  },
];

const dependentQaScripts = [
  "scripts/qa-aphrodite-miniapp-home-simplified-ui.mjs",
  "scripts/qa-aphrodite-love-reading-preview-visual-upgrade.mjs",
  "scripts/qa-aphrodite-compatibility-result-visual-upgrade.mjs",
  "scripts/qa-aphrodite-birth-matrix-visual-upgrade.mjs",
  "scripts/qa-aphrodite-mystic-universe-visual-upgrade.mjs",
  "scripts/qa-aphrodite-horoscope-visual-cards.mjs",
  "scripts/qa-zodiac-birth-date-no-jump-input.mjs",
  "scripts/qa-zodiac-compatibility-copy-personalization.mjs",
  "scripts/qa-zodiac-vip-couple-calendar-personalization.mjs",
] as const;

export function getAphroditeMiniAppVisualQaConsolidation(): AphroditeMiniAppVisualQaConsolidationModel {
  return {
    packageNumber: 206,
    title: APHRODITE_MINIAPP_VISUAL_QA_CONSOLIDATION_TITLE,
    classification: APHRODITE_MINIAPP_VISUAL_QA_CONSOLIDATION_CLASSIFICATION,
    safetyLabels: APHRODITE_MINIAPP_VISUAL_QA_CONSOLIDATION_SAFETY_LABELS,
    areas: areas.map((area) => ({
      ...area,
      sourceFiles: [...area.sourceFiles],
      requiredSignals: [...area.requiredSignals],
      qaFocus: [...area.qaFocus],
    })),
    dependentQaScripts: [...dependentQaScripts],
    requiredFullQaCommands: [
      "npx tsc --noEmit -p tsconfig.json",
      "node --check scripts/qa-zodiac-dashboard.mjs",
      "node --experimental-strip-types scripts/qa-aphrodite-miniapp-visual-qa-consolidation.mjs",
      ...dependentQaScripts.map((script) => `node --experimental-strip-types ${script}`),
      "npm run build",
      "npm run zodiac:dashboard:qa",
      "npm run production:safety:check",
    ],
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      databaseWriteAdded: false,
      externalAnalyticsAdded: false,
      paymentAdded: false,
      vipUnlockAdded: false,
      workflowCronPublishChanged: false,
      activeCtaLogicChanged: false,
    },
    nextRecommendedPackage: "Package 207 — Public Launch Visual Readiness Review",
  };
}
