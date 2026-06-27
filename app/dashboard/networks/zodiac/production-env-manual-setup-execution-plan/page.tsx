import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_PRODUCTION_ENV_MANUAL_SETUP_EXECUTION_PLAN_ROUTE,
  getAphroditeProductionEnvManualSetupExecutionPlan,
} from "@/lib/zodiac/aphrodite-production-env-manual-setup-execution-plan";

const model = getAphroditeProductionEnvManualSetupExecutionPlan();

export const metadata = {
  title: model.title,
};

function rowsFromSteps(steps: readonly { area: string; status: string; detail: string; ownerAction: string }[]) {
  return steps.map((step) => ({
    area: step.area,
    status: step.status,
    detail: step.detail,
    action: step.ownerAction,
  }));
}

function rowsFromEnvItems(
  items: readonly {
    name: string;
    purpose: string;
    requiredForSoftLaunch: string;
    configureWhere: string;
    safePlaceholderExample: string;
    neverCommitValue: string;
    verificationCheck: string;
    currentStatus: string;
  }[],
) {
  return items.map((item) => ({
    area: `${item.name} / required: ${item.requiredForSoftLaunch}`,
    status: item.currentStatus,
    detail: `${item.purpose} Configure: ${item.configureWhere}. Placeholder: ${item.safePlaceholderExample}. Never commit value: ${item.neverCommitValue}.`,
    action: item.verificationCheck,
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

export default function AphroditeProductionEnvManualSetupExecutionPlanPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_PRODUCTION_ENV_MANUAL_SETUP_EXECUTION_PLAN_ROUTE}
      badge="Aphrodite / production env manual setup"
      description="Owner-facing execution plan for manually configuring production env and secrets before soft launch. It documents required envs, verification commands, secret hygiene, and leak response while adding no real secrets and making no production connections."
      metrics={[
        { label: "owner review status", value: model.ownerReviewStatus, tone: "amber" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "secrets added", value: String(model.safetyFlags.secretsAdded), tone: "emerald" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        {
          title: "required env groups",
          rows: rowsFromSteps(model.requiredEnvGroups),
        },
        {
          title: "required production env and secrets",
          rows: rowsFromEnvItems(model.requiredProductionSecrets),
        },
        {
          title: "optional env groups",
          rows: rowsFromEnvItems(model.optionalEnvGroups),
        },
        {
          title: "manual setup steps",
          rows: rowsFromSteps(model.manualSetupSteps),
        },
        {
          title: "verification steps",
          rows: rowsFromSteps(model.verificationSteps),
        },
        {
          title: "secret hygiene rules",
          rows: rowsFromList("Secret hygiene", "MANUAL REQUIRED", model.secretHygieneRules),
        },
        {
          title: "leak response protocol",
          rows: rowsFromSteps(model.leakResponseProtocol),
        },
        {
          title: "post-setup checks",
          rows: rowsFromSteps(model.postSetupChecks),
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
        { label: "Production Env Setup Protocol", href: "/dashboard/networks/zodiac/production-env-setup-protocol" },
        { label: "Production Env Handoff Checklist", href: "/dashboard/networks/zodiac/production-env-handoff-checklist" },
        { label: "Soft Launch Candidate Report", href: "/dashboard/networks/zodiac/soft-launch-candidate-report" },
      ]}
    />
  );
}
