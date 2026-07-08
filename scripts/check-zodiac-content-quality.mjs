#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { buildZodiacPost, ZODIAC_DAILY_CHANNELS } from "./generate-zodiac-plan.mjs";
import { generateWeeklyPosts, validateWeeklyPostQuality } from "./lib/zodiac-weekly-pipeline.mjs";
import {
  findCompatibilityPair,
  generateCompatibilityPost,
  loadCompatibilityConfig,
  validateCompatibilityConfig,
} from "./lib/zodiac-compatibility-pipeline.mjs";

const APPROVED_CTA_URL = "https://t.me/zodiac_love_check_bot?startapp=mystic";
const REPORT_ROOT = path.join(process.cwd(), "data", "runtime", "content-quality");
const SAMPLE_DIR = path.join(REPORT_ROOT, "samples");
const DEFAULT_DATE = "2026-07-07";

const SIGN_META = [
  { slug: "aries", ruName: "Овен", range: "21 марта — 19 апреля" },
  { slug: "taurus", ruName: "Телец", range: "20 апреля — 20 мая" },
  { slug: "gemini", ruName: "Близнецы", range: "21 мая — 20 июня" },
  { slug: "cancer", ruName: "Рак", range: "21 июня — 22 июля" },
  { slug: "leo", ruName: "Лев", range: "23 июля — 22 августа" },
  { slug: "virgo", ruName: "Дева", range: "23 августа — 22 сентября" },
  { slug: "libra", ruName: "Весы", range: "23 сентября — 22 октября" },
  { slug: "scorpio", ruName: "Скорпион", range: "23 октября — 21 ноября" },
  { slug: "sagittarius", ruName: "Стрелец", range: "22 ноября — 21 декабря" },
  { slug: "capricorn", ruName: "Козерог", range: "22 декабря — 19 января" },
  { slug: "aquarius", ruName: "Водолей", range: "20 января — 18 февраля" },
  { slug: "pisces", ruName: "Рыбы", range: "19 февраля — 20 марта" },
];

const DAILY_SIGN_LABELS = [
  "Главная энергия дня:",
  "В отношениях:",
  "В делах и деньгах:",
  "Внутренний совет:",
  "Ритуал дня:",
  "Лучше не делать:",
];

const DAILY_GENERAL_LABELS = [
  "Главная энергия дня:",
  "Любовь и отношения:",
  "Дела и деньги:",
  "Внутренний ритм:",
  "По знакам:",
  "Совет дня:",
  "Маленький ритуал:",
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
  "Лучший день:",
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

const FORBIDDEN_PATTERNS = [
  /точно\s+произойд[её]т/i,
  /гарант/i,
  /guarantee(?:d|s)?/i,
  /100\s*%/i,
  /судьба\s+решена/i,
  /обязательно\s+верн[её]тся/i,
  /\b(он|она)\s+обязательно\s+верн[её]тся/i,
  /вы\s+обязаны/i,
  /идеальная\s+пара/i,
  /не\s+подходит/i,
  /обречен[аы]?/i,
  /нажить\s+врагов/i,
  /корыстн/i,
  /купите\s+VIP/i,
  /payment|unlock\s+vip|vip\s+unlock/i,
  /\/admin\b|\/dashboard\b/i,
  /астроляб|astrolab/i,
];

const MOJIBAKE_PATTERN = /(?:Рќ|Рџ|РЎ|Р’|Рђ|Р“|Р”|Р—|РЃ|Р™|Рљ|Рћ|Р‘|Рњ|Р›|Рў|Р§|Р­|СЃ|СЊ|С‹|СЏ|СЂ|С‚|вЂ|в™|рџ|бљ|�)/;
const TAG_PATTERN = /<[^>]+>/g;

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { date: DEFAULT_DATE };
  for (let index = 0; index < args.length; index += 1) {
    if ((args[index] === "--date" || args[index] === "--start") && args[index + 1]) {
      options.date = args[index + 1];
      index += 1;
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.date)) {
    throw new Error(`Invalid --date value: ${options.date}`);
  }
  options.week = isoWeekCode(options.date);
  return options;
}

function stripMarkup(text) {
  return String(text || "").replace(TAG_PATTERN, "").trim();
}

function normalizeForDuplicate(text) {
  return stripMarkup(text)
    .replace(APPROVED_CTA_URL, "")
    .replace(/[#\wА-Яа-яЁё]+/g, (value) => (value.startsWith("#") ? "" : value.toLowerCase()))
    .replace(/\d{1,2}[.\s]\d{1,2}(?:.\d{4})?/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueProblems(items, label) {
  const seen = new Map();
  const problems = [];
  for (const item of items) {
    const key = normalizeForDuplicate(item.text);
    if (seen.has(key)) problems.push(`${label}: duplicate body ${seen.get(key)} and ${item.id}`);
    seen.set(key, item.id);
  }
  return problems;
}

function forbiddenHits(text) {
  return FORBIDDEN_PATTERNS
    .filter((pattern) => pattern.test(text))
    .map((pattern) => String(pattern));
}

function normalizeSentenceOpening(sentence) {
  return String(sentence || "")
    .toLowerCase()
    .replace(/[“”"«»()]/g, "")
    .replace(/[,:;.!?—–-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");
}

function repeatedSentenceOpenings(text) {
  const seen = new Map();
  const repeats = [];
  const ignoredLinePattern = /^(открыть|хэштеги|период знака|это не обещание|фокус пары|как работает|любовь|общение|риск|практика|сильная сторона|главная энергия|в отношениях|в делах|внутренний совет|ритуал дня|лучше не делать)\b/i;
  const lines = stripMarkup(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.includes(APPROVED_CTA_URL))
    .filter((line) => !line.startsWith("#"))
    .filter((line) => !ignoredLinePattern.test(line));

  const sentences = lines
    .flatMap((line) => line.split(/(?<=[.!?…])\s+/))
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 24);

  for (const sentence of sentences) {
    const opening = normalizeSentenceOpening(sentence);
    if (!opening || opening.split(" ").length < 2) continue;
    if (seen.has(opening) && !repeats.includes(opening)) repeats.push(opening);
    seen.set(opening, sentence);
  }

  return repeats;
}

function qualityScore({ id, text, requiredLabels = [], requiredSnippets = [], duplicate = false, checkRepeatedOpenings = false }) {
  const plain = stripMarkup(text);
  const missingLabels = requiredLabels.filter((label) => !plain.includes(label));
  const missingSnippets = requiredSnippets.filter((snippet) => !plain.includes(snippet));
  const hits = forbiddenHits(plain);
  const repeatedOpenings = checkRepeatedOpenings ? repeatedSentenceOpenings(text) : [];
  const mojibake = MOJIBAKE_PATTERN.test(plain);
  const lines = plain.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const lengthOk = plain.length >= 420 && plain.length <= 4200;
  const ctaOk = plain.includes(APPROVED_CTA_URL);
  const paragraphOk = lines.length >= 8;

  const categories = {
    accuracy: clampScore(10 - missingSnippets.length * 2 - (mojibake ? 5 : 0)),
    uniqueness: clampScore((duplicate ? 6 : 9.5) - repeatedOpenings.length * 1.5),
    tone: clampScore(9.2 - hits.length * 2),
    clarity: clampScore(9.4 - missingLabels.length * 0.8),
    premiumFeel: plain.includes("мягк") || plain.includes("ритуал") || plain.includes("притяжение") ? 9.2 : 8.4,
    usefulness: plain.includes("Совет") || plain.includes("Практика") || plain.includes("Ритуал") ? 9.2 : 8,
    safety: clampScore(10 - hits.length * 2.5),
    grammar: mojibake ? 4 : 9.2,
    ctaQuality: ctaOk ? 10 : 6,
    telegramReadability: lengthOk && paragraphOk ? 9.2 : 7.5,
  };
  const average = averageScore(Object.values(categories));
  const problems = [
    ...missingLabels.map((label) => `missing label: ${label}`),
    ...missingSnippets.map((snippet) => `missing snippet: ${snippet}`),
    ...hits.map((hit) => `forbidden pattern: ${hit}`),
    ...repeatedOpenings.map((opening) => `repeated sentence opening: ${opening}`),
  ];
  if (mojibake) problems.push("mojibake detected");
  if (!ctaOk) problems.push("approved CTA missing");
  if (!lengthOk) problems.push(`length outside target: ${plain.length}`);
  if (!paragraphOk) problems.push(`too few readable blocks: ${lines.length}`);
  if (duplicate) problems.push("duplicate body detected");

  return { id, average, categories, ok: average >= 8, problems };
}

function clampScore(value) {
  return Math.max(1, Math.min(10, Number(value.toFixed(1))));
}

function averageScore(values) {
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

function buildDailySamples(date) {
  const posts = ZODIAC_DAILY_CHANNELS.map((channel) => buildZodiacPost({ date, channelId: channel.id }));
  const signPosts = posts.filter((post) => post.type === "sign");
  const general = posts.find((post) => post.channelId === "zodiac-general");
  const problems = [];

  if (posts.length !== 13) problems.push(`daily network must generate 13 posts, got ${posts.length}`);
  if (!general) problems.push("daily general channel missing");
  for (const sign of SIGN_META) {
    const post = signPosts.find((item) => item.channelId === sign.slug);
    if (!post) {
      problems.push(`daily sign missing: ${sign.slug}`);
      continue;
    }
    if (!stripMarkup(post.text).includes(sign.ruName)) problems.push(`${sign.slug}: sign name missing`);
    if (!stripMarkup(post.text).includes(sign.range)) problems.push(`${sign.slug}: sign date range missing`);
  }

  const duplicates = uniqueProblems(signPosts.map((post) => ({ id: post.channelId, text: post.text })), "daily signs");
  problems.push(...duplicates);
  const duplicateIds = new Set(duplicates.flatMap((problem) => problem.match(/\b[a-z-]+\b/g) || []));

  const scores = posts.map((post) => qualityScore({
    id: `daily:${post.channelId}`,
    text: post.text,
    requiredLabels: post.channelId === "zodiac-general" ? DAILY_GENERAL_LABELS : DAILY_SIGN_LABELS,
    requiredSnippets: [APPROVED_CTA_URL],
    duplicate: duplicateIds.has(post.channelId),
    checkRepeatedOpenings: true,
  }));

  return { posts, signPosts, general, scores, problems };
}

function buildWeeklySamples(week) {
  const plan = generateWeeklyPosts(week);
  const problems = [];
  if (plan.posts.length !== 13) problems.push(`weekly network must generate 13 posts, got ${plan.posts.length}`);
  for (const post of plan.posts) {
    const existingErrors = validateWeeklyPostQuality(post);
    problems.push(...existingErrors.map((error) => `weekly:${post.slug}: ${error}`));
  }
  problems.push(...uniqueProblems(plan.posts.map((post) => ({ id: post.slug, text: post.text })), "weekly posts"));
  const scores = plan.posts.map((post) => qualityScore({
    id: `weekly:${post.slug}`,
    text: post.text,
    requiredLabels: WEEKLY_LABELS,
    requiredSnippets: [APPROVED_CTA_URL, plan.weekRange],
  }));
  return { plan, scores, problems };
}

function buildCompatibilitySamples() {
  const config = loadCompatibilityConfig();
  const configProblems = validateCompatibilityConfig(config);
  const samplePairIds = ["aries-libra", "taurus-scorpio", "gemini-sagittarius", "cancer-capricorn", "leo-aquarius", "virgo-pisces"];
  const samples = samplePairIds.map((pairId) => generateCompatibilityPost(findCompatibilityPair(pairId, config.pairs)));
  const allPosts = config.pairs.map((pair) => generateCompatibilityPost(pair));
  const duplicates = uniqueProblems(allPosts.map((post) => ({ id: post.pairId, text: post.text })), "compatibility posts");
  const scores = samples.map((post) => qualityScore({
    id: `compatibility:${post.pairId}`,
    text: post.text,
    requiredLabels: COMPATIBILITY_LABELS,
    requiredSnippets: [APPROVED_CTA_URL, "не обещает исход отношений"],
  }));
  return { config, samples, scores, problems: [...configProblems, ...duplicates] };
}

function buildTarotSamples(date) {
  const cards = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "config", "tarot-major-arcana.json"), "utf8"));
  const wanted = ["star", "magician", "temperance"];
  const samples = wanted.map((slug) => cards.find((card) => card.slug === slug)).filter(Boolean).map((card) => {
    const text = [
      `🃏 Карта дня — ${card.ruTitle}`,
      "",
      "Ключ:",
      card.dayMeaning,
      "",
      "В любви:",
      card.loveMeaning,
      "",
      "Тень:",
      "заметить перекос, но не делать из него приговор.",
      "",
      "Вопрос к себе:",
      `где сегодня ${card.keywords[0]} может стать спокойным выбором, а не ожиданием чуда?`,
      "",
      "Действие дня:",
      card.action,
      "",
      `Открыть карту дня в Mini App: ${APPROVED_CTA_URL}`,
    ].join("\n");
    return { id: `tarot:${card.slug}`, card, text };
  });
  const scores = samples.map((sample) => qualityScore({
    id: sample.id,
    text: sample.text,
    requiredLabels: ["Ключ:", "В любви:", "Тень:", "Вопрос к себе:", "Действие дня:"],
    requiredSnippets: [APPROVED_CTA_URL],
  }));
  const problems = [];
  if (cards.length !== 22) problems.push(`tarot dataset must contain 22 cards, got ${cards.length}`);
  for (const card of cards) {
    for (const field of ["id", "number", "slug", "ruTitle", "dayMeaning", "loveMeaning", "advice", "action", "imagePath"]) {
      if (!Object.prototype.hasOwnProperty.call(card, field) || card[field] === null || card[field] === "") {
        problems.push(`tarot card ${card.slug || card.id || "unknown"} missing ${field}`);
      }
    }
    const text = [card.ruTitle, card.dayMeaning, card.loveMeaning, card.advice, card.action].join("\n");
    if (MOJIBAKE_PATTERN.test(text)) problems.push(`tarot card ${card.slug} has mojibake`);
    for (const hit of forbiddenHits(text)) problems.push(`tarot card ${card.slug} forbidden pattern ${hit}`);
  }
  return { cards, samples, scores, problems, date };
}

function inspectLedgers() {
  const files = [
    "data/state/zodiac-publish-ledger.json",
    "data/state/zodiac-weekly-publish-ledger.json",
    "data/state/zodiac-compatibility-publish-ledger.json",
  ];
  const findings = [];
  for (const file of files) {
    const absolute = path.join(process.cwd(), file);
    if (!fs.existsSync(absolute)) {
      findings.push({ file, ok: true, entries: 0, warning: "ledger file missing; publish code creates it when needed" });
      continue;
    }
    const parsed = JSON.parse(fs.readFileSync(absolute, "utf8"));
    const entries = parsed.entries && typeof parsed.entries === "object" ? parsed.entries : {};
    const keys = Object.keys(entries);
    findings.push({ file, ok: keys.length === new Set(keys).size, entries: keys.length, duplicateKeys: keys.length - new Set(keys).size });
  }
  return findings;
}

function writeSamples({ daily, weekly, tarot, compatibility }) {
  fs.mkdirSync(SAMPLE_DIR, { recursive: true });

  fs.writeFileSync(
    path.join(SAMPLE_DIR, "daily-12-signs.md"),
    daily.signPosts.map((post) => `## ${post.channelName}\n\n${post.text}`).join("\n\n---\n\n"),
    "utf8",
  );
  fs.writeFileSync(
    path.join(SAMPLE_DIR, "general-channel-samples.md"),
    `## ${daily.general?.channelName || "General"}\n\n${daily.general?.text || ""}\n`,
    "utf8",
  );
  fs.writeFileSync(
    path.join(SAMPLE_DIR, "weekly-12-signs.md"),
    weekly.plan.posts.filter((post) => post.slug !== "zodiac-general").map((post) => `## ${post.slug}\n\n${post.text}`).join("\n\n---\n\n"),
    "utf8",
  );
  fs.writeFileSync(
    path.join(SAMPLE_DIR, "tarot-samples.md"),
    tarot.samples.map((sample) => `## ${sample.card.ruTitle}\n\n${sample.text}`).join("\n\n---\n\n"),
    "utf8",
  );
  fs.writeFileSync(
    path.join(SAMPLE_DIR, "compatibility-samples.md"),
    compatibility.samples.map((post) => `## ${post.pairId}\n\n${post.text}`).join("\n\n---\n\n"),
    "utf8",
  );
}

function isoWeekCode(dateKey) {
  const date = parseDateKey(dateKey);
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function collectScoreFailures(scoreGroups) {
  const allScores = scoreGroups.flat();
  const lowPosts = allScores.filter((score) => score.average < 8);
  const average = averageScore(allScores.map((score) => score.average));
  return { allScores, lowPosts, average, ok: lowPosts.length === 0 && average >= 8.5 };
}

function main() {
  const options = parseArgs();
  const daily = buildDailySamples(options.date);
  const weekly = buildWeeklySamples(options.week);
  const compatibility = buildCompatibilitySamples();
  const tarot = buildTarotSamples(options.date);
  const ledgerFindings = inspectLedgers();

  writeSamples({ daily, weekly, tarot, compatibility });

  const scoreSummary = collectScoreFailures([daily.scores, weekly.scores, compatibility.scores, tarot.scores]);
  const blockingScoreProblems = scoreSummary.allScores.flatMap((score) =>
    score.problems
      .filter((problem) => /forbidden pattern|repeated sentence opening|mojibake detected|approved CTA missing/i.test(problem))
      .map((problem) => `${score.id}: ${problem}`)
  );
  const problems = [
    ...daily.problems,
    ...weekly.problems,
    ...compatibility.problems,
    ...tarot.problems,
    ...blockingScoreProblems,
    ...scoreSummary.lowPosts.flatMap((score) => score.problems.map((problem) => `${score.id}: ${problem}`)),
  ];

  const report = {
    ok: problems.length === 0 && scoreSummary.ok,
    date: options.date,
    week: options.week,
    generatedAt: new Date().toISOString(),
    liveTelegramSends: 0,
    telegramApiCalls: 0,
    productionLedgerWrites: 0,
    samplesDir: SAMPLE_DIR,
    coverage: {
      dailyPosts: daily.posts.length,
      weeklyPosts: weekly.plan.posts.length,
      compatibilityConfigPairs: compatibility.config.pairs.length,
      compatibilitySamples: compatibility.samples.length,
      tarotCards: tarot.cards.length,
      tarotSamples: tarot.samples.length,
    },
    scoreAverage: scoreSummary.average,
    scores: scoreSummary.allScores,
    ledgerFindings,
    problems,
  };

  fs.mkdirSync(REPORT_ROOT, { recursive: true });
  const reportPath = path.join(REPORT_ROOT, `report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(REPORT_ROOT, "latest-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log("Zodiac content QA");
  console.log(`Date                  : ${options.date}`);
  console.log(`Week                  : ${options.week}`);
  console.log(`Daily posts           : ${daily.posts.length}/13`);
  console.log(`Weekly posts          : ${weekly.plan.posts.length}/13`);
  console.log(`Compatibility pairs   : ${compatibility.config.pairs.length}`);
  console.log(`Tarot cards           : ${tarot.cards.length}/22`);
  console.log(`Average score         : ${scoreSummary.average}/10`);
  console.log(`Sample output folder  : ${SAMPLE_DIR}`);
  console.log(`JSON report           : ${reportPath}`);
  console.log("Telegram API calls    : 0");
  console.log("Production ledger writes: 0");

  if (!report.ok) {
    console.error("Zodiac content QA: FAIL");
    for (const problem of problems) console.error(`- ${problem}`);
    if (!scoreSummary.ok) console.error(`- score target missed: average=${scoreSummary.average}, lowPosts=${scoreSummary.lowPosts.length}`);
    process.exit(1);
  }

  console.log("Zodiac content QA: PASS");
}

main();
