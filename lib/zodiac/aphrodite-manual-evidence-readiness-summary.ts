import { getAphroditeManualEvidencePackage } from "./aphrodite-manual-evidence-readiness-registry";

export const APHRODITE_MANUAL_EVIDENCE_READINESS_SUMMARY_TITLE =
  "Manual Evidence Readiness Summary";

export const APHRODITE_MANUAL_EVIDENCE_READINESS_SUMMARY_ROUTE =
  "/dashboard/networks/zodiac/manual-evidence-readiness-summary" as const;

export function getAphroditeManualEvidenceReadinessSummary() {
  return getAphroditeManualEvidencePackage(302);
}
