import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, Fingerprint, Heart, HeartHandshake, LockKeyhole, Moon, ShieldCheck, Sparkles, Star } from "lucide-react";

import { AphroditeMiniAppShell } from "@/components/zodiac-mini-app/AphroditeMiniAppShell";
import { AphroditePrimaryCta } from "@/components/zodiac-mini-app/AphroditePrimaryCta";
import { AphroditeSectionCard } from "@/components/zodiac-mini-app/AphroditeSectionCard";
import { AphroditeStatusPill } from "@/components/zodiac-mini-app/AphroditeStatusPill";
import { createAphroditeLoveReadingFoundationPreview } from "@/lib/zodiac/aphrodite-ai-love-reading-foundation";
import { recordAphroditeMiniAppNoopIntegrationPoint } from "@/lib/zodiac/aphrodite-miniapp-analytics-noop-integration-points";

export const metadata: Metadata = {
  title: "Aphrodite Mini App",
  description: "Упрощённый Mini App экран с AI Love Reading, совместимостью, матрицей судьбы и гороскопами.",
};

const lovePreview = createAphroditeLoveReadingFoundationPreview({
  firstName: "Вы",
  partnerName: "Он/она",
  firstSign: "leo",
  partnerSign: "scorpio",
});

const previewLines = [
  { label: "Главная энергия", value: lovePreview.connectionEnergy },
  { label: "Сильная сторона", value: lovePreview.strength },
  { label: "Зона риска", value: lovePreview.riskZone },
  { label: "Следующий шаг", value: lovePreview.nextStep },
];

const safetyBoundaries = ["Без оплаты", "Без VIP-разблокировки", "Без Telegram API", "Без записи в базу данных", "Без production-запуска"];

const secondaryModules: Array<{
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}> = [
  {
    title: "Совместимость",
    description: "Проверить, как звучит ваша пара и где лучше говорить мягче.",
    href: "/compatibility?startapp=compat_love",
    icon: HeartHandshake,
  },
  {
    title: "Матрица судьбы",
    description: "Матрица судьбы по дате рождения в безопасном текстовом вводе.",
    href: "/birth-matrix",
    icon: Fingerprint,
  },
  {
    title: "Гороскоп на день",
    description: "Короткий прогноз дня и личный фокус без лишней навигации.",
    href: "/compatibility",
    icon: Star,
  },
  {
    title: "Гороскоп на неделю",
    description: "Прогноз на неделю для выбранного знака.",
    href: "/compatibility?startapp=week",
    icon: CalendarDays,
  },
  {
    title: "Гороскоп на месяц",
    description: "Месячный прогноз в общем Mini App flow.",
    href: "/compatibility?startapp=vip",
    icon: Moon,
  },
];

export default function MiniAppHubPage() {
  recordAphroditeMiniAppNoopIntegrationPoint("route-miniapp-opened");

  return (
    <AphroditeMiniAppShell
      eyebrow="Aphrodite"
      title="AI Love Reading"
      description="Узнай, что между вами происходит, что он может чувствовать и где сейчас главная зона риска."
      statusSlot={<AphroditeStatusPill label="Бесплатный preview" tone="accent" />}
      footerSlot={<FooterLinks />}
    >
      <AphroditeSectionCard
        tone="primary"
        eyebrow="Главный вход"
        title="Бесплатный Love Reading preview"
        description="Один мягкий разбор: главная энергия связи, сильная сторона, зона риска и следующий шаг."
      >
        <AphroditePrimaryCta href="/miniapp/love-reading-preview" icon={<Sparkles className="h-4 w-4" />}>
          Открыть бесплатный Love Reading preview
        </AphroditePrimaryCta>
        <p className="mt-2 text-center text-[11px] leading-4 text-slate-400">Только бесплатный preview / без оплаты</p>

        <div className="mt-4 rounded-lg border border-white/10 bg-black/25 p-3">
          <p className="text-xs font-medium text-emerald-300">Пример бесплатного preview</p>
          <div className="mt-3 space-y-2">
            {previewLines.map((line) => (
              <div key={line.label} className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">
                <p className="text-[11px] font-medium text-rose-200">{line.label}</p>
                <p className="mt-1 text-sm leading-5 text-slate-200">{line.value}</p>
              </div>
            ))}
          </div>
        </div>
      </AphroditeSectionCard>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold leading-6 text-white">Ещё модули</h2>
            <p className="text-sm leading-6 text-slate-400">Совместимость, Матрица судьбы и гороскопы доступны ниже.</p>
          </div>
          <AphroditeStatusPill label="дополнительно" tone="muted" />
        </div>

        <div className="grid gap-2">
          {secondaryModules.map((module) => (
            <Link
              key={module.title}
              href={module.href}
              className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.045] p-3 transition hover:border-rose-200/25 hover:bg-white/[0.07]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-rose-200">
                <module.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">{module.title}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-400">{module.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <AphroditeSectionCard
        tone="locked"
        eyebrow="Будущий premium"
        title="Full Love Report пока закрыт"
        description="Будущий VIP teaser: что он/она может чувствовать, почему отдаляется, прогноз на 30 дней, red flags и личный совет. Это только preview будущего формата, без оплаты и без VIP-разблокировки."
        actionSlot={<LockKeyhole className="h-5 w-5 text-slate-400" />}
      >
        <AphroditePrimaryCta href="/vip-compatibility-report" variant="locked" icon={<LockKeyhole className="h-4 w-4" />}>
          Preview будущего VIP отчёта без доступа
        </AphroditePrimaryCta>
      </AphroditeSectionCard>

      <AphroditeSectionCard
        tone="safe"
        eyebrow="Границы безопасности"
        title="Mini App ничего не запускает из этого экрана"
        description="Экран открывает только существующие безопасные routes и не меняет production delivery."
        actionSlot={<ShieldCheck className="h-5 w-5 text-emerald-300" />}
      >
        <div className="flex flex-wrap gap-2">
          {safetyBoundaries.map((boundary) => (
            <AphroditeStatusPill key={boundary} label={boundary} tone="safe" />
          ))}
        </div>
      </AphroditeSectionCard>
    </AphroditeMiniAppShell>
  );
}

function FooterLinks() {
  return (
    <div className="space-y-3 border-t border-white/10 pt-4">
      <div className="grid grid-cols-2 gap-2">
        <Link href="/mystic-numbers" className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 text-center text-xs font-medium text-slate-300">
          Мистические числа
        </Link>
        <Link href="/affirmations" className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 text-center text-xs font-medium text-slate-300">
          Аффирмации
        </Link>
      </div>
      <div className="flex items-center justify-center gap-2 text-[11px] leading-4 text-slate-500">
        <Heart className="h-3.5 w-3.5 text-rose-300" />
        <span>Сохранены безопасные отступы Telegram и fallback в браузере</span>
      </div>
    </div>
  );
}
