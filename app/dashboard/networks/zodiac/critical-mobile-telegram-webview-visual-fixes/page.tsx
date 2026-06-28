import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_CRITICAL_MOBILE_TELEGRAM_WEBVIEW_VISUAL_FIXES_ROUTE,
  getAphroditeCriticalMobileTelegramWebviewVisualFixes,
} from "@/lib/zodiac/aphrodite-critical-mobile-telegram-webview-visual-fixes";

const model = getAphroditeCriticalMobileTelegramWebviewVisualFixes();

export const metadata = {
  title: model.title,
};

function rows(items: typeof model.screenshotFindings) {
  return items.map((item) => ({
    area: item.area,
    status: item.status,
    detail: item.detail,
    action: item.ownerAction,
  }));
}

export default function CriticalMobileTelegramWebviewVisualFixesPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_CRITICAL_MOBILE_TELEGRAM_WEBVIEW_VISUAL_FIXES_ROUTE}
      badge="Aphrodite / owner screenshot mobile fix"
      description="Package 267 fixes critical real Android Telegram WebView visual defects from owner screenshots: narrow two-column mobile grids, broken English letter-by-letter wrapping, narrow VIP locked preview cards, huge empty columns, user-facing technical English safety copy, and bottom navigation safe-area readability. It is visual/layout only and does not change calculations, date parsing, Mystic random/storage, active CTA destinations, Telegram API, payments, VIP unlock, DB writes, workflows, secrets, production launch, or launch flags."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "mobile viewports", value: model.mobileViewports.join(" / "), tone: "violet" },
        { label: "live routes", value: String(model.liveRoutes.length), tone: "cyan" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "emerald" },
      ]}
      sections={[
        { title: "screenshotFindings", rows: rows(model.screenshotFindings) },
        { title: "criticalIssues", rows: rows(model.criticalIssues) },
        { title: "fixesApplied", rows: rows(model.fixesApplied) },
        { title: "mobileGridRules", rows: rows(model.mobileGridRules) },
        { title: "vipPreviewRules", rows: rows(model.vipPreviewRules) },
        { title: "userFacingCopyRules", rows: rows(model.userFacingCopyRules) },
        { title: "textWrappingRules", rows: rows(model.textWrappingRules) },
        { title: "telegramWebViewRules", rows: rows(model.telegramWebViewRules) },
        {
          title: "liveRoutes",
          rows: model.liveRoutes.map((route) => ({
            area: route,
            status: "MANUAL REQUIRED",
            detail: "Route included in Package 267 mobile/browser simulation and owner Telegram WebView recheck scope.",
            action: "Verify at 360px, 390px, 430px and then on real Telegram Android WebView.",
          })),
        },
        {
          title: "whatWasNotChanged",
          rows: rows(model.whatWasNotChanged),
        },
        {
          title: "safetyBoundaries",
          rows: model.safetyBoundaries.map((boundary) => ({
            area: boundary,
            status: "BLOCKED",
            detail: "Forbidden in Package 267.",
            action: "Keep blocked unless a separate owner-approved package explicitly changes it.",
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Mini App", href: "/miniapp" },
        { label: "Telegram WebView Mobile Polish", href: "/dashboard/networks/zodiac/telegram-webview-mobile-polish" },
        { label: "Visual Fixes After Screenshot Review", href: "/dashboard/networks/zodiac/visual-fixes-after-screenshot-review" },
        { label: "VIP Locked Preview Redesign", href: "/dashboard/networks/zodiac/vip-locked-preview-redesign" },
        { label: "Result / Share Cards", href: "/dashboard/networks/zodiac/result-share-cards" },
        { label: "Final Pre-Owner-Review Summary", href: "/dashboard/networks/zodiac/final-pre-owner-review-summary" },
      ]}
    />
  );
}
