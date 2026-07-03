import tarotMajorArcanaData from "@/data/config/tarot-major-arcana.json";
import tarotCardAssetData from "@/data/config/tarot-card-assets.json";

export interface DailyTarotCard {
  id: string;
  number: number;
  slug: string;
  ruTitle: string;
  enTitle: string;
  keywords: string[];
  dayMeaning: string;
  loveMeaning: string;
  advice: string;
  action: string;
  imagePath: string;
}

export type DailyTarotSeedMode = "telegram-user" | "date-only";

export interface DailyTarotSelection {
  card: DailyTarotCard;
  dateKey: string;
  seedMode: DailyTarotSeedMode;
}

export const TAROT_MAJOR_ARCANA = tarotMajorArcanaData as DailyTarotCard[];
export const TAROT_AVAILABLE_IMAGE_PATHS = new Set((tarotCardAssetData.availableImagePaths ?? []) as string[]);

export function hasTarotImageAsset(imagePath: string) {
  return TAROT_AVAILABLE_IMAGE_PATHS.has(imagePath);
}

export function normalizeTarotDateKey(dateKey: string | null | undefined) {
  const value = String(dateKey || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : new Date().toISOString().slice(0, 10);
}

export function normalizeTelegramUserSeed(userId: string | number | null | undefined) {
  const value = String(userId ?? "").trim();
  return value ? value.replace(/[^\dA-Za-z_-]/g, "") : "";
}

export function selectDailyTarotCard(dateKey: string | null | undefined, telegramUserId?: string | number | null): DailyTarotSelection {
  const normalizedDateKey = normalizeTarotDateKey(dateKey);
  const userSeed = normalizeTelegramUserSeed(telegramUserId);
  const seed = userSeed ? `${normalizedDateKey}:telegram:${userSeed}` : `${normalizedDateKey}:date`;
  const index = stableTarotHash(seed) % TAROT_MAJOR_ARCANA.length;

  return {
    card: TAROT_MAJOR_ARCANA[index],
    dateKey: normalizedDateKey,
    seedMode: userSeed ? "telegram-user" : "date-only",
  };
}

export function stableTarotHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
