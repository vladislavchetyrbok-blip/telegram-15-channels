#!/usr/bin/env node

import { getAphroditeBackupRestoreOwnerActionGate } from "../lib/zodiac/aphrodite-backup-restore-owner-action-gate.ts";
import { runAphroditeTelegramFinalManualReadinessPackageQa } from "./lib/qa-aphrodite-telegram-final-manual-readiness-package.mjs";

runAphroditeTelegramFinalManualReadinessPackageQa({
  model: getAphroditeBackupRestoreOwnerActionGate(),
  packageNumber: 327,
  title: "Backup Restore Owner Action Gate",
  route: "/dashboard/networks/zodiac/backup-restore-owner-action-gate",
  statusField: "backupRestoreOwnerActionStatus",
  statusValue: "WAITING_FOR_FRESH_BACKUP_AND_RESTORE_REHEARSAL",
  modelPath: "../lib/zodiac/aphrodite-backup-restore-owner-action-gate.ts",
  pagePath: "../app/dashboard/networks/zodiac/backup-restore-owner-action-gate/page.tsx",
  docsPath: "../docs/aphrodite-backup-restore-owner-action-gate.md",
  reportPath: "../docs/aphrodite-package-reports/package-327.md",
  dashboardRouteKey: "backupRestoreOwnerActionGate",
  requiredStrings: [
  "backup <24h required",
  "restore rehearsal required",
  "current backup stale",
  "no fake backup evidence",
  "no production DB writes",
  "no production DB mutation"
],
  requiredFalseFields: [],
  requiredExactFields: {
  "backupFreshness": "STALE",
  "restoreRehearsal": "REQUIRED_NOT_COMPLETED"
},
});
