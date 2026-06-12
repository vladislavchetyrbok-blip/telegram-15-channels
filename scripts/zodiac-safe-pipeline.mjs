import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import process from "process";

function parseArgs() {
  const args = process.argv.slice(2);
  let startDate = new Date().toISOString().split("T")[0];
  let days = 7;
  let style = "luxury-mystic";
  let skipReview = false;
  let skipDryRun = false;
  let enhance = false;
  let rewriteWeak = false;
  let rewriteThreshold = 70;
  let limit = Infinity;
  let jsonOutput = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--start-date" && args[i + 1]) {
      startDate = args[i + 1];
      i++;
    } else if (arg === "--days" && args[i + 1]) {
      days = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--style" && args[i + 1]) {
      style = args[i + 1];
      i++;
    } else if (arg === "--skip-review") {
      skipReview = true;
    } else if (arg === "--skip-dry-run") {
      skipDryRun = true;
    } else if (arg === "--enhance") {
      enhance = true;
    } else if (arg === "--rewrite-weak") {
      rewriteWeak = true;
    } else if (arg === "--rewrite-threshold" && args[i + 1]) {
      rewriteThreshold = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--limit" && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--json") {
      jsonOutput = true;
    }
  }

  return { startDate, days, style, skipReview, skipDryRun, enhance, rewriteWeak, rewriteThreshold, limit, jsonOutput };
}

function runCommand(command, args) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) {
    throw new Error(`Command failed with status ${result.status}`);
  }
}

function runCommandCapture(command, args) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { stdio: ["pipe", "pipe", "pipe"], shell: process.platform === "win32", encoding: 'utf-8' });
  if (result.status !== 0) {
    throw new Error(`Command failed with status ${result.status}\n\nSTDOUT: ${result.stdout}\nSTDERR: ${result.stderr}`);
  }
  return result.stdout;
}

function run() {
  const { startDate, days, style, skipReview, skipDryRun, enhance, rewriteWeak, rewriteThreshold, limit, jsonOutput } = parseArgs();

  const report = {
    ok: true,
    startDate,
    days,
    style,
    generatedPlanPath: null,
    finalPlanPath: null,
    reviewReportPath: null,
    steps: [],
    warnings: [],
    blockingIssues: []
  };

  const addStep = (name, status) => { report.steps.push({ name, status }); };
  const fail = (issue) => { report.blockingIssues.push(issue); report.ok = false; };

  try {
    // 1. Generate Plan
    addStep("Generate Plan", "started");
    const generateArgs = ["run", "zodiac:generate-plan", "--", "--start-date", startDate, "--days", String(days), "--style", style];
    // We capture stdout to find the generated file path easily, but the script prints it cleanly.
    // Wait, let's just use predictable paths: exports/zodiac-weekly-plan-YYYY-MM-DD.json
    let currentPlan = `./exports/zodiac-weekly-plan-${startDate}.json`;
    runCommand("npm", generateArgs);
    report.generatedPlanPath = currentPlan;
    report.finalPlanPath = currentPlan;
    addStep("Generate Plan", "passed");

    // 2. Validate
    addStep("Validate Initial Plan", "started");
    runCommand("npm", ["run", "zodiac:validate-plan", "--", currentPlan]);
    addStep("Validate Initial Plan", "passed");

    // Optional Enhance
    if (enhance) {
      addStep("Enhance Plan (LM Studio)", "started");
      const enhanceArgs = ["run", "zodiac:enhance-plan", "--", currentPlan];
      if (limit !== Infinity) { enhanceArgs.push("--limit", String(limit)); }
      runCommand("npm", enhanceArgs);
      currentPlan = currentPlan.replace(/\.json$/, "-enhanced.json");
      report.finalPlanPath = currentPlan;
      addStep("Enhance Plan (LM Studio)", "passed");

      addStep("Validate Enhanced Plan", "started");
      runCommand("npm", ["run", "zodiac:validate-plan", "--", currentPlan]);
      addStep("Validate Enhanced Plan", "passed");
    }

    // Optional Rewrite
    if (rewriteWeak) {
      addStep("Rewrite Weak Posts (LM Studio)", "started");
      const rewriteArgs = ["run", "zodiac:rewrite-weak", "--", currentPlan, "--threshold", String(rewriteThreshold)];
      if (limit !== Infinity) { rewriteArgs.push("--limit", String(limit)); }
      runCommand("npm", rewriteArgs);
      currentPlan = currentPlan.replace(/\.json$/, "-rewritten.json");
      report.finalPlanPath = currentPlan;
      addStep("Rewrite Weak Posts (LM Studio)", "passed");

      addStep("Validate Rewritten Plan", "started");
      runCommand("npm", ["run", "zodiac:validate-plan", "--", currentPlan]);
      addStep("Validate Rewritten Plan", "passed");
    }

    // 3. Review
    if (!skipReview) {
      addStep("Editorial Review", "started");
      const mdReport = currentPlan.replace(/\.json$/, "-review.md");
      report.reviewReportPath = mdReport;
      runCommand("npm", ["run", "zodiac:review-plan", "--", currentPlan, "--out", mdReport]);
      addStep("Editorial Review", "passed");
    }

    // 4. Dry-Run
    if (!skipDryRun) {
      addStep("Dry-Run Publisher", "started");
      runCommand("npm", ["run", "zodiac:dry-run", "--", currentPlan]);
      addStep("Dry-Run Publisher", "passed");
    }

    // 5. Live Publish (Guarded)
    const isLive = process.argv.includes("--live") || process.env.TELEGRAM_LIVE_PUBLISH === "true";
    if (isLive) {
      addStep("Live Publisher", "started");
      // Actually we don't have a live zodiac publisher script yet, so we just log it or fail gracefully.
      console.log("\n[WARN] Live publishing is currently not implemented for Zodiac pipeline.");
      addStep("Live Publisher", "skipped");
    }

  } catch (err) {
    fail(err.message);
    if (!jsonOutput) {
      console.error(`\nPipeline failed: ${err.message}`);
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.ok ? 0 : 1);
  }

  console.log(`\n=== Zodiac Safe Pipeline Result ===`);
  console.log(`Start date: ${report.startDate}`);
  console.log(`Days: ${report.days}`);
  console.log(`Style: ${report.style}`);
  console.log(`Generated plan: ${report.generatedPlanPath}`);
  
  if (report.finalPlanPath && report.finalPlanPath !== report.generatedPlanPath) {
    console.log(`Final plan: ${report.finalPlanPath}`);
  }
  
  const getStatus = (name) => {
    const step = report.steps.slice().reverse().find(s => s.name === name);
    return step ? step.status : "skipped";
  };

  console.log(`Validated: ${getStatus("Validate Initial Plan") === "passed" ? "yes" : "no"}`);
  console.log(`Review report: ${report.reviewReportPath || "skipped"}`);
  console.log(`Dry-run: ${getStatus("Dry-Run Publisher")}`);
  console.log(`Enhance: ${enhance ? getStatus("Enhance Plan (LM Studio)") : "skipped"}`);
  console.log(`Rewrite weak: ${rewriteWeak ? getStatus("Rewrite Weak Posts (LM Studio)") : "skipped"}`);
  console.log(`Real publish: disabled`);
  console.log(`Runtime writes: none`);
  console.log(`Telegram calls: none`);

  if (!report.ok) {
    console.log(`\nBlocking issues:`);
    report.blockingIssues.forEach(i => console.log(`- ${i}`));
    process.exit(1);
  }
}

run();
