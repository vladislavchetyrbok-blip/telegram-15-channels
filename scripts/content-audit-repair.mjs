import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const planPath = path.join(root, "data", "runtime", "weekly-content-plan.json");
const reportPath = path.join(root, "data", "runtime", "content-audit-report.json");
const captionLimit = 900;
const minCaptionLength = 300;

const badFragments = [
  "Рџ",
  "РЅ",
  "Рё",
  "Рµ",
  "Р°",
  "Р‘",
  "Рќ",
  "РЎ",
  "Р”",
  "Рљ",
  "Р›",
  "Р ",
  "Р",
  "Р€",
  "РЋ",
  "Ð",
  "Ñ",
  "Гђ",
  "Г‘",
  "пїЅ",
  "�",
  "PSP",
  "PР",
  "PВ",
  "PТ",
  "PÐ",
  "Failed first draft",
  "Instruction: local-model",
  "local-model",
  "local model",
  "test post",
];

const forbiddenCurrency = new RegExp(["R", "U", "B"].join("") + "|₽|рубл|ruble|rouble", "i");

const profiles = {
  "money-opportunities": {
    name: "Деньги и возможности",
    lang: "ru",
    topics: ["личные финансы", "возможности заработка", "гранты", "полезные сервисы", "осторожные инвестиционные идеи", "экономия без бедности", "финансовая дисциплина"],
    lens: "Смотрите на цифры спокойно: сроки, условия, комиссии, время на проверку и понятный резерв в UAH, USD или EUR.",
    action: "Перед решением выпишите один критерий, который нельзя игнорировать, и проверьте его до заявки или покупки.",
  },
  "ai-tech": {
    name: "AI и технологии",
    lang: "ru",
    topics: ["AI-инструменты", "автоматизация", "полезные сценарии", "приложения", "безопасность", "productivity", "локальные модели"],
    lens: "Полезность технологии начинается не с хайпа, а с конкретной задачи: текст, таблица, поддержка, безопасность или рутинный процесс.",
    action: "Выберите один повторяемый процесс и проверьте, сколько времени он забирает сейчас и что можно автоматизировать без риска.",
  },
  "ukraine-market": {
    name: "Україна: можливості та ринок",
    lang: "uk",
    topics: ["програми підтримки", "бізнес-можливості", "ринок праці", "локальний бізнес", "гранти", "цифрові сервіси", "економічні зміни"],
    lens: "Корисна можливість має прозорі умови, зрозумілий дедлайн, офіційне джерело та реалістичні витрати часу.",
    action: "Збережіть посилання на джерело, перевірте вимоги й оцініть, чи вистачить ресурсу подати заявку без поспіху.",
  },
  "mens-style": {
    name: "Мужской стиль и вещи",
    lang: "ru",
    topics: ["обувь", "куртки", "часы", "сумки", "базовый гардероб", "уход за вещами", "практичные покупки"],
    lens: "Хорошая вещь держится на посадке, материале, совместимости с остальным гардеробом и реальном сценарии использования.",
    action: "Перед покупкой представьте три ситуации, где вещь будет нужна, и проверьте, не дублирует ли она то, что уже есть.",
  },
  "home-tech": {
    name: "Техника для дома",
    lang: "ru",
    topics: ["умный дом", "техника для кухни", "стиральная и сушильная техника", "климат", "электрозащита", "телевизоры", "полезные гаджеты"],
    lens: "Домашняя техника должна решать бытовую задачу, а не просто красиво выглядеть в карточке товара.",
    action: "Сравните шум, расход энергии, сервис, габариты и место установки до покупки, а не после доставки.",
  },
  "fishing-rest": {
    name: "Рыбалка и отдых",
    lang: "ru",
    topics: ["снасти", "лодки", "эхолоты", "сезонность", "места", "экипировка", "отдых у воды"],
    lens: "Хороший выезд держится на подготовке: сезон, погода, место, снасти, безопасность и запасной план.",
    action: "Соберите короткий чек-лист перед поездкой и заранее уберите из него лишнее снаряжение.",
  },
  "dnipro-city": {
    name: "Дніпро / Город Днепр",
    lang: "ru",
    topics: ["районы", "дороги", "инфраструктура", "места", "городская жизнь", "локальные наблюдения", "полезные сервисы"],
    lens: "Локальная польза появляется там, где есть конкретика: район, маршрут, сервис, время, цена и реальная бытовая выгода.",
    action: "Проверяйте городские решения через простой вопрос: что это меняет для человека уже на этой неделе.",
  },
  "auto-comfort": {
    name: "Авто и комфорт",
    lang: "ru",
    topics: ["уход за авто", "комфорт в салоне", "аксессуары", "выбор шин", "дальние поездки", "безопасность", "экономия"],
    lens: "Комфорт в авто должен помогать водителю, а не отвлекать: безопасность, удобство, обслуживание и практичная цена важнее эффекта новинки.",
    action: "Оценивайте любую покупку через дорогу, сезон и частоту использования, а не через красивое фото в магазине.",
  },
  "business-ideas": {
    name: "Ідеї для бізнесу",
    lang: "uk",
    topics: ["малий бізнес", "сервісні ідеї", "локальні ніші", "онлайн-бізнес", "автоматизація", "продажі", "перевірка попиту"],
    lens: "Бізнес-ідея варта уваги, коли зрозуміло, хто платить, за що саме, як часто і чому клієнт обере вас.",
    action: "Перевірте попит маленьким тестом: коротка пропозиція, 10 розмов із клієнтами та проста таблиця витрат.",
  },
  "personal-progress": {
    name: "Личный прогресс",
    lang: "ru",
    topics: ["дисциплина", "привычки", "фокус", "планирование", "энергия", "деньги и мышление", "работа над собой"],
    lens: "Сильная привычка начинается не с вдохновения, а с понятной среды, маленького действия и повторяемого времени.",
    action: "Выберите одну привычку на неделю и сделайте ее настолько простой, чтобы не спорить с собой каждый день.",
  },
  "dnipro-real-estate-ru": {
    name: "Недвижимость Днепра",
    lang: "ru",
    topics: ["аренда квартир", "покупка", "районы", "документы", "ошибки покупателей", "ликвидность", "торг"],
    lens: "В недвижимости важны не только цена и фото, но район, документы, состояние дома, расходы после сделки и ликвидность.",
    action: "Перед просмотром составьте список вопросов и не принимайте решение без проверки документов и реальных расходов.",
  },
  "dnipro-real-estate-ua": {
    name: "Нерухомість Дніпра",
    lang: "uk",
    topics: ["оренда", "купівля", "райони", "документи", "помилки покупців", "ліквідність", "перевірки"],
    lens: "У нерухомості важливі не лише фото й ціна, а документи, район, стан будинку, витрати після угоди та ліквідність.",
    action: "Перед переглядом підготуйте питання й не ухвалюйте рішення без перевірки документів та реальних витрат.",
  },
  "commercial-real-estate": {
    name: "Коммерческая недвижимость",
    lang: "ru",
    topics: ["аренда помещений", "фасады", "трафик", "договор", "ремонт", "окупаемость", "локация"],
    lens: "Коммерческий объект стоит оценивать через поток людей, договор, ремонт, ограничения помещения и понятный сценарий окупаемости.",
    action: "До переговоров посчитайте базовый сценарий: аренда, ремонт, коммунальные платежи, срок запуска и точку безубыточности.",
  },
  "land-houses": {
    name: "Земля и дома / Земля та будинки",
    lang: "ru",
    topics: ["участки", "кадастр", "коммуникации", "строительство", "дороги", "дома под продажу", "проверка земли"],
    lens: "Участок или дом нужно проверять через документы, подъезд, коммуникации, соседство, воду, электричество и реальные сроки работ.",
    action: "Не ограничивайтесь красивым видом: проверьте кадастр, ограничения, подключение коммуникаций и дорогу в плохую погоду.",
  },
  "real-estate-investments": {
    name: "Инвестиции в недвижимость",
    lang: "ru",
    topics: ["доходность", "риски", "аренда", "ликвидность", "ремонт", "коммерция", "стратегия покупки"],
    lens: "Инвестиции в недвижимость требуют осторожного расчета: доходность, простой, ремонт, налоги, ликвидность и запасной сценарий.",
    action: "Считайте не только оптимистичный вариант, но и спокойный сценарий с простоем, ремонтом и более длинной продажей.",
  },
};

const args = new Set(process.argv.slice(2));
const repair = args.has("--repair");

if (!existsSync(planPath)) {
  console.log(JSON.stringify({ ok: false, error: "weekly-content-plan.json not found" }, null, 2));
  process.exitCode = 1;
} else {
  const state = JSON.parse(readFileSync(planPath, "utf8"));
  const before = audit(state.items ?? []);
  let repaired = 0;
  let preservedPublished = 0;

  if (repair) {
    const byChannelDay = new Map();
    state.items = (state.items ?? []).map((item, index) => {
      if (item.status === "published" || item.telegramMessageId || item.publishResult === "success") {
        preservedPublished += 1;
        return item;
      }

      const profile = profiles[item.channelId] ?? profiles["money-opportunities"];
      const dateIndex = byChannelDay.get(item.channelId) ?? 0;
      byChannelDay.set(item.channelId, dateIndex + 1);
      const topic = profile.topics[dateIndex % profile.topics.length];
      const updated = rebuildItem(item, profile, topic, index);
      if (hasMojibake([item.title, item.body, item.telegramCaption].join("\n")) || item.status === "blocked") repaired += 1;
      return updated;
    });
    state.summary = buildSummary(state.items);
    state.updatedAt = new Date().toISOString();
    mkdirSync(path.dirname(planPath), { recursive: true });
    writeFileSync(planPath, JSON.stringify(state, null, 2), "utf8");
  }

  const afterState = repair ? JSON.parse(readFileSync(planPath, "utf8")) : state;
  const after = audit(afterState.items ?? []);
  const report = {
    ok: after.mojibake === 0 && after.captionTooLong === 0 && after.captionMissing === 0 && after.readyToPublish === after.total - after.published,
    mode: repair ? "repair" : "audit",
    repaired,
    preservedPublished,
    before,
    after,
    checkedAt: new Date().toISOString(),
  };
  mkdirSync(path.dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

function rebuildItem(item, profile, topic, index) {
  const title = buildTitle(topic, profile);
  const body = buildBody(topic, profile, index);
  const caption = buildCaption(title, body, profile);
  const imageOk = imageStatus(item.telegramImagePath) === "OK";
  const qualityIssues = [];

  if (!imageOk) qualityIssues.push("telegram_image_not_ready");
  if (hasMojibake(`${title}\n${body}\n${caption}`)) qualityIssues.push("mojibake_or_failed_generation");
  if (forbiddenCurrency.test(`${title}\n${body}\n${caption}`)) qualityIssues.push("forbidden_currency_detected");
  if (caption.length < minCaptionLength) qualityIssues.push("telegram_caption_too_short");
  if (caption.length > captionLimit) qualityIssues.push("needs_caption_fix");

  const status = qualityIssues.length === 0 ? "ready_to_publish" : "blocked";

  return {
    ...item,
    channelName: profile.name,
    contentTopic: topic,
    title,
    body,
    telegramCaption: caption,
    telegramCaptionLength: caption.length,
    telegramCaptionStatus: caption.length > captionLimit ? "too_long" : caption.length ? "OK" : "missing",
    language: profile.lang,
    textQuality: body.length >= 650 ? "strong" : "medium",
    textLength: body.length,
    telegramImageStatus: imageOk ? "OK" : imageStatus(item.telegramImagePath),
    imageQuality: imageOk ? (imageSize(item.telegramImagePath) > 18000 ? "strong" : "medium") : "weak",
    status,
    qualityIssues,
    duplicateTopic: false,
    updatedAt: new Date().toISOString(),
  };
}

function buildTitle(topic, profile) {
  if (profile.lang === "uk") return `${capitalize(topic)}: що варто перевірити цього тижня`;
  return `${capitalize(topic)}: что стоит проверить на этой неделе`;
}

function buildBody(topic, profile, index) {
  if (profile.lang === "uk") {
    return [
      `${capitalize(topic)} — тема, де краще рухатися без поспіху. Важливо не шукати чарівну відповідь, а розкласти ситуацію на умови, терміни, витрати часу й реальну користь для людини або бізнесу. ${profile.lens}`,
      `Практичний підхід простий: спочатку визначте мету, потім перевірте джерело інформації, обмеження, дедлайни та додаткові витрати. Якщо тема пов'язана з грошима, рахуйте тільки в UAH, USD або EUR і не змішуйте очікування з гарантованим результатом.`,
      `Короткий чек-лист: 1) що саме дає ця можливість; 2) хто відповідає за умови; 3) які документи або дані потрібні; 4) скільки часу займе перший крок; 5) що буде, якщо результат не спрацює одразу.`,
      `Висновок: ${profile.action} Такий підхід не обіцяє легкого результату, зате допомагає швидше відділити нормальну можливість від шуму.`,
    ].join("\n\n");
  }

  return [
    `${capitalize(topic)} — тема, в которой полезно смотреть не на громкие обещания, а на практический сценарий. Важно понять условия, ограничения, реальные расходы времени и то, что человек получает после первого шага. ${profile.lens}`,
    `Начните с простой проверки: какая задача решается, кто отвечает за результат, какие есть скрытые издержки и что можно проверить до покупки, заявки или запуска. Если в теме есть деньги, держите расчеты в UAH, USD или EUR и не превращайте оценку в обещание дохода.`,
    `Короткий чек-лист: 1) сформулировать цель; 2) проверить источник и условия; 3) оценить стоимость ошибки; 4) сравнить с двумя альтернативами; 5) оставить запас времени на спокойное решение.`,
    `Вывод: ${profile.action} Такой подход не делает решение идеальным, зато снижает риск поспешного шага и помогает увидеть реальную пользу.`,
  ].join("\n\n");
}

function buildCaption(title, body, profile) {
  const sentences = body
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const points =
    profile.lang === "uk"
      ? ["перевірте джерело й умови", "оцініть витрати часу", "порахуйте ризик помилки", "залиште запас для спокійного рішення"]
      : ["проверьте источник и условия", "оцените расходы времени", "посчитайте риск ошибки", "оставьте запас для спокойного решения"];
  const end = profile.lang === "uk" ? "Висновок: спокійна перевірка краще за поспіх." : "Итог: спокойная проверка лучше поспешного решения.";
  const secondLine =
    profile.lang === "uk"
      ? "Головне — не плутати інтерес із готовністю діяти: спочатку факти, потім рішення."
      : "Главное — не путать интерес с готовностью действовать: сначала факты, потом решение.";
  let plain = [`<b>${escapeHtml(title)}</b>`, escapeHtml(sentences[0] ?? ""), escapeHtml(secondLine), ...points.map((point) => `- ${escapeHtml(point)}`), escapeHtml(end)].join("\n\n");

  if (plain.length > captionLimit) {
    const shortFirst = truncate(sentences[0] ?? "", 360);
    plain = [`<b>${escapeHtml(title)}</b>`, escapeHtml(shortFirst), ...points.slice(0, 2).map((point) => `- ${escapeHtml(point)}`), escapeHtml(end)].join("\n\n");
  }

  return plain.length > captionLimit ? truncate(plain, captionLimit) : plain;
}

function audit(items) {
  const total = items.length;
  const published = items.filter((item) => item.status === "published" || item.telegramMessageId || item.publishResult === "success").length;
  const mojibakeItems = items.filter((item) => hasMojibake([item.title, item.body, item.telegramCaption, item.contentTopic].join("\n")));
  const captionMissing = items.filter((item) => !item.telegramCaption || item.telegramCaptionStatus === "missing").length;
  const captionTooLong = items.filter((item) => (item.telegramCaptionLength ?? 0) > captionLimit || item.telegramCaptionStatus === "too_long").length;
  const captionOk = items.filter((item) => item.telegramCaptionStatus === "OK" && (item.telegramCaptionLength ?? 0) >= minCaptionLength && (item.telegramCaptionLength ?? 0) <= captionLimit && !hasMojibake(item.telegramCaption ?? "")).length;
  const readyToPublish = items.filter((item) => item.status === "ready_to_publish" && !hasMojibake([item.title, item.body, item.telegramCaption].join("\n")) && item.telegramCaptionStatus === "OK" && item.qualityIssues?.length === 0).length;
  const blocked = items.filter((item) => item.status === "blocked").length;

  return {
    total,
    published,
    readyToPublish,
    blocked,
    mojibake: mojibakeItems.length,
    captionOk,
    captionMissing,
    captionTooLong,
    weakText: items.filter((item) => item.textQuality === "weak").length,
    weakImage: items.filter((item) => item.imageQuality === "weak").length,
    telegramImageOk: items.filter((item) => item.telegramImageStatus === "OK").length,
    examples: mojibakeItems.slice(0, 5).map((item) => ({
      id: item.id,
      channelId: item.channelId,
      title: item.title,
      status: item.status,
      captionStatus: item.telegramCaptionStatus,
      qualityIssues: item.qualityIssues,
    })),
  };
}

function buildSummary(items) {
  const topicKeys = new Set(items.map((item) => `${item.channelId}:${String(item.contentTopic ?? "").trim().toLowerCase()}`));
  return {
    days: 7,
    channels: 15,
    total: items.length,
    readyToPublish: audit(items).readyToPublish,
    scheduled: items.filter((item) => item.status === "scheduled").length,
    published: items.filter((item) => item.status === "published").length,
    blocked: items.filter((item) => item.status === "blocked").length,
    weakText: items.filter((item) => item.textQuality === "weak").length,
    weakImage: items.filter((item) => item.imageQuality === "weak").length,
    telegramImageStatusOk: items.filter((item) => item.telegramImageStatus === "OK").length,
    uniqueTopics: topicKeys.size,
    duplicateTopics: items.filter((item) => item.duplicateTopic).length,
    missingImages: items.filter((item) => item.telegramImageStatus !== "OK").length,
    generatedImages: items.filter((item) => item.telegramImagePath && existsSync(item.telegramImagePath)).length,
  };
}

function hasMojibake(value) {
  return badFragments.some((fragment) => String(value ?? "").includes(fragment));
}

function imageStatus(filePath) {
  if (!filePath || !existsSync(filePath)) return "missing";
  if (!String(filePath).toLowerCase().endsWith(".png") && !String(filePath).toLowerCase().endsWith(".jpg") && !String(filePath).toLowerCase().endsWith(".jpeg")) return "unsupported_format";
  return imageSize(filePath) > 64 ? "OK" : "broken_file";
}

function imageSize(filePath) {
  try {
    return statSync(filePath).size;
  } catch {
    return 0;
  }
}

function capitalize(value) {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function truncate(value, maxLength) {
  if (value.length <= maxLength) return value;
  const sliced = value.slice(0, Math.max(0, maxLength - 3));
  const lastSpace = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, lastSpace > 40 ? lastSpace : sliced.length).trim()}...`;
}
