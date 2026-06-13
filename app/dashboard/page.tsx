import { AlertTriangle, CalendarClock, CheckCircle2, RadioTower, Send, ShieldCheck, ChevronRight } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { getUnifiedSystemStatus } from "@/lib/unified-system-status";
import { ScheduledAutopublishPanel } from "@/components/ScheduledAutopublishPanel";
import { networkCards, uiLabels } from "@/lib/ui-labels";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const status = await getUnifiedSystemStatus();

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Центр управления каналами</h1>
        <p className="mt-2 text-slate-400 max-w-2xl">
          Выбери сеть каналов и управляй публикациями, предпросмотром и проверками без технических терминов.
        </p>
      </div>

      {/* NETWORK SELECTOR */}
      <div className="grid gap-6 md:grid-cols-2">
        {networkCards.map((net) => (
          <div key={net.id} className="relative overflow-hidden rounded-xl border border-line bg-panel/60 p-6 shadow-glow hover:bg-panel/80 hover:border-cyan-500/30 transition group">
            <h2 className="text-xl font-semibold text-white">{net.title}</h2>
            <p className="mt-1 text-sm font-medium text-cyan-400">{net.channelCount}</p>
            <p className="mt-4 text-sm text-slate-400 h-10">{net.description}</p>
            <div className="mt-8">
              <Link href={net.href} className="inline-flex items-center justify-center rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20">
                {net.buttonLabel}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* QUICK STATUSES */}
      <section className="rounded-xl border border-line bg-panel/40 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Быстрые статусы</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Каналы" value={status.channelsTotal} caption="Общее количество" icon={RadioTower} tone="cyan" />
          <StatCard title="Очередь" value={status.content.scheduled} caption="В ожидании" icon={CalendarClock} tone="amber" />
          <StatCard title="Готово к публикации" value={status.content.readyToPublish} caption="Проверено" icon={CheckCircle2} tone="emerald" />
          <StatCard title="Ошибки" value={status.autopublish.failedToday} caption="За сегодня" icon={AlertTriangle} tone={status.autopublish.failedToday ? "rose" : "slate"} />
          <StatCard title="Режим" value={status.autopublish.enabled ? uiLabels["live"] : uiLabels["dry-run"]} caption="Системный режим" icon={ShieldCheck} tone={status.autopublish.enabled ? "rose" : "cyan"} />
        </div>
      </section>

      {/* DIAGNOSTICS */}
      <section className="mt-12 opacity-80 hover:opacity-100 transition-opacity">
        <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 mb-4">Технические детали (Диагностика)</h3>
        
        <div className="space-y-6">
          <ScheduledAutopublishPanel />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Targets linked" value={`${status.telegram.targetsLinked}/15`} caption="Telegram state" icon={CheckCircle2} tone={status.telegram.targetsLinked === 15 ? "emerald" : "amber"} />
            <StatCard title="Bot access" value={`${status.telegram.botAccessOk}/15`} caption={status.telegram.getMeOk ? status.telegram.botUsername ?? "OK" : status.telegram.lastError ?? "not checked"} icon={ShieldCheck} tone={status.telegram.botAccessOk > 0 ? "emerald" : "rose"} />
            <StatCard title="Published" value={`${status.autopublish.publishedToday}/15`} caption="Сегодня" icon={Send} tone="cyan" />
            <StatCard title="Worker" value={status.autopublish.workerRunning ? "running" : "not running"} caption="Background task" icon={RadioTower} tone={status.autopublish.workerRunning ? "emerald" : "amber"} />
          </div>

          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6 rounded-lg border border-line bg-black/20 p-4">
            <Info label="Weekly plan" value={String(status.content.weeklyPlanTotal)} />
            <Info label="Ready" value={String(status.content.readyToPublish)} />
            <Info label="Scheduled" value={String(status.content.scheduled)} />
            <Info label="Blocked" value={String(status.content.blocked)} />
            <Info label="Weak text" value={String(status.content.weakText)} />
            <Info label="Weak image" value={String(status.content.weakImage)} />
          </div>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-white/5 p-3">
      <p className="text-xs uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
