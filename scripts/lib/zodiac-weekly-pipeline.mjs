import fs from "fs";
import path from "path";
import process from "process";
import { resolveZodiacWeeklyVisualAsset } from "../zodiac-weekly-asset-resolver.mjs";
import { MINI_APP_START_PARAMETERS, buildCompatibilityInlineButton, buildMiniAppInlineButton } from "./zodiac-compatibility-bot.mjs";

export const WEEKLY_LEDGER_PATH = path.resolve(process.cwd(), "data/state/zodiac-weekly-publish-ledger.json");
const CHANNEL_LINKS_PATH = path.resolve(process.cwd(), "data/config/zodiac-channel-links.json");
const MINI_APP_CTA_URL = "https://t.me/zodiac_love_check_bot?startapp=mystic";

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

export const WEEKLY_RETENTION_CTA_LABELS = Object.freeze({
  week: "📅 Прогноз недели",
  compatibility: "💞 Совместимость",
});

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

const WEEKLY_OPENINGS = [
  "Неделя не просит резких разворотов: её сила в том, чтобы заметить главный ритм и не расплескать внимание на мелочи.",
  "Это период тихой настройки: сначала собрать факты и чувства, потом выбирать шаг, который можно удержать.",
  "Главный сюжет недели — меньше автоматических реакций и больше честных решений, после которых становится легче дышать.",
  "Неделя раскрывается через практичную магию маленьких действий: вовремя сказать, вовремя остановиться, вовремя выбрать своё.",
];

const WEEK_PHASE_LINES = {
  start: [
    "В начале недели лучше не перегружать расписание. Проверьте планы, договорённости и то, что давно просит спокойной правки.",
    "Первые дни подходят для настройки темпа: не берите лишнее, пока не стало ясно, где действительно нужен ваш ресурс.",
    "Начало недели сильнее для наблюдения и подготовки, чем для громких обещаний. Хороший старт выглядит аккуратно.",
  ],
  middle: [
    "Середина недели активирует разговоры, деньги и рабочие решения. Здесь важно фиксировать детали, а не полагаться на память.",
    "К середине недели появится больше движения. Держите фокус на одном результате, чтобы не распылиться на чужую срочность.",
    "В середине периода полезно сверить слова с действиями: то, что звучит красиво, должно иметь понятный следующий шаг.",
  ],
  weekend: [
    "Ближе к выходным телу и эмоциям понадобится восстановление. Уберите лишний шум и оставьте время для простых радостей.",
    "Финал недели лучше провести без гонки за идеальным сценарием. Закрепите сделанное и дайте себе мягкую паузу.",
    "К концу недели станет ясно, что стоит продолжать, а что пора отпустить без длинных объяснений.",
  ],
};

const WEEKLY_CTA_LINES = [
  "👇 Ниже — кнопки прогноза недели и совместимости в Mini App.",
  "👇 Откройте Mini App ниже, чтобы проверить совместимость и личный прогноз.",
  "👇 Внизу есть быстрый переход в прогноз недели и совместимость.",
];

const SIGN_WEEKLY_OPENINGS = {
  aries: "Овен, неделя даёт искру для старта, но просит не превращать каждую задержку в борьбу.",
  taurus: "Телец, неделя укрепляет то, что построено спокойно: деньги, быт, договорённости и личный темп.",
  gemini: "Близнецы, неделя наполнена разговорами и идеями, но главный выигрыш даст один выбранный фокус.",
  cancer: "Рак, неделя мягко подсвечивает дом, близость и личные границы: не игнорируйте внутренние сигналы.",
  leo: "Лев, неделя помогает проявиться ярко, если уверенность не превращается в давление на окружающих.",
  virgo: "Дева, неделя идеально подходит для чистки деталей и возвращения контроля без лишней самокритики.",
  libra: "Весы, неделя про баланс, но не про молчаливые уступки: гармония начинается с честной позиции.",
  scorpio: "Скорпион, неделя усиливает глубину и интуицию, но просит меньше проверок и больше ясности.",
  sagittarius: "Стрелец, неделя открывает горизонт, если вы выбираете маршрут, а не просто мечтаете о свободе.",
  capricorn: "Козерог, неделя поддерживает дисциплину, статус и решения, которые работают на долгий результат.",
  aquarius: "Водолей, неделя приносит свежую идею, но ей нужна структура, чтобы стать реальным шагом.",
  pisces: "Рыбы, неделя тонкая и интуитивная: чем мягче режим, тем точнее внутренний сигнал.",
};

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
const CAUTION_DAYS = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"];

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
  return `zodiac:weekly:${week}:${normalizeWeeklyLedgerSlug(slug)}`;
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

    const logicalKey = getWeeklyPublishKey(entry.week ?? "", entry.slug ?? "");
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
  const weekRange = formatWeeklyDateRange(week.startDate, week.endDate);

  return {
    week: week.week,
    startDate: week.startDate,
    endDate: week.endDate,
    weekRange,
    posts: ZODIAC_WEEKLY_CHANNELS.map((channel, index) => buildPostForChannel(channel, week, weekRange, index)),
  };
}

export function buildWeeklyReport(weekCode) {
  const plan = generateWeeklyPosts(weekCode);
  const ledger = loadWeeklyLedger();
  const report = {
    week: plan.week,
    startDate: plan.startDate,
    endDate: plan.endDate,
    weekRange: plan.weekRange,
    expectedPosts: plan.posts.length,
    imagePosts: 0,
    textOnlyPosts: 0,
    failed: 0,
    skipped: 0,
    duplicateBlocked: 0,
    weeklyRangeStatus: "OK",
    weeklyRangeMatched: 0,
    contentQualityStatus: "OK",
    contentQualityErrors: [],
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
    const firstLineHasRange = post.firstLine.includes(plan.weekRange);
    if (firstLineHasRange) report.weeklyRangeMatched += 1;
    else report.weeklyRangeStatus = "PROBLEMS";
    const contentQualityErrors = validateWeeklyPostQuality(post);
    if (contentQualityErrors.length > 0) {
      report.contentQualityStatus = "PROBLEMS";
      report.contentQualityErrors.push(...contentQualityErrors.map((error) => `${post.slug}: ${error}`));
    }

    report.perChannel.push({
      slug: post.slug,
      mediaMode: post.mediaMode,
      firstLine: post.firstLine,
      weekRange: post.weekRange,
      firstLineStatus: firstLineHasRange ? "OK" : "MISSING_RANGE",
      ledgerStatus: status || "missing",
      action: duplicateBlocked ? "skip_duplicate" : failed ? "skip_failed" : "ready",
      contentQualityStatus: contentQualityErrors.length > 0 ? "PROBLEMS" : "OK",
      buttonStatus: post.buttonStatus.ok ? "OK" : "PROBLEMS",
      buttonCount: post.buttonStatus.buttonCount,
      ctaLabels: post.buttonStatus.ctaLabels,
      errors: post.buttonStatus.errors,
    });
  }

  return { report, ledgerProblems };
}

function buildPostForChannel(channel, week, weekRange, index) {
  const asset = resolveZodiacWeeklyVisualAsset(channel.slug, week.startDate, "weekly");
  const keyboard = buildWeeklyNavigationKeyboard(channel.slug);
  const rawText = channel.slug === "zodiac-general"
    ? buildGeneralWeeklyText(week, weekRange)
    : buildSignWeeklyText(channel, week, weekRange, index);
  const text = buildQualityWeeklyText(rawText, channel, week, weekRange, index);
  const firstLine = text.split("\n")[0] ?? "";

  return {
    slug: channel.slug,
    title: channel.slug === "zodiac-general" ? "🔮 Гороскоп на неделю" : `${channel.emoji} ${channel.name} — гороскоп на неделю`,
    week: week.week,
    startDate: week.startDate,
    endDate: week.endDate,
    weekRange,
    firstLine,
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

function buildGeneralWeeklyText(week, weekRange) {
  const seed = hashSeed(`${week.week}:zodiac-general`);
  const opening = pick(WEEKLY_OPENINGS, seed, 0);
  return [
    `<b>✨ Общий гороскоп на неделю ${weekRange}</b>`,
    "",
    opening,
    "",
    "<b>1. Старт недели</b>",
    pick(WEEK_PHASE_LINES.start, seed, 1),
    "",
    "<b>2. Середина недели</b>",
    pick(WEEK_PHASE_LINES.middle, seed, 2),
    "",
    "<b>3. Выходные и восстановление</b>",
    pick(WEEK_PHASE_LINES.weekend, seed, 3),
    "",
    "<b>4. Главный вектор</b>",
    pick(GENERAL_LINES.energy, seed, 1),
    "",
    "<b>Любовь / отношения</b>",
    pick(GENERAL_LINES.love, seed, 2),
    "",
    "<b>Работа / деньги</b>",
    pick(GENERAL_LINES.work, seed, 3),
    "",
    "<b>Энергия / самочувствие</b>",
    pick(ENERGY_LINES, seed, 4),
    "",
    "<b>Решения недели</b>",
    pick(GENERAL_LINES.decisions, seed, 4),
    "",
    "<b>Главный совет недели</b>",
    pick(GENERAL_LINES.advice, seed, 5),
    "",
    pick(WEEKLY_CTA_LINES, seed, 6),
    "",
    "👇 Выберите свой знак ниже:",
  ].join("\n");
}

function buildSignWeeklyText(sign, week, weekRange, index) {
  const seed = hashSeed(`${week.week}:${sign.slug}`);
  const opening = SIGN_WEEKLY_OPENINGS[sign.slug] ?? pick(WEEKLY_OPENINGS, seed, 0);
  return [
    `<b>${sign.emoji} ${sign.name} | Гороскоп на неделю ${weekRange}</b>`,
    "",
    opening,
    "",
    "<b>1. Старт недели</b>",
    `${pick(WEEK_PHASE_LINES.start, seed, 1)} Для вас это особенно связано с темой: ${sign.tone}.`,
    "",
    "<b>2. Середина недели</b>",
    pick(WEEK_PHASE_LINES.middle, seed, 2),
    "",
    "<b>3. Выходные и восстановление</b>",
    pick(WEEK_PHASE_LINES.weekend, seed, 3),
    "",
    "<b>4. Главный вектор</b>",
    `На первый план выходят ${sign.tone}. ${pick(GENERAL_LINES.energy, seed, 1)}`,
    "",
    "<b>Любовь / отношения</b>",
    pick(LOVE_LINES, seed, 2),
    "",
    "<b>Работа / деньги</b>",
    pick(WORK_LINES, seed, 3),
    "",
    "<b>Энергия / самочувствие</b>",
    pick(ENERGY_LINES, seed, 4),
    "",
    "<b>Главный совет недели</b>",
    pick(ADVICE_LINES, seed, 5),
    "",
    `<b>Лучший день:</b> ${BEST_DAYS[(seed + index) % BEST_DAYS.length]}`,
    "",
    pick(WEEKLY_CTA_LINES, seed, 6),
  ].join("\n");
}

function buildQualityWeeklyText(rawText, channel, week, weekRange, index) {
  const seed = hashSeed(`${week.week}:${channel.slug}:quality`);
  const cautionDay = CAUTION_DAYS[(seed + index + 3) % CAUTION_DAYS.length];
  const existingLines = String(rawText || "")
    .split("\n")
    .filter((line) => !/Mini App|кнопк[аи]|Выберите свой знак/i.test(line))
    .join("\n")
    .trim();

  const cautionLine = channel.slug === "zodiac-general"
    ? `${cautionDay} — не перегружайте неделю чужой срочностью и не принимайте решения из тревоги.`
    : `${cautionDay} — держите темп мягче обычного и не обещайте больше, чем сможете спокойно выполнить.`;

  return [
    existingLines,
    "",
    `<b>День осторожности:</b> ${cautionLine}`,
    "",
    `<b>Личный прогноз и совместимость:</b> ${MINI_APP_CTA_URL}`,
  ].join("\n");
}

export function buildWeeklyNavigationKeyboard(channelSlug) {
  const links = loadChannelLinks();
  const ctaRow = buildWeeklyRetentionCtaRow(channelSlug);
  const ctaRows = ctaRow.length > 0 ? [ctaRow] : [];

  if (channelSlug === "zodiac-general") {
    return { inline_keyboard: [...ctaRows, ...chunkButtons(SIGN_CHANNELS.map((sign) => ({ text: `${sign.emoji} ${sign.name}`, url: links[sign.slug] })))] };
  }

  const otherSigns = SIGN_CHANNELS.filter((sign) => sign.slug !== channelSlug);
  return {
    inline_keyboard: [
      ...ctaRows,
      [{ text: "🔮 Общий гороскоп", url: links.general }],
      ...chunkButtons(otherSigns.map((sign) => ({ text: `${sign.emoji} ${sign.name}`, url: links[sign.slug] }))),
    ],
  };
}

function buildWeeklyRetentionCtaRow(channelSlug) {
  return [
    buildMiniAppInlineButton(MINI_APP_START_PARAMETERS.week, WEEKLY_RETENTION_CTA_LABELS.week),
    buildCompatibilityInlineButton(channelSlug, { text: WEEKLY_RETENTION_CTA_LABELS.compatibility }),
  ].filter(Boolean);
}

export function validateWeeklyKeyboard(channelSlug, keyboard) {
  const errors = [];
  const buttons = keyboard?.inline_keyboard?.flat() ?? [];
  const links = loadChannelLinks();
  const ctaLabels = buttons.filter((button) => Object.values(WEEKLY_RETENTION_CTA_LABELS).includes(button.text)).map((button) => button.text);

  for (const button of buttons) {
    if (!button.text || !button.url) errors.push(`${channelSlug}: empty button text or url`);
    if (button.url && !isValidTelegramButtonUrl(button.url)) errors.push(`${channelSlug}: invalid url ${button.url}`);
  }

  for (const label of Object.values(WEEKLY_RETENTION_CTA_LABELS)) {
    if (!buttons.some((button) => button.text === label)) errors.push(`${channelSlug}: missing CTA button ${label}`);
  }

  if (channelSlug === "zodiac-general") {
    for (const sign of SIGN_CHANNELS) {
      if (!buttons.some((button) => button.url === links[sign.slug])) errors.push(`general missing ${sign.slug}`);
    }
  } else {
    if (!buttons.some((button) => button.url === links.general)) errors.push(`${channelSlug}: missing general button`);
    if (buttons.some((button) => button.url === links[channelSlug])) errors.push(`${channelSlug}: includes self-link`);
  }

  return { ok: errors.length === 0, errors, buttonCount: buttons.length, ctaLabels };
}

export function validateWeeklyPostQuality(post) {
  const errors = [];
  const text = String(post?.text || "");
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
  const opening = lines[1] ?? "";
  const minLength = post?.slug === "zodiac-general" ? 900 : 850;
  const requiredLabels = [
    "1. Старт недели",
    "2. Середина недели",
    "3. Выходные и восстановление",
    "4. Главный вектор",
    "Любовь / отношения",
    "Работа / деньги",
    "Энергия / самочувствие",
    "Главный совет недели",
  ];

  if (!post?.firstLine?.includes(post?.weekRange)) {
    errors.push("first line is missing weekly date range");
  }
  if (opening.length < 55) {
    errors.push("weekly opening is too short or missing after the date range header");
  }
  if (text.length < minLength) {
    errors.push(`weekly post is too short: ${text.length}/${minLength}`);
  }
  for (const label of requiredLabels) {
    if (!text.includes(label)) errors.push(`missing weekly quality block: ${label}`);
  }
  if (/TODO|lorem ipsum|placeholder|Скоро появится/i.test(text)) {
    errors.push("weekly post contains placeholder/TODO/lorem text");
  }
  if (!/Mini App|кнопк[аи]|совместимост/i.test(text)) {
    errors.push("weekly post is missing a lightweight CTA/navigation hint");
  }
  if (!text.includes("День осторожности:")) {
    errors.push("weekly post is missing caution day");
  }
  if (!text.includes(MINI_APP_CTA_URL)) {
    errors.push("weekly post is missing approved Mini App CTA link");
  }

  return errors;
}

export function getWeeklyTelegramTargetEnv(slug) {
  return ZODIAC_WEEKLY_CHANNELS.find((channel) => channel.slug === slug)?.env ?? null;
}

function normalizeWeeklyLedgerSlug(slug) {
  return slug === "zodiac-general" ? "general" : slug;
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

function isValidTelegramButtonUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "t.me") return false;
    if (!/^\/[A-Za-z0-9_]+(?:\/[A-Za-z0-9_/-]+)?$/.test(url.pathname)) return false;
    for (const key of url.searchParams.keys()) {
      if (key !== "start" && key !== "startapp") return false;
    }
    for (const key of ["start", "startapp"]) {
      const param = url.searchParams.get(key);
      if (param && !/^[A-Za-z0-9_-]+$/.test(param)) return false;
    }
    return true;
  } catch {
    return false;
  }
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

export function formatWeeklyDateRange(startDate, endDate) {
  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);
  if (!start || !end) throw new Error(`Invalid weekly date range: ${startDate} -> ${endDate}`);

  if (start.year === end.year) {
    return `${start.day}.${start.month}–${end.day}.${end.month}.${end.year}`;
  }

  return `${start.day}.${start.month}.${start.year}–${end.day}.${end.month}.${end.year}`;
}

function parseDateKey(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  return { year: match[1], month: match[2], day: match[3] };
}
