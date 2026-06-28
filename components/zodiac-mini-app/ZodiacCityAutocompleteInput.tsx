import { MapPin } from "lucide-react";
import { cityLabel, getCityById, searchCities } from "./person-state";
import type { City } from "./types";

export type ZodiacCityAutocompleteInputProps = {
  value: string;
  onChange: (value: string) => void;
  publicMode?: boolean;
  id?: string;
  placeholder?: string;
  selectedCityId?: string;
  onSelectedCityIdChange?: (cityId: string) => void;
  onCitySelect?: (city: City) => void;
  hasError?: boolean;
  helperText?: string;
  suggestionLimit?: number;
};

export function ZodiacCityAutocompleteInput({
  value,
  onChange,
  publicMode = false,
  id,
  placeholder = "Днепр / Дніпро",
  selectedCityId = "",
  onSelectedCityIdChange,
  onCitySelect,
  hasError = false,
  helperText,
  suggestionLimit = 5,
}: ZodiacCityAutocompleteInputProps) {
  const selectedCity = getCityById(selectedCityId);
  const suggestions = value.trim() && !selectedCity ? searchCities(value).slice(0, suggestionLimit) : [];
  const inputClass = publicMode
    ? `aphrodite-touch-target w-full rounded-lg border bg-white/8 px-3 pr-11 text-[16px] text-white placeholder-slate-400 outline-none transition focus:border-violet-300 focus:bg-white/10 ${hasError ? "border-amber-300" : "border-white/15"}`
    : `aphrodite-touch-target w-full rounded-lg border bg-white px-3 pr-11 text-[16px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 ${hasError ? "border-amber-300" : "border-slate-200"}`;

  function handleInputChange(nextValue: string) {
    onChange(nextValue);
    onSelectedCityIdChange?.("");
  }

  function handleCitySelect(city: City) {
    const label = cityLabel(city);
    onChange(label);
    onSelectedCityIdChange?.(city.cityId);
    onCitySelect?.(city);
  }

  return (
    <div className="min-w-0 max-w-full" data-zodiac-city-autocomplete-input="true">
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => handleInputChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Город рождения"
          data-zodiac-city-input="true"
          className={inputClass}
        />
        <MapPin aria-hidden="true" className={`pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 ${publicMode ? "text-violet-200" : "text-violet-500"}`} />
      </div>

      {suggestions.length > 0 ? (
        <div className={publicMode ? "mt-2 max-h-44 overflow-y-auto rounded-lg border border-white/12 bg-slate-950/95 p-1 shadow-xl" : "mt-2 max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm"}>
          {suggestions.map((city) => (
            <button
              key={city.cityId}
              type="button"
              onClick={() => handleCitySelect(city)}
              className={publicMode ? "flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10" : "flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-cyan-50"}
            >
              <MapPin className={publicMode ? "mt-0.5 h-4 w-4 shrink-0 text-amber-100" : "mt-0.5 h-4 w-4 shrink-0 text-cyan-700"} />
              <span>
                <span className={publicMode ? "block font-semibold text-white" : "block font-semibold text-slate-950"}>{city.nameRu}, {city.countryRu}</span>
                <span className={publicMode ? "block text-xs text-slate-400" : "block text-xs text-slate-500"}>{city.nameEn} · {city.timezone}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {selectedCity ? (
        <div className={publicMode ? "mt-2 rounded-lg border border-emerald-200/25 bg-emerald-200/10 px-3 py-2 text-xs font-semibold text-emerald-100" : "mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900"}>
          {cityLabel(selectedCity)} · {selectedCity.timezone}
        </div>
      ) : null}

      {helperText ? <p className={publicMode ? "mt-1 text-xs leading-5 text-slate-400" : "mt-1 text-xs leading-5 text-slate-500"}>{helperText}</p> : null}
    </div>
  );
}
