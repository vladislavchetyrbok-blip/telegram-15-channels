import { FileText } from "lucide-react";

export default function DraftsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">MVP Mode</p>
        <h2 className="mt-2 text-3xl font-semibold text-white flex items-center gap-3">
          <FileText className="h-8 w-8 text-cyan-400" />
          Черновики
        </h2>
        <div className="mt-6 rounded-lg border border-line bg-panel/82 p-6 shadow-glow max-w-2xl">
          <p className="text-sm leading-6 text-slate-300">
            Раздел «Черновики» работает в MVP-режиме.
            Здесь будут скапливаться посты, ожидающие проверки и редактирования перед публикацией.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            * Функция массового утверждения и тестовой отправки в Telegram временно недоступна.
          </p>
        </div>
      </div>
    </div>
  );
}
