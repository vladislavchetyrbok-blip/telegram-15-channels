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

    if (!overviewHtml.includes("Открыть аналитику")) {
      throw new Error("Overview page missing 'Открыть аналитику' CTA.");
    }
    
    if (!overviewHtml.includes('href="/dashboard/networks/zodiac/analytics"')) {
      throw new Error("Overview page missing link to '/dashboard/networks/zodiac/analytics'.");
    }

    if (overviewHtml.includes("process.env.ZODIAC_ANALYTICS_REDIS_TOKEN")) {
       throw new Error("Overview page leaks Redis token source code.");
    }

    const hasRedisValues = process.env.ZODIAC_ANALYTICS_REDIS_URL && process.env.ZODIAC_ANALYTICS_REDIS_TOKEN;
    if (hasRedisValues && overviewHtml.includes("Redis storage пока не активен")) {
      throw new Error("Redis is active, but overview shows noop state warning.");
    }
    if (!hasRedisValues && !overviewHtml.includes("Redis storage пока не активен")) {
      throw new Error("Redis is inactive, but overview missing noop state warning.");
    }

    console.log(`Checking ${URL_ANALYTICS}`);
    const analyticsHtml = await fetchUrl(URL_ANALYTICS);

    // Some naive text that distinguishes analytics from overview
    if (analyticsHtml.includes("Быстрые действия") && !analyticsHtml.includes("Аналитика")) {
      throw new Error("Analytics page looks identical to Overview page.");
    }
    
    console.log("Dashboard QA: PASS");
  } finally {
    if (server.started) {
      server.process.kill();
    }
  }
}

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to load ${url}, status code: ${res.statusCode}`));
        } else {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function ensureServer(url, timeoutMs) {
  const isUp = await probe(URL_BASE);
  if (isUp) return { started: false };

  console.log("Starting local dev server...");
  const devProcess = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3000"], { stdio: "ignore" });

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await probe(URL_BASE)) {
      return { started: true, process: devProcess };
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  devProcess.kill();
  throw new Error("Timeout waiting for dev server.");
}

async function probe(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

main().catch(err => {
  console.error("Dashboard QA: FAIL");
  console.error(err);
  process.exit(1);
});
