import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_BACKUP_FRESHNESS_VERIFICATION_ROUTE,
  getAphroditeBackupFreshnessVerification,
} from "@/lib/zodiac/aphrodite-backup-freshness-verification";

const model = getAphroditeBackupFreshnessVerification();

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

export default function BackupFreshnessVerificationPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_BACKUP_FRESHNESS_VERIFICATION_ROUTE}
      badge="Aphrodite / backup freshness"
      description="Safe backup freshness verification record. It reports the current stale local backup evidence, keeps restore rehearsal required, and preserves production blockers without creating backup files or touching production DB."
      metrics={[
        { label: "backup status", value: model.backupFreshnessStatus, tone: "rose" },
        { label: "freshness requirement", value: `newer than ${model.backupFreshnessRequiredHours}h before launch`, tone: "amber" },
        { label: "latest backup evidence", value: model.latestBackupEvidencePath, tone: "slate" },
        { label: "latest backup age", value: `${model.latestBackupAgeHours}h at baseline`, tone: "rose" },
        { label: "restore rehearsal", value: model.restoreRehearsalStatus, tone: "rose" },
        { label: "backup marked fresh", value: String(model.backupMarkedFresh), tone: "emerald" },
        { label: "owner action still required", value: String(model.ownerActionStillRequired), tone: "amber" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        { title: "backup verification rules", rows: rows(model.backupVerificationRules) },
        { title: "restore rehearsal rules", rows: rows(model.restoreRehearsalRules) },
        { title: "manual owner actions", rows: rows(model.manualOwnerActions) },
        { title: "production still blocked", rows: rows(model.unresolvedProductionBlockers) },
        { title: "safety boundaries", rows: rows(model.safetyBoundaries) },
        { title: "what this package does not do", rows: rows(model.whatThisPackageDoesNotDo) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Backup Freshness Restore Rehearsal Protocol", href: "/dashboard/networks/zodiac/backup-freshness-restore-rehearsal-protocol" },
        { label: "Manual Env Setup Execution", href: "/dashboard/networks/zodiac/manual-env-setup-execution" },
        { label: "Release Gate Status Consolidation", href: "/dashboard/networks/zodiac/release-gate-status-consolidation" },
      ]}
    />
  );
}
