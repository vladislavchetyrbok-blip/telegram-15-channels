"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Eye, Send, XCircle } from "lucide-react";
import type { PostDraft, PublicationScheduleItem, PublicationScheduleStatus } from "@/types";
import { cn } from "@/lib/utils";

interface BaseScheduleItem {
  id: string;
  channelId: string;
  channelTitle: string;
  telegramChatId: string;
  timezone: "Europe/Kyiv";
  times: string[];
  nextPublicationAt: string;
  dryRun: true;
  telegramSent: false;
}

interface ScheduleState {
  ok: boolean;
  mode: "dry-run";
  dryRun: true;
  telegramSent: false;
  realSendsTotal: number;
  timezone: "Europe/Kyiv";
  suggestedTimes: string[];
  baseSchedule: BaseScheduleItem[];
  approvedDrafts: PostDraft[];
  items: PublicationScheduleItem[];
  calendar: {
    today: PublicationScheduleItem[];
    tomorrow: PublicationScheduleItem[];
    week: PublicationScheduleItem[];
  };
  counters: {
    channelsTotal: number;
    drafts: number;
    approved: number;
    scheduled: number;
    cancelled: number;
    dryRunReady: number;
    dryRunSent: number;
    realSent: number;
  };
}

type CalendarTab = "today" | "tomorrow" | "week";

export function PublicationSchedulePanel() {
  const [state, setState] = useState<ScheduleState | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState("");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState("all");
  const [calendarTab, setCalendarTab] = useState<CalendarTab>("week");
  const [date, setDate] = useState(getTomorrowDate());
  const [time, setTime] = useState("09:00");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [message, setMessage] = useState("Реальные публикации отключены. Планируются только approved черновики.");

  const loadState = useCallback(async () => {
    const response = await fetch("/api/schedule", { cache: "no-store" });
    const payload = (await response.json()) as ScheduleState;
    setState(payload);
    setSelectedDraftId((current) => current || payload.approvedDrafts[0]?.id || "");
    setSelectedScheduleId((current) => current || payload.items[0]?.id || null);
  }, []);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  const approvedDrafts = useMemo(() => {
    const drafts = state?.approvedDrafts ?? [];

    return drafts.filter((draft) => selectedChannelId === "all" || draft.channelId === selectedChannelId);
  }, [selectedChannelId, state?.approvedDrafts]);

  const calendarItems = useMemo(() => {
    const items = state?.calendar[calendarTab] ?? [];

    return items.filter((item) => selectedChannelId === "all" || item.channelId === selectedChannelId);
  }, [calendarTab, selectedChannelId, state?.calendar]);

  const selectedSchedule = useMemo(
    () => state?.items.find((item) => item.id === selectedScheduleId) ?? calendarItems[0] ?? state?.items[0],
    [calendarItems, selectedScheduleId, state?.items],
  );

  async function createSchedule() {
    if (!selectedDraftId) {
      setMessage("Нет approved черновиков для планирования. Pending/rejected/needs_revision не планируются.");
      return;
    }

    await runAction("create", async () => {
      const response = await fetch("/api/schedule/create-from-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draftId: selectedDraftId,
          scheduledFor: `${date}T${time}:00+03:00`,
        }),
      });
      const payload = (await response.json()) as { item?: PublicationScheduleItem; error?: string };

      if (!payload.item) {
        throw new Error(payload.error ?? "Не удалось запланировать черновик.");
      }

      setSelectedScheduleId(payload.item.id);
      setMessage("Черновик добавлен в расписание. Telegram не отправлялся.");
      await loadState();
    });
  }

  async function mutateSchedule(id: string, action: "cancel" | "preview" | "dry-run-send") {
    await runAction(`${action}-${id}`, async () => {
      const response = await fetch(`/api/schedule/${id}/${action}`, {
        method: "POST",
      });
      const payload = (await response.json()) as { item?: PublicationScheduleItem; error?: string };

      if (!payload.item) {
        throw new Error(payload.error ?? "Действие с расписанием не выполнено.");
      }

      setSelectedScheduleId(payload.item.id);
      setMessage(scheduleMessages[action]);
      await loadState();
    });
  }

  async function runAction(action: string, callback: () => Promise<void>) {
    try {
      setBusyAction(action);
      await callback();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка расписания. Telegram не отправлялся.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-amber-200">Europe/Kyiv · dry-run schedule</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Реальные публикации отключены</h3>
            <p className="mt-1 text-sm leading-6 text-amber-100/80">
              Планировать можно только approved черновики. Pending, rejected и needs_revision не попадают в календарь.
            </p>
          </div>
          <div className="rounded-md border border-amber-200/30 bg-slate-950/50 px-3 py-2 text-xs text-amber-100">
            Telegram: dry-run · realSendsTotal={state?.realSendsTotal ?? 1}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
        <Counter label="approved" value={state?.counters.approved ?? 0} />
        <Counter label="scheduled" value={state?.counters.scheduled ?? 0} />
        <Counter label="cancelled" value={state?.counters.cancelled ?? 0} />
        <Counter label="dry-run ready" value={state?.counters.dryRunReady ?? 0} />
        <Counter label="dry-run sent" value={state?.counters.dryRunSent ?? 0} />
        <Counter label="real sends" value={state?.realSendsTotal ?? 1} />
        <Counter label="telegramSent" value={0} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-cyan-200" />
              <h3 className="text-sm font-semibold text-white">Планирование публикаций</h3>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Канал</label>
              <select
                value={selectedChannelId}
                onChange={(event) => {
                  setSelectedChannelId(event.target.value);
                  setSelectedDraftId("");
                }}
                className="h-10 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
              >
                <option value="all">Все каналы</option>
                {state?.baseSchedule.map((slot) => (
                  <option key={slot.channelId} value={slot.channelId}>
                    {slot.channelTitle}
                  </option>
                ))}
              </select>

              <label className="block text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Approved draft</label>
              <select
                value={selectedDraftId}
                onChange={(event) => setSelectedDraftId(event.target.value)}
                className="h-11 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
              >
                {approvedDrafts.length ? (
                  approvedDrafts.map((draft) => (
                    <option key={draft.id} value={draft.id}>
                      {draft.channelTitle}: {draft.title}
                    </option>
                  ))
                ) : (
                  <option value="">Нет approved черновиков</option>
                )}
              </select>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Дата</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="mt-2 h-10 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Время</span>
                  <input
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className="mt-2 h-10 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={createSchedule}
                disabled={busyAction === "create" || !selectedDraftId}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CalendarClock className="h-4 w-4" />
                {busyAction === "create" ? "Планирование..." : "Запланировать"}
              </button>
              <p className="text-xs leading-5 text-slate-500">{message}</p>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <h3 className="text-sm font-semibold text-white">Предложение времени</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Утро 09:00-11:00, день 13:00-15:00, вечер 18:00-21:00. Слоты разнесены минимум на 10-20 минут.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {state?.suggestedTimes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTime(item)}
                  className="rounded-md border border-line bg-slate-950/70 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h3 className="text-sm font-semibold text-white">Календарный вид</h3>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(["today", "tomorrow", "week"] as CalendarTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setCalendarTab(tab)}
                    className={cn(
                      "h-8 rounded-md border border-line px-3 text-slate-300 transition hover:border-cyan-300/40",
                      calendarTab === tab && "border-cyan-300/50 bg-cyan-300/10 text-cyan-100",
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {calendarItems.length ? (
                calendarItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedScheduleId(item.id)}
                    className={cn(
                      "w-full rounded-lg border border-line bg-slate-950/45 p-4 text-left transition hover:border-cyan-300/30",
                      selectedSchedule?.id === item.id && "border-cyan-300/50 bg-cyan-300/10",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.channelTitle}</p>
                        <p className="mt-1 text-xs text-cyan-200">{formatDateTime(item.scheduledFor)}</p>
                      </div>
                      <ScheduleStatus status={item.status} />
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-400">{item.contentPreview}</p>
                  </button>
                ))
              ) : (
                <div className="rounded-md border border-line bg-slate-950/45 p-5 text-sm text-slate-400">
                  Нет запланированных публикаций для выбранного вида.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel/70 p-5">
            {selectedSchedule ? (
              <div className="space-y-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Предпросмотр</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{selectedSchedule.channelTitle}</h3>
                    <p className="mt-2 text-sm text-slate-400">{selectedSchedule.draftId}</p>
                  </div>
                  <ScheduleStatus status={selectedSchedule.status} />
                </div>

                <div className="rounded-md border border-line bg-slate-950/70 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{selectedSchedule.contentPreview}</p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <ActionButton
                    icon={Eye}
                    label="Предпросмотр"
                    busy={busyAction === `preview-${selectedSchedule.id}`}
                    onClick={() => mutateSchedule(selectedSchedule.id, "preview")}
                  />
                  <ActionButton
                    icon={Send}
                    label="Dry-run"
                    busy={busyAction === `dry-run-send-${selectedSchedule.id}`}
                    onClick={() => mutateSchedule(selectedSchedule.id, "dry-run-send")}
                  />
                  <ActionButton
                    icon={XCircle}
                    label="Снять"
                    busy={busyAction === `cancel-${selectedSchedule.id}`}
                    onClick={() => mutateSchedule(selectedSchedule.id, "cancel")}
                  />
                </div>

                <dl className="grid gap-3 rounded-md border border-line bg-slate-950/40 p-4 text-xs sm:grid-cols-2">
                  <InfoRow label="scheduledFor" value={selectedSchedule.scheduledFor} />
                  <InfoRow label="timezone" value={selectedSchedule.timezone} />
                  <InfoRow label="telegramChatId" value={selectedSchedule.telegramChatId} />
                  <InfoRow label="telegramSent" value="false" />
                </dl>
              </div>
            ) : (
              <div className="flex min-h-[24rem] items-center justify-center text-center text-sm text-slate-500">
                Выберите публикацию из календаря или запланируйте approved черновик.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-panel/70 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function ScheduleStatus({ status }: { status: PublicationScheduleStatus }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        status === "scheduled" && "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
        status === "dry_run_ready" && "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
        status === "dry_run_sent" && "border-blue-300/30 bg-blue-300/10 text-blue-100",
        status === "cancelled" && "border-slate-600 bg-slate-800 text-slate-200",
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
  icon: typeof Send;
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

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTomorrowDate() {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return tomorrow.toISOString().slice(0, 10);
}

const scheduleMessages = {
  cancel: "Публикация снята с расписания. Telegram не отправлялся.",
  preview: "Предпросмотр подготовлен. Telegram не отправлялся.",
  "dry-run-send": "Dry-run публикация выполнена. Реальное сообщение не отправлялось.",
};
