import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  FileText,
  PauseCircle,
  RadioTower,
  Server,
} from "lucide-react";
import Link from "next/link";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";

export const dynamic = "force-dynamic";

type ChannelStatus = "paused/inactive" | "draft" | "active" | "ready" | "error";
type PublishMode = "disabled" | "dry-run" | "live";

interface ChannelRecord {
  id: string;
  name: string;
  module: string;
  status: ChannelStatus;
  publishingMode: PublishMode;
  nextContentType: string;
  safetyNote: string;
}

const channels: ChannelRecord[] = [
  // New Draft Channels
  {
    id: "aphrodite-currency",
    name: "Aphrodite Currency",
    module: "Currency",
    status: "draft",
    publishingMode: "dry-run",
    nextContentType: "Daily Rates",
    safetyNote: "Draft only - no live token",
  },
  {
    id: "aphrodite-crypto",
    name: "Aphrodite Crypto",
    module: "Crypto",
    status: "draft",
    publishingMode: "dry-run",
    nextContentType: "Market Update",
    safetyNote: "Draft only - no live token",
  },
  {
    id: "aphrodite-metals",
    name: "Aphrodite Metals",
    module: "Metals",
    status: "draft",
    publishingMode: "dry-run",
    nextContentType: "Commodity Watch",
    safetyNote: "Draft only - no live token",
  },
  // Legacy Telegram Network (15 channels)
  {
    id: "legacy-zodiac-general",
    name: "Zodiac General",
    module: "Zodiac",
    status: "paused/inactive",
    publishingMode: "disabled",
    nextContentType: "None",
    safetyNote: "Paused legacy channel — no publishing from Aphrodite yet",
  },
  {
    id: "legacy-zodiac-aries",
    name: "Zodiac Aries",
    module: "Zodiac",
    status: "paused/inactive",
    publishingMode: "disabled",
    nextContentType: "None",
    safetyNote: "Paused legacy channel — no publishing from Aphrodite yet",
  },
  {
    id: "legacy-zodiac-taurus",
    name: "Zodiac Taurus",
    module: "Zodiac",
    status: "paused/inactive",
    publishingMode: "disabled",
    nextContentType: "None",
    safetyNote: "Paused legacy channel — no publishing from Aphrodite yet",
  },
  {
    id: "legacy-zodiac-gemini",
    name: "Zodiac Gemini",
    module: "Zodiac",
    status: "paused/inactive",
    publishingMode: "disabled",
    nextContentType: "None",
    safetyNote: "Paused legacy channel — no publishing from Aphrodite yet",
  },
  {
    id: "legacy-zodiac-cancer",
    name: "Zodiac Cancer",
    module: "Zodiac",
    status: "paused/inactive",
    publishingMode: "disabled",
    nextContentType: "None",
    safetyNote: "Paused legacy channel — no publishing from Aphrodite yet",
  },
  {
    id: "legacy-zodiac-leo",
    name: "Zodiac Leo",
    module: "Zodiac",
    status: "paused/inactive",
    publishingMode: "disabled",
    nextContentType: "None",
    safetyNote: "Paused legacy channel — no publishing from Aphrodite yet",
  },
  {
    id: "legacy-zodiac-virgo",
    name: "Zodiac Virgo",
    module: "Zodiac",
    status: "paused/inactive",
    publishingMode: "disabled",
    nextContentType: "None",
    safetyNote: "Paused legacy channel — no publishing from Aphrodite yet",
  },
  {
    id: "legacy-zodiac-libra",
    name: "Zodiac Libra",
    module: "Zodiac",
    status: "paused/inactive",
    publishingMode: "disabled",
    nextContentType: "None",
    safetyNote: "Paused legacy channel — no publishing from Aphrodite yet",
  },
  {
    id: "legacy-zodiac-scorpio",
    name: "Zodiac Scorpio",
    module: "Zodiac",
    status: "paused/inactive",
    publishingMode: "disabled",
    nextContentType: "None",
    safetyNote: "Paused legacy channel — no publishing from Aphrodite yet",
  },
  {
    id: "legacy-zodiac-sagittarius",
    name: "Zodiac Sagittarius",
    module: "Zodiac",
    status: "paused/inactive",
    publishingMode: "disabled",
    nextContentType: "None",
    safetyNote: "Paused legacy channel — no publishing from Aphrodite yet",
  },
  {
    id: "legacy-zodiac-capricorn",
    name: "Zodiac Capricorn",
    module: "Zodiac",
    status: "paused/inactive",
    publishingMode: "disabled",
    nextContentType: "None",
    safetyNote: "Paused legacy channel — no publishing from Aphrodite yet",
  },
  {
    id: "legacy-zodiac-aquarius",
    name: "Zodiac Aquarius",
    module: "Zodiac",
    status: "paused/inactive",
    publishingMode: "disabled",
    nextContentType: "None",
    safetyNote: "Paused legacy channel — no publishing from Aphrodite yet",
  },
  {
    id: "legacy-zodiac-pisces",
    name: "Zodiac Pisces",
    module: "Zodiac",
    status: "paused/inactive",
    publishingMode: "disabled",
    nextContentType: "None",
    safetyNote: "Paused legacy channel — no publishing from Aphrodite yet",
  },
  {
    id: "legacy-real-estate",
    name: "Legacy Real Estate",
    module: "Real Estate",
    status: "paused/inactive",
    publishingMode: "disabled",
    nextContentType: "None",
    safetyNote: "Paused legacy channel — no publishing from Aphrodite yet",
  },
  {
    id: "legacy-unknown",
    name: "Legacy General",
    module: "Unknown",
    status: "paused/inactive",
    publishingMode: "disabled",
    nextContentType: "None",
    safetyNote: "Paused legacy channel — no publishing from Aphrodite yet",
  },
];

import { AphroditePageHeader } from "@/components/AphroditePageHeader";

export default function AphroditeChannelRegistryPage() {
  requireDashboardPageAccess("/dashboard/networks/aphrodite/channels");

  const totalChannels = channels.length;
  const pausedLegacy = channels.filter((c) => c.status === "paused/inactive").length;
  const draftNew = channels.filter((c) => c.status === "draft").length;
  const active = channels.filter((c) => c.status === "active").length;
  const ready = channels.filter((c) => c.status === "ready").length;
  const errors = channels.filter((c) => c.status === "error").length;

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <AphroditePageHeader
          title="Aphrodite Channel Registry"
          description="Unified view of all channels managed across the overarching Telegram publishing network. Zodiac remains one module inside Aphrodite."
          badgeText="Registry"
          icon={Server}
          safetyLocked={false}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6" data-qa="visual-summary">
          <SummaryMetric label="Всего каналов" value={totalChannels} tone="blue" />
          <SummaryMetric label="Пауза / Старая сеть Афродиты" value={pausedLegacy} tone="slate" />
          <SummaryMetric label="Новые черновики" value={draftNew} tone="amber" />
          <SummaryMetric label="Каналы Зодиака (Готовы)" value={active} tone="emerald" />
          <SummaryMetric label="Готовы к запуску" value={ready} tone="emerald" />
          <SummaryMetric label="Ошибки" value={errors} tone="rose" />
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Channel Details</h2>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 shadow-sm">
              <Activity className="h-3.5 w-3.5" />
              Read-Only View
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {channels.map((channel) => (
              <div key={channel.id} className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm transition hover:border-blue-500/30 hover:bg-slate-800/50">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">{channel.name}</h3>
                    {channel.status === "paused/inactive" ? (
                      <PauseCircle className="h-5 w-5 text-slate-500" />
                    ) : channel.status === "draft" ? (
                      <FileText className="h-5 w-5 text-amber-500" />
                    ) : (
                      <RadioTower className="h-5 w-5 text-blue-400" />
                    )}
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-400">
                    <p className="flex justify-between items-center">
                      <span className="font-medium text-slate-500">Module:</span>
                      <span className="font-medium text-slate-300">{channel.module}</span>
                    </p>
                    <p className="flex justify-between items-center">
                      <span className="font-medium text-slate-500">Status:</span>
                      <StatusBadge status={channel.status} />
                    </p>
                    <p className="flex justify-between items-center">
                      <span className="font-medium text-slate-500">Publishing Mode:</span>
                      <span className="rounded-md bg-slate-800 px-2 py-1 font-mono text-xs text-slate-300 border border-slate-700/50">{channel.publishingMode}</span>
                    </p>
                    <p className="flex justify-between items-center">
                      <span className="font-medium text-slate-500">Next Content:</span>
                      <span className="text-slate-300">{channel.nextContentType}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-5 border-t border-slate-800/80 pt-4">
                  <div className="flex items-start gap-2 text-xs">
                    {channel.status === "paused/inactive" ? (
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                    ) : (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                    )}
                    <span className={channel.status === "paused/inactive" ? "text-slate-500" : "text-amber-400/80"}>
                      {channel.safetyNote}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryMetric({ label, value, tone }: { label: string; value: number | string; tone: "blue" | "slate" | "amber" | "emerald" | "rose" }) {
  const tones = {
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    slate: "border-slate-500/20 bg-slate-500/10 text-slate-400",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    rose: "border-rose-500/20 bg-rose-500/10 text-rose-400",
  };

  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ChannelStatus }) {
  const colors = {
    "paused/inactive": "bg-slate-500/10 text-slate-400 border-slate-500/30",
    "draft": "bg-amber-500/10 text-amber-400 border-amber-500/30",
    "active": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    "ready": "bg-blue-500/10 text-blue-400 border-blue-500/30",
    "error": "bg-rose-500/10 text-rose-400 border-rose-500/30",
  };

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold tracking-wide ${colors[status]}`}>
      {status}
    </span>
  );
}
