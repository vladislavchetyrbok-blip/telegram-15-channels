import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./qa-git-scope.mjs";

function read(rel) {
  return readFileSync(new URL(rel, import.meta.url), "utf8");
}

function exists(rel) {
  return existsSync(new URL(rel, import.meta.url));
}

function hasAll(source, needles) {
  return needles.every((needle) => source.includes(needle));
}

export function runFinalReadinessPackageQa({
  packageNumber,
  slug,
  route,
  title,
  routeKey,
  requiredMarkers,
  allowedExtraFiles = [],
}) {
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

  console.log(`Starting QA: Aphrodite ${title}...\n`);

  const modelPath = `../../lib/zodiac/aphrodite-${slug}.ts`;
  const pagePath = `../../app/dashboard/networks/zodiac/${slug}/page.tsx`;
  const docsPath = `../../docs/aphrodite-${slug}.md`;
  const reportPath = `../../docs/aphrodite-package-reports/package-${packageNumber}.md`;
  const dashboardPath = "../../app/dashboard/networks/zodiac/page.tsx";
  const dashboardQaPath = "../qa-zodiac-dashboard.mjs";

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
  const sharedModelSource = exists("../../lib/zodiac/aphrodite-final-readiness-common.ts")
    ? read("../../lib/zodiac/aphrodite-final-readiness-common.ts")
    : "";
  const sharedPageSource = exists("../../components/zodiac/AphroditeFinalReadinessPage.tsx")
    ? read("../../components/zodiac/AphroditeFinalReadinessPage.tsx")
    : "";
  const implementationBundle = [
    modelSource,
    pageSource,
    docsSource,
    reportSource,
    dashboardSource,
    dashboardQaSource,
    sharedModelSource,
    sharedPageSource,
  ].join("\n");
  const safetyBundle = [modelSource, pageSource, docsSource, reportSource, sharedModelSource, sharedPageSource].join("\n");

  check("title exported", implementationBundle.includes(title));
  check("route exported", implementationBundle.includes(route));
  check(`package number is ${packageNumber}`, implementationBundle.includes(`packageNumber: ${packageNumber}`) || docsSource.includes(`Package ${packageNumber}`));
  check("dashboard page uses final readiness page", pageSource.includes("AphroditeFinalReadinessPage"));
  check("dashboard route linked from overview", dashboardSource.includes(route));
  check("dashboard QA route exists", dashboardQaSource.includes(routeKey));
  check("docs/report exist", docsSource.includes(`Package ${packageNumber}`) && reportSource.includes(`Package ${packageNumber}`));
  check("publicLaunchApproved=false", implementationBundle.includes("publicLaunchApproved=false") && implementationBundle.includes("publicLaunchApproved: false"));
  check("ownerManualReviewRequired=true", implementationBundle.includes("ownerManualReviewRequired=true") && implementationBundle.includes("ownerManualReviewRequired: true"));
  check("soft launch cannot execute now", implementationBundle.includes("Can execute soft launch now: No") && implementationBundle.includes("canExecuteSoftLaunchNow: false"));
  check("manual checks not faked", hasAll(implementationBundle, [
    "backupFreshnessFaked: false",
    "restoreRehearsalFaked: false",
    "ownerApprovalFaked: false",
  ]));
  check("required markers documented", hasAll(implementationBundle, requiredMarkers));
  check("common blockers documented", hasAll(implementationBundle, [
    "DATABASE_URL",
    "TELEGRAM_BOT_TOKEN",
    "APHRODITE_SESSION_SECRET",
    "public app URL",
    "Telegram Mini App URL",
    "backup freshness",
    "restore rehearsal",
    "real-device QA",
    "Telegram WebView/startapp QA",
    "content/CTA owner review",
    "owner explicit approval",
  ]));
  check("ready areas documented", hasAll(implementationBundle, [
    "design sprint",
    "Claude audit",
    "smoke",
    "build",
    "dashboard QA",
    "soft launch scope",
    "preflight docs",
  ]));

  const expectedSafetyFlags = {
    productionLaunchDone: false,
    telegramApiUsed: false,
    messagesSent: false,
    botFatherChanged: false,
    activeCtaLogicChanged: false,
    channelMappingsChanged: false,
    databaseWriteAdded: false,
    dbRestoreExecuted: false,
    externalAnalyticsAdded: false,
    paymentAdded: false,
    vipUnlockAdded: false,
    entitlementBypassAdded: false,
    cronWorkflowPublishChanged: false,
    publishScriptsChanged: false,
    secretsAdded: false,
    productionDbConnected: false,
    backupFreshnessFaked: false,
    restoreRehearsalFaked: false,
    ownerApprovalFaked: false,
    ownerApprovalGranted: false,
    publicLaunchApproved: false,
    ownerManualReviewRequired: true,
  };

  for (const [name, value] of Object.entries(expectedSafetyFlags)) {
    if (name === "ownerManualReviewRequired") {
      check(`${name}=true`, implementationBundle.includes(`${name}: true`));
    } else {
      check(`${name}=false`, implementationBundle.includes(`${name}: false`) || sharedModelSource.includes(`${name}: false`));
    }
  }

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
  const allowedChangedFiles = new Set([
    `lib/zodiac/aphrodite-${slug}.ts`,
    `app/dashboard/networks/zodiac/${slug}/page.tsx`,
    `scripts/qa-aphrodite-${slug}.mjs`,
    `docs/aphrodite-${slug}.md`,
    `docs/aphrodite-package-reports/package-${packageNumber}.md`,
    "app/dashboard/networks/zodiac/page.tsx",
    "scripts/qa-zodiac-dashboard.mjs",
    ...allowedExtraFiles,
  ]);

  check("git scope helper returned real change data", !changedFiles.includes("__git_diff_failed__"));
  check(`only Package ${packageNumber}-scoped files changed`, changedFiles.every((file) => allowedChangedFiles.has(file)));
  check("no workflow/cron changes", gitChangedNames([".github/workflows", "vercel.json"]).length === 0);
  check("publish scripts not changed", gitChangedNames([
    "scripts/publish-zodiac-by-date.mjs",
    "scripts/publish-zodiac-weekly-by-week.mjs",
    "scripts/zodiac-telegram-publisher.mjs",
    "scripts/publish-due.mjs",
    "scripts/publish-due-json.mjs",
  ]).length === 0);
  check("package.json not changed", gitChangedNames(["package.json"]).length === 0);
  check("no DB schema/migration change", gitChangedNames(["prisma", "supabase", "migrations", "schema.prisma"]).length === 0);
  check("no env or secret files changed", gitChangedNames([".env", ".env.local", ".env.example"]).length === 0);
  check("no hardcoded secret-looking values", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,})/i.test(safetyBundle));
  check("no backup/restore execution implementation", !/(spawn|exec|execFileSync|spawnSync)\s*\([^)]*(pg_dump|mysqldump|mongodump|backup|pg_restore|mongorestore|restore)/i.test(safetyBundle));
  check("no production DB client implementation", !/new\s+PrismaClient\b|from ['"]@prisma\/client|postgres\s*\(|neon\s*\(|new\s+Pool\s*\(|new\s+Client\s*\(/i.test(safetyBundle));
  check("no DB write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert/i.test(safetyBundle));
  check("no Telegram API/send code added", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
  check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(safetyBundle));
  check("no entitlement bypass implementation", !/entitlementBypassAdded:\s*true|bypassEntitlement|skipEntitlement|vipUnlockAdded:\s*true/i.test(safetyBundle));
  check("no external analytics implementation", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(safetyBundle));

  console.log(`\nQA complete: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}
