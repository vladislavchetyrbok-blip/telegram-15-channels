import Link from "next/link";
import { ClipboardCheck, Database, FileCheck2, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_PRODUCTION_PAYMENT_REQUIRED_FUTURE_ENV_FLAGS,
  APHRODITE_PRODUCTION_PAYMENT_SAFETY_GATE_CLASSIFICATION,
  APHRODITE_PRODUCTION_PAYMENT_SAFETY_GATE_RULE,
  APHRODITE_PRODUCTION_PAYMENT_SAFETY_GATE_TITLE,
  APHRODITE_PRODUCTION_PAYMENT_SAFETY_LABELS,
  evaluateAphroditeProductionPaymentSafetyGate,
  getAphroditeProductionPaymentSafetyBoundaries,
  getAphroditeProductionPaymentSafetyNextSteps,
  getAphroditeProductionPaymentSafetyRules,
} from "@/lib/zodiac/aphrodite-production-payment-safety-gate";

export const metadata = {
  title: APHRODITE_PRODUCTION_PAYMENT_SAFETY_GATE_TITLE,
};

const safetyResult = evaluateAphroditeProductionPaymentSafetyGate({
  ownerApproved: true,
  paymentsEnabled: true,
  starsLiveEnabled: true,
  entitlementsEnabled: true,
  productionLaunchApproved: true,
  databaseConfigured: true,
  telegramBotTokenConfigured: true,
  backupFresh: true,
  supportReady: true,
  refundPolicyReady: true,
  securityQaPassed: true,
  paymentLedgerReady: true,
  entitlementStorageReady: true,
});
const rules = getAphroditeProductionPaymentSafetyRules();
const boundaries = getAphroditeProductionPaymentSafetyBoundaries();
const nextSteps = getAphroditeProductionPaymentSafetyNextSteps();

const riskLabel = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
  critical: "критический",
} as const;

export default function AphroditeProductionPaymentSafetyGatePage() {
  const ownerReviewRule = rules.find((rule) => rule.area === "owner-review");
  const databaseRule = rules.find((rule) => rule.area === "database");
  const backupRule = rules.find((rule) => rule.area === "backup") ?? databaseRule;
  const supportRule = rules.find((rule) => rule.area === "support-refund");
  const securityRule = rules.find((rule) => rule.area === "security-qa");
  const ledgerRule = rules.find((rule) => rule.area === "payment-ledger");
  const entitlementRule = rules.find((rule) => rule.area === "entitlement-creation");

  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Aphrodite / Telegram Stars / production safety</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{APHRODITE_PRODUCTION_PAYMENT_SAFETY_GATE_TITLE}</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_PRODUCTION_PAYMENT_SAFETY_GATE_CLASSIFICATION}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 175 создаёт центральный fail-closed gate для будущих Aphrodite payments и VIP. Он собирает prerequisites
            для owner review, env flags, Telegram Stars, payment ledger, entitlement, backup, support/refund и security QA,
            но не включает оплату, не отправляет invoice, не пишет ledger, не создаёт entitlement и не открывает VIP.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_PRODUCTION_PAYMENT_SAFETY_GATE_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {APHRODITE_PRODUCTION_PAYMENT_SAFETY_LABELS.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-400">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Сводка / summary</h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">{safetyResult.visibleMessage}</p>
          <div className="mt-5 grid gap-3 text-sm md:grid-cols-3 xl:grid-cols-5">
            <Metric label="productionPaymentAllowedNow" value={String(safetyResult.productionPaymentAllowedNow)} />
            <Metric label="telegramStarsLiveAllowedNow" value={String(safetyResult.telegramStarsLiveAllowedNow)} />
            <Metric label="invoiceSendingAllowedNow" value={String(safetyResult.invoiceSendingAllowedNow)} />
            <Metric label="preCheckoutAllowedNow" value={String(safetyResult.preCheckoutAllowedNow)} />
            <Metric label="successfulPaymentHandlingAllowedNow" value={String(safetyResult.successfulPaymentHandlingAllowedNow)} />
            <Metric label="paymentLedgerWriteAllowedNow" value={String(safetyResult.paymentLedgerWriteAllowedNow)} />
            <Metric label="entitlementCreationAllowedNow" value={String(safetyResult.entitlementCreationAllowedNow)} />
            <Metric label="vipUnlockAllowedNow" value={String(safetyResult.vipUnlockAllowedNow)} />
            <Metric label="databaseWriteAllowedNow" value={String(safetyResult.databaseWriteAllowedNow)} />
            <Metric label="productionLaunchAllowedNow" value={String(safetyResult.productionLaunchAllowedNow)} />
          </div>
        </section>

        <section className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-6">
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-5 w-5 text-rose-300" />
            <h2 className="text-xl font-medium text-rose-100">Sample safety result</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <ResultLine label="productionPaymentAllowedNow" value={String(safetyResult.productionPaymentAllowedNow)} />
            <ResultLine label="telegramStarsLiveAllowedNow" value={String(safetyResult.telegramStarsLiveAllowedNow)} />
            <ResultLine label="invoiceSendingAllowedNow" value={String(safetyResult.invoiceSendingAllowedNow)} />
            <ResultLine label="paymentLedgerWriteAllowedNow" value={String(safetyResult.paymentLedgerWriteAllowedNow)} />
            <ResultLine label="entitlementCreationAllowedNow" value={String(safetyResult.entitlementCreationAllowedNow)} />
            <ResultLine label="vipUnlockAllowedNow" value={String(safetyResult.vipUnlockAllowedNow)} />
          </div>
          <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-6 text-rose-100/80">
            {safetyResult.blockedReasons.slice(0, 8).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-medium text-white">Blocked production areas</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {rules.map((rule) => (
                <article key={rule.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-medium text-white">{rule.label}</h3>
                      <p className="mt-1 font-mono text-xs text-slate-500">{rule.area}</p>
                    </div>
                    <span className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                      риск: {riskLabel[rule.riskLevel]}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{rule.visibleRule}</p>
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Нужно до запуска: {rule.mustPassBeforeLaunch.join("; ")}.
                  </p>
                  <p className="mt-2 text-xs leading-5 text-rose-200/80">
                    Заблокировано до: {rule.blockedUntil.join("; ")}.
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <DependencyCard icon={KeyRound} title="Required future env flags" text="Флаги документируются только как будущие prerequisites. Package 175 не читает env и не включает production behavior.">
              <div className="mt-4 flex flex-wrap gap-2">
                {APHRODITE_PRODUCTION_PAYMENT_REQUIRED_FUTURE_ENV_FLAGS.map((flag) => (
                  <span key={flag} className="rounded-md border border-slate-700 bg-black/30 px-3 py-2 font-mono text-xs text-slate-300">
                    {flag}
                  </span>
                ))}
              </div>
            </DependencyCard>

            <DependencyCard icon={ShieldCheck} title="Owner review dependency" text={ownerReviewRule?.visibleRule ?? "Owner review обязателен до будущего launch."} />
            <DependencyCard icon={Database} title="Database/backup dependency" text={`${databaseRule?.visibleRule ?? "DB write запрещён."} ${backupRule?.visibleRule ?? "backup freshness обязателен."}`} />
            <DependencyCard icon={FileCheck2} title="Support/refund dependency" text={supportRule?.visibleRule ?? "Support/refund policy обязателен до оплаты."} />
            <DependencyCard icon={ShieldCheck} title="Security QA dependency" text={securityRule?.visibleRule ?? "Security QA должен оставаться стоппером."} />
            <DependencyCard icon={Database} title="Payment ledger dependency" text={ledgerRule?.visibleRule ?? "Payment ledger write запрещён."} />
            <DependencyCard icon={LockKeyhole} title="Entitlement dependency" text={entitlementRule?.visibleRule ?? "Entitlement creation запрещён."} />
          </div>
        </section>

        <section className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-6">
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-5 w-5 text-rose-300" />
            <h2 className="text-xl font-medium text-rose-100">Safety boundaries</h2>
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
          <h2 className="text-xl font-medium text-white">Next recommended package</h2>
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
          <p className="mt-3 text-xs text-slate-500">Package 176 не начинается автоматически.</p>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/analytics-funnel-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Analytics/Funnel</Link>
            <Link href="/dashboard/networks/zodiac/first-paid-mvp-readiness-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Paid MVP Readiness</Link>
            <Link href="/dashboard/networks/zodiac/support-refund-policy-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Support & Refund</Link>
            <Link href="/dashboard/networks/zodiac/owner-review-gate" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Owner Review Gate</Link>
            <Link href="/dashboard/networks/zodiac/telegram-stars-payment-architecture-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Review Telegram Stars</Link>
            <Link href="/dashboard/networks/zodiac/telegram-stars-invoice-builder-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton invoice builder</Link>
            <Link href="/dashboard/networks/zodiac/payment-ledger-mock-integration" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mock payment ledger</Link>
            <Link href="/dashboard/networks/zodiac/entitlement-creation-mock" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mock entitlement creation</Link>
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
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-emerald-300">{value}</div>
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

function DependencyCard({
  icon: Icon,
  title,
  text,
  children,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-rose-400" />
        <h2 className="text-xl font-medium text-white">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
      {children}
    </section>
  );
}
