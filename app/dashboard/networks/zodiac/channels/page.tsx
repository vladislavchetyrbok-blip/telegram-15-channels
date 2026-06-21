import { AphroditePageHeader } from "@/components/AphroditePageHeader";
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
  Smartphone, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { NewChannelDraftBuilder } from "@/components/zodiac-platform/NewChannelDraftBuilder";

import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";
import { zodiacPlatformChannels, zodiacPlatformSummary, type ZodiacPlatformRisk } from "@/lib/zodiac-platform-management";

export const dynamic = "force-dynamic";

export default function ZodiacChannelsManagementPage() {
  requireDashboardPageAccess("/dashboard/networks/zodiac/channels");
  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
                <AphroditePageHeader
          title="Каналы Зодиака"
          description="Управление модулем Зодиак внутри Афродиты."
          badgeText="Зодиак"
          icon={Sparkles}
          safetyLocked={true}
          safetyMessage="Read-only mode"
        />

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

        <section data-qa="zodiac-channel-manager" className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Текущая сеть 13 каналов</h2>
              <p className="mt-1 text-sm text-slate-400">Таблица не меняет Telegram и не пишет в ledger. Все live-шаги остаются ручным approval.</p>
            </div>
            <span className="w-fit rounded-md border border-slate-800 bg-[#070b14] px-3 py-2 text-sm font-semibold text-slate-400">13/13 видимы</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full border-collapse text-left text-sm" data-qa="zodiac-channel-table">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
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
                  <tr key={channel.slug} className="border-b border-slate-800 align-top last:border-0">
                    <td className="px-3 py-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-lg text-violet-400">
                          {channel.icon}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-100">{channel.title}</p>
                          <p className="mt-1 text-xs text-slate-400">{channel.topic}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 font-mono text-xs font-semibold text-slate-400">{channel.slug}</td>
                    <td className="px-3 py-4 font-semibold text-slate-400">{channel.language}</td>
                    <td className="px-3 py-4">
                      {channel.telegramUrl ? (
                        <a href={channel.telegramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-violet-400 hover:text-violet-300">
                          {channel.telegramHandle}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="text-slate-400">не указан</span>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <a href={channel.miniAppUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-violet-400 hover:text-violet-300">
                        {channel.miniAppStartapp}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                    <td className="px-3 py-4 text-slate-400">{channel.navigationStatus}</td>
                    <td className="px-3 py-4 text-slate-400">{channel.descriptionStatus}</td>
                    <td className="px-3 py-4 text-slate-400">{channel.dailyPublishingStatus}</td>
                    <td className="px-3 py-4 text-slate-400">{channel.analyticsStatus}</td>
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
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-100">{value}</p>
          <p className="mt-1 text-sm font-medium text-slate-400">{caption}</p>
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
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 text-sm leading-5 text-slate-400">Командная подсказка, live API из UI не вызывается.</p>
      <code className="mt-3 block rounded-md border border-slate-800 bg-[#070b14] px-3 py-2 text-xs font-semibold text-slate-400">{command}</code>
    </div>
  );
}

function ActionLink({ href, title, icon: Icon }: { href: string; title: string; icon: LucideIcon }) {
  return (
    <Link href={href} prefetch={false} className="group rounded-lg border border-slate-800 bg-slate-900/50 p-4 shadow-sm transition hover:border-violet-500/50 hover:shadow-md">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-400">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 font-semibold text-slate-100 group-hover:text-violet-300">{title}</h3>
      <p className="mt-1 text-sm leading-5 text-slate-400">Безопасный переход, без live-публикации.</p>
    </Link>
  );
}

function RiskBadge({ risk, label }: { risk: ZodiacPlatformRisk; label: string }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${riskClasses[risk]}`}>{label}</span>;
}

type Tone = "violet" | "cyan" | "emerald" | "amber" | "slate";

const toneClasses: Record<Tone, string> = {
  violet: "border-violet-500/20 bg-violet-500/10 text-violet-400",
  cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
  emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  slate: "border-slate-800 bg-[#070b14] text-slate-400",
};

const riskClasses: Record<ZodiacPlatformRisk, string> = {
  ok: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  watch: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  blocked: "border-rose-500/20 bg-rose-500/10 text-rose-400",
};
