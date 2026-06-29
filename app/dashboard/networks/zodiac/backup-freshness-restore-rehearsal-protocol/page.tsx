import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_BACKUP_FRESHNESS_RESTORE_REHEARSAL_PROTOCOL_ROUTE,
  getAphroditeBackupFreshnessRestoreRehearsalProtocol,
} from "@/lib/zodiac/aphrodite-backup-freshness-restore-rehearsal-protocol";

const model = getAphroditeBackupFreshnessRestoreRehearsalProtocol();

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

export default function BackupFreshnessRestoreRehearsalProtocolPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_BACKUP_FRESHNESS_RESTORE_REHEARSAL_PROTOCOL_ROUTE}
      badge="Aphrodite / backup restore protocol"
      description="Manual protocol for proving backup freshness and rehearsing restore safely without fabricating evidence, touching production DB, writing data, changing automation, or approving launch."
      metrics={[
        { label: "backupFreshnessStatus", value: model.backupFreshnessStatus, tone: "rose" },
        { label: "freshness rule", value: "<24h before launch", tone: "amber" },
        { label: "restore rehearsal", value: "required", tone: "amber" },
        { label: "prod DB connect", value: String(model.safetyFlags.productionDbConnected), tone: "emerald" },
        { label: "DB write added", value: String(model.safetyFlags.databaseWriteAdded), tone: "emerald" },
        { label: "cron/workflow changed", value: String(model.safetyFlags.cronWorkflowPublishChanged), tone: "emerald" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        { title: "backup freshness rules", rows: rows(model.backupFreshnessRules) },
        { title: "backup evidence path rules", rows: rows(model.evidencePathRules) },
        { title: "restore rehearsal protocol", rows: rows(model.restoreRehearsalProtocol) },
        { title: "restore verification checklist", rows: rows(model.restoreVerificationChecklist) },
        { title: "rollback notes", rows: rows(model.rollbackNotes) },
        { title: "forbidden actions", rows: rows(model.forbiddenActions) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Production Env Backup Readiness Fix Plan", href: "/dashboard/networks/zodiac/production-env-backup-readiness-fix-plan" },
        { label: "Backup Freshness Verification Protocol", href: "/dashboard/networks/zodiac/backup-freshness-verification-protocol" },
        { label: "Backup Freshness Restore Rehearsal Execution Plan", href: "/dashboard/networks/zodiac/backup-freshness-restore-rehearsal-execution-plan" },
      ]}
    />
  );
}
