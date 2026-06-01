"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoState {
  channelId: string;
  currentLogoUrl: string;
  customLogoUrl: string | null;
  customLogoFileName: string | null;
  customLogoUploadedAt: string | null;
  logoSource: "custom" | "generated";
  sourceLabel: "Мой логотип" | "Сгенерированный";
  status: "Мой логотип" | "Сгенерированный" | "fallback to generated";
  fileStatus: "logo OK" | "missing" | "fallback";
  approvalStatus: "missing" | "needs_review" | "approved" | "rejected";
  logoOk: boolean;
  browserUrl: string;
  fileSystemPath: string;
  fileExists: boolean;
  telegramAvatarStatus: "manual_configured" | "unknown" | "not_configured";
  telegramAvatarLabel: string;
}

export function ChannelLogoControl({
  channelId,
  compact,
}: {
  channelId: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<LogoState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function loadLogo() {
    const response = await fetch(`/api/channels/${channelId}/upload-logo`, { cache: "no-store" });
    const payload = (await response.json()) as LogoState;
    setState(payload);
  }

  useEffect(() => {
    void loadLogo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  async function upload(file?: File) {
    if (!file) return;

    try {
      setBusy(true);
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch(`/api/channels/${channelId}/upload-logo`, {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { ok: boolean; error?: string; display?: LogoState };
      if (!payload.ok || !payload.display) {
        throw new Error(payload.error ?? "Не удалось загрузить логотип.");
      }
      setState(payload.display);
      setMessage("Логотип загружен. Нужна ручная проверка.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка загрузки логотипа.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    try {
      setBusy(true);
      const response = await fetch(`/api/channels/${channelId}/upload-logo`, { method: "DELETE" });
      const payload = (await response.json()) as { ok: boolean; display: LogoState };
      setState(payload.display);
      setMessage("Мой логотип удалён. Используется сгенерированный логотип.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-md border border-line bg-slate-950/55 p-3",
        compact ? "space-y-2" : "space-y-3",
      )}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center gap-3">
        <div className={cn("overflow-hidden rounded-md border border-cyan-300/20 bg-slate-950", compact ? "h-12 w-12" : "h-16 w-16")}>
          {state?.currentLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={state.currentLogoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-500">
              <ImageIcon className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold text-cyan-100">Telegram-логотип: {state?.telegramAvatarLabel ?? "Настроен вручную в Telegram"}</p>
          <p className="truncate text-[11px] text-slate-400">Логотип в платформе: {state?.sourceLabel ?? "Сгенерированный"}</p>
          <p className="truncate text-[11px] text-slate-500">Статус файла: {state?.fileStatus ?? "logo OK"}</p>
          {!compact ? <p className="truncate text-[11px] text-slate-500">Картинка поста: обязательна</p> : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(event) => void upload(event.target.files?.[0])}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-2 text-xs font-semibold text-cyan-100 hover:border-cyan-200 disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          Загрузить логотип
        </button>
        <button
          type="button"
          disabled={busy || !state?.customLogoUrl}
          onClick={remove}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-rose-300/30 bg-rose-300/10 px-2 text-xs font-semibold text-rose-100 hover:border-rose-200 disabled:opacity-45"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Удалить мой логотип
        </button>
      </div>
      {message ? <p className="text-[11px] text-slate-400">{message}</p> : null}
    </div>
  );
}
