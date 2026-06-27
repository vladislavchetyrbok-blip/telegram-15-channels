#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_MINIAPP_VISUAL_DESIGN_AUDIT_ROUTE,
  APHRODITE_MINIAPP_VISUAL_DESIGN_AUDIT_TITLE,
  getAphroditeMiniAppVisualDesignAudit,
} from "../lib/zodiac/aphrodite-miniapp-visual-design-audit.ts";

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

console.log("Starting QA: Aphrodite Mini App Visual Design Audit...\n");

const modelPath = "../lib/zodiac/aphrodite-miniapp-visual-design-audit.ts";
const pagePath = "../app/dashboard/networks/zodiac/aphrodite-miniapp-visual-design-audit/page.tsx";
const docsPath = "../docs/aphrodite-miniapp-visual-design-audit.md";
const reportPath = "../docs/aphrodite-package-reports/package-236.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", pagePath],
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
const model = getAphroditeMiniAppVisualDesignAudit();
const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === APHRODITE_MINIAPP_VISUAL_DESIGN_AUDIT_TITLE);
check("route exported", model.route === APHRODITE_MINIAPP_VISUAL_DESIGN_AUDIT_ROUTE);
check("package number is 236", model.packageNumber === 236);
check("dashboard route exists", pageSource.includes("getAphroditeMiniAppVisualDesignAudit") && pageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_MINIAPP_VISUAL_DESIGN_AUDIT_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("aphroditeMiniappVisualDesignAudit"));
check("docs/report exists", docsSource.includes("Package 236") && reportSource.includes("Package 236"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));

for (const screen of [
  "Mini App home screen",
  "Compatibility input flow",
  "Compatibility result flow",
  "Birth Matrix / Natal flow",
  "Mystic Cards flow",
  "VIP locked / preview state",
  "Profile / History / Favorites",
  "Loading / empty / error states",
  "CTA visibility and share/result cards",
]) {
  check(`audited screen exists: ${screen}`, model.auditedScreens.some((item) => item.area === screen) && implementationBundle.includes(screen));
}

for (const file of [
  "app/miniapp/page.tsx",
  "app/compatibility/page.tsx",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/zodiac-mini-app/MainMenuSections.tsx",
  "app/birth-matrix/BirthMatrixClient.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/ZodiacVipSections.tsx",
  "app/vip-compatibility-report/page.tsx",
]) {
  check(`source file documented: ${file}`, implementationBundle.includes(file));
}

for (const principle of [
  "premium relationship astrology",
  "mobile-first 360-430px",
  "Telegram WebView safe-area friendly",
  "glass-like cards",
  "gold/violet/rose accents",
  "shareable result cards",
]) {
  check(`design principle exists: ${principle}`, model.recommendedDesignPrinciples.some((item) => item.area === principle) && implementationBundle.includes(principle));
}

check("premium wording exists", /premium/i.test(implementationBundle));
check("mystical wording exists", /mystical/i.test(implementationBundle));
check("mobile-first wording exists", /mobile-first|mobile first/i.test(implementationBundle));
check("Telegram WebView wording exists", /Telegram WebView/i.test(implementationBundle));
check("romantic wording exists", /romantic/i.test(implementationBundle));
check("not childish/casino/spam wording exists", /not childish/i.test(implementationBundle) && /not casino/i.test(implementationBundle) && /cheap horoscope spam/i.test(implementationBundle));

for (const width of ["360px", "390px", "430px"]) {
  check(`mobile breakpoint exists: ${width}`, model.mobileBreakpoints.includes(width) && implementationBundle.includes(width));
}

for (let packageNumber = 237; packageNumber <= 245; packageNumber += 1) {
  check(
    `package plan includes ${packageNumber}`,
    model.prioritizedRedesignPackages.some((item) => item.packageNumber === packageNumber) &&
      implementationBundle.includes(`Package ${packageNumber}`),
  );
}

for (const finding of [
  "First impression",
  "Text density",
  "Button hierarchy",
  "Premium / mystical feeling",
  "Trust and confidence",
]) {
  check(`design finding exists: ${finding}`, model.designFindings.some((item) => item.area === finding) && implementationBundle.includes(finding));
}

for (const risk of [
  "One-note dark card system",
  "Mojibake / encoding visibility risk",
  "Conversion clarity",
  "VIP perception",
]) {
  check(`visual risk exists: ${risk}`, model.visualRisks.some((item) => item.area === risk) && implementationBundle.includes(risk));
}

for (const boundary of [
  "Do not redesign core Mini App screens in Package 236.",
  "Do not change active CTA logic.",
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
