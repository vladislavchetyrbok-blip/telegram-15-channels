#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const DEFAULT_URL = "http://localhost:3000/compatibility";
const DEFAULT_TIMEOUT_MS = 120_000;
const VIEWPORT = { width: 390, height: 844 };
const VIP_ACTIVE_CARDS = [
  "Расширенная натальная карта",
  "Месячный прогноз",
  "Расширенный именной профиль",
  "Расширенная совместимость",
  "Ментальная карта пары",
  "30-дневный календарь пары",
  "Помощник сообщений",
  "Расширенная нумерология",
  "Толкование ангельских чисел",
  "Талисманы и символы силы",
  "VIP мистический день",
];
const MYSTIC_FEATURES = ["Карта", "Таро", "Руна"];
const BIRTH_MATRIX_LABELS = ["Матрица судьбы", "Матрица рождения", "Матрица"];
const PLACEHOLDER_PATTERNS = [/TODO/i, /lorem ipsum/i, /placeholder/i, /Скоро появится/i];

const options = parseArgs(process.argv.slice(2));
const startedProcesses = [];
let tempBrowserProfile = null;

main().catch((error) => {
  console.error(`Mini App Smoke: FAIL`);
  console.error(`Reason: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}).finally(async () => {
  await cleanup();
});

async function main() {
  const initialUrl = options.url ?? process.env.ZODIAC_MINIAPP_SMOKE_URL ?? DEFAULT_URL;
  const timeoutMs = numberOption(options.timeout, DEFAULT_TIMEOUT_MS);
  const report = createReport();

  const server = await ensureMiniAppServer(initialUrl, timeoutMs, Boolean(options.url || process.env.ZODIAC_MINIAPP_SMOKE_URL));
  report.serverUrl = server.url;
  report.startedDevServer = server.started;
  report.serverMode = server.mode || (server.started ? "unknown" : "external");

  const browserPath = findBrowserExecutable();
  if (!browserPath || typeof WebSocket !== "function") {
    printSkipped("headless browser not available", report);
    return;
  }

  let browser;
  try {
    browser = await launchBrowser(browserPath);
  } catch (error) {
    printSkipped(`headless browser not available (${error instanceof Error ? error.message : String(error)})`, report);
    return;
  }

  const page = await createPage(browser.debugPort);
  const client = await CdpClient.connect(page.webSocketDebuggerUrl);
  attachErrorCollectors(client, report);
  await enablePageDomains(client);

  const httpStatus = await probeHttpStatus(server.url);
  report.httpStatus = httpStatus;
  if (httpStatus !== 200) {
    throw new Error(`Expected HTTP 200 for ${server.url}, got ${httpStatus || "no response"}.`);
  }

  await navigate(client, server.url);
  await installSmokeHelpers(client);
  await runBrowserModeSmoke(client, report);
  await runStartParamSmoke(client, server.url, report);

  report.telegramMock = "RUNNING";
  await installTelegramMock(client);
  await navigate(client, withSmokeParam(server.url, "telegram"));
  await installSmokeHelpers(client);
  await runTelegramMockSmoke(client, report);

  await client.close();

  if (report.consoleErrors.length || report.runtimeErrors.length || report.networkErrors.length) {
    throw new Error(`Browser reported errors: console=${report.consoleErrors.length}, runtime=${report.runtimeErrors.length}, network=${report.networkErrors.length}.`);
  }

  report.browserMode = "PASS";
  report.telegramMock = "PASS";
  printSummary("PASS", report);
}

async function runBrowserModeSmoke(client, report) {
  await waitForPageText(client, /Астрологический центр|Выберите, что хотите узнать сегодня/, "Mini App main menu hero did not render.");
  const mainCategories = ["Гороскопы", "Совместимость", "Матрица судьбы", "Ангельские числа", "Нумерология", "Мистика", "Таро и руны", "Луна и ритуалы", "VIP раздел", "Мой профиль"];
  for (const category of mainCategories) {
    if (!(await hasText(client, new RegExp(category, "i")))) throw new Error(`Main menu category is missing: ${category}`);
  }
  if (await hasText(client, /Розыгрыши/i)) throw new Error("Giveaways should not be a top-level main menu category.");
  report.mainMenuCategoryCount = mainCategories.length;
  report.mainMenuChecked = true;

  await click(client, "Совместимость");
  await waitForPageText(client, /Любовная совместимость|Дружеская совместимость|Совместимость/, "Compatibility category did not render.");
  await click(client, "Любовная совместимость");
  await waitForPageText(client, /Выберите знак|Овен/, "Compatibility sign gate did not render.");
  await click(client, "Овен");
  await waitForPageText(client, /Совместимость|Шаг 1/, "Love flow did not render after sign selection.");
  await click(client, "Далее");
  await waitForPageText(client, /Партнёр|Рассчитать/, "Compatibility step 2 did not render.");
  await click(client, "Рассчитать");
  await waitForPageText(client, /гармонии|совместимость|Заполните данные/, "Compatibility flow did not reach a stable result state.");

  await click(client, "Главное меню");
  await waitForPageText(client, /Астрологический центр|Выберите, что хотите узнать сегодня/, "Back to main menu did not render after Compatibility.");
  await click(client, "Гороскопы");
  await waitForPageText(client, /Гороскопы|Гороскоп недели|Удачные дни|Лунный календарь/, "Horoscopes category did not render.");
  report.horoscopesChecked = true;

  await click(client, "Главное меню");
  await waitForPageText(client, /Астрологический центр|Ангельские числа/, "Back to main menu did not render after Horoscopes.");
  await click(client, "Ангельские числа");
  await waitForPageText(client, /Ангельские числа|11:11|22:22/, "Angel Numbers category did not render.");
  await assertFeatureScreen(client, "Ангельские числа", { allowSoon: false, minLength: 260 });
  report.angelNumbersChecked = true;

  await click(client, "Главное меню");
  await waitForPageText(client, /Астрологический центр|VIP раздел/, "Back to main menu did not render after Angel Numbers.");
  await click(client, "VIP раздел");
  await waitForPageText(client, /VIP открыт бесплатно|Ранний доступ до 17\.09\.2026/, "VIP menu did not render.");
  report.freeAccessVisible = await hasText(client, /17\.09\.2026/);

  const giveawayStatus = await evalPage(client, "window.__zodiacSmoke.buttonStatus(arguments[0])", ["Розыгрыши"]);
  report.giveawaysLocked = Boolean(giveawayStatus.exists && giveawayStatus.disabled);

  for (const card of VIP_ACTIVE_CARDS) {
    await click(client, card);
    await settle(client);
    await assertFeatureScreen(client, card);
    report.vipChecked += 1;
    await clickBackIcon(client);
    await waitForPageText(client, /VIP открыт бесплатно|Ранний доступ до 17\.09\.2026/, `Back did not return from VIP card "${card}".`);
  }

  await click(client, "Главное меню");
  await waitForPageText(client, /Астрологический центр|Мистика/, "Back to main menu did not render after VIP.");
  await click(client, "Мистика");
  await waitForPageText(client, /Мистика|Ангельские числа|11:11/, "Mystic tab did not render.");
  for (const feature of MYSTIC_FEATURES) {
    await click(client, feature);
    await settle(client);
    await assertFeatureScreen(client, feature, { allowSoon: false, minLength: 260 });
    report.mysticChecked += 1;
    await click(client, "11:11");
    await waitForPageText(client, /Ангельские числа|11:11/, `Mystic default tab did not return after "${feature}".`);
  }

  await openBirthMatrix(client);
  await fillVisibleInput(client, "19.06.1992");
  await click(client, "Рассчитать");
  await settle(client);
  await assertFeatureScreen(client, "Матрица судьбы", { allowSoon: false, minLength: 520 });
  await click(client, "11:11");
  await waitForPageText(client, /Ангельские числа|11:11/, "Mystic default tab did not return after Birth Matrix.");
  report.birthMatrixChecked = true;

  report.browserMode = "PASS";
}

async function runStartParamSmoke(client, baseUrl, report) {
  const cases = [
    { param: "compat", sign: "Овен", beforeSign: "Любовная совместимость", landing: /Любовная совместимость|Совместимость/, pattern: /Совместимость|Шаг 1/, message: "startapp=compat did not open Compatibility after sign selection." },
    { param: "compat_gemini", sign: "Близнецы", beforeSign: "Любовная совместимость", landing: /Любовная совместимость|Совместимость/, pattern: /Совместимость|Шаг 1/, message: "startapp=compat_gemini did not open Compatibility after sign selection." },
    { param: "mystic", sign: "Овен", landing: /Мистика|Выберите знак/, pattern: /Мистика|Ангельские числа|11:11/, message: "startapp=mystic did not open Mystic after sign selection." },
    { param: "vip", sign: "Овен", landing: /VIP раздел|Выберите знак/, pattern: /VIP открыт бесплатно|Ранний доступ до 17\.09\.2026/, message: "startapp=vip did not open VIP after sign selection." },
    { param: "birth_matrix", sign: "Овен", landing: /Матрица судьбы|Выберите знак/, pattern: /Матрица|дд\.мм\.гггг|Дата/, message: "startapp=birth_matrix did not open Birth Matrix after sign selection." },
    { param: "angel_numbers", sign: "Овен", landing: /Ангельские числа|Выберите знак/, pattern: /Ангельские числа|11:11|22:22/, message: "startapp=angel_numbers did not open Angel Numbers after sign selection." },
    { param: "week", sign: "Овен", landing: /Гороскопы|Выберите знак/, pattern: /Неделя|Прогнозы|Удачные дни/, message: "startapp=week did not open weekly forecasts after sign selection." },
  ];

  for (const item of cases) {
    await navigate(client, withStartParam(baseUrl, item.param));
    await installSmokeHelpers(client);
    await waitForPageText(client, item.landing, `startapp=${item.param} landing did not render.`);
    if (item.beforeSign) {
      await click(client, item.beforeSign);
      await waitForPageText(client, /Выберите знак|Овен|Близнецы/, `startapp=${item.param} sign gate did not render.`);
    }
    await click(client, item.sign);
    await waitForPageText(client, item.pattern, item.message);
    report.startParamsChecked.push(item.param);
  }
}

async function runTelegramMockSmoke(client, report) {
  await waitForPageText(client, /Астрологический центр|Выберите, что хотите узнать сегодня/, "Telegram mock Mini App home did not render.");
  const initialCalls = await telegramCalls(client);
  if (initialCalls.ready < 1 || initialCalls.expand < 1) {
    throw new Error(`Telegram mock expected ready/expand calls, got ready=${initialCalls.ready}, expand=${initialCalls.expand}.`);
  }

  const homeBackBeforeCategory = await telegramCalls(client);
  if (homeBackBeforeCategory.backShow > 0 && homeBackBeforeCategory.backHide < 1) {
    throw new Error("Telegram BackButton should be hidden on the main menu.");
  }

  await click(client, "VIP раздел");
  await waitForPageText(client, /VIP раздел|Выберите знак|Овен/, "Telegram mock VIP sign gate did not render.");
  await click(client, "Овен");
  await waitForPageText(client, /VIP открыт бесплатно|Ранний доступ до 17\.09\.2026/, "Telegram mock VIP menu did not render.");
  await click(client, "Месячный прогноз");
  await settle(client);

  const afterDetailCalls = await telegramCalls(client);
  if (afterDetailCalls.backShow < 1 || afterDetailCalls.backOnClick < 1) {
    throw new Error(`Telegram BackButton did not register on a VIP detail screen: show=${afterDetailCalls.backShow}, onClick=${afterDetailCalls.backOnClick}.`);
  }
  if (afterDetailCalls.impact + afterDetailCalls.selection < 1) {
    throw new Error("Telegram haptic mock was not used during interactions.");
  }

  const backTriggered = await evalPage(client, "window.__triggerTelegramBack?.()", []);
  if (!backTriggered) throw new Error("Telegram BackButton mock had no active callback.");
  await waitForPageText(client, /VIP открыт бесплатно|Ранний доступ до 17\.09\.2026/, "Telegram BackButton did not return to VIP menu.");

  const categoryBackTriggered = await evalPage(client, "window.__triggerTelegramBack?.()", []);
  if (!categoryBackTriggered) throw new Error("Telegram BackButton mock had no category callback.");
  await waitForPageText(client, /Астрологический центр|Выберите, что хотите узнать сегодня/, "Telegram BackButton did not return from VIP category to home.");
  report.telegramCategoryBackChecked = true;

  const finalCalls = await telegramCalls(client);
  report.telegramReadyCalled = finalCalls.ready > 0;
  report.telegramExpandCalled = finalCalls.expand > 0;
  report.telegramBackButtonChecked = finalCalls.backShow > 0 && finalCalls.backHide > 0;
  report.telegramHapticsChecked = finalCalls.impact + finalCalls.selection > 0;

  await click(client, "Мистика");
  await waitForPageText(client, /Мистика|Ангельские числа|11:11/, "Telegram mock Mystic tab did not render.");
  await openBirthMatrix(client);
  await assertFeatureScreen(client, "Матрица судьбы", { allowSoon: false, minLength: 260 });
  const matrixBackTriggered = await evalPage(client, "window.__triggerTelegramBack?.()", []);
  if (!matrixBackTriggered) throw new Error("Telegram BackButton mock had no active callback for Birth Matrix.");
  await waitForPageText(client, /Ангельские числа|11:11/, "Telegram BackButton did not return from Birth Matrix to Mystic menu.");

  report.telegramMock = "PASS";
}

async function assertFeatureScreen(client, label, options = {}) {
  const snapshot = await evalPage(client, "window.__zodiacSmoke.snapshot()", []);
  const minLength = options.minLength ?? 320;
  if (snapshot.textLength < minLength) {
    throw new Error(`Feature "${label}" looks empty: text length ${snapshot.textLength}.`);
  }
  const bad = PLACEHOLDER_PATTERNS.find((pattern) => pattern.test(snapshot.text));
  if (bad && !options.allowSoon) {
    throw new Error(`Feature "${label}" contains placeholder text matching ${bad}.`);
  }
}

async function ensureMiniAppServer(rawUrl, timeoutMs, urlProvided) {
  const normalized = new URL(rawUrl);
  const firstProbe = await probeHttpStatus(normalized.href);
  if (firstProbe === 200) {
    return { url: normalized.href, started: false };
  }
  if (urlProvided) {
    throw new Error(`Provided URL is not ready: ${normalized.href} returned ${firstProbe || "no response"}.`);
  }

  const requestedPort = Number(normalized.port || (normalized.protocol === "https:" ? 443 : 80));
  const host = normalized.hostname === "localhost" ? "127.0.0.1" : normalized.hostname;
  const port = await isPortFree(requestedPort) ? requestedPort : await findFreePort(3100);
  const smokeUrl = new URL(normalized.href);
  smokeUrl.hostname = "127.0.0.1";
  smokeUrl.port = String(port);

  const nextCli = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  if (!fs.existsSync(nextCli)) throw new Error(`Next CLI was not found at ${nextCli}. Run npm install before smoke.`);

  const hasProductionBuild = fs.existsSync(path.join(process.cwd(), ".next", "BUILD_ID"));
  const serverMode = hasProductionBuild ? "start" : "dev";
  const serverArgs = hasProductionBuild
    ? [nextCli, "start", "-H", host, "-p", String(port)]
    : [nextCli, "dev", "-H", host, "-p", String(port)];

  const child = spawn(process.execPath, serverArgs, {
    cwd: process.cwd(),
    env: { ...process.env, BROWSER: "none" },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  startedProcesses.push(child);

  let output = "";
  child.stdout?.on("data", (chunk) => {
    output += chunk.toString();
    output = output.slice(-4000);
  });
  child.stderr?.on("data", (chunk) => {
    output += chunk.toString();
    output = output.slice(-4000);
  });

  await waitFor(async () => {
    if (child.exitCode !== null) throw new Error(`Next ${serverMode} server exited early.\n${output}`);
    return (await probeHttpStatus(smokeUrl.href)) === 200;
  }, `Next ${serverMode} server did not become ready at ${smokeUrl.href}.\n${output}`, timeoutMs, 1000);

  return { url: smokeUrl.href, started: true, mode: serverMode };
}

async function launchBrowser(browserPath) {
  const debugPort = await findFreePort(9222);
  tempBrowserProfile = fs.mkdtempSync(path.join(os.tmpdir(), "zodiac-miniapp-smoke-"));
  const child = spawn(browserPath, [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${tempBrowserProfile}`,
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
    "--disable-background-networking",
    "--disable-dev-shm-usage",
    "--disable-extensions",
    "--disable-gpu",
    "--disable-sync",
    "--no-default-browser-check",
    "--no-first-run",
    "--no-sandbox",
    "about:blank",
  ], {
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  startedProcesses.push(child);

  let output = "";
  child.stdout?.on("data", (chunk) => {
    output += chunk.toString();
    output = output.slice(-4000);
  });
  child.stderr?.on("data", (chunk) => {
    output += chunk.toString();
    output = output.slice(-4000);
  });

  await waitFor(async () => {
    if (child.exitCode !== null) throw new Error(output || "browser exited before CDP was ready");
    return Boolean(await fetchJson(`http://127.0.0.1:${debugPort}/json/version`).catch(() => null));
  }, `Chrome/Edge CDP did not start.\n${output}`, 20_000, 300);

  return { child, debugPort };
}

async function createPage(debugPort) {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: "PUT" });
  if (!response.ok) throw new Error(`Could not create browser tab: HTTP ${response.status}.`);
  const page = await response.json();
  if (!page.webSocketDebuggerUrl) throw new Error("Browser tab did not expose a CDP WebSocket URL.");
  return page;
}

async function enablePageDomains(client) {
  await client.call("Page.enable");
  await client.call("Runtime.enable");
  await client.call("Network.enable");
  await client.call("Log.enable");
}

function attachErrorCollectors(client, report) {
  const requestUrls = new Map();
  client.on("Runtime.consoleAPICalled", (event) => {
    if (event.type === "error" || event.type === "assert") {
      report.consoleErrors.push(formatConsoleArgs(event.args));
    }
  });
  client.on("Runtime.exceptionThrown", (event) => {
    report.runtimeErrors.push(event.exceptionDetails?.text || event.exceptionDetails?.exception?.description || "Runtime exception");
  });
  client.on("Log.entryAdded", (event) => {
    if (event.entry?.level === "error") report.consoleErrors.push(event.entry.text || "Log error");
  });
  client.on("Network.requestWillBeSent", (event) => {
    requestUrls.set(event.requestId, event.request?.url);
  });
  client.on("Network.responseReceived", (event) => {
    const status = event.response?.status;
    const url = event.response?.url || requestUrls.get(event.requestId) || "";
    if (status >= 400 && !isIgnorableNetworkUrl(url)) {
      report.networkErrors.push(`${status} ${url}`);
    }
  });
  client.on("Network.loadingFailed", (event) => {
    const url = requestUrls.get(event.requestId) || "";
    if (event.canceled || isIgnorableNetworkUrl(url)) return;
    report.networkErrors.push(`${event.errorText || "network_failed"} ${url}`.trim());
  });
}

async function navigate(client, url) {
  await client.call("Page.navigate", { url });
  await Promise.race([
    onceEvent(client, "Page.loadEventFired"),
    sleep(15_000),
  ]);
  await waitForPageReady(client);
}

async function waitForPageReady(client) {
  await waitFor(async () => {
    const state = await evalPage(client, "document.readyState", []);
    return state === "complete" || state === "interactive";
  }, "Page did not become interactive.", 20_000, 250);
  await settle(client);
}

async function installSmokeHelpers(client) {
  await evalPage(client, `(() => {
    function normalize(value) {
      return String(value || "").replace(/\\s+/g, " ").trim().toLowerCase();
    }
    function isVisible(element) {
      if (!element) return false;
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    }
    function labelOf(element) {
      return [
        element.innerText,
        element.textContent,
        element.getAttribute("aria-label"),
        element.getAttribute("title"),
      ].filter(Boolean).join(" ");
    }
    function buttonLike() {
      return Array.from(document.querySelectorAll("button, a, [role='button']")).filter(isVisible);
    }
    function candidates(needle, options = {}) {
      const normalizedNeedle = normalize(needle);
      return buttonLike()
        .map((element) => ({
          element,
          text: labelOf(element),
          visibleText: element.innerText || element.textContent || element.getAttribute("aria-label") || "",
          aria: element.getAttribute("aria-label") || "",
          disabled: Boolean(element.disabled || element.getAttribute("aria-disabled") === "true"),
        }))
        .filter((item) => {
          const haystack = normalize(options.ariaOnly ? item.aria : item.text);
          return options.exact ? haystack === normalizedNeedle : haystack.includes(normalizedNeedle);
        })
        .sort((a, b) => {
          const aExactAria = normalize(a.aria) === normalizedNeedle ? 0 : 1;
          const bExactAria = normalize(b.aria) === normalizedNeedle ? 0 : 1;
          if (aExactAria !== bExactAria) return aExactAria - bExactAria;
          return a.text.length - b.text.length;
        });
    }
    window.__zodiacSmoke = {
      snapshot() {
        const text = document.body?.innerText || "";
        return {
          title: document.title,
          text,
          textLength: text.trim().length,
          activeText: document.querySelector("[aria-current='page']")?.innerText || "",
          buttons: buttonLike().map((element) => ({
            text: (element.innerText || element.textContent || element.getAttribute("aria-label") || "").replace(/\\s+/g, " ").trim(),
            aria: element.getAttribute("aria-label") || "",
            disabled: Boolean(element.disabled || element.getAttribute("aria-disabled") === "true"),
          })).slice(0, 80),
        };
      },
      hasText(patternSource) {
        return new RegExp(patternSource, "i").test(document.body?.innerText || "");
      },
      click(needle, options = {}) {
        const index = options.index || 0;
        const found = candidates(needle, options);
        const item = found[index];
        if (!item) return { ok: false, error: "not_found", count: found.length };
        if (item.disabled && !options.allowDisabled) return { ok: false, error: "disabled", text: item.visibleText };
        item.element.scrollIntoView({ block: "center", inline: "center" });
        item.element.click();
        return { ok: true, text: item.visibleText, aria: item.aria, disabled: item.disabled, count: found.length };
      },
      clickHub(label) {
        return this.click(label, { exact: true, ariaOnly: true });
      },
      buttonStatus(needle) {
        const found = candidates(needle, {});
        const item = found[0];
        return item ? { exists: true, disabled: item.disabled, text: item.visibleText, count: found.length } : { exists: false, disabled: false, text: "", count: 0 };
      },
      clickBackIcon() {
        const found = buttonLike()
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            const text = normalize(element.innerText || element.textContent || element.getAttribute("aria-label") || "");
            return text.length <= 2 && element.querySelector("svg") && rect.width <= 70 && rect.height <= 70;
          })
          .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left);
        const button = found[0];
        if (!button) return { ok: false, error: "not_found" };
        button.scrollIntoView({ block: "center", inline: "center" });
        button.click();
        return { ok: true };
      },
      fillVisibleInput(value) {
        const inputs = Array.from(document.querySelectorAll("input")).filter(isVisible);
        const input = inputs.find((element) => !element.disabled && !element.readOnly);
        if (!input) return { ok: false, error: "not_found" };
        input.scrollIntoView({ block: "center", inline: "center" });
        input.focus();
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (setter) setter.call(input, value);
        else input.value = value;
        input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        return { ok: true };
      },
    };
    return true;
  })()`, []);
}

async function installTelegramMock(client) {
  await client.call("Page.addScriptToEvaluateOnNewDocument", {
    source: `(() => {
      const calls = {
        ready: 0,
        expand: 0,
        backShow: 0,
        backHide: 0,
        backOnClick: 0,
        backOffClick: 0,
        impact: 0,
        selection: 0,
        callbacks: [],
      };
      window.__telegramMockCalls = calls;
      window.__triggerTelegramBack = () => {
        const callback = calls.callbacks[calls.callbacks.length - 1];
        if (!callback) return false;
        callback();
        return true;
      };
      window.Telegram = {
        WebApp: {
          ready() { calls.ready += 1; },
          expand() { calls.expand += 1; this.isExpanded = true; },
          BackButton: {
            show() { calls.backShow += 1; },
            hide() { calls.backHide += 1; },
            onClick(callback) {
              calls.backOnClick += 1;
              calls.callbacks.push(callback);
            },
            offClick(callback) {
              calls.backOffClick += 1;
              calls.callbacks = calls.callbacks.filter((item) => item !== callback);
            },
          },
          HapticFeedback: {
            impactOccurred(style) {
              calls.impact += 1;
              calls.lastImpact = style;
            },
            selectionChanged() { calls.selection += 1; },
          },
          themeParams: {
            bg_color: "#10121f",
            text_color: "#f8fafc",
            button_color: "#c084fc",
            button_text_color: "#ffffff",
            secondary_bg_color: "#17192a",
          },
          colorScheme: "dark",
          viewportHeight: ${VIEWPORT.height},
          viewportStableHeight: ${VIEWPORT.height},
          isExpanded: false,
          platform: "ios",
          onEvent() {},
          offEvent() {},
        },
      };
    })();`,
  });
}

async function click(client, label, options = {}) {
  const result = await evalPage(client, "window.__zodiacSmoke.click(arguments[0], arguments[1])", [label, options]);
  if (!result.ok) {
    const snapshot = await evalPage(client, "window.__zodiacSmoke.snapshot()", []);
    throw new Error(`Could not click "${label}": ${result.error}. Visible buttons: ${snapshot.buttons.map((item) => item.text || item.aria).filter(Boolean).slice(0, 20).join(" | ")}`);
  }
  await settle(client);
  return result;
}

async function clickAny(client, labels, options = {}) {
  let lastError;
  for (const label of labels) {
    try {
      return await click(client, label, options);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error(`Could not click any of: ${labels.join(", ")}`);
}

async function openBirthMatrix(client) {
  await clickAny(client, BIRTH_MATRIX_LABELS);
  await settle(client);
  await waitForPageText(client, /Матрица|дд\.мм\.гггг|Дата/, "Birth Matrix screen did not render.");
}

async function fillVisibleInput(client, value) {
  const result = await evalPage(client, "window.__zodiacSmoke.fillVisibleInput(arguments[0])", [value]);
  if (!result.ok) throw new Error(`Could not fill visible input: ${result.error}.`);
  await settle(client);
}

async function clickHub(client, label) {
  const result = await evalPage(client, "window.__zodiacSmoke.clickHub(arguments[0])", [label]);
  if (!result.ok) throw new Error(`Could not click hub tab "${label}": ${result.error}.`);
  await settle(client);
  return result;
}

async function clickBackIcon(client) {
  const result = await evalPage(client, "window.__zodiacSmoke.clickBackIcon()", []);
  if (!result.ok) throw new Error(`Could not click icon back button: ${result.error}.`);
  await settle(client);
}

async function hasText(client, pattern) {
  return evalPage(client, "window.__zodiacSmoke.hasText(arguments[0])", [pattern.source]);
}

async function waitForPageText(client, pattern, message) {
  await waitFor(() => hasText(client, pattern), message, 15_000, 250);
}

async function telegramCalls(client) {
  return evalPage(client, "window.__telegramMockCalls", []);
}

async function evalPage(client, expression, args = []) {
  const source = args.length
    ? `(function() { return ${expression}; }).apply(null, ${JSON.stringify(args)})`
    : expression;
  const response = await client.call("Runtime.evaluate", {
    expression: source,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  });
  if (response.exceptionDetails) {
    const details = response.exceptionDetails;
    throw new Error(details.exception?.description || details.text || "Runtime.evaluate failed.");
  }
  return response.result?.value;
}

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.handlers = new Map();
  }

  static async connect(url) {
    const ws = new WebSocket(url);
    const client = new CdpClient(ws);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("CDP WebSocket open timeout.")), 10_000);
      ws.addEventListener("open", () => {
        clearTimeout(timeout);
        resolve();
      }, { once: true });
      ws.addEventListener("error", () => {
        clearTimeout(timeout);
        reject(new Error("CDP WebSocket error."));
      }, { once: true });
    });
    ws.addEventListener("message", (event) => client.handleMessage(event.data));
    return client;
  }

  call(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(payload);
    });
  }

  on(method, handler) {
    const handlers = this.handlers.get(method) ?? [];
    handlers.push(handler);
    this.handlers.set(method, handlers);
  }

  handleMessage(raw) {
    const text = typeof raw === "string" ? raw : Buffer.from(raw).toString("utf8");
    const message = JSON.parse(text);
    if (message.id) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(`${message.error.message}${message.error.data ? `: ${message.error.data}` : ""}`));
      else pending.resolve(message.result ?? {});
      return;
    }
    if (message.method) {
      for (const handler of this.handlers.get(message.method) ?? []) {
        handler(message.params ?? {});
      }
    }
  }

  async close() {
    try {
      this.ws.close();
    } catch {
      // Best effort cleanup.
    }
  }
}

function onceEvent(client, eventName) {
  return new Promise((resolve) => {
    client.on(eventName, resolve);
  });
}

function findBrowserExecutable() {
  const envCandidates = [
    process.env.CHROME_PATH,
    process.env.GOOGLE_CHROME_BIN,
    process.env.CHROMIUM_PATH,
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  ];
  const candidates = [...envCandidates.filter(Boolean)];

  if (process.platform === "win32") {
    const roots = [
      process.env.PROGRAMFILES,
      process.env["PROGRAMFILES(X86)"],
      process.env.LOCALAPPDATA,
    ].filter(Boolean);
    for (const root of roots) {
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
    candidates.push(
      "/usr/bin/google-chrome-stable",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/usr/bin/microsoft-edge",
      "/snap/bin/chromium",
    );
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
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

async function findFreePort(start) {
  for (let port = start; port < start + 200; port += 1) {
    if (await isPortFree(port)) return port;
  }
  throw new Error(`Could not find a free local port starting at ${start}.`);
}

async function waitFor(check, message, timeoutMs, intervalMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
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

async function settle(client) {
  await sleep(350);
  await evalPage(client, "new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))", []);
}

function withSmokeParam(rawUrl, mode) {
  const url = new URL(rawUrl);
  url.searchParams.set("smoke", mode);
  return url.href;
}

function withStartParam(rawUrl, startParam) {
  const url = new URL(rawUrl);
  url.searchParams.set("startapp", startParam);
  url.searchParams.set("smoke", `startapp_${startParam}`);
  return url.href;
}

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--url") parsed.url = args[++index];
    else if (arg.startsWith("--url=")) parsed.url = arg.slice("--url=".length);
    else if (arg === "--timeout") parsed.timeout = args[++index];
    else if (arg.startsWith("--timeout=")) parsed.timeout = arg.slice("--timeout=".length);
  }
  return parsed;
}

function numberOption(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function createReport() {
  return {
    serverUrl: "",
    startedDevServer: false,
    serverMode: "external",
    httpStatus: 0,
    browserMode: "NOT_RUN",
    telegramMock: "NOT_RUN",
    mainMenuChecked: false,
    mainMenuCategoryCount: 0,
    horoscopesChecked: false,
    angelNumbersChecked: false,
    vipChecked: 0,
    giveawaysLocked: false,
    mysticChecked: 0,
    freeAccessVisible: false,
    telegramReadyCalled: false,
    telegramExpandCalled: false,
    telegramBackButtonChecked: false,
    telegramCategoryBackChecked: false,
    telegramHapticsChecked: false,
    birthMatrixChecked: false,
    startParamsChecked: [],
    consoleErrors: [],
    runtimeErrors: [],
    networkErrors: [],
  };
}

function printSkipped(reason, report) {
  console.log("Mini App Smoke: SKIPPED");
  console.log(`Reason: ${reason}`);
  printSummary("SKIPPED", report);
}

function printSummary(status, report) {
  console.log(`Mini App Smoke: ${status}`);
  console.log(`URL: ${report.serverUrl || "n/a"}`);
  console.log(`Server: ${report.startedDevServer ? `started by smoke (${report.serverMode})` : "external/already running"}`);
  console.log(`HTTP status: ${report.httpStatus || "n/a"}`);
  console.log(`Browser mode: ${report.browserMode}`);
  console.log(`Telegram mock: ${report.telegramMock}`);
  console.log(`Main menu checked: ${report.mainMenuChecked ? "YES" : "NO"}`);
  console.log(`Main menu categories checked: ${report.mainMenuCategoryCount}/10`);
  console.log(`Horoscopes checked: ${report.horoscopesChecked ? "YES" : "NO"}`);
  console.log(`Angel Numbers / Ангельские числа checked: ${report.angelNumbersChecked ? "YES" : "NO"}`);
  console.log(`Telegram ready/expand: ${report.telegramReadyCalled && report.telegramExpandCalled ? "YES" : "NO"}`);
  console.log(`Telegram BackButton: ${report.telegramBackButtonChecked ? "YES" : "NO"}`);
  console.log(`Telegram category back: ${report.telegramCategoryBackChecked ? "YES" : "NO"}`);
  console.log(`Telegram haptics: ${report.telegramHapticsChecked ? "YES" : "NO"}`);
  console.log(`VIP cards checked: ${report.vipChecked}/11`);
  console.log(`Free access visible: ${report.freeAccessVisible ? "YES" : "NO"}`);
  console.log(`Giveaways locked: ${report.giveawaysLocked ? "YES" : "NO"}`);
  console.log(`Mystic checked: ${report.mysticChecked >= 3 ? "YES" : "NO"} (${report.mysticChecked}/3)`);
  console.log(`Birth Matrix / Матрица судьбы checked: ${report.birthMatrixChecked ? "YES" : "NO"}`);
  console.log(`Startapp params checked: ${report.startParamsChecked.length ? report.startParamsChecked.join(", ") : "NO"}`);
  console.log(`Console errors: ${report.consoleErrors.length}`);
  console.log(`Runtime errors: ${report.runtimeErrors.length}`);
  console.log(`HTTP/network errors: ${report.networkErrors.length}`);
  if (report.consoleErrors.length) console.log(`Console error sample: ${report.consoleErrors.slice(0, 3).join(" | ")}`);
  if (report.runtimeErrors.length) console.log(`Runtime error sample: ${report.runtimeErrors.slice(0, 3).join(" | ")}`);
  if (report.networkErrors.length) console.log(`Network error sample: ${report.networkErrors.slice(0, 3).join(" | ")}`);
}

function formatConsoleArgs(args = []) {
  return args.map((arg) => arg.value ?? arg.description ?? arg.type ?? "").filter(Boolean).join(" ");
}

function isIgnorableNetworkUrl(url) {
  return !url || url.startsWith("data:") || url.includes("/favicon.ico");
}

async function cleanup() {
  for (const child of startedProcesses.reverse()) {
    if (!child || child.exitCode !== null) continue;
    await killProcessTree(child.pid);
  }
  if (tempBrowserProfile) {
    await fs.promises.rm(tempBrowserProfile, { recursive: true, force: true }).catch(() => {});
  }
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
  } catch {
    // Process already ended.
  }
}
