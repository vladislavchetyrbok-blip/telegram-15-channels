import Link from "next/link";
import { AlertTriangle, BarChart3, CheckCircle2, ClipboardCheck, Database, FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_FIRST_PAID_MVP_NOT_APPROVED,
  APHRODITE_FIRST_PAID_MVP_NOT_APPROVED_RU,
  APHRODITE_FIRST_PAID_MVP_READINESS_CLASSIFICATION,
  APHRODITE_FIRST_PAID_MVP_READINESS_TITLE,
  APHRODITE_FIRST_PAID_MVP_SAFETY_LABELS,
  getAphroditeFirstPaidMvpBlockers,
  getAphroditeFirstPaidMvpGoNoGoChecklist,
  getAphroditeFirstPaidMvpNextSteps,
  getAphroditeFirstPaidMvpReadinessAreas,
  getAphroditeFirstPaidMvpSafetyBoundaries,
} from "@/lib/zodiac/aphrodite-first-paid-mvp-readiness-review";
import type { AphroditeFirstPaidMvpReadinessArea, AphroditeFirstPaidMvpReadinessCategory } from "@/lib/zodiac/aphrodite-first-paid-mvp-readiness-review";

export const metadata = {
  title: APHRODITE_FIRST_PAID_MVP_READINESS_TITLE,
};

const areas = getAphroditeFirstPaidMvpReadinessAreas();
const blockers = getAphroditeFirstPaidMvpBlockers();
const checklist = getAphroditeFirstPaidMvpGoNoGoChecklist();
const boundaries = getAphroditeFirstPaidMvpSafetyBoundaries();
const nextSteps = getAphroditeFirstPaidMvpNextSteps();

const statusTone = {
  "Ready for review": "border-emerald-900/40 bg-emerald-950/20 text-emerald-200",
  "Partially ready": "border-amber-900/40 bg-amber-950/20 text-amber-200",
  Blocked: "border-rose-900/40 bg-rose-950/20 text-rose-200",
  "Not started": "border-slate-700 bg-slate-900 text-slate-300",
  "Owner review required": "border-violet-900/40 bg-violet-950/20 text-violet-200",
  "Production env required": "border-rose-900/40 bg-rose-950/20 text-rose-200",
} as const;

export default function AphroditeFirstPaidMvpReadinessReviewPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-rose-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Aphrodite / Zodiac / First Paid MVP</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{APHRODITE_FIRST_PAID_MVP_READINESS_TITLE}</h1>
          <p className="text-sm font-medium text-rose-300/90">{APHRODITE_FIRST_PAID_MVP_READINESS_CLASSIFICATION}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 178 создаёт только review готовности первого будущего платного MVP. Он оценивает product,
            payment, entitlement, content, support/refund, analytics и production blockers, но не включает оплату,
            не открывает VIP, не создаёт entitlement, не пишет в базу и не вызывает Telegram API.
          </p>
          <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 px-4 py-3 text-sm leading-6 text-rose-100">
            {APHRODITE_FIRST_PAID_MVP_NOT_APPROVED} {APHRODITE_FIRST_PAID_MVP_NOT_APPROVED_RU}.
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {APHRODITE_FIRST_PAID_MVP_SAFETY_LABELS.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="Readiness areas" value={String(areas.length)} />
          <Metric label="Blockers" value={String(blockers.length)} tone="rose" />
          <Metric label="Go/no-go checklist" value={String(checklist.length)} />
          <Metric label="Launch approval" value="Нет" tone="rose" />
        </section>

        <ReviewSection title="summary" icon={<ClipboardCheck className="h-5 w-5 text-rose-400" />}>
          <p className="text-sm leading-6 text-slate-400">
            Product readiness частично готова к owner review, content readiness готова к review, но payment readiness,
            entitlement readiness, support/refund readiness, analytics readiness и production env/backup blockers не
            закрыты. Итог: запуск первого платного MVP не разрешён.
          </p>
        </ReviewSection>

        <ReviewSection title="readiness areas" icon={<FileCheck2 className="h-5 w-5 text-rose-400" />}>
          <div className="grid gap-4 md:grid-cols-2">
            {areas.map((area) => (
              <article key={area.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-white">{area.title}</h3>
                    <p className="mt-1 font-mono text-xs text-slate-500">{area.category}</p>
                  </div>
                  <span className={`rounded-md border px-2 py-1 text-[11px] ${statusTone[area.status]}`}>{area.status}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{area.currentState}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">Evidence: {area.evidence.join("; ")}</p>
                <p className="mt-2 text-xs leading-5 text-rose-100/80">До launch: {area.missingBeforeLaunch.join("; ")}.</p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          <ReviewSection title="blockers" icon={<AlertTriangle className="h-5 w-5 text-rose-300" />}>
            <div className="space-y-3">
              {blockers.map((blocker) => (
                <div key={blocker.id} className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-white">{blocker.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-rose-100/80">{blocker.reason}</p>
                    </div>
                    <span className="shrink-0 rounded-md border border-rose-900/50 bg-rose-950 px-2 py-0.5 text-[11px] text-rose-100">
                      {blocker.severity}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-400">Нужно до запуска: {blocker.requiredBeforeLaunch.join("; ")}.</p>
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="go/no-go checklist" icon={<CheckCircle2 className="h-5 w-5 text-emerald-300" />}>
            <div className="space-y-2">
              {checklist.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-800 bg-black/30 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <span className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-slate-300">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{item.note}</p>
                </div>
              ))}
            </div>
          </ReviewSection>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ReadinessGroup title="product readiness" category="product" />
          <ReadinessGroup title="payment readiness" category="payment" />
          <ReadinessGroup title="entitlement readiness" category="entitlement" />
          <ReadinessGroup title="content readiness" category="content" />
          <ReadinessGroup title="support/refund readiness" category="support" />
          <ReadinessGroup title="analytics readiness" category="analytics" />
        </section>

        <ReviewSection title="production env/backup blockers" icon={<Database className="h-5 w-5 text-rose-300" />}>
          <div className="grid gap-3 md:grid-cols-3">
            <BlockedPill label="DATABASE_URL not configured" />
            <BlockedPill label="TELEGRAM_BOT_TOKEN not configured" />
            <BlockedPill label="backup older than 24h" />
          </div>
        </ReviewSection>

        <ReviewSection title="safety boundaries" icon={<LockKeyhole className="h-5 w-5 text-rose-300" />}>
          <div className="space-y-2">
            {boundaries.map((boundary) => (
              <div key={boundary.id} data-boundary={boundary.id} className="rounded-lg border border-rose-900/40 bg-black/20 p-3">
                <div className="text-sm font-medium text-white">{boundary.visibleLabel}</div>
                <div className="mt-1 text-xs leading-5 text-rose-100/80">
                  Разрешено сейчас: {boundary.allowedNow.join(", ")}. Запрещено сейчас: {boundary.blockedNow.join(", ")}.
                </div>
              </div>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="next recommended package" icon={<BarChart3 className="h-5 w-5 text-rose-400" />}>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
            {nextSteps.map((step) => (
              <li key={step.package}>
                <span className="text-white">
                  {step.package} — {step.title}:
                </span>{" "}
                {step.purpose} Не делать: {step.mustNotDo.join("; ")}.
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Package 179 не начинается автоматически.</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/product-catalog-finalization" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Каталог продуктов</Link>
            <Link href="/dashboard/networks/zodiac/production-payment-safety-gate" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Production Safety Gate</Link>
            <Link href="/dashboard/networks/zodiac/owner-review-gate" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Owner Review Gate</Link>
            <Link href="/dashboard/networks/zodiac/telegram-stars-payment-architecture-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Review Telegram Stars</Link>
            <Link href="/dashboard/networks/zodiac/telegram-stars-invoice-builder-skeleton" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Skeleton invoice builder</Link>
            <Link href="/dashboard/networks/zodiac/payment-ledger-mock-integration" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mock payment ledger</Link>
            <Link href="/dashboard/networks/zodiac/entitlement-creation-mock" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mock entitlement creation</Link>
            <Link href="/dashboard/networks/zodiac/vip-access-security-suite" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Security QA VIP-доступа</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5 flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-medium text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ReadinessGroup({ title, category }: { title: string; category: AphroditeFirstPaidMvpReadinessCategory }) {
  const groupAreas = areas.filter((area) => area.category === category);

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-lg font-medium text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {groupAreas.map((area: AphroditeFirstPaidMvpReadinessArea) => (
          <div key={area.id} className="rounded-md border border-slate-800 bg-black/30 p-3">
            <div className="text-sm font-medium text-slate-100">{area.title}</div>
            <div className="mt-1 text-xs text-slate-500">{area.status}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "rose" }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div className={tone === "rose" ? "mt-2 text-lg font-semibold text-rose-300" : "mt-2 text-lg font-semibold text-white"}>{value}</div>
    </div>
  );
}

function BlockedPill({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-4 text-sm font-medium text-rose-100">
      {label}
    </div>
  );
}
