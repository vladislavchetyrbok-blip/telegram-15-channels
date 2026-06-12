import { Settings } from "lucide-react";
import { ZodiacSettingsDashboard } from "@/components/ZodiacSettingsDashboard";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Zodiac Control</p>
        <h2 className="mt-2 text-3xl font-semibold text-white flex items-center gap-3">
          <Settings className="h-8 w-8 text-cyan-400" />
          Настройки Zodiac Network
        </h2>
        <div className="mt-6 rounded-lg border border-line bg-panel/82 p-6 shadow-glow max-w-2xl">
          <p className="text-sm leading-6 text-slate-300">
            Управление сетью Zodiac.
            Публикация контента в Telegram и запись конфигураций осуществляются строго через безопасные локальные скрипты.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            * Данный интерфейс предназначен только для чтения состояния сети и просмотра референсов.
          </p>
        </div>
      </div>
      
      <ZodiacSettingsDashboard />
    </div>
  );
}
