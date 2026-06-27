import { AphroditeReadinessPage } from "@/components/zodiac/AphroditeReadinessPage";
import {
  APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_MANUAL_QA_PROTOCOL_ROUTE,
  getAphroditeTelegramWebviewStartappManualQaProtocol,
} from "@/lib/zodiac/aphrodite-telegram-webview-startapp-manual-qa-protocol";

const model = getAphroditeTelegramWebviewStartappManualQaProtocol();

export const metadata = {
  title: model.title,
};

export default function AphroditeTelegramWebviewStartappManualQaProtocolPage() {
  return (
    <AphroditeReadinessPage
      packageNumber={model.packageNumber}
      title={model.title}
      route={APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_MANUAL_QA_PROTOCOL_ROUTE}
      badge="Aphrodite / Telegram WebView QA"
      description="Manual protocol for Telegram WebView, startapp, deep-link, browser fallback, BackButton, haptics, initData and cache/live marker checks. It is observational only and sends nothing."
      metrics={[
        { label: "publicLaunchApproved", value: String(model.publicLaunchApproved), tone: "rose" },
        { label: "ownerManualReviewRequired", value: String(model.ownerManualReviewRequired), tone: "amber" },
        { label: "manual checks", value: String(model.checks.length), tone: "cyan" },
        { label: "telegramApiUsed", value: String(model.safetyFlags.telegramApiUsed), tone: "emerald" },
        { label: "messagesSent", value: String(model.safetyFlags.messagesSent), tone: "emerald" },
      ]}
      sections={[
        {
          title: "Telegram WebView/startapp manual protocol",
          rows: model.checks.map((check) => ({
            area: check.area,
            status: check.status,
            detail: check.detail,
            action: check.ownerAction,
          })),
        },
        {
          title: "browser fallback notes",
          rows: model.browserModeNotes.map((note) => ({
            area: note,
            status: "MANUAL REQUIRED",
            detail: "This distinction prevents browser-mode absence of Telegram params from being misclassified as a code failure.",
            action: "Record WebView-specific observations only on a real Telegram device.",
          })),
        },
      ]}
      safetyFlags={model.safetyFlags}
      safetyNotes={model.safetyNotes}
      remainingBlockers={model.remainingBlockers}
      relatedLinks={[
        { label: "StartApp Diagnostics", href: "/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics" },
        { label: "Manual Real-Device Evidence", href: "/dashboard/networks/zodiac/manual-real-device-qa-evidence-capture" },
        { label: "Live Version Cache Marker", href: "/dashboard/networks/zodiac/live-version-cache-marker-readiness" },
      ]}
    />
  );
}
