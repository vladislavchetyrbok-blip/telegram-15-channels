import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import { getAphroditePublicUrlOwnerActionGate } from "@/lib/zodiac/aphrodite-public-url-owner-action-gate";

const model = getAphroditePublicUrlOwnerActionGate();

export const metadata = {
  title: model.title,
};

const STATUS_LABELS: Record<string, string> = {
  "WAITING_FOR_OWNER_UPLOADS": "Waiting for owner uploads",
  "PENDING_OWNER_CONFIRMATION": "Pending owner confirmation",
  "WAITING_FOR_OWNER_SECRET_CONFIGURATION": "Waiting for owner secret configuration",
  "WAITING_FOR_FRESH_BACKUP_AND_RESTORE_REHEARSAL": "Waiting for fresh backup and restore rehearsal",
  "WAITING_FOR_PUBLIC_HTTPS_URL": "Waiting for public HTTPS URL",
  "WAITING_FOR_MANUAL_BOTFATHER_SETUP": "Waiting for manual BotFather setup",
  "NOT_GREEN_MANUAL_BLOCKERS_OPEN": "Not green: manual blockers open",
  "NOT_STARTED_BLOCKERS_OPEN": "Not started: blockers open",
  "STOP_NEW_READINESS_PACKAGES_UNTIL_MANUAL_INPUTS": "Stop new readiness packages until manual inputs",
  "READY_FOR_OWNER_MANUAL_WORK": "Ready for owner manual work",
  "REQUIRED_NOT_COMPLETED": "Required, not completed",
  "DOCUMENTED": "Documented",
  "COMPLETED": "Completed",
  "LOCKED": "Locked",
  "STALE": "Stale",
  "MISSING": "Missing",
  "NOT_DONE": "Not done"
};

function displayStatus(status: string) {
  let display = status;

  for (const [raw, label] of Object.entries(STATUS_LABELS)) {
    display = display.replaceAll(raw, label);
  }

  return display;
}

function rows(items: readonly { area: string; status: string; detail: string; ownerAction: string }[]) {
  return items.map((item) => ({
    area: item.area,
    status: displayStatus(item.status),
    detail: item.detail,
    action: item.ownerAction,
  }));
}

export default function PublicUrlOwnerActionGatePage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={model.route}
      badge="Telegram Mini App / manual readiness gate"
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
        { label: "Post-303 Final Readiness Summary", href: "/dashboard/networks/zodiac/post-303-final-readiness-summary" },
        { label: "Manual Evidence Readiness Summary", href: "/dashboard/networks/zodiac/manual-evidence-readiness-summary" },
      ]}
    />
  );
}
