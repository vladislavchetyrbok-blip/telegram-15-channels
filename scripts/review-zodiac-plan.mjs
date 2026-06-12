import fs from "fs";
import path from "path";
import process from "process";

const ZODIAC_CHANNEL_IDS = [
  "zodiac-general", "aries", "taurus", "gemini", "cancer", "leo",
  "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

const CLICHE_PHRASES = [
  "Возможны перемены", "Будьте внимательны", "Сегодня вас ждёт успех",
  "Звёзды говорят", "Всё получится", "Вас ждёт любовь", "День будет удачным",
  "Не упустите шанс", "Вселенная подсказывает", "Судьба готовит", "Карты говорят",
  "Энергии дня"
];

const RISK_PHRASES = [
  "гарантирован", "болезнь", "диагноз", "врач", "катастрофа", "смерть", "угроза", 
  "выздоровление", "инвестируйте", "100%", "обязательно", "неминуемо"
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
  if (plan.status === "published") {
    console.error("Error: Cannot review a published plan.");
    process.exit(1);
  }
  if (plan.publishReady) {
    console.error("Error: Cannot review a plan marked as publishReady.");
    process.exit(1);
  }

  const report = {
    planFile: path.basename(planFile),
    daysCount: plan.daysCount || 0,
    totalPosts: plan.posts.length,
    qualityStats: {
      average: 0,
      min: 100,
      max: 0,
      below70: 0,
      below50: 0
    },
    issues: {
      critical: [],
      warnings: []
    },
    repeatedPhrases: [],
    weakPosts: [],
    topIssues: []
  };

  let totalScore = 0;
  let scoredCount = 0;

  const phraseFrequency = {};
  const titles = new Set();
  const visualPrompts = new Set();
  
  plan.posts.forEach((post, index) => {
    const context = `${post.channelId} / ${post.date}`;
    let isWeak = false;

    // Reject legacy IDs
    if (!ZODIAC_CHANNEL_IDS.includes(post.channelId)) {
      console.error(`Error: Legacy or unknown channel ID detected: ${post.channelId}`);
      process.exit(1);
    }

    // Quality Score
    const score = typeof post.qualityScore === "number" ? post.qualityScore : 100; // Assume 100 if missing
    totalScore += score;
    scoredCount++;
    report.qualityStats.min = Math.min(report.qualityStats.min, score);
    report.qualityStats.max = Math.max(report.qualityStats.max, score);

    if (score < 70) report.qualityStats.below70++;
    if (score < 50) report.qualityStats.below50++;

    if (score < 70) {
      isWeak = true;
      report.topIssues.push({ context, reason: `Low quality score (${score})` });
    }

    // Missing Content
    if (!post.title) { report.issues.critical.push(`${context}: Missing title`); isWeak = true; }
    if (!post.text) { report.issues.critical.push(`${context}: Missing text`); isWeak = true; }
    if (!post.visualPrompt) { report.issues.warnings.push(`${context}: Missing visualPrompt`); }
    if (!post.sections || post.sections.length === 0) { report.issues.warnings.push(`${context}: Missing sections array`); }

    // Repetitions
    if (post.title) {
      if (titles.has(post.title)) {
        report.issues.warnings.push(`${context}: Repeated title "${post.title}"`);
      }
      titles.add(post.title);
    }
    if (post.visualPrompt) {
      if (visualPrompts.has(post.visualPrompt)) {
        report.issues.warnings.push(`${context}: Repeated visual prompt`);
      }
      visualPrompts.add(post.visualPrompt);
    }

    const fullText = (post.text || "").toLowerCase();

    // Cliché Detection
    CLICHE_PHRASES.forEach(phrase => {
      if (fullText.includes(phrase.toLowerCase())) {
        report.issues.warnings.push(`${context}: Cliché detected "${phrase}"`);
        isWeak = true;
      }
    });

    // Risk Detection
    RISK_PHRASES.forEach(phrase => {
      if (fullText.includes(phrase.toLowerCase())) {
        report.issues.critical.push(`${context}: Safety risk phrase detected "${phrase}"`);
        isWeak = true;
        report.topIssues.push({ context, reason: `Safety risk: ${phrase}` });
      }
    });

    // Simple phrase frequency tracking (very rudimentary sentences splitting)
    const sentences = fullText.split(/[.?!]/).map(s => s.trim()).filter(s => s.length > 20);
    sentences.forEach(s => {
      phraseFrequency[s] = (phraseFrequency[s] || 0) + 1;
    });

    // Structure checks
    if (post.type === "sign" && post.sections) {
      const required = ["Главное", "Любовь", "Деньги", "Работа", "Предупреждение", "Совет"];
      const actual = post.sections.map(s => s.title);
      required.forEach(r => {
        if (!actual.includes(r)) {
          report.issues.warnings.push(`${context}: Missing section "${r}"`);
          report.topIssues.push({ context, reason: `Missing section: ${r}` });
          isWeak = true;
        }
      });
    }

    if (isWeak) {
      report.weakPosts.push(post);
    }
  });

  report.qualityStats.average = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;

  // Extract heavily repeated long phrases
  for (const [phrase, count] of Object.entries(phraseFrequency)) {
    if (count > 3) {
      report.repeatedPhrases.push({ phrase, count });
    }
  }

  // Deduplicate and limit top issues
  report.topIssues = report.topIssues.slice(0, 10);

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (outFile) {
    generateMarkdownReport(report, outFile);
  }

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
    report.topIssues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.context} — ${issue.reason}`);
    });
    console.log("");
  }

  console.log(`Recommended next actions:`);
  if (report.weakPosts.length > 0) {
    console.log(`* Rewrite ${report.weakPosts.length} weak posts.`);
  }
  if (report.repeatedPhrases.length > 0) {
    console.log(`* Reduce repeated phrases (${report.repeatedPhrases.length} highly repeated detected).`);
  }
  if (report.qualityStats.below70 > 0) {
    console.log(`* Re-run LM Studio enhancer for posts below 70 score.`);
  }
  if (report.weakPosts.length === 0 && report.issues.critical.length === 0) {
    console.log(`* None. Plan looks solid!`);
  }
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

  md += `## Quality Summary\n\n`;
  md += `| Metric | Value |\n|---|---|\n`;
  md += `| Average | ${report.qualityStats.average} |\n`;
  md += `| Max | ${report.qualityStats.max} |\n`;
  md += `| Min | ${report.qualityStats.min} |\n`;
  md += `| Below 70 (Acceptable) | ${report.qualityStats.below70} |\n`;
  md += `| Below 50 (Blocked) | ${report.qualityStats.below50} |\n\n`;

  if (report.topIssues.length > 0) {
    md += `## Top Issues\n\n`;
    report.topIssues.forEach(i => {
      md += `- **${i.context}**: ${i.reason}\n`;
    });
    md += `\n`;
  }

  if (report.repeatedPhrases.length > 0) {
    md += `## Repeated Phrases (Over 3 times)\n\n`;
    report.repeatedPhrases.sort((a, b) => b.count - a.count).forEach(p => {
      md += `- \`${p.phrase}\` (${p.count} times)\n`;
    });
    md += `\n`;
  }

  md += `## Recommended Fixes\n\n`;
  if (report.weakPosts.length > 0) {
    md += `- Rewrite ${report.weakPosts.length} weak posts using LM Studio Enhancer.\n`;
  }
  if (report.issues.critical.length > 0) {
    md += `- Resolve all critical safety risks immediately.\n`;
  }

  md += `\n> **Note:** This is a read-only editorial review. No Telegram messages were sent and no runtime files were modified.\n`;

  const absolutePath = path.resolve(process.cwd(), outFile);
  const outDir = path.dirname(absolutePath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(absolutePath, md, "utf-8");
  console.log(`Markdown report saved to: ${outFile}`);
}

run();
