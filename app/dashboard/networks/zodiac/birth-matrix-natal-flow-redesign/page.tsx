import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_BIRTH_MATRIX_NATAL_FLOW_REDESIGN_ROUTE,
  getAphroditeBirthMatrixNatalFlowRedesign,
} from "@/lib/zodiac/aphrodite-birth-matrix-natal-flow-redesign";

const model = getAphroditeBirthMatrixNatalFlowRedesign();

export const metadata = {
  title: model.title,
};

export default function BirthMatrixNatalFlowRedesignPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_BIRTH_MATRIX_NATAL_FLOW_REDESIGN_ROUTE}
      badge="Aphrodite / Birth Matrix Natal flow"
      description="Package 240 applies the Aphrodite design system to the live Birth Matrix / Natal / birth profile flow: clearer birth-date input explanation, personal energy report hierarchy, premium matrix metric cards, natal report structure, strengths/risks/purpose/relationship/money blocks where existing data exists, and preview-only Pro locked cards. Birth Matrix/Natal calculation logic, zodiac sign logic, Package 224 date formatting, active CTA logic, payments, VIP unlock, Telegram API, DB writes, cron/workflows, publish scripts, secrets, and launch flags were not changed."
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
          title: "birthMatrixInputPrinciples",
          rows: model.birthMatrixInputPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "natalResultPresentationPrinciples",
          rows: model.natalResultPresentationPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "energyCardPrinciples",
          rows: model.energyCardPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "personalReportPrinciples",
          rows: model.personalReportPrinciples.map((item) => ({
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
              detail: "Mobile readability target for Package 240.",
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
            detail: "Forbidden in Package 240.",
            action: "Keep future work in a separately approved package.",
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Birth Matrix", href: "/birth-matrix" },
        { label: "Mini App Home", href: "/miniapp" },
        { label: "Compatibility Flow Redesign", href: "/dashboard/networks/zodiac/compatibility-flow-redesign" },
        { label: "Aphrodite Design System", href: "/dashboard/networks/zodiac/aphrodite-design-system" },
        { label: "Soft Launch Owner Gate", href: "/dashboard/networks/zodiac/soft-launch-owner-go-no-go-gate" },
      ]}
    />
  );
}
