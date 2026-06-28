import type { ReactNode } from "react";
import { HeartHandshake } from "lucide-react";
import { modes, relationshipModes } from "./constants";
import type { Mode, RelationshipMode, WizardStep } from "./types";

export function StepProgress({ publicMode, step }: { publicMode: boolean; step: WizardStep }) {
  const labels = ["Вы", "Партнёр", "Результат"];

  return (
    <div
      className={publicMode ? "grid grid-cols-3 gap-2" : "grid grid-cols-3 gap-2"}
      data-aphrodite-compatibility-progress="package-239"
    >
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className={
            item <= step
              ? publicMode
                ? "min-w-0 rounded-lg border border-amber-200/25 bg-gradient-to-br from-fuchsia-300/18 via-rose-300/14 to-amber-200/16 p-2 shadow-[0_12px_34px_rgba(190,24,93,0.16)]"
                : "min-w-0 rounded-lg border border-violet-200 bg-violet-50 p-2"
              : publicMode
                ? "min-w-0 rounded-lg border border-white/10 bg-white/[0.055] p-2"
                : "min-w-0 rounded-lg border border-slate-200 bg-white p-2"
          }
        >
          <div className={publicMode ? "h-1.5 rounded-full bg-white/12" : "h-1.5 rounded-full bg-slate-100"}>
            <div
              className={
                item <= step
                  ? publicMode
                    ? "h-1.5 rounded-full bg-gradient-to-r from-fuchsia-300 via-rose-300 to-amber-200"
                    : "h-1.5 rounded-full bg-violet-500"
                  : "h-1.5 rounded-full bg-transparent"
              }
            />
          </div>
          <p className={publicMode ? "mt-2 truncate text-[11px] font-semibold text-slate-200" : "mt-2 truncate text-[11px] font-semibold text-slate-600"}>
            {labels[item - 1]}
          </p>
        </div>
      ))}
    </div>
  );
}

export function ModeSelector({ publicMode, mode, onChange }: { publicMode: boolean; mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <section className="grid grid-cols-1 gap-2 min-[390px]:grid-cols-3" data-aphrodite-compatibility-mode-selector="package-239">
      {modes.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={
            publicMode
                ? `aphrodite-touch-target min-w-0 rounded-lg border px-2.5 py-3 text-center text-xs shadow-sm transition ${
                  mode === item.id ? "border-amber-200/70 bg-amber-200/15 text-amber-50 shadow-amber-950/20" : "border-white/10 bg-white/[0.065] text-slate-300 hover:border-fuchsia-200/40 hover:bg-white/[0.085]"
                }`
                : `aphrodite-touch-target min-w-0 rounded-lg border px-2.5 py-3 text-center text-xs shadow-sm transition ${
                  mode === item.id ? "border-violet-300 bg-violet-50 text-violet-900" : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200"
                }`
          }
        >
          <span className="aphrodite-wrap-anywhere block font-semibold">{item.label}</span>
          <span className="aphrodite-wrap-anywhere mt-1 block leading-snug">{item.caption}</span>
        </button>
      ))}
    </section>
  );
}

export function RelationshipModeSelector({ publicMode, mode, onChange }: { publicMode: boolean; mode: RelationshipMode; onChange: (mode: RelationshipMode) => void }) {
  return (
    <section className="aphrodite-pkg-267-three-after-430 grid gap-2 sm:grid-cols-3" data-aphrodite-compatibility-relationship-selector="package-239" data-aphrodite-critical-mobile-webview-visual-fix="package-267">
      {relationshipModes.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={
            publicMode
                ? `aphrodite-touch-target min-w-0 rounded-lg border px-2.5 py-3 text-left text-xs shadow-sm transition ${
                  mode === item.id ? "border-rose-200/70 bg-rose-200/15 text-rose-50 shadow-rose-950/20" : "border-white/10 bg-white/[0.065] text-slate-300 hover:border-rose-200/40 hover:bg-white/[0.085]"
                }`
                : `aphrodite-touch-target min-w-0 rounded-lg border px-2.5 py-3 text-left text-xs shadow-sm transition ${
                  mode === item.id ? "border-rose-300 bg-rose-50 text-rose-900" : "border-slate-200 bg-white text-slate-700 hover:border-rose-200"
                }`
          }
        >
          <span className="aphrodite-wrap-anywhere block font-semibold">{item.label}</span>
          <span className="aphrodite-wrap-anywhere mt-1 block leading-snug">{item.caption}</span>
        </button>
      ))}
    </section>
  );
}

export function WizardCard({ publicMode, stepLabel, title, children }: { publicMode: boolean; stepLabel: string; title: string; children: ReactNode }) {
  return (
    <div
      data-aphrodite-compatibility-input="package-239"
      className={
        publicMode
          ? "min-w-0 overflow-hidden rounded-lg border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.055))] p-4 shadow-[0_22px_70px_rgba(8,13,30,0.44)] backdrop-blur transition-all duration-300"
          : "min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300"
      }
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={publicMode ? "text-xs font-semibold text-amber-100" : "text-xs font-semibold text-violet-700"}>{stepLabel}</p>
          <h2 className={publicMode ? "aphrodite-wrap-anywhere mt-1 text-xl font-semibold text-white" : "aphrodite-wrap-anywhere mt-1 text-xl font-semibold text-slate-950"}>{title}</h2>
        </div>
        <span
          className={
            publicMode
              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-fuchsia-200/20 bg-fuchsia-200/10 text-fuchsia-100 shadow-[0_12px_32px_rgba(217,70,239,0.2)]"
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
    ? "aphrodite-touch-target inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-100/45 bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-rose-950/30 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-200/45"
    : "aphrodite-touch-target inline-flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500 bg-violet-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-violet-700";
}

export function secondaryButtonClass(publicMode: boolean) {
  return publicMode
    ? "aphrodite-touch-target inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/8 px-4 py-3 text-center text-sm font-semibold text-slate-100 transition hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-white/20"
    : "aphrodite-touch-target inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50";
}

export function primaryTinyButtonClass(publicMode: boolean) {
  return publicMode
    ? "aphrodite-touch-target rounded-lg border border-amber-200/55 bg-amber-200/15 px-3 py-2 text-xs font-semibold text-amber-50"
    : "aphrodite-touch-target rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-900";
}

export function secondaryTinyButtonClass(publicMode: boolean) {
  return publicMode
    ? "aphrodite-touch-target rounded-lg border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-slate-200"
    : "aphrodite-touch-target rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700";
}

export function Field({ label, publicMode, children }: { label: string; publicMode?: boolean; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className={publicMode ? "aphrodite-wrap-anywhere mb-1.5 block text-sm font-semibold text-slate-100" : "aphrodite-wrap-anywhere mb-1.5 block text-sm font-semibold text-slate-700"}>{label}</span>
      {children}
    </label>
  );
}
