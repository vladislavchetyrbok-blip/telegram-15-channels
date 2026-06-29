import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_MANUAL_ENV_SETUP_EXECUTION_ROUTE,
  getAphroditeManualEnvSetupExecution,
} from "@/lib/zodiac/aphrodite-manual-env-setup-execution";

const model = getAphroditeManualEnvSetupExecution();

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

export default function ManualEnvSetupExecutionPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_MANUAL_ENV_SETUP_EXECUTION_ROUTE}
      badge="Aphrodite / manual env setup"
      description="Manual environment setup execution record for production readiness. Secrets remain outside Git, verification stays redacted, and blockers remain open until the owner configures env in the provider panel."
      metrics={[
        { label: "manual env setup status", value: model.manualEnvSetupStatus, tone: "amber" },
        { label: "DATABASE_URL", value: model.databaseUrlConfigured ? "configured" : "not configured / manual", tone: "rose" },
        { label: "TELEGRAM_BOT_TOKEN", value: model.telegramBotTokenConfigured ? "configured" : "not configured / manual", tone: "rose" },
        { label: "backup freshness", value: "still blocked", tone: "rose" },
        { label: "owner real-device approval", value: "pending", tone: "rose" },
        { label: "secrets committed", value: String(model.secretsCommitted), tone: "emerald" },
        { label: ".env.local committed", value: String(model.envLocalCommitted), tone: "emerald" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        { title: "secret handling", rows: rows(model.redactionRules) },
        { title: "manual setup steps", rows: rows(model.manualSetupSteps) },
        { title: "safe verification steps", rows: rows(model.safeVerificationSteps) },
        { title: "unresolved blockers", rows: rows(model.unresolvedBlockers) },
        { title: "safety boundaries", rows: rows(model.safetyBoundaries) },
        { title: "what this package does not do", rows: rows(model.whatThisPackageDoesNotDo) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Manual Env Setup Execution Checklist", href: "/dashboard/networks/zodiac/manual-env-setup-execution-checklist" },
        { label: "Owner Real Device Approval Capture", href: "/dashboard/networks/zodiac/owner-real-device-approval-capture" },
        { label: "Release Gate Status Consolidation", href: "/dashboard/networks/zodiac/release-gate-status-consolidation" },
      ]}
    />
  );
}
