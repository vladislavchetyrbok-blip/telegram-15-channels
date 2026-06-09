import { NextResponse } from "next/server";
import { dryRunSendPublicationSchedule } from "@/lib/publication-schedule-store";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(_request: Request, { params }: RouteContext) {
  const result = dryRunSendPublicationSchedule(params.id);

  return NextResponse.json(
    {
      ok: result.ok,
      mode: "dry-run",
      dryRun: true,
      telegramSent: false,
      item: result.item,
      dryRunMessage: result.ok ? "Dry-run: сообщение не отправлено" : undefined,
      error: result.error,
    },
    { status: result.ok ? 200 : 404 },
  );
}
