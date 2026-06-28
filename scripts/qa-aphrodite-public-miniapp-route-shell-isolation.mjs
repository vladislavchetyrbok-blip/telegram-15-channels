#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_PUBLIC_MINIAPP_ROUTE_SHELL_ISOLATION_ROUTE,
  APHRODITE_PUBLIC_MINIAPP_ROUTE_SHELL_ISOLATION_TITLE,
  getAphroditePublicMiniappRouteShellIsolation,
} from "../lib/zodiac/aphrodite-public-miniapp-route-shell-isolation.ts";

let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) {
    passed += 1;
    console.log("SUCCESS: " + name);
  } else {
    failed += 1;
    console.log("FAIL: " + name);
  }
}

function read(rel) {
  return readFileSync(new URL(rel, import.meta.url), "utf8");
}

function exists(rel) {
  return existsSync(new URL(rel, import.meta.url));
}

console.log("Starting QA: Aphrodite Public Mini App Route Shell Isolation...\n");

const modelPath = "../lib/zodiac/aphrodite-public-miniapp-route-shell-isolation.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/public-miniapp-route-shell-isolation/page.tsx";
const docsPath = "../docs/aphrodite-public-miniapp-route-shell-isolation.md";
const reportPath = "../docs/aphrodite-package-reports/package-271.md";
const appShellPath = "../components/AppShell.tsx";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

const publicRouteFiles = [
  ["miniapp route", "../app/miniapp/page.tsx"],
  ["compatibility route", "../app/compatibility/page.tsx"],
  ["birth matrix route", "../app/birth-matrix/page.tsx"],
  ["vip preview route", "../app/vip-preview/page.tsx"],
  ["vip compatibility report route", "../app/vip-compatibility-report/page.tsx"],
  ["mystic numbers route", "../app/mystic-numbers/page.tsx"],
  ["affirmations route", "../app/affirmations/page.tsx"],
];

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", dashboardPagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["AppShell", appShellPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
  ...publicRouteFiles,
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const dashboardPageSource = exists(dashboardPagePath) ? read(dashboardPagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const appShellSource = exists(appShellPath) ? read(appShellPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const implementationBundle = [
  modelSource,
  dashboardPageSource,
  docsSource,
  reportSource,
  appShellSource,
  dashboardSource,
  dashboardQaSource,
].join("\n");
const model = getAphroditePublicMiniappRouteShellIsolation();
const publicPrefixBlock = appShellSource.match(/PUBLIC_MINIAPP_ROUTE_PREFIXES = \[([\s\S]*?)\] as const/)?.[1] ?? "";

check("title exported", model.title === APHRODITE_PUBLIC_MINIAPP_ROUTE_SHELL_ISOLATION_TITLE);
check("route exported", model.route === APHRODITE_PUBLIC_MINIAPP_ROUTE_SHELL_ISOLATION_ROUTE);
check("package number is 271", model.packageNumber === 271);
check("dashboard page uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_PUBLIC_MINIAPP_ROUTE_SHELL_ISOLATION_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("publicMiniappRouteShellIsolation"));
check("docs/report exist", docsSource.includes("Package 271") && reportSource.includes("Package 271"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));

for (const field of [
  "blockerSummary",
  "publicNoShellRoutes",
  "dashboardShellRoutes",
  "helperRules",
  "forbiddenAdminTermsOnPublicRoutes",
  "manualVerificationRoutes",
  "safetyBoundaries",
  "whatWasNotChanged",
  "nextPackageRecommendation",
]) {
  const value = model[field];
  check(`model field exists: ${field}`, (Array.isArray(value) ? value.length > 0 : Boolean(value)) && implementationBundle.includes(field));
}

for (const route of [
  "/miniapp",
  "/compatibility",
  "/birth-matrix",
  "/vip-preview",
  "/vip-compatibility-report",
  "/mystic-numbers",
  "/affirmations",
  "/mystic-cards",
]) {
  check(`public route prefix included: ${route}`, publicPrefixBlock.includes(`"${route}"`) && implementationBundle.includes(route));
}

for (const route of ["/dashboard", "/dashboard/networks/zodiac", "/dashboard/networks/aphrodite"]) {
  check(`dashboard route documented but not in public prefix: ${route}`, implementationBundle.includes(route) && !publicPrefixBlock.includes(`"${route}"`));
}

check("isPublicMiniAppRoute helper exists", appShellSource.includes("export function isPublicMiniAppRoute"));
check("isDashboardRoute helper exists", appShellSource.includes("export function isDashboardRoute"));
check("route child helper exists", appShellSource.includes("export function isRouteOrChild"));
check("public shell branch runs before Sidebar", appShellSource.indexOf("isPublicMiniAppRoute(pathname)") >= 0 && appShellSource.indexOf("isPublicMiniAppRoute(pathname)") < appShellSource.indexOf("<Sidebar />"));
check("public branch returns minimal wrapper", /if \(isPublicMiniAppRoute\(pathname\) \|\| isDashboardLoginRoute\) \{[\s\S]*?return <div className="min-h-screen overflow-x-hidden bg-\[#070b14\] text-slate-100">\{children\}<\/div>;[\s\S]*?\}/.test(appShellSource));
check("dashboard route guard kept separate", appShellSource.includes("isDashboardRoute(pathname) &&"));
check("dashboard login behavior preserved", appShellSource.includes('pathname === "/dashboard/login"'));
check("old compatibility-only branch removed", !appShellSource.includes("isPublicCompatibilityRoute"));

for (const route of ["/miniapp", "/compatibility", "/birth-matrix", "/vip-preview", "/vip-compatibility-report"]) {
  const routeRow = model.publicNoShellRoutes.find((row) => row.area === route);
  check(`${route} public no-shell model row PASS`, routeRow?.status === "PASS");
}

for (const phrase of [
  "internal dashboard shell leaked into public Mini App routes",
  "Dashboard routes remain internal and protected",
  "No dashboard public bypass",
  "Sidebar",
  "UnifiedStatusStrip",
  "Launch Control",
  "Zodiac Publisher",
  "publicLaunchApproved",
  "ownerManualReviewRequired",
  "Package 272 - Owner Screenshot Recheck After Shell Isolation",
]) {
  check(`required wording exists: ${phrase}`, implementationBundle.includes(phrase));
}

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no channel mapping flag", model.safetyFlags.channelMappingsChanged === false);
check("no calculation flag", model.safetyFlags.calculationsChanged === false);
check("shell-only route logic flag", model.safetyFlags.routeLogicChangedOnlyForShell === true);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no storage write flag", model.safetyFlags.storageWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no entitlement bypass flag", model.safetyFlags.entitlementBypassAdded === false);
check("no cron/workflow/publish flag", model.safetyFlags.cronWorkflowPublishChanged === false);
check("no secrets flag", model.safetyFlags.secretsAdded === false);
check("no production DB flag", model.safetyFlags.productionDbConnected === false);
check("dashboard not made public flag", model.safetyFlags.dashboardMadePublic === false);
check("owner approval not granted flag", model.safetyFlags.ownerApprovalGranted === false);

const changedFiles = gitChangedNames([
  ".github",
  "vercel.json",
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-due.mjs",
  "scripts/publish-due-json.mjs",
  "package.json",
  "prisma",
  "supabase",
  "migrations",
  "schema.prisma",
  ".env",
  ".env.local",
  ".env.production",
]);
check("no workflow/cron/publish/package/db/env files changed", changedFiles.length === 0);
if (changedFiles.length) {
  console.log("Unexpected risky changed files:", changedFiles.join(", "));
}

check("no hardcoded secret-looking values", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,})/i.test(implementationBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no BotFather action implementation", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(implementationBundle));
check("no DB/storage write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert|localStorage\.setItem|sessionStorage\.setItem/i.test(implementationBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(implementationBundle));
check("no external analytics implementation", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(implementationBundle));

console.log(`\nAphrodite Public Mini App Route Shell Isolation QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
