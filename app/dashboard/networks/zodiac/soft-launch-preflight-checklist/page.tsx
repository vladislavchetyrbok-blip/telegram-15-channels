import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_SOFT_LAUNCH_PREFLIGHT_CHECKLIST_ROUTE,
  getAphroditeSoftLaunchPreflightChecklist,
} from "@/lib/zodiac/aphrodite-soft-launch-preflight-checklist";

const model = getAphroditeSoftLaunchPreflightChecklist();

export const metadata = {
  title: model.title,
};

export default function AphroditeSoftLaunchPreflightChecklistPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_SOFT_LAUNCH_PREFLIGHT_CHECKLIST_ROUTE}
      badge="Aphrodite / Soft launch preflight"
      description="Owner-facing preflight checklist for a future limited soft launch. It lists required checks and blockers, but does not launch, configure env, send Telegram messages, or grant approval."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "production env", value: "MANUAL REQUIRED", tone: "amber" },
        { label: "real-device QA", value: "MANUAL REQUIRED", tone: "amber" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        {
          title: "code checks",
          rows: model.codeChecks.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "production env",
          rows: model.productionEnv.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "backup/restore",
          rows: model.backupRestore.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "real-device QA",
          rows: model.realDeviceQa.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "Telegram WebView/startapp QA",
          rows: model.telegramWebviewStartappQa.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "content/CTA owner review",
          rows: model.contentCtaOwnerReview.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "safety",
          rows: model.safetyChecks.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "stop conditions",
          rows: model.stopConditions.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "relevant package QA scripts",
          rows: model.relevantPackageQaScripts.map((script) => ({
            area: script,
            status: "PASS EXPECTED",
            detail: "Required preflight QA command.",
            action: "Run and record PASS before any future limited soft launch.",
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Soft Launch Scope Selector", href: "/dashboard/networks/zodiac/soft-launch-scope-selector" },
        { label: "Soft Launch Owner Go/No-Go", href: "/dashboard/networks/zodiac/soft-launch-owner-go-no-go-gate" },
        { label: "Telegram WebView Manual QA", href: "/dashboard/networks/zodiac/telegram-webview-startapp-manual-qa-protocol" },
        { label: "Backup Freshness Protocol", href: "/dashboard/networks/zodiac/backup-freshness-verification-protocol" },
      ]}
    />
  );
}
