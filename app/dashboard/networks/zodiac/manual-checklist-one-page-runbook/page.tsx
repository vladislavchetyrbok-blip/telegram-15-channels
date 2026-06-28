import { AphroditeFinalReadinessPage } from "@/components/zodiac/AphroditeFinalReadinessPage";
import { getAphroditeManualChecklistOnePageRunbook } from "@/lib/zodiac/aphrodite-manual-checklist-one-page-runbook";

const model = getAphroditeManualChecklistOnePageRunbook();

export const metadata = {
  title: model.title,
};

export default function AphroditeManualChecklistOnePageRunbookPage() {
  return <AphroditeFinalReadinessPage model={model} />;
}
