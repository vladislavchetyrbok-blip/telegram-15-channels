#!/usr/bin/env node

import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import vm from "node:vm";

const nodeRequire = createRequire(import.meta.url);
const projectRoot = process.cwd();
const fixturePath = "data/fixtures/zodiac-astro-engine/fixture-set.json";

const files = {
  fixtureSet: fixturePath,
  engine: "lib/zodiac-astro-engine.ts",
  symbolicProvider: "lib/zodiac-astro-providers/symbolic-provider.ts",
  exactProvider: "lib/zodiac-astro-providers/exact-provider-placeholder.ts",
  realEngineDoc: "docs/zodiac-real-astro-engine.md",
  natalDoc: "docs/zodiac-natal-chart.md",
  productionReadinessDoc: "docs/zodiac-production-readiness.md",
};

const report = {
  ok: true,
  status: "PASS",
  files,
  fixturesChecked: 0,
  checks: {},
  warnings: [],
  errors: [],
  livePublishCalls: 0,
  ledgerWrites: 0,
  externalApiCalls: 0,
};

function read(relPath) {
  const absPath = path.join(projectRoot, relPath);
  if (!fs.existsSync(absPath)) fail(`Missing required file: ${relPath}`);
  return fs.existsSync(absPath) ? fs.readFileSync(absPath, "utf8") : "";
}

function readJson(relPath) {
  const text = read(relPath);
  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`Invalid JSON fixture file ${relPath}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function pass(name, value = true) {
  report.checks[name] = value;
}

function fail(message) {
  report.ok = false;
  report.status = "FAIL";
  report.errors.push(message);
}

const fixtureSet = readJson(files.fixtureSet);
const exactProviderSource = read(files.exactProvider);
const symbolicProviderSource = read(files.symbolicProvider);
const docsText = [
  read(files.realEngineDoc),
  read(files.natalDoc),
  read(files.productionReadinessDoc),
].join("\n");

const loader = createTsLoader();
const astroEngine = loader.load(path.join(projectRoot, files.engine));

validateFixtureSet(fixtureSet);
validateProviderSources(exactProviderSource, symbolicProviderSource);
validateDocs(docsText);
validateRuntimeFixtures(fixtureSet?.fixtures ?? [], astroEngine);

console.log(JSON.stringify(report, null, 2));
process.exitCode = report.ok ? 0 : 1;

function validateFixtureSet(value) {
  const ok =
    value &&
    value.version === 1 &&
    Array.isArray(value.fixtures) &&
    value.fixtures.length >= 2;
  pass("fixtureSetFormatValid", Boolean(ok));
  if (!ok) {
    fail("Fixture set must be version 1 and contain at least two fixtures.");
    return;
  }

  for (const fixture of value.fixtures) {
    const label = fixture?.id || "unknown";
    if (!fixture.nonPersonal) fail(`Fixture must be marked nonPersonal: ${label}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fixture.birthDate || "")) fail(`Fixture birthDate must be YYYY-MM-DD: ${label}`);
    if (!/^\d{2}:\d{2}$/.test(fixture.birthTime || "")) fail(`Fixture birthTime must be HH:mm: ${label}`);
    if (fixture.timezone !== "UTC") fail(`Fixture timezone must be UTC placeholder: ${label}`);
    if (!/placeholder/i.test(fixture.cityLabel || "")) fail(`Fixture cityLabel must stay a placeholder: ${label}`);
    if (!Number.isFinite(fixture.coordinates?.latitude) || !Number.isFinite(fixture.coordinates?.longitude)) {
      fail(`Fixture coordinates must be numeric placeholders: ${label}`);
    }
    if (fixture.name || fixture.phone || fixture.userId) fail(`Fixture must not include personal identifiers: ${label}`);
    if (fixture.expected?.exactMode !== "exact_unavailable") fail(`Fixture expected exact mode must stay unavailable: ${label}`);
    if (fixture.expected?.symbolicMode !== "symbolic") fail(`Fixture expected symbolic mode must be symbolic: ${label}`);
  }
  pass("fixturesNonPersonal", true);
  pass("fixturesUsePlaceholderCities", true);
}

function validateProviderSources(exactProvider, symbolicProvider) {
  const exactUnavailable =
    exactProvider.includes("mode: \"exact_unavailable\"") &&
    exactProvider.includes("provider: \"future_exact_provider\"");
  pass("exactProviderUnavailable", exactUnavailable);
  if (!exactUnavailable) fail("Exact provider must remain exact_unavailable.");

  const noFakePlanets = /planets:\s*undefined/.test(exactProvider) && !/planets:\s*\[/.test(exactProvider);
  const noFakeHouses = /houses:\s*undefined/.test(exactProvider) && !/houses:\s*\[/.test(exactProvider);
  const noFakeAscendant = /ascendant:\s*undefined/.test(exactProvider) && !/ascendant:\s*\{/.test(exactProvider);
  const noExternalCalls = !/\bfetch\s*\(|https?:\/\/|XMLHttpRequest|axios/i.test(exactProvider);
  const symbolicHonest =
    symbolicProvider.includes("mode: \"symbolic\"") &&
    symbolicProvider.includes("must not be presented as exact");

  pass("exactProviderNoFakePlanets", noFakePlanets);
  pass("exactProviderNoFakeHouses", noFakeHouses);
  pass("exactProviderNoFakeAscendant", noFakeAscendant);
  pass("exactProviderNoExternalCalls", noExternalCalls);
  pass("symbolicProviderHonest", symbolicHonest);

  if (!noFakePlanets) fail("Exact provider must not return fake planet arrays.");
  if (!noFakeHouses) fail("Exact provider must not return fake house arrays.");
  if (!noFakeAscendant) fail("Exact provider must not return fake ascendant.");
  if (!noExternalCalls) fail("Exact provider must not make external API calls.");
  if (!symbolicHonest) fail("Symbolic provider must keep honest symbolic wording.");
}

function validateDocs(text) {
  const docsSayUnavailable = /exact_unavailable/i.test(text);
  const docsSaySymbolic = /symbolic/i.test(text);
  const docsAvoidActiveExact = !/exact mode is active|exact provider is active|точный режим включ[её]н/i.test(text);
  const docsMentionFixtures = /fixture/i.test(text) || /fixtures/i.test(text);

  pass("docsMentionExactUnavailable", docsSayUnavailable);
  pass("docsMentionSymbolic", docsSaySymbolic);
  pass("docsDoNotClaimExactActive", docsAvoidActiveExact);
  pass("docsMentionFixtures", docsMentionFixtures);

  if (!docsSayUnavailable) fail("Docs must mention exact_unavailable.");
  if (!docsSaySymbolic) fail("Docs must mention symbolic mode.");
  if (!docsAvoidActiveExact) fail("Docs must not claim exact mode is active.");
  if (!docsMentionFixtures) fail("Docs must mention fixture validation.");
}

function validateRuntimeFixtures(fixtures, engine) {
  if (!fixtures.length) return;

  for (const fixture of fixtures) {
    const sign = makeFixtureSign(fixture.signSlug);
    const input = {
      birthDate: fixture.birthDate,
      birthTime: fixture.birthTime,
      timezone: fixture.timezone,
      birthCity: fixture.cityLabel,
      latitude: fixture.coordinates.latitude,
      longitude: fixture.coordinates.longitude,
      sign,
    };

    const exact = engine.calculateExactNatalChart(input);
    const symbolic = engine.getSymbolicNatalChart(input);

    if (exact.status?.mode !== "exact_unavailable") fail(`Exact fixture must remain unavailable: ${fixture.id}`);
    if (exact.status?.exactCalculationsAvailable !== false) fail(`Exact calculations flag must be false: ${fixture.id}`);
    if (exact.planets !== undefined) fail(`Exact fixture must not return planets: ${fixture.id}`);
    if (exact.houses !== undefined) fail(`Exact fixture must not return houses: ${fixture.id}`);
    if (exact.ascendant !== undefined) fail(`Exact fixture must not return ascendant: ${fixture.id}`);
    if (symbolic.status?.mode !== "symbolic") fail(`Symbolic fixture must return symbolic mode: ${fixture.id}`);
    if (symbolic.sign?.slug !== fixture.signSlug) fail(`Symbolic fixture sign mismatch: ${fixture.id}`);
    if ("planets" in symbolic || "houses" in symbolic || "ascendant" in symbolic) {
      fail(`Symbolic fixture must not expose exact chart fields: ${fixture.id}`);
    }
    report.fixturesChecked += 1;
  }

  pass("runtimeFixturesChecked", report.fixturesChecked);
  pass("runtimeExactUnavailable", true);
  pass("runtimeSymbolicSafe", true);
}

function makeFixtureSign(slug) {
  const signs = {
    capricorn: { slug: "capricorn", name: "Козерог", emoji: "♑", element: "earth" },
    gemini: { slug: "gemini", name: "Близнецы", emoji: "♊", element: "air" },
  };
  return signs[slug] ?? { slug, name: slug, emoji: "✦", element: "air" };
}

function createTsLoader() {
  const cache = new Map();

  function load(filePath) {
    const resolved = resolveTsPath(filePath);
    if (cache.has(resolved)) {
      return cache.get(resolved).exports;
    }

    const module = { exports: {} };
    cache.set(resolved, module);
    const source = fs.readFileSync(resolved, "utf8");
    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
      fileName: resolved,
    }).outputText;

    const context = {
      exports: module.exports,
      module,
      process: { env: process.env },
      require: (id) => requireFrom(resolved, id),
    };

    vm.runInNewContext(transpiled, context, { filename: resolved });
    return module.exports;
  }

  function requireFrom(parentPath, id) {
    if (id.startsWith("node:")) {
      return nodeRequire(id);
    }

    if (id.startsWith("@/")) {
      return load(path.join(projectRoot, id.slice(2)));
    }

    if (id.startsWith(".")) {
      return load(path.resolve(path.dirname(parentPath), id));
    }

    return nodeRequire(id);
  }

  function resolveTsPath(value) {
    const candidates = [
      value,
      `${value}.ts`,
      `${value}.tsx`,
      `${value}.js`,
      `${value}.mjs`,
      path.join(value, "index.ts"),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return path.resolve(candidate);
      }
    }

    throw new Error(`Unable to resolve TS module: ${value}`);
  }

  return { load };
}
