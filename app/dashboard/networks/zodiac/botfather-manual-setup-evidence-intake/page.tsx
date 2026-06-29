import { AphroditeManualEvidencePackagePage } from "@/components/zodiac/AphroditeManualEvidencePackagePage";
import { getAphroditeBotfatherManualSetupEvidenceIntake } from "@/lib/zodiac/aphrodite-botfather-manual-setup-evidence-intake";

const model = getAphroditeBotfatherManualSetupEvidenceIntake();

export const metadata = {
  title: model.title,
};

export default function BotfatherManualSetupEvidenceIntakePage() {
  return <AphroditeManualEvidencePackagePage model={model} />;
}
