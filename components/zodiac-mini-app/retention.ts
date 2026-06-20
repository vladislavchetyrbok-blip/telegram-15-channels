"use client";

import { useCallback, useEffect, useState } from "react";
import type { MoreFeatureId, RelationshipMode } from "./types";

export type RetentionPanelFocus = "profile" | "favorites" | "history";

export interface ZodiacRetentionItem {
  id: string;
  label: string;
  section: string;
  featureKey?: MoreFeatureId | string;
  sign?: string;
  firstSign?: string;
  secondSign?: string;
  scoreTier?: string;
  relationshipMode?: RelationshipMode;
  mode?: string;
  topic?: string;
  spreadType?: string;
  cardKeys?: string[];
  runeKeys?: string[];
  matrixType?: string;
  archetype?: string;
  mainNumber?: number;
  dateBucket?: string;
  selectedDateKey?: string;
  energyTier?: string;
  ritualKey?: string;
  detail?: string;
  createdAt: string;
}

export interface ZodiacRetentionState {
  version: 1;
  lastSign?: string;
  lastSection?: {
    id: string;
    label: string;
  };
  lastCompatibilityMode?: RelationshipMode;
  history: ZodiacRetentionItem[];
  favorites: ZodiacRetentionItem[];
}

export type ZodiacRetentionDraft = Omit<ZodiacRetentionItem, "id" | "createdAt"> & {
  id?: string;
  createdAt?: string;
};

export const ZODIAC_RETENTION_STORAGE_KEY = "zodiac-mini-app-retention-v1";

const emptyState: ZodiacRetentionState = {
  version: 1,
  history: [],
  favorites: [],
};

const maxItems = 10;

export function useZodiacMiniAppRetention() {
  const [state, setState] = useState<ZodiacRetentionState>(emptyState);

  useEffect(() => {
    setState(loadRetentionState());
  }, []);

  const updateState = useCallback((updater: (current: ZodiacRetentionState) => ZodiacRetentionState) => {
    setState((current) => {
      const next = normalizeState(updater(current));
      writeRetentionState(next);
      return next;
    });
  }, []);

  const recordAction = useCallback(
    (draft: ZodiacRetentionDraft) => {
      const item = normalizeItem(draft);
      updateState((current) => ({
        ...current,
        lastSign: item.sign || current.lastSign,
        lastSection: item.section ? { id: item.section, label: item.label } : current.lastSection,
        lastCompatibilityMode: item.relationshipMode || current.lastCompatibilityMode,
        history: upsertItem(current.history, item),
      }));
    },
    [updateState],
  );

  const saveFavorite = useCallback(
    (draft: ZodiacRetentionDraft) => {
      const item = normalizeItem(draft);
      updateState((current) => ({
        ...current,
        lastSign: item.sign || current.lastSign,
        favorites: upsertItem(current.favorites, item),
      }));
      return item;
    },
    [updateState],
  );

  const clearAll = useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.removeItem(ZODIAC_RETENTION_STORAGE_KEY);
    setState(emptyState);
  }, []);

  return {
    state,
    recordAction,
    saveFavorite,
    clearAll,
  };
}

function loadRetentionState(): ZodiacRetentionState {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = window.localStorage.getItem(ZODIAC_RETENTION_STORAGE_KEY);
    if (!raw) return emptyState;
    return normalizeState(JSON.parse(raw));
  } catch {
    return emptyState;
  }
}

function writeRetentionState(state: ZodiacRetentionState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ZODIAC_RETENTION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Local retention is optional; quota/private-mode failures must not break the Mini App.
  }
}

function normalizeState(value: unknown): ZodiacRetentionState {
  const source = typeof value === "object" && value ? (value as Partial<ZodiacRetentionState>) : {};
  return {
    version: 1,
    lastSign: sanitizeToken(source.lastSign),
    lastSection: normalizeLastSection(source.lastSection),
    lastCompatibilityMode: sanitizeRelationshipMode(source.lastCompatibilityMode),
    history: Array.isArray(source.history) ? source.history.map(normalizeItem).slice(0, maxItems) : [],
    favorites: Array.isArray(source.favorites) ? source.favorites.map(normalizeItem).slice(0, maxItems) : [],
  };
}

function normalizeLastSection(value: unknown) {
  if (typeof value !== "object" || !value) return undefined;
  const source = value as { id?: unknown; label?: unknown };
  const id = sanitizeToken(source.id);
  const label = sanitizeLabel(source.label);
  return id && label ? { id, label } : undefined;
}

function normalizeItem(value: ZodiacRetentionDraft | Partial<ZodiacRetentionItem>): ZodiacRetentionItem {
  const label = sanitizeStoredText(sanitizeLabel(value.label)) || "Астрологический центр";
  const section = sanitizeToken(value.section) || "mini_app";
  const featureKey = sanitizeToken(value.featureKey);
  const sign = sanitizeToken(value.sign);
  const firstSign = sanitizeToken(value.firstSign);
  const secondSign = sanitizeToken(value.secondSign);
  const scoreTier = sanitizeToken(value.scoreTier);
  const relationshipMode = sanitizeRelationshipMode(value.relationshipMode);
  const mode = sanitizeToken(value.mode);
  const topic = sanitizeToken(value.topic);
  const spreadType = sanitizeToken(value.spreadType);
  const cardKeys = sanitizeTokenArray(value.cardKeys);
  const runeKeys = sanitizeTokenArray(value.runeKeys);
  const matrixType = sanitizeToken(value.matrixType);
  const archetype = sanitizeToken(value.archetype);
  const mainNumber = sanitizeSafeNumber(value.mainNumber);
  const dateBucket = sanitizeToken(value.dateBucket);
  const selectedDateKey = sanitizeDateKey(value.selectedDateKey);
  const energyTier = sanitizeToken(value.energyTier);
  const ritualKey = sanitizeToken(value.ritualKey);
  const detail = sanitizeStoredText(sanitizeLabel(value.detail));
  const id = sanitizeToken(value.id) || [section, featureKey, sign, firstSign, secondSign, relationshipMode, mode, topic, spreadType, cardKeys?.join("_"), runeKeys?.join("_"), matrixType, archetype, mainNumber, dateBucket, selectedDateKey, energyTier, ritualKey, label].filter(Boolean).join(":").slice(0, 140);
  const createdAt = normalizeCreatedAtBucket(value.createdAt) ?? normalizeCreatedAtBucket(new Date().toISOString()) ?? "local";
  return {
    id,
    label,
    section,
    featureKey,
    sign,
    firstSign,
    secondSign,
    scoreTier,
    relationshipMode,
    mode,
    topic,
    spreadType,
    cardKeys,
    runeKeys,
    matrixType,
    archetype,
    mainNumber,
    dateBucket,
    selectedDateKey,
    energyTier,
    ritualKey,
    detail,
    createdAt,
  };
}

function upsertItem(items: ZodiacRetentionItem[], item: ZodiacRetentionItem) {
  return [item, ...items.filter((current) => current.id !== item.id)].slice(0, maxItems);
}

function sanitizeLabel(value: unknown) {
  if (typeof value !== "string") return undefined;
  return value.replace(/\s+/g, " ").trim().slice(0, 120) || undefined;
}

function sanitizeStoredText(value: string | undefined) {
  if (!value) return undefined;
  const sanitized = value
    .replace(/\b(?:[01]?\d|2[0-3]):[0-5]\d\b/g, "[time-pattern]")
    .replace(/\b(?:\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}[./-]\d{1,2}[./-]\d{1,2})\b/g, "[date-pattern]");
  return sanitized.trim().slice(0, 120) || undefined;
}

function normalizeCreatedAtBucket(value: unknown) {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return undefined;
  return new Date(value).toISOString().slice(0, 10);
}

function sanitizeToken(value: unknown) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return /^[A-Za-z0-9_-]{1,64}$/.test(normalized) ? normalized : undefined;
}

function sanitizeDateKey(value: unknown) {
  if (typeof value !== "string") return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function sanitizeTokenArray(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const tokens = value.map(sanitizeToken).filter((item): item is string => Boolean(item)).slice(0, 8);
  return tokens.length ? tokens : undefined;
}

function sanitizeSafeNumber(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 33) return undefined;
  return value;
}

function sanitizeRelationshipMode(value: unknown): RelationshipMode | undefined {
  return value === "love" || value === "friendship" || value === "work" || value === "family" || value === "passion" || value === "reconciliation" ? value : undefined;
}
