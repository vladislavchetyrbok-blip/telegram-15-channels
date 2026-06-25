import Link from "next/link";
import { FileText, Sparkles, ShieldCheck, ClipboardCheck } from "lucide-react";
import {
  APHRODITE_CONTENT_SAFETY_BOUNDARIES,
  APHRODITE_CONTENT_SAFE_CTAS,
  APHRODITE_CONTENT_BLOCKED_CLAIMS,
  getAphroditeSocialContentTemplates,
  createAphroditeSocialContentDraft,
  getAphroditeSocialContentReviewChecklist,
  getAphroditeSocialContentEngineBoundaries,
} from "@/lib/zodiac/aphrodite-social-content-template-engine";

export const metadata = {
  title: "Social Content Template Engine",
};

const templates = getAphroditeSocialContentTemplates();
const checklist = getAphroditeSocialContentReviewChecklist();
const boundaries = getAphroditeSocialContentEngineBoundaries();
const platforms = ["instagram", "tiktok", "telegram", "youtube-shorts"] as const;
const pillars = [
  "ai-love-reading", "soulmate-scanner", "red-flags-scanner", "future-timeline",
  "daily-message", "zodiac-compatibility", "angel-numbers", "birth-matrix",
] as const;
const sampleDrafts = [
  createAphroditeSocialContentDraft({ platform: "instagram", pillar: "ai-love-reading", format: "reel", sign: "leo", theme: "distance" }),
  createAphroditeSocialContentDraft({ platform: "tiktok", pillar: "soulmate-scanner", format: "short-video", sign: "scorpio" }),
  createAphroditeSocialContentDraft({ platform: "telegram", pillar: "daily-message", format: "telegram-post" }),
];

export default function SocialContentTemplateEnginePage() {
  return (
    <div className="min-h-screen bg-black text-slate-200 p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-rose-300">
            <FileText className="w-4 h-4" />
            <span>Aphrodite / Content Engine</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">Social Content Template Engine</h1>
          <p className="text-rose-300/90 text-sm font-medium">
            Template engine only / No auto-posting / No platform API
          </p>
          <p className="text-slate-400 max-w-3xl text-lg">
            A local, deterministic engine that turns the social traffic architecture into reusable, original
            Aphrodite-style drafts for Instagram, TikTok, Telegram, and future YouTube Shorts. It produces
            <span className="text-white"> drafts only</span> — no posting, no platform APIs, no scraping, no credentials.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {APHRODITE_CONTENT_SAFETY_BOUNDARIES.map((b) => (
              <span key={b} className="px-2 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">{b}</span>
            ))}
          </div>
        </header>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white">Engine summary</h2>
          <p className="text-sm text-slate-400">
            Pick a platform, pillar, and format; the engine deterministically composes a draft with a title,
            hook, body lines, caption, generic hashtags, and a safe Mini App CTA. Every draft carries its blocked
            claims, a review checklist, and the safety boundaries. Drafts always pass manual human review before
            a person posts them — nothing is posted automatically.
          </p>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-400" /> Sample generated drafts
          </h2>
          <div className="space-y-4">
            {sampleDrafts.map((d) => (
              <div key={d.id} className="rounded-lg border border-slate-800 bg-black/40 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white font-medium">{d.title}</div>
                  <span className="text-[11px] text-slate-500">{d.platform} · {d.pillar} · {d.format}</span>
                </div>
                <div className="text-sm text-rose-200/90">{d.hook}</div>
                <ul className="list-disc pl-5 text-xs text-slate-300 space-y-0.5">
                  {d.bodyLines.map((l, i) => (<li key={i}>{l}</li>))}
                </ul>
                <div className="text-xs text-slate-400">Caption: {d.caption}</div>
                <div className="text-xs text-slate-500">{d.hashtags.join(" ")}</div>
                <div className="text-xs text-emerald-400/80">CTA: {d.safeCta}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white">Supported platforms &amp; pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="text-xs text-slate-500 uppercase mb-2">Platforms</div>
              <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                {platforms.map((p) => (<li key={p}>{p}</li>))}
              </ul>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase mb-2">Pillars</div>
              <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                {pillars.map((p) => (<li key={p}>{p}</li>))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white">Content templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.map((t) => (
              <div key={t.id} className="border border-slate-800 rounded-lg p-4 space-y-1">
                <div className="text-sm text-white font-medium">{t.title}</div>
                <div className="text-[11px] text-slate-500">{t.pillar} · {t.format}</div>
                <div className="text-xs text-slate-400">Hook: {t.hookPatterns[0]}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-amber-400" /> Review checklist
          </h2>
          <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
            {checklist.map((c) => (<li key={c}>{c}</li>))}
          </ul>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white">Safe CTAs &amp; blocked claims</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="text-xs text-emerald-400 uppercase mb-2">Safe CTAs (no payment)</div>
              <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                {APHRODITE_CONTENT_SAFE_CTAS.map((c) => (<li key={c}>{c}</li>))}
              </ul>
            </div>
            <div>
              <div className="text-xs text-rose-400 uppercase mb-2">Blocked claims</div>
              <ul className="list-disc pl-5 text-sm text-slate-400 space-y-1">
                {APHRODITE_CONTENT_BLOCKED_CLAIMS.map((c) => (<li key={c}>{c}</li>))}
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
            {APHRODITE_CONTENT_SAFETY_BOUNDARIES.map((b) => (
              <span key={b} className="px-2 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">{b}</span>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white">Recommended next package</h2>
          <p className="text-sm text-slate-300">Package 143 — Social Draft Review Queue.</p>
        </section>

        <div className="pt-4 border-t border-slate-800/50">
          <div className="text-sm text-slate-400 mb-2">Related</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/social-traffic-layer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Traffic Layer</Link>
            <Link href="/dashboard/networks/zodiac/social-draft-review-queue" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Draft Review Queue</Link>
            <Link href="/dashboard/networks/zodiac/social-export-dashboard" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Export Dashboard</Link>
            <Link href="/dashboard/networks/zodiac/aphrodite-product-remediation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Aphrodite Product Remediation</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
