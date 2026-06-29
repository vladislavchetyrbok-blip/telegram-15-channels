import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_OWNER_MANUAL_CLOSURE_EXECUTION_PACK_ROUTE,
  getAphroditeOwnerManualClosureExecutionPack,
} from "@/lib/zodiac/aphrodite-owner-manual-closure-execution-pack";

const model = getAphroditeOwnerManualClosureExecutionPack();

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

const executionRows = model.executionOrder.map((item) => ({
  area: `${item.step}. ${item.area}`,
  status: item.status,
  detail: item.detail,
  action: item.ownerAction,
}));

export default function OwnerManualClosureExecutionPackPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_OWNER_MANUAL_CLOSURE_EXECUTION_PACK_ROUTE}
      badge="Aphrodite / owner manual closure"
      description="Owner execution pack for manually closing the seven remaining production blockers. All blockers remain open here; evidence is required before any later go/no-go decision."
      metrics={[
        { label: "manualClosureStatus", value: model.manualClosureStatus, tone: "amber" },
        { label: "blockersRemainOpen", value: String(model.blockersRemainOpen), tone: "rose" },
        { label: "open blockers", value: String(model.allBlockers.length), tone: "rose" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "soft launch", value: model.softLaunchApproved ? "YES" : "NO", tone: "rose" },
        { label: "owner action", value: model.ownerActionStillRequired ? "still required" : "complete", tone: "amber" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        { title: "all seven blockers", rows: blockerRows },
        { title: "execution order", rows: executionRows },
        { title: "owner actions", rows: rows(model.ownerActions) },
        { title: "evidence required", rows: rows(model.evidenceTemplates) },
        { title: "safe redacted verification commands", rows: rows(model.redactedVerificationRules) },
        { title: "forbidden actions", rows: rows(model.forbiddenActions) },
        { title: "launch gate state", rows: rows(model.launchGateState) },
        { title: "safety boundaries", rows: rows(model.safetyBoundaries) },
        { title: "what this package does not do", rows: rows(model.whatThisPackageDoesNotDo) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Production Blocker Closure Checklist", href: "/dashboard/networks/zodiac/production-blocker-closure-checklist" },
        { label: "Owner Real Device Approval Capture", href: "/dashboard/networks/zodiac/owner-real-device-approval-capture" },
        { label: "Manual Env Setup Execution", href: "/dashboard/networks/zodiac/manual-env-setup-execution" },
        { label: "Backup Freshness Verification", href: "/dashboard/networks/zodiac/backup-freshness-verification" },
        { label: "Public URL Telegram Setup Manual Gate", href: "/dashboard/networks/zodiac/public-url-telegram-setup-manual-gate" },
      ]}
    />
  );
}
