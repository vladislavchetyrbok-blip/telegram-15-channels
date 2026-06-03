import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Clock3, Gauge, Github, ListChecks, Radio, Send, SkipForward, XCircle } from "lucide-react";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";
import { getPublishMonitorStatus, type WorkflowChecklistItem } from "@/lib/publish-monitor";
import type { PublicationLogStatusEntry } from "@/lib/publish-scheduler-status";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function PublishMonitorPage() {
  requireAdminPageAccess("/admin/publish-monitor");
  const status = getPublishMonitorStatus();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>

      <section className="rounded-lg border border-line bg-panel/82 p-5 shadow-glow">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <Radio className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Publish Monitor</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Autopublish control center</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Read-only monitoring for the current JSON + GitHub Actions publishing mode. This page does not run publish:due and does not send Telegram messages.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Store mode" value={status.storeMode} tone={status.storeMode === "json" ? "ok" : "warn"} icon={Gauge} />
        <Metric label="Dry-run" value={status.dryRun ? "true" : "false"} tone={status.dryRun ? "warn" : "ok"} />
        <Metric label="Real publish" value={status.realPublishEnabled ? "enabled" : "disabled"} tone={status.realPublishEnabled ? "ok" : "warn"} icon={Send} />
        <Metric label="Next check" value={formatDateTime(status.nextScheduledCheck)} icon={Clock3} />
        <Metric label="Max/run" value={String(status.maxPostsPerRun)} />
        <Metric label="Max/day" value={String(status.maxPostsPerDay)} />
        <Metric label="Limit/channel" value={String(status.dailyLimitPerChannel)} />
        <Metric label="Timezone" value={status.timezone} />
      </section>

      <SectionTitle title="Queue" />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="Total" value={String(status.queue.total)} />
        <Metric label="Ready" value={String(status.queue.ready)} tone={status.queue.ready > 0 ? "ok" : "warn"} />
        <Metric label="Scheduled" value={String(status.queue.scheduled)} tone={status.queue.scheduled > 0 ? "ok" : "warn"} />
        <Metric label="Published" value={String(status.queue.published)} tone="ok" />
        <Metric label="Skipped" value={String(status.queue.skipped)} tone={status.queue.skipped > 0 ? "warn" : "dry"} />
        <Metric label="Failed" value={String(status.queue.failed)} tone={status.queue.failed > 0 ? "error" : "ok"} />
      </section>

      <SectionTitle title="Reserve Until June 7" />
      <section className="grid gap-3 md:grid-cols-3">
        <Metric label="Posts remaining" value={String(status.reserve.postsRemaining)} tone={status.reserve.enoughUntilJune7 ? "ok" : "warn"} />
        <Metric label="Estimated days left" value={String(status.reserve.estimatedDaysLeft)} tone={status.reserve.enoughUntilJune7 ? "ok" : "warn"} />
        <Metric label="Enough until June 7" value={status.reserve.enoughUntilJune7 ? "yes" : "no"} tone={status.reserve.enoughUntilJune7 ? "ok" : "warn"} />
      </section>

      <SectionTitle title={`Today (${status.today.date})`} />
      <section className="grid gap-3 lg:grid-cols-2">
        <ChannelList title={`Published today: ${status.today.publishedCount}`} channels={status.today.channelsPublished} empty="No channels detected as published today in local JSON/logs." tone="ok" />
        <ChannelList title={`Still missing today: ${status.today.channelsMissing.length}`} channels={status.today.channelsMissing} empty="All channels have a detected publication today." tone={status.today.channelsMissing.length ? "warn" : "ok"} />
      </section>

      <SectionTitle title="GitHub Actions Status Checklist" />
      <section className="rounded-lg border border-line bg-panel/82 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          {status.githubActions.checklist.map((check) => (
            <ChecklistRow key={check.key} item={check} />
          ))}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <InfoList title="Warnings" items={status.warnings} empty="No warnings." tone={status.warnings.length ? "warn" : "ok"} />
        <InfoList title="Next steps" items={status.nextSteps} empty="No next steps." />
      </section>

      <SectionTitle title="Recent Published" />
      <LogList rows={status.recent.published} empty="No recent published logs in local runtime." icon={CheckCircle2} />

      <SectionTitle title="Recent Skipped" />
      <LogList rows={status.recent.skipped} empty="No recent skipped logs in local runtime." icon={SkipForward} />

      <SectionTitle title="Recent Failed" />
      <LogList rows={status.recent.failed} empty="No recent failed logs in local runtime." icon={XCircle} />
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="pt-1 text-lg font-semibold text-white">{title}</h2>;
}

function Metric({ label, value, tone = "dry", icon: Icon }: { label: string; value: string; tone?: "ok" | "warn" | "error" | "dry"; icon?: LucideIcon }) {
  return (
    <div className={cn("rounded-lg border px-4 py-3", toneClass(tone))}>
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
        <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</p>
      </div>
      <p className="mt-2 break-words text-lg font-semibold leading-tight text-white">{value}</p>
    </div>
  );
}

function ChannelList({ title, channels, empty, tone }: { title: string; channels: string[]; empty: string; tone: "ok" | "warn" }) {
  return (
    <section className={cn("rounded-lg border p-4", toneClass(tone))}>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {channels.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {channels.map((channel) => (
            <span key={channel} className="rounded-md border border-line bg-slate-950/50 px-2.5 py-2 text-xs text-slate-300">
              {channel}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{empty}</p>
      )}
    </section>
  );
}

function ChecklistRow({ item }: { item: WorkflowChecklistItem }) {
  return (
    <div className={cn("rounded-md border p-3", item.ok ? "border-emerald-300/20 bg-emerald-300/10" : "border-amber-300/25 bg-amber-300/10")}>
      <div className="flex items-start gap-2">
        {item.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{item.label}</p>
          <p className="mt-1 break-words text-xs leading-5 text-slate-400">{item.detail}</p>
        </div>
      </div>
    </div>
  );
}

function InfoList({ title, items, empty, tone = "dry" }: { title: string; items: string[]; empty: string; tone?: "ok" | "warn" | "error" | "dry" }) {
  return (
    <section className={cn("rounded-lg border p-4", toneClass(tone))}>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{empty}</p>
      )}
    </section>
  );
}

function LogList({ rows, empty, icon: Icon }: { rows: PublicationLogStatusEntry[]; empty: string; icon: LucideIcon }) {
  if (!rows.length) return <p className="rounded-lg border border-line bg-panel/82 p-4 text-sm text-slate-500">{empty}</p>;

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <article key={row.id} className="rounded-lg border border-line bg-panel/82 p-4">
          <div className="flex items-start gap-2">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{formatDateTime(row.createdAt)}</p>
              <p className="mt-1 break-words text-sm font-semibold text-white">{row.channelId ?? "system"}</p>
              <p className="mt-1 break-words text-xs leading-5 text-slate-400">{row.postId ?? "-"}</p>
              <p className="mt-2 break-words text-xs leading-5 text-slate-300">{row.message ?? "-"}</p>
              <p className="mt-2 text-xs text-slate-500">source: {row.source ?? "-"}{row.dryRun ? " / dry" : ""}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function toneClass(tone: "ok" | "warn" | "error" | "dry") {
  return cn(
    tone === "ok" && "border-emerald-300/25 bg-emerald-300/10",
    tone === "warn" && "border-amber-300/25 bg-amber-300/10",
    tone === "error" && "border-rose-300/25 bg-rose-300/10",
    tone === "dry" && "border-line bg-panel/82",
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}
