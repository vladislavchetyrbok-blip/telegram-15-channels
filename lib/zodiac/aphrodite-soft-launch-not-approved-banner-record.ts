export type AphroditeSoftLaunchNotApprovedBannerRecordRow = {
  area: string;
  status: string;
  detail: string;
  ownerAction: string;
};

export const APHRODITE_SOFT_LAUNCH_NOT_APPROVED_BANNER_RECORD_TITLE = "Soft Launch Not Approved Banner Record";

export const APHRODITE_SOFT_LAUNCH_NOT_APPROVED_BANNER_RECORD_ROUTE =
  "/dashboard/networks/zodiac/soft-launch-not-approved-banner-record" as const;

export const aphroditeSoftLaunchNotApprovedBannerRecord = {
  "packageNumber": 349,
  "title": "Soft Launch Not Approved Banner Record",
  "route": "/dashboard/networks/zodiac/soft-launch-not-approved-banner-record",
  "currentMainHead": "b40080ce9c956cde622f96a185bc8cde5c604201",
  "statusField": "softLaunchBannerStatus",
  "statusValue": "NOT_APPROVED",
  "softLaunchBannerStatus": "NOT_APPROVED",
  "publicLaunchApproved": false,
  "ownerManualReviewRequired": true,
  "readyForProductionLaunch": false,
  "softLaunchStatus": "NO",
  "blockersRemainOpen": true,
  "manualWorkRequired": true,
  "goal": "Document soft launch not approved banner record for Telegram Mini App manual evidence gates without closing blockers, faking evidence, launching production, calling Telegram, changing BotFather, adding payment/VIP unlock, writing to DB, changing workflows, touching apps/mobile, or adding secrets.",
  "sections": [
    {
      "title": "manual evidence gate",
      "rows": [
        {
          "area": "visible internal dashboard status",
          "status": "NOT_APPROVED",
          "detail": "visible internal dashboard status is required before this gate can close. This package records the requirement only.",
          "ownerAction": "Provide real owner/manual evidence later."
        },
        {
          "area": "not public user-facing banner",
          "status": "NOT_APPROVED",
          "detail": "not public user-facing banner is required before this gate can close. This package records the requirement only.",
          "ownerAction": "Provide real owner/manual evidence later."
        },
        {
          "area": "no production launch",
          "status": "NOT_APPROVED",
          "detail": "no production launch is required before this gate can close. This package records the requirement only.",
          "ownerAction": "Provide real owner/manual evidence later."
        }
      ]
    },
    {
      "title": "blocked safety boundary",
      "rows": [
        {
          "area": "no Telegram posting",
          "status": "LOCKED",
          "detail": "no Telegram posting remains blocked or future-only until owner/manual evidence exists.",
          "ownerAction": "Do not mark this complete automatically."
        },
        {
          "area": "all blockers listed",
          "status": "NOT_APPROVED",
          "detail": "all blockers listed remains blocked or future-only until owner/manual evidence exists.",
          "ownerAction": "Do not mark this complete automatically."
        }
      ]
    }
  ],
  "safetyBoundaries": [
    {
      "area": "production launch",
      "status": "LOCKED",
      "detail": "No production launch is performed or approved in this package.",
      "ownerAction": "Keep publicLaunchApproved=false and readyForProductionLaunch=false."
    },
    {
      "area": "Telegram and BotFather",
      "status": "LOCKED",
      "detail": "No Telegram API calls, messages, BotFather automation, webhook, command, or menu changes are added.",
      "ownerAction": "Keep Telegram and BotFather untouched until owner-only manual approval."
    },
    {
      "area": "payment and VIP access",
      "status": "LOCKED",
      "detail": "No payment, invoice, entitlement bypass, or VIP unlock is added.",
      "ownerAction": "Keep VIP monetization locked for a future approved package."
    },
    {
      "area": "data and automation",
      "status": "LOCKED",
      "detail": "No DB write, production DB connection, external analytics, cron/workflow, publish script, secret, or .env.local change is added.",
      "ownerAction": "Close manual blockers outside Git only with real evidence."
    },
    {
      "area": "mobile track",
      "status": "LOCKED",
      "detail": "apps/mobile and native iPhone/Android work remain outside this Telegram Mini App gate.",
      "ownerAction": "Keep mobile work deferred on its separate branch."
    }
  ],
  "requiredEvidence": [
    "visible internal dashboard status",
    "not public user-facing banner",
    "no production launch",
    "no Telegram posting",
    "all blockers listed"
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
    "No apps/mobile changes.",
    "No secrets or .env.local committed."
  ],
  "remainingBlockers": [
    "owner real Telegram screenshots are still required",
    "owner visual approval is not granted",
    "DATABASE_URL is missing or not redacted-verified",
    "TELEGRAM_BOT_TOKEN is missing or not redacted-verified",
    "backup freshness is older than 24h or not verified",
    "restore rehearsal evidence is still required",
    "PUBLIC_APP_URL evidence is still required",
    "BotFather Mini App URL setup remains manual and not done",
    "production:safety:check is still red on expected blockers",
    "owner final go/no-go remains NO-GO"
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
    "softLaunchStatus=NO / NOT_APPROVED while blockers remain open",
    "Manual blockers remain open unless real owner/manual evidence exists."
  ],
  "nextPackageRecommendation": "Package 355 - Owner Manual Evidence Review",
  "softLaunchApproved": false
} as const;

export function getAphroditeSoftLaunchNotApprovedBannerRecord() {
  return aphroditeSoftLaunchNotApprovedBannerRecord;
}
