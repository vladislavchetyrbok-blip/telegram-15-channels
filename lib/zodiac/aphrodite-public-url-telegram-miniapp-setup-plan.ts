/**
 * Package 281: Public URL and Telegram Mini App Setup Plan.
 *
 * Static manual setup plan only. This package does not configure BotFather,
 * call Telegram API, send messages, launch production, add secrets, write DB,
 * add payment, unlock VIP, or point public launch traffic anywhere.
 */

export type AphroditePublicUrlTelegramMiniappStatus =
  | "MANUAL REQUIRED"
  | "DOCUMENTED"
  | "PASS"
  | "NOT_DONE"
  | "NOT APPROVED";

export type AphroditePublicUrlTelegramMiniappRow = {
  area: string;
  status: AphroditePublicUrlTelegramMiniappStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditePublicUrlTelegramMiniappSetupPlanModel = {
  packageNumber: 281;
  title: string;
  route: "/dashboard/networks/zodiac/public-url-telegram-miniapp-setup-plan";
  publicUrlSetupStatus: "MANUAL REQUIRED";
  botFatherSetupStatus: "NOT_DONE";
  routeIsolationStatus: "PASS";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  publicUrlRequirements: readonly AphroditePublicUrlTelegramMiniappRow[];
  telegramMiniAppSetupRules: readonly AphroditePublicUrlTelegramMiniappRow[];
  requiredTestRoutes: readonly AphroditePublicUrlTelegramMiniappRow[];
  routeIsolationRules: readonly AphroditePublicUrlTelegramMiniappRow[];
  forbiddenActions: readonly AphroditePublicUrlTelegramMiniappRow[];
  nextPackageRecommendation: "Package 282 - Owner Real Device Verification Checklist";
  safetyNotes: readonly string[];
  remainingBlockers: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    botFatherChanged: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    databaseWriteAdded: false;
    productionDbConnected: false;
    externalAnalyticsAdded: false;
    cronWorkflowPublishChanged: false;
    secretsAdded: false;
    envLocalCommitted: false;
    publicLaunchApproved: false;
    ownerManualReviewRequired: true;
  };
};

export const APHRODITE_PUBLIC_URL_TELEGRAM_MINIAPP_SETUP_PLAN_TITLE =
  "Public URL and Telegram Mini App Setup Plan";

export const APHRODITE_PUBLIC_URL_TELEGRAM_MINIAPP_SETUP_PLAN_ROUTE =
  "/dashboard/networks/zodiac/public-url-telegram-miniapp-setup-plan" as const;

const publicUrlRequirements: readonly AphroditePublicUrlTelegramMiniappRow[] = [
  {
    area: "public URL requirement",
    status: "MANUAL REQUIRED",
    detail: "public URL requirement remains manual: owner must choose the approved deployed public URL after review.",
    ownerAction: "Record the approved host and route only after owner review; do not launch from this package.",
  },
  {
    area: "HTTPS requirement",
    status: "MANUAL REQUIRED",
    detail: "HTTPS requirement is mandatory for Telegram Mini App usage and public user trust.",
    ownerAction: "Confirm certificate validity, host ownership, and HTTPS redirects manually.",
  },
  {
    area: "public route target",
    status: "DOCUMENTED",
    detail: "public URL must point to public isolated routes, not dashboard.",
    ownerAction: "Use public Mini App routes only; never use /dashboard as Telegram Mini App URL.",
  },
];

const telegramMiniAppSetupRules: readonly AphroditePublicUrlTelegramMiniappRow[] = [
  {
    area: "Telegram Mini App URL setup is manual",
    status: "MANUAL REQUIRED",
    detail: "Telegram Mini App URL setup is manual and must happen only after owner approval.",
    ownerAction: "Owner performs setup manually in Telegram tooling after route and visual approval.",
  },
  {
    area: "BotFather changes are manual only and not done by this package",
    status: "NOT_DONE",
    detail: "BotFather changes are manual only and not done by this package.",
    ownerAction: "Do not change BotFather in this branch or from any automation.",
  },
  {
    area: "BotFather mutation boundary",
    status: "NOT_DONE",
    detail: "No BotFather mutation is performed or scripted.",
    ownerAction: "Keep setup status as NOT_DONE until a separate owner-approved manual gate records it.",
  },
];

const requiredTestRoutes: readonly AphroditePublicUrlTelegramMiniappRow[] = [
  {
    area: "/miniapp",
    status: "DOCUMENTED",
    detail: "Required public test route for the Mini App hub.",
    ownerAction: "Verify in browser and Telegram WebView later without admin shell.",
  },
  {
    area: "/compatibility",
    status: "DOCUMENTED",
    detail: "Required public test route for compatibility entry and result flow.",
    ownerAction: "Verify public route behavior without dashboard chrome.",
  },
  {
    area: "/birth-matrix",
    status: "DOCUMENTED",
    detail: "Required public test route for natal and matrix flow.",
    ownerAction: "Verify public route behavior without dashboard chrome.",
  },
  {
    area: "/vip-preview",
    status: "DOCUMENTED",
    detail: "Required public test route for locked VIP preview surface.",
    ownerAction: "Verify preview stays locked and does not unlock VIP.",
  },
  {
    area: "/vip-compatibility-report",
    status: "DOCUMENTED",
    detail: "Required public test route for VIP compatibility report preview boundary.",
    ownerAction: "Verify preview boundary without payment or entitlement grant.",
  },
];

const routeIsolationRules: readonly AphroditePublicUrlTelegramMiniappRow[] = [
  {
    area: "route isolation must remain PASS",
    status: "PASS",
    detail: "route isolation must remain PASS before any public URL can be configured.",
    ownerAction: "Run shell isolation QA after route or layout changes.",
  },
  {
    area: "dashboard exclusion",
    status: "DOCUMENTED",
    detail: "Dashboard and admin routes remain internal and must not be used as public Mini App URLs.",
    ownerAction: "Reject any setup pointing Telegram users to /dashboard.",
  },
];

const forbiddenActions: readonly AphroditePublicUrlTelegramMiniappRow[] = [
  {
    area: "Telegram side effects",
    status: "NOT APPROVED",
    detail: "No Telegram API calls, no messages, and no BotFather mutation are allowed.",
    ownerAction: "Keep this package plan-only.",
  },
  {
    area: "production side effects",
    status: "NOT APPROVED",
    detail: "No production launch, no secrets, no DB writes, no cron/workflow changes.",
    ownerAction: "Keep manual setup blocked until later owner gates pass.",
  },
  {
    area: "monetization side effects",
    status: "NOT APPROVED",
    detail: "No payment, invoice, entitlement grant, or VIP unlock is added.",
    ownerAction: "Keep all VIP routes preview-only.",
  },
];

const safetyNotes = [
  "public URL requirement documented only.",
  "HTTPS requirement documented only.",
  "Telegram Mini App URL setup is manual.",
  "BotFather changes are manual only and not done by this package.",
  "No Telegram API calls.",
  "No messages.",
  "No BotFather mutation.",
  "route isolation must remain PASS.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
] as const;

const remainingBlockers = [
  "public URL not selected",
  "Telegram Mini App URL not configured",
  "BotFather setup NOT_DONE",
  "DATABASE_URL missing",
  "TELEGRAM_BOT_TOKEN missing",
  "backup older than 24h",
] as const;

export function getAphroditePublicUrlTelegramMiniappSetupPlan(): AphroditePublicUrlTelegramMiniappSetupPlanModel {
  return {
    packageNumber: 281,
    title: APHRODITE_PUBLIC_URL_TELEGRAM_MINIAPP_SETUP_PLAN_TITLE,
    route: APHRODITE_PUBLIC_URL_TELEGRAM_MINIAPP_SETUP_PLAN_ROUTE,
    publicUrlSetupStatus: "MANUAL REQUIRED",
    botFatherSetupStatus: "NOT_DONE",
    routeIsolationStatus: "PASS",
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    publicUrlRequirements,
    telegramMiniAppSetupRules,
    requiredTestRoutes,
    routeIsolationRules,
    forbiddenActions,
    nextPackageRecommendation: "Package 282 - Owner Real Device Verification Checklist",
    safetyNotes,
    remainingBlockers,
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      botFatherChanged: false,
      paymentAdded: false,
      vipUnlockAdded: false,
      databaseWriteAdded: false,
      productionDbConnected: false,
      externalAnalyticsAdded: false,
      cronWorkflowPublishChanged: false,
      secretsAdded: false,
      envLocalCommitted: false,
      publicLaunchApproved: false,
      ownerManualReviewRequired: true,
    },
  };
}
