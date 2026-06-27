import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, ChevronLeft, LockKeyhole, Sparkles, Ban, ShieldCheck, Settings2, FileText, Database, CreditCard } from "lucide-react";
import { AphroditeLockedPreviewCard, AphroditeShareCard } from "@/components/zodiac-mini-app/aphrodite-design-system";
import { MOCK_VIP_PREVIEW_FEATURES, MOCK_VIP_BOUNDARY_RULES } from "@/lib/zodiac/zodiac-vip-preview";

export const metadata: Metadata = {
  title: "VIP Preview",
  description: "Preview shell for future VIP functionality.",
};

const statusColors = {
  "preview-only": "border-violet-500/30 bg-violet-500/10 text-violet-400",
  "future": "border-slate-500/30 bg-slate-500/10 text-slate-400",
  "blocked-until-payments": "border-rose-500/30 bg-rose-500/10 text-rose-400",
};

export default function VipPreviewPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#070b14] text-slate-100 font-sans">
      <header className="sticky top-0 z-10 border-b border-fuchsia-900/50 bg-[#070b14]/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link href="/miniapp" className="rounded-full p-1 transition hover:bg-slate-800">
            <ChevronLeft className="h-6 w-6 text-slate-300" />
          </Link>
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-5 w-5 text-fuchsia-400" />
            <h1 className="text-lg font-semibold text-slate-100">VIP Preview</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
        <div className="mb-6" data-aphrodite-vip-preview-index="package-242">
          <AphroditeLockedPreviewCard
            variant="general"
            scope="vip-preview-index"
            title="Future VIP Access"
            subtitle="Unified VIP locked preview"
            preview="This index shows the value ladder only: no active payment, no entitlement creation, no real VIP unlock, and no Telegram API call."
            features={["Deep compatibility report", "Birth Matrix Pro", "Mystic deep reading"]}
            previewItems={["Natal profile", "Personal advice", "Shareable premium card"]}
            safetyLabel="Preview-only index. No payment logic or real VIP access is active."
          />
        </div>

        <div className="mb-6" data-aphrodite-vip-preview-share-card="package-243">
          <AphroditeShareCard
            variant="vipPreview"
            scope="vip-preview"
            eyebrow="VIP teaser result card"
            title="Future VIP Access"
            subtitle="Preview-only premium result"
            scoreLabel="locked"
            scoreDetail="preview"
            insight="A premium result card can show the value of a future VIP reading without activating payment, entitlement, Telegram API, or real unlock behavior."
            highlights={[
              { label: "preview", value: "safe", detail: "Visual teaser only; the value ladder stays visible before any future payment work." },
              { label: "boundary", value: "locked", detail: "No invoice, no entitlement bypass, no real VIP access, and no DB write." },
              { label: "format", value: "mobile", detail: "Compact Telegram WebView card for 360px, 390px, and 430px screens." },
            ]}
            footer="Share-ready VIP preview visual only. No real Telegram share/send API, payment, invoice, entitlement change, or DB write."
          />
        </div>

        <div className="mb-6 rounded-lg border border-amber-900/30 bg-amber-900/10 p-4 text-sm flex items-start gap-3">
          <ShieldAlert className="h-6 w-6 shrink-0 text-amber-500 mt-1" />
          <div>
            <p className="font-semibold text-amber-500 text-base">Preview Only (Package 107)</p>
            <p className="mt-1 text-xs text-amber-400/80 mb-3">This is a static boundary. No payment logic or real VIP access is active.</p>
            <ul className="space-y-1.5 text-xs text-amber-500/90">
              {MOCK_VIP_BOUNDARY_RULES.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Ban className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-70" />
                  <span><span className="font-semibold">{rule.label}:</span> {rule.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-indigo-900/30 bg-indigo-900/10 p-4 text-sm flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-indigo-400 mt-0.5" />
          <div>
            <p className="font-medium text-indigo-300">VIP Access Boundary exists, but real VIP unlock is not active.</p>
            <Link href="/dashboard/networks/zodiac/vip-access-boundary" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 text-xs mt-2 inline-block">
              View VIP Access Boundary
            </Link>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-violet-900/30 bg-violet-900/10 p-4 text-sm flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-violet-400 mt-0.5" />
          <div>
            <p className="font-medium text-violet-300">VIP Compatibility Deep Report content foundation exists, but payment and real VIP unlock are not active.</p>
            <div className="flex gap-4 mt-2">
              <Link href="/dashboard/networks/zodiac/vip-compatibility-report-foundation" className="text-violet-400 hover:text-violet-300 underline underline-offset-4 text-xs inline-block">
                View VIP Compatibility Report Foundation
              </Link>
              <Link href="/vip-compatibility-report" className="text-violet-400 hover:text-violet-300 underline underline-offset-4 text-xs inline-block font-medium">
                View report preview
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="text-center">
            <Sparkles className="mx-auto h-8 w-8 text-fuchsia-400 mb-3" />
            <h2 className="text-2xl font-bold text-slate-100">Future VIP Access</h2>
            <p className="mt-2 text-sm text-slate-400">Preview the advanced features planned for future updates.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {MOCK_VIP_PREVIEW_FEATURES.map((feature, idx) => (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-slate-200">{feature.title}</h3>
                </div>
                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{feature.description}</p>
                
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColors[feature.status]}`}>
                    {feature.status.replace(/-/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Settings2 className="h-3 w-3" /> {feature.dependency}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Future Dependencies Block */}
          <div className="rounded-xl border border-indigo-900/30 bg-indigo-900/10 p-5">
            <h3 className="font-semibold text-indigo-400 mb-4 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Future Dependencies
            </h3>
            <ul className="grid grid-cols-1 gap-2 text-sm text-slate-300">
              <li className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-indigo-500/70" /> Payment provider</li>
              <li className="flex items-center gap-2"><Database className="h-4 w-4 text-indigo-500/70" /> User profile storage</li>
              <li className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-indigo-500/70" /> Entitlement model</li>
              <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-500/70" /> Privacy policy & Refund rules</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-indigo-500/70" /> Production security review</li>
            </ul>
          </div>

          {/* Safe Next Steps Block */}
          <div className="rounded-xl border border-emerald-900/30 bg-emerald-900/10 p-5">
            <h3 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Safe Roadmap
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
              <li>Design entitlement model.</li>
              <li>Design payment boundary.</li>
              <li>Design profile storage.</li>
              <li>Design privacy and refund/access rules.</li>
              <li className="font-medium text-emerald-300 mt-3 pt-3 border-t border-emerald-900/50">
                Only after that, implement real VIP logic in a separate package.
              </li>
            </ol>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Quick Launch</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link href="/compatibility" className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                Check compatibility
              </Link>
              <Link href="/birth-matrix" className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                Try mock Birth Matrix
              </Link>
              <Link href="/mystic-numbers" className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                Preview Mystic Numbers
              </Link>
              <Link href="/affirmations" className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                Open Affirmations
              </Link>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-800 pb-8">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Navigation</h3>
            <div className="flex flex-col gap-3">
              <Link href="/miniapp" className="text-sm font-bold text-violet-400 hover:text-violet-300 transition flex items-center gap-1">
                ← Back to Mini App Hub
              </Link>
              <Link href="/dashboard/networks/zodiac/miniapp-route-safety" className="text-xs text-emerald-500/80 hover:text-emerald-400 transition flex items-center gap-1 mt-2">
                <ShieldCheck className="h-3.5 w-3.5" /> View safety baseline
              </Link>
              <Link href="/dashboard/networks/zodiac/miniapp-architecture" className="text-xs text-slate-500 hover:text-slate-300 transition flex items-center gap-1">
                → Mini App Architecture
              </Link>
              <Link href="/dashboard/networks/zodiac/stability" className="text-xs text-slate-500 hover:text-slate-300 transition flex items-center gap-1">
                → Stability Matrix
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
