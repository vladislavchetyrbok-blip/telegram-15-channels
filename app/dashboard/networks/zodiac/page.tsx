import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Compass,
  FileText,
  HeartHandshake,
  ImageIcon,
  Navigation,
  Settings,
  ShieldCheck,
  Sparkles,
  SunMedium,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

const statusCards = [
  { label: "Каналов", value: "13", caption: "1 общий + 12 знаков", icon: Compass, tone: "violet" },
  { label: "Постов в день", value: "13", caption: "каждый знак получает прогноз", icon: SunMedium, tone: "cyan" },
  { label: "Постов в год", value: "4 745", caption: "365 дней автопилота", icon: CalendarClock, tone: "emerald" },
  { label: "Визуалов", value: "91/91", caption: "полный weekly-набор", icon: ImageIcon, tone: "amber" },
  { label: "Ledger", value: "OK", caption: "дубликаты блокируются", icon: ShieldCheck, tone: "emerald" },
  { label: "Backup cron", value: "active", caption: "06:30 UTC резерв", icon: CheckCircle2, tone: "cyan" },
] as const;

const workspaceSections = [
  { title: "Обзор", icon: Compass, status: "готово", description: "Короткая сводка по сети, каналам, автопостингу и безопасным режимам.", href: "/channels/zodiac" },
  { title: "Сегодня", icon: SunMedium, status: "операторский режим", description: "Проверка дневного запуска, 13 постов, медиа, кнопки и отчёт.", href: "/publishing-center" },
  { title: "Контент", icon: FileText, status: "ежедневный", description: "Ежедневные тексты гороскопов и будущие контентные форматы.", href: "/content-plan" },
  { title: "Навигация", icon: Navigation, status: "13/13", description: "Inline-кнопки и закреплённые cross-navigation посты во всех каналах.", href: "/channels/zodiac" },
  { title: "Визуалы", icon: ImageIcon, status: "91/91", description: "Готовые weekly JPG-изображения для всех знаков и дней недели.", href: "/visuals" },
  { title: "Совместимость", icon: HeartHandshake, status: "78 пар", description: "Dry-run модуль для публикаций вроде «Водолей + Лев».", href: "/dashboard/networks/zodiac#compatibility" },
  { title: "Еженедельный", icon: ClipboardList, status: "dry-run", description: "Пайплайн еженедельных гороскопов готов для ревью без live-публикации.", href: "/dashboard/networks/zodiac#weekly" },
  { title: "Отчёты", icon: BarChart3, status: "daily/history", description: "Ежедневные отчёты, историческая аналитика и будущие витрины метрик.", href: "/dashboard/networks/zodiac#reports" },
  { title: "Настройки", icon: Settings, status: "безопасно", description: "Описание каналов, комментарии, dev-инструменты и операционный runbook.", href: "/settings" },
] as const;

export default function ZodiacNetworkWorkspacePage() {
  return (
    <div className="space-y-10">
      <header className="space-y-5">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100">
          <ChevronLeft className="h-4 w-4" />
          Назад к пульту
        </Link>
        <div className="relative overflow-hidden rounded-lg border border-violet-300/20 bg-gradient-to-br from-violet-950/70 via-slate-950 to-cyan-950/50 p-6 shadow-glow sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-300 via-cyan-300 to-amber-200" />
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-100">
            <Sparkles className="h-3.5 w-3.5" />
            active network
          </p>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">🔮 Знаки зодиака</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
            Полностью рабочая сеть из 13 Telegram-каналов: ежедневные гороскопы, визуалы, durable ledger, автопостинг, навигация, совместимость и подготовка еженедельного формата.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statusCards.map((card) => (
          <StatusCard key={card.label} {...card} />
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Рабочие разделы</h2>
          <p className="mt-1 text-sm text-slate-400">Сейчас это навигационная карта. Новая backend-логика здесь не добавляется.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workspaceSections.map((section) => (
            <WorkspaceCard key={section.title} {...section} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div id="compatibility" className="rounded-lg border border-line bg-panel/72 p-5">
          <h2 className="text-lg font-semibold text-white">Совместимость</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Модуль готовит 78 пар для будущих публикаций в общем канале, Mini App или VIP-формате. Сейчас безопасный режим: generate + dry-run.
          </p>
        </div>
        <div id="weekly" className="rounded-lg border border-line bg-panel/72 p-5">
          <h2 className="text-lg font-semibold text-white">Еженедельный гороскоп</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Еженедельный pipeline отделён от ежедневного ledger и пока используется только для dry-run проверки формата.
          </p>
        </div>
        <div id="reports" className="rounded-lg border border-line bg-panel/72 p-5">
          <h2 className="text-lg font-semibold text-white">Отчёты</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Daily и history отчёты остаются безопасными read-only инструментами для контроля публикаций и дублей.
          </p>
        </div>
      </section>
    </div>
  );
}

function StatusCard({
  label,
  value,
  caption,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  tone: "violet" | "cyan" | "emerald" | "amber";
}) {
  const toneClass: Record<"violet" | "cyan" | "emerald" | "amber", string> = {
    violet: "border-violet-300/20 bg-violet-300/10 text-violet-100",
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
    amber: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  };

  return (
    <div className="rounded-lg border border-line bg-panel/72 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg border ${toneClass[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-400">{caption}</p>
    </div>
  );
}

function WorkspaceCard({
  title,
  icon: Icon,
  status,
  description,
  href,
}: {
  title: string;
  icon: LucideIcon;
  status: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="group flex min-h-48 flex-col rounded-lg border border-line bg-panel/72 p-5 transition hover:border-violet-300/30 hover:bg-panel">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cyan-100">
          <Icon className="h-5 w-5" />
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">{status}</span>
      </div>
      <h3 className="mt-4 font-semibold text-white group-hover:text-cyan-100">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-200">
        Открыть
        <ChevronLeft className="h-4 w-4 rotate-180" />
      </span>
    </Link>
  );
}
