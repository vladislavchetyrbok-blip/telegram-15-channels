"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, BookOpen, FileText, HeartHandshake, LockKeyhole, MessageSquareText, RadioTower, Rocket, Server, Settings, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const zodiacNavItems = [
  { id: "overview", href: "/dashboard/networks/zodiac", label: "Обзор", icon: Sparkles },
  { id: "launch", href: "/dashboard/networks/zodiac/launch", label: "Запуск", icon: Rocket },
  { id: "channels", href: "/dashboard/networks/zodiac/channels", label: "Каналы", icon: RadioTower },
  { id: "content", href: "/dashboard/networks/zodiac/content", label: "Контент", icon: FileText },
  { id: "publishing", href: "/dashboard/networks/zodiac/publishing", label: "Публикации", icon: Rocket },
  { id: "analytics", href: "/dashboard/networks/zodiac/analytics", label: "Аналитика", icon: BarChart3 },
  { id: "feedback", href: "/dashboard/networks/zodiac/feedback", label: "Отзывы", icon: MessageSquareText },
  { id: "security", href: "/dashboard/networks/zodiac/security", label: "Безопасность", icon: LockKeyhole },
  { id: "settings", href: "/dashboard/networks/zodiac/settings", label: "Настройки", icon: Settings },
  { id: "docs", href: "/dashboard/networks/zodiac/docs", label: "Документы", icon: BookOpen },
];

const aphroditeNavItems = [
  { id: "aphrodite-channels", href: "/dashboard/networks/aphrodite/channels", label: "Channel Registry", icon: Server },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-line bg-[#08101f]/95 backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-72 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="flex min-h-full flex-col px-4 py-4 lg:px-5 lg:py-6">

        {/* Zodiac Platform Group */}
        <Link href="/dashboard/networks/zodiac" className="flex items-center gap-3 mt-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
            <RadioTower className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">Zodiac OS</p>
            <p className="text-xs text-slate-500 leading-tight pr-2">Центр управления Telegram-сетью, Mini App.</p>
          </div>
        </Link>

        <nav className="mt-5 grid grid-cols-2 gap-2 lg:mt-6 lg:grid-cols-1">
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

        {/* Aphrodite Platform Group */}
        <div className="mt-8 border-t border-slate-800/60 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-400/30 bg-blue-400/10 text-blue-300">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">Aphrodite</p>
            </div>
          </div>
          <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {aphroditeNavItems.map((item) => {
              const Icon = item.icon;
              const baseHref = item.href.split("#")[0];
              const active = pathname.startsWith(baseHref);

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
        </div>

        <div className="mt-8 hidden space-y-4 lg:block">
          <section className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Политика безопасности</p>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              Dashboard показывает состояние и dry-run подсказки. Live-публикация, weekly live, payments, profile sync и ledger writes не запускаются из UI.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-xs font-semibold text-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                safe
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-200">
                <Activity className="h-3.5 w-3.5" />
                analytics
              </span>
            </div>
          </section>
        </div>
      </div>
    </aside>
  );
}
