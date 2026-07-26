#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { buildZodiacPost, ZODIAC_DAILY_CHANNELS } from "./generate-zodiac-plan.mjs";
import {
  WEEKLY_DAY_LABELS,
  ZODIAC_WEEKLY_CHANNELS,
  generateWeeklyPosts,
  parseWeekCode,
  validateWeeklyPostQuality,
} from "./lib/zodiac-weekly-pipeline.mjs";
import {
  SIGNS,
  findOrderedCompatibilityPair,
  generateCompatibilityPost,
  loadCompatibilityConfig,
  validateCompatibilityConfig,
  validateCompatibilityKeyboard,
} from "./lib/zodiac-compatibility-pipeline.mjs";
import { validateZodiacDailyPostGuidance } from "./lib/zodiac-daily-guidance.mjs";

const APPROVED_CTA_URL = "https://t.me/zodiac_love_check_bot?startapp=mystic";
const DEFAULT_REPORT_ROOT = path.join(process.cwd(), "data", "runtime", "content-quality");
const DEFAULT_DATE = "2026-07-07";
const KYIV_TIMEZONE = "Europe/Kyiv";
const TELEGRAM_HARD_LIMIT = 4096;
const TELEGRAM_SAFE_LIMIT = 3800;
const PREVIOUS_RECORDED_SCORE = 9.41;

const SIGN_META = [
  { slug: "aries", ruName: "Овен", ukName: "Овен", range: "21 марта — 19 апреля" },
  { slug: "taurus", ruName: "Телец", ukName: "Телець", range: "20 апреля — 20 мая" },
  { slug: "gemini", ruName: "Близнецы", ukName: "Близнюки", range: "21 мая — 20 июня" },
  { slug: "cancer", ruName: "Рак", ukName: "Рак", range: "21 июня — 22 июля" },
  { slug: "leo", ruName: "Лев", ukName: "Лев", range: "23 июля — 22 августа" },
  { slug: "virgo", ruName: "Дева", ukName: "Діва", range: "23 августа — 22 сентября" },
  { slug: "libra", ruName: "Весы", ukName: "Терези", range: "23 сентября — 22 октября" },
  { slug: "scorpio", ruName: "Скорпион", ukName: "Скорпіон", range: "23 октября — 21 ноября" },
  { slug: "sagittarius", ruName: "Стрелец", ukName: "Стрілець", range: "22 ноября — 21 декабря" },
  { slug: "capricorn", ruName: "Козерог", ukName: "Козоріг", range: "22 декабря — 19 января" },
  { slug: "aquarius", ruName: "Водолей", ukName: "Водолій", range: "20 января — 18 февраля" },
  { slug: "pisces", ruName: "Рыбы", ukName: "Риби", range: "19 февраля — 20 марта" },
];

const DAILY_LABELS = [
  "Общий настрой дня:",
  "Любовь / отношения:",
  "Работа / деньги:",
  "Энергия / самочувствие:",
  "Совет дня:",
  "Маленькое действие:",
  "Лучше избегать:",
];

const WEEKLY_LABELS = [
  "1. Старт недели",
  "2. Середина недели",
  "3. Выходные и восстановление",
  "4. Главный вектор",
  "Любовь / отношения",
  "Работа / деньги",
  "Энергия / самочувствие",
  "Главный совет недели",
  "День осторожности:",
];

const COMPATIBILITY_LABELS = [
  "Фокус пары:",
  "Как работает притяжение:",
  "Любовь:",
  "Общение:",
  "Сильная сторона пары:",
  "Риск:",
  "Практика на сегодня:",
];

const TAROT_LABELS = [
  "Ключ:",
  "В любви:",
  "Совет:",
  "Вопрос к себе:",
  "Действие дня:",
];

const FORBIDDEN_CLAIMS = {
  deterministicPredictions: [
    /точно\s+произойд[её]т/iu,
    /\b(он|она)\s+обязательно\s+верн[её]тся/iu,
    /судьба\s+решена/iu,
    /судьба\s+не\s+оставляет\s+выбора/iu,
    /карта\s+доказывает/iu,
    /гарант/iu,
    /guarantee(?:d|s)?/iu,
    /100\s*%/iu,
  ],
  medicalDirectives: [
    /не\s+обращайтесь\s+к\s+врачу/iu,
    /откажитесь\s+от\s+лечения/iu,
    /вам\s+не\s+нужен\s+врач/iu,
    /вас\s+жд[её]т\s+болезнь/iu,
  ],
  guaranteedFinancialClaims: [
    /гарантированно\s+получите\s+деньги/iu,
    /возьмите\s+кредит/iu,
    /инвестируйте\s+немедленно/iu,
    /деньги\s+точно\s+придут/iu,
  ],
  relationshipCoercion: [
    /расстаньтесь\s+прямо\s+сейчас/iu,
    /вы\s+обязаны\s+вернуться/iu,
    /немедленно\s+прекратите\s+отношения/iu,
    /пара\s+обречена/iu,
  ],
  fearBasedCta: [
    /нажмите\s+немедленно/iu,
    /последний\s+шанс/iu,
    /иначе\s+будет\s+поздно/iu,
    /откройте\s+сейчас,\s+пока/iu,
  ],
};

const PLACEHOLDER_PATTERN = /\b(?:TODO|TBD|FIXME|placeholder|lorem ipsum|undefined|null|debug|stack trace)\b/iu;
const MOJIBAKE_PATTERN = /(?:Рќ|Рџ|РЎ|Р’|Рђ|Р“|Р”|Р—|РЃ|Р™|Рљ|Рћ|Р‘|Рњ|Р›|Рў|Р§|Р­|СЃ|СЊ|С‹|СЏ|СЂ|С‚|вЂ|в™|рџ|бљ|�)/u;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u;
const SECRET_TOKEN_PATTERN = /\b\d{7,}:[A-Za-z0-9_-]{20,}\b/u;
const CHANNEL_ID_PATTERN = /(?:^|\D)-100\d{6,}(?:\D|$)/u;
const TAG_PATTERN = /<[^>]+>/g;
const ALLOWED_HTML_TAGS = new Set(["b", "i"]);
const STRONG_UK_TOKENS = new Set(["сьогодні", "стосунки", "гроші", "краще", "потрібно", "зараз", "щоб", "цей", "ця", "відчути"]);
const STRONG_RU_TOKENS = new Set(["сегодня", "отношения", "деньги", "лучше", "нужно", "сейчас", "чтобы", "этот", "эта", "почувствовать"]);
const REVIEW_COMPATIBILITY_IDS = [
  "aries-aries",
  "aries-cancer",
  "taurus-gemini",
  "aries-libra",
  "scorpio-taurus",
  "virgo-pisces",
  "pisces-scorpio",
];
const REVIEW_TAROT_SLUGS = ["star", "tower", "temperance", "death", "lovers", "hermit"];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    date: DEFAULT_DATE,
    reportRoot: DEFAULT_REPORT_ROOT,
    reviewRoot: null,
  };

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index + 1];
    if ((args[index] === "--date" || args[index] === "--start") && value) {
      options.date = value;
      index += 1;
    } else if (args[index] === "--report-root" && value) {
      options.reportRoot = path.resolve(value);
      index += 1;
    } else if (args[index] === "--review-root" && value) {
      options.reviewRoot = path.resolve(value);
      index += 1;
    }
  }

  parseDateKey(options.date);
  options.week = isoWeekCode(options.date);

  if (options.reviewRoot && isPathInside(process.cwd(), options.reviewRoot)) {
    throw new Error("--review-root must be outside the repository.");
  }

  return options;
}

function isPathInside(parent, child) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function parseDateKey(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey || ""))) {
    throw new Error(`Invalid date: ${dateKey}`);
  }
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid calendar date: ${dateKey}`);
  }
  return date;
}

function addDays(dateKey, days) {
  const date = parseDateKey(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateKey(date);
}

function formatDateKey(date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function formatRuDate(dateKey) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(parseDateKey(dateKey));
}

function formatNumericDate(dateKey) {
  const [year, month, day] = String(dateKey).split("-");
  return `${day}.${month}.${year}`;
}

function isoWeekCode(dateKey) {
  const target = parseDateKey(dateKey);
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function stripMarkup(text) {
  return String(text || "").replace(TAG_PATTERN, "").trim();
}

function normalizeWhitespace(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeForDuplicate(text) {
  const signNames = SIGN_META.flatMap((sign) => [sign.ruName, sign.ukName]).sort((left, right) => right.length - left.length);
  const signPattern = new RegExp(`\\b(?:${signNames.map(escapeRegExp).join("|")})\\b`, "giu");
  return stripMarkup(text)
    .toLocaleLowerCase("ru-RU")
    .replaceAll(APPROVED_CTA_URL.toLocaleLowerCase("ru-RU"), "")
    .replace(/https?:\/\/\S+/giu, "")
    .replace(/#[^\s]+/gu, "")
    .replace(signPattern, "<sign>")
    .replace(/\b\d{1,4}(?:[./-]\d{1,4})*\b/gu, "<date>")
    .replace(/[^\p{L}\p{N}<>]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hashValue(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function average(values) {
  if (values.length === 0) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

function clampScore(value) {
  return Number(Math.max(0, Math.min(10, value)).toFixed(2));
}

function duplicatePairs(items, normalizer) {
  const seen = new Map();
  const pairs = [];
  for (const item of items) {
    const key = normalizer(item.text);
    if (seen.has(key)) pairs.push([seen.get(key), item.id]);
    else seen.set(key, item.id);
  }
  return pairs;
}

function messageSentences(text) {
  const ignored = /^(?:главная|любовь|общение|риск|совет|практика|ритуал|лучше|хэштеги|период|фокус|как работает|сильная сторона|действие|вопрос|ключ|день осторожности|открыть|проверить|личный прогноз)\b.*:$/iu;
  return stripMarkup(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.includes(APPROVED_CTA_URL))
    .filter((line) => !line.startsWith("#"))
    .filter((line) => !ignored.test(line))
    .flatMap((line) => line.split(/(?<=[.!?…])\s+/u))
    .map((sentence) => normalizeWhitespace(sentence))
    .filter((sentence) => sentence.length >= 35)
    .filter((sentence) => !/это\s+не\s+(?:обещание|готовый\s+сценарий)/iu.test(sentence));
}

function normalizeSentence(sentence) {
  return normalizeForDuplicate(sentence)
    .split(" ")
    .filter(Boolean)
    .join(" ");
}

function sentenceOpening(sentence) {
  return normalizeSentence(sentence).split(" ").slice(0, 3).join(" ");
}

function sentenceClosing(sentence) {
  const words = normalizeSentence(sentence).split(" ").filter(Boolean);
  return words.slice(-3).join(" ");
}

function repeatedOpeningsWithinMessage(text) {
  const seen = new Set();
  const repeated = new Set();
  for (const sentence of messageSentences(text)) {
    const opening = sentenceOpening(sentence);
    if (opening.split(" ").length < 2) continue;
    if (seen.has(opening)) repeated.add(opening);
    seen.add(opening);
  }
  return [...repeated];
}

function repeatedBoundaryCount(items, selector) {
  const counts = new Map();
  for (const item of items) {
    const sentences = messageSentences(item.text);
    if (sentences.length === 0) continue;
    const value = selector(sentences);
    if (value) counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.values()].reduce((sum, count) => sum + Math.max(0, count - 1), 0);
}

function repeatedSentenceMetrics(items) {
  const counts = new Map();
  let total = 0;
  for (const item of items) {
    for (const sentence of messageSentences(item.text)) {
      const normalized = normalizeSentence(sentence);
      if (!normalized) continue;
      total += 1;
      counts.set(normalized, (counts.get(normalized) || 0) + 1);
    }
  }
  const repeatedOccurrences = [...counts.values()].reduce((sum, count) => sum + Math.max(0, count - 1), 0);
  return {
    sentences: total,
    repeatedOccurrences,
    ratio: total ? Number((repeatedOccurrences / total).toFixed(4)) : 0,
    maxFrequency: counts.size ? Math.max(...counts.values()) : 0,
  };
}

function ngramMetrics(items, size) {
  const counts = new Map();
  let total = 0;
  for (const item of items) {
    for (const sentence of messageSentences(item.text)) {
      const words = normalizeSentence(sentence).split(" ").filter((word) => word.length > 2);
      for (let index = 0; index <= words.length - size; index += 1) {
        const gram = words.slice(index, index + size).join(" ");
        total += 1;
        counts.set(gram, (counts.get(gram) || 0) + 1);
      }
    }
  }
  const repeated = [...counts.values()].filter((count) => count > 1);
  return {
    size,
    total,
    repeatedDistinct: repeated.length,
    maxFrequency: repeated.length ? Math.max(...repeated) : 0,
  };
}

function inspectLanguage(text, expectedLanguage) {
  const plain = stripMarkup(text)
    .replace(APPROVED_CTA_URL, "")
    .replace(/\b(?:Telegram|Mini|App)\b/giu, "");
  const lower = plain.toLocaleLowerCase(expectedLanguage === "uk" ? "uk-UA" : "ru-RU");
  const tokens = lower.match(/\p{L}+/gu) || [];
  const foreignTokens = expectedLanguage === "uk"
    ? tokens.filter((token) => STRONG_RU_TOKENS.has(token))
    : tokens.filter((token) => STRONG_UK_TOKENS.has(token));
  const strongForeignCharacters = expectedLanguage === "ru"
    ? (lower.match(/[їєґ]/gu) || [])
    : [];
  const brokenUnicode = lower.includes("�") || MOJIBAKE_PATTERN.test(plain);
  const unresolvedPlaceholders = PLACEHOLDER_PATTERN.test(plain);
  const contaminationCount = foreignTokens.length + strongForeignCharacters.length;
  const purity = tokens.length
    ? Number((Math.max(0, 1 - contaminationCount / tokens.length) * 100).toFixed(2))
    : 0;

  return {
    expectedLanguage,
    tokenCount: tokens.length,
    contaminationCount,
    brokenUnicode,
    unresolvedPlaceholders,
    purity,
  };
}

function inspectSafety(text) {
  const plain = stripMarkup(text);
  const categories = {};
  for (const [category, patterns] of Object.entries(FORBIDDEN_CLAIMS)) {
    categories[category] = patterns.filter((pattern) => pattern.test(plain)).length;
  }
  return {
    categories,
    total: Object.values(categories).reduce((sum, value) => sum + value, 0),
  };
}

function inspectHtml(text) {
  const errors = [];
  const stack = [];
  const tags = String(text || "").matchAll(/<(\/?)([a-z0-9]+)(?:\s[^>]*)?>/giu);
  for (const match of tags) {
    const closing = match[1] === "/";
    const tag = match[2].toLowerCase();
    if (!ALLOWED_HTML_TAGS.has(tag)) {
      errors.push("unsupported HTML tag");
      continue;
    }
    if (closing) {
      if (stack.pop() !== tag) errors.push("unbalanced HTML tag");
    } else {
      stack.push(tag);
    }
  }
  if (stack.length > 0) errors.push("unclosed HTML tag");
  return [...new Set(errors)];
}

function extractUrls(text) {
  return [...String(text || "").matchAll(/https?:\/\/[^\s<>"')]+/giu)]
    .map((match) => match[0].replace(/[.,;!?]+$/u, ""));
}

function inspectPayload(message) {
  const text = String(message.text || "");
  const length = [...text].length;
  const errors = [];
  const warnings = [];
  const urls = extractUrls(text);

  if (!text.trim()) errors.push("empty message");
  if (length >= TELEGRAM_HARD_LIMIT) errors.push(`Telegram hard limit exceeded: ${length}`);
  else if (length > TELEGRAM_SAFE_LIMIT) warnings.push(`Telegram safe margin is small: ${length}`);
  errors.push(...inspectHtml(text));
  if (CONTROL_CHARACTER_PATTERN.test(text)) errors.push("control character detected");
  if (SECRET_TOKEN_PATTERN.test(text)) errors.push("secret-like token detected");
  if (CHANNEL_ID_PATTERN.test(text)) errors.push("channel-id-like value detected");
  if (PLACEHOLDER_PATTERN.test(stripMarkup(text))) errors.push("placeholder/debug text detected");
  if (urls.some((url) => url !== APPROVED_CTA_URL)) errors.push("unexpected external URL");
  if (!urls.includes(APPROVED_CTA_URL)) errors.push("approved CTA missing");

  return {
    id: message.id,
    parseMode: message.parseMode || "HTML",
    length,
    urls: [...new Set(urls)],
    errors,
    warnings,
  };
}

function inspectTargetConfiguration() {
  const problems = [];
  const dailyTargets = ZODIAC_DAILY_CHANNELS.map((channel) => ({
    slug: channel.id,
    name: channel.ruName,
    language: channel.language || "ru",
    category: channel.category || channel.type,
    enabled: true,
  }));
  const weeklyTargets = ZODIAC_WEEKLY_CHANNELS.map((channel) => ({
    slug: channel.slug,
    name: channel.name,
    language: channel.language || "ru",
    category: channel.category || (channel.slug === "zodiac-general" ? "zodiac-general" : "zodiac-sign"),
    enabled: true,
  }));
  const dailySlugs = dailyTargets.map((target) => target.slug);
  const weeklySlugs = weeklyTargets.map((target) => target.slug);

  if (dailyTargets.length !== 13) problems.push(`configured daily targets must be 13, got ${dailyTargets.length}`);
  if (weeklyTargets.length !== 13) problems.push(`configured weekly targets must be 13, got ${weeklyTargets.length}`);
  if (new Set(dailySlugs).size !== dailyTargets.length) problems.push("duplicate daily target definition");
  if (new Set(weeklySlugs).size !== weeklyTargets.length) problems.push("duplicate weekly target definition");
  if (dailySlugs.join("|") !== weeklySlugs.join("|")) problems.push("daily and weekly target ordering differs");
  if (dailyTargets.filter((target) => target.category === "zodiac-sign").length !== 12) problems.push("zodiac sign target count must be 12");
  if (dailyTargets.filter((target) => target.category === "zodiac-general").length !== 1) problems.push("general zodiac target count must be 1");

  const workflowPath = path.join(process.cwd(), ".github", "workflows", "zodiac-scheduler.yml");
  const workflowSource = fs.readFileSync(workflowPath, "utf8");
  const schedulerTargetReferences = new Set(workflowSource.match(/ZODIAC_[A-Z]+_CHANNEL_ID(?=\s*:)/g) || []).size;
  const schedulerUsesKyivDate = workflowSource.includes(KYIV_TIMEZONE);
  const schedulerUsesDailyPublisher = workflowSource.includes("zodiac:publish-date:live");

  if (schedulerTargetReferences !== 13) problems.push(`scheduler target reference count must be 13, got ${schedulerTargetReferences}`);
  if (!schedulerUsesKyivDate) problems.push("scheduler does not declare Europe/Kyiv calendar policy");
  if (!schedulerUsesDailyPublisher) problems.push("scheduler relationship to daily publisher is missing");

  return {
    targets: dailyTargets,
    configured: dailyTargets.length,
    unique: new Set(dailySlugs).size,
    missing: Math.max(0, 13 - dailyTargets.length),
    duplicates: dailyTargets.length - new Set(dailySlugs).size,
    ruTargets: dailyTargets.filter((target) => target.language === "ru").length,
    uaTargets: dailyTargets.filter((target) => target.language === "uk").length,
    schedulerTargetReferences,
    schedulerUsesKyivDate,
    schedulerUsesDailyPublisher,
    problems,
  };
}

function buildDailyBatch(date) {
  const posts = ZODIAC_DAILY_CHANNELS.map((channel) => buildZodiacPost({ date, channelId: channel.id }));
  const problems = [];
  const expectedDate = formatNumericDate(date);
  const signPosts = posts.filter((post) => post.type === "sign");
  const general = posts.find((post) => post.channelId === "zodiac-general");

  if (posts.length !== 13) problems.push(`daily coverage must be 13, got ${posts.length}`);
  if (!general) problems.push("daily general target is missing");
  for (const sign of SIGN_META) {
    const post = signPosts.find((item) => item.channelId === sign.slug);
    if (!post) {
      problems.push(`daily sign missing: ${sign.slug}`);
      continue;
    }
    const plain = stripMarkup(post.text);
    if (!plain.includes(sign.ruName)) problems.push(`${sign.slug}: title/sign mismatch`);
    if (!plain.includes(sign.range)) problems.push(`${sign.slug}: sign date range mismatch`);
    if (!plain.includes(expectedDate)) problems.push(`${sign.slug}: daily date mismatch`);
    if (post.date !== date) problems.push(`${sign.slug}: metadata date mismatch`);
    if (post.timezone !== KYIV_TIMEZONE) problems.push(`${sign.slug}: timezone metadata mismatch`);
  }
  for (const post of posts) {
    problems.push(...validateZodiacDailyPostGuidance(post).map((problem) => `daily:${post.channelId}: ${problem}`));
  }

  const messages = posts.map((post) => ({
    id: `daily:${post.channelId}`,
    kind: "daily",
    language: post.language || "ru",
    parseMode: "HTML",
    text: post.text,
    requiredLabels: DAILY_LABELS,
    requiredSnippets: [APPROVED_CTA_URL, expectedDate],
    accuracyProblems: [],
  }));

  return { date, posts, signPosts, general, messages, problems };
}

function buildWeeklyBatch(weekCode) {
  const plan = generateWeeklyPosts(weekCode);
  const problems = [];
  const week = parseWeekCode(weekCode);

  if (!week.ok) problems.push(week.error);
  if (plan.posts.length !== 13) problems.push(`weekly coverage must be 13, got ${plan.posts.length}`);
  if (parseDateKey(plan.startDate).getUTCDay() !== 1) problems.push(`${weekCode}: weekly range does not start Monday`);
  if (parseDateKey(plan.endDate).getUTCDay() !== 0) problems.push(`${weekCode}: weekly range does not end Sunday`);
  if (addDays(plan.startDate, 6) !== plan.endDate) problems.push(`${weekCode}: weekly range is not seven days`);

  for (const post of plan.posts) {
    const errors = validateWeeklyPostQuality(post);
    problems.push(...errors.map((error) => `weekly:${post.slug}: ${error}`));
    if (!post.buttonStatus?.ok) {
      problems.push(...(post.buttonStatus?.errors || []).map((error) => `weekly:${post.slug}: ${error}`));
    }
    if (post.language !== "ru") problems.push(`weekly:${post.slug}: unexpected language metadata`);
    if (post.timezone !== KYIV_TIMEZONE) problems.push(`weekly:${post.slug}: timezone metadata mismatch`);
  }

  const messages = plan.posts.map((post) => ({
    id: `weekly:${post.slug}`,
    kind: "weekly",
    language: post.language || "ru",
    parseMode: "HTML",
    text: post.text,
    requiredLabels: WEEKLY_LABELS,
    requiredSnippets: [APPROVED_CTA_URL, plan.weekRange],
    accuracyProblems: [],
  }));

  return { plan, messages, problems };
}

function inspectWeeklyDayRegression() {
  const weekCodes = [
    ...Array.from({ length: 53 }, (_, index) => `2020-W${String(index + 1).padStart(2, "0")}`),
    "2021-W01",
  ];
  const metrics = {
    weeksChecked: weekCodes.length,
    targetsChecked: ZODIAC_WEEKLY_CHANNELS.length,
    combinationsChecked: 0,
    yearTransitionsChecked: 1,
    isoWeek53Included: weekCodes.includes("2020-W53"),
    collisions: 0,
    invalidDayLabels: 0,
    missingBestDays: 0,
    missingCautionDays: 0,
    deterministicMismatches: 0,
    scorpioReviewWeek: "2026-W28",
    scorpioBestDay: null,
    scorpioCautionDay: null,
    problems: [],
  };

  for (const weekCode of weekCodes) {
    const firstPass = generateWeeklyPosts(weekCode).posts;
    const replay = generateWeeklyPosts(weekCode).posts;
    if (firstPass.length !== ZODIAC_WEEKLY_CHANNELS.length || replay.length !== firstPass.length) {
      metrics.problems.push(`${weekCode}: weekly regression target count mismatch`);
      continue;
    }

    for (let index = 0; index < firstPass.length; index += 1) {
      const post = firstPass[index];
      const replayPost = replay[index];
      const bestDay = extractWeeklyDayFromText(post.text, "Лучший день");
      const cautionDay = extractWeeklyDayFromText(post.text, "День осторожности");
      metrics.combinationsChecked += 1;

      if (!bestDay) metrics.missingBestDays += 1;
      else if (!WEEKLY_DAY_LABELS.includes(bestDay)) metrics.invalidDayLabels += 1;
      if (!cautionDay) metrics.missingCautionDays += 1;
      else if (!WEEKLY_DAY_LABELS.includes(cautionDay)) metrics.invalidDayLabels += 1;
      if (bestDay && cautionDay && bestDay === cautionDay) metrics.collisions += 1;
      if (
        replayPost?.slug !== post.slug
        || replayPost?.bestDay !== post.bestDay
        || replayPost?.cautionDay !== post.cautionDay
        || replayPost?.text !== post.text
      ) {
        metrics.deterministicMismatches += 1;
      }
    }
  }

  const scorpioPost = generateWeeklyPosts(metrics.scorpioReviewWeek).posts.find((post) => post.slug === "scorpio");
  metrics.scorpioBestDay = scorpioPost?.bestDay ?? null;
  metrics.scorpioCautionDay = scorpioPost?.cautionDay ?? null;

  if (metrics.combinationsChecked < 676) metrics.problems.push("weekly regression must check at least 676 combinations");
  if (!metrics.isoWeek53Included) metrics.problems.push("weekly regression must include a valid ISO week 53");
  if (metrics.collisions > 0) metrics.problems.push(`weekly best/caution collisions: ${metrics.collisions}`);
  if (metrics.invalidDayLabels > 0) metrics.problems.push(`weekly invalid day labels: ${metrics.invalidDayLabels}`);
  if (metrics.missingBestDays > 0) metrics.problems.push(`weekly missing best days: ${metrics.missingBestDays}`);
  if (metrics.missingCautionDays > 0) metrics.problems.push(`weekly missing caution days: ${metrics.missingCautionDays}`);
  if (metrics.deterministicMismatches > 0) {
    metrics.problems.push(`weekly deterministic replay mismatches: ${metrics.deterministicMismatches}`);
  }

  return metrics;
}

function extractWeeklyDayFromText(text, label) {
  const plain = stripMarkup(text);
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = plain.match(new RegExp(`${escapedLabel}:\\s*([^\\s—]+)`, "iu"));
  return match?.[1]?.trim().toLocaleLowerCase("ru-RU") ?? null;
}

function buildCompatibilityBatch() {
  const config = loadCompatibilityConfig();
  const problems = validateCompatibilityConfig(config);
  const posts = config.pairs.map((pair) => generateCompatibilityPost(pair));
  const safeOutcomeFraming = /не обещание|не определяет исход|реальная близость|не готовый сценарий/iu;
  const sameSignPairs = config.pairs.filter((pair) => pair.signA === pair.signB);
  const differentSignPairs = config.pairs.filter((pair) => pair.signA !== pair.signB);
  const canonicalKeys = config.pairs.map((pair) => [pair.signA, pair.signB].sort().join("+"));
  const consistency = {
    pairsChecked: config.pairs.length,
    canonicalPairs: new Set(canonicalKeys).size,
    reverseLookupsChecked: 0,
    duplicateMirroredPairs: config.pairs.length - new Set(canonicalKeys).size,
    titleOrderMismatches: 0,
    metadataOrderMismatches: 0,
    lowercaseFocusOpenings: 0,
    lowercasePracticeOpenings: 0,
  };

  if (posts.length !== 78) problems.push(`compatibility coverage must be 78, got ${posts.length}`);
  if (sameSignPairs.length !== 12) problems.push(`same-sign pair count must be 12, got ${sameSignPairs.length}`);
  if (differentSignPairs.length !== 66) problems.push(`different-sign pair count must be 66, got ${differentSignPairs.length}`);
  if (new Set(canonicalKeys).size !== 78) problems.push("mirrored compatibility duplicate detected");

  for (let index = 0; index < config.pairs.length; index += 1) {
    const pair = config.pairs[index];
    const post = posts[index];
    const signA = SIGNS.find((sign) => sign.slug === pair.signA);
    const signB = SIGNS.find((sign) => sign.slug === pair.signB);
    const expectedTitleRu = `${signA?.nameRu} + ${signB?.nameRu}`;
    const expectedTitle = `💞 Совместимость: ${expectedTitleRu}`;
    if (post.pairId !== pair.pairId) problems.push(`${pair.pairId}: generated pair id mismatch`);
    if (post.canonicalPairId !== pair.pairId || post.signA !== pair.signA || post.signB !== pair.signB) {
      consistency.metadataOrderMismatches += 1;
      problems.push(`${pair.pairId}: generated pair metadata order mismatch`);
    }
    if (pair.titleRu !== expectedTitleRu || post.title !== expectedTitle || !post.text.startsWith(expectedTitle)) {
      consistency.titleOrderMismatches += 1;
      problems.push(`${pair.pairId}: visible pair title order matches pair metadata order assertion failed`);
    }
    const focusOpening = getVisibleSectionOpening(post.text, "Фокус пары:");
    const practiceOpening = getVisibleSectionOpening(post.text, "Практика на сегодня:");
    if (!startsWithUppercaseLetter(focusOpening)) {
      consistency.lowercaseFocusOpenings += 1;
      problems.push(`${pair.pairId}: compatibility focus sentence starts uppercase assertion failed`);
    }
    if (!startsWithUppercaseLetter(practiceOpening)) {
      consistency.lowercasePracticeOpenings += 1;
      problems.push(`${pair.pairId}: compatibility practice sentence starts uppercase assertion failed`);
    }
    if (!safeOutcomeFraming.test(post.text)) {
      problems.push(`${pair.pairId}: missing non-deterministic outcome framing`);
    }
    const keyboardStatus = validateCompatibilityKeyboard(post);
    if (!keyboardStatus.ok) {
      problems.push(...keyboardStatus.errors.map((error) => `${pair.pairId}: ${error}`));
    }

    if (pair.signA !== pair.signB) {
      const reversePairId = `${pair.signB}-${pair.signA}`;
      const reversePair = findOrderedCompatibilityPair(reversePairId, config.pairs);
      const reversePost = generateCompatibilityPost(reversePair);
      const reverseTitleRu = `${signB?.nameRu} + ${signA?.nameRu}`;
      consistency.reverseLookupsChecked += 1;
      if (
        reversePair.pairId !== reversePairId
        || reversePair.canonicalPairId !== pair.pairId
        || reversePost.signA !== pair.signB
        || reversePost.signB !== pair.signA
      ) {
        consistency.metadataOrderMismatches += 1;
        problems.push(`${reversePairId}: reverse pair metadata order mismatch`);
      }
      if (reversePost.title !== `💞 Совместимость: ${reverseTitleRu}` || !reversePost.text.startsWith(`💞 Совместимость: ${reverseTitleRu}`)) {
        consistency.titleOrderMismatches += 1;
        problems.push(`${reversePairId}: reverse visible pair title order matches pair metadata order assertion failed`);
      }
    }
  }

  const messages = posts.map((post) => ({
    id: `compatibility:${post.pairId}`,
    kind: "compatibility",
    language: post.language || "ru",
    parseMode: post.parseMode || "HTML",
    text: post.text,
    requiredLabels: COMPATIBILITY_LABELS,
    requiredSnippets: [APPROVED_CTA_URL],
    accuracyProblems: [],
  }));

  const reviewSamples = REVIEW_COMPATIBILITY_IDS.map((pairId) =>
    generateCompatibilityPost(findOrderedCompatibilityPair(pairId, config.pairs)));

  return {
    config,
    posts,
    messages,
    sameSignPairs: sameSignPairs.length,
    differentSignPairs: differentSignPairs.length,
    consistency,
    reviewSamples,
    problems,
  };
}

function getVisibleSectionOpening(text, label) {
  const lines = stripMarkup(text)
    .split(/\r?\n/)
    .map((line) => line.trim());
  const labelIndex = lines.findIndex((line) => line === label);
  if (labelIndex < 0) return "";
  return lines.slice(labelIndex + 1).find(Boolean) ?? "";
}

function startsWithUppercaseLetter(value) {
  const firstLetter = String(value || "").match(/\p{L}/u)?.[0] ?? "";
  return Boolean(firstLetter) && firstLetter === firstLetter.toLocaleUpperCase("ru-RU");
}

function buildTarotMessage(card, date) {
  const keyword = Array.isArray(card.keywords) && card.keywords.length > 0 ? card.keywords[0] : "внутренняя опора";
  return [
    `🃏 Карта дня — ${card.ruTitle}`,
    "",
    "Ключ:",
    card.dayMeaning,
    "",
    "В любви:",
    card.loveMeaning,
    "",
    "Совет:",
    card.advice,
    "",
    "Вопрос к себе:",
    `Как тема «${keyword}» может проявиться ${formatRuDate(date)} без давления на результат?`,
    "",
    "Действие дня:",
    card.action,
    "",
    "Это символическая подсказка для размышления, а не точное предсказание.",
    "",
    `Открыть карту дня в Mini App: ${APPROVED_CTA_URL}`,
  ].join("\n");
}

function buildTarotBatch(date) {
  const cardsPath = path.join(process.cwd(), "data", "config", "tarot-major-arcana.json");
  const cards = JSON.parse(fs.readFileSync(cardsPath, "utf8"));
  const problems = [];
  const ids = new Set();
  const slugs = new Set();
  const numbers = new Set();
  const imagePaths = new Set();

  if (cards.length !== 22) problems.push(`Tarot coverage must be 22, got ${cards.length}`);
  for (const card of cards) {
    const fields = ["id", "number", "slug", "ruTitle", "enTitle", "keywords", "dayMeaning", "loveMeaning", "advice", "action", "imagePath"];
    for (const field of fields) {
      if (!Object.prototype.hasOwnProperty.call(card, field) || card[field] === null || card[field] === "") {
        problems.push(`tarot:${card.slug || card.id || "unknown"}: missing ${field}`);
      }
    }
    if (ids.has(card.id)) problems.push(`tarot duplicate id: ${card.id}`);
    if (slugs.has(card.slug)) problems.push(`tarot duplicate slug: ${card.slug}`);
    if (numbers.has(card.number)) problems.push(`tarot duplicate number: ${card.number}`);
    if (imagePaths.has(card.imagePath)) problems.push(`tarot duplicate image path: ${card.imagePath}`);
    ids.add(card.id);
    slugs.add(card.slug);
    numbers.add(card.number);
    imagePaths.add(card.imagePath);
    if (!/^\/assets\/tarot\/major-\d{2}-[a-z0-9-]+\.webp$/u.test(card.imagePath)) {
      problems.push(`tarot:${card.slug}: invalid imagePath`);
    }
  }

  const samples = cards.map((card) => ({
    id: `tarot:${card.slug}`,
    card,
    text: buildTarotMessage(card, date),
  }));
  const messages = samples.map((sample) => ({
    id: sample.id,
    kind: "tarot",
    language: "ru",
    parseMode: "HTML",
    text: sample.text,
    requiredLabels: TAROT_LABELS,
    requiredSnippets: [APPROVED_CTA_URL, sample.card.ruTitle],
    accuracyProblems: [],
  }));
  const reviewSamples = REVIEW_TAROT_SLUGS
    .map((slug) => samples.find((sample) => sample.card.slug === slug))
    .filter(Boolean);

  return { cards, samples, messages, reviewSamples, problems };
}

function buildUkrainianReviewFixtures(date, weekRange) {
  const dateLabel = new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(parseDateKey(date));

  return [
    {
      id: "ua-daily:aries",
      kind: "daily-localization-fixture",
      language: "uk",
      parseMode: "HTML",
      requiredLabels: ["Головна енергія дня:", "У стосунках:", "У справах і фінансах:", "Практична порада:"],
      requiredSnippets: [APPROVED_CTA_URL, dateLabel],
      text: `<b>♈ Овен — ${dateLabel}</b>

<b>Головна енергія дня:</b>
Темп може зрости, але найкращий результат дасть не поспіх, а один чіткий крок. Залиште простір для перевірки фактів і не перетворюйте затримку на боротьбу.

<b>У стосунках:</b>
Говоріть прямо, проте без тиску. Теплий контакт сьогодні тримається на вмінні почути відповідь, а не лише швидко висловити власну позицію.

<b>У справах і фінансах:</b>
Зосередьтеся на завданні, яке можна завершити до кінця дня. Фінансові рішення краще приймати після короткої перевірки цифр.

<b>Практична порада:</b>
Оберіть одну дію, що зменшить хаос і поверне відчуття керованого руху.

<i>Це символічний орієнтир, а не обіцянка подій.</i>

<b>Відкрити особистий огляд у Mini App:</b> ${APPROVED_CTA_URL}`,
    },
    {
      id: "ua-daily:libra",
      kind: "daily-localization-fixture",
      language: "uk",
      parseMode: "HTML",
      requiredLabels: ["Головна енергія дня:", "У стосунках:", "У справах і фінансах:", "Практична порада:"],
      requiredSnippets: [APPROVED_CTA_URL, dateLabel],
      text: `<b>♎ Терези — ${dateLabel}</b>

<b>Головна енергія дня:</b>
День допомагає помітити, де компроміс підтримує рівновагу, а де лише відкладає важливу розмову. Не поспішайте відповідати, поки не стане зрозумілою справжня потреба.

<b>У стосунках:</b>
М'яка чесність корисніша за мовчазне очікування. Назвіть те, що для вас важливо, і залиште іншій людині час на власну відповідь.

<b>У справах і фінансах:</b>
Перевірте домовленості, строки та межі відповідальності. Краще уточнити деталь зараз, ніж виправляти непорозуміння пізніше.

<b>Практична порада:</b>
Завершіть одну розмову конкретною домовленістю, зручною для обох сторін.

<i>Це символічний орієнтир, а не обіцянка подій.</i>

<b>Відкрити особистий огляд у Mini App:</b> ${APPROVED_CTA_URL}`,
    },
    {
      id: "ua-weekly:taurus",
      kind: "weekly-localization-fixture",
      language: "uk",
      parseMode: "HTML",
      requiredLabels: ["Початок тижня:", "Стосунки:", "Справи й фінанси:", "Головна порада:"],
      requiredSnippets: [APPROVED_CTA_URL, weekRange],
      text: `<b>♉ Телець — прогноз на тиждень ${weekRange}</b>

<b>Початок тижня:</b>
Спочатку корисно впорядкувати зобов'язання й не додавати нових справ, доки не стане зрозумілим реальний запас часу.

<b>Середина тижня:</b>
Практичний підхід дасть більше спокою. Перевіряйте деталі, але не затримуйте рішення через бажання досягти ідеального результату.

<b>Стосунки:</b>
Надійність проявляється в послідовних діях. Домовтеся про темп і не сприймайте потребу в паузі як віддалення.

<b>Справи й фінанси:</b>
Плануйте витрати за пріоритетами та залиште невеликий резерв. У роботі варто завершити те, що вже майже готове.

<b>Головна порада:</b>
Збережіть стійкість, але дозвольте плану змінитися після нової інформації.

<i>Це м'яка астрологічна інтерпретація, а не готовий сценарій.</i>

<b>Особистий прогноз у Mini App:</b> ${APPROVED_CTA_URL}`,
    },
    {
      id: "ua-weekly:aquarius",
      kind: "weekly-localization-fixture",
      language: "uk",
      parseMode: "HTML",
      requiredLabels: ["Початок тижня:", "Стосунки:", "Справи й фінанси:", "Головна порада:"],
      requiredSnippets: [APPROVED_CTA_URL, weekRange],
      text: `<b>♒ Водолій — прогноз на тиждень ${weekRange}</b>

<b>Початок тижня:</b>
Нові ідеї потребують простої перевірки: що можна зробити вже зараз, а що поки залишається красивою гіпотезою.

<b>Середина тижня:</b>
Спілкування пожвавиться, якщо пояснювати задум коротко й конкретно. Не намагайтеся переконати всіх одночасно.

<b>Стосунки:</b>
Свобода й близькість не суперечать одна одній, коли межі проговорені спокійно. Залишайте місце для відмінностей без холодної дистанції.

<b>Справи й фінанси:</b>
Порівняйте два практичні варіанти та оберіть той, який легше підтримувати протягом тижня.

<b>Головна порада:</b>
Перетворіть одну нестандартну думку на маленький зрозумілий експеримент.

<i>Це м'яка астрологічна інтерпретація, а не готовий сценарій.</i>

<b>Особистий прогноз у Mini App:</b> ${APPROVED_CTA_URL}`,
    },
  ].map((fixture) => ({ ...fixture, accuracyProblems: [] }));
}

function inspectDateAccuracy(primaryDate) {
  const fixtureDates = [
    primaryDate,
    "2026-07-31",
    "2026-12-31",
    "2026-03-29",
    "2028-02-29",
  ];
  const problems = [];
  const details = [];

  for (const date of fixtureDates) {
    const batch = buildDailyBatch(date);
    const weekCode = isoWeekCode(date);
    const weekly = buildWeeklyBatch(weekCode);
    details.push({
      date,
      week: weekCode,
      dailyCount: batch.posts.length,
      weeklyCount: weekly.plan.posts.length,
      weeklyStart: weekly.plan.startDate,
      weeklyEnd: weekly.plan.endDate,
    });
    problems.push(...batch.problems.map((problem) => `${date}: ${problem}`));
    problems.push(...weekly.problems.map((problem) => `${weekCode}: ${problem}`));
  }

  return {
    timezone: KYIV_TIMEZONE,
    fixtures: details,
    monthEnd: true,
    yearEnd: true,
    dstTransition: true,
    leapDay: true,
    problems,
  };
}

function inspectDeterminism(date, week, compatibility, tarot) {
  const dailyA = buildDailyBatch(date).posts.map(selectStableDailyFields);
  const dailyB = buildDailyBatch(date).posts.map(selectStableDailyFields);
  const weeklyA = buildWeeklyBatch(week).plan.posts.map(selectStableWeeklyFields);
  const weeklyB = buildWeeklyBatch(week).plan.posts.map(selectStableWeeklyFields);
  const compatibilityA = compatibility.config.pairs.map((pair) => generateCompatibilityPost(pair)).map(selectStableCompatibilityFields);
  const compatibilityB = compatibility.config.pairs.map((pair) => generateCompatibilityPost(pair)).map(selectStableCompatibilityFields);
  const tarotA = tarot.samples.map((sample) => ({ id: sample.id, text: sample.text }));
  const tarotB = buildTarotBatch(date).samples.map((sample) => ({ id: sample.id, text: sample.text }));
  const nextDate = addDays(date, 1);
  const crossDate = buildDailyBatch(nextDate).posts.map(selectStableDailyFields);
  const sameInputHashes = {
    dailyA: hashValue(JSON.stringify(dailyA)),
    dailyB: hashValue(JSON.stringify(dailyB)),
    weeklyA: hashValue(JSON.stringify(weeklyA)),
    weeklyB: hashValue(JSON.stringify(weeklyB)),
    compatibilityA: hashValue(JSON.stringify(compatibilityA)),
    compatibilityB: hashValue(JSON.stringify(compatibilityB)),
    tarotA: hashValue(JSON.stringify(tarotA)),
    tarotB: hashValue(JSON.stringify(tarotB)),
  };
  const sameInputReproducible = sameInputHashes.dailyA === sameInputHashes.dailyB
    && sameInputHashes.weeklyA === sameInputHashes.weeklyB
    && sameInputHashes.compatibilityA === sameInputHashes.compatibilityB
    && sameInputHashes.tarotA === sameInputHashes.tarotB;
  const orderingStable = dailyA.map((post) => post.channelId).join("|") === dailyB.map((post) => post.channelId).join("|")
    && weeklyA.map((post) => post.slug).join("|") === weeklyB.map((post) => post.slug).join("|");
  const changedAcrossDates = dailyA.filter((post, index) => post.text !== crossDate[index]?.text).length;
  const crossDateVariation = changedAcrossDates === dailyA.length;
  const problems = [];
  if (!sameInputReproducible) problems.push("same-input deterministic replay mismatch");
  if (!orderingStable) problems.push("deterministic ordering mismatch");
  if (!crossDateVariation) problems.push(`cross-date variation incomplete: ${changedAcrossDates}/${dailyA.length}`);

  return {
    sameInputReproducible,
    orderingStable,
    metadataStable: sameInputReproducible,
    crossDateVariation,
    changedAcrossDates,
    comparedPosts: dailyA.length,
    nextDate,
    hashes: sameInputHashes,
    nondeterministicFields: ["QA report generatedAt", "timestamped report filename"],
    problems,
  };
}

function selectStableDailyFields(post) {
  return {
    id: post.id,
    date: post.date,
    channelId: post.channelId,
    text: post.text,
    qualityScore: post.qualityScore,
    language: post.language,
  };
}

function selectStableWeeklyFields(post) {
  return {
    slug: post.slug,
    week: post.week,
    text: post.text,
    bestDay: post.bestDay,
    cautionDay: post.cautionDay,
    language: post.language,
    keyboard: post.keyboard,
  };
}

function selectStableCompatibilityFields(post) {
  return {
    pairId: post.pairId,
    canonicalPairId: post.canonicalPairId,
    signA: post.signA,
    signB: post.signB,
    titleRu: post.titleRu,
    title: post.title,
    text: post.text,
    score: post.score,
    language: post.language,
  };
}

function evaluateMessage(message, duplicateIds, deterministicReplay) {
  const plain = stripMarkup(message.text);
  const missingLabels = (message.requiredLabels || []).filter((label) => !plain.includes(label));
  const missingSnippets = (message.requiredSnippets || []).filter((snippet) => !plain.includes(snippet));
  const language = inspectLanguage(message.text, message.language);
  const safety = inspectSafety(message.text);
  const payload = inspectPayload(message);
  const repeatedOpenings = repeatedOpeningsWithinMessage(message.text);
  const accuracyProblems = message.accuracyProblems || [];
  const duplicate = duplicateIds.has(message.id);

  const categories = {
    coverage: 10,
    accuracy: clampScore(10 - accuracyProblems.length * 2 - missingSnippets.length * 1.5),
    language: clampScore(10 - language.contaminationCount * 2 - (language.brokenUnicode ? 5 : 0)),
    structure: clampScore(9.6 - missingLabels.length * 1.2),
    uniqueness: clampScore(9.4 - repeatedOpenings.length * 1.2 - (duplicate ? 4 : 0)),
    safety: clampScore(10 - safety.total * 2.5),
    cta: payload.urls.includes(APPROVED_CTA_URL) ? 10 : 4,
    formatting: clampScore(9.6 - (language.unresolvedPlaceholders ? 5 : 0) - inspectHtml(message.text).length * 2),
    telegramPayload: payload.errors.length === 0 ? 10 : clampScore(10 - payload.errors.length * 2),
    deterministicBehavior: deterministicReplay ? 10 : 4,
  };
  const score = average(Object.values(categories));
  const problems = [
    ...accuracyProblems,
    ...missingLabels.map((label) => `missing structure label: ${label}`),
    ...missingSnippets.map((snippet) => `missing required snippet: ${snippet}`),
    ...payload.errors,
    ...repeatedOpenings.map((opening) => `repeated sentence opening: ${opening}`),
  ];
  if (language.contaminationCount > 0) problems.push("cross-language contamination detected");
  if (language.brokenUnicode) problems.push("broken Unicode/mojibake detected");
  if (language.unresolvedPlaceholders) problems.push("unresolved placeholder detected");
  if (safety.total > 0) problems.push("unsafe deterministic or coercive claim detected");
  if (duplicate) problems.push("duplicate full message detected");

  return {
    id: message.id,
    kind: message.kind,
    language: message.language,
    score,
    categories,
    ok: problems.length === 0 && score >= 8.5,
    problems,
  };
}

function inspectUniqueness(groups) {
  const allItems = groups.flatMap((group) => group.items);
  const exactPairs = groups.flatMap((group) =>
    duplicatePairs(group.items, (text) => String(text || "").trim()).map((pair) => ({ group: group.name, pair })));
  const normalizedPairs = groups.flatMap((group) =>
    duplicatePairs(group.items, normalizeForDuplicate).map((pair) => ({ group: group.name, pair })));
  const repeatedOpenings = groups.reduce((sum, group) =>
    sum + repeatedBoundaryCount(group.items, (sentences) => sentenceOpening(sentences[0])), 0);
  const repeatedClosings = groups.reduce((sum, group) =>
    sum + repeatedBoundaryCount(group.items, (sentences) => sentenceClosing(sentences.at(-1))), 0);
  const repeatedSentences = repeatedSentenceMetrics(allItems);
  const trigrams = ngramMetrics(allItems, 3);
  const fourgrams = ngramMetrics(allItems, 4);
  const repeatedWithinPosts = allItems.reduce((sum, item) => sum + repeatedOpeningsWithinMessage(item.text).length, 0);

  return {
    exactDuplicates: exactPairs.length,
    normalizedDuplicates: normalizedPairs.length,
    exactPairs,
    normalizedPairs,
    repeatedOpenings,
    repeatedClosings,
    repeatedOpeningsWithinPosts: repeatedWithinPosts,
    repeatedSentenceRatio: repeatedSentences.ratio,
    repeatedSentenceOccurrences: repeatedSentences.repeatedOccurrences,
    sentenceCount: repeatedSentences.sentences,
    trigram: trigrams,
    fourgram: fourgrams,
  };
}

function inspectLedgers() {
  const files = [
    "data/state/zodiac-publish-ledger.json",
    "data/state/zodiac-weekly-publish-ledger.json",
    "data/state/zodiac-compatibility-publish-ledger.json",
  ];
  return files.map((file) => {
    const absolute = path.join(process.cwd(), file);
    if (!fs.existsSync(absolute)) {
      return { file, ok: true, entries: 0, duplicateKeys: 0, warning: "ledger file missing; read-only check treated it as empty" };
    }
    const parsed = JSON.parse(fs.readFileSync(absolute, "utf8"));
    const entries = parsed.entries && typeof parsed.entries === "object" ? parsed.entries : {};
    const keys = Object.keys(entries);
    return {
      file,
      ok: keys.length === new Set(keys).size,
      entries: keys.length,
      duplicateKeys: keys.length - new Set(keys).size,
    };
  });
}

function writeRuntimeSamples(reportRoot, batches, languageFixtures) {
  const sampleDir = path.join(reportRoot, "samples");
  fs.mkdirSync(sampleDir, { recursive: true });
  const write = (name, content) => fs.writeFileSync(path.join(sampleDir, name), `${content.trim()}\n`, "utf8");

  write(
    "daily-12-signs.md",
    batches.daily.signPosts.map((post) => `## ${post.channelName}\n\n${post.text}`).join("\n\n---\n\n"),
  );
  write("general-channel-sample.md", `## ${batches.daily.general.channelName}\n\n${batches.daily.general.text}`);
  write(
    "weekly-13-targets.md",
    batches.weekly.plan.posts.map((post) => `## ${post.slug}\n\n${post.text}`).join("\n\n---\n\n"),
  );
  write(
    "compatibility-review-samples.md",
    batches.compatibility.reviewSamples.map((post) => `## ${post.pairId}\n\n${post.text}`).join("\n\n---\n\n"),
  );
  write(
    "tarot-review-samples.md",
    batches.tarot.reviewSamples.map((sample) => `## ${sample.card.ruTitle}\n\n${sample.text}`).join("\n\n---\n\n"),
  );
  write(
    "ukrainian-localization-fixtures.md",
    languageFixtures.map((fixture) => `## ${fixture.id}\n\n${fixture.text}`).join("\n\n---\n\n"),
  );

  return sampleDir;
}

function renderReviewPack(report, batches, languageFixtures) {
  const dailyRu = ["scorpio", "pisces"]
    .map((slug) => batches.daily.posts.find((post) => post.channelId === slug))
    .filter(Boolean)
    .map((post) => ({ title: `RU Daily — ${post.channelName}`, text: post.text }));
  const dailyUa = languageFixtures
    .filter((fixture) => fixture.kind === "daily-localization-fixture")
    .map((fixture) => ({ title: `UA Daily fixture — ${fixture.id.split(":")[1]}`, text: fixture.text }));
  const weeklyRu = ["aries", "scorpio", "taurus", "pisces"]
    .map((slug) => batches.weekly.plan.posts.find((post) => post.slug === slug))
    .filter(Boolean)
    .map((post) => ({
      title: `RU Weekly — ${post.slug} (${post.bestDay} / ${post.cautionDay})`,
      text: post.text,
    }));
  const weeklyUa = languageFixtures
    .filter((fixture) => fixture.kind === "weekly-localization-fixture")
    .map((fixture) => ({ title: `UA Weekly fixture — ${fixture.id.split(":")[1]}`, text: fixture.text }));

  const sampleBlock = (sample) => `### ${sample.title}\n\n${stripMarkup(sample.text)}`;
  const compatibilitySamples = batches.compatibility.reviewSamples.map((post) => ({
    title: `Compatibility — ${post.title.replace(/^💞\s*/u, "")}`,
    text: post.text,
  }));
  const tarotSamples = batches.tarot.reviewSamples.map((sample) => ({
    title: `Tarot — ${sample.card.ruTitle}`,
    text: sample.text,
  }));
  const targetRows = report.targetConfiguration.targets
    .map((target) => `| ${target.slug} | ${target.name} | ${target.language.toUpperCase()} | ${target.category} | ${target.enabled ? "Yes" : "No"} |`)
    .join("\n");

  return `# Package 370B.3 — Content Review Pack

## Кратко

Пакет проверяет полный локальный dry-run ежедневного, недельного, compatibility и Tarot-контента без Telegram API и без production writes. Текущая 13-канальная zodiac-сеть фактически русскоязычная; украинские блоки ниже являются отдельными локальными QA fixtures и не меняют язык production targets.

## Content Types

- Daily: ${report.coverage.daily}/13
- Weekly: ${report.coverage.weekly}/13
- Compatibility: ${report.coverage.compatibilityPairs}/78
- Tarot: ${report.coverage.tarotCards}/22

## Target Coverage

| Slug | Name | Language | Category | Enabled |
|---|---|---:|---|---:|
${targetRows}

## Quality Metrics

- Average score: ${report.quality.average}/10
- Minimum score: ${report.quality.minimum}/10
- Exact duplicates: ${report.uniqueness.exactDuplicates}
- Normalized full-post duplicates: ${report.uniqueness.normalizedDuplicates}
- Repeated sentence ratio: ${report.uniqueness.repeatedSentenceRatio}
- Cross-language contamination: ${report.language.crossLanguageContamination}
- Broken Unicode: ${report.language.brokenUnicode}
- Unsafe claims: ${report.safety.total}
- Malformed payloads: ${report.telegramPayload.malformed}
- Payload range: ${report.telegramPayload.minimumLength}–${report.telegramPayload.maximumLength} characters
- Same-input deterministic replay: ${report.determinism.sameInputReproducible ? "PASS" : "FAIL"}
- Cross-date variation: ${report.determinism.crossDateVariation ? "PASS" : "FAIL"}

## Regression Summary

- Weekly weeks checked: ${report.weeklyRegression.weeksChecked}
- Weekly targets checked: ${report.weeklyRegression.targetsChecked}
- Weekly combinations checked: ${report.weeklyRegression.combinationsChecked}
- ISO week 53 included: ${report.weeklyRegression.isoWeek53Included ? "Yes" : "No"}
- Best/caution collisions: ${report.weeklyRegression.collisions}
- Invalid day labels: ${report.weeklyRegression.invalidDayLabels}
- Missing best days: ${report.weeklyRegression.missingBestDays}
- Missing caution days: ${report.weeklyRegression.missingCautionDays}
- Deterministic replay mismatches: ${report.weeklyRegression.deterministicMismatches}
- Weekly Scorpio (${report.weeklyRegression.scorpioReviewWeek}) best day: ${report.weeklyRegression.scorpioBestDay}
- Weekly Scorpio (${report.weeklyRegression.scorpioReviewWeek}) caution day: ${report.weeklyRegression.scorpioCautionDay}
- Compatibility pairs checked: ${report.compatibilityConsistency.pairsChecked}
- Compatibility canonical pairs: ${report.compatibilityConsistency.canonicalPairs}
- Compatibility reverse lookups checked: ${report.compatibilityConsistency.reverseLookupsChecked}
- Compatibility duplicate mirrored pairs: ${report.compatibilityConsistency.duplicateMirroredPairs}
- Compatibility title/order mismatches: ${report.compatibilityConsistency.titleOrderMismatches}
- Compatibility metadata/order mismatches: ${report.compatibilityConsistency.metadataOrderMismatches}
- Lowercase focus openings: ${report.compatibilityConsistency.lowercaseFocusOpenings}
- Lowercase practice openings: ${report.compatibilityConsistency.lowercasePracticeOpenings}

## Daily Samples

${[...dailyRu, ...dailyUa].map(sampleBlock).join("\n\n---\n\n")}

## Weekly Samples

${[...weeklyRu, ...weeklyUa].map(sampleBlock).join("\n\n---\n\n")}

## Compatibility Samples

${compatibilitySamples.map(sampleBlock).join("\n\n---\n\n")}

## Tarot Samples

${tarotSamples.map(sampleBlock).join("\n\n---\n\n")}

## Исправленные дефекты

1. Лучший день и день осторожности теперь выбираются одним детерминированным helper с обязательным различием.
2. Weekly regression проверяет 54 последовательные ISO-недели, включая 2020-W53 и переход года.
3. Visible compatibility title, pair metadata и запрошенный порядок знаков используют единый контракт.
4. Начала блоков «Фокус пары» и «Практика на сегодня» проверяются на заглавную букву во всех 78 canonical outputs.
5. Все 22 Tarot cards по-прежнему участвуют в text, safety и payload QA.

## Неблокирующие ограничения

- Production zodiac targets сейчас настроены только на русский язык: RU 13, UA 0.
- UA samples являются review fixtures, а не привязкой к Telegram channels.
- Автоматические language metrics не заменяют редактора-носителя языка.
- Weekly и compatibility используют общие редакционные phrase banks; measured repeated sentence ratio: ${report.uniqueness.repeatedSentenceRatio}. Полных exact/normalized дубликатов при этом нет.
- Реальная Telegram-публикация и production ledger не проверялись и не запускались.

## Вердикт

${report.ok ? "PASS — готово к Owner Content Review без публикации." : "BLOCKED — см. problems в safe metrics JSON."}
`;
}

function main() {
  const options = parseArgs();
  const targetConfiguration = inspectTargetConfiguration();
  const daily = buildDailyBatch(options.date);
  const weekly = buildWeeklyBatch(options.week);
  const weeklyRegression = inspectWeeklyDayRegression();
  const compatibility = buildCompatibilityBatch();
  const tarot = buildTarotBatch(options.date);
  const languageFixtures = buildUkrainianReviewFixtures(options.date, weekly.plan.weekRange);
  const dateAccuracy = inspectDateAccuracy(options.date);
  const determinism = inspectDeterminism(options.date, options.week, compatibility, tarot);

  const productionGroups = [
    { name: "daily", items: daily.messages },
    { name: "weekly", items: weekly.messages },
    { name: "compatibility", items: compatibility.messages },
    { name: "tarot", items: tarot.messages },
  ];
  const productionMessages = productionGroups.flatMap((group) => group.items);
  const allValidatedMessages = [...productionMessages, ...languageFixtures];
  const uniqueness = inspectUniqueness(productionGroups);
  const duplicateIds = new Set([
    ...uniqueness.exactPairs.flatMap((entry) => entry.pair),
    ...uniqueness.normalizedPairs.flatMap((entry) => entry.pair),
  ]);
  const scores = allValidatedMessages.map((message) =>
    evaluateMessage(message, duplicateIds, determinism.sameInputReproducible));
  const payloads = allValidatedMessages.map(inspectPayload);
  const languageChecks = allValidatedMessages.map((message) => ({
    id: message.id,
    ...inspectLanguage(message.text, message.language),
  }));
  const safetyChecks = allValidatedMessages.map((message) => ({
    id: message.id,
    ...inspectSafety(message.text),
  }));
  const ledgerFindings = inspectLedgers();

  const safety = {
    deterministicPredictions: safetyChecks.reduce((sum, item) => sum + item.categories.deterministicPredictions, 0),
    medicalDirectives: safetyChecks.reduce((sum, item) => sum + item.categories.medicalDirectives, 0),
    guaranteedFinancialClaims: safetyChecks.reduce((sum, item) => sum + item.categories.guaranteedFinancialClaims, 0),
    relationshipCoercion: safetyChecks.reduce((sum, item) => sum + item.categories.relationshipCoercion, 0),
    fearBasedCta: safetyChecks.reduce((sum, item) => sum + item.categories.fearBasedCta, 0),
  };
  safety.total = Object.values(safety).reduce((sum, value) => sum + value, 0);

  const language = {
    ruMessages: languageChecks.filter((item) => item.expectedLanguage === "ru").length,
    uaFixtures: languageChecks.filter((item) => item.expectedLanguage === "uk").length,
    crossLanguageContamination: languageChecks.reduce((sum, item) => sum + item.contaminationCount, 0),
    brokenUnicode: languageChecks.filter((item) => item.brokenUnicode).length,
    unresolvedPlaceholders: languageChecks.filter((item) => item.unresolvedPlaceholders).length,
    averagePurity: average(languageChecks.map((item) => item.purity)),
  };

  const telegramPayload = {
    parseModes: [...new Set(payloads.map((payload) => payload.parseMode))],
    messagesValidated: payloads.length,
    productionMessages: productionMessages.length,
    localizationFixtures: languageFixtures.length,
    minimumLength: Math.min(...payloads.map((payload) => payload.length)),
    maximumLength: Math.max(...payloads.map((payload) => payload.length)),
    overLimit: payloads.filter((payload) => payload.length >= TELEGRAM_HARD_LIMIT).length,
    overSafeLimit: payloads.filter((payload) => payload.length > TELEGRAM_SAFE_LIMIT).length,
    malformed: payloads.filter((payload) => payload.errors.length > 0).length,
    malformedMarkup: payloads.filter((payload) => payload.errors.some((error) => /HTML tag/iu.test(error))).length,
    escapingFailures: payloads.filter((payload) => payload.errors.some((error) => /HTML|URL/iu.test(error))).length,
    controlCharacters: payloads.filter((payload) => payload.errors.some((error) => /control character/iu.test(error))).length,
    externalLinks: [...new Set(payloads.flatMap((payload) => payload.urls))],
  };

  const quality = {
    average: average(scores.map((score) => score.score)),
    minimum: Math.min(...scores.map((score) => score.score)),
    criticalFailures: scores.filter((score) => !score.ok).length,
    previousRecordedScore: PREVIOUS_RECORDED_SCORE,
    scores,
  };

  const problems = [
    ...targetConfiguration.problems,
    ...daily.problems,
    ...weekly.problems,
    ...weeklyRegression.problems,
    ...compatibility.problems,
    ...tarot.problems,
    ...dateAccuracy.problems,
    ...determinism.problems,
    ...scores.filter((score) => !score.ok).flatMap((score) => score.problems.map((problem) => `${score.id}: ${problem}`)),
    ...ledgerFindings.filter((finding) => !finding.ok).map((finding) => `${finding.file}: duplicate ledger keys`),
  ];

  if (uniqueness.exactDuplicates > 0) problems.push(`exact duplicate posts: ${uniqueness.exactDuplicates}`);
  if (uniqueness.normalizedDuplicates > 0) problems.push(`normalized duplicate posts: ${uniqueness.normalizedDuplicates}`);
  if (uniqueness.repeatedOpeningsWithinPosts > 0) problems.push(`repeated sentence openings inside posts: ${uniqueness.repeatedOpeningsWithinPosts}`);
  if (language.crossLanguageContamination > 0) problems.push(`cross-language contamination: ${language.crossLanguageContamination}`);
  if (language.brokenUnicode > 0) problems.push(`broken Unicode outputs: ${language.brokenUnicode}`);
  if (language.unresolvedPlaceholders > 0) problems.push(`unresolved placeholders: ${language.unresolvedPlaceholders}`);
  if (safety.total > 0) problems.push(`unsafe claims: ${safety.total}`);
  if (telegramPayload.overLimit > 0) problems.push(`over-limit Telegram payloads: ${telegramPayload.overLimit}`);
  if (telegramPayload.malformed > 0) problems.push(`malformed Telegram payloads: ${telegramPayload.malformed}`);
  if (quality.average < 9) problems.push(`average quality score below 9.0: ${quality.average}`);
  if (quality.minimum < 8.5) problems.push(`minimum quality score below 8.5: ${quality.minimum}`);

  const warnings = [
    "Current configured zodiac network is RU-only (13 RU targets, 0 UA targets). UA language review uses explicit local-only fixtures.",
    "Automated language heuristics do not replace native-speaker editorial review.",
  ];
  if (uniqueness.repeatedSentenceRatio > 0.25) {
    warnings.push(`Template sentence repetition is elevated: ${uniqueness.repeatedSentenceRatio}`);
  }

  const report = {
    ok: problems.length === 0,
    date: options.date,
    week: options.week,
    generatedAt: new Date().toISOString(),
    targetConfiguration,
    coverage: {
      daily: daily.posts.length,
      weekly: weekly.plan.posts.length,
      zodiacSigns: daily.signPosts.length,
      compatibilityPairs: compatibility.posts.length,
      sameSignPairs: compatibility.sameSignPairs,
      differentSignPairs: compatibility.differentSignPairs,
      tarotCards: tarot.cards.length,
      emptyOutputs: productionMessages.filter((message) => !message.text.trim()).length,
      missingOutputs: 0,
    },
    accuracy: dateAccuracy,
    language,
    uniqueness,
    safety,
    telegramPayload,
    determinism,
    weeklyRegression,
    compatibilityConsistency: compatibility.consistency,
    quality,
    ledgerFindings,
    sideEffects: {
      liveTelegramSends: 0,
      telegramApiCalls: 0,
      productionWrites: 0,
      productionLedgerWrites: 0,
      publishingWorkflowRuns: 0,
      workflowDispatches: 0,
      networkContentUploads: 0,
    },
    warnings,
    problems,
  };

  fs.mkdirSync(options.reportRoot, { recursive: true });
  const samplesDir = writeRuntimeSamples(options.reportRoot, { daily, weekly, compatibility, tarot }, languageFixtures);
  report.samplesDir = samplesDir;
  const reportPath = path.join(options.reportRoot, `report-${Date.now()}.json`);
  const latestPath = path.join(options.reportRoot, "latest-report.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(latestPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  let reviewPackPath = null;
  let reviewMetricsPath = null;
  if (options.reviewRoot) {
    fs.mkdirSync(options.reviewRoot, { recursive: true });
    reviewPackPath = path.join(options.reviewRoot, "content-review-pack.md");
    reviewMetricsPath = path.join(options.reviewRoot, "content-quality-metrics.json");
    fs.writeFileSync(reviewPackPath, renderReviewPack(report, { daily, weekly, compatibility, tarot }, languageFixtures), "utf8");
    fs.writeFileSync(reviewMetricsPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }

  console.log("Zodiac content quality certification");
  console.log(`Date                    : ${report.date}`);
  console.log(`Week                    : ${report.week}`);
  console.log(`Configured targets      : ${targetConfiguration.configured}/13`);
  console.log(`Daily / weekly          : ${report.coverage.daily}/13 / ${report.coverage.weekly}/13`);
  console.log(`Compatibility / Tarot   : ${report.coverage.compatibilityPairs}/78 / ${report.coverage.tarotCards}/22`);
  console.log(`RU targets / UA targets : ${targetConfiguration.ruTargets} / ${targetConfiguration.uaTargets}`);
  console.log(`UA review fixtures      : ${language.uaFixtures}`);
  console.log(`Average / minimum score : ${quality.average}/10 / ${quality.minimum}/10`);
  console.log(`Exact / normalized dupes: ${uniqueness.exactDuplicates} / ${uniqueness.normalizedDuplicates}`);
  console.log(`Unsafe claims           : ${safety.total}`);
  console.log(`Malformed payloads      : ${telegramPayload.malformed}`);
  console.log(`Payload range           : ${telegramPayload.minimumLength}-${telegramPayload.maximumLength}`);
  console.log(`Weekly matrix           : ${weeklyRegression.combinationsChecked} combinations / ${weeklyRegression.collisions} collisions`);
  console.log(`Compatibility order     : ${compatibility.consistency.pairsChecked} pairs / ${compatibility.consistency.titleOrderMismatches} title mismatches`);
  console.log(`Compatibility case      : ${compatibility.consistency.lowercaseFocusOpenings} focus / ${compatibility.consistency.lowercasePracticeOpenings} practice failures`);
  console.log(`Deterministic replay    : ${determinism.sameInputReproducible ? "PASS" : "FAIL"}`);
  console.log(`Cross-date variation    : ${determinism.crossDateVariation ? "PASS" : "FAIL"}`);
  console.log(`JSON report             : ${reportPath}`);
  if (reviewPackPath) console.log(`Content Review Pack     : ${reviewPackPath}`);
  if (reviewMetricsPath) console.log(`Safe metrics JSON       : ${reviewMetricsPath}`);
  console.log("Telegram API calls      : 0");
  console.log("Production ledger writes: 0");

  if (!report.ok) {
    console.error("Zodiac content certification: FAIL");
    for (const problem of problems) console.error(`- ${problem}`);
    process.exit(1);
  }

  console.log("Zodiac content certification: PASS");
}

main();
