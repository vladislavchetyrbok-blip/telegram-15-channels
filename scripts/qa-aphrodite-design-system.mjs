#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_DESIGN_SYSTEM_ROUTE,
  APHRODITE_DESIGN_SYSTEM_TITLE,
  getAphroditeDesignSystem,
} from "../lib/zodiac/aphrodite-design-system.ts";

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

console.log("Starting QA: Aphrodite Design System...\n");

const modelPath = "../lib/zodiac/aphrodite-design-system.ts";
const pagePath = "../app/dashboard/networks/zodiac/aphrodite-design-system/page.tsx";
const componentsDirPath = "../components/zodiac-mini-app/aphrodite-design-system";
const docsPath = "../docs/aphrodite-design-system.md";
const reportPath = "../docs/aphrodite-package-reports/package-237.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", pagePath],
  ["component folder", componentsDirPath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const componentFiles = exists(componentsDirPath)
  ? readdirSync(new URL(componentsDirPath, import.meta.url)).filter((file) => /\.(ts|tsx)$/.test(file))
  : [];
const componentsSource = componentFiles
  .map((file) => read(`${componentsDirPath}/${file}`))
  .join("\n");
const model = getAphroditeDesignSystem();
const implementationBundle = [
  modelSource,
  pageSource,
  docsSource,
  reportSource,
  dashboardSource,
  dashboardQaSource,
  componentsSource,
].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource, componentsSource].join("\n");

check("title exported", model.title === APHRODITE_DESIGN_SYSTEM_TITLE);
check("route exported", model.route === APHRODITE_DESIGN_SYSTEM_ROUTE);
check("package number is 237", model.packageNumber === 237);
check("dashboard route uses readiness page", pageSource.includes("AphroditeReadinessPage"));
check("dashboard route includes showcase", pageSource.includes("AphroditeDesignSystemShowcase"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_DESIGN_SYSTEM_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("aphroditeDesignSystem"));
check("docs/report exist", docsSource.includes("Package 237") && reportSource.includes("Package 237"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));

for (const field of [
  "brandMood",
  "colorTokens",
  "gradientTokens",
  "cardStyles",
  "buttonStyles",
  "typographyScale",
  "spacingRules",
  "mobileBreakpoints",
  "telegramWebViewSafeAreaRules",
  "componentPrinciples",
  "resultCardPrinciples",
  "vipLockedPreviewPrinciples",
  "mysticCardPrinciples",
  "accessibilityReadabilityConstraints",
  "safetyBoundaries",
  "nextPackageUsage",
]) {
  check(`model field exists: ${field}`, Array.isArray(model[field]) && implementationBundle.includes(field));
}

for (const phrase of [
  "premium",
  "mystical",
  "romantic",
  "modern",
  "mobile-first",
  "Telegram WebView",
  "not childish",
  "not casino",
  "cheap horoscope spam",
]) {
  check(`brand phrase exists: ${phrase}`, implementationBundle.toLowerCase().includes(phrase.toLowerCase()));
}

const colorText = textFor(model.colorTokens);
for (const token of ["violet", "rose", "gold", "dark", "cosmic"]) {
  check(`color token includes ${token}`, colorText.includes(token));
}

const gradientText = textFor(model.gradientTokens);
for (const token of ["hero", "rose", "gold", "violet", "glass", "score"]) {
  check(`gradient token includes ${token}`, gradientText.includes(token));
}

const componentText = textFor([
  model.cardStyles,
  model.buttonStyles,
  model.componentPrinciples,
  model.resultCardPrinciples,
  model.vipLockedPreviewPrinciples,
  model.mysticCardPrinciples,
]);
for (const phrase of [
  "AphroditeCard",
  "AphroditeButton",
  "result card",
  "VIP locked preview",
  "mystic card",
  "compatibility score",
  "shareable",
]) {
  check(`component principle includes ${phrase}`, componentText.includes(phrase.toLowerCase()));
}

for (const width of ["360px", "390px", "430px"]) {
  check(`mobile breakpoint exists: ${width}`, model.mobileBreakpoints.includes(width) && implementationBundle.includes(width));
}

for (const componentName of [
  "AphroditeSurface",
  "AphroditeCard",
  "AphroditeHeroCard",
  "AphroditeButton",
  "AphroditeBadge",
  "AphroditeSectionHeader",
  "AphroditeMetricCard",
  "AphroditeResultCardPreview",
  "AphroditeLockedPreviewCard",
  "AphroditeMysticCardPreview",
]) {
  check(`component exists: ${componentName}`, componentsSource.includes(`function ${componentName}`) || componentsSource.includes(`export { ${componentName}`));
}

check("components are presentational only", !/onClick=|useState|useEffect|useRouter|router\.push|window\.Telegram|Telegram\.WebApp/i.test(componentsSource));
check("no external images in components", !/<img\b|next\/image|https?:\/\/|fonts\.googleapis/i.test(componentsSource));
check("no active CTA logic in components", !/href=|fetch\(|navigator\.sendBeacon|localStorage|sessionStorage/i.test(componentsSource));

for (let packageNumber = 238; packageNumber <= 245; packageNumber += 1) {
  check(
    `next package usage includes ${packageNumber}`,
    model.nextPackageUsage.some((item) => item.packageNumber === packageNumber) &&
      implementationBundle.includes(`Package ${packageNumber}`),
  );
}

for (const boundary of [
  "Do not fully redesign Mini App screens in Package 237.",
  "Do not start Package 238.",
  "Do not change active CTA logic.",
  "Do not change app flows.",
  "Do not use Telegram API.",
  "Do not send Telegram messages.",
  "Do not add payment.",
  "Do not unlock VIP.",
  "Do not add DB writes.",
  "Do not add external analytics.",
  "Do not change cron/workflows/publish scripts.",
  "Do not add secrets.",
]) {
  check(`safety boundary exists: ${boundary}`, model.safetyBoundaries.includes(boundary) && implementationBundle.includes(boundary));
}

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA logic change flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no cron/workflow/publish flag", model.safetyFlags.cronWorkflowPublishChanged === false);
check("no secrets added flag", model.safetyFlags.secretsAdded === false);
check("no production DB connected flag", model.safetyFlags.productionDbConnected === false);
check("Mini App screens not redesigned flag", model.safetyFlags.miniAppScreensRedesigned === false);
check("app flows not changed flag", model.safetyFlags.appFlowsChanged === false);

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

console.log(`\nQA complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
