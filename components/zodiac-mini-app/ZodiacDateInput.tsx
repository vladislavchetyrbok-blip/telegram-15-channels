import { CalendarDays } from "lucide-react";
import { formatDateInput, normalizeDateInput } from "@/lib/zodiac-date-input";

interface ZodiacDateInputProps {
  value: string;
  onChange: (value: string) => void;
  publicMode?: boolean;
  id?: string;
  ariaLabel?: string;
  autoComplete?: string;
  disabled?: boolean;
  hasError?: boolean;
  hint?: string;
}

export function ZodiacDateInput({
  value,
  onChange,
  publicMode = false,
  id,
  ariaLabel = "Дата в формате ДД.ММ.ГГГГ",
  autoComplete = "bday",
  disabled = false,
  hasError = false,
  hint = "Введите дату в формате ДД.ММ.ГГГГ",
}: ZodiacDateInputProps) {
  const inputClass = publicMode
    ? `h-12 w-full rounded-lg border bg-white/8 px-3 pr-12 text-base text-white placeholder-slate-400 outline-none transition focus:border-violet-300 focus:bg-white/10 ${hasError ? "border-rose-300" : "border-white/15"}`
    : `h-12 w-full rounded-lg border bg-white px-3 pr-12 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 ${hasError ? "border-rose-300" : "border-slate-200"}`;

  return (
    <div className="min-w-0">
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete={autoComplete}
          autoCorrect="off"
          spellCheck={false}
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(formatDateInput(event.target.value))}
          onBlur={() => onChange(normalizeDateInput(value))}
          placeholder="ДД.ММ.ГГГГ"
          aria-label={ariaLabel}
          data-zodiac-date-input="true"
          className={inputClass}
        />
        <CalendarDays
          aria-hidden="true"
          className={`pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 ${publicMode ? "text-violet-200" : "text-violet-500"}`}
        />
      </div>
      <p className={publicMode ? "mt-1 text-xs text-slate-400" : "mt-1 text-xs text-slate-500"}>{hint}</p>
    </div>
  );
}
