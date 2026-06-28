/**
 * Package 267: Critical Mobile Telegram WebView Visual Fixes From Owner Screenshots.
 *
 * Screenshot-driven visual/layout fixes for real Android Telegram WebView defects.
 * This package is UI/readiness only: no production launch, no Telegram API, no
 * payment, no VIP unlock, no DB writes, no workflow/cron/publish changes, no
 * calculations/date parsing/Mystic random/storage changes, and no approval flag
 * changes.
 */

export type AphroditeCriticalMobileTelegramWebviewVisualFixStatus =
  | "PASS"
  | "READY"
  | "DOCUMENTED"
  | "MANUAL REQUIRED"
  | "OWNER REVIEW REQUIRED"
  | "BLOCKED";

export type AphroditeCriticalMobileTelegramWebviewVisualFixRow = {
  area: string;
  status: AphroditeCriticalMobileTelegramWebviewVisualFixStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeCriticalMobileTelegramWebviewVisualFixModel = {
  packageNumber: 267;
  title: string;
  route: "/dashboard/networks/zodiac/critical-mobile-telegram-webview-visual-fixes";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  screenshotFindings: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[];
  criticalIssues: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[];
  fixesApplied: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[];
  mobileGridRules: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[];
  vipPreviewRules: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[];
  userFacingCopyRules: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[];
  textWrappingRules: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[];
  telegramWebViewRules: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[];
  safetyBoundaries: readonly string[];
  whatWasNotChanged: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[];
  liveRoutes: readonly string[];
  mobileViewports: readonly string[];
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

export const APHRODITE_CRITICAL_MOBILE_TELEGRAM_WEBVIEW_VISUAL_FIXES_TITLE =
  "Critical Mobile Telegram WebView Visual Fixes";

export const APHRODITE_CRITICAL_MOBILE_TELEGRAM_WEBVIEW_VISUAL_FIXES_ROUTE =
  "/dashboard/networks/zodiac/critical-mobile-telegram-webview-visual-fixes" as const;

const screenshotFindings: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[] = [
  {
    area: "two-column narrow cards",
    status: "PASS",
    detail:
      "Owner screenshots showed 2-column mobile card grids compressing text on Android Telegram WebView. Package 267 adds one-column <=430px rules and scoped grid utilities.",
    ownerAction:
      "Recheck /miniapp, /miniapp?startapp=mystic, /birth-matrix, /vip-preview, /vip-compatibility-report, and /compatibility on real Telegram Android.",
  },
  {
    area: "broken English text wrapping",
    status: "PASS",
    detail:
      "Visible phrases like Full relationship report, No active payment, and VIP locked preview were replaced in live user-facing cards with shorter Russian UI copy.",
    ownerAction:
      "Confirm no card shows letter-by-letter English wrapping at 360px, 390px, or 430px.",
  },
  {
    area: "VIP preview narrow columns",
    status: "PASS",
    detail:
      "AphroditeLockedPreviewCard now carries Package 267 mobile guards, full-width card constraints, 431px grid thresholds, and Russian preview/safety labels.",
    ownerAction:
      "Open VIP preview states and verify feature chips wrap as readable full-width rows on phone widths.",
  },
  {
    area: "huge empty columns",
    status: "PASS",
    detail:
      "Mini App entry, home cards, share cards, closed Mystic cards, relationship selectors, and VIP report overlays now avoid side-by-side columns on <=430px.",
    ownerAction:
      "Capture fresh owner screenshots after deploy and Telegram WebView cache refresh.",
  },
];

const criticalIssues: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[] = [
  {
    area: "real Android Telegram WebView readability",
    status: "READY",
    detail:
      "The fix targets real owner screenshots, not a theoretical desktop dashboard issue.",
    ownerAction:
      "Manual real-device QA remains required because browser simulation cannot fully reproduce Telegram WebView chrome and cache behavior.",
  },
  {
    area: "Russian user-facing safety copy",
    status: "READY",
    detail:
      "Live Mini App cards now say concise Russian copy such as Без оплаты, VIP закрыт, Preview-режим, while docs/dashboard keep detailed safety wording.",
    ownerAction:
      "Verify the user experience feels polished and not dominated by technical safety English.",
  },
];

const fixesApplied: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[] = [
  {
    area: "scoped CSS utilities",
    status: "PASS",
    detail:
      "Added aphrodite-pkg-267-mobile-webview-fix, aphrodite-pkg-267-card-fix, aphrodite-pkg-267-text-fix, aphrodite-pkg-267-two-after-430, aphrodite-pkg-267-three-after-430, and aphrodite-pkg-267-bottom-nav-fix.",
    ownerAction:
      "Keep future screenshot fixes scoped to these utilities unless a separate package approves broader redesign.",
  },
  {
    area: "live Mini App user copy",
    status: "PASS",
    detail:
      "Replaced broken English technical labels in locked previews and result/share card footers with concise Russian UI copy.",
    ownerAction:
      "Review screenshots for tone: premium, calm, readable, and not cheap horoscope spam.",
  },
  {
    area: "global text wrapping",
    status: "PASS",
    detail:
      "aphrodite-wrap-anywhere no longer uses aggressive anywhere wrapping; it now uses break-word and normal word-break to avoid letter-by-letter splits.",
    ownerAction:
      "Confirm long Russian and remaining mixed-language labels stay readable without horizontal overflow.",
  },
];

const mobileGridRules: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[] = [
  {
    area: "<=430px layout",
    status: "PASS",
    detail:
      "Major Mini App card grids stack to one column at 360px, 390px, and 430px using minmax(0, 1fr) and full-width card constraints.",
    ownerAction:
      "Browser simulation should check 360px, 390px, and 430px before deploy; owner should recheck Telegram Android WebView after deploy.",
  },
  {
    area: "431px and above",
    status: "DOCUMENTED",
    detail:
      "Two/three-column layouts may resume after 430px only through Package 267 scoped utilities.",
    ownerAction:
      "If a specific 431px+ device still looks cramped, open a new screenshot fix package.",
  },
];

const vipPreviewRules: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[] = [
  {
    area: "AphroditeLockedPreviewCard",
    status: "PASS",
    detail:
      "Locked previews are full-width on mobile, stack vertically, use readable Russian labels, and avoid narrow side columns.",
    ownerAction:
      "Verify Home, compatibility, Birth Matrix, Mystic, Natal, /vip-preview, and /vip-compatibility-report locked states.",
  },
  {
    area: "payment/VIP boundary",
    status: "BLOCKED",
    detail:
      "No active payment and no real VIP unlock remain true; Package 267 changes only visible copy and layout.",
    ownerAction:
      "Do not treat better preview UI as owner approval or monetization readiness.",
  },
];

const userFacingCopyRules: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[] = [
  {
    area: "technical English removed from live cards",
    status: "PASS",
    detail:
      "Live Mini App cards no longer surface broken English safety text like No active payment, Owner review required, or VIP locked preview as user-dominant UI copy.",
    ownerAction:
      "Keep detailed safety notes in docs/dashboard, not inside the primary user result cards.",
  },
  {
    area: "replacement labels",
    status: "PASS",
    detail:
      "User-facing replacements include Полный разбор пары, Календарь пары, Матрица Pro, Карточка результата, Без оплаты, VIP закрыт, Preview-режим.",
    ownerAction:
      "Owner should confirm the Russian wording is clear enough for launch audience.",
  },
];

const textWrappingRules: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[] = [
  {
    area: "word wrapping",
    status: "PASS",
    detail:
      "Use break-word and word-break: normal for live cards; avoid forcing long English words into narrow chips.",
    ownerAction:
      "Check that text does not split as relationshi p, paymen t, or pre vie w.",
  },
  {
    area: "card min-width",
    status: "PASS",
    detail:
      "Cards use min-width: 0, max-width: 100%, overflow guards, and one-column grids to keep content inside viewport.",
    ownerAction:
      "If any card overflows horizontally, treat it as a new visual blocker before owner approval.",
  },
];

const telegramWebViewRules: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[] = [
  {
    area: "Android Telegram WebView",
    status: "MANUAL REQUIRED",
    detail:
      "Package 267 specifically targets Android Telegram screenshots, but real-device verification remains manual.",
    ownerAction:
      "Clear Telegram WebView cache after deploy, reopen Mini App, and capture the same screens again.",
  },
  {
    area: "bottom navigation",
    status: "PASS",
    detail:
      "Bottom navigation received Package 267 safe-area marker and keeps max-width/label wrapping constraints.",
    ownerAction:
      "Verify it remains visible and is not clipped by Telegram or device bottom chrome.",
  },
];

const safetyBoundaries: readonly string[] = [
  "No production launch.",
  "No Telegram API.",
  "No Telegram messages.",
  "No BotFather changes.",
  "No active CTA logic changes.",
  "No channel mapping changes.",
  "No calculation changes.",
  "No date parsing/validation changes.",
  "No Mystic selection/random/storage changes.",
  "No payments or invoices.",
  "No VIP unlock.",
  "No entitlement bypass.",
  "No DB/storage writes.",
  "No external analytics.",
  "No cron/workflow/publish script changes.",
  "No secrets.",
  "No production DB connection.",
  "publicLaunchApproved=false",
  "ownerManualReviewRequired=true",
];

const whatWasNotChanged: readonly AphroditeCriticalMobileTelegramWebviewVisualFixRow[] = [
  { area: "business logic", status: "PASS", detail: "No business logic, calculations, date parsing, Mystic random/storage, or active CTA destinations were changed.", ownerAction: "Keep behavior guarded by smoke tests." },
  { area: "payments/VIP", status: "PASS", detail: "No payment, invoice, entitlement bypass, or real VIP unlock was added.", ownerAction: "Payment/VIP remain blocked until a separate approved package." },
  { area: "Telegram/platform side effects", status: "PASS", detail: "No Telegram API, messages, BotFather changes, channel mappings, cron/workflows, or publish scripts were changed.", ownerAction: "Production delivery remains frozen." },
  { area: "data/secrets", status: "PASS", detail: "No DB/storage writes, production DB connection, external analytics activation, or secrets were added.", ownerAction: "Manual env/backup/owner checks remain blockers." },
];

const remainingBlockers: readonly string[] = [
  "DATABASE_URL manual configuration",
  "TELEGRAM_BOT_TOKEN manual configuration",
  "backup freshness <24h",
  "restore rehearsal",
  "real-device QA manual execution",
  "Telegram WebView/startapp manual QA",
  "content/CTA owner review",
  "owner explicit approval",
];

export function getAphroditeCriticalMobileTelegramWebviewVisualFixes(): AphroditeCriticalMobileTelegramWebviewVisualFixModel {
  return {
    packageNumber: 267,
    title: APHRODITE_CRITICAL_MOBILE_TELEGRAM_WEBVIEW_VISUAL_FIXES_TITLE,
    route: APHRODITE_CRITICAL_MOBILE_TELEGRAM_WEBVIEW_VISUAL_FIXES_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    screenshotFindings,
    criticalIssues,
    fixesApplied,
    mobileGridRules,
    vipPreviewRules,
    userFacingCopyRules,
    textWrappingRules,
    telegramWebViewRules,
    safetyBoundaries,
    whatWasNotChanged,
    liveRoutes: ["/miniapp", "/miniapp?startapp=mystic", "/birth-matrix", "/vip-preview", "/vip-compatibility-report", "/compatibility"],
    mobileViewports: ["360px", "390px", "430px"],
    nextPackageRecommendation: "Package 268 - Owner Visual Recheck After Mobile Fixes",
    safetyNotes: [
      "Package 267 is visual/layout only.",
      "Critical owner screenshot issues were fixed before any owner approval or soft launch step.",
      "No production launch was performed.",
      "publicLaunchApproved=false",
      "ownerManualReviewRequired=true",
    ],
    remainingBlockers,
    safetyFlags: {
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
    },
  };
}
