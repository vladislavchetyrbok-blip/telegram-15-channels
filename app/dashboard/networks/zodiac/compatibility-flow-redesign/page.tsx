import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_COMPATIBILITY_FLOW_REDESIGN_ROUTE,
  getAphroditeCompatibilityFlowRedesign,
} from "@/lib/zodiac/aphrodite-compatibility-flow-redesign";

const model = getAphroditeCompatibilityFlowRedesign();

export const metadata = {
  title: model.title,
};

export default function CompatibilityFlowRedesignPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_COMPATIBILITY_FLOW_REDESIGN_ROUTE}
      badge="Aphrodite / Compatibility flow"
      description="Package 239 applies the Aphrodite design system to the live compatibility flow: two-person input layout, premium progress and cards, clear date-entry presentation, relationship score/result card, strengths/risks/advice sections, shareable result feeling, and a preview-only VIP locked card. Compatibility calculation logic, zodiac sign logic, Package 224 date formatting, active CTA logic, payments, VIP unlock, Telegram API, DB writes, cron/workflows, publish scripts, secrets, and launch flags were not changed."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "liveRoutes", value: model.liveRoutes.join(" / "), tone: "violet" },
        { label: "date formatting", value: "unchanged", tone: "emerald" },
        { label: "nextPackage", value: model.nextPackageRecommendation, tone: "cyan" },
      ]}
      sections={[
        {
          title: "redesignedSections",
          rows: model.redesignedSections.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "compatibilityInputPrinciples",
          rows: model.compatibilityInputPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "resultPresentationPrinciples",
          rows: model.resultPresentationPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "scoreCardPrinciples",
          rows: model.scoreCardPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "shareableResultPrinciples",
          rows: model.shareableResultPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "vipLockedPreviewPrinciples",
          rows: model.vipLockedPreviewPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "mobileBreakpoints and telegramWebViewRules",
          rows: [
            ...model.mobileBreakpoints.map((breakpoint) => ({
              area: breakpoint,
              status: "MANUAL REQUIRED",
              detail: "Mobile readability target for Package 239.",
              action: "Verify with browser/device screenshots before owner approval.",
            })),
            ...model.telegramWebViewRules.map((item) => ({
              area: item.area,
              status: item.status,
              detail: item.detail,
              action: item.ownerAction,
            })),
          ],
        },
        {
          title: "whatWasNotChanged",
          rows: model.whatWasNotChanged.map((item) => ({
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
            detail: "Forbidden in Package 239.",
            action: "Keep future work in a separately approved package.",
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Compatibility Mini App", href: "/compatibility" },
        { label: "Mini App Home", href: "/miniapp" },
        { label: "Mini App Home Screen Redesign", href: "/dashboard/networks/zodiac/miniapp-home-screen-redesign" },
        { label: "Aphrodite Design System", href: "/dashboard/networks/zodiac/aphrodite-design-system" },
        { label: "Soft Launch Owner Gate", href: "/dashboard/networks/zodiac/soft-launch-owner-go-no-go-gate" },
      ]}
    />
  );
}
