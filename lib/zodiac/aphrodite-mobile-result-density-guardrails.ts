export type AphroditeMobileResultDensityGuardrailsRow = {
  area: string;
  status: string;
  detail: string;
  ownerAction: string;
};

export const APHRODITE_MOBILE_RESULT_DENSITY_GUARDRAILS_TITLE = "Mobile Result Density Guardrails";

export const APHRODITE_MOBILE_RESULT_DENSITY_GUARDRAILS_ROUTE =
  "/dashboard/networks/zodiac/mobile-result-density-guardrails" as const;

export const aphroditemobileResultDensityGuardrails = {
  "packageNumber": 306,
  "title": "Mobile Result Density Guardrails",
  "route": "/dashboard/networks/zodiac/mobile-result-density-guardrails",
  "currentMainHead": "97a6c82f98c038f35ab49bede4c7898145b1250c",
  "statusField": "mobileDensityGuardrailsStatus",
  "statusValue": "ACTIVE_DOCUMENTED",
  "mobileDensityGuardrailsStatus": "ACTIVE_DOCUMENTED",
  "publicLaunchApproved": false,
  "ownerManualReviewRequired": true,
  "readyForProductionLaunch": false,
  "softLaunchStatus": "NO",
  "blockersRemainOpen": true,
  "goal": "Create design and content guardrails to prevent future wall-of-text result screens on mobile Telegram WebView.",
  "sections": [
    {
      "title": "density rules",
      "rows": [
        {
          "area": "no 30 huge cards in preview",
          "status": "ACTIVE_DOCUMENTED",
          "detail": "Preview states should not render 30 full-height cards with repeated long copy.",
          "ownerAction": "Use compact rows or collapsed sections for long ranges."
        },
        {
          "area": "no repeated disclaimer on every card",
          "status": "ACTIVE_DOCUMENTED",
          "detail": "Shared disclaimers belong near the result, not inside every day card.",
          "ownerAction": "Keep repeated disclaimers singular."
        },
        {
          "area": "day card max copy length",
          "status": "ACTIVE_DOCUMENTED",
          "detail": "Expanded preview day cards should use day/date, mood, one short sentence, and one short action.",
          "ownerAction": "Review copy length before owner QA."
        },
        {
          "area": "first 3-5 days expanded max",
          "status": "ACTIVE_DOCUMENTED",
          "detail": "Only the first 3-5 days may appear as expanded preview cards.",
          "ownerAction": "Use compact rows for the rest."
        },
        {
          "area": "rest compact/collapsed",
          "status": "ACTIVE_DOCUMENTED",
          "detail": "Remaining long sequences should be compact rows or collapsed groups.",
          "ownerAction": "Keep scrolling light on 390px viewports."
        }
      ]
    },
    {
      "title": "mobile layout rules",
      "rows": [
        {
          "area": "save/share buttons remain visible",
          "status": "ACTIVE_DOCUMENTED",
          "detail": "Primary save/share controls should stay reachable after result generation.",
          "ownerAction": "Check real device scroll paths."
        },
        {
          "area": "no horizontal overflow",
          "status": "ACTIVE_DOCUMENTED",
          "detail": "Cards, buttons, and inputs must not create horizontal scrolling.",
          "ownerAction": "Recheck long labels in Telegram WebView."
        },
        {
          "area": "no letter-by-letter wrapping",
          "status": "ACTIVE_DOCUMENTED",
          "detail": "Long labels must not wrap one letter per line.",
          "ownerAction": "Use compact text and responsive constraints."
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
  "nextPackageRecommendation": "Package 307 - Public Mini App Route Visual Regression Checklist"
} as const;

export function getAphroditeMobileResultDensityGuardrails() {
  return aphroditemobileResultDensityGuardrails;
}
