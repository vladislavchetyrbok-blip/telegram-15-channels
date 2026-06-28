#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_TELEGRAM_WEBVIEW_MOBILE_POLISH_ROUTE,
  APHRODITE_TELEGRAM_WEBVIEW_MOBILE_POLISH_TITLE,
  getAphroditeTelegramWebviewMobilePolish,
} from "../lib/zodiac/aphrodite-telegram-webview-mobile-polish.ts";

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

console.log("Starting QA: Aphrodite Telegram WebView Mobile Polish...\n");

const modelPath = "../lib/zodiac/aphrodite-telegram-webview-mobile-polish.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/telegram-webview-mobile-polish/page.tsx";
const docsPath = "../docs/aphrodite-telegram-webview-mobile-polish.md";
const reportPath = "../docs/aphrodite-package-reports/package-244.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";
const globalsPath = "../app/globals.css";
const miniappPath = "../app/miniapp/page.tsx";
const compatibilityPath = "../components/ZodiacCompatibilityMiniApp.tsx";
const birthMatrixPath = "../app/birth-matrix/BirthMatrixClient.tsx";
const mysticPath = "../components/ZodiacMysticSections.tsx";
const vipSectionsPath = "../components/ZodiacVipSections.tsx";
const resultCardsPath = "../components/zodiac-mini-app/ResultCards.tsx";
const vipPreviewPath = "../app/vip-preview/page.tsx";
const vipReportPagePath = "../app/vip-compatibility-report/page.tsx";
const vipReportClientPath = "../app/vip-compatibility-report/VipCompatibilityReportClient.tsx";
const shellPath = "../components/zodiac-mini-app/AphroditeMiniAppShell.tsx";
const dateInputPath = "../components/zodiac-mini-app/ZodiacDateInput.tsx";
const wizardControlsPath = "../components/zodiac-mini-app/WizardControls.tsx";
const uiPrimitivesPath = "../components/zodiac-mini-app/ui-primitives.tsx";
const designSystemDir = "../components/zodiac-mini-app/aphrodite-design-system";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", dashboardPagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
  ["globals", globalsPath],
  ["miniapp", miniappPath],
  ["compatibility", compatibilityPath],
  ["birth matrix", birthMatrixPath],
  ["mystic", mysticPath],
  ["VIP sections", vipSectionsPath],
  ["result cards", resultCardsPath],
  ["VIP preview", vipPreviewPath],
  ["VIP report page", vipReportPagePath],
  ["VIP report client", vipReportClientPath],
  ["Mini App shell", shellPath],
  ["date input", dateInputPath],
  ["wizard controls", wizardControlsPath],
  ["ui primitives", uiPrimitivesPath],
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const dashboardPageSource = exists(dashboardPagePath) ? read(dashboardPagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const globalsSource = exists(globalsPath) ? read(globalsPath) : "";
const miniappSource = exists(miniappPath) ? read(miniappPath) : "";
const compatibilitySource = exists(compatibilityPath) ? read(compatibilityPath) : "";
const birthMatrixSource = exists(birthMatrixPath) ? read(birthMatrixPath) : "";
const mysticSource = exists(mysticPath) ? read(mysticPath) : "";
const vipSectionsSource = exists(vipSectionsPath) ? read(vipSectionsPath) : "";
const resultCardsSource = exists(resultCardsPath) ? read(resultCardsPath) : "";
const vipPreviewSource = exists(vipPreviewPath) ? read(vipPreviewPath) : "";
const vipReportPageSource = exists(vipReportPagePath) ? read(vipReportPagePath) : "";
const vipReportClientSource = exists(vipReportClientPath) ? read(vipReportClientPath) : "";
const shellSource = exists(shellPath) ? read(shellPath) : "";
const dateInputSource = exists(dateInputPath) ? read(dateInputPath) : "";
const wizardControlsSource = exists(wizardControlsPath) ? read(wizardControlsPath) : "";
const uiPrimitivesSource = exists(uiPrimitivesPath) ? read(uiPrimitivesPath) : "";

const designSystemFiles = [
  "AphroditeBadge.tsx",
  "AphroditeButton.tsx",
  "AphroditeCard.tsx",
  "AphroditeHeroCard.tsx",
  "AphroditeLockedPreviewCard.tsx",
  "AphroditeMetricCard.tsx",
  "AphroditeMysticCardPreview.tsx",
  "AphroditeSectionHeader.tsx",
  "AphroditeShareCard.tsx",
  "AphroditeSurface.tsx",
];
const designSystemBundle = designSystemFiles
  .map((file) => {
    const path = `${designSystemDir}/${file}`;
    return exists(path) ? read(path) : "";
  })
  .join("\n");

const liveBundle = [
  globalsSource,
  miniappSource,
  compatibilitySource,
  birthMatrixSource,
  mysticSource,
  vipSectionsSource,
  resultCardsSource,
  vipPreviewSource,
  vipReportPageSource,
  vipReportClientSource,
  shellSource,
  dateInputSource,
  wizardControlsSource,
  uiPrimitivesSource,
  designSystemBundle,
].join("\n");
const implementationBundle = [
  modelSource,
  dashboardPageSource,
  docsSource,
  reportSource,
  dashboardSource,
  dashboardQaSource,
  liveBundle,
].join("\n");
const changedBundle = [
  modelSource,
  dashboardPageSource,
  docsSource,
  reportSource,
  globalsSource,
  miniappSource,
  compatibilitySource,
  birthMatrixSource,
  mysticSource,
  vipSectionsSource,
  resultCardsSource,
  vipPreviewSource,
  vipReportPageSource,
  vipReportClientSource,
  shellSource,
  dateInputSource,
  wizardControlsSource,
  uiPrimitivesSource,
  designSystemBundle,
].join("\n");
const model = getAphroditeTelegramWebviewMobilePolish();
const modelText = textFor(model);

check("title exported", model.title === APHRODITE_TELEGRAM_WEBVIEW_MOBILE_POLISH_TITLE);
check("route exported", model.route === APHRODITE_TELEGRAM_WEBVIEW_MOBILE_POLISH_ROUTE);
check("package number is 244", model.packageNumber === 244);
check("dashboard route uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_TELEGRAM_WEBVIEW_MOBILE_POLISH_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("telegramWebviewMobilePolish"));
check("docs/report exist", docsSource.includes("Package 244") && reportSource.includes("Package 244"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));

for (const field of [
  "polishedSurfaces",
  "mobileBreakpoints",
  "telegramWebViewRules",
  "safeAreaPrinciples",
  "touchTargetPrinciples",
  "overflowPreventionPrinciples",
  "typographyWrappingPrinciples",
  "componentPolishPrinciples",
  "smokeSensitiveAreas",
  "safetyBoundaries",
  "whatWasNotChanged",
  "nextPackageRecommendation",
]) {
  const value = model[field];
  check(`model field exists: ${field}`, (Array.isArray(value) ? value.length > 0 : Boolean(value)) && implementationBundle.includes(field));
}

for (const surface of ["Home", "Compatibility", "Birth Matrix / Natal", "Mystic Cards", "VIP Preview", "Result Cards", "Shared components and CSS utilities"]) {
  check(`surface documented: ${surface}`, model.polishedSurfaces.some((item) => item.area === surface) && implementationBundle.includes(surface));
}

for (const route of ["/miniapp", "/compatibility", "/birth-matrix", "/vip-preview", "/vip-compatibility-report"]) {
  check(`live route documented: ${route}`, model.liveRoutes.includes(route) && implementationBundle.includes(route));
}

for (const width of ["360px", "390px", "430px"]) {
  check(`mobile breakpoint exists: ${width}`, model.mobileBreakpoints.includes(width) && implementationBundle.includes(width));
}

for (const phrase of [
  "Telegram iOS WebView",
  "Telegram Android WebView",
  "browser fallback",
  "safe-area",
  "touch target",
  "no horizontal overflow",
  "text wrapping",
  "long Russian text",
  "smoke-sensitive flows",
  "Package 245 - Visual QA Screenshot Pack",
]) {
  check(`required wording exists: ${phrase}`, implementationBundle.toLowerCase().includes(phrase.toLowerCase()) || modelText.includes(phrase.toLowerCase()));
}

for (const util of [
  ".aphrodite-mobile-shell",
  ".aphrodite-scroll-safe",
  ".aphrodite-safe-top",
  ".aphrodite-safe-bottom",
  ".aphrodite-touch-target",
  ".aphrodite-wrap-anywhere",
  ".zodiac-miniapp-horizontal-scroll",
]) {
  check(`scoped utility exists: ${util}`, globalsSource.includes(util));
}

for (const marker of [
  'data-aphrodite-telegram-webview-mobile-polish="package-244"',
  "aphrodite-mobile-shell",
  "zodiac-miniapp-safe-area",
  "aphrodite-scroll-safe",
  "aphrodite-touch-target",
  "aphrodite-wrap-anywhere",
  "zodiac-miniapp-horizontal-scroll",
]) {
  check(`mobile polish implementation marker exists: ${marker}`, liveBundle.includes(marker));
}

for (const unchanged of [
  "active CTA logic changed",
  "app flows changed",
  "compatibility calculation changed",
  "Birth Matrix/Natal calculation changed",
  "Mystic selection/random/storage changed",
  "payment added",
  "VIP unlock or entitlement bypass added",
  "DB/storage writes added",
]) {
  check(`unchanged scope documented: ${unchanged}`, model.whatWasNotChanged.some((item) => item.area === unchanged) && implementationBundle.includes(unchanged));
}

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA logic change flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no app flow change flag", model.safetyFlags.appFlowsChanged === false);
check("no compatibility calculation change flag", model.safetyFlags.compatibilityCalculationChanged === false);
check("no Birth Matrix/Natal calculation change flag", model.safetyFlags.birthMatrixNatalCalculationChanged === false);
check("no birth-date parsing change flag", model.safetyFlags.birthDateParsingChanged === false);
check("no Mystic selection/random/storage change flag", model.safetyFlags.mysticSelectionRandomStorageChanged === false);
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
  "app/globals.css",
  "app/miniapp/page.tsx",
  "app/birth-matrix/BirthMatrixClient.tsx",
  "app/vip-preview/page.tsx",
  "app/vip-compatibility-report/page.tsx",
  "app/vip-compatibility-report/VipCompatibilityReportClient.tsx",
  "app/dashboard/networks/zodiac/page.tsx",
  "app/dashboard/networks/zodiac/telegram-webview-mobile-polish/page.tsx",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/ZodiacVipSections.tsx",
  "components/zodiac-mini-app/AphroditeHomeScreen.tsx",
  "components/zodiac-mini-app/AphroditeMiniAppShell.tsx",
  "components/zodiac-mini-app/MainMenuSections.tsx",
  "components/zodiac-mini-app/MiniAppHeader.tsx",
  "components/zodiac-mini-app/ProfileRetentionPanel.tsx",
  "components/zodiac-mini-app/AphroditeSectionCard.tsx",
  "components/zodiac-mini-app/AphroditeStatusPill.tsx",
  "components/zodiac-mini-app/ResultCards.tsx",
  "components/zodiac-mini-app/SoftLaunchFeedbackPanel.tsx",
  "components/zodiac-mini-app/WizardControls.tsx",
  "components/zodiac-mini-app/ZodiacDateInput.tsx",
  "components/zodiac-mini-app/ui-primitives.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeBadge.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeButton.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeCard.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeHeroCard.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeLockedPreviewCard.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeMetricCard.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeMysticCardPreview.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeSectionHeader.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeShareCard.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeSurface.tsx",
  "app/dashboard/networks/zodiac/critical-mobile-telegram-webview-visual-fixes/page.tsx",
  "docs/aphrodite-package-reports/package-244.md",
  "docs/aphrodite-package-reports/package-267.md",
  "docs/aphrodite-critical-mobile-telegram-webview-visual-fixes.md",
  "docs/aphrodite-telegram-webview-mobile-polish.md",
  "lib/zodiac/aphrodite-critical-mobile-telegram-webview-visual-fixes.ts",
  "lib/zodiac/aphrodite-final-pre-owner-review-summary.ts",
  "lib/zodiac/aphrodite-telegram-webview-mobile-polish.ts",
  "lib/zodiac/zodiac-vip-compatibility-report-foundation.ts",
  "lib/zodiac/zodiac-vip-preview.ts",
  "scripts/qa-aphrodite-critical-mobile-telegram-webview-visual-fixes.mjs",
  "scripts/qa-aphrodite-final-pre-owner-review-summary.mjs",
  "scripts/qa-aphrodite-result-share-cards.mjs",
  "scripts/qa-aphrodite-telegram-webview-mobile-polish.mjs",
  "scripts/qa-aphrodite-vip-locked-preview-redesign.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
]);
const unexpectedChanges = changedFiles.filter((file) => !allowedChanges.has(file));
check("only Package 244-scoped files changed", unexpectedChanges.length === 0);
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
check("no active CTA implementation change", !/activeCtaLogicChanged:\s*true|activeCtaChanged:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(changedBundle));
check("no production DB client implementation", !/new\s+PrismaClient\b|from ['"]@prisma\/client|postgres\s*\(|neon\s*\(|new\s+Pool\s*\(|new\s+Client\s*\(/i.test(changedBundle));
check("no DB/storage write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert|localStorage\.setItem|sessionStorage\.setItem/i.test(changedBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(changedBundle));
check("no external analytics implementation", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(changedBundle));

console.log(`\nQA complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
