import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

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
  return readFileSync(resolve(rel), "utf8");
}

function exists(rel) {
  return existsSync(resolve(rel));
}

function resolve(rel) {
  if (rel.startsWith("../")) {
    return new URL("../../" + rel.slice(3), import.meta.url);
  }

  if (rel.startsWith("./")) {
    return new URL("../" + rel.slice(2), import.meta.url);
  }

  return new URL(rel, import.meta.url);
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function splitLines(output) {
  return output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function changedNamesSinceBase(paths) {
  try {
    const base = git(["merge-base", "HEAD", "origin/main"]);
    const committed = splitLines(git(["diff", "--name-only", base, "HEAD", "--", ...paths]));
    const working = splitLines(git(["diff", "--name-only", "HEAD", "--", ...paths]));
    const untracked = splitLines(git(["ls-files", "--others", "--exclude-standard", "--", ...paths]));
    return [...new Set([...committed, ...working, ...untracked])];
  } catch {
    return ["__git_scope_failed__"];
  }
}

function diffSinceBase(paths) {
  try {
    const base = git(["merge-base", "HEAD", "origin/main"]);
    const committed = execFileSync("git", ["diff", "--unified=0", base, "HEAD", "--", ...paths], { encoding: "utf8" });
    const working = execFileSync("git", ["diff", "--unified=0", "HEAD", "--", ...paths], { encoding: "utf8" });
    return committed + "\n" + working;
  } catch {
    return "__git_diff_failed__";
  }
}

export function runAphroditeFinalReadinessPackageQa(config) {
  passed = 0;
  failed = 0;

  console.log(`Starting QA: ${config.title}...\n`);

  for (const [label, path] of [
    ["model", config.modelPath],
    ["dashboard page", config.pagePath],
    ["docs", config.docsPath],
    ["package report", config.reportPath],
    ["dashboard navigation", "../app/dashboard/networks/zodiac/page.tsx"],
    ["dashboard QA", "./qa-zodiac-dashboard.mjs"],
  ]) {
    check(`${label} exists`, exists(path));
  }

  const modelSource = read(config.modelPath);
  const pageSource = read(config.pagePath);
  const docsSource = read(config.docsPath);
  const reportSource = read(config.reportPath);
  const dashboardSource = read("../app/dashboard/networks/zodiac/page.tsx");
  const dashboardQaSource = read("./qa-zodiac-dashboard.mjs");
  const packageBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");
  const diffBundle = diffSinceBase([
    "app/dashboard/networks/zodiac",
    "lib/zodiac",
    "docs",
    "scripts/qa-aphrodite-*.mjs",
    "scripts/lib/qa-aphrodite-post-303-readiness-package.mjs",
    "scripts/qa-zodiac-dashboard.mjs",
  ]);

  check("title matches", config.model.title === config.title);
  check("route matches", config.model.route === config.route);
  check("package number matches", config.model.packageNumber === config.packageNumber);
  check("current main head recorded", config.model.currentMainHead === "97a6c82f98c038f35ab49bede4c7898145b1250c");
  check("status field matches", config.model.statusField === config.statusField);
  check("status value matches", config.model.statusValue === config.statusValue);
  check("status property matches", config.model[config.statusField] === config.statusValue);
  check("dashboard page uses readiness page", pageSource.includes("AphroditeReadinessPage"));
  check("dashboard nav link exists", dashboardSource.includes(config.route));
  check("dashboard QA route exists", dashboardQaSource.includes(config.dashboardRouteKey) && dashboardQaSource.includes(config.route));
  check("docs/report mention package", docsSource.includes(`Package ${config.packageNumber}`) && reportSource.includes(`Package ${config.packageNumber}`));

  check("sections documented", Array.isArray(config.model.sections) && config.model.sections.length >= 2 && packageBundle.includes("sections"));
  check("remaining blockers documented", Array.isArray(config.model.remainingBlockers) && config.model.remainingBlockers.length >= 5 && packageBundle.includes("remainingBlockers"));
  check("safety boundaries documented", Array.isArray(config.model.safetyBoundaries) && config.model.safetyBoundaries.length >= 4 && packageBundle.includes("safetyBoundaries"));
  check("next package documented", packageBundle.includes(config.model.nextPackageRecommendation));

  for (const required of config.requiredStrings) {
    check(`required wording exists: ${required}`, packageBundle.includes(required));
  }

  check("publicLaunchApproved=false", config.model.publicLaunchApproved === false && packageBundle.includes("publicLaunchApproved"));
  check("ownerManualReviewRequired=true", config.model.ownerManualReviewRequired === true && packageBundle.includes("ownerManualReviewRequired"));
  check("readyForProductionLaunch=false", config.model.readyForProductionLaunch === false && packageBundle.includes("readyForProductionLaunch"));
  check("blockers remain open", config.model.blockersRemainOpen === true && packageBundle.includes("blockersRemainOpen"));

  for (const field of config.requiredFalseFields) {
    check(`${field}=false`, config.model[field] === false && packageBundle.includes(field));
  }

  check("no production launch flag", config.model.safetyFlags.productionLaunchDone === false);
  check("no Telegram API flag", config.model.safetyFlags.telegramApiUsed === false);
  check("no messages flag", config.model.safetyFlags.messagesSent === false);
  check("no BotFather flag", config.model.safetyFlags.botFatherChanged === false);
  check("no payment flag", config.model.safetyFlags.paymentAdded === false);
  check("no VIP unlock flag", config.model.safetyFlags.vipUnlockAdded === false);
  check("no entitlement bypass flag", config.model.safetyFlags.entitlementBypassAdded === false);
  check("no DB write flag", config.model.safetyFlags.databaseWriteAdded === false);
  check("no production DB flag", config.model.safetyFlags.productionDbConnected === false);
  check("no external analytics flag", config.model.safetyFlags.externalAnalyticsAdded === false);
  check("no cron/workflow flag", config.model.safetyFlags.cronWorkflowChanged === false);
  check("no secrets flag", config.model.safetyFlags.secretsAdded === false);
  check("no .env.local committed flag", config.model.safetyFlags.envLocalCommitted === false);

  const riskyChangedFiles = changedNamesSinceBase([
    ".github",
    "vercel.json",
    "scripts/publish-zodiac-by-date.mjs",
    "scripts/publish-zodiac-weekly-by-week.mjs",
    "scripts/zodiac-telegram-publisher.mjs",
    "scripts/publish-due.mjs",
    "scripts/publish-due-json.mjs",
    "package.json",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "prisma",
    "supabase",
    "migrations",
    "schema.prisma",
    ".env",
    ".env.local",
    ".env.production",
  ]);
  check("no workflow/cron/package/db/env files changed", riskyChangedFiles.length === 0);
  if (riskyChangedFiles.length) {
    console.log("Unexpected risky changed files:", riskyChangedFiles.join(", "));
  }

  check("no .env.local committed", git(["ls-files", ".env.local"]) === "");
  check("no Telegram API/send code added", !/^\+.*(api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\()/im.test(diffBundle));
  check("no BotFather automation added", !/^\+.*(setChatMenuButton|setMyCommands|setWebhook|deleteWebhook|answerWebAppQuery)/im.test(diffBundle));
  check("no payment added", !/^\+.*(from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|paymentAdded:\s*true)/im.test(diffBundle));
  check("no VIP unlock added", !/^\+.*(createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|vipUnlockAdded:\s*true|productionPaymentAllowedNow=true)/im.test(diffBundle));
  check("no entitlement bypass added", !/^\+.*(entitlementBypassAdded:\s*true|allowed=true|bypassEntitlement|skipEntitlement)/im.test(diffBundle));
  check("no DB write added", !/^\+.*(prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert)/im.test(diffBundle));
  check("no real secrets added", !/^\+.*(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,})/im.test(diffBundle));
  check("launch flags not approved", !/^\+.*(publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false|readyForProductionLaunch:\s*true|readyForLaunch:\s*true)/im.test(diffBundle));
  check("no external analytics added", !/^\+.*(posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon)/im.test(diffBundle));

  console.log(`\n${config.title} QA complete: ${passed} passed, ${failed} failed.`);

  if (failed > 0) {
    process.exit(1);
  }
}
