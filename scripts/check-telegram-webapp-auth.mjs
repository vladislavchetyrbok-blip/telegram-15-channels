import { createHmac } from "node:crypto";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const authSourcePath = path.resolve("lib/zodiac-telegram-auth.ts");
const fakeBotToken = "123456:FAKE_TEST_TOKEN_FOR_INITDATA_VALIDATION_ONLY";
const fixedNow = 1_800_000_000;

const { validateTelegramWebAppInitData } = await loadAuthModule();

const tests = [
  {
    name: "valid fake deterministic initData",
    run: () => {
      const initData = createSignedInitData({
        auth_date: String(fixedNow - 60),
        query_id: "AAFakeQueryId",
        user: JSON.stringify({
          id: "9007199254740993",
          username: "tester",
          first_name: "Safe",
          language_code: "ru",
        }),
      });
      const result = validateTelegramWebAppInitData({
        initData,
        botToken: fakeBotToken,
        nowUnixSeconds: fixedNow,
      });
      assert(result.ok && result.identity.telegramUserId === "9007199254740993");
    },
  },
  {
    name: "tampered user id returns invalid_hash",
    run: () => {
      const initData = createSignedInitData({
        auth_date: String(fixedNow - 60),
        user: JSON.stringify({ id: "1001" }),
      });
      const params = new URLSearchParams(initData);
      params.set("user", JSON.stringify({ id: "1002" }));
      const result = validateTelegramWebAppInitData({
        initData: params.toString(),
        botToken: fakeBotToken,
        nowUnixSeconds: fixedNow,
      });
      assert(!result.ok && result.status === "invalid_hash");
    },
  },
  {
    name: "missing hash returns malformed",
    run: () => {
      const params = new URLSearchParams(
        createSignedInitData({
          auth_date: String(fixedNow - 60),
          user: JSON.stringify({ id: "1001" }),
        }),
      );
      params.delete("hash");
      const result = validateTelegramWebAppInitData({
        initData: params.toString(),
        botToken: fakeBotToken,
        nowUnixSeconds: fixedNow,
      });
      assert(!result.ok && result.status === "malformed");
    },
  },
  {
    name: "expired auth_date returns expired",
    run: () => {
      const initData = createSignedInitData({
        auth_date: String(fixedNow - 90_000),
        user: JSON.stringify({ id: "1001" }),
      });
      const result = validateTelegramWebAppInitData({
        initData,
        botToken: fakeBotToken,
        nowUnixSeconds: fixedNow,
      });
      assert(!result.ok && result.status === "expired");
    },
  },
  {
    name: "missing bot token returns bot_token_missing",
    run: () => {
      const initData = createSignedInitData({
        auth_date: String(fixedNow - 60),
        user: JSON.stringify({ id: "1001" }),
      });
      const result = validateTelegramWebAppInitData({
        initData,
        botToken: undefined,
        nowUnixSeconds: fixedNow,
      });
      assert(!result.ok && result.status === "bot_token_missing");
    },
  },
  {
    name: "malformed input fails safely",
    run: () => {
      const result = validateTelegramWebAppInitData({
        initData: "hash=not-a-valid-hash&auth_date=not-a-date",
        botToken: fakeBotToken,
        nowUnixSeconds: fixedNow,
      });
      assert(!result.ok && result.status === "malformed");
    },
  },
  {
    name: "malformed user JSON after valid hash fails safely",
    run: () => {
      const initData = createSignedInitData({
        auth_date: String(fixedNow - 60),
        user: "{bad-json",
      });
      const result = validateTelegramWebAppInitData({
        initData,
        botToken: fakeBotToken,
        nowUnixSeconds: fixedNow,
      });
      assert(!result.ok && result.status === "malformed");
    },
  },
  {
    name: "timing-safe compare path handles wrong hash",
    run: () => {
      const params = new URLSearchParams(
        createSignedInitData({
          auth_date: String(fixedNow - 60),
          user: JSON.stringify({ id: "1001" }),
        }),
      );
      params.set("hash", "0".repeat(64));
      const result = validateTelegramWebAppInitData({
        initData: params.toString(),
        botToken: fakeBotToken,
        nowUnixSeconds: fixedNow,
      });
      assert(!result.ok && result.status === "invalid_hash");
    },
  },
];

const failures = [];
for (const test of tests) {
  try {
    test.run();
    console.log(`PASS ${test.name}`);
  } catch (error) {
    failures.push({ name: test.name, error });
    console.error(`FAIL ${test.name}`);
  }
}

if (failures.length > 0) {
  console.error(`Telegram WebApp Auth Check: FAIL (${failures.length}/${tests.length})`);
  process.exit(1);
}

console.log(`Telegram WebApp Auth Check: PASS (${tests.length}/${tests.length})`);

async function loadAuthModule() {
  const source = await readFile(authSourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: authSourcePath,
  }).outputText;

  const module = { exports: {} };
  const context = {
    Buffer,
    URLSearchParams,
    exports: module.exports,
    module,
    require: (id) => {
      if (id === "node:crypto") {
        return require(id);
      }
      throw new Error(`Unexpected module import in auth check: ${id}`);
    },
  };

  vm.runInNewContext(transpiled, context, { filename: authSourcePath });
  return module.exports;
}

function createSignedInitData(fields) {
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

function assert(condition) {
  if (!condition) {
    throw new Error("Assertion failed");
  }
}
