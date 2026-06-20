import { Activity, AlertTriangle, CalendarClock, CheckCircle2, ChevronLeft, HeartHandshake, LockKeyhole, ShieldCheck, UsersRound, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ZodiacPlatformNav } from "@/components/zodiac-platform/ZodiacPlatformNav";

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
  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#f8fafc] px-4 py-6 text-slate-950 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-5">
          <Link href="/dashboard/networks/zodiac" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900">
            <ChevronLeft className="h-4 w-4" />
            Dashboard / Zodiac / Soft Launch
          </Link>
          <div className="relative overflow-hidden rounded-lg border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400 via-cyan-300 to-amber-300" />
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              безопасность запуска
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Операции и безопасность Zodiac</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  Сводка для владельца: что включено, что остановлено и какие действия допустимы перед расширением soft launch.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
                <AlertTriangle className="h-4 w-4" />
                mass launch STOP
              </span>
            </div>
          </div>
          <ZodiacPlatformNav current="operations" />
        </header>

        <section id="safety" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {operationStatuses.map((status) => (
            <StatusCard key={status.label} {...status} />
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 shadow-sm">
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

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Что делать дальше</h2>
            <ol className="mt-4 space-y-3">
              {nextSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-sm font-semibold text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-xs text-violet-700">{index + 1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusCard({ label, value, hint, icon: Icon, tone }: { label: string; value: string; hint: string; icon: LucideIcon; tone: Tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-3 text-xl font-semibold text-slate-950">{value}</p>
        </div>
        <span className={`rounded-lg border p-2 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{hint}</p>
    </div>
  );
}

type Tone = "emerald" | "cyan" | "amber" | "rose" | "slate";

const toneClasses: Record<Tone, string> = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};
