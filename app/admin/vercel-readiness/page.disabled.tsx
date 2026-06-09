import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, CircleDashed, Cloud, LockKeyhole, ShieldCheck } from "lucide-react";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";
import { cn } from "@/lib/utils";
import { getVercelReadinessStatus } from "@/lib/vercel-readiness";

export const dynamic = "force-dynamic";

export default function VercelReadinessPage() {
  requireAdminPageAccess("/admin/vercel-readiness");
  const status = getVercelReadinessStatus();

  const checks = [
    { label: "GitHub repo ready", ready: true },
    { label: "GitHub Actions workflow exists", ready: true },
    { label: "Admin auth prepared", ready: true },
    { label: "ADMIN_AUTH_ENABLED expected true for production", ready: status.adminAuthEnabled, tone: "warn" as const },
    { label: "ADMIN_PASSWORD required for production", ready: status.adminPasswordConfigured, tone: "warn" as const },
    { label: "ADMIN_SESSION_SECRET required for production", ready: status.adminSessionSecretConfigured, tone: "warn" as const },
    { label: "TELEGRAM_BOT_TOKEN belongs in GitHub Secrets", ready: true, note: "Do not add Telegram tokens to code. Vercel only needs them if a hosted worker is intentionally introduced later." },
    { label: "JSON store active", ready: status.storeMode === "json", tone: "warn" as const },
    { label: "Supabase not connected yet", ready: !status.hasSupabaseConfig, tone: "warn" as const },
    { label: "JSON store is not suitable for persistent Vercel writes", ready: status.storeMode !== "json", tone: "warn" as const },
    { label: "Safe manual actions only dry-run", ready: status.safeManualPublishOnly },
    { label: "Real publish controlled through GitHub Actions secrets", ready: true },
    { label: "Next step: Supabase/PostgreSQL before full phone control", ready: !status.hasDatabaseUrl, tone: "warn" as const },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>

      <section className="rounded-lg border border-line bg-panel/82 p-5 shadow-glow">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <Cloud className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Vercel Readiness</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Safe hosted admin preparation</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Read-only checklist for opening the admin panel from a phone later. Secrets are shown only as true/false flags, and manual actions remain dry-run only.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Environment" value={status.environment} ready />
        <Metric label="Vercel" value={status.isVercel ? "detected" : "not detected"} ready={status.isVercel} warn={!status.isVercel} />
        <Metric label="Production" value={status.isProduction ? "yes" : "no"} ready={!status.isProduction} warn={status.isProduction} />
        <Metric label="Store" value={status.storeMode} ready={status.storeMode === "json"} warn={status.storeMode === "json"} />
        <Metric label="Admin auth" value={status.adminAuthEnabled ? "enabled" : "disabled"} ready={status.adminAuthEnabled} warn={!status.adminAuthEnabled} />
        <Metric label="Admin password" value={status.adminPasswordConfigured ? "configured" : "missing"} ready={status.adminPasswordConfigured} warn={!status.adminPasswordConfigured} />
        <Metric label="Session secret" value={status.adminSessionSecretConfigured ? "configured" : "missing"} ready={status.adminSessionSecretConfigured} warn={!status.adminSessionSecretConfigured} />
        <Metric label="DATABASE_URL" value={status.hasDatabaseUrl ? "configured" : "not configured"} ready={status.hasDatabaseUrl} warn={!status.hasDatabaseUrl} />
      </section>

      <section className="rounded-lg border border-line bg-panel/82 p-4">
        <h2 className="text-lg font-semibold text-white">Checklist</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {checks.map((check) => (
            <div key={check.label} className={cn("rounded-md border p-3", check.ready ? "border-emerald-300/20 bg-emerald-300/10" : check.tone === "warn" ? "border-amber-300/25 bg-amber-300/10" : "border-rose-300/25 bg-rose-300/10")}>
              <div className="flex items-start gap-2">
                {check.ready ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" /> : check.tone === "warn" ? <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-200" />}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{check.label}</p>
                  {check.note ? <p className="mt-1 text-xs leading-5 text-slate-400">{check.note}</p> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <InfoList title="Warnings" items={status.warnings} empty="No warnings." icon={AlertTriangle} />
        <InfoList title="Next steps" items={status.nextSteps} empty="No next steps." icon={ShieldCheck} />
      </section>

      <section className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" />
          <div className="space-y-2 text-sm leading-6 text-slate-300">
            <p>Target path: phone -&gt; Vercel admin panel -&gt; Supabase/PostgreSQL -&gt; GitHub Actions/server worker -&gt; Telegram.</p>
            <p>Current safe path: local/admin panel -&gt; JSON files -&gt; git push -&gt; GitHub Actions -&gt; Telegram.</p>
            <p>Before public Vercel access, configure ADMIN_AUTH_ENABLED=true, ADMIN_PASSWORD and ADMIN_SESSION_SECRET in Vercel env.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, ready, warn = false }: { label: string; value: string; ready: boolean; warn?: boolean }) {
  return (
    <div className={cn("rounded-lg border p-4", ready && !warn ? "border-emerald-300/25 bg-emerald-300/10" : warn ? "border-amber-300/25 bg-amber-300/10" : "border-rose-300/25 bg-rose-300/10")}>
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoList({ title, items, empty, icon: Icon }: { title: string; items: string[]; empty: string; icon: LucideIcon }) {
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
