import fs from "fs";
import path from "path";
import process from "process";
import child_process from "child_process";
import sharp from "sharp";
import { buildSocialVideoPackBundle } from "./social-video-production-pack-generator.mjs";

export const SOCIAL_MP4_ROOT = "data/social-videos";

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 24;
const RENDER_DURATION_SECONDS = 30;
const REQUIRED_OUTPUTS = [
  "video.mp4",
  "thumbnail.png",
  "caption.txt",
  "hashtags.txt",
  "subtitles.srt",
  "voiceover.txt",
  "posting-checklist.md",
  "video-render-report.json",
];

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
    .slice(0, 120);
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(value, maxChars = 26, maxLines = 5) {
  const words = String(value || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
    if (lines.length >= maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

function oneLine(value, fallback = "") {
  const text = Array.isArray(value) ? value.join(" ") : String(value ?? "");
  return text.replace(/\s+/g, " ").trim() || fallback;
}

function truncate(value, maxLength) {
  const text = oneLine(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

async function getPackageBinary(packageName) {
  try {
    const mod = await import(packageName);
    return mod.default?.path ?? mod.path ?? null;
  } catch {
    return null;
  }
}

function findSystemBinary(command) {
  const result = child_process.spawnSync(process.platform === "win32" ? "where.exe" : "which", [command], {
    encoding: "utf8",
    shell: false,
  });
  if (result.status !== 0) return null;
  const candidate = result.stdout.split(/\r?\n/).map((line) => line.trim()).find(Boolean);
  return candidate || null;
}

export async function getMp4RendererAvailability() {
  const ffmpegPath = process.env.FFMPEG_PATH
    || findSystemBinary("ffmpeg")
    || await getPackageBinary("@ffmpeg-installer/ffmpeg");
  const ffprobePath = process.env.FFPROBE_PATH
    || findSystemBinary("ffprobe")
    || await getPackageBinary("@ffprobe-installer/ffprobe");
  return {
    ffmpegPath,
    ffprobePath,
    ffmpegAvailable: Boolean(ffmpegPath && fs.existsSync(ffmpegPath)),
    ffprobeAvailable: Boolean(ffprobePath && fs.existsSync(ffprobePath)),
    installHint: "npm install --save-dev @ffmpeg-installer/ffmpeg @ffprobe-installer/ffprobe",
  };
}

function runBinary(binaryPath, args, options = {}) {
  const result = child_process.spawnSync(binaryPath, args, {
    encoding: "utf8",
    shell: false,
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`${path.basename(binaryPath)} failed: ${(result.stderr || result.stdout || "").slice(0, 1000)}`);
  }
  return result;
}

function buildInputBundle({ scope, date, startDate, days }) {
  if (scope === "date") {
    assertIsoDate(date);
    return buildSocialVideoPackBundle({ scope: "date", date });
  }
  assertIsoDate(startDate);
  assertDays(days);
  return buildSocialVideoPackBundle({ scope: "queue", startDate, days });
}

function outputRootFor({ scope, date, startDate, days }) {
  if (scope === "date") return path.join(SOCIAL_MP4_ROOT, date);
  return path.join(SOCIAL_MP4_ROOT, dateRangeLabel(startDate, days));
}

function outputFolderForPack(outputRoot, pack) {
  return path.join(outputRoot, slugify(pack.folderName));
}

function scenePalette(index) {
  const palettes = [
    { bg1: "#10091f", bg2: "#34205c", accent: "#f6c177", accent2: "#e66fb4" },
    { bg1: "#081527", bg2: "#233f65", accent: "#d9b66f", accent2: "#8fd3ff" },
    { bg1: "#160d24", bg2: "#48234d", accent: "#ead7ff", accent2: "#ff9fc8" },
    { bg1: "#090b1a", bg2: "#1f315e", accent: "#ffd27a", accent2: "#b9f3ff" },
  ];
  return palettes[index % palettes.length];
}

function sceneSvg({ brief, scene, sceneIndex }) {
  const palette = scenePalette(sceneIndex);
  const title = sceneIndex === 0 ? brief.contentType.replace(/_/g, " ") : scene.key;
  const lines = wrapText(scene.text, scene.key === "cta" ? 28 : 24, scene.key === "cta" ? 5 : 6);
  const fontSize = scene.key === "hook" ? 78 : scene.key === "cta" ? 58 : 60;
  const lineHeight = Math.round(fontSize * 1.18);
  const startY = scene.key === "cta" ? 660 : 560;
  const textSpans = lines.map((line, index) => (
    `<tspan x="${WIDTH / 2}" y="${startY + index * lineHeight}">${escapeXml(line)}</tspan>`
  )).join("");
  const stars = Array.from({ length: 42 }, (_, index) => {
    const x = (index * 191 + sceneIndex * 83) % WIDTH;
    const y = 120 + ((index * 137 + sceneIndex * 59) % 1200);
    const opacity = 0.25 + ((index % 5) * 0.1);
    return `<circle cx="${x}" cy="${y}" r="${index % 3 === 0 ? 2 : 1}" fill="#ffffff" opacity="${opacity.toFixed(2)}" />`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.bg1}" />
      <stop offset="100%" stop-color="${palette.bg2}" />
    </linearGradient>
    <radialGradient id="orb" cx="50%" cy="30%" r="65%">
      <stop offset="0%" stop-color="${palette.accent2}" stop-opacity="0.35" />
      <stop offset="55%" stop-color="${palette.accent}" stop-opacity="0.11" />
      <stop offset="100%" stop-color="${palette.bg1}" stop-opacity="0" />
    </radialGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#orb)" />
  ${stars}
  <circle cx="${WIDTH / 2}" cy="420" r="138" fill="none" stroke="${palette.accent}" stroke-width="3" opacity="0.55" />
  <circle cx="${WIDTH / 2}" cy="420" r="84" fill="none" stroke="${palette.accent2}" stroke-width="2" opacity="0.42" />
  <path d="M${WIDTH / 2 - 68} 420 L${WIDTH / 2} 318 L${WIDTH / 2 + 68} 420 L${WIDTH / 2} 522 Z" fill="none" stroke="${palette.accent}" stroke-width="4" opacity="0.55"/>
  <text x="${WIDTH / 2}" y="190" text-anchor="middle" font-family="Arial, Segoe UI, sans-serif" font-size="30" fill="#f7e8c4" opacity="0.86" letter-spacing="5">${escapeXml(brief.platform.toUpperCase())}</text>
  <text x="${WIDTH / 2}" y="250" text-anchor="middle" font-family="Arial, Segoe UI, sans-serif" font-size="38" fill="#ffffff" opacity="0.92">${escapeXml(title)}</text>
  <g filter="url(#softShadow)">
    <rect x="92" y="${startY - 82}" width="896" height="${Math.max(410, lines.length * lineHeight + 150)}" rx="42" fill="#080713" opacity="0.58" stroke="${palette.accent}" stroke-width="2" />
    <text text-anchor="middle" font-family="Arial, Segoe UI, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">${textSpans}</text>
  </g>
  <text x="${WIDTH / 2}" y="1554" text-anchor="middle" font-family="Arial, Segoe UI, sans-serif" font-size="30" fill="#f7e8c4" opacity="0.95">${escapeXml(scene.timing)}</text>
  <rect x="120" y="1614" width="840" height="132" rx="34" fill="#ffffff" opacity="0.1" stroke="${palette.accent}" stroke-width="2" />
  <text x="${WIDTH / 2}" y="1670" text-anchor="middle" font-family="Arial, Segoe UI, sans-serif" font-size="34" font-weight="700" fill="#ffffff">${escapeXml(scene.key === "cta" ? "Telegram Mini App" : "soft astrology preview")}</text>
  <text x="${WIDTH / 2}" y="1718" text-anchor="middle" font-family="Arial, Segoe UI, sans-serif" font-size="25" fill="#f7e8c4">${escapeXml(scene.key === "cta" ? "No payment screen. No VIP unlock." : "Entertainment-only wording.")}</text>
  <text x="${WIDTH / 2}" y="1820" text-anchor="middle" font-family="Arial, Segoe UI, sans-serif" font-size="24" fill="#ffffff" opacity="0.55">safe area: keep text away from top and bottom platform UI</text>
</svg>`;
}

async function renderPngFromSvg(svg, outputPath) {
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
}

function ffmpegConcatFile(sceneFiles, outputPath) {
  const durations = [3, 9, 9, 8];
  const lines = [];
  for (let index = 0; index < sceneFiles.length; index += 1) {
    lines.push(`file '${sceneFiles[index].replace(/\\/g, "/").replace(/'/g, "'\\''")}'`);
    lines.push(`duration ${durations[index]}`);
  }
  lines.push(`file '${sceneFiles[sceneFiles.length - 1].replace(/\\/g, "/").replace(/'/g, "'\\''")}'`);
  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
}

async function renderPack({ pack, outputFolder, renderer }) {
  fs.mkdirSync(outputFolder, { recursive: true });
  const framesDir = path.join(outputFolder, "_frames");
  fs.mkdirSync(framesDir, { recursive: true });

  const sceneFiles = [];
  for (let index = 0; index < pack.brief.scenes.length; index += 1) {
    const scene = pack.brief.scenes[index];
    const framePath = path.join(framesDir, `scene-${index + 1}.png`);
    await renderPngFromSvg(sceneSvg({ brief: pack.brief, scene, sceneIndex: index }), framePath);
    sceneFiles.push(framePath);
  }

  const thumbnailPath = path.join(outputFolder, "thumbnail.png");
  fs.copyFileSync(sceneFiles[0], thumbnailPath);

  const concatPath = path.join(framesDir, "concat.txt");
  ffmpegConcatFile(sceneFiles, concatPath);
  const videoPath = path.join(outputFolder, "video.mp4");
  runBinary(renderer.ffmpegPath, [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concatPath,
    "-vf", `fps=${FPS},format=yuv420p`,
    "-r", String(FPS),
    "-an",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-crf", "28",
    "-movflags", "+faststart",
    videoPath,
  ]);

  const outputFiles = {
    "caption.txt": pack.files["caption.txt"],
    "hashtags.txt": pack.files["hashtags.txt"],
    "subtitles.srt": pack.files["subtitles.srt"],
    "voiceover.txt": pack.files["voiceover.txt"],
    "posting-checklist.md": pack.files["posting-checklist.md"],
  };
  for (const [fileName, contents] of Object.entries(outputFiles)) {
    fs.writeFileSync(path.join(outputFolder, fileName), contents, "utf8");
  }

  const probe = renderer.ffprobeAvailable ? probeVideo({ videoPath, renderer }) : null;
  const report = {
    schemaVersion: 1,
    phase: "social_phase_1_package_e",
    mode: "local_auto_mp4_render",
    sourceItemId: pack.brief.sourceItemId,
    platform: pack.brief.platform,
    contentType: pack.brief.contentType,
    outputFolder,
    videoPath,
    thumbnailPath,
    renderer: {
      technology: "sharp SVG/PNG frames + ffmpeg concat encoder",
      ffmpegAvailable: renderer.ffmpegAvailable,
      ffprobeAvailable: renderer.ffprobeAvailable,
      externalApisUsed: false,
      tts: "none",
      audio: "silent",
    },
    specs: {
      width: WIDTH,
      height: HEIGHT,
      aspectRatio: "9:16",
      targetDurationSeconds: RENDER_DURATION_SECONDS,
      fps: FPS,
      scenes: pack.brief.scenes.map((scene) => ({ key: scene.key, timing: scene.timing, text: scene.text })),
      ctaEndCard: true,
      safeArea: "central 820x1420 safe area; avoid top/bottom platform UI zones",
      visualStyle: "premium dark astrology style with burned-in text",
    },
    probe,
    safety: {
      ctaSafe: pack.brief.safety.ctaSafe,
      vipPaymentSafe: pack.brief.safety.vipPaymentSafe,
      noAdminDashboardUrl: pack.brief.safety.noAdminDashboardUrl,
      noPaymentScreen: true,
      noVipUnlock: true,
      instagramApiConnected: false,
      tiktokApiConnected: false,
      socialPosting: false,
      socialTokens: false,
      telegramLivePublish: false,
      cronOrWorkflowChanged: false,
    },
  };
  fs.writeFileSync(path.join(outputFolder, "video-render-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

  fs.rmSync(framesDir, { recursive: true, force: true });
  return report;
}

function probeVideo({ videoPath, renderer }) {
  const result = runBinary(renderer.ffprobePath, [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height,duration",
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
    };
  } catch {
    return { parseError: true };
  }
}

export function createMp4RenderPlan({ scope, date, startDate, days }) {
  const bundle = buildInputBundle({ scope, date, startDate, days });
  const outputRoot = outputRootFor({ scope, date, startDate, days });
  return {
    scope,
    date: scope === "date" ? date : undefined,
    startDate: scope === "queue" ? startDate : undefined,
    endDate: scope === "queue" ? addDays(startDate, days - 1) : undefined,
    days: scope === "queue" ? days : 1,
    outputRoot,
    videoPacks: bundle.packs.length,
    targetResolution: `${WIDTH}x${HEIGHT}`,
    targetDurationSeconds: RENDER_DURATION_SECONDS,
  };
}

export async function writeSocialMp4Bundle({ scope, date, startDate, days, rootDir = process.cwd(), maxPacks = Infinity }) {
  const renderer = await getMp4RendererAvailability();
  if (!renderer.ffmpegAvailable) {
    throw new Error(`ffmpeg is not available. Install with: ${renderer.installHint}`);
  }

  const bundle = buildInputBundle({ scope, date, startDate, days });
  const outputRoot = outputRootFor({ scope, date, startDate, days });
  const selectedPacks = bundle.packs.slice(0, maxPacks);
  const reports = [];
  for (const pack of selectedPacks) {
    const outputFolder = path.join(rootDir, outputFolderForPack(outputRoot, pack));
    reports.push(await renderPack({ pack, outputFolder, renderer }));
  }

  return {
    scope,
    date: scope === "date" ? date : undefined,
    startDate: scope === "queue" ? startDate : undefined,
    endDate: scope === "queue" ? addDays(startDate, days - 1) : undefined,
    days: scope === "queue" ? days : 1,
    outputRoot: path.join(rootDir, outputRoot),
    videosGenerated: reports.length,
    thumbnailsGenerated: reports.length,
    captionsGenerated: reports.length,
    hashtagsGenerated: reports.length,
    subtitlesGenerated: reports.length,
    voiceoversGenerated: reports.length,
    postingChecklistsGenerated: reports.length,
    reports,
    renderer,
  };
}

export function requiredMp4Outputs() {
  return [...REQUIRED_OUTPUTS];
}
