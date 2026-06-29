#!/usr/bin/env node

import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const requiredFreshnessHours = 24;
const backupRoot = path.resolve(process.cwd(), "data", "backups");

function roundHours(value) {
  return Math.round(value * 100) / 100;
}

function findLatestBackup() {
  if (!existsSync(backupRoot)) {
    return null;
  }

  const candidates = readdirSync(backupRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() || entry.isFile())
    .map((entry) => {
      const fullPath = path.join(backupRoot, entry.name);
      const stats = statSync(fullPath);
      return {
        name: entry.name,
        evidencePath: path.join("data", "backups", entry.name).replaceAll("\\", "/"),
        timestampMs: stats.mtimeMs,
        timestampIso: stats.mtime.toISOString(),
      };
    })
    .sort((a, b) => b.timestampMs - a.timestampMs);

  return candidates[0] ?? null;
}

const latestBackup = findLatestBackup();

console.log("backupFreshnessRequirementHours: 24");

if (!latestBackup) {
  console.log("backupEvidenceStatus: not_found");
  console.log("manualBackupRequired: true");
  console.log("backupMarkedFresh: false");
  process.exit(0);
}

const ageHours = roundHours((Date.now() - latestBackup.timestampMs) / 36e5);
const isFresh = ageHours < requiredFreshnessHours;

console.log(`latestBackupEvidencePath: ${latestBackup.evidencePath}`);
console.log(`latestBackupTimestamp: ${latestBackup.timestampIso}`);
console.log(`latestBackupAgeHours: ${ageHours}`);
console.log(`backupFreshnessStatus: ${isFresh ? "fresh_by_local_metadata" : "stale_or_unverified"}`);
console.log(`manualBackupRequired: ${String(!isFresh)}`);
console.log(`backupMarkedFresh: ${String(isFresh)}`);
