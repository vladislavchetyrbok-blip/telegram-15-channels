import { CalendarDays, Crown, HeartHandshake, Sparkles, Star } from "lucide-react";
import type { HubTab, MenuFeatureGroup, MoreFeatureId } from "./types";

export const menuHubTabs: Array<{ id: HubTab; label: string; shortLabel: string; icon: typeof Sparkles }> = [
  { id: "today", label: "Главная", shortLabel: "Главная", icon: Sparkles },
  { id: "love", label: "Любовь", shortLabel: "Любовь", icon: HeartHandshake },
  { id: "profile", label: "Личный профиль", shortLabel: "Профиль", icon: Star },
  { id: "forecasts", label: "Прогноз", shortLabel: "Прогноз", icon: CalendarDays },
  { id: "mystic", label: "Мистика", shortLabel: "Мистика", icon: Sparkles },
  { id: "vip", label: "VIP", shortLabel: "VIP", icon: Crown },
];

export const hubCategoryByTab: Record<HubTab, { group: MenuFeatureGroup | "home"; label: string }> = {
  today: { group: "home", label: "Главная" },
  love: { group: "love", label: "Любовь" },
  profile: { group: "profile", label: "Личный профиль" },
  forecasts: { group: "forecasts", label: "Прогноз" },
  mystic: { group: "mystic", label: "Мистика" },
  vip: { group: "vip", label: "VIP" },
};

export const menuFeatureTabs: Array<{ id: MoreFeatureId; label: string; shortLabel: string; group: MenuFeatureGroup; requirement?: "pair" | "natal" | "sign" }> = [
  { id: "compatibilityTool", label: "💞 Совместимость", shortLabel: "Совмест.", group: "love" },
  { id: "coupleHoroscope", label: "💑 Гороскоп пары", shortLabel: "Пара", group: "love", requirement: "pair" },
  { id: "mentalMap", label: "🧠 Ментальная карта", shortLabel: "Карта", group: "love", requirement: "pair" },
  { id: "coupleCalendar", label: "📅 Календарь пары", shortLabel: "30 дней", group: "love", requirement: "pair" },
  { id: "reconciliation", label: "🕊 Примирение", shortLabel: "Мир", group: "love", requirement: "pair" },
  { id: "messageHelper", label: "💌 Сообщение", shortLabel: "Текст", group: "love", requirement: "pair" },
  { id: "nameCompatibility", label: "🔤 Совместимость имён", shortLabel: "Имена", group: "love" },
  { id: "natalChart", label: "🌌 Натальная карта", shortLabel: "Натал", group: "profile", requirement: "natal" },
  { id: "chineseHoroscope", label: "🐉 Китайский гороскоп", shortLabel: "Китай", group: "profile", requirement: "natal" },
  { id: "nameProfile", label: "🔤 Именной профиль", shortLabel: "Имя", group: "profile" },
  { id: "numerology", label: "🔢 Нумерология", shortLabel: "Числа", group: "profile" },
  { id: "zodiacStones", label: "💎 Камни знака", shortLabel: "Камни", group: "profile", requirement: "sign" },
  { id: "archetype", label: "✨ Архетип личности", shortLabel: "Архетип", group: "profile" },
  { id: "todayForecast", label: "✨ Сегодня", shortLabel: "Сегодня", group: "forecasts", requirement: "sign" },
  { id: "weekForecast", label: "⭐ Неделя", shortLabel: "Неделя", group: "forecasts", requirement: "sign" },
  { id: "luckyDays", label: "📆 Удачные дни", shortLabel: "Дни", group: "forecasts", requirement: "sign" },
  { id: "lunarCalendar", label: "🌙 Лунный календарь", shortLabel: "Луна", group: "forecasts", requirement: "sign" },
  { id: "dailyTalisman", label: "🧿 Талисман дня", shortLabel: "Талисман", group: "forecasts", requirement: "sign" },
  { id: "angelNumbers", label: "👼 Ангельские числа", shortLabel: "11:11", group: "forecasts" },
  { id: "giftBySign", label: "🎁 Подарок по знаку", shortLabel: "Подарок", group: "forecasts", requirement: "sign" },
  { id: "dailyCard", label: "🃏 Карта дня", shortLabel: "Карта", group: "mystic", requirement: "sign" },
  { id: "tarotCard", label: "🔮 Таро дня", shortLabel: "Таро", group: "mystic", requirement: "sign" },
  { id: "runeDay", label: "ᚱ Руна дня", shortLabel: "Руна", group: "mystic", requirement: "sign" },
  { id: "intuitiveSign", label: "✨ Интуитивный знак", shortLabel: "Знак", group: "mystic", requirement: "sign" },
  { id: "talismans", label: "🧿 Талисманы", shortLabel: "Символы", group: "mystic", requirement: "sign" },
  { id: "auraColor", label: "🌈 Цвет ауры", shortLabel: "Аура", group: "mystic", requirement: "sign" },
  { id: "lunarRitual", label: "🌙 Лунный ритуал", shortLabel: "Ритуал", group: "mystic" },
  { id: "karmicLessons", label: "🪞 Кармические уроки", shortLabel: "Карма", group: "mystic", requirement: "sign" },
  { id: "birthMatrix", label: "🔢 Матрица рождения", shortLabel: "Матрица", group: "mystic" },
  { id: "vip", label: "👑 VIP preview", shortLabel: "VIP", group: "vip" },
  { id: "mentalMap", label: "🧠 Карта пары+", shortLabel: "Карта+", group: "vip", requirement: "pair" },
  { id: "coupleCalendar", label: "📅 30 дней пары", shortLabel: "30 дней", group: "vip", requirement: "pair" },
  { id: "natalChart", label: "🌌 Натал+", shortLabel: "Натал+", group: "vip", requirement: "natal" },
  { id: "nameProfile", label: "🔤 Имя+", shortLabel: "Имя+", group: "vip" },
  { id: "giveaways", label: "🔒 Розыгрыши", shortLabel: "Скоро", group: "vip" },
];

export const menuFeatureGroups: Array<{ id: MenuFeatureGroup; title: string; subtitle: string }> = [
  { id: "love", title: "Любовь", subtitle: "пара, диалог и мягкое сближение" },
  { id: "profile", title: "Личный профиль", subtitle: "натальная карта, имя, числа и символы" },
  { id: "forecasts", title: "Прогноз", subtitle: "сегодня, неделя, луна и подсказки" },
  { id: "mystic", title: "Мистика", subtitle: "карты, Таро, руны, аура и символы дня" },
  { id: "vip", title: "VIP", subtitle: "preview без оплаты" },
];

export const defaultMenuFeatureByGroup: Record<MenuFeatureGroup, MoreFeatureId> = {
  love: "compatibilityTool",
  profile: "natalChart",
  forecasts: "todayForecast",
  mystic: "dailyCard",
  vip: "vip",
};
