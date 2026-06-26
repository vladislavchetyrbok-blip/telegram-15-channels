import Link from "next/link";
import { CalendarDays, Eye, FileText, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import {
  APHRODITE_VIP_NATAL_NUMEROLOGY_VISUAL_REVIEW_RULE,
  getAphroditeVipNatalNumerologyVisualReview,
} from "@/lib/zodiac/aphrodite-vip-natal-numerology-visual-review";

const review = getAphroditeVipNatalNumerologyVisualReview();

export const metadata = {
  title: review.title,
};

export default function AphroditeVipNatalNumerologyVisualReviewPage() {
  return (
    <div className="min-h-screen bg-black p-8 text-slate-200">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-emerald-300">
            <Eye className="h-4 w-4" />
            <span>Aphrodite / VIP visual review / Package 202</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">{review.title}</h1>
          <p className="text-sm font-medium text-emerald-300/90">{review.classification}</p>
          <p className="max-w-4xl text-lg leading-8 text-slate-400">
            Проверены VIP natal chart, birth chart, VIP numerology, VIP couple calendar, future locked sections и free preview fallback.
            Это аудит визуальной структуры, читаемости, card hierarchy, mobile layout и сохранения date input без изменения live VIP.
          </p>
          <p className="max-w-4xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-300">
            {APHRODITE_VIP_NATAL_NUMEROLOGY_VISUAL_REVIEW_RULE}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {review.safetyLabels.map((label) => (
              <span key={label} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-emerald-300">
                {label}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="review areas" value={String(review.summary.reviewedAreas)} />
          <Metric label="liveVipChangedNow" value={String(review.safetyFlags.liveVipChangedNow)} tone="rose" />
          <Metric label="paymentChangedNow" value={String(review.safetyFlags.paymentChangedNow)} tone="rose" />
          <Metric label="dateInputPreservedNow" value={String(review.safetyFlags.dateInputPreservedNow)} />
        </section>

        <ReviewSection title="зоны visual review" icon={<Sparkles className="h-5 w-5 text-cyan-400" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {review.reviewAreas.map((area) => (
              <article key={area.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
                <div className="flex items-start gap-2">
                  <AreaIcon id={area.id} />
                  <div>
                    <h2 className="text-sm font-medium text-white">{area.title}</h2>
                    <p className="mt-1 text-[11px] text-slate-500">{area.routeOrFlow}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-amber-100/80">{area.currentState}</p>
                <div className="mt-3 space-y-2">
                  <ListBlock title="Visual focus" items={area.visualFocus} />
                  <ListBlock title="Рекомендации" items={area.recommendations} />
                  <ListBlock title="Safety" items={area.safetyChecks} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {area.sourceFiles.map((file) => (
                    <code key={file} className="rounded border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] text-slate-400">
                      {file}
                    </code>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </ReviewSection>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <ReviewSection title="обязательное покрытие" icon={<FileText className="h-5 w-5 text-cyan-400" />}>
            <div className="grid gap-2 md:grid-cols-2">
              {review.requiredCoverage.map((item) => (
                <div key={item} className="rounded-lg border border-slate-800 bg-black/20 px-3 py-2 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="границы безопасности" icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}>
            <div className="space-y-3">
              {Object.entries(review.safetyFlags).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-emerald-900/40 bg-black/20 p-3">
                  <div className="font-mono text-xs text-slate-500">{key}</div>
                  <p className="mt-1 text-sm font-medium text-emerald-300">{String(value)}</p>
                </div>
              ))}
            </div>
          </ReviewSection>
        </section>

        <ReviewSection title="следующий рекомендуемый пакет" icon={<CalendarDays className="h-5 w-5 text-cyan-400" />}>
          <p className="text-sm leading-6 text-slate-300">{review.nextRecommendedPackage}</p>
        </ReviewSection>

        <div className="border-t border-slate-800/50 pt-4">
          <div className="mb-2 text-sm text-slate-400">Связанные разделы</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
              Zodiac Network
            </Link>
            <Link href="/dashboard/networks/zodiac/visual-ui-polish-plan" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
              План визуального улучшения
            </Link>
            <Link href="/dashboard/networks/zodiac/design-tokens-ui-shell" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
              Design Tokens & UI Shell
            </Link>
            <Link href="/miniapp" className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300">
              Mini App hub
            </Link>
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

function ListBlock({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase text-slate-500">{title}</div>
      <ul className="mt-1 space-y-1 text-xs leading-5 text-slate-400">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "rose" }) {
  const toneClass = tone === "rose" ? "text-rose-300" : "text-emerald-300";

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="break-words font-mono text-xs text-slate-500">{label}</div>
      <div className={`mt-2 text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function AreaIcon({ id }: { id: string }) {
  if (id.includes("locked")) return <LockKeyhole className="mt-0.5 h-4 w-4 text-amber-300" />;
  if (id.includes("calendar")) return <CalendarDays className="mt-0.5 h-4 w-4 text-cyan-300" />;
  return <Sparkles className="mt-0.5 h-4 w-4 text-emerald-300" />;
}
