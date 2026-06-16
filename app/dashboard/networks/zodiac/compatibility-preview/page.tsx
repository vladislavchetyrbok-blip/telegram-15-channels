"use client";

import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

type Mode = "fast" | "personal" | "precise";
type Gender = "male" | "female" | "unspecified";

interface PersonState {
  sign: string;
  gender: Gender;
  birthDate: string;
  knowsTime: boolean;
  birthTime: string;
  birthCity: string;
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

const genderLabels: Record<Gender, string> = {
  male: "Мужчина",
  female: "Женщина",
  unspecified: "Не указывать",
};

const modes: Array<{ id: Mode; label: string; caption: string }> = [
  { id: "fast", label: "Fast", caption: "знак + знак" },
  { id: "personal", label: "Personal", caption: "пол, знак и дата рождения" },
  { id: "precise", label: "Precise", caption: "время и город, если известны" },
];

const initialSelf: PersonState = {
  sign: "gemini",
  gender: "male",
  birthDate: "1998-06-15",
  knowsTime: true,
  birthTime: "14:30",
  birthCity: "Kyiv",
};

const initialPartner: PersonState = {
  sign: "leo",
  gender: "female",
  birthDate: "1998-08-10",
  knowsTime: false,
  birthTime: "",
  birthCity: "",
};

export default function ZodiacCompatibilityPreviewPage() {
  const [mode, setMode] = useState<Mode>("precise");
  const [self, setSelf] = useState<PersonState>(initialSelf);
  const [partner, setPartner] = useState<PersonState>(initialPartner);
  const selfSign = findSign(self.sign);
  const partnerSign = findSign(partner.sign);
  const unknownTime = mode === "precise" && (!self.knowsTime || !partner.knowsTime);

  const title = useMemo(() => {
    const selfGender = self.gender === "unspecified" ? "" : ` ${genderLabels[self.gender].toLowerCase()}`;
    const partnerGender = partner.gender === "unspecified" ? "" : ` ${genderLabels[partner.gender].toLowerCase()}`;
    return `${selfSign.emoji} ${selfSign.name}${selfGender} + ${partnerSign.emoji} ${partnerSign.name}${partnerGender}`;
  }, [partner.gender, partnerSign.emoji, partnerSign.name, self.gender, selfSign.emoji, selfSign.name]);

  return (
    <div className="-mx-4 -my-6 min-h-screen bg-[#f8fafc] px-4 py-6 text-slate-950 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-lg border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-cyan-50 p-6 shadow-sm">
          <Link href="/dashboard/networks/zodiac" className="text-sm font-semibold text-violet-700 hover:text-violet-900">
            Назад к Zodiac
          </Link>
          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-semibold text-violet-700">
                <Sparkles className="h-3.5 w-3.5" />
                Mini App preview
              </p>
              <h1 className="mt-4 break-words text-xl font-semibold leading-tight text-slate-950 [overflow-wrap:anywhere] sm:text-4xl">Совместимость знаков зодиака</h1>
              <p className="mt-3 max-w-3xl break-words text-sm leading-6 text-slate-600 [overflow-wrap:anywhere] sm:text-base sm:leading-7">
                Локальный макет интерактивного расчёта. Данные не сохраняются, Telegram API не вызывается.
              </p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <ShieldCheck className="mr-2 inline h-4 w-4" />
              dry-run only
            </div>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`rounded-lg border p-4 text-left shadow-sm transition ${
                mode === item.id ? "border-violet-300 bg-violet-50 text-violet-900" : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200"
              }`}
            >
              <span className="block font-semibold">{item.label}</span>
              <span className="mt-1 block text-sm">{item.caption}</span>
            </button>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_1fr_0.95fr]">
          <PersonPanel title="Вы" mode={mode} value={self} onChange={setSelf} />
          <PersonPanel title="Партнёр" mode={mode} value={partner} onChange={setPartner} />
          <ResultPanel mode={mode} title={title} unknownTime={unknownTime} />
        </section>
      </div>
    </div>
  );
}

function PersonPanel({
  title,
  mode,
  value,
  onChange,
}: {
  title: string;
  mode: Mode;
  value: PersonState;
  onChange: (value: PersonState) => void;
}) {
  const showBirthDate = mode !== "fast";
  const showPrecise = mode === "precise";
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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

        {showBirthDate && (
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
        )}

        {showPrecise && (
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
            {!value.knowsTime && (
              <p className="text-sm text-amber-800">Не знаю точное время рождения. Расчёт останется доступным.</p>
            )}
            {value.knowsTime && (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultPanel({ mode, title, unknownTime }: { mode: Mode; title: string; unknownTime: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700">
          <HeartHandshake className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-semibold text-slate-950">Результат</h2>
          <p className="text-sm text-slate-500">{mode}</p>
        </div>
      </div>
      <div className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
        <p className="break-words font-semibold text-slate-950">{title}</p>
        <p><b>Притяжение:</b> есть интерес и сильная точка контакта.</p>
        <p><b>Общение:</b> лучше работают ясные просьбы и короткие договорённости.</p>
        <p><b>В любви:</b> важно не соревноваться за внимание.</p>
        <p><b>Быт и ритм:</b> общий режим стоит согласовать заранее.</p>
        <p><b>Слабое место:</b> молчаливые ожидания и резкие реакции.</p>
        <p><b>Совет паре:</b> выберите один общий фокус на неделю.</p>
        <p><b>Итог:</b> совместимость раскрывается через диалог и уважение к ритму друг друга.</p>
        {unknownTime && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
            Расчёт выполнен без точного времени рождения. Некоторые детали могут быть приблизительными.
          </p>
        )}
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

function findSign(slug: string) {
  return signs.find((sign) => sign.slug === slug) ?? signs[0];
}
