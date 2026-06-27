/**
 * Package 226: Public API Exposure Hardening.
 *
 * Static readiness model only. This file does not read secrets, connect to
 * production DB, call Telegram API, send messages, add external analytics,
 * enable payments, unlock VIP, or change workflows/cron/publish scripts.
 */

export type AphroditePublicApiExposureStatus = "HARDENED" | "REDACTED" | "NO TRUST" | "MANUAL REQUIRED" | "BLOCKED";

export type AphroditePublicApiExposureItem = {
  area: string;
  route: string;
  exposureBefore: string;
  hardening: string;
  status: AphroditePublicApiExposureStatus;
  remainingManualWork: string;
};

export type AphroditePublicApiExposureHardeningModel = {
  packageNumber: 226;
  title: string;
  route: "/dashboard/networks/zodiac/public-api-exposure-hardening";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  items: readonly AphroditePublicApiExposureItem[];
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

export const APHRODITE_PUBLIC_API_EXPOSURE_HARDENING_TITLE = "Public API Exposure Hardening";

export const APHRODITE_PUBLIC_API_EXPOSURE_HARDENING_ROUTE =
  "/dashboard/networks/zodiac/public-api-exposure-hardening" as const;

const items: readonly AphroditePublicApiExposureItem[] = [
  {
    area: "unified-status exposure status",
    route: "/api/system/unified-status",
    exposureBefore:
      "Public response could expose operational internals such as bot username, target/admin/post counts, scheduler timings and raw lastError text.",
    hardening:
      "Public response is redacted: bot username, raw lastError, scheduler internals, exact target/admin/post counts and exact content counts are removed or nulled.",
    status: "REDACTED",
    remainingManualWork: "Owner still verifies whether this route should become dashboard-auth gated in a later security package.",
  },
  {
    area: "analytics event exposure status",
    route: "/api/zodiac/analytics/event",
    exposureBefore:
      "Public POST accepted allow-listed analytics events with size and schema checks, but no explicit no-trust/rate guard.",
    hardening:
      "Route keeps body size cap and allow-list validation, then adds JSON-only, same-origin when Origin exists, safe loopback localhost/127.0.0.1 handling for local smoke, payload shape guard, spam-token rejection, and in-memory IP-light rate limiting.",
    status: "NO TRUST",
    remainingManualWork: "Owner must treat this analytics as preview/no-trust data until a future authenticated telemetry design exists.",
  },
  {
    area: "runtime side effects",
    route: "project safety boundary",
    exposureBefore: "Audit requested hardening without external infrastructure.",
    hardening:
      "No production DB writes, no external analytics activation, no Telegram API calls, no messages, no payments and no VIP unlock were added.",
    status: "HARDENED",
    remainingManualWork: "Manual owner review remains required before any launch decision.",
  },
] as const;

const safetyNotes = [
  "No production launch was performed.",
  "No secrets were added.",
  "No production DB connection was made.",
  "No DB write was added.",
  "No external analytics was activated.",
  "No Telegram API call was made.",
  "No Telegram messages were sent.",
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

export function getAphroditePublicApiExposureHardening(): AphroditePublicApiExposureHardeningModel {
  return {
    packageNumber: 226,
    title: APHRODITE_PUBLIC_API_EXPOSURE_HARDENING_TITLE,
    route: APHRODITE_PUBLIC_API_EXPOSURE_HARDENING_ROUTE,
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
