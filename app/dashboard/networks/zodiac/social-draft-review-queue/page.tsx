import Link from "next/link";
import { ClipboardCheck, ShieldCheck, ListChecks } from "lucide-react";
import {
  APHRODITE_REVIEW_MANUAL_EXPORT_CHECKLIST,
  APHRODITE_REVIEW_SAFETY_BOUNDARIES,
  APHRODITE_REVIEW_STATES,
  getAphroditeSocialDraftReviewQueue,
  getAphroditeSocialDraftReviewRules,
  getAphroditeSocialDraftReviewBoundaries,
  getAphroditeSocialDraftReviewNextSteps,
} from "@/lib/zodiac/aphrodite-social-draft-review-queue";

export const metadata = {
  title: "Social Draft Review Queue",
};

const queue = getAphroditeSocialDraftReviewQueue();
const rules = getAphroditeSocialDraftReviewRules();
const boundaries = getAphroditeSocialDraftReviewBoundaries();
const nextSteps = getAphroditeSocialDraftReviewNextSteps();

const STATUS_LABEL: Record<string, string> = {
  "draft": "Draft",
  "needs-review": "Needs Review",
  "approved-for-manual-export": "Approved for Manual Export",
  "rejected": "Rejected",
  "blocked-by-safety": "Blocked by Safety",
};

export default function SocialDraftReviewQueuePage() {
  return (
    <div className="min-h-screen bg-black text-slate-200 p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-rose-300">
            <ClipboardCheck className="w-4 h-4" />
            <span>Aphrodite / Draft Review</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">Social Draft Review Queue</h1>
          <p className="text-rose-300/90 text-sm font-medium">
            Review queue only / Manual export / No auto-posting
          </p>
          <p className="text-slate-400 max-w-3xl text-lg">
            A local, read-only human review workflow between the content engine and any manual posting.
            Reviewers move drafts through clear states and an export checklist. Nothing is posted, exported
            automatically, or stored — manual export only.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {APHRODITE_REVIEW_SAFETY_BOUNDARIES.map((b) => (
              <span key={b} className="px-2 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">{b}</span>
            ))}
          </div>
        </header>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white">Review queue summary</h2>
          <p className="text-sm text-slate-400">
            {queue.length} sample drafts across all pillars. Each carries reviewer notes, safety flags, and a
            manual export checklist. A draft can only leave the queue when a human approves it for manual export.
          </p>
          <div>
            <div className="text-xs text-slate-500 uppercase mb-2">Review states</div>
            <div className="flex flex-wrap gap-2 text-xs">
              {APHRODITE_REVIEW_STATES.map((s) => (
                <span key={s} className="px-2 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700">{STATUS_LABEL[s] ?? s}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-rose-400" /> Sample queue items
          </h2>
          <div className="space-y-3">
            {queue.map((q) => (
              <div key={q.id} className="border border-slate-800 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-white font-medium">{q.title}</div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 shrink-0">{STATUS_LABEL[q.status] ?? q.status}</span>
                </div>
                <div className="text-[11px] text-slate-500">{q.platform} · {q.pillar} · from {q.sourceTemplateId}</div>
                <div className="text-sm text-slate-300">{q.hook}</div>
                <div className="text-xs text-slate-400">Caption: {q.caption}</div>
                <div className="text-xs text-emerald-400/80">CTA: {q.safeCta}</div>
                {q.reviewerNotes.length > 0 && <div className="text-xs text-slate-500">Notes: {q.reviewerNotes.join(" · ")}</div>}
                {q.safetyFlags.length > 0 && <div className="text-xs text-amber-400/80">Safety flags: {q.safetyFlags.join(" · ")}</div>}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-medium text-white">Safety rules</h2>
          <div className="space-y-2">
            {rules.map((r) => (
              <div key={r.id} className="border border-slate-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-200">{r.label}</div>
                  <span className="text-[11px] text-slate-500">severity: {r.severity}</span>
                </div>
                <div className="text-xs text-slate-500">{r.description}</div>
                <div className="text-[11px] text-emerald-400/70 mt-1">Replacement: {r.allowedReplacement}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-amber-400" /> Manual export checklist
          </h2>
          <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
            {APHRODITE_REVIEW_MANUAL_EXPORT_CHECKLIST.map((c) => (<li key={c}>{c}</li>))}
          </ul>
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
            {APHRODITE_REVIEW_SAFETY_BOUNDARIES.map((b) => (
              <span key={b} className="px-2 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">{b}</span>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-medium text-white">Recommended next packages</h2>
          <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
            {nextSteps.map((n) => (<li key={n.package}><span className="text-white">{n.package} — {n.title}:</span> {n.purpose}</li>))}
          </ul>
          <p className="text-xs text-slate-500">Next package should be Package 144 — Social Export Dashboard.</p>
        </section>

        <div className="pt-4 border-t border-slate-800/50">
          <div className="text-sm text-slate-400 mb-2">Related</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/networks/zodiac" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Zodiac Network</Link>
            <Link href="/dashboard/networks/zodiac/social-content-template-engine" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Content Template Engine</Link>
            <Link href="/dashboard/networks/zodiac/social-traffic-layer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Social Traffic Layer</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
