"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface QualityItem {
  postId: string;
  channelId: string;
  title: string;
  textLength: number;
  textQuality: "strong" | "medium" | "weak";
  imageQuality: "strong" | "medium" | "weak";
  telegramImageReady: boolean;
  placeholderDetected: boolean;
  imageUrl: string;
  telegramImagePath: string;
  issues: string[];
}

interface QualityAudit {
  ok: boolean;
  checked: number;
  weakText: number;
  weakImage: number;
  strong: number;
  medium: number;
  weak: number;
  channelsWithTwoQualityPosts: number;
  items: QualityItem[];
}

export function PostQualityPanel() {
  const [audit, setAudit] = useState<QualityAudit | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"all" | "weak" | "ready">("all");
  const [message, setMessage] = useState("Проверка качества ещё не запускалась.");

  useEffect(() => {
    void loadAudit();
  }, []);

  async function loadAudit() {
    try {
      setBusy(true);
      const response = await fetch("/api/posts/quality", { cache: "no-store" });
      const payload = (await response.json()) as QualityAudit;
      setAudit(payload);
      setMessage(payload.ok ? "Все посты имеют strong/medium качество." : "Есть слабые тексты или картинки.");
    } finally {
      setBusy(false);
    }
  }

  async function improveWeak() {
    try {
      setBusy(true);
      const response = await fetch("/api/posts/quality", { method: "POST" });
      const payload = await response.json();
      setAudit(payload.after);
      setMessage(`Улучшение завершено. Проверено: ${payload.checked}. Слабых текстов было: ${payload.weakTextBefore}. Слабых картинок было: ${payload.weakImageBefore}. Перегенерировано: ${payload.regeneratedPosts}.`);
    } finally {
      setBusy(false);
    }
  }

  async function improveImagesOnly() {
    try {
      setBusy(true);
      const response = await fetch("/api/telegram/post-images", { method: "POST" });
      const payload = await response.json();
      await loadAudit();
      setMessage(`Картинки для Telegram подготовлены. Проверено: ${payload.checked}. OK: ${payload.telegramImageStatusOk}. PNG создано: ${payload.pngOrJpgCreated}. Ошибок: ${payload.failed}.`);
    } finally {
      setBusy(false);
    }
  }

  const rows = useMemo(() => {
    const source = audit?.items ?? [];
    if (filter === "weak") return source.filter((item) => item.textQuality === "weak" || item.imageQuality === "weak");
    if (filter === "ready") return source.filter((item) => item.textQuality !== "weak" && item.imageQuality !== "weak" && item.telegramImageReady);
    return source;
  }, [audit?.items, filter]);

  return (
    <section className="rounded-lg border border-cyan-300/25 bg-cyan-300/5 p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Post quality</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Качество постов и картинок</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Публиковать можно только strong или medium. Weak материалы не отправляются: короткий текст, битая кодировка, запрещённая валюта, SVG или placeholder-картинка требуют доработки.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadAudit}
            disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-sm font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} />
            Проверить качество
          </button>
          <button
            type="button"
            onClick={improveWeak}
            disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className={cn("h-4 w-4", busy && "animate-pulse")} />
            Улучшить посты и картинки
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-6">
        <Metric label="Checked" value={audit?.checked ?? 0} tone="dry" />
        <Metric label="Weak text" value={audit?.weakText ?? 0} tone={(audit?.weakText ?? 0) ? "error" : "ok"} />
        <Metric label="Weak image" value={audit?.weakImage ?? 0} tone={(audit?.weakImage ?? 0) ? "error" : "ok"} />
        <Metric label="Strong" value={audit?.strong ?? 0} tone="ok" />
        <Metric label="Medium" value={audit?.medium ?? 0} tone="warn" />
        <Metric label="2 quality posts" value={audit?.channelsWithTwoQualityPosts ?? 0} tone={(audit?.channelsWithTwoQualityPosts ?? 0) === 15 ? "ok" : "warn"} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", "weak", "ready"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              "h-9 rounded-md border px-3 text-xs font-semibold",
              filter === item ? "border-cyan-300 bg-cyan-300/15 text-cyan-100" : "border-line text-slate-300",
            )}
          >
            {item === "all" ? "Все" : item === "weak" ? "Только weak" : "Ready posts"}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-xs">
          <thead className="text-slate-500">
            <tr>
              <th className="border-b border-line px-3 py-2">Post</th>
              <th className="border-b border-line px-3 py-2">Text quality</th>
              <th className="border-b border-line px-3 py-2">Image quality</th>
              <th className="border-b border-line px-3 py-2">Length</th>
              <th className="border-b border-line px-3 py-2">Telegram image ready</th>
              <th className="border-b border-line px-3 py-2">Placeholder detected</th>
              <th className="border-b border-line px-3 py-2">Image</th>
              <th className="border-b border-line px-3 py-2">Issues</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.postId} className="text-slate-300">
                <td className="border-b border-line/60 px-3 py-2">
                  <div className="font-semibold text-slate-100">{item.title}</div>
                  <div className="mt-1 font-mono text-[11px] text-slate-500">{item.channelId} / {item.postId}</div>
                </td>
                <td className={cn("border-b border-line/60 px-3 py-2", qualityTone(item.textQuality))}>{item.textQuality}</td>
                <td className={cn("border-b border-line/60 px-3 py-2", qualityTone(item.imageQuality))}>{item.imageQuality}</td>
                <td className="border-b border-line/60 px-3 py-2">{item.textLength}</td>
                <td className={cn("border-b border-line/60 px-3 py-2", item.telegramImageReady ? "text-emerald-100" : "text-rose-100")}>{item.telegramImageReady ? "yes" : "no"}</td>
                <td className={cn("border-b border-line/60 px-3 py-2", item.placeholderDetected ? "text-rose-100" : "text-emerald-100")}>{item.placeholderDetected ? "yes" : "no"}</td>
                <td className="border-b border-line/60 px-3 py-2">
                  <div className="max-w-[260px] truncate font-mono text-[11px]">{item.imageUrl}</div>
                  <div className="max-w-[260px] truncate font-mono text-[11px] text-cyan-200">{item.telegramImagePath}</div>
                </td>
                <td className="border-b border-line/60 px-3 py-2 text-slate-400">{item.issues.length ? item.issues.join(", ") : "none"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 rounded-md border border-line bg-slate-950/60 p-3 text-sm text-slate-300">{message}</p>
    </section>
  );
}

function qualityTone(value: "strong" | "medium" | "weak") {
  if (value === "strong") return "text-emerald-100";
  if (value === "medium") return "text-amber-100";
  return "text-rose-100";
}

function Metric({ label, value, tone }: { label: string; value: number; tone: "ok" | "warn" | "error" | "dry" }) {
  return (
    <div className="rounded-md border border-line bg-slate-950/50 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={cn("mt-2 text-xl font-semibold", tone === "ok" && "text-emerald-100", tone === "warn" && "text-amber-100", tone === "error" && "text-rose-100", tone === "dry" && "text-cyan-100")}>{value}</p>
    </div>
  );
}
