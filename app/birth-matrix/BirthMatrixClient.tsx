"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  Fingerprint,
  RotateCcw,
  Sparkles,
  User,
} from "lucide-react";

import { AphroditeLockedPreviewCard, AphroditeShareCard } from "@/components/zodiac-mini-app/aphrodite-design-system";
import { AphroditeMiniAppShell } from "@/components/zodiac-mini-app/AphroditeMiniAppShell";
import { AphroditeSectionCard } from "@/components/zodiac-mini-app/AphroditeSectionCard";
import { AphroditeStatusPill } from "@/components/zodiac-mini-app/AphroditeStatusPill";
import { ZodiacUnifiedDateInput } from "@/components/zodiac-mini-app/ZodiacUnifiedDateInput";
import { ZodiacUnifiedTimeInput } from "@/components/zodiac-mini-app/ZodiacUnifiedTimeInput";
import { parseBirthDateInput } from "@/lib/zodiac-birth-date-range";
import { calculateMockBirthMatrix } from "@/lib/zodiac/zodiac-birth-matrix-mock";
import type { BirthMatrixResult } from "@/lib/zodiac/zodiac-birth-matrix-mock";

const DATE_FORMAT_ERROR = "Введите дату в формате ДД.ММ.ГГГГ.";
const DATE_RANGE_ERROR = "Дата должна быть в диапазоне 1900 — сегодня.";

type MatrixTone = {
  title: string;
  profile: string;
  strength: string;
  growth: string;
  nextStep: string;
};

const matrixToneByNumber: Record<number, MatrixTone> = {
  1: {
    title: "Инициатор",
    profile: "много самостоятельности, прямоты и желания запускать новое.",
    strength: "быстро собирать волю в действие и вести за собой без лишнего шума.",
    growth: "оставлять место для партнёрства и не превращать скорость в давление.",
    nextStep: "выберите одну цель недели и доведите её до понятного первого шага.",
  },
  2: {
    title: "Дипломат",
    profile: "тонкое чувство людей, нюансов и эмоционального равновесия.",
    strength: "слышать подтекст и соединять людей там, где другим сложно договориться.",
    growth: "не растворяться в ожиданиях других и прямо называть свои желания.",
    nextStep: "запишите одну просьбу, которую важно произнести мягко, но честно.",
  },
  3: {
    title: "Творец",
    profile: "живое выражение, лёгкость, идеи и способность оживлять пространство.",
    strength: "говорить так, что смысл становится теплее и понятнее.",
    growth: "не прятать тревогу за шуткой и доводить идеи до формы.",
    nextStep: "оформите одну мысль в текст, голосовое или маленький творческий жест.",
  },
  4: {
    title: "Опора",
    profile: "практичность, системность и умение строить устойчивый фундамент.",
    strength: "видеть, что реально работает, и превращать хаос в понятный порядок.",
    growth: "оставлять место для отдыха, гибкости и живого импульса.",
    nextStep: "упростите один процесс: уберите лишнее и оставьте три ясных действия.",
  },
  5: {
    title: "Исследователь",
    profile: "любопытство, движение, адаптивность и тяга к новым впечатлениям.",
    strength: "быстро находить свежий маршрут, когда старый перестал работать.",
    growth: "не путать свободу с избеганием обязательств.",
    nextStep: "выберите одно безопасное новое действие и доведите его до результата.",
  },
  6: {
    title: "Хранитель",
    profile: "забота, чувство красоты, ответственность и стремление к гармонии.",
    strength: "создавать пространство, где людям спокойнее быть собой.",
    growth: "не брать на себя чужую взрослость и не спасать ценой себя.",
    nextStep: "сделайте один заботливый шаг для себя, а не только для других.",
  },
  7: {
    title: "Искатель",
    profile: "глубина, наблюдательность и желание понимать скрытые причины.",
    strength: "видеть смысл под поверхностью и собирать точные выводы.",
    growth: "не уходить в изоляцию, когда нужна простая человеческая связь.",
    nextStep: "сформулируйте один вопрос, который давно требует честного ответа.",
  },
  8: {
    title: "Стратег",
    profile: "сила управления, масштаб и внимание к результату.",
    strength: "собирать ресурсы, держать фокус и принимать зрелые решения.",
    growth: "не измерять ценность только эффективностью и контролем.",
    nextStep: "определите одну границу, которая сохранит энергию и уважение к себе.",
  },
  9: {
    title: "Проводник",
    profile: "эмпатия, широкий взгляд и способность завершать циклы с достоинством.",
    strength: "видеть большую картину и поддерживать людей без лишнего давления.",
    growth: "не оставаться в историях, которые уже пора отпустить.",
    nextStep: "закройте один маленький хвост, чтобы освободить место для нового.",
  },
  11: {
    title: "Вдохновитель",
    profile: "интуиция, чувствительность и умение подсвечивать направление.",
    strength: "замечать тонкие сигналы и превращать их в вдохновляющий смысл.",
    growth: "заземлять идеи в конкретных действиях и беречь нервную систему.",
    nextStep: "выберите один инсайт и переведите его в маленькое практическое действие.",
  },
  22: {
    title: "Архитектор",
    profile: "масштабное видение, практичность и способность строить долгие формы.",
    strength: "соединять мечту с системой, планом и устойчивым результатом.",
    growth: "не требовать от себя идеальной конструкции с первого шага.",
    nextStep: "разбейте большую цель на один шаг, который можно сделать сегодня.",
  },
};

const energyLabelMap: Record<string, string> = {
  "Life Path": "Путь",
  "Hidden Potential": "Скрытый потенциал",
  "Current Cycle": "Текущий цикл",
};

export function BirthMatrixClient() {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState<BirthMatrixResult | null>(null);
  const parsedBirthDate = parseBirthDateInput(birthDate, {
    emptyError: DATE_FORMAT_ERROR,
    rangeError: DATE_RANGE_ERROR,
  });
  const birthDateError =
    birthDate && !parsedBirthDate.ok
      ? parsedBirthDate.error === DATE_RANGE_ERROR
        ? DATE_RANGE_ERROR
        : DATE_FORMAT_ERROR
      : "";

  const resultTone = useMemo(() => {
    if (!result) return null;
    return matrixToneByNumber[result.coreNumber] ?? matrixToneByNumber[1];
  }, [result]);

  const handleCalculate = (event: FormEvent) => {
    event.preventDefault();
    if (!parsedBirthDate.ok) return;
    setResult(calculateMockBirthMatrix({ birthDate: parsedBirthDate.iso, birthTime, name }));
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <AphroditeMiniAppShell
      eyebrow="APHRODITE · Telegram Mini App"
      title="Матрица судьбы"
      description="Узнай главные энергии даты рождения и то, что стоит развивать."
      statusSlot={<AphroditeStatusPill label="бесплатный preview" tone="accent" />}
      footerSlot={<BirthMatrixFooter />}
    >
      <div
        data-birth-matrix-dashboard-qa="Birth Matrix Static Mock (Package 103) Calculate Your Matrix No payment No database No Telegram API"
        data-aphrodite-birth-matrix-natal-flow-redesign="package-240"
        className="min-w-0 max-w-full space-y-4"
      >
        <Link
          href="/miniapp"
          className="aphrodite-touch-target aphrodite-wrap-anywhere inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-3 text-sm font-medium text-slate-300 transition hover:border-rose-200/25 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад в Mini App
        </Link>

        <section className="min-w-0 rounded-lg border border-violet-300/20 bg-violet-300/[0.08] p-3" data-aphrodite-birth-matrix-what-user-gets="package-240">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-100">Матрица судьбы</p>
          <h2 className="mt-2 text-lg font-semibold leading-7 text-white">Личный отчёт по дате рождения</h2>
          <p className="mt-1 text-sm leading-5 text-slate-300">Главный код, ресурс, рост и следующий шаг.</p>
        </section>

        <div data-aphrodite-birth-matrix-input="package-240">
          <AphroditeSectionCard
            tone="primary"
            eyebrow="Расчёт по дате"
            title="Дата рождения"
            description="Короткий расчёт по дате рождения."
            actionSlot={<Calendar className="h-5 w-5 text-rose-200" />}
          >
            <form onSubmit={handleCalculate} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="birth-matrix-birth-date" className="flex items-center gap-2 text-sm font-semibold text-white">
                <Calendar className="h-4 w-4 text-rose-200" />
                Дата рождения
              </label>
              <ZodiacUnifiedDateInput
                publicMode
                id="birth-matrix-birth-date"
                value={birthDate}
                onChange={setBirthDate}
                hasError={Boolean(birthDateError)}
                birthDateScope="birth-matrix"
                hint="Формат: ДД.ММ.ГГГГ. Например: 15.06.1998."
              />
              {birthDateError ? <p className="text-xs font-semibold text-rose-200">{birthDateError}</p> : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Clock className="h-4 w-4 text-slate-300" />
                  Время рождения
                </span>
                <ZodiacUnifiedTimeInput publicMode value={birthTime} onChange={setBirthTime} />
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <User className="h-4 w-4 text-slate-300" />
                  Имя
                </span>
                <input
                  type="text"
                  placeholder="Необязательно"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-12 w-full rounded-lg border border-white/15 bg-white/8 px-3 text-base text-white placeholder-slate-400 outline-none transition focus:border-rose-200 focus:bg-white/10"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={!parsedBirthDate.ok}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
            >
              <Sparkles className="h-4 w-4" />
              Рассчитать матрицу
            </button>
            </form>
          </AphroditeSectionCard>
        </div>

        {!result || !resultTone ? (
          <EmptyBirthMatrixState />
        ) : (
          <BirthMatrixResultView result={result} tone={resultTone} onReset={handleReset} />
        )}
      </div>
    </AphroditeMiniAppShell>
  );
}

function EmptyBirthMatrixState() {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-amber-200">
          <Fingerprint className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-6 text-white">Что покажет результат</h2>
          <p className="mt-1 text-sm leading-5 text-slate-300">Главная энергия, ресурс, зона роста и один шаг на сегодня.</p>
        </div>
      </div>
    </section>
  );
}

function BirthMatrixResultView({
  result,
  tone,
  onReset,
}: {
  result: BirthMatrixResult;
  tone: MatrixTone;
  onReset: () => void;
}) {
  const summaryCards = [
    {
      title: "Главная энергия",
      value: `Код ${result.coreNumber}`,
      text: `${tone.title}: ${tone.profile}`,
    },
    {
      title: "Сильная сторона",
      value: "Ресурс",
      text: tone.strength,
    },
    {
      title: "Зона роста",
      value: "Фокус",
      text: tone.growth,
    },
    {
      title: "Следующий шаг",
      value: "Сегодня",
      text: tone.nextStep,
    },
  ];

  return (
    <div className="min-w-0 max-w-full space-y-4" data-birth-matrix-result="visual-upgrade-package-201" data-aphrodite-birth-matrix-report="package-240">
      <section className="min-w-0 rounded-lg border border-amber-200/20 bg-gradient-to-br from-rose-950/35 via-slate-900 to-emerald-950/20 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-amber-200">Ваш результат</p>
            <h2 className="mt-1 text-2xl font-semibold leading-8 text-white">
              {tone.title} · код {result.coreNumber}
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-300">Короткий ориентир по дате рождения.</p>
          </div>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-amber-200/25 bg-amber-200/10 text-2xl font-semibold text-amber-100">
            {result.coreNumber}
          </span>
        </div>
      </section>

      <AphroditeShareCard
        variant="birthMatrix"
        scope="birth-matrix"
        eyebrow="Карточка Матрицы"
        title={`${tone.title} / код ${result.coreNumber}`}
        subtitle="Краткий итог Матрицы / Natal."
        scoreLabel={String(result.coreNumber)}
        scoreDetail="ядро"
        insight={tone.profile}
        highlights={[
          { label: "сила", value: "ресурс", detail: tone.strength },
          { label: "рост", value: "фокус", detail: tone.growth },
          { label: "сегодня", value: "шаг", detail: tone.nextStep },
        ]}
        footer="Preview-карточка. Данные остаются на устройстве."
      />

      <section className="grid gap-2 sm:grid-cols-2" aria-label="Ключевые подсказки матрицы">
        {summaryCards.map((card) => (
          <article key={card.title} className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
            <p className="text-[11px] font-medium text-rose-200">{card.title}</p>
            <h3 className="mt-1 text-base font-semibold leading-6 text-white">{card.value}</h3>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-300">{card.text}</p>
          </article>
        ))}
      </section>

      <section className="space-y-2" data-aphrodite-birth-matrix-energy-card="package-240">
        <div>
          <p className="text-xs font-medium text-rose-200">Глубже</p>
          <h2 className="mt-1 text-base font-semibold leading-6 text-white">Энергии даты</h2>
          <p className="mt-1 text-sm leading-5 text-slate-300">Три коротких слоя интерпретации.</p>
        </div>
        {result.energyMatrix.map((item) => (
          <article key={item.label} className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">{energyLabelMap[item.label] ?? item.label}</p>
              <span className="rounded-md border border-amber-200/20 bg-amber-200/10 px-2 py-1 text-sm font-semibold text-amber-100">
                {item.value}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-300">{matrixToneByNumber[item.value]?.strength ?? item.meaning}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-emerald-300/20 bg-emerald-950/15 p-3">
        <p className="text-sm font-semibold text-emerald-200">Подсказка для отношений</p>
        <p className="mt-1 text-sm leading-5 text-slate-300">Ищите диалог с энергиями {getCompatibilityNumbers(result.coreNumber)}.</p>
      </section>

      <section data-aphrodite-birth-matrix-vip-preview="package-240">
        <AphroditeLockedPreviewCard
          variant="birthMatrix"
          scope="birth-matrix"
          title="Будущая полная версия"
          subtitle="Матрица Pro закрыта"
          preview="Расширенный Pro-разбор показан как preview."
          features={["Матрица Pro", "Личный совет", "Карточка результата"]}
          previewItems={["Циклы и отношения", "Деньги и смысл", "План практики"]}
          safetyLabel="Без оплаты · VIP закрыт"
        />
      </section>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-rose-200/25 hover:bg-white/[0.07]"
      >
        <RotateCcw className="h-4 w-4" />
        Ввести другую дату
      </button>
    </div>
  );
}

function BirthMatrixFooter() {
  return (
    <div className="space-y-3 border-t border-white/10 pt-4">
      <div className="flex items-start gap-2 rounded-lg border border-amber-300/20 bg-amber-950/20 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
        <p className="text-xs leading-5 text-amber-100">
          Данные остаются на устройстве. Без оплаты · VIP закрыт.
        </p>
      </div>
    </div>
  );
}

function getCompatibilityNumbers(coreNumber: number): string {
  return `${(coreNumber % 9) + 1} и ${(coreNumber % 7) + 2}`;
}
