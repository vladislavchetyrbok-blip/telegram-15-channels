"use client";

import { useEffect, useState } from "react";
import { History, RefreshCcw, Send, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickTestItem {
  channelId: string;
  channelTitle: string;
  telegramTarget: string;
  botAccess: string;
  selectedPost: string | null;
  selectedPostTitle: string | null;
  imagePath: string | null;
  imageStatus: string;
  textStatus: string;
  sendStatus: "pending" | "skipped" | "sent" | "failed" | "already_test_published";
  telegramMessageId: number | null;
  telegramPublishedAt: string | null;
  testPublishResult: "success" | "failed" | "skipped" | "already_test_published" | null;
  testPublishError: string | null;
}

interface QuickTestLogEntry {
  id: string;
  channelId: string;
  channelName: string;
  telegramTarget: string;
  postId: string | null;
  title: string | null;
  imagePath: string | null;
  attemptedAt: string;
  result: "success" | "failed" | "skipped" | "already_test_published";
  telegramMessageId: number | null;
  error: string | null;
}

interface QuickTestResult {
  ok: boolean;
  confirmed: boolean;
  mode: "batch" | "retry_failed" | "force_repeat";
  channelsTotal: number;
  readyToSend: number;
  sentSuccess: number;
  sentFailed: number;
  alreadyTestPublished: number;
  skipped: number;
  realPublishDisabled: true;
  autopostingDisabled: true;
  allowRealPublish: false;
  telegramRealPublishEnabled: false;
  seededTargets: number;
  items: QuickTestItem[];
  attemptLog: QuickTestLogEntry[];
  message: string;
  updatedAt: string;
}

interface QuickTestStatus {
  ok: boolean;
  channelsTotal: number;
  linkedTargets: number;
  realPublishDisabled: true;
  autopostingDisabled: true;
  allowRealPublish: false;
  attemptLog: QuickTestLogEntry[];
  lastResult: QuickTestResult | null;
}

export function TelegramQuickTestPanel() {
  const [confirming, setConfirming] = useState<"batch" | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<QuickTestStatus | null>(null);
  const [result, setResult] = useState<QuickTestResult | null>(null);
  const [message, setMessage] = useState("Быстрый тест ещё не запускался.");

  useEffect(() => {
    void loadStatus();
  }, []);

  async function loadStatus() {
    const response = await fetch("/api/telegram/quick-test", { cache: "no-store" });
    const payload = (await response.json()) as QuickTestStatus;
    setStatus(payload);

    if (payload.lastResult) {
      setResult(payload.lastResult);
      setMessage(payload.lastResult.message);
    }
  }

  async function runQuickTest(
    mode: "batch" | "retry_failed" | "force_repeat",
    item?: Pick<QuickTestItem, "channelId" | "selectedPost" | "sendStatus" | "testPublishResult">,
  ) {
    if (mode === "force_repeat" && item?.sendStatus !== "failed") {
      const ok = window.confirm("Этот пост уже был отправлен. Отправить повторно?");
      if (!ok) return;
    }

    if (mode === "retry_failed") {
      const ok = window.confirm("Повторить только неудачные отправки? Успешные и уже отправленные посты не будут затронуты.");
      if (!ok) return;
    }

    try {
      setBusy(true);
      setConfirming(null);
      const response = await fetch("/api/telegram/quick-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmed: true,
          mode,
          channelId: item?.channelId,
          postId: item?.selectedPost,
        }),
      });
      const payload = (await response.json()) as QuickTestResult;
      setResult(payload);
      setMessage(payload.message);
      await loadStatus();
    } finally {
      setBusy(false);
    }
  }

  const failedCount = result?.items.filter((item) => item.testPublishResult === "failed").length ?? 0;
  const log = result?.attemptLog ?? status?.attemptLog ?? [];

  return (
    <section className="rounded-lg border border-amber-300/25 bg-amber-300/5 p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-amber-200">Quick Telegram test</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Быстрый тест 15 каналов</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Будет отправлено максимум по 1 тестовому посту в каждый привязанный Telegram-канал. Повторная отправка
            уже успешных постов блокируется, а ошибки можно повторить отдельно.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Real publish: disabled · Autoposting: disabled · allowRealPublish=false · linked targets: {status?.linkedTargets ?? 0}/15
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
          <button
            type="button"
            onClick={() => setConfirming("batch")}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-amber-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className={cn("h-4 w-4", busy && "animate-pulse")} />
            Быстрый тест: отправить по 1 посту
          </button>
          <button
            type="button"
            onClick={() => runQuickTest("retry_failed")}
            disabled={busy || failedCount === 0}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-amber-300/40 px-4 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
            Повторить только неудачные
          </button>
        </div>
      </div>

      {confirming ? (
        <div className="mt-4 rounded-lg border border-amber-300/30 bg-slate-950/80 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-200" />
            <div>
              <p className="font-semibold text-white">
                Вы точно хотите отправить по 1 тестовому посту в готовые реальные Telegram-каналы?
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Каналы без telegramTarget, доступа бота или готового поста будут пропущены. Уже успешно отправленные
                посты не будут отправлены повторно. Расписание, автопостинг и real publish не включаются.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setConfirming(null)}
                  className="h-9 rounded-md border border-line px-3 text-xs font-semibold text-slate-200"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => runQuickTest("batch")}
                  className="h-9 rounded-md bg-amber-300 px-3 text-xs font-semibold text-slate-950"
                >
                  Да, отправить тестовые посты
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-6">
        <Metric label="Channels total" value={result?.channelsTotal ?? status?.channelsTotal ?? 15} />
        <Metric label="Ready to send" value={result?.readyToSend ?? 0} tone="ok" />
        <Metric label="Sent success" value={result?.sentSuccess ?? 0} tone="ok" />
        <Metric label="Already sent" value={result?.alreadyTestPublished ?? 0} tone={(result?.alreadyTestPublished ?? 0) ? "warn" : "dry"} />
        <Metric label="Sent failed" value={result?.sentFailed ?? 0} tone={(result?.sentFailed ?? 0) ? "error" : "ok"} />
        <Metric label="Skipped" value={result?.skipped ?? 0} tone={(result?.skipped ?? 0) ? "warn" : "ok"} />
      </div>

      {result ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-xs">
            <thead className="text-slate-500">
              <tr>
                <th className="border-b border-line px-3 py-2">Канал</th>
                <th className="border-b border-line px-3 py-2">Пост</th>
                <th className="border-b border-line px-3 py-2">Картинка</th>
                <th className="border-b border-line px-3 py-2">Telegram target</th>
                <th className="border-b border-line px-3 py-2">Статус отправки</th>
                <th className="border-b border-line px-3 py-2">Message ID</th>
                <th className="border-b border-line px-3 py-2">Ошибка</th>
                <th className="border-b border-line px-3 py-2">Действие</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item) => (
                <tr key={`${item.channelId}-${item.selectedPost ?? "none"}`} className="text-slate-300">
                  <td className="border-b border-line/60 px-3 py-2 font-semibold text-slate-100">{item.channelTitle}</td>
                  <td className="border-b border-line/60 px-3 py-2">
                    <div className="font-mono text-[11px] text-slate-200">{item.selectedPost ?? "none"}</div>
                    <div className="mt-1 max-w-[220px] truncate text-slate-500">{item.selectedPostTitle ?? "no post selected"}</div>
                  </td>
                  <td className="border-b border-line/60 px-3 py-2">
                    <div>{item.imageStatus}</div>
                    <div className="mt-1 max-w-[220px] truncate font-mono text-[11px] text-slate-500">{item.imagePath ?? "none"}</div>
                  </td>
                  <td className="border-b border-line/60 px-3 py-2 font-mono">{item.telegramTarget || "target missing"}</td>
                  <td
                    className={cn(
                      "border-b border-line/60 px-3 py-2",
                      item.sendStatus === "sent" && "text-emerald-100",
                      item.sendStatus === "failed" && "text-rose-100",
                      item.sendStatus === "skipped" && "text-amber-100",
                      item.sendStatus === "already_test_published" && "text-cyan-100",
                    )}
                  >
                    {item.sendStatus}
                  </td>
                  <td className="border-b border-line/60 px-3 py-2">{item.telegramMessageId ?? "none"}</td>
                  <td className="border-b border-line/60 px-3 py-2 text-slate-400">{item.testPublishError ?? "none"}</td>
                  <td className="border-b border-line/60 px-3 py-2">
                    <RowAction item={item} busy={busy} onRun={runQuickTest} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="mt-4 rounded-lg border border-line bg-slate-950/60 p-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-cyan-100" />
          <h3 className="font-semibold text-white">Журнал тестовых отправок</h3>
        </div>
        {log.length ? (
          <div className="mt-3 max-h-72 overflow-auto">
            <table className="w-full min-w-[980px] text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="border-b border-line px-3 py-2">Канал</th>
                  <th className="border-b border-line px-3 py-2">Пост</th>
                  <th className="border-b border-line px-3 py-2">Картинка</th>
                  <th className="border-b border-line px-3 py-2">Telegram target</th>
                  <th className="border-b border-line px-3 py-2">Время</th>
                  <th className="border-b border-line px-3 py-2">Результат</th>
                  <th className="border-b border-line px-3 py-2">Message ID</th>
                  <th className="border-b border-line px-3 py-2">Ошибка</th>
                </tr>
              </thead>
              <tbody>
                {log.slice().reverse().map((entry) => (
                  <tr key={entry.id} className="text-slate-300">
                    <td className="border-b border-line/60 px-3 py-2 font-semibold text-slate-100">{entry.channelName}</td>
                    <td className="border-b border-line/60 px-3 py-2">
                      <div className="font-mono text-[11px]">{entry.postId ?? "none"}</div>
                      <div className="mt-1 max-w-[220px] truncate text-slate-500">{entry.title ?? "no title"}</div>
                    </td>
                    <td className="border-b border-line/60 px-3 py-2 max-w-[220px] truncate font-mono text-[11px]">{entry.imagePath ?? "none"}</td>
                    <td className="border-b border-line/60 px-3 py-2 font-mono">{entry.telegramTarget || "target missing"}</td>
                    <td className="border-b border-line/60 px-3 py-2">{new Date(entry.attemptedAt).toLocaleString()}</td>
                    <td className="border-b border-line/60 px-3 py-2">{entry.result}</td>
                    <td className="border-b border-line/60 px-3 py-2">{entry.telegramMessageId ?? "none"}</td>
                    <td className="border-b border-line/60 px-3 py-2 text-slate-400">{entry.error ?? "none"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-400">Журнал пока пуст: тестовые попытки ещё не выполнялись.</p>
        )}
      </div>

      <p className="mt-4 rounded-md border border-line bg-slate-950/60 p-3 text-sm text-slate-300">{message}</p>
    </section>
  );
}

function RowAction({
  item,
  busy,
  onRun,
}: {
  item: QuickTestItem;
  busy: boolean;
  onRun: (mode: "batch" | "retry_failed" | "force_repeat", item?: QuickTestItem) => Promise<void>;
}) {
  if (!item.selectedPost) {
    return <span className="text-slate-500">Пропустить</span>;
  }

  if (item.testPublishResult === "failed") {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => onRun("force_repeat", item)}
        className="h-8 rounded-md border border-rose-300/40 px-3 text-[11px] font-semibold text-rose-100 disabled:opacity-50"
      >
        Повторить
      </button>
    );
  }

  if (item.testPublishResult === "success" || item.testPublishResult === "already_test_published") {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => onRun("force_repeat", item)}
        className="h-8 rounded-md border border-cyan-300/40 px-3 text-[11px] font-semibold text-cyan-100 disabled:opacity-50"
      >
        Повторить отправку принудительно
      </button>
    );
  }

  return <span className="text-slate-500">Пропустить</span>;
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
