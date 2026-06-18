import { ArrowLeft, Bookmark, HeartHandshake, RotateCcw, Share2 } from "lucide-react";
import type { CompatibilityResult } from "./types";
import { primaryButtonClass, secondaryButtonClass } from "./WizardControls";

export function ResultPanel({
  publicMode,
  result,
  levelLabel,
  onEdit,
  onReset,
  onSave,
  onShare,
}: {
  publicMode: boolean;
  result: CompatibilityResult;
  levelLabel: string;
  onEdit: () => void;
  onReset: () => void;
  onSave?: () => void;
  onShare?: () => void;
}) {
  return (
    <div className="min-w-0 space-y-4">
      <div className={publicMode ? "rounded-lg border border-amber-200/20 bg-gradient-to-br from-fuchsia-300/12 via-rose-300/12 to-amber-200/12 p-4 text-white" : "rounded-lg border border-violet-100 bg-violet-50 p-4 text-slate-950"}>
        <p className="text-sm font-semibold opacity-80">{result.modeLabel}</p>
        <p className="mt-2 break-words text-lg font-semibold [overflow-wrap:anywhere]">{result.title}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className={publicMode ? "text-5xl font-semibold text-amber-100" : "text-5xl font-semibold text-violet-700"}>{result.scores.total}%</p>
            <p className={publicMode ? "mt-1 text-sm font-semibold text-fuchsia-100" : "mt-1 text-sm font-semibold text-violet-800"}>{levelLabel}</p>
          </div>
          <HeartHandshake className={publicMode ? "h-12 w-12 text-rose-200" : "h-12 w-12 text-violet-400"} />
        </div>
      </div>

      <div className="space-y-3">
        <ScoreBar publicMode={publicMode} label="🔥 Притяжение" value={result.scores.attraction} text={result.attractionText} />
        <ScoreBar publicMode={publicMode} label="💬 Общение" value={result.scores.communication} text={result.communicationText} />
        <ScoreBar publicMode={publicMode} label="❤️ В любви" value={result.scores.love} text={result.loveText} />
        <ScoreBar publicMode={publicMode} label="🏠 Быт и ритм" value={result.scores.household} text={result.householdText} />
      </div>

      <div className="space-y-3">
        <ResultTextCard publicMode={publicMode} title="✨ Обзор пары" text={result.overviewText} />
        <ResultTextCard publicMode={publicMode} title="🧭 Уровень связи" text={`${result.scoreTierLabel}. ${result.connectionLevel}`} />
        <ResultTextCard publicMode={publicMode} title="💗 Эмоциональная динамика" text={result.emotionalDynamicsText} />
        <ResultTextCard publicMode={publicMode} title="💬 Как общаться" text={result.communicationPlanText} />
        <ResultTextCard publicMode={publicMode} title="⚠️ Точки конфликта" text={result.conflictPointsText} />
        <ResultTextCard publicMode={publicMode} title="📨 Лучший формат контакта" text={result.bestContactFormat} />
        <ResultTextCard publicMode={publicMode} title="⭐ Совет паре" text={result.coupleAdvice} />
      </div>

      {result.nameResonance ? (
        <ResultTextCard publicMode={publicMode} title="✨ Именной резонанс" text={result.nameResonance.text} />
      ) : null}

      <div className="space-y-3">
        <ResultTextCard publicMode={publicMode} title="⚠️ Слабое место" text={result.weakSpotText} />
        <ResultTextCard publicMode={publicMode} title="⭐ Совет паре" text={result.adviceText} />
        <ResultTextCard publicMode={publicMode} title="🎯 Итог" text={result.conclusionText} />
      </div>

      {result.validationMessages.map((message) => (
        <p key={message} className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{message}</p>
      ))}
      {result.note ? <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{result.note}</p> : null}

      {onSave || onShare ? (
        <div className="grid grid-cols-2 gap-3 pt-1">
          {onSave ? (
            <button type="button" onClick={onSave} className={secondaryButtonClass(publicMode)}>
              <Bookmark className="h-4 w-4" />
              Сохранить
            </button>
          ) : null}
          {onShare ? (
            <button type="button" onClick={onShare} className={secondaryButtonClass(publicMode)}>
              <Share2 className="h-4 w-4" />
              Поделиться
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 pt-1">
        <button type="button" onClick={onEdit} className={secondaryButtonClass(publicMode)}>
          <ArrowLeft className="h-4 w-4" />
          Изменить данные
        </button>
        <button type="button" onClick={onReset} className={primaryButtonClass(publicMode)}>
          <RotateCcw className="h-4 w-4" />
          Новый расчёт
        </button>
      </div>
    </div>
  );
}

export function ScoreBar({ publicMode, label, value, text }: { publicMode: boolean; label: string; value: number; text: string }) {
  return (
    <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-3 text-slate-100" : "rounded-lg border border-slate-200 bg-white p-3 text-slate-700"}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">{label}</span>
        <span className={publicMode ? "text-sm font-semibold text-amber-100" : "text-sm font-semibold text-violet-700"}>{value}%</span>
      </div>
      <div className={publicMode ? "mt-2 h-2 rounded-full bg-white/12" : "mt-2 h-2 rounded-full bg-slate-100"}>
        <div
          className={publicMode ? "h-2 rounded-full bg-gradient-to-r from-fuchsia-300 via-rose-300 to-amber-200" : "h-2 rounded-full bg-violet-500"}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className={publicMode ? "mt-2 text-sm leading-5 text-slate-300" : "mt-2 text-sm leading-5 text-slate-600"}>{text}</p>
    </div>
  );
}

export function ResultTextCard({ publicMode, title, text }: { publicMode: boolean; title: string; text: string }) {
  return (
    <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-3 text-slate-100" : "rounded-lg border border-slate-200 bg-white p-3 text-slate-700"}>
      <p className={publicMode ? "text-sm font-semibold text-amber-100" : "text-sm font-semibold text-violet-800"}>{title}</p>
      <p className={publicMode ? "mt-2 text-sm leading-5 text-slate-300" : "mt-2 text-sm leading-5 text-slate-600"}>{text}</p>
    </div>
  );
}
