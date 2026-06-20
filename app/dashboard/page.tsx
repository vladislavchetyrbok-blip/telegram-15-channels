import {
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Compass,
  FlaskConical,
  HeartHandshake,
  ImageIcon,
  MessageCircle,
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
import { getUnifiedSystemStatus } from "@/lib/unified-system-status";

export const dynamic = "force-dynamic";

type NetworkStatus = "active" | "planned";
type SoftTone = "violet" | "cyan" | "emerald" | "amber" | "coral" | "slate";

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
  daily_buttons: "Daily buttons",
  compatibility: "Совместимость",
  channel_descriptions: "Описания",
};

const networkVisuals: Record<string, { icon: LucideIcon; href: string; accent: string }> = {
  zodiac: {
    icon: Sparkles,
    href: "/dashboard/networks/zodiac",
    accent: "border-violet-200 bg-violet-50 text-violet-700",
  },
  "real-estate": {
    icon: Building2,
    href: "#real-estate",
    accent: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  "general-media": {
    icon: Newspaper,
    href: "#general-media",
    accent: "border-cyan-200 bg-cyan-50 text-cyan-700",
  },
  experiments: {
    icon: FlaskConical,
    href: "#experiments",
    accent: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

const nextActions = [
  {
    title: "Проверить следующий scheduled run",
    href: "/publishing-center",
    icon: CalendarClock,
    tone: "cyan" as const,
    caption: "Основной запуск 09:00, резервный 09:30.",
  },
  {
    title: "Еженедельный гороскоп",
    href: "/dashboard/networks/zodiac",
    icon: ClipboardList,
    tone: "violet" as const,
    caption: "Dry-run формат готов для ревью без live-публикации.",
  },
  {
    title: "Комментарии",
    href: "/dashboard/networks/zodiac",
    icon: MessageCircle,
    tone: "coral" as const,
    caption: "Настройки общения вынесены из ежедневного маршрута.",
  },
  {
    title: "Аналитика",
    href: "/dashboard/networks/zodiac/analytics",
    icon: BarChart3,
    tone: "amber" as const,
    caption: "Counters, funnels и privacy-safe метрики Mini App.",
  },
  {
    title: "SENATE / недвижимость позже",
    href: "#real-estate",
    icon: Building2,
    tone: "emerald" as const,
    caption: "Будущая сеть отделена от активного Zodiac-оператора.",
  },
];

const toneClasses: Record<SoftTone, string> = {
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  coral: "border-rose-200 bg-rose-50 text-rose-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};

export default async function DashboardPage() {
  const status = await getUnifiedSystemStatus();
  const attentionCount = status.autopublish.failedToday + status.autopublish.blockedToday + status.content.blocked;
  const zodiacNetwork = channelNetworks.find((item) => item.id === "zodiac");
  const plannedNetworks = channelNetworks.filter((item) => item.status === "planned");

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#f8fafc] px-4 py-6 text-slate-950 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="relative overflow-hidden rounded-lg border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-cyan-50 p-6 shadow-sm sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400 via-cyan-300 to-amber-300" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
                <Compass className="h-3.5 w-3.5" />
                Media Control Center
              </p>
              <h1 className="mt-5 break-words text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Пульт управления каналами
              </h1>
              <p className="mt-3 max-w-2xl break-words text-base leading-7 text-slate-600">
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
          <OperatorCard
            title="Сегодня"
            value="13"
            caption="постов в день"
            details={["следующий запуск 09:00", "backup 09:30"]}
            icon={CalendarClock}
            tone="cyan"
          />
          <OperatorCard
            title="Сети каналов"
            value={channelNetworks.length}
            caption={`активная сеть: ${zodiacNetwork?.title ?? "Знаки зодиака"}`}
            details={[`планируемые: ${plannedNetworks.map((item) => item.title).join(", ")}`]}
            icon={Network}
            tone="violet"
          />
          <OperatorCard
            title="Требует внимания"
            value={attentionCount}
            caption={attentionCount > 0 ? "есть пункты для проверки" : "критичных пунктов нет"}
            details={[`failed: ${status.autopublish.failedToday}`, "duplicate risk: 0", "missing images: 0"]}
            icon={AlertTriangle}
            tone={attentionCount > 0 ? "amber" : "emerald"}
          />
          <OperatorCard
            title="Быстрая статистика"
            value="4 745"
            caption="постов в год"
            details={["13 каналов", "91/91 визуалов", "78 compatibility pairs"]}
            icon={ImageIcon}
            tone="amber"
          />
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Сети каналов</h2>
              <p className="mt-1 text-sm text-slate-600">
                Выберите рабочую область. Сейчас полностью активна сеть Zodiac, остальные категории ждут своего этапа.
              </p>
            </div>
            <Link href="/channels/zodiac" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900">
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
              <h2 className="text-xl font-semibold text-slate-950">Следующие действия</h2>
              <p className="mt-1 text-sm text-slate-600">
                Операторские задачи без опасных live-кнопок на первом экране.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {nextActions.map((action) => (
                <ActionCard key={action.title} {...action} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Операционный статус</h2>
              <p className="mt-1 text-sm text-slate-600">Короткая сводка без технического шума.</p>
            </div>
            <div className="grid gap-3">
              <StatusRow icon={ShieldCheck} label="Ledger" value="durable" hint="Дубликаты блокируются" tone="emerald" />
              <StatusRow icon={CalendarClock} label="Cron" value="09:00 + 09:30" hint="Основной и резервный запуск" tone="cyan" />
              <StatusRow icon={CheckCircle2} label="Навигация" value="13/13" hint="Кнопки и закрепы готовы" tone="violet" />
              <StatusRow icon={Sparkles} label="Описания каналов" value="ready" hint="Документы и dry-run подготовлены" tone="amber" />
              <StatusRow icon={RadioTower} label="Публикация сегодня" value={`${status.autopublish.publishedToday}/13`} hint="Zodiac-операторский счетчик" tone="slate" />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <details id="settings" className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-700 transition hover:text-slate-950">
              <span className="inline-flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-500" />
                Dev / Диагностика / Отчеты
              </span>
              <span className="text-xs font-normal text-slate-500">технические панели скрыты</span>
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Здесь остаются старые диагностические панели и ручные статусы. Они полезны для проверки, но не являются частью ежедневного операторского маршрута.
            </p>
            <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-slate-950 p-4">
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
      className="group flex min-h-72 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">{network.emoji}</span>
          <div>
            <h3 className="font-semibold text-slate-950">{network.title}</h3>
            <p className="text-sm text-slate-500">{network.channelCount} каналов</p>
          </div>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
          {active ? "active" : "planned"}
        </span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-6 text-slate-600">{network.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {network.features.length > 0 ? (
          network.features.map((feature) => (
            <span key={feature} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
              {featureLabels[feature] ?? feature}
            </span>
          ))
        ) : (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500">будущая сеть</span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${visual.accent}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 group-hover:text-violet-900">
          {active ? "Открыть" : "Скоро"}
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
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
  tone: SoftTone;
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
          <Icon className="h-5 w-5" aria-hidden="true" />
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

function ActionCard({
  title,
  href,
  icon: Icon,
  tone,
  caption,
}: {
  title: string;
  href: string;
  icon: LucideIcon;
  tone: SoftTone;
  caption: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-28 items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-violet-200 hover:shadow-md"
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${toneClasses[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-semibold text-slate-950 group-hover:text-violet-900">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-slate-600">{caption}</span>
      </span>
    </Link>
  );
}

function StatusPill({ label, value, tone }: { label: string; value: string; tone: "cyan" | "emerald" }) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClasses[tone]}`}>
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
  tone: SoftTone;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${toneClasses[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-slate-950">{label}</p>
          <p className="shrink-0 text-sm font-semibold text-slate-700">{value}</p>
        </div>
        <p className="mt-1 text-sm text-slate-500">{hint}</p>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-xs uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
