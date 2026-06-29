/**
 * Package 285: AI Orchestration Runbook for Claude, Antigravity, and Codex.
 *
 * Static coordination runbook only. This package does not launch production,
 * auto-merge, call Telegram, send messages, change BotFather, add secrets,
 * write DB, add payment, unlock VIP, or change cron/workflows.
 */

export type AphroditeAiOrchestrationStatus =
  | "DOCUMENTED"
  | "READ_ONLY"
  | "VISUAL_QA"
  | "CODE_SCOPED"
  | "OWNER REVIEW REQUIRED"
  | "NOT APPROVED";

export type AphroditeAiOrchestrationRow = {
  area: string;
  status: AphroditeAiOrchestrationStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeAiOrchestrationRunbookModel = {
  packageNumber: 285;
  title: string;
  route: "/dashboard/networks/zodiac/ai-orchestration-runbook";
  orchestrationStatus: "DOCUMENTED";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  agentRoles: readonly AphroditeAiOrchestrationRow[];
  executionOrder: readonly AphroditeAiOrchestrationRow[];
  coordinationRules: readonly AphroditeAiOrchestrationRow[];
  packageReportFormat: readonly AphroditeAiOrchestrationRow[];
  forbiddenActions: readonly AphroditeAiOrchestrationRow[];
  nextPackageRecommendation: "Package 286 - Night Run Final Readiness Summary";
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
    autoMergeAllowed: false;
    publicLaunchApproved: false;
    ownerManualReviewRequired: true;
  };
};

export const APHRODITE_AI_ORCHESTRATION_RUNBOOK_TITLE =
  "AI Orchestration Runbook";

export const APHRODITE_AI_ORCHESTRATION_RUNBOOK_ROUTE =
  "/dashboard/networks/zodiac/ai-orchestration-runbook" as const;

const agentRoles: readonly AphroditeAiOrchestrationRow[] = [
  {
    area: "Claude = read-only audit, no file edits",
    status: "READ_ONLY",
    detail: "Claude = read-only audit, no file edits; it reviews diffs, reports risks, and does not mutate the branch.",
    ownerAction: "Use Claude for safety and logic audit after implementation and visual QA evidence.",
  },
  {
    area: "Antigravity = visual QA/screenshots/browser checks",
    status: "VISUAL_QA",
    detail: "Antigravity = visual QA/screenshots/browser checks across public Mini App and dashboard routes.",
    ownerAction: "Use Antigravity to capture and compare real visual evidence.",
  },
  {
    area: "Codex = code changes/commits/pushes only after scoped task",
    status: "CODE_SCOPED",
    detail: "Codex = code changes/commits/pushes only after scoped task, with package boundaries and QA evidence.",
    ownerAction: "Give Codex one scoped package or fix at a time.",
  },
  {
    area: "Owner review",
    status: "OWNER REVIEW REQUIRED",
    detail: "Owner review remains the final authority for approval and launch gates.",
    ownerAction: "Approve or reject with a recorded manual decision.",
  },
];

const executionOrder: readonly AphroditeAiOrchestrationRow[] = [
  {
    area: "1. Codex implements",
    status: "DOCUMENTED",
    detail: "Codex implements scoped code, docs, dashboard, QA, commits, and pushes.",
    ownerAction: "Confirm scope and branch before implementation.",
  },
  {
    area: "2. Antigravity visual checks",
    status: "VISUAL_QA",
    detail: "Antigravity visual checks capture browser screenshots and route behavior evidence.",
    ownerAction: "Run visual verification after Codex pushes the branch.",
  },
  {
    area: "3. Claude safety audit",
    status: "READ_ONLY",
    detail: "Claude safety audit reviews the pushed diff and QA output without editing files.",
    ownerAction: "Ask Claude for blockers, risk level, and missing tests.",
  },
  {
    area: "4. Owner review",
    status: "OWNER REVIEW REQUIRED",
    detail: "Owner review decides whether the branch can merge or whether more packages are needed.",
    ownerAction: "Record owner decision separately.",
  },
];

const coordinationRules: readonly AphroditeAiOrchestrationRow[] = [
  {
    area: "no parallel edits in same files",
    status: "DOCUMENTED",
    detail: "no parallel edits in same files: only one editing agent owns a file set at a time.",
    ownerAction: "Pause other editing agents while Codex modifies scoped files.",
  },
  {
    area: "no auto-merge without audit",
    status: "NOT APPROVED",
    detail: "no auto-merge without audit by visual QA, safety audit, and owner review.",
    ownerAction: "Merge only after the required review trail exists.",
  },
  {
    area: "no production launch by agents",
    status: "NOT APPROVED",
    detail: "no production launch by agents; launch can only happen through explicit owner-approved manual gate.",
    ownerAction: "Keep all agent work below launch authority.",
  },
];

const packageReportFormat: readonly AphroditeAiOrchestrationRow[] = [
  {
    area: "package report format",
    status: "DOCUMENTED",
    detail: "package report format includes package number, branch, commits, files changed, checks, safety flags, blockers, and next package.",
    ownerAction: "Require the same report shape after each package.",
  },
  {
    area: "evidence references",
    status: "DOCUMENTED",
    detail: "Reports should reference visual evidence folders and QA scripts without exposing secrets.",
    ownerAction: "Keep evidence paths stable and reviewable.",
  },
];

const forbiddenActions: readonly AphroditeAiOrchestrationRow[] = [
  {
    area: "runtime actions",
    status: "NOT APPROVED",
    detail: "No production launch, Telegram API call, message send, BotFather change, DB write, or production DB connection.",
    ownerAction: "Stop and report if any agent proposes runtime side effects.",
  },
  {
    area: "commercial gates",
    status: "NOT APPROVED",
    detail: "No payment, invoice, entitlement grant, or VIP unlock may be added by orchestration.",
    ownerAction: "Keep monetization locked until separate approval.",
  },
  {
    area: "secrets and automation",
    status: "NOT APPROVED",
    detail: "No secrets, .env.local commit, cron change, workflow change, or publish script change.",
    ownerAction: "Keep production configuration manual and outside Git.",
  },
];

const safetyNotes = [
  "Claude = read-only audit, no file edits.",
  "Antigravity = visual QA/screenshots/browser checks.",
  "Codex = code changes/commits/pushes only after scoped task.",
  "Codex implements.",
  "Antigravity visual checks.",
  "Claude safety audit.",
  "Owner review.",
  "no parallel edits in same files.",
  "no auto-merge without audit.",
  "no production launch by agents.",
  "package report format documented.",
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

export function getAphroditeAiOrchestrationRunbook(): AphroditeAiOrchestrationRunbookModel {
  return {
    packageNumber: 285,
    title: APHRODITE_AI_ORCHESTRATION_RUNBOOK_TITLE,
    route: APHRODITE_AI_ORCHESTRATION_RUNBOOK_ROUTE,
    orchestrationStatus: "DOCUMENTED",
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    agentRoles,
    executionOrder,
    coordinationRules,
    packageReportFormat,
    forbiddenActions,
    nextPackageRecommendation: "Package 286 - Night Run Final Readiness Summary",
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
      autoMergeAllowed: false,
      publicLaunchApproved: false,
      ownerManualReviewRequired: true,
    },
  };
}
