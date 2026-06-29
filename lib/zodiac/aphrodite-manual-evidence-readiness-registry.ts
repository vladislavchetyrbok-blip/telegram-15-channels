/**
 * Shared static registry for Packages 293-302.
 *
 * These packages are manual evidence/readiness records only. They do not close
 * blockers, launch production, call Telegram API, send messages, change
 * BotFather, add secrets, commit .env.local, connect production DB, write DB,
 * add payment, unlock VIP, or change cron/workflows.
 */

export type AphroditeManualEvidencePackageNumber = 293 | 294 | 295 | 296 | 297 | 298 | 299 | 300 | 301 | 302;

export type AphroditeManualEvidenceRow = {
  area: string;
  status: string;
  pageStatus?: string;
  detail: string;
  ownerAction: string;
};

export type AphroditeManualEvidencePackageDefinition = {
  packageNumber: AphroditeManualEvidencePackageNumber;
  title: string;
  route: string;
  currentMainHead: "f79d79e8c1cfc86129b176f33b35476c0f1f798f";
  statusFields: Record<string, string | boolean>;
  primaryStatusKey: string;
  statusRows: readonly AphroditeManualEvidenceRow[];
  evidenceRequired: readonly AphroditeManualEvidenceRow[];
  manualActions: readonly AphroditeManualEvidenceRow[];
  safetyBoundaries: readonly AphroditeManualEvidenceRow[];
  nextPackageRecommendation: string;
  safetyNotes: readonly string[];
  pageSafetyNotes?: readonly string[];
  remainingBlockers: readonly string[];
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  softLaunchStatusNo: "NO";
  blockersRemainOpen: true;
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
    cronWorkflowChanged: false;
    secretsAdded: false;
    envLocalCommitted: false;
    blockersClosedWithoutEvidence: false;
    publicLaunchApproved: false;
    ownerManualReviewRequired: true;
  };
};

const sharedRemainingBlockers = [
  "owner real-device approval pending",
  "DATABASE_URL missing",
  "TELEGRAM_BOT_TOKEN missing",
  "backup freshness stale",
  "restore rehearsal required not completed",
  "PUBLIC_APP_URL missing",
  "BotFather Mini App URL not done",
] as const;

const sharedSafetyFlags = {
  productionLaunchDone: false,
  telegramApiUsed: false,
  messagesSent: false,
  botFatherChanged: false,
  paymentAdded: false,
  vipUnlockAdded: false,
  databaseWriteAdded: false,
  productionDbConnected: false,
  externalAnalyticsAdded: false,
  cronWorkflowChanged: false,
  secretsAdded: false,
  envLocalCommitted: false,
  blockersClosedWithoutEvidence: false,
  publicLaunchApproved: false,
  ownerManualReviewRequired: true,
} as const;

function safetyNotes(...notes: readonly string[]) {
  return [
    ...notes,
    "publicLaunchApproved=false.",
    "ownerManualReviewRequired=true.",
    "softLaunchStatus=NO.",
    "All production blockers remain open unless real owner evidence exists.",
  ] as const;
}

function commonSafetyBoundaries(topic: string): readonly AphroditeManualEvidenceRow[] {
  return [
    {
      area: `${topic} blocker state`,
      status: "BLOCKED",
      detail: "This record does not close blockers without real owner evidence.",
      ownerAction: "Keep PENDING, MISSING, STALE, REQUIRED_NOT_COMPLETED, or NOT_DONE until evidence exists.",
    },
    {
      area: `${topic} production safety`,
      status: "NOT APPROVED",
      detail: "No production launch, no Telegram API, no messages, no BotFather automation, no secrets, no production DB connect, no DB write, no payment, no VIP unlock, no cron/workflow changes.",
      ownerAction: "Use this package as a manual readiness record only.",
    },
  ] as const;
}

const packageDefinitions: Record<AphroditeManualEvidencePackageNumber, AphroditeManualEvidencePackageDefinition> = {
  293: {
    packageNumber: 293,
    title: "Owner Real Device Evidence Intake",
    route: "/dashboard/networks/zodiac/owner-real-device-evidence-intake",
    currentMainHead: "f79d79e8c1cfc86129b176f33b35476c0f1f798f",
    statusFields: {
      ownerRealDeviceEvidenceStatus: "PENDING_OWNER_SCREENSHOTS",
      ownerRealDeviceApproval: false,
    },
    primaryStatusKey: "ownerRealDeviceEvidenceStatus",
    statusRows: [
      {
        area: "ownerRealDeviceEvidenceStatus",
        status: "PENDING_OWNER_SCREENSHOTS",
        detail: "ownerRealDeviceEvidenceStatus = PENDING_OWNER_SCREENSHOTS.",
        ownerAction: "Owner must provide real device screenshots before approval can be recorded.",
      },
      {
        area: "ownerRealDeviceApproval",
        status: "NOT APPROVED",
        detail: "ownerRealDeviceApproval = false.",
        ownerAction: "Do not approve without owner screenshots and review.",
      },
    ],
    evidenceRequired: [
      { area: "/miniapp", status: "MANUAL REQUIRED", detail: "Required screenshot: /miniapp.", ownerAction: "Capture real Telegram WebView evidence." },
      { area: "/compatibility", status: "MANUAL REQUIRED", detail: "Required screenshot: /compatibility.", ownerAction: "Capture compatibility flow evidence." },
      { area: "/birth-matrix", status: "MANUAL REQUIRED", detail: "Required screenshot: /birth-matrix.", ownerAction: "Capture birth matrix evidence." },
      { area: "/vip-preview", status: "MANUAL REQUIRED", detail: "Required screenshot: /vip-preview.", ownerAction: "Capture locked preview evidence without unlock." },
      { area: "/vip-compatibility-report", status: "MANUAL REQUIRED", detail: "Required screenshot: /vip-compatibility-report.", ownerAction: "Capture VIP report preview evidence without unlock." },
      { area: "/miniapp?startapp=mystic", status: "MANUAL REQUIRED", detail: "Required screenshot: /miniapp?startapp=mystic.", ownerAction: "Capture startapp mystic evidence." },
      { area: "bottom nav", status: "MANUAL REQUIRED", detail: "Required screenshot: bottom nav.", ownerAction: "Confirm bottom navigation is visible and usable." },
      { area: "date input", status: "MANUAL REQUIRED", detail: "Required screenshot: date input 01012000 -> 01.01.2000.", ownerAction: "Record formatted date evidence." },
      { area: "time input", status: "MANUAL REQUIRED", detail: "Required screenshot: time input.", ownerAction: "Record time input evidence." },
      { area: "city input", status: "MANUAL REQUIRED", detail: "Required screenshot: city input Днепр / Дніпро.", ownerAction: "Record city input evidence for both spellings." },
    ],
    manualActions: [
      { area: "owner evidence intake", status: "MANUAL REQUIRED", detail: "Owner screenshots must be collected from real Telegram WebView devices.", ownerAction: "Attach screenshot paths, device, viewport, reviewer, and timestamp." },
    ],
    safetyBoundaries: commonSafetyBoundaries("real-device evidence"),
    nextPackageRecommendation: "Package 294 - Redacted Env Presence Verification Gate",
    safetyNotes: safetyNotes("ownerRealDeviceEvidenceStatus = PENDING_OWNER_SCREENSHOTS.", "ownerRealDeviceApproval=false."),
    remainingBlockers: sharedRemainingBlockers,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    softLaunchStatusNo: "NO",
    blockersRemainOpen: true,
    safetyFlags: sharedSafetyFlags,
  },
  294: {
    packageNumber: 294,
    title: "Redacted Env Presence Verification Gate",
    route: "/dashboard/networks/zodiac/redacted-env-presence-verification-gate",
    currentMainHead: "f79d79e8c1cfc86129b176f33b35476c0f1f798f",
    statusFields: {
      databaseUrlPresence: "MISSING_OR_NOT_VERIFIED",
      telegramBotTokenPresence: "MISSING_OR_NOT_VERIFIED",
      secretsPrinted: false,
    },
    primaryStatusKey: "databaseUrlPresence",
    statusRows: [
      { area: "databaseUrlPresence", status: "MISSING_OR_NOT_VERIFIED", detail: "databaseUrlPresence = MISSING_OR_NOT_VERIFIED.", ownerAction: "Use redacted presence checker only." },
      { area: "telegramBotTokenPresence", status: "MISSING_OR_NOT_VERIFIED", detail: "telegramBotTokenPresence = MISSING_OR_NOT_VERIFIED.", ownerAction: "Use redacted presence checker only." },
      { area: "secretsPrinted", status: "REDACTED", detail: "secretsPrinted = false.", ownerAction: "Never print DATABASE_URL or TELEGRAM_BOT_TOKEN." },
    ],
    evidenceRequired: [
      { area: "redacted checker", status: "REDACTED", detail: "Use redacted presence checker only.", ownerAction: "Run node scripts/check-env-presence-redacted.mjs when owner env is configured." },
      { area: "DATABASE_URL", status: "MISSING", detail: "Never print DATABASE_URL.", ownerAction: "Configure env only outside Git." },
      { area: "TELEGRAM_BOT_TOKEN", status: "MISSING", detail: "Never print TELEGRAM_BOT_TOKEN.", ownerAction: "Configure env only outside Git." },
      { area: "chat hygiene", status: "REDACTED", detail: "Never paste secrets into chat.", ownerAction: "Record present/missing labels only." },
    ],
    manualActions: [
      { area: "env setup", status: "MANUAL REQUIRED", detail: "Configure env only outside Git.", ownerAction: "Owner uses hosting/provider env panel or owner-local machine." },
    ],
    safetyBoundaries: commonSafetyBoundaries("redacted env"),
    nextPackageRecommendation: "Package 295 - Backup Refresh Evidence Intake",
    safetyNotes: safetyNotes("databaseUrlPresence = MISSING_OR_NOT_VERIFIED.", "telegramBotTokenPresence = MISSING_OR_NOT_VERIFIED.", "secretsPrinted=false."),
    remainingBlockers: sharedRemainingBlockers,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    softLaunchStatusNo: "NO",
    blockersRemainOpen: true,
    safetyFlags: sharedSafetyFlags,
  },
  295: {
    packageNumber: 295,
    title: "Backup Refresh Evidence Intake",
    route: "/dashboard/networks/zodiac/backup-refresh-evidence-intake",
    currentMainHead: "f79d79e8c1cfc86129b176f33b35476c0f1f798f",
    statusFields: {
      backupRefreshEvidenceStatus: "PENDING_FRESH_BACKUP_EVIDENCE",
      backupFreshness: "STALE_OR_UNVERIFIED",
      backupMarkedFresh: false,
    },
    primaryStatusKey: "backupRefreshEvidenceStatus",
    statusRows: [
      { area: "backupRefreshEvidenceStatus", status: "PENDING_FRESH_BACKUP_EVIDENCE", detail: "backupRefreshEvidenceStatus = PENDING_FRESH_BACKUP_EVIDENCE.", ownerAction: "Owner/manual backup evidence is required." },
      { area: "backupFreshness", status: "STALE_OR_UNVERIFIED", detail: "backupFreshness = STALE_OR_UNVERIFIED.", ownerAction: "Backup must be <24h before launch." },
      { area: "backupMarkedFresh", status: "NOT APPROVED", detail: "backupMarkedFresh = false.", ownerAction: "Do not create fake backup evidence." },
    ],
    evidenceRequired: [
      { area: "freshness window", status: "STALE", detail: "Backup must be <24h.", ownerAction: "Record actual timestamp and age." },
      { area: "latest known backup", status: "STALE", detail: "Latest known backup is stale.", ownerAction: "Refresh backup manually before closure." },
      { area: "production DB", status: "NOT APPROVED", detail: "Do not connect production DB.", ownerAction: "Use manual backup process outside this package." },
      { area: "manual backup", status: "MANUAL REQUIRED", detail: "Owner/manual backup required.", ownerAction: "Attach evidence path and reviewer." },
    ],
    manualActions: [
      { area: "backup refresh", status: "MANUAL REQUIRED", detail: "Owner must provide fresh backup evidence.", ownerAction: "Do not mark fresh until evidence proves <24h." },
    ],
    safetyBoundaries: commonSafetyBoundaries("backup evidence"),
    nextPackageRecommendation: "Package 296 - Restore Rehearsal Evidence Intake",
    safetyNotes: safetyNotes("backupRefreshEvidenceStatus = PENDING_FRESH_BACKUP_EVIDENCE.", "backupFreshness = STALE_OR_UNVERIFIED.", "backupMarkedFresh=false."),
    remainingBlockers: sharedRemainingBlockers,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    softLaunchStatusNo: "NO",
    blockersRemainOpen: true,
    safetyFlags: sharedSafetyFlags,
  },
  296: {
    packageNumber: 296,
    title: "Restore Rehearsal Evidence Intake",
    route: "/dashboard/networks/zodiac/restore-rehearsal-evidence-intake",
    currentMainHead: "f79d79e8c1cfc86129b176f33b35476c0f1f798f",
    statusFields: {
      restoreRehearsalStatus: "REQUIRED_NOT_COMPLETED",
      restoreEvidenceStatus: "PENDING_MANUAL_REHEARSAL",
    },
    primaryStatusKey: "restoreRehearsalStatus",
    statusRows: [
      { area: "restoreRehearsalStatus", status: "REQUIRED_NOT_COMPLETED", detail: "restoreRehearsalStatus = REQUIRED_NOT_COMPLETED.", ownerAction: "Manual/safe restore rehearsal is required." },
      { area: "restoreEvidenceStatus", status: "PENDING_MANUAL_REHEARSAL", detail: "restoreEvidenceStatus = PENDING_MANUAL_REHEARSAL.", ownerAction: "Evidence required before launch." },
    ],
    evidenceRequired: [
      { area: "manual rehearsal", status: "MANUAL REQUIRED", detail: "Restore rehearsal must be manual/safe.", ownerAction: "Use non-production target." },
      { area: "production DB writes", status: "NOT APPROVED", detail: "No production DB writes.", ownerAction: "Do not mutate production." },
      { area: "production DB mutation", status: "NOT APPROVED", detail: "No production DB mutation.", ownerAction: "Record rehearsal evidence only." },
      { area: "launch evidence", status: "BLOCKED", detail: "Evidence required before launch.", ownerAction: "Keep launch blocked until evidence exists." },
    ],
    manualActions: [
      { area: "restore rehearsal", status: "MANUAL REQUIRED", detail: "Owner must run and document safe restore rehearsal.", ownerAction: "Record target, timestamps, aggregate checks, reviewer, and result." },
    ],
    safetyBoundaries: commonSafetyBoundaries("restore rehearsal"),
    nextPackageRecommendation: "Package 297 - Public URL Evidence Intake",
    safetyNotes: safetyNotes("restoreRehearsalStatus = REQUIRED_NOT_COMPLETED.", "restoreEvidenceStatus = PENDING_MANUAL_REHEARSAL."),
    remainingBlockers: sharedRemainingBlockers,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    softLaunchStatusNo: "NO",
    blockersRemainOpen: true,
    safetyFlags: sharedSafetyFlags,
  },
  297: {
    packageNumber: 297,
    title: "Public URL Evidence Intake",
    route: "/dashboard/networks/zodiac/public-url-evidence-intake",
    currentMainHead: "f79d79e8c1cfc86129b176f33b35476c0f1f798f",
    statusFields: {
      publicUrlEvidenceStatus: "PENDING_PUBLIC_URL",
      publicUrlApproved: false,
      publicUrlStatus: "MISSING_OR_NOT_VERIFIED",
    },
    primaryStatusKey: "publicUrlEvidenceStatus",
    statusRows: [
      { area: "publicUrlEvidenceStatus", status: "PENDING_PUBLIC_URL", detail: "publicUrlEvidenceStatus = PENDING_PUBLIC_URL.", ownerAction: "PUBLIC_APP_URL required." },
      { area: "publicUrlApproved", status: "NOT APPROVED", detail: "publicUrlApproved = false.", ownerAction: "Do not approve without owner evidence." },
      { area: "publicUrlStatus", status: "MISSING_OR_NOT_VERIFIED", detail: "publicUrlStatus = MISSING_OR_NOT_VERIFIED.", ownerAction: "HTTPS and public route checks required." },
    ],
    evidenceRequired: [
      { area: "PUBLIC_APP_URL", status: "MISSING", detail: "PUBLIC_APP_URL required.", ownerAction: "Configure outside Git only." },
      { area: "HTTPS", status: "MANUAL REQUIRED", detail: "HTTPS required.", ownerAction: "Verify HTTPS public host." },
      { area: "public routes", status: "MANUAL REQUIRED", detail: "Public route checks required.", ownerAction: "Verify Mini App public entry points." },
      { area: "shell isolation", status: "MANUAL REQUIRED", detail: "No dashboard/admin shell on public routes.", ownerAction: "Record screenshots or route evidence." },
    ],
    manualActions: [
      { area: "public URL approval", status: "MANUAL REQUIRED", detail: "Do not approve without owner evidence.", ownerAction: "Owner must review route evidence before closure." },
    ],
    safetyBoundaries: commonSafetyBoundaries("public URL"),
    nextPackageRecommendation: "Package 298 - BotFather Manual Setup Evidence Intake",
    safetyNotes: safetyNotes("publicUrlEvidenceStatus = PENDING_PUBLIC_URL.", "publicUrlApproved=false.", "publicUrlStatus = MISSING_OR_NOT_VERIFIED."),
    remainingBlockers: sharedRemainingBlockers,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    softLaunchStatusNo: "NO",
    blockersRemainOpen: true,
    safetyFlags: sharedSafetyFlags,
  },
  298: {
    packageNumber: 298,
    title: "BotFather Manual Setup Evidence Intake",
    route: "/dashboard/networks/zodiac/botfather-manual-setup-evidence-intake",
    currentMainHead: "f79d79e8c1cfc86129b176f33b35476c0f1f798f",
    statusFields: {
      botFatherSetupStatus: "NOT_DONE",
      telegramMiniAppUrlStatus: "MANUAL_BOTFATHER_SETUP_NOT_DONE",
      botFatherSetupDone: false,
    },
    primaryStatusKey: "botFatherSetupStatus",
    statusRows: [
      { area: "botFatherSetupStatus", status: "NOT_DONE", detail: "botFatherSetupStatus = NOT_DONE.", ownerAction: "BotFather setup is manual only." },
      { area: "telegramMiniAppUrlStatus", status: "MANUAL_BOTFATHER_SETUP_NOT_DONE", detail: "telegramMiniAppUrlStatus = MANUAL_BOTFATHER_SETUP_NOT_DONE.", ownerAction: "Setup only after owner approval and public URL verification." },
      { area: "botFatherSetupDone", status: "NOT APPROVED", detail: "botFatherSetupDone = false.", ownerAction: "Do not mark done without owner manual confirmation." },
    ],
    evidenceRequired: [
      { area: "manual only", status: "MANUAL REQUIRED", detail: "BotFather setup is manual only.", ownerAction: "Owner changes BotFather after approval." },
      { area: "Telegram API", status: "NOT APPROVED", detail: "No Telegram API.", ownerAction: "Do not call API or automate setup." },
      { area: "BotFather automation", status: "NOT APPROVED", detail: "No BotFather automation.", ownerAction: "Do not script BotFather changes." },
      { area: "messages", status: "NOT APPROVED", detail: "No messages.", ownerAction: "Do not send Telegram messages." },
      { area: "setup order", status: "MANUAL REQUIRED", detail: "Setup only after owner approval and public URL verification.", ownerAction: "Record owner confirmation only." },
    ],
    manualActions: [
      { area: "BotFather evidence", status: "MANUAL REQUIRED", detail: "Owner must confirm manual BotFather Mini App URL setup.", ownerAction: "Attach date, public URL reference, reviewer, and confirmation." },
    ],
    safetyBoundaries: commonSafetyBoundaries("BotFather evidence"),
    nextPackageRecommendation: "Package 299 - Final Production Safety Recheck Gate",
    safetyNotes: safetyNotes("botFatherSetupStatus = NOT_DONE.", "telegramMiniAppUrlStatus = MANUAL_BOTFATHER_SETUP_NOT_DONE.", "botFatherSetupDone=false."),
    remainingBlockers: sharedRemainingBlockers,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    softLaunchStatusNo: "NO",
    blockersRemainOpen: true,
    safetyFlags: sharedSafetyFlags,
  },
  299: {
    packageNumber: 299,
    title: "Final Production Safety Recheck Gate",
    route: "/dashboard/networks/zodiac/final-production-safety-recheck-gate",
    currentMainHead: "f79d79e8c1cfc86129b176f33b35476c0f1f798f",
    statusFields: {
      finalProductionSafetyStatus: "BLOCKED_EXPECTED_MANUAL_BLOCKERS",
      readyForLaunch: false,
    },
    primaryStatusKey: "finalProductionSafetyStatus",
    statusRows: [
      { area: "finalProductionSafetyStatus", status: "BLOCKED_EXPECTED_MANUAL_BLOCKERS", detail: "finalProductionSafetyStatus = BLOCKED_EXPECTED_MANUAL_BLOCKERS.", ownerAction: "production:safety:check expected to fail until env + backup are fixed." },
      { area: "readyForLaunch", status: "NOT APPROVED", detail: "readyForLaunch = false.", ownerAction: "Do not launch while safety check is red." },
    ],
    evidenceRequired: [
      { area: "safety check", status: "BLOCKED", detail: "production:safety:check expected to fail until env + backup are fixed.", ownerAction: "Re-run only after manual blockers are resolved." },
      { area: "public launch", status: "NOT APPROVED", detail: "publicLaunchApproved=false.", ownerAction: "Keep launch blocked." },
      { area: "owner review", status: "OWNER REVIEW REQUIRED", detail: "ownerManualReviewRequired=true.", ownerAction: "Owner review remains required." },
    ],
    manualActions: [
      { area: "safety recheck", status: "MANUAL REQUIRED", detail: "Run final production safety after manual evidence exists.", ownerAction: "Stop if any unexpected blocker appears." },
    ],
    safetyBoundaries: commonSafetyBoundaries("final safety"),
    nextPackageRecommendation: "Package 300 - Soft Launch Candidate Go No-Go Record",
    safetyNotes: safetyNotes("finalProductionSafetyStatus = BLOCKED_EXPECTED_MANUAL_BLOCKERS.", "readyForLaunch=false."),
    remainingBlockers: sharedRemainingBlockers,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    softLaunchStatusNo: "NO",
    blockersRemainOpen: true,
    safetyFlags: sharedSafetyFlags,
  },
  300: {
    packageNumber: 300,
    title: "Soft Launch Candidate Go No-Go Record",
    route: "/dashboard/networks/zodiac/soft-launch-candidate-go-no-go-record",
    currentMainHead: "f79d79e8c1cfc86129b176f33b35476c0f1f798f",
    statusFields: {
      softLaunchDecision: "NO_GO",
      softLaunchStatus: "NOT_APPROVED",
      ownerGoNoGo: "NO_GO_UNTIL_BLOCKERS_CLOSED",
    },
    primaryStatusKey: "softLaunchDecision",
    statusRows: [
      { area: "softLaunchDecision", status: "NO_GO", detail: "softLaunchDecision = NO_GO.", ownerAction: "Current state is NO-GO." },
      { area: "softLaunchStatus", status: "NOT_APPROVED", detail: "softLaunchStatus = NOT_APPROVED.", ownerAction: "No launch performed." },
      { area: "ownerGoNoGo", status: "NO_GO_UNTIL_BLOCKERS_CLOSED", detail: "ownerGoNoGo = NO_GO_UNTIL_BLOCKERS_CLOSED.", ownerAction: "Future GO requires all blockers closed with evidence." },
    ],
    evidenceRequired: [
      { area: "current state", status: "NOT APPROVED", detail: "Current state is NO-GO.", ownerAction: "Keep soft launch blocked." },
      { area: "blocker list", status: "BLOCKED", detail: "Blocker list remains active.", ownerAction: "Close blockers only with real evidence." },
      { area: "future GO criteria", status: "MANUAL REQUIRED", detail: "Exact criteria for future GO: owner approval, env present, fresh backup, restore rehearsal, public URL, BotFather setup, final safety pass.", ownerAction: "Prepare later owner decision only after evidence exists." },
      { area: "launch execution", status: "NOT APPROVED", detail: "No launch performed.", ownerAction: "Do not start soft launch." },
    ],
    manualActions: [
      { area: "owner decision", status: "OWNER REVIEW REQUIRED", detail: "Owner go/no-go remains NO-GO until blockers close.", ownerAction: "Record owner decision in a later package." },
    ],
    safetyBoundaries: commonSafetyBoundaries("soft launch decision"),
    nextPackageRecommendation: "Package 301 - Post-Blocker Closure Final Launch Runbook Draft",
    safetyNotes: safetyNotes("softLaunchDecision = NO_GO.", "softLaunchStatus = NOT_APPROVED.", "ownerGoNoGo = NO_GO_UNTIL_BLOCKERS_CLOSED."),
    remainingBlockers: sharedRemainingBlockers,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    softLaunchStatusNo: "NO",
    blockersRemainOpen: true,
    safetyFlags: sharedSafetyFlags,
  },
  301: {
    packageNumber: 301,
    title: "Post-Blocker Closure Final Launch Runbook Draft",
    route: "/dashboard/networks/zodiac/post-blocker-closure-final-launch-runbook-draft",
    currentMainHead: "f79d79e8c1cfc86129b176f33b35476c0f1f798f",
    statusFields: {
      finalLaunchRunbookStatus: "DRAFT_BLOCKED_UNTIL_MANUAL_GATES_CLOSED",
    },
    primaryStatusKey: "finalLaunchRunbookStatus",
    statusRows: [
      {
        area: "finalLaunchRunbookStatus",
        status: "DRAFT_BLOCKED_UNTIL_MANUAL_GATES_CLOSED",
        pageStatus: "BLOCKED_UNTIL_MANUAL_GATES_CLOSED",
        detail: "finalLaunchRunbookStatus = DRAFT_BLOCKED_UNTIL_MANUAL_GATES_CLOSED.",
        ownerAction: "Runbook is only for after blockers are closed.",
      },
    ],
    evidenceRequired: [
      { area: "after blockers", status: "BLOCKED", detail: "Runbook only for after blockers are closed.", ownerAction: "Do not use for launch now." },
      { area: "final checks", status: "DOCUMENTED", detail: "Order of final checks: owner evidence, env, backup, restore, public routes, BotFather, final safety.", ownerAction: "Follow only after manual gates close." },
      { area: "rollback plan", status: "DOCUMENTED", detail: "Rollback plan is documented for future use.", ownerAction: "Do not execute rollback from this package." },
      { area: "owner go/no-go", status: "OWNER REVIEW REQUIRED", detail: "Owner go/no-go required after closure evidence.", ownerAction: "No launch now." },
    ],
    manualActions: [
      { area: "runbook preparation", status: "DOCUMENTED", detail: "Prepare final launch runbook draft for later owner review.", ownerAction: "Keep this as planning material only." },
    ],
    safetyBoundaries: commonSafetyBoundaries("final runbook"),
    nextPackageRecommendation: "Package 302 - Manual Evidence Readiness Summary",
    safetyNotes: safetyNotes("finalLaunchRunbookStatus = DRAFT_BLOCKED_UNTIL_MANUAL_GATES_CLOSED."),
    pageSafetyNotes: safetyNotes("finalLaunchRunbookStatus is blocked until manual gates close."),
    remainingBlockers: sharedRemainingBlockers,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    softLaunchStatusNo: "NO",
    blockersRemainOpen: true,
    safetyFlags: sharedSafetyFlags,
  },
  302: {
    packageNumber: 302,
    title: "Manual Evidence Readiness Summary",
    route: "/dashboard/networks/zodiac/manual-evidence-readiness-summary",
    currentMainHead: "f79d79e8c1cfc86129b176f33b35476c0f1f798f",
    statusFields: {
      manualEvidenceReadinessStatus: "WAITING_FOR_OWNER_AND_ENV_EVIDENCE",
      readyForProductionLaunch: false,
    },
    primaryStatusKey: "manualEvidenceReadinessStatus",
    statusRows: [
      { area: "manualEvidenceReadinessStatus", status: "WAITING_FOR_OWNER_AND_ENV_EVIDENCE", detail: "manualEvidenceReadinessStatus = WAITING_FOR_OWNER_AND_ENV_EVIDENCE.", ownerAction: "Packages 293-302 completed, but owner/env evidence is still required." },
      { area: "readyForProductionLaunch", status: "NOT APPROVED", detail: "readyForProductionLaunch = false.", ownerAction: "Ready for production launch: No." },
    ],
    evidenceRequired: [
      { area: "packages 293-302", status: "DOCUMENTED", detail: "Packages 293-302 completed.", ownerAction: "Use this summary for audit." },
      { area: "blockers", status: "BLOCKED", detail: "Blockers still open.", ownerAction: "Close only after real evidence." },
      { area: "evidence", status: "MANUAL REQUIRED", detail: "Evidence still required.", ownerAction: "Owner must provide real device, env, backup, restore, public URL, and BotFather evidence." },
      { area: "next real owner actions", status: "MANUAL REQUIRED", detail: "Next real owner actions: provide screenshots, configure env outside Git, refresh backup, rehearse restore, verify public URL, manually set BotFather.", ownerAction: "Prepare Package 303 after manual inputs." },
    ],
    manualActions: [
      { area: "next recommended package", status: "DOCUMENTED", detail: "Package 303 - Owner Evidence Review After Manual Inputs.", ownerAction: "Run only after owner/manual evidence arrives." },
    ],
    safetyBoundaries: commonSafetyBoundaries("manual evidence summary"),
    nextPackageRecommendation: "Package 303 - Owner Evidence Review After Manual Inputs",
    safetyNotes: safetyNotes("manualEvidenceReadinessStatus = WAITING_FOR_OWNER_AND_ENV_EVIDENCE.", "readyForProductionLaunch=false."),
    remainingBlockers: sharedRemainingBlockers,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    softLaunchStatusNo: "NO",
    blockersRemainOpen: true,
    safetyFlags: sharedSafetyFlags,
  },
};

export function getAphroditeManualEvidencePackage(packageNumber: AphroditeManualEvidencePackageNumber) {
  const definition = packageDefinitions[packageNumber];
  return {
    ...definition,
    ...definition.statusFields,
  };
}
