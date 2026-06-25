import Link from "next/link";
import { Download, ShieldCheck, ListChecks } from "lucide-react";
import {
  APHRODITE_EXPORT_SAFETY_BOUNDARIES,
  APHRODITE_EXPORT_BLOCKED_ACTIONS,
  getAphroditeSocialExportItems,
  getAphroditeSocialExportPlatformGuides,
  getAphroditeSocialExportBoundaries,
  getAphroditeSocialExportNextSteps,
  isAphroditeSocialExportReady,
} from "@/lib/zodiac/aphrodite-social-export-dashboard";

export const metadata = {
  title: "Social Export Dashboard",
};

const items = getAphroditeSocialExportItems();
const guides = getAphroditeSocialExportPlatformGuides();
const boundaries = getAphroditeSocialExportBoundaries();
const nextSteps = getAphroditeSocialExportNextSteps();
const readyItems = items.filter(isAphroditeSocialExportReady);

const STATUS_LABEL: Record<string, string> = {
  "not-ready": "Not Ready",
  "ready-for-manual-export": "Ready for Manual Export",
  "blocked-by-safety": "Blocked by Safety",
  "needs-copy-review": "Needs Copy Review",
};

export default function SocialExportDashboardPage() {
  return (
    <div className="min-h-screen bg-black text-slate-200 p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-rose-300">
            <Download className="w-4 h-4" />
            <span>Aphrodite / Manual Export</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">Social Export Dashboard</h1>
          <p className="text-rose-300/90 text-sm font-medium">
            Manual export only / No auto-posting / No platform API
          </p>
          <p className="text-slate-400 max-w-3xl text-lg">
            A local, read-only view that helps a human copy approved drafts out by hand. There is no
            "Post now" or "Connect account" button, no platform API, no scheduling, no credentials,
            and no database write — manual copy/export only.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {APHRODITE_EXPORT_SAFETY_BOUNDARIES.map((b) => (
              <span key={b} className="px-2 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">{b}</span>
            ))}
          </div>
        </header>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white">Export dashboard summary</h2>
          <p className="text-sm text-slate-400">
            {items.length} export items; {readyItems.length} marked ready for manual export. Only items a human
            reviewer marked "Ready for Manual Export" can be copied out — everything else stays in review.
          </p>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-rose-400" /> Approved / manual export items
          </h2>
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="border border-slate-800 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-white font-medium">{it.title}</div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 shrink-0">{STATUS_LABEL[it.exportStatus] ?? it.exportStatus}</span>
                </div>
                <div className="text-[11px] text-slate-500">{it.platform} · from {it.sourceDraftId} · {isAphroditeSocialExportReady(it) ? "exportable" : "not exportable"}</div>
                <div className="rounded bg-black/40 border border-slate-800 p-3 space-y-1">
                  <div className="text-xs text-slate-500 uppercase">Copy blocks</div>
                  <div className="text-sm text-rose-200/90">Hook: {it.hook}</div>
                  <ul className="list-disc pl-5 text-xs text-slate-300 space-y-0.5">
                    {it.bodyLines.map((l, i) => (<li key={i}>{l}</li>))}
                  </ul>
                  <div className="text-xs text-slate-400">Caption: {it.caption}</div>
                  <div className="text-xs text-slate-500">{it.hashtags.join(" ")}</div>
                  <div className="text-xs text-emerald-400/80">CTA: {it.safeCta}</div>
                </div>
                <div className="text-[11px] text-amber-400/80">Blocked: {it.blockedActions.join(" · ")}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white">Platform export guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guides.map((g) => (
              <div key={g.platform} className="border border-slate-800 rounded-lg p-4 space-y-2">
                <div className="text-sm text-white font-medium">{g.platform}</div>
                <div className="text-xs text-slate-500">Formats: {g.recommendedFormats.join(", ")}</div>
                <div className="text-xs text-slate-400">Copy notes: {g.copyNotes.join(" ")}</div>
                <div className="text-xs text-slate-500 uppercase">Manual export steps</div>
                <ol className="list-decimal pl-5 text-xs text-slate-300 space-y-0.5">
                  {g.manualExportSteps.map((s) => (<li key={s}>{s}</li>))}
                </ol>
                <div className="text-[11px] text-amber-400/80">Blocked automation: {g.blockedAutomation.join(" · ")}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white">Safety checklist (per item)</h2>
          <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
            {(items[0]?.safetyChecklist ?? []).map((c) => (<li key={c}>{c}</li>))}
          </ul>
          <div className="pt-2">
            <div className="text-xs text-rose-400 uppercase mb-2">Blocked actions</div>
            <div className="flex flex-wrap gap-2 text-xs">
              {APHRODITE_EXPORT_BLOCKED_ACTIONS.map((b) => (
                <span key={b} className="px-2 py-1 rounded-md bg-slate-800 text-rose-300 border border-slate-700">{b}</span>
              ))}
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
            {APHRODITE_EXPORT_SAFETY_BOUNDARIES.map((b) => (
              <span key={b} className="px-2 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">{b}</span>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white">Recommended next package</h2>
          <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
            {nextSteps.map((n) => (<li key={n.package}><span className="text-white">{n.package} — {n.title}:</span> {n.purpose}</li>))}
          </ul>
          <p className="text-xs text-slate-500">Next package should be Package 145 — Social Content Calendar.</p>
        </section>

        <div className="pt-4 border-t border-slate-800/50">
          <div className="text-sm text-slate-400 mb-2">Related</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/social-draft-review-queue" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Draft Review Queue</Link>
            <Link href="/dashboard/networks/zodiac/social-content-template-engine" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Content Template Engine</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
