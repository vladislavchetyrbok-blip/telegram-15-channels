import { NextResponse } from "next/server";
import {
  getDraftReviewCounters,
  getEditableDraftStatuses,
  listDraftReviewHistory,
  listDraftsForReview,
} from "@/lib/post-draft-store";
import type { PostDraftLanguage, PostDraftStatus } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get("channelId") || undefined;
  const statusParam = searchParams.get("status") || undefined;
  const languageParam = searchParams.get("language") || undefined;
  const statuses = getEditableDraftStatuses();
  const status = statuses.includes(statusParam as PostDraftStatus)
    ? (statusParam as PostDraftStatus)
    : undefined;
  const language = ["ru", "uk"].includes(languageParam ?? "")
    ? (languageParam as PostDraftLanguage)
    : undefined;

  return NextResponse.json({
    ok: true,
    mode: "dry-run",
    dryRun: true,
    telegramSent: false,
    counters: getDraftReviewCounters(),
    items: listDraftsForReview({ channelId, status, language }),
    history: listDraftReviewHistory(),
  });
}
