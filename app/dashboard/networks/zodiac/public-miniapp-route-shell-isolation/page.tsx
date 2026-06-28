import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_PUBLIC_MINIAPP_ROUTE_SHELL_ISOLATION_ROUTE,
  getAphroditePublicMiniappRouteShellIsolation,
} from "@/lib/zodiac/aphrodite-public-miniapp-route-shell-isolation";

const model = getAphroditePublicMiniappRouteShellIsolation();

export const metadata = {
  title: model.title,
};

export default function PublicMiniappRouteShellIsolationPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_PUBLIC_MINIAPP_ROUTE_SHELL_ISOLATION_ROUTE}
      badge="Mini App / public shell isolation"
      description="Package 271 removes internal dashboard shell chrome from public Telegram Mini App routes by routing them through one public route classifier. Dashboard, admin, auth, CTA logic, payments, VIP, Telegram API, DB, cron/workflows, secrets, and launch flags are unchanged."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "publicNoShellRoutes", value: String(model.publicNoShellRoutes.length), tone: "cyan" },
        { label: "dashboardShellRoutes", value: String(model.dashboardShellRoutes.length), tone: "violet" },
        { label: "nextPackage", value: model.nextPackageRecommendation, tone: "emerald" },
      ]}
      sections={[
        { title: "blockerSummary", rows: model.blockerSummary.map(toRow) },
        { title: "publicNoShellRoutes", rows: model.publicNoShellRoutes.map(toRow) },
        { title: "dashboardShellRoutes", rows: model.dashboardShellRoutes.map(toRow) },
        { title: "helperRules", rows: model.helperRules.map(toRow) },
        {
          title: "forbiddenAdminTermsOnPublicRoutes",
          rows: model.forbiddenAdminTermsOnPublicRoutes.map((term) => ({
            area: term,
            status: "BLOCKED",
            detail: "This admin/internal marker must not appear on public Mini App routes.",
            action: "Investigate shell isolation if this appears in /miniapp, /birth-matrix, VIP preview, or compatibility.",
          })),
        },
        { title: "manualVerificationRoutes", rows: model.manualVerificationRoutes.map(toRow) },
        { title: "whatWasNotChanged", rows: model.whatWasNotChanged.map(toRow) },
        {
          title: "safetyBoundaries",
          rows: model.safetyBoundaries.map((boundary) => ({
            area: boundary,
            status: "BLOCKED",
            detail: "Forbidden in Package 271.",
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
        { label: "VIP Compatibility Report", href: "/vip-compatibility-report" },
        { label: "Zodiac Dashboard", href: "/dashboard/networks/zodiac" },
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
