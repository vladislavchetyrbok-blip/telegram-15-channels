#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_MINIAPP_HOME_SCREEN_REDESIGN_ROUTE,
  APHRODITE_MINIAPP_HOME_SCREEN_REDESIGN_TITLE,
  getAphroditeMiniappHomeScreenRedesign,
} from "../lib/zodiac/aphrodite-miniapp-home-screen-redesign.ts";

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

function textFor(value) {
  return JSON.stringify(value).toLowerCase();
}

console.log("Starting QA: Aphrodite Mini App Home Screen Redesign...\n");

const modelPath = "../lib/zodiac/aphrodite-miniapp-home-screen-redesign.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/miniapp-home-screen-redesign/page.tsx";
const miniappPagePath = "../app/miniapp/page.tsx";
const liveHomeComponentPath = "../components/zodiac-mini-app/AphroditeHomeScreen.tsx";
const mainMenuPath = "../components/zodiac-mini-app/MainMenuSections.tsx";
const docsPath = "../docs/aphrodite-miniapp-home-screen-redesign.md";
const reportPath = "../docs/aphrodite-package-reports/package-238.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", dashboardPagePath],
  ["miniapp page", miniappPagePath],
  ["live home component", liveHomeComponentPath],
  ["main menu wrapper", mainMenuPath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const dashboardPageSource = exists(dashboardPagePath) ? read(dashboardPagePath) : "";
const miniappPageSource = exists(miniappPagePath) ? read(miniappPagePath) : "";
const liveHomeSource = exists(liveHomeComponentPath) ? read(liveHomeComponentPath) : "";
const mainMenuSource = exists(mainMenuPath) ? read(mainMenuPath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";

const model = getAphroditeMiniappHomeScreenRedesign();
const implementationBundle = [
  modelSource,
  dashboardPageSource,
  miniappPageSource,
  liveHomeSource,
  mainMenuSource,
  docsSource,
  reportSource,
  dashboardSource,
  dashboardQaSource,
].join("\n");
const userFacingBundle = [miniappPageSource, liveHomeSource].join("\n");
const safetyBundle = [modelSource, dashboardPageSource, miniappPageSource, liveHomeSource, mainMenuSource].join("\n");
const modelText = textFor(model);

check("title exported", model.title === APHRODITE_MINIAPP_HOME_SCREEN_REDESIGN_TITLE);
check("route exported", model.route === APHRODITE_MINIAPP_HOME_SCREEN_REDESIGN_ROUTE);
check("package number is 238", model.packageNumber === 238);
check("dashboard route uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_MINIAPP_HOME_SCREEN_REDESIGN_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("miniappHomeScreenRedesign"));
check("docs/report exist", docsSource.includes("Package 238") && reportSource.includes("Package 238"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));

for (const field of [
  "redesignedSections",
  "primaryCTA",
  "secondaryCTAs",
  "visualPrinciplesApplied",
  "mobileBreakpoints",
  "safetyBoundaries",
  "whatWasNotChanged",
  "nextPackageRecommendation",
]) {
  const value = model[field];
  check(`model field exists: ${field}`, (Array.isArray(value) ? value.length > 0 : Boolean(value)) && implementationBundle.includes(field));
}

for (const route of ["/miniapp", "/compatibility"]) {
  check(`redesigned route documented: ${route}`, model.redesignedRoutes.some((item) => item.includes(route)) && implementationBundle.includes(route));
}

check("live home wrapper uses Aphrodite home", mainMenuSource.includes("AphroditeAstrologyCenterHome"));
check("live home marker exists", liveHomeSource.includes('data-aphrodite-miniapp-home-redesign="package-238"'));
check("miniapp marker exists", miniappPageSource.includes('data-aphrodite-miniapp-entry-redesign="package-238"'));
check("Package 237 design primitives used", userFacingBundle.includes("AphroditeSurface") && userFacingBundle.includes("AphroditeCard") && userFacingBundle.includes("AphroditeBadge"));

for (const phrase of [
  "Aphrodite",
  "premium mystical romantic",
  "dark cosmic",
  "glass-like cards",
  "rose",
  "violet",
  "gold",
  "Проверить совместимость",
  "Совместимость",
  "Матрица судьбы",
  "Мистическая карта",
  "Mystic Cards",
  "VIP locked preview",
  "Full relationship report",
  "daily",
  "trust/safety microcopy",
  "Telegram WebView",
  "safe-area",
  "no active payment",
  "no VIP unlock",
]) {
  check(`home redesign phrase exists: ${phrase}`, implementationBundle.toLowerCase().includes(phrase.toLowerCase()));
}

for (const width of ["360px", "390px", "430px"]) {
  check(`mobile breakpoint exists: ${width}`, model.mobileBreakpoints.includes(width) && implementationBundle.includes(width));
}

check("primary CTA destination safe", model.primaryCTA.destination === "/compatibility?startapp=compat_love");
check("primary CTA active logic unchanged", model.primaryCTA.activeLogicChanged === false);
check("secondary CTA count", model.secondaryCTAs.length >= 2);
check("Birth Matrix CTA destination exists", model.secondaryCTAs.some((item) => item.label === "Матрица судьбы" && item.destination === "/birth-matrix"));
check("Mystic Cards CTA destination exists", model.secondaryCTAs.some((item) => item.label === "Мистическая карта" && item.destination.includes("startapp=mystic")));
check("all CTAs report no active logic change", [model.primaryCTA, ...model.secondaryCTAs].every((item) => item.activeLogicChanged === false));

for (const section of [
  "premium hero",
  "short emotional headline/subheadline",
  "primary compatibility CTA",
  "secondary Birth Matrix and Mystic Cards CTAs",
  "VIP locked preview",
  "daily/mystic teaser",
  "trust/safety microcopy",
  "Telegram WebView safe-area spacing",
]) {
  check(`redesigned section documented: ${section}`, modelText.includes(section.toLowerCase()) && implementationBundle.includes(section));
}

for (const unchanged of [
  "Compatibility flow internals",
  "Birth Matrix flow",
  "Mystic Cards flow",
  "active CTA logic",
  "public launch flags",
]) {
  check(`unchanged scope documented: ${unchanged}`, model.whatWasNotChanged.some((item) => item.area === unchanged) && implementationBundle.includes(unchanged));
}

check("next package recommendation documented", model.nextPackageRecommendation === "Package 239 - Compatibility Flow Redesign" && implementationBundle.includes("Package 239 - Compatibility Flow Redesign"));

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA logic change flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no app flow change flag", model.safetyFlags.appFlowsChanged === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no cron/workflow/publish flag", model.safetyFlags.cronWorkflowPublishChanged === false);
check("no secrets flag", model.safetyFlags.secretsAdded === false);
check("no production DB connected flag", model.safetyFlags.productionDbConnected === false);

const changedFiles = gitChangedNames([
  "app",
  "components",
  "lib",
  "scripts",
  "docs",
  "package.json",
  ".github",
  "vercel.json",
  "prisma",
  "supabase",
  "migrations",
  "schema.prisma",
  ".env",
  ".env.example",
]);
check("git scope helper returned real change data", !changedFiles.includes("__git_diff_failed__"));
check("no workflow/cron changes", gitChangedNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitChangedNames([
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-due.mjs",
  "scripts/publish-due-json.mjs",
]).length === 0);
check("package.json not changed", gitChangedNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitChangedNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("no env or secret files changed", gitChangedNames([".env", ".env.local", ".env.production", ".env.example"]).length === 0);

check("no hardcoded secret-looking values", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,})/i.test(safetyBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no Telegram payment handler implementation", !/pre_checkout|successful_payment|answerPreCheckoutQuery|createInvoiceLink/i.test(safetyBundle));
check("no BotFather action implementation", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no active CTA implementation change", !/activeCtaLogicChanged:\s*true|activeCtaChanged:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(safetyBundle));
check("no production DB client implementation", !/new\s+PrismaClient\b|from ['"]@prisma\/client|postgres\s*\(|neon\s*\(|new\s+Pool\s*\(|new\s+Client\s*\(/i.test(safetyBundle));
check("no DB write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(safetyBundle));
check("no external analytics implementation", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nAphrodite Mini App Home Screen Redesign QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
