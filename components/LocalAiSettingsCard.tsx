"use client";

import { useState } from "react";
import { Bot, Loader2, Wand2 } from "lucide-react";
import { localAi } from "@/data/system";

const testPrompt = "Напиши короткий тестовый пост для Telegram-канала о запуске проекта.";

interface AiCheckResponse {
  ok: boolean;
  mode: "local";
  provider: string;
  message: string;
  models?: string[];
}

interface AiGenerationTestResponse {
  ok: boolean;
  text: string;
  provider: string;
  mode: "local";
  model: string;
  error?: string;
}

export function LocalAiSettingsCard() {
  const [status, setStatus] = useState<AiCheckResponse | null>(null);
  const [generation, setGeneration] = useState<AiGenerationTestResponse | null>(null);
  const [checking, setChecking] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function checkConnection() {
    setChecking(true);

    try {
      const response = await fetch(`${localAi.apiUrl}/models`, { method: "GET" });

      if (!response.ok) {
        throw new Error("LM Studio models endpoint failed");
      }

      const payload = (await response.json()) as { data?: Array<{ id?: string }> };
      const models = payload.data?.map((model) => model.id).filter(Boolean) as string[] | undefined;

      setStatus({
        ok: true,
        mode: "local",
        provider: "lmstudio",
        message: "LM Studio connected",
        models: models ?? [],
      });
    } catch {
      setStatus({
        ok: false,
        mode: "local",
        provider: "lmstudio",
        message: "LM Studio server is not available",
      });
    } finally {
      setChecking(false);
    }
  }

  async function checkGeneration() {
    setGenerating(true);
    setGeneration(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelName: "LM Studio settings test",
          language: "RU",
          topic: testPrompt,
          mode: "local",
        }),
      });
      const payload = (await response.json()) as AiGenerationTestResponse;
      setGeneration(payload);
    } catch {
      setGeneration({
        ok: false,
        text: "",
        provider: "lmstudio",
        mode: "local",
        model: localAi.model,
        error: "LM Studio не ответил на тест генерации.",
      });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="rounded-lg border border-cyan-300/20 bg-panel/82 p-6 shadow-glow">
      <div className="flex items-start gap-4">
        <div className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 p-3 text-cyan-200">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Локальный AI</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{localAi.provider}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{localAi.description}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Metric label="Provider" value={localAi.provider} />
        <Metric label="API URL" value={localAi.apiUrl} />
        <Metric label="Model" value={generation?.model ?? localAi.model} />
        <Metric label="Status" value={status?.ok ? "connected" : "local mode"} tone={status?.ok ? "emerald" : "cyan"} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={checkConnection}
          disabled={checking}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-wait disabled:opacity-70"
        >
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
          Проверить LM Studio
        </button>

        <button
          type="button"
          onClick={checkGeneration}
          disabled={generating}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-4 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/15 disabled:cursor-wait disabled:opacity-70"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          Проверить генерацию текста
        </button>
      </div>

      {status ? (
        <div
          className={`mt-5 rounded-md border p-4 ${
            status.ok
              ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
              : "border-amber-300/25 bg-amber-300/10 text-amber-100"
          }`}
        >
          <p className="text-sm font-semibold">{status.ok ? "connected" : "not connected"}</p>
          <p className="mt-1 text-sm leading-6">{status.message}</p>
          {status.models?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {status.models.map((model) => (
                <span key={model} className="rounded border border-white/15 bg-black/20 px-2 py-1 text-xs">
                  {model}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {generation ? (
        <div
          className={`mt-5 rounded-md border p-4 ${
            generation.ok
              ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
              : "border-amber-300/25 bg-amber-300/10 text-amber-100"
          }`}
        >
          <p className="text-sm font-semibold">
            {generation.ok ? "generation ok" : "generation failed"} · {generation.model}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">Prompt</p>
          <p className="mt-1 text-sm leading-6">{testPrompt}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">Result</p>
          <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded border border-white/10 bg-black/20 p-3 text-sm leading-6">
            {generation.ok ? generation.text : generation.error}
          </pre>
        </div>
      ) : null}

      <div className="mt-6 rounded-md border border-line bg-black/20 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Локальный AI ресурс</span>
          <span className="font-semibold text-cyan-100">{localAi.resource}%</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-800">
          <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${localAi.resource}%` }} />
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string;
  tone?: "cyan" | "emerald" | "slate";
}) {
  const toneClass = {
    cyan: "text-cyan-100",
    emerald: "text-emerald-100",
    slate: "text-white",
  };

  return (
    <div className="rounded-md border border-line bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={`mt-2 break-words text-sm font-semibold ${toneClass[tone]}`}>{value}</p>
    </div>
  );
}
