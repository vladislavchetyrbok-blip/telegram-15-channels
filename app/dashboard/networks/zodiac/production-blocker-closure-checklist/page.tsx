import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_PRODUCTION_BLOCKER_CLOSURE_CHECKLIST_ROUTE,
  getAphroditeProductionBlockerClosureChecklist,
} from "@/lib/zodiac/aphrodite-production-blocker-closure-checklist";

const model = getAphroditeProductionBlockerClosureChecklist();

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

const blockerRows = model.allBlockers.map((item) => ({
  area: item.label,
  status: item.status,
  detail: item.detail,
  action: item.ownerAction,
}));

export default function ProductionBlockerClosureChecklistPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_PRODUCTION_BLOCKER_CLOSURE_CHECKLIST_ROUTE}
      badge="Aphrodite / blocker closure"
      description="Final production blocker closure checklist. All blockers remain open until owner/manual evidence exists; this package defines closure criteria without launching, configuring secrets, or touching Telegram."
      metrics={[
        { label: "closure status", value: model.productionBlockerClosureStatus, tone: "rose" },
        { label: "open blockers", value: String(model.allBlockers.length), tone: "rose" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "soft launch", value: model.softLaunchApproved ? "YES" : "NO", tone: "rose" },
        { label: "blockers closed without evidence", value: String(model.safetyFlags.blockersClosedWithoutEvidence), tone: "emerald" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        { title: "all blockers", rows: blockerRows },
        { title: "closure criteria", rows: rows(model.closureCriteria) },
        { title: "evidence required", rows: rows(model.evidenceRequired) },
        { title: "safe verification commands", rows: rows(model.safeVerificationCommands) },
        { title: "owner manual actions", rows: rows(model.ownerManualActions) },
        { title: "blocked until", rows: rows(model.blockedUntil) },
        { title: "launch gate summary", rows: rows(model.launchGateSummary) },
        { title: "safety boundaries", rows: rows(model.safetyBoundaries) },
        { title: "what this package does not do", rows: rows(model.whatThisPackageDoesNotDo) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Owner Real Device Approval Capture", href: "/dashboard/networks/zodiac/owner-real-device-approval-capture" },
        { label: "Manual Env Setup Execution", href: "/dashboard/networks/zodiac/manual-env-setup-execution" },
        { label: "Backup Freshness Verification", href: "/dashboard/networks/zodiac/backup-freshness-verification" },
        { label: "Public URL Telegram Setup Manual Gate", href: "/dashboard/networks/zodiac/public-url-telegram-setup-manual-gate" },
      ]}
    />
  );
}
