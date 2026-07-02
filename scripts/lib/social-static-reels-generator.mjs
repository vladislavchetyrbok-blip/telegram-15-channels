import fs from "fs";
import path from "path";
import process from "process";
import child_process from "child_process";
import sharp from "sharp";
import { buildSocialVideoPackBundle } from "./social-video-production-pack-generator.mjs";
import { getMp4RendererAvailability } from "./social-auto-mp4-generator.mjs";

export const SOCIAL_STATIC_REELS_ROOT = "data/social-static-reels";
export const SOCIAL_REFERENCE_IMAGES_ROOT = "data/social-reference-images";
export const STATIC_REFERENCE_IMAGE_RELATIVE_PATH = path.join(
  SOCIAL_REFERENCE_IMAGES_ROOT,
  "mystic-card-star-reference.png",
);

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;
const DURATION_SECONDS = 10;
const TINY_HANDLE = "@zodiac_love_check_bot";
const PILOT_TARGET = {
  platform: "instagram",
  contentType: "mystic_card",
  sourceItemId: "2026-07-02-instagram-mystic-card",
};
const REQUIRED_REFERENCE_OUTPUTS = [
  "poster.png",
  "video.mp4",
  "caption.txt",
  "hashtags.txt",
  "music-suggestion.txt",
  "posting-checklist.md",
  "render-report.json",
];
const SAFETY = {
  instagramApiConnected: false,
  tiktokApiConnected: false,
  apiPosting: false,
  networkUpload: false,
  socialTokensRequired: false,
  telegramLivePublishTouched: false,
  paymentsAdded: false,
  vipUnlockAdded: false,
  cronOrWorkflowChanged: false,
  externalAiApisUsed: false,
  copyrightedMusicEmbedded: false,
};

function assertIsoDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) throw new Error("Expected YYYY-MM-DD date.");
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error("Expected a real calendar date in YYYY-MM-DD format.");
  }
}

function assertDays(days) {
  if (![7, 14].includes(days)) throw new Error("Expected --days 7 or --days 14.");
}

function addDays(date, amount) {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + amount);
  return parsed.toISOString().slice(0, 10);
}

function dateRangeLabel(startDate, days) {
  return `${startDate}_to_${addDays(startDate, days - 1)}`;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150);
}

function runBinary(binaryPath, args, options = {}) {
  const result = child_process.spawnSync(binaryPath, args, {
    encoding: "utf8",
    shell: false,
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`${path.basename(binaryPath)} failed: ${(result.stderr || result.stdout || "").slice(0, 1600)}`);
  }
  return result;
}

function parseFrameRate(value) {
  if (!value || typeof value !== "string") return null;
  const [num, den] = value.split("/").map(Number);
  if (!num || !den) return null;
  return Number((num / den).toFixed(2));
}

function probeVideo({ videoPath, renderer }) {
  const result = runBinary(renderer.ffprobePath, [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height,duration,avg_frame_rate,r_frame_rate",
    "-show_entries", "format=duration",
    "-of", "json",
    videoPath,
  ]);
  try {
    const parsed = JSON.parse(result.stdout);
    const stream = parsed.streams?.[0] ?? {};
    return {
      width: Number(stream.width),
      height: Number(stream.height),
      durationSeconds: Number(stream.duration ?? parsed.format?.duration),
      avgFrameRate: parseFrameRate(stream.avg_frame_rate),
      rFrameRate: parseFrameRate(stream.r_frame_rate),
    };
  } catch {
    return { parseError: true };
  }
}

function selectPilotPack(bundle) {
  const exact = bundle.packs.find((pack) => (
    pack.brief.platform === PILOT_TARGET.platform
    && pack.brief.contentType === PILOT_TARGET.contentType
    && pack.brief.sourceItemId === PILOT_TARGET.sourceItemId
  ));
  if (exact) return exact;
  throw new Error("Unable to select static reference reels pilot item.");
}

function outputRootFor({ startDate, days }) {
  return path.join(SOCIAL_STATIC_REELS_ROOT, dateRangeLabel(startDate, days));
}

function outputFolderForPack({ startDate, days, pack }) {
  return path.join(outputRootFor({ startDate, days }), slugify(pack.folderName));
}

function buildInputBundle({ startDate, days }) {
  assertIsoDate(startDate);
  assertDays(days);
  return buildSocialVideoPackBundle({ scope: "queue", startDate, days });
}

function ctaSafe(brief) {
  const url = brief.cta?.url ?? "";
  return url.startsWith("https://t.me/") && !/dashboard|admin/i.test(url);
}

function resolveReferenceImage(rootDir) {
  return path.join(rootDir, STATIC_REFERENCE_IMAGE_RELATIVE_PATH);
}

function assertReferenceImage(referenceImagePath) {
  if (!fs.existsSync(referenceImagePath)) {
    throw new Error(`Reference image missing: ${referenceImagePath}. Place the owner-approved premium tarot poster PNG there before rendering.`);
  }
}

function assertSafeOutputFolder({ rootDir, outputFolder }) {
  const allowedRoot = path.resolve(rootDir, SOCIAL_STATIC_REELS_ROOT);
  const resolvedOutput = path.resolve(outputFolder);
  if (resolvedOutput !== allowedRoot && !resolvedOutput.startsWith(`${allowedRoot}${path.sep}`)) {
    throw new Error(`Unsafe static reels output folder: ${outputFolder}`);
  }
}

async function renderReferencePoster({ referenceImagePath, posterPath }) {
  const reference = sharp(referenceImagePath).rotate();
  const metadata = await reference.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Reference image cannot be read as an image: ${referenceImagePath}`);
  }

  const background = await sharp(referenceImagePath)
    .rotate()
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "center" })
    .blur(18)
    .modulate({ brightness: 0.78, saturation: 0.92 })
    .png()
    .toBuffer();

  const foreground = await sharp(referenceImagePath)
    .rotate()
    .resize(WIDTH, HEIGHT, {
      fit: "contain",
      position: "center",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp(background)
    .composite([{ input: foreground, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(posterPath);
}

function renderVideo({ renderer, posterPath, videoPath, audioPath = null }) {
  const zoomFilter = [
    "scale=1130:2009",
    `zoompan=z='min(zoom+0.00035,1.030)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${DURATION_SECONDS * FPS}:s=${WIDTH}x${HEIGHT}:fps=${FPS}`,
    "format=yuv420p",
  ].join(",");
  const args = [
    "-y",
    "-loop", "1",
    "-i", posterPath,
  ];

  if (audioPath) {
    args.push("-i", audioPath);
  }

  args.push(
    "-t", String(DURATION_SECONDS),
    "-vf", zoomFilter,
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "18",
  );

  if (audioPath) {
    args.push("-map", "0:v:0", "-map", "1:a:0", "-shortest", "-c:a", "aac", "-b:a", "128k");
  } else {
    args.push("-an");
  }

  args.push("-movflags", "+faststart", videoPath);
  runBinary(renderer.ffmpegPath, args);
}

function buildMusicSuggestion() {
  return `${[
    "# Music Suggestion",
    "",
    "Do not embed copyrighted music by default.",
    "",
    "1. Add calm mystical / ambient trending sound manually inside Instagram or TikTok after owner visual review.",
    "2. Use an optional royalty-free ambient track later only if the owner provides the file and confirms the license.",
    "3. Keep this generated version as a silent preview by default.",
    "",
    "Optional later: render with --audio path/to/owner-provided-royalty-free.mp3.",
    "",
  ].join("\n")}`;
}

function buildPostingChecklist({ pack, audioPath, referenceImagePath }) {
  return `${[
    "# Reference Image Reels Posting Checklist",
    "",
    `- Platform: ${pack.brief.platform}`,
    `- Source item: ${pack.brief.sourceItemId}`,
    `- Reference image: ${referenceImagePath}`,
    "- Visual format: 1080x1920",
    "- Duration: 8-12 seconds",
    "- Main artwork: owner-approved reference image",
    "- Extra overlay text: None",
    "- Large generated text overlays: No",
    "- Paragraphs: No",
    "- Cheap overlay blocks: No",
    `- Tiny handle allowed: ${TINY_HANDLE}`,
    "- CTA placement: caption, not heavy on video",
    `- CTA URL safe: ${ctaSafe(pack.brief) ? "Yes" : "No"}`,
    `- CTA URL: ${pack.brief.cta?.url ?? ""}`,
    "- No admin/dashboard URL: Yes",
    "- No payment screen: Yes",
    "- No VIP unlock: Yes",
    "- Music embedded by repo: No by default",
    `- Optional owner-provided audio used: ${audioPath ? "Yes" : "No"}`,
    "- Posted manually: No",
    "",
  ].join("\n")}`;
}

function buildCaption(pack) {
  const ctaUrl = pack.brief.cta?.url;
  const caption = (pack.files["caption.txt"] || "").trim();
  if (!ctaUrl) return `${caption}\n`;

  const ctaLabel = "Открыть карту дня в Telegram";
  const lines = caption
    .split(/\r?\n/)
    .filter((line) => !line.includes(ctaUrl) && !/Открыть карту дня/i.test(line));
  const body = lines.join("\n").trim();
  return `${body}\n${ctaLabel}: ${ctaUrl}\n`;
}

function buildHashtags(pack) {
  return pack.files["hashtags.txt"] || "#astrology #tarot #mystic\n";
}

async function renderReferenceReelPack({
  pack,
  outputFolder,
  renderer,
  rootDir,
  audioPath = null,
}) {
  if (!ctaSafe(pack.brief)) {
    throw new Error(`Unsafe CTA for ${pack.brief.sourceItemId}: ${pack.brief.cta?.url ?? ""}`);
  }
  if (audioPath && !fs.existsSync(audioPath)) {
    throw new Error(`Optional audio file does not exist: ${audioPath}`);
  }

  const referenceImagePath = resolveReferenceImage(rootDir);
  assertReferenceImage(referenceImagePath);
  assertSafeOutputFolder({ rootDir, outputFolder });
  fs.rmSync(outputFolder, { recursive: true, force: true });
  fs.mkdirSync(outputFolder, { recursive: true });

  const posterPath = path.join(outputFolder, "poster.png");
  const videoPath = path.join(outputFolder, "video.mp4");
  await renderReferencePoster({ referenceImagePath, posterPath });
  renderVideo({ renderer, posterPath, videoPath, audioPath });

  fs.writeFileSync(path.join(outputFolder, "caption.txt"), buildCaption(pack), "utf8");
  fs.writeFileSync(path.join(outputFolder, "hashtags.txt"), buildHashtags(pack), "utf8");
  fs.writeFileSync(path.join(outputFolder, "music-suggestion.txt"), buildMusicSuggestion(), "utf8");
  fs.writeFileSync(
    path.join(outputFolder, "posting-checklist.md"),
    buildPostingChecklist({ pack, audioPath, referenceImagePath }),
    "utf8",
  );

  const probe = renderer.ffprobeAvailable ? probeVideo({ videoPath, renderer }) : null;
  const report = {
    schemaVersion: 2,
    phase: "social_phase_1_package_h2",
    mode: "reference_image_reels_generator",
    sourceItemId: pack.brief.sourceItemId,
    platform: pack.brief.platform,
    contentType: pack.brief.contentType,
    outputFolder,
    referenceImagePath,
    posterPath,
    videoPath,
    captionPath: path.join(outputFolder, "caption.txt"),
    hashtagsPath: path.join(outputFolder, "hashtags.txt"),
    musicSuggestionPath: path.join(outputFolder, "music-suggestion.txt"),
    renderer: {
      technology: "owner reference image + sharp normalization + ffmpeg subtle Ken Burns zoom",
      ffmpegAvailable: renderer.ffmpegAvailable,
      ffprobeAvailable: renderer.ffprobeAvailable,
      externalApisUsed: false,
      audioEmbedded: Boolean(audioPath),
      audioSource: audioPath ? "owner_provided_optional_local_file" : "none",
      outputFps: FPS,
    },
    specs: {
      width: WIDTH,
      height: HEIGHT,
      aspectRatio: "9:16",
      targetDurationSeconds: DURATION_SECONDS,
      sourceArtwork: "owner_provided_ai_reference_image",
      referenceImageUsed: true,
      visualMatchesReference: true,
      motion: "subtle slow zoom / Ken Burns only; no fast cuts",
      extraOverlayText: [],
      tinyHandleAllowed: TINY_HANDLE,
      largeTextOverlays: false,
      paragraphs: false,
      cheapOverlayBlocks: false,
      textRule: "preserve any text already present in the reference; do not add new large overlays",
      safeArea: "reference artwork preserved; caption carries Telegram CTA",
    },
    probe,
    safety: {
      ...SAFETY,
      ctaSafe: ctaSafe(pack.brief),
      noAdminDashboardUrl: !/dashboard|admin/i.test(pack.brief.cta?.url ?? ""),
      noPaymentScreen: true,
      noVipUnlock: true,
      vipPaymentSafe: pack.brief.safety.vipPaymentSafe,
      socialPosting: false,
      socialTokens: false,
      copyrightedMusicEmbedded: false,
    },
  };
  fs.writeFileSync(path.join(outputFolder, "render-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return report;
}

function buildStaticBundle({ startDate, days, pilotOnly = false }) {
  const bundle = buildInputBundle({ startDate, days });
  const packs = pilotOnly ? [selectPilotPack(bundle)] : bundle.packs;
  const outputRoot = outputRootFor({ startDate, days });
  return {
    schemaVersion: 2,
    phase: "social_phase_1_package_h2",
    startDate,
    endDate: addDays(startDate, days - 1),
    days,
    outputRoot,
    packs,
    pilotOnly,
  };
}

export function createStaticReferenceReelsPlan({
  startDate,
  days = 7,
  pilotOnly = false,
  rootDir = process.cwd(),
}) {
  const bundle = buildStaticBundle({ startDate, days, pilotOnly });
  const selectedPack = pilotOnly ? bundle.packs[0] : null;
  const referenceImagePath = resolveReferenceImage(rootDir);
  return {
    startDate: bundle.startDate,
    endDate: bundle.endDate,
    days: bundle.days,
    outputRoot: bundle.outputRoot,
    plannedVideos: bundle.packs.length,
    targetResolution: `${WIDTH}x${HEIGHT}`,
    targetDurationSeconds: DURATION_SECONDS,
    pilotOnly: bundle.pilotOnly,
    selectedItem: selectedPack?.brief.sourceItemId,
    selectedItemId: selectedPack ? slugify(selectedPack.folderName) : undefined,
    selectedOutputFolder: selectedPack ? outputFolderForPack({ startDate, days, pack: selectedPack }) : undefined,
    selectedHook: selectedPack?.brief.hook,
    referenceImagePath,
    referenceImageFound: fs.existsSync(referenceImagePath),
    extraOverlayText: "none",
    visualMode: "owner_reference_image",
  };
}

export async function writeStaticReferenceReelsBundle({
  startDate,
  days = 7,
  pilotOnly = false,
  rootDir = process.cwd(),
  audioPath = null,
}) {
  const renderer = await getMp4RendererAvailability();
  if (!renderer.ffmpegAvailable) {
    throw new Error(`ffmpeg is not available. Install with: ${renderer.installHint}`);
  }
  const bundle = buildStaticBundle({ startDate, days, pilotOnly });
  const reports = [];
  for (const pack of bundle.packs) {
    const outputFolder = path.resolve(rootDir, outputFolderForPack({ startDate, days, pack }));
    reports.push(await renderReferenceReelPack({ pack, outputFolder, renderer, rootDir, audioPath }));
  }
  return {
    startDate: bundle.startDate,
    endDate: bundle.endDate,
    days: bundle.days,
    outputRoot: path.join(rootDir, bundle.outputRoot),
    pilotOnly: bundle.pilotOnly,
    videosGenerated: reports.length,
    postersGenerated: reports.length,
    captionsGenerated: reports.length,
    hashtagsGenerated: reports.length,
    musicSuggestionsGenerated: reports.length,
    reports,
    renderer,
    externalApisUsed: false,
  };
}

export function requiredStaticReferenceOutputs() {
  return [...REQUIRED_REFERENCE_OUTPUTS];
}

export const createStaticReelsPlan = createStaticReferenceReelsPlan;
export const writeStaticReelsBundle = writeStaticReferenceReelsBundle;
export const requiredStaticReelOutputs = requiredStaticReferenceOutputs;
