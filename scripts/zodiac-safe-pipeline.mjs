import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import process from "process";
import { getZodiacVisualAsset } from "./zodiac-asset-resolver.mjs";
import { getZodiacTelegramTarget, publishZodiacTelegramPost } from "./zodiac-telegram-publisher.mjs";

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
  let limitProvided = false;
  let channel = null;
  let live = false;
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
      limitProvided = true;
      i++;
    } else if (arg === "--channel" && args[i + 1]) {
      channel = args[i + 1];
      i++;
    } else if (arg === "--live") {
      live = true;
    } else if (arg === "--json") {
      jsonOutput = true;
    }
  }

  return { startDate, days, style, skipReview, skipDryRun, enhance, rewriteWeak, rewriteThreshold, limit, limitProvided, channel, live, jsonOutput };
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

function applyLimitToPlan(planPath, limit) {
  if (!Number.isFinite(limit)) return null;
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("--limit must be a positive integer.");
  }

  const absolutePath = path.resolve(process.cwd(), planPath);
  const plan = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  if (!Array.isArray(plan.posts)) {
    throw new Error(`Plan ${planPath} does not contain a posts array.`);
  }

  const originalCount = plan.posts.length;
  if (originalCount <= limit) {
    console.log(`[LIMIT] Plan already has ${originalCount} post(s); --limit ${limit} did not remove anything.`);
    return null;
  }

  plan.posts = plan.posts.slice(0, limit);
  plan.meta = {
    ...(plan.meta || {}),
    limitedFromPosts: originalCount,
    limitedToPosts: plan.posts.length,
    limitedAt: new Date().toISOString()
  };

  fs.writeFileSync(absolutePath, `${JSON.stringify(plan, null, 2)}\n`);
  console.log(`[LIMIT] Trimmed plan from ${originalCount} to ${plan.posts.length} post(s).`);
  return plan.posts.length;
}

function readPlanPostForLive({ planPath, channel }) {
  const absolutePath = path.resolve(process.cwd(), planPath);
  const plan = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  if (!Array.isArray(plan.posts) || plan.posts.length !== 1) {
    throw new Error(`Live publishing blocked: expected exactly 1 post after --limit 1, found ${Array.isArray(plan.posts) ? plan.posts.length : 0}.`);
  }

  const post = plan.posts[0];
  if (post.channelId !== channel) {
    throw new Error(`Live publishing blocked: generated post channel ${post.channelId} does not match --channel ${channel}.`);
  }

  const assetType = post.title && post.title.toLowerCase().includes("недел") ? "weekly" : "daily";
  const asset = getZodiacVisualAsset(post.channelId, assetType);
  if (!asset.ok) {
    throw new Error(`Live publishing blocked: ${asset.error}`);
  }

  return { post, imagePath: asset.path };
}

async function run() {
  const { startDate, days, style, skipReview, skipDryRun, enhance, rewriteWeak, rewriteThreshold, limit, limitProvided, channel, live, jsonOutput } = parseArgs();
  const isLive = live || process.env.TELEGRAM_LIVE_PUBLISH === "true";

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
    blockingIssues: [],
    realPublish: "disabled",
    telegramCalls: "none",
    liveMessageId: null
  };

  const addStep = (name, status) => { report.steps.push({ name, status }); };
  const fail = (issue) => { report.blockingIssues.push(issue); report.ok = false; };

  try {
    if (isLive) {
      if (!channel || !limitProvided || limit !== 1) {
        throw new Error("Live publishing blocked: one-post test requires --channel <id> and --limit 1.");
      }
      if (skipReview || skipDryRun) {
        throw new Error("Live publishing blocked: validation, editorial review, and dry-run must all pass before live send.");
      }
    }

    // 1. Generate Plan
    addStep("Generate Plan", "started");
    const generateArgs = ["run", "zodiac:generate-plan", "--", "--start-date", startDate, "--days", String(days), "--style", style];
    if (channel) {
      generateArgs.push("--channel", channel);
    }
    // We capture stdout to find the generated file path easily, but the script prints it cleanly.
    // Wait, let's just use predictable paths: exports/zodiac-weekly-plan-YYYY-MM-DD.json
    let currentPlan = `./exports/zodiac-weekly-plan-${startDate}.json`;
    runCommand("npm", generateArgs);
    report.generatedPlanPath = currentPlan;
    report.finalPlanPath = currentPlan;
    applyLimitToPlan(currentPlan, limit);
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
    if (isLive) {
      addStep("Live Publisher", "started");
      const target = getZodiacTelegramTarget(channel);
      if (!target.ok) {
        throw new Error(`Live publishing blocked: ${target.error}`);
      }

      const { post, imagePath } = readPlanPostForLive({ planPath: currentPlan, channel });
      const publishResult = await publishZodiacTelegramPost({
        channelId: channel,
        text: post.text,
        imagePath,
        dryRun: false,
        live: true,
      });

      if (!publishResult.ok || !publishResult.sent) {
        throw new Error(`Live publishing failed: ${publishResult.error || "Telegram send was not completed."}`);
      }

      report.realPublish = "sent";
      report.telegramCalls = "1 sendPhoto";
      report.liveMessageId = publishResult.messageId;
      console.log(`\nLive publishing completed for ${channel}. message_id=${publishResult.messageId}`);
      addStep("Live Publisher", "passed");
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
  console.log(`Real publish: ${report.realPublish}`);
  console.log(`Runtime writes: none`);
  console.log(`Telegram calls: ${report.telegramCalls}`);
  if (report.liveMessageId) {
    console.log(`Live message id: ${report.liveMessageId}`);
  }

  if (!report.ok) {
    console.log(`\nBlocking issues:`);
    report.blockingIssues.forEach(i => console.log(`- ${i}`));
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(`Pipeline failed: ${err instanceof Error ? err.message : "Unknown error"}`);
  process.exit(1);
});
