import fs from "fs";
import path from "path";
import process from "process";

const DEFAULT_ENDPOINT = "http://localhost:1234/v1/chat/completions";
const DEFAULT_MODEL = "deepseek-r1-0528-qwen3-8b";

function parseArgs() {
  const args = process.argv.slice(2);
  let planFile = null;
  let outFile = null;
  let endpoint = DEFAULT_ENDPOINT;
  let model = DEFAULT_MODEL;
  let limit = Infinity;
  let dry = false;
  let overwrite = false;

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
    } else if (arg === "--limit" && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--dry") {
      dry = true;
    } else if (arg === "--overwrite") {
      overwrite = true;
    } else if (!arg.startsWith("--") && !planFile) {
      planFile = arg;
    }
  }

  return { planFile, outFile, endpoint, model, limit, dry, overwrite };
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

  const userPrompt = `Please enhance the following post.
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
      headers: {
        "Content-Type": "application/json"
      },
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Attempt to parse JSON
    // Remove markdown code blocks if the model accidentally included them
    if (content.startsWith("```json")) {
      content = content.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (content.startsWith("```")) {
      content = content.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(content);
    
    if (!parsed.title || !parsed.text) {
      throw new Error("JSON missing required fields: title, text");
    }

    return parsed;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function run() {
  const { planFile, outFile, endpoint, model, limit, dry, overwrite } = parseArgs();

  if (!planFile) {
    console.error("Error: No plan file specified.");
    process.exit(1);
  }

  const absolutePath = path.resolve(process.cwd(), planFile);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: File not found: ${planFile}`);
    process.exit(1);
  }

  let plan;
  try {
    const fileContent = fs.readFileSync(absolutePath, "utf-8");
    plan = JSON.parse(fileContent);
  } catch (err) {
    console.error(`Error: Invalid JSON format: ${err.message}`);
    process.exit(1);
  }

  if (plan.network !== "zodiac") {
    console.error("Error: Plan network is not 'zodiac'.");
    process.exit(1);
  }

  if (plan.status === "published" || plan.status === "due") {
    console.error("Error: Cannot enhance a plan that is already published or due.");
    process.exit(1);
  }

  if (plan.publishReady) {
    console.error("Error: Cannot enhance a plan that is marked as publishReady.");
    process.exit(1);
  }

  if (!Array.isArray(plan.posts)) {
    console.error("Error: Plan does not contain a valid 'posts' array.");
    process.exit(1);
  }

  const outputFilePath = outFile || absolutePath.replace(/\.json$/, "-enhanced.json");

  if (!overwrite && outputFilePath === absolutePath) {
    console.error("Error: Output file is the same as input file. Use --overwrite to allow.");
    process.exit(1);
  }

  console.log(`Zodiac LM Studio Enhancer`);
  console.log(`Plan: ${planFile}`);
  console.log(`Total Posts: ${plan.posts.length}`);
  console.log(`Limit: ${limit === Infinity ? 'None' : limit}`);
  console.log(`Model: ${model}`);
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Dry run: ${dry ? 'Yes' : 'No'}`);
  console.log("--------------------------------------------------");

  if (!dry) {
    // Quick ping check
    try {
      const ping = await fetch(endpoint.replace("/chat/completions", "/models"));
      if (!ping.ok) throw new Error("bad ping");
    } catch (err) {
      console.error(`\nLM Studio is not available at ${new URL(endpoint).origin}.`);
      console.error(`Start LM Studio server and try again.`);
      process.exit(1);
    }
  }

  let enhancedCount = 0;
  let failedCount = 0;
  const warnings = [];

  for (let i = 0; i < plan.posts.length && i < limit; i++) {
    const post = plan.posts[i];
    console.log(`[${i + 1}/${Math.min(limit, plan.posts.length)}] Enhancing post: ${post.channelId} | ${post.date}...`);

    if (dry) {
      console.log(`  (Dry run) Skipping LM Studio call for ${post.id}`);
      enhancedCount++;
      continue;
    }

    try {
      const enhancedContent = await callLmStudio(endpoint, model, post);
      
      // Update post in place
      post.title = enhancedContent.title;
      post.text = enhancedContent.text;
      if (enhancedContent.sections && Array.isArray(enhancedContent.sections)) {
        post.sections = enhancedContent.sections;
      }
      
      console.log(`  ✓ Success`);
      enhancedCount++;
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
      warnings.push(`Post ${post.id}: ${err.message}`);
      failedCount++;
      // fallback to original post, do nothing
    }
  }

  if (dry) {
    console.log(`\nDry run finished. No files written.`);
    process.exit(0);
  }

  // Update metadata
  plan.enhancedAt = new Date().toISOString();
  plan.enhancedBy = "lmstudio";
  plan.model = model;
  plan.endpoint = endpoint;
  plan.enhancedPostsCount = enhancedCount;
  plan.failedPostsCount = failedCount;
  plan.warnings = warnings;

  try {
    const outDir = path.dirname(outputFilePath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(outputFilePath, JSON.stringify(plan, null, 2), "utf-8");
    console.log(`\nSuccessfully saved enhanced plan to: ${outputFilePath}`);
    console.log(`Enhanced: ${enhancedCount}`);
    console.log(`Failed: ${failedCount}`);
  } catch (err) {
    console.error(`\nError saving enhanced plan: ${err.message}`);
    process.exit(1);
  }
}

run();
