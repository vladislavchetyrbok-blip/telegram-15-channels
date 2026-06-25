import Link from "next/link";
import { Rocket, ShieldCheck, ClipboardCheck, Link2 } from "lucide-react";
import {
  APHRODITE_LAUNCH_PRIMARY_PROMISE,
  APHRODITE_LAUNCH_SAFE_CTAS,
  APHRODITE_LAUNCH_BLOCKED_CLAIMS,
  APHRODITE_LAUNCH_SAFETY_BOUNDARIES,
  getAphroditePublicLaunchCopy,
  getAphroditePublicLaunchChecklist,
  getAphroditePublicLaunchDeepLinks,
  getAphroditePublicLaunchBoundaries,
  getAphroditePublicLaunchNextSteps,
} from "@/lib/zodiac/aphrodite-public-bot-profile-launch-packaging";

export const metadata = {
  title: "Public Bot Profile / Main Mini App Launch Packaging",
};

const copy = getAphroditePublicLaunchCopy();
const checklist = getAphroditePublicLaunchChecklist();
const deepLinks = getAphroditePublicLaunchDeepLinks();
const boundaries = getAphroditePublicLaunchBoundaries();
const nextSteps = getAphroditePublicLaunchNextSteps();

const STATUS_LABEL: Record<string, string> = {
  "planned": "Planned",
  "needs-manual-action": "Needs Manual Action",
  "blocked": "Blocked",
  "ready-for-owner-review": "Ready for Owner Review",
};

export default function PublicBotProfileLaunchPackagingPage() {
  return (
    <div className="min-h-screen bg-black text-slate-200 p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-rose-300">
            <Rocket className="w-4 h-4" />
            <span>Aphrodite / Launch Packaging</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">Public Bot Profile / Main Mini App Launch Packaging</h1>
          <p className="text-rose-300/90 text-sm font-medium">
            Launch packaging only / Manual setup / No Telegram API
          </p>
          <p className="text-slate-400 max-w-3xl text-lg">
            Copy, checklists, and deep-link concepts a human uses to set up the public bot profile and Main Mini
            App by hand. Nothing here touches BotFather, the Telegram API, or production — manual owner setup only.
          </p>
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-4">
            <div className="text-xs text-rose-300/80 uppercase mb-1">Primary promise</div>
            <p className="text-rose-100 text-base">{APHRODITE_LAUNCH_PRIMARY_PROMISE}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {APHRODITE_LAUNCH_SAFETY_BOUNDARIES.map((b) => (
              <span key={b} className="px-2 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">{b}</span>
            ))}
          </div>
        </header>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white">Launch packaging summary</h2>
          <p className="text-sm text-slate-400">
            {copy.length} recommended copy blocks, {checklist.length} manual checklist items, and {deepLinks.length}
            {" "}deep-link concepts. The public profile sells the emotional product (AI Love Reading, compatibility,
            red flags, soulmate hints, future timeline, daily messages) rather than the raw calculation.
          </p>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white">Recommended public bot copy</h2>
          <div className="space-y-3">
            {copy.map((c) => (
              <div key={c.id} className="border border-slate-800 rounded-lg p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white font-medium">{c.label}</div>
                  <span className="text-[11px] text-slate-500">{c.assetType}</span>
                </div>
                <div className="text-sm text-slate-300">“{c.recommendedCopy}”</div>
                <div className="text-xs text-slate-500">{c.purpose}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-amber-400" /> Main Mini App packaging checklist
          </h2>
          <div className="space-y-2">
            {checklist.map((it) => (
              <div key={it.id} className="flex items-start justify-between gap-4 border border-slate-800 rounded-lg p-3">
                <div>
                  <div className="text-sm text-slate-200">{it.area} — {it.task}</div>
                  <div className="text-xs text-slate-500">Owner: {it.ownerAction}{it.blockedUntil.length > 0 ? ` · blocked until: ${it.blockedUntil.join(", ")}` : ""}</div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 shrink-0">{STATUS_LABEL[it.status] ?? it.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white flex items-center gap-2">
            <Link2 className="w-5 h-5 text-rose-400" /> Deep-link concepts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {deepLinks.map((d) => (
              <div key={d.id} className="border border-slate-800 rounded-lg p-4 space-y-1">
                <div className="text-sm text-white font-medium">{d.label}</div>
                <div className="text-[11px] text-slate-500 font-mono">{d.path}?startapp={d.startParam}</div>
                <div className="text-xs text-slate-400">{d.purpose}</div>
                <div className="text-xs text-emerald-400/80">CTA: {d.safeCta}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white">Safe CTAs &amp; blocked claims</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="text-xs text-emerald-400 uppercase mb-2">Safe CTAs (no payment)</div>
              <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                {APHRODITE_LAUNCH_SAFE_CTAS.map((c) => (<li key={c}>{c}</li>))}
              </ul>
            </div>
            <div>
              <div className="text-xs text-rose-400 uppercase mb-2">Blocked claims</div>
              <ul className="list-disc pl-5 text-sm text-slate-400 space-y-1">
                {APHRODITE_LAUNCH_BLOCKED_CLAIMS.map((c) => (<li key={c}>{c}</li>))}
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
            {APHRODITE_LAUNCH_SAFETY_BOUNDARIES.map((b) => (
              <span key={b} className="px-2 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">{b}</span>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white">Recommended next package</h2>
          <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
            {nextSteps.map((n) => (<li key={n.package}><span className="text-white">{n.package} — {n.title}:</span> {n.purpose}</li>))}
          </ul>
          <p className="text-xs text-slate-500">Next package should be Package 147 — Mini App First Screen Real Integration.</p>
        </section>

        <div className="pt-4 border-t border-slate-800/50">
          <div className="text-sm text-slate-400 mb-2">Related</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/social-content-calendar" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Content Calendar</Link>
            <Link href="/dashboard/networks/zodiac/first-result-experience" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">First Result Experience</Link>
            <Link href="/dashboard/networks/zodiac/paywall-readiness" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Подготовка paywall</Link>
            <Link href="/dashboard/networks/zodiac/entitlement-enforcement-design" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Дизайн VIP-доступа</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
