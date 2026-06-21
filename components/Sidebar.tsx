import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  RadioTower,
  FileText,
  Rocket,
  BarChart3,
  Settings,
  Shield,
  MessageSquareText,
  LockKeyhole,
  Server,
  BookOpen,
  Calendar,
  Database,
  Clapperboard,
  ChevronDown,
  ChevronRight,
  Activity,
  LogOut
} from "lucide-react";

const aphroditeNavItems = [
  { id: "overview", href: "/dashboard/networks/aphrodite", label: "Обзор", icon: LayoutDashboard },
  { id: "channels", href: "/dashboard/networks/aphrodite/channels", label: "Сеть каналов", icon: RadioTower },
  { id: "calendar", href: "/dashboard/networks/aphrodite/calendar", label: "Календарь", icon: Calendar },
  { id: "data-sources", href: "/dashboard/networks/aphrodite/data-sources", label: "Источники данных", icon: Database },
  { id: "studio", href: "/dashboard/networks/aphrodite/studio", label: "Студия", icon: Clapperboard },
];

const legacyNavItems = [
  { id: "overview", href: "/dashboard/networks/aphrodite/legacy", label: "Обзор", icon: LayoutDashboard },
  { id: "general", href: "#", label: "Общие темы", icon: RadioTower },
  { id: "realestate", href: "#", label: "Недвижимость", icon: RadioTower },
  { id: "restart", href: "/dashboard/networks/aphrodite/legacy/restart", label: "Перезапуск", icon: Rocket },
  { id: "content", href: "#", label: "Контент", icon: FileText },
  { id: "qa", href: "#", label: "Проверка", icon: Shield },
];

const zodiacNavItems = [
  { id: "priority", href: "/dashboard/networks/zodiac/priority", label: "Приоритет запуска", icon: Rocket },
  { id: "profiles", href: "/dashboard/networks/zodiac/profiles", label: "Контентные профили", icon: FileText },
  { id: "daily-system", href: "/dashboard/networks/zodiac/daily-system", label: "Ежедневная система", icon: Activity },
  { id: "soft-launch", href: "/dashboard/networks/zodiac/soft-launch", label: "Soft Launch", icon: Calendar },
  { id: "channels", href: "/dashboard/networks/zodiac/channels", label: "Каналы Зодиака", icon: RadioTower },
  { id: "launch", href: "/dashboard/networks/zodiac/launch", label: "Запуск", icon: Rocket },
  { id: "operations", href: "/dashboard/networks/zodiac/operations", label: "Мониторинг", icon: LayoutDashboard },
  { id: "content", href: "/dashboard/networks/zodiac/content", label: "Контент", icon: FileText },
  { id: "publishing", href: "/dashboard/networks/zodiac/publishing", label: "Публикации", icon: Rocket },
  { id: "analytics", href: "/dashboard/networks/zodiac/analytics", label: "Аналитика", icon: BarChart3 },
  { id: "feedback", href: "/dashboard/networks/zodiac/feedback", label: "Отзывы", icon: MessageSquareText },
  { id: "security", href: "/dashboard/networks/zodiac/security", label: "Безопасность", icon: Shield },
  { id: "settings", href: "/dashboard/networks/zodiac/settings", label: "Настройки", icon: Settings },
  { id: "docs", href: "/dashboard/networks/zodiac/docs", label: "Документы", icon: BookOpen },
];

const currencyNavItems = [
  { id: "overview", href: "/dashboard/networks/aphrodite/currency", label: "Обзор", icon: LayoutDashboard },
  { id: "channels", href: "#", label: "Каналы", icon: RadioTower },
  { id: "sources", href: "#", label: "Источники", icon: Database },
  { id: "publishing", href: "#", label: "Публикации", icon: Rocket },
];

const cryptoNavItems = [
  { id: "overview", href: "/dashboard/networks/aphrodite/crypto", label: "Обзор", icon: LayoutDashboard },
  { id: "channels", href: "#", label: "Каналы", icon: RadioTower },
  { id: "sources", href: "#", label: "Источники", icon: Database },
  { id: "publishing", href: "#", label: "Публикации", icon: Rocket },
];

const metalsNavItems = [
  { id: "overview", href: "/dashboard/networks/aphrodite/metals", label: "Обзор", icon: LayoutDashboard },
  { id: "channels", href: "#", label: "Каналы", icon: RadioTower },
  { id: "sources", href: "#", label: "Источники", icon: Database },
  { id: "publishing", href: "#", label: "Публикации", icon: Rocket },
];

function NavGroup({ title, items, defaultOpen, pathPrefix, colorClass }: { title: string, items: {id: string, href: string, label: string, icon: any}[], defaultOpen: boolean, pathPrefix: string, colorClass: string }) {
  const pathname = usePathname();
  const isOpen = pathname.includes(pathPrefix) || defaultOpen;
  
  return (
    <details className="group" open={isOpen}>
      <summary className="flex cursor-pointer items-center justify-between px-1 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-300 transition-colors list-none">
        <span className={cn("flex items-center gap-2", colorClass)}>
          <ChevronRight className="h-3.5 w-3.5 group-open:hidden" />
          <ChevronDown className="h-3.5 w-3.5 hidden group-open:block" />
          {title}
        </span>
      </summary>
      <nav className="mt-1 grid grid-cols-1 gap-1 pl-4 border-l border-slate-800/60 ml-2.5">
        {items.map((item: any) => {
          const Icon = item.icon;
          const baseHref = item.href.split("#")[0];
          const active = item.href !== "#" && (pathname === baseHref || (baseHref !== pathPrefix && pathname.startsWith(baseHref)));

          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch={false}
              className={cn(
                "flex h-8 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                item.href === "#" ? "text-slate-600 cursor-not-allowed pointer-events-none" : "text-slate-400 hover:bg-slate-800/60 hover:text-white",
                active && `${colorClass.replace('text-', 'text-').replace('-200', '-300')} bg-slate-800/40`
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </details>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-line bg-[#08101f]/95 backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-72 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="flex min-h-full flex-col px-4 py-4 lg:px-5 lg:py-6">

        {/* Aphrodite Group (Main) */}
        <Link href="/dashboard/networks/aphrodite" className="flex items-center gap-3 mt-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-400/30 bg-blue-400/10 text-blue-300">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">Афродита</p>
          </div>
        </Link>

        <nav className="grid grid-cols-2 gap-1 lg:grid-cols-1 mb-8">
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
                  "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800/60 hover:text-white",
                  active && "border border-blue-400/30 bg-blue-400/10 text-blue-200",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Modules Group */}
        <div className="border-t border-slate-800/60 pt-6">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Модули</p>
          
          <div className="space-y-2">
            <NavGroup title="Зодиак" items={zodiacNavItems} defaultOpen={pathname.includes("/zodiac")} pathPrefix="/dashboard/networks/zodiac" colorClass="text-cyan-200" />
            <NavGroup title="Валюты" items={currencyNavItems} defaultOpen={false} pathPrefix="/dashboard/networks/aphrodite/currency" colorClass="text-green-200" />
            <NavGroup title="Крипта" items={cryptoNavItems} defaultOpen={false} pathPrefix="/dashboard/networks/aphrodite/crypto" colorClass="text-purple-200" />
            <NavGroup title="Металлы" items={metalsNavItems} defaultOpen={false} pathPrefix="/dashboard/networks/aphrodite/metals" colorClass="text-amber-200" />
            <NavGroup title="15 каналов" items={legacyNavItems} defaultOpen={pathname.includes("/dashboard/networks/aphrodite/legacy")} pathPrefix="/dashboard/networks/aphrodite/legacy" colorClass="text-rose-300" />
          </div>
        </div>

        <div className="mt-8 hidden space-y-4 lg:block">
          <section className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Безопасность</p>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              <span className="font-semibold text-emerald-400">Автономный режим активен</span>.
              Все вызовы API отключены.
            </p>
          </section>

          <Link href="/api/auth/logout" className="flex items-center gap-2 mt-4 px-3 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
            <LogOut className="h-4 w-4" />
            Выйти
          </Link>
        </div>

      </div>
    </aside>
  );
}
