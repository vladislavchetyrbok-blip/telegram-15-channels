import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_PUBLIC_URL_TELEGRAM_SETUP_MANUAL_GATE_ROUTE,
  getAphroditePublicUrlTelegramSetupManualGate,
} from "@/lib/zodiac/aphrodite-public-url-telegram-setup-manual-gate";

const model = getAphroditePublicUrlTelegramSetupManualGate();

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

export default function PublicUrlTelegramSetupManualGatePage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_PUBLIC_URL_TELEGRAM_SETUP_MANUAL_GATE_ROUTE}
      badge="Aphrodite / public URL manual gate"
      description="Manual gate for public HTTPS URL and Telegram Mini App setup. Public URL approval and BotFather setup remain blocked until owner evidence exists."
      metrics={[
        { label: "public URL status", value: model.publicUrlStatus, tone: "rose" },
        { label: "Telegram Mini App URL status", value: model.telegramMiniAppUrlStatus, tone: "rose" },
        { label: "publicUrlApproved", value: model.publicUrlApproved ? "Yes" : "No", tone: "rose" },
        { label: "botFatherSetupDone", value: model.botFatherSetupDone ? "Yes" : "No", tone: "rose" },
        { label: "HTTPS requirement", value: "required", tone: "amber" },
        { label: "required public routes", value: String(model.requiredPublicRoutes.length), tone: "amber" },
        { label: "owner action still required", value: String(model.ownerActionStillRequired), tone: "amber" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        { title: "HTTPS requirement", rows: rows(model.httpsRequirement) },
        { title: "required public routes", rows: rows(model.requiredPublicRoutes) },
        { title: "manual BotFather steps", rows: rows(model.manualBotFatherSteps) },
        { title: "public route verification checklist", rows: rows(model.publicRouteVerificationChecklist) },
        { title: "production blockers", rows: rows(model.unresolvedProductionBlockers) },
        { title: "safety boundaries", rows: rows(model.safetyBoundaries) },
        { title: "what this package does not do", rows: rows(model.whatThisPackageDoesNotDo) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Public URL Telegram Mini App Setup Plan", href: "/dashboard/networks/zodiac/public-url-telegram-miniapp-setup-plan" },
        { label: "Public Mini App Route Shell Isolation", href: "/dashboard/networks/zodiac/public-miniapp-route-shell-isolation" },
        { label: "Backup Freshness Verification", href: "/dashboard/networks/zodiac/backup-freshness-verification" },
        { label: "Release Gate Status Consolidation", href: "/dashboard/networks/zodiac/release-gate-status-consolidation" },
      ]}
    />
  );
}
