import Link from "next/link";
import { FileCheck2, KeyRound, LockKeyhole, Server, ShieldCheck } from "lucide-react";
import {
  APHRODITE_SERVER_ENTITLEMENT_CHECK_FALLBACK_ROUTE,
  APHRODITE_SERVER_ENTITLEMENT_CHECK_RULE,
  APHRODITE_SERVER_ENTITLEMENT_CHECK_SKELETON_CLASSIFICATION,
  APHRODITE_SERVER_ENTITLEMENT_REQUIRED_FUTURE_CHECKS,
  checkAphroditeServerEntitlementSkeleton,
  getAphroditeServerEntitlementCheckBoundaries,
  getAphroditeServerEntitlementCheckNextSteps,
} from "@/lib/zodiac/aphrodite-server-entitlement-check-skeleton";

export const metadata = {
  title: "Skeleton server-side проверки entitlement",
};

const boundaries = getAphroditeServerEntitlementCheckBoundaries();
const nextSteps = getAphroditeServerEntitlementCheckNextSteps();
const sampleChecks = [
  {
    label: "Default deny",
    input: { productId: "full-love-report", source: "mini-app" as const },
  },
  {
    label: "Fake client VIP flag",
    input: { productId: "vip-love-access", source: "mini-app" as const, mockClientVipFlag: true },
  },
  {
    label: "Fake query VIP flag",
    input: { productId: "natal-chart-vip", source: "api" as const, mockQueryVipFlag: true },
  },
  {
    label: "Fake payment success",
    input: { productId: "vip-numerology", source: "mini-app" as const, mockPaymentSuccess: true },
  },
  {
    label: "Fake entitlement record",
    input: {
      productId: "vip-couple-calendar",
      source: "dashboard" as const,
      mockEntitlementRecord: { status: "active", productId: "vip-couple-calendar" },
    },
  },
].map((sample) => ({
  ...sample,
  result: checkAphroditeServerEntitlementSkeleton(sample.input),
}));

const riskLabel = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
  critical: "критический",
} as const;

export default function AphroditeServerEntitlementCheckSkeletonPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <Server className="h-4 w-4" />
            <span>Aphrodite / server entitlement check / skeleton</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">Skeleton server-side проверки entitlement</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_SERVER_ENTITLEMENT_CHECK_SKELETON_CLASSIFICATION}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 166 подготавливает fail-closed интерфейс будущей server-side проверки. Сейчас skeleton не читает DB, не доверяет клиенту,
            не открывает VIP и всегда возвращает `allowed=false`.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_SERVER_ENTITLEMENT_CHECK_RULE}
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
            <h2 className="text-xl font-medium text-white">Сводка fail-closed</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
            <Metric label="allowed" value="false" />
            <Metric label="Fallback route" value={APHRODITE_SERVER_ENTITLEMENT_CHECK_FALLBACK_ROUTE} />
            <Metric label="Future checks" value={String(APHRODITE_SERVER_ENTITLEMENT_REQUIRED_FUTURE_CHECKS.length)} />
            <Metric label="DB check" value="Нет" />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Даже если вход содержит mock client VIP flag, query flag, payment success или fake entitlement record, skeleton возвращает deny и free preview fallback.
          </p>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Deny examples</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sampleChecks.map((sample) => (
              <article key={sample.label} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-medium text-white">{sample.label}</h3>
                  <span className="rounded-md border border-rose-900/60 bg-rose-950/30 px-2 py-0.5 text-[11px] text-rose-200">
                    allowed=false
                  </span>
                </div>
                <p className="mt-2 font-mono text-xs text-slate-500">{sample.result.decision}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{sample.result.visibleMessage}</p>
                <p className="mt-3 text-xs text-emerald-300">Fallback: {sample.result.fallbackRoute}</p>
                <ul className="mt-3 list-disc space-y-1 pl-4 text-xs leading-5 text-slate-500">
                  {sample.result.ignoredClientSignals.map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-medium text-white">Будущие обязательные проверки</h2>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
              {APHRODITE_SERVER_ENTITLEMENT_REQUIRED_FUTURE_CHECKS.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-6">
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
          <p className="mt-3 text-xs text-slate-500">Package 167 начинается только после отдельного подтверждённого commit/push Package 166.</p>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/owner-review-gate" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Owner Review Gate</Link>
            <Link href="/dashboard/networks/zodiac/telegram-stars-payment-architecture-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Review Telegram Stars</Link>
            <Link href="/dashboard/networks/zodiac/entitlement-schema-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton схемы entitlement</Link>
            <Link href="/dashboard/networks/zodiac/entitlement-storage-design" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Дизайн хранения VIP-доступа</Link>
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
