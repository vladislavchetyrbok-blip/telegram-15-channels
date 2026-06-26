import Link from "next/link";
import { Boxes, FileCheck2, LockKeyhole, ReceiptText, ShieldCheck } from "lucide-react";

import {
  APHRODITE_STARS_INVOICE_BUILDER_CLASSIFICATION,
  APHRODITE_STARS_INVOICE_BUILDER_RULE,
  APHRODITE_STARS_INVOICE_BUILDER_SAFETY_LABELS,
  APHRODITE_STARS_INVOICE_BUILDER_TITLE,
  buildAphroditeStarsInvoiceDraftSkeleton,
  getAphroditeStarsInvoiceBuilderBoundaries,
  getAphroditeStarsInvoiceBuilderNextSteps,
  getAphroditeStarsInvoiceProductCatalog,
} from "@/lib/zodiac/aphrodite-telegram-stars-invoice-builder-skeleton";

export const metadata = {
  title: APHRODITE_STARS_INVOICE_BUILDER_TITLE,
};

const products = getAphroditeStarsInvoiceProductCatalog();
const boundaries = getAphroditeStarsInvoiceBuilderBoundaries();
const nextSteps = getAphroditeStarsInvoiceBuilderNextSteps();
const sampleDraft = buildAphroditeStarsInvoiceDraftSkeleton({
  productId: "full_love_report",
  telegramUserId: "mock-user",
  ownerApproved: true,
  paymentsEnabled: true,
  starsLiveEnabled: true,
});

export default function AphroditeTelegramStarsInvoiceBuilderSkeletonPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Aphrodite / Telegram Stars / invoice skeleton</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{APHRODITE_STARS_INVOICE_BUILDER_TITLE}</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_STARS_INVOICE_BUILDER_CLASSIFICATION}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 170 создаёт только локальный skeleton invoice draft. Даже при mock-вводе с owner approval,
            payments enabled и Stars live enabled результат остаётся заблокированным: ничего не отправляется,
            Telegram API не вызывается, ledger и entitlement не создаются.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_STARS_INVOICE_BUILDER_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {APHRODITE_STARS_INVOICE_BUILDER_SAFETY_LABELS.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-400">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-5">
          <Metric label="sendAllowedNow" value={String(sampleDraft.sendAllowedNow)} />
          <Metric label="canCallTelegramApiNow" value={String(sampleDraft.canCallTelegramApiNow)} />
          <Metric label="createsPaymentLedgerNow" value={String(sampleDraft.createsPaymentLedgerNow)} />
          <Metric label="createsEntitlementNow" value={String(sampleDraft.createsEntitlementNow)} />
          <Metric label="unlocksVipNow" value={String(sampleDraft.unlocksVipNow)} />
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Локальный invoice draft</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-black/30 p-4">
              <h3 className="text-sm font-medium text-white">Mock draft для Full Love Report</h3>
              <dl className="mt-3 space-y-2 text-sm text-slate-300">
                <Row label="productId" value={sampleDraft.productId} />
                <Row label="title" value={sampleDraft.productTitle} />
                <Row label="amount" value={`${sampleDraft.amount} ${sampleDraft.currency}`} />
                <Row label="state" value={sampleDraft.validationState} />
              </dl>
              <p className="mt-3 break-words font-mono text-xs leading-5 text-slate-500">{sampleDraft.payloadPreview}</p>
            </div>
            <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-4">
              <h3 className="text-sm font-medium text-rose-100">Почему draft заблокирован</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-rose-100/80">
                {sampleDraft.blockedReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Покрытие продуктов</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <h3 className="text-base font-medium text-white">{product.title}</h3>
                <p className="mt-1 font-mono text-xs text-slate-500">{product.id}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{product.description}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Будущая цена: {product.futureStarsAmount} XTR. Зависимости: {product.dependencies.join("; ")}.
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
              Package 171 можно начинать только после отдельного commit/push Package 170 и PASS проверок.
            </p>
          </div>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/production-payment-safety-gate" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Production Safety Gate</Link>
            <Link href="/dashboard/networks/zodiac/telegram-stars-precheckout-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton pre-checkout</Link>
            <Link href="/dashboard/networks/zodiac/telegram-stars-payment-architecture-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Review Telegram Stars</Link>
            <Link href="/dashboard/networks/zodiac/product-catalog-finalization" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Каталог продуктов</Link>
            <Link href="/dashboard/networks/zodiac/payment-ledger-design" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Дизайн payment ledger</Link>
            <Link href="/dashboard/networks/zodiac/entitlement-storage-design" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Дизайн entitlement storage</Link>
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
    <div className="flex items-start justify-between gap-4">
      <dt className="font-mono text-xs text-slate-500">{label}</dt>
      <dd className="text-right text-slate-200">{value}</dd>
    </div>
  );
}
