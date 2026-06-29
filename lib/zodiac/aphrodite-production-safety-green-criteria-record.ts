export type AphroditeProductionSafetyGreenCriteriaRecordRow = {
  area: string;
  status: string;
  detail: string;
  ownerAction: string;
};

export const APHRODITE_PRODUCTION_SAFETY_GREEN_CRITERIA_RECORD_TITLE = "Production Safety Green Criteria Record";

export const APHRODITE_PRODUCTION_SAFETY_GREEN_CRITERIA_RECORD_ROUTE =
  "/dashboard/networks/zodiac/production-safety-green-criteria-record" as const;

export const aphroditeProductionSafetyGreenCriteriaRecord = {
  "packageNumber": 330,
  "title": "Production Safety Green Criteria Record",
  "route": "/dashboard/networks/zodiac/production-safety-green-criteria-record",
  "currentMainHead": "be508290e8f00f9b38cda9bd7bd41ce7c2750fd5",
  "statusField": "productionSafetyGreenStatus",
  "statusValue": "NOT_GREEN_MANUAL_BLOCKERS_OPEN",
  "productionSafetyGreenStatus": "NOT_GREEN_MANUAL_BLOCKERS_OPEN",
  "publicLaunchApproved": false,
  "ownerManualReviewRequired": true,
  "readyForProductionLaunch": false,
  "softLaunchStatus": "NO",
  "blockersRemainOpen": true,
  "manualWorkRequired": true,
  "goal": "Document production safety green criteria record as a manual readiness gate without closing blockers, faking evidence, launching production, calling Telegram, changing BotFather, adding payment/VIP unlock, writing to DB, changing workflows, or adding secrets.",
  "sections": [
    {
      "title": "manual gate",
      "rows": [
        {
          "area": "production:safety:check must turn green before launch",
          "status": "NOT_GREEN_MANUAL_BLOCKERS_OPEN",
          "detail": "production:safety:check must turn green before launch is documented as required and remains pending until real owner/manual evidence exists.",
          "ownerAction": "Provide real evidence before approval."
        },
        {
          "area": "current expected red reasons",
          "status": "NOT_GREEN_MANUAL_BLOCKERS_OPEN",
          "detail": "current expected red reasons is documented as required and remains pending until real owner/manual evidence exists.",
          "ownerAction": "Provide real evidence before approval."
        },
        {
          "area": "DATABASE_URL missing",
          "status": "NOT_GREEN_MANUAL_BLOCKERS_OPEN",
          "detail": "DATABASE_URL missing is documented as required and remains pending until real owner/manual evidence exists.",
          "ownerAction": "Provide real evidence before approval."
        }
      ]
    },
    {
      "title": "blocked safety checks",
      "rows": [
        {
          "area": "TELEGRAM_BOT_TOKEN missing",
          "status": "NOT_GREEN_MANUAL_BLOCKERS_OPEN",
          "detail": "TELEGRAM_BOT_TOKEN missing remains a safety requirement for this package.",
          "ownerAction": "Do not close this gate automatically."
        },
        {
          "area": "backup stale",
          "status": "NOT_GREEN_MANUAL_BLOCKERS_OPEN",
          "detail": "backup stale remains a safety requirement for this package.",
          "ownerAction": "Do not close this gate automatically."
        },
        {
          "area": "no launch while red",
          "status": "LOCKED",
          "detail": "no launch while red remains a safety requirement for this package.",
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
    "production:safety:check must turn green before launch",
    "current expected red reasons",
    "DATABASE_URL missing",
    "TELEGRAM_BOT_TOKEN missing",
    "backup stale",
    "no launch while red"
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
  "nextPackageRecommendation": "Package 334 - Owner Evidence Review After Real Inputs"
} as const;

export function getAphroditeProductionSafetyGreenCriteriaRecord() {
  return aphroditeProductionSafetyGreenCriteriaRecord;
}
