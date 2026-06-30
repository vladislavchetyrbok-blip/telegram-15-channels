import fs from "fs";
import path from "path";
import child_process from "child_process";
import process from "process";
import { buildSocialCalendar } from "./lib/social-manual-calendar-generator.mjs";

const ROOT = process.cwd();
const EXPECTED_SOCIAL_QA = "node scripts/check-social-manual-export.mjs && node scripts/check-social-calendar.mjs && node scripts/check-social-review-queue.mjs && node scripts/check-social-video-packs.mjs";
const CALENDAR_SOURCE_FILES = [
  "scripts/lib/social-manual-calendar-generator.mjs",
  "scripts/social-calendar-manual-plan.mjs",
  "scripts/lib/social-manual-export-generator.mjs",
  "scripts/social-export-manual-pack.mjs",
  "package.json",
  ".gitignore",
];
const FORBIDDEN_CHANGED_PATH_PREFIXES = [".github/workflows/"];
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

function validateCalendar(calendar, failures) {
  assert(calendar.mode === "manual_calendar_only", "Calendar mode must be manual_calendar_only.", failures);
  assert(calendar.daysPlan.length === calendar.days, "Calendar must include every date.", failures);
  assert(calendar.safety.instagramApiConnected === false, "Instagram API must be false.", failures);
  assert(calendar.safety.tiktokApiConnected === false, "TikTok API must be false.", failures);
  assert(calendar.safety.apiPosting === false, "API posting must be false.", failures);
  assert(calendar.safety.paymentsAdded === false, "Payments must be false.", failures);
  assert(calendar.safety.vipUnlockAdded === false, "VIP unlock must be false.", failures);

  const allItems = [];
  for (const day of calendar.daysPlan) {
    assert(day.date && /^\d{4}-\d{2}-\d{2}$/.test(day.date), `Day ${day.dayIndex} has invalid date.`, failures);
    assert(day.instagramReelsPlan?.items?.length >= 3, `${day.date}: missing Instagram items.`, failures);
    assert(day.tiktokPlan?.items?.length >= 3, `${day.date}: missing TikTok items.`, failures);
    assert(day.recommendedFirstPost?.itemId, `${day.date}: missing recommended first post.`, failures);
    assert(Array.isArray(day.weakPostWarnings), `${day.date}: missing weak-post warnings.`, failures);
    assert(Array.isArray(day.humanPolishNotes) && day.humanPolishNotes.length > 0, `${day.date}: missing human polish notes.`, failures);
    assert(Array.isArray(day.ctaNotes) && day.ctaNotes.length > 0, `${day.date}: missing CTA notes.`, failures);

    for (const platformPlan of day.platformPlans) {
      const types = new Set(platformPlan.items.map((item) => item.contentType));
      assert(types.has("mystic_card"), `${day.date} ${platformPlan.platform}: missing mystic card.`, failures);
      assert(types.has("daily_zodiac_reel"), `${day.date} ${platformPlan.platform}: missing sign-specific daily post.`, failures);
      assert(types.has("compatibility_hook") || types.has("birth_matrix_teaser"), `${day.date} ${platformPlan.platform}: missing compatibility/birth matrix rotation.`, failures);

      for (const item of platformPlan.items) {
        allItems.push(item);
        assert(item.cta?.url?.startsWith("https://t.me/"), `${item.id}: CTA must point to Telegram Mini App.`, failures);
        assert(!/dashboard|admin/i.test(item.cta?.url ?? ""), `${item.id}: CTA must not point to dashboard/admin.`, failures);
        if (item.role === "daily_sign_specific") {
          assert(
            day.weakPostWarnings.some((warning) => warning.includes("generated repeated template")),
            `${item.id}: repeated sign hook must have warning.`, failures
          );
        }
        if (item.contentType === "vip_preview_teaser") {
          assert(item.sourceItem?.vipBoundary?.access === "locked_preview_only", `${item.id}: VIP must stay locked preview only.`, failures);
          assert(item.sourceItem?.vipBoundary?.entitlementUnlock === "not_active", `${item.id}: VIP unlock must stay inactive.`, failures);
        }
      }
    }
  }

  const weeklyItems = allItems.filter((item) => item.contentType === "weekly_forecast_batch");
  const vipItems = allItems.filter((item) => item.contentType === "vip_preview_teaser");
  assert(weeklyItems.length >= Math.ceil(calendar.days / 7) * 2, "Weekly forecast batch must appear once per week on both platforms.", failures);
  assert(vipItems.length <= Math.ceil(calendar.days / 7) * 2, "VIP preview must not exceed once per week per platform.", failures);
}

function main() {
  const failures = [];
  const packageJson = JSON.parse(read("package.json"));
  assert(packageJson.scripts["social:calendar:dry"] === "node scripts/social-calendar-manual-plan.mjs --dry-run", "Missing social:calendar:dry script.", failures);
  assert(packageJson.scripts["social:calendar:7"] === "node scripts/social-calendar-manual-plan.mjs --days 7", "Missing social:calendar:7 script.", failures);
  assert(packageJson.scripts["social:calendar:14"] === "node scripts/social-calendar-manual-plan.mjs --days 14", "Missing social:calendar:14 script.", failures);
  assert(
    packageJson.scripts["social:qa"] === EXPECTED_SOCIAL_QA,
    "social:qa must run export and calendar QA.", failures
  );

  for (const changedFile of gitDiffNames()) {
    assert(!FORBIDDEN_CHANGED_PATH_PREFIXES.some((prefix) => changedFile.startsWith(prefix)), `Workflow changed unexpectedly: ${changedFile}`, failures);
    assert(!FORBIDDEN_CHANGED_FILES.includes(changedFile), `Telegram live publish file changed unexpectedly: ${changedFile}`, failures);
  }

  const sourceText = CALENDAR_SOURCE_FILES.filter((file) => fs.existsSync(path.join(ROOT, file))).map(read).join("\n");
  assert(!/\b(fetch|axios|request)\s*\(/i.test(sourceText), "Calendar files must not contain network client calls.", failures);
  assert(!/\b(sendMessage|sendPhoto|sendMediaGroup|sendVideo|publishLive|autopost|uploadVideo)\b/i.test(sourceText), "Calendar files must not contain posting calls.", failures);
  assert(!/\b(?:IG|INSTAGRAM|TIKTOK|TT)[A-Z0-9_]*(?:TOKEN|SECRET|ACCESS_KEY)\b/.test(sourceText), "Calendar files must not reference social posting token env names.", failures);
  assert(!/\b(sendInvoice|createInvoice|unlockVip|grantVip|entitlementBypass)\b/i.test(sourceText), "Calendar files must not add payment or VIP unlock behavior.", failures);

  const gitignore = read(".gitignore");
  assert(/data\/social-calendar\/\*/.test(gitignore), "Generated social calendar output must be ignored.", failures);

  validateCalendar(buildSocialCalendar({ startDate: "2026-07-02", days: 7 }), failures);
  validateCalendar(buildSocialCalendar({ startDate: "2026-07-02", days: 14 }), failures);

  if (failures.length > 0) {
    console.error("Social Calendar QA: FAIL");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log("Social Calendar QA: PASS");
  console.log("Durations checked  : 7 days, 14 days");
  console.log("Platforms checked  : instagram, tiktok");
  console.log("API posting        : none");
  console.log("Social tokens      : none");
  console.log("Workflow changes   : none");
  console.log("Telegram live      : untouched");
}

main();
