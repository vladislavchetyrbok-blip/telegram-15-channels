import { NextResponse } from "next/server";
import { validatePostDraft } from "@/lib/post-draft-store";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(_request: Request, { params }: RouteContext) {
  const result = validatePostDraft(params.id);

  return NextResponse.json(
    {
      ok: result.ok,
      mode: "dry-run",
      telegramSent: false,
      draft: result.draft,
      validation: result.validation,
      error: result.error,
    },
    { status: result.draft ? 200 : 404 },
  );
}
