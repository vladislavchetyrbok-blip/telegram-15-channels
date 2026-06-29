import { getAphroditeManualEvidencePackage } from "./aphrodite-manual-evidence-readiness-registry";

export const APHRODITE_RESTORE_REHEARSAL_EVIDENCE_INTAKE_TITLE =
  "Restore Rehearsal Evidence Intake";

export const APHRODITE_RESTORE_REHEARSAL_EVIDENCE_INTAKE_ROUTE =
  "/dashboard/networks/zodiac/restore-rehearsal-evidence-intake" as const;

export function getAphroditeRestoreRehearsalEvidenceIntake() {
  return getAphroditeManualEvidencePackage(296);
}
