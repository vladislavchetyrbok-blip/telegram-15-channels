export interface ZodiacChannelLaunchInfo {
  id: string;
  displayName: string;
  emoji: string;
  primaryUsernameSuggestion: string;
  alternativeUsernameSuggestions: string[];
  description: string;
  pinnedMessageDraft: string;
  avatarPrompt: string;
  coverPrompt: string;
  status: "needs_creation";
}

export const zodiacLaunchKit: ZodiacChannelLaunchInfo[] = [
  {
    id: "zodiac-general",
    displayName: "Гороскоп на сегодня ✨",
    emoji: "✨",
    primaryUsernameSuggestion: "zodiac_orbit",
    alternativeUsernameSuggestions: ["zodiac_pulse", "zodiac_today", "zodiac_cosmic"],
    description: "Общая энергия дня и короткий навигатор по всем 12 знакам. Только суть и спокойный контроль.",
    pinnedMessageDraft: "Добро пожаловать в Гороскоп на сегодня ✨\n\nЗдесь нет шума и дешевой мистики. Только точная энергия дня, которую можно применить прямо сейчас. Выберите свой знак в меню и читайте, что важно.",
    avatarPrompt: "Luxury mystic zodiac wheel, cosmic gold details on deep black and violet background, minimalist and premium logo, cinematic light, 8k.",
    coverPrompt: "Premium Telegram magazine cover, dark blue and gold starry night, subtle astrological symbols, elegant and moody.",
    status: "needs_creation"
  },
  {
    id: "aries",
    displayName: "Овен ♈️ Гороскоп",
    emoji: "♈️",
    primaryUsernameSuggestion: "aries_orbit",
    alternativeUsernameSuggestions: ["aries_pulse", "aries_today", "aries_cosmic"],
    description: "Персональный канал для Овнов. Прямо, уверенно и по делу. Действие, помноженное на выдержку.",
    pinnedMessageDraft: "Привет, Овен ♈️\n\nТвоя сила — в импульсе, но этот канал научит тебя делать его точным. Читаем каждый день, выбираем главное и не тратим энергию впустую.",
    avatarPrompt: "Aries symbol, luxury mystic portrait style, dark red and gold energy, cinematic lighting, premium dark zodiac aesthetic, minimal logo.",
    coverPrompt: "Aries fire and armor textures, black and gold, premium dark magazine banner.",
    status: "needs_creation"
  },
  {
    id: "taurus",
    displayName: "Телец ♉️ Гороскоп",
    emoji: "♉️",
    primaryUsernameSuggestion: "taurus_orbit",
    alternativeUsernameSuggestions: ["taurus_pulse", "taurus_today", "taurus_cosmic"],
    description: "Персональный канал для Тельцов. Спокойная сила, устойчивость и премиальный подход к жизни.",
    pinnedMessageDraft: "Привет, Телец ♉️\n\nСуета нам не подходит. Здесь мы закрепляем результаты, сохраняем комфорт и не делаем резких движений. Твой ежедневный фокус.",
    avatarPrompt: "Taurus symbol, earth and stone textures, gold accents, calm power, luxury stillness, dark cinematic logo.",
    coverPrompt: "Taurus premium aesthetic banner, dark marble, gold lines, calm power.",
    status: "needs_creation"
  },
  {
    id: "gemini",
    displayName: "Близнецы ♊️ Гороскоп",
    emoji: "♊️",
    primaryUsernameSuggestion: "gemini_orbit",
    alternativeUsernameSuggestions: ["gemini_pulse", "gemini_today", "gemini_cosmic"],
    description: "Персональный канал для Близнецов. Элегантная двойственность, идеи и точный фокус в море информации.",
    pinnedMessageDraft: "Привет, Близнецы ♊️\n\nИнформации много, но важна только суть. Здесь каждый день мы фильтруем шум и оставляем те мысли, которые работают на тебя.",
    avatarPrompt: "Gemini symbol, mirror reflections, elegant duality, violet-blue shadows, gold lines, dark premium logo.",
    coverPrompt: "Gemini air movement abstract, dark blue and gold, premium editorial banner.",
    status: "needs_creation"
  },
  {
    id: "cancer",
    displayName: "Рак ♋️ Гороскоп",
    emoji: "♋️",
    primaryUsernameSuggestion: "cancer_orbit",
    alternativeUsernameSuggestions: ["cancer_pulse", "cancer_today", "cancer_cosmic"],
    description: "Персональный канал для Раков. Защита, глубина и тонкое чувствование пространства.",
    pinnedMessageDraft: "Привет, Рак ♋️\n\nВнешний мир бывает громким, поэтому мы создали тихое место. Твои ежедневные ориентиры для внутреннего равновесия и силы.",
    avatarPrompt: "Cancer symbol, moon over dark water, silver-blue light, soft protective atmosphere, premium mystic logo.",
    coverPrompt: "Cancer silver and blue soft light abstract, premium dreamy aesthetic banner.",
    status: "needs_creation"
  },
  {
    id: "leo",
    displayName: "Лев ♌️ Гороскоп",
    emoji: "♌️",
    primaryUsernameSuggestion: "leo_orbit",
    alternativeUsernameSuggestions: ["leo_pulse", "leo_today", "leo_cosmic"],
    description: "Персональный канал для Львов. Достоинство, свет и сцена без лишнего давления.",
    pinnedMessageDraft: "Привет, Лев ♌️\n\nТебе не нужно доказывать свое присутствие, оно уже ощущается. Здесь мы настраиваем твой внутренний компас для максимальной уверенности каждый день.",
    avatarPrompt: "Leo symbol, sun and crown, theatrical stage light, royal gold on black, luxury magazine logo.",
    coverPrompt: "Leo royal gold abstract, stage lighting, premium dark banner.",
    status: "needs_creation"
  },
  {
    id: "virgo",
    displayName: "Дева ♍️ Гороскоп",
    emoji: "♍️",
    primaryUsernameSuggestion: "virgo_orbit",
    alternativeUsernameSuggestions: ["virgo_pulse", "virgo_today", "virgo_cosmic"],
    description: "Персональный канал для Дев. Чистая структура, порядок и ювелирная точность в делах.",
    pinnedMessageDraft: "Привет, Дева ♍️\n\nКогда всё на своих местах, ты непобедим. Каждый день мы убираем лишнее и находим точный фокус для работы, денег и отношений.",
    avatarPrompt: "Virgo symbol, marble, clean structure, refined gold details, black and gold cinematic precision logo.",
    coverPrompt: "Virgo precise geometry, dark marble and gold, premium luxury banner.",
    status: "needs_creation"
  },
  {
    id: "libra",
    displayName: "Весы ♎️ Гороскоп",
    emoji: "♎️",
    primaryUsernameSuggestion: "libra_orbit",
    alternativeUsernameSuggestions: ["libra_pulse", "libra_today", "libra_cosmic"],
    description: "Персональный канал для Весов. Эстетика, баланс и искусство правильного выбора.",
    pinnedMessageDraft: "Привет, Весы ♎️\n\nТвоя сила — в балансе. Здесь мы каждый день настраиваем твою гармонию, помогая делать выбор без сомнений и лишнего стресса.",
    avatarPrompt: "Libra symbol, balance scales, symmetry, soft gold and violet light, premium mystic logo.",
    coverPrompt: "Libra symmetrical aesthetics, soft cosmic light, luxury editorial banner.",
    status: "needs_creation"
  },
  {
    id: "scorpio",
    displayName: "Скорпион ♏️ Гороскоп",
    emoji: "♏️",
    primaryUsernameSuggestion: "scorpio_orbit",
    alternativeUsernameSuggestions: ["scorpio_pulse", "scorpio_today", "scorpio_cosmic"],
    description: "Персональный канал для Скорпионов. Магнетизм, глубина и сдержанная интенсивность.",
    pinnedMessageDraft: "Привет, Скорпион ♏️\n\nЗдесь нет поверхностных советов. Твой ежедневный компас для тех дней, когда нужно включить свою главную силу на максимум.",
    avatarPrompt: "Scorpio symbol, shadow and dark red depth, magnetic mystery, black-gold zodiac atmosphere, premium logo.",
    coverPrompt: "Scorpio deep shadows and red accents, premium mysterious aesthetic banner.",
    status: "needs_creation"
  },
  {
    id: "sagittarius",
    displayName: "Стрелец ♐️ Гороскоп",
    emoji: "♐️",
    primaryUsernameSuggestion: "sagittarius_orbit",
    alternativeUsernameSuggestions: ["sagittarius_pulse", "sagittarius_today", "sagittarius_cosmic"],
    description: "Персональный канал для Стрельцов. Движение, горизонт и честный вызов.",
    pinnedMessageDraft: "Привет, Стрелец ♐️\n\nДорога открыта. Здесь мы каждый день выбираем лучшую цель и не размениваемся на мелочи. Твой точный прицел.",
    avatarPrompt: "Sagittarius symbol, arrow toward horizon, gold trail on dark blue sky, premium mystic logo.",
    coverPrompt: "Sagittarius fire and movement abstract, premium cosmic background.",
    status: "needs_creation"
  },
  {
    id: "capricorn",
    displayName: "Козерог ♑️ Гороскоп",
    emoji: "♑️",
    primaryUsernameSuggestion: "capricorn_orbit",
    alternativeUsernameSuggestions: ["capricorn_pulse", "capricorn_today", "capricorn_cosmic"],
    description: "Персональный канал для Козерогов. Дисциплина, статус и тихая уверенность лидера.",
    pinnedMessageDraft: "Привет, Козерог ♑️\n\nТолько фундамент и стратегия. Твой ежедневный чек-лист для укрепления позиции в делах, финансах и жизни.",
    avatarPrompt: "Capricorn symbol, black-gold zodiac architecture, discipline and status, premium cinematic logo.",
    coverPrompt: "Capricorn strong vertical lines, dark marble, luxury editorial banner.",
    status: "needs_creation"
  },
  {
    id: "aquarius",
    displayName: "Водолей ♒️ Гороскоп",
    emoji: "♒️",
    primaryUsernameSuggestion: "aquarius_orbit",
    alternativeUsernameSuggestions: ["aquarius_pulse", "aquarius_today", "aquarius_cosmic"],
    description: "Персональный канал для Водолеев. Идеи, свежий воздух и взгляд в будущее.",
    pinnedMessageDraft: "Привет, Водолей ♒️\n\nМы не смотрим назад. Здесь твой ежедневный импульс для новых идей, свободы и интеллектуального движения.",
    avatarPrompt: "Aquarius symbol, electric blue neon, dark cosmic background, gold accents, premium futurism logo.",
    coverPrompt: "Aquarius abstract electric waves, dark space, premium mystic banner.",
    status: "needs_creation"
  },
  {
    id: "pisces",
    displayName: "Рыбы ♓️ Гороскоп",
    emoji: "♓️",
    primaryUsernameSuggestion: "pisces_orbit",
    alternativeUsernameSuggestions: ["pisces_pulse", "pisces_today", "pisces_cosmic"],
    description: "Персональный канал для Рыб. Интуиция, тонкие настройки и мягкое движение.",
    pinnedMessageDraft: "Привет, Рыбы ♓️\n\nТвоя интуиция не ошибается, если ей не мешать. Твой ежедневный навигатор в море событий: чувствуй, наблюдай и плыви уверенно.",
    avatarPrompt: "Pisces symbol, dream fog, violet-blue intuition, dark zodiac shimmer, soft light premium logo.",
    coverPrompt: "Pisces ethereal water reflection, soft cosmic light, premium banner.",
    status: "needs_creation"
  }
];
