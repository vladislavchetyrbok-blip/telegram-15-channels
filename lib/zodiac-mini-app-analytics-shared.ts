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
  "couple_horoscope_viewed",
  "relationship_map_viewed",
  "lucky_day_clicked",
  "vip_clicked",
  "giveaway_clicked",
  "message_helper_used",
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
const sections = new Set([
  "today",
  "week",
  "compatibility",
  "lucky_days",
  "natal_chart",
  "couple_horoscope",
  "relationship_map",
  "vip",
  "giveaways",
  "message_helper",
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
