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
  MessageCircle,
  Navigation,
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

const statusCards = [
  { label: "Каналов", value: "13", caption: "1 общий + 12 знаков", icon: Compass, tone: "violet" },
  { label: "Постов в день", value: "13", caption: "каждый знак получает прогноз", icon: SunMedium, tone: "cyan" },
  { label: "Постов в год", value: "4 745", caption: "365 дней автопилота", icon: CalendarClock, tone: "emerald" },
  { label: "Визуалов", value: "91/91", caption: "полный weekly-набор", icon: ImageIcon, tone: "amber" },
  { label: "Ledger", value: "OK", caption: "дубликаты блокируются", icon: ShieldCheck, tone: "emerald" },
  { label: "Backup cron", value: "active", caption: "09:30 резерв", icon: CheckCircle2, tone: "cyan" },
  { label: "Совместимость", value: "78", caption: "готовых пар", icon: HeartHandshake, tone: "coral" },
  { label: "Daily buttons", value: "active", caption: "кнопки под постами", icon: Navigation, tone: "violet" },
] as const;

const workspaceSections = [
  { title: "Обзор", icon: Compass, status: "готово", description: "Короткая сводка по сети, каналам, автопостингу и безопасным режимам.", href: "/channels/zodiac" },
  { title: "Сегодня", icon: SunMedium, status: "операторский режим", description: "Проверка дневного запуска, 13 постов, медиа, кнопки и отчет.", href: "/publishing-center" },
  { title: "Контент", icon: FileText, status: "ежедневный", description: "Ежедневные тексты гороскопов и будущие контентные форматы.", href: "/content-plan" },
  { title: "Навигация", icon: Navigation, status: "13/13", description: "Inline-кнопки и закрепленные cross-navigation посты во всех каналах.", href: "/channels/zodiac" },
  { title: "Визуалы", icon: ImageIcon, status: "91/91", description: "Готовые weekly JPG-изображения для всех знаков и дней недели.", href: "/visuals" },
  { title: "Совместимость", icon: HeartHandshake, status: "interactive", description: "Bot/Mini App preview для fast, personal и precise расчетов без публикации в каналы.", href: "/dashboard/networks/zodiac/compatibility-preview" },
  { title: "Еженедельный", icon: ClipboardList, status: "dry-run", description: "Пайплайн еженедельных гороскопов готов для ревью без live-публикации.", href: "/dashboard/networks/zodiac#weekly" },
  { title: "Отчеты", icon: BarChart3, status: "daily/history", description: "Ежедневные отчеты, историческая аналитика и будущие витрины метрик.", href: "/dashboard/networks/zodiac#reports" },
  { title: "Настройки", icon: Settings, status: "безопасно", description: "Описания каналов, комментарии, dev-инструменты и операционный runbook.", href: "/dashboard/networks/zodiac#settings" },
] as const;

export default function ZodiacNetworkWorkspacePage() {
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
              Рабочая панель сети гороскопов: ежедневные публикации, визуалы, навигация и совместимость.
            </p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statusCards.map((card) => (
            <StatusCard key={card.label} {...card} />
          ))}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Рабочие разделы</h2>
            <p className="mt-1 text-sm text-slate-600">
              Сейчас это навигационная карта. Новая backend-логика здесь не добавляется.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workspaceSections.map((section) => (
              <WorkspaceCard key={section.title} {...section} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <InfoPanel
            id="compatibility"
            title="Совместимость"
            icon={HeartHandshake}
            tone="coral"
          >
            Совместимость теперь готовится как интерактивный bot/Mini App сервис: fast, personal и precise режимы без публикации результатов в каналы.
          </InfoPanel>
          <InfoPanel
            id="weekly"
            title="Еженедельный гороскоп"
            icon={ClipboardList}
            tone="violet"
          >
            Еженедельный pipeline отделен от ежедневного ledger и пока используется только для dry-run проверки формата.
          </InfoPanel>
          <InfoPanel
            id="reports"
            title="Отчеты"
            icon={BarChart3}
            tone="cyan"
          >
            Daily и history отчеты остаются безопасными read-only инструментами для контроля публикаций и дублей.
          </InfoPanel>
          <InfoPanel
            id="settings"
            title="Настройки"
            icon={Settings}
            tone="slate"
          >
            Технические, dev и будущие настройки комментариев вынесены сюда, чтобы первый экран оставался понятным оператору.
          </InfoPanel>
          <InfoPanel
            title="Комментарии"
            icon={MessageCircle}
            tone="emerald"
          >
            Комментарии подготовлены как отдельный этап и не смешиваются с ежедневной публикацией.
          </InfoPanel>
          <InfoPanel
            title="Описания каналов"
            icon={FileText}
            tone="amber"
          >
            Описания каналов вынесены в безопасный dry-run/apply поток и не требуют действий на главном экране.
          </InfoPanel>
        </section>
      </div>
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
  tone: Tone;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg border ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{caption}</p>
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
    <Link href={href} className="group flex min-h-48 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-700">
          <Icon className="h-5 w-5" />
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">{status}</span>
      </div>
      <h3 className="mt-4 font-semibold text-slate-950 group-hover:text-violet-900">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-violet-700">
        Открыть
        <ChevronLeft className="h-4 w-4 rotate-180" />
      </span>
    </Link>
  );
}

function InfoPanel({
  id,
  title,
  icon: Icon,
  tone,
  children,
}: {
  id?: string;
  title: string;
  icon: LucideIcon;
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg border ${toneClasses[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{children}</p>
    </div>
  );
}
