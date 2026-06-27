import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_SOFT_LAUNCH_CANDIDATE_REPORT_ROUTE,
  getAphroditeSoftLaunchCandidateReport,
} from "@/lib/zodiac/aphrodite-soft-launch-candidate-report";

const model = getAphroditeSoftLaunchCandidateReport();

export const metadata = {
  title: model.title,
};

export default function AphroditeSoftLaunchCandidateReportPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_SOFT_LAUNCH_CANDIDATE_REPORT_ROUTE}
      badge="Aphrodite / Soft launch candidate"
      description="Final candidate report for limited soft-launch readiness. Current candidate status is NOT READY and APPROVAL NOT GRANTED; this page does not approve or execute launch."
      metrics={[
        { label: "candidate status", value: model.currentCandidateStatus, tone: "rose" },
        { label: "owner decision", value: model.ownerDecisionStatus, tone: "rose" },
        { label: "can proceed to owner review", value: String(model.canProceedToOwnerReview), tone: "amber" },
        { label: "can execute soft launch now", value: String(model.canExecuteSoftLaunchNow), tone: "rose" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        {
          title: "aggregate readiness",
          rows: model.aggregateReadiness.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "candidate status values",
          rows: model.candidateStatusValues.map((status) => ({
            area: status,
            status,
            detail: "Candidate status value for future owner decision tracking.",
            action: status === "READY FOR LIMITED SOFT LAUNCH, future only" ? "Future state only; not active now." : "Use as readonly status evidence.",
          })),
        },
        {
          title: "why not ready",
          rows: model.whyNotReady.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "design status",
          rows: model.designStatus.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "scope recommendation",
          rows: model.scopeRecommendation.map((item) => ({
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
        { label: "Soft Launch Scope Selector", href: "/dashboard/networks/zodiac/soft-launch-scope-selector" },
        { label: "Soft Launch Preflight Checklist", href: "/dashboard/networks/zodiac/soft-launch-preflight-checklist" },
        { label: "Owner Manual Review Pack", href: "/dashboard/networks/zodiac/owner-manual-review-pack" },
        { label: "Real Device QA Execution Gate", href: "/dashboard/networks/zodiac/real-device-qa-execution-gate" },
      ]}
    />
  );
}
