export type AphroditePublicUrlOwnerActionGateRow = {
  area: string;
  status: string;
  detail: string;
  ownerAction: string;
};

export const APHRODITE_PUBLIC_URL_OWNER_ACTION_GATE_TITLE = "Public URL Owner Action Gate";

export const APHRODITE_PUBLIC_URL_OWNER_ACTION_GATE_ROUTE =
  "/dashboard/networks/zodiac/public-url-owner-action-gate" as const;

export const aphroditePublicUrlOwnerActionGate = {
  "packageNumber": 328,
  "title": "Public URL Owner Action Gate",
  "route": "/dashboard/networks/zodiac/public-url-owner-action-gate",
  "currentMainHead": "be508290e8f00f9b38cda9bd7bd41ce7c2750fd5",
  "statusField": "publicUrlOwnerActionStatus",
  "statusValue": "WAITING_FOR_PUBLIC_HTTPS_URL",
  "publicUrlOwnerActionStatus": "WAITING_FOR_PUBLIC_HTTPS_URL",
  "publicLaunchApproved": false,
  "ownerManualReviewRequired": true,
  "readyForProductionLaunch": false,
  "softLaunchStatus": "NO",
  "blockersRemainOpen": true,
  "manualWorkRequired": true,
  "goal": "Document public url owner action gate as a manual readiness gate without closing blockers, faking evidence, launching production, calling Telegram, changing BotFather, adding payment/VIP unlock, writing to DB, changing workflows, or adding secrets.",
  "sections": [
    {
      "title": "manual gate",
      "rows": [
        {
          "area": "HTTPS required",
          "status": "WAITING_FOR_PUBLIC_HTTPS_URL",
          "detail": "HTTPS required is documented as required and remains pending until real owner/manual evidence exists.",
          "ownerAction": "Provide real evidence before approval."
        },
        {
          "area": "PUBLIC_APP_URL required",
          "status": "WAITING_FOR_PUBLIC_HTTPS_URL",
          "detail": "PUBLIC_APP_URL required is documented as required and remains pending until real owner/manual evidence exists.",
          "ownerAction": "Provide real evidence before approval."
        },
        {
          "area": "route checks required",
          "status": "WAITING_FOR_PUBLIC_HTTPS_URL",
          "detail": "route checks required is documented as required and remains pending until real owner/manual evidence exists.",
          "ownerAction": "Provide real evidence before approval."
        }
      ]
    },
    {
      "title": "blocked safety checks",
      "rows": [
        {
          "area": "dashboard must not be public",
          "status": "WAITING_FOR_PUBLIC_HTTPS_URL",
          "detail": "dashboard must not be public remains a safety requirement for this package.",
          "ownerAction": "Do not close this gate automatically."
        },
        {
          "area": "public routes must be shell-isolated",
          "status": "WAITING_FOR_PUBLIC_HTTPS_URL",
          "detail": "public routes must be shell-isolated remains a safety requirement for this package.",
          "ownerAction": "Do not close this gate automatically."
        },
        {
          "area": "no BotFather setup until public URL verified",
          "status": "LOCKED",
          "detail": "no BotFather setup until public URL verified remains a safety requirement for this package.",
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
    "HTTPS required",
    "PUBLIC_APP_URL required",
    "route checks required",
    "dashboard must not be public",
    "public routes must be shell-isolated",
    "no BotFather setup until public URL verified"
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
  "publicUrlApproved": false,
  "publicAppUrl": "MISSING"
} as const;

export function getAphroditePublicUrlOwnerActionGate() {
  return aphroditePublicUrlOwnerActionGate;
}
