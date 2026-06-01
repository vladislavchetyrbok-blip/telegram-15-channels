"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";

interface TelegramDiagnostics {
  ok: boolean;
  tokenConfigured: boolean;
  tokenValid: boolean;
  botId: number | null;
  botUsername: string | null;
  exactError: string | null;
}

interface TelegramAccessDiagnostics {
  getMeOk: boolean;
  linked: number;
  channelsTotal: number;
  chatFound: number;
  botAdmin: number;
  canPost: number;
  accessOk: number;
  botUsername: string | null;
  exactError: string | null;
  checks: Array<{
    channelId: string;
    channelName: string;
    telegramTarget: string;
    chatTitle: string | null;
    chatFound: boolean;
    botAdmin: boolean;
    canPost: boolean;
    accessStatus: "OK" | "ERROR";
    exactError: string | null;
  }>;
}

export function TelegramConnectionCard() {
  const [diagnostics, setDiagnostics] = useState<TelegramDiagnostics | null>(null);
  const [access, setAccess] = useState<TelegramAccessDiagnostics | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadDiagnostics() {
    setLoading(true);
    try {
      const diagnosticsResponse = await fetch("/api/telegram/diagnostics", { cache: "no-store" });
      setDiagnostics((await diagnosticsResponse.json()) as TelegramDiagnostics);
    } finally {
      setLoading(false);
    }
  }

  async function checkAllAccess() {
    setLoading(true);
    try {
      const accessResponse = await fetch("/api/telegram/check-all-access", { method: "POST" });
      setAccess((await accessResponse.json()) as TelegramAccessDiagnostics);
      const diagnosticsResponse = await fetch("/api/telegram/diagnostics", { cache: "no-store" });
      setDiagnostics((await diagnosticsResponse.json()) as TelegramDiagnostics);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDiagnostics();
  }, []);

  return (
    <section className="rounded-lg border border-blue-300/20 bg-panel/82 p-6 shadow-glow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-lg border border-blue-300/25 bg-blue-300/10 p-3 text-blue-200">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-blue-300">Telegram подключение</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Единая диагностика Telegram Bot API</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Этот блок использует те же endpoints, что и publishing center: getMe, getChat и getChatMember. Полный токен не выводится.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadDiagnostics}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-blue-300/30 bg-blue-300/10 px-4 text-sm font-semibold text-blue-100 transition hover:bg-blue-300/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Проверить Telegram token
          </button>
          <button
            type="button"
            onClick={checkAllAccess}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-4 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Проверить доступ ко всем каналам
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <Metric label="Telegram token" value={diagnostics?.tokenConfigured ? "configured" : "missing/not checked"} tone={diagnostics?.tokenConfigured ? "cyan" : "rose"} />
        <Metric label="getMe" value={diagnostics ? (diagnostics.ok ? "OK" : "error") : "not checked"} tone={diagnostics?.ok ? "cyan" : "rose"} />
        <Metric label="Bot username" value={diagnostics?.botUsername ?? access?.botUsername ?? "unknown"} tone="cyan" />
        <Metric label="Targets linked" value={`${access?.linked ?? 0}/15`} tone={(access?.linked ?? 0) === 15 ? "cyan" : "rose"} />
        <Metric label="Bot access OK" value={`${access?.accessOk ?? 0}/15`} tone={(access?.accessOk ?? 0) > 0 ? "cyan" : "rose"} />
        <Metric label="Mode" value="production disabled" tone="cyan" />
      </div>

      {diagnostics?.exactError ? <p className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-amber-100">{diagnostics.exactError}</p> : null}

      {access ? (
        <div className="mt-4 overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="text-slate-500">
              <tr>
                <th className="border-b border-line px-3 py-2">Канал</th>
                <th className="border-b border-line px-3 py-2">Telegram target</th>
                <th className="border-b border-line px-3 py-2">Chat title</th>
                <th className="border-b border-line px-3 py-2">Chat</th>
                <th className="border-b border-line px-3 py-2">Admin</th>
                <th className="border-b border-line px-3 py-2">Can post</th>
                <th className="border-b border-line px-3 py-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {access.checks.map((check) => (
                <tr key={check.channelId} className="text-slate-300">
                  <td className="border-b border-line/60 px-3 py-2 font-semibold text-slate-100">{check.channelName}</td>
                  <td className="border-b border-line/60 px-3 py-2 font-mono">{check.telegramTarget || "target missing"}</td>
                  <td className="border-b border-line/60 px-3 py-2">{check.chatTitle ?? "unknown"}</td>
                  <td className="border-b border-line/60 px-3 py-2">{check.chatFound ? "yes" : "no"}</td>
                  <td className="border-b border-line/60 px-3 py-2">{check.botAdmin ? "yes" : "no"}</td>
                  <td className="border-b border-line/60 px-3 py-2">{check.canPost ? "yes" : "no"}</td>
                  <td className="border-b border-line/60 px-3 py-2 text-amber-100">{check.exactError ?? "none"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "rose";
}) {
  const toneClass = {
    cyan: "text-cyan-100",
    rose: "text-rose-100",
  };

  return (
    <div className="rounded-md border border-line bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={`mt-2 text-sm font-semibold ${toneClass[tone]}`}>{value}</p>
    </div>
  );
}
