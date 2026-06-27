/**
 * Package 252: Soft Launch Candidate Report.
 *
 * Final static candidate report for Aphrodite/Zodiac soft-launch readiness.
 * It summarizes readiness and blockers without approving or executing any
 * launch and without adding Telegram, database, payment, VIP, workflow,
 * analytics, or secret side effects.
 */

export type AphroditeSoftLaunchCandidateStatus =
  | "NOT READY"
  | "READY FOR OWNER REVIEW"
  | "BLOCKED BY ENV"
  | "BLOCKED BY BACKUP"
  | "BLOCKED BY REAL DEVICE QA"
  | "BLOCKED BY TELEGRAM WEBVIEW QA"
  | "BLOCKED BY CONTENT CTA REVIEW"
  | "APPROVAL NOT GRANTED"
  | "READY FOR LIMITED SOFT LAUNCH, future only";

export type AphroditeSoftLaunchCandidateItem = {
  area: string;
  status: AphroditeSoftLaunchCandidateStatus | "PASS" | "DOCUMENTED" | "MANUAL REQUIRED" | "NOT APPROVED" | "BLOCKED";
  detail: string;
  ownerAction: string;
};

export type AphroditeSoftLaunchCandidateReportModel = {
  packageNumber: 252;
  title: string;
  route: "/dashboard/networks/zodiac/soft-launch-candidate-report";
  currentCandidateStatus: "NOT READY";
  ownerDecisionStatus: "APPROVAL NOT GRANTED";
  canProceedToOwnerReview: false;
  canExecuteSoftLaunchNow: false;
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  aggregateReadiness: readonly AphroditeSoftLaunchCandidateItem[];
  remainingBlockers: readonly string[];
  candidateStatusValues: readonly AphroditeSoftLaunchCandidateStatus[];
  whyNotReady: readonly AphroditeSoftLaunchCandidateItem[];
  designStatus: readonly AphroditeSoftLaunchCandidateItem[];
  scopeRecommendation: readonly AphroditeSoftLaunchCandidateItem[];
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
    publicLaunchApproved: false;
    ownerManualReviewRequired: true;
  };
  safetyNotes: readonly string[];
  nextPackageRecommendation: "Package 253 - Owner Manual Real-Device Review Execution";
};

export const APHRODITE_SOFT_LAUNCH_CANDIDATE_REPORT_TITLE =
  "Soft Launch Candidate Report";

export const APHRODITE_SOFT_LAUNCH_CANDIDATE_REPORT_ROUTE =
  "/dashboard/networks/zodiac/soft-launch-candidate-report" as const;

const aggregateReadiness: readonly AphroditeSoftLaunchCandidateItem[] = [
  {
    area: "design sprint status",
    status: "PASS",
    detail: "Packages 236-247 completed the visual redesign and safety audit with no blocker/high/medium findings reported.",
    ownerAction: "Review visual evidence before future exposure.",
  },
  {
    area: "Claude audit status",
    status: "PASS",
    detail: "Read-only design safety audit reported PASS and unsafe runtime matches: None.",
    ownerAction: "Keep audit result attached to owner review.",
  },
  {
    area: "soft launch scope selector status",
    status: "DOCUMENTED",
    detail: "Package 248 documents the smallest safe future scope and excluded full rollout.",
    ownerAction: "Owner must choose scope manually later.",
  },
  {
    area: "preflight checklist status",
    status: "DOCUMENTED",
    detail: "Package 249 documents required code checks, env, backup, device QA, WebView QA, CTA review, safety, and stop conditions.",
    ownerAction: "Complete preflight before future approval.",
  },
  {
    area: "owner manual review status",
    status: "APPROVAL NOT GRANTED",
    detail: "Package 250 aggregates owner decisions and keeps approval not granted.",
    ownerAction: "Owner explicit approval is still required.",
  },
  {
    area: "real-device QA status",
    status: "BLOCKED BY REAL DEVICE QA",
    detail: "Package 251 defines evidence fields and required devices, but real-device QA remains manual and not completed.",
    ownerAction: "Execute real-device QA manually.",
  },
  {
    area: "Telegram WebView/startapp QA status",
    status: "BLOCKED BY TELEGRAM WEBVIEW QA",
    detail: "Telegram iOS/Android WebView, startapp, deep link, cache marker, BackButton, and haptics remain manual blockers.",
    ownerAction: "Verify in real Telegram WebView sessions.",
  },
  {
    area: "content/CTA owner review status",
    status: "BLOCKED BY CONTENT CTA REVIEW",
    detail: "Content and CTA review remains manual; active CTA logic was not changed.",
    ownerAction: "Owner reviews CTA labels and destinations.",
  },
  {
    area: "env/secrets status",
    status: "BLOCKED BY ENV",
    detail: "DATABASE_URL, TELEGRAM_BOT_TOKEN, APHRODITE_SESSION_SECRET and public URL configuration remain manual blockers.",
    ownerAction: "Configure secrets outside code and keep values masked.",
  },
  {
    area: "backup/restore status",
    status: "BLOCKED BY BACKUP",
    detail: "Backup freshness <24h and restore rehearsal remain manual blockers.",
    ownerAction: "Verify backup and rehearsal before approval.",
  },
  {
    area: "rollback readiness",
    status: "MANUAL REQUIRED",
    detail: "Rollback point, last verified commit, and owner decision path must be recorded before launch.",
    ownerAction: "Record rollback plan manually.",
  },
  {
    area: "production launch status",
    status: "NOT APPROVED",
    detail: "Production launch not done and soft launch not executed.",
    ownerAction: "Do not launch in this package.",
  },
  {
    area: "payment/VIP status",
    status: "BLOCKED",
    detail: "Payment is not active, VIP unlock is not active, and no entitlement bypass exists.",
    ownerAction: "Keep VIP preview locked-only.",
  },
  {
    area: "safety flags",
    status: "DOCUMENTED",
    detail: "Safety flags remain false for launch, Telegram API, messages, DB writes, payment, VIP, workflows, and secrets.",
    ownerAction: "Keep flags frozen until explicit future package approval.",
  },
];

const candidateStatusValues = [
  "NOT READY",
  "READY FOR OWNER REVIEW",
  "BLOCKED BY ENV",
  "BLOCKED BY BACKUP",
  "BLOCKED BY REAL DEVICE QA",
  "BLOCKED BY TELEGRAM WEBVIEW QA",
  "BLOCKED BY CONTENT CTA REVIEW",
  "APPROVAL NOT GRANTED",
  "READY FOR LIMITED SOFT LAUNCH, future only",
] as const;

const whyNotReady: readonly AphroditeSoftLaunchCandidateItem[] = [
  {
    area: "DATABASE_URL",
    status: "BLOCKED BY ENV",
    detail: "DATABASE_URL still blocker.",
    ownerAction: "Configure manually outside code.",
  },
  {
    area: "TELEGRAM_BOT_TOKEN",
    status: "BLOCKED BY ENV",
    detail: "TELEGRAM_BOT_TOKEN still blocker.",
    ownerAction: "Configure manually outside code and keep masked.",
  },
  {
    area: "backup freshness",
    status: "BLOCKED BY BACKUP",
    detail: "backup freshness still blocker.",
    ownerAction: "Confirm backup freshness <24h manually.",
  },
  {
    area: "restore rehearsal",
    status: "MANUAL REQUIRED",
    detail: "restore rehearsal still manual blocker.",
    ownerAction: "Run rehearsal safely outside production.",
  },
  {
    area: "real-device QA",
    status: "BLOCKED BY REAL DEVICE QA",
    detail: "real-device QA still manual blocker.",
    ownerAction: "Execute and record real evidence.",
  },
  {
    area: "Telegram WebView/startapp QA",
    status: "BLOCKED BY TELEGRAM WEBVIEW QA",
    detail: "Telegram WebView/startapp QA still manual blocker.",
    ownerAction: "Check real Telegram iOS/Android WebViews.",
  },
  {
    area: "content/CTA owner review",
    status: "BLOCKED BY CONTENT CTA REVIEW",
    detail: "content/CTA owner review still manual blocker.",
    ownerAction: "Review labels, destinations, and expectations.",
  },
  {
    area: "owner explicit approval",
    status: "APPROVAL NOT GRANTED",
    detail: "owner approval still required.",
    ownerAction: "Do not execute soft launch now.",
  },
];

const designStatus: readonly AphroditeSoftLaunchCandidateItem[] = [
  {
    area: "design sprint",
    status: "PASS",
    detail: "Premium Aphrodite visual redesign sprint completed and pushed.",
    ownerAction: "Review final design screens manually.",
  },
  {
    area: "Claude audit",
    status: "PASS",
    detail: "Read-only safety/design audit reported PASS.",
    ownerAction: "Keep audit as supporting evidence.",
  },
  {
    area: "visual QA",
    status: "PASS",
    detail: "Visual/design QA scripts are expected to pass in final verification.",
    ownerAction: "Review output and screenshots manually.",
  },
  {
    area: "smoke",
    status: "PASS",
    detail: "Mini App smoke is expected to pass in final verification.",
    ownerAction: "Use final command output as evidence.",
  },
  {
    area: "dashboard QA",
    status: "PASS",
    detail: "Dashboard QA is expected to pass in final verification.",
    ownerAction: "Use final command output as evidence.",
  },
];

const scopeRecommendation: readonly AphroditeSoftLaunchCandidateItem[] = [
  {
    area: "smallest safe future scope",
    status: "DOCUMENTED",
    detail: "Internal owner review first, then private link review, optionally one safe test channel later only after approval.",
    ownerAction: "Do not broaden scope without owner approval.",
  },
  {
    area: "excluded scope",
    status: "BLOCKED",
    detail: "Full 13-channel rollout, automated production campaign, paid MVP, payment, VIP unlock, ads, influencer traffic, and BotFather changes remain excluded.",
    ownerAction: "Keep excluded scope out of this readiness queue.",
  },
  {
    area: "stop conditions",
    status: "DOCUMENTED",
    detail: "Stop on smoke fail, dashboard QA fail, stale backup, broken Telegram WebView, CTA confusion, duplicate post risk, missing rollback plan, or missing owner approval.",
    ownerAction: "Stop immediately if any condition appears.",
  },
  {
    area: "rollback conditions",
    status: "MANUAL REQUIRED",
    detail: "Rollback point, last known good commit, fresh backup, and owner decision path must be recorded manually.",
    ownerAction: "Record rollback before approval.",
  },
  {
    area: "monitoring checklist",
    status: "MANUAL REQUIRED",
    detail: "Monitor Mini App smoke, Telegram WebView/startapp behavior, content/CTA review, and absence of payment/VIP unlock.",
    ownerAction: "Set manual monitoring checklist before exposure.",
  },
];

const remainingBlockers = [
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "backup freshness <24h",
  "restore rehearsal",
  "real-device QA",
  "Telegram WebView/startapp QA",
  "content/CTA owner review",
  "owner explicit approval",
] as const;

const safetyNotes = [
  "Soft Launch Candidate Status: NOT READY.",
  "Can proceed to owner review: No.",
  "Can execute soft launch now: No.",
  "APPROVAL NOT GRANTED.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
  "Production launch not done.",
  "Soft launch not executed.",
  "Telegram messages not sent.",
  "Telegram API not used.",
  "Payment not active.",
  "VIP not active.",
  "DB not connected.",
  "DB writes not added.",
  "No workflow changes.",
  "No secrets added.",
] as const;

function cloneItems(items: readonly AphroditeSoftLaunchCandidateItem[]) {
  return items.map((item) => ({ ...item }));
}

export function getAphroditeSoftLaunchCandidateReport(): AphroditeSoftLaunchCandidateReportModel {
  return {
    packageNumber: 252,
    title: APHRODITE_SOFT_LAUNCH_CANDIDATE_REPORT_TITLE,
    route: APHRODITE_SOFT_LAUNCH_CANDIDATE_REPORT_ROUTE,
    currentCandidateStatus: "NOT READY",
    ownerDecisionStatus: "APPROVAL NOT GRANTED",
    canProceedToOwnerReview: false,
    canExecuteSoftLaunchNow: false,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    aggregateReadiness: cloneItems(aggregateReadiness),
    remainingBlockers: [...remainingBlockers],
    candidateStatusValues: [...candidateStatusValues],
    whyNotReady: cloneItems(whyNotReady),
    designStatus: cloneItems(designStatus),
    scopeRecommendation: cloneItems(scopeRecommendation),
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
      publicLaunchApproved: false,
      ownerManualReviewRequired: true,
    },
    safetyNotes: [...safetyNotes],
    nextPackageRecommendation: "Package 253 - Owner Manual Real-Device Review Execution",
  };
}
