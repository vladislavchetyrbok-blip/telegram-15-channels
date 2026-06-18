import { 
  generateDailyCard as getDailyCard, 
  generateTarotDay as getTarotCard, 
  generateRuneDay as getRuneDay, 
  generateAuraColor as getAuraColor, 
  generateIntuitiveSign as getIntuitiveSign 
} from "./zodiac-mystic-content";
import type { ZodiacSignId } from "./zodiac-mystic-content";
import type { AngelNumberProfile } from "@/components/zodiac-mini-app/types";

export interface VipMysticDaySynthesis {
  dailyCard: ReturnType<typeof getDailyCard>;
  tarotCard: ReturnType<typeof getTarotCard>;
  runeDay: ReturnType<typeof getRuneDay>;
  auraColor: ReturnType<typeof getAuraColor>;
  angelNumber: AngelNumberProfile;
  advice: string;
  warning: string;
}

export function synthesizeVipMysticDay(
  dateKey: string,
  sign: ZodiacSignId,
  angelNumber: AngelNumberProfile
): VipMysticDaySynthesis {
  const daily = getDailyCard(dateKey, sign);
  const tarot = getTarotCard(dateKey, sign);
  const rune = getRuneDay(dateKey, sign);
  const aura = getAuraColor(dateKey, sign);
  const intuition = getIntuitiveSign(dateKey, sign);
  
  return {
    dailyCard: daily,
    tarotCard: tarot,
    runeDay: rune,
    auraColor: aura,
    angelNumber,
    advice: intuition.meaning,
    warning: "Постарайтесь избегать поспешных решений, опираясь на внешнее давление.",
  };
}
