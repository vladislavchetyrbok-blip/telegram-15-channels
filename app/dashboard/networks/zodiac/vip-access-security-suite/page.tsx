import Link from "next/link";
import { ClipboardCheck, FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";
import {
  APHRODITE_VIP_ACCESS_SECURITY_SUITE_CLASSIFICATION,
  APHRODITE_VIP_ACCESS_SECURITY_SUITE_FALLBACK_ROUTE,
  APHRODITE_VIP_ACCESS_SECURITY_SUITE_RULE,
  getAphroditeVipAccessSecurityBoundaries,
  getAphroditeVipAccessSecurityGates,
  getAphroditeVipAccessSecurityLayers,
  getAphroditeVipAccessSecurityNextSteps,
} from "@/lib/zodiac/aphrodite-vip-access-security-suite";

export const metadata = {
  title: "Security QA для VIP-доступа",
};

const layers = getAphroditeVipAccessSecurityLayers();
const gates = getAphroditeVipAccessSecurityGates();
const boundaries = getAphroditeVipAccessSecurityBoundaries();
const nextSteps = getAphroditeVipAccessSecurityNextSteps();

const riskLabel = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
  critical: "критический",
} as const;

export default function AphroditeVipAccessSecuritySuitePage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Aphrodite / VIP access / security QA</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">Security QA для VIP-доступа</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_VIP_ACCESS_SECURITY_SUITE_CLASSIFICATION}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 167 собирает единый QA-слой по product catalog, fallback, guard, ledger, storage, schema и server skeleton.
            Это только проверка безопасности: suite ничего не открывает, не создаёт entitlement и не подключает оплату.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_VIP_ACCESS_SECURITY_SUITE_RULE}
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
            <ClipboardCheck className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Сводка QA</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
            <Metric label="Security layers" value={String(layers.length)} />
            <Metric label="Security gates" value={String(gates.length)} />
            <Metric label="Fallback route" value={APHRODITE_VIP_ACCESS_SECURITY_SUITE_FALLBACK_ROUTE} />
            <Metric label="VIP unlock" value="Нет" />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Все gate’ы ожидают PASS только для safety-состояния: free preview остаётся открытым, а будущие paid/VIP слои остаются закрытыми.
          </p>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Security gates</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {gates.map((gate) => (
              <article key={gate.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-medium text-white">{gate.visibleRule}</h3>
                  <span className="rounded-md border border-emerald-900/60 bg-emerald-950/30 px-2 py-0.5 text-[11px] text-emerald-200">
                    {gate.expectedResult}
                  </span>
                </div>
                <p className="mt-2 font-mono text-xs text-slate-500">{gate.id}</p>
                <p className="mt-3 text-xs leading-5 text-slate-400">
                  Evidence layers: {gate.evidenceLayers.join(", ")}.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Проверяемые слои</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {layers.map((layer) => (
              <article key={layer.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-medium text-white">{layer.title}</h3>
                  <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                    read-only
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{layer.purpose}</p>
                <div className="mt-3 space-y-1 font-mono text-xs text-slate-500">
                  <p>{layer.modelFile}</p>
                  <p>{layer.qaFile}</p>
                </div>
                <Link href={layer.route} className="mt-3 inline-block text-sm text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
                  Открыть dashboard-раздел
                </Link>
              </article>
            ))}
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
          <p className="mt-3 text-xs text-slate-500">Package 168 не начинается автоматически.</p>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/server-entitlement-check-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton server-side entitlement</Link>
            <Link href="/dashboard/networks/zodiac/entitlement-schema-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton схемы entitlement</Link>
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
