import fs from "fs";
import path from "path";
import process from "process";
import { getZodiacVisualAsset } from "./zodiac-asset-resolver.mjs";

const ZODIAC_CHANNEL_IDS = [
  "zodiac-general", "aries", "taurus", "gemini", "cancer", "leo",
  "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

function parseArgs() {
  const args = process.argv.slice(2);
  let planFile = null;
  let jsonOutput = false;

  for (const arg of args) {
    if (arg === "--json") {
      jsonOutput = true;
    } else if (!arg.startsWith("--") && !planFile) {
      planFile = arg;
    }
  }

  return { planFile, jsonOutput };
}

function run() {
  const { planFile, jsonOutput } = parseArgs();

  const report = {
    ok: true,
    planId: null,
    totalPosts: 0,
    daysCount: 0,
    blockingIssues: [],
    warnings: [],
    perDaySummary: {}
  };

  const addIssue = (msg) => { report.blockingIssues.push(msg); report.ok = false; };
  const addWarning = (msg) => { report.warnings.push(msg); };

  if (!planFile) {
    addIssue("No plan file specified.");
    return printReport(report, jsonOutput);
  }

  const absolutePath = path.resolve(process.cwd(), planFile);
  if (!fs.existsSync(absolutePath)) {
    addIssue(`File not found: ${planFile}`);
    return printReport(report, jsonOutput);
  }

  let plan;
  try {
    const fileContent = fs.readFileSync(absolutePath, "utf-8");
    plan = JSON.parse(fileContent);
  } catch (err) {
    addIssue(`Invalid JSON format: ${err.message}`);
    return printReport(report, jsonOutput);
  }

  // Plan level validations
  if (plan.network !== "zodiac") addIssue("Plan network is not 'zodiac'.");
  
  report.planId = plan.planId;
  report.daysCount = plan.daysCount || 0;
  
  if (!Array.isArray(plan.posts)) {
    addIssue("Plan does not contain a valid 'posts' array.");
    return printReport(report, jsonOutput);
  }

  report.totalPosts = plan.posts.length;

  // Group by date
  const postsByDate = {};
  for (const post of plan.posts) {
    if (!postsByDate[post.date]) {
      postsByDate[post.date] = [];
    }
    postsByDate[post.date].push(post);
  }

  // Post level validations
  plan.posts.forEach((post, i) => {
    const required = ["id", "date", "channelId", "channelName", "title", "text", "visualPrompt", "mediaMode", "status"];
    for (const req of required) {
      if (post[req] === undefined) {
        addIssue(`Post [${i}] (${post.id || 'unknown'}) missing required field: ${req}`);
      }
    }

    if (post.status !== "preview") {
      addIssue(`Post [${i}] status is '${post.status}'. Must be 'preview' for dry-run.`);
    }

    if (post.status === "due" || post.status === "published") {
      addIssue(`Post [${i}] status cannot be 'due' or 'published' in this phase.`);
    }

    if (post.publishReady !== false) {
      addIssue(`Post [${i}] publishReady is ${post.publishReady}. Must be false.`);
    }

    if (post.telegramUsername !== null || post.telegramChannelId !== null) {
      addIssue(`Post [${i}] references real telegram channels. Must be null for this phase.`);
    }

    if (!ZODIAC_CHANNEL_IDS.includes(post.channelId)) {
      addIssue(`Post [${i}] references legacy or unknown channel: ${post.channelId}`);
    }

    // Resolve visual asset
    let assetType = "daily";
    if (post.title && post.title.toLowerCase().includes("недел")) {
      assetType = "weekly";
    }

    const asset = getZodiacVisualAsset(post.channelId, assetType);
    if (!asset.ok) {
      addIssue(asset.error);
    } else {
      post.imagePath = asset.path;
      post.mediaMode = "image_required";
    }

    if (post.mediaMode === "image_required" && !post.imagePath) {
      addIssue(`Post [${i}] requires an image but imagePath is missing.`);
    }
  });

  // Day validations
  for (const date in postsByDate) {
    const dayPosts = postsByDate[date];
    report.perDaySummary[date] = dayPosts.length;
    if (dayPosts.length !== 13) {
      addIssue(`Date ${date} has ${dayPosts.length} posts. Expected exactly 13.`);
    }
  }

  printReport(report, jsonOutput, planFile, postsByDate);
}

function printReport(report, jsonOutput, planFile, postsByDate = {}) {
  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.ok ? 0 : 1);
  }

  console.log(`\n=== Zodiac Dry-Run Report ===`);
  console.log(`Plan: ${path.basename(planFile || "unknown")}`);
  console.log(`Network: zodiac`);
  console.log(`Days: ${report.daysCount}`);
  console.log(`Posts: ${report.totalPosts}`);
  
  if (Object.keys(postsByDate).length > 0) {
    console.log(`Channels per day: 13`);
  }
  
  console.log(`Media mode: text_only / image_optional (simulated)`);
  console.log(`Real Telegram sending: DISABLED`);
  console.log(`\n--- Channel connection check is skipped because real Telegram channels are not connected yet. ---\n`);

  if (Object.keys(postsByDate).length > 0) {
    let dayCounter = 1;
    for (const [date, posts] of Object.entries(postsByDate)) {
      console.log(`Day ${dayCounter} — ${date}`);
      for (const post of posts) {
        // truncate text for display
        const shortText = post.text ? post.text.slice(0, 40).replace(/\n/g, " ") + "..." : "";
        console.log(`  * ${post.channelId} | ${post.channelName} ${post.emoji} | ${shortText}`);
        if (post.imagePath) {
          console.log(`    -> [ASSET] ${path.basename(post.imagePath)}`);
        }
      }
      console.log("");
      dayCounter++;
    }
  }

  console.log(`Blocking issues: ${report.blockingIssues.length}`);
  for (const issue of report.blockingIssues) {
    console.log(`  [ERROR] ${issue}`);
  }

  console.log(`Warnings: ${report.warnings.length}`);
  for (const warn of report.warnings) {
    console.log(`  [WARN] ${warn}`);
  }

  console.log(`\nReady for future channel connection dry-run: ${report.ok ? "yes" : "no"}`);
  console.log(`Real publish allowed: no`);

  if (!report.ok) {
    process.exit(1);
  }
}

run();
