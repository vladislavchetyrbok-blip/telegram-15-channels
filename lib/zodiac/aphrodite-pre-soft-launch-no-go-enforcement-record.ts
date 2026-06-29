export type AphroditePreSoftLaunchNoGoEnforcementRecordRow = {
  area: string;
  status: string;
  detail: string;
  ownerAction: string;
};

export const APHRODITE_PRE_SOFT_LAUNCH_NO_GO_ENFORCEMENT_RECORD_TITLE = "Pre-Soft-Launch No-Go Enforcement Record";

export const APHRODITE_PRE_SOFT_LAUNCH_NO_GO_ENFORCEMENT_RECORD_ROUTE =
  "/dashboard/networks/zodiac/pre-soft-launch-no-go-enforcement-record" as const;

export const aphroditepreSoftLaunchNoGoEnforcementRecord = {
  "packageNumber": 311,
  "title": "Pre-Soft-Launch No-Go Enforcement Record",
  "route": "/dashboard/networks/zodiac/pre-soft-launch-no-go-enforcement-record",
  "currentMainHead": "97a6c82f98c038f35ab49bede4c7898145b1250c",
  "statusField": "softLaunchStatus",
  "statusValue": "NO_GO_BLOCKERS_OPEN",
  "softLaunchStatus": "NO_GO_BLOCKERS_OPEN",
  "publicLaunchApproved": false,
  "ownerManualReviewRequired": true,
  "readyForProductionLaunch": false,
  "blockersRemainOpen": true,
  "readyForSoftLaunch": false,
  "goal": "Record that the project is still NO-GO for soft launch until manual blockers close.",
  "sections": [
    {
      "title": "why no-go",
      "rows": [
        {
          "area": "manual blockers open",
          "status": "NO_GO_BLOCKERS_OPEN",
          "detail": "Owner approval, env, backup, restore, public URL, and BotFather evidence are still open.",
          "ownerAction": "Do not soft launch."
        },
        {
          "area": "production safety red",
          "status": "NO_GO_BLOCKERS_OPEN",
          "detail": "production:safety:check is expected red on manual blockers.",
          "ownerAction": "Resolve blockers outside Git."
        }
      ]
    },
    {
      "title": "what must become true",
      "rows": [
        {
          "area": "what must become true",
          "status": "PENDING",
          "detail": "Owner approval, production env, fresh backup, restore rehearsal, public URL evidence, BotFather manual URL, and production safety must all become true before soft launch.",
          "ownerAction": "Close each blocker with real evidence in a future audited package."
        },
        {
          "area": "owner approval true",
          "status": "PENDING",
          "detail": "Owner must approve real-device evidence explicitly.",
          "ownerAction": "Record in a future audited package."
        },
        {
          "area": "production safety green",
          "status": "PENDING",
          "detail": "DATABASE_URL, TELEGRAM_BOT_TOKEN, backup freshness, and restore/public URL/BotFather evidence must be complete.",
          "ownerAction": "Run final safety after closure."
        }
      ]
    },
    {
      "title": "prohibited actions",
      "rows": [
        {
          "area": "no production launch",
          "status": "LOCKED",
          "detail": "No launch occurs in this no-go record.",
          "ownerAction": "Keep launch blocked."
        },
        {
          "area": "no Telegram posting",
          "status": "LOCKED",
          "detail": "No Telegram posting or API call occurs.",
          "ownerAction": "Keep messaging disabled."
        },
        {
          "area": "no BotFather setup",
          "status": "LOCKED",
          "detail": "No BotFather setup is automated.",
          "ownerAction": "Owner-only manual action later."
        },
        {
          "area": "no payment/VIP unlock",
          "status": "LOCKED",
          "detail": "No payment or VIP unlock is added.",
          "ownerAction": "Keep VIP closed."
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
  "nextPackageRecommendation": "Package 312 - Native iPhone Android Future Roadmap Draft"
} as const;

export function getAphroditePreSoftLaunchNoGoEnforcementRecord() {
  return aphroditepreSoftLaunchNoGoEnforcementRecord;
}
