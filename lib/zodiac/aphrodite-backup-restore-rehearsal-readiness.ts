/**
 * Package 220: Backup & Restore Rehearsal Readiness.
 *
 * Static readiness/checklist only. This model does not read secrets, connect to
 * production databases, create backups, execute restores, write data, use
 * Telegram API, send messages, change BotFather, alter active CTA logic,
 * change publish scripts/workflows, enable payments, or unlock VIP.
 */

export type AphroditeBackupRestoreStatus =
  | "PASS"
  | "BLOCKED"
  | "MANUAL REQUIRED"
  | "NOT VERIFIED"
  | "OWNER REVIEW REQUIRED";

export type AphroditeBackupRestoreSection = {
  id: string;
  title: string;
  status: AphroditeBackupRestoreStatus;
  summary: string;
  checklist: readonly string[];
};

export type AphroditeBackupRestoreRehearsalReadinessModel = {
  packageNumber: 220;
  title: string;
  route: "/dashboard/networks/zodiac/backup-restore-rehearsal-readiness";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  requiredMessages: readonly string[];
  statuses: readonly AphroditeBackupRestoreStatus[];
  sections: readonly AphroditeBackupRestoreSection[];
  remainingBackupBlockers: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    productionDbConnectionMade: false;
    productionDbWriteAdded: false;
    realSecretsRead: false;
    backupCreatedAutomatically: false;
    restoreExecutedAutomatically: false;
    dataDeletedOrOverwritten: false;
    telegramApiUsed: false;
    messagesSent: false;
    botFatherChanged: false;
    activeCtaLogicChanged: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    workflowChanged: false;
    publishScriptsChanged: false;
  };
};

export const APHRODITE_BACKUP_RESTORE_REHEARSAL_READINESS_TITLE =
  "Backup & Restore Rehearsal Readiness";

export const APHRODITE_BACKUP_RESTORE_REHEARSAL_READINESS_ROUTE =
  "/dashboard/networks/zodiac/backup-restore-rehearsal-readiness" as const;

export const APHRODITE_BACKUP_RESTORE_STATUSES = [
  "PASS",
  "BLOCKED",
  "MANUAL REQUIRED",
  "NOT VERIFIED",
  "OWNER REVIEW REQUIRED",
] as const;

export const APHRODITE_BACKUP_RESTORE_REQUIRED_MESSAGES = [
  "backup older than 24h is a launch blocker.",
  "backup must be verified manually before launch.",
  "no production DB connection was made.",
  "no backup was created automatically.",
  "no restore was executed automatically.",
] as const;

const sections: readonly AphroditeBackupRestoreSection[] = [
  {
    id: "backup-freshness-status",
    title: "Backup freshness status",
    status: "BLOCKED",
    summary: "Backup freshness remains a manual launch blocker until the owner verifies a recent backup.",
    checklist: [
      "Confirm the latest production backup timestamp manually in the hosting/database console.",
      "Record the backup timestamp and the reviewer name in the launch evidence pack.",
      "Run the production safety check again after the backup is verified.",
    ],
  },
  {
    id: "last-backup-age-classification",
    title: "Last backup age classification",
    status: "MANUAL REQUIRED",
    summary: "A backup older than 24h is classified as a launch blocker, not as a code failure.",
    checklist: [
      "Classify backup age under 24h as acceptable only after manual owner verification.",
      "Classify backup age over 24h as BLOCKED until a fresh backup is confirmed.",
      "Do not infer freshness from source code or local environment files.",
    ],
  },
  {
    id: "manual-backup-verification-checklist",
    title: "Manual backup verification checklist",
    status: "OWNER REVIEW REQUIRED",
    summary: "The owner must verify backup existence, timestamp, scope, and restore target before launch.",
    checklist: [
      "Verify the backup includes all production data needed for Aphrodite/Zodiac rollback.",
      "Verify backup storage location, retention window, and access permissions.",
      "Confirm no automated backup was created by this dashboard readiness page.",
    ],
  },
  {
    id: "restore-rehearsal-checklist",
    title: "Restore rehearsal checklist",
    status: "NOT VERIFIED",
    summary: "Restore rehearsal must be performed manually in a safe non-production target.",
    checklist: [
      "Choose a safe rehearsal target that cannot overwrite production data.",
      "Document restore steps, expected duration, validation checks, and rollback owner.",
      "Confirm no restore was executed automatically by Package 220.",
    ],
  },
  {
    id: "rollback-dependency-list",
    title: "Rollback dependency list",
    status: "MANUAL REQUIRED",
    summary: "Rollback readiness depends on verified backup freshness, restore rehearsal, owner approval, and live deployment rollback access.",
    checklist: [
      "Confirm access to the deployment rollback controls.",
      "Confirm backup restore owner, production env owner, and release owner are known.",
      "Confirm rollback evidence is linked from the public launch go/no-go review.",
    ],
  },
  {
    id: "production-launch-blocker-status",
    title: "Production launch blocker status",
    status: "BLOCKED",
    summary: "Launch remains blocked while backup freshness is missing or older than 24h.",
    checklist: [
      "Keep publicLaunchApproved=false until backup freshness is verified.",
      "Keep ownerManualReviewRequired=true until the owner approves launch readiness.",
      "Treat missing or stale backup evidence as a manual production blocker.",
    ],
  },
  {
    id: "owner-manual-review",
    title: "Owner manual review",
    status: "OWNER REVIEW REQUIRED",
    summary: "Owner review is required before launch, restore rehearsal, and rollback approval can be considered complete.",
    checklist: [
      "Owner reviews backup freshness evidence.",
      "Owner reviews restore rehearsal evidence.",
      "Owner confirms launch remains frozen until every manual blocker is cleared.",
    ],
  },
  {
    id: "no-automatic-db-access-guarantee",
    title: "No automatic DB access guarantee",
    status: "PASS",
    summary: "Package 220 is static readiness reporting and makes no production DB connection.",
    checklist: [
      "No production DB connection was made.",
      "No backup was created automatically.",
      "No restore was executed automatically.",
      "No data was deleted or overwritten.",
    ],
  },
];

const remainingBackupBlockers = [
  "backup freshness older than 24h or not verified",
  "manual backup timestamp evidence",
  "manual restore rehearsal evidence",
  "rollback owner and access confirmation",
  "owner approval",
] as const;

export function getAphroditeBackupRestoreRehearsalReadiness(): AphroditeBackupRestoreRehearsalReadinessModel {
  return {
    packageNumber: 220,
    title: APHRODITE_BACKUP_RESTORE_REHEARSAL_READINESS_TITLE,
    route: APHRODITE_BACKUP_RESTORE_REHEARSAL_READINESS_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    requiredMessages: [...APHRODITE_BACKUP_RESTORE_REQUIRED_MESSAGES],
    statuses: [...APHRODITE_BACKUP_RESTORE_STATUSES],
    sections: sections.map((section) => ({
      ...section,
      checklist: [...section.checklist],
    })),
    remainingBackupBlockers: [...remainingBackupBlockers],
    safetyFlags: {
      productionLaunchDone: false,
      productionDbConnectionMade: false,
      productionDbWriteAdded: false,
      realSecretsRead: false,
      backupCreatedAutomatically: false,
      restoreExecutedAutomatically: false,
      dataDeletedOrOverwritten: false,
      telegramApiUsed: false,
      messagesSent: false,
      botFatherChanged: false,
      activeCtaLogicChanged: false,
      paymentAdded: false,
      vipUnlockAdded: false,
      workflowChanged: false,
      publishScriptsChanged: false,
    },
  };
}
