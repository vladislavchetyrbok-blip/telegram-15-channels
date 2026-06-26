import Link from "next/link";
import { Archive, ClipboardList, Database, FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";
import {
  APHRODITE_ENTITLEMENT_STORAGE_DESIGN_CLASSIFICATION,
  APHRODITE_ENTITLEMENT_STORAGE_DESIGN_RULE,
  getAphroditeEntitlementStorageBoundaries,
  getAphroditeEntitlementStorageDependencies,
  getAphroditeEntitlementStorageFields,
  getAphroditeEntitlementStorageNextSteps,
  getAphroditeEntitlementStorageRules,
} from "@/lib/zodiac/aphrodite-entitlement-storage-design";

export const metadata = {
  title: "Дизайн хранения VIP-доступа",
};

const fields = getAphroditeEntitlementStorageFields();
const rules = getAphroditeEntitlementStorageRules();
const boundaries = getAphroditeEntitlementStorageBoundaries();
const nextSteps = getAphroditeEntitlementStorageNextSteps();
const dependencies = getAphroditeEntitlementStorageDependencies();

const riskLabel = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
  critical: "критический",
} as const;

function flag(value: boolean) {
  return value ? "Да" : "Нет";
}

export default function AphroditeEntitlementStorageDesignPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <Archive className="h-4 w-4" />
            <span>Aphrodite / entitlement storage / design</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">Дизайн хранения VIP-доступа</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_ENTITLEMENT_STORAGE_DESIGN_CLASSIFICATION}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 164 описывает, как будущая запись VIP-доступа должна выглядеть после verified payment ledger. Это только storage design:
            запись не создаётся, база данных не меняется, доступ не открывается.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_ENTITLEMENT_STORAGE_DESIGN_RULE}
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
            <h2 className="text-xl font-medium text-white">Сводка хранения</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
            <Metric label="Future fields" value={String(fields.length)} />
            <Metric label="Rules" value={String(rules.length)} />
            <Metric label="Dependencies" value={String(dependencies.length)} />
            <Metric label="Entitlement created now" value="Нет" />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Storage design зависит от Package 163 payment ledger и финального каталога продуктов. Ни одна клиентская подсказка,
            expired/revoked/refunded status или fake entitlement record не должна открывать доступ без будущей server-side проверки.
          </p>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Поля будущего entitlement</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {fields.map((field) => (
              <article key={field.fieldName} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-medium text-white">{field.fieldName}</h3>
                    <p className="mt-1 font-mono text-xs text-slate-500">{field.source}</p>
                  </div>
                  <span className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                    required: {flag(field.requiredForFutureRecord)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{field.visiblePurpose}</p>
                <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                  <StatusLine label="designOnly" value={String(field.designOnly)} tone="success" />
                  <StatusLine label="writesToDatabaseNow" value={String(field.writesToDatabaseNow)} tone="success" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-rose-400" />
              <h2 className="text-xl font-medium text-white">Правила хранения</h2>
            </div>
            <div className="mt-5 space-y-3">
              {rules.map((rule) => (
                <article key={rule.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                  <h3 className="text-sm font-medium text-white">{rule.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{rule.visibleRule}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Доступ сейчас закрыт: {flag(rule.blocksAccessNow)}. Заблокировано до: {rule.blockedUntil.join(", ")}.
                  </p>
                </article>
              ))}
            </div>
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
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Зависимости и следующий пакет</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {dependencies.map((dependency) => (
              <div key={dependency.source} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="font-mono text-xs text-emerald-300">{dependency.source}</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{dependency.visibleReason}</p>
              </div>
            ))}
          </div>
          <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-slate-300">
            {nextSteps.map((step) => (
              <li key={step.package}>
                <span className="text-white">
                  {step.package} — {step.title}:
                </span>{" "}
                {step.purpose}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Package 165 начинается только после отдельного подтверждённого commit/push Package 164.</p>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/payment-ledger-design" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Дизайн payment ledger</Link>
            <Link href="/dashboard/networks/zodiac/product-catalog-finalization" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Каталог продуктов</Link>
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
