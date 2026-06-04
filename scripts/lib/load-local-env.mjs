import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export function loadLocalEnv(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const envPath = options.path ?? path.join(cwd, ".env.local");

  if (!existsSync(envPath)) {
    return { loaded: false, path: envPath, keys: [] };
  }

  const loadedKeys = [];
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    if (process.env[key] !== undefined) continue;

    process.env[key] = parseEnvValue(trimmed.slice(separatorIndex + 1));
    loadedKeys.push(key);
  }

  return { loaded: true, path: envPath, keys: loadedKeys };
}

function parseEnvValue(rawValue) {
  const value = rawValue.trim();
  const quote = value[0];
  if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
    return value.slice(1, -1);
  }
  return value;
}
