import { execSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import process from "process";

const ZODIAC_CHANNEL_IDS = [
  "zodiac-general", "aries", "taurus", "gemini", "cancer", "leo",
  "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

function parseArgs() {
  const args = process.argv.slice(2);
  let mode = "quick"; // quick or full
  let jsonOutput = false;

  for (const arg of args) {
    if (arg === "--full") mode = "full";
    if (arg === "--quick") mode = "quick";
    if (arg === "--json") jsonOutput = true;
  }

  return { mode, jsonOutput };
}

function checkFile(filePath) {
  return fs.existsSync(path.resolve(process.cwd(), filePath));
}

function checkGitStatus(pattern) {
  try {
    const status = execSync("git status --short", { encoding: "utf-8" });
    const lines = status.split("\n").filter(Boolean);
    return !lines.some(line => line.includes(pattern));
  } catch (err) {
    return false;
  }
}

function run() {
  const { mode, jsonOutput } = parseArgs();
  
  const report = {
    overallStatus: "OK",
    core: {},
    safety: {},
    smokeTest: {},
    blockingIssues: [],
    warnings: [],
    nextActions: []
  };

  const fail = (msg) => { report.blockingIssues.push(msg); report.overallStatus = "BLOCKED"; };
  const warn = (msg) => { report.warnings.push(msg); if (report.overallStatus === "OK") report.overallStatus = "WARNING"; };
  const action = (msg) => { report.nextActions.push(msg); };

  // 1. Package scripts
  let pkg = {};
  try {
    pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
  } catch (err) {
    fail("package.json is missing or invalid");
  }

  const scripts = pkg.scripts || {};
  const checkScript = (name) => {
    const exists = !!scripts[name];
    if (!exists) warn(`Missing package script: ${name}`);
    return exists;
  };

  report.core.generator = checkScript("zodiac:generate-plan") && checkFile("scripts/generate-zodiac-plan.mjs");
  report.core.validator = checkScript("zodiac:validate-plan") && checkFile("scripts/validate-zodiac-plan.mjs");
  report.core.dryRun = checkScript("zodiac:dry-run") && checkFile("scripts/publish-zodiac-dry-run.mjs");
  report.core.review = checkScript("zodiac:review-plan") && checkFile("scripts/review-zodiac-plan.mjs");
  report.core.enhance = checkScript("zodiac:enhance-plan") && checkFile("scripts/enhance-zodiac-plan-lmstudio.mjs");
  report.core.rewrite = checkScript("zodiac:rewrite-weak") && checkFile("scripts/rewrite-zodiac-weak-posts.mjs");
  report.core.pipeline = checkScript("zodiac:pipeline") && checkFile("scripts/zodiac-safe-pipeline.mjs");
  
  if (!report.core.generator) fail("Generator is missing");
  if (!report.core.validator) fail("Validator is missing");

  // 2. Required files
  report.core.config = checkFile("data/zodiacNetwork.ts");
  report.core.schema = checkFile("lib/zodiac-runtime-plan.ts");
  report.core.docs = checkFile("docs/ZODIAC_RUNTIME_BRIDGE.md");

  if (!report.core.config) fail("data/zodiacNetwork.ts is missing");
  if (!report.core.schema) fail("lib/zodiac-runtime-plan.ts is missing");

  // 3. Optional files
  report.core.connections = checkFile("data/zodiacChannelConnections.ts");
  report.core.readinessPanel = checkFile("lib/zodiac-publish-readiness.ts");

  // 4. Safety files
  report.safety.env = checkGitStatus(".env");
  report.safety.envLocal = checkGitStatus(".env.local");
  report.safety.dataRuntime = checkGitStatus("data/runtime");
  report.safety.exportsIgnored = false;
  
  try {
    const gitignore = fs.readFileSync(".gitignore", "utf-8");
    report.safety.exportsIgnored = gitignore.split("\n").some(line => line.trim() === "exports/");
  } catch (err) { }
  
  report.safety.generatedNotStaged = checkGitStatus("exports/");

  if (!report.safety.env || !report.safety.envLocal) fail(".env files are modified in git status");
  if (!report.safety.dataRuntime) fail("data/runtime files are modified in git status");
  if (!report.safety.exportsIgnored) fail("exports/ folder is not in .gitignore");
  if (!report.safety.generatedNotStaged) fail("Generated exports files are staged/tracked in git");

  // 5. Smoke tests
  if (mode === "full" && report.overallStatus !== "BLOCKED") {
    try {
      // Generate
      const genRes = spawnSync("npm", ["run", "zodiac:generate-plan", "--", "--start-date", "2026-06-13", "--days", "1", "--style", "luxury-mystic"], { shell: process.platform === "win32" });
      report.smokeTest.generate = genRes.status === 0;
      if (!report.smokeTest.generate) fail("Smoke test: generate failed");

      const testPlanPath = "./exports/zodiac-weekly-plan-2026-06-13.json";

      // Validate
      if (report.smokeTest.generate) {
        const valRes = spawnSync("npm", ["run", "zodiac:validate-plan", "--", testPlanPath], { shell: process.platform === "win32" });
        report.smokeTest.validate = valRes.status === 0;
        if (!report.smokeTest.validate) fail("Smoke test: validate failed");
      }

      // Review
      if (report.core.review && report.smokeTest.generate) {
        const revRes = spawnSync("npm", ["run", "zodiac:review-plan", "--", testPlanPath], { shell: process.platform === "win32" });
        report.smokeTest.review = revRes.status === 0;
      }

      // Dry-run
      if (report.core.dryRun && report.smokeTest.generate) {
        const dryRes = spawnSync("npm", ["run", "zodiac:dry-run", "--", testPlanPath], { shell: process.platform === "win32" });
        report.smokeTest.dryRun = dryRes.status === 0;
      }

    } catch (err) {
      fail(`Smoke test execution error: ${err.message}`);
    }
  }

  // Next Actions
  if (!report.core.dryRun) action("Implement dry-run publisher (Phase 3)");
  if (!report.core.enhance) action("Implement LM Studio enhancer (Phase 4)");
  if (!report.core.review) action("Implement Editorial review (Phase 5)");
  if (!report.core.rewrite) action("Implement weak posts rewrite (Phase 6)");
  if (!report.core.pipeline) action("Implement safe pipeline (Phase 7)");
  if (!report.core.connections) action("Connect real channels in data/zodiacChannelConnections.ts later");

  if (report.blockingIssues.length === 0 && report.nextActions.length === 0) {
    action("All phases completed! Ready for actual publishing integration.");
  }

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.overallStatus === "BLOCKED" ? 1 : 0);
  }

  console.log(`\n=== Zodiac Healthcheck ===`);
  console.log(`Overall status: ${report.overallStatus}`);
  console.log(`Mode: ${mode}`);

  console.log(`\nCore:`);
  console.log(`* Zodiac config: ${report.core.config ? "OK" : "missing"}`);
  console.log(`* Runtime plan schema: ${report.core.schema ? "OK" : "missing"}`);
  console.log(`* Generator: ${report.core.generator ? "OK" : "missing"}`);
  console.log(`* Validator: ${report.core.validator ? "OK" : "missing"}`);
  console.log(`* Dry-run: ${report.core.dryRun ? "OK" : "missing"}`);
  console.log(`* Review: ${report.core.review ? "OK" : "missing"}`);
  console.log(`* Enhance: ${report.core.enhance ? "OK" : "missing"}`);
  console.log(`* Rewrite: ${report.core.rewrite ? "OK" : "missing"}`);
  console.log(`* Pipeline: ${report.core.pipeline ? "OK" : "missing"}`);

  console.log(`\nSafety:`);
  console.log(`* .env untouched: ${report.safety.env ? "OK" : "FAILED"}`);
  console.log(`* .env.local untouched: ${report.safety.envLocal ? "OK" : "FAILED"}`);
  console.log(`* data/runtime untouched: ${report.safety.dataRuntime ? "OK" : "FAILED"}`);
  console.log(`* exports/ ignored: ${report.safety.exportsIgnored ? "OK" : "FAILED"}`);
  console.log(`* generated files not staged: ${report.safety.generatedNotStaged ? "OK" : "FAILED"}`);

  if (mode === "full") {
    console.log(`\nSmoke test:`);
    console.log(`* generate 1 day: ${report.smokeTest.generate ? "OK" : "FAILED"}`);
    console.log(`* validate generated plan: ${report.smokeTest.validate ? "OK" : (report.smokeTest.validate === false ? "FAILED" : "skipped")}`);
    console.log(`* dry-run generated plan: ${report.smokeTest.dryRun ? "OK" : (report.smokeTest.dryRun === false ? "FAILED" : "skipped")}`);
    console.log(`* review generated plan: ${report.smokeTest.review ? "OK" : (report.smokeTest.review === false ? "FAILED" : "skipped")}`);
  }

  if (report.blockingIssues.length > 0) {
    console.log(`\nBlocking Issues:`);
    report.blockingIssues.forEach(i => console.log(`- ${i}`));
  }

  if (report.warnings.length > 0) {
    console.log(`\nWarnings:`);
    report.warnings.forEach(i => console.log(`- ${i}`));
  }

  console.log(`\nNext actions:`);
  report.nextActions.forEach((a, i) => console.log(`${i + 1}. ${a}`));
  console.log("");

  process.exit(report.overallStatus === "BLOCKED" ? 1 : 0);
}

run();
