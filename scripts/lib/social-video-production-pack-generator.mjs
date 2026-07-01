import fs from "fs";
import path from "path";
import process from "process";
import {
  buildSocialReviewQueueForCalendar,
  buildSocialReviewQueueForDate,
} from "./social-manual-review-queue-generator.mjs";

export const SOCIAL_VIDEO_PACK_ROOT = "data/social-video-packs";

const VIDEO_DURATION_SECONDS = 30;
const VIDEO_FORMAT = {
  aspectRatio: "9:16",
  resolution: "1080x1920",
  durationSeconds: VIDEO_DURATION_SECONDS,
  scenes: [
    { key: "hook", timing: "0-3s", start: "00:00:00,000", end: "00:00:03,000" },
    { key: "explanation", timing: "4-12s", start: "00:00:04,000", end: "00:00:12,000" },
    { key: "insight", timing: "13-22s", start: "00:00:13,000", end: "00:00:22,000" },
    { key: "cta", timing: "23-30s", start: "00:00:23,000", end: "00:00:30,000" },
  ],
};
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
};

function assertIsoDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) {
    throw new Error("Expected YYYY-MM-DD date.");
  }
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
    .slice(0, 80);
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

function queueFromOptions({ scope, date, startDate, days }) {
  if (scope === "date") {
    assertIsoDate(date);
    return buildSocialReviewQueueForDate({ date });
  }
  assertIsoDate(startDate);
  assertDays(days);
  return buildSocialReviewQueueForCalendar({ startDate, days });
}

function itemFolderName(item, dayDate) {
  const base = [
    String(item.priority).padStart(2, "0"),
    dayDate,
    item.platform,
    item.contentType,
    slugify(item.sourceItemId),
  ].filter(Boolean).join("-");
  return base.slice(0, 150);
}

function sceneText(item) {
  const voiceover = Array.isArray(item.voiceover) ? item.voiceover : [];
  const screenText = Array.isArray(item.onScreenText) ? item.onScreenText : [];
  return {
    hook: oneLine(screenText[0] ?? item.hook, item.hook),
    explanation: truncate(voiceover[1] ?? screenText[1] ?? item.caption, 190),
    insight: truncate(voiceover[2] ?? "Keep the wording entertainment-style and avoid certainty claims.", 180),
    cta: `${item.cta?.label ?? "Open Telegram Mini App"}: ${item.cta?.url ?? ""}`,
  };
}

function buildScenes(item) {
  const text = sceneText(item);
  return VIDEO_FORMAT.scenes.map((scene) => ({
    ...scene,
    text: text[scene.key],
    visualDirection: scene.key === "cta"
      ? "Telegram Mini App end card, CTA centered above lower safe area, no payment screen."
      : "Premium astrology 9:16 frame, centered title zone, clean readable typography, no fake result UI.",
  }));
}

function buildSrt(scenes) {
  return scenes.map((scene, index) => [
    String(index + 1),
    `${scene.start} --> ${scene.end}`,
    scene.text,
  ].join("\n")).join("\n\n") + "\n";
}

function buildVoiceoverText(item, scenes) {
  const lines = Array.isArray(item.voiceover) && item.voiceover.length > 0
    ? item.voiceover
    : scenes.map((scene) => scene.text);
  return `${lines.map((line, index) => `${index + 1}. ${line}`).join("\n")}\n`;
}

function buildOnScreenText(item, scenes) {
  const lines = Array.isArray(item.onScreenText) && item.onScreenText.length > 0
    ? item.onScreenText
    : scenes.map((scene) => scene.text);
  return `${lines.map((line, index) => `${index + 1}. ${line}`).join("\n")}\n`;
}

function buildCapCutSteps(item, scenes) {
  const lines = [
    `# CapCut Steps - ${item.platform} / ${item.contentType}`,
    "",
    "1. Create a new vertical project: 9:16, 1080x1920, 30 seconds.",
    "2. Add a dark premium astrology background with subtle motion; avoid app screenshots with payment or unlock UI.",
    "3. Split the timeline into four scenes:",
    ...scenes.map((scene) => `   - ${scene.timing}: ${scene.visualDirection}`),
    "4. Place hook text in the upper-middle safe zone; keep it below Reels/TikTok top UI.",
    "5. Use large title text around 72-96 px, body text around 44-60 px, and CTA text around 48-64 px.",
    "6. Keep all important text inside the central 820x1420 safe area.",
    "7. Add voiceover, then import subtitles.srt and verify timing manually.",
    "8. End with the Telegram Mini App CTA card and visible short URL/CTA label.",
    "9. Export manually as MP4 only after human review.",
    "",
  ];
  return `${lines.join("\n")}\n`;
}

function buildCanvaSteps(item, scenes) {
  const lines = [
    `# Canva Steps - ${item.platform} / ${item.contentType}`,
    "",
    "1. Create a Mobile Video design at 1080x1920.",
    "2. Use a dark cosmic background, soft glow accents, and high-contrast text.",
    "3. Build four pages/scenes with these durations:",
    ...scenes.map((scene) => `   - ${scene.timing}: ${scene.text}`),
    "4. Put the hook in the upper-middle safe area, explanation in the central area, and CTA above the lower UI controls.",
    "5. Use no payment screen, no VIP unlock state, and no admin/dashboard URL.",
    "6. Paste caption and hashtags from the text files only after manual review.",
    "7. Export manually as MP4 for native app posting.",
    "",
  ];
  return `${lines.join("\n")}\n`;
}

function buildStoryboard(item, scenes) {
  const lines = [
    `# Storyboard - ${item.platform} / ${item.contentType}`,
    "",
    `Source item: ${item.sourceItemId}`,
    `Format: ${VIDEO_FORMAT.aspectRatio}, ${VIDEO_FORMAT.resolution}, ${VIDEO_FORMAT.durationSeconds}s`,
    "",
    item.storyboardPrompt9x16 ?? "",
    "",
    "## Scenes",
    "",
  ];
  for (const scene of scenes) {
    lines.push(`### ${scene.timing} - ${scene.key}`);
    lines.push(`Text: ${scene.text}`);
    lines.push(`Visual: ${scene.visualDirection}`);
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function buildPostingChecklist(item) {
  const ctaStatus = item.ctaCheck?.status ?? (item.safety?.ctaSafe ? "pass" : "unknown");
  const vipPaymentStatus = item.vipPaymentSafetyCheck?.status ?? (item.safety?.vipPaymentSafe ? "pass" : "unknown");
  const checks = [
    ["Platform selected", item.platform],
    ["9:16 project", "1080x1920"],
    ["Duration", "20-35 seconds"],
    ["Voiceover reviewed", "No"],
    ["Subtitles reviewed", "No"],
    ["CTA checked", ctaStatus],
    ["CTA URL", item.cta?.url ?? ""],
    ["No admin/dashboard URL", "Yes"],
    ["VIP/payment safety", vipPaymentStatus],
    ["No payment screen", "Yes"],
    ["No VIP unlock", "Yes"],
    ["Posted manually", "No"],
  ];
  return `${[
    `# Posting Checklist - ${item.platform} / ${item.contentType}`,
    "",
    ...checks.map(([label, value]) => `- ${label}: ${value}`),
    "",
  ].join("\n")}`;
}

function buildThumbnailPrompt(item) {
  return [
    "9:16 thumbnail prompt.",
    `Platform: ${item.platform}.`,
    `Content type: ${item.contentType}.`,
    `Main text: ${truncate(item.hook, 70)}.`,
    "Style: premium astrology, dark cosmic background, clean bright text, high contrast, no payment screen, no VIP unlock, no admin UI.",
  ].join(" ");
}

function buildVideoBrief({ item, dayDate, outputFolder }) {
  const scenes = buildScenes(item);
  const isVip = item.contentType === "vip_preview_teaser";
  const vipSafe = !isVip || item.vipPaymentSafetyCheck?.access === "locked_preview_only";
  const ctaSafe = item.ctaCheck?.status === "pass" && !/dashboard|admin/i.test(item.cta?.url ?? "");

  return {
    schemaVersion: 1,
    phase: "social_phase_1_package_d",
    mode: "manual_video_production_pack_only",
    sourceDate: dayDate,
    sourceItemId: item.sourceItemId,
    outputFolder,
    platform: item.platform,
    contentType: item.contentType,
    priority: item.priority,
    format: VIDEO_FORMAT,
    hook: item.hook,
    voiceover: item.voiceover,
    onScreenText: item.onScreenText,
    caption: item.caption,
    hashtags: item.hashtags,
    cta: item.cta,
    scenes,
    storyboardPrompt9x16: item.storyboardPrompt9x16,
    thumbnailPrompt: buildThumbnailPrompt(item),
    humanPolishNotes: item.humanPolishNotes,
    weakPostWarnings: item.weakPostWarnings,
    safety: {
      ...SAFETY,
      ctaSafe,
      vipPaymentSafe: vipSafe,
      noAdminDashboardUrl: !/dashboard|admin/i.test(item.cta?.url ?? ""),
      noPaymentScreen: true,
      noVipUnlock: true,
    },
    manualEditorStatus: {
      readyForCapCut: "Yes",
      readyForCanva: "Yes",
      readyForManualPosting: item.readyToPostManually,
      postedManually: "No",
    },
  };
}

function buildPackFiles(brief) {
  const scenes = brief.scenes;
  const hashtags = Array.isArray(brief.hashtags) ? brief.hashtags.join(" ") : "";
  return {
    "video-brief.json": `${JSON.stringify(brief, null, 2)}\n`,
    "video-brief.md": renderVideoBriefMarkdown(brief),
    "voiceover.txt": buildVoiceoverText(brief, scenes),
    "on-screen-text.txt": buildOnScreenText(brief, scenes),
    "caption.txt": `${brief.caption ?? ""}\n`,
    "hashtags.txt": `${hashtags}\n`,
    "storyboard.md": buildStoryboard(brief, scenes),
    "capcut-steps.md": buildCapCutSteps(brief, scenes),
    "canva-steps.md": buildCanvaSteps(brief, scenes),
    "thumbnail-prompt.txt": `${brief.thumbnailPrompt}\n`,
    "subtitles.srt": buildSrt(scenes),
    "posting-checklist.md": buildPostingChecklist(brief),
  };
}

function renderVideoBriefMarkdown(brief) {
  const lines = [
    `# Video Brief - ${brief.platform} / ${brief.contentType}`,
    "",
    `Source item: ${brief.sourceItemId}`,
    `Format: ${brief.format.aspectRatio}, ${brief.format.resolution}, ${brief.format.durationSeconds}s`,
    `Priority: ${brief.priority}`,
    `Ready for manual posting: ${brief.manualEditorStatus.readyForManualPosting}`,
    "",
    `Hook: ${brief.hook}`,
    "",
    "## CTA",
    "",
    `${brief.cta?.label ?? ""}: ${brief.cta?.url ?? ""}`,
    "",
    "## Safety",
    "",
    `- CTA safe: ${brief.safety.ctaSafe ? "Yes" : "No"}`,
    `- VIP/payment safe: ${brief.safety.vipPaymentSafe ? "Yes" : "No"}`,
    "- No payment screen: Yes",
    "- No VIP unlock: Yes",
    "- Manual production only: Yes",
    "",
    "## Scenes",
    "",
  ];
  for (const scene of brief.scenes) {
    lines.push(`- ${scene.timing}: ${scene.text}`);
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function buildVideoPacksFromQueue(queue) {
  const packs = [];
  for (const day of queue.daysPlan) {
    for (const item of day.topRecommendedPosts) {
      const folderName = itemFolderName(item, day.date);
      const outputFolder = path.join(queue.outputRoot.replace("data/social-review", SOCIAL_VIDEO_PACK_ROOT), folderName);
      const brief = buildVideoBrief({ item, dayDate: day.date, outputFolder });
      packs.push({
        folderName,
        outputFolder,
        brief,
        files: buildPackFiles(brief),
      });
    }
  }
  return packs;
}

function summarizePacks(packs) {
  return {
    videoPacks: packs.length,
    voiceoverFiles: packs.length,
    srtSubtitles: packs.length,
    capCutSteps: packs.length,
    canvaSteps: packs.length,
    thumbnailPrompts: packs.length,
    postingChecklists: packs.length,
    ctaSafe: packs.every((pack) => pack.brief.safety.ctaSafe),
    vipPaymentSafe: packs.every((pack) => pack.brief.safety.vipPaymentSafe),
  };
}

export function buildSocialVideoPackBundle({ scope, date, startDate, days }) {
  const queue = queueFromOptions({ scope, date, startDate, days });
  const rangeLabel = scope === "date" ? date : dateRangeLabel(startDate, days);
  const outputRoot = path.join(SOCIAL_VIDEO_PACK_ROOT, rangeLabel);
  const queueWithVideoRoot = {
    ...queue,
    outputRoot: path.join("data/social-review", rangeLabel),
  };
  const packs = buildVideoPacksFromQueue(queueWithVideoRoot).map((pack) => {
    const finalOutputFolder = path.join(outputRoot, pack.folderName);
    const brief = {
      ...pack.brief,
      outputFolder: finalOutputFolder,
    };
    return {
      ...pack,
      outputFolder: finalOutputFolder,
      brief,
      files: buildPackFiles(brief),
    };
  });

  return {
    schemaVersion: 1,
    phase: "social_phase_1_package_d",
    mode: "manual_video_production_pack_only",
    scope,
    date: scope === "date" ? date : undefined,
    startDate: scope === "queue" ? startDate : undefined,
    endDate: scope === "queue" ? addDays(startDate, days - 1) : undefined,
    days: scope === "queue" ? days : 1,
    outputRoot,
    safety: SAFETY,
    summary: summarizePacks(packs),
    packs,
  };
}

export function createVideoPackPlan({ scope, date, startDate, days }) {
  const bundle = buildSocialVideoPackBundle({ scope, date, startDate, days });
  return {
    scope: bundle.scope,
    date: bundle.date,
    startDate: bundle.startDate,
    endDate: bundle.endDate,
    days: bundle.days,
    outputRoot: bundle.outputRoot,
    videoPacks: bundle.summary.videoPacks,
    ctaSafe: bundle.summary.ctaSafe,
    vipPaymentSafe: bundle.summary.vipPaymentSafe,
  };
}

export function writeSocialVideoPackBundle({ scope, date, startDate, days, rootDir = process.cwd() }) {
  const bundle = buildSocialVideoPackBundle({ scope, date, startDate, days });
  const written = [];

  for (const pack of bundle.packs) {
    const outDir = path.join(rootDir, pack.outputFolder);
    fs.mkdirSync(outDir, { recursive: true });
    for (const [fileName, contents] of Object.entries(buildPackFiles(pack.brief))) {
      const filePath = path.join(outDir, fileName);
      fs.writeFileSync(filePath, contents, "utf8");
      written.push(filePath);
    }
  }

  return {
    scope: bundle.scope,
    date: bundle.date,
    startDate: bundle.startDate,
    endDate: bundle.endDate,
    days: bundle.days,
    outputRoot: path.join(rootDir, bundle.outputRoot),
    written,
    ...bundle.summary,
  };
}
