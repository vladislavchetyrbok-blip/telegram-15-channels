#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const mobileMaxBytes = 700 * 1024;
const desktopMaxBytes = 1_200 * 1024;

const requiredAssets = [
  {
    route: "/",
    routeFile: "app/page.tsx",
    mobile: "public/public-site/art/hero/home-hero-mobile.webp",
    desktop: "public/public-site/art/hero/home-hero-desktop.webp",
  },
  {
    route: "/tarot",
    routeFile: "app/tarot/page.tsx",
    mobile: "public/public-site/art/tarot/tarot-ritual-hero-mobile.webp",
    desktop: "public/public-site/art/tarot/tarot-ritual-hero-desktop.webp",
  },
  {
    route: "/compatibility",
    routeFile: "app/compatibility/page.tsx",
    mobile: "public/public-site/art/compatibility/compatibility-orbs-mobile.webp",
    desktop: "public/public-site/art/compatibility/compatibility-orbs-desktop.webp",
  },
  {
    route: "/zodiac",
    routeFile: "app/zodiac/page.tsx",
    mobile: "public/public-site/art/zodiac/zodiac-astrolabe-mobile.webp",
    desktop: "public/public-site/art/zodiac/zodiac-astrolabe-desktop.webp",
  },
  {
    route: "/zodiac/aries",
    routeFile: "app/zodiac/[sign]/page.tsx",
    mobile: "public/public-site/art/signs/aries-profile-mobile.webp",
    desktop: "public/public-site/art/signs/aries-profile-desktop.webp",
  },
];

const errors = [];
const assetRows = [];
let totalBytes = 0;

function check(condition, message) {
  if (!condition) errors.push(message);
}

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

const artRoot = path.join(repoRoot, "public/public-site/art");
check(fs.existsSync(artRoot), "Missing public/public-site/art directory.");

for (const item of requiredAssets) {
  const routeSource = read(item.routeFile);
  for (const [kind, assetPath] of [
    ["mobile", item.mobile],
    ["desktop", item.desktop],
  ]) {
    const absolutePath = path.join(repoRoot, assetPath);
    const publicPath = `/${assetPath.replace(/^public\//, "")}`;
    const limit = kind === "mobile" ? mobileMaxBytes : desktopMaxBytes;

    check(fs.existsSync(absolutePath), `Missing ${kind} asset for ${item.route}: ${assetPath}`);
    if (fs.existsSync(absolutePath)) {
      const size = fs.statSync(absolutePath).size;
      totalBytes += size;
      assetRows.push(`${assetPath} ${size} bytes`);
      check(size > 0, `Asset is empty: ${assetPath}`);
      check(size <= limit, `${assetPath} exceeds ${limit} bytes (${size}).`);
    }

    check(routeSource.includes(publicPath), `${item.routeFile} does not reference expected ${kind} asset: ${publicPath}`);
  }
  check(routeSource.includes("PublicArtHero"), `${item.routeFile} does not use PublicArtHero for ${item.route}.`);
}

const artHeroPath = "components/public-site/PublicArtHero.tsx";
check(fs.existsSync(path.join(repoRoot, artHeroPath)), "Missing PublicArtHero component.");
if (fs.existsSync(path.join(repoRoot, artHeroPath))) {
  const artHeroSource = read(artHeroPath);
  check(artHeroSource.includes('from "next/image"'), "PublicArtHero must use next/image.");
  check(artHeroSource.includes("<Image"), "PublicArtHero must render optimized Image components.");
  check(artHeroSource.includes("data-public-art-asset"), "PublicArtHero must mark public art images for auditability.");
}

if (errors.length) {
  console.error("Public Art Assets QA: FAIL");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Public Art Assets QA: PASS");
console.log(`Required routes checked : ${requiredAssets.length}`);
console.log(`Required assets checked : ${assetRows.length}`);
console.log(`Total required art size : ${totalBytes} bytes`);
console.log("Assets:");
for (const row of assetRows) console.log(`- ${row}`);
console.log("Rendering               : next/image via PublicArtHero");
console.log("CTA safety              : delegated to website:qa");
