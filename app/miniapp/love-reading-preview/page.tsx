import type { Metadata } from "next";
import { ArrowLeft, Heart, HeartHandshake, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { AphroditeMiniAppShell } from "@/components/zodiac-mini-app/AphroditeMiniAppShell";
import { AphroditePrimaryCta } from "@/components/zodiac-mini-app/AphroditePrimaryCta";
import { AphroditeSectionCard } from "@/components/zodiac-mini-app/AphroditeSectionCard";
import { AphroditeStatusPill } from "@/components/zodiac-mini-app/AphroditeStatusPill";
import { getAphroditeVipOfferSections } from "@/lib/zodiac/aphrodite-paywall-readiness";
import { recordAphroditeMiniAppNoopIntegrationPoint } from "@/lib/zodiac/aphrodite-miniapp-analytics-noop-integration-points";

export const metadata: Metadata = {
  title: "AI Love Reading — бесплатный preview",
  description: "Локальный безопасный preview AI Love Reading. Без оплаты и без вызова Telegram API.",
};

const fullLoveReportSection = getAphroditeVipOfferSections().find((section) => section.id === "full-love-report");

const PREVIEW_BLOCKS = [
  {
    id: "main-energy",
    label: "Главная энергия связи",
    text: "Между вами может ощущаться тёплая, но непростая динамика: притяжение есть, и одновременно есть зона напряжения, за которой стоит мягко наблюдать.",
  },
  {
    id: "strength",
    label: "Сильная сторона",
    text: "Ваша искренность часто помогает другому человеку почувствовать себя нужным и увиденным без давления и лишних доказательств.",
  },
  {
    id: "risk",
    label: "Зона риска",
    text: "Возможная зона внимания: чувства могут копиться молча, если их бережно не проговаривать и ждать, что другой всё поймёт сам.",
  },
  {
    id: "next-step",
    label: "Следующий шаг",
    text: "Мягкий следующий шаг: назвать одно настоящее чувство спокойно, коротко и без требования немедленного ответа.",
  },
];

const SAFETY_BOUNDARIES = [
  { token: "no-payment", label: "Нет оплаты" },
  { token: "no-real-vip-unlock", label: "Нет реальной VIP-разблокировки" },
  { token: "no-telegram-api-call", label: "Нет вызова Telegram API" },
  { token: "no-database-write", label: "Нет записи в базу данных" },
  { token: "local-preview-only", label: "Только локальный preview" },
];

const futureReportFallback = {
  title: "Что будет в полном Love Report позже",
  description: "Полная версия будет подключена позже и пока описана только как состав будущего отчёта.",
  includes: [
    "что он/она может чувствовать",
    "почему может отдаляться",
    "главная энергия связи",
    "зона риска",
    "red flags",
    "30-дневный прогноз",
  ],
};

export default function LoveReadingPreviewPage() {
  recordAphroditeMiniAppNoopIntegrationPoint("route-love-reading-opened");
  recordAphroditeMiniAppNoopIntegrationPoint("route-love-reading-preview-viewed");
  recordAphroditeMiniAppNoopIntegrationPoint("route-full-love-report-teaser-viewed");
  recordAphroditeMiniAppNoopIntegrationPoint("route-free-preview-fallback-shown");

  const futureReport = fullLoveReportSection ?? futureReportFallback;

  return (
    <AphroditeMiniAppShell
      eyebrow="Aphrodite"
      title="AI Love Reading"
      description="Бесплатный мягкий preview: главная энергия связи, сильная сторона, зона риска и один следующий шаг."
      statusSlot={<AphroditeStatusPill label="Бесплатный preview" tone="accent" />}
      footerSlot={<FooterActions />}
    >
      <AphroditeSectionCard
        tone="primary"
        eyebrow="Бесплатный результат"
        title="Короткий Love Reading preview"
        description="Это не приговор и не обещание судьбы. Это аккуратная подсказка, которая помогает спокойнее посмотреть на связь."
        actionSlot={<Sparkles className="h-5 w-5 text-rose-200" />}
      >
        <div className="grid gap-2">
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <p className="text-[11px] font-medium text-emerald-300">Сейчас доступно бесплатно</p>
            <p className="mt-1 text-sm leading-6 text-slate-200">
              Четыре коротких блока без оплаты, без VIP-доступа и без сохранения данных.
            </p>
          </div>
        </div>
      </AphroditeSectionCard>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold leading-6 text-white">Ваш preview</h2>
            <p className="text-sm leading-6 text-slate-400">Коротко, спокойно и удобно для чтения с телефона.</p>
          </div>
          <AphroditeStatusPill label="4 блока" tone="muted" />
        </div>

        <div className="grid gap-2">
          {PREVIEW_BLOCKS.map((block, index) => (
            <article key={block.id} className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-200/15 bg-rose-950/25 text-xs font-semibold text-rose-200">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold leading-5 text-white">{block.label}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{block.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <AphroditeSectionCard
        tone="locked"
        eyebrow="Будущий отчёт"
        title="Full Love Report пока закрыт"
        description={futureReport.description}
        actionSlot={<LockKeyhole className="h-5 w-5 text-slate-400" />}
      >
        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-400">Что будет в полном Love Report позже</p>
          <div className="grid gap-2">
            {futureReport.includes.slice(0, 6).map((item) => (
              <div key={item} className="rounded-md border border-slate-700/80 bg-slate-950/40 px-3 py-2 text-sm leading-5 text-slate-300">
                {item}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <AphroditeStatusPill label="Сейчас доступен только бесплатный preview" tone="safe" />
            <AphroditeStatusPill label="Полная версия будет подключена позже" tone="locked" />
            <AphroditeStatusPill label="Нет оплаты" tone="safe" />
            <AphroditeStatusPill label="Нет VIP-разблокировки" tone="safe" />
          </div>
          <AphroditePrimaryCta href="/vip-compatibility-report" variant="locked" icon={<LockKeyhole className="h-4 w-4" />}>
            Preview будущего Full Love Report без доступа
          </AphroditePrimaryCta>
        </div>
      </AphroditeSectionCard>

      <AphroditeSectionCard
        tone="safe"
        eyebrow="Границы безопасности"
        title="Страница ничего не запускает"
        description="Этот экран не вызывает Telegram API, не пишет в базу данных, не включает оплату и не открывает VIP."
        actionSlot={<ShieldCheck className="h-5 w-5 text-emerald-300" />}
      >
        <div className="flex flex-wrap gap-2">
          {SAFETY_BOUNDARIES.map((boundary) => (
            <AphroditeStatusPill key={boundary.token} label={boundary.label} tone="safe" />
          ))}
        </div>
      </AphroditeSectionCard>
    </AphroditeMiniAppShell>
  );
}

function FooterActions() {
  return (
    <div className="grid gap-2 border-t border-white/10 pt-4">
      <AphroditePrimaryCta href="/compatibility" variant="primary" icon={<HeartHandshake className="h-4 w-4" />}>
        Проверить совместимость
      </AphroditePrimaryCta>
      <AphroditePrimaryCta href="/miniapp" variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
        Вернуться к модулям
      </AphroditePrimaryCta>
      <div className="flex items-center justify-center gap-2 pt-1 text-[11px] leading-4 text-slate-500">
        <Heart className="h-3.5 w-3.5 text-rose-300" />
        <span>Бесплатный preview остаётся открытым входом Mini App</span>
      </div>
    </div>
  );
}
