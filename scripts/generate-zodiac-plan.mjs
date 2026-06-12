/**
 * Local Node.js generator for Zodiac Runtime Plan.
 * 
 * This script mirrors the client-side preview generator (lib/zodiac-content-generator.ts)
 * to safely generate a local runtime plan JSON without requiring TypeScript compilation
 * or Next.js server context.
 * 
 * It is completely self-contained with JS-safe constants aligned to the existing Zodiac config.
 */

import fs from "fs";
import path from "path";
import process from "process";

const zodiacChannels = [
  { id: "zodiac-general", ruName: "Гороскоп на сегодня", emoji: "✨", type: "general", element: "cosmic", visualPromptSeed: "Luxury mystic daily horoscope cover, dark zodiac wheel, cosmic gold details, black deep-blue violet palette, cinematic light, premium Telegram magazine aesthetic." },
  { id: "aries", ruName: "Овен", emoji: "♈️", type: "sign", element: "fire", visualPromptSeed: "Aries luxury mystic portrait, fire and armor, red-gold energy, controlled impulse, dark zodiac background, cinematic gold light.", visualSymbols: ["fire", "armor", "red-gold energy", "spark"] },
  { id: "taurus", ruName: "Телец", emoji: "♉️", type: "sign", element: "earth", visualPromptSeed: "Taurus premium zodiac visual, earth and stone textures, gold accents, calm power, luxury stillness, black-gold cinematic scene.", visualSymbols: ["earth", "stone", "gold", "calm power", "luxury"] },
  { id: "gemini", ruName: "Близнецы", emoji: "♊️", type: "sign", element: "air", visualPromptSeed: "Gemini dark zodiac editorial image, mirror reflections, twin portrait, air movement, elegant duality, violet-blue shadows and gold lines.", visualSymbols: ["mirrors", "twin portrait", "air", "duality"] },
  { id: "cancer", ruName: "Рак", emoji: "♋️", type: "sign", element: "water", visualPromptSeed: "Cancer premium mystic scene, moon over water, home symbolism, silver-blue cinematic light, dark zodiac mood, soft protective atmosphere.", visualSymbols: ["moon", "water", "home", "silver-blue light"] },
  { id: "leo", ruName: "Лев", emoji: "♌️", type: "sign", element: "fire", visualPromptSeed: "Leo luxury horoscope cover, sun and crown, theatrical stage light, royal gold, black zodiac backdrop, premium cinematic drama.", visualSymbols: ["sun", "crown", "stage", "royal gold"] },
  { id: "virgo", ruName: "Дева", emoji: "♍️", type: "sign", element: "earth", visualPromptSeed: "Virgo premium zodiac composition, marble, order, refined details, clean structure, black-gold editorial design, cinematic precision.", visualSymbols: ["marble", "order", "details", "clean structure"] },
  { id: "libra", ruName: "Весы", emoji: "♎️", type: "sign", element: "air", visualPromptSeed: "Libra dark luxury zodiac visual, balance scales, symmetry, aesthetic composition, soft gold and violet light, premium magazine look.", visualSymbols: ["balance", "symmetry", "aesthetics", "soft luxury light"] },
  { id: "scorpio", ruName: "Скорпион", emoji: "♏️", type: "sign", element: "water", visualPromptSeed: "Scorpio luxury mystic portrait, shadow and dark red depth, magnetic mystery, black-gold zodiac atmosphere, cinematic low light.", visualSymbols: ["shadow", "dark red", "depth", "mystery", "magnetism"] },
  { id: "sagittarius", ruName: "Стрелец", emoji: "♐️", type: "sign", element: "fire", visualPromptSeed: "Sagittarius cinematic zodiac scene, road and arrow toward horizon, movement and fire, dark blue sky, gold trail, premium mystic style.", visualSymbols: ["road", "arrow", "horizon", "movement"] },
  { id: "capricorn", ruName: "Козерог", emoji: "♑️", type: "sign", element: "earth", visualPromptSeed: "Capricorn black-gold zodiac architecture, mountain silhouette, discipline and status, premium cinematic lighting, luxury mystic editorial.", visualSymbols: ["mountain", "discipline", "status", "black-gold architecture"] },
  { id: "aquarius", ruName: "Водолей", emoji: "♒️", type: "sign", element: "air", visualPromptSeed: "Aquarius futuristic zodiac visual, electric blue neon ideas, dark cosmic background, gold accents, premium magazine futurism.", visualSymbols: ["future", "neon", "electric blue", "ideas"] },
  { id: "pisces", ruName: "Рыбы", emoji: "♓️", type: "sign", element: "water", visualPromptSeed: "Pisces premium mystic water scene, dream fog, violet-blue intuition, dark zodiac shimmer, cinematic soft light and gold details.", visualSymbols: ["water", "dream", "fog", "violet-blue intuition"] }
];

const zodiacStyles = {
  "luxury-mystic": { id: "luxury-mystic", ruName: "Luxury Mystic", visualStyle: "premium dark mystic, gold and black", promptAddons: "cinematic light, luxury editorial magazine photography" },
  "dark-zodiac": { id: "dark-zodiac", ruName: "Dark Zodiac", visualStyle: "deep shadows, stark contrast, minimal gold", promptAddons: "mysterious atmosphere, dark background, sharp details" },
  "soft-cosmic": { id: "soft-cosmic", ruName: "Soft Cosmic", visualStyle: "pastel galaxies, soft glow, silver accents", promptAddons: "ethereal lighting, soft focus background, dreamy aesthetic" }
};

const generalEnergy = ["День просит меньше шума и больше точности.", "Сегодня выигрывает тот, кто не спешит.", "День собирает внимание в одну точку.", "Не подгоняйте события."];
const loveLines = ["Мягкость важнее правоты.", "Не проверяйте чувства резкостью.", "Тепло проявляется в деталях.", "День ценит бережный тон."];
const moneyLines = ["Деньги любят холодную голову.", "Не время рисковать.", "Финансовая ясность начинается с малого.", "План важнее импульса."];
const workLines = ["Закройте один вопрос до конца.", "Сначала структура, потом скорость.", "Не берите чужой хаос.", "День подходит для точной правки."];
const adviceLines = ["Сначала порядок.", "Ответьте из позиции спокойствия.", "Сократите лишнее.", "Держите темп."];
const warningLines = ["Не спорьте там, где можно промолчать.", "Не принимайте настроение за факт.", "Не обещайте лишнего.", "Не ускоряйте чужие процессы."];

const generalIntroLines = [
  "День подходит для спокойной настройки: меньше резких решений, больше внимания к тому, что давно просит ясности.",
  "Сегодня важны точные слова, бережный ритм и умение не тратить силы на шум вокруг.",
  "Энергия дня мягкая, но собранная: она поддержит тех, кто действует без суеты и лишних обещаний.",
  "День просит честно посмотреть на свои планы и выбрать один главный фокус вместо десятка мелких тревог.",
  "Внимание к мелочам сегодня способно предотвратить крупный кризис завтра. Прислушивайтесь к интуиции.",
  "Сегодняшний день создан для анализа и планирования, а не для спонтанных и необдуманных шагов.",
];

const generalClosingLines = [
  "Не пытайтесь ускорить все сразу: один спокойный шаг сегодня ценнее трех импульсивных.",
  "Держите внимание на том, что можно улучшить без давления на себя и других.",
  "Сохраняйте внутреннюю опору: день лучше раскрывается через ясность, а не через спешку.",
  "Выбирайте действия, после которых останется больше порядка, тепла и свободного дыхания.",
  "Позвольте событиям развиваться своим чередом, мудрость заключается в умении вовремя отступить.",
];

const signDailyForecasts = {
  aries: [
    "сила дня в спокойной инициативе: начните важное, но не превращайте разговор в спор.",
    "энергии много, но результат даст не напор, а точный выбор одного главного действия.",
    "держите импульс под контролем: пауза перед ответом сегодня сохранит вам преимущество.",
    "сегодня ваша энергия должна быть направлена на созидание, избегайте конфликтов любой ценой.",
    "отложите импульсивные покупки и решения, лучше посвятите день планированию и стратегии.",
  ],
  taurus: [
    "день просит устойчивости: не меняйте план из-за чужой нервозности и берегите свой темп.",
    "хорошо навести порядок в делах и деньгах, без резких покупок и обещаний на эмоциях.",
    "ваша сила в простоте: закрепите то, что уже работает, и не распыляйтесь.",
    "стабильность сегодня — ваш лучший друг, не позволяйте внезапным обстоятельствам выбить вас из колеи.",
    "сфокусируйтесь на материальном благополучии и комфорте, избегайте неоправданных рисков.",
  ],
  gemini: [
    "слова сегодня особенно важны: говорите точнее и не берите на себя лишние объяснения.",
    "день принесет идеи, но выберите одну и доведите ее до понятной формы.",
    "не каждая мысль требует немедленного сообщения; фильтр сохранит энергию.",
    "избегайте поверхностных суждений, постарайтесь вникнуть в суть происходящего.",
    "ваша коммуникабельность сегодня может стать как ключом к успеху, так и источником проблем.",
  ],
  cancer: [
    "берегите личные границы мягко, но ясно; день не любит внутреннего перенапряжения.",
    "дом, близкие и чувство безопасности сегодня важнее внешней гонки за впечатлением.",
    "не закрывайтесь полностью: достаточно выбрать спокойный тон и честно назвать потребности.",
    "позвольте себе немного отдохнуть от забот о других и уделите время собственным чувствам.",
    "эмоциональная чувствительность сегодня повышена, старайтесь избегать токсичного общения.",
  ],
  leo: [
    "вас заметят без лишнего нажима; достоинство сегодня сильнее демонстрации.",
    "день подходит для красивого, но спокойного жеста: меньше драматизма, больше уверенности.",
    "не спорьте за внимание; оно придет туда, где есть тепло и внутренняя собранность.",
    "ваше лидерство сегодня должно проявляться через поддержку других, а не через приказы.",
    "направьте свою творческую энергию в конструктивное русло, не растрачивайте ее на пустые амбиции.",
  ],
  virgo: [
    "детали сегодня говорят громче общего настроения: проверьте план и уберите лишнее.",
    "не берите на себя чужой хаос; ваша задача — сделать свое чисто и вовремя.",
    "день хорош для правок, аккуратных решений и спокойного восстановления порядка.",
    "постарайтесь не критиковать ни себя, ни окружающих, позвольте событиям идти своим чередом.",
    "аналитический ум сегодня поможет найти выход из самой запутанной ситуации.",
  ],
  libra: [
    "баланс начнется с честности: не соглашайтесь только ради красивой тишины.",
    "день просит мягкой ясности в отношениях и выборе; не откладывайте очевидное.",
    "ваша дипломатия сильна, если в ней есть место собственным интересам.",
    "старайтесь сохранять гармонию во всем, избегайте крайностей и резких оценок.",
    "сегодня идеальный день для переговоров и поиска компромиссов, но не в ущерб себе.",
  ],
  scorpio: [
    "не раскрывайте все сразу: глубина сегодня сильнее прямого давления.",
    "магнетизм работает тихо; не тратьте его на борьбу там, где можно отойти в сторону.",
    "день подходит для внутренней настройки и точного разговора без лишней резкости.",
    "ваша проницательность сегодня на высоте, доверяйте своей интуиции, но проверяйте факты.",
    "избегайте манипуляций и скрытых мотивов, честность сегодня принесет больше пользы.",
  ],
  sagittarius: [
    "направление важнее скорости: выберите цель и не стреляйте во все стороны сразу.",
    "день может открыть новый маршрут, если не спорить с каждой мелкой задержкой.",
    "свобода сегодня начинается с понятного плана, а не с бегства от обязательств.",
    "постарайтесь сфокусироваться на деталях, не упуская из виду общую картину.",
    "ваш оптимизм заразителен, но сегодня важно также сохранять реалистичный взгляд на вещи.",
  ],
  capricorn: [
    "сильный день для дисциплины: маленький строгий шаг укрепит позицию лучше громких заявлений.",
    "не торопите признание результата; сначала фундамент, потом статус.",
    "дела пойдут ровнее, если убрать лишнее и оставить только проверенные решения.",
    "сегодня важно придерживаться плана и не поддаваться на провокации.",
    "ваш профессионализм и ответственность будут оценены по достоинству, продолжайте двигаться вперед.",
  ],
  aquarius: [
    "идея просит формы: запишите, соберите, проверьте и только потом показывайте миру.",
    "день поддержит нестандартный взгляд, если он не превращается в хаос.",
    "разговоры о будущем будут полезнее, если привязать их к одному конкретному шагу.",
    "ваша оригинальность сегодня может стать ключом к успеху, не бойтесь предлагать новые решения.",
    "сохраняйте баланс между инновациями и практическими задачами, не отрывайтесь от реальности.",
  ],
  pisces: [
    "интуиция точна, когда вы не смешиваете ее с тревогой; дайте себе тишину.",
    "день мягкий, но требует границ: не растворяйтесь в чужом настроении.",
    "сохраняйте связь с реальностью через простые дела и бережный режим.",
    "позвольте себе немного помечтать, но не забывайте о насущных обязанностях.",
    "ваша эмпатия сегодня может помочь кому-то из близких, но не берите на себя чужие проблемы.",
  ],
};

const signMainLines = {
  aries: [
    "Овен, день дает достаточно энергии, но не просит доказывать силу каждому встречному. Лучше выбрать одно направление и действовать спокойно: так импульс станет результатом, а не лишним напряжением. Если разговор становится острым, пауза сработает лучше прямого давления.",
    "Овен, сегодня важно не путать скорость с уверенностью. Там, где вы не торопитесь отвечать, появляется контроль и шанс увидеть лучший ход. День поддержит инициативу, если она точная и не разрушает уже собранный порядок.",
    "Овен, сегодня вы можете почувствовать сильное желание действовать прямолинейно, но дипломатия принесет больше пользы. Оценивайте риски перед каждым шагом и не пытайтесь пробить стену лбом.",
  ],
  taurus: [
    "Телец, день укрепляет все, что построено спокойно и без лишней спешки. Вам полезно держаться понятного плана, не реагируя на чужие перепады настроения. Маленькое практичное решение сегодня даст больше, чем резкая попытка все обновить.",
    "Телец, ваша устойчивость сегодня заметнее громких слов. Проверьте ресурсы, договоренности и собственный темп: там может найтись простая точка роста. Не тратьте силы на то, что не дает ни ясности, ни внутреннего спокойствия.",
    "Телец, сегодня ваше упрямство может сыграть с вами злую шутку. Постарайтесь быть более гибкими в общении и не бойтесь идти на компромисс, если это сохранит ваши нервы и время.",
  ],
  gemini: [
    "Близнецы, день делает слова сильным инструментом, но требует фильтра. Не каждая мысль должна сразу становиться сообщением или обещанием. Если вы выберете точность вместо скорости, разговоры помогут собрать ситуацию, а не распылить внимание.",
    "Близнецы, сегодня полезно отделить интерес от суеты. Идей может быть много, но день просит оформить хотя бы одну так, чтобы ее можно было показать, обсудить или применить. Лишние объяснения лучше заменить короткой честной формулировкой.",
    "Близнецы, сегодня ваша способность быстро переключаться между задачами будет очень кстати. Однако следите за тем, чтобы не оставлять начатые дела на полпути, доводите начатое до конца.",
  ],
  cancer: [
    "Рак, день мягкий, но не слабый: он помогает увидеть, где вам нужно больше тишины и личного пространства. Не обязательно закрываться от людей полностью, достаточно яснее обозначить границы. Теплый тон сегодня решит больше, чем длинные оправдания.",
    "Рак, сегодня важны дом, близкие и ощущение внутренней безопасности. Если кто-то втягивает вас в эмоциональную спешку, сначала верните себе опору. День подходит для заботы, но не для того, чтобы растворяться в чужих ожиданиях.",
    "Рак, сегодня ваша интуиция может подсказать вам нестандартный выход из сложной ситуации. Доверяйте своему внутреннему голосу и не бойтесь принимать решения, которые кажутся нелогичными на первый взгляд.",
  ],
  leo: [
    "Лев, сегодня ваше присутствие заметно и без усилий произвести впечатление. Чем спокойнее тон, тем сильнее вас услышат. День просит достоинства, точного жеста и отказа от драматичных доказательств собственной правоты.",
    "Лев, энергия дня поддерживает уверенность, но не любит нажима. В отношениях и делах лучше показать тепло и ясность, чем требовать немедленной реакции. Ваш лучший ход — быть щедрым, но не играть роль для чужих аплодисментов.",
    "Лев, сегодня вам может показаться, что ваши усилия не оценивают по достоинству. Не расстраивайтесь, продолжайте делать свое дело с полной самоотдачей, признание придет чуть позже.",
  ],
  virgo: [
    "Дева, день создан для аккуратной настройки: убрать лишнее, проверить детали и вернуть системе дыхание. Не берите на себя чужой беспорядок только потому, что умеете его исправлять. Ваш фокус сегодня — порядок без самокритики.",
    "Дева, мелкие правки могут дать большой эффект, если не пытаться контролировать все одновременно. Выберите одну зону и доведите ее до чистого состояния. День поддержит практичность, но попросит быть мягче к себе.",
    "Дева, сегодня ваше стремление к совершенству может стать препятствием на пути к результату. Позвольте себе немного расслабиться и не требуйте идеальности от себя и окружающих.",
  ],
  libra: [
    "Весы, баланс сегодня начинается не с уступки, а с честной позиции. Если вы соглашаетесь только ради тишины, напряжение вернется позже. Лучше мягко назвать свои условия и оставить место для спокойного диалога.",
    "Весы, день усиливает чувство красоты и меры, но просит не прятать за ними неудобные решения. Там, где есть ясность, отношения становятся легче. Не торопитесь выбирать сторону, пока не услышали собственный внутренний ответ.",
    "Весы, сегодня вам предстоит сделать важный выбор. Опирайтесь на факты и логику, а не на эмоции. Не бойтесь обратиться за советом к человеку, которому вы доверяете.",
  ],
  scorpio: [
    "Скорпион, день дает глубину, но не требует раскрывать все карты. Ваше молчание может быть сильнее резкого давления, если за ним стоит ясное понимание цели. Не тратьте энергию на борьбу там, где достаточно наблюдать.",
    "Скорпион, сегодня важно отличать интуицию от желания контролировать ситуацию. Разговор получится сильным, если в нем будет меньше проверки и больше честности. День подходит для внутренней настройки и точного, спокойного шага.",
    "Скорпион, сегодня вы можете узнать чью-то тайну. Постарайтесь сохранить эту информацию при себе и не используйте ее в корыстных целях, чтобы не нажить врагов.",
  ],
  sagittarius: [
    "Стрелец, дорога открывается там, где есть направление. Сегодня не стоит распыляться на десять возможностей одновременно: выберите одну и сделайте ее реальнее. Свобода станет сильнее, если рядом с ней будет план.",
    "Стрелец, день может принести интересную мысль, приглашение или новый горизонт. Не спешите обещать больше, чем готовы удержать. Ваш лучший ход — расширять пространство без побега от важных обязательств.",
    "Стрелец, сегодня ваш энтузиазм может столкнуться с неожиданными препятствиями. Не опускайте руки, воспринимайте эти трудности как проверку на прочность и повод для роста.",
  ],
  capricorn: [
    "Козерог, день уважает дисциплину и спокойное движение вверх. Один строгий шаг укрепит позицию лучше, чем попытка сразу показать большой результат. Не торопите признание: сначала фундамент, потом статус.",
    "Козерог, сегодня полезно отделить важное от привычно тяжелого. Не вся нагрузка является обязанностью, часть можно пересобрать или отложить. День поддержит зрелые решения, которые делают систему устойчивее.",
    "Козерог, сегодня вам может потребоваться совет более опытного коллеги. Не стесняйтесь обратиться за помощью, это сэкономит вам время и убережет от ошибок.",
  ],
  aquarius: [
    "Водолей, идея сегодня сильная, но ей нужна форма. Запишите, проверьте, соберите контекст — и только потом делитесь с теми, кто способен услышать. Будущее становится ближе через один конкретный шаг.",
    "Водолей, день поддерживает нестандартный взгляд, если он не превращается в хаос. Вам важно сохранить свободу мысли, но не потерять связь с реальностью. Хороший разговор может дать структуру тому, что раньше было только ощущением.",
    "Водолей, сегодня возможны неожиданные изменения в планах. Не паникуйте, проявите гибкость и постарайтесь извлечь максимальную выгоду из сложившейся ситуации.",
  ],
  pisces: [
    "Рыбы, интуиция сегодня точна, если не смешивать ее с тревогой. Дайте себе тишину, воду, музыку или простой ритм, который возвращает в тело. Не берите на себя чужие эмоции как личную задачу.",
    "Рыбы, день мягкий и глубокий, но просит границ. Сострадание не означает обязанность спасать всех вокруг. Чем бережнее вы относитесь к своим силам, тем яснее слышите правильный внутренний сигнал.",
    "Рыбы, сегодня ваше воображение может унести вас слишком далеко от реальности. Постарайтесь сосредоточиться на решении практических задач и не откладывайте важные дела на потом.",
  ],
};

const loveDeepLines = [
  "В личном общении лучше не проверять чувства резкостью. Спокойный вопрос, честная пауза и готовность услышать ответ сегодня ценнее, чем попытка сразу все объяснить. Тепло проявится в деталях, а не в громких обещаниях.",
  "Отношениям сегодня полезна мягкая ясность. Если тема напряженная, начните с того, что действительно важно, и не добавляйте прошлые обиды в новый разговор. Один бережный жест может заметно изменить тон дня.",
  "День просит меньше угадывать и больше говорить простыми словами. Не требуйте мгновенной реакции: человеку рядом тоже нужно пространство, чтобы собраться. Там, где есть уважение к паузе, появляется доверие.",
  "Сегодня звезды советуют больше слушать партнера. Отложите собственные амбиции на второй план и постарайтесь понять истинные потребности близкого человека. Искренняя забота сделает ваш союз еще крепче.",
  "Для одиноких сердец день не обещает грандиозных встреч, но случайный спокойный разговор может стать началом чего-то важного. Не пытайтесь форсировать события, позвольте всему идти своим чередом.",
];

const workMoneyDeepLines = [
  "В работе и деньгах выигрывает спокойная структура. Проверьте договоренности, сроки и мелкие расходы, но не принимайте решений только из-за настроения. Хороший результат сегодня складывается из аккуратных шагов.",
  "День подходит для точной правки, пересмотра планов и закрытия одного зависшего вопроса. Не стоит рисковать ради впечатления или обещать больше, чем можно сделать без надрыва. Практичность сейчас сильнее скорости.",
  "Финансовые и рабочие темы лучше вести без драматизации. Сравните варианты, уберите лишнее и оставьте то, что выдержит проверку временем. Маленькая ясность сегодня может снять большое внутреннее напряжение.",
  "Избегайте ненужных покупок и инвестиций под влиянием эмоций. Сегодня лучше сохранить ресурсы и сфокусироваться на оптимизации текущих процессов. Доверяйте только проверенным партнерам и надежным схемам.",
  "Сегодня ваши профессиональные качества будут подвергнуты проверке на прочность. Сохраняйте хладнокровие в сложных ситуациях и не бойтесь брать ответственность на себя. Это принесет свои плоды в будущем.",
];

const moodDeepLines = [
  "Настроение может меняться волнами, поэтому не принимайте первый импульс за окончательный вывод. Дайте себе ритм, в котором можно дышать и думать.",
  "Энергия дня лучше раскрывается через порядок вокруг и честность внутри. Не перегружайте себя разговорами, которые ничего не меняют.",
  "Сегодня важно беречь внимание: оно быстро уходит туда, где много шума. Верните его к телу, простым делам и одному ясному решению.",
  "Отличный день для того, чтобы уделить время своему физическому и эмоциональному здоровью. Небольшая прогулка, медитация или любимое хобби помогут восстановить баланс и обрести душевное равновесие.",
  "Постарайтесь избегать общения с пессимистично настроенными людьми, сегодня вы можете легко перенять их настрой. Окружите себя теми, кто вас вдохновляет и поддерживает.",
];

const practicalAdviceLines = [
  "Сделайте один шаг, после которого станет меньше хаоса, а не больше обязательств.",
  "Отвечайте не из раздражения, а из позиции, которую сможете спокойно удержать завтра.",
  "Сначала уберите лишнее, затем принимайте решение — так день станет заметно легче.",
  "Не ускоряйте события силой: точность сегодня важнее скорости.",
  "Разбейте большую задачу на маленькие шаги и сфокусируйтесь на первом из них.",
  "Откажитесь от того, что забирает энергию, но не приносит радости или пользы.",
];

function createSeed(date, channelId, index) {
  const source = `${date}:${channelId}:${index}`;
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    hash = (hash * 31 + source.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pick(items, seed) {
  return items[Math.abs(seed) % items.length];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function bold(value) {
  return `<b>${escapeHtml(value)}</b>`;
}

function italic(value) {
  return `<i>${escapeHtml(value)}</i>`;
}

function formatRuDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .format(date)
    .replace(/\s*г\.$/, "");
}

function buildPost(channel, dateStr, index, stylePreset) {
  const seed = createSeed(dateStr, channel.id, index);
  
  let sections = [];
  let title = "";
  let text = "";
  let visualPrompt = "";
  
  if (channel.type === "general") {
    title = `${channel.emoji} Гороскоп на сегодня — ${formatRuDate(dateStr)}`;
    const signChannels = zodiacChannels.filter((item) => item.type === "sign");
    const intro = pick(generalIntroLines, seed);
    const signSections = signChannels.map((sign, signIndex) => ({
      title: `${sign.emoji} ${sign.ruName}`,
      body: pick(signDailyForecasts[sign.id], seed + signIndex),
    }));
    const closing = pick(generalClosingLines, seed + 31);
    sections = [
      { title: "Вступление", body: intro },
      ...signSections,
      { title: "Совет дня", body: closing },
    ];
    text = [
      bold(title),
      "",
      escapeHtml(intro),
      "",
      ...signSections.map((section) => `${bold(section.title)} — ${escapeHtml(section.body)}`),
      "",
      bold("Совет дня:"),
      italic(closing),
      "",
      bold("Хэштеги:"),
      escapeHtml("#Гороскоп #Зодиак #ГороскопНаСегодня"),
    ].join("\n");
    visualPrompt = `${channel.visualPromptSeed} Date mood: ${formatRuDate(dateStr)}. Style Preset: ${stylePreset.visualStyle}. Addons: ${stylePreset.promptAddons}. General daily zodiac cover, 12-sign composition, premium dark magazine layout.`;
  } else {
    title = `${channel.emoji} ${channel.ruName} — гороскоп на ${formatRuDate(dateStr)}`;
    sections = [
      { title: "Общая энергия дня", body: pick(signMainLines[channel.id] ?? generalEnergy, seed) },
      { title: "Любовь", body: pick(loveDeepLines, seed + 1) },
      { title: "Работа и деньги", body: pick(workMoneyDeepLines, seed + 2) },
      { title: "Настроение и энергия", body: pick(moodDeepLines, seed + 3) },
      { title: "Совет дня", body: pick(practicalAdviceLines, seed + 4) },
    ];
    const closing = `${channel.ruName} сегодня сильнее, когда выбирает точность без лишнего напряжения.`;
    text = [
      bold(title),
      ...sections.map((section) => `${bold(`${section.title}:`)}\n${escapeHtml(section.body)}`),
      italic(closing),
      `${bold("Хэштеги:")}\n${escapeHtml(`#${channel.ruName.replace(/\s+/g, "")} #Гороскоп #Зодиак #ГороскопНаСегодня`)}`,
    ].join("\n\n");
    visualPrompt = `${channel.visualPromptSeed} Sign identity: ${channel.ruName}, ${channel.element}, ${channel.visualSymbols.join(", ")}. Style Preset: ${stylePreset.visualStyle}. Addons: ${stylePreset.promptAddons}. Premium Telegram magazine cover.`;
  }

  return {
    id: `zodiac-preview-${dateStr}-${channel.id}`,
    date: dateStr,
    channelId: channel.id,
    channelName: channel.ruName,
    emoji: channel.emoji,
    type: channel.type,
    title,
    text,
    sections,
    visualPrompt,
    qualityScore: 100, // Hardcoded for this generator to bypass complex quality logic
    editorialStatus: "good_preview",
    publishReady: false,
    telegramUsername: null,
    telegramChannelId: null,
    mediaMode: "text_only",
    imagePath: null,
    status: "preview"
  };
}

function parseArgs() {
  const args = process.argv.slice(2);
  let startDate = new Date().toISOString().slice(0, 10);
  let daysCount = 7;
  let stylePresetId = "luxury-mystic";
  let channelId = null;
  let outDir = path.join(process.cwd(), "exports");
  let outFile = "";

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--start-date" && args[i + 1]) {
      startDate = args[i + 1];
      i++;
    } else if (arg === "--days" && args[i + 1]) {
      daysCount = parseInt(args[i + 1], 10);
      if (isNaN(daysCount) || daysCount < 1 || daysCount > 14) {
        console.error("Error: --days must be between 1 and 14.");
        process.exit(1);
      }
      i++;
    } else if (arg === "--style" && args[i + 1]) {
      stylePresetId = args[i + 1];
      if (!zodiacStyles[stylePresetId]) {
        console.error(`Error: Invalid style. Supported styles: ${Object.keys(zodiacStyles).join(", ")}`);
        process.exit(1);
      }
      i++;
    } else if (arg === "--out" && args[i + 1]) {
      const outPath = args[i + 1];
      if (outPath.endsWith(".json")) {
        outFile = path.resolve(process.cwd(), outPath);
      } else {
        outDir = path.resolve(process.cwd(), outPath);
      }
      i++;
    } else if (arg === "--channel" && args[i + 1]) {
      channelId = args[i + 1];
      i++;
    }
  }

  if (!outFile) {
    outFile = path.join(outDir, `zodiac-weekly-plan-${startDate}.json`);
  }

  return { startDate, daysCount, stylePresetId, outFile, channelId };
}

function run() {
  const { startDate, daysCount, stylePresetId, outFile, channelId } = parseArgs();

  console.log(`Generating Zodiac plan...`);
  console.log(`- Start Date: ${startDate}`);
  console.log(`- Days: ${daysCount}`);
  console.log(`- Style Preset: ${stylePresetId}`);
  
  const start = new Date(startDate);
  const runtimePosts = [];

  for (let i = 0; i < daysCount; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    const dateStr = current.toISOString().slice(0, 10);
    
    for (let j = 0; j < zodiacChannels.length; j++) {
      const channel = zodiacChannels[j];
      if (channelId && channel.id !== channelId) continue;
      const post = buildPost(channel, dateStr, j, zodiacStyles[stylePresetId]);
      post.dayIndex = i;
      runtimePosts.push(post);
    }
  }

  const runtimePlan = {
    planId: `zodiac-${startDate}-${Date.now()}`,
    network: "zodiac",
    version: 1,
    createdAt: new Date().toISOString(),
    startDate: startDate,
    daysCount: daysCount,
    stylePresetId: stylePresetId,
    posts: runtimePosts,
  };

  const outDir = path.dirname(outFile);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outFile, JSON.stringify(runtimePlan, null, 2), "utf-8");
  console.log(`\nSuccessfully generated plan!`);
  console.log(`Saved to: ${outFile}`);
  console.log(`Total Posts: ${runtimePosts.length}`);
}

run();
