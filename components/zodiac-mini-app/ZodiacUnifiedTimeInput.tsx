import { Clock } from "lucide-react";

export type ZodiacUnifiedTimeInputProps = {
  value: string;
  onChange: (value: string) => void;
  publicMode?: boolean;
  id?: string;
  disabled?: boolean;
  hasError?: boolean;
  knowsTime?: boolean;
  onKnowsTimeChange?: (knowsTime: boolean) => void;
  hint?: string;
  errorText?: string;
};

function formatUnifiedTimeInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function ZodiacUnifiedTimeInput({
  value,
  onChange,
  publicMode = false,
  id,
  disabled = false,
  hasError = false,
  knowsTime,
  onKnowsTimeChange,
  hint,
  errorText,
}: ZodiacUnifiedTimeInputProps) {
  const isKnown = knowsTime ?? true;
  const inputClass = publicMode
    ? `aphrodite-touch-target w-full rounded-lg border bg-white/8 px-3 pr-11 text-[16px] text-white placeholder-slate-400 outline-none transition focus:border-violet-300 focus:bg-white/10 ${hasError ? "border-rose-300" : "border-white/15"}`
    : `aphrodite-touch-target w-full rounded-lg border bg-white px-3 pr-11 text-[16px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 ${hasError ? "border-rose-300" : "border-slate-200"}`;
  const toggleButtonClass = (active: boolean) =>
    publicMode
      ? `min-h-9 rounded-lg border px-3 py-1.5 text-left text-xs font-semibold transition ${active ? "border-amber-200/60 bg-amber-200/15 text-amber-50" : "border-white/10 bg-white/[0.065] text-slate-300"}`
      : `min-h-9 rounded-lg border px-3 py-1.5 text-left text-xs font-semibold transition ${active ? "border-amber-300 bg-amber-50 text-amber-950" : "border-slate-200 bg-white text-slate-600"}`;

  return (
    <div className="min-w-0 max-w-full" data-zodiac-unified-time-input="true">
      {onKnowsTimeChange ? (
        <div className="mb-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onKnowsTimeChange(true)} className={toggleButtonClass(isKnown)}>
            Знаю время
          </button>
          <button type="button" onClick={() => onKnowsTimeChange(false)} className={toggleButtonClass(!isKnown)}>
            Не знаю точное время
          </button>
        </div>
      ) : null}

      {isKnown ? (
        <div className="relative">
          <input
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={disabled}
            value={value}
            onChange={(event) => onChange(formatUnifiedTimeInput(event.target.value))}
            placeholder="10:10"
            aria-label="Время рождения в формате ЧЧ:ММ"
            data-zodiac-time-input="true"
            className={inputClass}
          />
          <Clock aria-hidden="true" className={`pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 ${publicMode ? "text-violet-200" : "text-violet-500"}`} />
        </div>
      ) : (
        <p className={publicMode ? "rounded-lg border border-white/10 bg-white/6 px-3 py-2 text-sm leading-5 text-slate-300" : "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-5 text-slate-600"}>
          Не знаю точное время
        </p>
      )}

      {hint ? <p className={publicMode ? "mt-1 text-xs leading-5 text-slate-400" : "mt-1 text-xs leading-5 text-slate-500"}>{hint}</p> : null}
      {errorText ? <p className={publicMode ? "mt-1 text-xs font-semibold text-rose-200" : "mt-1 text-xs font-semibold text-rose-700"}>{errorText}</p> : null}
    </div>
  );
}
