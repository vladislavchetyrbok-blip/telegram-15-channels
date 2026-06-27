import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_VISUAL_FIXES_AFTER_SCREENSHOT_REVIEW_ROUTE,
  getAphroditeVisualFixesAfterScreenshotReview,
} from "@/lib/zodiac/aphrodite-visual-fixes-after-screenshot-review";

const model = getAphroditeVisualFixesAfterScreenshotReview();

export const metadata = {
  title: model.title,
};

export default function VisualFixesAfterScreenshotReviewPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_VISUAL_FIXES_AFTER_SCREENSHOT_REVIEW_ROUTE}
      badge="Aphrodite / Visual fixes after screenshot review"
      description="Package 246 executes visual QA inspection and applies scoped CSS remediations across required mobile viewports (360px, 390px, 430px) and live Mini App screens. Fixes horizontal overflow, button touch targets (>= 48px), and card spacing without changing calculations, active CTA destinations, invoking Telegram API, or adding database writes."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "fixesApplied", value: String(model.fixesApplied.length), tone: "emerald" },
        { label: "issuesDeferred", value: String(model.issuesDeferred.length), tone: "cyan" },
        { label: "nextPackage", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        {
          title: "overviewRows",
          rows: model.overviewRows.map((row) => ({
            area: row.area,
            status: row.status,
            detail: row.detail,
            action: row.ownerAction,
          })),
        },
        {
          title: "executedViewports and inspectedScreens",
          rows: [
            ...model.executedViewports.map((vp) => ({
              area: vp.name,
              status: "PASS",
              detail: `Width: ${vp.width}px. ${vp.notes}`,
              action: "Verify layout in live browser preview.",
            })),
            ...model.inspectedScreens.map((sc) => ({
              area: sc.name,
              status: sc.status,
              detail: `URL: ${sc.url}`,
              action: "Check visual wrapping and CTA positioning.",
            })),
          ],
        },
        {
          title: "visualFindings and fixesApplied",
          rows: [
            ...model.visualFindings.map((vf) => ({
              area: `[${vf.severity}] ${vf.screen} (${vf.viewport})`,
              status: vf.status,
              detail: `${vf.description} -> Remediation: ${vf.remediation}`,
              action: "Confirm remediation resolves defect.",
            })),
            ...model.fixesApplied.map((fix) => ({
              area: `Fix: ${fix.component}`,
              status: "FIXED",
              detail: `Rule: ${fix.cssClassOrRule}. ${fix.targetProblem} (${fix.verificationStatus})`,
              action: "Inspect scoped stylesheet rules.",
            })),
          ],
        },
        {
          title: "issuesDeferred and acceptanceCriteria",
          rows: [
            ...model.issuesDeferred.map((def) => ({
              area: `Deferred [${def.severity}]: ${def.id}`,
              status: "DEFERRED",
              detail: `${def.description} Rationale: ${def.rationale}`,
              action: `Target: ${def.targetPackage}`,
            })),
            ...model.mobileAcceptanceCriteria.map((crit) => ({
              area: `Mobile Criterion: ${crit.criterion}`,
              status: crit.status,
              detail: crit.description,
              action: "Maintain zero overflow across mobile viewports.",
            })),
            ...model.telegramWebViewCriteria.map((twc) => ({
              area: `Telegram WebView: ${twc.criterion}`,
              status: twc.status,
              detail: twc.description,
              action: "Ensure safe-area padding compliance.",
            })),
          ],
        },
        {
          title: "safetyBoundaries and whatWasNotChanged",
          rows: [
            ...model.safetyBoundaries.map((bound, i) => ({
              area: `Safety Boundary #${i + 1}`,
              status: "PASS",
              detail: bound,
              action: "Enforce strict read-only / visual-only constraints.",
            })),
            ...model.whatWasNotChanged.map((exc, i) => ({
              area: `Excluded Scope #${i + 1}`,
              status: "PASS",
              detail: exc,
              action: "No business logic or API mutations allowed.",
            })),
          ],
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Mini App", href: "/miniapp" },
        { label: "Visual QA Screenshot Pack", href: "/dashboard/networks/zodiac/visual-qa-screenshot-pack" },
        { label: "Telegram WebView Mobile Polish", href: "/dashboard/networks/zodiac/telegram-webview-mobile-polish" },
      ]}
    />
  );
}
