import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  // @ts-ignore - Shared read-only Node utility is authored as ESM for CLI reuse.
  const { getPremiumVisualQualityReport } = await import("../../../../../scripts/lib/premium-visual-quality.mjs");
  const report = await getPremiumVisualQualityReport({ sampleLimit: 8 });

  return NextResponse.json(
    {
      status: report.status,
      summary: report.summary,
      samples: report.samples,
      weakVisuals: report.weakVisuals,
      regenerationQueuePreview: report.regenerationQueuePreview,
      issues: report.issues,
      recommendations: report.recommendations,
      profiles: report.profiles,
      visualModes: report.visualModes,
      qualityFlags: report.qualityFlags,
      productionStoreMode: report.productionStoreMode,
      sourceOfTruth: report.sourceOfTruth,
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
