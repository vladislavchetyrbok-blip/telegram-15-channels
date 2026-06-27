import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_VIP_LOCKED_PREVIEW_REDESIGN_ROUTE,
  getAphroditeVipLockedPreviewRedesign,
} from "@/lib/zodiac/aphrodite-vip-locked-preview-redesign";

const model = getAphroditeVipLockedPreviewRedesign();

export const metadata = {
  title: model.title,
};

export default function VipLockedPreviewRedesignPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_VIP_LOCKED_PREVIEW_REDESIGN_ROUTE}
      badge="Aphrodite / VIP locked preview"
      description="Package 242 applies a unified Aphrodite locked-preview layer across the Mini App home, compatibility, Birth Matrix, Mystic Cards, VIP Natal, and safe VIP preview pages. It is preview-only visual/UX work: no active payment, no VIP unlock, no entitlement bypass, no Telegram API, no DB write, no external analytics, no active CTA logic change, and no production launch."
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
          title: "vipPreviewPrinciples",
          rows: model.vipPreviewPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "lockedStatePrinciples",
          rows: model.lockedStatePrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "valueLadderPreview",
          rows: model.valueLadderPreview.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "safetyCopy",
          rows: model.safetyCopy.map((item) => ({
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
              detail: "Mobile readability target for Package 242.",
              action: "Verify with real screenshots before owner approval.",
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
            detail: "Forbidden in Package 242.",
            action: "Keep this blocked until a separately approved package.",
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
        { label: "Aphrodite Design System", href: "/dashboard/networks/zodiac/aphrodite-design-system" },
      ]}
    />
  );
}
