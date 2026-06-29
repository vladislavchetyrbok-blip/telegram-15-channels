import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_PUBLIC_URL_TELEGRAM_MINIAPP_SETUP_PLAN_ROUTE,
  getAphroditePublicUrlTelegramMiniappSetupPlan,
} from "@/lib/zodiac/aphrodite-public-url-telegram-miniapp-setup-plan";

const model = getAphroditePublicUrlTelegramMiniappSetupPlan();

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

export default function PublicUrlTelegramMiniappSetupPlanPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_PUBLIC_URL_TELEGRAM_MINIAPP_SETUP_PLAN_ROUTE}
      badge="Aphrodite / public URL Mini App plan"
      description="Manual plan for choosing a public HTTPS URL and later configuring Telegram Mini App URL without calling Telegram, touching BotFather, sending messages, or exposing dashboard routes."
      metrics={[
        { label: "public URL setup", value: model.publicUrlSetupStatus, tone: "amber" },
        { label: "HTTPS", value: "required", tone: "amber" },
        { label: "BotFather setup", value: model.botFatherSetupStatus, tone: "rose" },
        { label: "route isolation", value: model.routeIsolationStatus, tone: "emerald" },
        { label: "Telegram API used", value: String(model.safetyFlags.telegramApiUsed), tone: "emerald" },
        { label: "messages sent", value: String(model.safetyFlags.messagesSent), tone: "emerald" },
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        { title: "public URL requirements", rows: rows(model.publicUrlRequirements) },
        { title: "Telegram Mini App setup rules", rows: rows(model.telegramMiniAppSetupRules) },
        { title: "required test routes", rows: rows(model.requiredTestRoutes) },
        { title: "route isolation rules", rows: rows(model.routeIsolationRules) },
        { title: "forbidden actions", rows: rows(model.forbiddenActions) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Public Mini App Route Shell Isolation", href: "/dashboard/networks/zodiac/public-miniapp-route-shell-isolation" },
        { label: "Mini App", href: "/miniapp" },
        { label: "Compatibility", href: "/compatibility" },
        { label: "Birth Matrix", href: "/birth-matrix" },
        { label: "VIP Preview", href: "/vip-preview" },
      ]}
    />
  );
}
