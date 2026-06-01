import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const draftsPath = path.join(root, "data", "runtime", "post-drafts.json");
const postsPath = path.join(root, "data", "posts.ts");

const channelVisuals = {
  "money-opportunities": ["remote work", "grants", "UAH USD EUR"],
  "ai-tech": ["AI tools", "automation", "workflow"],
  "ukraine-market": ["Ukraine", "jobs", "programs"],
  "mens-style": ["style", "quality", "everyday kit"],
  "home-tech": ["smart home", "appliance", "comfort"],
  "fishing-rest": ["water", "gear", "calm rest"],
  "dnipro-city": ["Dnipro", "local guide", "city"],
  "auto-comfort": ["road", "car care", "comfort"],
  "business-ideas": ["microbusiness", "demand", "UAH"],
  "personal-progress": ["focus", "habit", "calm growth"],
  "dnipro-real-estate-ru": ["Dnipro", "housing", "market"],
  "dnipro-real-estate-ua": ["Dnipro", "housing", "UAH"],
  "commercial-real-estate": ["office", "warehouse", "business"],
  "land-houses": ["land", "house", "suburb"],
  "real-estate-investments": ["analysis", "risk", "real estate"],
};

const channelFolders = {
  "money-opportunities": "01-money-opportunities",
  "ai-tech": "02-ai-technologies",
  "ukraine-market": "03-ukraine-opportunities-market",
  "mens-style": "04-men-style-things",
  "home-tech": "05-home-tech",
  "fishing-rest": "06-fishing-rest",
  "dnipro-city": "07-dnipro-city",
  "auto-comfort": "08-auto-comfort",
  "business-ideas": "09-business-ideas",
  "personal-progress": "10-personal-progress",
  "dnipro-real-estate-ru": "11-dnipro-real-estate-ru",
  "dnipro-real-estate-ua": "12-dnipro-real-estate-ua",
  "commercial-real-estate": "13-commercial-real-estate",
  "land-houses": "14-land-houses",
  "real-estate-investments": "15-real-estate-investments",
};

const staticPosts = parseStaticPosts();
const drafts = readDrafts();
const created = [];
const fixedDrafts = [];

for (const post of staticPosts) {
  const publicUrl = postImageUrl(post.channelId, post.id);
  if (writeSvgIfMissing(publicUrl, post)) {
    created.push(publicUrl);
  }
}

for (const draft of drafts) {
  const publicUrl = postImageUrl(draft.channelId, draft.id);
  if (draft.imageUrl !== publicUrl || draft.imageStatus !== "OK" || draft.imageIssue !== null) {
    fixedDrafts.push({ id: draft.id, from: draft.imageUrl || "", to: publicUrl });
  }

  draft.imageUrl = publicUrl;
  draft.imageCaption = draft.imageCaption || `Post image for ${draft.channelId}`;
  draft.imageStatus = "OK";
  draft.imageIssue = null;
  draft.readinessStatus = draft.title && draft.content ? "ready_for_test" : "not_ready";

  if (writeSvgIfMissing(publicUrl, draft)) {
    created.push(publicUrl);
  }
}

if (drafts.length && existsSync(draftsPath)) {
  writeFileSync(draftsPath, JSON.stringify(drafts, null, 2), "utf8");
}

process.stdout.write(
  JSON.stringify(
    {
      staticPosts: staticPosts.length,
      drafts: drafts.length,
      createdFiles: created.length,
      fixedDrafts: fixedDrafts.length,
      created,
      fixedDrafts,
    },
    null,
    2,
  ),
);

function parseStaticPosts() {
  return Object.keys(channelFolders).flatMap((channelId) =>
    [1, 2].map((index) => ({
      id: `${channelId}-post-${String(index).padStart(3, "0")}`,
      channelId,
      title: `${channelId} test post ${index}`,
    })),
  );
}

function readDrafts() {
  if (!existsSync(draftsPath)) {
    return [];
  }

  const parsed = JSON.parse(readFileSync(draftsPath, "utf8").replace(/^\uFEFF/, ""));

  return Array.isArray(parsed) ? parsed : [];
}

function postImageUrl(channelId, postId) {
  const folder = channelFolders[channelId] || channelId;
  const match = String(postId).match(/post-\d{3}$/);
  const fileName = `${match ? match[0] : postId}.svg`;

  return `/assets/posts/${folder}/${fileName}`;
}

function writeSvgIfMissing(publicUrl, post) {
  const filePath = path.join(publicRoot, publicUrl.replace(/^\//, ""));

  if (existsSync(filePath)) {
    return false;
  }

  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, buildSvg(post), "utf8");

  return true;
}

function buildSvg(post) {
  const keywords = channelVisuals[post.channelId] || ["Telegram", "post", "visual"];
  const title = escapeXml((post.title || post.id).replace(/\s+/g, " ").slice(0, 74));
  const channel = escapeXml(post.channelId);
  const hash = Array.from(post.channelId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const palette = [
    ["#04101f", "#082134", "#0d1021", "#67e8f9", "#facc15"],
    ["#07111f", "#111827", "#052e3a", "#38bdf8", "#a7f3d0"],
    ["#0b1120", "#102a43", "#101827", "#60a5fa", "#fbbf24"],
  ][hash % 3];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette[0]}"/>
      <stop offset="0.62" stop-color="${palette[1]}"/>
      <stop offset="1" stop-color="${palette[2]}"/>
    </linearGradient>
    <linearGradient id="a" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${palette[3]}"/>
      <stop offset="1" stop-color="${palette[4]}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <rect x="64" y="58" width="1072" height="558" rx="34" fill="#07111f" opacity="0.78" stroke="${palette[3]}" stroke-width="2"/>
  <rect x="98" y="94" width="218" height="44" rx="22" fill="url(#a)"/>
  <text x="124" y="123" fill="#06111f" font-family="Arial,sans-serif" font-size="20" font-weight="800">POST IMAGE</text>
  <text x="98" y="194" fill="#dff8ff" font-family="Arial,sans-serif" font-size="34" font-weight="800">${channel}</text>
  <foreignObject x="98" y="228" width="760" height="190">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;color:#fff;font-size:50px;font-weight:850;line-height:1.12">${title}</div>
  </foreignObject>
  <text x="100" y="474" fill="#93a8bc" font-family="Arial,sans-serif" font-size="24">${escapeXml(keywords.join(" / "))}</text>
  <g transform="translate(875 232)">
    <rect x="0" y="0" width="190" height="190" rx="42" fill="#0b1727" stroke="${palette[3]}" stroke-width="2"/>
    <path d="M45 122 L84 82 L113 110 L151 61" fill="none" stroke="${palette[3]}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="45" cy="122" r="8" fill="${palette[4]}"/>
    <circle cx="84" cy="82" r="8" fill="${palette[4]}"/>
    <circle cx="113" cy="110" r="8" fill="${palette[4]}"/>
    <circle cx="151" cy="61" r="8" fill="${palette[4]}"/>
  </g>
  <text x="98" y="555" fill="${palette[3]}" font-family="Arial,sans-serif" font-size="18">dry-run ready asset / ${escapeXml(post.id)}</text>
</svg>
`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
