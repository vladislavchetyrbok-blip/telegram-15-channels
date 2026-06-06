import { AlertTriangle, CalendarClock, CheckCircle2, RadioTower, Send, ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { getUnifiedSystemStatus } from "@/lib/unified-system-status";
import { canonicalChannelTitles } from "@/lib/channel-canonical";
import { ScheduledAutopublishPanel } from "@/components/ScheduledAutopublishPanel";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const status = await getUnifiedSystemStatus();
  const channelRows = Object.entries(canonicalChannelTitles);

  return (
    <div className="space-y-6">
      <ScheduledAutopublishPanel />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Всего каналов" value={status.channelsTotal} caption="единая сетка" icon={RadioTower} tone="cyan" />
        <StatCard title="Targets linked" value={`${status.telegram.targetsLinked}/15`} caption="из Telegram targets state" icon={CheckCircle2} tone={status.telegram.targetsLinked === 15 ? "emerald" : "amber"} />
        <StatCard title="Bot access OK" value={`${status.telegram.botAccessOk}/15`} caption={status.telegram.getMeOk ? status.telegram.botUsername ?? "getMe OK" : status.telegram.lastError ?? "not checked"} icon={ShieldCheck} tone={status.telegram.botAccessOk > 0 ? "emerald" : "rose"} />
        <StatCard title="Ready posts" value={status.content.readyToPublish} caption="weekly ready_to_publish" icon={CalendarClock} tone="emerald" />
        <StatCard title="Published today" value={`${status.autopublish.publishedToday}/15`} caption="daily limit: 1/channel" icon={Send} tone="cyan" />
        <StatCard title="Failed today" value={status.autopublish.failedToday} caption="autopublish log" icon={AlertTriangle} tone={status.autopublish.failedToday ? "rose" : "emerald"} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Telegram token" value={status.telegram.tokenConfigured ? "configured" : "missing"} caption={status.telegram.getMeOk ? "getMe OK" : status.telegram.lastError ?? "not checked"} icon={ShieldCheck} tone={status.telegram.tokenConfigured ? "emerald" : "rose"} />
        <StatCard title="Scheduler" value={status.autopublish.schedulerStatus} caption={status.autopublish.enabled ? "autopublish enabled" : "autopublish disabled"} icon={CalendarClock} tone={status.autopublish.schedulerStatus === "error" ? "rose" : "slate"} />
        <StatCard title="Worker" value={status.autopublish.workerRunning ? "running" : "not running"} caption="browser tab is not required when worker runs" icon={RadioTower} tone={status.autopublish.workerRunning ? "emerald" : "amber"} />
        <StatCard title="Real sends total" value={status.telegram.realSendsTotal} caption={status.telegram.lastRealSend ?? "no latest record"} icon={Send} tone="amber" />
      </section>

      <section className="rounded-lg border border-line bg-panel/82 p-5 shadow-glow">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Unified state</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Единое состояние публикаций</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Info label="Weekly plan" value={String(status.content.weeklyPlanTotal)} />
          <Info label="Ready" value={String(status.content.readyToPublish)} />
          <Info label="Scheduled" value={String(status.content.scheduled)} />
          <Info label="Blocked" value={String(status.content.blocked)} />
          <Info label="Weak text" value={String(status.content.weakText)} />
          <Info label="Weak image" value={String(status.content.weakImage)} />
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Логотипы каналов и несинхронизированная статистика Telegram не являются блокерами публикации. Блокируют только Telegram access, качество постов, Telegram-ready изображения, запрещённые валюты, дубли и дневные лимиты.
        </p>
      </section>

      <section className="rounded-lg border border-line bg-panel/82 p-5 shadow-glow">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Channels</p>
        <h2 className="mt-2 text-xl font-semibold text-white">15 каналов платформы</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {channelRows.map(([id, title], index) => (
            <div key={id} className="rounded-md border border-line bg-black/15 p-3">
              <p className="text-xs text-slate-500">{String(index + 1).padStart(2, "0")} / {id}</p>
              <p className="mt-1 font-semibold text-white">{title}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-black/15 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
