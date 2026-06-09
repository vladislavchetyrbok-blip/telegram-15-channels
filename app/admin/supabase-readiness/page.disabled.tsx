import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Database, GitBranch, ShieldCheck } from "lucide-react";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";
import { getSupabaseReadinessStatus } from "@/lib/supabase-readiness";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function SupabaseReadinessPage() {
  requireAdminPageAccess("/admin/supabase-readiness");
  const status = getSupabaseReadinessStatus();
  const checks = [
    { label: "Current storeMode", value: status.currentStoreMode, ok: status.jsonStoreStillActive, warn: true },
    { label: "DATABASE_URL configured", value: status.hasDatabaseUrl ? "true" : "false", ok: status.hasDatabaseUrl, warn: true },
    { label: "Supabase schema file", value: status.hasSupabaseSchema ? "exists" : "missing", ok: status.hasSupabaseSchema },
    { label: "Postgres adapter", value: status.hasPostgresAdapter ? "ready" : "missing", ok: status.hasPostgresAdapter },
    { label: "Migration script", value: status.hasMigrationScript ? "ready" : "missing", ok: status.hasMigrationScript },
    { label: "JSON store active", value: status.jsonStoreStillActive ? "yes" : "no", ok: status.jsonStoreStillActive },
    { label: "GitHub Actions publishing", value: "unaffected", ok: status.productionPublishUnaffected },
    { label: "Dry-run migration", value: status.safeToMigrateDryRun ? "ready" : "not ready", ok: status.safeToMigrateDryRun },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>

      <section className="rounded-lg border border-line bg-panel/82 p-4 shadow-glow">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <Database className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Supabase Readiness</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">JSON to PostgreSQL migration prep</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Read-only migration checklist. Production publishing stays on JSON and GitHub Actions until a separate dry-run migration is approved.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {checks.map((check) => (
          <Metric key={check.label} label={check.label} value={check.value} ok={check.ok} warn={check.warn} />
        ))}
      </section>

      <section className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" />
          <div className="space-y-2 text-sm leading-6 text-slate-300">
            <p>Current live path stays: GitHub Actions -&gt; npm run publish:due -&gt; JSON store -&gt; Telegram.</p>
            <p>Supabase is being prepared for future phone control, shared logs and a remote queue. It is not the active production store yet.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <InfoList title="Warnings" icon={AlertTriangle} items={status.warnings} empty="No warnings." />
        <InfoList title="Next steps" icon={GitBranch} items={status.nextSteps} empty="No next steps." />
      </section>
    </div>
  );
}

function Metric({ label, value, ok, warn = false }: { label: string; value: string; ok: boolean; warn?: boolean }) {
  return (
    <div className={cn("min-h-24 rounded-lg border p-3", ok && !warn ? "border-emerald-300/25 bg-emerald-300/10" : warn ? "border-amber-300/25 bg-amber-300/10" : "border-rose-300/25 bg-rose-300/10")}>
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-3 break-words text-lg font-semibold leading-tight text-white">{value}</p>
    </div>
  );
}

function InfoList({ title, items, icon: Icon, empty }: { title: string; items: string[]; icon: LucideIcon; empty: string }) {
  return (
    <section className="rounded-lg border border-line bg-panel/82 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-cyan-200" />
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
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
