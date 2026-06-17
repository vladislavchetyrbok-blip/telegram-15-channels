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
  lifePath: number;
  dayNumber: number;
  monthNumber: number;
  yearSum: number;
  strengths: string;
  risks: string;
  relationships: string;
  moneyWork: string;
  advice: string;
}

function sumDigits(n: number): number {
  return n.toString().split('').reduce((acc, curr) => acc + parseInt(curr, 10), 0);
}

function reduceToSingleDigit(n: number): number {
  let result = n;
  while (result > 9 && result !== 11 && result !== 22 && result !== 33) {
    result = sumDigits(result);
  }
  return result;
}

export function generateBirthMatrix(birthDateString: string): MysticBirthMatrix | null {
  if (!birthDateString || birthDateString.length !== 10) return null;
  const parts = birthDateString.split(".");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  const dayReduced = reduceToSingleDigit(day);
  const monthReduced = reduceToSingleDigit(month);
  const yearReduced = reduceToSingleDigit(year);
  const lifePath = reduceToSingleDigit(dayReduced + monthReduced + yearReduced);

  const strengthsList = [
    "Символизирует лидерство и инициативу.",
    "Символизирует эмпатию и дипломатию.",
    "Символизирует творчество и радость.",
    "Символизирует стабильность и порядок.",
    "Символизирует свободу и адаптивность.",
    "Символизирует заботу и ответственность.",
    "Символизирует мудрость и аналитику.",
    "Символизирует амбиции и управление.",
    "Символизирует гуманизм и широту взглядов."
  ];

  const risksList = [
    "Эгоизм, излишняя категоричность.",
    "Чрезмерная чувствительность, нерешительность.",
    "Рассеянность, поверхностность.",
    "Упрямство, жесткость рамок.",
    "Непостоянство, импульсивность.",
    "Чрезмерная опека, идеализм.",
    "Изоляция, излишний критицизм.",
    "Трудоголизм, властность.",
    "Эмоциональные качели, отрыв от реальности."
  ];

  const idx = (lifePath <= 9 ? lifePath : lifePath % 9 || 1) - 1;

  return {
    lifePath,
    dayNumber: dayReduced,
    monthNumber: monthReduced,
    yearSum: yearReduced,
    strengths: strengthsList[idx] || strengthsList[0],
    risks: risksList[idx] || risksList[0],
    relationships: "Ваши числа указывают на потребность в глубоком взаимопонимании.",
    moneyWork: "Матрица подсказывает, что успех приходит через реализацию заложенного потенциала.",
    advice: "Используйте свои сильные стороны осознанно."
  };
}
