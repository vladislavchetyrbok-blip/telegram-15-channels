import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import { getAphroditeNativeIosAndroidFutureRoadmapDraft } from "@/lib/zodiac/aphrodite-native-ios-android-future-roadmap-draft";

const model = getAphroditeNativeIosAndroidFutureRoadmapDraft();

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

export default function NativeIosAndroidFutureRoadmapDraftPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={model.route}
      badge="Aphrodite / final readiness gate"
      description={model.goal}
      metrics={[
        { label: model.statusField, value: model.statusValue, tone: "amber" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "readyForProductionLaunch", value: String(model.readyForProductionLaunch), tone: "rose" },
        { label: "blockersRemainOpen", value: String(model.blockersRemainOpen), tone: "rose" },
      ]}
      sections={[
        ...model.sections.map((section) => ({ title: section.title, rows: rows(section.rows) })),
        { title: "safety boundaries", rows: rows(model.safetyBoundaries) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Package 303 Density Fix", href: "/dashboard/networks/zodiac/real-device-vip-preview-density-fix" },
        { label: "Manual Evidence Readiness Summary", href: "/dashboard/networks/zodiac/manual-evidence-readiness-summary" },
        { label: "Production Blocker Closure Checklist", href: "/dashboard/networks/zodiac/production-blocker-closure-checklist" },
      ]}
    />
  );
}
