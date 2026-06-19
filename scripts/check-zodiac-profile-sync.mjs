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
const rawFeedback = "\u041a\u043d\u043e\u043f\u043a\u0430 \u043d\u0435 \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442";
const rawResultText = "\u042d\u0442\u043e \u043f\u043e\u043b\u043d\u044b\u0439 raw \u0442\u0435\u043a\u0441\u0442 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u0430";
const forbiddenValues = [
  "1998-06-15",
  "23:55",
  "Dnipro",
  rawQuestion,
  rawIntention,
  rawFeedback,
  rawResultText,
  "RAW_INIT_DATA_SHOULD_NOT_SURVIVE",
];

const loader = createTsLoader();
const profileSync = loader.load(path.join(projectRoot, "lib", "zodiac-profile-sync.ts"));
const profileSyncTypes = loader.load(path.join(projectRoot, "lib", "zodiac-profile-sync-types.ts"));
const profileSyncClient = loader.load(path.join(projectRoot, "components", "zodiac-mini-app", "profile-sync-client.ts"));
const {
  getZodiacProfileSyncConfig,
  resolveZodiacProfileSyncRequest,
  sanitizeZodiacProfileSyncPayload,
} = profileSync;
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
    run: () => assertSanitizedOutputExcludes("1998-06-15"),
  },
  {
    name: "sanitizer strips raw birth time",
    run: () => assertSanitizedOutputExcludes("23:55"),
  },
  {
    name: "sanitizer strips raw city",
    run: () => assertSanitizedOutputExcludes("Dnipro"),
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
        id: "history:birthMatrix:1998-06-15",
        featureKey: "birthMatrix",
        section: "mystic",
        label: `Birth Matrix 1998-06-15 23:55 Dnipro ${rawQuestion}`,
        timestamp: fixedNowIso,
        sign: "gemini",
        mode: "symbolic",
        tier: "deep",
        scoreTier: "good",
        unexpectedField: "SHOULD_NOT_SURVIVE",
        birthDate: "1998-06-15",
        birthTime: "23:55",
        city: "Dnipro",
        question: rawQuestion,
        intention: rawIntention,
        rawFeedback,
        rawResult: rawResultText,
        initData: "RAW_INIT_DATA_SHOULD_NOT_SURVIVE",
      },
    ],
    favorites: [
      {
        id: "favorite:vipNatalChart",
        featureKey: "vipNatalChart",
        section: "vip",
        label: `Premium Natal ${rawIntention}`,
        timestamp: fixedNowIso,
        resultText: rawResultText,
        feedbackText: rawFeedback,
      },
    ],
    updatedAt: fixedNowIso,
  };
}

function assertSanitizedOutputExcludes(forbiddenValue) {
  const result = sanitizeZodiacProfileSyncPayload(makeUnsafePayload(), { nowIso: fixedNowIso });
  assert(result.ok, "payload should sanitize");
  const serialized = JSON.stringify(result.payload);
  assert(!serialized.includes(forbiddenValue), `sanitized payload must not contain ${forbiddenValue}`);
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
