import Link from "next/link";
import { Heart, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import {
  APHRODITE_PRIMARY_EMOTIONAL_PROMISE,
  APHRODITE_FIRST_RESULT_SAFETY_BOUNDARIES,
  getAphroditeFirstResultSteps,
  getAphroditeLoadingStages,
  createAphroditeLoveReadingPreview,
  getAphroditeFirstResultBoundaries,
} from "@/lib/zodiac/aphrodite-first-result-experience";

export const metadata = {
  title: "First Result Experience Rewrite",
};

const steps = getAphroditeFirstResultSteps();
const stages = getAphroditeLoadingStages();
const boundaries = getAphroditeFirstResultBoundaries();
const preview = createAphroditeLoveReadingPreview({
  firstName: "You",
  partnerName: "Them",
  firstSign: "leo",
  partnerSign: "scorpio",
  relationshipStatus: "complicated",
});

export default function FirstResultExperiencePage() {
  return (
    <div className="min-h-screen bg-black text-slate-200 p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-rose-300">
            <Heart className="w-4 h-4" />
            <span>Aphrodite / First Result</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">First Result Experience Rewrite</h1>
          <p className="text-rose-300/90 text-sm font-medium">
            Experience rewrite only / No payment / No real VIP unlock
          </p>
          <p className="text-slate-400 max-w-3xl text-lg">
            A rewrite of the first user experience. The hero scenario is <span className="text-white">AI Love Reading</span>.
            It delivers a strong, personal first result quickly — before asking for a lot of data, and without
            payments, real VIP access, Telegram API calls, database writes, or a production launch.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {APHRODITE_FIRST_RESULT_SAFETY_BOUNDARIES.map((b) => (
              <span key={b} className="px-2 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">
                {b}
              </span>
            ))}
          </div>
        </header>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white">Current problem</h2>
          <p className="text-sm text-slate-400">
            The first screen leads with generic tools — compatibility percentage, birth matrix, mystic cards,
            generic horoscope — and a long input form before any value is shown. Users do not feel understood and
            drop before the first result. These are tools, not the emotional value.
          </p>
          <h2 className="text-xl font-medium text-white pt-2">New first-result strategy</h2>
          <p className="text-sm text-slate-400">
            Open with the feeling, not the feature. Ask the emotional questions first: what does he feel, what is
            really happening between us, why does he pull away, are we compatible, what is the main risk, what
            should I do next. Then give a free, personal result fast.
          </p>
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-4 mt-2">
            <div className="text-xs text-rose-300/80 uppercase mb-1">Primary emotional promise</div>
            <p className="text-rose-100 text-base">{APHRODITE_PRIMARY_EMOTIONAL_PROMISE}</p>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-400" /> Hero scenario: AI Love Reading
          </h2>
          <p className="text-sm text-slate-500">Local, deterministic preview (sample: Leo &amp; Scorpio). No data is stored.</p>
          <div className="rounded-lg border border-slate-800 bg-black/40 p-5 space-y-4">
            <div>
              <div className="text-lg font-medium text-white">{preview.headline}</div>
              <p className="text-sm text-slate-300 mt-1">{preview.emotionalSummary}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="text-xs text-emerald-400 uppercase mb-2">Free teaser</div>
                <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                  {preview.freeInsight.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase mb-2">Future VIP teaser (not unlocked)</div>
                <ul className="list-disc pl-5 text-sm text-slate-400 space-y-1">
                  {preview.futureVipTeaser.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-xs text-slate-500 border-t border-slate-800 pt-3">{preview.safetyNote}</p>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white">Experience steps</h2>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div key={s.step} className="flex gap-4 border border-slate-800 rounded-lg p-4">
                <div className="text-slate-600 text-sm font-mono">{String(i + 1).padStart(2, "0")}</div>
                <div className="space-y-1">
                  <div className="text-white text-sm font-medium">{s.step}</div>
                  <div className="text-xs text-slate-500">{s.purpose}</div>
                  <div className="text-sm text-slate-300">User sees: {s.userSees}</div>
                  {s.blockedUntil.length > 0 && (
                    <div className="text-xs text-amber-400/80">Blocked until: {s.blockedUntil.join(", ")}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white">Staged loading</h2>
          <p className="text-sm text-slate-500">Local ritual loading copy — no real async work, no fetch.</p>
          <ol className="space-y-2">
            {stages.map((st, i) => (
              <li key={st.label} className="flex items-center gap-3 text-sm">
                <span className="text-rose-400/70 font-mono text-xs">{i + 1}</span>
                <span className="text-slate-200">{st.label}</span>
                <span className="text-slate-600 text-xs">— {st.description}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Safety boundaries
          </h2>
          <div className="space-y-2">
            {boundaries.map((b) => (
              <div key={b.area} className="flex items-start justify-between gap-4 border border-slate-800 rounded-lg p-3">
                <div>
                  <div className="text-sm text-slate-200">{b.area}</div>
                  <div className="text-xs text-slate-500">
                    status: {b.status}
                    {b.blockedUntil.length > 0 ? ` · blocked until: ${b.blockedUntil.join(", ")}` : ""}
                  </div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                  risk: {b.riskLevel}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-xs pt-2">
            {APHRODITE_FIRST_RESULT_SAFETY_BOUNDARIES.map((b) => (
              <span key={b} className="px-2 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">
                {b}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white">Recommended next packages</h2>
          <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
            <li>Package 136 — AI Love Reading Foundation (static result template; still no payments).</li>
            <li>Package 137 — Free vs VIP presentation (no live payments).</li>
          </ul>
        </section>

        <div className="pt-4 border-t border-slate-800/50 space-y-3">
          <div className="text-sm text-slate-400">Related</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/aphrodite-product-remediation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Aphrodite Product Remediation</Link>
            <Link href="/dashboard/networks/zodiac/ai-love-reading-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">AI Love Reading Foundation</Link>
            <Link href="/dashboard/networks/zodiac/soulmate-scanner-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Soulmate Scanner Foundation</Link>
            <Link href="/dashboard/networks/zodiac/red-flags-scanner-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Red Flags Scanner Foundation</Link>
            <Link href="/dashboard/networks/zodiac/ai-future-timeline-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">AI Future Timeline Foundation</Link>
            <Link href="/dashboard/networks/zodiac/social-traffic-layer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Traffic Layer</Link>
            <Link href="/dashboard/networks/zodiac/social-content-template-engine" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Content Template Engine</Link>
            <Link href="/dashboard/networks/zodiac/social-draft-review-queue" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Draft Review Queue</Link>
            <Link href="/dashboard/networks/zodiac/social-export-dashboard" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Export Dashboard</Link>
            <Link href="/dashboard/networks/zodiac/social-content-calendar" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Content Calendar</Link>
            <Link href="/vip-compatibility-report" className="inline-flex items-center gap-1 text-rose-300 hover:text-rose-200 underline underline-offset-4">AI Love Reading Preview <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <p className="text-xs text-slate-600">
            The preview link is a read-only internal view. No payment, unlock, or live Telegram Stars CTA is added.
          </p>
        </div>
      </div>
    </div>
  );
}
