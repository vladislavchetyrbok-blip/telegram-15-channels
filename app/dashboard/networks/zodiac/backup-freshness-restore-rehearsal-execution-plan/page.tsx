import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_BACKUP_FRESHNESS_RESTORE_REHEARSAL_EXECUTION_PLAN_ROUTE,
  getAphroditeBackupFreshnessRestoreRehearsalExecutionPlan,
} from "@/lib/zodiac/aphrodite-backup-freshness-restore-rehearsal-execution-plan";

const model = getAphroditeBackupFreshnessRestoreRehearsalExecutionPlan();

export const metadata = {
  title: model.title,
};

function rowsFromRequirements(
  requirements: readonly { area: string; status: string; requirement: string; ownerAction: string }[],
) {
  return requirements.map((item) => ({
    area: item.area,
    status: item.status,
    detail: item.requirement,
    action: item.ownerAction,
  }));
}

function rowsFromEvidence(
  fields: readonly { name: string; required: string; status: string; description: string }[],
) {
  return fields.map((field) => ({
    area: `${field.name} / required: ${field.required}`,
    status: field.status,
    detail: field.description,
    action: "Record manually in owner evidence. Do not store secrets in this repo.",
  }));
}

function rowsFromList(title: string, status: string, items: readonly string[]) {
  return items.map((item) => ({
    area: title,
    status,
    detail: item,
    action: "Owner/manual verification required.",
  }));
}

export default function AphroditeBackupFreshnessRestoreRehearsalExecutionPlanPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_BACKUP_FRESHNESS_RESTORE_REHEARSAL_EXECUTION_PLAN_ROUTE}
      badge="Aphrodite / backup restore execution plan"
      description="Owner-facing execution plan for manually confirming backup freshness, restore rehearsal, rollback point, stop conditions, and incident response before any future soft launch. This page creates no backup, runs no restore, connects to no production DB, and keeps launch approval blocked."
      metrics={[
        { label: "backup freshness", value: model.backupFreshnessStatus, tone: "rose" },
        { label: "backup <24h confirmed", value: String(model.backupFreshnessConfirmed), tone: "rose" },
        { label: "restore rehearsal completed", value: String(model.restoreRehearsalCompleted), tone: "rose" },
        { label: "rollback point", value: model.rollbackPointStatus, tone: "amber" },
        { label: "owner review status", value: model.ownerReviewStatus, tone: "amber" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        {
          title: "backup freshness requirements",
          rows: rowsFromRequirements(model.backupFreshnessRequirements),
        },
        {
          title: "restore rehearsal requirements",
          rows: rowsFromRequirements(model.restoreRehearsalRequirements),
        },
        {
          title: "rollback point requirements",
          rows: rowsFromRequirements(model.rollbackPointRequirements),
        },
        {
          title: "manual verification steps",
          rows: rowsFromRequirements(model.manualVerificationSteps),
        },
        {
          title: "backup evidence fields",
          rows: rowsFromEvidence(model.backupEvidenceFields),
        },
        {
          title: "restore evidence fields",
          rows: rowsFromEvidence(model.restoreEvidenceFields),
        },
        {
          title: "stop conditions",
          rows: rowsFromList("Stop condition", "BLOCKED", model.stopConditions),
        },
        {
          title: "failure response protocol",
          rows: rowsFromRequirements(model.failureResponseProtocol),
        },
        {
          title: "incident response protocol",
          rows: rowsFromRequirements(model.incidentResponseProtocol),
        },
        {
          title: "owner sign-off requirements",
          rows: rowsFromRequirements(model.ownerSignOffRequirements),
        },
        {
          title: "remaining manual blockers",
          rows: rowsFromList("Manual blocker", "BLOCKED", model.remainingManualBlockers),
        },
        {
          title: "what was not changed",
          rows: model.whatWasNotChanged.map((item) => ({
            area: "Safety Scope",
            status: "PASS",
            detail: item,
            action: "Strictly preserved.",
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Backup Freshness Verification Protocol", href: "/dashboard/networks/zodiac/backup-freshness-verification-protocol" },
        { label: "Backup Restore Rehearsal Readiness", href: "/dashboard/networks/zodiac/backup-restore-rehearsal-readiness" },
        { label: "Production Env Manual Setup Execution Plan", href: "/dashboard/networks/zodiac/production-env-manual-setup-execution-plan" },
        { label: "Soft Launch Candidate Report", href: "/dashboard/networks/zodiac/soft-launch-candidate-report" },
      ]}
    />
  );
}
