import { AphroditeManualEvidencePackagePage } from "@/components/zodiac/AphroditeManualEvidencePackagePage";
import { getAphroditeBackupRefreshEvidenceIntake } from "@/lib/zodiac/aphrodite-backup-refresh-evidence-intake";

const model = getAphroditeBackupRefreshEvidenceIntake();

export const metadata = {
  title: model.title,
};

export default function BackupRefreshEvidenceIntakePage() {
  return <AphroditeManualEvidencePackagePage model={model} />;
}
