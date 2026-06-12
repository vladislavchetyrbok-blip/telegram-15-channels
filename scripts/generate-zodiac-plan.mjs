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

function formatRuDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", timeZone: "UTC" }).format(date);
}

function buildPost(channel, dateStr, index, stylePreset) {
  const seed = createSeed(dateStr, channel.id, index);
  
  let sections = [];
  let title = "";
  let visualPrompt = "";
  
  if (channel.type === "general") {
    title = `Гороскоп на ${formatRuDate(dateStr)}`;
    sections = [
      { title: "Общая энергия дня", body: pick(generalEnergy, seed) },
      { title: "Любовь", body: pick(loveLines, seed + 1) },
      { title: "Деньги", body: pick(moneyLines, seed + 2) },
      { title: "Работа", body: pick(workLines, seed + 3) },
      { title: "Совет дня", body: pick(adviceLines, seed + 4) }
    ];
    visualPrompt = `${channel.visualPromptSeed} Date mood: ${formatRuDate(dateStr)}. Style Preset: ${stylePreset.visualStyle}. Addons: ${stylePreset.promptAddons}. General daily zodiac cover, 12-sign composition, premium dark magazine layout.`;
  } else {
    title = `${channel.ruName} ${channel.emoji} | Гороскоп на сегодня`;
    sections = [
      { title: "Главное", body: pick(generalEnergy, seed) },
      { title: "Любовь", body: pick(loveLines, seed + 1) },
      { title: "Деньги", body: pick(moneyLines, seed + 2) },
      { title: "Работа", body: pick(workLines, seed + 3) },
      { title: "Предупреждение", body: pick(warningLines, seed + 4) },
      { title: "Совет", body: pick(adviceLines, seed + 5) }
    ];
    visualPrompt = `${channel.visualPromptSeed} Sign identity: ${channel.ruName}, ${channel.element}, ${channel.visualSymbols.join(", ")}. Style Preset: ${stylePreset.visualStyle}. Addons: ${stylePreset.promptAddons}. Premium Telegram magazine cover.`;
  }

  const text = `${title}\n\n` + sections.map(s => `${s.title}:\n${s.body}`).join("\n\n");

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
    }
  }

  if (!outFile) {
    outFile = path.join(outDir, `zodiac-weekly-plan-${startDate}.json`);
  }

  return { startDate, daysCount, stylePresetId, outFile };
}

function run() {
  const { startDate, daysCount, stylePresetId, outFile } = parseArgs();

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
