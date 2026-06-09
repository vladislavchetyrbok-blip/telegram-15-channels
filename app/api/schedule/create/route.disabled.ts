import { NextResponse } from "next/server";
import { createPublicationSchedule } from "@/lib/publication-schedule-store";

interface CreateScheduleBody {
  draftId?: string;
  scheduledFor?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CreateScheduleBody;

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

  const result = createPublicationSchedule({
    draftId: body.draftId,
    scheduledFor: body.scheduledFor,
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
