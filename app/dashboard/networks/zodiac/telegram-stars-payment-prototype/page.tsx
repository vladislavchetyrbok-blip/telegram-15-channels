import React from "react";
import Link from "next/link";
import { ShieldAlert, Activity, ShieldCheck, HelpCircle, FileText, CheckCircle2 } from "lucide-react";
import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import { getStarsPaymentPrototypeBoundaries, createStarsPrototypeInvoice, isStarsPrototypeInvoiceSafe } from "@/lib/zodiac/zodiac-telegram-stars-payment-prototype";

export default function TelegramStarsPaymentPrototypeDashboardPage() {
  const boundaries = getStarsPaymentPrototypeBoundaries();
  
  // Create a prototype invoice to display
  const demoInvoice = createStarsPrototypeInvoice({
    productCode: "vip_compatibility_deep_report",
    userRef: "demo_user"
  });
  
  const isSafe = isStarsPrototypeInvoiceSafe(demoInvoice);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <AphroditePageHeader
        title="Telegram Stars Payment Prototype Gate"
        badgeText="Package 130"
        description="Prototype gate only / No live invoice / No payment handler"
        icon={ShieldCheck}
      />

      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold text-rose-300 mb-2">
          <ShieldAlert className="h-5 w-5" />
          Strict Safety Boundaries Active
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-rose-200/80 text-sm">
          <li><strong>No live invoice:</strong> Telegram <code>sendInvoice</code> API is not called.</li>
          <li><strong>No Telegram API call:</strong> No network calls are made to Telegram.</li>
          <li><strong>No bot token:</strong> No credentials are used or loaded.</li>
          <li><strong>No successful payment handler:</strong> No webhook logic exists yet.</li>
          <li><strong>No entitlement creation:</strong> VIP unlocking is still fully disabled.</li>
          <li><strong>No real VIP access:</strong> Routes remain guarded only visually.</li>
          <li><strong>No database write:</strong> No payment states or profiles are stored.</li>
          <li><strong>No active Telegram CTA logic changed:</strong> Daily/weekly bot messages remain unblocked.</li>
          <li><strong>No production launch:</strong> This remains a UI/read-only exploration.</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-100 flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5 text-indigo-400" />
            1. Why Telegram Stars?
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Telegram Stars (<code>XTR</code>) are the mandatory currency for digital goods in Telegram bots and Mini Apps. To comply with Apple and Google app store policies, digital purchases must be routed through Telegram&apos;s native payment ecosystem.
          </p>
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-200">
            <strong>Future Flow:</strong>
            <ol className="list-decimal pl-4 mt-2 space-y-1 text-indigo-300/80">
              <li>Bot sends an invoice (<code>sendInvoice</code>) with currency <code>XTR</code>.</li>
              <li>User pays via Telegram native UI.</li>
              <li>Bot receives <code>pre_checkout_query</code>.</li>
              <li>Bot answers with <code>answerPreCheckoutQuery</code>.</li>
              <li>Bot receives <code>successful_payment</code>.</li>
              <li>Bot stores the charge ID and grants Entitlement.</li>
            </ol>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="font-semibold text-slate-100 flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-emerald-400" />
            2. First Future Product Candidate
          </h2>
          <div className="flex-1 flex flex-col justify-center items-center text-center p-6 border border-dashed border-slate-700 rounded-lg bg-slate-950/50">
            <FileText className="h-8 w-8 text-fuchsia-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-200">VIP Compatibility Deep Report</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-sm">
              The first logical candidate for monetization because it provides high immediate emotional value, has an existing mock content foundation (Package 128), and a safe preview UI (Package 129).
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-100 mb-4">3. Prototype Invoice Shape</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-400 mb-3">
              This is the <em>local, deterministic shape</em> of the future invoice payload. 
              It is currently guaranteed safe ({isSafe ? "Yes" : "No"}) because <code>liveSendAllowed</code> is hardcoded to <code>false</code>.
            </p>
            <pre className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto">
              {JSON.stringify(demoInvoice, null, 2)}
            </pre>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300">Future connections</h3>
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-lg">
              <h4 className="text-xs font-bold text-indigo-400 mb-1">To VIP Report</h4>
              <p className="text-xs text-slate-400">The `productCode` maps directly to the logic generating the VIP sections of the report.</p>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-lg">
              <h4 className="text-xs font-bold text-violet-400 mb-1">To Entitlement</h4>
              <p className="text-xs text-slate-400">A successful payment will extract the `payload` string to uniquely identify the user and product, passing this to the Entitlement Foundation (Package 126).</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-100 mb-4">4. Boundaries Blocked Now</h2>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {boundaries.map((b, idx) => (
            <div key={idx} className={`p-4 rounded-lg border ${b.status === 'blocked' ? 'bg-rose-950/20 border-rose-900/30' : 'bg-slate-950/50 border-slate-800'}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-200 text-sm">{b.area}</h3>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${
                  b.status === 'blocked' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                  b.status === 'prototype-only' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                }`}>
                  {b.status}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-3">
                <span className="block font-semibold text-slate-400 mb-1">Blocked until:</span>
                <ul className="list-disc pl-4 space-y-1">
                  {b.blockedUntil.map((req, i) => <li key={i}>{req}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
        <div>
          <h2 className="font-semibold text-emerald-300 mb-1 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Safe Next Package
          </h2>
          <p className="text-sm text-emerald-200/80">
            Package 131 should be either Stars Payment Safety Review or Telegram Stars Invoice Draft Builder.
          </p>
        </div>
      </div>
      
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6">
        <h2 className="font-semibold text-indigo-300 mb-3">Links</h2>
        <ul className="space-y-2 text-sm">
          <li><Link href="/dashboard/networks/zodiac" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Zodiac Dashboard</Link></li>
          <li><Link href="/dashboard/networks/zodiac/vip-compatibility-report-preview" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">VIP Compatibility Report Preview</Link></li>
          <li><Link href="/dashboard/networks/zodiac/vip-compatibility-report-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">VIP Compatibility Report Foundation</Link></li>
          <li><Link href="/dashboard/networks/zodiac/vip-access-boundary" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">VIP Access Boundary</Link></li>
          <li><Link href="/dashboard/networks/zodiac/entitlement-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Future Entitlement Foundation</Link></li>
        </ul>
      </div>
    </div>
  );
}
