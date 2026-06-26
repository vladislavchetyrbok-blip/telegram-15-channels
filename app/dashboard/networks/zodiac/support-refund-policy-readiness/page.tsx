import Link from "next/link";
import { BarChart3, ClipboardCheck, Database, FileCheck2, LifeBuoy, LockKeyhole, Scale, ShieldCheck, Undo2 } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_SUPPORT_REFUND_POLICY_RULE,
  APHRODITE_SUPPORT_REFUND_READINESS_CLASSIFICATION,
  APHRODITE_SUPPORT_REFUND_READINESS_TITLE,
  APHRODITE_SUPPORT_REFUND_SAFETY_LABELS,
  getAphroditeRefundScenarios,
  getAphroditeSupportRefundBoundaries,
  getAphroditeSupportRefundNextSteps,
  getAphroditeSupportRefundReadinessItems,
} from "@/lib/zodiac/aphrodite-support-refund-policy-readiness";
import type { AphroditeRefundScenario } from "@/lib/zodiac/aphrodite-support-refund-policy-readiness";

export const metadata = {
  title: APHRODITE_SUPPORT_REFUND_READINESS_TITLE,
};

const readinessItems = getAphroditeSupportRefundReadinessItems();
const refundScenarios = getAphroditeRefundScenarios();
const boundaries = getAphroditeSupportRefundBoundaries();
const nextSteps = getAphroditeSupportRefundNextSteps();

const riskLabel = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
  critical: "критический",
} as const;

export default function AphroditeSupportRefundPolicyReadinessPage() {
  const paysupportItem = readinessItems.find((item) => item.area === "paysupport");
  const supportContactItem = readinessItems.find((item) => item.area === "support-contact");
  const termsItem = readinessItems.find((item) => item.area === "terms");
  const privacyItem = readinessItems.find((item) => item.id === "terms-privacy-dependency") ?? termsItem;
  const starsItem = readinessItems.find((item) => item.area === "telegram-stars-policy");
  const revocationItem = readinessItems.find((item) => item.area === "revocation");
  const duplicatePaymentScenario = refundScenarios.find((scenario) => scenario.id === "duplicate-payment");
  const deliveryScenario = refundScenarios.find((scenario) => scenario.id === "payment-succeeded-access-not-delivered");
  const wrongProductScenario = refundScenarios.find((scenario) => scenario.id === "wrong-product-selected");
  const ledgerDependencyScenarios: AphroditeRefundScenario[] = [duplicatePaymentScenario, deliveryScenario, wrongProductScenario].filter(
    (scenario): scenario is AphroditeRefundScenario => Boolean(scenario),
  );

  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <LifeBuoy className="h-4 w-4" />
            <span>Aphrodite / Zodiac / Support & Refund</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{APHRODITE_SUPPORT_REFUND_READINESS_TITLE}</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_SUPPORT_REFUND_READINESS_CLASSIFICATION}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 179 создаёт только policy/readiness слой для будущей поддержки и возвратов первого платного MVP.
            Он описывает будущую команду /paysupport, support contact, refund scenarios, owner review, privacy/terms
            и Telegram Stars policy dependency, но не включает оплату, возвраты, VIP-доступ, ledger write, DB write или
            Telegram API.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_SUPPORT_REFUND_POLICY_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {APHRODITE_SUPPORT_REFUND_SAFETY_LABELS.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="readiness items" value={String(readinessItems.length)} />
          <Metric label="refund scenarios" value={String(refundScenarios.length)} />
          <Metric label="manual review" value="Да" tone="rose" />
          <Metric label="automatic refunds" value="Нет" tone="rose" />
        </section>

        <ReviewSection title="summary" icon={<ClipboardCheck className="h-5 w-5 text-rose-400" />}>
          <p className="text-sm leading-6 text-slate-400">
            Support/refund readiness пока не является разрешением на paid launch. Перед любой оплатой нужны утверждённые
            тексты /paysupport, публичный support contact, refund policy, terms/privacy, Telegram Stars policy review,
            ledger dependency, entitlement revocation dependency и ручной owner review для спорных случаев.
          </p>
        </ReviewSection>

        <ReviewSection title="support readiness items" icon={<FileCheck2 className="h-5 w-5 text-rose-400" />}>
          <div className="grid gap-4 md:grid-cols-2">
            {readinessItems.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-white">{item.label}</h3>
                    <p className="mt-1 font-mono text-xs text-slate-500">{item.area}</p>
                  </div>
                  <span className="rounded-md border border-rose-900/50 bg-rose-950 px-2 py-0.5 text-[11px] text-rose-100">
                    риск: {riskLabel[item.riskLevel]}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.currentState}</p>
                <p className="mt-3 text-xs leading-5 text-slate-400">Будущий visible text: {item.futureUserVisibleText}</p>
                <p className="mt-2 text-xs leading-5 text-rose-100/80">
                  Нужно до оплаты: {item.requiredBeforePaymentLaunch.join("; ")}. Заблокировано до: {item.blockedUntil.join("; ")}.
                </p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <ReviewSection title="future /paysupport requirements" icon={<LifeBuoy className="h-5 w-5 text-rose-400" />}>
            <InfoBlock title={paysupportItem?.label ?? "Telegram /paysupport readiness"} text={paysupportItem?.futureUserVisibleText ?? "/paysupport должен быть утверждён до оплаты."} />
            <InfoBlock title={supportContactItem?.label ?? "support contact readiness"} text={supportContactItem?.futureUserVisibleText ?? "Support contact обязателен до оплаты."} />
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Сейчас команда /paysupport не подключена к live bot flow. Package 179 фиксирует только требования к будущему тексту и ручной triage.
            </p>
          </ReviewSection>

          <ReviewSection title="refund scenarios" icon={<Undo2 className="h-5 w-5 text-rose-400" />}>
            <div className="space-y-3">
              {refundScenarios.map((scenario) => (
                <article key={scenario.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-white">{scenario.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{scenario.scenario}</p>
                    </div>
                    <span className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                      manual review: {scenario.manualReviewRequired ? "Да" : "Нет"}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-400">{scenario.futurePolicyDraft}</p>
                  <p className="mt-2 text-xs leading-5 text-rose-100/80">Сейчас заблокировано: {scenario.blockedNow.join("; ")}.</p>
                </article>
              ))}
            </div>
          </ReviewSection>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <DependencyCard icon={<ShieldCheck className="h-5 w-5 text-rose-400" />} title="manual owner review rules">
            <p className="text-sm leading-6 text-slate-400">
              Duplicate payment, failed payment, wrong product, successful payment but report not opened, abuse/fraud и спорные кейсы
              всегда идут на ручной owner review. Automatic refund запрещён.
            </p>
          </DependencyCard>

          <DependencyCard icon={<Scale className="h-5 w-5 text-rose-400" />} title="terms/privacy dependencies">
            <p className="text-sm leading-6 text-slate-400">
              {termsItem?.futureUserVisibleText ?? privacyItem?.futureUserVisibleText ?? "Terms/privacy должны быть утверждены до оплаты."}
            </p>
          </DependencyCard>

          <DependencyCard icon={<LifeBuoy className="h-5 w-5 text-rose-400" />} title="Telegram Stars support notes">
            <p className="text-sm leading-6 text-slate-400">
              {starsItem?.futureUserVisibleText ?? "Refund/support wording должен учитывать правила Telegram Stars."}
            </p>
          </DependencyCard>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ReviewSection title="entitlement revocation dependency" icon={<LockKeyhole className="h-5 w-5 text-rose-300" />}>
            <p className="text-sm leading-6 text-slate-400">
              {revocationItem?.futureUserVisibleText ?? "Если возврат одобрен, будущий entitlement должен быть отозван отдельным verified flow."}
            </p>
            <p className="mt-4 text-xs leading-5 text-rose-100/80">
              Package 179 не отзывает доступ и не создаёт entitlement. Revocation возможен только после будущего payment ledger,
              entitlement storage и owner approval.
            </p>
          </ReviewSection>

          <ReviewSection title="ledger dependency" icon={<Database className="h-5 w-5 text-rose-300" />}>
            <p className="text-sm leading-6 text-slate-400">
              Ledger нужен только в будущей реализации, чтобы вручную проверить duplicate payment, successful payment without delivery,
              wrong product и refund approved/denied decisions.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
              {ledgerDependencyScenarios.map((scenario) => (
                <li key={scenario.id}>{scenario.ledgerActionFuture.join("; ")}</li>
              ))}
            </ul>
          </ReviewSection>
        </section>

        <ReviewSection title="safety boundaries" icon={<LockKeyhole className="h-5 w-5 text-rose-300" />}>
          <div className="space-y-2">
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
        </ReviewSection>

        <ReviewSection title="next recommended package" icon={<BarChart3 className="h-5 w-5 text-rose-400" />}>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
            {nextSteps.map((step) => (
              <li key={step.package}>
                <span className="text-white">
                  {step.package} - {step.title}:
                </span>{" "}
                {step.purpose} Заблокировано до: {step.blockedUntil.join("; ")}.
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Package 180 не начинается автоматически.</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/first-paid-mvp-readiness-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Paid MVP Readiness</Link>
            <Link href="/dashboard/networks/zodiac/production-payment-safety-gate" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Production Safety Gate</Link>
            <Link href="/dashboard/networks/zodiac/owner-review-gate" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Owner Review Gate</Link>
            <Link href="/dashboard/networks/zodiac/telegram-stars-payment-architecture-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Review Telegram Stars</Link>
            <Link href="/dashboard/networks/zodiac/product-catalog-finalization" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Каталог продуктов</Link>
            <Link href="/dashboard/networks/zodiac/payment-ledger-mock-integration" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mock payment ledger</Link>
            <Link href="/dashboard/networks/zodiac/entitlement-creation-mock" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mock entitlement creation</Link>
            <Link href="/dashboard/networks/zodiac/vip-access-security-suite" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Security QA VIP-доступа</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5 flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-medium text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "rose" }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={tone === "rose" ? "mt-2 text-lg font-semibold text-rose-300" : "mt-2 text-lg font-semibold text-emerald-300"}>{value}</div>
    </div>
  );
}

function DependencyCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-medium text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-3 rounded-lg border border-slate-800 bg-black/30 p-4 last:mb-0">
      <h3 className="text-sm font-medium text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}
