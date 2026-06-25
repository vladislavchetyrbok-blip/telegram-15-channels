import Link from "next/link";
import { FileText, KeyRound, Layers3, ListChecks, ShieldCheck } from "lucide-react";
import {
  APHRODITE_ENTITLEMENT_CLASSIFICATION,
  APHRODITE_ENTITLEMENT_FIELDS,
  getAphroditeEntitlementBoundaries,
  getAphroditeEntitlementNextSteps,
  getAphroditeEntitlementRules,
  getAphroditeEntitlementSurfaces,
} from "@/lib/zodiac/aphrodite-entitlement-enforcement-design";

export const metadata = {
  title: "Дизайн проверки VIP-доступа",
};

const surfaces = getAphroditeEntitlementSurfaces();
const rules = getAphroditeEntitlementRules();
const boundaries = getAphroditeEntitlementBoundaries();
const nextSteps = getAphroditeEntitlementNextSteps();

const riskLabel = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
  critical: "критический",
} as const;

const classificationLabel = {
  "free-preview": "бесплатный предварительный результат",
  "future-vip-teaser": "будущий VIP-анонс",
  "client-side-risk": "клиентский риск",
  "design-only": "только дизайн",
} as const;

const blockedClientShortcuts = [
  "localStorage или sessionStorage как доказательство VIP",
  "query param, startapp или route param как доказательство VIP",
  "кнопка UI, которая сама открывает закрытый раздел",
  "client state, vipFreeAccess или optimistic unlock как источник истины",
  "показ полного результата до server-side решения по entitlement",
];

export default function AphroditeEntitlementEnforcementDesignPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Aphrodite / дизайн доступа</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">Дизайн проверки VIP-доступа</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_ENTITLEMENT_CLASSIFICATION}</p>
          <p className="max-w-3xl text-lg leading-8 text-slate-400">
            Этот раздел фиксирует будущую модель защиты VIP-доступа до любой реальной оплаты. Клиентский UI не должен сам решать, есть ли у
            пользователя VIP. Доступ должен проверяться server-side через entitlement, связанный с пользователем, продуктом, сроком действия,
            payment ledger и owner review.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {boundaries.map((boundary) => (
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

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <Layers3 className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Текущие VIP-поверхности</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Поверхности ниже не получают реальный доступ в этом пакете. Цель обзора — заранее описать, что позже должно закрываться
            server-side entitlement, а что остаётся только бесплатным предварительным результатом или анонсом.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {surfaces.map((surface) => (
              <article key={surface.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-medium text-white">{surface.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{surface.productId}</p>
                  </div>
                  <span className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-300">
                    {classificationLabel[surface.currentClassification]}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{surface.currentState}</p>
                <div className="mt-3 text-xs font-medium text-slate-200">Будущая защита:</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">{surface.futureRequirement}</p>
                <div className="mt-3 text-xs font-medium text-slate-200">Закрытый слой:</div>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-400">
                  {surface.protectedContent.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Правила будущего entitlement</h2>
          </div>
          <div className="mt-5 space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="text-sm font-medium text-white">{rule.label}</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{rule.description}</p>
                <div className="mt-3 grid gap-3 text-xs md:grid-cols-2">
                  <p className="rounded-md border border-rose-900/40 bg-rose-950/20 p-3 text-rose-100/80">
                    Запрещённый обход: {rule.blockedShortcut}
                  </p>
                  <p className="rounded-md border border-emerald-900/40 bg-emerald-950/10 p-3 text-emerald-100/80">
                    Нужная проверка: {rule.requiredServerCheck}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-medium text-white">Обязательные server-side проверки</h2>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
              {surfaces[0]?.requiredServerChecks.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-medium text-white">Поля будущего entitlement</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Это только дизайн полей. Package 155 не добавляет схему, миграцию, запись в базу данных или создание entitlement.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {APHRODITE_ENTITLEMENT_FIELDS.map((field) => (
                <span key={field} className="rounded-md border border-slate-700 bg-black/30 px-2 py-1 text-slate-300">
                  {field}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-6">
          <h2 className="text-xl font-medium text-rose-100">Заблокированные клиентские обходы</h2>
          <p className="mt-2 text-sm leading-6 text-rose-100/70">
            Эти пункты нельзя использовать как источник VIP-доступа. Они могут быть навигацией или локальным draft-состоянием, но не доказательством доступа.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-rose-100/80">
            {blockedClientShortcuts.map((clientBypass) => (
              <li key={clientBypass}>{clientBypass}</li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-medium text-white">Зависимость от payment ledger</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Будущий entitlement не должен появляться без связи с payment ledger. Минимальная связь: productId, sourcePaymentId, status,
              срок действия, auditReason и проверяемая история изменения статуса.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-medium text-white">Зависимость от owner review</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              До реального запуска владелец должен подтвердить правила доступа, поддержку, возвраты, ручную проверку спорных случаев и
              безопасный откат. Package 155 фиксирует только дизайн, без включения production-gating.
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-emerald-900/40 bg-emerald-950/10 p-6">
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

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-medium text-white">Следующий рекомендуемый пакет</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
            {nextSteps.map((step) => (
              <li key={step.package}>
                <span className="text-white">
                  {step.package} — {step.title}:
                </span>{" "}
                {step.purpose}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Package 156 не начинается автоматически.</p>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/paywall-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Подготовка paywall</Link>
            <Link href="/dashboard/networks/zodiac/aphrodite-product-remediation" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Aphrodite Product Remediation</Link>
            <Link href="/dashboard/networks/zodiac/first-result-experience" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">First Result Experience</Link>
            <Link href="/dashboard/networks/zodiac/ai-love-reading-foundation" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">AI Love Reading Foundation</Link>
            <Link href="/dashboard/networks/zodiac/public-bot-profile-launch-packaging" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Public Bot Launch Packaging</Link>
            <Link href="/dashboard/networks/zodiac/vip-access-boundary-implementation-plan" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">План VIP-границы</Link>
            <Link href="/dashboard/networks/zodiac/vip-access-guard-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton VIP-guard</Link>
            <Link href="/dashboard/networks/zodiac/vip-guard-integration-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Review VIP-guard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
