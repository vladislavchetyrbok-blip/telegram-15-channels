"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Link2, RefreshCw, Save, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface TelegramBinding {
  channelId: string;
  channelTitle: string;
  telegramTarget: string;
  telegramTargetTitle: string;
  telegramTargetType: string;
  telegramLinkedAt: string | null;
  telegramLinkSource: "getUpdates" | "manual" | null;
}

interface AccessCheck {
  channelId: string;
  channelName: string;
  telegramTarget: string;
  chatFound: boolean;
  chatTitle: string | null;
  botAdmin: boolean;
  canPost: boolean;
  accessStatus: "OK" | "ERROR";
  exactError: string | null;
}

interface AccessPayload {
  ok: boolean;
  linked: number;
  channelsTotal: number;
  chatFound: number;
  botAdmin: number;
  canPost: number;
  accessOk: number;
  checks: AccessCheck[];
}

interface TelegramUpdateItem {
  chatId: string;
  chatTitle: string;
  chatType: string;
  messageId: number;
  preview: string;
  date: string;
}

export function ProblemTelegramChannels() {
  const [bindings, setBindings] = useState<TelegramBinding[]>([]);
  const [access, setAccess] = useState<AccessPayload | null>(null);
  const [updates, setUpdates] = useState<TelegramUpdateItem[]>([]);
  const [manualTargets, setManualTargets] = useState<Record<string, string>>({});
  const [selectedUpdates, setSelectedUpdates] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("Проверка не отправляет посты и не включает автопубликацию.");

  const loadTargets = useCallback(async () => {
    const response = await fetch("/api/telegram/targets", { cache: "no-store" });
    const payload = (await response.json()) as { targets: TelegramBinding[] };
    setBindings(payload.targets);
    setManualTargets(Object.fromEntries(payload.targets.map((item) => [item.channelId, item.telegramTarget])));
  }, []);

  const checkAllAccess = useCallback(async () => {
    setBusy("check-all");
    try {
      const response = await fetch("/api/telegram/check-all-access", { method: "POST" });
      const payload = (await response.json()) as AccessPayload;
      setAccess(payload);
      setMessage(
        payload.accessOk === payload.channelsTotal
          ? "Доступ бота OK по всем 15 каналам."
          : `Доступ бота OK: ${payload.accessOk}/${payload.channelsTotal}. Проблемные каналы показаны ниже.`,
      );
    } finally {
      setBusy(null);
    }
  }, []);

  useEffect(() => {
    void loadTargets();
    void checkAllAccess();
  }, [checkAllAccess, loadTargets]);

  const bindingById = useMemo(() => {
    return new Map(bindings.map((item) => [item.channelId, item]));
  }, [bindings]);

  const problematicChannels = useMemo(() => {
    return (access?.checks ?? [])
      .filter((item) => item.accessStatus !== "OK")
      .map((item) => ({
        ...item,
        binding: bindingById.get(item.channelId),
      }));
  }, [access?.checks, bindingById]);

  async function fetchUpdates() {
    setBusy("updates");
    try {
      const response = await fetch("/api/telegram/updates", { cache: "no-store" });
      const payload = (await response.json()) as { ok: boolean; updates: TelegramUpdateItem[]; error: string | null };
      setUpdates(payload.updates ?? []);
      setMessage(payload.ok ? `Найдено updates: ${payload.updates.length}.` : payload.error ?? "Не удалось получить updates.");
    } finally {
      setBusy(null);
    }
  }

  async function saveTarget(channelId: string, source: "manual" | "getUpdates") {
    const selectedUpdate = updates.find((item) => item.chatId === selectedUpdates[channelId]);
    const telegramTarget = source === "getUpdates" ? selectedUpdate?.chatId ?? "" : manualTargets[channelId] ?? "";

    if (!telegramTarget.trim()) {
      setMessage("telegramTarget пустой. Вставь -100xxxxxxxxxx или @channel_username.");
      return;
    }

    setBusy(`save-${channelId}`);
    try {
      const response = await fetch(`/api/telegram/targets/${channelId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramTarget,
          telegramTargetTitle: selectedUpdate?.chatTitle ?? "",
          telegramTargetType: selectedUpdate?.chatType ?? "",
          telegramLinkSource: source,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        setMessage(payload.error ?? "Не удалось сохранить telegramTarget.");
        return;
      }

      await loadTargets();
      await checkAllAccess();
      setMessage("telegramTarget сохранён и доступ перепроверен.");
    } finally {
      setBusy(null);
    }
  }

  async function checkOne(channelId: string) {
    const target = manualTargets[channelId] ?? bindingById.get(channelId)?.telegramTarget ?? "";

    setBusy(`check-${channelId}`);
    try {
      const response = await fetch("/api/telegram/check-channel-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, telegramTarget: target }),
      });
      const payload = await response.json();

      await checkAllAccess();
      setMessage(payload.ok ? "Канал проверен: bot admin + can post." : payload.result?.error ?? payload.result?.accessStatus ?? "Ошибка проверки доступа.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-lg border border-amber-300/25 bg-amber-300/5 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            Telegram diagnostics
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">Проблемные Telegram-каналы</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Здесь показаны только каналы, где Bot API не подтвердил доступ. Исправление target не отправляет посты и не запускает автопубликацию.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fetchUpdates}
            disabled={Boolean(busy)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 px-4 text-sm font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", busy === "updates" && "animate-spin")} />
            Получить updates
          </button>
          <button
            type="button"
            onClick={checkAllAccess}
            disabled={Boolean(busy)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-amber-300 px-4 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search className={cn("h-4 w-4", busy === "check-all" && "animate-spin")} />
            Проверить все каналы
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Metric label="Targets linked" value={`${access?.linked ?? 0}/${access?.channelsTotal ?? 15}`} />
        <Metric label="Chat found" value={`${access?.chatFound ?? 0}/${access?.channelsTotal ?? 15}`} />
        <Metric label="Bot admin" value={`${access?.botAdmin ?? 0}/${access?.channelsTotal ?? 15}`} />
        <Metric label="Bot access OK" value={`${access?.accessOk ?? 0}/${access?.channelsTotal ?? 15}`} tone={access && access.accessOk < access.channelsTotal ? "warn" : "ok"} />
      </div>

      {problematicChannels.length ? (
        <div className="mt-4 grid gap-3">
          {problematicChannels.map((item) => {
            const binding = item.binding;

            return (
              <article key={item.channelId} className="rounded-lg border border-line bg-slate-950/70 p-4">
                <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr_auto] xl:items-start">
                  <div>
                    <p className="text-xs text-slate-500">channelId</p>
                    <h3 className="mt-1 font-mono text-sm text-cyan-100">{item.channelId}</h3>
                    <p className="mt-3 text-base font-semibold text-white">{item.channelName}</p>
                    <dl className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                      <Detail label="telegramTarget" value={item.telegramTarget || "target missing"} mono />
                      <Detail label="exactError" value={item.exactError ?? "unknown"} tone="error" />
                      <Detail label="telegramTargetTitle" value={binding?.telegramTargetTitle || item.chatTitle || "none"} />
                      <Detail label="linkSource" value={binding?.telegramLinkSource ?? "unknown"} />
                    </dl>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400" htmlFor={`fix-target-${item.channelId}`}>
                      Исправить telegramTarget
                    </label>
                    <input
                      id={`fix-target-${item.channelId}`}
                      value={manualTargets[item.channelId] ?? ""}
                      onChange={(event) => setManualTargets((current) => ({ ...current, [item.channelId]: event.target.value }))}
                      placeholder="-100xxxxxxxxxx или @channel_username"
                      className="mt-2 h-10 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50"
                    />
                    <button
                      type="button"
                      onClick={() => saveTarget(item.channelId, "manual")}
                      disabled={Boolean(busy)}
                      className="mt-2 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-cyan-300/25 px-3 text-xs font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Сохранить
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400" htmlFor={`update-target-${item.channelId}`}>
                      Выбрать из updates
                    </label>
                    <select
                      id={`update-target-${item.channelId}`}
                      value={selectedUpdates[item.channelId] ?? ""}
                      onChange={(event) => setSelectedUpdates((current) => ({ ...current, [item.channelId]: event.target.value }))}
                      className="mt-2 h-10 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/50"
                    >
                      <option value="">Выбрать chat.id</option>
                      {updates.map((update) => (
                        <option key={`${item.channelId}-${update.chatId}-${update.messageId}`} value={update.chatId}>
                          {update.chatTitle || "Без названия"} · {update.chatId}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => saveTarget(item.channelId, "getUpdates")}
                      disabled={Boolean(busy) || !selectedUpdates[item.channelId]}
                      className="mt-2 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-emerald-300/25 px-3 text-xs font-semibold text-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Привязать
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <button
                      type="button"
                      onClick={() => checkOne(item.channelId)}
                      disabled={Boolean(busy)}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line px-3 text-xs font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Search className="h-3.5 w-3.5" />
                      Проверить доступ
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-emerald-300/25 bg-emerald-300/10 p-3 text-sm text-emerald-100">
          Проблемных Telegram-каналов нет. Bot access OK по всем привязанным каналам.
        </div>
      )}

      {updates.length ? (
        <div className="mt-4 rounded-lg border border-line bg-slate-950/60 p-4">
          <p className="font-semibold text-white">Найденные updates</p>
          <div className="mt-3 max-h-72 overflow-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="border-b border-line px-3 py-2">chat title</th>
                  <th className="border-b border-line px-3 py-2">chat.id</th>
                  <th className="border-b border-line px-3 py-2">type</th>
                  <th className="border-b border-line px-3 py-2">preview</th>
                  <th className="border-b border-line px-3 py-2">date</th>
                </tr>
              </thead>
              <tbody>
                {updates.map((update) => (
                  <tr key={`${update.chatId}-${update.messageId}`} className="text-slate-300">
                    <td className="border-b border-line/60 px-3 py-2 font-semibold text-slate-100">{update.chatTitle || "Без названия"}</td>
                    <td className="border-b border-line/60 px-3 py-2 font-mono text-cyan-100">{update.chatId}</td>
                    <td className="border-b border-line/60 px-3 py-2">{update.chatType}</td>
                    <td className="border-b border-line/60 px-3 py-2">{update.preview || "empty"}</td>
                    <td className="border-b border-line/60 px-3 py-2">{new Date(update.date).toLocaleString("ru-RU")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <p className="mt-4 rounded-md border border-line bg-slate-950/60 p-3 text-sm text-slate-300">{message}</p>
    </section>
  );
}

function Metric({ label, value, tone = "dry" }: { label: string; value: string; tone?: "ok" | "warn" | "dry" }) {
  return (
    <div className="rounded-md border border-line bg-slate-950/60 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={cn("mt-2 text-lg font-semibold", tone === "ok" && "text-emerald-100", tone === "warn" && "text-amber-100", tone === "dry" && "text-cyan-100")}>{value}</p>
    </div>
  );
}

function Detail({ label, value, mono, tone }: { label: string; value: string; mono?: boolean; tone?: "error" }) {
  return (
    <div className="rounded-md border border-line bg-slate-900/70 px-3 py-2">
      <p className={cn("break-words font-semibold", mono && "font-mono", tone === "error" ? "text-rose-100" : "text-slate-100")}>{value}</p>
      <p className="mt-1 text-slate-500">{label}</p>
    </div>
  );
}
