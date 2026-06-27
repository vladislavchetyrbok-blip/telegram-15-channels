/**
 * Package 231: Manual Real-Device QA Evidence Capture.
 *
 * Static evidence capture structure only. It does not run real-device QA,
 * mark checks complete, call Telegram API, add payments, unlock VIP, or write data.
 */

export type AphroditeManualRealDeviceQaStatus =
  | "NOT CHECKED"
  | "PASS"
  | "FAIL"
  | "BLOCKED"
  | "OWNER REVIEW REQUIRED";

export type AphroditeManualRealDeviceQaSeverity =
  | "blocker"
  | "high"
  | "medium"
  | "low";

export type AphroditeManualRealDeviceQaEvidenceTarget = {
  area: string;
  status: Exclude<AphroditeManualRealDeviceQaStatus, "PASS">;
  severity: AphroditeManualRealDeviceQaSeverity;
  evidenceNeeded: string;
  ownerAction: string;
};

export type AphroditeManualRealDeviceQaField = {
  label: string;
  status: "NOT CHECKED" | "OWNER REVIEW REQUIRED";
  expectedEntry: string;
};

export type AphroditeManualRealDeviceQaEvidenceCaptureModel = {
  packageNumber: 231;
  title: string;
  route: "/dashboard/networks/zodiac/manual-real-device-qa-evidence-capture";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  statuses: readonly AphroditeManualRealDeviceQaStatus[];
  severities: readonly AphroditeManualRealDeviceQaSeverity[];
  deviceEvidenceTargets: readonly AphroditeManualRealDeviceQaEvidenceTarget[];
  manualEvidenceFields: readonly AphroditeManualRealDeviceQaField[];
  miniAppFlowEvidenceTargets: readonly AphroditeManualRealDeviceQaEvidenceTarget[];
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
    realDeviceQaCompletedAutomatically: false;
    automaticPassClaimsAdded: false;
  };
};

export const APHRODITE_MANUAL_REAL_DEVICE_QA_EVIDENCE_CAPTURE_TITLE =
  "Manual Real-Device QA Evidence Capture";

export const APHRODITE_MANUAL_REAL_DEVICE_QA_EVIDENCE_CAPTURE_ROUTE =
  "/dashboard/networks/zodiac/manual-real-device-qa-evidence-capture" as const;

const statuses: readonly AphroditeManualRealDeviceQaStatus[] = [
  "NOT CHECKED",
  "PASS",
  "FAIL",
  "BLOCKED",
  "OWNER REVIEW REQUIRED",
] as const;

const severities: readonly AphroditeManualRealDeviceQaSeverity[] = [
  "blocker",
  "high",
  "medium",
  "low",
] as const;

const deviceEvidenceTargets: readonly AphroditeManualRealDeviceQaEvidenceTarget[] = [
  {
    area: "iPhone Safari",
    status: "NOT CHECKED",
    severity: "high",
    evidenceNeeded: "Mobile browser screenshot with public URL, first viewport, and date/input flow evidence.",
    ownerAction: "Owner records device name, OS version, browser version, screenshot, timestamp, and notes.",
  },
  {
    area: "Android Chrome",
    status: "NOT CHECKED",
    severity: "medium",
    evidenceNeeded: "Android browser screenshot with public URL, first viewport, and keyboard/date-entry evidence.",
    ownerAction: "Owner records device name, OS version, Chrome version, screenshot, timestamp, and notes.",
  },
  {
    area: "Telegram iOS WebView",
    status: "OWNER REVIEW REQUIRED",
    severity: "blocker",
    evidenceNeeded: "Telegram iOS WebView screenshot with startapp/deep link path, cache marker, and Telegram version.",
    ownerAction: "Owner checks inside Telegram on real iPhone and records Telegram version manual field.",
  },
  {
    area: "Telegram Android WebView",
    status: "OWNER REVIEW REQUIRED",
    severity: "high",
    evidenceNeeded: "Telegram Android WebView screenshot with startapp/deep link path, cache marker, and Telegram version.",
    ownerAction: "Owner checks inside Telegram on real Android or records BLOCKED with availability reason.",
  },
  {
    area: "Desktop browser",
    status: "NOT CHECKED",
    severity: "low",
    evidenceNeeded: "Desktop browser screenshot showing public URL, route, and readable layout.",
    ownerAction: "Owner records browser, OS version, public URL checked, timestamp, and notes.",
  },
] as const;

const manualEvidenceFields: readonly AphroditeManualRealDeviceQaField[] = [
  {
    label: "device name",
    status: "NOT CHECKED",
    expectedEntry: "Exact physical device model used for the manual check.",
  },
  {
    label: "OS version",
    status: "NOT CHECKED",
    expectedEntry: "iOS, Android, Windows, or macOS version observed manually.",
  },
  {
    label: "Telegram version manual field",
    status: "OWNER REVIEW REQUIRED",
    expectedEntry: "Telegram app version for iOS/Android WebView checks.",
  },
  {
    label: "public URL checked",
    status: "OWNER REVIEW REQUIRED",
    expectedEntry: "Live public URL or exact route opened by the owner.",
  },
  {
    label: "startapp/deep link checked",
    status: "OWNER REVIEW REQUIRED",
    expectedEntry: "Observed startapp parameter, deep link, or browser fallback route.",
  },
  {
    label: "screenshots required",
    status: "OWNER REVIEW REQUIRED",
    expectedEntry: "Required screenshots attached or explicitly marked unavailable with reason.",
  },
  {
    label: "owner notes",
    status: "NOT CHECKED",
    expectedEntry: "Manual notes for visible issues, route source, cache state, and reproduction steps.",
  },
  {
    label: "status",
    status: "OWNER REVIEW REQUIRED",
    expectedEntry: "NOT CHECKED / PASS / FAIL / BLOCKED / OWNER REVIEW REQUIRED selected manually by owner.",
  },
  {
    label: "severity",
    status: "OWNER REVIEW REQUIRED",
    expectedEntry: "blocker / high / medium / low selected manually by owner.",
  },
  {
    label: "timestamp manual field",
    status: "OWNER REVIEW REQUIRED",
    expectedEntry: "Manual check timestamp, timezone, and reviewer name.",
  },
] as const;

const miniAppFlowEvidenceTargets: readonly AphroditeManualRealDeviceQaEvidenceTarget[] = [
  {
    area: "main screen",
    status: "NOT CHECKED",
    severity: "blocker",
    evidenceNeeded: "Screenshot of Mini App main screen first viewport and route/source.",
    ownerAction: "Owner verifies the main screen opens in browser and Telegram WebView.",
  },
  {
    area: "compatibility",
    status: "NOT CHECKED",
    severity: "high",
    evidenceNeeded: "Screenshots of compatibility form, result, and relationship/calendar output.",
    ownerAction: "Owner checks manual input, result readability, save/share, and no duplicated generic result.",
  },
  {
    area: "Birth Matrix",
    status: "NOT CHECKED",
    severity: "high",
    evidenceNeeded: "Screenshots of birth-date input and Birth Matrix result on real device.",
    ownerAction: "Owner confirms text date input works and native broken picker is absent.",
  },
  {
    area: "Mystic Cards",
    status: "NOT CHECKED",
    severity: "medium",
    evidenceNeeded: "Screenshot of Mystic Cards flow with readable cards and visible controls.",
    ownerAction: "Owner records if the flow is available or BLOCKED with reason.",
  },
  {
    area: "VIP locked state",
    status: "OWNER REVIEW REQUIRED",
    severity: "blocker",
    evidenceNeeded: "Screenshot proving VIP remains locked and no entitlement is granted.",
    ownerAction: "Owner confirms no VIP unlock without entitlement.",
  },
  {
    area: "CTA visibility",
    status: "NOT CHECKED",
    severity: "high",
    evidenceNeeded: "Screenshot of primary/secondary CTAs before and after a result.",
    ownerAction: "Owner confirms CTAs are visible and active CTA logic was not changed.",
  },
  {
    area: "no active payment",
    status: "OWNER REVIEW REQUIRED",
    severity: "blocker",
    evidenceNeeded: "Screenshot or note showing no payment/invoice path is active.",
    ownerAction: "Owner confirms no active payment was exposed.",
  },
  {
    area: "no VIP unlock without entitlement",
    status: "OWNER REVIEW REQUIRED",
    severity: "blocker",
    evidenceNeeded: "Screenshot or note showing locked VIP state remains enforced.",
    ownerAction: "Owner confirms no VIP content opened without entitlement.",
  },
  {
    area: "back button",
    status: "NOT CHECKED",
    severity: "medium",
    evidenceNeeded: "Manual note describing navigation before and after BackButton/browser back.",
    ownerAction: "Owner confirms back behavior does not trap the user.",
  },
  {
    area: "haptics",
    status: "NOT CHECKED",
    severity: "low",
    evidenceNeeded: "Manual note for haptic feedback or graceful no-op behavior.",
    ownerAction: "Owner records whether Telegram haptics work or fail harmlessly.",
  },
  {
    area: "cache marker",
    status: "OWNER REVIEW REQUIRED",
    severity: "blocker",
    evidenceNeeded: "Screenshot/note showing live version/cache marker evidence in browser and Telegram WebView.",
    ownerAction: "Owner compares live browser and Telegram WebView for stale version symptoms.",
  },
] as const;

const safetyNotes = [
  "No automatic PASS claims were added.",
  "No real-device QA was completed automatically.",
  "No Telegram API call was made.",
  "No payment or VIP unlock was added.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
] as const;

const remainingBlockers = [
  "real-device QA manual execution",
  "Telegram WebView/startapp manual QA",
  "screenshots required",
  "owner notes",
  "cache marker evidence",
  "owner explicit approval",
] as const;

export function getAphroditeManualRealDeviceQaEvidenceCapture(): AphroditeManualRealDeviceQaEvidenceCaptureModel {
  return {
    packageNumber: 231,
    title: APHRODITE_MANUAL_REAL_DEVICE_QA_EVIDENCE_CAPTURE_TITLE,
    route: APHRODITE_MANUAL_REAL_DEVICE_QA_EVIDENCE_CAPTURE_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    statuses: [...statuses],
    severities: [...severities],
    deviceEvidenceTargets: deviceEvidenceTargets.map((target) => ({ ...target })),
    manualEvidenceFields: manualEvidenceFields.map((field) => ({ ...field })),
    miniAppFlowEvidenceTargets: miniAppFlowEvidenceTargets.map((target) => ({ ...target })),
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
      realDeviceQaCompletedAutomatically: false,
      automaticPassClaimsAdded: false,
    },
  };
}
