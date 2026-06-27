import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_MINIAPP_HOME_SCREEN_REDESIGN_ROUTE,
  getAphroditeMiniappHomeScreenRedesign,
} from "@/lib/zodiac/aphrodite-miniapp-home-screen-redesign";

const model = getAphroditeMiniappHomeScreenRedesign();

export const metadata = {
  title: model.title,
};

export default function MiniappHomeScreenRedesignPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_MINIAPP_HOME_SCREEN_REDESIGN_ROUTE}
      badge="Aphrodite / Mini App visual"
      description="Package 238 applies the Aphrodite design system to the Mini App home/entry screen and the live /compatibility home panel: premium hero, compatibility-first CTA, Birth Matrix and Mystic Cards secondary entries, VIP locked preview, daily/mystic teaser, trust microcopy, and Telegram WebView safe-area spacing. Compatibility, Birth Matrix, Mystic Cards, payments, VIP unlock, Telegram API, DB writes, and launch flags were not changed."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "redesignedRoutes", value: model.redesignedRoutes.join(" / "), tone: "violet" },
        { label: "primaryCTA", value: model.primaryCTA.label, tone: "rose" },
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
          title: "primaryCTA",
          rows: [
            {
              area: model.primaryCTA.label,
              status: model.primaryCTA.status,
              detail: `${model.primaryCTA.destination}: ${model.primaryCTA.detail}`,
              action: `active logic changed: ${String(model.primaryCTA.activeLogicChanged)}`,
            },
          ],
        },
        {
          title: "secondaryCTAs",
          rows: model.secondaryCTAs.map((cta) => ({
            area: cta.label,
            status: cta.status,
            detail: `${cta.destination}: ${cta.detail}`,
            action: `active logic changed: ${String(cta.activeLogicChanged)}`,
          })),
        },
        {
          title: "visualPrinciplesApplied",
          rows: model.visualPrinciplesApplied.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "mobileBreakpoints",
          rows: model.mobileBreakpoints.map((breakpoint) => ({
            area: breakpoint,
            status: "MANUAL REQUIRED",
            detail: "Mobile readability target for Package 238.",
            action: "Verify with browser/device screenshots before owner approval.",
          })),
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
            detail: "Forbidden in Package 238.",
            action: "Keep future work in a separately approved package.",
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Mini App Home", href: "/miniapp" },
        { label: "Compatibility Mini App", href: "/compatibility" },
        { label: "Aphrodite Design System", href: "/dashboard/networks/zodiac/aphrodite-design-system" },
        { label: "Visual Design Audit", href: "/dashboard/networks/zodiac/aphrodite-miniapp-visual-design-audit" },
        { label: "Soft Launch Owner Gate", href: "/dashboard/networks/zodiac/soft-launch-owner-go-no-go-gate" },
      ]}
    />
  );
}
