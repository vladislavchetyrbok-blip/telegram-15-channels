import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import { Activity, AlertTriangle, CalendarClock, CheckCircle2, ChevronLeft, ClipboardList, HeartHandshake, LockKeyhole, MessageSquareText, Rocket, Settings, ShieldCheck, UsersRound, XCircle , Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";

export const dynamic = "force-dynamic";

const operationStatuses = [
  { label: "Daily autopublish", value: "ON / safe", hint: "Ежедневный маршрут активен, live-кнопок на dashboard нет.", icon: CalendarClock, tone: "emerald" },
  { label: "Weekly live", value: "OFF", hint: "Еженедельный live не включён.", icon: XCircle, tone: "slate" },
  { label: "Ledger", value: "protected", hint: "Duplicate protection и safety checks остаются обязательными.", icon: LockKeyhole, tone: "emerald" },
  { label: "Analytics", value: "Redis active in production", hint: "На странице не выводятся URL/token значения.", icon: Activity, tone: "cyan" },
  { label: "Profile sync", value: "OFF", hint: "Локальные profile/history/favorites не синхронизируются на сервер.", icon: XCircle, tone: "slate" },
  { label: "Payments / Stars", value: "OFF", hint: "Платежи и Telegram Stars не включены.", icon: XCircle, tone: "slate" },
  { label: "Exact astro", value: "exact_unavailable", hint: "Только символический формат без точных астрологических обещаний.", icon: ShieldCheck, tone: "amber" },
  { label: "Soft launch", value: "first 5 users GO", hint: "Доступен контролируемый запуск для первых доверенных пользователей.", icon: HeartHandshake, tone: "emerald" },
  { label: "Mass launch", value: "STOP", hint: "Массовый запуск запрещён до feedback и P0/P1 triage.", icon: AlertTriangle, tone: "rose" },
] as const;

const nextSteps = [
  "Invite first 5 users",
  "Watch analytics funnel",
  "Collect feedback",
  "Fix P0/P1",
  "Only then consider 20 users",
];

export default function ZodiacOperationsPage() {
  requireDashboardPageAccess("/dashboard/networks/zodiac/operations");
  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
                <AphroditePageHeader
          title="Операции и безопасность Zodiac"
          description="Управление модулем Зодиак внутри Афродиты."
          badgeText="Зодиак"
          icon={Sparkles}
          safetyLocked={true}
          safetyMessage="Read-only mode"
        />

        <section id="safety" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {operationStatuses.map((status) => (
            <StatusCard key={status.label} {...status} />
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-emerald-900/30 bg-emerald-900/10 p-5 text-emerald-400 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Soft launch: GO только для первых 5</h2>
                <p className="mt-2 text-sm leading-6">
                  Следующий безопасный шаг — небольшой контролируемый запуск, наблюдение за funnel и ручной сбор feedback.
                </p>
              </div>
              <UsersRound className="h-6 w-6 shrink-0" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-100">Что делать дальше</h2>
            <ol className="mt-4 space-y-3">
              {nextSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-sm font-semibold text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-xs text-violet-700">{index + 1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/dashboard/networks/zodiac/feedback" className="inline-flex items-center gap-2 rounded-md border border-emerald-900/30 bg-emerald-900/10 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100">
                <MessageSquareText className="h-4 w-4" />
                Открыть центр отзывов
              </Link>
              <Link href="/dashboard/networks/zodiac/publishing" className="inline-flex items-center gap-2 rounded-md border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100">
                <Rocket className="h-4 w-4" />
                Открыть центр публикаций
              </Link>
              <Link href="/dashboard/networks/zodiac/content" className="inline-flex items-center gap-2 rounded-md border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-100">
                <ClipboardList className="h-4 w-4" />
                Открыть контент
              </Link>
              <Link href="/dashboard/networks/zodiac/security" className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100">
                <LockKeyhole className="h-4 w-4" />
                Открыть безопасность
              </Link>
              <Link href="/dashboard/networks/zodiac/settings" className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">
                <Settings className="h-4 w-4" />
                Настройки окружения
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusCard({ label, value, hint, icon: Icon, tone }: { label: string; value: string; hint: string; icon: LucideIcon; tone: Tone }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-3 text-xl font-semibold text-slate-100">{value}</p>
        </div>
        <span className={`rounded-lg border p-2 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{hint}</p>
    </div>
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
