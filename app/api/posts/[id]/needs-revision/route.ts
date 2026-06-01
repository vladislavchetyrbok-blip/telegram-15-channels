import { NextResponse } from "next/server";
import { markPostDraftNeedsRevision } from "@/lib/post-draft-store";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: RouteContext) {
  const body = await request.json().catch(() => ({})) as { notes?: string };
  const result = markPostDraftNeedsRevision(params.id, body.notes);

  return NextResponse.json(
    {
      ok: result.ok,
      dryRun: true,
      telegramSent: false,
      draft: result.draft,
      error: result.error,
    },
    { status: result.ok ? 200 : 404 },
  );
}
