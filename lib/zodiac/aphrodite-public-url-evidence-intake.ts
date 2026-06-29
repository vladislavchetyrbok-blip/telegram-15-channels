import { getAphroditeManualEvidencePackage } from "./aphrodite-manual-evidence-readiness-registry";

export const APHRODITE_PUBLIC_URL_EVIDENCE_INTAKE_TITLE =
  "Public URL Evidence Intake";

export const APHRODITE_PUBLIC_URL_EVIDENCE_INTAKE_ROUTE =
  "/dashboard/networks/zodiac/public-url-evidence-intake" as const;

export function getAphroditePublicUrlEvidenceIntake() {
  return getAphroditeManualEvidencePackage(297);
}
