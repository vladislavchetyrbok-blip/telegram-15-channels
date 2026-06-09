import { NextResponse } from "next/server";
import { runPublicationReadinessTest } from "@/lib/publication-readiness";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { channelId?: string };

  if (!body.channelId) {
    return NextResponse.json(
      {
        ok: false,
        mode: "dry-run",
        telegramSent: false,
        error: "channelId is required.",
      },
      { status: 400 },
    );
  }

  const result = runPublicationReadinessTest(body.channelId);

  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
