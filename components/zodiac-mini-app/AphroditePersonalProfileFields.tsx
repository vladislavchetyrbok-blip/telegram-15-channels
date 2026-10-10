"use client";

import { CalendarDays, Check, UserRound } from "lucide-react";
import { parseBirthDateInput } from "@/lib/zodiac-birth-date-range";
import { signs } from "./constants";
import { findSign } from "./feature-routing";
import { sanitizeNameInput } from "./person-state";
import type { PersonState } from "./types";
import { ZodiacSelect, type ZodiacSelectOption } from "./ZodiacSelect";
import { ZodiacUnifiedDateInput } from "./ZodiacUnifiedDateInput";

const signOptions: ZodiacSelectOption[] = signs.map((sign) => ({
  value: sign.slug,
  label: `${sign.emoji} ${sign.name}`,
  description: sign.range,
}));

export function AphroditePersonalProfileFields({
  publicMode,
  value,
  onChange,
  compact = false,
}: {
  publicMode: boolean;
  value: PersonState;
  onChange: (next: PersonState) => void;
  compact?: boolean;
}) {
  const parsedBirthDate = parseBirthDateInput(value.birthDate, { emptyError: "" });
  const selectedSign = value.sign ? findSign(value.sign) : null;

  return (
    <div
      className={
        publicMode
          ? "rounded-lg border border-amber-200/20 bg-gradient-to-br from-amber-200/10 via-fuchsia-200/7 to-transparent p-4"
          : "rounded-lg border border-amber-200 bg-amber-50/70 p-4"
      }
      data-aphrodite-personal-profile-fields="true"
    >
      <div className="flex items-start gap-3">
        <span className={publicMode ? "grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-amber-200/25 bg-amber-200/10 text-amber-100" : "grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-amber-200 bg-white text-amber-700"}>
          <UserRound className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className={publicMode ? "text-sm font-semibold text-amber-50" : "text-sm font-semibold text-slate-950"}>
            {compact ? "Нужен ваш знак" : "Личный профиль"}
          </p>
          <p className={publicMode ? "mt-1 text-xs leading-5 text-slate-300" : "mt-1 text-xs leading-5 text-slate-600"}>
            Введите дату рождения: APHRODITE определит знак автоматически. При желании знак можно выбрать вручную.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {!compact ? (
          <label className="block">
            <span className={publicMode ? "mb-1 block text-xs font-semibold text-slate-300" : "mb-1 block text-xs font-semibold text-slate-600"}>Имя, необязательно</span>
            <input
              type="text"
              value={value.name}
              onChange={(event) => onChange({ ...value, name: sanitizeNameInput(event.target.value) })}
              autoComplete="name"
              placeholder="Как к вам обращаться"
              className={publicMode ? "aphrodite-touch-target w-full rounded-lg border border-white/15 bg-white/8 px-3 text-[16px] text-white outline-none transition placeholder:text-slate-400 focus:border-amber-200 focus:ring-2 focus:ring-amber-200/20" : "aphrodite-touch-target w-full rounded-lg border border-slate-200 bg-white px-3 text-[16px] text-slate-950 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"}
            />
          </label>
        ) : null}

        <div>
          <p className={publicMode ? "mb-1 text-xs font-semibold text-slate-300" : "mb-1 text-xs font-semibold text-slate-600"}>Дата рождения</p>
          <ZodiacUnifiedDateInput
            publicMode={publicMode}
            value={value.birthDate}
            onChange={(birthDate) => onChange({ ...value, birthDate })}
            hasError={Boolean(value.birthDate && !parsedBirthDate.ok)}
            birthDateScope="aphrodite-profile"
            hint="Дата нужна только персональным функциям и хранится на этом устройстве."
          />
          {value.birthDate && !parsedBirthDate.ok ? (
            <p className={publicMode ? "mt-1 text-xs font-semibold text-rose-200" : "mt-1 text-xs font-semibold text-rose-700"}>
              {parsedBirthDate.error}
            </p>
          ) : null}
        </div>

        {selectedSign && parsedBirthDate.ok ? (
          <div className={publicMode ? "flex items-center gap-2 rounded-lg border border-emerald-200/25 bg-emerald-200/10 px-3 py-2 text-sm font-semibold text-emerald-50" : "flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800"} data-aphrodite-autosign={selectedSign.slug}>
            <Check className="h-4 w-4 shrink-0" />
            Знак определён: {selectedSign.emoji} {selectedSign.name}
          </div>
        ) : null}

        <ZodiacSelect
          publicMode={publicMode}
          label="Знак вручную"
          value={value.sign}
          options={signOptions}
          placeholder="Выберите, если не хотите вводить дату"
          onChange={(sign) => onChange({ ...value, sign })}
        />

        <div className={publicMode ? "flex items-start gap-2 text-xs leading-5 text-slate-400" : "flex items-start gap-2 text-xs leading-5 text-slate-500"}>
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Профиль хранится локально, не отправляется в Telegram и не синхронизируется между устройствами.</p>
        </div>
      </div>
    </div>
  );
}
