/**
 * Package 271: Public Mini App Route Shell Isolation Fix.
 *
 * Public Telegram Mini App routes must not render the internal dashboard
 * Sidebar/Header/AppShell chrome. Dashboard and admin routes remain protected by
 * the internal shell and auth flow.
 */

export type AphroditePublicMiniappShellIsolationStatus =
  | "PASS"
  | "READY"
  | "DOCUMENTED"
  | "MANUAL REQUIRED"
  | "OWNER REVIEW REQUIRED"
  | "BLOCKED";

export type AphroditePublicMiniappShellIsolationRow = {
  area: string;
  status: AphroditePublicMiniappShellIsolationStatus;
  detail: string;
  ownerAction: string;
};

export type AphroditePublicMiniappShellIsolationModel = {
  packageNumber: 271;
  title: string;
  route: "/dashboard/networks/zodiac/public-miniapp-route-shell-isolation";
  publicLaunchApproved: false;
  ownerManualReviewRequired: true;
  blockerSummary: readonly AphroditePublicMiniappShellIsolationRow[];
  publicNoShellRoutes: readonly AphroditePublicMiniappShellIsolationRow[];
  dashboardShellRoutes: readonly AphroditePublicMiniappShellIsolationRow[];
  helperRules: readonly AphroditePublicMiniappShellIsolationRow[];
  forbiddenAdminTermsOnPublicRoutes: readonly string[];
  manualVerificationRoutes: readonly AphroditePublicMiniappShellIsolationRow[];
  safetyBoundaries: readonly string[];
  whatWasNotChanged: readonly AphroditePublicMiniappShellIsolationRow[];
  nextPackageRecommendation: string;
  safetyNotes: readonly string[];
  remainingBlockers: readonly string[];
  safetyFlags: {
    productionLaunchDone: false;
    telegramApiUsed: false;
    messagesSent: false;
    botFatherChanged: false;
    activeCtaLogicChanged: false;
    channelMappingsChanged: false;
    calculationsChanged: false;
    routeLogicChangedOnlyForShell: true;
    databaseWriteAdded: false;
    storageWriteAdded: false;
    externalAnalyticsAdded: false;
    paymentAdded: false;
    vipUnlockAdded: false;
    entitlementBypassAdded: false;
    cronWorkflowPublishChanged: false;
    secretsAdded: false;
    productionDbConnected: false;
    dashboardMadePublic: false;
    ownerApprovalGranted: false;
    publicLaunchApproved: false;
    ownerManualReviewRequired: true;
  };
};

export const APHRODITE_PUBLIC_MINIAPP_ROUTE_SHELL_ISOLATION_TITLE =
  "Public Mini App Route Shell Isolation";

export const APHRODITE_PUBLIC_MINIAPP_ROUTE_SHELL_ISOLATION_ROUTE =
  "/dashboard/networks/zodiac/public-miniapp-route-shell-isolation" as const;

const safetyFlags = {
  productionLaunchDone: false,
  telegramApiUsed: false,
  messagesSent: false,
  botFatherChanged: false,
  activeCtaLogicChanged: false,
  channelMappingsChanged: false,
  calculationsChanged: false,
  routeLogicChangedOnlyForShell: true,
  databaseWriteAdded: false,
  storageWriteAdded: false,
  externalAnalyticsAdded: false,
  paymentAdded: false,
  vipUnlockAdded: false,
  entitlementBypassAdded: false,
  cronWorkflowPublishChanged: false,
  secretsAdded: false,
  productionDbConnected: false,
  dashboardMadePublic: false,
  ownerApprovalGranted: false,
  publicLaunchApproved: false,
  ownerManualReviewRequired: true,
} as const;

export function getAphroditePublicMiniappRouteShellIsolation(): AphroditePublicMiniappShellIsolationModel {
  return {
    packageNumber: 271,
    title: APHRODITE_PUBLIC_MINIAPP_ROUTE_SHELL_ISOLATION_TITLE,
    route: APHRODITE_PUBLIC_MINIAPP_ROUTE_SHELL_ISOLATION_ROUTE,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
    blockerSummary: [
      {
        area: "internal dashboard shell leaked into public Mini App routes",
        status: "PASS",
        detail:
          "AppShell now uses isPublicMiniAppRoute(pathname) before rendering Sidebar, Header, UnifiedStatusStrip, or main dashboard padding.",
        ownerAction: "Open each public user route after deploy and confirm no admin chrome is visible.",
      },
      {
        area: "/compatibility baseline",
        status: "PASS",
        detail: "/compatibility keeps the same public minimal shell behavior that already worked before Package 271.",
        ownerAction: "Recheck compatibility flow on Telegram WebView after cache refresh.",
      },
    ],
    publicNoShellRoutes: [
      {
        area: "/miniapp",
        status: "PASS",
        detail: "Public Mini App hub bypasses internal AppShell chrome.",
        ownerAction: "Confirm no Sidebar/Header/admin labels on /miniapp.",
      },
      {
        area: "/compatibility",
        status: "PASS",
        detail: "Compatibility route remains a public Mini App route without dashboard shell.",
        ownerAction: "Confirm /compatibility remains usable and shell-free.",
      },
      {
        area: "/birth-matrix",
        status: "PASS",
        detail: "Birth Matrix route bypasses internal dashboard shell.",
        ownerAction: "Confirm date input screen opens without admin chrome.",
      },
      {
        area: "/vip-preview",
        status: "PASS",
        detail: "VIP preview route stays public and preview-only without dashboard shell.",
        ownerAction: "Confirm VIP remains locked/preview-only and shell-free.",
      },
      {
        area: "/vip-compatibility-report",
        status: "PASS",
        detail: "VIP compatibility preview route bypasses internal dashboard shell.",
        ownerAction: "Confirm no payment or entitlement unlock appears.",
      },
      {
        area: "/mystic-numbers",
        status: "PASS",
        detail: "Existing public Mini App mock route bypasses internal dashboard shell.",
        ownerAction: "Confirm route is shell-free if linked from live Mini App.",
      },
      {
        area: "/affirmations",
        status: "PASS",
        detail: "Existing public Mini App mock route bypasses internal dashboard shell.",
        ownerAction: "Confirm route is shell-free if linked from live Mini App.",
      },
    ],
    dashboardShellRoutes: [
      {
        area: "/dashboard",
        status: "PASS",
        detail: "Dashboard and children are not included in the public route prefix list.",
        ownerAction: "Keep dashboard protected by existing middleware/auth.",
      },
      {
        area: "/dashboard/networks/zodiac",
        status: "PASS",
        detail: "Zodiac dashboard route continues to use the internal dashboard shell/readiness layout.",
        ownerAction: "Open the dashboard and verify internal navigation still appears.",
      },
      {
        area: "/dashboard/login",
        status: "PASS",
        detail: "Dashboard login keeps its existing minimal wrapper behavior.",
        ownerAction: "Do not change login behavior unless a future auth package requests it.",
      },
    ],
    helperRules: [
      {
        area: "isPublicMiniAppRoute(pathname)",
        status: "PASS",
        detail: "One route classifier controls all public Telegram Mini App shell bypasses.",
        ownerAction: "Add future public Mini App routes here instead of one-off AppShell conditions.",
      },
      {
        area: "isDashboardRoute(pathname)",
        status: "PASS",
        detail: "Dashboard route detection remains separate from public Mini App route detection.",
        ownerAction: "Never add /dashboard to PUBLIC_MINIAPP_ROUTE_PREFIXES.",
      },
    ],
    forbiddenAdminTermsOnPublicRoutes: [
      "Aphrodite internal dashboard",
      "Sidebar",
      "UnifiedStatusStrip",
      "Launch Control",
      "Zodiac Publisher",
      "Zodiac Studio",
      "publicLaunchApproved",
      "ownerManualReviewRequired",
    ],
    manualVerificationRoutes: [
      {
        area: "/miniapp",
        status: "MANUAL REQUIRED",
        detail: "Owner/browser smoke should verify visible public UI without admin chrome.",
        ownerAction: "Open locally and in Telegram WebView after deploy/cache refresh.",
      },
      {
        area: "/compatibility",
        status: "MANUAL REQUIRED",
        detail: "Compatibility remains the control route for pre-existing public shell behavior.",
        ownerAction: "Confirm input/result flow still passes smoke.",
      },
      {
        area: "/birth-matrix",
        status: "MANUAL REQUIRED",
        detail: "Birth Matrix should show only the public user interface.",
        ownerAction: "Confirm no dashboard sidebar/header and date input remains intact.",
      },
      {
        area: "/vip-preview",
        status: "MANUAL REQUIRED",
        detail: "VIP preview should show only public preview UI with no payment and no unlock.",
        ownerAction: "Confirm locked/preview-only state.",
      },
      {
        area: "/vip-compatibility-report",
        status: "MANUAL REQUIRED",
        detail: "VIP compatibility report preview should be public shell-free.",
        ownerAction: "Confirm no dashboard chrome and no active entitlement bypass.",
      },
      {
        area: "/dashboard/networks/zodiac",
        status: "MANUAL REQUIRED",
        detail: "Internal dashboard route should still show internal readiness/navigation UI.",
        ownerAction: "Confirm dashboard auth and shell remain intact.",
      },
    ],
    safetyBoundaries: [
      "No production launch.",
      "No Telegram API calls.",
      "No Telegram messages.",
      "No BotFather changes.",
      "No active CTA logic changes.",
      "No route destination changes.",
      "No payment changes.",
      "No VIP unlock.",
      "No DB writes.",
      "No external analytics.",
      "No cron/workflow/publish script changes.",
      "No secrets.",
      "No dashboard public bypass.",
    ],
    whatWasNotChanged: [
      {
        area: "Mini App flows",
        status: "PASS",
        detail: "Compatibility, Birth Matrix, Mystic, VIP preview, and result logic were not changed.",
        ownerAction: "Use existing smoke checks as regression guards.",
      },
      {
        area: "dashboard auth",
        status: "PASS",
        detail: "Middleware and dashboard auth/session behavior were not changed.",
        ownerAction: "Keep Package 225 auth decision intact.",
      },
      {
        area: "launch flags",
        status: "BLOCKED",
        detail: "publicLaunchApproved=false and ownerManualReviewRequired=true remain unchanged.",
        ownerAction: "Launch remains blocked until owner manual approval.",
      },
    ],
    nextPackageRecommendation: "Package 272 - Owner Screenshot Recheck After Shell Isolation",
    safetyNotes: [
      "Package 271 is route-shell isolation only.",
      "publicLaunchApproved=false",
      "ownerManualReviewRequired=true",
      "Dashboard routes remain internal and protected.",
    ],
    remainingBlockers: [
      "DATABASE_URL manual configuration",
      "TELEGRAM_BOT_TOKEN manual configuration",
      "backup freshness <24h",
      "restore rehearsal",
      "real-device QA manual execution",
      "Telegram WebView/startapp manual QA",
      "content/CTA owner review",
      "owner explicit approval",
      "owner screenshot recheck after Package 271",
    ],
    safetyFlags,
  };
}
