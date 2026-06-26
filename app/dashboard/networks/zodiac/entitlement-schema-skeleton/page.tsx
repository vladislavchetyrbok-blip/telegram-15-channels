import Link from "next/link";
import { ClipboardCheck, FileCheck2, LockKeyhole, ScanLine, ShieldCheck } from "lucide-react";
import {
  APHRODITE_ENTITLEMENT_SCHEMA_SKELETON_CLASSIFICATION,
  APHRODITE_ENTITLEMENT_SCHEMA_SKELETON_RULE,
  getAphroditeEntitlementSchemaBoundaries,
  getAphroditeEntitlementSchemaNextSteps,
  getAphroditeEntitlementSchemaRequiredFields,
  validateAphroditeEntitlementSchemaSkeleton,
} from "@/lib/zodiac/aphrodite-entitlement-schema-skeleton";

export const metadata = {
  title: "Skeleton схемы entitlement",
};

const requiredFields = getAphroditeEntitlementSchemaRequiredFields();
const boundaries = getAphroditeEntitlementSchemaBoundaries();
const nextSteps = getAphroditeEntitlementSchemaNextSteps();
const sampleRecords = [
  {
    label: "Полная future shape",
    record: {
      id: "future-entitlement-001",
      userId: "future-user-001",
      telegramUserId: "123456789",
      productId: "full-love-report",
      sourcePaymentLedgerId: "future-ledger-001",
      status: "active" as const,
      startsAt: "2026-01-01T00:00:00.000Z",
      expiresAt: "2099-01-01T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      auditReason: "future verified ledger после owner review",
    },
  },
  {
    label: "Expired future shape",
    record: {
      id: "future-entitlement-expired",
      telegramUserId: "123456789",
      productId: "vip-love-access",
      sourcePaymentLedgerId: "future-ledger-expired",
      status: "expired" as const,
      startsAt: "2020-01-01T00:00:00.000Z",
      expiresAt: "2020-02-01T00:00:00.000Z",
      createdAt: "2020-01-01T00:00:00.000Z",
      updatedAt: "2020-02-01T00:00:00.000Z",
      auditReason: "future expiration audit",
    },
  },
  {
    label: "Revoked future shape",
    record: {
      id: "future-entitlement-revoked",
      userId: "future-user-002",
      productId: "natal-chart-vip",
      sourcePaymentLedgerId: "future-ledger-revoked",
      status: "revoked" as const,
      startsAt: "2026-01-01T00:00:00.000Z",
      revokedAt: "2026-01-05T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-05T00:00:00.000Z",
      auditReason: "future owner revoke audit",
    },
  },
  {
    label: "Refunded future shape",
    record: {
      id: "future-entitlement-refunded",
      telegramUserId: "987654321",
      productId: "vip-numerology",
      sourcePaymentLedgerId: "future-ledger-refunded",
      status: "refunded" as const,
      startsAt: "2026-01-01T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-08T00:00:00.000Z",
      auditReason: "future refund audit",
    },
  },
].map((item) => ({
  ...item,
  validation: validateAphroditeEntitlementSchemaSkeleton(item.record),
}));

const riskLabel = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
  critical: "критический",
} as const;

function flag(value: boolean) {
  return value ? "Да" : "Нет";
}

export default function AphroditeEntitlementSchemaSkeletonPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <ScanLine className="h-4 w-4" />
            <span>Aphrodite / entitlement schema / skeleton</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">Skeleton схемы entitlement</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_ENTITLEMENT_SCHEMA_SKELETON_CLASSIFICATION}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 165 добавляет TypeScript-only validation helper для будущей формы entitlement. Даже валидная на вид запись не открывает VIP:
            результат всегда возвращает `grantsAccessNow=false`.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_ENTITLEMENT_SCHEMA_SKELETON_RULE}
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
            <h2 className="text-xl font-medium text-white">Сводка skeleton</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
            <Metric label="Required fields" value={String(requiredFields.length)} />
            <Metric label="Sample validations" value={String(sampleRecords.length)} />
            <Metric label="grantsAccessNow" value="false" />
            <Metric label="DB write" value="Нет" />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Skeleton проверяет форму, missing fields и будущие deny statuses. Он не подключён к production routes и не является доказательством доступа.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-medium text-white">Обязательные поля</h2>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {requiredFields.map((field) => (
                <span key={field} className="rounded-md border border-slate-700 bg-black/30 px-3 py-2 font-mono text-xs text-slate-300">
                  {field}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-medium text-white">Runtime validation examples</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {sampleRecords.map((sample) => (
                <article key={sample.label} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-medium text-white">{sample.label}</h3>
                    <span className="rounded-md border border-rose-900/60 bg-rose-950/30 px-2 py-0.5 text-[11px] text-rose-200">
                      grantsAccessNow=false
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                    <StatusLine label="validShape" value={flag(sample.validation.validShape)} />
                    <StatusLine label="missingFields" value={String(sample.validation.missingFields.length)} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{sample.validation.visibleMessage}</p>
                  <ul className="mt-3 list-disc space-y-1 pl-4 text-xs leading-5 text-slate-500">
                    {sample.validation.blockedReasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
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
                  {step.package} — {step.title}:
                </span>{" "}
                {step.purpose}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Package 166 начинается только после отдельного подтверждённого commit/push Package 165.</p>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/owner-review-gate" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Owner Review Gate</Link>
            <Link href="/dashboard/networks/zodiac/telegram-stars-payment-architecture-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Review Telegram Stars</Link>
            <Link href="/dashboard/networks/zodiac/entitlement-storage-design" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Дизайн хранения VIP-доступа</Link>
            <Link href="/dashboard/networks/zodiac/payment-ledger-design" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Дизайн payment ledger</Link>
            <Link href="/dashboard/networks/zodiac/product-catalog-finalization" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Каталог продуктов</Link>
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

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-slate-300">
      <span className="text-slate-500">{label}: </span>
      {value}
    </div>
  );
}
