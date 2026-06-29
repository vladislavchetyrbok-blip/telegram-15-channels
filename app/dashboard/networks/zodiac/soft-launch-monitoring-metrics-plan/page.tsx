import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import { getAphroditeSoftLaunchMonitoringMetricsPlan } from "@/lib/zodiac/aphrodite-soft-launch-monitoring-metrics-plan";

const model = getAphroditeSoftLaunchMonitoringMetricsPlan();

export const metadata = {
  title: model.title,
};

const STATUS_LABELS: Record<string, string> = {
  "WAITING_FOR_UPLOADS": "Waiting for uploads",
  "PENDING_OWNER_DECISION": "Pending owner decision",
  "WAITING_FOR_OWNER_ENV_SETUP": "Waiting for owner env setup",
  "MISSING_OR_NOT_VERIFIED": "Missing or not verified",
  "NOT_CLOSED_MISSING_OR_UNVERIFIED": "Not closed: missing or unverified",
  "NOT_CLOSED_STALE_OR_UNVERIFIED": "Not closed: stale or unverified",
  "STALE_OR_UNVERIFIED": "Stale or unverified",
  "NOT_CLOSED_NOT_COMPLETED": "Not closed: not completed",
  "NOT_CLOSED_NOT_DONE": "Not closed: not done",
  "NOT_GREEN_BLOCKERS_OPEN": "Not green: blockers open",
  "NO_GO_UNTIL_BLOCKERS_CLOSED": "No-go until blockers closed",
  "NO_GO": "No-go",
  "DRAFT_BLOCKED": "Draft blocked",
  "DRAFT_NOT_ACTIVE": "Draft not active",
  "READY_DRAFT_NOT_EXECUTED": "Ready draft, not executed",
  "INCOMPLETE_WAITING_FOR_MANUAL_EVIDENCE": "Incomplete: waiting for manual evidence",
  "NOT_APPROVED": "Not approved",
  "FUTURE_LOCKED_NOT_ACTIVE": "Future locked, not active",
  "DEFERRED_SEPARATE_BRANCH": "Deferred on separate branch",
  "OWNER_ACTION_REQUIRED": "Owner action required",
  "STOP_UNTIL_MANUAL_EVIDENCE": "Stop until manual evidence",
  "WAITING_FOR_OWNER_MANUAL_INPUTS": "Waiting for owner manual inputs",
  "LOCKED": "Locked",
  "NO": "No"
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

export default function SoftLaunchMonitoringMetricsPlanPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={model.route}
      badge="Telegram Mini App / owner manual evidence gate"
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
        { label: "Package 333 Final Pre-Manual Summary", href: "/dashboard/networks/zodiac/telegram-miniapp-final-pre-manual-summary" },
        { label: "Production Blocker Closure Checklist", href: "/dashboard/networks/zodiac/production-blocker-closure-checklist" },
        { label: "Package 303 Density Fix", href: "/dashboard/networks/zodiac/real-device-vip-preview-density-fix" },
      ]}
    />
  );
}
