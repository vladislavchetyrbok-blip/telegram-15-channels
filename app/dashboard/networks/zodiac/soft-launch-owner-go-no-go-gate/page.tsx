import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_SOFT_LAUNCH_OWNER_GO_NO_GO_GATE_ROUTE,
  getAphroditeSoftLaunchOwnerGoNoGoGate,
} from "@/lib/zodiac/aphrodite-soft-launch-owner-go-no-go-gate";

const model = getAphroditeSoftLaunchOwnerGoNoGoGate();

export const metadata = {
  title: model.title,
};

export default function AphroditeSoftLaunchOwnerGoNoGoGatePage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_SOFT_LAUNCH_OWNER_GO_NO_GO_GATE_ROUTE}
      badge="Aphrodite / Soft launch gate"
      description="Final owner go/no-go gate for a future soft launch. It does not approve launch automatically and keeps all production actions blocked until explicit owner approval."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "softLaunchApproved", value: String(model.softLaunchApproved), tone: "rose" },
        { label: "productionLaunchDone", value: String(model.productionLaunchDone), tone: "emerald" },
        { label: "autoApprovalAdded", value: String(model.safetyFlags.autoApprovalAdded), tone: "emerald" },
      ]}
      sections={[
        {
          title: "go/no-go statuses",
          rows: model.gateStatuses.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "required before future owner approval",
          rows: model.requiredBeforeFutureApproval.map((item) => ({
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
        { label: "Launch Simulation Status", href: "/dashboard/networks/zodiac/launch-simulation-status-report" },
        { label: "Public Launch Go/No-Go", href: "/dashboard/networks/zodiac/public-launch-go-no-go-review" },
        { label: "Manual Launch Runbook", href: "/dashboard/networks/zodiac/manual-launch-runbook-rollback-pack" },
      ]}
    />
  );
}
