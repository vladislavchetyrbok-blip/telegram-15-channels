"use client";

import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

type Mode = "fast" | "personal" | "precise";
type Gender = "male" | "female" | "unspecified";
type Variant = "dashboard" | "public";

interface PersonState {
  sign: string;
  gender: Gender;
  birthDate: string;
  knowsTime: boolean;
  birthTime: string;
  birthCity: string;
}

interface ZodiacCompatibilityMiniAppProps {
  variant?: Variant;
  initialSign?: string | null;
  initialMode?: string | null;
  source?: string | null;
  startParam?: string | null;
}

const signs = [
  { slug: "aries", emoji: "♈", name: "Овен" },
  { slug: "taurus", emoji: "♉", name: "Телец" },
  { slug: "gemini", emoji: "♊", name: "Близнецы" },
  { slug: "cancer", emoji: "♋", name: "Рак" },
  { slug: "leo", emoji: "♌", name: "Лев" },
  { slug: "virgo", emoji: "♍", name: "Дева" },
  { slug: "libra", emoji: "♎", name: "Весы" },
  { slug: "scorpio", emoji: "♏", name: "Скорпион" },
  { slug: "sagittarius", emoji: "♐", name: "Стрелец" },
  { slug: "capricorn", emoji: "♑", name: "Козерог" },
  { slug: "aquarius", emoji: "♒", name: "Водолей" },
  { slug: "pisces", emoji: "♓", name: "Рыбы" },
];

const signSlugs = new Set(signs.map((sign) => sign.slug));

const genderLabels: Record<Gender, string> = {
  male: "Мужчина",
  female: "Женщина",
  unspecified: "Не указывать",
};

const modes: Array<{ id: Mode; label: string; caption: string }> = [
  { id: "fast", label: "Быстрый", caption: "знак + знак" },
  { id: "personal", label: "Персональный", caption: "пол, знак и дата рождения" },
  { id: "precise", label: "Точный", caption: "время и город, если известны" },
];

const unknownBirthTimeNote = "Расчёт выполнен без точного времени рождения. Некоторые детали могут быть приблизительными.";

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
  const [self, setSelf] = useState<PersonState>(() => createInitialPerson(resolvedSign, "male", true));
  const [partner, setPartner] = useState<PersonState>(() => createInitialPerson(partnerSign, "female", false));
  const selfSign = findSign(self.sign);
  const partnerSignData = findSign(partner.sign);
  const unknownTime = mode === "precise" && (!self.knowsTime || !partner.knowsTime);

  const title = useMemo(() => {
    const selfGender = self.gender === "unspecified" ? "" : ` ${genderLabels[self.gender].toLowerCase()}`;
    const partnerGender = partner.gender === "unspecified" ? "" : ` ${genderLabels[partner.gender].toLowerCase()}`;
    return `${selfSign.emoji} ${selfSign.name}${selfGender} + ${partnerSignData.emoji} ${partnerSignData.name}${partnerGender}`;
  }, [partner.gender, partnerSignData.emoji, partnerSignData.name, self.gender, selfSign.emoji, selfSign.name]);

  return (
    <div
      className={
        publicMode
          ? "min-h-screen w-full max-w-full overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.24),transparent_18rem),radial-gradient(circle_at_top_right,rgba(168,85,247,0.24),transparent_18rem),#070b14] px-4 py-5 text-slate-100 sm:px-6"
          : "-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#f8fafc] px-4 py-6 text-slate-950 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      }
    >
      <div className={publicMode ? "mx-auto w-full max-w-5xl space-y-4" : "mx-auto max-w-7xl space-y-6"}>
        <header
          className={
            publicMode
              ? "w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-cyan-300/20 bg-slate-950/78 p-5 shadow-[0_24px_80px_rgba(8,13,30,0.45)] backdrop-blur sm:max-w-full"
              : "rounded-lg border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-cyan-50 p-6 shadow-sm"
          }
        >
          {!publicMode ? (
            <Link href="/dashboard/networks/zodiac" className="text-sm font-semibold text-violet-700 hover:text-violet-900">
              Назад к Zodiac
            </Link>
          ) : null}

          <div className={publicMode ? "flex flex-col gap-4" : "mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"}>
            <div className="min-w-0">
              <p
                className={
                  publicMode
                    ? "inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100"
                    : "inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-semibold text-violet-700"
                }
              >
                <Sparkles className="h-3.5 w-3.5" />
                {publicMode ? "Mini App" : "Mini App preview"}
              </p>
              <h1
                className={
                  publicMode
                    ? "mt-4 max-w-[18rem] break-words text-xl font-semibold leading-tight text-white [overflow-wrap:anywhere] sm:max-w-none sm:text-4xl"
                    : "mt-4 break-words text-xl font-semibold leading-tight text-slate-950 [overflow-wrap:anywhere] sm:text-4xl"
                }
              >
                Совместимость знаков зодиака
              </h1>
              <p
                className={
                  publicMode
                    ? "mt-3 max-w-[18rem] break-words text-sm leading-6 text-slate-300 [overflow-wrap:anywhere] sm:max-w-3xl"
                    : "mt-3 max-w-3xl break-words text-sm leading-6 text-slate-600 [overflow-wrap:anywhere] sm:text-base sm:leading-7"
                }
              >
                Выберите режим и сравните пару. Данные остаются только на экране, не сохраняются и не отправляются в Telegram API.
              </p>
            </div>
            <div
              className={
                publicMode
                  ? "inline-flex w-fit items-center rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-4 py-3 text-sm font-semibold text-emerald-100"
                  : "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
              }
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              {publicMode ? "без сохранения данных" : "dry-run only"}
            </div>
          </div>

          {publicMode && source === "telegram" ? (
            <p className="mt-4 max-w-[18rem] break-words rounded-md border border-violet-300/20 bg-violet-300/10 px-3 py-2 text-xs text-violet-100 [overflow-wrap:anywhere] sm:max-w-full">
              Открыто из Telegram. Первый знак уже выбран или передан ссылкой.
            </p>
          ) : null}
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={
                publicMode
                    ? `min-w-0 w-full max-w-[calc(100vw-2rem)] rounded-lg border p-4 text-left shadow-sm transition sm:max-w-full ${
                      mode === item.id
                        ? "border-cyan-300/70 bg-cyan-300/15 text-cyan-50"
                        : "border-white/10 bg-white/6 text-slate-300 hover:border-cyan-300/40"
                    }`
                  : `min-w-0 rounded-lg border p-4 text-left shadow-sm transition ${
                      mode === item.id ? "border-violet-300 bg-violet-50 text-violet-900" : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200"
                    }`
              }
            >
              <span className="block font-semibold">{item.label}</span>
              <span className="mt-1 block text-sm">{item.caption}</span>
            </button>
          ))}
        </section>

        <section className={publicMode ? "grid min-w-0 max-w-full gap-4 lg:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_0.95fr]" : "grid gap-5 lg:grid-cols-[1fr_1fr_0.95fr]"}>
          <PersonPanel publicMode={publicMode} title="Вы" mode={mode} value={self} onChange={setSelf} />
          <PersonPanel publicMode={publicMode} title="Партнёр" mode={mode} value={partner} onChange={setPartner} />
          <ResultPanel publicMode={publicMode} mode={mode} title={title} unknownTime={unknownTime} />
        </section>
      </div>
    </div>
  );
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

  return (
    <div className={publicMode ? "min-w-0 w-full max-w-[calc(100vw-2rem)] rounded-lg border border-white/10 bg-white/95 p-5 text-slate-950 shadow-sm sm:max-w-full" : "min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"}>
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <div className="mt-5 space-y-4">
        <Field label="Знак">
          <select
            value={value.sign}
            onChange={(event) => onChange({ ...value, sign: event.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
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
            <Field label="Пол">
              <div className="grid gap-2 sm:grid-cols-3">
                {(Object.keys(genderLabels) as Gender[]).map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => onChange({ ...value, gender })}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      value.gender === gender ? "border-cyan-300 bg-cyan-50 text-cyan-900" : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    {genderLabels[gender]}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Дата рождения">
              <input
                type="date"
                value={value.birthDate}
                onChange={(event) => onChange({ ...value, birthDate: event.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </Field>
          </>
        ) : null}

        {showPrecise ? (
          <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                checked={value.knowsTime}
                onChange={(event) => onChange({ ...value, knowsTime: event.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              Знаю точное время рождения
            </label>
            {!value.knowsTime ? <p className="text-sm text-amber-800">Не знаю точное время рождения. Расчёт останется доступным.</p> : null}
            {value.knowsTime ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Время">
                  <input
                    type="time"
                    value={value.birthTime}
                    onChange={(event) => onChange({ ...value, birthTime: event.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </Field>
                <Field label="Город">
                  <input
                    value={value.birthCity}
                    onChange={(event) => onChange({ ...value, birthCity: event.target.value })}
                    placeholder="Kyiv"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </Field>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ResultPanel({ publicMode, mode, title, unknownTime }: { publicMode: boolean; mode: Mode; title: string; unknownTime: boolean }) {
  return (
    <div className={publicMode ? "min-w-0 w-full max-w-[calc(100vw-2rem)] rounded-lg border border-white/10 bg-white/95 p-5 text-slate-950 shadow-sm sm:max-w-full lg:col-span-2 xl:col-span-1" : "min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700">
          <HeartHandshake className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-semibold text-slate-950">Результат</h2>
          <p className="text-sm text-slate-500">{mode}</p>
        </div>
      </div>
      <div className={publicMode ? "mt-5 max-w-[18rem] space-y-3 break-words text-sm leading-6 text-slate-700 [overflow-wrap:anywhere] sm:max-w-full" : "mt-5 space-y-3 break-words text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]"}>
        <p className="font-semibold text-slate-950">{title}</p>
        <p>
          <b>{mode === "fast" ? "Совместимость знаков зодиака" : "Совместимость по дате рождения"}</b>
        </p>
        <p><b>Притяжение:</b> есть интерес и сильная точка контакта.</p>
        <p><b>Общение:</b> лучше работают ясные просьбы и короткие договорённости.</p>
        <p><b>В любви:</b> важно не соревноваться за внимание.</p>
        <p><b>Быт и ритм:</b> общий режим стоит согласовать заранее.</p>
        <p><b>Слабое место:</b> молчаливые ожидания и резкие реакции.</p>
        <p><b>Совет паре:</b> выберите один общий фокус на неделю.</p>
        <p><b>Итог:</b> совместимость раскрывается через диалог и уважение к ритму друг друга.</p>
        {unknownTime ? <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">{unknownBirthTimeNote}</p> : null}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function createInitialPerson(sign: string, gender: Gender, knowsTime: boolean): PersonState {
  return {
    sign,
    gender,
    birthDate: gender === "female" ? "1998-08-10" : "1998-06-15",
    knowsTime,
    birthTime: knowsTime ? "14:30" : "",
    birthCity: knowsTime ? "Kyiv" : "",
  };
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

function findSign(slug: string) {
  return signs.find((sign) => sign.slug === slug) ?? signs[0];
}
