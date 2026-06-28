/**
 * Package 284: Release Gate Status Consolidation Dashboard.
 *
 * Static release gate board only. This package does not clear blockers,
 * approve launch, add secrets, call Telegram, change BotFather, write DB,
 * change cron/workflows, add payment, or unlock VIP.
 */

export type AphroditeReleaseGateStatus =
  | "PASS"
  | "READY_FOR_OWNER_REVIEW"
  | "NOT_GRANTED"
  | "BLOCKED"
  | "REQUIRED"
  | "NOT_DONE"
  | "NOT_APPROVED"
  | "DOCUMENTED";

export type AphroditeReleaseGateRow = {
  area: string;
  status: AphroditeReleaseGateStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeReleaseGateStatusConsolidationModel = {
  packageNumber: 284;
  title: string;
  route: "/dashboard/networks/zodiac/release-gate-status-consolidation";
  releaseGateStatus: "BLOCKED";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  consolidatedGates: readonly AphroditeReleaseGateRow[];
  manualBlockers: readonly AphroditeReleaseGateRow[];
  evidenceReadyGates: readonly AphroditeReleaseGateRow[];
  forbiddenActions: readonly AphroditeReleaseGateRow[];
  nextPackageRecommendation: "Package 285 - AI Orchestration Runbook";
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
    publicLaunchApproved: false;
    ownerManualReviewRequired: true;
  };
};

export const APHRODITE_RELEASE_GATE_STATUS_CONSOLIDATION_TITLE =
  "Release Gate Status Consolidation";

export const APHRODITE_RELEASE_GATE_STATUS_CONSOLIDATION_ROUTE =
  "/dashboard/networks/zodiac/release-gate-status-consolidation" as const;

const consolidatedGates: readonly AphroditeReleaseGateRow[] = [
  {
    area: "code checks: PASS",
    status: "PASS",
    detail: "code checks: PASS for the audited readiness baseline and package-level QA completed before consolidation.",
    ownerAction: "Keep code checks green after each new package.",
  },
  {
    area: "visual evidence: READY_FOR_OWNER_REVIEW",
    status: "READY_FOR_OWNER_REVIEW",
    detail: "visual evidence: READY_FOR_OWNER_REVIEW from Package 275 screenshot evidence and Package 277 approval record.",
    ownerAction: "Owner must review the evidence before approval can be granted.",
  },
  {
    area: "owner visual approval: NOT_GRANTED",
    status: "NOT_GRANTED",
    detail: "owner visual approval: NOT_GRANTED; evidence readiness is not owner approval.",
    ownerAction: "Record owner approval only in a separate manual approval package.",
  },
  {
    area: "env: BLOCKED",
    status: "BLOCKED",
    detail: "env: BLOCKED until DATABASE_URL is configured outside Git.",
    ownerAction: "Configure production env manually in provider panel later.",
  },
  {
    area: "Telegram token: BLOCKED",
    status: "BLOCKED",
    detail: "Telegram token: BLOCKED until TELEGRAM_BOT_TOKEN is configured outside Git.",
    ownerAction: "Configure token manually in provider panel later.",
  },
  {
    area: "backup freshness: BLOCKED",
    status: "BLOCKED",
    detail: "backup freshness: BLOCKED because latest known backup is older than 24 hours.",
    ownerAction: "Refresh or confirm a fresh backup and record evidence.",
  },
  {
    area: "restore rehearsal: REQUIRED",
    status: "REQUIRED",
    detail: "restore rehearsal: REQUIRED before launch can be reconsidered.",
    ownerAction: "Run a safe non-production restore rehearsal manually.",
  },
  {
    area: "public URL: REQUIRED",
    status: "REQUIRED",
    detail: "public URL: REQUIRED and must use HTTPS public isolated routes, not dashboard.",
    ownerAction: "Select and verify the public URL manually after owner approval.",
  },
  {
    area: "BotFather setup: NOT_DONE",
    status: "NOT_DONE",
    detail: "BotFather setup: NOT_DONE and must remain manual.",
    ownerAction: "Do not touch BotFather until a separate owner-approved gate.",
  },
  {
    area: "soft launch: NOT_APPROVED",
    status: "NOT_APPROVED",
    detail: "soft launch: NOT_APPROVED while manual blockers remain open.",
    ownerAction: "Keep No-Go as the default decision.",
  },
];

const manualBlockers: readonly AphroditeReleaseGateRow[] = [
  {
    area: "DATABASE_URL",
    status: "BLOCKED",
    detail: "Real value is missing and must not be committed.",
    ownerAction: "Configure outside Git in hosting provider env panel.",
  },
  {
    area: "TELEGRAM_BOT_TOKEN",
    status: "BLOCKED",
    detail: "Real token is missing and must not be committed.",
    ownerAction: "Configure outside Git only after owner approval.",
  },
  {
    area: "fresh backup and restore rehearsal",
    status: "BLOCKED",
    detail: "Backup is stale and restore rehearsal has not been verified.",
    ownerAction: "Refresh backup and rehearse restore manually.",
  },
];

const evidenceReadyGates: readonly AphroditeReleaseGateRow[] = [
  {
    area: "Package 275 screenshots",
    status: "READY_FOR_OWNER_REVIEW",
    detail: "19 screenshots and duplicate-hash validation are ready for owner review.",
    ownerAction: "Owner reviews visual evidence manually.",
  },
  {
    area: "route isolation",
    status: "PASS",
    detail: "Public Mini App route shell isolation remains a required PASS gate.",
    ownerAction: "Re-run route isolation QA after route layout changes.",
  },
];

const forbiddenActions: readonly AphroditeReleaseGateRow[] = [
  {
    area: "launch gate",
    status: "NOT_APPROVED",
    detail: "publicLaunchApproved=false and ownerManualReviewRequired=true remain unchanged.",
    ownerAction: "Do not flip launch gates in this consolidation package.",
  },
  {
    area: "runtime side effects",
    status: "NOT_APPROVED",
    detail: "No Telegram API, messages, BotFather, DB writes, payment, VIP unlock, secrets, or cron/workflow changes.",
    ownerAction: "Keep this package read-only and dashboard-only.",
  },
];

const safetyNotes = [
  "code checks: PASS.",
  "visual evidence: READY_FOR_OWNER_REVIEW.",
  "owner visual approval: NOT_GRANTED.",
  "env: BLOCKED.",
  "Telegram token: BLOCKED.",
  "backup freshness: BLOCKED.",
  "restore rehearsal: REQUIRED.",
  "public URL: REQUIRED.",
  "BotFather setup: NOT_DONE.",
  "soft launch: NOT_APPROVED.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
] as const;

const remainingBlockers = [
  "owner visual approval NOT_GRANTED",
  "env BLOCKED",
  "Telegram token BLOCKED",
  "backup freshness BLOCKED",
  "restore rehearsal REQUIRED",
  "public URL REQUIRED",
  "BotFather setup NOT_DONE",
  "soft launch NOT_APPROVED",
] as const;

export function getAphroditeReleaseGateStatusConsolidation(): AphroditeReleaseGateStatusConsolidationModel {
  return {
    packageNumber: 284,
    title: APHRODITE_RELEASE_GATE_STATUS_CONSOLIDATION_TITLE,
    route: APHRODITE_RELEASE_GATE_STATUS_CONSOLIDATION_ROUTE,
    releaseGateStatus: "BLOCKED",
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    consolidatedGates,
    manualBlockers,
    evidenceReadyGates,
    forbiddenActions,
    nextPackageRecommendation: "Package 285 - AI Orchestration Runbook",
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
      publicLaunchApproved: false,
      ownerManualReviewRequired: true,
    },
  };
}
