import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_CONTENT_CTA_OWNER_REVIEW_GATE_ROUTE,
  getAphroditeContentCtaOwnerReviewGate,
} from "@/lib/zodiac/aphrodite-content-cta-owner-review-gate";

const model = getAphroditeContentCtaOwnerReviewGate();

export const metadata = {
  title: model.title,
};

export default function AphroditeContentCtaOwnerReviewGatePage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_CONTENT_CTA_OWNER_REVIEW_GATE_ROUTE}
      badge="Aphrodite / CTA owner review"
      description="Owner review gate for final content and CTA inventory before soft launch. It documents what must be checked while keeping active CTA logic and publish scripts unchanged."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "CTA review areas", value: String(model.items.length), tone: "cyan" },
        { label: "activeCtaLogicChanged", value: String(model.safetyFlags.activeCtaLogicChanged), tone: "emerald" },
        { label: "publishScriptsChanged", value: String(model.safetyFlags.publishScriptsChanged), tone: "emerald" },
      ]}
      sections={[
        {
          title: "content and CTA owner review gate",
          rows: model.items.map((item) => ({
            area: `${item.area} / active logic changed: ${item.activeLogicChanged}`,
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
        { label: "Final Content CTA Inventory", href: "/dashboard/networks/zodiac/final-content-cta-inventory-audit" },
        { label: "Manual Real-Device Evidence", href: "/dashboard/networks/zodiac/manual-real-device-qa-evidence-capture" },
        { label: "Launch Simulation Status", href: "/dashboard/networks/zodiac/launch-simulation-status-report" },
      ]}
    />
  );
}
