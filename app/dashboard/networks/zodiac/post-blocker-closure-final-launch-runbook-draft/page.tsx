import { AphroditeManualEvidencePackagePage } from "@/components/zodiac/AphroditeManualEvidencePackagePage";
import { getAphroditePostBlockerClosureFinalLaunchRunbookDraft } from "@/lib/zodiac/aphrodite-post-blocker-closure-final-launch-runbook-draft";

const model = getAphroditePostBlockerClosureFinalLaunchRunbookDraft();

export const metadata = {
  title: model.title,
};

export default function PostBlockerClosureFinalLaunchRunbookDraftPage() {
  return <AphroditeManualEvidencePackagePage model={model} />;
}
