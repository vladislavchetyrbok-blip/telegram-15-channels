import { dateInputToIsoDate, parseDateInput } from "./zodiac-date-input";
import { isBirthDateInAllowedRange } from "./zodiac-birth-date-range";

export type ZodiacSignId = "aries" | "taurus" | "gemini" | "cancer" | "leo" | "virgo" | "libra" | "scorpio" | "sagittarius" | "capricorn" | "aquarius" | "pisces";

function safeHashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function pickRandomly<T>(arr: T[], seed: string): T {
  const hash = safeHashString(seed);
  return arr[hash % arr.length];
}

export interface MysticDailyCard {
  title: string;
  theme: string;
  love: string;
  money: string;
  action: string;
  avoid: string;
  phrase: string;
  advice: string;
}

const dailyCardThemes = [
  "Новые начинания", "Поиск баланса", "Время для себя", "Энергия созидания", "Преодоление препятствий",
  "Глубокие размышления", "Открытость новому", "Спокойствие ума", "Внутренняя сила", "Вдохновение и творчество"
];

const dailyCardLoves = [
  "Проявите нежность и внимание", "Слушайте свое сердце", "Символически отпустите старые обиды",
  "Открыто говорите о чувствах", "Время для романтического жеста", "Ищите гармонию в диалоге"
];

const dailyCardMoneys = [
  "Фокус на долгосрочных планах", "Избегайте импульсивных трат", "Хороший день для новых идей",
  "Проявите терпение в делах", "Организуйте свое рабочее пространство", "Символически пересмотрите свои ресурсы"
];

export function generateDailyCard(dateKey: string, signId: ZodiacSignId): MysticDailyCard {
  const seed = `dailyCard:${dateKey}:${signId}`;
  return {
    title: pickRandomly(["Карта Солнца", "Карта Луны", "Карта Звезды", "Карта Пути", "Карта Мудрости", "Карта Силы"], seed + "title"),
    theme: pickRandomly(dailyCardThemes, seed + "theme"),
    love: pickRandomly(dailyCardLoves, seed + "love"),
    money: pickRandomly(dailyCardMoneys, seed + "money"),
    action: pickRandomly(["Сделайте шаг навстречу страхам", "Запишите свои мысли", "Проведите время на природе", "Наведите порядок", "Медитируйте 10 минут"], seed + "action"),
    avoid: pickRandomly(["Спешки", "Споров по мелочам", "Самокритики", "Переутомления", "Пустых разговоров"], seed + "avoid"),
    phrase: pickRandomly(["Я доверяю процессу", "Моя энергия принадлежит мне", "Я выбираю спокойствие", "Каждый шаг важен"], seed + "phrase"),
    advice: pickRandomly(["Слушайте интуицию", "Не торопите события", "Будьте мягче к себе", "Действуйте уверенно"], seed + "advice"),
  };
}

export interface MysticTarotCard {
  card: string;
  mainMeaning: string;
  lightSide: string;
  shadowSide: string;
  love: string;
  money: string;
  advice: string;
  phrase: string;
}

const tarotMajorArcana: MysticTarotCard[] = [
  { card: "Шут (0)", mainMeaning: "Новое начало, спонтанность, шаг в неизвестность", lightSide: "Открытость, доверие миру", shadowSide: "Безрассудство, наивность", love: "Легкость, новые знакомства", money: "Рискованные, но интересные идеи", advice: "Позвольте себе быть легким", phrase: "Каждый шаг - это новое приключение" },
  { card: "Маг (I)", mainMeaning: "Действие, инициатива, мастерство", lightSide: "Уверенность в своих силах, ресурсность", shadowSide: "Манипуляции, нереализованный потенциал", love: "Активные шаги, инициатива", money: "Время действовать и применять навыки", advice: "Возьмите ситуацию в свои руки", phrase: "У меня есть все необходимое" },
  { card: "Жрица (II)", mainMeaning: "Интуиция, скрытые знания, пассивность", lightSide: "Глубокое понимание, внутренний голос", shadowSide: "Иллюзии, скрытность", love: "Тайные чувства, духовная связь", money: "Не спешите, наблюдайте", advice: "Прислушайтесь к интуиции", phrase: "Мой внутренний голос знает ответ" },
  { card: "Императрица (III)", mainMeaning: "Изобилие, забота, творчество", lightSide: "Плодородие, красота, гармония", shadowSide: "Чрезмерная опека, застой", love: "Забота, тепло, расцвет чувств", money: "Финансовое благополучие, рост проектов", advice: "Окружите себя красотой и заботой", phrase: "Я принимаю изобилие мира" },
  { card: "Император (IV)", mainMeaning: "Структура, порядок, авторитет", lightSide: "Стабильность, ответственность, защита", shadowSide: "Упрямство, контроль", love: "Надежность, серьезные намерения", money: "Четкий план, дисциплина, порядок", advice: "Действуйте последовательно и логично", phrase: "Я создаю надежный фундамент" },
  { card: "Иерофант (V)", mainMeaning: "Традиции, обучение, духовный поиск", lightSide: "Мудрость, передача опыта, вера", shadowSide: "Догматизм, жесткие рамки", love: "Традиционные ценности, духовное родство", money: "Следование правилам, обучение", advice: "Ищите смысл и поступайте по совести", phrase: "Я открыт для новых знаний" },
  { card: "Влюбленные (VI)", mainMeaning: "Выбор, партнерство, искренность", lightSide: "Гармония, искренняя привязанность", shadowSide: "Нерешительность, внутренний конфликт", love: "Глубокая связь, важный выбор", money: "Взаимовыгодное сотрудничество", advice: "Делайте выбор сердцем", phrase: "Я выбираю любовь и гармонию" },
  { card: "Колесница (VII)", mainMeaning: "Движение, преодоление, фокус", lightSide: "Победа, целеустремленность, контроль", shadowSide: "Спешка, отсутствие направления", love: "Динамичное развитие, совместные цели", money: "Прорыв, активное продвижение", advice: "Двигайтесь вперед, не отвлекаясь", phrase: "Я уверенно иду к своей цели" },
  { card: "Сила (VIII)", mainMeaning: "Внутренняя опора, мягкость, смелость", lightSide: "Терпение, мягкое влияние, принятие", shadowSide: "Подавление, слабость, страх", love: "Страсть, принятие недостатков", money: "Преодоление трудностей без агрессии", advice: "Действуйте мягко, но уверенно", phrase: "Моя истинная сила во внутреннем покое" },
  { card: "Отшельник (IX)", mainMeaning: "Уединение, поиск истины, мудрость", lightSide: "Самопознание, глубокий анализ", shadowSide: "Изоляция, избегание проблем", love: "Потребность в личном пространстве", money: "Осторожность, анализ опыта", advice: "Уделите время себе и своим мыслям", phrase: "Свет истины находится внутри" },
  { card: "Колесо Фортуны (X)", mainMeaning: "Перемены, циклы, удача", lightSide: "Позитивные сдвиги, новые возможности", shadowSide: "Сопротивление переменам, нестабильность", love: "Неожиданный поворот, фатализм", money: "Шанс, случайность, перемены на рынке", advice: "Примите изменчивость жизни", phrase: "Я открыт для счастливых случайностей" },
  { card: "Справедливость (XI)", mainMeaning: "Баланс, объективность, последствия", lightSide: "Честность, ясность, ответственность", shadowSide: "Предвзятость, суровость", love: "Равноправие, объективный взгляд", money: "Честные сделки, оформление документов", advice: "Взвесьте все за и против", phrase: "Мои действия определяют результат" },
  { card: "Повешенный (XII)", mainMeaning: "Пауза, иной взгляд, отпускание", lightSide: "Новая перспектива, добровольная остановка", shadowSide: "Жертвенность, застревание", love: "Переосмысление, время ожидания", money: "Необходимость изменить подход", advice: "Посмотрите на ситуацию под другим углом", phrase: "Я отпускаю то, что мне не служит" },
  { card: "Смерть (XIII)", mainMeaning: "Трансформация, завершение, переход", lightSide: "Освобождение места для нового", shadowSide: "Страх перемен, цепляние за прошлое", love: "Окончание старого этапа, обновление", money: "Символическое закрытие долгов или проектов", advice: "Позвольте старому уйти", phrase: "Завершение — это начало нового" },
  { card: "Умеренность (XIV)", mainMeaning: "Баланс, исцеление, компромисс", lightSide: "Гармония, золотая середина", shadowSide: "Крайности, нетерпение", love: "Спокойствие, взаимопонимание", money: "Стабильность, постепенный рост", advice: "Избегайте крайностей", phrase: "Я нахожу свой идеальный баланс" },
  { card: "Дьявол (XV)", mainMeaning: "Теневая сторона, привязанности, материальное", lightSide: "Осознание своих слабостей, страсть", shadowSide: "Зависимости, токсичность, жадность", love: "Сильное влечение, но возможна зависимость", money: "Искушения, большие амбиции", advice: "Осознайте свои истинные мотивы", phrase: "Я признаю и контролирую свои тени" },
  { card: "Башня (XVI)", mainMeaning: "Резкие перемены, разрушение иллюзий", lightSide: "Освобождение от ложного, прояснение", shadowSide: "Шок, кризис, сопротивление", love: "Кризис, ведущий к честности", money: "Неожиданные расходы, смена планов", advice: "Не цепляйтесь за разрушающееся", phrase: "Я строю на прочном фундаменте" },
  { card: "Звезда (XVII)", mainMeaning: "Надежда, вдохновение, исцеление", lightSide: "Вера в лучшее, ясное видение", shadowSide: "Оторванность от реальности", love: "Идеализм, глубокая духовная связь", money: "Перспективные проекты, удача", advice: "Верьте в свои мечты", phrase: "Мой путь освещен надеждой" },
  { card: "Луна (XVIII)", mainMeaning: "Иллюзии, подсознание, тревоги", lightSide: "Творчество, богатая интуиция", shadowSide: "Страхи, обман, запутанность", love: "Недосказанность, эмоциональные качели", money: "Неясность, скрытые факторы", advice: "Не принимайте решения в страхе", phrase: "Я прохожу сквозь туман с доверием" },
  { card: "Солнце (XIX)", mainMeaning: "Радость, успех, ясность", lightSide: "Жизнелюбие, энергия, открытость", shadowSide: "Эгоизм, выгорание", love: "Тепло, искренность, счастье", money: "Успех, процветание, признание", advice: "Наслаждайтесь моментом и светите", phrase: "Моя жизнь полна света" },
  { card: "Суд (XX)", mainMeaning: "Пробуждение, итог, трансформация", lightSide: "Возрождение, освобождение, ясность", shadowSide: "Самоосуждение, нерешительность", love: "Переход на новый уровень, честность", money: "Завершение важного этапа, итоги", advice: "Сделайте выводы и двигайтесь дальше", phrase: "Я готов к обновлению" },
  { card: "Мир (XXI)", mainMeaning: "Завершение, целостность, гармония", lightSide: "Достижение цели, полнота жизни", shadowSide: "Остановка перед финишем", love: "Глубокая гармония, принятие", money: "Успешное завершение проекта, триумф", advice: "Празднуйте свои достижения", phrase: "Я в гармонии с миром" }
];

export function generateTarotDay(dateKey: string, signId: ZodiacSignId): MysticTarotCard {
  const seed = `tarot:${dateKey}:${signId}`;
  return pickRandomly(tarotMajorArcana, seed);
}

export interface MysticRuneDay {
  symbol: string;
  name: string;
  mainMeaning: string;
  power: string;
  risk: string;
  love: string;
  money: string;
  advice: string;
}

const runesFuthark: MysticRuneDay[] = [
  { symbol: "ᚠ", name: "Феху", mainMeaning: "Символизирует ресурсы, богатство и энергию начинаний.", power: "Привлечение материального, созидание.", risk: "Жадность, привязанность к вещам.", love: "Ценность отношений, стабильность.", money: "Улучшение финансового потока.", advice: "Инвестируйте энергию с умом." },
  { symbol: "ᚢ", name: "Уруз", mainMeaning: "Символизирует жизненную силу, здоровье и упорство.", power: "Выносливость, преодоление препятствий.", risk: "Упрямство, неконтролируемая сила.", love: "Сильное влечение, страсть.", money: "Требуется настойчивость.", advice: "Используйте свою внутреннюю силу экологично." },
  { symbol: "ᚦ", name: "Турисаз", mainMeaning: "Символизирует защиту, волю и расчистку пути.", power: "Решительность, устранение преград.", risk: "Агрессия, импульсивность.", love: "Резкие разговоры, прояснение.", money: "Прорыв в делах.", advice: "Действуйте, но обдумывайте последствия." },
  { symbol: "ᚨ", name: "Ансуз", mainMeaning: "Символизирует коммуникацию, знаки и знания.", power: "Мудрость, убедительность.", risk: "Сплетни, недопонимание.", love: "Важный диалог, искренность.", money: "Успешные переговоры.", advice: "Слушайте и будьте услышаны." },
  { symbol: "ᚱ", name: "Райдо", mainMeaning: "Символизирует движение, путь и развитие.", power: "Прогресс, целенаправленность.", risk: "Спешка, сбитый ориентир.", love: "Совместный путь, развитие.", money: "Успешные поездки и проекты.", advice: "Держите курс на свою цель." },
  { symbol: "ᚲ", name: "Кеназ", mainMeaning: "Символизирует озарение, творчество и ясность.", power: "Раскрытие талантов, понимание.", risk: "Выгорание, чрезмерная страсть.", love: "Тепло, новые искры чувств.", money: "Творческий подход к работе.", advice: "Освещайте свой путь знаниями." },
  { symbol: "ᚷ", name: "Гебо", mainMeaning: "Символизирует партнерство, дар и равновесие.", power: "Гармоничный обмен энергией.", risk: "Зависимость, дисбаланс в отдаче.", love: "Взаимность, укрепление союза.", money: "Выгодное партнерство.", advice: "Ищите баланс брать и давать." },
  { symbol: "ᚹ", name: "Вуньо", mainMeaning: "Символизирует радость, успех и благополучие.", power: "Позитивный настрой, свершение.", risk: "Иллюзии, погоня за удовольствиями.", love: "Счастье, легкое общение.", money: "Удовлетворение результатами.", advice: "Радуйтесь моменту." },
  { symbol: "ᚺ", name: "Хагалаз", mainMeaning: "Символизирует очищение через перемены, разрушение старого.", power: "Освобождение пространства.", risk: "Сопротивление неизбежному.", love: "Символический кризис для обновления.", money: "Смена планов.", advice: "Примите перемены как возможность." },
  { symbol: "ᚾ", name: "Наутиз", mainMeaning: "Символизирует необходимость, терпение и ограничения.", power: "Стойкость в трудных условиях.", risk: "Уныние, ощущение нехватки.", love: "Потребность во внимании, проверка на прочность.", money: "Режим экономии, фокус на главном.", advice: "Проявите терпение." },
  { symbol: "ᛁ", name: "Иса", mainMeaning: "Символизирует паузу, стабильность и заморозку.", power: "Спокойствие, сохранение энергии.", risk: "Застой, отчужденность.", love: "Охлаждение, личное пространство.", money: "Остановка для анализа.", advice: "Не торопите события." },
  { symbol: "ᛃ", name: "Йера", mainMeaning: "Символизирует урожай, цикл и результат труда.", power: "Закономерный успех.", risk: "Нетерпение получить все сразу.", love: "Созревание чувств.", money: "Получение заслуженной награды.", advice: "Всё приходит в свое время." },
  { symbol: "ᛇ", name: "Эйваз", mainMeaning: "Символизирует ось, трансформацию и внутреннюю опору.", power: "Связь с глубинным Я, защита.", risk: "Застревание между прошлым и будущим.", love: "Глубокая трансформация связи.", money: "Смена направления.", advice: "Опирайтесь на свой внутренний стержень." },
  { symbol: "ᛈ", name: "Пертро", mainMeaning: "Символизирует тайну, скрытый потенциал и судьбу.", power: "Интуиция, неожиданные открытия.", risk: "Раскрытие секретов, азарт.", love: "Загадочность, скрытые симпатии.", money: "Неожиданный доход.", advice: "Доверьтесь невидимым процессам." },
  { symbol: "ᛉ", name: "Альгиз", mainMeaning: "Символизирует защиту, покровительство и духовность.", power: "Безопасность, связь с высшим.", risk: "Потеря бдительности.", love: "Забота, безопасное пространство.", money: "Надежные инвестиции.", advice: "Следуйте за своим компасом." },
  { symbol: "ᛊ", name: "Совило", mainMeaning: "Символизирует солнце, победу и ясность.", power: "Энергия успеха, исцеление.", risk: "Эгоизм, выгорание.", love: "Яркие чувства, искренность.", money: "Блестящие результаты.", advice: "Светите ярко, но не ослепляйте." },
  { symbol: "ᛏ", name: "Тейваз", mainMeaning: "Символизирует лидерство, справедливость и вектор.", power: "Целеустремленность, мужество.", risk: "Конфликтность, фанатизм.", love: "Ответственность, прямые действия.", money: "Достижение цели через труд.", advice: "Действуйте смело и честно." },
  { symbol: "ᛒ", name: "Беркана", mainMeaning: "Символизирует рост, заботу и женскую энергию.", power: "Плодородие, мягкое развитие.", risk: "Чрезмерная опека.", love: "Нежность, создание уюта.", money: "Стабильный рост.", advice: "Заботьтесь о себе и своих проектах." },
  { symbol: "ᛖ", name: "Эваз", mainMeaning: "Символизирует прогресс, доверие и партнерство.", power: "Сдвиг с мертвой точки, адаптация.", risk: "Слепое следование.", love: "Гармония в паре, синхронность.", money: "Успешное сотрудничество.", advice: "Объединяйте усилия." },
  { symbol: "ᛗ", name: "Манназ", mainMeaning: "Символизирует человечество, интеллект и эго.", power: "Рациональность, социальные связи.", risk: "Высокомерие, изоляция.", love: "Дружба, интеллектуальная связь.", money: "Связи и переговоры решают всё.", advice: "Помогайте другим и просите о помощи." },
  { symbol: "ᛚ", name: "Лагуз", mainMeaning: "Символизирует воду, поток и интуицию.", power: "Адаптивность, гибкость.", risk: "Потеря почвы под ногами.", love: "Эмоциональная глубина.", money: "Интуитивные решения.", advice: "Плывите по течению, слушая себя." },
  { symbol: "ᛝ", name: "Ингваз", mainMeaning: "Символизирует потенциал, завершение и обновление.", power: "Аккумуляция энергии для старта.", risk: "Преждевременные действия.", love: "Переход на новый уровень.", money: "Успешное завершение.", advice: "Подготовьте почву для нового." },
  { symbol: "ᛟ", name: "Отала", mainMeaning: "Символизирует наследие, дом и традиции.", power: "Укорененность, опыт предков.", risk: "Консерватизм, рамки.", love: "Семья, традиции.", money: "Недвижимость, стабильность.", advice: "Опирайтесь на свой опыт." },
  { symbol: "ᛞ", name: "Дагаз", mainMeaning: "Символизирует рассвет, прорыв и трансформацию.", power: "Новый день, надежда.", risk: "Неготовность к свету.", love: "Прояснение ситуации.", money: "Резкий позитивный сдвиг.", advice: "Приветствуйте новые возможности." }
];

export function generateRuneDay(dateKey: string, signId: ZodiacSignId): MysticRuneDay {
  const seed = `rune:${dateKey}:${signId}`;
  return pickRandomly(runesFuthark, seed);
}

export type MysticTarotTopicId = "love" | "money" | "work" | "decision" | "hidden_reason" | "daily_advice";
export type MysticTarotSpreadType = "one_card" | "three_cards" | "five_cards";
export type MysticRuneSpreadMode = "daily_rune" | "three_runes" | "question_rune" | "protection_rune";
export type MysticSpreadResultTier = "soft" | "clear" | "deep" | "grounded";

export interface MysticTarotSpreadCard {
  key: string;
  position: string;
  card: MysticTarotCard;
  shortMeaning: string;
  deepMeaning: string;
  warning: string;
  action: string;
  avoid: string;
}

export interface MysticTarotSpread {
  mode: "tarot";
  topic: MysticTarotTopicId;
  topicLabel: string;
  spreadType: MysticTarotSpreadType;
  spreadLabel: string;
  cardCount: number;
  cards: MysticTarotSpreadCard[];
  hero: string;
  shortAnswer: string;
  hiddenMeaning: string;
  risk: string;
  actionToday: string;
  avoidToday: string;
  conclusion: string;
  resultTier: MysticSpreadResultTier;
  safeKey: string;
  cardKeys: string[];
  honesty: string;
}

export interface MysticRuneSpreadRune {
  key: string;
  position: string;
  rune: MysticRuneDay;
  orientation: "upright" | "reversed";
  power: string;
  risk: string;
  advice: string;
  action: string;
  talisman: string;
}

export interface MysticRuneSpread {
  mode: "rune";
  runeMode: MysticRuneSpreadMode;
  modeLabel: string;
  runeCount: number;
  runes: MysticRuneSpreadRune[];
  hero: string;
  mainRune: MysticRuneSpreadRune;
  power: string;
  risk: string;
  advice: string;
  actionToday: string;
  talisman: string;
  resultTier: MysticSpreadResultTier;
  safeKey: string;
  runeKeys: string[];
  honesty: string;
}

const tarotTopicProfiles: Record<MysticTarotTopicId, { label: string; focus: string; actionTone: string }> = {
  love: { label: "Любовь", focus: "что поможет говорить теплее и видеть реальное состояние связи", actionTone: "мягкий честный жест" },
  money: { label: "Деньги", focus: "где сейчас ресурс, риск импульса и практичный следующий шаг", actionTone: "один измеримый финансовый шаг" },
  work: { label: "Работа", focus: "как выстроить день, разговор или проект без лишнего давления", actionTone: "рабочий шаг с понятным результатом" },
  decision: { label: "Решение", focus: "что уже ясно, что скрыто и какой шаг можно проверить без резкого рывка", actionTone: "маленькая проверка выбранного варианта" },
  hidden_reason: { label: "Скрытая причина", focus: "какая внутренняя тема влияет на ситуацию сильнее, чем кажется", actionTone: "пауза и честное наблюдение" },
  daily_advice: { label: "Совет дня", focus: "какой настрой дня даст больше спокойствия и действия", actionTone: "простое действие до конца дня" },
};

const tarotSpreadProfiles: Record<MysticTarotSpreadType, { label: string; positions: string[] }> = {
  one_card: { label: "1 карта", positions: ["Быстрый совет"] },
  three_cards: { label: "3 карты", positions: ["Прошлое", "Настоящее", "Возможный шаг"] },
  five_cards: { label: "5 карт", positions: ["Ситуация", "Скрытое", "Ресурс", "Риск", "Действие"] },
};

const runeSpreadProfiles: Record<MysticRuneSpreadMode, { label: string; positions: string[] }> = {
  daily_rune: { label: "Руна дня", positions: ["Главная руна"] },
  three_runes: { label: "Три руны", positions: ["Что поддерживает", "Что требует внимания", "Какой шаг выбрать"] },
  question_rune: { label: "Руна на вопрос", positions: ["Ответ-символ"] },
  protection_rune: { label: "Руна защиты", positions: ["Защитный знак"] },
};

const resultTiers: MysticSpreadResultTier[] = ["soft", "clear", "deep", "grounded"];
const tarotHonesty = "символическая интерпретация для размышления и выбора действия";
const runeHonesty = "символическая руническая подсказка без фатальных обещаний";

function pickDistinctIndexes(length: number, count: number, seed: string): number[] {
  const start = safeHashString(seed) % length;
  const step = (safeHashString(`${seed}:step`) % (length - 1)) + 1;
  const indexes: number[] = [];
  let cursor = start;
  while (indexes.length < count) {
    if (!indexes.includes(cursor)) indexes.push(cursor);
    cursor = (cursor + step) % length;
  }
  return indexes;
}

function normalizeQuestionMode(questionText?: string) {
  const trimmed = String(questionText || "").trim();
  if (!trimmed) return "no_question";
  if (trimmed.length < 24) return "short_question";
  return "question_entered";
}

function cardKey(index: number) {
  return `card_${String(index + 1).padStart(2, "0")}`;
}

function runeKey(index: number) {
  return `rune_${String(index + 1).padStart(2, "0")}`;
}

export function generateTarotSpread(
  dateKey: string,
  signId: ZodiacSignId,
  topic: MysticTarotTopicId = "daily_advice",
  spreadType: MysticTarotSpreadType = "three_cards",
  questionText?: string,
): MysticTarotSpread {
  const topicProfile = tarotTopicProfiles[topic] ?? tarotTopicProfiles.daily_advice;
  const spreadProfile = tarotSpreadProfiles[spreadType] ?? tarotSpreadProfiles.three_cards;
  const questionMode = normalizeQuestionMode(questionText);
  const seed = `tarotSpread:${dateKey}:${signId}:${topic}:${spreadType}:${questionMode}`;
  const indexes = pickDistinctIndexes(tarotMajorArcana.length, spreadProfile.positions.length, seed);
  const resultTier = pickRandomly(resultTiers, `${seed}:tier`);
  const cards = indexes.map((index, positionIndex) => {
    const card = tarotMajorArcana[index];
    const position = spreadProfile.positions[positionIndex];
    return {
      key: cardKey(index),
      position,
      card,
      shortMeaning: `${position}: ${card.mainMeaning}`,
      deepMeaning: `В этой позиции ${card.card} показывает, где тема "${topicProfile.label}" просит внимания: ${card.lightSide}. Если энергия уходит в тень, проявляется ${card.shadowSide.toLowerCase()}, поэтому расклад предлагает действовать мягко и проверять выводы фактами.`,
      warning: `Не превращайте карту в приговор: ${card.shadowSide.toLowerCase()} здесь только зона внимания, а не готовый сценарий.`,
      action: `${topicProfile.actionTone}: ${card.advice}`,
      avoid: `Не усиливайте ${card.shadowSide.toLowerCase()} автоматическими реакциями.`,
    };
  });
  const first = cards[0];
  const last = cards[cards.length - 1];
  const hiddenCard = cards[Math.min(1, cards.length - 1)];

  return {
    mode: "tarot",
    topic,
    topicLabel: topicProfile.label,
    spreadType,
    spreadLabel: spreadProfile.label,
    cardCount: cards.length,
    cards,
    hero: `Расклад смотрит на тему "${topicProfile.label}" как на карту внимания: ${topicProfile.focus}.`,
    shortAnswer: `${first.card.card} задает главный тон: ${first.card.mainMeaning}. Начните с того, что можно проверить спокойно, без резких обещаний себе или другим.`,
    hiddenMeaning: `${hiddenCard.card.card} подсвечивает скрытый слой: ${hiddenCard.card.lightSide}. Это место, где полезно спросить себя, что вы уже чувствуете, но пока не оформили словами.`,
    risk: `${last.card.card} предупреждает: ${last.card.shadowSide}. Это не знак остановки, а просьба не действовать из напряжения.`,
    actionToday: `${last.action}. Сделайте это в маленьком формате, чтобы к вечеру появился реальный ориентир.`,
    avoidToday: `${last.avoid} Лучше выбрать паузу, короткую запись мысли или один ясный разговор.`,
    conclusion: `Итог расклада: тема "${topicProfile.label}" сейчас раскрывается через ${first.card.lightSide.toLowerCase()} и требует бережной проверки, а не фатального вывода.`,
    resultTier,
    safeKey: `tarot_${topic}_${spreadType}_${resultTier}`,
    cardKeys: indexes.map(cardKey),
    honesty: tarotHonesty,
  };
}

export function generateRuneSpread(
  dateKey: string,
  signId: ZodiacSignId,
  runeMode: MysticRuneSpreadMode = "daily_rune",
  questionText?: string,
): MysticRuneSpread {
  const modeProfile = runeSpreadProfiles[runeMode] ?? runeSpreadProfiles.daily_rune;
  const questionMode = normalizeQuestionMode(questionText);
  const seed = `runeSpread:${dateKey}:${signId}:${runeMode}:${questionMode}`;
  const indexes = pickDistinctIndexes(runesFuthark.length, modeProfile.positions.length, seed);
  const resultTier = pickRandomly(resultTiers, `${seed}:tier`);
  const runes = indexes.map((index, positionIndex) => {
    const rune = runesFuthark[index];
    const orientation: MysticRuneSpreadRune["orientation"] = safeHashString(`${seed}:orientation:${index}`) % 4 === 0 ? "reversed" : "upright";
    const position = modeProfile.positions[positionIndex];
    return {
      key: runeKey(index),
      position,
      rune,
      orientation,
      power: orientation === "upright" ? rune.power : `Сила руны проявляется тише: ${rune.power}`,
      risk: orientation === "upright" ? rune.risk : `Перевернутая позиция просит не игнорировать: ${rune.risk}`,
      advice: rune.advice,
      action: `Сегодня выберите один практичный шаг: ${rune.advice}`,
      talisman: pickRandomly(["нить на запястье", "камень в кармане", "короткая запись в заметках", "символ на бумаге", "стакан воды как якорь внимания"], `${seed}:talisman:${index}`),
    };
  });
  const mainRune = runes[0];
  const last = runes[runes.length - 1];

  return {
    mode: "rune",
    runeMode,
    modeLabel: modeProfile.label,
    runeCount: runes.length,
    runes,
    hero: `${modeProfile.label} показывает не готовую судьбу, а символический маршрут внимания: где усилить опору, где снизить риск и какой шаг сделать сегодня.`,
    mainRune,
    power: `${mainRune.rune.name} несет ресурс: ${mainRune.power}`,
    risk: `${last.rune.name} напоминает о зоне риска: ${last.risk}`,
    advice: `${mainRune.rune.advice} Проверьте этот совет на одном небольшом действии.`,
    actionToday: last.action,
    talisman: `Символический талисман: ${last.talisman}. Используйте его как напоминание о выбранном действии, а не как гарантию результата.`,
    resultTier,
    safeKey: `rune_${runeMode}_${resultTier}`,
    runeKeys: indexes.map(runeKey),
    honesty: runeHonesty,
  };
}

export interface MysticIntuitiveSign {
  sign: string;
  meaning: string;
  whereToLook: string;
  whatToDo: string;
  whatToAvoid: string;
}

const intuitiveSigns: MysticIntuitiveSign[] = [
  { sign: "Птица", meaning: "Символизирует свободу, новости и легкость.", whereToLook: "На улице, за окном, в текстах или песнях.", whatToDo: "Обратите внимание на свои мысли в момент встречи с этим знаком.", whatToAvoid: "Тревожности и тяжелых мыслей." },
  { sign: "Ключ", meaning: "Символизирует открытие новых путей, разгадку проблемы.", whereToLook: "В карманах, на изображениях, в метафорах.", whatToDo: "Подумайте, какая дверь в вашей жизни требует ключа.", whatToAvoid: "Замкнутости и упрямства." },
  { sign: "Дорога/Перекресток", meaning: "Символизирует выбор и направление.", whereToLook: "Во время прогулки или поездки.", whatToDo: "Прислушайтесь к себе: куда вы на самом деле хотите идти?", whatToAvoid: "Спешки при принятии решений." },
  { sign: "Зеркало", meaning: "Символизирует отражение вашего внутреннего состояния.", whereToLook: "Дома, в витринах, в глазах собеседника.", whatToDo: "Честно ответьте себе на давно отложенный вопрос.", whatToAvoid: "Самообмана и критики." },
  { sign: "Вода", meaning: "Символизирует эмоции, очищение и поток.", whereToLook: "Дождь, река, чай, стакан воды.", whatToDo: "Позвольте себе почувствовать то, что скрывали.", whatToAvoid: "Подавления эмоций." },
  { sign: "Огонь", meaning: "Символизирует энергию, трансформацию и страсть.", whereToLook: "Свеча, солнце, камин, яркий свет.", whatToDo: "Направьте энергию в творчество или важное дело.", whatToAvoid: "Агрессии и конфликтов." },
  { sign: "Часы/Время", meaning: "Символизирует своевременность и ритм жизни.", whereToLook: "Одинаковые цифры, бой часов.", whatToDo: "Замедлитесь или, наоборот, сделайте шаг, который откладывали.", whatToAvoid: "Ощущения нехватки времени." },
  { sign: "Монета", meaning: "Символизирует материальные ресурсы и энергообмен.", whereToLook: "На улице, в кошельке, в разговоре.", whatToDo: "Поблагодарите мир за то, что имеете.", whatToAvoid: "Жадности и страха бедности." },
  { sign: "Красный цвет", meaning: "Символизирует активность, жизненную силу и внимание.", whereToLook: "В одежде прохожих, на вывесках, деталях.", whatToDo: "Смело заявите о себе или своих желаниях.", whatToAvoid: "Пассивности." },
  { sign: "Белый цвет", meaning: "Символизирует чистоту, обнуление и ясность.", whereToLook: "Облака, бумага, светлые поверхности.", whatToDo: "Начните с чистого листа то, что зашло в тупик.", whatToAvoid: "Цепляния за старое." },
  { sign: "Перо", meaning: "Символизирует легкость, поддержку и духовную связь.", whereToLook: "Под ногами, в небе, на картинках.", whatToDo: "Поверьте, что вы находитесь под символической защитой.", whatToAvoid: "Уныния." }
];

export function generateIntuitiveSign(dateKey: string, signId: ZodiacSignId): MysticIntuitiveSign {
  const seed = `intuitive:${dateKey}:${signId}`;
  return pickRandomly(intuitiveSigns, seed);
}

export interface MysticTalismans {
  mainTalisman: string;
  powerStone: string;
  powerColor: string;
  powerNumber: string;
  symbol: string;
  animal: string;
  plant: string;
  loveTalisman: string;
  calmTalisman: string;
  moneyTalisman: string;
  phrase: string;
  action: string;
  avoid: string;
}

const talismansData: Record<ZodiacSignId, MysticTalismans> = {
  aries: { mainTalisman: "Золотое руно", powerStone: "Рубин, Алмаз", powerColor: "Красный", powerNumber: "9", symbol: "Баран", animal: "Овен, Ястреб", plant: "Кактус, Чертополох", loveTalisman: "Гранат", calmTalisman: "Аметист", moneyTalisman: "Золотая монета", phrase: "Я действую смело", action: "Сделайте первый шаг", avoid: "Ожидания" },
  taurus: { mainTalisman: "Медный браслет", powerStone: "Изумруд, Сапфир", powerColor: "Зеленый, Розовый", powerNumber: "6", symbol: "Бык", animal: "Бык, Голубь", plant: "Роза, Сирень", loveTalisman: "Розовый кварц", calmTalisman: "Малахит", moneyTalisman: "Клевер", phrase: "Я создаю стабильность", action: "Насладитесь комфортом", avoid: "Спешки" },
  gemini: { mainTalisman: "Ключ", powerStone: "Агат, Хризопраз", powerColor: "Желтый", powerNumber: "5", symbol: "Близнецы", animal: "Обезьяна, Попугай", plant: "Папоротник, Лаванда", loveTalisman: "Двойное кольцо", calmTalisman: "Жемчуг", moneyTalisman: "Перо", phrase: "Я мыслю гибко", action: "Узнайте что-то новое", avoid: "Рутины" },
  cancer: { mainTalisman: "Серебряная луна", powerStone: "Лунный камень, Жемчуг", powerColor: "Белый, Серебряный", powerNumber: "2", symbol: "Краб", animal: "Краб, Сова", plant: "Кувшинка, Жасмин", loveTalisman: "Ракушка", calmTalisman: "Серебряное кольцо", moneyTalisman: "Серебряная монета", phrase: "Я чувствую глубоко", action: "Позаботьтесь о себе", avoid: "Резкости" },
  leo: { mainTalisman: "Золотое солнце", powerStone: "Янтарь, Топаз", powerColor: "Оранжевый, Золотой", powerNumber: "1", symbol: "Лев", animal: "Лев, Орел", plant: "Подсолнух, Пальма", loveTalisman: "Золотой кулон", calmTalisman: "Хризолит", moneyTalisman: "Корона", phrase: "Я сияю ярко", action: "Проявите себя", avoid: "Самокритики" },
  virgo: { mainTalisman: "Колос пшеницы", powerStone: "Нефрит, Сердолик", powerColor: "Бежевый, Оливковый", powerNumber: "4", symbol: "Дева", animal: "Собака, Ласточка", plant: "Мята, Валериана", loveTalisman: "Деревянный амулет", calmTalisman: "Агат", moneyTalisman: "Квадратный символ", phrase: "Я организую пространство", action: "Наведите порядок", avoid: "Хаоса" },
  libra: { mainTalisman: "Весы", powerStone: "Опал, Лазурит", powerColor: "Голубой, Розовый", powerNumber: "6", symbol: "Весы", animal: "Голубь, Лебедь", plant: "Фиалка, Роза", loveTalisman: "Парный кулон", calmTalisman: "Нефрит", moneyTalisman: "Медная монета", phrase: "Я нахожу баланс", action: "Найдите компромисс", avoid: "Конфликтов" },
  scorpio: { mainTalisman: "Скорпион", powerStone: "Аквамарин, Гранат", powerColor: "Темно-красный, Черный", powerNumber: "8", symbol: "Скорпион", animal: "Змея, Орел", plant: "Орхидея, Кактус", loveTalisman: "Обсидиан", calmTalisman: "Аметист", moneyTalisman: "Жук-скарабей", phrase: "Я трансформируюсь", action: "Отпустите лишнее", avoid: "Поверхностности" },
  sagittarius: { mainTalisman: "Стрела", powerStone: "Бирюза, Аметист", powerColor: "Фиолетовый, Синий", powerNumber: "3", symbol: "Кентавр", animal: "Лошадь, Олень", plant: "Дуб, Гвоздика", loveTalisman: "Подкова", calmTalisman: "Сапфир", moneyTalisman: "Фигурка лошади", phrase: "Я расширяю горизонты", action: "Постройте большой план", avoid: "Ограничений" },
  capricorn: { mainTalisman: "Гора", powerStone: "Оникс, Малахит", powerColor: "Коричневый, Черный", powerNumber: "8", symbol: "Козел", animal: "Козел, Медведь", plant: "Сосна, Плющ", loveTalisman: "Черный агат", calmTalisman: "Оникс", moneyTalisman: "Монета", phrase: "Я строю на века", action: "Составьте четкий план", avoid: "Импульсивности" },
  aquarius: { mainTalisman: "Кувшин", powerStone: "Сапфир, Аметист", powerColor: "Неоновый, Бирюзовый", powerNumber: "4", symbol: "Водолей", animal: "Птица, Дельфин", plant: "Орхидея, Алоэ", loveTalisman: "Звезда", calmTalisman: "Горный хрусталь", moneyTalisman: "Символ молнии", phrase: "Я смотрю в будущее", action: "Сделайте что-то нестандартное", avoid: "Догм" },
  pisces: { mainTalisman: "Две рыбы", powerStone: "Аквамарин, Лунный камень", powerColor: "Морская волна, Индиго", powerNumber: "7", symbol: "Рыбы", animal: "Рыба, Дельфин", plant: "Лотос, Водоросли", loveTalisman: "Коралл", calmTalisman: "Жемчуг", moneyTalisman: "Морская раковина", phrase: "Я плыву в потоке", action: "Доверьтесь интуиции", avoid: "Суеты" }
};

export function generateTalismans(signId: ZodiacSignId): MysticTalismans {
  return talismansData[signId];
}

export interface MysticAuraColor {
  color: string;
  aura: string;
  meaning: string;
  howToUse: string;
  love: string;
  money: string;
  avoid: string;
}

const auraColors: MysticAuraColor[] = [
  { color: "Красный", aura: "Энергичная, страстная", meaning: "Жизненная сила, лидерство, действие.", howToUse: "Добавьте красную деталь в одежду для уверенности.", love: "Страсть, проявление инициативы.", money: "Активные действия, риск.", avoid: "Агрессии." },
  { color: "Оранжевый", aura: "Творческая, теплая", meaning: "Радость, креативность, общение.", howToUse: "Окружите себя оранжевым для поднятия настроения.", love: "Флирт, легкое общение.", money: "Творческие проекты.", avoid: "Поверхностности." },
  { color: "Желтый", aura: "Ясная, интеллектуальная", meaning: "Оптимизм, интеллект, ясность ума.", howToUse: "Фокусируйтесь на желтом при обучении.", love: "Искренность, открытость.", money: "Успешные переговоры.", avoid: "Рассеянности." },
  { color: "Зеленый", aura: "Гармоничная, исцеляющая", meaning: "Баланс, рост, природа.", howToUse: "Проведите время на природе.", love: "Спокойствие, забота.", money: "Стабильный рост.", avoid: "Застоя." },
  { color: "Голубой", aura: "Спокойная, коммуникативная", meaning: "Умиротворение, честность, выражение себя.", howToUse: "Носите голубое для успешного диалога.", love: "Глубокое понимание.", money: "Спокойная работа.", avoid: "Замкнутости." },
  { color: "Синий", aura: "Мудрая, глубокая", meaning: "Интуиция, ответственность, концентрация.", howToUse: "Используйте для глубоких размышлений.", love: "Серьезные намерения.", money: "Стратегическое планирование.", avoid: "Холодности." },
  { color: "Фиолетовый", aura: "Мистическая, вдохновляющая", meaning: "Духовность, трансформация, тайна.", howToUse: "Помедитируйте, визуализируя этот цвет.", love: "Духовное родство.", money: "Нестандартные решения.", avoid: "Оторванности от реальности." },
  { color: "Розовый", aura: "Мягкая, любящая", meaning: "Нежность, сострадание, принятие.", howToUse: "Проявите заботу к себе и близким.", love: "Романтика, тепло.", money: "Мягкий подход к делам.", avoid: "Наивности." },
  { color: "Белый", aura: "Чистая, обнуляющая", meaning: "Ясность, новое начало, очищение.", howToUse: "Наведите порядок, очистите пространство.", love: "Искренность без скрытых мотивов.", money: "Прозрачность сделок.", avoid: "Чрезмерного перфекционизма." }
];

export function generateAuraColor(dateKey: string, signId: ZodiacSignId): MysticAuraColor {
  const seed = `aura:${dateKey}:${signId}`;
  return pickRandomly(auraColors, seed);
}

export interface MysticLunarRitual {
  theme: string;
  preparation: string;
  step1: string;
  step2: string;
  step3: string;
  intention: string;
  release: string;
  avoid: string;
}

const lunarRituals: MysticLunarRitual[] = [
  { theme: "Очищение пространства", preparation: "Свеча, благовоние или просто открытое окно.", step1: "Зажгите свечу или откройте окно для свежего воздуха.", step2: "Пройдите по комнате, символически выметая негатив.", step3: "Постойте в тишине 2 минуты.", intention: "Мое пространство чисто и наполнено светом.", release: "Старые обиды и застойную энергию.", avoid: "Суеты в этот момент." },
  { theme: "Ритуал благодарности", preparation: "Блокнот и ручка.", step1: "Уединитесь на 5 минут.", step2: "Запишите 3 вещи, за которые вы благодарны сегодня.", step3: "Перечитайте их вслух.", intention: "Я привлекаю изобилие через благодарность.", release: "Ощущение нехватки.", avoid: "Жалоб на обстоятельства." },
  { theme: "Фокус на намерении", preparation: "Стакан чистой воды.", step1: "Возьмите стакан воды двумя руками.", step2: "Мысленно произнесите свое главное намерение на день.", step3: "Медленно выпейте воду.", intention: "Мое намерение материализуется.", release: "Сомнения в своих силах.", avoid: "Многозадачности." },
  { theme: "Заземление", preparation: "Удобное место, где можно сесть.", step1: "Сядьте ровно, почувствуйте стопами пол.", step2: "Сделайте 5 глубоких вдохов и выдохов.", step3: "Представьте, как от стоп в землю уходят символические корни.", intention: "Я чувствую опору и стабильность.", release: "Тревогу о будущем.", avoid: "Спешки." },
  { theme: "Освобождение", preparation: "Листок бумаги и ручка.", step1: "Напишите одну вещь, которая вас тяготит.", step2: "Символически разорвите листок на мелкие части.", step3: "Выбросьте обрывки, сказав 'Я отпускаю это'.", intention: "Я свободен от груза прошлого.", release: "Привязанность к результату.", avoid: "Воспоминаний об обидах." }
];

export function generateLunarRitual(dateKey: string): MysticLunarRitual {
  const seed = `lunar:${dateKey}`;
  return pickRandomly(lunarRituals, seed);
}

export type MysticLunarMode = "lunar_day" | "daily_ritual" | "love_ritual" | "money_work" | "cleansing" | "sleep_intuition";
export type MysticLunarDateBucket = "today" | "tomorrow" | "custom";
export type MysticLunarEnergyKey = "growth" | "cleansing" | "love" | "money" | "rest" | "intuition";
export type MysticLunarEnergyTier = "soft" | "active" | "deep" | "restorative" | "focused" | "intuitive";

export interface MysticLunarCalendarDay {
  dateKey: string;
  dayLabel: string;
  weekdayLabel: string;
  phaseSymbol: string;
  rhythmLabel: string;
  energyKey: MysticLunarEnergyKey;
  energyLabel: string;
  energyTier: MysticLunarEnergyTier;
  isToday: boolean;
  isSelected: boolean;
}

export interface MysticLunarPlan {
  mode: MysticLunarMode;
  modeLabel: string;
  dateBucket: MysticLunarDateBucket;
  selectedDateKey: string;
  displayDate: string;
  moonDayNumber: number;
  phaseSymbol: string;
  rhythmLabel: string;
  energyKey: MysticLunarEnergyKey;
  energyLabel: string;
  energyTier: MysticLunarEnergyTier;
  energyTierLabel: string;
  ritualKey: string;
  honesty: string;
  hero: string;
  energy: string;
  doItems: string[];
  avoidItems: string[];
  ritual: {
    title: string;
    timing: string;
    preparation: string;
    steps: string[];
    finalAction: string;
  };
  checklist: string[];
  actionToday: string;
  eveningSummary: string;
  calendarDays: MysticLunarCalendarDay[];
}

const lunarModeLabels: Record<MysticLunarMode, string> = {
  lunar_day: "Лунный день",
  daily_ritual: "Ритуал дня",
  love_ritual: "Любовный ритуал",
  money_work: "Деньги / работа",
  cleansing: "Очищение",
  sleep_intuition: "Сон / интуиция",
};

const lunarEnergyProfiles: Record<MysticLunarEnergyKey, { label: string; tier: MysticLunarEnergyTier; tierLabel: string; symbol: string; rhythm: string }> = {
  growth: { label: "рост", tier: "active", tierLabel: "активная", symbol: "◐", rhythm: "растущий импульс" },
  cleansing: { label: "очищение", tier: "deep", tierLabel: "глубокая", symbol: "◑", rhythm: "ритм освобождения" },
  love: { label: "любовь", tier: "soft", tierLabel: "мягкая", symbol: "●", rhythm: "ритм близости" },
  money: { label: "деньги", tier: "focused", tierLabel: "собранная", symbol: "◒", rhythm: "ритм фокуса" },
  rest: { label: "отдых", tier: "restorative", tierLabel: "восстанавливающая", symbol: "○", rhythm: "ритм тишины" },
  intuition: { label: "интуиция", tier: "intuitive", tierLabel: "интуитивная", symbol: "◓", rhythm: "ритм внутреннего слуха" },
};

const lunarEnergyCycle: MysticLunarEnergyKey[] = ["growth", "love", "money", "cleansing", "intuition", "rest"];
const lunarWeekdays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

const lunarModeBlueprints: Record<MysticLunarMode, {
  ritualKey: string;
  hero: string[];
  energy: string[];
  doItems: string[];
  avoidItems: string[];
  ritualTitle: string;
  timing: string;
  preparation: string;
  steps: string[];
  finalAction: string;
  checklist: string[];
  actionToday: string[];
  eveningSummary: string[];
}> = {
  lunar_day: {
    ritualKey: "lunar_day_reflection",
    hero: [
      "Сегодня полезно смотреть на день как на мягкий ритм: что растет, что просит паузы и где нужно меньше давления.",
      "Лунный день лучше раскрывается через наблюдение: выберите одно главное направление и не распыляйте внимание.",
    ],
    energy: [
      "Энергия дня подходит для спокойной настройки, коротких решений и внимательного отношения к телу и эмоциям.",
      "День хорошо поддерживает маленькие шаги, честный внутренний диалог и аккуратное завершение хвостов.",
    ],
    doItems: ["выберите один главный фокус", "запишите три наблюдения о своем состоянии", "оставьте место для тишины между делами"],
    avoidItems: ["перегружать день обещаниями", "делать выводы на пике эмоций", "сравнивать свой темп с чужим"],
    ritualTitle: "Ритуал настройки на лунный день",
    timing: "утром или в первой спокойной паузе дня",
    preparation: "стакан воды, заметка в телефоне или бумажный блокнот",
    steps: ["Сформулируйте один фокус дня без жестких требований к себе.", "Сделайте три медленных вдоха и отметьте, где в теле есть напряжение.", "Запишите маленькое действие, которое можно выполнить за 10 минут."],
    finalAction: "Вернитесь к этому фокусу вечером и отметьте один спокойный результат.",
    checklist: ["один фокус выбран", "лишние задачи перенесены", "короткая пауза запланирована", "вечерний итог оставлен открытым"],
    actionToday: ["Сделайте один маленький шаг, который возвращает ощущение управления днем."],
    eveningSummary: ["Вечером отметьте, где день стал легче после того, как вы выбрали один главный фокус."],
  },
  daily_ritual: {
    ritualKey: "daily_moon_ritual",
    hero: [
      "Ритуал дня помогает собрать внимание и превратить хаотичный настрой в одно понятное действие.",
      "Сегодня ритуал лучше делать без драматизма: как короткий якорь, который возвращает к себе.",
    ],
    energy: [
      "Энергия дня подходит для бережной перезагрузки, наведения порядка и символического выбора нового тона.",
      "День поддерживает простые действия: убрать лишнее, назвать главное и дать себе больше ясности.",
    ],
    doItems: ["сделайте короткий ритуал без спешки", "уберите один визуальный раздражитель", "назовите вслух желаемое состояние дня"],
    avoidItems: ["ожидать мгновенного результата", "делать ритуал из тревоги", "перегружать его сложными правилами"],
    ritualTitle: "Ритуал мягкой настройки",
    timing: "днем, когда нужно вернуть собранность",
    preparation: "свеча, вода или просто тихое место на 5 минут",
    steps: ["Положите ладонь на грудь или на стол и замедлите дыхание.", "Назовите одно состояние, которое хотите поддержать сегодня.", "Сделайте небольшой порядок вокруг себя: один предмет, одно письмо или одна заметка."],
    finalAction: "Закройте ритуал фразой: «Я выбираю спокойный следующий шаг».",
    checklist: ["тихое место найдено", "состояние дня названо", "один предмет убран", "следующий шаг выбран"],
    actionToday: ["Выберите действие на 10 минут, которое делает пространство или мысли чуть яснее."],
    eveningSummary: ["Вечером спросите себя: какой один жест помог мне вернуться в равновесие?"],
  },
  love_ritual: {
    ritualKey: "love_soft_contact",
    hero: [
      "Любовный ритуал здесь не про обещания и контроль, а про мягкость, ясность и экологичный контакт.",
      "День подходит для бережного внимания к близости: меньше давления, больше честного тепла.",
    ],
    energy: [
      "Энергия дня поддерживает открытый тон, заботливый жест и разговор без попытки победить.",
      "Лучший фокус для отношений сегодня - тепло, простота и уважение к границам.",
    ],
    doItems: ["напишите короткое доброе сообщение", "услышьте собеседника без перебивания", "выберите один честный комплимент"],
    avoidItems: ["проверять чувства провокациями", "требовать немедленного ответа", "возвращаться к старому спору без готовности слушать"],
    ritualTitle: "Ритуал теплого контакта",
    timing: "после полудня или вечером, когда можно говорить мягко",
    preparation: "спокойная музыка или тихая пауза перед сообщением",
    steps: ["Сделайте три вдоха и вспомните, что хотите передать: тепло, ясность или благодарность.", "Напишите одну фразу без обвинения и скрытого требования.", "Отправляйте только если внутри есть уважение к любому ответу."],
    finalAction: "После сообщения не проверяйте реакцию каждые пять минут: вернитесь к своему делу.",
    checklist: ["тон мягкий", "нет скрытого давления", "одна главная мысль", "границы сохранены"],
    actionToday: ["Выберите один добрый жест, который ничего не требует взамен."],
    eveningSummary: ["Вечером отметьте, где вы смогли быть теплее без потери себя."],
  },
  money_work: {
    ritualKey: "money_work_focus",
    hero: [
      "Этот режим помогает перевести тему денег и работы из тревоги в понятный фокус и аккуратный план.",
      "Сегодня лучше не гнаться за большим рывком: сильнее сработает порядок, ясная цифра и один завершенный шаг.",
    ],
    energy: [
      "Энергия дня поддерживает расчистку задач, проверку договоренностей и спокойный фокус на ресурсе.",
      "День подходит для практичного взгляда: что приносит результат, что съедает время и что можно упростить.",
    ],
    doItems: ["выберите одну денежную или рабочую задачу", "проверьте сроки и обязательства", "завершите маленький, но видимый кусок работы"],
    avoidItems: ["импульсивных покупок из эмоций", "обещаний без ресурса", "финансовых решений в состоянии спешки"],
    ritualTitle: "Ритуал рабочего фокуса",
    timing: "утром или перед рабочим блоком",
    preparation: "лист задач, таймер на 25 минут, стакан воды",
    steps: ["Запишите одну задачу, которая реально двигает дело вперед.", "Уберите один отвлекающий фактор на время таймера.", "После 25 минут отметьте результат, даже если он маленький."],
    finalAction: "Закройте блок короткой записью: что готово, что переносится, что больше не нужно.",
    checklist: ["одна задача выбрана", "таймер поставлен", "отвлекающий фактор убран", "результат зафиксирован"],
    actionToday: ["Закройте один рабочий хвост, который давно висит в фоне."],
    eveningSummary: ["Вечером отметьте, какая маленькая структура дала больше всего спокойствия."],
  },
  cleansing: {
    ritualKey: "cleansing_release",
    hero: [
      "Очищение сегодня лучше понимать как освобождение пространства и внимания, а не борьбу с собой.",
      "Ритм дня помогает убрать лишний шум: один угол, одна мысль, одна эмоциональная петля.",
    ],
    energy: [
      "Энергия дня поддерживает расхламление, честный отказ от лишнего и бережное закрытие старого.",
      "День хорош для символического отпускания: не через резкость, а через спокойное решение больше не тащить лишнее.",
    ],
    doItems: ["уберите одну небольшую зону", "удалите один цифровой шум", "напишите, что больше не хотите кормить вниманием"],
    avoidItems: ["устраивать тотальную чистку на износ", "ссориться под видом честности", "возвращаться к старой обиде как к доказательству"],
    ritualTitle: "Ритуал освобождения пространства",
    timing: "вечером или после завершения дел",
    preparation: "пакет для мусора, влажная салфетка или заметка для списка",
    steps: ["Выберите одну небольшую зону: стол, полку, чат или список задач.", "Уберите три лишних элемента и назовите, что они символически освобождают.", "Проветрите комнату или сделайте один глубокий выдох у открытого окна."],
    finalAction: "Скажите: «Я оставляю место для того, что действительно важно».",
    checklist: ["одна зона выбрана", "три лишних элемента убраны", "воздух обновлен", "граница с лишним названа"],
    actionToday: ["Удалите один источник шума: уведомление, лишнюю вкладку или ненужную задачу."],
    eveningSummary: ["Вечером отметьте, где стало просторнее: в комнате, в голове или в расписании."],
  },
  sleep_intuition: {
    ritualKey: "sleep_intuition",
    hero: [
      "Режим сна и интуиции помогает мягко завершить день и услышать тихий внутренний сигнал без мистического давления.",
      "Сегодня вечер лучше сделать спокойным: меньше экранного шума, больше наблюдения за телом и образами.",
    ],
    energy: [
      "Энергия дня поддерживает восстановление, дневник образов и бережный переход ко сну.",
      "День подходит для тихого вопроса к себе: что я уже знаю, но пока не произнес вслух?",
    ],
    doItems: ["завершите экранное время чуть раньше", "запишите один вопрос для сна", "подготовьте спокойный вечерний ритм"],
    avoidItems: ["читать тревожные новости перед сном", "искать знаки в каждом совпадении", "делать выводы из усталости"],
    ritualTitle: "Ритуал тихого сна",
    timing: "за 30-40 минут до сна",
    preparation: "приглушенный свет, вода, заметка для утренней записи",
    steps: ["Запишите один спокойный вопрос без ожидания немедленного ответа.", "Сделайте 6 медленных выдохов, удлиняя каждый следующий.", "Положите заметку рядом и договоритесь с собой записать утром любой образ или мысль."],
    finalAction: "Закройте день фразой: «Ответ может прийти мягко, когда я отдохну».",
    checklist: ["экранный шум снижен", "вопрос записан", "дыхание замедлено", "утренняя заметка готова"],
    actionToday: ["Подготовьте сон как пространство восстановления, а не как продолжение рабочих мыслей."],
    eveningSummary: ["Утром или вечером отметьте один образ, чувство или мысль, которая повторялась мягче всего."],
  },
};

export function normalizeLunarDateKey(value: string): string | null {
  return dateInputToIsoDate(value);
}

export function shiftLunarDateKey(dateKey: string, days: number): string {
  const date = parseLunarDateKey(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateKey(date);
}

export function generateLunarRitualFlow(
  selectedDateKey: string,
  mode: MysticLunarMode,
  dateBucket: MysticLunarDateBucket,
  baseDateKey = selectedDateKey,
  hasIntention = false,
): MysticLunarPlan {
  const normalizedDateKey = normalizeLunarDateKey(selectedDateKey) ?? baseDateKey;
  const safeMode = lunarModeLabels[mode] ? mode : "daily_ritual";
  const energyKey = energyKeyForDate(normalizedDateKey, safeMode);
  const energy = lunarEnergyProfiles[energyKey];
  const blueprint = lunarModeBlueprints[safeMode];
  const moonDayNumber = (dateOrdinal(normalizedDateKey) % 29) + 1;
  const phaseSymbol = phaseSymbolForMoonDay(moonDayNumber);
  const seed = `lunar-flow:${normalizedDateKey}:${safeMode}:${energyKey}`;
  const intentionNote = hasIntention ? " Намерение учтено только как факт фокуса: его текст не сохраняется и не передается в аналитику." : "";
  const displayDate = formatLunarDisplayDate(normalizedDateKey);
  return {
    mode: safeMode,
    modeLabel: lunarModeLabels[safeMode],
    dateBucket,
    selectedDateKey: normalizedDateKey,
    displayDate,
    moonDayNumber,
    phaseSymbol,
    rhythmLabel: `${energy.rhythm} · ${moonDayNumber}-й символический лунный день`,
    energyKey,
    energyLabel: energy.label,
    energyTier: energy.tier,
    energyTierLabel: energy.tierLabel,
    ritualKey: blueprint.ritualKey,
    honesty: "символический лунный ритм",
    hero: `${pickRandomly(blueprint.hero, seed + ":hero")} ${intentionNote}`.trim(),
    energy: `${pickRandomly(blueprint.energy, seed + ":energy")} Тон дня: ${energy.tierLabel} энергия, тема - ${energy.label}.`,
    doItems: rotateItems(blueprint.doItems, seed + ":do", 3),
    avoidItems: rotateItems(blueprint.avoidItems, seed + ":avoid", 3),
    ritual: {
      title: blueprint.ritualTitle,
      timing: blueprint.timing,
      preparation: blueprint.preparation,
      steps: rotateItems(blueprint.steps, seed + ":steps", Math.min(5, blueprint.steps.length)),
      finalAction: blueprint.finalAction,
    },
    checklist: rotateItems(blueprint.checklist, seed + ":checklist", Math.min(5, blueprint.checklist.length)),
    actionToday: pickRandomly(blueprint.actionToday, seed + ":action"),
    eveningSummary: pickRandomly(blueprint.eveningSummary, seed + ":evening"),
    calendarDays: generateLunarCalendarWindow(baseDateKey, normalizedDateKey),
  };
}

function generateLunarCalendarWindow(baseDateKey: string, selectedDateKey: string): MysticLunarCalendarDay[] {
  const days: MysticLunarCalendarDay[] = [];
  for (let offset = 0; offset < 14; offset++) {
    const dateKey = shiftLunarDateKey(baseDateKey, offset);
    const energyKey = energyKeyForDate(dateKey, "lunar_day");
    const energy = lunarEnergyProfiles[energyKey];
    const moonDayNumber = (dateOrdinal(dateKey) % 29) + 1;
    days.push({
      dateKey,
      dayLabel: formatLunarDayLabel(dateKey),
      weekdayLabel: lunarWeekdays[parseLunarDateKey(dateKey).getUTCDay()],
      phaseSymbol: phaseSymbolForMoonDay(moonDayNumber),
      rhythmLabel: energy.rhythm,
      energyKey,
      energyLabel: energy.label,
      energyTier: energy.tier,
      isToday: dateKey === baseDateKey,
      isSelected: dateKey === selectedDateKey,
    });
  }
  return days;
}

function energyKeyForDate(dateKey: string, mode: MysticLunarMode): MysticLunarEnergyKey {
  const modeBias: Partial<Record<MysticLunarMode, MysticLunarEnergyKey>> = {
    love_ritual: "love",
    money_work: "money",
    cleansing: "cleansing",
    sleep_intuition: "intuition",
  };
  if (modeBias[mode] && safeHashString(`${dateKey}:${mode}`) % 3 !== 0) return modeBias[mode]!;
  return lunarEnergyCycle[dateOrdinal(dateKey) % lunarEnergyCycle.length];
}

function phaseSymbolForMoonDay(moonDayNumber: number) {
  if (moonDayNumber <= 3) return "○";
  if (moonDayNumber <= 10) return "◔";
  if (moonDayNumber <= 17) return "●";
  if (moonDayNumber <= 24) return "◑";
  return "◌";
}

function rotateItems<T>(items: T[], seed: string, count: number): T[] {
  const start = safeHashString(seed) % items.length;
  return Array.from({ length: count }, (_, index) => items[(start + index) % items.length]);
}

function parseLunarDateKey(dateKey: string) {
  const normalized = normalizeLunarDateKey(dateKey) ?? "2026-06-19";
  const [year, month, day] = normalized.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toDateKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function dateOrdinal(dateKey: string) {
  return Math.floor(parseLunarDateKey(dateKey).getTime() / 86400000);
}

function formatLunarDisplayDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-");
  return `${day}.${month}.${year}`;
}

function formatLunarDayLabel(dateKey: string) {
  const [, month, day] = dateKey.split("-");
  return `${day}.${month}`;
}

export interface MysticKarmicLessons {
  mainLesson: string;
  recurringScenario: string;
  strength: string;
  riskZone: string;
  relationships: string;
  money: string;
  monthlyAdvice: string;
  release: string;
}

const karmicLessonsData: MysticKarmicLessons[] = [
  { mainLesson: "Символический урок баланса брать и давать.", recurringScenario: "Ситуации, где вы отдаете больше, чем получаете.", strength: "Щедрость и эмпатия.", riskZone: "Опустошение и выгорание.", relationships: "Учитесь устанавливать границы.", money: "Цените свой труд достойно.", monthlyAdvice: "Сфокусируйтесь на своих потребностях.", release: "Желание спасать всех вокруг." },
  { mainLesson: "Символический урок веры в себя.", recurringScenario: "Сомнения в момент важного выбора.", strength: "Осторожность и аналитический ум.", riskZone: "Упущенные возможности из-за страха.", relationships: "Доверяйте партнеру, но слушайте себя.", money: "Смелее заявляйте о своих талантах.", monthlyAdvice: "Сделайте шаг навстречу страху.", release: "Синдром самозванца." },
  { mainLesson: "Символический урок терпения.", recurringScenario: "Желание получить все здесь и сейчас.", strength: "Высокая скорость и энтузиазм.", riskZone: "Быстрая потеря интереса.", relationships: "Дайте чувствам время созреть.", money: "Играйте в долгую.", monthlyAdvice: "Не бросайте начатое на полпути.", release: "Спешку и раздражительность." },
  { mainLesson: "Символический урок принятия перемен.", recurringScenario: "Цепляние за старое, когда оно уже не работает.", strength: "Стабильность и преданность.", riskZone: "Застой и страх нового.", relationships: "Позвольте отношениям развиваться.", money: "Адаптируйтесь к новым условиям.", monthlyAdvice: "Сделайте шаг в неизвестность.", release: "Страх перед будущим." }
];

export function generateKarmicLessons(signId: ZodiacSignId, birthDateKey?: string): MysticKarmicLessons {
  const seed = `karmic:${signId}:${birthDateKey || "none"}`;
  return pickRandomly(karmicLessonsData, seed);
}

export interface MysticBirthMatrix {
  matrixType: "symbolic_birth_date";
  displayDate: string;
  centralNumber: number;
  lifePath: number;
  soulNumber: number;
  realizationNumber: number;
  relationshipNumber: number;
  dayNumber: number;
  monthNumber: number;
  yearSum: number;
  lessonNumber: number;
  resourceNumber: number;
  archetype: string;
  archetypeKey: string;
  tier: string;
  hero: string;
  honesty: string;
  strengths: string;
  risks: string;
  relationships: string;
  moneyWork: string;
  advice: string;
  visualCells: BirthMatrixVisualCell[];
  sections: BirthMatrixSection[];
  recommendations: string[];
  todayAction: {
    action: string;
    avoid: string;
    tone: string;
    smallStep: string;
  };
}

export type BirthMatrixSectionId = "main" | "character" | "relationships" | "money" | "lesson" | "today";

export interface BirthMatrixVisualCell {
  id: "character" | "relationships" | "money" | "energy" | "lesson" | "resource";
  label: string;
  number: number;
  title: string;
  summary: string;
}

export interface BirthMatrixSection {
  id: BirthMatrixSectionId;
  tab: string;
  title: string;
  eyebrow: string;
  body: string;
  points: string[];
}

interface BirthMatrixNumberProfile {
  key: string;
  archetype: string;
  tier: string;
  strength: string;
  conflict: string;
  choice: string;
  relationship: string;
  money: string;
  lesson: string;
  today: string;
  resource: string;
}

const birthMatrixNumberProfiles: Record<number, BirthMatrixNumberProfile> = {
  1: {
    key: "initiator",
    archetype: "Инициатор",
    tier: "сильный импульс старта",
    strength: "быстро замечаете, где нужно взять ответственность и сделать первый шаг.",
    conflict: "можете торопить события и слышать отказ там, где человеку просто нужно время.",
    choice: "выбираете через личную свободу, ясную цель и ощущение собственного авторства.",
    relationship: "в близости важны уважение к самостоятельности и прямой разговор без давления.",
    money: "реализация растёт через собственные проекты, лидерские роли и смелые решения.",
    lesson: "учиться вести за собой мягко, не доказывая силу через контроль.",
    today: "начните одно дело, которое давно ждало вашего решения.",
    resource: "личная инициатива и умение включать движение там, где всё застыло.",
  },
  2: {
    key: "diplomat",
    archetype: "Дипломат",
    tier: "тонкая эмоциональная настройка",
    strength: "чувствуете нюансы отношений и умеете снижать напряжение.",
    conflict: "иногда слишком долго согласовываете выбор, чтобы никого не задеть.",
    choice: "выбираете через доверие, мягкие договорённости и чувство внутренней безопасности.",
    relationship: "вам нужен партнёр, который слышит интонации и не обесценивает чувствительность.",
    money: "лучше раскрываетесь в партнёрствах, сервисе, сопровождении и тонкой коммуникации.",
    lesson: "не растворяться в чужих ожиданиях и говорить о своих условиях раньше.",
    today: "сформулируйте одну просьбу честно и спокойно.",
    resource: "эмпатия, дипломатия и способность создавать пространство без борьбы.",
  },
  3: {
    key: "creator",
    archetype: "Творец",
    tier: "яркая творческая волна",
    strength: "переводите сложное в живой язык, идею, образ или настроение.",
    conflict: "можете распыляться, если вокруг много стимулов и мало структуры.",
    choice: "выбираете через интерес, вдохновение и возможность проявиться голосом.",
    relationship: "в любви важны лёгкость, юмор и ощущение, что рядом можно быть живым.",
    money: "доход растёт через креатив, публичность, обучение, контент или красивую упаковку смысла.",
    lesson: "доводить вдохновение до формы, а не только переживать его.",
    today: "запишите идею и сразу сделайте маленький видимый шаг.",
    resource: "творческая речь, лёгкость контакта и способность оживлять атмосферу.",
  },
  4: {
    key: "builder",
    archetype: "Архитектор",
    tier: "устойчивая земная опора",
    strength: "умеете собирать хаос в план, режим и понятную систему.",
    conflict: "можете зажимать себя рамками, когда жизнь просит гибкости.",
    choice: "выбираете через надёжность, факты и ощущение долгого фундамента.",
    relationship: "вам важно видеть поступки, регулярность и готовность строить вместе.",
    money: "сильны в процессах, управлении ресурсами, ремесле, аналитике и долгих проектах.",
    lesson: "оставлять место спонтанности, не теряя опору.",
    today: "упростите один процесс и освободите место для отдыха.",
    resource: "дисциплина, практичность и умение превращать намерение в систему.",
  },
  5: {
    key: "navigator",
    archetype: "Навигатор перемен",
    tier: "подвижная энергия выбора",
    strength: "быстро адаптируетесь и находите новый маршрут, когда прежний закрыт.",
    conflict: "можете уходить от глубины, если свобода кажется важнее ответственности.",
    choice: "выбираете через движение, опыт и возможность пробовать несколько вариантов.",
    relationship: "нужны честные правила свободы: без контроля, но с ясными договорённостями.",
    money: "раскрываетесь в коммуникациях, продажах, поездках, медиа, гибких форматах.",
    lesson: "свобода становится сильнее, когда у неё есть выбранное направление.",
    today: "обновите один маршрут: способ общения, рабочий шаг или личный ритуал.",
    resource: "любопытство, скорость, адаптивность и талант видеть варианты.",
  },
  6: {
    key: "keeper",
    archetype: "Хранитель тепла",
    tier: "сердечная ответственность",
    strength: "создаёте ощущение заботы, красоты и эмоционального дома.",
    conflict: "иногда берёте на себя больше, чем действительно ваше.",
    choice: "выбираете через ценность близких, гармонию и желание сделать пространство лучше.",
    relationship: "в паре важны взаимная забота, благодарность и честное распределение нагрузки.",
    money: "сильны в красоте, заботе, наставничестве, дизайне, семье, сервисе и людях.",
    lesson: "заботиться о себе так же внимательно, как о других.",
    today: "сделайте один тёплый жест без самопожертвования.",
    resource: "умение соединять людей, успокаивать пространство и добавлять красоту.",
  },
  7: {
    key: "seeker",
    archetype: "Исследователь",
    tier: "глубокая внутренняя настройка",
    strength: "видите скрытые связи и умеете задавать вопросы глубже поверхности.",
    conflict: "можете закрываться, когда мир требует быстрых ответов.",
    choice: "выбираете через смысл, наблюдение и внутреннее доказательство.",
    relationship: "вам нужна близость, где уважают тишину, личное пространство и честность.",
    money: "сильны в аналитике, исследовании, обучении, экспертности, духовных практиках без фанатизма.",
    lesson: "делиться выводами, не ожидая идеального момента.",
    today: "найдите 20 минут тишины и сформулируйте один точный вывод.",
    resource: "интуитивная аналитика, самостоятельность и способность видеть глубину.",
  },
  8: {
    key: "strategist",
    archetype: "Стратег",
    tier: "энергия влияния и результата",
    strength: "чувствуете масштаб, ресурсы и точки управленческого рычага.",
    conflict: "можете мерить ценность только эффективностью и перегружать себя.",
    choice: "выбираете через результат, справедливый обмен и ощущение силы.",
    relationship: "важно не соревноваться за власть, а договариваться о целях и границах.",
    money: "раскрываетесь в управлении, бизнесе, переговорах, финансах и больших задачах.",
    lesson: "сила не обязана быть жёсткой, чтобы быть заметной.",
    today: "пересмотрите одну договорённость: где нужен баланс вклада и отдачи.",
    resource: "стратегичность, выносливость и умение собирать результат.",
  },
  9: {
    key: "humanist",
    archetype: "Гуманист",
    tier: "широкое поле смысла",
    strength: "умеете видеть историю целиком и соединять личное с большим смыслом.",
    conflict: "можете спасать чужое, забывая о собственных границах.",
    choice: "выбираете через ценности, завершение циклов и ощущение пользы.",
    relationship: "в близости важны зрелость, сострадание и отсутствие эмоциональных игр.",
    money: "сильны в помощи, образовании, творчестве, международных темах и проектах со смыслом.",
    lesson: "закрывать старое вовремя, не таща всё прошлое в новый этап.",
    today: "завершите один маленький хвост и верните себе энергию.",
    resource: "мудрость, щедрость взгляда и способность превращать опыт в пользу.",
  },
  11: {
    key: "intuitive_guide",
    archetype: "Интуитивный проводник",
    tier: "мастерская интуитивная чувствительность",
    strength: "тонко считываете атмосферу и можете вдохновлять людей образом будущего.",
    conflict: "чувствительность перегружает, если нет режима и заземления.",
    choice: "выбираете через внутренний сигнал, красоту идеи и доверие к знакам без фанатизма.",
    relationship: "нужны бережность, честность и партнёр, который не высмеивает тонкость восприятия.",
    money: "раскрываетесь в вдохновляющих проектах, медиа, обучении, красоте, практиках внимания.",
    lesson: "переводить интуицию в спокойные действия и проверяемые шаги.",
    today: "запишите главный внутренний сигнал и подтвердите его одним реальным действием.",
    resource: "интуиция, образность, способность вдохновлять и чувствовать момент.",
  },
  22: {
    key: "system_creator",
    archetype: "Создатель систем",
    tier: "мастерская энергия воплощения",
    strength: "видите большой замысел и можете собрать под него работающую структуру.",
    conflict: "масштаб пугает, если пытаться сделать всё сразу.",
    choice: "выбираете через пользу, долгий результат и возможность построить нечто устойчивое.",
    relationship: "важны общая цель, честные роли и уважение к делу каждого.",
    money: "сильны в системах, проектах, управлении, продукте, строительстве процессов.",
    lesson: "делить большой путь на этапы и доверять постепенности.",
    today: "разбейте большую цель на три шага и выполните первый.",
    resource: "масштабное мышление, практичность и талант создавать устойчивые формы.",
  },
  33: {
    key: "heart_mentor",
    archetype: "Наставник сердца",
    tier: "мастерская энергия поддержки",
    strength: "умеете соединять заботу, смысл и личный пример.",
    conflict: "можете становиться спасателем, когда нужна честная граница.",
    choice: "выбираете через любовь, пользу и ощущение, что ваше действие согревает других.",
    relationship: "в паре важно не учить сверху, а быть рядом и говорить по-человечески.",
    money: "раскрываетесь в наставничестве, помощи, красоте, обучении и проектах с человеческим лицом.",
    lesson: "помогать без самопотери и оставлять людям их ответственность.",
    today: "поддержите кого-то одним тёплым действием и не забывайте о себе.",
    resource: "сердечность, зрелая забота и способность поднимать людей мягким примером.",
  },
};

function sumDigits(n: number): number {
  return Math.abs(n).toString().split('').reduce((acc, curr) => acc + parseInt(curr, 10), 0);
}

function reduceToSingleDigit(n: number): number {
  let result = n;
  while (result > 9 && result !== 11 && result !== 22 && result !== 33) {
    result = sumDigits(result);
  }
  return result;
}

function getNumberProfile(number: number): BirthMatrixNumberProfile {
  const normalized = number === 11 || number === 22 || number === 33 ? number : ((number - 1) % 9) + 1;
  return birthMatrixNumberProfiles[normalized] ?? birthMatrixNumberProfiles[1];
}

function parseBirthMatrixDate(value: string) {
  const parsed = parseDateInput(value, { emptyError: "" });
  if (!parsed.ok || parsed.year > 2099) return null;
  // Package 147: block future birth dates (1900 .. today).
  if (!isBirthDateInAllowedRange(parsed.iso)) return null;

  return {
    day: parsed.day,
    month: parsed.month,
    year: parsed.year,
    displayDate: parsed.display,
  };
}

export function generateBirthMatrix(birthDateString: string): MysticBirthMatrix | null {
  const parsed = parseBirthMatrixDate(birthDateString);
  if (!parsed) return null;

  const { day, month, year } = parsed;
  const dayReduced = reduceToSingleDigit(day);
  const monthReduced = reduceToSingleDigit(month);
  const yearReduced = reduceToSingleDigit(year);
  const lifePath = reduceToSingleDigit(dayReduced + monthReduced + yearReduced);
  const soulNumber = reduceToSingleDigit(dayReduced + monthReduced);
  const realizationNumber = reduceToSingleDigit(monthReduced + yearReduced);
  const relationshipNumber = reduceToSingleDigit(dayReduced + lifePath);
  const lessonNumber = reduceToSingleDigit(lifePath + yearReduced);
  const resourceNumber = reduceToSingleDigit(soulNumber + monthReduced);
  const profile = getNumberProfile(lifePath);
  const soulProfile = getNumberProfile(soulNumber);
  const realizationProfile = getNumberProfile(realizationNumber);
  const relationshipProfile = getNumberProfile(relationshipNumber);
  const lessonProfile = getNumberProfile(lessonNumber);
  const resourceProfile = getNumberProfile(resourceNumber);
  const energyProfile = getNumberProfile(monthReduced);
  const dayProfile = getNumberProfile(dayReduced);
  const recommendations = [
    `Держите главный ресурс: ${profile.resource}`,
    `В отношениях опирайтесь на правило: ${relationshipProfile.relationship}`,
    `Для реализации выберите один практичный шаг: ${realizationProfile.today}`,
  ];
  const visualCells: BirthMatrixVisualCell[] = [
    { id: "character", label: "Характер", number: dayReduced, title: dayProfile.archetype, summary: dayProfile.strength },
    { id: "relationships", label: "Отношения", number: relationshipNumber, title: relationshipProfile.archetype, summary: relationshipProfile.relationship },
    { id: "money", label: "Деньги", number: realizationNumber, title: realizationProfile.archetype, summary: realizationProfile.money },
    { id: "energy", label: "Энергия", number: monthReduced, title: energyProfile.archetype, summary: energyProfile.resource },
    { id: "lesson", label: "Урок", number: lessonNumber, title: lessonProfile.archetype, summary: lessonProfile.lesson },
    { id: "resource", label: "Ресурс", number: resourceNumber, title: resourceProfile.archetype, summary: resourceProfile.resource },
  ];
  const todayAction = {
    action: profile.today,
    avoid: `не уходите в автоматический сценарий: ${profile.conflict}`,
    tone: relationshipProfile.choice,
    smallStep: recommendations[2],
  };

  return {
    matrixType: "symbolic_birth_date",
    displayDate: parsed.displayDate,
    centralNumber: lifePath,
    lifePath,
    soulNumber,
    realizationNumber,
    relationshipNumber,
    dayNumber: dayReduced,
    monthNumber: monthReduced,
    yearSum: yearReduced,
    lessonNumber,
    resourceNumber,
    archetype: profile.archetype,
    archetypeKey: profile.key,
    tier: profile.tier,
    hero: `Главный код ${lifePath} описывает стиль движения: ${profile.strength} Это не приговор, а карта внимания: где проще включить ресурс и где полезно замедлиться.`,
    honesty: "символическая интерпретация по дате рождения",
    strengths: profile.strength,
    risks: profile.conflict,
    relationships: relationshipProfile.relationship,
    moneyWork: realizationProfile.money,
    advice: todayAction.action,
    visualCells,
    sections: [
      {
        id: "main",
        tab: "Главное",
        title: `Главный код: ${lifePath} · ${profile.archetype}`,
        eyebrow: "Центр матрицы",
        body: `В этой символической модели число пути показывает основной способ выбирать направление. Для кода ${lifePath} ключевой ресурс: ${profile.resource}`,
        points: [
          `Сильная сторона: ${profile.strength}`,
          `Внутренний конфликт: ${profile.conflict}`,
          `Как человек выбирает: ${profile.choice}`,
        ],
      },
      {
        id: "character",
        tab: "Характер",
        title: `Характер: день ${dayReduced} · ${dayProfile.archetype}`,
        eyebrow: "Как проявляется личный стиль",
        body: `День рождения в матрице показывает первый, заметный слой поведения. Здесь активен архетип ${dayProfile.archetype.toLowerCase()}: ${dayProfile.strength}`,
        points: [
          `Ресурс дня: ${dayProfile.resource}`,
          `Если напряжение растёт: ${dayProfile.conflict}`,
          `Лучший способ решения: ${dayProfile.choice}`,
        ],
      },
      {
        id: "relationships",
        tab: "Отношения",
        title: `Отношения: код ${relationshipNumber} · ${relationshipProfile.archetype}`,
        eyebrow: "Как строится близость",
        body: `Код отношений показывает, какой формат контакта легче всего поддерживает тепло и честность. Для этой матрицы важен принцип: ${relationshipProfile.relationship}`,
        points: [
          `Сильная сторона в паре: ${relationshipProfile.strength}`,
          `Риск близости: ${relationshipProfile.conflict}`,
          `Фраза-настройка: говорите о потребности до того, как она станет претензией.`,
        ],
      },
      {
        id: "money",
        tab: "Деньги",
        title: `Деньги и реализация: код ${realizationNumber} · ${realizationProfile.archetype}`,
        eyebrow: "Где проще собирать результат",
        body: `Число реализации показывает, через какой тип действий легче превращать талант в понятный результат. Здесь работает формула: ${realizationProfile.money}`,
        points: [
          `Рабочий ресурс: ${realizationProfile.resource}`,
          `Что мешает: ${realizationProfile.conflict}`,
          `Практика: выберите один измеримый шаг и доведите его до формы.`,
        ],
      },
      {
        id: "lesson",
        tab: "Урок",
        title: `Жизненный урок: код ${lessonNumber} · ${lessonProfile.archetype}`,
        eyebrow: "Без фатализма, как точка роста",
        body: `Урок матрицы не означает неизбежность. Это повторяющаяся тема внимания: ${lessonProfile.lesson}`,
        points: [
          `Когда тема включается: ${lessonProfile.conflict}`,
          `Зрелый ответ: ${lessonProfile.choice}`,
          `Ресурс выхода: ${resourceProfile.resource}`,
        ],
      },
      {
        id: "today",
        tab: "Сегодня",
        title: "Что делать сегодня",
        eyebrow: "Маленькое действие вместо большого обещания",
        body: `Сегодня матрицу лучше использовать как мягкую подсказку к действию: ${todayAction.action}`,
        points: [
          `Избегать: ${todayAction.avoid}`,
          `Лучший тон: ${todayAction.tone}`,
          `Маленький шаг: ${todayAction.smallStep}`,
        ],
      },
    ],
    recommendations,
    todayAction,
  };
}
