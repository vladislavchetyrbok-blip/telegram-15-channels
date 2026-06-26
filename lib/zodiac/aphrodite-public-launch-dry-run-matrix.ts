/**
 * Package 218: Public Launch Dry-Run Matrix.
 *
 * Static readiness simulation only. This model does not launch production,
 * call Telegram API, send messages, change BotFather or active CTA, write to
 * DB, enable payments, unlock VIP, or change workflows/cron/publish scripts.
 */

export type AphroditePublicLaunchDryRunStatus = "PASS" | "BLOCKED" | "MANUAL" | "NOT RUN" | "OWNER REQUIRED";

export type AphroditePublicLaunchDryRunStep = {
  id: string;
  stepName: string;
  status: AphroditePublicLaunchDryRunStatus;
  whatWouldHappen: string;
  whyBlockedNow: string;
  requiredOwnerAction: string;
  safetyNote: string;
};

export type AphroditePublicLaunchDryRunMatrixModel = {
  packageNumber: 218;
  title: string;
  route: "/dashboard/networks/zodiac/public-launch-dry-run-matrix";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  dryRunOnlyMessages: readonly string[];
  statuses: readonly AphroditePublicLaunchDryRunStatus[];
  steps: readonly AphroditePublicLaunchDryRunStep[];
  remainingBlockers: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    botFatherChanged: false;
    activeCtaChanged: false;
    databaseWriteAdded: false;
    externalAnalyticsAdded: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    workflowChanged: false;
  };
};

export const APHRODITE_PUBLIC_LAUNCH_DRY_RUN_MATRIX_TITLE = "Public Launch Dry-Run Matrix";

export const APHRODITE_PUBLIC_LAUNCH_DRY_RUN_MATRIX_ROUTE =
  "/dashboard/networks/zodiac/public-launch-dry-run-matrix" as const;

export const APHRODITE_PUBLIC_LAUNCH_DRY_RUN_STATUSES = [
  "PASS",
  "BLOCKED",
  "MANUAL",
  "NOT RUN",
  "OWNER REQUIRED",
] as const;

export const APHRODITE_PUBLIC_LAUNCH_DRY_RUN_MESSAGES = [
  "Dry-run only. No production launch was performed.",
  "No Telegram messages were sent.",
  "No Telegram API calls were made.",
  "Owner approval is still required.",
] as const;

const steps: readonly AphroditePublicLaunchDryRunStep[] = [
  {
    id: "production-env-readiness",
    stepName: "Production env readiness",
    status: "BLOCKED",
    whatWouldHappen: "Production runtime would verify required launch environment before any live action.",
    whyBlockedNow: "Required production env is not confirmed in this dry-run.",
    requiredOwnerAction: "Configure and verify production env manually, then rerun the production safety check.",
    safetyNote: "Dry-run only; no production launch was performed and no secrets were added.",
  },
  {
    id: "database-url-readiness",
    stepName: "DATABASE_URL readiness",
    status: "BLOCKED",
    whatWouldHappen: "Production launch would require a valid DATABASE_URL before runtime readiness can be approved.",
    whyBlockedNow: "DATABASE_URL is still a manual production env blocker.",
    requiredOwnerAction: "Owner configures DATABASE_URL outside the repo and verifies the safety report.",
    safetyNote: "No production DB connection was attempted and no DB write was added.",
  },
  {
    id: "telegram-bot-token-readiness",
    stepName: "TELEGRAM_BOT_TOKEN readiness",
    status: "BLOCKED",
    whatWouldHappen: "Production launch would require TELEGRAM_BOT_TOKEN before Telegram delivery could be considered.",
    whyBlockedNow: "TELEGRAM_BOT_TOKEN is still a manual production env blocker.",
    requiredOwnerAction: "Owner configures TELEGRAM_BOT_TOKEN outside the repo and verifies production readiness.",
    safetyNote: "No Telegram API calls were made and no Telegram messages were sent.",
  },
  {
    id: "backup-freshness-readiness",
    stepName: "Backup freshness readiness",
    status: "BLOCKED",
    whatWouldHappen: "Production launch would require backup freshness to be verified before approval.",
    whyBlockedNow: "Backup older than 24h remains a manual backup freshness blocker.",
    requiredOwnerAction: "Owner verifies a fresh backup and reruns the production safety check.",
    safetyNote: "No backup evidence was fabricated and no production DB connection was attempted.",
  },
  {
    id: "real-device-visual-qa",
    stepName: "Real-device visual QA",
    status: "MANUAL",
    whatWouldHappen: "Owner would confirm screenshots and usability on real iPhone, Android, Telegram Desktop and browsers.",
    whyBlockedNow: "Real-device evidence still requires manual owner review.",
    requiredOwnerAction: "Complete the real-device checklist and mark blockers resolved or still blocked.",
    safetyNote: "Readiness evidence only; no Telegram delivery or production launch is triggered.",
  },
  {
    id: "telegram-webview-startapp-qa",
    stepName: "Telegram WebView/startapp QA",
    status: "MANUAL",
    whatWouldHappen: "Owner would confirm Mini App WebView, startapp/deep link routing and cache behavior on real devices.",
    whyBlockedNow: "Telegram WebView behavior cannot be proven by static dry-run alone.",
    requiredOwnerAction: "Open the real Mini App in Telegram and verify route/startapp/cache behavior manually.",
    safetyNote: "No Telegram API calls were made and BotFather was not changed.",
  },
  {
    id: "live-version-cache-marker",
    stepName: "Live version/cache marker",
    status: "MANUAL",
    whatWouldHappen: "Owner would compare deployed version/cache marker against the expected launch build.",
    whyBlockedNow: "Live deployment freshness still needs a manual owner check.",
    requiredOwnerAction: "Check live marker in browser and Telegram WebView after deployment refresh.",
    safetyNote: "No deploy settings, cron, workflow or publish script was changed.",
  },
  {
    id: "content-cta-inventory",
    stepName: "Content/CTA inventory",
    status: "MANUAL",
    whatWouldHappen: "Owner would confirm public copy, routes, startapp labels and visible CTAs are launch-appropriate.",
    whyBlockedNow: "Owner has not granted final approval for public-facing content and CTA inventory.",
    requiredOwnerAction: "Review public routes and confirm no blocker remains in copy, CTA or route inventory.",
    safetyNote: "Active CTA logic was not changed and no external analytics was added.",
  },
  {
    id: "public-launch-freeze",
    stepName: "Public launch freeze",
    status: "PASS",
    whatWouldHappen: "Launch remains frozen until owner explicitly grants Go/No-Go approval.",
    whyBlockedNow: "Not blocked as a safety control; the freeze is active by design.",
    requiredOwnerAction: "Keep freeze active until all blockers clear and owner approval is granted.",
    safetyNote: "publicLaunchApproved=false and ownerManualReviewRequired=true remain enforced.",
  },
  {
    id: "owner-manual-approval",
    stepName: "Owner manual approval",
    status: "OWNER REQUIRED",
    whatWouldHappen: "Owner would make the final public launch Go/No-Go decision.",
    whyBlockedNow: "Approval has not been granted.",
    requiredOwnerAction: "Owner reviews the readiness pack and explicitly grants or denies launch approval.",
    safetyNote: "No automatic approval was created and production launch was not performed.",
  },
  {
    id: "rollback-readiness",
    stepName: "Rollback readiness",
    status: "NOT RUN",
    whatWouldHappen: "Owner would confirm rollback plan, deployed version awareness and support response path.",
    whyBlockedNow: "Rollback evidence is not executed by this dry-run and remains a manual readiness check.",
    requiredOwnerAction: "Confirm rollback plan manually before any future public launch.",
    safetyNote: "No deployment rollback, cron change or publish workflow change was executed.",
  },
];

const remainingBlockers = [
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "backup freshness",
  "manual real-device QA",
  "Telegram WebView/startapp QA",
  "owner approval",
] as const;

export function getAphroditePublicLaunchDryRunMatrix(): AphroditePublicLaunchDryRunMatrixModel {
  return {
    packageNumber: 218,
    title: APHRODITE_PUBLIC_LAUNCH_DRY_RUN_MATRIX_TITLE,
    route: APHRODITE_PUBLIC_LAUNCH_DRY_RUN_MATRIX_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    dryRunOnlyMessages: [...APHRODITE_PUBLIC_LAUNCH_DRY_RUN_MESSAGES],
    statuses: [...APHRODITE_PUBLIC_LAUNCH_DRY_RUN_STATUSES],
    steps: steps.map((step) => ({ ...step })),
    remainingBlockers: [...remainingBlockers],
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      botFatherChanged: false,
      activeCtaChanged: false,
      databaseWriteAdded: false,
      externalAnalyticsAdded: false,
      paymentAdded: false,
      vipUnlockAdded: false,
      workflowChanged: false,
    },
  };
}
