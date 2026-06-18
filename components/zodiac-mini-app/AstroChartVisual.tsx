import { signs } from "./constants";
import type { RelationshipMode, ZodiacSign } from "./types";

export type FinalAstroMapMode = "personal" | "couple" | "monthly" | "numerology" | "mystic" | "vip";
export type AstroChartVisualKind = "natal" | "pair" | "matrix" | "numerology";

type EnergyLineKind = "emotion" | "communication" | "rhythm" | "tension" | "growth";

interface FinalAstroMapProps {
  publicMode: boolean;
  mode: FinalAstroMapMode;
  primarySign?: ZodiacSign | null;
  secondarySign?: ZodiacSign | null;
  relationshipMode?: RelationshipMode | string;
  score?: number;
  scoreTier?: string;
  title?: string;
  caption?: string;
  chartType?: string;
}

export function FinalAstroMap({
  publicMode,
  mode,
  primarySign,
  secondarySign,
  relationshipMode,
  score,
  scoreTier,
  title,
  caption,
  chartType,
}: FinalAstroMapProps) {
  const primaryIndex = signIndex(primarySign);
  const secondaryIndex = typeof secondarySign !== "undefined" && secondarySign ? signIndex(secondarySign) : null;
  const lines = buildEnergyLines(primaryIndex, secondaryIndex, mode);
  const mapTitle = title ?? defaultTitle(mode);
  const mapCaption = caption ?? defaultCaption(mode, primarySign, secondarySign, relationshipMode);
  const centerLabel = typeof score === "number" ? `${score}%` : centerSymbol(mode);
  const tierLabel = scoreTier ? scoreTierLabel(scoreTier) : kindLabel(mode);

  return (
    <div
      className={
        publicMode
          ? "overflow-hidden rounded-lg border border-fuchsia-200/20 bg-gradient-to-br from-fuchsia-300/12 via-cyan-300/8 to-amber-200/10 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.2)]"
          : "overflow-hidden rounded-lg border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-amber-50 p-4 shadow-sm"
      }
      data-final-astro-map
      data-final-astro-map-mode={mode}
      data-zodiac-chart-visual
    >
      <div className="grid gap-4 sm:grid-cols-[220px_1fr] sm:items-center">
        <svg viewBox="0 0 240 240" role="img" aria-label={mapTitle} className="mx-auto h-56 w-56 max-w-full" data-final-astro-svg>
          <circle cx="120" cy="120" r="108" fill={publicMode ? "rgba(15,23,42,0.58)" : "rgba(255,255,255,0.72)"} />
          <circle cx="120" cy="120" r="99" fill="none" stroke={publicMode ? "rgba(253,230,138,0.36)" : "rgba(124,58,237,0.22)"} strokeWidth="1.5" />
          <circle cx="120" cy="120" r="70" fill="none" stroke={publicMode ? "rgba(255,255,255,0.18)" : "rgba(245,158,11,0.28)"} strokeWidth="1.2" />
          <circle cx="120" cy="120" r="38" fill="none" stroke={publicMode ? "rgba(103,232,249,0.18)" : "rgba(6,182,212,0.24)"} strokeWidth="1" />

          {signs.map((sign, index) => {
            const outer = pointForIndex(index, 98);
            const inner = pointForIndex(index, 42);
            const label = pointForIndex(index, 113);
            const highlighted = index === primaryIndex || index === secondaryIndex;
            const sector = pointForIndex(index, 88);
            return (
              <g key={sign.slug}>
                <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={publicMode ? "rgba(255,255,255,0.16)" : "rgba(100,116,139,0.2)"} strokeWidth="1" />
                {highlighted ? (
                  <circle
                    cx={sector.x}
                    cy={sector.y}
                    r="15"
                    fill={index === primaryIndex ? (publicMode ? "rgba(253,230,138,0.22)" : "rgba(245,158,11,0.18)") : publicMode ? "rgba(103,232,249,0.2)" : "rgba(6,182,212,0.16)"}
                    stroke={index === primaryIndex ? (publicMode ? "#fde68a" : "#f59e0b") : publicMode ? "#67e8f9" : "#06b6d4"}
                    strokeWidth="1.4"
                  />
                ) : null}
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={highlighted ? "17" : "13"}
                  fontWeight={highlighted ? "700" : "500"}
                  fill={highlighted ? (publicMode ? "#fde68a" : "#7c2d12") : publicMode ? "#cbd5e1" : "#64748b"}
                >
                  {sign.emoji}
                </text>
              </g>
            );
          })}

          <g data-final-astro-lines>
            {lines.map((line) => {
              const from = pointForIndex(line.from, line.radiusFrom);
              const to = pointForIndex(line.to, line.radiusTo);
              const arrow = arrowPoints(from, to, line.arrowSize);
              const color = energyLineColor(line.kind, publicMode);
              return (
                <g key={line.kind}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={color}
                    strokeWidth={line.kind === "tension" ? "1.8" : "2.2"}
                    strokeLinecap="round"
                    strokeDasharray={line.kind === "tension" ? "5 5" : line.kind === "growth" ? "2 6" : undefined}
                    opacity={line.kind === "tension" ? "0.78" : "0.92"}
                    data-final-astro-line={line.kind}
                  />
                  <polygon points={arrow} fill={color} opacity="0.92" data-final-astro-arrow={line.kind} />
                </g>
              );
            })}
          </g>

          <circle cx="120" cy="120" r="25" fill={publicMode ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.94)"} stroke={publicMode ? "rgba(253,230,138,0.45)" : "rgba(168,85,247,0.32)"} strokeWidth="1.5" />
          <text x="120" y={typeof score === "number" ? "118" : "124"} textAnchor="middle" dominantBaseline="middle" fontSize={typeof score === "number" ? "15" : "21"} fontWeight="700" fill={publicMode ? "#fde68a" : "#7c3aed"}>
            {centerLabel}
          </text>
          {typeof score === "number" ? (
            <text x="120" y="136" textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fontWeight="700" fill={publicMode ? "#c4b5fd" : "#7c3aed"}>
              {tierLabel}
            </text>
          ) : null}
        </svg>

        <div className="min-w-0">
          <p className={publicMode ? "text-xs font-semibold uppercase tracking-widest text-amber-100" : "text-xs font-semibold uppercase tracking-widest text-violet-700"}>
            Символическая карта энергий
          </p>
          <h3 className={publicMode ? "mt-1 break-words text-lg font-semibold text-white" : "mt-1 break-words text-lg font-semibold text-slate-950"}>{mapTitle}</h3>
          <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-600"}>{mapCaption}</p>
          <p className={publicMode ? "mt-2 text-xs leading-5 text-slate-400" : "mt-2 text-xs leading-5 text-slate-500"}>
            Базовая визуализация без точных домов и асцендента. Это не ephemeris-расчёт, а честная визуальная интерпретация выбранных данных.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {primarySign ? <LegendPill publicMode={publicMode} color="gold" label={`${primarySign.emoji} ${primarySign.name}`} /> : null}
            {secondarySign ? <LegendPill publicMode={publicMode} color="cyan" label={`${secondarySign.emoji} ${secondarySign.name}`} /> : null}
            <LegendPill publicMode={publicMode} color="violet" label={chartType ?? kindLabel(mode)} />
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2" data-final-astro-legend>
            {energyLegend.map((item) => (
              <div key={item.kind} className={publicMode ? "flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-2" : "flex items-center gap-2 rounded-md border border-slate-200 bg-white/70 px-2.5 py-2"}>
                <span className="h-1.5 w-8 rounded-full" style={{ backgroundColor: energyLineColor(item.kind, publicMode) }} />
                <span className={publicMode ? "text-xs font-semibold text-slate-200" : "text-xs font-semibold text-slate-700"}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  return (
    <FinalAstroMap
      publicMode={publicMode}
      mode={kindToFinalMode(kind)}
      primarySign={primarySign}
      secondarySign={secondarySign}
      relationshipMode={mode}
      title={title}
      caption={caption}
      chartType={kindLabel(kindToFinalMode(kind))}
    />
  );
}

const energyLegend: Array<{ kind: EnergyLineKind; label: string }> = [
  { kind: "emotion", label: "Эмоции" },
  { kind: "communication", label: "Общение" },
  { kind: "rhythm", label: "Ритм" },
  { kind: "tension", label: "Напряжение" },
  { kind: "growth", label: "Рост" },
];

function LegendPill({ publicMode, color, label }: { publicMode: boolean; color: "gold" | "cyan" | "violet"; label: string }) {
  const tone = {
    gold: publicMode ? "border-amber-200/25 bg-amber-200/10 text-amber-50" : "border-amber-100 bg-amber-50 text-amber-900",
    cyan: publicMode ? "border-cyan-200/20 bg-cyan-200/10 text-cyan-50" : "border-cyan-100 bg-cyan-50 text-cyan-900",
    violet: publicMode ? "border-fuchsia-200/20 bg-fuchsia-200/10 text-fuchsia-50" : "border-violet-100 bg-violet-50 text-violet-900",
  }[color];

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>{label}</span>;
}

function buildEnergyLines(primaryIndex: number, secondaryIndex: number | null, mode: FinalAstroMapMode) {
  const partner = secondaryIndex ?? (primaryIndex + 4) % 12;
  const base = [
    { kind: "emotion" as const, from: primaryIndex, to: partner, radiusFrom: 76, radiusTo: 76, arrowSize: 6 },
    { kind: "communication" as const, from: partner, to: (primaryIndex + 2) % 12, radiusFrom: 69, radiusTo: 64, arrowSize: 5.5 },
    { kind: "rhythm" as const, from: (primaryIndex + 3) % 12, to: (partner + 3) % 12, radiusFrom: 58, radiusTo: 58, arrowSize: 5 },
    { kind: "tension" as const, from: (primaryIndex + 6) % 12, to: (partner + 8) % 12, radiusFrom: 82, radiusTo: 72, arrowSize: 5 },
    { kind: "growth" as const, from: (partner + 10) % 12, to: (primaryIndex + 1) % 12, radiusFrom: 52, radiusTo: 86, arrowSize: 5.5 },
  ];

  if (mode === "numerology") {
    return base.map((line, index) => ({ ...line, from: (primaryIndex + index * 2) % 12, to: (primaryIndex + index * 2 + 5) % 12 }));
  }

  if (mode === "mystic" || mode === "monthly") {
    return base.map((line, index) => ({ ...line, from: (primaryIndex + index) % 12, to: (primaryIndex + index + 4) % 12 }));
  }

  return base;
}

function signIndex(sign?: ZodiacSign | null) {
  if (!sign) return 0;
  const index = signs.findIndex((item) => item.slug === sign.slug);
  return index >= 0 ? index : 0;
}

function pointForIndex(index: number, radius: number) {
  const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
  return {
    x: 120 + Math.cos(angle) * radius,
    y: 120 + Math.sin(angle) * radius,
  };
}

function arrowPoints(from: { x: number; y: number }, to: { x: number; y: number }, size: number) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const left = {
    x: to.x - Math.cos(angle - Math.PI / 7) * size,
    y: to.y - Math.sin(angle - Math.PI / 7) * size,
  };
  const right = {
    x: to.x - Math.cos(angle + Math.PI / 7) * size,
    y: to.y - Math.sin(angle + Math.PI / 7) * size,
  };
  return `${to.x.toFixed(1)},${to.y.toFixed(1)} ${left.x.toFixed(1)},${left.y.toFixed(1)} ${right.x.toFixed(1)},${right.y.toFixed(1)}`;
}

function energyLineColor(kind: EnergyLineKind, publicMode: boolean) {
  const colors: Record<EnergyLineKind, string> = {
    emotion: publicMode ? "#fb7185" : "#e11d48",
    communication: publicMode ? "#67e8f9" : "#0891b2",
    rhythm: publicMode ? "#fbbf24" : "#d97706",
    tension: publicMode ? "#fb923c" : "#ea580c",
    growth: publicMode ? "#34d399" : "#059669",
  };
  return colors[kind];
}

function kindToFinalMode(kind: AstroChartVisualKind): FinalAstroMapMode {
  if (kind === "pair") return "couple";
  if (kind === "matrix") return "mystic";
  if (kind === "numerology") return "numerology";
  return "personal";
}

function defaultTitle(mode: FinalAstroMapMode) {
  if (mode === "couple") return "Карта связи";
  if (mode === "monthly") return "Карта месяца";
  if (mode === "numerology") return "Числовой круг";
  if (mode === "mystic") return "Мистическая карта дня";
  if (mode === "vip") return "VIP карта энергий";
  return "Личная натальная схема";
}

function defaultCaption(mode: FinalAstroMapMode, primarySign?: ZodiacSign | null, secondarySign?: ZodiacSign | null, relationshipMode?: RelationshipMode | string) {
  if (mode === "couple" && primarySign && secondarySign) {
    return `${primarySign.name} и ${secondarySign.name}: линии показывают эмоциональный контакт, стиль разговора, бытовой ритм, напряжение и зону роста${relationshipMode ? ` в режиме ${relationshipModeLabel(relationshipMode)}` : ""}.`;
  }
  if (mode === "monthly") return "Карта помогает увидеть месяц как систему фокуса: где экономить силы, где усиливать контакт и где не спорить с ритмом.";
  if (mode === "numerology") return "Круг чисел показывает судьбу, душу и личность как символические опоры для решения, риска и следующего шага.";
  if (mode === "mystic") return "Сектора дня показывают символ, предупреждение, цвет, число и мягкое действие без обещаний точного предсказания.";
  if (mode === "vip") return "VIP-визуализация соединяет выбранные знаки, цель и текущий режим в одну карту фокуса.";
  return primarySign ? `${primarySign.name}: символическое колесо знака, личного фокуса, сильных сторон и зоны роста.` : "Символическое колесо знаков и личных акцентов.";
}

function relationshipModeLabel(mode: RelationshipMode | string) {
  const labels: Record<RelationshipMode, string> = {
    love: "любви",
    friendship: "дружбы",
    work: "работы",
    family: "семьи",
    passion: "страсти",
    reconciliation: "примирения",
  };
  return labels[mode as RelationshipMode] ?? String(mode);
}

function scoreTierLabel(scoreTier: string) {
  const labels: Record<string, string> = {
    strong: "сильный",
    good: "хороший",
    medium: "средний",
    difficult: "сложный",
    tense: "напряжённый",
  };
  return labels[scoreTier] ?? scoreTier;
}

function kindLabel(mode: FinalAstroMapMode) {
  if (mode === "couple") return "пара";
  if (mode === "monthly") return "месяц";
  if (mode === "numerology") return "числа";
  if (mode === "mystic") return "мистика";
  if (mode === "vip") return "VIP";
  return "личная карта";
}

function centerSymbol(mode: FinalAstroMapMode) {
  if (mode === "couple") return "∞";
  if (mode === "numerology") return "#";
  if (mode === "mystic") return "◇";
  if (mode === "monthly") return "☽";
  if (mode === "vip") return "✧";
  return "✦";
}
