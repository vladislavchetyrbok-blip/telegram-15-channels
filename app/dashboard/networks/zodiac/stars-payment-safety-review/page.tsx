import React from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, CheckSquare, XCircle, AlertTriangle, PlayCircle } from "lucide-react";
import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import { 
  getStarsPaymentSafetyReviewItems, 
  getStarsPaymentOwnerDecisions, 
  isStarsPaymentPrototypeSafeForInvoiceDraft, 
  isStarsPaymentPrototypeSafeForLiveSend 
} from "@/lib/zodiac/zodiac-stars-payment-safety-review";

export default function StarsPaymentSafetyReviewDashboardPage() {
  const reviewItems = getStarsPaymentSafetyReviewItems();
  const ownerDecisions = getStarsPaymentOwnerDecisions();
  
  const isSafeForDraft = isStarsPaymentPrototypeSafeForInvoiceDraft();
  const isSafeForLive = isStarsPaymentPrototypeSafeForLiveSend();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <AphroditePageHeader
        title="Telegram Stars Payment Safety Review"
        badgeText="Package 131"
        description="Safety review only / No live invoice / No Telegram API call"
        icon={ShieldCheck}
      />

      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold text-rose-300 mb-2">
          <ShieldAlert className="h-5 w-5" />
          Strict Safety Boundaries Active
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-rose-200/80 text-sm">
          <li><strong>No live invoice:</strong> Telegram <code>sendInvoice</code> API will absolutely not be called.</li>
          <li><strong>No Telegram API call:</strong> No network calls are made to Telegram.</li>
          <li><strong>No bot token:</strong> No credentials are used or loaded.</li>
          <li><strong>No payment handler:</strong> No webhook logic exists yet.</li>
          <li><strong>No successful payment handler:</strong> No webhook listener exists for successes.</li>
          <li><strong>No entitlement creation:</strong> VIP unlocking is still fully disabled.</li>
          <li><strong>No VIP unlock:</strong> Routes remain guarded only visually.</li>
          <li><strong>No database write:</strong> No payment states or profiles are stored.</li>
          <li><strong>No active Telegram CTA logic changed:</strong> Daily/weekly bot messages remain unblocked.</li>
          <li><strong>No production launch:</strong> This remains a UI/read-only exploration.</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-100 flex items-center gap-2 mb-4">
            <CheckSquare className="h-5 w-5 text-indigo-400" />
            1. Current Prototype Status
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-indigo-200 font-medium">Safe for Invoice Draft Builder:</span>
                {isSafeForDraft ? (
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-bold uppercase tracking-wider">Yes</span>
                ) : (
                  <span className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded text-xs font-bold uppercase tracking-wider">No</span>
                )}
              </div>
              <p className="text-indigo-300/80 text-xs">
                The prototype statically blocks all real actions, so drafting the UI invoice payload shape is safe.
              </p>
            </div>
            
            <div className="p-4 bg-slate-950/50 border border-slate-800/50 rounded-lg text-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 font-medium">Safe for Live Send:</span>
                {isSafeForLive ? (
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-bold uppercase tracking-wider">Yes</span>
                ) : (
                  <span className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> No
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs">
                Live sending remains completely blocked. No webhook or database infrastructure is ready to catch a real payment.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="font-semibold text-slate-100 flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            2. Owner Decisions Required
          </h2>
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {ownerDecisions.map((decision, idx) => (
              <div key={idx} className="p-3 bg-slate-950/50 border border-slate-800/50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-slate-300">{decision.decision}</span>
                  {decision.required && (
                    <span className="text-[10px] text-amber-400/80 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded">Required</span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mb-1">
                  Default: <span className="text-indigo-300">{decision.recommendedDefault}</span>
                </div>
                <div className="text-xs text-slate-500 italic">
                  {decision.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-100 mb-4">3. Safety Review Matrix</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {reviewItems.map((item, idx) => (
            <div key={idx} className={`p-4 rounded-lg border ${
              item.status === 'blocked-before-live' ? 'bg-rose-950/10 border-rose-900/30' : 
              item.status === 'passed-for-prototype' ? 'bg-emerald-950/10 border-emerald-900/30' :
              item.status === 'requires-owner-approval' ? 'bg-amber-950/10 border-amber-900/30' :
              'bg-slate-950/50 border-slate-800'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-200 text-sm">{item.area}</h3>
                <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  item.status === 'blocked-before-live' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                  item.status === 'passed-for-prototype' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  item.status === 'requires-owner-approval' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-slate-500/10 text-slate-400 border-slate-500/20'
                }`}>
                  {item.status.replace(/-/g, ' ')}
                </span>
              </div>
              
              <div className="text-xs text-slate-400 mb-2 border-b border-slate-800/50 pb-2">
                <span className="font-medium text-slate-300">Evidence:</span> {item.currentEvidence.join(" ")}
              </div>
              
              {item.forbiddenNow.length > 0 && (
                <div className="text-xs text-rose-300/80 mt-2">
                  <span className="font-medium text-rose-400 block mb-1">Forbidden Now:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {item.forbiddenNow.map((req, i) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              )}
              
              {item.requiredBeforeInvoiceDraft.length > 0 && (
                <div className="text-xs text-indigo-300/80 mt-2">
                  <span className="font-medium text-indigo-400 block mb-1">Blocked Before Draft:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {item.requiredBeforeInvoiceDraft.map((req, i) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              )}

              {item.requiredBeforeLiveSend.length > 0 && (
                <div className="text-xs text-amber-300/80 mt-2">
                  <span className="font-medium text-amber-400 block mb-1">Blocked Before Live Send:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {item.requiredBeforeLiveSend.map((req, i) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
        <div>
          <h2 className="font-semibold text-emerald-300 mb-1 flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Safe Next Package
          </h2>
          <p className="text-sm text-emerald-200/80">
            Package 132 may be <strong>Telegram Stars Invoice Draft Builder</strong>, since this safety review confirms the static prototype limits are intact.
          </p>
        </div>
      </div>
      
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6">
        <h2 className="font-semibold text-indigo-300 mb-3">Links</h2>
        <ul className="space-y-2 text-sm">
          <li><Link href="/dashboard/networks/zodiac" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Zodiac Dashboard</Link></li>
          <li><Link href="/dashboard/networks/zodiac/telegram-stars-payment-prototype" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Telegram Stars Payment Prototype</Link></li>
          <li><Link href="/dashboard/networks/zodiac/vip-compatibility-report-preview" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">VIP Compatibility Report Preview</Link></li>
          <li><Link href="/dashboard/networks/zodiac/vip-access-boundary" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">VIP Access Boundary</Link></li>
          <li><Link href="/dashboard/networks/zodiac/entitlement-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Entitlement Foundation</Link></li>
        </ul>
      </div>
    </div>
  );
}
