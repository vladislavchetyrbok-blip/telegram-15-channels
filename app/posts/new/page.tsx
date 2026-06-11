"use client";

import { useMemo, useState, useEffect } from "react";
import { AlertTriangle, Bot, CalendarPlus, Loader2, Rocket, Save, Activity, CheckCircle2, ServerCrash } from "lucide-react";
import { LanguageBadge } from "@/components/LanguageBadge";
import { channels } from "@/data/channels";
import { localAi } from "@/data/system";
import type { AiMode } from "@/lib/ai";

interface GenerateApiResponse {
  ok: boolean;
  text: string;
  provider: string;
  mode: AiMode;
  model?: string;
  error?: string;
}

export default function NewPostPage() {
  const [selectedChannelId, setSelectedChannelId] = useState(channels[1]?.id ?? channels[0].id);
  const [topic, setTopic] = useState("7 AI-инструментов для Telegram-контента");
  const [mode, setMode] = useState<AiMode>("mock");
  const [result, setResult] = useState(
    [
      "Mock result:",
      "",
      "AI уже не просто ускоряет подготовку постов, а помогает держать ритм целой сетки каналов. Для Telegram-команды это значит: быстрее находить темы, адаптировать тон под аудиторию и заранее собирать контент-план.",
      "",
      "Проверяйте факты, добавляйте локальный контекст и отправляйте в публикацию только после review.",
    ].join("\n"),
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [diagnostic, setDiagnostic] = useState<{
    status: "idle" | "checking" | "ok" | "error";
    message: string;
  }>({ status: "idle", message: "" });
  const [isProduction, setIsProduction] = useState(false);
  const [lastModelUsed, setLastModelUsed] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsProduction(
        window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
      );
    }
  }, []);

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId) ?? channels[0],
    [selectedChannelId],
  );

  async function checkLMStudio() {
    setDiagnostic({ status: "checking", message: "Проверка подключения..." });
    try {
      const res = await fetch(`${localAi.apiUrl}/models`, { method: "GET" });
      if (res.ok) {
        setDiagnostic({ status: "ok", message: "LM Studio доступен (локально)" });
      } else {
        setDiagnostic({ status: "error", message: `Ошибка сервера LM Studio (${res.status})` });
      }
    } catch {
      setDiagnostic({ status: "error", message: "LM Studio не отвечает" });
    }
  }

  async function generatePost() {
    setLoading(true);
    setStatusMessage(null);
    setLastModelUsed(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelName: selectedChannel.name,
          language: selectedChannel.language,
          topic,
          mode,
        }),
      });

      if (!response.ok) {
        setStatusMessage(`Ошибка сервера генерации (HTTP ${response.status}). Возможно, запрос упал по таймауту.`);
        return;
      }

      const payload = (await response.json()) as GenerateApiResponse;
      if (payload.model) {
        setLastModelUsed(payload.model);
      }

      if (!payload.ok) {
        setStatusMessage(
          payload.error ?? "LM Studio не запущен или модель не загружена. Откройте LM Studio → Local Server."
        );
        return;
      }

      setResult(payload.text);
      setStatusMessage(
        payload.mode === "local"
          ? "Пост сгенерирован через локальный AI."
          : "Пост сгенерирован в mock-режиме."
      );
    } catch (error) {
      setStatusMessage("Сетевая ошибка при вызове /api/ai/generate. Проверьте соединение.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section className="rounded-lg border border-line bg-panel/82 p-6 shadow-glow">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Local AI generator</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Создание поста</h2>

        <form className="mt-6 space-y-6">
          <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-cyan-200" />
                  <h3 className="text-lg font-semibold text-white">Генерация через локальный AI</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {localAi.provider} · {localAi.model} · {localAi.apiUrl}
                </p>
              </div>
              <span className="rounded border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-100">
                {mode === "local" ? "local mode" : "mock mode"}
              </span>
            </div>

            <div className="mt-5 rounded-md border border-slate-700 bg-slate-800/40 p-4">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Activity className="h-4 w-4" />
                  Диагностика LM Studio
                </h4>
                <button
                  type="button"
                  onClick={checkLMStudio}
                  className="rounded bg-slate-700 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-600 transition"
                  disabled={diagnostic.status === "checking"}
                >
                  {diagnostic.status === "checking" ? "Проверка..." : "Проверить"}
                </button>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
                <li className="flex justify-between">
                  <span>Среда запуска UI:</span>
                  <span className={isProduction ? "text-amber-300" : "text-emerald-300"}>
                    {isProduction ? "Production (Vercel)" : "Local Development"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>API URL:</span>
                  <span className="text-slate-300">{localAi.apiUrl}</span>
                </li>
                <li className="flex justify-between">
                  <span>Модель (ожидаемая):</span>
                  <span className="text-slate-300">{localAi.model}</span>
                </li>
                {lastModelUsed && (
                  <li className="flex justify-between">
                    <span>Модель (фактическая):</span>
                    <span className="text-cyan-300">{lastModelUsed}</span>
                  </li>
                )}
                <li className="flex justify-between items-center border-t border-slate-700/50 pt-1.5 mt-1.5">
                  <span>Пинг с клиента:</span>
                  {diagnostic.status === "idle" && <span className="text-slate-500">Не проверялось</span>}
                  {diagnostic.status === "checking" && <span className="text-cyan-300 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin"/> Проверка</span>}
                  {diagnostic.status === "ok" && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Работает</span>}
                  {diagnostic.status === "error" && <span className="text-rose-400 flex items-center gap-1"><ServerCrash className="h-3 w-3"/> Ошибка</span>}
                </li>
              </ul>
              {isProduction && (
                <div className="mt-3 rounded bg-amber-500/10 border border-amber-500/20 p-2 text-xs text-amber-200">
                  <strong>Внимание:</strong> Локальный LM Studio недоступен из Vercel. Запустите проект локально или подключите облачный AI provider.
                </div>
              )}
            </div>

            <div className="mt-5 inline-flex flex-wrap rounded-md border border-line bg-black/20 p-1">
              <label
                onClick={() => setMode("mock")}
                className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded px-3 text-sm font-semibold ${
                  mode === "mock" ? "bg-cyan-300 text-slate-950" : "text-slate-400"
                }`}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="ai-mode"
                  checked={mode === "mock"}
                  onChange={() => setMode("mock")}
                />
                Mock AI
              </label>
              <label
                onClick={() => setMode("local")}
                className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded px-3 text-sm font-semibold ${
                  mode === "local" ? "bg-cyan-300 text-slate-950" : "text-slate-400"
                }`}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="ai-mode"
                  checked={mode === "local"}
                  onChange={() => setMode("local")}
                />
                Local AI
                <span
                  className={`rounded border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                    mode === "local"
                      ? "border-slate-900/20 bg-slate-900/10 text-slate-950"
                      : "border-amber-300/30 bg-amber-300/10 text-amber-100"
                  }`}
                >
                  requires LM Studio server
                </span>
              </label>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-300" htmlFor="ai-channel">
                  Выбор канала
                </label>
                <select
                  id="ai-channel"
                  value={selectedChannelId}
                  onChange={(event) => setSelectedChannelId(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-line bg-[#090f1d] px-3 text-sm text-white outline-none ring-cyan-300/20 focus:ring-2"
                >
                  {channels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name} · {channel.language}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300" htmlFor="ai-topic">
                  Тема поста
                </label>
                <input
                  id="ai-topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-line bg-[#090f1d] px-3 text-sm text-white outline-none ring-cyan-300/20 placeholder:text-slate-600 focus:ring-2"
                  placeholder="Например: 5 AI-сервисов для бизнеса"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={generatePost}
              disabled={loading || !topic.trim()}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
              Сгенерировать через локальный AI
            </button>

            {statusMessage ? (
              <div
                className={`mt-4 rounded-md border p-4 text-sm leading-6 ${
                  statusMessage.includes("не запущен") || statusMessage.includes("Ошибка")
                    ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
                    : "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              </div>
            ) : null}

            <div className="mt-5">
              <label className="text-sm font-medium text-slate-300" htmlFor="ai-result">
                Результат генерации
              </label>
              <textarea
                id="ai-result"
                rows={9}
                value={result}
                onChange={(event) => setResult(event.target.value)}
                className="mt-2 w-full rounded-md border border-cyan-300/20 bg-[#090f1d] px-3 py-3 text-sm leading-6 text-white outline-none ring-cyan-300/20 placeholder:text-slate-600 focus:ring-2"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-300" htmlFor="date">
                Дата публикации
              </label>
              <input
                id="date"
                type="datetime-local"
                className="mt-2 h-11 w-full rounded-md border border-line bg-[#090f1d] px-3 text-sm text-white outline-none ring-cyan-300/20 focus:ring-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300" htmlFor="status">
                Статус
              </label>
              <select
                id="status"
                className="mt-2 h-11 w-full rounded-md border border-line bg-[#090f1d] px-3 text-sm text-white outline-none ring-cyan-300/20 focus:ring-2"
                defaultValue="draft"
              >
                <option value="draft">draft</option>
                <option value="pending_review">pending_review</option>
                <option value="approved">approved</option>
                <option value="scheduled">scheduled</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
            Telegram dry-run включён. Посты не будут реально отправляться, пока TELEGRAM_DRY_RUN=true.
          </div>

          <div className="flex flex-wrap gap-2 border-t border-line pt-5">
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-panel px-4 text-sm font-semibold text-slate-200">
              <Save className="h-4 w-4" />
              Сохранить черновик
            </button>
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-4 text-sm font-semibold text-cyan-100">
              <CalendarPlus className="h-4 w-4" />
              Запланировать
            </button>
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-300 px-4 text-sm font-semibold text-slate-950">
              <Rocket className="h-4 w-4" />
              Опубликовать
            </button>
          </div>
        </form>
      </section>

      <aside className="space-y-4">
        <div className="rounded-lg border border-line bg-panel/82 p-5 shadow-glow">
          <h3 className="text-lg font-semibold text-white">Каналы для быстрого выбора</h3>
          <div className="mt-4 space-y-3">
            {channels.slice(0, 10).map((channel) => (
              <div key={channel.id} className="flex items-center justify-between gap-3 rounded-md border border-line bg-black/15 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-300">{channel.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{channel.scheduledPosts} в расписании</p>
                </div>
                <LanguageBadge language={channel.language} />
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
