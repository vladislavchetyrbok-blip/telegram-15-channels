/**
 * Package 270: Zodiac Brand Cleanup + Unified Inputs + Compact Catalog Polish.
 *
 * User-facing Mini App polish only. Internal Aphrodite component names, dashboard
 * records, and docs remain as implementation history; live Mini App copy uses
 * Zodiac-facing labels and shared input controls.
 */

export type AphroditeZodiacBrandCleanupStatus =
  | "PASS"
  | "READY"
  | "DOCUMENTED"
  | "MANUAL REQUIRED"
  | "OWNER REVIEW REQUIRED"
  | "BLOCKED";

export type AphroditeZodiacBrandCleanupRow = {
  area: string;
  status: AphroditeZodiacBrandCleanupStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeZodiacBrandCleanupModel = {
  packageNumber: 270;
  title: string;
  route: "/dashboard/networks/zodiac/zodiac-brand-cleanup-unified-input-controls";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  userFacingBrandRules: readonly AphroditeZodiacBrandCleanupRow[];
  removedUserFacingAphroditeLabels: readonly AphroditeZodiacBrandCleanupRow[];
  removedEnglishLabels: readonly AphroditeZodiacBrandCleanupRow[];
  bottomNavFix: readonly AphroditeZodiacBrandCleanupRow[];
  compactCatalogRules: readonly AphroditeZodiacBrandCleanupRow[];
  unifiedDateInputRules: readonly AphroditeZodiacBrandCleanupRow[];
  unifiedTimeInputRules: readonly AphroditeZodiacBrandCleanupRow[];
  unifiedCityInputRules: readonly AphroditeZodiacBrandCleanupRow[];
  citySuggestionList: readonly string[];
  affectedFlows: readonly AphroditeZodiacBrandCleanupRow[];
  safetyBoundaries: readonly string[];
  whatWasNotChanged: readonly AphroditeZodiacBrandCleanupRow[];
  nextPackageRecommendation: string;
  safetyNotes: readonly string[];
  remainingBlockers: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    botFatherChanged: false;
    activeCtaLogicChanged: false;
    channelMappingsChanged: false;
    calculationsChanged: false;
    dateParsingValidationChanged: false;
    mysticSelectionRandomStorageChanged: false;
    databaseWriteAdded: false;
    storageWriteAdded: false;
    externalAnalyticsAdded: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    entitlementBypassAdded: false;
    cronWorkflowPublishChanged: false;
    secretsAdded: false;
    productionDbConnected: false;
    ownerApprovalGranted: false;
    publicLaunchApproved: false;
    ownerManualReviewRequired: true;
  };
};

export const APHRODITE_ZODIAC_BRAND_CLEANUP_UNIFIED_INPUT_CONTROLS_TITLE =
  "Zodiac Brand Cleanup + Unified Input Controls";

export const APHRODITE_ZODIAC_BRAND_CLEANUP_UNIFIED_INPUT_CONTROLS_ROUTE =
  "/dashboard/networks/zodiac/zodiac-brand-cleanup-unified-input-controls" as const;

const citySuggestionList = [
  "Днепр / Дніпро",
  "Киев / Київ",
  "Львов / Львів",
  "Одесса / Одеса",
  "Харьков / Харків",
  "Запорожье / Запоріжжя",
  "Полтава",
  "Черкассы / Черкаси",
  "Винница / Вінниця",
  "Ивано-Франковск / Івано-Франківськ",
  "Тернополь / Тернопіль",
  "Ужгород",
  "Черновцы / Чернівці",
  "Кривой Рог / Кривий Ріг",
] as const;

const safetyFlags = {
  productionLaunchDone: false,
  telegramApiUsed: false,
  messagesSent: false,
  botFatherChanged: false,
  activeCtaLogicChanged: false,
  channelMappingsChanged: false,
  calculationsChanged: false,
  dateParsingValidationChanged: false,
  mysticSelectionRandomStorageChanged: false,
  databaseWriteAdded: false,
  storageWriteAdded: false,
  externalAnalyticsAdded: false,
  paymentAdded: false,
  vipUnlockAdded: false,
  entitlementBypassAdded: false,
  cronWorkflowPublishChanged: false,
  secretsAdded: false,
  productionDbConnected: false,
  ownerApprovalGranted: false,
  publicLaunchApproved: false,
  ownerManualReviewRequired: true,
} as const;

export function getAphroditeZodiacBrandCleanupUnifiedInputControls(): AphroditeZodiacBrandCleanupModel {
  return {
    packageNumber: 270,
    title: APHRODITE_ZODIAC_BRAND_CLEANUP_UNIFIED_INPUT_CONTROLS_TITLE,
    route: APHRODITE_ZODIAC_BRAND_CLEANUP_UNIFIED_INPUT_CONTROLS_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    userFacingBrandRules: [
      {
        area: "live Mini App brand",
        status: "PASS",
        detail:
          "Live user-facing copy uses Zodiac, Зодиакальный центр, Совместимость знаков, Матрица судьбы, Мистическая карта, VIP раздел, and Preview instead of visible Aphrodite branding.",
        ownerAction: "Recheck live Telegram WebView screenshots after deploy/cache refresh.",
      },
      {
        area: "internal implementation names",
        status: "DOCUMENTED",
        detail:
          "Aphrodite remains allowed in component names, dashboard pages, docs, and historical package models to avoid risky full-codebase rename.",
        ownerAction: "Treat any future visible Aphrodite text in live Mini App as a copy bug, not a rename task.",
      },
    ],
    removedUserFacingAphroditeLabels: [
      {
        area: "/miniapp hero",
        status: "PASS",
        detail: "Aphrodite Mini App metadata and hero badge were replaced with Zodiac-facing labels.",
        ownerAction: "Open /miniapp and verify the first screen says Зодиак / Зодиакальный центр.",
      },
      {
        area: "/birth-matrix and love preview shell",
        status: "PASS",
        detail: "Visible shell eyebrow copy now uses Зодиакальный центр instead of Aphrodite.",
        ownerAction: "Verify /birth-matrix and /miniapp/love-reading-preview on mobile.",
      },
    ],
    removedEnglishLabels: [
      {
        area: "Mystic result badges",
        status: "PASS",
        detail:
          "revealed rune, Birth Matrix / Natal input, personal energy report, and Natal birth profile were replaced with short Russian labels.",
        ownerAction: "Check Mystic, Birth Matrix, and VIP Natal screens for remaining English technical labels.",
      },
      {
        area: "safety labels",
        status: "PASS",
        detail: "Visible payment/VIP safety copy remains short: Без оплаты, VIP закрыт, Preview.",
        ownerAction: "Keep long safety explanations in dashboard/docs only.",
      },
    ],
    bottomNavFix: [
      {
        area: "bottom nav forecasts tab",
        status: "PASS",
        detail: "The tab label and shortLabel use Прогноз instead of Прогнозы to avoid two-line wrapping at 360/390/430px.",
        ownerAction: "Recheck bottom navigation on 360px, 390px, and 430px smoke screens.",
      },
    ],
    compactCatalogRules: [
      {
        area: "zodiac sign selection",
        status: "PASS",
        detail: "Large sign cards were compacted into shorter tap rows with sign icon, name, and date range.",
        ownerAction: "Verify signs remain tappable and readable in Telegram WebView.",
      },
      {
        area: "quick action cards",
        status: "PASS",
        detail: "Home quick rows keep existing actions but reduce vertical height and use single-line title/description truncation.",
        ownerAction: "Confirm no primary action is hidden or visually duplicated.",
      },
    ],
    unifiedDateInputRules: [
      {
        area: "ZodiacUnifiedDateInput",
        status: "PASS",
        detail:
          "Birth-date and calendar fields now use a shared wrapper around the existing Package 224 date input, preserving 01012000 -> 01.01.2000 behavior.",
        ownerAction: "Run smoke and manually verify birth-date entry in Compatibility, Birth Matrix, Mystic, and VIP Natal flows.",
      },
    ],
    unifiedTimeInputRules: [
      {
        area: "ZodiacUnifiedTimeInput",
        status: "PASS",
        detail:
          "Birth-time fields use one dark/mobile-friendly HH:MM text input with optional Знаю время / Не знаю точное время controls.",
        ownerAction: "Verify 1010 formats as 10:10 and unknown-time flow still leaves calculations unchanged.",
      },
    ],
    unifiedCityInputRules: [
      {
        area: "ZodiacCityAutocompleteInput",
        status: "PASS",
        detail:
          "City fields use one local autocomplete with static suggestions, selected-city state support, and manual fallback; no external geocoding API was added.",
        ownerAction: "Verify Днепр / Дніпро appears as a suggestion and manual city text remains possible.",
      },
    ],
    citySuggestionList,
    affectedFlows: [
      {
        area: "Home",
        status: "PASS",
        detail: "Brand badge, bottom nav label, quick actions, and sign selection are shorter and Zodiac-facing.",
        ownerAction: "Open /miniapp and check first-screen density.",
      },
      {
        area: "Compatibility",
        status: "PASS",
        detail: "Date, time, and city controls use shared components without changing compatibility calculations.",
        ownerAction: "Run pair calculation smoke and verify exact birth data remains optional.",
      },
      {
        area: "Birth Matrix",
        status: "PASS",
        detail: "Date/time controls and shell copy use shared inputs and Zodiac-facing labels.",
        ownerAction: "Open /birth-matrix and test 15.06.1998 plus 10:10.",
      },
      {
        area: "Natal/VIP",
        status: "PASS",
        detail: "VIP Natal date/time/city controls use shared inputs; preview remains preview-only.",
        ownerAction: "Verify no payment or VIP unlock appears.",
      },
      {
        area: "Mystic",
        status: "PASS",
        detail: "English badges were replaced with short Russian labels and date fields use the shared date wrapper.",
        ownerAction: "Open /miniapp?startapp=mystic and verify card result labels.",
      },
      {
        area: "Profile",
        status: "READY",
        detail: "Profile-related birth data flows use the same shared person state and shared controls where date/time/city are requested.",
        ownerAction: "Recheck local data/profile screens manually on real Telegram WebView.",
      },
    ],
    safetyBoundaries: [
      "No full codebase rename.",
      "No calculation changes.",
      "No active CTA logic changes.",
      "No route changes unless already existing.",
      "No external city API or geocoding.",
      "No Telegram API calls.",
      "No Telegram messages.",
      "No payments.",
      "No VIP unlock.",
      "No DB writes.",
      "No cron/workflow/publish script changes.",
      "No secrets.",
    ],
    whatWasNotChanged: [
      {
        area: "calculations",
        status: "PASS",
        detail: "Compatibility, Birth Matrix, Natal, VIP, and Mystic calculation logic were not changed.",
        ownerAction: "Use existing smoke and package QA as guards.",
      },
      {
        area: "routes and CTAs",
        status: "PASS",
        detail: "Existing routes and CTA destinations remain intact; visual labels and input components were polished only.",
        ownerAction: "Owner can verify destination paths manually before soft launch.",
      },
      {
        area: "launch and monetization",
        status: "BLOCKED",
        detail: "publicLaunchApproved=false, ownerManualReviewRequired=true, payment/VIP unlock remain blocked.",
        ownerAction: "Do not launch until owner manual blockers are closed.",
      },
    ],
    nextPackageRecommendation: "Package 271 - Owner Screenshot Recheck After Brand/Input Cleanup",
    safetyNotes: [
      "Package 270 is visual/UX consistency only.",
      "Internal Aphrodite names remain where they are implementation history, dashboard, or docs.",
      "City suggestions are local static data only.",
      "publicLaunchApproved=false",
      "ownerManualReviewRequired=true",
    ],
    remainingBlockers: [
      "DATABASE_URL manual configuration",
      "TELEGRAM_BOT_TOKEN manual configuration",
      "backup freshness <24h",
      "restore rehearsal",
      "real-device QA manual execution",
      "Telegram WebView/startapp manual QA",
      "content/CTA owner review",
      "owner explicit approval",
      "owner screenshot recheck after Package 270",
    ],
    safetyFlags,
  };
}
