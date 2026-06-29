/**
 * Package 283: Soft Launch Dry Run and Rollback Plan.
 *
 * Static dry-run and rollback plan only. This package does not launch
 * production, send messages, call Telegram API, change BotFather, edit env,
 * change cron/workflows, write DB, add payment, or unlock VIP.
 */

export type AphroditeSoftLaunchDryRunStatus =
  | "NOT_APPROVED"
  | "DRY_RUN_ONLY"
  | "MANUAL REQUIRED"
  | "DOCUMENTED"
  | "BLOCKED";

export type AphroditeSoftLaunchDryRunRow = {
  area: string;
  status: AphroditeSoftLaunchDryRunStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeSoftLaunchDryRunRollbackPlanModel = {
  packageNumber: 283;
  title: string;
  route: "/dashboard/networks/zodiac/soft-launch-dry-run-rollback-plan";
  softLaunchStatus: "NOT_APPROVED";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  dryRunScope: readonly AphroditeSoftLaunchDryRunRow[];
  rollbackSteps: readonly AphroditeSoftLaunchDryRunRow[];
  incidentChecklist: readonly AphroditeSoftLaunchDryRunRow[];
  ownerGoNoGoGate: readonly AphroditeSoftLaunchDryRunRow[];
  blockers: readonly AphroditeSoftLaunchDryRunRow[];
  forbiddenActions: readonly AphroditeSoftLaunchDryRunRow[];
  nextPackageRecommendation: "Package 284 - Release Gate Status Consolidation Dashboard";
  safetyNotes: readonly string[];
  remainingBlockers: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    botFatherChanged: false;
    envChangesAdded: false;
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

export const APHRODITE_SOFT_LAUNCH_DRY_RUN_ROLLBACK_PLAN_TITLE =
  "Soft Launch Dry Run and Rollback Plan";

export const APHRODITE_SOFT_LAUNCH_DRY_RUN_ROLLBACK_PLAN_ROUTE =
  "/dashboard/networks/zodiac/soft-launch-dry-run-rollback-plan" as const;

const dryRunScope: readonly AphroditeSoftLaunchDryRunRow[] = [
  {
    area: "softLaunchStatus = NOT_APPROVED",
    status: "NOT_APPROVED",
    detail: "softLaunchStatus = NOT_APPROVED and publicLaunchApproved=false remain mandatory.",
    ownerAction: "Do not launch or publish from this package.",
  },
  {
    area: "dry-run only",
    status: "DRY_RUN_ONLY",
    detail: "dry-run only means rehearsing decisions, links, evidence, and rollback readiness without sending traffic.",
    ownerAction: "Use local or internal review notes only.",
  },
  {
    area: "one-channel/test-link approach later",
    status: "MANUAL REQUIRED",
    detail: "one-channel/test-link approach later may be considered only after env, backup, owner visual, public URL, and BotFather gates pass.",
    ownerAction: "Keep this as a future manual option, not an active launch.",
  },
];

const rollbackSteps: readonly AphroditeSoftLaunchDryRunRow[] = [
  {
    area: "rollback steps",
    status: "DOCUMENTED",
    detail: "rollback steps must include last safe commit, deployed target, backup timestamp, rollback owner, and communication owner.",
    ownerAction: "Record the rollback package before any future limited launch.",
  },
  {
    area: "route rollback",
    status: "DOCUMENTED",
    detail: "If a future public route fails, remove the public Mini App URL manually and revert to the last verified route.",
    ownerAction: "Prepare the exact manual route rollback command or provider UI steps later.",
  },
  {
    area: "content rollback",
    status: "DOCUMENTED",
    detail: "If content or VIP preview is wrong, revert to last safe commit and keep VIP locked.",
    ownerAction: "Do not grant entitlement while rolling back.",
  },
];

const incidentChecklist: readonly AphroditeSoftLaunchDryRunRow[] = [
  {
    area: "incident checklist",
    status: "DOCUMENTED",
    detail: "incident checklist must identify severity, owner, affected route, screenshots, timestamp, and rollback decision.",
    ownerAction: "Use a single incident note per event and keep secrets out of evidence.",
  },
  {
    area: "stop conditions",
    status: "DOCUMENTED",
    detail: "Stop immediately on payment exposure, VIP unlock, dashboard shell leak, Telegram send, or private data exposure.",
    ownerAction: "Record blocker and keep launch stopped.",
  },
  {
    area: "post-incident review",
    status: "MANUAL REQUIRED",
    detail: "Post-incident review must happen before another launch decision.",
    ownerAction: "Create a follow-up remediation package if needed.",
  },
];

const ownerGoNoGoGate: readonly AphroditeSoftLaunchDryRunRow[] = [
  {
    area: "owner go/no-go gate",
    status: "MANUAL REQUIRED",
    detail: "owner go/no-go gate is required before even a limited soft launch can start.",
    ownerAction: "Owner must record Go/No-Go in a separate package after all blockers clear.",
  },
  {
    area: "approval evidence",
    status: "BLOCKED",
    detail: "No approval evidence exists for launch, so this remains a No-Go.",
    ownerAction: "Keep softLaunchStatus = NOT_APPROVED.",
  },
];

const blockers: readonly AphroditeSoftLaunchDryRunRow[] = [
  {
    area: "production blockers still block launch",
    status: "BLOCKED",
    detail: "production blockers still block launch: DATABASE_URL, TELEGRAM_BOT_TOKEN, stale backup, restore rehearsal, public URL, BotFather, and owner approval.",
    ownerAction: "Clear blockers manually in later owner-approved packages.",
  },
];

const forbiddenActions: readonly AphroditeSoftLaunchDryRunRow[] = [
  {
    area: "Telegram and BotFather",
    status: "NOT_APPROVED",
    detail: "no messages sent, no Telegram API, and no BotFather changes are allowed.",
    ownerAction: "Keep Telegram setup untouched.",
  },
  {
    area: "environment and automation",
    status: "NOT_APPROVED",
    detail: "no env changes and no cron/workflow changes are allowed.",
    ownerAction: "Keep env and automation unchanged.",
  },
  {
    area: "monetization and data",
    status: "NOT_APPROVED",
    detail: "No payment, no VIP unlock, no DB write, and no production DB connection are allowed.",
    ownerAction: "Keep this plan documentation-only.",
  },
];

const safetyNotes = [
  "softLaunchStatus = NOT_APPROVED.",
  "dry-run only.",
  "one-channel/test-link approach later.",
  "production blockers still block launch.",
  "no messages sent.",
  "no Telegram API.",
  "no BotFather.",
  "no env changes.",
  "no cron/workflow changes.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
] as const;

const remainingBlockers = [
  "soft launch not approved",
  "owner go/no-go gate not granted",
  "DATABASE_URL missing",
  "TELEGRAM_BOT_TOKEN missing",
  "backup older than 24h",
  "restore rehearsal not verified",
  "public URL not approved",
  "BotFather setup NOT_DONE",
] as const;

export function getAphroditeSoftLaunchDryRunRollbackPlan(): AphroditeSoftLaunchDryRunRollbackPlanModel {
  return {
    packageNumber: 283,
    title: APHRODITE_SOFT_LAUNCH_DRY_RUN_ROLLBACK_PLAN_TITLE,
    route: APHRODITE_SOFT_LAUNCH_DRY_RUN_ROLLBACK_PLAN_ROUTE,
    softLaunchStatus: "NOT_APPROVED",
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    dryRunScope,
    rollbackSteps,
    incidentChecklist,
    ownerGoNoGoGate,
    blockers,
    forbiddenActions,
    nextPackageRecommendation: "Package 284 - Release Gate Status Consolidation Dashboard",
    safetyNotes,
    remainingBlockers,
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      botFatherChanged: false,
      envChangesAdded: false,
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
