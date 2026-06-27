import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_PRODUCTION_ENV_SETUP_PROTOCOL_ROUTE,
  getAphroditeProductionEnvSetupProtocol,
} from "@/lib/zodiac/aphrodite-production-env-setup-protocol";

const model = getAphroditeProductionEnvSetupProtocol();

export const metadata = {
  title: model.title,
};

export default function AphroditeProductionEnvSetupProtocolPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_PRODUCTION_ENV_SETUP_PROTOCOL_ROUTE}
      badge="Aphrodite / Production env"
      description="Owner-facing manual setup protocol for production environment variables, secret hygiene, backup freshness and launch gates. It stores no real values and keeps launch blocked."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "manual protocol items", value: String(model.items.length), tone: "cyan" },
        { label: "secretsAdded", value: String(model.safetyFlags.secretsAdded), tone: "emerald" },
        { label: "productionDbConnected", value: String(model.safetyFlags.productionDbConnected), tone: "emerald" },
      ]}
      sections={[
        {
          title: "manual production env setup protocol",
          rows: model.items.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Env Example Expansion", href: "/dashboard/networks/zodiac/env-example-expansion-readiness" },
        { label: "Production Env Handoff", href: "/dashboard/networks/zodiac/production-env-handoff-checklist" },
        { label: "Public Launch Go/No-Go", href: "/dashboard/networks/zodiac/public-launch-go-no-go-review" },
      ]}
    />
  );
}
