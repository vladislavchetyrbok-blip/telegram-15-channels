#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const VIEWPORTS = [
  { width: 375, height: 812, label: "375x812" },
  { width: 390, height: 844, label: "390x844" },
  { width: 393, height: 852, label: "393x852" },
  { width: 430, height: 932, label: "430x932" },
  { width: 1440, height: 900, label: "1440x900" },
];

const OUTPUT_ROOT = path.join("data", "runtime", "zodiac-orbit-qa");
const DEFAULT_BASE_URL = "http://127.0.0.1:3110";

main().catch((error) => {
  console.error("Zodiac Orbit QA: FAIL");
  console.error(`Reason: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const startedAt = new Date();
  const runId = startedAt.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const runDir = path.resolve(OUTPUT_ROOT, runId);
  fs.mkdirSync(runDir, { recursive: true });

  const browserPath = findBrowserExecutable();
  if (!browserPath) {
    throw new Error("Chrome or Edge executable not found; hard geometry QA cannot run.");
  }

  const server = await ensureServer(options.url || DEFAULT_BASE_URL, 90_000);
  const results = [];
  let status = "PASS";

  try {
    const routeChecks = await verifyRoutes(server.url, browserPath);
    results.push({ type: "routes", ...routeChecks });
    if (routeChecks.status !== "PASS") status = "FAIL";

    for (const viewport of VIEWPORTS) {
      const result = await verifyOrbitAtViewport(browserPath, `${server.url}/zodiac`, viewport);
      results.push(result);
      if (result.status !== "PASS") status = "FAIL";
      printViewport(result);
    }
  } finally {
    if (server.started && server.child?.pid) {
      await killProcessTree(server.child.pid);
    }
  }

  const report = {
    timestamp: startedAt.toISOString(),
    status,
    serverUrl: server.url,
    viewports: VIEWPORTS.map((viewport) => viewport.label),
    results,
  };

  const reportPath = path.join(runDir, "report.json");
  const latestPath = path.resolve(OUTPUT_ROOT, "latest-report.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(latestPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`Zodiac Orbit QA: ${status}`);
  console.log(`Report: ${reportPath}`);

  if (status !== "PASS") process.exitCode = 1;
}

async function verifyRoutes(baseUrl, browserPath) {
  const notasign = await probeHttpStatus(`${baseUrl}/zodiac/notasign`);
  const miniappStatus = await probeHttpStatus(`${baseUrl}/compatibility?miniapp=1`);
  const miniappRoot = miniappStatus === 200
    ? await pageHasMiniAppRoot(browserPath, `${baseUrl}/compatibility?miniapp=1`)
    : false;
  const failures = [];
  if (notasign !== 404) failures.push(`/zodiac/notasign expected 404, got ${notasign || "no response"}`);
  if (miniappStatus !== 200) failures.push(`/compatibility?miniapp=1 expected 200, got ${miniappStatus || "no response"}`);
  if (!miniappRoot) failures.push("/compatibility?miniapp=1 did not render Mini App root");
  if (failures.length) {
    console.error(`[FAIL] route safety: ${failures.join("; ")}`);
  } else {
    console.log("[PASS] route safety: /zodiac/notasign=404 and /compatibility?miniapp=1 renders Mini App");
  }
  return {
    status: failures.length ? "FAIL" : "PASS",
    notasignStatus: notasign,
    miniappStatus,
    miniappRoot,
    failures,
  };
}

async function pageHasMiniAppRoot(browserPath, url) {
  let browser = null;
  let client = null;
  try {
    browser = await launchBrowser(browserPath, { width: 390, height: 844 });
    const page = await createPage(browser.debugPort);
    client = await CdpClient.connect(page.webSocketDebuggerUrl);
    await client.call("Page.enable");
    await client.call("Runtime.enable");
    await navigateAndSettle(client, url);
    const result = await client.call("Runtime.evaluate", {
      expression: "Boolean(document.querySelector(\"[data-zodiac-mini-app-root='true']\"))",
      returnByValue: true,
    });
    return Boolean(result.result?.value);
  } finally {
    if (client) await client.close().catch(() => {});
    if (browser?.child?.pid) await killProcessTree(browser.child.pid);
    if (browser?.tempDir) await fs.promises.rm(browser.tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function verifyOrbitAtViewport(browserPath, url, viewport) {
  let browser = null;
  let client = null;
  try {
    browser = await launchBrowser(browserPath, viewport);
    const page = await createPage(browser.debugPort);
    client = await CdpClient.connect(page.webSocketDebuggerUrl);
    await client.call("Page.enable");
    await client.call("Runtime.enable");
    await navigateAndSettle(client, url);

    const evaluation = await client.call("Runtime.evaluate", {
      expression: `(${checkOrbitGeometry.toString()})()`,
      returnByValue: true,
      awaitPromise: true,
    });

    if (evaluation.exceptionDetails) {
      return fail(viewport, evaluation.exceptionDetails.text || "Browser evaluation failed");
    }

    const value = evaluation.result?.value;
    if (!value?.ok) return fail(viewport, value?.error || "Unknown orbit geometry failure", value?.metrics);

    return {
      type: "orbit",
      viewport: viewport.label,
      status: "PASS",
      metrics: value.metrics,
    };
  } catch (error) {
    return fail(viewport, error instanceof Error ? error.message : String(error));
  } finally {
    if (client) await client.close().catch(() => {});
    if (browser?.child?.pid) await killProcessTree(browser.child.pid);
    if (browser?.tempDir) await fs.promises.rm(browser.tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

function checkOrbitGeometry() {
  const wheel = document.querySelector("[data-public-zodiac-wheel]");
  const halo = document.querySelector("[data-public-zodiac-halo]");
  const orbitRing = document.querySelector("[data-public-zodiac-orbit-ring]");
  if (!wheel) return { ok: false, error: "Missing [data-public-zodiac-wheel]" };
  if (!halo) return { ok: false, error: "Missing [data-public-zodiac-halo]" };
  if (!orbitRing) return { ok: false, error: "Missing [data-public-zodiac-orbit-ring]" };

  wheel.scrollIntoView({ block: "center", inline: "center" });

  const root = document.documentElement;
  const viewportWidth = root.clientWidth;
  const scrollWidth = root.scrollWidth;
  if (scrollWidth > viewportWidth + 2) {
    return { ok: false, error: `Horizontal overflow: scrollWidth=${scrollWidth}, clientWidth=${viewportWidth}` };
  }

  const wheelRect = wheel.getBoundingClientRect();
  const haloRect = halo.getBoundingClientRect();
  const ringRect = orbitRing.getBoundingClientRect();
  const wheelCenter = centerOf(wheelRect);
  const haloCenter = centerOf(haloRect);
  const ringCenter = centerOf(ringRect);
  const centerDelta = Math.hypot(haloCenter.x - wheelCenter.x, haloCenter.y - wheelCenter.y);
  const ringCenterDelta = Math.hypot(ringCenter.x - haloCenter.x, ringCenter.y - haloCenter.y);
  if (centerDelta > 2) {
    return { ok: false, error: `Halo is not centered in wheel: center delta ${centerDelta.toFixed(2)}px`, metrics: { centerDelta } };
  }
  if (ringCenterDelta > 2) {
    return { ok: false, error: `Orbit ring is not centered on halo: center delta ${ringCenterDelta.toFixed(2)}px`, metrics: { centerDelta, ringCenterDelta } };
  }
  if (Math.abs(wheelRect.width - wheelRect.height) > 2) {
    return { ok: false, error: `Wheel is not square: ${wheelRect.width.toFixed(2)}x${wheelRect.height.toFixed(2)}` };
  }

  const glyphs = Array.from(halo.querySelectorAll("[data-public-zodiac-glyph]")).filter((node) => {
    const rect = node.getBoundingClientRect();
    const style = window.getComputedStyle(node);
    return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
  });
  if (glyphs.length !== 12) return { ok: false, error: `Expected 12 visible zodiac signs, found ${glyphs.length}` };

  const centers = [];
  const radii = [];
  const actualAngles = [];
  const declaredAngles = [];
  const clipped = [];

  glyphs.forEach((glyph, index) => {
    const rect = glyph.getBoundingClientRect();
    if (rect.left < -1 || rect.right > viewportWidth + 1 || rect.top < -1 || rect.bottom > window.innerHeight + 1) {
      clipped.push({
        index,
        text: glyph.textContent?.trim() || "",
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
      });
    }
    const center = centerOf(rect);
    centers.push(center);
    const dx = center.x - haloCenter.x;
    const dy = center.y - haloCenter.y;
    radii.push(Math.hypot(dx, dy));
    actualAngles.push(normalizeAngle(Math.atan2(dx, -dy) * 180 / Math.PI));
    declaredAngles.push(Number(glyph.getAttribute("data-public-zodiac-angle") || index * 30));
  });

  if (clipped.length) {
    return { ok: false, error: `Zodiac signs clipped: ${JSON.stringify(clipped.slice(0, 3))}` };
  }

  const roundedPositions = new Set(centers.map((point) => `${Math.round(point.x)}:${Math.round(point.y)}`));
  if (roundedPositions.size !== 12) {
    return { ok: false, error: `Expected 12 unique sign positions, got ${roundedPositions.size}` };
  }

  const radiusDelta = Math.max(...radii) - Math.min(...radii);
  if (radiusDelta > 2) {
    return { ok: false, error: `Radius delta ${radiusDelta.toFixed(2)}px exceeds 2px`, metrics: { radiusDelta } };
  }

  const spacingErrors = actualAngles
    .slice()
    .sort((a, b) => a - b)
    .map((angle, index, sorted) => {
      const next = sorted[(index + 1) % sorted.length];
      const spacing = (next - angle + 360) % 360;
      return Math.abs(spacing - 30);
    });
  const maxSpacingError = Math.max(...spacingErrors);
  if (maxSpacingError > 1) {
    return { ok: false, error: `Angle spacing delta ${maxSpacingError.toFixed(2)}deg exceeds 1deg`, metrics: { radiusDelta, maxSpacingError } };
  }

  const angleErrors = actualAngles.map((angle, index) => {
    const expected = normalizeAngle(declaredAngles[index]);
    return circularDelta(angle, expected);
  });
  const maxAngleError = Math.max(...angleErrors);
  if (maxAngleError > 1) {
    return { ok: false, error: `Declared angle delta ${maxAngleError.toFixed(2)}deg exceeds 1deg`, metrics: { radiusDelta, maxAngleError } };
  }

  return {
    ok: true,
    metrics: {
      visibleSigns: glyphs.length,
      centerDelta,
      ringCenterDelta,
      radiusDelta,
      maxSpacingError,
      maxAngleError,
      scrollWidth,
      clientWidth: viewportWidth,
    },
  };

  function centerOf(rect) {
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function normalizeAngle(angle) {
    return ((angle % 360) + 360) % 360;
  }

  function circularDelta(a, b) {
    const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
    return Math.min(diff, 360 - diff);
  }
}

async function navigateAndSettle(client, url) {
  await client.call("Page.navigate", { url });
  await sleep(1500);
  await waitFor(async () => {
    const result = await client.call("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true,
    });
    return result.result?.value === "interactive" || result.result?.value === "complete";
  }, "Page did not become ready", 20_000, 250);
  await sleep(1200);
}

function fail(viewport, error, metrics = {}) {
  return {
    type: "orbit",
    viewport: viewport.label,
    status: "FAIL",
    error,
    metrics,
  };
}

function printViewport(result) {
  if (result.status === "PASS") {
    console.log(
      `[PASS] ${result.viewport}: signs=${result.metrics.visibleSigns}, center=${result.metrics.centerDelta.toFixed(2)}px, radius=${result.metrics.radiusDelta.toFixed(2)}px, angle=${result.metrics.maxAngleError.toFixed(2)}deg`,
    );
  } else {
    console.error(`[FAIL] ${result.viewport}: ${result.error}`);
  }
}

async function ensureServer(rawUrl, timeoutMs) {
  const normalized = new URL(rawUrl);
  normalized.pathname = "";
  normalized.search = "";
  normalized.hash = "";
  const baseHref = normalized.href.replace(/\/$/, "");
  const requestedPort = Number(normalized.port || 3110);
  const portIsFree = await isPortFree(requestedPort);
  const firstProbe = await probeHttpStatus(`${baseHref}/`);
  if (firstProbe === 200) return { url: normalized.href.replace(/\/$/, ""), started: false };
  if (!portIsFree) {
    throw new Error(`Port ${requestedPort} is already in use but ${baseHref}/ returned ${firstProbe || "no response"}. Stop the stale server before running orbit QA.`);
  }

  const port = requestedPort;
  normalized.hostname = "127.0.0.1";
  normalized.port = String(port);

  const nextCli = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  if (!fs.existsSync(nextCli)) throw new Error(`Next CLI not found at ${nextCli}`);
  const mode = fs.existsSync(path.join(process.cwd(), ".next", "BUILD_ID")) ? "start" : "dev";
  const args = mode === "start"
    ? [nextCli, "start", "-H", "127.0.0.1", "-p", String(port)]
    : [nextCli, "dev", "-H", "127.0.0.1", "-p", String(port)];

  const child = spawn(process.execPath, args, {
    cwd: process.cwd(),
    env: { ...process.env, BROWSER: "none" },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  let output = "";
  child.stdout?.on("data", (chunk) => { output = `${output}${chunk}`.slice(-4000); });
  child.stderr?.on("data", (chunk) => { output = `${output}${chunk}`.slice(-4000); });

  await waitFor(async () => {
    if (child.exitCode !== null) throw new Error(`Next ${mode} exited early.\n${output}`);
    return (await probeHttpStatus(`${normalized.href}/`)) === 200;
  }, `Next ${mode} did not become ready at ${normalized.href}.\n${output}`, timeoutMs, 1000);

  return { url: normalized.href.replace(/\/$/, ""), started: true, child, mode };
}

async function launchBrowser(browserPath, viewport) {
  const debugPort = await findFreePort(9222);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "zodiac-orbit-qa-"));
  const child = spawn(browserPath, [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${tempDir}`,
    `--window-size=${viewport.width},${viewport.height}`,
    "--disable-background-networking",
    "--disable-dev-shm-usage",
    "--disable-extensions",
    "--disable-gpu",
    "--disable-sync",
    "--no-default-browser-check",
    "--no-first-run",
    "--no-sandbox",
    "about:blank",
  ], { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });

  await waitFor(async () => {
    if (child.exitCode !== null) throw new Error("Browser exited before CDP was ready");
    return Boolean(await fetchJson(`http://127.0.0.1:${debugPort}/json/version`).catch(() => null));
  }, "Chrome/Edge CDP did not start", 20_000, 300);

  return { child, debugPort, tempDir };
}

async function createPage(debugPort) {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: "PUT" });
  if (!response.ok) throw new Error(`Could not create browser page: HTTP ${response.status}`);
  return response.json();
}

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
  }

  static async connect(url) {
    const ws = new WebSocket(url);
    const client = new CdpClient(ws);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("CDP WebSocket open timeout")), 10_000);
      ws.addEventListener("open", () => {
        clearTimeout(timeout);
        resolve();
      }, { once: true });
      ws.addEventListener("error", () => {
        clearTimeout(timeout);
        reject(new Error("CDP WebSocket error"));
      }, { once: true });
    });
    ws.addEventListener("message", (event) => client.handleMessage(event.data));
    return client;
  }

  call(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP call timed out during ${method}`));
      }, 20_000);
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      this.pending.get(id).timeout = timeout;
    });
  }

  handleMessage(raw) {
    const message = JSON.parse(typeof raw === "string" ? raw : Buffer.from(raw).toString("utf8"));
    if (!message.id || !this.pending.has(message.id)) return;
    const pending = this.pending.get(message.id);
    this.pending.delete(message.id);
    clearTimeout(pending.timeout);
    if (message.error) pending.reject(new Error(message.error.message));
    else pending.resolve(message.result ?? {});
  }

  async close() {
    this.ws.close();
  }
}

function findBrowserExecutable() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.GOOGLE_CHROME_BIN,
    process.env.CHROMIUM_PATH,
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  ].filter(Boolean);

  if (process.platform === "win32") {
    for (const root of [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA].filter(Boolean)) {
      candidates.push(
        path.join(root, "Google", "Chrome", "Application", "chrome.exe"),
        path.join(root, "Microsoft", "Edge", "Application", "msedge.exe"),
      );
    }
  } else if (process.platform === "darwin") {
    candidates.push(
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    );
  } else {
    candidates.push("/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge");
  }
  return candidates.find((candidate) => candidate && fs.existsSync(candidate)) ?? null;
}

async function probeHttpStatus(url) {
  try {
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(5000) });
    return response.status;
  } catch {
    return 0;
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
  if (!response.ok) return null;
  return response.json();
}

async function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port, "127.0.0.1");
  });
}

async function findFreePort(start) {
  for (let port = start; port < start + 200; port += 1) {
    if (await isPortFree(port)) return port;
  }
  throw new Error(`No free port found starting at ${start}`);
}

async function waitFor(check, message, timeoutMs, intervalMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      if (await check()) return;
    } catch (error) {
      lastError = error;
    }
    await sleep(intervalMs);
  }
  if (lastError) throw lastError;
  throw new Error(message);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function killProcessTree(pid) {
  if (!pid) return;
  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
      killer.on("exit", resolve);
      killer.on("error", resolve);
    });
    return;
  }
  try {
    process.kill(pid, "SIGTERM");
  } catch {}
}

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--url") parsed.url = args[++index];
    else if (arg.startsWith("--url=")) parsed.url = arg.slice("--url=".length);
  }
  return parsed;
}
