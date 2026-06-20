#!/usr/bin/env node

import { spawn } from "node:child_process";
import http from "node:http";

const DEFAULT_TIMEOUT_MS = 120_000;
const URL_BASE = "http://localhost:3000";
const URL_OVERVIEW = `${URL_BASE}/dashboard/networks/zodiac`;
const URL_ANALYTICS = `${URL_BASE}/dashboard/networks/zodiac/analytics`;

async function main() {
  console.log("Starting Dashboard QA...");

  const server = await ensureServer(URL_BASE, DEFAULT_TIMEOUT_MS);
  console.log(`Server is running at ${URL_BASE}`);

  try {
    console.log(`Checking ${URL_OVERVIEW}`);
    const overviewHtml = await fetchUrl(URL_OVERVIEW);

    assertIncludes(overviewHtml, 'href="/dashboard/networks/zodiac/analytics"', "overview analytics route link");
    assertNoSecretValues(overviewHtml, "overview page");
    assertNoRuntimeErrorText(overviewHtml, "overview page");

    const hasRedisValues = Boolean(process.env.ZODIAC_ANALYTICS_REDIS_URL && process.env.ZODIAC_ANALYTICS_REDIS_TOKEN);
    if (hasRedisValues && overviewHtml.includes("Redis storage пока не активен")) {
      throw new Error("Redis is active, but overview shows noop state warning.");
    }

    console.log(`Checking ${URL_ANALYTICS}`);
    const analyticsHtml = await fetchUrl(URL_ANALYTICS);

    if (analyticsHtml === overviewHtml) {
      throw new Error("Analytics page looks identical to Overview page.");
    }

    assertIncludes(analyticsHtml, "Zodiac Mini App Analytics", "analytics page heading");
    assertIncludes(analyticsHtml, "First-users funnel", "first-users funnel block");
    assertIncludes(analyticsHtml, "Open Mini App", "soft-launch funnel first step");
    assertIncludes(analyticsHtml, "Open Feature", "soft-launch funnel feature step");
    assertIncludes(analyticsHtml, "Get Result", "soft-launch funnel result step");
    assertIncludes(analyticsHtml, "Save/Share", "soft-launch funnel save/share step");
    assertIncludes(analyticsHtml, "Feedback", "soft-launch funnel feedback step");
    assertIncludes(analyticsHtml, "Mini App opens", "overview card Mini App opens");
    assertIncludes(analyticsHtml, "Feature opens", "overview card Feature opens");
    assertIncludes(analyticsHtml, "Results calculated", "overview card Results calculated");
    assertIncludes(analyticsHtml, "Save actions", "save metric label");
    assertIncludes(analyticsHtml, "Share actions", "share metric label");
    assertIncludes(analyticsHtml, "Feedback opened", "feedback metric label");
    assertIncludes(analyticsHtml, "Top sections for first users", "top sections block");
    assertIncludes(analyticsHtml, "Compatibility", "Compatibility top section");
    assertIncludes(analyticsHtml, "Premium Natal", "Premium Natal top section");
    assertIncludes(analyticsHtml, "Birth Matrix", "Birth Matrix top section");
    assertIncludes(analyticsHtml, "Tarot/Rune", "Tarot/Rune top section");
    assertIncludes(analyticsHtml, "Lunar/Ritual", "Lunar/Ritual top section");
    assertIncludes(analyticsHtml, "Angel Numbers", "Angel Numbers top section");
    assertIncludes(analyticsHtml, "VIP", "VIP top section");
    assertIncludes(analyticsHtml, "Profile", "Profile top section");
    assertIncludes(analyticsHtml, "First users observation", "first users observation card");
    assertIncludes(analyticsHtml, "no raw sensitive data is visible", "privacy observation item");
    assertIncludes(analyticsHtml, "docs/zodiac-first-users-analytics-baseline.md", "baseline doc path");
    assertIncludes(analyticsHtml, "docs/zodiac-controlled-soft-launch-execution.md", "soft launch execution doc path");
    assertIncludes(analyticsHtml, "docs/zodiac-soft-launch-batch-template.md", "batch template doc path");

    if (hasRedisValues) assertIncludes(analyticsHtml, "Production analytics: Redis active", "Redis active state");
    else assertIncludes(analyticsHtml, "Production analytics: noop", "noop state");

    assertNoSecretValues(analyticsHtml, "analytics page");
    assertNoRuntimeErrorText(analyticsHtml, "analytics page");

    console.log("Dashboard QA: PASS");
  } finally {
    if (server.started) {
      server.process.kill();
    }
  }
}

function assertIncludes(html, needle, label) {
  if (!html.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

function assertNoRuntimeErrorText(html, label) {
  const forbidden = ["Application error", "Internal Server Error", "NEXT_RUNTIME", "__NEXT_ERROR__"];
  for (const needle of forbidden) {
    if (html.includes(needle)) throw new Error(`${label} contains runtime error text: ${needle}`);
  }
}

function assertNoSecretValues(html, label) {
  const candidates = [
    process.env.ZODIAC_ANALYTICS_REDIS_URL,
    process.env.ZODIAC_ANALYTICS_REDIS_TOKEN,
  ].filter((value) => typeof value === "string" && value.length >= 8);

  for (const value of candidates) {
    if (html.includes(value)) throw new Error(`${label} leaks a configured Redis secret value.`);
  }
}

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to load ${url}, status code: ${res.statusCode}`));
        } else {
          resolve(data);
        }
      });
    }).on("error", reject);
  });
}

async function ensureServer(url, timeoutMs) {
  const isUp = await probe(url);
  if (isUp) return { started: false };

  console.log("Starting local production server...");
  const devProcess = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3000"], { stdio: "ignore", windowsHide: true });

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await probe(url)) {
      return { started: true, process: devProcess };
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  devProcess.kill();
  throw new Error("Timeout waiting for dashboard server.");
}

async function probe(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(Boolean(res.statusCode && res.statusCode >= 200 && res.statusCode < 400));
    });
    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

main().catch((error) => {
  console.error("Dashboard QA: FAIL");
  console.error(error);
  process.exit(1);
});
