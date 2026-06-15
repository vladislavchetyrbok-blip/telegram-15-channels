import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import process from "process";
import { RUNTIME_DIR, getKyivDate, validateIsoDate } from "./lib/zodiac-autonomy.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    date: getKyivDate(0),
    yearDays: 365,
    outDir: RUNTIME_DIR,
  };
  const errors = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--date") options.date = args[++i] ?? null;
    else if (arg === "--year-days") options.yearDays = Number(args[++i]);
    else if (arg === "--out-dir") options.outDir = args[++i] ?? null;
    else errors.push(`Unknown argument: ${arg}`);
  }

  const dateValidation = validateIsoDate(options.date);
  if (!dateValidation.ok) errors.push(dateValidation.error);
  if (!Number.isInteger(options.yearDays) || options.yearDays <= 0) {
    errors.push("--year-days must be a positive integer.");
  }
  if (!String(options.outDir || "").trim()) {
    errors.push("--out-dir requires a directory path.");
  }

  return { options, errors };
}

function runStep(name, args) {
  console.log(`\n=== ${name} ===`);
  console.log(`> npm ${args.join(" ")}`);
  const startedAt = new Date().toISOString();
  const result = spawnSync("npm", args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  const finishedAt = new Date().toISOString();
  const ok = !result.error && result.status === 0;
  return {
    name,
    ok,
    status: result.status,
    startedAt,
    finishedAt,
    error: result.error ? result.error.message : null,
  };
}

function writePreflightReport(outDir, date, report) {
  const absoluteOutDir = path.resolve(process.cwd(), outDir);
  fs.mkdirSync(absoluteOutDir, { recursive: true });
  const reportPath = path.join(absoluteOutDir, `zodiac-scheduler-preflight-${date}.json`);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return reportPath;
}

function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  const dailyReportPath = path.join(options.outDir, `zodiac-daily-report-${options.date}.json`);
  const steps = [
    ["Weekly Asset Validation", ["run", "zodiac:weekly-assets:validate"]],
    ["Ledger Check", ["run", "zodiac:ledger:check"]],
    ["Year Preflight", ["run", "zodiac:year:preflight", "--", "--from", options.date, "--days", String(options.yearDays)]],
    ["Publish Date Health Check", ["run", "zodiac:publish-date:check", "--", "--date", options.date]],
    ["Dry Publish Simulation", ["run", "zodiac:publish-date:dry", "--", "--date", options.date]],
    ["Autonomy Status", ["run", "zodiac:status", "--", "--date", options.date]],
    ["Daily Report", ["run", "zodiac:report:daily", "--", "--date", options.date, "--out", dailyReportPath]],
  ];

  const report = {
    date: options.date,
    yearDays: options.yearDays,
    expectedYearlyPosts: options.yearDays * 13,
    livePublishCalls: 0,
    telegramApiCalls: 0,
    schedulerCalls: 0,
    dailyReportPath,
    steps: [],
    ok: true,
  };

  for (const [name, args] of steps) {
    const step = runStep(name, args);
    report.steps.push(step);
    if (!step.ok) {
      report.ok = false;
      break;
    }
  }

  const reportPath = writePreflightReport(options.outDir, options.date, report);
  console.log("\n=== Zodiac Scheduler Preflight Summary ===");
  console.log(`Date                 : ${options.date}`);
  console.log(`Year Days            : ${options.yearDays}`);
  console.log(`Expected Yearly Posts: ${report.expectedYearlyPosts}`);
  console.log(`Result               : ${report.ok ? "PASS" : "FAIL"}`);
  console.log(`Report File          : ${reportPath}`);
  console.log(`Daily Report File    : ${dailyReportPath}`);
  console.log("Live Publish Calls   : 0");
  console.log("Telegram API Calls   : 0");
  console.log("==========================================");

  process.exit(report.ok ? 0 : 1);
}

main();
