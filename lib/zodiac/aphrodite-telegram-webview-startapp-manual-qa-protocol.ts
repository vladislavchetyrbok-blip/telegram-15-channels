/**
 * Package 232: Telegram WebView Startapp Manual QA Protocol.
 *
 * Static manual QA protocol only. It does not call Telegram API, change
 * BotFather, send messages, alter active CTA logic, or complete QA automatically.
 */

export type AphroditeTelegramWebviewManualQaStatus =
  | "NOT CHECKED"
  | "MANUAL REQUIRED"
  | "BLOCKED"
  | "OWNER REVIEW REQUIRED";

export type AphroditeTelegramWebviewManualQaItem = {
  area: string;
  status: AphroditeTelegramWebviewManualQaStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeTelegramWebviewStartappManualQaProtocolModel = {
  packageNumber: 232;
  title: string;
  route: "/dashboard/networks/zodiac/telegram-webview-startapp-manual-qa-protocol";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  checks: readonly AphroditeTelegramWebviewManualQaItem[];
  browserModeNotes: readonly string[];
  safetyNotes: readonly string[];
  remainingBlockers: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    botFatherChanged: false;
    activeCtaLogicChanged: false;
    databaseWriteAdded: false;
    externalAnalyticsAdded: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    cronWorkflowPublishChanged: false;
    secretsAdded: false;
    productionDbConnected: false;
    telegramWebviewQaCompletedAutomatically: false;
  };
};

export const APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_MANUAL_QA_PROTOCOL_TITLE =
  "Telegram WebView Startapp Manual QA Protocol";

export const APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_MANUAL_QA_PROTOCOL_ROUTE =
  "/dashboard/networks/zodiac/telegram-webview-startapp-manual-qa-protocol" as const;

const checks: readonly AphroditeTelegramWebviewManualQaItem[] = [
  {
    area: "Telegram iOS WebView",
    status: "OWNER REVIEW REQUIRED",
    detail: "Open Mini App inside Telegram iOS WebView and verify chrome, safe area, keyboard, route, and cache marker.",
    ownerAction: "Record device, iOS version, Telegram version, route/startapp source, screenshots, and notes.",
  },
  {
    area: "Telegram Android WebView",
    status: "OWNER REVIEW REQUIRED",
    detail: "Open Mini App inside Telegram Android WebView and verify route, BackButton, keyboard, haptics, and cache marker.",
    ownerAction: "Record Android device, OS version, Telegram version, route/startapp source, screenshots, and notes.",
  },
  {
    area: "startapp param present/missing",
    status: "MANUAL REQUIRED",
    detail: "Observe whether Telegram WebView supplies startapp and whether missing startapp falls back safely.",
    ownerAction: "Record expected parameter, observed parameter, opened route, and whether fallback was correct.",
  },
  {
    area: "deep link open",
    status: "MANUAL REQUIRED",
    detail: "Open the Telegram deep link and verify the Mini App opens the expected screen or documented fallback.",
    ownerAction: "Attach screenshot and route/startapp note for every checked deep link.",
  },
  {
    area: "browser fallback",
    status: "NOT CHECKED",
    detail: "Browser fallback must work without Telegram params; missing startapp in normal browser mode is NOT a code failure.",
    ownerAction: "Verify browser route behavior and record that absent Telegram params were expected.",
  },
  {
    area: "Telegram WebApp ready/expand",
    status: "MANUAL REQUIRED",
    detail: "Verify Telegram WebApp ready/expand behavior produces a usable full-height screen.",
    ownerAction: "Record viewport evidence and any safe-area issue manually.",
  },
  {
    area: "BackButton",
    status: "MANUAL REQUIRED",
    detail: "Verify Telegram BackButton returns to the previous screen or safe hub without trapping the user.",
    ownerAction: "Record start screen, destination, BackButton result, and any failure.",
  },
  {
    area: "haptics",
    status: "NOT CHECKED",
    detail: "Verify haptics work gently or fail silently without breaking interaction.",
    ownerAction: "Record observed behavior and device/Telegram version.",
  },
  {
    area: "initData presence manual observation",
    status: "MANUAL REQUIRED",
    detail: "Observe whether Telegram initData is present in WebView and absent in browser fallback as expected.",
    ownerAction: "Record presence/missing status manually; do not paste raw initData.",
  },
  {
    area: "cache/live marker",
    status: "OWNER REVIEW REQUIRED",
    detail: "Compare live browser and Telegram WebView to identify stale WebView cache or wrong deployed version.",
    ownerAction: "Attach cache marker evidence from both contexts before launch approval.",
  },
  {
    area: "BotFather not changed",
    status: "OWNER REVIEW REQUIRED",
    detail: "This package does not change BotFather settings and only asks owner to verify current configuration manually.",
    ownerAction: "Do not change BotFather automatically; record any future manual BotFather action separately.",
  },
  {
    area: "Telegram API not used",
    status: "OWNER REVIEW REQUIRED",
    detail: "No Telegram API call is made by this protocol.",
    ownerAction: "Keep all checks observational and manual.",
  },
  {
    area: "no messages sent",
    status: "OWNER REVIEW REQUIRED",
    detail: "No Telegram messages are sent by this protocol.",
    ownerAction: "Do not send test messages from this package.",
  },
] as const;

const browserModeNotes = [
  "Missing startapp in normal browser mode is NOT a code failure.",
  "Missing Telegram initData in normal browser mode is NOT a code failure.",
  "Browser fallback should remain usable for QA and support triage.",
  "Telegram WebView must be checked manually on a real device.",
] as const;

const safetyNotes = [
  "BotFather was not changed.",
  "Telegram API was not used.",
  "No messages were sent.",
  "No production launch was performed.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
] as const;

const remainingBlockers = [
  "Telegram iOS WebView manual QA",
  "Telegram Android WebView manual QA",
  "startapp/deep link manual checks",
  "cache/live marker evidence",
  "owner explicit approval",
] as const;

export function getAphroditeTelegramWebviewStartappManualQaProtocol(): AphroditeTelegramWebviewStartappManualQaProtocolModel {
  return {
    packageNumber: 232,
    title: APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_MANUAL_QA_PROTOCOL_TITLE,
    route: APHRODITE_TELEGRAM_WEBVIEW_STARTAPP_MANUAL_QA_PROTOCOL_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    checks: checks.map((check) => ({ ...check })),
    browserModeNotes: [...browserModeNotes],
    safetyNotes: [...safetyNotes],
    remainingBlockers: [...remainingBlockers],
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      botFatherChanged: false,
      activeCtaLogicChanged: false,
      databaseWriteAdded: false,
      externalAnalyticsAdded: false,
      paymentAdded: false,
      vipUnlockAdded: false,
      cronWorkflowPublishChanged: false,
      secretsAdded: false,
      productionDbConnected: false,
      telegramWebviewQaCompletedAutomatically: false,
    },
  };
}
