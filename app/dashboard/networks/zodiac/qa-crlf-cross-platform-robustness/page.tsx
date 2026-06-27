import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_QA_CRLF_CROSS_PLATFORM_ROBUSTNESS_ROUTE,
  getAphroditeQaCrlfCrossPlatformRobustness,
} from "@/lib/zodiac/aphrodite-qa-crlf-cross-platform-robustness";

const model = getAphroditeQaCrlfCrossPlatformRobustness();

export const metadata = {
  title: model.title,
};

export default function AphroditeQaCrlfCrossPlatformRobustnessPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_QA_CRLF_CROSS_PLATFORM_ROBUSTNESS_ROUTE}
      badge="Aphrodite / QA robustness"
      description="Readiness view for cross-platform QA scope checks. EOL-only CRLF/LF churn is classified separately, while real file scope violations still fail."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "runtimeBehaviorChanged", value: String(model.safetyFlags.runtimeBehaviorChanged), tone: "emerald" },
        { label: "helper", value: "qa-git-scope", tone: "cyan" },
        { label: "EOL-only classification", value: "enabled", tone: "violet" },
      ]}
      sections={[
        {
          title: "cross-platform QA scope",
          rows: model.items.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Env Example Expansion", href: "/dashboard/networks/zodiac/env-example-expansion-readiness" },
        { label: "Dashboard Auth Decision", href: "/dashboard/networks/zodiac/dashboard-auth-system-decision" },
      ]}
    />
  );
}
