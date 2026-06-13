import { notFound } from "next/navigation";
import { zodiacChannels, zodiacNetwork } from "@/data/zodiacNetwork";
import { zodiacChannelConnections } from "@/data/zodiacChannelConnections";
import { zodiacLaunchKit } from "@/data/zodiacLaunchKit";
import { CheckCircle2, ShieldAlert, Send, FileText, Image as ImageIcon } from "lucide-react";
import fs from "fs";
import path from "path";

interface ZodiacChannelPageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  return zodiacChannels.map((channel) => ({ id: channel.id }));
}

export default function ZodiacChannelPage({ params }: ZodiacChannelPageProps) {
  const channel = zodiacChannels.find((item) => item.id === params.id);

  if (!channel) {
    notFound();
  }

  const connection = zodiacChannelConnections.find((c) => c.id === channel.id);
  const launchInfo = zodiacLaunchKit.find((l) => l.id === channel.id);

  // Check missing assets safely at build/render time
  let missingAssets = 0;
  const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  for (const day of weekdays) {
    const filePath = path.join(process.cwd(), "public", "assets", "zodiac-weekly", channel.id, `${day}.jpg`);
    if (!fs.existsSync(filePath)) {
      missingAssets++;
    }
  }

  let assetStatusText = "Все ассеты готовы";
  let assetTone = "emerald";
  if (missingAssets === 7) {
    assetStatusText = "Ожидает визуалы";
    assetTone = "slate";
  } else if (missingAssets > 0) {
    assetStatusText = "Ассеты частично готовы";
    assetTone = "amber";
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-panel/82 p-6 shadow-glow">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-100">
                {channel.type}
              </span>
              <span className="rounded border border-slate-500/20 bg-slate-500/10 px-2 py-1 text-xs text-slate-300">
                Элемент: {channel.element}
              </span>
              <span className="rounded border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-xs text-amber-100">
                {channel.status === "planned" ? "Запланирован" : channel.status}
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              {channel.emoji} {channel.ruName}
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-400">{channel.shortDescription}</p>
          </div>
          <div className="rounded-lg border border-line bg-black/20 p-4 xl:w-80 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tone profile</p>
              <p className="mt-1 text-sm leading-6 text-slate-300">{channel.tone}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Визуальный профиль</p>
              <p className="mt-1 text-sm leading-6 text-slate-300">{channel.visualPromptSeed}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className={`rounded-lg border border-${assetTone}-500/30 bg-${assetTone}-500/5 p-4`}>
          <div className="flex items-center gap-3">
            <ImageIcon className={`h-5 w-5 text-${assetTone}-400`} />
            <div>
              <p className="text-sm font-semibold text-white">Еженедельные ассеты</p>
              <p className={`text-xs text-${assetTone}-400`}>{assetStatusText}</p>
            </div>
          </div>
        </div>

        {connection ? (
          <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
            <div className="flex items-center gap-3">
              {connection.telegramChannelId ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-amber-400" />
              )}
              <div>
                <p className="text-sm font-semibold text-white">Telegram статус</p>
                <p className="text-xs text-slate-400">
                  {connection.telegramChannelId ? "Подключен" : "Черновик (не подключен)"}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {launchInfo && (
        <section className="rounded-lg border border-line bg-panel p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Launch Kit</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-400">Закрепленное сообщение (Draft)</p>
              <div className="mt-2 rounded bg-black/40 p-3 font-mono text-sm text-slate-300 whitespace-pre-wrap">
                {launchInfo.pinnedMessageDraft}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Предлагаемые @username</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded bg-cyan-500/20 px-2 py-1 text-xs text-cyan-200">
                  @{launchInfo.primaryUsernameSuggestion}
                </span>
                {launchInfo.alternativeUsernameSuggestions.map((u) => (
                  <span key={u} className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-400">
                    @{u}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
