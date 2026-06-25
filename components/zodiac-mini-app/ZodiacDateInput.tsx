import { CalendarDays } from "lucide-react";
import { formatDateInput, normalizeDateInput } from "@/lib/zodiac-date-input";
import {
  BIRTH_DATE_UI_MARKER,
  normalizeBirthDateInput,
  sanitizeBirthDateInputDraft,
} from "@/lib/zodiac-birth-date-range";

interface ZodiacDateInputProps {
  value: string;
  onChange: (value: string) => void;
  dateKind?: "birth" | "calendar";
  publicMode?: boolean;
  id?: string;
  ariaLabel?: string;
  autoComplete?: string;
  disabled?: boolean;
  hasError?: boolean;
  hint?: string;
  birthDateScope?: string;
}

export function ZodiacDateInput({
  value,
  onChange,
  dateKind = "birth",
  publicMode = false,
  id,
  ariaLabel,
  autoComplete,
  disabled = false,
  hasError = false,
  hint,
  birthDateScope,
}: ZodiacDateInputProps) {
  const isBirthDate = dateKind === "birth";
  const resolvedBirthDateScope = birthDateScope ?? (isBirthDate ? "shared" : undefined);
  const resolvedAriaLabel =
    ariaLabel ?? (isBirthDate ? "Дата рождения в формате ДД.ММ.ГГГГ" : "Дата в формате ДД.ММ.ГГГГ");
  const resolvedAutoComplete = autoComplete ?? (isBirthDate ? "bday" : "off");
  const resolvedHint =
    hint ??
    (isBirthDate
      ? "Формат: ДД.ММ.ГГГГ. Например: 15.06.1998. Можно ввести дату рождения с 1900 года до сегодняшнего дня."
      : "Формат: ДД.ММ.ГГГГ. Например: 25.06.2026.");
  const inputClass = publicMode
    ? `h-12 w-full rounded-lg border bg-white/8 px-3 pr-12 text-base text-white placeholder-slate-400 outline-none transition focus:border-violet-300 focus:bg-white/10 ${hasError ? "border-rose-300" : "border-white/15"}`
    : `h-12 w-full rounded-lg border bg-white px-3 pr-12 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 ${hasError ? "border-rose-300" : "border-slate-200"}`;
  const formatValue = isBirthDate ? sanitizeBirthDateInputDraft : formatDateInput;
  const normalizeValue = isBirthDate ? normalizeBirthDateInput : normalizeDateInput;

  return (
    <div className="min-w-0">
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode={isBirthDate ? "decimal" : "numeric"}
          autoComplete={resolvedAutoComplete}
          autoCorrect="off"
          spellCheck={false}
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(formatValue(event.target.value))}
          onBlur={(event) => onChange(normalizeValue(event.currentTarget.value))}
          placeholder={isBirthDate ? "15.06.1998" : "ДД.ММ.ГГГГ"}
          aria-label={resolvedAriaLabel}
          data-zodiac-date-input="true"
          data-birth-date-ui={isBirthDate ? BIRTH_DATE_UI_MARKER : undefined}
          data-birth-date-scope={isBirthDate ? resolvedBirthDateScope : undefined}
          data-date-kind={dateKind}
          className={inputClass}
        />
        <CalendarDays
          aria-hidden="true"
          className={`pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 ${publicMode ? "text-violet-200" : "text-violet-500"}`}
        />
      </div>
      <p className={publicMode ? "mt-1 text-xs text-slate-400" : "mt-1 text-xs text-slate-500"}>{resolvedHint}</p>
    </div>
  );
}
