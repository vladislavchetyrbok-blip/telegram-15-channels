import fs from "fs";
import path from "path";
import process from "process";
import child_process from "child_process";
import sharp from "sharp";
import { buildSocialVideoPackBundle } from "./social-video-production-pack-generator.mjs";
import { getMp4RendererAvailability } from "./social-auto-mp4-generator.mjs";

export const SOCIAL_PREMIUM_MP4_ROOT = "data/social-videos-premium";

const WIDTH = 1080;
const HEIGHT = 1920;
const OUTPUT_FPS = 30;
const DESIGN_FPS = 2;
const RENDER_DURATION_SECONDS = 30;
const FRAME_COUNT = DESIGN_FPS * RENDER_DURATION_SECONDS;
const FRAME_RENDER_BATCH_SIZE = 8;
const SAFE_AREA = {
  x: 130,
  y: 210,
  width: 820,
  height: 1420,
};
const REQUIRED_PREMIUM_OUTPUTS = [
  "video.mp4",
  "thumbnail.png",
  "caption.txt",
  "hashtags.txt",
  "subtitles.srt",
  "voiceover.txt",
  "posting-checklist.md",
  "video-render-report.json",
  "visual-style-report.json",
];

export const PREMIUM_STYLE_PRESETS = {
  premium_dark_violet_gold: {
    name: "premium_dark_violet_gold",
    bg1: "#070512",
    bg2: "#1b0d35",
    bg3: "#3a185f",
    accent: "#f7c873",
    accent2: "#c783ff",
    text: "#fff5de",
    muted: "#d7bee9",
  },
  lunar_black_silver: {
    name: "lunar_black_silver",
    bg1: "#05070d",
    bg2: "#101827",
    bg3: "#273349",
    accent: "#e8edf5",
    accent2: "#8fb4d9",
    text: "#f8fbff",
    muted: "#bdc9d8",
  },
  rose_gold_mystic: {
    name: "rose_gold_mystic",
    bg1: "#11070d",
    bg2: "#2b1124",
    bg3: "#4a1f42",
    accent: "#ffd0b2",
    accent2: "#ff8fbf",
    text: "#fff1ec",
    muted: "#f4bfd7",
  },
  cosmic_blue_gold: {
    name: "cosmic_blue_gold",
    bg1: "#030818",
    bg2: "#071f46",
    bg3: "#123f77",
    accent: "#ffd47b",
    accent2: "#7fdcff",
    text: "#f7fbff",
    muted: "#a8c9ef",
  },
};

const CONTENT_TEMPLATES = {
  mystic_card: {
    name: "mystic_card",
    stylePreset: "premium_dark_violet_gold",
    variant: "tarot_card_reveal",
    motif: "tarot card reveal",
    hero: "&#10022;",
  },
  birth_matrix_teaser: {
    name: "birth_matrix_teaser",
    stylePreset: "lunar_black_silver",
    variant: "numbers_matrix_lunar_glow",
    motif: "numbers matrix and lunar glow",
    hero: "&#9673;",
  },
  compatibility_hook: {
    name: "compatibility_hook",
    stylePreset: "rose_gold_mystic",
    variant: "two_symbols_relationship_line",
    motif: "two symbols with relationship energy line",
    hero: "&#9825;",
  },
  daily_zodiac_reel: {
    name: "daily_zodiac_reel",
    stylePreset: "cosmic_blue_gold",
    variant: "zodiac_glyph_hero",
    motif: "zodiac glyph hero animation",
    hero: "&#9800;",
  },
  weekly_forecast_batch: {
    name: "weekly_forecast_batch",
    stylePreset: "cosmic_blue_gold",
    variant: "calendar_constellation_map",
    motif: "calendar and constellation map",
    hero: "&#10036;",
  },
  vip_preview_teaser: {
    name: "vip_preview_teaser",
    stylePreset: "premium_dark_violet_gold",
    variant: "locked_preview_card",
    motif: "locked preview card",
    hero: "&#128274;",
  },
};

const SIGN_GLYPHS = [
  ["aries", "&#9800;"],
  ["taurus", "&#9801;"],
  ["gemini", "&#9802;"],
  ["cancer", "&#9803;"],
  ["leo", "&#9804;"],
  ["virgo", "&#9805;"],
  ["libra", "&#9806;"],
  ["scorpio", "&#9807;"],
  ["sagittarius", "&#9808;"],
  ["capricorn", "&#9809;"],
  ["aquarius", "&#9810;"],
  ["pisces", "&#9811;"],
];

const SCENE_TIMINGS = [
  { key: "hook", label: "0-3s", start: 0, end: 3, srtStart: "00:00:00,000", srtEnd: "00:00:03,000" },
  { key: "explanation", label: "4-12s", start: 3, end: 12, srtStart: "00:00:03,000", srtEnd: "00:00:12,000" },
  { key: "insight", label: "13-22s", start: 12, end: 22, srtStart: "00:00:12,000", srtEnd: "00:00:22,000" },
  { key: "cta", label: "23-30s", start: 22, end: 30, srtStart: "00:00:22,000", srtEnd: "00:00:30,000" },
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
    .slice(0, 150);
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

function wrapText(value, maxChars = 22, maxLines = 2) {
  const words = oneLine(value).split(" ").filter(Boolean);
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
  return lines.slice(0, maxLines);
}

function hashString(value) {
  let hash = 2166136261;
  for (const char of String(value || "")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function seeded(seed, index, min = 0, max = 1) {
  const raw = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  const frac = raw - Math.floor(raw);
  return min + frac * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function easeOutCubic(value) {
  const clamped = clamp(value, 0, 1);
  return 1 - (1 - clamped) ** 3;
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
  if (scope === "date") return path.join(SOCIAL_PREMIUM_MP4_ROOT, date);
  return path.join(SOCIAL_PREMIUM_MP4_ROOT, dateRangeLabel(startDate, days));
}

function outputFolderForPack(outputRoot, pack) {
  return path.join(outputRoot, slugify(pack.folderName));
}

function getTemplate(contentType) {
  return CONTENT_TEMPLATES[contentType] ?? CONTENT_TEMPLATES.daily_zodiac_reel;
}

function getStylePreset(template, packIndex) {
  const names = Object.keys(PREMIUM_STYLE_PRESETS);
  const preferred = template.stylePreset;
  return PREMIUM_STYLE_PRESETS[preferred] ?? PREMIUM_STYLE_PRESETS[names[packIndex % names.length]];
}

function deriveGlyphs(brief) {
  const haystack = `${brief.sourceItemId} ${brief.hook} ${brief.caption}`.toLowerCase();
  const found = SIGN_GLYPHS.filter(([name]) => haystack.includes(name)).map(([, glyph]) => glyph);
  if (found.length >= 2) return found.slice(0, 2);
  if (found.length === 1) return [found[0], "&#9811;"];
  const seed = hashString(brief.sourceItemId);
  const first = SIGN_GLYPHS[seed % SIGN_GLYPHS.length][1];
  const second = SIGN_GLYPHS[(seed + 5) % SIGN_GLYPHS.length][1];
  return [first, second];
}

function compactHook(brief) {
  const screen = Array.isArray(brief.onScreenText) ? brief.onScreenText : [];
  return truncate(screen[0] ?? brief.hook ?? "Your sign has a quiet message today", 62);
}

function compactLine(value, fallback, maxLength = 58) {
  return truncate(value || fallback, maxLength);
}

function buildPremiumScenes(brief) {
  const voiceover = Array.isArray(brief.voiceover) ? brief.voiceover : [];
  const screen = Array.isArray(brief.onScreenText) ? brief.onScreenText : [];
  const ctaUrl = brief.cta?.url ?? "";
  const ctaLabel = brief.cta?.label ?? "Open Telegram Mini App";
  const hook = compactHook(brief);
  const explanation = compactLine(voiceover[1] ?? screen[1], "A softer pattern is opening now.");
  const insight = compactLine(voiceover[2] ?? screen[2], "Use it as a hint, not a rule.");
  const cta = compactLine(`${ctaLabel}`, "Open the Mini App", 42);
  const shortUrl = ctaUrl.replace(/^https?:\/\//, "").replace(/\?.*$/, "");

  return SCENE_TIMINGS.map((scene) => {
    if (scene.key === "hook") {
      return { ...scene, headline: hook, lines: [] };
    }
    if (scene.key === "explanation") {
      return { ...scene, headline: "What it means", lines: wrapText(explanation, 28, 2) };
    }
    if (scene.key === "insight") {
      return { ...scene, headline: "Your soft cue", lines: wrapText(insight, 28, 2) };
    }
    return { ...scene, headline: cta, lines: ["Telegram Mini App", shortUrl || "daily insight inside"] };
  });
}

function sceneForTime(seconds) {
  return SCENE_TIMINGS.find((scene) => seconds >= scene.start && seconds < scene.end) ?? SCENE_TIMINGS[SCENE_TIMINGS.length - 1];
}

function starField(seed, frameIndex, style) {
  const stars = [];
  for (let index = 0; index < 105; index += 1) {
    const baseX = seeded(seed, index, 0, WIDTH);
    const baseY = seeded(seed + 2, index, 0, HEIGHT);
    const speed = seeded(seed + 4, index, 1.5, 7.5);
    const x = (baseX + Math.sin((frameIndex + index) * 0.045) * 12 + WIDTH) % WIDTH;
    const y = (baseY + frameIndex * speed * 0.18) % HEIGHT;
    const pulse = 0.35 + Math.sin(frameIndex * 0.12 + index) * 0.22;
    const radius = index % 12 === 0 ? 2.4 : index % 5 === 0 ? 1.7 : 1.05;
    stars.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius}" fill="${style.text}" opacity="${clamp(pulse, 0.16, 0.72).toFixed(2)}" />`);
  }
  return stars.join("");
}

function particleField(seed, frameIndex, style) {
  const particles = [];
  for (let index = 0; index < 34; index += 1) {
    const angle = seeded(seed + 8, index, 0, Math.PI * 2) + frameIndex * 0.012;
    const orbit = seeded(seed + 10, index, 190, 620);
    const cx = WIDTH / 2 + Math.cos(angle) * orbit * seeded(seed + 11, index, 0.18, 0.85);
    const cy = 860 + Math.sin(angle * 0.83) * orbit * 0.54 + Math.sin(frameIndex * 0.03 + index) * 22;
    const radius = seeded(seed + 12, index, 2, 7);
    particles.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${radius.toFixed(1)}" fill="${index % 2 ? style.accent : style.accent2}" opacity="0.22" />`);
  }
  return particles.join("");
}

function backgroundSvg({ seed, frameIndex, style }) {
  const driftA = Math.sin(frameIndex * 0.018) * 70;
  const driftB = Math.cos(frameIndex * 0.015) * 90;
  return `
  <defs>
    <linearGradient id="premiumBg" x1="${0.1 + Math.sin(frameIndex * 0.01) * 0.08}" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${style.bg1}" />
      <stop offset="52%" stop-color="${style.bg2}" />
      <stop offset="100%" stop-color="${style.bg3}" />
    </linearGradient>
    <radialGradient id="goldGlow" cx="50%" cy="38%" r="62%">
      <stop offset="0%" stop-color="${style.accent}" stop-opacity="0.35" />
      <stop offset="46%" stop-color="${style.accent2}" stop-opacity="0.13" />
      <stop offset="100%" stop-color="${style.bg1}" stop-opacity="0" />
    </radialGradient>
    <filter id="premiumShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#000000" flood-opacity="0.62"/>
    </filter>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#premiumBg)" />
  <circle cx="${300 + driftA}" cy="${300 + driftB * 0.3}" r="420" fill="${style.accent2}" opacity="0.08" />
  <circle cx="${760 - driftB * 0.5}" cy="${1120 + driftA * 0.35}" r="520" fill="${style.accent}" opacity="0.075" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#goldGlow)" opacity="0.72" />
  ${starField(seed, frameIndex, style)}
  ${particleField(seed, frameIndex, style)}
`;
}

function frameLines(lines, x, y, fontSize, lineHeight, fill, opacity = 1) {
  return lines.map((line, index) => (
    `<text x="${x}" y="${y + index * lineHeight}" text-anchor="middle" font-family="Arial, Segoe UI, sans-serif" font-size="${fontSize}" font-weight="600" fill="${fill}" opacity="${opacity}">${escapeXml(line)}</text>`
  )).join("");
}

function premiumFrame({ style, frameIndex, sceneProgress }) {
  const shimmer = 0.34 + Math.sin(frameIndex * 0.11) * 0.09;
  const scale = 1 + Math.sin(frameIndex * 0.025) * 0.018;
  return `
  <g transform="translate(${WIDTH / 2} 870) scale(${scale.toFixed(3)}) translate(${-WIDTH / 2} -870)" opacity="0.98">
    <rect x="108" y="250" width="864" height="1230" rx="68" fill="#05040b" opacity="0.48" stroke="${style.accent}" stroke-width="2.5" filter="url(#premiumShadow)" />
    <rect x="132" y="274" width="816" height="1182" rx="54" fill="#ffffff" opacity="0.035" stroke="${style.accent2}" stroke-width="1.5" />
    <path d="M180 355 C360 ${260 - sceneProgress * 24} 720 ${260 + sceneProgress * 18} 900 355" fill="none" stroke="${style.accent}" stroke-width="2" opacity="${shimmer.toFixed(2)}" />
    <path d="M180 1355 C360 ${1450 + sceneProgress * 24} 720 ${1450 - sceneProgress * 18} 900 1355" fill="none" stroke="${style.accent2}" stroke-width="2" opacity="${(shimmer * 0.8).toFixed(2)}" />
  </g>`;
}

function mysticCardLayer({ style, frameIndex, localProgress }) {
  const reveal = easeOutCubic(localProgress / 0.8);
  const y = 382 - (1 - reveal) * 42 + Math.sin(frameIndex * 0.03) * 8;
  const rotate = Math.sin(frameIndex * 0.018) * 2.6;
  return `
  <g transform="translate(${WIDTH / 2} ${y.toFixed(1)}) rotate(${rotate.toFixed(2)}) translate(-${WIDTH / 2} -${y.toFixed(1)})" filter="url(#glow)">
    <rect x="336" y="${y - 148}" width="408" height="552" rx="38" fill="#0d0818" stroke="${style.accent}" stroke-width="4" opacity="0.94" />
    <rect x="365" y="${y - 118}" width="350" height="492" rx="28" fill="none" stroke="${style.accent2}" stroke-width="1.5" opacity="0.65" />
    <text x="${WIDTH / 2}" y="${y + 75}" text-anchor="middle" font-family="Georgia, serif" font-size="150" fill="${style.accent}" opacity="${(0.55 + reveal * 0.4).toFixed(2)}">&#10022;</text>
    <text x="${WIDTH / 2}" y="${y + 185}" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="${style.muted}" letter-spacing="4">MYSTIC CARD</text>
  </g>`;
}

function birthMatrixLayer({ style, seed, frameIndex }) {
  const cells = [];
  const startX = 310;
  const startY = 300;
  const size = 112;
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const index = row * 4 + col;
      const n = Math.floor(seeded(seed, index, 1, 10));
      const pulse = 0.32 + Math.sin(frameIndex * 0.1 + index) * 0.16;
      cells.push(`<rect x="${startX + col * size}" y="${startY + row * size}" width="90" height="90" rx="18" fill="#ffffff" opacity="${pulse.toFixed(2)}" />`);
      cells.push(`<text x="${startX + col * size + 45}" y="${startY + row * size + 60}" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="${style.bg1}">${n}</text>`);
    }
  }
  return `
  <g filter="url(#glow)">
    <circle cx="${WIDTH / 2}" cy="500" r="${230 + Math.sin(frameIndex * 0.03) * 14}" fill="none" stroke="${style.accent}" stroke-width="3" opacity="0.38" />
    ${cells.join("")}
  </g>`;
}

function compatibilityLayer({ style, glyphs, frameIndex }) {
  const pulse = 1 + Math.sin(frameIndex * 0.05) * 0.035;
  const leftX = 365 + Math.sin(frameIndex * 0.025) * 15;
  const rightX = 715 - Math.sin(frameIndex * 0.025) * 15;
  return `
  <g filter="url(#glow)">
    <path d="M${leftX} 560 C455 420 625 420 ${rightX} 560" fill="none" stroke="${style.accent}" stroke-width="6" opacity="0.52" />
    <circle cx="${leftX}" cy="560" r="${142 * pulse}" fill="#ffffff" opacity="0.08" stroke="${style.accent}" stroke-width="3" />
    <circle cx="${rightX}" cy="560" r="${142 * pulse}" fill="#ffffff" opacity="0.08" stroke="${style.accent2}" stroke-width="3" />
    <text x="${leftX}" y="607" text-anchor="middle" font-family="Georgia, serif" font-size="132" fill="${style.text}">${glyphs[0]}</text>
    <text x="${rightX}" y="607" text-anchor="middle" font-family="Georgia, serif" font-size="132" fill="${style.text}">${glyphs[1]}</text>
    <circle cx="${WIDTH / 2}" cy="508" r="18" fill="${style.accent}" opacity="0.85" />
  </g>`;
}

function dailyZodiacLayer({ style, glyphs, frameIndex }) {
  const ring = 245 + Math.sin(frameIndex * 0.04) * 22;
  const rotate = frameIndex * 0.7;
  return `
  <g filter="url(#glow)">
    <circle cx="${WIDTH / 2}" cy="535" r="${ring.toFixed(1)}" fill="#ffffff" opacity="0.04" stroke="${style.accent}" stroke-width="3" />
    <g transform="rotate(${rotate.toFixed(1)} ${WIDTH / 2} 535)">
      <path d="M${WIDTH / 2} 250 L${WIDTH / 2 + 46} 535 L${WIDTH / 2} 820 L${WIDTH / 2 - 46} 535 Z" fill="none" stroke="${style.accent2}" stroke-width="2" opacity="0.48"/>
    </g>
    <text x="${WIDTH / 2}" y="615" text-anchor="middle" font-family="Georgia, serif" font-size="220" fill="${style.text}">${glyphs[0]}</text>
  </g>`;
}

function weeklyLayer({ style, seed, frameIndex }) {
  const points = Array.from({ length: 9 }, (_, index) => ({
    x: 250 + seeded(seed + 20, index, 0, 580),
    y: 330 + seeded(seed + 21, index, 0, 420) + Math.sin(frameIndex * 0.035 + index) * 9,
  }));
  const lines = points.slice(1).map((point, index) => (
    `<line x1="${points[index].x.toFixed(1)}" y1="${points[index].y.toFixed(1)}" x2="${point.x.toFixed(1)}" y2="${point.y.toFixed(1)}" stroke="${style.accent}" stroke-width="2" opacity="0.34" />`
  )).join("");
  const dots = points.map((point) => `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="7" fill="${style.text}" opacity="0.72" />`).join("");
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const calendar = days.map((day, index) => {
    const x = 228 + index * 90;
    const active = index % 2 === frameIndex % 2;
    return `<g><rect x="${x}" y="750" width="62" height="62" rx="16" fill="${active ? style.accent : "#ffffff"}" opacity="${active ? "0.78" : "0.16"}"/><text x="${x + 31}" y="790" text-anchor="middle" font-family="Arial" font-size="26" font-weight="700" fill="${active ? style.bg1 : style.text}">${day}</text></g>`;
  }).join("");
  return `<g filter="url(#glow)">${lines}${dots}${calendar}</g>`;
}

function vipLayer({ style, frameIndex }) {
  const pulse = 0.78 + Math.sin(frameIndex * 0.08) * 0.14;
  return `
  <g filter="url(#glow)">
    <rect x="300" y="300" width="480" height="590" rx="48" fill="#0a0711" stroke="${style.accent}" stroke-width="4" opacity="0.92" />
    <path d="M420 530 v-70 c0-88 240-88 240 0 v70" fill="none" stroke="${style.accent}" stroke-width="24" stroke-linecap="round" opacity="${pulse.toFixed(2)}" />
    <rect x="385" y="520" width="310" height="220" rx="38" fill="${style.accent}" opacity="${pulse.toFixed(2)}" />
    <circle cx="${WIDTH / 2}" cy="620" r="28" fill="${style.bg1}" />
    <rect x="${WIDTH / 2 - 9}" y="646" width="18" height="46" rx="8" fill="${style.bg1}" />
    <text x="${WIDTH / 2}" y="820" text-anchor="middle" font-family="Arial" font-size="33" font-weight="700" fill="${style.text}">LOCKED PREVIEW ONLY</text>
  </g>`;
}

function templateLayer({ brief, template, style, frameIndex, localProgress, seed }) {
  const glyphs = deriveGlyphs(brief);
  if (template.name === "mystic_card") return mysticCardLayer({ style, frameIndex, localProgress });
  if (template.name === "birth_matrix_teaser") return birthMatrixLayer({ style, seed, frameIndex });
  if (template.name === "compatibility_hook") return compatibilityLayer({ style, glyphs, frameIndex });
  if (template.name === "weekly_forecast_batch") return weeklyLayer({ style, seed, frameIndex });
  if (template.name === "vip_preview_teaser") return vipLayer({ style, frameIndex });
  return dailyZodiacLayer({ style, glyphs, frameIndex });
}

function titleLabel(brief) {
  return String(brief.contentType || "zodiac").replace(/_/g, " ").toUpperCase();
}

function ctaCard({ style, scene, enter }) {
  const lines = scene.lines.slice(0, 2);
  return `
  <g transform="translate(0 ${(1 - enter) * 38})" opacity="${enter.toFixed(2)}" filter="url(#premiumShadow)">
    <rect x="176" y="1190" width="728" height="260" rx="54" fill="#05040b" opacity="0.78" stroke="${style.accent}" stroke-width="3" />
    <text x="${WIDTH / 2}" y="1272" text-anchor="middle" font-family="Arial, Segoe UI, sans-serif" font-size="42" font-weight="800" fill="${style.text}">${escapeXml(lines[0] ?? "Telegram Mini App")}</text>
    <rect x="260" y="1326" width="560" height="78" rx="39" fill="${style.accent}" opacity="0.92" />
    <text x="${WIDTH / 2}" y="1378" text-anchor="middle" font-family="Arial, Segoe UI, sans-serif" font-size="30" font-weight="800" fill="${style.bg1}">${escapeXml(lines[1] ?? "Open now")}</text>
  </g>`;
}

function textLayer({ scene, style, sceneProgress, isCta }) {
  const enterRaw = easeOutCubic(sceneProgress / 0.18);
  const enter = 0.58 + enterRaw * 0.42;
  const yShift = (1 - enterRaw) * 46;
  const headlineLines = wrapText(scene.headline, 19, 2);
  const detailLines = scene.lines.slice(0, 2);
  const headlineSize = headlineLines.length > 1 ? 66 : 78;
  const headlineY = isCta ? 980 : 1035;
  return `
  <g transform="translate(0 ${yShift.toFixed(1)})" opacity="${enter.toFixed(2)}">
    <text x="${WIDTH / 2}" y="180" text-anchor="middle" font-family="Arial, Segoe UI, sans-serif" font-size="24" fill="${style.muted}" letter-spacing="5">${escapeXml(scene.label)}</text>
    ${frameLines(headlineLines, WIDTH / 2, headlineY, headlineSize, Math.round(headlineSize * 1.08), style.text, 0.98)}
    ${frameLines(detailLines, WIDTH / 2, headlineY + 172, 36, 48, style.muted, 0.9)}
  </g>`;
}

function frameSvg({ pack, frameIndex, packIndex }) {
  const brief = pack.brief;
  const seed = hashString(`${brief.sourceItemId}-${packIndex}`);
  const template = getTemplate(brief.contentType);
  const style = getStylePreset(template, packIndex);
  const scenes = buildPremiumScenes(brief);
  const seconds = frameIndex / DESIGN_FPS;
  const timing = sceneForTime(seconds);
  const sceneIndex = SCENE_TIMINGS.findIndex((scene) => scene.key === timing.key);
  const scene = scenes[sceneIndex];
  const sceneDuration = timing.end - timing.start;
  const localProgress = clamp((seconds - timing.start) / sceneDuration, 0, 1);
  const isCta = timing.key === "cta";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  ${backgroundSvg({ seed, frameIndex, style })}
  ${premiumFrame({ style, frameIndex, sceneProgress: localProgress })}
  <text x="${WIDTH / 2}" y="245" text-anchor="middle" font-family="Arial, Segoe UI, sans-serif" font-size="28" fill="${style.muted}" letter-spacing="6">${escapeXml(brief.platform.toUpperCase())}</text>
  <text x="${WIDTH / 2}" y="304" text-anchor="middle" font-family="Arial, Segoe UI, sans-serif" font-size="32" fill="${style.text}" opacity="0.9">${escapeXml(titleLabel(brief))}</text>
  ${templateLayer({ brief, template, style, frameIndex, localProgress, seed })}
  ${textLayer({ scene, style, sceneProgress: localProgress, isCta })}
  ${isCta ? ctaCard({ style, scene, enter: easeOutCubic(localProgress / 0.32) }) : ""}
  <rect x="${SAFE_AREA.x}" y="${SAFE_AREA.y}" width="${SAFE_AREA.width}" height="${SAFE_AREA.height}" rx="44" fill="none" stroke="${style.accent}" stroke-width="1" opacity="0.12" />
  <text x="${WIDTH / 2}" y="1736" text-anchor="middle" font-family="Arial, Segoe UI, sans-serif" font-size="24" fill="${style.muted}" opacity="0.72">entertainment-only astrology - no payment - no VIP unlock</text>
</svg>`;
}

async function renderFrame(svg, outputPath) {
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
}

function runBinary(binaryPath, args, options = {}) {
  const result = child_process.spawnSync(binaryPath, args, {
    encoding: "utf8",
    shell: false,
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`${path.basename(binaryPath)} failed: ${(result.stderr || result.stdout || "").slice(0, 1400)}`);
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

function buildPremiumSrt(scenes) {
  return scenes.map((scene, index) => [
    String(index + 1),
    `${scene.srtStart} --> ${scene.srtEnd}`,
    [scene.headline, ...scene.lines].filter(Boolean).join(" / "),
  ].join("\n")).join("\n\n") + "\n";
}

function buildPremiumPostingChecklist(pack, visualReport) {
  const base = pack.files["posting-checklist.md"] || "";
  return `${base.trim()}
- Premium renderer: pass
- Premium style preset: ${visualReport.stylePreset}
- Animated starfield/particles: pass
- Parallax/glow layers: pass
- Text overload reduced: pass
- CTA end card improved: pass
- Manual owner visual review required: Yes
`;
}

function buildVisualStyleReport({ pack, packIndex }) {
  const template = getTemplate(pack.brief.contentType);
  const style = getStylePreset(template, packIndex);
  return {
    schemaVersion: 1,
    phase: "social_phase_1_package_f",
    mode: "premium_video_creative_upgrade",
    sourceItemId: pack.brief.sourceItemId,
    platform: pack.brief.platform,
    contentType: pack.brief.contentType,
    stylePreset: style.name,
    template: template.name,
    sceneVariant: template.variant,
    motif: template.motif,
    animatedBackgrounds: true,
    gradientBackgroundMovement: true,
    starfieldParticles: true,
    glowLayers: true,
    softParallax: true,
    premiumCardFrame: true,
    zodiacSymbols: true,
    animatedTextEntrance: true,
    ctaEndCardImproved: true,
    textRules: {
      maxHeadlinePerScene: 1,
      maxShortLinesPerScene: 2,
      firstHookTargetSeconds: 1.5,
      textOverloadReduced: true,
    },
    safeAreas: {
      format: "9:16",
      width: WIDTH,
      height: HEIGHT,
      centralSafeArea: SAFE_AREA,
      tiktokReelsUiAware: true,
    },
    safety: {
      ctaSafe: pack.brief.safety.ctaSafe,
      vipLockedPreviewOnly: pack.brief.contentType !== "vip_preview_teaser" || pack.brief.safety.vipPaymentSafe,
      noAdminDashboardUrl: pack.brief.safety.noAdminDashboardUrl,
      noPaymentScreen: true,
      noVipUnlock: true,
      externalApisUsed: false,
      socialPosting: false,
      networkUpload: false,
    },
  };
}

async function renderPremiumPack({ pack, packIndex, outputFolder, renderer }) {
  fs.mkdirSync(outputFolder, { recursive: true });
  const framesDir = path.join(outputFolder, "_premium_frames");
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });

  const scenes = buildPremiumScenes(pack.brief);
  for (let start = 0; start < FRAME_COUNT; start += FRAME_RENDER_BATCH_SIZE) {
    const tasks = [];
    for (let frameIndex = start; frameIndex < Math.min(start + FRAME_RENDER_BATCH_SIZE, FRAME_COUNT); frameIndex += 1) {
      const frameName = `frame-${String(frameIndex + 1).padStart(4, "0")}.png`;
      const framePath = path.join(framesDir, frameName);
      tasks.push(renderFrame(frameSvg({ pack, frameIndex, packIndex }), framePath));
    }
    await Promise.all(tasks);
  }
  fs.copyFileSync(path.join(framesDir, "frame-0001.png"), path.join(outputFolder, "thumbnail.png"));

  const videoPath = path.join(outputFolder, "video.mp4");
  runBinary(renderer.ffmpegPath, [
    "-y",
    "-framerate", String(DESIGN_FPS),
    "-i", path.join(framesDir, "frame-%04d.png"),
    "-t", String(RENDER_DURATION_SECONDS),
    "-vf", `fps=${OUTPUT_FPS},format=yuv420p`,
    "-r", String(OUTPUT_FPS),
    "-an",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "23",
    "-movflags", "+faststart",
    videoPath,
  ]);

  const visualReport = buildVisualStyleReport({ pack, packIndex });
  const outputFiles = {
    "caption.txt": pack.files["caption.txt"],
    "hashtags.txt": pack.files["hashtags.txt"],
    "subtitles.srt": buildPremiumSrt(scenes),
    "voiceover.txt": pack.files["voiceover.txt"],
    "posting-checklist.md": buildPremiumPostingChecklist(pack, visualReport),
    "visual-style-report.json": `${JSON.stringify(visualReport, null, 2)}\n`,
  };
  for (const [fileName, contents] of Object.entries(outputFiles)) {
    fs.writeFileSync(path.join(outputFolder, fileName), contents, "utf8");
  }

  const probe = renderer.ffprobeAvailable ? probeVideo({ videoPath, renderer }) : null;
  const report = {
    schemaVersion: 1,
    phase: "social_phase_1_package_f",
    mode: "premium_local_auto_mp4_render",
    sourceItemId: pack.brief.sourceItemId,
    platform: pack.brief.platform,
    contentType: pack.brief.contentType,
    outputFolder,
    videoPath,
    thumbnailPath: path.join(outputFolder, "thumbnail.png"),
    renderer: {
      technology: "sharp animated SVG/PNG frame sequence + ffmpeg 30fps encoder",
      ffmpegAvailable: renderer.ffmpegAvailable,
      ffprobeAvailable: renderer.ffprobeAvailable,
      externalApisUsed: false,
      tts: "none",
      audio: "silent",
      designFps: DESIGN_FPS,
      outputFps: OUTPUT_FPS,
      frameRenderBatchSize: FRAME_RENDER_BATCH_SIZE,
    },
    specs: {
      width: WIDTH,
      height: HEIGHT,
      aspectRatio: "9:16",
      targetDurationSeconds: RENDER_DURATION_SECONDS,
      scenes: scenes.map((scene) => ({
        key: scene.key,
        timing: scene.label,
        headline: scene.headline,
        lines: scene.lines,
      })),
      ctaEndCard: true,
      safeArea: "central 820x1420 safe area; top/bottom UI avoided for TikTok/Reels",
      visualStyle: visualReport.stylePreset,
      sceneVariant: visualReport.sceneVariant,
    },
    probe,
    visualStyleReportPath: path.join(outputFolder, "visual-style-report.json"),
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

export function createPremiumMp4RenderPlan({ scope, date, startDate, days }) {
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
    designFps: DESIGN_FPS,
    outputFps: OUTPUT_FPS,
    stylePresets: Object.keys(PREMIUM_STYLE_PRESETS),
    contentTypeTemplates: Object.keys(CONTENT_TEMPLATES),
  };
}

export async function writeSocialPremiumMp4Bundle({ scope, date, startDate, days, rootDir = process.cwd(), maxPacks = Infinity }) {
  const renderer = await getMp4RendererAvailability();
  if (!renderer.ffmpegAvailable) {
    throw new Error(`ffmpeg is not available. Install with: ${renderer.installHint}`);
  }

  const bundle = buildInputBundle({ scope, date, startDate, days });
  const outputRoot = outputRootFor({ scope, date, startDate, days });
  const selectedPacks = bundle.packs.slice(0, maxPacks);
  const reports = [];
  for (let index = 0; index < selectedPacks.length; index += 1) {
    const pack = selectedPacks[index];
    const outputFolder = path.join(rootDir, outputFolderForPack(outputRoot, pack));
    reports.push(await renderPremiumPack({ pack, packIndex: index, outputFolder, renderer }));
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
    visualStyleReportsGenerated: reports.length,
    postingChecklistsGenerated: reports.length,
    reports,
    renderer,
    stylePresets: Object.keys(PREMIUM_STYLE_PRESETS),
    contentTypeTemplates: Object.keys(CONTENT_TEMPLATES),
  };
}

export function requiredPremiumMp4Outputs() {
  return [...REQUIRED_PREMIUM_OUTPUTS];
}
