import type {
  ZodiacProfileSyncPayload,
  ZodiacProfileSyncValidationResult,
  ZodiacSyncedRetentionItem,
} from "./zodiac-profile-sync-types";

export const ZODIAC_PROFILE_SYNC_MAX_ITEMS = 10;

const allowedItemFields = new Set([
  "id",
  "featureKey",
  "section",
  "sign",
  "firstSign",
  "secondSign",
  "mode",
  "tier",
  "scoreTier",
  "label",
  "timestamp",
]);

const blockedFieldNames = new Set([
  "name",
  "firstName",
  "secondName",
  "birthDate",
  "birthTime",
  "birthCity",
  "city",
  "cityId",
  "cityQuery",
  "selectedCityId",
  "question",
  "intention",
  "feedback",
  "feedbackText",
  "rawFeedback",
  "rawQuestion",
  "rawIntention",
  "rawResult",
  "resultText",
  "rawResultText",
  "generatedText",
  "message",
  "messageText",
  "phone",
  "phoneNumber",
  "contactPhone",
  "initData",
  "initDataUnsafe",
]);

const forbiddenValuePatterns = [
  /\b\d{4}-\d{2}-\d{2}\b/g,
  /\b\d{2}\.\d{2}\.\d{4}\b/g,
  /\b\d{1,2}:\d{2}\b/g,
  /\bDnipro\b/gi,
  /\bDnepr\b/gi,
  /\bKyiv\b/gi,
  /\bKiev\b/gi,
  /\+?\d[\d\s().-]{8,}\d/g,
  /\bTelegram WebApp initData\b/gi,
];

const forbiddenTextFragments = [
  "\u0427\u0442\u043e \u043c\u043d\u0435 \u0432\u044b\u0431\u0440\u0430\u0442\u044c?",
  "\u0425\u043e\u0447\u0443 \u0441\u043f\u043e\u043a\u043e\u0439\u0441\u0442\u0432\u0438\u044f",
  "\u0442\u0435\u0441\u0442\u043e\u0432\u044b\u0439 \u043b\u0438\u0447\u043d\u044b\u0439 \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439",
  "raw generated result",
  "\u0412\u043b\u0430\u0434\u0438\u0441\u043b\u0430\u0432",
  "RAW_INIT_DATA_SHOULD_NOT_SURVIVE",
];

export function sanitizeZodiacProfileSyncPayload(
  input: unknown,
  options: { nowIso?: string } = {},
): ZodiacProfileSyncValidationResult {
  const strippedFields: string[] = [];
  const warnings: string[] = [];
  const nowIso = normalizeTimestamp(options.nowIso) ?? new Date().toISOString();

  if (!isRecord(input)) {
    return {
      ok: false,
      status: "validation_failed",
      reason: "Profile sync payload must be an object.",
      strippedFields,
      warnings,
    };
  }

  collectUnknownFields(input, new Set(["syncVersion", "history", "favorites", "updatedAt"]), "payload", strippedFields);
  collectBlockedFields(input, "payload", strippedFields);

  const history = sanitizeRetentionItems(input.history, "history", nowIso, strippedFields, warnings);
  const favorites = sanitizeRetentionItems(input.favorites, "favorites", nowIso, strippedFields, warnings);
  const updatedAt = normalizeTimestamp(input.updatedAt) ?? nowIso;

  return {
    ok: true,
    payload: {
      syncVersion: 1,
      history,
      favorites,
      updatedAt,
    },
    strippedFields: unique(strippedFields),
    warnings,
  };
}

function sanitizeRetentionItems(
  value: unknown,
  path: string,
  nowIso: string,
  strippedFields: string[],
  warnings: string[],
): ZodiacSyncedRetentionItem[] {
  if (!Array.isArray(value)) {
    if (value !== undefined) strippedFields.push(path);
    return [];
  }

  if (value.length > ZODIAC_PROFILE_SYNC_MAX_ITEMS) {
    warnings.push(`${path} was clamped to ${ZODIAC_PROFILE_SYNC_MAX_ITEMS} items.`);
  }

  const result: ZodiacSyncedRetentionItem[] = [];
  for (let index = 0; index < value.length && result.length < ZODIAC_PROFILE_SYNC_MAX_ITEMS; index += 1) {
    const item = sanitizeRetentionItem(value[index], `${path}.${index}`, nowIso, strippedFields);
    if (item) {
      result.push(item);
    } else {
      warnings.push(`${path}.${index} was dropped because required safe fields were missing.`);
    }
  }

  return result;
}

function sanitizeRetentionItem(
  value: unknown,
  path: string,
  nowIso: string,
  strippedFields: string[],
): ZodiacSyncedRetentionItem | null {
  if (!isRecord(value)) {
    strippedFields.push(path);
    return null;
  }

  collectUnknownFields(value, allowedItemFields, path, strippedFields);
  collectBlockedFields(value, path, strippedFields);

  const id = sanitizeToken(value.id, 140);
  const featureKey = sanitizeToken(value.featureKey, 64);
  const label = sanitizeLabel(value.label);
  if (!id || !featureKey || !label) {
    return null;
  }

  return dropUndefined({
    id,
    featureKey,
    section: sanitizeToken(value.section, 64),
    sign: sanitizeToken(value.sign, 64),
    firstSign: sanitizeToken(value.firstSign, 64),
    secondSign: sanitizeToken(value.secondSign, 64),
    mode: sanitizeToken(value.mode, 64),
    tier: sanitizeToken(value.tier, 64),
    scoreTier: sanitizeToken(value.scoreTier, 64),
    label,
    timestamp: normalizeTimestamp(value.timestamp) ?? nowIso,
  });
}

function collectUnknownFields(
  source: Record<string, unknown>,
  allowed: Set<string>,
  path: string,
  strippedFields: string[],
) {
  for (const key of Object.keys(source)) {
    if (!allowed.has(key)) {
      strippedFields.push(`${path}.${key}`);
    }
  }
}

function collectBlockedFields(
  source: Record<string, unknown>,
  path: string,
  strippedFields: string[],
) {
  for (const key of Object.keys(source)) {
    if (blockedFieldNames.has(key)) {
      strippedFields.push(`${path}.${key}`);
    }
  }
}

function sanitizeToken(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const stripped = stripForbiddenFragments(value).trim();
  return /^[A-Za-z0-9:_-]{1,160}$/.test(stripped)
    ? stripped.slice(0, maxLength)
    : undefined;
}

function sanitizeLabel(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const stripped = stripForbiddenFragments(value)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);

  return stripped || undefined;
}

function normalizeTimestamp(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function stripForbiddenFragments(value: string): string {
  let next = value;
  for (const pattern of forbiddenValuePatterns) {
    next = next.replace(pattern, "");
  }
  for (const fragment of forbiddenTextFragments) {
    next = next.split(fragment).join("");
  }
  return next;
}

function dropUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  ) as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}
