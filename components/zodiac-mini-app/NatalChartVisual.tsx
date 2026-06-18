import { getAstroEngineStatus } from "@/lib/zodiac-astro-engine";
import { signs } from "./constants";
import type { Gender, ZodiacElement, ZodiacSign } from "./types";

export type NatalChartMode = "basic" | "date" | "extended";

interface NatalChartVisualProps {
  publicMode: boolean;
  sign: ZodiacSign;
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
  gender?: Gender;
  mode: NatalChartMode;
  title?: string;
}

type NatalLineKind = "power" | "growth" | "emotion" | "decision" | "relationship";
type ZodiacQuality = "cardinal" | "fixed" | "mutable";
type ZodiacPolarity = "active" | "receptive";

const elementLabels: Record<ZodiacElement, string> = {
  fire: "Огонь",
  earth: "Земля",
  air: "Воздух",
  water: "Вода",
};

const qualityLabels: Record<ZodiacQuality, string> = {
  cardinal: "кардинальное",
  fixed: "фиксированное",
  mutable: "мутабельное",
};

const polarityLabels: Record<ZodiacPolarity, string> = {
  active: "активная",
  receptive: "восприимчивая",
};

const signTraits: Record<string, { quality: ZodiacQuality; polarity: ZodiacPolarity; energy: string }> = {
  aries: { quality: "cardinal", polarity: "active", energy: "инициатива" },
  taurus: { quality: "fixed", polarity: "receptive", energy: "устойчивость" },
  gemini: { quality: "mutable", polarity: "active", energy: "связи" },
  cancer: { quality: "cardinal", polarity: "receptive", energy: "забота" },
  leo: { quality: "fixed", polarity: "active", energy: "самовыражение" },
  virgo: { quality: "mutable", polarity: "receptive", energy: "точность" },
  libra: { quality: "cardinal", polarity: "active", energy: "баланс" },
  scorpio: { quality: "fixed", polarity: "receptive", energy: "глубина" },
  sagittarius: { quality: "mutable", polarity: "active", energy: "смысл" },
  capricorn: { quality: "cardinal", polarity: "receptive", energy: "структура" },
  aquarius: { quality: "fixed", polarity: "active", energy: "свобода" },
  pisces: { quality: "mutable", polarity: "receptive", energy: "интуиция" },
};

const elementOrder: ZodiacElement[] = ["fire", "earth", "air", "water"];

const natalLegend: Array<{ kind: NatalLineKind; label: string }> = [
  { kind: "power", label: "сила" },
  { kind: "growth", label: "рост" },
  { kind: "emotion", label: "эмоции" },
  { kind: "decision", label: "решения" },
  { kind: "relationship", label: "отношения" },
];

export function NatalChartVisual({
  publicMode,
  sign,
  birthDate = "",
  birthTime = "",
  birthCity = "",
  gender = "unspecified",
  mode,
  title = "Символическая натальная карта",
}: NatalChartVisualProps) {
  const engineStatus = getAstroEngineStatus();
  const signIndexValue = signIndex(sign);
  const traits = signTraits[sign.slug] ?? signTraits.aries;
  const seed = hashString([sign.slug, birthDate || "no-date", birthTime ? "time" : "no-time", birthCity ? "city" : "no-city", gender].join("|"));
  const lines = buildNatalLines(signIndexValue, seed);
  const highlightedElements = new Set(signs.map((item, index) => (item.element === sign.element ? index : null)).filter((value): value is number => typeof value === "number"));

  return (
    <div
      className={
        publicMode
          ? "overflow-hidden rounded-lg border border-amber-200/25 bg-gradient-to-br from-slate-950 via-fuchsia-950/50 to-amber-950/30 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.24)]"
          : "overflow-hidden rounded-lg border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-amber-50 p-4 shadow-sm"
      }
      data-premium-natal-chart
      data-natal-chart-visual
      data-zodiac-chart-visual
      data-final-astro-map
      data-final-astro-map-mode="personal"
    >
      <div className="grid gap-4 lg:grid-cols-[260px_1fr] lg:items-center">
        <svg viewBox="0 0 260 260" role="img" aria-label={title} className="mx-auto h-64 w-64 max-w-full" data-final-astro-svg data-natal-chart-svg>
          <defs>
            <radialGradient id={`natalGlow-${sign.slug}`} cx="50%" cy="45%" r="58%">
              <stop offset="0%" stopColor={publicMode ? "#fde68a" : "#fef3c7"} stopOpacity="0.85" />
              <stop offset="48%" stopColor={publicMode ? "#a78bfa" : "#ddd6fe"} stopOpacity="0.28" />
              <stop offset="100%" stopColor={publicMode ? "#0f172a" : "#ffffff"} stopOpacity="0.02" />
            </radialGradient>
          </defs>

          <circle cx="130" cy="130" r="119" fill={`url(#natalGlow-${sign.slug})`} />
          <circle cx="130" cy="130" r="112" fill="none" stroke={publicMode ? "rgba(253,230,138,0.42)" : "rgba(124,58,237,0.22)"} strokeWidth="1.5" />
          <circle cx="130" cy="130" r="78" fill="none" stroke={publicMode ? "rgba(255,255,255,0.18)" : "rgba(245,158,11,0.25)"} strokeWidth="1.2" />
          <circle cx="130" cy="130" r="43" fill={publicMode ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.78)"} stroke={publicMode ? "rgba(253,230,138,0.38)" : "rgba(124,58,237,0.22)"} />

          {elementOrder.map((element) => {
            const elementIndexes = signs.map((item, index) => (item.element === element ? index : null)).filter((value): value is number => typeof value === "number");
            const selected = element === sign.element;
            return (
              <g key={element} opacity={selected ? "0.38" : "0.08"}>
                {elementIndexes.map((index) => {
                  const point = pointForIndex(index, 86);
                  return <circle key={`${element}-${index}`} cx={point.x} cy={point.y} r="24" fill={elementColor(element, publicMode)} data-natal-element-sector={element} />;
                })}
              </g>
            );
          })}

          {signs.map((item, index) => {
            const outer = pointForIndex(index, 108);
            const inner = pointForIndex(index, 45);
            const label = pointForIndex(index, 121);
            const selected = item.slug === sign.slug;
            const elementSelected = highlightedElements.has(index);
            const badge = pointForIndex(index, 91);
            return (
              <g key={item.slug}>
                <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={publicMode ? "rgba(255,255,255,0.15)" : "rgba(100,116,139,0.18)"} strokeWidth="1" />
                {elementSelected ? <circle cx={badge.x} cy={badge.y} r={selected ? "17" : "11"} fill="none" stroke={elementColor(sign.element, publicMode)} strokeWidth={selected ? "2" : "1"} /> : null}
                {selected ? <circle cx={badge.x} cy={badge.y} r="21" fill={publicMode ? "rgba(253,230,138,0.16)" : "rgba(245,158,11,0.14)"} stroke={publicMode ? "#fde68a" : "#f59e0b"} strokeWidth="1.8" /> : null}
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={selected ? "19" : "13"}
                  fontWeight={selected ? "800" : "600"}
                  fill={selected ? (publicMode ? "#fde68a" : "#7c2d12") : publicMode ? "#cbd5e1" : "#64748b"}
                >
                  {item.emoji}
                </text>
              </g>
            );
          })}

          <g data-final-astro-lines>
            {lines.map((line) => {
              const from = pointForIndex(line.from, line.fromRadius);
              const to = pointForIndex(line.to, line.toRadius);
              const color = natalLineColor(line.kind, publicMode);
              return (
                <g key={line.kind}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={color}
                    strokeWidth={line.kind === "growth" ? "2" : "2.4"}
                    strokeLinecap="round"
                    strokeDasharray={line.kind === "growth" ? "4 5" : line.kind === "decision" ? "2 7" : undefined}
                    opacity="0.92"
                    data-final-astro-line={line.kind}
                    data-natal-aspect-line={line.kind}
                  />
                  <polygon points={arrowPoints(from, to, 6)} fill={color} opacity="0.94" data-final-astro-arrow={line.kind} />
                </g>
              );
            })}
          </g>

          <text x="130" y="122" textAnchor="middle" dominantBaseline="middle" fontSize="27" fontWeight="800" fill={publicMode ? "#fde68a" : "#7c3aed"}>
            {sign.emoji}
          </text>
          <text x="130" y="145" textAnchor="middle" dominantBaseline="middle" fontSize="9.5" fontWeight="800" fill={publicMode ? "#c4b5fd" : "#7c3aed"}>
            {elementLabels[sign.element]}
          </text>
        </svg>

        <div className="min-w-0">
          <p className={publicMode ? "text-xs font-semibold uppercase tracking-widest text-amber-100" : "text-xs font-semibold uppercase tracking-widest text-violet-700"}>
            {engineStatus.label}
          </p>
          <h3 className={publicMode ? "mt-1 break-words text-xl font-semibold text-white" : "mt-1 break-words text-xl font-semibold text-slate-950"}>{title}</h3>
          <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-600"}>
            {sign.emoji} {sign.name}: базовая визуализация по знаку и введённым данным. Центральный знак показывает ядро, подсвеченная стихия — темперамент, линии — символические связи силы, роста, эмоций, решений и отношений.
          </p>
          <p className={publicMode ? "mt-2 text-xs leading-5 text-slate-400" : "mt-2 text-xs leading-5 text-slate-500"}>
            {engineStatus.note} Сейчас это честная интерпретация без точных домов и асцендента.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <NatalMetric publicMode={publicMode} label="Стихия" value={elementLabels[sign.element]} />
            <NatalMetric publicMode={publicMode} label="Качество" value={qualityLabels[traits.quality]} />
            <NatalMetric publicMode={publicMode} label="Полярность" value={polarityLabels[traits.polarity]} />
            <NatalMetric publicMode={publicMode} label="Ведущая энергия" value={traits.energy} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className={publicMode ? "rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-50" : "rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900"}>
              {natalModeLabel(mode)}
            </span>
            <span className={publicMode ? "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200" : "rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"}>
              {birthTime && birthCity ? "данные учтены в интерпретации" : "без точного времени"}
            </span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2" data-final-astro-legend data-natal-chart-legend>
            {natalLegend.map((item) => (
              <div key={item.kind} className={publicMode ? "flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-2" : "flex items-center gap-2 rounded-md border border-slate-200 bg-white/70 px-2.5 py-2"}>
                <span className="h-1.5 w-8 rounded-full" style={{ backgroundColor: natalLineColor(item.kind, publicMode) }} />
                <span className={publicMode ? "text-xs font-semibold text-slate-200" : "text-xs font-semibold text-slate-700"}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NatalMetric({ publicMode, label, value }: { publicMode: boolean; label: string; value: string }) {
  return (
    <div className={publicMode ? "rounded-md border border-white/10 bg-white/5 p-2.5" : "rounded-md border border-slate-200 bg-white/75 p-2.5"}>
      <p className={publicMode ? "text-[10px] font-semibold uppercase tracking-widest text-slate-400" : "text-[10px] font-semibold uppercase tracking-widest text-slate-500"}>{label}</p>
      <p className={publicMode ? "mt-1 text-sm font-semibold text-white" : "mt-1 text-sm font-semibold text-slate-950"}>{value}</p>
    </div>
  );
}

function buildNatalLines(signIndexValue: number, seed: number) {
  const shift = seed % 12;
  return natalLegend.map((item, index) => ({
    kind: item.kind,
    from: (signIndexValue + index + shift) % 12,
    to: (signIndexValue + index * 2 + 4 + shift) % 12,
    fromRadius: 58 + (index % 2) * 12,
    toRadius: 82 - (index % 3) * 8,
  }));
}

function signIndex(sign: ZodiacSign) {
  const index = signs.findIndex((item) => item.slug === sign.slug);
  return index >= 0 ? index : 0;
}

function pointForIndex(index: number, radius: number) {
  const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
  return {
    x: 130 + Math.cos(angle) * radius,
    y: 130 + Math.sin(angle) * radius,
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

function natalLineColor(kind: NatalLineKind, publicMode: boolean) {
  const colors: Record<NatalLineKind, string> = {
    power: publicMode ? "#fde68a" : "#d97706",
    growth: publicMode ? "#34d399" : "#059669",
    emotion: publicMode ? "#fb7185" : "#e11d48",
    decision: publicMode ? "#67e8f9" : "#0891b2",
    relationship: publicMode ? "#c4b5fd" : "#7c3aed",
  };
  return colors[kind];
}

function elementColor(element: ZodiacElement, publicMode: boolean) {
  const colors: Record<ZodiacElement, string> = {
    fire: publicMode ? "#fb923c" : "#f97316",
    earth: publicMode ? "#34d399" : "#059669",
    air: publicMode ? "#67e8f9" : "#0891b2",
    water: publicMode ? "#a78bfa" : "#7c3aed",
  };
  return colors[element];
}

function natalModeLabel(mode: NatalChartMode) {
  if (mode === "extended") return "Расширенная карта по введённым данным";
  if (mode === "date") return "Карта по дате рождения и знаку";
  return "Базовая карта по знаку";
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}
