import { cityCatalog } from "./constants";
import type { City, Gender, PersonState } from "./types";

export function createInitialPerson(sign: string, gender: Gender, knowsTime: boolean, cityId: string): PersonState {
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

export function sanitizeNameInput(value: string) {
  return String(value || "")
    .replace(/[^A-Za-zА-Яа-яЁё\s-]/g, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, 30);
}

export function normalizeName(value: string) {
  return sanitizeNameInput(value).trim().replace(/\s{2,}/g, " ");
}

export function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

export function formatTimeInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function isValidTime(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;
  const h = Number(match[1]);
  const m = Number(match[2]);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

export function getCityById(cityId: string) {
  return cityCatalog.find((city) => city.cityId === cityId) ?? null;
}

export function cityLabel(city: City) {
  return `${city.nameRu}, ${city.countryRu}`;
}

export function searchCities(query: string) {
  const normalized = normalizeSearch(query);
  if (!normalized) return cityCatalog.slice(0, 5);
  return cityCatalog.filter((city) => {
    const haystack = [city.nameRu, city.nameEn, city.countryRu, city.countryCode, ...(city.aliases ?? [])].map(normalizeSearch);
    return haystack.some((item) => item.includes(normalized));
  });
}

export function normalizeSearch(value: string) {
  return value.toLowerCase().trim().replace(/ё/g, "е");
}

export function genderSuffix(gender: Gender) {
  if (gender === "male") return " мужчина";
  if (gender === "female") return " женщина";
  return "";
}
