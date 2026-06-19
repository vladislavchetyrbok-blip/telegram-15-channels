#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const files = {
  engine: "lib/zodiac-astro-engine.ts",
  symbolicProvider: "lib/zodiac-astro-providers/symbolic-provider.ts",
  exactProvider: "lib/zodiac-astro-providers/exact-provider-placeholder.ts",
  natalVisual: "components/zodiac-mini-app/NatalChartVisual.tsx",
  vipSections: "components/ZodiacVipSections.tsx",
  analyticsShared: "lib/zodiac-mini-app-analytics-shared.ts",
  natalDoc: "docs/zodiac-natal-chart.md",
  finalMapDoc: "docs/zodiac-final-astro-map.md",
  realEngineDoc: "docs/zodiac-real-astro-engine.md",
};

const report = {
  ok: true,
  status: "PASS",
  files,
  checks: {},
  warnings: [],
  errors: [],
  livePublishCalls: 0,
  ledgerWrites: 0,
};

function read(relPath) {
  const absPath = path.join(root, relPath);
  if (!fs.existsSync(absPath)) fail(`Missing required file: ${relPath}`);
  return fs.existsSync(absPath) ? fs.readFileSync(absPath, "utf8") : "";
}

function fail(message) {
  report.ok = false;
  report.status = "FAIL";
  report.errors.push(message);
}

function pass(name, value = true) {
  report.checks[name] = value;
}

const engine = read(files.engine);
const symbolicProvider = read(files.symbolicProvider);
const exactProvider = read(files.exactProvider);
const natalVisual = read(files.natalVisual);
const vipSections = read(files.vipSections);
const analyticsShared = read(files.analyticsShared);
const natalDoc = read(files.natalDoc);
const finalMapDoc = read(files.finalMapDoc);
const realEngineDoc = read(files.realEngineDoc);

for (const [name, relPath] of Object.entries(files)) {
  if (fs.existsSync(path.join(root, relPath))) pass(`${name}Exists`);
}

const requiredEngineMarkers = [
  "export type AstroEngineMode",
  "export type BirthInput",
  "export type AstroEngineStatus",
  "export type ExactChartResult",
  "calculateExactNatalChart",
  "getExactChartReadiness",
  "exact_unavailable",
];

for (const marker of requiredEngineMarkers) {
  if (!engine.includes(marker)) fail(`Engine contract missing marker: ${marker}`);
}
pass("typedEngineContract", requiredEngineMarkers.every((marker) => engine.includes(marker)));

const providerChecks = {
  symbolicProviderHonest: symbolicProvider.includes("mode: \"symbolic\"") && symbolicProvider.includes("must not be presented as exact"),
  exactProviderUnavailable: exactProvider.includes("mode: \"exact_unavailable\"") && exactProvider.includes("provider: \"future_exact_provider\""),
  exactProviderNoFakePlanets: /planets:\s*undefined/.test(exactProvider) && !/planets:\s*\[/.test(exactProvider),
  exactProviderNoFakeHouses: /houses:\s*undefined/.test(exactProvider) && !/houses:\s*\[/.test(exactProvider),
  exactProviderNoFakeAscendant: /ascendant:\s*undefined/.test(exactProvider) && !/ascendant:\s*\{/.test(exactProvider),
  noRandomOrHashExact: !/Math\.random|hashString|seeded|deterministic/i.test(exactProvider),
};
Object.entries(providerChecks).forEach(([name, ok]) => {
  pass(name, ok);
  if (!ok) fail(`Provider check failed: ${name}`);
});

const uiChecks = {
  premiumNatalStatusPanel: natalVisual.includes("data-premium-natal-engine-status"),
  premiumNatalExactUnavailableText: natalVisual.includes("Точный астрологический движок ещё не подключён"),
  premiumNatalKeepsSymbolicChart: natalVisual.includes("data-premium-natal-chart") && natalVisual.includes("getSymbolicAstroEngineStatus"),
  vipStillAvoidsExactClaims: vipSections.includes("точные дома") && vipSections.includes("real astro engine"),
};
Object.entries(uiChecks).forEach(([name, ok]) => {
  pass(name, ok);
  if (!ok) fail(`UI check failed: ${name}`);
});

const docsText = [natalDoc, finalMapDoc, realEngineDoc].join("\n");
const docsChecks = {
  docsMentionSymbolic: /symbolic/i.test(docsText),
  docsMentionExactUnavailable: /exact_unavailable/i.test(docsText),
  docsMentionNoFakeExact: /no fake exact|Do not claim exact|must not fabricate/i.test(docsText),
  realEngineDocHasPhases: /Phase 1/i.test(realEngineDoc) && /Phase 5/i.test(realEngineDoc),
};
Object.entries(docsChecks).forEach(([name, ok]) => {
  pass(name, ok);
  if (!ok) fail(`Docs check failed: ${name}`);
});

const forbiddenAnalyticsFields = ["birthDate", "birthTime", "birthCity", "cityQuery", "selectedCityId", "rawInput", "rawResult", "resultText"];
const analyticsAllowedBlock = analyticsShared.match(/ALLOWED_PAYLOAD_FIELDS[\s\S]*?\]/)?.[0] ?? analyticsShared;
const forbiddenAllowedFields = forbiddenAnalyticsFields.filter((field) => new RegExp(`["']${field}["']`).test(analyticsAllowedBlock));
pass("analyticsNoRawBirthFields", forbiddenAllowedFields.length === 0);
if (forbiddenAllowedFields.length) fail(`Analytics allowlist includes forbidden raw fields: ${forbiddenAllowedFields.join(", ")}`);

const fakeExactSelectors = [
  "data-exact-planet-degree",
  "data-exact-house-cusp",
  "data-exact-ascendant",
];
const fakeExactHits = fakeExactSelectors.filter((selector) => natalVisual.includes(selector) || vipSections.includes(selector));
pass("uiNoFakeExactSelectors", fakeExactHits.length === 0);
if (fakeExactHits.length) fail(`UI contains fake exact selectors: ${fakeExactHits.join(", ")}`);

console.log(JSON.stringify(report, null, 2));
process.exitCode = report.ok ? 0 : 1;
