import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Crown,
  Database,
  Gift,
  HeartHandshake,
  ListChecks,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { getZodiacMiniAppAnalyticsDashboard, type AnalyticsRankItem } from "@/lib/zodiac-mini-app-analytics-store";

export const dynamic = "force-dynamic";

export default async function ZodiacMiniAppAnalyticsPage() {
  const analytics = await getZodiacMiniAppAnalyticsDashboard();
  const analyticsMode = analytics.storageMode === "redis" ? "active" : "noop";

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#f8fafc] px-4 py-6 text-slate-950 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-5">
          <Link href="/dashboard/networks/zodiac" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900">
            <ChevronLeft className="h-4 w-4" />
            Назад к Zodiac
          </Link>
          <div className="relative overflow-hidden rounded-lg border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400 via-cyan-300 to-amber-300" />
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              <BarChart3 className="h-3.5 w-3.5" />
              internal analytics
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Zodiac Mini App Analytics</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  Сводка по разделам, знакам, режимам совместимости и воронке Mini App без хранения имён, дат рождения, времени, городов или Telegram initData.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                privacy-safe
              </span>
            </div>
          </div>
        </header>

        {analytics.warning ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm">
            <h2 className="text-lg font-semibold">{analytics.warning}</h2>
            <p className="mt-2 text-sm leading-6">
              Добавьте переменные окружения для Upstash Redis REST. До этого API работает в noop-режиме, а Mini App не ломается.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {analytics.requiredEnv.map((envName) => (
                <code key={envName} className="rounded-md border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-900">
                  {envName}
                </code>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <ReadinessStatusCard analyticsMode={analyticsMode} storageConfigured={analytics.configured} />
          <SetupChecklistCard requiredEnv={analytics.requiredEnv} configured={analytics.configured} />
          <ReadinessListCard title="What we track" items={trackedAnalyticsItems} icon={ListChecks} tone="cyan" />
          <ReadinessListCard title="What we do NOT track" items={privateAnalyticsItems} icon={LockKeyhole} tone="emerald" />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Открытия сегодня" value={analytics.todayAppOpens} caption={analytics.todayDateKey} icon={Sparkles} tone="violet" />
          <MetricCard title="Открытия за 7 дней" value={analytics.last7DaysAppOpens} caption="app_open" icon={CalendarDays} tone="cyan" />
          <MetricCard title="VIP активность" value={analytics.counters.vipClicks} caption="views / free access / feature taps" icon={Crown} tone="amber" />
          <MetricCard title="Расчёты" value={analytics.funnel.find((item) => item.label === "calculation")?.value ?? 0} caption="compatibility_calculated" icon={HeartHandshake} tone="rose" />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Натальная карта" value={analytics.counters.natalChartOpens} caption="opens / completed" icon={Star} tone="violet" />
          <MetricCard title="Гороскоп пары" value={analytics.counters.coupleHoroscopeOpens} caption="couple horoscope" icon={UsersRound} tone="cyan" />
          <MetricCard title="Карта отношений" value={analytics.counters.relationshipMapOpens} caption="relationship / mental map" icon={BarChart3} tone="emerald" />
          <MetricCard title="Удачные дни" value={analytics.counters.luckyDaysOpens} caption="lucky days opens" icon={CalendarDays} tone="amber" />
          <MetricCard title="Розыгрыши" value={analytics.counters.giveawayClicks} caption="giveaway_clicked" icon={Gift} tone="rose" />
          <MetricCard title="Сообщения" value={analytics.counters.messageHelperUse} caption="message_helper_used" icon={MessageSquareText} tone="slate" />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <RankPanel title="Top sections" items={analytics.topSections} emptyText="Разделы пока не открывали." />
          <RankPanel title="Top signs" items={analytics.topSigns} emptyText="Знаки пока не выбирали." />
          <RankPanel title="Compatibility modes" items={analytics.compatibilityModes} emptyText="Режимы пока не выбирали." />
          <RankPanel title="Top pair checks" items={analytics.topPairs} emptyText="Пары пока не рассчитывали." />
          <RankPanel title="Funnel" items={analytics.funnel} emptyText="Воронка пока пустая." />
          <RankPanel title="Daily app opens" items={analytics.dailyAppOpens} emptyText="Открытий пока нет." />
        </section>
      </div>
    </div>
  );
}

function ReadinessStatusCard({ analyticsMode, storageConfigured }: { analyticsMode: "active" | "noop"; storageConfigured: boolean }) {
  const rows = [
    { label: "Analytics mode", value: analyticsMode, ok: true },
    { label: "Storage configured", value: storageConfigured ? "YES" : "NO", ok: storageConfigured },
    { label: "Events accepted", value: "YES", ok: true },
    { label: "Sensitive data stored", value: "NO", ok: true },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-950">Analytics readiness</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Production activation status without exposing secrets.</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-700">
          <Database className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-5 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
            <span className="min-w-0 break-words text-sm font-semibold text-slate-600">{row.label}</span>
            <span className={`inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold ${row.ok ? "text-emerald-700" : "text-amber-700"}`}>
              {row.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SetupChecklistCard({ requiredEnv, configured }: { requiredEnv: string[]; configured: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-950">Setup checklist</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{configured ? "Redis REST storage is configured." : "Add both env vars to activate storage."}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700">
          <ListChecks className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-5 space-y-2">
        {requiredEnv.map((envName) => (
          <div key={envName} className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
            <code className="min-w-0 break-words text-xs font-semibold text-slate-800 sm:text-sm">{envName}</code>
            <span className={`shrink-0 text-xs font-semibold uppercase ${configured ? "text-emerald-700" : "text-amber-700"}`}>
              {configured ? "set" : "needed"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadinessListCard({ title, items, icon: Icon, tone }: { title: string; items: string[]; icon: LucideIcon; tone: Tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <ul className="mt-5 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm font-semibold leading-5 text-slate-600">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span className="min-w-0 break-words">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MetricCard({
  title,
  value,
  caption,
  icon: Icon,
  tone,
}: {
  title: string;
  value: number;
  caption: string;
  icon: LucideIcon;
  tone: Tone;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-600">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 break-words text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{caption}</p>
    </div>
  );
}

function RankPanel({ title, items, emptyText }: { title: string; items: AnalyticsRankItem[]; emptyText: string }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? <p className="text-sm text-slate-500">{emptyText}</p> : null}
        {items.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 break-words font-semibold text-slate-700">{item.label}</span>
              <span className="font-semibold text-violet-700">{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-violet-500" style={{ width: `${Math.max(6, Math.round((item.value / max) * 100))}%` }} />
            </div>
          </div>
        ))}
      </div>
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

const trackedAnalyticsItems = [
  "app_open",
  "sign_selected",
  "section opens",
  "compatibility_calculated",
  "natal_chart_started/completed",
  "couple_horoscope_viewed",
  "relationship_map_viewed / mental_map_viewed",
  "relationship_map_category_opened",
  "lucky_day_clicked",
  "vip_clicked / vip_opened",
  "vip_free_access_viewed / vip_feature_opened",
  "vip_future_subscription_clicked",
  "giveaway_clicked",
  "message_helper_used",
];

const privateAnalyticsItems = [
  "names",
  "birth dates",
  "birth times",
  "birth cities",
  "message text",
  "bot token",
  "raw sensitive Telegram initData",
];
