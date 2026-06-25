import Link from "next/link";
import { ShieldAlert, Sparkles, ShieldCheck } from "lucide-react";
import {
  APHRODITE_RED_FLAGS_PROMISE,
  APHRODITE_RED_FLAGS_SAFETY_BOUNDARIES,
  createAphroditeRedFlagsScannerPreview,
  getAphroditeRedFlagsScannerSections,
  getAphroditeRedFlagsScannerBoundaries,
  getAphroditeRedFlagsScannerTrafficHooks,
} from "@/lib/zodiac/aphrodite-red-flags-scanner-foundation";

export const metadata = {
  title: "Red Flags Scanner Foundation",
};

const preview = createAphroditeRedFlagsScannerPreview({
  firstName: "You",
  partnerName: "Them",
  firstSign: "leo",
  partnerSign: "scorpio",
  relationshipStatus: "complicated",
  focus: "distance",
  tone: "gentle",
});
const sections = getAphroditeRedFlagsScannerSections();
const boundaries = getAphroditeRedFlagsScannerBoundaries();
const hooks = getAphroditeRedFlagsScannerTrafficHooks();
const freePreview = [
  `One possible red flag: ${preview.mainRedFlagZone}`,
  `One soft warning: ${preview.softWarning}`,
  `One distance/conflict pattern: ${preview.distancePattern}`,
  `One self-protection step: ${preview.selfProtectionStep}`,
  `One next step: ${preview.nextStep}`,
];

export default function RedFlagsScannerFoundationPage() {
  return (
    <div className="min-h-screen bg-black text-slate-200 p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-rose-300">
            <ShieldAlert className="w-4 h-4" />
            <span>Aphrodite / Red Flags Scanner</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">Red Flags Scanner Foundation</h1>
          <p className="text-rose-300/90 text-sm font-medium">
            Local foundation only / No AI API / No payment / No real VIP unlock
          </p>
          <p className="text-slate-400 max-w-3xl text-lg">
            The local, deterministic foundation for the Red Flags Scanner. It gently surfaces zones of attention.
            There is no real AI here — the word describes the product, not the implementation. It never accuses a
            real person, never diagnoses, and never gives emergency, legal, or medical advice.
          </p>
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-4">
            <div className="text-xs text-rose-300/80 uppercase mb-1">Product promise</div>
            <p className="text-rose-100 text-base">{APHRODITE_RED_FLAGS_PROMISE}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {APHRODITE_RED_FLAGS_SAFETY_BOUNDARIES.map((b) => (
              <span key={b} className="px-2 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">{b}</span>
            ))}
          </div>
        </header>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-400" /> Sample local preview
          </h2>
          <p className="text-sm text-slate-500">Deterministic sample (Leo &amp; Scorpio). No data is stored.</p>
          <div className="rounded-lg border border-slate-800 bg-black/40 p-5 space-y-4">
            <div>
              <div className="text-lg font-medium text-white">{preview.headline}</div>
              <p className="text-sm text-slate-300 mt-1">{preview.emotionalSummary}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="text-xs text-emerald-400 uppercase mb-2">Free preview</div>
                <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                  {freePreview.map((v) => (<li key={v}>{v}</li>))}
                </ul>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase mb-2">Future VIP teaser (not unlocked)</div>
                <ul className="list-disc pl-5 text-sm text-slate-400 space-y-1">
                  {preview.futureVipTeaser.map((v) => (<li key={v}>{v}</li>))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white">Red Flags Scanner sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((s) => (
              <div key={s.id} className="border border-slate-800 rounded-lg p-4 space-y-2">
                <div className="text-white text-sm font-medium">{s.title}</div>
                <p className="text-sm text-slate-300">{s.freeText}</p>
                <div className="text-xs text-slate-500 uppercase">Future VIP depth</div>
                <ul className="list-disc pl-5 text-xs text-slate-400 space-y-0.5">
                  {s.futureVipDepth.map((v) => (<li key={v}>{v}</li>))}
                </ul>
                {s.safetyNote && <p className="text-[11px] text-amber-400/80">{s.safetyNote}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white">Traffic hooks</h2>
          <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
            {hooks.map((h) => (<li key={h}>{h}</li>))}
          </ul>
          <p className="text-xs text-slate-600">Spec only — no Instagram / TikTok automation is started here.</p>
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
                    {b.blockedUntil.length > 0 ? `blocked until: ${b.blockedUntil.join(", ")}` : "allowed locally"}
                  </div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">risk: {b.riskLevel}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-xs pt-2">
            {APHRODITE_RED_FLAGS_SAFETY_BOUNDARIES.map((b) => (
              <span key={b} className="px-2 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">{b}</span>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white">Recommended next package</h2>
          <p className="text-sm text-slate-300">Package 139 — AI Future Timeline Foundation.</p>
        </section>

        <div className="pt-4 border-t border-slate-800/50">
          <div className="text-sm text-slate-400 mb-2">Related</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/soulmate-scanner-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Soulmate Scanner Foundation</Link>
            <Link href="/dashboard/networks/zodiac/ai-future-timeline-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">AI Future Timeline Foundation</Link>
            <Link href="/dashboard/networks/zodiac/social-traffic-layer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Traffic Layer</Link>
            <Link href="/dashboard/networks/zodiac/social-content-template-engine" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Content Template Engine</Link>
            <Link href="/dashboard/networks/zodiac/social-draft-review-queue" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Draft Review Queue</Link>
            <Link href="/dashboard/networks/zodiac/social-export-dashboard" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Export Dashboard</Link>
            <Link href="/dashboard/networks/zodiac/social-content-calendar" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Content Calendar</Link>
            <Link href="/dashboard/networks/zodiac/ai-love-reading-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">AI Love Reading Foundation</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
