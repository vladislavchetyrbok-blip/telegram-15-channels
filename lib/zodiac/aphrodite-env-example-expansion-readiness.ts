/**
 * Package 227: Env Example Expansion Readiness.
 *
 * Static readiness model only. No secrets are read or stored here.
 */

export type AphroditeEnvExampleStatus = "DOCUMENTED" | "MANUAL REQUIRED" | "BLOCKED";

export type AphroditeEnvExampleGroup = {
  group: string;
  requiredNames: readonly string[];
  status: AphroditeEnvExampleStatus;
  note: string;
  ownerAction: string;
};

export type AphroditeEnvExampleExpansionReadinessModel = {
  packageNumber: 227;
  title: string;
  route: "/dashboard/networks/zodiac/env-example-expansion-readiness";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  groups: readonly AphroditeEnvExampleGroup[];
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

export const APHRODITE_ENV_EXAMPLE_EXPANSION_READINESS_TITLE = "Env Example Expansion Readiness";
export const APHRODITE_ENV_EXAMPLE_EXPANSION_READINESS_ROUTE =
  "/dashboard/networks/zodiac/env-example-expansion-readiness" as const;

const groups: readonly AphroditeEnvExampleGroup[] = [
  {
    group: "App/Public URLs",
    requiredNames: ["APP_URL", "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_GITHUB_ACTIONS_URL"],
    status: "DOCUMENTED",
    note: "Public URL placeholders are documented without real production domains.",
    ownerAction: "Configure real public URLs manually in deployment settings only.",
  },
  {
    group: "Dashboard/Admin auth",
    requiredNames: ["APHRODITE_ADMIN_LOGIN", "APHRODITE_ADMIN_PASSWORD", "APHRODITE_SESSION_SECRET"],
    status: "MANUAL REQUIRED",
    note: "APHRODITE_SESSION_SECRET is required for dashboard auth and must never be committed.",
    ownerAction: "Set dashboard credentials and a long random session secret in the secret store.",
  },
  {
    group: "Telegram Bot / Mini App",
    requiredNames: ["TELEGRAM_BOT_TOKEN", "TELEGRAM_DRY_RUN", "TELEGRAM_REAL_PUBLISH_ENABLED", "ZODIAC_GENERAL_CHANNEL_ID"],
    status: "BLOCKED",
    note: "TELEGRAM_BOT_TOKEN is required for production Telegram operations and is documented only as a placeholder.",
    ownerAction: "Configure TELEGRAM_BOT_TOKEN manually before any production Telegram operation.",
  },
  {
    group: "Database / Supabase",
    requiredNames: ["DATABASE_URL", "PGSSLMODE", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    status: "BLOCKED",
    note: "DATABASE_URL is required for production DB-backed storage and must stay out of code.",
    ownerAction: "Configure DATABASE_URL and Supabase values manually only when DB-backed mode is approved.",
  },
  {
    group: "Publishing / dry-run / live safety flags",
    requiredNames: ["PUBLISH_DUE_STORE", "PUBLISH_DUE_DRY_RUN", "AUTOPUBLISH_ENABLED", "ZODIAC_LEDGER_GIT_PERSIST"],
    status: "DOCUMENTED",
    note: "Safe defaults keep dry-run and autopublish disabled in the example.",
    ownerAction: "Change live flags only in a separate approved launch step.",
  },
  {
    group: "Analytics",
    requiredNames: ["ZODIAC_ANALYTICS_REDIS_URL", "ZODIAC_ANALYTICS_REDIS_TOKEN"],
    status: "DOCUMENTED",
    note: "Analytics remains no-trust/optional unless storage env is manually configured.",
    ownerAction: "Keep analytics placeholders empty unless an owner-approved telemetry store exists.",
  },
  {
    group: "Backup / restore",
    requiredNames: ["BACKUP_LOCATION", "BACKUP_FRESHNESS_MAX_HOURS", "BACKUP_RESTORE_REHEARSAL_REQUIRED"],
    status: "MANUAL REQUIRED",
    note: "Backup freshness stays a manual blocker and is not faked by env documentation.",
    ownerAction: "Verify backup freshness and restore rehearsal manually before launch.",
  },
  {
    group: "Launch gates / owner approval",
    requiredNames: ["PUBLIC_LAUNCH_APPROVED", "OWNER_MANUAL_REVIEW_REQUIRED", "SOFT_LAUNCH_APPROVED"],
    status: "BLOCKED",
    note: "Example keeps launch approval false and owner review true.",
    ownerAction: "Do not approve launch via env until owner explicitly signs off.",
  },
  {
    group: "Development / QA",
    requiredNames: ["NODE_ENV", "APP_ENV", "ZODIAC_MINIAPP_SMOKE_URL", "CHROME_PATH"],
    status: "DOCUMENTED",
    note: "QA-only variables are placeholders and do not enable production behavior.",
    ownerAction: "Use local-only values for QA tooling as needed.",
  },
  {
    group: "legacy env names",
    requiredNames: ["ZODIAC_DASHBOARD_SESSION_SECRET", "ZODIAC_DASHBOARD_AUTH_ENABLED"],
    status: "DOCUMENTED",
    note: "ZODIAC_DASHBOARD_SESSION_SECRET is legacy/non-authoritative after Package 225.",
    ownerAction: "Use APHRODITE_SESSION_SECRET for canonical dashboard auth.",
  },
] as const;

const safetyNotes = [
  "No real secrets were added.",
  "No production env values are stored here.",
  "No production DB connection was made.",
  "No Telegram API call was made.",
  "Production launch remains blocked without manual owner approval.",
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

export function getAphroditeEnvExampleExpansionReadiness(): AphroditeEnvExampleExpansionReadinessModel {
  return {
    packageNumber: 227,
    title: APHRODITE_ENV_EXAMPLE_EXPANSION_READINESS_TITLE,
    route: APHRODITE_ENV_EXAMPLE_EXPANSION_READINESS_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    groups: groups.map((group) => ({ ...group, requiredNames: [...group.requiredNames] })),
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
