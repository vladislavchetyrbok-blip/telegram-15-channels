import Link from "next/link";
import { ArrowRight, FileText, Heart, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import {
  APHRODITE_PAYWALL_READINESS_CLASSIFICATION,
  getAphroditePaywallBoundaries,
  getAphroditePaywallNextSteps,
  getAphroditePaywallReadinessItems,
  getAphroditePaywallTrustBlocks,
  getAphroditeVipOfferSections,
} from "@/lib/zodiac/aphrodite-paywall-readiness";

export const metadata = {
  title: "Подготовка paywall и VIP-оффера",
};

const readinessItems = getAphroditePaywallReadinessItems();
const offerSections = getAphroditeVipOfferSections();
const trustBlocks = getAphroditePaywallTrustBlocks();
const boundaries = getAphroditePaywallBoundaries();
const nextSteps = getAphroditePaywallNextSteps();

const placementLabel = {
  "before-offer": "перед оффером",
  "inside-offer": "внутри оффера",
  "footer": "нижний блок",
} as const;

const riskLabel = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
  critical: "критический",
} as const;

const blockedActions = [
  "покупка VIP",
  "запуск оплаты",
  "разблокировка отчёта",
  "оформление регулярного доступа",
  "активация VIP",
  "выдача доступа после платежа",
];

export default function AphroditePaywallReadinessPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Aphrodite / подготовка оффера</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">Подготовка paywall и VIP-оффера</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_PAYWALL_READINESS_CLASSIFICATION}</p>
          <p className="max-w-3xl text-lg leading-8 text-slate-400">
            Этот раздел готовит безопасную упаковку будущего Full Love Report и VIP-модулей. Сейчас доступен
            бесплатный preview, а полная версия будет подключена позже. Здесь нет оплаты, нет Telegram Stars
            invoice, нет реальной VIP-разблокировки и нет записи в базу данных.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {boundaries.slice(0, 5).map((boundary) => (
              <span
                key={boundary.token}
                data-boundary={boundary.token}
                className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-400"
              >
                {boundary.label}
              </span>
            ))}
          </div>
        </header>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Бесплатный preview и будущий Full Love Report</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Бесплатный Love Reading preview показывает первую ценность. Полный Love Report позже сможет дать
            глубину: чувства, причины дистанции, прогноз на 30 дней, red flags и личные рекомендации.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {readinessItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-white">{item.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{item.status === "available-now" ? "доступно сейчас" : "подготовка на будущее"}</p>
                  </div>
                  <Sparkles className="h-4 w-4 shrink-0 text-rose-400" />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.summary}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-400">
                  {item.userValue.map((value) => (
                    <li key={value}>{value}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <Layers3 className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Будущие VIP-уровни оффера</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {offerSections.map((section) => (
              <div key={section.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="text-xs uppercase tracking-wide text-emerald-400">{section.shortLabel}</div>
                <h3 className="mt-1 text-base font-medium text-white">{section.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{section.description}</p>
                <div className="mt-3 text-xs font-medium text-slate-300">Входит в упаковку:</div>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-400">
                  {section.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="mt-3 text-xs font-medium text-rose-300">Ещё не подключено:</div>
                <p className="mt-1 text-xs text-slate-500">{section.notConnectedYet.join(" / ")}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Блоки доверия</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {trustBlocks.map((block) => (
              <div key={block.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="text-sm font-medium text-white">{block.title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{block.text}</p>
                <p className="mt-2 text-[11px] text-slate-600">размещение: {placementLabel[block.placement]}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-medium text-white">Границы безопасности</h2>
          </div>
          <div className="mt-5 space-y-2">
            {boundaries.map((boundary) => (
              <div key={boundary.token} data-boundary={boundary.token} className="flex items-start justify-between gap-4 rounded-lg border border-slate-800 bg-black/30 p-3">
                <div>
                  <div className="text-sm font-medium text-slate-100">{boundary.label}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-500">{boundary.detail}</div>
                </div>
                <span className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                  риск: {riskLabel[boundary.riskLevel]}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-6">
          <h2 className="text-xl font-medium text-rose-100">Заблокированные действия</h2>
          <p className="mt-2 text-sm text-rose-100/70">
            Эти фразы не используются как активные кнопки или призывы. Они перечислены только как запрет для QA.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {blockedActions.map((action) => (
              <span key={action} className="rounded-md border border-rose-900/50 bg-black/30 px-2 py-1 text-rose-200">
                запрещено: {action}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-medium text-white">Следующий рекомендуемый пакет</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
            {nextSteps.map((step) => (
              <li key={step.package}>
                <span className="text-white">{step.package} — {step.title}:</span> {step.purpose}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Package 155 не начинается автоматически.</p>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/ai-love-reading-foundation" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">AI Love Reading Foundation</Link>
            <Link href="/dashboard/networks/zodiac/public-bot-profile-launch-packaging" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Public Bot Launch Packaging</Link>
            <Link href="/dashboard/networks/zodiac/entitlement-enforcement-design" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Дизайн VIP-доступа</Link>
            <Link href="/dashboard/networks/zodiac/vip-access-boundary-implementation-plan" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">План VIP-границы</Link>
            <Link href="/dashboard/networks/zodiac/vip-access-guard-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton VIP-guard</Link>
            <Link href="/dashboard/networks/zodiac/vip-guard-integration-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Review VIP-guard</Link>
            <Link href="/dashboard/networks/zodiac/vip-free-preview-fallback-map" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Карта fallback VIP</Link>
            <Link href="/miniapp/love-reading-preview" className="inline-flex items-center gap-1 text-rose-300 underline underline-offset-4 hover:text-rose-200">
              Love Reading preview <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
