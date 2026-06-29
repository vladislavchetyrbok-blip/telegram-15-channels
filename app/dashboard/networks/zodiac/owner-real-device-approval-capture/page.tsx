import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_OWNER_REAL_DEVICE_APPROVAL_CAPTURE_ROUTE,
  getAphroditeOwnerRealDeviceApprovalCapture,
} from "@/lib/zodiac/aphrodite-owner-real-device-approval-capture";

const model = getAphroditeOwnerRealDeviceApprovalCapture();

export const metadata = {
  title: model.title,
};

function rows(items: readonly { area: string; status: string; detail: string; ownerAction: string }[]) {
  return items.map((item) => ({
    area: item.area,
    status: item.status,
    detail: item.detail,
    action: item.ownerAction,
  }));
}

export default function OwnerRealDeviceApprovalCapturePage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_OWNER_REAL_DEVICE_APPROVAL_CAPTURE_ROUTE}
      badge="Aphrodite / owner real-device approval"
      description="Owner approval capture record for Telegram Mini App visual and UX review. No owner evidence was supplied, so approval remains pending and false while production blockers stay open."
      metrics={[
        { label: "approval status", value: model.ownerApprovalStatus, tone: "amber" },
        { label: "ownerRealDeviceApproval", value: model.ownerRealDeviceApproval ? "Yes" : "No", tone: "rose" },
        { label: "screenshots required", value: String(model.screenshotsRequired), tone: "cyan" },
        { label: "screenshots received", value: String(model.screenshotsReceived), tone: "rose" },
        { label: "evidence folder", value: "package-275", tone: "violet" },
        { label: "production blockers", value: String(model.unresolvedProductionBlockers.length), tone: "rose" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        { title: "required screenshots and checks", rows: rows(model.requiredScreens) },
        { title: "required device checks", rows: rows(model.requiredDeviceChecks) },
        { title: "evidence sources", rows: rows(model.evidenceSources) },
        { title: "production blockers", rows: rows(model.unresolvedProductionBlockers) },
        { title: "safety boundaries", rows: rows(model.safetyBoundaries) },
        { title: "what this package does not do", rows: rows(model.whatThisPackageDoesNotDo) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Owner Real Device Verification Checklist", href: "/dashboard/networks/zodiac/owner-real-device-verification-checklist" },
        { label: "Night Run Final Readiness Summary", href: "/dashboard/networks/zodiac/night-run-final-readiness-summary" },
        { label: "Release Gate Status Consolidation", href: "/dashboard/networks/zodiac/release-gate-status-consolidation" },
        { label: "Owner Visual Evidence Approval Record", href: "/dashboard/networks/zodiac/owner-visual-evidence-approval-record" },
      ]}
    />
  );
}
