import { Lightbulb } from "lucide-react";

export default function ContentPlanPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">MVP Mode</p>
        <h2 className="mt-2 text-3xl font-semibold text-white flex items-center gap-3">
          <Lightbulb className="h-8 w-8 text-cyan-400" />
          Контент-план
        </h2>
        <div className="mt-6 rounded-lg border border-line bg-panel/82 p-6 shadow-glow max-w-2xl">
          <p className="text-sm leading-6 text-slate-300">
            Раздел «Контент-план» в MVP-режиме. 
            Здесь вы сможете настраивать рубрикаторы, темы и общую стратегию для каждого из 15 каналов.
          </p>
        </div>
      </div>
    </div>
  );
}
