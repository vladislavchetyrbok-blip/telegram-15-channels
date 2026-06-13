import fs from 'fs';
import path from 'path';
import { buildPgConfig } from './lib/pg-config.mjs';
import { runMirrorSync } from './lib/mirror-sync.mjs';

const isApply = process.argv.includes('--apply');
const isDryRun = process.argv.includes('--dry-run') || !isApply;

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

async function main() {
  console.log("=========================================");
  console.log(" Controlled Supabase Reconciliation Runner");
  console.log("=========================================");

  if (isApply && process.env.CONFIRM_SUPABASE_RECONCILIATION_APPLY !== "YES") {
    console.error(`${RED}[ERROR]${RESET} Missing CONFIRM_SUPABASE_RECONCILIATION_APPLY=YES env variable for apply mode.`);
    process.exit(1);
  }

  // Check git clean
  const { execSync } = await import('child_process');
  try {
    const status = execSync('git status --porcelain').toString().trim();
    if (status) {
      if (isApply) {
        console.error(`${RED}[ERROR]${RESET} Git tree is not clean. Commit or stash changes before running reconciliation apply.`);
        console.error(status);
        process.exit(1);
      } else {
        console.warn(`${YELLOW}[WARNING]${RESET} Git tree is not clean. This is ignored in dry-run mode.`);
      }
    }
  } catch (e) {
    console.error(`${RED}[ERROR]${RESET} Failed to check git status.`, e.message);
    process.exit(1);
  }

  // Read JSON
  const jsonPath = path.resolve('docs/SUPABASE_RECONCILIATION_PREFLIGHT_ACTIONS.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`${RED}[ERROR]${RESET} Missing preflight plan at ${jsonPath}`);
    process.exit(1);
  }

  let plan;
  try {
    plan = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (e) {
    console.error(`${RED}[ERROR]${RESET} Failed to parse preflight plan JSON:`, e.message);
    process.exit(1);
  }

  // Validate Plan
  const actions = plan.actions || [];
  if (actions.length !== 10) {
    console.error(`${RED}[ERROR]${RESET} Unexpected actions count. Expected 10, got ${actions.length}.`);
    process.exit(1);
  }

  const inserts = actions.filter(a => a.type === 'insert_to_supabase');
  const deletesSupabase = actions.filter(a => a.type === 'delete_from_supabase');
  const deletesLocal = actions.filter(a => a.type === 'delete_from_local_json');

  if (inserts.length !== 8 || deletesSupabase.length !== 1 || deletesLocal.length !== 1) {
    console.error(`${RED}[ERROR]${RESET} Unexpected action types composition.`);
    process.exit(1);
  }

  const unexpected = actions.filter(a => !['insert_to_supabase', 'delete_from_supabase', 'delete_from_local_json'].includes(a.type));
  if (unexpected.length > 0) {
    console.error(`${RED}[ERROR]${RESET} Found unexpected action types:`, unexpected);
    process.exit(1);
  }

  if (actions.some(a => a.applyNow !== false)) {
    console.error(`${RED}[ERROR]${RESET} Some actions have applyNow !== false in preflight JSON. Refusing to run.`);
    process.exit(1);
  }

  if (isDryRun) {
    console.log(`\n${YELLOW}--- DRY RUN SUMMARY ---${RESET}`);
    console.log(`Mode: ${plan.mode}`);
    console.log(`Total Actions: ${actions.length}`);
    console.log(`\n[Local Deletions]`);
    deletesLocal.forEach(a => console.log(` - ID: ${a.id} (Type: ${a.recordType})`));
    console.log(`\n[Supabase Deletions]`);
    deletesSupabase.forEach(a => console.log(` - ID: ${a.id} (Type: ${a.recordType})`));
    console.log(`\n[Supabase Inserts]`);
    inserts.forEach(a => console.log(` - ID: ${a.id} (Type: ${a.recordType})`));
    console.log(`\n[Affected Files]`);
    console.log(` - data/runtime/publication_logs.json`);
    console.log(` - data/runtime/autopublish.json`);
    console.log(` - Supabase remote database`);
    console.log(`\nRun with --apply to execute changes.`);
    process.exit(0);
  }

  // Apply Mode
  console.log(`\n${YELLOW}--- APPLYING CHANGES ---${RESET}`);
  let applyCount = 0;

  // 1. Local JSON Deletions
  for (const action of deletesLocal) {
    console.log(`Deleting local references for ${action.id}...`);
    
    // publication_logs.json
    const pubPath = path.resolve('data/runtime/publication_logs.json');
    if (fs.existsSync(pubPath)) {
      let logs = JSON.parse(fs.readFileSync(pubPath, 'utf8'));
      const initialLength = logs.length;
      logs = logs.filter(log => log.postId !== action.id);
      if (logs.length < initialLength) {
        fs.writeFileSync(pubPath, JSON.stringify(logs, null, 2));
        console.log(` -> Removed ${initialLength - logs.length} entries from publication_logs.json`);
      }
    }

    // autopublish.json
    const autoPath = path.resolve('data/runtime/autopublish.json');
    if (fs.existsSync(autoPath)) {
      let auto = JSON.parse(fs.readFileSync(autoPath, 'utf8'));
      let modified = false;
      if (auto.history) {
        const initHistory = auto.history.length;
        auto.history = auto.history.filter(h => h.postId !== action.id);
        if (auto.history.length < initHistory) {
          modified = true;
          console.log(` -> Removed ${initHistory - auto.history.length} entries from autopublish.json history`);
        }
      }
      if (auto.queue) {
        const initQueue = auto.queue.length;
        auto.queue = auto.queue.filter(q => q.postId !== action.id);
        if (auto.queue.length < initQueue) {
          modified = true;
          console.log(` -> Removed ${initQueue - auto.queue.length} entries from autopublish.json queue`);
        }
      }
      if (modified) fs.writeFileSync(autoPath, JSON.stringify(auto, null, 2));
    }
    applyCount++;
  }

  // 2. Supabase Deletions
  // Load .env implicitly since we need SUPABASE_DATABASE_URL
  const dotenv = await import('dotenv');
  dotenv.config({ path: '.env.local' });
  dotenv.config({ path: '.env' });

  const dbUrl = process.env.SUPABASE_DATABASE_URL;
  if (!dbUrl) {
    console.error(`${RED}[ERROR]${RESET} SUPABASE_DATABASE_URL is missing.`);
    process.exit(1);
  }

  const { Client } = await import('pg');
  const pgConfig = buildPgConfig(dbUrl, { sslMode: "require" });
  const client = new Client(pgConfig);

  try {
    await client.connect();
    for (const action of deletesSupabase) {
      console.log(`Deleting from Supabase table ${action.recordType}s, id=${action.id}...`);
      const table = action.recordType === 'scheduler_run' ? 'scheduler_runs' : `${action.recordType}s`;
      const res = await client.query(`DELETE FROM ${table} WHERE id = $1`, [action.id]);
      console.log(` -> Deleted ${res.rowCount} row(s)`);
      applyCount++;
    }
  } catch (e) {
    console.error(`${RED}[ERROR]${RESET} Failed to delete from Supabase:`, e.message);
    process.exit(1);
  } finally {
    await client.end();
  }

  // 3. Supabase Inserts
  console.log(`Running Mirror Sync to insert ${inserts.length} missing records...`);
  const report = await runMirrorSync({ apply: true, confirm: true, loadEnv: true });
  console.log(` -> Mirror sync inserted: ${JSON.stringify(report.inserted)}`);
  if (report.status === "error") {
    console.error(`${RED}[ERROR]${RESET} Mirror sync encountered an error.`);
  } else {
    applyCount += inserts.length;
  }

  console.log(`\n${GREEN}[SUCCESS]${RESET} Apply complete. ${applyCount}/${actions.length} actions processed.`);
  console.log("Please run production:safety:check to verify health.");
}

main().catch(e => {
  console.error("Unhandled error:", e);
  process.exit(1);
});
