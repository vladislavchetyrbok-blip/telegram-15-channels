#!/usr/bin/env node

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");

const sharedPath = path.join(projectRoot, "lib", "zodiac-mini-app-analytics-shared.ts");
const storePath = path.join(projectRoot, "lib", "zodiac-mini-app-analytics-store.ts");
const clientPath = path.join(projectRoot, "lib", "zodiac-mini-app-analytics-client.ts");
const routePath = path.join(projectRoot, "app", "api", "zodiac", "analytics", "event", "route.ts");
const dashboardPath = path.join(projectRoot, "app", "dashboard", "networks", "zodiac", "analytics", "page.tsx");
const miniAppPath = path.join(projectRoot, "components", "ZodiacCompatibilityMiniApp.tsx");
const vipSectionsPath = path.join(projectRoot, "components", "ZodiacVipSections.tsx");
const miniAppAnalyticsPath = path.join(projectRoot, "components", "zodiac-mini-app", "analytics.ts");
const featureRoutingPath = path.join(projectRoot, "components", "zodiac-mini-app", "feature-routing.ts");

const expectedRequiredEnv = ["ZODIAC_ANALYTICS_REDIS_URL", "ZODIAC_ANALYTICS_REDIS_TOKEN"];
const supportedStorageModes = ["noop", "redis"];
const forbiddenPayloadFields = new Set([
  "name",
  "firstName",
  "secondName",
  "partnerName",
  "fullName",
  "birthDate",
  "dateOfBirth",
  "birthTime",
  "timeOfBirth",
  "city",
  "cityId",
  "cityQuery",
  "birthCity",
  "birthCityQuery",
  "selectedCityId",
  "message",
  "messageText",
  "dreamText",
  "angelNumberInput",
  "rawInput",
  "input",
  "telegramInitData",
  "initData",
  "phone",
  "username",
]);

const requiredCoverage = {
  vip: [
    "section_open_vip",
    "vip_opened",
    "vip_free_access_viewed",
    "vip_feature_opened",
    "vip_future_subscription_clicked",
    "vip_natal_opened",
    "vip_compatibility_opened",
    "vip_mental_map_opened",
    "vip_calendar_opened",
    "vip_month_forecast_opened",
    "vip_message_helper_opened",
    "vip_name_profile_opened",
    "vip_numerology_opened",
    "vip_angel_numbers_opened",
    "vip_talismans_opened",
    "vip_mystic_day_opened",
    "vip_tool_started",
    "vip_tool_calculated",
    "vip_tool_saved",
    "vip_tool_shared",
    "vip_input_reused",
    "vip_message_copied",
  ],
  mystic: [
    "mystic_category_opened",
    "daily_card_opened",
    "tarot_card_opened",
    "rune_day_opened",
    "intuitive_sign_opened",
    "talismans_opened",
    "aura_color_opened",
    "lunar_ritual_opened",
    "karmic_lessons_opened",
    "birth_matrix_opened",
  ],
  birthMatrix: ["birth_matrix_opened"],
  telegram: ["telegram_webapp_ready", "telegram_back_button_used", "telegram_haptic_used"],
  retention: ["profile_opened", "history_opened", "favorite_saved", "favorite_opened", "share_clicked", "local_data_cleared"],
  compatibility: [
    "compatibility_wizard_started",
    "compatibility_mode_selected",
    "compatibility_birthdate_autosign_used",
    "compatibility_calendar_opened",
    "compatibility_action_opened",
    "compatibility_message_copied",
    "compatibility_pair_saved",
    "compatibility_pair_reopened",
  ],
  interactionHardening: ["dead_cta_resolved", "pair_required_action_clicked", "chart_visual_opened"],
};

const secretEnvNames = [
  ...expectedRequiredEnv,
  "TELEGRAM_BOT_TOKEN",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
];

main().catch((error) => {
  console.error(`Zodiac Analytics Storage Readiness: FAIL`);
  console.error(`Reason: ${redactSecrets(error instanceof Error ? error.message : String(error))}`);
  process.exitCode = 1;
});

async function main() {
  const beforeLedgerStats = await collectLedgerStats();
  const sources = await readSources();
  const allowlistedEvents = extractStringArray(sources.shared, "ZODIAC_ANALYTICS_EVENTS");
  const payloadFields = extractInterfaceFields(sources.shared, "ZodiacAnalyticsPayload");
  const requiredEnv = extractStringArray(sources.shared, "ZODIAC_ANALYTICS_REQUIRED_ENV");
  const storageModes = extractStorageModes(sources.store);
  const currentStorageMode = detectStorageMode(requiredEnv);
  const envStatus = requiredEnv.map((name) => ({ name, configured: Boolean(process.env[name]) }));
  const warnings = [];
  const errors = [];

  if (currentStorageMode === "noop") {
    warnings.push("Storage mode is noop; analytics API is privacy-safe but dashboard metrics will stay empty until Redis env is configured.");
  }

  pushMissing(errors, "missing required env contract", expectedRequiredEnv.filter((name) => !requiredEnv.includes(name)));
  pushMissing(errors, "unsupported storage mode contract", storageModes.filter((mode) => !supportedStorageModes.includes(mode)));
  if (!storageModes.includes(currentStorageMode)) errors.push(`current storage mode "${currentStorageMode}" is not present in AnalyticsStorageMode`);

  const forbiddenPayloadMatches = payloadFields.filter((field) => forbiddenPayloadFields.has(field));
  pushMissing(errors, "sensitive fields in ZodiacAnalyticsPayload", forbiddenPayloadMatches);

  const sensitiveSourceHits = findSensitiveSourceHits({
    shared: sources.shared,
    store: sources.store,
    route: sources.route,
    client: sources.client,
  });
  pushMissing(errors, "sensitive field source references in analytics pipeline", sensitiveSourceHits);

  const missingCoverage = Object.fromEntries(
    Object.entries(requiredCoverage).map(([group, events]) => [group, events.filter((event) => !allowlistedEvents.includes(event))]),
  );
  for (const [group, missing] of Object.entries(missingCoverage)) {
    pushMissing(errors, `missing ${group} allowlist coverage`, missing);
  }

  const usedEvents = extractUsedAnalyticsEvents([
    sources.miniApp,
    sources.miniAppAnalytics,
    sources.featureRouting,
    sources.vipSections,
  ]);
  pushMissing(errors, "tracked events missing from allowlist", usedEvents.filter((event) => !allowlistedEvents.includes(event)));

  const routeChecks = {
    hasPayloadLimit: /content-length[\s\S]*4096/.test(sources.route),
    checksEventAllowlist: sources.route.includes("isAllowedZodiacAnalyticsEvent(eventName)"),
    sanitizesServerSide: sources.route.includes("sanitizeIncomingZodiacAnalyticsEvent(eventName, payload)"),
    recordsSanitizedEventOnly: sources.route.includes("recordZodiacMiniAppAnalyticsEvent(event)") && !sources.route.includes("recordZodiacMiniAppAnalyticsEvent(body"),
  };
  for (const [name, ok] of Object.entries(routeChecks)) {
    if (!ok) errors.push(`API route check failed: ${name}`);
  }

  const clientChecks = {
    clientChecksAllowlist: sources.client.includes("isAllowedZodiacAnalyticsEvent(event)"),
    clientSanitizesBeforeFetch: sources.client.includes("sanitizeZodiacAnalyticsPayload"),
  };
  for (const [name, ok] of Object.entries(clientChecks)) {
    if (!ok) errors.push(`client check failed: ${name}`);
  }

  const storageChecks = {
    redisConfiguredOnlyWithBothEnv: sources.store.includes("ZODIAC_ANALYTICS_REDIS_URL && process.env.ZODIAC_ANALYTICS_REDIS_TOKEN"),
    noopWhenUnconfigured: sources.store.includes('storageMode: configured ? "redis"') && sources.store.includes(': "noop"'),
    usesRedisRestPipeline: sources.store.includes('/pipeline'),
    dashboardExists: await fileExists(dashboardPath),
  };
  for (const [name, ok] of Object.entries(storageChecks)) {
    if (!ok) errors.push(`storage check failed: ${name}`);
  }

  const afterLedgerStats = await collectLedgerStats();
  const ledgerChanged = countLedgerWrites(beforeLedgerStats, afterLedgerStats);
  if (ledgerChanged > 0) errors.push(`ledger changed during analytics storage check: ${ledgerChanged} file(s)`);

  const report = {
    ok: errors.length === 0,
    status: errors.length === 0 ? "PASS" : "FAIL",
    currentStorageMode,
    storageConfigured: currentStorageMode !== "noop",
    supportedStorageModes: storageModes,
    requiredEnv: envStatus,
    allowlistedEventCount: allowlistedEvents.length,
    payloadAllowedFields: payloadFields,
    forbiddenPayloadFieldsPresent: forbiddenPayloadMatches,
    sensitiveSourceHits,
    coverage: Object.fromEntries(
      Object.entries(requiredCoverage).map(([group, events]) => [
        group,
        {
          expected: events.length,
          covered: events.length - missingCoverage[group].length,
          missing: missingCoverage[group],
        },
      ]),
    ),
    usedEventsChecked: usedEvents.length,
    unknownUsedEvents: usedEvents.filter((event) => !allowlistedEvents.includes(event)),
    routeChecks,
    clientChecks,
    storageChecks,
    dashboard: {
      route: "/dashboard/networks/zodiac/analytics",
      exists: await fileExists(dashboardPath),
    },
    warnings,
    errors,
    livePublishCalls: 0,
    ledgerWrites: ledgerChanged,
  };

  const output = [
    `Zodiac Analytics Storage Readiness: ${report.status}`,
    `Current analytics storage mode: ${currentStorageMode}`,
    `Storage noop warning: ${currentStorageMode === "noop" ? "YES" : "NO"}`,
    `Required env configured: ${envStatus.filter((item) => item.configured).length}/${envStatus.length}`,
    `Sensitive payload fields present: ${forbiddenPayloadMatches.length}`,
    `VIP events covered: ${formatCoverage(report.coverage.vip)}`,
    `Mystic events covered: ${formatCoverage(report.coverage.mystic)}`,
    `Birth Matrix events covered: ${formatCoverage(report.coverage.birthMatrix)}`,
    `Telegram events covered: ${formatCoverage(report.coverage.telegram)}`,
    `Retention events covered: ${formatCoverage(report.coverage.retention)}`,
    `Compatibility events covered: ${formatCoverage(report.coverage.compatibility)}`,
    `Interaction hardening events covered: ${formatCoverage(report.coverage.interactionHardening)}`,
    `Tracked events checked: ${usedEvents.length}`,
    `Ledger writes: ${ledgerChanged}`,
    `Live publish calls: 0`,
    JSON.stringify(report, null, 2),
  ].join("\n");

  assertNoSecrets(output);
  console.log(output);

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

async function readSources() {
  const entries = await Promise.all([
    ["shared", sharedPath],
    ["store", storePath],
    ["client", clientPath],
    ["route", routePath],
    ["miniApp", miniAppPath],
    ["vipSections", vipSectionsPath],
    ["miniAppAnalytics", miniAppAnalyticsPath],
    ["featureRouting", featureRoutingPath],
  ].map(async ([key, filePath]) => [key, await readFile(filePath, "utf8")]));
  return Object.fromEntries(entries);
}

function extractStringArray(source, exportName) {
  const match = new RegExp(`export\\s+const\\s+${escapeRegExp(exportName)}\\s*=\\s*\\[([\\s\\S]*?)\\]`).exec(source);
  if (!match) throw new Error(`Could not find ${exportName}`);
  return Array.from(match[1].matchAll(/"([^"]+)"/g), (item) => item[1]);
}

function extractInterfaceFields(source, interfaceName) {
  const match = new RegExp(`export\\s+interface\\s+${escapeRegExp(interfaceName)}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(source);
  if (!match) throw new Error(`Could not find interface ${interfaceName}`);
  return Array.from(match[1].matchAll(/^\s*([A-Za-z][A-Za-z0-9_]*)\??:/gm), (item) => item[1]);
}

function extractStorageModes(source) {
  const match = /type\s+AnalyticsStorageMode\s*=\s*([^;]+);/.exec(source);
  if (!match) throw new Error("Could not find AnalyticsStorageMode");
  return Array.from(match[1].matchAll(/"([^"]+)"/g), (item) => item[1]);
}

function detectStorageMode(requiredEnv) {
  return requiredEnv.every((name) => Boolean(process.env[name])) ? "redis" : "noop";
}

function extractUsedAnalyticsEvents(sources) {
  const text = sources.join("\n");
  const patterns = [
    /trackZodiacMiniAppEvent\(\s*"([^"]+)"/g,
    /onPersonalToolEvent\(\s*"([^"]+)"/g,
    /onEvent\?\.\(\s*"([^"]+)"/g,
  ];
  const events = new Set();
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      if (match[1].includes("_")) events.add(match[1]);
    }
  }

  const miniAppAnalytics = sources[1] ?? "";
  for (const event of extractObjectStringValues(miniAppAnalytics, "vipFeatureAnalyticsEvents")) events.add(event);
  for (const event of extractObjectStringValues(miniAppAnalytics, "modeAnalyticsEvents")) events.add(event);
  for (const match of miniAppAnalytics.matchAll(/event:\s*"([^"]+)"/g)) events.add(match[1]);

  return Array.from(events).sort();
}

function extractObjectStringValues(source, objectName) {
  const match = new RegExp(`export\\s+const\\s+${escapeRegExp(objectName)}[\\s\\S]*?=\\s*\\{([\\s\\S]*?)\\n\\};`).exec(source);
  if (!match) return [];
  return Array.from(match[1].matchAll(/"([^"]+)"/g), (item) => item[1]).filter((value) => value.includes("_"));
}

function findSensitiveSourceHits(sources) {
  const hits = [];
  for (const [name, source] of Object.entries(sources)) {
    for (const field of forbiddenPayloadFields) {
      const pattern = new RegExp(`(?:raw|event|payload|sanitized)\\.${escapeRegExp(field)}\\b`);
      if (pattern.test(source)) hits.push(`${name}.${field}`);
    }
  }
  return hits;
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
      if (entry.name === "runtime") continue;
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

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function formatCoverage(item) {
  return `${item.covered}/${item.expected}${item.missing.length ? ` missing=${item.missing.join(",")}` : ""}`;
}

function pushMissing(errors, label, values) {
  if (values.length > 0) errors.push(`${label}: ${values.join(", ")}`);
}

function assertNoSecrets(output) {
  for (const secret of getKnownSecretValues()) {
    if (output.includes(secret)) throw new Error("readiness output contains a configured secret value");
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
