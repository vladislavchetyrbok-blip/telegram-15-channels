import {
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Compass,
  FileText,
  FlaskConical,
  HeartHandshake,
  ImageIcon,
  Network,
  Newspaper,
  RadioTower,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import channelNetworksData from "@/data/config/channel-networks.json";
import { ScheduledAutopublishPanel } from "@/components/ScheduledAutopublishPanel";
import { StatCard } from "@/components/StatCard";
import { getUnifiedSystemStatus } from "@/lib/unified-system-status";

export const dynamic = "force-dynamic";

type NetworkStatus = "active" | "planned";

interface ChannelNetwork {
  id: string;
  title: string;
  emoji: string;
  status: NetworkStatus;
  channelCount: number;
  description: string;
  features: string[];
}

const channelNetworks = channelNetworksData.networks as ChannelNetwork[];

const featureLabels: Record<string, string> = {
  daily_autopublish: "Автопостинг",
  durable_ledger: "Ledger",
  backup_cron: "Backup cron",
  visual_assets: "Визуалы",
  cross_navigation: "Кнопки",
  compatibility: "Совместимость",
};

const networkVisuals: Record<string, { icon: LucideIcon; href: string; accent: string }> = {
  zodiac: {
    icon: Sparkles,
    href: "/dashboard/networks/zodiac",
    accent: "border-violet-300/30 bg-violet-300/10 text-violet-100",
  },
  "real-estate": {
    icon: Building2,
    href: "#real-estate",
    accent: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  },
  "general-media": {
    icon: Newspaper,
    href: "#general-media",
    accent: "border-sky-300/25 bg-sky-300/10 text-sky-100",
  },
  experiments: {
    icon: FlaskConical,
    href: "#experiments",
    accent: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  },
};

const nextActions = [
  { title: "Проверить следующий scheduled run", href: "/publishing-center", icon: CalendarClock, tone: "text-cyan-200", caption: "Контроль основного и резервного cron." },
  { title: "Еженедельный гороскоп", href: "/dashboard/networks/zodiac", icon: ClipboardList, tone: "text-violet-200", caption: "Dry-run пайплайн готов для ревью." },
  { title: "Описания каналов", href: "/dashboard/networks/zodiac", icon: FileText, tone: "text-emerald-200", caption: "Единый стиль для всех 13 каналов." },
  { title: "Комментарии", href: "/dashboard/networks/zodiac", icon: HeartHandshake, tone: "text-rose-200", caption: "Начать безопасно с общего канала." },
  { title: "Аналитика", href: "/dashboard/networks/zodiac", icon: BarChart3, tone: "text-amber-200", caption: "Ежедневные и исторические отчёты." },
];

export default async function DashboardPage() {
  const status = await getUnifiedSystemStatus();
  const attentionCount = status.autopublish.failedToday + status.autopublish.blockedToday + status.content.blocked;
  const zodiacNetwork = channelNetworks.find((item) => item.id === "zodiac");

  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/60 p-6 shadow-glow sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-violet-300 to-amber-200" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
              <Compass className="h-3.5 w-3.5" />
              Media Control Center
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Пульт управления каналами</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              Единый центр для Telegram-сетей, автопубликаций и контент-планов.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:w-80">
            <StatusPill label="Zodiac" value="active" tone="emerald" />
            <StatusPill label="Live controls" value="hidden" tone="cyan" />
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Сегодня"
          value="13"
          caption="постов Zodiac в день"
          icon={CalendarClock}
          tone="cyan"
        />
        <StatCard
          title="Сети каналов"
          value={channelNetworks.length}
          caption={`${zodiacNetwork?.channelCount ?? 13} активных Zodiac-каналов`}
          icon={Network}
          tone="blue"
        />
        <StatCard
          title="Требует внимания"
          value={attentionCount}
          caption={attentionCount > 0 ? "Есть пункты для проверки" : "Критичных пунктов нет"}
          icon={AlertTriangle}
          tone={attentionCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Быстрая статистика"
          value="91/91"
          caption="визуалов готово"
          icon={ImageIcon}
          tone="emerald"
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Сети каналов</h2>
            <p className="mt-1 text-sm text-slate-400">Выберите рабочую область. Сейчас полностью активна сеть Zodiac.</p>
          </div>
          <Link href="/channels/zodiac" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100">
            Все Zodiac-каналы
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {channelNetworks.map((network) => (
            <NetworkCard key={network.id} network={network} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Следующие действия</h2>
            <p className="mt-1 text-sm text-slate-400">Операционные задачи без опасных live-кнопок на первом экране.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {nextActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex min-h-28 items-start gap-4 rounded-lg border border-line bg-panel/72 p-4 transition hover:border-cyan-300/30 hover:bg-panel"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <Icon className={`h-5 w-5 ${action.tone}`} />
                  </span>
                  <span>
                    <span className="block font-semibold text-white group-hover:text-cyan-100">{action.title}</span>
                    <span className="mt-1 block text-sm leading-5 text-slate-400">{action.caption}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Операционный статус</h2>
            <p className="mt-1 text-sm text-slate-400">Короткая сводка без технического шума.</p>
          </div>
          <div className="grid gap-3">
            <StatusRow icon={ShieldCheck} label="Ledger" value="durable" hint="Дубликаты блокируются" tone="emerald" />
            <StatusRow icon={CalendarClock} label="Cron" value="06:00 + 06:30 UTC" hint="Основной и резервный запуск" tone="cyan" />
            <StatusRow icon={CheckCircle2} label="Навигация" value="13/13" hint="Кнопки и закрепы готовы" tone="violet" />
            <StatusRow icon={RadioTower} label="Публикация сегодня" value={`${status.autopublish.publishedToday}/15`} hint="Легаси-счётчик общей сети" tone="amber" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <details className="rounded-lg border border-line bg-black/20 p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-300 transition hover:text-white">
            <span className="inline-flex items-center gap-2">
              <Settings className="h-4 w-4 text-slate-400" />
              Dev / Диагностика
            </span>
            <span className="text-xs font-normal text-slate-500">технические панели скрыты</span>
          </summary>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Здесь остаются старые диагностические панели и ручные статусы. Они полезны для проверки, но не являются частью ежедневного операторского маршрута.
          </p>
          <div className="mt-5">
            <ScheduledAutopublishPanel />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Info label="План на неделю" value={String(status.content.weeklyPlanTotal)} />
            <Info label="Готово" value={String(status.content.readyToPublish)} />
            <Info label="Запланировано" value={String(status.content.scheduled)} />
            <Info label="Заблокировано" value={String(status.content.blocked)} />
            <Info label="Слабый текст" value={String(status.content.weakText)} />
            <Info label="Слабая картинка" value={String(status.content.weakImage)} />
          </div>
        </details>
      </section>
    </div>
  );
}

function NetworkCard({ network }: { network: ChannelNetwork }) {
  const visual = networkVisuals[network.id] ?? networkVisuals.experiments;
  const Icon = visual.icon;
  const active = network.status === "active";
  const href = active ? visual.href : "#";

  return (
    <Link
      id={network.id}
      href={href}
      className="group flex min-h-72 flex-col rounded-lg border border-line bg-panel/72 p-5 transition hover:border-cyan-300/30 hover:bg-panel"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">{network.emoji}</span>
          <div>
            <h3 className="font-semibold text-white">{network.title}</h3>
            <p className="text-sm text-slate-400">{network.channelCount} каналов</p>
          </div>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${active ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-slate-500/30 bg-slate-500/10 text-slate-300"}`}>
          {active ? "active" : "planned"}
        </span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-6 text-slate-300">{network.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {network.features.length > 0 ? (
          network.features.map((feature) => (
            <span key={feature} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
              {featureLabels[feature] ?? feature}
            </span>
          ))
        ) : (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-400">будущая сеть</span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${visual.accent}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-200 group-hover:text-cyan-100">
          {active ? "Открыть" : "Скоро"}
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function StatusPill({ label, value, tone }: { label: string; value: string; tone: "cyan" | "emerald" }) {
  const toneClass = tone === "emerald" ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";

  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.18em] opacity-75">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function StatusRow({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone: "emerald" | "cyan" | "violet" | "amber";
}) {
  const toneClass: Record<"emerald" | "cyan" | "violet" | "amber", string> = {
    emerald: "text-emerald-200 bg-emerald-300/10 border-emerald-300/20",
    cyan: "text-cyan-200 bg-cyan-300/10 border-cyan-300/20",
    violet: "text-violet-200 bg-violet-300/10 border-violet-300/20",
    amber: "text-amber-200 bg-amber-300/10 border-amber-300/20",
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border border-line bg-panel/72 p-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${toneClass[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-white">{label}</p>
          <p className="shrink-0 text-sm font-semibold text-slate-200">{value}</p>
        </div>
        <p className="mt-1 text-sm text-slate-400">{hint}</p>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white/5 p-3">
      <p className="text-xs uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
