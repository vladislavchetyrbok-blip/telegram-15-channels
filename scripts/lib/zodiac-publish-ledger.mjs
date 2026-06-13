import fs from "fs";
import path from "path";

const RUNTIME_DIR = path.resolve(process.cwd(), "data/runtime");
const LEDGER_PATH = path.join(RUNTIME_DIR, "zodiac-publish-ledger.json");
const LOCK_PATH = path.join(RUNTIME_DIR, "zodiac-publish.lock");

export function getPublishKey(date, slug) {
  return `${date}:${slug}`;
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

export function loadLedger() {
  if (!fs.existsSync(RUNTIME_DIR)) {
    fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  }
  if (!fs.existsSync(LEDGER_PATH)) {
    return { entries: {} };
  }
  try {
    const data = fs.readFileSync(LEDGER_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to parse ledger at ${LEDGER_PATH}:`, error);
    return { entries: {} };
  }
}

export function saveLedger(ledgerData) {
  if (!fs.existsSync(RUNTIME_DIR)) {
    fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  }
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledgerData, null, 2), "utf8");
}

export function hasSent(date, slug) {
  const ledger = loadLedger();
  const key = getPublishKey(date, slug);
  const entry = ledger.entries[key];
  return entry && entry.status === "sent";
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
    
    if (entry.status === "sent") summary.sentCount++;
    if (entry.status === "pending") summary.pendingCount++;
    if (entry.status === "failed") summary.failedCount++;
    
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
