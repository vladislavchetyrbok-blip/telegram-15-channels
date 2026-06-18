import type { ZodiacAnalyticsEventName } from "@/lib/zodiac-mini-app-analytics-shared";
import type { HubTab, Mode, MoreFeatureId } from "./types";

export const vipFeatureAnalyticsEvents: Partial<Record<MoreFeatureId, ZodiacAnalyticsEventName>> = {
  vipNatalChart: "vip_natal_opened",
  vipCompatibility: "vip_compatibility_opened",
  vipMentalMap: "vip_mental_map_opened",
  vipCoupleCalendar: "vip_calendar_opened",
  vipMonthForecast: "vip_month_forecast_opened",
  vipMessageHelper: "vip_message_helper_opened",
  vipNameProfile: "vip_name_profile_opened",
  vipNumerology: "vip_numerology_opened",
  vipAngelNumbers: "vip_angel_numbers_opened",
  vipTalismans: "vip_talismans_opened",
  vipMysticDay: "vip_mystic_day_opened",
};

export const tabAnalytics: Record<Exclude<HubTab, "profile" | "mystic" | "vip">, { event: "section_open_today" | "section_open_week" | "section_open_compatibility" | "section_open_lucky_days"; section: string }> = {
  today: { event: "section_open_today", section: "today" },
  forecasts: { event: "section_open_week", section: "week" },
  love: { event: "section_open_compatibility", section: "compatibility" },
};

export const modeAnalyticsEvents: Record<Mode, "compatibility_mode_fast" | "compatibility_mode_personal" | "compatibility_mode_precise"> = {
  fast: "compatibility_mode_fast",
  personal: "compatibility_mode_personal",
  precise: "compatibility_mode_precise",
};
