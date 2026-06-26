import Link from "next/link";
import { ClipboardList, Database, FileCheck2, Landmark, LockKeyhole, ShieldCheck } from "lucide-react";
import {
  APHRODITE_PAYMENT_LEDGER_DESIGN_CLASSIFICATION,
  APHRODITE_PAYMENT_LEDGER_DESIGN_RULE,
  getAphroditePaymentLedgerCatalogAlignment,
  getAphroditePaymentLedgerDesignBoundaries,
  getAphroditePaymentLedgerDesignItems,
  getAphroditePaymentLedgerDesignNextSteps,
  getAphroditePaymentLedgerDesignRules,
} from "@/lib/zodiac/aphrodite-payment-ledger-design";

export const metadata = {
  title: "Дизайн payment ledger",
};

const ledgerItems = getAphroditePaymentLedgerDesignItems();
const rules = getAphroditePaymentLedgerDesignRules();
const boundaries = getAphroditePaymentLedgerDesignBoundaries();
const nextSteps = getAphroditePaymentLedgerDesignNextSteps();
const catalogAlignment = getAphroditePaymentLedgerCatalogAlignment();

const riskLabel = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
  critical: "критический",
} as const;

function flag(value: boolean) {
  return value ? "Да" : "Нет";
}

export default function AphroditePaymentLedgerDesignPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <Landmark className="h-4 w-4" />
            <span>Aphrodite / payment ledger / design</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">Дизайн payment ledger</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_PAYMENT_LEDGER_DESIGN_CLASSIFICATION}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 163 фиксирует будущую модель платежного ledger для Telegram Stars, ручной проверки и test-mode сценариев. Это только дизайн:
            страница не создаёт invoice, не принимает платежи, не пишет записи и не открывает VIP.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_PAYMENT_LEDGER_DESIGN_RULE}
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
            <h2 className="text-xl font-medium text-white">Сводка ledger-дизайна</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
            <Metric label="Design items" value={String(ledgerItems.length)} />
            <Metric label="Future products" value={String(catalogAlignment.futureProductIds.length)} />
            <Metric label="Fallback route" value={catalogAlignment.fallbackRoute} />
            <Metric label="Owner review" value={flag(catalogAlignment.ownerReviewRequired)} />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Ledger ставится перед entitlement: будущая запись доступа не должна появиться без verified payment ledger, productId из каталога
            и ручного owner review. Сейчас все состояния являются design-only.
          </p>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Поля будущей ledger-записи</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {ledgerItems.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-medium text-white">{item.id}</h3>
                    <p className="mt-1 font-mono text-xs text-slate-500">{item.provider}</p>
                  </div>
                  <span className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                    {item.status}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-xs leading-5 text-slate-400">
                  <StatusLine label="productId" value={item.productId} />
                  <StatusLine label="userIdField" value={item.userIdField} />
                  <StatusLine label="telegramUserIdField" value={item.telegramUserIdField} />
                  <StatusLine label="sourcePaymentIdField" value={item.sourcePaymentIdField} />
                  <StatusLine label="amountField" value={item.amountField} />
                  <StatusLine label="currencyField" value={item.currencyField} />
                  <StatusLine label="createdAtField" value={item.createdAtField} />
                  <StatusLine label="verifiedAtField" value={item.verifiedAtField} />
                  <StatusLine label="refundedAtField" value={item.refundedAtField} />
                  <StatusLine label="auditReasonField" value={item.auditReasonField} />
                </div>
                <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
                  <StatusLine label="designOnly" value={String(item.designOnly)} tone="success" />
                  <StatusLine label="createsEntitlementNow" value={String(item.createsEntitlementNow)} tone="success" />
                  <StatusLine label="writesToDatabaseNow" value={String(item.writesToDatabaseNow)} tone="success" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-medium text-white">Правила ledger</h2>
            </div>
            <div className="mt-5 space-y-3">
              {rules.map((rule) => (
                <article key={rule.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                  <h3 className="text-sm font-medium text-white">{rule.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{rule.visibleRule}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Область: {rule.appliesTo.join(", ")}. Заблокировано до: {rule.blockedUntil.join(", ")}.
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-6">
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-rose-300" />
              <h2 className="text-xl font-medium text-rose-100">Что остаётся закрытым</h2>
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
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Следующий рекомендуемый пакет</h2>
          </div>
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
          <p className="mt-3 text-xs text-slate-500">Package 164 начинается только после отдельного подтверждённого commit/push Package 163.</p>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/product-catalog-finalization" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Каталог продуктов</Link>
            <Link href="/dashboard/networks/zodiac/vip-free-preview-fallback-map" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Карта fallback VIP</Link>
            <Link href="/dashboard/networks/zodiac/vip-access-guard-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton VIP-guard</Link>
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

function StatusLine({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" }) {
  return (
    <div className={tone === "success" ? "rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-emerald-300" : "rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-slate-300"}>
      <span className="text-slate-500">{label}: </span>
      {value}
    </div>
  );
}
