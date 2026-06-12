import fs from "fs";
import process from "process";

const args = process.argv.slice(2);
const filePath = args[0];

if (!filePath) {
  console.error("Usage: node scripts/validate-zodiac-plan.mjs path/to/zodiac-weekly-plan.json");
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const fileContent = fs.readFileSync(filePath, "utf-8");
let plan;
try {
  plan = JSON.parse(fileContent);
} catch (err) {
  console.error("Failed to parse JSON file.");
  process.exit(1);
}

const missingFields = [];
const warnings = [];
const blockingIssues = [];

const zodiacSigns = [
  { id: "aries", ruName: "Овен", emoji: "♈️" },
  { id: "taurus", ruName: "Телец", emoji: "♉️" },
  { id: "gemini", ruName: "Близнецы", emoji: "♊️" },
  { id: "cancer", ruName: "Рак", emoji: "♋️" },
  { id: "leo", ruName: "Лев", emoji: "♌️" },
  { id: "virgo", ruName: "Дева", emoji: "♍️" },
  { id: "libra", ruName: "Весы", emoji: "♎️" },
  { id: "scorpio", ruName: "Скорпион", emoji: "♏️" },
  { id: "sagittarius", ruName: "Стрелец", emoji: "♐️" },
  { id: "capricorn", ruName: "Козерог", emoji: "♑️" },
  { id: "aquarius", ruName: "Водолей", emoji: "♒️" },
  { id: "pisces", ruName: "Рыбы", emoji: "♓️" },
];

function formatRuDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .format(date)
    .replace(/\s*г\.$/, "");
}

function countOccurrences(text, needle) {
  return (text.match(new RegExp(escapeRegExp(needle), "g")) || []).length;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

if (plan.network !== "zodiac") {
  blockingIssues.push("network is not 'zodiac'.");
}
if (!plan.startDate) {
  missingFields.push("startDate");
}
if (!plan.daysCount) {
  missingFields.push("daysCount");
}

if (!Array.isArray(plan.posts)) {
  blockingIssues.push("posts field is missing or not an array.");
} else {
  if (plan.posts.length > (plan.daysCount * 13)) {
    blockingIssues.push(`Expected maximum ${plan.daysCount * 13} posts, found ${plan.posts.length}.`);
  }

  // Validate dates
  const dates = new Set(plan.posts.map(p => p.date));
  if (dates.size !== plan.daysCount) {
    warnings.push(`Expected posts for ${plan.daysCount} days, found ${dates.size} days.`);
  }

  for (const date of dates) {
    const dayPosts = plan.posts.filter(p => p.date === date);
    if (dayPosts.length > 13) {
      blockingIssues.push(`Expected maximum 13 posts for date ${date}, but found ${dayPosts.length}.`);
    } else if (dayPosts.length < 13) {
      warnings.push(`Date ${date} has ${dayPosts.length} posts (partial run).`);
    }
  }

  // Validate posts content
  for (const [index, post] of plan.posts.entries()) {
    const postRef = `Post ID ${post.id || index}`;
    
    if (!post.title) missingFields.push(`${postRef}: title`);
    if (!post.text) missingFields.push(`${postRef}: text`);
    if (!post.visualPrompt) missingFields.push(`${postRef}: visualPrompt`);

    const expectedDate = post.date ? formatRuDate(post.date) : "";
    const text = String(post.text || "");
    const title = String(post.title || "");

    if (expectedDate && !title.includes(expectedDate)) {
      blockingIssues.push(`${postRef}: title does not include generated date '${expectedDate}'.`);
    }

    if (post.channelId === "zodiac-general") {
      if (text.length < 900) {
        blockingIssues.push(`${postRef}: zodiac-general text is too short for 12-sign daily format (${text.length} chars).`);
      }

      for (const sign of zodiacSigns) {
        const marker = `<b>${sign.emoji} ${sign.ruName}</b> —`;
        const count = countOccurrences(text, marker);
        if (count !== 1) {
          blockingIssues.push(`${postRef}: zodiac-general must include ${marker} exactly once, found ${count}.`);
        }
      }

      if (!text.includes("<b>Хэштеги:</b>") || !text.includes("#ГороскопНаСегодня")) {
        blockingIssues.push(`${postRef}: zodiac-general must include hashtag block.`);
      }
    } else {
      const sign = zodiacSigns.find((item) => item.id === post.channelId);
      if (sign) {
        if (!title.includes(sign.ruName) || !title.includes(sign.emoji)) {
          blockingIssues.push(`${postRef}: sign post title must include ${sign.emoji} ${sign.ruName}.`);
        }

        if (text.length < 850) {
          blockingIssues.push(`${postRef}: sign post is too short for detailed format (${text.length} chars).`);
        }

        for (const otherSign of zodiacSigns.filter((item) => item.id !== post.channelId)) {
          const otherMarker = `${otherSign.emoji} ${otherSign.ruName}`;
          if (text.includes(otherMarker) || text.includes(`#${otherSign.ruName}`)) {
            blockingIssues.push(`${postRef}: sign post should focus on ${sign.ruName}, but mentions ${otherSign.ruName}.`);
          }
        }
      }
    }
    
    if (post.qualityScore === undefined || post.qualityScore === null) {
      warnings.push(`${postRef}: missing qualityScore`);
    }

    if (post.telegramChannelId || post.telegramUsername) {
      warnings.push(`${postRef}: telegramUsername or telegramChannelId is populated. MVP expects these to be null.`);
    }

    if (post.status !== "preview") {
      blockingIssues.push(`${postRef}: status should be 'preview', found '${post.status}'. Real publish flags are forbidden.`);
    }

    if (!["text_only", "image_optional", "image_required"].includes(post.mediaMode)) {
      blockingIssues.push(`${postRef}: invalid mediaMode '${post.mediaMode}'.`);
    }

    if (post.mediaMode === "image_required" && !post.imagePath) {
      blockingIssues.push(`${postRef}: imagePath is missing but mediaMode is 'image_required'.`);
    }
  }
}

const totalPosts = Array.isArray(plan.posts) ? plan.posts.length : 0;
const ok = blockingIssues.length === 0;

const result = {
  ok,
  totalPosts,
  daysCount: plan.daysCount || 0,
  missingFields,
  warnings,
  blockingIssues,
};

console.log(JSON.stringify(result, null, 2));
process.exit(ok ? 0 : 1);
