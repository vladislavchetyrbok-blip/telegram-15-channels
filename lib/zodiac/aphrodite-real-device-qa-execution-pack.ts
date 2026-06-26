/**
 * Package 223: Real Device QA Execution Pack.
 *
 * Static real-device QA execution layer only. This model does not launch
 * production, call Telegram API, send messages, change BotFather, alter active
 * CTA logic, change cron/workflows/publish scripts, write to databases, add
 * external analytics, enable payments, unlock VIP, store secrets, or connect to
 * production DB.
 */

export type AphroditeRealDeviceQaExecutionStatus =
  | "NOT CHECKED"
  | "PASS"
  | "FAIL"
  | "BLOCKED"
  | "OWNER REVIEW REQUIRED";

export type AphroditeRealDeviceQaExecutionSeverity =
  | "blocker"
  | "high"
  | "medium"
  | "low";

export type AphroditeRealDeviceQaExecutionCheck = {
  id: string;
  deviceEnvironment: string;
  flow: string;
  expectedResult: string;
  evidenceNeeded: string;
  screenshotRequired: "Yes" | "No";
  status: AphroditeRealDeviceQaExecutionStatus;
  blockerSeverity: AphroditeRealDeviceQaExecutionSeverity;
  notes: string;
};

export type AphroditeOwnerEvidenceField = {
  id: string;
  label: string;
  expectedEntry: string;
  status: AphroditeRealDeviceQaExecutionStatus;
};

export type AphroditeRealDeviceQaLaunchGate = {
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  launchNotApprovedWording: string;
  requiredBeforeSoftLaunch: readonly string[];
};

export type AphroditeRealDeviceQaExecutionPackModel = {
  packageNumber: 223;
  title: string;
  route: "/dashboard/networks/zodiac/real-device-qa-execution-pack";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  statuses: readonly AphroditeRealDeviceQaExecutionStatus[];
  blockerSeverities: readonly AphroditeRealDeviceQaExecutionSeverity[];
  deviceChecks: readonly AphroditeRealDeviceQaExecutionCheck[];
  miniAppFlowChecks: readonly AphroditeRealDeviceQaExecutionCheck[];
  ownerEvidenceFields: readonly AphroditeOwnerEvidenceField[];
  screenshotsChecklist: readonly string[];
  launchGate: AphroditeRealDeviceQaLaunchGate;
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
  };
  remainingBlockers: readonly string[];
  nextRecommendedPackage: "Package 224 — Production Env Setup Protocol";
};

export const APHRODITE_REAL_DEVICE_QA_EXECUTION_PACK_TITLE =
  "Real Device QA Execution Pack";

export const APHRODITE_REAL_DEVICE_QA_EXECUTION_PACK_ROUTE =
  "/dashboard/networks/zodiac/real-device-qa-execution-pack" as const;

export const APHRODITE_REAL_DEVICE_QA_EXECUTION_STATUSES = [
  "NOT CHECKED",
  "PASS",
  "FAIL",
  "BLOCKED",
  "OWNER REVIEW REQUIRED",
] as const satisfies readonly AphroditeRealDeviceQaExecutionStatus[];

export const APHRODITE_REAL_DEVICE_QA_BLOCKER_SEVERITIES = [
  "blocker",
  "high",
  "medium",
  "low",
] as const satisfies readonly AphroditeRealDeviceQaExecutionSeverity[];

export const APHRODITE_REAL_DEVICE_QA_LAUNCH_NOT_APPROVED_WORDING =
  "Launch not approved. Real-device QA must be completed manually before soft launch.";

const deviceChecks: readonly AphroditeRealDeviceQaExecutionCheck[] = [
  {
    id: "iphone-safari-mobile-browser",
    deviceEnvironment: "iPhone Safari / mobile browser",
    flow: "Open /miniapp, /birth-matrix, /compatibility in browser fallback",
    expectedResult: "Mobile browser renders readable first viewport, stable forms, visible CTA, and no horizontal overflow.",
    evidenceNeeded: "Screenshot of first viewport plus one result screen from a real iPhone Safari session.",
    screenshotRequired: "Yes",
    status: "NOT CHECKED",
    blockerSeverity: "high",
    notes: "Use as browser fallback baseline; lack of Telegram startapp in Safari is not a code failure.",
  },
  {
    id: "android-chrome-mobile-browser",
    deviceEnvironment: "Android Chrome / mobile browser, if available",
    flow: "Open /miniapp, /birth-matrix, /compatibility in Android browser fallback",
    expectedResult: "Android Chrome shows readable Russian text, usable keyboard state, and stable date entry.",
    evidenceNeeded: "Screenshot of mobile browser with URL visible, date flow evidence, and compatibility result if available.",
    screenshotRequired: "Yes",
    status: "NOT CHECKED",
    blockerSeverity: "medium",
    notes: "If Android is unavailable, owner records BLOCKED with device availability reason.",
  },
  {
    id: "telegram-ios-webview",
    deviceEnvironment: "Telegram iOS WebView",
    flow: "Open Mini App from Telegram on iPhone and test WebView chrome, keyboard, cache, and route entry.",
    expectedResult: "Telegram WebView opens fresh UI, keeps safe area readable, and does not show stale cached screens.",
    evidenceNeeded: "Screenshot with Telegram WebView context and exact route/startapp entry noted.",
    screenshotRequired: "Yes",
    status: "OWNER REVIEW REQUIRED",
    blockerSeverity: "blocker",
    notes: "This is mandatory real-device evidence before soft launch approval.",
  },
  {
    id: "telegram-android-webview",
    deviceEnvironment: "Telegram Android WebView, if available",
    flow: "Open Mini App from Telegram on Android and test WebView chrome, keyboard, cache, and route entry.",
    expectedResult: "Telegram Android WebView keeps CTA visible, handles back navigation, and shows the same fresh version as live browser.",
    evidenceNeeded: "Screenshot with Telegram app version, device name, and route/startapp entry noted.",
    screenshotRequired: "Yes",
    status: "OWNER REVIEW REQUIRED",
    blockerSeverity: "high",
    notes: "If Android Telegram is unavailable, owner records BLOCKED and validates iOS plus browser fallback.",
  },
  {
    id: "desktop-browser-sanity",
    deviceEnvironment: "Desktop browser sanity check",
    flow: "Open /miniapp, /birth-matrix, /compatibility, and readiness dashboard links on desktop.",
    expectedResult: "Desktop layout remains readable, route links work, and readiness flags remain launch-blocking.",
    evidenceNeeded: "One desktop screenshot showing route, version/cache evidence, and no production launch state.",
    screenshotRequired: "Yes",
    status: "NOT CHECKED",
    blockerSeverity: "low",
    notes: "Desktop sanity check supports evidence but does not replace Telegram WebView QA.",
  },
];

const miniAppFlowChecks: readonly AphroditeRealDeviceQaExecutionCheck[] = [
  {
    id: "mini-app-main-screen-opens",
    deviceEnvironment: "Real device browser and Telegram WebView",
    flow: "Mini App main screen opens",
    expectedResult: "Main Mini App screen loads without blank state, wrong route, or stale cached UI.",
    evidenceNeeded: "Screenshot of /miniapp first viewport with main screen and visible CTA hierarchy.",
    screenshotRequired: "Yes",
    status: "NOT CHECKED",
    blockerSeverity: "blocker",
    notes: "This confirms the actual user entry point before soft launch.",
  },
  {
    id: "telegram-webapp-ready-expand-behavior",
    deviceEnvironment: "Telegram iOS/Android WebView",
    flow: "Telegram WebApp ready/expand behavior",
    expectedResult: "Mini App presents usable full-height layout after Telegram WebView initialization.",
    evidenceNeeded: "Manual note plus screenshot showing safe area and initial viewport after open.",
    screenshotRequired: "Yes",
    status: "OWNER REVIEW REQUIRED",
    blockerSeverity: "high",
    notes: "Only manual device testing can confirm WebView chrome behavior.",
  },
  {
    id: "back-button-behavior",
    deviceEnvironment: "Telegram WebView and mobile browser",
    flow: "Back button behavior",
    expectedResult: "Back navigation returns to the previous screen or safe hub without losing context.",
    evidenceNeeded: "Short manual note naming start screen, destination, and result after Back.",
    screenshotRequired: "No",
    status: "NOT CHECKED",
    blockerSeverity: "medium",
    notes: "Record FAIL if user becomes stuck or lands on the wrong route.",
  },
  {
    id: "haptics-behavior",
    deviceEnvironment: "Telegram WebView, if available",
    flow: "Haptics behavior, if available",
    expectedResult: "Haptics either work gently or fail silently without blocking the flow.",
    evidenceNeeded: "Owner manual note with device and Telegram app version.",
    screenshotRequired: "No",
    status: "NOT CHECKED",
    blockerSeverity: "low",
    notes: "Haptics are optional and must not become a launch blocker unless they break interaction.",
  },
  {
    id: "startapp-deep-link-behavior",
    deviceEnvironment: "Telegram WebView",
    flow: "startapp/deep link behavior",
    expectedResult: "Expected startapp entry opens correct route or documented safe fallback.",
    evidenceNeeded: "Screenshot or note showing startapp parameter, opened route, and visible screen.",
    screenshotRequired: "Yes",
    status: "OWNER REVIEW REQUIRED",
    blockerSeverity: "blocker",
    notes: "Wrong route indicates Telegram WebView/startapp manual QA blocker.",
  },
  {
    id: "fallback-browser-mode",
    deviceEnvironment: "Mobile browser fallback",
    flow: "fallback browser mode",
    expectedResult: "Browser mode works without Telegram params and clearly avoids treating missing startapp as code failure.",
    evidenceNeeded: "Screenshot with browser URL and fallback route visible.",
    screenshotRequired: "Yes",
    status: "NOT CHECKED",
    blockerSeverity: "medium",
    notes: "This protects non-Telegram opens during QA and support triage.",
  },
  {
    id: "cache-live-version-marker",
    deviceEnvironment: "Live browser and Telegram WebView",
    flow: "cache/live version marker",
    expectedResult: "Live browser and Telegram WebView show the same fresh UI and no stale deployment symptoms.",
    evidenceNeeded: "Screenshot or manual note with cache-buster URL, route, date/time, and visible version marker evidence.",
    screenshotRequired: "Yes",
    status: "OWNER REVIEW REQUIRED",
    blockerSeverity: "blocker",
    notes: "If live browser is fresh but Telegram is stale, likely Telegram WebView cache remains.",
  },
  {
    id: "compatibility-flow",
    deviceEnvironment: "Mobile browser and Telegram WebView",
    flow: "compatibility flow",
    expectedResult: "Compatibility form, result, and relationship calendar are readable and personalized.",
    evidenceNeeded: "Screenshots of form input, result, and 30 days pair section.",
    screenshotRequired: "Yes",
    status: "NOT CHECKED",
    blockerSeverity: "high",
    notes: "Record FAIL if copy repeats incorrectly, inputs reset, or result overflows.",
  },
  {
    id: "birth-matrix-flow",
    deviceEnvironment: "Mobile browser and Telegram WebView",
    flow: "Birth Matrix flow",
    expectedResult: "Birth Matrix accepts text birth date input and renders result without native broken date picker.",
    evidenceNeeded: "Screenshots showing date input, accepted 15.06.1998 / 01.01.1990 evidence, and result.",
    screenshotRequired: "Yes",
    status: "NOT CHECKED",
    blockerSeverity: "high",
    notes: "Native birth-date picker returning in live Mini App is a blocker.",
  },
  {
    id: "mystic-cards-flow",
    deviceEnvironment: "Mobile browser and Telegram WebView",
    flow: "Mystic Cards flow",
    expectedResult: "Mystic cards open, remain readable, and do not hide controls under WebView chrome.",
    evidenceNeeded: "Screenshot of Mystic Cards panel or route with real mobile viewport.",
    screenshotRequired: "Yes",
    status: "NOT CHECKED",
    blockerSeverity: "medium",
    notes: "Record BLOCKED if route is unavailable and explain whether feature is excluded from hot path.",
  },
  {
    id: "vip-locked-state",
    deviceEnvironment: "Mobile browser and Telegram WebView",
    flow: "VIP locked state",
    expectedResult: "VIP remains locked, free fallback stays visible, and no entitlement is granted.",
    evidenceNeeded: "Screenshot of locked/fallback state and note that no entitlement was created.",
    screenshotRequired: "Yes",
    status: "OWNER REVIEW REQUIRED",
    blockerSeverity: "blocker",
    notes: "Any VIP unlock without entitlement is a launch blocker.",
  },
  {
    id: "cta-visibility",
    deviceEnvironment: "All target devices",
    flow: "CTA visibility",
    expectedResult: "Primary and secondary CTAs remain visible, readable, and do not imply an active forbidden launch action.",
    evidenceNeeded: "First viewport and post-result screenshots showing CTA placement.",
    screenshotRequired: "Yes",
    status: "NOT CHECKED",
    blockerSeverity: "high",
    notes: "This is inventory evidence only; active CTA logic is not changed.",
  },
  {
    id: "no-payment-shown-as-active",
    deviceEnvironment: "All target devices",
    flow: "no payment shown as active",
    expectedResult: "No payment screen, invoice, or active paid purchase path is presented as available.",
    evidenceNeeded: "Screenshot or manual note from VIP/payment-adjacent screens.",
    screenshotRequired: "Yes",
    status: "OWNER REVIEW REQUIRED",
    blockerSeverity: "blocker",
    notes: "Payment remains disabled and must not appear live.",
  },
  {
    id: "no-vip-unlock-without-entitlement",
    deviceEnvironment: "All target devices",
    flow: "no VIP unlock without entitlement",
    expectedResult: "VIP content stays locked unless a future real entitlement exists outside this package.",
    evidenceNeeded: "Screenshot of locked state and manual note that no entitlement was granted.",
    screenshotRequired: "Yes",
    status: "OWNER REVIEW REQUIRED",
    blockerSeverity: "blocker",
    notes: "Package 223 adds no entitlement creation and no VIP access.",
  },
];

const ownerEvidenceFields: readonly AphroditeOwnerEvidenceField[] = [
  {
    id: "screenshots-checklist",
    label: "screenshots checklist",
    expectedEntry: "Owner attaches required screenshots for device checks and Mini App flow checks.",
    status: "OWNER REVIEW REQUIRED",
  },
  {
    id: "date-time-of-manual-check",
    label: "date/time of manual check",
    expectedEntry: "Owner records local date/time for every manual check batch.",
    status: "NOT CHECKED",
  },
  {
    id: "device-used",
    label: "device used",
    expectedEntry: "Owner records device model, OS, browser, and Telegram app where relevant.",
    status: "NOT CHECKED",
  },
  {
    id: "telegram-app-version-manual-field",
    label: "Telegram app version manual field",
    expectedEntry: "Owner records Telegram app version for iOS/Android WebView checks.",
    status: "OWNER REVIEW REQUIRED",
  },
  {
    id: "public-url-manual-launch-url-checked",
    label: "public URL/manual launch URL checked",
    expectedEntry: "Owner records checked public URL, manual launch URL, and route/startapp path.",
    status: "OWNER REVIEW REQUIRED",
  },
  {
    id: "owner-sign-off-still-required",
    label: "owner sign-off still required",
    expectedEntry: "Owner records explicit go/no-go decision outside this static package.",
    status: "OWNER REVIEW REQUIRED",
  },
];

const screenshotsChecklist = [
  "iPhone Safari / mobile browser first viewport",
  "Android Chrome / mobile browser first viewport, if available",
  "Telegram iOS WebView main screen",
  "Telegram Android WebView main screen, if available",
  "Desktop browser sanity check",
  "Mini App main screen opens",
  "startapp/deep link behavior",
  "cache/live version marker",
  "compatibility flow",
  "Birth Matrix flow",
  "Mystic Cards flow",
  "VIP locked state",
  "CTA visibility",
  "no payment shown as active",
  "no VIP unlock without entitlement",
] as const;

const requiredBeforeSoftLaunch = [
  "All blocker severity checks are PASS or explicitly resolved.",
  "All Telegram WebView checks have real-device evidence.",
  "All screenshots checklist items are attached or manually marked unavailable with reason.",
  "DATABASE_URL and TELEGRAM_BOT_TOKEN blockers are resolved manually.",
  "Backup freshness and restore rehearsal blockers are resolved manually.",
  "Owner manual approval is granted outside this static package.",
] as const;

const remainingBlockers = [
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "backup freshness <24h",
  "restore rehearsal",
  "real-device QA manual execution",
  "Telegram WebView/startapp manual QA",
  "content/CTA owner review",
  "owner manual approval",
] as const;

export function getAphroditeRealDeviceQaExecutionPack(): AphroditeRealDeviceQaExecutionPackModel {
  return {
    packageNumber: 223,
    title: APHRODITE_REAL_DEVICE_QA_EXECUTION_PACK_TITLE,
    route: APHRODITE_REAL_DEVICE_QA_EXECUTION_PACK_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    statuses: [...APHRODITE_REAL_DEVICE_QA_EXECUTION_STATUSES],
    blockerSeverities: [...APHRODITE_REAL_DEVICE_QA_BLOCKER_SEVERITIES],
    deviceChecks: deviceChecks.map((check) => ({ ...check })),
    miniAppFlowChecks: miniAppFlowChecks.map((check) => ({ ...check })),
    ownerEvidenceFields: ownerEvidenceFields.map((field) => ({ ...field })),
    screenshotsChecklist: [...screenshotsChecklist],
    launchGate: {
      publicLaunchApproved: false,
      ownerManualReviewRequired: true,
      launchNotApprovedWording: APHRODITE_REAL_DEVICE_QA_LAUNCH_NOT_APPROVED_WORDING,
      requiredBeforeSoftLaunch: [...requiredBeforeSoftLaunch],
    },
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
    },
    remainingBlockers: [...remainingBlockers],
    nextRecommendedPackage: "Package 224 — Production Env Setup Protocol",
  };
}
