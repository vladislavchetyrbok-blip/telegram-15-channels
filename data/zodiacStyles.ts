export interface ZodiacStylePreset {
  id: string;
  ruName: string;
  description: string;
  textTone: string;
  visualStyle: string;
  colorPalette: string[];
  promptAddons: string;
  forbiddenCliches: string[];
}

export const zodiacStylePresets: ZodiacStylePreset[] = [
  {
    id: "luxury-mystic",
    ruName: "Luxury Mystic",
    description: "Premium cinematic look, like an expensive Telegram magazine. Black and gold.",
    textTone: "premium, direct, cinematic, short, confident, atmospheric, emotional but controlled",
    visualStyle: "black, gold, marble, cosmic glow, cinematic shadows, premium Telegram magazine",
    colorPalette: ["black", "gold", "deep blue", "violet"],
    promptAddons: "cinematic light, highly detailed, dramatic shadows, premium luxury, no cartoon, 8k",
    forbiddenCliches: [
      "cheap cartoon horoscope look",
      "generic stock style",
      "fake medical claims",
      "guaranteed money or love promises",
      "fear-based predictions",
      "manipulative language",
      "boring generic horoscope cliches"
    ]
  },
  {
    id: "dark-zodiac",
    ruName: "Dark Zodiac",
    description: "Deeper, mysterious, sharper. More dramatic with red accents and shadows.",
    textTone: "intense, magnetic, slightly darker, deep, mysterious",
    visualStyle: "dark blue, black, red accents, moonlight, shadows, symbols, dramatic contrast",
    colorPalette: ["dark blue", "black", "crimson red", "silver"],
    promptAddons: "dark moody atmosphere, sharp shadows, moonlight, arcane symbols, mystical depth, high contrast",
    forbiddenCliches: [
      "fear manipulation",
      "light and fluffy aesthetics",
      "cheap cartoon horoscope look",
      "fake medical claims",
      "guaranteed money or love promises",
      "boring generic horoscope cliches"
    ]
  },
  {
    id: "soft-cosmic",
    ruName: "Soft Cosmic",
    description: "Softer, feminine, calming and elegant. Fog, stars, and soft glow.",
    textTone: "warm, intuitive, supportive, less harsh, softer, calming, elegant",
    visualStyle: "violet, blue, silver, fog, stars, soft glow, dreamy, ethereal",
    colorPalette: ["violet", "soft blue", "silver", "white"],
    promptAddons: "soft cosmic glow, dreamy fog, ethereal lighting, elegant composition, starlight, soft edges",
    forbiddenCliches: [
      "harsh dramatic shadows",
      "aggressive colors",
      "cheap cartoon horoscope look",
      "fake medical claims",
      "guaranteed money or love promises",
      "fear-based predictions",
      "boring generic horoscope cliches"
    ]
  }
];

export const defaultZodiacStylePresetId = "luxury-mystic";
