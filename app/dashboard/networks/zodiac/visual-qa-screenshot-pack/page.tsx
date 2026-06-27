import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_VISUAL_QA_SCREENSHOT_PACK_ROUTE,
  getAphroditeVisualQaScreenshotPack,
} from "@/lib/zodiac/aphrodite-visual-qa-screenshot-pack";

const model = getAphroditeVisualQaScreenshotPack();

export const metadata = {
  title: model.title,
};

export default function VisualQaScreenshotPackPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_VISUAL_QA_SCREENSHOT_PACK_ROUTE}
      badge="Aphrodite / Visual QA screenshot pack"
      description="Package 245 provides the comprehensive visual QA screenshot pack, checklist, and issue triage protocol across required viewports (360px, 390px, 430px, desktop 1200px) and key user flows. It ensures visual readiness without modifying active CTA logic, redesigning screens, invoking Telegram API, or adding database writes."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "viewports", value: String(model.requiredViewports.length), tone: "violet" },
        { label: "screens", value: String(model.requiredScreens.length), tone: "cyan" },
        { label: "nextPackage", value: model.nextPackageRecommendation, tone: "emerald" },
      ]}
      sections={[
        {
          title: "requiredViewports",
          rows: model.requiredViewports.map((vp) => ({
            area: vp.name,
            status: "READY",
            detail: `${vp.width}x${vp.height}px. ${vp.notes}`,
            action: "Capture screenshot evidence for each required screen.",
          })),
        },
        {
          title: "requiredScreens and requiredStates",
          rows: [
            ...model.requiredScreens.map((sc) => ({
              area: `${sc.name} (${sc.priority})`,
              status: "READY",
              detail: `Route: ${sc.route}. ${sc.description}`,
              action: "Verify layout across all 4 viewports.",
            })),
            ...model.requiredStates.map((st) => ({
              area: `State: ${st.state}`,
              status: "READY",
              detail: `Trigger: ${st.trigger}. ${st.description}`,
              action: "Inspect visual transitions and fallback behavior.",
            })),
          ],
        },
        {
          title: "visualAcceptanceCriteria and telegramWebViewCriteria",
          rows: [
            ...model.visualAcceptanceCriteria.map((crit) => ({
              area: crit.criterion,
              status: "READY",
              detail: `${crit.detail} Method: ${crit.checkMethod}`,
              action: "Enforce zero tolerance for horizontal overflow and tiny touch targets.",
            })),
            ...model.telegramWebViewCriteria.map((tw) => ({
              area: tw.area,
              status: tw.status,
              detail: tw.detail,
              action: tw.ownerAction,
            })),
          ],
        },
        {
          title: "evidenceFields and issueSeverityScale",
          rows: [
            ...model.evidenceFields.map((ev) => ({
              area: `Evidence: ${ev.field} (${ev.required ? "Required" : "Optional"})`,
              status: "DOCUMENTED",
              detail: ev.description,
              action: "Log this metadata for each captured visual evidence artifact.",
            })),
            ...model.issueSeverityScale.map((sev) => ({
              area: `Severity: ${sev.level}`,
              status: sev.level === "BLOCKER" || sev.level === "HIGH" ? "MANUAL REQUIRED" : "DOCUMENTED",
              detail: sev.description,
              action: sev.action,
            })),
          ],
        },
        {
          title: "manualScreenshotChecklist",
          rows: model.manualScreenshotChecklist.map((item) => ({
            area: `${item.id} [${item.viewport}]`,
            status: item.status,
            detail: `${item.screen}: ${item.description}`,
            action: "Execute manual verification during QA run.",
          })),
        },
        {
          title: "whatWasNotChanged and safetyBoundaries",
          rows: [
            ...model.whatWasNotChanged.map((nc) => ({
              area: nc.area,
              status: nc.status,
              detail: nc.detail,
              action: nc.ownerAction,
            })),
            ...model.safetyBoundaries.map((sb) => ({
              area: "Safety Boundary",
              status: "BLOCKED",
              detail: sb,
              action: "Strictly enforce boundary.",
            })),
          ],
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Mini App", href: "/miniapp" },
        { label: "Telegram WebView Mobile Polish", href: "/dashboard/networks/zodiac/telegram-webview-mobile-polish" },
        { label: "Result / Share Cards", href: "/dashboard/networks/zodiac/result-share-cards" },
        { label: "VIP Locked Preview Redesign", href: "/dashboard/networks/zodiac/vip-locked-preview-redesign" },
      ]}
    />
  );
}
