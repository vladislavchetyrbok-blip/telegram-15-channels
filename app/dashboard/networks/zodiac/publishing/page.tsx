import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  CopyCheck,
  LockKeyhole,
  MessageSquareText,
  PlayCircle,
  RadioTower,
  ShieldCheck,
  StopCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ManualPostDraftBuilder } from "@/components/zodiac-platform/ManualPostDraftBuilder";
import { ZodiacPlatformNav } from "@/components/zodiac-platform/ZodiacPlatformNav";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";
import { getZodiacPublishingDashboard, zodiacPublishingCommandHints } from "@/lib/zodiac-platform-publishing";
import { zodiacPlatformChannels } from "@/lib/zodiac-platform-management";

export const dynamic = "force-dynamic";

export default function ZodiacPublishingCenterPage() {
  requireDashboardPageAccess("/dashboard/networks/zodiac/publishing");
  const dashboard = getZodiacPublishingDashboard();

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#f8fafc] px-4 py-6 text-slate-950 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-5">
          <Link href="/dashboard/networks/zodiac" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900">
            <ChevronLeft className="h-4 w-4" />
            Dashboard / Zodiac / Публикации
          </Link>
          <div className="relative overflow-hidden rounded-lg border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400 via-cyan-300 to-amber-300" />
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              <ClipboardList className="h-3.5 w-3.5" />
              Telegram Platform
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Публикации</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  Центр управления ежедневными постами, dry-run проверками, ledger и безопасной подготовкой ручных публикаций.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
                <StopCircle className="h-4 w-4" />
                live publish button: нет
              </span>
            </div>
          </div>
          <ZodiacPlatformNav current="publishing" />
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatusCard title="Ежедневные публикации" value="ON / safe" caption="13 каналов, daily lane" icon={CalendarClock} tone="emerald" />
          <StatusCard title="Weekly live" value="OFF" caption="только dry-run" icon={StopCircle} tone="rose" />
          <StatusCard title="Dry-run" value="безопасно" caption="проверки без Telegram API" icon={PlayCircle} tone="emerald" />
          <StatusCard title="Ledger" value="защищён" caption="duplicate protection" icon={LockKeyhole} tone="cyan" />
          <StatusCard title="Telegram API calls in dry-run" value="0" caption="обязательный контракт" icon={ShieldCheck} tone="emerald" />
          <StatusCard title="Mass launch" value="STOP" caption="до отдельного approval" icon={AlertTriangle} tone="rose" />
        </section>

        <section id="publishing-calendar" data-qa="publishing-calendar-preview" className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Календарь публикаций</h2>
              <p className="mt-1 text-sm text-slate-600">Read-only preview из конфигурации каналов и durable ledger. Telegram API не вызывается.</p>
            </div>
            <span className="w-fit rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              Неделя {dashboard.isoWeek}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {dashboard.calendar.map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                <p className="mt-2 font-mono text-lg font-semibold text-slate-950">{item.dateKey}</p>
                <div className="mt-4 grid gap-2 text-sm">
                  <InfoRow label="expected posts" value={String(item.expectedPosts)} />
                  <InfoRow label="ledger sent" value={String(item.ledgerSent)} />
                  <InfoRow label="ledger missing" value={String(item.ledgerMissing)} />
                </div>
                <p className="mt-4 rounded-md border border-violet-200 bg-white px-3 py-2 text-sm font-semibold text-violet-700">{item.status}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="channel-coverage" data-qa="publishing-channel-coverage" className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Покрытие каналов</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Сводка переиспользует центральный реестр каналов Package 59.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <CoverageMetric label="Всего каналов" value={dashboard.channelCoverage.totalChannels} />
              <CoverageMetric label="Активные каналы" value={dashboard.channelCoverage.activeChannels} />
              <CoverageMetric label="С навигацией" value={dashboard.channelCoverage.channelsWithNavigation} />
              <CoverageMetric label="С описаниями" value={dashboard.channelCoverage.channelsWithDescriptions} />
              <CoverageMetric label="Daily publishing" value={dashboard.channelCoverage.channelsWithDailyPublishing} />
              <CoverageMetric label="Missing config" value={dashboard.channelCoverage.missingConfig} />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Каналы daily lane</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {zodiacPlatformChannels.map((channel) => (
                <div key={channel.slug} className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
                  <span className="min-w-0 truncate text-sm font-semibold text-slate-700">
                    {channel.icon} {channel.title}
                  </span>
                  <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">daily</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="safe-checks" data-qa="publishing-dry-run-helper" className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Безопасные проверки</h2>
            <p className="mt-1 text-sm text-slate-600">Командные подсказки только для ручного запуска в терминале. UI их не исполняет.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {zodiacPublishingCommandHints.map((item) => (
              <CommandCard key={item.command} {...item} />
            ))}
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            Live-команды не являются dashboard action. Любой live publish требует отдельного explicit approval и approved process вне этой страницы.
          </div>
        </section>

        <ManualPostDraftBuilder
          todayDateKey={dashboard.dateKey}
          channels={zodiacPlatformChannels.map((channel) => ({ slug: channel.slug, title: channel.title, icon: channel.icon }))}
        />

        <section id="publishing-safety" data-qa="publishing-ledger-safety" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Безопасность публикаций</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Ledger защищает от дублей. Dry-run должен показывать 0 Telegram API calls и 0 ledger writes. Weekly live выключен, mass launch остановлен, live publish требует отдельного явного approval.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              dry-run first
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <SafetyBadge label="Ledger" value="protected" tone="emerald" />
            <SafetyBadge label="Dry-run API calls" value="0" tone="emerald" />
            <SafetyBadge label="Dry-run ledger writes" value="0" tone="emerald" />
            <SafetyBadge label="Weekly live" value="OFF" tone="rose" />
            <SafetyBadge label="Mass launch" value="STOP" tone="rose" />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard/networks/zodiac/feedback" className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100">
              <MessageSquareText className="h-4 w-4" />
              Открыть центр отзывов
            </Link>
            <Link href="/dashboard/networks/zodiac/content" className="inline-flex items-center gap-2 rounded-md border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-100">
              <ClipboardList className="h-4 w-4" />
              Открыть контент
            </Link>
            <Link href="/dashboard/networks/zodiac/security" className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100">
              <LockKeyhole className="h-4 w-4" />
              Открыть безопасность
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusCard({ title, value, caption, icon: Icon, tone }: { title: string; value: string; caption: string; icon: LucideIcon; tone: Tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
          <p className="mt-3 text-xl font-semibold text-slate-950">{value}</p>
          <p className="mt-1 text-sm text-slate-600">{caption}</p>
        </div>
        <span className={`rounded-lg border p-2 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function CoverageMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function CommandCard({ title, command, note }: { title: string; command: string; note: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-950">{title}</h3>
        <CopyCheck className="h-4 w-4 shrink-0 text-violet-700" />
      </div>
      <code className="mt-3 block rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800">{command}</code>
      <p className="mt-3 text-sm leading-5 text-slate-600">{note}</p>
    </div>
  );
}

function SafetyBadge({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-75">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

type Tone = "emerald" | "cyan" | "amber" | "rose";

const toneClasses: Record<Tone, string> = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
};
