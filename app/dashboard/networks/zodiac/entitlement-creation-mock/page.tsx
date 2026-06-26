import Link from "next/link";
import { FileCheck2, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";

import {
  APHRODITE_ENTITLEMENT_CREATION_MOCK_CLASSIFICATION,
  APHRODITE_ENTITLEMENT_CREATION_MOCK_RULE,
  APHRODITE_ENTITLEMENT_CREATION_MOCK_SAFETY_LABELS,
  APHRODITE_ENTITLEMENT_CREATION_MOCK_TITLE,
  draftAphroditeEntitlementGrantMock,
  getAphroditeEntitlementCreationMockBoundaries,
  getAphroditeEntitlementCreationMockNextSteps,
  getAphroditeEntitlementCreationMockRules,
} from "@/lib/zodiac/aphrodite-entitlement-creation-mock";

export const metadata = {
  title: APHRODITE_ENTITLEMENT_CREATION_MOCK_TITLE,
};

const rules = getAphroditeEntitlementCreationMockRules();
const boundaries = getAphroditeEntitlementCreationMockBoundaries();
const nextSteps = getAphroditeEntitlementCreationMockNextSteps();
const sampleResult = draftAphroditeEntitlementGrantMock({
  productId: "full_love_report",
  telegramUserId: "mock-user",
  mockVerifiedLedger: true,
  ownerApproved: true,
  entitlementsEnabled: true,
  securityQaApproved: true,
  supportPolicyReady: true,
  backupFresh: true,
});

export default function AphroditeEntitlementCreationMockPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Aphrodite / Telegram Stars / entitlement mock</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{APHRODITE_ENTITLEMENT_CREATION_MOCK_TITLE}</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_ENTITLEMENT_CREATION_MOCK_CLASSIFICATION}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 174 моделирует будущие требования к entitlement grant, но не создаёт entitlement, не пишет в базу,
            не выдаёт доступ и не открывает VIP. Даже all-true mock input остаётся deny-by-default.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_ENTITLEMENT_CREATION_MOCK_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {APHRODITE_ENTITLEMENT_CREATION_MOCK_SAFETY_LABELS.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-400">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Metric label="mockOnly" value={String(sampleResult.mockOnly)} />
          <Metric label="createsEntitlementNow" value={String(sampleResult.createsEntitlementNow)} />
          <Metric label="writesToDatabaseNow" value={String(sampleResult.writesToDatabaseNow)} />
          <Metric label="grantsAccessNow" value={String(sampleResult.grantsAccessNow)} />
          <Metric label="unlocksVipNow" value={String(sampleResult.unlocksVipNow)} />
          <Metric label="allowed" value={String(sampleResult.allowed)} />
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-medium text-white">Будущие зависимости entitlement grant</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rules.map((rule) => (
              <article key={rule.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <h3 className="text-base font-medium text-white">{rule.label}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{rule.futureDependency}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  До live: {rule.requiredBeforeLive.join("; ")}.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-medium text-white">Mock entitlement draft</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-slate-800 bg-black/30 p-4 text-sm text-slate-300">
              <Row label="productId" value={sampleResult.productId} />
              <Row label="entitlementDraftId" value={sampleResult.entitlementDraftId} />
              <Row label="fallbackRoute" value={sampleResult.fallbackRoute} />
            </div>
            <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-4">
              <h3 className="text-sm font-medium text-rose-100">Dependency notes</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-rose-100/80">
                {sampleResult.dependencyNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
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
              Package 175 не начинается автоматически. Для него нужно отдельное подтверждение.
            </p>
          </div>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/payment-ledger-mock-integration" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mock payment ledger</Link>
            <Link href="/dashboard/networks/zodiac/entitlement-storage-design" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Дизайн entitlement storage</Link>
            <Link href="/dashboard/networks/zodiac/entitlement-schema-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton схемы entitlement</Link>
            <Link href="/dashboard/networks/zodiac/server-entitlement-check-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton server-side entitlement</Link>
            <Link href="/miniapp/love-reading-preview" className="text-rose-300 underline underline-offset-4 hover:text-rose-200">Free Love Reading Preview</Link>
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
    <div className="flex items-start justify-between gap-4 border-b border-slate-800 py-2 last:border-b-0">
      <dt className="font-mono text-xs text-slate-500">{label}</dt>
      <dd className="max-w-sm break-words text-right text-slate-200">{value}</dd>
    </div>
  );
}
