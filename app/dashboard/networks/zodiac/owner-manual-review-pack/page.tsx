import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_OWNER_MANUAL_REVIEW_PACK_ROUTE,
  getAphroditeOwnerManualReviewPack,
} from "@/lib/zodiac/aphrodite-owner-manual-review-pack";

const model = getAphroditeOwnerManualReviewPack();

export const metadata = {
  title: model.title,
};

export default function AphroditeOwnerManualReviewPackPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_OWNER_MANUAL_REVIEW_PACK_ROUTE}
      badge="Aphrodite / Owner manual review"
      description="Single owner-facing manual review pack for final soft-launch blockers and decisions. It does not grant approval, launch production, send Telegram messages, enable payment, or unlock VIP."
      metrics={[
        { label: "current status", value: model.currentStatus, tone: "rose" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "manual blockers", value: String(model.remainingBlockers.length), tone: "amber" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        {
          title: "owner review summaries",
          rows: model.reviewSummaries.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "blocker statuses",
          rows: model.blockerStatuses.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "payment/VIP locked status",
          rows: model.paymentVipLockedStatus.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "final owner decision states",
          rows: model.finalOwnerDecisionStates.map((state) => ({
            area: state,
            status: state === "READY FOR LIMITED SOFT LAUNCH, future state only" ? "OWNER REVIEW REQUIRED" : "BLOCKED",
            detail: "Decision state is documented for owner review and is not granted automatically.",
            action: "Owner must decide manually in a future approval step.",
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Soft Launch Scope Selector", href: "/dashboard/networks/zodiac/soft-launch-scope-selector" },
        { label: "Soft Launch Preflight Checklist", href: "/dashboard/networks/zodiac/soft-launch-preflight-checklist" },
        { label: "Content CTA Owner Review Gate", href: "/dashboard/networks/zodiac/content-cta-owner-review-gate" },
        { label: "Real Device QA Execution Pack", href: "/dashboard/networks/zodiac/real-device-qa-execution-pack" },
      ]}
    />
  );
}
