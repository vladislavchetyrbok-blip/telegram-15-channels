import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_MANUAL_REAL_DEVICE_QA_EVIDENCE_CAPTURE_ROUTE,
  getAphroditeManualRealDeviceQaEvidenceCapture,
} from "@/lib/zodiac/aphrodite-manual-real-device-qa-evidence-capture";

const model = getAphroditeManualRealDeviceQaEvidenceCapture();

export const metadata = {
  title: model.title,
};

export default function AphroditeManualRealDeviceQaEvidenceCapturePage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_MANUAL_REAL_DEVICE_QA_EVIDENCE_CAPTURE_ROUTE}
      badge="Aphrodite / Real-device evidence"
      description="Manual evidence capture flow for real-device QA. It lists devices, fields, screenshots and Mini App flows that the owner must check without marking anything completed automatically."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "device evidence targets", value: String(model.deviceEvidenceTargets.length), tone: "cyan" },
        { label: "manual evidence fields", value: String(model.manualEvidenceFields.length), tone: "amber" },
        { label: "automaticPassClaimsAdded", value: String(model.safetyFlags.automaticPassClaimsAdded), tone: "emerald" },
      ]}
      sections={[
        {
          title: "device evidence targets",
          rows: model.deviceEvidenceTargets.map((target) => ({
            area: target.area,
            status: target.status,
            detail: `${target.severity}: ${target.evidenceNeeded}`,
            action: target.ownerAction,
          })),
        },
        {
          title: "manual evidence fields",
          rows: model.manualEvidenceFields.map((field) => ({
            area: field.label,
            status: field.status,
            detail: field.expectedEntry,
            action: "Owner fills this field manually; the dashboard does not complete it.",
          })),
        },
        {
          title: "Mini App flow evidence targets",
          rows: model.miniAppFlowEvidenceTargets.map((target) => ({
            area: target.area,
            status: target.status,
            detail: `${target.severity}: ${target.evidenceNeeded}`,
            action: target.ownerAction,
          })),
        },
        {
          title: "status and severity legend",
          rows: [
            ...model.statuses.map((status) => ({
              area: `status: ${status}`,
              status: status === "PASS" ? "MANUAL REQUIRED" : status,
              detail: "Status value is available for owner manual entry only.",
              action: "Do not mark PASS automatically.",
            })),
            ...model.severities.map((severity) => ({
              area: `severity: ${severity}`,
              status: "MANUAL REQUIRED",
              detail: "Severity value is available for owner manual triage.",
              action: "Owner selects severity after checking real evidence.",
            })),
          ],
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Real Device QA Execution Pack", href: "/dashboard/networks/zodiac/real-device-qa-execution-pack" },
        { label: "Real Device Visual QA", href: "/dashboard/networks/zodiac/real-device-visual-qa-checklist" },
        { label: "Telegram WebView Diagnostics", href: "/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics" },
      ]}
    />
  );
}
