import React from "react";
import { VipCompatibilityReportClient } from "./VipCompatibilityReportClient";

export const metadata = {
  title: "VIP Compatibility Deep Report",
  description: "UI preview only. No payment or real VIP unlock.",
};

export default function VipCompatibilityReportPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">VIP Compatibility Deep Report</h1>
          <p className="text-slate-400 mt-2">Discover the deepest layers of your connection.</p>
        </header>

        <main>
          <VipCompatibilityReportClient />
        </main>
      </div>
    </div>
  );
}
