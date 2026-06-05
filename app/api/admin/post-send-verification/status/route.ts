import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  const url = new URL(request.url);
  const postId = url.searchParams.get("postId") ?? undefined;
  const mode = url.searchParams.get("mode") ?? undefined;
  const expectedChannelId = url.searchParams.get("expectedChannelId") ?? undefined;
  const expectedPostIds = url.searchParams.get("expectedPostIds") ?? undefined;
  const maxExpectedPosts = url.searchParams.get("maxExpectedPosts") ?? undefined;
  const windowMinutes = url.searchParams.get("windowMinutes") ?? undefined;

  // @ts-ignore - Shared read-only Node utility is authored as ESM for CLI reuse.
  const { getPostSendVerificationReport } = await import("../../../../../scripts/lib/post-send-verification.mjs");
  const report = await getPostSendVerificationReport({
    postId,
    mode,
    expectedChannelId,
    expectedPostIds,
    maxExpectedPosts,
    windowMinutes,
  });

  return NextResponse.json(report, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
