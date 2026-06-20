"use client";

import Link from "next/link";
import { Bot, CalendarPlus, PenSquare, Rocket, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardLogoutButton } from "@/components/DashboardLogoutButton";

interface HeaderStatus {
  channelsTotal: number;
  readyToPublish: number;
}

export function Header() {
  const [status, setStatus] = useState<HeaderStatus>({ channelsTotal: 15, readyToPublish: 0 });

  useEffect(() => {
    let mounted = true;

    fetch("/api/system/unified-status", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!mounted || !payload) return;
        setStatus({
          channelsTotal: typeof payload.channelsTotal === "number" ? payload.channelsTotal : 15,
          readyToPublish: typeof payload.content?.readyToPublish === "number" ? payload.content.readyToPublish : 0,
        });
      })
      .catch(() => {
        if (mounted) setStatus({ channelsTotal: 15, readyToPublish: 0 });
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[#070b14]/86 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">Telegram network dashboard</p>
          <p className="mt-2 flex max-w-full items-start gap-2 rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-xs font-medium leading-5 text-slate-300 sm:inline-flex sm:items-center sm:rounded-full sm:py-1">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 sm:mt-0" />
            <span className="min-w-0 break-words [overflow-wrap:anywhere]">Реальная массовая публикация не запускается автоматически. Автопубликация включается только после preflight.</span>
          </p>
          <h1 className="mt-1 break-words text-xl font-semibold text-white [overflow-wrap:anywhere] sm:text-2xl">Управление сетью из {status.channelsTotal} каналов</h1>
        </div>
        <div className="flex min-w-0 max-w-full flex-wrap gap-2 xl:w-auto xl:justify-end">
          <Link
            href="/posts/new"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            <PenSquare className="h-4 w-4" />
            Создать пост
          </Link>
          <Link href="/generation" className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-line bg-panel px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100">
            <Bot className="h-4 w-4" />
            Сгенерировать AI
          </Link>
          <Link href="/calendar" className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-line bg-panel px-4 text-sm font-semibold text-slate-200 transition hover:border-blue-300/40 hover:text-blue-100">
            <CalendarPlus className="h-4 w-4" />
            Запланировать
          </Link>
          <Link href="/publishing-center" className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-4 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/15">
            <Rocket className="h-4 w-4" />
            Центр публикаций
          </Link>
          <span className="inline-flex h-10 shrink-0 items-center rounded-md border border-line bg-black/20 px-3 text-sm text-slate-400">
            Ready: <span className="ml-2 text-cyan-200">{status.readyToPublish}</span>
          </span>
          <DashboardLogoutButton />
        </div>
      </div>
    </header>
  );
}
