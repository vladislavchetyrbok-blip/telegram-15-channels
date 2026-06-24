import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import {
  Activity,
  BarChart3,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  HeartHandshake,
  Database,
  ListPlus,
  LockKeyhole,
  MessageSquareText,
  RadioTower,
  GitBranch,
  Rocket,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ShoppingCart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { getUnifiedSystemStatus } from "@/lib/unified-system-status";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";
import { zodiacPlatformSummary } from "@/lib/zodiac-platform-management";

export const dynamic = "force-dynamic";

const platformSections = [
  {
    title: "Launch Control — Запуск",
    href: "/dashboard/networks/zodiac/launch",
    icon: Rocket,
    caption: "Контроль готовности модуля Зодиак к первым пользователям, 20 пользователям и массовому запуску.",
    tone: "emerald",
  },
  {
    title: "Zodiac Network — Каналы",
    href: "/dashboard/networks/zodiac/channels",
    icon: RadioTower,
    caption: "13 каналов Zodiac, Telegram handles, startapp, статусы навигации.",
    tone: "violet",
  },
  {
    title: "Zodiac Studio — Контент",
    href: "/dashboard/networks/zodiac/content",
    icon: FileText,
    caption: "Шаблоны, рубрики, CTA/startapp preview и local-only Template Studio.",
    tone: "violet",
  },
  {
    title: "Zodiac Publisher — Публикации",
    href: "/dashboard/networks/zodiac/publishing",
    icon: Rocket,
    caption: "Ежедневный маршрут, dry-run и безопасная проверка расписания.",
    tone: "amber",
  },
  {
    title: "Zodiac Pulse — Аналитика",
    href: "/dashboard/networks/zodiac/analytics",
    icon: BarChart3,
    caption: "Privacy-safe counters, funnel первых пользователей и Redis.",
    tone: "cyan",
  },
  {
    title: "Zodiac Voice — Отзывы",
    href: "/dashboard/networks/zodiac/feedback",
    icon: MessageSquareText,
    caption: "Sanitized отзывы, P0/P1 triage и проверка на реальных устройствах.",
    tone: "emerald",
  },
  {
    title: "Zodiac Shield — Безопасность",
    href: "/dashboard/networks/zodiac/security",
    icon: LockKeyhole,
    caption: "Ledger protected, access control, auth gate settings.",
    tone: "emerald",
  },
  {
    title: "Zodiac Mini — Mini App",
    href: "/compatibility",
    icon: Smartphone,
    caption: "Тестирование Mini App UI, startapp parameters, visual QA.",
    tone: "cyan",
  },
  {
    title: "Mini App Audit",
    href: "/dashboard/networks/zodiac/miniapp-audit",
    icon: Smartphone,
    caption: "Package 101 - Audit of all Mini App routing and entry points.",
    tone: "cyan",
  },
  {
    title: "Mini App Hub",
    href: "/miniapp",
    icon: Smartphone,
    caption: "Package 106 - Safe static Mini App hub connecting mock modules.",
    tone: "violet",
  },
  {
    title: "Mini App Architecture",
    href: "/dashboard/networks/zodiac/miniapp-architecture",
    icon: ListPlus,
    caption: "Package 102 - Read-only architecture spec for upcoming Mini App modules.",
    tone: "cyan",
  },
  {
    title: "Mini App Route Safety",
    href: "/dashboard/networks/zodiac/miniapp-route-safety",
    icon: ShieldCheck,
    caption: "Package 108 - Route safety baseline and QA assertions for all Mini App mock routes.",
    tone: "emerald",
  },
  {
    title: "Mini App CTA Audit",
    href: "/dashboard/networks/zodiac/miniapp-cta-audit",
    icon: ShieldCheck,
    caption: "Package 111 - Audit of all Mini App CTAs.",
    tone: "emerald",
  },
  {
    title: "Mini App Readiness",
    href: "/dashboard/networks/zodiac/miniapp-readiness",
    icon: ShieldCheck,
    caption: "Package 112 - Read-only readiness summary for Zodiac Mini App.",
    tone: "cyan",
  },
  {
    title: "Mini App Link Smoke",
    href: "/dashboard/networks/zodiac/miniapp-link-smoke",
    icon: ShieldCheck,
    caption: "Package 113 - Internal link smoke matrix.",
    tone: "cyan",
  },
  {
    title: "Compatibility Flow Safety",
    href: "/dashboard/networks/zodiac/compatibility-flow-safety",
    icon: ShieldCheck,
    caption: "Package 114 - Audit of compatibility flow safety boundaries.",
    tone: "cyan",
  },
  {
    title: "Monetization Architecture",
    href: "/dashboard/networks/zodiac/miniapp-monetization-architecture",
    icon: ShieldCheck,
    caption: "Package 115 - Monetization architecture spec.",
    tone: "cyan",
  },
  {
    title: "Entitlement Data Model",
    href: "/dashboard/networks/zodiac/miniapp-entitlements",
    icon: ShieldCheck,
    caption: "Package 116 - Entitlement data model spec.",
    tone: "cyan",
  },
  {
    title: "Production Wiring Spec",
    href: "/dashboard/networks/zodiac/miniapp-production-wiring",
    icon: ShieldCheck,
    caption: "Package 117 - Telegram Mini App production wiring spec.",
    tone: "cyan",
  },
  {
    title: "Payment Provider Matrix",
    href: "/dashboard/networks/zodiac/miniapp-payment-matrix",
    icon: ShieldCheck,
    caption: "Package 118 - Payment provider decision matrix.",
    tone: "cyan",
  },
  {
    title: "Risk Register & Gates",
    href: "/dashboard/networks/zodiac/miniapp-risk-register",
    icon: ShieldCheck,
    caption: "Package 119 - Production risk register and rollout gates.",
    tone: "cyan",
  },
  {
    title: "Master Control Index",
    href: "/dashboard/networks/zodiac/miniapp-master-index",
    icon: ShieldCheck,
    caption: "Package 120 - Mini App master control index.",
    tone: "cyan",
  },
  {
    title: "Real Implementation Path",
    href: "/dashboard/networks/zodiac/real-implementation-path",
    icon: GitBranch,
    caption: "Package 122 - Next real implementation path.",
    tone: "cyan",
  },
  {
    title: "Aphrodite Product Remediation",
    href: "/dashboard/networks/zodiac/aphrodite-product-remediation",
    icon: GitBranch,
    caption: "Package 134 - Emotional product remediation plan.",
    tone: "cyan",
  },
  {
    title: "Telegram initData Validation",
    href: "/dashboard/networks/zodiac/telegram-initdata-validation",
    icon: ShieldCheck,
    caption: "Package 123 - initData validation foundation.",
    tone: "cyan",
  },
  {
    title: "User Profile Foundation",
    href: "/dashboard/networks/zodiac/user-profile-foundation",
    icon: Database,
    caption: "Package 124 - User profile database foundation.",
    tone: "cyan",
  },
  {
    title: "Product Catalog Foundation",
    href: "/dashboard/networks/zodiac/product-catalog-foundation",
    icon: ShoppingCart,
    caption: "Package 125 - Define purchasable items and metadata.",
    tone: "violet",
  },
  {
    title: "Entitlement Foundation",
    href: "/dashboard/networks/zodiac/entitlement-foundation",
    icon: ShieldCheck,
    caption: "Package 126 - Entitlement model foundation.",
    tone: "violet",
  },
  {
    title: "VIP Access Boundary",
    href: "/dashboard/networks/zodiac/vip-access-boundary",
    icon: ShieldCheck,
    caption: "Package 127 - Local access boundary.",
    tone: "violet",
  },
  {
    title: "VIP Compatibility Report",
    href: "/dashboard/networks/zodiac/vip-compatibility-report-foundation",
    icon: ShieldCheck,
    caption: "Package 128 - Content foundation.",
    tone: "violet",
  },
  {
    title: "VIP Report Preview",
    href: "/dashboard/networks/zodiac/vip-compatibility-report-preview",
    icon: ShieldCheck,
    caption: "Package 129 - UI Preview.",
    tone: "violet",
  },
  {
    title: "Настройки модуля Зодиак",
    href: "/dashboard/networks/zodiac/settings",
    icon: Settings,
    caption: "Read-only центр окружения, режимов, ссылок и ручных действий.",
    tone: "slate",
  },
] as const;

export default async function ZodiacNetworkWorkspacePage() {
  requireDashboardPageAccess("/dashboard/networks/zodiac");
  const status = await getUnifiedSystemStatus();
  const attentionCount = status.autopublish.failedToday + status.autopublish.blockedToday + status.content.blocked + zodiacPlatformSummary.problems;

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
                <AphroditePageHeader
          title="Запуск Зодиака"
          description="Управление модулем Зодиак внутри Афродиты."
          badgeText="Обзор модуля"
          icon={Sparkles}
          safetyLocked={true}
          safetyMessage="Read-only mode"
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OperatorCard title="Zodiac Network" value={zodiacPlatformSummary.totalChannels} caption="активная сеть" details={["general + 12 знаков", "handles доступны", "startapp links готовы"]} icon={RadioTower} tone="violet" />
          <OperatorCard title="Публикации сегодня" value={`${status.autopublish.publishedToday}/13`} caption="операторский счётчик" details={["daily ON", "backup 09:30", "live из UI нет"]} icon={CalendarClock} tone="cyan" />
          <OperatorCard title="Требует внимания" value={attentionCount} caption={attentionCount > 0 ? "есть пункты для проверки" : "красных пунктов нет"} details={[`failed: ${status.autopublish.failedToday}`, `blocked: ${status.autopublish.blockedToday}`, `channel risks: ${zodiacPlatformSummary.problems}`]} icon={ShieldCheck} tone={attentionCount > 0 ? "amber" : "emerald"} />
          <OperatorCard title="Soft launch" value="GO" caption="первые 5 пользователей" details={["watch funnel", "collect feedback", "20 users позже"]} icon={HeartHandshake} tone="emerald" />
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Разделы модуля Зодиак</h2>
              <p className="mt-1 text-sm text-slate-400">Единый доступ ко всем модулям платформы.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {platformSections.map((section) => (
              <PlatformSectionCard key={section.title} {...section} />
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-emerald-900/30 bg-emerald-900/10 p-5 text-emerald-400 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Zodiac Control автономен</h2>
                <p className="mt-2 text-sm leading-6">
                  Dashboard показывает состояние платформы. Live-публикация, weekly live и ledger writes не запускаются отсюда напрямую.
                </p>
              </div>
              <CheckCircle2 className="h-6 w-6 shrink-0" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-100">Что делать дальше</h2>
            <ol className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
              <li>1. Включить защиту dashboard в Vercel</li>
              <li>2. Пригласить первых 5 пользователей</li>
              <li>3. Смотреть аналитику</li>
              <li>4. Внести отзывы</li>
              <li>5. Исправить P0/P1</li>
              <li>6. Только потом идти к 20 пользователям</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}

function PlatformSectionCard({ title, href, icon: Icon, caption, tone }: { title: string; href: string; icon: LucideIcon; caption: string; tone: Tone }) {
  return (
    <Link href={href} prefetch={false} className="group flex min-h-40 items-start gap-4 rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${toneClasses[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-slate-100 group-hover:text-violet-900">{title}</span>
        <span className="mt-2 block text-sm leading-6 text-slate-400">{caption}</span>
      </span>
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
  tone: Tone;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-100">{value}</p>
          <p className="mt-1 text-sm font-medium text-slate-400">{caption}</p>
        </div>
        <span className={`rounded-lg border p-2 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {details.map((detail) => (
          <span key={detail} className="rounded-full border border-slate-800 bg-slate-50 px-2.5 py-1 text-xs text-slate-400">
            {detail}
          </span>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      <span className="opacity-75">{label}:</span>
      <span>{value}</span>
    </span>
  );
}

function StatusPill({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClasses[tone]}`}>
      <p className="text-xs uppercase tracking-[0.18em] opacity-75">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

type Tone = "violet" | "cyan" | "emerald" | "amber" | "rose" | "slate";

const toneClasses: Record<Tone, string> = {
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  emerald: "border-emerald-900/30 bg-emerald-900/10 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-900/30 bg-rose-900/10 text-rose-700",
  slate: "border-slate-800 bg-slate-50 text-slate-700",
};
