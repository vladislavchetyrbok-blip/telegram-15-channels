import React from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, CreditCard, Lock, LockOpen } from "lucide-react";
import { AphroditePageHeader } from "@/components/AphroditePageHeader";

export default function EntitlementFoundationPage() {
  return (
    <div className="space-y-8">
      <AphroditePageHeader
        title="Entitlement Model Foundation"
        description="Data model definition for linking users to products. Entitlement foundation only / No payment handler / No VIP unlock."
        badgeText="Package 126"
        icon={ShieldCheck}
      />

      <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-6 backdrop-blur-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-rose-300">
          <ShieldAlert className="h-5 w-5" />
          Strict Safety Boundaries Active
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-rose-200/80">
          <li><strong>No payment handler</strong> - This foundation does not process actual payments or interface with Telegram Stars.</li>
          <li><strong>No VIP unlock</strong> - This foundation does not open VIP routes or deliver gated content.</li>
          <li><strong>No subscription logic</strong> - This foundation defines the types for time-limited access, but does not manage billing cycles.</li>
          <li><strong>No Telegram API call</strong> - This foundation does not call the Telegram API.</li>
          <li><strong>No bot sending logic changed</strong> - Live production broadcasting remains untouched.</li>
          <li><strong>No live payment handler</strong> - Active Telegram CTA logic remains untouched.</li>
        </ul>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-violet-300">
            <Lock className="h-5 w-5" />
            What is an Entitlement?
          </h2>
          <p className="text-sm text-violet-200/70">
            An entitlement is a digital receipt that grants a validated Telegram user (from Package 124) access to a specific product catalog item (from Package 125). It bridges the gap between identity and commerce.
          </p>
          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-black/40 p-4 border border-violet-500/10">
              <h3 className="text-sm font-medium text-violet-300">Entitlement Statuses</h3>
              <ul className="mt-2 text-xs text-violet-200/60 list-disc pl-4 space-y-1">
                <li><code>draft</code>: Pre-payment intent.</li>
                <li><code>pending-payment</code>: Awaiting provider confirmation.</li>
                <li><code>active</code>: Access granted.</li>
                <li><code>expired</code>: Time-limited access ended.</li>
                <li><code>refunded</code> / <code>revoked</code>: Access removed.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-violet-300">
            <LockOpen className="h-5 w-5" />
            Access Types
          </h2>
          <p className="text-sm text-violet-200/70">
            Products define the price and name; entitlements define the access nature.
          </p>
          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-black/40 p-4 border border-violet-500/10">
              <h3 className="text-sm font-medium text-violet-300">Supported Access</h3>
              <ul className="mt-2 text-xs text-violet-200/60 list-disc pl-4 space-y-1">
                <li><code>one-time-report</code>: E.g., Natal Chart or Compatibility matrix.</li>
                <li><code>time-limited</code>: Access expires at a specific date.</li>
                <li><code>subscription</code>: Recurring access (Future only).</li>
                <li><code>preview-only</code>: Free local preview without payment.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-emerald-300">
          <CreditCard className="h-5 w-5" />
          Safe Next Package
        </h2>
        <p className="text-sm text-emerald-200/70">
          Now that the <strong>Telegram Identity</strong>, <strong>User Profile</strong>, <strong>Product Catalog</strong>, and <strong>Entitlement Model</strong> foundations exist in a strongly-typed manner, the next safe package is to define the <strong>VIP Access Boundary</strong> (Package 127). This will allow the dashboard to check for mock entitlements before rendering VIP views.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/dashboard/networks/zodiac/vip-access-boundary" className="inline-block bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors text-sm">
            View VIP Access Boundary
          </Link>
          <Link href="/dashboard/networks/zodiac/vip-compatibility-report-foundation" className="inline-block bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors text-sm">
            View VIP Compatibility Report
          </Link>
        </div>
      </div>
    </div>
  );
}
