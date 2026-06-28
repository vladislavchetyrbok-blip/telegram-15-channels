/**
 * Package 279: Manual Environment Setup Execution Checklist.
 *
 * Static manual checklist only. This package does not read, print, validate,
 * store, or commit real secrets. It does not connect to production DB, call
 * Telegram, send messages, launch production, enable payment, or unlock VIP.
 */

export type AphroditeManualEnvSetupStatus =
  | "MANUAL REQUIRED"
  | "DOCUMENTED"
  | "REDACTED"
  | "BLOCKED"
  | "NOT APPROVED";

export type AphroditeManualEnvSetupRow = {
  area: string;
  status: AphroditeManualEnvSetupStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeManualEnvSetupExecutionChecklistModel = {
  packageNumber: 279;
  title: string;
  route: "/dashboard/networks/zodiac/manual-env-setup-execution-checklist";
  manualEnvSetupStatus: "MANUAL REQUIRED";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  databaseUrlChecklist: readonly AphroditeManualEnvSetupRow[];
  telegramTokenChecklist: readonly AphroditeManualEnvSetupRow[];
  verificationChecklist: readonly AphroditeManualEnvSetupRow[];
  redactionRules: readonly AphroditeManualEnvSetupRow[];
  safetyBoundaries: readonly AphroditeManualEnvSetupRow[];
  forbiddenActions: readonly AphroditeManualEnvSetupRow[];
  nextPackageRecommendation: "Package 280 - Backup Freshness and Restore Rehearsal Protocol";
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

export const APHRODITE_MANUAL_ENV_SETUP_EXECUTION_CHECKLIST_TITLE =
  "Manual Env Setup Execution Checklist";

export const APHRODITE_MANUAL_ENV_SETUP_EXECUTION_CHECKLIST_ROUTE =
  "/dashboard/networks/zodiac/manual-env-setup-execution-checklist" as const;

const databaseUrlChecklist: readonly AphroditeManualEnvSetupRow[] = [
  {
    area: "DATABASE_URL destination",
    status: "MANUAL REQUIRED",
    detail: "Put DATABASE_URL in the hosting provider env panel or deployment provider env panel only.",
    ownerAction: "Configure the value manually outside Git and confirm only masked presence.",
  },
  {
    area: "local .env.local only for local testing",
    status: "DOCUMENTED",
    detail: "local .env.local only for local testing is allowed when the owner needs local manual verification.",
    ownerAction: ".env.local must stay private, ignored, untracked, and never Git.",
  },
  {
    area: ".env.example safe placeholders only",
    status: "DOCUMENTED",
    detail: ".env.example safe placeholders only may name DATABASE_URL but must not contain a real connection string.",
    ownerAction: "Use placeholder text such as DATABASE_URL=replace-with-provider-value.",
  },
];

const telegramTokenChecklist: readonly AphroditeManualEnvSetupRow[] = [
  {
    area: "TELEGRAM_BOT_TOKEN destination",
    status: "MANUAL REQUIRED",
    detail: "Put TELEGRAM_BOT_TOKEN in the hosting provider env panel or deployment provider env panel only.",
    ownerAction: "Configure the token manually outside Git and never paste the value into code, docs, chat, screenshots, or logs.",
  },
  {
    area: "Telegram API boundary",
    status: "NOT APPROVED",
    detail: "This checklist permits env placement only; no Telegram API calls and no message sending are allowed.",
    ownerAction: "Verify presence without using the token or contacting Telegram.",
  },
];

const verificationChecklist: readonly AphroditeManualEnvSetupRow[] = [
  {
    area: "masked presence check",
    status: "REDACTED",
    detail: "Verify env presence without printing secret values by reporting configured/not configured only.",
    ownerAction: "Use provider UI masked indicators or a safe local script that prints boolean presence only.",
  },
  {
    area: "no production connection",
    status: "BLOCKED",
    detail: "no production connection is performed by this package, even after variables are configured manually.",
    ownerAction: "Do not test production DB connectivity inside this package.",
  },
  {
    area: "git clean check",
    status: "DOCUMENTED",
    detail: "Before commit or push, git status must not include .env.local or any secret file.",
    ownerAction: "Run git status and git ls-files .env.local before pushing readiness changes.",
  },
];

const redactionRules: readonly AphroditeManualEnvSetupRow[] = [
  {
    area: "redaction rules",
    status: "REDACTED",
    detail: "redaction rules require variable names and configured/not configured status only; secret values are never printed.",
    ownerAction: "Replace any exposed credential with [REDACTED] and rotate it immediately.",
  },
  {
    area: "screenshots and logs",
    status: "REDACTED",
    detail: "Screenshots, logs, and package reports may show masked UI state only.",
    ownerAction: "Crop or blur provider UI before storing owner evidence.",
  },
  {
    area: "review language",
    status: "DOCUMENTED",
    detail: "Use no real secrets, no production connection, and no Telegram API calls as explicit review labels.",
    ownerAction: "Reject any evidence that contains a credential value.",
  },
];

const safetyBoundaries: readonly AphroditeManualEnvSetupRow[] = [
  {
    area: "launch gate",
    status: "NOT APPROVED",
    detail: "publicLaunchApproved=false remains mandatory after this checklist.",
    ownerAction: "Do not flip launch flags during manual env setup.",
  },
  {
    area: "owner gate",
    status: "MANUAL REQUIRED",
    detail: "ownerManualReviewRequired=true remains mandatory until a separate owner approval package records the decision.",
    ownerAction: "Keep owner review open after env placement.",
  },
];

const forbiddenActions: readonly AphroditeManualEnvSetupRow[] = [
  {
    area: "secrets in repository",
    status: "NOT APPROVED",
    detail: "Never Git: no real secrets, no .env.local, and no provider export files may be committed.",
    ownerAction: "Remove and rotate any exposed value before continuing.",
  },
  {
    area: "runtime side effects",
    status: "NOT APPROVED",
    detail: "No production launch, no production DB connection, no DB writes, no Telegram API calls, and no messages.",
    ownerAction: "Keep this package documentation and QA only.",
  },
  {
    area: "monetization",
    status: "NOT APPROVED",
    detail: "No payment, invoice, entitlement grant, or VIP unlock is added.",
    ownerAction: "Keep VIP surfaces preview-only.",
  },
];

const safetyNotes = [
  "DATABASE_URL placement is documented but no value is committed.",
  "TELEGRAM_BOT_TOKEN placement is documented but no value is committed.",
  "Verification is configured/not configured only.",
  "No production connection is performed.",
  "No Telegram API calls are made.",
  "No messages are sent.",
  "No .env.local is committed.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
] as const;

const remainingBlockers = [
  "DATABASE_URL missing until owner configures it outside Git",
  "TELEGRAM_BOT_TOKEN missing until owner configures it outside Git",
  "backup older than 24h",
  "restore rehearsal not verified",
  "owner manual review still required",
] as const;

export function getAphroditeManualEnvSetupExecutionChecklist(): AphroditeManualEnvSetupExecutionChecklistModel {
  return {
    packageNumber: 279,
    title: APHRODITE_MANUAL_ENV_SETUP_EXECUTION_CHECKLIST_TITLE,
    route: APHRODITE_MANUAL_ENV_SETUP_EXECUTION_CHECKLIST_ROUTE,
    manualEnvSetupStatus: "MANUAL REQUIRED",
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    databaseUrlChecklist,
    telegramTokenChecklist,
    verificationChecklist,
    redactionRules,
    safetyBoundaries,
    forbiddenActions,
    nextPackageRecommendation: "Package 280 - Backup Freshness and Restore Rehearsal Protocol",
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
