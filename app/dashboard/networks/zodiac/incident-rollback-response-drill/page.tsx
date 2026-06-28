import { AphroditeFinalReadinessPage } from "@/components/zodiac/AphroditeFinalReadinessPage";
import { getAphroditeIncidentRollbackResponseDrill } from "@/lib/zodiac/aphrodite-incident-rollback-response-drill";

const model = getAphroditeIncidentRollbackResponseDrill();

export const metadata = {
  title: model.title,
};

export default function AphroditeIncidentRollbackResponseDrillPage() {
  return <AphroditeFinalReadinessPage model={model} />;
}
