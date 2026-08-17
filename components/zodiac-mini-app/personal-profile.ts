"use client";

import { normalizeBirthDateInputDisplay } from "@/lib/zodiac-birth-date-range";
import { signSlugs } from "./constants";
import { cityLabel, formatTimeInput, getCityById, sanitizeNameInput } from "./person-state";
import type { Gender, PersonState } from "./types";

export const APHRODITE_PERSONAL_PROFILE_STORAGE_KEY = "aphrodite-personal-profile-v1";

interface StoredPersonalProfile extends PersonState {
  version: 1;
}

export function loadAphroditePersonalProfile(): PersonState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(APHRODITE_PERSONAL_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return normalizeStoredProfile(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveAphroditePersonalProfile(profile: PersonState) {
  if (typeof window === "undefined") return;

  try {
    const normalized = normalizeStoredProfile(profile);
    if (!normalized) return;
    const stored: StoredPersonalProfile = { version: 1, ...normalized };
    window.localStorage.setItem(APHRODITE_PERSONAL_PROFILE_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Local profile persistence is optional and must not break private-mode WebViews.
  }
}

export function clearAphroditePersonalProfile() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(APHRODITE_PERSONAL_PROFILE_STORAGE_KEY);
  } catch {
    // Clearing optional local data must remain safe in restricted WebViews.
  }
}

function normalizeStoredProfile(value: unknown): PersonState | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Partial<StoredPersonalProfile>;
  const selectedCity = getCityById(sanitizeToken(source.selectedCityId));

  return {
    name: sanitizeNameInput(String(source.name || "")).trim(),
    sign: signSlugs.has(String(source.sign || "")) ? String(source.sign) : "",
    gender: sanitizeGender(source.gender),
    birthDate: normalizeBirthDateInputDisplay(String(source.birthDate || "")),
    knowsTime: Boolean(source.knowsTime),
    birthTime: formatTimeInput(String(source.birthTime || "")),
    cityQuery: selectedCity ? cityLabel(selectedCity) : "",
    selectedCityId: selectedCity?.cityId ?? "",
  };
}

function sanitizeGender(value: unknown): Gender {
  return value === "female" || value === "male" ? value : "unspecified";
}

function sanitizeToken(value: unknown) {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  return /^[A-Za-z0-9_-]{1,64}$/.test(normalized) ? normalized : "";
}
