import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_RESULT_SHARE_CARDS_ROUTE,
  getAphroditeResultShareCards,
} from "@/lib/zodiac/aphrodite-result-share-cards";

const model = getAphroditeResultShareCards();

export const metadata = {
  title: model.title,
};

export default function ResultShareCardsPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_RESULT_SHARE_CARDS_ROUTE}
      badge="Aphrodite / result share cards"
      description="Package 243 adds a visual-only Result / Share Cards layer across compatibility, Birth Matrix, Mystic Cards, VIP Natal, and preview-only VIP surfaces. It uses existing result data and a shared presentational card; no real Telegram share/send API, canvas export, external image generation, payment, VIP unlock, DB write, external analytics, active CTA logic change, or production launch was added."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "liveRoutes", value: model.liveRoutes.join(" / "), tone: "violet" },
        { label: "surfaces", value: String(model.redesignedSurfaces.length), tone: "cyan" },
        { label: "nextPackage", value: model.nextPackageRecommendation, tone: "emerald" },
      ]}
      sections={[
        {
          title: "redesignedSurfaces",
          rows: model.redesignedSurfaces.map((item) => ({
            area: `${item.area} (${item.scope})`,
            status: item.status,
            detail: `${item.route} / ${item.file}. ${item.detail}`,
            action: item.ownerAction,
          })),
        },
        {
          title: "resultCardPrinciples",
          rows: model.resultCardPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "shareCardPrinciples",
          rows: model.shareCardPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "compatibilityResultCardPrinciples",
          rows: model.compatibilityResultCardPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "birthMatrixResultCardPrinciples",
          rows: model.birthMatrixResultCardPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "mysticResultCardPrinciples",
          rows: model.mysticResultCardPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "vipPreviewResultPrinciples",
          rows: model.vipPreviewResultPrinciples.map((item) => ({
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
              detail: "Mobile readability target for Package 243 result/share cards.",
              action: "Verify with local browser and real Telegram WebView screenshots.",
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
            detail: "Forbidden in Package 243.",
            action: "Keep this blocked unless a separate owner-approved package explicitly changes it.",
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Mini App", href: "/miniapp" },
        { label: "Compatibility Flow Redesign", href: "/dashboard/networks/zodiac/compatibility-flow-redesign" },
        { label: "Birth Matrix / Natal Flow Redesign", href: "/dashboard/networks/zodiac/birth-matrix-natal-flow-redesign" },
        { label: "Mystic Cards Redesign", href: "/dashboard/networks/zodiac/mystic-cards-redesign" },
        { label: "VIP Locked Preview Redesign", href: "/dashboard/networks/zodiac/vip-locked-preview-redesign" },
        { label: "Aphrodite Design System", href: "/dashboard/networks/zodiac/aphrodite-design-system" },
      ]}
    />
  );
}
