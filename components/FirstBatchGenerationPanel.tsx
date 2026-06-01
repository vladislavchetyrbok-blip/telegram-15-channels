"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, Wand2, XCircle } from "lucide-react";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import type { PostDraft, PostDraftValidationStatus } from "@/types";
import { cn } from "@/lib/utils";

interface FirstBatchResult {
  channelId: string;
  channelTitle: string;
  ok: boolean;
  draft?: PostDraft;
  validationStatus: PostDraftValidationStatus;
  validationNotes: string[];
  error?: string;
}

interface FirstBatchResponse {
  ok: boolean;
  mode: "dry-run";
  dryRun: true;
  telegramSent: false;
  realSendsTotal: number;
  repeatLock: boolean;
  createdCount: number;
  drafts: PostDraft[];
  results: FirstBatchResult[];
  error?: string;
}

export function FirstBatchGenerationPanel() {
  const [busy, setBusy] = useState(false);
  const [payload, setPayload] = useState<FirstBatchResponse | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState(channelGenerationConfigs[0]?.id ?? "");
  const [message, setMessage] = useState("Ready. Telegram real sending is disabled; drafts will wait for review.");

  const selectedResult = useMemo(() => {
    return payload?.results.find((result) => result.channelId === selectedChannelId) ?? payload?.results[0] ?? null;
  }, [payload, selectedChannelId]);

  async function generateFirstBatch() {
    setBusy(true);
    setMessage("LM Studio is generating one draft for each of the 15 channels. Telegram is not touched.");

    try {
      const response = await fetch("/api/posts/generate-first-batch", {
        method: "POST",
      });
      const result = (await response.json()) as FirstBatchResponse;
      setPayload(result);
      setSelectedChannelId(result.results[0]?.channelId ?? selectedChannelId);

      if (!response.ok || result.error) {
        setMessage(result.error ?? "First batch generation was blocked by safety checks.");
        return;
      }

      setMessage(`Created ${result.createdCount} drafts. telegramSent=0, realSendsTotal=${result.realSendsTotal}.`);
    } catch {
      setMessage("Request failed. No Telegram message was sent.");
    } finally {
      setBusy(false);
    }
  }

  const passed = payload?.results.filter((result) => result.validationStatus === "passed").length ?? 0;
  const needsRevision = payload?.results.filter((result) => result.validationStatus === "needs_revision").length ?? 0;
  const failed = payload?.results.filter((result) => result.validationStatus === "failed").length ?? 0;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-cyan-300/25 bg-cyan-300/5 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">first batch generation</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Первые 15 черновиков</h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
              LM Studio создаёт по одному черновику на канал. Статус остаётся pending_review, публикация и
              автопостинг не запускаются.
            </p>
          </div>
          <button
            type="button"
            onClick={generateFirstBatch}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {busy ? "Генерация..." : "Сгенерировать первые 15 черновиков"}
          </button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-5">
        <Metric label="channels" value="15" tone="cyan" />
        <Metric label="created drafts" value={String(payload?.createdCount ?? 0)} tone="emerald" />
        <Metric label="quality passed" value={String(passed)} tone="emerald" />
        <Metric label="needs revision" value={String(needsRevision)} tone="amber" />
        <Metric label="telegramSent" value="0" tone="slate" />
      </section>

      <section className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4" />
          Реальная отправка отключена
        </div>
        <p className="mt-1 leading-6">
          TELEGRAM_DRY_RUN=true, TELEGRAM_REAL_SENDING_ENABLED=false, repeatLock=true, realSendsTotal остаётся 1.
          Этот экран создаёт только черновики.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-3">
          {channelGenerationConfigs.map((channel) => {
            const result = payload?.results.find((item) => item.channelId === channel.id);
            const active = selectedChannelId === channel.id;

            return (
              <button
                key={channel.id}
                type="button"
                onClick={() => setSelectedChannelId(channel.id)}
                className={cn(
                  "w-full rounded-lg border border-line bg-panel/70 p-4 text-left transition hover:border-cyan-300/30",
                  active && "border-cyan-300/50 bg-cyan-300/10",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{channel.name}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">{channel.topic}</p>
                  </div>
                  <ValidationPill status={result?.validationStatus ?? "failed"} pending={!result} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span>{channel.language}</span>
                  <span>pending_review</span>
                  <span>dryRun=true</span>
                  <span>telegramSent=false</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-lg border border-line bg-panel/70 p-5">
          {selectedResult?.draft ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">draft preview</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{selectedResult.draft.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {selectedResult.channelTitle} · {selectedResult.draft.language} · {selectedResult.draft.aiProvider}
                  </p>
                </div>
                <ValidationPill status={selectedResult.validationStatus} />
              </div>

              <div className="rounded-md border border-line bg-slate-950/70 p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{selectedResult.draft.content}</p>
              </div>

              <dl className="grid gap-3 rounded-md border border-line bg-slate-950/40 p-4 text-xs sm:grid-cols-2">
                <InfoRow label="status" value={selectedResult.draft.status} />
                <InfoRow label="source" value={selectedResult.draft.source ?? "first_batch_generation"} />
                <InfoRow label="validation" value={selectedResult.validationStatus} />
                <InfoRow label="telegramSent" value="false" />
                <InfoRow label="model" value={selectedResult.draft.modelName} />
                <InfoRow label="createdAt" value={selectedResult.draft.createdAt} />
              </dl>

              {selectedResult.validationNotes.length ? (
                <div className="rounded-md border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
                  <p className="font-semibold">Quality notes</p>
                  <ul className="mt-2 space-y-1">
                    {selectedResult.validationNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-md border border-emerald-300/25 bg-emerald-300/10 p-4 text-sm text-emerald-100">
                  Quality check passed. Draft still waits for manual review.
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-[32rem] items-center justify-center text-center text-sm text-slate-500">
              <div>
                <p>{message}</p>
                <p className="mt-2">Select a channel after generation to preview the draft.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <p className="text-xs text-slate-500">{message}</p>
      {failed ? <p className="text-xs text-rose-200">Failed generations: {failed}. Telegram was not touched.</p> : null}
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "cyan" | "emerald" | "amber" | "slate" }) {
  const toneClass = {
    cyan: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    emerald: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
    amber: "border-amber-300/25 bg-amber-300/10 text-amber-100",
    slate: "border-slate-700 bg-slate-900/70 text-slate-100",
  }[tone];

  return (
    <div className={cn("rounded-lg border p-4", toneClass)}>
      <p className="text-xs uppercase tracking-[0.16em] opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ValidationPill({ status, pending = false }: { status: PostDraftValidationStatus; pending?: boolean }) {
  if (pending) {
    return <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-400">waiting</span>;
  }

  const Icon = status === "passed" ? CheckCircle2 : XCircle;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        status === "passed" && "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
        status === "needs_revision" && "border-amber-300/30 bg-amber-300/10 text-amber-100",
        status === "failed" && "border-rose-300/30 bg-rose-300/10 text-rose-100",
      )}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 break-all font-medium text-slate-200">{value}</dd>
    </div>
  );
}
