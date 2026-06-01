import { NextResponse } from "next/server";
import { dryRunSendPostDraft } from "@/lib/post-draft-store";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(_request: Request, { params }: RouteContext) {
  const result = dryRunSendPostDraft(params.id);

  return NextResponse.json(
    {
      ok: result.ok,
      mode: "dry-run",
      dryRun: true,
      telegramSent: false,
      draft: result.draft,
      dryRunMessage: result.ok ? "Dry-run: сообщение не отправлено" : undefined,
      error: result.error,
    },
    { status: result.ok ? 200 : 404 },
  );
}
