import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  // @ts-ignore - Shared read-only Node utility is authored as ESM for CLI reuse.
  const { getRegenerationDraftStatus } = await import("../../../../../scripts/lib/regeneration-drafts.mjs");
  const report = await getRegenerationDraftStatus();

  return NextResponse.json(
    {
      summary: report.summary,
      drafts: report.drafts,
      draftsByChannel: report.draftsByChannel,
      draftsByType: report.draftsByType,
      warnings: report.warnings,
      errors: report.errors,
      lastCheckedAt: report.lastCheckedAt,
    },
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    },
  );
}
