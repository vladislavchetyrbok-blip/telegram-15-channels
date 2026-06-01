"use client";

import { useState } from "react";
import { Send, ShieldCheck } from "lucide-react";
import { channelGenerationConfigs } from "@/data/channelGeneration";

interface DryRunSendResult {
  ok: boolean;
  mode: "dry-run";
  telegramSent: false;
  channelTitle?: string;
  telegramChatId?: string;
  textPreview?: string;
  message: string;
}

const testText = "Тестовая публикация. Dry-run режим. Реальная отправка отключена.";

export function TelegramDryRunTester() {
  const [channelId, setChannelId] = useState(channelGenerationConfigs[0]?.id ?? "");
  const [result, setResult] = useState<DryRunSendResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runDryRunSend() {
    try {
      setLoading(true);
      const response = await fetch("/api/telegram/dry-run-send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelId,
          text: testText,
        }),
      });
      const payload = (await response.json()) as DryRunSendResult;
      setResult(payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-blue-300/20 bg-blue-300/5 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-200" />
            <p className="text-xs uppercase tracking-[0.18em] text-blue-200">Telegram dry-run send</p>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-white">Проверить dry-run отправку</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Тест готовит публикацию для выбранного канала и возвращает preview. Реальная отправка отключена.
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:max-w-2xl">
          <select
            value={channelId}
            onChange={(event) => setChannelId(event.target.value)}
            className="h-10 rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
          >
            {channelGenerationConfigs.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={runDryRunSend}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {loading ? "Проверка..." : "Проверить dry-run отправку"}
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-4 grid gap-3 rounded-md border border-line bg-slate-950/50 p-4 text-sm md:grid-cols-2 xl:grid-cols-5">
          <ResultMetric label="ok" value={String(result.ok)} />
          <ResultMetric label="mode" value={result.mode} />
          <ResultMetric label="telegramSent" value={String(result.telegramSent)} />
          <ResultMetric label="channel" value={result.channelTitle ?? "unknown"} />
          <ResultMetric label="chat_id" value={result.telegramChatId ?? "missing"} />
          <div className="md:col-span-2 xl:col-span-5">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">textPreview</p>
            <p className="mt-2 text-slate-200">{result.textPreview}</p>
            <p className="mt-2 text-cyan-100">{result.message}</p>
          </div>
        </div>
      )}
    </section>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 break-all font-medium text-slate-200">{value}</p>
    </div>
  );
}
