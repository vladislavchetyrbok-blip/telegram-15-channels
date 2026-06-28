import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import type { AphroditeFinalReadinessPackageModel } from "@/lib/zodiac/aphrodite-final-readiness-common";

function rowsFromItems(items: AphroditeFinalReadinessPackageModel["sections"][number]["items"]) {
  return items.map((item) => ({
    area: item.area,
    status: item.status,
    detail: item.detail,
    action: item.ownerAction,
  }));
}

export function AphroditeFinalReadinessPage({ model }: { model: AphroditeFinalReadinessPackageModel }) {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={model.route}
      badge="Aphrodite / final soft launch readiness"
      description={`${model.title} is an owner-facing static readiness section. It does not approve launch, execute soft launch, call Telegram, write DB data, add secrets, or mark manual evidence complete.`}
      metrics={[
        { label: "Final Candidate Status", value: model.currentStatus, tone: model.currentStatus === "READY FOR OWNER REVIEW" ? "amber" : "rose" },
        { label: "Can execute soft launch now", value: String(model.canExecuteSoftLaunchNow), tone: "rose" },
        { label: "Can proceed to owner review", value: String(model.canProceedToOwnerReview), tone: model.canProceedToOwnerReview ? "amber" : "rose" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        ...model.sections.map((section) => ({
          title: section.title,
          rows: rowsFromItems(section.items),
        })),
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
        { label: "Soft Launch Candidate Report", href: "/dashboard/networks/zodiac/soft-launch-candidate-report" },
        { label: "Backup Freshness Restore Rehearsal Execution Plan", href: "/dashboard/networks/zodiac/backup-freshness-restore-rehearsal-execution-plan" },
        { label: "Production Env Manual Setup Execution Plan", href: "/dashboard/networks/zodiac/production-env-manual-setup-execution-plan" },
      ]}
    />
  );
}
