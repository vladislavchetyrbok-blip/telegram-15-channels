"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, FilePlus2, Lightbulb, ThumbsDown } from "lucide-react";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import type { ContentPlanItem, ContentPlanStatus } from "@/types";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | ContentPlanStatus;

interface ContentPlanState {
  ok: boolean;
  mode: "dry-run";
  dryRun: true;
  telegramSent: false;
  items: ContentPlanItem[];
  counters: {
    channelsTotal: number;
    ideasToday: number;
    ideasWeek: number;
    approvedIdeas: number;
    draftsCreated: number;
    realSent: number;
  };
}

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Все статусы" },
  { value: "idea", label: "idea" },
  { value: "approved", label: "approved" },
  { value: "rejected", label: "rejected" },
  { value: "converted_to_draft", label: "converted_to_draft" },
];

export function ContentPlanPanel() {
  const [state, setState] = useState<ContentPlanState | null>(null);
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [generationChannelId, setGenerationChannelId] = useState(channelGenerationConfigs[0]?.id ?? "");
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [message, setMessage] = useState("Dry-run: реальные публикации отключены.");

  const loadState = useCallback(async () => {
    const params = new URLSearchParams();

    if (channelFilter !== "all") {
      params.set("channelId", channelFilter);
    }

    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    }

    if (dateFilter) {
      params.set("date", dateFilter);
    }

    const response = await fetch(`/api/content-plan?${params.toString()}`, { cache: "no-store" });
    const payload = (await response.json()) as ContentPlanState;
    setState(payload);
    setSelectedIdeaId((current) => current || payload.items[0]?.id || null);
  }, [channelFilter, dateFilter, statusFilter]);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  const selectedIdea = useMemo(
    () => state?.items.find((item) => item.id === selectedIdeaId) ?? state?.items[0],
    [state, selectedIdeaId],
  );

  async function generateDay() {
    await runAction("generate-day", async () => {
      setMessage("LM Studio генерирует идеи на день. Telegram не трогаем.");
      const response = await fetch("/api/content-plan/generate-day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channelId: generationChannelId }),
      });
      const payload = (await response.json()) as { items?: ContentPlanItem[]; error?: string };

      if (!payload.items?.length) {
        throw new Error(payload.error ?? "Идеи не созданы.");
      }

      setSelectedIdeaId(payload.items[0].id);
      setMessage("Идеи на день созданы. Реальные публикации отключены.");
      await loadState();
    });
  }

  async function generateWeek() {
    await runAction("generate-week", async () => {
      setMessage("LM Studio генерирует недельный план для 15 каналов. Это может занять долго.");
      const response = await fetch("/api/content-plan/generate-week", {
        method: "POST",
      });
      const payload = (await response.json()) as { items?: ContentPlanItem[]; error?: string };

      if (!payload.items?.length) {
        throw new Error(payload.error ?? "Недельный план не создан.");
      }

      setSelectedIdeaId(payload.items[0].id);
      setMessage("Недельный контент-план создан. Telegram не отправлялся.");
      await loadState();
    });
  }

  async function mutateIdea(id: string, action: "approve" | "reject" | "create-draft") {
    await runAction(`${action}-${id}`, async () => {
      const response = await fetch(`/api/content-plan/${id}/${action}`, {
        method: "POST",
      });
      const payload = (await response.json()) as { item?: ContentPlanItem; draftId?: string; error?: string };

      if (!payload.item) {
        throw new Error(payload.error ?? "Действие с идеей не выполнено.");
      }

      setSelectedIdeaId(payload.item.id);
      setMessage(
        action === "approve"
          ? "Идея одобрена."
          : action === "reject"
            ? "Идея отклонена."
            : `Черновик создан из идеи: ${payload.draftId}. Telegram не отправлялся.`,
      );
      await loadState();
    });
  }

  async function runAction(action: string, callback: () => Promise<void>) {
    try {
      setBusyAction(action);
      await callback();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка контент-плана.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-cyan-300/25 bg-cyan-300/5 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">AI editorial planning</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Контент-план</h3>
            <p className="mt-1 text-sm text-slate-400">
              Dry-run: реальные публикации отключены. Идеи создают только темы, не отправляют посты.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 xl:grid-cols-6">
            <Counter label="каналов" value={state?.counters.channelsTotal ?? 15} />
            <Counter label="сегодня" value={state?.counters.ideasToday ?? 0} />
            <Counter label="неделя" value={state?.counters.ideasWeek ?? 0} />
            <Counter label="approved" value={state?.counters.approvedIdeas ?? 0} />
            <Counter label="drafts" value={state?.counters.draftsCreated ?? 0} />
            <Counter label="реальных" value={0} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-cyan-200" />
              <h3 className="text-sm font-semibold text-white">Генерация плана</h3>
            </div>
            <div className="mt-4 space-y-3">
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
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={generateDay}
                  disabled={Boolean(busyAction)}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyAction === "generate-day" ? "Генерация..." : "Сгенерировать план на день"}
                </button>
                <button
                  type="button"
                  onClick={generateWeek}
                  disabled={Boolean(busyAction)}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-cyan-300/30 bg-cyan-300/10 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyAction === "generate-week" ? "Генерация..." : "Сгенерировать план на неделю"}
                </button>
              </div>
              <p className="text-xs leading-5 text-slate-500">{message}</p>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <h3 className="text-sm font-semibold text-white">Фильтры</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <select
                value={channelFilter}
                onChange={(event) => setChannelFilter(event.target.value)}
                className="h-10 rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
              >
                <option value="all">Все каналы</option>
                {channelGenerationConfigs.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className="h-10 rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="h-10 rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
              />
            </div>
          </div>

          <div className="space-y-3">
            {state?.items.length ? (
              state.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIdeaId(item.id)}
                  className={cn(
                    "w-full rounded-lg border border-line bg-panel/70 p-4 text-left transition hover:border-cyan-300/30 hover:bg-slate-900/80",
                    selectedIdea?.id === item.id && "border-cyan-300/50 bg-cyan-300/10",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="line-clamp-1 text-sm font-semibold text-white">{item.topic}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.channelTitle}</p>
                    </div>
                    <StatusPill status={item.status} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-400">{item.angle}</p>
                </button>
              ))
            ) : (
              <div className="rounded-lg border border-line bg-panel/70 p-5 text-sm text-slate-400">
                Пока нет идей. Сгенерируйте план на день для выбранного канала.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-panel/70 p-5">
          {selectedIdea ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Идея поста</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{selectedIdea.topic}</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {selectedIdea.channelTitle} · {selectedIdea.language} · {selectedIdea.postType} ·{" "}
                    {selectedIdea.priority}
                  </p>
                </div>
                <StatusPill status={selectedIdea.status} />
              </div>

              <div className="rounded-md border border-line bg-slate-950/70 p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{selectedIdea.angle}</p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <ActionButton
                  icon={CheckCircle2}
                  label="Одобрить идею"
                  busy={busyAction === `approve-${selectedIdea.id}`}
                  onClick={() => mutateIdea(selectedIdea.id, "approve")}
                />
                <ActionButton
                  icon={ThumbsDown}
                  label="Отклонить идею"
                  busy={busyAction === `reject-${selectedIdea.id}`}
                  onClick={() => mutateIdea(selectedIdea.id, "reject")}
                />
                <ActionButton
                  icon={FilePlus2}
                  label="Создать черновик"
                  busy={busyAction === `create-draft-${selectedIdea.id}`}
                  onClick={() => mutateIdea(selectedIdea.id, "create-draft")}
                />
              </div>

              <dl className="grid gap-3 rounded-md border border-line bg-slate-950/40 p-4 text-xs sm:grid-cols-2">
                <InfoRow label="plannedFor" value={selectedIdea.plannedFor} />
                <InfoRow label="createdAt" value={selectedIdea.createdAt} />
                <InfoRow label="updatedAt" value={selectedIdea.updatedAt} />
                <InfoRow label="dryRun" value="true" />
              </dl>
            </div>
          ) : (
            <div className="flex min-h-[28rem] items-center justify-center text-center text-sm text-slate-500">
              Выберите идею или сгенерируйте новый контент-план.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-cyan-300/15 bg-slate-950/40 px-3 py-2 text-right">
      <p className="font-semibold text-white">{value}</p>
      <p className="text-slate-500">{label}</p>
    </div>
  );
}

function StatusPill({ status }: { status: ContentPlanStatus }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        status === "idea" && "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
        status === "approved" && "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
        status === "rejected" && "border-rose-300/30 bg-rose-300/10 text-rose-100",
        status === "converted_to_draft" && "border-blue-300/30 bg-blue-300/10 text-blue-100",
      )}
    >
      {status}
    </span>
  );
}

function ActionButton({
  icon: Icon,
  label,
  busy,
  onClick,
}: {
  icon: typeof CheckCircle2;
  label: string;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-slate-950/70 px-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Icon className={cn("h-4 w-4", busy && "animate-spin")} />
      {busy ? "..." : label}
    </button>
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
