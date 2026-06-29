export type AphroditeNativeIosAndroidFutureRoadmapDraftRow = {
  area: string;
  status: string;
  detail: string;
  ownerAction: string;
};

export const APHRODITE_NATIVE_IOS_ANDROID_FUTURE_ROADMAP_DRAFT_TITLE = "Native iPhone Android Future Roadmap Draft";

export const APHRODITE_NATIVE_IOS_ANDROID_FUTURE_ROADMAP_DRAFT_ROUTE =
  "/dashboard/networks/zodiac/native-ios-android-future-roadmap-draft" as const;

export const aphroditenativeIosAndroidFutureRoadmapDraft = {
  "packageNumber": 312,
  "title": "Native iPhone Android Future Roadmap Draft",
  "route": "/dashboard/networks/zodiac/native-ios-android-future-roadmap-draft",
  "currentMainHead": "97a6c82f98c038f35ab49bede4c7898145b1250c",
  "statusField": "nativeRoadmapStatus",
  "statusValue": "DRAFT_AFTER_TELEGRAM_STABILITY",
  "nativeRoadmapStatus": "DRAFT_AFTER_TELEGRAM_STABILITY",
  "publicLaunchApproved": false,
  "ownerManualReviewRequired": true,
  "readyForProductionLaunch": false,
  "softLaunchStatus": "NO",
  "blockersRemainOpen": true,
  "goal": "Draft a future native iPhone/Android roadmap after Telegram Mini App stabilization, without adding native app code or store actions now.",
  "sections": [
    {
      "title": "roadmap principles",
      "rows": [
        {
          "area": "Telegram Mini App first",
          "status": "DRAFT_AFTER_TELEGRAM_STABILITY",
          "detail": "Stabilize Telegram Mini App and manual evidence before native investment.",
          "ownerAction": "Use soft launch metrics first."
        },
        {
          "area": "native app later",
          "status": "DRAFT_AFTER_TELEGRAM_STABILITY",
          "detail": "iPhone/Android native apps are future roadmap items, not this release.",
          "ownerAction": "Do not start native implementation now."
        },
        {
          "area": "shared backend/content core",
          "status": "DRAFT_AFTER_TELEGRAM_STABILITY",
          "detail": "Future native apps should reuse the same content and safety model.",
          "ownerAction": "Plan after Mini App metrics."
        },
        {
          "area": "iPhone/Android only after soft launch metrics",
          "status": "DRAFT_AFTER_TELEGRAM_STABILITY",
          "detail": "Native work waits until soft launch evidence supports it.",
          "ownerAction": "Review retention and UX data later."
        }
      ]
    },
    {
      "title": "excluded actions",
      "rows": [
        {
          "area": "no native app code in this package",
          "status": "LOCKED",
          "detail": "No iOS, Android, Expo, React Native, App Store, or Play code is added.",
          "ownerAction": "Keep codebase unchanged for native."
        },
        {
          "area": "no App Store / Google Play action now",
          "status": "LOCKED",
          "detail": "No store listing, signing, account, or submission action is performed.",
          "ownerAction": "Future owner decision only."
        },
        {
          "area": "no payment changes",
          "status": "LOCKED",
          "detail": "No native payment or web payment change is introduced.",
          "ownerAction": "Keep payment blocker open."
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
  "nextPackageRecommendation": "Package 313 - Post-303 Final Readiness Summary"
} as const;

export function getAphroditeNativeIosAndroidFutureRoadmapDraft() {
  return aphroditenativeIosAndroidFutureRoadmapDraft;
}
