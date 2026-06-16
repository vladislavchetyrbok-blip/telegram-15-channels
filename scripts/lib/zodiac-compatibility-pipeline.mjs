import fs from "fs";
import path from "path";
import process from "process";

export const COMPATIBILITY_CONFIG_PATH = path.resolve(process.cwd(), "data/config/zodiac-compatibility-pairs.json");
export const COMPATIBILITY_LEDGER_PATH = path.resolve(process.cwd(), "data/state/zodiac-compatibility-publish-ledger.json");
const CHANNEL_LINKS_PATH = path.resolve(process.cwd(), "data/config/zodiac-channel-links.json");

export const SIGNS = [
  { slug: "aquarius", emoji: "♒", nameRu: "Водолей", element: "air", env: "ZODIAC_AQUARIUS_CHANNEL_ID" },
  { slug: "aries", emoji: "♈", nameRu: "Овен", element: "fire", env: "ZODIAC_ARIES_CHANNEL_ID" },
  { slug: "cancer", emoji: "♋", nameRu: "Рак", element: "water", env: "ZODIAC_CANCER_CHANNEL_ID" },
  { slug: "capricorn", emoji: "♑", nameRu: "Козерог", element: "earth", env: "ZODIAC_CAPRICORN_CHANNEL_ID" },
  { slug: "gemini", emoji: "♊", nameRu: "Близнецы", element: "air", env: "ZODIAC_GEMINI_CHANNEL_ID" },
  { slug: "leo", emoji: "♌", nameRu: "Лев", element: "fire", env: "ZODIAC_LEO_CHANNEL_ID" },
  { slug: "libra", emoji: "♎", nameRu: "Весы", element: "air", env: "ZODIAC_LIBRA_CHANNEL_ID" },
  { slug: "pisces", emoji: "♓", nameRu: "Рыбы", element: "water", env: "ZODIAC_PISCES_CHANNEL_ID" },
  { slug: "sagittarius", emoji: "♐", nameRu: "Стрелец", element: "fire", env: "ZODIAC_SAGITTARIUS_CHANNEL_ID" },
  { slug: "scorpio", emoji: "♏", nameRu: "Скорпион", element: "water", env: "ZODIAC_SCORPIO_CHANNEL_ID" },
  { slug: "taurus", emoji: "♉", nameRu: "Телец", element: "earth", env: "ZODIAC_TAURUS_CHANNEL_ID" },
  { slug: "virgo", emoji: "♍", nameRu: "Дева", element: "earth", env: "ZODIAC_VIRGO_CHANNEL_ID" },
];

export const VALID_COMPATIBILITY_STATUSES = new Set(["pending", "locked", "in_progress", "publishing", "sent", "published", "failed", "skipped"]);
export const PROTECTED_COMPATIBILITY_STATUSES = new Set(["pending", "locked", "in_progress", "publishing", "sent", "published"]);

const GENERAL_LINES = [
  "Эта пара раскрывается через честный обмен энергией: важно видеть не только притяжение, но и разницу темпов.",
  "В союзе есть потенциал для роста, если оба не пытаются переделать друг друга под привычный сценарий.",
  "Главная сила пары появляется там, где интерес сильнее контроля, а уважение важнее мгновенной правоты.",
  "Совместимость держится на балансе: один даёт импульс, второй помогает услышать реальную потребность.",
];

const LOVE_LINES = [
  "В любви помогают мягкость, прямой разговор и готовность замечать маленькие сигналы внимания.",
  "Чувства становятся крепче, когда пара не играет в угадайку, а спокойно проговаривает желания.",
  "Романтика здесь работает лучше всего без давления: больше тепла, меньше проверок и сравнений.",
  "Притяжение усиливается, если оба оставляют место для личного пространства и доверия.",
];

const COMMUNICATION_LINES = [
  "Общение требует ясности: чем меньше намёков, тем быстрее появляется ощущение команды.",
  "Лучший формат диалога — коротко, честно и без попытки выиграть спор любой ценой.",
  "Слова могут сближать, если не превращать разговор в экзамен на правильную реакцию.",
  "Паре полезно заранее договариваться о границах, планах и ожиданиях.",
];

const STRENGTH_LINES = [
  "Сильная сторона пары — способность учиться друг у друга и расширять привычный взгляд на отношения.",
  "Главный ресурс союза — взаимное дополнение: разные качества могут работать как одна система.",
  "Пара сильна, когда выбирает общий смысл и не застревает в мелких обидах.",
  "Лучшее в этом союзе — шанс соединить страсть, заботу и практическую поддержку.",
];

const RISK_LINES = [
  "Риск появляется, если каждый начинает защищать свой сценарий вместо поиска общего ритма.",
  "Слабое место пары — молчаливые ожидания: они быстро превращаются в напряжение.",
  "Важно не копить раздражение и не проверять чувства через дистанцию.",
  "Если спор становится борьбой за власть, паре стоит вернуться к фактам и реальным потребностям.",
];

const ADVICE_LINES = [
  "Совет: договоритесь о простых правилах общения и регулярно обновляйте их без драматизации.",
  "Совет: выбирайте один общий фокус на ближайшие дни, чтобы энергия пары не распылялась.",
  "Совет: больше конкретики в действиях и меньше догадок о мотивах друг друга.",
  "Совет: берегите уважение в мелочах — именно оно делает совместимость устойчивой.",
];

export function loadCompatibilityConfig() {
  const raw = fs.readFileSync(COMPATIBILITY_CONFIG_PATH, "utf8");
  const parsed = JSON.parse(raw);
  return {
    ...parsed,
    pairs: Array.isArray(parsed.pairs) ? parsed.pairs : [],
  };
}

export function validateCompatibilityConfig(config = loadCompatibilityConfig()) {
  const problems = [];
  const signs = new Set(SIGNS.map((sign) => sign.slug));
  const pairIds = new Set();
  const logicalPairs = new Set();
  const sameSignPairs = new Set();

  if (config.pairCount !== 78) problems.push(`pairCount must be 78, got ${config.pairCount}.`);
  if (config.pairs.length !== 78) problems.push(`pairs length must be 78, got ${config.pairs.length}.`);

  for (const pair of config.pairs) {
    if (!pair || typeof pair !== "object") {
      problems.push("Pair entry is not an object.");
      continue;
    }

    const required = ["pairId", "signA", "signB", "titleRu", "shortTheme", "compatibilityScore", "elementDynamic", "tags"];
    for (const field of required) {
      if (pair[field] === undefined || pair[field] === null || pair[field] === "") {
        problems.push(`${pair.pairId ?? "unknown"} missing ${field}.`);
      }
    }

    if (!signs.has(pair.signA)) problems.push(`${pair.pairId}: invalid signA ${pair.signA}.`);
    if (!signs.has(pair.signB)) problems.push(`${pair.pairId}: invalid signB ${pair.signB}.`);
    if (pairIds.has(pair.pairId)) problems.push(`Duplicate pairId: ${pair.pairId}.`);
    pairIds.add(pair.pairId);

    const logicalKey = [pair.signA, pair.signB].sort().join("+");
    if (logicalPairs.has(logicalKey)) problems.push(`Duplicate logical pair: ${logicalKey}.`);
    logicalPairs.add(logicalKey);

    if (pair.signA === pair.signB) sameSignPairs.add(pair.signA);
    if (!Number.isInteger(pair.compatibilityScore) || pair.compatibilityScore < 1 || pair.compatibilityScore > 100) {
      problems.push(`${pair.pairId}: compatibilityScore must be 1-100.`);
    }
    if (!Array.isArray(pair.tags) || pair.tags.length === 0) problems.push(`${pair.pairId}: tags must be non-empty array.`);
  }

  if (sameSignPairs.size !== 12) problems.push(`Same-sign pair count must be 12, got ${sameSignPairs.size}.`);
  return problems;
}

export function selectCompatibilityPairs({ pairId = null, sign = null, all = false }) {
  const config = loadCompatibilityConfig();
  const problems = validateCompatibilityConfig(config);
  if (problems.length > 0) {
    throw new Error(`Compatibility config invalid: ${problems.join("; ")}`);
  }

  if (all) return config.pairs;
  if (sign) {
    const normalizedSign = normalizeSlug(sign);
    if (!SIGNS.some((item) => item.slug === normalizedSign)) throw new Error(`Unknown sign: ${sign}`);
    return config.pairs.filter((pair) => pair.signA === normalizedSign || pair.signB === normalizedSign);
  }
  if (pairId) return [findCompatibilityPair(pairId, config.pairs)];

  throw new Error("Provide --pair, --sign, or --all.");
}

export function findCompatibilityPair(pairId, pairs = loadCompatibilityConfig().pairs) {
  const normalized = normalizePairId(pairId);
  const [left, right] = normalized.split("-");
  const pair = pairs.find((item) => item.pairId === normalized) ||
    pairs.find((item) => item.signA === right && item.signB === left);
  if (!pair) throw new Error(`Unknown compatibility pair: ${pairId}`);
  return pair;
}

export function generateCompatibilityPost(pair) {
  const signA = getSign(pair.signA);
  const signB = getSign(pair.signB);
  const seed = hashSeed(pair.pairId);

  return {
    pairId: pair.pairId,
    title: `💞 Совместимость: ${pair.titleRu}`,
    text: [
      `💞 Совместимость: ${pair.titleRu}`,
      "",
      "Общая энергия:",
      `${pair.shortTheme}. ${pick(GENERAL_LINES, seed, 1)}`,
      "",
      "Любовь:",
      pick(LOVE_LINES, seed, 2),
      "",
      "Общение:",
      pick(COMMUNICATION_LINES, seed, 3),
      "",
      "Сильная сторона пары:",
      pick(STRENGTH_LINES, seed, 4),
      "",
      "Риск:",
      pick(RISK_LINES, seed, 5),
      "",
      "Совет:",
      pick(ADVICE_LINES, seed, 6),
    ].join("\n"),
    score: pair.compatibilityScore,
    elementDynamic: pair.elementDynamic,
    signs: [signA, signB],
    keyboard: buildCompatibilityKeyboard(pair),
    target: "general",
  };
}

export function buildCompatibilityKeyboard(pair) {
  const links = loadChannelLinks();
  const buttons = [];
  const signA = getSign(pair.signA);
  const signB = getSign(pair.signB);

  if (links[pair.signA]) buttons.push({ text: `${signA.emoji} ${signA.nameRu}`, url: links[pair.signA] });
  if (pair.signB !== pair.signA && links[pair.signB]) buttons.push({ text: `${signB.emoji} ${signB.nameRu}`, url: links[pair.signB] });

  const rows = [];
  if (buttons.length > 0) rows.push(buttons);
  if (links.general) rows.push([{ text: "🔮 Общий гороскоп", url: links.general }]);
  return { inline_keyboard: rows };
}

export function validateCompatibilityKeyboard(post) {
  const buttons = post.keyboard?.inline_keyboard?.flat() ?? [];
  const errors = [];
  for (const button of buttons) {
    if (!button.text || !button.url) errors.push(`${post.pairId}: empty button text or url`);
    if (button.url && !/^https:\/\/t\.me\/[A-Za-z0-9_]+$/.test(button.url)) errors.push(`${post.pairId}: invalid button URL`);
  }
  return { ok: errors.length === 0, errors, buttonCount: buttons.length };
}

export function loadCompatibilityLedger() {
  if (!fs.existsSync(COMPATIBILITY_LEDGER_PATH)) return { entries: {} };
  const parsed = JSON.parse(fs.readFileSync(COMPATIBILITY_LEDGER_PATH, "utf8"));
  return {
    ...parsed,
    entries: parsed.entries && typeof parsed.entries === "object" ? parsed.entries : {},
  };
}

export function saveCompatibilityLedger(ledger) {
  const dir = path.dirname(COMPATIBILITY_LEDGER_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(COMPATIBILITY_LEDGER_PATH, `${JSON.stringify({ ...ledger, entries: ledger.entries ?? {} }, null, 2)}\n`, "utf8");
}

export function getCompatibilityLedgerKey(date, pairId) {
  return `${date}:${pairId}`;
}

export function getCompatibilityLedgerEntry(ledger, date, pairId) {
  const entries = ledger?.entries && typeof ledger.entries === "object" ? ledger.entries : {};
  const key = getCompatibilityLedgerKey(date, pairId);
  return entries[key] ?? Object.values(entries).find((entry) => entry?.date === date && entry?.pairId === pairId) ?? null;
}

export function normalizeCompatibilityStatus(status) {
  return String(status || "").trim().toLowerCase();
}

export function isProtectedCompatibilityStatus(status) {
  return PROTECTED_COMPATIBILITY_STATUSES.has(normalizeCompatibilityStatus(status));
}

export function markCompatibilityEntry(date, pairId, status, metadata = {}) {
  const ledger = loadCompatibilityLedger();
  const key = getCompatibilityLedgerKey(date, pairId);
  const now = new Date().toISOString();
  const existing = ledger.entries[key] || { key, date, pairId, createdAt: now };
  ledger.entries[key] = { ...existing, ...metadata, status, updatedAt: now };
  saveCompatibilityLedger(ledger);
  return ledger.entries[key];
}

export function validateCompatibilityLedger(ledger = loadCompatibilityLedger()) {
  const entries = ledger.entries && typeof ledger.entries === "object" ? ledger.entries : {};
  const config = loadCompatibilityConfig();
  const pairIds = new Set(config.pairs.map((pair) => pair.pairId));
  const logicalKeys = new Set();
  const problems = [];

  for (const [key, entry] of Object.entries(entries)) {
    if (!entry || typeof entry !== "object") {
      problems.push(`Entry ${key} is not an object.`);
      continue;
    }
    const logicalKey = `${entry.date ?? ""}:${entry.pairId ?? ""}`;
    if (logicalKey !== key) problems.push(`Entry key mismatch: ${key} contains ${logicalKey}.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(entry.date || ""))) problems.push(`Entry ${key} has invalid date.`);
    if (!pairIds.has(entry.pairId)) problems.push(`Entry ${key} has invalid pairId.`);
    if (!VALID_COMPATIBILITY_STATUSES.has(normalizeCompatibilityStatus(entry.status))) {
      problems.push(`Entry ${key} has invalid status: ${entry.status ?? "missing"}.`);
    }
    if (logicalKeys.has(logicalKey)) problems.push(`Duplicate logical date+pair key: ${logicalKey}.`);
    logicalKeys.add(logicalKey);
  }

  return problems;
}

export function summarizeCompatibilityLedger(ledger = loadCompatibilityLedger()) {
  const entries = ledger.entries && typeof ledger.entries === "object" ? ledger.entries : {};
  const dates = new Set();
  const pairs = new Set();
  const summary = { totalEntries: 0, sentCount: 0, pendingCount: 0, failedCount: 0 };

  for (const entry of Object.values(entries)) {
    summary.totalEntries += 1;
    const status = normalizeCompatibilityStatus(entry.status);
    if (status === "sent" || status === "published") summary.sentCount += 1;
    if (["pending", "locked", "in_progress", "publishing"].includes(status)) summary.pendingCount += 1;
    if (status === "failed") summary.failedCount += 1;
    if (entry.date) dates.add(entry.date);
    if (entry.pairId) pairs.add(entry.pairId);
  }

  return {
    ...summary,
    datesCovered: Array.from(dates).sort(),
    pairsCovered: Array.from(pairs).sort(),
  };
}

export function todayKyivDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function validateDateString(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(date || ""));
}

export function getGeneralChannelEnv() {
  return "ZODIAC_GENERAL_CHANNEL_ID";
}

function loadChannelLinks() {
  if (!fs.existsSync(CHANNEL_LINKS_PATH)) return {};
  return JSON.parse(fs.readFileSync(CHANNEL_LINKS_PATH, "utf8"));
}

function getSign(slug) {
  const sign = SIGNS.find((item) => item.slug === slug);
  if (!sign) throw new Error(`Unknown sign: ${slug}`);
  return sign;
}

function normalizeSlug(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePairId(value) {
  return String(value || "").trim().toLowerCase();
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
