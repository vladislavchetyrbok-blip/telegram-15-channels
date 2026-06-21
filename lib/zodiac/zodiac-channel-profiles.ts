export interface ZodiacChannelProfile {
  name: string;
  slug: string;
  type: "general" | "sign";
  element?: "Огонь" | "Земля" | "Воздух" | "Вода";
  languageMode: string;
  audience: string;
  contentPositioning: string;
  tone: string;
  dailyRubrics: string[];
  weeklyRubrics?: string[];
  postFormats: string[];
  ctaStyle: string;
  studioFormats: string[];
  safetyNote: string;
  nextStep: string;
  status: string;
}

const defaultLanguageMode = "RU сейчас, UA-адаптация позже";
const defaultAudience = "Широкая аудитория, интересующаяся астрологией";
const defaultSafetyNote = "Публикации отключены. Live-запуск только после отдельного разрешения.";
const defaultStatus = "Подготовка";
const defaultNextStep = "7 дней контента";
const defaultPostFormats = ["Короткий текст", "Картинка + текст", "Опрос"];
const defaultCtaStyle = "CTA в Mini App / совместимость / подписку";
const defaultWeeklyRubrics = ["Итоги недели", "Гороскоп на следующую неделю"];
const defaultStudioFormats = ["Картинка: квадрат", "Картинка: портрет"];

export const zodiacChannelProfiles: ZodiacChannelProfile[] = [
  {
    name: "Общий гороскоп",
    slug: "general",
    type: "general",
    languageMode: defaultLanguageMode,
    audience: defaultAudience,
    contentPositioning: "общий ежедневный и недельный гороскоп для всех знаков",
    tone: "информативный, объединяющий, позитивный",
    dailyRubrics: [
      "Гороскоп дня",
      "Энергия дня",
      "Любовь",
      "Деньги",
      "Совет дня",
      "Число дня",
      "Аффирмация",
      "Знаки в фокусе"
    ],
    weeklyRubrics: defaultWeeklyRubrics,
    postFormats: ["Сводка по всем знакам", "Дайджест", "Инфографика"],
    ctaStyle: defaultCtaStyle,
    studioFormats: [
      "Reels: 3 знака, которым сегодня повезёт",
      "Shorts: Главная энергия дня",
      "Image: Карта дня / общий прогноз"
    ],
    safetyNote: defaultSafetyNote,
    nextStep: defaultNextStep,
    status: defaultStatus,
  },
  {
    name: "Овен",
    slug: "aries",
    type: "sign",
    element: "Огонь",
    languageMode: defaultLanguageMode,
    audience: "Овны (21 марта — 19 апреля)",
    contentPositioning: "энергия, действие, решительность, быстрые решения",
    tone: "прямой, энергичный, мотивирующий",
    dailyRubrics: [
      "День для действий",
      "Где не спешить",
      "Любовь",
      "Деньги",
      "Совет Овну",
      "Аффирмация"
    ],
    weeklyRubrics: defaultWeeklyRubrics,
    postFormats: defaultPostFormats,
    ctaStyle: defaultCtaStyle,
    studioFormats: defaultStudioFormats,
    safetyNote: defaultSafetyNote,
    nextStep: defaultNextStep,
    status: defaultStatus,
  },
  {
    name: "Телец",
    slug: "taurus",
    type: "sign",
    element: "Земля",
    languageMode: defaultLanguageMode,
    audience: "Тельцы (20 апреля — 20 мая)",
    contentPositioning: "стабильность, деньги, комфорт, тело, практичные решения",
    tone: "спокойный, уверенный, практичный",
    dailyRubrics: [
      "Финансовый фокус",
      "Комфорт и ресурс",
      "Любовь",
      "Что не менять резко",
      "Совет Тельцу",
      "Аффирмация"
    ],
    weeklyRubrics: defaultWeeklyRubrics,
    postFormats: defaultPostFormats,
    ctaStyle: defaultCtaStyle,
    studioFormats: defaultStudioFormats,
    safetyNote: defaultSafetyNote,
    nextStep: defaultNextStep,
    status: defaultStatus,
  },
  {
    name: "Близнецы",
    slug: "gemini",
    type: "sign",
    element: "Воздух",
    languageMode: defaultLanguageMode,
    audience: "Близнецы (21 мая — 20 июня)",
    contentPositioning: "общение, новости, идеи, обучение, быстрые контакты",
    tone: "лёгкий, умный, динамичный",
    dailyRubrics: [
      "Разговор дня",
      "Идея дня",
      "Любовь",
      "Деньги",
      "Что уточнить",
      "Аффирмация"
    ],
    weeklyRubrics: defaultWeeklyRubrics,
    postFormats: defaultPostFormats,
    ctaStyle: defaultCtaStyle,
    studioFormats: defaultStudioFormats,
    safetyNote: defaultSafetyNote,
    nextStep: defaultNextStep,
    status: defaultStatus,
  },
  {
    name: "Рак",
    slug: "cancer",
    type: "sign",
    element: "Вода",
    languageMode: defaultLanguageMode,
    audience: "Раки (21 июня — 22 июля)",
    contentPositioning: "эмоции, дом, семья, интуиция, внутренний комфорт",
    tone: "мягкий, поддерживающий, глубокий",
    dailyRubrics: [
      "Эмоциональный фон",
      "Дом и близкие",
      "Любовь",
      "Деньги",
      "Что отпустить",
      "Аффирмация"
    ],
    weeklyRubrics: defaultWeeklyRubrics,
    postFormats: defaultPostFormats,
    ctaStyle: defaultCtaStyle,
    studioFormats: defaultStudioFormats,
    safetyNote: defaultSafetyNote,
    nextStep: defaultNextStep,
    status: defaultStatus,
  },
  {
    name: "Лев",
    slug: "leo",
    type: "sign",
    element: "Огонь",
    languageMode: defaultLanguageMode,
    audience: "Львы (23 июля — 22 августа)",
    contentPositioning: "уверенность, внимание, творчество, лидерство",
    tone: "яркий, уверенный, вдохновляющий",
    dailyRubrics: [
      "Где проявиться",
      "Личная сила",
      "Любовь",
      "Деньги",
      "Ошибка гордости",
      "Аффирмация"
    ],
    weeklyRubrics: defaultWeeklyRubrics,
    postFormats: defaultPostFormats,
    ctaStyle: defaultCtaStyle,
    studioFormats: defaultStudioFormats,
    safetyNote: defaultSafetyNote,
    nextStep: defaultNextStep,
    status: defaultStatus,
  },
  {
    name: "Дева",
    slug: "virgo",
    type: "sign",
    element: "Земля",
    languageMode: defaultLanguageMode,
    audience: "Девы (23 августа — 22 сентября)",
    contentPositioning: "порядок, работа, здоровье, детали, эффективность",
    tone: "точный, спокойный, практичный",
    dailyRubrics: [
      "План дня",
      "Что исправить",
      "Любовь",
      "Деньги",
      "Деталь, которую важно заметить",
      "Аффирмация"
    ],
    weeklyRubrics: defaultWeeklyRubrics,
    postFormats: defaultPostFormats,
    ctaStyle: defaultCtaStyle,
    studioFormats: defaultStudioFormats,
    safetyNote: defaultSafetyNote,
    nextStep: defaultNextStep,
    status: defaultStatus,
  },
  {
    name: "Весы",
    slug: "libra",
    type: "sign",
    element: "Воздух",
    languageMode: defaultLanguageMode,
    audience: "Весы (23 сентября — 22 октября)",
    contentPositioning: "отношения, баланс, красота, переговоры, выбор",
    tone: "эстетичный, дипломатичный, мягкий",
    dailyRubrics: [
      "Баланс дня",
      "Отношения",
      "Любовь",
      "Деньги",
      "Как принять решение",
      "Аффирмация"
    ],
    weeklyRubrics: defaultWeeklyRubrics,
    postFormats: defaultPostFormats,
    ctaStyle: defaultCtaStyle,
    studioFormats: defaultStudioFormats,
    safetyNote: defaultSafetyNote,
    nextStep: defaultNextStep,
    status: defaultStatus,
  },
  {
    name: "Скорпион",
    slug: "scorpio",
    type: "sign",
    element: "Вода",
    languageMode: defaultLanguageMode,
    audience: "Скорпионы (23 октября — 21 ноября)",
    contentPositioning: "глубина, трансформация, сила, тайные мотивы, страсть",
    tone: "глубокий, сильный, мистический",
    dailyRubrics: [
      "Внутренняя сила",
      "Что скрыто",
      "Любовь",
      "Деньги",
      "Где не давить",
      "Аффирмация"
    ],
    weeklyRubrics: defaultWeeklyRubrics,
    postFormats: defaultPostFormats,
    ctaStyle: defaultCtaStyle,
    studioFormats: defaultStudioFormats,
    safetyNote: defaultSafetyNote,
    nextStep: defaultNextStep,
    status: defaultStatus,
  },
  {
    name: "Стрелец",
    slug: "sagittarius",
    type: "sign",
    element: "Огонь",
    languageMode: defaultLanguageMode,
    audience: "Стрельцы (22 ноября — 21 декабря)",
    contentPositioning: "свобода, движение, обучение, поездки, новые горизонты",
    tone: "оптимистичный, широкий, вдохновляющий",
    dailyRubrics: [
      "Возможность дня",
      "Куда двигаться",
      "Любовь",
      "Деньги",
      "Что расширить",
      "Аффирмация"
    ],
    weeklyRubrics: defaultWeeklyRubrics,
    postFormats: defaultPostFormats,
    ctaStyle: defaultCtaStyle,
    studioFormats: defaultStudioFormats,
    safetyNote: defaultSafetyNote,
    nextStep: defaultNextStep,
    status: defaultStatus,
  },
  {
    name: "Козерог",
    slug: "capricorn",
    type: "sign",
    element: "Земля",
    languageMode: defaultLanguageMode,
    audience: "Козероги (22 декабря — 19 января)",
    contentPositioning: "цели, работа, статус, дисциплина, долгий результат",
    tone: "серьёзный, структурный, деловой",
    dailyRubrics: [
      "Цель дня",
      "Работа и статус",
      "Любовь",
      "Деньги",
      "Что укрепить",
      "Аффирмация"
    ],
    weeklyRubrics: defaultWeeklyRubrics,
    postFormats: defaultPostFormats,
    ctaStyle: defaultCtaStyle,
    studioFormats: defaultStudioFormats,
    safetyNote: defaultSafetyNote,
    nextStep: defaultNextStep,
    status: defaultStatus,
  },
  {
    name: "Водолей",
    slug: "aquarius",
    type: "sign",
    element: "Воздух",
    languageMode: defaultLanguageMode,
    audience: "Водолеи (20 января — 18 февраля)",
    contentPositioning: "идеи, технологии, свобода, друзья, нестандартные решения",
    tone: "свободный, интеллектуальный, необычный",
    dailyRubrics: [
      "Идея дня",
      "Нестандартный ход",
      "Любовь",
      "Деньги",
      "Что обновить",
      "Аффирмация"
    ],
    weeklyRubrics: defaultWeeklyRubrics,
    postFormats: defaultPostFormats,
    ctaStyle: defaultCtaStyle,
    studioFormats: defaultStudioFormats,
    safetyNote: defaultSafetyNote,
    nextStep: defaultNextStep,
    status: defaultStatus,
  },
  {
    name: "Рыбы",
    slug: "pisces",
    type: "sign",
    element: "Вода",
    languageMode: defaultLanguageMode,
    audience: "Рыбы (19 февраля — 20 марта)",
    contentPositioning: "интуиция, мечты, чувства, творчество, тонкое восприятие",
    tone: "мягкий, мистический, образный",
    dailyRubrics: [
      "Интуиция дня",
      "Сон / знак / ощущение",
      "Любовь",
      "Деньги",
      "Что почувствовать",
      "Аффирмация"
    ],
    weeklyRubrics: defaultWeeklyRubrics,
    postFormats: defaultPostFormats,
    ctaStyle: defaultCtaStyle,
    studioFormats: defaultStudioFormats,
    safetyNote: defaultSafetyNote,
    nextStep: defaultNextStep,
    status: defaultStatus,
  }
];
