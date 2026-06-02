import { CheckCircle2, CircleAlert, CircleDashed, Rocket, ShieldCheck } from "lucide-react";
import { requireAdminAccessPlaceholder } from "@/lib/admin-auth";
import { getDeployReadinessStatus } from "@/lib/deploy-readiness";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function DeployReadinessPage() {
  const access = requireAdminAccessPlaceholder();
  const status = getDeployReadinessStatus();

  const checks = [
    { label: "GitHub repo connected", ready: status.repositoryMode === "git" },
    { label: "GitHub Actions workflow exists", ready: status.hasGitHubWorkflow },
    { label: "Telegram bot token required in GitHub Secrets", ready: true, note: "Проверяется в GitHub Secrets, значение не выводится." },
    { label: "JSON store active", ready: status.storeMode === "json" && status.hasJsonStore },
    { label: "Supabase not connected yet", ready: !status.hasSupabaseConfig, tone: "warn" as const },
    { label: "Vercel not connected yet", ready: !status.hasVercelConfig, tone: "warn" as const },
    { label: "Mobile control page exists", ready: status.hasMobileControl },
    { label: "Scheduler dashboard exists", ready: status.hasSchedulerDashboard },
    { label: "Supabase schema exists", ready: status.hasSupabaseSchema },
    { label: "PostgreSQL adapter prepared", ready: status.hasPostgresAdapter },
    { label: "DATABASE_URL configured", ready: status.databaseUrlConfigured, tone: "warn" as const, note: "Only true/false is shown; value is never displayed." },
    { label: "Real publish controlled only via GitHub Secrets", ready: true },
    { label: "Duplicate guard enabled", ready: true, note: "publish:due checks status, telegramMessageId, publishResult and success logs." },
    { label: "Publication logs enabled", ready: status.hasPublicationLogs },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <section className="rounded-lg border border-line bg-panel/82 p-5 shadow-glow">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <Rocket className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Deploy Readiness</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">Готовность к Vercel и управлению с телефона</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Read-only чек-лист перед hosted admin и будущим подключением Supabase/PostgreSQL. Секреты не выводятся, Telegram не вызывается.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Repository" value={status.repositoryMode} ready={status.repositoryMode === "git"} />
        <Metric label="Store" value={status.storeMode} ready={status.storeMode === "json"} />
        <Metric label="Supabase" value={status.hasSupabaseConfig ? "configured" : "not connected"} ready={status.hasSupabaseConfig} warn={!status.hasSupabaseConfig} />
        <Metric label="Vercel" value={status.hasVercelConfig ? "configured" : "not connected"} ready={status.hasVercelConfig} warn={!status.hasVercelConfig} />
        <Metric label="Schema" value={status.hasSupabaseSchema ? "prepared" : "missing"} ready={status.hasSupabaseSchema} />
        <Metric label="Postgres adapter" value={status.hasPostgresAdapter ? "prepared" : "missing"} ready={status.hasPostgresAdapter} />
        <Metric label="DATABASE_URL" value={status.databaseUrlConfigured ? "configured" : "not configured"} ready={status.databaseUrlConfigured} warn={!status.databaseUrlConfigured} />
      </section>

      <section className="rounded-lg border border-line bg-panel/82 p-4">
        <h2 className="text-lg font-semibold text-white">Чек-лист</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {checks.map((check) => (
            <div key={check.label} className={cn("rounded-md border p-3", check.ready ? "border-emerald-300/20 bg-emerald-300/10" : check.tone === "warn" ? "border-amber-300/25 bg-amber-300/10" : "border-rose-300/25 bg-rose-300/10")}>
              <div className="flex items-start gap-2">
                {check.ready ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" /> : check.tone === "warn" ? <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-200" />}
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
        <InfoList title="Warnings" items={status.warnings} empty="Критичных предупреждений нет." />
        <InfoList title="Next steps" items={status.nextSteps} empty="Следующие шаги не найдены." />
      </section>

      <section className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" />
          <div className="space-y-2 text-sm leading-6 text-slate-300">
            <p>Admin auth сейчас placeholder: {access.reason}.</p>
            <p>Перед публичным Vercel-деплоем нужно подключить ADMIN_PASSWORD, NextAuth или basic auth.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, ready, warn = false }: { label: string; value: string; ready: boolean; warn?: boolean }) {
  return (
    <div className={cn("rounded-lg border p-4", ready ? "border-emerald-300/25 bg-emerald-300/10" : warn ? "border-amber-300/25 bg-amber-300/10" : "border-rose-300/25 bg-rose-300/10")}>
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <section className="rounded-lg border border-line bg-panel/82 p-4">
      <h2 className="text-base font-semibold text-white">{title}</h2>
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
