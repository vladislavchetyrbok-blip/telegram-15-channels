import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_OWNER_REVIEW_EXECUTION_ROUTE,
  getAphroditeTelegramWebviewStartappOwnerReviewExecution,
} from "@/lib/zodiac/aphrodite-telegram-webview-startapp-owner-review-execution";

const model = getAphroditeTelegramWebviewStartappOwnerReviewExecution();

export const metadata = {
  title: model.title,
};

export default function AphroditeTelegramWebviewStartappOwnerReviewExecutionPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_OWNER_REVIEW_EXECUTION_ROUTE}
      badge="Aphrodite / Telegram WebView review execution"
      description="Execution record for Telegram WebView startapp routing, deep-link handling, and browser fallback behavior. Documents browser simulation pass while keeping real Telegram clients and BotFather setup strictly pending owner execution."
      metrics={[
        { label: "owner review status", value: model.ownerReviewStatus, tone: "amber" },
        { label: "public launch approved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "manual review required", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        {
          title: "browser simulation results",
          rows: model.browserSimulationResults.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.action,
          })),
        },
        {
          title: "telegram ios webview status",
          rows: model.telegramIosWebViewRequirements.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.action,
          })),
        },
        {
          title: "telegram android webview status",
          rows: model.telegramAndroidWebViewRequirements.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.action,
          })),
        },
        {
          title: "botfather manual requirements",
          rows: model.botFatherManualRequirements.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.action,
          })),
        },
        {
          title: "initdata & sdk bridge manual checks",
          rows: [
            ...model.initDataManualChecks.map((item) => ({
              area: item.area,
              status: item.status,
              detail: item.detail,
              action: item.action,
            })),
            ...model.readyExpandBackHapticsChecks.map((item) => ({
              area: item.area,
              status: item.status,
              detail: item.detail,
              action: item.action,
            })),
            ...model.cacheLiveMarkerChecks.map((item) => ({
              area: item.area,
              status: item.status,
              detail: item.detail,
              action: item.action,
            })),
          ],
        },
        {
          title: "fallback behavior status",
          rows: model.fallbackBehaviorChecks.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.action,
          })),
        },
        {
          title: "checked startapp urls",
          rows: model.checkedBrowserStartappUrls.map((url) => ({
            area: "Startapp URL",
            status: "VERIFIED",
            detail: url,
            action: "Tested via local simulation.",
          })),
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
                    area: "Startapp Issues",
                    status: "PASS",
                    detail: "No blocker, high, or medium routing issues identified.",
                    action: "No action required.",
                  },
                ],
        },
        {
          title: "what was not changed",
          rows: model.whatWasNotChanged.map((item) => ({
            area: "Safety Scope",
            status: "UNCHANGED",
            detail: item,
            action: "Strictly enforced boundary.",
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Telegram WebView Startapp Manual QA Protocol", href: "/dashboard/networks/zodiac/telegram-webview-startapp-manual-qa-protocol" },
        { label: "Telegram WebView Startapp Diagnostics", href: "/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics" },
        { label: "Owner Manual Real-Device Review Execution", href: "/dashboard/networks/zodiac/owner-manual-real-device-review-execution" },
      ]}
    />
  );
}
