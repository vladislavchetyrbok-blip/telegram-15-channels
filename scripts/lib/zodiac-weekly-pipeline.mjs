import fs from "fs";
import path from "path";
import process from "process";
import { resolveZodiacWeeklyVisualAsset } from "../zodiac-weekly-asset-resolver.mjs";

export const WEEKLY_LEDGER_PATH = path.resolve(process.cwd(), "data/state/zodiac-weekly-publish-ledger.json");
const CHANNEL_LINKS_PATH = path.resolve(process.cwd(), "data/config/zodiac-channel-links.json");

export const SIGN_CHANNELS = [
  { slug: "aries", emoji: "♈", name: "Овен", env: "ZODIAC_ARIES_CHANNEL_ID", tone: "смелость, личная инициатива и честный импульс" },
  { slug: "taurus", emoji: "♉", name: "Телец", env: "ZODIAC_TAURUS_CHANNEL_ID", tone: "стабильность, практичные решения и бережный ритм" },
  { slug: "gemini", emoji: "♊", name: "Близнецы", env: "ZODIAC_GEMINI_CHANNEL_ID", tone: "общение, гибкость и быстрые идеи" },
  { slug: "cancer", emoji: "♋", name: "Рак", env: "ZODIAC_CANCER_CHANNEL_ID", tone: "дом, близость и эмоциональная ясность" },
  { slug: "leo", emoji: "♌", name: "Лев", env: "ZODIAC_LEO_CHANNEL_ID", tone: "самовыражение, признание и щедрость" },
  { slug: "virgo", emoji: "♍", name: "Дева", env: "ZODIAC_VIRGO_CHANNEL_ID", tone: "порядок, польза и точные улучшения" },
  { slug: "libra", emoji: "♎", name: "Весы", env: "ZODIAC_LIBRA_CHANNEL_ID", tone: "баланс, красота и честные договорённости" },
  { slug: "scorpio", emoji: "♏", name: "Скорпион", env: "ZODIAC_SCORPIO_CHANNEL_ID", tone: "глубина, внутренний выбор и обновление" },
  { slug: "sagittarius", emoji: "♐", name: "Стрелец", env: "ZODIAC_SAGITTARIUS_CHANNEL_ID", tone: "расширение, знания и движение вперёд" },
  { slug: "capricorn", emoji: "♑", name: "Козерог", env: "ZODIAC_CAPRICORN_CHANNEL_ID", tone: "дисциплина, результат и долгий горизонт" },
  { slug: "aquarius", emoji: "♒", name: "Водолей", env: "ZODIAC_AQUARIUS_CHANNEL_ID", tone: "новые связи, свобода и свежий взгляд" },
  { slug: "pisces", emoji: "♓", name: "Рыбы", env: "ZODIAC_PISCES_CHANNEL_ID", tone: "интуиция, мягкость и творческое течение" },
];

export const ZODIAC_WEEKLY_CHANNELS = [
  { slug: "zodiac-general", emoji: "🔮", name: "Общий гороскоп", env: "ZODIAC_GENERAL_CHANNEL_ID" },
  ...SIGN_CHANNELS,
];

export const VALID_WEEKLY_STATUSES = new Set(["pending", "locked", "in_progress", "publishing", "sent", "published", "failed", "skipped"]);
export const PROTECTED_WEEKLY_STATUSES = new Set(["pending", "locked", "in_progress", "publishing", "sent", "published"]);

const LOVE_LINES = [
  "Разговоры становятся теплее, если не торопить выводы и слушать между строк.",
  "Неделя подходит для честного сближения: меньше проверок, больше спокойной прямоты.",
  "В отношениях важны маленькие знаки внимания, которые возвращают ощущение надёжности.",
  "Личная жизнь оживает там, где появляется лёгкость и готовность говорить о желаниях.",
];

const WORK_LINES = [
  "В делах лучше выбрать один главный приоритет и довести его до видимого результата.",
  "Финансовые решения требуют аккуратности: считайте ресурсы до обещаний и покупок.",
  "Рабочая неделя сильна для переговоров, планирования и закрытия старых хвостов.",
  "Деньги приходят через дисциплину, ясные договорённости и отказ от лишней суеты.",
];

const ENERGY_LINES = [
  "Энергия растёт через режим, воду, прогулки и короткие паузы без экрана.",
  "Не перегружайте расписание: телу нужен запас тишины, чтобы сохранить тонус.",
  "Лучше чередовать активность и восстановление, чем пытаться всё решить одним рывком.",
  "Настроение станет ровнее, если заранее убрать из недели лишние обязательства.",
];

const ADVICE_LINES = [
  "Не доказывайте всё сразу: один спокойный шаг убедительнее громких обещаний.",
  "Держите фокус на том, что можно улучшить сегодня, а не на идеальном сценарии.",
  "Выбирайте ясность: короткий честный разговор сэкономит много внутренней энергии.",
  "Сохраняйте достоинство и темп; неделя любит тех, кто действует без спешки.",
];

const GENERAL_LINES = {
  energy: [
    "Неделя соединяет практичность и интуицию: важно видеть факты, но не глушить внутренний голос.",
    "Главный ритм недели — спокойное движение вперёд без лишних обещаний и резких разворотов.",
    "Эта неделя помогает собрать внимание, закрыть старые вопросы и выбрать более зрелый курс.",
    "Энергия периода поддерживает тех, кто действует последовательно и не распыляется на шум.",
  ],
  love: LOVE_LINES,
  work: WORK_LINES,
  decisions: [
    "Решения лучше принимать после паузы: проверьте цифры, мотивы и долгосрочные последствия.",
    "Не выбирайте из тревоги. Дайте себе время увидеть, где реальная возможность, а где давление.",
    "Хорошо работают решения, которые упрощают жизнь и возвращают контроль над расписанием.",
    "Если выбор кажется сложным, начните с маленького действия, которое покажет следующий шаг.",
  ],
  advice: ADVICE_LINES,
};

const BEST_DAYS = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"];

export function parseWeekCode(value) {
  const match = /^(\d{4})-W(\d{2})$/.exec(String(value || "").trim());
  if (!match) {
    return { ok: false, error: "Missing or invalid --week YYYY-Www.", week: null, startDate: null, endDate: null };
  }

  const year = Number(match[1]);
  const weekNumber = Number(match[2]);
  const maxWeeks = getIsoWeeksInYear(year);
  if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > maxWeeks) {
    return { ok: false, error: `Invalid ISO week ${match[2]} for ${year}.`, week: null, startDate: null, endDate: null };
  }

  const monday = isoWeekToDate(year, weekNumber);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return {
    ok: true,
    error: null,
    week: `${year}-W${String(weekNumber).padStart(2, "0")}`,
    startDate: formatDate(monday),
    endDate: formatDate(sunday),
  };
}

export function getWeeklyPublishKey(week, slug) {
  return `${week}:${slug}`;
}

export function normalizeWeeklyStatus(status) {
  return String(status || "").trim().toLowerCase();
}

export function isProtectedWeeklyStatus(status) {
  return PROTECTED_WEEKLY_STATUSES.has(normalizeWeeklyStatus(status));
}

export function loadWeeklyLedger() {
  if (!fs.existsSync(WEEKLY_LEDGER_PATH)) {
    return { entries: {} };
  }

  const parsed = JSON.parse(fs.readFileSync(WEEKLY_LEDGER_PATH, "utf8"));
  return {
    ...parsed,
    entries: parsed.entries && typeof parsed.entries === "object" ? parsed.entries : {},
  };
}

export function saveWeeklyLedger(ledger) {
  const dir = path.dirname(WEEKLY_LEDGER_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(WEEKLY_LEDGER_PATH, `${JSON.stringify({ ...ledger, entries: ledger.entries ?? {} }, null, 2)}\n`, "utf8");
}

export function getWeeklyLedgerEntry(ledger, week, slug) {
  const entries = ledger?.entries && typeof ledger.entries === "object" ? ledger.entries : {};
  const key = getWeeklyPublishKey(week, slug);
  return entries[key] ?? Object.values(entries).find((entry) => entry?.week === week && entry?.slug === slug) ?? null;
}

export function validateWeeklyLedger(ledger = loadWeeklyLedger()) {
  const entries = ledger.entries && typeof ledger.entries === "object" ? ledger.entries : {};
  const logicalKeys = new Map();
  const problems = [];

  for (const [key, entry] of Object.entries(entries)) {
    if (!entry || typeof entry !== "object") {
      problems.push(`Entry ${key} is not an object.`);
      continue;
    }

    const logicalKey = `${entry.week ?? ""}:${entry.slug ?? ""}`;
    if (logicalKey !== key) problems.push(`Entry key mismatch: ${key} contains ${logicalKey}.`);
    if (!parseWeekCode(entry.week).ok) problems.push(`Entry ${key} has invalid week.`);
    if (!ZODIAC_WEEKLY_CHANNELS.some((channel) => channel.slug === entry.slug)) problems.push(`Entry ${key} has invalid slug.`);
    if (!VALID_WEEKLY_STATUSES.has(normalizeWeeklyStatus(entry.status))) problems.push(`Entry ${key} has invalid status: ${entry.status ?? "missing"}.`);
    if (logicalKeys.has(logicalKey)) problems.push(`Duplicate logical week+slug key: ${logicalKey}.`);
    logicalKeys.set(logicalKey, key);
  }

  return problems;
}

export function summarizeWeeklyLedger(ledger = loadWeeklyLedger()) {
  const entries = ledger.entries && typeof ledger.entries === "object" ? ledger.entries : {};
  const weeks = new Set();
  const slugs = new Set();
  const summary = { totalEntries: 0, sentCount: 0, pendingCount: 0, failedCount: 0, weeksCovered: [], slugsCovered: [] };

  for (const entry of Object.values(entries)) {
    summary.totalEntries += 1;
    const status = normalizeWeeklyStatus(entry.status);
    if (status === "sent" || status === "published") summary.sentCount += 1;
    if (["pending", "locked", "in_progress", "publishing"].includes(status)) summary.pendingCount += 1;
    if (status === "failed") summary.failedCount += 1;
    if (entry.week) weeks.add(entry.week);
    if (entry.slug) slugs.add(entry.slug);
  }

  return {
    ...summary,
    weeksCovered: Array.from(weeks).sort(),
    slugsCovered: Array.from(slugs).sort(),
  };
}

export function markWeeklyEntry(week, slug, status, metadata = {}) {
  const ledger = loadWeeklyLedger();
  const key = getWeeklyPublishKey(week, slug);
  const now = new Date().toISOString();
  const existing = ledger.entries[key] || { key, week, slug, createdAt: now };
  ledger.entries[key] = { ...existing, ...metadata, status, updatedAt: now };
  saveWeeklyLedger(ledger);
  return ledger.entries[key];
}

export function generateWeeklyPosts(weekCode) {
  const week = parseWeekCode(weekCode);
  if (!week.ok) throw new Error(week.error);

  return {
    week: week.week,
    startDate: week.startDate,
    endDate: week.endDate,
    posts: ZODIAC_WEEKLY_CHANNELS.map((channel, index) => buildPostForChannel(channel, week, index)),
  };
}

export function buildWeeklyReport(weekCode) {
  const plan = generateWeeklyPosts(weekCode);
  const ledger = loadWeeklyLedger();
  const report = {
    week: plan.week,
    startDate: plan.startDate,
    endDate: plan.endDate,
    expectedPosts: plan.posts.length,
    imagePosts: 0,
    textOnlyPosts: 0,
    failed: 0,
    skipped: 0,
    duplicateBlocked: 0,
    buttonStatus: "OK",
    ledgerStatus: "OK",
    perChannel: [],
  };

  const ledgerProblems = validateWeeklyLedger(ledger);
  if (ledgerProblems.length > 0) report.ledgerStatus = "PROBLEMS";

  for (const post of plan.posts) {
    const entry = getWeeklyLedgerEntry(ledger, plan.week, post.slug);
    const status = normalizeWeeklyStatus(entry?.status);
    const duplicateBlocked = isProtectedWeeklyStatus(status);
    const failed = status === "failed";
    if (post.mediaMode === "image") report.imagePosts += 1;
    else report.textOnlyPosts += 1;
    if (duplicateBlocked) {
      report.skipped += 1;
      report.duplicateBlocked += 1;
    }
    if (failed) report.failed += 1;
    if (!post.buttonStatus.ok) report.buttonStatus = "PROBLEMS";

    report.perChannel.push({
      slug: post.slug,
      mediaMode: post.mediaMode,
      ledgerStatus: status || "missing",
      action: duplicateBlocked ? "skip_duplicate" : failed ? "skip_failed" : "ready",
      buttonStatus: post.buttonStatus.ok ? "OK" : "PROBLEMS",
      buttonCount: post.buttonStatus.buttonCount,
      errors: post.buttonStatus.errors,
    });
  }

  return { report, ledgerProblems };
}

function buildPostForChannel(channel, week, index) {
  const asset = resolveZodiacWeeklyVisualAsset(channel.slug, week.startDate, "weekly");
  const keyboard = buildWeeklyNavigationKeyboard(channel.slug);
  const text = channel.slug === "zodiac-general"
    ? buildGeneralWeeklyText(week)
    : buildSignWeeklyText(channel, week, index);

  return {
    slug: channel.slug,
    title: channel.slug === "zodiac-general" ? "🔮 Гороскоп на неделю" : `${channel.emoji} ${channel.name} — гороскоп на неделю`,
    week: week.week,
    startDate: week.startDate,
    endDate: week.endDate,
    text,
    imagePath: asset.path ?? null,
    imageRelative: asset.relative ?? null,
    mediaMode: asset.path ? "image" : "text_only",
    mediaSource: asset.source,
    mediaWarning: asset.warning,
    keyboard,
    buttonStatus: validateWeeklyKeyboard(channel.slug, keyboard),
  };
}

function buildGeneralWeeklyText(week) {
  const seed = hashSeed(`${week.week}:zodiac-general`);
  return [
    "🔮 Гороскоп на неделю",
    "",
    "Главная энергия недели:",
    pick(GENERAL_LINES.energy, seed, 1),
    "",
    "Любовь:",
    pick(GENERAL_LINES.love, seed, 2),
    "",
    "Деньги и работа:",
    pick(GENERAL_LINES.work, seed, 3),
    "",
    "Решения:",
    pick(GENERAL_LINES.decisions, seed, 4),
    "",
    "Совет недели:",
    pick(GENERAL_LINES.advice, seed, 5),
    "",
    "👇 Выберите свой знак ниже:",
  ].join("\n");
}

function buildSignWeeklyText(sign, week, index) {
  const seed = hashSeed(`${week.week}:${sign.slug}`);
  return [
    `${sign.emoji} ${sign.name} — гороскоп на неделю`,
    "",
    "Главная тема недели:",
    `На первый план выходят ${sign.tone}. ${pick(GENERAL_LINES.energy, seed, 1)}`,
    "",
    "Любовь:",
    pick(LOVE_LINES, seed, 2),
    "",
    "Работа и деньги:",
    pick(WORK_LINES, seed, 3),
    "",
    "Энергия:",
    pick(ENERGY_LINES, seed, 4),
    "",
    "Совет недели:",
    pick(ADVICE_LINES, seed, 5),
    "",
    "Лучший день:",
    BEST_DAYS[(seed + index) % BEST_DAYS.length],
  ].join("\n");
}

export function buildWeeklyNavigationKeyboard(channelSlug) {
  const links = loadChannelLinks();

  if (channelSlug === "zodiac-general") {
    return { inline_keyboard: chunkButtons(SIGN_CHANNELS.map((sign) => ({ text: `${sign.emoji} ${sign.name}`, url: links[sign.slug] }))) };
  }

  const otherSigns = SIGN_CHANNELS.filter((sign) => sign.slug !== channelSlug);
  return {
    inline_keyboard: [
      [{ text: "🔮 Общий гороскоп", url: links.general }],
      ...chunkButtons(otherSigns.map((sign) => ({ text: `${sign.emoji} ${sign.name}`, url: links[sign.slug] }))),
    ],
  };
}

export function validateWeeklyKeyboard(channelSlug, keyboard) {
  const errors = [];
  const buttons = keyboard?.inline_keyboard?.flat() ?? [];
  const links = loadChannelLinks();

  for (const button of buttons) {
    if (!button.text || !button.url) errors.push(`${channelSlug}: empty button text or url`);
    if (button.url && !/^https:\/\/t\.me\/[A-Za-z0-9_]+$/.test(button.url)) errors.push(`${channelSlug}: invalid url ${button.url}`);
  }

  if (channelSlug === "zodiac-general") {
    for (const sign of SIGN_CHANNELS) {
      if (!buttons.some((button) => button.url === links[sign.slug])) errors.push(`general missing ${sign.slug}`);
    }
  } else {
    if (!buttons.some((button) => button.url === links.general)) errors.push(`${channelSlug}: missing general button`);
    if (buttons.some((button) => button.url === links[channelSlug])) errors.push(`${channelSlug}: includes self-link`);
  }

  return { ok: errors.length === 0, errors, buttonCount: buttons.length };
}

export function getWeeklyTelegramTargetEnv(slug) {
  return ZODIAC_WEEKLY_CHANNELS.find((channel) => channel.slug === slug)?.env ?? null;
}

function loadChannelLinks() {
  if (!fs.existsSync(CHANNEL_LINKS_PATH)) return {};
  return JSON.parse(fs.readFileSync(CHANNEL_LINKS_PATH, "utf8"));
}

function chunkButtons(buttons, size = 2) {
  const rows = [];
  for (let index = 0; index < buttons.length; index += size) {
    rows.push(buttons.slice(index, index + size));
  }
  return rows;
}

function pick(items, seed, offset) {
  return items[(seed + offset) % items.length];
}

function hashSeed(value) {
  let hash = 0;
  for (const char of String(value)) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function isoWeekToDate(year, weekNumber) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (weekNumber - 1) * 7);
  return monday;
}

function getIsoWeeksInYear(year) {
  const dec28 = new Date(Date.UTC(year, 11, 28));
  return getIsoWeekFromDate(dec28).week;
}

function getIsoWeekFromDate(date) {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
  return { year: target.getUTCFullYear(), week };
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}
