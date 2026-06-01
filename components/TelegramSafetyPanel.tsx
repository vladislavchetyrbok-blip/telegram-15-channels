"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, LockKeyhole, ShieldCheck, Siren } from "lucide-react";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import { cn } from "@/lib/utils";

interface SafetyState {
  ok: boolean;
  mode: "dry-run" | "production_locked" | "production_ready";
  dryRun: boolean;
  realSendingEnabled: boolean;
  emergencyStop: boolean;
  maxMessagesPerRun: number;
  maxMessagesPerChannelPerDay: number;
  requireApprovedDraftOnly: boolean;
  requireScheduledOnly: boolean;
  requireManualConfirm: boolean;
  requireTelegramChatId: boolean;
  requireBotToken: boolean;
  productionLocked: boolean;
  telegramSent: false;
}

interface SafetyCheckState {
  ok: boolean;
  canSendReal: boolean;
  mode: string;
  dryRun: boolean;
  realSendingEnabled: boolean;
  reasons: string[];
  checks: Array<{
    key: string;
    ok: boolean;
    message: string;
  }>;
  telegramSent: false;
  productionLocked: boolean;
}

export function TelegramSafetyPanel() {
  const [state, setState] = useState<SafetyState | null>(null);
  const [check, setCheck] = useState<SafetyCheckState | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState(channelGenerationConfigs[0]?.id ?? "");
  const [draftId, setDraftId] = useState("");
  const [busy, setBusy] = useState<"check" | "stop" | null>(null);
  const [message, setMessage] = useState("Реальная отправка Telegram заблокирована. Активен dry-run.");

  const loadSafety = useCallback(async () => {
    const response = await fetch("/api/telegram/safety", { cache: "no-store" });
    const payload = (await response.json()) as SafetyState;
    setState(payload);
  }, []);

  useEffect(() => {
    void loadSafety();
  }, [loadSafety]);

  async function runSafetyCheck() {
    try {
      setBusy("check");
      const response = await fetch("/api/telegram/safety-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: selectedChannelId,
          draftId: draftId.trim() || undefined,
        }),
      });
      const payload = (await response.json()) as SafetyCheckState;
      setCheck(payload);
      setMessage(payload.canSendReal ? "Safety check passed, but UI still stays dry-run." : payload.reasons[0] ?? "Production is blocked.");
      await loadSafety();
    } finally {
      setBusy(null);
    }
  }

  async function mockEmergencyStop() {
    try {
      setBusy("stop");
      const response = await fetch("/api/telegram/emergency-stop", { method: "POST" });
      const payload = (await response.json()) as { message?: string };
      setMessage(payload.message ?? "Emergency stop mocked. Real sending remains disabled.");
      await loadSafety();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-rose-300/25 bg-rose-300/5 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-rose-200">Telegram safety gate</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Безопасность Telegram</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Реальная отправка Telegram заблокирована. Активен dry-run. Этот экран готовит будущий production
              gate, но не вызывает Telegram sendMessage.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <StatusTile label="режим" value={state?.mode ?? "dry-run"} tone="dry" />
            <StatusTile label="dryRun" value={String(state?.dryRun ?? true)} tone="dry" />
            <StatusTile label="real send" value={state?.realSendingEnabled ? "on" : "off"} tone="error" />
            <StatusTile label="production" value={state?.productionLocked ? "locked" : "ready"} tone="warn" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-cyan-200" />
              <h3 className="text-sm font-semibold text-white">Текущие ограничения</h3>
            </div>
            <div className="mt-4 grid gap-2">
              <RuleRow label="Emergency stop" value={String(state?.emergencyStop ?? false)} state="dry" />
              <RuleRow label="Manual confirm" value={String(state?.requireManualConfirm ?? true)} state="warn" />
              <RuleRow label="Approved draft only" value={String(state?.requireApprovedDraftOnly ?? true)} state="ok" />
              <RuleRow label="Scheduled only" value={String(state?.requireScheduledOnly ?? true)} state="ok" />
              <RuleRow label="Require chat_id" value={String(state?.requireTelegramChatId ?? true)} state="ok" />
              <RuleRow label="Require bot token" value={String(state?.requireBotToken ?? true)} state="ok" />
              <RuleRow label="Max messages / run" value={String(state?.maxMessagesPerRun ?? 1)} state="warn" />
              <RuleRow label="Max / channel / day" value={String(state?.maxMessagesPerChannelPerDay ?? 3)} state="warn" />
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-200" />
              <h3 className="text-sm font-semibold text-white">Проверка безопасности</h3>
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
              <input
                value={draftId}
                onChange={(event) => setDraftId(event.target.value)}
                placeholder="draftId optional"
                className="h-10 w-full rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={runSafetyCheck}
                  disabled={Boolean(busy)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {busy === "check" ? "Проверка..." : "Проверить безопасность"}
                </button>
                <button
                  type="button"
                  onClick={mockEmergencyStop}
                  disabled={Boolean(busy)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-rose-300/30 bg-rose-300/10 px-4 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Siren className="h-4 w-4" />
                  {busy === "stop" ? "Mock..." : "Emergency stop"}
                </button>
              </div>
              <p className="rounded-md border border-line bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">{message}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-200" />
              <h3 className="text-sm font-semibold text-white">Почему production заблокирован</h3>
            </div>
            <div className="mt-4 space-y-2">
              {(check?.reasons?.length ? check.reasons : ["Blocked by dry-run mode", "Real Telegram sending is disabled", "Manual confirmation token is required for production"]).map((reason) => (
                <div key={reason} className="rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
                  {reason}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-200" />
              <h3 className="text-sm font-semibold text-white">Safety checks</h3>
            </div>
            <div className="mt-4 space-y-2">
              {check?.checks?.length ? (
                check.checks.map((item) => (
                  <RuleRow key={item.key} label={item.key} value={item.message} state={item.ok ? "ok" : "error"} />
                ))
              ) : (
                <p className="rounded-md border border-line bg-slate-950/60 p-4 text-sm text-slate-400">
                  Нажмите “Проверить безопасность”, чтобы увидеть полный список safety gate проверок.
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

function RuleRow({ label, value, state }: { label: string; value: string; state: "ok" | "warn" | "error" | "dry" }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-line bg-slate-950/50 px-3 py-2 text-xs">
      <span className="text-slate-400">{label}</span>
      <span
        className={cn(
          "max-w-[60%] text-right font-medium",
          state === "ok" && "text-emerald-100",
          state === "warn" && "text-amber-100",
          state === "error" && "text-rose-100",
          state === "dry" && "text-slate-300",
        )}
      >
        {value}
      </span>
    </div>
  );
}
