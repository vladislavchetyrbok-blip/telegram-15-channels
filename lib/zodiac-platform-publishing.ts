import fs from "fs";
import path from "path";
import { addDaysToDateKey, DEFAULT_ZODIAC_TIME_ZONE, getCurrentZodiacDateKey, getWeekRangeForDate } from "@/lib/zodiac-date";
import { zodiacPlatformChannels, zodiacPlatformSummary } from "@/lib/zodiac-platform-management";

type LedgerEntry = {
  date?: string;
  slug?: string;
  status?: string;
};

const ledgerPath = path.join(process.cwd(), "data", "state", "zodiac-publish-ledger.json");

export const zodiacPublishingCommandHints = [
  {
    title: "Проверить workflow",
    command: "npm run zodiac:workflow:check -- --date YYYY-MM-DD",
    note: "Статический workflow/status check, без Telegram API calls.",
  },
  {
    title: "Dry-run публикации",
    command: "npm run zodiac:publish-date:dry -- --date YYYY-MM-DD",
    note: "Должен показать Telegram API calls: 0 и Ledger Writes: 0.",
  },
  {
    title: "Dry-run навигации",
    command: "npm run zodiac:navigation:all:dry",
    note: "Проверяет pinned navigation без публикации.",
  },
  {
    title: "Dry-run описаний",
    command: "npm run zodiac:descriptions:dry",
    note: "Проверяет описания каналов без live изменения.",
  },
  {
    title: "Ledger safety",
    command: "npm run zodiac:ledger:safety:check",
    note: "Проверяет fail-closed защиту ledger.",
  },
  {
    title: "Production safety",
    command: "npm run production:safety:check",
    note: "Проверяет общий production guardrail без публикации.",
  },
];

export function getZodiacPublishingDashboard(dateKey = getCurrentZodiacDateKey(DEFAULT_ZODIAC_TIME_ZONE)) {
  const tomorrowDateKey = addDaysToDateKey(dateKey, 1);
  const weekRange = getWeekRangeForDate(dateKey, DEFAULT_ZODIAC_TIME_ZONE);
  const ledgerEntries = readLedgerEntries();
  const today = summarizeDate(dateKey, ledgerEntries);
  const tomorrow = summarizeDate(tomorrowDateKey, ledgerEntries);

  return {
    dateKey,
    tomorrowDateKey,
    weekRange,
    isoWeek: getIsoWeekNumber(dateKey),
    expectedChannels: zodiacPlatformSummary.totalChannels,
    expectedPostsPerDay: zodiacPlatformSummary.totalChannels,
    channelCoverage: {
      totalChannels: zodiacPlatformSummary.totalChannels,
      activeChannels: zodiacPlatformChannels.filter((channel) => channel.risk !== "blocked").length,
      channelsWithNavigation: zodiacPlatformSummary.navigationReady,
      channelsWithDescriptions: zodiacPlatformSummary.descriptionsReady,
      channelsWithDailyPublishing: zodiacPlatformSummary.publishingReady,
      missingConfig: zodiacPlatformChannels.filter((channel) => !channel.telegramUrl || channel.risk !== "ok").length,
    },
    calendar: [
      {
        label: "Сегодня",
        dateKey,
        expectedPosts: zodiacPlatformSummary.totalChannels,
        status: today.sentCount >= zodiacPlatformSummary.totalChannels ? "опубликовано / duplicate protected" : "dry-run available",
        ledgerSent: today.sentCount,
        ledgerMissing: today.missingCount,
      },
      {
        label: "Завтра",
        dateKey: tomorrowDateKey,
        expectedPosts: zodiacPlatformSummary.totalChannels,
        status: tomorrow.sentCount > 0 ? "частично есть в ledger" : "scheduled / dry-run available",
        ledgerSent: tomorrow.sentCount,
        ledgerMissing: tomorrow.missingCount,
      },
      {
        label: "Неделя",
        dateKey: `${weekRange.startDateKey} - ${weekRange.endDateKey}`,
        expectedPosts: zodiacPlatformSummary.totalChannels,
        status: "weekly dry-run ready / weekly live OFF",
        ledgerSent: 0,
        ledgerMissing: 0,
      },
    ],
  };
}

function readLedgerEntries() {
  try {
    const raw = fs.readFileSync(ledgerPath, "utf8");
    const parsed = JSON.parse(raw) as { entries?: Record<string, LedgerEntry> };
    return parsed.entries ?? {};
  } catch {
    return {};
  }
}

function summarizeDate(dateKey: string, entries: Record<string, LedgerEntry>) {
  const sentCount = zodiacPlatformChannels.filter((channel) => {
    const entry = entries[`${dateKey}:${channel.slug}`] ?? Object.values(entries).find((item) => item.date === dateKey && item.slug === channel.slug);
    return entry?.status === "sent" || entry?.status === "published";
  }).length;

  return {
    sentCount,
    missingCount: Math.max(0, zodiacPlatformSummary.totalChannels - sentCount),
  };
}

function getIsoWeekNumber(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
