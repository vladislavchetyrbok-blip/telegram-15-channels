import fs from "fs";
import path from "path";
import child_process from "child_process";
import process from "process";
import { CONTENT_TYPES, PLATFORMS, buildSocialExportBundle } from "./lib/social-manual-export-generator.mjs";

const ROOT = process.cwd();
const EXPECTED_SOCIAL_QA = "node scripts/check-social-manual-export.mjs && node scripts/check-social-calendar.mjs && node scripts/check-social-review-queue.mjs";
const SOCIAL_FILES = [
  "scripts/lib/social-manual-export-generator.mjs",
  "scripts/social-export-manual-pack.mjs",
  "scripts/lib/social-manual-calendar-generator.mjs",
  "scripts/social-calendar-manual-plan.mjs",
  "package.json",
  ".gitignore",
];

const FORBIDDEN_CHANGED_PATH_PREFIXES = [
  ".github/workflows/",
];

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
  if (result.error || result.status !== 0) {
    throw new Error("Unable to inspect git diff against origin/main.");
  }
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

function validatePack(pack, failures) {
  assert(PLATFORMS.includes(pack.platform), `Unsupported platform ${pack.platform}.`, failures);
  assert(pack.mode === "manual_export_only", `${pack.platform}: mode must be manual_export_only.`, failures);
  assert(pack.safety.instagramApiConnected === false, `${pack.platform}: Instagram API must be false.`, failures);
  assert(pack.safety.tiktokApiConnected === false, `${pack.platform}: TikTok API must be false.`, failures);
  assert(pack.safety.apiPosting === false, `${pack.platform}: apiPosting must be false.`, failures);

  const types = new Set(pack.items.map((item) => item.contentType));
  for (const contentType of CONTENT_TYPES) {
    assert(types.has(contentType), `${pack.platform}: missing content type ${contentType}.`, failures);
  }

  for (const item of pack.items) {
    assert(item.hook && item.hook.length >= 12, `${item.id}: missing hook.`, failures);
    assert(item.durationSeconds >= 20 && item.durationSeconds <= 35, `${item.id}: duration must be 20-35 seconds.`, failures);
    assert(Array.isArray(item.shortVideoScript) && item.shortVideoScript.length >= 4, `${item.id}: missing short video script.`, failures);
    assert(Array.isArray(item.sceneBeats) && item.sceneBeats.length >= 4, `${item.id}: missing scene beats.`, failures);
    assert(Array.isArray(item.voiceover) && item.voiceover.length >= 2, `${item.id}: missing voiceover.`, failures);
    assert(Array.isArray(item.onScreenText) && item.onScreenText.length >= 3, `${item.id}: missing on-screen text.`, failures);
    assert(item.caption && item.caption.includes("https://t.me/"), `${item.id}: caption must include Telegram CTA.`, failures);
    assert(Array.isArray(item.hashtags) && item.hashtags.length >= 5, `${item.id}: missing hashtags.`, failures);
    assert(item.cta?.url?.startsWith("https://t.me/"), `${item.id}: CTA must point to Telegram startapp.`, failures);
    assert(!/dashboard|admin/i.test(item.cta?.url ?? ""), `${item.id}: CTA must not point to admin/dashboard.`, failures);
    assert(/9:16|vertical/i.test(item.storyboardPrompt9x16 ?? ""), `${item.id}: missing 9:16 storyboard prompt.`, failures);
    assert(item.reviewStatus, `${item.id}: missing review status.`, failures);

    const text = flattenText(item);
    assert(!/\b(cure|diagnose|guaranteed profit|legal advice)\b/i.test(text), `${item.id}: unsafe deterministic claim.`, failures);
    if (item.contentType === "vip_preview_teaser") {
      assert(item.vipBoundary?.access === "locked_preview_only", `${item.id}: VIP must stay locked preview only.`, failures);
      assert(item.vipBoundary?.entitlementUnlock === "not_active", `${item.id}: VIP unlock must not be active.`, failures);
    }
  }
}

function main() {
  const failures = [];
  const packageJson = JSON.parse(read("package.json"));

  assert(packageJson.scripts["social:export:dry"] === "node scripts/social-export-manual-pack.mjs --dry-run", "Missing social:export:dry script.", failures);
  assert(packageJson.scripts["social:export:date"] === "node scripts/social-export-manual-pack.mjs", "Missing social:export:date script.", failures);
  assert(
    packageJson.scripts["social:qa"] === EXPECTED_SOCIAL_QA,
    "social:qa must run export and calendar QA.", failures
  );

  const changed = gitDiffNames();
  for (const changedFile of changed) {
    assert(!FORBIDDEN_CHANGED_PATH_PREFIXES.some((prefix) => changedFile.startsWith(prefix)), `Workflow changed unexpectedly: ${changedFile}`, failures);
    assert(!FORBIDDEN_CHANGED_FILES.includes(changedFile), `Telegram live publish file changed unexpectedly: ${changedFile}`, failures);
  }

  const sourceText = SOCIAL_FILES.filter((file) => fs.existsSync(path.join(ROOT, file))).map(read).join("\n");
  assert(!/\b(fetch|axios|request)\s*\(/i.test(sourceText), "Social export files must not contain network client calls.", failures);
  assert(!/\b(sendMessage|sendPhoto|sendMediaGroup|sendVideo|publishLive|autopost|uploadVideo)\b/i.test(sourceText), "Social export files must not contain posting calls.", failures);
  assert(!/\b(?:IG|INSTAGRAM|TIKTOK|TT)[A-Z0-9_]*(?:TOKEN|SECRET|ACCESS_KEY)\b/.test(sourceText), "Social export files must not reference social posting token env names.", failures);
  assert(!/\b(sendInvoice|createInvoice|unlockVip|grantVip|entitlementBypass)\b/i.test(sourceText), "Social export files must not add payment or VIP unlock behavior.", failures);

  const gitignore = read(".gitignore");
  assert(/data\/social-exports\/\*/.test(gitignore), "Generated social export output must be ignored.", failures);

  const bundle = buildSocialExportBundle({ date: "2026-07-02" });
  assert(bundle.platforms.length === 2, "Expected two platform packs.", failures);
  for (const pack of bundle.platforms) validatePack(pack, failures);

  if (failures.length > 0) {
    console.error("Social Manual Export QA: FAIL");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  const totalItems = bundle.platforms.reduce((sum, pack) => sum + pack.items.length, 0);
  console.log("Social Manual Export QA: PASS");
  console.log(`Platforms checked : ${bundle.platforms.length}`);
  console.log(`Items checked     : ${totalItems}`);
  console.log(`Content types     : ${CONTENT_TYPES.join(", ")}`);
  console.log("API posting       : none");
  console.log("Social tokens     : none");
  console.log("Workflow changes  : none");
  console.log("Telegram live     : untouched");
}

main();
