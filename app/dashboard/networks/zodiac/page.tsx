import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  Compass,
  FileText,
  HeartHandshake,
  Rocket,
  Settings,
  ShieldCheck,
  Sparkles,
  SunMedium,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type Tone = "violet" | "cyan" | "emerald" | "amber" | "coral" | "slate";

const toneClasses: Record<Tone, string> = {
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  coral: "border-rose-200 bg-rose-50 text-rose-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};

export default function ZodiacNetworkWorkspacePage() {
  const analyticsStorage = process.env.ZODIAC_ANALYTICS_REDIS_URL && process.env.ZODIAC_ANALYTICS_REDIS_TOKEN ? "redis" : "noop";

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#f8fafc] px-4 py-6 text-slate-950 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-5">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900">
            <ChevronLeft className="h-4 w-4" />
            Назад к пульту
          </Link>
          <div className="relative overflow-hidden rounded-lg border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-cyan-50 p-6 shadow-sm sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400 via-cyan-300 to-amber-300" />
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              <Sparkles className="h-3.5 w-3.5" />
              active network
            </p>
            <h1 className="mt-5 break-words text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">🔮 Знаки зодиака</h1>
            <p className="mt-3 max-w-3xl break-words text-base leading-7 text-slate-600">
              Рабочая панель сети гороскопов: 13 каналов.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <StatusBadge label="Daily autopilot" value="ON" tone="emerald" />
              <StatusBadge label="Weekly live" value="OFF" tone="slate" />
              <StatusBadge label="Payments/Stars" value="OFF" tone="slate" />
              <StatusBadge label="Analytics" value={analyticsStorage} tone={analyticsStorage === "redis" ? "emerald" : "amber"} />
              <StatusBadge label="Profile sync" value="OFF" tone="slate" />
              <StatusBadge label="Exact astro" value="exact_unavailable" tone="amber" />
              <StatusBadge label="Controlled soft launch" value="GO" tone="emerald" />
            </div>

            {analyticsStorage === "noop" && (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <p className="text-sm font-medium leading-5 text-amber-800">
                    Аналитика подключена к интерфейсу, но Redis storage пока не активен.<br />
                    Добавьте ZODIAC_ANALYTICS_REDIS_URL и ZODIAC_ANALYTICS_REDIS_TOKEN, затем redeploy.
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950">Быстрые действия</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            <QuickActionButton href="/channels/zodiac" icon={Compass} label="Открыть Mini App" />
            <QuickActionButton href="/dashboard/networks/zodiac/analytics" icon={Activity} label="Открыть аналитику" highlight={true} />
            <QuickActionButton href="/publishing-center" icon={Rocket} label="Проверить публикации" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950">Операционная безопасность</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SafetyCard label="Daily autopublish" value="ON" icon={SunMedium} tone="emerald" />
            <SafetyCard label="Weekly live" value="OFF" icon={CalendarClock} tone="slate" />
            <SafetyCard label="Manual live" value="requires approval" icon={ShieldCheck} tone="amber" />
            <SafetyCard label="Ledger safety" value="PASS" icon={CheckCircle2} tone="emerald" />
            <SafetyCard label="Redis analytics" value={analyticsStorage} icon={Activity} tone={analyticsStorage === "redis" ? "emerald" : "amber"} />
            <SafetyCard label="Soft launch" value="first 5 users allowed" icon={HeartHandshake} tone="cyan" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950">Рекомендованные шаги</h2>
          <div className="rounded-lg border border-violet-200 bg-violet-50 p-6 shadow-sm">
            <ol className="list-inside list-decimal space-y-2 text-sm font-medium text-violet-900">
              <li>Проверить Mini App на телефоне</li>
              <li>Дать первым 5 пользователям</li>
              <li>Подключить Redis analytics</li>
              <li>Собрать feedback</li>
              <li>Не включать weekly/payments пока</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusBadge({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  const bg = tone === "emerald" ? "bg-emerald-100 text-emerald-800" : tone === "amber" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${bg}`}>
      <span className="opacity-75">{label}:</span>
      <span className="font-bold uppercase">{value}</span>
    </span>
  );
}

function QuickActionButton({ href, icon: Icon, label, highlight }: { href: string; icon: LucideIcon; label: string; highlight?: boolean }) {
  return (
    <Link href={href} className={`group flex flex-col items-center justify-center gap-3 rounded-lg border p-4 text-center shadow-sm transition hover:shadow-md ${highlight ? "border-violet-300 bg-violet-50 hover:border-violet-400" : "border-slate-200 bg-white hover:border-violet-200"}`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${highlight ? "border-violet-200 bg-violet-100 text-violet-700 group-hover:bg-violet-200" : "border-cyan-100 bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100 group-hover:text-cyan-700"}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-slate-950 group-hover:text-violet-900">{label}</span>
    </Link>
  );
}

function SafetyCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: LucideIcon; tone: Tone }) {
  return (
    <div className={`flex items-center gap-4 rounded-lg border p-4 shadow-sm ${toneClasses[tone]}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/60">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-75">{label}</p>
        <p className="mt-0.5 font-bold uppercase">{value}</p>
      </div>
    </div>
  );
}
