import React from "react";
import Link from "next/link";
import { ShieldAlert, Activity, FileText, Lock } from "lucide-react";
import { AphroditePageHeader } from "@/components/AphroditePageHeader";

export default function VipCompatibilityReportPreviewDashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <AphroditePageHeader
        title="VIP Compatibility Report UI Preview"
        badgeText="Package 129"
        description="Preview UI only / No payment / No route gating"
        icon={FileText}
      />

      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold text-rose-300 mb-2">
          <ShieldAlert className="h-5 w-5" />
          Strict Safety Boundaries Active
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-rose-200/80 text-sm">
          <li><strong>No route gating:</strong> Access is visually gated only (UI element changes). There is no real database entitlement verification.</li>
          <li><strong>No payment handler:</strong> No real payment triggers or Telegram Stars payment invocations.</li>
          <li><strong>No Telegram Stars:</strong> Telegram Bot API is not integrated for payments.</li>
          <li><strong>No database write:</strong> Profile or mock data is not stored.</li>
          <li><strong>No active Telegram CTA changes:</strong> Telegram scripts are unblocked.</li>
        </ul>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-slate-100 flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-400" />
          Implementation Status
        </h2>
        <p className="text-sm text-slate-400">
          The user-facing route exists at <code>/vip-compatibility-report</code>. It correctly generates preview content from the static package foundation.
        </p>
        <div className="flex gap-4">
          <div className="flex-1 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
            <h3 className="text-emerald-400 text-sm font-semibold mb-1">Free Preview Section</h3>
            <p className="text-xs text-slate-400">Fully readable and visible as intended for marketing the report.</p>
          </div>
          <div className="flex-1 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
            <h3 className="text-indigo-400 text-sm font-semibold mb-1 flex items-center gap-1"><Lock className="w-4 h-4" /> Future VIP Section</h3>
            <p className="text-xs text-slate-400">Visually locked out and unreadable, directing the user to the existence of premium features.</p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-800 mt-6 flex justify-between items-center">
          <span className="text-sm text-slate-500">To experience the safe local preview:</span>
          <Link href="/vip-compatibility-report" className="px-4 py-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 rounded border border-indigo-500/30 text-sm font-medium transition-colors">
            Open UI Preview
          </Link>
        </div>
      </div>
      
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6">
        <h2 className="font-semibold text-indigo-300 mb-3">Links</h2>
        <ul className="space-y-2 text-sm">
          <li><Link href="/dashboard/networks/zodiac" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Zodiac Dashboard</Link></li>
          <li><Link href="/dashboard/networks/zodiac/vip-compatibility-report-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">VIP Compatibility Report Foundation</Link></li>
          <li><Link href="/dashboard/networks/zodiac/vip-access-boundary" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">VIP Access Boundary</Link></li>
          <li><Link href="/dashboard/networks/zodiac/telegram-stars-payment-prototype" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Stars Payment Prototype</Link></li>
          <li><Link href="/dashboard/networks/zodiac/stars-payment-safety-review" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Stars Payment Safety Review</Link></li>
        </ul>
      </div>
    </div>
  );
}
