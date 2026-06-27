import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_REAL_DEVICE_QA_EXECUTION_GATE_ROUTE,
  getAphroditeRealDeviceQaExecutionGate,
} from "@/lib/zodiac/aphrodite-real-device-qa-execution-gate";

const model = getAphroditeRealDeviceQaExecutionGate();

export const metadata = {
  title: model.title,
};

export default function AphroditeRealDeviceQaExecutionGatePage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_REAL_DEVICE_QA_EXECUTION_GATE_ROUTE}
      badge="Aphrodite / Real-device QA gate"
      description="Manual execution gate for real-device soft-launch QA. Current state remains NOT CHECKED / OWNER REVIEW REQUIRED; no screenshots are faked and no device QA is marked complete automatically."
      metrics={[
        { label: "current state", value: model.currentState, tone: "amber" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "required devices", value: String(model.requiredDevices.length), tone: "cyan" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        {
          title: "required devices",
          rows: model.requiredDevices.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "required viewports",
          rows: model.requiredViewports.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "required flows",
          rows: model.requiredFlows.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "evidence fields",
          rows: model.evidenceFields.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "status values",
          rows: model.statusValues.map((status) => ({
            area: status,
            status,
            detail: "Allowed manual status value for real-device QA evidence.",
            action: "Select manually after real evidence exists; do not auto-fill PASS.",
          })),
        },
        {
          title: "manual rules",
          rows: model.manualRules.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Owner Manual Review Pack", href: "/dashboard/networks/zodiac/owner-manual-review-pack" },
        { label: "Manual Real-Device Evidence Capture", href: "/dashboard/networks/zodiac/manual-real-device-qa-evidence-capture" },
        { label: "Telegram WebView Manual QA", href: "/dashboard/networks/zodiac/telegram-webview-startapp-manual-qa-protocol" },
        { label: "Soft Launch Preflight Checklist", href: "/dashboard/networks/zodiac/soft-launch-preflight-checklist" },
      ]}
    />
  );
}
