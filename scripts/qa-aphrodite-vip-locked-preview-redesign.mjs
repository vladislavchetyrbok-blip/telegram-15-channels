#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_VIP_LOCKED_PREVIEW_REDESIGN_ROUTE,
  APHRODITE_VIP_LOCKED_PREVIEW_REDESIGN_TITLE,
  getAphroditeVipLockedPreviewRedesign,
} from "../lib/zodiac/aphrodite-vip-locked-preview-redesign.ts";

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

console.log("Starting QA: Aphrodite VIP Locked Preview Redesign...\n");

const modelPath = "../lib/zodiac/aphrodite-vip-locked-preview-redesign.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/vip-locked-preview-redesign/page.tsx";
const lockedPreviewComponentPath = "../components/zodiac-mini-app/aphrodite-design-system/AphroditeLockedPreviewCard.tsx";
const designSystemIndexPath = "../components/zodiac-mini-app/aphrodite-design-system/index.ts";
const homePath = "../components/zodiac-mini-app/AphroditeHomeScreen.tsx";
const miniappPagePath = "../app/miniapp/page.tsx";
const compatibilityResultPath = "../components/zodiac-mini-app/ResultCards.tsx";
const mysticSectionsPath = "../components/ZodiacMysticSections.tsx";
const vipSectionsPath = "../components/ZodiacVipSections.tsx";
const birthMatrixRoutePath = "../app/birth-matrix/BirthMatrixClient.tsx";
const vipCompatibilityReportPath = "../app/vip-compatibility-report/VipCompatibilityReportClient.tsx";
const vipPreviewPath = "../app/vip-preview/page.tsx";
const docsPath = "../docs/aphrodite-vip-locked-preview-redesign.md";
const reportPath = "../docs/aphrodite-package-reports/package-242.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", dashboardPagePath],
  ["locked preview component", lockedPreviewComponentPath],
  ["design system index", designSystemIndexPath],
  ["home component", homePath],
  ["miniapp page", miniappPagePath],
  ["compatibility result cards", compatibilityResultPath],
  ["mystic sections", mysticSectionsPath],
  ["VIP sections", vipSectionsPath],
  ["birth matrix route", birthMatrixRoutePath],
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
const componentSource = exists(lockedPreviewComponentPath) ? read(lockedPreviewComponentPath) : "";
const designIndexSource = exists(designSystemIndexPath) ? read(designSystemIndexPath) : "";
const homeSource = exists(homePath) ? read(homePath) : "";
const miniappPageSource = exists(miniappPagePath) ? read(miniappPagePath) : "";
const compatibilitySource = exists(compatibilityResultPath) ? read(compatibilityResultPath) : "";
const mysticSource = exists(mysticSectionsPath) ? read(mysticSectionsPath) : "";
const vipSectionsSource = exists(vipSectionsPath) ? read(vipSectionsPath) : "";
const birthMatrixSource = exists(birthMatrixRoutePath) ? read(birthMatrixRoutePath) : "";
const vipCompatibilityReportSource = exists(vipCompatibilityReportPath) ? read(vipCompatibilityReportPath) : "";
const vipPreviewSource = exists(vipPreviewPath) ? read(vipPreviewPath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";

const model = getAphroditeVipLockedPreviewRedesign();
const liveBundle = [
  componentSource,
  designIndexSource,
  homeSource,
  miniappPageSource,
  compatibilitySource,
  mysticSource,
  vipSectionsSource,
  birthMatrixSource,
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
  liveBundle,
  docsSource,
  reportSource,
].join("\n");
const modelText = textFor(model);

check("title exported", model.title === APHRODITE_VIP_LOCKED_PREVIEW_REDESIGN_TITLE);
check("route exported", model.route === APHRODITE_VIP_LOCKED_PREVIEW_REDESIGN_ROUTE);
check("package number is 242", model.packageNumber === 242);
check("dashboard route uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_VIP_LOCKED_PREVIEW_REDESIGN_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("vipLockedPreviewRedesign"));
check("docs/report exist", docsSource.includes("Package 242") && reportSource.includes("Package 242"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));

for (const field of [
  "redesignedSurfaces",
  "vipPreviewPrinciples",
  "lockedStatePrinciples",
  "valueLadderPreview",
  "safetyCopy",
  "mobileBreakpoints",
  "telegramWebViewRules",
  "safetyBoundaries",
  "whatWasNotChanged",
  "nextPackageRecommendation",
]) {
  const value = model[field];
  check(`model field exists: ${field}`, (Array.isArray(value) ? value.length > 0 : Boolean(value)) && implementationBundle.includes(field));
}

for (const route of ["/miniapp", "/compatibility", "/birth-matrix", "/vip-compatibility-report", "/vip-preview"]) {
  check(`live route documented: ${route}`, model.liveRoutes.includes(route) && implementationBundle.includes(route));
}

for (const marker of [
  'data-aphrodite-vip-locked-preview-redesign="package-242"',
  "data-aphrodite-vip-locked-scope",
  "data-aphrodite-compatibility-vip-preview=\"package-239\"",
  "data-aphrodite-birth-matrix-vip-preview=\"package-240\"",
  "data-aphrodite-natal-vip-preview=\"package-240\"",
  "data-aphrodite-mystic-card-vip-preview=\"package-241\"",
]) {
  check(`VIP locked marker exists: ${marker}`, liveBundle.includes(marker));
}

for (const scope of [
  "home",
  "miniapp-entry",
  "compatibility",
  "miniapp-matrix",
  "birth-matrix",
  "mystic",
  "vip-natal",
  "vip-compatibility-report",
  "vip-preview-index",
]) {
  check(`scope documented and used: ${scope}`, model.redesignedSurfaces.some((item) => item.scope === scope) && implementationBundle.includes(scope));
}

for (const variant of ["general", "home", "compatibility", "birthMatrix", "mystic", "natal"]) {
  check(`component variant exists: ${variant}`, componentSource.includes(`"${variant}"`) && liveBundle.includes(`variant="${variant}"`));
}

for (const phrase of [
  "AphroditeLockedPreviewCard",
  "preview-only",
  "VIP locked preview",
  "No active payment",
  "No real VIP unlock",
  "No entitlement bypass",
  "no active payment",
  "no real VIP unlock",
  "entitlement bypass not added",
  "Deep compatibility report",
  "Relationship calendar",
  "Birth Matrix Pro",
  "Mystic deep reading",
  "Natal profile",
  "Personal advice",
  "Shareable premium card",
]) {
  check(`VIP locked phrase exists: ${phrase}`, implementationBundle.toLowerCase().includes(phrase.toLowerCase()) || modelText.includes(phrase.toLowerCase()));
}

for (const width of ["360px", "390px", "430px"]) {
  check(`mobile breakpoint exists: ${width}`, model.mobileBreakpoints.includes(width) && implementationBundle.includes(width));
}

check("component exported from design-system index", designIndexSource.includes("AphroditeLockedPreviewCard") && designIndexSource.includes("AphroditeLockedPreviewVariant"));
check("component is presentational only", !/onPay|onUnlock|onPurchase|onSubscribe|href=|useState|useEffect|useRouter|router\.push|fetch\(|navigator\.sendBeacon|localStorage|sessionStorage/i.test(componentSource));
check("component has no active payment-looking button", !/AphroditeButton|<button\b|buy now|unlock now|pay now|subscribe now/i.test(componentSource));
check("no active payment prop contract", !/onPay|onUnlock|sendInvoice|createInvoiceLink|entitlement check/i.test(componentSource));

for (const surface of [
  "Mini App home screen locked preview",
  "Static Mini App entry locked preview",
  "Compatibility result VIP preview",
  "Birth Matrix Pro preview in Mini App",
  "Direct Birth Matrix page preview",
  "Mystic Cards deeper reading preview",
  "VIP Natal preview",
  "VIP Compatibility report preview page",
  "VIP Preview index",
]) {
  check(`redesigned surface documented: ${surface}`, model.redesignedSurfaces.some((item) => item.area === surface) && implementationBundle.includes(surface));
}

for (const unchanged of [
  "active CTA logic unchanged",
  "app flows unchanged",
  "payment not added",
  "VIP unlock not added",
  "entitlement bypass not added",
  "Telegram API not used",
  "DB/storage not changed",
]) {
  check(`unchanged scope documented: ${unchanged}`, model.whatWasNotChanged.some((item) => item.area === unchanged) && implementationBundle.includes(unchanged));
}

check("next package recommendation documented", model.nextPackageRecommendation === "Package 243 - Result / Share Cards" && implementationBundle.includes("Package 243 - Result / Share Cards"));

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
  ".env.local",
  ".env.production",
  ".env.example",
]);
const allowedChanges = new Set([
  "app/birth-matrix/BirthMatrixClient.tsx",
  "app/dashboard/networks/zodiac/page.tsx",
  "app/dashboard/networks/zodiac/critical-mobile-telegram-webview-visual-fixes/page.tsx",
  "app/dashboard/networks/zodiac/result-share-cards/page.tsx",
  "app/dashboard/networks/zodiac/vip-locked-preview-redesign/page.tsx",
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
  "lib/zodiac/aphrodite-critical-mobile-telegram-webview-visual-fixes.ts",
  "lib/zodiac/aphrodite-final-pre-owner-review-summary.ts",
  "lib/zodiac/aphrodite-result-share-cards.ts",
  "lib/zodiac/aphrodite-vip-locked-preview-redesign.ts",
  "lib/zodiac/zodiac-vip-compatibility-report-foundation.ts",
  "lib/zodiac/zodiac-vip-preview.ts",
  "scripts/qa-aphrodite-critical-mobile-telegram-webview-visual-fixes.mjs",
  "scripts/qa-aphrodite-final-pre-owner-review-summary.mjs",
  "scripts/qa-aphrodite-result-share-cards.mjs",
  "scripts/qa-aphrodite-telegram-webview-mobile-polish.mjs",
  "scripts/qa-aphrodite-vip-locked-preview-redesign.mjs",
  "scripts/qa-aphrodite-design-system.mjs",
  "scripts/qa-aphrodite-miniapp-home-screen-redesign.mjs",
  "scripts/qa-aphrodite-compatibility-flow-redesign.mjs",
  "scripts/qa-aphrodite-birth-matrix-natal-flow-redesign.mjs",
  "scripts/qa-aphrodite-mystic-cards-redesign.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
  "docs/aphrodite-critical-mobile-telegram-webview-visual-fixes.md",
  "docs/aphrodite-result-share-cards.md",
  "docs/aphrodite-vip-locked-preview-redesign.md",
  "docs/aphrodite-package-reports/package-242.md",
  "docs/aphrodite-package-reports/package-243.md",
  "docs/aphrodite-package-reports/package-267.md",
]);
check("git scope helper returned real change data", !changedFiles.includes("__git_diff_failed__"));
check("changed files limited to Package 242 visual/readiness scope", changedFiles.every((file) => allowedChanges.has(file)));
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

console.log(`\nAphrodite VIP Locked Preview Redesign QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
