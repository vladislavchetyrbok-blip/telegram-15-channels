import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_RELEASE_GATE_STATUS_CONSOLIDATION_ROUTE,
  getAphroditeReleaseGateStatusConsolidation,
} from "@/lib/zodiac/aphrodite-release-gate-status-consolidation";

const model = getAphroditeReleaseGateStatusConsolidation();

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

export default function ReleaseGateStatusConsolidationPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_RELEASE_GATE_STATUS_CONSOLIDATION_ROUTE}
      badge="Aphrodite / release gate board"
      description="Consolidated launch gate dashboard separating code and visual readiness from manual blockers that still prevent production launch."
      metrics={[
        { label: "release gate", value: model.releaseGateStatus, tone: "rose" },
        { label: "code checks", value: "PASS", tone: "emerald" },
        { label: "visual evidence", value: "READY_FOR_OWNER_REVIEW", tone: "amber" },
        { label: "owner visual approval", value: "NOT_GRANTED", tone: "rose" },
        { label: "env", value: "BLOCKED", tone: "rose" },
        { label: "backup freshness", value: "BLOCKED", tone: "rose" },
        { label: "soft launch", value: "NOT_APPROVED", tone: "rose" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        { title: "consolidated gates", rows: rows(model.consolidatedGates) },
        { title: "manual blockers", rows: rows(model.manualBlockers) },
        { title: "evidence ready gates", rows: rows(model.evidenceReadyGates) },
        { title: "forbidden actions", rows: rows(model.forbiddenActions) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Owner Visual Evidence Approval Record", href: "/dashboard/networks/zodiac/owner-visual-evidence-approval-record" },
        { label: "Manual Env Setup Execution Checklist", href: "/dashboard/networks/zodiac/manual-env-setup-execution-checklist" },
        { label: "Backup Freshness Restore Rehearsal Protocol", href: "/dashboard/networks/zodiac/backup-freshness-restore-rehearsal-protocol" },
        { label: "Soft Launch Dry Run Rollback Plan", href: "/dashboard/networks/zodiac/soft-launch-dry-run-rollback-plan" },
      ]}
    />
  );
}
