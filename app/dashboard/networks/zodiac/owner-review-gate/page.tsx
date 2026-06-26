import Link from "next/link";
import { ClipboardCheck, FileCheck2, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import {
  APHRODITE_OWNER_REVIEW_GATE_CLASSIFICATION,
  APHRODITE_OWNER_REVIEW_GATE_RULE,
  APHRODITE_OWNER_REVIEW_GATE_TITLE,
  evaluateAphroditeOwnerReviewGate,
  getAphroditeOwnerReviewBoundaries,
  getAphroditeOwnerReviewChecklist,
  getAphroditeOwnerReviewNextSteps,
} from "@/lib/zodiac/aphrodite-owner-review-gate";

export const metadata = {
  title: APHRODITE_OWNER_REVIEW_GATE_TITLE,
};

const gateResult = evaluateAphroditeOwnerReviewGate({
  ownerApproved: true,
  paymentsApproved: true,
  starsApproved: true,
  entitlementsApproved: true,
  databaseApproved: true,
  supportApproved: true,
  securityQaApproved: true,
  backupFresh: true,
});
const checklist = getAphroditeOwnerReviewChecklist();
const boundaries = getAphroditeOwnerReviewBoundaries();
const nextSteps = getAphroditeOwnerReviewNextSteps();

const riskLabel = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
  critical: "критический",
} as const;

export default function AphroditeOwnerReviewGatePage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <LockKeyhole className="h-4 w-4" />
            <span>Aphrodite / owner review / gate VIP-запуска</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{APHRODITE_OWNER_REVIEW_GATE_TITLE}</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_OWNER_REVIEW_GATE_CLASSIFICATION}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 168 добавляет обязательный ручной owner review перед любым будущим запуском оплаты, Telegram Stars,
            entitlement creation, VIP-разблокировки, production DB write или live launch. Это только safety gate:
            страница ничего не включает и не является runtime-переключателем.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_OWNER_REVIEW_GATE_RULE}
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
            <ShieldCheck className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Сводка owner review</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
            <Metric label="Owner review" value="обязателен" />
            <Metric label="Запуск" value="не разрешён" />
            <Metric label="Оплата" value="нет" />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">{gateResult.visibleMessage}</p>
        </section>

        <section className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-6">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-rose-300" />
            <h2 className="text-xl font-medium text-rose-100">Результат owner review</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
            <ResultLine label="approvedForLaunch" value={String(gateResult.approvedForLaunch)} />
            <ResultLine label="paymentsCanBeEnabledNow" value={String(gateResult.paymentsCanBeEnabledNow)} />
            <ResultLine label="vipCanBeEnabledNow" value={String(gateResult.vipCanBeEnabledNow)} />
            <ResultLine label="entitlementCreationCanBeEnabledNow" value={String(gateResult.entitlementCreationCanBeEnabledNow)} />
            <ResultLine label="telegramStarsCanBeEnabledNow" value={String(gateResult.telegramStarsCanBeEnabledNow)} />
            <ResultLine label="productionLaunchCanBeEnabledNow" value={String(gateResult.productionLaunchCanBeEnabledNow)} />
          </div>
          <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-6 text-rose-100/80">
            {gateResult.blockedReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-medium text-white">Обязательный owner checklist</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {checklist.map((item) => (
                <article key={item.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-medium text-white">{item.label}</h3>
                    <span className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                      риск: {riskLabel[item.riskLevel]}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-xs text-slate-500">{item.area}</p>
                  <p className="mt-3 text-xs leading-5 text-slate-400">
                    Нужно до запуска: {item.requiredBeforeLaunch.join("; ")}.
                  </p>
                  <p className="mt-2 text-xs leading-5 text-rose-200/80">
                    Заблокировано до: {item.blockedUntil.join("; ")}.
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-rose-400" />
                <h2 className="text-xl font-medium text-white">Будущие env flags</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Эти flags документированы только для будущего review. Package 168 их не читает и не применяет.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {gateResult.requiredFutureEnvFlags.map((flag) => (
                  <span key={flag} className="rounded-md border border-slate-700 bg-black/30 px-3 py-2 font-mono text-xs text-slate-300">
                    {flag}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-medium text-white">Зависимость от security QA</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Package 167 должен оставаться PASS: no payment API, no Telegram Stars invoice, no successful_payment handler,
                no entitlement creation, no DB write, no Telegram API call.
              </p>
              <Link href="/dashboard/networks/zodiac/vip-access-security-suite" className="mt-4 inline-block text-sm text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
                Security QA VIP-доступа
              </Link>
            </section>

            <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-medium text-white">Готовность support/refund</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                До оплаты нужно вручную описать поддержку, возвраты, revoke entitlement и спорные платежи. Без этого launch остаётся закрытым.
              </p>
            </section>

            <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-medium text-white">Требование production backup</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Перед любым production DB write требуется свежий backup и PASS в production safety. Package 168 не создаёт backup и не пишет в DB.
              </p>
            </section>
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
          <p className="mt-3 text-xs text-slate-500">Package 169 не начинается автоматически.</p>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/analytics-funnel-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Analytics/Funnel</Link>
            <Link href="/dashboard/networks/zodiac/first-paid-mvp-readiness-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Paid MVP Readiness</Link>
            <Link href="/dashboard/networks/zodiac/support-refund-policy-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Support & Refund</Link>
            <Link href="/dashboard/networks/zodiac/production-payment-safety-gate" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Production Safety Gate</Link>
            <Link href="/dashboard/networks/zodiac/telegram-stars-payment-architecture-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Review Telegram Stars</Link>
            <Link href="/dashboard/networks/zodiac/product-catalog-finalization" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Каталог продуктов</Link>
            <Link href="/dashboard/networks/zodiac/payment-ledger-design" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Дизайн payment ledger</Link>
            <Link href="/dashboard/networks/zodiac/entitlement-storage-design" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Дизайн хранения VIP-доступа</Link>
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

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-rose-900/40 bg-black/30 px-3 py-2 font-mono text-sm text-rose-100">
      {`${label}=${value}`}
    </div>
  );
}
