import fs from "fs";
import path from "path";
import { loadLedger } from "./lib/zodiac-publish-ledger.mjs";
import { readLedgerReadOnly } from "./lib/zodiac-autonomy.mjs";

async function main() {
  const tempDir = path.join(process.cwd(), "data", "runtime");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const fixturePath = path.join(tempDir, "test-corrupted-ledger.json");
  let passed = 0;
  let failed = 0;

  function runCheck(name, setup, execute) {
    try {
      setup();
      execute();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (e) {
      console.log(`[FAIL] ${name} - ${e.message}`);
      failed++;
    }
  }

  // Check 1: invalid JSON
  runCheck("Corrupted JSON throws", () => {
    fs.writeFileSync(fixturePath, "{ corrupted json }", "utf-8");
  }, () => {
    let threw = false;
    try {
      loadLedger(fixturePath);
    } catch (e) {
      threw = true;
    }
    if (!threw) throw new Error("loadLedger did not throw on corrupted JSON");
  });

  // Check 2: valid JSON, invalid schema (no entries array)
  runCheck("Invalid schema throws", () => {
    fs.writeFileSync(fixturePath, JSON.stringify({ someData: 123 }), "utf-8");
  }, () => {
    let threw = false;
    try {
      loadLedger(fixturePath);
    } catch (e) {
      threw = true;
    }
    if (!threw) throw new Error("loadLedger did not throw on invalid schema");
  });

  // Check 3: readLedgerReadOnly invalid JSON
  runCheck("readLedgerReadOnly Corrupted JSON throws", () => {
    fs.writeFileSync(fixturePath, "{ corrupted json }", "utf-8");
  }, () => {
    let threw = false;
    try {
      readLedgerReadOnly(fixturePath);
    } catch (e) {
      threw = true;
    }
    if (!threw) throw new Error("readLedgerReadOnly did not throw on corrupted JSON");
  });

  // Check 4: readLedgerReadOnly invalid schema
  runCheck("readLedgerReadOnly Invalid schema throws", () => {
    fs.writeFileSync(fixturePath, JSON.stringify({ someData: 123 }), "utf-8");
  }, () => {
    let threw = false;
    try {
      readLedgerReadOnly(fixturePath);
    } catch (e) {
      threw = true;
    }
    if (!threw) throw new Error("readLedgerReadOnly did not throw on invalid schema");
  });

  // Cleanup
  if (fs.existsSync(fixturePath)) {
    fs.unlinkSync(fixturePath);
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
