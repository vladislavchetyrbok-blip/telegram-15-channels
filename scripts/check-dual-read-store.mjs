import { compareJsonSupabaseStore } from "./lib/store-compare.mjs";

const compare = await compareJsonSupabaseStore({ loadEnv: true });
const hasMismatch =
  Object.values(compare.missingInSupabase).some((items) => items.length > 0) ||
  Object.values(compare.extraInSupabase).some((items) => items.length > 0) ||
  Object.values(compare.duplicates.local).some((items) => items.length > 0) ||
  Object.values(compare.duplicates.supabase).some((items) => items.length > 0);

const report = {
  status: compare.status,
  sourceOfTruth: "json",
  productionStoreMode: "json",
  supabaseMirrorConfigured: compare.supabaseConfigured,
  jsonCounts: compare.localCounts,
  supabaseCounts: compare.supabaseCounts,
  synced: compare.status === "ok" && !hasMismatch,
  mismatches: {
    missingInSupabase: compare.missingInSupabase,
    extraInSupabase: compare.extraInSupabase,
    duplicates: {
      json: compare.duplicates.local,
      supabase: compare.duplicates.supabase,
    },
  },
  warnings: compare.warnings,
  problems: compare.problems,
  lastCheckedAt: compare.checkedAt,
  safeToSwitchToSupabase: false,
};

console.log(JSON.stringify(report, null, 2));

if (report.status === "error") {
  process.exitCode = 1;
}
