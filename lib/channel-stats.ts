import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { channelGenerationConfigs } from "@/data/channelGeneration";

export type ChannelStatsSource = "real" | "manual" | "demo" | "unknown";

export interface ChannelStats {
  channelId: string;
  subscribers: number | null;
  averageViews: number | null;
  engagementRate: number | null;
  dataSource: ChannelStatsSource;
  lastUpdated: string | null;
  status: string;
}

const statsPath = path.join(process.cwd(), "data", "runtime", "channel-stats.json");

export function listChannelStats() {
  const saved = readStatsState();

  return channelGenerationConfigs.map((channel) => normalizeStats(channel.id, saved[channel.id]));
}

export function getChannelStats(channelId: string) {
  const saved = readStatsState();

  return normalizeStats(channelId, saved[channelId]);
}

export function getChannelStatsSummary() {
  const stats = listChannelStats();

  return {
    totalChannels: stats.length,
    real: stats.filter((item) => item.dataSource === "real").length,
    manual: stats.filter((item) => item.dataSource === "manual").length,
    demo: stats.filter((item) => item.dataSource === "demo").length,
    unknown: stats.filter((item) => item.dataSource === "unknown").length,
    subscribersSynced: stats.filter((item) => item.subscribers !== null && item.dataSource !== "demo").length,
    audienceLabel: stats.some((item) => item.dataSource === "real" || item.dataSource === "manual") ? "частично синхронизировано" : "не синхронизировано",
    erLabel: stats.some((item) => item.engagementRate !== null && item.dataSource !== "demo") ? "частично рассчитан" : "не рассчитан",
    lastUpdated: stats
      .map((item) => item.lastUpdated)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null,
  };
}

export function saveManualChannelStats({
  channelId,
  subscribers,
  averageViews,
  engagementRate,
  lastUpdated,
}: {
  channelId: string;
  subscribers: number | null;
  averageViews: number | null;
  engagementRate: number | null;
  lastUpdated?: string | null;
}) {
  const state = readStatsState();
  const updated: ChannelStats = {
    channelId,
    subscribers,
    averageViews,
    engagementRate,
    dataSource: "manual",
    lastUpdated: lastUpdated || new Date().toISOString(),
    status: "Введено вручную",
  };

  state[channelId] = updated;
  writeStatsState(state);

  return updated;
}

export function refreshChannelStatsFromTelegram() {
  return {
    ok: false,
    mode: "dry-run" as const,
    telegramSent: false as const,
    message: "Telegram API не подключён. Можно ввести данные вручную или оставить не синхронизировано.",
    updated: 0,
  };
}

function normalizeStats(channelId: string, stats?: Partial<ChannelStats>): ChannelStats {
  if (!stats) {
    return {
      channelId,
      subscribers: null,
      averageViews: null,
      engagementRate: null,
      dataSource: "unknown",
      lastUpdated: null,
      status: "Telegram API не подключён / данные не обновлены",
    };
  }

  return {
    channelId,
    subscribers: isFiniteNumber(stats.subscribers) ? stats.subscribers : null,
    averageViews: isFiniteNumber(stats.averageViews) ? stats.averageViews : null,
    engagementRate: isFiniteNumber(stats.engagementRate) ? stats.engagementRate : null,
    dataSource: stats.dataSource ?? "unknown",
    lastUpdated: stats.lastUpdated ?? null,
    status: stats.status ?? "Данные не обновлены",
  };
}

function readStatsState(): Record<string, ChannelStats> {
  if (!existsSync(statsPath)) {
    return {};
  }

  return JSON.parse(readFileSync(statsPath, "utf8")) as Record<string, ChannelStats>;
}

function writeStatsState(state: Record<string, ChannelStats>) {
  mkdirSync(path.dirname(statsPath), { recursive: true });
  writeFileSync(statsPath, JSON.stringify(state, null, 2), "utf8");
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
