/**
 * Package 250: Owner Manual Review Pack.
 *
 * Static owner-facing review pack only. It aggregates final soft-launch
 * blockers and decision states without granting approval, launching,
 * sending Telegram messages, enabling payments, unlocking VIP, writing data,
 * or changing workflows.
 */

export type AphroditeOwnerReviewStatus =
  | "DOCUMENTED"
  | "MANUAL REQUIRED"
  | "OWNER REVIEW REQUIRED"
  | "BLOCKED"
  | "NOT APPROVED";

export type AphroditeOwnerReviewItem = {
  area: string;
  status: AphroditeOwnerReviewStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeOwnerManualReviewPackModel = {
  packageNumber: 250;
  title: string;
  route: "/dashboard/networks/zodiac/owner-manual-review-pack";
  currentStatus: "APPROVAL NOT GRANTED";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  reviewSummaries: readonly AphroditeOwnerReviewItem[];
  blockerStatuses: readonly AphroditeOwnerReviewItem[];
  paymentVipLockedStatus: readonly AphroditeOwnerReviewItem[];
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
    autoApprovalAdded: false;
    manualChecksMarkedComplete: false;
    publicLaunchApproved: false;
    ownerManualReviewRequired: true;
  };
  finalOwnerDecisionStates: readonly string[];
  safetyNotes: readonly string[];
  remainingBlockers: readonly string[];
  nextPackageRecommendation: "Package 251 - Real Device QA Execution Gate";
};

export const APHRODITE_OWNER_MANUAL_REVIEW_PACK_TITLE =
  "Owner Manual Review Pack";

export const APHRODITE_OWNER_MANUAL_REVIEW_PACK_ROUTE =
  "/dashboard/networks/zodiac/owner-manual-review-pack" as const;

const reviewSummaries: readonly AphroditeOwnerReviewItem[] = [
  {
    area: "current status: approval not granted",
    status: "NOT APPROVED",
    detail: "No owner approval has been granted for public or limited soft launch.",
    ownerAction: "Keep launch frozen until explicit owner approval is recorded outside code.",
  },
  {
    area: "design sprint review summary",
    status: "DOCUMENTED",
    detail: "Packages 236-247 moved the Mini App into premium Aphrodite visual readiness with design/safety QA passing.",
    ownerAction: "Review screenshots and design QA notes before any exposure.",
  },
  {
    area: "soft launch scope summary",
    status: "DOCUMENTED",
    detail: "Package 248 recommends the smallest future scope: internal owner review first, private link review, then optional safe test channel only after approval.",
    ownerAction: "Confirm the future scope and keep full 13-channel rollout excluded.",
  },
  {
    area: "preflight checklist summary",
    status: "DOCUMENTED",
    detail: "Package 249 lists code checks, env blockers, backup, real-device QA, Telegram WebView QA, CTA review, safety, and stop conditions.",
    ownerAction: "Complete the preflight manually before approving a future limited soft launch.",
  },
  {
    area: "content/CTA review status",
    status: "OWNER REVIEW REQUIRED",
    detail: "Home, compatibility, Birth Matrix, Mystic Cards, VIP preview, and result/share CTAs still require owner review.",
    ownerAction: "Confirm copy, destinations, and no active payment promise.",
  },
  {
    area: "real-device QA status",
    status: "MANUAL REQUIRED",
    detail: "Real-device QA is not completed automatically and remains a manual blocker.",
    ownerAction: "Collect device, OS, Telegram version, screenshots, notes, and pass/fail evidence.",
  },
  {
    area: "Telegram WebView/startapp QA status",
    status: "MANUAL REQUIRED",
    detail: "Telegram WebView, startapp, deep link, cache marker, BackButton, haptics, and fallback behavior require manual checks.",
    ownerAction: "Verify on Telegram iOS and Android WebView before any exposure.",
  },
  {
    area: "backup/restore status",
    status: "MANUAL REQUIRED",
    detail: "Backup freshness <24h, restore rehearsal, rollback point, and last verified commit remain manual blockers.",
    ownerAction: "Verify backup and rehearse restore outside production before launch.",
  },
  {
    area: "env status",
    status: "MANUAL REQUIRED",
    detail: "DATABASE_URL, TELEGRAM_BOT_TOKEN, APHRODITE_SESSION_SECRET, public app URL, and Telegram Mini App URL remain manual setup items.",
    ownerAction: "Configure secrets outside code and keep all values masked.",
  },
  {
    area: "rollback plan status",
    status: "OWNER REVIEW REQUIRED",
    detail: "Rollback owner, rollback point, last known good commit, and restore confidence must be understood.",
    ownerAction: "Record rollback decision path before approval.",
  },
];

const blockerStatuses: readonly AphroditeOwnerReviewItem[] = [
  {
    area: "DATABASE_URL",
    status: "BLOCKED",
    detail: "Manual production database configuration is required.",
    ownerAction: "Configure in production secret store only; do not commit.",
  },
  {
    area: "TELEGRAM_BOT_TOKEN",
    status: "BLOCKED",
    detail: "Manual production Telegram token configuration is required before Telegram operations.",
    ownerAction: "Configure manually, keep masked, rotate if leaked.",
  },
  {
    area: "backup freshness <24h",
    status: "BLOCKED",
    detail: "Fresh backup evidence is required before future soft launch.",
    ownerAction: "Verify timestamp and location manually.",
  },
  {
    area: "restore rehearsal",
    status: "MANUAL REQUIRED",
    detail: "Restore rehearsal has not been completed automatically.",
    ownerAction: "Run rehearsal in a safe non-production target and record result.",
  },
  {
    area: "real-device QA",
    status: "MANUAL REQUIRED",
    detail: "Real-device QA evidence is still required.",
    ownerAction: "Do not mark complete without real screenshots and notes.",
  },
  {
    area: "Telegram WebView/startapp QA",
    status: "MANUAL REQUIRED",
    detail: "Telegram WebView/startapp checks remain manual.",
    ownerAction: "Verify in real Telegram WebViews and record evidence.",
  },
  {
    area: "content/CTA owner review",
    status: "OWNER REVIEW REQUIRED",
    detail: "CTA copy and destinations still need owner sign-off.",
    ownerAction: "Review all entry points before approval.",
  },
  {
    area: "owner explicit approval",
    status: "NOT APPROVED",
    detail: "Owner approval has not been granted.",
    ownerAction: "Stop before launch until explicit approval is provided.",
  },
];

const paymentVipLockedStatus: readonly AphroditeOwnerReviewItem[] = [
  {
    area: "payment/VIP locked status",
    status: "BLOCKED",
    detail: "No payment is active, no Telegram Stars invoice is active, and VIP remains locked preview-only.",
    ownerAction: "Stop if any payment or VIP unlock appears active before a separate approved package.",
  },
  {
    area: "no payment",
    status: "BLOCKED",
    detail: "No checkout, invoice, pre-checkout, successful payment, or Stars flow is enabled.",
    ownerAction: "Keep payment disabled.",
  },
  {
    area: "no VIP unlock",
    status: "BLOCKED",
    detail: "No VIP unlock or entitlement bypass is active.",
    ownerAction: "Keep VIP preview locked-only until future approved entitlement work.",
  },
];

const finalOwnerDecisionStates = [
  "NOT READY",
  "READY FOR OWNER REVIEW",
  "BLOCKED BY ENV",
  "BLOCKED BY BACKUP",
  "BLOCKED BY REAL DEVICE QA",
  "BLOCKED BY TELEGRAM WEBVIEW QA",
  "BLOCKED BY CONTENT CTA REVIEW",
  "APPROVAL NOT GRANTED",
  "READY FOR LIMITED SOFT LAUNCH, future state only",
] as const;

const safetyNotes = [
  "No owner approval has been granted.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
  "No production launch.",
  "No Telegram messages.",
  "No Telegram API calls.",
  "No payment.",
  "No VIP unlock.",
  "No DB writes.",
  "No cron/workflow/publish script changes.",
  "Manual checks are not marked complete automatically.",
] as const;

const remainingBlockers = [
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "APHRODITE_SESSION_SECRET",
  "backup freshness <24h",
  "restore rehearsal",
  "real-device QA",
  "Telegram WebView/startapp QA",
  "content/CTA owner review",
  "rollback plan",
  "owner explicit approval",
] as const;

function cloneItems(items: readonly AphroditeOwnerReviewItem[]) {
  return items.map((item) => ({ ...item }));
}

export function getAphroditeOwnerManualReviewPack(): AphroditeOwnerManualReviewPackModel {
  return {
    packageNumber: 250,
    title: APHRODITE_OWNER_MANUAL_REVIEW_PACK_TITLE,
    route: APHRODITE_OWNER_MANUAL_REVIEW_PACK_ROUTE,
    currentStatus: "APPROVAL NOT GRANTED",
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    reviewSummaries: cloneItems(reviewSummaries),
    blockerStatuses: cloneItems(blockerStatuses),
    paymentVipLockedStatus: cloneItems(paymentVipLockedStatus),
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
      autoApprovalAdded: false,
      manualChecksMarkedComplete: false,
      publicLaunchApproved: false,
      ownerManualReviewRequired: true,
    },
    finalOwnerDecisionStates: [...finalOwnerDecisionStates],
    safetyNotes: [...safetyNotes],
    remainingBlockers: [...remainingBlockers],
    nextPackageRecommendation: "Package 251 - Real Device QA Execution Gate",
  };
}
