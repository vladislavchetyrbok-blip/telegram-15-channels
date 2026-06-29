export type AphroditePublicMiniappRouteVisualRegressionChecklistRow = {
  area: string;
  status: string;
  detail: string;
  ownerAction: string;
};

export const APHRODITE_PUBLIC_MINIAPP_ROUTE_VISUAL_REGRESSION_CHECKLIST_TITLE = "Public Mini App Route Visual Regression Checklist";

export const APHRODITE_PUBLIC_MINIAPP_ROUTE_VISUAL_REGRESSION_CHECKLIST_ROUTE =
  "/dashboard/networks/zodiac/public-miniapp-route-visual-regression-checklist" as const;

export const aphroditepublicMiniappRouteVisualRegressionChecklist = {
  "packageNumber": 307,
  "title": "Public Mini App Route Visual Regression Checklist",
  "route": "/dashboard/networks/zodiac/public-miniapp-route-visual-regression-checklist",
  "currentMainHead": "97a6c82f98c038f35ab49bede4c7898145b1250c",
  "statusField": "visualRegressionChecklistStatus",
  "statusValue": "READY_FOR_RECHECK",
  "visualRegressionChecklistStatus": "READY_FOR_RECHECK",
  "publicLaunchApproved": false,
  "ownerManualReviewRequired": true,
  "readyForProductionLaunch": false,
  "softLaunchStatus": "NO",
  "blockersRemainOpen": true,
  "goal": "Consolidate visual regression checks for all public Mini App routes after Package 303.",
  "sections": [
    {
      "title": "routes for recheck",
      "rows": [
        {
          "area": "/miniapp",
          "status": "READY_FOR_RECHECK",
          "detail": "Public Mini App home must render without dashboard shell.",
          "ownerAction": "Owner/visual QA should inspect this route."
        },
        {
          "area": "/compatibility",
          "status": "READY_FOR_RECHECK",
          "detail": "Compatibility route must render public result flow only.",
          "ownerAction": "Confirm compact 30-day result."
        },
        {
          "area": "/birth-matrix",
          "status": "READY_FOR_RECHECK",
          "detail": "Birth matrix route must remain public and readable.",
          "ownerAction": "Confirm inputs are stable."
        },
        {
          "area": "/vip-preview",
          "status": "READY_FOR_RECHECK",
          "detail": "VIP preview route must remain locked and compact.",
          "ownerAction": "Confirm no active payment."
        },
        {
          "area": "/vip-compatibility-report",
          "status": "READY_FOR_RECHECK",
          "detail": "Standalone report preview must remain locked.",
          "ownerAction": "Confirm no full report unlock."
        },
        {
          "area": "/miniapp?startapp=mystic",
          "status": "READY_FOR_RECHECK",
          "detail": "Mystic startapp path must open the correct public surface.",
          "ownerAction": "Confirm bottom nav stability."
        },
        {
          "area": "/miniapp?startapp=compatibility",
          "status": "READY_FOR_RECHECK",
          "detail": "Compatibility startapp path must remain public.",
          "ownerAction": "Confirm no admin shell."
        },
        {
          "area": "/miniapp?startapp=birth_matrix",
          "status": "READY_FOR_RECHECK",
          "detail": "Birth matrix startapp path must remain public.",
          "ownerAction": "Confirm no broken inputs."
        },
        {
          "area": "/miniapp?startapp=vip",
          "status": "READY_FOR_RECHECK",
          "detail": "VIP startapp path must remain locked and compact.",
          "ownerAction": "Confirm no payment or unlock."
        }
      ]
    },
    {
      "title": "visual assertions",
      "rows": [
        {
          "area": "no admin shell",
          "status": "READY_FOR_RECHECK",
          "detail": "Public routes must not show dashboard shell.",
          "ownerAction": "Reject screenshots with admin chrome."
        },
        {
          "area": "no Aphrodite visible",
          "status": "READY_FOR_RECHECK",
          "detail": "Public Mini App routes must not expose internal Aphrodite branding.",
          "ownerAction": "Confirm customer-facing brand only."
        },
        {
          "area": "no broken bottom nav",
          "status": "READY_FOR_RECHECK",
          "detail": "Bottom navigation must remain stable.",
          "ownerAction": "Check after scrolling generated results."
        },
        {
          "area": "no horizontal overflow",
          "status": "READY_FOR_RECHECK",
          "detail": "No public route should scroll horizontally.",
          "ownerAction": "Check 390px and real Telegram widths."
        },
        {
          "area": "no broken inputs",
          "status": "READY_FOR_RECHECK",
          "detail": "Date, time, and city controls must remain usable.",
          "ownerAction": "Capture input screenshots."
        },
        {
          "area": "no unlocked VIP",
          "status": "READY_FOR_RECHECK",
          "detail": "VIP content must remain locked.",
          "ownerAction": "Confirm entitlement remains closed."
        },
        {
          "area": "no active payment",
          "status": "READY_FOR_RECHECK",
          "detail": "No checkout or active payment flow appears.",
          "ownerAction": "Keep manual blockers open."
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
  "nextPackageRecommendation": "Package 308 - Input Controls Final Owner Review Gate"
} as const;

export function getAphroditePublicMiniappRouteVisualRegressionChecklist() {
  return aphroditepublicMiniappRouteVisualRegressionChecklist;
}
