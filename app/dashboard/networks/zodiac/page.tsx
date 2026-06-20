import {
  Activity,
  BarChart3,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  HeartHandshake,
  ListPlus,
  LockKeyhole,
  MessageSquareText,
  RadioTower,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ZodiacPlatformNav } from "@/components/zodiac-platform/ZodiacPlatformNav";
import { getUnifiedSystemStatus } from "@/lib/unified-system-status";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";
import { zodiacPlatformSummary } from "@/lib/zodiac-platform-management";

export const dynamic = "force-dynamic";

const platformSections = [
  {
    title: "Каналы",
    href: "/dashboard/networks/zodiac/channels",
    icon: RadioTower,
    caption: "13 каналов Zodiac, Telegram handles, startapp, статусы навигации и описаний.",
    tone: "violet",
  },
  {
    title: "Mini App",
    href: "/compatibility",
    icon: Smartphone,
    caption: "Проверка пользовательского входа без изменения Telegram-каналов.",
    tone: "cyan",
  },
  {
    title: "Бот / startapp",
    href: "/dashboard/networks/zodiac/channels",
    icon: Bot,
    caption: "startapp=compat, compat_{slug}, mystic, birth_matrix, vip и другие deep links.",
    tone: "emerald",
  },
  {
    title: "Контент",
    href: "/dashboard/networks/zodiac/content",
    icon: FileText,
    caption: "Шаблоны, рубрики, CTA/startapp preview и local-only Template Studio.",
    tone: "violet",
  },
  {
    title: "Публикации",
    href: "/dashboard/networks/zodiac/publishing",
    icon: Rocket,
    caption: "Ежедневный маршрут, dry-run и безопасная проверка расписания.",
    tone: "amber",
  },
  {
    title: "Аналитика",
    href: "/dashboard/networks/zodiac/analytics",
    icon: BarChart3,
    caption: "Privacy-safe counters, funnel первых пользователей и Redis production status.",
    tone: "violet",
  },
  {
    title: "Отзывы",
    href: "/dashboard/networks/zodiac/feedback",
    icon: MessageSquareText,
    caption: "Local-only sanitized feedback, P0/P1 triage и real phone QA evidence.",
    tone: "emerald",
  },
  {
    title: "Soft Launch",
    href: "/dashboard/networks/zodiac/operations",
    icon: HeartHandshake,
    caption: "Первые 5 пользователей: GO. Массовый запуск: STOP.",
    tone: "cyan",
  },
  {
    title: "Безопасность",
    href: "/dashboard/networks/zodiac/security",
    icon: LockKeyhole,
    caption: "Ledger protected, weekly live OFF, payments OFF, profile sync OFF.",
    tone: "emerald",
  },
  {
    title: "Документы",
    href: "/dashboard/networks/zodiac/docs",
    icon: FileText,
    caption: "Runbooks, platform map, UX audit, readiness и handoff.",
    tone: "slate",
  },
  {
    title: "Добавить канал",
    href: "/dashboard/networks/zodiac/channels#new-channel-draft-builder",
    icon: ListPlus,
    caption: "LocalStorage builder: config snippet, checklist, без server-side write API.",
    tone: "amber",
  },
] as const;

export default async function ZodiacNetworkWorkspacePage() {
  requireDashboardPageAccess("/dashboard/networks/zodiac");
  const status = await getUnifiedSystemStatus();
  const analyticsStorage = process.env.ZODIAC_ANALYTICS_REDIS_URL && process.env.ZODIAC_ANALYTICS_REDIS_TOKEN ? "Redis активен" : "локальный noop-режим";
  const attentionCount = status.autopublish.failedToday + status.autopublish.blockedToday + status.content.blocked + zodiacPlatformSummary.problems;

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#f8fafc] px-4 py-6 text-slate-950 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-5">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900">
            <ChevronLeft className="h-4 w-4" />
            Dashboard / Zodiac / Обзор
          </Link>
          <div className="relative overflow-hidden rounded-lg border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400 via-cyan-300 to-amber-300" />
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              <Sparkles className="h-3.5 w-3.5" />
              Telegram Platform
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Обзор управления Zodiac</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  Админ-консоль владельца для каналов, Mini App, startapp, публикаций, аналитики, soft launch, safety/ledger и документации.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:w-96">
                <StatusPill label="Daily autopublish" value="ON / safe" tone="emerald" />
                <StatusPill label="Mass launch" value="STOP" tone="rose" />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <StatusBadge label="Каналы" value={`${zodiacPlatformSummary.totalChannels}/13`} tone="violet" />
              <StatusBadge label="Навигация" value={`${zodiacPlatformSummary.navigationReady}/13`} tone="cyan" />
              <StatusBadge label="Описания" value={`${zodiacPlatformSummary.descriptionsReady}/13`} tone="emerald" />
              <StatusBadge label="Аналитика" value={analyticsStorage} tone={analyticsStorage === "Redis активен" ? "emerald" : "amber"} />
              <StatusBadge label="Weekly live" value="OFF" tone="slate" />
              <StatusBadge label="Payments/Stars" value="OFF" tone="slate" />
              <StatusBadge label="Profile sync" value="OFF" tone="slate" />
              <StatusBadge label="Exact astro" value="exact_unavailable" tone="amber" />
            </div>
          </div>
          <ZodiacPlatformNav current="overview" />
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OperatorCard title="Каналы" value={zodiacPlatformSummary.totalChannels} caption="активная сеть Zodiac" details={["general + 12 знаков", "handles доступны", "startapp links готовы"]} icon={RadioTower} tone="violet" />
          <OperatorCard title="Публикации сегодня" value={`${status.autopublish.publishedToday}/13`} caption="операторский счётчик" details={["daily ON", "backup 09:30", "live из UI нет"]} icon={CalendarClock} tone="cyan" />
          <OperatorCard title="Требует внимания" value={attentionCount} caption={attentionCount > 0 ? "есть пункты для проверки" : "красных пунктов нет"} details={[`failed: ${status.autopublish.failedToday}`, `blocked: ${status.autopublish.blockedToday}`, `channel risks: ${zodiacPlatformSummary.problems}`]} icon={ShieldCheck} tone={attentionCount > 0 ? "amber" : "emerald"} />
          <OperatorCard title="Soft launch" value="GO" caption="первые 5 пользователей" details={["watch funnel", "collect feedback", "20 users позже"]} icon={HeartHandshake} tone="emerald" />
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Разделы управления</h2>
              <p className="mt-1 text-sm text-slate-600">Каждая карточка ведёт на существующую страницу или на безопасный read-only раздел.</p>
            </div>
            <Link href="/dashboard/networks/zodiac/channels" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900">
              Открыть управление каналами
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {platformSections.map((section) => (
              <PlatformSectionCard key={section.title} {...section} />
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Управление автономно, live вручную</h2>
                <p className="mt-2 text-sm leading-6">
                  Dashboard показывает состояние, команды dry-run и документы. Он не публикует navigation/descriptions live, не включает weekly live и не пишет в ledger.
                </p>
              </div>
              <CheckCircle2 className="h-6 w-6 shrink-0" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Следующие безопасные действия</h2>
            <ol className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
              <li>1. Пригласить первых 5 доверенных пользователей.</li>
              <li>2. Смотреть funnel в аналитике Mini App.</li>
              <li>3. Собрать feedback и исправить P0/P1.</li>
              <li>4. Только после этого рассмотреть группу из 20 пользователей.</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}

function PlatformSectionCard({ title, href, icon: Icon, caption, tone }: { title: string; href: string; icon: LucideIcon; caption: string; tone: Tone }) {
  return (
    <Link href={href} prefetch={false} className="group flex min-h-40 items-start gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${toneClasses[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-slate-950 group-hover:text-violet-900">{title}</span>
        <span className="mt-2 block text-sm leading-6 text-slate-600">{caption}</span>
      </span>
    </Link>
  );
}

function OperatorCard({
  title,
  value,
  caption,
  details,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string | number;
  caption: string;
  details: string[];
  icon: LucideIcon;
  tone: Tone;
}) {
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
      <div className="mt-4 flex flex-wrap gap-2">
        {details.map((detail) => (
          <span key={detail} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
            {detail}
          </span>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      <span className="opacity-75">{label}:</span>
      <span>{value}</span>
    </span>
  );
}

function StatusPill({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClasses[tone]}`}>
      <p className="text-xs uppercase tracking-[0.18em] opacity-75">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

type Tone = "violet" | "cyan" | "emerald" | "amber" | "rose" | "slate";

const toneClasses: Record<Tone, string> = {
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};
