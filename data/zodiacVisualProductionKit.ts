export interface ZodiacVisualKitChannel {
  id: string;
  displayName: string;
  emoji: string;
  avatarPrompt: string;
  coverPrompt: string;
  dailyPostImagePrompt: string;
  negativePrompt: string;
  colorPalette: string[];
  symbolSet: string[];
  compositionNotes: string;
  preferredAspectRatios: {
    avatar: string;
    cover: string;
    post: string;
  };
}

export const globalVisualStandards = [
  "luxury mystic",
  "dark zodiac",
  "cosmic gold",
  "black / gold / deep blue / violet",
  "cinematic light",
  "premium Telegram magazine",
  "no cartoon",
  "no cheap horoscope clipart",
  "no messy text inside images",
  "no overloaded zodiac wheels",
  "no fake religious or cult-like symbols",
  "no low-quality stock feel",
];

export const globalNegativePrompt = "text, watermark, logo, cartoon, anime, 3d render, cheap, childish, overloaded, messy, religious symbols, crosses, cult, low quality, messy lines, bad anatomy, bad proportions";

export const zodiacVisualProductionKit: ZodiacVisualKitChannel[] = [
  {
    id: "zodiac-general",
    displayName: "Гороскоп на сегодня ✨",
    emoji: "✨",
    avatarPrompt: "Macro photography of an elegant glowing crystal sphere floating in deep space, surrounded by subtle golden stardust, cinematic lighting, dark background, premium mystic style, 8k, photorealistic",
    coverPrompt: "Wide cinematic shot of an elegant glowing crystal sphere floating in deep space, surrounded by subtle golden stardust, cinematic lighting, dark background, premium mystic style",
    dailyPostImagePrompt: "Elegant abstract depiction of {zodiac_theme}, subtle golden stardust, deep dark background, premium mystic style, cinematic lighting",
    negativePrompt: globalNegativePrompt,
    colorPalette: ["#0F172A", "#1E293B", "#FBBF24", "#F8FAFC"],
    symbolSet: ["Stars", "Galaxies", "Nebulae", "Crystal Sphere"],
    compositionNotes: "Keep the center clean for focus. Use deep shadows.",
    preferredAspectRatios: { avatar: "1:1", cover: "16:9", post: "4:5" }
  },
  {
    id: "aries",
    displayName: "Овен ♈️ Гороскоп",
    emoji: "♈️",
    avatarPrompt: "Elegant minimal ram horns glowing with soft warm fire, dark obsidian background, subtle golden sparks, luxury mystic style, cinematic light, 8k, photorealistic",
    coverPrompt: "Wide shot of elegant minimal ram horns glowing with soft warm fire, dark obsidian background, subtle golden sparks, luxury mystic style, cinematic light",
    dailyPostImagePrompt: "Abstract representation of Aries energy, subtle warm fire elements, dark obsidian background, premium mystic style",
    negativePrompt: globalNegativePrompt + ", angry ram, bloody, violent",
    colorPalette: ["#450a0a", "#7f1d1d", "#f59e0b", "#0f172a"],
    symbolSet: ["Ram Horns", "Fire", "Sparks", "Obsidian"],
    compositionNotes: "Emphasize dynamic upward movement and warm glowing light.",
    preferredAspectRatios: { avatar: "1:1", cover: "16:9", post: "4:5" }
  },
  {
    id: "taurus",
    displayName: "Телец ♉️ Гороскоп",
    emoji: "♉️",
    avatarPrompt: "Elegant minimal bull silhouette carved from emerald stone with golden veins, dark background, soft forest light, luxury mystic style, 8k, photorealistic",
    coverPrompt: "Wide shot of an elegant emerald stone monolith with golden veins, dark background, soft forest light, luxury mystic style",
    dailyPostImagePrompt: "Abstract representation of Taurus energy, earthy textures, emerald and gold, dark background, premium mystic style",
    negativePrompt: globalNegativePrompt + ", angry bull, farm, bright green",
    colorPalette: ["#064e3b", "#0f766e", "#fbbf24", "#0f172a"],
    symbolSet: ["Emerald", "Gold veins", "Earth textures", "Soft light"],
    compositionNotes: "Emphasize stability, groundedness, and rich earthy textures.",
    preferredAspectRatios: { avatar: "1:1", cover: "16:9", post: "4:5" }
  },
  {
    id: "gemini",
    displayName: "Близнецы ♊️ Гороскоп",
    emoji: "♊️",
    avatarPrompt: "Two elegant ethereal glowing orbs dancing in dark space, subtle silver and gold dust, mirroring each other, luxury mystic style, cinematic light, 8k, photorealistic",
    coverPrompt: "Wide shot of two elegant ethereal glowing orbs dancing in dark space, subtle silver and gold dust, mirroring each other, luxury mystic style",
    dailyPostImagePrompt: "Abstract representation of Gemini energy, duality, twin light streaks, dark background, premium mystic style",
    negativePrompt: globalNegativePrompt + ", two faces, human faces, creepy twins",
    colorPalette: ["#1e1b4b", "#4338ca", "#cbd5e1", "#fcd34d"],
    symbolSet: ["Twin orbs", "Silver dust", "Mirrors", "Air streams"],
    compositionNotes: "Emphasize symmetry, duality, and light airy movement.",
    preferredAspectRatios: { avatar: "1:1", cover: "16:9", post: "4:5" }
  },
  {
    id: "cancer",
    displayName: "Рак ♋️ Гороскоп",
    emoji: "♋️",
    avatarPrompt: "Elegant silver moon reflection on dark calm water, glowing pearls, luxury mystic style, cinematic moonlight, 8k, photorealistic",
    coverPrompt: "Wide shot of an elegant silver moon reflection on dark calm water, glowing pearls, luxury mystic style, cinematic moonlight",
    dailyPostImagePrompt: "Abstract representation of Cancer energy, lunar phases, deep water ripples, silver glow, premium mystic style",
    negativePrompt: globalNegativePrompt + ", crab, beach, ocean waves, bright blue",
    colorPalette: ["#0f172a", "#1e293b", "#e2e8f0", "#94a3b8"],
    symbolSet: ["Moon", "Pearls", "Calm Water", "Silver glow"],
    compositionNotes: "Emphasize softness, reflection, and lunar energy.",
    preferredAspectRatios: { avatar: "1:1", cover: "16:9", post: "4:5" }
  },
  {
    id: "leo",
    displayName: "Лев ♌️ Гороскоп",
    emoji: "♌️",
    avatarPrompt: "Elegant glowing golden sun corona over dark slate background, luxury mystic style, cinematic light, royal aura, 8k, photorealistic",
    coverPrompt: "Wide shot of an elegant glowing golden sun corona over dark slate background, luxury mystic style, cinematic light",
    dailyPostImagePrompt: "Abstract representation of Leo energy, solar flares, golden rays, dark slate background, premium mystic style",
    negativePrompt: globalNegativePrompt + ", lion face, roaring, safari, bright yellow",
    colorPalette: ["#451a03", "#78350f", "#fbbf24", "#fef3c7"],
    symbolSet: ["Sun", "Corona", "Gold rays", "Crown motif"],
    compositionNotes: "Emphasize central focus, radial symmetry, and radiant warmth.",
    preferredAspectRatios: { avatar: "1:1", cover: "16:9", post: "4:5" }
  },
  {
    id: "virgo",
    displayName: "Дева ♍️ Гороскоп",
    emoji: "♍️",
    avatarPrompt: "Elegant geometric crystal facets glowing with subtle golden light, dark earthy background, perfect symmetry, luxury mystic style, 8k, photorealistic",
    coverPrompt: "Wide shot of elegant geometric crystal facets glowing with subtle golden light, dark earthy background, luxury mystic style",
    dailyPostImagePrompt: "Abstract representation of Virgo energy, perfect geometry, golden light, earthly tones, premium mystic style",
    negativePrompt: globalNegativePrompt + ", woman, virgin, wheat field, messy",
    colorPalette: ["#14532d", "#166534", "#d97706", "#0f172a"],
    symbolSet: ["Crystals", "Geometry", "Subtle light", "Earthy tones"],
    compositionNotes: "Emphasize precision, clean lines, and geometric perfection.",
    preferredAspectRatios: { avatar: "1:1", cover: "16:9", post: "4:5" }
  },
  {
    id: "libra",
    displayName: "Весы ♎️ Гороскоп",
    emoji: "♎️",
    avatarPrompt: "Elegant golden balance scales floating in dark velvet space, soft atmospheric light, perfect equilibrium, luxury mystic style, 8k, photorealistic",
    coverPrompt: "Wide shot of an elegant glowing equilibrium line in dark velvet space, soft atmospheric light, luxury mystic style",
    dailyPostImagePrompt: "Abstract representation of Libra energy, perfect balance, soft light, velvet background, premium mystic style",
    negativePrompt: globalNegativePrompt + ", judge, law, brass scales, unbalanced",
    colorPalette: ["#2e1065", "#4c1d95", "#fbcfe8", "#fbbf24"],
    symbolSet: ["Scales", "Equilibrium lines", "Velvet textures", "Soft pink/gold"],
    compositionNotes: "Emphasize perfect balance, elegance, and soft blending.",
    preferredAspectRatios: { avatar: "1:1", cover: "16:9", post: "4:5" }
  },
  {
    id: "scorpio",
    displayName: "Скорпион ♏️ Гороскоп",
    emoji: "♏️",
    avatarPrompt: "Elegant dark liquid surface with deep crimson bioluminescence, mysterious atmosphere, luxury mystic style, cinematic shadows, 8k, photorealistic",
    coverPrompt: "Wide shot of an elegant dark liquid surface with deep crimson bioluminescence, mysterious atmosphere, luxury mystic style",
    dailyPostImagePrompt: "Abstract representation of Scorpio energy, deep shadows, crimson glow, dark liquid, premium mystic style",
    negativePrompt: globalNegativePrompt + ", scorpion bug, desert, scary, skull",
    colorPalette: ["#2a0a18", "#4c0519", "#9f1239", "#020617"],
    symbolSet: ["Dark liquid", "Crimson glow", "Deep shadows", "Bioluminescence"],
    compositionNotes: "Emphasize mystery, depth, and intense hidden energy.",
    preferredAspectRatios: { avatar: "1:1", cover: "16:9", post: "4:5" }
  },
  {
    id: "sagittarius",
    displayName: "Стрелец ♐️ Гороскоп",
    emoji: "♐️",
    avatarPrompt: "Elegant glowing golden arrow pointing up in dark starry space, dynamic angle, luxury mystic style, cinematic light trails, 8k, photorealistic",
    coverPrompt: "Wide shot of an elegant glowing golden arrow pointing across dark starry space, dynamic angle, luxury mystic style",
    dailyPostImagePrompt: "Abstract representation of Sagittarius energy, forward momentum, golden light trails, stardust, premium mystic style",
    negativePrompt: globalNegativePrompt + ", centaur, bow and arrow, hunting, horse",
    colorPalette: ["#1e1b4b", "#312e81", "#f59e0b", "#e0e7ff"],
    symbolSet: ["Arrow", "Light trails", "Stars", "Momentum"],
    compositionNotes: "Emphasize direction, expansion, and dynamic energy.",
    preferredAspectRatios: { avatar: "1:1", cover: "16:9", post: "4:5" }
  },
  {
    id: "capricorn",
    displayName: "Козерог ♑️ Гороскоп",
    emoji: "♑️",
    avatarPrompt: "Elegant dark mountain peak touched by golden starlight, majestic structure, luxury mystic style, deep shadows, 8k, photorealistic",
    coverPrompt: "Wide shot of an elegant dark mountain range touched by golden starlight, majestic structure, luxury mystic style",
    dailyPostImagePrompt: "Abstract representation of Capricorn energy, solid structures, elevation, starlight, premium mystic style",
    negativePrompt: globalNegativePrompt + ", goat, fish tail, bright day, snow peak",
    colorPalette: ["#020617", "#0f172a", "#334155", "#fbbf24"],
    symbolSet: ["Mountain peaks", "Starlight", "Solid rock", "Geometric angles"],
    compositionNotes: "Emphasize structure, ambition, and timeless solidity.",
    preferredAspectRatios: { avatar: "1:1", cover: "16:9", post: "4:5" }
  },
  {
    id: "aquarius",
    displayName: "Водолей ♒️ Гороскоп",
    emoji: "♒️",
    avatarPrompt: "Elegant electric blue neon waves rippling in dark space, futuristic subtle glow, luxury mystic style, cinematic light, 8k, photorealistic",
    coverPrompt: "Wide shot of elegant electric blue neon waves rippling in dark space, futuristic subtle glow, luxury mystic style",
    dailyPostImagePrompt: "Abstract representation of Aquarius energy, frequency waves, neon blue glow, dark space, premium mystic style",
    negativePrompt: globalNegativePrompt + ", water jug, person pouring water, lightning bolt",
    colorPalette: ["#082f49", "#0369a1", "#38bdf8", "#020617"],
    symbolSet: ["Waves", "Frequencies", "Neon glow", "Space"],
    compositionNotes: "Emphasize innovation, cosmic frequencies, and ethereal electricity.",
    preferredAspectRatios: { avatar: "1:1", cover: "16:9", post: "4:5" }
  },
  {
    id: "pisces",
    displayName: "Рыбы ♓️ Гороскоп",
    emoji: "♓️",
    avatarPrompt: "Elegant ethereal glowing deep sea mist, iridescent teal and violet light, luxury mystic style, fluid dreamlike motion, 8k, photorealistic",
    coverPrompt: "Wide shot of elegant ethereal glowing deep sea mist, iridescent teal and violet light, luxury mystic style",
    dailyPostImagePrompt: "Abstract representation of Pisces energy, fluid motion, iridescent mist, dreamlike, premium mystic style",
    negativePrompt: globalNegativePrompt + ", two fishes, aquarium, bright ocean, coral reef",
    colorPalette: ["#0f172a", "#1e1b4b", "#2dd4bf", "#818cf8"],
    symbolSet: ["Mist", "Iridescence", "Fluid motion", "Deep space/sea blend"],
    compositionNotes: "Emphasize blending, dreaming, and fluid boundaries.",
    preferredAspectRatios: { avatar: "1:1", cover: "16:9", post: "4:5" }
  }
];
