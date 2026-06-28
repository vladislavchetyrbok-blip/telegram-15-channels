export type AphroditeFinalReadinessStatus =
  | "PASS"
  | "DOCUMENTED"
  | "MANUAL REQUIRED"
  | "OWNER REVIEW REQUIRED"
  | "BLOCKED"
  | "BLOCKED BY ENV"
  | "BLOCKED BY BACKUP"
  | "NOT APPROVED";

export type AphroditeFinalReadinessItem = {
  area: string;
  status: AphroditeFinalReadinessStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeFinalReadinessSection = {
  title: string;
  items: readonly AphroditeFinalReadinessItem[];
};

export type AphroditeFinalReadinessPackageModel = {
  packageNumber: number;
  title: string;
  route: string;
  currentStatus: "NOT READY" | "READY FOR OWNER REVIEW";
  canProceedToOwnerReview: boolean;
  canExecuteSoftLaunchNow: false;
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  ownerDecisionStatus: "APPROVAL NOT GRANTED" | "OWNER REVIEW REQUIRED";
  requiredMarkers: readonly string[];
  sections: readonly AphroditeFinalReadinessSection[];
  remainingBlockers: readonly string[];
  safetyFlags: ReturnType<typeof createFinalReadinessSafetyFlags>;
  safetyNotes: readonly string[];
  whatWasNotChanged: readonly string[];
  nextPackageRecommendation: string;
};

export const finalReadinessManualBlockers = [
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "APHRODITE_SESSION_SECRET",
  "public app URL",
  "Telegram Mini App URL",
  "backup freshness",
  "restore rehearsal",
  "real-device QA",
  "Telegram WebView/startapp QA",
  "content/CTA owner review",
  "owner explicit approval",
] as const;

export const finalReadinessReadyAreas = [
  "design sprint",
  "Claude audit",
  "smoke",
  "build",
  "dashboard QA",
  "soft launch scope",
  "preflight docs",
  "monitoring plan",
  "rollback drill",
  "owner brief",
  "blocker board",
] as const;

export function createFinalReadinessSafetyFlags() {
  return {
    productionLaunchDone: false,
    telegramApiUsed: false,
    messagesSent: false,
    botFatherChanged: false,
    activeCtaLogicChanged: false,
    channelMappingsChanged: false,
    databaseWriteAdded: false,
    dbRestoreExecuted: false,
    externalAnalyticsAdded: false,
    paymentAdded: false,
    vipUnlockAdded: false,
    entitlementBypassAdded: false,
    cronWorkflowPublishChanged: false,
    publishScriptsChanged: false,
    secretsAdded: false,
    productionDbConnected: false,
    backupFreshnessFaked: false,
    restoreRehearsalFaked: false,
    ownerApprovalFaked: false,
    ownerApprovalGranted: false,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
  } as const;
}

export function createFinalReadinessSafetyNotes(title: string) {
  return [
    `${title}: static readiness only.`,
    "Can execute soft launch now: No.",
    "publicLaunchApproved=false.",
    "ownerManualReviewRequired=true.",
    "Production launch done: No.",
    "Telegram API used: No.",
    "Messages sent: No.",
    "BotFather changed: No.",
    "DB write added: No.",
    "DB restore executed: No.",
    "No secrets added.",
    "Manual checks are not marked complete automatically.",
  ] as const;
}

export function createFinalReadinessNotChanged() {
  return [
    "production launch started: No",
    "Telegram API used: No",
    "messages sent: No",
    "BotFather changed: No",
    "active CTA logic changed: No",
    "channel mappings changed: No",
    "DB writes added: No",
    "DB restore executed: No",
    "external analytics added: No",
    "payment added: No",
    "VIP unlock added: No",
    "entitlement bypass added: No",
    "cron/workflow/publish scripts changed: No",
    "secrets added: No",
    "production DB connected: No",
    "owner approval granted: No",
  ] as const;
}

export function blockerItems(): AphroditeFinalReadinessItem[] {
  return finalReadinessManualBlockers.map((blocker) => ({
    area: blocker,
    status:
      blocker === "DATABASE_URL" || blocker === "TELEGRAM_BOT_TOKEN" || blocker === "APHRODITE_SESSION_SECRET"
        ? "BLOCKED BY ENV"
        : blocker === "backup freshness" || blocker === "restore rehearsal"
          ? "BLOCKED BY BACKUP"
          : "MANUAL REQUIRED",
    detail: `${blocker} remains a manual blocker and is not completed by this package.`,
    ownerAction: "Owner must complete and record evidence manually before any future soft launch.",
  }));
}

export function readyAreaItems(): AphroditeFinalReadinessItem[] {
  return finalReadinessReadyAreas.map((area) => ({
    area,
    status: "DOCUMENTED",
    detail: `${area} is represented in the readiness pack for owner review.`,
    ownerAction: "Review supporting evidence before any approval decision.",
  }));
}
