export type ZodiacCompatibilityScoreProfile = {
  total?: number;
  attraction?: number;
  communication?: number;
  love?: number;
  household?: number;
};

export type ZodiacCompatibilityCopyInput = {
  firstName?: string;
  secondName?: string;
  firstBirthDate?: string;
  secondBirthDate?: string;
  firstSign?: string;
  secondSign?: string;
  relationshipMode?: string;
  scoreProfile?: ZodiacCompatibilityScoreProfile;
};

export type ZodiacCompatibilityPersonalizedCopy = {
  riskIntro: string;
  riskLines: string[];
  communicationTitle: string;
  communicationInsight: string;
  communicationAdvice: string[];
  boundaries: string[];
  emotionalFocus: string;
  nextStep: string;
};

type ZodiacElement = "fire" | "earth" | "air" | "water";
type ScoreArea = "attraction" | "communication" | "love" | "household";

type SignProfile = {
  slug: string;
  aliases: string[];
  name: string;
  element: ZodiacElement;
  rhythm: string;
  need: string;
  risk: string;
  communication: string;
  boundary: string;
  support: string;
  strength: string;
  question: string;
};

const signProfiles: SignProfile[] = [
  {
    slug: "aries",
    aliases: ["aries", "oven", "овен"],
    name: "Овен",
    element: "fire",
    rhythm: "быстро загорается и легче говорит через действие",
    need: "честная реакция без затяжного ожидания",
    risk: "может ускорять разговор, когда тревожится",
    communication: "коротко назвать желание и оставить место ответу",
    boundary: "не давить скоростью, если партнёру нужна пауза",
    support: "видимый первый шаг без соревнования",
    strength: "смелость поднимать важные темы",
    question: "Что мы можем решить одним маленьким шагом сегодня?",
  },
  {
    slug: "taurus",
    aliases: ["taurus", "telec", "телец"],
    name: "Телец",
    element: "earth",
    rhythm: "раскрывается через устойчивость и понятные жесты",
    need: "надёжность, телесное спокойствие и ясные обещания",
    risk: "может упрямиться, если чувствует давление",
    communication: "говорить через факты, заботу и конкретный срок",
    boundary: "не торопить перемены без опоры",
    support: "простая забота, которую можно повторить",
    strength: "умение удерживать тепло в быту",
    question: "Какая договорённость сделает нам обоим спокойнее?",
  },
  {
    slug: "gemini",
    aliases: ["gemini", "bliznecy", "близнецы"],
    name: "Близнецы",
    element: "air",
    rhythm: "быстро считывает нюансы и ищет живой диалог",
    need: "лёгкость, интерес и возможность уточнить смысл",
    risk: "может уходить в объяснения вместо признания чувства",
    communication: "разделить мысль на один вопрос и один вывод",
    boundary: "не превращать разговор в поток версий",
    support: "интересный вопрос без скрытой проверки",
    strength: "умение находить слова для сложного состояния",
    question: "Какой смысл ты хочешь, чтобы я услышал сейчас?",
  },
  {
    slug: "cancer",
    aliases: ["cancer", "rak", "рак"],
    name: "Рак",
    element: "water",
    rhythm: "глубоко реагирует на тон и безопасность",
    need: "бережность, подтверждение близости и право не спешить",
    risk: "может молчать, когда боится ранить или быть непонятым",
    communication: "начать с признания чувства, а потом перейти к просьбе",
    boundary: "не угадывать за другого и не копить обиду",
    support: "мягкое подтверждение, что связь на месте",
    strength: "тонкое внимание к эмоциональному климату",
    question: "Что сейчас поможет почувствовать себя рядом, а не по разные стороны?",
  },
  {
    slug: "leo",
    aliases: ["leo", "lev", "лев"],
    name: "Лев",
    element: "fire",
    rhythm: "раскрывается через признание, игру и тёплый жест",
    need: "уважение, видимость вклада и честная похвала",
    risk: "может защищать гордость резче, чем требует ситуация",
    communication: "сначала признать ценность, затем обсуждать правку",
    boundary: "не мерить любовь вниманием в один момент",
    support: "искреннее признание без театра и сравнения",
    strength: "способность быстро возвращать тепло",
    question: "Где сегодня можно поддержать друг друга заметнее?",
  },
  {
    slug: "virgo",
    aliases: ["virgo", "deva", "дева"],
    name: "Дева",
    element: "earth",
    rhythm: "ищет порядок, точность и спокойный план",
    need: "понятные детали и уважение к усилиям",
    risk: "может звучать критично, когда пытается помочь",
    communication: "отделить заботу от замечаний и назвать один факт",
    boundary: "не чинить партнёра вместо просьбы",
    support: "аккуратный план и благодарность за конкретику",
    strength: "умение превращать хаос в понятные шаги",
    question: "Какую одну деталь мы можем поправить без взаимных оценок?",
  },
  {
    slug: "libra",
    aliases: ["libra", "vesy", "весы"],
    name: "Весы",
    element: "air",
    rhythm: "держит контакт через баланс и красоту формулировок",
    need: "справедливость, мягкий тон и ощущение выбора",
    risk: "может сглаживать конфликт, пока тема не станет тяжелее",
    communication: "сказать честно, но с уважением к обеим позициям",
    boundary: "не соглашаться ради мира, если внутри уже есть напряжение",
    support: "равный обмен вопросами и вниманием",
    strength: "талант переводить спор в диалог",
    question: "Какой вариант будет честным для нас двоих?",
  },
  {
    slug: "scorpio",
    aliases: ["scorpio", "skorpion", "скорпион"],
    name: "Скорпион",
    element: "water",
    rhythm: "считывает скрытые мотивы и нуждается в доверии",
    need: "искренность, глубина и отсутствие двойных сигналов",
    risk: "может проверять надёжность там, где лучше попросить прямо",
    communication: "называть сомнение без допроса и оставлять право на ответ",
    boundary: "не искать подвох в каждом молчании",
    support: "честное признание без игры в неуязвимость",
    strength: "способность идти в глубину, когда связь важна",
    question: "Что поможет нам почувствовать больше доверия прямо сейчас?",
  },
  {
    slug: "sagittarius",
    aliases: ["sagittarius", "strelec", "стрелец"],
    name: "Стрелец",
    element: "fire",
    rhythm: "дышит свободой, честностью и большим смыслом",
    need: "пространство, прямота и вера в общий горизонт",
    risk: "может сказать слишком резко, если чувствует ограничение",
    communication: "сначала обозначить свободу выбора, потом договориться о шаге",
    boundary: "не обещать из вдохновения больше, чем реально потянуть",
    support: "общая цель, в которой есть место личному темпу",
    strength: "умение возвращать перспективу",
    question: "Какой общий смысл мы хотим сохранить в этом разговоре?",
  },
  {
    slug: "capricorn",
    aliases: ["capricorn", "kozerog", "козерог"],
    name: "Козерог",
    element: "earth",
    rhythm: "доверяет делам, структуре и выдержке",
    need: "уважение к ответственности и предсказуемый план",
    risk: "может закрываться, если разговор кажется бесполезным",
    communication: "перевести эмоцию в реалистичную договорённость",
    boundary: "не заменять близость контролем результата",
    support: "надежный шаг, который подтверждается действием",
    strength: "умение выдерживать сложные периоды",
    question: "Какой практичный шаг подтвердит, что мы в одной команде?",
  },
  {
    slug: "aquarius",
    aliases: ["aquarius", "vodoley", "водолей"],
    name: "Водолей",
    element: "air",
    rhythm: "сохраняет связь через свободу мысли и честную дистанцию",
    need: "уважение к независимости и необычному взгляду",
    risk: "может уходить в холодную логику, когда чувства перегреваются",
    communication: "дать пространство и вернуться к разговору без обвинений",
    boundary: "не наказывать дистанцией вместо ясной просьбы",
    support: "свободный формат, где можно быть собой",
    strength: "способность видеть нестандартное решение",
    question: "Как нам оставить пространство и всё равно остаться в контакте?",
  },
  {
    slug: "pisces",
    aliases: ["pisces", "ryby", "рыбы"],
    name: "Рыбы",
    element: "water",
    rhythm: "тонко чувствует подтекст и нуждается в мягкости",
    need: "сочувствие, нежность и ясные берега",
    risk: "может растворяться в ожиданиях партнёра",
    communication: "говорить простыми словами и проверять реальность фактов",
    boundary: "не спасать отношения ценой собственной ясности",
    support: "тихое внимание и понятная опора",
    strength: "умение возвращать в контакт сострадание",
    question: "Что из наших чувств сейчас факт, а что только тревожная догадка?",
  },
];

const signByAlias = signProfiles.reduce<Record<string, SignProfile>>((accumulator, profile) => {
  for (const alias of profile.aliases) accumulator[alias] = profile;
  accumulator[profile.slug] = profile;
  accumulator[normalizeSeedPart(profile.name)] = profile;
  return accumulator;
}, {});

const elementProfiles: Record<ZodiacElement, { name: string; asset: string; pressure: string; repair: string }> = {
  fire: {
    name: "огонь",
    asset: "живое тепло и инициативу",
    pressure: "спешка легко звучит как давление",
    repair: "дать энергии направление и короткую паузу",
  },
  earth: {
    name: "земля",
    asset: "устойчивость и заботу делом",
    pressure: "контроль деталей может закрыть мягкость",
    repair: "опереться на один понятный план",
  },
  air: {
    name: "воздух",
    asset: "лёгкий диалог и свежий взгляд",
    pressure: "избыток слов может спрятать чувство",
    repair: "сократить объяснения до одной честной мысли",
  },
  water: {
    name: "вода",
    asset: "эмпатию и тонкое считывание состояния",
    pressure: "молчаливые ожидания быстро становятся обидой",
    repair: "назвать чувство до того, как оно станет защитой",
  },
};

const relationshipProfiles: Record<string, { label: string; focus: string; risk: string; action: string }> = {
  love: {
    label: "любви",
    focus: "тепло, признание и спокойное подтверждение чувств",
    risk: "искать доказательства любви через реакцию партнёра",
    action: "один нежный жест и один честный вопрос",
  },
  friendship: {
    label: "дружбы",
    focus: "уважение границ и честная поддержка",
    risk: "обесценить разный темп общения",
    action: "коротко договориться, как поддерживать связь без давления",
  },
  work: {
    label: "делового союза",
    focus: "роли, сроки и спокойные правила взаимодействия",
    risk: "смешать личный тон с рабочей задачей",
    action: "зафиксировать один результат и одну зону ответственности",
  },
  family: {
    label: "семьи",
    focus: "бытовые договорённости и бережное отношение к усталости",
    risk: "переносить накопленную усталость на весь союз",
    action: "согласовать маленькую помощь в доме или расписании",
  },
  passion: {
    label: "страсти",
    focus: "искру без ревности и борьбы за внимание",
    risk: "проверять притяжение через резкость или дистанцию",
    action: "вернуть игру, но оставить ясные границы",
  },
  reconciliation: {
    label: "примирения",
    focus: "мягкий тон, признание своей части и отказ от старого сценария",
    risk: "повторить спор как доказательство правоты",
    action: "начать с фразы о том, что каждый готов сделать иначе",
  },
};

const scoreAreaLabels: Record<ScoreArea, string> = {
  attraction: "притяжение",
  communication: "общение",
  love: "эмоциональная близость",
  household: "общий ритм",
};

const dateRhythmLines = [
  "разный внутренний темп; лучше заранее договариваться о паузах",
  "потребность сверять ожидания без спешки",
  "тему доверия к словам и маленьким повторяемым действиям",
  "разную скорость восстановления после напряжения",
  "сильную чувствительность к тому, насколько обещания совпадают с делами",
  "желание видеть не только эмоцию, но и понятный следующий шаг",
];

const scoreBandLines = {
  strong: [
    "ресурса достаточно, поэтому важнее не доказывать связь, а беречь её качество",
    "пара легче возвращается к теплу, если не спорит на пике эмоций",
    "главный ресурс уже есть; его стоит поддерживать регулярными маленькими жестами",
  ],
  medium: [
    "связь раскрывается волнами, поэтому особенно полезны короткие договорённости",
    "пара выигрывает, когда не угадывает мотивы, а сверяет смысл слов",
    "потенциал есть, но ему нужна форма: время разговора, тон и один конкретный вопрос",
  ],
  tense: [
    "напряжение снижается, когда разговор не начинается с обвинения",
    "лучше двигаться маленькими шагами, иначе защита включается быстрее доверия",
    "сначала стоит вернуть безопасность, а уже потом обсуждать сложную тему",
  ],
};

export function buildZodiacCompatibilityPersonalizedCopy(input: ZodiacCompatibilityCopyInput): ZodiacCompatibilityPersonalizedCopy {
  const first = resolveSign(input.firstSign);
  const second = resolveSign(input.secondSign);
  const relationship = relationshipProfiles[normalizeMode(input.relationshipMode)] ?? relationshipProfiles.love;
  const scores = input.scoreProfile ?? {};
  const seed = buildCopySeed(input);
  const usedPhrases = new Set<string>();
  const firstLabel = normalizeDisplayName(input.firstName) || first.name;
  const secondLabel = normalizeDisplayName(input.secondName) || second.name;
  const pairLabel = `${firstLabel} и ${secondLabel}`;
  const firstElement = elementProfiles[first.element];
  const secondElement = elementProfiles[second.element];
  const lowestArea = findLowestScoreArea(scores);
  const scoreBand = resolveScoreBand(scores.total);
  const dateRhythm = buildDateRhythm(input, seed);
  const elementContrast =
    first.element === second.element
      ? `общая стихия ${firstElement.name} усиливает ${firstElement.asset}, но ${firstElement.pressure}`
      : `${first.name} приносит ${firstElement.asset}, а ${second.name} — ${secondElement.asset}`;

  const riskIntro = markUsed(
    `Для ${pairLabel} зона риска не в несовместимости, а в том, что ${first.name} ${first.risk}, а ${second.name} ${second.risk}. В режиме ${relationship.label} особенно важно не ${relationship.risk}.`,
    usedPhrases,
  );
  const emotionalFocus = markUsed(
    `${relationship.focus}: ${elementContrast}. ${pickLine(scoreBandLines[scoreBand], seed, 12)}.`,
    usedPhrases,
  );
  const communicationInsight = markUsed(
    `${pairLabel}: ${first.name} лучше слышит контакт, когда можно ${first.communication}; ${second.name} спокойнее отвечает, когда можно ${second.communication}. ${dateRhythm}`,
    usedPhrases,
  );
  const nextStep = markUsed(
    `Следующий шаг для ${pairLabel}: ${relationship.action}; затем проверить, стало ли легче в зоне "${scoreAreaLabels[lowestArea.key]}".`,
    usedPhrases,
  );

  const riskLines = pickUniqueLines(
    [
      `${first.name} может воспринять ${second.rhythm} как задержку контакта; заранее согласуйте, когда вернётесь к теме.`,
      `${second.name} может прочитать ${first.rhythm} как давление; перед ответом полезно повторить, что именно услышано.`,
      `Если проседает ${scoreAreaLabels[lowestArea.key]}, не смешивайте эту тему с прошлым спором и бытовыми претензиями.`,
      `Разница стихий требует перевода: ${firstElement.repair}, а затем ${secondElement.repair}.`,
      `${firstLabel} и ${secondLabel} теряют опору, когда разговор начинается с оценки характера вместо одной просьбы.`,
      `В режиме ${relationship.label} опаснее всего ${relationship.risk}; замените проверку на прямой вопрос.`,
      `Когда ${first.name} защищает ${first.need}, а ${second.name} защищает ${second.need}, спор быстро становится про безопасность, а не про тему.`,
      `Не растягивайте молчание: для этой пары пауза работает только с понятным временем возврата к разговору.`,
      `Если один ждёт жеста, а другой ждёт формулировки, связь лучше чинить через короткое "что ты сейчас просишь?".`,
    ],
    seed,
    "risk",
    3,
    usedPhrases,
  );

  const communicationAdvice = pickUniqueLines(
    [
      `${firstLabel}: начать с одной потребности; ${secondLabel}: ответить одной конкретной договорённостью.`,
      `Сначала задайте вопрос "${first.question}", потом вопрос "${second.question}".`,
      `Формула разговора: состояние, просьба, срок. Для ${first.name} это снижает спешку, для ${second.name} — тревогу.`,
      `Если тон стал резким, остановитесь на минуту и вернитесь к теме через факт, а не через вывод о чувствах.`,
      `Лучший формат: короткое сообщение или разговор до десяти минут, где каждый называет один важный пункт.`,
      `Сильная сторона пары — ${first.strength} плюс ${second.strength}; используйте её как мост, а не как аргумент в споре.`,
      `Поддержка работает точнее, когда ${first.name} получает ${first.support}, а ${second.name} получает ${second.support}.`,
      `Сверяйте не только слова, но и действие: что каждый готов сделать сегодня, чтобы контакт стал спокойнее.`,
    ],
    seed,
    "communication",
    3,
    usedPhrases,
  );

  const boundaries = pickUniqueLines(
    [
      `Граница ${first.name}: ${first.boundary}; граница ${second.name}: ${second.boundary}.`,
      `Не обсуждайте всё сразу: одна тема, один срок, один способ вернуться к контакту.`,
      `Если разговор ушёл в защиту, переносите его на конкретное время, а не оставляйте в подвешенном виде.`,
      `Не сравнивайте вклад; отмечайте, какой маленький шаг уже сделан и какой нужен следующим.`,
      `Для ${relationship.label} полезнее выбрать действие, чем искать победителя в интерпретации слов.`,
      `Если личные даты или прошлый опыт усиливают тревогу, проговаривайте ожидание прямо: "мне важно понять срок/тон/границу".`,
      `Сложную тему лучше начинать не ночью и не после перегруза: этой паре важна энергия спокойного разговора.`,
    ],
    seed,
    "boundaries",
    3,
    usedPhrases,
  );

  return {
    riskIntro,
    riskLines,
    communicationTitle: `Как общаться в режиме ${relationship.label}`,
    communicationInsight,
    communicationAdvice,
    boundaries,
    emotionalFocus,
    nextStep,
  };
}

export function normalizeZodiacCompatibilityCopyPhrase(value: string): string {
  return String(value)
    .toLocaleLowerCase("ru-RU")
    .replace(/ё/g, "е")
    .replace(/[^0-9a-zа-яе\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildCopySeed(input: ZodiacCompatibilityCopyInput) {
  return hashString(
    [
      normalizeSeedPart(input.firstName),
      normalizeSeedPart(input.secondName),
      normalizeDateSeedPart(input.firstBirthDate),
      normalizeDateSeedPart(input.secondBirthDate),
      normalizeSeedPart(input.firstSign),
      normalizeSeedPart(input.secondSign),
      normalizeMode(input.relationshipMode),
      scoreProfileSeed(input.scoreProfile),
    ].join("|"),
  );
}

function buildDateRhythm(input: ZodiacCompatibilityCopyInput, seed: number) {
  const firstDate = normalizeDateSeedPart(input.firstBirthDate);
  const secondDate = normalizeDateSeedPart(input.secondBirthDate);
  const rhythm = pickLine(dateRhythmLines, seed, 21);

  if (firstDate && secondDate) return `Даты ${formatDateLabel(firstDate)} и ${formatDateLabel(secondDate)} добавляют ${rhythm}.`;
  if (firstDate || secondDate) return `Одна указанная дата уже добавляет ${rhythm}.`;
  return `Если добавить даты рождения, подсказки станут точнее, но базовый ритм пары уже виден по знакам.`;
}

function resolveSign(value?: string) {
  const normalized = normalizeSeedPart(value).replace(/[^0-9a-zа-яё_-]+/g, "");
  return signByAlias[normalized] ?? signProfiles[0]!;
}

function normalizeMode(value?: string) {
  return normalizeSeedPart(value) || "love";
}

function normalizeSeedPart(value?: string) {
  return String(value ?? "").trim().toLocaleLowerCase("ru-RU");
}

function normalizeDisplayName(value?: string) {
  const normalized = String(value ?? "").trim().replace(/\s+/g, " ");
  return normalized.length >= 2 ? normalized.slice(0, 24) : "";
}

function normalizeDateSeedPart(value?: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (iso) return isValidIsoDate(raw) ? raw : raw.toLocaleLowerCase("ru-RU");

  const dotted = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(raw);
  if (dotted) {
    const next = `${dotted[3]}-${dotted[2]}-${dotted[1]}`;
    return isValidIsoDate(next) ? next : raw.toLocaleLowerCase("ru-RU");
  }

  const compact = /^(\d{2})(\d{2})(\d{4})$/.exec(raw);
  if (compact) {
    const next = `${compact[3]}-${compact[2]}-${compact[1]}`;
    return isValidIsoDate(next) ? next : raw.toLocaleLowerCase("ru-RU");
  }

  return raw.toLocaleLowerCase("ru-RU");
}

function isValidIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function formatDateLabel(value: string) {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!iso) return value;
  return `${iso[3]}.${iso[2]}.${iso[1]}`;
}

function scoreProfileSeed(scoreProfile?: ZodiacCompatibilityScoreProfile) {
  if (!scoreProfile) return "";
  return [
    scoreProfile.total ?? "",
    scoreProfile.attraction ?? "",
    scoreProfile.communication ?? "",
    scoreProfile.love ?? "",
    scoreProfile.household ?? "",
  ].join(":");
}

function findLowestScoreArea(scoreProfile: ZodiacCompatibilityScoreProfile): { key: ScoreArea; value: number } {
  const fallback = scoreProfile.total ?? 60;
  const areas: { key: ScoreArea; value: number }[] = [
    { key: "attraction", value: scoreProfile.attraction ?? fallback },
    { key: "communication", value: scoreProfile.communication ?? fallback },
    { key: "love", value: scoreProfile.love ?? fallback },
    { key: "household", value: scoreProfile.household ?? fallback },
  ];
  return areas.sort((left, right) => left.value - right.value)[0]!;
}

function resolveScoreBand(score?: number): "strong" | "medium" | "tense" {
  if (typeof score !== "number") return "medium";
  if (score >= 70) return "strong";
  if (score >= 55) return "medium";
  return "tense";
}

function markUsed(value: string, usedPhrases: Set<string>) {
  usedPhrases.add(normalizeZodiacCompatibilityCopyPhrase(value));
  return value;
}

function pickUniqueLines(candidates: string[], seed: number, section: string, count: number, usedPhrases: Set<string>) {
  const ordered = candidates
    .filter(Boolean)
    .map((line, index) => ({ line, rank: hashString(`${seed}:${section}:${index}:${line}`) }))
    .sort((left, right) => left.rank - right.rank);
  const result: string[] = [];

  for (const candidate of ordered) {
    const normalized = normalizeZodiacCompatibilityCopyPhrase(candidate.line);
    if (!normalized || usedPhrases.has(normalized)) continue;
    usedPhrases.add(normalized);
    result.push(candidate.line);
    if (result.length >= count) break;
  }

  return result;
}

function pickLine(items: string[], seed: number, offset: number) {
  return items[variance(seed, offset, items.length)] ?? items[0] ?? "";
}

function variance(seed: number, offset: number, spread: number) {
  return hashString(`${seed}:${offset}`) % spread;
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
