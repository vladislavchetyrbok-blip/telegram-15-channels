import fs from "fs";
import path from "path";
import child_process from "child_process";
import process from "process";
import {
  buildSocialReviewQueueForCalendar,
  buildSocialReviewQueueForDate,
} from "./lib/social-manual-review-queue-generator.mjs";

const ROOT = process.cwd();
const EXPECTED_SOCIAL_QA = "node scripts/check-social-manual-export.mjs && node scripts/check-social-calendar.mjs && node scripts/check-social-review-queue.mjs && node scripts/check-social-video-packs.mjs";
const REVIEW_SOURCE_FILES = [
  "scripts/lib/social-manual-review-queue-generator.mjs",
  "scripts/social-review-manual-queue.mjs",
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

function flattenText(value) {
  if (Array.isArray(value)) return value.map(flattenText).join("\n");
  if (value && typeof value === "object") return Object.values(value).map(flattenText).join("\n");
  return String(value ?? "");
}

function validateQueue(queue, expectedDays, failures) {
  assert(queue.mode === "manual_review_queue_only", "Review queue mode must be manual_review_queue_only.", failures);
  assert(queue.safety.instagramApiConnected === false, "Instagram API must be false.", failures);
  assert(queue.safety.tiktokApiConnected === false, "TikTok API must be false.", failures);
  assert(queue.safety.apiPosting === false, "API posting must be false.", failures);
  assert(queue.safety.networkUpload === false, "Network upload must be false.", failures);
  assert(queue.safety.paymentsAdded === false, "Payments must be false.", failures);
  assert(queue.safety.vipUnlockAdded === false, "VIP unlock must be false.", failures);
  assert(queue.daysPlan.length === expectedDays, "Review queue must include all requested dates.", failures);

  let totalItems = 0;
  let weakItems = 0;
  let vipItems = 0;
  for (const day of queue.daysPlan) {
    assert(day.topRecommendedPosts.length >= 3 && day.topRecommendedPosts.length <= 5, `${day.date}: expected 3-5 top posts.`, failures);
    assert(day.platformCopySheets.some((sheet) => sheet.platform === "instagram" && sheet.items.length > 0), `${day.date}: missing Instagram copy sheet items.`, failures);
    assert(day.platformCopySheets.some((sheet) => sheet.platform === "tiktok" && sheet.items.length > 0), `${day.date}: missing TikTok copy sheet items.`, failures);
    assert(day.readyToPostChecklist.length === day.topRecommendedPosts.length, `${day.date}: checklist must match top posts.`, failures);
    assert(day.ctaCheck.status === "pass", `${day.date}: CTA check must pass.`, failures);
    assert(day.vipPaymentSafetyCheck.status === "pass", `${day.date}: VIP/payment safety must pass.`, failures);

    const first = day.topRecommendedPosts[0];
    assert(first.contentType !== "vip_preview_teaser", `${day.date}: VIP preview must never be first.`, failures);
    assert(first.contentType === "mystic_card" || first.contentType === "birth_matrix_teaser", `${day.date}: first post should be high-priority content.`, failures);

    for (const item of day.topRecommendedPosts) {
      totalItems += 1;
      if (item.weakPostWarnings.length > 0) weakItems += 1;
      if (item.contentType === "vip_preview_teaser") vipItems += 1;
      assert(item.manualPostingStatus === "not_posted", `${item.sourceItemId}: manual posting status must be not_posted.`, failures);
      assert(item.postedManually === "No", `${item.sourceItemId}: posted manually must be No.`, failures);
      assert(item.cta?.url?.startsWith("https://t.me/"), `${item.sourceItemId}: CTA must point to Telegram.`, failures);
      assert(!/dashboard|admin/i.test(item.cta?.url ?? ""), `${item.sourceItemId}: CTA must not point to admin/dashboard.`, failures);
      assert(Array.isArray(item.voiceover) && item.voiceover.length > 0, `${item.sourceItemId}: missing voiceover.`, failures);
      assert(Array.isArray(item.onScreenText) && item.onScreenText.length > 0, `${item.sourceItemId}: missing on-screen text.`, failures);
      assert(item.caption && item.caption.includes("https://t.me/"), `${item.sourceItemId}: caption must include Telegram CTA.`, failures);
      assert(Array.isArray(item.hashtags) && item.hashtags.length >= 5, `${item.sourceItemId}: missing hashtags.`, failures);
      assert(/9:16|vertical/i.test(item.storyboardPrompt9x16 ?? ""), `${item.sourceItemId}: missing 9:16 storyboard.`, failures);
      if (item.contentType === "daily_zodiac_reel") {
        assert(item.humanPolishNeeded === "Yes", `${item.sourceItemId}: weak daily hook must need polish.`, failures);
      }
      if (item.contentType === "vip_preview_teaser") {
        assert(item.vipPaymentSafetyCheck.access === "locked_preview_only", `${item.sourceItemId}: VIP access must stay locked preview.`, failures);
        assert(item.vipPaymentSafetyCheck.entitlementUnlock === "not_active", `${item.sourceItemId}: VIP unlock must stay inactive.`, failures);
      }
      const text = flattenText(item);
      assert(!/\b(cure|diagnose|guaranteed profit|legal advice)\b/i.test(text), `${item.sourceItemId}: unsafe deterministic claim.`, failures);
    }
  }

  assert(totalItems === queue.summary.topPostsSelected, "Summary top post count must match items.", failures);
  assert(weakItems === queue.summary.weakPostsFlagged, "Summary weak post count must match items.", failures);
  assert(vipItems <= Math.ceil(expectedDays / 7) * 2, "VIP preview must stay within 1-2 per week.", failures);
  assert(queue.summary.readyToPostItems > 0, "At least one item should be ready for manual posting.", failures);
}

function main() {
  const failures = [];
  const packageJson = JSON.parse(read("package.json"));
  assert(packageJson.scripts["social:review:date"] === "node scripts/social-review-manual-queue.mjs", "Missing social:review:date script.", failures);
  assert(packageJson.scripts["social:review:calendar"] === "node scripts/social-review-manual-queue.mjs --calendar", "Missing social:review:calendar script.", failures);
  assert(packageJson.scripts["social:queue:7"] === "node scripts/social-review-manual-queue.mjs --calendar --days 7", "Missing social:queue:7 script.", failures);
  assert(packageJson.scripts["social:qa"] === EXPECTED_SOCIAL_QA, "social:qa must include review queue QA.", failures);

  for (const changedFile of gitDiffNames()) {
    assert(!FORBIDDEN_CHANGED_PATH_PREFIXES.some((prefix) => changedFile.startsWith(prefix)), `Forbidden path changed unexpectedly: ${changedFile}`, failures);
    assert(!FORBIDDEN_CHANGED_FILES.includes(changedFile), `Telegram live publish file changed unexpectedly: ${changedFile}`, failures);
  }

  const sourceText = REVIEW_SOURCE_FILES.filter((file) => fs.existsSync(path.join(ROOT, file))).map(read).join("\n");
  assert(!/\b(fetch|axios|request)\s*\(/i.test(sourceText), "Review queue files must not contain network client calls.", failures);
  assert(!/\b(sendMessage|sendPhoto|sendMediaGroup|sendVideo|publishLive|autopost|uploadVideo|uploadReel)\b/i.test(sourceText), "Review queue files must not contain posting calls.", failures);
  assert(!/\b(?:IG|INSTAGRAM|TIKTOK|TT)[A-Z0-9_]*(?:TOKEN|SECRET|ACCESS_KEY)\b/.test(sourceText), "Review queue files must not reference social posting token env names.", failures);
  assert(!/\b(sendInvoice|createInvoice|unlockVip|grantVip|entitlementBypass)\b/i.test(sourceText), "Review queue files must not add payment or VIP unlock behavior.", failures);

  const gitignore = read(".gitignore");
  assert(/data\/social-review\/\*/.test(gitignore), "Generated social review output must be ignored.", failures);

  validateQueue(buildSocialReviewQueueForDate({ date: "2026-07-02" }), 1, failures);
  validateQueue(buildSocialReviewQueueForCalendar({ startDate: "2026-07-02", days: 7 }), 7, failures);

  if (failures.length > 0) {
    console.error("Social Review Queue QA: FAIL");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log("Social Review Queue QA: PASS");
  console.log("Date queue checked    : 2026-07-02");
  console.log("Calendar queue checked: 7 days");
  console.log("API posting           : none");
  console.log("Social tokens         : none");
  console.log("Workflow changes      : none");
  console.log("Telegram live         : untouched");
}

main();
