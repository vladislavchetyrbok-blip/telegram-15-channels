import fs from "fs";
import path from "path";
import process from "process";

const ZODIAC_CHANNEL_IDS = [
  "zodiac-general", "aries", "taurus", "gemini", "cancer", "leo",
  "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

const FORBIDDEN_PHRASES = [
  "Возможны перемены", "Будьте внимательны", "Сегодня вас ждёт успех",
  "Звёзды говорят", "Всё получится", "Вас ждёт любовь", "День будет удачным",
  "Не упустите шанс", "Вселенная подсказывает", "Судьба готовит", "Карты говорят",
  "Энергии дня"
];

const DEFAULT_ENDPOINT = "http://localhost:1234/v1/chat/completions";
const DEFAULT_MODEL = "deepseek-r1-0528-qwen3-8b";

function parseArgs() {
  const args = process.argv.slice(2);
  let planFile = null;
  let outFile = null;
  let endpoint = DEFAULT_ENDPOINT;
  let model = DEFAULT_MODEL;
  let threshold = 70;
  let limit = Infinity;
  let dry = false;
  let overwrite = false;
  let ids = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--endpoint" && args[i + 1]) {
      endpoint = args[i + 1];
      i++;
    } else if (arg === "--model" && args[i + 1]) {
      model = args[i + 1];
      i++;
    } else if (arg === "--out" && args[i + 1]) {
      outFile = args[i + 1];
      i++;
    } else if (arg === "--threshold" && args[i + 1]) {
      threshold = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--limit" && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--ids" && args[i + 1]) {
      ids = args[i + 1].split(",").map(id => id.trim());
      i++;
    } else if (arg === "--dry") {
      dry = true;
    } else if (arg === "--overwrite") {
      overwrite = true;
    } else if (!arg.startsWith("--") && !planFile) {
      planFile = arg;
    }
  }

  return { planFile, outFile, endpoint, model, threshold, limit, ids, dry, overwrite };
}

function isPostWeak(post, threshold, specificIds) {
  const reasons = [];
  
  if (specificIds && specificIds.length > 0) {
    if (specificIds.includes(post.id)) {
      reasons.push("Explicitly requested by ID");
      return reasons;
    }
    return []; // If ids are provided, ONLY rewrite those.
  }

  const score = typeof post.qualityScore === "number" ? post.qualityScore : 100;
  if (score < threshold) reasons.push(`Score ${score} < ${threshold}`);
  if (post.editorialStatus === "needs_review") reasons.push("Status is needs_review");
  if (!post.title) reasons.push("Missing title");
  if (!post.text) reasons.push("Missing text");
  if (!post.visualPrompt) reasons.push("Missing visualPrompt");
  
  const fullText = (post.text || "").toLowerCase();
  FORBIDDEN_PHRASES.forEach(p => {
    if (fullText.includes(p.toLowerCase())) {
      reasons.push(`Forbidden phrase: "${p}"`);
    }
  });

  if (post.type === "sign" && (!post.sections || post.sections.length === 0)) {
    reasons.push("Missing sections");
  }

  return reasons;
}

async function callLmStudio(endpoint, model, post) {
  const systemPrompt = `You are an editorial assistant for a premium Telegram zodiac channel. Rewrite horoscope copy in Russian. Return valid JSON only. No markdown.
  
Rules:
- Keep the meaning horoscope-style but make it more premium.
- Remove clichés and cheap predictions.
- No guaranteed predictions.
- No medical claims.
- No fear manipulation.
- No fake certainty.
- No aggressive esotericism.
- No absolute promises of money, love, or health.
- Keep Russian language.
- Keep compact Telegram style.
- Keep structure readable.

Output strictly as a JSON object with the following keys:
- "title": (string)
- "text": (string)
- "sections": (array of objects with "title" and "body" strings)`;

  const userPrompt = `Please rewrite and improve the following weak post.
Channel: ${post.channelName} ${post.emoji}
Type: ${post.type}
Date: ${post.date}
Original Title: ${post.title}

Original Text:
${post.text}

Return JSON only.`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    if (content.startsWith("```json")) content = content.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    else if (content.startsWith("```")) content = content.replace(/^```\n?/, "").replace(/\n?```$/, "");

    const parsed = JSON.parse(content);
    if (!parsed.title || !parsed.text) throw new Error("JSON missing required fields: title, text");

    return parsed;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function run() {
  const { planFile, outFile, endpoint, model, threshold, limit, ids, dry, overwrite } = parseArgs();

  if (!planFile) { console.error("Error: No plan file specified."); process.exit(1); }
  const absolutePath = path.resolve(process.cwd(), planFile);
  if (!fs.existsSync(absolutePath)) { console.error(`Error: File not found: ${planFile}`); process.exit(1); }

  let plan;
  try {
    plan = JSON.parse(fs.readFileSync(absolutePath, "utf-8"));
  } catch (err) {
    console.error(`Error: Invalid JSON format: ${err.message}`); process.exit(1);
  }

  if (plan.network !== "zodiac") { console.error("Error: Plan network is not 'zodiac'."); process.exit(1); }
  if (!Array.isArray(plan.posts)) { console.error("Error: Plan has no posts."); process.exit(1); }
  if (plan.status === "published") { console.error("Error: Cannot rewrite a published plan."); process.exit(1); }
  if (plan.publishReady) { console.error("Error: Cannot rewrite a plan marked as publishReady."); process.exit(1); }

  const outputFilePath = outFile || absolutePath.replace(/\.json$/, "-rewritten.json");
  if (!overwrite && outputFilePath === absolutePath) {
    console.error("Error: Output file is the same as input file. Use --overwrite to allow.");
    process.exit(1);
  }

  // Detect weak posts
  const weakPosts = [];
  for (const post of plan.posts) {
    if (!ZODIAC_CHANNEL_IDS.includes(post.channelId)) {
      console.error(`Error: Legacy or unknown channel ID detected: ${post.channelId}`);
      process.exit(1);
    }
    const reasons = isPostWeak(post, threshold, ids);
    if (reasons.length > 0) {
      weakPosts.push({ post, reasons });
    }
  }

  console.log(`=== Zodiac Weak Post Rewriter ===`);
  console.log(`Plan: ${planFile}`);
  console.log(`Total Posts: ${plan.posts.length}`);
  console.log(`Detected Weak Posts: ${weakPosts.length}`);
  console.log(`Threshold: ${threshold}`);
  console.log(`Limit: ${limit === Infinity ? 'None' : limit}`);
  console.log(`Dry run: ${dry ? 'Yes' : 'No'}`);
  console.log("--------------------------------------------------");

  if (weakPosts.length === 0) {
    console.log("No weak posts found based on current criteria. Nothing to do.");
    process.exit(0);
  }

  if (dry) {
    console.log("Weak Posts Details (Dry Run):\n");
    for (let i = 0; i < weakPosts.length; i++) {
      if (i >= limit) break;
      const { post, reasons } = weakPosts[i];
      console.log(`[${post.channelId} / ${post.date}] ID: ${post.id}`);
      console.log(`  Reasons: ${reasons.join(", ")}`);
    }
    console.log("\nDry run finished. No files written.");
    process.exit(0);
  }

  // Check LM Studio
  try {
    const ping = await fetch(endpoint.replace("/chat/completions", "/models"));
    if (!ping.ok) throw new Error("bad ping");
  } catch (err) {
    console.error(`\nLM Studio is not available at ${new URL(endpoint).origin}.`);
    console.error(`Start LM Studio server and try again.`);
    process.exit(1);
  }

  let rewrittenCount = 0;
  let failedCount = 0;
  const warnings = [];

  for (let i = 0; i < weakPosts.length && i < limit; i++) {
    const { post, reasons } = weakPosts[i];
    console.log(`[${i + 1}/${Math.min(limit, weakPosts.length)}] Rewriting: ${post.channelId} | ${post.date}`);
    console.log(`  Fixing: ${reasons.join(", ")}`);

    try {
      const rewrittenContent = await callLmStudio(endpoint, model, post);
      post.title = rewrittenContent.title;
      post.text = rewrittenContent.text;
      if (rewrittenContent.sections && Array.isArray(rewrittenContent.sections)) {
        post.sections = rewrittenContent.sections;
      }
      post.qualityScore = 95; // Boost score after manual AI rewrite
      post.editorialStatus = "good_preview";
      console.log(`  ✓ Success`);
      rewrittenCount++;
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
      warnings.push(`Post ${post.id}: ${err.message}`);
      failedCount++;
    }
  }

  plan.rewrittenAt = new Date().toISOString();
  plan.rewrittenBy = "lmstudio";
  plan.model = model;
  plan.endpoint = endpoint;
  plan.threshold = threshold;
  plan.rewrittenPostsCount = rewrittenCount;
  plan.failedPostsCount = failedCount;
  plan.skippedPostsCount = weakPosts.length - rewrittenCount;
  plan.warnings = [...(plan.warnings || []), ...warnings];

  try {
    const outDir = path.dirname(outputFilePath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(outputFilePath, JSON.stringify(plan, null, 2), "utf-8");
    console.log(`\nSuccessfully saved rewritten plan to: ${outputFilePath}`);
    console.log(`Rewritten: ${rewrittenCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log(`Skipped (over limit): ${plan.skippedPostsCount}`);
  } catch (err) {
    console.error(`\nError saving rewritten plan: ${err.message}`);
    process.exit(1);
  }
}

run();
