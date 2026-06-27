import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_ENV_EXAMPLE_EXPANSION_READINESS_ROUTE,
  getAphroditeEnvExampleExpansionReadiness,
} from "@/lib/zodiac/aphrodite-env-example-expansion-readiness";

const model = getAphroditeEnvExampleExpansionReadiness();

export const metadata = {
  title: model.title,
};

export default function AphroditeEnvExampleExpansionReadinessPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_ENV_EXAMPLE_EXPANSION_READINESS_ROUTE}
      badge="Aphrodite / Env handoff"
      description="Documentation-only readiness view for the expanded .env.example. It lists required runtime variable names with safe placeholders and keeps launch approval blocked."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "env groups documented", value: String(model.groups.length), tone: "cyan" },
        { label: "secretsAdded", value: String(model.safetyFlags.secretsAdded), tone: "emerald" },
        { label: "productionDbConnected", value: String(model.safetyFlags.productionDbConnected), tone: "emerald" },
      ]}
      sections={[
        {
          title: "env example groups",
          rows: model.groups.map((group) => ({
            area: `${group.group}: ${group.requiredNames.join(", ")}`,
            status: group.status,
            detail: group.note,
            action: group.ownerAction,
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Public API Hardening", href: "/dashboard/networks/zodiac/public-api-exposure-hardening" },
        { label: "Production Env Handoff", href: "/dashboard/networks/zodiac/production-env-handoff-checklist" },
      ]}
    />
  );
}
