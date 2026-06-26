import Link from "next/link";
import { ClipboardList, FileCheck2, KeyRound, LockKeyhole, Route, ShieldCheck } from "lucide-react";
import {
  APHRODITE_TELEGRAM_STARS_ARCHITECTURE_REVIEW_CLASSIFICATION,
  APHRODITE_TELEGRAM_STARS_ARCHITECTURE_REVIEW_RULE,
  APHRODITE_TELEGRAM_STARS_ARCHITECTURE_REVIEW_TITLE,
  APHRODITE_TELEGRAM_STARS_REQUIRED_FUTURE_ENV_FLAGS,
  getAphroditeTelegramStarsArchitectureBoundaries,
  getAphroditeTelegramStarsArchitectureNextSteps,
  getAphroditeTelegramStarsArchitectureRisks,
  getAphroditeTelegramStarsArchitectureRules,
  getAphroditeTelegramStarsArchitectureSurfaces,
} from "@/lib/zodiac/aphrodite-telegram-stars-payment-architecture-review";

export const metadata = {
  title: APHRODITE_TELEGRAM_STARS_ARCHITECTURE_REVIEW_TITLE,
};

const surfaces = getAphroditeTelegramStarsArchitectureSurfaces();
const rules = getAphroditeTelegramStarsArchitectureRules();
const risks = getAphroditeTelegramStarsArchitectureRisks();
const boundaries = getAphroditeTelegramStarsArchitectureBoundaries();
const nextSteps = getAphroditeTelegramStarsArchitectureNextSteps();

const riskLabel = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
  critical: "критический",
} as const;

const areaLabel = {
  "invoice-creation": "invoice creation",
  "pre-checkout-validation": "pre-checkout validation",
  "successful-payment-handling": "successful_payment handling",
  "payment-ledger": "payment ledger",
  "entitlement-creation": "entitlement creation",
  "product-catalog": "product catalog",
  "owner-review-gate": "owner review gate",
  "environment-flags": "environment flags",
  idempotency: "idempotency",
  "refunds-and-revocation": "refunds/revocation",
  "support-policy": "support policy",
  "security-qa": "security QA",
  analytics: "analytics",
} as const;

export default function AphroditeTelegramStarsPaymentArchitectureReviewPage() {
  const invoiceSurface = surfaces.find((surface) => surface.area === "invoice-creation");
  const preCheckoutSurface = surfaces.find((surface) => surface.area === "pre-checkout-validation");
  const successfulPaymentSurface = surfaces.find((surface) => surface.area === "successful-payment-handling");
  const ledgerSurface = surfaces.find((surface) => surface.area === "payment-ledger");
  const entitlementSurface = surfaces.find((surface) => surface.area === "entitlement-creation");
  const ownerReviewSurface = surfaces.find((surface) => surface.area === "owner-review-gate");

  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Aphrodite / Telegram Stars / architecture review</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{APHRODITE_TELEGRAM_STARS_ARCHITECTURE_REVIEW_TITLE}</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_TELEGRAM_STARS_ARCHITECTURE_REVIEW_CLASSIFICATION}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 169 фиксирует финальный review будущей архитектуры Telegram Stars до invoice builder, pre-checkout,
            successful_payment, payment ledger, entitlement creation и VIP unlock. Это только обзор: оплата не включается,
            Telegram API не вызывается, база данных не меняется.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_TELEGRAM_STARS_ARCHITECTURE_REVIEW_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {boundaries.map((boundary) => (
              <span
                key={boundary.dataBoundary}
                data-boundary={boundary.dataBoundary}
                className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-400"
              >
                {boundary.visibleLabel}
              </span>
            ))}
          </div>
        </header>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Сводка архитектуры</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
            <Metric label="Поверхности" value={String(surfaces.length)} />
            <Metric label="Правила" value={String(rules.length)} />
            <Metric label="Риски" value={String(risks.length)} />
            <Metric label="Статус" value="review-only" />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Все блоки ниже описывают будущий flow. Ни один блок не создаёт invoice, не обрабатывает платежи,
            не пишет ledger, не создаёт entitlement и не открывает VIP.
          </p>
        </section>

        <section className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-6">
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-rose-300" />
            <h2 className="text-xl font-medium text-rose-100">Будущий flow / не реализовано</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <FlowStep title="1. Future invoice flow" surface={invoiceSurface} />
            <FlowStep title="2. Future pre-checkout validation" surface={preCheckoutSurface} />
            <FlowStep title="3. Future successful_payment handling" surface={successfulPaymentSurface} />
            <FlowStep title="4. Payment ledger dependency" surface={ledgerSurface} />
            <FlowStep title="5. Entitlement dependency" surface={entitlementSurface} />
            <FlowStep title="6. Owner review dependency" surface={ownerReviewSurface} />
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Поверхности платёжной архитектуры</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {surfaces.map((surface) => (
              <article key={surface.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-medium text-white">{surface.label}</h3>
                    <p className="mt-1 font-mono text-xs text-slate-500">{areaLabel[surface.area]}</p>
                  </div>
                  <span className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                    риск: {riskLabel[surface.riskLevel]}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{surface.currentState}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Будущая ответственность: {surface.futureResponsibility.join("; ")}.
                </p>
                <p className="mt-2 text-xs leading-5 text-rose-200/80">
                  Заблокировано в Package 169: {surface.blockedInThisPackage.join("; ")}.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-medium text-white">Будущие правила запуска</h2>
            </div>
            <div className="mt-5 space-y-3">
              {rules.map((rule) => (
                <article key={rule.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                  <h3 className="text-sm font-medium text-white">{rule.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{rule.visibleRule}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Требуются проверки: {rule.requiredChecks.join(", ")}. Заблокировано до: {rule.blockedUntil.join(", ")}.
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-medium text-white">Будущие env flags</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Эти flags задокументированы только для будущей реализации. Package 169 их не читает и не применяет.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {APHRODITE_TELEGRAM_STARS_REQUIRED_FUTURE_ENV_FLAGS.map((flag) => (
                  <span key={flag} className="rounded-md border border-slate-700 bg-black/30 px-3 py-2 font-mono text-xs text-slate-300">
                    {flag}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-medium text-white">Idempotency и риск duplicate payment</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Duplicate payment event должен падать без idempotency и payment ledger. Entitlement creation не может происходить дважды.
              </p>
            </section>

            <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-medium text-white">Готовность refund/support</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Перед оплатой нужны support/refund policy, revoke flow и audit reason для спорных платежей.
              </p>
            </section>

            <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-medium text-white">Требования security QA</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Package 167 и Package 168 должны оставаться PASS: no invoice, no payment handler, no ledger write,
                no entitlement creation, no Telegram API call, no VIP unlock.
              </p>
            </section>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-medium text-white">Риски и mitigations</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {risks.map((risk) => (
              <article key={risk.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-medium text-white">{risk.label}</h3>
                  <span className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                    риск: {riskLabel[risk.riskLevel]}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{risk.risk}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">Снижение риска: {risk.mitigation.join("; ")}.</p>
                <p className="mt-2 text-xs leading-5 text-rose-200/80">QA должен падать если: {risk.mustFailIf.join("; ")}.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-6">
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-5 w-5 text-rose-300" />
            <h2 className="text-xl font-medium text-rose-100">Границы безопасности</h2>
          </div>
          <div className="mt-5 space-y-2">
            {boundaries.map((boundary) => (
              <div key={boundary.dataBoundary} data-boundary={boundary.dataBoundary} className="rounded-lg border border-rose-900/40 bg-black/20 p-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-white">{boundary.visibleLabel}</div>
                    <div className="mt-1 text-xs leading-5 text-rose-100/80">
                      Разрешено сейчас: {boundary.allowedNow.join(", ")}. Заблокировано до: {boundary.blockedUntil.join(", ")}.
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md border border-rose-900/50 bg-rose-950 px-2 py-0.5 text-[11px] text-rose-100">
                    риск: {riskLabel[boundary.riskLevel]}
                  </span>
                </div>
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
                  {step.package} - {step.title}:
                </span>{" "}
                {step.purpose}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Package 170 не начинается автоматически.</p>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/owner-review-gate" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Owner Review Gate</Link>
            <Link href="/dashboard/networks/zodiac/telegram-stars-invoice-builder-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton invoice builder</Link>
            <Link href="/dashboard/networks/zodiac/payment-ledger-design" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Дизайн payment ledger</Link>
            <Link href="/dashboard/networks/zodiac/product-catalog-finalization" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Каталог продуктов</Link>
            <Link href="/dashboard/networks/zodiac/server-entitlement-check-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton server-side entitlement</Link>
            <Link href="/dashboard/networks/zodiac/vip-access-security-suite" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Security QA VIP-доступа</Link>
            <Link href="/miniapp/love-reading-preview" className="text-rose-300 underline underline-offset-4 hover:text-rose-200">Free Love Reading Preview</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-black/30 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 break-words text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function FlowStep({
  title,
  surface,
}: {
  title: string;
  surface: ReturnType<typeof getAphroditeTelegramStarsArchitectureSurfaces>[number] | undefined;
}) {
  return (
    <article className="rounded-lg border border-rose-900/40 bg-black/20 p-4">
      <h3 className="text-sm font-medium text-white">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-rose-100/80">{surface?.currentState ?? "review-only: не реализовано"}</p>
      <p className="mt-3 text-xs leading-5 text-slate-400">
        До реализации: {surface?.requiredBeforeImplementation.join("; ") ?? "owner review; security QA"}.
      </p>
    </article>
  );
}
