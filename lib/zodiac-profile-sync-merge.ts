import {
  sanitizeZodiacProfileSyncPayload,
  ZODIAC_PROFILE_SYNC_MAX_ITEMS,
} from "./zodiac-profile-sync-sanitize";
import type {
  ZodiacProfileSyncPayload,
  ZodiacSyncedRetentionItem,
} from "./zodiac-profile-sync-types";

export type ZodiacProfileSyncMergeSource = "local" | "remote";

export type ZodiacProfileSyncMergeResult = {
  payload: ZodiacProfileSyncPayload;
  changed: boolean;
  localCount: {
    history: number;
    favorites: number;
  };
  remoteCount: {
    history: number;
    favorites: number;
  };
  mergedCount: {
    history: number;
    favorites: number;
  };
  dropped: Array<{
    reason: string;
    featureKey?: string;
    id?: string;
  }>;
  warnings: string[];
};

type MergeBucket = "history" | "favorites";

type MergeCandidate = ZodiacSyncedRetentionItem & {
  source: ZodiacProfileSyncMergeSource;
  order: number;
};

type SanitizedMergeInput = {
  payload: ZodiacProfileSyncPayload;
  warnings: string[];
  dropped: ZodiacProfileSyncMergeResult["dropped"];
};

export function mergeZodiacProfileSyncPayloads(input: {
  local: Partial<ZodiacProfileSyncPayload> | null | undefined;
  remote: Partial<ZodiacProfileSyncPayload> | null | undefined;
  nowIso?: string;
  maxHistory?: number;
  maxFavorites?: number;
}): ZodiacProfileSyncMergeResult {
  const nowIso = normalizeTimestamp(input.nowIso) ?? new Date().toISOString();
  const maxHistory = normalizeMax(input.maxHistory);
  const maxFavorites = normalizeMax(input.maxFavorites);
  const local = sanitizeMergeInput(input.local, "local", nowIso);
  const remote = sanitizeMergeInput(input.remote, "remote", nowIso);
  const dropped = [...local.dropped, ...remote.dropped];
  const warnings = unique([...local.warnings, ...remote.warnings]);

  const history = mergeItems({
    bucket: "history",
    localItems: local.payload.history,
    remoteItems: remote.payload.history,
    maxItems: maxHistory,
    dropped,
  });
  const favorites = mergeItems({
    bucket: "favorites",
    localItems: local.payload.favorites,
    remoteItems: remote.payload.favorites,
    maxItems: maxFavorites,
    dropped,
  });

  const payload: ZodiacProfileSyncPayload = {
    syncVersion: 1,
    history,
    favorites,
    updatedAt: nowIso,
  };

  return {
    payload,
    changed: hasContentChanged(local.payload, payload),
    localCount: {
      history: local.payload.history.length,
      favorites: local.payload.favorites.length,
    },
    remoteCount: {
      history: remote.payload.history.length,
      favorites: remote.payload.favorites.length,
    },
    mergedCount: {
      history: payload.history.length,
      favorites: payload.favorites.length,
    },
    dropped,
    warnings: unique(warnings),
  };
}

function sanitizeMergeInput(
  value: Partial<ZodiacProfileSyncPayload> | null | undefined,
  source: ZodiacProfileSyncMergeSource,
  nowIso: string,
): SanitizedMergeInput {
  const dropped: ZodiacProfileSyncMergeResult["dropped"] = [];
  const warnings: string[] = [];
  const prepared = preparePayloadForSanitizer(value, nowIso);
  const result = sanitizeZodiacProfileSyncPayload(prepared, { nowIso });

  if (!result.ok) {
    warnings.push(`${source} payload was malformed and replaced with an empty safe payload.`);
    dropped.push({ reason: `${source}_malformed_payload` });
    return { payload: emptyPayload(nowIso), warnings, dropped };
  }

  const preparedCounts = countPreparedItems(prepared);
  if (preparedCounts.history > result.payload.history.length) {
    dropped.push({ reason: `${source}_history_invalid_or_unsafe` });
  }
  if (preparedCounts.favorites > result.payload.favorites.length) {
    dropped.push({ reason: `${source}_favorites_invalid_or_unsafe` });
  }

  return {
    payload: result.payload,
    warnings: unique([
      ...warnings,
      ...result.warnings.map((warning) => `${source}: ${warning}`),
      ...result.strippedFields.map((field) => `${source}: stripped ${field}`),
    ]),
    dropped,
  };
}

function mergeItems({
  bucket,
  localItems,
  remoteItems,
  maxItems,
  dropped,
}: {
  bucket: MergeBucket;
  localItems: ZodiacSyncedRetentionItem[];
  remoteItems: ZodiacSyncedRetentionItem[];
  maxItems: number;
  dropped: ZodiacProfileSyncMergeResult["dropped"];
}): ZodiacSyncedRetentionItem[] {
  const byKey = new Map<string, MergeCandidate>();
  const all: MergeCandidate[] = [
    ...localItems.map((item, index) => ({ ...item, source: "local" as const, order: index })),
    ...remoteItems.map((item, index) => ({ ...item, source: "remote" as const, order: localItems.length + index })),
  ];

  for (const item of all) {
    const key = uniqueItemKey(item);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, item);
      continue;
    }

    const winner = chooseNewer(existing, item);
    const loser = winner === existing ? item : existing;
    byKey.set(key, winner);
    dropped.push({
      reason: `${bucket}_duplicate_newer_item_kept`,
      featureKey: loser.featureKey,
      id: loser.id,
    });
  }

  const sorted = Array.from(byKey.values()).sort(compareItems);
  const kept = sorted.slice(0, maxItems).map(stripMergeMetadata);
  for (const item of sorted.slice(maxItems)) {
    dropped.push({
      reason: `${bucket}_max_clamp`,
      featureKey: item.featureKey,
      id: item.id,
    });
  }

  return kept;
}

function preparePayloadForSanitizer(
  value: Partial<ZodiacProfileSyncPayload> | null | undefined,
  nowIso: string,
): Record<string, unknown> {
  if (!isRecord(value)) {
    return emptyPayload(nowIso);
  }

  return {
    ...value,
    syncVersion: 1,
    history: prepareItems(value.history),
    favorites: prepareItems(value.favorites),
    updatedAt: normalizeTimestamp(value.updatedAt) ?? nowIso,
  };
}

function prepareItems(value: unknown): unknown {
  if (!Array.isArray(value)) {
    return value;
  }

  return value.map((item) => {
    if (!isRecord(item)) {
      return item;
    }

    const id = safeToken(item.id);
    if (id) {
      return item;
    }

    const featureKey = safeToken(item.featureKey);
    const label = safeLabel(item.label);
    if (!featureKey || !label) {
      return item;
    }

    return {
      ...item,
      id: buildGeneratedId(item),
    };
  });
}

function buildGeneratedId(item: Record<string, unknown>): string {
  const key = [
    safeToken(item.featureKey),
    safeToken(item.section),
    safeToken(item.sign),
    safeToken(item.firstSign),
    safeToken(item.secondSign),
    safeToken(item.mode),
    safeToken(item.tier),
    safeToken(item.scoreTier),
    safeLabel(item.label),
  ].filter(Boolean).join(":");

  return `sync:${hashString(key)}`.slice(0, 140);
}

function uniqueItemKey(item: ZodiacSyncedRetentionItem): string {
  const id = safeToken(item.id);
  if (id) {
    return `id:${id}`;
  }

  return `safe:${[
    item.featureKey,
    item.section,
    item.sign,
    item.firstSign,
    item.secondSign,
    item.mode,
    item.tier,
    item.scoreTier,
    item.label,
  ].filter(Boolean).join(":")}`;
}

function chooseNewer(left: MergeCandidate, right: MergeCandidate): MergeCandidate {
  const leftTime = Date.parse(left.timestamp);
  const rightTime = Date.parse(right.timestamp);
  if (rightTime > leftTime) {
    return right;
  }
  if (rightTime < leftTime) {
    return left;
  }

  if (left.source !== right.source) {
    return left.source === "local" ? left : right;
  }

  return left.order <= right.order ? left : right;
}

function compareItems(left: MergeCandidate, right: MergeCandidate): number {
  const byTimestamp = Date.parse(right.timestamp) - Date.parse(left.timestamp);
  if (byTimestamp !== 0) {
    return byTimestamp;
  }

  if (left.source !== right.source) {
    return left.source === "local" ? -1 : 1;
  }

  const byKey = uniqueItemKey(left).localeCompare(uniqueItemKey(right));
  if (byKey !== 0) {
    return byKey;
  }

  return left.order - right.order;
}

function stripMergeMetadata(item: MergeCandidate): ZodiacSyncedRetentionItem {
  const { source: _source, order: _order, ...safeItem } = item;
  return safeItem;
}

function hasContentChanged(
  local: ZodiacProfileSyncPayload,
  merged: ZodiacProfileSyncPayload,
): boolean {
  return JSON.stringify({ history: local.history, favorites: local.favorites })
    !== JSON.stringify({ history: merged.history, favorites: merged.favorites });
}

function countPreparedItems(value: Record<string, unknown>) {
  return {
    history: Array.isArray(value.history) ? value.history.length : 0,
    favorites: Array.isArray(value.favorites) ? value.favorites.length : 0,
  };
}

function emptyPayload(nowIso: string): ZodiacProfileSyncPayload {
  return {
    syncVersion: 1,
    history: [],
    favorites: [],
    updatedAt: nowIso,
  };
}

function normalizeMax(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return ZODIAC_PROFILE_SYNC_MAX_ITEMS;
  }

  return Math.min(value, ZODIAC_PROFILE_SYNC_MAX_ITEMS);
}

function normalizeTimestamp(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function safeToken(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return /^[A-Za-z0-9:_-]{1,160}$/.test(trimmed) ? trimmed.slice(0, 140) : undefined;
}

function safeLabel(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return value.replace(/\s+/g, " ").trim().slice(0, 120) || undefined;
}

function hashString(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(36);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}
