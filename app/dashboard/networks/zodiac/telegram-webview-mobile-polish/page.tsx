import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_TELEGRAM_WEBVIEW_MOBILE_POLISH_ROUTE,
  getAphroditeTelegramWebviewMobilePolish,
} from "@/lib/zodiac/aphrodite-telegram-webview-mobile-polish";

const model = getAphroditeTelegramWebviewMobilePolish();

export const metadata = {
  title: model.title,
};

export default function TelegramWebviewMobilePolishPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_TELEGRAM_WEBVIEW_MOBILE_POLISH_ROUTE}
      badge="Aphrodite / Telegram WebView mobile polish"
      description="Package 244 applies visual-only Telegram WebView mobile polish to the Aphrodite Mini App: safe-area spacing, 360px / 390px / 430px readability, touch target sizing, no horizontal overflow, text wrapping, card spacing, and result/share card density. It does not change app flows, active CTA logic, calculations, date parsing, Mystic selection/random/storage, payment, VIP unlock, Telegram API, DB writes, analytics, cron/workflows, publish scripts, secrets, production launch, or launch approval flags."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "breakpoints", value: model.mobileBreakpoints.join(" / "), tone: "violet" },
        { label: "surfaces", value: String(model.polishedSurfaces.length), tone: "cyan" },
        { label: "nextPackage", value: model.nextPackageRecommendation, tone: "emerald" },
      ]}
      sections={[
        {
          title: "polishedSurfaces",
          rows: model.polishedSurfaces.map((item) => ({
            area: `${item.area} (${item.scope})`,
            status: item.status,
            detail: `${item.route} / ${item.file}. ${item.detail}`,
            action: item.ownerAction,
          })),
        },
        {
          title: "mobileBreakpoints and telegramWebViewRules",
          rows: [
            ...model.mobileBreakpoints.map((breakpoint) => ({
              area: breakpoint,
              status: "MANUAL REQUIRED",
              detail: "Mobile readability target for Telegram WebView Mobile Polish.",
              action: "Verify with browser screenshots and real Telegram iOS/Android WebView evidence.",
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
          title: "safeAreaPrinciples",
          rows: model.safeAreaPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "touchTargetPrinciples",
          rows: model.touchTargetPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "overflowPreventionPrinciples",
          rows: model.overflowPreventionPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "typographyWrappingPrinciples",
          rows: model.typographyWrappingPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "componentPolishPrinciples",
          rows: model.componentPolishPrinciples.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
          })),
        },
        {
          title: "smokeSensitiveAreas",
          rows: model.smokeSensitiveAreas.map((item) => ({
            area: item.area,
            status: item.status,
            detail: item.detail,
            action: item.ownerAction,
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
            detail: "Forbidden in Package 244.",
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
        { label: "Result / Share Cards", href: "/dashboard/networks/zodiac/result-share-cards" },
      ]}
    />
  );
}
