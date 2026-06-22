"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, Sparkles, User, Lock, Heart } from "lucide-react";
import Link from "next/link";
import { createVipCompatibilityReportMock } from "@/lib/zodiac/zodiac-vip-compatibility-report-foundation";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export function VipCompatibilityReportClient() {
  const [firstSign, setFirstSign] = useState<string>("Aries");
  const [secondSign, setSecondSign] = useState<string>("Libra");
  const [firstName, setFirstName] = useState<string>("");
  const [secondName, setSecondName] = useState<string>("");
  const [isGenerated, setIsGenerated] = useState(false);

  const mockReport = isGenerated ? createVipCompatibilityReportMock({
    firstSign,
    secondSign,
    firstName: firstName || undefined,
    secondName: secondName || undefined,
  }) : null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-sm shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold text-rose-300 mb-2">
          <ShieldAlert className="h-5 w-5" />
          UI preview only / No payment / No real VIP unlock
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-rose-200/80">
          <li>No payment handler</li>
          <li>No Telegram Stars integration</li>
          <li>No active Telegram CTA changes</li>
          <li>No route gating</li>
          <li>No database write</li>
          <li>No Telegram API call</li>
          <li>No production launch</li>
        </ul>
      </div>

      {!isGenerated ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-fuchsia-400" />
            Generate Preview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4 bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
              <h3 className="font-semibold text-slate-200">Person 1</h3>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Sign</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 text-sm focus:border-fuchsia-500/50 focus:outline-none"
                  value={firstSign}
                  onChange={(e) => setFirstSign(e.target.value)}
                >
                  {ZODIAC_SIGNS.map(sign => <option key={sign} value={sign}>{sign}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Name (Optional)</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 text-sm focus:border-fuchsia-500/50 focus:outline-none"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Alex"
                />
              </div>
            </div>
            
            <div className="space-y-4 bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
              <h3 className="font-semibold text-slate-200">Person 2</h3>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Sign</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 text-sm focus:border-indigo-500/50 focus:outline-none"
                  value={secondSign}
                  onChange={(e) => setSecondSign(e.target.value)}
                >
                  {ZODIAC_SIGNS.map(sign => <option key={sign} value={sign}>{sign}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Name (Optional)</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 text-sm focus:border-indigo-500/50 focus:outline-none"
                  value={secondName}
                  onChange={(e) => setSecondName(e.target.value)}
                  placeholder="e.g. Jordan"
                />
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsGenerated(true)}
            className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white rounded-lg font-semibold shadow-md transition-all"
          >
            Generate Local Preview
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button 
            onClick={() => setIsGenerated(false)}
            className="text-sm text-slate-400 hover:text-slate-200 underline underline-offset-4"
          >
            ← Back to selection
          </button>

          <div className="bg-slate-900 border border-fuchsia-900/30 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-b from-fuchsia-900/40 to-slate-900 p-8 text-center border-b border-slate-800">
              <Heart className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-3">{mockReport!.headline}</h1>
              <p className="text-slate-300 max-w-2xl mx-auto">{mockReport!.summary}</p>
            </div>

            <div className="p-6 space-y-6">
              {mockReport!.sections.map((section, idx) => (
                <div key={idx} className={`rounded-xl border ${section.previewLevel === 'free-preview' ? 'bg-slate-800/50 border-slate-700 p-6' : 'bg-slate-950/80 border-indigo-900/30 p-6 relative overflow-hidden'}`}>
                  {section.previewLevel === 'future-vip' && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                      <Lock className="w-8 h-8 text-indigo-400 mb-3 opacity-80" />
                      <h4 className="text-lg font-bold text-slate-200 mb-2">{section.title}</h4>
                      <p className="text-sm text-slate-400 mb-4 max-w-sm">
                        Future VIP section — not unlocked here. Preview only.
                      </p>
                      <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded text-xs text-indigo-300">
                        Requires future entitlement / Requires future payment integration
                      </div>
                    </div>
                  )}

                  <div className={section.previewLevel === 'future-vip' ? 'opacity-20 pointer-events-none blur-[2px]' : ''}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-fuchsia-100">{section.title}</h3>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                        Free Preview
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed mb-4">{section.text}</p>
                    <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-4">
                      <p className="text-sm font-medium text-amber-200/90 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{section.practicalHint}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-rose-950/30 border-t border-rose-900/30 p-6 text-sm text-rose-300/80 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong>Safety Notice:</strong> {mockReport!.vipBoundaryNote}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/miniapp" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
          Mini App Home
        </Link>
        <Link href="/compatibility" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
          Free Compatibility
        </Link>
        <Link href="/vip-preview" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
          VIP Preview Index
        </Link>
        <Link href="/dashboard/networks/zodiac/vip-compatibility-report-foundation" className="text-slate-400 hover:text-slate-300 underline underline-offset-4">
          Dashboard: Report Foundation
        </Link>
        <Link href="/dashboard/networks/zodiac/vip-access-boundary" className="text-slate-400 hover:text-slate-300 underline underline-offset-4">
          Dashboard: VIP Boundary
        </Link>
      </div>
    </div>
  );
}
