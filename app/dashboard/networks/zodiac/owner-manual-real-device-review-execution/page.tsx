import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_OWNER_MANUAL_REAL_DEVICE_REVIEW_EXECUTION_ROUTE,
  getAphroditeOwnerManualRealDeviceReviewExecution,
} from "@/lib/zodiac/aphrodite-owner-manual-real-device-review-execution";

const model = getAphroditeOwnerManualRealDeviceReviewExecution();

export const metadata = {
  title: model.title,
};

export default function AphroditeOwnerManualRealDeviceReviewExecutionPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_OWNER_MANUAL_REAL_DEVICE_REVIEW_EXECUTION_ROUTE}
      badge="Aphrodite / Real-device review execution"
      description="Execution record for manual review across simulated and real mobile devices. Documents browser simulation pass while keeping real hardware and Telegram WebView checks strictly pending owner physical execution."
      metrics={[
        { label: "owner review status", value: model.ownerReviewStatus, tone: "amber" },
        { label: "public launch approved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "manual review required", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        {
          title: "execution overview",
          rows: model.executedChecks.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.action,
          })),
        },
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
          title: "real device manual requirements",
          rows: model.realDeviceManualRequirements.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.action,
          })),
        },
        {
          title: "telegram webview manual requirements",
          rows: model.telegramWebViewManualRequirements.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.action,
          })),
        },
        {
          title: "flow verification results",
          rows: model.flowResults.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.action,
          })),
        },
        {
          title: "checked urls & viewports",
          rows: [
            ...model.checkedUrls.map((url) => ({
              area: "Checked URL",
              status: "VERIFIED",
              detail: url,
              action: "Verified via local simulation.",
            })),
            ...model.checkedViewports.map((vp) => ({
              area: "Checked Viewport",
              status: "VERIFIED",
              detail: vp,
              action: "Tested layout wrap and spacing.",
            })),
          ],
        },
        {
          title: "issues found by severity",
          rows:
            model.visualFindings.length > 0
              ? model.visualFindings.map((finding) => ({
                  area: `[${finding.severity}] ${finding.component}`,
                  status: finding.severity,
                  detail: `${finding.id}: ${finding.description}`,
                  action: finding.remediation,
                }))
              : [
                  {
                    area: "Visual Findings",
                    status: "PASS",
                    detail: "No blocker, high, or medium visual defects identified during simulation.",
                    action: "Polish items tracked in backlog.",
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
        { label: "Real Device QA Execution Gate", href: "/dashboard/networks/zodiac/real-device-qa-execution-gate" },
        { label: "Owner Manual Review Pack", href: "/dashboard/networks/zodiac/owner-manual-review-pack" },
        { label: "Soft Launch Candidate Report", href: "/dashboard/networks/zodiac/soft-launch-candidate-report" },
      ]}
    />
  );
}
