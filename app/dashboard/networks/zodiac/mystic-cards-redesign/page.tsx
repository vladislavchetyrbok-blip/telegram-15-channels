import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_MYSTIC_CARDS_REDESIGN_ROUTE,
  getAphroditeMysticCardsRedesign,
} from "@/lib/zodiac/aphrodite-mystic-cards-redesign";

const model = getAphroditeMysticCardsRedesign();

export const metadata = {
  title: model.title,
};

export default function MysticCardsRedesignPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_MYSTIC_CARDS_REDESIGN_ROUTE}
      badge="Aphrodite / Mystic Cards flow"
      description="Package 241 applies the Aphrodite design system to the live Mini App Mystic Cards flow: premium closed-card selection, Tarot/Rune reveal hierarchy, card meaning / interpretation blocks, daily/love/money/warning lanes where existing data exists, and preview-only deeper Mystic Reading locked cards. Mystic Cards selection logic, randomness/determinism, storage logic, active CTA destinations, payments, VIP unlock, Telegram API, DB writes, cron/workflows, publish scripts, secrets, and launch flags were not changed."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "liveRoutes", value: model.liveRoutes.join(" / "), tone: "violet" },
        { label: "logic", value: "unchanged", tone: "emerald" },
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
          title: "mysticCardSelectionPrinciples",
          rows: model.mysticCardSelectionPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "mysticRevealPrinciples",
          rows: model.mysticRevealPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "cardStatePrinciples",
          rows: model.cardStatePrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "resultInterpretationPrinciples",
          rows: model.resultInterpretationPrinciples.map((item) => ({
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
              detail: "Mobile readability target for Package 241.",
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
            detail: "Forbidden in Package 241.",
            action: "Keep future work in a separately approved package.",
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Mini App", href: "/miniapp" },
        { label: "Mini App startapp=mystic", href: "/miniapp?startapp=mystic" },
        { label: "Birth Matrix / Natal Flow Redesign", href: "/dashboard/networks/zodiac/birth-matrix-natal-flow-redesign" },
        { label: "Compatibility Flow Redesign", href: "/dashboard/networks/zodiac/compatibility-flow-redesign" },
        { label: "Aphrodite Design System", href: "/dashboard/networks/zodiac/aphrodite-design-system" },
      ]}
    />
  );
}
