export type AphroditeOwnerScreenshotEvidenceReviewAfterUploadRow = {
  area: string;
  status: string;
  detail: string;
  ownerAction: string;
};

export const APHRODITE_OWNER_SCREENSHOT_EVIDENCE_REVIEW_AFTER_UPLOAD_TITLE = "Owner Screenshot Evidence Review After Upload";

export const APHRODITE_OWNER_SCREENSHOT_EVIDENCE_REVIEW_AFTER_UPLOAD_ROUTE =
  "/dashboard/networks/zodiac/owner-screenshot-evidence-review-after-upload" as const;

export const aphroditeOwnerScreenshotEvidenceReviewAfterUpload = {
  "packageNumber": 324,
  "title": "Owner Screenshot Evidence Review After Upload",
  "route": "/dashboard/networks/zodiac/owner-screenshot-evidence-review-after-upload",
  "currentMainHead": "be508290e8f00f9b38cda9bd7bd41ce7c2750fd5",
  "statusField": "ownerScreenshotEvidenceReviewStatus",
  "statusValue": "WAITING_FOR_OWNER_UPLOADS",
  "ownerScreenshotEvidenceReviewStatus": "WAITING_FOR_OWNER_UPLOADS",
  "publicLaunchApproved": false,
  "ownerManualReviewRequired": true,
  "readyForProductionLaunch": false,
  "softLaunchStatus": "NO",
  "blockersRemainOpen": true,
  "manualWorkRequired": true,
  "goal": "Document owner screenshot evidence review after upload as a manual readiness gate without closing blockers, faking evidence, launching production, calling Telegram, changing BotFather, adding payment/VIP unlock, writing to DB, changing workflows, or adding secrets.",
  "sections": [
    {
      "title": "manual gate",
      "rows": [
        {
          "area": "required real Telegram screenshots",
          "status": "WAITING_FOR_OWNER_UPLOADS",
          "detail": "required real Telegram screenshots is documented as required and remains pending until real owner/manual evidence exists.",
          "ownerAction": "Provide real evidence before approval."
        },
        {
          "area": "no fake screenshots",
          "status": "WAITING_FOR_OWNER_UPLOADS",
          "detail": "no fake screenshots is documented as required and remains pending until real owner/manual evidence exists.",
          "ownerAction": "Provide real evidence before approval."
        },
        {
          "area": "no automatic approval",
          "status": "WAITING_FOR_OWNER_UPLOADS",
          "detail": "no automatic approval is documented as required and remains pending until real owner/manual evidence exists.",
          "ownerAction": "Provide real evidence before approval."
        },
        {
          "area": "VIP preview after Package 303",
          "status": "WAITING_FOR_OWNER_UPLOADS",
          "detail": "VIP preview after Package 303 is documented as required and remains pending until real owner/manual evidence exists.",
          "ownerAction": "Provide real evidence before approval."
        }
      ]
    },
    {
      "title": "blocked safety checks",
      "rows": [
        {
          "area": "input checks",
          "status": "WAITING_FOR_OWNER_UPLOADS",
          "detail": "input checks remains a safety requirement for this package.",
          "ownerAction": "Do not close this gate automatically."
        },
        {
          "area": "bottom nav checks",
          "status": "WAITING_FOR_OWNER_UPLOADS",
          "detail": "bottom nav checks remains a safety requirement for this package.",
          "ownerAction": "Do not close this gate automatically."
        },
        {
          "area": "no payment/VIP unlock",
          "status": "LOCKED",
          "detail": "no payment/VIP unlock remains a safety requirement for this package.",
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
    "required real Telegram screenshots",
    "no fake screenshots",
    "no automatic approval",
    "VIP preview after Package 303",
    "input checks",
    "bottom nav checks",
    "no payment/VIP unlock"
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
  "ownerApprovalGranted": false,
  "screenshotsReceived": 0
} as const;

export function getAphroditeOwnerScreenshotEvidenceReviewAfterUpload() {
  return aphroditeOwnerScreenshotEvidenceReviewAfterUpload;
}
