import { addDaysToDateKey, DEFAULT_ZODIAC_TIME_ZONE, getCurrentZodiacDateKey } from "@/lib/zodiac-date";
import {
  buildSanitizedZodiacAnalyticsEvent,
  ZODIAC_ANALYTICS_REQUIRED_ENV,
  type SanitizedZodiacAnalyticsEvent,
  type ZodiacAnalyticsEventName,
} from "@/lib/zodiac-mini-app-analytics-shared";

type RedisCommand = Array<string | number>;
type AnalyticsStorageMode = "redis" | "noop";

export interface AnalyticsRankItem {
  label: string;
  value: number;
}

export interface ZodiacMiniAppAnalyticsDashboard {
  configured: boolean;
  storageMode: AnalyticsStorageMode;
  warning: string | null;
  requiredEnv: string[];
  todayDateKey: string;
  todayAppOpens: number;
  last7DaysAppOpens: number;
  dailyAppOpens: AnalyticsRankItem[];
  topSections: AnalyticsRankItem[];
  topSigns: AnalyticsRankItem[];
  compatibilityModes: AnalyticsRankItem[];
  topPairs: AnalyticsRankItem[];
  counters: {
    natalChartOpens: number;
    coupleHoroscopeOpens: number;
    relationshipMapOpens: number;
    luckyDaysOpens: number;
    vipClicks: number;
    giveawayClicks: number;
    messageHelperUse: number;
  };
  funnel: AnalyticsRankItem[];
}

const keyPrefix = "zodiac-mini-app:analytics";

export function getZodiacAnalyticsStorageStatus() {
  const configured = Boolean(process.env.ZODIAC_ANALYTICS_REDIS_URL && process.env.ZODIAC_ANALYTICS_REDIS_TOKEN);
  return {
    configured,
    storageMode: configured ? "redis" as const : "noop" as const,
    requiredEnv: Array.from(ZODIAC_ANALYTICS_REQUIRED_ENV),
  };
}

export async function recordZodiacMiniAppAnalyticsEvent(event: SanitizedZodiacAnalyticsEvent) {
  const status = getZodiacAnalyticsStorageStatus();
  if (!status.configured) return { ok: true, stored: false, mode: status.storageMode };

  try {
    await redisPipeline(buildEventCommands(event));
    return { ok: true, stored: true, mode: status.storageMode };
  } catch {
    return { ok: true, stored: false, mode: "noop" as const };
  }
}

export function sanitizeIncomingZodiacAnalyticsEvent(event: ZodiacAnalyticsEventName, payload: unknown) {
  return buildSanitizedZodiacAnalyticsEvent(event, payload, getCurrentZodiacDateKey(DEFAULT_ZODIAC_TIME_ZONE));
}

export async function getZodiacMiniAppAnalyticsDashboard(): Promise<ZodiacMiniAppAnalyticsDashboard> {
  const status = getZodiacAnalyticsStorageStatus();
  const todayDateKey = getCurrentZodiacDateKey(DEFAULT_ZODIAC_TIME_ZONE);
  const dateKeys = buildLastDateKeys(todayDateKey, 7);

  if (!status.configured) {
    return emptyDashboard({
      configured: false,
      storageMode: "noop",
      todayDateKey,
      warning: "Аналитика ещё не подключена. События принимаются в безопасном noop-режиме.",
    });
  }

  try {
    const commands = buildDashboardCommands(dateKeys);
    const results = await redisPipeline(commands);
    return parseDashboardResults(results, dateKeys, todayDateKey);
  } catch {
    return emptyDashboard({
      configured: true,
      storageMode: "redis",
      todayDateKey,
      warning: "Хранилище аналитики временно недоступно",
    });
  }
}

function buildEventCommands(event: SanitizedZodiacAnalyticsEvent): RedisCommand[] {
  const dateKey = event.dateKey;
  const commands: RedisCommand[] = [
    ["ZINCRBY", key("events", dateKey), 1, event.event],
    ["ZINCRBY", key("funnel", dateKey), 1, funnelStepForEvent(event.event)],
  ];

  if (event.event === "app_open") commands.push(["INCR", key("app-opens", dateKey)]);
  if (event.sign) commands.push(["ZINCRBY", key("signs", dateKey), 1, event.sign]);
  if (event.mode) commands.push(["ZINCRBY", key("modes", dateKey), 1, event.mode]);
  if (event.section) commands.push(["ZINCRBY", key("sections", dateKey), 1, event.section]);
  if (event.firstSign && event.secondSign) commands.push(["ZINCRBY", key("pairs", dateKey), 1, normalizePair(event.firstSign, event.secondSign)]);
  if (event.scoreTier) commands.push(["ZINCRBY", key("score-tiers", dateKey), 1, event.scoreTier]);
  if (event.category) commands.push(["ZINCRBY", key("categories", dateKey), 1, event.category]);

  return commands;
}

function buildDashboardCommands(dateKeys: string[]) {
  const commands: RedisCommand[] = [];

  for (const dateKey of dateKeys) commands.push(["GET", key("app-opens", dateKey)]);
  for (const dateKey of dateKeys) commands.push(["ZREVRANGE", key("sections", dateKey), 0, 24, "WITHSCORES"]);
  for (const dateKey of dateKeys) commands.push(["ZREVRANGE", key("signs", dateKey), 0, 24, "WITHSCORES"]);
  for (const dateKey of dateKeys) commands.push(["ZREVRANGE", key("modes", dateKey), 0, 12, "WITHSCORES"]);
  for (const dateKey of dateKeys) commands.push(["ZREVRANGE", key("pairs", dateKey), 0, 24, "WITHSCORES"]);
  for (const dateKey of dateKeys) commands.push(["ZREVRANGE", key("events", dateKey), 0, 64, "WITHSCORES"]);

  return commands;
}

function parseDashboardResults(results: unknown[], dateKeys: string[], todayDateKey: string): ZodiacMiniAppAnalyticsDashboard {
  let cursor = 0;
  const dailyAppOpens = dateKeys.map((dateKey) => ({
    label: dateKey,
    value: toNumber(results[cursor++]),
  }));
  const sections = new Map<string, number>();
  const signs = new Map<string, number>();
  const modes = new Map<string, number>();
  const pairs = new Map<string, number>();
  const events = new Map<string, number>();

  for (const _dateKey of dateKeys) mergeRankMap(sections, results[cursor++]);
  for (const _dateKey of dateKeys) mergeRankMap(signs, results[cursor++]);
  for (const _dateKey of dateKeys) mergeRankMap(modes, results[cursor++]);
  for (const _dateKey of dateKeys) mergeRankMap(pairs, results[cursor++]);
  for (const _dateKey of dateKeys) mergeRankMap(events, results[cursor++]);

  return {
    configured: true,
    storageMode: "redis",
    warning: null,
    requiredEnv: Array.from(ZODIAC_ANALYTICS_REQUIRED_ENV),
    todayDateKey,
    todayAppOpens: dailyAppOpens[0]?.value ?? 0,
    last7DaysAppOpens: dailyAppOpens.reduce((sum, item) => sum + item.value, 0),
    dailyAppOpens,
    topSections: rankItems(sections),
    topSigns: rankItems(signs),
    compatibilityModes: rankItems(modes),
    topPairs: rankItems(pairs),
    counters: {
      natalChartOpens: countEvents(events, [
        "section_open_natal_chart",
        "natal_chart_started",
        "natal_chart_completed",
        "natal_chart_opened",
        "natal_chart_result_viewed",
        "natal_chart_section_opened",
        "natal_chart_vip_free_opened",
      ]),
      coupleHoroscopeOpens: countEvents(events, ["section_open_couple_horoscope", "couple_horoscope_viewed"]),
      relationshipMapOpens: countEvents(events, ["section_open_relationship_map", "relationship_map_viewed", "mental_map_viewed", "final_map_opened", "feature_depth_viewed"]),
      luckyDaysOpens: countEvents(events, ["section_open_lucky_days"]),
      vipClicks: countEvents(events, ["vip_clicked", "vip_opened", "vip_free_access_viewed", "vip_feature_opened", "vip_future_subscription_clicked"]),
      giveawayClicks: countEvents(events, ["giveaway_clicked"]),
      messageHelperUse: countEvents(events, ["message_helper_used"]),
    },
    funnel: [
      { label: "app_open", value: events.get("app_open") ?? 0 },
      { label: "sign_selected", value: events.get("sign_selected") ?? 0 },
      { label: "section_open", value: sectionOpenCount(events) },
      { label: "calculation", value: events.get("compatibility_calculated") ?? 0 },
    ],
  };
}

async function redisPipeline(commands: RedisCommand[]) {
  const url = process.env.ZODIAC_ANALYTICS_REDIS_URL;
  const token = process.env.ZODIAC_ANALYTICS_REDIS_TOKEN;
  if (!url || !token || commands.length === 0) return [];

  const response = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("zodiac analytics storage request failed");
  const payload = (await response.json()) as Array<{ result?: unknown; error?: unknown }>;
  return payload.map((item) => item.result);
}

function emptyDashboard({
  configured,
  storageMode,
  todayDateKey,
  warning,
}: {
  configured: boolean;
  storageMode: AnalyticsStorageMode;
  todayDateKey: string;
  warning: string;
}): ZodiacMiniAppAnalyticsDashboard {
  return {
    configured,
    storageMode,
    warning,
    requiredEnv: Array.from(ZODIAC_ANALYTICS_REQUIRED_ENV),
    todayDateKey,
    todayAppOpens: 0,
    last7DaysAppOpens: 0,
    dailyAppOpens: buildLastDateKeys(todayDateKey, 7).map((dateKey) => ({ label: dateKey, value: 0 })),
    topSections: [],
    topSigns: [],
    compatibilityModes: [],
    topPairs: [],
    counters: {
      natalChartOpens: 0,
      coupleHoroscopeOpens: 0,
      relationshipMapOpens: 0,
      luckyDaysOpens: 0,
      vipClicks: 0,
      giveawayClicks: 0,
      messageHelperUse: 0,
    },
    funnel: [
      { label: "app_open", value: 0 },
      { label: "sign_selected", value: 0 },
      { label: "section_open", value: 0 },
      { label: "calculation", value: 0 },
    ],
  };
}

function buildLastDateKeys(todayDateKey: string, count: number) {
  return Array.from({ length: count }, (_, index) => addDaysToDateKey(todayDateKey, -index));
}

function key(scope: string, dateKey: string) {
  return `${keyPrefix}:${scope}:${dateKey}`;
}

function normalizePair(firstSign: string, secondSign: string) {
  return [firstSign, secondSign].sort().join("+");
}

function funnelStepForEvent(event: ZodiacAnalyticsEventName) {
  if (event === "app_open") return "app_open";
  if (event === "sign_selected") return "sign_selected";
  if (event === "compatibility_calculated") return "calculation";
  if (event.startsWith("section_open_")) return "section_open";
  return "feature_use";
}

function mergeRankMap(target: Map<string, number>, value: unknown) {
  const list = Array.isArray(value) ? value : [];
  for (let index = 0; index < list.length; index += 2) {
    const label = typeof list[index] === "string" ? list[index] : null;
    if (!label) continue;
    target.set(label, (target.get(label) ?? 0) + toNumber(list[index + 1]));
  }
}

function rankItems(map: Map<string, number>) {
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
    .slice(0, 10);
}

function countEvents(events: Map<string, number>, names: string[]) {
  return names.reduce((sum, name) => sum + (events.get(name) ?? 0), 0);
}

function sectionOpenCount(events: Map<string, number>) {
  return Array.from(events.entries()).reduce((sum, [event, value]) => (event.startsWith("section_open_") ? sum + value : sum), 0);
}

function toNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}
