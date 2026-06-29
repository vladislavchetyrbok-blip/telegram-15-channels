export type AphroditeBotfatherOwnerActionGateRow = {
  area: string;
  status: string;
  detail: string;
  ownerAction: string;
};

export const APHRODITE_BOTFATHER_OWNER_ACTION_GATE_TITLE = "BotFather Owner Action Gate";

export const APHRODITE_BOTFATHER_OWNER_ACTION_GATE_ROUTE =
  "/dashboard/networks/zodiac/botfather-owner-action-gate" as const;

export const aphroditeBotfatherOwnerActionGate = {
  "packageNumber": 329,
  "title": "BotFather Owner Action Gate",
  "route": "/dashboard/networks/zodiac/botfather-owner-action-gate",
  "currentMainHead": "be508290e8f00f9b38cda9bd7bd41ce7c2750fd5",
  "statusField": "botFatherOwnerActionStatus",
  "statusValue": "WAITING_FOR_MANUAL_BOTFATHER_SETUP",
  "botFatherOwnerActionStatus": "WAITING_FOR_MANUAL_BOTFATHER_SETUP",
  "publicLaunchApproved": false,
  "ownerManualReviewRequired": true,
  "readyForProductionLaunch": false,
  "softLaunchStatus": "NO",
  "blockersRemainOpen": true,
  "manualWorkRequired": true,
  "goal": "Document botfather owner action gate as a manual readiness gate without closing blockers, faking evidence, launching production, calling Telegram, changing BotFather, adding payment/VIP unlock, writing to DB, changing workflows, or adding secrets.",
  "sections": [
    {
      "title": "manual gate",
      "rows": [
        {
          "area": "BotFather setup manual only",
          "status": "WAITING_FOR_MANUAL_BOTFATHER_SETUP",
          "detail": "BotFather setup manual only is documented as required and remains pending until real owner/manual evidence exists.",
          "ownerAction": "Provide real evidence before approval."
        },
        {
          "area": "no BotFather automation",
          "status": "WAITING_FOR_MANUAL_BOTFATHER_SETUP",
          "detail": "no BotFather automation is documented as required and remains pending until real owner/manual evidence exists.",
          "ownerAction": "Provide real evidence before approval."
        },
        {
          "area": "no Telegram API calls",
          "status": "WAITING_FOR_MANUAL_BOTFATHER_SETUP",
          "detail": "no Telegram API calls is documented as required and remains pending until real owner/manual evidence exists.",
          "ownerAction": "Provide real evidence before approval."
        }
      ]
    },
    {
      "title": "blocked safety checks",
      "rows": [
        {
          "area": "no messages",
          "status": "LOCKED",
          "detail": "no messages remains a safety requirement for this package.",
          "ownerAction": "Do not close this gate automatically."
        },
        {
          "area": "only after owner approval and public URL verification",
          "status": "WAITING_FOR_MANUAL_BOTFATHER_SETUP",
          "detail": "only after owner approval and public URL verification remains a safety requirement for this package.",
          "ownerAction": "Do not close this gate automatically."
        },
        {
          "area": "no launch from this package",
          "status": "LOCKED",
          "detail": "no launch from this package remains a safety requirement for this package.",
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
    "BotFather setup manual only",
    "no BotFather automation",
    "no Telegram API calls",
    "no messages",
    "only after owner approval and public URL verification",
    "no launch from this package"
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
  "botFatherSetupDone": false,
  "telegramMiniAppUrlStatus": "NOT_DONE"
} as const;

export function getAphroditeBotfatherOwnerActionGate() {
  return aphroditeBotfatherOwnerActionGate;
}
