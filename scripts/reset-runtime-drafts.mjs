import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const now = new Date().toISOString();

const channels = [
  ["money-opportunities", "Деньги и возможности", "ru", "Практичная возможность заработка, гранта или удалённой работы без обещаний лёгких денег.", "01-money-opportunities"],
  ["ai-tech", "AI и технологии", "ru", "Полезный AI-инструмент или сценарий автоматизации для повседневной работы.", "02-ai-technologies"],
  ["ukraine-market", "Україна: можливості та ринок", "uk", "Корисна можливість, вакансії, програми або ринок праці українською.", "03-ukraine-opportunities-market"],
  ["mens-style", "Мужской стиль и вещи", "ru", "Практичная вещь или элемент стиля без пафоса.", "04-men-style-things"],
  ["home-tech", "Техника для дома", "ru", "Бытовая техника, умный дом или полезное решение для дома.", "05-home-tech"],
  ["fishing-rest", "Рыбалка и отдых", "ru", "Снасти, сезонный совет или спокойный отдых у воды.", "06-fishing-rest"],
  ["dnipro-city", "Дніпро / Город Днепр", "ru", "Локальная подборка, сервис, место или полезная городская заметка.", "07-dnipro-city"],
  ["auto-comfort", "Авто и комфорт", "ru", "Комфорт в дороге, аксессуар или уход за авто.", "08-auto-comfort"],
  ["business-ideas", "Ідеї для бізнесу", "uk", "Коротка ідея мікробізнесу українською.", "09-business-ideas"],
  ["personal-progress", "Личный прогресс", "ru", "Привычка, фокус и спокойный рост без мотивационной истерики.", "10-personal-progress"],
  ["dnipro-real-estate-ru", "Недвижимость Днепра", "ru", "Практичный совет покупателю, арендатору или собственнику в Днепре.", "11-dnipro-real-estate-ru"],
  ["dnipro-real-estate-ua", "Нерухомість Дніпра", "uk", "Практична порада щодо оренди, купівлі або районів українською.", "12-dnipro-real-estate-ua"],
  ["commercial-real-estate", "Коммерческая недвижимость", "ru", "Аренда помещения, офис, склад или бизнес-локация.", "13-commercial-real-estate"],
  ["land-houses", "Земля и дома / Земля та будинки", "ru", "Участки, дома, пригород и документы без юридических гарантий.", "14-land-houses"],
  ["real-estate-investments", "Инвестиции в недвижимость", "ru", "Осторожный аналитический пост без обещаний доходности.", "15-real-estate-investments"],
];

const chatIds = {
  "money-opportunities": "-1003995852493",
  "ai-tech": "-1003504277183",
  "ukraine-market": "-1003980997461",
  "mens-style": "-1003944130233",
  "home-tech": "-1003828463272",
  "fishing-rest": "-1003819092877",
  "dnipro-city": "-1003920058596",
  "auto-comfort": "-1003801331980",
  "business-ideas": "-1003995476841",
  "personal-progress": "-1003793101443",
  "dnipro-real-estate-ru": "-1003703940196",
  "dnipro-real-estate-ua": "-1003973181492",
  "commercial-real-estate": "-1003163500222",
  "land-houses": "-1003767929992",
  "real-estate-investments": "-1003962737183",
};

function content(title, topic, lang) {
  if (lang === "uk") {
    return [
      `**${title}: корисна чернетка**`,
      "",
      `Тема: ${topic}`,
      "",
      "Перевірте джерело, дедлайни, умови участі та практичну користь. Збережіть посилання, порівняйте кілька варіантів і не приймайте рішення без перевірки деталей.",
      "",
      "Чернетка очікує ручної редакційної перевірки.",
    ].join("\n");
  }

  return [
    `**${title}: полезный черновик**`,
    "",
    `Тема: ${topic}`,
    "",
    "Проверьте источник, сроки, условия и практическую пользу. Сравните несколько вариантов, сохраните важные детали и не принимайте решение без дополнительной проверки.",
    "",
    "Черновик ожидает ручной редакционной проверки.",
  ].join("\n");
}

const drafts = channels.map(([id, title, lang, topic, folder], index) => ({
  id: `clean-draft-${String(index + 1).padStart(2, "0")}`,
  channelId: id,
  channelTitle: title,
  telegramChatId: chatIds[id],
  title: `Черновик для проверки: ${title}`,
  content: content(title, topic, lang),
  imageUrl: `/assets/posts/${folder}/post-002.svg`,
  imageCaption: `${title}: post image`,
  imageStatus: "OK",
  imageIssue: null,
  readinessReasons: [],
  readinessStatus: "ready_for_test",
  language: lang,
  topic,
  status: "pending_review",
  createdAt: now,
  updatedAt: now,
  scheduledFor: null,
  dryRun: true,
  telegramSent: false,
  aiProvider: "lmstudio",
  modelName: "local-model",
  source: "first_batch_generation",
  validationStatus: "passed",
  validationNotes: ["Текст восстановлен после проверки кодировки."],
  validationReasons: [],
  draftApprovedAt: null,
  revisionRequestedAt: null,
  rejectedAt: null,
  variantOfDraftId: null,
  regeneratedFromContent: null,
}));

const out = path.join(process.cwd(), "data", "runtime", "post-drafts.json");
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(drafts, null, 2), "utf8");
console.log(JSON.stringify({ drafts: drafts.length }));
