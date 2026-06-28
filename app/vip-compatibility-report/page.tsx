import React from "react";
import { VipCompatibilityReportClient } from "./VipCompatibilityReportClient";

export const metadata = {
  title: "VIP preview совместимости",
  description: "Короткий VIP preview. Без оплаты.",
};

export default function VipCompatibilityReportPage() {
  return (
    <div
      data-aphrodite-telegram-webview-mobile-polish="package-244"
      className="aphrodite-mobile-shell zodiac-miniapp-safe-area bg-slate-950 p-3 min-[390px]:p-4 md:p-8"
    >
      <div className="aphrodite-scroll-safe aphrodite-safe-bottom mx-auto max-w-3xl space-y-4">
        <header className="mb-4 min-w-0">
          <h1 className="aphrodite-wrap-anywhere text-2xl font-bold text-slate-100">VIP preview совместимости</h1>
          <p className="aphrodite-wrap-anywhere mt-1 text-sm text-slate-400">Короткий premium-отчёт без оплаты.</p>
        </header>

        <main className="min-w-0">
          <VipCompatibilityReportClient />
        </main>
      </div>
    </div>
  );
}
