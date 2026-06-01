import Link from "next/link";
import { Bot, CalendarPlus, PenSquare, Rocket, ShieldCheck } from "lucide-react";
import { getUnifiedSystemStatus } from "@/lib/unified-system-status";

export async function Header() {
  const status = await getUnifiedSystemStatus();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[#070b14]/86 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">Telegram network dashboard</p>
          <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            Реальная массовая публикация не запускается автоматически. Автопубликация включается только после preflight.
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Управление сетью из {status.channelsTotal} каналов</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/posts/new"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            <PenSquare className="h-4 w-4" />
            Создать пост
          </Link>
          <Link href="/generation" className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-panel px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100">
            <Bot className="h-4 w-4" />
            Сгенерировать AI
          </Link>
          <Link href="/calendar" className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-panel px-4 text-sm font-semibold text-slate-200 transition hover:border-blue-300/40 hover:text-blue-100">
            <CalendarPlus className="h-4 w-4" />
            Запланировать
          </Link>
          <Link href="/publishing-center" className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-4 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/15">
            <Rocket className="h-4 w-4" />
            Центр публикаций
          </Link>
          <span className="inline-flex h-10 items-center rounded-md border border-line bg-black/20 px-3 text-sm text-slate-400">
            Ready: <span className="ml-2 text-cyan-200">{status.content.readyToPublish}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
