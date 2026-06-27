import React from "react";
import { VipCompatibilityReportClient } from "./VipCompatibilityReportClient";

export const metadata = {
  title: "VIP Compatibility Deep Report",
  description: "UI preview only. No payment or real VIP unlock.",
};

export default function VipCompatibilityReportPage() {
  return (
    <div
      data-aphrodite-telegram-webview-mobile-polish="package-244"
      className="aphrodite-mobile-shell zodiac-miniapp-safe-area bg-slate-950 p-3 min-[390px]:p-4 md:p-8"
    >
      <div className="aphrodite-scroll-safe aphrodite-safe-bottom mx-auto max-w-3xl space-y-5 min-[390px]:space-y-6">
        <header className="mb-6 min-w-0 min-[390px]:mb-8">
          <h1 className="aphrodite-wrap-anywhere text-2xl font-bold text-slate-100 min-[390px]:text-3xl">VIP Compatibility Deep Report</h1>
          <p className="aphrodite-wrap-anywhere text-slate-400 mt-2">Discover the deepest layers of your connection.</p>
        </header>

        <main className="min-w-0">
          <VipCompatibilityReportClient />
        </main>
      </div>
    </div>
  );
}
