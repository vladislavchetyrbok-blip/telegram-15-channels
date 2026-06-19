import fs from "fs";
import path from "path";

export const STATE_DIR = path.resolve(process.cwd(), "data/state");
export const LEDGER_PATH = path.join(STATE_DIR, "zodiac-publish-ledger.json");
export const LEGACY_RUNTIME_DIR = path.resolve(process.cwd(), "data/runtime");
export const LEGACY_LEDGER_PATH = path.join(LEGACY_RUNTIME_DIR, "zodiac-publish-ledger.json");
const RUNTIME_DIR = LEGACY_RUNTIME_DIR;
const LOCK_PATH = path.join(RUNTIME_DIR, "zodiac-publish.lock");
const PROTECTED_STATUSES = new Set(["sent", "published", "pending", "locked", "in_progress", "publishing"]);
const ACTIVE_LOCK_STATUSES = new Set(["pending", "locked", "in_progress", "publishing"]);

export function getPublishKey(date, slug) {
  return `${date}:${slug}`;
}

export function normalizeLedgerStatus(status) {
  return String(status || "").trim().toLowerCase();
}

export function isProtectedPublishStatus(status) {
  return PROTECTED_STATUSES.has(normalizeLedgerStatus(status));
}

export function isActiveLockStatus(status) {
  return ACTIVE_LOCK_STATUSES.has(normalizeLedgerStatus(status));
}

export function getLedgerEntry(ledger, date, slug) {
  const entries = ledger?.entries && typeof ledger.entries === "object" ? ledger.entries : {};
  const key = getPublishKey(date, slug);
  return entries[key] ?? Object.values(entries).find((entry) => entry?.date === date && entry?.slug === slug) ?? null;
}

export function acquireLock() {
  if (!fs.existsSync(RUNTIME_DIR)) {
    fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  }
  if (fs.existsSync(LOCK_PATH)) {
    throw new Error(`Ledger lock exists at ${LOCK_PATH}. Cannot acquire lock.`);
  }
  fs.writeFileSync(LOCK_PATH, new Date().toISOString(), "utf8");
}

export function releaseLock() {
  if (fs.existsSync(LOCK_PATH)) {
    fs.unlinkSync(LOCK_PATH);
  }
}

export function loadLedger(overridePath) {
  const ledgerPath = overridePath || (fs.existsSync(LEDGER_PATH) ? LEDGER_PATH : LEGACY_LEDGER_PATH);
  if (!fs.existsSync(ledgerPath)) return { entries: {} };

  try {
    const data = fs.readFileSync(ledgerPath, "utf8");
    if (!data.trim()) return { entries: {} };
    const parsed = JSON.parse(data);
    if (!parsed || typeof parsed !== "object" || !parsed.entries) {
      throw new Error("Ledger missing 'entries' object");
    }
    return parsed;
  } catch (error) {
    console.error(`CRITICAL: Failed to parse ledger at ${ledgerPath}. Failing closed to prevent duplicate sends:`, error);
    throw new Error(`Ledger corruption detected: ${error.message}`);
  }
}

export function saveLedger(ledgerData) {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
  const tempPath = `${LEDGER_PATH}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, `${JSON.stringify(ledgerData, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, LEDGER_PATH);
}

export function hasSent(date, slug) {
  const ledger = loadLedger();
  const entry = getLedgerEntry(ledger, date, slug);
  return ["sent", "published"].includes(normalizeLedgerStatus(entry?.status));
}

function updateEntry(date, slug, status, metadata = {}) {
  const ledger = loadLedger();
  const key = getPublishKey(date, slug);
  const now = new Date().toISOString();
  
  const existing = ledger.entries[key] || {
    key,
    date,
    slug,
    createdAt: now
  };

  ledger.entries[key] = {
    ...existing,
    ...metadata,
    status,
    updatedAt: now
  };

  saveLedger(ledger);
}

export function markPending(date, slug, metadata = {}) {
  updateEntry(date, slug, "pending", metadata);
}

export function markLocked(date, slug, metadata = {}) {
  updateEntry(date, slug, "locked", metadata);
}

export function markSent(date, slug, metadata = {}) {
  updateEntry(date, slug, "sent", metadata);
}

export function markFailed(date, slug, metadata = {}) {
  updateEntry(date, slug, "failed", metadata);
}

export function summarizeLedger() {
  const ledger = loadLedger();
  const summary = {
    totalEntries: 0,
    sentCount: 0,
    pendingCount: 0,
    failedCount: 0,
    dates: new Set(),
    slugs: new Set()
  };

  for (const key of Object.keys(ledger.entries)) {
    const entry = ledger.entries[key];
    summary.totalEntries++;
    
    const status = normalizeLedgerStatus(entry.status);
    if (status === "sent" || status === "published") summary.sentCount++;
    if (ACTIVE_LOCK_STATUSES.has(status)) summary.pendingCount++;
    if (status === "failed") summary.failedCount++;
    
    if (entry.date) summary.dates.add(entry.date);
    if (entry.slug) summary.slugs.add(entry.slug);
  }

  return {
    totalEntries: summary.totalEntries,
    sentCount: summary.sentCount,
    pendingCount: summary.pendingCount,
    failedCount: summary.failedCount,
    datesCovered: Array.from(summary.dates).sort(),
    slugsCovered: Array.from(summary.slugs).sort()
  };
}
