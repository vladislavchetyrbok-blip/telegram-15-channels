import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { channels } from "@/data/channels";
import { getWeeklyContentPlanState } from "@/lib/weekly-content-plan";

type RuntimeLogEntry = {
  attemptedAt: string;
  channelId: string | null;
  channelName: string | null;
  title: string | null;
  result: "success" | "failed" | "blocked" | "skipped" | "already_published";
  status?: string;
  telegramMessageId: number | null;
  telegramMessageLink?: string | null;
  error: string | null;
};

type RuntimeState = {
  config?: {
    enabled?: boolean;
    pausedToday?: boolean;
    emergencyStop?: boolean;
    timezone?: string;
  };
  log?: RuntimeLogEntry[];
  adminReports?: {
    enabled?: boolean;
    chatIdConfigured?: boolean;
    lastDailyReportAt?: string | null;
    lastTestReportAt?: string | null;
    lastStatusReportAt?: string | null;
    lastErrorAlertAt?: string | null;
    lastReportResult?: "success" | "skipped" | "error" | null;
    lastReportReason?: string | null;
  };
  lastDailyReportAt?: string | null;
  lastWorkerHeartbeatAt?: string | null;
  protectionMode?: {
    enabled?: boolean;
    reason?: string | null;
    activatedAt?: string | null;
    clearedAt?: string | null;
  };
  protectionReason?: string | null;
  paused?: boolean;
  pausedReason?: string | null;
  errorCounters?: {
    consecutive?: number;
    total24h?: number;
    lastErrorAt?: string | null;
  };
  lastAlerts?: Record<string, string>;
  dailyStats?: {
    date: string;
    success: number;
    skipped: number;
    errors: number;
  };
};

export type AdminReportKind = "daily" | "test" | "status" | "worker" | "full_send_summary" | "next_publications";

const runtimePath = path.join(process.cwd(), "data", "runtime", "autopublish.json");
const alertCooldownMs = 30 * 60_000;

export function getAdminReportsStatus() {
  const state = readRuntimeState();
  const adminReports = normalizeAdminReports(state);

  return {
    enabled: adminReports.enabled,
    chatIdConfigured: Boolean(process.env.ADMIN_TELEGRAM_CHAT_ID),
    lastDailyReportAt: state.lastDailyReportAt ?? adminReports.lastDailyReportAt ?? null,
    lastTestReportAt: adminReports.lastTestReportAt ?? null,
    lastStatusReportAt: adminReports.lastStatusReportAt ?? null,
    lastErrorAlertAt: adminReports.lastErrorAlertAt ?? null,
    lastReportResult: adminReports.lastReportResult ?? null,
    lastReportReason: adminReports.lastReportReason ?? null,
  };
}

export async function sendAdminTestReport() {
  return sendAdminReport({
    kind: "test",
    text: buildStatusReportText("Test Admin Report"),
  });
}

export async function sendAdminStatusReport() {
  return sendAdminReport({
    kind: "status",
    text: buildStatusReportText("Telegram Autopilot Status"),
  });
}

export async function sendAdminDailyReport() {
  return sendAdminReport({
    kind: "daily",
    text: buildDailyReportText(),
  });
}

export async function sendAdminWorkerStatusReport() {
  const state = readRuntimeState();
  return sendAdminReport({
    kind: "worker",
    text: [
      "Telegram Worker Status",
      "",
      `Worker heartbeat: ${state.lastWorkerHeartbeatAt ?? "none"}`,
      `Protection mode: ${state.protectionMode?.enabled ? "ON" : "OFF"}`,
      `Reason: ${state.protectionMode?.reason ?? "none"}`,
    ].join("\n"),
  });
}

export async function sendAdminFullSendSummary(summary: string) {
  return sendAdminReport({
    kind: "full_send_summary",
    text: `Telegram Full-send Summary\n\n${summary}`,
  });
}

export async function sendAdminNextPublicationsSummary() {
  const weekly = getWeeklyContentPlanState();
  const next = weekly.items
    .filter((item) => item.status === "ready_to_publish" || item.status === "scheduled")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 15);

  return sendAdminReport({
    kind: "next_publications",
    text: [
      "Next Publications Summary",
      "",
      ...next.map((item) => `${item.contentPlanDate} ${item.publishTime} Europe/Kyiv — ${item.channelId} — ${item.title}`),
    ].join("\n"),
  });
}

export async function sendAdminErrorAlert({
  channelId,
  channelName,
  reason,
  occurredAt,
  actionHint,
}: {
  channelId: string | null;
  channelName: string | null;
  reason: string;
  occurredAt: string;
  actionHint: string;
}) {
  const state = readRuntimeState();
  const key = buildAlertKey(channelId, reason);
  const lastSentAt = state.lastAlerts?.[key] ? new Date(state.lastAlerts[key]).getTime() : 0;

  if (lastSentAt && Date.now() - lastSentAt < alertCooldownMs) {
    return {
      ok: true,
      sent: false,
      skipped: true,
      reason: "alert_cooldown_active",
      key,
    };
  }

  const result = await sendAdminReport({
    kind: "status",
    text: [
      "Ошибка автопубликации",
      `Канал: ${channelName ?? channelId ?? "system"}`,
      `Время: ${occurredAt}`,
      `Причина: ${reason}`,
      `Что делать: ${actionHint}`,
    ].join("\n"),
  });

  const next = readRuntimeState();
  next.lastAlerts = { ...(next.lastAlerts ?? {}), [key]: new Date().toISOString() };
  next.adminReports = {
    ...normalizeAdminReports(next),
    lastErrorAlertAt: result.sent ? new Date().toISOString() : normalizeAdminReports(next).lastErrorAlertAt ?? null,
    lastReportResult: result.sent ? "success" : result.ok ? "skipped" : "error",
    lastReportReason: result.reason ?? null,
  };
  writeRuntimeState(next);

  return { ...result, key };
}

export function markWorkerHeartbeatInRuntime(payload: { at?: string; status?: string; error?: string | null } = {}) {
  const state = readRuntimeState();
  state.lastWorkerHeartbeatAt = payload.at ?? new Date().toISOString();
  if (payload.error) {
    state.errorCounters = {
      consecutive: (state.errorCounters?.consecutive ?? 0) + 1,
      total24h: state.errorCounters?.total24h ?? 0,
      lastErrorAt: state.lastWorkerHeartbeatAt,
    };
  }
  writeRuntimeState(state);

  return {
    ok: true,
    lastWorkerHeartbeatAt: state.lastWorkerHeartbeatAt,
  };
}

function buildDailyReportText() {
  const state = readRuntimeState();
  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10);
  const log = (state.log ?? []).filter((entry) => entry.channelId && entry.attemptedAt?.slice(0, 10) === dateKey);
  const success = log.filter((entry) => entry.result === "success").length;
  const skipped = log.filter((entry) => entry.result === "skipped" || entry.result === "already_published").length;
  const errors = log.filter((entry) => entry.result === "failed" || entry.result === "blocked").length;
  const recent = [...log].reverse().slice(0, 8);
  const errorRows = [...log].reverse().filter((entry) => entry.result === "failed" || entry.result === "blocked").slice(0, 8);
  const next = findNextPublication();

  return [
    "Telegram Autopublish Daily Report",
    "",
    `Дата: ${dateKey}`,
    `Автопубликация: ${state.config?.enabled && !state.config?.pausedToday && !state.config?.emergencyStop ? "ON" : "OFF"}`,
    `Активных каналов: ${channels.length}/${channels.length}`,
    "Опубликовано сегодня:",
    `Success: ${success}`,
    `Skipped: ${skipped}`,
    `Errors: ${errors}`,
    "",
    "Последние публикации:",
    ...(recent.length ? recent.map((entry, index) => `${index + 1}. ${entry.channelId ?? "system"} — ${entry.title ?? "-"} — ${entry.status ?? entry.result}`) : ["Нет записей"]),
    "",
    "Ошибки:",
    ...(errorRows.length ? errorRows.map((entry) => `- ${entry.channelId ?? "system"}: ${entry.error ?? entry.result}`) : ["Ошибок нет"]),
    "",
    "Следующая публикация:",
    next ? `${next.channelId}\n${next.publishTime} Europe/Kyiv\n${next.title}` : "Нет готовой публикации",
  ].join("\n");
}

function buildStatusReportText(title: string) {
  const state = readRuntimeState();
  const next = findNextPublication();
  const daily = buildRuntimeDailyStats(state);

  return [
    title,
    "",
    `Autopublish: ${state.config?.enabled ? "ON" : "OFF"}`,
    `Paused: ${state.paused || state.config?.pausedToday ? "YES" : "NO"}`,
    `Protection mode: ${state.protectionMode?.enabled ? "ON" : "OFF"}`,
    `Protection reason: ${state.protectionMode?.reason ?? "none"}`,
    `Worker heartbeat: ${state.lastWorkerHeartbeatAt ?? "none"}`,
    `Admin reports: ${normalizeAdminReports(state).enabled ? "enabled" : "disabled"}`,
    `Today success/skipped/errors: ${daily.success}/${daily.skipped}/${daily.errors}`,
    `Next: ${next ? `${next.channelId} ${next.publishTime} Europe/Kyiv — ${next.title}` : "none"}`,
  ].join("\n");
}

function buildRuntimeDailyStats(state: RuntimeState) {
  const dateKey = new Date().toISOString().slice(0, 10);
  const today = (state.log ?? []).filter((entry) => entry.channelId && entry.attemptedAt?.slice(0, 10) === dateKey);

  return {
    success: today.filter((entry) => entry.result === "success").length,
    skipped: today.filter((entry) => entry.result === "skipped" || entry.result === "already_published").length,
    errors: today.filter((entry) => entry.result === "failed" || entry.result === "blocked").length,
  };
}

async function sendAdminReport({ kind, text }: { kind: AdminReportKind; text: string }) {
  const state = readRuntimeState();
  const reports = normalizeAdminReports(state);
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
  const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID?.trim() ?? "";

  if (!reports.enabled) {
    updateReportState(kind, "skipped", "ADMIN_REPORTS_ENABLED is not true");
    return { ok: true, sent: false, reason: "ADMIN_REPORTS_ENABLED is not true", text };
  }

  if (!chatId) {
    updateReportState(kind, "skipped", "ADMIN_TELEGRAM_CHAT_ID is missing");
    return { ok: true, sent: false, reason: "ADMIN_TELEGRAM_CHAT_ID is missing", text };
  }

  if (!token) {
    updateReportState(kind, "error", "TELEGRAM_BOT_TOKEN is missing");
    return { ok: false, sent: false, reason: "TELEGRAM_BOT_TOKEN is missing", text };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });
    const payload = await response.json().catch(() => null) as { ok?: boolean; description?: string } | null;

    if (!response.ok || !payload?.ok) {
      const reason = payload?.description ?? `Telegram API returned ${response.status}`;
      updateReportState(kind, "error", reason);
      return { ok: false, sent: false, reason, text };
    }

    updateReportState(kind, "success", null);
    return { ok: true, sent: true, reason: null, text };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Telegram admin report error";
    updateReportState(kind, "error", reason);
    return { ok: false, sent: false, reason, text };
  }
}

function updateReportState(kind: AdminReportKind, result: "success" | "skipped" | "error", reason: string | null) {
  const state = readRuntimeState();
  const now = new Date().toISOString();
  const reports = normalizeAdminReports(state);
  state.adminReports = {
    ...reports,
    lastDailyReportAt: kind === "daily" ? now : reports.lastDailyReportAt ?? null,
    lastTestReportAt: kind === "test" ? now : reports.lastTestReportAt ?? null,
    lastStatusReportAt: kind === "status" || kind === "worker" || kind === "next_publications" || kind === "full_send_summary" ? now : reports.lastStatusReportAt ?? null,
    lastErrorAlertAt: reports.lastErrorAlertAt ?? null,
    lastReportResult: result,
    lastReportReason: reason,
  };
  state.lastDailyReportAt = state.adminReports.lastDailyReportAt ?? state.lastDailyReportAt ?? null;
  writeRuntimeState(state);
}

function normalizeAdminReports(state: RuntimeState) {
  return {
    enabled: process.env.ADMIN_REPORTS_ENABLED === "true" || Boolean(state.adminReports?.enabled),
    chatIdConfigured: Boolean(process.env.ADMIN_TELEGRAM_CHAT_ID),
    lastDailyReportAt: state.lastDailyReportAt ?? state.adminReports?.lastDailyReportAt ?? null,
    lastTestReportAt: state.adminReports?.lastTestReportAt ?? null,
    lastStatusReportAt: state.adminReports?.lastStatusReportAt ?? null,
    lastErrorAlertAt: state.adminReports?.lastErrorAlertAt ?? null,
    lastReportResult: state.adminReports?.lastReportResult ?? null,
    lastReportReason: state.adminReports?.lastReportReason ?? null,
  };
}

function findNextPublication() {
  const weekly = getWeeklyContentPlanState();
  return weekly.items
    .filter((item) => (item.status === "ready_to_publish" || item.status === "scheduled") && !item.telegramMessageId)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0] ?? null;
}

function buildAlertKey(channelId: string | null, reason: string) {
  return `${channelId ?? "system"}:${reason.toLowerCase().replace(/\s+/g, "_").slice(0, 80)}`;
}

function readRuntimeState(): RuntimeState {
  if (!existsSync(runtimePath)) return {};
  return JSON.parse(readFileSync(runtimePath, "utf8")) as RuntimeState;
}

function writeRuntimeState(state: RuntimeState) {
  mkdirSync(path.dirname(runtimePath), { recursive: true });
  writeFileSync(runtimePath, JSON.stringify(state, null, 2), "utf8");
}
