"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  CalendarDays,
  CheckCircle2,
  Cloud,
  Database,
  Eye,
  FileText,
  FileCheck2,
  FileSearch,
  Gauge,
  Github,
  ImageIcon,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  LockKeyhole,
  Palette,
  PenLine,
  PlusCircle,
  RadioTower,
  RefreshCw,
  Rocket,
  ScanSearch,
  SendHorizontal,
  Settings,
  ShieldCheck,
  Sparkles,
  Smartphone,
  TimerReset,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const githubActionsUrl = process.env.NEXT_PUBLIC_GITHUB_ACTIONS_URL;

const navItems = [
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/channels", label: "Каналы", icon: RadioTower },
  { href: "/publishing-center", label: "Центр публикаций", icon: Rocket },
  { href: "/posts", label: "Посты", icon: PenLine },
  { href: "/drafts", label: "Черновики", icon: FileText },
  { href: "/queue", label: "Очередь", icon: ListChecks },
  { href: "/content-plan", label: "Контент-план", icon: Lightbulb },
  { href: "/content-calendar", label: "Календарь", icon: CalendarDays },
  { href: "/visuals", label: "Визуалы", icon: Palette },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-line bg-[#08101f]/95 backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-72 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="flex min-h-full flex-col px-4 py-4 lg:px-5 lg:py-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
            <RadioTower className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">TG NetOps</p>
            <p className="text-xs text-slate-500">15-channel command center</p>
          </div>
        </Link>

        <nav className="mt-5 grid grid-cols-2 gap-2 lg:mt-8 lg:grid-cols-1">
          {navItems.map((item) => {
            const external = "external" in item && item.external;
            const active = !external && (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)));
            const Icon = item.icon;

            return (
              <a
                key={item.href}
                href={item.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800/60 hover:text-white",
                  active && "border border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="mt-6 hidden space-y-4 lg:block">
          <section className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Политика статусов</p>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              Telegram, worker, контент и readiness берутся из единого runtime-состояния. Логотипы и статистика не блокируют публикацию.
            </p>
          </section>
        </div>
      </div>
    </aside>
  );
}
