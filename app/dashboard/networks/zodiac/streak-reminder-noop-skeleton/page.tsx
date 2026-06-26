import Link from "next/link";
import { BellOff, CalendarClock, Repeat2, ShieldCheck, TimerOff } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_STREAK_REMINDER_NOOP_SKELETON_RULE,
  draftAphroditeReminderNoop,
  evaluateAphroditeStreakNoop,
  getAphroditeStreakReminderNoopSkeleton,
} from "@/lib/zodiac/aphrodite-streak-reminder-noop-skeleton";

const skeleton = getAphroditeStreakReminderNoopSkeleton();
const sampleStreak = evaluateAphroditeStreakNoop({
  userScope: "mock-user",
  surface: "miniapp",
  eventType: "daily-message-return",
  occurredAt: "2026-07-01T09:00:00.000Z",
});
const sampleReminder = draftAphroditeReminderNoop({
  userScope: "mock-user",
  reminderType: "saved-report-revisit",
  requestedFor: "2026-07-02T09:00:00.000Z",
  fallbackRoute: "/miniapp/love-reading-preview",
});

export const metadata = {
  title: skeleton.title,
};

export default function AphroditeStreakReminderNoopSkeletonPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-emerald-300">
            <BellOff className="h-4 w-4" />
            <span>Aphrodite / Streak reminder / Noop skeleton</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{skeleton.title}</h1>
          <p className="text-sm font-medium text-emerald-300/90">{skeleton.classification}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Package 189 добавляет только безопасный skeleton для будущих streak/reminder сценариев.
            Функции принимают future input, но возвращают noop result: streak не сохраняется, reminder не планируется,
            Telegram сообщение не отправляется, база данных не читается и не изменяется.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_STREAK_REMINDER_NOOP_SKELETON_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {skeleton.safetyLabels.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="future reminder types" value={String(skeleton.futureReminderTypes.length)} />
          <Metric label="streakPersistedNow" value={String(sampleStreak.streakPersistedNow)} tone="rose" />
          <Metric label="reminderScheduledNow" value={String(sampleReminder.reminderScheduledNow)} tone="rose" />
          <Metric label="telegramMessageSentNow" value={String(sampleReminder.telegramMessageSentNow)} tone="rose" />
        </section>

        <ReviewSection title="future reminder types" icon={<CalendarClock className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {skeleton.futureReminderTypes.map((item) => (
              <article key={item.type} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm font-medium text-white">{item.label}</h2>
                  <span className="rounded-md border border-cyan-900/50 bg-cyan-950 px-2 py-0.5 text-[11px] text-cyan-200">
                    {item.futureCadence}
                  </span>
                </div>
                <p className="mt-2 font-mono text-xs text-slate-500">{item.type}</p>
                <p className="mt-3 font-mono text-[11px] text-slate-500">{item.fallbackRoute}</p>
                <p className="mt-3 text-xs leading-5 text-emerald-200/80">{item.safetyNote}</p>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 md:grid-cols-2">
          <SafetyCard icon={<Repeat2 className="h-5 w-5 text-rose-300" />} title="evaluateAphroditeStreakNoop">
            accepted={String(sampleStreak.accepted)}, noopOnly={String(sampleStreak.noopOnly)},
            streakPersistedNow={String(sampleStreak.streakPersistedNow)}, databaseWriteNow={String(sampleStreak.databaseWriteNow)}
          </SafetyCard>
          <SafetyCard icon={<TimerOff className="h-5 w-5 text-rose-300" />} title="draftAphroditeReminderNoop">
            reminderScheduledNow={String(sampleReminder.reminderScheduledNow)}, productionReminderNow={String(sampleReminder.productionReminderNow)},
            externalNotificationNow={String(sampleReminder.externalNotificationNow)}, telegramMessageSentNow={String(sampleReminder.telegramMessageSentNow)}
          </SafetyCard>
        </section>

        <ReviewSection title="safety boundaries" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
          <div className="grid gap-3 md:grid-cols-2">
            {skeleton.boundaries.map((boundary) => (
              <div key={boundary.id} data-boundary={boundary.id} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                <div className="text-sm font-medium text-white">{boundary.label}</div>
                <p className="mt-1 text-xs leading-5 text-slate-400">{boundary.currentState}</p>
              </div>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="next recommended package" icon={<BellOff className="h-5 w-5 text-cyan-400" />}>
          <p className="text-sm leading-6 text-slate-300">{skeleton.nextRecommendedPackage}</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/return-journey-cta-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Return CTA Readiness</Link>
            <Link href="/dashboard/networks/zodiac/saved-reports-history-mock-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Saved Reports Mock</Link>
            <Link href="/dashboard/networks/zodiac/retention-system-readiness" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">Retention Readiness</Link>
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

function SafetyCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <article className="rounded-lg border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-medium text-white">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{children}</p>
    </article>
  );
}
