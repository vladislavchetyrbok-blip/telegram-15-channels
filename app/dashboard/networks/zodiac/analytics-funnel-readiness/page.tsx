import Link from "next/link";
import { BarChart3, ClipboardCheck, Database, FileCheck2, LockKeyhole, MousePointerClick, Route, ShieldCheck, Smartphone, Target } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_ANALYTICS_FUNNEL_READINESS_CLASSIFICATION,
  APHRODITE_ANALYTICS_FUNNEL_READINESS_RULE,
  APHRODITE_ANALYTICS_FUNNEL_READINESS_TITLE,
  APHRODITE_ANALYTICS_FUNNEL_SAFETY_LABELS,
  getAphroditeAnalyticsFunnelEvents,
  getAphroditeAnalyticsFunnelKpis,
  getAphroditeAnalyticsPrivacyRules,
  getAphroditeAnalyticsReadinessBoundaries,
  getAphroditeAnalyticsReadinessNextSteps,
} from "@/lib/zodiac/aphrodite-analytics-funnel-readiness";
import type { AphroditeAnalyticsFunnelStage, AphroditeAnalyticsReadinessEvent } from "@/lib/zodiac/aphrodite-analytics-funnel-readiness";

export const metadata = {
  title: APHRODITE_ANALYTICS_FUNNEL_READINESS_TITLE,
};

const events = getAphroditeAnalyticsFunnelEvents();
const kpis = getAphroditeAnalyticsFunnelKpis();
const privacyRules = getAphroditeAnalyticsPrivacyRules();
const boundaries = getAphroditeAnalyticsReadinessBoundaries();
const nextSteps = getAphroditeAnalyticsReadinessNextSteps();

const funnelStages: AphroditeAnalyticsFunnelStage[] = [
  "traffic-source",
  "mini-app-open",
  "product-entry",
  "form-start",
  "form-submit",
  "free-preview-view",
  "locked-teaser-view",
  "paywall-view",
  "future-payment-intent",
  "guard-denied",
  "fallback-view",
  "return-user",
  "content-retention",
];

const riskLabel = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
  critical: "критический",
} as const;

export default function AphroditeAnalyticsFunnelReadinessPage() {
  const trafficAttributionEvents = events.filter((event) => event.stage === "traffic-source");
  const miniAppFunnelEvents = events.filter((event) => ["mini-app-open", "product-entry", "form-start", "form-submit", "free-preview-view", "return-user"].includes(event.stage));
  const paywallFunnelEvents = events.filter((event) => ["locked-teaser-view", "paywall-view", "future-payment-intent", "guard-denied", "fallback-view"].includes(event.stage));
  const contentFunnelEvents = events.filter((event) => event.stage === "content-retention");
  const blockedDataFields = Array.from(new Set(privacyRules.flatMap((rule) => rule.forbiddenData))).sort();

  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-cyan-300">
            <BarChart3 className="h-4 w-4" />
            <span>Aphrodite / Zodiac / Analytics readiness</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{APHRODITE_ANALYTICS_FUNNEL_READINESS_TITLE}</h1>
          <p className="text-sm font-medium text-cyan-300/90">{APHRODITE_ANALYTICS_FUNNEL_READINESS_CLASSIFICATION}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 180 описывает будущую таксономию событий, funnel stages, KPI, attribution и privacy boundaries для
            первого будущего платного MVP. Это readiness/design only: события не отправляются, внешняя аналитика не
            подключается, database write не появляется, Telegram API не вызывается, payment tracking и VIP unlock не включаются.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_ANALYTICS_FUNNEL_READINESS_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {APHRODITE_ANALYTICS_FUNNEL_SAFETY_LABELS.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="events taxonomy" value={String(events.length)} />
          <Metric label="future KPIs" value={String(kpis.length)} />
          <Metric label="privacy rules" value={String(privacyRules.length)} />
          <Metric label="events sent now" value="Нет" tone="rose" />
        </section>

        <ReviewSection title="summary" icon={<ClipboardCheck className="h-5 w-5 text-cyan-400" />}>
          <p className="text-sm leading-6 text-slate-400">
            Analytics readiness нужен, чтобы до paid MVP понимать, какие будущие события и KPI должны быть согласованы:
            от Telegram CTA attribution до Mini App funnel, Love Reading, paywall/future payment intent, VIP guard denied,
            fallback recovery, return visits и daily/weekly/monthly content analytics. Сейчас это только карта требований.
          </p>
        </ReviewSection>

        <ReviewSection title="future funnel stages" icon={<Route className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {funnelStages.map((stage) => (
              <div key={stage} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <h3 className="font-mono text-sm text-white">{stage}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-400">{events.filter((event) => event.stage === stage).length} future events</p>
              </div>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="future event taxonomy" icon={<FileCheck2 className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="future KPIs" icon={<Target className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-4 md:grid-cols-2">
            {kpis.map((kpi) => (
              <article key={kpi.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-white">{kpi.label}</h3>
                    <p className="mt-1 font-mono text-xs text-slate-500">{kpi.id}</p>
                  </div>
                  <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                    {kpi.currentState}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{kpi.description}</p>
                <p className="mt-3 font-mono text-xs leading-5 text-cyan-200/90">{kpi.futureFormula}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">Events: {kpi.requiredEvents.join("; ")}</p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-2">
          <EventGroup title="traffic attribution" events={trafficAttributionEvents} icon={<MousePointerClick className="h-5 w-5 text-cyan-400" />} />
          <EventGroup title="Mini App funnel" events={miniAppFunnelEvents} icon={<Smartphone className="h-5 w-5 text-cyan-400" />} />
          <EventGroup title="paywall/future payment funnel" events={paywallFunnelEvents} icon={<LockKeyhole className="h-5 w-5 text-rose-300" />} />
          <EventGroup title="content funnel: daily/weekly/monthly" events={contentFunnelEvents} icon={<BarChart3 className="h-5 w-5 text-cyan-400" />} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <ReviewSection title="privacy rules" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
            <div className="space-y-3">
              {privacyRules.map((rule) => (
                <article key={rule.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                  <h3 className="text-sm font-medium text-white">{rule.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{rule.visibleRule}</p>
                  <p className="mt-3 text-xs leading-5 text-rose-100/80">Запрещено: {rule.forbiddenData.join("; ")}.</p>
                  <p className="mt-2 text-xs leading-5 text-emerald-100/80">Будущие safe fields: {rule.allowedFutureData.join("; ")}.</p>
                </article>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="blocked data fields" icon={<LockKeyhole className="h-5 w-5 text-rose-300" />}>
            <div className="flex flex-wrap gap-2 text-xs">
              {blockedDataFields.map((field) => (
                <span key={field} className="rounded-md border border-rose-900/40 bg-rose-950/20 px-2 py-1 text-rose-100">
                  {field}
                </span>
              ))}
            </div>
          </ReviewSection>
        </section>

        <ReviewSection title="safety boundaries" icon={<LockKeyhole className="h-5 w-5 text-rose-300" />}>
          <div className="space-y-2">
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
        </ReviewSection>

        <ReviewSection title="next recommended package" icon={<BarChart3 className="h-5 w-5 text-cyan-400" />}>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
            {nextSteps.map((step) => (
              <li key={step.package}>
                <span className="text-white">
                  {step.package} - {step.title}:
                </span>{" "}
                {step.purpose} Заблокировано до: {step.blockedUntil.join("; ")}.
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Package 181 не начинается автоматически.</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/analytics" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Аналитика Mini App</Link>
            <Link href="/dashboard/networks/zodiac/miniapp-analytics-noop-event-bus" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Noop Event Bus</Link>
            <Link href="/dashboard/networks/zodiac/analytics-funnel-mock-dashboard" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mock Dashboard</Link>
            <Link href="/dashboard/networks/zodiac/telegram-cta-attribution-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">CTA Attribution</Link>
            <Link href="/dashboard/networks/zodiac/analytics-privacy-safety-suite" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Privacy Safety Suite</Link>
            <Link href="/dashboard/networks/zodiac/first-paid-mvp-readiness-review" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Paid MVP Readiness</Link>
            <Link href="/dashboard/networks/zodiac/support-refund-policy-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Support & Refund</Link>
            <Link href="/dashboard/networks/zodiac/product-catalog-finalization" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Каталог продуктов</Link>
            <Link href="/dashboard/networks/zodiac/vip-access-security-suite" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Security QA VIP-доступа</Link>
            <Link href="/dashboard/networks/zodiac/production-payment-safety-gate" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Production Safety Gate</Link>
            <Link href="/dashboard/networks/zodiac/owner-review-gate" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Owner Review Gate</Link>
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

function EventGroup({ title, events, icon }: { title: string; events: AphroditeAnalyticsReadinessEvent[]; icon: ReactNode }) {
  return (
    <ReviewSection title={title} icon={icon}>
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
            <div className="text-sm font-medium text-white">{event.label}</div>
            <div className="mt-1 font-mono text-xs text-slate-500">{event.id}</div>
            <p className="mt-2 text-xs leading-5 text-slate-400">Fields: {event.futurePayloadFields.join("; ")}</p>
          </div>
        ))}
      </div>
    </ReviewSection>
  );
}

function EventCard({ event }: { event: AphroditeAnalyticsReadinessEvent }) {
  return (
    <article className="rounded-lg border border-slate-800 bg-black/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-white">{event.label}</h3>
          <p className="mt-1 font-mono text-xs text-slate-500">{event.id}</p>
        </div>
        <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
          {event.currentState}
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-400">Stage: {event.stage}. Surface: {event.surface}.</p>
      <p className="mt-2 text-xs leading-5 text-emerald-100/80">Future fields: {event.futurePayloadFields.join("; ")}.</p>
      <p className="mt-2 text-xs leading-5 text-rose-100/80">Forbidden fields: {event.forbiddenPayloadFields.join("; ")}.</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">Privacy: {event.privacyNotes.join("; ")}.</p>
    </article>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "rose" }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={tone === "rose" ? "mt-2 text-lg font-semibold text-rose-300" : "mt-2 text-lg font-semibold text-emerald-300"}>{value}</div>
    </div>
  );
}
