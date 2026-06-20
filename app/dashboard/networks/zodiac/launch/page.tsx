"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Activity, Shield, Users, Target, Phone, BarChart2, MessageSquare, Edit3, Settings } from "lucide-react";

type Tone = "emerald" | "amber" | "rose" | "slate";

function StatusBadge({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  const bg = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    rose: "bg-rose-50 border-rose-200 text-rose-800",
    slate: "bg-slate-50 border-slate-200 text-slate-800",
  }[tone];

  return (
    <div className={`flex flex-col justify-center rounded-md border px-4 py-3 ${bg}`}>
      <span className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</span>
      <span className="mt-1 font-semibold">{value}</span>
    </div>
  );
}

function LaunchChecklistGroup({ title, items }: { title: string; items: { label: string; checked: boolean }[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <label key={i} className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <input type="checkbox" readOnly checked={item.checked} className="h-4 w-4 rounded border-slate-300 text-violet-600" />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function ZodiacLaunchControlPage() {
  const [qaCount, setQaCount] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("zodiac-platform-real-phone-qa-v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        setQaCount(Object.values(parsed).filter(Boolean).length);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex text-sm font-medium text-slate-500">
            <Link href="/dashboard" className="hover:text-slate-900">Dashboard</Link>
            <span className="mx-2">/</span>
            <Link href="/dashboard/networks/zodiac" className="hover:text-slate-900">Zodiac OS</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900">Запуск</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <Play className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Launch Control</h1>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Контроль готовности Zodiac OS к первым пользователям, 20 пользователям и публичному запуску.
          </p>
        </div>

        <section data-qa="launch-status-cards" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatusBadge label="First 5 users" value={qaCount > 0 ? "GO" : "PENDING QA"} tone={qaCount > 0 ? "emerald" : "amber"} />
          <StatusBadge label="20 users" value="CONDITIONAL" tone="amber" />
          <StatusBadge label="Mass launch" value="STOP" tone="rose" />
          <StatusBadge label="Production auth" value="PENDING ENV" tone="amber" />
          
          <StatusBadge label="Analytics" value="Redis active" tone="emerald" />
          <StatusBadge label="Real Phone QA" value={qaCount > 0 ? `${qaCount} checked` : "pending/manual"} tone={qaCount > 0 ? "emerald" : "amber"} />
          <StatusBadge label="Feedback Center" value="ready" tone="emerald" />
          <StatusBadge label="Publishing" value="dry-run/manual only" tone="emerald" />
          
          <StatusBadge label="Payments/Stars" value="OFF" tone="slate" />
          <StatusBadge label="Weekly live" value="OFF" tone="slate" />
          <StatusBadge label="Profile sync" value="OFF" tone="slate" />
          <StatusBadge label="Exact astro" value="exact_unavailable" tone="slate" />
        </section>

        <section data-qa="launch-checklist" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-950">Launch Checklist (LocalStorage)</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <LaunchChecklistGroup title="Before first 5" items={[
              { label: "dashboard opens", checked: true },
              { label: "Mini App opens on iPhone", checked: qaCount > 0 },
              { label: "Mini App opens on Android", checked: qaCount > 0 },
              { label: "startapp=compat works", checked: qaCount > 0 },
              { label: "BackButton works", checked: qaCount > 0 },
              { label: "share works", checked: qaCount > 0 },
              { label: "feedback opens", checked: true },
              { label: "analytics receives events", checked: true },
              { label: "no P0 known", checked: true },
              { label: "no live publish needed", checked: true },
            ]} />
            <LaunchChecklistGroup title="Before 20" items={[
              { label: "first 5 completed", checked: false },
              { label: "average rating >= 7", checked: false },
              { label: "no unresolved P0", checked: true },
              { label: "no unresolved P1", checked: true },
              { label: "iPhone pass", checked: qaCount >= 11 },
              { label: "Android pass", checked: false },
              { label: "analytics funnel has feature usage", checked: false },
              { label: "feedback reviewed", checked: false },
              { label: "dashboard auth enabled in production", checked: false },
              { label: "no raw sensitive data visible", checked: true },
            ]} />
            <LaunchChecklistGroup title="Before mass launch" items={[
              { label: "20 users completed", checked: false },
              { label: "retention checked", checked: false },
              { label: "publishing stable", checked: false },
              { label: "auth enabled", checked: false },
              { label: "payments decision made", checked: false },
              { label: "support/feedback process ready", checked: false },
              { label: "weekly live plan approved or stays OFF", checked: false },
              { label: "public launch docs ready", checked: false },
            ]} />
          </div>
        </section>

        <section data-qa="launch-decision-matrix" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm overflow-x-auto">
          <h2 className="mb-4 text-xl font-semibold text-slate-950">Decision Matrix</h2>
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Required evidence</th>
                <th className="px-4 py-3 font-medium">Next action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Internal QA</td>
                <td className="px-4 py-3"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">DONE</span></td>
                <td className="px-4 py-3">Dev server checks, tests passing</td>
                <td className="px-4 py-3">Move to real phone</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">First 5 users</td>
                <td className="px-4 py-3"><span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">PENDING/GO</span></td>
                <td className="px-4 py-3">Real phone smoke pass</td>
                <td className="px-4 py-3">Invite 5 people, observe</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">20 users</td>
                <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">WAIT</span></td>
                <td className="px-4 py-3">First 5 sanitized review, 0 P0/P1</td>
                <td className="px-4 py-3">Expand audience slightly</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Public beta</td>
                <td className="px-4 py-3"><span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">STOP</span></td>
                <td className="px-4 py-3">20 users review, retention signal</td>
                <td className="px-4 py-3">Open public links</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Mass launch</td>
                <td className="px-4 py-3"><span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">STOP</span></td>
                <td className="px-4 py-3">Server ready, auth ready, scaling ready</td>
                <td className="px-4 py-3">Ads, big channels</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Commercial launch</td>
                <td className="px-4 py-3"><span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">STOP</span></td>
                <td className="px-4 py-3">Payments tested, legal ready</td>
                <td className="px-4 py-3">Enable stars/payments</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section data-qa="launch-cross-links" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/networks/zodiac/analytics" className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-violet-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                <BarChart2 className="h-5 w-5" />
              </div>
              <div className="font-medium text-slate-900">Zodiac Pulse</div>
            </div>
            <p className="mt-2 text-sm text-slate-600">Analytics funnel and user journey</p>
          </Link>
          <Link href="/dashboard/networks/zodiac/feedback" className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-violet-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="font-medium text-slate-900">Zodiac Voice</div>
            </div>
            <p className="mt-2 text-sm text-slate-600">Feedback and Real Phone QA section</p>
          </Link>
          <Link href="/dashboard/networks/zodiac/security" className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-violet-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div className="font-medium text-slate-900">Zodiac Shield</div>
            </div>
            <p className="mt-2 text-sm text-slate-600">Admin safety and auth status</p>
          </Link>
          <Link href="/dashboard/networks/zodiac/publishing" className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-violet-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                <Edit3 className="h-5 w-5" />
              </div>
              <div className="font-medium text-slate-900">Zodiac Publisher</div>
            </div>
            <p className="mt-2 text-sm text-slate-600">Publishing center</p>
          </Link>
          <Link href="/dashboard/networks/zodiac/settings" className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-violet-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                <Settings className="h-5 w-5" />
              </div>
              <div className="font-medium text-slate-900">Zodiac Settings</div>
            </div>
            <p className="mt-2 text-sm text-slate-600">Environment and manual actions</p>
          </Link>
          <div className="group rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                <Users className="h-5 w-5" />
              </div>
              <div className="font-medium text-slate-900">First Users Baseline Doc</div>
            </div>
            <p className="mt-2 text-xs text-slate-600 font-mono">docs/zodiac-first-users-analytics-baseline.md</p>
          </div>
        </section>

      </main>
    </div>
  );
}
