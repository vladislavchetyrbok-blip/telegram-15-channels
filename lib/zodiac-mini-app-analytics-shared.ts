export const ZODIAC_ANALYTICS_EVENTS = [
  "app_open",
  "sign_selected",
  "section_open_today",
  "section_open_week",
  "section_open_compatibility",
  "section_open_lucky_days",
  "section_open_natal_chart",
  "section_open_couple_horoscope",
  "section_open_relationship_map",
  "section_open_vip",
  "section_open_giveaways",
  "compatibility_calculated",
  "compatibility_mode_fast",
  "compatibility_mode_personal",
  "compatibility_mode_precise",
  "name_resonance_shown",
  "natal_chart_started",
  "natal_chart_completed",
  "natal_chart_opened",
  "natal_chart_result_viewed",
  "natal_chart_section_opened",
  "natal_chart_vip_free_opened",
  "chinese_horoscope_opened",
  "chinese_horoscope_result_viewed",
  "zodiac_stones_opened",
  "zodiac_stones_sign_viewed",
  "name_profile_opened",
  "name_profile_result_viewed",
  "couple_horoscope_viewed",
  "relationship_map_viewed",
  "mental_map_viewed",
  "relationship_map_category_opened",
  "lucky_day_clicked",
  "vip_clicked",
  "vip_opened",
  "vip_free_access_viewed",
  "vip_feature_opened",
  "vip_future_subscription_clicked",
  "giveaway_clicked",
  "giveaway_locked_viewed",
  "message_helper_used",
  "numerology_opened",
  "numerology_result_viewed",
  "angel_numbers_opened",
  "angel_number_viewed",
  "lunar_calendar_opened",
  "daily_talisman_opened",
  "dream_dictionary_opened",
  "dream_symbol_viewed",
  "gift_by_sign_opened",
  "name_compatibility_opened",
  "name_compatibility_result_viewed",
  "archetype_opened",
  "archetype_result_viewed",
  "hub_category_opened",
  "mystic_category_opened",
] as const;

export type ZodiacAnalyticsEventName = (typeof ZODIAC_ANALYTICS_EVENTS)[number];

export type ZodiacAnalyticsMode = "fast" | "personal" | "precise";
export type ZodiacAnalyticsScoreTier = "strong" | "good" | "medium" | "difficult" | "tense";

export interface ZodiacAnalyticsPayload {
  dateKey?: string;
  section?: string;
  sign?: string;
  mode?: ZodiacAnalyticsMode;
  source?: string;
  startappType?: string;
  sessionId?: string;
  firstSign?: string;
  secondSign?: string;
  scoreTier?: ZodiacAnalyticsScoreTier;
  relationshipMode?: string;
  category?: string;
  hasBirthDate?: boolean;
  hasBirthTime?: boolean;
  hasBirthCity?: boolean;
  timeKnown?: boolean;
  hasName?: boolean;
  hasSecondName?: boolean;
  featureKey?: string;
  selectedPresetKey?: string;
  patternType?: string;
  freeVipActive?: boolean;
}

export interface SanitizedZodiacAnalyticsEvent extends ZodiacAnalyticsPayload {
  event: ZodiacAnalyticsEventName;
  timestamp: string;
  dateKey: string;
}

export const ZODIAC_ANALYTICS_REQUIRED_ENV = ["ZODIAC_ANALYTICS_REDIS_URL", "ZODIAC_ANALYTICS_REDIS_TOKEN"] as const;

const zodiacAnalyticsEventSet = new Set<string>(ZODIAC_ANALYTICS_EVENTS);

const zodiacSignSlugs = new Set([
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
]);

const modes = new Set(["fast", "personal", "precise"]);
const scoreTiers = new Set(["strong", "good", "medium", "difficult", "tense"]);
const relationshipModes = new Set(["love", "friendship", "work", "family", "passion", "reconciliation"]);
const patternTypes = new Set(["repeated", "mirror", "amplified", "custom", "fallback"]);
const sections = new Set([
  "today",
  "week",
  "compatibility",
  "lucky_days",
  "natal_chart",
  "chinese_horoscope",
  "zodiac_stones",
  "name_profile",
  "numerology",
  "angel_numbers",
  "lunar_calendar",
  "daily_talisman",
  "dream_dictionary",
  "gift_by_sign",
  "name_compatibility",
  "archetype",
  "couple_horoscope",
  "relationship_map",
  "couple_calendar",
  "reconciliation",
  "vip",
  "giveaways",
  "message_helper",
  "mystic",
  "hub",
]);

export function isAllowedZodiacAnalyticsEvent(value: unknown): value is ZodiacAnalyticsEventName {
  return typeof value === "string" && zodiacAnalyticsEventSet.has(value);
}

export function sanitizeZodiacAnalyticsPayload(input: unknown): ZodiacAnalyticsPayload {
  const raw = isRecord(input) ? input : {};
  const payload: ZodiacAnalyticsPayload = {};
  const dateKey = sanitizeDateKey(raw.dateKey);
  const section = sanitizeEnum(raw.section, sections);
  const sign = sanitizeSign(raw.sign);
  const mode = sanitizeEnum(raw.mode, modes) as ZodiacAnalyticsMode | undefined;
  const source = sanitizeToken(raw.source, 48);
  const startappType = sanitizeToken(raw.startappType, 48);
  const sessionId = sanitizeToken(raw.sessionId, 80);
  const firstSign = sanitizeSign(raw.firstSign);
  const secondSign = sanitizeSign(raw.secondSign);
  const scoreTier = sanitizeEnum(raw.scoreTier, scoreTiers) as ZodiacAnalyticsScoreTier | undefined;
  const relationshipMode = sanitizeEnum(raw.relationshipMode, relationshipModes);
  const category = sanitizeToken(raw.category, 64);
  const hasBirthDate = sanitizeBoolean(raw.hasBirthDate);
  const hasBirthTime = sanitizeBoolean(raw.hasBirthTime);
  const hasBirthCity = sanitizeBoolean(raw.hasBirthCity);
  const timeKnown = sanitizeBoolean(raw.timeKnown);
  const hasName = sanitizeBoolean(raw.hasName);
  const hasSecondName = sanitizeBoolean(raw.hasSecondName);
  const featureKey = sanitizeToken(raw.featureKey, 64);
  const selectedPresetKey = sanitizeToken(raw.selectedPresetKey, 64);
  const patternType = sanitizeEnum(raw.patternType, patternTypes);
  const freeVipActive = sanitizeBoolean(raw.freeVipActive);

  if (dateKey) payload.dateKey = dateKey;
  if (section) payload.section = section;
  if (sign) payload.sign = sign;
  if (mode) payload.mode = mode;
  if (source) payload.source = source;
  if (startappType) payload.startappType = startappType;
  if (sessionId) payload.sessionId = sessionId;
  if (firstSign) payload.firstSign = firstSign;
  if (secondSign) payload.secondSign = secondSign;
  if (scoreTier) payload.scoreTier = scoreTier;
  if (relationshipMode) payload.relationshipMode = relationshipMode;
  if (category) payload.category = category;
  if (typeof hasBirthDate === "boolean") payload.hasBirthDate = hasBirthDate;
  if (typeof hasBirthTime === "boolean") payload.hasBirthTime = hasBirthTime;
  if (typeof hasBirthCity === "boolean") payload.hasBirthCity = hasBirthCity;
  if (typeof timeKnown === "boolean") payload.timeKnown = timeKnown;
  if (typeof hasName === "boolean") payload.hasName = hasName;
  if (typeof hasSecondName === "boolean") payload.hasSecondName = hasSecondName;
  if (featureKey) payload.featureKey = featureKey;
  if (selectedPresetKey) payload.selectedPresetKey = selectedPresetKey;
  if (patternType) payload.patternType = patternType;
  if (typeof freeVipActive === "boolean") payload.freeVipActive = freeVipActive;

  return payload;
}

export function buildSanitizedZodiacAnalyticsEvent(
  event: ZodiacAnalyticsEventName,
  payload: unknown,
  fallbackDateKey: string,
  timestamp = new Date().toISOString(),
): SanitizedZodiacAnalyticsEvent {
  const sanitized = sanitizeZodiacAnalyticsPayload(payload);
  return {
    ...sanitized,
    event,
    timestamp,
    dateKey: sanitized.dateKey ?? fallbackDateKey,
  };
}

export function zodiacAnalyticsScoreTier(score: number): ZodiacAnalyticsScoreTier {
  if (score >= 85) return "strong";
  if (score >= 70) return "good";
  if (score >= 55) return "medium";
  if (score >= 40) return "difficult";
  return "tense";
}

export function zodiacAnalyticsStartappType(startParam?: string | null) {
  if (!startParam) return "none";
  if (startParam === "compat") return "compat_general";
  if (/^compat_[a-z]+$/.test(startParam)) return "compat_sign";
  return "other";
}

function sanitizeDateKey(value: unknown) {
  if (typeof value !== "string") return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function sanitizeSign(value: unknown) {
  if (typeof value !== "string") return undefined;
  const normalized = value.toLowerCase();
  return zodiacSignSlugs.has(normalized) ? normalized : undefined;
}

function sanitizeEnum(value: unknown, allowed: Set<string>) {
  if (typeof value !== "string") return undefined;
  return allowed.has(value) ? value : undefined;
}

function sanitizeToken(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().replace(/[^A-Za-z0-9_.:-]/g, "_").slice(0, maxLength);
  return normalized || undefined;
}

function sanitizeBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
