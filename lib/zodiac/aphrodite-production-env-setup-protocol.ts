/**
 * Package 229: Production Env Setup Protocol.
 *
 * Static manual protocol only. This file stores no secrets and performs no env reads.
 */

export type AphroditeProductionEnvSetupStatus = "MANUAL REQUIRED" | "BLOCKED" | "DOCUMENTED";

export type AphroditeProductionEnvSetupItem = {
  area: string;
  status: AphroditeProductionEnvSetupStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeProductionEnvSetupProtocolModel = {
  packageNumber: 229;
  title: string;
  route: "/dashboard/networks/zodiac/production-env-setup-protocol";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  items: readonly AphroditeProductionEnvSetupItem[];
  safetyNotes: readonly string[];
  remainingBlockers: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    botFatherChanged: false;
    activeCtaLogicChanged: false;
    databaseWriteAdded: false;
    externalAnalyticsAdded: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    cronWorkflowPublishChanged: false;
    secretsAdded: false;
    productionDbConnected: false;
  };
};

export const APHRODITE_PRODUCTION_ENV_SETUP_PROTOCOL_TITLE = "Production Env Setup Protocol";
export const APHRODITE_PRODUCTION_ENV_SETUP_PROTOCOL_ROUTE =
  "/dashboard/networks/zodiac/production-env-setup-protocol" as const;

const items: readonly AphroditeProductionEnvSetupItem[] = [
  {
    area: "DATABASE_URL manual setup",
    status: "BLOCKED",
    detail: "DATABASE_URL must be configured manually in the production secret store before DB-backed launch checks.",
    ownerAction: "Paste the production database URL only into Vercel/GitHub secrets, never into code or reports.",
  },
  {
    area: "TELEGRAM_BOT_TOKEN manual setup",
    status: "BLOCKED",
    detail: "TELEGRAM_BOT_TOKEN is required for production Telegram operations and remains absent from code.",
    ownerAction: "Configure the token manually in the approved secret store and rotate it if leaked.",
  },
  {
    area: "APHRODITE_SESSION_SECRET",
    status: "MANUAL REQUIRED",
    detail: "Dashboard auth uses APHRODITE_SESSION_SECRET after Package 225.",
    ownerAction: "Set a long random secret manually; never paste the value into chat reports or logs.",
  },
  {
    area: "public app URL and Telegram Mini App URL",
    status: "MANUAL REQUIRED",
    detail: "APP_URL, NEXT_PUBLIC_APP_URL and Telegram Mini App URL must point to the reviewed deployment.",
    ownerAction: "Verify URL values manually in deployment settings and BotFather without automatic changes.",
  },
  {
    area: "Supabase envs if used",
    status: "DOCUMENTED",
    detail: "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are documented as optional/manual.",
    ownerAction: "Configure only if DB-backed Supabase mode is owner-approved.",
  },
  {
    area: "analytics envs if used",
    status: "DOCUMENTED",
    detail: "ZODIAC_ANALYTICS_REDIS_URL and ZODIAC_ANALYTICS_REDIS_TOKEN remain optional no-trust analytics storage envs.",
    ownerAction: "Keep analytics disabled unless a reviewed telemetry store is approved.",
  },
  {
    area: "backup location/freshness config",
    status: "BLOCKED",
    detail: "Backup freshness remains a manual launch blocker until backup age is verified below 24h.",
    ownerAction: "Verify backup location, freshness, and restore rehearsal manually before launch.",
  },
  {
    area: "dry-run/live publish flags",
    status: "MANUAL REQUIRED",
    detail: "TELEGRAM_DRY_RUN, TELEGRAM_REAL_PUBLISH_ENABLED, PUBLISH_DUE_DRY_RUN and PUBLISH_DUE_STORE must be reviewed manually.",
    ownerAction: "Do not change live publishing flags until a separate owner-approved launch step.",
  },
  {
    area: "launch gate flags",
    status: "BLOCKED",
    detail: "publicLaunchApproved=false and ownerManualReviewRequired=true remain the active readiness posture.",
    ownerAction: "Owner explicit approval is required before any future soft launch.",
  },
  {
    area: "secret masking and token rotation",
    status: "DOCUMENTED",
    detail: "Never paste secrets into chat reports, never print secrets in logs, use masked display only, rotate leaked tokens.",
    ownerAction: "Audit reports for masked values only and rotate immediately if a value leaks.",
  },
] as const;

const safetyNotes = [
  "No secrets were added.",
  "No real env values are stored here.",
  "No production DB connection was made.",
  "No Telegram API call was made.",
  "No messages were sent.",
  "No payment or VIP unlock was added.",
  "never commit .env production values.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
] as const;

const remainingBlockers = [
  "DATABASE_URL manual configuration",
  "TELEGRAM_BOT_TOKEN manual configuration",
  "backup freshness <24h",
  "restore rehearsal",
  "real-device QA manual execution",
  "Telegram WebView/startapp manual QA",
  "content/CTA owner review",
  "owner explicit approval",
] as const;

export function getAphroditeProductionEnvSetupProtocol(): AphroditeProductionEnvSetupProtocolModel {
  return {
    packageNumber: 229,
    title: APHRODITE_PRODUCTION_ENV_SETUP_PROTOCOL_TITLE,
    route: APHRODITE_PRODUCTION_ENV_SETUP_PROTOCOL_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    items: items.map((item) => ({ ...item })),
    safetyNotes: [...safetyNotes],
    remainingBlockers: [...remainingBlockers],
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      botFatherChanged: false,
      activeCtaLogicChanged: false,
      databaseWriteAdded: false,
      externalAnalyticsAdded: false,
      paymentAdded: false,
      vipUnlockAdded: false,
      cronWorkflowPublishChanged: false,
      secretsAdded: false,
      productionDbConnected: false,
    },
  };
}
