import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  generateDailyCard,
  generateTarotDay,
  generateTarotSpread,
  generateRuneDay,
  generateRuneSpread,
  generateIntuitiveSign,
  generateTalismans,
  generateAuraColor,
  generateLunarRitualFlow,
  generateKarmicLessons,
  generateBirthMatrix,
  normalizeLunarDateKey,
  shiftLunarDateKey,
  type BirthMatrixSectionId,
  type MysticBirthMatrix,
  type MysticLunarDateBucket,
  type MysticLunarMode,
  type MysticLunarPlan,
  type MysticRuneSpread,
  type MysticRuneSpreadMode,
  type MysticTarotSpread,
  type MysticTarotSpreadType,
  type MysticTarotTopicId,
  ZodiacSignId,
} from "../lib/zodiac-mystic-content";
import type { ZodiacAnalyticsEventName, ZodiacAnalyticsPayload } from "@/lib/zodiac-mini-app-analytics-shared";
import type { ZodiacRetentionDraft } from "./zodiac-mini-app/retention";
import { BirthMatrixVisual } from "./zodiac-mini-app/BirthMatrixVisual";
import { LunarCalendarVisual } from "./zodiac-mini-app/LunarCalendarVisual";
import { RuneSpreadVisual } from "./zodiac-mini-app/RuneSpreadVisual";
import { TarotSpreadVisual } from "./zodiac-mini-app/TarotSpreadVisual";
import { ZodiacDateInput } from "./zodiac-mini-app/ZodiacDateInput";
import { FeatureCard, EmptyFeatureCard } from "./zodiac-mini-app/ui-primitives";

const signNames: Record<ZodiacSignId, string> = {
  aries: "Овен", taurus: "Телец", gemini: "Близнецы", cancer: "Рак",
  leo: "Лев", virgo: "Дева", libra: "Весы", scorpio: "Скорпион",
  sagittarius: "Стрелец", capricorn: "Козерог", aquarius: "Водолей", pisces: "Рыбы"
};

interface CommonProps {
  publicMode: boolean;
}

type InteractiveMysticProps = CommonProps & {
  dateKey: string;
  sign: ZodiacSignId;
  onSave?: (action: ZodiacRetentionDraft) => void;
  onShare?: (action: ZodiacRetentionDraft) => Promise<string | void> | string | void;
  onEvent?: (event: ZodiacAnalyticsEventName, payload: ZodiacAnalyticsPayload) => void;
};

const tarotTopics: Array<{ id: MysticTarotTopicId; label: string }> = [
  { id: "love", label: "Любовь" },
  { id: "money", label: "Деньги" },
  { id: "work", label: "Работа" },
  { id: "decision", label: "Решение" },
  { id: "hidden_reason", label: "Скрытая причина" },
  { id: "daily_advice", label: "Совет дня" },
];

const tarotSpreadOptions: Array<{ id: MysticTarotSpreadType; label: string; description: string }> = [
  { id: "one_card", label: "1 карта", description: "быстрый совет" },
  { id: "three_cards", label: "3 карты", description: "прошлое / настоящее / возможный шаг" },
  { id: "five_cards", label: "5 карт", description: "ситуация / скрытое / ресурс / риск / действие" },
];

const runeModeOptions: Array<{ id: MysticRuneSpreadMode; label: string; description: string }> = [
  { id: "daily_rune", label: "Руна дня", description: "главный символ дня" },
  { id: "three_runes", label: "Три руны", description: "поддержка / риск / шаг" },
  { id: "question_rune", label: "Руна на вопрос", description: "символический ответ без сохранения вопроса" },
  { id: "protection_rune", label: "Руна защиты", description: "знак опоры и границы" },
];

const lunarModeOptions: Array<{ id: MysticLunarMode; label: string; description: string }> = [
  { id: "lunar_day", label: "Лунный день", description: "ритм, энергия и мягкий фокус" },
  { id: "daily_ritual", label: "Ритуал дня", description: "короткая практика для настройки" },
  { id: "love_ritual", label: "Любовный ритуал", description: "теплый контакт без давления" },
  { id: "money_work", label: "Деньги / работа", description: "фокус, порядок и ресурс" },
  { id: "cleansing", label: "Очищение", description: "убрать лишнее и освободить внимание" },
  { id: "sleep_intuition", label: "Сон / интуиция", description: "вечерняя тишина и внутренний сигнал" },
];

const lunarDateOptions: Array<{ id: MysticLunarDateBucket; label: string }> = [
  { id: "today", label: "Сегодня" },
  { id: "tomorrow", label: "Завтра" },
  { id: "custom", label: "Выбрать дату" },
];

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

export function LegacyTarotCardFeature({ publicMode, dateKey, sign }: CommonProps & { dateKey: string; sign: ZodiacSignId }) {
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

export function LegacyRuneDayFeature({ publicMode, dateKey, sign }: CommonProps & { dateKey: string; sign: ZodiacSignId }) {
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

export function TarotCardFeature({ publicMode, dateKey, sign, onSave, onShare, onEvent }: InteractiveMysticProps) {
  const dayCard = useMemo(() => generateTarotDay(dateKey, sign), [dateKey, sign]);
  const [topic, setTopic] = useState<MysticTarotTopicId>("decision");
  const [spreadType, setSpreadType] = useState<MysticTarotSpreadType>("three_cards");
  const [question, setQuestion] = useState("");
  const [spread, setSpread] = useState<MysticTarotSpread | null>(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const startedTrackedRef = useRef(false);

  useEffect(() => {
    if (startedTrackedRef.current) return;
    startedTrackedRef.current = true;
    onEvent?.("tarot_started", tarotAnalyticsPayload({ topic, spreadType }));
  }, [onEvent, spreadType, topic]);

  const action = useMemo(() => (spread ? buildTarotRetentionAction(spread) : null), [spread]);

  const handleCalculate = () => {
    const nextSpread = generateTarotSpread(dateKey, sign, topic, spreadType, question);
    setSpread(nextSpread);
    setSaveStatus("");
    setShareStatus("");
    onEvent?.("tarot_spread_calculated", tarotAnalyticsPayload(nextSpread));
    onEvent?.("feature_depth_viewed", tarotAnalyticsPayload(nextSpread, "tarot_result"));
  };

  const handleSave = () => {
    if (!action || !spread) return;
    onSave?.(action);
    onEvent?.("tarot_spread_saved", tarotAnalyticsPayload(spread));
    setSaveStatus("Сохранено");
  };

  const handleShare = async () => {
    if (!action || !spread) return;
    onEvent?.("tarot_spread_shared", tarotAnalyticsPayload(spread));
    const result = await onShare?.(action);
    setShareStatus(typeof result === "string" && result ? result : "Ссылка готова");
  };

  return (
    <FeatureCard publicMode={publicMode} title="🃏 Таро: символический расклад" subtitle="Выберите тему и тип расклада. Вопрос можно написать для себя: он не сохраняется и не уходит в аналитику.">
      <div className="mt-4 space-y-4">
        <div className={publicMode ? "rounded-lg border border-amber-200/20 bg-amber-200/10 p-3" : "rounded-lg border border-amber-200 bg-amber-50 p-3"}>
          <p className={publicMode ? "text-xs font-semibold uppercase tracking-wide text-amber-100" : "text-xs font-semibold uppercase tracking-wide text-amber-800"}>Честно о формате</p>
          <p className={publicMode ? "mt-1 text-sm leading-5 text-slate-200" : "mt-1 text-sm leading-5 text-slate-700"}>
            Это символическая интерпретация для размышления и выбора действия, а не фатальное предсказание. Карта дня для фона: <strong>{dayCard.card}</strong> — {dayCard.mainMeaning}.
          </p>
        </div>

        <div>
          <p className={publicMode ? "mb-2 text-sm font-semibold text-white" : "mb-2 text-sm font-semibold text-slate-900"}>Тема вопроса</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {tarotTopics.map((item) => (
              <button key={item.id} type="button" onClick={() => setTopic(item.id)} className={choiceButtonClass(publicMode, topic === item.id)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={publicMode ? "mb-2 block text-sm font-semibold text-white" : "mb-2 block text-sm font-semibold text-slate-900"} htmlFor="tarot-question">
            Сформулируйте вопрос
          </label>
          <textarea
            id="tarot-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value.slice(0, 160))}
            placeholder="Например: что мне выбрать? Поле необязательное и не сохраняется."
            className={
              publicMode
                ? "min-h-24 w-full rounded-lg border border-white/15 bg-white/7 px-3 py-3 text-sm text-white placeholder-slate-500 focus:border-amber-200 focus:outline-none"
                : "min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-400 focus:outline-none"
            }
          />
          <p className={publicMode ? "mt-1 text-xs text-slate-400" : "mt-1 text-xs text-slate-500"}>Сырой текст вопроса не сохраняется в истории, избранном, share или analytics.</p>
        </div>

        <div>
          <p className={publicMode ? "mb-2 text-sm font-semibold text-white" : "mb-2 text-sm font-semibold text-slate-900"}>Тип расклада</p>
          <div className="grid gap-2">
            {tarotSpreadOptions.map((item) => (
              <button key={item.id} type="button" onClick={() => setSpreadType(item.id)} className={choiceButtonClass(publicMode, spreadType === item.id)}>
                <span className="block text-left">{item.label}</span>
                <span className={publicMode ? "mt-1 block text-left text-xs font-normal text-slate-300" : "mt-1 block text-left text-xs font-normal text-slate-500"}>{item.description}</span>
              </button>
            ))}
          </div>
        </div>

        <button type="button" onClick={handleCalculate} className={primaryMysticButtonClass(publicMode)}>
          Рассчитать расклад
        </button>

        {spread ? (
          <div className="space-y-4">
            <div className={publicMode ? "rounded-xl border border-white/10 bg-white/7 p-4" : "rounded-xl border border-slate-200 bg-white p-4"}>
              <p className={publicMode ? "text-xs font-semibold uppercase tracking-wide text-amber-100" : "text-xs font-semibold uppercase tracking-wide text-amber-700"}>Hero summary</p>
              <h3 className={publicMode ? "mt-1 text-xl font-semibold text-white" : "mt-1 text-xl font-semibold text-slate-950"}>{spread.spreadLabel} · {spread.topicLabel}</h3>
              <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-600"}>{spread.hero}</p>
            </div>

            <TarotSpreadVisual publicMode={publicMode} spread={spread} />

            <MysticResultBlock publicMode={publicMode} title="Краткий ответ" body={spread.shortAnswer} />
            <div className={publicMode ? "rounded-xl border border-white/10 bg-white/7 p-4" : "rounded-xl border border-slate-200 bg-white p-4"}>
              <p className={publicMode ? "text-sm font-semibold text-white" : "text-sm font-semibold text-slate-900"}>Карты расклада</p>
              <div className="mt-3 grid gap-2">
                {spread.cards.map((item) => (
                  <div key={`deep-${item.key}`} className={publicMode ? "rounded-lg border border-white/10 bg-black/15 p-3" : "rounded-lg border border-slate-100 bg-slate-50 p-3"}>
                    <p className={publicMode ? "text-xs font-semibold uppercase tracking-wide text-amber-100" : "text-xs font-semibold uppercase tracking-wide text-amber-700"}>{item.position}</p>
                    <p className={publicMode ? "mt-1 text-sm font-semibold text-white" : "mt-1 text-sm font-semibold text-slate-900"}>{item.card.card}</p>
                    <p className={publicMode ? "mt-2 text-sm leading-5 text-slate-300" : "mt-2 text-sm leading-5 text-slate-600"}>{item.deepMeaning}</p>
                  </div>
                ))}
              </div>
            </div>
            <MysticResultBlock publicMode={publicMode} title="Скрытый смысл" body={spread.hiddenMeaning} />
            <MysticResultBlock publicMode={publicMode} title="Риск" body={spread.risk} tone="risk" />
            <MysticResultBlock publicMode={publicMode} title="Действие сегодня" body={spread.actionToday} tone="action" />
            <MysticResultBlock publicMode={publicMode} title="Что не делать" body={spread.avoidToday} />
            <MysticResultBlock publicMode={publicMode} title="Итоговый вывод" body={spread.conclusion} tone="action" />

            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={handleSave} className={secondaryMysticButtonClass(publicMode)}>
                Сохранить расклад
              </button>
              <button type="button" onClick={handleShare} className={secondaryMysticButtonClass(publicMode)}>
                Поделиться
              </button>
            </div>
            {saveStatus || shareStatus ? <p className={publicMode ? "text-center text-sm font-semibold text-emerald-300" : "text-center text-sm font-semibold text-emerald-700"}>{saveStatus || shareStatus}</p> : null}
          </div>
        ) : (
          <p className={publicMode ? "text-center text-sm text-slate-400" : "text-center text-sm text-slate-500"}>Выберите тему и нажмите «Рассчитать расклад», чтобы открыть визуальные карты и интерпретацию.</p>
        )}
      </div>
    </FeatureCard>
  );
}

export function RuneDayFeature({ publicMode, dateKey, sign, onSave, onShare, onEvent }: InteractiveMysticProps) {
  const dayRune = useMemo(() => generateRuneDay(dateKey, sign), [dateKey, sign]);
  const [runeMode, setRuneMode] = useState<MysticRuneSpreadMode>("daily_rune");
  const [question, setQuestion] = useState("");
  const [spread, setSpread] = useState<MysticRuneSpread | null>(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const startedTrackedRef = useRef(false);

  useEffect(() => {
    if (startedTrackedRef.current) return;
    startedTrackedRef.current = true;
    onEvent?.("rune_started", runeAnalyticsPayload({ runeMode }));
  }, [onEvent, runeMode]);

  const action = useMemo(() => (spread ? buildRuneRetentionAction(spread) : null), [spread]);

  const handleCalculate = () => {
    const nextSpread = generateRuneSpread(dateKey, sign, runeMode, question);
    setSpread(nextSpread);
    setSaveStatus("");
    setShareStatus("");
    onEvent?.("rune_spread_calculated", runeAnalyticsPayload(nextSpread));
    onEvent?.("feature_depth_viewed", runeAnalyticsPayload(nextSpread, "rune_result"));
  };

  const handleSave = () => {
    if (!action || !spread) return;
    onSave?.(action);
    onEvent?.("rune_spread_saved", runeAnalyticsPayload(spread));
    setSaveStatus("Сохранено");
  };

  const handleShare = async () => {
    if (!action || !spread) return;
    onEvent?.("rune_spread_shared", runeAnalyticsPayload(spread));
    const result = await onShare?.(action);
    setShareStatus(typeof result === "string" && result ? result : "Ссылка готова");
  };

  return (
    <FeatureCard publicMode={publicMode} title="ᚱ Руны: символический расклад" subtitle="Выберите режим рунической подсказки. Вопрос можно держать на экране, но он не сохраняется.">
      <div className="mt-4 space-y-4">
        <div className={publicMode ? "rounded-lg border border-cyan-200/20 bg-cyan-200/10 p-3" : "rounded-lg border border-cyan-200 bg-cyan-50 p-3"}>
          <p className={publicMode ? "text-xs font-semibold uppercase tracking-wide text-cyan-100" : "text-xs font-semibold uppercase tracking-wide text-cyan-800"}>Честно о формате</p>
          <p className={publicMode ? "mt-1 text-sm leading-5 text-slate-200" : "mt-1 text-sm leading-5 text-slate-700"}>
            Руны работают как символическая подсказка для внимания и действия. Руна дня для фона: <strong>{dayRune.name}</strong> — {dayRune.mainMeaning}.
          </p>
        </div>

        <div>
          <p className={publicMode ? "mb-2 text-sm font-semibold text-white" : "mb-2 text-sm font-semibold text-slate-900"}>Режим</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {runeModeOptions.map((item) => (
              <button key={item.id} type="button" onClick={() => setRuneMode(item.id)} className={choiceButtonClass(publicMode, runeMode === item.id)}>
                <span className="block text-left">{item.label}</span>
                <span className={publicMode ? "mt-1 block text-left text-xs font-normal text-slate-300" : "mt-1 block text-left text-xs font-normal text-slate-500"}>{item.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={publicMode ? "mb-2 block text-sm font-semibold text-white" : "mb-2 block text-sm font-semibold text-slate-900"} htmlFor="rune-question">
            Вопрос к рунам
          </label>
          <textarea
            id="rune-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value.slice(0, 160))}
            placeholder="Можно написать вопрос для себя. Текст не сохраняется."
            className={
              publicMode
                ? "min-h-20 w-full rounded-lg border border-white/15 bg-white/7 px-3 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-200 focus:outline-none"
                : "min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
            }
          />
          <p className={publicMode ? "mt-1 text-xs text-slate-400" : "mt-1 text-xs text-slate-500"}>В сохранение и аналитику попадет только режим и безопасные ключи рун.</p>
        </div>

        <button type="button" onClick={handleCalculate} className={primaryMysticButtonClass(publicMode)}>
          Рассчитать руны
        </button>

        {spread ? (
          <div className="space-y-4">
            <div className={publicMode ? "rounded-xl border border-white/10 bg-white/7 p-4" : "rounded-xl border border-slate-200 bg-white p-4"}>
              <p className={publicMode ? "text-xs font-semibold uppercase tracking-wide text-cyan-100" : "text-xs font-semibold uppercase tracking-wide text-cyan-700"}>Hero summary</p>
              <h3 className={publicMode ? "mt-1 text-xl font-semibold text-white" : "mt-1 text-xl font-semibold text-slate-950"}>{spread.modeLabel}</h3>
              <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-600"}>{spread.hero}</p>
            </div>

            <RuneSpreadVisual publicMode={publicMode} spread={spread} />

            <MysticResultBlock publicMode={publicMode} title="Главная руна" body={`${spread.mainRune.rune.name}: ${spread.mainRune.rune.mainMeaning}`} />
            <MysticResultBlock publicMode={publicMode} title="Сила" body={spread.power} tone="action" />
            <MysticResultBlock publicMode={publicMode} title="Риск" body={spread.risk} tone="risk" />
            <MysticResultBlock publicMode={publicMode} title="Совет" body={spread.advice} />
            <MysticResultBlock publicMode={publicMode} title="Действие сегодня" body={spread.actionToday} tone="action" />
            <MysticResultBlock publicMode={publicMode} title="Талисман" body={spread.talisman} />

            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={handleSave} className={secondaryMysticButtonClass(publicMode)}>
                Сохранить расклад
              </button>
              <button type="button" onClick={handleShare} className={secondaryMysticButtonClass(publicMode)}>
                Поделиться
              </button>
            </div>
            {saveStatus || shareStatus ? <p className={publicMode ? "text-center text-sm font-semibold text-emerald-300" : "text-center text-sm font-semibold text-emerald-700"}>{saveStatus || shareStatus}</p> : null}
          </div>
        ) : (
          <p className={publicMode ? "text-center text-sm text-slate-400" : "text-center text-sm text-slate-500"}>Выберите режим и нажмите «Рассчитать руны», чтобы открыть визуальный расклад.</p>
        )}
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

export function LunarRitualFeature({ publicMode, dateKey, onSave, onShare, onEvent }: InteractiveMysticProps) {
  const [mode, setMode] = useState<MysticLunarMode>("daily_ritual");
  const [dateBucket, setDateBucket] = useState<MysticLunarDateBucket>("today");
  const [customDate, setCustomDate] = useState("");
  const [intention, setIntention] = useState("");
  const [plan, setPlan] = useState<MysticLunarPlan | null>(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const startedTrackedRef = useRef(false);
  const selectedDateKey = useMemo(() => resolveLunarSelectedDate(dateKey, dateBucket, customDate), [customDate, dateBucket, dateKey]);
  const hasIntention = intention.trim().length > 0;
  const action = useMemo(() => (plan ? buildLunarRetentionAction(plan) : null), [plan]);

  useEffect(() => {
    if (startedTrackedRef.current) return;
    startedTrackedRef.current = true;
    onEvent?.("lunar_started", lunarAnalyticsPayload({ mode, dateBucket, hasIntention: false }));
  }, [dateBucket, mode, onEvent]);

  const handleCalculate = () => {
    if (!selectedDateKey) return;
    const nextPlan = generateLunarRitualFlow(selectedDateKey, mode, dateBucket, dateKey, hasIntention);
    setPlan(nextPlan);
    setSaveStatus("");
    setShareStatus("");
    onEvent?.(mode === "lunar_day" ? "lunar_day_calculated" : "lunar_ritual_calculated", lunarAnalyticsPayload(nextPlan, hasIntention));
    onEvent?.("feature_depth_viewed", lunarAnalyticsPayload(nextPlan, hasIntention, "lunar_result"));
  };

  const handleCalendarSelect = (nextDateKey: string) => {
    setDateBucket(nextDateKey === dateKey ? "today" : nextDateKey === shiftLunarDateKey(dateKey, 1) ? "tomorrow" : "custom");
    setCustomDate(nextDateKey);
    const nextPlan = generateLunarRitualFlow(nextDateKey, mode, nextDateKey === dateKey ? "today" : nextDateKey === shiftLunarDateKey(dateKey, 1) ? "tomorrow" : "custom", dateKey, hasIntention);
    setPlan(nextPlan);
    setSaveStatus("");
    setShareStatus("");
    onEvent?.("feature_depth_viewed", lunarAnalyticsPayload(nextPlan, hasIntention, "lunar_calendar_day"));
  };

  const handleSave = () => {
    if (!action || !plan) return;
    onSave?.(action);
    onEvent?.("lunar_ritual_saved", lunarAnalyticsPayload(plan, hasIntention));
    setSaveStatus("Сохранено");
  };

  const handleShare = async () => {
    if (!action || !plan) return;
    onEvent?.("lunar_ritual_shared", lunarAnalyticsPayload(plan, hasIntention));
    const result = await onShare?.(action);
    setShareStatus(typeof result === "string" && result ? result : "Ссылка готова");
  };

  return (
    <FeatureCard publicMode={publicMode} title="🌙 Лунный ритуал" subtitle="Символический лунный ритм, календарь на 14 дней и безопасная практика без обещаний и фатальности.">
      <div className="mt-4 space-y-5">
        <div className={publicMode ? "rounded-xl border border-violet-200/20 bg-violet-200/10 p-4" : "rounded-xl border border-violet-100 bg-violet-50 p-4"}>
          <p className={publicMode ? "text-xs font-semibold uppercase tracking-wide text-violet-100" : "text-xs font-semibold uppercase tracking-wide text-violet-800"}>честно о формате</p>
          <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-200" : "mt-2 text-sm leading-6 text-slate-700"}>
            Это приближённая лунная интерпретация для самонаблюдения и мягких действий. Текст намерения не сохраняется, не уходит в analytics и не попадает в share.
          </p>
        </div>

        <div>
          <p className={publicMode ? "mb-2 text-sm font-semibold text-white" : "mb-2 text-sm font-semibold text-slate-900"}>Режим</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {lunarModeOptions.map((item) => (
              <button key={item.id} type="button" onClick={() => setMode(item.id)} className={choiceButtonClass(publicMode, mode === item.id)}>
                <span className="block text-left">{item.label}</span>
                <span className={publicMode ? "mt-1 block text-left text-xs font-normal text-slate-300" : "mt-1 block text-left text-xs font-normal text-slate-500"}>{item.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className={publicMode ? "mb-2 text-sm font-semibold text-white" : "mb-2 text-sm font-semibold text-slate-900"}>Дата</p>
          <div className="grid grid-cols-3 gap-2">
            {lunarDateOptions.map((item) => (
              <button key={item.id} type="button" onClick={() => setDateBucket(item.id)} className={choiceButtonClass(publicMode, dateBucket === item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          {dateBucket === "custom" ? (
            <div className="mt-3">
              <ZodiacDateInput publicMode={publicMode} value={customDate} onChange={setCustomDate} autoComplete="off" hasError={Boolean(customDate && !selectedDateKey)} />
            </div>
          ) : null}
          {dateBucket === "custom" && !selectedDateKey ? <p className={publicMode ? "mt-2 text-xs text-amber-200" : "mt-2 text-xs text-amber-700"}>Введите дату в формате ДД.ММ.ГГГГ.</p> : null}
        </div>

        <div>
          <label className={publicMode ? "mb-2 block text-sm font-semibold text-white" : "mb-2 block text-sm font-semibold text-slate-900"} htmlFor="lunar-intention">
            Намерение
          </label>
          <textarea
            id="lunar-intention"
            value={intention}
            onChange={(event) => setIntention(event.target.value.slice(0, 120))}
            placeholder="Например: Хочу спокойствия. Поле необязательное и не сохраняется."
            className={
              publicMode
                ? "min-h-24 w-full rounded-lg border border-white/15 bg-white/7 px-3 py-3 text-sm text-white placeholder-slate-500 focus:border-violet-200 focus:outline-none"
                : "min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-400 focus:outline-none"
            }
          />
          <p className={publicMode ? "mt-1 text-xs text-slate-400" : "mt-1 text-xs text-slate-500"}>Сохраняется только факт, что намерение было задано, без текста.</p>
        </div>

        <button type="button" onClick={handleCalculate} disabled={!selectedDateKey} className={`${primaryMysticButtonClass(publicMode)} disabled:cursor-not-allowed disabled:opacity-50`}>
          Показать лунный ритуал
        </button>

        {plan ? (
          <div className="space-y-4">
            <div data-lunar-result-hero="true" className={publicMode ? "rounded-2xl border border-violet-200/20 bg-gradient-to-br from-violet-300/18 via-indigo-300/12 to-cyan-300/10 p-4" : "rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-indigo-50 to-cyan-50 p-4"}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={publicMode ? "text-xs font-semibold uppercase tracking-wide text-violet-100" : "text-xs font-semibold uppercase tracking-wide text-violet-800"}>Лунный ритуал</p>
                  <h3 className={publicMode ? "mt-1 text-2xl font-semibold leading-tight text-white" : "mt-1 text-2xl font-semibold leading-tight text-slate-950"}>
                    {plan.modeLabel} · {plan.displayDate}
                  </h3>
                  <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-200" : "mt-2 text-sm leading-6 text-slate-700"}>{plan.hero}</p>
                </div>
                <div className={publicMode ? "shrink-0 rounded-2xl border border-white/15 bg-black/20 px-3 py-2 text-center" : "shrink-0 rounded-2xl border border-white bg-white/75 px-3 py-2 text-center"}>
                  <p className={publicMode ? "text-3xl text-violet-100" : "text-3xl text-violet-800"}>{plan.phaseSymbol}</p>
                  <p className={publicMode ? "mt-1 text-xs font-semibold text-slate-300" : "mt-1 text-xs font-semibold text-slate-600"}>{plan.energyTierLabel}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={publicMode ? "rounded-full border border-emerald-200/25 bg-emerald-200/10 px-3 py-1 text-xs font-semibold text-emerald-100" : "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"}>
                  {plan.honesty}
                </span>
                <span className={publicMode ? "rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-slate-200" : "rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"}>
                  {plan.rhythmLabel}
                </span>
              </div>
            </div>

            <LunarCalendarVisual publicMode={publicMode} days={plan.calendarDays} selectedDateKey={plan.selectedDateKey} onSelectDate={handleCalendarSelect} />

            <MysticResultBlock publicMode={publicMode} title="Энергия дня" body={plan.energy} tone="action" />
            <LunarListBlock publicMode={publicMode} title="Что делать" items={plan.doItems} tone="action" />
            <LunarListBlock publicMode={publicMode} title="Что не делать" items={plan.avoidItems} tone="risk" />

            <div className={publicMode ? "rounded-xl border border-violet-200/20 bg-violet-200/10 p-4" : "rounded-xl border border-violet-100 bg-violet-50 p-4"} data-lunar-ritual-result="true">
              <p className={publicMode ? "text-sm font-semibold text-violet-100" : "text-sm font-semibold text-violet-900"}>Ритуал</p>
              <h4 className={publicMode ? "mt-1 text-lg font-semibold text-white" : "mt-1 text-lg font-semibold text-slate-950"}>{plan.ritual.title}</h4>
              <p className={publicMode ? "mt-2 text-sm leading-5 text-slate-300" : "mt-2 text-sm leading-5 text-slate-600"}><strong>Когда:</strong> {plan.ritual.timing}</p>
              <p className={publicMode ? "mt-1 text-sm leading-5 text-slate-300" : "mt-1 text-sm leading-5 text-slate-600"}><strong>Подготовить:</strong> {plan.ritual.preparation}</p>
              <ol className="mt-3 space-y-2">
                {plan.ritual.steps.map((step, index) => (
                  <li key={step} className={publicMode ? "rounded-lg border border-white/10 bg-black/15 p-3 text-sm leading-5 text-slate-200" : "rounded-lg border border-violet-100 bg-white/75 p-3 text-sm leading-5 text-slate-700"}>
                    <strong>{index + 1}.</strong> {step}
                  </li>
                ))}
              </ol>
              <p className={publicMode ? "mt-3 text-sm font-semibold text-emerald-100" : "mt-3 text-sm font-semibold text-emerald-800"}>{plan.ritual.finalAction}</p>
            </div>

            <LunarListBlock publicMode={publicMode} title="Чек-лист" items={plan.checklist} />
            <MysticResultBlock publicMode={publicMode} title="Действие сегодня" body={plan.actionToday} tone="action" />
            <MysticResultBlock publicMode={publicMode} title="Вечерний итог" body={plan.eveningSummary} />

            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={handleSave} className={secondaryMysticButtonClass(publicMode)}>
                Сохранить ритуал
              </button>
              <button type="button" onClick={handleShare} className={secondaryMysticButtonClass(publicMode)}>
                Поделиться
              </button>
            </div>
            {saveStatus || shareStatus ? <p className={publicMode ? "text-center text-sm font-semibold text-emerald-300" : "text-center text-sm font-semibold text-emerald-700"}>{saveStatus || shareStatus}</p> : null}
          </div>
        ) : null}
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
            <ZodiacDateInput publicMode={publicMode} value={inputVal} onChange={setInputVal} hasError={Boolean(inputVal && !generateBirthMatrix(inputVal))} />
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

function MysticResultBlock({ publicMode, title, body, tone = "default" }: { publicMode: boolean; title: string; body: string; tone?: "default" | "risk" | "action" }) {
  const toneClass =
    tone === "risk"
      ? publicMode
        ? "border-rose-200/20 bg-rose-200/10"
        : "border-rose-200 bg-rose-50"
      : tone === "action"
        ? publicMode
          ? "border-emerald-200/20 bg-emerald-200/10"
          : "border-emerald-200 bg-emerald-50"
        : publicMode
          ? "border-white/10 bg-white/7"
          : "border-slate-200 bg-white";
  const titleClass =
    tone === "risk"
      ? publicMode
        ? "text-rose-100"
        : "text-rose-800"
      : tone === "action"
        ? publicMode
          ? "text-emerald-100"
          : "text-emerald-800"
        : publicMode
          ? "text-white"
          : "text-slate-900";

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className={`text-sm font-semibold ${titleClass}`}>{title}</p>
      <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-600"}>{body}</p>
    </div>
  );
}

function LunarListBlock({ publicMode, title, items, tone = "default" }: { publicMode: boolean; title: string; items: string[]; tone?: "default" | "risk" | "action" }) {
  const toneClass =
    tone === "risk"
      ? publicMode
        ? "border-rose-200/20 bg-rose-200/10"
        : "border-rose-200 bg-rose-50"
      : tone === "action"
        ? publicMode
          ? "border-emerald-200/20 bg-emerald-200/10"
          : "border-emerald-200 bg-emerald-50"
        : publicMode
          ? "border-white/10 bg-white/7"
          : "border-slate-200 bg-white";
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className={publicMode ? "text-sm font-semibold text-white" : "text-sm font-semibold text-slate-900"}>{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className={publicMode ? "flex gap-2 text-sm leading-5 text-slate-200" : "flex gap-2 text-sm leading-5 text-slate-700"}>
            <span className={tone === "risk" ? "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300" : "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300"} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function choiceButtonClass(publicMode: boolean, active: boolean) {
  if (active) {
    return publicMode
      ? "min-h-11 rounded-lg border border-amber-200/45 bg-amber-200/15 px-3 py-2 text-sm font-semibold text-amber-50"
      : "min-h-11 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900";
  }
  return publicMode
    ? "min-h-11 rounded-lg border border-white/10 bg-white/7 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/12"
    : "min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50";
}

function primaryMysticButtonClass(publicMode: boolean) {
  return publicMode
    ? "min-h-12 w-full rounded-xl bg-gradient-to-r from-amber-300 via-fuchsia-300 to-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-950/20"
    : "min-h-12 w-full rounded-xl bg-gradient-to-r from-amber-500 via-fuchsia-500 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/15";
}

function secondaryMysticButtonClass(publicMode: boolean) {
  return publicMode
    ? "min-h-11 rounded-lg border border-white/15 bg-white/8 px-3 text-sm font-semibold text-white hover:bg-white/12"
    : "min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50";
}

function buildTarotRetentionAction(spread: MysticTarotSpread): ZodiacRetentionDraft {
  return {
    section: "mystic",
    featureKey: "tarotCard",
    label: `Таро: ${spread.spreadLabel}`,
    mode: "tarot",
    topic: spread.topic,
    spreadType: spread.spreadType,
    cardKeys: spread.cardKeys,
    matrixType: spread.spreadType,
    archetype: spread.topic,
    mainNumber: spread.cardCount,
    detail: spread.cardKeys.join(" "),
  };
}

function buildRuneRetentionAction(spread: MysticRuneSpread): ZodiacRetentionDraft {
  return {
    section: "mystic",
    featureKey: "runeDay",
    label: `Руны: ${spread.modeLabel}`,
    mode: "rune",
    topic: spread.runeMode,
    spreadType: spread.runeMode,
    runeKeys: spread.runeKeys,
    matrixType: spread.runeMode,
    archetype: spread.resultTier,
    mainNumber: spread.runeCount,
    detail: spread.runeKeys.join(" "),
  };
}

function buildLunarRetentionAction(plan: MysticLunarPlan): ZodiacRetentionDraft {
  return {
    section: "mystic",
    featureKey: "lunarRitual",
    label: plan.mode === "lunar_day" ? `Лунный календарь: ${dateBucketLabel(plan.dateBucket)}` : `Лунный ритуал: ${plan.modeLabel.toLowerCase()}`,
    mode: plan.mode,
    topic: plan.energyKey,
    spreadType: plan.ritualKey,
    matrixType: "symbolic_lunar_ritual",
    archetype: plan.energyTier,
    detail: `${plan.energyLabel} · ${plan.ritualKey}`,
    dateBucket: plan.dateBucket,
    selectedDateKey: plan.selectedDateKey,
    energyTier: plan.energyTier,
    ritualKey: plan.ritualKey,
  };
}

function tarotAnalyticsPayload(
  value: MysticTarotSpread | { topic: MysticTarotTopicId; spreadType: MysticTarotSpreadType },
  category = "tarot_spread",
): ZodiacAnalyticsPayload {
  const hasResult = "cardCount" in value;
  return {
    section: "mystic",
    category,
    featureKey: "tarotCard",
    mode: "tarot",
    topic: value.topic,
    spreadType: value.spreadType,
    cardCount: hasResult ? value.cardCount : undefined,
    resultTier: hasResult ? value.resultTier : undefined,
  };
}

function runeAnalyticsPayload(
  value: MysticRuneSpread | { runeMode: MysticRuneSpreadMode },
  category = "rune_spread",
): ZodiacAnalyticsPayload {
  const hasResult = "runeCount" in value;
  return {
    section: "mystic",
    category,
    featureKey: "runeDay",
    mode: "rune",
    topic: value.runeMode,
    spreadType: value.runeMode,
    runeCount: hasResult ? value.runeCount : undefined,
    resultTier: hasResult ? value.resultTier : undefined,
  };
}

function lunarAnalyticsPayload(
  value: MysticLunarPlan | { mode: MysticLunarMode; dateBucket: MysticLunarDateBucket; hasIntention: boolean },
  hasIntention?: boolean,
  category = "lunar_ritual",
): ZodiacAnalyticsPayload {
  const hasResult = "ritualKey" in value;
  return {
    section: "mystic",
    category,
    featureKey: "lunarRitual",
    mode: value.mode,
    dateBucket: value.dateBucket,
    energyTier: hasResult ? value.energyTier : undefined,
    ritualKey: hasResult ? value.ritualKey : undefined,
    hasIntention: hasResult ? Boolean(hasIntention) : value.hasIntention,
  };
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

function resolveLunarSelectedDate(baseDateKey: string, dateBucket: MysticLunarDateBucket, customDate: string) {
  if (dateBucket === "today") return baseDateKey;
  if (dateBucket === "tomorrow") return shiftLunarDateKey(baseDateKey, 1);
  return normalizeLunarDateKey(customDate);
}

function dateBucketLabel(bucket: MysticLunarDateBucket) {
  if (bucket === "today") return "сегодня";
  if (bucket === "tomorrow") return "завтра";
  return "выбранная дата";
}
