import { NextResponse } from "next/server";
import { createPublicationScheduleFromDraft } from "@/lib/publication-schedule-store";

interface CreateScheduleFromDraftBody {
  draftId?: string;
  scheduledFor?: string;
  allowDuplicate?: boolean;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CreateScheduleFromDraftBody;

  if (!body.draftId) {
    return NextResponse.json(
      {
        ok: false,
        mode: "dry-run",
        telegramSent: false,
        error: "draftId is required",
      },
      { status: 400 },
    );
  }

  const result = createPublicationScheduleFromDraft({
    draftId: body.draftId,
    scheduledFor: body.scheduledFor,
    allowDuplicate: body.allowDuplicate,
  });

  return NextResponse.json(
    {
      ok: result.ok,
      mode: "dry-run",
      dryRun: true,
      telegramSent: false,
      item: result.item,
      error: result.error,
    },
    { status: result.ok ? 200 : 400 },
  );
}
