import fs from "fs";
import path from "path";
import process from "process";

const ZODIAC_CHANNEL_IDS = [
  "zodiac-general", "aries", "taurus", "gemini", "cancer", "leo",
  "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

const ZODIAC_SIGNS = [
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

const CLICHE_PHRASES = [
  "звезды говорят",
  "судьба готовит",
  "вас ждет успех",
  "все получится",
  "не упустите шанс",
  "вселенная подсказывает",
  "карты говорят",
];

const RISK_PHRASES = [
  "гарантирован",
  "болезнь",
  "диагноз",
  "врач",
  "катастрофа",
  "смерть",
  "угроза",
  "выздоровление",
  "инвестируйте",
  "100%",
  "обязательно",
  "неминуемо",
];

const REQUIRED_SIGN_SECTIONS = [
  "Общая энергия дня",
  "Любовь",
  "Работа и деньги",
  "Настроение и энергия",
  "Совет дня",
];

function parseArgs() {
  const args = process.argv.slice(2);
  let planFile = null;
  let outFile = null;
  let jsonOutput = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--out" && args[i + 1]) {
      outFile = args[i + 1];
      i++;
    } else if (arg === "--json") {
      jsonOutput = true;
    } else if (!arg.startsWith("--") && !planFile) {
      planFile = arg;
    }
  }

  return { planFile, outFile, jsonOutput };
}

function formatRuDate(dateStr) {
  const [year, month, day] = String(dateStr || "").split("-").map(Number);
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

function run() {
  const { planFile, outFile, jsonOutput } = parseArgs();

  if (!planFile) {
    console.error("Error: No plan file specified.");
    process.exit(1);
  }

  const absolutePath = path.resolve(process.cwd(), planFile);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: File not found: ${planFile}`);
    process.exit(1);
  }

  let plan;
  try {
    plan = JSON.parse(fs.readFileSync(absolutePath, "utf-8"));
  } catch (err) {
    console.error(`Error: Invalid JSON format: ${err.message}`);
    process.exit(1);
  }

  if (plan.network !== "zodiac") {
    console.error("Error: Plan network is not 'zodiac'.");
    process.exit(1);
  }
  if (!Array.isArray(plan.posts) || plan.posts.length === 0) {
    console.error("Error: Plan has no posts.");
    process.exit(1);
  }

  const report = {
    planFile: path.basename(planFile),
    daysCount: plan.daysCount || 0,
    totalPosts: plan.posts.length,
    qualityStats: { average: 0, min: 100, max: 0, below70: 0, below50: 0 },
    issues: { critical: [], warnings: [] },
    repeatedPhrases: [],
    weakPosts: [],
    topIssues: [],
  };

  const titles = new Set();
  const visualPrompts = new Set();
  const phraseFrequency = {};
  let totalScore = 0;

  for (const post of plan.posts) {
    const context = `${post.channelId} / ${post.date}`;
    let isWeak = false;

    if (!ZODIAC_CHANNEL_IDS.includes(post.channelId)) {
      report.issues.critical.push(`${context}: unknown zodiac channel`);
      isWeak = true;
    }

    const score = typeof post.qualityScore === "number" ? post.qualityScore : 100;
    totalScore += score;
    report.qualityStats.min = Math.min(report.qualityStats.min, score);
    report.qualityStats.max = Math.max(report.qualityStats.max, score);
    if (score < 70) report.qualityStats.below70++;
    if (score < 50) report.qualityStats.below50++;

    if (!post.title) { report.issues.critical.push(`${context}: Missing title`); isWeak = true; }
    if (!post.text) { report.issues.critical.push(`${context}: Missing text`); isWeak = true; }
    if (!post.visualPrompt) report.issues.warnings.push(`${context}: Missing visualPrompt`);
    if (!Array.isArray(post.sections) || post.sections.length === 0) {
      report.issues.warnings.push(`${context}: Missing sections array`);
    }

    if (titles.has(post.title)) report.issues.warnings.push(`${context}: Repeated title "${post.title}"`);
    titles.add(post.title);
    if (visualPrompts.has(post.visualPrompt)) report.issues.warnings.push(`${context}: Repeated visual prompt`);
    visualPrompts.add(post.visualPrompt);

    const text = String(post.text || "");
    const lowerText = text.toLowerCase();
    const expectedDate = formatRuDate(post.date);
    if (!String(post.title || "").includes(expectedDate)) {
      report.issues.critical.push(`${context}: title does not include generated date ${expectedDate}`);
      isWeak = true;
    }

    for (const phrase of CLICHE_PHRASES) {
      if (lowerText.includes(phrase)) {
        report.issues.warnings.push(`${context}: cliche detected "${phrase}"`);
        isWeak = true;
      }
    }

    for (const phrase of RISK_PHRASES) {
      if (lowerText.includes(phrase)) {
        report.issues.critical.push(`${context}: safety risk phrase detected "${phrase}"`);
        report.topIssues.push({ context, reason: `Safety risk: ${phrase}` });
        isWeak = true;
      }
    }

    for (const sentence of lowerText.split(/[.?!]/).map((item) => item.trim()).filter((item) => item.length > 30)) {
      phraseFrequency[sentence] = (phraseFrequency[sentence] || 0) + 1;
    }

    if (post.channelId === "zodiac-general") {
      if (text.length < 900) {
        report.issues.critical.push(`${context}: general post is too short for 12-sign format`);
        isWeak = true;
      }

      for (const sign of ZODIAC_SIGNS) {
        const marker = `${sign.emoji} ${sign.ruName} —`;
        const count = countOccurrences(text, marker);
        if (count !== 1) {
          report.issues.critical.push(`${context}: ${marker} must appear exactly once, found ${count}`);
          report.topIssues.push({ context, reason: `Missing/duplicate sign: ${sign.ruName}` });
          isWeak = true;
        }
      }
    } else if (post.type === "sign") {
      const sign = ZODIAC_SIGNS.find((item) => item.id === post.channelId);
      if (sign) {
        if (!String(post.title || "").includes(sign.ruName) || !String(post.title || "").includes(sign.emoji)) {
          report.issues.critical.push(`${context}: sign title must include ${sign.emoji} ${sign.ruName}`);
          isWeak = true;
        }

        if (text.length < 850) {
          report.issues.critical.push(`${context}: sign post is too short for detailed format`);
          isWeak = true;
        }

        const sectionTitles = Array.isArray(post.sections) ? post.sections.map((section) => section.title) : [];
        for (const required of REQUIRED_SIGN_SECTIONS) {
          if (!sectionTitles.includes(required)) {
            report.issues.warnings.push(`${context}: Missing section "${required}"`);
            report.topIssues.push({ context, reason: `Missing section: ${required}` });
            isWeak = true;
          }
        }

        for (const otherSign of ZODIAC_SIGNS.filter((item) => item.id !== post.channelId)) {
          if (text.includes(`${otherSign.emoji} ${otherSign.ruName}`) || text.includes(`#${otherSign.ruName}`)) {
            report.issues.warnings.push(`${context}: sign post should focus on ${sign.ruName}, but mentions ${otherSign.ruName}`);
            isWeak = true;
          }
        }
      }
    }

    if (isWeak) report.weakPosts.push(post);
  }

  report.qualityStats.average = Math.round(totalScore / plan.posts.length);
  for (const [phrase, count] of Object.entries(phraseFrequency)) {
    if (count > 3) report.repeatedPhrases.push({ phrase, count });
  }
  report.topIssues = report.topIssues.slice(0, 10);

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (outFile) generateMarkdownReport(report, outFile);
  printReport(report);
}

function printReport(report) {
  console.log(`\nZodiac editorial review`);
  console.log(`Plan: ${report.planFile}`);
  console.log(`Days: ${report.daysCount}`);
  console.log(`Posts: ${report.totalPosts}`);
  console.log(`Average quality: ${report.qualityStats.average}`);
  console.log(`Posts needing rewrite: ${report.weakPosts.length}`);
  console.log(`Critical issues: ${report.issues.critical.length}`);
  console.log(`Warnings: ${report.issues.warnings.length}\n`);

  if (report.topIssues.length > 0) {
    console.log(`Top issues:`);
    report.topIssues.forEach((issue, i) => console.log(`${i + 1}. ${issue.context} — ${issue.reason}`));
    console.log("");
  }

  console.log(`Recommended next actions:`);
  if (report.weakPosts.length > 0) console.log(`* Rewrite ${report.weakPosts.length} weak posts.`);
  if (report.repeatedPhrases.length > 0) console.log(`* Reduce repeated phrases (${report.repeatedPhrases.length} highly repeated detected).`);
  if (report.qualityStats.below70 > 0) console.log(`* Re-run enhancer for posts below 70 score.`);
  if (report.weakPosts.length === 0 && report.issues.critical.length === 0) console.log(`* None. Plan looks solid!`);
  console.log("");
}

function generateMarkdownReport(report, outFile) {
  let md = `# Zodiac Editorial Review\n\n`;
  md += `**Plan:** \`${report.planFile}\`\n`;
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  md += `## Executive Summary\n\n`;
  md += `- **Total Posts:** ${report.totalPosts} (over ${report.daysCount} days)\n`;
  md += `- **Average Quality:** ${report.qualityStats.average}/100\n`;
  md += `- **Critical Issues:** ${report.issues.critical.length}\n`;
  md += `- **Warnings:** ${report.issues.warnings.length}\n`;
  md += `- **Posts Needing Rewrite:** ${report.weakPosts.length}\n\n`;
  md += `## Recommended Fixes\n\n`;
  if (report.weakPosts.length > 0) md += `- Rewrite ${report.weakPosts.length} weak posts.\n`;
  if (report.issues.critical.length > 0) md += `- Resolve all critical safety risks immediately.\n`;
  if (report.weakPosts.length === 0 && report.issues.critical.length === 0) md += `- None. Plan looks solid.\n`;
  md += `\n> **Note:** This is a read-only editorial review. No Telegram messages were sent and no runtime files were modified.\n`;

  const absolutePath = path.resolve(process.cwd(), outFile);
  const outDir = path.dirname(absolutePath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(absolutePath, md, "utf-8");
  console.log(`Markdown report saved to: ${outFile}`);
}

run();
