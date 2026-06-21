"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface UnifiedStatus {
  telegram: {
    tokenConfigured: boolean;
    getMeOk: boolean;
    botAccessOk: number;
    lastError: string | null;
  };
  autopublish: {
    enabled: boolean;
    schedulerStatus: string;
    workerRunning: boolean;
  };
  content: {
    readyToPublish: number;
  };
}

export function UnifiedStatusStrip() {
  const [status, setStatus] = useState<UnifiedStatus | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/system/unified-status", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (mounted && payload) setStatus(payload as UnifiedStatus);
      })
      .catch(() => {
        if (mounted) setStatus(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const schedulerStatus = status?.autopublish.schedulerStatus === "stopped" ? "остановлен" : 
                          status?.autopublish.schedulerStatus === "running" ? "работает" : 
                          status?.autopublish.schedulerStatus === "error" ? "ошибка" : "загрузка";

  const schedulerLabel = status && !status.autopublish.enabled && status.autopublish.schedulerStatus === "stopped" ? "остановлен" : schedulerStatus;

  return (
    <section className="border-b border-line bg-[#08101f]/86 px-4 py-3 sm:px-6 lg:px-8">
      <details className="md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg border border-line bg-black/20 px-3 py-2 text-sm font-semibold text-slate-200">
          <span>Статус системы</span>
          <span className="text-xs font-medium text-slate-500">Развернуть</span>
        </summary>
        <div className="mt-2 grid gap-2">
          <StatusGrid status={status} schedulerLabel={schedulerLabel} />
        </div>
        <StatusNote />
      </details>

      <div className="hidden md:block">
        <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
          <StatusGrid status={status} schedulerLabel={schedulerLabel} />
        </div>
        <StatusNote />
      </div>
    </section>
  );
}

function StatusGrid({ status, schedulerLabel }: { status: UnifiedStatus | null; schedulerLabel: string }) {
  return (
    <>
      <MiniStatus label="Токен Telegram" value={status ? (status.telegram.tokenConfigured ? "настроен" : "не указан") : "загрузка"} ok={Boolean(status?.telegram.tokenConfigured)} />
      <MiniStatus label="Проверка бота" value={status ? (status.telegram.getMeOk ? "OK" : "ошибка") : "загрузка"} ok={Boolean(status?.telegram.getMeOk)} />
      <MiniStatus label="Доступ бота" value={status ? `${status.telegram.botAccessOk}/15` : "загрузка"} ok={(status?.telegram.botAccessOk ?? 0) > 0} />
      <MiniStatus label="Готовые посты" value={status?.content.readyToPublish ?? "загрузка"} ok={(status?.content.readyToPublish ?? 0) > 0} />
      <MiniStatus label="Воркер" value={status ? (status.autopublish.workerRunning ? "работает" : "не запущен") : "загрузка"} ok={Boolean(status?.autopublish.workerRunning)} />
      <MiniStatus label="Планировщик" value={schedulerLabel} ok={status ? (status.autopublish.enabled ? status.autopublish.schedulerStatus !== "error" : true) : false} />
    </>
  );
}

function StatusNote() {
  return (
    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
      <AlertCircle className="h-3.5 w-3.5 text-amber-500/70" />
      <p>Техническое предупреждение: Моковые логи и статистика не блокируют работу. Настоящие публикации отключены.</p>
    </div>
  );
}

function MiniStatus({ label, value, ok }: { label: string; value: string | number; ok: boolean }) {
  return (
    <div className="rounded-md border border-line bg-black/20 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={cn("mt-1 truncate text-sm font-semibold", ok ? "text-emerald-100" : "text-amber-100")}>{value}</p>
    </div>
  );
}
