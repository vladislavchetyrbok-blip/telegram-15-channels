import { NextResponse } from "next/server";
import { getEditableDraftStatuses, listPostDrafts } from "@/lib/post-draft-store";
import type { PostDraftStatus } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get("channelId") || undefined;
  const statusParam = searchParams.get("status") || undefined;
  const statuses = getEditableDraftStatuses();
  const status = statuses.includes(statusParam as PostDraftStatus)
    ? (statusParam as PostDraftStatus)
    : undefined;

  return NextResponse.json({
    ok: true,
    dryRun: true,
    telegramSent: false,
    drafts: listPostDrafts({ channelId, status }),
  });
}
