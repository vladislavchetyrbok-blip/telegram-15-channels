import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_CONTENT_CTA_OWNER_REVIEW_EXECUTION_ROUTE,
  getAphroditeContentCtaOwnerReviewExecution,
} from "@/lib/zodiac/aphrodite-content-cta-owner-review-execution";

const model = getAphroditeContentCtaOwnerReviewExecution();

export const metadata = {
  title: model.title,
};

function rowsFromItems(items: readonly { area: string; status: string; route: string; detail: string; action: string }[]) {
  return items.map((item) => ({
    area: `${item.area} / ${item.route}`,
    status: item.status,
    detail: item.detail,
    action: item.action,
  }));
}

function rowsFromList(title: string, status: string, items: readonly string[]) {
  return items.map((item) => ({
    area: title,
    status,
    detail: item,
    action: status === "OWNER REVIEW REQUIRED" ? "Owner must review manually." : "Manual verification remains required.",
  }));
}

export default function AphroditeContentCtaOwnerReviewExecutionPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_CONTENT_CTA_OWNER_REVIEW_EXECUTION_ROUTE}
      badge="Aphrodite / content CTA review execution"
      description="Execution pack for content and CTA owner review before soft launch. It documents browser-verified CTA surfaces, remaining owner decisions, and manual Telegram WebView checks without changing active CTA logic."
      metrics={[
        { label: "owner review status", value: model.ownerReviewStatus, tone: "amber" },
        { label: "browser simulation used", value: String(model.browserSimulationUsed), tone: "emerald" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        {
          title: "reviewed CTA surfaces",
          rows: rowsFromItems(model.reviewedSurfaces),
        },
        {
          title: "CTA inventory execution",
          rows: rowsFromItems(model.ctaInventory),
        },
        {
          title: "content inventory owner review",
          rows: rowsFromItems(model.contentInventory),
        },
        {
          title: "browser simulation status",
          rows: rowsFromItems(model.browserSimulationResults),
        },
        {
          title: "startapp CTA status",
          rows: rowsFromItems(model.startappCtaResults),
        },
        {
          title: "VIP preview CTA status",
          rows: rowsFromItems(model.vipPreviewCtaResults),
        },
        {
          title: "result/share CTA status",
          rows: rowsFromItems(model.resultShareCtaResults),
        },
        {
          title: "issues found by severity",
          rows:
            model.issueFindings.length > 0
              ? model.issueFindings.map((finding) => ({
                  area: `[${finding.severity}] ${finding.component}`,
                  status: finding.severity,
                  detail: `${finding.id}: ${finding.description}`,
                  action: finding.remediation,
                }))
              : [
                  {
                    area: "CTA Issues",
                    status: "PASS",
                    detail: "No blocker, high, or medium CTA issues identified.",
                    action: "No action required.",
                  },
                ],
        },
        {
          title: "owner review required items",
          rows: rowsFromList("Owner content approval", "OWNER REVIEW REQUIRED", model.ownerReviewRequiredItems),
        },
        {
          title: "manual required items",
          rows: rowsFromList("Manual execution", "MANUAL REQUIRED", model.manualRequiredItems),
        },
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
        { label: "Content CTA Owner Review Gate", href: "/dashboard/networks/zodiac/content-cta-owner-review-gate" },
        { label: "Telegram WebView Startapp Owner Review Execution", href: "/dashboard/networks/zodiac/telegram-webview-startapp-owner-review-execution" },
        { label: "Owner Manual Real-Device Review Execution", href: "/dashboard/networks/zodiac/owner-manual-real-device-review-execution" },
      ]}
    />
  );
}
