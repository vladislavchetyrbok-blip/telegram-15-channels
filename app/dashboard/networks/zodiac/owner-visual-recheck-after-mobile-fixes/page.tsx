import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_OWNER_VISUAL_RECHECK_AFTER_MOBILE_FIXES_ROUTE,
  getAphroditeOwnerVisualRecheckAfterMobileFixes,
} from "@/lib/zodiac/aphrodite-owner-visual-recheck-after-mobile-fixes";

const model = getAphroditeOwnerVisualRecheckAfterMobileFixes();

export const metadata = {
  title: model.title,
};

function rows(items: typeof model.checkedScreens) {
  return items.map((item) => ({
    area: item.area,
    status: item.status,
    detail: item.detail,
    action: item.ownerAction,
  }));
}

export default function OwnerVisualRecheckAfterMobileFixesPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_OWNER_VISUAL_RECHECK_AFTER_MOBILE_FIXES_ROUTE}
      badge="Aphrodite / owner visual recheck"
      description="Package 268 records the owner visual recheck after Package 267 mobile fixes. It verifies that cards no longer break into narrow two-column grids on mobile, English text wraps by words rather than letters, VIP locked previews are full width, excessive side columns are removed, user-facing safety copy is localized in Russian, and bottom navigation/safe-area spacing prevent content clipping across 360px, 390px, and 430px viewports. This package is readiness/verification only and does not trigger production launches, Telegram API calls, payments, VIP unlocks, or database writes."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "checked screens", value: String(model.checkedScreens.length), tone: "violet" },
        { label: "checked viewports", value: String(model.checkedViewports.length), tone: "cyan" },
        { label: "next package", value: "Package 269", tone: "emerald" },
      ]}
      sections={[
        { title: "checkedScreens", rows: rows(model.checkedScreens) },
        { title: "checkedViewports", rows: rows(model.checkedViewports) },
        { title: "fixedScreenshotIssues", rows: rows(model.fixedScreenshotIssues) },
        { title: "recheckResults", rows: rows(model.recheckResults) },
        { title: "remainingVisualIssues", rows: rows(model.remainingVisualIssues) },
        { title: "ownerManualRequirements", rows: rows(model.ownerManualRequirements) },
        { title: "telegramWebViewManualRequirements", rows: rows(model.telegramWebViewManualRequirements) },
        { title: "whatWasNotChanged", rows: rows(model.whatWasNotChanged) },
        {
          title: "safetyBoundaries",
          rows: model.safetyBoundaries.map((boundary) => ({
            area: boundary,
            status: "BLOCKED",
            detail: "Forbidden in Package 268.",
            action: "Keep blocked unless a separate owner-approved package explicitly changes it.",
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Mini App", href: "/miniapp" },
        { label: "Critical Mobile Telegram WebView Visual Fixes", href: "/dashboard/networks/zodiac/critical-mobile-telegram-webview-visual-fixes" },
        { label: "Final Pre-Owner-Review Summary", href: "/dashboard/networks/zodiac/final-pre-owner-review-summary" },
        { label: "Visual Fixes After Screenshot Review", href: "/dashboard/networks/zodiac/visual-fixes-after-screenshot-review" },
      ]}
    />
  );
}
