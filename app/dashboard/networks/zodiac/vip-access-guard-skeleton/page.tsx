import Link from "next/link";
import { KeyRound, Layers3, ListChecks, ShieldCheck, Sparkles } from "lucide-react";
import {
  APHRODITE_VIP_GUARD_IGNORED_CLIENT_SIGNALS,
  APHRODITE_VIP_GUARD_REQUIRED_FUTURE_CHECKS,
  APHRODITE_VIP_GUARD_SKELETON_CLASSIFICATION,
  checkAphroditeVipAccessSkeleton,
  getAphroditeVipGuardBoundaries,
  getAphroditeVipGuardNextSteps,
  getAphroditeVipGuardProductLabels,
  getAphroditeVipGuardProducts,
} from "@/lib/zodiac/aphrodite-vip-access-guard-skeleton";

export const metadata = {
  title: "Skeleton проверки VIP-доступа",
};

const products = getAphroditeVipGuardProductLabels();
const boundaries = getAphroditeVipGuardBoundaries();
const nextSteps = getAphroditeVipGuardNextSteps();
const sampleDecisions = getAphroditeVipGuardProducts().slice(0, 5).map((product) =>
  checkAphroditeVipAccessSkeleton({
    product,
    source: "dashboard",
    requestedRoute: "/dashboard/networks/zodiac/vip-access-guard-skeleton",
    mockClientVipFlag: true,
    mockQueryVipFlag: true,
    mockPaymentSuccess: true,
  }),
);

const riskLabel = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
  critical: "критический",
} as const;

export default function AphroditeVipAccessGuardSkeletonPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Aphrodite / VIP guard / skeleton</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">Skeleton проверки VIP-доступа</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_VIP_GUARD_SKELETON_CLASSIFICATION}</p>
          <p className="max-w-3xl text-lg leading-8 text-slate-400">
            Этот раздел показывает будущий guard-интерфейс для VIP-доступа. Skeleton работает только локально и всегда закрывает доступ:
            без verified server-side entitlement результат остаётся `allowed=false`, а пользователь должен видеть бесплатный preview.
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
            <Sparkles className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Сводка</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Package 158 создаёт только skeleton проверки. Он не подключён к production routes, не открывает VIP, не создаёт entitlement,
            не пишет в базу данных и не вызывает Telegram или payment API.
          </p>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Guard</div>
              <div className="mt-2 text-2xl font-semibold text-white">allowed=false</div>
              <p className="mt-1 text-xs text-slate-500">deny-by-default для каждого продукта</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Продукты</div>
              <div className="mt-2 text-2xl font-semibold text-white">{products.length}</div>
              <p className="mt-1 text-xs text-slate-500">защищаемые продукты описаны локально</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Fallback</div>
              <div className="mt-2 text-base font-semibold text-white">/miniapp/love-reading-preview</div>
              <p className="mt-1 text-xs text-slate-500">безопасный бесплатный preview</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Deny-by-default поведение</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Даже если вход содержит mock client VIP flag, mock query VIP flag или mock successful_payment, skeleton игнорирует эти сигналы
            и возвращает deny. Будущий allow возможен только после отдельной server-side проверки entitlement.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {sampleDecisions.map((decision) => (
              <article key={decision.product} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-medium text-white">{decision.product}</h3>
                  <span className="rounded-md border border-rose-900/60 bg-rose-950/30 px-2 py-0.5 text-[11px] text-rose-200">
                    allowed=false
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{decision.decision}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{decision.visibleMessage}</p>
                <p className="mt-3 text-xs text-emerald-300">Fallback: {decision.fallbackRoute}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <Layers3 className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Защищаемые продукты</h2>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {products.map((product) => (
              <div key={product.product} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="text-sm font-medium text-white">{product.label}</div>
                <div className="mt-1 text-xs text-slate-500">{product.product}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-rose-300" />
              <h2 className="text-xl font-medium text-rose-100">Игнорируемые клиентские обходы</h2>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-rose-100/80">
              {APHRODITE_VIP_GUARD_IGNORED_CLIENT_SIGNALS.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-medium text-white">Будущие server-side требования</h2>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
              {APHRODITE_VIP_GUARD_REQUIRED_FUTURE_CHECKS.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-lg border border-emerald-900/40 bg-emerald-950/10 p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-medium text-white">Границы безопасности</h2>
          </div>
          <div className="mt-5 space-y-2">
            {boundaries.map((boundary) => (
              <div key={boundary.dataBoundary} data-boundary={boundary.dataBoundary} className="flex items-start justify-between gap-4 rounded-lg border border-slate-800 bg-black/30 p-3">
                <div>
                  <div className="text-sm font-medium text-slate-100">{boundary.visibleLabel}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-500">
                    Разрешено сейчас: {boundary.allowedNow.join(", ")}. Заблокировано до: {boundary.blockedUntil.join(", ")}.
                  </div>
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
          <p className="mt-3 text-xs text-slate-500">Package 159 не начинается автоматически.</p>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/paywall-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Подготовка paywall</Link>
            <Link href="/dashboard/networks/zodiac/entitlement-enforcement-design" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Дизайн VIP-доступа</Link>
            <Link href="/dashboard/networks/zodiac/vip-access-boundary-implementation-plan" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">План VIP-границы</Link>
            <Link href="/dashboard/networks/zodiac/vip-guard-integration-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Review VIP-guard</Link>
            <Link href="/dashboard/networks/zodiac/vip-free-preview-fallback-map" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Карта fallback VIP</Link>
            <Link href="/dashboard/networks/zodiac/aphrodite-product-remediation" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Aphrodite Product Remediation</Link>
            <Link href="/dashboard/networks/zodiac/first-result-experience" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">First Result Experience</Link>
            <Link href="/dashboard/networks/zodiac/ai-love-reading-foundation" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">AI Love Reading Foundation</Link>
            <Link href="/dashboard/networks/zodiac/public-bot-profile-launch-packaging" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Public Bot Launch Packaging</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
