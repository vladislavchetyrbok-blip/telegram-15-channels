import fs from "fs";
import path from "path";
import process from "process";
import { findCompatibilityPair, SIGNS } from "./zodiac-compatibility-pipeline.mjs";

export const COMPATIBILITY_MODES = new Set(["fast", "personal", "precise"]);
export const COMPATIBILITY_GENDERS = new Set(["male", "female", "unspecified"]);
export const UNKNOWN_BIRTH_TIME_NOTE = "Расчёт выполнен без точного времени рождения. Некоторые детали могут быть приблизительными.";
export const EXACT_BIRTH_TIME_CITY_NOTE = "Расчёт выполнен с учётом времени и города рождения.";
export const CITY_SELECTION_WARNING = "Выберите город из списка, чтобы расчёт был точнее.";
export const CITY_CATALOG_PATH = path.resolve(process.cwd(), "data/config/zodiac-city-catalog.json");

const SIGN_BY_SLUG = new Map(SIGNS.map((sign) => [sign.slug, sign]));

const ATTRACTION_LINES = [
  "есть живая искра, но ей нужен мягкий темп",
  "интерес усиливается через уважение к личному пространству",
  "притяжение ярче, когда оба не соревнуются за внимание",
  "пара раскрывается через игру, любопытство и честность",
];

const COMMUNICATION_LINES = [
  "лучше работают короткие договорённости и ясные просьбы",
  "важно не додумывать мотивы, а задавать прямые вопросы",
  "разговор становится легче, если сначала признать разные темпы",
  "сильная сторона пары — обмен идеями без давления",
];

const LOVE_LINES = [
  "тепло растёт через маленькие регулярные знаки внимания",
  "романтика сильнее там, где меньше проверок и сравнений",
  "чувства раскрываются через доверие и спокойную инициативу",
  "важно оставлять место и для близости, и для свободы",
];

const HOUSEHOLD_LINES = [
  "общий режим лучше согласовать заранее",
  "быт станет легче, если разделить зоны ответственности",
  "ритм пары держится на простых повторяемых привычках",
  "домашние вопросы стоит решать фактами, а не намёками",
];

const WEAK_SPOT_LINES = [
  "молчаливые ожидания быстро превращаются в напряжение",
  "разный темп решений может восприниматься как равнодушие",
  "попытка переделать партнёра снижает доверие",
  "излишняя резкость в разговоре может закрыть диалог",
];

const ADVICE_LINES = [
  "выберите один общий фокус на ближайшие дни и проверьте, где вам легче договориться",
  "проговорите ожидания простыми словами и не превращайте разговор в экзамен",
  "сравнивайте не только знаки, но и реальные привычки: отдых, спор, просьбы о поддержке",
  "держите баланс между инициативой и уважением к личному пространству",
];

/**
 * @typedef {"aries"|"taurus"|"gemini"|"cancer"|"leo"|"virgo"|"libra"|"scorpio"|"sagittarius"|"capricorn"|"aquarius"|"pisces"} ZodiacSignSlug
 * @typedef {"male"|"female"|"unspecified"} CompatibilityGender
 * @typedef {"fast"|"personal"|"precise"} CompatibilitySource
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

export function loadCompatibilityCityCatalog() {
  const parsed = JSON.parse(fs.readFileSync(CITY_CATALOG_PATH, "utf8"));
  return Array.isArray(parsed.cities) ? parsed.cities : [];
}

export function searchCompatibilityCities(query) {
  const normalized = normalizeSearch(query);
  const cities = loadCompatibilityCityCatalog();
  if (!normalized) return cities.slice(0, 5);
  return cities.filter((city) => {
    const haystack = [city.nameRu, city.nameEn, city.countryRu, city.countryCode, ...(city.aliases ?? [])].map(normalizeSearch);
    return haystack.some((item) => item.includes(normalized));
  });
}

export function resolveCompatibilityCity(query) {
  const normalized = normalizeSearch(query);
  if (!normalized) return null;
  return loadCompatibilityCityCatalog().find((city) => {
    const exactValues = [city.cityId, city.nameRu, city.nameEn, ...(city.aliases ?? [])].map(normalizeSearch);
    return exactValues.includes(normalized);
  }) ?? null;
}

export function parseCompatibilityBirthDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return { ok: false, error: "birthDate is required." };
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const dotMatch = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  const year = isoMatch ? Number(isoMatch[1]) : dotMatch ? Number(dotMatch[3]) : NaN;
  const month = isoMatch ? Number(isoMatch[2]) : dotMatch ? Number(dotMatch[2]) : NaN;
  const day = isoMatch ? Number(isoMatch[3]) : dotMatch ? Number(dotMatch[1]) : NaN;

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return { ok: false, error: "birthDate must be DD.MM.YYYY or YYYY-MM-DD." };
  }
  if (year < 1900 || year > 2100) return { ok: false, error: "birthDate year is outside supported range." };
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return { ok: false, error: "birthDate is invalid." };
  }

  return {
    ok: true,
    day,
    month,
    year,
    iso: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    signSlug: signFromDate(day, month),
  };
}

export function createCompatibilityPerson(input = {}, source = "fast") {
  const normalizedSource = normalizeCompatibilityMode(source);
  const parsedBirthDate = parseCompatibilityBirthDate(input.birthDate);
  const hasValidDateForMode = normalizedSource !== "fast" && parsedBirthDate.ok;
  const signSlug = hasValidDateForMode ? parsedBirthDate.signSlug : normalizeCompatibilitySign(input.signSlug);
  const birthCityQuery = normalizeOptionalString(input.birthCity);
  const selectedCity = birthCityQuery ? resolveCompatibilityCity(birthCityQuery) : null;

  return {
    signSlug,
    gender: normalizeCompatibilityGender(input.gender),
    birthDate: parsedBirthDate.ok ? parsedBirthDate.iso : normalizeOptionalString(input.birthDate),
    birthDateInput: normalizeOptionalString(input.birthDate),
    birthDateParsed: parsedBirthDate,
    knowsBirthTime: Boolean(input.knowsBirthTime),
    birthTime: normalizeOptionalString(input.birthTime),
    birthCity: selectedCity ? cityLabel(selectedCity) : birthCityQuery,
    cityId: selectedCity?.cityId ?? null,
    selectedCity,
  };
}

export function createCompatibilityRequest({ source = "fast", first, second }) {
  const normalizedSource = normalizeCompatibilityMode(source);
  const request = {
    source: normalizedSource,
    first: createCompatibilityPerson(first, normalizedSource),
    second: createCompatibilityPerson(second, normalizedSource),
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
  return { ok: errors.length === 0, errors, warnings: collectCompatibilityWarnings(request) };
}

export function collectCompatibilityWarnings(request) {
  const warnings = [];
  if (request?.source === "precise") {
    collectPersonWarnings(request.first, "first", warnings);
    collectPersonWarnings(request.second, "second", warnings);
  }
  return warnings;
}

export function getCompatibilityPairForRequest(request) {
  return findCompatibilityPair(`${request.first.signSlug}-${request.second.signSlug}`);
}

export function renderCompatibilityResult(request) {
  const pair = getCompatibilityPairForRequest(request);
  const first = getSign(request.first.signSlug);
  const second = getSign(request.second.signSlug);
  const seedInput = buildSeedInput(request);
  const seed = hashSeed(seedInput);
  const scores = buildScores(pair.compatibilityScore, request.source, seed);
  const title = `${first.emoji} ${first.nameRu}${genderSuffix(request.first.gender)} + ${second.emoji} ${second.nameRu}${genderSuffix(request.second.gender)}`;
  const heading = getModeLabel(request.source);
  const unknownTimeNote = request.source === "precise" && (!request.first.knowsBirthTime || !request.second.knowsBirthTime)
    ? UNKNOWN_BIRTH_TIME_NOTE
    : null;
  const exactTimeCityNote = request.source === "precise" && !unknownTimeNote && request.first.selectedCity && request.second.selectedCity
    ? EXACT_BIRTH_TIME_CITY_NOTE
    : null;
  const warnings = collectCompatibilityWarnings(request);

  return {
    canonicalPairId: pair.pairId,
    displayPairId: `${request.first.signSlug}-${request.second.signSlug}`,
    source: request.source,
    seedInput,
    resultSignature: `compat-${hashSeed(seedInput).toString(16)}`,
    unknownTimeNote,
    exactTimeCityNote,
    warnings,
    scores,
    text: [
      `<b>${escapeHtml(title)}</b>`,
      "",
      `<b>${escapeHtml(heading)}</b>`,
      "",
      `Общий балл: <b>${scores.total}%</b>`,
      `🔥 <b>Притяжение:</b> ${scores.attraction}% — ${escapeHtml(pick(ATTRACTION_LINES, seed, 1))}.`,
      `💬 <b>Общение:</b> ${scores.communication}% — ${escapeHtml(pick(COMMUNICATION_LINES, seed, 2))}.`,
      `❤️ <b>В любви:</b> ${scores.love}% — ${escapeHtml(pick(LOVE_LINES, seed, 3))}.`,
      `🏠 <b>Быт и ритм:</b> ${scores.household}% — ${escapeHtml(pick(HOUSEHOLD_LINES, seed, 4))}.`,
      `⚠️ <b>Слабое место:</b> ${escapeHtml(pick(WEAK_SPOT_LINES, seed, 5))}.`,
      "",
      "<b>Совет паре:</b>",
      escapeHtml(pick(ADVICE_LINES, seed, 6)),
      "",
      "<b>Итог:</b>",
      escapeHtml(buildConclusionLine(scores.total, request.source)),
      ...(unknownTimeNote ? ["", escapeHtml(unknownTimeNote)] : []),
      ...(exactTimeCityNote ? ["", escapeHtml(exactTimeCityNote)] : []),
      ...(warnings.length > 0 ? ["", ...warnings.map((warning) => escapeHtml(warning))] : []),
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
    if (!person.birthDateParsed?.ok) errors.push(`${label}.birthDate must be a valid DD.MM.YYYY or YYYY-MM-DD date.`);
  }
  if (source === "precise" && person.knowsBirthTime) {
    if (!isTimeString(person.birthTime)) errors.push(`${label}.birthTime is required as HH:mm when exact time is known.`);
  }
}

function collectPersonWarnings(person, label, warnings) {
  if (!person?.knowsBirthTime) return;
  if (!person.birthCity) {
    warnings.push(`${label}: ${CITY_SELECTION_WARNING}`);
    return;
  }
  if (!person.selectedCity) warnings.push(`${label}: ${CITY_SELECTION_WARNING}`);
}

function buildSeedInput(request) {
  return [
    request.source,
    request.first.gender,
    request.source === "fast" ? "" : request.first.birthDate,
    request.first.signSlug,
    request.source === "precise" && request.first.knowsBirthTime ? request.first.birthTime ?? "" : "",
    request.source === "precise" && request.first.knowsBirthTime ? request.first.cityId ?? "" : "",
    request.second.gender,
    request.source === "fast" ? "" : request.second.birthDate,
    request.second.signSlug,
    request.source === "precise" && request.second.knowsBirthTime ? request.second.birthTime ?? "" : "",
    request.source === "precise" && request.second.knowsBirthTime ? request.second.cityId ?? "" : "",
  ].join("|");
}

function buildScores(pairScore, source, seed) {
  const modeBoost = source === "fast" ? 0 : source === "personal" ? 3 : 5;
  const total = clampScore(pairScore + modeBoost + variance(seed, 0, 15) - 7);
  return {
    total,
    attraction: clampScore(total + variance(seed, 1, 17) - 8),
    communication: clampScore(total + variance(seed, 2, 19) - 9),
    love: clampScore(total + variance(seed, 3, 21) - 10),
    household: clampScore(total + variance(seed, 4, 17) - 8),
  };
}

function getModeLabel(source) {
  if (source === "fast") return "Быстрый расчёт";
  if (source === "personal") return "Персональный расчёт";
  return "Точный расчёт";
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

function isTimeString(value) {
  return /^\d{2}:\d{2}$/.test(String(value || ""));
}

function signFromDate(day, month) {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius";
  return "pisces";
}

function genderSuffix(gender) {
  if (gender === "male") return " мужчина";
  if (gender === "female") return " женщина";
  return "";
}

function normalizeSearch(value) {
  return String(value || "").trim().toLowerCase().replace(/ё/g, "е");
}

function cityLabel(city) {
  return `${city.nameRu}, ${city.countryRu}`;
}

function hashSeed(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function variance(seed, offset, spread) {
  return hashSeed(`${seed}:${offset}`) % spread;
}

function clampScore(value) {
  return Math.max(45, Math.min(98, value));
}

function pick(items, seed, offset) {
  return items[variance(seed, offset, items.length)];
}

function buildConclusionLine(score, source) {
  const base = score >= 84 ? "сильный потенциал" : score >= 70 ? "хороший потенциал при внимании к диалогу" : "бережный потенциал, которому нужен спокойный темп";
  if (source === "fast") return `${base}; совместимость хорошая, если вы поддерживаете спокойный диалог и уважаете личное пространство.`;
  if (source === "personal") return `${base}; отношениям помогает внимание к ритму друг друга, честные просьбы и регулярные знаки тепла.`;
  return `${base}; у пары хороший потенциал, если оба готовы слышать друг друга и не превращать разницу характеров в спор.`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
