import { NextResponse } from "next/server";
import { rejectPostDraft } from "@/lib/post-draft-store";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(_request: Request, { params }: RouteContext) {
  const result = rejectPostDraft(params.id);

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
