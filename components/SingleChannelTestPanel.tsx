"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, LockKeyhole, Send, ShieldCheck } from "lucide-react";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import { cn } from "@/lib/utils";

interface SingleTestDraft {
  id: string;
  title: string;
  channelId: string;
  channelTitle: string;
  status: string;
  scheduledFor: string | null;
  contentPreview: string;
}

interface SingleTestStatus {
  ok: boolean;
  mode: "dry-run";
  dryRun: boolean;
  enabled: boolean;
  testMode: "locked" | "ready";
  selectedChannel: {
    id: string;
    title: string;
    telegramChatId: string;
  };
  maxMessagesPerTest: 1;
  requireManualConfirm: true;
  confirmationPhrase: string;
  realSendingAllowed: boolean;
  realSendingEnabled: boolean;
  telegramSent: false;
  realSendsTotal: number;
  lastTestAt: string | null;
  lastRealTestSentAt: string | null;
  defaultRealTestText: string;
  realTestLockedAfterSuccess: boolean;
  eligibleDrafts: SingleTestDraft[];
}

interface PrepareResult {
  ok: boolean;
  mode: "dry-run";
  status: string;
  canSendReal: false;
  telegramSent: boolean;
  channelTitle?: string;
  telegramChatId?: string;
  textPreview?: string;
  reason: string;
  safety?: {
    checks: Array<{
      key: string;
      ok: boolean;
      message: string;
    }>;
  };
}

export function SingleChannelTestPanel() {
  const [selectedChannelId, setSelectedChannelId] = useState("ai-tech");
  const [status, setStatus] = useState<SingleTestStatus | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState("");
  const [text, setText] = useState("Тестова публікація. Система Telegram-каналів підключена. Це перша контрольна відправка в один канал.");
  const [confirmationPhrase, setConfirmationPhrase] = useState("");
  const [prepareResult, setPrepareResult] = useState<PrepareResult | null>(null);
  const [busy, setBusy] = useState<"prepare" | "confirm" | "real" | null>(null);
  const [message, setMessage] = useState("Массовая отправка отключена. Возможен только один канал после ручного подтверждения.");

  const selectedChannel = useMemo(
    () => channelGenerationConfigs.find((channel) => channel.id === selectedChannelId) ?? channelGenerationConfigs[0],
    [selectedChannelId],
  );
  const realTestChannels = useMemo(
    () => channelGenerationConfigs.filter((channel) => channel.id === "ai-tech"),
    [],
  );

  const loadStatus = useCallback(async () => {
    const response = await fetch(`/api/telegram/single-test/status?channelId=${encodeURIComponent(selectedChannelId)}`, {
      cache: "no-store",
    });
    const payload = (await response.json()) as SingleTestStatus;
    setStatus(payload);
    setSelectedDraftId((current) => current || payload.eligibleDrafts[0]?.id || "");
  }, [selectedChannelId]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  async function prepareTest() {
    try {
      setBusy("prepare");
      const response = await fetch("/api/telegram/single-test/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: selectedChannelId,
          draftId: selectedDraftId || undefined,
          text: selectedDraftId ? undefined : text,
        }),
      });
      const payload = (await response.json()) as PrepareResult;
      setPrepareResult(payload);
      setMessage(payload.reason);
      await loadStatus();
    } finally {
      setBusy(null);
    }
  }

  async function confirmTest() {
    try {
      setBusy("confirm");
      const response = await fetch("/api/telegram/single-test/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: selectedChannelId,
          confirmationPhrase,
        }),
      });
      const payload = (await response.json()) as { reason: string; telegramSent: false };
      setMessage(`${payload.reason} telegramSent=${String(payload.telegramSent)}.`);
      await loadStatus();
    } finally {
      setBusy(null);
    }
  }

  async function sendRealTest() {
    try {
      setBusy("real");
      const response = await fetch("/api/telegram/single-test/send-real", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: selectedChannelId,
          text,
          confirmationPhrase,
        }),
      });
      const payload = (await response.json()) as {
        reason?: string;
        message?: string;
        telegramSent: boolean;
        textPreview?: string;
      };
      setMessage(`${payload.message || payload.reason || "Real test blocked."} telegramSent=${String(payload.telegramSent)}.`);
      setPrepareResult((current) =>
        current
          ? {
              ...current,
              telegramSent: payload.telegramSent,
              textPreview: payload.textPreview ?? current.textPreview,
              reason: payload.message || payload.reason || current.reason,
            }
          : null,
      );
      await loadStatus();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-cyan-300/25 bg-cyan-300/5 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Single-channel real test mode</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Тестовая отправка в один канал</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Отдельный ручной сценарий будущей тестовой отправки. Он не связан с автопостингом и расписанием.
              Сейчас реальная отправка заблокирована dry-run режимом.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
            <StatusTile label="TELEGRAM_DRY_RUN" value={String(status?.dryRun ?? true)} tone="dry" />
            <StatusTile label="realSendingEnabled" value={String(status?.realSendingEnabled ?? false)} tone="error" />
            <StatusTile label="max/test" value={String(status?.maxMessagesPerTest ?? 1)} tone="warn" />
            <StatusTile label="telegramSent" value="false" tone="dry" />
            <StatusTile label="real sends" value={String(status?.realSendsTotal ?? 1)} tone="error" />
          </div>
        </div>
        <div className="mt-4 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
          Первый реальный single-channel test выполнен: AI и технологии, messagesSent=1,
          massBroadcast=false. Повторная реальная отправка заблокирована repeatLock=true; для
          следующего реального теста нужно отдельное ручное разрешение.
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-cyan-200" />
              <h3 className="text-sm font-semibold text-white">Подготовить тест</h3>
            </div>
            <div className="mt-4 space-y-3">
              <select
                value={selectedChannelId}
                onChange={(event) => {
                  setSelectedChannelId(event.target.value);
                  setSelectedDraftId("");
                }}
                className="h-10 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
              >
                {realTestChannels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedDraftId}
                onChange={(event) => setSelectedDraftId(event.target.value)}
                className="h-10 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
              >
                <option value="">Без черновика, использовать текст ниже</option>
                {status?.eligibleDrafts.map((draft) => (
                  <option key={draft.id} value={draft.id}>
                    {draft.status} · {draft.title}
                  </option>
                ))}
              </select>

              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                disabled={Boolean(selectedDraftId)}
                rows={6}
                className="w-full resize-none rounded-md border border-line bg-slate-950 px-3 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 disabled:opacity-50"
              />

              <button
                type="button"
                onClick={prepareTest}
                disabled={Boolean(busy) || !selectedChannel}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShieldCheck className="h-4 w-4" />
                {busy === "prepare" ? "Подготовка..." : "Подготовить тест"}
              </button>
              <p className="rounded-md border border-line bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">{message}</p>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-rose-200" />
              <h3 className="text-sm font-semibold text-white">Ручное подтверждение</h3>
            </div>
            <div className="mt-4 space-y-3">
              <input
                value={confirmationPhrase}
                onChange={(event) => setConfirmationPhrase(event.target.value)}
                placeholder={status?.confirmationPhrase ?? "Я подтверждаю тестовую отправку в один канал"}
                className="h-10 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
              />
              <button
                type="button"
                onClick={confirmTest}
                disabled
                className="inline-flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-900/70 px-4 text-sm font-semibold text-slate-500"
              >
                <Send className="h-4 w-4" />
                Подтвердить тестовую отправку
              </button>
              <button
                type="button"
                onClick={sendRealTest}
                disabled={Boolean(busy) || Boolean(status?.dryRun ?? true) || !(status?.realSendingEnabled ?? false)}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-rose-300/30 bg-rose-300/10 px-4 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/15 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900/70 disabled:text-slate-500"
              >
                <Send className="h-4 w-4" />
                {busy === "real" ? "Проверка..." : "Отправить 1 реальное тестовое сообщение"}
              </button>
              <div className="rounded-md border border-line bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">
                <p className="font-medium text-white">Safety checklist</p>
                <ul className="mt-2 space-y-1">
                  <li>selected channel: AI и технологии</li>
                  <li>maxMessagesPerTest=1</li>
                  <li>TELEGRAM_DRY_RUN=false</li>
                  <li>realSendingEnabled=true</li>
                  <li>manual confirmation phrase is required</li>
                </ul>
              </div>
              <p className="rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-xs leading-5 text-rose-100">
                {getConfirmationNotice(status)}
              </p>
              <p className="hidden">
                Массовая отправка отключена. Возможен только один канал после ручного подтверждения, но сейчас
                подтверждение отключено из-за TELEGRAM_DRY_RUN=true.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-200" />
              <h3 className="text-sm font-semibold text-white">Статус теста</h3>
            </div>
            <div className="mt-4 grid gap-2">
              <InfoRow label="selected channel" value={status?.selectedChannel.title ?? selectedChannel?.name ?? "n/a"} />
              <InfoRow label="chat_id" value={status?.selectedChannel.telegramChatId ?? selectedChannel?.telegramChatId ?? "n/a"} />
              <InfoRow label="testMode" value={status?.testMode ?? "locked"} />
              <InfoRow label="realSendingAllowed" value={String(status?.realSendingAllowed ?? false)} />
              <InfoRow label="lastTestAt" value={status?.lastTestAt ?? "none"} />
              <InfoRow label="lastRealTestSentAt" value={status?.lastRealTestSentAt ?? "none"} />
              <InfoRow label="repeatLock" value={String(status?.realTestLockedAfterSuccess ?? false)} />
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-200" />
              <h3 className="text-sm font-semibold text-white">Safety result</h3>
            </div>
            {prepareResult ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-md border border-slate-600 bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">
                  <p className="font-medium text-white">{prepareResult.status}</p>
                  <p className="mt-1">{prepareResult.reason}</p>
                  <p className="mt-1">telegramSent={String(prepareResult.telegramSent)}</p>
                </div>
                {prepareResult.safety?.checks.map((check) => (
                  <div key={check.key} className="flex items-start justify-between gap-3 rounded-md border border-line bg-slate-950/50 px-3 py-2 text-xs">
                    <span className="text-slate-400">{check.key}</span>
                    <span className={cn("max-w-[60%] text-right font-medium", check.ok ? "text-emerald-100" : "text-rose-100")}>
                      {check.message}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-md border border-line bg-slate-950/60 p-4 text-sm text-slate-400">
                Нажмите “Подготовить тест”, чтобы увидеть результат safety gate.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusTile({ label, value, tone }: { label: string; value: string; tone: "dry" | "warn" | "error" }) {
  return (
    <div className="rounded-md border border-line bg-slate-950/50 px-3 py-2 text-right">
      <p className={cn("font-semibold", tone === "dry" && "text-slate-200", tone === "warn" && "text-amber-100", tone === "error" && "text-rose-100")}>{value}</p>
      <p className="text-slate-500">{label}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-line bg-slate-950/50 px-3 py-2 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="max-w-[60%] break-all text-right font-medium text-slate-200">{value}</span>
    </div>
  );
}

function getConfirmationNotice(status: SingleTestStatus | null) {
  if (status?.dryRun) {
    return "Реальная отправка заблокирована: TELEGRAM_DRY_RUN=true. Массовая отправка отключена, доступен только один канал после ручного подтверждения.";
  }

  if (!status?.realSendingEnabled) {
    return "Реальная отправка заблокирована: TELEGRAM_REAL_SENDING_ENABLED=false. Массовая отправка отключена, доступен только один канал после ручного подтверждения.";
  }

  return "Режим single-channel test готов: выбран один канал, одно сообщение и требуется ручная фраза подтверждения.";
}
