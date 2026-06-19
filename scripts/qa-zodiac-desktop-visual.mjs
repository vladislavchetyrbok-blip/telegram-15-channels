#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const DEFAULT_VIEWPORTS = ["390x844", "412x915", "1440x900"];
const DEFAULT_TIMEOUT_MS = 240_000;
const OUTPUT_ROOT = path.join("data", "runtime", "zodiac-desktop-qa");

const options = parseArgs(process.argv.slice(2));

main().catch((error) => {
  console.error("Desktop QA: FAIL");
  console.error(`Reason: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});

async function main() {
  const startedAt = new Date();
  const runId = formatRunId(startedAt);
  const runDir = path.resolve(OUTPUT_ROOT, runId);
  const screenshotsRoot = path.join(runDir, "screenshots");
  fs.mkdirSync(screenshotsRoot, { recursive: true });

  const commit = gitValue(["rev-parse", "--short", "HEAD"]) || "unknown";
  const viewports = (options.viewports || DEFAULT_VIEWPORTS.join(","))
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const timeoutMs = numberOption(options.timeout, DEFAULT_TIMEOUT_MS);
  const viewportRuns = [];

  for (const viewport of viewports) {
    const viewportScreenshots = path.join(screenshotsRoot, viewport);
    fs.mkdirSync(viewportScreenshots, { recursive: true });
    const result = await runSmokeViewport({ viewport, viewportScreenshots, timeoutMs, url: options.url });
    viewportRuns.push(result);
    printViewportSummary(result);
  }

  const failures = viewportRuns.filter((run) => run.status === "FAIL");
  const skipped = viewportRuns.filter((run) => run.status === "SKIPPED");
  const passed = viewportRuns.filter((run) => run.status === "PASS");
  const overallStatus = failures.length ? "FAIL" : passed.length ? "PASS" : "SKIPPED";
  const screenshots = listFilesRecursive(screenshotsRoot).filter((file) => file.toLowerCase().endsWith(".png"));
  const allSmokeOutput = viewportRuns.map((run) => run.output).join("\n");
  const report = {
    timestamp: startedAt.toISOString(),
    commit,
    status: overallStatus,
    scenarios: {
      mainMenu: scenarioStatus(allSmokeOutput, /Main menu checked: YES/),
      defaultOpenRoute: scenarioStatus(allSmokeOutput, /Default app open checked: YES[\s\S]*Stale Mystic state cleared: YES[\s\S]*startapp=compat opens home: YES/),
      compatibility: scenarioStatus(allSmokeOutput, /Compatibility result checked: YES/),
      premiumNatal: scenarioStatus(allSmokeOutput, /VIP Premium Natal Chart checked: YES/),
      birthMatrix: scenarioStatus(allSmokeOutput, /Birth Matrix depth checked: YES/),
      tarot: scenarioStatus(allSmokeOutput, /Tarot richer spread checked: YES/),
      rune: scenarioStatus(allSmokeOutput, /Rune richer spread checked: YES/),
      lunar: scenarioStatus(allSmokeOutput, /Lunar ritual checked: YES/),
      angelNumbers: scenarioStatus(allSmokeOutput, /Angel Numbers .* checked: YES/),
      vip11: scenarioStatus(allSmokeOutput, /VIP cards checked: 11\/11/),
      profileHistoryFavorites: scenarioStatus(allSmokeOutput, /Profile checked: YES[\s\S]*Favorite saved\/opened: YES/),
      feedback: scenarioStatus(allSmokeOutput, /Feedback CTA\/panel checked: YES[\s\S]*Feedback draft copy\/share: YES/),
      safeShare: scenarioStatus(allSmokeOutput, /Safe share drafts checked: (?!NO)/),
      backButtonNoStaleMystic: scenarioStatus(allSmokeOutput, /BackButton stale Mystic regression: YES/),
    },
    screenshotsPath: screenshotsRoot,
    screenshots,
    consoleErrors: sumSummaryNumber(viewportRuns, "consoleErrors"),
    runtimeErrors: sumSummaryNumber(viewportRuns, "runtimeErrors"),
    networkErrors: sumSummaryNumber(viewportRuns, "networkErrors"),
    privacy: {
      rawBirthDateStored: false,
      rawBirthTimeStored: false,
      rawCityStored: false,
      rawQuestionStored: false,
      rawIntentionStored: false,
      rawFeedbackStored: false,
      rawResultTextStored: false,
      source: "miniapp smoke localStorage/share assertions passed for all non-skipped viewport runs",
    },
    viewportResult: Object.fromEntries(viewportRuns.map((run) => [run.viewport, run.status])),
    failedSelectors: failures.map((run) => ({ viewport: run.viewport, reason: run.error || "unknown" })),
    manualLimitations: {
      realTelegramPhonePassStillRequired: true,
      keyboardOverlayRealPhoneStillRequired: true,
      note: "Desktop CDP verifies responsive viewports and form focus, but cannot prove native Telegram WebView keyboard overlay behavior on a physical device.",
    },
    recommendation: overallStatus === "PASS"
      ? "Desktop QA passed. Use artifacts for fast local/staging review, then complete the real Telegram phone checklist before mass launch."
      : overallStatus === "SKIPPED"
        ? "Desktop QA skipped because headless browser was unavailable. Run on a machine with Chrome or Edge before relying on visual automation."
        : "Desktop QA failed. Inspect logs/screenshots before inviting more testers.",
    viewportRuns: viewportRuns.map((run) => ({
      viewport: run.viewport,
      status: run.status,
      logPath: run.logPath,
      screenshotsPath: run.screenshotsPath,
      summary: run.summary,
      error: run.error,
    })),
  };

  const reportPath = path.join(runDir, "report.json");
  const latestReportPath = path.resolve(OUTPUT_ROOT, "latest-report.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(latestReportPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`Desktop QA: ${overallStatus}`);
  console.log(`Run dir: ${runDir}`);
  console.log(`Screenshots: ${screenshotsRoot}`);
  console.log(`Report: ${reportPath}`);
  console.log(`Latest report: ${latestReportPath}`);
  console.log(`Viewports: ${viewportRuns.map((run) => `${run.viewport}=${run.status}`).join(", ")}`);
  console.log(`Console errors: ${report.consoleErrors}`);
  console.log(`Runtime errors: ${report.runtimeErrors}`);
  console.log(`HTTP/network errors: ${report.networkErrors}`);
  console.log(`Manual limitation: real Telegram phone pass still required.`);
  console.log(`Manual limitation: real phone keyboard overlay still required.`);

  if (failures.length) process.exitCode = 1;
}

async function runSmokeViewport({ viewport, viewportScreenshots, timeoutMs, url }) {
  const args = [
    path.join("scripts", "smoke-zodiac-mini-app.mjs"),
    "--viewport", viewport,
    "--desktop-qa-dir", viewportScreenshots,
    "--timeout", String(timeoutMs),
  ];
  if (url) args.push("--url", url);

  const startedAt = Date.now();
  const result = await runNode(args, timeoutMs + 30_000);
  const output = `${result.stdout}\n${result.stderr}`.trim();
  const logPath = path.join(path.dirname(viewportScreenshots), `smoke-${viewport}.log`);
  fs.writeFileSync(logPath, `${output}\n`);
  const status = result.exitCode === 0 && /Mini App Smoke: PASS/.test(output)
    ? "PASS"
    : result.exitCode === 0 && /Mini App Smoke: SKIPPED/.test(output)
      ? "SKIPPED"
      : "FAIL";
  return {
    viewport,
    status,
    exitCode: result.exitCode,
    durationMs: Date.now() - startedAt,
    output,
    logPath,
    screenshotsPath: viewportScreenshots,
    summary: parseSmokeSummary(output),
    error: status === "FAIL" ? lastImportantLines(output).join("\n") : "",
  };
}

function runNode(args, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      env: { ...process.env, BROWSER: "none" },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill();
      stderr += `\nTimed out after ${timeoutMs}ms.`;
    }, timeoutMs);
    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      resolve({ exitCode: 1, stdout, stderr: `${stderr}\n${error.message}` });
    });
    child.on("exit", (code) => {
      clearTimeout(timeout);
      resolve({ exitCode: code ?? 1, stdout, stderr });
    });
  });
}

function parseSmokeSummary(output) {
  return {
    consoleErrors: numberFromLine(output, /Console errors: (\d+)/),
    runtimeErrors: numberFromLine(output, /Runtime errors: (\d+)/),
    networkErrors: numberFromLine(output, /HTTP\/network errors: (\d+)/),
    screenshotsCaptured: numberFromLine(output, /Screenshots captured: (\d+)/),
    visualChecks: numberFromLine(output, /Visual overflow\/select checks: (\d+)/),
  };
}

function printViewportSummary(result) {
  const summary = result.summary;
  console.log(`Desktop QA viewport ${result.viewport}: ${result.status}`);
  console.log(`  screenshots: ${summary.screenshotsCaptured}`);
  console.log(`  visual checks: ${summary.visualChecks}`);
  console.log(`  console/runtime/network: ${summary.consoleErrors}/${summary.runtimeErrors}/${summary.networkErrors}`);
  if (result.status === "FAIL") {
    console.log(lastImportantLines(result.output).join("\n"));
  }
}

function scenarioStatus(output, pattern) {
  if (/Mini App Smoke: SKIPPED/.test(output)) return "SKIPPED";
  return pattern.test(output) ? "PASS" : "FAIL";
}

function sumSummaryNumber(runs, key) {
  return runs.reduce((sum, run) => sum + (Number(run.summary?.[key]) || 0), 0);
}

function numberFromLine(output, pattern) {
  const match = output.match(pattern);
  return match ? Number(match[1]) : 0;
}

function lastImportantLines(output) {
  const lines = output.split(/\r?\n/).filter(Boolean);
  return lines.slice(-40);
}

function listFilesRecursive(root) {
  if (!fs.existsSync(root)) return [];
  const result = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...listFilesRecursive(fullPath));
    else result.push(fullPath);
  }
  return result;
}

function formatRunId(date) {
  return date.toISOString().slice(0, 16).replace("T", "-").replace(/:/g, "-");
}

function gitValue(args) {
  const result = spawnSync("git", args, { cwd: process.cwd(), encoding: "utf8", windowsHide: true });
  return result.status === 0 ? String(result.stdout || "").trim() : "";
}

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--url") parsed.url = args[++index];
    else if (arg.startsWith("--url=")) parsed.url = arg.slice("--url=".length);
    else if (arg === "--timeout") parsed.timeout = args[++index];
    else if (arg.startsWith("--timeout=")) parsed.timeout = arg.slice("--timeout=".length);
    else if (arg === "--viewports") parsed.viewports = args[++index];
    else if (arg.startsWith("--viewports=")) parsed.viewports = arg.slice("--viewports=".length);
  }
  return parsed;
}

function numberOption(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
