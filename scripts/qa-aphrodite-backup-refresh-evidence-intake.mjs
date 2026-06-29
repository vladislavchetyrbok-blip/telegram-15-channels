#!/usr/bin/env node

import { runManualEvidencePackageQa } from "./lib/qa-aphrodite-manual-evidence-package.mjs";

await runManualEvidencePackageQa({
  packageNumber: 295,
  title: "Backup Refresh Evidence Intake",
  slug: "aphrodite-backup-refresh-evidence-intake",
  routeSlug: "backup-refresh-evidence-intake",
  route: "/dashboard/networks/zodiac/backup-refresh-evidence-intake",
  routeKey: "backupRefreshEvidenceIntake",
  getterName: "getAphroditeBackupRefreshEvidenceIntake",
  statuses: {
    backupRefreshEvidenceStatus: "PENDING_FRESH_BACKUP_EVIDENCE",
    backupFreshness: "STALE_OR_UNVERIFIED",
    backupMarkedFresh: false,
  },
  requiredPhrases: [
    "Backup must be <24h",
    "Latest known backup is stale",
    "Do not create fake backup evidence",
    "Do not connect production DB",
    "Owner/manual backup required",
  ],
});
