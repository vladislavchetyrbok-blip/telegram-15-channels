"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Download, ImagePlus, RefreshCw, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { VisualEngineSettingsPanel } from "@/components/VisualEngineSettingsPanel";

interface PremiumVisualItem {
  id: string;
  postId: string;
  channelId: string;
  channelName: string;
  contentPlanDate: string;
  contentTopic: string;
  title: string;
  imageUrl: string;
  telegramImagePath: string;
  telegramImageStatus: string;
  imageQuality: "strong" | "medium" | "weak";
  imageDimensions: { width: number; height: number } | null;
  visualStyle: string | null;
  visualPreset: string | null;
  visualVersion: string | null;
  visualGeneratedAt: string | null;
  provider: string | null;
  fallbackProvider: string | null;
  fallbackUsed: boolean;
  premiumVersion: string | null;
  source: string | null;
  status: string;
}

interface PremiumVisualState {
  summary: {
    total: number;
    premiumV2: number;
    telegramImageOk: number;
    strong: number;
    medium: number;
    weak: number;
    localTemplate?: number;
    fallbackUsed?: number;
    providerMetadataMissing?: number;
  };
  items: PremiumVisualItem[];
  report: any;
}

export function VisualPreviewPanel() {
  const [state, setState] = useState<PremiumVisualState | null>(null);
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedPostId, setSelectedPostId] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("Premium visual preview is ready. Telegram is not touched.");

  const load = useCallback(async () => {
    const response = await fetch("/api/visuals/premium", { cache: "no-store" });
    const payload = (await response.json()) as PremiumVisualState;
    setState(payload);
    if (!selectedPostId && payload.items[0]) setSelectedPostId(payload.items[0].postId);
  }, [selectedPostId]);

  useEffect(() => {
    void load();
  }, [load]);

  const channels = useMemo(() => Array.from(new Map((state?.items ?? []).map((item) => [item.channelId, item.channelName])).entries()), [state]);
  const filteredItems = useMemo(() => {
    const source = state?.items ?? [];
    return selectedChannel === "all" ? source : source.filter((item) => item.channelId === selectedChannel);
  }, [selectedChannel, state]);
  const selectedItem = useMemo(() => (state?.items ?? []).find((item) => item.postId === selectedPostId) ?? filteredItems[0] ?? null, [filteredItems, selectedPostId, state]);

  async function generate(postId?: string, all = false) {
    setBusy(all ? "all" : postId ?? "selected");
    try {
      const response = await fetch("/api/visuals/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(all ? { all: true } : { postId }),
      });
      const payload = await response.json();
      setMessage(payload.ok ? "Premium visual generated. Telegram was not touched." : "Premium visual generation failed. Check the report.");
      await load();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-cyan-300/25 bg-cyan-300/5 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Premium visuals</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Visual preview</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Preview and regenerate 4:5 Telegram-ready post covers. The generator writes PNG files on disk and never sends anything to Telegram.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={load} className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-sm font-semibold text-slate-200">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => generate(undefined, true)}
              disabled={busy !== null}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              <Wand2 className={cn("h-4 w-4", busy === "all" && "animate-spin")} />
              Regenerate all premium visuals
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-6">
        <Metric label="Posts" value={state?.summary.total ?? 0} tone="dry" />
        <Metric label="premium_v2" value={state?.summary.premiumV2 ?? 0} tone="ok" />
        <Metric label="Telegram OK" value={state?.summary.telegramImageOk ?? 0} tone="ok" />
        <Metric label="Strong" value={state?.summary.strong ?? 0} tone="ok" />
        <Metric label="Medium" value={state?.summary.medium ?? 0} tone="warn" />
        <Metric label="Weak" value={state?.summary.weak ?? 0} tone={(state?.summary.weak ?? 0) ? "error" : "ok"} />
      </section>

      <VisualEngineSettingsPanel compact />

      <section className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <div className="rounded-lg border border-line bg-panel/70 p-4">
          <div className="grid gap-3">
            <label className="text-xs uppercase tracking-[0.18em] text-slate-500">Channel</label>
            <select value={selectedChannel} onChange={(event) => setSelectedChannel(event.target.value)} className="h-10 rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-200">
              <option value="all">All channels</option>
              {channels.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>

            <label className="text-xs uppercase tracking-[0.18em] text-slate-500">Post</label>
            <select value={selectedItem?.postId ?? ""} onChange={(event) => setSelectedPostId(event.target.value)} className="h-10 rounded-md border border-line bg-slate-950 px-3 text-sm text-slate-200">
              {filteredItems.map((item) => (
                <option key={item.postId} value={item.postId}>
                  {item.channelName} · {item.contentPlanDate} · {item.title}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={!selectedItem || busy !== null}
              onClick={() => selectedItem && generate(selectedItem.postId)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-300 px-4 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              <ImagePlus className={cn("h-4 w-4", busy === selectedItem?.postId && "animate-spin")} />
              Generate premium visual
            </button>
            {selectedItem ? (
              <a href={selectedItem.imageUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line px-4 text-sm font-semibold text-slate-200">
                <Download className="h-4 w-4" />
                Open file
              </a>
            ) : null}
          </div>

          {selectedItem ? (
            <div className="mt-5 space-y-2 text-sm text-slate-300">
              <Info label="Preset" value={selectedItem.visualPreset ?? "not generated"} />
              <Info label="Provider" value={selectedItem.provider ?? "missing"} />
              <Info label="Fallback provider" value={selectedItem.fallbackProvider ?? "local_template"} />
              <Info label="Fallback used" value={selectedItem.fallbackUsed ? "true" : "false"} />
              <Info label="Version" value={selectedItem.premiumVersion ?? selectedItem.visualVersion ?? "not generated"} />
              <Info label="Source" value={selectedItem.source ?? "template"} />
              <Info label="Quality" value={selectedItem.imageQuality} />
              <Info label="Telegram image" value={selectedItem.telegramImageStatus} />
              <Info label="Dimensions" value={selectedItem.imageDimensions ? `${selectedItem.imageDimensions.width}x${selectedItem.imageDimensions.height}` : "unknown"} />
              <Info label="Generated" value={selectedItem.visualGeneratedAt ?? "not generated"} />
              <Info label="Path" value={selectedItem.telegramImagePath} mono />
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-line bg-slate-950/70 p-4">
          {selectedItem ? (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">{selectedItem.channelName}</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">{selectedItem.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">{selectedItem.contentTopic}</p>
                </div>
                <span className={cn("rounded-full border px-2.5 py-1 text-xs", selectedItem.imageQuality === "strong" ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-amber-300/30 bg-amber-300/10 text-amber-100")}>
                  {selectedItem.imageQuality}
                </span>
              </div>
              <Image
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                width={selectedItem.imageDimensions?.width ?? 1080}
                height={selectedItem.imageDimensions?.height ?? 1350}
                className="mt-4 max-h-[760px] w-auto rounded-md border border-line bg-black object-contain"
                unoptimized
              />
            </div>
          ) : (
            <p className="text-sm text-slate-400">No post selected.</p>
          )}
        </div>
      </section>

      <p className="rounded-lg border border-line bg-slate-950/70 p-4 text-sm text-slate-300">{message}</p>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: "ok" | "warn" | "error" | "dry" }) {
  return (
    <div className="rounded-lg border border-line bg-panel/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={cn("mt-2 text-2xl font-semibold", tone === "ok" && "text-emerald-100", tone === "warn" && "text-amber-100", tone === "error" && "text-rose-100", tone === "dry" && "text-cyan-100")}>{value}</p>
    </div>
  );
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-line bg-slate-950/60 px-3 py-2">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={cn("mt-1 break-words text-slate-200", mono && "font-mono text-xs")}>{value}</p>
    </div>
  );
}
