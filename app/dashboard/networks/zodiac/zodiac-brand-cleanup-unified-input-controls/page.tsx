import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_ZODIAC_BRAND_CLEANUP_UNIFIED_INPUT_CONTROLS_ROUTE,
  getAphroditeZodiacBrandCleanupUnifiedInputControls,
} from "@/lib/zodiac/aphrodite-zodiac-brand-cleanup-unified-input-controls";

const model = getAphroditeZodiacBrandCleanupUnifiedInputControls();

export const metadata = {
  title: model.title,
};

export default function ZodiacBrandCleanupUnifiedInputControlsPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_ZODIAC_BRAND_CLEANUP_UNIFIED_INPUT_CONTROLS_ROUTE}
      badge="Zodiac / brand cleanup / unified inputs"
      description="Package 270 removes user-facing Aphrodite/design labels from live Mini App copy, fixes the bottom nav Прогноз label, compacts large mobile catalogs, and standardizes date/time/city inputs without changing calculations, routes, CTA logic, payments, VIP, Telegram API, DB, cron/workflows, secrets, or launch flags."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "cities", value: String(model.citySuggestionList.length), tone: "cyan" },
        { label: "affectedFlows", value: String(model.affectedFlows.length), tone: "violet" },
        { label: "nextPackage", value: model.nextPackageRecommendation, tone: "emerald" },
      ]}
      sections={[
        { title: "userFacingBrandRules", rows: model.userFacingBrandRules.map(toRow) },
        { title: "removedUserFacingAphroditeLabels", rows: model.removedUserFacingAphroditeLabels.map(toRow) },
        { title: "removedEnglishLabels", rows: model.removedEnglishLabels.map(toRow) },
        { title: "bottomNavFix", rows: model.bottomNavFix.map(toRow) },
        { title: "compactCatalogRules", rows: model.compactCatalogRules.map(toRow) },
        { title: "unifiedDateInputRules", rows: model.unifiedDateInputRules.map(toRow) },
        { title: "unifiedTimeInputRules", rows: model.unifiedTimeInputRules.map(toRow) },
        { title: "unifiedCityInputRules", rows: model.unifiedCityInputRules.map(toRow) },
        {
          title: "citySuggestionList",
          rows: model.citySuggestionList.map((city) => ({
            area: city,
            status: "READY",
            detail: "Local static city autocomplete suggestion.",
            action: "Owner can verify it appears in city fields; manual fallback remains available.",
          })),
        },
        { title: "affectedFlows", rows: model.affectedFlows.map(toRow) },
        { title: "whatWasNotChanged", rows: model.whatWasNotChanged.map(toRow) },
        {
          title: "safetyBoundaries",
          rows: model.safetyBoundaries.map((boundary) => ({
            area: boundary,
            status: "BLOCKED",
            detail: "Forbidden in Package 270.",
            action: "Keep blocked unless a future owner-approved package explicitly changes it.",
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Mini App", href: "/miniapp" },
        { label: "Compatibility", href: "/compatibility" },
        { label: "Birth Matrix", href: "/birth-matrix" },
        { label: "VIP Preview", href: "/vip-preview" },
        { label: "Critical Mobile WebView Fixes", href: "/dashboard/networks/zodiac/critical-mobile-telegram-webview-visual-fixes" },
        { label: "Owner Visual Recheck", href: "/dashboard/networks/zodiac/owner-visual-recheck-after-mobile-fixes" },
      ]}
    />
  );
}

function toRow(row: {
  area: string;
  status: string;
  detail: string;
  ownerAction: string;
}) {
  return {
    area: row.area,
    status: row.status,
    detail: row.detail,
    action: row.ownerAction,
  };
}
