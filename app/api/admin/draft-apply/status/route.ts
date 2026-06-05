import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  // @ts-ignore - Shared Node utility is authored as ESM for CLI reuse.
  const { getDraftApplyStatus } = await import("../../../../../scripts/lib/regeneration-drafts.mjs");
  const report = await getDraftApplyStatus();

  return NextResponse.json(
    {
      summary: report.summary,
      approvedNotApplied: report.approvedNotApplied,
      applied: report.applied,
      blocked: report.blocked,
      lastApplied: report.lastAppliedDrafts,
      pendingApprovedDrafts: report.pendingApprovedDrafts,
      appliedByChannel: report.appliedByChannel,
      latestBackup: report.latestBackup,
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
