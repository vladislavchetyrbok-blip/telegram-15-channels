import { NextResponse } from "next/server";
import { generateFirstDraftsForAllChannels } from "@/lib/post-draft-store";

export const dynamic = "force-dynamic";

export async function POST() {
  const result = await generateFirstDraftsForAllChannels();

  return NextResponse.json(
    {
      ok: result.ok,
      mode: result.mode,
      dryRun: true,
      telegramSent: result.telegramSent,
      realSendsTotal: result.realSendsTotal,
      repeatLock: result.repeatLock,
      createdCount: result.createdDrafts.length,
      drafts: result.createdDrafts,
      results: result.results,
      error: result.error,
    },
    { status: result.error ? 409 : 200 },
  );
}
