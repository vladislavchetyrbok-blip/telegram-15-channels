import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_NIGHT_RUN_FINAL_READINESS_SUMMARY_ROUTE,
  getAphroditeNightRunFinalReadinessSummary,
} from "@/lib/zodiac/aphrodite-night-run-final-readiness-summary";

const model = getAphroditeNightRunFinalReadinessSummary();

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

export default function NightRunFinalReadinessSummaryPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_NIGHT_RUN_FINAL_READINESS_SUMMARY_ROUTE}
      badge="Aphrodite / night run summary"
      description="Final readiness summary for Packages 278-286, consolidating branch state, visual evidence, production blockers, manual owner tasks, and next recommended packages without approving launch."
      metrics={[
        { label: "current branch", value: model.currentBranch, tone: "cyan" },
        { label: "current HEAD", value: model.currentHead, tone: "slate" },
        { label: "packages", value: "278-286", tone: "emerald" },
        { label: "visual evidence", value: "READY_FOR_OWNER_REVIEW", tone: "amber" },
        { label: "production blockers", value: "open", tone: "rose" },
        { label: "softLaunchStatus", value: model.softLaunchStatus, tone: "rose" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "next packages", value: "287-290", tone: "violet" },
      ]}
      sections={[
        { title: "packages completed in night run", rows: rows(model.completedPackages) },
        { title: "current branch and current HEAD", rows: rows(model.branchState) },
        { title: "visual evidence state", rows: rows(model.visualEvidenceState) },
        { title: "production blockers", rows: rows(model.productionBlockers) },
        { title: "manual owner tasks", rows: rows(model.manualOwnerTasks) },
        { title: "next recommended packages", rows: rows(model.nextRecommendedPackages) },
        { title: "forbidden actions", rows: rows(model.forbiddenActions) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Release Gate Status Consolidation", href: "/dashboard/networks/zodiac/release-gate-status-consolidation" },
        { label: "AI Orchestration Runbook", href: "/dashboard/networks/zodiac/ai-orchestration-runbook" },
        { label: "Owner Real Device Verification Checklist", href: "/dashboard/networks/zodiac/owner-real-device-verification-checklist" },
      ]}
    />
  );
}
