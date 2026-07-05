#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const telegramLink = "https://t.me/zodiac_love_check_bot?startapp=mystic";

const requiredRouteFiles = [
  "app/page.tsx",
  "app/tarot/page.tsx",
  "app/compatibility/page.tsx",
  "app/zodiac/page.tsx",
  "app/zodiac/[sign]/page.tsx",
  "app/privacy/page.tsx",
  "app/terms/page.tsx",
];

const publicSourceFiles = [
  ...requiredRouteFiles,
  "app/sitemap.ts",
  "app/robots.ts",
  "components/public-site/CosmicSite.tsx",
  "components/public-site/PublicArtHero.tsx",
  "lib/public-website.ts",
].filter((filePath) => fs.existsSync(path.join(repoRoot, filePath)));

const errors = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

for (const routeFile of requiredRouteFiles) {
  check(fs.existsSync(path.join(repoRoot, routeFile)), `Missing public route file: ${routeFile}`);
}

check(fs.existsSync(path.join(repoRoot, "app/sitemap.ts")), "Missing sitemap.ts.");
check(fs.existsSync(path.join(repoRoot, "app/robots.ts")), "Missing robots.ts.");

const siteDataSource = read("lib/public-website.ts");
const signSlugMatches = [...siteDataSource.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
const expectedSigns = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];
check(signSlugMatches.length === 12, `Expected 12 zodiac signs, found ${signSlugMatches.length}.`);
for (const sign of expectedSigns) {
  check(signSlugMatches.includes(sign), `Missing zodiac sign slug: ${sign}`);
}

const homeSource = read("app/page.tsx");
const tarotSource = read("app/tarot/page.tsx");
const compatibilitySource = read("app/compatibility/page.tsx");
const zodiacIndexSource = read("app/zodiac/page.tsx");
const zodiacSignSource = read("app/zodiac/[sign]/page.tsx");
const privacySource = read("app/privacy/page.tsx");
const termsSource = read("app/terms/page.tsx");
const componentSource = read("components/public-site/CosmicSite.tsx");
const sitemapSource = read("app/sitemap.ts");
const robotsSource = read("app/robots.ts");
const appShellSource = read("components/AppShell.tsx");
const smokeSource = read("scripts/smoke-zodiac-mini-app.mjs");

const metadataSources = [
  ["home", homeSource],
  ["tarot", tarotSource],
  ["compatibility", compatibilitySource],
  ["zodiac", zodiacIndexSource],
  ["privacy", privacySource],
  ["terms", termsSource],
];

for (const [name, source] of metadataSources) {
  check(source.includes("export const metadata"), `${name} route is missing metadata export.`);
  check(source.includes("openGraph"), `${name} route is missing OpenGraph metadata.`);
}
check(zodiacSignSource.includes("generateMetadata"), "Dynamic zodiac sign page is missing generateMetadata.");
check(zodiacSignSource.includes("generateStaticParams"), "Dynamic zodiac sign page is missing generateStaticParams.");

check(componentSource.includes("CosmicSiteShell"), "CosmicSiteShell component is missing.");
check(componentSource.includes("CosmicBackground"), "CosmicBackground component is missing.");
check(componentSource.includes("cosmic-starfield"), "Starfield layer is missing.");
check(componentSource.includes("MysticOrb"), "MysticOrb motif is missing.");
check(componentSource.includes("TarotPreviewCard"), "Tarot preview motif is missing.");
check(componentSource.includes("ZodiacWheel"), "Zodiac wheel motif is missing.");
check(componentSource.includes("SiteCTA"), "SiteCTA component is missing.");
check(componentSource.includes("ZodiacSignCard"), "ZodiacSignCard component is missing.");
check(componentSource.includes("LegalPageShell"), "LegalPageShell component is missing.");

check(siteDataSource.includes(`TELEGRAM_MINI_APP_LINK = "${telegramLink}"`), "Telegram Mini App link constant is missing or changed.");
check((componentSource.match(/data-site-cta=/g) ?? []).length >= 4, "Expected Telegram CTA markers in public site components.");
check(!/data-site-cta[\s\S]{0,260}href=["']\//.test(componentSource), "A site CTA points to an internal route.");
check(!/data-site-cta[\s\S]{0,260}href=["'](?!https:\/\/t\.me\/zodiac_love_check_bot\?startapp=mystic)/.test(componentSource), "A site CTA points outside the approved Telegram link.");
check(!/href=["']\/(?:admin|dashboard|api|settings|publishing-center)/.test(componentSource), "Public site component links to a private/admin route.");

check(compatibilitySource.includes("shouldRenderMiniApp"), "Compatibility route must preserve Mini App rendering branch.");
check(compatibilitySource.includes("searchParams.miniapp"), "Compatibility route must support explicit miniapp smoke/default param.");
check(compatibilitySource.includes("searchParams.startapp"), "Compatibility route must preserve Telegram startapp support.");
check(smokeSource.includes("compatibility?miniapp=1"), "Mini App smoke default URL must target the Mini App branch after public compatibility landing was added.");

check(sitemapSource.includes('"/tarot"') && sitemapSource.includes('"/compatibility"') && sitemapSource.includes('"/zodiac"'), "Sitemap is missing main public routes.");
check(sitemapSource.includes("zodiacPublicSigns"), "Sitemap must include all zodiac sign pages.");
check(robotsSource.includes('allow: ["/", "/tarot", "/compatibility", "/zodiac", "/privacy", "/terms"]'), "Robots must allow public website routes.");
check(robotsSource.includes('disallow: ["/admin", "/api", "/dashboard"'), "Robots must disallow private/admin/API routes.");

const userFacingPublicSourceFiles = requiredRouteFiles.concat([
  "components/public-site/CosmicSite.tsx",
  "lib/public-website.ts",
]);
const publicSource = userFacingPublicSourceFiles.map(read).join("\n");
const forbiddenPublicPatterns = [
  /100%\s*prediction/i,
  /guaranteed future/i,
  /гарантированн/i,
  /\/admin\b/i,
  /\/dashboard\b/i,
  /payment/i,
  /unlock\s+vip/i,
  /vip\s+unlock/i,
  /instagram/i,
  /tiktok/i,
  /api[_-]?key/i,
  /access[_-]?token/i,
];
for (const pattern of forbiddenPublicPatterns) {
  check(!pattern.test(publicSource), `Forbidden public website content pattern found: ${pattern}`);
}

const changedFiles = gitChangedFiles();
const forbiddenChangedPathPatterns = [
  /^apps\//,
  /^\.github\/workflows\//,
  /^scripts\/zodiac-telegram-publisher\.mjs$/,
  /^scripts\/publish-/,
  /^app\/api\/telegram\//,
  /\.env(?:\.local)?$/,
];
for (const changedFile of changedFiles) {
  const normalized = changedFile.replaceAll("\\", "/");
  for (const pattern of forbiddenChangedPathPatterns) {
    check(!pattern.test(normalized), `Forbidden path changed: ${changedFile}`);
  }
  check(!/\.webp$/i.test(normalized) || /^public\/public-site\/art\/.+\.webp$/i.test(normalized), `Forbidden WebP path changed: ${changedFile}`);
}

if (errors.length) {
  console.error("Public Website QA: FAIL");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Public Website QA: PASS");
console.log("Routes checked          : 18");
console.log("Zodiac sign pages       : 12");
console.log("CTA safety             : Telegram-only");
console.log("Private route CTA links : none");
console.log("Sitemap/robots          : present");
console.log("Forbidden paths touched : none");
console.log("Social APIs/posting     : none");

function gitChangedFiles() {
  const files = new Set();
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
