"use client";

import { useEffect, useMemo, useState } from "react";
import { EyeOff, Filter, History, RefreshCcw, Send, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type PublishStatus =
  | "ready_to_publish"
  | "published"
  | "failed"
  | "skipped"
  | "already_published"
  | "blocked"
  | "no_ready_posts"
  | "target_missing"
  | "bot_access_failed"
  | "image_missing"
  | "text_broken"
  | "forbidden_currency";
type PublishMode = "quick_publish" | "retry_failed" | "continue_queue";
type LogFilter = "all" | "success" | "failed" | "skipped" | "blocked" | "already_published";

interface PublishQueueItem {
  channelId: string;
  channelName: string;
  telegramTarget: string;
  selectedPost: string | null;
  selectedPostTitle: string | null;
  imagePath: string | null;
  telegramImagePath: string | null;
  telegramImageStatus: string;
  botAccess: string;
  imageStatus: string;
  textStatus: string;
  status: PublishStatus;
  blockerReason: string | null;
  lastSendAt: string | null;
  telegramMessageId: number | null;
  telegramPublishedAt: string | null;
  publishResult: "success" | "failed" | "skipped" | "blocked" | "already_published" | null;
  publishError: string | null;
}

interface PublishLogEntry {
  id: string;
  channelId: string;
  channelName: string;
  telegramTarget: string;
  postId: string | null;
  title: string | null;
  imagePath: string | null;
  telegramImagePath: string | null;
  telegramImageStatus: string | null;
  attemptedAt: string;
  result: "success" | "failed" | "skipped" | "blocked" | "already_published";
  telegramMessageId: number | null;
  error: string | null;
  mode: PublishMode;
}

interface PublishingCenterStatus {
  ok: boolean;
  channelsTotal: number;
  linkedTargets: number;
  botAccessOk: number;
  readyPosts: number;
  published: number;
  errors: number;
  skipped: number;
  alreadyPublished: number;
  remainingInQueue: number;
  maxPostsPerRun: 15;
  maxPostsPerChannel: 1;
  realMassPublishEnabled: false;
  autopostingDisabled: true;
  allowRealPublish: false;
  queue: PublishQueueItem[];
  publishLog: PublishLogEntry[];
  lastResult: QuickPublishResult | null;
  updatedAt: string;
}

interface TelegramPostImagesAudit {
  ok: boolean;
  checked: number;
  svgCount: number;
  pngOrJpgCreated: number;
  telegramImageStatusOk: number;
  missing: number;
  broken: number;
  failed: number;
  unsupportedOrBroken: number;
  images: Array<{
    postId: string;
    channelId: string;
    imageUrl: string;
    telegramImagePath: string;
    telegramImageStatus: string;
    created: boolean;
    reason: string | null;
  }>;
}

interface QuickPublishResult extends PublishingCenterStatus {
  confirmed: boolean;
  mode: PublishMode;
  readyToPublish: number;
  publishedSuccess: number;
  failed: number;
  skippedTotal: number;
  alreadyPublishedTotal: number;
  seededTargets: number;
  items: PublishQueueItem[];
  message: string;
}

export function TelegramQuickPublishPanel() {
  const [confirming, setConfirming] = useState<PublishMode | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<PublishingCenterStatus | null>(null);
  const [result, setResult] = useState<QuickPublishResult | null>(null);
  const [showProblemOnly, setShowProblemOnly] = useState(false);
  const [logFilter, setLogFilter] = useState<LogFilter>("all");
  const [imageAudit, setImageAudit] = useState<TelegramPostImagesAudit | null>(null);
  const [targetEdits, setTargetEdits] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("Центр публикаций готов к проверке очереди.");

  useEffect(() => {
    void loadStatus();
  }, []);

  async function loadStatus(showLastResult = true) {
    try {
      setBusy(true);
      const response = await fetch("/api/telegram/quick-publish", { cache: "no-store" });
      const payload = (await response.json()) as PublishingCenterStatus;
      setStatus(payload);

      if (showLastResult && payload.lastResult) {
        setResult(payload.lastResult);
        setMessage(payload.lastResult.message);
      } else {
        setResult(null);
        setMessage("Очередь пересчитана. Можно запускать быструю публикацию или продолжить очередь.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function runPublish(mode: PublishMode) {
    try {
      setBusy(true);
      setConfirming(null);
      const response = await fetch("/api/telegram/quick-publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true, mode }),
      });
      const payload = (await response.json()) as QuickPublishResult;
      setResult(payload);
      setStatus(payload);
      setMessage(payload.message);
      await loadStatus();
    } finally {
      setBusy(false);
    }
  }

  async function prepareTelegramImages() {
    try {
      setBusy(true);
      const response = await fetch("/api/telegram/post-images", { method: "POST" });
      const payload = (await response.json()) as TelegramPostImagesAudit;
      setImageAudit(payload);
      setMessage(
        `Telegram images prepared. Checked: ${payload.checked}. SVG: ${payload.svgCount}. Converted to PNG: ${payload.pngOrJpgCreated}. OK: ${payload.telegramImageStatusOk}. Missing: ${payload.missing}. Broken: ${payload.broken}. Failed: ${payload.failed}.`,
      );
      await loadStatus(false);
    } finally {
      setBusy(false);
    }
  }

  async function saveTelegramTarget(channelId: string) {
    const telegramTarget = targetEdits[channelId]?.trim();

    if (!telegramTarget) {
      setMessage("Введите telegramTarget: -100xxxxxxxxxx или @username.");
      return;
    }

    try {
      setBusy(true);
      const response = await fetch(`/api/telegram/targets/${channelId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramTarget, telegramLinkSource: "manual" }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || payload.ok === false) {
        setMessage(payload.error ?? "Не удалось сохранить telegramTarget.");
        return;
      }

      setMessage("telegramTarget сохранён. Нажмите «Обновить очередь», затем «Повторить только ошибки».");
      await loadStatus(false);
    } finally {
      setBusy(false);
    }
  }

  const rows = useMemo(() => {
    const source = result?.items.length ? result.items : status?.queue ?? [];

    if (!showProblemOnly) {
      return source;
    }

    return source.filter((item) => item.status !== "ready_to_publish" && item.status !== "published" && item.status !== "already_published");
  }, [result?.items, showProblemOnly, status?.queue]);

  const logs = useMemo(() => {
    const source = result?.publishLog ?? status?.publishLog ?? [];
    const normalized = source.slice().reverse();

    if (logFilter === "all") {
      return normalized;
    }

    return normalized.filter((entry) => entry.result === logFilter);
  }, [logFilter, result?.publishLog, status?.publishLog]);

  const failedCount =
    result?.items.filter((item) => item.publishResult === "failed" || isTargetFixable(item)).length ??
    status?.queue.filter((item) => item.status === "failed" || isTargetFixable(item)).length ??
    0;

  return (
    <section className="rounded-lg border border-emerald-300/25 bg-emerald-300/5 p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Publishing center</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Центр публикаций</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Быстрая публикация проходит очередь один раз: максимум 1 готовый пост на канал и максимум 15 постов за запуск.
            Дубли блокируются по статусу, message_id и журналу успешных публикаций.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 xl:justify-end">
          <button
            type="button"
            onClick={() => loadStatus(false)}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line px-4 text-sm font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
            Обновить очередь
          </button>
          <button
            type="button"
            onClick={prepareTelegramImages}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/40 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Подготовить картинки для Telegram
          </button>
          <button
            type="button"
            onClick={() => setConfirming("quick_publish")}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className={cn("h-4 w-4", busy && "animate-pulse")} />
            Запустить быструю публикацию
          </button>
          <button
            type="button"
            onClick={() => setConfirming("retry_failed")}
            disabled={busy || failedCount === 0}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-rose-300/40 px-4 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Повторить только ошибки
          </button>
          <button
            type="button"
            onClick={() => setConfirming("continue_queue")}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/40 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Продолжить очередь
          </button>
          <button
            type="button"
            onClick={() => setShowProblemOnly((value) => !value)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-amber-300/40 px-4 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/10"
          >
            {showProblemOnly ? <EyeOff className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
            {showProblemOnly ? "Показать все" : "Показать проблемные"}
          </button>
        </div>
      </div>

      {confirming ? (
        <div className="mt-4 rounded-lg border border-emerald-300/30 bg-slate-950/80 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-emerald-200" />
            <div>
              <p className="font-semibold text-white">{getConfirmationTitle(confirming)}</p>
              <p className="mt-2 text-sm text-slate-400">
                Будет отправлено не больше одного поста на канал. Уже опубликованные postId не отправляются повторно.
                Таймер, расписание и бесконечный автопостинг не включаются.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => setConfirming(null)} className="h-9 rounded-md border border-line px-3 text-xs font-semibold text-slate-200">
                  Отмена
                </button>
                <button type="button" onClick={() => runPublish(confirming)} className="h-9 rounded-md bg-emerald-300 px-3 text-xs font-semibold text-slate-950">
                  Да, выполнить
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-5 xl:grid-cols-9">
        <Metric label="Каналов всего" value={status?.channelsTotal ?? 15} />
        <Metric label="Targets linked" value={status?.linkedTargets ?? 0} tone="dry" />
        <Metric label="Bot access OK" value={status?.botAccessOk ?? 0} tone={(status?.botAccessOk ?? 0) === 15 ? "ok" : "warn"} />
        <Metric label="Готовых постов" value={status?.readyPosts ?? 0} tone="ok" />
        <Metric label="Опубликовано" value={status?.published ?? 0} tone="ok" />
        <Metric label="Ошибок" value={status?.errors ?? 0} tone={(status?.errors ?? 0) ? "error" : "ok"} />
        <Metric label="Пропущено" value={status?.skipped ?? 0} tone={(status?.skipped ?? 0) ? "warn" : "ok"} />
        <Metric label="Уже опубликовано" value={status?.alreadyPublished ?? 0} tone={(status?.alreadyPublished ?? 0) ? "warn" : "dry"} />
        <Metric label="Осталось" value={status?.remainingInQueue ?? 0} tone={(status?.remainingInQueue ?? 0) ? "dry" : "ok"} />
      </div>

      {imageAudit ? (
        <div className="mt-4 rounded-lg border border-cyan-300/25 bg-cyan-300/10 p-4">
          <div className="grid gap-3 md:grid-cols-7">
            <Metric label="Images checked" value={imageAudit.checked} tone="dry" />
            <Metric label="SVG sources" value={imageAudit.svgCount} tone={imageAudit.svgCount ? "warn" : "ok"} />
            <Metric label="Converted to PNG" value={imageAudit.pngOrJpgCreated} tone="ok" />
            <Metric label="Telegram OK" value={imageAudit.telegramImageStatusOk} tone="ok" />
            <Metric label="Missing" value={imageAudit.missing} tone={imageAudit.missing ? "error" : "ok"} />
            <Metric label="Broken" value={imageAudit.broken} tone={imageAudit.broken ? "error" : "ok"} />
            <Metric label="Failed" value={imageAudit.failed} tone={imageAudit.failed ? "error" : "ok"} />
          </div>
          {imageAudit.unsupportedOrBroken ? (
            <div className="mt-3 grid gap-2 text-xs text-rose-100">
              {imageAudit.images.filter((item) => item.telegramImageStatus !== "OK").map((item) => (
                <p key={item.postId}>
                  {item.channelId} / {item.postId}: {item.telegramImageStatus} — {item.reason ?? "check image"}.
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[1320px] text-left text-xs">
          <thead className="text-slate-500">
            <tr>
              <th className="border-b border-line px-3 py-2">Канал</th>
              <th className="border-b border-line px-3 py-2">Telegram target</th>
              <th className="border-b border-line px-3 py-2">Следующий готовый пост</th>
              <th className="border-b border-line px-3 py-2">Картинка</th>
              <th className="border-b border-line px-3 py-2">Текст</th>
              <th className="border-b border-line px-3 py-2">Статус</th>
              <th className="border-b border-line px-3 py-2">Причина блокировки</th>
              <th className="border-b border-line px-3 py-2">Последняя отправка</th>
              <th className="border-b border-line px-3 py-2">Message ID</th>
              <th className="border-b border-line px-3 py-2">Действие</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={`${item.channelId}-${item.selectedPost ?? item.status}`} className="text-slate-300">
                <td className="border-b border-line/60 px-3 py-2 font-semibold text-slate-100">{item.channelName}</td>
                <td className="border-b border-line/60 px-3 py-2 font-mono">{item.telegramTarget || "target missing"}</td>
                <td className="border-b border-line/60 px-3 py-2">
                  <div className="font-mono text-[11px] text-slate-200">{item.selectedPost ?? "none"}</div>
                  <div className="mt-1 max-w-[220px] truncate text-slate-500">{item.selectedPostTitle ?? "no post selected"}</div>
                </td>
                <td className="border-b border-line/60 px-3 py-2">
                  <div>{item.imageStatus} / Telegram: {item.telegramImageStatus}</div>
                  <div className="mt-1 max-w-[220px] truncate font-mono text-[11px] text-slate-500">source: {item.imagePath ?? "none"}</div>
                  <div className="mt-1 max-w-[220px] truncate font-mono text-[11px] text-cyan-200">telegram: {item.telegramImagePath ?? "none"}</div>
                </td>
                <td className="border-b border-line/60 px-3 py-2">{item.textStatus}</td>
                <td className={cn("border-b border-line/60 px-3 py-2", getStatusTone(item.status))}>{item.status}</td>
                <td className="border-b border-line/60 px-3 py-2 text-slate-400">{item.blockerReason ?? item.publishError ?? "none"}</td>
                <td className="border-b border-line/60 px-3 py-2">{item.lastSendAt ? new Date(item.lastSendAt).toLocaleString() : "none"}</td>
                <td className="border-b border-line/60 px-3 py-2">{item.telegramMessageId ?? "none"}</td>
                <td className="border-b border-line/60 px-3 py-2">
                  {isTargetFixable(item) ? (
                    <div className="grid min-w-[240px] gap-2">
                      <span className="text-rose-100">Исправить telegramTarget</span>
                      <input
                        value={targetEdits[item.channelId] ?? item.telegramTarget ?? ""}
                        onChange={(event) => setTargetEdits((current) => ({ ...current, [item.channelId]: event.target.value }))}
                        placeholder="-100xxxxxxxxxx или @username"
                        className="h-8 rounded-md border border-line bg-slate-950 px-2 font-mono text-[11px] text-slate-100 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => saveTelegramTarget(item.channelId)}
                        disabled={busy}
                        className="h-8 rounded-md border border-cyan-300/40 px-2 text-[11px] font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Сохранить target
                      </button>
                    </div>
                  ) : (
                    getActionLabel(item.status)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg border border-line bg-slate-950/60 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-emerald-100" />
            <h3 className="font-semibold text-white">Журнал публикаций</h3>
          </div>
          <select
            value={logFilter}
            onChange={(event) => setLogFilter(event.target.value as LogFilter)}
            className="h-9 rounded-md border border-line bg-slate-950 px-3 text-xs text-slate-100 outline-none"
          >
            <option value="all">все</option>
            <option value="success">success</option>
            <option value="failed">failed</option>
            <option value="skipped">skipped</option>
            <option value="blocked">blocked</option>
            <option value="already_published">already_published</option>
          </select>
        </div>
        {logs.length ? (
          <div className="mt-3 max-h-72 overflow-auto">
            <table className="w-full min-w-[1120px] text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="border-b border-line px-3 py-2">Канал</th>
                  <th className="border-b border-line px-3 py-2">Пост</th>
                  <th className="border-b border-line px-3 py-2">Картинка</th>
                  <th className="border-b border-line px-3 py-2">Target</th>
                  <th className="border-b border-line px-3 py-2">Время</th>
                  <th className="border-b border-line px-3 py-2">Result</th>
                  <th className="border-b border-line px-3 py-2">Mode</th>
                  <th className="border-b border-line px-3 py-2">Message ID</th>
                  <th className="border-b border-line px-3 py-2">Ошибка</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((entry) => (
                  <tr key={entry.id} className="text-slate-300">
                    <td className="border-b border-line/60 px-3 py-2 font-semibold text-slate-100">{entry.channelName}</td>
                    <td className="border-b border-line/60 px-3 py-2">
                      <div className="font-mono text-[11px]">{entry.postId ?? "none"}</div>
                      <div className="mt-1 max-w-[220px] truncate text-slate-500">{entry.title ?? "no title"}</div>
                    </td>
                    <td className="border-b border-line/60 px-3 py-2 max-w-[240px] truncate font-mono text-[11px]">
                      <div>source: {entry.imagePath ?? "none"}</div>
                      <div className="text-cyan-200">telegram: {entry.telegramImagePath ?? "none"}</div>
                      <div className="text-slate-500">status: {entry.telegramImageStatus ?? "not checked"}</div>
                    </td>
                    <td className="border-b border-line/60 px-3 py-2 font-mono">{entry.telegramTarget || "target missing"}</td>
                    <td className="border-b border-line/60 px-3 py-2">{new Date(entry.attemptedAt).toLocaleString()}</td>
                    <td className="border-b border-line/60 px-3 py-2">{entry.result}</td>
                    <td className="border-b border-line/60 px-3 py-2">{entry.mode}</td>
                    <td className="border-b border-line/60 px-3 py-2">{entry.telegramMessageId ?? "none"}</td>
                    <td className="border-b border-line/60 px-3 py-2 text-slate-400">{entry.error ?? "none"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-400">Журнал пока пуст.</p>
        )}
      </div>

      <p className="mt-4 rounded-md border border-line bg-slate-950/60 p-3 text-sm text-slate-300">{message}</p>
    </section>
  );
}

function getConfirmationTitle(mode: PublishMode) {
  if (mode === "retry_failed") return "Повторить публикацию только для ошибок?";
  if (mode === "continue_queue") return "Продолжить очередь следующими неопубликованными постами?";
  return "Запустить быструю публикацию готовых постов?";
}

function getActionLabel(status: PublishStatus) {
  if (status === "ready_to_publish") return "Можно публиковать";
  if (status === "failed") return "Повторить только ошибки";
  if (status === "published" || status === "already_published") return "Дубли заблокированы";
  if (status === "no_ready_posts") return "Создать/подготовить пост";

  return "Исправить блокер";
}

function isTargetFixable(item: PublishQueueItem) {
  const reason = `${item.blockerReason ?? ""} ${item.publishError ?? ""} ${item.botAccess ?? ""}`.toLowerCase();

  return (
    item.status === "bot_access_failed" ||
    reason.includes("chat not found") ||
    reason.includes("wrong chat_id") ||
    reason.includes("target missing") ||
    reason.includes("invalid target")
  );
}

function getStatusTone(status: PublishStatus) {
  if (status === "published" || status === "ready_to_publish") return "text-emerald-100";
  if (status === "failed" || status === "blocked" || status === "bot_access_failed" || status === "image_missing" || status === "text_broken" || status === "forbidden_currency") return "text-rose-100";
  if (status === "already_published") return "text-cyan-100";

  return "text-amber-100";
}

function Metric({ label, value, tone = "dry" }: { label: string; value: number; tone?: "ok" | "warn" | "error" | "dry" }) {
  return (
    <div className="rounded-md border border-line bg-slate-950/50 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-2 text-xl font-semibold",
          tone === "ok" && "text-emerald-100",
          tone === "warn" && "text-amber-100",
          tone === "error" && "text-rose-100",
          tone === "dry" && "text-cyan-100",
        )}
      >
        {value}
      </p>
    </div>
  );
}
