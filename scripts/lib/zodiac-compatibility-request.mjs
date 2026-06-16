import { findCompatibilityPair, SIGNS } from "./zodiac-compatibility-pipeline.mjs";

export const COMPATIBILITY_MODES = new Set(["fast", "personal", "precise"]);
export const COMPATIBILITY_GENDERS = new Set(["male", "female", "unspecified"]);
export const UNKNOWN_BIRTH_TIME_NOTE = "Расчёт выполнен без точного времени рождения. Некоторые детали могут быть приблизительными.";

const SIGN_BY_SLUG = new Map(SIGNS.map((sign) => [sign.slug, sign]));

/**
 * @typedef {"aries"|"taurus"|"gemini"|"cancer"|"leo"|"virgo"|"libra"|"scorpio"|"sagittarius"|"capricorn"|"aquarius"|"pisces"} ZodiacSignSlug
 * @typedef {"male"|"female"|"unspecified"} CompatibilityGender
 * @typedef {"fast"|"personal"|"precise"} CompatibilitySource
 * @typedef {Object} CompatibilityPerson
 * @property {ZodiacSignSlug} signSlug
 * @property {CompatibilityGender} gender
 * @property {string=} birthDate
 * @property {boolean} knowsBirthTime
 * @property {string=} birthTime
 * @property {string=} birthCity
 *
 * @typedef {Object} CompatibilityRequest
 * @property {CompatibilitySource} source
 * @property {CompatibilityPerson} first
 * @property {CompatibilityPerson} second
 */

export function normalizeCompatibilityMode(value) {
  const mode = String(value || "fast").trim().toLowerCase();
  if (!COMPATIBILITY_MODES.has(mode)) throw new Error(`Unknown compatibility mode: ${value}`);
  return mode;
}

export function normalizeCompatibilityGender(value) {
  const gender = String(value || "unspecified").trim().toLowerCase();
  if (!COMPATIBILITY_GENDERS.has(gender)) throw new Error(`Unknown compatibility gender: ${value}`);
  return gender;
}

export function normalizeCompatibilitySign(value) {
  const slug = String(value || "").trim().toLowerCase();
  if (!SIGN_BY_SLUG.has(slug)) throw new Error(`Unknown zodiac sign: ${value}`);
  return slug;
}

export function createCompatibilityPerson(input = {}) {
  return {
    signSlug: normalizeCompatibilitySign(input.signSlug),
    gender: normalizeCompatibilityGender(input.gender),
    birthDate: normalizeOptionalString(input.birthDate),
    knowsBirthTime: Boolean(input.knowsBirthTime),
    birthTime: normalizeOptionalString(input.birthTime),
    birthCity: normalizeOptionalString(input.birthCity),
  };
}

export function createCompatibilityRequest({ source = "fast", first, second }) {
  const request = {
    source: normalizeCompatibilityMode(source),
    first: createCompatibilityPerson(first),
    second: createCompatibilityPerson(second),
  };
  const validation = validateCompatibilityRequest(request);
  if (!validation.ok) {
    throw new Error(`Compatibility request invalid: ${validation.errors.join("; ")}`);
  }
  return request;
}

export function createFastCompatibilityRequest(firstSign, secondSign) {
  return createCompatibilityRequest({
    source: "fast",
    first: { signSlug: firstSign, gender: "unspecified", knowsBirthTime: false },
    second: { signSlug: secondSign, gender: "unspecified", knowsBirthTime: false },
  });
}

export function validateCompatibilityRequest(request) {
  const errors = [];
  if (!request || typeof request !== "object") errors.push("request must be an object.");
  if (!COMPATIBILITY_MODES.has(request?.source)) errors.push("source must be fast, personal, or precise.");
  validatePerson(request?.first, "first", request?.source, errors);
  validatePerson(request?.second, "second", request?.source, errors);
  return { ok: errors.length === 0, errors };
}

export function getCompatibilityPairForRequest(request) {
  return findCompatibilityPair(`${request.first.signSlug}-${request.second.signSlug}`);
}

export function renderCompatibilityResult(request) {
  const pair = getCompatibilityPairForRequest(request);
  const first = getSign(request.first.signSlug);
  const second = getSign(request.second.signSlug);
  const title = `${first.emoji} ${first.nameRu}${genderSuffix(request.first.gender)} + ${second.emoji} ${second.nameRu}${genderSuffix(request.second.gender)}`;
  const heading = request.source === "fast" ? "Совместимость знаков зодиака" : "Совместимость по дате рождения";
  const unknownTimeNote = request.source === "precise" && (!request.first.knowsBirthTime || !request.second.knowsBirthTime)
    ? UNKNOWN_BIRTH_TIME_NOTE
    : null;

  return {
    canonicalPairId: pair.pairId,
    displayPairId: `${request.first.signSlug}-${request.second.signSlug}`,
    source: request.source,
    unknownTimeNote,
    text: [
      `<b>${escapeHtml(title)}</b>`,
      "",
      `<b>${escapeHtml(heading)}</b>`,
      "",
      `🔥 <b>Притяжение:</b> ${escapeHtml(pair.shortTheme)}.`,
      `💬 <b>Общение:</b> ${escapeHtml(buildCommunicationLine(request))}`,
      `❤️ <b>В любви:</b> ${escapeHtml(buildLoveLine(pair.compatibilityScore))}`,
      `🏠 <b>Быт и ритм:</b> ${escapeHtml(buildHouseholdLine(request))}`,
      `⚠️ <b>Слабое место:</b> ${escapeHtml(buildWeakSpotLine(request))}`,
      "",
      "<b>Совет паре:</b>",
      escapeHtml(buildAdviceLine(request)),
      "",
      "<b>Итог:</b>",
      escapeHtml(buildConclusionLine(pair.compatibilityScore, request.source)),
      ...(unknownTimeNote ? ["", escapeHtml(unknownTimeNote)] : []),
    ].join("\n"),
  };
}

function validatePerson(person, label, source, errors) {
  if (!person || typeof person !== "object") {
    errors.push(`${label} person is required.`);
    return;
  }
  if (!SIGN_BY_SLUG.has(person.signSlug)) errors.push(`${label}.signSlug is invalid.`);
  if (!COMPATIBILITY_GENDERS.has(person.gender)) errors.push(`${label}.gender is invalid.`);
  if (source === "personal" || source === "precise") {
    if (!isDateString(person.birthDate)) errors.push(`${label}.birthDate is required as YYYY-MM-DD.`);
  }
  if (source === "precise" && person.knowsBirthTime) {
    if (!isTimeString(person.birthTime)) errors.push(`${label}.birthTime is required as HH:mm when exact time is known.`);
  }
}

function getSign(slug) {
  const sign = SIGN_BY_SLUG.get(slug);
  if (!sign) throw new Error(`Unknown zodiac sign: ${slug}`);
  return sign;
}

function normalizeOptionalString(value) {
  const normalized = String(value || "").trim();
  return normalized || undefined;
}

function isDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function isTimeString(value) {
  return /^\d{2}:\d{2}$/.test(String(value || ""));
}

function genderSuffix(gender) {
  if (gender === "male") return " мужчина";
  if (gender === "female") return " женщина";
  return "";
}

function buildCommunicationLine(request) {
  if (request.source === "fast") return "важно сверять темп и не превращать различия в спор о правоте";
  return "даты рождения добавляют личный ритм, поэтому паре полезны ясные договорённости и мягкий тон";
}

function buildLoveLine(score) {
  if (score >= 85) return "есть сильное притяжение, если оба оставляют место для уважения и личного пространства";
  if (score >= 70) return "чувства раскрываются постепенно: меньше проверок, больше прямых просьб";
  return "романтика требует терпения, честности и отказа от игры в угадывание";
}

function buildHouseholdLine(request) {
  if (request.source === "precise") return "точные данные помогают лучше увидеть бытовой ритм, но решение всё равно держится на привычках пары";
  if (request.source === "personal") return "личные даты помогают точнее подобрать темп, однако бытовые правила лучше проговаривать напрямую";
  return "в быту важнее не идеальная совместимость, а понятные правила и общий режим";
}

function buildWeakSpotLine(request) {
  if (request.source === "precise" && (!request.first.knowsBirthTime || !request.second.knowsBirthTime)) {
    return "часть деталей остаётся приблизительной без точного времени рождения";
  }
  return "слабым местом становятся молчаливые ожидания и попытка переделать партнёра";
}

function buildAdviceLine(request) {
  if (request.source === "fast") return "Начните с простого: выберите один общий ритм на неделю и проверьте, где вам легче договориться.";
  if (request.source === "personal") return "Сравнивайте не только знаки, но и реальные потребности: как вы отдыхаете, спорите и просите поддержки.";
  return "Используйте точные данные как карту, а не приговор: обсуждайте выводы спокойно и проверяйте их жизнью.";
}

function buildConclusionLine(score, source) {
  const base = score >= 85 ? "пара перспективная" : score >= 70 ? "пара рабочая при внимании к диалогу" : "паре нужен бережный темп";
  return source === "fast" ? `${base}; для большей точности можно перейти в личный режим.` : `${base}; результат не сохраняет личные данные.`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
