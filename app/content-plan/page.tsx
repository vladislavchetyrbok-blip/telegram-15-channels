import { ContentPlanPanel } from "@/components/ContentPlanPanel";

export default function ContentPlanPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">AI editorial planner</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Контент-план</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Идеи для 15 Telegram-каналов создаются через LM Studio и остаются в dry-run режиме до ручного
          подтверждения редактором.
        </p>
      </div>

      <ContentPlanPanel />
    </div>
  );
}
