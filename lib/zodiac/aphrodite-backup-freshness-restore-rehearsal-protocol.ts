/**
 * Package 280: Backup Freshness and Restore Rehearsal Protocol.
 *
 * Static manual protocol only. This package does not create backups, restore
 * data, connect to production DB, write data, change cron/workflows, launch
 * production, call Telegram, send messages, add payment, or unlock VIP.
 */

export type AphroditeBackupRestoreProtocolStatus =
  | "BLOCKED_STALE_BACKUP"
  | "MANUAL REQUIRED"
  | "DOCUMENTED"
  | "NOT VERIFIED"
  | "NOT APPROVED";

export type AphroditeBackupRestoreProtocolRow = {
  area: string;
  status: AphroditeBackupRestoreProtocolStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeBackupFreshnessRestoreRehearsalProtocolModel = {
  packageNumber: 280;
  title: string;
  route: "/dashboard/networks/zodiac/backup-freshness-restore-rehearsal-protocol";
  backupFreshnessStatus: "BLOCKED_STALE_BACKUP";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  backupFreshnessRules: readonly AphroditeBackupRestoreProtocolRow[];
  evidencePathRules: readonly AphroditeBackupRestoreProtocolRow[];
  restoreRehearsalProtocol: readonly AphroditeBackupRestoreProtocolRow[];
  restoreVerificationChecklist: readonly AphroditeBackupRestoreProtocolRow[];
  rollbackNotes: readonly AphroditeBackupRestoreProtocolRow[];
  forbiddenActions: readonly AphroditeBackupRestoreProtocolRow[];
  nextPackageRecommendation: "Package 281 - Public URL and Telegram Mini App Setup Plan";
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
    backupCreatedAutomatically: false;
    restoreExecutedAutomatically: false;
    externalAnalyticsAdded: false;
    cronWorkflowPublishChanged: false;
    secretsAdded: false;
    envLocalCommitted: false;
    publicLaunchApproved: false;
    ownerManualReviewRequired: true;
  };
};

export const APHRODITE_BACKUP_FRESHNESS_RESTORE_REHEARSAL_PROTOCOL_TITLE =
  "Backup Freshness and Restore Rehearsal Protocol";

export const APHRODITE_BACKUP_FRESHNESS_RESTORE_REHEARSAL_PROTOCOL_ROUTE =
  "/dashboard/networks/zodiac/backup-freshness-restore-rehearsal-protocol" as const;

const backupFreshnessRules: readonly AphroditeBackupRestoreProtocolRow[] = [
  {
    area: "backupFreshnessStatus = BLOCKED_STALE_BACKUP",
    status: "BLOCKED_STALE_BACKUP",
    detail: "backupFreshnessStatus = BLOCKED_STALE_BACKUP because the known latest backup is older than 24 hours.",
    ownerAction: "Keep launch blocked until owner captures fresh backup evidence.",
  },
  {
    area: "do not fabricate backup freshness",
    status: "DOCUMENTED",
    detail: "do not fabricate backup freshness; readiness may only record provider-backed timestamp evidence.",
    ownerAction: "Reject manual notes that do not include a real provider timestamp and owner reviewer.",
  },
  {
    area: "backup must be <24h before launch",
    status: "MANUAL REQUIRED",
    detail: "backup must be <24h before launch, measured from provider timestamp to launch decision time.",
    ownerAction: "Refresh or confirm a fresh backup manually before any launch approval package.",
  },
];

const evidencePathRules: readonly AphroditeBackupRestoreProtocolRow[] = [
  {
    area: "backup evidence path rules",
    status: "DOCUMENTED",
    detail: "backup evidence path rules require owner-controlled storage, masked screenshots, and no credentials.",
    ownerAction: "Record path, timestamp, retention window, project name, and reviewer without secret values.",
  },
  {
    area: "evidence immutability",
    status: "DOCUMENTED",
    detail: "Evidence must be append-only for review: do not overwrite old backup records without history.",
    ownerAction: "Store new evidence as a dated record under owner control.",
  },
  {
    area: "no secret exposure",
    status: "DOCUMENTED",
    detail: "Evidence may show backup metadata only, never connection strings, tokens, passwords, or row data.",
    ownerAction: "Redact or crop provider screens before saving.",
  },
];

const restoreRehearsalProtocol: readonly AphroditeBackupRestoreProtocolRow[] = [
  {
    area: "restore rehearsal required",
    status: "MANUAL REQUIRED",
    detail: "restore rehearsal required before production launch can be reconsidered.",
    ownerAction: "Prepare an isolated non-production target and run the provider-approved restore flow manually.",
  },
  {
    area: "safe restore target",
    status: "NOT VERIFIED",
    detail: "The rehearsal target must be non-production and must not overwrite production data.",
    ownerAction: "Confirm target identity before restore and record the target name in evidence.",
  },
  {
    area: "restore duration",
    status: "NOT VERIFIED",
    detail: "Restore rehearsal evidence must include start time, finish time, duration, and reviewer.",
    ownerAction: "Record timing after the manual rehearsal completes.",
  },
];

const restoreVerificationChecklist: readonly AphroditeBackupRestoreProtocolRow[] = [
  {
    area: "restore verification checklist",
    status: "NOT VERIFIED",
    detail: "restore verification checklist must confirm schema, expected tables, aggregate counts, and app compatibility.",
    ownerAction: "Use masked or aggregate checks only; do not expose private row data.",
  },
  {
    area: "application smoke",
    status: "NOT VERIFIED",
    detail: "A safe read-only smoke check should verify that restored data shape matches app expectations.",
    ownerAction: "Run read-only verification against the non-production restore target.",
  },
  {
    area: "review signoff",
    status: "MANUAL REQUIRED",
    detail: "Owner or delegated reviewer must record pass/fail, timestamp, and next action.",
    ownerAction: "Keep launch blocked if any restore check fails or remains unknown.",
  },
];

const rollbackNotes: readonly AphroditeBackupRestoreProtocolRow[] = [
  {
    area: "rollback note",
    status: "DOCUMENTED",
    detail: "rollback note must identify latest safe commit, backup timestamp, deployment target, and rollback owner.",
    ownerAction: "Record rollback data before any later launch gate can proceed.",
  },
  {
    area: "failed restore handling",
    status: "DOCUMENTED",
    detail: "A failed rehearsal keeps launch blocked and requires a new package report with root cause and remediation.",
    ownerAction: "Do not approve launch after a failed or incomplete rehearsal.",
  },
];

const forbiddenActions: readonly AphroditeBackupRestoreProtocolRow[] = [
  {
    area: "database side effects",
    status: "NOT APPROVED",
    detail: "No DB writes and no prod DB connect are allowed in this protocol package.",
    ownerAction: "Keep all restore work manual and outside production.",
  },
  {
    area: "automation side effects",
    status: "NOT APPROVED",
    detail: "No cron/workflow changes, no publish script changes, and no scheduled launch changes are allowed.",
    ownerAction: "Keep automation untouched.",
  },
  {
    area: "launch and integrations",
    status: "NOT APPROVED",
    detail: "No production launch, no Telegram API calls, no messages, no payment, and no VIP unlock.",
    ownerAction: "Keep this package protocol-only.",
  },
];

const safetyNotes = [
  "backupFreshnessStatus = BLOCKED_STALE_BACKUP.",
  "do not fabricate backup freshness.",
  "backup must be <24h before launch.",
  "restore rehearsal required.",
  "No DB writes.",
  "No prod DB connect.",
  "No cron/workflow changes.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
] as const;

const remainingBlockers = [
  "backup older than 24h",
  "restore rehearsal not verified",
  "DATABASE_URL missing",
  "TELEGRAM_BOT_TOKEN missing",
  "owner manual review still required",
] as const;

export function getAphroditeBackupFreshnessRestoreRehearsalProtocol(): AphroditeBackupFreshnessRestoreRehearsalProtocolModel {
  return {
    packageNumber: 280,
    title: APHRODITE_BACKUP_FRESHNESS_RESTORE_REHEARSAL_PROTOCOL_TITLE,
    route: APHRODITE_BACKUP_FRESHNESS_RESTORE_REHEARSAL_PROTOCOL_ROUTE,
    backupFreshnessStatus: "BLOCKED_STALE_BACKUP",
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    backupFreshnessRules,
    evidencePathRules,
    restoreRehearsalProtocol,
    restoreVerificationChecklist,
    rollbackNotes,
    forbiddenActions,
    nextPackageRecommendation: "Package 281 - Public URL and Telegram Mini App Setup Plan",
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
      backupCreatedAutomatically: false,
      restoreExecutedAutomatically: false,
      externalAnalyticsAdded: false,
      cronWorkflowPublishChanged: false,
      secretsAdded: false,
      envLocalCommitted: false,
      publicLaunchApproved: false,
      ownerManualReviewRequired: true,
    },
  };
}
