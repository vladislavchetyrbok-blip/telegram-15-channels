import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
loadLocalEnv(path.join(projectRoot, ".env.local"));
const heartbeatPath = path.join(projectRoot, "data", "runtime", "autopublish-worker-heartbeat.json");
const workerLogPath = path.join(projectRoot, "logs", "worker.log");
const apiBase = process.env.AUTOPUBLISH_API_BASE || "http://localhost:3000";
const intervalMs = Number(process.env.AUTOPUBLISH_WORKER_INTERVAL_MS || 5 * 60 * 1000);
const once = process.argv.includes("--once");
let inFlight = false;

function writeHeartbeat(payload) {
  mkdirSync(path.dirname(heartbeatPath), { recursive: true });
  writeFileSync(
    heartbeatPath,
    JSON.stringify(
      {
        workerRunning: true,
        apiBase,
        pid: process.pid,
        intervalMs,
        updatedAt: new Date().toISOString(),
        ...payload,
      },
      null,
      2,
    ),
    "utf8",
  );
}

function writeWorkerLog(message) {
  mkdirSync(path.dirname(workerLogPath), { recursive: true });
  appendFileSync(workerLogPath, `${new Date().toISOString()} ${sanitizeSecret(message)}\n`, "utf8");
}

async function tick() {
  if (inFlight) {
    const nextTickAt = new Date(Date.now() + intervalMs).toISOString();
    const summary = `[autopublish-worker] skipped overlapping tick nextTickAt=${nextTickAt}`;
    writeHeartbeat({
      lastTickAt: new Date().toISOString(),
      nextTickAt,
      lastStatus: "skipped",
      lastResult: { ok: true, reason: "previous tick still running" },
      lastError: null,
      tokenConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    });
    console.log(summary);
    writeWorkerLog(summary);
    return;
  }

  inFlight = true;
  const startedAt = new Date().toISOString();

  try {
    await postJson("/api/admin/autopilot/heartbeat", { at: startedAt, status: "checking", error: null });
    const autopilotStatus = await getJson("/api/admin/autopilot/status");
    if (autopilotStatus?.protectionMode?.enabled || autopilotStatus?.autopublish?.paused) {
      const nextTickAt = new Date(Date.now() + intervalMs).toISOString();
      const reason = autopilotStatus?.protectionMode?.reason || autopilotStatus?.autopublish?.pausedReason || "paused_or_protection_mode";
      writeHeartbeat({
        lastTickAt: startedAt,
        nextTickAt,
        lastStatus: "paused",
        lastResult: { ok: true, reason },
        lastError: null,
        tokenConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      });
      await maybeSendDailyReport(autopilotStatus);
      const summary = `[autopublish-worker] paused reason=${reason} nextTickAt=${nextTickAt}`;
      console.log(summary);
      writeWorkerLog(summary);
      return;
    }

    const response = await fetch(`${apiBase}/api/autopublish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "scheduler_tick" }),
    });
    const payload = await response.json().catch(() => null);
    const nextTickAt = new Date(Date.now() + intervalMs).toISOString();

    writeHeartbeat({
      lastTickAt: startedAt,
      nextTickAt,
      lastStatus: response.status,
      lastResult: payload,
      lastError: response.ok ? null : sanitizeSecret(payload?.message ?? "scheduler tick HTTP error"),
      tokenConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    });
    await postJson("/api/admin/autopilot/heartbeat", { at: startedAt, status: response.ok ? "ok" : "error", error: response.ok ? null : payload?.message ?? "scheduler tick HTTP error" });
    await maybeSendDailyReport(autopilotStatus);
    if (!response.ok || payload?.ok === false) {
      await postJson("/api/admin/reports/send-status", {});
    }

    const summary = `[autopublish-worker] status=${response.status} timezone=${payload?.result?.timezone ?? payload?.timezone ?? "Europe/Kyiv"} published=${payload?.published ?? payload?.result?.publishedSuccess ?? 0} reason=${payload?.reason ?? "none"} message=${payload?.message ?? "checked"}`;
    console.log(summary);
    writeWorkerLog(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "worker error";
    writeHeartbeat({
      lastTickAt: startedAt,
      nextTickAt: new Date(Date.now() + intervalMs).toISOString(),
      lastStatus: "error",
      lastResult: null,
      lastError: sanitizeSecret(message),
      tokenConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    });
    await postJson("/api/admin/autopilot/heartbeat", { at: startedAt, status: "error", error: message });
    await postJson("/api/admin/reports/send-status", {});
    const summary = `[autopublish-worker] error=${sanitizeSecret(message)} tokenConfigured=${Boolean(process.env.TELEGRAM_BOT_TOKEN)}`;
    console.error(summary);
    writeWorkerLog(summary);
  } finally {
    inFlight = false;
  }
}

async function getJson(route) {
  const response = await fetch(`${apiBase}${route}`);
  return response.json().catch(() => null);
}

async function postJson(route, body) {
  try {
    const response = await fetch(`${apiBase}${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    return response.json().catch(() => null);
  } catch (error) {
    writeWorkerLog(`[autopublish-worker] admin endpoint ${route} failed: ${sanitizeSecret(error instanceof Error ? error.message : String(error))}`);
    return null;
  }
}

async function maybeSendDailyReport(status) {
  const kyiv = getKyivParts(new Date());
  if (kyiv.hour < 20) return;

  const last = status?.adminReports?.lastDailyReportAt || status?.lastDailyReportAt;
  const lastKey = last ? getKyivParts(new Date(last)).dateKey : null;
  if (lastKey === kyiv.dateKey) return;

  const result = await postJson("/api/admin/reports/send-daily-now", {});
  writeWorkerLog(`[autopublish-worker] daily report sent=${Boolean(result?.sent)} reason=${result?.reason ?? "none"}`);
}

function getKyivParts(date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return {
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function loadLocalEnv(filePath) {
  if (!existsSync(filePath)) return;

  const raw = readFileSync(filePath, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function sanitizeSecret(value) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  return token ? value.replaceAll(token, `configured ****${token.slice(-4)}`) : value;
}

writeHeartbeat({ startedAt: new Date().toISOString(), nextTickAt: new Date(Date.now() + intervalMs).toISOString(), lastError: null, tokenConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN) });
writeWorkerLog(`[autopublish-worker] worker started tokenConfigured=${Boolean(process.env.TELEGRAM_BOT_TOKEN)} apiBase=${apiBase}`);

async function runLoop() {
  await tick();

  if (!once) {
    setTimeout(runLoop, intervalMs);
  }
}

await runLoop();
