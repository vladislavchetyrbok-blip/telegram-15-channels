/**
 * Package 222: Manual Launch Runbook & Rollback Pack.
 *
 * Static runbook/readiness only. This model does not launch production, call
 * Telegram API, send messages, change BotFather, alter active CTA logic,
 * change cron/workflows/publish scripts, write to databases, add analytics,
 * enable payments, unlock VIP, or store secrets.
 */

export type AphroditeManualLaunchRunbookStatus =
  | "NOT APPROVED"
  | "OWNER REVIEW REQUIRED"
  | "BLOCKED BY ENV"
  | "BLOCKED BY BACKUP"
  | "BLOCKED BY MANUAL QA"
  | "READY FOR OWNER REVIEW"
  | "LAUNCH NOT PERFORMED";

export type AphroditeManualLaunchRunbookSection = {
  id: string;
  title: string;
  status: AphroditeManualLaunchRunbookStatus;
  summary: string;
  items: readonly string[];
};

export type AphroditeManualLaunchRunbookRollbackPackModel = {
  packageNumber: 222;
  title: string;
  route: "/dashboard/networks/zodiac/manual-launch-runbook-rollback-pack";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  statusLegend: readonly AphroditeManualLaunchRunbookStatus[];
  launchNotPerformedWording: string;
  sections: readonly AphroditeManualLaunchRunbookSection[];
  requiredPreLaunchChecks: readonly string[];
  rollbackPlan: readonly string[];
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
    workflowChanged: false;
    publishScriptsChanged: false;
    secretsAdded: false;
  };
};

export const APHRODITE_MANUAL_LAUNCH_RUNBOOK_ROLLBACK_PACK_TITLE =
  "Manual Launch Runbook & Rollback Pack";

export const APHRODITE_MANUAL_LAUNCH_RUNBOOK_ROLLBACK_PACK_ROUTE =
  "/dashboard/networks/zodiac/manual-launch-runbook-rollback-pack" as const;

export const APHRODITE_MANUAL_LAUNCH_RUNBOOK_STATUSES = [
  "NOT APPROVED",
  "OWNER REVIEW REQUIRED",
  "BLOCKED BY ENV",
  "BLOCKED BY BACKUP",
  "BLOCKED BY MANUAL QA",
  "READY FOR OWNER REVIEW",
  "LAUNCH NOT PERFORMED",
] as const;

export const APHRODITE_MANUAL_LAUNCH_NOT_PERFORMED_WORDING =
  "Launch not performed. This runbook is manual readiness only.";

export const APHRODITE_REQUIRED_PRE_LAUNCH_CHECKS = [
  "TypeScript PASS",
  "Build PASS",
  "zodiac:dashboard:qa PASS",
  "all public launch QA scripts PASS",
  "DATABASE_URL configured manually",
  "TELEGRAM_BOT_TOKEN configured manually",
  "backup fresh <24h",
  "restore rehearsal checked manually",
  "real-device visual QA completed",
  "Telegram WebView/startapp QA completed",
  "content/CTA inventory reviewed",
  "owner manual approval granted",
] as const;

export const APHRODITE_ROLLBACK_PLAN = [
  "freeze/disable launch mode",
  "revert to previous verified commit",
  "stop affected workflow manually, if needed",
  "verify no duplicate posting",
  "verify ledger consistency",
  "verify Mini App fallback",
  "document incident",
  "do not retry blindly",
] as const;

const sections: readonly AphroditeManualLaunchRunbookSection[] = [
  {
    id: "launch-freeze-status",
    title: "Launch freeze status",
    status: "LAUNCH NOT PERFORMED",
    summary: "Launch remains frozen until the owner clears every blocker and grants manual approval.",
    items: [
      "publicLaunchApproved=false.",
      "ownerManualReviewRequired=true.",
      "No automatic launch is enabled by this runbook.",
      "READY FOR OWNER REVIEW is a future manual state only, not current approval.",
    ],
  },
  {
    id: "required-pre-launch-checks",
    title: "Required pre-launch checks",
    status: "BLOCKED BY ENV",
    summary: "Every pre-launch check must be completed before any owner go/no-go decision.",
    items: APHRODITE_REQUIRED_PRE_LAUNCH_CHECKS,
  },
  {
    id: "owner-approval-checklist",
    title: "Owner approval checklist",
    status: "OWNER REVIEW REQUIRED",
    summary: "The owner must manually confirm launch readiness after evidence, env, backup, and device QA are complete.",
    items: [
      "Review production env handoff checklist.",
      "Review backup and restore rehearsal evidence.",
      "Review real-device visual QA evidence.",
      "Review Telegram WebView/startapp QA evidence.",
      "Review content/CTA inventory and remaining blockers.",
      "Record explicit owner go/no-go decision outside this static runbook.",
    ],
  },
  {
    id: "manual-launch-sequence",
    title: "Manual launch sequence",
    status: "NOT APPROVED",
    summary: "Launch sequence is informational and must only be performed manually after owner approval.",
    items: [
      "Confirm all required pre-launch checks are PASS.",
      "Confirm blockers are cleared and owner approval is recorded.",
      "Confirm rollback owner, previous verified commit, and backup evidence are available.",
      "Perform launch only through the approved manual production process.",
      "Do not enable launch from this dashboard page.",
    ],
  },
  {
    id: "abort-conditions",
    title: "Abort conditions",
    status: "BLOCKED BY MANUAL QA",
    summary: "If any abort condition is present, launch remains blocked and owner review must continue.",
    items: [
      "DATABASE_URL or TELEGRAM_BOT_TOKEN is missing.",
      "Backup is older than 24h or not verified.",
      "Restore rehearsal is not checked manually.",
      "Real-device visual QA is incomplete.",
      "Telegram WebView/startapp QA is incomplete.",
      "Content/CTA inventory has unresolved HIGH risk items.",
      "Owner approval is not granted.",
    ],
  },
  {
    id: "rollback-plan",
    title: "Rollback plan",
    status: "OWNER REVIEW REQUIRED",
    summary: "Rollback must be prepared before launch and executed manually if launch health degrades.",
    items: APHRODITE_ROLLBACK_PLAN,
  },
  {
    id: "post-launch-monitoring-checklist",
    title: "Post-launch monitoring checklist",
    status: "OWNER REVIEW REQUIRED",
    summary: "After approved launch, the owner monitors health, routing, delivery, and user-facing flows.",
    items: [
      "Monitor dashboard health and production safety blockers.",
      "Monitor Telegram Mini App route/version marker on real devices.",
      "Monitor WebView/startapp behavior and wrong-route reports.",
      "Monitor duplicate posting symptoms and ledger consistency.",
      "Monitor support/refund/contact channels for launch issues.",
      "Record issues in the visual issue triage board.",
    ],
  },
  {
    id: "incident-response-checklist",
    title: "Incident response checklist",
    status: "OWNER REVIEW REQUIRED",
    summary: "Incident response should prefer freeze, rollback, evidence capture, and a written decision trail.",
    items: [
      "Freeze or pause the affected launch surface manually.",
      "Capture exact route, device, screenshot, time, and deployed commit.",
      "Classify incident severity and owner decision required.",
      "Use rollback plan if production user impact is confirmed.",
      "Document what happened and what changed before any retry.",
    ],
  },
  {
    id: "current-blockers",
    title: "Current blockers",
    status: "BLOCKED BY ENV",
    summary: "Launch remains blocked by env, backup, manual QA, WebView/startapp QA, and owner approval.",
    items: [
      "DATABASE_URL",
      "TELEGRAM_BOT_TOKEN",
      "backup freshness",
      "restore rehearsal",
      "real-device QA",
      "Telegram WebView/startapp QA",
      "owner manual approval",
    ],
  },
  {
    id: "safety-confirmation",
    title: "Safety confirmation",
    status: "LAUNCH NOT PERFORMED",
    summary: "Package 222 is documentation/readiness only and makes no production side effects.",
    items: [
      "Production launch done: No",
      "Telegram API used: No",
      "Messages sent: No",
      "BotFather changed: No",
      "Active CTA logic changed: No",
      "DB write added: No",
      "External analytics added: No",
      "Payment added: No",
      "VIP unlock added: No",
      "Cron/workflows/publish scripts changed: No",
    ],
  },
];

const remainingBlockers = [
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "backup freshness",
  "restore rehearsal",
  "real-device QA",
  "Telegram WebView/startapp QA",
  "owner manual approval",
] as const;

export function getAphroditeManualLaunchRunbookRollbackPack(): AphroditeManualLaunchRunbookRollbackPackModel {
  return {
    packageNumber: 222,
    title: APHRODITE_MANUAL_LAUNCH_RUNBOOK_ROLLBACK_PACK_TITLE,
    route: APHRODITE_MANUAL_LAUNCH_RUNBOOK_ROLLBACK_PACK_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    statusLegend: [...APHRODITE_MANUAL_LAUNCH_RUNBOOK_STATUSES],
    launchNotPerformedWording: APHRODITE_MANUAL_LAUNCH_NOT_PERFORMED_WORDING,
    sections: sections.map((section) => ({
      ...section,
      items: [...section.items],
    })),
    requiredPreLaunchChecks: [...APHRODITE_REQUIRED_PRE_LAUNCH_CHECKS],
    rollbackPlan: [...APHRODITE_ROLLBACK_PLAN],
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
      workflowChanged: false,
      publishScriptsChanged: false,
      secretsAdded: false,
    },
  };
}
