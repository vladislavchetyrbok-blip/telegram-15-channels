import type { BirthMatrixSectionId, MysticBirthMatrix } from "@/lib/zodiac-mystic-content";

interface BirthMatrixVisualProps {
  publicMode: boolean;
  matrix: MysticBirthMatrix;
  activeSection: BirthMatrixSectionId;
  onSectionSelect: (section: BirthMatrixSectionId) => void;
}

const zoneToSection: Record<MysticBirthMatrix["visualCells"][number]["id"], BirthMatrixSectionId> = {
  character: "character",
  relationships: "relationships",
  money: "money",
  energy: "today",
  lesson: "lesson",
  resource: "main",
};

const zonePositions: Record<MysticBirthMatrix["visualCells"][number]["id"], string> = {
  character: "left-1/2 top-3 -translate-x-1/2",
  relationships: "right-3 top-[30%]",
  money: "right-8 bottom-6",
  energy: "left-1/2 bottom-3 -translate-x-1/2",
  lesson: "left-8 bottom-6",
  resource: "left-3 top-[30%]",
};

export function BirthMatrixVisual({ publicMode, matrix, activeSection, onSectionSelect }: BirthMatrixVisualProps) {
  return (
    <div
      className={
        publicMode
          ? "rounded-lg border border-fuchsia-200/20 bg-slate-950/45 p-4 shadow-[0_18px_50px_rgba(88,28,135,0.24)]"
          : "rounded-lg border border-fuchsia-100 bg-fuchsia-50/80 p-4 shadow-[0_18px_45px_rgba(148,163,184,0.18)]"
      }
      data-birth-matrix-visual="true"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={publicMode ? "text-xs font-semibold uppercase tracking-wide text-fuchsia-100" : "text-xs font-semibold uppercase tracking-wide text-fuchsia-700"}>
            Визуальная матрица чисел
          </p>
          <p className={publicMode ? "mt-1 text-sm leading-5 text-slate-300" : "mt-1 text-sm leading-5 text-slate-600"}>
            Линии показывают, как центр связан с зонами характера, отношений, реализации, энергии, урока и ресурса.
          </p>
        </div>
        <span className={publicMode ? "rounded-full border border-emerald-200/25 bg-emerald-200/10 px-3 py-1 text-xs font-semibold text-emerald-100" : "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"}>
          Легенда
        </span>
      </div>

      <div className="relative mx-auto mt-5 aspect-square w-full max-w-[360px] overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 p-4 text-white">
        <div className="absolute left-1/2 top-8 h-[calc(100%-4rem)] w-px -translate-x-1/2 bg-fuchsia-200/20" />
        <div className="absolute left-8 top-1/2 h-px w-[calc(100%-4rem)] -translate-y-1/2 bg-cyan-200/20" />
        <div className="absolute left-[18%] top-[20%] h-px w-[64%] rotate-45 bg-amber-100/20" />
        <div className="absolute left-[18%] top-[80%] h-px w-[64%] -rotate-45 bg-emerald-100/20" />

        <button
          type="button"
          onClick={() => onSectionSelect("main")}
          className={`absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border px-2 text-center shadow-[0_0_38px_rgba(216,180,254,0.28)] transition ${
            activeSection === "main" ? "border-amber-200 bg-amber-200/18" : "border-fuchsia-200/30 bg-white/10 hover:bg-white/15"
          }`}
          aria-label={`Центральное число ${matrix.centralNumber}`}
        >
          <span className="text-[10px] font-semibold uppercase text-fuchsia-100">Центр</span>
          <span className="text-4xl font-bold leading-none text-white">{matrix.centralNumber}</span>
          <span className="mt-1 text-[10px] leading-tight text-slate-300">{matrix.archetype}</span>
        </button>

        {matrix.visualCells.map((cell) => {
          const sectionId = zoneToSection[cell.id];
          const active = activeSection === sectionId;
          return (
            <button
              key={cell.id}
              type="button"
              onClick={() => onSectionSelect(sectionId)}
              className={`absolute ${zonePositions[cell.id]} flex h-20 w-20 flex-col items-center justify-center rounded-lg border px-1 text-center text-xs shadow-sm transition ${
                active ? "border-cyan-200 bg-cyan-200/18 text-white" : "border-white/15 bg-white/8 text-slate-200 hover:bg-white/14"
              }`}
            >
              <span className="text-[10px] leading-tight text-slate-300">{cell.label}</span>
              <span className="text-2xl font-bold leading-none">{cell.number}</span>
              <span className="mt-1 line-clamp-1 text-[10px] leading-tight text-slate-300">{cell.title}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2" data-birth-matrix-legend="true">
        {matrix.visualCells.map((cell) => (
          <button
            key={cell.id}
            type="button"
            onClick={() => onSectionSelect(zoneToSection[cell.id])}
            className={publicMode ? "rounded-lg border border-white/10 bg-white/7 p-3 text-left" : "rounded-lg border border-slate-200 bg-white p-3 text-left"}
          >
            <span className={publicMode ? "text-xs font-semibold text-amber-100" : "text-xs font-semibold text-fuchsia-800"}>
              {cell.label} · {cell.number}
            </span>
            <span className={publicMode ? "mt-1 block text-sm leading-5 text-slate-300" : "mt-1 block text-sm leading-5 text-slate-600"}>
              {cell.summary}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
