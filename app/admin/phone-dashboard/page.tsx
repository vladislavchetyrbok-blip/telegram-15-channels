import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Clock3,
  ExternalLink,
  Github,
  ListChecks,
  Radio,
  Send,
  ShieldAlert,
  Smartphone,
  XCircle,
} from "lucide-react";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";
import { getPhoneDashboardStatus } from "@/lib/phone-dashboard";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function PhoneDashboardPage() {
  requireAdminPageAccess("/admin/phone-dashboard");
  const status = getPhoneDashboardStatus();

  const cards = [
    { label: "Autopublish", value: status.autopublishEnabled ? "ON" : "OFF", tone: status.autopublishEnabled ? "ok" : "warn", icon: Radio },
    { label: "GitHub Actions", value: status.githubActions.mode, tone: status.githubActions.mode === "active" ? "ok" : "warn", icon: Github },
    { label: "dryRun", value: String(status.dryRun), tone: status.dryRun ? "warn" : "ok" },
    { label: "realPublish", value: String(status.realPublishEnabled), tone: status.realPublishEnabled ? "ok" : "warn" },
    { label: "storeMode", value: status.storeMode, tone: status.storeMode === "json" ? "ok" : "warn" },
    { label: "Ready posts", value: String(status.queue.ready), tone: status.queue.ready > 0 ? "ok" : "warn" },
    { label: "Scheduled", value: String(status.queue.scheduled), tone: status.queue.scheduled > 0 ? "ok" : "warn" },
    { label: "Published today", value: String(status.today.publishedCount), tone: status.today.publishedCount > 0 ? "ok" : "dry", icon: Send },
    { label: "Failed today", value: String(status.today.failedToday), tone: status.today.failedToday > 0 ? "error" : "ok", icon: XCircle },
    { label: "Skipped today", value: String(status.today.skippedToday), tone: status.today.skippedToday > 0 ? "warn" : "dry" },
    { label: "Days left", value: String(status.reserve.estimatedDaysLeft), tone: status.reserve.enoughUntilJune7 ? "ok" : "warn" },
    { label: "Until Jun 7", value: status.reserve.enoughUntilJune7 ? "yes" : "no", tone: status.reserve.enoughUntilJune7 ? "ok" : "warn" },
    { label: "Targets linked", value: `${status.telegram.targetsLinked}/${status.telegram.targetsTotal}`, tone: status.telegram.targetsLinked === status.telegram.targetsTotal ? "ok" : "warn" },
    { label: "Bot access", value: `${status.telegram.botAccessOk}/${status.telegram.botAccessTotal}`, tone: status.telegram.botAccessOk === status.telegram.botAccessTotal ? "ok" : "error" },
    { label: "Content quality", value: status.contentQuality.status, tone: status.contentQuality.status === "OK" ? "ok" : "warn", icon: ListChecks },
    { label: "Next publish", value: formatDateTime(status.nextExpectedPublishTime) || "-", tone: "dry", icon: Clock3 },
  ] satisfies Array<{ label: string; value: string; tone: "ok" | "warn" | "error" | "dry"; icon?: LucideIcon }>;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>

      <section className="rounded-lg border border-line bg-panel/82 p-4 shadow-glow">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Phone Dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Telegram autopublish</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              iPhone-first read-only panel. Real publishing remains in GitHub Actions.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <Metric key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-3">
        <InfoCard title="Last successful publish" value={formatLog(status.lastPublished)} tone={status.lastPublished ? "ok" : "dry"} />
        <InfoCard title="Last error" value={formatLog(status.lastError)} tone={status.lastError ? "error" : "ok"} />
      </section>

      <section className="grid gap-3">
        {status.githubActions.actionsUrl ? (
          <a href={status.githubActions.actionsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
            <Github className="h-5 w-5" />
            Open GitHub Actions
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <InfoCard title="Open GitHub Actions" value="Set NEXT_PUBLIC_GITHUB_ACTIONS_URL to show a direct button. For now: GitHub repository -> Actions -> Publish due Telegram posts." tone="dry" />
        )}
        <Link href="/admin/publish-monitor" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-line bg-panel/82 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100">
          <ListChecks className="h-5 w-5" />
          Open publish monitor
        </Link>
      </section>

      <Section title="Open Telegram channels">
        <div className="grid gap-2">
          {status.telegram.channels.map((channel) => (
            <div key={channel.channelId} className="flex items-center justify-between gap-3 rounded-md border border-line bg-slate-950/40 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{channel.channelId}</p>
                <p className="text-xs text-slate-500">{channel.accessStatus}{channel.error ? `: ${channel.error}` : ""}</p>
              </div>
              {channel.link ? (
                <a href={channel.link} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-cyan-200 hover:underline">
                  Open
                </a>
              ) : (
                <span className="shrink-0 text-xs text-slate-500">{channel.linked ? "linked" : "missing"}</span>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Что делать, если публикации не идут">
        <TroubleList />
      </Section>

      <Section title="Emergency instructions">
        <div className="space-y-2 text-sm leading-6 text-slate-300">
          {status.emergencyActions.map((action) => (
            <div key={action.title} className="rounded-md border border-line bg-slate-950/40 p-3">
              <p className="font-semibold text-white">{action.title}</p>
              <p className="mt-1 text-slate-400">{action.detail}</p>
            </div>
          ))}
          <p className="rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-amber-50">
            Do not press Run workflow many times in a row. Let duplicate protection work and inspect logs first.
          </p>
        </div>
      </Section>

      <Section title="Warnings">
        {status.warnings.length ? (
          <ul className="space-y-2 text-sm leading-6 text-amber-100">
            {status.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No warnings.</p>
        )}
      </Section>
    </div>
  );
}

function Metric({ label, value, tone, icon: Icon }: { label: string; value: string; tone: "ok" | "warn" | "error" | "dry"; icon?: LucideIcon }) {
  return (
    <div className={cn("min-h-24 rounded-lg border p-3", toneClass(tone))}>
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
      </div>
      <p className="mt-3 break-words text-xl font-semibold leading-tight text-white">{value}</p>
    </div>
  );
}

function InfoCard({ title, value, tone }: { title: string; value: string; tone: "ok" | "warn" | "error" | "dry" }) {
  return (
    <section className={cn("rounded-lg border p-4", toneClass(tone))}>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <p className="mt-2 break-words text-sm leading-6 text-slate-300">{value}</p>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-panel/82 p-4">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function TroubleList() {
  const items = [
    "dryRun=true -> check GitHub Secrets and workflow env.",
    "realPublishEnabled=false -> set TELEGRAM_REAL_PUBLISH_ENABLED=true.",
    "errors > 0 -> open GitHub Actions logs.",
    "published=0, errors=0 -> maybe no due posts yet.",
    "already_published -> duplicate protection worked.",
    "bot access not OK -> check that the bot is admin in the channel.",
    "ready posts low -> generate a new 7-day plan and git push.",
  ];

  return (
    <ul className="space-y-2 text-sm leading-6 text-slate-400">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <ShieldAlert className="mt-1 h-4 w-4 shrink-0 text-amber-200" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function formatLog(entry: { createdAt: string; channelId: string | null; postId: string | null; message: string | null } | null) {
  if (!entry) return "none";
  return `${formatDateTime(entry.createdAt)} / ${entry.channelId ?? "system"} / ${entry.postId ?? "-"} / ${entry.message ?? "-"}`;
}

function formatDateTime(value: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

function toneClass(tone: "ok" | "warn" | "error" | "dry") {
  return cn(
    tone === "ok" && "border-emerald-300/25 bg-emerald-300/10",
    tone === "warn" && "border-amber-300/25 bg-amber-300/10",
    tone === "error" && "border-rose-300/25 bg-rose-300/10",
    tone === "dry" && "border-line bg-panel/82",
  );
}
