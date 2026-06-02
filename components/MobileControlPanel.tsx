"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Database,
  FileText,
  Github,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  TimerReset,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SchedulerStatusPayload {
  ok: boolean;
  storeMode: string;
  dryRun: boolean;
  realPublishEnabled: boolean;
  autopublishEnabled: boolean;
  timezone: string;
  dailyLimitPerChannel: number;
  maxPostsPerDay: number;
  lastRun: {
    runId: string | null;
    source: string | null;
    startedAt: string | null;
    finishedAt: string | null;
    lastRunAt: string | null;
    message: string | null;
  };
  checked: number;
  published: number;
  skipped: number;
  errors: number;
  message: string | null;
}

export function MobileControlPanel() {
  const [status, setStatus] = useState<SchedulerStatusPayload | null>(null);
  const [busy, setBusy] = useState<"load" | "dry-run" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: "load" | null = "load") => {
    if (mode) setBusy(mode);
    setError(null);
    try {
      const response = await fetch("/api/admin/publish-scheduler/status", { cache: "no-store" });
      const payload = (await response.json()) as SchedulerStatusPayload;
      setStatus(payload);
      setMessage(payload.message ?? "Статус обновлен.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось загрузить статус.");
    } finally {
      if (mode) setBusy(null);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function runDryRun() {
    if (busy) return;
    setBusy("dry-run");
    setError(null);
    setMessage("Запускаем safe dry-run. Telegram не будет затронут.");
    try {
      const response = await fetch("/api/admin/publish-scheduler/dry-run", { method: "POST" });
      const payload = await response.json();
      if (!response.ok || !payload.ok || payload.dryRun !== true) {
        throw new Error(payload.message ?? "Dry-run failed.");
      }
      setMessage(`Dry-run: checked ${payload.checked ?? 0}, published ${payload.published ?? 0}, skipped ${payload.skipped ?? 0}, errors ${payload.errors ?? 0}.`);
      await load(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Dry-run failed.");
    } finally {
      setBusy(null);
    }
  }

  const lastRun = status?.lastRun.lastRunAt ? new Date(status.lastRun.lastRunAt).toLocaleString() : "нет запусков";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <section className="rounded-lg border border-line bg-panel/82 p-4 shadow-glow">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Mobile Control</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Пульт управления с телефона</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Безопасная мобильная панель: проверка готовых постов, статус scheduler и быстрый доступ к логам. Реальная отправка остается на стороне GitHub Actions.
            </p>
          </div>
        </div>
      </section>

      {message ? <Notice tone="info" text={message} /> : null}
      {error ? <Notice tone="error" text={error} /> : null}

      <section className="grid gap-3 sm:grid-cols-2">
        <StatusCard label="Автопубликация" value={status?.autopublishEnabled ? "включена" : "выключена"} tone={status?.autopublishEnabled ? "ok" : "warn"} />
        <StatusCard label="Реальная отправка" value={status?.realPublishEnabled ? "разрешена" : "пауза / dry"} tone={status?.realPublishEnabled ? "ok" : "warn"} />
        <StatusCard label="Store" value={status?.storeMode ?? "json"} icon={Database} />
        <StatusCard label="Timezone" value={status?.timezone ?? "Europe/Kyiv"} />
        <StatusCard label="Последний запуск" value={lastRun} className="sm:col-span-2" />
      </section>

      <section className="grid gap-3">
        <button type="button" onClick={() => void runDryRun()} disabled={Boolean(busy)} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">
          {busy === "dry-run" ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
          Проверить готовые посты
        </button>
        <button type="button" onClick={() => void load()} disabled={Boolean(busy)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-line bg-slate-950/70 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60">
          {busy === "load" ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
          Обновить статус
        </button>
        <ActionLink href="/admin/publish-scheduler#publication-events" icon={FileText} label="Открыть логи" />
        <ActionLink href="/admin/publish-scheduler" icon={TimerReset} label="Открыть scheduler" />
      </section>

      <InfoBlock
        title="Реальные публикации включаются только через GitHub Secrets"
        icon={Github}
        items={[
          "Боевой режим: TELEGRAM_REAL_PUBLISH_ENABLED=true и TELEGRAM_DRY_RUN=false.",
          "Пауза: TELEGRAM_REAL_PUBLISH_ENABLED=false.",
          "Эта мобильная панель не содержит кнопки реальной отправки.",
        ]}
      />

      <InfoBlock
        title="Что сейчас можно делать с телефона"
        items={[
          "Смотреть статус scheduler и последнего запуска.",
          "Запускать безопасную проверку готовых постов в dry-run.",
          "Открывать последние публикации, skipped-события и ошибки.",
          "Понимать, включена ли автопубликация и какой store mode активен.",
        ]}
      />

      <InfoBlock
        title="Что станет доступно после Supabase/remote DB"
        items={[
          "Редактировать очередь и статусы постов с телефона.",
          "Ставить публикации на паузу без ручного изменения GitHub Secrets.",
          "Управлять расписанием и каналами в hosted admin.",
          "Видеть единые логи GitHub Actions и worker из любой сети.",
        ]}
      />

      <InfoBlock
        title="Следующий шаг: подключение Vercel + Supabase"
        items={[
          "Это нужно, чтобы телефон, hosted admin и GitHub Actions видели одну и ту же очередь публикаций.",
          "После подключения можно будет управлять расписанием, статусами и паузой без локального компьютера.",
          "Понадобятся данные Supabase/PostgreSQL, hosted URL админки и отдельный секрет для доступа администратора.",
          "Секреты, токены и service-role keys нельзя отправлять в чат или хранить в клиентском коде.",
        ]}
      />

      <section className="grid gap-3 md:grid-cols-2">
        <ArchitectureCard title="Сейчас" steps={["local/admin panel", "JSON files", "git push", "GitHub Actions", "Telegram"]} />
        <ArchitectureCard title="Позже" steps={["phone", "hosted admin", "Supabase/PostgreSQL", "GitHub Actions/server worker", "Telegram"]} />
      </section>
    </div>
  );
}

function StatusCard({
  label,
  value,
  tone = "dry",
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "error" | "dry";
  icon?: typeof Database;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border p-4", tone === "ok" && "border-emerald-300/25 bg-emerald-300/10", tone === "warn" && "border-amber-300/25 bg-amber-300/10", tone === "error" && "border-rose-300/25 bg-rose-300/10", tone === "dry" && "border-line bg-panel/82", className)}>
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
        <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</p>
      </div>
      <p className="mt-2 break-words text-lg font-semibold leading-tight text-white">{value}</p>
    </div>
  );
}

function ActionLink({ href, icon: Icon, label }: { href: string; icon: typeof FileText; label: string }) {
  return (
    <Link href={href} className="inline-flex min-h-12 items-center justify-between gap-3 rounded-lg border border-line bg-panel/82 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100">
      <span className="inline-flex items-center gap-2">
        <Icon className="h-5 w-5" />
        {label}
      </span>
      <ArrowRight className="h-4 w-4 text-slate-500" />
    </Link>
  );
}

function InfoBlock({ title, items, icon: Icon }: { title: string; items: string[]; icon?: typeof Github }) {
  return (
    <section className="rounded-lg border border-line bg-panel/82 p-4">
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-5 w-5 text-cyan-200" /> : null}
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function ArchitectureCard({ title, steps }: { title: string; steps: string[] }) {
  return (
    <section className="rounded-lg border border-line bg-panel/82 p-4">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <span key={step} className="rounded-md border border-line bg-slate-950/50 px-2.5 py-2 text-xs text-slate-300">
            {index + 1}. {step}
          </span>
        ))}
      </div>
    </section>
  );
}

function Notice({ text, tone }: { text: string; tone: "info" | "error" }) {
  return (
    <p className={cn("rounded-md border p-3 text-sm leading-6", tone === "info" ? "border-cyan-300/20 bg-cyan-300/5 text-cyan-50" : "border-rose-300/25 bg-rose-300/10 text-rose-100")}>
      {text}
    </p>
  );
}
