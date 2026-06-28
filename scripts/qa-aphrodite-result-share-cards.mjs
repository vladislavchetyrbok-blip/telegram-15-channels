#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_RESULT_SHARE_CARDS_ROUTE,
  APHRODITE_RESULT_SHARE_CARDS_TITLE,
  getAphroditeResultShareCards,
} from "../lib/zodiac/aphrodite-result-share-cards.ts";

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

console.log("Starting QA: Aphrodite Result / Share Cards...\n");

const modelPath = "../lib/zodiac/aphrodite-result-share-cards.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/result-share-cards/page.tsx";
const shareCardComponentPath = "../components/zodiac-mini-app/aphrodite-design-system/AphroditeShareCard.tsx";
const resultPreviewComponentPath = "../components/zodiac-mini-app/aphrodite-design-system/AphroditeResultCardPreview.tsx";
const designSystemIndexPath = "../components/zodiac-mini-app/aphrodite-design-system/index.ts";
const compatibilityResultPath = "../components/zodiac-mini-app/ResultCards.tsx";
const birthMatrixRoutePath = "../app/birth-matrix/BirthMatrixClient.tsx";
const mysticSectionsPath = "../components/ZodiacMysticSections.tsx";
const vipSectionsPath = "../components/ZodiacVipSections.tsx";
const vipCompatibilityReportPath = "../app/vip-compatibility-report/VipCompatibilityReportClient.tsx";
const vipPreviewPath = "../app/vip-preview/page.tsx";
const docsPath = "../docs/aphrodite-result-share-cards.md";
const reportPath = "../docs/aphrodite-package-reports/package-243.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", dashboardPagePath],
  ["share card component", shareCardComponentPath],
  ["result preview component", resultPreviewComponentPath],
  ["design system index", designSystemIndexPath],
  ["compatibility result cards", compatibilityResultPath],
  ["birth matrix route", birthMatrixRoutePath],
  ["mystic sections", mysticSectionsPath],
  ["VIP sections", vipSectionsPath],
  ["VIP compatibility report page", vipCompatibilityReportPath],
  ["VIP preview index", vipPreviewPath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const dashboardPageSource = exists(dashboardPagePath) ? read(dashboardPagePath) : "";
const shareCardSource = exists(shareCardComponentPath) ? read(shareCardComponentPath) : "";
const resultPreviewSource = exists(resultPreviewComponentPath) ? read(resultPreviewComponentPath) : "";
const designIndexSource = exists(designSystemIndexPath) ? read(designSystemIndexPath) : "";
const compatibilitySource = exists(compatibilityResultPath) ? read(compatibilityResultPath) : "";
const birthMatrixSource = exists(birthMatrixRoutePath) ? read(birthMatrixRoutePath) : "";
const mysticSource = exists(mysticSectionsPath) ? read(mysticSectionsPath) : "";
const vipSectionsSource = exists(vipSectionsPath) ? read(vipSectionsPath) : "";
const vipCompatibilityReportSource = exists(vipCompatibilityReportPath) ? read(vipCompatibilityReportPath) : "";
const vipPreviewSource = exists(vipPreviewPath) ? read(vipPreviewPath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";

const model = getAphroditeResultShareCards();
const liveBundle = [
  shareCardSource,
  resultPreviewSource,
  designIndexSource,
  compatibilitySource,
  birthMatrixSource,
  mysticSource,
  vipSectionsSource,
  vipCompatibilityReportSource,
  vipPreviewSource,
].join("\n");
const implementationBundle = [
  modelSource,
  dashboardPageSource,
  liveBundle,
  docsSource,
  reportSource,
  dashboardSource,
  dashboardQaSource,
].join("\n");
const safetyBundle = [
  modelSource,
  dashboardPageSource,
  shareCardSource,
  resultPreviewSource,
  docsSource,
  reportSource,
].join("\n");
const changedBundle = [
  shareCardSource,
  resultPreviewSource,
  compatibilitySource,
  birthMatrixSource,
  mysticSource,
  vipSectionsSource,
  vipCompatibilityReportSource,
  vipPreviewSource,
  modelSource,
  dashboardPageSource,
  docsSource,
  reportSource,
].join("\n");
const modelText = textFor(model);

check("title exported", model.title === APHRODITE_RESULT_SHARE_CARDS_TITLE);
check("route exported", model.route === APHRODITE_RESULT_SHARE_CARDS_ROUTE);
check("package number is 243", model.packageNumber === 243);
check("dashboard route uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_RESULT_SHARE_CARDS_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("resultShareCards"));
check("docs/report exist", docsSource.includes("Package 243") && reportSource.includes("Package 243"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));

for (const field of [
  "redesignedSurfaces",
  "resultCardPrinciples",
  "shareCardPrinciples",
  "compatibilityResultCardPrinciples",
  "birthMatrixResultCardPrinciples",
  "mysticResultCardPrinciples",
  "vipPreviewResultPrinciples",
  "mobileBreakpoints",
  "telegramWebViewRules",
  "safetyBoundaries",
  "whatWasNotChanged",
  "nextPackageRecommendation",
]) {
  const value = model[field];
  check(`model field exists: ${field}`, (Array.isArray(value) ? value.length > 0 : Boolean(value)) && implementationBundle.includes(field));
}

for (const route of ["/compatibility", "/miniapp", "/birth-matrix", "/vip-compatibility-report", "/vip-preview"]) {
  check(`live route documented: ${route}`, model.liveRoutes.includes(route) && implementationBundle.includes(route));
}

for (const marker of [
  'data-aphrodite-result-share-card="package-243"',
  "data-aphrodite-result-share-scope",
  'data-aphrodite-share-ready-preview="package-243"',
  'data-aphrodite-compatibility-shareable-result="package-239"',
  'data-aphrodite-birth-matrix-report="package-240"',
  'data-aphrodite-mystic-card-result="package-241"',
  'data-aphrodite-natal-report="package-240"',
  'data-aphrodite-vip-preview-share-card="package-243"',
  'data-aphrodite-vip-compatibility-share-card="package-243"',
]) {
  check(`result/share marker exists: ${marker}`, liveBundle.includes(marker));
}

for (const scope of [
  "compatibility",
  "birth-matrix",
  "miniapp-matrix",
  "mystic-daily",
  "mystic-tarot",
  "mystic-rune",
  "vip-natal",
  "vip-preview",
  "vip-compatibility-report",
  "design-system-preview",
]) {
  check(`scope documented and used: ${scope}`, model.redesignedSurfaces.some((item) => item.scope === scope) && implementationBundle.includes(scope));
}

for (const variant of ["general", "compatibility", "birthMatrix", "mystic", "natal", "vipPreview"]) {
  check(`share card variant exists: ${variant}`, shareCardSource.includes(`"${variant}"`) && liveBundle.includes(`variant="${variant}"`));
}

for (const phrase of [
  "Result / Share Cards",
  "share-ready preview",
  "Share-ready visual only",
  "No real Telegram share/send API",
  "no canvas export",
  "no DB write",
  "calculation logic unchanged",
  "Mystic selection/random/storage changed",
  "VIP preview teaser result card",
  "Package 244 - Telegram WebView Mobile Polish",
]) {
  check(`required wording exists: ${phrase}`, implementationBundle.toLowerCase().includes(phrase.toLowerCase()) || modelText.includes(phrase.toLowerCase()));
}

for (const surface of [
  "Compatibility result card",
  "Direct Birth Matrix summary card",
  "Mini App Birth Matrix summary card",
  "Mystic Daily Card result card",
  "Mystic Tarot result card",
  "Mystic Rune result card",
  "VIP Natal summary card",
  "VIP preview teaser result card",
  "VIP compatibility report teaser card",
  "Design-system preview card",
]) {
  check(`redesigned surface documented: ${surface}`, model.redesignedSurfaces.some((item) => item.area === surface) && implementationBundle.includes(surface));
}

for (const width of ["360px", "390px", "430px"]) {
  check(`mobile breakpoint exists: ${width}`, model.mobileBreakpoints.includes(width) && implementationBundle.includes(width));
}

check("share component exported from design-system index", designIndexSource.includes("AphroditeShareCard") && designIndexSource.includes("AphroditeShareCardProps"));
check("result preview uses share card", resultPreviewSource.includes("AphroditeShareCard") && resultPreviewSource.includes("design-system-preview"));
check("share component is presentational only", !/<button\b|onClick=|useState|useEffect|useRouter|router\.push|fetch\(|navigator\.sendBeacon|localStorage|sessionStorage|window\.Telegram|Telegram\.WebApp|<canvas\b|toDataURL\s*\(|html2canvas\s*\(/i.test(shareCardSource));
check("share component has no active CTA", !/AphroditeButton|href=|buy now|unlock now|pay now|subscribe now/i.test(shareCardSource));
check("no external images in share component", !/<img\b|next\/image|https?:\/\/|fonts\.googleapis/i.test(shareCardSource));

for (const unchanged of [
  "Telegram share/send added",
  "compatibility calculation changed",
  "Birth Matrix/Natal calculation changed",
  "Mystic selection/random/storage changed",
  "payment added",
  "VIP unlock or entitlement bypass added",
  "DB/storage writes added",
  "active CTA logic changed",
]) {
  check(`unchanged scope documented: ${unchanged}`, model.whatWasNotChanged.some((item) => item.area === unchanged) && implementationBundle.includes(unchanged));
}

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA logic change flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no app flow change flag", model.safetyFlags.appFlowsChanged === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no storage write flag", model.safetyFlags.storageWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no entitlement bypass flag", model.safetyFlags.entitlementBypassAdded === false);
check("no cron/workflow/publish flag", model.safetyFlags.cronWorkflowPublishChanged === false);
check("no secrets flag", model.safetyFlags.secretsAdded === false);
check("no production DB connected flag", model.safetyFlags.productionDbConnected === false);
check("publicLaunchApproved flag stays false", model.safetyFlags.publicLaunchApproved === false);
check("ownerManualReviewRequired flag stays true", model.safetyFlags.ownerManualReviewRequired === true);

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

const allowedChanges = new Set([
  "app/birth-matrix/BirthMatrixClient.tsx",
  "app/dashboard/networks/zodiac/page.tsx",
  "app/dashboard/networks/zodiac/critical-mobile-telegram-webview-visual-fixes/page.tsx",
  "app/dashboard/networks/zodiac/result-share-cards/page.tsx",
  "app/globals.css",
  "app/miniapp/page.tsx",
  "app/vip-compatibility-report/VipCompatibilityReportClient.tsx",
  "app/vip-preview/page.tsx",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/ZodiacVipSections.tsx",
  "components/zodiac-mini-app/AphroditeHomeScreen.tsx",
  "components/zodiac-mini-app/MainMenuSections.tsx",
  "components/zodiac-mini-app/MiniAppHeader.tsx",
  "components/zodiac-mini-app/ProfileRetentionPanel.tsx",
  "components/zodiac-mini-app/ResultCards.tsx",
  "components/zodiac-mini-app/SoftLaunchFeedbackPanel.tsx",
  "components/zodiac-mini-app/WizardControls.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeLockedPreviewCard.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeResultCardPreview.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeShareCard.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/index.ts",
  "docs/aphrodite-critical-mobile-telegram-webview-visual-fixes.md",
  "docs/aphrodite-package-reports/package-243.md",
  "docs/aphrodite-package-reports/package-267.md",
  "lib/zodiac/aphrodite-critical-mobile-telegram-webview-visual-fixes.ts",
  "lib/zodiac/aphrodite-final-pre-owner-review-summary.ts",
  "docs/aphrodite-result-share-cards.md",
  "lib/zodiac/aphrodite-result-share-cards.ts",
  "lib/zodiac/zodiac-vip-compatibility-report-foundation.ts",
  "lib/zodiac/zodiac-vip-preview.ts",
  "scripts/qa-aphrodite-birth-matrix-natal-flow-redesign.mjs",
  "scripts/qa-aphrodite-critical-mobile-telegram-webview-visual-fixes.mjs",
  "scripts/qa-aphrodite-final-pre-owner-review-summary.mjs",
  "scripts/qa-aphrodite-mystic-cards-redesign.mjs",
  "scripts/qa-aphrodite-result-share-cards.mjs",
  "scripts/qa-aphrodite-telegram-webview-mobile-polish.mjs",
  "scripts/qa-aphrodite-vip-locked-preview-redesign.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
]);
const unexpectedChanges = changedFiles.filter((file) => !allowedChanges.has(file));
check("only Package 243-scoped files changed", unexpectedChanges.length === 0);
if (unexpectedChanges.length) {
  console.log("Unexpected changed files:", unexpectedChanges.join(", "));
}

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

check("no hardcoded secret-looking values", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,})/i.test(changedBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(changedBundle));
check("no Telegram payment handler implementation", !/pre_checkout\s*[:=]|successful_payment\s*[:=]|answerPreCheckoutQuery\s*\(|createInvoiceLink\s*\(|sendInvoice\s*\(/i.test(changedBundle));
check("no BotFather action implementation", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(changedBundle));
check("no active CTA implementation change", !/activeCtaLogicChanged:\s*true|activeCtaChanged:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(safetyBundle));
check("no production DB client implementation", !/new\s+PrismaClient\b|from ['"]@prisma\/client|postgres\s*\(|neon\s*\(|new\s+Pool\s*\(|new\s+Client\s*\(/i.test(changedBundle));
check("no DB/storage write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert|localStorage\.setItem|sessionStorage\.setItem/i.test(changedBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(changedBundle));
check("no external analytics implementation", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(changedBundle));

console.log(`\nQA complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
