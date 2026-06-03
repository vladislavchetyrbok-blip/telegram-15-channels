import type { LucideIcon } from "lucide-react";
import { Activity, AlertTriangle, CheckCircle2, Database, Github, LockKeyhole, RadioTower, ShieldCheck } from "lucide-react";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";
import { getSystemStatus } from "@/lib/system-status";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function SystemStatusPage() {
  requireAdminPageAccess("/admin/system-status");
  const status = getSystemStatus();
  const cards = [
    { label: "App health", value: status.ok ? "OK" : "error", tone: status.ok ? "ok" : "error", icon: Activity },
    { label: "Admin auth", value: status.adminAuth.authEnabled ? "enabled" : "disabled", tone: status.adminAuth.authEnabled ? "ok" : "warn", icon: LockKeyhole },
    { label: "Manual publish", value: "blocked", tone: "ok", icon: ShieldCheck },
    { label: "GitHub Actions", value: status.githubActions.mode, tone: status.githubActions.mode === "active" ? "ok" : "warn", icon: Github },
    { label: "Store", value: status.jsonStore.storeMode, tone: status.jsonStore.warning ? "warn" : "ok", icon: Database },
    { label: "Supabase", value: status.supabaseMigration.currentStoreMode === "postgres" ? "active" : "not active", tone: status.supabaseMigration.jsonStoreStillActive ? "warn" : "ok", icon: Database },
    { label: "Ready posts", value: String(status.queue.ready), tone: status.queue.ready > 0 ? "ok" : "warn" },
    { label: "Days left", value: String(status.postReserve.estimatedDaysLeft), tone: status.postReserve.enoughUntilJune7 ? "ok" : "warn" },
    { label: "Telegram access", value: `${status.telegram.botAccessOk}/${status.telegram.botAccessTotal}`, tone: status.telegram.botAccessOk === status.telegram.botAccessTotal ? "ok" : "error", icon: RadioTower },
  ] satisfies Array<{ label: string; value: string; tone: "ok" | "warn" | "error"; icon?: LucideIcon }>;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>

      <section className="rounded-lg border border-line bg-panel/82 p-4 shadow-glow">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <Activity className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">System Status</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Admin and publishing health</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Read-only summary for Vercel readiness, GitHub Actions publishing, JSON store, Telegram access and content reserve.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <Metric key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Panel title="Production safety" icon={ShieldCheck}>
          <KeyValue label="Environment" value={status.app.environment} />
          <KeyValue label="Vercel" value={status.app.isVercel ? "detected" : "not detected"} />
          <KeyValue label="Production" value={status.app.isProduction ? "yes" : "no"} />
          <KeyValue label="Real Telegram from admin" value={status.productionSafety.realTelegramPublishAllowed ? "allowed" : "not allowed"} />
        </Panel>

        <Panel title="Reserve" icon={Database}>
          <KeyValue label="Queue total" value={String(status.queue.total)} />
          <KeyValue label="Ready" value={String(status.queue.ready)} />
          <KeyValue label="Published" value={String(status.queue.published)} />
          <KeyValue label="Enough until June 7" value={status.postReserve.enoughUntilJune7 ? "yes" : "no"} />
        </Panel>

        <Panel title="Supabase migration readiness" icon={Database}>
          <KeyValue label="Database still inactive" value={status.supabaseMigration.currentStoreMode === "postgres" ? "no" : "yes"} warn={status.supabaseMigration.currentStoreMode === "postgres"} />
          <KeyValue label="JSON store active" value={status.supabaseMigration.jsonStoreStillActive ? "yes" : "no"} warn={!status.supabaseMigration.jsonStoreStillActive} />
          <KeyValue label="DATABASE_URL configured" value={status.supabaseMigration.hasDatabaseUrl ? "true" : "false"} warn={!status.supabaseMigration.hasDatabaseUrl} />
          <KeyValue label="Schema file" value={status.supabaseMigration.hasSupabaseSchema ? "exists" : "missing"} warn={!status.supabaseMigration.hasSupabaseSchema} />
          <KeyValue label="Migration script" value={status.supabaseMigration.hasMigrationScript ? "ready" : "missing"} warn={!status.supabaseMigration.hasMigrationScript} />
          <KeyValue label="Switch requires separate step" value="yes" />
          <KeyValue label="Production unaffected" value={status.supabaseMigration.productionPublishUnaffected ? "yes" : "no"} warn={!status.supabaseMigration.productionPublishUnaffected} />
        </Panel>

        <Panel title="Last events" icon={Activity}>
          <KeyValue label="Last run" value={status.lastRun?.finishedAt || status.lastRun?.startedAt || "none"} />
          <KeyValue label="Last published" value={formatEvent(status.lastPublished)} />
          <KeyValue label="Last error" value={formatEvent(status.lastError)} />
          <KeyValue label="Content quality" value={status.contentQuality.status} />
        </Panel>

        <Panel title="GitHub Actions checklist" icon={Github}>
          {status.githubActions.checklist.map((check) => (
            <KeyValue key={check.key} label={check.label} value={check.ok ? "OK" : check.detail} warn={!check.ok} />
          ))}
        </Panel>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <ListPanel title="Warnings" icon={AlertTriangle} items={status.warnings} empty="No warnings." />
        <ListPanel title="Next steps" icon={CheckCircle2} items={status.nextSteps} empty="No next steps." />
      </section>
    </div>
  );
}

function Metric({ label, value, tone, icon: Icon }: { label: string; value: string; tone: "ok" | "warn" | "error"; icon?: LucideIcon }) {
  return (
    <div className={cn("min-h-24 rounded-lg border p-3", tone === "ok" && "border-emerald-300/25 bg-emerald-300/10", tone === "warn" && "border-amber-300/25 bg-amber-300/10", tone === "error" && "border-rose-300/25 bg-rose-300/10")}>
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
      </div>
      <p className="mt-3 break-words text-xl font-semibold leading-tight text-white">{value}</p>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-panel/82 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-cyan-200" />
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

function KeyValue({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-line bg-slate-950/40 px-3 py-2">
      <p className="text-xs leading-5 text-slate-500">{label}</p>
      <p className={cn("break-words text-right text-xs font-semibold", warn ? "text-amber-100" : "text-slate-200")}>{value}</p>
    </div>
  );
}

function ListPanel({ title, items, icon: Icon, empty }: { title: string; items: string[]; icon: LucideIcon; empty: string }) {
  return (
    <Panel title={title} icon={Icon}>
      {items.length ? (
        <ul className="space-y-2 text-sm leading-6 text-slate-400">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{empty}</p>
      )}
    </Panel>
  );
}

function formatEvent(entry: { createdAt: string; channelId: string | null; postId: string | null; message: string | null } | null) {
  if (!entry) return "none";
  return `${entry.createdAt} / ${entry.channelId ?? "system"} / ${entry.postId ?? "-"} / ${entry.message ?? "-"}`;
}
