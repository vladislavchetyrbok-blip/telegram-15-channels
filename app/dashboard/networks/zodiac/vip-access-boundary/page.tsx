import React from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, Lock, CheckCircle2, XCircle, PlayCircle } from "lucide-react";
import { AphroditePageHeader } from "@/components/AphroditePageHeader";

export default function VipAccessBoundaryPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <AphroditePageHeader
          title="VIP Access Boundary"
          badgeText="Package 127"
          description="Local foundation for entitlement-based access checking. Defines allow/deny boundaries."
          icon={ShieldAlert}
        />

        <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Access boundary only
          </h2>
          <p className="text-emerald-200/80 text-sm leading-relaxed mb-4">
            This module provides local entitlement evaluation only. It establishes the logic for granting or denying access to VIP content based on the user&apos;s entitlement state.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-emerald-200/70">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Entitlement logic modeled</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Preview vs VIP evaluated</li>
            <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> No real VIP unlock</li>
            <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> No payment handler</li>
            <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> No database write</li>
            <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> No Telegram API call</li>
            <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> No active Telegram CTA logic changed</li>
            <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> No subscription billing</li>
            <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> No Telegram Stars</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-medium text-slate-100 flex items-center gap-2 mb-4">
              <PlayCircle className="w-5 h-5 text-indigo-400" />
              Allow States
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="bg-slate-800 p-1 rounded mt-0.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-200 block">allow-vip</span>
                  <span className="text-xs text-slate-400">Granted when a valid, active entitlement is present.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-slate-800 p-1 rounded mt-0.5">
                  <Lock className="w-3 h-3 text-indigo-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-200 block">allow-preview</span>
                  <span className="text-xs text-slate-400">Granted when entitlement access type is preview-only. Local free preview, not real VIP.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-medium text-slate-100 flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Deny States
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="bg-slate-800 p-1 rounded mt-0.5">
                  <XCircle className="w-3 h-3 text-rose-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-200 block">deny-missing-entitlement</span>
                  <span className="text-xs text-slate-400">No entitlement exists for the user.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-slate-800 p-1 rounded mt-0.5">
                  <XCircle className="w-3 h-3 text-rose-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-200 block">deny-pending-payment</span>
                  <span className="text-xs text-slate-400">Payment is still pending.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-slate-800 p-1 rounded mt-0.5">
                  <XCircle className="w-3 h-3 text-rose-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-200 block">deny-expired</span>
                  <span className="text-xs text-slate-400">Access time has elapsed.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-slate-800 p-1 rounded mt-0.5">
                  <XCircle className="w-3 h-3 text-rose-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-200 block">deny-refunded / revoked</span>
                  <span className="text-xs text-slate-400">Access was removed or refunded.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-slate-800 p-1 rounded mt-0.5">
                  <XCircle className="w-3 h-3 text-rose-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-200 block">deny-unsupported-product</span>
                  <span className="text-xs text-slate-400">Entitlement does not match requested product.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-slate-100 flex items-center gap-2">
            Future Entitlement Usage
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            This module provides the logic for determining access. Future routes will use `evaluateVipAccess` before rendering premium content.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Blocked</span>
              <p className="text-sm text-slate-300">Live paywalls</p>
              <p className="text-xs text-slate-500 mt-1">Real route gating remains disabled until the end-to-end payment flow is complete.</p>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500/80 mb-1 block">Safe Next Package</span>
              <p className="text-sm text-slate-300">Package 128 (TBD)</p>
              <p className="text-xs text-slate-500 mt-1 mb-2">Either Telegram Stars payment prototype or first VIP report content foundation.</p>
              <div className="flex gap-2 flex-wrap">
                <Link href="/dashboard/networks/zodiac/vip-compatibility-report-foundation" className="inline-block bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors text-xs">
                  View VIP Compatibility Report
                </Link>
                <Link href="/dashboard/networks/zodiac/vip-compatibility-report-preview" className="inline-block bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors text-xs">
                  VIP Report Preview
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
