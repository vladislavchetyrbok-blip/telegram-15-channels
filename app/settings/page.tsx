import { Settings } from "lucide-react";
import { NetworkModeOverview } from "@/components/NetworkModeOverview";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">MVP Mode</p>
        <h2 className="mt-2 text-3xl font-semibold text-white flex items-center gap-3">
          <Settings className="h-8 w-8 text-cyan-400" />
          Настройки
        </h2>
        <div className="mt-6 rounded-lg border border-line bg-panel/82 p-6 shadow-glow max-w-2xl">
          <p className="text-sm leading-6 text-slate-300">
            Раздел «Настройки» в MVP-режиме.
            Конфигурация Telegram API, генерации визуалов и системных лимитов временно заблокирована в UI.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            * Настройки осуществляются напрямую через файлы конфигурации (code-level) или .env для безопасности.
          </p>
        </div>
      </div>
      <NetworkModeOverview />
    </div>
  );
}
