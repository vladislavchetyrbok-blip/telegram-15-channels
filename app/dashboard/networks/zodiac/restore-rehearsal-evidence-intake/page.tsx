import { AphroditeManualEvidencePackagePage } from "@/components/zodiac/AphroditeManualEvidencePackagePage";
import { getAphroditeRestoreRehearsalEvidenceIntake } from "@/lib/zodiac/aphrodite-restore-rehearsal-evidence-intake";

const model = getAphroditeRestoreRehearsalEvidenceIntake();

export const metadata = {
  title: model.title,
};

export default function RestoreRehearsalEvidenceIntakePage() {
  return <AphroditeManualEvidencePackagePage model={model} />;
}
