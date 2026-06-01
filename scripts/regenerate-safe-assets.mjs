import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const channelLogoDir = path.join(rootDir, "public", "assets", "channel-logos");
const channelsDir = path.join(rootDir, "public", "assets", "channels");

const channels = [
  ["money-opportunities", "Деньги и возможности", "01-money-opportunities.svg", "₴ $ €"],
  ["ai-tech", "AI и технологии", "02-ai-technologies.svg", "AI"],
  ["ukraine-market", "Україна: можливості та ринок", "03-ukraine-opportunities-market.svg", "UAH"],
  ["mens-style", "Мужской стиль и вещи", "04-men-style-things.svg", "ST"],
  ["home-tech", "Техника для дома", "05-home-tech.svg", "HT"],
  ["fishing-rest", "Рыбалка и отдых", "06-fishing-rest.svg", "FR"],
  ["dnipro-city", "Дніпро / Город Днепр", "07-dnipro-city.svg", "DP"],
  ["auto-comfort", "Авто и комфорт", "08-auto-comfort.svg", "AC"],
  ["business-ideas", "Ідеї для бізнесу", "09-business-ideas.svg", "UAH"],
  ["personal-progress", "Личный прогресс", "10-personal-progress.svg", "GO"],
  ["dnipro-real-estate-ru", "Недвижимость Днепра", "11-dnipro-real-estate-ru.svg", "DN"],
  ["dnipro-real-estate-ua", "Нерухомість Дніпра", "12-dnipro-real-estate-ua.svg", "DN"],
  ["commercial-real-estate", "Коммерческая недвижимость", "13-commercial-real-estate.svg", "CE"],
  ["land-houses", "Земля и дома / Земля та будинки", "14-land-houses.svg", "LH"],
  ["real-estate-investments", "Инвестиции в недвижимость", "15-real-estate-investments.svg", "UAH"],
];

mkdirSync(channelLogoDir, { recursive: true });
mkdirSync(channelsDir, { recursive: true });

for (const [id, title, fileName, mark] of channels) {
  const svg = buildSvg(title, mark);
  writeFileSync(path.join(channelLogoDir, fileName), svg, "utf8");

  const channelDir = path.join(channelsDir, id);
  mkdirSync(channelDir, { recursive: true });
  writeFileSync(path.join(channelDir, "logo.svg"), svg, "utf8");
  writeFileSync(path.join(channelDir, "icon.svg"), buildIconSvg(mark), "utf8");
  writeFileSync(path.join(channelDir, "preview.svg"), buildPreviewSvg(title, mark), "utf8");
}

function buildSvg(title, mark) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="55%" stop-color="#075985"/>
      <stop offset="100%" stop-color="#0e7490"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#facc15"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <circle cx="394" cy="118" r="54" fill="#22d3ee" opacity="0.18"/>
  <path d="M104 354h304" stroke="#22d3ee" stroke-width="18" stroke-linecap="round" opacity="0.75"/>
  <path d="M132 308l74-74 58 52 112-128" fill="none" stroke="url(#accent)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="256" y="244" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="68" font-weight="800" fill="#f8fafc">${escapeXml(mark)}</text>
  <text x="256" y="404" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="#bae6fd">${escapeXml(shortTitle(title))}</text>
</svg>
`;
}

function buildIconSvg(mark) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img">
  <rect width="256" height="256" rx="56" fill="#0f172a"/>
  <path d="M54 166l41-41 31 29 72-82" fill="none" stroke="#22d3ee" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="128" y="136" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="800" fill="#facc15">${escapeXml(mark)}</text>
</svg>
`;
}

function buildPreviewSvg(title, mark) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img" aria-label="${escapeXml(title)} preview">
  <rect width="960" height="540" fill="#020617"/>
  <rect x="48" y="48" width="864" height="444" rx="36" fill="#0f172a" stroke="#164e63" stroke-width="2"/>
  <circle cx="798" cy="132" r="62" fill="#22d3ee" opacity="0.16"/>
  <path d="M120 352h720" stroke="#155e75" stroke-width="18" stroke-linecap="round"/>
  <path d="M146 302l112-98 82 72 176-162 78 64 110-108" fill="none" stroke="#22d3ee" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="120" y="158" font-family="Inter, Arial, sans-serif" font-size="36" font-weight="800" fill="#f8fafc">${escapeXml(shortTitle(title))}</text>
  <text x="120" y="218" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="#facc15">${escapeXml(mark)} · UAH · USD · EUR</text>
</svg>
`;
}

function shortTitle(title) {
  return title.length > 28 ? `${title.slice(0, 25)}...` : title;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
