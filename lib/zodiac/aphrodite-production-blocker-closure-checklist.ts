/**
 * Package 291: Production Blocker Closure Checklist.
 *
 * Static closure checklist only. This package does not close blockers, launch
 * production, call Telegram API, send messages, change BotFather, add secrets,
 * commit .env.local, connect production DB, write DB, add payment, unlock VIP,
 * or change cron/workflows.
 */

export type AphroditeProductionBlockerKey =
  | "ownerRealDeviceApproval"
  | "databaseUrl"
  | "telegramBotToken"
  | "backupFreshness"
  | "restoreRehearsal"
  | "publicAppUrl"
  | "botFatherMiniAppUrl";

export type AphroditeProductionBlockerStatus =
  | "PENDING"
  | "MISSING"
  | "STALE"
  | "REQUIRED_NOT_COMPLETED"
  | "NOT_DONE";

export type AphroditeProductionBlockerChecklistStatus =
  | "BLOCKED_MANUAL_CLOSURE_REQUIRED"
  | AphroditeProductionBlockerStatus
  | "OPEN"
  | "MANUAL REQUIRED"
  | "DOCUMENTED"
  | "NOT APPROVED";

export type AphroditeProductionBlockerRow = {
  key: AphroditeProductionBlockerKey;
  label: string;
  status: AphroditeProductionBlockerStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeProductionBlockerChecklistRow = {
  area: string;
  status: AphroditeProductionBlockerChecklistStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeProductionBlockerClosureChecklistModel = {
  packageNumber: 291;
  title: string;
  route: "/dashboard/networks/zodiac/production-blocker-closure-checklist";
  currentMainHead: "4147b476163424f826cedd39172055ac60d51d8b";
  productionBlockerClosureStatus: "BLOCKED_MANUAL_CLOSURE_REQUIRED";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  softLaunchApproved: false;
  allBlockers: readonly AphroditeProductionBlockerRow[];
  closureCriteria: readonly AphroditeProductionBlockerChecklistRow[];
  evidenceRequired: readonly AphroditeProductionBlockerChecklistRow[];
  safeVerificationCommands: readonly AphroditeProductionBlockerChecklistRow[];
  ownerManualActions: readonly AphroditeProductionBlockerChecklistRow[];
  blockedUntil: readonly AphroditeProductionBlockerChecklistRow[];
  launchGateSummary: readonly AphroditeProductionBlockerChecklistRow[];
  safetyBoundaries: readonly AphroditeProductionBlockerChecklistRow[];
  whatThisPackageDoesNotDo: readonly AphroditeProductionBlockerChecklistRow[];
  nextPackageRecommendation: "Package 292 - Owner Manual Closure Execution Pack";
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
    blockersClosedWithoutEvidence: false;
    publicLaunchApproved: false;
    ownerManualReviewRequired: true;
    softLaunchApproved: false;
  };
};

export const APHRODITE_PRODUCTION_BLOCKER_CLOSURE_CHECKLIST_TITLE =
  "Production Blocker Closure Checklist";

export const APHRODITE_PRODUCTION_BLOCKER_CLOSURE_CHECKLIST_ROUTE =
  "/dashboard/networks/zodiac/production-blocker-closure-checklist" as const;

const allBlockers: readonly AphroditeProductionBlockerRow[] = [
  {
    key: "ownerRealDeviceApproval",
    label: "ownerRealDeviceApproval",
    status: "PENDING",
    detail: "ownerRealDeviceApproval = PENDING. Owner real-device approval is still pending.",
    ownerAction: "Owner provides real Telegram WebView screenshots or explicit approval before this blocker can close.",
  },
  {
    key: "databaseUrl",
    label: "DATABASE_URL",
    status: "MISSING",
    detail: "databaseUrl = MISSING. DATABASE_URL is not configured for production readiness.",
    ownerAction: "Configure only outside Git, then use redacted presence verification that prints no value.",
  },
  {
    key: "telegramBotToken",
    label: "TELEGRAM_BOT_TOKEN",
    status: "MISSING",
    detail: "telegramBotToken = MISSING. TELEGRAM_BOT_TOKEN is not configured for production readiness.",
    ownerAction: "Configure only outside Git, then use redacted presence verification without Telegram API validation in this package.",
  },
  {
    key: "backupFreshness",
    label: "backupFreshness",
    status: "STALE",
    detail: "backupFreshness = STALE. Latest known backup is older than 24h.",
    ownerAction: "Provide verified backup evidence newer than 24h.",
  },
  {
    key: "restoreRehearsal",
    label: "restoreRehearsal",
    status: "REQUIRED_NOT_COMPLETED",
    detail: "restoreRehearsal = REQUIRED_NOT_COMPLETED. Restore rehearsal evidence is not recorded.",
    ownerAction: "Complete documented non-production restore rehearsal and record evidence.",
  },
  {
    key: "publicAppUrl",
    label: "PUBLIC_APP_URL",
    status: "MISSING",
    detail: "publicAppUrl = MISSING. PUBLIC_APP_URL is not configured or approved.",
    ownerAction: "Provide HTTPS public URL, route checks, and no dashboard/admin shell evidence.",
  },
  {
    key: "botFatherMiniAppUrl",
    label: "BotFather Mini App URL",
    status: "NOT_DONE",
    detail: "botFatherMiniAppUrl = NOT_DONE. BotFather Mini App URL setup is not done.",
    ownerAction: "Owner manually configures in BotFather after approval; no automation.",
  },
];

const closureCriteria: readonly AphroditeProductionBlockerChecklistRow[] = [
  {
    area: "ownerRealDeviceApproval closure criteria",
    status: "PENDING",
    detail: "Owner provides real Telegram WebView screenshots or explicit approval.",
    ownerAction: "Attach owner approval evidence before marking ownerRealDeviceApproval closed.",
  },
  {
    area: "DATABASE_URL closure criteria",
    status: "MISSING",
    detail: "DATABASE_URL configured only outside Git; redacted presence check says present; no value printed.",
    ownerAction: "Run redacted presence check only after owner configures the secret outside the repo.",
  },
  {
    area: "TELEGRAM_BOT_TOKEN closure criteria",
    status: "MISSING",
    detail: "TELEGRAM_BOT_TOKEN configured only outside Git; redacted presence check says present; no token validation through Telegram API in this package.",
    ownerAction: "Verify presence only and keep token value hidden.",
  },
  {
    area: "backupFreshness closure criteria",
    status: "STALE",
    detail: "backupFreshness can close only with verified evidence <24h.",
    ownerAction: "Record timestamp, evidence path, reviewer, and age calculation.",
  },
  {
    area: "restoreRehearsal closure criteria",
    status: "REQUIRED_NOT_COMPLETED",
    detail: "restoreRehearsal can close only after documented rehearsal completed and evidence recorded.",
    ownerAction: "Run restore rehearsal manually against non-production target and record result.",
  },
  {
    area: "publicAppUrl closure criteria",
    status: "MISSING",
    detail: "publicAppUrl can close only when HTTPS public URL exists, routes pass public check, and no dashboard/admin shell appears.",
    ownerAction: "Record public route evidence for all required Mini App entry points.",
  },
  {
    area: "botFatherMiniAppUrl closure criteria",
    status: "NOT_DONE",
    detail: "botFatherMiniAppUrl can close only after owner manually configured in BotFather after approval; no automation.",
    ownerAction: "Record owner manual confirmation without secrets.",
  },
];

const evidenceRequired: readonly AphroditeProductionBlockerChecklistRow[] = [
  {
    area: "real-device evidence",
    status: "PENDING",
    detail: "Telegram WebView screenshots or explicit owner approval for the required public flows.",
    ownerAction: "Store review evidence without secrets or private user data.",
  },
  {
    area: "env evidence",
    status: "MISSING",
    detail: "Redacted presence output for DATABASE_URL and TELEGRAM_BOT_TOKEN; no values printed.",
    ownerAction: "Use present/missing evidence only.",
  },
  {
    area: "backup evidence",
    status: "STALE",
    detail: "Backup metadata proving age <24h, including timestamp, evidence path, reviewer, and source.",
    ownerAction: "Do not fabricate backup freshness.",
  },
  {
    area: "restore evidence",
    status: "REQUIRED_NOT_COMPLETED",
    detail: "Restore rehearsal record with non-production target, start/finish time, aggregate checks, reviewer, and result.",
    ownerAction: "Do not connect or restore production from this package.",
  },
  {
    area: "public URL evidence",
    status: "MISSING",
    detail: "HTTPS host, required route checklist, no dashboard/admin shell confirmation, and owner approval.",
    ownerAction: "Do not approve from format checks alone.",
  },
  {
    area: "BotFather evidence",
    status: "NOT_DONE",
    detail: "Owner manual confirmation that BotFather Mini App URL was configured after approval.",
    ownerAction: "Do not automate BotFather or call Telegram API.",
  },
];

const safeVerificationCommands: readonly AphroditeProductionBlockerChecklistRow[] = [
  {
    area: "env presence verification",
    status: "DOCUMENTED",
    detail: "node scripts/check-env-presence-redacted.mjs",
    ownerAction: "Expected evidence is present/missing only; no secret values.",
  },
  {
    area: "backup metadata verification",
    status: "DOCUMENTED",
    detail: "node scripts/check-backup-freshness-redacted.mjs",
    ownerAction: "Reads local metadata only; does not create backup, restore, or connect DB.",
  },
  {
    area: "public URL format verification",
    status: "DOCUMENTED",
    detail: "node scripts/check-public-url-routes-redacted.mjs",
    ownerAction: "Checks PUBLIC_APP_URL presence and HTTPS format only; does not fetch routes or approve URL.",
  },
  {
    area: "release gate verification",
    status: "DOCUMENTED",
    detail: "npm run production:safety:check",
    ownerAction: "Expected to remain red until DATABASE_URL, TELEGRAM_BOT_TOKEN, and backup freshness are actually resolved.",
  },
  {
    area: "owner approval verification",
    status: "DOCUMENTED",
    detail: "node scripts/qa-aphrodite-owner-real-device-approval-capture.mjs",
    ownerAction: "Confirms approval gate remains pending unless owner evidence exists.",
  },
];

const ownerManualActions: readonly AphroditeProductionBlockerChecklistRow[] = [
  {
    area: "collect real-device approval",
    status: "MANUAL REQUIRED",
    detail: "Owner must provide real Telegram WebView screenshots or explicit approval.",
    ownerAction: "Do this outside automation and record the evidence.",
  },
  {
    area: "configure production env",
    status: "MANUAL REQUIRED",
    detail: "Owner must configure DATABASE_URL and TELEGRAM_BOT_TOKEN outside Git.",
    ownerAction: "Never paste values into reports, prompts, screenshots, or commits.",
  },
  {
    area: "refresh backup and rehearse restore",
    status: "MANUAL REQUIRED",
    detail: "Owner must provide fresh backup evidence and complete restore rehearsal.",
    ownerAction: "Use non-production restore target for rehearsal evidence.",
  },
  {
    area: "approve public URL and BotFather setup",
    status: "MANUAL REQUIRED",
    detail: "Owner must approve HTTPS public URL and later manually configure BotFather Mini App URL.",
    ownerAction: "Do not automate BotFather setup.",
  },
];

const blockedUntil: readonly AphroditeProductionBlockerChecklistRow[] = [
  {
    area: "launch blocked until all seven blockers close",
    status: "BLOCKED_MANUAL_CLOSURE_REQUIRED",
    detail: "Launch remains blocked until ownerRealDeviceApproval, DATABASE_URL, TELEGRAM_BOT_TOKEN, backupFreshness, restoreRehearsal, publicAppUrl, and botFatherMiniAppUrl all have real evidence.",
    ownerAction: "Keep all blockers open until evidence exists.",
  },
  {
    area: "soft launch: NO",
    status: "NOT APPROVED",
    detail: "soft launch: NO. Soft launch is not approved by this package.",
    ownerAction: "Do not start soft launch.",
  },
];

const launchGateSummary: readonly AphroditeProductionBlockerChecklistRow[] = [
  {
    area: "productionBlockerClosureStatus",
    status: "BLOCKED_MANUAL_CLOSURE_REQUIRED",
    detail: "productionBlockerClosureStatus = BLOCKED_MANUAL_CLOSURE_REQUIRED.",
    ownerAction: "Do not mark blockers closed without evidence.",
  },
  {
    area: "publicLaunchApproved",
    status: "NOT APPROVED",
    detail: "publicLaunchApproved=false.",
    ownerAction: "Keep public launch blocked.",
  },
  {
    area: "ownerManualReviewRequired",
    status: "MANUAL REQUIRED",
    detail: "ownerManualReviewRequired=true.",
    ownerAction: "Owner manual review remains required.",
  },
];

const safetyBoundaries: readonly AphroditeProductionBlockerChecklistRow[] = [
  {
    area: "no false closure",
    status: "NOT APPROVED",
    detail: "Do not mark blockers closed without evidence.",
    ownerAction: "Use this checklist as closure criteria only.",
  },
  {
    area: "no production side effects",
    status: "NOT APPROVED",
    detail: "No launch, no production DB connect, no DB writes, no cron/workflow changes.",
    ownerAction: "Keep production untouched.",
  },
  {
    area: "no Telegram side effects",
    status: "NOT APPROVED",
    detail: "No Telegram API calls, no messages, and no BotFather changes.",
    ownerAction: "Keep Telegram setup manual.",
  },
];

const whatThisPackageDoesNotDo: readonly AphroditeProductionBlockerChecklistRow[] = [
  {
    area: "secret configuration",
    status: "NOT APPROVED",
    detail: "This package does not configure env secrets, add real secrets, or commit .env.local.",
    ownerAction: "Configure secrets only outside Git.",
  },
  {
    area: "backup and restore",
    status: "NOT APPROVED",
    detail: "This package does not refresh backup itself and does not run restore.",
    ownerAction: "Perform backup and restore rehearsal manually with evidence.",
  },
  {
    area: "public URL and BotFather",
    status: "NOT APPROVED",
    detail: "This package does not configure public URL, open/change BotFather, or send Telegram messages.",
    ownerAction: "Keep these actions owner/manual only.",
  },
  {
    area: "launch approval",
    status: "NOT APPROVED",
    detail: "This package does not approve launch, add payment, or unlock VIP.",
    ownerAction: "Keep launch and monetization blocked.",
  },
];

const safetyNotes = [
  "productionBlockerClosureStatus = BLOCKED_MANUAL_CLOSURE_REQUIRED.",
  "ownerRealDeviceApproval = PENDING.",
  "databaseUrl = MISSING.",
  "telegramBotToken = MISSING.",
  "backupFreshness = STALE.",
  "restoreRehearsal = REQUIRED_NOT_COMPLETED.",
  "publicAppUrl = MISSING.",
  "botFatherMiniAppUrl = NOT_DONE.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
  "soft launch: NO.",
  "Do not mark blockers closed without evidence.",
] as const;

const remainingBlockers = [
  "owner real-device approval pending",
  "DATABASE_URL missing",
  "TELEGRAM_BOT_TOKEN missing",
  "backup older than 24h",
  "restore rehearsal not completed",
  "PUBLIC_APP_URL missing",
  "BotFather Mini App URL not done",
] as const;

export function getAphroditeProductionBlockerClosureChecklist(): AphroditeProductionBlockerClosureChecklistModel {
  return {
    packageNumber: 291,
    title: APHRODITE_PRODUCTION_BLOCKER_CLOSURE_CHECKLIST_TITLE,
    route: APHRODITE_PRODUCTION_BLOCKER_CLOSURE_CHECKLIST_ROUTE,
    currentMainHead: "4147b476163424f826cedd39172055ac60d51d8b",
    productionBlockerClosureStatus: "BLOCKED_MANUAL_CLOSURE_REQUIRED",
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    softLaunchApproved: false,
    allBlockers,
    closureCriteria,
    evidenceRequired,
    safeVerificationCommands,
    ownerManualActions,
    blockedUntil,
    launchGateSummary,
    safetyBoundaries,
    whatThisPackageDoesNotDo,
    nextPackageRecommendation: "Package 292 - Owner Manual Closure Execution Pack",
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
      blockersClosedWithoutEvidence: false,
      publicLaunchApproved: false,
      ownerManualReviewRequired: true,
      softLaunchApproved: false,
    },
  };
}
