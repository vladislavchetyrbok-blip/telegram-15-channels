import React from "react";
import Link from "next/link";
import { FileCode, AlertCircle, ShieldAlert, CheckCircle2, Lock } from "lucide-react";
import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import { 
  createStarsInvoiceDraft, 
  getStarsInvoiceDraftBoundaries, 
  isStarsInvoiceDraftSafeForLocalUse,
  isStarsInvoiceDraftSafeForLiveSend
} from "@/lib/zodiac/zodiac-telegram-stars-invoice-draft";

export default function TelegramStarsInvoiceDraftDashboardPage() {
  const boundaries = getStarsInvoiceDraftBoundaries();
  
  // Create a deterministic draft for local review
  const draft = createStarsInvoiceDraft({
    productCode: "vip_compatibility_deep_report",
    userRef: "test_local_user_123"
  });

  const isLocalSafe = isStarsInvoiceDraftSafeForLocalUse(draft);
  const isLiveSafe = isStarsInvoiceDraftSafeForLiveSend(draft);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <AphroditePageHeader
        title="Telegram Stars Invoice Draft Builder"
        badgeText="Package 132"
        description="Invoice draft only / No live send / No Telegram API call"
        icon={FileCode}
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
                  <li><Link href="/dashboard/networks/zodiac/invoice-draft-safety-hardening" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Invoice Draft Safety Hardening</Link></li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-100 flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            Local Validation Rules
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg border border-slate-800">
              <span className="text-sm text-slate-300">Local UI Construction Safe</span>
              {isLocalSafe ? (
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-bold uppercase tracking-wider">Yes</span>
              ) : (
                <span className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded text-xs font-bold uppercase tracking-wider">No</span>
              )}
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg border border-slate-800">
              <span className="text-sm text-slate-300">Live Send Safe</span>
              {!isLiveSafe ? (
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-bold uppercase tracking-wider">Blocked Correctly</span>
              ) : (
                <span className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded text-xs font-bold uppercase tracking-wider">Vulnerable</span>
              )}
            </div>
            
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Lock className="h-3 w-3 text-slate-500" /> 
                Currency is forced strictly to <strong>{draft.currency}</strong>
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Lock className="h-3 w-3 text-slate-500" /> 
                Token is strictly <strong>{draft.providerTokenMode}</strong>
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Lock className="h-3 w-3 text-slate-500" /> 
                Prices length must be exactly <strong>1</strong> (actual: {draft.prices.length})
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Lock className="h-3 w-3 text-slate-500" /> 
                Requires Explicit Owner Approval: <strong>{draft.requiresOwnerApprovalBeforeSend ? 'True' : 'False'}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm overflow-hidden flex flex-col">
          <h2 className="font-semibold text-slate-100 flex items-center gap-2 mb-4">
            <FileCode className="h-5 w-5 text-indigo-400" />
            Draft Payload Example
          </h2>
          <div className="flex-1 bg-slate-950 rounded border border-slate-800 p-4 overflow-auto custom-scrollbar text-xs font-mono text-slate-300">
            <pre>
              {JSON.stringify(draft, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-400" />
          Blocked Before Live Send
        </h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {boundaries.map((item, idx) => (
            <div key={idx} className={`p-4 rounded-lg border ${
              item.status === 'blocked-before-live-send' ? 'bg-rose-950/10 border-rose-900/30' : 
              item.status === 'draft-only' ? 'bg-emerald-950/10 border-emerald-900/30' :
              item.status === 'future-pre-checkout' || item.status === 'future-successful-payment' || item.status === 'blocked' ? 'bg-amber-950/10 border-amber-900/30' :
              'bg-slate-950/50 border-slate-800'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-200 text-sm">{item.area}</h3>
                <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  item.status === 'blocked-before-live-send' || item.status === 'blocked' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                  item.status === 'draft-only' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  item.status.includes('future') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-slate-500/10 text-slate-400 border-slate-500/20'
                }`}>
                  {item.status.replace(/-/g, ' ')}
                </span>
              </div>
              
              {item.allowedNow.length > 0 && (
                <div className="text-xs text-emerald-300/80 mt-2">
                  <span className="font-medium text-emerald-400 block mb-1">Allowed Now:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {item.allowedNow.map((req, i) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              )}

              {item.blockedUntil.length > 0 && (
                <div className="text-xs text-amber-300/80 mt-2">
                  <span className="font-medium text-amber-400 block mb-1">Blocked Until:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {item.blockedUntil.map((req, i) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
        <h2 className="font-semibold text-emerald-300 mb-2">Safe Next Package</h2>
        <p className="text-sm text-emerald-200/80">
          Package 133 may be <strong>Invoice Draft Safety Hardening</strong> or <strong>Owner Review Request</strong>. No live calls are allowed yet.
        </p>
      </div>
      
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6">
        <h2 className="font-semibold text-indigo-300 mb-3">Links</h2>
        <ul className="space-y-2 text-sm">
          <li><Link href="/dashboard/networks/zodiac" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Zodiac Dashboard</Link></li>
          <li><Link href="/dashboard/networks/zodiac/stars-payment-safety-review" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Stars Payment Safety Review</Link></li>
          <li><Link href="/dashboard/networks/zodiac/telegram-stars-payment-prototype" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Telegram Stars Payment Prototype</Link></li>
          <li><Link href="/dashboard/networks/zodiac/vip-compatibility-report-preview" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">VIP Compatibility Report Preview</Link></li>
          <li><Link href="/dashboard/networks/zodiac/vip-access-boundary" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">VIP Access Boundary</Link></li>
          <li><Link href="/dashboard/networks/zodiac/entitlement-foundation" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Entitlement Foundation</Link></li>
        </ul>
      </div>
    </div>
  );
}
