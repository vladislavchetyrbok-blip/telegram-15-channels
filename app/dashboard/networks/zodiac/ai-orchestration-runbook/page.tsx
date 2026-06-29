import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_AI_ORCHESTRATION_RUNBOOK_ROUTE,
  getAphroditeAiOrchestrationRunbook,
} from "@/lib/zodiac/aphrodite-ai-orchestration-runbook";

const model = getAphroditeAiOrchestrationRunbook();

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

export default function AiOrchestrationRunbookPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_AI_ORCHESTRATION_RUNBOOK_ROUTE}
      badge="Aphrodite / AI orchestration"
      description="Runbook for coordinating Codex, Antigravity, Claude, and owner review without parallel file edits, auto-merge, or production launch authority."
      metrics={[
        { label: "orchestration", value: model.orchestrationStatus, tone: "cyan" },
        { label: "Claude", value: "read-only audit", tone: "emerald" },
        { label: "Antigravity", value: "visual QA", tone: "amber" },
        { label: "Codex", value: "scoped changes", tone: "cyan" },
        { label: "auto merge allowed", value: String(model.safetyFlags.autoMergeAllowed), tone: "emerald" },
        { label: "production launch", value: String(model.safetyFlags.productionLaunchDone), tone: "emerald" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        { title: "agent roles", rows: rows(model.agentRoles) },
        { title: "execution order", rows: rows(model.executionOrder) },
        { title: "coordination rules", rows: rows(model.coordinationRules) },
        { title: "package report format", rows: rows(model.packageReportFormat) },
        { title: "forbidden actions", rows: rows(model.forbiddenActions) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Release Gate Status Consolidation", href: "/dashboard/networks/zodiac/release-gate-status-consolidation" },
        { label: "Owner Visual Evidence Approval Record", href: "/dashboard/networks/zodiac/owner-visual-evidence-approval-record" },
        { label: "Visual QA Screenshot Pack", href: "/dashboard/networks/zodiac/visual-qa-screenshot-pack" },
      ]}
    />
  );
}
