#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import http from "node:http";

const BASE_URL = "http://127.0.0.1:3000";
const PROTECTED_ROUTE = "/dashboard/networks/zodiac";
const LOGIN_ROUTE = "/dashboard/login";
const TIMEOUT_MS = 120_000;
const TEST_PASSCODE = "package-64-dashboard-auth-test-passcode";
const TEST_SECRET = "package-64-dashboard-auth-test-session-secret";

const report = {
  disabledMode: false,
  enabledModeRedirect: false,
  wrongPasscodeRejected: false,
  correctPasscodeAccepted: false,
  sessionAllowed: false,
  logoutCleared: false,
  missingConfigFailClosed: false,
  noSecretsPrinted: true,
};

main()
  .then(() => {
    printSummary("PASS");
  })
  .catch((error) => {
    printSummary("FAIL");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  })
  .finally(() => {
    stopPort3000();
  });

async function main() {
  await runDisabledMode();
  await runEnabledMode();
  await runMissingConfigMode();
}

async function runDisabledMode() {
  await withServer(
    {
      ZODIAC_DASHBOARD_AUTH_ENABLED: "false",
      ZODIAC_DASHBOARD_ADMIN_PASSWORD_SHA256: "",
      ZODIAC_DASHBOARD_SESSION_SECRET: "",
    },
    async () => {
      const dashboard = await request("GET", PROTECTED_ROUTE);
      assertStatus(dashboard, 200, "auth disabled dashboard should load");
      assertNoSecrets(dashboard.body, "disabled dashboard");

      const security = await request("GET", "/dashboard/networks/zodiac/security");
      assertStatus(security, 200, "auth disabled security page should load");
      assertIncludes(security.body, "Dashboard auth", "security auth card");
      assertIncludes(security.body, "Auth disabled: acceptable for local development", "disabled auth warning");
      assertNoSecrets(security.body, "disabled security page");

      report.disabledMode = true;
    },
  );
}

async function runEnabledMode() {
  const hash = createHash("sha256").update(TEST_PASSCODE, "utf8").digest("hex");

  await withServer(
    {
      ZODIAC_DASHBOARD_AUTH_ENABLED: "true",
      ZODIAC_DASHBOARD_ADMIN_PASSWORD_SHA256: hash,
      ZODIAC_DASHBOARD_SESSION_SECRET: TEST_SECRET,
    },
    async () => {
      const login = await request("GET", `${LOGIN_ROUTE}?next=${encodeURIComponent(PROTECTED_ROUTE)}`);
      assertStatus(login, 200, "enabled login page should render");
      assertIncludes(login.body, "Вход в Zodiac OS", "enabled login page heading");
      assertIncludes(login.body, "Passcode владельца", "enabled login passcode field");
      assertNoSecrets(login.body, "enabled login page");

      const unauthenticated = await request("GET", PROTECTED_ROUTE);
      assertRedirectToLogin(unauthenticated, "unauthenticated protected route");
      report.enabledModeRedirect = true;

      const wrong = await requestJson("POST", "/api/dashboard/auth/login", { password: "wrong-passcode", next: PROTECTED_ROUTE });
      assertStatus(wrong, 401, "wrong passcode should fail");
      assertNoSecrets(wrong.body, "wrong passcode response");
      report.wrongPasscodeRejected = true;

      const correct = await requestJson("POST", "/api/dashboard/auth/login", { password: TEST_PASSCODE, next: PROTECTED_ROUTE });
      assertStatus(correct, 200, "correct passcode should succeed");
      assertNoSecrets(correct.body, "correct passcode response");
      const sessionCookie = extractSessionCookie(correct.headers["set-cookie"]);
      if (!sessionCookie) throw new Error("Login did not set a session cookie.");
      if (!String(correct.headers["set-cookie"] ?? "").includes("HttpOnly")) throw new Error("Session cookie is not httpOnly.");
      if (!/SameSite=Lax/i.test(String(correct.headers["set-cookie"] ?? ""))) throw new Error("Session cookie sameSite is not lax.");
      report.correctPasscodeAccepted = true;

      const authorized = await request("GET", PROTECTED_ROUTE, { cookie: sessionCookie });
      assertStatus(authorized, 200, "session should allow dashboard access");
      assertIncludes(authorized.body, "Zodiac Control", "authorized dashboard content");
      assertNoSecrets(authorized.body, "authorized dashboard");
      report.sessionAllowed = true;

      const logout = await request("POST", "/api/dashboard/auth/logout", { cookie: sessionCookie });
      assertStatus(logout, 200, "logout should succeed");
      if (!String(logout.headers["set-cookie"] ?? "").includes("Max-Age=0")) throw new Error("Logout did not clear the session cookie.");

      const afterLogout = await request("GET", PROTECTED_ROUTE);
      assertRedirectToLogin(afterLogout, "protected route after logout");
      report.logoutCleared = true;
    },
  );
}

async function runMissingConfigMode() {
  await withServer(
    {
      ZODIAC_DASHBOARD_AUTH_ENABLED: "true",
      ZODIAC_DASHBOARD_ADMIN_PASSWORD_SHA256: "",
      ZODIAC_DASHBOARD_SESSION_SECRET: "",
    },
    async () => {
      const protectedResponse = await request("GET", PROTECTED_ROUTE);
      assertRedirectToLogin(protectedResponse, "missing config protected route");
      if (!String(protectedResponse.headers.location ?? "").includes("error=config")) throw new Error("Missing config redirect did not include config error.");

      const login = await request("GET", `${LOGIN_ROUTE}?next=${encodeURIComponent(PROTECTED_ROUTE)}&error=config`);
      assertStatus(login, 200, "missing config login page should render");
      assertIncludes(login.body, "Dashboard закрыт fail-closed", "missing config fail-closed copy");
      assertNoSecrets(login.body, "missing config login page");
      report.missingConfigFailClosed = true;
    },
  );
}

async function withServer(envOverrides, callback) {
  stopPort3000();
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3000"], {
    env: { ...process.env, ...envOverrides },
    stdio: "ignore",
    windowsHide: true,
  });

  try {
    await waitForServer();
    await callback();
  } finally {
    child.kill();
    await delay(800);
    stopPort3000();
  }
}

async function waitForServer() {
  const start = Date.now();
  while (Date.now() - start < TIMEOUT_MS) {
    const response = await request("GET", "/compatibility").catch(() => null);
    if (response?.statusCode === 200) return;
    await delay(1000);
  }
  throw new Error("Timeout waiting for dashboard auth test server.");
}

function requestJson(method, path, payload, headers = {}) {
  return request(method, path, {
    ...headers,
    "content-type": "application/json",
    body: JSON.stringify(payload),
  });
}

function request(method, path, options = {}) {
  return new Promise((resolve, reject) => {
    const body = options.body ?? "";
    const headers = { ...(options.cookie ? { cookie: options.cookie } : {}), ...(options["content-type"] ? { "content-type": options["content-type"] } : {}) };
    if (body) headers["content-length"] = Buffer.byteLength(body);

    const req = http.request(
      `${BASE_URL}${path}`,
      {
        method,
        headers,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({ statusCode: res.statusCode ?? 0, headers: res.headers, body: data });
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(30_000, () => {
      req.destroy(new Error(`Request timeout: ${method} ${path}`));
    });
    if (body) req.write(body);
    req.end();
  });
}

function assertStatus(response, expected, label) {
  if (response.statusCode !== expected) throw new Error(`${label}: expected ${expected}, got ${response.statusCode}.`);
}

function assertRedirectToLogin(response, label) {
  if (![307, 308].includes(response.statusCode)) throw new Error(`${label}: expected redirect, got ${response.statusCode}.`);
  const location = String(response.headers.location ?? "");
  if (!location.startsWith("/dashboard/login")) throw new Error(`${label}: expected /dashboard/login redirect, got ${location || "empty location"}.`);
}

function assertIncludes(value, needle, label) {
  if (!String(value).includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

function assertNoSecrets(value, label) {
  for (const secret of [TEST_PASSCODE, TEST_SECRET]) {
    if (String(value).includes(secret)) {
      report.noSecretsPrinted = false;
      throw new Error(`${label} leaked a test secret.`);
    }
  }

  const envKeys = [
    "TELEGRAM_BOT_TOKEN",
    "BOT_TOKEN",
    "COMPATIBILITY_BOT_TOKEN",
    "ZODIAC_ANALYTICS_REDIS_URL",
    "ZODIAC_ANALYTICS_REDIS_TOKEN",
    "ZODIAC_DASHBOARD_ADMIN_PASSWORD_SHA256",
    "ZODIAC_DASHBOARD_SESSION_SECRET",
  ];
  const candidates = envKeys.map((key) => process.env[key]).filter((item) => typeof item === "string" && item.length >= 8);
  for (const secret of candidates) {
    if (String(value).includes(secret)) {
      report.noSecretsPrinted = false;
      throw new Error(`${label} leaked an env value.`);
    }
  }
}

function extractSessionCookie(setCookieHeader) {
  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : setCookieHeader ? [setCookieHeader] : [];
  const session = cookies.find((item) => item.startsWith("zodiac_dashboard_session="));
  return session ? session.split(";")[0] : "";
}

function stopPort3000() {
  if (process.platform === "win32") {
    spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        "$connections = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 }; $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique; foreach ($processId in $processIds) { Get-Process -Id $processId -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue }",
      ],
      { stdio: "ignore", windowsHide: true },
    );
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printSummary(status) {
  console.log(`Zodiac Dashboard Auth Check: ${status}`);
  console.log(`Auth disabled mode: ${report.disabledMode ? "PASS" : "NO"}`);
  console.log(`Auth enabled redirect: ${report.enabledModeRedirect ? "PASS" : "NO"}`);
  console.log(`Wrong passcode rejected: ${report.wrongPasscodeRejected ? "PASS" : "NO"}`);
  console.log(`Correct passcode session: ${report.correctPasscodeAccepted && report.sessionAllowed ? "PASS" : "NO"}`);
  console.log(`Logout clears session: ${report.logoutCleared ? "PASS" : "NO"}`);
  console.log(`Missing config fail-closed: ${report.missingConfigFailClosed ? "PASS" : "NO"}`);
  console.log(`No secrets printed: ${report.noSecretsPrinted ? "YES" : "NO"}`);
}
