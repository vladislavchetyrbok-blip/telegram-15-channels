import { AphroditeFinalReadinessPage } from "@/components/zodiac/AphroditeFinalReadinessPage";
import { getAphroditeOwnerApprovalGateFinalManualDecisionPlan } from "@/lib/zodiac/aphrodite-owner-approval-gate-final-manual-decision-plan";

const model = getAphroditeOwnerApprovalGateFinalManualDecisionPlan();

export const metadata = {
  title: model.title,
};

export default function AphroditeOwnerApprovalGateFinalManualDecisionPlanPage() {
  return <AphroditeFinalReadinessPage model={model} />;
}
