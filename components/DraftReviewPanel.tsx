"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, RefreshCw, Split, ThumbsDown, Wrench, XCircle } from "lucide-react";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import type { DraftReviewHistory, PostDraft, PostDraftLanguage, PostDraftStatus } from "@/types";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | PostDraftStatus;
type LanguageFilter = "all" | PostDraftLanguage;

interface ReviewCheck {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
}

interface ReviewItem {
  draft: PostDraft;
  checks: ReviewCheck[];
  history: DraftReviewHistory[];
}

interface ReviewCounters {
  total: number;
  firstBatchDrafts: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  needsRevision: number;
  regenerated: number;
  telegramSent: number;
  realSendsTotal: number;
}

interface ReviewResponse {
  ok: boolean;
  counters: ReviewCounters;
  items: ReviewItem[];
}

const statusOptions: StatusFilter[] = [
  "all",
  "pending_review",
  "approved",
  "rejected",
  "needs_revision",
  "generated_failed",
  "scheduled",
  "dry_run_sent",
  "not_ready",
  "draft",
];

export function DraftReviewPanel() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [counters, setCounters] = useState<ReviewCounters | null>(null);
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>("all");
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [message, setMessage] = useState("Проверка готова. Telegram отключён, черновики не публикуются.");

  const loadReview = useCallback(async () => {
    const params = new URLSearchParams();

    if (channelFilter !== "all") {
      params.set("channelId", channelFilter);
    }

    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    }

    if (languageFilter !== "all") {
      params.set("language", languageFilter);
    }

    const response = await fetch(`/api/posts/review?${params.toString()}`, { cache: "no-store" });
    const payload = (await response.json()) as ReviewResponse;
    setItems(payload.items ?? []);
    setCounters(payload.counters ?? null);
    setSelectedDraftId((current) => current ?? payload.items?.[0]?.draft.id ?? null);
  }, [channelFilter, languageFilter, statusFilter]);

  useEffect(() => {
    void loadReview();
  }, [loadReview]);

  const selectedItem = useMemo(
    () => items.find((item) => item.draft.id === selectedDraftId) ?? items[0] ?? null,
    [items, selectedDraftId],
  );

  async function mutateDraft(action: "approve" | "reject" | "needs-revision" | "regenerate" | "create-variant") {
    if (!selectedItem) {
      return;
    }

    await runAction(action, async () => {
      const response = await fetch(`/api/posts/${selectedItem.draft.id}/${action}`, {
        method: "POST",
        headers: action === "needs-revision" ? { "Content-Type": "application/json" } : undefined,
        body: action === "needs-revision" ? JSON.stringify({ notes: "Manual review requested changes." }) : undefined,
      });
      const payload = (await response.json()) as { draft?: PostDraft; error?: string };

      if (!payload.draft) {
        throw new Error(payload.error ?? "Action failed.");
      }

      setSelectedDraftId(payload.draft.id);
      setMessage(actionMessages[action]);
      await loadReview();
    });
  }

  async function runAction(action: string, callback: () => Promise<void>) {
    try {
      setBusyAction(action);
      await callback();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review action failed. Telegram was not touched.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-amber-200">safe editorial review</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Telegram отключён. Черновики не публикуются.</h3>
            <p className="mt-1 text-sm leading-6 text-amber-100/80">
              Все действия меняют только локальные черновики: approve, reject, revision, regenerate и variant.
            </p>
          </div>
          <div className="rounded-md border border-amber-200/30 bg-slate-950/50 px-3 py-2 text-xs text-amber-100">
            telegramSent=0 · realSendsTotal={counters?.realSendsTotal ?? 1}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
        <Metric label="drafts" value={counters?.total ?? 0} />
        <Metric label="first batch" value={counters?.firstBatchDrafts ?? 0} />
        <Metric label="pending" value={counters?.pendingReview ?? 0} />
        <Metric label="approved" value={counters?.approved ?? 0} />
        <Metric label="needs revision" value={counters?.needsRevision ?? 0} />
        <Metric label="regenerated" value={counters?.regenerated ?? 0} />
        <Metric label="telegramSent" value={counters?.telegramSent ?? 0} />
      </section>

      <section className="grid gap-4 rounded-lg border border-line bg-panel/70 p-4 md:grid-cols-3">
        <FilterSelect label="Канал" value={channelFilter} onChange={setChannelFilter}>
          <option value="all">Все каналы</option>
          {channelGenerationConfigs.map((channel) => (
            <option key={channel.id} value={channel.id}>
              {channel.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect label="Статус" value={statusFilter} onChange={(value) => setStatusFilter(value as StatusFilter)}>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect label="Язык" value={languageFilter} onChange={(value) => setLanguageFilter(value as LanguageFilter)}>
          <option value="all">Все языки</option>
          <option value="ru">ru</option>
          <option value="uk">uk</option>
        </FilterSelect>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-3">
          {items.map((item) => (
            <button
              key={item.draft.id}
              type="button"
              onClick={() => setSelectedDraftId(item.draft.id)}
              className={cn(
                "w-full rounded-lg border border-line bg-panel/70 p-4 text-left transition hover:border-cyan-300/30",
                selectedItem?.draft.id === item.draft.id && "border-cyan-300/50 bg-cyan-300/10",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-semibold text-white">{item.draft.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.draft.channelTitle}</p>
                </div>
                <StatusPill status={item.draft.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <Badge text={item.draft.language} />
                <Badge text={item.draft.validationStatus ?? "unknown"} />
                <Badge text="telegramSent=false" />
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-line bg-panel/70 p-5">
          {selectedItem ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">preview</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{selectedItem.draft.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {selectedItem.draft.channelTitle} · {selectedItem.draft.language} · {selectedItem.draft.aiProvider}
                  </p>
                </div>
                <StatusPill status={selectedItem.draft.status} />
              </div>

              <div className="rounded-md border border-line bg-slate-950/70 p-4">
                <div className="mb-4 overflow-hidden rounded-md border border-cyan-300/15 bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedItem.draft.imageUrl} alt="" className="h-56 w-full object-cover" />
                  <p className="px-3 py-2 text-xs text-slate-500">{selectedItem.draft.imageCaption}</p>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{selectedItem.draft.content}</p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                <ActionButton icon={CheckCircle2} label="Одобрить" busy={busyAction === "approve"} onClick={() => mutateDraft("approve")} />
                <ActionButton icon={ThumbsDown} label="Отклонить" busy={busyAction === "reject"} onClick={() => mutateDraft("reject")} />
                <ActionButton icon={Wrench} label="На доработку" busy={busyAction === "needs-revision"} onClick={() => mutateDraft("needs-revision")} />
                <ActionButton icon={RefreshCw} label="Перегенерировать" busy={busyAction === "regenerate"} onClick={() => mutateDraft("regenerate")} />
                <ActionButton icon={Split} label="Создать вариант 2" busy={busyAction === "create-variant"} onClick={() => mutateDraft("create-variant")} />
              </div>

              <section className="rounded-md border border-line bg-slate-950/40 p-4">
                <h4 className="text-sm font-semibold text-white">Проверки качества</h4>
                <div className="mt-3 grid gap-2">
                  {selectedItem.checks.map((check) => (
                    <div key={check.key} className="flex items-start justify-between gap-3 rounded-md border border-line bg-black/20 px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        {check.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <XCircle className="h-4 w-4 text-amber-300" />}
                        <span className="font-medium text-slate-200">{check.label}</span>
                      </div>
                      <span className={cn("max-w-[55%] text-right", check.ok ? "text-emerald-100" : "text-amber-100")}>{check.detail}</span>
                    </div>
                  ))}
                </div>
              </section>

              {selectedItem.draft.validationNotes?.length ? (
                <section className="rounded-md border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
                  <p className="font-semibold">Validation notes</p>
                  <ul className="mt-2 space-y-1">
                    {selectedItem.draft.validationNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="rounded-md border border-line bg-slate-950/40 p-4 text-xs">
                <h4 className="text-sm font-semibold text-white">Review history</h4>
                <div className="mt-3 space-y-2 text-slate-400">
                  {selectedItem.history.length ? (
                    selectedItem.history.map((history) => (
                      <p key={history.id}>
                        {history.createdAt} · {history.action} · {history.previousStatus} → {history.nextStatus}
                      </p>
                    ))
                  ) : (
                    <p>No review actions yet.</p>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className="flex min-h-[28rem] items-center justify-center text-sm text-slate-500">
              Черновики не найдены по текущим фильтрам.
            </div>
          )}
        </div>
      </section>

      <p className="text-xs text-slate-500">{message}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-panel/70 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
      >
        {children}
      </select>
    </label>
  );
}

function StatusPill({ status }: { status: PostDraftStatus }) {
  return <span className="inline-flex shrink-0 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-medium text-cyan-100">{status}</span>;
}

function Badge({ text }: { text: string }) {
  return <span className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-300">{text}</span>;
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
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-slate-950/70 px-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100 disabled:cursor-wait disabled:opacity-60"
    >
      <Icon className={cn("h-4 w-4", busy && "animate-spin")} />
      {busy ? "..." : label}
    </button>
  );
}

const actionMessages = {
  approve: "Черновик одобрен вручную. Telegram не отправлялся.",
  reject: "Черновик отклонён. Telegram не отправлялся.",
  "needs-revision": "Черновик отправлен на доработку. Telegram не отправлялся.",
  regenerate: "Черновик перегенерирован через LM Studio. Telegram не отправлялся.",
  "create-variant": "Создан вариант 2. Оригинал сохранён, Telegram не отправлялся.",
};
