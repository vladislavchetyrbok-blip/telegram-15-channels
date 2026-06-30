import fs from "fs";
import path from "path";
import child_process from "child_process";
import process from "process";
import { buildSocialVideoPackBundle } from "./lib/social-video-production-pack-generator.mjs";

const ROOT = process.cwd();
const EXPECTED_SOCIAL_QA = "node scripts/check-social-manual-export.mjs && node scripts/check-social-calendar.mjs && node scripts/check-social-review-queue.mjs && node scripts/check-social-video-packs.mjs";
const VIDEO_SOURCE_FILES = [
  "scripts/lib/social-video-production-pack-generator.mjs",
  "scripts/social-video-production-pack.mjs",
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
const REQUIRED_FILES = [
  "video-brief.json",
  "video-brief.md",
  "voiceover.txt",
  "on-screen-text.txt",
  "caption.txt",
  "hashtags.txt",
  "storyboard.md",
  "capcut-steps.md",
  "canva-steps.md",
  "thumbnail-prompt.txt",
  "subtitles.srt",
  "posting-checklist.md",
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

function validateBundle(bundle, expectedDays, failures) {
  assert(bundle.mode === "manual_video_production_pack_only", "Video bundle mode must be manual_video_production_pack_only.", failures);
  assert(bundle.days === expectedDays, "Video bundle must include requested days.", failures);
  assert(bundle.safety.instagramApiConnected === false, "Instagram API must be false.", failures);
  assert(bundle.safety.tiktokApiConnected === false, "TikTok API must be false.", failures);
  assert(bundle.safety.apiPosting === false, "API posting must be false.", failures);
  assert(bundle.safety.networkUpload === false, "Network upload must be false.", failures);
  assert(bundle.safety.paymentsAdded === false, "Payments must be false.", failures);
  assert(bundle.safety.vipUnlockAdded === false, "VIP unlock must be false.", failures);
  assert(bundle.packs.length > 0, "Expected video packs.", failures);
  assert(bundle.summary.videoPacks === bundle.packs.length, "Summary pack count must match.", failures);
  assert(bundle.summary.ctaSafe === true, "CTA safety must pass.", failures);
  assert(bundle.summary.vipPaymentSafe === true, "VIP/payment safety must pass.", failures);

  for (const pack of bundle.packs) {
    assert(pack.brief.format.aspectRatio === "9:16", `${pack.folderName}: expected 9:16.`, failures);
    assert(pack.brief.format.resolution === "1080x1920", `${pack.folderName}: expected 1080x1920.`, failures);
    assert(pack.brief.format.durationSeconds >= 20 && pack.brief.format.durationSeconds <= 35, `${pack.folderName}: duration must be 20-35 seconds.`, failures);
    assert(pack.brief.scenes.length === 4, `${pack.folderName}: expected four scenes.`, failures);
    assert(pack.brief.cta?.url?.startsWith("https://t.me/"), `${pack.folderName}: CTA must point to Telegram.`, failures);
    assert(!/dashboard|admin/i.test(pack.brief.cta?.url ?? ""), `${pack.folderName}: CTA must not point to admin/dashboard.`, failures);
    assert(pack.brief.safety.noPaymentScreen === true, `${pack.folderName}: payment screen must be false.`, failures);
    assert(pack.brief.safety.noVipUnlock === true, `${pack.folderName}: VIP unlock must be false.`, failures);
    if (pack.brief.contentType === "vip_preview_teaser") {
      assert(pack.brief.safety.vipPaymentSafe === true, `${pack.folderName}: VIP preview must be locked/payment safe.`, failures);
    }

    for (const fileName of REQUIRED_FILES) {
      assert(Object.hasOwn(pack.files, fileName), `${pack.folderName}: missing ${fileName}.`, failures);
      assert(String(pack.files[fileName]).trim().length > 0, `${pack.folderName}: empty ${fileName}.`, failures);
    }
    assert(/-->/.test(pack.files["subtitles.srt"]), `${pack.folderName}: subtitles.srt must contain SRT timings.`, failures);
    assert(/CapCut Steps/.test(pack.files["capcut-steps.md"]), `${pack.folderName}: missing CapCut steps.`, failures);
    assert(/Canva Steps/.test(pack.files["canva-steps.md"]), `${pack.folderName}: missing Canva steps.`, failures);
    assert(/CTA/.test(pack.files["posting-checklist.md"]), `${pack.folderName}: checklist must include CTA.`, failures);
  }
}

function main() {
  const failures = [];
  const packageJson = JSON.parse(read("package.json"));
  assert(packageJson.scripts["social:video:date"] === "node scripts/social-video-production-pack.mjs", "Missing social:video:date script.", failures);
  assert(packageJson.scripts["social:video:queue"] === "node scripts/social-video-production-pack.mjs --queue", "Missing social:video:queue script.", failures);
  assert(packageJson.scripts["social:video:7"] === "node scripts/social-video-production-pack.mjs --queue --days 7", "Missing social:video:7 script.", failures);
  assert(packageJson.scripts["social:qa"] === EXPECTED_SOCIAL_QA, "social:qa must include video pack QA.", failures);

  for (const changedFile of gitDiffNames()) {
    assert(!FORBIDDEN_CHANGED_PATH_PREFIXES.some((prefix) => changedFile.startsWith(prefix)), `Forbidden path changed unexpectedly: ${changedFile}`, failures);
    assert(!FORBIDDEN_CHANGED_FILES.includes(changedFile), `Telegram live publish file changed unexpectedly: ${changedFile}`, failures);
  }

  const sourceText = VIDEO_SOURCE_FILES.filter((file) => fs.existsSync(path.join(ROOT, file))).map(read).join("\n");
  assert(!/\b(fetch|axios|request)\s*\(/i.test(sourceText), "Video pack files must not contain network client calls.", failures);
  assert(!/\b(sendMessage|sendPhoto|sendMediaGroup|sendVideo|publishLive|autopost|uploadVideo|uploadReel)\b/i.test(sourceText), "Video pack files must not contain posting calls.", failures);
  assert(!/\b(?:IG|INSTAGRAM|TIKTOK|TT)[A-Z0-9_]*(?:TOKEN|SECRET|ACCESS_KEY)\b/.test(sourceText), "Video pack files must not reference social posting token env names.", failures);
  assert(!/\b(sendInvoice|createInvoice|unlockVip|grantVip|entitlementBypass)\b/i.test(sourceText), "Video pack files must not add payment or VIP unlock behavior.", failures);

  const gitignore = read(".gitignore");
  assert(/data\/social-video-packs\/\*/.test(gitignore), "Generated social video pack output must be ignored.", failures);

  validateBundle(buildSocialVideoPackBundle({ scope: "date", date: "2026-07-02" }), 1, failures);
  validateBundle(buildSocialVideoPackBundle({ scope: "queue", startDate: "2026-07-02", days: 7 }), 7, failures);

  if (failures.length > 0) {
    console.error("Social Video Pack QA: FAIL");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log("Social Video Pack QA: PASS");
  console.log("Date packs checked   : 2026-07-02");
  console.log("Queue packs checked  : 7 days");
  console.log("API posting          : none");
  console.log("Social tokens        : none");
  console.log("Workflow changes     : none");
  console.log("Telegram live        : untouched");
}

main();
