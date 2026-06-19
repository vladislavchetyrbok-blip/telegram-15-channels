import { createHmac } from "node:crypto";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import vm from "node:vm";

const nodeRequire = createRequire(import.meta.url);
const projectRoot = process.cwd();
const fakeBotToken = "123456:FAKE_TEST_TOKEN_FOR_PROFILE_SYNC_ONLY";
const fixedNow = 1_800_000_000;
const fixedNowIso = "2027-01-15T10:00:00.000Z";
const rawQuestion = "\u0427\u0442\u043e \u043c\u043d\u0435 \u0432\u044b\u0431\u0440\u0430\u0442\u044c?";
const rawIntention = "\u0425\u043e\u0447\u0443 \u0441\u043f\u043e\u043a\u043e\u0439\u0441\u0442\u0432\u0438\u044f";
const rawFeedback = "\u0442\u0435\u0441\u0442\u043e\u0432\u044b\u0439 \u043b\u0438\u0447\u043d\u044b\u0439 \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439";
const rawResultText = "raw generated result";
const rawName = "Test User";
const rawPhone = "+15550123456";
const rawInitData = "RAW_INIT_DATA_SHOULD_NOT_SURVIVE";
const forbiddenValues = [
  "2000-01-01",
  "12:00",
  "Test City",
  rawQuestion,
  rawIntention,
  rawFeedback,
  rawResultText,
  rawName,
  rawPhone,
  rawInitData,
];

const loader = createTsLoader();
const profileSync = loader.load(path.join(projectRoot, "lib", "zodiac-profile-sync.ts"));
const profileSyncConfig = loader.load(path.join(projectRoot, "lib", "zodiac-profile-sync-config.ts"));
const profileSyncTypes = loader.load(path.join(projectRoot, "lib", "zodiac-profile-sync-types.ts"));
const profileSyncMerge = loader.load(path.join(projectRoot, "lib", "zodiac-profile-sync-merge.ts"));
const profileSyncRetentionMap = loader.load(path.join(projectRoot, "lib", "zodiac-profile-sync-retention-map.ts"));
const profileSyncStorage = loader.load(path.join(projectRoot, "lib", "zodiac-profile-sync-storage.ts"));
const profileSyncClient = loader.load(path.join(projectRoot, "components", "zodiac-mini-app", "profile-sync-client.ts"));
const {
  getZodiacProfileSyncConfig,
  resolveZodiacProfileSyncRequest,
  sanitizeZodiacProfileSyncPayload,
} = profileSync;
const { getZodiacProfileSyncEnvPresence } = profileSyncConfig;
const { mergeZodiacProfileSyncPayloads } = profileSyncMerge;
const { retentionItemToSyncedItem, syncedItemToRetentionItem } = profileSyncRetentionMap;
const {
  createZodiacProfileSyncTestMemoryStorage,
  getZodiacProfileSyncStorage,
  isZodiacProfileSyncBackendAvailable,
} = profileSyncStorage;
const {
  deleteRemoteProfileIfEnabled,
  fetchRemoteProfileIfEnabled,
  getProfileSyncClientStatus,
  pushRemoteProfileIfEnabled,
} = profileSyncClient;

const tests = [
  {
    name: "default flags disabled",
    run: () => {
      const config = getZodiacProfileSyncConfig({});
      assert(config.enabled === false, "sync should be disabled by default");
      assert(config.readEnabled === false, "read should be disabled by default");
      assert(config.writeEnabled === false, "write should be disabled by default");
      assert(config.backend === "none", "backend should default to none");
      assert(profileSyncTypes.ZODIAC_PROFILE_SYNC_DEFAULT_CONFIG.backend === "none");
    },
  },
  {
    name: "default storage backend is none",
    run: () => {
      const config = getZodiacProfileSyncConfig({});
      assert(config.backend === "none", "backend should default to none");
      assert(config.status === "disabled", "default storage status should be disabled");
      assert(config.hasRequiredEnv === false, "backend none should not report required env");
    },
  },
  {
    name: "default sync enabled false",
    run: () => {
      assert(getZodiacProfileSyncConfig({}).enabled === false, "sync enabled must default false");
    },
  },
  {
    name: "default read enabled false",
    run: () => {
      assert(getZodiacProfileSyncConfig({}).readEnabled === false, "read must default false");
    },
  },
  {
    name: "default write enabled false",
    run: () => {
      assert(getZodiacProfileSyncConfig({}).writeEnabled === false, "write must default false");
    },
  },
  {
    name: "storage env missing returns fail-closed",
    run: () => {
      const config = getZodiacProfileSyncConfig({
        ZODIAC_PROFILE_SYNC_ENABLED: "true",
        ZODIAC_PROFILE_SYNC_BACKEND: "redis_rest",
        ZODIAC_PROFILE_SYNC_READ_ENABLED: "true",
        ZODIAC_PROFILE_SYNC_WRITE_ENABLED: "true",
      });
      assert(config.backend === "redis_rest", "redis_rest backend should be recognized");
      assert(config.status === "env_missing", "missing Redis env should fail closed");
      assert(config.hasRequiredEnv === false, "missing Redis env should be reported");
      assert(getZodiacProfileSyncStorage(config) === null, "missing env should not create storage");
    },
  },
  {
    name: "production backend without env does not write",
    run: async () => {
      let bodyRead = false;
      const response = await resolveZodiacProfileSyncRequest({
        method: "POST",
        authorizationHeader: `tma ${createSignedInitData({ userId: "1001" })}`,
        botToken: fakeBotToken,
        config: getZodiacProfileSyncConfig({
          ZODIAC_PROFILE_SYNC_ENABLED: "true",
          ZODIAC_PROFILE_SYNC_BACKEND: "redis_rest",
          ZODIAC_PROFILE_SYNC_WRITE_ENABLED: "true",
        }),
        readBody: async () => {
          bodyRead = true;
          return makeUnsafePayload();
        },
      });
      assert(response.httpStatus === 503, "missing env should return backend_unavailable");
      assert(response.body.status === "backend_unavailable", "missing env should fail closed");
      assert(response.body.stored === false, "missing env must not store");
      assert(bodyRead === false, "missing env must not read POST payload");
    },
  },
  {
    name: "test-memory adapter can save sanitized payload",
    run: async () => {
      const storage = createZodiacProfileSyncTestMemoryStorage({ nowIso: fixedNowIso });
      await storage.saveProfile("1001", makeUnsafePayload());
      const saved = await storage.getProfile("1001");
      assert(saved?.history.length === 1, "test-memory should save sanitized history");
      assert(saved?.favorites.length === 1, "test-memory should save sanitized favorites");
      assert(!JSON.stringify(saved).includes("SHOULD_NOT_SURVIVE"), "test-memory should strip unknown fields");
    },
  },
  {
    name: "test-memory adapter strips raw birth date",
    run: async () => assertTestMemoryOutputExcludes("2000-01-01"),
  },
  {
    name: "test-memory adapter strips raw birth time",
    run: async () => assertTestMemoryOutputExcludes("12:00"),
  },
  {
    name: "test-memory adapter strips raw city",
    run: async () => assertTestMemoryOutputExcludes("Test City"),
  },
  {
    name: "test-memory adapter strips raw question",
    run: async () => assertTestMemoryOutputExcludes(rawQuestion),
  },
  {
    name: "test-memory adapter strips raw intention",
    run: async () => assertTestMemoryOutputExcludes(rawIntention),
  },
  {
    name: "test-memory adapter strips raw feedback",
    run: async () => assertTestMemoryOutputExcludes(rawFeedback),
  },
  {
    name: "test-memory adapter strips raw result text",
    run: async () => assertTestMemoryOutputExcludes(rawResultText),
  },
  {
    name: "test-memory adapter strips raw name",
    run: async () => assertTestMemoryOutputExcludes(rawName),
  },
  {
    name: "test-memory adapter strips raw phone",
    run: async () => assertTestMemoryOutputExcludes(rawPhone),
  },
  {
    name: "test-memory adapter strips raw initData",
    run: async () => assertTestMemoryOutputExcludes(rawInitData),
  },
  {
    name: "test-memory delete works in test only",
    run: async () => {
      const storage = createZodiacProfileSyncTestMemoryStorage({ nowIso: fixedNowIso });
      await storage.saveProfile("1001", makeUnsafePayload());
      assert(await storage.getProfile("1001"), "test-memory should have saved profile before delete");
      await storage.deleteProfile("1001");
      assert((await storage.getProfile("1001")) === null, "test-memory delete should remove profile");
      const config = getZodiacProfileSyncConfig({
        ZODIAC_PROFILE_SYNC_ENABLED: "true",
        ZODIAC_PROFILE_SYNC_BACKEND: "test_memory",
        ZODIAC_PROFILE_SYNC_READ_ENABLED: "true",
        ZODIAC_PROFILE_SYNC_WRITE_ENABLED: "true",
        ZODIAC_PROFILE_SYNC_TEST_MEMORY_ENABLED: "true",
      });
      assert(getZodiacProfileSyncStorage(config) === null, "runtime storage getter should not expose test-memory by default");
      assert(getZodiacProfileSyncStorage(config, { allowTestMemory: true }), "test-memory requires explicit allowTestMemory");
    },
  },
  {
    name: "storage config does not print secrets",
    run: () => {
      const env = {
        ZODIAC_PROFILE_SYNC_ENABLED: "true",
        ZODIAC_PROFILE_SYNC_BACKEND: "redis_rest",
        ZODIAC_PROFILE_SYNC_READ_ENABLED: "true",
        ZODIAC_PROFILE_SYNC_WRITE_ENABLED: "true",
        ZODIAC_PROFILE_SYNC_REDIS_URL: "https://SECRET-REDIS.example",
        ZODIAC_PROFILE_SYNC_REDIS_TOKEN: "SECRET_TOKEN_SHOULD_NOT_PRINT",
      };
      const config = getZodiacProfileSyncConfig(env);
      const presence = getZodiacProfileSyncEnvPresence("redis_rest", env);
      const serialized = `${JSON.stringify(config)} ${JSON.stringify(presence)}`;
      assert(!serialized.includes("SECRET"), "config/presence output must not include secret values");
      assert(presence.every((item) => typeof item.name === "string" && typeof item.configured === "boolean"), "presence should expose names and booleans only");
    },
  },
  {
    name: "no production network calls during storage check",
    run: () => {
      const config = getZodiacProfileSyncConfig({
        ZODIAC_PROFILE_SYNC_ENABLED: "true",
        ZODIAC_PROFILE_SYNC_BACKEND: "redis_rest",
        ZODIAC_PROFILE_SYNC_READ_ENABLED: "true",
        ZODIAC_PROFILE_SYNC_WRITE_ENABLED: "true",
        ZODIAC_PROFILE_SYNC_REDIS_URL: "https://redis.example",
        ZODIAC_PROFILE_SYNC_REDIS_TOKEN: "configured-token",
      });
      assert(config.status === "ready", "production config can validate env presence");
      assert(getZodiacProfileSyncStorage(config) === null, "production storage adapter should remain unwired in Package 41");
      assert(isZodiacProfileSyncBackendAvailable(config) === false, "production backend should not be available yet");
    },
  },
  {
    name: "sanitizer strips unknown fields",
    run: () => {
      const result = sanitizeZodiacProfileSyncPayload(makeUnsafePayload(), { nowIso: fixedNowIso });
      assert(result.ok, "payload should sanitize");
      const item = result.payload.history[0];
      assert(item.unexpectedField === undefined, "unknown field should not survive");
      assert(result.strippedFields.includes("history.0.unexpectedField"), "unknown field should be reported");
    },
  },
  {
    name: "merge local only returns valid payload",
    run: () => {
      const result = mergeZodiacProfileSyncPayloads({
        local: makeSyncPayload({ history: [makeSyncedItem("local-history", "birthMatrix", "2027-01-15T09:00:00.000Z")], favorites: [makeSyncedItem("local-favorite", "vipNatalChart", "2027-01-15T09:10:00.000Z")] }),
        remote: null,
        nowIso: fixedNowIso,
      });
      assert(result.payload.syncVersion === 1, "merge should produce syncVersion 1");
      assert(result.localCount.history === 1 && result.remoteCount.history === 0, "local-only counts should be correct");
      assert(result.mergedCount.history === 1 && result.mergedCount.favorites === 1, "local-only items should survive");
    },
  },
  {
    name: "merge remote only returns valid payload",
    run: () => {
      const result = mergeZodiacProfileSyncPayloads({
        local: null,
        remote: makeSyncPayload({ history: [makeSyncedItem("remote-history", "angelNumbers", "2027-01-15T09:00:00.000Z")] }),
        nowIso: fixedNowIso,
      });
      assert(result.payload.syncVersion === 1, "remote-only merge should produce syncVersion 1");
      assert(result.localCount.history === 0 && result.remoteCount.history === 1, "remote-only counts should be correct");
      assert(result.payload.history[0].id === "remote-history", "remote-only item should survive");
    },
  },
  {
    name: "merge local and remote combines safe items",
    run: () => {
      const result = mergeZodiacProfileSyncPayloads({
        local: makeSyncPayload({ history: [makeSyncedItem("local-history", "birthMatrix", "2027-01-15T09:00:00.000Z")] }),
        remote: makeSyncPayload({ history: [makeSyncedItem("remote-history", "vipNatalChart", "2027-01-15T09:05:00.000Z")] }),
        nowIso: fixedNowIso,
      });
      assert(result.mergedCount.history === 2, "local and remote history should be merged");
      assert(result.changed === true, "remote item should make merged payload changed from local");
    },
  },
  {
    name: "merge duplicate id keeps newer timestamp",
    run: () => {
      const result = mergeZodiacProfileSyncPayloads({
        local: makeSyncPayload({ history: [makeSyncedItem("same-id", "birthMatrix", "2027-01-15T09:00:00.000Z", { label: "Old matrix" })] }),
        remote: makeSyncPayload({ history: [makeSyncedItem("same-id", "birthMatrix", "2027-01-15T09:30:00.000Z", { label: "New matrix" })] }),
        nowIso: fixedNowIso,
      });
      assert(result.mergedCount.history === 1, "duplicate id should collapse to one item");
      assert(result.payload.history[0].label === "New matrix", "newer duplicate id should win");
      assert(result.dropped.some((item) => item.reason === "history_duplicate_newer_item_kept"), "duplicate drop should be reported");
    },
  },
  {
    name: "merge duplicate safe key without id keeps newer timestamp",
    run: () => {
      const local = makeSyncedItem(undefined, "angelNumbers", "2027-01-15T09:00:00.000Z", { label: "Angel 1111", section: "forecasts", sign: "gemini" });
      const remote = makeSyncedItem(undefined, "angelNumbers", "2027-01-15T09:45:00.000Z", { label: "Angel 1111", section: "forecasts", sign: "gemini" });
      const result = mergeZodiacProfileSyncPayloads({
        local: makeSyncPayload({ history: [local] }),
        remote: makeSyncPayload({ history: [remote] }),
        nowIso: fixedNowIso,
      });
      assert(result.mergedCount.history === 1, "duplicate safe key should collapse to one item");
      assert(result.payload.history[0].timestamp === "2027-01-15T09:45:00.000Z", "newer safe-key duplicate should win");
      assert(Boolean(result.payload.history[0].id), "safe-key item should receive a safe generated id");
    },
  },
  {
    name: "merge strips unknown fields",
    run: () => {
      const result = mergeZodiacProfileSyncPayloads({
        local: makeUnsafePayload(),
        remote: null,
        nowIso: fixedNowIso,
      });
      assert(!JSON.stringify(result.payload).includes("SHOULD_NOT_SURVIVE"), "unknown fields should not survive merge");
    },
  },
  {
    name: "merge strips raw birth date",
    run: () => assertMergedOutputExcludes("2000-01-01"),
  },
  {
    name: "merge strips raw birth time",
    run: () => assertMergedOutputExcludes("12:00"),
  },
  {
    name: "merge strips raw city",
    run: () => assertMergedOutputExcludes("Test City"),
  },
  {
    name: "merge strips raw question",
    run: () => assertMergedOutputExcludes(rawQuestion),
  },
  {
    name: "merge strips raw intention",
    run: () => assertMergedOutputExcludes(rawIntention),
  },
  {
    name: "merge strips raw feedback text",
    run: () => assertMergedOutputExcludes(rawFeedback),
  },
  {
    name: "merge strips raw result text",
    run: () => assertMergedOutputExcludes(rawResultText),
  },
  {
    name: "merge strips raw name",
    run: () => assertMergedOutputExcludes(rawName),
  },
  {
    name: "merge strips raw phone",
    run: () => assertMergedOutputExcludes(rawPhone),
  },
  {
    name: "merge strips raw initData",
    run: () => assertMergedOutputExcludes(rawInitData),
  },
  {
    name: "merge malformed payload does not throw",
    run: () => {
      const result = mergeZodiacProfileSyncPayloads({
        local: "not-an-object",
        remote: { history: "also-bad" },
        nowIso: fixedNowIso,
      });
      assert(result.payload.syncVersion === 1, "malformed merge should still produce payload");
      assert(result.mergedCount.history === 0, "malformed history should be empty");
    },
  },
  {
    name: "merge max history clamp works",
    run: () => {
      const result = mergeZodiacProfileSyncPayloads({
        local: makeSyncPayload({ history: makeManySyncedItems("history", 5) }),
        remote: null,
        nowIso: fixedNowIso,
        maxHistory: 3,
      });
      assert(result.payload.history.length === 3, "history should be clamped to maxHistory");
      assert(result.dropped.some((item) => item.reason === "history_max_clamp"), "history clamp should be reported");
    },
  },
  {
    name: "merge max favorites clamp works",
    run: () => {
      const result = mergeZodiacProfileSyncPayloads({
        local: makeSyncPayload({ favorites: makeManySyncedItems("favorite", 5) }),
        remote: null,
        nowIso: fixedNowIso,
        maxFavorites: 2,
      });
      assert(result.payload.favorites.length === 2, "favorites should be clamped to maxFavorites");
      assert(result.dropped.some((item) => item.reason === "favorites_max_clamp"), "favorites clamp should be reported");
    },
  },
  {
    name: "merge deterministic sorting newest first",
    run: () => {
      const result = mergeZodiacProfileSyncPayloads({
        local: makeSyncPayload({
          history: [
            makeSyncedItem("old", "birthMatrix", "2027-01-15T09:00:00.000Z"),
            makeSyncedItem("new", "vipNatalChart", "2027-01-15T11:00:00.000Z"),
            makeSyncedItem("middle", "angelNumbers", "2027-01-15T10:00:00.000Z"),
          ],
        }),
        remote: null,
        nowIso: fixedNowIso,
      });
      assert(result.payload.history.map((item) => item.id).join(",") === "new,middle,old", "history should sort newest first");
    },
  },
  {
    name: "retention mapper keeps only safe summary fields",
    run: () => {
      const synced = retentionItemToSyncedItem({
        id: "retention:birthMatrix",
        featureKey: "birthMatrix",
        section: "mystic",
        label: "Birth Matrix safe label",
        createdAt: "2027-01-15T09:00:00.000Z",
        birthDate: "2000-01-01",
        resultText: rawResultText,
      }, { nowIso: fixedNowIso });
      assert(synced?.timestamp === "2027-01-15T09:00:00.000Z", "retention createdAt should map to sync timestamp");
      assert(!JSON.stringify(synced).includes("2000-01-01"), "retention mapper should strip raw birth date");
      const retained = syncedItemToRetentionItem(synced, { nowIso: fixedNowIso });
      assert(retained?.createdAt === "2027-01-15T09:00:00.000Z", "synced timestamp should map to retention createdAt");
    },
  },
  {
    name: "frontend client default status disabled",
    run: async () => {
      const status = await getProfileSyncClientStatus({
        config: { enabled: false, readEnabled: false, writeEnabled: false },
      });
      assert(status.status === "disabled", "frontend client should default to disabled");
      assert(status.enabled === false, "frontend sync should not be enabled");
    },
  },
  {
    name: "fetchRemoteProfileIfEnabled does not call network when disabled",
    run: async () => {
      let calls = 0;
      const result = await fetchRemoteProfileIfEnabled({
        config: { enabled: false, readEnabled: false, writeEnabled: false },
        fetcher: async () => {
          calls += 1;
          return fakeFetchResponse({ ok: true });
        },
      });
      assert(result.ok === false && result.status === "disabled", "disabled fetch should return disabled");
      assert(result.networkCalled === false, "disabled fetch should report no network");
      assert(calls === 0, "disabled fetch must not call network");
    },
  },
  {
    name: "pushRemoteProfileIfEnabled does not call network when disabled",
    run: async () => {
      let calls = 0;
      const result = await pushRemoteProfileIfEnabled(makeUnsafePayload(), {
        config: { enabled: false, readEnabled: false, writeEnabled: false },
        fetcher: async () => {
          calls += 1;
          return fakeFetchResponse({ ok: true });
        },
      });
      assert(result.ok === false && result.status === "disabled", "disabled push should return disabled");
      assert(result.networkCalled === false, "disabled push should report no network");
      assert(calls === 0, "disabled push must not call network");
    },
  },
  {
    name: "deleteRemoteProfileIfEnabled does not call network when disabled",
    run: async () => {
      let calls = 0;
      const result = await deleteRemoteProfileIfEnabled({
        config: { enabled: false, readEnabled: false, writeEnabled: false },
        fetcher: async () => {
          calls += 1;
          return fakeFetchResponse({ ok: true });
        },
      });
      assert(result.ok === false && result.status === "disabled", "disabled delete should return disabled");
      assert(result.networkCalled === false, "disabled delete should report no network");
      assert(calls === 0, "disabled delete must not call network");
    },
  },
  {
    name: "frontend client enabled outside Telegram does not call network",
    run: async () => {
      let calls = 0;
      const result = await fetchRemoteProfileIfEnabled({
        config: { enabled: true, readEnabled: true, writeEnabled: false },
        windowRef: {},
        fetcher: async () => {
          calls += 1;
          return fakeFetchResponse({ ok: true });
        },
      });
      assert(result.ok === false && result.status === "outside_telegram", "outside Telegram should be detected");
      assert(result.networkCalled === false, "outside Telegram should not call network");
      assert(calls === 0, "outside Telegram fetch must not call network");
    },
  },
  {
    name: "frontend client missing initData does not call network",
    run: async () => {
      let calls = 0;
      const result = await fetchRemoteProfileIfEnabled({
        config: { enabled: true, readEnabled: true, writeEnabled: false },
        windowRef: { Telegram: { WebApp: {} } },
        fetcher: async () => {
          calls += 1;
          return fakeFetchResponse({ ok: true });
        },
      });
      assert(result.ok === false && result.status === "auth_missing", "missing initData should be detected");
      assert(result.networkCalled === false, "missing initData should not call network");
      assert(calls === 0, "missing initData fetch must not call network");
    },
  },
  {
    name: "sanitizer strips raw birth date",
    run: () => assertSanitizedOutputExcludes("2000-01-01"),
  },
  {
    name: "sanitizer strips raw birth time",
    run: () => assertSanitizedOutputExcludes("12:00"),
  },
  {
    name: "sanitizer strips raw city",
    run: () => assertSanitizedOutputExcludes("Test City"),
  },
  {
    name: "sanitizer strips raw question",
    run: () => assertSanitizedOutputExcludes(rawQuestion),
  },
  {
    name: "sanitizer strips raw intention",
    run: () => assertSanitizedOutputExcludes(rawIntention),
  },
  {
    name: "sanitizer strips raw feedback text",
    run: () => assertSanitizedOutputExcludes(rawFeedback),
  },
  {
    name: "sanitizer strips raw result text",
    run: () => assertSanitizedOutputExcludes(rawResultText),
  },
  {
    name: "sanitizer strips raw name",
    run: () => assertSanitizedOutputExcludes(rawName),
  },
  {
    name: "sanitizer strips raw phone",
    run: () => assertSanitizedOutputExcludes(rawPhone),
  },
  {
    name: "sanitizer strips raw initData",
    run: () => assertSanitizedOutputExcludes(rawInitData),
  },
  {
    name: "sanitizer strips all known malicious values",
    run: () => {
      const result = sanitizeZodiacProfileSyncPayload(makeUnsafePayload(), { nowIso: fixedNowIso });
      assert(result.ok, "payload should sanitize");
      const serialized = JSON.stringify(result.payload);
      for (const value of forbiddenValues) {
        assert(!serialized.includes(value), `sanitized payload must not contain ${value}`);
      }
    },
  },
  {
    name: "disabled route does not read or store POST data",
    run: async () => {
      let bodyRead = false;
      const response = await resolveZodiacProfileSyncRequest({
        method: "POST",
        authorizationHeader: `tma ${createSignedInitData({ userId: "1001" })}`,
        botToken: fakeBotToken,
        config: getZodiacProfileSyncConfig({}),
        readBody: async () => {
          bodyRead = true;
          return makeUnsafePayload();
        },
      });
      assert(response.httpStatus === 200, "disabled route should be a safe 200");
      assert(response.body.status === "disabled", "disabled route should return disabled");
      assert(response.body.stored === false, "disabled POST must report stored=false");
      assert(bodyRead === false, "disabled route must not read POST payload");
      assertResponseExcludesForbiddenValues(response);
    },
  },
  {
    name: "invalid Telegram auth rejects before payload processing",
    run: async () => {
      let bodyRead = false;
      const response = await resolveZodiacProfileSyncRequest({
        method: "POST",
        authorizationHeader: "tma invalid_auth_payload",
        botToken: fakeBotToken,
        readBody: async () => {
          bodyRead = true;
          return makeUnsafePayload();
        },
      });
      assert(response.httpStatus === 401, "invalid auth should return 401");
      assert(response.body.status === "invalid_auth", "invalid auth should be rejected");
      assert(bodyRead === false, "invalid auth must not read POST payload");
      assertResponseExcludesForbiddenValues(response);
    },
  },
  {
    name: "production route cannot use test-memory storage",
    run: async () => {
      let bodyRead = false;
      const response = await resolveZodiacProfileSyncRequest({
        method: "POST",
        authorizationHeader: `tma ${createSignedInitData({ userId: "1001" })}`,
        botToken: fakeBotToken,
        config: getZodiacProfileSyncConfig({
          ZODIAC_PROFILE_SYNC_ENABLED: "true",
          ZODIAC_PROFILE_SYNC_BACKEND: "test_memory",
          ZODIAC_PROFILE_SYNC_WRITE_ENABLED: "true",
          ZODIAC_PROFILE_SYNC_TEST_MEMORY_ENABLED: "true",
        }),
        readBody: async () => {
          bodyRead = true;
          return makeUnsafePayload();
        },
      });
      assert(response.httpStatus === 503, "runtime route should not expose test-memory storage");
      assert(response.body.status === "backend_unavailable", "runtime route should fail closed");
      assert(response.body.stored === false, "runtime route must not store to test-memory");
      assert(bodyRead === false, "unavailable backend must not read POST payload");
      assertResponseExcludesForbiddenValues(response);
    },
  },
  {
    name: "invalid Telegram auth rejected",
    run: async () => {
      const initData = createSignedInitData({ userId: "1001" });
      const params = new URLSearchParams(initData);
      params.set("user", JSON.stringify({ id: "1002" }));
      const response = await resolveZodiacProfileSyncRequest({
        method: "GET",
        authorizationHeader: `tma ${params.toString()}`,
        botToken: fakeBotToken,
        config: getZodiacProfileSyncConfig({}),
      });
      assert(response.httpStatus === 401, "invalid auth should return 401");
      assert(response.body.status === "invalid_auth", "invalid auth should be rejected before disabled response");
      assertResponseExcludesForbiddenValues(response);
    },
  },
  {
    name: "valid fake Telegram auth with disabled flags returns disabled/no-write",
    run: async () => {
      const getResponse = await resolveZodiacProfileSyncRequest({
        method: "GET",
        authorizationHeader: `tma ${createSignedInitData({ userId: "1001" })}`,
        botToken: fakeBotToken,
        config: getZodiacProfileSyncConfig({}),
      });
      const deleteResponse = await resolveZodiacProfileSyncRequest({
        method: "DELETE",
        authorizationHeader: `tma ${createSignedInitData({ userId: "1001" })}`,
        botToken: fakeBotToken,
        config: getZodiacProfileSyncConfig({}),
      });

      assert(getResponse.body.status === "disabled", "GET should be disabled");
      assert(deleteResponse.body.status === "disabled", "DELETE should be disabled");
      assert(deleteResponse.body.deleted === false, "DELETE should not delete");
      assertResponseExcludesForbiddenValues(getResponse);
      assertResponseExcludesForbiddenValues(deleteResponse);
    },
  },
];

const failures = [];
for (const test of tests) {
  try {
    await test.run();
    console.log(`PASS ${test.name}`);
  } catch (error) {
    failures.push({ name: test.name, error });
    console.error(`FAIL ${test.name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length > 0) {
  console.error(`Zodiac Profile Sync Check: FAIL (${failures.length}/${tests.length})`);
  process.exit(1);
}

console.log(`Zodiac Profile Sync Check: PASS (${tests.length}/${tests.length})`);

function makeUnsafePayload() {
  return {
    syncVersion: 1,
    unknownRoot: "SHOULD_NOT_SURVIVE",
    history: [
      {
        id: "history:birthMatrix:2000-01-01",
        featureKey: "birthMatrix",
        section: "mystic",
        label: `Birth Matrix 2000-01-01 12:00 Test City ${rawQuestion} ${rawName} ${rawPhone} ${rawResultText}`,
        timestamp: fixedNowIso,
        sign: "gemini",
        mode: "symbolic",
        tier: "deep",
        scoreTier: "good",
        unexpectedField: "SHOULD_NOT_SURVIVE",
        birthDate: "2000-01-01",
        birthTime: "12:00",
        city: "Test City",
        question: rawQuestion,
        intention: rawIntention,
        rawFeedback,
        rawResult: rawResultText,
        resultText: rawResultText,
        rawResultText,
        name: rawName,
        phone: rawPhone,
        initData: rawInitData,
        initDataUnsafe: rawInitData,
      },
    ],
    favorites: [
      {
        id: "favorite:vipNatalChart",
        featureKey: "vipNatalChart",
        section: "vip",
        label: `Premium Natal ${rawIntention} ${rawFeedback} ${rawInitData}`,
        timestamp: fixedNowIso,
        resultText: rawResultText,
        feedbackText: rawFeedback,
        name: rawName,
        phoneNumber: rawPhone,
        initData: rawInitData,
      },
    ],
    updatedAt: fixedNowIso,
    name: rawName,
    phone: rawPhone,
    initData: rawInitData,
  };
}

function makeSyncPayload({ history = [], favorites = [], updatedAt = fixedNowIso } = {}) {
  return {
    syncVersion: 1,
    history,
    favorites,
    updatedAt,
  };
}

function makeSyncedItem(id, featureKey, timestamp, overrides = {}) {
  return {
    id,
    featureKey,
    section: overrides.section ?? "mystic",
    sign: overrides.sign,
    firstSign: overrides.firstSign,
    secondSign: overrides.secondSign,
    mode: overrides.mode ?? "symbolic",
    tier: overrides.tier,
    scoreTier: overrides.scoreTier,
    label: overrides.label ?? `${featureKey} safe summary`,
    timestamp,
  };
}

function makeManySyncedItems(prefix, count) {
  return Array.from({ length: count }, (_, index) => makeSyncedItem(
    `${prefix}-${index}`,
    index % 2 === 0 ? "birthMatrix" : "vipNatalChart",
    new Date(Date.parse("2027-01-15T09:00:00.000Z") + index * 60_000).toISOString(),
    { label: `${prefix} ${index}` },
  ));
}

function assertSanitizedOutputExcludes(forbiddenValue) {
  const result = sanitizeZodiacProfileSyncPayload(makeUnsafePayload(), { nowIso: fixedNowIso });
  assert(result.ok, "payload should sanitize");
  const serialized = JSON.stringify(result.payload);
  assert(!serialized.includes(forbiddenValue), `sanitized payload must not contain ${forbiddenValue}`);
}

function assertMergedOutputExcludes(forbiddenValue) {
  const result = mergeZodiacProfileSyncPayloads({
    local: makeUnsafePayload(),
    remote: null,
    nowIso: fixedNowIso,
  });
  const serialized = JSON.stringify(result.payload);
  assert(!serialized.includes(forbiddenValue), `merged payload must not contain ${forbiddenValue}`);
}

async function assertTestMemoryOutputExcludes(forbiddenValue) {
  const storage = createZodiacProfileSyncTestMemoryStorage({ nowIso: fixedNowIso });
  await storage.saveProfile("1001", makeUnsafePayload());
  const saved = await storage.getProfile("1001");
  const serialized = JSON.stringify(saved);
  assert(!serialized.includes(forbiddenValue), `test-memory payload must not contain ${forbiddenValue}`);
}

function assertResponseExcludesForbiddenValues(response) {
  const serialized = JSON.stringify(response);
  for (const value of forbiddenValues) {
    assert(!serialized.includes(value), `route response must not contain ${value}`);
  }
}

function createSignedInitData({ userId }) {
  const fields = {
    auth_date: String(fixedNow - 60),
    query_id: "AAFakeProfileSyncQuery",
    user: JSON.stringify({ id: userId, language_code: "ru" }),
  };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    params.set(key, value);
  }
  params.set("hash", signInitData(fields));
  return params.toString();
}

function signInitData(fields) {
  const dataCheckString = Object.entries(fields)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secret = createHmac("sha256", "WebAppData")
    .update(fakeBotToken)
    .digest();
  return createHmac("sha256", secret).update(dataCheckString).digest("hex");
}

function fakeFetchResponse(body) {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  };
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
    const source = nodeRequire("node:fs").readFileSync(resolved, "utf8");
    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
      fileName: resolved,
    }).outputText;

    const context = {
      Buffer,
      URLSearchParams,
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
      if (nodeRequire("node:fs").existsSync(candidate)) {
        return path.resolve(candidate);
      }
    }

    throw new Error(`Unable to resolve TS module: ${value}`);
  }

  return { load };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}
