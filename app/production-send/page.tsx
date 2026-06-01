import { ProductionSendPanel } from "@/components/ProductionSendPanel";

export default function ProductionSendPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Production flow</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Боевой запуск</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Подготовка будущей реальной отправки Telegram через safety gate и ручное подтверждение. Сейчас
          TELEGRAM_DRY_RUN=true, поэтому production остаётся заблокирован.
        </p>
      </div>

      <ProductionSendPanel />
    </div>
  );
}
