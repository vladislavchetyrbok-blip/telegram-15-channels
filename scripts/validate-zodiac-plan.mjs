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
  const expectedPostsCount = plan.daysCount ? plan.daysCount * 13 : 0;
  if (expectedPostsCount > 0 && plan.posts.length !== expectedPostsCount) {
    blockingIssues.push(`Expected ${expectedPostsCount} posts, found ${plan.posts.length}.`);
  }

  // Check structure per day
  const postsByDate = {};
  for (const post of plan.posts) {
    if (!postsByDate[post.date]) postsByDate[post.date] = [];
    postsByDate[post.date].push(post);
  }

  for (const [date, postsForDate] of Object.entries(postsByDate)) {
    if (postsForDate.length !== 13) {
      blockingIssues.push(`Expected exactly 13 posts for date ${date}, but found ${postsForDate.length}.`);
    }
  }

  // Validate posts content
  for (const [index, post] of plan.posts.entries()) {
    const postRef = `Post ID ${post.id || index}`;
    
    if (!post.title) missingFields.push(`${postRef}: title`);
    if (!post.text) missingFields.push(`${postRef}: text`);
    if (!post.visualPrompt) missingFields.push(`${postRef}: visualPrompt`);
    
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
