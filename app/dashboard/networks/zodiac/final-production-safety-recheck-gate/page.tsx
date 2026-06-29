import { AphroditeManualEvidencePackagePage } from "@/components/zodiac/AphroditeManualEvidencePackagePage";
import { getAphroditeFinalProductionSafetyRecheckGate } from "@/lib/zodiac/aphrodite-final-production-safety-recheck-gate";

const model = getAphroditeFinalProductionSafetyRecheckGate();

export const metadata = {
  title: model.title,
};

export default function FinalProductionSafetyRecheckGatePage() {
  return <AphroditeManualEvidencePackagePage model={model} />;
}
