"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ArrowLeft, Bookmark, CalendarDays, HeartHandshake, MessageCircle, RotateCcw, Share2, Sparkles } from "lucide-react";
import { FinalAstroMap } from "./AstroChartVisual";
import type { CompatibilityResult, ZodiacSign } from "./types";
import { primaryButtonClass, secondaryButtonClass } from "./WizardControls";

export function ResultPanel({
  publicMode,
  result,
  levelLabel,
  onEdit,
  onReset,
  onSave,
  onShare,
  firstSign,
  secondSign,
}: {
  publicMode: boolean;
  result: CompatibilityResult;
  levelLabel: string;
  onEdit: () => void;
  onReset: () => void;
  onSave?: () => void;
  onShare?: () => void;
  firstSign?: ZodiacSign | null;
  secondSign?: ZodiacSign | null;
}) {
  const [saved, setSaved] = useState(false);
  const scoreStyle = { "--relationship-score": `${result.scores.total * 3.6}deg` } as CSSProperties;

  function savePair() {
    onSave?.();
    setSaved(true);
  }

  return (
    <div className="min-w-0 space-y-4">
      <div
        className={
          publicMode
            ? "overflow-hidden rounded-lg border border-amber-200/20 bg-gradient-to-br from-fuchsia-300/12 via-rose-300/12 to-amber-200/12 p-4 text-white shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
            : "overflow-hidden rounded-lg border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-amber-50 p-4 text-slate-950 shadow-sm"
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={publicMode ? "rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-50" : "rounded-full border border-violet-100 bg-white px-3 py-1 text-xs font-semibold text-violet-800"}>
            Карта отношений
          </span>
          <span className={publicMode ? "rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-slate-200" : "rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600"}>
            {result.relationshipModeLabel}
          </span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0">
            <p className={publicMode ? "text-xs font-semibold uppercase tracking-wide text-fuchsia-100" : "text-xs font-semibold uppercase tracking-wide text-violet-700"}>{result.modeLabel}</p>
            <h2 className="mt-2 break-words text-2xl font-semibold leading-tight [overflow-wrap:anywhere]">{result.pairLabel}</h2>
            <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-200" : "mt-2 text-sm leading-6 text-slate-700"}>{result.connectionLevel}</p>
          </div>
          <RelationshipScoreRing publicMode={publicMode} value={result.scores.total} label={levelLabel} style={scoreStyle} />
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <QuickMetric publicMode={publicMode} label="Эмоции" value={result.scores.love} text={result.loveText} />
          <QuickMetric publicMode={publicMode} label="Общение" value={result.scores.communication} text={result.communicationText} />
          <QuickMetric publicMode={publicMode} label="Быт / ритм" value={result.scores.household} text={result.householdText} />
        </div>
      </div>

      <FinalAstroMap
        publicMode={publicMode}
        mode="couple"
        primarySign={firstSign}
        secondarySign={secondSign}
        relationshipMode={result.relationshipMode}
        score={result.scores.total}
        scoreTier={result.scoreTierLabel}
        title={`Карта связи · ${result.pairLabel}`}
        caption={`${result.pairLabel}: символическая схема показывает, где пара легче чувствует друг друга, где нужен перевод слов на спокойный язык и где рождается общий рост.`}
        chartType="relationship"
      />

      <div className={publicMode ? "rounded-lg border border-amber-200/20 bg-amber-200/10 p-3" : "rounded-lg border border-amber-200 bg-amber-50 p-3"}>
        <div className="flex items-start gap-3">
          <Sparkles className={publicMode ? "mt-0.5 h-5 w-5 shrink-0 text-amber-100" : "mt-0.5 h-5 w-5 shrink-0 text-amber-700"} />
          <div className="min-w-0">
            <p className={publicMode ? "text-sm font-semibold text-amber-50" : "text-sm font-semibold text-amber-950"}>Главный совет</p>
            <p className={publicMode ? "mt-1 break-words text-sm leading-6 text-amber-50/90 [overflow-wrap:anywhere]" : "mt-1 break-words text-sm leading-6 text-amber-950 [overflow-wrap:anywhere]"}>{result.coupleAdvice}</p>
          </div>
        </div>
      </div>

      <div className={publicMode ? "sticky top-2 z-10 -mx-1 overflow-x-auto rounded-lg border border-white/10 bg-slate-950/88 p-1 backdrop-blur" : "sticky top-2 z-10 -mx-1 overflow-x-auto rounded-lg border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur"}>
        <div className="flex min-w-max gap-1">
          {[
            ["#relationship-overview", "Обзор"],
            ["#relationship-strengths", "Сильные стороны"],
            ["#relationship-risks", "Риски"],
            ["#relationship-talk", "Как общаться"],
            ["#relationship-calendar", "30 дней"],
            ["#relationship-message", "Что написать"],
            ["#relationship-action", "Действие сегодня"],
          ].map(([href, label]) => (
            <a key={href} href={href} className={publicMode ? "rounded-md px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white" : "rounded-md px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-violet-50 hover:text-violet-900"}>
              {label}
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <ResultSectionCard id="relationship-overview" publicMode={publicMode} title="✨ Обзор" icon={<HeartHandshake className="h-5 w-5" />}>
          <ResultText publicMode={publicMode} text={result.overviewText} />
          <ResultText publicMode={publicMode} text={`${result.scoreTierLabel}. ${result.conclusionText}`} />
        </ResultSectionCard>

        <ResultSectionCard id="relationship-strengths" publicMode={publicMode} title="Сильные стороны" icon={<Sparkles className="h-5 w-5" />}>
          <ScoreBar publicMode={publicMode} label="🔥 Притяжение" value={result.scores.attraction} text={result.attractionText} />
          <ResultText publicMode={publicMode} text={result.strengthText} />
          <ResultBulletList
            publicMode={publicMode}
            items={[
              `${result.scores.love >= 70 ? "Эмоции быстро оживают" : "Эмоции раскрываются постепенно"}: ${result.loveText}`,
              `${result.scores.communication >= 70 ? "Разговор может стать опорой" : "Разговору нужен ясный формат"}: ${result.communicationText}`,
              `${result.scores.household >= 70 ? "Ритм пары можно стабилизировать" : "Ритм требует договорённостей"}: ${result.householdText}`,
            ]}
          />
          {result.nameResonance ? <ResultText publicMode={publicMode} text={result.nameResonance.text} /> : null}
        </ResultSectionCard>

        <ResultSectionCard id="relationship-risks" publicMode={publicMode} title="Риски" icon={<Sparkles className="h-5 w-5" />}>
          <ResultText publicMode={publicMode} text={result.conflictPointsText} />
          <ResultText publicMode={publicMode} text={result.weakSpotText} />
          <ResultText publicMode={publicMode} text={result.riskText} />
          <ResultBulletList
            publicMode={publicMode}
            items={[
              "Не спорить на усталости: сначала пауза, потом одна конкретная тема.",
              "Не проверять чувства молчанием: лучше назвать ожидание прямо и коротко.",
              `Не превращать ${result.relationshipModeLabel.toLowerCase()} в экзамен: паре нужен следующий шаг, а не победитель разговора.`,
            ]}
          />
        </ResultSectionCard>

        <ResultSectionCard id="relationship-talk" publicMode={publicMode} title="Как общаться" icon={<MessageCircle className="h-5 w-5" />}>
          <ScoreBar publicMode={publicMode} label="💬 Общение" value={result.scores.communication} text={result.communicationText} />
          <ResultText publicMode={publicMode} text={result.communicationPlanText} />
          <ResultText publicMode={publicMode} text={result.bestContactFormat} />
        </ResultSectionCard>

        <ResultSectionCard id="relationship-calendar" publicMode={publicMode} title="30 дней" icon={<CalendarDays className="h-5 w-5" />}>
          <ResultText publicMode={publicMode} text="На ближайший месяц лучше держать ритм маленьких действий: один ясный разговор, один общий план и одна мягкая пауза вместо попытки решить всё сразу." />
        </ResultSectionCard>

        <ResultSectionCard id="relationship-message" publicMode={publicMode} title="Что написать" icon={<MessageCircle className="h-5 w-5" />}>
          <ResultText publicMode={publicMode} text={`Лучше начать с короткой спокойной фразы: признать состояние, назвать одну просьбу и оставить место для ответа. ${result.bestContactFormat}`} />
        </ResultSectionCard>

        <ResultSectionCard id="relationship-action" publicMode={publicMode} title="Действие сегодня" icon={<Sparkles className="h-5 w-5" />}>
          <ResultText publicMode={publicMode} text={result.adviceText} />
          <ResultText publicMode={publicMode} text={`Следующий шаг: выберите один небольшой жест на сегодня и один разговор без подтекста. Для ${result.pairLabel} это полезнее, чем пытаться решить весь сценарий сразу.`} />
        </ResultSectionCard>
      </div>

      {result.validationMessages.map((message) => (
        <p key={message} className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{message}</p>
      ))}
      {result.note ? <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{result.note}</p> : null}

      {onSave || onShare ? (
        <div className="grid gap-3 pt-1 sm:grid-cols-2">
          {onSave ? (
            <button type="button" onClick={savePair} className={secondaryButtonClass(publicMode)} aria-live="polite">
              <Bookmark className="h-4 w-4" />
              {saved ? "Пара сохранена" : "Сохранить пару"}
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

      <div className="grid gap-3 pt-1 sm:grid-cols-2">
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

function RelationshipScoreRing({ publicMode, value, label, style }: { publicMode: boolean; value: number; label: string; style: CSSProperties }) {
  return (
    <div className="mx-auto grid h-36 w-36 shrink-0 place-items-center rounded-full p-2" style={{ ...style, background: "conic-gradient(from -90deg, #f0abfc var(--relationship-score), rgba(255,255,255,0.16) 0deg)" }}>
      <div className={publicMode ? "grid h-full w-full place-items-center rounded-full border border-white/10 bg-slate-950/80 text-center" : "grid h-full w-full place-items-center rounded-full border border-violet-100 bg-white text-center shadow-sm"}>
        <div>
          <p className={publicMode ? "text-4xl font-semibold text-amber-100" : "text-4xl font-semibold text-violet-700"}>{value}%</p>
          <p className={publicMode ? "mt-1 px-4 text-xs font-semibold leading-4 text-fuchsia-100" : "mt-1 px-4 text-xs font-semibold leading-4 text-violet-800"}>{label}</p>
        </div>
      </div>
    </div>
  );
}

function QuickMetric({ publicMode, label, value, text }: { publicMode: boolean; label: string; value: number; text: string }) {
  return (
    <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-3" : "rounded-lg border border-white/70 bg-white/75 p-3"}>
      <div className="flex items-center justify-between gap-3">
        <p className={publicMode ? "text-sm font-semibold text-white" : "text-sm font-semibold text-slate-950"}>{label}</p>
        <span className={publicMode ? "rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-amber-100" : "rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800"}>{value}%</span>
      </div>
      <p className={publicMode ? "mt-2 line-clamp-2 text-xs leading-5 text-slate-300" : "mt-2 line-clamp-2 text-xs leading-5 text-slate-600"}>{text}</p>
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

function ResultSectionCard({ id, publicMode, title, icon, children }: { id: string; publicMode: boolean; title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className={publicMode ? "scroll-mt-24 rounded-lg border border-white/12 bg-white/8 p-3 text-slate-100" : "scroll-mt-24 rounded-lg border border-slate-200 bg-white p-3 text-slate-700"}>
      <div className="flex items-center gap-2">
        <span className={publicMode ? "grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/12 bg-white/8 text-amber-100" : "grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-violet-100 bg-violet-50 text-violet-700"}>
          {icon}
        </span>
        <h3 className={publicMode ? "text-base font-semibold text-white" : "text-base font-semibold text-slate-950"}>{title}</h3>
      </div>
      <div className="mt-3 grid gap-3">{children}</div>
    </section>
  );
}

function ResultText({ publicMode, text }: { publicMode: boolean; text: string }) {
  return <p className={publicMode ? "break-words text-sm leading-6 text-slate-300 [overflow-wrap:anywhere]" : "break-words text-sm leading-6 text-slate-600 [overflow-wrap:anywhere]"}>{text}</p>;
}

function ResultBulletList({ publicMode, items }: { publicMode: boolean; items: string[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item} className={publicMode ? "rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm leading-5 text-slate-200" : "rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm leading-5 text-slate-700"}>
          {item}
        </li>
      ))}
    </ul>
  );
}
