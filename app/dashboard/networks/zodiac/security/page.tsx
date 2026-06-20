import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import { AlertTriangle, CheckCircle2, ChevronLeft, ClipboardList, DatabaseZap, LockKeyhole, RadioTower, ShieldCheck, StopCircle, UsersRound, XCircle , Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { AdminSafetyWorkspace } from "@/components/zodiac-platform/AdminSafetyWorkspace";

import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";

export const dynamic = "force-dynamic";

const safetyStatuses = [
  { label: "Live publish", value: "запрещён", icon: StopCircle, tone: "rose" },
  { label: "Weekly live", value: "OFF", icon: XCircle, tone: "slate" },
  { label: "Payments/Stars", value: "OFF", icon: XCircle, tone: "slate" },
  { label: "Profile sync", value: "OFF", icon: XCircle, tone: "slate" },
  { label: "Exact astro", value: "symbolic only / exact_unavailable", icon: ShieldCheck, tone: "amber" },
  { label: "Ledger", value: "protected", icon: LockKeyhole, tone: "emerald" },
  { label: "Dry-run API calls", value: "0 expected", icon: CheckCircle2, tone: "emerald" },
  { label: "Redis analytics", value: "active in production", icon: DatabaseZap, tone: "cyan" },
  { label: "Mass launch", value: "STOP", icon: AlertTriangle, tone: "rose" },
] as const;

const approvalRows = [
  { action: "Daily dry-run", status: "allowed", approval: "no", ui: "command hint only" },
  { action: "Daily live publish", status: "blocked", approval: "explicit owner approval", ui: "no UI button" },
  { action: "Weekly live", status: "OFF", approval: "explicit owner approval", ui: "no UI button" },
  { action: "Payments/Stars", status: "OFF", approval: "product + legal + technical approval", ui: "no UI button" },
  { action: "Profile sync writes", status: "OFF", approval: "privacy approval", ui: "no UI button" },
  { action: "Exact astro provider", status: "unavailable", approval: "provider + accuracy approval", ui: "no UI button" },
  { action: "Add new channel", status: "draft-only", approval: "manual config review", ui: "local draft only" },
  { action: "Manual post", status: "draft-only", approval: "manual publish process", ui: "local draft only" },
] as const;

const roleRows = [
  { role: "Owner", scope: "live approval only" },
  { role: "Admin", scope: "approve config changes after auth exists" },
  { role: "Editor", scope: "prepare drafts only" },
  { role: "Viewer", scope: "read analytics/docs/status" },
] as const;

export default function ZodiacSecurityPage() {
  const authStatus = requireDashboardPageAccess("/dashboard/networks/zodiac/security");
  const authStatusCards = [
    { label: "Dashboard auth", value: authStatus.authEnabled ? "enabled" : "disabled", icon: LockKeyhole, tone: authStatus.authEnabled ? "emerald" : "amber" },
    { label: "Auth configured", value: authStatus.configured ? "yes" : "no", icon: ShieldCheck, tone: authStatus.configured ? "emerald" : authStatus.authEnabled ? "rose" : "amber" },
    { label: "Session cookie", value: authStatus.sessionCookie, icon: LockKeyhole, tone: "cyan" },
    { label: "Server write API", value: "disabled", icon: XCircle, tone: "slate" },
    { label: "Roles", value: "planned", icon: UsersRound, tone: "slate" },
  ] as const;

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
                <AphroditePageHeader
          title="Безопасность платформы"
          description="Управление модулем Зодиак внутри Афродиты."
          badgeText="Зодиак"
          icon={Sparkles}
          safetyLocked={true}
          safetyMessage="Read-only mode"
        />

        <section data-qa="admin-safety-status-cards" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {safetyStatuses.map((status) => (
            <StatusCard key={status.label} {...status} />
          ))}
        </section>

        <section data-qa="dashboard-auth-status-cards" className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Dashboard Auth</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Env-controlled passcode gate РґР»СЏ owner dashboard. Р­С‚Рѕ РЅРµ role system Рё РЅРµ server write API РґР»СЏ РїР»Р°С‚С„РѕСЂРјРµРЅРЅС‹С… РґР°РЅРЅС‹С….
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800">
              <LockKeyhole className="h-4 w-4" />
              httpOnly session, 12h
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {authStatusCards.map((status) => (
              <StatusCard key={status.label} {...status} />
            ))}
          </div>

          <div className={`rounded-lg border p-4 text-sm font-semibold leading-6 ${authStatus.authEnabled ? "border-emerald-900/30 bg-emerald-900/10 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-950"}`}>
            {authStatus.authEnabled
              ? "Dashboard protected by passcode session."
              : "Auth disabled: acceptable for local development, not recommended before wider production access."}
          </div>
        </section>

        <section data-qa="approval-matrix" className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Approval Matrix</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Матрица показывает, какие действия допустимы в dashboard. Live-действия остаются без кнопок и требуют отдельного owner approval.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-900/30 bg-emerald-900/10 px-3 py-2 text-sm font-semibold text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              no server write API
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-3 py-3">Action</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Approval</th>
                  <th className="px-3 py-3">UI</th>
                </tr>
              </thead>
              <tbody>
                {approvalRows.map((row) => (
                  <tr key={row.action} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-4 font-semibold text-slate-100">{row.action}</td>
                    <td className="px-3 py-4 text-slate-700">{row.status}</td>
                    <td className="px-3 py-4 text-slate-700">{row.approval}</td>
                    <td className="px-3 py-4 text-slate-700">{row.ui}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <AdminSafetyWorkspace />

        <section data-qa="roles-auth-readiness" className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Будущие роли</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Роли описывают будущую authenticated admin backend модель. Сейчас они только readiness-контракт, без write-действий.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800">
              <UsersRound className="h-4 w-4" />
              role checks required before writes
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {roleRows.map((row) => (
              <div key={row.role} className="rounded-lg border border-slate-800 bg-slate-50 p-4">
                <p className="text-lg font-semibold text-slate-100">{row.role}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{row.scope}</p>
              </div>
            ))}
          </div>

          <div data-qa="admin-safety-no-server-write-api" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-950">
            Сейчас server write API intentionally disabled. Перед включением write-действий нужен authenticated admin backend, audit log and role checks.
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-4">
          <SafetyLink href="/dashboard/networks/zodiac/channels" title="Каналы" caption="Draft-only добавление канала и ручная проверка config." icon={RadioTower} />
          <SafetyLink href="/dashboard/networks/zodiac/content" title="Контент" caption="Local-only шаблоны, рубрики и Template Studio без server writes." icon={ClipboardList} />
          <SafetyLink href="/dashboard/networks/zodiac/publishing" title="Публикации" caption="Dry-run подсказки, ledger protection и no live button." icon={ClipboardList} />
          <SafetyLink href="/dashboard/networks/zodiac/feedback" title="Отзывы" caption="Sanitized feedback и P0/P1 triage перед расширением." icon={ShieldCheck} />
          <SafetyLink href="/dashboard/networks/zodiac/settings" title="Настройки" caption="Контроль окружения и readiness без write-доступа." icon={ShieldCheck} />
        </section>
      </div>
    </div>
  );
}

function StatusCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: LucideIcon; tone: Tone }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
          <p className="mt-3 text-xl font-semibold text-slate-100">{value}</p>
          <p className="mt-1 text-sm text-slate-400">
            {label}: {value}
          </p>
        </div>
        <span className={`rounded-lg border p-2 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function SafetyLink({ href, title, caption, icon: Icon }: { href: string; title: string; caption: string; icon: LucideIcon }) {
  return (
    <Link href={href} prefetch={false} className="group rounded-lg border border-slate-800 bg-slate-900/50 p-4 shadow-sm transition hover:border-violet-200 hover:shadow-md">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-700">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 font-semibold text-slate-100 group-hover:text-violet-900">{title}</h3>
      <p className="mt-1 text-sm leading-5 text-slate-400">{caption}</p>
    </Link>
  );
}

type Tone = "emerald" | "cyan" | "amber" | "rose" | "slate";

const toneClasses: Record<Tone, string> = {
  emerald: "border-emerald-900/30 bg-emerald-900/10 text-emerald-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-900/30 bg-rose-900/10 text-rose-700",
  slate: "border-slate-800 bg-slate-50 text-slate-700",
};
