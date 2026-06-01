"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, LockKeyhole, Rocket, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductionSendRequest } from "@/types";

interface EligibleDraft {
  id: string;
  channelId: string;
  channelTitle: string;
  telegramChatId: string;
  title: string;
  status: string;
  scheduledFor: string | null;
  contentPreview: string;
}

interface ProductionStatus {
  ok: boolean;
  mode: "dry-run";
  dryRun: boolean;
  realSendingEnabled: boolean;
  productionLocked: boolean;
  canSendReal: false;
  telegramSent: false;
  confirmationPhrase: string;
  realTelegramSends: 0;
  eligibleDrafts: EligibleDraft[];
  requests: ProductionSendRequest[];
  reason: string;
}

interface PrepareResponse {
  ok: boolean;
  mode: "dry-run";
  canSendReal: false;
  telegramSent: false;
  reason: string;
  request?: ProductionSendRequest;
}

export function ProductionSendPanel() {
  const [status, setStatus] = useState<ProductionStatus | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [confirmationPhrase, setConfirmationPhrase] = useState("");
  const [busy, setBusy] = useState<"prepare" | "confirm" | null>(null);
  const [message, setMessage] = useState("Реальная отправка невозможна, пока TELEGRAM_DRY_RUN=true.");

  const loadStatus = useCallback(async () => {
    const response = await fetch("/api/telegram/production-status", { cache: "no-store" });
    const payload = (await response.json()) as ProductionStatus;
    setStatus(payload);
    setSelectedDraftId((current) => current || payload.eligibleDrafts[0]?.id || "");
    setSelectedRequestId((current) => current || payload.requests[0]?.id || "");
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const selectedDraft = useMemo(
    () => status?.eligibleDrafts.find((draft) => draft.id === selectedDraftId),
    [selectedDraftId, status?.eligibleDrafts],
  );
  const selectedRequest = useMemo(
    () => status?.requests.find((request) => request.id === selectedRequestId) ?? status?.requests[0],
    [selectedRequestId, status?.requests],
  );

  async function prepareRealSend() {
    try {
      setBusy("prepare");
      const response = await fetch("/api/telegram/prepare-real-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: selectedDraftId }),
      });
      const payload = (await response.json()) as PrepareResponse;
      setMessage(payload.reason);
      if (payload.request) {
        setSelectedRequestId(payload.request.id);
      }
      await loadStatus();
    } finally {
      setBusy(null);
    }
  }

  async function confirmRealSend() {
    try {
      setBusy("confirm");
      const response = await fetch("/api/telegram/confirm-real-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequest?.id,
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

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-amber-300/25 bg-amber-300/5 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-amber-200">Production launch flow</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Боевой запуск</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Реальная отправка невозможна, пока TELEGRAM_DRY_RUN=true. Этот flow только готовит заявку,
              safety checks и ручное подтверждение для будущего запуска.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <StatusTile label="режим" value={status?.mode ?? "dry-run"} tone="dry" />
            <StatusTile label="Production" value={status?.productionLocked ? "locked" : "ready"} tone="warn" />
            <StatusTile label="Dry-run" value={status?.dryRun ? "active" : "off"} tone="dry" />
            <StatusTile label="Real sends" value={String(status?.realTelegramSends ?? 0)} tone="error" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-cyan-200" />
              <h3 className="text-sm font-semibold text-white">Подготовить отправку</h3>
            </div>
            <div className="mt-4 space-y-3">
              <select
                value={selectedDraftId}
                onChange={(event) => setSelectedDraftId(event.target.value)}
                className="h-10 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
              >
                {status?.eligibleDrafts.length ? (
                  status.eligibleDrafts.map((draft) => (
                    <option key={draft.id} value={draft.id}>
                      {draft.channelTitle} · {draft.status} · {draft.title}
                    </option>
                  ))
                ) : (
                  <option value="">Нет approved/scheduled drafts</option>
                )}
              </select>
              {selectedDraft ? (
                <div className="rounded-md border border-line bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">
                  <p className="font-medium text-white">{selectedDraft.title}</p>
                  <p className="mt-1 text-slate-500">{selectedDraft.channelTitle} · {selectedDraft.telegramChatId}</p>
                  <p className="mt-2 line-clamp-3">{selectedDraft.contentPreview}</p>
                </div>
              ) : (
                <div className="rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-xs text-amber-100">
                  Сначала одобрите или запланируйте черновик в очереди.
                </div>
              )}
              <button
                type="button"
                onClick={prepareRealSend}
                disabled={Boolean(busy) || !selectedDraftId}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShieldCheck className="h-4 w-4" />
                {busy === "prepare" ? "Подготовка..." : "Подготовить реальную отправку"}
              </button>
              <p className="rounded-md border border-line bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">{message}</p>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-rose-200" />
              <h3 className="text-sm font-semibold text-white">Подтверждение production</h3>
            </div>
            <div className="mt-4 space-y-3">
              <input
                value={confirmationPhrase}
                onChange={(event) => setConfirmationPhrase(event.target.value)}
                placeholder={status?.confirmationPhrase ?? "Я подтверждаю реальную отправку в Telegram"}
                className="h-10 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
              />
              <button
                type="button"
                onClick={confirmRealSend}
                disabled
                className="inline-flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-900/70 px-4 text-sm font-semibold text-slate-500"
              >
                <Rocket className="h-4 w-4" />
                Подтвердить реальную отправку
              </button>
              <p className="rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-xs leading-5 text-rose-100">
                Реальная отправка невозможна, пока TELEGRAM_DRY_RUN=true. Даже правильная фраза подтверждения сейчас
                не отправит сообщение.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-200" />
                <h3 className="text-sm font-semibold text-white">Production requests</h3>
              </div>
              <span className="rounded-full border border-slate-600 bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-300">
                {status?.requests.length ?? 0} requests
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {status?.requests.length ? (
                status.requests.map((request) => (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => setSelectedRequestId(request.id)}
                    className={cn(
                      "w-full rounded-lg border border-line bg-slate-950/50 p-4 text-left transition hover:border-cyan-300/30",
                      selectedRequest?.id === request.id && "border-cyan-300/50 bg-cyan-300/10",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="line-clamp-1 text-sm font-semibold text-white">{request.channelTitle}</p>
                        <p className="mt-1 text-xs text-slate-500">{request.id}</p>
                      </div>
                      <StatusPill status={request.status} />
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-400">{request.contentPreview}</p>
                  </button>
                ))
              ) : (
                <div className="rounded-md border border-line bg-slate-950/60 p-4 text-sm text-slate-400">
                  Production requests пока нет. Подготовьте заявку из approved/scheduled draft.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-200" />
              <h3 className="text-sm font-semibold text-white">Safety checks</h3>
            </div>
            <div className="mt-4 space-y-2">
              {selectedRequest?.safetyChecks.length ? (
                selectedRequest.safetyChecks.map((check) => (
                  <div key={check.key} className="flex items-start justify-between gap-3 rounded-md border border-line bg-slate-950/50 px-3 py-2 text-xs">
                    <span className="text-slate-400">{check.key}</span>
                    <span className={cn("max-w-[60%] text-right font-medium", check.ok ? "text-emerald-100" : "text-rose-100")}>
                      {check.message}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-md border border-line bg-slate-950/60 p-4 text-sm text-slate-400">
                  Safety checks появятся после подготовки заявки.
                </p>
              )}
            </div>
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

function StatusPill({ status }: { status: ProductionSendRequest["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        status === "blocked_by_dry_run" && "border-slate-500/40 bg-slate-500/10 text-slate-200",
        status === "waiting_confirmation" && "border-amber-300/30 bg-amber-300/10 text-amber-100",
        status === "approved_for_real_send" && "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
        status === "rejected" && "border-rose-300/30 bg-rose-300/10 text-rose-100",
        status === "sent_mock" && "border-blue-300/30 bg-blue-300/10 text-blue-100",
      )}
    >
      {status}
    </span>
  );
}
