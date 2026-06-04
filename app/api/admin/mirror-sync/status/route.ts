import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  // @ts-ignore - Shared read-only Node utility is authored as ESM for CLI reuse.
  const { compareJsonSupabaseStore } = await import("../../../../../scripts/lib/store-compare.mjs");
  const compare = await compareJsonSupabaseStore({ loadEnv: true });
  const hasMissing = Object.values(compare.missingInSupabase).some((items: unknown) => Array.isArray(items) && items.length > 0);
  const hasExtra = Object.values(compare.extraInSupabase).some((items: unknown) => Array.isArray(items) && items.length > 0);

  return NextResponse.json({
    sourceOfTruth: "json",
    productionStoreMode: "json",
    supabaseMirrorConfigured: compare.supabaseConfigured,
    localCounts: compare.localCounts,
    supabaseCounts: compare.supabaseCounts,
    missingInSupabase: compare.missingInSupabase,
    extraInSupabase: compare.extraInSupabase,
    synced: compare.status === "ok" && !hasMissing && !hasExtra,
    safeToRunMirrorSync: compare.supabaseConfigured && compare.status !== "error",
    safeToSwitchToSupabase: false,
    lastCheckedAt: compare.checkedAt,
    warnings: compare.warnings,
    problems: compare.problems,
  }, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
