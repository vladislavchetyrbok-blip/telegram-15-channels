export type AphroditeFinalSoftLaunchDryRunChecklistRow = {
  area: string;
  status: string;
  detail: string;
  ownerAction: string;
};

export const APHRODITE_FINAL_SOFT_LAUNCH_DRY_RUN_CHECKLIST_TITLE = "Final Soft Launch Dry Run Checklist";

export const APHRODITE_FINAL_SOFT_LAUNCH_DRY_RUN_CHECKLIST_ROUTE =
  "/dashboard/networks/zodiac/final-soft-launch-dry-run-checklist" as const;

export const aphroditeFinalSoftLaunchDryRunChecklist = {
  "packageNumber": 331,
  "title": "Final Soft Launch Dry Run Checklist",
  "route": "/dashboard/networks/zodiac/final-soft-launch-dry-run-checklist",
  "currentMainHead": "be508290e8f00f9b38cda9bd7bd41ce7c2750fd5",
  "statusField": "softLaunchDryRunStatus",
  "statusValue": "NOT_STARTED_BLOCKERS_OPEN",
  "softLaunchDryRunStatus": "NOT_STARTED_BLOCKERS_OPEN",
  "publicLaunchApproved": false,
  "ownerManualReviewRequired": true,
  "readyForProductionLaunch": false,
  "softLaunchStatus": "NO",
  "blockersRemainOpen": true,
  "manualWorkRequired": true,
  "goal": "Document final soft launch dry run checklist as a manual readiness gate without closing blockers, faking evidence, launching production, calling Telegram, changing BotFather, adding payment/VIP unlock, writing to DB, changing workflows, or adding secrets.",
  "sections": [
    {
      "title": "manual gate",
      "rows": [
        {
          "area": "dry run only after all blockers close",
          "status": "NOT_STARTED_BLOCKERS_OPEN",
          "detail": "dry run only after all blockers close is documented as required and remains pending until real owner/manual evidence exists.",
          "ownerAction": "Provide real evidence before approval."
        },
        {
          "area": "one-channel/test-link approach",
          "status": "NOT_STARTED_BLOCKERS_OPEN",
          "detail": "one-channel/test-link approach is documented as required and remains pending until real owner/manual evidence exists.",
          "ownerAction": "Provide real evidence before approval."
        },
        {
          "area": "rollback plan",
          "status": "NOT_STARTED_BLOCKERS_OPEN",
          "detail": "rollback plan is documented as required and remains pending until real owner/manual evidence exists.",
          "ownerAction": "Provide real evidence before approval."
        }
      ]
    },
    {
      "title": "blocked safety checks",
      "rows": [
        {
          "area": "monitoring checklist",
          "status": "NOT_STARTED_BLOCKERS_OPEN",
          "detail": "monitoring checklist remains a safety requirement for this package.",
          "ownerAction": "Do not close this gate automatically."
        },
        {
          "area": "no Telegram posting now",
          "status": "LOCKED",
          "detail": "no Telegram posting now remains a safety requirement for this package.",
          "ownerAction": "Do not close this gate automatically."
        },
        {
          "area": "no production launch now",
          "status": "LOCKED",
          "detail": "no production launch now remains a safety requirement for this package.",
          "ownerAction": "Do not close this gate automatically."
        }
      ]
    }
  ],
  "safetyBoundaries": [
    {
      "area": "production launch",
      "status": "LOCKED",
      "detail": "No production launch is performed or approved in this package.",
      "ownerAction": "Keep publicLaunchApproved=false."
    },
    {
      "area": "Telegram and BotFather",
      "status": "LOCKED",
      "detail": "No Telegram API calls, messages, BotFather automation, webhook, or command changes are added.",
      "ownerAction": "Manual Telegram and BotFather work remains owner-only."
    },
    {
      "area": "payment and VIP access",
      "status": "LOCKED",
      "detail": "No payment, invoice, entitlement bypass, or VIP unlock is added.",
      "ownerAction": "Keep VIP locked until a future approved payment package."
    },
    {
      "area": "data and automation",
      "status": "LOCKED",
      "detail": "No DB write, production DB connection, external analytics, cron/workflow, publish script, secret, or .env.local change is added.",
      "ownerAction": "Continue manual blocker closure outside Git."
    }
  ],
  "requiredEvidence": [
    "dry run only after all blockers close",
    "one-channel/test-link approach",
    "rollback plan",
    "monitoring checklist",
    "no Telegram posting now",
    "no production launch now"
  ],
  "whatWasNotChanged": [
    "No production launch.",
    "No Telegram API calls.",
    "No messages sent.",
    "No BotFather changes.",
    "No payment added.",
    "No VIP unlock added.",
    "No entitlement bypass added.",
    "No DB writes or production DB connection.",
    "No external analytics.",
    "No cron/workflow/publish script changes.",
    "No secrets or .env.local committed."
  ],
  "remainingBlockers": [
    "owner real Telegram screenshots are still required",
    "owner visual approval is not granted",
    "DATABASE_URL is missing",
    "TELEGRAM_BOT_TOKEN is missing",
    "backup freshness is older than 24h",
    "restore rehearsal evidence is still required",
    "PUBLIC_APP_URL evidence is still required",
    "BotFather Mini App URL setup remains manual and not done",
    "production:safety:check is still red on expected blockers"
  ],
  "safetyFlags": {
    "productionLaunchDone": false,
    "telegramApiUsed": false,
    "messagesSent": false,
    "botFatherChanged": false,
    "paymentAdded": false,
    "vipUnlockAdded": false,
    "entitlementBypassAdded": false,
    "databaseWriteAdded": false,
    "productionDbConnected": false,
    "externalAnalyticsAdded": false,
    "cronWorkflowChanged": false,
    "secretsAdded": false,
    "envLocalCommitted": false
  },
  "safetyNotes": [
    "publicLaunchApproved=false",
    "ownerManualReviewRequired=true",
    "readyForProductionLaunch=false",
    "soft launch remains NO / NOT_APPROVED while blockers remain open",
    "Manual blockers remain open unless real owner/manual evidence exists."
  ],
  "nextPackageRecommendation": "Package 334 - Owner Evidence Review After Real Inputs",
  "readyForSoftLaunch": false
} as const;

export function getAphroditeFinalSoftLaunchDryRunChecklist() {
  return aphroditeFinalSoftLaunchDryRunChecklist;
}
