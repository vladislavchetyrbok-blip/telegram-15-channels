"use client";

import { Terminal } from "lucide-react";

export function ZodiacCommandReference() {
  return (
    <div className="rounded-xl border border-line bg-panel/50 p-6 shadow-glow">
      <div className="flex items-center gap-3 border-b border-line pb-4">
        <Terminal className="h-5 w-5 text-cyan-400" />
        <h2 className="text-xl font-semibold text-white">Local Tools Reference</h2>
      </div>

      <div className="mt-4 space-y-6">
        <p className="text-sm text-slate-300">
          Zodiac content workflow is powered by safe local Node.js scripts. 
          Run these from your terminal to manage content locally.
          <br />
          <strong className="text-emerald-400">All commands below are strictly read-only or local JSON generation. No real publish!</strong>
        </p>

        <div className="space-y-4">
          <CommandBlock 
            title="1. Generate Plan" 
            desc="Generates a local weekly JSON plan."
            cmd="npm run zodiac:generate-plan -- --start-date 2026-06-13 --days 7 --style luxury-mystic" 
          />
          <CommandBlock 
            title="2. Validate Plan" 
            desc="Checks JSON structure and rules."
            cmd="npm run zodiac:validate-plan -- ./exports/zodiac-weekly-plan-2026-06-13.json" 
          />
          <CommandBlock 
            title="3. Review Plan" 
            desc="Editorial review of content quality."
            cmd="npm run zodiac:review-plan -- ./exports/zodiac-weekly-plan-2026-06-13.json" 
          />
          <CommandBlock 
            title="4. Dry-Run Publish" 
            desc="Simulates publishing locally."
            cmd="npm run zodiac:dry-run -- ./exports/zodiac-weekly-plan-2026-06-13.json" 
          />
          <CommandBlock 
            title="Safe Pipeline (All-in-one)" 
            desc="Runs generate -> validate -> review -> dry-run."
            cmd="npm run zodiac:pipeline -- --start-date 2026-06-13 --days 7 --style luxury-mystic" 
          />
          <CommandBlock 
            title="Healthcheck" 
            desc="Audits the entire local Zodiac toolchain."
            cmd="npm run zodiac:healthcheck -- --full" 
          />
        </div>
      </div>
    </div>
  );
}

function CommandBlock({ title, desc, cmd }: { title: string, desc: string, cmd: string }) {
  return (
    <div className="rounded border border-slate-700/50 bg-slate-900/50 p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-medium text-cyan-200">{title}</span>
        <span className="text-xs text-slate-400">{desc}</span>
      </div>
      <code className="block select-all rounded bg-black/40 p-2 font-mono text-xs text-slate-300">
        {cmd}
      </code>
    </div>
  );
}
