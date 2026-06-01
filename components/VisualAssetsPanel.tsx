"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, Eye, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChannelVisualAsset, ChannelVisualAssetStatus } from "@/types";

interface VisualAssetAuditState {
  ok: boolean;
  mode: "dry-run";
  telegramSent: false;
  totalAssets: number;
  approvedAssets: number;
  needsReview: number;
  rejectedAssets: number;
  forbiddenCurrencyVisualsFound: boolean;
  assets: ChannelVisualAsset[];
}

export function VisualAssetsPanel() {
  const [state, setState] = useState<VisualAssetAuditState | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyAsset, setBusyAsset] = useState<string | null>(null);
  const [message, setMessage] = useState("Visual audit is ready. Telegram dry-run remains active.");

  const financeWarning = useMemo(() => buildForbiddenVisualLabel(), []);

  const loadAudit = useCallback(async () => {
    try {
      setBusy(true);
      const response = await fetch("/api/assets/audit", { cache: "no-store" });
      const payload = (await response.json()) as VisualAssetAuditState;
      setState(payload);
      setMessage(
        payload.forbiddenCurrencyVisualsFound
          ? "Visual audit found rejected or unsafe assets. Telegram was not touched."
          : "Visual audit complete. Manual review is still required for generated assets.",
      );
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void loadAudit();
  }, [loadAudit]);

  async function updateAsset(id: string, action: "approve" | "reject" | "needs-review") {
    try {
      setBusyAsset(`${action}-${id}`);
      const response = await fetch(`/api/assets/${id}/${action}`, { method: "POST" });
      const payload = await response.json();
      setMessage(payload.ok ? `Asset ${action} saved in dry-run registry.` : payload.error ?? "Asset update failed.");
      await loadAudit();
    } finally {
      setBusyAsset(null);
    }
  }

  async function regenerateSafeAssets() {
    try {
      setBusy(true);
      const response = await fetch("/api/assets/regenerate-safe", { method: "POST" });
      const payload = await response.json();
      setMessage(
        payload.regenerated?.length
          ? `Regenerated ${payload.regenerated.length} unsafe visual assets with UAH/USD/EUR policy.`
          : "No unsafe visual assets needed regeneration.",
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
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Visual policy audit</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Визуалы каналов</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Логотипы, иконки и превью проверяются отдельно от текста. {financeWarning} запрещены в любых
              визуалах, карточках и мокапах. Telegram остаётся в dry-run режиме.
            </p>
          </div>
          <button
            type="button"
            onClick={loadAudit}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} />
            {busy ? "Проверка..." : "Запустить визуальный audit"}
          </button>
          <button
            type="button"
            onClick={regenerateSafeAssets}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-slate-950 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} />
            Пересобрать безопасно
          </button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Counter label="Всего" value={state?.totalAssets ?? 0} tone="dry" />
        <Counter label="Approved" value={state?.approvedAssets ?? 0} tone="ok" />
        <Counter label="Needs review" value={state?.needsReview ?? 0} tone="warn" />
        <Counter label="Rejected" value={state?.rejectedAssets ?? 0} tone="error" />
      </section>

      <section className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Если содержимое изображения невозможно распознать автоматически, статус остаётся `needs_review` до
            ручной проверки. Реальные публикации отключены.
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {(state?.assets ?? []).map((asset) => (
          <article key={asset.id} className="rounded-lg border border-line bg-panel/70 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{asset.channelId}</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{asset.channelTitle}</h3>
              </div>
              <StatusPill status={asset.status} ok={asset.currencyPolicyOk} />
            </div>

            <div className="mt-4 grid gap-2 text-xs">
              <PathRow label="logoPath" value={asset.logoPath} />
              <PathRow label="iconPath" value={asset.iconPath} />
              <PathRow label="previewPath" value={asset.previewPath} />
            </div>

            <div className="mt-4 rounded-md border border-line bg-slate-950/50 p-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-cyan-200">
                <Eye className="h-3.5 w-3.5" />
                prompt
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{asset.iconPrompt}</p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <TagBlock title="Approved visual elements" items={asset.approvedVisualElements} tone="ok" />
              <TagBlock title="Forbidden visual elements" items={asset.forbiddenVisualElements} tone="error" />
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">{asset.notes}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton
                label="Approve"
                icon={BadgeCheck}
                busy={busyAsset === `approve-${asset.id}`}
                onClick={() => updateAsset(asset.id, "approve")}
              />
              <ActionButton
                label="Reject"
                icon={XCircle}
                busy={busyAsset === `reject-${asset.id}`}
                onClick={() => updateAsset(asset.id, "reject")}
              />
              <ActionButton
                label="Needs review"
                icon={AlertTriangle}
                busy={busyAsset === `needs-review-${asset.id}`}
                onClick={() => updateAsset(asset.id, "needs-review")}
              />
            </div>
          </article>
        ))}
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

function StatusPill({ status, ok }: { status: ChannelVisualAssetStatus; ok: boolean }) {
  const tone = !ok || status === "rejected" ? "error" : status === "approved" ? "ok" : "warn";

  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", getPillClass(tone))}>
      {status} · policy {ok ? "OK" : "Error"}
    </span>
  );
}

function PathRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-line bg-slate-950/50 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[70%] break-all text-right font-medium text-slate-200">{value}</span>
    </div>
  );
}

function TagBlock({ title, items, tone }: { title: string; items: string[]; tone: "ok" | "error" }) {
  return (
    <div className="rounded-md border border-line bg-slate-950/50 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className={cn(
              "rounded-full border px-2 py-1 text-xs",
              tone === "ok" ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100" : "border-rose-300/20 bg-rose-300/10 text-rose-100",
            )}
          >
            {item}
          </span>
        ))}
      </div>
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
  icon: typeof ShieldCheck;
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
      {busy ? "Saving..." : label}
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

function buildForbiddenVisualLabel() {
  return "Запрещённые валютные символы и коды";
}
