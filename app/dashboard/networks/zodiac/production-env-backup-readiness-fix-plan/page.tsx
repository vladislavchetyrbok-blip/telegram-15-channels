import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_PRODUCTION_ENV_BACKUP_READINESS_FIX_PLAN_ROUTE,
  getAphroditeProductionEnvBackupReadinessFixPlan,
} from "@/lib/zodiac/aphrodite-production-env-backup-readiness-fix-plan";

const model = getAphroditeProductionEnvBackupReadinessFixPlan();

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

export default function ProductionEnvBackupReadinessFixPlanPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_PRODUCTION_ENV_BACKUP_READINESS_FIX_PLAN_ROUTE}
      badge="Aphrodite / production env backup plan"
      description="Safe manual plan for clearing the remaining production blockers without committing secrets, launching production, calling Telegram, connecting to production DB, refreshing backups automatically, enabling payments, unlocking VIP, or flipping launch flags."
      metrics={[
        { label: "production status", value: "BLOCKED", tone: "rose" },
        { label: "readiness status", value: model.productionReadinessStatus, tone: "amber" },
        { label: "DATABASE_URL", value: "missing", tone: "rose" },
        { label: "TELEGRAM_BOT_TOKEN", value: "missing", tone: "rose" },
        { label: "backup status", value: "older than 24h", tone: "rose" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: ".env.local committed", value: String(model.safetyFlags.envLocalCommitted), tone: "emerald" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        { title: "current blockers", rows: rows(model.blockers) },
        { title: "manual owner steps", rows: rows(model.requiredManualOwnerActions) },
        { title: "env setup checklist", rows: rows(model.envSetupChecklist) },
        { title: "backup freshness checklist", rows: rows(model.backupFreshnessChecklist) },
        { title: "restore rehearsal checklist", rows: rows(model.restoreRehearsalChecklist) },
        { title: "secret handling rules", rows: rows(model.secretHandlingRules) },
        { title: "forbidden actions", rows: rows(model.forbiddenActions) },
        { title: "safety boundaries", rows: rows(model.safetyBoundaries) },
        { title: "what this package does not do", rows: rows(model.whatThisPackageDoesNotDo) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Production Env Setup Protocol", href: "/dashboard/networks/zodiac/production-env-setup-protocol" },
        { label: "Backup Freshness Verification Protocol", href: "/dashboard/networks/zodiac/backup-freshness-verification-protocol" },
        { label: "Production Env Manual Setup Plan", href: "/dashboard/networks/zodiac/production-env-manual-setup-execution-plan" },
        { label: "Public Launch Go/No-Go", href: "/dashboard/networks/zodiac/public-launch-go-no-go-review" },
      ]}
    />
  );
}
