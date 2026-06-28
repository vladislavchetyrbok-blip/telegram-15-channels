import { AphroditeFinalReadinessPage } from "@/components/zodiac/AphroditeFinalReadinessPage";
import { getAphroditeSoftLaunchMonitoringReadinessPlan } from "@/lib/zodiac/aphrodite-soft-launch-monitoring-readiness-plan";

const model = getAphroditeSoftLaunchMonitoringReadinessPlan();

export const metadata = {
  title: model.title,
};

export default function AphroditeSoftLaunchMonitoringReadinessPlanPage() {
  return <AphroditeFinalReadinessPage model={model} />;
}
