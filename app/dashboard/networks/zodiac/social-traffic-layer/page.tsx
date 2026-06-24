import Link from "next/link";
import { Share2, Sparkles, ShieldCheck, ClipboardCheck } from "lucide-react";
import {
  APHRODITE_SOCIAL_SAFETY_BOUNDARIES,
  APHRODITE_SOCIAL_SAFE_CTAS,
  APHRODITE_SOCIAL_BLOCKED_CLAIMS,
  APHRODITE_SOCIAL_PLATFORM_MATRIX,
  APHRODITE_SOCIAL_CONTENT_PILLARS,
  getAphroditeSocialTrafficHooks,
  getAphroditeSocialContentTemplates,
  getAphroditeSocialTrafficBoundaries,
  getAphroditeSocialTrafficNextSteps,
} from "@/lib/zodiac/aphrodite-social-traffic-layer";

export const metadata = {
  title: "Social Traffic Layer Architecture",
};

const hooks = getAphroditeSocialTrafficHooks();
const templates = getAphroditeSocialContentTemplates();
const boundaries = getAphroditeSocialTrafficBoundaries();
const nextSteps = getAphroditeSocialTrafficNextSteps();

export default function SocialTrafficLayerPage() {
  return (
    <div className="min-h-screen bg-black text-slate-200 p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-rose-300">
            <Share2 className="w-4 h-4" />
            <span>Aphrodite / Social Traffic</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">Social Traffic Layer Architecture</h1>
          <p className="text-rose-300/90 text-sm font-medium">
            Architecture only / No auto-posting / No platform credentials
          </p>
          <p className="text-slate-400 max-w-3xl text-lg">
            A read-only architecture for Aphrodite social traffic across Instagram, TikTok, Telegram, and
            YouTube Shorts. It sells emotional outcomes — not generic astrology — and routes interest to the
            Telegram Mini App. This is planning only: no posting, no platform APIs, no scraping, no credentials.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {APHRODITE_SOCIAL_SAFETY_BOUNDARIES.map((b) => (
              <span key={b} className="px-2 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">{b}</span>
            ))}
          </div>
        </header>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white">Traffic strategy summary</h2>
          <p className="text-sm text-slate-400">
            Lead with emotional questions (does he love me, what does he feel, why does he pull away, what red
            flags to notice, who is meant for me, what is coming next, what to hear today). Each hook offers a
            soft, original read and a non-payment CTA into the Mini App for a free preview. Drafts always pass
            through manual human review before anything is posted by a person.
          </p>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white">Platform matrix</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {APHRODITE_SOCIAL_PLATFORM_MATRIX.map((p) => (
              <div key={p.platform} className="border border-slate-800 rounded-lg p-4">
                <div className="text-sm text-white font-medium">{p.label}</div>
                <div className="text-xs text-slate-500 mt-1">Formats: {p.formats.join(", ")}</div>
                <div className="text-xs text-slate-400 mt-1">{p.role}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white">Content pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {APHRODITE_SOCIAL_CONTENT_PILLARS.map((p) => (
              <div key={p.pillar} className="border border-slate-800 rounded-lg p-3">
                <div className="text-sm text-slate-200">{p.label}</div>
                <div className="text-xs text-slate-500 italic">“{p.coreQuestion}”</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-400" /> Traffic hooks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hooks.map((h) => (
              <div key={h.id} className="border border-slate-800 rounded-lg p-4 space-y-1">
                <div className="text-sm text-white">{h.hook}</div>
                <div className="text-[11px] text-slate-500">{h.platform} · {h.pillar} · {h.format}</div>
                <div className="text-xs text-slate-400">Trigger: {h.emotionalTrigger}</div>
                <div className="text-xs text-emerald-400/80">CTA: {h.safeCta}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white">Content templates</h2>
          <div className="space-y-3">
            {templates.map((t) => (
              <div key={t.id} className="border border-slate-800 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white font-medium">{t.title}</div>
                  <span className="text-[11px] text-slate-500">{t.platform} · {t.format}</span>
                </div>
                <ol className="list-decimal pl-5 text-xs text-slate-300 space-y-0.5">
                  {t.structure.map((s) => (<li key={s}>{s}</li>))}
                </ol>
                <div className="text-xs text-slate-400">Example: “{t.exampleSafeCopy[0]}”</div>
                <div className="text-xs text-emerald-400/80">Mini App CTA: {t.miniAppCta}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-amber-400" /> Manual review flow
          </h2>
          <ol className="list-decimal pl-5 text-sm text-slate-300 space-y-1">
            <li>Draft from a template (local, original voice).</li>
            <li>Manual human review — checks claims, tone, and blocked-claim list.</li>
            <li>Approved drafts are exported for a human to post manually.</li>
            <li>No step posts automatically; Manual Review stays UI / read-only.</li>
          </ol>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white">Safe CTA rules &amp; blocked claims</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="text-xs text-emerald-400 uppercase mb-2">Safe CTAs (no payment)</div>
              <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                {APHRODITE_SOCIAL_SAFE_CTAS.map((c) => (<li key={c}>{c}</li>))}
              </ul>
            </div>
            <div>
              <div className="text-xs text-rose-400 uppercase mb-2">Blocked claims</div>
              <ul className="list-disc pl-5 text-sm text-slate-400 space-y-1">
                {APHRODITE_SOCIAL_BLOCKED_CLAIMS.map((c) => (<li key={c}>{c}</li>))}
              </ul>
            </div>
          </div>
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
            {APHRODITE_SOCIAL_SAFETY_BOUNDARIES.map((b) => (
              <span key={b} className="px-2 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">{b}</span>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white">Recommended next packages</h2>
          <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
            {nextSteps.map((n) => (<li key={n.package}><span className="text-white">{n.package} — {n.title}:</span> {n.purpose}</li>))}
          </ul>
          <p className="text-xs text-slate-500">Next package should be Package 142 — Social Content Template Engine.</p>
        </section>

        <div className="pt-4 border-t border-slate-800/50">
          <div className="text-sm text-slate-400 mb-2">Related</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/ai-future-timeline-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">AI Future Timeline Foundation</Link>
            <Link href="/dashboard/networks/zodiac/social-content-template-engine" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Content Template Engine</Link>
            <Link href="/dashboard/networks/zodiac/aphrodite-product-remediation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Aphrodite Product Remediation</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
