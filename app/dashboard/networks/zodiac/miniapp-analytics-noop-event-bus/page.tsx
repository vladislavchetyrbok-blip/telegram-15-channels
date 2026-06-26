import Link from "next/link";
import { Activity, BarChart3, FileCheck2, LockKeyhole, Route, ShieldCheck, Smartphone } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_CLASSIFICATION,
  APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_RULE,
  APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_SAFETY_LABELS,
  APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_TITLE,
  emitAphroditeMiniAppAnalyticsNoopEvent,
  getAphroditeMiniAppAnalyticsNoopBoundaries,
  getAphroditeMiniAppAnalyticsNoopEvents,
  getAphroditeMiniAppAnalyticsNoopNextSteps,
} from "@/lib/zodiac/aphrodite-miniapp-analytics-noop-event-bus";
import { getAphroditeMiniAppAnalyticsNoopIntegrationPoints } from "@/lib/zodiac/aphrodite-miniapp-analytics-noop-integration-points";

export const metadata = {
  title: APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_TITLE,
};

const events = getAphroditeMiniAppAnalyticsNoopEvents();
const boundaries = getAphroditeMiniAppAnalyticsNoopBoundaries();
const nextSteps = getAphroditeMiniAppAnalyticsNoopNextSteps();
const integrationPoints = getAphroditeMiniAppAnalyticsNoopIntegrationPoints();
const sampleResult = emitAphroditeMiniAppAnalyticsNoopEvent({
  eventId: "love_reading_form_submitted",
  source: "dashboard-readiness",
  surface: "mini-app",
  payload: {
    productCode: "ai-love-reading",
    route: "/miniapp/love-reading-preview",
    hasBirthDate: true,
    rawName: "removed",
    rawBirthDate: "removed",
    paymentPayload: "removed",
    telegramPrivateMessageText: "removed",
    fullReportText: "removed",
  },
});

export default function AphroditeMiniAppAnalyticsNoopEventBusPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-cyan-300">
            <Activity className="h-4 w-4" />
            <span>Aphrodite / Zodiac / Mini App analytics noop</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_TITLE}</h1>
          <p className="text-sm font-medium text-cyan-300/90">{APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_CLASSIFICATION}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 181 создаёт безопасную локальную noop-шину для будущей Mini App аналитики. Она принимает будущие event objects,
            чистит payload от raw names, raw birth dates, payment payloads, Telegram private messages и full report text, а затем
            возвращает только noop result. События не отправляются, база данных не используется, Telegram API не вызывается.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {APHRODITE_MINIAPP_ANALYTICS_NOOP_EVENT_BUS_SAFETY_LABELS.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="noop events" value={String(events.length)} />
          <Metric label="events sent now" value={sampleResult.sentNow ? "Да" : "Нет"} tone="rose" />
          <Metric label="DB write now" value={sampleResult.databaseWriteNow ? "Да" : "Нет"} tone="rose" />
          <Metric label="production tracking" value={sampleResult.productionTrackingNow ? "Да" : "Нет"} tone="rose" />
        </section>

        <ReviewSection title="noop behavior" icon={<FileCheck2 className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-lg border border-slate-800 bg-black/30 p-4">
              <h2 className="text-sm font-medium text-white">Sanitized sample payload</h2>
              <div className="mt-3 space-y-2 font-mono text-xs text-slate-300">
                {Object.entries(sampleResult.sanitizedPayload).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 rounded-md bg-slate-950 px-3 py-2">
                    <span className="text-slate-500">{key}</span>
                    <span className="text-emerald-300">{String(value)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-rose-100/80">
                rawName, rawBirthDate, paymentPayload, telegramPrivateMessageText и fullReportText удалены из sample payload.
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-black/30 p-4">
              <h2 className="text-sm font-medium text-white">Noop result flags</h2>
              <div className="mt-3 grid gap-2 font-mono text-xs text-slate-300">
                <Flag label="sentNow" value={sampleResult.sentNow} />
                <Flag label="externalAnalyticsCalledNow" value={sampleResult.externalAnalyticsCalledNow} />
                <Flag label="databaseWriteNow" value={sampleResult.databaseWriteNow} />
                <Flag label="telegramApiCalledNow" value={sampleResult.telegramApiCalledNow} />
                <Flag label="paymentTrackingNow" value={sampleResult.paymentTrackingNow} />
                <Flag label="productionTrackingNow" value={sampleResult.productionTrackingNow} />
              </div>
            </div>
          </div>
        </ReviewSection>

        <ReviewSection title="event taxonomy alignment" icon={<Route className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <article key={event.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-medium text-white">{event.label}</h2>
                    <p className="mt-1 font-mono text-xs text-slate-500">{event.id}</p>
                  </div>
                  <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-emerald-300">
                    noop only
                  </span>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-400">Stage: {event.stage}. Surface: {event.surface}.</p>
                <p className="mt-2 text-xs leading-5 text-emerald-100/80">Allowed safe fields: {event.allowedPayloadFields.slice(0, 8).join("; ")}.</p>
                <p className="mt-2 text-xs leading-5 text-rose-100/80">Forbidden fields include: {event.forbiddenPayloadFields.slice(0, 8).join("; ")}.</p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="noop integration points" icon={<Smartphone className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-4 md:grid-cols-2">
            {integrationPoints.map((point) => (
              <article key={point.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-medium text-white">{point.eventId}</h2>
                    <p className="mt-1 font-mono text-xs text-slate-500">{point.route}</p>
                  </div>
                  <span className={point.status === "integrated" ? "rounded-md border border-emerald-900/50 bg-emerald-950 px-2 py-0.5 text-[11px] text-emerald-200" : "rounded-md border border-amber-900/50 bg-amber-950 px-2 py-0.5 text-[11px] text-amber-200"}>
                    {point.status}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-400">Файл: {point.file}</p>
                <p className="mt-2 text-xs leading-5 text-emerald-100/80">{point.safeReason}</p>
                {point.pendingReason ? <p className="mt-2 text-xs leading-5 text-amber-100/80">Pending: {point.pendingReason}</p> : null}
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <ReviewSection title="privacy stripping rules" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300">
              <li>raw names removed/forbidden</li>
              <li>raw birth dates removed/forbidden</li>
              <li>payment payloads removed/forbidden</li>
              <li>Telegram private message contents removed/forbidden</li>
              <li>full report text removed/forbidden</li>
              <li>Разрешены только safe scalar поля из allowlist: route, source, surface, productCode, relationshipMode, contentType, period keys и boolean flags.</li>
            </ul>
          </ReviewSection>

          <ReviewSection title="safety boundaries" icon={<LockKeyhole className="h-5 w-5 text-rose-300" />}>
            <div className="space-y-3">
              {boundaries.map((boundary) => (
                <div key={boundary.id} data-boundary={boundary.id} className="rounded-lg border border-rose-900/40 bg-black/20 p-3">
                  <div className="text-sm font-medium text-white">{boundary.visibleLabel}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">Разрешено сейчас: {boundary.allowedNow.join(", ")}.</p>
                  <p className="mt-1 text-xs leading-5 text-rose-100/80">Запрещено сейчас: {boundary.forbiddenNow.join(", ")}.</p>
                </div>
              ))}
            </div>
          </ReviewSection>
        </section>

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
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/analytics-funnel-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Analytics/Funnel</Link>
            <Link href="/dashboard/networks/zodiac/analytics-funnel-mock-dashboard" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Mock Dashboard</Link>
            <Link href="/dashboard/networks/zodiac/telegram-cta-attribution-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">CTA Attribution</Link>
            <Link href="/dashboard/networks/zodiac/analytics-privacy-safety-suite" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Privacy Safety Suite</Link>
            <Link href="/dashboard/networks/zodiac/analytics" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Аналитика Mini App</Link>
            <Link href="/dashboard/networks/zodiac/support-refund-policy-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Support & Refund</Link>
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

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "rose" }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={tone === "rose" ? "mt-2 text-lg font-semibold text-rose-300" : "mt-2 text-lg font-semibold text-emerald-300"}>{value}</div>
    </div>
  );
}

function Flag({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex justify-between gap-4 rounded-md bg-slate-950 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className={value ? "text-rose-300" : "text-emerald-300"}>{value ? "true" : "false"}</span>
    </div>
  );
}
