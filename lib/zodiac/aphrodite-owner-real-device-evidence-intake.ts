import { getAphroditeManualEvidencePackage } from "./aphrodite-manual-evidence-readiness-registry";

export const APHRODITE_OWNER_REAL_DEVICE_EVIDENCE_INTAKE_TITLE =
  "Owner Real Device Evidence Intake";

export const APHRODITE_OWNER_REAL_DEVICE_EVIDENCE_INTAKE_ROUTE =
  "/dashboard/networks/zodiac/owner-real-device-evidence-intake" as const;

export function getAphroditeOwnerRealDeviceEvidenceIntake() {
  return getAphroditeManualEvidencePackage(293);
}
