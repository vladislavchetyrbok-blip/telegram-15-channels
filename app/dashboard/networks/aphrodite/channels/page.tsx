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

export default function AphroditeChannelRegistryPage() {
  requireDashboardPageAccess("/dashboard/networks/aphrodite/channels");

  const totalChannels = channels.length;
  const pausedLegacy = channels.filter((c) => c.status === "paused/inactive").length;
  const draftNew = channels.filter((c) => c.status === "draft").length;
  const active = channels.filter((c) => c.status === "active").length;
  const ready = channels.filter((c) => c.status === "ready").length;
  const errors = channels.filter((c) => c.status === "error").length;

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#f8fafc] px-4 py-6 text-slate-950 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-5">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900">
            <ChevronLeft className="h-4 w-4" />
            Dashboard / Афродита
          </Link>
          <div className="relative overflow-hidden rounded-lg border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300" />
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              <Server className="h-3.5 w-3.5" />
              Платформа Афродита
            </p>
            <div className="mt-5">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Aphrodite Channel Registry</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Unified view of all channels managed across the overarching Telegram publishing network. Zodiac remains one module inside Aphrodite.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6" data-qa="visual-summary">
              <SummaryMetric label="Всего каналов" value={totalChannels} tone="blue" />
              <SummaryMetric label="Пауза / Старая сеть Афродиты" value={pausedLegacy} tone="slate" />
              <SummaryMetric label="Новые черновики" value={draftNew} tone="amber" />
              <SummaryMetric label="Каналы Зодиака (Готовы)" value={active} tone="emerald" />
              <SummaryMetric label="Готовы к запуску" value={ready} tone="emerald" />
              <SummaryMetric label="Ошибки" value={errors} tone="rose" />
            </div>
          </div>
        </header>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-950">Channel Details</h2>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <Activity className="h-3.5 w-3.5 text-blue-500" />
              Read-Only View
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {channels.map((channel) => (
              <div key={channel.id} className="group relative flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-slate-950 group-hover:text-blue-900">{channel.name}</h3>
                    {channel.status === "paused/inactive" ? (
                      <PauseCircle className="h-5 w-5 text-slate-400" />
                    ) : channel.status === "draft" ? (
                      <FileText className="h-5 w-5 text-amber-500" />
                    ) : (
                      <RadioTower className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p className="flex justify-between">
                      <span className="font-medium text-slate-500">Module:</span>
                      <span className="font-medium text-slate-900">{channel.module}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-slate-500">Status:</span>
                      <StatusBadge status={channel.status} />
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-slate-500">Publishing Mode:</span>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs">{channel.publishingMode}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-slate-500">Next Content:</span>
                      <span>{channel.nextContentType}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex items-start gap-2 text-xs">
                    {channel.status === "paused/inactive" ? (
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    ) : (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    )}
                    <span className={channel.status === "paused/inactive" ? "text-slate-500" : "text-amber-700"}>
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
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <div className={`rounded-lg border p-3 ${tones[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ChannelStatus }) {
  const colors = {
    "paused/inactive": "bg-slate-100 text-slate-600 border-slate-200",
    "draft": "bg-amber-50 text-amber-700 border-amber-200",
    "active": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "ready": "bg-blue-50 text-blue-700 border-blue-200",
    "error": "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${colors[status]}`}>
      {status}
    </span>
  );
}
