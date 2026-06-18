import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  generateDailyCard,
  generateTarotDay,
  generateRuneDay,
  generateIntuitiveSign,
  generateTalismans,
  generateAuraColor,
  generateLunarRitual,
  generateKarmicLessons,
  generateBirthMatrix,
  type BirthMatrixSectionId,
  type MysticBirthMatrix,
  ZodiacSignId,
} from "../lib/zodiac-mystic-content";
import type { ZodiacAnalyticsEventName, ZodiacAnalyticsPayload } from "@/lib/zodiac-mini-app-analytics-shared";
import type { ZodiacRetentionDraft } from "./zodiac-mini-app/retention";
import { BirthMatrixVisual } from "./zodiac-mini-app/BirthMatrixVisual";
import { FeatureCard, EmptyFeatureCard } from "./zodiac-mini-app/ui-primitives";

const signNames: Record<ZodiacSignId, string> = {
  aries: "Овен", taurus: "Телец", gemini: "Близнецы", cancer: "Рак",
  leo: "Лев", virgo: "Дева", libra: "Весы", scorpio: "Скорпион",
  sagittarius: "Стрелец", capricorn: "Козерог", aquarius: "Водолей", pisces: "Рыбы"
};

interface CommonProps {
  publicMode: boolean;
}

export function DailyCardFeature({ publicMode, dateKey, sign }: CommonProps & { dateKey: string; sign: ZodiacSignId }) {
  const card = generateDailyCard(dateKey, sign);
  return (
    <FeatureCard publicMode={publicMode} title={`🔮 Карта дня: ${card.title}`} subtitle={card.theme}>
      <div className="mt-4 space-y-3">
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Символический смысл:</strong> {card.phrase}</p>
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Любовь:</strong> {card.love}</p>
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Дела и ресурсы:</strong> {card.money}</p>
        <div className={publicMode ? "rounded bg-white/10 p-3" : "rounded bg-slate-50 p-3"}>
          <p className={publicMode ? "text-sm text-white" : "text-sm text-slate-800"}><strong>Действие:</strong> {card.action}</p>
          <p className={publicMode ? "text-sm text-white mt-1" : "text-sm text-slate-800 mt-1"}><strong>Избегать:</strong> {card.avoid}</p>
        </div>
        <p className={publicMode ? "text-sm font-medium text-emerald-400" : "text-sm font-medium text-emerald-600"}>Совет: {card.advice}</p>
      </div>
    </FeatureCard>
  );
}

export function TarotCardFeature({ publicMode, dateKey, sign }: CommonProps & { dateKey: string; sign: ZodiacSignId }) {
  const card = generateTarotDay(dateKey, sign);
  return (
    <FeatureCard publicMode={publicMode} title={`🃏 Таро дня: ${card.card}`} subtitle={card.mainMeaning}>
      <div className="mt-4 space-y-3">
        <p className={publicMode ? "text-sm text-slate-300 italic" : "text-sm text-slate-600 italic"}>«{card.phrase}»</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className={publicMode ? "rounded border border-emerald-500/30 bg-emerald-500/10 p-3" : "rounded border border-emerald-200 bg-emerald-50 p-3"}>
            <p className={publicMode ? "text-xs font-semibold text-emerald-400" : "text-xs font-semibold text-emerald-700"}>Светлая сторона</p>
            <p className={publicMode ? "mt-1 text-sm text-slate-200" : "mt-1 text-sm text-slate-700"}>{card.lightSide}</p>
          </div>
          <div className={publicMode ? "rounded border border-rose-500/30 bg-rose-500/10 p-3" : "rounded border border-rose-200 bg-rose-50 p-3"}>
            <p className={publicMode ? "text-xs font-semibold text-rose-400" : "text-xs font-semibold text-rose-700"}>Теневая сторона</p>
            <p className={publicMode ? "mt-1 text-sm text-slate-200" : "mt-1 text-sm text-slate-700"}>{card.shadowSide}</p>
          </div>
        </div>
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Отношения:</strong> {card.love}</p>
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Дела:</strong> {card.money}</p>
        <p className={publicMode ? "text-sm font-medium text-amber-400" : "text-sm font-medium text-amber-600"}>Совет: {card.advice}</p>
      </div>
    </FeatureCard>
  );
}

export function RuneDayFeature({ publicMode, dateKey, sign }: CommonProps & { dateKey: string; sign: ZodiacSignId }) {
  const rune = generateRuneDay(dateKey, sign);
  return (
    <FeatureCard publicMode={publicMode} title={`ᚱ Руна дня: ${rune.name} (${rune.symbol})`} subtitle={rune.mainMeaning}>
      <div className="mt-4 space-y-3">
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Сила руны:</strong> {rune.power}</p>
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Риск:</strong> {rune.risk}</p>
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>В любви:</strong> {rune.love}</p>
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>В делах:</strong> {rune.money}</p>
        <div className={publicMode ? "rounded bg-white/10 p-3 text-center" : "rounded bg-slate-50 p-3 text-center"}>
          <p className={publicMode ? "text-sm font-medium text-white" : "text-sm font-medium text-slate-800"}>{rune.advice}</p>
        </div>
      </div>
    </FeatureCard>
  );
}

export function IntuitiveSignFeature({ publicMode, dateKey, sign }: CommonProps & { dateKey: string; sign: ZodiacSignId }) {
  const signData = generateIntuitiveSign(dateKey, sign);
  return (
    <FeatureCard publicMode={publicMode} title={`👁 Интуитивный знак: ${signData.sign}`} subtitle={signData.meaning}>
      <div className="mt-4 space-y-3">
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Где встретить:</strong> {signData.whereToLook}</p>
        <div className={publicMode ? "rounded bg-emerald-500/10 p-3" : "rounded bg-emerald-50 p-3"}>
          <p className={publicMode ? "text-sm font-medium text-emerald-400" : "text-sm font-medium text-emerald-700"}>Что делать, если увидите:</p>
          <p className={publicMode ? "text-sm text-emerald-200 mt-1" : "text-sm text-emerald-800 mt-1"}>{signData.whatToDo}</p>
        </div>
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Чего избегать:</strong> {signData.whatToAvoid}</p>
      </div>
    </FeatureCard>
  );
}

export function TalismansFeature({ publicMode, sign }: CommonProps & { sign: ZodiacSignId | "" }) {
  if (!sign) return <EmptyFeatureCard publicMode={publicMode} title="🧿 Талисманы" text="Выберите свой знак, чтобы открыть символы силы." />;
  const data = generateTalismans(sign);
  return (
    <FeatureCard publicMode={publicMode} title={`🧿 Талисманы: ${signNames[sign as ZodiacSignId]}`} subtitle="Ваши личные символы силы и ресурсные элементы">
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className={publicMode ? "rounded bg-white/5 p-2" : "rounded bg-slate-50 p-2"}>
            <p className={publicMode ? "text-xs text-slate-400" : "text-xs text-slate-500"}>Главный талисман</p>
            <p className={publicMode ? "text-sm font-medium text-white" : "text-sm font-medium text-slate-800"}>{data.mainTalisman}</p>
          </div>
          <div className={publicMode ? "rounded bg-white/5 p-2" : "rounded bg-slate-50 p-2"}>
            <p className={publicMode ? "text-xs text-slate-400" : "text-xs text-slate-500"}>Камень силы</p>
            <p className={publicMode ? "text-sm font-medium text-white" : "text-sm font-medium text-slate-800"}>{data.powerStone}</p>
          </div>
          <div className={publicMode ? "rounded bg-white/5 p-2" : "rounded bg-slate-50 p-2"}>
            <p className={publicMode ? "text-xs text-slate-400" : "text-xs text-slate-500"}>Цвет удачи</p>
            <p className={publicMode ? "text-sm font-medium text-white" : "text-sm font-medium text-slate-800"}>{data.powerColor}</p>
          </div>
          <div className={publicMode ? "rounded bg-white/5 p-2" : "rounded bg-slate-50 p-2"}>
            <p className={publicMode ? "text-xs text-slate-400" : "text-xs text-slate-500"}>Число силы</p>
            <p className={publicMode ? "text-sm font-medium text-white" : "text-sm font-medium text-slate-800"}>{data.powerNumber}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Растение:</strong> {data.plant}</p>
          <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Животное:</strong> {data.animal}</p>
          <p className={publicMode ? "text-sm text-slate-300 mt-2" : "text-sm text-slate-600 mt-2"}><strong>Талисман для любви:</strong> {data.loveTalisman}</p>
          <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Талисман для денег:</strong> {data.moneyTalisman}</p>
          <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Для спокойствия:</strong> {data.calmTalisman}</p>
        </div>
        <div className={publicMode ? "mt-4 rounded border border-white/10 p-3" : "mt-4 rounded border border-slate-200 p-3"}>
          <p className={publicMode ? "text-sm font-medium text-white" : "text-sm font-medium text-slate-800"}>Аффирмация: «{data.phrase}»</p>
        </div>
      </div>
    </FeatureCard>
  );
}

export function AuraColorFeature({ publicMode, dateKey, sign }: CommonProps & { dateKey: string; sign: ZodiacSignId }) {
  const aura = generateAuraColor(dateKey, sign);
  return (
    <FeatureCard publicMode={publicMode} title={`🌈 Цвет дня: ${aura.color}`} subtitle={`Энергия: ${aura.aura}`}>
      <div className="mt-4 space-y-3">
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Смысл:</strong> {aura.meaning}</p>
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Как использовать:</strong> {aura.howToUse}</p>
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Любовь:</strong> {aura.love}</p>
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Дела:</strong> {aura.money}</p>
        <p className={publicMode ? "text-sm text-rose-400" : "text-sm text-rose-600"}><strong>Избегать:</strong> {aura.avoid}</p>
      </div>
    </FeatureCard>
  );
}

export function LunarRitualFeature({ publicMode, dateKey }: CommonProps & { dateKey: string }) {
  const ritual = generateLunarRitual(dateKey);
  return (
    <FeatureCard publicMode={publicMode} title={`🌙 Лунный ритуал`} subtitle={ritual.theme}>
      <div className="mt-4 space-y-3">
        <div className={publicMode ? "rounded bg-white/5 p-3" : "rounded bg-slate-50 p-3"}>
          <p className={publicMode ? "text-sm font-medium text-white mb-2" : "text-sm font-medium text-slate-800 mb-2"}>Намерение дня:</p>
          <p className={publicMode ? "text-sm text-emerald-400 italic" : "text-sm text-emerald-600 italic"}>«{ritual.intention}»</p>
        </div>
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Что понадобится:</strong> {ritual.preparation}</p>
        <div className="pl-4 border-l-2 border-indigo-500/50 space-y-2">
          <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-700"}>1. {ritual.step1}</p>
          <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-700"}>2. {ritual.step2}</p>
          <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-700"}>3. {ritual.step3}</p>
        </div>
        <p className={publicMode ? "text-sm text-slate-300 mt-2" : "text-sm text-slate-600 mt-2"}><strong>Символически отпустить:</strong> {ritual.release}</p>
      </div>
    </FeatureCard>
  );
}

export function KarmicLessonsFeature({ publicMode, sign, birthDateKey }: CommonProps & { sign: ZodiacSignId | ""; birthDateKey?: string }) {
  if (!sign) return <EmptyFeatureCard publicMode={publicMode} title="🧬 Кармические уроки" text="Выберите свой знак, чтобы прочесть урок." />;
  const lessons = generateKarmicLessons(sign, birthDateKey);
  return (
    <FeatureCard publicMode={publicMode} title={`🧬 Кармические уроки`} subtitle={lessons.mainLesson}>
      <div className="mt-4 space-y-3">
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Повторяющийся сценарий:</strong> {lessons.recurringScenario}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className={publicMode ? "rounded bg-white/5 p-2" : "rounded bg-slate-50 p-2"}>
            <p className={publicMode ? "text-xs text-slate-400" : "text-xs text-slate-500"}>Ваша сила</p>
            <p className={publicMode ? "text-sm text-white" : "text-sm text-slate-800"}>{lessons.strength}</p>
          </div>
          <div className={publicMode ? "rounded bg-white/5 p-2" : "rounded bg-slate-50 p-2"}>
            <p className={publicMode ? "text-xs text-slate-400" : "text-xs text-slate-500"}>Зона риска</p>
            <p className={publicMode ? "text-sm text-white" : "text-sm text-slate-800"}>{lessons.riskZone}</p>
          </div>
        </div>
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>В отношениях:</strong> {lessons.relationships}</p>
        <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>В ресурсах:</strong> {lessons.money}</p>
        <div className={publicMode ? "mt-4 rounded border border-white/10 p-3" : "mt-4 rounded border border-slate-200 p-3"}>
          <p className={publicMode ? "text-sm font-medium text-emerald-400" : "text-sm font-medium text-emerald-600"}>Совет: {lessons.monthlyAdvice}</p>
        </div>
      </div>
    </FeatureCard>
  );
}

export function BirthMatrixFeature({
  publicMode,
  birthDateString,
  onBirthDateChange,
  onSave,
  onShare,
  onEvent,
}: CommonProps & {
  birthDateString?: string;
  onBirthDateChange: (val: string) => void;
  onSave?: (action: ZodiacRetentionDraft) => void;
  onShare?: (action: ZodiacRetentionDraft) => Promise<string | void> | string | void;
  onEvent?: (event: ZodiacAnalyticsEventName, payload: ZodiacAnalyticsPayload) => void;
}) {
  const [inputVal, setInputVal] = useState(birthDateString || "");
  const [matrix, setMatrix] = useState<ReturnType<typeof generateBirthMatrix>>(birthDateString ? generateBirthMatrix(birthDateString) : null);
  const [activeSection, setActiveSection] = useState<BirthMatrixSectionId>("main");
  const [saveStatus, setSaveStatus] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const startedTrackedRef = useRef(false);
  const resultTrackedRef = useRef("");
  const currentSection = matrix?.sections.find((section) => section.id === activeSection) ?? matrix?.sections[0] ?? null;
  const currentAction = useMemo(() => (matrix ? buildBirthMatrixRetentionAction(matrix) : null), [matrix]);

  useEffect(() => {
    if (startedTrackedRef.current) return;
    startedTrackedRef.current = true;
    onEvent?.("birth_matrix_started", birthMatrixAnalyticsPayload(matrix, Boolean(birthDateString || inputVal)));
  }, [birthDateString, inputVal, matrix, onEvent]);

  useEffect(() => {
    if (!matrix) return;
    const trackKey = `${matrix.matrixType}:${matrix.centralNumber}:${matrix.archetypeKey}`;
    if (resultTrackedRef.current === trackKey) return;
    resultTrackedRef.current = trackKey;
    onEvent?.("birth_matrix_calculated", birthMatrixAnalyticsPayload(matrix, true));
  }, [matrix, onEvent]);

  const handleApply = () => {
    const nextMatrix = generateBirthMatrix(inputVal);
    if (nextMatrix) {
      setMatrix(nextMatrix);
      setActiveSection("main");
      setSaveStatus("");
      setShareStatus("");
      onBirthDateChange(nextMatrix.displayDate);
    } else {
      setMatrix(null);
    }
  };

  const handleSectionSelect = (section: BirthMatrixSectionId) => {
    setActiveSection(section);
    if (matrix) onEvent?.("feature_depth_viewed", birthMatrixAnalyticsPayload(matrix, true, section));
  };

  const handleSave = () => {
    if (!currentAction || !matrix) return;
    onSave?.(currentAction);
    onEvent?.("birth_matrix_saved", birthMatrixAnalyticsPayload(matrix, true));
    setSaveStatus("Сохранено");
  };

  const handleShare = async () => {
    if (!currentAction || !matrix) return;
    onEvent?.("birth_matrix_shared", birthMatrixAnalyticsPayload(matrix, true));
    const result = await onShare?.(currentAction);
    setShareStatus(typeof result === "string" && result ? result : "Ссылка готова");
  };

  return (
    <FeatureCard publicMode={publicMode} title="🧿 Матрица судьбы" subtitle="Символическая интерпретация по дате рождения без фатальных обещаний">
      <div className="mt-4 space-y-4">
        {!matrix ? (
          <div className={publicMode ? "rounded-lg border border-white/10 bg-white/7 p-4 text-center" : "rounded-lg border border-slate-200 bg-slate-50 p-4 text-center"}>
            <p className={publicMode ? "text-sm text-slate-300 mb-3" : "text-sm text-slate-600 mb-3"}>
              Введите дату рождения, чтобы рассчитать число пути, число души, реализацию, отношения и главный архетип. Сырая дата не сохраняется в истории или аналитике.
            </p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="bday"
              placeholder="1998-06-15 или 15.06.1998"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className={
                publicMode
                  ? "w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-center text-sm text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                  : "w-full rounded border border-slate-300 bg-white px-3 py-2 text-center text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
              }
            />
            <button
              onClick={handleApply}
              disabled={!generateBirthMatrix(inputVal)}
              className={
                publicMode
                  ? "mt-3 w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
                  : "mt-3 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              }
            >
              Рассчитать
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={publicMode ? "rounded-lg border border-amber-200/20 bg-gradient-to-br from-amber-200/12 via-fuchsia-200/10 to-cyan-200/10 p-4" : "rounded-lg border border-amber-100 bg-gradient-to-br from-amber-50 via-fuchsia-50 to-cyan-50 p-4"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={publicMode ? "text-xs font-semibold uppercase tracking-wide text-amber-100" : "text-xs font-semibold uppercase tracking-wide text-amber-800"}>Матрица судьбы</p>
                  <h3 className={publicMode ? "mt-1 text-2xl font-semibold leading-tight text-white" : "mt-1 text-2xl font-semibold leading-tight text-slate-950"}>
                    {matrix.archetype} · код {matrix.centralNumber}
                  </h3>
                  <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-200" : "mt-2 text-sm leading-6 text-slate-700"}>{matrix.hero}</p>
                </div>
                <div className={publicMode ? "rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-center" : "rounded-lg border border-white bg-white/70 px-3 py-2 text-center"}>
                  <p className={publicMode ? "text-xs text-slate-300" : "text-xs text-slate-500"}>Число пути</p>
                  <p className={publicMode ? "text-3xl font-bold text-amber-100" : "text-3xl font-bold text-fuchsia-800"}>{matrix.lifePath}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={publicMode ? "rounded-full border border-emerald-200/25 bg-emerald-200/10 px-3 py-1 text-xs font-semibold text-emerald-100" : "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"}>
                  {matrix.honesty}
                </span>
                <span className={publicMode ? "rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-slate-200" : "rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"}>
                  Дата введена · {matrix.tier}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className={publicMode ? "text-xs text-slate-400" : "text-xs text-slate-500"}>Исходная дата используется только на экране расчёта.</p>
              <button onClick={() => setMatrix(null)} className={publicMode ? "text-xs font-semibold text-indigo-300 hover:text-indigo-200" : "text-xs font-semibold text-indigo-600 hover:text-indigo-500"}>
                Изменить
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Metric publicMode={publicMode} label="Путь" value={matrix.lifePath} />
              <Metric publicMode={publicMode} label="Душа" value={matrix.soulNumber} />
              <Metric publicMode={publicMode} label="Реализация" value={matrix.realizationNumber} />
              <Metric publicMode={publicMode} label="Отношения" value={matrix.relationshipNumber} />
            </div>

            <BirthMatrixVisual publicMode={publicMode} matrix={matrix} activeSection={activeSection} onSectionSelect={handleSectionSelect} />

            <div className="flex gap-2 overflow-x-auto pb-1" data-birth-matrix-tabs="true">
              {matrix.sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => handleSectionSelect(section.id)}
                  data-birth-matrix-tab={section.id}
                  className={`min-h-10 shrink-0 rounded-lg border px-3 text-sm font-semibold transition ${
                    activeSection === section.id
                      ? publicMode
                        ? "border-amber-200/50 bg-amber-200/15 text-amber-50"
                        : "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900"
                      : publicMode
                        ? "border-white/10 bg-white/7 text-slate-300"
                        : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {section.tab}
                </button>
              ))}
            </div>

            {currentSection ? (
              <div className={publicMode ? "rounded-lg border border-white/10 bg-white/7 p-4" : "rounded-lg border border-slate-200 bg-white p-4"} data-birth-matrix-section="true">
                <p className={publicMode ? "text-xs font-semibold uppercase tracking-wide text-amber-100" : "text-xs font-semibold uppercase tracking-wide text-fuchsia-800"}>{currentSection.eyebrow}</p>
                <h4 className={publicMode ? "mt-1 text-lg font-semibold text-white" : "mt-1 text-lg font-semibold text-slate-950"}>{currentSection.title}</h4>
                <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-600"}>{currentSection.body}</p>
                <div className="mt-3 grid gap-2">
                  {currentSection.points.map((point) => (
                    <div key={point} className={publicMode ? "rounded-lg border border-white/10 bg-black/15 p-3 text-sm leading-5 text-slate-200" : "rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm leading-5 text-slate-700"}>
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className={publicMode ? "rounded-lg border border-emerald-200/20 bg-emerald-200/10 p-4" : "rounded-lg border border-emerald-200 bg-emerald-50 p-4"}>
              <p className={publicMode ? "text-sm font-semibold text-emerald-100" : "text-sm font-semibold text-emerald-800"}>3 рекомендации</p>
              <ul className="mt-3 space-y-2">
                {matrix.recommendations.map((item) => (
                  <li key={item} className={publicMode ? "text-sm leading-5 text-slate-200" : "text-sm leading-5 text-slate-700"}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={handleSave} className={publicMode ? "min-h-11 rounded-lg border border-white/15 bg-white/8 px-3 text-sm font-semibold text-white hover:bg-white/12" : "min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"}>
                Сохранить матрицу
              </button>
              <button type="button" onClick={handleShare} className={publicMode ? "min-h-11 rounded-lg border border-white/15 bg-white/8 px-3 text-sm font-semibold text-white hover:bg-white/12" : "min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"}>
                Поделиться
              </button>
            </div>
            {saveStatus || shareStatus ? <p className={publicMode ? "text-center text-sm font-semibold text-emerald-300" : "text-center text-sm font-semibold text-emerald-700"}>{saveStatus || shareStatus}</p> : null}
          </div>
        )}
      </div>
    </FeatureCard>
  );
}

function Metric({ publicMode, label, value }: { publicMode: boolean; label: string; value: number }) {
  return (
    <div className={publicMode ? "rounded-lg border border-white/10 bg-white/7 p-3 text-center" : "rounded-lg border border-slate-200 bg-white p-3 text-center"}>
      <p className={publicMode ? "text-xs text-slate-400" : "text-xs text-slate-500"}>{label}</p>
      <p className={publicMode ? "mt-1 text-2xl font-bold text-indigo-200" : "mt-1 text-2xl font-bold text-indigo-700"}>{value}</p>
    </div>
  );
}

function buildBirthMatrixRetentionAction(matrix: MysticBirthMatrix): ZodiacRetentionDraft {
  return {
    section: "mystic",
    featureKey: "birthMatrix",
    label: "Матрица судьбы",
    mode: matrix.matrixType,
    matrixType: matrix.matrixType,
    archetype: matrix.archetypeKey,
    mainNumber: matrix.centralNumber,
    detail: `${matrix.archetype} · код ${matrix.centralNumber}`,
  };
}

function birthMatrixAnalyticsPayload(matrix: MysticBirthMatrix | null, hasBirthDate: boolean, category = "birth_matrix"): ZodiacAnalyticsPayload {
  return {
    section: "mystic",
    category,
    featureKey: "birthMatrix",
    inputMode: "date",
    matrixType: matrix?.matrixType ?? "symbolic_birth_date",
    mainNumber: matrix?.centralNumber,
    archetype: matrix?.archetypeKey,
    hasBirthDate,
    hasName: false,
  };
}
