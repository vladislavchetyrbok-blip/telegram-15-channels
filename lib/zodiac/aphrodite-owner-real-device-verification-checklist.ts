/**
 * Package 282: Owner Real Device Verification Checklist.
 *
 * Static owner checklist only. This package does not run real-device tests,
 * approve launch, call Telegram, send messages, enable payment, unlock VIP,
 * write data, or change production configuration.
 */

export type AphroditeOwnerRealDeviceStatus =
  | "OWNER REVIEW REQUIRED"
  | "MANUAL REQUIRED"
  | "DOCUMENTED"
  | "NOT APPROVED";

export type AphroditeOwnerRealDeviceRow = {
  area: string;
  status: AphroditeOwnerRealDeviceStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeOwnerRealDeviceVerificationChecklistModel = {
  packageNumber: 282;
  title: string;
  route: "/dashboard/networks/zodiac/owner-real-device-verification-checklist";
  ownerRealDeviceApproval: false;
  ownerManualReviewRequired: true;
  publicLaunchApproved: false;
  deviceMatrix: readonly AphroditeOwnerRealDeviceRow[];
  publicRouteChecks: readonly AphroditeOwnerRealDeviceRow[];
  inputBehaviorChecks: readonly AphroditeOwnerRealDeviceRow[];
  visualShellChecks: readonly AphroditeOwnerRealDeviceRow[];
  forbiddenOutcomeChecks: readonly AphroditeOwnerRealDeviceRow[];
  nextPackageRecommendation: "Package 283 - Soft Launch Dry Run and Rollback Plan";
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

export const APHRODITE_OWNER_REAL_DEVICE_VERIFICATION_CHECKLIST_TITLE =
  "Owner Real Device Verification Checklist";

export const APHRODITE_OWNER_REAL_DEVICE_VERIFICATION_CHECKLIST_ROUTE =
  "/dashboard/networks/zodiac/owner-real-device-verification-checklist" as const;

const deviceMatrix: readonly AphroditeOwnerRealDeviceRow[] = [
  {
    area: "Android Telegram WebView",
    status: "OWNER REVIEW REQUIRED",
    detail: "Android Telegram WebView must be checked manually by the owner or delegated reviewer.",
    ownerAction: "Open the approved public URL inside Telegram on Android and record pass/fail evidence.",
  },
  {
    area: "iPhone Telegram WebView",
    status: "OWNER REVIEW REQUIRED",
    detail: "iPhone Telegram WebView must be checked manually by the owner or delegated reviewer.",
    ownerAction: "Open the approved public URL inside Telegram on iPhone and record pass/fail evidence.",
  },
];

const publicRouteChecks: readonly AphroditeOwnerRealDeviceRow[] = [
  {
    area: "/miniapp",
    status: "MANUAL REQUIRED",
    detail: "Verify public Mini App hub loads without dashboard shell.",
    ownerAction: "Capture screen evidence from both devices.",
  },
  {
    area: "/compatibility",
    status: "MANUAL REQUIRED",
    detail: "Verify compatibility entry and result flow on real devices.",
    ownerAction: "Complete a manual compatibility smoke check.",
  },
  {
    area: "/birth-matrix",
    status: "MANUAL REQUIRED",
    detail: "Verify birth matrix entry and result flow on real devices.",
    ownerAction: "Complete a manual birth matrix smoke check.",
  },
  {
    area: "/vip-preview",
    status: "MANUAL REQUIRED",
    detail: "Verify VIP preview remains locked and preview-only.",
    ownerAction: "Confirm no payment and no VIP unlock appear.",
  },
  {
    area: "/vip-compatibility-report",
    status: "MANUAL REQUIRED",
    detail: "Verify VIP compatibility report preview remains bounded and locked.",
    ownerAction: "Confirm no entitlement grant appears.",
  },
];

const inputBehaviorChecks: readonly AphroditeOwnerRealDeviceRow[] = [
  {
    area: "date input 01012000 -> 01.01.2000",
    status: "MANUAL REQUIRED",
    detail: "date input 01012000 -> 01.01.2000 must be verified in Telegram WebView.",
    ownerAction: "Type 01012000 and confirm auto-format to 01.01.2000.",
  },
  {
    area: "time input",
    status: "MANUAL REQUIRED",
    detail: "time input must accept and format the expected birth time value without layout shift.",
    ownerAction: "Enter a representative time value on Android and iPhone.",
  },
  {
    area: "city Днепр / Дніпро suggestions",
    status: "MANUAL REQUIRED",
    detail: "city Днепр / Дніпро suggestions must appear in the city autocomplete.",
    ownerAction: "Search both spellings and capture suggestion behavior.",
  },
];

const visualShellChecks: readonly AphroditeOwnerRealDeviceRow[] = [
  {
    area: "bottom nav",
    status: "MANUAL REQUIRED",
    detail: "bottom nav must remain visible, usable, and not overlap content.",
    ownerAction: "Check tap targets and route changes on both devices.",
  },
  {
    area: "no Aphrodite",
    status: "MANUAL REQUIRED",
    detail: "no Aphrodite branding or admin copy should appear on public Mini App screens.",
    ownerAction: "Reject any public screen showing Aphrodite dashboard language.",
  },
  {
    area: "no admin shell",
    status: "MANUAL REQUIRED",
    detail: "no admin shell, sidebar, dashboard chrome, or internal controls should appear.",
    ownerAction: "Confirm public routes are isolated from dashboard layout.",
  },
  {
    area: "no horizontal overflow",
    status: "MANUAL REQUIRED",
    detail: "no horizontal overflow should appear on Android or iPhone Telegram WebView.",
    ownerAction: "Swipe horizontally and inspect narrow viewport behavior.",
  },
];

const forbiddenOutcomeChecks: readonly AphroditeOwnerRealDeviceRow[] = [
  {
    area: "no payment",
    status: "NOT APPROVED",
    detail: "no payment or invoice flow should be active during owner real-device verification.",
    ownerAction: "Stop and report if payment UI is active.",
  },
  {
    area: "no VIP unlock",
    status: "NOT APPROVED",
    detail: "no VIP unlock or entitlement grant should occur during verification.",
    ownerAction: "Stop and report if locked content becomes unlocked.",
  },
  {
    area: "no Telegram send",
    status: "NOT APPROVED",
    detail: "no Telegram send, no messages, and no Telegram API action should occur.",
    ownerAction: "Do not submit any real bot action from this checklist.",
  },
];

const safetyNotes = [
  "ownerRealDeviceApproval = false.",
  "ownerManualReviewRequired=true.",
  "publicLaunchApproved=false.",
  "Android Telegram WebView requires manual owner check.",
  "iPhone Telegram WebView requires manual owner check.",
  "No payment.",
  "No VIP unlock.",
  "No Telegram send.",
  "No admin shell.",
] as const;

const remainingBlockers = [
  "owner real device visual approval not granted",
  "DATABASE_URL missing",
  "TELEGRAM_BOT_TOKEN missing",
  "backup older than 24h",
  "restore rehearsal not verified",
  "public URL not approved",
] as const;

export function getAphroditeOwnerRealDeviceVerificationChecklist(): AphroditeOwnerRealDeviceVerificationChecklistModel {
  return {
    packageNumber: 282,
    title: APHRODITE_OWNER_REAL_DEVICE_VERIFICATION_CHECKLIST_TITLE,
    route: APHRODITE_OWNER_REAL_DEVICE_VERIFICATION_CHECKLIST_ROUTE,
    ownerRealDeviceApproval: false,
    ownerManualReviewRequired: true,
    publicLaunchApproved: false,
    deviceMatrix,
    publicRouteChecks,
    inputBehaviorChecks,
    visualShellChecks,
    forbiddenOutcomeChecks,
    nextPackageRecommendation: "Package 283 - Soft Launch Dry Run and Rollback Plan",
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
