export type AphroditePost303RealDeviceScreenshotEvidencePackRow = {
  area: string;
  status: string;
  detail: string;
  ownerAction: string;
};

export const APHRODITE_POST_303_REAL_DEVICE_SCREENSHOT_EVIDENCE_PACK_TITLE = "Post-303 Real Device Screenshot Evidence Pack";

export const APHRODITE_POST_303_REAL_DEVICE_SCREENSHOT_EVIDENCE_PACK_ROUTE =
  "/dashboard/networks/zodiac/post-303-real-device-screenshot-evidence-pack" as const;

export const aphroditepost303RealDeviceScreenshotEvidencePack = {
  "packageNumber": 304,
  "title": "Post-303 Real Device Screenshot Evidence Pack",
  "route": "/dashboard/networks/zodiac/post-303-real-device-screenshot-evidence-pack",
  "currentMainHead": "97a6c82f98c038f35ab49bede4c7898145b1250c",
  "statusField": "post303ScreenshotEvidenceStatus",
  "statusValue": "PENDING_OWNER_SCREENSHOTS",
  "post303ScreenshotEvidenceStatus": "PENDING_OWNER_SCREENSHOTS",
  "publicLaunchApproved": false,
  "ownerManualReviewRequired": true,
  "readyForProductionLaunch": false,
  "softLaunchStatus": "NO",
  "blockersRemainOpen": true,
  "goal": "Prepare a screenshot evidence pack checklist after Package 303 without fabricating screenshots or marking owner evidence received.",
  "sections": [
    {
      "title": "required screenshots",
      "rows": [
        {
          "area": "/miniapp",
          "status": "PENDING_OWNER_SCREENSHOTS",
          "detail": "Owner must capture the public Mini App home route on a real Telegram device.",
          "ownerAction": "Upload or reference the real screenshot before approval."
        },
        {
          "area": "/compatibility",
          "status": "PENDING_OWNER_SCREENSHOTS",
          "detail": "Owner must capture compatibility result state after Package 303.",
          "ownerAction": "Confirm no admin shell, no Aphrodite, and no overflow."
        },
        {
          "area": "/birth-matrix",
          "status": "PENDING_OWNER_SCREENSHOTS",
          "detail": "Owner must capture the public birth matrix route.",
          "ownerAction": "Confirm input controls stay readable on device."
        },
        {
          "area": "/vip-preview",
          "status": "PENDING_OWNER_SCREENSHOTS",
          "detail": "Owner must capture the direct VIP preview route.",
          "ownerAction": "Confirm VIP preview is compact and locked."
        },
        {
          "area": "/vip-compatibility-report",
          "status": "PENDING_OWNER_SCREENSHOTS",
          "detail": "Owner must capture the standalone VIP compatibility report preview.",
          "ownerAction": "Confirm full report remains closed."
        },
        {
          "area": "/miniapp?startapp=mystic",
          "status": "PENDING_OWNER_SCREENSHOTS",
          "detail": "Owner must capture Mystic startapp routing.",
          "ownerAction": "Confirm bottom nav and cards remain stable."
        },
        {
          "area": "VIP preview compact result",
          "status": "PENDING_OWNER_SCREENSHOTS",
          "detail": "Evidence must show the compact locked preview after the density fix.",
          "ownerAction": "Confirm no full-report unlock is implied."
        },
        {
          "area": "30-day result after density fix",
          "status": "PENDING_OWNER_SCREENSHOTS",
          "detail": "Evidence must show first 5 days compact and days 6-30 compressed.",
          "ownerAction": "Confirm no wall of text."
        },
        {
          "area": "bottom nav",
          "status": "PENDING_OWNER_SCREENSHOTS",
          "detail": "Evidence must show bottom navigation remains reachable after scrolling.",
          "ownerAction": "Confirm no overlap."
        },
        {
          "area": "date input",
          "status": "PENDING_OWNER_SCREENSHOTS",
          "detail": "Evidence must show date entry is readable.",
          "ownerAction": "Use the manual input checklist."
        },
        {
          "area": "time input",
          "status": "PENDING_OWNER_SCREENSHOTS",
          "detail": "Evidence must show time input/unknown time state.",
          "ownerAction": "Confirm keyboard does not hide critical CTA."
        },
        {
          "area": "city Днепр / Дніпро",
          "status": "PENDING_OWNER_SCREENSHOTS",
          "detail": "Evidence must show city suggestions for Днепр / Дніпро where applicable.",
          "ownerAction": "Do not use an external city API."
        }
      ]
    },
    {
      "title": "evidence policy",
      "rows": [
        {
          "area": "no fake screenshots",
          "status": "LOCKED",
          "detail": "This package creates only an evidence checklist and does not create or claim real-device screenshots.",
          "ownerAction": "Owner must provide real Telegram screenshots."
        },
        {
          "area": "owner screenshots received",
          "status": "PENDING_OWNER_SCREENSHOTS",
          "detail": "No owner screenshots are marked received by Codex.",
          "ownerAction": "Keep approval pending."
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
  "nextPackageRecommendation": "Package 305 - VIP Preview Lock and Copy Consistency Gate"
} as const;

export function getAphroditePost303RealDeviceScreenshotEvidencePack() {
  return aphroditepost303RealDeviceScreenshotEvidencePack;
}
