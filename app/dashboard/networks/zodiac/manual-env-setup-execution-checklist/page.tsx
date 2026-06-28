import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_MANUAL_ENV_SETUP_EXECUTION_CHECKLIST_ROUTE,
  getAphroditeManualEnvSetupExecutionChecklist,
} from "@/lib/zodiac/aphrodite-manual-env-setup-execution-checklist";

const model = getAphroditeManualEnvSetupExecutionChecklist();

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

export default function ManualEnvSetupExecutionChecklistPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_MANUAL_ENV_SETUP_EXECUTION_CHECKLIST_ROUTE}
      badge="Aphrodite / manual env setup"
      description="Manual-only checklist for placing DATABASE_URL and TELEGRAM_BOT_TOKEN safely outside Git while verifying only masked presence and keeping production launch blocked."
      metrics={[
        { label: "manual env setup", value: model.manualEnvSetupStatus, tone: "amber" },
        { label: "DATABASE_URL", value: "manual outside Git", tone: "rose" },
        { label: "TELEGRAM_BOT_TOKEN", value: "manual outside Git", tone: "rose" },
        { label: "verification", value: "masked presence only", tone: "cyan" },
        { label: ".env.local committed", value: String(model.safetyFlags.envLocalCommitted), tone: "emerald" },
        { label: "production connection", value: String(model.safetyFlags.productionDbConnected), tone: "emerald" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        { title: "DATABASE_URL placement", rows: rows(model.databaseUrlChecklist) },
        { title: "TELEGRAM_BOT_TOKEN placement", rows: rows(model.telegramTokenChecklist) },
        { title: "masked verification checklist", rows: rows(model.verificationChecklist) },
        { title: "redaction rules", rows: rows(model.redactionRules) },
        { title: "safety boundaries", rows: rows(model.safetyBoundaries) },
        { title: "forbidden actions", rows: rows(model.forbiddenActions) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Production Env Backup Readiness Fix Plan", href: "/dashboard/networks/zodiac/production-env-backup-readiness-fix-plan" },
        { label: "Production Env Setup Protocol", href: "/dashboard/networks/zodiac/production-env-setup-protocol" },
        { label: "Env Example Expansion Readiness", href: "/dashboard/networks/zodiac/env-example-expansion-readiness" },
      ]}
    />
  );
}
