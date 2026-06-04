import {
  diffStoreIds,
  emptyStoreCounts,
  emptyStoreIds,
  hasAnyDuplicates,
  hasAnyStoreIds,
  type DuplicateIds,
  type StoreCounts,
  type StoreIds,
} from "@/lib/store/json-store-reader";
import { readJsonStoreSnapshot } from "@/lib/store/json-store-reader";
import { readSupabaseStoreSnapshot } from "@/lib/store/supabase-store-reader";
import { getConfiguredPublishStoreMode } from "@/lib/storage/publish-store-factory";

export interface DualStoreMismatches {
  missingInSupabase: StoreIds;
  extraInSupabase: StoreIds;
  duplicates: {
    json: DuplicateIds;
    supabase: DuplicateIds;
  };
}

export interface DualStoreReport {
  status: "ok" | "warning" | "error";
  productionStoreMode: "json";
  supabaseMirrorConfigured: boolean;
  sourceOfTruth: "json";
  jsonCounts: StoreCounts;
  supabaseCounts: StoreCounts;
  synced: boolean;
  mismatches: DualStoreMismatches;
  warnings: string[];
  problems: string[];
  lastCheckedAt: string;
  safeToSwitchToSupabase: false;
}

export async function readDualStoreStatus(): Promise<DualStoreReport> {
  const lastCheckedAt = new Date().toISOString();
  const json = readJsonStoreSnapshot();
  const supabase = await readSupabaseStoreSnapshot();
  const missingInSupabase = supabase.configured ? diffStoreIds(json.ids, supabase.ids) : emptyStoreIds();
  const extraInSupabase = supabase.configured ? diffStoreIds(supabase.ids, json.ids) : emptyStoreIds();
  const mismatches: DualStoreMismatches = {
    missingInSupabase,
    extraInSupabase,
    duplicates: {
      json: json.duplicates,
      supabase: supabase.duplicates,
    },
  };
  const warnings = [...json.warnings, ...supabase.warnings];
  const problems = [...json.problems, ...supabase.problems];
  const hasMismatch =
    hasAnyStoreIds(missingInSupabase) ||
    hasAnyStoreIds(extraInSupabase) ||
    hasAnyDuplicates(json.duplicates) ||
    hasAnyDuplicates(supabase.duplicates);

  if (getConfiguredPublishStoreMode() !== "json") {
    warnings.push("PUBLISH_DUE_STORE is not json. Production source must remain JSON in dual-read mode.");
  }

  if (!supabase.configured) {
    warnings.push("Supabase mirror is unavailable because DATABASE_URL is not configured.");
  }

  if (hasMismatch) {
    warnings.push("JSON source and Supabase mirror do not match by counts or IDs.");
  }

  const status = problems.length ? "error" : warnings.length || hasMismatch ? "warning" : "ok";

  return {
    status,
    productionStoreMode: "json",
    supabaseMirrorConfigured: supabase.configured,
    sourceOfTruth: "json",
    jsonCounts: json.counts,
    supabaseCounts: supabase.configured ? supabase.counts : emptyStoreCounts(),
    synced: supabase.configured && !hasMismatch && problems.length === 0,
    mismatches,
    warnings: Array.from(new Set(warnings)),
    problems: Array.from(new Set(problems)),
    lastCheckedAt,
    safeToSwitchToSupabase: false,
  };
}
