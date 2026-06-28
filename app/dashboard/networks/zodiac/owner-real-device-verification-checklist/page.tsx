import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_OWNER_REAL_DEVICE_VERIFICATION_CHECKLIST_ROUTE,
  getAphroditeOwnerRealDeviceVerificationChecklist,
} from "@/lib/zodiac/aphrodite-owner-real-device-verification-checklist";

const model = getAphroditeOwnerRealDeviceVerificationChecklist();

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

export default function OwnerRealDeviceVerificationChecklistPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_OWNER_REAL_DEVICE_VERIFICATION_CHECKLIST_ROUTE}
      badge="Aphrodite / owner real device QA"
      description="Owner checklist for Android and iPhone Telegram WebView verification across public routes, input behavior, visual shell boundaries, and locked VIP/payment safety."
      metrics={[
        { label: "owner real-device approval", value: String(model.ownerRealDeviceApproval), tone: "rose" },
        { label: "Android WebView", value: "manual required", tone: "amber" },
        { label: "iPhone WebView", value: "manual required", tone: "amber" },
        { label: "public routes", value: String(model.publicRouteChecks.length), tone: "cyan" },
        { label: "payment added", value: String(model.safetyFlags.paymentAdded), tone: "emerald" },
        { label: "VIP unlock added", value: String(model.safetyFlags.vipUnlockAdded), tone: "emerald" },
        { label: "Telegram send", value: String(model.safetyFlags.messagesSent), tone: "emerald" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "next package", value: model.nextPackageRecommendation, tone: "violet" },
      ]}
      sections={[
        { title: "device matrix", rows: rows(model.deviceMatrix) },
        { title: "public route checks", rows: rows(model.publicRouteChecks) },
        { title: "input behavior checks", rows: rows(model.inputBehaviorChecks) },
        { title: "visual shell checks", rows: rows(model.visualShellChecks) },
        { title: "forbidden outcome checks", rows: rows(model.forbiddenOutcomeChecks) },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "Owner Visual Evidence Approval Record", href: "/dashboard/networks/zodiac/owner-visual-evidence-approval-record" },
        { label: "Public URL Telegram Mini App Setup Plan", href: "/dashboard/networks/zodiac/public-url-telegram-miniapp-setup-plan" },
        { label: "Public Mini App Route Shell Isolation", href: "/dashboard/networks/zodiac/public-miniapp-route-shell-isolation" },
      ]}
    />
  );
}
