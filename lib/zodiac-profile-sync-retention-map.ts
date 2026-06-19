import { sanitizeZodiacProfileSyncPayload } from "./zodiac-profile-sync-sanitize";
import type { ZodiacSyncedRetentionItem } from "./zodiac-profile-sync-types";

export type ZodiacLocalRetentionItemLike = {
  id?: unknown;
  label?: unknown;
  section?: unknown;
  featureKey?: unknown;
  sign?: unknown;
  firstSign?: unknown;
  secondSign?: unknown;
  relationshipMode?: unknown;
  mode?: unknown;
  scoreTier?: unknown;
  createdAt?: unknown;
};

export type ZodiacMappedRetentionItem = {
  id: string;
  label: string;
  section: string;
  featureKey: string;
  sign?: string;
  firstSign?: string;
  secondSign?: string;
  relationshipMode?: string;
  mode?: string;
  scoreTier?: string;
  createdAt: string;
};

export function retentionItemToSyncedItem(
  item: ZodiacLocalRetentionItemLike,
  options: { nowIso?: string } = {},
): ZodiacSyncedRetentionItem | null {
  const nowIso = normalizeTimestamp(options.nowIso) ?? new Date().toISOString();
  const candidate = {
    id: item.id,
    featureKey: item.featureKey,
    section: item.section,
    sign: item.sign,
    firstSign: item.firstSign,
    secondSign: item.secondSign,
    mode: item.mode ?? item.relationshipMode,
    scoreTier: item.scoreTier,
    label: item.label,
    timestamp: item.createdAt,
  };

  const sanitized = sanitizeZodiacProfileSyncPayload({
    syncVersion: 1,
    history: [candidate],
    favorites: [],
    updatedAt: nowIso,
  }, { nowIso });

  return sanitized.ok ? sanitized.payload.history[0] ?? null : null;
}

export function syncedItemToRetentionItem(
  item: unknown,
  options: { nowIso?: string } = {},
): ZodiacMappedRetentionItem | null {
  const nowIso = normalizeTimestamp(options.nowIso) ?? new Date().toISOString();
  const sanitized = sanitizeZodiacProfileSyncPayload({
    syncVersion: 1,
    history: [item],
    favorites: [],
    updatedAt: nowIso,
  }, { nowIso });
  const safeItem = sanitized.ok ? sanitized.payload.history[0] : null;
  if (!safeItem) {
    return null;
  }

  return {
    id: safeItem.id,
    label: safeItem.label,
    section: safeItem.section ?? "mini_app",
    featureKey: safeItem.featureKey,
    sign: safeItem.sign,
    firstSign: safeItem.firstSign,
    secondSign: safeItem.secondSign,
    relationshipMode: relationshipModeFromSyncMode(safeItem.mode),
    mode: safeItem.mode,
    scoreTier: safeItem.scoreTier,
    createdAt: safeItem.timestamp,
  };
}

function relationshipModeFromSyncMode(value: string | undefined): string | undefined {
  return value === "love"
    || value === "friendship"
    || value === "work"
    || value === "family"
    || value === "passion"
    || value === "reconciliation"
    ? value
    : undefined;
}

function normalizeTimestamp(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}
