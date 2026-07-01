import fs from "fs";
import path from "path";
import child_process from "child_process";
import process from "process";
import {
  getMp4RendererAvailability,
  requiredMp4Outputs,
  writeSocialMp4Bundle,
} from "./lib/social-auto-mp4-generator.mjs";

const ROOT = process.cwd();
const EXPECTED_SOCIAL_QA = "node scripts/check-social-manual-export.mjs && node scripts/check-social-calendar.mjs && node scripts/check-social-review-queue.mjs && node scripts/check-social-video-packs.mjs";
const MP4_SOURCE_FILES = [
  "scripts/lib/social-auto-mp4-generator.mjs",
  "scripts/social-mp4-render.mjs",
  "package.json",
  ".gitignore",
];
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

function gitDiffNames() {
  const result = child_process.spawnSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
    shell: false,
  });
  if (result.error || result.status !== 0) throw new Error("Unable to inspect git diff against origin/main.");
  return result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function assert(condition, message, failures) {
  if (!condition) failures.push(message);
}

function validateRenderedReport(report, failures) {
  assert(fs.existsSync(report.videoPath), `${report.outputFolder}: video.mp4 missing.`, failures);
  assert(fs.existsSync(report.thumbnailPath), `${report.outputFolder}: thumbnail.png missing.`, failures);
  for (const fileName of requiredMp4Outputs()) {
    const filePath = path.join(report.outputFolder, fileName);
    assert(fs.existsSync(filePath), `${report.outputFolder}: missing ${fileName}.`, failures);
    assert(fs.statSync(filePath).size > 0, `${report.outputFolder}: empty ${fileName}.`, failures);
  }
  assert(report.safety.ctaSafe === true, `${report.outputFolder}: CTA safety must pass.`, failures);
  assert(report.safety.noAdminDashboardUrl === true, `${report.outputFolder}: admin/dashboard URL must be absent.`, failures);
  assert(report.safety.vipPaymentSafe === true, `${report.outputFolder}: VIP/payment safety must pass.`, failures);
  assert(report.safety.noPaymentScreen === true, `${report.outputFolder}: payment screen must be absent.`, failures);
  assert(report.safety.noVipUnlock === true, `${report.outputFolder}: VIP unlock must be absent.`, failures);
  if (report.probe && !report.probe.parseError) {
    assert(report.probe.width === 1080, `${report.outputFolder}: width must be 1080.`, failures);
    assert(report.probe.height === 1920, `${report.outputFolder}: height must be 1920.`, failures);
    assert(report.probe.durationSeconds >= 20 && report.probe.durationSeconds <= 35, `${report.outputFolder}: duration must be 20-35 seconds.`, failures);
  }
}

async function main() {
  const failures = [];
  const packageJson = JSON.parse(read("package.json"));
  assert(packageJson.scripts["social:mp4:dry"] === "node scripts/social-mp4-render.mjs --dry-run", "Missing social:mp4:dry script.", failures);
  assert(packageJson.scripts["social:mp4:queue"] === "node scripts/social-mp4-render.mjs --queue", "Missing social:mp4:queue script.", failures);
  assert(packageJson.scripts["social:mp4:7"] === "node scripts/social-mp4-render.mjs --queue --days 7", "Missing social:mp4:7 script.", failures);
  assert(packageJson.scripts["social:mp4:qa"] === "node scripts/check-social-mp4-render.mjs", "Missing social:mp4:qa script.", failures);
  assert(packageJson.scripts["social:qa"] === EXPECTED_SOCIAL_QA, "social:qa must keep Packages A-D checks.", failures);

  for (const changedFile of gitDiffNames()) {
    assert(!FORBIDDEN_CHANGED_PATH_PREFIXES.some((prefix) => changedFile.startsWith(prefix)), `Forbidden path changed unexpectedly: ${changedFile}`, failures);
    assert(!FORBIDDEN_CHANGED_FILES.includes(changedFile), `Telegram live publish file changed unexpectedly: ${changedFile}`, failures);
  }

  const sourceText = MP4_SOURCE_FILES.filter((file) => fs.existsSync(path.join(ROOT, file))).map(read).join("\n");
  assert(!/\b(fetch|axios|request)\s*\(/i.test(sourceText), "MP4 files must not contain network client calls.", failures);
  assert(!/\b(sendMessage|sendPhoto|sendMediaGroup|sendVideo|publishLive|autopost|uploadVideo|uploadReel)\b/i.test(sourceText), "MP4 files must not contain posting calls.", failures);
  assert(!/\b(?:IG|INSTAGRAM|TIKTOK|TT)[A-Z0-9_]*(?:TOKEN|SECRET|ACCESS_KEY)\b/.test(sourceText), "MP4 files must not reference social posting token env names.", failures);
  assert(!/\b(sendInvoice|createInvoice|unlockVip|grantVip|entitlementBypass)\b/i.test(sourceText), "MP4 files must not add payment or VIP unlock behavior.", failures);

  const gitignore = read(".gitignore");
  assert(/data\/social-videos\/\*/.test(gitignore), "Generated social videos output must be ignored.", failures);

  const renderer = await getMp4RendererAvailability();
  assert(renderer.ffmpegAvailable, `ffmpeg unavailable. Install with: ${renderer.installHint}`, failures);
  if (renderer.ffmpegAvailable) {
    const result = await writeSocialMp4Bundle({
      scope: "date",
      date: "2026-07-02",
      rootDir: ROOT,
      maxPacks: 1,
    });
    assert(result.videosGenerated === 1, "MP4 QA smoke must render one video.", failures);
    for (const report of result.reports) validateRenderedReport(report, failures);
  }

  if (failures.length > 0) {
    console.error("Social MP4 Render QA: FAIL");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log("Social MP4 Render QA: PASS");
  console.log(`ffmpeg available : ${renderer.ffmpegAvailable ? "Yes" : "No"}`);
  console.log(`ffprobe available: ${renderer.ffprobeAvailable ? "Yes" : "No"}`);
  console.log("Smoke videos     : 1");
  console.log("API posting      : none");
  console.log("Social tokens    : none");
  console.log("Workflow changes : none");
  console.log("Telegram live    : untouched");
}

main().catch((error) => {
  console.error("Social MP4 Render QA: FAIL");
  console.error(`- ${error.message}`);
  process.exit(1);
});
