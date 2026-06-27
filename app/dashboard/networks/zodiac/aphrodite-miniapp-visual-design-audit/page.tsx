import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_MINIAPP_VISUAL_DESIGN_AUDIT_ROUTE,
  getAphroditeMiniAppVisualDesignAudit,
} from "@/lib/zodiac/aphrodite-miniapp-visual-design-audit";

const model = getAphroditeMiniAppVisualDesignAudit();

export const metadata = {
  title: model.title,
};

export default function AphroditeMiniAppVisualDesignAuditPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_MINIAPP_VISUAL_DESIGN_AUDIT_ROUTE}
      badge="Aphrodite / Visual design audit"
      description="Design-audit and design-direction package for the user-facing Aphrodite/Zodiac Mini App. It documents current visual status, screen-by-screen findings, risks, principles, and the Package 237-245 redesign roadmap without changing Mini App screens."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "auditedScreens", value: String(model.auditedScreens.length), tone: "cyan" },
        { label: "mobileBreakpoints", value: model.mobileBreakpoints.join(" / "), tone: "violet" },
        { label: "miniAppScreensRedesigned", value: String(model.safetyFlags.miniAppScreensRedesigned), tone: "emerald" },
      ]}
      sections={[
        {
          title: "current Mini App visual status",
          rows: model.currentVisualStatus.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "screen-by-screen findings",
          rows: model.auditedScreens.map((item) => ({
            area: item.area,
            status: item.status,
            detail: `${item.detail} Route: ${item.route}. Files: ${item.sourceFiles.join(", ")}.`,
            action: item.ownerAction,
          })),
        },
        {
          title: "top UX/design issues",
          rows: model.designFindings.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "visual risks",
          rows: model.visualRisks.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "recommended design principles",
          rows: model.recommendedDesignPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "prioritized redesign roadmap",
          rows: model.prioritizedRedesignPackages.map((item) => ({
            area: `Package ${item.packageNumber} - ${item.title}`,
            status: "DOCUMENTED",
            detail: `${item.priority}: ${item.scope}`,
            action: "Implement only when that package is explicitly requested.",
          })),
        },
        {
          title: "safety boundaries",
          rows: model.safetyBoundaries.map((boundary) => ({
            area: boundary,
            status: "BLOCKED",
            detail: "Forbidden in Package 236.",
            action: "Keep this package audit-only.",
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Soft Launch Owner Gate", href: "/dashboard/networks/zodiac/soft-launch-owner-go-no-go-gate" },
        { label: "Launch Simulation Status", href: "/dashboard/networks/zodiac/launch-simulation-status-report" },
        { label: "Mini App Visual QA Consolidation", href: "/dashboard/networks/zodiac/miniapp-visual-qa-consolidation" },
      ]}
    />
  );
}
