import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Cloud, ExternalLink, Github, LockKeyhole, Smartphone } from "lucide-react";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";
import { cn } from "@/lib/utils";
import { getVercelSetupStatus } from "@/lib/vercel-setup";

export const dynamic = "force-dynamic";

export default function VercelSetupPage() {
  requireAdminPageAccess("/admin/vercel-setup");
  const status = getVercelSetupStatus();
  const githubActionsUrl = process.env.NEXT_PUBLIC_GITHUB_ACTIONS_URL;
  const checks = [
    { label: "Admin auth enabled", value: status.adminAuthEnabled ? "yes" : "no", ok: status.adminAuthEnabled },
    { label: "Admin password", value: status.adminPasswordConfigured ? "configured" : "missing", ok: status.adminPasswordConfigured },
    { label: "Session secret", value: status.adminSessionSecretConfigured ? "configured" : "missing", ok: status.adminSessionSecretConfigured },
    { label: "Store mode", value: status.storeMode, ok: status.storeMode === "json", warn: true },
    { label: "Phone dashboard", value: status.hasPhoneDashboard ? "ready" : "missing", ok: status.hasPhoneDashboard },
    { label: "Publish monitor", value: status.hasPublishMonitor ? "ready" : "missing", ok: status.hasPublishMonitor },
    { label: "Publish scheduler", value: status.hasPublishScheduler ? "ready" : "missing", ok: status.hasPublishScheduler },
    { label: "Manual publish from Vercel", value: status.manualPublishBlockedInProduction ? "blocked" : "dry-run only", ok: true },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>

      <section className="rounded-lg border border-line bg-panel/82 p-4 shadow-glow">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <Cloud className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Vercel Setup</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Phone admin launch checklist</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Safe preparation for opening the admin panel from an iPhone. Real Telegram publishing stays in GitHub Actions.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Vercel" value={status.isVercel ? "detected" : "not local"} tone={status.isVercel ? "ok" : "dry"} />
        <Metric label="Production" value={status.isProduction ? "yes" : "no"} tone={status.isProduction ? "warn" : "dry"} />
        <Metric label="Auth" value={status.adminAuthEnabled ? "enabled" : "off"} tone={status.adminAuthEnabled ? "ok" : "warn"} />
        <Metric label="JSON store" value={status.jsonStoreWarning ? "warning" : "ok"} tone={status.jsonStoreWarning ? "warn" : "ok"} />
      </section>

      <section className="rounded-lg border border-line bg-panel/82 p-4">
        <h2 className="text-base font-semibold text-white">Readiness</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {checks.map((check) => (
            <StatusRow key={check.label} label={check.label} value={check.value} ok={check.ok} warn={check.warn} />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
          <div className="text-sm leading-6 text-amber-50">
            <p className="font-semibold">Vercel must not publish Telegram posts while storeMode=json.</p>
            <p className="mt-1 text-amber-100/90">
              Use Vercel for phone monitoring and safe dry-run checks. The live publisher remains the hourly GitHub Actions workflow.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <InfoList title="Required Vercel env" icon={LockKeyhole} items={[
          "NEXT_PUBLIC_APP_URL",
          "NEXT_PUBLIC_GITHUB_ACTIONS_URL",
          "ADMIN_AUTH_ENABLED=true",
          "ADMIN_PASSWORD",
          "ADMIN_SESSION_SECRET",
          "ADMIN_SESSION_MAX_AGE_DAYS=14",
        ]} />
        <InfoList title="Next steps" icon={CheckCircle2} items={status.nextSteps} />
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <LinkButton href="/admin/phone-dashboard" icon={Smartphone} label="Phone dashboard" />
        <LinkButton href="/admin/publish-monitor" icon={CheckCircle2} label="Publish monitor" />
        {githubActionsUrl ? (
          <a href={githubActionsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-line bg-panel/82 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100">
            <Github className="h-5 w-5" />
            GitHub Actions
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <div className="rounded-lg border border-line bg-panel/82 p-3 text-sm leading-6 text-slate-400">
            Set NEXT_PUBLIC_GITHUB_ACTIONS_URL for direct Actions link.
          </div>
        )}
      </section>

      <InfoList title="Warnings" icon={AlertTriangle} items={status.warnings} empty="No warnings." />
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "ok" | "warn" | "dry" }) {
  return (
    <div className={cn("min-h-24 rounded-lg border p-3", tone === "ok" && "border-emerald-300/25 bg-emerald-300/10", tone === "warn" && "border-amber-300/25 bg-amber-300/10", tone === "dry" && "border-line bg-panel/82")}>
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-3 break-words text-xl font-semibold leading-tight text-white">{value}</p>
    </div>
  );
}

function StatusRow({ label, value, ok, warn }: { label: string; value: string; ok: boolean; warn?: boolean }) {
  return (
    <div className={cn("rounded-md border px-3 py-2", ok && !warn ? "border-emerald-300/20 bg-emerald-300/10" : warn ? "border-amber-300/25 bg-amber-300/10" : "border-rose-300/25 bg-rose-300/10")}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoList({ title, items, icon: Icon, empty = "No items." }: { title: string; items: string[]; icon: LucideIcon; empty?: string }) {
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

function LinkButton({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-line bg-panel/82 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100">
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
