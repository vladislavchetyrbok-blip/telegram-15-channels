import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  // @ts-ignore - Shared read-only Node utility is authored as ESM for CLI reuse.
  const { getFinalPublishPreviewReport } = await import("../../../../../scripts/lib/final-publish-preview.mjs");
  const report = await getFinalPublishPreviewReport();

  return NextResponse.json(
    {
      status: report.status,
      productionStoreMode: report.productionStoreMode,
      sourceOfTruth: report.sourceOfTruth,
      safeToSwitchToSupabase: report.safeToSwitchToSupabase,
      summary: report.summary,
      channelReadiness: report.channelReadiness,
      previewPosts: report.previewPosts,
      recommendedFirstTestPost: report.recommendedFirstTestPost,
      recommendedFirstTestChannel: report.recommendedFirstTestChannel,
      safeForManualOnePostTest: report.safeForManualOnePostTest,
      safeForBulkPublishing: false,
      whyNotBulkPublishing: report.whyNotBulkPublishing,
      requiredBeforePublishing: report.requiredBeforePublishing,
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
