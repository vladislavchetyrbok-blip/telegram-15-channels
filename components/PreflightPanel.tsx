"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreflightState {
  ok: boolean;
  mode: "dry-run";
  checkedAt: string;
  telegram: {
    tokenPresent: boolean;
    dryRun: boolean;
    realSendingEnabled: boolean;
    channelsTotal: number;
    channelsWithChatId: number;
    botAdded: number;
    realSendsTotal: number;
  };
  ai: {
    provider: string;
    connected: boolean;
    model: string;
    message: string;
  };
  content: {
    editorialProfiles: number;
    draftsStorageReady: boolean;
    draftsTotal: number;
    contentPlanReady: boolean;
    contentPlanItemsTotal: number;
    scheduleReady: boolean;
    scheduledTotal: number;
  };
  safety: {
    productionLocked: boolean;
    singleTestLocked: boolean;
    sendMessageBlockedByDryRun: boolean;
    massBroadcastDisabled: boolean;
    realSendingEnabled: boolean;
  };
  currency: {
    ok: boolean;
    forbiddenCurrencyFound: boolean;
    matchesCount: number;
  };
  currencyPolicy: {
    enabled: boolean;
    primaryCurrency: "UAH";
    forbiddenCurrencyFound: boolean;
    forbiddenCurrencyMentions: number;
    status: "ok" | "error";
  };
  visualPolicy: {
    enabled: boolean;
    forbiddenCurrencyVisualsFound: boolean;
    assetsNeedReview: number;
    status: "ok" | "needs_review" | "error";
  };
  logos: {
    totalChannels: number;
    uploadedLogos: number;
    approvedLogos: number;
    needsReview: number;
    rejected: number;
    missing: number;
    status: "ok" | "needs_review" | "error";
  };
  directSendAudit: {
    directSendMessageWithoutSafety: boolean;
    realTelegramApiCallFound: boolean;
    safetyValidationRequired: boolean;
    checkedEntryPoints: string[];
  };
  warnings: Array<{ code: string; message: string; severity: "warning" | "error" }>;
  blockers: Array<{ code: string; message: string; severity: "warning" | "error" }>;
  checks: Record<string, boolean>;
  nextStep: string;
}

export function PreflightPanel() {
  const [state, setState] = useState<PreflightState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Реальная отправка сейчас отключена.");

  const runPreflight = useCallback(async () => {
    try {
      setBusy(true);
      const response = await fetch("/api/system/preflight", { cache: "no-store" });
      const payload = (await response.json()) as PreflightState;
      setState(payload);
      setMessage(payload.ok ? "Preflight проверка пройдена. Production остаётся locked." : "Preflight нашёл предупреждения.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void runPreflight();
  }, [runPreflight]);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-cyan-300/25 bg-cyan-300/5 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">System readiness audit</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Preflight проверка</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Полная проверка перед возможным первым ручным тестом одного канала. Реальная отправка сейчас отключена.
            </p>
          </div>
          <button
            type="button"
            onClick={runPreflight}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} />
            {busy ? "Проверка..." : "Запустить полный preflight"}
          </button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="space-y-4">
          <StatusCard
            title="Общий статус"
            icon={state?.ok ? CheckCircle2 : AlertTriangle}
            rows={[
              ["System", state?.ok ? "OK" : "Warning", state?.ok ? "ok" : "warn"],
              ["Mode", state?.mode ?? "dry-run", "dry"],
              ["Checked at", state?.checkedAt ?? "not checked", "dry"],
              ["Next step", state?.nextStep ?? "Run preflight", "dry"],
            ]}
          />
          <StatusCard
            title="Telegram"
            icon={ShieldCheck}
            rows={[
              ["Token", state?.telegram.tokenPresent ? "OK" : "Error", state?.telegram.tokenPresent ? "ok" : "error"],
              ["Dry-run", String(state?.telegram.dryRun ?? true), "dry"],
              ["Real sending", state?.telegram.realSendingEnabled ? "enabled" : "blocked", state?.telegram.realSendingEnabled ? "error" : "locked"],
              ["Channels", `${state?.telegram.channelsWithChatId ?? 0}/${state?.telegram.channelsTotal ?? 15}`, (state?.telegram.channelsWithChatId ?? 0) === 15 ? "ok" : "error"],
              ["Real sends total", String(state?.telegram.realSendsTotal ?? 0), "dry"],
            ]}
          />
          <StatusCard
            title="Каналы"
            icon={ShieldCheck}
            rows={[
              ["Total", `${state?.telegram.channelsTotal ?? 0}/15`, (state?.telegram.channelsTotal ?? 0) === 15 ? "ok" : "error"],
              ["chat_id filled", `${state?.telegram.channelsWithChatId ?? 0}/15`, (state?.telegram.channelsWithChatId ?? 0) === 15 ? "ok" : "error"],
              ["botAdded", `${state?.telegram.botAdded ?? 0}/15`, (state?.telegram.botAdded ?? 0) === 15 ? "ok" : "error"],
            ]}
          />
          <StatusCard
            title="LM Studio"
            icon={CheckCircle2}
            rows={[
              ["Provider", state?.ai.provider ?? "lmstudio", state?.ai.provider === "lmstudio" ? "ok" : "warn"],
              ["Connection", state?.ai.connected ? "OK" : "Warning", state?.ai.connected ? "ok" : "warn"],
              ["Model", state?.ai.model ?? "unknown", "dry"],
            ]}
          />
        </div>

        <div className="space-y-4">
          <StatusCard
            title="Контент и расписание"
            icon={CheckCircle2}
            rows={[
              ["Editorial profiles", `${state?.content.editorialProfiles ?? 0}/15`, (state?.content.editorialProfiles ?? 0) === 15 ? "ok" : "error"],
              ["Drafts storage", state?.content.draftsStorageReady ? "OK" : "Error", state?.content.draftsStorageReady ? "ok" : "error"],
              ["Drafts total", String(state?.content.draftsTotal ?? 0), "dry"],
              ["Content plan", state?.content.contentPlanReady ? "OK" : "Error", state?.content.contentPlanReady ? "ok" : "error"],
              ["Schedule", state?.content.scheduleReady ? "OK" : "Error", state?.content.scheduleReady ? "ok" : "error"],
            ]}
          />
          <StatusCard
            title="Безопасность"
            icon={LockKeyhole}
            rows={[
              ["Production", state?.safety.productionLocked ? "Locked" : "Warning", state?.safety.productionLocked ? "locked" : "warn"],
              ["Single-channel test", state?.safety.singleTestLocked ? "Locked" : "Warning", state?.safety.singleTestLocked ? "locked" : "warn"],
              ["sendMessage", state?.safety.sendMessageBlockedByDryRun ? "Blocked by dry-run" : "Warning", state?.safety.sendMessageBlockedByDryRun ? "dry" : "warn"],
              ["Mass broadcast", state?.safety.massBroadcastDisabled ? "Disabled" : "Error", state?.safety.massBroadcastDisabled ? "locked" : "error"],
            ]}
          />
          <StatusCard
            title="Currency audit"
            icon={state?.currency.ok ? CheckCircle2 : AlertTriangle}
            rows={[
              ["Forbidden currencies", state?.currency.forbiddenCurrencyFound ? "found" : "not found", state?.currency.ok ? "ok" : "error"],
              ["Matches", String(state?.currency.matchesCount ?? 0), state?.currency.ok ? "ok" : "error"],
              ["Status", state?.currency.ok ? "OK" : "Error", state?.currency.ok ? "ok" : "error"],
            ]}
          />
          <StatusCard
            title="Валютная политика"
            icon={state?.currencyPolicy.status === "ok" ? ShieldCheck : AlertTriangle}
            rows={[
              ["Основная валюта", "\u20b4 / UAH", "ok"],
              ["Разрешены", "UAH, USD, EUR", "ok"],
              ["Запрещены", buildForbiddenCurrencyLabel(), state?.currencyPolicy.status === "ok" ? "locked" : "error"],
              ["Совпадения", String(state?.currencyPolicy.forbiddenCurrencyMentions ?? 0), state?.currencyPolicy.status === "ok" ? "ok" : "error"],
              ["Статус", state?.currencyPolicy.status === "ok" ? "OK" : "Error", state?.currencyPolicy.status === "ok" ? "ok" : "error"],
            ]}
          />
          <StatusCard
            title="Visual asset policy"
            icon={state?.visualPolicy.status === "error" ? AlertTriangle : ShieldCheck}
            rows={[
              ["Policy", state?.visualPolicy.enabled ? "enabled" : "disabled", state?.visualPolicy.enabled ? "ok" : "error"],
              ["Forbidden visuals", state?.visualPolicy.forbiddenCurrencyVisualsFound ? "found" : "not found", state?.visualPolicy.forbiddenCurrencyVisualsFound ? "error" : "ok"],
              ["Needs review", String(state?.visualPolicy.assetsNeedReview ?? 0), (state?.visualPolicy.assetsNeedReview ?? 0) > 0 ? "warn" : "ok"],
              ["Status", state?.visualPolicy.status ?? "ok", state?.visualPolicy.status === "error" ? "error" : "ok"],
            ]}
          />
          <StatusCard
            title="Channel logos"
            icon={state?.logos.status === "error" ? AlertTriangle : ShieldCheck}
            rows={[
              ["Uploaded", `${state?.logos.uploadedLogos ?? 0}/${state?.logos.totalChannels ?? 15}`, (state?.logos.uploadedLogos ?? 0) === 15 ? "ok" : "warn"],
              ["Approved", String(state?.logos.approvedLogos ?? 0), (state?.logos.approvedLogos ?? 0) > 0 ? "ok" : "dry"],
              ["Needs review", String(state?.logos.needsReview ?? 0), (state?.logos.needsReview ?? 0) > 0 ? "warn" : "ok"],
              ["Rejected", String(state?.logos.rejected ?? 0), (state?.logos.rejected ?? 0) > 0 ? "error" : "ok"],
              ["Missing", String(state?.logos.missing ?? 15), (state?.logos.missing ?? 0) > 0 ? "warn" : "ok"],
            ]}
          />
          <StatusCard
            title="Production lock"
            icon={LockKeyhole}
            rows={[
              ["Production flow", state?.safety.productionLocked ? "locked" : "issue", state?.safety.productionLocked ? "locked" : "error"],
              ["Direct send audit", state?.directSendAudit.directSendMessageWithoutSafety ? "issue" : "guarded", state?.directSendAudit.directSendMessageWithoutSafety ? "error" : "ok"],
              ["Safety validation", state?.directSendAudit.safetyValidationRequired ? "required" : "missing", state?.directSendAudit.safetyValidationRequired ? "ok" : "error"],
            ]}
          />
          <StatusCard
            title="Single-channel test lock"
            icon={LockKeyhole}
            rows={[
              ["Single-channel test", state?.safety.singleTestLocked ? "locked by dry-run" : "issue", state?.safety.singleTestLocked ? "locked" : "error"],
              ["Real sending", state?.safety.realSendingEnabled ? "enabled" : "false", state?.safety.realSendingEnabled ? "error" : "locked"],
              ["Mass send", state?.safety.massBroadcastDisabled ? "disabled" : "issue", state?.safety.massBroadcastDisabled ? "locked" : "error"],
            ]}
          />
          <StatusCard
            title="Warnings"
            icon={(state?.blockers.length ?? 0) > 0 ? AlertTriangle : CheckCircle2}
            rows={buildWarningRows(state)}
          />
        </div>
      </section>

      <p className="rounded-lg border border-rose-300/25 bg-rose-300/10 p-4 text-sm text-rose-100">{message}</p>
    </div>
  );
}

function StatusCard({
  title,
  icon: Icon,
  rows,
}: {
  title: string;
  icon: typeof CheckCircle2;
  rows: Array<[string, string, "ok" | "warn" | "error" | "locked" | "dry"]>;
}) {
  return (
    <div className="rounded-lg border border-line bg-panel/70 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-cyan-200" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="mt-4 space-y-2">
        {rows.map(([label, value, status]) => (
          <div key={label} className="flex items-start justify-between gap-3 rounded-md border border-line bg-slate-950/50 px-3 py-2 text-xs">
            <span className="text-slate-400">{label}</span>
            <span className={cn("max-w-[62%] text-right font-medium", getStatusClass(status))}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getStatusClass(status: "ok" | "warn" | "error" | "locked" | "dry") {
  return cn(
    status === "ok" && "text-emerald-100",
    status === "warn" && "text-amber-100",
    status === "error" && "text-rose-100",
    status === "locked" && "text-slate-300",
    status === "dry" && "text-cyan-100",
  );
}

function buildWarningRows(state: PreflightState | null): Array<[string, string, "ok" | "warn" | "error" | "locked" | "dry"]> {
  if (!state) {
    return [["Status", "Run preflight", "dry"]];
  }

  if (state.warnings.length === 0) {
    return [["Status", "No warnings", "ok"]];
  }

  return state.warnings.slice(0, 6).map((warning) => [
    warning.code,
    warning.message,
    warning.severity === "error" ? "error" : "warn",
  ]);
}

function buildForbiddenCurrencyLabel() {
  return "blocked currency code, symbol, and words";
}
