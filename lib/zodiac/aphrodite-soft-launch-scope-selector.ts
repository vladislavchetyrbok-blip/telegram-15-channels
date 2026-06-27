/**
 * Package 248: Soft Launch Scope Selector.
 *
 * Static owner-facing selector only. It defines the smallest safe future
 * soft-launch scope and keeps all production, Telegram, database, payment,
 * VIP, workflow, publish, secret, and approval actions blocked.
 */

export type AphroditeSoftLaunchScopeStatus =
  | "RECOMMENDED"
  | "OPTIONAL LATER"
  | "MANUAL REQUIRED"
  | "OWNER REVIEW REQUIRED"
  | "BLOCKED"
  | "NOT APPROVED"
  | "APPROVAL NOT GRANTED"
  | "FUTURE STATE ONLY";

export type AphroditeSoftLaunchScopeItem = {
  area: string;
  status: AphroditeSoftLaunchScopeStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeSoftLaunchScopeSelectorModel = {
  packageNumber: 248;
  title: string;
  route: "/dashboard/networks/zodiac/soft-launch-scope-selector";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  currentOwnerDecisionState: "APPROVAL NOT GRANTED";
  recommendedScope: readonly AphroditeSoftLaunchScopeItem[];
  excludedScope: readonly AphroditeSoftLaunchScopeItem[];
  candidateChannels: readonly AphroditeSoftLaunchScopeItem[];
  candidateMiniAppFlows: readonly AphroditeSoftLaunchScopeItem[];
  manualPrerequisites: readonly AphroditeSoftLaunchScopeItem[];
  safetyBoundaries: readonly AphroditeSoftLaunchScopeItem[];
  launchModes: readonly AphroditeSoftLaunchScopeItem[];
  rollbackConditions: readonly AphroditeSoftLaunchScopeItem[];
  stopConditions: readonly AphroditeSoftLaunchScopeItem[];
  monitoringChecklist: readonly AphroditeSoftLaunchScopeItem[];
  ownerDecisionStates: readonly AphroditeSoftLaunchScopeItem[];
  nextPackageRecommendation: "Package 249 - Soft Launch Preflight Checklist";
  safetyNotes: readonly string[];
  remainingBlockers: readonly string[];
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
    manualChecksMarkedComplete: false;
    publicLaunchApproved: false;
    ownerManualReviewRequired: true;
  };
};

export const APHRODITE_SOFT_LAUNCH_SCOPE_SELECTOR_TITLE =
  "Soft Launch Scope Selector";

export const APHRODITE_SOFT_LAUNCH_SCOPE_SELECTOR_ROUTE =
  "/dashboard/networks/zodiac/soft-launch-scope-selector" as const;

const recommendedScope: readonly AphroditeSoftLaunchScopeItem[] = [
  {
    area: "recommended smallest scope: Internal owner review only",
    status: "RECOMMENDED",
    detail: "Start with one general/internal test path first, using private owner review and no public campaign.",
    ownerAction: "Owner reviews the live link, records evidence, and keeps launch approval blocked.",
  },
  {
    area: "Private link smoke review",
    status: "RECOMMENDED",
    detail: "Use a private link for manual smoke review before any channel exposure.",
    ownerAction: "Share only with the owner/testers who are explicitly part of manual review.",
  },
  {
    area: "One safe test channel, if owner approves later",
    status: "OPTIONAL LATER",
    detail: "A single safe test channel can be considered only after all manual prerequisites are complete.",
    ownerAction: "Approve explicitly in a future package; do not enable from this selector.",
  },
  {
    area: "General channel only, if owner approves later",
    status: "OPTIONAL LATER",
    detail: "General channel only is the broadest candidate in the first limited soft-launch stage.",
    ownerAction: "Confirm content/CTA review and rollback readiness first.",
  },
  {
    area: "Optional 1-2 sign channels only after manual owner approval",
    status: "OPTIONAL LATER",
    detail: "One sign channel or two sign channels can be considered after owner approval, not automatically.",
    ownerAction: "Choose signs manually and verify channel mapping before any future send.",
  },
];

const excludedScope: readonly AphroditeSoftLaunchScopeItem[] = [
  {
    area: "full 13-channel rollout",
    status: "BLOCKED",
    detail: "Full Zodiac network rollout is excluded from this soft-launch scope.",
    ownerAction: "Keep blocked until owner approves a later staged rollout.",
  },
  {
    area: "real Telegram Stars payment",
    status: "BLOCKED",
    detail: "Real payment, invoice, and checkout behavior remain out of scope.",
    ownerAction: "Do not add or activate payment from this selector.",
  },
  {
    area: "VIP unlock",
    status: "BLOCKED",
    detail: "VIP remains preview-only and no entitlement bypass is allowed.",
    ownerAction: "Keep VIP locked until a separate approved entitlement/payment package.",
  },
  {
    area: "paid MVP",
    status: "BLOCKED",
    detail: "Paid MVP launch is excluded from this limited scope selector.",
    ownerAction: "Complete a separate paid readiness path later.",
  },
  {
    area: "external ads and influencer traffic",
    status: "BLOCKED",
    detail: "External traffic sources are excluded until the owner approves broader growth.",
    ownerAction: "Do not run ads or influencer traffic during the first limited test.",
  },
  {
    area: "automated production campaign",
    status: "BLOCKED",
    detail: "Automated public campaign and irreversible workflow changes are excluded.",
    ownerAction: "Keep cron/workflows/publish scripts unchanged.",
  },
  {
    area: "BotFather changes without manual checklist",
    status: "BLOCKED",
    detail: "BotFather configuration changes are excluded without a manual checklist.",
    ownerAction: "Do not change BotFather from this package.",
  },
];

const candidateChannels: readonly AphroditeSoftLaunchScopeItem[] = [
  {
    area: "Internal owner review only",
    status: "RECOMMENDED",
    detail: "Safest candidate: no public channel send and no audience exposure.",
    ownerAction: "Use this as the first manual validation path.",
  },
  {
    area: "Private link smoke review",
    status: "RECOMMENDED",
    detail: "Private link review can validate live routing and Telegram WebView behavior without channel rollout.",
    ownerAction: "Owner controls distribution and collects notes.",
  },
  {
    area: "One safe test channel",
    status: "OPTIONAL LATER",
    detail: "A single test channel may be used later if env, backup, QA, CTA review, and owner approval are complete.",
    ownerAction: "Select manually; do not change channel mappings here.",
  },
  {
    area: "One sign channel",
    status: "OPTIONAL LATER",
    detail: "A single sign channel can be considered after manual approval and content review.",
    ownerAction: "Verify sign channel destination and rollback criteria later.",
  },
  {
    area: "General channel only",
    status: "OPTIONAL LATER",
    detail: "General channel is a possible limited scope after owner approval, not current approval.",
    ownerAction: "Approve explicitly in a future preflight/go decision.",
  },
];

const candidateMiniAppFlows: readonly AphroditeSoftLaunchScopeItem[] = [
  {
    area: "Home",
    status: "OWNER REVIEW REQUIRED",
    detail: "Home screen can be manually validated as a limited soft-launch flow.",
    ownerAction: "Check first viewport, CTA clarity, and Telegram WebView spacing.",
  },
  {
    area: "Compatibility",
    status: "OWNER REVIEW REQUIRED",
    detail: "Compatibility flow can be manually validated with existing smoke-green behavior.",
    ownerAction: "Review the reorganized internal /compatibility?startapp=... CTA destinations.",
  },
  {
    area: "Birth Matrix",
    status: "OWNER REVIEW REQUIRED",
    detail: "Birth Matrix can be manually validated with existing date input and result preview.",
    ownerAction: "Verify date input, result readability, and no horizontal overflow.",
  },
  {
    area: "Mystic Cards",
    status: "OWNER REVIEW REQUIRED",
    detail: "Mystic Cards can be manually validated as a preview/result flow.",
    ownerAction: "Verify Daily, Tarot, Rune, and no storage/randomness regressions.",
  },
  {
    area: "VIP preview locked-only",
    status: "OWNER REVIEW REQUIRED",
    detail: "VIP can be shown only as locked preview; no payment and no unlock.",
    ownerAction: "Confirm copy does not imply active purchase or entitlement.",
  },
  {
    area: "Result/share cards preview-only",
    status: "OWNER REVIEW REQUIRED",
    detail: "Result/share cards can be reviewed visually only; no real Telegram share/send API is added.",
    ownerAction: "Verify cards are readable and share-ready in appearance only.",
  },
];

const manualPrerequisites: readonly AphroditeSoftLaunchScopeItem[] = [
  {
    area: "DATABASE_URL configured manually",
    status: "MANUAL REQUIRED",
    detail: "Production DATABASE_URL must be configured manually in the approved secret store.",
    ownerAction: "Configure outside code; never commit or paste the value.",
  },
  {
    area: "TELEGRAM_BOT_TOKEN configured manually",
    status: "MANUAL REQUIRED",
    detail: "Production Telegram bot token must be configured manually before any real Telegram operation.",
    ownerAction: "Configure outside code, keep masked, rotate if leaked.",
  },
  {
    area: "backup freshness <24h confirmed",
    status: "MANUAL REQUIRED",
    detail: "Backup freshness must be confirmed below 24 hours before future launch.",
    ownerAction: "Record timestamp, location, reviewer, and evidence.",
  },
  {
    area: "restore rehearsal completed",
    status: "MANUAL REQUIRED",
    detail: "Restore rehearsal must be completed in a safe non-production target.",
    ownerAction: "Record result and rollback owner.",
  },
  {
    area: "real-device QA completed manually",
    status: "OWNER REVIEW REQUIRED",
    detail: "Real-device QA evidence must be completed manually.",
    ownerAction: "Attach screenshots and notes for target devices.",
  },
  {
    area: "Telegram WebView/startapp QA completed manually",
    status: "OWNER REVIEW REQUIRED",
    detail: "Telegram WebView/startapp/deep-link behavior must be checked on real devices.",
    ownerAction: "Record iOS/Android Telegram version, startapp behavior, and cache marker.",
  },
  {
    area: "content/CTA owner review completed",
    status: "OWNER REVIEW REQUIRED",
    detail: "Final content and CTA destinations must be reviewed by owner.",
    ownerAction: "Confirm the known LOW CTA reorganization item is acceptable.",
  },
  {
    area: "owner explicit approval",
    status: "OWNER REVIEW REQUIRED",
    detail: "Owner explicit approval is still required and not granted by this package.",
    ownerAction: "Do not proceed without a future explicit go decision.",
  },
  {
    area: "rollback plan understood",
    status: "OWNER REVIEW REQUIRED",
    detail: "Rollback point, deployment rollback, backup, restore, and stop owner must be understood.",
    ownerAction: "Review rollback conditions and document the owner.",
  },
];

const safetyBoundaries: readonly AphroditeSoftLaunchScopeItem[] = [
  {
    area: "no production launch",
    status: "BLOCKED",
    detail: "This selector does not launch production or approve public launch.",
    ownerAction: "Keep publicLaunchApproved=false.",
  },
  {
    area: "no Telegram API",
    status: "BLOCKED",
    detail: "No Telegram API calls are allowed in this package.",
    ownerAction: "Do not send, configure webhook, or change BotFather.",
  },
  {
    area: "no active CTA logic or channel mapping changes",
    status: "BLOCKED",
    detail: "CTA behavior and channel mappings remain unchanged.",
    ownerAction: "Review content/CTA manually before any future send.",
  },
  {
    area: "no DB writes, external analytics, payments, VIP unlock, or entitlement bypass",
    status: "BLOCKED",
    detail: "The package is static readiness only and adds no runtime side effects.",
    ownerAction: "Keep all implementation paths locked.",
  },
];

const launchModes: readonly AphroditeSoftLaunchScopeItem[] = [
  {
    area: "NOT READY",
    status: "NOT APPROVED",
    detail: "Current launch mode remains not ready because owner approval is not granted.",
    ownerAction: "Clear blockers manually before any future decision.",
  },
  {
    area: "Internal owner review only",
    status: "RECOMMENDED",
    detail: "Safest future mode for first evidence review.",
    ownerAction: "Use private review without public sending.",
  },
  {
    area: "Limited soft launch",
    status: "FUTURE STATE ONLY",
    detail: "Possible only after manual prerequisites and explicit owner approval.",
    ownerAction: "Requires Package 249 preflight and a future go/no-go decision.",
  },
];

const rollbackConditions: readonly AphroditeSoftLaunchScopeItem[] = [
  {
    area: "fresh backup verified",
    status: "MANUAL REQUIRED",
    detail: "Rollback depends on backup freshness and restore confidence.",
    ownerAction: "Verify backup <24h and restore rehearsal before future launch.",
  },
  {
    area: "last known good commit recorded",
    status: "MANUAL REQUIRED",
    detail: "Rollback point must identify the last verified commit and deployment.",
    ownerAction: "Record commit, deployment URL, and owner.",
  },
  {
    area: "stop owner identified",
    status: "OWNER REVIEW REQUIRED",
    detail: "Owner must know who can stop the soft launch and when.",
    ownerAction: "Document stop authority before launch.",
  },
];

const stopConditions: readonly AphroditeSoftLaunchScopeItem[] = [
  {
    area: "Telegram WebView broken",
    status: "BLOCKED",
    detail: "Stop if Telegram WebView/startapp behavior fails on real devices.",
    ownerAction: "Pause rollout and capture evidence.",
  },
  {
    area: "content/CTA confusion",
    status: "BLOCKED",
    detail: "Stop if users land on unexpected routes or CTA copy is misleading.",
    ownerAction: "Resolve owner CTA review before resuming.",
  },
  {
    area: "payment or VIP appears active",
    status: "BLOCKED",
    detail: "Stop immediately if payment or VIP unlock appears active.",
    ownerAction: "Rollback or disable the surface and investigate.",
  },
  {
    area: "runtime errors or high-risk visual issues",
    status: "BLOCKED",
    detail: "Stop if smoke, dashboard QA, console errors, or visual blockers appear.",
    ownerAction: "Fix and rerun checks before any further exposure.",
  },
];

const monitoringChecklist: readonly AphroditeSoftLaunchScopeItem[] = [
  {
    area: "Mini App smoke status",
    status: "MANUAL REQUIRED",
    detail: "Mini App smoke must stay green before and after any future limited exposure.",
    ownerAction: "Run smoke and record result.",
  },
  {
    area: "Telegram WebView/startapp behavior",
    status: "OWNER REVIEW REQUIRED",
    detail: "Monitor real-device WebView, BackButton, haptics, cache marker, and startapp paths.",
    ownerAction: "Collect screenshots and notes.",
  },
  {
    area: "content/CTA owner review",
    status: "OWNER REVIEW REQUIRED",
    detail: "Monitor CTA clarity and the known LOW internal route reorganization item.",
    ownerAction: "Approve or request copy/route fixes.",
  },
  {
    area: "no payment, no VIP unlock, no entitlement bypass",
    status: "BLOCKED",
    detail: "Any accidental active monetization behavior is a stop condition.",
    ownerAction: "Stop and rollback if observed.",
  },
];

const ownerDecisionStates: readonly AphroditeSoftLaunchScopeItem[] = [
  {
    area: "NOT READY",
    status: "NOT APPROVED",
    detail: "Default state while blockers remain.",
    ownerAction: "Do not launch.",
  },
  {
    area: "READY FOR OWNER REVIEW",
    status: "FUTURE STATE ONLY",
    detail: "Future state after prerequisites are documented but before approval.",
    ownerAction: "Owner reviews evidence.",
  },
  {
    area: "BLOCKED BY ENV",
    status: "BLOCKED",
    detail: "DATABASE_URL or TELEGRAM_BOT_TOKEN is missing.",
    ownerAction: "Configure production env manually.",
  },
  {
    area: "BLOCKED BY BACKUP",
    status: "BLOCKED",
    detail: "Backup freshness or restore rehearsal is missing.",
    ownerAction: "Verify backup and restore manually.",
  },
  {
    area: "BLOCKED BY REAL DEVICE QA",
    status: "BLOCKED",
    detail: "Real-device QA evidence is incomplete.",
    ownerAction: "Complete device checks manually.",
  },
  {
    area: "BLOCKED BY TELEGRAM WEBVIEW QA",
    status: "BLOCKED",
    detail: "Telegram WebView/startapp QA is incomplete.",
    ownerAction: "Complete WebView checks manually.",
  },
  {
    area: "BLOCKED BY CONTENT CTA REVIEW",
    status: "BLOCKED",
    detail: "Content/CTA owner review remains incomplete.",
    ownerAction: "Review destinations and copy.",
  },
  {
    area: "APPROVAL NOT GRANTED",
    status: "APPROVAL NOT GRANTED",
    detail: "Current state: approval has not been granted.",
    ownerAction: "Keep soft launch blocked.",
  },
  {
    area: "READY FOR LIMITED SOFT LAUNCH, as future state only",
    status: "FUTURE STATE ONLY",
    detail: "This is a future state only after all manual blockers are cleared and owner explicitly approves.",
    ownerAction: "Use a separate future package; this package does not approve it.",
  },
];

const safetyNotes = [
  "Soft launch started: No.",
  "Production launch done: No.",
  "Telegram API used: No.",
  "Messages sent: No.",
  "BotFather changed: No.",
  "Active CTA logic changed: No.",
  "Channel mappings changed: No.",
  "DB write added: No.",
  "External analytics added: No.",
  "Payment added: No.",
  "VIP unlock added: No.",
  "Entitlement bypass added: No.",
  "Cron/workflows/publish scripts changed: No.",
  "Secrets added: No.",
  "Production DB connected: No.",
  "Manual checks marked complete: No.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
] as const;

const remainingBlockers = [
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "backup freshness",
  "restore rehearsal",
  "real-device QA manual execution",
  "Telegram WebView/startapp QA",
  "content/CTA owner review",
  "owner approval",
] as const;

function cloneItems(items: readonly AphroditeSoftLaunchScopeItem[]) {
  return items.map((item) => ({ ...item }));
}

export function getAphroditeSoftLaunchScopeSelector(): AphroditeSoftLaunchScopeSelectorModel {
  return {
    packageNumber: 248,
    title: APHRODITE_SOFT_LAUNCH_SCOPE_SELECTOR_TITLE,
    route: APHRODITE_SOFT_LAUNCH_SCOPE_SELECTOR_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    currentOwnerDecisionState: "APPROVAL NOT GRANTED",
    recommendedScope: cloneItems(recommendedScope),
    excludedScope: cloneItems(excludedScope),
    candidateChannels: cloneItems(candidateChannels),
    candidateMiniAppFlows: cloneItems(candidateMiniAppFlows),
    manualPrerequisites: cloneItems(manualPrerequisites),
    safetyBoundaries: cloneItems(safetyBoundaries),
    launchModes: cloneItems(launchModes),
    rollbackConditions: cloneItems(rollbackConditions),
    stopConditions: cloneItems(stopConditions),
    monitoringChecklist: cloneItems(monitoringChecklist),
    ownerDecisionStates: cloneItems(ownerDecisionStates),
    nextPackageRecommendation: "Package 249 - Soft Launch Preflight Checklist",
    safetyNotes: [...safetyNotes],
    remainingBlockers: [...remainingBlockers],
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
      manualChecksMarkedComplete: false,
      publicLaunchApproved: false,
      ownerManualReviewRequired: true,
    },
  };
}
