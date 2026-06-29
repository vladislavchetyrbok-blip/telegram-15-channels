/**
 * Package 290: Public URL Telegram Setup Manual Gate.
 *
 * Static manual gate only. This package does not configure BotFather, call
 * Telegram API, send messages, set Telegram Mini App URL, launch production,
 * add secrets, commit .env.local, connect production DB, write DB, add payment,
 * unlock VIP, or change cron/workflows.
 */

export type AphroditePublicUrlTelegramSetupManualGateStatus =
  | "REQUIRED_NOT_CONFIGURED"
  | "MANUAL_BOTFATHER_SETUP_NOT_DONE"
  | "BLOCKED"
  | "MANUAL REQUIRED"
  | "DOCUMENTED"
  | "NOT APPROVED";

export type AphroditePublicUrlTelegramSetupManualGateRow = {
  area: string;
  status: AphroditePublicUrlTelegramSetupManualGateStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditePublicUrlTelegramSetupManualGateModel = {
  packageNumber: 290;
  title: string;
  route: "/dashboard/networks/zodiac/public-url-telegram-setup-manual-gate";
  currentMainHead: "8eb80920f62afa7471b6a5f982217f40aef6387d";
  publicUrlStatus: "REQUIRED_NOT_CONFIGURED";
  telegramMiniAppUrlStatus: "MANUAL_BOTFATHER_SETUP_NOT_DONE";
  publicUrlApproved: false;
  botFatherSetupDone: false;
  ownerActionStillRequired: true;
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  requiredPublicRoutes: readonly AphroditePublicUrlTelegramSetupManualGateRow[];
  httpsRequirement: readonly AphroditePublicUrlTelegramSetupManualGateRow[];
  manualBotFatherSteps: readonly AphroditePublicUrlTelegramSetupManualGateRow[];
  publicRouteVerificationChecklist: readonly AphroditePublicUrlTelegramSetupManualGateRow[];
  unresolvedProductionBlockers: readonly AphroditePublicUrlTelegramSetupManualGateRow[];
  safetyBoundaries: readonly AphroditePublicUrlTelegramSetupManualGateRow[];
  whatThisPackageDoesNotDo: readonly AphroditePublicUrlTelegramSetupManualGateRow[];
  nextPackageRecommendation: "Package 291 - Production Blocker Closure Checklist";
  safetyNotes: readonly string[];
  remainingBlockers: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    botFatherChanged: false;
    telegramMiniAppUrlSetAutomatically: false;
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

export const APHRODITE_PUBLIC_URL_TELEGRAM_SETUP_MANUAL_GATE_TITLE =
  "Public URL Telegram Setup Manual Gate";

export const APHRODITE_PUBLIC_URL_TELEGRAM_SETUP_MANUAL_GATE_ROUTE =
  "/dashboard/networks/zodiac/public-url-telegram-setup-manual-gate" as const;

const requiredPublicRoutes: readonly AphroditePublicUrlTelegramSetupManualGateRow[] = [
  {
    area: "/miniapp",
    status: "DOCUMENTED",
    detail: "Required public route for the Mini App hub. Must be reachable through the owner-approved HTTPS public URL before launch.",
    ownerAction: "Verify manually after public URL is selected; do not use dashboard or internal URLs.",
  },
  {
    area: "/compatibility",
    status: "DOCUMENTED",
    detail: "Required public route for the compatibility entry and result flow.",
    ownerAction: "Verify public route shell isolation and no dashboard chrome.",
  },
  {
    area: "/birth-matrix",
    status: "DOCUMENTED",
    detail: "Required public route for the birth matrix flow.",
    ownerAction: "Verify mobile layout and public access manually.",
  },
  {
    area: "/vip-preview",
    status: "DOCUMENTED",
    detail: "Required public route for locked VIP preview. It must not unlock VIP.",
    ownerAction: "Verify preview remains locked and does not create entitlements.",
  },
  {
    area: "/vip-compatibility-report",
    status: "DOCUMENTED",
    detail: "Required public route for VIP compatibility report preview boundary.",
    ownerAction: "Verify preview boundary without payment or entitlement grant.",
  },
  {
    area: "/miniapp?startapp=mystic",
    status: "DOCUMENTED",
    detail: "Required public route for Telegram startapp mystic deep link.",
    ownerAction: "Verify manually only after public URL owner approval.",
  },
  {
    area: "/miniapp?startapp=compatibility",
    status: "DOCUMENTED",
    detail: "Required public route for Telegram startapp compatibility deep link.",
    ownerAction: "Verify manually only after public URL owner approval.",
  },
  {
    area: "/miniapp?startapp=birth_matrix",
    status: "DOCUMENTED",
    detail: "Required public route for Telegram startapp birth_matrix deep link.",
    ownerAction: "Verify manually only after public URL owner approval.",
  },
  {
    area: "/miniapp?startapp=vip",
    status: "DOCUMENTED",
    detail: "Required public route for Telegram startapp vip deep link.",
    ownerAction: "Verify manually only after public URL owner approval.",
  },
];

const httpsRequirement: readonly AphroditePublicUrlTelegramSetupManualGateRow[] = [
  {
    area: "HTTPS requirement",
    status: "MANUAL REQUIRED",
    detail: "HTTPS requirement is mandatory. PUBLIC_APP_URL must start with https:// before owner can approve Telegram Mini App setup.",
    ownerAction: "Owner verifies certificate validity, host ownership, redirects, and final route behavior.",
  },
  {
    area: "PUBLIC_APP_URL is not configured by this package",
    status: "REQUIRED_NOT_CONFIGURED",
    detail: "publicUrlStatus = REQUIRED_NOT_CONFIGURED. This package does not set actual public URL in production.",
    ownerAction: "Configure and approve public URL manually outside this package.",
  },
  {
    area: "public URL approval gate",
    status: "BLOCKED",
    detail: "publicUrlApproved=false until owner evidence confirms HTTPS URL and required routes.",
    ownerAction: "Do not mark public URL approved without owner evidence.",
  },
];

const manualBotFatherSteps: readonly AphroditePublicUrlTelegramSetupManualGateRow[] = [
  {
    area: "BotFather setup manual only",
    status: "MANUAL_BOTFATHER_SETUP_NOT_DONE",
    detail: "telegramMiniAppUrlStatus = MANUAL_BOTFATHER_SETUP_NOT_DONE. BotFather Mini App URL is not configured by this package.",
    ownerAction: "Owner performs any BotFather setup manually after URL approval and real-device review.",
  },
  {
    area: "no BotFather automation",
    status: "NOT APPROVED",
    detail: "Do not open BotFather, mutate Telegram settings, set webhook, or set Telegram Mini App URL automatically.",
    ownerAction: "Keep BotFather setup as not done until a separate owner-approved manual record exists.",
  },
  {
    area: "BotFather evidence",
    status: "MANUAL REQUIRED",
    detail: "Future evidence may show masked/manual confirmation only and must not expose TELEGRAM_BOT_TOKEN.",
    ownerAction: "Record reviewer, date, final approved public URL, and visible masked Telegram UI state.",
  },
];

const publicRouteVerificationChecklist: readonly AphroditePublicUrlTelegramSetupManualGateRow[] = [
  {
    area: "route list coverage",
    status: "DOCUMENTED",
    detail: "All required public routes must be checked on the final HTTPS host before Telegram Mini App URL setup.",
    ownerAction: "Verify routes in browser and Telegram WebView after owner-approved public URL exists.",
  },
  {
    area: "dashboard exclusion",
    status: "DOCUMENTED",
    detail: "Public URL must point to public Mini App routes only, never /dashboard or admin pages.",
    ownerAction: "Reject any public URL evidence that exposes dashboard chrome or admin links.",
  },
  {
    area: "no automatic approval",
    status: "BLOCKED",
    detail: "Route checks and PUBLIC_APP_URL format checks do not automatically approve public URL or BotFather setup.",
    ownerAction: "Owner must approve the final public URL manually.",
  },
];

const unresolvedProductionBlockers: readonly AphroditePublicUrlTelegramSetupManualGateRow[] = [
  {
    area: "DATABASE_URL missing",
    status: "BLOCKED",
    detail: "DATABASE_URL missing remains unresolved.",
    ownerAction: "Configure outside Git and verify redacted presence only.",
  },
  {
    area: "TELEGRAM_BOT_TOKEN missing",
    status: "BLOCKED",
    detail: "TELEGRAM_BOT_TOKEN missing remains unresolved.",
    ownerAction: "Configure outside Git and do not validate it through Telegram in this package.",
  },
  {
    area: "backup older than 24h",
    status: "BLOCKED",
    detail: "backup older than 24h remains unresolved.",
    ownerAction: "Capture a real fresh backup and restore rehearsal evidence separately.",
  },
  {
    area: "restore rehearsal required",
    status: "BLOCKED",
    detail: "restore rehearsal required remains unresolved.",
    ownerAction: "Complete a non-production restore rehearsal before launch approval.",
  },
  {
    area: "owner real-device approval pending",
    status: "BLOCKED",
    detail: "owner real-device approval pending remains unresolved.",
    ownerAction: "Owner must approve real-device evidence separately.",
  },
  {
    area: "public URL not configured/approved",
    status: "REQUIRED_NOT_CONFIGURED",
    detail: "public URL not configured/approved remains unresolved.",
    ownerAction: "Owner selects and approves final HTTPS public URL manually.",
  },
  {
    area: "BotFather Mini App URL not configured",
    status: "MANUAL_BOTFATHER_SETUP_NOT_DONE",
    detail: "BotFather Mini App URL not configured remains unresolved.",
    ownerAction: "Owner performs BotFather setup manually only after all prerequisites pass.",
  },
];

const safetyBoundaries: readonly AphroditePublicUrlTelegramSetupManualGateRow[] = [
  {
    area: "manual gate",
    status: "NOT APPROVED",
    detail: "This package documents a manual gate only and does not configure production or Telegram.",
    ownerAction: "Keep publicUrlApproved=false and botFatherSetupDone=false.",
  },
  {
    area: "launch gate",
    status: "NOT APPROVED",
    detail: "publicLaunchApproved=false remains mandatory.",
    ownerAction: "Do not approve launch from this package.",
  },
  {
    area: "owner review gate",
    status: "MANUAL REQUIRED",
    detail: "ownerManualReviewRequired=true remains mandatory.",
    ownerAction: "Keep owner review open until all blockers have real evidence.",
  },
];

const whatThisPackageDoesNotDo: readonly AphroditePublicUrlTelegramSetupManualGateRow[] = [
  {
    area: "BotFather and Telegram",
    status: "NOT APPROVED",
    detail: "This package does not configure BotFather, call Telegram API, send messages, set webhook, or set Telegram Mini App URL automatically.",
    ownerAction: "Keep all Telegram setup manual and blocked.",
  },
  {
    area: "production URL mutation",
    status: "NOT APPROVED",
    detail: "This package does not set actual public URL in production and does not launch production.",
    ownerAction: "Use future owner evidence before approving any public URL.",
  },
  {
    area: "secrets and data",
    status: "NOT APPROVED",
    detail: "This package does not add real secrets, commit .env.local, connect production DB, or write to DB.",
    ownerAction: "Keep secrets outside Git and DB untouched.",
  },
  {
    area: "monetization and automation",
    status: "NOT APPROVED",
    detail: "This package does not add payment, unlock VIP, or change cron/workflows.",
    ownerAction: "Keep monetization and automation unchanged.",
  },
];

const safetyNotes = [
  "publicUrlStatus = REQUIRED_NOT_CONFIGURED.",
  "telegramMiniAppUrlStatus = MANUAL_BOTFATHER_SETUP_NOT_DONE.",
  "publicUrlApproved=false.",
  "botFatherSetupDone=false.",
  "HTTPS requirement documented.",
  "Required public routes documented.",
  "Manual BotFather steps documented.",
  "No Telegram API calls.",
  "No messages.",
  "No BotFather mutation.",
  "No production DB connect.",
  "No DB writes.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
] as const;

const remainingBlockers = [
  "DATABASE_URL missing",
  "TELEGRAM_BOT_TOKEN missing",
  "backup older than 24h",
  "restore rehearsal required",
  "owner real-device approval pending",
  "public URL not configured/approved",
  "BotFather Mini App URL not configured",
] as const;

export function getAphroditePublicUrlTelegramSetupManualGate(): AphroditePublicUrlTelegramSetupManualGateModel {
  return {
    packageNumber: 290,
    title: APHRODITE_PUBLIC_URL_TELEGRAM_SETUP_MANUAL_GATE_TITLE,
    route: APHRODITE_PUBLIC_URL_TELEGRAM_SETUP_MANUAL_GATE_ROUTE,
    currentMainHead: "8eb80920f62afa7471b6a5f982217f40aef6387d",
    publicUrlStatus: "REQUIRED_NOT_CONFIGURED",
    telegramMiniAppUrlStatus: "MANUAL_BOTFATHER_SETUP_NOT_DONE",
    publicUrlApproved: false,
    botFatherSetupDone: false,
    ownerActionStillRequired: true,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    requiredPublicRoutes,
    httpsRequirement,
    manualBotFatherSteps,
    publicRouteVerificationChecklist,
    unresolvedProductionBlockers,
    safetyBoundaries,
    whatThisPackageDoesNotDo,
    nextPackageRecommendation: "Package 291 - Production Blocker Closure Checklist",
    safetyNotes,
    remainingBlockers,
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      botFatherChanged: false,
      telegramMiniAppUrlSetAutomatically: false,
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
