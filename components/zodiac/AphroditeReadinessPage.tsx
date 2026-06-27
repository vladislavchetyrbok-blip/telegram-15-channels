import Link from "next/link";
import type { ReactNode } from "react";

export type AphroditeReadinessStatus =
  | "PASS"
  | "READY"
  | "DOCUMENTED"
  | "HARDENED"
  | "REDACTED"
  | "NO TRUST"
  | "MANUAL"
  | "MANUAL REQUIRED"
  | "NOT CHECKED"
  | "OWNER REVIEW REQUIRED"
  | "BLOCKED"
  | "BLOCKED BY ENV"
  | "BLOCKED BY BACKUP"
  | "NOT APPROVED";

export type AphroditeReadinessMetric = {
  label: string;
  value: string;
  tone?: "emerald" | "amber" | "rose" | "cyan" | "violet" | "slate";
};

export type AphroditeReadinessRow = {
  area: string;
  status: AphroditeReadinessStatus | string;
  detail: string;
  action: string;
};

export type AphroditeReadinessLink = {
  label: string;
  href: string;
};

export type AphroditeReadinessPageProps = {
  packageNumber: number;
  title: string;
  route: string;
  badge: string;
  description: string;
  metrics: readonly AphroditeReadinessMetric[];
  sections: readonly {
    title: string;
    rows: readonly AphroditeReadinessRow[];
  }[];
  safetyFlags: Record<string, boolean>;
  safetyNotes: readonly string[];
  remainingBlockers: readonly string[];
  relatedLinks?: readonly AphroditeReadinessLink[];
  children?: ReactNode;
};

export function AphroditeReadinessPage({
  packageNumber,
  title,
  route,
  badge,
  description,
  metrics,
  sections,
  safetyFlags,
  safetyNotes,
  remainingBlockers,
  relatedLinks = [],
  children,
}: AphroditeReadinessPageProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-4">
          <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs leading-5 text-cyan-300">
            <span>{badge} / Package {packageNumber}</span>
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white sm:text-3xl">{title}</h1>
          <p className="max-w-5xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">{description}</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((metric) => (
            <Metric key={metric.label} {...metric} />
          ))}
        </section>

        {children}

        {sections.map((section) => (
          <section key={section.title} className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-6">
            <h2 className="mb-5 text-lg font-medium text-white sm:text-xl">{section.title}</h2>
            <div className="overflow-hidden rounded-lg border border-slate-800">
              <div className="hidden grid-cols-[0.9fr_0.6fr_1.5fr_1.2fr] border-b border-slate-800 bg-slate-950 px-4 py-3 text-[11px] font-semibold uppercase tracking-normal text-slate-500 xl:grid">
                <div>Area</div>
                <div>Status</div>
                <div>Detail</div>
                <div>Owner action</div>
              </div>
              <div className="divide-y divide-slate-800">
                {section.rows.map((row) => (
                  <article key={`${section.title}-${row.area}`} className="grid gap-3 bg-black/30 p-4 xl:grid-cols-[0.9fr_0.6fr_1.5fr_1.2fr]">
                    <MatrixCell label="Area">{row.area}</MatrixCell>
                    <MatrixCell label="Status">
                      <span className={statusClassName(row.status)}>{row.status}</span>
                    </MatrixCell>
                    <MatrixCell label="Detail">{row.detail}</MatrixCell>
                    <MatrixCell label="Owner action">{row.action}</MatrixCell>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ))}

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Panel title="safety confirmation">
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(safetyFlags).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                  <div className="break-words font-mono text-xs text-slate-500">{key}</div>
                  <p className="mt-1 text-sm font-medium text-emerald-300">{String(value)}</p>
                </div>
              ))}
            </div>
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-300">
              {safetyNotes.map((note) => (
                <li key={note} className="rounded-md border border-emerald-900/40 bg-emerald-950/20 px-3 py-2 text-emerald-100">{note}</li>
              ))}
            </ul>
          </Panel>

          <Panel title="remaining blockers">
            <ul className="grid gap-2 text-sm leading-6 text-slate-300 sm:grid-cols-2">
              {remainingBlockers.map((blocker) => (
                <li key={blocker} className="rounded-md border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-amber-100">
                  {blocker}
                </li>
              ))}
            </ul>
          </Panel>
        </section>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Related readiness sections</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">
              Zodiac Network
            </Link>
            {relatedLinks.map((link) => (
              <Link key={link.href} href={link.href} className="inline-flex rounded-md border border-indigo-900/40 bg-indigo-950/20 px-3 py-2 text-indigo-300 underline underline-offset-4 hover:border-indigo-700 hover:text-indigo-200">
                {link.label}
              </Link>
            ))}
          </div>
          <p className="mt-3 break-all font-mono text-[11px] leading-5 text-slate-500">{route}</p>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-6">
      <h2 className="mb-5 text-lg font-medium text-white sm:text-xl">{title}</h2>
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

function Metric({ label, value, tone = "slate" }: AphroditeReadinessMetric) {
  const toneClass = {
    emerald: "text-emerald-300",
    amber: "text-amber-200",
    rose: "text-rose-300",
    cyan: "text-cyan-300",
    violet: "text-violet-300",
    slate: "text-slate-200",
  }[tone];

  return (
    <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={`mt-2 break-words text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function statusClassName(status: string) {
  if (status === "PASS" || status === "READY" || status === "DOCUMENTED" || status === "HARDENED") {
    return "inline-flex max-w-full break-words rounded border border-emerald-900/50 bg-emerald-950/30 px-2 py-1 text-xs leading-5 text-emerald-200";
  }
  if (status === "REDACTED" || status === "NO TRUST") {
    return "inline-flex max-w-full break-words rounded border border-cyan-900/50 bg-cyan-950/30 px-2 py-1 text-xs leading-5 text-cyan-200";
  }
  if (status === "MANUAL" || status === "MANUAL REQUIRED" || status === "OWNER REVIEW REQUIRED" || status === "NOT CHECKED") {
    return "inline-flex max-w-full break-words rounded border border-amber-900/50 bg-amber-950/30 px-2 py-1 text-xs leading-5 text-amber-200";
  }
  return "inline-flex max-w-full break-words rounded border border-rose-900/50 bg-rose-950/30 px-2 py-1 text-xs leading-5 text-rose-200";
}
