import { getAphroditeManualEvidencePackage } from "./aphrodite-manual-evidence-readiness-registry";

export const APHRODITE_BOTFATHER_MANUAL_SETUP_EVIDENCE_INTAKE_TITLE =
  "BotFather Manual Setup Evidence Intake";

export const APHRODITE_BOTFATHER_MANUAL_SETUP_EVIDENCE_INTAKE_ROUTE =
  "/dashboard/networks/zodiac/botfather-manual-setup-evidence-intake" as const;

export function getAphroditeBotfatherManualSetupEvidenceIntake() {
  return getAphroditeManualEvidencePackage(298);
}
