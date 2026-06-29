export type AphroditeRealDeviceVipPreviewDensityStatus =
  | "DONE"
  | "DOCUMENTED"
  | "LOCKED"
  | "NOT CHANGED";

export type AphroditeRealDeviceVipPreviewDensityRow = {
  area: string;
  status: AphroditeRealDeviceVipPreviewDensityStatus;
  detail: string;
  ownerAction: string;
};

export const APHRODITE_REAL_DEVICE_VIP_PREVIEW_DENSITY_FIX_TITLE =
  "Real Device VIP Preview Density Fix";

export const APHRODITE_REAL_DEVICE_VIP_PREVIEW_DENSITY_FIX_ROUTE =
  "/dashboard/networks/zodiac/real-device-vip-preview-density-fix" as const;

export const aphroditeRealDeviceVipPreviewDensityFix = {
  packageNumber: 303,
  title: APHRODITE_REAL_DEVICE_VIP_PREVIEW_DENSITY_FIX_TITLE,
  route: APHRODITE_REAL_DEVICE_VIP_PREVIEW_DENSITY_FIX_ROUTE,
  currentMainHead: "d15b0c85fe90e8bfea2e18d9c5dfb872c2570fe0",
  densityFixStatus: "DONE",
  publicLaunchApproved: false,
  ownerManualReviewRequired: true,
  blockersRemainOpen: true,
  softLaunchStatusNo: "NO",
  ownerScreenshotIssues: [
    {
      area: "real iPhone Telegram screenshots",
      status: "DOCUMENTED",
      detail: "Owner screenshots showed clean public UI with no admin shell or Aphrodite leak, but VIP/30-day compatibility preview was too long and text-heavy.",
      ownerAction: "Recheck /miniapp?startapp=vip and 30-day compatibility on iPhone Telegram after this package.",
    },
    {
      area: "30-day card repetition",
      status: "DOCUMENTED",
      detail: "The same long relationship guidance and soft disclaimer repeated across many day cards, making preview feel like an unlocked full report.",
      ownerAction: "Confirm the repeated disclaimer now appears once near the result, not inside every day card.",
    },
  ],
  vipPreviewDensityRules: [
    {
      area: "VIP preview scope",
      status: "DONE",
      detail: "User-facing copy now says VIP превью, Превью до, сейчас: превью, Без оплаты, VIP закрыт, and keeps payment inactive.",
      ownerAction: "Verify copy does not imply VIP is unlocked or payment is active.",
    },
    {
      area: "preview-only explanation",
      status: "DONE",
      detail: "Short copy is used: Показана короткая версия. Полный отчёт закрыт. Оплата не активна.",
      ownerAction: "Confirm this reads as a compact preview rather than a paid/full report.",
    },
  ],
  compactDayCardRules: [
    {
      area: "first five days",
      status: "DONE",
      detail: "30-day compatibility surfaces show the first 5 days as compact preview cards with day/date, mood tag, one short sentence, and one short action.",
      ownerAction: "Inspect first 5 cards on 390px iPhone viewport for 25-40% screen-height target.",
    },
    {
      area: "remaining days",
      status: "DONE",
      detail: "Days 6-30 render as compact rows with day, date, mood, and short action instead of 30 huge full-text cards.",
      ownerAction: "Scroll the compact list and confirm bottom navigation/save/share remain reachable.",
    },
  ],
  repeatedCopyRemoved: {
    status: "DONE",
    removedFromEveryDayCard: true,
    shownOnceNearResult: true,
    copy: "Это мягкая навигация для разговора, а не жёсткое предсказание.",
  },
  russianPreviewCopyRules: [
    {
      area: "VIP preview wording",
      status: "DONE",
      detail: "VIP preview was replaced with VIP превью on live public preview surfaces where appropriate.",
      ownerAction: "Owner may approve the Russian wording after real-device screenshot recheck.",
    },
    {
      area: "Preview status wording",
      status: "DONE",
      detail: "Preview до and status preview were replaced with Превью до and превью on Mini App VIP panels.",
      ownerAction: "Verify no mixed English/Russian preview label appears in the hot path.",
    },
  ],
  affectedScreens: [
    {
      area: "/vip-preview",
      status: "DONE",
      detail: "Public locked VIP preview copy now uses VIP превью and Превью labels.",
      ownerAction: "Open direct route and confirm no payment/VIP unlock is implied.",
    },
    {
      area: "/vip-compatibility-report",
      status: "DONE",
      detail: "Standalone compatibility preview uses Russian preview copy and locked scope.",
      ownerAction: "Generate a preview and confirm full report remains closed.",
    },
    {
      area: "/compatibility result and /miniapp?startapp=vip",
      status: "DONE",
      detail: "VIP preview cards and 30-day compatibility sections are compacted without calculation or route changes.",
      ownerAction: "Recheck compatibility result, 30-day section, bottom nav, save, and share buttons.",
    },
  ],
  safetyBoundaries: [
    { area: "production launch", status: "LOCKED", detail: "No production launch was performed.", ownerAction: "Keep publicLaunchApproved=false." },
    { area: "Telegram and BotFather", status: "LOCKED", detail: "No Telegram API, messages, BotFather automation, webhook, or command mutation was added.", ownerAction: "Manual Telegram/BotFather work remains owner-only." },
    { area: "payment and VIP access", status: "LOCKED", detail: "No payment, entitlement bypass, VIP unlock, invoice, or active CTA destination change was added.", ownerAction: "Keep VIP закрыт until a future approved package." },
    { area: "data and automation", status: "LOCKED", detail: "No DB write, production DB connection, external analytics, cron/workflow, publish, secret, or .env.local change was added.", ownerAction: "Continue redacted/manual blocker closure only." },
  ],
  whatWasNotChanged: [
    "No calculations changed.",
    "No routes changed.",
    "No payment added.",
    "No VIP unlock added.",
    "No entitlement bypass added.",
    "No DB writes added.",
    "No Telegram API calls added.",
    "No BotFather changes added.",
    "No cron/workflow changes added.",
    "No secrets added.",
  ],
  remainingBlockers: [
    "DATABASE_URL missing",
    "TELEGRAM_BOT_TOKEN missing",
    "backup older than 24h",
    "owner real-device approval still required",
    "restore rehearsal evidence still required",
    "PUBLIC_APP_URL evidence still required",
    "BotFather Mini App URL setup still manual and not done",
  ],
  safetyFlags: {
    productionLaunchDone: false,
    telegramApiUsed: false,
    messagesSent: false,
    botFatherChanged: false,
    paymentAdded: false,
    vipUnlockAdded: false,
    entitlementBypassAdded: false,
    databaseWriteAdded: false,
    productionDbConnected: false,
    externalAnalyticsAdded: false,
    cronWorkflowChanged: false,
    secretsAdded: false,
    envLocalCommitted: false,
  },
  safetyNotes: [
    "publicLaunchApproved=false",
    "ownerManualReviewRequired=true",
    "Visual density only; calculations, routes, payments, VIP access, DB, Telegram, BotFather, cron/workflows, and secrets were not changed.",
  ],
  nextPackageRecommendation: "Package 304 - Antigravity Real Device Screenshot Recheck",
} as const;

export function getAphroditeRealDeviceVipPreviewDensityFix() {
  return aphroditeRealDeviceVipPreviewDensityFix;
}
