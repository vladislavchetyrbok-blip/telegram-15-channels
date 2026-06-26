import Link from "next/link";
import { FileCheck2, LockKeyhole, ReceiptText, ShieldCheck } from "lucide-react";

import {
  APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_CLASSIFICATION,
  APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_RULE,
  APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_SAFETY_LABELS,
  APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_TITLE,
  getAphroditeSuccessfulPaymentSkeletonBoundaries,
  getAphroditeSuccessfulPaymentSkeletonNextSteps,
  getAphroditeSuccessfulPaymentSkeletonRules,
  inspectAphroditeSuccessfulPaymentSkeleton,
} from "@/lib/zodiac/aphrodite-telegram-stars-successful-payment-skeleton";

export const metadata = {
  title: APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_TITLE,
};

const rules = getAphroditeSuccessfulPaymentSkeletonRules();
const boundaries = getAphroditeSuccessfulPaymentSkeletonBoundaries();
const nextSteps = getAphroditeSuccessfulPaymentSkeletonNextSteps();
const sampleResult = inspectAphroditeSuccessfulPaymentSkeleton({
  productId: "full_love_report",
  amount: 299,
  currency: "XTR",
  telegramPaymentChargeId: "mock-tg-charge",
  providerPaymentChargeId: "mock-provider-charge",
  invoicePayload: "aphrodite:full_love_report:mock-user",
  telegramUserId: "mock-user",
});

export default function AphroditeTelegramStarsSuccessfulPaymentSkeletonPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Aphrodite / Telegram Stars / successful_payment skeleton</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_TITLE}</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_CLASSIFICATION}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 172 разбирает только будущую форму successful_payment. Он не создаёт handler, не пишет payment ledger,
            не создаёт entitlement и не открывает VIP, даже если mock payment выглядит валидным.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_SAFETY_LABELS.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-400">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Metric label="handlerActiveNow" value={String(sampleResult.handlerActiveNow)} />
          <Metric label="canCallTelegramApiNow" value={String(sampleResult.canCallTelegramApiNow)} />
          <Metric label="recordsPaymentLedgerNow" value={String(sampleResult.recordsPaymentLedgerNow)} />
          <Metric label="createsEntitlementNow" value={String(sampleResult.createsEntitlementNow)} />
          <Metric label="unlocksVipNow" value={String(sampleResult.unlocksVipNow)} />
          <Metric label="grantsAccessNow" value={String(sampleResult.grantsAccessNow)} />
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Mock inspection result</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-slate-800 bg-black/30 p-4 text-sm text-slate-300">
              <Row label="productKnown" value={String(sampleResult.productKnown)} />
              <Row label="productId" value={sampleResult.productId} />
              <Row label="idempotencyKeyPreview" value={sampleResult.idempotencyKeyPreview} />
            </div>
            <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-4">
              <h3 className="text-sm font-medium text-rose-100">Validation notes</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-rose-100/80">
                {sampleResult.validationNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-medium text-white">Будущие проверки</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rules.map((rule) => (
              <article key={rule.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <h3 className="text-base font-medium text-white">{rule.label}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{rule.futureCheck}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  До live: {rule.requiredBeforeLive.join("; ")}.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-6">
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-rose-300" />
              <h2 className="text-xl font-medium text-rose-100">Границы безопасности</h2>
            </div>
            <div className="mt-5 space-y-2">
              {boundaries.map((boundary) => (
                <div key={boundary.id} data-boundary={boundary.id} className="rounded-lg border border-rose-900/40 bg-black/20 p-3">
                  <div className="text-sm font-medium text-white">{boundary.visibleLabel}</div>
                  <div className="mt-1 text-xs leading-5 text-rose-100/80">
                    Разрешено сейчас: {boundary.allowedNow.join(", ")}. Заблокировано до: {boundary.blockedUntil.join(", ")}.
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-medium text-white">Следующий рекомендуемый пакет</h2>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
              {nextSteps.map((step) => (
                <li key={step.package}>
                  <span className="text-white">
                    {step.package} — {step.title}:
                  </span>{" "}
                  {step.purpose}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Package 173 можно начинать только после отдельного commit/push Package 172 и PASS проверок.
            </p>
          </div>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/production-payment-safety-gate" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Production Safety Gate</Link>
            <Link href="/dashboard/networks/zodiac/payment-ledger-mock-integration" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mock payment ledger</Link>
            <Link href="/dashboard/networks/zodiac/telegram-stars-precheckout-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton pre-checkout</Link>
            <Link href="/dashboard/networks/zodiac/telegram-stars-invoice-builder-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton invoice builder</Link>
            <Link href="/dashboard/networks/zodiac/payment-ledger-design" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Дизайн payment ledger</Link>
            <Link href="/dashboard/networks/zodiac/server-entitlement-check-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton server-side entitlement</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-emerald-300">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-800 py-2 last:border-b-0">
      <dt className="font-mono text-xs text-slate-500">{label}</dt>
      <dd className="max-w-sm break-words text-right text-slate-200">{value}</dd>
    </div>
  );
}
