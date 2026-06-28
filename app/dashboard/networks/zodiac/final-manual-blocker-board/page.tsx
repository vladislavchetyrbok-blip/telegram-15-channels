import { AphroditeFinalReadinessPage } from "@/components/zodiac/AphroditeFinalReadinessPage";
import { getAphroditeFinalManualBlockerBoard } from "@/lib/zodiac/aphrodite-final-manual-blocker-board";

const model = getAphroditeFinalManualBlockerBoard();

export const metadata = {
  title: model.title,
};

export default function AphroditeFinalManualBlockerBoardPage() {
  return <AphroditeFinalReadinessPage model={model} />;
}
