import { NextResponse } from "next/server";
import { createPostDraftFromChannel } from "@/lib/post-draft-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { channelId?: string };

    if (!body.channelId) {
      return NextResponse.json(
        {
          ok: false,
          dryRun: true,
          telegramSent: false,
          error: "channelId is required",
        },
        { status: 400 },
      );
    }

    const result = await createPostDraftFromChannel(body.channelId);

    return NextResponse.json(
      {
        ok: result.ok,
        dryRun: true,
        telegramSent: false,
        draft: result.draft,
        error: result.error,
      },
      { status: result.draft ? 200 : 400 },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        dryRun: true,
        telegramSent: false,
        error: "Invalid request body",
      },
      { status: 400 },
    );
  }
}
