"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, Wand2 } from "lucide-react";
import {
  channelGenerationConfigs,
  type ChannelGenerationConfig,
} from "@/data/channelGeneration";

interface GenerationResponse {
  ok: boolean;
  channel?: ChannelGenerationConfig;
  text: string;
  dryRun: boolean;
  sent: false;
  provider: string;
  model?: string;
  message: string;
  error?: string;
}

interface GenerateAndDryRunResponse {
  ok: boolean;
  mode: "dry-run";
  aiProvider: "lmstudio";
  telegramSent: false;
  channelTitle?: string;
  telegramChatId?: string;
  generatedText?: string;
  draftId?: string;
  dryRunMessage: string;
  error?: string;
}

export function ChannelGenerationPanel() {
  const [selectedChannelId, setSelectedChannelId] = useState(channelGenerationConfigs[0].id);
  const [loadingChannelId, setLoadingChannelId] = useState<string | null>(null);
  const [dryRunLoading, setDryRunLoading] = useState(false);
  const [result, setResult] = useState<GenerationResponse | null>(null);
  const [dryRunResult, setDryRunResult] = useState<GenerateAndDryRunResponse | null>(null);

  async function generate(channelId: string) {
    setSelectedChannelId(channelId);
    setLoadingChannelId(channelId);
    setResult(null);
    setDryRunResult(null);

    const channel = channelGenerationConfigs.find(c => c.id === channelId);

    if (channel?.status === "paused_legacy") {
      setResult({
        ok: false,
        text: "",
        dryRun: true,
        sent: false,
        provider: "lmstudio",
        message: "Legacy channel generation is paused.",
        error: "This 15-channel legacy network is preserved but paused for Phase 1 Zodiac migration.",
      });
      setLoadingChannelId(null);
      return;
    }

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelName: channel?.name ?? "Unknown",
          language: channel?.language ?? "RU",
          topic: channel?.topic ?? "Тема не задана",
          mode: "local",
        }),
      });
      const payload = await response.json();
      
      setResult({
        ok: payload.ok,
        text: payload.text ?? "",
        dryRun: true,
        sent: false,
        provider: payload.provider ?? "lmstudio",
        model: payload.model,
        message: payload.ok ? "Сгенерировано через /api/ai/generate" : (payload.error ?? "Ошибка генерации"),
        error: payload.error,
      });
    } catch {
      setResult({
        ok: false,
        text: "",
        dryRun: true,
        sent: false,
        provider: "lmstudio",
        message: "Network request to /api/ai/generate failed.",
        error: "Сетевая ошибка или 404 (сервер недоступен).",
      });
    } finally {
      setLoadingChannelId(null);
    }
  }

  async function generateAndDryRun() {
    setDryRunLoading(true);
    setResult(null);
    setDryRunResult(null);

    const channel = channelGenerationConfigs.find(c => c.id === selectedChannelId);

    if (channel?.status === "paused_legacy") {
      setDryRunResult({
        ok: false,
        mode: "dry-run",
        aiProvider: "lmstudio",
        telegramSent: false,
        generatedText: "",
        dryRunMessage: "Legacy channel generation is paused.",
        error: "This 15-channel legacy network is preserved but paused for Phase 1 Zodiac migration.",
      });
      setDryRunLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelName: channel?.name ?? "Unknown",
          language: channel?.language ?? "RU",
          topic: channel?.topic ?? "Тема не задана",
          mode: "local",
        }),
      });
      const payload = await response.json();
      
      setDryRunResult({
        ok: payload.ok,
        mode: "dry-run",
        aiProvider: payload.provider ?? "lmstudio",
        telegramSent: false,
        channelTitle: channel?.name,
        telegramChatId: channel?.telegramChatId,
        generatedText: payload.text,
        draftId: "disabled-endpoint-mock",
        dryRunMessage: payload.ok 
          ? "Текст сгенерирован. Отправка в Telegram отключена (Vercel Hobby limit)." 
          : (payload.error ?? "Ошибка генерации"),
        error: payload.error,
      });
    } catch {
      setDryRunResult({
        ok: false,
        mode: "dry-run",
        aiProvider: "lmstudio",
        telegramSent: false,
        generatedText: "",
        dryRunMessage: "Сетевая ошибка к /api/ai/generate",
        error: "Не удалось выполнить запрос.",
      });
    } finally {
      setDryRunLoading(false);
    }
  }

  const selectedChannel =
    channelGenerationConfigs.find((channel) => channel.id === selectedChannelId) ??
    channelGenerationConfigs[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section className="rounded-lg border border-line bg-panel/82 p-5 shadow-glow">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">15 channels</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Список каналов</h2>
          </div>
          <span className="rounded border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs font-semibold text-emerald-100">
            dry-run
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {channelGenerationConfigs.map((channel) => {
            const active = channel.id === selectedChannelId;
            const loading = loadingChannelId === channel.id;
            const legacyPaused = channel.status === "paused_legacy";

            return (
              <div
                key={channel.id}
                className={`rounded-md border p-3 ${
                  active ? "border-cyan-300/40 bg-cyan-300/10" : "border-line bg-black/15"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{channel.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{channel.topic}</p>
                  </div>
                  <span className="shrink-0 rounded border border-slate-500/25 bg-slate-500/10 px-2 py-1 text-[11px] uppercase text-slate-300">
                    {channel.language}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {channel.postingFrequency} · {channel.status}
                  </div>
                  <button
                    type="button"
                    onClick={() => generate(channel.id)}
                    disabled={Boolean(loadingChannelId) || legacyPaused}
                    className="inline-flex h-9 items-center gap-2 rounded-md bg-cyan-300 px-3 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                    {legacyPaused ? "Legacy paused" : "Сгенерировать тестовый пост"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-panel/82 p-6 shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Генерация постов</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{selectedChannel.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{selectedChannel.postStyle}</p>
          </div>
          <div className="rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm text-amber-100">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              dry-run: сообщение не отправлено
            </div>
            <p className="mt-1 text-xs leading-5 text-amber-100/80">
              Telegram API не вызывается. Генерация только готовит текст.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Info label="Тематика" value={selectedChannel.topic} />
          <Info label="Язык" value={selectedChannel.language} />
          <Info label="Telegram chat" value={selectedChannel.telegramChatId || "mock / empty"} />
        </div>

        <div className="mt-5 rounded-lg border border-blue-300/20 bg-blue-300/5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-blue-200">Full safe pipeline</p>
              <p className="mt-1 text-sm text-slate-300">LM Studio → draft → Telegram dry-run preview</p>
            </div>
            <button
              type="button"
              onClick={generateAndDryRun}
              disabled={dryRunLoading || Boolean(loadingChannelId) || selectedChannel.status === "paused_legacy"}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {dryRunLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              AI → Dry-run
            </button>
          </div>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium text-slate-300" htmlFor="generation-result">
            Результат генерации
          </label>
          <textarea
            id="generation-result"
            rows={18}
            readOnly
            value={
              result
                ? result.ok
                  ? result.text
                  : result.error ?? result.message
                : dryRunResult
                  ? dryRunResult.ok
                    ? dryRunResult.generatedText ?? ""
                    : dryRunResult.error ?? dryRunResult.dryRunMessage
                : "Выберите канал и нажмите «Сгенерировать тестовый пост»."
            }
            className="mt-2 w-full rounded-md border border-line bg-[#090f1d] px-3 py-3 text-sm leading-6 text-white outline-none"
          />
        </div>

        {result ? (
          <div
            className={`mt-4 rounded-md border p-4 text-sm ${
              result.ok
                ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                : "border-amber-300/25 bg-amber-300/10 text-amber-100"
            }`}
          >
            <p className="font-semibold">{result.message}</p>
            <p className="mt-1 text-xs leading-5">
              provider: {result.provider} · model: {result.model ?? "n/a"} · sent: {String(result.sent)} · dryRun:{" "}
              {String(result.dryRun)}
            </p>
          </div>
        ) : null}

        {dryRunResult ? (
          <div
            className={`mt-4 rounded-md border p-4 text-sm ${
              dryRunResult.ok
                ? "border-blue-300/25 bg-blue-300/10 text-blue-100"
                : "border-amber-300/25 bg-amber-300/10 text-amber-100"
            }`}
          >
            <p className="font-semibold">{dryRunResult.dryRunMessage}</p>
            <p className="mt-1 text-xs leading-5">
              mode: {dryRunResult.mode} · provider: {dryRunResult.aiProvider} · telegramSent:{" "}
              {String(dryRunResult.telegramSent)} · chat_id: {dryRunResult.telegramChatId ?? "n/a"} · draft:{" "}
              {dryRunResult.draftId ?? "n/a"}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
