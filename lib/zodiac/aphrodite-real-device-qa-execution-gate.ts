/**
 * Package 251: Real Device QA Execution Gate.
 *
 * Static manual QA execution gate only. It organizes required devices,
 * viewports, flows, evidence fields, and status values without faking
 * screenshots or marking real-device QA as completed automatically.
 */

export type AphroditeRealDeviceQaGateStatus =
  | "NOT CHECKED"
  | "PASS"
  | "FAIL"
  | "BLOCKED"
  | "OWNER REVIEW REQUIRED"
  | "MANUAL REQUIRED";

export type AphroditeRealDeviceQaGateItem = {
  area: string;
  status: AphroditeRealDeviceQaGateStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeRealDeviceQaExecutionGateModel = {
  packageNumber: 251;
  title: string;
  route: "/dashboard/networks/zodiac/real-device-qa-execution-gate";
  currentState: "NOT CHECKED / OWNER REVIEW REQUIRED";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  requiredDevices: readonly AphroditeRealDeviceQaGateItem[];
  requiredViewports: readonly AphroditeRealDeviceQaGateItem[];
  requiredFlows: readonly AphroditeRealDeviceQaGateItem[];
  evidenceFields: readonly AphroditeRealDeviceQaGateItem[];
  statusValues: readonly AphroditeRealDeviceQaGateStatus[];
  manualRules: readonly AphroditeRealDeviceQaGateItem[];
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    botFatherChanged: false;
    activeCtaLogicChanged: false;
    channelMappingsChanged: false;
    databaseWriteAdded: false;
    externalAnalyticsAdded: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    entitlementBypassAdded: false;
    cronWorkflowPublishChanged: false;
    secretsAdded: false;
    productionDbConnected: false;
    screenshotsFaked: false;
    realDeviceQaCompletedAutomatically: false;
    manualChecksMarkedComplete: false;
    publicLaunchApproved: false;
    ownerManualReviewRequired: true;
  };
  safetyNotes: readonly string[];
  remainingBlockers: readonly string[];
  nextPackageRecommendation: "Package 252 - Soft Launch Candidate Report";
};

export const APHRODITE_REAL_DEVICE_QA_EXECUTION_GATE_TITLE =
  "Real Device QA Execution Gate";

export const APHRODITE_REAL_DEVICE_QA_EXECUTION_GATE_ROUTE =
  "/dashboard/networks/zodiac/real-device-qa-execution-gate" as const;

const requiredDevices: readonly AphroditeRealDeviceQaGateItem[] = [
  {
    area: "iPhone Safari",
    status: "NOT CHECKED",
    detail: "Manual check required on iPhone Safari.",
    ownerAction: "Record device, OS version, browser version, screenshot/evidence, notes, severity, timestamp, and owner sign-off.",
  },
  {
    area: "Android Chrome",
    status: "NOT CHECKED",
    detail: "Manual check required on Android Chrome.",
    ownerAction: "Record device, OS version, browser version, screenshot/evidence, notes, severity, timestamp, and owner sign-off.",
  },
  {
    area: "Telegram iOS WebView",
    status: "OWNER REVIEW REQUIRED",
    detail: "Manual Telegram iOS WebView check required on a real device.",
    ownerAction: "Record Telegram app version, startapp/deep link behavior, cache marker, screenshot/evidence, notes, and owner sign-off.",
  },
  {
    area: "Telegram Android WebView",
    status: "OWNER REVIEW REQUIRED",
    detail: "Manual Telegram Android WebView check required on a real device.",
    ownerAction: "Record Telegram app version, startapp/deep link behavior, cache marker, screenshot/evidence, notes, and owner sign-off.",
  },
  {
    area: "Desktop sanity",
    status: "NOT CHECKED",
    detail: "Desktop browser sanity check remains manual.",
    ownerAction: "Record browser version, public URL, screenshot/evidence, notes, and owner sign-off.",
  },
];

const requiredViewports: readonly AphroditeRealDeviceQaGateItem[] = [
  {
    area: "360px",
    status: "NOT CHECKED",
    detail: "Small mobile viewport must be checked for overflow, CTA visibility, and text wrapping.",
    ownerAction: "Capture screenshot/evidence and severity.",
  },
  {
    area: "390px",
    status: "NOT CHECKED",
    detail: "Telegram-like mobile viewport must be checked for core flows.",
    ownerAction: "Capture screenshot/evidence and severity.",
  },
  {
    area: "430px",
    status: "NOT CHECKED",
    detail: "Large mobile viewport must be checked for spacing and result cards.",
    ownerAction: "Capture screenshot/evidence and severity.",
  },
  {
    area: "desktop sanity",
    status: "NOT CHECKED",
    detail: "Desktop sanity must confirm dashboard and browser fallback readability.",
    ownerAction: "Capture screenshot/evidence and notes.",
  },
];

const requiredFlows: readonly AphroditeRealDeviceQaGateItem[] = [
  {
    area: "Home",
    status: "NOT CHECKED",
    detail: "Mini App home must load, wrap text, and expose clear CTA hierarchy.",
    ownerAction: "Record public URL and screenshot/evidence.",
  },
  {
    area: "Compatibility input/result",
    status: "NOT CHECKED",
    detail: "Compatibility input and result must work on target devices.",
    ownerAction: "Record sample input, result, screenshot/evidence, and notes.",
  },
  {
    area: "Birth Matrix input/result",
    status: "NOT CHECKED",
    detail: "Birth Matrix date input and result must remain usable and readable.",
    ownerAction: "Record sample date, result, screenshot/evidence, and notes.",
  },
  {
    area: "Mystic Cards closed/selected/revealed",
    status: "NOT CHECKED",
    detail: "Mystic cards must show closed, selected, and revealed states correctly.",
    ownerAction: "Record screenshots/evidence for each state.",
  },
  {
    area: "VIP preview locked",
    status: "NOT CHECKED",
    detail: "VIP preview must remain locked and preview-only.",
    ownerAction: "Record screenshot/evidence and confirm no active payment or VIP unlock.",
  },
  {
    area: "Result/share cards",
    status: "NOT CHECKED",
    detail: "Result/share cards must be readable and share-ready visually without Telegram send API.",
    ownerAction: "Record screenshot/evidence and note any overflow.",
  },
  {
    area: "startapp/deep link",
    status: "OWNER REVIEW REQUIRED",
    detail: "startapp and deep link behavior must be manually checked in Telegram.",
    ownerAction: "Record exact link, route opened, Telegram version, screenshot/evidence, and notes.",
  },
  {
    area: "browser fallback",
    status: "NOT CHECKED",
    detail: "Browser mode without Telegram init data must fall back safely.",
    ownerAction: "Record public URL, browser, screenshot/evidence, and notes.",
  },
];

const evidenceFields: readonly AphroditeRealDeviceQaGateItem[] = [
  { area: "device", status: "MANUAL REQUIRED", detail: "Manual device name field is required.", ownerAction: "Fill in after real check." },
  { area: "OS version", status: "MANUAL REQUIRED", detail: "Manual OS version field is required.", ownerAction: "Fill in after real check." },
  { area: "Telegram app version", status: "MANUAL REQUIRED", detail: "Manual Telegram version field is required for Telegram WebView checks.", ownerAction: "Fill in after real Telegram check." },
  { area: "browser version", status: "MANUAL REQUIRED", detail: "Manual browser version field is required for browser checks.", ownerAction: "Fill in after real check." },
  { area: "public URL", status: "MANUAL REQUIRED", detail: "Public URL checked must be recorded.", ownerAction: "Fill in exact checked URL." },
  { area: "screenshot/evidence", status: "MANUAL REQUIRED", detail: "Screenshot or evidence reference is required.", ownerAction: "Attach or record evidence outside this static pack." },
  { area: "tester notes", status: "MANUAL REQUIRED", detail: "Tester notes are required for each device/flow.", ownerAction: "Write manual notes." },
  { area: "status", status: "MANUAL REQUIRED", detail: "Status must be chosen manually: NOT CHECKED / PASS / FAIL / BLOCKED / OWNER REVIEW REQUIRED.", ownerAction: "Do not auto-fill PASS." },
  { area: "severity", status: "MANUAL REQUIRED", detail: "Severity must be recorded for any issue.", ownerAction: "Use owner triage severity." },
  { area: "timestamp", status: "MANUAL REQUIRED", detail: "Manual timestamp field is required.", ownerAction: "Record when the check was performed." },
  { area: "owner sign-off", status: "OWNER REVIEW REQUIRED", detail: "Owner sign-off is required before launch approval.", ownerAction: "Owner signs off manually later." },
];

const manualRules: readonly AphroditeRealDeviceQaGateItem[] = [
  {
    area: "manual required status",
    status: "OWNER REVIEW REQUIRED",
    detail: "Current state remains NOT CHECKED / OWNER REVIEW REQUIRED.",
    ownerAction: "Do not mark real-device QA complete automatically.",
  },
  {
    area: "no fake screenshots",
    status: "BLOCKED",
    detail: "Screenshots must not be faked or generated as real-device evidence.",
    ownerAction: "Use only real owner-provided evidence.",
  },
  {
    area: "browser-only checks",
    status: "MANUAL REQUIRED",
    detail: "If only browser tools are used, Telegram WebView remains MANUAL REQUIRED.",
    ownerAction: "Do not mark Telegram WebView complete without real Telegram WebView evidence.",
  },
  {
    area: "no active payment",
    status: "BLOCKED",
    detail: "Payment remains inactive and VIP remains locked-only during QA.",
    ownerAction: "Stop if payment or VIP unlock appears active.",
  },
];

const statusValues = [
  "NOT CHECKED",
  "PASS",
  "FAIL",
  "BLOCKED",
  "OWNER REVIEW REQUIRED",
] as const;

const safetyNotes = [
  "Current state: NOT CHECKED / OWNER REVIEW REQUIRED.",
  "No real-device QA completed automatically.",
  "No fake screenshots.",
  "No Telegram API calls.",
  "No Telegram messages.",
  "No payment.",
  "No VIP unlock.",
  "No DB writes.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
] as const;

const remainingBlockers = [
  "iPhone Safari manual check",
  "Android Chrome manual check",
  "Telegram iOS WebView manual check",
  "Telegram Android WebView manual check",
  "Desktop sanity manual check",
  "startapp/deep link evidence",
  "browser fallback evidence",
  "screenshots/evidence",
  "owner sign-off",
] as const;

function cloneItems(items: readonly AphroditeRealDeviceQaGateItem[]) {
  return items.map((item) => ({ ...item }));
}

export function getAphroditeRealDeviceQaExecutionGate(): AphroditeRealDeviceQaExecutionGateModel {
  return {
    packageNumber: 251,
    title: APHRODITE_REAL_DEVICE_QA_EXECUTION_GATE_TITLE,
    route: APHRODITE_REAL_DEVICE_QA_EXECUTION_GATE_ROUTE,
    currentState: "NOT CHECKED / OWNER REVIEW REQUIRED",
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    requiredDevices: cloneItems(requiredDevices),
    requiredViewports: cloneItems(requiredViewports),
    requiredFlows: cloneItems(requiredFlows),
    evidenceFields: cloneItems(evidenceFields),
    statusValues: [...statusValues],
    manualRules: cloneItems(manualRules),
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      botFatherChanged: false,
      activeCtaLogicChanged: false,
      channelMappingsChanged: false,
      databaseWriteAdded: false,
      externalAnalyticsAdded: false,
      paymentAdded: false,
      vipUnlockAdded: false,
      entitlementBypassAdded: false,
      cronWorkflowPublishChanged: false,
      secretsAdded: false,
      productionDbConnected: false,
      screenshotsFaked: false,
      realDeviceQaCompletedAutomatically: false,
      manualChecksMarkedComplete: false,
      publicLaunchApproved: false,
      ownerManualReviewRequired: true,
    },
    safetyNotes: [...safetyNotes],
    remainingBlockers: [...remainingBlockers],
    nextPackageRecommendation: "Package 252 - Soft Launch Candidate Report",
  };
}
