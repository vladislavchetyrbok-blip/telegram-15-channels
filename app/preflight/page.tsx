import { PreflightPanel } from "@/components/PreflightPanel";

export default function PreflightPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">System preflight</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Preflight проверка</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Полный dry-run audit перед будущим ручным single-channel тестом. Реальная отправка Telegram сейчас
          отключена.
        </p>
      </div>

      <PreflightPanel />
    </div>
  );
}
