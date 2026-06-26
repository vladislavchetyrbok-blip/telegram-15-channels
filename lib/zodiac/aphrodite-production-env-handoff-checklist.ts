/**
 * Package 221: Production Env Handoff Checklist.
 *
 * Static handoff/checklist only. This model stores env names and owner actions,
 * never real values. It does not read secrets, print secrets, connect to a
 * production database, use Telegram API, send messages, change BotFather,
 * alter active CTA logic, change publish scripts/workflows, write data, enable
 * payments, or unlock VIP.
 */

export type AphroditeProductionEnvReadiness =
  | "CONFIGURED"
  | "MISSING"
  | "MANUAL REQUIRED"
  | "NOT CHECKED";

export type AphroditeProductionEnvChecklistItem = {
  id: string;
  name: string;
  requiredForLaunch: boolean;
  currentReadiness: AphroditeProductionEnvReadiness;
  configureWhere: string;
  verificationStep: string;
  safetyRule: string;
  neverCommitValue: true;
};

export type AphroditeProductionEnvHandoffChecklistModel = {
  packageNumber: 221;
  title: string;
  route: "/dashboard/networks/zodiac/production-env-handoff-checklist";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  requiredMessages: readonly string[];
  readinessStates: readonly AphroditeProductionEnvReadiness[];
  envItems: readonly AphroditeProductionEnvChecklistItem[];
  secretHygieneRules: readonly string[];
  remainingEnvBlockers: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    secretsAdded: false;
    realEnvValuesStored: false;
    realSecretsRead: false;
    secretsPrintedInLogs: false;
    productionDbConnectionMade: false;
    productionDbWriteAdded: false;
    telegramApiCallMade: false;
    messagesSent: false;
    botFatherChanged: false;
    activeCtaLogicChanged: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    workflowChanged: false;
    publishScriptsChanged: false;
  };
};

export const APHRODITE_PRODUCTION_ENV_HANDOFF_CHECKLIST_TITLE =
  "Production Env Handoff Checklist";

export const APHRODITE_PRODUCTION_ENV_HANDOFF_CHECKLIST_ROUTE =
  "/dashboard/networks/zodiac/production-env-handoff-checklist" as const;

export const APHRODITE_PRODUCTION_ENV_READINESS_STATES = [
  "CONFIGURED",
  "MISSING",
  "MANUAL REQUIRED",
  "NOT CHECKED",
] as const;

export const APHRODITE_PRODUCTION_ENV_REQUIRED_MESSAGES = [
  "No secrets were added.",
  "No real env values are stored here.",
  "No production DB connection was made.",
  "No Telegram API call was made.",
] as const;

const envItems: readonly AphroditeProductionEnvChecklistItem[] = [
  {
    id: "database-url",
    name: "DATABASE_URL",
    requiredForLaunch: true,
    currentReadiness: "MISSING",
    configureWhere: "Production hosting provider environment variables.",
    verificationStep: "Owner verifies that the production safety check no longer reports DATABASE_URL as missing.",
    safetyRule: "Store only in the production env manager; never commit or paste the value into reports.",
    neverCommitValue: true,
  },
  {
    id: "telegram-bot-token",
    name: "TELEGRAM_BOT_TOKEN",
    requiredForLaunch: true,
    currentReadiness: "MISSING",
    configureWhere: "Production hosting provider secret/env storage.",
    verificationStep: "Owner verifies the bot token manually and confirms the production safety check no longer reports it as missing.",
    safetyRule: "Use masked display only; rotate the token immediately if it is leaked.",
    neverCommitValue: true,
  },
  {
    id: "telegram-mini-app-url",
    name: "COMPATIBILITY_MINI_APP_URL / Telegram Mini App URL",
    requiredForLaunch: true,
    currentReadiness: "MANUAL REQUIRED",
    configureWhere: "Telegram Mini App and production hosting settings.",
    verificationStep: "Owner opens the Mini App from Telegram and confirms the public URL/version marker matches the live deployment.",
    safetyRule: "Verify BotFather manually but do not change BotFather automatically from this project.",
    neverCommitValue: true,
  },
  {
    id: "public-app-base-url",
    name: "NEXT_PUBLIC_APP_URL / APP_URL",
    requiredForLaunch: true,
    currentReadiness: "MANUAL REQUIRED",
    configureWhere: "Production hosting environment variables and public app configuration.",
    verificationStep: "Owner confirms public routes open from the production domain and match the launch-ready deployment.",
    safetyRule: "Public URLs may be visible, but production env values still must not be committed as secrets.",
    neverCommitValue: true,
  },
  {
    id: "backup-location-freshness-marker",
    name: "Backup location/freshness marker",
    requiredForLaunch: true,
    currentReadiness: "MANUAL REQUIRED",
    configureWhere: "Database provider backup console and owner evidence pack.",
    verificationStep: "Owner records backup location, timestamp, and freshness confirmation before launch.",
    safetyRule: "Do not store backup credentials or private storage links in source code.",
    neverCommitValue: true,
  },
  {
    id: "launch-mode-freeze-flag",
    name: "Launch mode/freeze flag",
    requiredForLaunch: true,
    currentReadiness: "CONFIGURED",
    configureWhere: "Static launch readiness model and owner go/no-go dashboard.",
    verificationStep: "Confirm publicLaunchApproved=false until owner approval is granted.",
    safetyRule: "Do not set launch approval true from an env handoff checklist.",
    neverCommitValue: true,
  },
  {
    id: "owner-approval-flag-status",
    name: "Owner approval flag/status",
    requiredForLaunch: true,
    currentReadiness: "MANUAL REQUIRED",
    configureWhere: "Owner manual review and public launch go/no-go review.",
    verificationStep: "Owner explicitly confirms final approval after env, backup, WebView, and real-device blockers are cleared.",
    safetyRule: "Do not set ownerManualReviewRequired=false automatically.",
    neverCommitValue: true,
  },
];

const secretHygieneRules = [
  "never commit .env production secrets.",
  "never paste secrets into chat reports.",
  "never print secrets in logs.",
  "use masked display only.",
  "rotate token if leaked.",
  "verify BotFather manually but do not change automatically.",
] as const;

const remainingEnvBlockers = [
  "DATABASE_URL missing in production env",
  "TELEGRAM_BOT_TOKEN missing in production env",
  "Telegram Mini App URL/public URL marker manual verification",
  "public app base URL manual verification",
  "backup freshness marker manual verification",
  "owner approval",
] as const;

export function getAphroditeProductionEnvHandoffChecklist(): AphroditeProductionEnvHandoffChecklistModel {
  return {
    packageNumber: 221,
    title: APHRODITE_PRODUCTION_ENV_HANDOFF_CHECKLIST_TITLE,
    route: APHRODITE_PRODUCTION_ENV_HANDOFF_CHECKLIST_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    requiredMessages: [...APHRODITE_PRODUCTION_ENV_REQUIRED_MESSAGES],
    readinessStates: [...APHRODITE_PRODUCTION_ENV_READINESS_STATES],
    envItems: envItems.map((item) => ({ ...item })),
    secretHygieneRules: [...secretHygieneRules],
    remainingEnvBlockers: [...remainingEnvBlockers],
    safetyFlags: {
      productionLaunchDone: false,
      secretsAdded: false,
      realEnvValuesStored: false,
      realSecretsRead: false,
      secretsPrintedInLogs: false,
      productionDbConnectionMade: false,
      productionDbWriteAdded: false,
      telegramApiCallMade: false,
      messagesSent: false,
      botFatherChanged: false,
      activeCtaLogicChanged: false,
      paymentAdded: false,
      vipUnlockAdded: false,
      workflowChanged: false,
      publishScriptsChanged: false,
    },
  };
}
