"use client";

import cityCatalogData from "@/data/config/zodiac-city-catalog.json";
import {
  DEFAULT_ZODIAC_TIME_ZONE,
  addDaysToDateKey,
  formatZodiacDisplayDate,
  getCurrentZodiacDateKey,
  getLuckyDaysStartDate,
  getWeekRangeForDate,
} from "@/lib/zodiac-date";
import { ArrowLeft, ArrowRight, CalendarDays, Crown, Gift, HeartHandshake, Lock, MapPin, RotateCcw, ShieldCheck, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type Mode = "fast" | "personal" | "precise";
type RelationshipMode = "love" | "friendship" | "work" | "family" | "passion" | "reconciliation";
type Gender = "male" | "female" | "unspecified";
type Variant = "dashboard" | "public";
type WizardStep = 1 | 2 | 3;
type HubTab = "today" | "week" | "compatibility" | "lucky" | "more";

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
  name: string;
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
  { slug: "aries", emoji: "♈", name: "Овен", range: "21 марта - 19 апреля", element: "fire" },
  { slug: "taurus", emoji: "♉", name: "Телец", range: "20 апреля - 20 мая", element: "earth" },
  { slug: "gemini", emoji: "♊", name: "Близнецы", range: "21 мая - 20 июня", element: "air" },
  { slug: "cancer", emoji: "♋", name: "Рак", range: "21 июня - 22 июля", element: "water" },
  { slug: "leo", emoji: "♌", name: "Лев", range: "23 июля - 22 августа", element: "fire" },
  { slug: "virgo", emoji: "♍", name: "Дева", range: "23 августа - 22 сентября", element: "earth" },
  { slug: "libra", emoji: "♎", name: "Весы", range: "23 сентября - 22 октября", element: "air" },
  { slug: "scorpio", emoji: "♏", name: "Скорпион", range: "23 октября - 21 ноября", element: "water" },
  { slug: "sagittarius", emoji: "♐", name: "Стрелец", range: "22 ноября - 21 декабря", element: "fire" },
  { slug: "capricorn", emoji: "♑", name: "Козерог", range: "22 декабря - 19 января", element: "earth" },
  { slug: "aquarius", emoji: "♒", name: "Водолей", range: "20 января - 18 февраля", element: "air" },
  { slug: "pisces", emoji: "♓", name: "Рыбы", range: "19 февраля - 20 марта", element: "water" },
];

type ZodiacSign = (typeof signs)[number];

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

const relationshipModes: Array<{ id: RelationshipMode; label: string; caption: string }> = [
  { id: "love", label: "❤️ Любовь", caption: "чувства и близость" },
  { id: "friendship", label: "💬 Дружба", caption: "поддержка и доверие" },
  { id: "work", label: "💼 Работа", caption: "дела и решения" },
  { id: "family", label: "🏠 Семья / быт", caption: "ритм и забота" },
  { id: "passion", label: "🔥 Страсть", caption: "искра и притяжение" },
  { id: "reconciliation", label: "🕊 Примирение", caption: "мягкий диалог" },
];

const hubTabs: Array<{ id: HubTab; label: string; shortLabel: string; icon: typeof Sparkles }> = [
  { id: "today", label: "Сегодня", shortLabel: "Сегодня", icon: Sparkles },
  { id: "week", label: "Неделя", shortLabel: "Неделя", icon: Star },
  { id: "compatibility", label: "Совместимость", shortLabel: "Совмест.", icon: HeartHandshake },
  { id: "lucky", label: "Удачные дни", shortLabel: "Дни", icon: CalendarDays },
  { id: "more", label: "Ещё", shortLabel: "Ещё", icon: Crown },
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
  const resolvedMode = normalizeMode(initialMode);
  const hintSignSlug = useMemo(() => resolveInitialSign(initialSign, startParam), [initialSign, startParam]);
  const hintSign = hintSignSlug ? findSign(hintSignSlug) : null;
  const [appDateKey, setAppDateKey] = useState<string | null>(null);
  const [selectedSignSlug, setSelectedSignSlug] = useState("");
  const [activeTab, setActiveTab] = useState<HubTab>("today");
  const [mode, setMode] = useState<Mode>(resolvedMode);
  const [relationshipMode, setRelationshipMode] = useState<RelationshipMode>("love");
  const [step, setStep] = useState<WizardStep>(1);
  const [self, setSelf] = useState<PersonState>(() => createInitialPerson("", "unspecified", false, ""));
  const [partner, setPartner] = useState<PersonState>(() => createInitialPerson("", "unspecified", false, ""));

  const result = useMemo(() => buildCompatibilityResult(mode, relationshipMode, self, partner), [mode, partner, relationshipMode, self]);
  const selectedSign = selectedSignSlug ? findSign(selectedSignSlug) : null;
  const stepTitle = step === 1 ? "Вы" : step === 2 ? "Партнёр" : "Результат";

  useEffect(() => {
    function refreshAppDate() {
      const nextDateKey = getCurrentZodiacDateKey(DEFAULT_ZODIAC_TIME_ZONE);
      setAppDateKey((currentDateKey) => (currentDateKey === nextDateKey ? currentDateKey : nextDateKey));
    }

    refreshAppDate();
    const intervalId = window.setInterval(refreshAppDate, 60000);
    const handleVisibilityChange = () => {
      if (!document.hidden) refreshAppDate();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!appDateKey || process.env.NODE_ENV === "production") return;
    const warnings = validateZodiacMiniAppContent(appDateKey);
    if (warnings.length > 0) console.warn("Zodiac Mini App content validation", warnings);
  }, [appDateKey]);

  function chooseSign(slug: string) {
    setSelectedSignSlug(slug);
    setActiveTab("today");
    setSelf((current) => ({ ...current, sign: !current.sign || current.sign === selectedSignSlug ? slug : current.sign }));
  }

  function clearSelectedSign() {
    setSelectedSignSlug("");
    setActiveTab("today");
  }

  function resetFlow() {
    setMode(resolvedMode);
    setRelationshipMode("love");
    setSelf(createInitialPerson(selectedSignSlug, "unspecified", false, ""));
    setPartner(createInitialPerson("", "unspecified", false, ""));
    setStep(1);
  }

  return (
    <div
      className={
        publicMode
          ? "min-h-screen w-full max-w-full overflow-x-hidden bg-[#070712] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.14)_1px,transparent_0),radial-gradient(circle_at_top,rgba(168,85,247,0.26),transparent_24rem),linear-gradient(180deg,#070712_0%,#13091f_44%,#070b14_100%)] bg-[length:28px_28px,100%_100%,100%_100%] px-4 py-5 text-slate-100 sm:px-6"
          : "-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070712] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0),radial-gradient(circle_at_top,rgba(168,85,247,0.2),transparent_24rem),linear-gradient(180deg,#070712_0%,#13091f_48%,#070b14_100%)] bg-[length:28px_28px,100%_100%,100%_100%] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      }
    >
      <div className={publicMode ? "mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-md flex-col space-y-4" : "mx-auto flex min-h-screen max-w-3xl flex-col space-y-5"}>
        <header
          className={
            publicMode
              ? "w-full overflow-hidden rounded-lg border border-fuchsia-200/15 bg-white/8 p-4 shadow-[0_24px_80px_rgba(8,13,30,0.45)] backdrop-blur"
              : "rounded-lg border border-fuchsia-200/15 bg-white/8 p-5 shadow-[0_24px_80px_rgba(8,13,30,0.45)] backdrop-blur"
          }
        >
          {!publicMode ? (
            <Link href="/dashboard/networks/zodiac" className="text-sm font-semibold text-amber-100 hover:text-white">
              Назад к Zodiac
            </Link>
          ) : null}

          <div className={publicMode ? "flex flex-col gap-4" : "mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"}>
            <div className="min-w-0">
              <p
                className={
                  publicMode
                    ? "inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-100"
                    : "inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-100"
                }
              >
                <Sparkles className="h-3.5 w-3.5" />
                {selectedSign ? `${selectedSign.emoji} ${selectedSign.name}` : "Зодиакальный центр"}
              </p>
              <h1
                className={
                  publicMode
                    ? "mt-3 break-words text-2xl font-semibold leading-tight text-white [overflow-wrap:anywhere]"
                    : "mt-4 break-words text-2xl font-semibold leading-tight text-white [overflow-wrap:anywhere] sm:text-4xl"
                }
              >
                Гороскопы и совместимость
              </h1>
              <p
                className={
                  publicMode
                    ? "mt-2 break-words text-sm leading-6 text-slate-300 [overflow-wrap:anywhere]"
                    : "mt-3 max-w-3xl break-words text-sm leading-6 text-slate-300 [overflow-wrap:anywhere] sm:text-base sm:leading-7"
                }
              >
                Выберите знак и откройте прогнозы, совместимость, карту пары и натальную подсказку
              </p>
            </div>
            {selectedSign ? (
              <button type="button" onClick={clearSelectedSign} className="inline-flex w-fit items-center rounded-lg border border-white/15 bg-white/8 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/12">
                Выбрать другой знак
              </button>
            ) : (
              <div className="inline-flex w-fit items-center rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-100">
                <ShieldCheck className="mr-2 h-4 w-4" />
                без сохранения данных
              </div>
            )}
          </div>
        </header>

        {!selectedSign ? (
          <SignSelection publicMode={publicMode} hintSign={hintSign} onSelect={chooseSign} />
        ) : (
          <>
            <HubNavigation publicMode={publicMode} activeTab={activeTab} onChange={setActiveTab} />

            <section className="min-w-0 flex-1">
              {activeTab === "today" ? (
                appDateKey ? <TodaySection publicMode={publicMode} sign={selectedSign} dateKey={appDateKey} /> : <DateLoadingSection publicMode={publicMode} title="Сегодня" />
              ) : null}
              {activeTab === "week" ? (
                appDateKey ? <WeekSection publicMode={publicMode} sign={selectedSign} dateKey={appDateKey} /> : <DateLoadingSection publicMode={publicMode} title="Неделя" />
              ) : null}
              {activeTab === "lucky" ? (
                appDateKey ? <LuckyDaysSection publicMode={publicMode} sign={selectedSign} dateKey={appDateKey} /> : <DateLoadingSection publicMode={publicMode} title="Удачные дни" />
              ) : null}
              {activeTab === "more" ? (
                <MoreSection publicMode={publicMode} appDateKey={appDateKey} self={self} partner={partner} result={result} relationshipMode={relationshipMode} />
              ) : null}
              {activeTab === "compatibility" ? (
                <div className="space-y-4">
                  <StepProgress publicMode={publicMode} step={step} />
                  <ModeSelector publicMode={publicMode} mode={mode} onChange={setMode} />
                  <RelationshipModeSelector publicMode={publicMode} mode={relationshipMode} onChange={setRelationshipMode} />
                  <div className="min-w-0 flex-1 transition-all duration-300">
                    {step === 1 ? (
                      <WizardCard publicMode={publicMode} stepLabel="Шаг 1 из 3" title="Вы">
                        <PersonPanel publicMode={publicMode} title="Вы" mode={mode} value={self} onChange={setSelf} />
                        <div className="mt-5">
                          <button type="button" onClick={() => setStep(2)} className={primaryButtonClass(publicMode)}>
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
                        {isReadyToCalculate(mode, self, partner) ? (
                          <ResultPanel publicMode={publicMode} result={result} onEdit={() => setStep(1)} onReset={resetFlow} />
                        ) : (
                          <div className="py-8 text-center">
                            <p className="text-slate-300">Заполните данные, чтобы увидеть совместимость.</p>
                            <div className="mt-6 flex justify-center">
                              <button type="button" onClick={() => setStep(1)} className={secondaryButtonClass(publicMode)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Вернуться к заполнению
                              </button>
                            </div>
                          </div>
                        )}
                      </WizardCard>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function SignSelection({ publicMode, hintSign, onSelect }: { publicMode: boolean; hintSign: ZodiacSign | null; onSelect: (slug: string) => void }) {
  return (
    <section className={panelClass(publicMode)}>
      <div className="min-w-0">
        <p className={eyebrowClass(publicMode)}>Выбор знака</p>
        <h2 className={sectionTitleClass(publicMode)}>Выберите знак</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Прогнозы, календарь и совместимость откроются после вашего выбора.
        </p>
      </div>

      {hintSign ? (
        <div className="mt-4 rounded-lg border border-amber-200/25 bg-amber-200/10 p-3 text-sm text-amber-50">
          <p>Вы пришли из канала {hintSign.name}</p>
          <button type="button" onClick={() => onSelect(hintSign.slug)} className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-amber-100/40 bg-amber-200/15 px-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-200/20">
            Выбрать {hintSign.name}
          </button>
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {signs.map((sign) => (
          <button
            key={sign.slug}
            type="button"
            onClick={() => onSelect(sign.slug)}
            className="min-h-[104px] rounded-lg border border-white/12 bg-white/8 p-3 text-left shadow-[0_14px_44px_rgba(8,13,30,0.2)] transition hover:border-fuchsia-200/45 hover:bg-white/12"
          >
            <span className="block text-2xl leading-none text-amber-100">{sign.emoji}</span>
            <span className="mt-3 block text-base font-semibold text-white">{sign.name}</span>
            <span className="mt-1 block text-xs leading-4 text-slate-300">{sign.range}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function HubNavigation({ publicMode, activeTab, onChange }: { publicMode: boolean; activeTab: HubTab; onChange: (tab: HubTab) => void }) {
  return (
    <nav className={publicMode ? "grid grid-cols-5 gap-2" : "grid grid-cols-5 gap-2"}>
      {hubTabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={
              active
                ? "flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-lg border border-amber-200/55 bg-amber-200/15 px-1 text-center text-[11px] font-semibold leading-tight text-amber-50 shadow-sm"
                : "flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/7 px-1 text-center text-[11px] font-semibold leading-tight text-slate-300 transition hover:border-fuchsia-200/35 hover:bg-white/10"
            }
            aria-label={tab.label}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="block max-w-full break-words">{tab.shortLabel}</span>
          </button>
        );
      })}
    </nav>
  );
}

function TodaySection({ publicMode, sign, dateKey }: { publicMode: boolean; sign: ZodiacSign; dateKey: string }) {
  const forecast = buildDailyForecast(sign, dateKey);
  const dayEnergy = buildDayEnergy(dateKey, sign.slug);

  return (
    <section className={panelClass(publicMode)}>
      <SectionHeader publicMode={publicMode} icon={<Sparkles className="h-5 w-5" />} title="Сегодня" subtitle={`${sign.emoji} ${sign.name} · ${formatZodiacDisplayDate(dateKey)}`} />

      <div className="mt-5 space-y-3">
        <EnergyCard publicMode={publicMode} energy={dayEnergy} />
        <InfoRow publicMode={publicMode} label="💡 Совет дня" text={forecast.advice} />
        <InfoRow publicMode={publicMode} label="✅ Стоит сделать" text={forecast.action} />
        <InfoRow publicMode={publicMode} label="⚠️ Лучше избегать" text={forecast.avoid} />
      </div>

      <div className="mt-4 rounded-lg border border-fuchsia-200/15 bg-fuchsia-200/10 p-4">
        <p className="text-sm font-semibold text-amber-100">Краткий прогноз</p>
        <p className="mt-2 text-sm leading-6 text-slate-200">{forecast.text}</p>
      </div>
    </section>
  );
}

function WeekSection({ publicMode, sign, dateKey }: { publicMode: boolean; sign: ZodiacSign; dateKey: string }) {
  const forecast = buildWeekForecast(sign, dateKey);
  const weekRange = getWeekRangeForDate(dateKey, DEFAULT_ZODIAC_TIME_ZONE);

  return (
    <section className={panelClass(publicMode)}>
      <SectionHeader
        publicMode={publicMode}
        icon={<Star className="h-5 w-5" />}
        title="Неделя"
        subtitle={`${sign.emoji} ${sign.name} · ${formatZodiacDisplayDate(weekRange.startDateKey)} - ${formatZodiacDisplayDate(weekRange.endDateKey)}`}
      />

      <div className="mt-5 grid gap-3">
        <InfoRow publicMode={publicMode} label="Главная тема недели" text={forecast.theme} />
        <InfoRow publicMode={publicMode} label="Любовь" text={forecast.love} />
        <InfoRow publicMode={publicMode} label="Работа и деньги" text={forecast.money} />
        <InfoRow publicMode={publicMode} label="Энергия" text={forecast.energy} />
        <InfoRow publicMode={publicMode} label="Совет недели" text={forecast.advice} />
      </div>
    </section>
  );
}

function LuckyDaysSection({ publicMode, sign, dateKey }: { publicMode: boolean; sign: ZodiacSign; dateKey: string }) {
  const startDateKey = getLuckyDaysStartDate(dateKey);
  const days = buildLuckyDays(sign, startDateKey, 7);
  const dayEnergy = buildDayEnergy(dateKey, sign.slug);

  return (
    <section className={panelClass(publicMode)}>
      <SectionHeader
        publicMode={publicMode}
        icon={<CalendarDays className="h-5 w-5" />}
        title="Удачные дни"
        subtitle={`${sign.emoji} ${sign.name} · с ${formatZodiacDisplayDate(startDateKey)}`}
      />

      <div className="mt-5 space-y-3">
        <EnergyCard publicMode={publicMode} energy={dayEnergy} />
      </div>

      <div className="mt-4 grid max-h-[520px] gap-3 overflow-y-auto pr-1">
        {days.map((day) => (
          <div key={day.iso} className="rounded-lg border border-white/12 bg-white/8 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{day.date}</p>
                <p className="mt-1 text-xs text-slate-400">{day.weekday}</p>
              </div>
              <span className="rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-50">{day.status}</span>
            </div>
            <p className="mt-3 text-sm leading-5 text-slate-300">Лучше всего: {day.area}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EnergyCard({ publicMode, energy }: { publicMode: boolean; energy: DayEnergy }) {
  return (
    <div className={publicMode ? "rounded-lg border border-indigo-200/15 bg-indigo-200/10 p-3 text-slate-100" : "rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-slate-700"}>
      <p className={publicMode ? "text-sm font-semibold text-indigo-100" : "text-sm font-semibold text-indigo-800"}>🌙 Энергия дня: {energy.type}</p>
      <div className="mt-2 grid gap-2 text-sm leading-5">
        <p><span className="font-semibold">Лучше для:</span> {energy.bestFor}</p>
        <p><span className="font-semibold">Тон:</span> {energy.relationshipTone}</p>
        <p><span className="font-semibold">Избегать:</span> {energy.avoid}</p>
      </div>
    </div>
  );
}

function DateLoadingSection({ publicMode, title }: { publicMode: boolean; title: string }) {
  return (
    <section className={panelClass(publicMode)}>
      <SectionHeader publicMode={publicMode} icon={<CalendarDays className="h-5 w-5" />} title={title} subtitle="Обновляем дату" />
      <div className="mt-5 h-28 animate-pulse rounded-lg border border-white/12 bg-white/8" />
    </section>
  );
}

function MoreSection({
  publicMode,
  appDateKey,
  self,
  partner,
  result,
  relationshipMode,
}: {
  publicMode: boolean;
  appDateKey: string | null;
  self: PersonState;
  partner: PersonState;
  result: CompatibilityResult;
  relationshipMode: RelationshipMode;
}) {
  const [messageTone, setMessageTone] = useState<MessageTone>("soft");
  const dateKey = appDateKey ?? getCurrentZodiacDateKey(DEFAULT_ZODIAC_TIME_ZONE);
  const pairReady = Boolean(self.sign && partner.sign);
  const coupleHoroscope = pairReady ? buildCoupleHoroscope(self, partner, dateKey, relationshipMode, result) : null;
  const coupleCalendar = pairReady ? buildCoupleCalendar(self, partner, dateKey, result) : [];
  const reconciliation = pairReady ? buildReconciliationDay(self, partner, dateKey, result) : null;
  const message = pairReady ? buildPartnerMessage(self, partner, dateKey, messageTone, result) : null;
  const natalChart = buildNatalChart(self);

  return (
    <section className={panelClass(publicMode)}>
      <SectionHeader publicMode={publicMode} icon={<Crown className="h-5 w-5" />} title="Ещё" subtitle="Карта пары, календарь, примирение и натальная подсказка" />
      <p className={publicMode ? "mt-3 rounded-lg border border-emerald-200/20 bg-emerald-200/10 p-3 text-sm leading-5 text-emerald-50" : "mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-5 text-emerald-900"}>
        Имена, даты, время и город используются только на этом экране и не сохраняются.
      </p>
      <div className="mt-5 space-y-4">
        <CoupleHoroscopeCard publicMode={publicMode} horoscope={coupleHoroscope} />
        <RelationshipMapCard publicMode={publicMode} result={result} pairReady={pairReady} />
        <CoupleCalendarCard publicMode={publicMode} days={coupleCalendar} pairReady={pairReady} />
        <ReconciliationDayCard publicMode={publicMode} reconciliation={reconciliation} />
        <PartnerMessageCard publicMode={publicMode} message={message} tone={messageTone} onToneChange={setMessageTone} pairReady={pairReady} />
        <NatalChartCard publicMode={publicMode} chart={natalChart} />
        <LockedPreviewCard
          publicMode={publicMode}
          icon={<Crown className="h-5 w-5" />}
          title="👑 VIP превью"
          text="Это только превью: расширенные разборы останутся закрытыми до запуска подписки и Telegram Stars."
          items={[
            "полная натальная карта: асцендент, дома и аспекты",
            "расширенная совместимость и карта пары",
            "календарь пары на 30 дней",
            "лучшие дни для примирения и свиданий",
            "подсказки для сообщений партнёру",
            "прогноз на месяц без обещаний точности",
          ]}
        />
        <LockedPreviewCard
          publicMode={publicMode}
          icon={<Gift className="h-5 w-5" />}
          title="🎁 Розыгрыши запланированы"
          text="Это только превью: механики участия появятся позже."
          items={[
            "задания для подписчиков",
            "бонусы за активность",
            "призы и сезонные события",
            "участие через Mini App",
            "активности по каналам без сбора участников сейчас",
          ]}
        />
      </div>
    </section>
  );
}

function CoupleHoroscopeCard({ publicMode, horoscope }: { publicMode: boolean; horoscope: CoupleHoroscope | null }) {
  if (!horoscope) return <EmptyFeatureCard publicMode={publicMode} title="💑 Гороскоп пары" text="Заполните данные пары, чтобы увидеть гороскоп пары." />;

  return (
    <FeatureCard publicMode={publicMode} title="💑 Гороскоп пары на сегодня" subtitle={horoscope.summary}>
      <div className="grid gap-3">
        <InfoRow publicMode={publicMode} label="❤️ Для отношений" text={horoscope.relationship} />
        <InfoRow publicMode={publicMode} label="💬 Для разговора" text={horoscope.talk} />
        <InfoRow publicMode={publicMode} label="🌹 Для свидания" text={horoscope.date} />
        <InfoRow publicMode={publicMode} label="🕊 Для примирения" text={horoscope.reconciliation} />
        <InfoRow publicMode={publicMode} label="✅ Стоит сделать" text={horoscope.action} />
        <InfoRow publicMode={publicMode} label="⚠️ Лучше избегать" text={horoscope.avoid} />
        <EnergyCard publicMode={publicMode} energy={horoscope.energy} />
      </div>
    </FeatureCard>
  );
}

function RelationshipMapCard({ publicMode, result, pairReady }: { publicMode: boolean; result: CompatibilityResult; pairReady: boolean }) {
  if (!pairReady) return <EmptyFeatureCard publicMode={publicMode} title="🧭 Карта отношений" text="Заполните данные пары, чтобы увидеть карту отношений." />;

  return (
    <FeatureCard publicMode={publicMode} title="🧭 Карта отношений" subtitle={result.mapSummary}>
      <div className="space-y-3">
        {result.mapScores.map((item) => (
          <ScoreBar key={item.label} publicMode={publicMode} label={item.label} value={item.value} text={item.text} />
        ))}
        <ResultTextCard publicMode={publicMode} title="Сильная сторона" text={result.strengthText} />
        <ResultTextCard publicMode={publicMode} title="Зона внимания" text={result.riskText} />
      </div>
    </FeatureCard>
  );
}

function CoupleCalendarCard({ publicMode, days, pairReady }: { publicMode: boolean; days: CoupleCalendarDay[]; pairReady: boolean }) {
  if (!pairReady) return <EmptyFeatureCard publicMode={publicMode} title="📅 Календарь пары" text="Заполните данные пары, чтобы увидеть календарь пары." />;

  return (
    <FeatureCard publicMode={publicMode} title="📅 Календарь пары" subtitle="Ближайшие 7 дней">
      <div className="grid max-h-[430px] gap-3 overflow-y-auto pr-1">
        {days.map((day) => (
          <div key={day.dateKey} className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-3" : "rounded-lg border border-slate-200 bg-white p-3"}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={publicMode ? "text-sm font-semibold text-white" : "text-sm font-semibold text-slate-950"}>{day.date}</p>
                <p className={publicMode ? "mt-1 text-xs text-slate-400" : "mt-1 text-xs text-slate-500"}>{day.weekday}</p>
              </div>
              <span className={publicMode ? "rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-50" : "rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800"}>{day.status}</span>
            </div>
            <p className={publicMode ? "mt-3 text-sm leading-5 text-slate-300" : "mt-3 text-sm leading-5 text-slate-600"}>{day.advice}</p>
          </div>
        ))}
      </div>
    </FeatureCard>
  );
}

function ReconciliationDayCard({ publicMode, reconciliation }: { publicMode: boolean; reconciliation: ReconciliationDay | null }) {
  if (!reconciliation) return <EmptyFeatureCard publicMode={publicMode} title="🕊 День для примирения" text="Заполните данные пары, чтобы увидеть мягкую подсказку для примирения." />;

  return (
    <FeatureCard publicMode={publicMode} title="🕊 День для примирения" subtitle={reconciliation.status}>
      <div className="grid gap-3">
        <InfoRow publicMode={publicMode} label="Как подойти" text={reconciliation.approach} />
        <InfoRow publicMode={publicMode} label="Чего избегать" text={reconciliation.avoid} />
        <EnergyCard publicMode={publicMode} energy={reconciliation.energy} />
      </div>
    </FeatureCard>
  );
}

function PartnerMessageCard({
  publicMode,
  message,
  tone,
  onToneChange,
  pairReady,
}: {
  publicMode: boolean;
  message: string | null;
  tone: MessageTone;
  onToneChange: (tone: MessageTone) => void;
  pairReady: boolean;
}) {
  if (!pairReady) return <EmptyFeatureCard publicMode={publicMode} title="💌 Что написать партнёру" text="Заполните данные пары, чтобы получить уважительную подсказку для сообщения." />;

  return (
    <FeatureCard publicMode={publicMode} title="💌 Что написать партнёру" subtitle="Текст можно скопировать вручную и изменить под себя">
      <div className="grid grid-cols-2 gap-2">
        {messageTones.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onToneChange(item.id)}
            className={
              publicMode
                ? `rounded-lg border px-3 py-2 text-left text-xs font-semibold transition ${tone === item.id ? "border-rose-200/70 bg-rose-200/15 text-rose-50" : "border-white/10 bg-white/6 text-slate-300"}`
                : `rounded-lg border px-3 py-2 text-left text-xs font-semibold transition ${tone === item.id ? "border-rose-300 bg-rose-50 text-rose-900" : "border-slate-200 bg-white text-slate-700"}`
            }
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={publicMode ? "mt-3 rounded-lg border border-white/12 bg-white/8 p-3 text-sm leading-6 text-slate-100" : "mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700"}>
        {message}
      </div>
    </FeatureCard>
  );
}

function NatalChartCard({ publicMode, chart }: { publicMode: boolean; chart: NatalChart | null }) {
  if (!chart) return <EmptyFeatureCard publicMode={publicMode} title="🌌 Натальная карта" text="Заполните дату рождения в блоке «Вы», чтобы увидеть натальную подсказку." />;

  return (
    <FeatureCard publicMode={publicMode} title="🌌 Натальная карта" subtitle={`${chart.sign.emoji} ${chart.sign.name} · ${chart.element} · ${chart.modality}`}>
      <div className="grid gap-3">
        <InfoRow publicMode={publicMode} label="База" text={chart.archetype} />
        <InfoRow publicMode={publicMode} label="Сильные стороны" text={chart.strengths} />
        <InfoRow publicMode={publicMode} label="Зона роста" text={chart.growth} />
        <InfoRow publicMode={publicMode} label="В любви" text={chart.loveStyle} />
        <InfoRow publicMode={publicMode} label="В общении" text={chart.communicationStyle} />
        <p className={publicMode ? "rounded-lg border border-amber-200/20 bg-amber-200/10 p-3 text-sm leading-5 text-amber-50" : "rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900"}>{chart.precisionNote}</p>
      </div>
    </FeatureCard>
  );
}

function EmptyFeatureCard({ publicMode, title, text }: { publicMode: boolean; title: string; text: string }) {
  return (
    <FeatureCard publicMode={publicMode} title={title} subtitle={text}>
      <p className={publicMode ? "text-sm leading-5 text-slate-400" : "text-sm leading-5 text-slate-500"}>Данные остаются только на экране и не сохраняются.</p>
    </FeatureCard>
  );
}

function FeatureCard({ publicMode, title, subtitle, children }: { publicMode: boolean; title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-4 text-slate-100" : "rounded-lg border border-slate-200 bg-white p-4 text-slate-700"}>
      <p className={publicMode ? "text-base font-semibold text-white" : "text-base font-semibold text-slate-950"}>{title}</p>
      <p className={publicMode ? "mt-1 text-sm leading-5 text-slate-300" : "mt-1 text-sm leading-5 text-slate-600"}>{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function SectionHeader({ publicMode, icon, title, subtitle }: { publicMode: boolean; icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className={publicMode ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-fuchsia-200/20 bg-fuchsia-200/10 text-fuchsia-100" : "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-fuchsia-200/20 bg-fuchsia-200/10 text-fuchsia-100"}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className={eyebrowClass(publicMode)}>Гороскоп</p>
        <h2 className={sectionTitleClass(publicMode)}>{title}</h2>
        <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
      </div>
    </div>
  );
}

function InfoRow({ publicMode, label, text }: { publicMode: boolean; label: string; text: string }) {
  return (
    <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-3" : "rounded-lg border border-white/12 bg-white/8 p-3"}>
      <p className="text-sm font-semibold text-amber-100">{label}</p>
      <p className="mt-2 text-sm leading-5 text-slate-300">{text}</p>
    </div>
  );
}

function LockedPreviewCard({ publicMode, icon, title, text, items }: { publicMode: boolean; icon: ReactNode; title: string; text: string; items: string[] }) {
  return (
    <div className={publicMode ? "rounded-lg border border-amber-200/20 bg-amber-200/10 p-4" : "rounded-lg border border-amber-200/20 bg-amber-200/10 p-4"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-semibold text-white">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200/25 bg-black/20 text-amber-100">
          {icon}
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/12 bg-white/7 px-3 py-2 text-xs font-semibold text-slate-300">
        <Lock className="h-4 w-4 text-amber-100" />
        только превью
      </div>
      <ul className="mt-4 space-y-2 text-sm leading-5 text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-200" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function panelClass(_publicMode: boolean) {
  return "min-w-0 rounded-lg border border-white/12 bg-white/10 p-4 shadow-[0_18px_60px_rgba(8,13,30,0.38)] backdrop-blur transition-all duration-300";
}

function eyebrowClass(_publicMode: boolean) {
  return "text-xs font-semibold text-amber-100";
}

function sectionTitleClass(_publicMode: boolean) {
  return "mt-1 break-words text-xl font-semibold leading-tight text-white [overflow-wrap:anywhere]";
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

function RelationshipModeSelector({ publicMode, mode, onChange }: { publicMode: boolean; mode: RelationshipMode; onChange: (mode: RelationshipMode) => void }) {
  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {relationshipModes.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={
            publicMode
              ? `min-w-0 rounded-lg border px-2 py-3 text-left text-xs shadow-sm transition ${
                  mode === item.id ? "border-rose-200/70 bg-rose-200/15 text-rose-50" : "border-white/10 bg-white/6 text-slate-300 hover:border-rose-200/40"
                }`
              : `min-w-0 rounded-lg border px-2 py-3 text-left text-xs shadow-sm transition ${
                  mode === item.id ? "border-rose-300 bg-rose-50 text-rose-900" : "border-slate-200 bg-white text-slate-700 hover:border-rose-200"
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
  const isSelfPanel = title === "Вы";
  const nameLabel = isSelfPanel ? "Ваше имя" : "Имя партнёра";
  const namePlaceholder = "необязательно";

  return (
    <div className={publicMode ? "min-w-0 space-y-4" : "min-w-0 space-y-4"}>
      {!publicMode ? <h2 className="text-lg font-semibold text-slate-950">{title}</h2> : null}
      <div className="mt-5 space-y-4">
        <Field label={nameLabel} publicMode={publicMode}>
          <input
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={30}
            value={value.name}
            onBlur={() => onChange({ ...value, name: normalizeName(value.name) })}
            onChange={(event) => onChange({ ...value, name: sanitizeNameInput(event.target.value) })}
            placeholder={namePlaceholder}
            className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900"
          />
        </Field>

        <Field label="Знак" publicMode={publicMode}>
          <select
            value={value.sign}
            onChange={(event) => onChange({ ...value, sign: event.target.value })}
            className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900"
          >
            <option value="" disabled>Выберите знак...</option>
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
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                value={value.birthDate}
                onChange={(event) => updateBirthDate(value, event.target.value, onChange)}
                placeholder="дд.мм.гггг"
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
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="чч:мм"
                    value={value.birthTime}
                    onChange={(event) => onChange({ ...value, birthTime: formatTimeInput(event.target.value) })}
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900"
                  />
                  {value.knowsTime && value.birthTime && !isValidTime(value.birthTime) ? (
                    <p className="mt-2 text-xs font-semibold text-rose-700">Укажите корректное время (00:00 - 23:59).</p>
                  ) : null}
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
  const selectedCity = getCityById(cityId);
  return {
    name: "",
    sign,
    gender,
    birthDate: "",
    knowsTime,
    birthTime: "",
    cityQuery: selectedCity ? cityLabel(selectedCity) : "",
    selectedCityId: selectedCity?.cityId ?? "",
  };
}

function sanitizeNameInput(value: string) {
  return String(value || "")
    .replace(/[^A-Za-zА-Яа-яЁё\s-]/g, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, 30);
}

function normalizeName(value: string) {
  return sanitizeNameInput(value).trim().replace(/\s{2,}/g, " ");
}

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

function formatTimeInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isValidTime(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;
  const h = Number(match[1]);
  const m = Number(match[2]);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

function isReadyToCalculate(mode: Mode, self: PersonState, partner: PersonState) {
  if (!self.sign || !partner.sign) return false;
  if (mode !== "fast") {
    if (!parseBirthDate(self.birthDate).ok) return false;
    if (!parseBirthDate(partner.birthDate).ok) return false;
  }
  if (mode === "precise") {
    if (self.knowsTime && (!isValidTime(self.birthTime) || !self.selectedCityId)) return false;
    if (partner.knowsTime && (!isValidTime(partner.birthTime) || !partner.selectedCityId)) return false;
  }
  return true;
}

function updateBirthDate(value: PersonState, rawValue: string, onChange: (value: PersonState) => void) {
  const formatted = formatDateInput(rawValue);
  const parsed = parseBirthDate(formatted);
  onChange({ ...value, birthDate: formatted, sign: parsed.ok ? parsed.signSlug : value.sign });
}

interface NameResonance {
  text: string;
  adviceText: string;
  communicationShift: number;
  loveShift: number;
}

interface RelationshipMapScore {
  label: string;
  value: number;
  text: string;
}

interface CompatibilityResult {
  title: string;
  modeLabel: string;
  relationshipMode: RelationshipMode;
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
  nameResonance: NameResonance | null;
  mapScores: RelationshipMapScore[];
  mapSummary: string;
  strengthText: string;
  riskText: string;
}

interface DayEnergy {
  type: string;
  bestFor: string;
  avoid: string;
  mood: string;
  relationshipTone: string;
}

interface CoupleHoroscope {
  summary: string;
  relationship: string;
  talk: string;
  date: string;
  reconciliation: string;
  action: string;
  avoid: string;
  energy: DayEnergy;
}

interface CoupleCalendarDay {
  dateKey: string;
  date: string;
  weekday: string;
  status: string;
  advice: string;
}

interface ReconciliationDay {
  status: string;
  approach: string;
  avoid: string;
  energy: DayEnergy;
}

interface NatalChart {
  sign: ZodiacSign;
  element: string;
  modality: string;
  polarity: string;
  archetype: string;
  strengths: string;
  growth: string;
  loveStyle: string;
  communicationStyle: string;
  precisionNote: string;
}

type MessageTone = "soft" | "romantic" | "afterFight" | "longSilence" | "invite" | "reconciliation";

function buildCompatibilityResult(mode: Mode, relationshipMode: RelationshipMode, self: PersonState, partner: PersonState): CompatibilityResult {
  const selfSign = findSign(self.sign);
  const partnerSign = findSign(partner.sign);
  const selfDate = parseBirthDate(self.birthDate);
  const partnerDate = parseBirthDate(partner.birthDate);
  const selfCity = self.knowsTime ? getCityById(self.selectedCityId) : null;
  const partnerCity = partner.knowsTime ? getCityById(partner.selectedCityId) : null;
  const modeLabel = modes.find((item) => item.id === mode)?.resultLabel ?? "Расчёт";
  const relationshipLabel = relationshipModes.find((item) => item.id === relationshipMode)?.label ?? "❤️ Любовь";
  const title = `${selfSign.emoji} ${selfSign.name}${genderSuffix(self.gender)} + ${partnerSign.emoji} ${partnerSign.name}${genderSuffix(partner.gender)}`;
  const validationMessages = buildValidationMessages(mode, self, partner, selfDate, partnerDate, selfCity, partnerCity);
  const nameResonance = buildNameResonance(self.name, partner.name);
  const seed = hashString([
    mode,
    relationshipMode,
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
  const base = baseCompatibilityScore(selfSign, partnerSign);
  const modeBoost = mode === "fast" ? 0 : mode === "personal" ? 2 : 4;
  const relationshipShift = relationshipModeScoreShift(relationshipMode, selfSign, partnerSign, seed);
  const personalShift = mode === "fast" ? 0 : birthDateCompatibilityShift(selfDate, partnerDate);
  const preciseShift = mode === "precise" ? preciseCompatibilityShift(self, partner, selfCity, partnerCity) : 0;
  const nameTotalShift = nameResonance ? Math.round((nameResonance.communicationShift + nameResonance.loveShift) / 2) : 0;
  const total = clampScore(base + modeBoost + relationshipShift + personalShift + preciseShift + variance(seed, 0, 13) - 6 + nameTotalShift);
  const scores = {
    total,
    attraction: clampScore(total + relationshipScoreNudge(relationshipMode, "attraction") + variance(seed, 1, 17) - 8),
    communication: clampScore(total + relationshipScoreNudge(relationshipMode, "communication") + variance(seed, 2, 19) - 9 + (nameResonance?.communicationShift ?? 0)),
    love: clampScore(total + relationshipScoreNudge(relationshipMode, "love") + variance(seed, 3, 21) - 10 + (nameResonance?.loveShift ?? 0)),
    household: clampScore(total + relationshipScoreNudge(relationshipMode, "household") + variance(seed, 4, 17) - 8),
  };
  const mapScores = buildRelationshipMapScores(scores, seed, relationshipMode);
  const preciseKnown = mode === "precise" && self.knowsTime && partner.knowsTime && Boolean(selfCity && partnerCity);
  const unknownPreciseTime = mode === "precise" && (!self.knowsTime || !partner.knowsTime);
  return {
    title,
    modeLabel: `${modeLabel} · ${relationshipLabel}`,
    relationshipMode,
    dataUseLabel: buildDataUseLabel(mode, preciseKnown),
    note: preciseKnown ? exactBirthDataNote : unknownPreciseTime ? unknownBirthTimeNote : null,
    validationMessages,
    scores,
    attractionText: buildScoreText("attraction", scores.attraction, seed),
    communicationText: buildScoreText("communication", scores.communication, seed),
    loveText: buildScoreText("love", scores.love, seed),
    householdText: buildScoreText("household", scores.household, seed),
    weakSpotText: buildRiskText(total, seed),
    adviceText: nameResonance ? `${buildAdviceText(total, relationshipMode, seed)}. ${nameResonance.adviceText}` : buildAdviceText(total, relationshipMode, seed),
    conclusionText: buildConclusion(total, mode, relationshipMode),
    nameResonance,
    mapScores,
    mapSummary: buildMapSummary(total, relationshipMode),
    strengthText: buildStrengthText(scores, seed),
    riskText: buildRiskText(total, seed + 11),
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

function baseCompatibilityScore(firstSign: ZodiacSign, secondSign: ZodiacSign) {
  const firstTraits = signTraits[firstSign.slug];
  const secondTraits = signTraits[secondSign.slug];
  const elementKey = [firstSign.element, secondSign.element].sort().join("+");
  const elementShift =
    firstSign.element === secondSign.element
      ? 10
      : elementKey === "air+fire" || elementKey === "earth+water"
        ? 16
        : elementKey === "air+water" || elementKey === "earth+fire"
          ? -8
          : -2;
  const distance = zodiacDistance(firstSign.slug, secondSign.slug);
  const aspectShift = aspectScoreShift(distance);
  const modalityShift = firstTraits.modality === secondTraits.modality ? -5 : 3;
  const polarityShift = firstTraits.polarity === secondTraits.polarity ? 3 : -2;

  return 58 + elementShift + aspectShift + modalityShift + polarityShift;
}

function zodiacDistance(firstSlug: string, secondSlug: string) {
  const firstIndex = signIndex(firstSlug);
  const secondIndex = signIndex(secondSlug);
  const direct = Math.abs(firstIndex - secondIndex);
  return Math.min(direct, 12 - direct);
}

function signIndex(slug: string) {
  return signs.findIndex((sign) => sign.slug === slug);
}

function aspectScoreShift(distance: number) {
  if (distance === 0) return 0;
  if (distance === 1) return -9;
  if (distance === 2) return 9;
  if (distance === 3) return -14;
  if (distance === 4) return 13;
  if (distance === 5) return -7;
  if (distance === 6) return -3;
  return 0;
}

function relationshipModeScoreShift(mode: RelationshipMode, firstSign: ZodiacSign, secondSign: ZodiacSign, seed: number) {
  const firstTraits = signTraits[firstSign.slug];
  const secondTraits = signTraits[secondSign.slug];
  const sameElement = firstSign.element === secondSign.element;
  const sameModality = firstTraits.modality === secondTraits.modality;

  if (mode === "friendship") return (sameElement ? 5 : 0) + (variance(seed, 9, 5) - 2);
  if (mode === "work") return (firstTraits.modality !== secondTraits.modality ? 5 : -2) + (variance(seed, 10, 5) - 2);
  if (mode === "family") return (firstSign.element === "earth" || secondSign.element === "earth" ? 4 : 0) + (sameModality ? -2 : 2);
  if (mode === "passion") return (zodiacDistance(firstSign.slug, secondSign.slug) === 1 ? 6 : 0) + (variance(seed, 11, 7) - 3);
  if (mode === "reconciliation") return (sameElement ? 2 : -1) + (sameModality ? -4 : 3);
  return variance(seed, 8, 5) - 2;
}

function relationshipScoreNudge(mode: RelationshipMode, score: "attraction" | "communication" | "love" | "household") {
  const nudges: Record<RelationshipMode, Record<typeof score, number>> = {
    love: { attraction: 2, communication: 0, love: 5, household: 0 },
    friendship: { attraction: -2, communication: 6, love: 0, household: 1 },
    work: { attraction: -4, communication: 5, love: -2, household: 4 },
    family: { attraction: -1, communication: 1, love: 2, household: 7 },
    passion: { attraction: 8, communication: -2, love: 1, household: -3 },
    reconciliation: { attraction: -2, communication: 7, love: 1, household: 0 },
  };

  return nudges[mode][score];
}

function birthDateCompatibilityShift(selfDate: ParsedDate, partnerDate: ParsedDate) {
  if (!selfDate.ok || !partnerDate.ok) return 0;
  const distance = Math.abs(getDateOrdinal(selfDate.iso) - getDateOrdinal(partnerDate.iso));
  const rhythm = distance % 9;
  if (rhythm === 0 || rhythm === 3) return 4;
  if (rhythm === 1 || rhythm === 8) return -4;
  return rhythm === 5 ? -2 : 1;
}

function preciseCompatibilityShift(self: PersonState, partner: PersonState, selfCity: City | null, partnerCity: City | null) {
  let shift = 0;
  if (self.knowsTime && isValidTime(self.birthTime)) shift += 1;
  if (partner.knowsTime && isValidTime(partner.birthTime)) shift += 1;
  if (selfCity && partnerCity) shift += selfCity.timezone === partnerCity.timezone ? 2 : 0;
  return shift;
}

function buildRelationshipMapScores(scores: CompatibilityResult["scores"], seed: number, relationshipMode: RelationshipMode): RelationshipMapScore[] {
  const conflict = clampScore(100 - scores.communication + variance(seed, 12, 13) - 6);
  const money = clampScore(Math.round((scores.household + scores.communication) / 2) + relationshipScoreNudge(relationshipMode, "household") + variance(seed, 13, 11) - 5);
  const mental = clampScore(scores.communication + variance(seed, 14, 11) - 5);
  const reconciliation = clampScore(Math.round((scores.communication + scores.love) / 2) + relationshipScoreNudge("reconciliation", "communication") + variance(seed, 15, 9) - 4);
  const potential = clampScore(Math.round((scores.total + scores.communication + scores.love) / 3) + variance(seed, 16, 9) - 4);

  return [
    { label: "❤️ Любовь", value: scores.love, text: buildScoreText("love", scores.love, seed + 1) },
    { label: "🔥 Притяжение", value: scores.attraction, text: buildScoreText("attraction", scores.attraction, seed + 2) },
    { label: "💬 Общение", value: scores.communication, text: buildScoreText("communication", scores.communication, seed + 3) },
    { label: "🏠 Быт и ритм", value: scores.household, text: buildScoreText("household", scores.household, seed + 4) },
    { label: "💰 Деньги", value: money, text: money >= 65 ? "можно договариваться о планах и бюджете" : "деньги лучше обсуждать заранее и без намёков" },
    { label: "🧠 Ментальная связь", value: mental, text: mental >= 65 ? "идеи хорошо цепляются друг за друга" : "есть риск недопонимания, важны короткие формулировки" },
    { label: "⚠️ Конфликты", value: conflict, text: conflict >= 65 ? "напряжение возможно, особенно при резком тоне" : "споры легче остановить честным вопросом" },
    { label: "🕊 Примирение", value: reconciliation, text: reconciliation >= 65 ? "мягкий разговор может быстро снизить напряжение" : "лучше идти маленькими шагами и не требовать ответа сразу" },
    { label: "⭐ Потенциал", value: potential, text: potential >= 70 ? "у пары есть хороший запас роста" : "потенциал зависит от границ, терпения и ясных просьб" },
  ];
}

function buildScoreText(kind: "attraction" | "communication" | "love" | "household", score: number, seed: number) {
  const lineSet = kind === "attraction" ? attractionLines : kind === "communication" ? communicationLines : kind === "love" ? loveLines : householdLines;
  if (score >= 70) return pickLine(lineSet.strong, seed, 1);
  if (score >= 55) return pickLine(lineSet.medium, seed, 2);
  return pickLine(lineSet.tense, seed, 3);
}

function buildAdviceText(score: number, mode: RelationshipMode, seed: number) {
  const lines = score >= 70 ? adviceLines.strong : score >= 55 ? adviceLines.medium : adviceLines.tense;
  const modeTip = relationshipModeAdvice[mode];
  return `${pickLine(lines, seed, 6)}. ${pickLine(modeTip, seed, 7)}`;
}

function buildRiskText(score: number, seed: number) {
  const lines = score >= 70 ? weakSpotLines.strong : score >= 55 ? weakSpotLines.medium : weakSpotLines.tense;
  return pickLine(lines, seed, 5);
}

function buildStrengthText(scores: CompatibilityResult["scores"], seed: number) {
  const ranked = [
    { key: "love", value: scores.love, text: "тепло и желание поддерживать друг друга" },
    { key: "communication", value: scores.communication, text: "диалог, если говорить прямо и без проверок" },
    { key: "attraction", value: scores.attraction, text: "искренний интерес и живая искра" },
    { key: "household", value: scores.household, text: "способность выстраивать общий ритм" },
  ].sort((first, second) => second.value - first.value);

  return `${ranked[0].text}; ${pickLine(strengthLines, seed, 4)}`;
}

function buildMapSummary(score: number, mode: RelationshipMode) {
  const modeLabel = relationshipModes.find((item) => item.id === mode)?.label ?? "❤️ Любовь";
  if (score >= 70) return `${modeLabel}: сильные стороны заметны, но привычки всё равно важно проговаривать.`;
  if (score >= 55) return `${modeLabel}: есть ресурс, если не копить обиды и держать границы.`;
  return `${modeLabel}: потребуется больше терпения, честный разговор и уважение к разному темпу.`;
}

function normalizeMode(value?: string | null): Mode {
  const normalized = String(value || "precise").trim().toLowerCase();
  return normalized === "fast" || normalized === "personal" || normalized === "precise" ? normalized : "precise";
}

function resolveInitialSign(sign?: string | null, startParam?: string | null) {
  const fromStart = parseCompatibilityStartParam(startParam);
  const normalized = String(sign || fromStart || "").trim().toLowerCase();
  return signSlugs.has(normalized) ? normalized : null;
}

function parseCompatibilityStartParam(value?: string | null) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized || normalized === "compat") return null;
  const match = normalized.match(/^compat_([a-z-]+)$/);
  if (!match) return null;
  return signSlugs.has(match[1]) ? match[1] : null;
}

function getDateOrdinal(dateIso: string) {
  const date = parseIsoDate(dateIso);
  return Math.floor(date.getTime() / 86400000);
}

function parseIsoDate(dateIso: string) {
  const [year, month, day] = dateIso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatShortDate(dateIso: string) {
  return parseIsoDate(dateIso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

function formatWeekday(dateIso: string) {
  return parseIsoDate(dateIso).toLocaleDateString("ru-RU", { weekday: "long" });
}

function getWeekKey(dateIso: string) {
  return getWeekRangeForDate(dateIso, DEFAULT_ZODIAC_TIME_ZONE).startDateKey;
}

function pickByKey(items: string[], key: string, offset: number) {
  return items[variance(hashString(key), offset, items.length)];
}

function buildDailyForecast(sign: ZodiacSign, dateIso: string) {
  const key = `${sign.slug}:${dateIso}:today`;
  const elementSet = dailyGuidanceByElement[sign.element] ?? dailyGuidanceByElement.fire;
  const signSet = signDailyProfiles[sign.slug];
  return {
    advice: pickByKey(elementSet.advice, key, 1),
    action: pickByKey(elementSet.action, key, 2),
    avoid: pickByKey(elementSet.avoid, key, 3),
    text: `${sign.name}: ${pickByKey(signSet.openers, key, 4)} ${pickByKey(dailyForecastLines, key, 5)} ${pickByKey(signSet.focus, key, 6)}`,
  };
}

function buildWeekForecast(sign: ZodiacSign, dateIso: string) {
  const key = `${sign.slug}:${getWeekKey(dateIso)}:week`;
  const elementSet = weeklyGuidanceByElement[sign.element] ?? weeklyGuidanceByElement.fire;
  const signSet = signWeeklyProfiles[sign.slug];
  return {
    theme: `${pickByKey(signSet.theme, key, 1)}: ${pickByKey(elementSet.theme, key, 2)}`,
    love: pickByKey(elementSet.love, key, 2),
    money: pickByKey(elementSet.money, key, 3),
    energy: pickByKey(elementSet.energy, key, 4),
    advice: pickByKey(elementSet.advice, key, 5),
  };
}

function buildLuckyDays(sign: ZodiacSign, dateIso: string, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const iso = addDaysToDateKey(dateIso, index);
    const key = `${sign.slug}:${iso}:lucky`;
    const seed = hashString(key);
    const signSet = signLuckyProfiles[sign.slug];
    return {
      iso,
      date: formatShortDate(iso),
      weekday: formatWeekday(iso),
      status: luckyStatuses[variance(seed, 1, luckyStatuses.length)],
      area: `${luckyAreas[variance(seed, 2, luckyAreas.length)]}: ${pickLine(signSet, seed, 3)}`,
    };
  });
}

function validateZodiacMiniAppContent(dateKey: string) {
  const todayTexts = new Map<string, string[]>();
  const weekTexts = new Map<string, string[]>();
  const luckyTexts = new Map<string, string[]>();

  for (const sign of signs) {
    const today = buildDailyForecast(sign, dateKey).text;
    const week = buildWeekForecast(sign, dateKey).theme;
    const lucky = buildLuckyDays(sign, dateKey, 7).map((day) => `${day.status}|${day.area}`).join(";");
    addContentValidationValue(todayTexts, today, sign.name);
    addContentValidationValue(weekTexts, week, sign.name);
    addContentValidationValue(luckyTexts, lucky, sign.name);
  }

  return [
    ...buildDuplicateWarnings("Today short forecast", todayTexts),
    ...buildDuplicateWarnings("Week main theme", weekTexts),
    ...buildDuplicateWarnings("Lucky Days summary", luckyTexts),
  ];
}

function addContentValidationValue(map: Map<string, string[]>, value: string, signName: string) {
  map.set(value, [...(map.get(value) ?? []), signName]);
}

function buildDuplicateWarnings(label: string, values: Map<string, string[]>) {
  return Array.from(values.entries())
    .filter(([, signNames]) => signNames.length > 1)
    .map(([text, signNames]) => `${label} duplicate for ${signNames.join(", ")}: ${text}`);
}

function buildDayEnergy(dateKey: string, scope = "general"): DayEnergy {
  const seed = hashString(`${dateKey}:${scope}:energy`);
  return {
    type: pickLine(dayEnergyTypes, seed, 1),
    bestFor: pickLine(dayEnergyBestFor, seed, 2),
    avoid: pickLine(dayEnergyAvoid, seed, 3),
    mood: pickLine(dayEnergyMoods, seed, 4),
    relationshipTone: pickLine(dayEnergyRelationshipTone, seed, 5),
  };
}

function buildCoupleHoroscope(self: PersonState, partner: PersonState, dateKey: string, relationshipMode: RelationshipMode, result: CompatibilityResult): CoupleHoroscope {
  const seed = pairSeed(self, partner, dateKey, `couple:${relationshipMode}`);
  const energy = buildDayEnergy(dateKey, pairKey(self, partner));
  const reconciliationStatus = buildReconciliationStatus(result.scores.communication, seed);
  return {
    summary: `${formatZodiacDisplayDate(dateKey)} · ${compatibilityLevelLabel(result.scores.total)}`,
    relationship: pickLine(coupleRelationshipLines[scoreBand(result.scores.love)], seed, 1),
    talk: pickLine(coupleTalkLines[scoreBand(result.scores.communication)], seed, 2),
    date: pickLine(coupleDateLines[scoreBand(result.scores.attraction)], seed, 6),
    reconciliation: `${reconciliationStatus}: ${pickLine(coupleReconciliationLines[scoreBand(result.mapScores.find((item) => item.label.includes("Примирение"))?.value ?? result.scores.communication)], seed, 3)}`,
    action: pickLine(coupleActionLines, seed, 4),
    avoid: pickLine(coupleAvoidLines[scoreBand(result.scores.total)], seed, 5),
    energy,
  };
}

function buildCoupleCalendar(self: PersonState, partner: PersonState, dateKey: string, result: CompatibilityResult): CoupleCalendarDay[] {
  return Array.from({ length: 7 }, (_, index) => {
    const currentDateKey = addDaysToDateKey(dateKey, index);
    const seed = pairSeed(self, partner, currentDateKey, "calendar");
    const status = pickLine(coupleCalendarStatuses, seed + result.scores.total, 1);
    const advice = pickLine(coupleCalendarAdvice[status] ?? coupleCalendarAdvice["🌙 спокойный день"], seed, 2);
    return {
      dateKey: currentDateKey,
      date: formatShortDate(currentDateKey),
      weekday: formatWeekday(currentDateKey),
      status,
      advice,
    };
  });
}

function buildReconciliationDay(self: PersonState, partner: PersonState, dateKey: string, result: CompatibilityResult): ReconciliationDay {
  const seed = pairSeed(self, partner, dateKey, "reconciliation");
  const reconciliationScore = result.mapScores.find((item) => item.label.includes("Примирение"))?.value ?? result.scores.communication;
  return {
    status: buildReconciliationStatus(reconciliationScore, seed),
    approach: pickLine(reconciliationApproachLines[scoreBand(reconciliationScore)], seed, 1),
    avoid: pickLine(reconciliationAvoidLines[scoreBand(result.scores.total)], seed, 2),
    energy: buildDayEnergy(dateKey, `${pairKey(self, partner)}:reconciliation`),
  };
}

function buildPartnerMessage(self: PersonState, partner: PersonState, dateKey: string, tone: MessageTone, result: CompatibilityResult) {
  const seed = pairSeed(self, partner, dateKey, `message:${tone}:${result.scores.total}`);
  const partnerName = normalizeName(partner.name);
  const prefix = partnerName ? `${partnerName}, ` : "";
  return `${prefix}${pickLine(messageTemplates[tone], seed, 1)}`;
}

function buildNatalChart(person: PersonState): NatalChart | null {
  const parsed = parseBirthDate(person.birthDate);
  if (!parsed.ok) return null;
  const sign = findSign(parsed.signSlug);
  const traits = signTraits[sign.slug];
  const seed = hashString(`${sign.slug}:${parsed.iso}:${normalizeName(person.name)}`);
  const hasPreciseData = person.knowsTime && isValidTime(person.birthTime) && Boolean(getCityById(person.selectedCityId));

  return {
    sign,
    element: elementLabels[sign.element],
    modality: modalityLabels[traits.modality],
    polarity: polarityLabels[traits.polarity],
    archetype: pickLine(natalArchetypes[sign.slug], seed, 1),
    strengths: pickLine(natalStrengths[sign.element], seed, 2),
    growth: pickLine(natalGrowth[traits.modality], seed, 3),
    loveStyle: pickLine(natalLoveStyles[sign.element], seed, 4),
    communicationStyle: pickLine(natalCommunicationStyles[traits.polarity], seed, 5),
    precisionNote: hasPreciseData
      ? "Точность выше, потому что указаны время и город рождения. Асцендент и дома не рассчитываются в этой версии."
      : "Расчёт выполнен без точного времени рождения. Асцендент и дома могут быть приблизительными.",
  };
}

function pairSeed(self: PersonState, partner: PersonState, dateKey: string, scope: string) {
  return hashString(`${pairKey(self, partner)}:${dateKey}:${scope}`);
}

function pairKey(self: PersonState, partner: PersonState) {
  return [self.sign, partner.sign, normalizeName(self.name), normalizeName(partner.name)].join("|");
}

function buildReconciliationStatus(score: number, seed: number) {
  if (score >= 70) return "да";
  if (score >= 50) return variance(seed, 1, 2) === 0 ? "осторожно" : "да, но мягко";
  return "лучше позже";
}

function scoreBand(score: number): "strong" | "medium" | "tense" {
  if (score >= 70) return "strong";
  if (score >= 55) return "medium";
  return "tense";
}

function buildNameResonance(selfNameRaw: string, partnerNameRaw: string): NameResonance | null {
  const selfName = normalizeName(selfNameRaw);
  const partnerName = normalizeName(partnerNameRaw);
  if (!selfName || !partnerName) return null;

  const seed = hashString(`${selfName.toLocaleLowerCase("ru-RU")}|${partnerName.toLocaleLowerCase("ru-RU")}`);
  const communicationShift = variance(seed, 1, 9) - 4;
  const loveShift = communicationShift === 0 ? Math.max(1, variance(seed, 2, 9) - 4) : variance(seed, 2, 9) - 4;
  const tone = communicationShift + loveShift >= 3 ? "warm" : communicationShift + loveShift <= -3 ? "careful" : "balanced";
  const texts = nameResonanceLines[tone];
  const advice = nameResonanceAdvice[tone];

  return {
    text: pickLine(texts, seed, 3),
    adviceText: pickLine(advice, seed, 4),
    communicationShift,
    loveShift,
  };
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
  return Math.max(28, Math.min(98, value));
}

function compatibilityLevelLabel(score: number) {
  if (score >= 85) return "сильная совместимость";
  if (score >= 70) return "хорошая совместимость";
  if (score >= 55) return "средняя совместимость";
  if (score >= 40) return "сложная совместимость";
  return "напряжённая совместимость";
}

function pickLine(items: string[], seed: number, offset: number) {
  return items[variance(seed, offset, items.length)];
}

function buildConclusion(score: number, mode: Mode, relationshipMode: RelationshipMode) {
  const modeLabel = relationshipModes.find((item) => item.id === relationshipMode)?.label ?? "отношения";
  const precision = mode === "precise" ? "Расчёт остаётся подсказкой: время и город повышают точность, но не заменяют живой разговор." : "Это мягкий ориентир для разговора.";

  if (score >= 85) return `${modeLabel}: сильная совместимость. ${precision} Берегите доверие и не забывайте о границах.`;
  if (score >= 70) return `${modeLabel}: хорошая совместимость. ${precision} Лучший результат даст спокойный диалог и уважение к разному темпу.`;
  if (score >= 55) return `${modeLabel}: средняя совместимость. ${precision} Есть ресурс, но важны границы, честные просьбы и внимание к бытовым мелочам.`;
  if (score >= 40) return `${modeLabel}: сложная совместимость. ${precision} Потребуется больше терпения, меньше резких выводов и регулярный честный разговор.`;
  return `${modeLabel}: напряжённая совместимость. ${precision} Есть риск недопонимания, поэтому особенно важны мягкий тон, паузы и ясные договорённости.`;
}

const dailyGuidanceByElement: Record<string, { advice: string[]; action: string[]; avoid: string[] }> = {
  fire: {
    advice: [
      "двигайтесь смело, но оставьте место для паузы и мягкого тона",
      "инициатива сработает лучше, если вы заранее выберете один главный фокус",
      "сегодня важнее направить энергию, чем доказывать свою правоту",
    ],
    action: [
      "закрыть дело, которое давно просит решительного шага",
      "предложить идею, встречу или разговор без лишнего давления",
      "заняться задачей, где нужен быстрый старт и ясное решение",
    ],
    avoid: [
      "резких слов, поспешных покупок и обещаний на эмоциях",
      "соревнования там, где лучше договориться",
      "попытки ускорить людей, которым нужен другой темп",
    ],
  },
  earth: {
    advice: [
      "опирайтесь на факты и выбирайте спокойный, устойчивый темп",
      "сегодня лучше укреплять основу, чем начинать всё заново",
      "практичный шаг даст больше, чем длинные размышления",
    ],
    action: [
      "разобрать деньги, документы, порядок дома или рабочий список",
      "зафиксировать договорённость и убрать один лишний риск",
      "вернуться к задаче, где нужна аккуратность и терпение",
    ],
    avoid: [
      "упрямства в простом разговоре и покупок ради настроения",
      "затягивания решения только из-за привычки",
      "критики себя за то, что ещё можно спокойно поправить",
    ],
  },
  air: {
    advice: [
      "говорите короче и точнее: ясность сегодня притягивает нужных людей",
      "одна хорошая мысль станет сильнее, если сразу дать ей форму",
      "выбирайте лёгкий диалог без лишних обещаний",
    ],
    action: [
      "написать, уточнить, договориться или разобрать сообщения",
      "собрать идеи в список и выбрать одну для действия",
      "обновить план встречи, звонка или небольшого проекта",
    ],
    avoid: [
      "суеты, параллельных обещаний и спорных формулировок",
      "информационного шума, который сбивает с главного",
      "разговора ради разговора, если уже пора сделать шаг",
    ],
  },
  water: {
    advice: [
      "берегите внутреннее спокойствие и не принимайте чужой тон слишком близко",
      "интуиция поможет, если рядом есть простой план",
      "мягкость сегодня сильнее, когда у неё есть границы",
    ],
    action: [
      "поговорить с близким человеком спокойно и честно",
      "закрыть тонкий вопрос без давления и драматичных выводов",
      "уделить внимание дому, отдыху или эмоциональной опоре",
    ],
    avoid: [
      "молчаливых обид и решений из тревоги",
      "возвращения к старым переживаниям без новой причины",
      "чужих эмоций, которые забирают слишком много сил",
    ],
  },
};

const dailyForecastLines = [
  "день подходит для аккуратного выбора и одного уверенного действия. Не распыляйтесь, и нужная дверь откроется спокойнее.",
  "события могут идти волнами, поэтому держите фокус на главном и не торопитесь с окончательными выводами.",
  "хорошо работают честные разговоры, маленькие шаги и внимание к деталям, которые раньше ускользали.",
  "день мягко подталкивает к обновлению планов. Больше пользы принесёт простое решение, а не попытка всё контролировать.",
  "лучше выбирать то, что укрепляет отношения, здоровье и внутреннюю устойчивость. Спешка сегодня не главный союзник.",
];

const weeklyGuidanceByElement: Record<string, { theme: string[]; love: string[]; money: string[]; energy: string[]; advice: string[] }> = {
  fire: {
    theme: [
      "смелый шаг без лишнего давления",
      "выбор главной цели и честный разговор о желаниях",
      "новый импульс, который важно направить в одно дело",
    ],
    love: [
      "тепло растёт через внимание, комплименты и готовность слушать",
      "меньше борьбы за лидерство, больше игры и уважения",
      "романтика оживает, если не торопить ответ партнёра",
    ],
    money: [
      "подходят быстрые, но просчитанные решения",
      "лучше закрывать короткие задачи и не спорить из-за мелочей",
      "новая идея полезна, если у неё есть понятный срок",
    ],
    energy: [
      "высокая, но требует пауз, сна и бережного режима",
      "поднимается через движение и ясный план",
      "нестабильна при спешке, зато сильна в коротких рывках",
    ],
    advice: [
      "не доказывайте силу, покажите зрелость",
      "выберите один главный огонь и не распаляйте всё вокруг",
      "делайте первый шаг, но оставляйте людям право на свой темп",
    ],
  },
  earth: {
    theme: [
      "устойчивость, порядок и возвращение контроля",
      "практичные решения вместо эмоциональной спешки",
      "укрепление того, что уже приносит пользу",
    ],
    love: [
      "нежность лучше выражать делом, заботой и надёжностью",
      "разговоры о быте и планах могут сблизить сильнее романтики",
      "важно не превращать заботу в контроль",
    ],
    money: [
      "хорошая неделя для бюджета, документов и ясных договорённостей",
      "осторожные шаги принесут больше, чем рискованные покупки",
      "можно укрепить доход через дисциплину и проверку деталей",
    ],
    energy: [
      "ровная, если не брать на себя лишнюю ответственность",
      "растёт от режима, чистого пространства и понятного списка",
      "просит тишины, сна и меньшего количества раздражителей",
    ],
    advice: [
      "не держитесь за старую схему, если новая уже надёжнее",
      "оставьте место для гибкости и тёплого разговора",
      "сначала база, потом большие решения",
    ],
  },
  air: {
    theme: [
      "общение, идеи и точные формулировки",
      "новые контакты, которые стоит сразу переводить в действие",
      "лёгкость, если убрать лишний шум",
    ],
    love: [
      "сближает честная переписка, разговор или совместная идея",
      "лучше говорить прямо, не проверяя чувства намёками",
      "романтика приходит через интерес и чувство свободы",
    ],
    money: [
      "подходят переговоры, заявки, письма и маленькие сделки",
      "важно считать ресурсы, а не только вдохновляться возможностями",
      "полезно обновить план и убрать задачи без результата",
    ],
    energy: [
      "быстрая, но может распыляться",
      "зависит от качества информации и спокойного режима",
      "становится выше, когда в расписании меньше хаоса",
    ],
    advice: [
      "сначала ясность, потом обещания",
      "оставьте в неделе место для тишины и одного глубокого дела",
      "не отвечайте сразу, если хочется спорить",
    ],
  },
  water: {
    theme: [
      "эмоциональная ясность и мягкое восстановление",
      "границы, близость и честность без драматичных выводов",
      "интуиция, которую стоит подкрепить фактами",
    ],
    love: [
      "бережный разговор может снять старое напряжение",
      "тепло растёт через поддержку, а не через проверки",
      "лучше говорить о чувствах простыми словами",
    ],
    money: [
      "не принимайте финансовые решения из тревоги",
      "полезно разобрать расходы и убрать лишнюю неопределённость",
      "работа идёт легче, если есть спокойная атмосфера",
    ],
    energy: [
      "мягкая, чувствительная к окружению",
      "восстанавливается через сон, воду, дом и паузы",
      "просит меньше чужих проблем и больше личного пространства",
    ],
    advice: [
      "не угадывайте за других, спросите прямо",
      "оставьте прошлое там, где оно не помогает сегодняшнему выбору",
      "доверяйте ощущениям, но проверяйте важные детали",
    ],
  },
};

const luckyStatuses = ["🍀 удачный день", "⚖️ нейтральный день", "⚠️ осторожнее"];
const luckyAreas = ["любовь", "деньги", "дела", "отдых", "разговоры", "покупки", "документы"];

const signTraits: Record<string, { modality: "cardinal" | "fixed" | "mutable"; polarity: "active" | "receptive" }> = {
  aries: { modality: "cardinal", polarity: "active" },
  taurus: { modality: "fixed", polarity: "receptive" },
  gemini: { modality: "mutable", polarity: "active" },
  cancer: { modality: "cardinal", polarity: "receptive" },
  leo: { modality: "fixed", polarity: "active" },
  virgo: { modality: "mutable", polarity: "receptive" },
  libra: { modality: "cardinal", polarity: "active" },
  scorpio: { modality: "fixed", polarity: "receptive" },
  sagittarius: { modality: "mutable", polarity: "active" },
  capricorn: { modality: "cardinal", polarity: "receptive" },
  aquarius: { modality: "fixed", polarity: "active" },
  pisces: { modality: "mutable", polarity: "receptive" },
};

const elementLabels: Record<string, string> = {
  fire: "огонь",
  earth: "земля",
  air: "воздух",
  water: "вода",
};

const modalityLabels: Record<string, string> = {
  cardinal: "инициатор",
  fixed: "устойчивый ритм",
  mutable: "гибкость",
};

const polarityLabels: Record<string, string> = {
  active: "внешний фокус",
  receptive: "внутренняя опора",
};

const signDailyProfiles: Record<string, { openers: string[]; focus: string[] }> = {
  aries: {
    openers: ["импульс дня просит смелого, но короткого шага", "сегодня важна инициатива без давления", "энергия включается через честное действие"],
    focus: ["Держите темп, но не превращайте разговор в соревнование.", "Лучше один точный старт, чем пять обещаний.", "Мягкий тон усилит вашу уверенность."],
  },
  taurus: {
    openers: ["день поддерживает устойчивость и заботу о базе", "лучше выбирать надёжное, а не шумное", "практичный шаг вернёт ощущение контроля"],
    focus: ["Деньги, тело и быт требуют спокойного внимания.", "Не спорьте из упрямства, если можно договориться проще.", "Красота простых решений сегодня особенно заметна."],
  },
  gemini: {
    openers: ["день раскрывается через ясные слова и быстрые уточнения", "новая мысль может стать полезной договорённостью", "общение работает лучше, если убрать лишний шум"],
    focus: ["Пишите короче, слушайте внимательнее.", "Не обещайте больше, чем готовы сделать.", "Одна точная фраза снимет больше напряжения, чем длинное объяснение."],
  },
  cancer: {
    openers: ["день просит беречь чувства и не копить молчание", "дом, близкие и внутренний ритм становятся главной опорой", "мягкость сегодня сильна, если рядом есть границы"],
    focus: ["Скажите о важном спокойно и без намёков.", "Не принимайте чужую усталость на свой счёт.", "Поддержка начинается с честного вопроса."],
  },
  leo: {
    openers: ["день помогает проявиться, если не давить на внимание", "тепло и достоинство работают лучше громких жестов", "ваша щедрость заметна, когда в ней нет ожидания ответа"],
    focus: ["Похвала и уважение откроют нужную дверь.", "Не спорьте за центр сцены.", "Покажите результат, а не только намерение."],
  },
  virgo: {
    openers: ["день подходит для точности, порядка и аккуратного выбора", "детали сегодня помогают увидеть реальную картину", "спокойная настройка процессов даст быстрый эффект"],
    focus: ["Не превращайте заботу в критику.", "Список дел лучше сократить до главного.", "Тёплая формулировка сделает просьбу сильнее."],
  },
  libra: {
    openers: ["день зовёт к балансу, но не к удобному молчанию", "важно выбрать честную гармонию, а не красивую уступку", "отношения выигрывают от ясной договорённости"],
    focus: ["Говорите прямо, но оставляйте место для другого мнения.", "Не соглашайтесь только ради спокойствия.", "Красивый жест сработает, если за ним есть смысл."],
  },
  scorpio: {
    openers: ["день усиливает глубину и просит честности без давления", "скрытое напряжение лучше назвать мягко", "интуиция работает, если не подменять её подозрением"],
    focus: ["Не проверяйте чувства молчанием.", "Границы сегодня важнее контроля.", "Откровенность будет сильнее резких выводов."],
  },
  sagittarius: {
    openers: ["день расширяет горизонт, но просит не разбрасываться", "свобода станет полезной, если есть понятный маршрут", "идея оживает через действие и честный разговор"],
    focus: ["Обещайте меньше, делайте яснее.", "Не уходите от деталей, если они держат доверие.", "Разговор о будущем лучше связать с конкретным шагом."],
  },
  capricorn: {
    openers: ["день поддерживает зрелые решения и спокойную ответственность", "структура вернёт уверенность и снизит суету", "лучше укреплять основу, чем спорить о форме"],
    focus: ["Не берите всё на себя молча.", "Чёткий план поможет и в делах, и в отношениях.", "Тепло можно показать поступком, но слова тоже важны."],
  },
  aquarius: {
    openers: ["день поднимает свежие идеи и просит уважать дистанцию", "нестандартный взгляд поможет, если не спорить ради свободы", "общение оживает через честность и лёгкость"],
    focus: ["Дайте людям понять ваш замысел простыми словами.", "Не исчезайте из диалога без объяснения.", "Совместная идея может стать точкой сближения."],
  },
  pisces: {
    openers: ["день тонкий и мягкий, поэтому особенно важны границы", "интуиция подсказывает верно, если рядом есть факт", "эмпатия сегодня сильна, когда вы не растворяетесь в чужом настроении"],
    focus: ["Не додумывайте за партнёра.", "Пауза поможет услышать себя.", "Мягкая просьба будет лучше долгого ожидания."],
  },
};

const signWeeklyProfiles: Record<string, { theme: string[] }> = Object.fromEntries(
  signs.map((sign) => [
    sign.slug,
    {
      theme: [
        `${sign.name}: главный акцент недели`,
        `${sign.name}: что стоит настроить в ближайшие дни`,
        `${sign.name}: где появится точка роста`,
      ],
    },
  ]),
) as Record<string, { theme: string[] }>;

const signLuckyProfiles: Record<string, string[]> = Object.fromEntries(
  signs.map((sign) => [
    sign.slug,
    [
      `${sign.name} выигрывает через спокойный выбор времени`,
      `${sign.name} стоит выбирать шаг без лишнего давления`,
      `${sign.name} полезно заранее проговорить ожидания`,
    ],
  ]),
) as Record<string, string[]>;

const dayEnergyTypes = ["мягкая волна", "ясный фокус", "живой диалог", "тихое восстановление", "смелый импульс", "день настройки"];
const dayEnergyBestFor = ["коротких договорённостей", "заботы о себе и близких", "планов без спешки", "честного разговора", "маленького шага к примирению", "встречи без давления"];
const dayEnergyAvoid = ["резких выводов", "разговора на повышенном тоне", "обещаний из эмоций", "молчаливых проверок", "спора ради правоты", "попытки решить всё сразу"];
const dayEnergyMoods = ["спокойное любопытство", "чуткость", "собранность", "лёгкая романтика", "бережная честность"];
const dayEnergyRelationshipTone = ["говорить проще и теплее", "сначала услышать, потом отвечать", "оставить место для паузы", "не давить на быстрый ответ", "поддержать делом и мягким словом"];

const nameResonanceLines: Record<string, string[]> = {
  warm: [
    "Ваши имена усиливают ощущение интереса и живого общения. Важно не спорить за лидерство, а поддерживать лёгкость и уважение.",
    "В именах чувствуется тёплый ритм: он помогает быстрее находить общий тон и мягче выходить из недопониманий.",
    "Именной отклик добавляет паре больше доверия и желания слышать друг друга без лишних проверок.",
  ],
  balanced: [
    "Ваши имена дают спокойный отклик: многое зависит не от первого впечатления, а от ясных слов и регулярной заботы.",
    "Именной резонанс здесь ровный. Он помогает общению, если оба говорят прямо и не копят маленькие обиды.",
    "В именах есть разный темп, но он может дополнять пару, если не торопить события и не сравнивать чувства.",
  ],
  careful: [
    "Ваши имена могут создавать разный темп в общении. Это не мешает близости, если заранее беречь тон и не давить на ответ.",
    "Именной отклик просит больше мягкости: меньше резких выводов, больше простых вопросов и спокойных объяснений.",
    "В именах есть напряжение характеров, которое можно превратить в интерес, если не спорить из-за мелочей.",
  ],
};

const nameResonanceAdvice: Record<string, string[]> = {
  warm: [
    "Добавьте больше живого диалога: этой паре полезны лёгкие вопросы, юмор и благодарность.",
    "Поддерживайте тепло маленькими знаками внимания, не превращая близость в соревнование.",
  ],
  balanced: [
    "Помогут ясные просьбы и привычка проговаривать ожидания до того, как накопится усталость.",
    "Не угадывайте настроение партнёра: лучше выбрать спокойный прямой разговор.",
  ],
  careful: [
    "Снижайте резкость в переписке и проверяйте, правильно ли поняли друг друга.",
    "Не торопите признания и решения: этой паре особенно важен безопасный тон.",
  ],
};

const attractionLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: [
    "искры достаточно, чтобы поддерживать интерес без лишнего давления",
    "притяжение заметное, особенно если оба сохраняют уважение к свободе",
    "интерес легко оживить через игру, внимание и честные комплименты",
  ],
  medium: [
    "притяжение есть, но ему нужен спокойный темп и меньше проверок",
    "искра появляется волнами: помогает тёплая инициатива без ожиданий",
    "интерес держится на любопытстве, но резкость быстро снижает тепло",
  ],
  tense: [
    "притяжение может смешиваться с раздражением, поэтому важны паузы",
    "искра есть, но её легко погасить давлением или соревнованием",
    "интересу нужна безопасность: меньше резких выводов, больше уважения к границам",
  ],
};

const communicationLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: [
    "диалог получается живым, если говорить прямо и слушать до конца",
    "пара хорошо раскрывается через ясные просьбы и короткие договорённости",
    "общение может стать сильной опорой, когда нет намёков и проверок",
  ],
  medium: [
    "разговор возможен, но важно не додумывать мотивы друг друга",
    "есть риск недопонимания, если говорить слишком быстро или слишком резко",
    "диалогу помогает простая структура: факт, чувство, просьба",
  ],
  tense: [
    "общение требует терпения: слова могут восприниматься острее, чем задумано",
    "есть риск недопонимания, поэтому важны границы и спокойные вопросы",
    "лучше обсуждать одну тему за раз и не требовать мгновенной реакции",
  ],
};

const loveLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: [
    "тепло растёт через регулярные знаки внимания и доверие",
    "романтика раскрывается, когда рядом есть уважение и свобода",
    "чувства легче укреплять через заботу, благодарность и мягкую инициативу",
  ],
  medium: [
    "чувствам нужна ясность: меньше догадок, больше прямого тепла",
    "близость может расти, если не сравнивать темпы и ожидания",
    "романтика становится устойчивее через маленькие повторяемые жесты",
  ],
  tense: [
    "в любви возможны качели, если копить обиды или проверять чувства",
    "чувствам нужны границы и честный разговор без давления",
    "тепло лучше возвращать маленькими шагами, не требуя быстрых обещаний",
  ],
};

const householdLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: [
    "общий ритм можно выстроить через понятные правила и заботу",
    "быт легче, когда обязанности проговорены заранее",
    "домашние вопросы становятся точкой опоры, если не копить мелкие претензии",
  ],
  medium: [
    "ритм пары требует настройки: привычки могут отличаться сильнее, чем кажется",
    "быт лучше обсуждать фактами, а не намёками",
    "помогают списки, ясные зоны ответственности и право на отдых",
  ],
  tense: [
    "домашний ритм может стать источником споров, если молчать о нагрузке",
    "важно разделить ответственность и не ждать, что партнёр сам догадается",
    "быт потребует больше терпения, честных правил и бережного тона",
  ],
};

const weakSpotLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: [
    "даже сильной паре вредят молчаливые ожидания и спешка в выводах",
    "главный риск — принять привычное тепло за само собой разумеющееся",
    "не стоит спорить за лидерство там, где помогает партнёрство",
  ],
  medium: [
    "разный темп решений может восприниматься как равнодушие",
    "молчаливые ожидания быстро превращаются в напряжение",
    "попытка переделать партнёра снижает доверие",
  ],
  tense: [
    "есть риск недопонимания, если оба защищаются вместо разговора",
    "резкие слова могут закрыть диалог быстрее, чем кажется",
    "важны границы: без них напряжение будет возвращаться по кругу",
  ],
};

const adviceLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: [
    "выберите один общий фокус на ближайшие дни и укрепите то, что уже работает",
    "добавьте больше благодарности и не откладывайте простые тёплые слова",
    "поддерживайте баланс между инициативой и личным пространством",
  ],
  medium: [
    "проговорите ожидания простыми словами и не превращайте разговор в экзамен",
    "сравнивайте не только знаки, но и реальные привычки: отдых, спор, просьбы о поддержке",
    "сначала договоритесь о тоне, потом обсуждайте сложную тему",
  ],
  tense: [
    "нужен честный разговор, но лучше начать с короткой мягкой фразы",
    "потребуется больше терпения: не решайте всё одним разговором",
    "важны границы, паузы и отказ от резких обвинений",
  ],
};

const relationshipModeAdvice: Record<RelationshipMode, string[]> = {
  love: ["для любви сейчас важнее тепло, чем проверка чувств", "романтика растёт через простые знаки внимания"],
  friendship: ["для дружбы важны надёжность и честное присутствие", "не обесценивайте поддержку, даже если она выглядит простой"],
  work: ["в рабочих делах фиксируйте договорённости письменно", "разделите роли, чтобы не спорить о мелочах"],
  family: ["для быта помогает ясный режим и честное распределение нагрузки", "забота не должна превращаться в контроль"],
  passion: ["для страсти важна игра без давления и ревности", "не подменяйте близость соревнованием"],
  reconciliation: ["для примирения начните с признания чувства, а не с доказательств", "мягкий тон сейчас важнее идеальной формулировки"],
};

const strengthLines = [
  "это можно развивать через маленькие повторяемые жесты",
  "эта зона станет опорой, если не ждать угадывания",
  "здесь паре полезно чаще замечать хорошее",
];

const coupleRelationshipLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: ["сегодня можно укрепить близость через внимание и спокойную инициативу", "подходит день для тёплого жеста и честного разговора"],
  medium: ["отношениям поможет мягкая ясность: меньше намёков, больше простых слов", "лучше не проверять чувства, а прямо сказать о потребности"],
  tense: ["сегодня важно не давить на ответ и не спорить за правоту", "если есть напряжение, начните с паузы и короткой спокойной фразы"],
};

const coupleTalkLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: ["разговор может быстро стать ближе, если слушать без перебивания", "хорошо обсуждать планы и желания без скрытых проверок"],
  medium: ["говорите по одной теме за раз и уточняйте смысл", "диалогу поможет формула: факт, чувство, просьба"],
  tense: ["лучше избегать длинных переписок на эмоциях", "важны паузы и фразы без обвинений"],
};

const coupleDateLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: ["подойдёт встреча с лёгкой романтикой и живым разговором", "хороший день для свидания без сложных тем"],
  medium: ["лучше выбрать спокойный формат без спешки и ожиданий", "подойдёт короткая встреча, если заранее договориться о настроении"],
  tense: ["свидание лучше делать тихим и коротким, без выяснения отношений", "если есть напряжение, начните с простой прогулки или перенесите встречу"],
};

const coupleReconciliationLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: ["подойдёт мягкий шаг навстречу", "можно начать с признания своей части напряжения"],
  medium: ["лучше идти осторожно и не требовать быстрых обещаний", "подойдёт короткое сообщение без давления"],
  tense: ["сначала снизьте тон и выберите спокойное время", "лучше позже, если разговор сейчас легко сорвётся в спор"],
};

const coupleActionLines = ["предложить небольшой общий план", "сказать спасибо за конкретный поступок", "выбрать спокойный формат разговора", "сделать один тёплый жест без ожидания ответа"];
const coupleAvoidLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: ["не принимать тепло как должное", "не спорить из-за мелкой формы"],
  medium: ["не копить ожидания молча", "не проверять партнёра намёками"],
  tense: ["не начинать разговор с обвинения", "не требовать немедленного решения"],
};

const coupleCalendarStatuses = ["❤️ день для любви", "💬 день для разговора", "🕊 день для примирения", "⚠️ осторожнее", "🌙 спокойный день"];
const coupleCalendarAdvice: Record<string, string[]> = {
  "❤️ день для любви": ["подойдёт тёплая встреча или маленький знак внимания", "лучше говорить о приятном и укреплять доверие"],
  "💬 день для разговора": ["обсудите одну тему и заранее договоритесь о спокойном тоне", "подойдёт честная переписка без проверок"],
  "🕊 день для примирения": ["начните с мягкой фразы и не требуйте ответа сразу", "лучше признать чувство, а не спорить о деталях"],
  "⚠️ осторожнее": ["сегодня легко обострить мелочь, поэтому важны паузы", "сложные темы лучше сократить до одного вопроса"],
  "🌙 спокойный день": ["подойдёт тихая поддержка без больших решений", "лучше восстановить силы и не торопить события"],
};

const reconciliationApproachLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: ["напишите коротко и тепло: начните с желания понять, а не доказать", "подойдите спокойно и назовите, что именно хотите исправить"],
  medium: ["лучше начать с мягкой просьбы о разговоре и дать время на ответ", "скажите о своём чувстве без обвинения и предложите маленький шаг"],
  tense: ["сначала выдержите паузу и выберите нейтральное время", "лучше написать очень коротко, без спора и давления"],
};

const reconciliationAvoidLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: ["не превращайте примирение в длинный разбор прошлого", "не проверяйте, кто первым сделает шаг"],
  medium: ["избегайте сарказма и слов «всегда» или «никогда»", "не смешивайте одну обиду со всеми старыми темами"],
  tense: ["не требуйте немедленного ответа", "не начинайте с обвинений и ультиматумов"],
};

const messageTones: Array<{ id: MessageTone; label: string }> = [
  { id: "soft", label: "мягко" },
  { id: "romantic", label: "романтично" },
  { id: "afterFight", label: "после ссоры" },
  { id: "longSilence", label: "давно не общались" },
  { id: "invite", label: "пригласить" },
  { id: "reconciliation", label: "для примирения" },
];

const messageTemplates: Record<MessageTone, string[]> = {
  soft: ["хочу спокойно поговорить и лучше понять тебя. Давай без спешки и без давления.", "мне важно сохранить тепло между нами. Напиши, когда тебе будет удобно поговорить."],
  romantic: ["я сегодня поймал(а) себя на мысли, что мне хочется быть к тебе ближе. Давай устроим спокойный вечер?", "мне приятно думать о нас. Хочу добавить в день немного тепла и увидеться, если ты тоже хочешь."],
  afterFight: ["я не хочу продолжать спор. Мне важно понять тебя и спокойно объяснить свою сторону.", "давай попробуем вернуться к разговору мягче. Я готов(а) слушать и не давить."],
  longSilence: ["давно не общались, но я хочу написать бережно. Как ты? Если будет желание, я буду рад(а) поговорить.", "не хочу врываться в твоё пространство, просто хочу узнать, как ты себя чувствуешь."],
  invite: ["хочу увидеться без суеты. Давай выберем время для прогулки или спокойного кофе?", "если тебе откликается, давай встретимся и просто побудем рядом без лишних ожиданий."],
  reconciliation: ["мне жаль, что между нами появилось напряжение. Я хочу поговорить спокойно и с уважением к тебе.", "я хочу сделать шаг навстречу. Давай начнём с честного разговора без обвинений."],
};

const natalArchetypes: Record<string, string[]> = Object.fromEntries(
  signs.map((sign) => [
    sign.slug,
    [
      `${sign.name} ищет свой способ проявлять силу мягко и честно`,
      `${sign.name} раскрывается, когда рядом есть смысл, доверие и личный темп`,
      `${sign.name} лучше всего растёт через осознанный выбор, а не через давление`,
    ],
  ]),
) as Record<string, string[]>;

const natalStrengths: Record<string, string[]> = {
  fire: ["инициатива, смелость и способность зажигать других", "быстрый старт, честность и живое вдохновение"],
  earth: ["надёжность, практичность и умение доводить до результата", "терпение, вкус к качеству и уважение к реальности"],
  air: ["ясное мышление, любопытство и способность договариваться", "идеи, лёгкость контакта и умение видеть варианты"],
  water: ["эмпатия, глубина и тонкое чувство атмосферы", "забота, интуиция и способность создавать эмоциональную опору"],
};

const natalGrowth: Record<string, string[]> = {
  cardinal: ["не брать на себя всё сразу и оставлять другим право на свой темп", "учиться начинать без давления и завершать без спешки"],
  fixed: ["мягче отпускать старые схемы, если они перестали помогать", "оставлять место для гибкости и нового взгляда"],
  mutable: ["не распыляться и чаще выбирать один главный фокус", "переводить идеи и чувства в понятные действия"],
};

const natalLoveStyles: Record<string, string[]> = {
  fire: ["в любви важны искра, честность и ощущение живого выбора", "тепло проявляется через инициативу и прямоту"],
  earth: ["любовь крепнет через надёжность, заботу и простые регулярные поступки", "важны стабильность, телесное тепло и доверие"],
  air: ["любовь начинается с интереса, диалога и свободы быть собой", "важны разговор, чувство лёгкости и уважение к пространству"],
  water: ["любовь раскрывается через безопасность, нежность и эмоциональную честность", "важны поддержка, тишина и бережный контакт"],
};

const natalCommunicationStyles: Record<string, string[]> = {
  active: ["лучше говорить прямо, но проверять, не звучит ли это слишком резко", "важно оставлять место для ответа и не ускорять собеседника"],
  receptive: ["лучше не ждать, что другие сами догадаются о чувствах", "важно называть потребность простыми словами и держать границы"],
};
