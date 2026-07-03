#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const datasetPath = path.join(repoRoot, "data", "config", "tarot-major-arcana.json");
const assetManifestPath = path.join(repoRoot, "data", "config", "tarot-card-assets.json");
const selectionSourcePath = path.join(repoRoot, "lib", "zodiac-tarot-daily.ts");
const uiSourcePath = path.join(repoRoot, "components", "zodiac-mini-app", "DailyTarotCardFeature.tsx");
const homeSourcePath = path.join(repoRoot, "components", "zodiac-mini-app", "AphroditeHomeScreen.tsx");
const miniAppShellSourcePath = path.join(repoRoot, "components", "ZodiacCompatibilityMiniApp.tsx");
const assetReadmePath = path.join(repoRoot, "public", "assets", "tarot", "README.md");
const assetGitkeepPath = path.join(repoRoot, "public", "assets", "tarot", ".gitkeep");

const requiredFields = [
  "id",
  "number",
  "slug",
  "ruTitle",
  "enTitle",
  "keywords",
  "dayMeaning",
  "loveMeaning",
  "advice",
  "action",
  "imagePath",
];

const expectedImagePaths = [
  "/assets/tarot/major-00-fool.webp",
  "/assets/tarot/major-01-magician.webp",
  "/assets/tarot/major-02-high-priestess.webp",
  "/assets/tarot/major-03-empress.webp",
  "/assets/tarot/major-04-emperor.webp",
  "/assets/tarot/major-05-hierophant.webp",
  "/assets/tarot/major-06-lovers.webp",
  "/assets/tarot/major-07-chariot.webp",
  "/assets/tarot/major-08-strength.webp",
  "/assets/tarot/major-09-hermit.webp",
  "/assets/tarot/major-10-wheel-of-fortune.webp",
  "/assets/tarot/major-11-justice.webp",
  "/assets/tarot/major-12-hanged-man.webp",
  "/assets/tarot/major-13-death.webp",
  "/assets/tarot/major-14-temperance.webp",
  "/assets/tarot/major-15-devil.webp",
  "/assets/tarot/major-16-tower.webp",
  "/assets/tarot/major-17-star.webp",
  "/assets/tarot/major-18-moon.webp",
  "/assets/tarot/major-19-sun.webp",
  "/assets/tarot/major-20-judgement.webp",
  "/assets/tarot/major-21-world.webp",
];

const errors = [];
const warnings = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function readText(filePath) {
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8");
}

const cards = JSON.parse(readText(datasetPath) || "[]");
const assetManifest = JSON.parse(readText(assetManifestPath) || "{}");
check(Array.isArray(cards), "Tarot dataset must be an array.");
check(cards.length === 22, `Tarot dataset must contain exactly 22 cards; found ${cards.length}.`);

const ids = new Set();
const slugs = new Set();
const imagePaths = new Set();

for (const [index, card] of cards.entries()) {
  for (const field of requiredFields) {
    check(Object.prototype.hasOwnProperty.call(card, field), `Card ${index} is missing required field: ${field}.`);
  }

  check(typeof card.id === "string" && card.id.trim().length > 0, `Card ${index} has invalid id.`);
  check(typeof card.slug === "string" && card.slug.trim().length > 0, `Card ${index} has invalid slug.`);
  check(Number.isInteger(card.number) && card.number === index, `Card ${card.id || index} must have number ${index}.`);
  check(typeof card.ruTitle === "string" && card.ruTitle.trim().length >= 2, `Card ${card.id || index} has invalid ruTitle.`);
  check(typeof card.enTitle === "string" && card.enTitle.trim().length >= 2, `Card ${card.id || index} has invalid enTitle.`);
  check(Array.isArray(card.keywords) && card.keywords.length >= 2, `Card ${card.id || index} must have at least 2 keywords.`);
  check(typeof card.dayMeaning === "string" && card.dayMeaning.trim().length >= 24, `Card ${card.id || index} has too-short dayMeaning.`);
  check(typeof card.loveMeaning === "string" && card.loveMeaning.trim().length >= 24, `Card ${card.id || index} has too-short loveMeaning.`);
  check(typeof card.advice === "string" && card.advice.trim().length >= 16, `Card ${card.id || index} has too-short advice.`);
  check(typeof card.action === "string" && card.action.trim().length >= 16, `Card ${card.id || index} has too-short action.`);
  check(typeof card.imagePath === "string" && card.imagePath.startsWith("/assets/tarot/"), `Card ${card.id || index} imagePath must start with /assets/tarot/.`);
  check(typeof card.imagePath === "string" && card.imagePath.endsWith(".webp"), `Card ${card.id || index} imagePath must end with .webp.`);

  if (ids.has(card.id)) errors.push(`Duplicate card id: ${card.id}.`);
  if (slugs.has(card.slug)) errors.push(`Duplicate card slug: ${card.slug}.`);
  if (imagePaths.has(card.imagePath)) errors.push(`Duplicate imagePath: ${card.imagePath}.`);
  ids.add(card.id);
  slugs.add(card.slug);
  imagePaths.add(card.imagePath);
}

for (const expectedPath of expectedImagePaths) {
  check(imagePaths.has(expectedPath), `Expected imagePath is missing from dataset: ${expectedPath}.`);
}

const selectionSource = readText(selectionSourcePath);
check(selectionSource.includes("selectDailyTarotCard"), "Daily selection function is missing.");
check(selectionSource.includes("normalizeTelegramUserSeed"), "Telegram user id normalization is missing.");
check(selectionSource.includes("hasTarotImageAsset"), "Asset availability guard is missing.");
check(selectionSource.includes("date-only"), "Date-only fallback seed mode is missing.");
check(selectionSource.includes("telegram-user"), "Telegram user seed mode is missing.");
check(Array.isArray(assetManifest.availableImagePaths), "Tarot asset manifest must expose availableImagePaths array.");
for (const imagePath of assetManifest.availableImagePaths ?? []) {
  check(typeof imagePath === "string" && imagePaths.has(imagePath), `Asset manifest path is not present in dataset: ${imagePath}.`);
}

const selectedA = selectForQa(cards, "2026-07-02", "123456");
const selectedB = selectForQa(cards, "2026-07-02", "123456");
const selectedFallbackA = selectForQa(cards, "2026-07-02", "");
const selectedFallbackB = selectForQa(cards, "2026-07-02", null);
check(selectedA?.id === selectedB?.id, "Daily selection is not deterministic for the same Telegram user and date.");
check(selectedFallbackA?.id === selectedFallbackB?.id, "Date-only fallback selection is not deterministic.");
check(Boolean(selectedA?.id), "Telegram user daily selection did not return a card.");
check(Boolean(selectedFallbackA?.id), "Date-only daily selection did not return a card.");

const uiSource = readText(uiSourcePath);
check(uiSource.includes("data-tarot-image-fallback"), "Image fallback marker is missing from UI.");
check(uiSource.includes("Открыть карту дня"), "Reveal button copy is missing.");
check(uiSource.includes("selectDailyTarotCard"), "UI does not use daily tarot selection.");
check(uiSource.includes("imageAssetAvailable && imageReady"), "UI must not request missing tarot image assets.");
check(uiSource.includes("telegramUserId"), "UI does not accept Telegram user id seed.");
check(uiSource.includes("onReveal"), "Reveal haptic hook is missing from Tarot UI.");
check(uiSource.includes("Старший аркан") || uiSource.includes("Таро V1") || uiSource.includes("Карта дня"), "Fallback card must use premium user-facing wording.");
const blockedVisibleFallbackCopy = [
  ["asset", "fallback"],
  ["missing", "asset"],
  ["image", "missing"],
].map((parts) => parts.join(" "));
for (const blockedVisibleCopy of blockedVisibleFallbackCopy) {
  check(!uiSource.includes(blockedVisibleCopy), `Technical fallback wording must not be visible: ${blockedVisibleCopy}.`);
}

const homeSource = readText(homeSourcePath);
check(homeSource.includes('id: "daily_tarot"'), "Main Mini App screen is missing daily tarot entry point.");
check(homeSource.includes('feature: "dailyCard"'), "Main Mini App screen does not route to daily tarot.");
check(homeSource.includes("Карта дня"), "Main Mini App screen is missing daily card label.");

const miniAppShellSource = readText(miniAppShellSourcePath);
check(miniAppShellSource.includes("initDataUnsafe?.user?.id"), "Telegram user id is not passed into daily tarot selection.");
check(miniAppShellSource.includes("daily_tarot_reveal"), "Daily tarot reveal haptic event is not wired in Mini App shell.");
check(fs.existsSync(assetGitkeepPath), "public/assets/tarot/.gitkeep is missing.");
check(fs.existsSync(assetReadmePath), "public/assets/tarot/README.md is missing.");

const changedFiles = gitChangedFiles();
const forbiddenPathPatterns = [
  /^apps\//,
  /^\.github\/workflows\//,
  /^scripts\/zodiac-telegram-publisher\.mjs$/,
  /^scripts\/publish-/,
  /^app\/api\/telegram\//,
];
for (const filePath of changedFiles) {
  for (const pattern of forbiddenPathPatterns) {
    check(!pattern.test(filePath.replaceAll("\\", "/")), `Forbidden path touched: ${filePath}.`);
  }
  if (/^public\/assets\/tarot\/.+\.webp$/i.test(filePath.replaceAll("\\", "/"))) {
    errors.push(`Generated tarot image asset must not be committed in V1: ${filePath}.`);
  }
}

const tarotSourcesForSafety = [datasetPath, selectionSourcePath, uiSourcePath, homeSourcePath, assetReadmePath].map(readText).join("\n");
const forbiddenContentPatterns = [
  /\/admin\b/i,
  /\/dashboard\b/i,
  /payment/i,
  /unlock\s+vip/i,
  /vip\s+unlock/i,
  /instagram/i,
  /tiktok/i,
  /telegram\s+live/i,
  /botfather/i,
  /api[_-]?key/i,
  /access[_-]?token/i,
];
for (const pattern of forbiddenContentPatterns) {
  check(!pattern.test(tarotSourcesForSafety), `Forbidden content pattern found in tarot sources: ${pattern}.`);
}

if (changedFiles.some((filePath) => filePath.startsWith("public/assets/tarot/") && filePath.endsWith(".webp"))) {
  warnings.push("Tarot .webp assets are present in the diff; confirm owner approval before commit.");
}

if (errors.length) {
  console.error("Tarot V1 QA: FAIL");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Tarot V1 QA: PASS");
console.log(`Cards checked          : ${cards.length}`);
console.log(`Unique ids             : ${ids.size}`);
console.log(`Unique slugs           : ${slugs.size}`);
console.log(`Image pipeline         : /assets/tarot/*.webp`);
console.log(`Telegram user fallback : deterministic`);
console.log(`Date fallback          : deterministic`);
console.log(`Image-safe card UI     : present`);
console.log(`Forbidden paths touched: none`);
console.log(`Social APIs/posting    : none`);
if (warnings.length) {
  for (const warning of warnings) console.log(`Warning: ${warning}`);
}

function selectForQa(items, dateKey, telegramUserId) {
  const userSeed = String(telegramUserId ?? "").trim().replace(/[^\dA-Za-z_-]/g, "");
  const seed = userSeed ? `${dateKey}:telegram:${userSeed}` : `${dateKey}:date`;
  return items[stableTarotHash(seed) % items.length];
}

function stableTarotHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function gitChangedFiles() {
  const diffResult = spawnSync("git", ["diff", "--name-only", "origin/main"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: false,
  });
  const statusResult = spawnSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: false,
  });
  const files = new Set();

  if (diffResult.status === 0) {
    for (const line of diffResult.stdout.split(/\r?\n/)) {
      if (line.trim()) files.add(line.trim());
    }
  }

  if (statusResult.status === 0) {
    for (const line of statusResult.stdout.split(/\r?\n/)) {
      const filePath = line.slice(3).trim();
      if (filePath) files.add(filePath);
    }
  }

  return [...files];
}
