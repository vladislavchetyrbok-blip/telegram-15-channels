import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_OWNER_VISUAL_EVIDENCE_APPROVAL_RECORD_ROUTE,
  getAphroditeOwnerVisualEvidenceApprovalRecord,
} from "@/lib/zodiac/aphrodite-owner-visual-evidence-approval-record";

const model = getAphroditeOwnerVisualEvidenceApprovalRecord();

export const metadata = {
  title: model.title,
};

function rows(items: typeof model.coveredScreens) {
  return items.map((item) => ({
    area: item.area,
    status: item.status,
    detail: item.detail,
    action: item.ownerAction,
  }));
}

export default function OwnerVisualEvidenceApprovalRecordPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_OWNER_VISUAL_EVIDENCE_APPROVAL_RECORD_ROUTE}
      badge="Aphrodite / owner visual evidence"
      description="Formal owner visual evidence review record for the merged Package 275 screenshot evidence pack. This page records that visual evidence is ready for owner review only; it does not grant owner approval, does not approve production launch, and does not change Telegram, payment, VIP, database, workflow, or secrets boundaries."
      metrics={[
        { label: "evidence folder", value: model.reviewedEvidenceFolder, tone: "cyan" },
        { label: "screenshots", value: String(model.screenshotCount), tone: "violet" },
        { label: "duplicate validation", value: model.duplicateHashValidationStatus, tone: "emerald" },
        { label: "visual review status", value: model.ownerVisualEvidenceStatus, tone: "amber" },
        { label: "owner approval granted", value: model.ownerApprovalGranted ? "Yes" : "No", tone: "rose" },
        { label: "production launch approved", value: model.publicLaunchApproved ? "Yes" : "No", tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "main evidence HEAD", value: model.currentMainHead.slice(0, 7), tone: "slate" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        { title: "screenshot coverage", rows: rows(model.coveredScreens) },
        { title: "remaining production blockers", rows: rows(model.productionBlockers) },
        { title: "safety boundaries", rows: rows(model.safetyBoundaries) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Package 275 Evidence Folder", href: "/dashboard/networks/zodiac/visual-qa-screenshot-pack" },
        { label: "Public Mini App Shell Isolation", href: "/dashboard/networks/zodiac/public-miniapp-route-shell-isolation" },
        { label: "Owner Visual Recheck After Mobile Fixes", href: "/dashboard/networks/zodiac/owner-visual-recheck-after-mobile-fixes" },
        { label: "Final Pre-Owner-Review Summary", href: "/dashboard/networks/zodiac/final-pre-owner-review-summary" },
      ]}
    />
  );
}
