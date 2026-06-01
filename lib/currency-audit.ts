import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { listContentPlanItems } from "@/lib/content-plan-store";
import { listEditorialProfiles } from "@/lib/editorial";
import { listPostDrafts } from "@/lib/post-draft-store";

interface CurrencyAuditMatch {
  file: string;
  line: number;
  term: string;
  preview: string;
}

const excludedDirs = new Set([".git", ".next", ".npm-cache", ".tools", "node_modules"]);
const includedExtensions = new Set([
  ".css",
  ".env",
  ".example",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
]);

export function getForbiddenCurrencyTerms() {
  return [
    "\u20bd",
    ["р", "у", "б"].join(""),
    ["р", "у", "б", "л", "ь"].join(""),
    ["р", "у", "б", "л", "и"].join(""),
    ["р", "у", "б", "л", "е", "й"].join(""),
    ["R", "U", "B"].join(""),
    ["r", "o", "u", "b", "l", "e"].join(""),
    ["r", "u", "b", "l", "e"].join(""),
    ["Russian", " ", "r", "u", "b", "l", "e"].join(""),
    ["р", "о", "с", "с", "и", "й", "с", "к", "и", "й", " ", "р", "у", "б", "л", "ь"].join(""),
    ["р", "о", "с", "і", "й", "с", "ь", "к", "и", "й", " ", "р", "у", "б", "л", "ь"].join(""),
  ];
}

export function runCurrencyAudit(rootDir = process.cwd()) {
  const checkedTerms = getForbiddenCurrencyTerms();
  const matches: CurrencyAuditMatch[] = [];

  for (const file of listFiles(rootDir)) {
    const content = readFileSync(file, "utf8");
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      for (const term of checkedTerms) {
        if (lineHasForbiddenTerm(line, term)) {
          matches.push({
            file: path.relative(rootDir, file),
            line: index + 1,
            term,
            preview: line.trim().slice(0, 240),
          });
        }
      }
    });
  }

  for (const source of listRuntimeSources()) {
    const validation = validateCurrencyPolicy(source.text);

    for (const match of validation.matches) {
      matches.push({
        file: source.name,
        line: 1,
        term: match.term,
        preview: match.context.trim().slice(0, 240),
      });
    }
  }

  return {
    ok: matches.length === 0,
    forbiddenCurrencyFound: matches.length > 0,
    matches,
    checkedTerms,
    recommendation: matches.length
      ? "Replace forbidden currency mentions with UAH, USD or EUR depending on channel context."
      : "Forbidden currency mentions were not found in source files or runtime mock stores.",
  };
}

function listRuntimeSources() {
  return [
    ...channelGenerationConfigs.map((channel) => ({
      name: `runtime/channel/${channel.id}`,
      text: [channel.name, channel.topic, channel.postStyle, channel.postingFrequency].join("\n"),
    })),
    ...listEditorialProfiles().map((profile) => ({
      name: `runtime/editorial-profile/${profile.channelId}`,
      text: [
        profile.channelTitle,
        profile.tone,
        profile.audience,
        profile.contentPillars.join("\n"),
        profile.forbiddenTopics.join("\n"),
        profile.styleRules.join("\n"),
        profile.formattingRules.join("\n"),
        profile.callToActionRules.join("\n"),
        profile.examplesGood.join("\n"),
        profile.examplesBad.join("\n"),
      ].join("\n"),
    })),
    ...listPostDrafts().map((draft) => ({
      name: `runtime/post-draft/${draft.id}`,
      text: [draft.title, draft.topic, draft.content].join("\n"),
    })),
    ...listContentPlanItems().map((item) => ({
      name: `runtime/content-plan/${item.id}`,
      text: [item.topic, item.angle].join("\n"),
    })),
  ];
}

function listFiles(rootDir: string) {
  if (!existsSync(rootDir)) {
    return [];
  }

  const files: string[] = [];
  const stack = [rootDir];

  while (stack.length) {
    const current = stack.pop();

    if (!current) {
      continue;
    }

    for (const item of readdirSync(current)) {
      if (excludedDirs.has(item)) {
        continue;
      }

      const itemPath = path.join(current, item);
      const stats = statSync(itemPath);

      if (stats.isDirectory()) {
        stack.push(itemPath);
        continue;
      }

      if (stats.isFile() && shouldScanFile(itemPath)) {
        files.push(itemPath);
      }
    }
  }

  return files;
}

function shouldScanFile(filePath: string) {
  const basename = path.basename(filePath);

  if (basename === "package-lock.json" || basename === "tsconfig.tsbuildinfo") {
    return false;
  }

  if (basename.startsWith(".env")) {
    return true;
  }

  return includedExtensions.has(path.extname(filePath));
}

function lineHasForbiddenTerm(line: string, term: string) {
  if (/^[a-z ]+$/i.test(term)) {
    return new RegExp(`(?<![A-Za-z])${escapeRegExp(term)}(?![A-Za-z])`, "i").test(line);
  }

  return line.toLowerCase().includes(term.toLowerCase());
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
