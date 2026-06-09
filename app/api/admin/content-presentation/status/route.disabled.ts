import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  // @ts-ignore - Shared read-only Node utility is authored as ESM for CLI reuse.
  const { getContentPresentationReport } = await import("../../../../../scripts/lib/content-presentation.mjs");
  const report = await getContentPresentationReport();

  return NextResponse.json({
    status: report.status,
    summary: report.summary,
    samples: report.sampleImprovedPosts,
    issues: report.issues,
    recommendations: report.recommendations,
    richText: report.richText,
    lengthBuckets: report.lengthBuckets,
    contentTemplates: report.contentTemplates,
    visualModes: report.visualModes,
    channelProfiles: report.channelProfiles,
    lastCheckedAt: report.lastCheckedAt,
  }, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
