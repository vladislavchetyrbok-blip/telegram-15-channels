import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  const url = new URL(request.url);
  const channelId = url.searchParams.get("channelId") ?? undefined;

  // @ts-ignore - Shared read-only Node utility is authored as ESM for CLI reuse.
  const { getOneChannelTestQueueReport } = await import("../../../../../scripts/lib/one-channel-test-queue.mjs");
  const report = await getOneChannelTestQueueReport({ channelId });

  return NextResponse.json(
    {
      status: report.status,
      channelId: report.channelId,
      summary: report.summary,
      queue: report.queue,
      safeForControlledChannelTest: report.safeForControlledChannelTest,
      safeForBulkPublishing: false,
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
