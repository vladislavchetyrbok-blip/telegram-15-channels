/**
 * Package 249: Soft Launch Preflight Checklist.
 *
 * Static owner-facing preflight only. It lists required checks before a future
 * limited soft launch and keeps all launch, Telegram, database, payment, VIP,
 * workflow, secret, and approval actions blocked.
 */

export type AphroditeSoftLaunchPreflightStatus =
  | "PASS EXPECTED"
  | "MANUAL REQUIRED"
  | "OWNER REVIEW REQUIRED"
  | "BLOCKED"
  | "NOT APPROVED";

export type AphroditeSoftLaunchPreflightItem = {
  area: string;
  status: AphroditeSoftLaunchPreflightStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditeSoftLaunchPreflightChecklistModel = {
  packageNumber: 249;
  title: string;
  route: "/dashboard/networks/zodiac/soft-launch-preflight-checklist";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  codeChecks: readonly AphroditeSoftLaunchPreflightItem[];
  productionEnv: readonly AphroditeSoftLaunchPreflightItem[];
  backupRestore: readonly AphroditeSoftLaunchPreflightItem[];
  realDeviceQa: readonly AphroditeSoftLaunchPreflightItem[];
  telegramWebviewStartappQa: readonly AphroditeSoftLaunchPreflightItem[];
  contentCtaOwnerReview: readonly AphroditeSoftLaunchPreflightItem[];
  safetyChecks: readonly AphroditeSoftLaunchPreflightItem[];
  stopConditions: readonly AphroditeSoftLaunchPreflightItem[];
  relevantPackageQaScripts: readonly string[];
  nextPackageRecommendation: "Package 250 - Owner Manual Review Pack";
  safetyNotes: readonly string[];
  remainingBlockers: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    botFatherChanged: false;
    activeCtaLogicChanged: false;
    channelMappingsChanged: false;
    databaseWriteAdded: false;
    externalAnalyticsAdded: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    entitlementBypassAdded: false;
    cronWorkflowPublishChanged: false;
    secretsAdded: false;
    productionDbConnected: false;
    manualChecksMarkedComplete: false;
    publicLaunchApproved: false;
    ownerManualReviewRequired: true;
  };
};

export const APHRODITE_SOFT_LAUNCH_PREFLIGHT_CHECKLIST_TITLE =
  "Soft Launch Preflight Checklist";

export const APHRODITE_SOFT_LAUNCH_PREFLIGHT_CHECKLIST_ROUTE =
  "/dashboard/networks/zodiac/soft-launch-preflight-checklist" as const;

const codeChecks: readonly AphroditeSoftLaunchPreflightItem[] = [
  {
    area: "typecheck",
    status: "PASS EXPECTED",
    detail: "TypeScript must pass before any future limited soft launch.",
    ownerAction: "Run npm run typecheck and record PASS.",
  },
  {
    area: "lint",
    status: "PASS EXPECTED",
    detail: "Lint must pass with no warnings or errors.",
    ownerAction: "Run npm run lint and record PASS.",
  },
  {
    area: "build",
    status: "PASS EXPECTED",
    detail: "Production build must pass and include all readiness pages.",
    ownerAction: "Run npm run build and record PASS.",
  },
  {
    area: "zodiac:miniapp:smoke",
    status: "PASS EXPECTED",
    detail: "Mini App smoke must pass without runtime, console, or network errors.",
    ownerAction: "Run npm run zodiac:miniapp:smoke and record PASS.",
  },
  {
    area: "zodiac:dashboard:qa",
    status: "PASS EXPECTED",
    detail: "Dashboard QA must pass and verify protected readiness routes.",
    ownerAction: "Run npm run zodiac:dashboard:qa and record PASS.",
  },
  {
    area: "relevant package QA scripts",
    status: "PASS EXPECTED",
    detail: "Soft launch scope, owner gate, visual, API, auth, content and real-device readiness QA scripts must pass.",
    ownerAction: "Run relevant Package 248-249 and key existing QA scripts.",
  },
];

const productionEnv: readonly AphroditeSoftLaunchPreflightItem[] = [
  {
    area: "DATABASE_URL manual blocker",
    status: "MANUAL REQUIRED",
    detail: "Production DATABASE_URL must be configured manually before any production operation.",
    ownerAction: "Configure outside code and never commit the value.",
  },
  {
    area: "TELEGRAM_BOT_TOKEN manual blocker",
    status: "MANUAL REQUIRED",
    detail: "Production TELEGRAM_BOT_TOKEN must be configured manually before any Telegram operation.",
    ownerAction: "Configure outside code, keep masked, rotate if leaked.",
  },
  {
    area: "APHRODITE_SESSION_SECRET manual blocker",
    status: "MANUAL REQUIRED",
    detail: "Dashboard session secret must be manually configured in the production secret store.",
    ownerAction: "Use a strong secret and never paste it into reports.",
  },
  {
    area: "public app URL manual verification",
    status: "OWNER REVIEW REQUIRED",
    detail: "Public app base URL must resolve to the expected deployment.",
    ownerAction: "Verify URL manually in browser and Telegram context.",
  },
  {
    area: "Telegram Mini App URL manual verification",
    status: "OWNER REVIEW REQUIRED",
    detail: "Telegram Mini App URL must match the intended live deployment.",
    ownerAction: "Verify in BotFather/Telegram manually; do not change BotFather here.",
  },
  {
    area: "no secrets committed",
    status: "BLOCKED",
    detail: "No real env values or secrets may be committed.",
    ownerAction: "Keep placeholders only in code/docs.",
  },
];

const backupRestore: readonly AphroditeSoftLaunchPreflightItem[] = [
  {
    area: "backup <24h",
    status: "MANUAL REQUIRED",
    detail: "Backup must be fresher than 24 hours before any future launch.",
    ownerAction: "Record timestamp, location, reviewer, and evidence.",
  },
  {
    area: "restore rehearsal",
    status: "MANUAL REQUIRED",
    detail: "Restore rehearsal must be completed in a safe non-production target.",
    ownerAction: "Record result, duration, and validation outcome.",
  },
  {
    area: "rollback point",
    status: "OWNER REVIEW REQUIRED",
    detail: "Rollback point must identify last known good deployment and commit.",
    ownerAction: "Record deployment URL and commit hash before launch.",
  },
  {
    area: "last verified commit",
    status: "OWNER REVIEW REQUIRED",
    detail: "Last verified commit must be captured after all checks pass.",
    ownerAction: "Record commit from final preflight.",
  },
];

const realDeviceQa: readonly AphroditeSoftLaunchPreflightItem[] = [
  {
    area: "iPhone Safari",
    status: "MANUAL REQUIRED",
    detail: "Mobile Safari must be checked manually.",
    ownerAction: "Record screenshot, device, OS version, and status.",
  },
  {
    area: "Android Chrome",
    status: "MANUAL REQUIRED",
    detail: "Android Chrome must be checked manually if available.",
    ownerAction: "Record screenshot, device, OS version, and status.",
  },
  {
    area: "Telegram iOS WebView",
    status: "MANUAL REQUIRED",
    detail: "Telegram iOS WebView must be checked manually on a real device.",
    ownerAction: "Record Telegram version, startapp behavior, cache marker, and screenshot.",
  },
  {
    area: "Telegram Android WebView",
    status: "MANUAL REQUIRED",
    detail: "Telegram Android WebView must be checked manually if available.",
    ownerAction: "Record Telegram version, startapp behavior, cache marker, and screenshot.",
  },
  {
    area: "Desktop sanity",
    status: "OWNER REVIEW REQUIRED",
    detail: "Desktop browser sanity check must confirm no obvious layout/runtime breakage.",
    ownerAction: "Record browser and screenshot.",
  },
];

const telegramWebviewStartappQa: readonly AphroditeSoftLaunchPreflightItem[] = [
  {
    area: "startapp present",
    status: "MANUAL REQUIRED",
    detail: "Telegram startapp parameter must route to the expected Mini App flow.",
    ownerAction: "Check in Telegram WebView manually.",
  },
  {
    area: "startapp missing fallback",
    status: "MANUAL REQUIRED",
    detail: "Missing startapp must fall back to a safe main screen and not fail.",
    ownerAction: "Check browser and Telegram fallback behavior.",
  },
  {
    area: "deep link opens",
    status: "MANUAL REQUIRED",
    detail: "Deep links must open the intended flow.",
    ownerAction: "Record exact link, route, and result.",
  },
  {
    area: "browser fallback",
    status: "OWNER REVIEW REQUIRED",
    detail: "Browser mode without Telegram WebView params is not a code failure if fallback works.",
    ownerAction: "Record expected browser fallback behavior.",
  },
  {
    area: "Telegram ready/expand/back/haptics",
    status: "MANUAL REQUIRED",
    detail: "Telegram ready, expand, BackButton, and haptics must be observed manually.",
    ownerAction: "Capture real-device notes and screenshots.",
  },
  {
    area: "cache/live marker",
    status: "MANUAL REQUIRED",
    detail: "Live version/cache marker must confirm the fresh deployment.",
    ownerAction: "Record marker and deployment commit.",
  },
];

const contentCtaOwnerReview: readonly AphroditeSoftLaunchPreflightItem[] = [
  {
    area: "home CTA",
    status: "OWNER REVIEW REQUIRED",
    detail: "Home CTA copy and destination require owner review.",
    ownerAction: "Confirm expected route and wording.",
  },
  {
    area: "compatibility CTA",
    status: "OWNER REVIEW REQUIRED",
    detail: "Compatibility CTA requires owner review, including known internal route reorganization.",
    ownerAction: "Confirm /compatibility?startapp=... behavior is acceptable.",
  },
  {
    area: "Birth Matrix CTA",
    status: "OWNER REVIEW REQUIRED",
    detail: "Birth Matrix CTA requires owner review.",
    ownerAction: "Confirm route, copy, and result expectations.",
  },
  {
    area: "Mystic Cards CTA",
    status: "OWNER REVIEW REQUIRED",
    detail: "Mystic Cards CTA requires owner review.",
    ownerAction: "Confirm Daily/Tarot/Rune entry behavior.",
  },
  {
    area: "VIP preview CTA",
    status: "OWNER REVIEW REQUIRED",
    detail: "VIP preview CTA must remain locked and preview-only.",
    ownerAction: "Confirm no active payment or entitlement promise.",
  },
  {
    area: "share/result cards",
    status: "OWNER REVIEW REQUIRED",
    detail: "Share/result cards must remain visual preview-only.",
    ownerAction: "Confirm no real Telegram share/send API was added.",
  },
  {
    area: "no active payment",
    status: "BLOCKED",
    detail: "Payment must remain inactive before a separate approved payment package.",
    ownerAction: "Stop if payment appears active.",
  },
];

const safetyChecks: readonly AphroditeSoftLaunchPreflightItem[] = [
  {
    area: "publicLaunchApproved=false",
    status: "NOT APPROVED",
    detail: "Public launch approval remains false.",
    ownerAction: "Do not change in this package.",
  },
  {
    area: "ownerManualReviewRequired=true",
    status: "OWNER REVIEW REQUIRED",
    detail: "Owner manual review remains required.",
    ownerAction: "Keep review required until future explicit approval.",
  },
  {
    area: "no production launch",
    status: "BLOCKED",
    detail: "No production launch is performed.",
    ownerAction: "Keep launch frozen.",
  },
  {
    area: "no payment",
    status: "BLOCKED",
    detail: "No payment implementation is active.",
    ownerAction: "Do not add invoices, checkout, or Stars behavior.",
  },
  {
    area: "no VIP unlock",
    status: "BLOCKED",
    detail: "No VIP unlock or entitlement bypass is active.",
    ownerAction: "Keep VIP preview locked-only.",
  },
  {
    area: "no DB writes",
    status: "BLOCKED",
    detail: "No database writes are added.",
    ownerAction: "Keep readiness static.",
  },
  {
    area: "no Telegram messages",
    status: "BLOCKED",
    detail: "No Telegram messages are sent.",
    ownerAction: "Do not call Telegram API.",
  },
  {
    area: "no cron/workflow changes",
    status: "BLOCKED",
    detail: "Cron, workflow, and publish scripts remain unchanged.",
    ownerAction: "Do not modify scheduling/publishing automation.",
  },
];

const stopConditions: readonly AphroditeSoftLaunchPreflightItem[] = [
  {
    area: "smoke fail",
    status: "BLOCKED",
    detail: "Stop if Mini App smoke fails.",
    ownerAction: "Fix and rerun checks.",
  },
  {
    area: "dashboard QA fail",
    status: "BLOCKED",
    detail: "Stop if dashboard QA fails.",
    ownerAction: "Fix readiness/dashboard issue before proceeding.",
  },
  {
    area: "stale backup",
    status: "BLOCKED",
    detail: "Stop if backup is older than 24 hours.",
    ownerAction: "Refresh and verify backup manually.",
  },
  {
    area: "broken Telegram WebView",
    status: "BLOCKED",
    detail: "Stop if Telegram WebView/startapp behavior is broken.",
    ownerAction: "Collect evidence and fix before exposure.",
  },
  {
    area: "CTA confusion",
    status: "BLOCKED",
    detail: "Stop if CTA copy or destination is confusing.",
    ownerAction: "Resolve content/CTA owner review.",
  },
  {
    area: "duplicate post risk",
    status: "BLOCKED",
    detail: "Stop if there is any duplicate post or accidental send risk.",
    ownerAction: "Do not run publish paths.",
  },
  {
    area: "missing rollback plan",
    status: "BLOCKED",
    detail: "Stop if rollback point, owner, or restore confidence is missing.",
    ownerAction: "Complete rollback plan first.",
  },
  {
    area: "owner approval missing",
    status: "BLOCKED",
    detail: "Stop if explicit owner approval is missing.",
    ownerAction: "Do not execute soft launch.",
  },
];

const relevantPackageQaScripts = [
  "node scripts/qa-aphrodite-soft-launch-preflight-checklist.mjs",
  "node scripts/qa-aphrodite-soft-launch-scope-selector.mjs",
  "node scripts/qa-aphrodite-soft-launch-owner-go-no-go-gate.mjs",
  "node scripts/qa-aphrodite-launch-simulation-status-report.mjs",
  "node scripts/qa-aphrodite-real-device-qa-execution-pack.mjs",
  "node scripts/qa-aphrodite-telegram-webview-startapp-manual-qa-protocol.mjs",
  "node scripts/qa-aphrodite-content-cta-owner-review-gate.mjs",
  "node scripts/qa-aphrodite-public-api-exposure-hardening.mjs",
  "node scripts/qa-aphrodite-dashboard-auth-system-decision.mjs",
] as const;

const safetyNotes = [
  "Soft launch started: No.",
  "Production launch done: No.",
  "Telegram API used: No.",
  "Messages sent: No.",
  "BotFather changed: No.",
  "Active CTA logic changed: No.",
  "Channel mappings changed: No.",
  "DB write added: No.",
  "External analytics added: No.",
  "Payment added: No.",
  "VIP unlock added: No.",
  "Entitlement bypass added: No.",
  "Cron/workflows/publish scripts changed: No.",
  "Secrets added: No.",
  "Production DB connected: No.",
  "Manual checks marked complete: No.",
  "publicLaunchApproved=false.",
  "ownerManualReviewRequired=true.",
] as const;

const remainingBlockers = [
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "APHRODITE_SESSION_SECRET",
  "public app URL manual verification",
  "Telegram Mini App URL manual verification",
  "backup freshness <24h",
  "restore rehearsal",
  "rollback point",
  "real-device QA manual execution",
  "Telegram WebView/startapp QA",
  "content/CTA owner review",
  "owner explicit approval",
] as const;

function cloneItems(items: readonly AphroditeSoftLaunchPreflightItem[]) {
  return items.map((item) => ({ ...item }));
}

export function getAphroditeSoftLaunchPreflightChecklist(): AphroditeSoftLaunchPreflightChecklistModel {
  return {
    packageNumber: 249,
    title: APHRODITE_SOFT_LAUNCH_PREFLIGHT_CHECKLIST_TITLE,
    route: APHRODITE_SOFT_LAUNCH_PREFLIGHT_CHECKLIST_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    codeChecks: cloneItems(codeChecks),
    productionEnv: cloneItems(productionEnv),
    backupRestore: cloneItems(backupRestore),
    realDeviceQa: cloneItems(realDeviceQa),
    telegramWebviewStartappQa: cloneItems(telegramWebviewStartappQa),
    contentCtaOwnerReview: cloneItems(contentCtaOwnerReview),
    safetyChecks: cloneItems(safetyChecks),
    stopConditions: cloneItems(stopConditions),
    relevantPackageQaScripts: [...relevantPackageQaScripts],
    nextPackageRecommendation: "Package 250 - Owner Manual Review Pack",
    safetyNotes: [...safetyNotes],
    remainingBlockers: [...remainingBlockers],
    safetyFlags: {
      productionLaunchDone: false,
      telegramApiUsed: false,
      messagesSent: false,
      botFatherChanged: false,
      activeCtaLogicChanged: false,
      channelMappingsChanged: false,
      databaseWriteAdded: false,
      externalAnalyticsAdded: false,
      paymentAdded: false,
      vipUnlockAdded: false,
      entitlementBypassAdded: false,
      cronWorkflowPublishChanged: false,
      secretsAdded: false,
      productionDbConnected: false,
      manualChecksMarkedComplete: false,
      publicLaunchApproved: false,
      ownerManualReviewRequired: true,
    },
  };
}
