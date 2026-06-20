import {
  Activity,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  ExternalLink,
  FileText,
  LockKeyhole,
  PlayCircle,
  RadioTower,
  Rocket,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { NewChannelDraftBuilder } from "@/components/zodiac-platform/NewChannelDraftBuilder";
import { ZodiacPlatformNav } from "@/components/zodiac-platform/ZodiacPlatformNav";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";
import { zodiacPlatformChannels, zodiacPlatformSummary, type ZodiacPlatformRisk } from "@/lib/zodiac-platform-management";

export const dynamic = "force-dynamic";

export default function ZodiacChannelsManagementPage() {
  requireDashboardPageAccess("/dashboard/networks/zodiac/channels");
  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#f8fafc] px-4 py-6 text-slate-950 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-5">
          <Link href="/dashboard/networks/zodiac" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900">
            <ChevronLeft className="h-4 w-4" />
            Dashboard / Zodiac / Каналы
          </Link>
          <div className="relative overflow-hidden rounded-lg border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400 via-cyan-300 to-amber-300" />
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              <RadioTower className="h-3.5 w-3.5" />
              Telegram Platform
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Управление каналами Zodiac</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  Read-only консоль для 13 каналов Zodiac: ссылки, startapp, навигация, описания, публикации, аналитика и безопасное добавление новых каналов через локальный черновик.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                live API не вызывается
              </span>
            </div>
          </div>
          <ZodiacPlatformNav current="channels" />
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard title="Всего каналов" value={zodiacPlatformSummary.totalChannels} caption="текущая сеть Zodiac" icon={RadioTower} tone="violet" />
          <MetricCard title="Навигация" value={`${zodiacPlatformSummary.navigationReady}/13`} caption="dry-run готов" icon={PlayCircle} tone="cyan" />
          <MetricCard title="Описания" value={`${zodiacPlatformSummary.descriptionsReady}/13`} caption="готово к ручному live" icon={FileText} tone="emerald" />
          <MetricCard title="Публикации" value={`${zodiacPlatformSummary.publishingReady}/13`} caption="daily ON, ledger protected" icon={ClipboardList} tone="amber" />
          <MetricCard title="Проблемы" value={zodiacPlatformSummary.problems} caption="красных статусов нет" icon={CheckCircle2} tone="slate" />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-8">
          <CommandHint title="Проверить навигацию" command="npm run zodiac:navigation:all:dry" icon={PlayCircle} />
          <CommandHint title="Проверить описания" command="npm run zodiac:descriptions:dry" icon={FileText} />
          <ActionLink href="/dashboard/networks/zodiac/publishing" title="Открыть публикации" icon={Rocket} />
          <ActionLink href="/dashboard/networks/zodiac/analytics" title="Открыть аналитику" icon={Activity} />
          <ActionLink href="/compatibility" title="Открыть Mini App" icon={Smartphone} />
          <ActionLink href="/dashboard/networks/zodiac/content" title="Контент" icon={ClipboardList} />
          <ActionLink href="/dashboard/networks/zodiac/security" title="Безопасность" icon={LockKeyhole} />
          <ActionLink href="/dashboard/networks/zodiac/docs" title="Документация по каналам" icon={FileText} />
        </section>

        <section data-qa="zodiac-channel-manager" className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Текущая сеть 13 каналов</h2>
              <p className="mt-1 text-sm text-slate-600">Таблица не меняет Telegram и не пишет в ledger. Все live-шаги остаются ручным approval.</p>
            </div>
            <span className="w-fit rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">13/13 видимы</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full border-collapse text-left text-sm" data-qa="zodiac-channel-table">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-3 py-3">Канал</th>
                  <th className="px-3 py-3">Slug</th>
                  <th className="px-3 py-3">Язык</th>
                  <th className="px-3 py-3">Telegram</th>
                  <th className="px-3 py-3">Mini App startapp</th>
                  <th className="px-3 py-3">Навигация</th>
                  <th className="px-3 py-3">Описание</th>
                  <th className="px-3 py-3">Публикации</th>
                  <th className="px-3 py-3">Аналитика</th>
                  <th className="px-3 py-3">Риск</th>
                </tr>
              </thead>
              <tbody>
                {zodiacPlatformChannels.map((channel) => (
                  <tr key={channel.slug} className="border-b border-slate-100 align-top last:border-0">
                    <td className="px-3 py-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-100 bg-violet-50 text-lg text-violet-700">
                          {channel.icon}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-950">{channel.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{channel.topic}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 font-mono text-xs font-semibold text-slate-700">{channel.slug}</td>
                    <td className="px-3 py-4 font-semibold text-slate-700">{channel.language}</td>
                    <td className="px-3 py-4">
                      {channel.telegramUrl ? (
                        <a href={channel.telegramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-violet-700 hover:text-violet-900">
                          {channel.telegramHandle}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="text-slate-400">не указан</span>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <a href={channel.miniAppUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-violet-700 hover:text-violet-900">
                        {channel.miniAppStartapp}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                    <td className="px-3 py-4 text-slate-600">{channel.navigationStatus}</td>
                    <td className="px-3 py-4 text-slate-600">{channel.descriptionStatus}</td>
                    <td className="px-3 py-4 text-slate-600">{channel.dailyPublishingStatus}</td>
                    <td className="px-3 py-4 text-slate-600">{channel.analyticsStatus}</td>
                    <td className="px-3 py-4"><RiskBadge risk={channel.risk} label={channel.riskLabel} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <NewChannelDraftBuilder existingSlugs={zodiacPlatformChannels.map((channel) => channel.slug)} />
      </div>
    </div>
  );
}

function MetricCard({ title, value, caption, icon: Icon, tone }: { title: string; value: string | number; caption: string; icon: LucideIcon; tone: Tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
          <p className="mt-1 text-sm font-medium text-slate-600">{caption}</p>
        </div>
        <span className={`rounded-lg border p-2 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function CommandHint({ title, command, icon: Icon }: { title: string; command: string; icon: LucideIcon }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-700">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm leading-5 text-slate-500">Командная подсказка, live API из UI не вызывается.</p>
      <code className="mt-3 block rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">{command}</code>
    </div>
  );
}

function ActionLink({ href, title, icon: Icon }: { href: string; title: string; icon: LucideIcon }) {
  return (
    <Link href={href} prefetch={false} className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-violet-200 hover:shadow-md">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-700">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 font-semibold text-slate-950 group-hover:text-violet-900">{title}</h3>
      <p className="mt-1 text-sm leading-5 text-slate-500">Безопасный переход, без live-публикации.</p>
    </Link>
  );
}

function RiskBadge({ risk, label }: { risk: ZodiacPlatformRisk; label: string }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${riskClasses[risk]}`}>{label}</span>;
}

type Tone = "violet" | "cyan" | "emerald" | "amber" | "slate";

const toneClasses: Record<Tone, string> = {
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};

const riskClasses: Record<ZodiacPlatformRisk, string> = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-700",
  watch: "border-amber-200 bg-amber-50 text-amber-700",
  blocked: "border-rose-200 bg-rose-50 text-rose-700",
};
