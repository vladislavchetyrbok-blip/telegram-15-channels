import fs from "fs";
import path from "path";
import child_process from "child_process";
import process from "process";
import {
  requiredPremiumMp4Outputs,
  writeSocialPremiumMp4Bundle,
} from "./lib/social-premium-mp4-generator.mjs";
import { getMp4RendererAvailability } from "./lib/social-auto-mp4-generator.mjs";

const ROOT = process.cwd();
const PREMIUM_SOURCE_FILES = [
  "scripts/lib/social-premium-mp4-generator.mjs",
  "scripts/social-premium-mp4-render.mjs",
  "package.json",
  ".gitignore",
];
const EXPECTED_SCRIPTS = {
  "social:mp4:premium:dry": "node scripts/social-premium-mp4-render.mjs --dry-run",
  "social:mp4:premium:queue": "node scripts/social-premium-mp4-render.mjs --queue",
  "social:mp4:premium:7": "node scripts/social-premium-mp4-render.mjs --queue --days 7",
  "social:mp4:premium:qa": "node scripts/check-social-premium-mp4-render.mjs",
};
const FORBIDDEN_CHANGED_PATH_PREFIXES = [".github/workflows/", "apps/"];
const FORBIDDEN_CHANGED_FILES = [
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/publish-zodiac-compatibility.mjs",
];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function assert(condition, message, failures) {
  if (!condition) failures.push(message);
}

function gitDiffNames() {
  const result = child_process.spawnSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
    shell: false,
  });
  if (result.error || result.status !== 0) throw new Error("Unable to inspect git diff against origin/main.");
  return result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function gitCheckIgnored(filePath) {
  const relative = path.relative(ROOT, filePath).replace(/\\/g, "/");
  const result = child_process.spawnSync("git", ["check-ignore", "-q", relative], {
    cwd: ROOT,
    encoding: "utf8",
    shell: false,
  });
  return result.status === 0;
}

function validateVisualStyle(styleReport, failures) {
  assert(styleReport.phase === "social_phase_1_package_f", "visual-style-report phase must be Package F.", failures);
  assert(Boolean(styleReport.stylePreset), "visual-style-report must include stylePreset.", failures);
  assert(Boolean(styleReport.sceneVariant), "visual-style-report must include sceneVariant.", failures);
  assert(styleReport.animatedBackgrounds === true, "premium animated backgrounds must be true.", failures);
  assert(styleReport.starfieldParticles === true, "premium starfield particles must be true.", failures);
  assert(styleReport.glowLayers === true, "premium glow layers must be true.", failures);
  assert(styleReport.softParallax === true, "premium parallax must be true.", failures);
  assert(styleReport.animatedTextEntrance === true, "premium animated text entrance must be true.", failures);
  assert(styleReport.ctaEndCardImproved === true, "premium CTA end card must be improved.", failures);
  assert(styleReport.textRules?.maxHeadlinePerScene === 1, "premium text must allow max one headline.", failures);
  assert(styleReport.textRules?.maxShortLinesPerScene === 2, "premium text must allow max two short lines.", failures);
  assert(styleReport.safety?.externalApisUsed === false, "premium renderer must not use external APIs.", failures);
  assert(styleReport.safety?.socialPosting === false, "premium renderer must not post social content.", failures);
}

function validateRenderedReport(report, failures) {
  assert(fs.existsSync(report.videoPath), `${report.outputFolder}: video.mp4 missing.`, failures);
  assert(fs.existsSync(report.thumbnailPath), `${report.outputFolder}: thumbnail.png missing.`, failures);
  for (const fileName of requiredPremiumMp4Outputs()) {
    const filePath = path.join(report.outputFolder, fileName);
    assert(fs.existsSync(filePath), `${report.outputFolder}: missing ${fileName}.`, failures);
    assert(fs.statSync(filePath).size > 0, `${report.outputFolder}: empty ${fileName}.`, failures);
  }
  assert(gitCheckIgnored(report.videoPath), `${report.outputFolder}: generated premium video must be ignored by git.`, failures);
  assert(report.safety.ctaSafe === true, `${report.outputFolder}: CTA safety must pass.`, failures);
  assert(report.safety.noAdminDashboardUrl === true, `${report.outputFolder}: admin/dashboard URL must be absent.`, failures);
  assert(report.safety.vipPaymentSafe === true, `${report.outputFolder}: VIP/payment safety must pass.`, failures);
  assert(report.safety.noPaymentScreen === true, `${report.outputFolder}: payment screen must be absent.`, failures);
  assert(report.safety.noVipUnlock === true, `${report.outputFolder}: VIP unlock must be absent.`, failures);
  assert(report.renderer.outputFps === 30, `${report.outputFolder}: output FPS must be 30.`, failures);
  assert(report.renderer.externalApisUsed === false, `${report.outputFolder}: external APIs must be absent.`, failures);
  if (report.probe && !report.probe.parseError) {
    assert(report.probe.width === 1080, `${report.outputFolder}: width must be 1080.`, failures);
    assert(report.probe.height === 1920, `${report.outputFolder}: height must be 1920.`, failures);
    assert(report.probe.durationSeconds >= 20 && report.probe.durationSeconds <= 35, `${report.outputFolder}: duration must be 20-35 seconds.`, failures);
    assert([24, 30].includes(Math.round(report.probe.avgFrameRate ?? report.probe.rFrameRate ?? 0)), `${report.outputFolder}: output FPS must be 24 or 30.`, failures);
  }
  const styleReport = JSON.parse(fs.readFileSync(path.join(report.outputFolder, "visual-style-report.json"), "utf8"));
  validateVisualStyle(styleReport, failures);
}

async function main() {
  const failures = [];
  const packageJson = JSON.parse(read("package.json"));
  for (const [scriptName, command] of Object.entries(EXPECTED_SCRIPTS)) {
    assert(packageJson.scripts[scriptName] === command, `Missing ${scriptName} script.`, failures);
  }

  for (const changedFile of gitDiffNames()) {
    assert(!FORBIDDEN_CHANGED_PATH_PREFIXES.some((prefix) => changedFile.startsWith(prefix)), `Forbidden path changed unexpectedly: ${changedFile}`, failures);
    assert(!FORBIDDEN_CHANGED_FILES.includes(changedFile), `Telegram live publish file changed unexpectedly: ${changedFile}`, failures);
  }

  const sourceText = PREMIUM_SOURCE_FILES.filter((file) => fs.existsSync(path.join(ROOT, file))).map(read).join("\n");
  assert(!/\b(fetch|axios|request)\s*\(/i.test(sourceText), "Premium MP4 files must not contain network client calls.", failures);
  assert(!/\b(sendMessage|sendPhoto|sendMediaGroup|sendVideo|publishLive|autopost|uploadVideo|uploadReel)\b/i.test(sourceText), "Premium MP4 files must not contain posting calls.", failures);
  assert(!/\b(?:IG|INSTAGRAM|TIKTOK|TT)[A-Z0-9_]*(?:TOKEN|SECRET|ACCESS_KEY)\b/.test(sourceText), "Premium MP4 files must not reference social posting token env names.", failures);
  assert(!/\b(sendInvoice|createInvoice|unlockVip|grantVip|entitlementBypass)\b/i.test(sourceText), "Premium MP4 files must not add payment or VIP unlock behavior.", failures);

  const gitignore = read(".gitignore");
  assert(/data\/social-videos-premium\/\*/.test(gitignore), "Generated premium social videos output must be ignored.", failures);

  const renderer = await getMp4RendererAvailability();
  assert(renderer.ffmpegAvailable, `ffmpeg unavailable. Install with: ${renderer.installHint}`, failures);
  assert(renderer.ffprobeAvailable, `ffprobe unavailable. Install with: ${renderer.installHint}`, failures);
  if (renderer.ffmpegAvailable) {
    const result = await writeSocialPremiumMp4Bundle({
      scope: "date",
      date: "2026-07-02",
      rootDir: ROOT,
      maxPacks: 1,
    });
    assert(result.videosGenerated === 1, "Premium MP4 QA smoke must render one video.", failures);
    for (const report of result.reports) validateRenderedReport(report, failures);
  }

  if (failures.length > 0) {
    console.error("Social Premium MP4 Render QA: FAIL");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log("Social Premium MP4 Render QA: PASS");
  console.log(`ffmpeg available : ${renderer.ffmpegAvailable ? "Yes" : "No"}`);
  console.log(`ffprobe available: ${renderer.ffprobeAvailable ? "Yes" : "No"}`);
  console.log("Smoke videos     : 1");
  console.log("Premium style    : PASS");
  console.log("API posting      : none");
  console.log("Social tokens    : none");
  console.log("Workflow changes : none");
  console.log("Telegram live    : untouched");
}

main().catch((error) => {
  console.error("Social Premium MP4 Render QA: FAIL");
  console.error(`- ${error.message}`);
  process.exit(1);
});
