import fs from "fs";
import path from "path";
import child_process from "child_process";
import process from "process";
import sharp from "sharp";
import {
  createStaticReferenceReelsPlan,
  requiredStaticReferenceOutputs,
  SOCIAL_REFERENCE_IMAGES_ROOT,
  SOCIAL_STATIC_REELS_ROOT,
  STATIC_REFERENCE_IMAGE_RELATIVE_PATH,
} from "./lib/social-static-reels-generator.mjs";
import { getMp4RendererAvailability } from "./lib/social-auto-mp4-generator.mjs";

const ROOT = process.cwd();
const START_DATE = "2026-07-02";
const DAYS = 7;
const REQUIRE_RENDERED_OUTPUT = process.argv.includes("--require-rendered-output");
const EXPECTED_SCRIPTS = {
  "social:static:pilot": "node scripts/social-static-reels-render.mjs --pilot",
  "social:static:7": "node scripts/social-static-reels-render.mjs --queue --days 7",
  "social:static:qa": "node scripts/check-social-static-reels.mjs",
  "social:static:reference:pilot": "node scripts/social-static-reels-render.mjs --pilot --reference",
  "social:static:reference:qa": "node scripts/check-social-static-reels.mjs --require-rendered-output",
};
const STATIC_SOURCE_FILES = [
  "scripts/lib/social-static-reels-generator.mjs",
  "scripts/social-static-reels-render.mjs",
  "package.json",
  ".gitignore",
];
const FORBIDDEN_CHANGED_PATH_PREFIXES = [".github/workflows/", "apps/"];
const FORBIDDEN_CHANGED_FILES = [
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/publish-zodiac-compatibility.mjs",
  "vercel.json",
];
const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".aac", ".m4a", ".flac", ".ogg"]);

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function assert(condition, message, failures) {
  if (!condition) failures.push(message);
}

function gitLines(args) {
  const result = child_process.spawnSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    shell: false,
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Unable to run git ${args.join(" ")}.`);
  }
  return result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function gitChangedNames() {
  return [...new Set([
    ...gitLines(["diff", "--name-only", "origin/main...HEAD"]),
    ...gitLines(["diff", "--name-only"]),
    ...gitLines(["diff", "--name-only", "--cached"]),
    ...gitLines(["ls-files", "--others", "--exclude-standard"]),
  ])];
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

function gitLsFiles(args) {
  return gitLines(["ls-files", ...args]);
}

function validateNoForbiddenSourceChanges(failures) {
  for (const changedFile of gitChangedNames()) {
    assert(!FORBIDDEN_CHANGED_PATH_PREFIXES.some((prefix) => changedFile.startsWith(prefix)), `Forbidden path changed unexpectedly: ${changedFile}`, failures);
    assert(!FORBIDDEN_CHANGED_FILES.includes(changedFile), `Forbidden publish/cron file changed unexpectedly: ${changedFile}`, failures);
  }
}

function validateSourceSafety(failures) {
  const packageJson = JSON.parse(read("package.json"));
  for (const [scriptName, command] of Object.entries(EXPECTED_SCRIPTS)) {
    assert(packageJson.scripts[scriptName] === command, `Missing ${scriptName} script.`, failures);
  }

  const sourceText = STATIC_SOURCE_FILES.filter((file) => fs.existsSync(path.join(ROOT, file))).map(read).join("\n");
  assert(!/\b(fetch|axios|request|XMLHttpRequest)\s*\(/i.test(sourceText), "Reference reels files must not contain network client calls.", failures);
  assert(!/\b(sendMessage|sendPhoto|sendMediaGroup|sendVideo|publishLive|autopost|uploadVideo|uploadReel|postToInstagram|postToTikTok)\b/i.test(sourceText), "Reference reels files must not contain social posting calls.", failures);
  assert(!/\b(?:GEMINI|VEO|RUNWAY|PIKA|CANVA|CAPCUT|OPENAI|IG|INSTAGRAM|TIKTOK|TT)[A-Z0-9_]*(?:TOKEN|SECRET|API_KEY|ACCESS_KEY)\b/.test(sourceText), "Reference reels files must not reference AI/social API key env names.", failures);
  assert(!/\b(sendInvoice|createInvoice|unlockVip|grantVip|entitlementBypass)\b/i.test(sourceText), "Reference reels files must not add payment or VIP unlock behavior.", failures);
  assert(!/\bposterSvg\b|<svg\b|canvas/i.test(sourceText), "Reference reels generator must not recreate premium artwork with SVG/canvas drawing.", failures);

  const gitignore = read(".gitignore");
  assert(/data\/social-static-reels\/\*/.test(gitignore), "Generated static reels output must be ignored.", failures);
  assert(/!data\/social-static-reels\/\.gitkeep/.test(gitignore), "Static reels .gitkeep must remain trackable.", failures);
  assert(/data\/social-reference-images\/\*/.test(gitignore), "Owner reference images must be ignored by git.", failures);
  assert(/!data\/social-reference-images\/\.gitkeep/.test(gitignore), "Reference image .gitkeep must remain trackable.", failures);

  const trackedStaticFiles = gitLsFiles([SOCIAL_STATIC_REELS_ROOT]);
  for (const trackedFile of trackedStaticFiles) {
    const ext = path.extname(trackedFile).toLowerCase();
    assert(trackedFile === `${SOCIAL_STATIC_REELS_ROOT}/.gitkeep`, `Generated static output must not be committed: ${trackedFile}`, failures);
    assert(!AUDIO_EXTENSIONS.has(ext), `Copyright-sensitive audio file must not be committed: ${trackedFile}`, failures);
  }

  const trackedReferenceFiles = gitLsFiles([SOCIAL_REFERENCE_IMAGES_ROOT]);
  for (const trackedFile of trackedReferenceFiles) {
    assert(trackedFile === `${SOCIAL_REFERENCE_IMAGES_ROOT}/.gitkeep`, `Owner reference image must not be committed: ${trackedFile}`, failures);
  }
}

async function validateOutputFiles({ outputFolder, report, failures }) {
  for (const fileName of requiredStaticReferenceOutputs()) {
    const filePath = path.join(outputFolder, fileName);
    assert(fs.existsSync(filePath), `${outputFolder}: missing ${fileName}.`, failures);
    if (fs.existsSync(filePath)) {
      assert(fs.statSync(filePath).size > 0, `${outputFolder}: empty ${fileName}.`, failures);
    }
  }

  assert(!fs.existsSync(path.join(outputFolder, "image-prompt.txt")), `${outputFolder}: image-prompt.txt must not be generated for reference-image reels.`, failures);

  const posterPath = path.join(outputFolder, "poster.png");
  if (fs.existsSync(posterPath)) {
    const metadata = await sharp(posterPath).metadata();
    assert(metadata.width === 1080, `${outputFolder}: poster width must be 1080.`, failures);
    assert(metadata.height === 1920, `${outputFolder}: poster height must be 1920.`, failures);
  }

  assert(gitCheckIgnored(path.join(outputFolder, "poster.png")), `${outputFolder}: poster.png must be ignored by git.`, failures);
  assert(gitCheckIgnored(path.join(outputFolder, "video.mp4")), `${outputFolder}: video.mp4 must be ignored by git.`, failures);
  assert(report.phase === "social_phase_1_package_h2", `${outputFolder}: report phase must be H.2.`, failures);
  assert(report.mode === "reference_image_reels_generator", `${outputFolder}: report mode must be reference image reels.`, failures);
  assert(report.specs?.referenceImageUsed === true, `${outputFolder}: reference image must be used.`, failures);
  assert(report.specs?.visualMatchesReference === true, `${outputFolder}: final visual must match reference.`, failures);
  assert(Array.isArray(report.specs?.extraOverlayText) && report.specs.extraOverlayText.length === 0, `${outputFolder}: extra overlay text must be empty.`, failures);
  assert(report.specs?.largeTextOverlays === false, `${outputFolder}: large generated text overlays must be disabled.`, failures);
  assert(report.specs?.paragraphs === false, `${outputFolder}: paragraphs must be disabled.`, failures);
  assert(report.specs?.cheapOverlayBlocks === false, `${outputFolder}: cheap overlay blocks must be disabled.`, failures);
  assert(/Ken Burns/i.test(report.specs?.motion ?? ""), `${outputFolder}: video motion must be subtle Ken Burns.`, failures);
  assert(report.safety?.ctaSafe === true, `${outputFolder}: CTA safety must pass.`, failures);
  assert(report.safety?.noAdminDashboardUrl === true, `${outputFolder}: admin/dashboard URL must be absent.`, failures);
  assert(report.safety?.noPaymentScreen === true, `${outputFolder}: payment screen must be absent.`, failures);
  assert(report.safety?.noVipUnlock === true, `${outputFolder}: VIP unlock must be absent.`, failures);
  assert(report.safety?.apiPosting === false, `${outputFolder}: API posting must be false.`, failures);
  assert(report.safety?.socialPosting === false, `${outputFolder}: social posting must be false.`, failures);
  assert(report.safety?.socialTokens === false, `${outputFolder}: social tokens must be false.`, failures);
  assert(report.safety?.externalAiApisUsed === false, `${outputFolder}: external AI APIs must be false.`, failures);
  assert(report.safety?.copyrightedMusicEmbedded === false, `${outputFolder}: copyrighted music must not be embedded.`, failures);
  assert(report.renderer?.audioEmbedded === false, `${outputFolder}: default reference reel must be silent.`, failures);
}

function validateProbe({ report, failures }) {
  assert(report.probe && !report.probe.parseError, `${report.outputFolder}: ffprobe metadata must be available.`, failures);
  if (report.probe && !report.probe.parseError) {
    assert(report.probe.width === 1080, `${report.outputFolder}: video width must be 1080.`, failures);
    assert(report.probe.height === 1920, `${report.outputFolder}: video height must be 1920.`, failures);
    assert(report.probe.durationSeconds >= 8 && report.probe.durationSeconds <= 12, `${report.outputFolder}: duration must be 8-12 seconds.`, failures);
  }
}

async function main() {
  const failures = [];
  validateNoForbiddenSourceChanges(failures);
  validateSourceSafety(failures);

  const renderer = await getMp4RendererAvailability();
  assert(renderer.ffmpegAvailable, `ffmpeg unavailable. Install with: ${renderer.installHint}`, failures);
  assert(renderer.ffprobeAvailable, `ffprobe unavailable. Install with: ${renderer.installHint}`, failures);

  const plan = createStaticReferenceReelsPlan({ startDate: START_DATE, days: DAYS, pilotOnly: true, rootDir: ROOT });
  assert(plan.plannedVideos === 1, "Reference reels pilot QA must target one video only.", failures);
  assert(plan.selectedItem === "2026-07-02-instagram-mystic-card", "Reference reels pilot must select Instagram Mystic Card / The Star.", failures);
  assert(plan.referenceImageFound === true, `Reference image missing: ${plan.referenceImagePath}`, failures);
  assert(gitCheckIgnored(path.join(ROOT, STATIC_REFERENCE_IMAGE_RELATIVE_PATH)), "Owner reference image path must be ignored by git.", failures);

  const outputFolder = path.join(ROOT, plan.selectedOutputFolder);
  const reportPath = path.join(outputFolder, "render-report.json");
  let report = null;
  if (plan.referenceImageFound) {
    if (fs.existsSync(reportPath)) {
      const candidateReport = JSON.parse(fs.readFileSync(reportPath, "utf8"));
      if (candidateReport.phase === "social_phase_1_package_h2") {
        report = candidateReport;
        await validateOutputFiles({ outputFolder, report, failures });
        validateProbe({ report, failures });
      } else if (REQUIRE_RENDERED_OUTPUT) {
        assert(false, `${outputFolder}: H.2 render-report.json missing or stale. Run social:static:reference:pilot first.`, failures);
      }
    } else if (REQUIRE_RENDERED_OUTPUT) {
      assert(fs.existsSync(outputFolder), `Reference reels pilot output folder missing: ${outputFolder}`, failures);
      assert(false, `${outputFolder}: render-report.json missing. Run social:static:reference:pilot first.`, failures);
    }
  }

  if (failures.length > 0) {
    console.error("Social Static Reference Reels QA: FAIL");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log("Social Static Reference Reels QA: PASS");
  console.log(`Reference image : ${plan.referenceImagePath}`);
  console.log(`Pilot item      : ${plan.selectedItemId}`);
  console.log(`Output folder   : ${outputFolder}`);
  console.log("Resolution      : 1080x1920");
  console.log(`Duration        : ${report?.probe?.durationSeconds ? `${report.probe.durationSeconds.toFixed(2)}s` : "pending render"}`);
  console.log("Extra text      : none");
  console.log("Visual source   : owner reference image");
  console.log("External APIs   : none");
  console.log("Social APIs     : none");
  console.log("Posting/upload  : none");
  console.log("Generated output: ignored by git");
}

main().catch((error) => {
  console.error("Social Static Reference Reels QA: FAIL");
  console.error(`- ${error.message}`);
  process.exit(1);
});
