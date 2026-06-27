import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_BACKUP_FRESHNESS_VERIFICATION_PROTOCOL_ROUTE,
  getAphroditeBackupFreshnessVerificationProtocol,
} from "@/lib/zodiac/aphrodite-backup-freshness-verification-protocol";

const model = getAphroditeBackupFreshnessVerificationProtocol();

export const metadata = {
  title: model.title,
};

export default function AphroditeBackupFreshnessVerificationProtocolPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_BACKUP_FRESHNESS_VERIFICATION_PROTOCOL_ROUTE}
      badge="Aphrodite / Backup protocol"
      description="Manual backup freshness and restore verification protocol for future launch readiness. It records what the owner must verify and performs no automatic DB access or restore."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "backupCreatedAutomatically", value: String(model.safetyFlags.backupCreatedAutomatically), tone: "emerald" },
        { label: "restoreExecutedAutomatically", value: String(model.safetyFlags.restoreExecutedAutomatically), tone: "emerald" },
        { label: "productionDbConnectionMade", value: String(model.safetyFlags.productionDbConnectionMade), tone: "emerald" },
      ]}
      sections={[
        {
          title: "manual backup freshness and restore protocol",
          rows: model.steps.map((step) => ({
            area: step.area,
            status: step.status,
            detail: step.detail,
            action: step.ownerAction,
          })),
        },
        {
          title: "required launch evidence messages",
          rows: model.requiredMessages.map((message) => ({
            area: message,
            status: "MANUAL REQUIRED",
            detail: "This wording must remain visible until owner evidence is collected manually.",
            action: "Keep launch blocked until this item is verified by the owner.",
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Backup & Restore Rehearsal", href: "/dashboard/networks/zodiac/backup-restore-rehearsal-readiness" },
        { label: "Production Env Setup", href: "/dashboard/networks/zodiac/production-env-setup-protocol" },
        { label: "Public Launch Go/No-Go", href: "/dashboard/networks/zodiac/public-launch-go-no-go-review" },
      ]}
    />
  );
}
