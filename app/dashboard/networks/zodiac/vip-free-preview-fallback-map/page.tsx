import Link from "next/link";
import { ArrowRight, FileSearch, ListChecks, LockKeyhole, Route, ShieldCheck, Split } from "lucide-react";
import {
  APHRODITE_VIP_FALLBACK_CLASSIFICATION,
  APHRODITE_VIP_FREE_PREVIEW_FALLBACK_ROUTE,
  getAphroditeVipFallbackBoundaries,
  getAphroditeVipFallbackNextSteps,
  getAphroditeVipFallbackQaItems,
  getAphroditeVipFallbackRules,
  getAphroditeVipFallbackSurfaces,
} from "@/lib/zodiac/aphrodite-vip-free-preview-fallback-map";
import { checkAphroditeVipAccessSkeleton } from "@/lib/zodiac/aphrodite-vip-access-guard-skeleton";
import { getAphroditeVipGuardIntegrationSurfaces } from "@/lib/zodiac/aphrodite-vip-guard-integration-review";

export const metadata = {
  title: "Карта fallback для VIP-разделов",
};

const surfaces = getAphroditeVipFallbackSurfaces();
const rules = getAphroditeVipFallbackRules();
const qaItems = getAphroditeVipFallbackQaItems();
const boundaries = getAphroditeVipFallbackBoundaries();
const nextSteps = getAphroditeVipFallbackNextSteps();
const integrationSurfaces = getAphroditeVipGuardIntegrationSurfaces();

const freeSurfaces = surfaces.filter((surface) => surface.mustRemainOpen);
const futureVipSurfaces = surfaces.filter((surface) => surface.futureGuardRequired);
const fallbackMessages = Array.from(new Set(surfaces.map((surface) => surface.visibleFallbackMessage)));
const blockedFailureModes = Array.from(new Set(rules.flatMap((rule) => rule.blockedFailureModes)));
const sampleDecisions = (["full-love-report", "vip-couple-calendar", "vip-numerology"] as const).map((product) =>
  checkAphroditeVipAccessSkeleton({
    product,
    source: "dashboard",
    requestedRoute: "/dashboard/networks/zodiac/vip-free-preview-fallback-map",
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

const actionLabel = {
  "show-free-preview": "показать бесплатный preview",
  "show-locked-teaser": "показать locked teaser",
  "redirect-to-free-preview": "перевести в free preview",
  "deny-with-safe-message": "deny с безопасным сообщением",
  "owner-review-required": "нужен owner review",
  "keep-open": "оставить открытым",
} as const;

export default function AphroditeVipFreePreviewFallbackMapPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <FileSearch className="h-4 w-4" />
            <span>Aphrodite / VIP fallback / readiness</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">Карта fallback для VIP-разделов</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_VIP_FALLBACK_CLASSIFICATION}</p>
          <p className="max-w-3xl text-lg leading-8 text-slate-400">
            Package 161 фиксирует, что пользователь видит при отсутствии VIP-доступа: бесплатный preview, понятное
            объяснение, безопасный маршрут назад и отсутствие пустого экрана. Это только карта fallback, без оплаты,
            без entitlement creation и без подключения guard к production.
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
            <h2 className="text-xl font-medium text-white">Сводка</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
            <Metric label="Fallback surfaces" value={String(surfaces.length)} />
            <Metric label="Must remain open" value={String(freeSurfaces.length)} />
            <Metric label="Future VIP fallback" value={String(futureVipSurfaces.length)} />
            <Metric label="Fallback route" value={APHRODITE_VIP_FREE_PREVIEW_FALLBACK_ROUTE} />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Если VIP-доступа нет, пользователь не должен попасть в пустоту или ошибку. Он должен видеть безопасный
            fallback: бесплатный preview, понятное объяснение и мягкий путь назад.
          </p>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Fallback surfaces</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {surfaces.map((surface) => (
              <article key={surface.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-white">{surface.label}</h3>
                    <p className="mt-1 text-xs text-slate-500">{surface.fileOrRoute}</p>
                  </div>
                  <span className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                    риск: {riskLabel[surface.riskLevel]}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{surface.currentState}</p>
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-slate-300">
                    действие: {actionLabel[surface.fallbackAction]}
                  </div>
                  <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-emerald-300">
                    fallback: {surface.fallbackRoute}
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">{surface.visibleFallbackMessage}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/10 p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-medium text-white">Free routes that must remain open</h2>
            </div>
            <div className="mt-4 space-y-2">
              {freeSurfaces.map((surface) => (
                <div key={surface.id} className="rounded-lg border border-slate-800 bg-black/30 p-3">
                  <div className="text-sm font-medium text-emerald-200">{surface.label}</div>
                  <div className="mt-1 text-xs text-slate-500">{surface.fileOrRoute}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <Split className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-medium text-white">Future VIP fallback routes</h2>
            </div>
            <div className="mt-4 space-y-2">
              {futureVipSurfaces.map((surface) => (
                <div key={surface.id} className="rounded-lg border border-slate-800 bg-black/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-white">{surface.label}</span>
                    <span className="text-xs text-emerald-300">{surface.fallbackRoute}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-medium text-white">Visible fallback messages</h2>
            </div>
            <div className="mt-4 space-y-3">
              {fallbackMessages.map((message) => (
                <p key={message} className="rounded-lg border border-slate-800 bg-black/30 p-3 text-sm leading-6 text-slate-300">
                  {message}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-6">
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-rose-300" />
              <h2 className="text-xl font-medium text-rose-100">Blocked failure modes</h2>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {blockedFailureModes.map((mode) => (
                <span key={mode} className="rounded-md border border-rose-900/50 bg-black/20 px-3 py-2 text-sm text-rose-100/85">
                  {mode}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-medium text-white">QA requirements</h2>
            </div>
            <div className="mt-4 space-y-4">
              {qaItems.map((item) => (
                <article key={item.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                  <h3 className="text-sm font-medium text-white">{item.label}</h3>
                  <p className="mt-2 text-xs text-emerald-300">Должно проходить: {item.mustPass.join("; ")}</p>
                  <p className="mt-2 text-xs text-rose-300">Должно падать, если: {item.mustFailIf.join("; ")}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-medium text-white">Sample deny-by-default</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Это display-only проверка Package 158 skeleton. Она показывает deny и fallback, но не подключает guard к production.
            </p>
            <div className="mt-4 space-y-3">
              {sampleDecisions.map((decision) => (
                <article key={decision.product} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-medium text-white">{decision.product}</h3>
                    <span className="rounded-md border border-rose-900/60 bg-rose-950/30 px-2 py-0.5 text-[11px] text-rose-200">
                      allowed=false
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-emerald-300">fallback={decision.fallbackRoute}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-medium text-white">Safety boundaries</h2>
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
          <h2 className="text-xl font-medium text-white">Связь с Package 160</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Package 160 описывает будущие места guard. Package 161 уточняет, какой fallback должен быть виден, если
            доступ не подтверждён. Найдено review surfaces: {integrationSurfaces.length}.
          </p>
          <div className="mt-4">
            <Link href="/dashboard/networks/zodiac/vip-guard-integration-review" className="inline-flex items-center gap-2 text-sm text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
              Review VIP-guard <ArrowRight className="h-4 w-4" />
            </Link>
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
          <p className="mt-3 text-xs text-slate-500">Package 162 не начинается автоматически.</p>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/owner-review-gate" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Owner Review Gate</Link>
            <Link href="/dashboard/networks/zodiac/telegram-stars-payment-architecture-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Review Telegram Stars</Link>
            <Link href="/dashboard/networks/zodiac/vip-access-guard-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton VIP-guard</Link>
            <Link href="/dashboard/networks/zodiac/vip-guard-integration-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Review VIP-guard</Link>
            <Link href="/dashboard/networks/zodiac/vip-access-boundary-implementation-plan" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">План VIP-границы</Link>
            <Link href="/dashboard/networks/zodiac/paywall-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Подготовка paywall</Link>
            <Link href="/dashboard/networks/zodiac/entitlement-enforcement-design" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Дизайн VIP-доступа</Link>
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
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}
