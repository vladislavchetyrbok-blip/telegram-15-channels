"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Cpu, RefreshCw, RotateCcw, Server, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VisualEngineState {
  ok: boolean;
  config: {
    imageProvider: string;
    fallbackProvider: string;
    imageAiEnabled: boolean;
    imageGenerationMode: string;
    imageHardwareProfile: string;
    imageWidth: number;
    imageHeight: number;
    imagePremiumStyle: boolean;
    comfyUiUrl: string;
    lastProviderError: string | null;
  };
  providers: Record<string, { available: boolean; status: string; error?: string | null; source?: string }>;
  comfyui: { available: boolean; status: string; url: string; error: string | null; latencyMs?: number };
  summary: {
    totalImages: number;
    localTemplate: number;
    premiumV2: number;
    telegramImageOk: number;
    strong: number;
    weak: number;
    providerMetadataMissing: number;
  };
  safety: { ok: boolean; reason: string | null; maxPreviewCount: number };
}

export function VisualEngineSettingsPanel({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<VisualEngineState | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("Visual engine is safe by default: local_template, AI disabled, low hardware profile.");

  const load = useCallback(async () => {
    const response = await fetch("/api/visuals/engine", { cache: "no-store" });
    const payload = (await response.json()) as VisualEngineState;
    setState(payload);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const canRunAiPreview = Boolean(state?.comfyui.available && state.config.imageHardwareProfile !== "low" && state.config.imageAiEnabled);
  const providerRows = useMemo(() => Object.entries(state?.providers ?? {}), [state]);

  async function run(action: string) {
    setBusy(action);
    try {
      const response = await fetch("/api/visuals/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = await response.json();
      setMessage(payload.result?.error ?? payload.comfyui?.error ?? payload.error ?? "Visual engine checked. Telegram was not touched.");
      await load();
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className={cn("rounded-lg border border-violet-300/25 bg-violet-300/5 p-4", !compact && "shadow-glow")}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-violet-200">Visual engine settings</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Image Provider architecture</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Current pipeline keeps premium_v2 images on local_template. ComfyUI/SDXL/FLUX are safe adapters only: no install, no model download, no mass AI generation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <EngineButton busy={busy === "check_engine"} onClick={() => run("check_engine")} icon={<RefreshCw className="h-4 w-4" />}>
            Проверить visual engine
          </EngineButton>
          <EngineButton busy={busy === "check_comfyui"} onClick={() => run("check_comfyui")} icon={<Server className="h-4 w-4" />}>
            Проверить ComfyUI
          </EngineButton>
          <EngineButton busy={busy === "generate_template_preview"} onClick={() => run("generate_template_preview")} icon={<Wand2 className="h-4 w-4" />}>
            Сгенерировать template preview
          </EngineButton>
          <EngineButton busy={busy === "generate_ai_preview"} disabled={!canRunAiPreview} onClick={() => run("generate_ai_preview")} icon={<Cpu className="h-4 w-4" />}>
            AI preview через ComfyUI
          </EngineButton>
          <EngineButton busy={busy === "reset_local_template"} onClick={() => run("reset_local_template")} icon={<RotateCcw className="h-4 w-4" />}>
            Вернуться на local_template
          </EngineButton>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Metric label="Provider" value={state?.config.imageProvider ?? "-"} tone="ok" />
        <Metric label="Fallback" value={state?.config.fallbackProvider ?? "-"} tone="dry" />
        <Metric label="Hardware" value={state?.config.imageHardwareProfile ?? "low"} tone="warn" />
        <Metric label="AI enabled" value={state?.config.imageAiEnabled ? "true" : "false"} tone={state?.config.imageAiEnabled ? "warn" : "ok"} />
        <Metric label="Size" value={state ? `${state.config.imageWidth}x${state.config.imageHeight}` : "-"} tone="dry" />
        <Metric label="ComfyUI" value={state?.comfyui.status ?? "not checked"} tone={state?.comfyui.available ? "ok" : "warn"} />
        <Metric label="premium_v2" value={state?.summary.premiumV2 ?? 0} tone="ok" />
        <Metric label="Weak" value={state?.summary.weak ?? 0} tone={(state?.summary.weak ?? 0) ? "error" : "ok"} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-md border border-line bg-slate-950/60 p-3 text-sm text-slate-300">
          <p className="font-semibold text-white">Provider status</p>
          <div className="mt-3 space-y-2">
            {providerRows.map(([provider, info]) => (
              <div key={provider} className="flex items-center justify-between gap-3 rounded border border-line bg-black/20 px-3 py-2">
                <span className="font-mono text-xs">{provider}</span>
                <span className={cn("text-xs", info.available ? "text-emerald-100" : "text-amber-100")}>{info.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-line bg-slate-950/60 p-3 text-sm text-slate-300">
          <p className="font-semibold text-white">Safety gate</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <Info label="Mode" value={state?.config.imageGenerationMode ?? "template_first"} />
            <Info label="ComfyUI URL" value={state?.config.comfyUiUrl ?? "-"} mono />
            <Info label="Fallback used" value={state?.summary.providerMetadataMissing ? "metadata missing" : "false"} />
            <Info label="Last provider error" value={state?.config.lastProviderError ?? state?.comfyui.error ?? "none"} />
          </div>
          {!state?.comfyui.available ? (
            <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-amber-100">
              ComfyUI is not available. This is safe: local_template remains active and generation will not crash.
            </p>
          ) : null}
          {state && !state.safety.ok ? <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-amber-100">{state.safety.reason}</p> : null}
        </div>
      </div>

      <p className="mt-4 rounded-md border border-line bg-slate-950/60 p-3 text-sm text-slate-300">{message}</p>
    </section>
  );
}

function EngineButton({
  children,
  icon,
  busy,
  disabled,
  onClick,
}: {
  children: ReactNode;
  icon: ReactNode;
  busy: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={busy || disabled}
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-md border border-violet-300/35 px-4 text-sm font-semibold text-violet-100 transition hover:bg-violet-300/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {icon}
      {children}
    </button>
  );
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone: "ok" | "warn" | "error" | "dry" }) {
  return (
    <div className="rounded-md border border-line bg-slate-950/60 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={cn("mt-2 truncate text-lg font-semibold", tone === "ok" && "text-emerald-100", tone === "warn" && "text-amber-100", tone === "error" && "text-rose-100", tone === "dry" && "text-cyan-100")}>{value}</p>
    </div>
  );
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-line bg-black/20 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={cn("mt-1 break-words text-slate-200", mono && "font-mono text-xs")}>{value}</p>
    </div>
  );
}
