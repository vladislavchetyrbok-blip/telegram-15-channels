import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_SOFT_LAUNCH_DRY_RUN_ROLLBACK_PLAN_ROUTE,
  getAphroditeSoftLaunchDryRunRollbackPlan,
} from "@/lib/zodiac/aphrodite-soft-launch-dry-run-rollback-plan";

const model = getAphroditeSoftLaunchDryRunRollbackPlan();

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

export default function SoftLaunchDryRunRollbackPlanPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_SOFT_LAUNCH_DRY_RUN_ROLLBACK_PLAN_ROUTE}
      badge="Aphrodite / soft launch dry run"
      description="Dry-run only soft launch and rollback plan that keeps launch not approved while documenting future one-channel/test-link, incident, rollback, and owner go/no-go gates."
      metrics={[
        { label: "softLaunchStatus", value: model.softLaunchStatus, tone: "rose" },
        { label: "dry run", value: "only", tone: "amber" },
        { label: "messages sent", value: String(model.safetyFlags.messagesSent), tone: "emerald" },
        { label: "Telegram API used", value: String(model.safetyFlags.telegramApiUsed), tone: "emerald" },
        { label: "BotFather changed", value: String(model.safetyFlags.botFatherChanged), tone: "emerald" },
        { label: "env changes", value: String(model.safetyFlags.envChangesAdded), tone: "emerald" },
        { label: "cron/workflow changed", value: String(model.safetyFlags.cronWorkflowPublishChanged), tone: "emerald" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        { title: "dry run scope", rows: rows(model.dryRunScope) },
        { title: "rollback steps", rows: rows(model.rollbackSteps) },
        { title: "incident checklist", rows: rows(model.incidentChecklist) },
        { title: "owner go/no-go gate", rows: rows(model.ownerGoNoGoGate) },
        { title: "remaining blockers", rows: rows(model.blockers) },
        { title: "forbidden actions", rows: rows(model.forbiddenActions) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Public URL Telegram Mini App Setup Plan", href: "/dashboard/networks/zodiac/public-url-telegram-miniapp-setup-plan" },
        { label: "Owner Real Device Verification Checklist", href: "/dashboard/networks/zodiac/owner-real-device-verification-checklist" },
        { label: "Limited Soft Launch Dry Run Matrix", href: "/dashboard/networks/zodiac/limited-soft-launch-dry-run-matrix" },
      ]}
    />
  );
}
