import type { ReactNode } from "react";
import { HeartHandshake } from "lucide-react";
import { modes, relationshipModes } from "./constants";
import type { Mode, RelationshipMode, WizardStep } from "./types";

export function StepProgress({ publicMode, step }: { publicMode: boolean; step: WizardStep }) {
  return (
    <div className={publicMode ? "grid grid-cols-3 gap-2" : "grid grid-cols-3 gap-2"}>
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className={
            item <= step
              ? publicMode
                ? "h-1.5 rounded-full bg-gradient-to-r from-fuchsia-300 via-rose-300 to-amber-200"
                : "h-1.5 rounded-full bg-violet-500"
              : publicMode
                ? "h-1.5 rounded-full bg-white/12"
                : "h-1.5 rounded-full bg-slate-200"
          }
        />
      ))}
    </div>
  );
}

export function ModeSelector({ publicMode, mode, onChange }: { publicMode: boolean; mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <section className="grid grid-cols-3 gap-2">
      {modes.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={
            publicMode
              ? `min-w-0 rounded-lg border px-2 py-3 text-center text-xs shadow-sm transition ${
                  mode === item.id ? "border-amber-200/70 bg-amber-200/15 text-amber-50" : "border-white/10 bg-white/6 text-slate-300 hover:border-fuchsia-200/40"
                }`
              : `min-w-0 rounded-lg border px-2 py-3 text-center text-xs shadow-sm transition ${
                  mode === item.id ? "border-violet-300 bg-violet-50 text-violet-900" : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200"
                }`
          }
        >
          <span className="block font-semibold">{item.label}</span>
          <span className="mt-1 block leading-snug">{item.caption}</span>
        </button>
      ))}
    </section>
  );
}

export function RelationshipModeSelector({ publicMode, mode, onChange }: { publicMode: boolean; mode: RelationshipMode; onChange: (mode: RelationshipMode) => void }) {
  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {relationshipModes.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={
            publicMode
              ? `min-w-0 rounded-lg border px-2 py-3 text-left text-xs shadow-sm transition ${
                  mode === item.id ? "border-rose-200/70 bg-rose-200/15 text-rose-50" : "border-white/10 bg-white/6 text-slate-300 hover:border-rose-200/40"
                }`
              : `min-w-0 rounded-lg border px-2 py-3 text-left text-xs shadow-sm transition ${
                  mode === item.id ? "border-rose-300 bg-rose-50 text-rose-900" : "border-slate-200 bg-white text-slate-700 hover:border-rose-200"
                }`
          }
        >
          <span className="block font-semibold">{item.label}</span>
          <span className="mt-1 block leading-snug">{item.caption}</span>
        </button>
      ))}
    </section>
  );
}

export function WizardCard({ publicMode, stepLabel, title, children }: { publicMode: boolean; stepLabel: string; title: string; children: ReactNode }) {
  return (
    <div
      className={
        publicMode
          ? "min-w-0 rounded-lg border border-white/12 bg-white/10 p-4 shadow-[0_18px_60px_rgba(8,13,30,0.38)] backdrop-blur transition-all duration-300"
          : "min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300"
      }
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={publicMode ? "text-xs font-semibold text-amber-100" : "text-xs font-semibold text-violet-700"}>{stepLabel}</p>
          <h2 className={publicMode ? "mt-1 text-xl font-semibold text-white" : "mt-1 text-xl font-semibold text-slate-950"}>{title}</h2>
        </div>
        <span
          className={
            publicMode
              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-fuchsia-200/20 bg-fuchsia-200/10 text-fuchsia-100"
              : "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-violet-100 bg-violet-50 text-violet-700"
          }
        >
          <HeartHandshake className="h-5 w-5" />
        </span>
      </div>
      {children}
    </div>
  );
}

export function primaryButtonClass(publicMode: boolean) {
  return publicMode
    ? "inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-amber-100/40 bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400 px-4 text-sm font-semibold text-white shadow-lg shadow-rose-950/30 transition hover:brightness-110"
    : "inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-violet-500 bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700";
}

export function secondaryButtonClass(publicMode: boolean) {
  return publicMode
    ? "inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/8 px-4 text-sm font-semibold text-slate-100 transition hover:bg-white/12"
    : "inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";
}

export function primaryTinyButtonClass(publicMode: boolean) {
  return publicMode
    ? "rounded-lg border border-amber-200/55 bg-amber-200/15 px-3 py-2 text-xs font-semibold text-amber-50"
    : "rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-900";
}

export function secondaryTinyButtonClass(publicMode: boolean) {
  return publicMode
    ? "rounded-lg border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-slate-200"
    : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700";
}

export function Field({ label, publicMode, children }: { label: string; publicMode?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className={publicMode ? "mb-1 block text-sm font-medium text-slate-200" : "mb-1 block text-sm font-medium text-slate-700"}>{label}</span>
      {children}
    </label>
  );
}
