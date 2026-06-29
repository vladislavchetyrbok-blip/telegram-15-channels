export type AphroditeVipPreviewLockCopyConsistencyGateRow = {
  area: string;
  status: string;
  detail: string;
  ownerAction: string;
};

export const APHRODITE_VIP_PREVIEW_LOCK_COPY_CONSISTENCY_GATE_TITLE = "VIP Preview Lock and Copy Consistency Gate";

export const APHRODITE_VIP_PREVIEW_LOCK_COPY_CONSISTENCY_GATE_ROUTE =
  "/dashboard/networks/zodiac/vip-preview-lock-copy-consistency-gate" as const;

export const aphroditevipPreviewLockCopyConsistencyGate = {
  "packageNumber": 305,
  "title": "VIP Preview Lock and Copy Consistency Gate",
  "route": "/dashboard/networks/zodiac/vip-preview-lock-copy-consistency-gate",
  "currentMainHead": "97a6c82f98c038f35ab49bede4c7898145b1250c",
  "statusField": "vipPreviewLockConsistencyStatus",
  "statusValue": "REVIEW_REQUIRED",
  "vipPreviewLockConsistencyStatus": "REVIEW_REQUIRED",
  "publicLaunchApproved": false,
  "ownerManualReviewRequired": true,
  "readyForProductionLaunch": false,
  "softLaunchStatus": "NO",
  "blockersRemainOpen": true,
  "goal": "Document and verify that VIP wording remains consistent after Package 303 and never implies active payment or unlocked access.",
  "sections": [
    {
      "title": "copy terms to verify",
      "rows": [
        {
          "area": "VIP превью",
          "status": "REVIEW_REQUIRED",
          "detail": "Use the Russian preview term on visible locked preview surfaces.",
          "ownerAction": "Owner should confirm wording on real device."
        },
        {
          "area": "без оплаты",
          "status": "REVIEW_REQUIRED",
          "detail": "Locked preview surfaces must continue to state there is no payment.",
          "ownerAction": "Confirm no active payment is implied."
        },
        {
          "area": "VIP закрыт",
          "status": "REVIEW_REQUIRED",
          "detail": "VIP state must remain closed until a future approved package.",
          "ownerAction": "Confirm no unlocked state appears."
        },
        {
          "area": "полный отчёт закрыт",
          "status": "REVIEW_REQUIRED",
          "detail": "Full report access must be described as closed.",
          "ownerAction": "Confirm preview cannot be mistaken for full paid access."
        }
      ]
    },
    {
      "title": "negative assertions",
      "rows": [
        {
          "area": "no active payment copy",
          "status": "LOCKED",
          "detail": "No wording should imply checkout, invoice, subscription, Stars purchase, or payment activation.",
          "ownerAction": "Keep payment inactive."
        },
        {
          "area": "no unlocked VIP copy",
          "status": "LOCKED",
          "detail": "No wording should imply VIP is unlocked or entitlement was granted.",
          "ownerAction": "Keep VIP closed."
        },
        {
          "area": "no entitlement bypass",
          "status": "LOCKED",
          "detail": "No bypass terminology or access shortcut is introduced.",
          "ownerAction": "Keep access gates intact."
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
  "nextPackageRecommendation": "Package 306 - Mobile Result Density Guardrails"
} as const;

export function getAphroditeVipPreviewLockCopyConsistencyGate() {
  return aphroditevipPreviewLockCopyConsistencyGate;
}
