"use client";

import cityCatalogData from "@/data/config/zodiac-city-catalog.json";
import { ArrowLeft, ArrowRight, CalendarDays, Crown, Gift, HeartHandshake, Lock, MapPin, RotateCcw, ShieldCheck, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

type Mode = "fast" | "personal" | "precise";
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
  const todayIso = useMemo(() => getTodayIso(), []);
  const [selectedSignSlug, setSelectedSignSlug] = useState("");
  const [activeTab, setActiveTab] = useState<HubTab>("today");
  const [mode, setMode] = useState<Mode>(resolvedMode);
  const [step, setStep] = useState<WizardStep>(1);
  const [self, setSelf] = useState<PersonState>(() => createInitialPerson("", "unspecified", false, ""));
  const [partner, setPartner] = useState<PersonState>(() => createInitialPerson("", "unspecified", false, ""));

  const result = useMemo(() => buildCompatibilityResult(mode, self, partner), [mode, partner, self]);
  const selectedSign = selectedSignSlug ? findSign(selectedSignSlug) : null;
  const stepTitle = step === 1 ? "Вы" : step === 2 ? "Партнёр" : "Результат";

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
                Выберите знак и откройте прогнозы, совместимость и удачные дни
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
              {activeTab === "today" ? <TodaySection publicMode={publicMode} sign={selectedSign} dateIso={todayIso} /> : null}
              {activeTab === "week" ? <WeekSection publicMode={publicMode} sign={selectedSign} dateIso={todayIso} /> : null}
              {activeTab === "lucky" ? <LuckyDaysSection publicMode={publicMode} sign={selectedSign} dateIso={todayIso} /> : null}
              {activeTab === "more" ? <MoreSection publicMode={publicMode} /> : null}
              {activeTab === "compatibility" ? (
                <div className="space-y-4">
                  <StepProgress publicMode={publicMode} step={step} />
                  <ModeSelector publicMode={publicMode} mode={mode} onChange={setMode} />
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

function TodaySection({ publicMode, sign, dateIso }: { publicMode: boolean; sign: ZodiacSign; dateIso: string }) {
  const forecast = buildDailyForecast(sign, dateIso);

  return (
    <section className={panelClass(publicMode)}>
      <SectionHeader publicMode={publicMode} icon={<Sparkles className="h-5 w-5" />} title="Сегодня" subtitle={`${sign.emoji} ${sign.name} · ${formatHumanDate(dateIso)}`} />

      <div className="mt-5 space-y-3">
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

function WeekSection({ publicMode, sign, dateIso }: { publicMode: boolean; sign: ZodiacSign; dateIso: string }) {
  const forecast = buildWeekForecast(sign, dateIso);

  return (
    <section className={panelClass(publicMode)}>
      <SectionHeader publicMode={publicMode} icon={<Star className="h-5 w-5" />} title="Неделя" subtitle={`${sign.emoji} ${sign.name}`} />

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

function LuckyDaysSection({ publicMode, sign, dateIso }: { publicMode: boolean; sign: ZodiacSign; dateIso: string }) {
  const days = buildLuckyDays(sign, dateIso, 7);

  return (
    <section className={panelClass(publicMode)}>
      <SectionHeader publicMode={publicMode} icon={<CalendarDays className="h-5 w-5" />} title="Удачные дни" subtitle={`${sign.emoji} ${sign.name} · ближайшие 7 дней`} />

      <div className="mt-5 grid max-h-[520px] gap-3 overflow-y-auto pr-1">
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

function MoreSection({ publicMode }: { publicMode: boolean }) {
  return (
    <section className={panelClass(publicMode)}>
      <SectionHeader publicMode={publicMode} icon={<Crown className="h-5 w-5" />} title="Ещё" subtitle="Новые разделы появятся позже" />
      <div className="mt-5 space-y-4">
        <LockedPreviewCard
          publicMode={publicMode}
          icon={<Crown className="h-5 w-5" />}
          title="👑 VIP скоро"
          text="Расширенные персональные прогнозы появятся позже."
          items={[
            "личный прогноз на месяц",
            "расширенная совместимость",
            "точный календарь удачных дней",
            "персональные советы",
            "больше деталей по любви, деньгам и решениям",
          ]}
        />
        <LockedPreviewCard
          publicMode={publicMode}
          icon={<Gift className="h-5 w-5" />}
          title="🎁 Розыгрыши скоро"
          text="Позже здесь появятся задания, бонусы и призы для подписчиков."
          items={[
            "участие через Mini App",
            "призы для подписчиков",
            "задания и бонусы",
            "активности по каналам",
          ]}
        />
      </div>
    </section>
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
  const namePlaceholder = isSelfPanel ? "например, Владислав" : "например, Анна";

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
  nameResonance: NameResonance | null;
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
  const nameResonance = buildNameResonance(self.name, partner.name);
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
  const nameTotalShift = nameResonance ? Math.round((nameResonance.communicationShift + nameResonance.loveShift) / 4) : 0;
  const total = clampScore(base + modeBoost + variance(seed, 0, 15) - 7 + nameTotalShift);
  const scores = {
    total,
    attraction: clampScore(total + variance(seed, 1, 17) - 8),
    communication: clampScore(total + variance(seed, 2, 19) - 9 + (nameResonance?.communicationShift ?? 0)),
    love: clampScore(total + variance(seed, 3, 21) - 10 + (nameResonance?.loveShift ?? 0)),
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
    adviceText: nameResonance ? `${pickLine(adviceLines, seed, 6)}. ${nameResonance.adviceText}` : pickLine(adviceLines, seed, 6),
    conclusionText: buildConclusion(total, mode),
    nameResonance,
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

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

function getDateOrdinal(dateIso: string) {
  const date = parseIsoDate(dateIso);
  return Math.floor(date.getTime() / 86400000);
}

function parseIsoDate(dateIso: string) {
  const [year, month, day] = dateIso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(dateIso: string, days: number) {
  const date = parseIsoDate(dateIso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatHumanDate(dateIso: string) {
  return parseIsoDate(dateIso).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function formatShortDate(dateIso: string) {
  return parseIsoDate(dateIso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

function formatWeekday(dateIso: string) {
  return parseIsoDate(dateIso).toLocaleDateString("ru-RU", { weekday: "long" });
}

function getWeekKey(dateIso: string) {
  const date = parseIsoDate(dateIso);
  const year = date.getUTCFullYear();
  const firstDay = Date.UTC(year, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - firstDay) / 86400000) + 1;
  return `${year}-${Math.ceil(dayOfYear / 7)}`;
}

function pickByKey(items: string[], key: string, offset: number) {
  return items[variance(hashString(key), offset, items.length)];
}

function buildDailyForecast(sign: ZodiacSign, dateIso: string) {
  const key = `${sign.slug}:${dateIso}:today`;
  const elementSet = dailyGuidanceByElement[sign.element] ?? dailyGuidanceByElement.fire;
  return {
    advice: pickByKey(elementSet.advice, key, 1),
    action: pickByKey(elementSet.action, key, 2),
    avoid: pickByKey(elementSet.avoid, key, 3),
    text: `${sign.name}: ${pickByKey(dailyForecastLines, key, 4)}`,
  };
}

function buildWeekForecast(sign: ZodiacSign, dateIso: string) {
  const key = `${sign.slug}:${getWeekKey(dateIso)}:week`;
  const elementSet = weeklyGuidanceByElement[sign.element] ?? weeklyGuidanceByElement.fire;
  return {
    theme: pickByKey(elementSet.theme, key, 1),
    love: pickByKey(elementSet.love, key, 2),
    money: pickByKey(elementSet.money, key, 3),
    energy: pickByKey(elementSet.energy, key, 4),
    advice: pickByKey(elementSet.advice, key, 5),
  };
}

function buildLuckyDays(sign: ZodiacSign, dateIso: string, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const iso = addDays(dateIso, index);
    const key = `${sign.slug}:${iso}:lucky`;
    const seed = hashString(key);
    return {
      iso,
      date: formatShortDate(iso),
      weekday: formatWeekday(iso),
      status: luckyStatuses[variance(seed, 1, luckyStatuses.length)],
      area: luckyAreas[variance(seed, 2, luckyAreas.length)],
    };
  });
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
