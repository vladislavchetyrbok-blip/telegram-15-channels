import Link from "next/link";
import { ClipboardCheck, MousePointerClick, ShieldAlert, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_FINAL_CONTENT_CTA_INVENTORY_AUDIT_ROUTE,
  getAphroditeFinalContentCtaInventoryAudit,
  type AphroditeCtaInventoryRiskLevel,
  type AphroditeCtaInventoryStatus,
} from "@/lib/zodiac/aphrodite-final-content-cta-inventory-audit";

const model = getAphroditeFinalContentCtaInventoryAudit();

export const metadata = {
  title: model.title,
};

export default function AphroditeFinalContentCtaInventoryAuditPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-4">
          <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs leading-5 text-emerald-300">
            <MousePointerClick className="h-4 w-4 shrink-0" />
            <span>Aphrodite / Final Content & CTA Inventory / Package {model.packageNumber}</span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white sm:text-3xl">{model.title}</h1>
          <p className="max-w-5xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            Final read-only inventory of launch content entry points and CTAs. It shows labels, destinations, risk, status,
            owner review needs, and confirms that active CTA logic was not changed.
          </p>
          <div className="grid max-w-5xl gap-2 sm:grid-cols-2">
            {model.auditOnlyMessages.map((message) => (
              <div key={message} className="rounded-lg border border-amber-900/50 bg-amber-950/20 px-4 py-3 text-sm leading-6 text-amber-100">
                {message}
              </div>
            ))}
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="publicLaunchApproved" value={String(model.publicLaunchApproved)} tone="rose" />
          <Metric label="ownerManualReviewRequired" value={String(model.ownerManualReviewRequired)} tone="amber" />
          <Metric label="activeCtaLogicChanged" value={String(model.safetyFlags.activeCtaLogicChanged)} tone="rose" />
          <Metric label="messagesSent" value={String(model.safetyFlags.messagesSent)} tone="rose" />
          <Metric label="publishScriptsChanged" value={String(model.safetyFlags.publishScriptsChanged)} tone="rose" />
        </section>

        <ReviewSection title="content & CTA inventory" icon={<ClipboardCheck className="h-5 w-5 text-cyan-400" />}>
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <div className="hidden grid-cols-[1.05fr_1.1fr_1.2fr_0.65fr_0.9fr_1.2fr_0.7fr] gap-0 border-b border-slate-800 bg-slate-950 px-4 py-3 text-[11px] font-semibold uppercase tracking-normal text-slate-500 xl:grid">
              <div>Area / flow</div>
              <div>User-visible CTA label</div>
              <div>Expected destination</div>
              <div>Risk level</div>
              <div>Status</div>
              <div>Notes</div>
              <div>Active logic changed</div>
            </div>
            <div className="divide-y divide-slate-800">
              {model.inventory.map((item) => (
                <article key={item.id} className="grid gap-3 bg-black/30 p-4 xl:grid-cols-[1.05fr_1.1fr_1.2fr_0.65fr_0.9fr_1.2fr_0.7fr]">
                  <MatrixCell label="Area / flow">
                    <div className="text-sm font-medium text-white">{item.areaFlow}</div>
                    <div className="mt-1 break-words font-mono text-[11px] leading-5 text-slate-500">{item.id}</div>
                  </MatrixCell>
                  <MatrixCell label="User-visible CTA label">{item.userVisibleCtaLabel}</MatrixCell>
                  <MatrixCell label="Expected destination">{item.expectedDestination}</MatrixCell>
                  <MatrixCell label="Risk level">
                    <span className={riskClassName(item.riskLevel)}>{item.riskLevel}</span>
                  </MatrixCell>
                  <MatrixCell label="Status">
                    <span className={statusClassName(item.status)}>{item.status}</span>
                  </MatrixCell>
                  <MatrixCell label="Notes">{item.notes}</MatrixCell>
                  <MatrixCell label="Active logic changed">
                    <span className="inline-flex max-w-full break-words rounded border border-emerald-900/50 bg-emerald-950/30 px-2 py-1 text-xs leading-5 text-emerald-200">
                      {item.activeLogicChanged ? "Yes" : "No"}
                    </span>
                  </MatrixCell>
                </article>
              ))}
            </div>
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ReviewSection title="owner manual review items" icon={<ShieldAlert className="h-5 w-5 text-amber-200" />}>
            <ul className="grid gap-2 text-sm leading-6 text-slate-300 sm:grid-cols-2">
              {model.manualReviewItems.map((item) => (
                <li key={item} className="rounded-md border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-amber-100">
                  {item}
                </li>
              ))}
            </ul>
          </ReviewSection>

          <ReviewSection title="risk & status legend" icon={<MousePointerClick className="h-5 w-5 text-cyan-400" />}>
            <div className="space-y-4">
              <div>
                <div className="text-[11px] font-semibold uppercase text-slate-500">risk levels</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {model.riskLevels.map((risk) => (
                    <span key={risk} className={riskClassName(risk)}>{risk}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase text-slate-500">statuses</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {model.statuses.map((status) => (
                    <span key={status} className={statusClassName(status)}>{status}</span>
                  ))}
                </div>
              </div>
            </div>
          </ReviewSection>
        </section>

        <ReviewSection title="safety confirmation" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(model.safetyFlags).map(([key, value]) => (
              <div key={key} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                <div className="break-words font-mono text-xs text-slate-500">{key}</div>
                <p className="mt-1 text-sm font-medium text-emerald-300">{String(value)}</p>
              </div>
            ))}
          </div>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Related readiness sections</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-go-no-go-review" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Public Launch Go/No-Go</Link>
            <Link href="/dashboard/networks/zodiac/public-launch-dry-run-matrix" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">Dry-Run Matrix</Link>
            <Link href="/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">StartApp Diagnostics</Link>
          </div>
          <p className="mt-3 break-all font-mono text-[11px] leading-5 text-slate-500">{APHRODITE_FINAL_CONTENT_CTA_INVENTORY_AUDIT_ROUTE}</p>
        </div>
      </div>
    </div>
  );
}

function riskClassName(risk: AphroditeCtaInventoryRiskLevel) {
  if (risk === "HIGH") return "inline-flex max-w-full break-words rounded border border-rose-900/50 bg-rose-950/30 px-2 py-1 text-xs leading-5 text-rose-200";
  if (risk === "MEDIUM") return "inline-flex max-w-full break-words rounded border border-amber-900/50 bg-amber-950/30 px-2 py-1 text-xs leading-5 text-amber-200";
  return "inline-flex max-w-full break-words rounded border border-emerald-900/50 bg-emerald-950/30 px-2 py-1 text-xs leading-5 text-emerald-200";
}

function statusClassName(status: AphroditeCtaInventoryStatus) {
  if (status === "PASS") return "inline-flex max-w-full break-words rounded border border-emerald-900/50 bg-emerald-950/30 px-2 py-1 text-xs leading-5 text-emerald-200";
  if (status === "BLOCKED") return "inline-flex max-w-full break-words rounded border border-rose-900/50 bg-rose-950/30 px-2 py-1 text-xs leading-5 text-rose-200";
  if (status === "NOT CHECKED") return "inline-flex max-w-full break-words rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs leading-5 text-slate-300";
  return "inline-flex max-w-full break-words rounded border border-amber-900/50 bg-amber-950/30 px-2 py-1 text-xs leading-5 text-amber-200";
}

function ReviewSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {icon}
        <h2 className="text-lg font-medium text-white sm:text-xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function MatrixCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 text-sm leading-6 text-slate-300">
      <div className="mb-1 text-[11px] font-semibold uppercase text-slate-500 xl:hidden">{label}</div>
      <div className="break-words">{children}</div>
    </div>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "rose" | "amber" }) {
  const toneClass = tone === "rose" ? "text-rose-300" : tone === "amber" ? "text-amber-200" : "text-emerald-300";

  return (
    <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={`mt-2 break-words text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
