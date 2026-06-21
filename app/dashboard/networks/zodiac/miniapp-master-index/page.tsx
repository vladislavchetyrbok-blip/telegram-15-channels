import React from "react";
import Link from "next/link";
import { Layers, ShieldCheck, Activity, Smartphone, Server, FileText, Component } from "lucide-react";

export const metadata = {
  title: "Mini App Master Control Index",
};

const CATEGORIES = [
  {
    title: "UI / UX & Mock Implementation",
    icon: Smartphone,
    items: [
      { name: "Live Mini App Mock", href: "/miniapp", pkg: "109" },
      { name: "VIP Preview Mock", href: "/vip-preview", pkg: "109" },
      { name: "Birth Matrix", href: "/birth-matrix", pkg: "109" },
      { name: "Mystic Numbers", href: "/mystic-numbers", pkg: "109" },
      { name: "Affirmations", href: "/affirmations", pkg: "109" },
      { name: "Compatibility Flow", href: "/compatibility", pkg: "114" },
    ]
  },
  {
    title: "Safety & Verification",
    icon: ShieldCheck,
    items: [
      { name: "Link Smoke Matrix", href: "/dashboard/networks/zodiac/miniapp-link-smoke", pkg: "113" },
      { name: "Compatibility Flow Safety", href: "/dashboard/networks/zodiac/compatibility-flow-safety", pkg: "114" },
      { name: "Mini App Audit & Readiness", href: "/dashboard/networks/zodiac/miniapp-readiness", pkg: "112" },
      { name: "Route Safety Verification", href: "/dashboard/networks/zodiac/miniapp-route-safety", pkg: "111" },
      { name: "Production Risk Register & Gates", href: "/dashboard/networks/zodiac/miniapp-risk-register", pkg: "119" },
    ]
  },
  {
    title: "Architecture & Data",
    icon: Server,
    items: [
      { name: "Mini App Architecture Spec", href: "/dashboard/networks/zodiac/miniapp-architecture", pkg: "105" },
      { name: "Entitlement Data Model", href: "/dashboard/networks/zodiac/miniapp-entitlements", pkg: "116" },
      { name: "Backend Production Wiring", href: "/dashboard/networks/zodiac/miniapp-production-wiring", pkg: "117" },
    ]
  },
  {
    title: "Monetization & Launch",
    icon: Activity,
    items: [
      { name: "Monetization Architecture", href: "/dashboard/networks/zodiac/miniapp-monetization-architecture", pkg: "115" },
      { name: "Payment Provider Matrix", href: "/dashboard/networks/zodiac/miniapp-payment-matrix", pkg: "118" },
      { name: "Master Control Index", href: "/dashboard/networks/zodiac/miniapp-master-index", pkg: "120" },
    ]
  }
];

export default function MiniAppMasterIndexPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Layers className="h-8 w-8 text-indigo-500" />
          Mini App Master Control Index
        </h1>
        <p className="text-slate-400 mt-2">
          Unified index aggregating all Mini App documentation, safety checks, architecture specs, and mock routes (Packages 103–120).
        </p>
      </header>

      <div className="rounded-md bg-indigo-950/40 border border-indigo-900/50 p-4 mb-8">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-2">
          <Component className="h-5 w-5" />
          Mock Mode Active
        </div>
        <ul className="text-sm text-slate-300 list-disc pl-5 space-y-1">
          <li>All routes currently operate in isolation</li>
          <li>No live Telegram API calls are made</li>
          <li>No live database connections are active</li>
        </ul>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <section key={idx} className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col h-full">
              <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2 mb-4">
                <Icon className="h-5 w-5 text-slate-400" />
                {cat.title}
              </h2>
              <div className="flex-grow">
                <ul className="space-y-3">
                  {cat.items.map((item, i) => (
                    <li key={i} className="flex justify-between items-center group">
                      <Link 
                        href={item.href}
                        className="text-slate-300 hover:text-indigo-400 transition underline underline-offset-4 flex-grow"
                      >
                        {item.name}
                      </Link>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                        PKG {item.pkg}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>

      <section className="rounded-lg border border-slate-800 bg-slate-900/30 p-6 mt-8">
        <h3 className="text-lg font-medium text-slate-300 mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-500" />
          Zodiac Workspace
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Return to the primary Zodiac dashboard for global navigation.
        </p>
        <Link 
          href="/dashboard/networks/zodiac" 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-slate-800 text-slate-100 hover:bg-slate-700 h-10 py-2 px-4"
        >
          Back to Zodiac Dashboard
        </Link>
      </section>
    </div>
  );
}
