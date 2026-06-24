import Link from "next/link";
import {
  APHRODITE_AUDIT_SUMMARY,
  APHRODITE_EMOTIONAL_QUESTIONS,
  APHRODITE_GLOBAL_SAFETY_BOUNDARIES,
  APHRODITE_REMEDIATION_ITEMS,
  APHRODITE_EMOTIONAL_PRODUCT_MODULES,
  APHRODITE_TRUST_BLOCKS,
  APHRODITE_AB_TEST_IDEAS,
  APHRODITE_RECOMMENDED_NEXT_PACKAGES,
  getAphroditeRemediationItemsByPriority,
} from "@/lib/zodiac/aphrodite-product-remediation-plan";

export const metadata = {
  title: "Aphrodite Product Remediation Plan",
};

const P0 = getAphroditeRemediationItemsByPriority("P0");
const P1 = getAphroditeRemediationItemsByPriority("P1");
const P2 = getAphroditeRemediationItemsByPriority("P2");

export default function AphroditeProductRemediationPage() {
  return (
    <div className="min-h-screen bg-black text-slate-200 p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-rose-300">
            <span>Aphrodite / Product</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">
            Aphrodite Product Remediation Plan
          </h1>
          <p className="text-rose-300/90 text-sm font-medium">
            Product remediation only / No payment / No real VIP unlock
          </p>
          <p className="text-slate-400 max-w-3xl text-lg">
            A static plan to reframe Aphrodite from a generic horoscope / Mini App utility into an
            emotional astrology and relationship product. This is documentation, not implementation:
            no AI generation, no payments, no real VIP access, no Telegram API, no database writes.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {APHRODITE_GLOBAL_SAFETY_BOUNDARIES.map((b) => (
              <span
                key={b}
                className="px-2 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700"
              >
                {b}
              </span>
            ))}
          </div>
        </header>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white">Audit summary</h2>
          <p className="text-sm text-slate-400">
            <span className="text-slate-300 font-medium">Current framing:</span>{" "}
            {APHRODITE_AUDIT_SUMMARY.currentFraming}
          </p>
          <p className="text-sm text-slate-400">
            <span className="text-slate-300 font-medium">Current problem:</span>{" "}
            {APHRODITE_AUDIT_SUMMARY.currentProblem}
          </p>
          <p className="text-sm text-slate-400">
            <span className="text-slate-300 font-medium">Target framing:</span>{" "}
            {APHRODITE_AUDIT_SUMMARY.targetFraming}
          </p>
          <p className="text-sm text-slate-400">
            <span className="text-slate-300 font-medium">Hero scenario:</span>{" "}
            {APHRODITE_AUDIT_SUMMARY.heroScenario}
          </p>
          <div className="pt-2">
            <div className="text-xs text-slate-500 uppercase mb-2">Emotional questions to organise around</div>
            <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
              {APHRODITE_EMOTIONAL_QUESTIONS.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-medium text-white">P0 fixes — first experience &amp; conversion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {P0.map((item) => (
              <div key={item.area} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium">{item.area}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-900/40">
                    {item.priority} / {item.expectedImpact}
                  </span>
                </div>
                <p className="text-sm text-slate-500">Problem: {item.problem}</p>
                <p className="text-sm text-slate-300">Fix: {item.fix}</p>
                <p className="text-xs text-emerald-400/80">Safe next action: {item.safeNextAction}</p>
                {item.blockedUntil.length > 0 && (
                  <p className="text-xs text-amber-400/80">Blocked until: {item.blockedUntil.join(", ")}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-medium text-white">P1 modules — emotional product foundations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {APHRODITE_EMOTIONAL_PRODUCT_MODULES.map((m) => (
              <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-white font-medium">{m.title}</h3>
                <p className="text-sm text-rose-300/90 italic">“{m.emotionalQuestion}”</p>
                <div>
                  <div className="text-xs text-slate-500 uppercase mb-1">Free preview</div>
                  <ul className="list-disc pl-5 text-sm text-slate-300 space-y-0.5">
                    {m.freePreviewValue.map((v) => (
                      <li key={v}>{v}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase mb-1">Future VIP (not unlocked)</div>
                  <ul className="list-disc pl-5 text-sm text-slate-400 space-y-0.5">
                    {m.futureVipValue.map((v) => (
                      <li key={v}>{v}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {m.safetyBoundary.map((b) => (
                    <span key={b} className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400/90 border border-slate-700">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-medium text-white">P2 — social traffic layer (future, documented only)</h2>
          <p className="text-sm text-slate-500">
            Instagram / TikTok automation is not started in this package. The items below are spec only.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {P2.map((item) => (
              <div key={item.area} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-1">
                <h3 className="text-slate-200 text-sm font-medium">{item.area}</h3>
                <p className="text-xs text-slate-500">{item.fix}</p>
                {item.blockedUntil.length > 0 && (
                  <p className="text-[11px] text-amber-400/80">Blocked until: {item.blockedUntil.join(", ")}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white">Trust blocks (before payment)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {APHRODITE_TRUST_BLOCKS.map((t) => (
              <div key={t.label} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-200 text-sm font-medium">{t.label}</span>
                  <span className="text-[11px] text-slate-500">[{t.placement}]</span>
                </div>
                <p className="text-xs text-slate-500">{t.purpose}</p>
                <p className="text-sm text-slate-300">“{t.suggestedCopy}”</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white">A/B tests</h2>
          <div className="space-y-3">
            {APHRODITE_AB_TEST_IDEAS.map((t) => (
              <div key={t.test} className="border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-slate-200 text-sm font-medium">{t.test}</h3>
                  <span className="text-[11px] text-slate-500">{t.priority} · metric: {t.metric}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                  <p className="text-slate-400">A: {t.variantA}</p>
                  <p className="text-slate-300">B: {t.variantB}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-rose-200">What is blocked</h2>
          <ul className="list-disc pl-5 text-sm text-rose-200/80 space-y-1">
            <li>No payment — payments and Telegram Stars remain off.</li>
            <li>No real VIP unlock — VIP value is described, never granted.</li>
            <li>No Telegram API call — no bot / API integration in this package.</li>
            <li>No database write — nothing is persisted.</li>
            <li>No active Telegram CTA changes — live CTA generation is untouched.</li>
            <li>No production launch — this is planning only.</li>
            <li>Instagram / TikTok automation is not started.</li>
          </ul>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white">Recommended next packages</h2>
          <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
            {APHRODITE_RECOMMENDED_NEXT_PACKAGES.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="text-xs text-slate-500">
            Next package should be Package 135 — First Result Experience Rewrite.
          </p>
        </section>

        <div className="pt-4 border-t border-slate-800/50">
          <div className="text-sm text-slate-400 mb-2">Related</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/real-implementation-path" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Real Implementation Path</Link>
            <Link href="/dashboard/networks/zodiac/invoice-draft-safety-hardening" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Invoice Draft Safety Hardening</Link>
            <Link href="/dashboard/networks/zodiac/first-result-experience" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">First Result Experience</Link>
            <Link href="/dashboard/networks/zodiac/ai-love-reading-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">AI Love Reading Foundation</Link>
            <Link href="/dashboard/networks/zodiac/soulmate-scanner-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Soulmate Scanner Foundation</Link>
            <Link href="/dashboard/networks/zodiac/red-flags-scanner-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Red Flags Scanner Foundation</Link>
            <Link href="/dashboard/networks/zodiac/ai-future-timeline-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">AI Future Timeline Foundation</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
