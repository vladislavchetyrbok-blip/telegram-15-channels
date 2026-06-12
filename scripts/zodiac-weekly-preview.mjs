import fs from "fs";
import path from "path";

function getLatestPlan() {
  const exportsDir = path.resolve(process.cwd(), "exports");
  if (!fs.existsSync(exportsDir)) return null;
  const files = fs.readdirSync(exportsDir)
    .filter(f => f.startsWith("zodiac-weekly-plan-") && f.endsWith(".json"))
    .sort();
  if (files.length === 0) return null;
  return path.join(exportsDir, files[files.length - 1]);
}

function parseArgs() {
  const args = process.argv.slice(2);
  let planFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--plan" && args[i + 1]) {
      planFile = args[i + 1];
      i++;
    }
  }
  return { planFile };
}

function getWeeklyAssetPath(post) {
  if (post.imagePath) return post.imagePath;

  if (!post.channelId || !post.date) return null;

  const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const weekday = weekdays[new Date(`${post.date}T00:00:00Z`).getUTCDay()];
  // Ensure consistent forward slashes for output, though path.join works
  return `public/assets/zodiac-weekly/${post.channelId}/${weekday}.jpg`;
}

function checkImage(imagePath) {
  if (!imagePath) return "MISSING (No path)";
  const fullPath = path.resolve(process.cwd(), "public", imagePath.replace(/^\//, ""));
  return fs.existsSync(fullPath) ? "READY" : "MISSING";
}

function run() {
  console.log("=== Zodiac Weekly CLI Preview ===");
  console.log("PUBLISH MODE: DRY-RUN ONLY\n");

  let { planFile } = parseArgs();
  
  if (!planFile) {
    planFile = getLatestPlan();
  } else {
    planFile = path.resolve(process.cwd(), planFile);
  }

  if (!planFile || !fs.existsSync(planFile)) {
    console.error(`Error: Could not find plan file: ${planFile || "No files in exports/"}`);
    process.exit(1);
  }

  console.log(`Reading plan: ${path.basename(planFile)}\n`);
  
  const planData = JSON.parse(fs.readFileSync(planFile, "utf8"));
  
  if (!planData.posts || !Array.isArray(planData.posts)) {
    console.error("Error: Invalid plan format (missing posts array)");
    process.exit(1);
  }

  for (const post of planData.posts) {
    console.log(`--------------------------------------------------`);
    console.log(`Date:     ${post.date}`);
    console.log(`Channel:  ${post.channelId}`);
    
    const lines = post.text ? post.text.split("\n") : [];
    const title = lines.length > 0 ? lines[0] : "(No Title)";
    const snippet = lines.slice(1, 3).join(" ").substring(0, 100).trim();
    console.log(`Title:    ${title}`);
    console.log(`Snippet:  ${snippet}${snippet.length === 100 ? "..." : ""}`);
    console.log(`Length:   ${post.text ? post.text.length : 0} chars`);
    
    const resolvedImagePath = getWeeklyAssetPath(post);
    // On Windows, fs.existsSync needs backslashes or forward slashes, both work.
    // However, if we built with path.join we might get backslashes. The template uses string.
    const assetStatus = resolvedImagePath && fs.existsSync(resolvedImagePath) ? "READY" : "MISSING";
    console.log(`Image:    ${resolvedImagePath || "None"}`);
    console.log(`Status:   ${assetStatus === "READY" ? "\x1b[32mREADY\x1b[0m" : "\x1b[31mMISSING\x1b[0m"}`);
  }
  
  console.log(`--------------------------------------------------`);
  console.log(`Total posts previewed: ${planData.posts.length}`);
  console.log("PUBLISH MODE: DRY-RUN ONLY");
}

run();
