import React from "react";
import Link from "next/link";
import { ShieldCheck, FileText, Lock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import {
  getVipCompatibilityReportSections,
  getVipCompatibilityProductBoundaries,
  createVipCompatibilityReportMock
} from "@/lib/zodiac/zodiac-vip-compatibility-report-foundation";

export default function VipCompatibilityReportFoundationPage() {
  const sections = getVipCompatibilityReportSections();
  const boundaries = getVipCompatibilityProductBoundaries();
  const mockReport = createVipCompatibilityReportMock({
    firstSign: "Aries",
    secondSign: "Libra",
  });

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <AphroditePageHeader
        title="VIP Compatibility Deep Report Foundation"
        badgeText="Package 128"
        description="Content foundation only / No payment / No real VIP unlock"
        icon={ShieldCheck}
      />

      <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-6 mb-8 shadow-sm">
        <h2 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Strict Boundaries
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-emerald-200/70">
          <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-emerald-500" /> No payment</li>
          <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-emerald-500" /> No Telegram Stars</li>
          <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-emerald-500" /> No real VIP access</li>
          <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-emerald-500" /> No subscription billing</li>
          <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-emerald-500" /> No database write</li>
          <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-emerald-500" /> No Telegram API call</li>
          <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-emerald-500" /> No bot sending logic</li>
          <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-emerald-500" /> No active Telegram CTA logic changed</li>
          <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-emerald-500" /> No production launch</li>
        </ul>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
            <FileText className="h-5 w-5 text-indigo-400" />
            Report Sections
          </h2>
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-200">{section.title}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${section.previewLevel === 'free-preview' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {section.previewLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{section.purpose}</p>
                <div className="text-[10px] uppercase text-indigo-400 font-semibold mb-1">Tone: {section.contentTone}</div>
                <ul className="text-xs text-slate-500 list-disc pl-4">
                  {section.safetyBoundary.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Mock Content Example
            </h2>
            <div className="rounded-lg bg-black/40 p-4 border border-slate-800 space-y-4">
              <div>
                <h3 className="font-bold text-slate-200">{mockReport.headline}</h3>
                <p className="text-sm text-slate-400 mt-2">{mockReport.summary}</p>
              </div>
              <div className="space-y-3">
                {mockReport.sections.map((sec, idx) => (
                  <div key={idx} className="bg-slate-900 rounded p-3 text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-indigo-300">{sec.title}</strong>
                      <span className="text-[10px] text-slate-500">{sec.previewLevel}</span>
                    </div>
                    <p className="text-slate-300 mb-2">{sec.text}</p>
                    <p className="text-xs text-amber-200/80 italic">Tip: {sec.practicalHint}</p>
                  </div>
                ))}
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded text-xs text-rose-300/80">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                {mockReport.vipBoundaryNote}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
              <Lock className="h-5 w-5 text-amber-400" />
              Product Boundaries
            </h2>
            <div className="space-y-3">
              {boundaries.map((b, idx) => (
                <div key={idx} className="rounded bg-black/30 border border-slate-800 p-3 text-sm flex justify-between items-center">
                  <span className="text-slate-300">{b.area}</span>
                  <span className={`text-xs font-mono px-2 py-1 rounded ${b.status === 'blocked' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-indigo-300">
              Cross Links
            </h2>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard/networks/zodiac/entitlement-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Future Entitlement</Link></li>
              <li><Link href="/dashboard/networks/zodiac/vip-access-boundary" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">VIP Access Boundary</Link></li>
              <li><Link href="/dashboard/networks/zodiac/product-catalog-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Product Catalog Foundation</Link></li>
              <li><Link href="/dashboard/networks/zodiac/vip-compatibility-report-preview" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">VIP Report Preview</Link></li>
              <li><Link href="/dashboard/networks/zodiac/telegram-stars-payment-prototype" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Stars Payment Prototype</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
