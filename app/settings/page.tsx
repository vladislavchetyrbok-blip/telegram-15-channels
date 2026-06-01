import { Cpu, Gauge, Send } from "lucide-react";
import { EnvironmentCard } from "@/components/EnvironmentCard";
import { LocalAiSettingsCard } from "@/components/LocalAiSettingsCard";
import { TelegramConnectionCard } from "@/components/TelegramConnectionCard";
import { VisualEngineSettingsPanel } from "@/components/VisualEngineSettingsPanel";
import { systemLimits, telegramBot } from "@/data/system";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Control room</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Настройки</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <LocalAiSettingsCard />

        <section className="rounded-lg border border-blue-300/20 bg-panel/82 p-6 shadow-glow">
          <div className="flex items-start gap-4">
            <div className="rounded-lg border border-blue-300/25 bg-blue-300/10 p-3 text-blue-200">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-blue-300">Telegram Bot</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{telegramBot.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{telegramBot.description}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <SettingMetric label="Bot mode" value={telegramBot.mode} />
            <SettingMetric label="Bot name" value={telegramBot.name} />
            <SettingMetric label="Status" value={telegramBot.status} tone="rose" />
            <SettingMetric label="Token" value={telegramBot.token} />
          </div>

          <button
            type="button"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-md border border-blue-300/30 bg-blue-300/10 px-4 text-sm font-semibold text-blue-100 transition hover:bg-blue-300/15"
          >
            <Send className="h-4 w-4" />
            Проверить Telegram Bot
          </button>
        </section>
      </div>

      <EnvironmentCard />

      <TelegramConnectionCard />

      <VisualEngineSettingsPanel />

      <section className="rounded-lg border border-line bg-panel/82 p-6 shadow-glow">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-slate-500/25 bg-slate-500/10 p-3 text-slate-200">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Системные лимиты</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Mock-квоты панели</h3>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {systemLimits.map((item) => {
            const percent = Math.round((item.value / item.max) * 100);

            return (
              <div key={item.label} className="rounded-md border border-line bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-300">{item.label}</p>
                  <Cpu className="h-4 w-4 text-cyan-300" />
                </div>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {item.value} <span className="text-sm text-slate-500">/ {item.max}</span>
                </p>
                <div className="mt-3 h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SettingMetric({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string;
  tone?: "rose" | "slate";
}) {
  const toneClass = {
    rose: "text-rose-100",
    slate: "text-white",
  };

  return (
    <div className="rounded-md border border-line bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={`mt-2 break-words text-sm font-semibold ${toneClass[tone]}`}>{value}</p>
    </div>
  );
}
