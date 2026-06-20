"use client";

import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Settings, Shield, Server, Box, Key, Zap, CheckCircle2, Lock, ListTodo, Layers, Link as LinkIcon, Database, Activity, ExternalLink, RefreshCw , Sparkles } from "lucide-react";

function StatusBadge({ label, value, tone }: { label: string; value: string; tone: "emerald" | "amber" | "rose" | "slate" | "cyan" | "violet" }) {
  const bg = {
    emerald: "bg-emerald-900/10 border-emerald-900/30 text-emerald-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    rose: "bg-rose-900/10 border-rose-900/30 text-rose-800",
    slate: "bg-slate-50 border-slate-800 text-slate-800",
    cyan: "bg-cyan-50 border-cyan-200 text-cyan-800",
    violet: "bg-violet-50 border-violet-200 text-violet-800",
  }[tone];

  return (
    <div className={`flex flex-col justify-center rounded-md border px-4 py-3 ${bg}`}>
      <span className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</span>
      <span className="mt-1 font-semibold">{value}</span>
    </div>
  );
}

function SectionHeading({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-slate-400" />
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
    </div>
  );
}

export default function ZodiacSettingsPage() {
  const [dashboardAuthActive, setDashboardAuthActive] = useState(false);
  const [manualActions, setManualActions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Check local status for dashboard auth if we can (e.g. via local storage or existing fetch)
    fetch("/api/dashboard/auth/status")
      .then((res) => res.json())
      .then((data) => setDashboardAuthActive(data.enabled))
      .catch(() => setDashboardAuthActive(false));
      
    try {
      const stored = localStorage.getItem("zodiac-settings-manual-actions-v1");
      if (stored) {
        setManualActions(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleAction = (id: string) => {
    const next = { ...manualActions, [id]: !manualActions[id] };
    setManualActions(next);
    try {
      localStorage.setItem("zodiac-settings-manual-actions-v1", JSON.stringify(next));
    } catch (e) {}
  };

  const manualChecklist = [
    { id: "action_1", label: "Enable dashboard auth in Vercel" },
    { id: "action_2", label: "Redeploy production" },
    { id: "action_3", label: "Verify dashboard redirects to login" },
    { id: "action_4", label: "Run real phone QA on iPhone" },
    { id: "action_5", label: "Run real phone QA on Android" },
    { id: "action_6", label: "Invite first 5 users" },
    { id: "action_7", label: "Watch Zodiac Pulse" },
    { id: "action_8", label: "Record feedback in Zodiac Voice" },
    { id: "action_9", label: "Fix P0/P1" },
    { id: "action_10", label: "Only then consider 20 users" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
              <AphroditePageHeader
          title="Запуск Зодиака"
          description="Управление модулем Зодиак внутри Афродиты."
          badgeText="Обзор модуля"
          icon={Sparkles}
          safetyLocked={true}
          safetyMessage="Read-only mode"
        />

      <main className="mx-auto mt-8 max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-white">
              <Settings className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Настройки Зодиака</h1>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400 max-w-3xl">
            Read-only центр окружения, режимов, ссылок и ручных действий. Секреты не отображаются.
          </p>
        </div>

        {/* Environment Status Cards */}
        <section data-qa="settings-env-cards" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatusBadge 
            label="Dashboard Auth" 
            value={dashboardAuthActive ? "active" : "code-ready / pending env"} 
            tone={dashboardAuthActive ? "emerald" : "amber"} 
          />
          <StatusBadge label="Production Analytics" value="Redis active / local noop" tone="emerald" />
          <StatusBadge label="Telegram Bot" value="configured externally" tone="cyan" />
          
          <StatusBadge label="Mini App" value="active / public route" tone="emerald" />
          <StatusBadge label="Profile Sync" value="OFF" tone="slate" />
          <StatusBadge label="Payments / Stars" value="OFF" tone="slate" />
          
          <StatusBadge label="Weekly Live" value="OFF" tone="slate" />
          <StatusBadge label="Exact Astro" value="exact_unavailable" tone="slate" />
          <StatusBadge label="Server Writes" value="disabled intentionally" tone="slate" />
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Production Entry Points */}
          <section data-qa="settings-entry-points" className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
            <SectionHeading icon={LinkIcon} title="Production Entry Points" description="Ключевые внешние и внутренние маршруты." />
            
            <div className="space-y-4 font-mono text-xs">
              <div className="rounded border border-slate-100 bg-slate-50 p-3">
                <div className="mb-1 font-semibold text-slate-400 font-sans text-xs">Zodiac Mini:</div>
                <div className="break-all text-slate-800">https://t.me/zodiac_love_check_bot?startapp=compat</div>
              </div>
              
              <div className="rounded border border-slate-100 bg-slate-50 p-3">
                <div className="mb-1 font-semibold text-slate-400 font-sans text-xs">Zodiac Control (Overview):</div>
                <div className="break-all text-slate-800">https://telegram-15-channels.vercel.app/dashboard/networks/zodiac</div>
              </div>

              <div className="rounded border border-slate-100 bg-slate-50 p-3">
                <div className="mb-1 font-semibold text-slate-400 font-sans text-xs">Zodiac Pulse (Analytics):</div>
                <div className="break-all text-slate-800">https://telegram-15-channels.vercel.app/dashboard/networks/zodiac/analytics</div>
              </div>

              <div className="rounded border border-slate-100 bg-slate-50 p-3">
                <div className="mb-1 font-semibold text-slate-400 font-sans text-xs">Launch Control:</div>
                <div className="break-all text-slate-800">https://telegram-15-channels.vercel.app/dashboard/networks/zodiac/launch</div>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                <Link href="/dashboard/login" className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 font-sans text-xs font-medium text-slate-400 hover:bg-slate-200"><ExternalLink className="h-3 w-3"/> /dashboard/login</Link>
                <Link href="/dashboard/networks/zodiac/feedback" className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 font-sans text-xs font-medium text-slate-400 hover:bg-slate-200"><ExternalLink className="h-3 w-3"/> feedback</Link>
                <Link href="/dashboard/networks/zodiac/publishing" className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 font-sans text-xs font-medium text-slate-400 hover:bg-slate-200"><ExternalLink className="h-3 w-3"/> publishing</Link>
                <Link href="/dashboard/networks/zodiac/settings" className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 font-sans text-xs font-medium text-slate-400 hover:bg-slate-200"><ExternalLink className="h-3 w-3"/> settings</Link>
              </div>
            </div>
          </section>

          {/* Vercel Env Checklist */}
          <section data-qa="settings-vercel-env" className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
            <SectionHeading icon={Server} title="Vercel env checklist" description="Имена переменных. Не вставлять значения env в чат, docs, git или screenshots." />
            
            <div className="space-y-3">
              <div className="flex flex-col gap-1 rounded border border-slate-100 bg-slate-50 p-3">
                <code className="text-sm font-semibold text-slate-900">ZODIAC_DASHBOARD_AUTH_ENABLED</code>
                <span className="text-xs text-slate-400">Включает gate на `/dashboard`. Required before 20.</span>
              </div>
              
              <div className="flex flex-col gap-1 rounded border border-slate-100 bg-slate-50 p-3">
                <code className="text-sm font-semibold text-slate-900">ZODIAC_DASHBOARD_ADMIN_PASSWORD_SHA256</code>
                <span className="text-xs text-slate-400">Хэш пароля. Required before 20.</span>
              </div>

              <div className="flex flex-col gap-1 rounded border border-slate-100 bg-slate-50 p-3">
                <code className="text-sm font-semibold text-slate-900">ZODIAC_DASHBOARD_SESSION_SECRET</code>
                <span className="text-xs text-slate-400">Секрет для кук. Required before 20.</span>
              </div>

              <div className="flex flex-col gap-1 rounded border border-slate-100 bg-slate-50 p-3">
                <code className="text-sm font-semibold text-slate-900">ZODIAC_ANALYTICS_REDIS_URL</code>
                <span className="text-xs text-slate-400">Upstash URL. Required before first 5.</span>
              </div>

              <div className="flex flex-col gap-1 rounded border border-slate-100 bg-slate-50 p-3">
                <code className="text-sm font-semibold text-slate-900">ZODIAC_ANALYTICS_REDIS_TOKEN</code>
                <span className="text-xs text-slate-400">Upstash Token. Required before first 5.</span>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Mode Matrix */}
          <section data-qa="settings-mode-matrix" className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 shadow-sm overflow-x-auto">
            <SectionHeading icon={Layers} title="Mode Matrix" />
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Feature</th>
                  <th className="px-4 py-3 font-medium">Current mode</th>
                  <th className="px-4 py-3 font-medium">Production rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-slate-900/50">
                <tr><td className="px-4 py-2 font-medium text-slate-900">Dashboard auth</td><td className="px-4 py-2">code-ready / pending env</td><td className="px-4 py-2">enable before 20</td></tr>
                <tr><td className="px-4 py-2 font-medium text-slate-900">Analytics</td><td className="px-4 py-2">redis prod / noop local</td><td className="px-4 py-2">OK</td></tr>
                <tr><td className="px-4 py-2 font-medium text-slate-900">Feedback</td><td className="px-4 py-2">local-only</td><td className="px-4 py-2">OK for first 5</td></tr>
                <tr><td className="px-4 py-2 font-medium text-slate-900">Channel drafts</td><td className="px-4 py-2">local-only</td><td className="px-4 py-2">OK</td></tr>
                <tr><td className="px-4 py-2 font-medium text-slate-900">Content drafts</td><td className="px-4 py-2">local-only</td><td className="px-4 py-2">OK</td></tr>
                <tr><td className="px-4 py-2 font-medium text-slate-900">Publishing drafts</td><td className="px-4 py-2">local-only</td><td className="px-4 py-2">OK</td></tr>
                <tr><td className="px-4 py-2 font-medium text-slate-900">Live publish</td><td className="px-4 py-2"><span className="text-rose-600 font-semibold">disabled</span></td><td className="px-4 py-2">explicit approval only</td></tr>
                <tr><td className="px-4 py-2 font-medium text-slate-900">Payments</td><td className="px-4 py-2">off</td><td className="px-4 py-2">future</td></tr>
                <tr><td className="px-4 py-2 font-medium text-slate-900">Profile sync</td><td className="px-4 py-2">off</td><td className="px-4 py-2">future</td></tr>
                <tr><td className="px-4 py-2 font-medium text-slate-900">Server writes</td><td className="px-4 py-2"><span className="text-rose-600 font-semibold">disabled</span></td><td className="px-4 py-2">future after RBAC</td></tr>
              </tbody>
            </table>
          </section>

          {/* Manual Actions Panel */}
          <section data-qa="settings-manual-actions" className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
            <SectionHeading icon={ListTodo} title="Manual Actions" description="Локальный чеклист ручных шагов. Данные хранятся в LocalStorage." />
            <div className="space-y-2">
              {manualChecklist.map((action, i) => (
                <button
                  key={action.id}
                  onClick={() => toggleAction(action.id)}
                  className="flex w-full items-center gap-3 rounded-md border border-slate-800 bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <div className={`flex h-5 w-5 items-center justify-center rounded border ${manualActions[action.id] ? "border-emerald-500 bg-emerald-900/100 text-white" : "border-slate-300 bg-slate-900/50"}`}>
                    {manualActions[action.id] && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                  <span>{i + 1}. {action.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
