import React, { useState } from "react";
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
  ZodiacSignId,
} from "../lib/zodiac-mystic-content";
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

export function BirthMatrixFeature({ publicMode, birthDateString, onBirthDateChange }: CommonProps & { birthDateString?: string; onBirthDateChange: (val: string) => void }) {
  const [inputVal, setInputVal] = useState(birthDateString || "");
  const [matrix, setMatrix] = useState<ReturnType<typeof generateBirthMatrix>>(birthDateString ? generateBirthMatrix(birthDateString) : null);

  const handleApply = () => {
    if (inputVal && inputVal.length === 10) {
      setMatrix(generateBirthMatrix(inputVal));
      onBirthDateChange(inputVal);
    } else {
      setMatrix(null);
    }
  };

  return (
    <FeatureCard publicMode={publicMode} title="🔢 Матрица даты рождения" subtitle="Нумерологический символизм вашей даты">
      <div className="mt-4">
        {!matrix ? (
          <div className={publicMode ? "rounded bg-white/5 p-4 text-center" : "rounded bg-slate-50 p-4 text-center"}>
            <p className={publicMode ? "text-sm text-slate-300 mb-3" : "text-sm text-slate-600 mb-3"}>Введите дату рождения (ДД.ММ.ГГГГ), чтобы рассчитать матрицу. Данные не сохраняются.</p>
            <input
              type="text"
              placeholder="ДД.ММ.ГГГГ"
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
              disabled={inputVal.length !== 10}
              className={
                publicMode
                  ? "mt-3 w-full rounded bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
                  : "mt-3 w-full rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              }
            >
              Рассчитать
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <p className={publicMode ? "text-sm text-slate-400" : "text-sm text-slate-500"}>Дата: {inputVal}</p>
              <button onClick={() => setMatrix(null)} className={publicMode ? "text-xs text-indigo-400 hover:text-indigo-300" : "text-xs text-indigo-600 hover:text-indigo-500"}>
                Изменить
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className={publicMode ? "rounded bg-indigo-500/10 p-2 text-center" : "rounded bg-indigo-50 p-2 text-center"}>
                <p className={publicMode ? "text-xs text-slate-400" : "text-xs text-slate-500"}>Путь</p>
                <p className={publicMode ? "text-xl font-bold text-indigo-400" : "text-xl font-bold text-indigo-600"}>{matrix.lifePath}</p>
              </div>
              <div className={publicMode ? "rounded bg-white/5 p-2 text-center" : "rounded bg-slate-50 p-2 text-center"}>
                <p className={publicMode ? "text-xs text-slate-400" : "text-xs text-slate-500"}>День</p>
                <p className={publicMode ? "text-xl font-bold text-slate-200" : "text-xl font-bold text-slate-700"}>{matrix.dayNumber}</p>
              </div>
              <div className={publicMode ? "rounded bg-white/5 p-2 text-center" : "rounded bg-slate-50 p-2 text-center"}>
                <p className={publicMode ? "text-xs text-slate-400" : "text-xs text-slate-500"}>Месяц</p>
                <p className={publicMode ? "text-xl font-bold text-slate-200" : "text-xl font-bold text-slate-700"}>{matrix.monthNumber}</p>
              </div>
              <div className={publicMode ? "rounded bg-white/5 p-2 text-center" : "rounded bg-slate-50 p-2 text-center"}>
                <p className={publicMode ? "text-xs text-slate-400" : "text-xs text-slate-500"}>Год</p>
                <p className={publicMode ? "text-xl font-bold text-slate-200" : "text-xl font-bold text-slate-700"}>{matrix.yearSum}</p>
              </div>
            </div>

            <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Сильные стороны:</strong> {matrix.strengths}</p>
            <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Зоны риска:</strong> {matrix.risks}</p>
            <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Отношения:</strong> {matrix.relationships}</p>
            <p className={publicMode ? "text-sm text-slate-300" : "text-sm text-slate-600"}><strong>Реализация:</strong> {matrix.moneyWork}</p>
            
            <div className={publicMode ? "rounded bg-white/10 p-3 text-center" : "rounded bg-slate-50 p-3 text-center"}>
              <p className={publicMode ? "text-sm font-medium text-emerald-400" : "text-sm font-medium text-emerald-600"}>{matrix.advice}</p>
            </div>
          </div>
        )}
      </div>
    </FeatureCard>
  );
}
