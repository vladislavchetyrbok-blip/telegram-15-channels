import Link from "next/link";
import { FileText, KeyRound, Layers3, ListChecks, ShieldCheck, Workflow } from "lucide-react";
import {
  APHRODITE_VIP_BOUNDARY_BLOCKED_CLIENT_SHORTCUTS,
  APHRODITE_VIP_BOUNDARY_GUARD_TYPES,
  APHRODITE_VIP_BOUNDARY_IMPLEMENTATION_PLAN_CLASSIFICATION,
  getAphroditeVipBoundaryImplementationPhases,
  getAphroditeVipBoundaryImplementationTargets,
  getAphroditeVipBoundaryNextSteps,
  getAphroditeVipBoundaryQaRequirements,
  getAphroditeVipBoundarySafetyBoundaries,
} from "@/lib/zodiac/aphrodite-vip-access-boundary-implementation-plan";

export const metadata = {
  title: "План внедрения границы VIP-доступа",
};

const targets = getAphroditeVipBoundaryImplementationTargets();
const phases = getAphroditeVipBoundaryImplementationPhases();
const qaRequirements = getAphroditeVipBoundaryQaRequirements();
const boundaries = getAphroditeVipBoundarySafetyBoundaries();
const nextSteps = getAphroditeVipBoundaryNextSteps();

const riskLabel = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
  critical: "критический",
} as const;

const targetTypeLabel = {
  route: "route",
  component: "component",
  "api-route": "api route",
  "server-action": "server action",
  model: "model",
  qa: "QA",
  dashboard: "dashboard",
  documentation: "documentation",
} as const;

export default function AphroditeVipAccessBoundaryImplementationPlanPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Aphrodite / VIP boundary / план</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">План внедрения границы VIP-доступа</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_VIP_BOUNDARY_IMPLEMENTATION_PLAN_CLASSIFICATION}</p>
          <p className="max-w-3xl text-lg leading-8 text-slate-400">
            Этот раздел превращает предыдущий дизайн entitlement в дорожную карту будущего server-side VIP-доступа. Клиент не может
            разблокировать VIP сам: будущая проверка должна зависеть от пользователя, продукта, payment ledger, статуса, срока действия и отзыва доступа.
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
            <FileText className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Сводка</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Package 157 не создаёт доступ, не принимает оплату и не меняет production delivery. Он фиксирует, какие routes, components,
            будущие API и QA должны быть готовы до реального VIP launch.
          </p>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Цели</div>
              <div className="mt-2 text-2xl font-semibold text-white">{targets.length}</div>
              <p className="mt-1 text-xs text-slate-500">будущих поверхностей и guards</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">QA</div>
              <div className="mt-2 text-2xl font-semibold text-white">{qaRequirements.length}</div>
              <p className="mt-1 text-xs text-slate-500">обязательных проверок до real VIP</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Границы</div>
              <div className="mt-2 text-2xl font-semibold text-white">{boundaries.length}</div>
              <p className="mt-1 text-xs text-slate-500">границ без оплаты и без unlock</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <Layers3 className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Цели внедрения</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Эти targets не внедряются сейчас. Они показывают, где в будущих пакетах должны появиться server-side entitlement checks и fallback.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {targets.map((target) => (
              <article key={target.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-medium text-white">{target.id}</h3>
                    <p className="mt-1 text-xs text-slate-500">{target.fileOrRoute}</p>
                  </div>
                  <span className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-300">
                    {targetTypeLabel[target.targetType]}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{target.currentState}</p>
                <div className="mt-3 text-xs font-medium text-slate-200">Будущий guard:</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">{target.futureGuard}</p>
                <div className="mt-3 text-xs font-medium text-slate-200">Класс аудита:</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">{target.auditClassification}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-medium text-white">Типы будущих guard-проверок</h2>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
              {APHRODITE_VIP_BOUNDARY_GUARD_TYPES.map((guard) => (
                <li key={guard}>{guard}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-rose-300" />
              <h2 className="text-xl font-medium text-rose-100">Заблокированные клиентские обходы</h2>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-rose-100/80">
              {APHRODITE_VIP_BOUNDARY_BLOCKED_CLIENT_SHORTCUTS.map((shortcut) => (
                <li key={shortcut}>{shortcut}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Фазы внедрения</h2>
          </div>
          <div className="mt-5 space-y-4">
            {phases.map((phase) => (
              <div key={phase.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <h3 className="text-base font-medium text-white">{phase.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{phase.purpose}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium text-emerald-300">Разрешено сейчас</div>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-400">
                      {phase.allowedInThisPackage.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-rose-300">Заблокировано сейчас</div>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-400">
                      {phase.blockedInThisPackage.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">QA-требования</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {qaRequirements.map((qa) => (
              <div key={qa.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-medium text-white">{qa.label}</h3>
                  <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                    риск: {riskLabel[qa.riskLevel]}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{qa.englishControl}</p>
                <div className="mt-3 text-xs font-medium text-slate-200">Должно пройти:</div>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-400">
                  {qa.mustPassBeforeRealVip.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="mt-3 text-xs font-medium text-rose-300">Должно падать, если:</div>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-400">
                  {qa.mustFailIf.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
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
          <p className="mt-3 text-xs text-slate-500">Package 158 не начинается автоматически.</p>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/paywall-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Подготовка paywall</Link>
            <Link href="/dashboard/networks/zodiac/entitlement-enforcement-design" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Дизайн VIP-доступа</Link>
            <Link href="/dashboard/networks/zodiac/vip-access-guard-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton VIP-guard</Link>
            <Link href="/dashboard/networks/zodiac/vip-guard-integration-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Review VIP-guard</Link>
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
