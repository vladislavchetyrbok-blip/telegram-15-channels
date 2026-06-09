import { spawnSync } from "node:child_process";
import process from "node:process";

const mode = process.argv[2];
const isReal = mode === "real";

console.log(`\n=== PUBLISH DUE: JSON STORE (${isReal ? "REAL" : "DRY RUN"}) ===\n`);

const env = {
  ...process.env,
  PUBLISH_DUE_STORE: "json",
  PUBLISH_DUE_DRY_RUN: isReal ? "false" : "true",
  TELEGRAM_REAL_PUBLISH_ENABLED: isReal ? "true" : "false",
};

const result = spawnSync("node", ["--env-file=.env.local", "scripts/publish-due.mjs"], {
  stdio: "inherit",
  env,
});

process.exit(result.status ?? 1);
