import { getAphroditeManualEvidencePackage } from "./aphrodite-manual-evidence-readiness-registry";

export const APHRODITE_BACKUP_REFRESH_EVIDENCE_INTAKE_TITLE =
  "Backup Refresh Evidence Intake";

export const APHRODITE_BACKUP_REFRESH_EVIDENCE_INTAKE_ROUTE =
  "/dashboard/networks/zodiac/backup-refresh-evidence-intake" as const;

export function getAphroditeBackupRefreshEvidenceIntake() {
  return getAphroditeManualEvidencePackage(295);
}
