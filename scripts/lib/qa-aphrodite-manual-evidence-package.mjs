import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { getAphroditeManualEvidencePackage } from "../../lib/zodiac/aphrodite-manual-evidence-readiness-registry.ts";
import { gitChangedNames } from "./qa-git-scope.mjs";

function read(rel) {
  return readFileSync(new URL(rel, import.meta.url), "utf8");
}

function exists(rel) {
  return existsSync(new URL(rel, import.meta.url));
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

export async function runManualEvidencePackageQa(config) {
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

  console.log(`Starting QA: ${config.title}...\n`);

  const modelPath = `../../lib/zodiac/${config.slug}.ts`;
  const pagePath = `../../app/dashboard/networks/zodiac/${config.routeSlug}/page.tsx`;
  const docsPath = `../../docs/${config.slug}.md`;
  const reportPath = `../../docs/aphrodite-package-reports/package-${config.packageNumber}.md`;
  const registryPath = "../../lib/zodiac/aphrodite-manual-evidence-readiness-registry.ts";
  const dashboardPath = "../../app/dashboard/networks/zodiac/page.tsx";
  const dashboardQaPath = "../qa-zodiac-dashboard.mjs";

  for (const [label, itemPath] of [
    ["model", modelPath],
    ["dashboard page", pagePath],
    ["docs", docsPath],
    ["package report", reportPath],
    ["dashboard navigation", dashboardPath],
    ["dashboard QA", dashboardQaPath],
  ]) {
    check(`${label} exists`, exists(itemPath));
  }

  const model = getAphroditeManualEvidencePackage(config.packageNumber);
  const modelSource = exists(modelPath) ? read(modelPath) : "";
  const pageSource = exists(pagePath) ? read(pagePath) : "";
  const docsSource = exists(docsPath) ? read(docsPath) : "";
  const reportSource = exists(reportPath) ? read(reportPath) : "";
  const registrySource = exists(registryPath) ? read(registryPath) : "";
  const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
  const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
  const implementationBundle = [modelSource, pageSource, docsSource, reportSource, registrySource, dashboardSource, dashboardQaSource].join("\n");

  check("title matches", model.title === config.title);
  check("route matches", model.route === config.route);
  check("package number matches", model.packageNumber === config.packageNumber);
  check("current main head recorded", model.currentMainHead === "f79d79e8c1cfc86129b176f33b35476c0f1f798f");
  check("dashboard page uses readiness page", pageSource.includes("AphroditeReadinessPage") || pageSource.includes("AphroditeManualEvidencePackagePage"));
  check("dashboard nav link exists", dashboardSource.includes(config.route));
  check("dashboard QA route exists", dashboardQaSource.includes(config.routeKey));
  check("docs/report mention package", docsSource.includes(`Package ${config.packageNumber}`) && reportSource.includes(`Package ${config.packageNumber}`));

  for (const [key, expected] of Object.entries(config.statuses)) {
    check(`${key} status/value`, model[key] === expected);
    check(`${key} documented`, implementationBundle.includes(key) && implementationBundle.includes(String(expected)));
  }

  check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
  check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));
  check("softLaunchStatus=NO documented", model.softLaunchStatusNo === "NO" && implementationBundle.includes("softLaunchStatus=NO"));
  check("blockers remain open", model.blockersRemainOpen === true && implementationBundle.includes("blockers remain open"));

  for (const phrase of config.requiredPhrases) {
    check(`required wording exists: ${phrase}`, implementationBundle.includes(phrase));
  }

  check("evidence required documented", model.evidenceRequired.length > 0 && implementationBundle.includes("Evidence Required"));
  check("manual actions documented", model.manualActions.length > 0 && implementationBundle.includes("Manual Actions"));
  check("safety boundaries documented", model.safetyBoundaries.length > 0 && implementationBundle.includes("Safety"));
  check("next package documented", implementationBundle.includes(model.nextPackageRecommendation));

  check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
  check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
  check("no messages flag", model.safetyFlags.messagesSent === false);
  check("no BotFather flag", model.safetyFlags.botFatherChanged === false);
  check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
  check("no production DB connection flag", model.safetyFlags.productionDbConnected === false);
  check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
  check("no payment flag", model.safetyFlags.paymentAdded === false);
  check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
  check("no cron/workflow flag", model.safetyFlags.cronWorkflowChanged === false);
  check("no secrets flag", model.safetyFlags.secretsAdded === false);
  check("no .env.local committed flag", model.safetyFlags.envLocalCommitted === false);
  check("no false blocker closure flag", model.safetyFlags.blockersClosedWithoutEvidence === false);

  const riskyChangedFiles = gitChangedNames([
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
  check("no cron/workflow/publish/package/db/env files changed", riskyChangedFiles.length === 0);
  if (riskyChangedFiles.length) {
    console.log("Unexpected risky changed files:", riskyChangedFiles.join(", "));
  }

  check("no .env.local committed", git(["ls-files", ".env.local"]) === "");
  check("no real DATABASE_URL value committed", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/)/i.test(implementationBundle));
  check("no real TELEGRAM_BOT_TOKEN value committed", !/(https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b)/i.test(implementationBundle));
  check("no real secrets committed", !/(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,}/i.test(implementationBundle));
  check("no Telegram API/send code added", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
  check("no BotFather automation added", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook|answerWebAppQuery/i.test(implementationBundle));
  check("no DB write added", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert|localStorage\.setItem|sessionStorage\.setItem/i.test(implementationBundle));
  check("no payment added", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(/i.test(implementationBundle));
  check("no VIP unlock added", !/createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
  check("launch flags not approved", !/publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false|readyForProductionLaunch:\s*true|readyForLaunch:\s*true/i.test(implementationBundle));
  check("no external analytics added", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(implementationBundle));

  console.log(`\n${config.title} QA complete: ${passed} passed, ${failed} failed.`);

  if (failed > 0) {
    process.exit(1);
  }
}
