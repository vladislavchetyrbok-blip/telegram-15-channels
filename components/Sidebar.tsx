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
  Smartphone,
  TimerReset,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const githubActionsUrl = process.env.NEXT_PUBLIC_GITHUB_ACTIONS_URL;

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/telegram-connection", label: "Telegram подключение", icon: Bot },
  { href: "/telegram-safety", label: "Telegram safety", icon: LockKeyhole },
  { href: "/production-send", label: "Боевой запуск", icon: Rocket },
  { href: "/single-channel-test", label: "Один канал", icon: SendHorizontal },
  { href: "/telegram-control-test", label: "Control test", icon: ShieldCheck },
  { href: "/preflight", label: "Preflight", icon: ScanSearch },
  { href: "/publish-readiness", label: "Готово к публикации", icon: CheckCircle2 },
  { href: "/admin/final-preview", label: "Final Preview", icon: Eye },
  { href: "/admin/manual-test-send", label: "Manual Test Send", icon: SendHorizontal },
  { href: "/admin/post-send-verification", label: "Post-Send Verification", icon: FileSearch },
  { href: "/admin/one-channel-test-queue", label: "One-Channel Test Queue", icon: ListChecks },
  { href: "/publishing-center", label: "Центр публикаций", icon: Rocket },
  { href: "/admin/phone-dashboard", label: "Phone dashboard", icon: Smartphone },
  { href: "/admin/phone-start", label: "Phone start", icon: Smartphone },
  { href: "/admin/mobile-control", label: "Mobile control", icon: Smartphone },
  { href: "/admin/publish-monitor", label: "Publish monitor", icon: RadioTower },
  { href: "/admin/publish-scheduler", label: "Publish scheduler", icon: TimerReset },
  { href: "/admin/actions-scheduler", label: "Actions Scheduler", icon: Github },
  { href: "/admin/production-safety", label: "Production Safety", icon: ShieldCheck },
  { href: "/admin/content-quality", label: "Content Quality", icon: ScanSearch },
  { href: "/admin/regeneration-queue", label: "Regeneration Queue", icon: RefreshCw },
  { href: "/admin/regeneration-drafts", label: "Regeneration Drafts", icon: FileText },
  { href: "/admin/regeneration-review", label: "Draft Review", icon: ShieldCheck },
  { href: "/admin/draft-apply", label: "Draft Apply", icon: FileCheck2 },
  { href: "/admin/operational-health", label: "Operational Health", icon: Activity },
  { href: "/admin/deploy-readiness", label: "Deploy readiness", icon: Rocket },
  { href: "/admin/vercel-setup", label: "Vercel setup", icon: Cloud },
  { href: "/admin/system-status", label: "System status", icon: Activity },
  { href: "/admin/supabase-readiness", label: "Supabase readiness", icon: ListChecks },
  { href: "/admin/store-compare", label: "Store compare", icon: Database },
  { href: "/admin/dual-read", label: "Dual-read status", icon: Database },
  { href: "/admin/mirror-sync", label: "Mirror sync", icon: Database },
  { href: "/admin/backups", label: "Backups", icon: Database },
  ...(githubActionsUrl ? [{ href: githubActionsUrl, label: "GitHub Actions", icon: Github, external: true }] : []),
  { href: "/network", label: "Пульт сети", icon: Gauge },
  { href: "/channels", label: "Каналы", icon: RadioTower },
  { href: "/generation", label: "Генерация", icon: Wand2 },
  { href: "/first-generation", label: "Первая генерация", icon: Wand2 },
  { href: "/draft-review", label: "Проверка черновиков", icon: ListChecks },
  { href: "/content-plan", label: "Контент-план", icon: Lightbulb },
  { href: "/content-calendar", label: "Контент-календарь", icon: CalendarDays },
  { href: "/editorial", label: "Редактура", icon: ShieldCheck },
  { href: "/visuals", label: "Визуалы", icon: Palette },
  { href: "/visual-preview", label: "Visual preview", icon: ImageIcon },
  { href: "/logos", label: "Логотипы", icon: ImageIcon },
  { href: "/queue", label: "Очередь", icon: ListChecks },
  { href: "/drafts", label: "Черновики", icon: ListChecks },
  { href: "/posts", label: "Посты", icon: PenLine },
  { href: "/posts/new", label: "Создать пост", icon: PlusCircle },
  { href: "/calendar", label: "Календарь", icon: CalendarDays },
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

            return external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
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

        <div className="mt-6 hidden space-y-4 lg:block">
          <section className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Status policy</p>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              Telegram, worker, контент и readiness берутся из единого runtime-состояния. Логотипы и статистика не блокируют публикацию.
            </p>
          </section>
        </div>
      </div>
    </aside>
  );
}
