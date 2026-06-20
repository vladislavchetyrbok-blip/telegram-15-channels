"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Banknote, BarChart3, BookOpen, CalendarDays, Clapperboard, Database, FileText, HeartHandshake, LayoutDashboard, LockKeyhole, MessageSquareText, Network, RadioTower, Rocket, Server, Settings, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const aphroditeNavItems = [
  { id: "aphrodite-overview", href: "/dashboard/networks/aphrodite", label: "Обзор", icon: LayoutDashboard },
  { id: "aphrodite-channels", href: "/dashboard/networks/aphrodite/channels", label: "Сеть Каналов", icon: Database },
  { id: "aphrodite-calendar", href: "/dashboard/networks/aphrodite/calendar", label: "Календарь", icon: CalendarDays },
  { id: "aphrodite-data-sources", href: "/dashboard/networks/aphrodite/data-sources", label: "Источники Данных", icon: Network },
  { id: "aphrodite-currency", href: "/dashboard/networks/aphrodite/currency", label: "Валюты", icon: Banknote },
  { id: "aphrodite-crypto", href: "/dashboard/networks/aphrodite/crypto", label: "Крипта", icon: Activity },
  { id: "aphrodite-metals", href: "/dashboard/networks/aphrodite/metals", label: "Металлы", icon: Sparkles },
  { id: "aphrodite-studio", href: "/dashboard/networks/aphrodite/studio", label: "Студия", icon: Clapperboard },
];

const zodiacNavItems = [
  { id: "overview", href: "/dashboard/networks/zodiac", label: "Каналы Зодиака", icon: Sparkles },
  { id: "launch", href: "/dashboard/networks/zodiac/launch", label: "Запуск", icon: Rocket },
  { id: "channels", href: "/dashboard/networks/zodiac/channels", label: "Мониторинг", icon: RadioTower },
  { id: "content", href: "/dashboard/networks/zodiac/content", label: "Контент", icon: FileText },
  { id: "publishing", href: "/dashboard/networks/zodiac/publishing", label: "Публикации", icon: Rocket },
  { id: "analytics", href: "/dashboard/networks/zodiac/analytics", label: "Аналитика", icon: BarChart3 },
  { id: "feedback", href: "/dashboard/networks/zodiac/feedback", label: "Отзывы", icon: MessageSquareText },
  { id: "security", href: "/dashboard/networks/zodiac/security", label: "Безопасность", icon: LockKeyhole },
  { id: "settings", href: "/dashboard/networks/zodiac/settings", label: "Настройки", icon: Settings },
  { id: "docs", href: "/dashboard/networks/zodiac/docs", label: "Документы", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-line bg-[#08101f]/95 backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-72 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="flex min-h-full flex-col px-4 py-4 lg:px-5 lg:py-6">

        {/* Aphrodite Platform Group (Main) */}
        <Link href="/dashboard/networks/aphrodite" className="flex items-center gap-3 mt-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-400/30 bg-blue-400/10 text-blue-300">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">АФРОДИТА</p>
            <p className="text-[11px] text-slate-500 leading-tight pr-2 uppercase tracking-wider">Operator Platform</p>
          </div>
        </Link>

        <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {aphroditeNavItems.map((item) => {
            const Icon = item.icon;
            const baseHref = item.href.split("#")[0];
            const active = pathname === baseHref || (baseHref !== "/dashboard/networks/aphrodite" && pathname.startsWith(baseHref));

            return (
              <Link
                key={item.id}
                href={item.href}
                prefetch={false}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800/60 hover:text-white",
                  active && "border border-blue-400/30 bg-blue-400/10 text-blue-200",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Zodiac Module Group */}
        <div className="mt-8 border-t border-slate-800/60 pt-6">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Модуль Зодиак</p>
            </div>
          </div>
          <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {zodiacNavItems.map((item) => {
              const Icon = item.icon;
              const baseHref = item.href.split("#")[0];
              const active =
                pathname === baseHref ||
                (baseHref !== "/dashboard/networks/zodiac" && pathname.startsWith(baseHref)) ||
                (item.id === "overview" && pathname === "/dashboard");

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  prefetch={false}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800/60 hover:text-white",
                    active && "border border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 hidden space-y-4 lg:block">
          <section className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Политика безопасности</p>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              <span className="font-semibold text-emerald-400">Offline Mocking Active</span>.
              Все живые API-запросы в Telegram отключены в <code className="text-slate-300">local/dev</code> режиме для предотвращения дублирования.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">Safe Mode</span>
            </div>
          </section>

          <section className="rounded-lg border border-slate-800 bg-slate-800/30 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Статус сети</p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Каналы</span>
              <span className="font-medium text-slate-300">15</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Среда</span>
              <span className="font-medium text-slate-300">Development</span>
            </div>
          </section>
        </div>

      </div>
    </aside>
  );
}
