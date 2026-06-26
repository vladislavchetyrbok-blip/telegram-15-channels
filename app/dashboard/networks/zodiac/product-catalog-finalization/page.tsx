import Link from "next/link";
import { ArrowRight, Boxes, CheckCircle2, ClipboardList, LockKeyhole, Route, ShieldCheck } from "lucide-react";
import {
  APHRODITE_PRODUCT_CATALOG_CLASSIFICATION,
  APHRODITE_PRODUCT_CATALOG_FREE_FALLBACK_ROUTE,
  APHRODITE_PRODUCT_CATALOG_RULE,
  getAphroditeFreeProducts,
  getAphroditeFutureVipProducts,
  getAphroditeProductCatalog,
  getAphroditeProductCatalogBoundaries,
  getAphroditeProductCatalogNextSteps,
  getAphroditeProductCatalogRules,
} from "@/lib/zodiac/aphrodite-product-catalog";
import { getAphroditeVipFallbackSurfaces } from "@/lib/zodiac/aphrodite-vip-free-preview-fallback-map";

export const metadata = {
  title: "Финальный каталог продуктов Aphrodite",
};

const catalog = getAphroditeProductCatalog();
const freeProducts = getAphroditeFreeProducts();
const futureVipProducts = getAphroditeFutureVipProducts();
const rules = getAphroditeProductCatalogRules();
const boundaries = getAphroditeProductCatalogBoundaries();
const nextSteps = getAphroditeProductCatalogNextSteps();
const fallbackSurfaces = getAphroditeVipFallbackSurfaces();

const riskLabel = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
  critical: "критический",
} as const;

const accessLabel = {
  free: "бесплатный",
  "free-preview": "бесплатный preview",
  "future-vip-locked": "будущий VIP закрыт",
  "future-paid-locked": "будущий paid/VIP закрыт",
  "dashboard-review-only": "только dashboard review",
  "owner-review-required": "нужен owner review",
} as const;

const ruleTitle = {
  "free-preview-open": "Бесплатный preview остаётся открытым",
  "future-vip-locked": "Будущие VIP-продукты остаются закрытыми",
  "payment-disabled-now": "Оплата отключена сейчас",
  "vip-unlock-disabled-now": "VIP-разблокировка отключена сейчас",
  "entitlement-disabled-now": "Создание entitlement отключено сейчас",
  "future-vip-fallback-required": "Каждому будущему VIP нужен fallback route",
  "future-paid-guard-required": "Каждому будущему paid/VIP нужен будущий guard",
  "future-paid-entitlement-required": "Каждому будущему paid/VIP нужен будущий entitlement",
  "owner-review-before-paid-production": "Production-paid невозможен без owner review",
} as const;

function flag(value: boolean) {
  return value ? "Да" : "Нет";
}

export default function AphroditeProductCatalogFinalizationPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <Boxes className="h-4 w-4" />
            <span>Aphrodite / каталог продуктов / готовность</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">Финальный каталог продуктов Aphrodite</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_PRODUCT_CATALOG_CLASSIFICATION}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 162 фиксирует единый источник истины по продуктам Aphrodite/Zodiac: какие продукты существуют,
            что остаётся бесплатным, что относится к будущему VIP/paywall, какой fallback route используется и какие
            guard, entitlement, payment и owner review требования нужны позже.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_PRODUCT_CATALOG_RULE}
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
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-5">
            <Metric label="Продуктов" value={String(catalog.length)} />
            <Metric label="Бесплатных" value={String(freeProducts.length)} />
            <Metric label="Будущих VIP" value={String(futureVipProducts.length)} />
            <Metric label="Fallback route" value={APHRODITE_PRODUCT_CATALOG_FREE_FALLBACK_ROUTE} />
            <Metric label="Связь с Package 161" value={`${fallbackSurfaces.length} поверхностей`} />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Бесплатный funnel остаётся открытым: `/miniapp`, `/miniapp/love-reading-preview`, `/birth-matrix` и `/compatibility`
            не должны требовать VIP. Будущие paid/VIP продукты остаются закрытыми до отдельных пакетов guard, ledger,
            entitlement и owner review.
          </p>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Каталог продуктов</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {catalog.map((product) => (
              <article key={product.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-medium text-white">{product.publicName}</h3>
                    <p className="mt-1 font-mono text-xs text-slate-500">{product.id}</p>
                  </div>
                  <span className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                    риск: {riskLabel[product.riskLevel]}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{product.description}</p>
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  <StatusLine label="Статус" value={accessLabel[product.accessLevel]} />
                  <StatusLine label="Route" value={product.route} />
                  <StatusLine label="Fallback" value={product.fallbackRoute} tone="success" />
                  <StatusLine label="Guard" value={flag(product.guardRequired)} />
                  <StatusLine label="Entitlement" value={flag(product.entitlementRequired)} />
                  <StatusLine label="Требуется оплата" value={flag(product.paymentRequired)} />
                  <StatusLine label="paymentEnabledNow" value={String(product.paymentEnabledNow)} tone="success" />
                  <StatusLine label="vipUnlockEnabledNow" value={String(product.vipUnlockEnabledNow)} tone="success" />
                </div>
                <div className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
                  <p>Готовность paywall: {product.paywallReadiness}</p>
                  <p>Готовность оплаты: {product.paymentReadinessStatus}</p>
                  <p>Готовность entitlement: {product.entitlementReadinessStatus}</p>
                  <p>Готовность запуска: {product.launchReadiness}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/10 p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-medium text-white">Что остаётся бесплатным</h2>
            </div>
            <div className="mt-4 space-y-3">
              {freeProducts.map((product) => (
                <article key={product.id} className="rounded-lg border border-slate-800 bg-black/30 p-3">
                  <div className="text-sm font-medium text-emerald-200">{product.publicName}</div>
                  <div className="mt-1 text-xs text-slate-500">{product.route}</div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{product.whatRemainsFree.join("; ")}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-6">
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-rose-300" />
              <h2 className="text-xl font-medium text-rose-100">Что должно оставаться закрытым</h2>
            </div>
            <div className="mt-4 space-y-3">
              {futureVipProducts.map((product) => (
                <article key={product.id} className="rounded-lg border border-rose-900/40 bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-white">{product.publicName}</span>
                    <span className="text-xs text-emerald-300">{product.fallbackRoute}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-rose-100/80">
                    Заблокировано до: {product.mustStayLockedUntil.join("; ")}.
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Правила каталога</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {rules.map((rule) => (
              <article key={rule.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <h3 className="text-sm font-medium text-white">{ruleTitle[rule.id as keyof typeof ruleTitle] ?? rule.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{rule.visibleRule}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Продукты: {rule.appliesTo.join(", ")}. Заблокировано до: {rule.blockedUntil.length > 0 ? rule.blockedUntil.join(", ") : "не требуется"}.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-medium text-white">Границы безопасности</h2>
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
          <p className="mt-3 text-xs text-slate-500">Package 163 не начинается автоматически.</p>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/owner-review-gate" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Owner Review Gate</Link>
            <Link href="/dashboard/networks/zodiac/vip-free-preview-fallback-map" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Карта fallback VIP</Link>
            <Link href="/dashboard/networks/zodiac/vip-access-guard-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton VIP-guard</Link>
            <Link href="/dashboard/networks/zodiac/vip-guard-integration-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Review VIP-guard</Link>
            <Link href="/miniapp/love-reading-preview" className="inline-flex items-center gap-2 text-rose-300 underline underline-offset-4 hover:text-rose-200">
              Free Love Reading Preview <ArrowRight className="h-4 w-4" />
            </Link>
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

function StatusLine({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" }) {
  return (
    <div className={tone === "success" ? "rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-emerald-300" : "rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-slate-300"}>
      <span className="text-slate-500">{label}: </span>
      {value}
    </div>
  );
}
