import cityCatalogData from "@/data/config/zodiac-city-catalog.json";
import zodiacVipConfigData from "@/data/config/zodiac-vip-config.json";
import type { City, Gender, Mode, RelationshipMode, ZodiacSign, ZodiacVipConfig } from "./types";

export const signs: ZodiacSign[] = [
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

export const signSlugs = new Set(signs.map((sign) => sign.slug));
export const cityCatalog = cityCatalogData.cities as City[];
export const zodiacVipConfig = zodiacVipConfigData as ZodiacVipConfig;

export const genderLabels: Record<Gender, string> = {
  male: "Мужчина",
  female: "Женщина",
  unspecified: "Не указывать",
};

export const modes: Array<{ id: Mode; label: string; caption: string; resultLabel: string }> = [
  { id: "fast", label: "Быстрый", caption: "знак + знак", resultLabel: "Быстрый расчёт" },
  { id: "personal", label: "Персональный", caption: "пол, знак и дата рождения", resultLabel: "Персональный расчёт" },
  { id: "precise", label: "Точный", caption: "время и город, если известны", resultLabel: "Точный расчёт" },
];

export const relationshipModes: Array<{ id: RelationshipMode; label: string; caption: string }> = [
  { id: "love", label: "❤️ Любовь", caption: "чувства и близость" },
  { id: "friendship", label: "💬 Дружба", caption: "поддержка и доверие" },
  { id: "work", label: "💼 Работа", caption: "дела и решения" },
  { id: "family", label: "🏠 Семья / быт", caption: "ритм и забота" },
  { id: "passion", label: "🔥 Страсть", caption: "искра и притяжение" },
  { id: "reconciliation", label: "🕊 Примирение", caption: "мягкий диалог" },
];

export const unknownBirthTimeNote = "Расчёт выполнен без точного времени рождения. Точные дома и асцендент в этой версии не рассчитываются.";
export const exactBirthDataNote = "Время и город учтены как расширяющие нюансы интерпретации, без заявлений о точных домах и асценденте.";
export const citySelectionWarning = "Выберите город из списка, чтобы интерпретация была детальнее.";
