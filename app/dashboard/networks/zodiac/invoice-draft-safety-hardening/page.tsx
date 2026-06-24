import { createStarsInvoiceDraft } from "@/lib/zodiac/zodiac-telegram-stars-invoice-draft";
import { simulateSendInvoiceBoundary, simulateAnswerPreCheckoutQueryBoundary } from "@/lib/zodiac/zodiac-invoice-draft-safety-hardening";
import { ShieldAlert, AlertTriangle, ArrowRight, ServerCrash, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function InvoiceDraftSafetyHardeningPage() {
  const dummyUserRef = "test_user_hardening_123";
  const draft = createStarsInvoiceDraft({ productCode: "vip_compatibility_deep_report", userRef: dummyUserRef });

  // Simulate the gateways
  const sendInvoiceSimulation = await simulateSendInvoiceBoundary(draft);
  const preCheckoutSimulation = await simulateAnswerPreCheckoutQueryBoundary("test_query_123");

  return (
    <div className="min-h-screen bg-black text-slate-200 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
            <span>Zodiac Payment Matrix / Security</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">Invoice Draft Safety Hardening</h1>
          <p className="text-slate-400 max-w-2xl text-lg">
            This module provides the final mock API gateway. It acts as an ironclad barrier, intercepting simulated live calls and strictly enforcing the local-only constraints before anything hits the real Telegram API or database.
          </p>
        </header>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-medium text-white flex items-center space-x-2">
            <ServerCrash className="w-5 h-5 text-rose-500" />
            <span>sendInvoice Mock API Gateway</span>
          </h2>

          <div className="bg-black/50 p-4 rounded-lg font-mono text-sm space-y-2 border border-slate-800">
            <div className="text-slate-500">{`// Attempting to dispatch live invoice payload...`}</div>
            <div className="text-slate-300">Payload Source: <span className="text-blue-400">ZodiacStarsInvoiceDraft</span></div>
            <div className="text-slate-300">Target Endpoint: <span className="text-purple-400">api.telegram.org/bot&lt;TOKEN&gt;/sendInvoice</span></div>
          </div>

          <div className="bg-rose-950/30 border border-rose-900/50 rounded-lg p-4 flex items-start space-x-4">
            <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <h3 className="text-rose-500 font-medium">Gateway Intercepted Request</h3>
              <p className="text-rose-200/70 text-sm">{sendInvoiceSimulation.message}</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 uppercase">Layer</div>
                  <div className="text-sm font-medium text-slate-300">{sendInvoiceSimulation.layer}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 uppercase">Rejection Reason</div>
                  <div className="text-sm font-medium text-rose-400">{sendInvoiceSimulation.rejectionReason}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">No live invoice</span>
            <span className="px-2 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">No Telegram API call</span>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-medium text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-rose-500" />
            <span>answerPreCheckoutQuery Mock API Gateway</span>
          </h2>

          <div className="bg-black/50 p-4 rounded-lg font-mono text-sm space-y-2 border border-slate-800">
            <div className="text-slate-500">{`// Incoming webhook: pre_checkout_query...`}</div>
            <div className="text-slate-300">Query ID: <span className="text-blue-400">test_query_123</span></div>
          </div>

          <div className="bg-rose-950/30 border border-rose-900/50 rounded-lg p-4 flex items-start space-x-4">
            <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <h3 className="text-rose-500 font-medium">Gateway Intercepted Response</h3>
              <p className="text-rose-200/70 text-sm">{preCheckoutSimulation.message}</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 uppercase">Layer</div>
                  <div className="text-sm font-medium text-slate-300">{preCheckoutSimulation.layer}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 uppercase">Rejection Reason</div>
                  <div className="text-sm font-medium text-rose-400">{preCheckoutSimulation.rejectionReason}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/50">
          <Link
            href="/dashboard/networks/zodiac/telegram-stars-invoice-draft"
            className="flex items-center space-x-3 p-4 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 transition-colors group"
          >
            <div className="flex-1">
              <div className="text-sm text-slate-400 mb-1">Previous Stage</div>
              <div className="font-medium text-slate-200 group-hover:text-white transition-colors">Invoice Draft Builder</div>
            </div>
          </Link>

          <Link
            href="/dashboard/networks/zodiac/real-implementation-path"
            className="flex items-center justify-between p-4 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 transition-colors group"
          >
            <div>
              <div className="text-sm text-slate-400 mb-1">Review Framework</div>
              <div className="font-medium text-slate-200 group-hover:text-white transition-colors">Real Implementation Path</div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
          </Link>

          <Link
            href="/dashboard/networks/zodiac/aphrodite-product-remediation"
            className="flex items-center justify-between p-4 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 transition-colors group"
          >
            <div>
              <div className="text-sm text-slate-400 mb-1">Product Plan</div>
              <div className="font-medium text-slate-200 group-hover:text-white transition-colors">Aphrodite Product Remediation</div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
