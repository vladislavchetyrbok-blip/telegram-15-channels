import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import { AphroditeDesignSystemShowcase } from "@/components/zodiac-mini-app/aphrodite-design-system";
import {
  APHRODITE_DESIGN_SYSTEM_ROUTE,
  getAphroditeDesignSystem,
} from "@/lib/zodiac/aphrodite-design-system";

const model = getAphroditeDesignSystem();

export const metadata = {
  title: model.title,
};

export default function AphroditeDesignSystemPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_DESIGN_SYSTEM_ROUTE}
      badge="Aphrodite / Design system"
      description="Package 237 creates the Aphrodite Mini App design-system foundation: premium, mystical, romantic, modern, mobile-first tokens, dark cosmic base, glass-like cards, rose/violet/gold accents, and reusable presentational primitives for future Packages 238-245. It does not redesign live Mini App screens."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "brandMood", value: "premium mystical romantic modern", tone: "violet" },
        { label: "mobileBreakpoints", value: model.mobileBreakpoints.join(" / "), tone: "cyan" },
        { label: "miniAppScreensRedesigned", value: String(model.safetyFlags.miniAppScreensRedesigned), tone: "emerald" },
      ]}
      sections={[
        {
          title: "brandMood",
          rows: model.brandMood.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "colorTokens",
          rows: model.colorTokens.map((item) => ({
            area: item.name,
            status: "DOCUMENTED",
            detail: `${item.value}: ${item.usage}`,
            action: "Use as Package 237 token reference only.",
          })),
        },
        {
          title: "gradientTokens",
          rows: model.gradientTokens.map((item) => ({
            area: item.name,
            status: "DOCUMENTED",
            detail: `${item.value}: ${item.usage}`,
            action: "Apply in future package only after explicit package start.",
          })),
        },
        {
          title: "cardStyles and buttonStyles",
          rows: [...model.cardStyles, ...model.buttonStyles].map((item) => ({
            area: item.name,
            status: "DOCUMENTED",
            detail: `${item.value}: ${item.usage}`,
            action: "Presentational style only; active CTA logic was not changed.",
          })),
        },
        {
          title: "typographyScale and spacingRules",
          rows: [
            ...model.typographyScale.map((item) => ({
              area: item.name,
              status: "DOCUMENTED",
              detail: `${item.value}: ${item.usage}`,
              action: "Keep Russian text readable on mobile.",
            })),
            ...model.spacingRules.map((item) => ({
              area: item.area,
              status: item.status,
              detail: item.detail,
              action: item.ownerAction,
            })),
          ],
        },
        {
          title: "telegramWebViewSafeAreaRules",
          rows: model.telegramWebViewSafeAreaRules.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "componentPrinciples",
          rows: model.componentPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "resultCardPrinciples / vipLockedPreviewPrinciples / mysticCardPrinciples",
          rows: [
            ...model.resultCardPrinciples,
            ...model.vipLockedPreviewPrinciples,
            ...model.mysticCardPrinciples,
          ].map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "accessibilityReadabilityConstraints",
          rows: model.accessibilityReadabilityConstraints.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "safetyBoundaries",
          rows: model.safetyBoundaries.map((boundary) => ({
            area: boundary,
            status: "BLOCKED",
            detail: "Forbidden in Package 237.",
            action: "Keep this package design-system-only.",
          })),
        },
        {
          title: "nextPackageUsage",
          rows: model.nextPackageUsage.map((item) => ({
            area: `Package ${item.packageNumber} - ${item.title}`,
            status: item.status,
            detail: item.usage,
            action: item.boundary,
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Aphrodite Mini App Visual Design Audit", href: "/dashboard/networks/zodiac/aphrodite-miniapp-visual-design-audit" },
        { label: "Launch Simulation Status", href: "/dashboard/networks/zodiac/launch-simulation-status-report" },
        { label: "Soft Launch Owner Gate", href: "/dashboard/networks/zodiac/soft-launch-owner-go-no-go-gate" },
      ]}
    >
      <AphroditeDesignSystemShowcase model={model} />
    </AphroditeReadinessPage>
  );
}
