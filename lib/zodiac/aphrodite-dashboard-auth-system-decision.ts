/**
 * Package 225: Dashboard Auth System Decision.
 *
 * Static auth decision/readiness model only. This file does not read secrets,
 * connect to production DB, call Telegram API, send messages, enable payments,
 * unlock VIP, or change cron/workflow/publish behavior.
 */

export type AphroditeDashboardAuthDecisionStatus =
  | "CANONICAL"
  | "PROTECTED"
  | "LEGACY DISABLED"
  | "NO BYPASS"
  | "OWNER REVIEW REQUIRED";

export type AphroditeDashboardAuthDecisionItem = {
  label: string;
  value: string;
  status: AphroditeDashboardAuthDecisionStatus;
  note: string;
};

export type AphroditeDashboardAuthLegacySurface = {
  surface: string;
  status: AphroditeDashboardAuthDecisionStatus;
  handling: string;
  ownerNote: string;
};

export type AphroditeDashboardAuthSystemDecisionModel = {
  packageNumber: 225;
  title: string;
  route: "/dashboard/networks/zodiac/dashboard-auth-system-decision";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  decisionSummary: string;
  canonical: {
    dashboardAuth: "aphrodite_session via middleware.ts";
    sessionCookie: "aphrodite_session";
    loginPath: "/login";
    loginApi: "/api/auth/login";
    logoutApi: "/api/auth/logout";
    middlewareProtection: "middleware.ts";
    protectedRoutePattern: "/dashboard/*";
  };
  legacy: {
    dashboardAuth: "zodiac_dashboard_session";
    envSecretName: "ZODIAC_DASHBOARD_SESSION_SECRET";
    loginPath: "/dashboard/login";
    apiRoutes: "/api/dashboard/auth/*";
    status: "legacy/orphan/non-authoritative";
    handling: "API routes return 410 Disabled and do not set cookies";
  };
  authDecisionItems: readonly AphroditeDashboardAuthDecisionItem[];
  legacySurfaces: readonly AphroditeDashboardAuthLegacySurface[];
  guardrails: readonly string[];
  remainingBlockers: readonly string[];
  safetyFlags: {
    dashboardRemainsProtected: true;
    dashboardPublicBypassAdded: false;
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

export const APHRODITE_DASHBOARD_AUTH_SYSTEM_DECISION_TITLE = "Dashboard Auth System Decision";

export const APHRODITE_DASHBOARD_AUTH_SYSTEM_DECISION_ROUTE =
  "/dashboard/networks/zodiac/dashboard-auth-system-decision" as const;

const authDecisionItems: readonly AphroditeDashboardAuthDecisionItem[] = [
  {
    label: "canonical dashboard auth",
    value: "aphrodite_session via middleware.ts",
    status: "CANONICAL",
    note: "This is the effective dashboard protection path and remains the only authoritative external dashboard auth decision.",
  },
  {
    label: "canonical session/cookie",
    value: "aphrodite_session",
    status: "CANONICAL",
    note: "The middleware reads aphrodite_session and verifies it with APHRODITE_SESSION_SECRET.",
  },
  {
    label: "canonical login path",
    value: "/login",
    status: "CANONICAL",
    note: "The login page posts to /api/auth/login and creates the aphrodite_session cookie.",
  },
  {
    label: "middleware protection",
    value: "middleware.ts",
    status: "PROTECTED",
    note: "All /dashboard and /dashboard/* routes remain protected by middleware before page code runs.",
  },
  {
    label: "protected route pattern",
    value: "/dashboard/*",
    status: "PROTECTED",
    note: "The dashboard was not made public and the middleware redirect target remains /login.",
  },
  {
    label: "legacy/orphan auth path",
    value: "zodiac_dashboard_session / app/api/dashboard/auth/*",
    status: "LEGACY DISABLED",
    note: "legacy API routes now return 410 Disabled and do not set zodiac_dashboard_session cookies.",
  },
  {
    label: "public bypass",
    value: "No public dashboard bypass added",
    status: "NO BYPASS",
    note: "A zodiac_dashboard_session cookie alone must not grant access to /dashboard.",
  },
  {
    label: "owner review",
    value: "ownerManualReviewRequired=true",
    status: "OWNER REVIEW REQUIRED",
    note: "This is a decision/readiness package only; public launch is still not approved.",
  },
] as const;

const legacySurfaces: readonly AphroditeDashboardAuthLegacySurface[] = [
  {
    surface: "app/api/dashboard/auth/login",
    status: "LEGACY DISABLED",
    handling: "POST returns 410 Disabled, does not validate passcodes, and does not set cookies.",
    ownerNote: "Use /login and /api/auth/login for the canonical Aphrodite dashboard login.",
  },
  {
    surface: "app/api/dashboard/auth/logout",
    status: "LEGACY DISABLED",
    handling: "POST returns 410 Disabled and does not clear or set zodiac_dashboard_session.",
    ownerNote: "Use /api/auth/logout for canonical Aphrodite logout.",
  },
  {
    surface: "app/api/dashboard/auth/status",
    status: "LEGACY DISABLED",
    handling: "GET returns 410 Disabled with canonical auth guidance.",
    ownerNote: "Status for this legacy cookie is non-authoritative.",
  },
  {
    surface: "app/dashboard/login",
    status: "LEGACY DISABLED",
    handling: "The route remains behind /dashboard middleware and is not the canonical login path.",
    ownerNote: "Owner should use /login; this page is legacy UI and not the auth decision source.",
  },
  {
    surface: "components/DashboardLoginForm",
    status: "LEGACY DISABLED",
    handling: "legacy UI component is not authoritative because its API endpoints are disabled.",
    ownerNote: "Do not use it to prove dashboard access; dashboard access is proven by aphrodite_session.",
  },
] as const;

const guardrails = [
  "publicLaunchApproved=false",
  "ownerManualReviewRequired=true",
  "No production launch was performed.",
  "No secrets were added.",
  "No production DB connection was made.",
  "No Telegram API call was made.",
  "No Telegram messages were sent.",
  "No payment or VIP unlock was added.",
  "No cron, workflow, publish script, BotFather or active CTA logic was changed.",
] as const;

const remainingBlockers = [
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "backup freshness <24h",
  "restore rehearsal",
  "real-device QA manual execution",
  "Telegram WebView/startapp manual QA",
  "content/CTA owner review",
  "owner manual approval",
] as const;

export function getAphroditeDashboardAuthSystemDecision(): AphroditeDashboardAuthSystemDecisionModel {
  return {
    packageNumber: 225,
    title: APHRODITE_DASHBOARD_AUTH_SYSTEM_DECISION_TITLE,
    route: APHRODITE_DASHBOARD_AUTH_SYSTEM_DECISION_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    decisionSummary:
      "Canonical dashboard auth is aphrodite_session via middleware.ts. legacy zodiac_dashboard_session auth is non-authoritative and its API endpoints are disabled.",
    canonical: {
      dashboardAuth: "aphrodite_session via middleware.ts",
      sessionCookie: "aphrodite_session",
      loginPath: "/login",
      loginApi: "/api/auth/login",
      logoutApi: "/api/auth/logout",
      middlewareProtection: "middleware.ts",
      protectedRoutePattern: "/dashboard/*",
    },
    legacy: {
      dashboardAuth: "zodiac_dashboard_session",
      envSecretName: "ZODIAC_DASHBOARD_SESSION_SECRET",
      loginPath: "/dashboard/login",
      apiRoutes: "/api/dashboard/auth/*",
      status: "legacy/orphan/non-authoritative",
      handling: "API routes return 410 Disabled and do not set cookies",
    },
    authDecisionItems: authDecisionItems.map((item) => ({ ...item })),
    legacySurfaces: legacySurfaces.map((surface) => ({ ...surface })),
    guardrails: [...guardrails],
    remainingBlockers: [...remainingBlockers],
    safetyFlags: {
      dashboardRemainsProtected: true,
      dashboardPublicBypassAdded: false,
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
