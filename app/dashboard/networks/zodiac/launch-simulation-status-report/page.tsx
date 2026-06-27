import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_LAUNCH_SIMULATION_STATUS_REPORT_ROUTE,
  getAphroditeLaunchSimulationStatusReport,
} from "@/lib/zodiac/aphrodite-launch-simulation-status-report";

const model = getAphroditeLaunchSimulationStatusReport();

export const metadata = {
  title: model.title,
};

export default function AphroditeLaunchSimulationStatusReportPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_LAUNCH_SIMULATION_STATUS_REPORT_ROUTE}
      badge="Aphrodite / Launch simulation"
      description="Consolidated launch simulation status report aggregating automated check expectations, public API hardening, env/backup blockers, real-device QA, WebView QA, CTA review and owner approval status. This is dry-run/readiness only."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "launch not approved", value: "true", tone: "rose" },
        { label: "readiness sections", value: String(model.sections.length), tone: "cyan" },
        { label: "productionLaunchDone", value: String(model.safetyFlags.productionLaunchDone), tone: "emerald" },
      ]}
      sections={[
        {
          title: "consolidated readiness simulation",
          rows: model.sections.map((section) => ({
            area: section.area,
            status: section.status,
            detail: section.detail,
            action: section.ownerAction,
          })),
        },
        {
          title: "status categories",
          rows: model.statusCategories.map((status) => ({
            area: status,
            status,
            detail: "Status category available in this launch simulation report.",
            action: "Use manual evidence to move blocked/manual items later.",
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Public Launch Dry-Run Matrix", href: "/dashboard/networks/zodiac/public-launch-dry-run-matrix" },
        { label: "Public Launch Go/No-Go", href: "/dashboard/networks/zodiac/public-launch-go-no-go-review" },
        { label: "Content CTA Owner Gate", href: "/dashboard/networks/zodiac/content-cta-owner-review-gate" },
      ]}
    />
  );
}
