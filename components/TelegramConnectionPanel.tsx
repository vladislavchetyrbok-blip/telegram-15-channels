"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link2, RefreshCw, Save, Search, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { TelegramQuickTestPanel } from "@/components/TelegramQuickTestPanel";
import { TelegramQuickPublishPanel } from "@/components/TelegramQuickPublishPanel";

interface TelegramBinding {
  channelId: string;
  channelTitle: string;
  telegramTarget: string;
  telegramTargetTitle: string;
  telegramTargetType: string;
  telegramLinkedAt: string | null;
  telegramLinkSource: "getUpdates" | "manual" | null;
}

interface TelegramUpdateItem {
  chatId: string;
  chatTitle: string;
  chatType: string;
  messageId: number;
  preview: string;
  date: string;
}

interface AccessCheck {
  channelId: string;
  channelName: string;
  telegramTarget: string;
  targetMasked: string;
  accessStatus: string;
  botAdmin: boolean;
  canPost: boolean;
  error: string | null;
}

interface TestSendResult {
  ok: boolean;
  messageId: number | null;
  status: string;
  message: string;
  error: string | null;
  telegramSent: boolean;
}

export function TelegramConnectionPanel() {
  const [bindings, setBindings] = useState<TelegramBinding[]>([]);
  const [updates, setUpdates] = useState<TelegramUpdateItem[]>([]);
  const [manualTargets, setManualTargets] = useState<Record<string, string>>({});
  const [selectedUpdates, setSelectedUpdates] = useState<Record<string, string>>({});
  const [updateTargetChannels, setUpdateTargetChannels] = useState<Record<string, string>>({});
  const [access, setAccess] = useState<Record<string, AccessCheck>>({});
  const [testResult, setTestResult] = useState<Record<string, TestSendResult>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState(
    "Telegram targets можно привязывать по одному. Массовая публикация и автопостинг отключены.",
  );

  const counters = useMemo(() => {
    const linked = bindings.filter((item) => item.telegramTarget).length;
    const accessOk = Object.values(access).filter((item) => item.accessStatus === "ok").length;

    return {
      total: bindings.length,
      linked,
      unlinked: bindings.length - linked,
      accessOk,
      accessErrors: Object.keys(access).length - accessOk,
    };
  }, [access, bindings]);

  const loadTargets = useCallback(async () => {
    const response = await fetch("/api/telegram/targets", { cache: "no-store" });
    const payload = (await response.json()) as { targets: TelegramBinding[] };
    setBindings(payload.targets);
    setManualTargets(Object.fromEntries(payload.targets.map((item) => [item.channelId, item.telegramTarget])));
  }, []);

  useEffect(() => {
    void loadTargets();
  }, [loadTargets]);

  async function seedKnownTargets() {
    try {
      setBusy("seed-known");
      const response = await fetch("/api/telegram/targets/seed-known", { method: "POST" });
      const payload = (await response.json()) as { created: number; linked: number };
      await loadTargets();
      setMessage(`Привязка из известных chat_id выполнена. Новых: ${payload.created}, всего привязано: ${payload.linked}.`);
    } finally {
      setBusy(null);
    }
  }

  async function fetchUpdates() {
    try {
      setBusy("updates");
      const response = await fetch("/api/telegram/updates", { cache: "no-store" });
      const payload = (await response.json()) as { ok: boolean; updates: TelegramUpdateItem[]; error: string | null };
      setUpdates(payload.updates);
      setMessage(payload.ok ? `Найдено Telegram updates: ${payload.updates.length}.` : payload.error ?? "Не удалось получить updates.");
    } finally {
      setBusy(null);
    }
  }

  async function saveTarget(channelId: string, source: "manual" | "getUpdates") {
    const update = updates.find((item) => item.chatId === selectedUpdates[channelId]);
    const target = source === "getUpdates" ? update?.chatId ?? "" : manualTargets[channelId] ?? "";

    try {
      setBusy(`save-${channelId}`);
      const response = await fetch(`/api/telegram/targets/${channelId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramTarget: target,
          telegramTargetTitle: update?.chatTitle ?? "",
          telegramTargetType: update?.chatType ?? "",
          telegramLinkSource: source,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        setMessage(payload.error ?? "Не удалось сохранить telegramTarget.");
        return;
      }

      await loadTargets();
      setMessage("telegramTarget сохранён. Связь сохранится после обновления страницы.");
    } finally {
      setBusy(null);
    }
  }

  async function bindUpdateToChannel(update: TelegramUpdateItem) {
    const channelId = updateTargetChannels[`${update.chatId}-${update.messageId}`] ?? "";

    if (!channelId) {
      setMessage("Выбери канал платформы для найденного chat_id.");
      return;
    }

    try {
      setBusy(`bind-update-${update.chatId}`);
      const response = await fetch(`/api/telegram/targets/${channelId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramTarget: update.chatId,
          telegramTargetTitle: update.chatTitle,
          telegramTargetType: update.chatType,
          telegramLinkSource: "getUpdates",
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        setMessage(payload.error ?? "Не удалось привязать chat_id из updates.");
        return;
      }

      await loadTargets();
      setMessage(`chat_id ${update.chatId} привязан к выбранному каналу платформы.`);
    } finally {
      setBusy(null);
    }
  }

  async function checkAccess(channel: TelegramBinding) {
    try {
      setBusy(`check-${channel.channelId}`);
      const response = await fetch("/api/telegram/check-channel-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: channel.channelId, telegramTarget: manualTargets[channel.channelId] || channel.telegramTarget }),
      });
      const payload = (await response.json()) as { ok: boolean; result: AccessCheck };
      setAccess((current) => ({ ...current, [channel.channelId]: payload.result }));
      setMessage(payload.ok ? "Доступ проверен: bot admin + can post." : payload.result.error ?? payload.result.accessStatus);
    } finally {
      setBusy(null);
    }
  }

  async function sendOneTestPost(channel: TelegramBinding) {
    try {
      setBusy(`send-${channel.channelId}`);
      const response = await fetch("/api/telegram/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: channel.channelId,
          telegramTarget: manualTargets[channel.channelId] || channel.telegramTarget,
        }),
      });
      const payload = (await response.json()) as TestSendResult;
      setTestResult((current) => ({ ...current, [channel.channelId]: payload }));
      setMessage(payload.ok ? payload.message : payload.error ?? "Тестовая отправка заблокирована.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-cyan-300/25 bg-cyan-300/5 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Telegram connection</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Telegram подключение</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Привязка приватных и публичных каналов через chat_id или @username. Заполнение всех 15 targets не требуется для работы сайта.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={seedKnownTargets}
              disabled={Boolean(busy)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 px-4 text-sm font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Привязать известные chat_id
            </button>
            <button
              type="button"
              onClick={fetchUpdates}
              disabled={Boolean(busy)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={cn("h-4 w-4", busy === "updates" && "animate-spin")} />
              Получить updates
            </button>
          </div>
        </div>
      </section>

      <TelegramQuickTestPanel />

      <TelegramQuickPublishPanel />

      <section className="grid gap-3 md:grid-cols-5">
        <Metric label="Всего каналов" value={counters.total} />
        <Metric label="Привязано" value={counters.linked} tone="ok" />
        <Metric label="Не привязано" value={counters.unlinked} tone={counters.unlinked ? "warn" : "ok"} />
        <Metric label="Access OK" value={counters.accessOk} tone="ok" />
        <Metric label="Ошибки доступа" value={counters.accessErrors} tone={counters.accessErrors ? "error" : "ok"} />
      </section>

      <section className="rounded-lg border border-line bg-panel/70 p-4">
        <h2 className="text-lg font-semibold text-white">Как получить chat_id приватного канала</h2>
        <ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-400 md:grid-cols-2">
          <li>1. Открой нужный Telegram-канал.</li>
          <li>2. Отправь туда любое тестовое сообщение, например test.</li>
          <li>3. Вернись в платформу и нажми “Получить updates”.</li>
          <li>4. Выбери найденный chat_id и привяжи его к каналу платформы.</li>
        </ol>
      </section>

      {updates.length ? (
        <section className="rounded-lg border border-line bg-panel/70 p-4">
          <h2 className="text-lg font-semibold text-white">Найденные Telegram updates</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="border-b border-line px-3 py-2">chat title</th>
                  <th className="border-b border-line px-3 py-2">chat id</th>
                  <th className="border-b border-line px-3 py-2">type</th>
                  <th className="border-b border-line px-3 py-2">last message preview</th>
                  <th className="border-b border-line px-3 py-2">date</th>
                  <th className="border-b border-line px-3 py-2">Привязать</th>
                </tr>
              </thead>
              <tbody>
                {updates.map((item) => {
                  const key = `${item.chatId}-${item.messageId}`;

                  return (
                  <tr key={key} className="text-slate-300">
                    <td className="border-b border-line/60 px-3 py-2 font-semibold text-slate-100">{item.chatTitle}</td>
                    <td className="border-b border-line/60 px-3 py-2 font-mono">{item.chatId}</td>
                    <td className="border-b border-line/60 px-3 py-2">{item.chatType}</td>
                    <td className="border-b border-line/60 px-3 py-2">{item.preview || "empty"}</td>
                    <td className="border-b border-line/60 px-3 py-2">{new Date(item.date).toLocaleString("ru-RU")}</td>
                    <td className="border-b border-line/60 px-3 py-2">
                      <div className="flex min-w-[260px] gap-2">
                        <select
                          value={updateTargetChannels[key] ?? ""}
                          onChange={(event) => setUpdateTargetChannels((current) => ({ ...current, [key]: event.target.value }))}
                          className="h-9 flex-1 rounded-md border border-line bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:border-cyan-300/50"
                        >
                          <option value="">Канал платформы</option>
                          {bindings.map((channel) => (
                            <option key={`${key}-${channel.channelId}`} value={channel.channelId}>
                              {channel.channelTitle}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => bindUpdateToChannel(item)}
                          disabled={Boolean(busy) || !updateTargetChannels[key]}
                          className="h-9 rounded-md border border-emerald-300/25 px-3 text-xs font-semibold text-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Привязать
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="rounded-lg border border-line bg-panel/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">15 platform channels</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Привязка каналов</h2>
          </div>
          <span className="rounded-full border border-slate-500/25 bg-slate-500/10 px-3 py-1 text-xs text-slate-300">
            real publish disabled
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {bindings.map((channel, index) => {
            const channelAccess = access[channel.channelId];
            const result = testResult[channel.channelId];
            const linked = Boolean(channel.telegramTarget);

            return (
              <article key={channel.channelId} className="rounded-lg border border-line bg-slate-950/50 p-4">
                <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_1fr_auto] xl:items-start">
                  <div>
                    <p className="text-xs text-slate-500">#{index + 1}</p>
                    <h3 className="mt-1 text-base font-semibold text-white">{channel.channelTitle}</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Telegram target: {linked ? <span className="font-mono text-cyan-100">{channel.telegramTarget}</span> : <span className="text-amber-100">не привязан</span>}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Source: {channel.telegramLinkSource ?? "none"} · {channel.telegramTargetTitle || "no Telegram title"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400" htmlFor={`manual-${channel.channelId}`}>
                      Ручной telegramTarget
                    </label>
                    <input
                      id={`manual-${channel.channelId}`}
                      value={manualTargets[channel.channelId] ?? ""}
                      onChange={(event) => setManualTargets((current) => ({ ...current, [channel.channelId]: event.target.value }))}
                      placeholder="-100xxxxxxxxxx или @channel"
                      className="h-10 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50"
                    />
                    <button
                      type="button"
                      onClick={() => saveTarget(channel.channelId, "manual")}
                      disabled={Boolean(busy)}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-cyan-300/25 px-3 text-xs font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Сохранить
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400" htmlFor={`update-${channel.channelId}`}>
                      Выбрать из updates
                    </label>
                    <select
                      id={`update-${channel.channelId}`}
                      value={selectedUpdates[channel.channelId] ?? ""}
                      onChange={(event) => setSelectedUpdates((current) => ({ ...current, [channel.channelId]: event.target.value }))}
                      className="h-10 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/50"
                    >
                      <option value="">Выбрать chat_id</option>
                      {updates.map((item) => (
                        <option key={`${channel.channelId}-${item.chatId}`} value={item.chatId}>
                          {item.chatTitle} · {item.chatId}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => saveTarget(channel.channelId, "getUpdates")}
                      disabled={Boolean(busy) || !selectedUpdates[channel.channelId]}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-emerald-300/25 px-3 text-xs font-semibold text-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Привязать
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <button
                      type="button"
                      onClick={() => checkAccess(channel)}
                      disabled={Boolean(busy)}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line px-3 text-xs font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Search className="h-3.5 w-3.5" />
                      Проверить доступ
                    </button>
                    <button
                      type="button"
                      onClick={() => sendOneTestPost(channel)}
                      disabled={Boolean(busy) || !linked || channelAccess?.accessStatus !== "ok"}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 text-xs font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Отправить 1 тестовый пост
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-xs md:grid-cols-5">
                  <Status label="Статус привязки" value={linked ? "привязан" : "Telegram target не привязан"} ok={linked} />
                  <Status label="Access status" value={channelAccess?.accessStatus ?? "not checked"} ok={channelAccess?.accessStatus === "ok"} />
                  <Status label="Bot admin" value={channelAccess?.botAdmin ? "yes" : "no"} ok={Boolean(channelAccess?.botAdmin)} />
                  <Status label="Can post" value={channelAccess?.canPost ? "yes" : "no"} ok={Boolean(channelAccess?.canPost)} />
                  <Status label="Test send" value={result?.status ?? "not sent"} ok={result?.ok} />
                </div>
                {channelAccess?.error ? <p className="mt-2 text-xs text-rose-100">{channelAccess.error}</p> : null}
                {result ? (
                  <p className={cn("mt-2 text-xs", result.ok ? "text-emerald-100" : "text-rose-100")}>
                    {result.ok ? `${result.message} message_id=${result.messageId ?? "none"}` : result.error}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <p className="rounded-lg border border-line bg-slate-950/60 p-4 text-sm text-slate-300">{message}</p>
    </div>
  );
}

function Metric({ label, value, tone = "dry" }: { label: string; value: number; tone?: "ok" | "warn" | "error" | "dry" }) {
  return (
    <div className="rounded-lg border border-line bg-panel/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold",
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

function Status({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="rounded-md border border-line bg-slate-950/50 px-3 py-2">
      <p className={cn("font-semibold", ok ? "text-emerald-100" : "text-slate-100")}>{value}</p>
      <p className="text-slate-500">{label}</p>
    </div>
  );
}
