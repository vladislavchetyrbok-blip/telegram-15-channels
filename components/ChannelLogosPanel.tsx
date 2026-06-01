"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ImageUp, RefreshCw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChannelLogo, ChannelLogoStatus } from "@/types";

interface ChannelLogoAuditState {
  ok: boolean;
  mode: "dry-run";
  telegramSent: false;
  forbiddenCurrencyVisualsFound: boolean;
  totalChannels: number;
  uploadedLogos: number;
  approvedLogos: number;
  needsReview: number;
  rejected: number;
  missing: number;
  customLogosUploaded: number;
  customLogosApproved: number;
  generatedLogosUsed: number;
  brokenPaths: number;
  telegramAvatars: {
    totalChannels: number;
    manualConfigured: number;
    unknown: number;
    notConfigured: number;
    states: Array<{
      channelId: string;
      status: "manual_configured" | "unknown" | "not_configured";
      label: string;
      updatedAt: string;
    }>;
  };
  status: "ok" | "needs_review" | "error";
  logos: ChannelLogo[];
}

export function ChannelLogosPanel() {
  const [state, setState] = useState<ChannelLogoAuditState | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyLogo, setBusyLogo] = useState<string | null>(null);
  const [message, setMessage] = useState("Реестр логотипов готов. Telegram остаётся в dry-run режиме.");
  const [showProblemsOnly, setShowProblemsOnly] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);
  const forbiddenLabel = useMemo(() => buildForbiddenLogoLabel(), []);

  const loadAudit = useCallback(async () => {
    try {
      setBusy(true);
      const response = await fetch("/api/channel-logos/audit", { cache: "no-store" });
      const payload = (await response.json()) as ChannelLogoAuditState;
      setState(payload);
      setMessage(
        payload.rejected > 0
          ? "Есть отклонённые логотипы, их нельзя использовать."
          : payload.approvedLogos === payload.totalChannels
            ? "Все логотипы одобрены. Статус файлов пересчитан."
            : "Audit завершён. Missing означает, что для канала нет рабочего файла в проверяемом пути.",
      );
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void loadAudit();
  }, [loadAudit]);

  async function uploadLogo(channelId: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setBusyLogo(`upload-${channelId}`);
      const formData = new FormData();
      formData.set("channelId", channelId);
      formData.set("file", file);

      const response = await fetch("/api/channel-logos/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      setMessage(payload.ok ? "Логотип загружен. Нужна ручная проверка." : payload.error);
      await loadAudit();
    } finally {
      setBusyLogo(null);
      event.target.value = "";
    }
  }

  async function updateLogo(id: string, action: "approve" | "reject" | "needs-review") {
    try {
      setBusyLogo(`${action}-${id}`);
      const response = await fetch(`/api/channel-logos/${id}/${action}`, {
        method: "POST",
        headers: action === "reject" ? { "Content-Type": "application/json" } : undefined,
        body: action === "reject" ? JSON.stringify({ notes: "Логотип отклонён вручную." }) : undefined,
      });
      const payload = await response.json();
      setMessage(payload.ok ? `Статус логотипа сохранён: ${action}.` : payload.error);
      await loadAudit();
    } finally {
      setBusyLogo(null);
    }
  }

  async function deleteCustomLogo(channelId: string) {
    try {
      setBusyLogo(`delete-${channelId}`);
      const response = await fetch(`/api/channels/${channelId}/upload-logo`, { method: "DELETE" });
      const payload = await response.json();
      setMessage(payload.ok ? "Мой логотип удалён. Канал вернулся на сгенерированный логотип." : payload.error);
      await loadAudit();
    } finally {
      setBusyLogo(null);
    }
  }

  async function markTelegramAvatarConfigured(channelId: string) {
    try {
      setBusyLogo(`avatar-${channelId}`);
      const response = await fetch(`/api/channels/${channelId}/telegram-avatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "manual_configured" }),
      });
      const payload = await response.json();
      setMessage(payload.ok ? "Telegram-логотип отмечен как настроенный вручную." : payload.error);
      await loadAudit();
    } finally {
      setBusyLogo(null);
    }
  }

  async function regenerateSafeLogos() {
    try {
      setBusy(true);
      const response = await fetch("/api/channel-logos/regenerate-safe", { method: "POST" });
      const payload = await response.json();
      setMessage(
        payload.regenerated?.length
          ? `Пересобрано записей: ${payload.regenerated.length}.`
          : "Небезопасных записей для пересборки нет.",
      );
      await loadAudit();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-cyan-300/25 bg-cyan-300/5 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Контроль логотипов</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Логотипы каналов</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Загружайте мой логотип для конкретного канала. Если источник custom, проверяется файл в
              <span className="mx-1 font-mono text-cyan-100">public/assets/custom-logos</span>.
              {forbiddenLabel} запрещены в логотипах, preview и мокапах.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadAudit}
              disabled={busy}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} />
              {busy ? "Проверка..." : "Проверить все логотипы"}
            </button>
            <button
              type="button"
              onClick={loadAudit}
              disabled={busy}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-slate-950 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} />
              Перепроверить пути
            </button>
            <button
              type="button"
              onClick={() => setShowProblemsOnly((value) => !value)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-amber-300/30 bg-amber-300/10 px-4 text-sm font-semibold text-amber-100 transition hover:border-amber-200"
            >
              {showProblemsOnly ? "Показать все" : "Показать проблемные"}
            </button>
            <button
              type="button"
              onClick={() => setShowTechnical((value) => !value)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-500/30 bg-slate-950 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40"
            >
              {showTechnical ? "Скрыть технические данные" : "Показать технические данные"}
            </button>
            <button
              type="button"
              onClick={regenerateSafeLogos}
              disabled={busy}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-slate-950 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} />
              Пересобрать безопасно
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Counter label="Всего каналов" value={state?.totalChannels ?? 15} tone="dry" />
        <Counter label="Custom uploaded" value={state?.customLogosUploaded ?? 0} tone="dry" />
        <Counter label="Custom approved" value={state?.customLogosApproved ?? 0} tone="ok" />
        <Counter label="Generated used" value={state?.generatedLogosUsed ?? 15} tone="dry" />
        <Counter label="Missing" value={state?.missing ?? 15} tone="warn" />
        <Counter label="Broken paths" value={state?.brokenPaths ?? 0} tone={(state?.brokenPaths ?? 0) ? "error" : "ok"} />
        <Counter label="Pending review" value={state?.needsReview ?? 0} tone="warn" />
        <Counter label="Rejected" value={state?.rejected ?? 0} tone="error" />
        <Counter label="Telegram manual" value={state?.telegramAvatars.manualConfigured ?? 15} tone="ok" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {(state?.logos ?? [])
          .filter((logo) => !showProblemsOnly || logo.status === "missing" || logo.status === "rejected" || logo.status === "needs_review" || logo.fileExists === false)
          .map((logo) => {
          const source = logo.source ?? (logo.publicUrl.startsWith("/assets/custom-logos/") ? "custom" : "generated");
          const fileStatus = logo.fileStatus ?? (logo.status === "missing" ? "missing" : "logo OK");
          const fileExists = logo.fileExists ?? logo.status !== "missing";
          const browserUrl = logo.browserUrl ?? logo.publicUrl;
          const fileSystemPath = logo.fileSystemPath ?? logo.filePath;
          const logoFile = browserUrl.split("/").pop() ?? "logo";
          const sourceLabel = source === "custom" ? "Мой логотип" : "Сгенерированный логотип";
          const policyLabel = logo.visualPolicyOk ? "OK" : "требуется проверка";
          const telegramAvatar = state?.telegramAvatars.states.find((item) => item.channelId === logo.channelId);

          return (
            <article key={logo.id} className="rounded-lg border border-line bg-panel/70 p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-slate-950/70">
                  {fileExists ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={browserUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageUp className="h-7 w-7 text-slate-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={logo.status} ok={logo.visualPolicyOk} />
                    <span className="rounded border border-slate-500/20 bg-slate-500/10 px-2 py-1 text-[11px] text-slate-300">
                      Источник: {sourceLabel}
                    </span>
                    <span className={cn("rounded border px-2 py-1 text-[11px]", fileExists ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-rose-300/30 bg-rose-300/10 text-rose-100")}>
                      Статус файла: {fileStatus}
                    </span>
                    <span className="rounded border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-[11px] text-emerald-100">
                      Telegram: {telegramAvatar?.label ?? "Настроен вручную в Telegram"}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-white">{logo.channelTitle}</h3>
                  <p className="mt-1 break-all text-xs text-slate-500">{sourceLabel}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-xs">
                <InfoRow label="Файл логотипа" value={logoFile} />
                <InfoRow label="Путь" value={browserUrl} danger={!fileExists} />
                <InfoRow label="Источник" value={sourceLabel} />
                <InfoRow label="Telegram-логотип" value={telegramAvatar?.label ?? "Настроен вручную в Telegram"} />
                <InfoRow label="Статус файла" value={fileStatus} danger={!fileExists} />
                <InfoRow label="Статус одобрения" value={formatApprovalStatus(logo.status)} danger={logo.status === "missing" || logo.status === "rejected"} />
                <InfoRow label="Проверка визуальной политики" value={policyLabel} danger={!logo.visualPolicyOk} />
                {showTechnical ? (
                  <>
                    <InfoRow label="Проверяемый путь на диске" value={fileSystemPath} danger={!fileExists} />
                    <InfoRow label="Файл существует" value={fileExists ? "yes" : "no"} danger={!fileExists} />
                    <InfoRow label="channelId" value={logo.channelId} />
                  </>
                ) : null}
              </div>

              <p className="mt-3 rounded-md border border-line bg-slate-950/50 p-3 text-xs leading-5 text-slate-400">
                {logo.notes}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200">
                  <ImageUp className="h-3.5 w-3.5" />
                  Загрузить логотип
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(event) => uploadLogo(logo.channelId, event)}
                    disabled={busyLogo === `upload-${logo.channelId}`}
                  />
                </label>
                <ActionButton
                  label="Одобрить"
                  icon={CheckCircle2}
                  busy={busyLogo === `approve-${logo.id}`}
                  onClick={() => updateLogo(logo.id, "approve")}
                />
                <ActionButton
                  label="Отклонить"
                  icon={XCircle}
                  busy={busyLogo === `reject-${logo.id}`}
                  onClick={() => updateLogo(logo.id, "reject")}
                />
                <ActionButton
                  label="Требует проверки"
                  icon={AlertTriangle}
                  busy={busyLogo === `needs-review-${logo.id}`}
                  onClick={() => updateLogo(logo.id, "needs-review")}
                />
                <ActionButton
                  label="Удалить мой логотип"
                  icon={XCircle}
                  busy={busyLogo === `delete-${logo.channelId}`}
                  onClick={() => deleteCustomLogo(logo.channelId)}
                />
                <ActionButton
                  label="Отметить как загружено в Telegram"
                  icon={CheckCircle2}
                  busy={busyLogo === `avatar-${logo.channelId}`}
                  onClick={() => markTelegramAvatarConfigured(logo.channelId)}
                />
              </div>
            </article>
          );
        })}
      </section>

      <p className="rounded-lg border border-line bg-slate-950/60 p-4 text-sm text-slate-300">{message}</p>
    </div>
  );
}

function Counter({ label, value, tone }: { label: string; value: number; tone: "ok" | "warn" | "error" | "dry" }) {
  return (
    <div className="rounded-lg border border-line bg-panel/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={cn("mt-2 text-2xl font-semibold", getToneClass(tone))}>{value}</p>
    </div>
  );
}

function StatusPill({ status, ok }: { status: ChannelLogoStatus; ok: boolean }) {
  const tone = status === "approved" && ok ? "ok" : status === "rejected" ? "error" : "warn";

  return (
    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", getPillClass(tone))}>
      {status} · visual policy {ok ? "OK" : "review"}
    </span>
  );
}

function formatApprovalStatus(status: ChannelLogoStatus) {
  if (status === "needs_review" || status === "uploaded") {
    return "pending review";
  }

  return status;
}

function InfoRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-line bg-slate-950/50 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className={cn("max-w-[70%] break-all text-right font-medium", danger ? "text-rose-100" : "text-slate-200")}>{value}</span>
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
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-slate-900 px-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Icon className={cn("h-3.5 w-3.5", busy && "animate-pulse")} />
      {busy ? "Сохранение..." : label}
    </button>
  );
}

function getToneClass(tone: "ok" | "warn" | "error" | "dry") {
  return cn(
    tone === "ok" && "text-emerald-100",
    tone === "warn" && "text-amber-100",
    tone === "error" && "text-rose-100",
    tone === "dry" && "text-cyan-100",
  );
}

function getPillClass(tone: "ok" | "warn" | "error") {
  return cn(
    tone === "ok" && "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
    tone === "warn" && "border-amber-300/30 bg-amber-300/10 text-amber-100",
    tone === "error" && "border-rose-300/30 bg-rose-300/10 text-rose-100",
  );
}

function buildForbiddenLogoLabel() {
  return "Запрещённая валюта, её код и символ";
}
