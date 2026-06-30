import fs from "fs";
import path from "path";
import process from "process";
import { buildZodiacPost } from "../generate-zodiac-plan.mjs";
import { generateWeeklyPosts } from "./zodiac-weekly-pipeline.mjs";
import { getCompatibilityButtonReport } from "./zodiac-compatibility-bot.mjs";

export const SOCIAL_EXPORT_ROOT = "data/social-exports";

const PLATFORMS = ["instagram", "tiktok"];
const BOT_USERNAME = "zodiac_love_check_bot";
const REVIEW_STATUS = "needs_manual_review";

const ZODIAC_CHANNELS = [
  { slug: "zodiac-general", label: "Общий гороскоп", sign: "all" },
  { slug: "aries", label: "Овен", sign: "aries" },
  { slug: "taurus", label: "Телец", sign: "taurus" },
  { slug: "gemini", label: "Близнецы", sign: "gemini" },
  { slug: "cancer", label: "Рак", sign: "cancer" },
  { slug: "leo", label: "Лев", sign: "leo" },
  { slug: "virgo", label: "Дева", sign: "virgo" },
  { slug: "libra", label: "Весы", sign: "libra" },
  { slug: "scorpio", label: "Скорпион", sign: "scorpio" },
  { slug: "sagittarius", label: "Стрелец", sign: "sagittarius" },
  { slug: "capricorn", label: "Козерог", sign: "capricorn" },
  { slug: "aquarius", label: "Водолей", sign: "aquarius" },
  { slug: "pisces", label: "Рыбы", sign: "pisces" },
];

const CONTENT_TYPES = [
  "daily_zodiac_reel",
  "compatibility_hook",
  "mystic_card",
  "birth_matrix_teaser",
  "vip_preview_teaser",
  "weekly_forecast_batch",
];

const HASHTAGS = {
  instagram: ["#гороскоп", "#знакизодиака", "#совместимость", "#таро", "#миниапп", "#астрология"],
  tiktok: ["#гороскоп", "#зодиак", "#совместимость", "#картадня", "#астро", "#telegram"],
};

function stableHash(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function pick(items, seed) {
  return items[stableHash(seed) % items.length];
}

function assertIsoDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) {
    throw new Error("Expected --date YYYY-MM-DD.");
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error("Expected a real calendar date in YYYY-MM-DD format.");
  }
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function firstUsefulLines(value, limit = 3) {
  return stripHtml(value)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function truncate(value, maxLength) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function telegramStartApp(startapp) {
  return `https://t.me/${BOT_USERNAME}?startapp=${encodeURIComponent(startapp)}`;
}

function isoWeekCode(date) {
  const current = new Date(`${date}T00:00:00.000Z`);
  current.setUTCDate(current.getUTCDate() + 4 - (current.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((current - yearStart) / 86400000) + 1) / 7);
  return `${current.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function baseItem({ id, platform, date, contentType, title, hook, sourceSummary, cta, startapp, seed }) {
  const shortVideoScript = [
    `0-3s: ${hook}`,
    `4-12s: ${sourceSummary}`,
    "13-22s: Покажи один мягкий вывод и один безопасный следующий шаг.",
    `23-30s: CTA: ${cta.label}`,
  ];

  return {
    id,
    platform,
    date,
    contentType,
    title,
    hook,
    durationSeconds: 30,
    shortVideoScript,
    sceneBeats: [
      { time: "0-3s", visual: "Крупный 9:16 титр, темный космический фон, один главный символ.", text: hook },
      { time: "4-12s", visual: "Медленный зум на знак, карту или мягкую абстрактную сетку.", text: truncate(sourceSummary, 120) },
      { time: "13-22s", visual: "Три коротких тезиса появляются по очереди.", text: "настрой / подсказка / действие" },
      { time: "23-30s", visual: "Финальный экран с Telegram CTA и Mini App подсказкой.", text: cta.label },
    ],
    voiceover: [
      hook,
      sourceSummary,
      "Это развлекательный астрологический формат: возьмите то, что откликается, и проверьте себя в Mini App.",
    ],
    onScreenText: [
      hook,
      truncate(sourceSummary, 72),
      "Выбери свой знак в Mini App",
      cta.label,
    ],
    caption: buildCaption({ platform, title, sourceSummary, cta }),
    hashtags: HASHTAGS[platform],
    cta,
    storyboardPrompt9x16: buildStoryboardPrompt({ platform, contentType, title, hook, seed }),
    reviewStatus: REVIEW_STATUS,
    safetyNotes: [
      "Manual export only.",
      "No social API posting.",
      "Entertainment-style astrology wording.",
      "No medical, financial, or legal certainty claims.",
    ],
  };
}

function buildCaption({ platform, title, sourceSummary, cta }) {
  const platformTail = platform === "instagram"
    ? "Сохрани Reels и открой Mini App, когда захочется проверить свой знак."
    : "Напиши свой знак в комментариях и открой Mini App для личного маршрута.";
  return `${title}\n\n${truncate(sourceSummary, 180)}\n\n${platformTail}\n${cta.label}: ${cta.url}`;
}

function buildStoryboardPrompt({ platform, contentType, title, hook, seed }) {
  const palette = pick([
    "deep violet, rose gold, soft starlight",
    "midnight blue, warm gold, subtle rose accents",
    "black velvet, lunar silver, muted magenta",
  ], `${seed}:palette`);
  return [
    "9:16 vertical short-video storyboard.",
    `Platform: ${platform}.`,
    `Topic: ${contentType}.`,
    `Title: ${title}.`,
    `Opening text: ${hook}.`,
    `Visual style: premium Telegram Mini App astrology, ${palette}, clean typography, no fake results, no payment screen.`,
    "Frames: hook title, symbolic detail, three beat cards, Telegram Mini App CTA end card.",
  ].join(" ");
}

function buildDailyItems({ platform, date }) {
  return ZODIAC_CHANNELS.map((channel) => {
    const post = buildZodiacPost({ date, channelId: channel.slug, stylePresetId: "luxury-mystic" });
    const lines = firstUsefulLines(post.text, 4);
    const sourceSummary = truncate(lines.slice(1).join(" "), 220) || "Мягкий дневной прогноз с одним фокусом и спокойным следующим шагом.";
    const startapp = channel.slug === "zodiac-general" ? "mystic" : `compat_${channel.slug}`;
    return baseItem({
      id: `${date}-${platform}-daily-${channel.slug}`,
      platform,
      date,
      contentType: "daily_zodiac_reel",
      title: `Daily Zodiac Reel: ${channel.label}`,
      hook: channel.slug === "zodiac-general"
        ? `Главный настрой дня на ${date}`
        : `${channel.label}: один знак дня, который стоит заметить`,
      sourceSummary,
      startapp,
      cta: { label: "Открыть Telegram Mini App", url: telegramStartApp(startapp), target: "telegram_mini_app" },
      seed: `${date}:daily:${channel.slug}`,
    });
  });
}

function buildCompatibilityItems({ platform, date }) {
  const seeds = ["zodiac-general", "aries", "leo", "scorpio"];
  return seeds.map((slug) => {
    const report = getCompatibilityButtonReport(slug);
    const channel = ZODIAC_CHANNELS.find((item) => item.slug === slug);
    const startapp = report.start || (slug === "zodiac-general" ? "compat" : `compat_${slug}`);
    return baseItem({
      id: `${date}-${platform}-compatibility-${slug}`,
      platform,
      date,
      contentType: "compatibility_hook",
      title: `Compatibility Hook: ${channel?.label ?? slug}`,
      hook: slug === "zodiac-general"
        ? "Проверь вашу пару без драматичных обещаний"
        : `${channel?.label ?? slug}: с кем сегодня легче услышать друг друга?`,
      sourceSummary: "Короткий social hook ведет в интерактивную совместимость Mini App: знаки, мягкая динамика пары и безопасный preview без личных обещаний.",
      startapp,
      cta: { label: "Проверить совместимость в Telegram", url: telegramStartApp(startapp), target: "telegram_mini_app" },
      seed: `${date}:compatibility:${slug}`,
    });
  });
}

function buildMysticItems({ platform, date }) {
  const cards = [
    { key: "sun", title: "Карта Солнца", theme: "больше ясности, меньше спешки" },
    { key: "moon", title: "Карта Луны", theme: "услышать тихий внутренний сигнал" },
    { key: "star", title: "Карта Звезды", theme: "вернуть надежду через один маленький шаг" },
  ];
  const card = pick(cards, `${date}:mystic:${platform}`);
  return [baseItem({
    id: `${date}-${platform}-mystic-card`,
    platform,
    date,
    contentType: "mystic_card",
    title: `Mystic Card: ${card.title}`,
    hook: `${card.title} дня: что она мягко подсвечивает?`,
    sourceSummary: `Мистический card-of-the-day teaser: ${card.theme}. Формат остается развлекательным и ведет в Mini App mystic flow.`,
    startapp: "mystic",
    cta: { label: "Открыть карту дня в Telegram", url: telegramStartApp("mystic"), target: "telegram_mini_app" },
    seed: `${date}:mystic:${card.key}`,
  })];
}

function buildBirthMatrixItems({ platform, date }) {
  return [baseItem({
    id: `${date}-${platform}-birth-matrix`,
    platform,
    date,
    contentType: "birth_matrix_teaser",
    title: "Birth Matrix Teaser",
    hook: "Твоя дата рождения может стать красивой подсказкой для саморазбора",
    sourceSummary: "Birth Matrix teaser показывает мягкий numerology-style preview: ключевое число, энергия дня и совместимость как развлекательный маршрут, без жестких прогнозов.",
    startapp: "birth_matrix",
    cta: { label: "Открыть Матрицу в Telegram", url: telegramStartApp("birth_matrix"), target: "telegram_mini_app" },
    seed: `${date}:birth-matrix`,
  })];
}

function buildVipPreviewItems({ platform, date }) {
  const item = baseItem({
    id: `${date}-${platform}-vip-preview`,
    platform,
    date,
    contentType: "vip_preview_teaser",
    title: "VIP Preview Teaser",
    hook: "VIP preview открыт как витрина, но доступ остается закрытым",
    sourceSummary: "Короткий teaser показывает будущий премиум-формат: расширенный разбор, персональные подсказки и сохраненные результаты. Это locked preview only: без оплаты, без разблокировки, без обхода доступа.",
    startapp: "vip",
    cta: { label: "Посмотреть закрытый VIP preview", url: telegramStartApp("vip"), target: "telegram_mini_app" },
    seed: `${date}:vip-preview`,
  });
  item.reviewStatus = "locked_preview_needs_manual_review";
  item.vipBoundary = {
    access: "locked_preview_only",
    payment: "not_active",
    entitlementUnlock: "not_active",
  };
  return [item];
}

function buildWeeklyItems({ platform, date }) {
  const week = isoWeekCode(date);
  const plan = generateWeeklyPosts(week);
  const sample = plan.posts.slice(0, 4).map((post) => firstUsefulLines(post.text, 2).join(" ")).filter(Boolean);
  return [baseItem({
    id: `${date}-${platform}-weekly-forecast-batch-${week}`,
    platform,
    date,
    contentType: "weekly_forecast_batch",
    title: `Weekly Forecast Batch: ${week}`,
    hook: `Неделя ${plan.weekRange}: выбери свой знак и один спокойный фокус`,
    sourceSummary: `Weekly batch для 13 zodiac channels. Sample beats: ${truncate(sample.join(" / "), 240)}.`,
    startapp: "week",
    cta: { label: "Открыть прогноз недели в Telegram", url: telegramStartApp("week"), target: "telegram_mini_app" },
    seed: `${date}:weekly:${week}`,
  })];
}

export function buildSocialExportPack({ date, platform }) {
  assertIsoDate(date);
  if (!PLATFORMS.includes(platform)) throw new Error(`Unsupported platform: ${platform}`);

  const items = [
    ...buildDailyItems({ platform, date }),
    ...buildCompatibilityItems({ platform, date }),
    ...buildMysticItems({ platform, date }),
    ...buildBirthMatrixItems({ platform, date }),
    ...buildVipPreviewItems({ platform, date }),
    ...buildWeeklyItems({ platform, date }),
  ];

  return {
    schemaVersion: 1,
    phase: "social_phase_1_package_a",
    mode: "manual_export_only",
    generatedAt: new Date().toISOString(),
    date,
    platform,
    outputFormat: "json_and_markdown_copy_sheet",
    safety: {
      instagramApiConnected: false,
      tiktokApiConnected: false,
      apiPosting: false,
      socialTokensRequired: false,
      telegramLivePublishTouched: false,
      paymentsAdded: false,
      vipUnlockAdded: false,
      cronOrWorkflowChanged: false,
    },
    sourceReferences: [
      "scripts/generate-zodiac-plan.mjs buildZodiacPost",
      "scripts/lib/zodiac-weekly-pipeline.mjs generateWeeklyPosts",
      "scripts/lib/zodiac-compatibility-bot.mjs getCompatibilityButtonReport",
      "Mini App startapp routes: mystic, compat, birth_matrix, vip, week",
    ],
    contentTypes: CONTENT_TYPES,
    reviewStatus: REVIEW_STATUS,
    items,
  };
}

export function buildSocialExportBundle({ date }) {
  return {
    date,
    root: path.join(SOCIAL_EXPORT_ROOT, date),
    platforms: PLATFORMS.map((platform) => buildSocialExportPack({ date, platform })),
  };
}

export function renderCopySheet(pack) {
  const lines = [
    `# Social Manual Export - ${pack.platform} - ${pack.date}`,
    "",
    `Review status: ${pack.reviewStatus}`,
    `Mode: ${pack.mode}`,
    "",
    "Safety: manual posting only; no Instagram API, no TikTok API, no social tokens, no payment, no VIP unlock.",
    "",
  ];

  for (const item of pack.items) {
    lines.push(`## ${item.title}`);
    lines.push("");
    lines.push(`Content type: ${item.contentType}`);
    lines.push(`Review status: ${item.reviewStatus}`);
    lines.push(`Hook: ${item.hook}`);
    lines.push("");
    lines.push("Script:");
    for (const beat of item.shortVideoScript) lines.push(`- ${beat}`);
    lines.push("");
    lines.push("Scene beats:");
    for (const beat of item.sceneBeats) lines.push(`- ${beat.time}: ${beat.visual} Text: ${beat.text}`);
    lines.push("");
    lines.push("Voiceover:");
    for (const line of item.voiceover) lines.push(`- ${line}`);
    lines.push("");
    lines.push("On-screen text:");
    for (const line of item.onScreenText) lines.push(`- ${line}`);
    lines.push("");
    lines.push("Caption:");
    lines.push(item.caption);
    lines.push("");
    lines.push(`Hashtags: ${item.hashtags.join(" ")}`);
    lines.push(`CTA: ${item.cta.label} - ${item.cta.url}`);
    lines.push("");
    lines.push("9:16 storyboard prompt:");
    lines.push(item.storyboardPrompt9x16);
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export function writeSocialExportBundle({ date, rootDir = process.cwd() }) {
  const bundle = buildSocialExportBundle({ date });
  const written = [];

  for (const pack of bundle.platforms) {
    const outDir = path.join(rootDir, SOCIAL_EXPORT_ROOT, date, pack.platform);
    fs.mkdirSync(outDir, { recursive: true });
    const jsonPath = path.join(outDir, "social-export.json");
    const markdownPath = path.join(outDir, "copy-sheet.md");
    fs.writeFileSync(jsonPath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
    fs.writeFileSync(markdownPath, renderCopySheet(pack), "utf8");
    written.push(jsonPath, markdownPath);
  }

  return {
    date,
    outputRoot: path.join(rootDir, SOCIAL_EXPORT_ROOT, date),
    written,
    itemCount: bundle.platforms.reduce((sum, pack) => sum + pack.items.length, 0),
    platformCount: bundle.platforms.length,
  };
}

export function createGenerationPlan({ date }) {
  const bundle = buildSocialExportBundle({ date });
  return {
    date,
    outputRoot: path.join(SOCIAL_EXPORT_ROOT, date),
    platforms: bundle.platforms.map((pack) => ({
      platform: pack.platform,
      itemCount: pack.items.length,
      contentTypes: Array.from(new Set(pack.items.map((item) => item.contentType))).sort(),
      jsonPath: path.join(SOCIAL_EXPORT_ROOT, date, pack.platform, "social-export.json"),
      markdownPath: path.join(SOCIAL_EXPORT_ROOT, date, pack.platform, "copy-sheet.md"),
    })),
  };
}

export { CONTENT_TYPES, PLATFORMS };
