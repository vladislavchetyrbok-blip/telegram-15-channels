"use client";

import cityCatalogData from "@/data/config/zodiac-city-catalog.json";
import { ArrowLeft, ArrowRight, HeartHandshake, MapPin, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

type Mode = "fast" | "personal" | "precise";
type Gender = "male" | "female" | "unspecified";
type Variant = "dashboard" | "public";
type WizardStep = 1 | 2 | 3;

interface City {
  cityId: string;
  nameRu: string;
  nameEn: string;
  countryRu: string;
  countryCode: string;
  timezone: string;
  latitude: number;
  longitude: number;
  aliases?: string[];
}

interface PersonState {
  sign: string;
  gender: Gender;
  birthDate: string;
  knowsTime: boolean;
  birthTime: string;
  cityQuery: string;
  selectedCityId: string;
}

interface ZodiacCompatibilityMiniAppProps {
  variant?: Variant;
  initialSign?: string | null;
  initialMode?: string | null;
  source?: string | null;
  startParam?: string | null;
}

const signs = [
  { slug: "aries", emoji: "♈", name: "Овен", element: "fire" },
  { slug: "taurus", emoji: "♉", name: "Телец", element: "earth" },
  { slug: "gemini", emoji: "♊", name: "Близнецы", element: "air" },
  { slug: "cancer", emoji: "♋", name: "Рак", element: "water" },
  { slug: "leo", emoji: "♌", name: "Лев", element: "fire" },
  { slug: "virgo", emoji: "♍", name: "Дева", element: "earth" },
  { slug: "libra", emoji: "♎", name: "Весы", element: "air" },
  { slug: "scorpio", emoji: "♏", name: "Скорпион", element: "water" },
  { slug: "sagittarius", emoji: "♐", name: "Стрелец", element: "fire" },
  { slug: "capricorn", emoji: "♑", name: "Козерог", element: "earth" },
  { slug: "aquarius", emoji: "♒", name: "Водолей", element: "air" },
  { slug: "pisces", emoji: "♓", name: "Рыбы", element: "water" },
];

const signSlugs = new Set(signs.map((sign) => sign.slug));
const cityCatalog = cityCatalogData.cities as City[];

const genderLabels: Record<Gender, string> = {
  male: "Мужчина",
  female: "Женщина",
  unspecified: "Не указывать",
};

const modes: Array<{ id: Mode; label: string; caption: string; resultLabel: string }> = [
  { id: "fast", label: "Быстрый", caption: "знак + знак", resultLabel: "Быстрый расчёт" },
  { id: "personal", label: "Персональный", caption: "пол, знак и дата рождения", resultLabel: "Персональный расчёт" },
  { id: "precise", label: "Точный", caption: "время и город, если известны", resultLabel: "Точный расчёт" },
];

const unknownBirthTimeNote = "Расчёт выполнен без точного времени рождения. Некоторые детали могут быть приблизительными.";
const exactBirthDataNote = "Расчёт выполнен с учётом времени и города рождения.";
const citySelectionWarning = "Выберите город из списка, чтобы расчёт был точнее.";

export function ZodiacCompatibilityMiniApp({
  variant = "dashboard",
  initialSign,
  initialMode,
  source,
  startParam,
}: ZodiacCompatibilityMiniAppProps) {
  const publicMode = variant === "public";
  const resolvedSign = resolveInitialSign(initialSign, startParam);
  const resolvedMode = normalizeMode(initialMode);
  const partnerSign = resolvedSign === "leo" ? "gemini" : "leo";
  const [mode, setMode] = useState<Mode>(resolvedMode);
  const [step, setStep] = useState<WizardStep>(1);
  const [self, setSelf] = useState<PersonState>(() => createInitialPerson(resolvedSign, "male", true, "kyiv-ua"));
  const [partner, setPartner] = useState<PersonState>(() => createInitialPerson(partnerSign, "female", false, ""));

  const result = useMemo(() => buildCompatibilityResult(mode, self, partner), [mode, partner, self]);
  const stepTitle = step === 1 ? "Вы" : step === 2 ? "Партнёр" : "Результат";

  function resetFlow() {
    setMode(resolvedMode);
    setSelf(createInitialPerson(resolvedSign, "male", true, "kyiv-ua"));
    setPartner(createInitialPerson(partnerSign, "female", false, ""));
    setStep(1);
  }

  return (
    <div
      className={
        publicMode
          ? "min-h-screen w-full max-w-full overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.24),transparent_22rem),linear-gradient(180deg,#080712_0%,#12081d_42%,#070b14_100%)] px-4 py-5 text-slate-100 sm:px-6"
          : "-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#f8fafc] px-4 py-6 text-slate-950 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      }
    >
      <div className={publicMode ? "mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-md flex-col space-y-4" : "mx-auto flex min-h-screen max-w-3xl flex-col space-y-5"}>
        <header
          className={
            publicMode
              ? "w-full overflow-hidden rounded-lg border border-fuchsia-200/15 bg-white/8 p-4 shadow-[0_24px_80px_rgba(8,13,30,0.45)] backdrop-blur"
              : "rounded-lg border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-cyan-50 p-6 shadow-sm"
          }
        >
          {!publicMode ? (
            <Link href="/dashboard/networks/zodiac" className="text-sm font-semibold text-violet-700 hover:text-violet-900">
              Назад к Zodiac
            </Link>
          ) : null}

          <div className={publicMode ? "flex flex-col gap-4" : "mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"}>
            <div className="min-w-0">
              <p
                className={
                  publicMode
                    ? "inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-100"
                    : "inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-semibold text-violet-700"
                }
              >
                <Sparkles className="h-3.5 w-3.5" />
                {publicMode ? "Шаг " + step + " из 3" : "Mini App preview"}
              </p>
              <h1
                className={
                  publicMode
                    ? "mt-3 break-words text-2xl font-semibold leading-tight text-white [overflow-wrap:anywhere]"
                    : "mt-4 break-words text-xl font-semibold leading-tight text-slate-950 [overflow-wrap:anywhere] sm:text-4xl"
                }
              >
                Совместимость знаков
              </h1>
              <p
                className={
                  publicMode
                    ? "mt-2 break-words text-sm leading-6 text-slate-300 [overflow-wrap:anywhere]"
                    : "mt-3 max-w-3xl break-words text-sm leading-6 text-slate-600 [overflow-wrap:anywhere] sm:text-base sm:leading-7"
                }
              >
                Ваши данные не сохраняются. Выберите формат и пройдите три коротких шага.
              </p>
            </div>
            <div
              className={
                publicMode
                  ? "inline-flex w-fit items-center rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-100"
                  : "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
              }
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              {publicMode ? "без сохранения данных" : "dry-run only"}
            </div>
          </div>

          {publicMode && source === "telegram" ? (
            <p className="mt-4 max-w-[18rem] break-words rounded-md border border-violet-300/20 bg-violet-300/10 px-3 py-2 text-xs text-violet-100 [overflow-wrap:anywhere] sm:max-w-full">
              Открыто из Telegram. Первый знак выбран из ссылки, если он был передан.
            </p>
          ) : null}
        </header>

        <StepProgress publicMode={publicMode} step={step} />
        <ModeSelector publicMode={publicMode} mode={mode} onChange={setMode} />

        <section className={publicMode ? "flex flex-1 flex-col" : "flex flex-1 flex-col"}>
          <div className="min-w-0 flex-1 transition-all duration-300">
            {step === 1 ? (
              <WizardCard publicMode={publicMode} stepLabel="Шаг 1 из 3" title="Вы">
                <PersonPanel publicMode={publicMode} title="Вы" mode={mode} value={self} onChange={setSelf} />
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className={primaryButtonClass(publicMode)}
                  >
                    Далее
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </WizardCard>
            ) : null}

            {step === 2 ? (
              <WizardCard publicMode={publicMode} stepLabel="Шаг 2 из 3" title="Партнёр">
                <PersonPanel publicMode={publicMode} title="Партнёр" mode={mode} value={partner} onChange={setPartner} />
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setStep(1)} className={secondaryButtonClass(publicMode)}>
                    <ArrowLeft className="h-4 w-4" />
                    Назад
                  </button>
                  <button type="button" onClick={() => setStep(3)} className={primaryButtonClass(publicMode)}>
                    Рассчитать
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </WizardCard>
            ) : null}

            {step === 3 ? (
              <WizardCard publicMode={publicMode} stepLabel="Шаг 3 из 3" title={stepTitle}>
                <ResultPanel publicMode={publicMode} result={result} onEdit={() => setStep(1)} onReset={resetFlow} />
              </WizardCard>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function StepProgress({ publicMode, step }: { publicMode: boolean; step: WizardStep }) {
  return (
    <div className={publicMode ? "grid grid-cols-3 gap-2" : "grid grid-cols-3 gap-2"}>
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className={
            item <= step
              ? publicMode
                ? "h-1.5 rounded-full bg-gradient-to-r from-fuchsia-300 via-rose-300 to-amber-200"
                : "h-1.5 rounded-full bg-violet-500"
              : publicMode
                ? "h-1.5 rounded-full bg-white/12"
                : "h-1.5 rounded-full bg-slate-200"
          }
        />
      ))}
    </div>
  );
}

function ModeSelector({ publicMode, mode, onChange }: { publicMode: boolean; mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <section className="grid grid-cols-3 gap-2">
      {modes.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={
            publicMode
              ? `min-w-0 rounded-lg border px-2 py-3 text-center text-xs shadow-sm transition ${
                  mode === item.id ? "border-amber-200/70 bg-amber-200/15 text-amber-50" : "border-white/10 bg-white/6 text-slate-300 hover:border-fuchsia-200/40"
                }`
              : `min-w-0 rounded-lg border px-2 py-3 text-center text-xs shadow-sm transition ${
                  mode === item.id ? "border-violet-300 bg-violet-50 text-violet-900" : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200"
                }`
          }
        >
          <span className="block font-semibold">{item.label}</span>
          <span className="mt-1 block leading-snug">{item.caption}</span>
        </button>
      ))}
    </section>
  );
}

function WizardCard({ publicMode, stepLabel, title, children }: { publicMode: boolean; stepLabel: string; title: string; children: ReactNode }) {
  return (
    <div
      className={
        publicMode
          ? "min-w-0 rounded-lg border border-white/12 bg-white/10 p-4 shadow-[0_18px_60px_rgba(8,13,30,0.38)] backdrop-blur transition-all duration-300"
          : "min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300"
      }
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={publicMode ? "text-xs font-semibold text-amber-100" : "text-xs font-semibold text-violet-700"}>{stepLabel}</p>
          <h2 className={publicMode ? "mt-1 text-xl font-semibold text-white" : "mt-1 text-xl font-semibold text-slate-950"}>{title}</h2>
        </div>
        <span
          className={
            publicMode
              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-fuchsia-200/20 bg-fuchsia-200/10 text-fuchsia-100"
              : "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-violet-100 bg-violet-50 text-violet-700"
          }
        >
          <HeartHandshake className="h-5 w-5" />
        </span>
      </div>
      {children}
    </div>
  );
}

function primaryButtonClass(publicMode: boolean) {
  return publicMode
    ? "inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-amber-100/40 bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400 px-4 text-sm font-semibold text-white shadow-lg shadow-rose-950/30 transition hover:brightness-110"
    : "inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-violet-500 bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700";
}

function secondaryButtonClass(publicMode: boolean) {
  return publicMode
    ? "inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/8 px-4 text-sm font-semibold text-slate-100 transition hover:bg-white/12"
    : "inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";
}

function PersonPanel({
  publicMode,
  title,
  mode,
  value,
  onChange,
}: {
  publicMode: boolean;
  title: string;
  mode: Mode;
  value: PersonState;
  onChange: (value: PersonState) => void;
}) {
  const showBirthDate = mode !== "fast";
  const showPrecise = mode === "precise";
  const parsedDate = parseBirthDate(value.birthDate);
  const detectedSign = parsedDate.ok ? findSign(parsedDate.signSlug) : null;

  return (
    <div className={publicMode ? "min-w-0 space-y-4" : "min-w-0 space-y-4"}>
      {!publicMode ? <h2 className="text-lg font-semibold text-slate-950">{title}</h2> : null}
      <div className="mt-5 space-y-4">
        <Field label="Знак" publicMode={publicMode}>
          <select
            value={value.sign}
            onChange={(event) => onChange({ ...value, sign: event.target.value })}
            className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900"
          >
            {signs.map((sign) => (
              <option key={sign.slug} value={sign.slug}>
                {sign.emoji} {sign.name}
              </option>
            ))}
          </select>
        </Field>

        {showBirthDate ? (
          <>
            <Field label="Пол" publicMode={publicMode}>
              <div className="grid gap-2 sm:grid-cols-3">
                {(Object.keys(genderLabels) as Gender[]).map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => onChange({ ...value, gender })}
                    className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      value.gender === gender ? "border-cyan-300 bg-cyan-50 text-cyan-900" : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    {genderLabels[gender]}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Дата рождения" publicMode={publicMode}>
              <input
                type="text"
                inputMode="numeric"
                value={value.birthDate}
                onChange={(event) => updateBirthDate(value, event.target.value, onChange)}
                placeholder="15.06.1998"
                className={`h-12 w-full rounded-lg border bg-white px-3 text-base text-slate-900 ${
                  value.birthDate && !parsedDate.ok ? "border-rose-300" : "border-slate-200"
                }`}
              />
              {detectedSign ? (
                <p className="mt-2 rounded-md border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-900">
                  Определён знак: {detectedSign.emoji} {detectedSign.name}
                </p>
              ) : null}
              {value.birthDate && !parsedDate.ok ? <p className="mt-2 text-xs font-semibold text-rose-700">{parsedDate.error}</p> : null}
            </Field>
          </>
        ) : null}

        {showPrecise ? (
          <div className={publicMode ? "space-y-3 rounded-lg border border-amber-200/25 bg-amber-200/10 p-3" : "space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3"}>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...value, knowsTime: true })}
                className={`min-h-11 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                  value.knowsTime ? "border-amber-300 bg-amber-50 text-amber-950" : "border-white/10 bg-white/90 text-slate-700"
                }`}
              >
                Знаю точное время
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...value, knowsTime: false })}
                className={`min-h-11 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                  !value.knowsTime ? "border-amber-300 bg-amber-50 text-amber-950" : "border-white/10 bg-white/90 text-slate-700"
                }`}
              >
                Не знаю точное время
              </button>
            </div>
            {!value.knowsTime ? <p className="text-sm text-amber-800">{unknownBirthTimeNote}</p> : null}
            {value.knowsTime ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Время" publicMode={publicMode}>
                  <input
                    type="time"
                    value={value.birthTime}
                    onChange={(event) => onChange({ ...value, birthTime: event.target.value })}
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900"
                  />
                </Field>
                <CitySelector publicMode={publicMode} value={value} onChange={onChange} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CitySelector({ publicMode, value, onChange }: { publicMode: boolean; value: PersonState; onChange: (value: PersonState) => void }) {
  const selectedCity = getCityById(value.selectedCityId);
  const suggestions = searchCities(value.cityQuery).slice(0, 5);
  const needsSelection = value.knowsTime && value.cityQuery.trim() && !selectedCity;
  const missingCity = value.knowsTime && !value.cityQuery.trim() && !selectedCity;

  return (
    <div>
      <Field label="Город" publicMode={publicMode}>
        <input
          value={value.cityQuery}
          onChange={(event) => onChange({ ...value, cityQuery: event.target.value, selectedCityId: "" })}
          placeholder="Воронеж или Voronezh"
          className={`h-12 w-full rounded-lg border bg-white px-3 text-base text-slate-900 ${needsSelection || missingCity ? "border-amber-300" : "border-slate-200"}`}
        />
      </Field>

      {suggestions.length > 0 && !selectedCity ? (
        <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {suggestions.map((city) => (
            <button
              key={city.cityId}
              type="button"
              onClick={() => onChange({ ...value, selectedCityId: city.cityId, cityQuery: cityLabel(city) })}
              className="flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-cyan-50"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
              <span>
                <span className="block font-semibold text-slate-950">{city.nameRu}, {city.countryRu}</span>
                <span className="block text-xs text-slate-500">{city.nameEn} · {city.timezone}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {selectedCity ? (
        <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900">
          {cityLabel(selectedCity)} · {selectedCity.timezone}
        </div>
      ) : null}

      {needsSelection || missingCity ? <p className="mt-2 text-xs font-semibold text-amber-800">{citySelectionWarning}</p> : null}
    </div>
  );
}

function ResultPanel({
  publicMode,
  result,
  onEdit,
  onReset,
}: {
  publicMode: boolean;
  result: CompatibilityResult;
  onEdit: () => void;
  onReset: () => void;
}) {
  const levelLabel = compatibilityLevelLabel(result.scores.total);

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
        <ResultTextCard publicMode={publicMode} title="⚠️ Слабое место" text={result.weakSpotText} />
        <ResultTextCard publicMode={publicMode} title="⭐ Совет паре" text={result.adviceText} />
        <ResultTextCard publicMode={publicMode} title="🎯 Итог" text={result.conclusionText} />
      </div>

      {result.validationMessages.map((message) => (
        <p key={message} className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{message}</p>
      ))}
      {result.note ? <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{result.note}</p> : null}

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

function ScoreBar({ publicMode, label, value, text }: { publicMode: boolean; label: string; value: number; text: string }) {
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

function ResultTextCard({ publicMode, title, text }: { publicMode: boolean; title: string; text: string }) {
  return (
    <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-3 text-slate-100" : "rounded-lg border border-slate-200 bg-white p-3 text-slate-700"}>
      <p className={publicMode ? "text-sm font-semibold text-amber-100" : "text-sm font-semibold text-violet-800"}>{title}</p>
      <p className={publicMode ? "mt-2 text-sm leading-5 text-slate-300" : "mt-2 text-sm leading-5 text-slate-600"}>{text}</p>
    </div>
  );
}

function Field({ label, publicMode, children }: { label: string; publicMode?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className={publicMode ? "mb-1 block text-sm font-medium text-slate-200" : "mb-1 block text-sm font-medium text-slate-700"}>{label}</span>
      {children}
    </label>
  );
}

function createInitialPerson(sign: string, gender: Gender, knowsTime: boolean, cityId: string): PersonState {
  const birthDate = gender === "female" ? "10.08.1998" : "15.06.1998";
  const selectedCity = getCityById(cityId);
  const parsed = parseBirthDate(birthDate);
  return {
    sign: parsed.ok ? parsed.signSlug : sign,
    gender,
    birthDate,
    knowsTime,
    birthTime: knowsTime ? "14:30" : "",
    cityQuery: selectedCity ? cityLabel(selectedCity) : "",
    selectedCityId: selectedCity?.cityId ?? "",
  };
}

function updateBirthDate(value: PersonState, birthDate: string, onChange: (value: PersonState) => void) {
  const parsed = parseBirthDate(birthDate);
  onChange({ ...value, birthDate, sign: parsed.ok ? parsed.signSlug : value.sign });
}

interface CompatibilityResult {
  title: string;
  modeLabel: string;
  dataUseLabel: string;
  note: string | null;
  validationMessages: string[];
  scores: {
    total: number;
    attraction: number;
    communication: number;
    love: number;
    household: number;
  };
  attractionText: string;
  communicationText: string;
  loveText: string;
  householdText: string;
  weakSpotText: string;
  adviceText: string;
  conclusionText: string;
}

function buildCompatibilityResult(mode: Mode, self: PersonState, partner: PersonState): CompatibilityResult {
  const selfSign = findSign(self.sign);
  const partnerSign = findSign(partner.sign);
  const selfDate = parseBirthDate(self.birthDate);
  const partnerDate = parseBirthDate(partner.birthDate);
  const selfCity = self.knowsTime ? getCityById(self.selectedCityId) : null;
  const partnerCity = partner.knowsTime ? getCityById(partner.selectedCityId) : null;
  const modeLabel = modes.find((item) => item.id === mode)?.resultLabel ?? "Расчёт";
  const title = `${selfSign.emoji} ${selfSign.name}${genderSuffix(self.gender)} + ${partnerSign.emoji} ${partnerSign.name}${genderSuffix(partner.gender)}`;
  const validationMessages = buildValidationMessages(mode, self, partner, selfDate, partnerDate, selfCity, partnerCity);
  const seed = hashString([
    mode,
    self.gender,
    mode === "fast" ? "" : selfDate.iso ?? self.birthDate,
    self.sign,
    mode === "precise" && self.knowsTime ? self.birthTime : "",
    mode === "precise" && self.knowsTime ? selfCity?.cityId ?? "" : "",
    partner.gender,
    mode === "fast" ? "" : partnerDate.iso ?? partner.birthDate,
    partner.sign,
    mode === "precise" && partner.knowsTime ? partner.birthTime : "",
    mode === "precise" && partner.knowsTime ? partnerCity?.cityId ?? "" : "",
  ].join("|"));
  const base = baseCompatibilityScore(selfSign.element, partnerSign.element);
  const modeBoost = mode === "fast" ? 0 : mode === "personal" ? 3 : 5;
  const total = clampScore(base + modeBoost + variance(seed, 0, 15) - 7);
  const scores = {
    total,
    attraction: clampScore(total + variance(seed, 1, 17) - 8),
    communication: clampScore(total + variance(seed, 2, 19) - 9),
    love: clampScore(total + variance(seed, 3, 21) - 10),
    household: clampScore(total + variance(seed, 4, 17) - 8),
  };
  const preciseKnown = mode === "precise" && self.knowsTime && partner.knowsTime && Boolean(selfCity && partnerCity);
  const unknownPreciseTime = mode === "precise" && (!self.knowsTime || !partner.knowsTime);
  return {
    title,
    modeLabel,
    dataUseLabel: buildDataUseLabel(mode, preciseKnown),
    note: preciseKnown ? exactBirthDataNote : unknownPreciseTime ? unknownBirthTimeNote : null,
    validationMessages,
    scores,
    attractionText: pickLine(attractionLines, seed, 1),
    communicationText: pickLine(communicationLines, seed, 2),
    loveText: pickLine(loveLines, seed, 3),
    householdText: pickLine(householdLines, seed, 4),
    weakSpotText: pickLine(weakSpotLines, seed, 5),
    adviceText: pickLine(adviceLines, seed, 6),
    conclusionText: buildConclusion(total, mode),
  };
}

function buildValidationMessages(
  mode: Mode,
  self: PersonState,
  partner: PersonState,
  selfDate: ParsedDate,
  partnerDate: ParsedDate,
  selfCity: City | null,
  partnerCity: City | null,
) {
  const messages: string[] = [];
  if (mode !== "fast") {
    if (self.birthDate && !selfDate.ok) messages.push(`Вы: ${selfDate.error}`);
    if (partner.birthDate && !partnerDate.ok) messages.push(`Партнёр: ${partnerDate.error}`);
  }
  if (mode === "precise") {
    if (self.knowsTime && !selfCity) messages.push(`Вы: ${citySelectionWarning}`);
    if (partner.knowsTime && !partnerCity) messages.push(`Партнёр: ${citySelectionWarning}`);
  }
  return messages;
}

function buildDataUseLabel(mode: Mode, preciseKnown: boolean) {
  if (mode === "fast") return "Используются только знаки.";
  if (mode === "personal") return "Учитываются пол и дата рождения.";
  return preciseKnown ? "Учитываются пол, дата, время и выбранный город." : "Точный режим работает приблизительно, если время или город не выбраны.";
}

function baseCompatibilityScore(firstElement: string, secondElement: string) {
  if (firstElement === secondElement) return 82;
  const key = [firstElement, secondElement].sort().join("+");
  if (key === "air+fire" || key === "earth+water") return 86;
  if (key === "air+water" || key === "earth+fire") return 72;
  return 76;
}

function normalizeMode(value?: string | null): Mode {
  const normalized = String(value || "precise").trim().toLowerCase();
  return normalized === "fast" || normalized === "personal" || normalized === "precise" ? normalized : "precise";
}

function resolveInitialSign(sign?: string | null, startParam?: string | null) {
  const fromStart = parseCompatibilityStartParam(startParam);
  const normalized = String(sign || fromStart || "gemini").trim().toLowerCase();
  return signSlugs.has(normalized) ? normalized : "gemini";
}

function parseCompatibilityStartParam(value?: string | null) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized || normalized === "compat") return null;
  const match = normalized.match(/^compat_([a-z-]+)$/);
  if (!match) return null;
  return signSlugs.has(match[1]) ? match[1] : null;
}

type ParsedDate = { ok: true; iso: string; day: number; month: number; year: number; signSlug: string } | { ok: false; error: string; iso?: undefined; signSlug?: undefined };

function parseBirthDate(value: string): ParsedDate {
  const raw = String(value || "").trim();
  if (!raw) return { ok: false, error: "Введите дату рождения." };
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const dotMatch = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  const year = isoMatch ? Number(isoMatch[1]) : dotMatch ? Number(dotMatch[3]) : NaN;
  const month = isoMatch ? Number(isoMatch[2]) : dotMatch ? Number(dotMatch[2]) : NaN;
  const day = isoMatch ? Number(isoMatch[3]) : dotMatch ? Number(dotMatch[1]) : NaN;

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return { ok: false, error: "Используйте формат ДД.ММ.ГГГГ." };
  }
  if (year < 1900 || year > 2100) return { ok: false, error: "Проверьте год рождения." };
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return { ok: false, error: "Такой даты не существует." };
  }

  return {
    ok: true,
    iso: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    day,
    month,
    year,
    signSlug: signFromDate(day, month),
  };
}

function signFromDate(day: number, month: number) {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius";
  return "pisces";
}

function findSign(slug: string) {
  return signs.find((sign) => sign.slug === slug) ?? signs[0];
}

function getCityById(cityId: string) {
  return cityCatalog.find((city) => city.cityId === cityId) ?? null;
}

function cityLabel(city: City) {
  return `${city.nameRu}, ${city.countryRu}`;
}

function searchCities(query: string) {
  const normalized = normalizeSearch(query);
  if (!normalized) return cityCatalog.slice(0, 5);
  return cityCatalog.filter((city) => {
    const haystack = [city.nameRu, city.nameEn, city.countryRu, city.countryCode, ...(city.aliases ?? [])].map(normalizeSearch);
    return haystack.some((item) => item.includes(normalized));
  });
}

function normalizeSearch(value: string) {
  return String(value || "").trim().toLowerCase().replace(/ё/g, "е");
}

function genderSuffix(gender: Gender) {
  if (gender === "male") return " мужчина";
  if (gender === "female") return " женщина";
  return "";
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function variance(seed: number, offset: number, spread: number) {
  return (hashString(`${seed}:${offset}`) % spread);
}

function clampScore(value: number) {
  return Math.max(45, Math.min(98, value));
}

function compatibilityLevelLabel(score: number) {
  if (score >= 84) return "Высокая совместимость";
  if (score >= 70) return "Хорошая совместимость";
  return "Бережная совместимость";
}

function pickLine(items: string[], seed: number, offset: number) {
  return items[variance(seed, offset, items.length)];
}

function buildConclusion(score: number, mode: Mode) {
  const grade = score >= 84 ? "сильный потенциал" : score >= 70 ? "хороший потенциал при внимании к диалогу" : "бережный потенциал, которому нужен спокойный темп";
  if (mode === "fast") return `${grade}; совместимость хорошая, если вы поддерживаете спокойный диалог и уважаете личное пространство.`;
  if (mode === "personal") return `${grade}; отношениям помогает внимание к ритму друг друга, честные просьбы и регулярные знаки тепла.`;
  return `${grade}; у пары хороший потенциал, если оба готовы слышать друг друга и не превращать разницу характеров в спор.`;
}

const attractionLines = [
  "есть живая искра, но ей нужен мягкий темп",
  "интерес усиливается через уважение к личному пространству",
  "притяжение ярче, когда оба не соревнуются за внимание",
  "пара раскрывается через игру, любопытство и честность",
];

const communicationLines = [
  "лучше работают короткие договорённости и ясные просьбы",
  "важно не додумывать мотивы, а задавать прямые вопросы",
  "разговор становится легче, если сначала признать разные темпы",
  "сильная сторона пары — обмен идеями без давления",
];

const loveLines = [
  "тепло растёт через маленькие регулярные знаки внимания",
  "романтика сильнее там, где меньше проверок и сравнений",
  "чувства раскрываются через доверие и спокойную инициативу",
  "важно оставлять место и для близости, и для свободы",
];

const householdLines = [
  "общий режим лучше согласовать заранее",
  "быт станет легче, если разделить зоны ответственности",
  "ритм пары держится на простых повторяемых привычках",
  "домашние вопросы стоит решать фактами, а не намёками",
];

const weakSpotLines = [
  "молчаливые ожидания быстро превращаются в напряжение",
  "разный темп решений может восприниматься как равнодушие",
  "попытка переделать партнёра снижает доверие",
  "излишняя резкость в разговоре может закрыть диалог",
];

const adviceLines = [
  "выберите один общий фокус на ближайшие дни и проверьте, где вам легче договориться",
  "проговорите ожидания простыми словами и не превращайте разговор в экзамен",
  "сравнивайте не только знаки, но и реальные привычки: отдых, спор, просьбы о поддержке",
  "держите баланс между инициативой и уважением к личному пространству",
];
