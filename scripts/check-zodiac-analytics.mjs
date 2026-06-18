import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const secretEnvNames = [
  "ZODIAC_ANALYTICS_REDIS_URL",
  "ZODIAC_ANALYTICS_REDIS_TOKEN",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_ADMIN_CHAT_ID",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
];
const sensitiveValues = ["SHOULD_BE_STRIPPED_NAME", "1990-01-02", "12:34", "SHOULD_BE_STRIPPED_CITY", "SHOULD_BE_STRIPPED_CITY_QUERY", "SHOULD_NOT_STORE_RAW_MESSAGE"];
const sensitiveFields = ["name", "birthDate", "birthTime", "birthCity", "city", "cityId", "cityQuery", "selectedCityId", "message", "messageText"];

let telegramApiCalls = 0;
let livePublishCalls = 0;

main().catch((error) => {
  console.error(`[zodiac-analytics-check] FAILED: ${redactSecrets(error instanceof Error ? error.message : String(error))}`);
  process.exitCode = 1;
});

async function main() {
  const sharedSource = await readFile(path.join(projectRoot, "lib", "zodiac-mini-app-analytics-shared.ts"), "utf8");
  assertSensitiveFieldsNotAllowed(sharedSource);

  const beforeLedgerStats = await collectLedgerStats();
  const port = await getFreePort();
  const server = startNextServer(port);

  try {
    const baseUrl = `http://127.0.0.1:${port}`;
    await waitForRoute(`${baseUrl}/compatibility`, server);

    const compatibilityRoute = await checkRoute(`${baseUrl}/compatibility`);
    const dashboardRoute = await checkRoute(`${baseUrl}/dashboard/networks/zodiac/analytics`);
    const allowedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "relationship_map_category_opened", { category: "communication" });
    const mainMenuEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "main_menu_opened", { section: "main_menu" });
    const mainMenuCategoryEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "main_menu_category_opened", { section: "main_menu", category: "mystic", featureKey: "birthMatrix" });
    const compatibilityCategoryEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "compatibility_category_selected", { section: "compatibility", relationshipMode: "friendship" });
    const horoscopeCategoryEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "horoscope_category_opened", { section: "week", category: "horoscopes", featureKey: "weekForecast" });
    const angelNumbersCategoryEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "angel_numbers_category_opened", { section: "angel_numbers", category: "angel_numbers", featureKey: "angelNumbers" });
    const profilePreviewEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "profile_preview_opened", { section: "profile_preview", category: "saved" });
    const profileOpenedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "profile_opened", { section: "profile", category: "profile" });
    const historyOpenedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "history_opened", { section: "history", category: "profile" });
    const favoriteSavedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "favorite_saved", { section: "favorites", category: "mystic", featureKey: "birthMatrix" });
    const favoriteOpenedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "favorite_opened", { section: "favorites", category: "mystic", featureKey: "birthMatrix" });
    const shareClickedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "share_clicked", { section: "share", category: "angel_numbers", featureKey: "angelNumbers" });
    const localDataClearedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "local_data_cleared", { section: "profile", category: "local_storage" });
    const mentalMapEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "mental_map_viewed");
    const vipFeatureEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "vip_feature_opened", { category: "month_forecast" });
    const chineseHoroscopeEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "chinese_horoscope_result_viewed", { section: "chinese_horoscope", hasBirthDate: true, hasName: false, freeVipActive: true });
    const zodiacStonesEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "zodiac_stones_sign_viewed", { section: "zodiac_stones", hasBirthDate: false, hasName: false, freeVipActive: true });
    const nameProfileEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "name_profile_result_viewed", { section: "name_profile", hasBirthDate: false, hasName: true, freeVipActive: true });
    const numerologyEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "numerology_result_viewed", { section: "numerology", hasBirthDate: true, hasName: true, freeVipActive: true });
    const angelEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "angel_number_viewed", { section: "angel_numbers", featureKey: "angelNumbers", selectedPresetKey: "angel_1111", patternType: "amplified", hasName: true, hasBirthDate: true, freeVipActive: true });
    const lunarEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "lunar_calendar_opened", { section: "lunar_calendar", freeVipActive: true });
    const talismanEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "daily_talisman_opened", { section: "daily_talisman", freeVipActive: true });
    const dreamEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "dream_symbol_viewed", { section: "dream_dictionary", selectedPresetKey: "water", freeVipActive: true });
    const giftEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "gift_by_sign_opened", { section: "gift_by_sign", freeVipActive: true });
    const nameCompatibilityEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "name_compatibility_result_viewed", { section: "name_compatibility", hasName: true, hasSecondName: true, freeVipActive: true });
    const archetypeEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "archetype_result_viewed", { section: "archetype", hasBirthDate: true, hasName: true, freeVipActive: true });
    const hubCategoryEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "hub_category_opened", { section: "hub", category: "forecasts", freeVipActive: true });
    const giveawayLockedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "giveaway_locked_viewed", { section: "giveaways", featureKey: "giveaways_locked", freeVipActive: true });
    const telegramReadyEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "telegram_webapp_ready", { section: "telegram", category: "ios", featureKey: "dark" });
    const telegramBackEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "telegram_back_button_used", { section: "telegram", category: "vip", featureKey: "vipMysticDay" });
    const telegramHapticEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "telegram_haptic_used", { section: "telegram", category: "tab", featureKey: "selection" });
    const compWizardStartedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "compatibility_wizard_started", { section: "compatibility" });
    const compModeSelectedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "compatibility_mode_selected", { section: "compatibility", relationshipMode: "love" });
    const compAutoSignEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "compatibility_birthdate_autosign_used", { section: "compatibility" });
    const compCalendarOpenedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "compatibility_calendar_opened", { section: "compatibility" });
    const compActionOpenedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "compatibility_action_opened", { section: "compatibility" });
    const compMessageCopiedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "compatibility_message_copied", { section: "compatibility" });
    const compPairSavedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "compatibility_pair_saved", { section: "compatibility" });
    const compPairReopenedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "compatibility_pair_reopened", { section: "compatibility" });
    const vipToolStartedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "vip_tool_started", { featureKey: "vipMessageHelper", firstSign: "gemini", secondSign: "leo", relationshipMode: "love", scoreTier: "good", inputMode: "message_goal", goal: "reconciliation", tone: "soft" });
    const vipToolCalculatedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "vip_tool_calculated", { featureKey: "vipNatalChart", sign: "gemini", hasBirthDate: true, hasBirthTime: true, hasBirthCity: true, inputMode: "birth_date" });
    const vipToolSavedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "vip_tool_saved", { featureKey: "vipAngelNumbers", sign: "gemini", inputMode: "angel_time", goal: "clarity" });
    const vipToolSharedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "vip_tool_shared", { featureKey: "vipCoupleCalendar", firstSign: "gemini", secondSign: "leo", relationshipMode: "love", scoreTier: "good", inputMode: "date_range" });
    const vipInputReusedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "vip_input_reused", { featureKey: "vipCompatibility", firstSign: "gemini", secondSign: "leo", relationshipMode: "love", scoreTier: "good", inputMode: "current_pair" });
    const vipMessageCopiedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "vip_message_copied", { featureKey: "vipMessageHelper", firstSign: "gemini", secondSign: "leo", relationshipMode: "love", scoreTier: "good", goal: "reconciliation", tone: "soft" });
    const finalMapOpenedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "final_map_opened", { section: "relationship_map", featureKey: "relationship_result", firstSign: "gemini", secondSign: "leo", relationshipMode: "love", scoreTier: "good", chartType: "couple" });
    const finalMapSavedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "final_map_saved", { section: "vip", featureKey: "vipNatalChart", sign: "gemini", inputMode: "birth_date", chartType: "personal" });
    const finalMapSharedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "final_map_shared", { section: "vip", featureKey: "vipMentalMap", firstSign: "gemini", secondSign: "leo", relationshipMode: "love", scoreTier: "good", chartType: "couple" });
    const featureDepthViewedEvent = await checkAllowedEvent(`${baseUrl}/api/zodiac/analytics/event`, "feature_depth_viewed", { section: "vip", featureKey: "vipMysticDay", sign: "gemini", chartType: "mystic" });
    const disallowedEvent = await checkDisallowedEvent(`${baseUrl}/api/zodiac/analytics/event`);
    const afterLedgerStats = await collectLedgerStats();
    const ledgerWrites = countLedgerWrites(beforeLedgerStats, afterLedgerStats);

    assert(ledgerWrites === 0, `expected 0 ledger writes, got ${ledgerWrites}`);

    const report = {
      ok: true,
      mode: allowedEvent.mode,
      routes: {
        compatibility: compatibilityRoute,
        dashboard: dashboardRoute,
      },
      allowedEvent,
      mainMenuEvent,
      mainMenuCategoryEvent,
      compatibilityCategoryEvent,
      horoscopeCategoryEvent,
      angelNumbersCategoryEvent,
      profilePreviewEvent,
      profileOpenedEvent,
      historyOpenedEvent,
      favoriteSavedEvent,
      favoriteOpenedEvent,
      shareClickedEvent,
      localDataClearedEvent,
      mentalMapEvent,
      vipFeatureEvent,
      chineseHoroscopeEvent,
      zodiacStonesEvent,
      nameProfileEvent,
      numerologyEvent,
      angelEvent,
      lunarEvent,
      talismanEvent,
      dreamEvent,
      giftEvent,
      nameCompatibilityEvent,
      archetypeEvent,
      hubCategoryEvent,
      giveawayLockedEvent,
      telegramReadyEvent,
      telegramBackEvent,
      telegramHapticEvent,
      compWizardStartedEvent,
      compModeSelectedEvent,
      compAutoSignEvent,
      compCalendarOpenedEvent,
      compActionOpenedEvent,
      compMessageCopiedEvent,
      compPairSavedEvent,
      compPairReopenedEvent,
      vipToolStartedEvent,
      vipToolCalculatedEvent,
      vipToolSavedEvent,
      vipToolSharedEvent,
      vipInputReusedEvent,
      vipMessageCopiedEvent,
      finalMapOpenedEvent,
      finalMapSavedEvent,
      finalMapSharedEvent,
      featureDepthViewedEvent,
      disallowedEvent,
      sensitiveFieldsStripped:
        allowedEvent.sensitiveFieldsStripped &&
        mainMenuEvent.sensitiveFieldsStripped &&
        mainMenuCategoryEvent.sensitiveFieldsStripped &&
        compatibilityCategoryEvent.sensitiveFieldsStripped &&
        horoscopeCategoryEvent.sensitiveFieldsStripped &&
        angelNumbersCategoryEvent.sensitiveFieldsStripped &&
        profilePreviewEvent.sensitiveFieldsStripped &&
        profileOpenedEvent.sensitiveFieldsStripped &&
        historyOpenedEvent.sensitiveFieldsStripped &&
        favoriteSavedEvent.sensitiveFieldsStripped &&
        favoriteOpenedEvent.sensitiveFieldsStripped &&
        shareClickedEvent.sensitiveFieldsStripped &&
        localDataClearedEvent.sensitiveFieldsStripped &&
        mentalMapEvent.sensitiveFieldsStripped &&
        vipFeatureEvent.sensitiveFieldsStripped &&
        chineseHoroscopeEvent.sensitiveFieldsStripped &&
        zodiacStonesEvent.sensitiveFieldsStripped &&
        nameProfileEvent.sensitiveFieldsStripped &&
        numerologyEvent.sensitiveFieldsStripped &&
        angelEvent.sensitiveFieldsStripped &&
        lunarEvent.sensitiveFieldsStripped &&
        talismanEvent.sensitiveFieldsStripped &&
        dreamEvent.sensitiveFieldsStripped &&
        giftEvent.sensitiveFieldsStripped &&
        nameCompatibilityEvent.sensitiveFieldsStripped &&
        archetypeEvent.sensitiveFieldsStripped &&
        hubCategoryEvent.sensitiveFieldsStripped &&
        giveawayLockedEvent.sensitiveFieldsStripped &&
        telegramReadyEvent.sensitiveFieldsStripped &&
        telegramBackEvent.sensitiveFieldsStripped &&
        telegramHapticEvent.sensitiveFieldsStripped &&
        compWizardStartedEvent.sensitiveFieldsStripped &&
        compModeSelectedEvent.sensitiveFieldsStripped &&
        compAutoSignEvent.sensitiveFieldsStripped &&
        compCalendarOpenedEvent.sensitiveFieldsStripped &&
        compActionOpenedEvent.sensitiveFieldsStripped &&
        compMessageCopiedEvent.sensitiveFieldsStripped &&
        compPairSavedEvent.sensitiveFieldsStripped &&
        compPairReopenedEvent.sensitiveFieldsStripped &&
        vipToolStartedEvent.sensitiveFieldsStripped &&
        vipToolCalculatedEvent.sensitiveFieldsStripped &&
        vipToolSavedEvent.sensitiveFieldsStripped &&
        vipToolSharedEvent.sensitiveFieldsStripped &&
        vipInputReusedEvent.sensitiveFieldsStripped &&
        vipMessageCopiedEvent.sensitiveFieldsStripped &&
        finalMapOpenedEvent.sensitiveFieldsStripped &&
        finalMapSavedEvent.sensitiveFieldsStripped &&
        finalMapSharedEvent.sensitiveFieldsStripped &&
        featureDepthViewedEvent.sensitiveFieldsStripped,
      noSecretsPrinted: true,
      telegramApiCalls,
      ledgerWrites,
      livePublishCalls,
    };
    const output = JSON.stringify(report, null, 2);
    assertNoSecrets(output);
    console.log(output);
  } finally {
    stopNextServer(server);
  }
}

function startNextServer(port) {
  const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
  const output = { stdout: "", stderr: "" };
  const child = spawn(process.execPath, [nextBin, "start", "-p", String(port), "-H", "127.0.0.1"], {
    cwd: projectRoot,
    env: {
      ...getSpawnSafeEnv(),
      NEXT_TELEMETRY_DISABLED: "1",
      ZODIAC_ANALYTICS_REDIS_URL: "",
      ZODIAC_ANALYTICS_REDIS_TOKEN: "",
      TELEGRAM_BOT_TOKEN: "",
      TELEGRAM_LIVE_PUBLISH: "false",
      ALLOW_REAL_PUBLISH: "false",
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  child.stdout.on("data", (chunk) => {
    output.stdout += chunk.toString();
    output.stdout = output.stdout.slice(-8000);
  });
  child.stderr.on("data", (chunk) => {
    output.stderr += chunk.toString();
    output.stderr = output.stderr.slice(-8000);
  });

  return { child, output };
}

function getSpawnSafeEnv() {
  return Object.fromEntries(
    Object.entries(process.env).filter(([key, value]) => key && !key.includes("=") && typeof value === "string"),
  );
}

async function waitForRoute(url, server, timeoutMs = 60000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    assertServerStillRunning(server);
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) return;
    } catch {
    }
    await delay(500);
  }

  throw new Error(`Next server did not become ready. stdout=${redactSecrets(server.output.stdout)} stderr=${redactSecrets(server.output.stderr)}`);
}

async function checkRoute(url) {
  const response = await trackedFetch(url, { cache: "no-store" });
  await response.arrayBuffer();
  assert(response.status === 200, `${url} expected 200, got ${response.status}`);
  return `${response.status} OK`;
}

async function checkAllowedEvent(url, event = "compatibility_calculated", extraPayload = {}) {
  const response = await trackedFetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      event,
      dateKey: "2026-06-18",
      section: event === "compatibility_calculated" ? "compatibility" : event.startsWith("vip_") ? "vip" : "relationship_map",
      sign: "gemini",
      mode: "fast",
      source: "analytics_smoke",
      startappType: "compat_sign",
      sessionId: "zma-smoke-session",
      firstSign: "gemini",
      secondSign: "leo",
      scoreTier: "good",
      relationshipMode: "love",
      ...extraPayload,
      name: "SHOULD_BE_STRIPPED_NAME",
      birthDate: "1990-01-02",
      birthTime: "12:34",
      birthCity: "SHOULD_BE_STRIPPED_CITY",
      cityQuery: "SHOULD_BE_STRIPPED_CITY_QUERY",
      messageText: "SHOULD_NOT_STORE_RAW_MESSAGE",
      payload: {
        name: "SHOULD_BE_STRIPPED_NAME",
        birthDate: "1990-01-02",
        birthTime: "12:34",
        birthCity: "SHOULD_BE_STRIPPED_CITY",
        cityQuery: "SHOULD_BE_STRIPPED_CITY_QUERY",
        messageText: "SHOULD_NOT_STORE_RAW_MESSAGE",
      },
    }),
  });
  const text = await response.text();
  const payload = parseJson(text, "allowed event response");

  assert(response.status === 200, `allowed event expected 200, got ${response.status}: ${text}`);
  assert(payload.ok === true, "allowed event did not return ok=true");
  assert(payload.mode === "noop", `allowed event expected noop mode, got ${payload.mode}`);
  assert(payload.stored === false, "allowed event should not store in noop mode");

  const sensitiveFieldsStripped = sensitiveValues.every((value) => !text.includes(value));
  assert(sensitiveFieldsStripped, "allowed event response echoed a sensitive value");

  return {
    event,
    status: `${response.status} OK`,
    mode: payload.mode,
    stored: payload.stored,
    sensitiveFieldsStripped,
  };
}

async function checkDisallowedEvent(url) {
  const response = await trackedFetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event: "not_allowed", name: "SHOULD_BE_STRIPPED_NAME" }),
  });
  const text = await response.text();
  const payload = parseJson(text, "disallowed event response");

  assert(response.status === 400, `disallowed event expected 400, got ${response.status}: ${text}`);
  assert(payload.ok === false, "disallowed event did not return ok=false");
  assert(payload.reason === "event_not_allowed", `disallowed event expected event_not_allowed, got ${payload.reason}`);
  assert(!text.includes("SHOULD_BE_STRIPPED_NAME"), "disallowed event response echoed a sensitive value");

  return {
    status: `${response.status} ${payload.reason}`,
    rejected: true,
  };
}

async function trackedFetch(url, init) {
  const target = typeof url === "string" ? url : url.toString();
  if (target.includes("api.telegram.org")) telegramApiCalls += 1;
  if (target.includes("--live") || target.includes("publish:date:live")) livePublishCalls += 1;
  return fetch(url, init);
}

function parseJson(text, label) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label} was not valid JSON: ${text}`);
  }
}

function assertSensitiveFieldsNotAllowed(source) {
  for (const field of sensitiveFields) {
    const fieldPattern = new RegExp(`\\b${field}\\??:`);
    assert(!fieldPattern.test(source), `sensitive field ${field} is present in the analytics payload allowlist`);
  }
}

async function collectLedgerStats() {
  const dataRoot = path.join(projectRoot, "data");
  const files = await listFiles(dataRoot).catch(() => []);
  const ledgerFiles = files.filter((filePath) => /ledger/i.test(path.basename(filePath)));
  const entries = await Promise.all(
    ledgerFiles.map(async (filePath) => {
      const fileStat = await stat(filePath);
      return [path.relative(projectRoot, filePath), `${fileStat.size}:${fileStat.mtimeMs}`];
    }),
  );
  return new Map(entries);
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await listFiles(fullPath)));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }

  return results;
}

function countLedgerWrites(before, after) {
  let writes = 0;
  const keys = new Set([...before.keys(), ...after.keys()]);
  for (const key of keys) {
    if (before.get(key) !== after.get(key)) writes += 1;
  }
  return writes;
}

function assertServerStillRunning(server) {
  const { child, output } = server;
  if (child.exitCode === null && !child.killed) return;
  throw new Error(`Next server exited early with code ${child.exitCode}. stdout=${redactSecrets(output.stdout)} stderr=${redactSecrets(output.stderr)}`);
}

function stopNextServer(server) {
  const { child } = server;
  if (!child.pid || child.exitCode !== null) return;

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
    return;
  }

  child.kill("SIGTERM");
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      server.close(() => (port ? resolve(port) : reject(new Error("Could not allocate a free port"))));
    });
  });
}

function assertNoSecrets(output) {
  for (const secret of getKnownSecretValues()) {
    assert(!output.includes(secret), "check output contains a configured secret value");
  }
}

function redactSecrets(value) {
  return getKnownSecretValues().reduce((text, secret) => text.split(secret).join("[redacted]"), value);
}

function getKnownSecretValues() {
  return secretEnvNames
    .map((name) => process.env[name])
    .filter((value) => typeof value === "string" && value.length >= 8);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
