import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { copyFile } from "node:fs/promises";
import path from "node:path";
import { loadLocalEnv } from "./load-local-env.mjs";
import { buildPgConfig } from "./pg-config.mjs";
import { compareJsonSupabaseStore } from "./store-compare.mjs";

const root = process.cwd();
const backupsDir = path.join(root, "data", "backups");
const runtimeDir = path.join(root, "data", "runtime");
const telegramPostsDir = path.join(root, "public", "assets", "telegram-posts");
const tables = ["channels", "posts", "publication_logs", "scheduler_runs"];

export async function createSystemBackup() {
  loadLocalEnv({ cwd: root });
  ensureDir(backupsDir);

  const createdAt = new Date();
  const backupId = formatBackupId(createdAt);
  const backupDir = path.join(backupsDir, backupId);
  const backupRuntimeDir = path.join(backupDir, "runtime");
  ensureDir(backupRuntimeDir);

  const runtimeFiles = listRuntimeJsonFiles();
  for (const fileName of runtimeFiles) {
    await copyFile(path.join(runtimeDir, fileName), path.join(backupRuntimeDir, fileName));
  }

  const assetsManifest = listFilesManifest(telegramPostsDir, path.join(root, "public"));
  writeJson(path.join(backupDir, "telegram-posts-assets-manifest.json"), {
    root: "public/assets/telegram-posts",
    fileCount: assetsManifest.length,
    files: assetsManifest,
  });

  const compare = await safeCompare();
  const manifest = {
    createdAt: createdAt.toISOString(),
    backupId,
    gitCommit: gitValue(["rev-parse", "HEAD"]),
    gitBranch: gitValue(["branch", "--show-current"]),
    copiedRuntimeFiles: runtimeFiles,
    assetsManifest: {
      path: "telegram-posts-assets-manifest.json",
      fileCount: assetsManifest.length,
      copiedImages: false,
    },
    counts: {
      json: compare?.localCounts ?? null,
      supabase: compare?.supabaseCounts ?? null,
    },
    storeCompare: compare
      ? {
          status: compare.status,
          synced: compare.status === "ok",
          missingInSupabase: compare.missingInSupabase,
          extraInSupabase: compare.extraInSupabase,
        }
      : null,
    dualRead: compare
      ? {
          status: compare.status,
          sourceOfTruth: "json",
          productionStoreMode: "json",
          synced: compare.status === "ok",
          safeToSwitchToSupabase: false,
        }
      : null,
    secretPolicy: {
      envLocalCopied: false,
      databaseUrlCopied: false,
      telegramTokenCopied: false,
    },
  };
  writeJson(path.join(backupDir, "backup-manifest.json"), manifest);

  return {
    ok: true,
    status: "ok",
    backupDir: path.relative(root, backupDir),
    manifestPath: path.relative(root, path.join(backupDir, "backup-manifest.json")),
    copiedRuntimeFiles: runtimeFiles.length,
    telegramPostsManifestFiles: assetsManifest.length,
    secretsCopied: false,
    counts: manifest.counts,
    storeCompare: manifest.storeCompare,
    dualRead: manifest.dualRead,
  };
}

export async function exportSupabaseMirror() {
  loadLocalEnv({ cwd: root });
  const databaseUrl = process.env.DATABASE_URL;
  const exportDir = path.join(backupsDir, "latest-supabase-export");

  if (!databaseUrl) {
    return {
      ok: false,
      status: "error",
      message: "DATABASE_URL is not configured. No Supabase export was created.",
    };
  }

  ensureCleanDir(exportDir);

  let client;
  const counts = {};
  try {
    const { Client } = await import("pg");
    client = new Client(buildPgConfig(databaseUrl));
    await client.connect();

    for (const table of tables) {
      const result = await client.query(`select * from ${table} order by id asc`);
      counts[table] = result.rows.length;
      writeJson(path.join(exportDir, `${table}.json`), result.rows);
    }

    const manifest = {
      exportedAt: new Date().toISOString(),
      gitCommit: gitValue(["rev-parse", "HEAD"]),
      gitBranch: gitValue(["branch", "--show-current"]),
      source: "supabase mirror",
      readOnly: true,
      tables,
      counts,
      secretPolicy: {
        databaseUrlCopied: false,
        telegramTokenCopied: false,
      },
    };
    writeJson(path.join(exportDir, "export-manifest.json"), manifest);

    return {
      ok: true,
      status: "ok",
      exportDir: path.relative(root, exportDir),
      counts,
      readOnly: true,
      secretsCopied: false,
    };
  } catch (error) {
    return {
      ok: false,
      status: "error",
      message: sanitizeError(error, databaseUrl),
    };
  } finally {
    if (client) await client.end().catch(() => undefined);
  }
}

export async function restoreBackupDryRun() {
  const backups = listBackupFolders();
  const latest = backups[0] ?? null;
  const current = await safeCompare();
  const latestManifest = latest ? readManifest(path.join(backupsDir, latest.name, "backup-manifest.json")) : null;
  const backupJsonCounts = latestManifest?.counts?.json ?? null;
  const currentJsonCounts = current?.localCounts ?? null;

  return {
    ok: true,
    status: latest ? "ok" : "warning",
    mode: "dry-run",
    backups,
    latestBackup: latest,
    latestManifestPresent: Boolean(latestManifest),
    latestManifest,
    currentJsonCounts,
    backupJsonCounts,
    countDiff: backupJsonCounts && currentJsonCounts ? diffCounts(backupJsonCounts, currentJsonCounts) : null,
    restoredFiles: 0,
    wroteSupabase: false,
    wroteJson: false,
    message: latest ? "Restore dry-run only. No files or database records were changed." : "No backup folders were found.",
  };
}

export async function getBackupCenterStatus() {
  const backups = listBackupFolders();
  const latest = backups[0] ?? null;
  const latestManifest = latest ? readManifest(path.join(backupsDir, latest.name, "backup-manifest.json")) : null;
  const compare = await safeCompare();

  return {
    ok: true,
    status: compare?.status ?? "warning",
    backups,
    latestBackup: latest,
    latestManifest,
    current: {
      gitCommit: gitValue(["rev-parse", "HEAD"]),
      gitBranch: gitValue(["branch", "--show-current"]),
      jsonCounts: compare?.localCounts ?? null,
      supabaseCounts: compare?.supabaseCounts ?? null,
      synced: compare?.status === "ok",
      checkedAt: compare?.checkedAt ?? new Date().toISOString(),
    },
    warnings: compare?.warnings ?? ["Store compare was not available."],
    problems: compare?.problems ?? [],
  };
}

function listRuntimeJsonFiles() {
  if (!existsSync(runtimeDir)) return [];
  return readdirSync(runtimeDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

function listBackupFolders() {
  if (!existsSync(backupsDir)) return [];
  return readdirSync(backupsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "latest-supabase-export")
    .map((entry) => {
      const manifestPath = path.join(backupsDir, entry.name, "backup-manifest.json");
      const stats = statSync(path.join(backupsDir, entry.name));
      return {
        name: entry.name,
        path: path.relative(root, path.join(backupsDir, entry.name)),
        createdAt: readManifest(manifestPath)?.createdAt ?? stats.mtime.toISOString(),
        hasManifest: existsSync(manifestPath),
      };
    })
    .sort((left, right) => right.name.localeCompare(left.name))
    .slice(0, 20);
}

function listFilesManifest(dir, relativeRoot) {
  if (!existsSync(dir)) return [];
  const files = [];
  walk(dir, (filePath) => {
    const stats = statSync(filePath);
    files.push({
      path: path.relative(relativeRoot, filePath).replaceAll("\\", "/"),
      size: stats.size,
      modifiedAt: stats.mtime.toISOString(),
    });
  });
  return files.sort((left, right) => left.path.localeCompare(right.path));
}

function walk(dir, visit) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, visit);
    } else if (entry.isFile()) {
      visit(fullPath);
    }
  }
}

async function safeCompare() {
  try {
    return await compareJsonSupabaseStore({ loadEnv: true });
  } catch {
    return null;
  }
}

function readManifest(manifestPath) {
  if (!existsSync(manifestPath)) return null;
  try {
    return JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch {
    return null;
  }
}

function diffCounts(left, right) {
  const keys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)]));
  return Object.fromEntries(keys.map((key) => [key, Number(left[key] ?? 0) - Number(right[key] ?? 0)]));
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function ensureCleanDir(dir) {
  const resolved = path.resolve(dir);
  const resolvedBackups = path.resolve(backupsDir);
  if (!resolved.startsWith(resolvedBackups)) {
    throw new Error("Refusing to clean a directory outside data/backups.");
  }
  rmSync(resolved, { recursive: true, force: true });
  ensureDir(resolved);
}

function formatBackupId(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + "-" + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("-");
}

function gitValue(args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

function sanitizeError(error, databaseUrl) {
  let message = error instanceof Error ? error.message : String(error);
  if (databaseUrl) {
    message = message.split(databaseUrl).join("[redacted DATABASE_URL]");
    try {
      const parsed = new URL(databaseUrl);
      if (parsed.password) {
        message = message.split(decodeURIComponent(parsed.password)).join("[redacted password]");
        message = message.split(parsed.password).join("[redacted password]");
      }
    } catch {
      // Full URL replacement above is enough when URL parsing fails.
    }
  }
  return message;
}
