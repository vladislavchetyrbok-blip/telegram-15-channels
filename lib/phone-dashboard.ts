import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getPublishMonitorStatus } from "@/lib/publish-monitor";
import { getPublishSchedulerStatus, type PublicationLogStatusEntry } from "@/lib/publish-scheduler-status";
import { getSupabaseReadinessStatus } from "@/lib/supabase-readiness";
import { getTelegramChannelTargets } from "@/lib/telegram-channel-targets";

interface TelegramDiagnosticsFile {
  ok?: boolean;
  linked?: number;
  channelsTotal?: number;
  accessOk?: number;
  canPost?: number;
  checkedAt?: string;
  checks?: Array<{
    channelId?: string;
    accessStatus?: string;
    exactError?: string | null;
    botAdmin?: boolean;
    canPost?: boolean;
  }>;
}

interface WeeklyPlanFile {
  summary?: {
    weakText?: number;
    weakImage?: number;
    blocked?: number;
    missingImages?: number;
  };
  items?: Array<{
    status?: string;
    qualityIssues?: string[];
    telegramImageStatus?: string;
  }>;
}

export interface PhoneDashboardStatus {
  ok: boolean;
  mode: "github_actions_json";
  storeMode: string;
  dryRun: boolean;
  realPublishEnabled: boolean;
  autopublishEnabled: boolean;
  queue: ReturnType<typeof getPublishMonitorStatus>["queue"];
  today: ReturnType<typeof getPublishMonitorStatus>["today"] & {
    skippedToday: number;
    failedToday: number;
  };
  reserve: ReturnType<typeof getPublishMonitorStatus>["reserve"];
  telegram: {
    targetsLinked: number;
    targetsTotal: number;
    botAccessOk: number;
    botAccessTotal: number;
    canPost: number;
    checkedAt: string | null;
    channels: Array<{
      channelId: string;
      linked: boolean;
      accessStatus: string;
      canPost: boolean;
      link: string | null;
      error: string | null;
    }>;
  };
  githubActions: ReturnType<typeof getPublishMonitorStatus>["githubActions"] & {
    mode: "active" | "passive";
    actionsUrl: string | null;
  };
  nextExpectedPublishTime: string | null;
  contentQuality: {
    status: "OK" | "needs attention";
    weakText: number;
    weakImage: number;
    blocked: number;
    missingImages: number;
    scheduledIssues: number;
  };
  supabaseMigration: {
    currentStoreMode: string;
    databaseActive: boolean;
    jsonStoreActive: boolean;
    dryRunReady: boolean;
    productionPublishUnaffected: boolean;
  };
  lastRun: ReturnType<typeof getPublishSchedulerStatus>["lastRun"];
  lastPublished: PublicationLogStatusEntry | null;
  lastError: PublicationLogStatusEntry | null;
  warnings: string[];
  emergencyActions: Array<{
    title: string;
    detail: string;
  }>;
}

const runtimeDir = path.join(process.cwd(), "data", "runtime");
const telegramDiagnosticsPath = path.join(runtimeDir, "telegram-access-diagnostics.json");
const weeklyPlanPath = path.join(runtimeDir, "weekly-content-plan.json");

export function getPhoneDashboardStatus(): PhoneDashboardStatus {
  const monitor = getPublishMonitorStatus();
  const scheduler = getPublishSchedulerStatus();
  const diagnostics = readJson<TelegramDiagnosticsFile>(telegramDiagnosticsPath, {});
  const weekly = readJson<WeeklyPlanFile>(weeklyPlanPath, {});
  const targets = getTelegramChannelTargets();
  const supabase = getSupabaseReadinessStatus();
  const checks = diagnostics.checks ?? [];
  const skippedToday = monitor.recent.skipped.filter((entry) => isTodayEntry(entry, monitor.today.date, monitor.timezone)).length;
  const failedToday = monitor.recent.failed.filter((entry) => isTodayEntry(entry, monitor.today.date, monitor.timezone)).length;
  const contentQuality = getContentQuality(weekly);
  const githubActionsMode = monitor.githubActions.checklist.every((item) => item.ok) ? "active" : "passive";
  const warnings = [
    ...monitor.warnings,
    ...(contentQuality.status === "OK" ? [] : ["Content quality needs attention in the current JSON plan."]),
    ...((diagnostics.accessOk ?? 0) >= targets.length ? [] : ["Telegram bot access is not OK for all configured channels."]),
  ];

  return {
    ok: true,
    mode: "github_actions_json",
    storeMode: monitor.storeMode,
    dryRun: monitor.dryRun,
    realPublishEnabled: monitor.realPublishEnabled,
    autopublishEnabled: monitor.realPublishEnabled && !monitor.dryRun && monitor.storeMode === "json" && githubActionsMode === "active",
    queue: monitor.queue,
    today: {
      ...monitor.today,
      skippedToday,
      failedToday,
    },
    reserve: monitor.reserve,
    telegram: {
      targetsLinked: targets.filter((target) => target.configured).length,
      targetsTotal: targets.length,
      botAccessOk: Number(diagnostics.accessOk ?? 0),
      botAccessTotal: Number(diagnostics.channelsTotal ?? targets.length),
      canPost: Number(diagnostics.canPost ?? 0),
      checkedAt: diagnostics.checkedAt ?? null,
      channels: targets.map((target) => {
        const check = checks.find((item) => item.channelId === target.channelId);
        return {
          channelId: target.channelId,
          linked: target.configured,
          accessStatus: check?.accessStatus ?? "not_checked",
          canPost: Boolean(check?.canPost),
          link: target.target.startsWith("@") ? `https://t.me/${target.target.slice(1)}` : null,
          error: check?.exactError ?? null,
        };
      }),
    },
    githubActions: {
      ...monitor.githubActions,
      mode: githubActionsMode,
      actionsUrl: process.env.NEXT_PUBLIC_GITHUB_ACTIONS_URL || null,
    },
    nextExpectedPublishTime: monitor.nextScheduledCheck,
    contentQuality,
    supabaseMigration: {
      currentStoreMode: supabase.currentStoreMode,
      databaseActive: supabase.currentStoreMode === "postgres",
      jsonStoreActive: supabase.jsonStoreStillActive,
      dryRunReady: supabase.safeToMigrateDryRun,
      productionPublishUnaffected: supabase.productionPublishUnaffected,
    },
    lastRun: scheduler.lastRun,
    lastPublished: monitor.recent.published[0] ?? null,
    lastError: monitor.recent.failed[0] ?? null,
    warnings: Array.from(new Set(warnings)),
    emergencyActions: [
      { title: "Stop publishing", detail: "Set TELEGRAM_REAL_PUBLISH_ENABLED=false in GitHub Secrets." },
      { title: "Enable test mode", detail: "Set TELEGRAM_DRY_RUN=true in GitHub Secrets." },
      { title: "Return to live mode", detail: "Set TELEGRAM_DRY_RUN=false and TELEGRAM_REAL_PUBLISH_ENABLED=true." },
      { title: "Avoid duplicates", detail: "Do not press Run workflow many times in a row. already_published means duplicate protection worked." },
    ],
  };
}

function getContentQuality(weekly: WeeklyPlanFile): PhoneDashboardStatus["contentQuality"] {
  const weakText = Number(weekly.summary?.weakText ?? 0);
  const weakImage = Number(weekly.summary?.weakImage ?? 0);
  const blocked = Number(weekly.summary?.blocked ?? 0);
  const missingImages = Number(weekly.summary?.missingImages ?? 0);
  const scheduledIssues = (weekly.items ?? []).filter((item) => {
    const status = String(item.status ?? "").toLowerCase();
    return ["ready", "approved", "draft", "scheduled"].includes(status) && ((item.qualityIssues?.length ?? 0) > 0 || item.telegramImageStatus !== "OK");
  }).length;

  return {
    status: weakText === 0 && weakImage === 0 && missingImages === 0 && scheduledIssues === 0 ? "OK" : "needs attention",
    weakText,
    weakImage,
    blocked,
    missingImages,
    scheduledIssues,
  };
}

function isTodayEntry(entry: PublicationLogStatusEntry, today: string, timezone: string) {
  const parsed = new Date(entry.createdAt);
  if (Number.isNaN(parsed.getTime())) return false;
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(parsed) === today;
}

function readJson<T>(filePath: string, fallback: T): T {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}
