#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_ZODIAC_BRAND_CLEANUP_UNIFIED_INPUT_CONTROLS_ROUTE,
  APHRODITE_ZODIAC_BRAND_CLEANUP_UNIFIED_INPUT_CONTROLS_TITLE,
  getAphroditeZodiacBrandCleanupUnifiedInputControls,
} from "../lib/zodiac/aphrodite-zodiac-brand-cleanup-unified-input-controls.ts";

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

console.log("Starting QA: Aphrodite Zodiac Brand Cleanup + Unified Input Controls...\n");

const modelPath = "../lib/zodiac/aphrodite-zodiac-brand-cleanup-unified-input-controls.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/zodiac-brand-cleanup-unified-input-controls/page.tsx";
const docsPath = "../docs/aphrodite-zodiac-brand-cleanup-unified-input-controls.md";
const reportPath = "../docs/aphrodite-package-reports/package-270.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";
const dateInputPath = "../components/zodiac-mini-app/ZodiacUnifiedDateInput.tsx";
const timeInputPath = "../components/zodiac-mini-app/ZodiacUnifiedTimeInput.tsx";
const cityInputPath = "../components/zodiac-mini-app/ZodiacCityAutocompleteInput.tsx";
const cityCatalogPath = "../data/config/zodiac-city-catalog.json";

const livePaths = [
  "../app/miniapp/page.tsx",
  "../app/birth-matrix/BirthMatrixClient.tsx",
  "../app/miniapp/love-reading-preview/page.tsx",
  "../app/vip-preview/page.tsx",
  "../app/vip-compatibility-report/VipCompatibilityReportClient.tsx",
  "../components/ZodiacCompatibilityMiniApp.tsx",
  "../components/ZodiacMysticSections.tsx",
  "../components/ZodiacVipSections.tsx",
  "../components/zodiac-mini-app/AphroditeHomeScreen.tsx",
  "../components/zodiac-mini-app/AphroditeMiniAppShell.tsx",
  "../components/zodiac-mini-app/MiniAppHeader.tsx",
  "../components/zodiac-mini-app/MainMenuSections.tsx",
  "../components/zodiac-mini-app/feature-tabs.ts",
  "../components/zodiac-mini-app/aphrodite-design-system/AphroditeLockedPreviewCard.tsx",
  "../components/zodiac-mini-app/aphrodite-design-system/AphroditeMysticCardPreview.tsx",
  "../components/zodiac-mini-app/aphrodite-design-system/AphroditeShareCard.tsx",
];

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", dashboardPagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
  ["unified date input", dateInputPath],
  ["unified time input", timeInputPath],
  ["city autocomplete input", cityInputPath],
  ["city catalog", cityCatalogPath],
  ...livePaths.map((path) => [path, path]),
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const dashboardPageSource = exists(dashboardPagePath) ? read(dashboardPagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const dateInputSource = exists(dateInputPath) ? read(dateInputPath) : "";
const timeInputSource = exists(timeInputPath) ? read(timeInputPath) : "";
const cityInputSource = exists(cityInputPath) ? read(cityInputPath) : "";
const cityCatalogSource = exists(cityCatalogPath) ? read(cityCatalogPath) : "";
const liveBundle = livePaths.map((path) => (exists(path) ? read(path) : "")).join("\n");
const implementationBundle = [
  modelSource,
  dashboardPageSource,
  docsSource,
  reportSource,
  dashboardSource,
  dashboardQaSource,
  dateInputSource,
  timeInputSource,
  cityInputSource,
  cityCatalogSource,
  liveBundle,
].join("\n");
const model = getAphroditeZodiacBrandCleanupUnifiedInputControls();

check("title exported", model.title === APHRODITE_ZODIAC_BRAND_CLEANUP_UNIFIED_INPUT_CONTROLS_TITLE);
check("route exported", model.route === APHRODITE_ZODIAC_BRAND_CLEANUP_UNIFIED_INPUT_CONTROLS_ROUTE);
check("package number is 270", model.packageNumber === 270);
check("dashboard page uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_ZODIAC_BRAND_CLEANUP_UNIFIED_INPUT_CONTROLS_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("zodiacBrandCleanupUnifiedInputControls"));
check("docs/report exist", docsSource.includes("Package 270") && reportSource.includes("Package 270"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));

for (const field of [
  "userFacingBrandRules",
  "removedUserFacingAphroditeLabels",
  "removedEnglishLabels",
  "bottomNavFix",
  "compactCatalogRules",
  "unifiedDateInputRules",
  "unifiedTimeInputRules",
  "unifiedCityInputRules",
  "citySuggestionList",
  "affectedFlows",
  "safetyBoundaries",
  "whatWasNotChanged",
  "nextPackageRecommendation",
]) {
  const value = model[field];
  check(`model field exists: ${field}`, (Array.isArray(value) ? value.length > 0 : Boolean(value)) && implementationBundle.includes(field));
}

for (const phrase of [
  "Зодиакальный центр",
  "Зодиак",
  "Мистическая карта",
  "Матрица судьбы",
  "VIP раздел",
  "Preview",
  "Прогноз",
  "Днепр / Дніпро",
  "ZodiacUnifiedDateInput",
  "ZodiacUnifiedTimeInput",
  "ZodiacCityAutocompleteInput",
  "data-zodiac-unified-time-input",
  "data-zodiac-city-autocomplete-input",
  "01012000 -> 01.01.2000",
]) {
  check(`required wording exists: ${phrase}`, implementationBundle.includes(phrase));
}

check("bottom nav uses Прогноз", liveBundle.includes('label: "Прогноз"') && liveBundle.includes('shortLabel: "Прогноз"'));
check("bottom nav does not use short Прогнозы", !liveBundle.includes('shortLabel: "Прогнозы"'));
check("live /miniapp visible badge is Zodiac-facing", liveBundle.includes("<AphroditeBadge tone=\"rose\">Зодиак</AphroditeBadge>"));
check("live shell default eyebrow is Zodiac-facing", liveBundle.includes('eyebrow = "Зодиакальный центр"'));
check("Mystic visible English badges removed", !/revealed rune|Birth Matrix \/ Natal input|personal energy report|Natal birth profile/i.test(liveBundle));
check("known English design labels not visible in live bundle", !/Aphrodite Mini App|>Aphrodite<|premium mystical romantic|Mystic Cards|mystic cards|No active payment|No VIP unlock|Owner review required/i.test(liveBundle));
check("internal Aphrodite names are documented as allowed", modelSource.includes("Internal Aphrodite component names"));
check("unified date wrapper delegates existing date input", dateInputSource.includes("ZodiacDateInput") && dateInputSource.includes("birthDateScope={birthDateScope ?? unifiedScope}"));
check("time input formats HH:MM", timeInputSource.includes("formatUnifiedTimeInput") && timeInputSource.includes("slice(0, 4)") && timeInputSource.includes("data-zodiac-time-input"));
check("city input is local autocomplete", cityInputSource.includes("searchCities") && cityInputSource.includes("onCitySelect") && cityInputSource.includes("data-zodiac-city-input"));
check("city catalog includes Ukrainian aliases", /дніпро|київ|львів|одеса|харків|запоріжжя|черкаси|вінниця|івано-франківськ|тернопіль|чернівці|кривий ріг/i.test(cityCatalogSource));

for (const path of [
  "../components/ZodiacCompatibilityMiniApp.tsx",
  "../components/ZodiacMysticSections.tsx",
  "../components/ZodiacVipSections.tsx",
  "../app/birth-matrix/BirthMatrixClient.tsx",
]) {
  const source = exists(path) ? read(path) : "";
  check(`${path} uses unified date input`, source.includes("ZodiacUnifiedDateInput"));
}

for (const path of [
  "../components/ZodiacCompatibilityMiniApp.tsx",
  "../components/ZodiacVipSections.tsx",
  "../app/birth-matrix/BirthMatrixClient.tsx",
]) {
  const source = exists(path) ? read(path) : "";
  check(`${path} uses unified time input`, source.includes("ZodiacUnifiedTimeInput"));
}

for (const path of [
  "../components/ZodiacCompatibilityMiniApp.tsx",
  "../components/ZodiacVipSections.tsx",
]) {
  const source = exists(path) ? read(path) : "";
  check(`${path} uses city autocomplete input`, source.includes("ZodiacCityAutocompleteInput"));
}

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no calculation flag", model.safetyFlags.calculationsChanged === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no storage write flag", model.safetyFlags.storageWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no entitlement bypass flag", model.safetyFlags.entitlementBypassAdded === false);
check("no cron/workflow/publish flag", model.safetyFlags.cronWorkflowPublishChanged === false);
check("no secrets flag", model.safetyFlags.secretsAdded === false);
check("no production DB flag", model.safetyFlags.productionDbConnected === false);
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

console.log(`\nAphrodite Zodiac Brand Cleanup + Unified Input Controls QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
