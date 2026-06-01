"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, RefreshCw, Send, ThumbsDown, Wand2, Wrench } from "lucide-react";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import type { PostDraft, PostDraftStatus } from "@/types";
import { cn } from "@/lib/utils";
import { getTextQualityStatus } from "@/lib/text-quality";

type StatusFilter = "all" | PostDraftStatus;

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Все статусы" },
  { value: "draft", label: "draft" },
  { value: "pending_review", label: "pending_review" },
  { value: "approved", label: "approved" },
  { value: "rejected", label: "rejected" },
  { value: "scheduled", label: "scheduled" },
  { value: "needs_revision", label: "needs_revision" },
  { value: "failed_generation", label: "failed_generation" },
  { value: "invalid_text_encoding", label: "invalid_text_encoding" },
  { value: "dry_run_sent", label: "dry_run_sent" },
  { value: "not_ready", label: "not_ready" },
];

export function PostDraftQueuePanel() {
  const [drafts, setDrafts] = useState<PostDraft[]>([]);
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [generationChannelId, setGenerationChannelId] = useState(channelGenerationConfigs[0]?.id ?? "");
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [message, setMessage] = useState("Очередь готова. Telegram dry-run включён.");

  const loadDrafts = useCallback(async () => {
    const params = new URLSearchParams();
    if (channelFilter !== "all") params.set("channelId", channelFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);

    const response = await fetch(`/api/posts/drafts?${params.toString()}`);
    const payload = (await response.json()) as { drafts?: PostDraft[]; error?: string };

    if (payload.drafts) {
      setDrafts(payload.drafts);
      setSelectedDraftId((current) => current ?? payload.drafts?.[0]?.id ?? null);
      return;
    }

    setMessage(payload.error ?? "Не удалось загрузить очередь.");
  }, [channelFilter, statusFilter]);

  useEffect(() => {
    void loadDrafts();
  }, [loadDrafts]);

  const selectedDraft = useMemo(
    () => drafts.find((draft) => draft.id === selectedDraftId) ?? drafts[0],
    [drafts, selectedDraftId],
  );

  async function generateDraft() {
    await runAction("generate", async () => {
      setMessage("AI генерирует черновик. Это может занять до минуты.");
      const response = await fetch("/api/posts/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: generationChannelId }),
      });
      const payload = (await response.json()) as { draft?: PostDraft; error?: string };
      if (!payload.draft) throw new Error(payload.error ?? "Черновик не создан.");
      setSelectedDraftId(payload.draft.id);
      setMessage("Черновик создан и добавлен в редакционную очередь.");
      await loadDrafts();
    });
  }

  async function repairTexts() {
    await runAction("repair-texts", async () => {
      const response = await fetch("/api/posts/repair-texts", { method: "POST" });
      const payload = (await response.json()) as { fixed?: number; remainingBroken?: number };
      setMessage(`Исправлено черновиков: ${payload.fixed ?? 0}. Осталось проблемных: ${payload.remainingBroken ?? 0}.`);
      await loadDrafts();
    });
  }

  async function mutateDraft(id: string, action: "approve" | "reject" | "regenerate" | "schedule" | "dry-run-send") {
    await runAction(`${action}-${id}`, async () => {
      const body = action === "schedule" ? JSON.stringify({ scheduledFor: new Date(Date.now() + 60 * 60 * 1000).toISOString() }) : undefined;
      const response = await fetch(`/api/posts/${id}/${action}`, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body,
      });
      const payload = (await response.json()) as { draft?: PostDraft; error?: string };
      if (!payload.draft) throw new Error(payload.error ?? "Действие не выполнено.");
      setSelectedDraftId(payload.draft.id);
      setMessage(actionMessages[action]);
      await loadDrafts();
    });
  }

  async function runAction(action: string, callback: () => Promise<void>) {
    try {
      setBusyAction(action);
      await callback();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Неизвестная ошибка очереди.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-cyan-300/25 bg-cyan-300/5 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">dry-run редакция</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Очередь постов</h3>
            <p className="mt-1 text-sm text-slate-400">
              Telegram отключён. Черновики не публикуются автоматически и проходят ручную проверку.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={repairTexts}
              disabled={Boolean(busyAction)}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-amber-300/30 bg-amber-300/10 px-3 text-xs font-semibold text-amber-100 hover:border-amber-200 disabled:opacity-60"
            >
              <Wrench className="h-3.5 w-3.5" />
              Исправить битые тексты
            </button>
            <button
              type="button"
              onClick={repairTexts}
              disabled={Boolean(busyAction)}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-cyan-300/30 bg-slate-950 px-3 text-xs font-semibold text-cyan-100 hover:border-cyan-200 disabled:opacity-60"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Перегенерировать плохие черновики
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-cyan-200" />
              <h3 className="text-sm font-semibold text-white">Создать черновик через AI</h3>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Канал</label>
              <select
                value={generationChannelId}
                onChange={(event) => setGenerationChannelId(event.target.value)}
                className="h-11 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
              >
                {channelGenerationConfigs.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={generateDraft}
                disabled={Boolean(busyAction)}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Wand2 className="h-4 w-4" />
                {busyAction === "generate" ? "Генерация..." : "Сгенерировать черновик"}
              </button>
              <p className="text-xs leading-5 text-slate-500">{message}</p>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <h3 className="text-sm font-semibold text-white">Фильтры</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <select value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)} className="h-10 rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60">
                <option value="all">Все каналы</option>
                {channelGenerationConfigs.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>

              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="h-10 rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60">
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {drafts.length ? (
              drafts.map((draft) => {
                const quality = getTextQualityStatus({ title: draft.title, text: draft.content, status: draft.status });
                return (
                  <button
                    key={draft.id}
                    type="button"
                    onClick={() => setSelectedDraftId(draft.id)}
                    className={cn("w-full rounded-lg border border-line bg-panel/70 p-4 text-left transition hover:border-cyan-300/30 hover:bg-slate-900/80", selectedDraft?.id === draft.id && "border-cyan-300/50 bg-cyan-300/10")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="line-clamp-1 text-sm font-semibold text-white">{draft.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{draft.channelTitle ?? draft.channelName}</p>
                      </div>
                      <StatusPill status={draft.status} />
                    </div>
                    <TextQualityPill quality={quality} />
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-400">{draft.content}</p>
                  </button>
                );
              })
            ) : (
              <div className="rounded-lg border border-line bg-panel/70 p-5 text-sm text-slate-400">
                Пока нет черновиков. Выберите канал и создайте первый пост через AI.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-panel/70 p-5">
          {selectedDraft ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Предпросмотр</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{selectedDraft.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {selectedDraft.channelTitle ?? selectedDraft.channelName} · {selectedDraft.language} · {selectedDraft.aiProvider} · {selectedDraft.modelName}
                  </p>
                </div>
                <StatusPill status={selectedDraft.status} />
              </div>

              <TextQualityPill quality={getTextQualityStatus({ title: selectedDraft.title, text: selectedDraft.content, status: selectedDraft.status })} />

              <div className="rounded-md border border-line bg-slate-950/70 p-4">
                <div className="mb-4 overflow-hidden rounded-md border border-cyan-300/15 bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedDraft.imageUrl} alt="" className="h-56 w-full object-cover" />
                  <p className="px-3 py-2 text-xs text-slate-500">{selectedDraft.imageCaption}</p>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{selectedDraft.content}</p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <ActionButton icon={CheckCircle2} label="Одобрить" busy={busyAction === `approve-${selectedDraft.id}`} onClick={() => mutateDraft(selectedDraft.id, "approve")} />
                <ActionButton icon={ThumbsDown} label="Отклонить" busy={busyAction === `reject-${selectedDraft.id}`} onClick={() => mutateDraft(selectedDraft.id, "reject")} />
                <ActionButton icon={RefreshCw} label="Перегенерировать" busy={busyAction === `regenerate-${selectedDraft.id}`} onClick={() => mutateDraft(selectedDraft.id, "regenerate")} />
                <ActionButton icon={Clock3} label="Запланировать" busy={busyAction === `schedule-${selectedDraft.id}`} onClick={() => mutateDraft(selectedDraft.id, "schedule")} />
                <ActionButton icon={Send} label="Dry-run отправка" busy={busyAction === `dry-run-send-${selectedDraft.id}`} onClick={() => mutateDraft(selectedDraft.id, "dry-run-send")} />
              </div>

              <dl className="grid gap-3 rounded-md border border-line bg-slate-950/40 p-4 text-xs sm:grid-cols-2">
                <InfoRow label="createdAt" value={selectedDraft.createdAt} />
                <InfoRow label="updatedAt" value={selectedDraft.updatedAt} />
                <InfoRow label="scheduledFor" value={selectedDraft.scheduledFor ?? "not scheduled"} />
                <InfoRow label="telegramSent" value="false" />
                <InfoRow label="telegramChatId" value={selectedDraft.telegramChatId} />
                <InfoRow label="imageUrl" value={selectedDraft.imageUrl} />
                <InfoRow label="imageStatus" value={selectedDraft.imageStatus ?? "unknown"} />
                <InfoRow label="readiness" value={selectedDraft.readinessStatus ?? "ready_for_test"} />
              </dl>
            </div>
          ) : (
            <div className="flex min-h-[28rem] items-center justify-center text-center text-sm text-slate-500">
              Выберите черновик из очереди или сгенерируйте новый.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function TextQualityPill({ quality }: { quality: ReturnType<typeof getTextQualityStatus> }) {
  return (
    <span className={cn("mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold", quality === "TEXT OK" ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-rose-300/30 bg-rose-300/10 text-rose-100")}>
      {quality}
    </span>
  );
}

function StatusPill({ status }: { status: PostDraftStatus }) {
  return (
    <span className={cn("inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium", status === "pending_review" && "border-cyan-300/30 bg-cyan-300/10 text-cyan-100", status === "approved" && "border-emerald-300/30 bg-emerald-300/10 text-emerald-100", status === "rejected" && "border-rose-300/30 bg-rose-300/10 text-rose-100", status === "scheduled" && "border-blue-300/30 bg-blue-300/10 text-blue-100", status === "needs_revision" && "border-amber-300/30 bg-amber-300/10 text-amber-100", (status === "failed_generation" || status === "generated_failed" || status === "invalid_text_encoding") && "border-rose-300/30 bg-rose-300/10 text-rose-100", status === "dry_run_sent" && "border-blue-300/30 bg-blue-300/10 text-blue-100", status === "not_ready" && "border-amber-300/30 bg-amber-300/10 text-amber-100", status === "draft" && "border-slate-600 bg-slate-800 text-slate-200")}>
      {status}
    </span>
  );
}

function ActionButton({ icon: Icon, label, busy, onClick }: { icon: typeof CheckCircle2; label: string; busy: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/25 bg-slate-950 px-3 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">
      <Icon className={cn("h-4 w-4", busy && "animate-spin")} />
      {label}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 break-all font-mono text-slate-200">{value}</dd>
    </div>
  );
}

const actionMessages = {
  approve: "Черновик одобрен. Telegram не отправлял сообщения.",
  reject: "Черновик отклонён.",
  regenerate: "Черновик перегенерирован и ожидает проверки.",
  schedule: "Черновик добавлен в расписание dry-run.",
  "dry-run-send": "Dry-run выполнен. Реальная отправка заблокирована.",
};
