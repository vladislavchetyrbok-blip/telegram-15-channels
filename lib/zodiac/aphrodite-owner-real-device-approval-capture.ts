/**
 * Package 287: Owner Real Device Approval Capture.
 *
 * Static approval capture record only. No owner screenshots or explicit owner
 * approval evidence were provided with this package, so approval remains
 * pending and false. This package does not launch production, configure env,
 * call Telegram, send messages, change BotFather, add payment, unlock VIP,
 * write DB, add secrets, or set publicLaunchApproved=true.
 */

export type AphroditeOwnerRealDeviceApprovalStatus =
  | "PENDING_OWNER_REVIEW"
  | "READY_FOR_OWNER_REVIEW"
  | "PASS"
  | "BLOCKED"
  | "MANUAL REQUIRED"
  | "DOCUMENTED"
  | "NOT APPROVED";

export type AphroditeOwnerRealDeviceApprovalRow = {
  area: string;
  status: AphroditeOwnerRealDeviceApprovalStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeOwnerRealDeviceApprovalCaptureModel = {
  packageNumber: 287;
  title: string;
  route: "/dashboard/networks/zodiac/owner-real-device-approval-capture";
  currentMainHead: "86e77cf54a4bcb965a3a9614821c3061f7b17818";
  ownerApprovalStatus: "PENDING_OWNER_REVIEW";
  ownerRealDeviceApproval: false;
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  screenshotsRequired: number;
  screenshotsReceived: 0;
  requiredScreens: readonly AphroditeOwnerRealDeviceApprovalRow[];
  requiredDeviceChecks: readonly AphroditeOwnerRealDeviceApprovalRow[];
  evidenceSources: readonly AphroditeOwnerRealDeviceApprovalRow[];
  unresolvedProductionBlockers: readonly AphroditeOwnerRealDeviceApprovalRow[];
  safetyBoundaries: readonly AphroditeOwnerRealDeviceApprovalRow[];
  whatThisPackageDoesNotDo: readonly AphroditeOwnerRealDeviceApprovalRow[];
  nextPackageRecommendation: "Package 288 - Manual Env Setup Execution";
  safetyNotes: readonly string[];
  remainingBlockers: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    botFatherChanged: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    databaseWriteAdded: false;
    productionDbConnected: false;
    externalAnalyticsAdded: false;
    cronWorkflowPublishChanged: false;
    secretsAdded: false;
    envLocalCommitted: false;
    ownerRealDeviceApproval: false;
    publicLaunchApproved: false;
    ownerManualReviewRequired: true;
  };
};

export const APHRODITE_OWNER_REAL_DEVICE_APPROVAL_CAPTURE_TITLE =
  "Owner Real Device Approval Capture";

export const APHRODITE_OWNER_REAL_DEVICE_APPROVAL_CAPTURE_ROUTE =
  "/dashboard/networks/zodiac/owner-real-device-approval-capture" as const;

const requiredScreens: readonly AphroditeOwnerRealDeviceApprovalRow[] = [
  {
    area: "/miniapp",
    status: "PENDING_OWNER_REVIEW",
    detail: "Required owner screenshot for the public Mini App hub.",
    ownerAction: "Capture Android Telegram WebView evidence before approval can change.",
  },
  {
    area: "/compatibility",
    status: "PENDING_OWNER_REVIEW",
    detail: "Required owner screenshot for compatibility entry and result flow.",
    ownerAction: "Capture real-device evidence and confirm no dashboard shell.",
  },
  {
    area: "/birth-matrix",
    status: "PENDING_OWNER_REVIEW",
    detail: "Required owner screenshot for birth matrix entry and result flow.",
    ownerAction: "Capture real-device evidence and confirm layout quality.",
  },
  {
    area: "/vip-preview",
    status: "PENDING_OWNER_REVIEW",
    detail: "Required owner screenshot for locked VIP preview.",
    ownerAction: "Confirm no payment and no VIP unlock.",
  },
  {
    area: "/vip-compatibility-report",
    status: "PENDING_OWNER_REVIEW",
    detail: "Required owner screenshot for VIP compatibility report preview boundary.",
    ownerAction: "Confirm preview remains locked and no entitlement is granted.",
  },
  {
    area: "/miniapp?startapp=mystic",
    status: "PENDING_OWNER_REVIEW",
    detail: "Required owner screenshot for mystic startapp deep link.",
    ownerAction: "Open the startapp link in Telegram WebView and capture evidence.",
  },
  {
    area: "bottom nav",
    status: "PENDING_OWNER_REVIEW",
    detail: "Required owner screenshot/check for bottom nav visibility and tap behavior.",
    ownerAction: "Verify bottom navigation does not overlap content.",
  },
  {
    area: "date input 01012000 -> 01.01.2000",
    status: "PENDING_OWNER_REVIEW",
    detail: "Required owner check for date auto-format behavior.",
    ownerAction: "Type 01012000 and capture the formatted 01.01.2000 value.",
  },
  {
    area: "time input",
    status: "PENDING_OWNER_REVIEW",
    detail: "Required owner check for birth time input behavior.",
    ownerAction: "Enter a representative time value and capture the result.",
  },
  {
    area: "city input Днепр / Дніпро",
    status: "PENDING_OWNER_REVIEW",
    detail: "Required owner check for city input Днепр / Дніпро suggestions.",
    ownerAction: "Search both spellings and capture suggestion evidence.",
  },
];

const requiredDeviceChecks: readonly AphroditeOwnerRealDeviceApprovalRow[] = [
  {
    area: "Android Telegram WebView",
    status: "PENDING_OWNER_REVIEW",
    detail: "Android Telegram WebView is required for owner approval capture.",
    ownerAction: "Owner must approve or reject with Android evidence.",
  },
  {
    area: "iPhone Telegram WebView if available",
    status: "PENDING_OWNER_REVIEW",
    detail: "iPhone Telegram WebView if available should be included before approval.",
    ownerAction: "Capture iPhone evidence if the device is available.",
  },
  {
    area: "desktop browser sanity optional",
    status: "DOCUMENTED",
    detail: "desktop browser sanity optional check may support review but cannot replace Telegram WebView evidence.",
    ownerAction: "Use desktop only as supplemental sanity evidence.",
  },
];

const evidenceSources: readonly AphroditeOwnerRealDeviceApprovalRow[] = [
  {
    area: "docs/aphrodite-screenshots/package-275",
    status: "READY_FOR_OWNER_REVIEW",
    detail: "Existing Package 275 visual evidence folder contains 19 screenshots with duplicate validation PASS.",
    ownerAction: "Use as baseline visual evidence, not as final owner real-device approval.",
  },
  {
    area: "owner screenshots",
    status: "PENDING_OWNER_REVIEW",
    detail: "No owner screenshots or explicit approval evidence were provided with Package 287.",
    ownerAction: "Keep ownerApprovalStatus = PENDING_OWNER_REVIEW until owner evidence is supplied.",
  },
  {
    area: "public routes isolated",
    status: "PASS",
    detail: "Public Mini App routes remain isolated from dashboard/admin shell.",
    ownerAction: "Re-run shell isolation QA after route or layout changes.",
  },
];

const unresolvedProductionBlockers: readonly AphroditeOwnerRealDeviceApprovalRow[] = [
  {
    area: "DATABASE_URL missing",
    status: "BLOCKED",
    detail: "Production DB readiness remains blocked until DATABASE_URL is configured outside Git.",
    ownerAction: "Handle in Package 288 or later manual env setup execution.",
  },
  {
    area: "TELEGRAM_BOT_TOKEN missing",
    status: "BLOCKED",
    detail: "Telegram production readiness remains blocked until TELEGRAM_BOT_TOKEN is configured outside Git.",
    ownerAction: "Handle only through owner-approved manual env setup.",
  },
  {
    area: "backup older than 24h",
    status: "BLOCKED",
    detail: "Backup freshness remains blocked because the latest known backup is older than 24 hours.",
    ownerAction: "Refresh or confirm fresh backup evidence before launch can be reconsidered.",
  },
];

const safetyBoundaries: readonly AphroditeOwnerRealDeviceApprovalRow[] = [
  {
    area: "owner approval gate",
    status: "PENDING_OWNER_REVIEW",
    detail: "ownerRealDeviceApproval can only be true if owner explicitly provides approval evidence.",
    ownerAction: "Do not mark approval true without owner-provided approval evidence.",
  },
  {
    area: "launch gate",
    status: "NOT APPROVED",
    detail: "publicLaunchApproved=false remains mandatory after this package.",
    ownerAction: "Do not launch production from approval capture.",
  },
  {
    area: "manual review gate",
    status: "MANUAL REQUIRED",
    detail: "ownerManualReviewRequired=true remains mandatory.",
    ownerAction: "Keep owner review open until a separate approval package records final decision.",
  },
];

const whatThisPackageDoesNotDo: readonly AphroditeOwnerRealDeviceApprovalRow[] = [
  {
    area: "production launch",
    status: "NOT APPROVED",
    detail: "This package does NOT launch production or approve launch.",
    ownerAction: "Keep production blocked.",
  },
  {
    area: "Telegram and BotFather",
    status: "NOT APPROVED",
    detail: "This package does NOT call Telegram API, send messages, or change BotFather.",
    ownerAction: "Do not use TELEGRAM_BOT_TOKEN in this package.",
  },
  {
    area: "env and secrets",
    status: "NOT APPROVED",
    detail: "This package does NOT configure env secrets, commit secrets, or commit .env.local.",
    ownerAction: "Keep env setup for Package 288 or later.",
  },
  {
    area: "data and monetization",
    status: "NOT APPROVED",
    detail: "This package does NOT write to DB, add payment, or unlock VIP.",
    ownerAction: "Keep all VIP and payment surfaces locked or preview-only.",
  },
];

const safetyNotes = [
  "ownerApprovalStatus = PENDING_OWNER_REVIEW.",
  "ownerRealDeviceApproval=false.",
  "screenshots required: 10.",
  "screenshots received: 0.",
  "Android Telegram WebView documented.",
  "iPhone Telegram WebView if available documented.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
  "No production launch.",
  "No Telegram API or messages.",
  "No BotFather changes.",
  "No payment or VIP unlock.",
  "No DB writes.",
] as const;

const remainingBlockers = [
  "owner real-device approval pending",
  "owner screenshots not provided",
  "DATABASE_URL missing",
  "TELEGRAM_BOT_TOKEN missing",
  "backup older than 24h",
] as const;

export function getAphroditeOwnerRealDeviceApprovalCapture(): AphroditeOwnerRealDeviceApprovalCaptureModel {
  return {
    packageNumber: 287,
    title: APHRODITE_OWNER_REAL_DEVICE_APPROVAL_CAPTURE_TITLE,
    route: APHRODITE_OWNER_REAL_DEVICE_APPROVAL_CAPTURE_ROUTE,
    currentMainHead: "86e77cf54a4bcb965a3a9614821c3061f7b17818",
    ownerApprovalStatus: "PENDING_OWNER_REVIEW",
    ownerRealDeviceApproval: false,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    screenshotsRequired: requiredScreens.length,
    screenshotsReceived: 0,
    requiredScreens,
    requiredDeviceChecks,
    evidenceSources,
    unresolvedProductionBlockers,
    safetyBoundaries,
    whatThisPackageDoesNotDo,
    nextPackageRecommendation: "Package 288 - Manual Env Setup Execution",
    safetyNotes,
    remainingBlockers,
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      botFatherChanged: false,
      paymentAdded: false,
      vipUnlockAdded: false,
      databaseWriteAdded: false,
      productionDbConnected: false,
      externalAnalyticsAdded: false,
      cronWorkflowPublishChanged: false,
      secretsAdded: false,
      envLocalCommitted: false,
      ownerRealDeviceApproval: false,
      publicLaunchApproved: false,
      ownerManualReviewRequired: true,
    },
  };
}
