/**
 * Package 235: Soft Launch Owner Go/No-Go Gate.
 *
 * Static final owner gate only. It does not approve launch automatically and
 * does not perform production, Telegram, database, payment, VIP, cron,
 * workflow, publish, analytics, or secret operations.
 */

export type AphroditeSoftLaunchOwnerGateStatus =
  | "BLOCKED"
  | "MANUAL REQUIRED"
  | "OWNER REVIEW REQUIRED"
  | "NOT APPROVED";

export type AphroditeSoftLaunchOwnerGateItem = {
  area: string;
  status: AphroditeSoftLaunchOwnerGateStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeSoftLaunchOwnerGoNoGoGateModel = {
  packageNumber: 235;
  title: string;
  route: "/dashboard/networks/zodiac/soft-launch-owner-go-no-go-gate";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  softLaunchApproved: false;
  productionLaunchDone: false;
  gateStatuses: readonly AphroditeSoftLaunchOwnerGateItem[];
  requiredBeforeFutureApproval: readonly AphroditeSoftLaunchOwnerGateItem[];
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
    autoApprovalAdded: false;
  };
};

export const APHRODITE_SOFT_LAUNCH_OWNER_GO_NO_GO_GATE_TITLE =
  "Soft Launch Owner Go/No-Go Gate";

export const APHRODITE_SOFT_LAUNCH_OWNER_GO_NO_GO_GATE_ROUTE =
  "/dashboard/networks/zodiac/soft-launch-owner-go-no-go-gate" as const;

const gateStatuses: readonly AphroditeSoftLaunchOwnerGateItem[] = [
  {
    area: "publicLaunchApproved=false",
    status: "NOT APPROVED",
    detail: "Public launch approval remains false.",
    ownerAction: "Do not change without explicit future owner approval.",
  },
  {
    area: "ownerManualReviewRequired=true",
    status: "OWNER REVIEW REQUIRED",
    detail: "Owner manual review remains required.",
    ownerAction: "Owner must complete manual review before any future launch decision.",
  },
  {
    area: "soft launch not approved",
    status: "BLOCKED",
    detail: "Soft launch is not approved by this package.",
    ownerAction: "Owner records an explicit future go/no-go decision outside this static gate.",
  },
  {
    area: "production launch not done",
    status: "BLOCKED",
    detail: "No production launch was performed.",
    ownerAction: "Keep launch frozen until all blockers are cleared.",
  },
  {
    area: "Telegram API not used",
    status: "BLOCKED",
    detail: "No Telegram API calls were made.",
    ownerAction: "Use real Telegram operations only in a separate approved launch step.",
  },
  {
    area: "messages not sent",
    status: "BLOCKED",
    detail: "No Telegram messages were sent.",
    ownerAction: "Do not send messages from this gate.",
  },
  {
    area: "payments not added",
    status: "BLOCKED",
    detail: "No payment implementation was added.",
    ownerAction: "Payment remains outside this queue.",
  },
  {
    area: "VIP unlock not added",
    status: "BLOCKED",
    detail: "No VIP unlock was added.",
    ownerAction: "VIP remains locked until a future entitlement/payment package.",
  },
  {
    area: "DB writes not added",
    status: "BLOCKED",
    detail: "No DB writes were added.",
    ownerAction: "Keep this gate static/readiness-only.",
  },
  {
    area: "cron/workflows/publish scripts not changed",
    status: "BLOCKED",
    detail: "No cron, workflow or publish script changes were made.",
    ownerAction: "Schedule/publish operations require a separate explicit request.",
  },
] as const;

const requiredBeforeFutureApproval: readonly AphroditeSoftLaunchOwnerGateItem[] = [
  {
    area: "DATABASE_URL configured manually",
    status: "MANUAL REQUIRED",
    detail: "Production DATABASE_URL must be configured in the approved secret store.",
    ownerAction: "Configure manually and never commit the value.",
  },
  {
    area: "TELEGRAM_BOT_TOKEN configured manually",
    status: "MANUAL REQUIRED",
    detail: "Production Telegram bot token must be configured manually.",
    ownerAction: "Configure manually, keep masked, rotate if leaked.",
  },
  {
    area: "backup <24h confirmed manually",
    status: "MANUAL REQUIRED",
    detail: "Backup freshness must be verified below 24h before approval.",
    ownerAction: "Record timestamp, source, reviewer, and evidence.",
  },
  {
    area: "restore rehearsal manually checked",
    status: "MANUAL REQUIRED",
    detail: "Restore rehearsal must be performed in a safe non-production target.",
    ownerAction: "Record result, duration, validation, and failure handling.",
  },
  {
    area: "real-device QA completed manually",
    status: "OWNER REVIEW REQUIRED",
    detail: "Real-device QA evidence must be completed by owner or reviewer.",
    ownerAction: "Attach screenshots and notes for target devices.",
  },
  {
    area: "Telegram WebView/startapp QA completed manually",
    status: "OWNER REVIEW REQUIRED",
    detail: "Telegram WebView/startapp/deep-link behavior must be checked manually.",
    ownerAction: "Record iOS/Android WebView evidence and cache marker.",
  },
  {
    area: "content/CTA owner review completed manually",
    status: "OWNER REVIEW REQUIRED",
    detail: "Final content and CTA destinations must be reviewed by owner.",
    ownerAction: "Confirm active CTA logic remains unchanged.",
  },
  {
    area: "launch simulation report reviewed",
    status: "OWNER REVIEW REQUIRED",
    detail: "Package 234 launch simulation status report must be reviewed.",
    ownerAction: "Review all PASS/BLOCKED/MANUAL REQUIRED statuses.",
  },
  {
    area: "rollback plan understood",
    status: "OWNER REVIEW REQUIRED",
    detail: "Owner must understand rollback point, backup, restore, and deployment rollback.",
    ownerAction: "Record rollback owner and last verified commit.",
  },
  {
    area: "owner explicit approval",
    status: "OWNER REVIEW REQUIRED",
    detail: "Owner must give explicit approval before any future soft launch.",
    ownerAction: "Approval is not granted by this package.",
  },
] as const;

const safetyNotes = [
  "No auto approval.",
  "Soft launch not approved.",
  "Production launch not done.",
  "Telegram API not used.",
  "Messages not sent.",
  "Payments not added.",
  "VIP unlock not added.",
  "DB writes not added.",
  "Cron/workflows/publish scripts not changed.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
] as const;

const remainingBlockers = [
  "DATABASE_URL manual configuration",
  "TELEGRAM_BOT_TOKEN manual configuration",
  "backup freshness <24h",
  "restore rehearsal",
  "real-device QA manual execution",
  "Telegram WebView/startapp manual QA",
  "content/CTA owner review",
  "launch simulation report review",
  "rollback plan",
  "owner explicit approval",
] as const;

export function getAphroditeSoftLaunchOwnerGoNoGoGate(): AphroditeSoftLaunchOwnerGoNoGoGateModel {
  return {
    packageNumber: 235,
    title: APHRODITE_SOFT_LAUNCH_OWNER_GO_NO_GO_GATE_TITLE,
    route: APHRODITE_SOFT_LAUNCH_OWNER_GO_NO_GO_GATE_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    softLaunchApproved: false,
    productionLaunchDone: false,
    gateStatuses: gateStatuses.map((item) => ({ ...item })),
    requiredBeforeFutureApproval: requiredBeforeFutureApproval.map((item) => ({ ...item })),
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
      autoApprovalAdded: false,
    },
  };
}
