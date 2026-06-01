"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, LockKeyhole, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import { cn } from "@/lib/utils";

type ControlAction = "text" | "safety" | "send";

interface ControlStatus {
  ok: boolean;
  mode: "dry-run";
  readyForDryRunTest: boolean;
  readyForRealSingleTest: false;
  dryRun: boolean;
  realSendingEnabled: boolean;
  telegramSent: false;
  realSendsTotal: 0;
  blockers: string[];
  warnings: string[];
  defaults: {
    channelId: string;
    text: string;
  };
}

interface ControlResult {
  ok: boolean;
  mode: "dry-run";
  telegramSent: false;
  channelTitle?: string;
  telegramChatId?: string;
  textPreview?: string;
  textValid?: boolean;
  currencyPolicyOk?: boolean;
  editorialPolicyOk?: boolean;
  safetyOk?: boolean;
  canSendReal?: false;
  message?: string;
  reasons?: string[];
  safety?: {
    reason: string;
    reasons: string[];
    checks: Array<{
      key: string;
      ok: boolean;
      message: string;
    }>;
  };
}

export function TelegramControlTestPanel() {
  const fallbackChannel = channelGenerationConfigs.find((channel) => channel.id === "ukraine-market") ?? channelGenerationConfigs[0];
  const fallbackText =
    "Тестова публікація. Перевірка системи. Реальна відправка зараз вимкнена.";
  const [selectedChannelId, setSelectedChannelId] = useState(fallbackChannel?.id ?? "");
  const [text, setText] = useState(fallbackText);
  const [status, setStatus] = useState<ControlStatus | null>(null);
  const [result, setResult] = useState<ControlResult | null>(null);
  const [busy, setBusy] = useState<ControlAction | "status" | null>(null);
  const forbiddenLabel = useMemo(() => buildForbiddenCurrencyLabel(), []);

  const selectedChannel = useMemo(
    () => channelGenerationConfigs.find((channel) => channel.id === selectedChannelId) ?? fallbackChannel,
    [fallbackChannel, selectedChannelId],
  );

  const loadStatus = useCallback(async () => {
    try {
      setBusy("status");
      const response = await fetch("/api/telegram/control-test/status", { cache: "no-store" });
      const payload = (await response.json()) as ControlStatus;
      setStatus(payload);
      setSelectedChannelId((current) => current || payload.defaults.channelId);
      setText((current) => current || payload.defaults.text);
    } finally {
      setBusy(null);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  async function validate(action: ControlAction) {
    try {
      setBusy(action);
      const endpoint =
        action === "send" ? "/api/telegram/control-test/dry-run-send" : "/api/telegram/control-test/validate";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: selectedChannelId,
          text,
        }),
      });
      const payload = (await response.json()) as ControlResult;
      setResult(payload);
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
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Manual control scenario</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Контрольный тест Telegram</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Один выбранный канал, одно сообщение, ручная проверка. Реальная отправка заблокирована:
              активен dry-run, массовая отправка и production autoposting не используются.
            </p>
          </div>
          <button
            type="button"
            onClick={loadStatus}
            disabled={Boolean(busy)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-slate-950 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", busy === "status" && "animate-spin")} />
            Обновить статус
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <StatusTile label="TELEGRAM_DRY_RUN" value={String(status?.dryRun ?? true)} tone="dry" />
          <StatusTile label="realSendingEnabled" value={String(status?.realSendingEnabled ?? false)} tone="locked" />
          <StatusTile label="telegramSent" value="false" tone="dry" />
          <StatusTile label="real sends total" value={String(status?.realSendsTotal ?? 0)} tone="locked" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-cyan-200" />
              <h3 className="text-sm font-semibold text-white">Сообщение для проверки</h3>
            </div>
            <div className="mt-4 space-y-3">
              <select
                value={selectedChannelId}
                onChange={(event) => setSelectedChannelId(event.target.value)}
                className="h-10 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
              >
                {channelGenerationConfigs.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>

              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={6}
                className="w-full resize-none rounded-md border border-line bg-slate-950 px-3 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
              />

              <p className="rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
                {forbiddenLabel} запрещены. Перед dry-run проверяются CurrencyPolicy, редакционный профиль
                канала и Telegram safety gate.
              </p>

              <div className="grid gap-2 sm:grid-cols-3">
                <ActionButton
                  label="Проверить текст"
                  icon={CheckCircle2}
                  busy={busy === "text"}
                  onClick={() => validate("text")}
                />
                <ActionButton
                  label="Проверить безопасность"
                  icon={ShieldCheck}
                  busy={busy === "safety"}
                  onClick={() => validate("safety")}
                />
                <ActionButton
                  label="Dry-run отправить"
                  icon={Send}
                  busy={busy === "send"}
                  onClick={() => validate("send")}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-slate-300" />
              <h3 className="text-sm font-semibold text-white">Границы сценария</h3>
            </div>
            <div className="mt-4 grid gap-2">
              <InfoRow label="selected channel" value={selectedChannel?.name ?? "n/a"} />
              <InfoRow label="telegramChatId" value={selectedChannel?.telegramChatId ?? "missing"} />
              <InfoRow label="mass broadcast" value="disabled" />
              <InfoRow label="production autoposting" value="not used" />
              <InfoRow label="max messages" value="1" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-200" />
              <h3 className="text-sm font-semibold text-white">Готовность</h3>
            </div>
            <div className="mt-4 grid gap-2">
              <InfoRow label="readyForDryRunTest" value={String(status?.readyForDryRunTest ?? false)} />
              <InfoRow label="readyForRealSingleTest" value={String(status?.readyForRealSingleTest ?? false)} />
              <InfoRow label="blockers" value={status?.blockers.length ? status.blockers.join(", ") : "none"} />
              <InfoRow label="warnings" value={status?.warnings.join(", ") ?? "none"} />
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-200" />
              <h3 className="text-sm font-semibold text-white">Результат</h3>
            </div>
            {result ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-md border border-line bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">
                  <p className={cn("font-semibold", result.ok ? "text-emerald-100" : "text-amber-100")}>
                    {result.ok ? "OK" : "Needs attention"}
                  </p>
                  <p className="mt-1">mode={result.mode}</p>
                  <p>telegramSent={String(result.telegramSent)}</p>
                  <p>canSendReal={String(result.canSendReal ?? false)}</p>
                  {result.message ? <p className="mt-1">{result.message}</p> : null}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <CheckRow label="textValid" ok={Boolean(result.textValid)} />
                  <CheckRow label="currencyPolicyOk" ok={Boolean(result.currencyPolicyOk)} />
                  <CheckRow label="editorialPolicyOk" ok={Boolean(result.editorialPolicyOk)} />
                  <CheckRow label="safetyOk" ok={Boolean(result.safetyOk)} />
                </div>

                {result.reasons?.length ? (
                  <div className="rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
                    {result.reasons.join(" ")}
                  </div>
                ) : null}

                <div className="rounded-md border border-line bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">
                  <p className="font-medium text-white">{result.channelTitle}</p>
                  <p className="break-all text-slate-500">{result.telegramChatId}</p>
                  <p className="mt-2 whitespace-pre-wrap">{result.textPreview}</p>
                </div>

                {result.safety?.checks.map((check) => (
                  <div
                    key={check.key}
                    className="flex items-start justify-between gap-3 rounded-md border border-line bg-slate-950/50 px-3 py-2 text-xs"
                  >
                    <span className="text-slate-400">{check.key}</span>
                    <span className={cn("max-w-[60%] text-right font-medium", check.ok ? "text-emerald-100" : "text-rose-100")}>
                      {check.message}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-md border border-line bg-slate-950/60 p-4 text-sm text-slate-400">
                Запустите проверку текста, safety или dry-run отправку.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusTile({ label, value, tone }: { label: string; value: string; tone: "dry" | "locked" }) {
  return (
    <div className="rounded-md border border-line bg-slate-950/50 px-3 py-2">
      <p className={cn("text-lg font-semibold", tone === "dry" ? "text-cyan-100" : "text-slate-300")}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function ActionButton({
  label,
  icon: Icon,
  busy,
  onClick,
}: {
  label: string;
  icon: typeof CheckCircle2;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Icon className={cn("h-4 w-4", busy && "animate-pulse")} />
      {busy ? "Проверка..." : label}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-line bg-slate-950/50 px-3 py-2 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="max-w-[62%] break-all text-right font-medium text-slate-200">{value}</span>
    </div>
  );
}

function CheckRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-line bg-slate-950/50 px-3 py-2 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className={ok ? "text-emerald-100" : "text-rose-100"}>{ok ? "OK" : "Fail"}</span>
    </div>
  );
}

function buildForbiddenCurrencyLabel() {
  return "Запрещённая валюта, её код и символ";
}
