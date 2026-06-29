import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import { getAphroditeRealDeviceVipPreviewDensityFix } from "@/lib/zodiac/aphrodite-real-device-vip-preview-density-fix";

const model = getAphroditeRealDeviceVipPreviewDensityFix();

export const metadata = {
  title: model.title,
};

function rows(items: readonly { area: string; status: string; detail: string; ownerAction: string }[]) {
  return items.map((item) => ({
    area: item.area,
    status: item.status,
    detail: item.detail,
    action: item.ownerAction,
  }));
}

export default function RealDeviceVipPreviewDensityFixPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={model.route}
      badge="Aphrodite / real-device visual fix"
      description="Package 303 records the real-device VIP preview density fix: 30-day compatibility cards are compacted, repeated disclaimer copy is shown once, and Russian preview wording is clearer. It does not change calculations, routes, payment, VIP access, DB writes, Telegram, BotFather, cron/workflows, secrets, production launch, or launch flags."
      metrics={[
        { label: "densityFixStatus", value: model.densityFixStatus, tone: "emerald" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "softLaunchStatus", value: model.softLaunchStatusNo, tone: "rose" },
        { label: "blockersRemainOpen", value: String(model.blockersRemainOpen), tone: "rose" },
      ]}
      sections={[
        { title: "owner screenshot issues", rows: rows(model.ownerScreenshotIssues) },
        { title: "VIP preview density rules", rows: rows(model.vipPreviewDensityRules) },
        { title: "compact day card rules", rows: rows(model.compactDayCardRules) },
        { title: "Russian preview copy rules", rows: rows(model.russianPreviewCopyRules) },
        { title: "affected screens", rows: rows(model.affectedScreens) },
        { title: "safety boundaries", rows: rows(model.safetyBoundaries) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Manual Evidence Readiness Summary", href: "/dashboard/networks/zodiac/manual-evidence-readiness-summary" },
        { label: "Soft Launch Candidate Go/No-Go", href: "/dashboard/networks/zodiac/soft-launch-candidate-go-no-go-record" },
        { label: "VIP превью", href: "/vip-preview" },
        { label: "Compatibility", href: "/compatibility" },
      ]}
    />
  );
}
