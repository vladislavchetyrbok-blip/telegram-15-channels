import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import { getAphroditeNativeIosAndroidFutureRoadmapDraft } from "@/lib/zodiac/aphrodite-native-ios-android-future-roadmap-draft";

const model = getAphroditeNativeIosAndroidFutureRoadmapDraft();

export const metadata = {
  title: model.title,
};

function displayStatus(status: string) {
  return status
    .replaceAll("ACTIVE_DOCUMENTED", "Documented")
    .replaceAll("DRAFT_AFTER_TELEGRAM_STABILITY", "Roadmap documented")
    .replaceAll("PENDING_OWNER_SCREENSHOTS", "Pending owner screenshots")
    .replaceAll("PENDING_OWNER_CONFIRMATION", "Pending owner confirmation")
    .replaceAll("PENDING_REAL_DEVICE_CONFIRMATION", "Pending real-device confirmation")
    .replaceAll("READY_FOR_RECHECK", "Ready for recheck")
    .replaceAll("REVIEW_REQUIRED", "Review required")
    .replaceAll("BLOCKERS_OPEN", "Blockers open")
    .replaceAll("NO_GO_BLOCKERS_OPEN", "No-go: blockers open")
    .replaceAll("WAITING_FOR_OWNER_AND_PRODUCTION_EVIDENCE", "Waiting for owner and production evidence");
}

function rows(items: readonly { area: string; status: string; detail: string; ownerAction: string }[]) {
  return items.map((item) => ({
    area: item.area,
    status: displayStatus(item.status),
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
        { label: model.statusField, value: displayStatus(model.statusValue), tone: "amber" },
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
