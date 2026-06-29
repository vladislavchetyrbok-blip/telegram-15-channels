export type AphroditeManualBlockerEvidenceMatrixRow = {
  area: string;
  status: string;
  detail: string;
  ownerAction: string;
};

export const APHRODITE_MANUAL_BLOCKER_EVIDENCE_MATRIX_TITLE = "Manual Blocker Evidence Matrix";

export const APHRODITE_MANUAL_BLOCKER_EVIDENCE_MATRIX_ROUTE =
  "/dashboard/networks/zodiac/manual-blocker-evidence-matrix" as const;

export const aphroditemanualBlockerEvidenceMatrix = {
  "packageNumber": 310,
  "title": "Manual Blocker Evidence Matrix",
  "route": "/dashboard/networks/zodiac/manual-blocker-evidence-matrix",
  "currentMainHead": "97a6c82f98c038f35ab49bede4c7898145b1250c",
  "statusField": "manualBlockerEvidenceMatrixStatus",
  "statusValue": "BLOCKERS_OPEN",
  "manualBlockerEvidenceMatrixStatus": "BLOCKERS_OPEN",
  "publicLaunchApproved": false,
  "ownerManualReviewRequired": true,
  "readyForProductionLaunch": false,
  "softLaunchStatus": "NO",
  "blockersRemainOpen": true,
  "goal": "Create one matrix for all manual blockers and evidence requirements, keeping every blocker open unless real evidence exists.",
  "sections": [
    {
      "title": "manual blocker matrix",
      "rows": [
        {
          "area": "owner screenshots/approval",
          "status": "BLOCKERS_OPEN",
          "detail": "Owner real-device screenshots and explicit approval are still missing.",
          "ownerAction": "Provide real evidence before closure."
        },
        {
          "area": "DATABASE_URL",
          "status": "BLOCKERS_OPEN",
          "detail": "DATABASE_URL is not configured in the safe local/prod evidence path.",
          "ownerAction": "Configure outside Git."
        },
        {
          "area": "TELEGRAM_BOT_TOKEN",
          "status": "BLOCKERS_OPEN",
          "detail": "TELEGRAM_BOT_TOKEN is not configured.",
          "ownerAction": "Configure outside Git only."
        },
        {
          "area": "backup <24h",
          "status": "BLOCKERS_OPEN",
          "detail": "Latest backup remains older than 24 hours.",
          "ownerAction": "Refresh backup and capture evidence."
        },
        {
          "area": "restore rehearsal",
          "status": "BLOCKERS_OPEN",
          "detail": "Restore rehearsal evidence is not completed.",
          "ownerAction": "Run and document rehearsal manually."
        },
        {
          "area": "PUBLIC_APP_URL",
          "status": "BLOCKERS_OPEN",
          "detail": "Public app URL evidence is still missing.",
          "ownerAction": "Verify real public URL manually."
        },
        {
          "area": "BotFather Mini App URL",
          "status": "BLOCKERS_OPEN",
          "detail": "BotFather Mini App URL setup remains manual and not done.",
          "ownerAction": "Owner must set it manually later."
        }
      ]
    },
    {
      "title": "closure rule",
      "rows": [
        {
          "area": "all remain open unless real evidence exists",
          "status": "LOCKED",
          "detail": "This matrix does not close any blocker by assertion.",
          "ownerAction": "Close only with owner/manual evidence."
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
      "detail": "No Telegram API, messages, BotFather automation, webhook, or command mutation is added.",
      "ownerAction": "Manual Telegram/BotFather work remains owner-only."
    },
    {
      "area": "payment and VIP access",
      "status": "LOCKED",
      "detail": "No payment, invoice, entitlement bypass, or VIP unlock is added.",
      "ownerAction": "Keep VIP closed until a future approved payment package."
    },
    {
      "area": "data and automation",
      "status": "LOCKED",
      "detail": "No DB write, production DB connection, external analytics, cron/workflow, publish script, secret, or .env.local change is added.",
      "ownerAction": "Continue manual blocker closure outside Git."
    }
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
    "owner real-device screenshots and explicit approval are still required",
    "DATABASE_URL is missing",
    "TELEGRAM_BOT_TOKEN is missing",
    "backup freshness is older than 24h",
    "restore rehearsal evidence is still required",
    "PUBLIC_APP_URL evidence is still required",
    "BotFather Mini App URL setup remains manual and not done"
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
    "softLaunchStatus=NO / NOT_APPROVED unless a package-specific no-go value is recorded",
    "Manual blockers remain open unless real owner/manual evidence exists."
  ],
  "nextPackageRecommendation": "Package 311 - Pre-Soft-Launch No-Go Enforcement Record"
} as const;

export function getAphroditeManualBlockerEvidenceMatrix() {
  return aphroditemanualBlockerEvidenceMatrix;
}
