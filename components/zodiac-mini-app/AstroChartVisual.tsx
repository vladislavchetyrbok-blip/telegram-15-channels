import { signs } from "./constants";
import type { RelationshipMode, ZodiacSign } from "./types";

export type AstroChartVisualKind = "natal" | "pair" | "matrix" | "numerology";

export function AstroChartVisual({
  publicMode,
  kind,
  primarySign,
  secondarySign,
  mode,
  title,
  caption,
}: {
  publicMode: boolean;
  kind: AstroChartVisualKind;
  primarySign?: ZodiacSign | null;
  secondarySign?: ZodiacSign | null;
  mode?: RelationshipMode | string;
  title?: string;
  caption?: string;
}) {
  const primaryIndex = signIndex(primarySign);
  const secondaryIndex = signIndex(secondarySign);
  const primaryPoint = pointForIndex(primaryIndex, 82);
  const secondaryPoint = typeof secondaryIndex === "number" ? pointForIndex(secondaryIndex, 82) : null;
  const chartTitle = title ?? defaultTitle(kind);
  const chartCaption = caption ?? defaultCaption(kind, primarySign, secondarySign, mode);

  return (
    <div
      className={
        publicMode
          ? "overflow-hidden rounded-lg border border-fuchsia-200/20 bg-gradient-to-br from-fuchsia-300/12 via-cyan-300/8 to-amber-200/10 p-4"
          : "overflow-hidden rounded-lg border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-amber-50 p-4"
      }
      data-zodiac-chart-visual
    >
      <div className="grid gap-4 sm:grid-cols-[184px_1fr] sm:items-center">
        <svg viewBox="0 0 220 220" role="img" aria-label={chartTitle} className="mx-auto h-48 w-48 max-w-full">
          <defs>
            <radialGradient id={`astroChartGlow-${kind}`} cx="50%" cy="42%" r="58%">
              <stop offset="0%" stopColor={publicMode ? "#fef3c7" : "#fde68a"} stopOpacity="0.95" />
              <stop offset="48%" stopColor={publicMode ? "#c084fc" : "#a855f7"} stopOpacity="0.28" />
              <stop offset="100%" stopColor={publicMode ? "#22d3ee" : "#06b6d4"} stopOpacity="0.08" />
            </radialGradient>
          </defs>
          <circle cx="110" cy="110" r="96" fill={`url(#astroChartGlow-${kind})`} opacity="0.65" />
          <circle cx="110" cy="110" r="88" fill="none" stroke={publicMode ? "rgba(255,255,255,0.34)" : "rgba(124,58,237,0.24)"} strokeWidth="1.5" />
          <circle cx="110" cy="110" r="58" fill="none" stroke={publicMode ? "rgba(253,230,138,0.42)" : "rgba(245,158,11,0.35)"} strokeWidth="1.2" />
          {signs.map((sign, index) => {
            const outer = pointForIndex(index, 88);
            const inner = pointForIndex(index, 36);
            const label = pointForIndex(index, 104);
            const highlighted = index === primaryIndex || index === secondaryIndex;
            return (
              <g key={sign.slug}>
                <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={publicMode ? "rgba(255,255,255,0.18)" : "rgba(100,116,139,0.22)"} strokeWidth="1" />
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={highlighted ? "16" : "13"}
                  fontWeight={highlighted ? "700" : "500"}
                  fill={highlighted ? (publicMode ? "#fde68a" : "#7c2d12") : publicMode ? "#cbd5e1" : "#64748b"}
                >
                  {sign.emoji}
                </text>
              </g>
            );
          })}
          {secondaryPoint ? (
            <line
              x1={primaryPoint.x}
              y1={primaryPoint.y}
              x2={secondaryPoint.x}
              y2={secondaryPoint.y}
              stroke={publicMode ? "#f0abfc" : "#a855f7"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={kind === "pair" ? "0" : "4 5"}
            />
          ) : null}
          <circle cx={primaryPoint.x} cy={primaryPoint.y} r="8" fill={publicMode ? "#fde68a" : "#f59e0b"} stroke={publicMode ? "#111827" : "#fff"} strokeWidth="2" />
          {secondaryPoint ? <circle cx={secondaryPoint.x} cy={secondaryPoint.y} r="8" fill={publicMode ? "#67e8f9" : "#06b6d4"} stroke={publicMode ? "#111827" : "#fff"} strokeWidth="2" /> : null}
          <circle cx="110" cy="110" r="18" fill={publicMode ? "rgba(15,23,42,0.86)" : "rgba(255,255,255,0.88)"} stroke={publicMode ? "rgba(253,230,138,0.45)" : "rgba(168,85,247,0.3)"} strokeWidth="1.5" />
          <text x="110" y="113" textAnchor="middle" dominantBaseline="middle" fontSize="18" fill={publicMode ? "#fde68a" : "#7c3aed"}>
            {kind === "pair" ? "∞" : kind === "matrix" ? "◇" : kind === "numerology" ? "#" : "✦"}
          </text>
        </svg>
        <div className="min-w-0">
          <p className={publicMode ? "text-xs font-semibold uppercase tracking-widest text-amber-100" : "text-xs font-semibold uppercase tracking-widest text-violet-700"}>
            Символическая карта
          </p>
          <h3 className={publicMode ? "mt-1 break-words text-lg font-semibold text-white" : "mt-1 break-words text-lg font-semibold text-slate-950"}>{chartTitle}</h3>
          <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-600"}>{chartCaption}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {primarySign ? <LegendPill publicMode={publicMode} color="gold" label={`${primarySign.emoji} ${primarySign.name}`} /> : null}
            {secondarySign ? <LegendPill publicMode={publicMode} color="cyan" label={`${secondarySign.emoji} ${secondarySign.name}`} /> : null}
            <LegendPill publicMode={publicMode} color="violet" label={kindLabel(kind)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendPill({ publicMode, color, label }: { publicMode: boolean; color: "gold" | "cyan" | "violet"; label: string }) {
  const tone = {
    gold: publicMode ? "border-amber-200/25 bg-amber-200/10 text-amber-50" : "border-amber-100 bg-amber-50 text-amber-900",
    cyan: publicMode ? "border-cyan-200/20 bg-cyan-200/10 text-cyan-50" : "border-cyan-100 bg-cyan-50 text-cyan-900",
    violet: publicMode ? "border-fuchsia-200/20 bg-fuchsia-200/10 text-fuchsia-50" : "border-violet-100 bg-violet-50 text-violet-900",
  }[color];

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>{label}</span>;
}

function signIndex(sign?: ZodiacSign | null) {
  if (!sign) return 0;
  const index = signs.findIndex((item) => item.slug === sign.slug);
  return index >= 0 ? index : 0;
}

function pointForIndex(index: number, radius: number) {
  const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
  return {
    x: 110 + Math.cos(angle) * radius,
    y: 110 + Math.sin(angle) * radius,
  };
}

function defaultTitle(kind: AstroChartVisualKind) {
  if (kind === "pair") return "Карта связи";
  if (kind === "matrix") return "Матрица символов";
  if (kind === "numerology") return "Числовой круг";
  return "Личная натальная схема";
}

function defaultCaption(kind: AstroChartVisualKind, primarySign?: ZodiacSign | null, secondarySign?: ZodiacSign | null, mode?: RelationshipMode | string) {
  if (kind === "pair" && primarySign && secondarySign) return `${primarySign.name} и ${secondarySign.name}: визуальная подсказка про ритм связи${mode ? `, режим ${mode}` : ""}.`;
  if (kind === "matrix") return "Сектора показывают личные коды, точки роста и символические опоры расчёта.";
  if (kind === "numerology") return "Круг помогает увидеть числа как систему фокуса, силы и осторожности.";
  return primarySign ? `${primarySign.name}: символическое колесо знака, акцентов и личного фокуса.` : "Символическое колесо знаков и личных акцентов.";
}

function kindLabel(kind: AstroChartVisualKind) {
  if (kind === "pair") return "пара";
  if (kind === "matrix") return "матрица";
  if (kind === "numerology") return "числа";
  return "натал";
}
